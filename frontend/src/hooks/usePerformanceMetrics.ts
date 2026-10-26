import { useEffect } from 'react'

interface PerformanceMetrics {
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
}

/**
 * Hook zur Messung und Logging von Web Vitals
 * Nutzt PerformanceObserver API
 */
export function usePerformanceMetrics(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const metrics: PerformanceMetrics = {}

    // Measure First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        // Paint Timing
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = Math.round(entry.startTime)
              console.debug(`[Performance] FCP: ${metrics.fcp}ms`)
            }
          }
        })
        paintObserver.observe({ entryTypes: ['paint'] })

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          metrics.lcp = Math.round(lastEntry.renderTime || lastEntry.loadTime)
          console.debug(`[Performance] LCP: ${metrics.lcp}ms`)
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // Cumulative Layout Shift
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
              metrics.cls = parseFloat(clsValue.toFixed(3))
            }
          }
          console.debug(`[Performance] CLS: ${metrics.cls}`)
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        return () => {
          paintObserver.disconnect()
          lcpObserver.disconnect()
          clsObserver.disconnect()
        }
      } catch (e) {
        console.error('Performance monitoring error:', e)
      }
    }

    // Navigation Timing
    window.addEventListener('load', () => {
      const perfData = window.performance.timing
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
      metrics.ttfb = perfData.responseStart - perfData.navigationStart

      console.debug(`[Performance] Page Load Time: ${pageLoadTime}ms`)
      console.debug(`[Performance] TTFB: ${metrics.ttfb}ms`)
    })
  }, [enabled])
}

/**
 * Hook zum Messen von Component Render Times
 */
export function useRenderMetrics(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      if (renderTime > 16.67) { // Slower than 60fps
        console.warn(`[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`)
      }
    }
  }, [componentName])
}
