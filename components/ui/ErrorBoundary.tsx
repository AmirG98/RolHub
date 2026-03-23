'use client'

import React, { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen particle-bg flex items-center justify-center p-8">
          <div className="glass-panel-dark rounded-lg p-8 max-w-lg text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="font-title text-2xl text-gold mb-4">
              Algo salió mal
            </h1>
            <p className="font-body text-parchment/80 mb-4">
              Las fuerzas del destino vacilan... Intenta recargar la página.
            </p>
            <p className="font-mono text-xs text-parchment/40 mb-6 break-all">
              {this.state.error?.message || 'Error desconocido'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gold/20 border border-gold rounded-lg font-heading text-gold hover:bg-gold/30 transition-all"
            >
              Recargar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
