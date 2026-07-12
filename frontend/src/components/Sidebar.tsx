import { BarChart3, Plus, Settings, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}

interface SidebarProps {
  isOpen: boolean
  onNavigate?: (id: string) => void
  activeTab?: string
  onClose?: () => void
}

export function Sidebar({ 
  isOpen, 
  onNavigate,
  activeTab = 'track',
  onClose
}: SidebarProps) {
  const navItems: NavItem[] = [
    {
      id: 'track',
      icon: <Plus className="h-5 w-5" />,
      label: 'Track Expense',
      isActive: activeTab === 'track',
      onClick: () => {
        onNavigate?.('track')
        onClose?.()
      },
    },
    {
      id: 'calculate',
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Calculate',
      isActive: activeTab === 'calculate',
      onClick: () => {
        onNavigate?.('calculate')
        onClose?.()
      },
    },
  ]

  return (
    <>
      {/* Overlay (Mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm md:hidden z-30"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] md:top-16 md:h-[calc(100vh-4rem)] w-64 bg-card border-r border-border overflow-y-auto transition-transform duration-300 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors',
                item.isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          {/* Divider */}
          <div className="my-4 border-t border-border" />

          {/* Future Items */}
          <div className="opacity-50 space-y-2">
            <button
              disabled
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-foreground hover:bg-muted cursor-not-allowed"
            >
              <Zap className="h-5 w-5" />
              <span>Statistics</span>
            </button>
            <button
              disabled
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-foreground hover:bg-muted cursor-not-allowed"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  )
}
