import { cn } from '@/lib/utils'

interface ResponsiveGridProps {
  children: React.ReactNode
  columns?: 'auto' | 1 | 2 | 3 | 4 | 6
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const gapMap = {
  sm: 'gap-2 md:gap-3',
  md: 'gap-3 md:gap-4',
  lg: 'gap-4 md:gap-6',
  xl: 'gap-6 md:gap-8',
}

const columnMap = {
  auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
}

export function ResponsiveGrid({
  children,
  columns = 'auto',
  gap = 'md',
  className,
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        'grid',
        columnMap[columns],
        gapMap[gap],
        className
      )}
    >
      {children}
    </div>
  )
}
