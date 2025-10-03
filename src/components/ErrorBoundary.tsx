import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onNavigateHome?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught in ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-cream flex items-center justify-center relative">
          {/* Background Image with Overlay */}
          <div className="fixed inset-0 z-0">
            <img 
              src="/topglobe copy.jpg" 
              alt="Werte•Kreis Background" 
              className="w-full h-full object-cover object-center"
              style={{ 
                imageRendering: 'crisp-edges',
                filter: 'contrast(1.1) brightness(1.05) saturate(1.1)',
                transform: 'scale(1.1)',
                transformOrigin: 'center center'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-akaroa-100/60 via-akaroa-200/60 to-akaroa-300/70"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-rhino/8 via-transparent to-walnut/12"></div>
          </div>

          <div className="relative z-10 text-center space-y-6 max-w-md mx-auto px-4">
            <div className="bg-cream/70 backdrop-blur-[15px] rounded-xl p-8 shadow-glass-card border border-sandstone-300/50">
              <div className="w-16 h-16 bg-gradient-to-br from-error-500 to-error-700 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                <AlertTriangle size={24} className="text-white" />
              </div>
              
              <h2 className="text-xl font-semibold font-logo text-rhino mb-2">
                Etwas ist schiefgelaufen
              </h2>
              <p className="text-walnut text-sm mb-6 leading-relaxed">
                Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut oder lade die Seite neu.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="w-full bg-rhino/70 backdrop-blur-[8px] text-white py-3 px-6 rounded-lg font-medium shadow-glass-button hover:shadow-glass-button-hover transition-all duration-200 flex items-center justify-center space-x-2 border border-rhino-700/50"
                >
                  <RefreshCw size={18} />
                  <span>Seite neu laden</span>
                </button>
                
                <button
                  onClick={this.handleReset}
                  className="w-full bg-desert/10 text-desert py-2 px-4 rounded-lg font-medium hover:bg-desert/20 transition-colors duration-200"
                >
                  Erneut versuchen
                </button>
                
                {this.props.onNavigateHome && (
                  <button
                    onClick={this.props.onNavigateHome}
                    className="w-full bg-walnut/10 text-walnut py-2 px-4 rounded-lg font-medium hover:bg-walnut/20 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Home size={16} />
                    <span>Zur Startseite</span>
                  </button>
                )}
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-xs text-walnut cursor-pointer">Technische Details</summary>
                  <pre className="text-xs text-error-600 mt-2 bg-error-50 p-2 rounded overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;