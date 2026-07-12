import { useEffect } from 'react'

/**
 * Hook zum Managen von Fokus & Keyboard Navigation
 */
export function useAccessibility() {
  useEffect(() => {
    // Skip to main content on Tab
    const skipLink = document.querySelector('[data-skip-to-main]') as HTMLAnchorElement
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault()
        const main = document.querySelector('main')
        if (main) {
          main.focus()
          main.scrollIntoView({ behavior: 'smooth' })
        }
      })
    }

    // Close modals/dropdowns on Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const openDialogs = document.querySelectorAll('[role="dialog"][open]')
        openDialogs.forEach((dialog) => {
          (dialog as HTMLDialogElement).close?.()
        })
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])
}

/**
 * Utility zum Generieren von Screen-Reader only Text
 */
export function screenReaderOnly(text: string): string {
  return text
}

/**
 * Hook zum Managen von Reduced Motion Präferenz
 */
export function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Aria-Labels für häufige Interaktionen
 */
export const a11yLabels = {
  close: 'Close',
  menu: 'Open menu',
  search: 'Search',
  loading: 'Loading',
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
  back: 'Go back',
  next: 'Go to next page',
  previous: 'Go to previous page',
} as const

/**
 * Helper zur Struktur von Aria-Descriptions
 */
export function createAriaDescription(
  title: string,
  description?: string,
  additionalInfo?: string
): string {
  const parts = [title, description, additionalInfo].filter(Boolean)
  return parts.join('. ')
}
