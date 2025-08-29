/**
 * Section 1: Information About You
 *
 * TypeScript interface definitions for SF-86 Section 1 (Information About You) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-1.json.
 * Enhanced with integration folder mappings for PDF-to-UI field mapping.
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
// FIELD MAPPINGS (Imported from centralized config)
// ============================================================================

// Note: Field mappings have been moved to app/config/section1.config.ts
// to maintain a single source of truth and avoid duplication.
// Import these constants from the config file when needed:
// import { SECTION1_FIELD_IDS, SECTION1_FIELD_NAMES, SECTION1_UI_TO_PDF_MAPPINGS } from '~/config/section1.config';

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
