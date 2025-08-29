/**
 * Section Validation Utility
 * 
 * Shared validation logic for all form sections.
 * Eliminates duplication and provides consistent validation patterns.
 */

import { FieldBase } from '../../api/interfaces/section-interfaces/base';

export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any, context?: any) => boolean;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Validates a single field against a validation rule
 */
export function validateField(
  field: FieldBase | undefined,
  rule: ValidationRule,
  context?: any
): FieldValidationResult {
  const value = field?.value;

  // Required field validation
  if (rule.required && (!value || value === '')) {
    return {
      isValid: false,
      error: rule.message || `${rule.field} is required`
    };
  }

  // Skip other validations if field is empty and not required
  if (!value || value === '') {
    return { isValid: true };
  }

  // String validations
  if (typeof value === 'string') {
    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      return {
        isValid: false,
        error: rule.message || `${rule.field} must be at least ${rule.minLength} characters`
      };
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      return {
        isValid: false,
        error: rule.message || `${rule.field} must not exceed ${rule.maxLength} characters`
      };
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return {
        isValid: false,
        error: rule.message || `${rule.field} format is invalid`
      };
    }
  }

  // Custom validation
  if (rule.custom && !rule.custom(value, context)) {
    return {
      isValid: false,
      error: rule.message || `${rule.field} validation failed`
    };
  }

  return { isValid: true };
}

/**
 * Validates multiple fields against validation rules
 */
export function validateFields(
  fields: Record<string, FieldBase | undefined>,
  rules: ValidationRule[],
  context?: any
): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  let isValid = true;

  for (const rule of rules) {
    const field = fields[rule.field];
    const result = validateField(field, rule, context);

    if (!result.isValid) {
      isValid = false;
      if (result.error) {
        errors[rule.field] = result.error;
      }
    }

    if (result.warning) {
      warnings[rule.field] = result.warning;
    }
  }

  return {
    isValid,
    errors,
    warnings: Object.keys(warnings).length > 0 ? warnings : undefined
  };
}

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{3}-\d{3}-\d{4}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  SSN: /^\d{3}-\d{2}-\d{4}$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  ALPHA_ONLY: /^[a-zA-Z\s]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  URL: /^https?:\/\/.+$/
};

/**
 * Common validation functions
 */
export const ValidationFunctions = {
  isValidDate: (value: string): boolean => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  },

  isValidAge: (value: string, minAge = 0, maxAge = 120): boolean => {
    const birthDate = new Date(value);
    if (isNaN(birthDate.getTime())) return false;

    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    const actualAge = monthDiff < 0 || 
      (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
      ? age - 1 
      : age;

    return actualAge >= minAge && actualAge <= maxAge;
  },

  isFutureDate: (value: string): boolean => {
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  },

  isPastDate: (value: string): boolean => {
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  },

  isDateInRange: (value: string, minDate: string, maxDate: string): boolean => {
    const date = new Date(value);
    const min = new Date(minDate);
    const max = new Date(maxDate);
    return date >= min && date <= max;
  }
};

/**
 * Creates a validation rule builder for fluent API
 */
export class ValidationRuleBuilder {
  private rule: ValidationRule;

  constructor(field: string) {
    this.rule = { field };
  }

  required(message?: string): this {
    this.rule.required = true;
    if (message) this.rule.message = message;
    return this;
  }

  minLength(length: number, message?: string): this {
    this.rule.minLength = length;
    if (message) this.rule.message = message;
    return this;
  }

  maxLength(length: number, message?: string): this {
    this.rule.maxLength = length;
    if (message) this.rule.message = message;
    return this;
  }

  pattern(pattern: RegExp, message?: string): this {
    this.rule.pattern = pattern;
    if (message) this.rule.message = message;
    return this;
  }

  custom(fn: (value: any, context?: any) => boolean, message?: string): this {
    this.rule.custom = fn;
    if (message) this.rule.message = message;
    return this;
  }

  build(): ValidationRule {
    return this.rule;
  }
}

/**
 * Helper to create validation rules
 */
export function createRule(field: string): ValidationRuleBuilder {
  return new ValidationRuleBuilder(field);
}

/**
 * Batch validation helper for sections with multiple entries
 */
export function validateEntries<T>(
  entries: T[],
  validateEntry: (entry: T, index: number) => ValidationResult
): ValidationResult {
  const allErrors: Record<string, string> = {};
  const allWarnings: Record<string, string> = {};
  let isValid = true;

  entries.forEach((entry, index) => {
    const result = validateEntry(entry, index);
    
    if (!result.isValid) {
      isValid = false;
    }

    // Prefix errors with entry index
    Object.entries(result.errors).forEach(([field, error]) => {
      allErrors[`entry_${index}_${field}`] = error;
    });

    if (result.warnings) {
      Object.entries(result.warnings).forEach(([field, warning]) => {
        allWarnings[`entry_${index}_${field}`] = warning;
      });
    }
  });

  return {
    isValid,
    errors: allErrors,
    warnings: Object.keys(allWarnings).length > 0 ? allWarnings : undefined
  };
}