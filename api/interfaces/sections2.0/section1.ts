/**
 * Section 1: Information About You
 *
 * TypeScript interface definitions for SF-86 Section 1 personal information data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings.
 */

import type { Field } from '../formDefinition2.0';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Full name components
 */
export interface FullName {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  suffix: Field<string>;
}

/**
 * Section 1 main data structure
 */
export interface Section1 {
  _id: number;
  personalInfo: {
    fullName: FullName;
  };
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 1 subsection keys for type safety
 */
export type Section1SubsectionKey = 'personalInfo';

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Validation rules specific to Section 1
 */
export interface Section1ValidationRules {
  requiresLastName: boolean;
  requiresFirstName: boolean;
  allowsMiddleNameEmpty: boolean;
  allowsSuffixEmpty: boolean;
  maxNameLength: number;
}

/**
 * Section 1 validation context
 */
export interface Section1ValidationContext {
  rules: Section1ValidationRules;
  allowInitialsOnly: boolean;
}

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID patterns for Section 1
 * Based on the Sections1-6 pattern from the JSON reference
 */
export const SECTION1_FIELD_IDS = {
  // Full name fields
  LAST_NAME: "form1[0].Sections1-6[0].TextField11[0]",
  FIRST_NAME: "form1[0].Sections1-6[0].TextField11[1]", 
  MIDDLE_NAME: "form1[0].Sections1-6[0].TextField11[2]",
  SUFFIX: "form1[0].Sections1-6[0].suffix[0]"
} as const;

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Common suffix options
 */
export const NAME_SUFFIXES = {
  JR: 'Jr.',
  SR: 'Sr.',
  II: 'II',
  III: 'III',
  IV: 'IV',
  V: 'V',
  NONE: ''
} as const;

/**
 * Name validation patterns
 */
export const NAME_VALIDATION = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 50,
  ALLOWED_CHARACTERS: /^[a-zA-Z\s\-'\.]*$/,
  INITIAL_PATTERN: /^[A-Z]\.?$/
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for creating new Section 1 data
 */
export type CreateSection1Params = {
  defaultSuffix?: string;
};

/**
 * Type for Section 1 field updates
 */
export type Section1FieldUpdate = {
  fieldPath: 'lastName' | 'firstName' | 'middleName' | 'suffix';
  newValue: string;
};

/**
 * Type for name validation results
 */
export type NameValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 1 data structure
 */
export function createDefaultSection1(): Section1 {
  return {
    _id: 1,
    personalInfo: {
      fullName: {
        lastName: { value: '', id: SECTION1_FIELD_IDS.LAST_NAME },
        firstName: { value: '', id: SECTION1_FIELD_IDS.FIRST_NAME },
        middleName: { value: '', id: SECTION1_FIELD_IDS.MIDDLE_NAME },
        suffix: { value: '', id: SECTION1_FIELD_IDS.SUFFIX }
      }
    }
  };
}

/**
 * Validates a full name entry
 */
export function validateFullName(fullName: FullName, context: Section1ValidationContext): NameValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validation
  if (context.rules.requiresLastName && !fullName.lastName.value.trim()) {
    errors.push('Last name is required');
  }

  if (context.rules.requiresFirstName && !fullName.firstName.value.trim()) {
    errors.push('First name is required');
  }

  // Length validation
  const fields = [fullName.lastName, fullName.firstName, fullName.middleName, fullName.suffix];
  fields.forEach((field, index) => {
    const fieldNames = ['Last name', 'First name', 'Middle name', 'Suffix'];
    if (field.value.length > context.rules.maxNameLength) {
      errors.push(`${fieldNames[index]} exceeds maximum length of ${context.rules.maxNameLength} characters`);
    }
  });

  // Character validation
  fields.forEach((field, index) => {
    const fieldNames = ['Last name', 'First name', 'Middle name', 'Suffix'];
    if (field.value && !NAME_VALIDATION.ALLOWED_CHARACTERS.test(field.value)) {
      errors.push(`${fieldNames[index]} contains invalid characters`);
    }
  });

  // Initial-only validation
  if (context.allowInitialsOnly) {
    if (NAME_VALIDATION.INITIAL_PATTERN.test(fullName.firstName.value)) {
      warnings.push('First name appears to be an initial only');
    }
    if (NAME_VALIDATION.INITIAL_PATTERN.test(fullName.middleName.value)) {
      warnings.push('Middle name appears to be an initial only');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Updates a specific field in Section 1
 */
export function updateSection1Field(
  section1: Section1, 
  update: Section1FieldUpdate
): Section1 {
  const updated = { ...section1 };
  
  switch (update.fieldPath) {
    case 'lastName':
      updated.personalInfo.fullName.lastName.value = update.newValue;
      break;
    case 'firstName':
      updated.personalInfo.fullName.firstName.value = update.newValue;
      break;
    case 'middleName':
      updated.personalInfo.fullName.middleName.value = update.newValue;
      break;
    case 'suffix':
      updated.personalInfo.fullName.suffix.value = update.newValue;
      break;
  }
  
  return updated;
}
