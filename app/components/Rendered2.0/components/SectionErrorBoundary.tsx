/**
 * Section-aware Error Boundary
 * Provides context-specific error handling and recovery options
 */

import React, { Component, ReactNode } from 'react';
import { logger } from '../../../utils/logger';

interface Props {
  children: ReactNode;
  sectionName?: string;
  fallbackComponent?: React.ComponentType<ErrorBoundaryProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  enableRecovery?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

export interface ErrorBoundaryProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  sectionName?: string;
  onRetry?: () => void;
  onReset?: () => void;
  retryCount: number;
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<ErrorBoundaryProps> = ({
  error,
  sectionName,
  onRetry,
  onReset,
  retryCount
}) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
    <div className="flex items-center mb-4">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">
          {sectionName ? `${sectionName} Error` : 'Section Error'}
        </h3>
        <div className="mt-2 text-sm text-red-700">
          <p>Something went wrong while rendering this section.</p>
          {error && (
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">Technical Details</summary>
              <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
    
    <div className="flex space-x-3">
      {onRetry && retryCount < 3 && (
        <button
          onClick={onRetry}
          className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 text-sm rounded border border-red-300"
        >
          Retry {retryCount > 0 && `(${retryCount}/3)`}
        </button>
      )}
      {onReset && (
        <button
          onClick={onReset}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 text-sm rounded border border-gray-300"
        >
          Reset Section
        </button>
      )}
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 text-sm rounded border border-blue-300"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

export class SectionErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;
  
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with section context
    logger.error(`Section Error: ${this.props.sectionName || 'Unknown'}`, {
      component: 'SectionErrorBoundary',
      action: 'error_caught',
      metadata: {
        sectionName: this.props.sectionName,
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount
      }
    });

    this.setState({ errorInfo });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= 3) {
      logger.warn('Maximum retry attempts reached', {
        component: 'SectionErrorBoundary',
        sectionName: this.props.sectionName
      });
      return;
    }

    logger.info(`Attempting retry ${retryCount + 1}`, {
      component: 'SectionErrorBoundary',
      sectionName: this.props.sectionName
    });

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1
    });
  };

  handleReset = () => {
    logger.info('Resetting section state', {
      component: 'SectionErrorBoundary',
      sectionName: this.props.sectionName
    });

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, fallbackComponent: FallbackComponent, enableRecovery = true } = this.props;

    if (hasError) {
      const errorProps: ErrorBoundaryProps = {
        error,
        errorInfo,
        sectionName: this.props.sectionName,
        onRetry: enableRecovery ? this.handleRetry : undefined,
        onReset: enableRecovery ? this.handleReset : undefined,
        retryCount
      };

      if (FallbackComponent) {
        return <FallbackComponent {...errorProps} />;
      }

      return <DefaultErrorFallback {...errorProps} />;
    }

    return children;
  }
}

/**
 * Higher-order component for adding error boundaries to sections
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  sectionName: string,
  options?: {
    fallbackComponent?: React.ComponentType<ErrorBoundaryProps>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    enableRecovery?: boolean;
  }
) {
  const WrappedComponent: React.FC<P> = (props) => (
    <SectionErrorBoundary
      sectionName={sectionName}
      fallbackComponent={options?.fallbackComponent}
      onError={options?.onError}
      enableRecovery={options?.enableRecovery}
    >
      <Component {...props} />
    </SectionErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default SectionErrorBoundary;