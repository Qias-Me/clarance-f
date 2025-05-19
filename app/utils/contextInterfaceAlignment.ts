/**
 * Context Interface Alignment Utility
 * 
 * This utility ensures that context data aligns properly with interface requirements,
 * with validation, type conversion, and error handling for data mismatches.
 */

import { cloneDeep } from 'lodash';
import { type ApplicantFormValues } from '../../api/interfaces/formDefinition';
import { type FieldType } from '../../api/interfaces/FieldMetadata';
import { type FieldContextMapping } from './fieldToContextMapping';

/**
 * Interface for context validation results
 */
export interface ContextValidationResult {
  isValid: boolean;
  errors: ContextValidationError[];
}

/**
 * Interface for context validation errors
 */
export interface ContextValidationError {
  path: string[];
  expected: string;
  received: any;
  message: string;
}

/**
 * Validates context data against interface expectations
 * 
 * @param context The context data to validate
 * @returns Validation result with any errors
 */
export function validateContextAgainstInterfaces(
  context: ApplicantFormValues
): ContextValidationResult {
  const result: ContextValidationResult = {
    isValid: true,
    errors: []
  };
  
  // For each section in the context, validate its structure
  Object.entries(context).forEach(([sectionKey, sectionData]) => {
    if (!sectionData) return;
    
    // Validate section fields based on their expected types
    Object.entries(sectionData).forEach(([fieldKey, fieldData]) => {
      if (!fieldData) return;
      
      const path = [sectionKey, fieldKey];
      
      // Basic validation that field has required properties
      if (typeof fieldData !== 'object') {
        result.isValid = false;
        result.errors.push({
          path,
          expected: 'object',
          received: typeof fieldData,
          message: `Field data at ${path.join('.')} should be an object`
        });
        return;
      }
      
      // Check that field has required properties (id, value, type, label)
      const requiredProps = ['id', 'value', 'type', 'label'];
      for (const prop of requiredProps) {
        if (!(prop in fieldData)) {
          result.isValid = false;
          result.errors.push({
            path: [...path, prop],
            expected: 'property',
            received: 'undefined',
            message: `Field at ${path.join('.')} is missing required property "${prop}"`
          });
        }
      }
      
      // Type-specific validation (simplified for example)
      if ('type' in fieldData && 'value' in fieldData) {
        validateFieldValueByType(fieldData.type as string, fieldData.value, path, result);
      }
    });
  });
  
  return result;
}

/**
 * Validates a field value based on its type
 * 
 * @param fieldType The field type
 * @param value The field value
 * @param path The path to the field in the context
 * @param result The validation result to update
 */
function validateFieldValueByType(
  fieldType: string,
  value: any,
  path: string[],
  result: ContextValidationResult
): void {
  // Basic type validations based on field type
  switch (fieldType) {
    case 'PDFTextField':
      if (value !== null && value !== undefined && typeof value !== 'string') {
        result.isValid = false;
        result.errors.push({
          path,
          expected: 'string',
          received: typeof value,
          message: `Field at ${path.join('.')} with type PDFTextField should have string value`
        });
      }
      break;
    
    case 'PDFCheckBox':
      if (value !== null && value !== undefined && typeof value !== 'boolean') {
        result.isValid = false;
        result.errors.push({
          path,
          expected: 'boolean',
          received: typeof value,
          message: `Field at ${path.join('.')} with type PDFCheckBox should have boolean value`
        });
      }
      break;
      
    case 'PDFDateField':
      // Date field could be a string or Date object
      const isValidDate = value === null || value === undefined || 
        typeof value === 'string' || 
        (value instanceof Date && !isNaN(value.getTime()));
      
      if (!isValidDate) {
        result.isValid = false;
        result.errors.push({
          path,
          expected: 'date string or Date object',
          received: typeof value,
          message: `Field at ${path.join('.')} with type PDFDateField should have valid date value`
        });
      }
      break;
    
    // Add other field type validations as needed
  }
}

/**
 * Interface for field type conversion options
 */
export interface TypeConversionOptions {
  dateFormat?: string; // Format for date strings, e.g., 'YYYY-MM-DD'
  booleanTrueValues?: string[]; // String values that should be converted to true
  booleanFalseValues?: string[]; // String values that should be converted to false
  numberFormat?: string; // Format for number strings (e.g., '1,000.00')
}

/**
 * Converts field values to the correct type based on the field type
 * 
 * @param context The context to update
 * @param fieldMappings Field to context mappings with type information
 * @param options Type conversion options
 * @returns Context with converted values
 */
export function convertFieldValuesToCorrectTypes(
  context: ApplicantFormValues,
  fieldMappings: Record<string, FieldContextMapping>,
  options: TypeConversionOptions = {}
): ApplicantFormValues {
  const updatedContext = cloneDeep(context);
  
  // Default options
  const conversionOptions: TypeConversionOptions = {
    dateFormat: 'YYYY-MM-DD',
    booleanTrueValues: ['true', 'yes', 'y', '1'],
    booleanFalseValues: ['false', 'no', 'n', '0'],
    numberFormat: '1,000.00',
    ...options
  };
  
  // Find fields that need type conversion
  Object.entries(updatedContext).forEach(([sectionKey, sectionData]) => {
    if (!sectionData) return;
    
    Object.entries(sectionData).forEach(([fieldKey, fieldData]) => {
      if (!fieldData || typeof fieldData !== 'object') return;
      
      // Apply type conversions based on field type
      if ('id' in fieldData && 'type' in fieldData && 'value' in fieldData) {
        const id = fieldData.id as string;
        const type = fieldData.type as string;
        const value = fieldData.value;
        
        try {
          // Convert value to appropriate type
          const convertedValue = convertValueByType(value, type, conversionOptions);
          
          // Update the value with the converted one
          if (convertedValue !== value) {
            (fieldData as any).value = convertedValue;
          }
        } catch (error) {
          console.warn(`Failed to convert value for field ${id}:`, error);
        }
      }
    });
  });
  
  return updatedContext;
}

/**
 * Converts a value to the appropriate type based on the field type
 * 
 * @param value The value to convert
 * @param fieldType The field type
 * @param options Type conversion options
 * @returns The converted value
 */
function convertValueByType(
  value: any,
  fieldType: string,
  options: TypeConversionOptions
): any {
  if (value === null || value === undefined) {
    return value;
  }
  
  // Apply conversions based on field type
  switch (fieldType) {
    case 'PDFTextField':
      return String(value);
    
    case 'PDFCheckBox':
      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'string') {
        return options.booleanTrueValues?.includes(value.toLowerCase()) || 
          (value !== '' && !options.booleanFalseValues?.includes(value.toLowerCase()));
      }
      return Boolean(value);
    
    case 'PDFDateField':
      if (value instanceof Date) {
        return value;
      }
      if (typeof value === 'string') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? value : date;
      }
      return value;
    
    case 'PDFDropDown':
      return String(value);
    
    // Add other field type conversions as needed
    
    default:
      return value;
  }
}

/**
 * Applies context interface alignment to ensure data consistency
 * 
 * @param context The context to update
 * @param fieldMappings Field to context mappings
 * @param options Type conversion options
 * @returns Aligned context
 */
export function alignContextWithInterfaces(
  context: ApplicantFormValues,
  fieldMappings: Record<string, FieldContextMapping>,
  options: TypeConversionOptions = {}
): {
  context: ApplicantFormValues;
  validation: ContextValidationResult;
} {
  // First convert values to the correct types
  const updatedContext = convertFieldValuesToCorrectTypes(context, fieldMappings, options);
  
  // Then validate the updated context
  const validation = validateContextAgainstInterfaces(updatedContext);
  
  return {
    context: updatedContext,
    validation
  };
} 