import React from 'react'
import { cn } from '@/lib/utils'

interface AppShellProps {
  header?: React.ReactNode
  sidebar?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  sidebarCollapsible?: boolean
}

export function AppShell({
  header,
  sidebar,
  children,
  footer,
  sidebarCollapsible = false,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(!sidebarCollapsible)

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      {header && (
        <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {header}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <aside
            className={cn(
              'border-r bg-muted/40 transition-all duration-300 overflow-hidden',
              sidebarOpen ? 'w-64' : 'w-0'
            )}
          >
            <div className="h-full overflow-y-auto">{sidebar}</div>
          </aside>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">{children}</div>
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <div className="border-t bg-muted/40">
          {footer}
        </div>
      )}
    </div>
  )
}
