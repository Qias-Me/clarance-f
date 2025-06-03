/**
 * Section 14: Selective Service
 *
 * TypeScript interface definitions for SF-86 Section 14 (Selective Service) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-14.json.
 * 
 * Section 14 covers:
 * - Selective Service registration status
 * - Registration number (if applicable)
 * - Explanation for non-registration
 * - Unknown status explanation
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';
import { createFieldFromReference, validateSectionFieldCount } from '../../utils/sections-references-loader';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Selective Service registration information structure for Section 14
 */
export interface SelectiveServiceInformation {
  registrationStatus: FieldWithOptions<string>; // Yes/No radio button
  registrationNumber: Field<string>; // If yes, provide registration number
  noRegistrationExplanation: Field<string>; // If no, provide explanation
  unknownStatusExplanation: Field<string>; // If I don't know selected, provide explanation
  militaryServiceStatus: FieldWithOptions<string>; // YES/NO radio button for military service
}

/**
 * Section 14 main data structure
 */
export interface Section14 {
  _id: number;
  section14: SelectiveServiceInformation;
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 14 subsection keys for type safety
 */
export type Section14SubsectionKey = 'selectiveServiceInformation';

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 14 (Selective Service)
 * Based on the actual field IDs from section-14.json
 */
export const SECTION14_FIELD_IDS = {
  // Registration status radio button
  REGISTRATION_STATUS: "17089", // form1[0].Section14_1[0].#area[0].RadioButtonList[0]
  // Registration number text field
  REGISTRATION_NUMBER: "11407", // form1[0].Section14_1[0].TextField11[0]
  // No registration explanation
  NO_REGISTRATION_EXPLANATION: "11406", // form1[0].Section14_1[0].TextField11[1]
  // Unknown status explanation
  UNKNOWN_STATUS_EXPLANATION: "11405", // form1[0].Section14_1[0].TextField11[2]
  // Military service status radio button
  MILITARY_SERVICE_STATUS: "17077", // form1[0].Section14_1[0].#area[17].RadioButtonList[10]
} as const;

/**
 * Field name mappings for Section 14 (Selective Service)
 * Full field paths from section-14.json
 */
export const SECTION14_FIELD_NAMES = {
  // Registration status radio button
  REGISTRATION_STATUS: "form1[0].Section14_1[0].#area[0].RadioButtonList[0]",
  // Registration number text field
  REGISTRATION_NUMBER: "form1[0].Section14_1[0].TextField11[0]",
  // No registration explanation
  NO_REGISTRATION_EXPLANATION: "form1[0].Section14_1[0].TextField11[1]",
  // Unknown status explanation
  UNKNOWN_STATUS_EXPLANATION: "form1[0].Section14_1[0].TextField11[2]",
  // Military service status radio button
  MILITARY_SERVICE_STATUS: "form1[0].Section14_1[0].#area[17].RadioButtonList[10]",
} as const;

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Validation rules specific to Section 14
 */
export interface Section14ValidationRules {
  requiresRegistrationStatus: boolean;
  requiresRegistrationNumberIfYes: boolean;
  requiresExplanationIfNo: boolean;
  requiresExplanationIfUnknown: boolean;
  requiresMilitaryServiceStatus: boolean;
  maxExplanationLength: number;
  maxRegistrationNumberLength: number;
}

/**
 * Section 14 validation context
 */
export interface Section14ValidationContext {
  rules: Section14ValidationRules;
  allowPartialCompletion: boolean;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Registration status options
 */
export const REGISTRATION_STATUS_OPTIONS = [
  "Yes",
  "No", 
  "I don't know"
] as const;

/**
 * Military service status options
 */
export const MILITARY_SERVICE_OPTIONS = [
  "YES",
  "NO"
] as const;

/**
 * Validation patterns for Section 14
 */
export const SECTION14_VALIDATION = {
  REGISTRATION_NUMBER_MIN_LENGTH: 1,
  REGISTRATION_NUMBER_MAX_LENGTH: 20,
  EXPLANATION_MIN_LENGTH: 1,
  EXPLANATION_MAX_LENGTH: 500,
  REGISTRATION_NUMBER_PATTERN: /^[0-9\-\s]*$/,
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for selective service field updates
 */
export type Section14FieldUpdate = {
  fieldPath: string;
  newValue: any;
};

/**
 * Type for selective service validation results
 */
export type SelectiveServiceValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 14 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
export const createDefaultSection14 = (): Section14 => {
  // Validate field count against sections-references
  validateSectionFieldCount(14);

  return {
    _id: 14,
    section14: {
      registrationStatus: {
        ...createFieldFromReference(
          14,
          'form1[0].Section14_1[0].#area[0].RadioButtonList[0]',
          ''
        ),
        options: REGISTRATION_STATUS_OPTIONS
      },
      registrationNumber: createFieldFromReference(
        14,
        'form1[0].Section14_1[0].TextField11[0]',
        ''
      ),
      noRegistrationExplanation: createFieldFromReference(
        14,
        'form1[0].Section14_1[0].TextField11[1]',
        ''
      ),
      unknownStatusExplanation: createFieldFromReference(
        14,
        'form1[0].Section14_1[0].TextField11[2]',
        ''
      ),
      militaryServiceStatus: {
        ...createFieldFromReference(
          14,
          'form1[0].Section14_1[0].#area[17].RadioButtonList[10]',
          ''
        ),
        options: MILITARY_SERVICE_OPTIONS
      }
    }
  };
};

/**
 * Updates a specific field in the Section 14 data structure
 */
export const updateSection14Field = (
  section14Data: Section14,
  update: Section14FieldUpdate
): Section14 => {
  const { fieldPath, newValue } = update;
  const newData = { ...section14Data };

  // Update the specified field
  if (fieldPath === 'section14.registrationStatus') {
    newData.section14.registrationStatus.value = newValue;
  } else if (fieldPath === 'section14.registrationNumber') {
    newData.section14.registrationNumber.value = newValue;
  } else if (fieldPath === 'section14.noRegistrationExplanation') {
    newData.section14.noRegistrationExplanation.value = newValue;
  } else if (fieldPath === 'section14.unknownStatusExplanation') {
    newData.section14.unknownStatusExplanation.value = newValue;
  } else if (fieldPath === 'section14.militaryServiceStatus') {
    newData.section14.militaryServiceStatus.value = newValue;
  }

  return newData;
};

/**
 * Validates selective service information
 */
export function validateSelectiveService(
  selectiveServiceInfo: SelectiveServiceInformation, 
  context: Section14ValidationContext
): SelectiveServiceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validation
  if (context.rules.requiresRegistrationStatus && !selectiveServiceInfo.registrationStatus.value) {
    errors.push('Registration status is required');
  }

  // Conditional validation based on registration status
  const registrationStatus = selectiveServiceInfo.registrationStatus.value;
  
  if (registrationStatus === 'Yes') {
    if (context.rules.requiresRegistrationNumberIfYes && !selectiveServiceInfo.registrationNumber.value.trim()) {
      errors.push('Registration number is required when registration status is Yes');
    }
    
    // Validate registration number format
    if (selectiveServiceInfo.registrationNumber.value && 
        !SECTION14_VALIDATION.REGISTRATION_NUMBER_PATTERN.test(selectiveServiceInfo.registrationNumber.value)) {
      errors.push('Registration number contains invalid characters (only numbers, dashes, and spaces allowed)');
    }
  }
  
  if (registrationStatus === 'No') {
    if (context.rules.requiresExplanationIfNo && !selectiveServiceInfo.noRegistrationExplanation.value.trim()) {
      errors.push('Explanation is required when registration status is No');
    }
  }
  
  if (registrationStatus === "I don't know") {
    if (context.rules.requiresExplanationIfUnknown && !selectiveServiceInfo.unknownStatusExplanation.value.trim()) {
      errors.push('Explanation is required when registration status is "I don\'t know"');
    }
  }

  // Military service status validation
  if (context.rules.requiresMilitaryServiceStatus && !selectiveServiceInfo.militaryServiceStatus.value) {
    errors.push('Military service status is required');
  }

  // Length validation
  const fields = [
    { value: selectiveServiceInfo.registrationNumber.value, name: 'Registration number', maxLength: context.rules.maxRegistrationNumberLength },
    { value: selectiveServiceInfo.noRegistrationExplanation.value, name: 'No registration explanation', maxLength: context.rules.maxExplanationLength },
    { value: selectiveServiceInfo.unknownStatusExplanation.value, name: 'Unknown status explanation', maxLength: context.rules.maxExplanationLength }
  ];

  fields.forEach(field => {
    if (field.value && field.value.length > field.maxLength) {
      errors.push(`${field.name} exceeds maximum length of ${field.maxLength} characters`);
    }
  });

  // Warnings
  if (registrationStatus === 'No' && !selectiveServiceInfo.noRegistrationExplanation.value.trim()) {
    warnings.push('Consider providing an explanation for non-registration');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Default validation rules for Section 14
 */
export const DEFAULT_SECTION14_VALIDATION_RULES: Section14ValidationRules = {
  requiresRegistrationStatus: true,
  requiresRegistrationNumberIfYes: true,
  requiresExplanationIfNo: true,
  requiresExplanationIfUnknown: true,
  requiresMilitaryServiceStatus: true,
  maxExplanationLength: 500,
  maxRegistrationNumberLength: 20
};

/**
 * Checks if selective service information is complete
 */
export function isSection14Complete(section14Data: Section14): boolean {
  const { registrationStatus, registrationNumber, noRegistrationExplanation, unknownStatusExplanation, militaryServiceStatus } = section14Data.section14;
  
  // Basic required fields
  if (!registrationStatus.value || !militaryServiceStatus.value) {
    return false;
  }
  
  // Conditional completeness based on registration status
  switch (registrationStatus.value) {
    case 'Yes':
      return !!registrationNumber.value.trim();
    case 'No':
      return !!noRegistrationExplanation.value.trim();
    case "I don't know":
      return !!unknownStatusExplanation.value.trim();
    default:
      return false;
  }
}

/**
 * Gets the appropriate explanation field based on registration status
 */
export function getActiveExplanationField(registrationStatus: string): 'registrationNumber' | 'noRegistrationExplanation' | 'unknownStatusExplanation' | null {
  switch (registrationStatus) {
    case 'Yes':
      return 'registrationNumber';
    case 'No':
      return 'noRegistrationExplanation';
    case "I don't know":
      return 'unknownStatusExplanation';
    default:
      return null;
  }
} 