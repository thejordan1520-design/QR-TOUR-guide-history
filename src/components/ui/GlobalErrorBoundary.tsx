import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generar ID único para el error
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.error('🚨 GlobalErrorBoundary capturó un error:', error);
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 GlobalErrorBoundary - Error capturado:', error);
    console.error('🚨 GlobalErrorBoundary - Error Info:', errorInfo);
    
    // Llamar callback personalizado si existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log del error para debugging
    this.logError(error, errorInfo);

    this.setState({
      errorInfo
    });
  }

  private logError = (error: Error, errorInfo: React.ErrorInfo) => {
    const errorLog = {
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.retryCount,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Guardar en localStorage para debugging
    try {
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(errorLog);
      // Mantener solo los últimos 10 errores
      const recentLogs = existingLogs.slice(-10);
      localStorage.setItem('errorLogs', JSON.stringify(recentLogs));
    } catch (e) {
      console.warn('No se pudo guardar el error en localStorage:', e);
    }

    console.error('📝 Error log guardado:', errorLog);
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`🔄 Reintentando carga (${this.retryCount}/${this.maxRetries})...`);
      
      // Resetear estado para reintentar
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      });
    } else {
      console.error('❌ Máximo de reintentos alcanzado');
      // Forzar recarga completa de la página
      window.location.reload();
    }
  };

  private handleReload = () => {
    console.log('🔄 Recargando página completa...');
    window.location.reload();
  };

  private handleClearCache = () => {
    try {
      // Limpiar localStorage
      const keysToKeep = ['language', 'theme'];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      // Limpiar sessionStorage
      sessionStorage.clear();

      console.log('🧹 Cache limpiado, recargando...');
      window.location.reload();
    } catch (error) {
      console.error('Error limpiando cache:', error);
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Error UI por defecto
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                ¡Ups! Algo salió mal
              </h2>
              
              <p className="text-sm text-gray-600 mb-4">
                La aplicación encontró un error inesperado. Esto puede ser temporal.
              </p>

              {this.state.error && (
                <div className="bg-gray-100 rounded p-3 mb-4 text-left">
                  <p className="text-xs text-gray-500 mb-1">Error ID: {this.state.errorId}</p>
                  <p className="text-xs text-gray-700 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {this.retryCount < this.maxRetries && (
                  <button
                    onClick={this.handleRetry}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Reintentar ({this.maxRetries - this.retryCount} intentos restantes)
                  </button>
                )}
                
                <button
                  onClick={this.handleReload}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Recargar Página
                </button>
                
                <button
                  onClick={this.handleClearCache}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Limpiar Cache y Recargar
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Si el problema persiste, contacta al administrador del sistema.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;

