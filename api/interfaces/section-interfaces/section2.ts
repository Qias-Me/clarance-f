/**
 * Section 2: Date of Birth
 *
 * TypeScript interface definitions for SF-86 Section 2 (Date of Birth) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-2.json.
 */

import type { Field } from '../formDefinition2.0';
import { createFieldFromReference } from '../../utils/sections-references-loader';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Date of Birth information structure for Section 2
 */
export interface DateOfBirth {
  date: Field<string>;
  isEstimated: Field<boolean>;
}

/**
 * Section 2 main data structure
 */
export interface Section2 {
  _id: number;
  section2: DateOfBirth;
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 2 subsection keys for type safety
 */
export type Section2SubsectionKey = 'dateOfBirth';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Age validation constants
 */
export const AGE_LIMITS = {
  MINIMUM: 18,
  MAXIMUM: 120
} as const;

/**
 * Date validation constants
 */
export const DATE_VALIDATION_CONSTANTS = {
  MIN_YEAR: 1900,
  MAX_YEAR: new Date().getFullYear(),
  DEFAULT_FORMAT: 'MM/DD/YYYY'
} as const;

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Validation rules specific to Section 2
 */
export interface Section2ValidationRules {
  requiresDateOfBirth: boolean;
  minimumAge: number;
  maximumAge: number;
  allowsEstimatedDate: boolean;
  dateFormat: string;
}

/**
 * Section 2 validation context
 */
export interface Section2ValidationContext {
  currentDate: Date;
  rules: Section2ValidationRules;
}

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 2 (Date of Birth)
 * Based on the actual field IDs from section-2.json (4-digit format)
 */
export const SECTION2_FIELD_IDS = {
  // Date of birth fields
  DATE: "9432", // form1[0].Sections1-6[0].From_Datefield_Name_2[0]
  IS_ESTIMATED: "9431" // form1[0].Sections1-6[0].#field[18]
} as const;

/**
 * Field name mappings for Section 2 (Date of Birth)
 * Full field paths from section-2.json
 */
export const SECTION2_FIELD_NAMES = {
  // Date of birth fields
  DATE: "form1[0].Sections1-6[0].From_Datefield_Name_2[0]",
  IS_ESTIMATED: "form1[0].Sections1-6[0].#field[18]"
} as const;

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Date format patterns
 */
export const DATE_FORMATS = {
  MM_DD_YYYY: 'MM/DD/YYYY',
  DD_MM_YYYY: 'DD/MM/YYYY',
  YYYY_MM_DD: 'YYYY-MM-DD',
  ISO_8601: 'YYYY-MM-DDTHH:mm:ss.sssZ'
} as const;

/**
 * Date validation patterns
 */
export const DATE_VALIDATION = {
  MIN_YEAR: DATE_VALIDATION_CONSTANTS.MIN_YEAR,
  MAX_YEAR: DATE_VALIDATION_CONSTANTS.MAX_YEAR,
  DATE_REGEX: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/,
  ISO_REGEX: /^\d{4}-\d{2}-\d{2}$/
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for date of birth field updates
 */
export type Section2FieldUpdate = {
  fieldPath: 'section2.date' | 'section2.isEstimated';
  newValue: string | boolean;
};

/**
 * Type for date validation results
 */
export type DateValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  parsedDate?: Date;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 2 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
export const createDefaultSection2 = (): Section2 => ({
  _id: 2,
  section2: {
    date: createFieldFromReference(
      2,
      'form1[0].Sections1-6[0].From_Datefield_Name_2[0]',
      ''
    ),
    isEstimated: createFieldFromReference(
      2,
      'form1[0].Sections1-6[0].#field[18]',
      false
    )
  }
});

/**
 * Updates a specific field in the Section 2 data structure
 */
export const updateSection2Field = (
  section2Data: Section2,
  update: Section2FieldUpdate
): Section2 => {
  const { fieldPath, newValue } = update;
  const newData = { ...section2Data };

  // Update the specified field
  if (fieldPath === 'section2.date') {
    newData.section2.date.value = newValue;
  } else if (fieldPath === 'section2.isEstimated') {
    newData.section2.isEstimated.value = newValue;
  }

  return newData;
};

/**
 * Format a date string to MM/DD/YYYY format
 * @param date - The date string to format
 * @returns Formatted date string or original if parsing fails
 */
export const formatDateString = (date: string): string => {
  return formatDateForDisplay(date, DATE_FORMATS.MM_DD_YYYY);
};

/**
 * Validates a date of birth entry
 * @param dateOfBirth - The date of birth data to validate
 * @param context - Validation context with rules and current date
 * @returns Validation result with errors, warnings, and parsed date
 */
export function validateDateOfBirth(dateOfBirth: DateOfBirth, context: Section2ValidationContext): DateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let parsedDate: Date | undefined;

  // Check required field
  if (context.rules.requiresDateOfBirth && !dateOfBirth.date.value.trim()) {
    errors.push('Date of birth is required');
    return { isValid: false, errors, warnings };
  }

  // Validate date if provided
  if (dateOfBirth.date.value) {
    const dateValidation = validateDateFormat(dateOfBirth.date.value, context);
    errors.push(...dateValidation.errors);
    warnings.push(...dateValidation.warnings);
    parsedDate = dateValidation.parsedDate;
  }

  // Validate estimation settings
  const estimationValidation = validateEstimation(dateOfBirth.isEstimated.value, context.rules);
  errors.push(...estimationValidation.errors);
  warnings.push(...estimationValidation.warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    parsedDate
  };
}

/**
 * Validates date format and value
 * @private
 */
function validateDateFormat(dateValue: string, context: Section2ValidationContext): DateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let parsedDate: Date | undefined;

  // Check format
  if (!DATE_VALIDATION.DATE_REGEX.test(dateValue)) {
    errors.push('Date must be in MM/DD/YYYY format');
    return { isValid: false, errors, warnings };
  }

  // Parse date
  try {
    parsedDate = new Date(dateValue);
    
    if (isNaN(parsedDate.getTime())) {
      errors.push('Invalid date provided');
      return { isValid: false, errors, warnings };
    }

    // Validate age
    const age = calculateAge(parsedDate, context.currentDate);
    if (age < context.rules.minimumAge) {
      errors.push(`Age must be at least ${context.rules.minimumAge} years`);
    }
    if (age > context.rules.maximumAge) {
      errors.push(`Age cannot exceed ${context.rules.maximumAge} years`);
    }

    // Check future date
    if (parsedDate > context.currentDate) {
      errors.push('Date of birth cannot be in the future');
    }

    // Validate year range
    const year = parsedDate.getFullYear();
    if (year < DATE_VALIDATION.MIN_YEAR || year > DATE_VALIDATION.MAX_YEAR) {
      errors.push(`Year must be between ${DATE_VALIDATION.MIN_YEAR} and ${DATE_VALIDATION.MAX_YEAR}`);
    }
  } catch (error) {
    errors.push('Unable to parse date');
  }

  return { isValid: errors.length === 0, errors, warnings, parsedDate };
}

/**
 * Validates estimation settings
 * @private
 */
function validateEstimation(isEstimated: boolean, rules: Section2ValidationRules): { errors: string[], warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (isEstimated && !rules.allowsEstimatedDate) {
    errors.push('Estimated dates are not allowed for date of birth');
  }

  if (isEstimated) {
    warnings.push('Date of birth is marked as estimated');
  }

  return { errors, warnings };
}

/**
 * Calculates age in years
 * @param birthDate - The birth date
 * @param currentDate - The date to calculate age at
 * @returns Age in years
 */
export function calculateAge(birthDate: Date, currentDate: Date): number {
  const age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = currentDate.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
    return age - 1;
  }

  return age;
}

/**
 * Formats a date for display in various formats
 * @param date - The date string to format
 * @param format - The desired output format (default: MM/DD/YYYY)
 * @returns Formatted date string or original if parsing fails
 */
export function formatDateForDisplay(date: string, format: string = DATE_FORMATS.MM_DD_YYYY): string {
  if (!date) return '';

  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return date;

    switch (format) {
      case DATE_FORMATS.MM_DD_YYYY:
        return parsedDate.toLocaleDateString('en-US');
      case DATE_FORMATS.DD_MM_YYYY:
        return parsedDate.toLocaleDateString('en-GB');
      case DATE_FORMATS.YYYY_MM_DD:
        return parsedDate.toISOString().split('T')[0];
      default:
        return date;
    }
  } catch {
    return date;
  }
}
