/**
 * Section 8: U.S. Passport Information
 *
 * TypeScript interface definitions for SF-86 Section 8 passport information data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings.
 */

import type { Field } from '../formDefinition2.0';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Passport name information (as it appears on passport)
 */
export interface PassportName {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  suffix: Field<string>;
}

/**
 * Passport dates with estimation support
 */
export interface PassportDates {
  issueDate: {
    date: Field<string>;
    estimated: Field<boolean>;
  };
  expirationDate: {
    date: Field<string>;
    estimated: Field<boolean>;
  };
}

/**
 * Passport information details
 */
export interface PassportInfo {
  hasPassport: Field<"YES" | "NO">;
  passportNumber: Field<string>;
  nameOnPassport: PassportName;
  dates: PassportDates;
}

/**
 * Section 8 main data structure
 */
export interface Section8 {
  _id: number;
  passportInfo: PassportInfo;
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 8 subsection keys for type safety
 */
export type Section8SubsectionKey = 'passportInfo';

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Validation rules specific to Section 8
 */
export interface Section8ValidationRules {
  requiresPassportInfo: boolean;
  passportNumberFormat: RegExp;
  requiresNameOnPassport: boolean;
  allowsEstimatedDates: boolean;
  maxPassportAge: number; // in years
}

/**
 * Section 8 validation context
 */
export interface Section8ValidationContext {
  currentDate: Date;
  rules: Section8ValidationRules;
}

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID patterns for Section 8
 * Based on the Sections7-9 pattern from the JSON reference
 */
export const SECTION8_FIELD_IDS = {
  // Main passport question
  HAS_PASSPORT: "form1[0].Sections7-9[0].RadioButtonList[0]",
  
  // Passport details
  PASSPORT_NUMBER: "form1[0].Sections7-9[0].p3-t68[0]",
  
  // Passport name fields
  LAST_NAME: "form1[0].Sections7-9[0].TextField11[1]",
  FIRST_NAME: "form1[0].Sections7-9[0].TextField11[2]",
  MIDDLE_NAME: "form1[0].Sections7-9[0].TextField11[0]",
  SUFFIX: "form1[0].Sections7-9[0].suffix[0]",
  
  // Date fields
  ISSUE_DATE: "form1[0].Sections7-9[0].#area[0].From_Datefield_Name_2[0]",
  ISSUE_DATE_ESTIMATED: "form1[0].Sections7-9[0].#area[0].#field[4]",
  EXPIRATION_DATE: "form1[0].Sections7-9[0].#area[0].To_Datefield_Name_2[0]",
  EXPIRATION_DATE_ESTIMATED: "form1[0].Sections7-9[0].#field[23]"
} as const;

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Passport number validation patterns
 */
export const PASSPORT_VALIDATION = {
  // US Passport format: 9 digits or letters
  US_PASSPORT_REGEX: /^[A-Z0-9]{9}$/,
  MIN_LENGTH: 6,
  MAX_LENGTH: 15,
  ALLOWED_CHARACTERS: /^[A-Z0-9]*$/
} as const;

/**
 * Common passport suffixes
 */
export const PASSPORT_SUFFIXES = {
  JR: 'Jr.',
  SR: 'Sr.',
  II: 'II',
  III: 'III',
  IV: 'IV',
  V: 'V',
  NONE: ''
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for creating new Section 8 data
 */
export type CreateSection8Params = {
  hasPassport?: boolean;
  defaultEstimated?: boolean;
};

/**
 * Type for Section 8 field updates
 */
export type Section8FieldUpdate = {
  fieldPath: string;
  newValue: string | boolean;
};

/**
 * Type for passport validation results
 */
export type PassportValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 8 data structure
 */
export function createDefaultSection8(): Section8 {
  return {
    _id: 8,
    passportInfo: {
      hasPassport: { value: "NO", id: SECTION8_FIELD_IDS.HAS_PASSPORT },
      passportNumber: { value: '', id: SECTION8_FIELD_IDS.PASSPORT_NUMBER },
      nameOnPassport: {
        lastName: { value: '', id: SECTION8_FIELD_IDS.LAST_NAME },
        firstName: { value: '', id: SECTION8_FIELD_IDS.FIRST_NAME },
        middleName: { value: '', id: SECTION8_FIELD_IDS.MIDDLE_NAME },
        suffix: { value: '', id: SECTION8_FIELD_IDS.SUFFIX }
      },
      dates: {
        issueDate: {
          date: { value: '', id: SECTION8_FIELD_IDS.ISSUE_DATE },
          estimated: { value: false, id: SECTION8_FIELD_IDS.ISSUE_DATE_ESTIMATED }
        },
        expirationDate: {
          date: { value: '', id: SECTION8_FIELD_IDS.EXPIRATION_DATE },
          estimated: { value: false, id: SECTION8_FIELD_IDS.EXPIRATION_DATE_ESTIMATED }
        }
      }
    }
  };
}

/**
 * Validates passport information
 */
export function validatePassportInfo(passportInfo: PassportInfo, context: Section8ValidationContext): PassportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // If no passport, skip detailed validation
  if (passportInfo.hasPassport.value === "NO") {
    return { isValid: true, errors, warnings };
  }

  // Passport number validation
  if (!passportInfo.passportNumber.value.trim()) {
    errors.push('Passport number is required when passport is indicated');
  } else {
    const passportNum = passportInfo.passportNumber.value.toUpperCase();
    
    if (passportNum.length < PASSPORT_VALIDATION.MIN_LENGTH || 
        passportNum.length > PASSPORT_VALIDATION.MAX_LENGTH) {
      errors.push(`Passport number must be between ${PASSPORT_VALIDATION.MIN_LENGTH} and ${PASSPORT_VALIDATION.MAX_LENGTH} characters`);
    }
    
    if (!PASSPORT_VALIDATION.ALLOWED_CHARACTERS.test(passportNum)) {
      errors.push('Passport number can only contain letters and numbers');
    }
    
    if (!PASSPORT_VALIDATION.US_PASSPORT_REGEX.test(passportNum)) {
      warnings.push('Passport number format may not match standard US passport format');
    }
  }

  // Name validation
  if (context.rules.requiresNameOnPassport) {
    if (!passportInfo.nameOnPassport.lastName.value.trim()) {
      errors.push('Last name on passport is required');
    }
    if (!passportInfo.nameOnPassport.firstName.value.trim()) {
      errors.push('First name on passport is required');
    }
  }

  // Date validation
  const issueDate = passportInfo.dates.issueDate.date.value;
  const expirationDate = passportInfo.dates.expirationDate.date.value;

  if (issueDate && expirationDate) {
    try {
      const issueParsed = new Date(issueDate);
      const expirationParsed = new Date(expirationDate);
      
      if (issueParsed >= expirationParsed) {
        errors.push('Passport issue date must be before expiration date');
      }
      
      if (expirationParsed < context.currentDate) {
        warnings.push('Passport appears to be expired');
      }
      
      const passportAge = (context.currentDate.getTime() - issueParsed.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (passportAge > context.rules.maxPassportAge) {
        warnings.push(`Passport is older than ${context.rules.maxPassportAge} years`);
      }
      
    } catch (error) {
      errors.push('Invalid date format in passport dates');
    }
  }

  // Estimation warnings
  if (passportInfo.dates.issueDate.estimated.value) {
    warnings.push('Passport issue date is estimated');
  }
  if (passportInfo.dates.expirationDate.estimated.value) {
    warnings.push('Passport expiration date is estimated');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Updates a specific field in Section 8
 */
export function updateSection8Field(
  section8: Section8, 
  update: Section8FieldUpdate
): Section8 {
  const updated = { ...section8 };
  const fieldPath = update.fieldPath.split('.');
  
  // Navigate to the correct nested field and update it
  let current: any = updated.passportInfo;
  for (let i = 0; i < fieldPath.length - 1; i++) {
    current = current[fieldPath[i]];
  }
  
  const finalField = fieldPath[fieldPath.length - 1];
  if (current[finalField] && typeof current[finalField] === 'object' && 'value' in current[finalField]) {
    current[finalField].value = update.newValue;
  }
  
  return updated;
}

/**
 * Checks if passport information is required based on other form data
 */
export function isPassportRequired(formData: any): boolean {
  // Add logic based on other sections (e.g., citizenship status)
  // This would typically check Section 9 (Citizenship) data
  return false; // Default implementation
}
