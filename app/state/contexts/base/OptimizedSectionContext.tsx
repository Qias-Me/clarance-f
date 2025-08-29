/**
 * Performance-Optimized Section Context
 * Implements validation caching, incremental validation, and memory optimization
 */

import React, { createContext, useContext, useCallback, useMemo, useRef, useEffect } from 'react';
import { debounce } from 'lodash-es';

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationCache {
  [fieldPath: string]: {
    value: any;
    result: ValidationRule[];
    timestamp: number;
  };
}

export interface OptimizedContextOptions<T> {
  sectionName: string;
  defaultData: T;
  validateSection: (data: T) => ValidationRule[];
  transformData?: (data: T) => T;
  cacheTimeout?: number; // ms
  debounceDelay?: number; // ms
}

export interface OptimizedSectionContextValue<T> {
  data: T;
  updateData: (updates: Partial<T>) => void;
  errors: ValidationRule[];
  warnings: ValidationRule[];
  isValidating: boolean;
  isDirty: boolean;
  clearCache: () => void;
  performance: {
    validationTime: number;
    cacheHitRate: number;
    renderCount: number;
  };
}

/**
 * Creates a performance-optimized section context with validation caching
 */
export function createOptimizedSectionContext<T extends Record<string, any>>(
  options: OptimizedContextOptions<T>
) {
  const {
    sectionName,
    defaultData,
    validateSection,
    transformData,
    cacheTimeout = 30000, // 30s cache
    debounceDelay = 300
  } = options;

  const Context = createContext<OptimizedSectionContextValue<T> | null>(null);

  const Provider: React.FC<{ children: React.ReactNode; initialData?: Partial<T> }> = ({
    children,
    initialData = {}
  }) => {
    const [data, setData] = React.useState<T>(() => ({
      ...defaultData,
      ...initialData
    }));

    // Performance tracking
    const performanceRef = useRef({
      validationTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      renderCount: 0
    });

    // Validation cache
    const validationCacheRef = useRef<ValidationCache>({});
    const [isValidating, setIsValidating] = React.useState(false);
    const [errors, setErrors] = React.useState<ValidationRule[]>([]);
    const [warnings, setWarnings] = React.useState<ValidationRule[]>([]);
    const [isDirty, setIsDirty] = React.useState(false);

    // Incremental validation with caching
    const validateIncremental = useCallback(
      async (newData: T, changedFields: Set<string>) => {
        const start = performance.now();
        setIsValidating(true);

        const cache = validationCacheRef.current;
        const now = Date.now();
        let allErrors: ValidationRule[] = [];
        let allWarnings: ValidationRule[] = [];

        // Check cache for unchanged fields
        const fieldsToValidate = new Set<string>();
        
        for (const field of changedFields) {
          const cached = cache[field];
          if (!cached || 
              cached.value !== newData[field] || 
              now - cached.timestamp > cacheTimeout) {
            fieldsToValidate.add(field);
            performanceRef.current.cacheMisses++;
          } else {
            // Use cached result
            allErrors.push(...cached.result.filter(r => r.severity === 'error'));
            allWarnings.push(...cached.result.filter(r => r.severity === 'warning'));
            performanceRef.current.cacheHits++;
          }
        }

        // Validate only changed/uncached fields
        if (fieldsToValidate.size > 0) {
          const fieldValidationResults = validateSection(newData);
          
          // Update cache and collect results
          fieldValidationResults.forEach(result => {
            if (fieldsToValidate.has(result.field)) {
              cache[result.field] = {
                value: newData[result.field],
                result: [result],
                timestamp: now
              };
            }
            
            if (result.severity === 'error') {
              allErrors.push(result);
            } else {
              allWarnings.push(result);
            }
          });
        }

        // Clean expired cache entries
        Object.keys(cache).forEach(field => {
          if (now - cache[field].timestamp > cacheTimeout) {
            delete cache[field];
          }
        });

        const validationTime = performance.now() - start;
        performanceRef.current.validationTime = validationTime;

        setErrors(allErrors);
        setWarnings(allWarnings);
        setIsValidating(false);
      },
      [validateSection, cacheTimeout]
    );

    // Debounced validation
    const debouncedValidate = useMemo(
      () => debounce(validateIncremental, debounceDelay),
      [validateIncremental, debounceDelay]
    );

    // Track changed fields for incremental validation
    const previousDataRef = useRef<T>(data);
    
    const updateData = useCallback((updates: Partial<T>) => {
      setData(prevData => {
        const newData = { ...prevData, ...updates };
        const transformedData = transformData ? transformData(newData) : newData;
        
        // Determine changed fields
        const changedFields = new Set<string>();
        Object.keys(updates).forEach(key => {
          if (previousDataRef.current[key] !== transformedData[key]) {
            changedFields.add(key);
          }
        });

        if (changedFields.size > 0) {
          setIsDirty(true);
          debouncedValidate(transformedData, changedFields);
        }

        previousDataRef.current = transformedData;
        return transformedData;
      });
    }, [debouncedValidate, transformData]);

    // Clear validation cache
    const clearCache = useCallback(() => {
      validationCacheRef.current = {};
      performanceRef.current = {
        validationTime: 0,
        cacheHits: 0,
        cacheMisses: 0,
        renderCount: performanceRef.current.renderCount
      };
    }, []);

    // Performance metrics
    const performance = useMemo(() => ({
      validationTime: performanceRef.current.validationTime,
      cacheHitRate: performanceRef.current.cacheHits / 
        (performanceRef.current.cacheHits + performanceRef.current.cacheMisses) || 0,
      renderCount: ++performanceRef.current.renderCount
    }), [errors, warnings, isValidating]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        debouncedValidate.cancel();
      };
    }, [debouncedValidate]);

    const value = useMemo(() => ({
      data,
      updateData,
      errors,
      warnings,
      isValidating,
      isDirty,
      clearCache,
      performance
    }), [data, updateData, errors, warnings, isValidating, isDirty, clearCache, performance]);

    return (
      <Context.Provider value={value}>
        {children}
      </Context.Provider>
    );
  };

  const useContext = (): OptimizedSectionContextValue<T> => {
    const context = React.useContext(Context);
    if (!context) {
      throw new Error(`useContext must be used within ${sectionName}Provider`);
    }
    return context;
  };

  return {
    Provider,
    useContext,
    Context
  };
}