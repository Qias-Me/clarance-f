/**
 * Unified Section Context Architecture
 * Eliminates duplication across 30+ section contexts with a single, flexible base
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import get from 'lodash/get';
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import { logger } from '../../../utils/logger';

// Base interfaces for all sections
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  rule?: string;
}

export interface SectionConfig<T = any> {
  sectionName: string;
  sectionNumber: number;
  defaultData: T;
  validateSection?: (data: T) => ValidationError[];
  transformData?: (data: T) => T;
  debounceMs?: number;
  autoSave?: boolean;
}

export interface SectionContextValue<T = any> {
  data: T;
  updateData: (updates: Partial<T> | ((prevData: T) => T)) => void;
  updateFieldValue: (path: string, value: any) => void;
  errors: ValidationError[];
  warnings: ValidationError[];
  isValid: boolean;
  isDirty: boolean;
  isLoading: boolean;
  validateSection: () => { isValid: boolean; errors: ValidationError[]; warnings: ValidationError[] };
  resetData: () => void;
  saveData: () => Promise<void>;
}

/**
 * Factory function to create unified section contexts
 * Replaces all individual section context implementations
 */
export function createUnifiedSectionContext<T extends Record<string, any>>(
  config: SectionConfig<T>
) {
  const {
    sectionName,
    sectionNumber,
    defaultData,
    validateSection,
    transformData,
    debounceMs = 300,
    autoSave = false
  } = config;

  const Context = createContext<SectionContextValue<T> | null>(null);

  const Provider: React.FC<{
    children: React.ReactNode;
    initialData?: Partial<T>;
  }> = ({ children, initialData = {} }) => {
    // State management
    const [data, setData] = useState<T>(() => ({
      ...defaultData,
      ...initialData
    }));
    
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [warnings, setWarnings] = useState<ValidationError[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Validation function with memoization
    const doValidation = useCallback((dataToValidate: T) => {
      if (!validateSection) {
        return { isValid: true, errors: [], warnings: [] };
      }

      const validationErrors = validateSection(dataToValidate);
      const errorList = validationErrors.filter(e => e.severity === 'error');
      const warningList = validationErrors.filter(e => e.severity === 'warning');
      
      return {
        isValid: errorList.length === 0,
        errors: errorList,
        warnings: warningList
      };
    }, [validateSection]);

    // Main validation trigger
    const validateSectionData = useCallback(() => {
      const result = doValidation(data);
      setErrors(result.errors);
      setWarnings(result.warnings);
      return result;
    }, [data, doValidation]);

    // Update data with validation
    const updateData = useCallback((updates: Partial<T> | ((prevData: T) => T)) => {
      setData(prevData => {
        const newData = typeof updates === 'function' 
          ? updates(prevData)
          : { ...prevData, ...updates };

        // Apply transformations if configured
        const transformedData = transformData ? transformData(newData) : newData;
        
        // Mark as dirty
        setIsDirty(true);

        // Trigger validation after state update
        setTimeout(() => {
          const validationResult = doValidation(transformedData);
          setErrors(validationResult.errors);
          setWarnings(validationResult.warnings);
        }, 0);

        logger.debug(`Section data updated`, {
          component: sectionName,
          action: 'data_update',
          metadata: { sectionNumber, hasErrors: errors.length > 0 }
        });

        return transformedData;
      });
    }, [transformData, doValidation, sectionName, sectionNumber, errors.length]);

    // Update specific field by path
    const updateFieldValue = useCallback((path: string, value: any) => {
      setData(prevData => {
        const newData = cloneDeep(prevData);
        set(newData, path, value);
        
        const transformedData = transformData ? transformData(newData) : newData;
        setIsDirty(true);

        // Log field update
        logger.debug(`Field updated: ${path}`, {
          component: sectionName,
          action: 'field_update',
          fieldPath: path,
          metadata: { value: typeof value === 'object' ? JSON.stringify(value) : value }
        });

        // Async validation
        setTimeout(() => {
          const validationResult = doValidation(transformedData);
          setErrors(validationResult.errors);
          setWarnings(validationResult.warnings);
        }, 0);

        return transformedData;
      });
    }, [transformData, doValidation, sectionName]);

    // Reset to default state
    const resetData = useCallback(() => {
      setData(defaultData);
      setErrors([]);
      setWarnings([]);
      setIsDirty(false);
      
      logger.info(`Section data reset`, {
        component: sectionName,
        action: 'data_reset',
        metadata: { sectionNumber }
      });
    }, [defaultData, sectionName, sectionNumber]);

    // Save data (placeholder for actual save implementation)
    const saveData = useCallback(async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would call an API
        // For now, just simulate a save
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsDirty(false);
        
        logger.info(`Section data saved successfully`, {
          component: sectionName,
          action: 'data_save',
          metadata: { sectionNumber }
        });
        
      } catch (error) {
        logger.error(`Failed to save section data`, {
          component: sectionName,
          action: 'data_save_error',
          metadata: { sectionNumber, error: error instanceof Error ? error.message : error }
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    }, [sectionName, sectionNumber]);

    // Auto-save functionality
    useEffect(() => {
      if (!autoSave || !isDirty) return;

      const autoSaveTimer = setTimeout(() => {
        saveData().catch(error => {
          console.warn(`Auto-save failed for ${sectionName}:`, error);
        });
      }, debounceMs * 3); // Auto-save after 3x debounce delay

      return () => clearTimeout(autoSaveTimer);
    }, [isDirty, autoSave, debounceMs, saveData, sectionName]);

    // Computed values
    const isValid = useMemo(() => errors.length === 0, [errors]);

    // Context value
    const contextValue: SectionContextValue<T> = useMemo(() => ({
      data,
      updateData,
      updateFieldValue,
      errors,
      warnings,
      isValid,
      isDirty,
      isLoading,
      validateSection: validateSectionData,
      resetData,
      saveData
    }), [
      data,
      updateData,
      updateFieldValue,
      errors,
      warnings,
      isValid,
      isDirty,
      isLoading,
      validateSectionData,
      resetData,
      saveData
    ]);

    return (
      <Context.Provider value={contextValue}>
        {children}
      </Context.Provider>
    );
  };

  // Hook to use the context
  const useContext = (): SectionContextValue<T> => {
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

// Utility to create section-specific hooks with additional utilities
export function createSectionHook<T extends Record<string, any>>(
  baseHook: () => SectionContextValue<T>,
  sectionNumber: number,
  additionalUtilities?: (context: SectionContextValue<T>) => Record<string, any>
) {
  return () => {
    const baseContext = baseHook();
    const additional = additionalUtilities ? additionalUtilities(baseContext) : {};
    
    return {
      ...baseContext,
      ...additional,
      sectionNumber,
      // Common utilities
      getFieldValue: (path: string) => get(baseContext.data, path),
      hasFieldError: (path: string) => baseContext.errors.some(e => e.field === path),
      getFieldError: (path: string) => baseContext.errors.find(e => e.field === path)?.message,
      isFieldRequired: (path: string) => baseContext.errors.some(e => e.field === path && e.rule === 'required'),
    };
  };
}