import React, { ReactNode, useMemo } from 'react';

/**
 * Provider configuration interface
 */
export interface ProviderConfig {
  provider: React.ComponentType<any>;
  props?: Record<string, any>;
}

/**
 * Compose multiple providers without nesting hell
 * Uses a more efficient composition pattern
 */
export const ProviderComposer: React.FC<{
  providers: ProviderConfig[];
  children: ReactNode;
}> = ({ providers, children }) => {
  // Memoize the provider tree to prevent unnecessary re-renders
  const composedProviders = useMemo(
    () =>
      providers.reduceRight<ReactNode>(
        (acc, { provider: Provider, props = {} }) => (
          <Provider {...props}>{acc}</Provider>
        ),
        children
      ),
    [providers, children]
  );

  return <>{composedProviders}</>;
};

/**
 * Alternative: Use React Context Selector pattern for performance
 * This allows consuming only specific parts of context without re-rendering
 */
export function createSelectableContext<T>() {
  const Context = React.createContext<T | undefined>(undefined);
  
  // Selector hook that only re-renders when selected value changes
  function useContextSelector<R>(selector: (value: T) => R): R {
    const context = React.useContext(Context);
    if (context === undefined) {
      throw new Error('useContextSelector must be used within Provider');
    }
    
    // Use useMemo to only re-compute when context changes
    const selectedValue = useMemo(
      () => selector(context),
      [context, selector]
    );
    
    return selectedValue;
  }
  
  return {
    Provider: Context.Provider,
    useContext: () => {
      const context = React.useContext(Context);
      if (context === undefined) {
        throw new Error('useContext must be used within Provider');
      }
      return context;
    },
    useContextSelector,
  };
}

/**
 * Lazy provider loading for code splitting
 */
export const LazyProvider: React.FC<{
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  props?: Record<string, any>;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ loader, props = {}, children, fallback = null }) => {
  const LazyComponent = React.lazy(loader);
  
  return (
    <React.Suspense fallback={fallback}>
      <LazyComponent {...props}>{children}</LazyComponent>
    </React.Suspense>
  );
};

/**
 * Provider registry for dynamic provider management
 */
export class ProviderRegistry {
  private providers: Map<string, ProviderConfig> = new Map();
  private loadOrder: string[] = [];

  register(id: string, config: ProviderConfig, order?: number) {
    this.providers.set(id, config);
    
    if (order !== undefined) {
      this.loadOrder[order] = id;
    } else {
      this.loadOrder.push(id);
    }
  }

  unregister(id: string) {
    this.providers.delete(id);
    this.loadOrder = this.loadOrder.filter(item => item !== id);
  }

  getProviders(): ProviderConfig[] {
    return this.loadOrder
      .filter(id => this.providers.has(id))
      .map(id => this.providers.get(id)!);
  }

  clear() {
    this.providers.clear();
    this.loadOrder = [];
  }
}

/**
 * Hook for using the provider registry
 */
export const useProviderRegistry = () => {
  const [registry] = React.useState(() => new ProviderRegistry());
  
  React.useEffect(() => {
    return () => {
      registry.clear();
    };
  }, [registry]);
  
  return registry;
};

/**
 * Performance monitoring wrapper for providers
 */
export const MonitoredProvider: React.FC<{
  name: string;
  provider: React.ComponentType<any>;
  props?: Record<string, any>;
  children: ReactNode;
  onRenderTime?: (name: string, time: number) => void;
}> = ({ name, provider: Provider, props = {}, children, onRenderTime }) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (onRenderTime) {
        onRenderTime(name, renderTime);
      }
      
      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`[Provider ${name}] Slow render: ${renderTime.toFixed(2)}ms`);
      }
    };
  });
  
  return <Provider {...props}>{children}</Provider>;
};