import { useState, useCallback, useMemo, useRef } from 'react';
import { FieldConfig, ValidationResult } from '../types/form.types';
import { useDebouncedCallback } from './useDebounce';

export type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid' | 'error';

interface SmartValidationOptions {
  debounceTime?: number;
  validateOnMount?: boolean;
  validateOnBlur?: boolean;
  cacheResults?: boolean;
}

interface FieldValidationState {
  state: ValidationState;
  error?: string;
  warnings?: string[];
  lastValidated?: Date;
}

export function useSmartValidation(options: SmartValidationOptions = {}) {
  const {
    validateOnMount = false,
    validateOnBlur = true,
    cacheResults = true
  } = options;

  const [validationState, setValidationState] = useState<Record<string, FieldValidationState>>({});
  const validationCache = useRef<Map<string, ValidationResult>>(new Map());

  // Get debounce time based on field type complexity
  const getDebounceTime = useCallback((fieldType: string): number => {
    const debounceMap: Record<string, number> = {
      'employment-history': 1000,
      'address': 500,
      'date-range': 400,
      'textarea': 500,
      'select': 200,
      'text': 300,
      'number': 300,
      'date': 200,
      'checkbox': 100
    };
    
    return options.debounceTime || debounceMap[fieldType] || 300;
  }, [options.debounceTime]);

  // Core validation function
  const performValidation = useCallback(async (
    value: any,
    config: FieldConfig
  ): Promise<ValidationResult> => {
    // Check cache first
    if (cacheResults) {
      const cacheKey = `${config.name}:${JSON.stringify(value)}`;
      const cached = validationCache.current.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Required field validation
      if (config.required && !value) {
        errors.push(`${config.label} is required`);
      }

      // Type-specific validation
      if (config.validation) {
        // Min/max length for text fields
        if (config.type === 'text' || config.type === 'textarea') {
          const textValue = String(value || '');
          
          if (config.validation.minLength && textValue.length < config.validation.minLength) {
            errors.push(`${config.label} must be at least ${config.validation.minLength} characters`);
          }
          
          if (config.validation.maxLength && textValue.length > config.validation.maxLength) {
            errors.push(`${config.label} must be no more than ${config.validation.maxLength} characters`);
          }
        }

        // Pattern validation
        if (config.validation.pattern && value) {
          const pattern = new RegExp(config.validation.pattern);
          if (!pattern.test(String(value))) {
            errors.push(`${config.label} format is invalid`);
          }
        }

        // Custom validation function
        if (config.validation.custom) {
          const customResult = config.validation.custom(value);
          if (typeof customResult === 'string') {
            errors.push(customResult);
          } else if (customResult === false) {
            errors.push(`${config.label} validation failed`);
          }
        }
      }

      // Type-specific validations
      switch (config.type) {
        case 'date':
          if (value && !isValidDate(value)) {
            errors.push(`${config.label} must be a valid date`);
          }
          break;
        
        case 'number':
          if (value !== null && value !== undefined && isNaN(Number(value))) {
            errors.push(`${config.label} must be a valid number`);
          }
          break;
        
        case 'employment-history':
          validateEmploymentHistory(value, errors, warnings);
          break;
        
        case 'address':
          validateAddress(value, errors, warnings);
          break;
      }

      const result: ValidationResult = {
        isValid: errors.length === 0,
        error: errors[0],
        warnings
      };

      // Cache the result
      if (cacheResults) {
        const cacheKey = `${config.name}:${JSON.stringify(value)}`;
        validationCache.current.set(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.error('Validation error:', error);
      return {
        isValid: false,
        error: 'Validation failed due to an error'
      };
    }
  }, [cacheResults]);

  // Create debounced validators for each field
  const debouncedValidators = useRef<Map<string, any>>(new Map());

  const validateField = useCallback(async (
    value: any,
    config: FieldConfig
  ): Promise<ValidationResult> => {
    const fieldName = config.name;
    
    // Update state to validating
    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        state: 'validating',
        lastValidated: new Date()
      }
    }));

    // Get or create debounced validator for this field
    const debounceTime = getDebounceTime(config.type);
    
    if (!debouncedValidators.current.has(fieldName)) {
      const [debouncedFn] = useDebouncedCallback(
        async (val: any, cfg: FieldConfig) => {
          const result = await performValidation(val, cfg);
          
          setValidationState(prev => ({
            ...prev,
            [fieldName]: {
              state: result.isValid ? 'valid' : 'invalid',
              error: result.error,
              warnings: result.warnings,
              lastValidated: new Date()
            }
          }));
          
          return result;
        },
        debounceTime
      );
      
      debouncedValidators.current.set(fieldName, debouncedFn);
    }

    const debouncedValidator = debouncedValidators.current.get(fieldName);
    return debouncedValidator(value, config);
  }, [getDebounceTime, performValidation]);

  // Batch validation for multiple fields
  const validateFields = useCallback(async (
    fields: Array<{ value: any; config: FieldConfig }>
  ): Promise<Record<string, ValidationResult>> => {
    const results: Record<string, ValidationResult> = {};
    
    // Run validations in parallel
    const validationPromises = fields.map(async ({ value, config }) => {
      const result = await performValidation(value, config);
      results[config.name] = result;
      
      setValidationState(prev => ({
        ...prev,
        [config.name]: {
          state: result.isValid ? 'valid' : 'invalid',
          error: result.error,
          warnings: result.warnings,
          lastValidated: new Date()
        }
      }));
    });

    await Promise.all(validationPromises);
    
    return results;
  }, [performValidation]);

  // Clear validation state
  const clearValidation = useCallback((fieldName?: string) => {
    if (fieldName) {
      setValidationState(prev => {
        const newState = { ...prev };
        delete newState[fieldName];
        return newState;
      });
      
      // Clear cache for this field
      if (cacheResults) {
        const keysToDelete: string[] = [];
        validationCache.current.forEach((_, key) => {
          if (key.startsWith(`${fieldName}:`)) {
            keysToDelete.push(key);
          }
        });
        keysToDelete.forEach(key => validationCache.current.delete(key));
      }
    } else {
      // Clear all
      setValidationState({});
      validationCache.current.clear();
    }
  }, [cacheResults]);

  // Get field validation state
  const getFieldState = useCallback((fieldName: string): FieldValidationState => {
    return validationState[fieldName] || { state: 'idle' };
  }, [validationState]);

  // Check if all fields are valid
  const isAllValid = useMemo(() => {
    return Object.values(validationState).every(
      state => state.state === 'valid' || state.state === 'idle'
    );
  }, [validationState]);

  return {
    validateField,
    validateFields,
    clearValidation,
    getFieldState,
    validationState,
    isAllValid
  };
}

// Helper validation functions
function isValidDate(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

function validateEmploymentHistory(value: any[], errors: string[], warnings: string[]): void {
  if (!Array.isArray(value)) return;
  
  value.forEach((employment, index) => {
    if (!employment.employer) {
      errors.push(`Employment #${index + 1}: Employer name is required`);
    }
    if (!employment.position) {
      errors.push(`Employment #${index + 1}: Position is required`);
    }
    if (!employment.startDate) {
      errors.push(`Employment #${index + 1}: Start date is required`);
    }
    
    // Check for date consistency
    if (employment.startDate && employment.endDate) {
      const start = new Date(employment.startDate);
      const end = new Date(employment.endDate);
      
      if (end < start) {
        errors.push(`Employment #${index + 1}: End date cannot be before start date`);
      }
    }
    
    // Warnings for gaps
    if (index > 0) {
      const prevEnd = new Date(value[index - 1].endDate || new Date());
      const currentStart = new Date(employment.startDate);
      const gapDays = Math.floor((currentStart.getTime() - prevEnd.getTime()) / (1000 * 60 * 60 * 24));
      
      if (gapDays > 30) {
        warnings.push(`Gap of ${gapDays} days between employment #${index} and #${index + 1}`);
      }
    }
  });
}

function validateAddress(value: any, errors: string[], warnings: string[]): void {
  if (!value) return;
  
  if (!value.street) {
    errors.push('Street address is required');
  }
  if (!value.city) {
    errors.push('City is required');
  }
  if (!value.state) {
    errors.push('State is required');
  }
  if (!value.zip) {
    errors.push('ZIP code is required');
  } else if (!/^\d{5}(-\d{4})?$/.test(value.zip)) {
    errors.push('ZIP code must be in format XXXXX or XXXXX-XXXX');
  }
}