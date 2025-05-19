import { stripIdSuffix, addIdSuffix } from '../fieldHierarchyParser';
import { validateGeneratedFieldId } from '../formHandler';

/**
 * Result of field validation
 */
export interface FieldValidationResult {
  isValid: boolean;
  errors: FieldValidationError[];
}

/**
 * Field validation error
 */
export interface FieldValidationError {
  path: string;
  fieldId?: string;
  expectedId?: string;
  message: string;
  type: FieldErrorType;
}

/**
 * Types of validation errors that can occur
 */
export enum FieldErrorType {
  MISSING_FIELD = 'missing_field',
  INVALID_ID = 'invalid_id',
  TYPE_MISMATCH = 'type_mismatch',
  MISSING_VALUE = 'missing_value',
  MISSING_REQUIRED = 'missing_required',
  PATTERN_MISMATCH = 'pattern_mismatch',
  FORMAT_MISMATCH = 'format_mismatch',
  SUFFIX_ERROR = 'suffix_error',
  CONDITIONAL_REQUIRED = 'conditional_required',
  VALUE_OUT_OF_RANGE = 'value_out_of_range',
  INVALID_DATE = 'invalid_date',
  OTHER = 'other'
}

/**
 * Validation options
 */
export interface ValidationOptions {
  strict: boolean; // True for development mode, false for production
  validateTypes: boolean; // Whether to validate field types
  validateRequired: boolean; // Whether to validate required fields
  validateFormats: boolean; // Whether to validate field formats
  validateSuffixes: boolean; // Whether to validate field ID suffixes
}

/**
 * Default validation options
 */
export const defaultValidationOptions: ValidationOptions = {
  strict: true,
  validateTypes: true,
  validateRequired: true,
  validateFormats: true,
  validateSuffixes: true
};

/**
 * Field type validation map
 */
export const fieldTypeMap: Record<string, (value: any) => boolean> = {
  string: (value: any) => typeof value === 'string',
  number: (value: any) => typeof value === 'number' && !isNaN(value),
  boolean: (value: any) => typeof value === 'boolean',
  object: (value: any) => typeof value === 'object' && value !== null && !Array.isArray(value),
  array: (value: any) => Array.isArray(value),
  date: (value: any) => value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value))),
  null: (value: any) => value === null
};

/**
 * Validates if a value matches a specific type
 * 
 * @param value The value to validate
 * @param type The expected type of the value
 * @returns True if the value matches the type, false otherwise
 */
export const validateType = (value: any, type: string): boolean => {
  if (value === undefined) return false;
  
  if (type.includes('|')) {
    const types = type.split('|');
    return types.some(t => validateType(value, t.trim()));
  }
  
  const validator = fieldTypeMap[type];
  if (validator) {
    return validator(value);
  }
  
  return true; // If no validator for the type, assume it's valid
};

/**
 * Validates a field ID format (with or without suffix)
 * 
 * @param id The field ID to validate
 * @param expectedId The expected field ID pattern
 * @param options Validation options
 * @returns True if the field ID is valid, false otherwise
 */
export const validateFieldId = (id: string, expectedId: string, options: ValidationOptions = defaultValidationOptions): boolean => {
  // Strip suffixes for comparison if needed
  const actualId = options.validateSuffixes ? id : stripIdSuffix(id);
  const expectedBaseId = options.validateSuffixes ? expectedId : stripIdSuffix(expectedId);
  
  // Simple exact match validation
  return actualId === expectedBaseId;
};

/**
 * Validates a dynamic field ID (such as in repeating sections)
 * 
 * @param id The field ID to validate
 * @param baseId The base field ID to derive expected values from
 * @param index The index of the current entry
 * @param sectionPath The path to the section
 * @param options Validation options
 * @returns True if the field ID is valid, false otherwise
 */
export const validateDynamicFieldId = (
  id: string, 
  baseId: string, 
  index: number, 
  sectionPath: string,
  options: ValidationOptions = defaultValidationOptions
): boolean => {
  // Use the existing validateGeneratedFieldId function from formHandler
  const expectedPattern = validateGeneratedFieldId(id, stripIdSuffix(baseId));
  
  // If we have an explicit expected pattern, use it
  if (expectedPattern) {
    return expectedPattern;
  }
  
  // Otherwise, generate what we expect the ID to be based on index and section
  const expectedId = index === 0 ? 
    stripIdSuffix(baseId) : 
    generateFieldId(stripIdSuffix(baseId), index, sectionPath);
  
  // Compare with the actual ID
  return validateFieldId(id, expectedId, options);
};

/**
 * Imports the generateFieldId function from formHandler.tsx to avoid circular dependencies
 * Note: This assumes the generateFieldId function is exported from formHandler.tsx
 */
const generateFieldId = (baseId: string, index: number, sectionPath?: string): string => {
  // This reuses the existing implementation from formHandler.tsx
  // In a real implementation, you might want to extract this to a shared utility
  if (index === 0) {
    return baseId;
  }
  
  // Simplified version for validation purposes
  const sectionMap: Record<string, number> = {
    'namesInfo': 5,
    'residencyInfo': 11,
    'employmentInfo': 13, 
    'relativesInfo': 18,
    'foreignContacts': 19,
    'contactInfo.contactNumbers': 7,
    'identificationInfo.numbers': 6
  };
  
  let sectionNumber: number | undefined;
  if (sectionPath) {
    const sectionKey = Object.keys(sectionMap).find(key => sectionPath.includes(key));
    if (sectionKey) {
      sectionNumber = sectionMap[sectionKey];
    }
  }
  
  // Generate section-specific ID
  if (sectionNumber) {
    const numericId = parseInt(baseId, 10);
    if (isNaN(numericId)) {
      return `${baseId}_${index}`;
    }
    
    let offset = -(10 * index);
    
    switch (sectionNumber) {
      case 5:
        offset = -(14 * index);
        break;
      case 11:
        offset = -(12 * index);
        break;
      case 13:
        offset = -(10 * index);
        break;
      case 18:
        offset = -(16 * index);
        break;
      case 19:
        offset = -(10 * index);
        break;
    }
    
    const newId = numericId + offset;
    return newId > 0 ? newId.toString() : `${baseId}_${index}`;
  }
  
  return `${baseId}_${index}`;
};

/**
 * Validates a field value based on patterns or formats
 * 
 * @param value The value to validate
 * @param pattern The pattern to match against
 * @returns True if the value matches the pattern, false otherwise
 */
export const validatePattern = (value: string, pattern: string | RegExp): boolean => {
  if (value === undefined || value === null) {
    return false;
  }
  
  if (typeof pattern === 'string') {
    // If pattern is a string, check if the value matches exactly
    return value === pattern;
  } else {
    // If pattern is a RegExp, test the value against it
    return pattern.test(value);
  }
};

/**
 * Validates required fields with enhanced type-specific validation
 * 
 * @param value The value to validate
 * @param options Optional configuration parameters for validation behavior
 * @returns True if the value is considered valid (not empty, null, or undefined)
 */
export const validateRequired = (value: any, options: { 
  allowEmptyObjects?: boolean, 
  allowEmptyArrays?: boolean,
  allowZero?: boolean,
  allowFalse?: boolean
} = {}): boolean => {
  const {
    allowEmptyObjects = false,
    allowEmptyArrays = false,
    allowZero = true,
    allowFalse = true
  } = options;

  // Handle undefined and null cases
  if (value === undefined || value === null) {
    return false;
  }
  
  // Type-specific validation
  switch (typeof value) {
    case 'string':
      // String is empty
      return value.trim().length > 0;
      
    case 'number':
      // Number is zero and we don't allow zero
      return allowZero || value !== 0;
      
    case 'boolean':
      // Boolean is false and we don't allow false
      return allowFalse || value !== false;
      
    case 'object':
      if (Array.isArray(value)) {
        // For arrays, check if it has elements or if empty arrays are allowed
        return allowEmptyArrays || value.length > 0;
      } else {
        // For objects, check if it has properties or if empty objects are allowed
        return allowEmptyObjects || Object.keys(value).length > 0;
      }
      
    default:
      return true; // Other types are considered valid
  }
};

/**
 * Creates a detailed error object for field validation errors
 * 
 * @param path The path to the field with the error
 * @param type The type of validation error
 * @param details Additional details about the error
 * @returns A field validation error object
 */
export const createValidationError = (
  path: string, 
  type: FieldErrorType, 
  details: { 
    message?: string, 
    fieldId?: string, 
    expectedId?: string 
  } = {}
): FieldValidationError => {
  const { message, fieldId, expectedId } = details;
  
  // Generate default messages based on error type if not provided
  let errorMessage = message;
  if (!errorMessage) {
    switch (type) {
      case FieldErrorType.MISSING_FIELD:
        errorMessage = `Required field is missing: ${path}`;
        break;
      case FieldErrorType.INVALID_ID:
        errorMessage = `Invalid field ID${fieldId ? `: ${fieldId}` : ''}${expectedId ? `, expected: ${expectedId}` : ''}`;
        break;
      case FieldErrorType.TYPE_MISMATCH:
        errorMessage = `Type mismatch for field: ${path}`;
        break;
      case FieldErrorType.MISSING_VALUE:
        errorMessage = `Value is missing for field: ${path}`;
        break;
      case FieldErrorType.MISSING_REQUIRED:
        errorMessage = `Required value is missing: ${path}`;
        break;
      case FieldErrorType.PATTERN_MISMATCH:
        errorMessage = `Value does not match the required pattern: ${path}`;
        break;
      case FieldErrorType.FORMAT_MISMATCH:
        errorMessage = `Value format is incorrect: ${path}`;
        break;
      case FieldErrorType.SUFFIX_ERROR:
        errorMessage = `Field ID suffix is incorrect${fieldId ? `: ${fieldId}` : ''}`;
        break;
      default:
        errorMessage = `Validation error for field: ${path}`;
        break;
    }
  }
  
  return {
    path,
    fieldId,
    expectedId,
    message: errorMessage,
    type
  };
};

/**
 * Validates the mapping between context data and field hierarchy
 * 
 * @param contextData The context data to validate
 * @param fieldHierarchy The field hierarchy to validate against
 * @param options Validation options
 * @returns The validation result
 */
export const validateFieldMapping = (
  data: any,
  options: ValidationOptions = defaultValidationOptions,
  fieldHierarchy: any = null
): FieldValidationResult => {
  const result: FieldValidationResult = {
    isValid: true,
    errors: []
  };
  
  validateFields(data, '', result, options, fieldHierarchy, data);
  
  result.isValid = result.errors.length === 0;
  
  return result;
};

/**
 * Recursively validates fields in the context data
 * 
 * @param data The data to validate
 * @param path The current path in the data
 * @param result The validation result to update
 * @param options Validation options
 * @param fieldHierarchy The field hierarchy to validate against
 * @param contextData The full context data for reference
 */
const validateFields = (
  data: any,
  path: string = '',
  result: FieldValidationResult,
  options: ValidationOptions,
  fieldHierarchy: any,
  contextData: any = data
): void => {
  // Skip validation if data is null or undefined
  if (data === null || data === undefined) {
    return;
  }

  // Handle different data types
  if (Array.isArray(data)) {
    // For arrays, validate each element
    data.forEach((item, index) => {
      const itemPath = path ? `${path}[${index}]` : `[${index}]`;
      validateFields(item, itemPath, result, options, fieldHierarchy, contextData);
    });
  } else if (typeof data === 'object') {
    // For objects, validate each property
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        const fieldPath = path ? `${path}.${key}` : key;
        
        // Validate the field
        validateField(value, fieldPath, result, options, fieldHierarchy, contextData);
        
        // Recursively validate nested objects/arrays
        if (value !== null && typeof value === 'object') {
          validateFields(value, fieldPath, result, options, fieldHierarchy, contextData);
        }
      }
    }
  }
};

/**
 * Validates a single field in the context data
 * 
 * @param field The field to validate
 * @param path The path to the field
 * @param result The validation result to update
 * @param options Validation options
 * @param fieldHierarchy The field hierarchy to validate against
 * @param contextData The full context data for reference
 */
const validateField = (  
  field: any,   
  path: string,   
  result: FieldValidationResult,   
  options: ValidationOptions,  
  fieldHierarchy: any,  
  contextData: any
): void => {
  // Skip validation for non-object fields or null values
  if (!field || typeof field !== 'object' || Array.isArray(field)) {
    return;
  }
  
  // Check if this is a field object with an ID
  if ('id' in field) {
    // This appears to be a field with an ID, validate it
    const fieldId = field.id;
    
    // Find the field in the hierarchy
    const hierarchyField = findFieldInHierarchy(fieldId, fieldHierarchy);
    
    // Validate field ID
    if (!hierarchyField && options.strict) {
      result.errors.push(createValidationError(path, FieldErrorType.INVALID_ID, {
        fieldId,
        message: `Field ID ${fieldId} not found in field hierarchy`
      }));
    }
    
    // Validate field type if enabled
    if (options.validateTypes && hierarchyField && 'type' in hierarchyField && 'type' in field) {
      const expectedType = hierarchyField.type;
      const actualType = field.type;
      
      if (expectedType !== actualType) {
        result.errors.push(createValidationError(path, FieldErrorType.TYPE_MISMATCH, {
          message: `Type mismatch: expected ${expectedType}, got ${actualType}`
        }));
      }
    }
    
    // Validate required fields if enabled
    if (options.validateRequired && hierarchyField) {
      // Check if the field is explicitly required
      const isRequired = 'required' in hierarchyField && hierarchyField.required === true;
      
      // Check if the field has a requiredIf condition
      const hasRequiredIf = 'requiredIf' in hierarchyField && hierarchyField.requiredIf;
      
      if (isRequired || hasRequiredIf) {
        const value = field.value;
        let shouldValidate = isRequired;
        
        // Check conditional requirement if applicable
        if (hasRequiredIf && typeof hierarchyField.requiredIf === 'object') {
          // Example: { "dependsOn": "field1", "hasValue": "yes" }
          const { dependsOn, hasValue } = hierarchyField.requiredIf;
          
          if (dependsOn) {
            // Find the dependent field in the context using the path
            const contextRoot = path.split('.')[0]; // Get the root object
            const dependentPath = `${contextRoot}.${dependsOn}`;
            
            // Traverse the context data to find the dependent field
            let dependentField = contextData;
            const pathParts = dependentPath.split('.');
            
            for (const part of pathParts) {
              if (dependentField && typeof dependentField === 'object') {
                dependentField = dependentField[part];
              } else {
                dependentField = undefined;
                break;
              }
            }
            
            if (dependentField && 'value' in dependentField) {
              const dependentValue = dependentField.value;
              
              // Check if the dependent field has the required value
              if (hasValue) {
                if (Array.isArray(hasValue)) {
                  shouldValidate = hasValue.includes(dependentValue);
                } else {
                  shouldValidate = dependentValue === hasValue;
                }
              } else {
                // If no hasValue is specified, the field is required if the dependent field has any value
                shouldValidate = validateRequired(dependentValue);
              }
            }
          }
        }
        
        // Validate if required (conditionally or absolutely)
        if (shouldValidate) {
          // Use type-specific validation options based on field metadata
          const validationOptions = {
            allowEmptyObjects: hierarchyField.allowEmptyObjects || false,
            allowEmptyArrays: hierarchyField.allowEmptyArrays || false,
            allowZero: hierarchyField.allowZero !== false, // Default to true
            allowFalse: hierarchyField.allowFalse !== false // Default to true
          };
          
          if (!validateRequired(value, validationOptions)) {
            result.errors.push(createValidationError(path, FieldErrorType.MISSING_REQUIRED, {
              message: `Required field value is missing or empty: ${path}`,
              fieldId: field.id
            }));
          }
        }
      }
    }
    
    // Validate field format if enabled
    if (options.validateFormats && 'format' in hierarchyField && 'value' in field) {
      const format = hierarchyField.format;
      const value = field.value;
      
      if (typeof value === 'string' && typeof format === 'string') {
        let patternRegex: RegExp | null = null;
        
        // Handle common formats
        switch (format) {
          case 'email':
            patternRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            break;
          case 'phone':
            patternRegex = /^\+?[0-9\-\(\)\s]+$/;
            break;
          case 'ssn':
            patternRegex = /^[0-9]{3}-?[0-9]{2}-?[0-9]{4}$/;
            break;
          case 'date':
            // Simple date validation, could be enhanced
            patternRegex = /^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}$/;
            break;
          case 'zipcode':
            patternRegex = /^[0-9]{5}(-[0-9]{4})?$/;
            break;
        }
        
        if (patternRegex && !patternRegex.test(value)) {
          result.errors.push(createValidationError(path, FieldErrorType.FORMAT_MISMATCH, {
            message: `Value doesn't match ${format} format: ${value}`
          }));
        }
      }
    }
    
    // Validate field pattern if provided
    if ('pattern' in hierarchyField && 'value' in field) {
      const pattern = hierarchyField.pattern;
      const value = field.value;
      
      if (typeof value === 'string' && (typeof pattern === 'string' || pattern instanceof RegExp)) {
        if (!validatePattern(value, pattern)) {
          result.errors.push(createValidationError(path, FieldErrorType.PATTERN_MISMATCH, {
            message: `Value doesn't match the required pattern: ${value}`
          }));
        }
      }
    }
  }
};

/**
 * Finds a field in the field hierarchy by ID
 * 
 * @param id The field ID to find
 * @param fieldHierarchy The field hierarchy to search
 * @returns The field info if found, null otherwise
 */
export const findFieldInHierarchy = (id: string, fieldHierarchy: any): any => {
  // Strip suffix for comparison
  const baseId = stripIdSuffix(id);
  
  // Search recursively through the hierarchy
  for (const sectionKey in fieldHierarchy) {
    const section = fieldHierarchy[sectionKey];
    
    // Check if the section has fields
    if (section.fields) {
      for (const field of section.fields) {
        if (stripIdSuffix(field.id) === baseId) {
          return field;
        }
      }
    }
    
    // Check if the section has fieldsByValuePattern
    if (section.fieldsByValuePattern) {
      for (const patternKey in section.fieldsByValuePattern) {
        const pattern = section.fieldsByValuePattern[patternKey];
        
        // Check if the pattern has fieldsByRegex
        if (pattern.fieldsByRegex) {
          for (const regexKey in pattern.fieldsByRegex) {
            const regex = pattern.fieldsByRegex[regexKey];
            
            // Check if the regex has fields
            if (regex.fields) {
              for (const field of regex.fields) {
                if (stripIdSuffix(field.id) === baseId) {
                  return field;
                }
              }
            }
          }
        }
      }
    }
  }
  
  return null;
}; 