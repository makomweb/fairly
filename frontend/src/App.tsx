import './index.css'
import { useState, useRef } from 'react'
import { AuthProvider, useAuth } from './features/auth/AuthContext'
import { TrackExpense } from './features/expense/TrackExpense'
import { Calculation } from './features/calculation/Calculation'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ToastProvider } from './components/ToastProvider'
import { LoadingSpinner } from './components/LoadingSpinner'
import { usePerformanceMetrics } from './hooks/usePerformanceMetrics'

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner message="Loading..." />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <Header
        onMenuToggle={setMobileMenuOpen}
        userEmail={user.email}
        onLogout={logout}
        isMobileMenuOpen={mobileMenuOpen}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={mobileMenuOpen}
          activeTab={currentTab}
          onNavigate={(tab) => {
            setCurrentTab(tab)
            setShowTrackForm(tab === 'track')
            setMobileMenuOpen(false)
          }}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full h-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
            {/* Content Area */}
            <div className="h-full animate-in fade-in duration-300">
              {currentTab === 'calculate' && (
                <Calculation onUserSelected={setHasUserSelected} />
              )}
              
              {currentTab === 'track' && showTrackForm && (
                <TrackExpense 
                  ref={trackFormRef}
                  onComplete={() => setShowTrackForm(false)}
                  onValidityChange={setIsFormValid}
                  onLoadingChange={setIsSubmitting}
                />
              )}

              {currentTab === 'track' && !showTrackForm && (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center animate-in fade-in">
                  <div className="space-y-4">
                    <div className="text-5xl">✨</div>
                    <p className="text-lg font-medium text-foreground">No expenses yet</p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Start by adding your first expense
                    </p>
                    <button
                      onClick={() => setShowTrackForm(true)}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all active:scale-95"
                    >
                      Add Expense
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (< md breakpoint) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card">
        <div className="flex items-center justify-around h-16">
          <button
            onClick={() => {
              setCurrentTab('track')
              setShowTrackForm(true)
              setMobileMenuOpen(false)
            }}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 text-xs font-medium transition-colors ${
              currentTab === 'track'
                ? 'text-primary bg-muted/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="text-lg">➕</span>
            <span>Track</span>
          </button>
          
          <button
            onClick={() => {
              setCurrentTab('calculate')
              setShowTrackForm(false)
              setMobileMenuOpen(false)
            }}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 text-xs font-medium transition-colors ${
              currentTab === 'calculate'
                ? 'text-primary bg-muted/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="text-lg">📊</span>
            <span>Calculate</span>
          </button>
        </div>
      </nav>

      {/* Padding for mobile bottom nav */}
      <div className="md:hidden h-16 pointer-events-none" />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
