/**
 * Validation Types
 * 
 * Type definitions for validation system
 */

export interface ValidationError {
  field?: string;
  message: string;
  code?: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  field?: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
  metadata?: Record<string, any>;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => ValidationResult;
}

export interface SectionValidation {
  fields: Record<string, FieldValidation>;
  crossField?: (data: any) => ValidationResult;
}

export type ValidationRule<T = any> = (value: T) => ValidationResult;

export type AsyncValidationRule<T = any> = (value: T) => Promise<ValidationResult>;