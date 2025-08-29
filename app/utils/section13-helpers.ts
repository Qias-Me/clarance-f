/**
 * Section 13 Helper Functions
 * Utility functions for employment entry management and field operations
 */

import type { Field } from '../../api/interfaces/formDefinition2.0';

/**
 * Creates a Field<T> object with default structure
 * @param value - The initial value for the field
 * @param id - The field identifier
 * @returns Field<T> object with complete structure
 */
export const createField = <T = string | boolean>(
  value: T,
  id: string
): Field<T> => ({
  id,
  value,
  label: '',
  name: id,
  type: 'PDFTextField',
  required: false,
  section: 13,
  rect: { x: 0, y: 0, width: 0, height: 0 }
});

/**
 * Creates a new employment entry with Field<T> structure
 * @param entryType - Type of employment entry
 * @returns New employment entry object
 */
export const createEmploymentEntry = (entryType: string) => {
  const timestamp = Date.now();
  
  return {
    _id: `${entryType}-${timestamp}`,
    employerName: createField('', `${entryType}EmployerName-${timestamp}`),
    positionTitle: createField('', `${entryType}PositionTitle-${timestamp}`),
    employmentDates: {
      fromDate: createField('', `${entryType}FromDate-${timestamp}`),
      toDate: createField('', `${entryType}ToDate-${timestamp}`),
      present: createField(false, `${entryType}Present-${timestamp}`)
    },
    address: {
      street: createField('', `${entryType}Street-${timestamp}`),
      city: createField('', `${entryType}City-${timestamp}`),
      state: createField('', `${entryType}State-${timestamp}`),
      zipCode: createField('', `${entryType}ZipCode-${timestamp}`),
      country: createField('United States', `${entryType}Country-${timestamp}`)
    },
    supervisor: {
      name: createField('', `${entryType}SupervisorName-${timestamp}`),
      title: createField('', `${entryType}SupervisorTitle-${timestamp}`),
      email: createField('', `${entryType}SupervisorEmail-${timestamp}`),
      phone: {
        number: createField('', `${entryType}SupervisorPhone-${timestamp}`),
        extension: createField('', `${entryType}SupervisorExtension-${timestamp}`)
      }
    },
    reasonForLeaving: createField('', `${entryType}ReasonForLeaving-${timestamp}`),
    additionalComments: createField('', `${entryType}AdditionalComments-${timestamp}`)
  };
};

/**
 * Normalizes boolean string values
 * @param value - Value to normalize
 * @returns Normalized boolean or original value
 */
export const normalizeValue = (value: string | boolean): string | boolean => {
  if (typeof value === 'string' && (value === 'true' || value === 'false')) {
    return value === 'true';
  }
  return value;
};

/**
 * Checks if a path is a nested object path
 * @param fieldPath - Path to check
 * @returns True if it's a nested object path
 */
export const isNestedObjectPath = (fieldPath: string): boolean => {
  return fieldPath.startsWith('employmentRecordIssues.') || 
         fieldPath.startsWith('disciplinaryActions.') || 
         fieldPath.startsWith('federalInfo.');
};

/**
 * Normalizes field path with section13 prefix
 * @param fieldPath - Original field path
 * @returns Normalized path with correct prefix
 */
export const normalizeFieldPath = (fieldPath: string): string => {
  const alreadyHasSection13Prefix = fieldPath.startsWith('section13.');
  
  if (alreadyHasSection13Prefix) {
    return fieldPath;
  }
  
  if (isNestedObjectPath(fieldPath)) {
    return fieldPath;
  }
  
  return `section13.${fieldPath}`;
};

/**
 * Extracts value from a field or returns the value directly
 * @param fieldOrValue - Field object or direct value
 * @returns The value
 */
export const extractFieldValue = (fieldOrValue: any): string | boolean => {
  if (fieldOrValue && typeof fieldOrValue === 'object' && 'value' in fieldOrValue) {
    return fieldOrValue.value;
  }
  
  if (typeof fieldOrValue === 'boolean') {
    return fieldOrValue;
  }
  
  return fieldOrValue || '';
};

/**
 * Navigates to a nested field value using a path
 * @param data - The data object to navigate
 * @param path - Dot-separated path to the field
 * @returns The field value or empty string if not found
 */
export const getNestedFieldValue = (data: any, path: string): string | boolean => {
  const pathSegments = path.split('.');
  let current = data;
  
  for (const segment of pathSegments) {
    // Handle array notation like entries[0]
    if (segment.includes('[')) {
      const [arrayName, indexStr] = segment.split('[');
      const index = parseInt(indexStr.replace(']', ''), 10);
      current = current?.[arrayName]?.[index];
    } else {
      current = current?.[segment];
    }
    
    if (current === undefined || current === null) {
      break;
    }
  }
  
  return extractFieldValue(current);
};

/**
 * Updates a nested field value in an object
 * @param obj - Object to update
 * @param path - Dot-separated path to the field
 * @param value - New value to set
 * @param entryType - Type of entry for field creation
 */
export const setNestedFieldValue = (
  obj: any,
  path: string,
  value: any,
  entryType: string
): void => {
  const fieldParts = path.split('.');
  let current = obj;
  
  // Navigate to the nested object
  for (let i = 0; i < fieldParts.length - 1; i++) {
    if (!current[fieldParts[i]]) {
      current[fieldParts[i]] = {};
    }
    current = current[fieldParts[i]];
  }
  
  // Set the final value in the Field<T> structure
  const finalField = fieldParts[fieldParts.length - 1];
  if (current[finalField] && typeof current[finalField] === 'object' && 'value' in current[finalField]) {
    current[finalField].value = value;
  } else {
    current[finalField] = createField(value, `${entryType}${path}`);
  }
};

/**
 * Validates an employment entry for required fields
 * @param entry - Employment entry to validate
 * @returns Validation result with errors
 */
export const validateEmploymentEntry = (entry: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!entry.employerName?.value) {
    errors.push('Employer name is required');
  }
  
  if (!entry.positionTitle?.value) {
    errors.push('Position title is required');
  }
  
  if (!entry.employmentDates?.fromDate?.value) {
    errors.push('Start date is required');
  }
  
  if (!entry.employmentDates?.toDate?.value && !entry.employmentDates?.present?.value) {
    errors.push('End date or "Present" must be specified');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculates employment duration in months
 * @param fromDate - Start date string
 * @param toDate - End date string or null if present
 * @returns Duration in months
 */
export const calculateEmploymentDuration = (
  fromDate: string,
  toDate: string | null
): number => {
  if (!fromDate) return 0;
  
  const start = new Date(fromDate);
  const end = toDate ? new Date(toDate) : new Date();
  
  const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                 (end.getMonth() - start.getMonth());
  
  return Math.max(0, months);
};

/**
 * Formats an address from field values
 * @param address - Address object with field values
 * @returns Formatted address string
 */
export const formatAddress = (address: any): string => {
  const parts = [
    extractFieldValue(address.street),
    extractFieldValue(address.city),
    extractFieldValue(address.state),
    extractFieldValue(address.zipCode),
    extractFieldValue(address.country)
  ].filter(Boolean);
  
  return parts.join(', ');
};