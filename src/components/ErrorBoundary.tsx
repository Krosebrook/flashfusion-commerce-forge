import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '@/lib/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('React Error Boundary caught error:', error, errorInfo);
    }

    // Log to server
    logError({
      errorType: 'unhandled_error',
      errorCode: 'REACT_ERROR_BOUNDARY',
      path: window.location.pathname,
      message: error.message,
      metadata: {
        componentStack: errorInfo.componentStack,
        errorStack: error.stack,
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Oops!</h1>
            <p className="text-xl text-muted-foreground mb-4">
              Something went wrong. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
