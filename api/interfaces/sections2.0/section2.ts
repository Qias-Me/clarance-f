/**
 * Section 2: Date of Birth
 *
 * TypeScript interface definitions for SF-86 Section 2 date of birth data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings.
 */

import type { Field } from '../formDefinition2.0';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Date of birth with estimation support
 */
export interface DateOfBirth {
  date: Field<string>;
  estimated: Field<boolean>;
}

/**
 * Section 2 main data structure
 */
export interface Section2 {
  _id: number;
  dateOfBirth: DateOfBirth;
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 2 subsection keys for type safety
 */
export type Section2SubsectionKey = 'dateOfBirth';

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
 * PDF field ID patterns for Section 2
 * Based on the Sections1-6 pattern from the JSON reference
 */
export const SECTION2_FIELD_IDS = {
  // Date of birth fields
  DATE_OF_BIRTH: "form1[0].Sections1-6[0].From_Datefield_Name_2[0]",
  ESTIMATED: "form1[0].Sections1-6[0].#field[18]"
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
  MIN_YEAR: 1900,
  MAX_YEAR: new Date().getFullYear(),
  DATE_REGEX: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/,
  ISO_REGEX: /^\d{4}-\d{2}-\d{2}$/
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for creating new Section 2 data
 */
export type CreateSection2Params = {
  defaultEstimated?: boolean;
};

/**
 * Type for Section 2 field updates
 */
export type Section2FieldUpdate = {
  fieldPath: 'date' | 'estimated';
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
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 2 data structure
 */
export function createDefaultSection2(): Section2 {
  return {
    _id: 2,
    dateOfBirth: {
      date: { value: '', id: SECTION2_FIELD_IDS.DATE_OF_BIRTH },
      estimated: { value: false, id: SECTION2_FIELD_IDS.ESTIMATED }
    }
  };
}

/**
 * Validates a date of birth entry
 */
export function validateDateOfBirth(dateOfBirth: DateOfBirth, context: Section2ValidationContext): DateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let parsedDate: Date | undefined;

  // Required field validation
  if (context.rules.requiresDateOfBirth && !dateOfBirth.date.value.trim()) {
    errors.push('Date of birth is required');
    return { isValid: false, errors, warnings };
  }

  // Date format validation
  if (dateOfBirth.date.value) {
    if (!DATE_VALIDATION.DATE_REGEX.test(dateOfBirth.date.value)) {
      errors.push('Date must be in MM/DD/YYYY format');
      return { isValid: false, errors, warnings };
    }

    // Parse and validate date
    try {
      parsedDate = new Date(dateOfBirth.date.value);
      
      if (isNaN(parsedDate.getTime())) {
        errors.push('Invalid date provided');
        return { isValid: false, errors, warnings };
      }

      // Age validation
      const age = calculateAge(parsedDate, context.currentDate);
      
      if (age < context.rules.minimumAge) {
        errors.push(`Age must be at least ${context.rules.minimumAge} years`);
      }
      
      if (age > context.rules.maximumAge) {
        errors.push(`Age cannot exceed ${context.rules.maximumAge} years`);
      }

      // Future date validation
      if (parsedDate > context.currentDate) {
        errors.push('Date of birth cannot be in the future');
      }

      // Year range validation
      const year = parsedDate.getFullYear();
      if (year < DATE_VALIDATION.MIN_YEAR || year > DATE_VALIDATION.MAX_YEAR) {
        errors.push(`Year must be between ${DATE_VALIDATION.MIN_YEAR} and ${DATE_VALIDATION.MAX_YEAR}`);
      }

    } catch (error) {
      errors.push('Unable to parse date');
    }
  }

  // Estimation validation
  if (dateOfBirth.estimated.value && !context.rules.allowsEstimatedDate) {
    errors.push('Estimated dates are not allowed for date of birth');
  }

  if (dateOfBirth.estimated.value) {
    warnings.push('Date of birth is marked as estimated');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    parsedDate
  };
}

/**
 * Calculates age in years
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
 * Updates a specific field in Section 2
 */
export function updateSection2Field(
  section2: Section2, 
  update: Section2FieldUpdate
): Section2 {
  const updated = { ...section2 };
  
  switch (update.fieldPath) {
    case 'date':
      updated.dateOfBirth.date.value = update.newValue as string;
      break;
    case 'estimated':
      updated.dateOfBirth.estimated.value = update.newValue as boolean;
      break;
  }
  
  return updated;
}

/**
 * Formats a date for display
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
