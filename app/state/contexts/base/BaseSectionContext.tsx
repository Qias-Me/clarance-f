/**
 * Base Section Context
 * 
 * Unified context implementation for all SF-86 sections
 * Eliminates duplication across 30+ section contexts
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { produce } from 'immer';
import { getFieldValue, updateNestedField } from '../../../utils/section-utilities';
import type { 
  BaseSection, 
  SectionConfig, 
  ValidationResult, 
  SectionContextState,
  SectionContextActions,
  FieldPath,
  ValidationError
} from '../../../api/interfaces/section-interfaces/shared/base-types';
import { 
  IncrementalValidator,
  ValidationStrategy 
} from '../../../api/interfaces/section-interfaces/shared/incremental-validation';
import { 
  FieldChangeTracker,
  OptimizedChangeDetector 
} from '../../../api/interfaces/section-interfaces/shared/change-tracking';
import { useSF86FormContext } from '../sections2.0/SF86FormContext';
import { logger } from '../../../services/Logger';
import { usePerformanceMonitor } from '../../../hooks/usePerformanceMonitor';

/**
 * Generic section context value
 */
export interface SectionContextValue<T> extends SectionContextState<T>, SectionContextActions<T> {
  // Additional utilities
  changeTracker: FieldChangeTracker<T>;
  validator: IncrementalValidator<T>;
  performanceMonitor: ReturnType<typeof usePerformanceMonitor>;
  metadata: {
    sectionNumber: number;
    sectionName: string;
    lastSaved?: Date;
    autoSaveEnabled: boolean;
  };
}

/**
 * Context factory options
 */
export interface ContextFactoryOptions<T> {
  enableAutoSave?: boolean;
  autoSaveDelay?: number;
  enableChangeTracking?: boolean;
  enableIncrementalValidation?: boolean;
  validationDebounce?: number;
  cacheSize?: number;
  cacheTTL?: number;
  onSave?: (data: T) => Promise<void>;
  onLoad?: () => Promise<T>;
  onError?: (error: Error) => void;
}

/**
 * Create a type-safe section context
 */
export function createBaseSectionContext<T>(
  config: SectionConfig<T>,
  options: ContextFactoryOptions<T> = {}
): {
  Context: React.Context<SectionContextValue<T> | undefined>;
  Provider: React.FC<{ children: React.ReactNode }>;
  useSection: () => SectionContextValue<T>;
} {
  // Create the context
  const Context = createContext<SectionContextValue<T> | undefined>(undefined);
  
  // Create the provider component
  const Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { updateSectionData, getSectionData } = useSF86FormContext();
    const performanceMonitor = usePerformanceMonitor(`Section${config.sectionNumber}`);
    
    // State management
    const [data, setData] = useState<T>(config.initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [warnings, setWarnings] = useState<Record<string, string>>({});
    
    // Refs for cleanup
    const mountedRef = useRef(true);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
    const validationTimeoutRef = useRef<NodeJS.Timeout>();
    
    // Initialize change tracker
    const changeTracker = useMemo(
      () => new FieldChangeTracker<T>(config.initialData),
      [config.initialData]
    );
    
    // Initialize optimized change detector
    const changeDetector = useMemo(
      () => new OptimizedChangeDetector<T>(config.initialData, {
        debounceMs: options.validationDebounce || 300,
        maxBatchSize: 10,
        onFlush: (changes) => {
          if (mountedRef.current) {
            validateIncremental(Array.from(changes.keys()));
          }
        }
      }),
      [config.initialData]
    );
    
    // Initialize incremental validator
    const validator = useMemo(
      () => new IncrementalValidator<T>(config.validationRules || {}, {
        cacheSize: options.cacheSize || 100,
        cacheTTL: options.cacheTTL || 5 * 60 * 1000
      }),
      [config.validationRules, options.cacheSize, options.cacheTTL]
    );
    
    // Setup validation dependencies
    useEffect(() => {
      // Register field dependencies if specified
      if (config.dependencies) {
        config.dependencies.forEach(dep => {
          // Parse dependency relationships
          // e.g., "field1:field2,field3" means field1 depends on field2 and field3
        });
      }
    }, [config.dependencies]);
    
    // Incremental validation
    const validateIncremental = useCallback((changedPaths: string[]) => {
      if (!mountedRef.current) return;
      
      performanceMonitor.startMeasure('validation');
      
      const result = validator.validateIncremental(data, changedPaths);
      
      // Update errors and warnings
      const newErrors: Record<string, string> = {};
      const newWarnings: Record<string, string> = {};
      
      result.errors?.forEach(error => {
        if (error.field) {
          newErrors[error.field] = error.message;
        }
      });
      
      result.warnings?.forEach(warning => {
        if (warning.field) {
          newWarnings[warning.field] = warning.message;
        }
      });
      
      setErrors(newErrors);
      setWarnings(newWarnings);
      
      performanceMonitor.endMeasure('validation');
      
      return result;
    }, [data, validator, performanceMonitor]);
    
    // Debounced validation using native implementation
    const debouncedValidation = useMemo(() => {
      let timeoutId: NodeJS.Timeout;
      return (changedPaths: string[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          validateIncremental(changedPaths);
        }, options.validationDebounce || 300);
      };
    }, [validateIncremental, options.validationDebounce]);
    
    // Update field with type safety
    const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
      if (!mountedRef.current) return;
      
      performanceMonitor.startMeasure('updateField');
      
      setData(prev => produce(prev, (draft: any) => {
        draft[field] = value;
        
        // Track change
        if (options.enableChangeTracking !== false) {
          changeTracker.trackChange(field as string, value, 'user');
          setIsDirty(changeTracker.isDirty);
        }
        
        // Queue for validation
        if (options.enableIncrementalValidation !== false) {
          changeDetector.queueChange(field as string, value);
        }
        
        performanceMonitor.endMeasure('updateField');
      }));
      
      // Trigger auto-save if enabled
      if (options.enableAutoSave && autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = setTimeout(() => {
          saveData();
        }, options.autoSaveDelay || 2000);
      }
    }, [changeTracker, changeDetector, performanceMonitor, options]);
    
    // Update multiple fields
    const updateFields = useCallback((fields: Partial<T>) => {
      if (!mountedRef.current) return;
      
      performanceMonitor.startMeasure('updateFields');
      
      // Batch changes for performance
      changeTracker.batchChanges(() => {
        Object.entries(fields).forEach(([key, value]) => {
          changeTracker.trackChange(key, value, 'batch');
        });
      });
      
      setData(prev => produce(prev, (draft: any) => {
        Object.assign(draft, fields);
      }));
      setIsDirty(changeTracker.isDirty);
      
      // Validate changed fields
      if (options.enableIncrementalValidation !== false) {
        debouncedValidation(Object.keys(fields));
      }
      
      performanceMonitor.endMeasure('updateFields');
    }, [changeTracker, debouncedValidation, performanceMonitor, options]);
    
    // Full section validation
    const validateSection = useCallback(async (): Promise<ValidationResult> => {
      performanceMonitor.startMeasure('validateSection');
      
      const result = validator.validateAll(data);
      
      // Update errors and warnings
      const newErrors: Record<string, string> = {};
      const newWarnings: Record<string, string> = {};
      
      result.errors?.forEach(error => {
        if (error.field) {
          newErrors[error.field] = error.message;
        }
      });
      
      result.warnings?.forEach(warning => {
        if (warning.field) {
          newWarnings[warning.field] = warning.message;
        }
      });
      
      setErrors(newErrors);
      setWarnings(newWarnings);
      
      performanceMonitor.endMeasure('validateSection');
      
      return result;
    }, [data, validator, performanceMonitor]);
    
    // Clear errors
    const clearErrors = useCallback(() => {
      setErrors({});
      setWarnings({});
      validator.clearCache();
    }, [validator]);
    
    // Reset to initial state
    const reset = useCallback(() => {
      setData(() => produce(config.initialData, () => {}));
      setErrors({});
      setWarnings({});
      setIsDirty(false);
      changeTracker.resetTracking(config.initialData);
      validator.clearCache();
    }, [config.initialData, changeTracker, validator]);
    
    // Load data
    const loadData = useCallback(async () => {
      setIsLoading(true);
      performanceMonitor.startMeasure('loadData');
      
      try {
        let loadedData: T;
        
        if (options.onLoad) {
          loadedData = await options.onLoad();
        } else {
          const savedData = getSectionData(`section${config.sectionNumber}`);
          loadedData = savedData || config.initialData;
        }
        
        setData(produce(loadedData, () => {}));
        changeTracker.resetTracking(loadedData);
        setIsDirty(false);
        
        logger.info(`Section ${config.sectionNumber} data loaded`, 'BaseSectionContext');
      } catch (error) {
        logger.error(`Failed to load section ${config.sectionNumber}`, error as Error, 'BaseSectionContext');
        if (options.onError) {
          options.onError(error as Error);
        }
      } finally {
        setIsLoading(false);
        performanceMonitor.endMeasure('loadData');
      }
    }, [config, getSectionData, changeTracker, performanceMonitor, options]);
    
    // Save data
    const saveData = useCallback(async () => {
      if (!isDirty) return;
      
      setIsLoading(true);
      performanceMonitor.startMeasure('saveData');
      
      try {
        // Validate before saving
        const validationResult = await validateSection();
        if (!validationResult.isValid) {
          throw new Error('Validation failed');
        }
        
        if (options.onSave) {
          await options.onSave(data);
        } else {
          updateSectionData(`section${config.sectionNumber}`, data);
        }
        
        changeTracker.resetTracking(data);
        setIsDirty(false);
        
        logger.info(`Section ${config.sectionNumber} data saved`, 'BaseSectionContext');
      } catch (error) {
        logger.error(`Failed to save section ${config.sectionNumber}`, error as Error, 'BaseSectionContext');
        if (options.onError) {
          options.onError(error as Error);
        }
      } finally {
        setIsLoading(false);
        performanceMonitor.endMeasure('saveData');
      }
    }, [data, isDirty, config, updateSectionData, changeTracker, validateSection, performanceMonitor, options]);
    
    // Load data on mount
    useEffect(() => {
      mountedRef.current = true;
      loadData();
      
      return () => {
        mountedRef.current = false;
        
        // Cleanup timeouts
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        if (validationTimeoutRef.current) {
          clearTimeout(validationTimeoutRef.current);
        }
        
        // Cleanup performance monitor
        performanceMonitor.cleanup();
        
        // Clear validation cache
        validator.clearCache();
      };
    }, []);
    
    // Create context value
    const contextValue = useMemo<SectionContextValue<T>>(() => ({
      // State
      data,
      isLoading,
      isDirty,
      errors,
      warnings,
      
      // Actions
      updateField,
      updateFields,
      validateSection,
      clearErrors,
      reset,
      loadData,
      saveData,
      
      // Utilities
      changeTracker,
      validator,
      performanceMonitor,
      
      // Metadata
      metadata: {
        sectionNumber: config.sectionNumber,
        sectionName: config.sectionName,
        autoSaveEnabled: options.enableAutoSave || false
      }
    }), [
      data, isLoading, isDirty, errors, warnings,
      updateField, updateFields, validateSection, clearErrors, reset, loadData, saveData,
      changeTracker, validator, performanceMonitor,
      config.sectionNumber, config.sectionName, options.enableAutoSave
    ]);
    
    return (
      <Context.Provider value={contextValue}>
        {children}
      </Context.Provider>
    );
  };
  
  // Create the hook
  const useSection = (): SectionContextValue<T> => {
    const context = useContext(Context);
    if (!context) {
      throw new Error(`useSection${config.sectionNumber} must be used within Section${config.sectionNumber}Provider`);
    }
    return context;
  };
  
  // Set display names for debugging
  Provider.displayName = `Section${config.sectionNumber}Provider`;
  
  return {
    Context,
    Provider,
    useSection
  };
}