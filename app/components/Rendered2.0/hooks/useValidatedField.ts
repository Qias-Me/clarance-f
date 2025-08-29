/**
 * Custom hook for validated form fields
 * Provides field state management with validation
 */

import { useState, useCallback, useMemo } from 'react';

export interface FieldConfig {
  name: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'select' | 'email' | 'number';
  placeholder?: string;
  helpText?: string;
  validation?: (value: string) => string | null;
}

export interface UseValidatedFieldReturn {
  value: string;
  error: string | null;
  touched: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleBlur: () => void;
  validate: () => boolean;
  reset: () => void;
  fieldProps: {
    id: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    'data-testid': string;
  };
}

export const useValidatedField = (
  config: FieldConfig,
  initialValue: string = ''
): UseValidatedFieldReturn => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validate = useCallback((): boolean => {
    if (config.required && !value.trim()) {
      setError(`${config.label} is required`);
      return false;
    }

    if (config.validation) {
      const validationError = config.validation(value);
      if (validationError) {
        setError(validationError);
        return false;
      }
    }

    setError(null);
    return true;
  }, [value, config.required, config.label, config.validation]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setValue(e.target.value);
    if (touched) {
      // Validate on change if field has been touched
      validate();
    }
  }, [touched, validate]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    validate();
  }, [validate]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setTouched(false);
  }, [initialValue]);

  const fieldProps = useMemo(() => ({
    id: config.name,
    name: config.name,
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    'data-testid': `${config.name}-field`
  }), [config.name, value, handleChange, handleBlur]);

  return {
    value,
    error,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    fieldProps
  };
};