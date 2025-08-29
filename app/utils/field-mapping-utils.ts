/**
 * Field Mapping Utilities
 * 
 * Common utilities for PDF-to-UI field mapping across all SF-86 sections.
 * Provides a standardized interface for field mapping operations.
 */

import type { FieldMapping, ValidationRule, FieldMetadata } from '../state/contexts/sections2.0/section13-field-mapping';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SectionFieldMapping {
  sectionId: number;
  sectionName: string;
  mappings: FieldMapping[];
  totalFields: number;
  mappedFields: number;
  coverage: number;
}

export interface FieldMappingEngine {
  // Core mapping functions
  mapPdfToUi: (pdfFieldId: string) => string | undefined;
  mapUiToPdf: (uiPath: string) => string | undefined;
  
  // Validation functions
  validateMapping: (fieldPath: string) => boolean;
  validateValue: (fieldPath: string, value: any) => ValidationResult;
  
  // Metadata functions
  getMetadata: (fieldPath: string) => FieldMetadata | undefined;
  getStatistics: () => SectionFieldMapping;
  
  // Dynamic generation
  generateMappings: (subsection: string, entryIndex: number) => FieldMapping[];
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

// ============================================================================
// FIELD MAPPING FACTORY
// ============================================================================

/**
 * Create a field mapping engine for a specific section
 * @param sectionId The section ID
 * @param sectionName The section name
 * @param mappings The field mappings for the section
 * @returns A field mapping engine instance
 */
export const createFieldMappingEngine = (
  sectionId: number,
  sectionName: string,
  mappings: FieldMapping[]
): FieldMappingEngine => {
  
  // Create mapping lookup maps for performance
  const pdfToUiMap = new Map<string, string>();
  const uiToPdfMap = new Map<string, string>();
  
  mappings.forEach(mapping => {
    pdfToUiMap.set(mapping.pdfField, mapping.uiPath);
    uiToPdfMap.set(mapping.uiPath, mapping.pdfField);
  });
  
  return {
    mapPdfToUi: (pdfFieldId: string): string | undefined => {
      return pdfToUiMap.get(pdfFieldId);
    },
    
    mapUiToPdf: (uiPath: string): string | undefined => {
      return uiToPdfMap.get(uiPath);
    },
    
    validateMapping: (fieldPath: string): boolean => {
      return pdfToUiMap.has(fieldPath) || uiToPdfMap.has(fieldPath);
    },
    
    validateValue: (fieldPath: string, value: any): ValidationResult => {
      const mapping = mappings.find(m => 
        m.uiPath === fieldPath || m.pdfField === fieldPath
      );
      
      if (!mapping) {
        return {
          isValid: false,
          errors: [`No mapping found for field: ${fieldPath}`]
        };
      }
      
      // Apply validation rules if present
      if (mapping.validation) {
        const errors: string[] = [];
        
        mapping.validation.forEach(rule => {
          if (!applyValidationRule(rule, value)) {
            errors.push(rule.message);
          }
        });
        
        return {
          isValid: errors.length === 0,
          errors: errors.length > 0 ? errors : undefined
        };
      }
      
      return { isValid: true };
    },
    
    getMetadata: (fieldPath: string): FieldMetadata | undefined => {
      const mapping = mappings.find(m => 
        m.uiPath === fieldPath || m.pdfField === fieldPath
      );
      
      if (!mapping) return undefined;
      
      // Extract metadata from the mapping
      const pathParts = mapping.uiPath.split('.');
      
      return {
        section: pathParts[0],
        subsection: pathParts[1],
        label: pathParts[pathParts.length - 1],
        ...mapping.metadata
      };
    },
    
    getStatistics: (): SectionFieldMapping => {
      const uniqueFields = new Set<string>();
      mappings.forEach(m => uniqueFields.add(m.uiPath));
      
      return {
        sectionId,
        sectionName,
        mappings,
        totalFields: mappings.length,
        mappedFields: uniqueFields.size,
        coverage: (uniqueFields.size / mappings.length) * 100
      };
    },
    
    generateMappings: (subsection: string, entryIndex: number): FieldMapping[] => {
      // This would be overridden by section-specific implementations
      return mappings.filter(m => m.uiPath.includes(`.${subsection}.`));
    }
  };
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Apply a validation rule to a value
 * @param rule The validation rule
 * @param value The value to validate
 * @returns True if the value passes validation
 */
const applyValidationRule = (rule: ValidationRule, value: any): boolean => {
  switch (rule.type) {
    case 'required':
      return value !== undefined && value !== null && value !== '';
    
    case 'pattern':
      if (typeof value !== 'string') return false;
      const pattern = new RegExp(rule.value);
      return pattern.test(value);
    
    case 'minLength':
      if (typeof value !== 'string') return false;
      return value.length >= rule.value;
    
    case 'maxLength':
      if (typeof value !== 'string') return false;
      return value.length <= rule.value;
    
    case 'custom':
      if (typeof rule.value === 'function') {
        return rule.value(value);
      }
      return true;
    
    default:
      return true;
  }
};

// ============================================================================
// PATH UTILITIES
// ============================================================================

/**
 * Parse a field path into its components
 * @param fieldPath The field path to parse
 * @returns Parsed components of the path
 */
export const parseFieldPath = (fieldPath: string) => {
  const parts = fieldPath.split('.');
  
  if (parts.length < 2) {
    return {
      section: parts[0],
      subsection: undefined,
      field: undefined,
      entryIndex: undefined
    };
  }
  
  // Check for array notation (e.g., entries[0])
  const arrayMatch = parts[1].match(/(.+)\[(\d+)\]/);
  
  if (arrayMatch) {
    return {
      section: parts[0],
      subsection: arrayMatch[1],
      entryIndex: parseInt(arrayMatch[2], 10),
      field: parts.slice(2).join('.')
    };
  }
  
  return {
    section: parts[0],
    subsection: parts[1],
    field: parts.slice(2).join('.'),
    entryIndex: undefined
  };
};

/**
 * Build a field path from components
 * @param section The section name
 * @param subsection The subsection name
 * @param field The field name
 * @param entryIndex Optional entry index for arrays
 * @returns The constructed field path
 */
export const buildFieldPath = (
  section: string,
  subsection: string,
  field: string,
  entryIndex?: number
): string => {
  let path = `${section}.${subsection}`;
  
  if (entryIndex !== undefined) {
    path = `${section}.${subsection}[${entryIndex}]`;
  }
  
  if (field) {
    path += `.${field}`;
  }
  
  return path;
};

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Map multiple PDF fields to UI paths
 * @param pdfFieldIds Array of PDF field IDs
 * @param engine The field mapping engine
 * @returns Map of PDF field IDs to UI paths
 */
export const batchMapPdfToUi = (
  pdfFieldIds: string[],
  engine: FieldMappingEngine
): Map<string, string | undefined> => {
  const results = new Map<string, string | undefined>();
  
  pdfFieldIds.forEach(pdfFieldId => {
    results.set(pdfFieldId, engine.mapPdfToUi(pdfFieldId));
  });
  
  return results;
};

/**
 * Validate multiple field values
 * @param fieldValues Map of field paths to values
 * @param engine The field mapping engine
 * @returns Map of field paths to validation results
 */
export const batchValidateFields = (
  fieldValues: Map<string, any>,
  engine: FieldMappingEngine
): Map<string, ValidationResult> => {
  const results = new Map<string, ValidationResult>();
  
  fieldValues.forEach((value, fieldPath) => {
    results.set(fieldPath, engine.validateValue(fieldPath, value));
  });
  
  return results;
};

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Migrate field values from old paths to new paths
 * @param data The data object to migrate
 * @param pathMappings Map of old paths to new paths
 * @returns The migrated data
 */
export const migrateFieldPaths = (
  data: any,
  pathMappings: Map<string, string>
): any => {
  const migratedData = { ...data };
  
  pathMappings.forEach((newPath, oldPath) => {
    const oldValue = getValueAtPath(data, oldPath);
    if (oldValue !== undefined) {
      setValueAtPath(migratedData, newPath, oldValue);
      deleteValueAtPath(migratedData, oldPath);
    }
  });
  
  return migratedData;
};

/**
 * Get value at a nested path
 * @param obj The object to query
 * @param path The path to the value
 * @returns The value at the path or undefined
 */
const getValueAtPath = (obj: any, path: string): any => {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
};

/**
 * Set value at a nested path
 * @param obj The object to modify
 * @param path The path to set
 * @param value The value to set
 */
const setValueAtPath = (obj: any, path: string, value: any): void => {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined) {
      current[part] = {};
    }
    current = current[part];
  }
  
  current[parts[parts.length - 1]] = value;
};

/**
 * Delete value at a nested path
 * @param obj The object to modify
 * @param path The path to delete
 */
const deleteValueAtPath = (obj: any, path: string): void => {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined) {
      return;
    }
    current = current[part];
  }
  
  delete current[parts[parts.length - 1]];
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  createFieldMappingEngine,
  parseFieldPath,
  buildFieldPath,
  batchMapPdfToUi,
  batchValidateFields,
  migrateFieldPaths,
};