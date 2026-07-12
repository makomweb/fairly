import { Check, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlertProps {
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
}

const variantStyles = {
  default: {
    container: 'bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-50 border border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  destructive: {
    container: 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-50 border border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
  },
  success: {
    container: 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-50 border border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
  },
  warning: {
    container: 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-50 border border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
  },
}

const iconMap = {
  default: Info,
  destructive: AlertCircle,
  success: Check,
  warning: AlertTriangle,
}

export function Alert({
  variant = 'default',
  title,
  description,
  children,
  className,
}: AlertProps) {
  const styles = variantStyles[variant]
  const Icon = iconMap[variant]

  return (
    <div className={cn('rounded-lg p-4 flex gap-4', styles.container, className)}>
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', styles.icon)} />
      <div className="flex-1">
        {title && <h3 className="font-semibold mb-1">{title}</h3>}
        {description && <p className="text-sm opacity-90">{description}</p>}
        {children}
      </div>
    </div>
  )
}
