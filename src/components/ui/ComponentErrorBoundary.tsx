import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(`⚠️ Error en componente ${this.props.componentName || 'desconocido'} (no crítico):`, error);
    
    // Llamar callback de error si existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Error en {this.props.componentName || 'componente'}
              </h3>
              <p className="text-xs text-red-600 mt-1">
                Este componente no se pudo cargar correctamente.
              </p>
            </div>
          </div>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-3">
              <summary className="cursor-pointer text-xs text-red-600 hover:text-red-800">
                ► Detalles del error (desarrollo)
              </summary>
              <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono text-red-700 overflow-auto">
                <div className="mb-1">
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                {this.state.errorInfo && (
                  <div>
                    <strong>Componente:</strong> {this.props.componentName || 'Desconocido'}
                  </div>
                )}
              </div>
            </details>
          )}

          <button
            onClick={this.handleRetry}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ComponentErrorBoundary;

