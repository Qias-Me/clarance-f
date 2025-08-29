/**
 * Shared Validation Patterns
 * 
 * Common validation rules and patterns used across sections
 */

import type { Field } from '../../formDefinition2.0';
import type { ValidationError, ValidationWarning, FieldValidationRules, PersonName, DateRange, Address } from './base-types';

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\d{10}$/,
  phoneFormatted: /^\(\d{3}\) \d{3}-\d{4}$/,
  ssn: /^\d{9}$/,
  ssnFormatted: /^\d{3}-\d{2}-\d{4}$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s]+$/,
  name: /^[a-zA-Z\s\-']+$/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d{1,2})?$/
};

/**
 * Common validation rules
 */
export const CommonValidationRules: Record<string, FieldValidationRules> = {
  requiredText: {
    required: true,
    minLength: 1,
    maxLength: 255
  },
  
  requiredName: {
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: ValidationPatterns.name
  },
  
  optionalName: {
    required: false,
    maxLength: 100,
    pattern: ValidationPatterns.name
  },
  
  requiredEmail: {
    required: true,
    pattern: ValidationPatterns.email,
    maxLength: 255
  },
  
  optionalEmail: {
    required: false,
    pattern: ValidationPatterns.email,
    maxLength: 255
  },
  
  requiredPhone: {
    required: true,
    pattern: ValidationPatterns.phone,
    custom: (value: string) => {
      const digits = value.replace(/\D/g, '');
      return digits.length === 10 || 'Phone number must be 10 digits';
    }
  },
  
  requiredSSN: {
    required: true,
    pattern: ValidationPatterns.ssn,
    custom: (value: string) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 9) return 'SSN must be 9 digits';
      
      // Check for invalid SSN patterns
      const invalidPrefixes = ['000', '666', '900', '999'];
      const prefix = digits.substring(0, 3);
      if (invalidPrefixes.includes(prefix)) return 'Invalid SSN format';
      
      if (digits.substring(0, 3) === '000' || 
          digits.substring(3, 5) === '00' || 
          digits.substring(5, 9) === '0000') {
        return 'Invalid SSN format';
      }
      
      return true;
    }
  },
  
  requiredDate: {
    required: true,
    pattern: ValidationPatterns.date,
    custom: (value: string) => {
      const date = new Date(value);
      return !isNaN(date.getTime()) || 'Invalid date format';
    }
  },
  
  requiredZipCode: {
    required: true,
    pattern: ValidationPatterns.zipCode
  },
  
  requiredAddress: {
    required: true,
    minLength: 5,
    maxLength: 255
  },
  
  optionalComments: {
    required: false,
    maxLength: 2000
  }
};

/**
 * Validate a person name structure
 */
export function validatePersonName(
  name: PersonName,
  required: boolean = true
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (required) {
    if (!name.lastName?.value?.trim()) {
      errors.push({
        field: 'lastName',
        message: 'Last name is required'
      });
    }
    
    if (!name.firstName?.value?.trim()) {
      errors.push({
        field: 'firstName',
        message: 'First name is required'
      });
    }
  }
  
  // Validate name patterns
  if (name.lastName?.value && !ValidationPatterns.name.test(name.lastName.value)) {
    errors.push({
      field: 'lastName',
      message: 'Last name contains invalid characters'
    });
  }
  
  if (name.firstName?.value && !ValidationPatterns.name.test(name.firstName.value)) {
    errors.push({
      field: 'firstName',
      message: 'First name contains invalid characters'
    });
  }
  
  if (name.middleName?.value && !ValidationPatterns.name.test(name.middleName.value)) {
    errors.push({
      field: 'middleName',
      message: 'Middle name contains invalid characters'
    });
  }
  
  return errors;
}

/**
 * Validate a date range
 */
export function validateDateRange(
  dateRange: DateRange,
  required: boolean = true
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (required && !dateRange.fromDate?.value) {
    errors.push({
      field: 'fromDate',
      message: 'Start date is required'
    });
  }
  
  if (required && !dateRange.toDate?.value && !dateRange.present?.value) {
    errors.push({
      field: 'toDate',
      message: 'End date or "Present" must be specified'
    });
  }
  
  // Validate date formats
  if (dateRange.fromDate?.value) {
    const fromDate = new Date(dateRange.fromDate.value);
    if (isNaN(fromDate.getTime())) {
      errors.push({
        field: 'fromDate',
        message: 'Invalid start date format'
      });
    }
  }
  
  if (dateRange.toDate?.value && !dateRange.present?.value) {
    const toDate = new Date(dateRange.toDate.value);
    if (isNaN(toDate.getTime())) {
      errors.push({
        field: 'toDate',
        message: 'Invalid end date format'
      });
    }
  }
  
  // Validate date order
  if (dateRange.fromDate?.value && dateRange.toDate?.value && !dateRange.present?.value) {
    const fromDate = new Date(dateRange.fromDate.value);
    const toDate = new Date(dateRange.toDate.value);
    
    if (fromDate > toDate) {
      errors.push({
        field: 'dateRange',
        message: 'End date must be after start date'
      });
    }
    
    // Check for future dates
    const now = new Date();
    if (fromDate > now) {
      errors.push({
        field: 'fromDate',
        message: 'Start date cannot be in the future',
        severity: 'error'
      });
    }
  }
  
  return errors;
}

/**
 * Validate an address
 */
export function validateAddress(
  address: Address,
  required: boolean = true
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (required) {
    if (!address.street?.value?.trim()) {
      errors.push({
        field: 'street',
        message: 'Street address is required'
      });
    }
    
    if (!address.city?.value?.trim()) {
      errors.push({
        field: 'city',
        message: 'City is required'
      });
    }
    
    if (!address.state?.value) {
      errors.push({
        field: 'state',
        message: 'State is required'
      });
    }
    
    if (!address.zipCode?.value?.trim()) {
      errors.push({
        field: 'zipCode',
        message: 'ZIP code is required'
      });
    }
    
    if (!address.country?.value) {
      errors.push({
        field: 'country',
        message: 'Country is required'
      });
    }
  }
  
  // Validate ZIP code format
  if (address.zipCode?.value && !ValidationPatterns.zipCode.test(address.zipCode.value)) {
    errors.push({
      field: 'zipCode',
      message: 'Invalid ZIP code format (use XXXXX or XXXXX-XXXX)'
    });
  }
  
  return errors;
}

/**
 * Validate an email field
 */
export function validateEmail(
  email: Field<string>,
  required: boolean = true
): ValidationError | null {
  if (required && !email?.value?.trim()) {
    return {
      field: 'email',
      message: 'Email is required'
    };
  }
  
  if (email?.value && !ValidationPatterns.email.test(email.value)) {
    return {
      field: 'email',
      message: 'Invalid email format'
    };
  }
  
  return null;
}

/**
 * Validate a phone number
 */
export function validatePhone(
  phone: Field<string>,
  required: boolean = true
): ValidationError | null {
  if (required && !phone?.value?.trim()) {
    return {
      field: 'phone',
      message: 'Phone number is required'
    };
  }
  
  if (phone?.value) {
    const digits = phone.value.replace(/\D/g, '');
    if (digits.length !== 10) {
      return {
        field: 'phone',
        message: 'Phone number must be 10 digits'
      };
    }
  }
  
  return null;
}

/**
 * Validate SSN
 */
export function validateSSN(
  ssn: Field<string>,
  required: boolean = true
): ValidationError | null {
  if (required && !ssn?.value?.trim()) {
    return {
      field: 'ssn',
      message: 'Social Security Number is required'
    };
  }
  
  if (ssn?.value) {
    const digits = ssn.value.replace(/\D/g, '');
    
    if (digits.length !== 9) {
      return {
        field: 'ssn',
        message: 'SSN must be exactly 9 digits'
      };
    }
    
    // Check for invalid SSN patterns
    const invalidPrefixes = ['000', '666', '900', '999'];
    const prefix = digits.substring(0, 3);
    
    if (invalidPrefixes.includes(prefix)) {
      return {
        field: 'ssn',
        message: 'Invalid SSN format'
      };
    }
    
    if (digits.substring(0, 3) === '000' || 
        digits.substring(3, 5) === '00' || 
        digits.substring(5, 9) === '0000') {
      return {
        field: 'ssn',
        message: 'Invalid SSN format'
      };
    }
  }
  
  return null;
}

/**
 * Create validation warnings for data quality
 */
export function createDataQualityWarnings(data: any): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  
  // Check for test data patterns
  const testPatterns = [
    /test/i,
    /example/i,
    /sample/i,
    /demo/i,
    /123456789/,
    /000-00-0000/,
    /111-11-1111/
  ];
  
  const checkField = (value: any, fieldName: string) => {
    if (typeof value === 'string') {
      for (const pattern of testPatterns) {
        if (pattern.test(value)) {
          warnings.push({
            field: fieldName,
            message: 'Field appears to contain test data'
          });
          break;
        }
      }
    }
  };
  
  // Recursively check all fields
  const traverse = (obj: any, path: string = '') => {
    for (const key in obj) {
      const fullPath = path ? `${path}.${key}` : key;
      const value = obj[key];
      
      if (value && typeof value === 'object') {
        if ('value' in value) {
          checkField(value.value, fullPath);
        } else {
          traverse(value, fullPath);
        }
      } else {
        checkField(value, fullPath);
      }
    }
  };
  
  traverse(data);
  
  return warnings;
}

/**
 * Batch validate multiple fields
 */
export function batchValidate(
  fields: Array<{
    value: any;
    rules: FieldValidationRules;
    fieldName: string;
  }>
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const { value, rules, fieldName } of fields) {
    const fieldValue = typeof value === 'object' && 'value' in value ? value.value : value;
    
    // Required validation
    if (rules.required && !fieldValue) {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`
      });
      continue;
    }
    
    if (fieldValue) {
      // Min length validation
      if (rules.minLength && fieldValue.length < rules.minLength) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at least ${rules.minLength} characters`
        });
      }
      
      // Max length validation
      if (rules.maxLength && fieldValue.length > rules.maxLength) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be no more than ${rules.maxLength} characters`
        });
      }
      
      // Pattern validation
      if (rules.pattern && !rules.pattern.test(fieldValue)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} has invalid format`
        });
      }
      
      // Custom validation
      if (rules.custom) {
        const result = rules.custom(fieldValue);
        if (result !== true) {
          errors.push({
            field: fieldName,
            message: typeof result === 'string' ? result : `${fieldName} validation failed`
          });
        }
      }
    }
  }
  
  return errors;
}