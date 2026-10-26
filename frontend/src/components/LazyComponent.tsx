import { Suspense, lazy, ComponentType } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface LazyComponentProps {
  component: Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  [key: string]: any
}

/**
 * Wrapper für Code Splitting mit automatischem Loading State
 * Usage: <LazyComponent component={import('@/pages/ExpensePage')} />
 */
export function LazyComponent({
  component,
  fallback,
  ...props
}: LazyComponentProps) {
  const Component = lazy(() => component)

  return (
    <Suspense fallback={fallback || <LoadingSpinner fullScreen label="Loading..." />}>
      <Component {...props} />
    </Suspense>
  )
}
