/**
 * Section 1: Information About You
 *
 * TypeScript interface definitions for SF-86 Section 1 (Information About You) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-1.json.
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';
import { SUFFIX_OPTIONS } from './base';
import { createFieldFromReference, validateSectionFieldCount } from '../../utils/sections-references-loader';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Personal information structure for Section 1
 */
export interface PersonalInformation {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  suffix: FieldWithOptions<string>;
}

/**
 * Section 1 main data structure
 */
export interface Section1 {
  _id: number;
  section1: PersonalInformation;
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 1 subsection keys for type safety
 */
export type Section1SubsectionKey = 'personalInformation';

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 1 (Information About You)
 * Based on the actual field IDs from section-1.json (4-digit format)
 */
export const SECTION1_FIELD_IDS = {
  // Personal information fields
  LAST_NAME: "9449", // form1[0].Sections1-6[0].TextField11[0]
  FIRST_NAME: "9448", // form1[0].Sections1-6[0].TextField11[1]
  MIDDLE_NAME: "9447", // form1[0].Sections1-6[0].TextField11[2]
  SUFFIX: "9435", // form1[0].Sections1-6[0].suffix[0]
} as const;

/**
 * Field name mappings for Section 1 (Information About You)
 * Full field paths from section-1.json
 */
export const SECTION1_FIELD_NAMES = {
  // Personal information fields
  LAST_NAME: "form1[0].Sections1-6[0].TextField11[0]",
  FIRST_NAME: "form1[0].Sections1-6[0].TextField11[1]",
  MIDDLE_NAME: "form1[0].Sections1-6[0].TextField11[2]",
  SUFFIX: "form1[0].Sections1-6[0].suffix[0]",
} as const;

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
// HELPER TYPES
// ============================================================================

// SUFFIX_OPTIONS imported from base.ts to avoid duplication


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
 * Type for personal information field updates
 */
export type Section1FieldUpdate = {
  fieldPath: string;
  newValue: any;
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
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 1 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
export const createDefaultSection1 = (): Section1 => {
  // Validate field count against sections-references
  validateSectionFieldCount(1);

  return {
    _id: 1,
    section1: {
      lastName: createFieldFromReference(
        1,
        'form1[0].Sections1-6[0].TextField11[0]',
        ''
      ),
      firstName: createFieldFromReference(
        1,
        'form1[0].Sections1-6[0].TextField11[1]',
        ''
      ),
      middleName: createFieldFromReference(
        1,
        'form1[0].Sections1-6[0].TextField11[2]',
        ''
      ),
      suffix: {
        ...createFieldFromReference(
          1,
          'form1[0].Sections1-6[0].suffix[0]',
          ''
        ),
        options: SUFFIX_OPTIONS
      }
    }
  };
};

/**
 * Updates a specific field in the Section 1 data structure
 */
export const updateSection1Field = (
  section1Data: Section1,
  update: Section1FieldUpdate
): Section1 => {
  const { fieldPath, newValue } = update;
  const newData = { ...section1Data };

  // Update the specified field
  if (fieldPath === 'section1.lastName') {
    newData.section1.lastName.value = newValue;
  } else if (fieldPath === 'section1.firstName') {
    newData.section1.firstName.value = newValue;
  } else if (fieldPath === 'section1.middleName') {
    newData.section1.middleName.value = newValue;
  } else if (fieldPath === 'section1.suffix') {
    newData.section1.suffix.value = newValue;
  }

  return newData;
};

/**
 * Validates a full name entry
 */
export function validateFullName(fullName: PersonalInformation, context: Section1ValidationContext): NameValidationResult {
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
  const fields = [
    { value: fullName.lastName.value, name:  fullName.lastName.name, label: fullName.lastName.label },
    { value: fullName.firstName.value, name: fullName.firstName.name, label: fullName.firstName.label },
    { value: fullName.middleName.value, name: fullName.middleName.name, label: fullName.middleName.label },
    { value: fullName.suffix.value, name: fullName.suffix.name, label: fullName.suffix.label }
  ];

  fields.forEach(field => {
    if (field.value.length > context.rules.maxNameLength) {
      errors.push(`${field.name} exceeds maximum length of ${context.rules.maxNameLength} characters`);
    }
  });

  // Character validation
  fields.forEach(field => {
    if (field.value && !NAME_VALIDATION.ALLOWED_CHARACTERS.test(field.value)) {
      errors.push(`${field.name} contains invalid characters`);
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
