import './index.css'
import { useState, useRef } from 'react'
import { AuthProvider, useAuth } from './features/auth/AuthContext'
import { TrackExpense } from './features/expense/TrackExpense'
import { Calculation } from './features/calculation/Calculation'
import { Button } from './components/ui/button'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { ErrorBoundary } from './components/ErrorBoundary'
import { usePerformanceMetrics } from './hooks/usePerformanceMetrics'
import { HeartHandshake, Loader, Menu, X } from 'lucide-react'

function AppContent() {
  const { user, logout, isLoading } = useAuth()
  const [currentTab, setCurrentTab] = useState('track')
  const [showTrackForm, setShowTrackForm] = useState(true)
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUserSelected, setHasUserSelected] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const trackFormRef = useRef<{ submit: () => Promise<void> }>(null)

  // Monitor Core Web Vitals in development
  usePerformanceMetrics(process.env.NODE_ENV === 'development')

  if (isLoading) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // If no user, AuthContext will have already redirected to /login
  if (!user) {
    return null
  }

  return (
    <div className="min-h-svh flex flex-col pb-safe">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md dark:from-blue-800 dark:to-indigo-800">
        <div className="px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 min-w-0">
            <HeartHandshake className="h-5 sm:h-6 w-5 sm:w-6 text-white flex-shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">Split Fairly</h1>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeSwitcher />
            <div className="text-white text-xs sm:text-sm truncate max-w-xs">
              {user.email.length > 16 ? user.email.substring(0, 16) + '...' : user.email}
            </div>
            <Button 
              onClick={() => logout()}
              variant="secondary" 
              size="sm"
            >
              Logout
            </Button>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-blue-700 dark:bg-blue-900 px-4 py-3 flex flex-col gap-3">
            <div className="text-white text-sm truncate">
              {user.email}
            </div>
            <Button 
              onClick={() => {
                logout()
                setMobileMenuOpen(false)
              }}
              variant="secondary" 
              size="sm"
              className="w-full"
            >
              Logout
            </Button>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <div className="flex-1 w-full overflow-y-auto">
        <div className="mx-auto w-full">
          {currentTab === 'calculate' && (
            <Calculation onUserSelected={setHasUserSelected} />
          )}
          {currentTab === 'track' && !showTrackForm && (
            <div className="w-full px-4 py-6 md:p-6 flex items-center justify-center min-h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-sm md:text-base">Use the "+ Track" button to add a new expense</p>
              </div>
            </div>
          )}
          {showTrackForm && (
            <TrackExpense 
              ref={trackFormRef}
              onComplete={() => setShowTrackForm(false)}
              onValidityChange={setIsFormValid}
              onLoadingChange={setIsSubmitting}
            />
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white dark:bg-slate-950 shadow-lg dark:shadow-slate-900 dark:border-slate-700 pb-safe">
        <div className="px-3 sm:px-4 h-16 flex items-center justify-between gap-2 sm:gap-3">
          <button
            onClick={() => {
              if (showTrackForm && isFormValid && !isSubmitting) {
                trackFormRef.current?.submit()
              } else {
                setShowTrackForm(true)
                setCurrentTab('track')
                setTimeout(() => {
                  trackFormRef.current?.focus?.()
                }, 0)
              }
            }}
            className={`flex-1 h-12 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm ${
              showTrackForm
                ? isFormValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  : 'bg-blue-200 text-blue-600 cursor-default opacity-75'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <span className="hidden sm:inline">{showTrackForm ? (isSubmitting ? 'Saving...' : '➕ Track') : '➕ Track'}</span>
            <span className="sm:hidden">{showTrackForm ? (isSubmitting ? '💾' : '➕') : '➕'}</span>
          </button>
          
          <button
            onClick={() => {
              setCurrentTab('calculate')
              setShowTrackForm(false)
            }}
            className={`flex-1 h-12 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm ${
              currentTab === 'calculate'
                ? hasUserSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-200 text-blue-600 opacity-75'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <span className="hidden sm:inline">📊 Calculate</span>
            <span className="sm:hidden">📊</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  )
}
