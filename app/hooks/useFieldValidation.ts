import { useState, useCallback, useMemo } from 'react';

export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule[];
}

interface ValidationErrors {
  [fieldName: string]: string[];
}

export const useFieldValidation = (validationRules: FieldValidation) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validateField = useCallback((fieldName: string, value: any): string[] => {
    const rules = validationRules[fieldName];
    if (!rules) return [];

    const fieldErrors: string[] = [];
    for (const rule of rules) {
      if (!rule.test(value)) {
        fieldErrors.push(rule.message);
      }
    }
    return fieldErrors;
  }, [validationRules]);

  const validateAllFields = useCallback((data: Record<string, any>): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const fieldErrors = validateField(fieldName, data[fieldName]);
      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, validateField]);

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: [error]
    }));
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const markFieldTouched = useCallback((fieldName: string) => {
    setTouched(prev => new Set(prev).add(fieldName));
  }, []);

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched(new Set());
  }, []);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  return {
    errors,
    touched,
    validateField,
    validateAllFields,
    setFieldError,
    clearFieldError,
    markFieldTouched,
    resetValidation,
    hasErrors,
    getFieldError: (fieldName: string) => errors[fieldName]?.[0] || null,
    isFieldTouched: (fieldName: string) => touched.has(fieldName)
  };
};