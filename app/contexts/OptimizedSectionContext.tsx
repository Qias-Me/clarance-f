import React, { createContext, useContext, useCallback, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { ValidationResult, FieldConfig } from '../types/form.types';
import { useSmartValidation } from '../hooks/useSmartValidation';
import { logger } from '../services/Logger';

interface FieldState {
  id: string;
  sectionId: string;
  value: any;
  isDirty: boolean;
  isValid: boolean;
  error?: string;
  lastModified: number;
}

interface SectionContextValue<T = any> {
  // Field operations
  getField: (fieldId: string) => FieldState | undefined;
  updateField: (fieldId: string, value: any) => void;
  batchUpdateFields: (updates: Array<{ fieldId: string; value: any }>) => void;
  
  // Validation
  validateField: (fieldId: string) => Promise<ValidationResult>;
  validateSection: () => Promise<boolean>;
  
  // State accessors
  getSectionData: () => T;
  isValid: boolean;
  isDirty: boolean;
  fieldErrors: Record<string, string>;
  
  // Actions
  resetSection: () => void;
  submitSection: () => Promise<void>;
}

const SectionContext = createContext<SectionContextValue | undefined>(undefined);

interface OptimizedSectionProviderProps {
  sectionId: string;
  children: React.ReactNode;
  initialData?: any;
  fields: FieldConfig[];
}

export function OptimizedSectionProvider({
  sectionId,
  children,
  initialData,
  fields
}: OptimizedSectionProviderProps) {
  const dispatch = useAppDispatch();
  const updateQueue = useRef<Array<{ fieldId: string; value: any }>>([]);
  const updateTimer = useRef<NodeJS.Timeout>();
  
  const { validateField: smartValidate, validationState, isAllValid } = useSmartValidation();

  // Memoized selectors
  const fieldSelectors = useMemo(() => ({
    getField: (fieldId: string) => (state: any) => {
      // This would connect to your Redux store
      return state.form?.fields?.[fieldId];
    },
    getSectionFields: (state: any) => {
      // Get all fields for this section
      return state.form?.fieldsBySection?.[sectionId] || [];
    }
  }), [sectionId]);

  // Get field from store
  const getField = useCallback((fieldId: string): FieldState | undefined => {
    // In real implementation, this would use Redux selector
    return {
      id: fieldId,
      sectionId,
      value: initialData?.[fieldId],
      isDirty: false,
      isValid: true,
      lastModified: Date.now()
    };
  }, [sectionId, initialData]);

  // Batch update processor
  const processBatchUpdates = useCallback(() => {
    if (updateQueue.current.length === 0) return;
    
    const updates = [...updateQueue.current];
    updateQueue.current = [];
    
    // Dispatch batch update to Redux
    logger.debug(`Batch updating ${updates.length} fields`, sectionId);
    
    // dispatch(batchUpdateFields({ sectionId, updates }));
  }, [sectionId]);

  // Update field with batching
  const updateField = useCallback((fieldId: string, value: any) => {
    updateQueue.current.push({ fieldId, value });
    
    // Clear existing timer
    if (updateTimer.current) {
      clearTimeout(updateTimer.current);
    }
    
    // Set new timer for batch processing
    updateTimer.current = setTimeout(() => {
      processBatchUpdates();
    }, 50); // Batch updates every 50ms
  }, [processBatchUpdates]);

  // Batch update multiple fields at once
  const batchUpdateFields = useCallback((updates: Array<{ fieldId: string; value: any }>) => {
    updateQueue.current.push(...updates);
    processBatchUpdates();
  }, [processBatchUpdates]);

  // Validate a single field
  const validateField = useCallback(async (fieldId: string): Promise<ValidationResult> => {
    const field = fields.find(f => f.name === fieldId);
    if (!field) {
      return { isValid: false, error: 'Field not found' };
    }
    
    const fieldState = getField(fieldId);
    return smartValidate(fieldState?.value, field);
  }, [fields, getField, smartValidate]);

  // Validate entire section
  const validateSection = useCallback(async (): Promise<boolean> => {
    const validationPromises = fields.map(field => 
      validateField(field.name)
    );
    
    const results = await Promise.all(validationPromises);
    return results.every(r => r.isValid);
  }, [fields, validateField]);

  // Get section data
  const getSectionData = useCallback(() => {
    const data: any = {};
    fields.forEach(field => {
      const fieldState = getField(field.name);
      data[field.name] = fieldState?.value;
    });
    return data;
  }, [fields, getField]);

  // Reset section
  const resetSection = useCallback(() => {
    logger.info('Resetting section', sectionId);
    // dispatch(resetSection(sectionId));
  }, [sectionId]);

  // Submit section
  const submitSection = useCallback(async () => {
    const isValid = await validateSection();
    if (!isValid) {
      throw new Error('Section validation failed');
    }
    
    logger.info('Submitting section', sectionId);
    // dispatch(submitSection(sectionId));
  }, [sectionId, validateSection]);

  // Compute field errors
  const fieldErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    Object.entries(validationState).forEach(([fieldId, state]) => {
      if (state.error) {
        errors[fieldId] = state.error;
      }
    });
    return errors;
  }, [validationState]);

  // Check if section is dirty
  const isDirty = useMemo(() => {
    return fields.some(field => {
      const fieldState = getField(field.name);
      return fieldState?.isDirty;
    });
  }, [fields, getField]);

  const contextValue: SectionContextValue = useMemo(() => ({
    getField,
    updateField,
    batchUpdateFields,
    validateField,
    validateSection,
    getSectionData,
    isValid: isAllValid,
    isDirty,
    fieldErrors,
    resetSection,
    submitSection
  }), [
    getField,
    updateField,
    batchUpdateFields,
    validateField,
    validateSection,
    getSectionData,
    isAllValid,
    isDirty,
    fieldErrors,
    resetSection,
    submitSection
  ]);

  return (
    <SectionContext.Provider value={contextValue}>
      {children}
    </SectionContext.Provider>
  );
}

export function useOptimizedSection<T = any>(sectionId: string): SectionContextValue<T> {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error('useOptimizedSection must be used within OptimizedSectionProvider');
  }
  return context as SectionContextValue<T>;
}