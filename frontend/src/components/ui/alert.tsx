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
    container: 'bg-background border border-border text-foreground',
    icon: 'text-primary',
  },
  destructive: {
    container: 'bg-destructive/10 border border-destructive/20 text-destructive',
    icon: 'text-destructive',
  },
  success: {
    container: 'bg-accent/10 border border-accent/20 text-accent',
    icon: 'text-accent',
  },
  warning: {
    container: 'bg-foreground/5 border border-foreground/10 text-foreground',
    icon: 'text-foreground',
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
