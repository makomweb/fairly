import React, { ReactNode } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset)
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Alert
              variant="destructive"
              title="Something went wrong"
              description={process.env.NODE_ENV === 'development' ? this.state.error.message : 'Please try again later'}
            />
            <div className="mt-4 flex gap-2">
              <Button onClick={this.handleReset} className="flex-1">
                Try again
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="outline"
                className="flex-1"
              >
                Go home
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
