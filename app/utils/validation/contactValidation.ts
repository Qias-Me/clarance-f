import type { ContactInfo, ContactNumber } from 'api/interfaces/sections/contact';
import { validateEmail, validatePhoneNumber, PhoneFormat, detectPhoneFormat } from '../contactHandlers';

/**
 * Validation error object structure
 */
export interface ValidationError {
  path: string;
  message: string;
}

/**
 * Contact validation result structure
 */
export interface ContactValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates all aspects of contact information
 * 
 * @param contactInfo The contact information to validate
 * @returns Validation result with specific errors
 */
export function validateContactInfo(contactInfo: ContactInfo): ContactValidationResult {
  const errors: ValidationError[] = [];
  
  // Validate home email
  if (contactInfo.homeEmail?.value) {
    const homeEmailValidation = validateEmail(contactInfo.homeEmail.value);
    if (!homeEmailValidation.isValid) {
      errors.push({
        path: 'homeEmail',
        message: homeEmailValidation.errorMessage || 'Invalid home email format'
      });
    }
  }
  
  // Validate work email
  if (contactInfo.workEmail?.value) {
    const workEmailValidation = validateEmail(contactInfo.workEmail.value);
    if (!workEmailValidation.isValid) {
      errors.push({
        path: 'workEmail',
        message: workEmailValidation.errorMessage || 'Invalid work email format'
      });
    }
  }
  
  // Validate contact numbers
  if (Array.isArray(contactInfo.contactNumbers)) {
    contactInfo.contactNumbers.forEach((contact, index) => {
      const contactErrors = validateContactNumber(contact);
      
      // Add index prefix to error paths
      contactErrors.forEach(error => {
        errors.push({
          path: `contactNumbers[${index}].${error.path}`,
          message: error.message
        });
      });
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a single contact number's fields
 * 
 * @param contact The contact number to validate
 * @returns Array of validation errors
 */
function validateContactNumber(contact: ContactNumber): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate phone number
  if (contact.phoneNumber?.value) {
    // Detect the format based on the input
    const format = detectPhoneFormat(contact.phoneNumber.value);
    
    // Validate based on the detected format
    const validation = validatePhoneNumber(contact.phoneNumber.value, format);
    
    if (!validation.isValid) {
      errors.push({
        path: 'phoneNumber',
        message: validation.errorMessage || 'Invalid phone number format'
      });
    }
    
    // If international checkbox is checked, validate as international format
    if (contact.internationalOrDSN?.value === 'YES') {
      if (format !== PhoneFormat.INTERNATIONAL && format !== PhoneFormat.DSN) {
        errors.push({
          path: 'phoneNumber',
          message: 'Phone number format doesn\'t match the International/DSN selection'
        });
      }
    }
  }
  
  // Validate logical constraints
  if (contact.isUsableDay?.value === 'NO' && contact.isUsableNight?.value === 'NO' && contact.phoneNumber?.value) {
    errors.push({
      path: 'isUsableDay',
      message: 'Phone number must be usable during either day or night'
    });
  }
  
  return errors;
}

/**
 * Gets error message for a specific field path
 * 
 * @param errors List of validation errors
 * @param path Path to the field
 * @returns Error message if found, undefined otherwise
 */
export function getFieldError(errors: ValidationError[], path: string): string | undefined {
  const error = errors.find(err => err.path === path);
  return error?.message;
}

/**
 * Checks if a field has errors
 * 
 * @param errors List of validation errors
 * @param path Path to the field
 * @returns True if field has errors
 */
export function hasFieldError(errors: ValidationError[], path: string): boolean {
  return errors.some(err => err.path === path);
}

/**
 * Gets accessibility props for a field based on validation state
 * 
 * @param errors List of validation errors
 * @param path Path to the field
 * @param errorId ID for the error message element
 * @returns Accessibility attributes object
 */
export function getFieldAccessibilityProps(
  errors: ValidationError[], 
  path: string, 
  errorId: string
): Record<string, string | boolean | undefined> {
  const hasError = hasFieldError(errors, path);
  
  return {
    'aria-invalid': hasError,
    'aria-errormessage': hasError ? errorId : undefined,
    'aria-describedby': hasError ? errorId : undefined
  };
} 