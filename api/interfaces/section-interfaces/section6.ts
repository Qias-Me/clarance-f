/**
 * Section 6: Your Identifying Information
 *
 * TypeScript interface definitions for SF-86 Section 6 (Your Identifying Information) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-6.json.
 */

import type { Field } from '../formDefinition2.0';
import { createFieldFromReference, validateSectionFieldCount } from '../../utils/sections-references-loader';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Physical Information structure for Section 6
 */
export interface PhysicalInformation {
  heightFeet: Field<string>;
  heightInches: Field<string>;
  weight: Field<string>;
  hairColor: Field<"Bald" | "Black" | "Blonde or Strawberry" | "Brown" | "Gray or Partially Gray" | "Red or Auburn" | "Sandy" | "White" | "Blue" | "Green" | "Orange" | "Pink" | "Purple" | "Unspecified or Unknown">;
  eyeColor: Field<"Black" | "Blue" | "Brown" | "Gray" | "Green" | "Hazel" | "Maroon" | "Multicolored" | "Pink" | "Unknown">;
  sex: Field<"Male" | "Female">;
}

/**
 * Section 6 main data structure
 */
export interface Section6 {
  _id: number;
  section6: PhysicalInformation;
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 6 subsection keys for type safety
 */
export type Section6SubsectionKey = 'section6';

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 6 (Your Identifying Information)
 * Based on the actual field IDs from section-6.json (4-digit format)
 */
export const SECTION6_FIELD_IDS = {
  // Physical information fields
  HEIGHT_FEET: "9434", // form1[0].Sections1-6[0].DropDownList8[0]
  HEIGHT_INCHES: "9433", // form1[0].Sections1-6[0].DropDownList7[0]
  WEIGHT: "9438", // form1[0].Sections1-6[0].TextField11[5]
  HAIR_COLOR: "9437", // form1[0].Sections1-6[0].DropDownList10[0]
  EYE_COLOR: "9436", // form1[0].Sections1-6[0].DropDownList9[0]
  SEX: "17238" // form1[0].Sections1-6[0].p3-rb3b[0]
} as const;

/**
 * Field name mappings for Section 6 (Your Identifying Information)
 * Full field paths from section-6.json
 */
export const SECTION6_FIELD_NAMES = {
  // Physical information fields
  HEIGHT_FEET: "form1[0].Sections1-6[0].DropDownList8[0]",
  HEIGHT_INCHES: "form1[0].Sections1-6[0].DropDownList7[0]",
  WEIGHT: "form1[0].Sections1-6[0].TextField11[5]",
  HAIR_COLOR: "form1[0].Sections1-6[0].DropDownList10[0]",
  EYE_COLOR: "form1[0].Sections1-6[0].DropDownList9[0]",
  SEX: "form1[0].Sections1-6[0].p3-rb3b[0]"
} as const;

// ============================================================================
// DROPDOWN OPTIONS
// ============================================================================

/**
 * Hair color options for dropdown
 */
export const HAIR_COLOR_OPTIONS = [
  "Bald",
  "Black",
  "Blonde or Strawberry",
  "Brown",
  "Gray or Partially Gray",
  "Red or Auburn",
  "Sandy",
  "White",
  "Blue",
  "Green",
  "Orange",
  "Pink",
  "Purple",
  "Unspecified or Unknown"
] as const;

/**
 * Eye color options for dropdown
 */
export const EYE_COLOR_OPTIONS = [
  "Black",
  "Blue",
  "Brown",
  "Gray",
  "Green",
  "Hazel",
  "Maroon",
  "Multicolored",
  "Pink",
  "Unknown"
] as const;

/**
 * Sex options for radio buttons
 */
export const SEX_OPTIONS = [
  "Male",
  "Female"
] as const;

/**
 * Height feet options for dropdown
 */
export const HEIGHT_FEET_OPTIONS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9"
] as const;

/**
 * Height inches options for dropdown
 */
export const HEIGHT_INCHES_OPTIONS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11"
] as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for physical information field updates
 */
export type Section6FieldUpdate = {
  fieldPath: string;
  newValue: any;
};

/**
 * Type-safe hair color values
 */
export type HairColor = typeof HAIR_COLOR_OPTIONS[number];

/**
 * Type-safe eye color values
 */
export type EyeColor = typeof EYE_COLOR_OPTIONS[number];

/**
 * Type-safe sex values
 */
export type Sex = typeof SEX_OPTIONS[number];

/**
 * Type-safe height feet values
 */
export type HeightFeet = typeof HEIGHT_FEET_OPTIONS[number];

/**
 * Type-safe height inches values
 */
export type HeightInches = typeof HEIGHT_INCHES_OPTIONS[number];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 6 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
export const createDefaultSection6 = (): Section6 => {
  // Validate field count against sections-references
  validateSectionFieldCount(6);

  return {
    _id: 6,
    section6: {
      heightFeet: createFieldFromReference(
        6,
        'form1[0].Sections1-6[0].DropDownList8[0]',
        ''
      ),
      heightInches: createFieldFromReference(
        6,
        'form1[0].Sections1-6[0].DropDownList7[0]',
        ''
      ),
      weight: createFieldFromReference(
        6,
        'form1[0].Sections1-6[0].TextField11[5]',
        ''
      ),
      hairColor: createFieldFromReference(
        6,
        'form1[0].Sections1-6[0].DropDownList10[0]',
        ''
      ),
      eyeColor: createFieldFromReference(
        6,
        'form1[0].Sections1-6[0].DropDownList9[0]',
        ''
      ),
      sex: createFieldFromReference(
        6,
        'form1[0].Sections1-6[0].p3-rb3b[0]',
        ''
      )
    }
  };
};

/**
 * Updates a specific field in the Section 6 data structure
 */
export const updateSection6Field = (
  section6Data: Section6,
  update: Section6FieldUpdate
): Section6 => {
  const { fieldPath, newValue } = update;
  const newData = { ...section6Data };
  
  // Update the specified field
  if (fieldPath === 'section6.heightFeet') {
    newData.section6.heightFeet.value = newValue;
  } else if (fieldPath === 'section6.heightInches') {
    newData.section6.heightInches.value = newValue;
  } else if (fieldPath === 'section6.weight') {
    newData.section6.weight.value = newValue;
  } else if (fieldPath === 'section6.hairColor') {
    newData.section6.hairColor.value = newValue;
  } else if (fieldPath === 'section6.eyeColor') {
    newData.section6.eyeColor.value = newValue;
  } else if (fieldPath === 'section6.sex') {
    newData.section6.sex.value = newValue;
  }
  
  return newData;
};

/**
 * Calculates height in inches from feet and inches components
 */
export const calculateTotalHeightInches = (feet: string, inches: string): number => {
  const feetNum = parseInt(feet, 10) || 0;
  const inchesNum = parseInt(inches, 10) || 0;
  
  return (feetNum * 12) + inchesNum;
};

/**
 * Formats height as a string (e.g., "5'10\"")
 */
export const formatHeight = (feet: string, inches: string): string => {
  return `${feet}'${inches}"`;
}; 