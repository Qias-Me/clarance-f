/**
 * Section 7: Your Contact Information
 *
 * TypeScript interface definitions for SF-86 Section 7 contact information data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-7.json.
 */

import type { Field } from '../formDefinition2.0';
import { createFieldFromReference, validateSectionFieldCount } from '../../utils/sections-references-loader';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Phone number interface with extension and time preferences
 */
export interface PhoneNumber {
  number: Field<string>;
  extension: Field<string>;
  isInternational: Field<boolean>;
  dayTime: Field<boolean>;
  nightTime: Field<boolean>;
}

/**
 * Contact information structure for Section 7
 */
export interface ContactInformation {
  homeEmail: Field<string>;
  workEmail: Field<string>;
  entries: PhoneNumber[];
}

/**
 * Section 7 main data structure
 */
export interface Section7 {
  _id: number;
  section7: ContactInformation;
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 7 subsection keys for type safety
 */
export type Section7SubsectionKey = 'section7';

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Validation rules specific to Section 7
 */
export interface Section7ValidationRules {

}

/**
 * Section 7 validation context
 */
export interface Section7ValidationContext {
  currentDate: Date;
  rules: Section7ValidationRules;
}

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 7 Contact Information
 * Based on the actual field IDs from section-7.json (4-digit format)
 */
export const SECTION7_FIELD_IDS = {
  // Email fields
  HOME_EMAIL: "9513", // form1[0].Sections7-9[0].TextField11[13]
  WORK_EMAIL: "9512", // form1[0].Sections7-9[0].TextField11[14]

  // Home phone fields
  HOME_PHONE_NUMBER: "9511", // form1[0].Sections7-9[0].p3-t68[1]
  HOME_PHONE_EXTENSION: "9510", // form1[0].Sections7-9[0].TextField11[15]
  HOME_PHONE_INTERNATIONAL: "9509", // form1[0].Sections7-9[0].#field[33]
  HOME_PHONE_NIGHT: "9508", // form1[0].Sections7-9[0].#field[34]
  HOME_PHONE_DAY: "9507", // form1[0].Sections7-9[0].#field[35]

  // Work phone fields
  WORK_PHONE_NUMBER: "9506", // form1[0].Sections7-9[0].p3-t68[2]
  WORK_PHONE_EXTENSION: "9505", // form1[0].Sections7-9[0].TextField11[16]
  WORK_PHONE_INTERNATIONAL: "9504", // form1[0].Sections7-9[0].#field[38]
  WORK_PHONE_NIGHT: "9503", // form1[0].Sections7-9[0].#field[39]
  WORK_PHONE_DAY: "9562", // form1[0].Sections7-9[0].#field[40]

  // Mobile phone fields
  MOBILE_PHONE_NUMBER: "9561", // form1[0].Sections7-9[0].p3-t68[3]
  MOBILE_PHONE_EXTENSION: "9560", // form1[0].Sections7-9[0].TextField11[17]
  MOBILE_PHONE_INTERNATIONAL: "9559", // form1[0].Sections7-9[0].#field[43]
  MOBILE_PHONE_NIGHT: "9558", // form1[0].Sections7-9[0].#field[44]
  MOBILE_PHONE_DAY: "9557", // form1[0].Sections7-9[0].#field[45]
} as const;

/**
 * Field name mappings for Section 7 Contact Information
 * Full field paths from section-7.json
 */
export const SECTION7_FIELD_NAMES = {
  // Email fields
  HOME_EMAIL: "form1[0].Sections7-9[0].TextField11[13]",
  WORK_EMAIL: "form1[0].Sections7-9[0].TextField11[14]",

  // Home phone fields
  HOME_PHONE_NUMBER: "form1[0].Sections7-9[0].p3-t68[1]",
  HOME_PHONE_EXTENSION: "form1[0].Sections7-9[0].TextField11[15]",
  HOME_PHONE_INTERNATIONAL: "form1[0].Sections7-9[0].#field[33]",
  HOME_PHONE_NIGHT: "form1[0].Sections7-9[0].#field[34]",
  HOME_PHONE_DAY: "form1[0].Sections7-9[0].#field[35]",

  // Work phone fields
  WORK_PHONE_NUMBER: "form1[0].Sections7-9[0].p3-t68[2]",
  WORK_PHONE_EXTENSION: "form1[0].Sections7-9[0].TextField11[16]",
  WORK_PHONE_INTERNATIONAL: "form1[0].Sections7-9[0].#field[38]",
  WORK_PHONE_NIGHT: "form1[0].Sections7-9[0].#field[39]",
  WORK_PHONE_DAY: "form1[0].Sections7-9[0].#field[40]",

  // Mobile phone fields
  MOBILE_PHONE_NUMBER: "form1[0].Sections7-9[0].p3-t68[3]",
  MOBILE_PHONE_EXTENSION: "form1[0].Sections7-9[0].TextField11[17]",
  MOBILE_PHONE_INTERNATIONAL: "form1[0].Sections7-9[0].#field[43]",
  MOBILE_PHONE_NIGHT: "form1[0].Sections7-9[0].#field[44]",
  MOBILE_PHONE_DAY: "form1[0].Sections7-9[0].#field[45]",
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for contact field updates
 */
export type Section7FieldUpdate = {
  fieldPath: string;
  newValue: any;
};

/**
 * Type for phone number updates
 */
export type PhoneNumberUpdate = {
  phoneType: 'home' | 'work' | 'mobile';
  fieldType: 'number' | 'extension' | 'isInternational' | 'dayTime' | 'nightTime';
  newValue: any;
};

/**
 * Type for email updates
 */
export type EmailUpdate = {
  emailType: 'home' | 'work';
  newValue: string;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default phone number field structure using DRY approach
 */
export const createDefaultPhoneNumber = (
  numberFieldName: string,
  extensionFieldName: string,
  internationalFieldName: string,
  dayTimeFieldName: string,
  nightTimeFieldName: string,
  label: string
): PhoneNumber => ({
  number: createFieldFromReference(7, numberFieldName, ''),
  extension: createFieldFromReference(7, extensionFieldName, ''),
  isInternational: createFieldFromReference(7, internationalFieldName, false),
  dayTime: createFieldFromReference(7, dayTimeFieldName, false),
  nightTime: createFieldFromReference(7, nightTimeFieldName, false)
});

/**
 * Creates a default Section 7 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
export const createDefaultSection7 = (): Section7 => {
  // Validate field count against sections-references (expected: 7 fields)
  // 2 email fields + 1 phone entry × 5 fields = 7 total fields
  validateSectionFieldCount(7);

  return {
    _id: 7,
    section7: {
      homeEmail: createFieldFromReference(
        7,
        'form1[0].Sections7-9[0].TextField11[13]',
        ''
      ),
      workEmail: createFieldFromReference(
        7,
        'form1[0].Sections7-9[0].TextField11[14]',
        ''
      ),
      entries: [
        // Start with only 1 phone entry - users can add more via "Add Phone" button
        createDefaultPhoneNumber(
          'form1[0].Sections7-9[0].p3-t68[1]',
          'form1[0].Sections7-9[0].TextField11[15]',
          'form1[0].Sections7-9[0].#field[33]',
          'form1[0].Sections7-9[0].#field[35]',
          'form1[0].Sections7-9[0].#field[34]',
          'Phone'
        )
      ]
    }
  };
};

/**
 * Updates a field in Section 7 data structure
 */
export const updateSection7Field = (
  section7Data: Section7,
  update: Section7FieldUpdate
): Section7 => {
  const newData = { ...section7Data };

  // Use lodash set to update nested field paths
  const fieldPath = update.fieldPath.replace(/^section7\./, '');

  if (fieldPath.includes('.')) {
    // Handle nested phone number fields
    const [phoneType, fieldType] = fieldPath.split('.');
    
    // Check if phoneType is 'home', 'work', or 'mobile' to access entries correctly
    if (phoneType === 'home' || phoneType === 'work' || phoneType === 'mobile') {
      // Get the index in the entries array based on phone type
      const entryIndex = phoneType === 'home' ? 0 : phoneType === 'work' ? 1 : 2;
      
      // Access the correct entry in the entries array
      const phoneEntry = newData.section7.entries[entryIndex];
      if (phoneEntry && phoneEntry[fieldType as keyof PhoneNumber]) {
        (phoneEntry[fieldType as keyof PhoneNumber] as Field<any>).value = update.newValue;
      }
    }
  } else {
    // Handle direct email fields
    if (newData.section7[fieldPath as keyof ContactInformation]) {
      (newData.section7[fieldPath as keyof ContactInformation] as Field<any>).value = update.newValue;
    }
  }

  return newData;
};
