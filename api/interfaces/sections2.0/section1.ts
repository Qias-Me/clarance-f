/**
 * Section 1: Information About You
 *
 * TypeScript interface definitions for SF-86 Section 1 (Information About You) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-1.json.
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';

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
// INTERFACE LAYER - TYPES, INTERFACES, AND CONSTANTS ONLY
// ============================================================================
//
// Note: Helper functions have been moved to the context layer to follow
// proper Interface → Context → Component architectural hierarchy.
// Functions like createDefaultSection1, updateSection1Field, and validateFullName
// are now implemented in app/state/contexts/sections2.0/section1.tsx
