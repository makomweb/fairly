import { useState } from 'react'
import { Menu, X, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onMenuToggle?: (open: boolean) => void
  userEmail?: string
  onLogout?: () => void
  isMobileMenuOpen?: boolean
  onSettingsClick?: () => void
}

export function Header({ 
  onMenuToggle, 
  userEmail,
  onLogout,
  isMobileMenuOpen = false,
  onSettingsClick,
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card backdrop-blur supports-[backdrop-filter]:bg-card/95">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onMenuToggle?.(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-lg">$</span>
            </div>
            <h1 className="text-lg font-bold text-foreground hidden sm:inline">
              Fairly
            </h1>
          </div>
        </div>

        {/* Right: User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-sm truncate max-w-xs"
            title={userEmail}
          >
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-semibold text-xs">
                {userEmail?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="hidden sm:inline text-foreground truncate">
              {userEmail?.split('@')[0] || 'User'}
            </span>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-foreground truncate">
                  {userEmail}
                </p>
              </div>
              <button
                onClick={() => {
                  onSettingsClick?.()
                  setShowUserMenu(false)
                }}
                className="w-full px-4 py-2 text-sm text-left hover:bg-muted text-foreground font-medium flex items-center gap-2 rounded-none first:rounded-t-[calc(var(--radius)-2px)]"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button
                onClick={() => {
                  onLogout?.()
                  setShowUserMenu(false)
                }}
                className="w-full px-4 py-2 text-sm text-left hover:bg-muted text-destructive font-medium flex items-center gap-2 rounded-none last:rounded-b-[calc(var(--radius)-2px)]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
