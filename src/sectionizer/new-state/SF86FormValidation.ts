/**
 * SF-86 Form Validation Utilities
 * 
 * Comprehensive validation functions for SF-86 form fields, entries,
 * subsections, and sections with specific business rules.
 */

import type {
  SF86Form,
  SF86Section,
  SF86Subsection,
  SF86Entry,
  SF86FormField,
  SF86FieldType,
  ValidationState
} from './SF86FormTypes.js';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Field validation rules
 */
export interface FieldValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => ValidationResult;
}

/**
 * Common validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  SSN: /^\d{3}-?\d{2}-?\d{4}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  DATE: /^\d{1,2}\/\d{1,2}\/\d{4}$/,
  PASSPORT: /^[A-Z0-9]{6,9}$/,
  NAME: /^[a-zA-Z\s\-'\.]{1,50}$/
};

/**
 * Validate individual field value
 */
export function validateField(field: SF86FormField, rules?: FieldValidationRule): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const value = field.value;
  const isEmpty = value === undefined || value === null || value === '';

  // Check required fields
  if (field.required || rules?.required) {
    if (isEmpty) {
      result.isValid = false;
      result.errors.push(`${field.displayName || field.name} is required`);
      return result;
    }
  }

  // Skip further validation if field is empty and not required
  if (isEmpty) {
    return result;
  }

  const stringValue = String(value);

  // Length validation
  if (rules?.minLength && stringValue.length < rules.minLength) {
    result.isValid = false;
    result.errors.push(`${field.displayName || field.name} must be at least ${rules.minLength} characters`);
  }

  if (rules?.maxLength && stringValue.length > rules.maxLength) {
    result.isValid = false;
    result.errors.push(`${field.displayName || field.name} must not exceed ${rules.maxLength} characters`);
  }

  // Pattern validation
  if (rules?.pattern && !rules.pattern.test(stringValue)) {
    result.isValid = false;
    result.errors.push(`${field.displayName || field.name} format is invalid`);
  }

  // Field type specific validation
  switch (field.type) {
    case SF86FieldType.TEXT:
      if (field.maxLength && stringValue.length > field.maxLength) {
        result.isValid = false;
        result.errors.push(`${field.displayName || field.name} exceeds maximum length of ${field.maxLength}`);
      }
      break;

    case SF86FieldType.RADIO_GROUP:
      if (field.options && field.options.length > 0 && !field.options.includes(stringValue)) {
        result.isValid = false;
        result.errors.push(`${field.displayName || field.name} must be one of the available options`);
      }
      break;

    case SF86FieldType.CHECKBOX:
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        result.isValid = false;
        result.errors.push(`${field.displayName || field.name} must be a boolean value`);
      }
      break;
  }

  // Custom validation
  if (rules?.customValidator) {
    const customResult = rules.customValidator(value);
    if (!customResult.isValid) {
      result.isValid = false;
      result.errors.push(...customResult.errors);
      result.warnings.push(...customResult.warnings);
    }
  }

  return result;
}

/**
 * Validate entry completeness and consistency
 */
export function validateEntry(entry: SF86Entry): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  let hasRequiredFields = false;
  let completedRequiredFields = 0;
  let totalRequiredFields = 0;

  entry.fields.forEach(field => {
    if (field.required) {
      hasRequiredFields = true;
      totalRequiredFields++;
      
      const fieldResult = validateField(field);
      if (!fieldResult.isValid) {
        result.isValid = false;
        result.errors.push(...fieldResult.errors);
      } else {
        const isEmpty = field.value === undefined || field.value === null || field.value === '';
        if (!isEmpty) {
          completedRequiredFields++;
        }
      }
      
      result.warnings.push(...fieldResult.warnings);
    }
  });

  // Check if entry is partially completed
  if (hasRequiredFields && completedRequiredFields > 0 && completedRequiredFields < totalRequiredFields) {
    result.warnings.push(`Entry ${entry.entryNumber} is partially completed (${completedRequiredFields}/${totalRequiredFields} required fields)`);
  }

  return result;
}

/**
 * Validate subsection completeness
 */
export function validateSubsection(subsection: SF86Subsection): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check minimum entries requirement
  if (subsection.minEntries && subsection.entries.length < subsection.minEntries) {
    result.isValid = false;
    result.errors.push(`${subsection.displayName} requires at least ${subsection.minEntries} entries`);
  }

  // Check maximum entries limit
  if (subsection.maxEntries && subsection.entries.length > subsection.maxEntries) {
    result.isValid = false;
    result.errors.push(`${subsection.displayName} cannot have more than ${subsection.maxEntries} entries`);
  }

  // Validate each entry
  subsection.entries.forEach(entry => {
    const entryResult = validateEntry(entry);
    if (!entryResult.isValid) {
      result.isValid = false;
      result.errors.push(...entryResult.errors);
    }
    result.warnings.push(...entryResult.warnings);
  });

  // Validate standalone fields
  if (subsection.standaloneFields) {
    subsection.standaloneFields.forEach(field => {
      const fieldResult = validateField(field);
      if (!fieldResult.isValid) {
        result.isValid = false;
        result.errors.push(...fieldResult.errors);
      }
      result.warnings.push(...fieldResult.warnings);
    });
  }

  return result;
}

/**
 * Validate section completeness
 */
export function validateSection(section: SF86Section): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Validate subsections
  Object.values(section.subsections).forEach(subsection => {
    const subsectionResult = validateSubsection(subsection);
    if (!subsectionResult.isValid) {
      result.isValid = false;
      result.errors.push(...subsectionResult.errors);
    }
    result.warnings.push(...subsectionResult.warnings);
  });

  // Validate standalone fields
  if (section.standaloneFields) {
    section.standaloneFields.forEach(field => {
      const fieldResult = validateField(field);
      if (!fieldResult.isValid) {
        result.isValid = false;
        result.errors.push(...fieldResult.errors);
      }
      result.warnings.push(...fieldResult.warnings);
    });
  }

  // Section-specific validation rules
  switch (section.sectionId) {
    case 1: // Information About You
      result.warnings.push(...validatePersonalInfoSection(section));
      break;
    case 8: // U.S. Passport Information
      result.warnings.push(...validatePassportSection(section));
      break;
    case 4: // SSN
      result.warnings.push(...validateSSNSection(section));
      break;
  }

  return result;
}

/**
 * Validate entire form
 */
export function validateForm(form: SF86Form): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Validate each section
  Object.values(form.sections).forEach(section => {
    if (section.required) {
      const sectionResult = validateSection(section);
      if (!sectionResult.isValid) {
        result.isValid = false;
        result.errors.push(...sectionResult.errors);
      }
      result.warnings.push(...sectionResult.warnings);
    }
  });

  // Form-level validation rules
  const requiredSections = [1, 2, 3, 4, 7, 8, 9]; // Basic required sections
  requiredSections.forEach(sectionId => {
    if (!form.sections[sectionId]) {
      result.isValid = false;
      result.errors.push(`Required section ${sectionId} is missing`);
    }
  });

  return result;
}

/**
 * Section-specific validation functions
 */
function validatePersonalInfoSection(section: SF86Section): string[] {
  const warnings: string[] = [];
  
  // Check for name fields
  const nameFields = getAllFieldsInSection(section).filter(field => 
    field.name.toLowerCase().includes('name') || 
    field.name.toLowerCase().includes('first') ||
    field.name.toLowerCase().includes('last')
  );
  
  if (nameFields.length === 0) {
    warnings.push('Personal information section should contain name fields');
  }
  
  return warnings;
}

function validatePassportSection(section: SF86Section): string[] {
  const warnings: string[] = [];
  
  const passportFields = getAllFieldsInSection(section).filter(field =>
    field.name.toLowerCase().includes('passport')
  );
  
  if (passportFields.length === 0) {
    warnings.push('Passport section should contain passport-related fields');
  }
  
  return warnings;
}

function validateSSNSection(section: SF86Section): string[] {
  const warnings: string[] = [];
  
  const ssnFields = getAllFieldsInSection(section).filter(field =>
    field.name.toLowerCase().includes('ssn') ||
    field.name.toLowerCase().includes('social')
  );
  
  if (ssnFields.length === 0) {
    warnings.push('SSN section should contain social security number fields');
  }
  
  return warnings;
}

/**
 * Helper function to get all fields in a section
 */
function getAllFieldsInSection(section: SF86Section): SF86FormField[] {
  const fields: SF86FormField[] = [];
  
  // Add standalone fields
  if (section.standaloneFields) {
    fields.push(...section.standaloneFields);
  }
  
  // Add subsection fields
  Object.values(section.subsections).forEach(subsection => {
    if (subsection.standaloneFields) {
      fields.push(...subsection.standaloneFields);
    }
    
    subsection.entries.forEach(entry => {
      fields.push(...entry.fields);
    });
  });
  
  return fields;
}

/**
 * Update validation states throughout the form
 */
export function updateValidationStates(form: SF86Form): SF86Form {
  const updatedForm = { ...form };
  
  // Update section validation states
  Object.values(updatedForm.sections).forEach(section => {
    const sectionResult = validateSection(section);
    section.validationState = sectionResult.isValid ? ValidationState.VALID : ValidationState.INVALID;
    section.validationMessages = sectionResult.errors;
    
    // Update subsection validation states
    Object.values(section.subsections).forEach(subsection => {
      const subsectionResult = validateSubsection(subsection);
      subsection.validationState = subsectionResult.isValid ? ValidationState.VALID : ValidationState.INVALID;
      subsection.validationMessages = subsectionResult.errors;
      
      // Update entry validation states
      subsection.entries.forEach(entry => {
        const entryResult = validateEntry(entry);
        entry.validationState = entryResult.isValid ? ValidationState.VALID : ValidationState.INVALID;
        entry.validationMessages = entryResult.errors;
      });
    });
  });
  
  // Update form-level validation
  const formResult = validateForm(updatedForm);
  updatedForm.metadata.validationState = formResult.isValid ? ValidationState.VALID : ValidationState.INVALID;
  updatedForm.validationMessages = formResult.errors;
  
  return updatedForm;
}
