import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, ReactNode } from 'react';
import { produce } from 'immer';

/**
 * Base types for all section contexts
 */
export interface BaseSectionData {
  _id: number;
  [key: string]: unknown;
}

export interface Field<T> {
  value: T;
  error?: string;
  touched?: boolean;
  required?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface BaseSectionContextValue<T extends BaseSectionData> {
  data: T;
  isDirty: boolean;
  isValid: boolean;
  errors: ValidationError[];
  errorMap: Record<string, string>;
  isLoading: boolean;
  updateField: <V = unknown>(path: string, value: V) => void;
  updateMultipleFields: (updates: Record<string, unknown>) => void;
  reset: () => void;
  validate: () => boolean;
  clearErrors: () => void;
  getFieldValue: <V = unknown>(path: string) => V | undefined;
  setLoading: (loading: boolean) => void;
}

export interface BaseSectionProviderProps {
  children: ReactNode;
  sectionId: string;
  initialData?: unknown;
  onDataChange?: (data: unknown) => void;
}

/**
 * Configuration for creating a section context
 */
export interface SectionConfig<T extends BaseSectionData> {
  sectionName: string;
  defaultData: T;
  validateSection?: (data: T) => ValidationError[];
  transformData?: (data: T) => T;
}

/**
 * Performance cache for validation results with TTL
 */
interface CacheEntry {
  data: string;
  errors: ValidationError[];
  timestamp: number;
}

const CACHE_TTL = 5000; // 5 seconds
const validationCache = new Map<string, CacheEntry>();

/**
 * Clean expired cache entries
 */
const cleanCache = () => {
  const now = Date.now();
  for (const [key, entry] of validationCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      validationCache.delete(key);
    }
  }
};

/**
 * Factory function to create typed section contexts with performance optimizations
 */
export function createSectionContext<T extends BaseSectionData>(
  config: SectionConfig<T>
) {
  const {
    sectionName,
    defaultData,
    validateSection = () => [],
    transformData = (data) => data,
  } = config;

  // Create the context with proper typing
  const SectionContext = createContext<BaseSectionContextValue<T> | undefined>(undefined);

  // Custom hook for using the context
  const useSectionContext = () => {
    const context = useContext(SectionContext);
    if (!context) {
      throw new Error(`use${sectionName} must be used within ${sectionName}Provider`);
    }
    return context;
  };

  // Provider component
  const SectionProvider: React.FC<BaseSectionProviderProps> = ({
    children,
    sectionId,
    initialData,
    onDataChange,
  }) => {
    // Initialize state with type safety
    const [data, setData] = useState<T>(() => {
      if (initialData && typeof initialData === 'object') {
        return transformData({ ...defaultData, ...initialData } as T);
      }
      return { ...defaultData };
    });

    const initialStateRef = useRef<T>({ ...data });
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [isLoading, setLoading] = useState(false);
    const validationTimeoutRef = useRef<NodeJS.Timeout>();

    // Optimized dirty check without JSON.stringify
    const isDirty = useMemo(() => {
      return !isDeepEqual(data, initialStateRef.current);
    }, [data]);

    // Cached validation with debouncing and TTL
    const validate = useCallback(() => {
      cleanCache(); // Clean expired entries
      const dataKey = `${sectionId}-${JSON.stringify(data)}`;
      const cached = validationCache.get(dataKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setErrors(cached.errors);
        return cached.errors.length === 0;
      }

      const validationErrors = validateSection(data);
      validationCache.set(dataKey, { 
        data: JSON.stringify(data), 
        errors: validationErrors,
        timestamp: Date.now()
      });
      
      // Limit cache size
      if (validationCache.size > 100) {
        const firstKey = validationCache.keys().next().value;
        validationCache.delete(firstKey);
      }
      
      setErrors(validationErrors);
      return validationErrors.length === 0;
    }, [data, sectionId, validateSection]);

    // Check validity
    const isValid = useMemo(() => {
      return errors.filter(e => e.severity === 'error').length === 0;
    }, [errors]);

    // Update single field with path support using Immer
    const updateField = useCallback(<V = unknown>(path: string, value: V) => {
      setData(prevData => 
        produce(prevData, draft => {
          setNestedProperty(draft, path, value);
        })
      );
    }, []);

    // Update multiple fields efficiently using Immer
    const updateMultipleFields = useCallback((updates: Record<string, unknown>) => {
      setData(prevData => 
        produce(prevData, draft => {
          Object.entries(updates).forEach(([path, value]) => {
            setNestedProperty(draft, path, value);
          });
        })
      );
    }, []);

    // Reset to initial state
    const reset = useCallback(() => {
      setData({ ...initialStateRef.current });
      setErrors([]);
    }, []);

    // Clear errors
    const clearErrors = useCallback(() => {
      setErrors([]);
    }, []);

    // Notify parent of data changes
    useEffect(() => {
      if (onDataChange) {
        onDataChange(data);
      }
    }, [data, onDataChange]);

    // Auto-validate on data change (debounced)
    useEffect(() => {
      const timer = setTimeout(() => {
        validate();
      }, 300);
      return () => clearTimeout(timer);
    }, [data, validate]);

    // Get field value helper
    const getFieldValue = useCallback(<V = unknown>(path: string): V | undefined => {
      return getNestedProperty(data, path) as V;
    }, [data]);
    
    // Create error map for easy field access
    const errorMap = useMemo(() => {
      const map: Record<string, string> = {};
      errors.forEach(error => {
        if (error.field && error.severity === 'error') {
          map[error.field] = error.message;
        }
      });
      return map;
    }, [errors]);

    const contextValue: BaseSectionContextValue<T> = {
      data,
      isDirty,
      isValid,
      errors,
      errorMap,
      isLoading,
      updateField,
      updateMultipleFields,
      reset,
      validate,
      clearErrors,
      getFieldValue,
      setLoading,
    };

    return (
      <SectionContext.Provider value={contextValue}>
        {children}
      </SectionContext.Provider>
    );
  };

  return {
    Provider: SectionProvider,
    useContext: useSectionContext,
    Context: SectionContext,
  };
}

/**
 * Utility functions
 */

// Deep equality check without JSON.stringify
function isDeepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!isDeepEqual((obj1 as any)[key], (obj2 as any)[key])) return false;
  }
  
  return true;
}

// Set nested property using path notation
function setNestedProperty(obj: any, path: string, value: unknown): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

// Get nested property using path notation
export function getNestedProperty(obj: any, path: string): unknown {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
}

/**
 * Common validation utilities
 */
export const ValidationUtils = {
  required: (value: unknown, fieldName: string): ValidationError | null => {
    if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
      return {
        field: fieldName,
        message: `${fieldName} is required`,
        severity: 'error',
      };
    }
    return null;
  },

  maxLength: (value: string | undefined, maxLen: number, fieldName: string): ValidationError | null => {
    if (value && value.length > maxLen) {
      return {
        field: fieldName,
        message: `${fieldName} must be ${maxLen} characters or less`,
        severity: 'error',
      };
    }
    return null;
  },

  email: (value: string | undefined, fieldName: string): ValidationError | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return {
        field: fieldName,
        message: `${fieldName} must be a valid email address`,
        severity: 'error',
      };
    }
    return null;
  },

  phone: (value: string | undefined, fieldName: string): ValidationError | null => {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    if (value && !phoneRegex.test(value)) {
      return {
        field: fieldName,
        message: `${fieldName} must be in format XXX-XXX-XXXX`,
        severity: 'warning',
      };
    }
    return null;
  },

  date: (value: string | undefined, fieldName: string): ValidationError | null => {
    if (value && isNaN(Date.parse(value))) {
      return {
        field: fieldName,
        message: `${fieldName} must be a valid date`,
        severity: 'error',
      };
    }
    return null;
  },
};

/**
 * Hook for managing form arrays (repeating sections)
 */
export function useFormArray<T>(
  initialItems: T[] = [],
  createDefault: () => T
) {
  const [items, setItems] = useState<T[]>(initialItems);

  const addItem = useCallback(() => {
    setItems(prev => [...prev, createDefault()]);
  }, [createDefault]);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback((index: number, updates: Partial<T>) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], ...updates };
      return newItems;
    });
  }, []);

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    setItems(prev => {
      const newItems = [...prev];
      const [removed] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, removed);
      return newItems;
    });
  }, []);

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    moveItem,
    setItems,
  };
}