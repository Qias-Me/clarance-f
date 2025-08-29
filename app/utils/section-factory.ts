/**
 * Section Factory Pattern
 * 
 * Factory system for creating and managing SF-86 sections
 * Provides consistent instantiation and configuration across all 30 sections
 * 
 * @module utils/section-factory
 */

import { createSectionLogger, SectionLogger } from './section-logger';
import { fieldMapper, registerSectionMappings } from './section-field-mapping';
import { type SectionConfig } from '../config/section-base.config';
import type { Field } from '../../api/interfaces/formDefinition2.0';

/**
 * Base section context interface
 */
export interface BaseSectionContext<T> {
  // State
  sectionData: T;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;
  
  // Basic Actions
  updateFieldValue: (path: string, value: any) => void;
  
  // Validation
  validateSection: () => ValidationResult;
  
  // Field Mapping
  getPdfFieldMapping: (uiPath: string) => string | undefined;
  getUiFieldForPdfField: (pdfFieldId: string) => string | undefined;
  
  // Utility
  resetSection: () => void;
  loadSection: (data: T) => void;
  getChanges: () => any;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

/**
 * Section factory for creating section instances
 */
export class SectionFactory {
  private static loggers: Map<number, SectionLogger> = new Map();
  private static configs: Map<number, SectionConfig> = new Map();

  /**
   * Register a section configuration
   */
  static registerSection(config: SectionConfig): void {
    this.configs.set(config.metadata.id, config);
    
    // Register field mappings if provided
    if (config.fields.mappings) {
      registerSectionMappings(config.metadata.id, {
        mappings: config.fields.mappings,
        metadata: undefined, // Can be extended to include metadata
        confidence: undefined // Can be extended to include confidence scores
      });
    }
    
    // Create and cache logger
    if (!this.loggers.has(config.metadata.id)) {
      const logger = createSectionLogger(config.metadata.id, config.metadata.name);
      this.loggers.set(config.metadata.id, logger);
      logger.info('Section registered', { action: 'register' });
    }
  }

  /**
   * Get logger for a section
   */
  static getLogger(sectionId: number): SectionLogger {
    if (!this.loggers.has(sectionId)) {
      this.loggers.set(sectionId, createSectionLogger(sectionId));
    }
    return this.loggers.get(sectionId)!;
  }

  /**
   * Get configuration for a section
   */
  static getConfig(sectionId: number): SectionConfig | undefined {
    return this.configs.get(sectionId);
  }

  /**
   * Create default section data structure
   */
  static createDefaultSectionData<T>(
    sectionId: number,
    fieldDefinitions: Record<string, FieldDefinition>
  ): T {
    const logger = this.getLogger(sectionId);
    logger.debug('Creating default section data', { action: 'create' });

    const data: any = {
      _id: sectionId
    };

    // Create fields based on definitions
    Object.entries(fieldDefinitions).forEach(([key, definition]) => {
      data[key] = this.createField(definition);
    });

    return data as T;
  }

  /**
   * Create a field based on definition
   */
  private static createField(definition: FieldDefinition): Field<any> {
    return {
      id: definition.id,
      name: definition.name,
      label: definition.label,
      value: definition.defaultValue ?? '',
      required: definition.required ?? false,
      disabled: false,
      visible: true,
      ...(definition.options && { options: definition.options })
    };
  }

  /**
   * Create validation function for a section
   */
  static createValidationFunction(
    sectionId: number,
    validationRules: Record<string, ValidationRule>
  ): (data: any) => ValidationResult {
    const logger = this.getLogger(sectionId);
    const config = this.getConfig(sectionId);

    return (data: any): ValidationResult => {
      const errors: ValidationError[] = [];
      const warnings: ValidationError[] = [];

      // Apply validation rules
      Object.entries(validationRules).forEach(([fieldPath, rule]) => {
        const fieldValue = this.getFieldValue(data, fieldPath);
        
        // Required field validation
        if (rule.required && !fieldValue) {
          errors.push({
            field: fieldPath,
            message: config?.validation.messages.required[fieldPath] || 
                    `${fieldPath} is required`,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }

        // Pattern validation
        if (fieldValue && rule.pattern && !rule.pattern.test(fieldValue)) {
          errors.push({
            field: fieldPath,
            message: config?.validation.messages.invalid[fieldPath] || 
                    `${fieldPath} has invalid format`,
            code: 'INVALID_FORMAT',
            severity: 'error'
          });
        }

        // Length validation
        if (fieldValue && typeof fieldValue === 'string') {
          if (rule.minLength && fieldValue.length < rule.minLength) {
            errors.push({
              field: fieldPath,
              message: `${fieldPath} must be at least ${rule.minLength} characters`,
              code: 'TOO_SHORT',
              severity: 'error'
            });
          }
          if (rule.maxLength && fieldValue.length > rule.maxLength) {
            errors.push({
              field: fieldPath,
              message: `${fieldPath} must not exceed ${rule.maxLength} characters`,
              code: 'TOO_LONG',
              severity: 'error'
            });
          }
        }

        // Custom validation
        if (rule.validate) {
          const result = rule.validate(fieldValue, data);
          if (!result.isValid) {
            (result.severity === 'warning' ? warnings : errors).push({
              field: fieldPath,
              message: result.message,
              code: result.code || 'CUSTOM_VALIDATION',
              severity: result.severity || 'error'
            });
          }
        }
      });

      logger.validation(errors.length === 0, 
        errors.map(e => e.message),
        warnings.map(w => w.message)
      );

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    };
  }

  /**
   * Get field value from nested path
   */
  private static getFieldValue(data: any, path: string): any {
    const parts = path.split('.');
    let current = data;
    
    for (const part of parts) {
      if (current && typeof current === 'object') {
        // Handle Field<T> objects
        if ('value' in current && parts[parts.length - 1] !== part) {
          current = current.value;
        } else {
          current = current[part];
        }
      } else {
        return undefined;
      }
    }
    
    // Extract value from Field<T> if needed
    if (current && typeof current === 'object' && 'value' in current) {
      return current.value;
    }
    
    return current;
  }

  /**
   * Create field mapping functions for a section
   */
  static createFieldMappingFunctions(sectionId: number): {
    mapUiToPdf: (uiPath: string) => string | undefined;
    mapPdfToUi: (pdfFieldId: string) => string | undefined;
    validateMappings: () => any;
  } {
    return {
      mapUiToPdf: (uiPath: string) => {
        try {
          return fieldMapper.mapUiToPdf(sectionId, uiPath);
        } catch {
          return undefined;
        }
      },
      mapPdfToUi: (pdfFieldId: string) => {
        try {
          return fieldMapper.mapPdfToUi(sectionId, pdfFieldId);
        } catch {
          return undefined;
        }
      },
      validateMappings: () => {
        return fieldMapper.validateSection(sectionId);
      }
    };
  }

  /**
   * Create state change logger
   */
  static createStateChangeLogger(sectionId: number): (path: string, oldValue: any, newValue: any) => void {
    const logger = this.getLogger(sectionId);
    return (path: string, oldValue: any, newValue: any) => {
      logger.stateChange(path, oldValue, newValue);
    };
  }

  /**
   * Create performance tracker
   */
  static createPerformanceTracker(sectionId: number): {
    start: (operation: string) => void;
    end: (operation: string) => void;
  } {
    const logger = this.getLogger(sectionId);
    const timers = new Map<string, number>();

    return {
      start: (operation: string) => {
        timers.set(operation, Date.now());
      },
      end: (operation: string) => {
        const startTime = timers.get(operation);
        if (startTime) {
          const duration = Date.now() - startTime;
          logger.performance(operation, duration);
          timers.delete(operation);
        }
      }
    };
  }
}

/**
 * Field definition interface
 */
export interface FieldDefinition {
  id: string;
  name: string;
  label: string;
  defaultValue?: any;
  required?: boolean;
  options?: string[];
  type?: 'text' | 'number' | 'date' | 'boolean' | 'select';
}

/**
 * Validation rule interface
 */
export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  validate?: (value: any, data: any) => {
    isValid: boolean;
    message: string;
    code?: string;
    severity?: 'error' | 'warning';
  };
}

/**
 * Helper to create section with factory
 */
export function createSectionWithFactory<T>(
  sectionId: number,
  config: SectionConfig,
  fieldDefinitions: Record<string, FieldDefinition>,
  validationRules: Record<string, ValidationRule>
): {
  defaultData: T;
  validate: (data: any) => ValidationResult;
  fieldMapping: ReturnType<typeof SectionFactory.createFieldMappingFunctions>;
  logger: SectionLogger;
  stateLogger: ReturnType<typeof SectionFactory.createStateChangeLogger>;
  performanceTracker: ReturnType<typeof SectionFactory.createPerformanceTracker>;
} {
  // Register the section
  SectionFactory.registerSection(config);

  // Create components
  const defaultData = SectionFactory.createDefaultSectionData<T>(sectionId, fieldDefinitions);
  const validate = SectionFactory.createValidationFunction(sectionId, validationRules);
  const fieldMapping = SectionFactory.createFieldMappingFunctions(sectionId);
  const logger = SectionFactory.getLogger(sectionId);
  const stateLogger = SectionFactory.createStateChangeLogger(sectionId);
  const performanceTracker = SectionFactory.createPerformanceTracker(sectionId);

  return {
    defaultData,
    validate,
    fieldMapping,
    logger,
    stateLogger,
    performanceTracker
  };
}