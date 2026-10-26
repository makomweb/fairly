import { getApiUrl } from './config'

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

class ResponseCache {
  private cache = new Map<string, CacheEntry>()

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  clear(): void {
    this.cache.clear()
  }
}

const cache = new ResponseCache()

export interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  cacheTtl?: number
  bypassCache?: boolean
}

/**
 * Optimized API Client with built-in caching
 * Features:
 * - Response caching with TTL
 * - Error handling
 * - Automatic JSON serialization
 * - Authorization token support
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    cacheTtl = 5 * 60 * 1000, // 5 minutes default
    bypassCache = false,
  } = options

  const url = getApiUrl(endpoint)
  const cacheKey = `${method}:${url}`

  // Check cache for GET requests
  if (method === 'GET' && !bypassCache) {
    const cached = cache.get(cacheKey)
    if (cached) {
      console.debug(`[API] Cache hit: ${endpoint}`)
      return cached
    }
  }

  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  // Add auth token if available
  const token = localStorage.getItem('auth_token')
  if (token) {
    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  if (body) {
    init.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, init)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `API Error: ${response.status}`)
    }

    const data: T = await response.json()

    // Cache successful GET responses
    if (method === 'GET') {
      cache.set(cacheKey, data, cacheTtl)
    }

    return data
  } catch (error) {
    console.error(`[API] Error: ${endpoint}`, error)
    throw error
  }
}

/**
 * Clear the response cache
 */
export function clearApiCache(): void {
  cache.clear()
}

/**
 * Pre-fetch an endpoint to populate cache
 */
export async function prefetchApi<T = any>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<void> {
  try {
    await apiRequest<T>(endpoint, { ...options, method: 'GET' })
  } catch (error) {
    console.warn(`[API] Prefetch failed for ${endpoint}:`, error)
  }
}
