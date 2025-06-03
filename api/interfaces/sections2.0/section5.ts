/**
 * Section 5: Other Names Used
 *
 * TypeScript interface definitions for SF-86 Section 5 (Other Names Used) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-5.json.
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Other Name Entry structure for Section 5
 */
export interface OtherNameEntry {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  suffix: FieldWithOptions<string>;
  from: Field<string>;
  to: Field<string>;
  reasonChanged: Field<string>;
  present: Field<boolean>;
}

/**
 * Other Names Used structure for Section 5
 */
export interface OtherNamesUsed {
  hasOtherNames: Field<"YES" | "NO">; // Must be "YES" or "NO" string for PDF radio button
  otherNames: OtherNameEntry[];
}

/**
 * Section 5 main data structure
 */
export interface Section5 {
  _id: number;
  section5: OtherNamesUsed;
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 5 subsection keys for type safety
 */
export type Section5SubsectionKey = 'section5';

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 5 (Other Names Used)
 * Based on the actual field IDs from section-5.json (4-digit format)
 */
export const SECTION5_FIELD_IDS = {
  // Has other names field
  HAS_OTHER_NAMES: "17240", // form1[0].Sections1-6[0].section5[0].RadioButtonList[0]

  // First entry fields
  LAST_NAME_1: "9500", // form1[0].Sections1-6[0].section5[0].TextField11[2]
  FIRST_NAME_1: "9501", // form1[0].Sections1-6[0].section5[0].TextField11[1]
  MIDDLE_NAME_1: "9502", // form1[0].Sections1-6[0].section5[0].TextField11[0]
  SUFFIX_1: "9494", // form1[0].Sections1-6[0].section5[0].suffix[0]
  FROM_1: "9498", // form1[0].Sections1-6[0].section5[0].#area[0].From_Datefield_Name_2[0]
  TO_1: "9497", // form1[0].Sections1-6[0].section5[0].#area[0].To_Datefield_Name_2[0]
  REASON_1: "9499", // form1[0].Sections1-6[0].section5[0].TextField11[3]
  PRESENT_1: "9493" // form1[0].Sections1-6[0].section5[0].#field[7]
} as const;

/**
 * Field name mappings for Section 5 (Other Names Used)
 * Full field paths from section-5.json
 */
export const SECTION5_FIELD_NAMES = {
  // Has other names field
  HAS_OTHER_NAMES: "form1[0].Sections1-6[0].section5[0].RadioButtonList[0]",

  // First entry fields
  LAST_NAME_1: "form1[0].Sections1-6[0].section5[0].TextField11[2]",
  FIRST_NAME_1: "form1[0].Sections1-6[0].section5[0].TextField11[1]",
  MIDDLE_NAME_1: "form1[0].Sections1-6[0].section5[0].TextField11[0]",
  SUFFIX_1: "form1[0].Sections1-6[0].section5[0].suffix[0]",
  FROM_1: "form1[0].Sections1-6[0].section5[0].#area[0].From_Datefield_Name_2[0]",
  TO_1: "form1[0].Sections1-6[0].section5[0].#area[0].To_Datefield_Name_2[0]",
  REASON_1: "form1[0].Sections1-6[0].section5[0].TextField11[3]",
  PRESENT_1: "form1[0].Sections1-6[0].section5[0].#field[7]"
} as const;

// ============================================================================
// DROPDOWN OPTIONS
// ============================================================================

/**
 * Suffix options for dropdown
 */
export const SUFFIX_OPTIONS = [
  "Jr", "Sr", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "Other"
] as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for other names field updates
 */
export type Section5FieldUpdate = {
  fieldPath: string;
  newValue: any;
  index?: number;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default Other Name Entry with the provided index
 */
export const createDefaultOtherNameEntry = (index: number): OtherNameEntry => {
  // For index beyond the first entry, we would need to define field IDs
  // based on the pattern from the PDF structure
  const indexStr = index === 0 ? '1' : `${index + 1}`;

  return {
    lastName: {
      id: index === 0 ? SECTION5_FIELD_IDS.LAST_NAME_1 : `other_name_last_${indexStr}`,
      name: index === 0 ? SECTION5_FIELD_NAMES.LAST_NAME_1 : `other_name_last_${indexStr}`,
      type: 'PDFTextField',
      label: 'Last Name',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    firstName: {
      id: index === 0 ? SECTION5_FIELD_IDS.FIRST_NAME_1 : `other_name_first_${indexStr}`,
      name: index === 0 ? SECTION5_FIELD_NAMES.FIRST_NAME_1 : `other_name_first_${indexStr}`,
      type: 'PDFTextField',
      label: 'First Name',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    middleName: {
      id: index === 0 ? SECTION5_FIELD_IDS.MIDDLE_NAME_1 : `other_name_middle_${indexStr}`,
      name: index === 0 ? SECTION5_FIELD_NAMES.MIDDLE_NAME_1 : `other_name_middle_${indexStr}`,
      type: 'PDFTextField',
      label: 'Middle Name',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    suffix: {
      id: index === 0 ? SECTION5_FIELD_IDS.SUFFIX_1 : `other_name_suffix_${indexStr}`,
      name: index === 0 ? SECTION5_FIELD_NAMES.SUFFIX_1 : `other_name_suffix_${indexStr}`,
      type: 'PDFDropdown',
      label: 'Suffix',
      value: '',
      options: SUFFIX_OPTIONS,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    from: {
      id: index === 0 ? SECTION5_FIELD_IDS.FROM_1 : `other_name_from_${indexStr}`,
      name: index === 0 ? SECTION5_FIELD_NAMES.FROM_1 : `other_name_from_${indexStr}`,
      type: 'PDFTextField',
      label: 'From (Month/Year)',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    to: {
      id: index === 0 ? SECTION5_FIELD_IDS.TO_1 : `other_name_to_${indexStr}`,
      name: index === 0 ? SECTION5_FIELD_NAMES.TO_1 : `other_name_to_${indexStr}`,
      type: 'PDFTextField',
      label: 'To (Month/Year)',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    reasonChanged: {
      id: index === 0 ? SECTION5_FIELD_IDS.REASON_1 : `other_name_reason_${indexStr}`,
      name: index === 0 ? SECTION5_FIELD_NAMES.REASON_1 : `other_name_reason_${indexStr}`,
      type: 'PDFTextField',
      label: 'Reason Changed',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    present: {
      id: index === 0 ? SECTION5_FIELD_IDS.PRESENT_1 : `other_name_present_${indexStr}`,
      name: index === 0 ? SECTION5_FIELD_NAMES.PRESENT_1 : `other_name_present_${indexStr}`,
      type: 'PDFCheckBox',
      label: 'Present',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    }
  };
};

/**
 * Creates a default Section 5 data structure with correct field IDs
 */
export const createDefaultSection5 = (): Section5 => ({
  _id: 5,
  section5: {
    hasOtherNames: {
      id: SECTION5_FIELD_IDS.HAS_OTHER_NAMES,
      name: SECTION5_FIELD_NAMES.HAS_OTHER_NAMES,
      type: 'PDFRadioGroup',
      label: 'Have you used any other names?',
      value: "NO", // Must be string "NO" or "YES", not boolean
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    otherNames: [] // Start with empty array - entries are added when user selects "YES"
  }
});

/**
 * Updates a specific field in the Section 5 data structure
 */
export const updateSection5Field = (
  section5Data: Section5,
  update: Section5FieldUpdate
): Section5 => {
  const { fieldPath, newValue, index: defaultIndex = 0 } = update;
  const newData = { ...section5Data };

  // Update the specified field
  if (fieldPath === 'section5.hasOtherNames') {
    newData.section5.hasOtherNames.value = newValue;
  } else if (fieldPath.startsWith('section5.otherNames')) {
    // Parse the field path to extract array index and field name
    // Examples: 
    // - 'section5.otherNames[0].lastName' -> index: 0, fieldName: 'lastName'
    // - 'section5.otherNames.lastName' -> use defaultIndex, fieldName: 'lastName'
    
    let entryIndex = defaultIndex;
    let fieldName = '';
    
    const arrayIndexMatch = fieldPath.match(/section5\.otherNames\[(\d+)\]\.(.+)/);
    if (arrayIndexMatch) {
      // Field path includes array index: section5.otherNames[0].lastName
      entryIndex = parseInt(arrayIndexMatch[1], 10);
      fieldName = arrayIndexMatch[2];
    } else {
      // Field path without array index: section5.otherNames.lastName (use provided index)
      fieldName = fieldPath.split('.').pop() || '';
    }

    // Make sure we have enough entries
    while (newData.section5.otherNames.length <= entryIndex) {
      newData.section5.otherNames.push(
        createDefaultOtherNameEntry(newData.section5.otherNames.length)
      );
    }

    // Update the specific field in the entry
    if (fieldName && fieldName in newData.section5.otherNames[entryIndex]) {
      (newData.section5.otherNames[entryIndex] as any)[fieldName].value = newValue;

      // Special handling for "present" checkbox
      if (fieldName === 'present' && newValue === true) {
        newData.section5.otherNames[entryIndex].to.value = 'Present';
      }
    }
  }

  return newData;
};

/**
 * Adds a new other name entry to the section data
 */
export const addOtherNameEntry = (section5Data: Section5): Section5 => {
  const newData = { ...section5Data };
  const newIndex = newData.section5.otherNames.length;

  newData.section5.otherNames.push(createDefaultOtherNameEntry(newIndex));

  return newData;
};

/**
 * Removes an other name entry from the section data
 */
export const removeOtherNameEntry = (section5Data: Section5, index: number): Section5 => {
  const newData = { ...section5Data };

  if (index >= 0 && index < newData.section5.otherNames.length) {
    newData.section5.otherNames = [
      ...newData.section5.otherNames.slice(0, index),
      ...newData.section5.otherNames.slice(index + 1)
    ];
  }

  return newData;
};