import { X } from 'lucide-react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { cn } from '@/lib/utils'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-label="Close settings"
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] md:w-96 bg-card border border-border rounded-lg shadow-lg z-50 overflow-y-auto max-h-[90vh] animate-in fade-in duration-300">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Theme Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Appearance
            </h3>
            <div className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Theme</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose your preferred color scheme
                  </p>
                </div>
                <ThemeSwitcher />
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              About
            </h3>
            <div className="text-sm text-muted-foreground space-y-2 p-4 rounded-lg bg-muted/30">
              <p><strong>Fairly</strong> v1.0.0</p>
              <p>Fairly split expenses with friends and manage settlements.</p>
              <p className="text-xs mt-4 pt-4 border-t border-border">
                All data is stored securely on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
