import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { produce, enableMapSet } from 'immer';
import { 
  BaseSectionData, 
  ValidationError, 
  BaseSectionProviderProps,
  SectionConfig,
  ValidationUtils,
  getNestedProperty
} from './BaseSectionContext';

// Enable Map and Set support in Immer
enableMapSet();

/**
 * Split context interfaces for performance optimization
 */
export interface SectionDataContext<T extends BaseSectionData> {
  data: T;
  isDirty: boolean;
  isValid: boolean;
  errors: ValidationError[];
  validationState: 'idle' | 'validating' | 'validated';
}

export interface SectionActionsContext<T extends BaseSectionData> {
  updateField: (path: string, value: unknown) => void;
  updateMultipleFields: (updates: Record<string, unknown>) => void;
  batchUpdate: (updater: (draft: T) => void) => void;
  reset: () => void;
  validate: () => Promise<boolean>;
  clearErrors: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Performance monitoring interface
 */
interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  updateCount: number;
  validationTime: number;
}

/**
 * Factory for creating optimized section contexts with split data/actions
 */
export function createOptimizedSectionContext<T extends BaseSectionData>(
  config: SectionConfig<T>
) {
  const {
    sectionName,
    defaultData,
    validateSection = () => [],
    transformData = (data) => data,
  } = config;

  // Create split contexts for data and actions
  const DataContext = createContext<SectionDataContext<T> | undefined>(undefined);
  const ActionsContext = createContext<SectionActionsContext<T> | undefined>(undefined);
  const MetricsContext = createContext<PerformanceMetrics | undefined>(undefined);

  // History management for undo/redo
  interface HistoryState {
    past: T[];
    present: T;
    future: T[];
  }

  // Data-only hook for read-heavy components
  const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
      throw new Error(`useData must be used within ${sectionName}Provider`);
    }
    return context;
  };

  // Selective data hook with selector for fine-grained subscriptions
  const useDataSelector = <R,>(selector: (data: T) => R): R => {
    const context = useContext(DataContext);
    if (!context) {
      throw new Error(`useDataSelector must be used within ${sectionName}Provider`);
    }
    
    return useMemo(
      () => selector(context.data),
      [context.data, selector]
    );
  };

  // Actions-only hook for update-heavy components
  const useActions = () => {
    const context = useContext(ActionsContext);
    if (!context) {
      throw new Error(`useActions must be used within ${sectionName}Provider`);
    }
    return context;
  };

  // Combined hook for backward compatibility
  const useSection = () => {
    const data = useData();
    const actions = useActions();
    return { ...data, ...actions };
  };

  // Performance metrics hook
  const useMetrics = () => {
    const context = useContext(MetricsContext);
    if (!context) {
      throw new Error(`useMetrics must be used within ${sectionName}Provider`);
    }
    return context;
  };

  // Optimized Provider component
  const Provider: React.FC<BaseSectionProviderProps> = ({
    children,
    sectionId,
    initialData,
    onDataChange,
  }) => {
    // Initialize history state using Immer for efficient updates
    const [history, setHistory] = useState<HistoryState>(() => {
      const initial = initialData && typeof initialData === 'object'
        ? transformData({ ...defaultData, ...initialData } as T)
        : defaultData;
      
      return {
        past: [],
        present: initial,
        future: [],
      };
    });

    // Performance metrics tracking
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      updateCount: 0,
      validationTime: 0,
    });

    // Track render performance
    useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const renderTime = performance.now() - startTime;
        setMetrics(prev => ({
          ...prev,
          renderCount: prev.renderCount + 1,
          lastRenderTime: renderTime,
          averageRenderTime: 
            (prev.averageRenderTime * prev.renderCount + renderTime) / (prev.renderCount + 1),
        }));
      };
    });

    // Current data from history
    const data = history.present;
    const [initialState] = useState<T>(() => data);

    // Validation state
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [validationState, setValidationState] = useState<'idle' | 'validating' | 'validated'>('idle');

    // Optimized dirty check using shallow comparison for primitive fields
    const isDirty = useMemo(() => {
      // Fast path for reference equality
      if (data === initialState) return false;
      
      // Use Immer's isDraft check for efficiency
      return !shallowEqualWithDepth(data, initialState, 2);
    }, [data, initialState]);

    // Check validity
    const isValid = useMemo(() => {
      return errors.filter(e => e.severity === 'error').length === 0;
    }, [errors]);

    // Async validation with performance tracking
    const validate = useCallback(async (): Promise<boolean> => {
      setValidationState('validating');
      const startTime = performance.now();
      
      // Simulate async validation (could be API call)
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const validationErrors = validateSection(data);
      setErrors(validationErrors);
      setValidationState('validated');
      
      const validationTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, validationTime }));
      
      return validationErrors.length === 0;
    }, [data, validateSection]);

    // Efficient field update using Immer
    const updateField = useCallback((path: string, value: unknown) => {
      setHistory(prevHistory => {
        const newData = produce(prevHistory.present, draft => {
          setNestedProperty(draft as any, path, value);
        });
        
        const transformed = transformData(newData);
        
        return {
          past: [...prevHistory.past, prevHistory.present].slice(-50), // Limit history size
          present: transformed,
          future: [], // Clear future on new change
        };
      });
      
      setMetrics(prev => ({ ...prev, updateCount: prev.updateCount + 1 }));
    }, [transformData]);

    // Batch multiple field updates efficiently
    const updateMultipleFields = useCallback((updates: Record<string, unknown>) => {
      setHistory(prevHistory => {
        const newData = produce(prevHistory.present, draft => {
          Object.entries(updates).forEach(([path, value]) => {
            setNestedProperty(draft as any, path, value);
          });
        });
        
        const transformed = transformData(newData);
        
        return {
          past: [...prevHistory.past, prevHistory.present].slice(-50),
          present: transformed,
          future: [],
        };
      });
      
      setMetrics(prev => ({ ...prev, updateCount: prev.updateCount + 1 }));
    }, [transformData]);

    // Batch update with custom updater function
    const batchUpdate = useCallback((updater: (draft: T) => void) => {
      setHistory(prevHistory => {
        const newData = produce(prevHistory.present, updater);
        const transformed = transformData(newData);
        
        return {
          past: [...prevHistory.past, prevHistory.present].slice(-50),
          present: transformed,
          future: [],
        };
      });
      
      setMetrics(prev => ({ ...prev, updateCount: prev.updateCount + 1 }));
    }, [transformData]);

    // Undo operation
    const undo = useCallback(() => {
      setHistory(prevHistory => {
        if (prevHistory.past.length === 0) return prevHistory;
        
        const previous = prevHistory.past[prevHistory.past.length - 1];
        const newPast = prevHistory.past.slice(0, -1);
        
        return {
          past: newPast,
          present: previous,
          future: [prevHistory.present, ...prevHistory.future],
        };
      });
    }, []);

    // Redo operation
    const redo = useCallback(() => {
      setHistory(prevHistory => {
        if (prevHistory.future.length === 0) return prevHistory;
        
        const next = prevHistory.future[0];
        const newFuture = prevHistory.future.slice(1);
        
        return {
          past: [...prevHistory.past, prevHistory.present],
          present: next,
          future: newFuture,
        };
      });
    }, []);

    // Reset to initial state
    const reset = useCallback(() => {
      setHistory({
        past: [],
        present: initialState,
        future: [],
      });
      setErrors([]);
      setValidationState('idle');
    }, [initialState]);

    // Clear errors
    const clearErrors = useCallback(() => {
      setErrors([]);
      setValidationState('idle');
    }, []);

    // Notify parent of data changes (debounced)
    useEffect(() => {
      if (!onDataChange) return;
      
      const timer = setTimeout(() => {
        onDataChange(data);
      }, 100);
      
      return () => clearTimeout(timer);
    }, [data, onDataChange]);

    // Auto-validate on data change (debounced)
    useEffect(() => {
      const timer = setTimeout(() => {
        validate();
      }, 500);
      
      return () => clearTimeout(timer);
    }, [data, validate]);

    // Memoized context values to prevent unnecessary re-renders
    const dataContextValue = useMemo<SectionDataContext<T>>(
      () => ({
        data,
        isDirty,
        isValid,
        errors,
        validationState,
      }),
      [data, isDirty, isValid, errors, validationState]
    );

    const actionsContextValue = useMemo<SectionActionsContext<T>>(
      () => ({
        updateField,
        updateMultipleFields,
        batchUpdate,
        reset,
        validate,
        clearErrors,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
      }),
      [
        updateField,
        updateMultipleFields,
        batchUpdate,
        reset,
        validate,
        clearErrors,
        undo,
        redo,
        history.past.length,
        history.future.length,
      ]
    );

    return (
      <DataContext.Provider value={dataContextValue}>
        <ActionsContext.Provider value={actionsContextValue}>
          <MetricsContext.Provider value={metrics}>
            {children}
          </MetricsContext.Provider>
        </ActionsContext.Provider>
      </DataContext.Provider>
    );
  };

  // Development tools component
  const DevTools: React.FC = () => {
    const data = useData();
    const actions = useActions();
    const metrics = useMetrics();
    const [isOpen, setIsOpen] = useState(false);
    
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: 4,
        padding: 10,
        maxWidth: 400,
        maxHeight: 600,
        overflow: 'auto',
      }}>
        <button onClick={() => setIsOpen(!isOpen)}>
          🛠️ {sectionName} DevTools ({metrics.renderCount} renders)
        </button>
        
        {isOpen && (
          <>
            <div>
              <h4>Performance Metrics:</h4>
              <ul>
                <li>Render Count: {metrics.renderCount}</li>
                <li>Last Render: {metrics.lastRenderTime.toFixed(2)}ms</li>
                <li>Avg Render: {metrics.averageRenderTime.toFixed(2)}ms</li>
                <li>Updates: {metrics.updateCount}</li>
                <li>Validation Time: {metrics.validationTime.toFixed(2)}ms</li>
              </ul>
            </div>
            
            <div>
              <h4>State:</h4>
              <ul>
                <li>Dirty: {data.isDirty ? '✓' : '✗'}</li>
                <li>Valid: {data.isValid ? '✓' : '✗'}</li>
                <li>Validation: {data.validationState}</li>
                <li>Errors: {data.errors.length}</li>
              </ul>
            </div>
            
            <div>
              <h4>History:</h4>
              <button onClick={actions.undo} disabled={!actions.canUndo}>
                ↶ Undo
              </button>
              <button onClick={actions.redo} disabled={!actions.canRedo}>
                ↷ Redo
              </button>
              <button onClick={actions.reset}>
                ⟲ Reset
              </button>
            </div>
            
            <details>
              <summary>Current Data</summary>
              <pre style={{ fontSize: 10 }}>
                {JSON.stringify(data.data, null, 2)}
              </pre>
            </details>
            
            {data.errors.length > 0 && (
              <details>
                <summary>Errors ({data.errors.length})</summary>
                <ul>
                  {data.errors.map((error, i) => (
                    <li key={i} style={{ color: error.severity === 'error' ? 'red' : 'orange' }}>
                      {error.field}: {error.message}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </>
        )}
      </div>
    );
  };

  return {
    Provider,
    useData,
    useDataSelector,
    useActions,
    useSection,
    useMetrics,
    DevTools,
    DataContext,
    ActionsContext,
  };
}

/**
 * Utility functions
 */

// Set nested property using path notation with Immer compatibility
function setNestedProperty(obj: any, path: string, value: unknown): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    
    // Handle array indices
    const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch;
      if (!(arrayKey in current)) {
        current[arrayKey] = [];
      }
      if (!current[arrayKey][parseInt(index)]) {
        current[arrayKey][parseInt(index)] = {};
      }
      current = current[arrayKey][parseInt(index)];
    } else {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
  }
  
  const lastKey = keys[keys.length - 1];
  const arrayMatch = lastKey.match(/^(.+)\[(\d+)\]$/);
  if (arrayMatch) {
    const [, arrayKey, index] = arrayMatch;
    if (!(arrayKey in current)) {
      current[arrayKey] = [];
    }
    current[arrayKey][parseInt(index)] = value;
  } else {
    current[lastKey] = value;
  }
}

// Shallow equality check with configurable depth
function shallowEqualWithDepth(obj1: any, obj2: any, maxDepth: number, currentDepth = 0): boolean {
  if (obj1 === obj2) return true;
  
  if (currentDepth >= maxDepth) {
    return obj1 === obj2;
  }
  
  if (obj1 == null || obj2 == null) return false;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    
    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      if (!shallowEqualWithDepth(obj1[key], obj2[key], maxDepth, currentDepth + 1)) {
        return false;
      }
    } else if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
}