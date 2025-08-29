/**
 * Shared utilities for all sections
 * Improves type safety and reduces code duplication
 */

import { produce, Draft } from 'immer';

// ============================================================================
// TYPE-SAFE FIELD TYPES
// ============================================================================

export interface Field<T> {
  value: T;
  error?: string;
  touched?: boolean;
  required?: boolean;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}

export type FieldValue<T> = T extends Field<infer V> ? V : never;

// Type-safe field factory
export function createField<T>(
  value: T,
  options: Partial<Omit<Field<T>, 'value'>> = {}
): Field<T> {
  return {
    value,
    ...options
  };
}

// ============================================================================
// PERFORMANCE-OPTIMIZED STATE UPDATES
// ============================================================================

/**
 * Update nested field values without deep cloning
 * Uses Immer for immutability with better performance than lodash.cloneDeep
 */
export function updateNestedField<T>(
  state: T,
  path: string,
  value: unknown
): T {
  return produce(state, (draft: Draft<T>) => {
    const keys = path.split('.');
    let current: any = draft;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  });
}

/**
 * Batch update multiple fields efficiently
 */
export function batchUpdateFields<T>(
  state: T,
  updates: Record<string, unknown>
): T {
  return produce(state, (draft: Draft<T>) => {
    Object.entries(updates).forEach(([path, value]) => {
      const keys = path.split('.');
      let current: any = draft;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current)) {
          current[key] = {};
        }
        current = current[key];
      }
      
      current[keys[keys.length - 1]] = value;
    });
  });
}

// ============================================================================
// TYPE-SAFE FIELD ACCESS
// ============================================================================

/**
 * Get nested field value with type safety
 */
export function getFieldValue<T, V = unknown>(
  obj: T,
  path: string
): V | undefined {
  const keys = path.split('.');
  let current: any = obj;
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }
  
  return current as V;
}

/**
 * Type-safe field value extractor for Field<T> types
 */
export function extractFieldValue<T>(field: Field<T> | undefined): T | undefined {
  return field?.value;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class ValidationBuilder {
  private errors: ValidationError[] = [];
  private warnings: ValidationError[] = [];
  
  addError(field: string, message: string, code?: string): this {
    this.errors.push({ field, message, severity: 'error', code });
    return this;
  }
  
  addWarning(field: string, message: string, code?: string): this {
    this.warnings.push({ field, message, severity: 'warning', code });
    return this;
  }
  
  validateRequired<T>(field: string, value: T | undefined, label?: string): this {
    if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
      this.addError(field, `${label || field} is required`, 'REQUIRED');
    }
    return this;
  }
  
  validateEmail(field: string, value: string | undefined, label?: string): this {
    if (value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.addError(field, `${label || field} must be a valid email`, 'INVALID_EMAIL');
      }
    }
    return this;
  }
  
  validatePhone(field: string, value: string | undefined, label?: string): this {
    if (value) {
      const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
      if (!phoneRegex.test(value)) {
        this.addWarning(field, `${label || field} should be in format XXX-XXX-XXXX`, 'INVALID_PHONE');
      }
    }
    return this;
  }
  
  validateSSN(field: string, value: string | undefined, label?: string): this {
    if (value) {
      const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
      if (!ssnRegex.test(value)) {
        this.addError(field, `${label || field} must be in format XXX-XX-XXXX`, 'INVALID_SSN');
      }
    }
    return this;
  }
  
  validateDate(field: string, value: string | undefined, label?: string): this {
    if (value && isNaN(Date.parse(value))) {
      this.addError(field, `${label || field} must be a valid date`, 'INVALID_DATE');
    }
    return this;
  }
  
  validateDateRange(
    fromField: string,
    toField: string,
    fromValue: string | undefined,
    toValue: string | undefined,
    labels?: { from?: string; to?: string }
  ): this {
    if (fromValue && toValue) {
      const fromDate = new Date(fromValue);
      const toDate = new Date(toValue);
      if (fromDate > toDate) {
        this.addError(
          toField,
          `${labels?.to || 'To date'} must be after ${labels?.from || 'from date'}`,
          'INVALID_DATE_RANGE'
        );
      }
    }
    return this;
  }
  
  validateMaxLength(field: string, value: string | undefined, maxLength: number, label?: string): this {
    if (value && value.length > maxLength) {
      this.addError(
        field,
        `${label || field} must be ${maxLength} characters or less`,
        'MAX_LENGTH'
      );
    }
    return this;
  }
  
  validateMinLength(field: string, value: string | undefined, minLength: number, label?: string): this {
    if (value && value.length < minLength) {
      this.addError(
        field,
        `${label || field} must be at least ${minLength} characters`,
        'MIN_LENGTH'
      );
    }
    return this;
  }
  
  validatePattern(field: string, value: string | undefined, pattern: RegExp, message: string): this {
    if (value && !pattern.test(value)) {
      this.addError(field, message, 'PATTERN_MISMATCH');
    }
    return this;
  }
  
  validateCustom(condition: boolean, field: string, message: string, code?: string): this {
    if (condition) {
      this.addError(field, message, code || 'CUSTOM');
    }
    return this;
  }
  
  build(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Convert validation errors to a field error map for easy access
 */
export function errorsToMap(errors: ValidationError[]): Record<string, string> {
  const map: Record<string, string> = {};
  errors.forEach(error => {
    if (error.severity === 'error') {
      map[error.field] = error.message;
    }
  });
  return map;
}

/**
 * Focus the first field with an error
 */
export function focusFirstError(): void {
  const firstErrorField = document.querySelector('[aria-invalid="true"]');
  if (firstErrorField instanceof HTMLElement) {
    firstErrorField.focus();
    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * Deep equality check without JSON.stringify (more performant)
 */
export function isDeepEqual(obj1: unknown, obj2: unknown): boolean {
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

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for rate limiting
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ============================================================================
// FORM ARRAY UTILITIES
// ============================================================================

export interface FormArrayActions<T> {
  add: (item: T) => void;
  remove: (index: number) => void;
  update: (index: number, item: Partial<T>) => void;
  move: (from: number, to: number) => void;
  clear: () => void;
}

/**
 * Create form array actions for managing repeating sections
 */
export function createFormArrayActions<T>(
  items: T[],
  setItems: (items: T[]) => void
): FormArrayActions<T> {
  return {
    add: (item: T) => setItems([...items, item]),
    remove: (index: number) => setItems(items.filter((_, i) => i !== index)),
    update: (index: number, updates: Partial<T>) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], ...updates };
      setItems(newItems);
    },
    move: (from: number, to: number) => {
      const newItems = [...items];
      const [item] = newItems.splice(from, 1);
      newItems.splice(to, 0, item);
      setItems(newItems);
    },
    clear: () => setItems([])
  };
}

// ============================================================================
// ACCESSIBILITY UTILITIES
// ============================================================================

/**
 * Generate unique IDs for form fields
 */
export function generateFieldId(section: string, field: string, index?: number): string {
  const parts = ['field', section, field];
  if (index !== undefined) {
    parts.push(index.toString());
  }
  return parts.join('-');
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number (XXX-XXX-XXXX)',
  INVALID_SSN: 'Please enter a valid SSN (XXX-XX-XXXX)',
  INVALID_DATE: 'Please enter a valid date',
  INVALID_DATE_RANGE: 'End date must be after start date',
  MAX_LENGTH: 'This field exceeds the maximum length',
  MIN_LENGTH: 'This field does not meet the minimum length',
  PATTERN_MISMATCH: 'This field does not match the required format'
} as const;

export const FIELD_LIMITS = {
  NAME: 100,
  EMAIL: 254,
  PHONE: 12,
  SSN: 11,
  ADDRESS_LINE: 200,
  CITY: 100,
  ZIP: 10,
  DESCRIPTION: 1000
} as const;