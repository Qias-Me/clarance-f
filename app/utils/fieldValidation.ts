/**
 * Field Validation Utility
 * 
 * This utility provides functions for validating field IDs, ensuring they match
 * the expected format and structure from field-hierarchy.json metadata.
 */

import { type FieldMetadata, type FieldHierarchy } from '../../api/interfaces/FieldMetadata';
import { type ApplicantFormValues } from '../../api/interfaces/formDefinition';
import { transformFieldId } from './forms/FormEntryManager';
import { stripIdSuffix, addIdSuffix } from './formHandler';
import { cloneDeep, get, set } from 'lodash';

/**
 * Types of validation to perform
 */
export enum ValidationMode {
  // Only check the format of IDs (with/without "0 R" suffix)
  FORMAT_ONLY = 'format-only',
  // Check that all required fields exist with correct format
  REQUIRED_FIELDS = 'required-fields',
  // Perform comprehensive validation including dynamic entries
  COMPREHENSIVE = 'comprehensive',
  // Special mode for validating a form before PDF submission
  PRE_SUBMISSION = 'pre-submission'
}

/**
 * Result of field validation containing detailed error information
 */
export interface FieldValidationResult {
  isValid: boolean;
  errors: FieldValidationError[];
  warnings: FieldValidationWarning[];
}

/**
 * Error object for field validation failures
 */
export interface FieldValidationError {
  path: string;
  id?: string;
  expectedId?: string;
  expectedFormat?: 'pdf' | 'context';
  code: FieldErrorCode;
  message: string;
}

/**
 * Warning object for field validation issues that aren't critical
 */
export interface FieldValidationWarning {
  path: string;
  id?: string;
  code: FieldWarningCode;
  message: string;
}

/**
 * Enum for field validation error codes
 */
export enum FieldErrorCode {
  INVALID_FORMAT = 'invalid-format',
  MISSING_REQUIRED_FIELD = 'missing-required-field',
  INVALID_ID = 'invalid-id',
  MISSING_ID = 'missing-id',
  DYNAMIC_ENTRY_ID_MISMATCH = 'dynamic-entry-id-mismatch',
  TYPE_MISMATCH = 'type-mismatch',
  SECTION_MISMATCH = 'section-mismatch'
}

/**
 * Enum for field validation warning codes
 */
export enum FieldWarningCode {
  MISSING_OPTIONAL_FIELD = 'missing-optional-field',
  UNKNOWN_FIELD = 'unknown-field',
  POTENTIAL_ID_MISMATCH = 'potential-id-mismatch'
}

/**
 * Validates field IDs in a form against the expected format
 * 
 * @param formData The form data to validate
 * @param expectedFormat The expected format ('pdf' or 'context')
 * @returns Validation result with details of any errors found
 */
export function validateFieldIdFormat(
  formData: any,
  expectedFormat: 'pdf' | 'context' = 'context'
): FieldValidationResult {
  const errors: FieldValidationError[] = [];
  const warnings: FieldValidationWarning[] = [];
  
  // Recursive function to check all IDs in the form data
  const checkIds = (data: any, currentPath: string = ''): void => {
    if (!data || typeof data !== 'object') return;
    
    if (Array.isArray(data)) {
      // Process array elements
      data.forEach((item, index) => {
        checkIds(item, currentPath ? `${currentPath}[${index}]` : `[${index}]`);
      });
    } else {
      // Process object properties
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key];
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          
          // Check if this is an ID field
          if (key === 'id' && typeof value === 'string') {
            if (!transformFieldId.isValidFormat(value, expectedFormat)) {
              errors.push({
                path: newPath,
                id: value,
                expectedFormat,
                code: FieldErrorCode.INVALID_FORMAT,
                message: `Field ID "${value}" at path "${newPath}" is not in the expected ${expectedFormat} format`
              });
            }
          }
          
          // Continue checking child objects/arrays
          checkIds(value, newPath);
        }
      }
    }
  };
  
  // Start the recursive check
  checkIds(formData);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates that field IDs match their expected values based on field-hierarchy.json
 * 
 * @param formData The form data to validate
 * @param fieldHierarchy The field hierarchy data to validate against
 * @param mode The validation mode to use
 * @returns Validation result with details of any errors found
 */
export function validateFieldIdMapping(
  formData: ApplicantFormValues,
  fieldHierarchy: FieldHierarchy,
  mode: ValidationMode = ValidationMode.REQUIRED_FIELDS
): FieldValidationResult {
  const errors: FieldValidationError[] = [];
  const warnings: FieldValidationWarning[] = [];
  
  // First, check the format of all field IDs
  const formatResult = validateFieldIdFormat(formData, 'context');
  
  // Add any format errors to our result
  errors.push(...formatResult.errors);
  
  // If we're only validating format, return now
  if (mode === ValidationMode.FORMAT_ONLY) {
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  // Flatten field hierarchy for easier lookups
  const allFields = flattenFieldHierarchy(fieldHierarchy);
  
  // Create a map of all required fields
  const requiredFields = allFields.filter(field => field.validation?.required);
  
  // Identify sections that have dynamic entries
  const sectionWithDynamicEntries = new Set<number>();
  
  // Check for required fields
  if (mode === ValidationMode.REQUIRED_FIELDS || mode === ValidationMode.COMPREHENSIVE) {
    // Here we would validate that all required fields are present and have valid IDs
    // This would be implemented in the next steps of the task
  }
  
  // Check for dynamic entry ID consistency
  if (mode === ValidationMode.COMPREHENSIVE || mode === ValidationMode.PRE_SUBMISSION) {
    // Here we would validate IDs in dynamic (repeatable) sections
    // This would be implemented in subtask 16.3
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Flattens a field hierarchy structure into a simple array of fields
 * 
 * @param fieldHierarchy The field hierarchy data to flatten
 * @returns Array of all fields from the hierarchy
 */
export function flattenFieldHierarchy(fieldHierarchy: FieldHierarchy): FieldMetadata[] {
  const allFields: FieldMetadata[] = [];
  
  // Process each form and add its fields to the array
  Object.values(fieldHierarchy).forEach(form => {
    if (form.fields && Array.isArray(form.fields)) {
      allFields.push(...form.fields);
    }
  });
  
  return allFields;
}

/**
 * Groups fields by section for easier processing
 * 
 * @param fields Array of fields to group
 * @returns Map of section number to array of fields
 */
export function groupFieldsBySection(fields: FieldMetadata[]): Map<number, FieldMetadata[]> {
  const sectionMap = new Map<number, FieldMetadata[]>();
  
  fields.forEach(field => {
    if (!sectionMap.has(field.section)) {
      sectionMap.set(field.section, []);
    }
    
    sectionMap.get(field.section)?.push(field);
  });
  
  return sectionMap;
}

/**
 * Checks if a field exists in the form data structure
 * 
 * @param formData The form data to check
 * @param fieldPath Path to the field in dot notation
 * @returns Whether the field exists
 */
export function fieldExists(formData: any, fieldPath: string): boolean {
  const value = get(formData, fieldPath);
  return value !== undefined;
}

/**
 * Gets the ID for a field at a specific path, if it exists
 * 
 * @param formData The form data to check
 * @param fieldPath Path to the field in dot notation
 * @returns The field ID or undefined if not found
 */
export function getFieldId(formData: any, fieldPath: string): string | undefined {
  const field = get(formData, fieldPath);
  
  if (field && typeof field === 'object' && 'id' in field) {
    return field.id as string;
  }
  
  return undefined;
}

/**
 * Checks if a field ID matches an expected ID (after normalizing format)
 * 
 * @param actualId The actual field ID
 * @param expectedId The expected field ID
 * @returns Whether the IDs match
 */
export function fieldIdMatches(actualId: string, expectedId: string): boolean {
  return transformFieldId.areEquivalent(actualId, expectedId);
} 