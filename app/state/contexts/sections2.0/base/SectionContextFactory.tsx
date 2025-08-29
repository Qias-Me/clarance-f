/**
 * Section Context Factory
 * 
 * Factory for creating standardized section contexts with consistent behavior
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo, memo } from 'react';
import type { Field, ValidationResult } from '../../../../api/interfaces/formDefinition2.0';
import { useSF86FormContext } from '../SF86FormContext';
import { logger } from '../../../../services/Logger';
import { debounce } from 'lodash';
import { usePerformanceMonitor } from '../../../../hooks/usePerformanceMonitor';

// Generic types for section data
export interface SectionData {
  [key: string]: Field<any> | any;
}

export interface SectionContextValue<T extends SectionData> {
  sectionData: T;
  isLoading: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  isDirty: boolean;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  updateFields: (fields: Partial<T>) => void;
  validateSection: () => ValidationResult;
  clearErrors: () => void;
  reset: () => void;
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
}

export interface SectionConfig<T extends SectionData> {
  sectionNumber: number;
  sectionName: string;
  initialData: T;
  fieldConfig?: Record<keyof T, {
    required?: boolean;
    validation?: (value: any) => ValidationResult;
    dependsOn?: string[];
  }>;
  validate?: (data: T) => ValidationResult;
  transform?: (data: T) => T;
  onSave?: (data: T) => Promise<void>;
  onLoad?: () => Promise<T>;
}

/**
 * Creates a section context with standardized behavior
 */
export function createSectionContext<T extends SectionData>(
  config: SectionConfig<T>
): {
  Context: React.Context<SectionContextValue<T> | undefined>;
  Provider: React.FC<{ children: React.ReactNode }>;
  useSection: () => SectionContextValue<T>;
} {
  const Context = createContext<SectionContextValue<T> | undefined>(undefined);

  const Provider: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
    const { updateSectionData, getSectionData } = useSF86FormContext();
    const [sectionData, setSectionData] = useState<T>(config.initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [warnings, setWarnings] = useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = useState(false);
    
    const saveTimeoutRef = useRef<NodeJS.Timeout>();
    const validationTimeoutRef = useRef<NodeJS.Timeout>();
    const lastSavedDataRef = useRef<string>(JSON.stringify(config.initialData));
    const mountedRef = useRef(true);
    const performanceMonitor = usePerformanceMonitor(`Section${config.sectionNumber}`);

    // Debounced validation with performance tracking
    const debouncedValidation = useMemo(
      () => debounce((data: T) => {
        if (!mountedRef.current) return;
        
        performanceMonitor.startMeasure('validation');
        const result = validateSection(data);
        
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
        
        if (mountedRef.current) {
          setErrors(newErrors);
          setWarnings(newWarnings);
        }
        
        performanceMonitor.endMeasure('validation');
        return result;
      }, 300),
      [performanceMonitor]
    );

    // Validation logic
    const validateSection = useCallback((data: T): ValidationResult => {
      const errors: Array<{ field?: string; message: string }> = [];
      const warnings: Array<{ field?: string; message: string }> = [];

      // Field-level validation
      if (config.fieldConfig) {
        Object.entries(config.fieldConfig).forEach(([fieldName, fieldConfig]) => {
          const value = data[fieldName];
          
          // Required field validation
          if (fieldConfig.required) {
            const fieldValue = typeof value === 'object' && 'value' in value ? value.value : value;
            if (!fieldValue || (typeof fieldValue === 'string' && !fieldValue.trim())) {
              errors.push({
                field: fieldName,
                message: `${fieldName} is required`
              });
            }
          }
          
          // Custom validation
          if (fieldConfig.validation && value) {
            const result = fieldConfig.validation(value);
            if (!result.isValid) {
              result.errors?.forEach(error => {
                errors.push({
                  field: error.field || fieldName,
                  message: error.message
                });
              });
            }
          }
        });
      }

      // Section-level validation
      if (config.validate) {
        const sectionResult = config.validate(data);
        if (!sectionResult.isValid) {
          sectionResult.errors?.forEach(error => errors.push(error));
          sectionResult.warnings?.forEach(warning => warnings.push(warning));
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    }, [config]);

    // Memoized update field with batching support
    const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
      if (!mountedRef.current) return;
      
      performanceMonitor.startMeasure('updateField');
      setSectionData(prev => {
        const updated = { ...prev, [field]: value };
        setIsDirty(JSON.stringify(updated) !== lastSavedDataRef.current);
        
        // Trigger validation
        if (validationTimeoutRef.current) {
          clearTimeout(validationTimeoutRef.current);
        }
        validationTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            debouncedValidation(updated);
          }
        }, 300);
        
        performanceMonitor.endMeasure('updateField');
        return updated;
      });
    }, [debouncedValidation, performanceMonitor]);

    // Update multiple fields
    const updateFields = useCallback((fields: Partial<T>) => {
      setSectionData(prev => {
        const updated = { ...prev, ...fields };
        setIsDirty(JSON.stringify(updated) !== lastSavedDataRef.current);
        
        // Trigger validation
        if (validationTimeoutRef.current) {
          clearTimeout(validationTimeoutRef.current);
        }
        validationTimeoutRef.current = setTimeout(() => {
          debouncedValidation(updated);
        }, 300);
        
        return updated;
      });
    }, [debouncedValidation]);

    // Clear errors
    const clearErrors = useCallback(() => {
      setErrors({});
      setWarnings({});
    }, []);

    // Reset to initial data
    const reset = useCallback(() => {
      setSectionData(config.initialData);
      setErrors({});
      setWarnings({});
      setIsDirty(false);
      lastSavedDataRef.current = JSON.stringify(config.initialData);
    }, [config.initialData]);

    // Load data
    const loadData = useCallback(async () => {
      setIsLoading(true);
      try {
        let data: T;
        
        if (config.onLoad) {
          data = await config.onLoad();
        } else {
          const savedData = getSectionData(`section${config.sectionNumber}`);
          data = savedData || config.initialData;
        }
        
        setSectionData(data);
        lastSavedDataRef.current = JSON.stringify(data);
        setIsDirty(false);
        
        logger.info(`Section ${config.sectionNumber} data loaded`, 'SectionContext');
      } catch (error) {
        logger.error(`Failed to load section ${config.sectionNumber}`, error as Error, 'SectionContext');
        setErrors({ general: 'Failed to load section data' });
      } finally {
        setIsLoading(false);
      }
    }, [config, getSectionData]);

    // Save data
    const saveData = useCallback(async () => {
      if (!isDirty) return;
      
      const validationResult = validateSection(sectionData);
      if (!validationResult.isValid) {
        logger.warn(`Section ${config.sectionNumber} validation failed`, 'SectionContext', {
          errors: validationResult.errors
        });
        return;
      }
      
      setIsLoading(true);
      try {
        const dataToSave = config.transform ? config.transform(sectionData) : sectionData;
        
        if (config.onSave) {
          await config.onSave(dataToSave);
        } else {
          updateSectionData(`section${config.sectionNumber}`, dataToSave);
        }
        
        lastSavedDataRef.current = JSON.stringify(sectionData);
        setIsDirty(false);
        
        logger.info(`Section ${config.sectionNumber} data saved`, 'SectionContext');
      } catch (error) {
        logger.error(`Failed to save section ${config.sectionNumber}`, error as Error, 'SectionContext');
        setErrors({ general: 'Failed to save section data' });
      } finally {
        setIsLoading(false);
      }
    }, [isDirty, sectionData, config, updateSectionData, validateSection]);

    // Auto-save when dirty
    useEffect(() => {
      if (!isDirty) return;
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveData();
      }, 2000);
      
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }, [isDirty, saveData]);

    // Load data on mount with proper cleanup
    useEffect(() => {
      mountedRef.current = true;
      loadData();
      
      return () => {
        mountedRef.current = false;
        // Cleanup timeouts
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = undefined;
        }
        if (validationTimeoutRef.current) {
          clearTimeout(validationTimeoutRef.current);
          validationTimeoutRef.current = undefined;
        }
        debouncedValidation.cancel();
        performanceMonitor.cleanup();
      };
    }, [performanceMonitor]);

    // Memoize context value to prevent unnecessary re-renders
    const value: SectionContextValue<T> = useMemo(() => ({
      sectionData,
      isLoading,
      errors,
      warnings,
      isDirty,
      updateField,
      updateFields,
      validateSection: () => validateSection(sectionData),
      clearErrors,
      reset,
      loadData,
      saveData
    }), [sectionData, isLoading, errors, warnings, isDirty, updateField, updateFields, clearErrors, reset, loadData, saveData, validateSection]);

    return <Context.Provider value={value}>{children}</Context.Provider>;
  });

  Provider.displayName = `Section${config.sectionNumber}Provider`;

  const useSection = (): SectionContextValue<T> => {
    const context = useContext(Context);
    if (!context) {
      throw new Error(`useSection${config.sectionNumber} must be used within Section${config.sectionNumber}Provider`);
    }
    return context;
  };

  return {
    Context,
    Provider,
    useSection
  };
}