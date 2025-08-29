/**
 * Section Validation Service
 * 
 * Centralized validation logic for all SF-86 sections
 */

import type { ValidationResult, ValidationError, ValidationWarning } from '../types/validation.types';
import type { Field } from '../../api/interfaces/formDefinition2.0';
import { logger } from './Logger';

export interface ValidationRule {
  field: string;
  rules: Array<{
    type: 'required' | 'email' | 'phone' | 'ssn' | 'date' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
    value?: any;
    message?: string;
    validator?: (value: any) => boolean;
  }>;
}

export interface SectionValidationConfig {
  sectionNumber: number;
  rules: ValidationRule[];
  crossFieldValidation?: (data: any) => ValidationResult;
  conditionalRules?: Array<{
    condition: (data: any) => boolean;
    rules: ValidationRule[];
  }>;
}

/**
 * Common validation patterns
 */
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\d{10}$/,
  ssn: /^\d{9}$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s]+$/
};

/**
 * Section Validation Service
 */
export class SectionValidationService {
  private static instance: SectionValidationService;
  private validationConfigs = new Map<number, SectionValidationConfig>();
  private validationCache = new Map<string, ValidationResult>();
  
  private constructor() {}
  
  static getInstance(): SectionValidationService {
    if (!SectionValidationService.instance) {
      SectionValidationService.instance = new SectionValidationService();
    }
    return SectionValidationService.instance;
  }
  
  /**
   * Register validation configuration for a section
   */
  registerSection(config: SectionValidationConfig): void {
    this.validationConfigs.set(config.sectionNumber, config);
    logger.info(`Registered validation for section ${config.sectionNumber}`, 'ValidationService');
  }
  
  /**
   * Validate a single field
   */
  validateField(value: any, rules: ValidationRule['rules']): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    for (const rule of rules) {
      let isValid = true;
      let message = rule.message;
      
      switch (rule.type) {
        case 'required':
          const fieldValue = this.extractValue(value);
          isValid = fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
          if (typeof fieldValue === 'string') {
            isValid = isValid && fieldValue.trim().length > 0;
          }
          message = message || 'This field is required';
          break;
          
        case 'email':
          isValid = !value || VALIDATION_PATTERNS.email.test(this.extractValue(value));
          message = message || 'Please enter a valid email address';
          break;
          
        case 'phone':
          const phoneValue = this.extractValue(value)?.replace(/\D/g, '');
          isValid = !phoneValue || VALIDATION_PATTERNS.phone.test(phoneValue);
          message = message || 'Please enter a valid 10-digit phone number';
          break;
          
        case 'ssn':
          const ssnValue = this.extractValue(value)?.replace(/\D/g, '');
          isValid = !ssnValue || (VALIDATION_PATTERNS.ssn.test(ssnValue) && 
            !['000', '666', '900', '999'].includes(ssnValue.substring(0, 3)));
          message = message || 'Please enter a valid SSN';
          break;
          
        case 'date':
          const dateValue = this.extractValue(value);
          if (dateValue) {
            const date = new Date(dateValue);
            isValid = !isNaN(date.getTime());
            
            // Additional date validations
            if (isValid && rule.value) {
              const now = new Date();
              switch (rule.value) {
                case 'past':
                  isValid = date < now;
                  message = message || 'Date must be in the past';
                  break;
                case 'future':
                  isValid = date > now;
                  message = message || 'Date must be in the future';
                  break;
                case 'adult':
                  const eighteenYearsAgo = new Date();
                  eighteenYearsAgo.setFullYear(now.getFullYear() - 18);
                  isValid = date <= eighteenYearsAgo;
                  message = message || 'Must be at least 18 years old';
                  break;
              }
            }
          }
          message = message || 'Please enter a valid date';
          break;
          
        case 'minLength':
          const minValue = this.extractValue(value);
          isValid = !minValue || minValue.length >= rule.value;
          message = message || `Must be at least ${rule.value} characters`;
          break;
          
        case 'maxLength':
          const maxValue = this.extractValue(value);
          isValid = !maxValue || maxValue.length <= rule.value;
          message = message || `Must be no more than ${rule.value} characters`;
          break;
          
        case 'pattern':
          const patternValue = this.extractValue(value);
          isValid = !patternValue || new RegExp(rule.value).test(patternValue);
          message = message || 'Invalid format';
          break;
          
        case 'custom':
          if (rule.validator) {
            isValid = rule.validator(value);
            message = message || 'Validation failed';
          }
          break;
      }
      
      if (!isValid) {
        errors.push({ message });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Validate an entire section
   */
  validateSection(sectionNumber: number, data: any): ValidationResult {
    const cacheKey = `${sectionNumber}-${JSON.stringify(data)}`;
    
    // Check cache
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }
    
    const config = this.validationConfigs.get(sectionNumber);
    if (!config) {
      logger.warn(`No validation config for section ${sectionNumber}`, 'ValidationService');
      return { isValid: true };
    }
    
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Field-level validation
    for (const rule of config.rules) {
      const value = this.getNestedValue(data, rule.field);
      const result = this.validateField(value, rule.rules);
      
      result.errors?.forEach(error => {
        errors.push({
          ...error,
          field: rule.field
        });
      });
      
      result.warnings?.forEach(warning => {
        warnings.push({
          ...warning,
          field: rule.field
        });
      });
    }
    
    // Conditional rules
    if (config.conditionalRules) {
      for (const conditionalRule of config.conditionalRules) {
        if (conditionalRule.condition(data)) {
          for (const rule of conditionalRule.rules) {
            const value = this.getNestedValue(data, rule.field);
            const result = this.validateField(value, rule.rules);
            
            result.errors?.forEach(error => {
              errors.push({
                ...error,
                field: rule.field
              });
            });
            
            result.warnings?.forEach(warning => {
              warnings.push({
                ...warning,
                field: rule.field
              });
            });
          }
        }
      }
    }
    
    // Cross-field validation
    if (config.crossFieldValidation) {
      const crossResult = config.crossFieldValidation(data);
      if (!crossResult.isValid) {
        crossResult.errors?.forEach(error => errors.push(error));
        crossResult.warnings?.forEach(warning => warnings.push(warning));
      }
    }
    
    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings
    };
    
    // Cache result
    this.validationCache.set(cacheKey, result);
    
    // Clear old cache entries if too many
    if (this.validationCache.size > 100) {
      const firstKey = this.validationCache.keys().next().value;
      this.validationCache.delete(firstKey);
    }
    
    return result;
  }
  
  /**
   * Extract value from Field or plain value
   */
  private extractValue(value: any): any {
    if (value && typeof value === 'object' && 'value' in value) {
      return value.value;
    }
    return value;
  }
  
  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }
  
  /**
   * Clear validation cache
   */
  clearCache(sectionNumber?: number): void {
    if (sectionNumber) {
      const keysToDelete: string[] = [];
      this.validationCache.forEach((_, key) => {
        if (key.startsWith(`${sectionNumber}-`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.validationCache.delete(key));
    } else {
      this.validationCache.clear();
    }
  }
  
  /**
   * Common validation rules for reuse
   */
  static readonly CommonRules = {
    requiredText: (fieldName: string): ValidationRule => ({
      field: fieldName,
      rules: [{ type: 'required' }]
    }),
    
    requiredEmail: (fieldName: string): ValidationRule => ({
      field: fieldName,
      rules: [
        { type: 'required' },
        { type: 'email' }
      ]
    }),
    
    requiredPhone: (fieldName: string): ValidationRule => ({
      field: fieldName,
      rules: [
        { type: 'required' },
        { type: 'phone' }
      ]
    }),
    
    requiredSSN: (fieldName: string): ValidationRule => ({
      field: fieldName,
      rules: [
        { type: 'required' },
        { type: 'ssn' }
      ]
    }),
    
    requiredDate: (fieldName: string, dateType?: 'past' | 'future' | 'adult'): ValidationRule => ({
      field: fieldName,
      rules: [
        { type: 'required' },
        { type: 'date', value: dateType }
      ]
    }),
    
    optionalEmail: (fieldName: string): ValidationRule => ({
      field: fieldName,
      rules: [{ type: 'email' }]
    }),
    
    optionalPhone: (fieldName: string): ValidationRule => ({
      field: fieldName,
      rules: [{ type: 'phone' }]
    }),
    
    textLength: (fieldName: string, min?: number, max?: number): ValidationRule => ({
      field: fieldName,
      rules: [
        ...(min ? [{ type: 'minLength' as const, value: min }] : []),
        ...(max ? [{ type: 'maxLength' as const, value: max }] : [])
      ]
    })
  };
  
  /**
   * Batch validate multiple sections
   */
  async validateMultipleSections(
    sections: Array<{ sectionNumber: number; data: any }>
  ): Promise<Map<number, ValidationResult>> {
    const results = new Map<number, ValidationResult>();
    
    for (const { sectionNumber, data } of sections) {
      const result = this.validateSection(sectionNumber, data);
      results.set(sectionNumber, result);
    }
    
    return results;
  }
  
  /**
   * Get validation summary for all sections
   */
  getValidationSummary(
    sections: Array<{ sectionNumber: number; data: any }>
  ): {
    totalErrors: number;
    totalWarnings: number;
    invalidSections: number[];
    isComplete: boolean;
  } {
    let totalErrors = 0;
    let totalWarnings = 0;
    const invalidSections: number[] = [];
    
    for (const { sectionNumber, data } of sections) {
      const result = this.validateSection(sectionNumber, data);
      
      if (!result.isValid) {
        invalidSections.push(sectionNumber);
      }
      
      totalErrors += result.errors?.length || 0;
      totalWarnings += result.warnings?.length || 0;
    }
    
    return {
      totalErrors,
      totalWarnings,
      invalidSections,
      isComplete: totalErrors === 0
    };
  }
}

// Export singleton instance
export const sectionValidation = SectionValidationService.getInstance();