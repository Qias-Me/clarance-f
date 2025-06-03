/**
 * Section 10: Dual/Multiple Citizenship
 *
 * TypeScript interface definitions for SF-86 Section 10 (Dual/Multiple Citizenship) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-10.json.
 */

import type { Field, FieldWithOptions } from "../formDefinition2.0";

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Dual Citizenship Entry structure for Section 10.1
 */
export interface DualCitizenshipEntry {
  country: FieldWithOptions<string>;
  howAcquired: Field<string>;
  fromDate: Field<string>;
  toDate: Field<string>;
  isFromEstimated: Field<boolean>;
  isToEstimated: Field<boolean>;
  isPresent: Field<boolean>;
  hasPassport: Field<string>;
  passportNumber: Field<string>;
  passportLocation: Field<string>;
  hasTakenAction: Field<string>;
  actionExplanation: Field<string>;
}

/**
 * Foreign Passport Entry structure for Section 10.2
 */
export interface ForeignPassportEntry {
  country: FieldWithOptions<string>;
  passportNumber: Field<string>;
  issueDate: Field<string>;
  city: Field<string>;
  country2: FieldWithOptions<string>;
  explanation: Field<string>;
}

/**
 * Dual Citizenship Information structure for Section 10.1
 */
export interface DualCitizenshipInfo {
  hasDualCitizenship: Field<string>;
  entries: DualCitizenshipEntry[];
}

/**
 * Foreign Passport Information structure for Section 10.2
 */
export interface ForeignPassportInfo {
  hasForeignPassport: Field<string>;
  entries: ForeignPassportEntry[];
}

/**
 * Section 10 main data structure
 */
export interface Section10 {
  _id: number;
  section10: {
    dualCitizenship: DualCitizenshipInfo;
    foreignPassport: ForeignPassportInfo;
  };
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 10 subsection keys for type safety
 */
export type Section10SubsectionKey = "dualCitizenship" | "foreignPassport";

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 10.1 (Dual Citizenship)
 * Based on the actual field IDs from section-10.json (4-digit format)
 */
export const SECTION10_1_FIELD_IDS = {
  // Dual citizenship question
  HAS_DUAL_CITIZENSHIP: "17213", // form1[0].Section10\.1-10\.2[0].RadioButtonList[0]

  // First entry fields
  COUNTRY_1: "9705", // form1[0].Section10\.1-10\.2[0].DropDownList13[0]
  HOW_ACQUIRED_1: "9704", // form1[0].Section10\.1-10\.2[0].TextField11[0]
  FROM_DATE_1: "9703", // form1[0].Section10\.1-10\.2[0].From_Datefield_Name_2[0]
  FROM_ESTIMATED_1: "9702", // form1[0].Section10\.1-10\.2[0].#field[3]
  TO_DATE_1: "9701", // form1[0].Section10\.1-10\.2[0].From_Datefield_Name_2[1]
  PRESENT_1: "9700", // form1[0].Section10\.1-10\.2[0].#field[5]
  HAS_PASSPORT_1: "9699", // form1[0].Section10\.1-10\.2[0].RadioButtonList[1]
  PASSPORT_NUMBER_1: "9698", // form1[0].Section10\.1-10\.2[0].TextField11[1]
  PASSPORT_LOCATION_1: "9697", // form1[0].Section10\.1-10\.2[0].TextField11[2]
  HAS_TAKEN_ACTION_1: "9696", // form1[0].Section10\.1-10\.2[0].RadioButtonList[2]
  ACTION_EXPLANATION_1: "9695", // form1[0].Section10\.1-10\.2[0].TextField11[3]
} as const;

/**
 * PDF field ID mappings for Section 10.2 (Foreign Passport)
 * Based on the actual field IDs from section-10.json (4-digit format)
 */
export const SECTION10_2_FIELD_IDS = {
  // Foreign passport question
  HAS_FOREIGN_PASSPORT: "9694", // form1[0].Section10\.1-10\.2[0].RadioButtonList[3]

  // First entry fields
  COUNTRY_1: "9693", // form1[0].Section10\.1-10\.2[0].DropDownList13[1]
  PASSPORT_NUMBER_1: "9692", // form1[0].Section10\.1-10\.2[0].TextField11[4]
  ISSUE_DATE_1: "9691", // form1[0].Section10\.1-10\.2[0].From_Datefield_Name_2[2]
  CITY_1: "9690", // form1[0].Section10\.1-10\.2[0].TextField11[5]
  COUNTRY_2_1: "9689", // form1[0].Section10\.1-10\.2[0].DropDownList13[2]
  EXPLANATION_1: "9688", // form1[0].Section10\.1-10\.2[0].TextField11[6]
} as const;

/**
 * Field name mappings for Section 10.1 (Dual Citizenship)
 * Full field paths from section-10.json
 */
export const SECTION10_1_FIELD_NAMES = {
  // Dual citizenship question
  HAS_DUAL_CITIZENSHIP: "form1[0].Section10\\.1-10\\.2[0].RadioButtonList[0]",

  // First entry fields
  COUNTRY_1: "form1[0].Section10\\.1-10\\.2[0].DropDownList13[0]",
  HOW_ACQUIRED_1: "form1[0].Section10\\.1-10\\.2[0].TextField11[0]",
  FROM_DATE_1: "form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[0]",
  FROM_ESTIMATED_1: "form1[0].Section10\\.1-10\\.2[0].#field[3]",
  TO_DATE_1: "form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[1]",
  PRESENT_1: "form1[0].Section10\\.1-10\\.2[0].#field[5]",
  HAS_PASSPORT_1: "form1[0].Section10\\.1-10\\.2[0].RadioButtonList[1]",
  PASSPORT_NUMBER_1: "form1[0].Section10\\.1-10\\.2[0].TextField11[1]",
  PASSPORT_LOCATION_1: "form1[0].Section10\\.1-10\\.2[0].TextField11[2]",
  HAS_TAKEN_ACTION_1: "form1[0].Section10\\.1-10\\.2[0].RadioButtonList[2]",
  ACTION_EXPLANATION_1: "form1[0].Section10\\.1-10\\.2[0].TextField11[3]",
} as const;

/**
 * Field name mappings for Section 10.2 (Foreign Passport)
 * Full field paths from section-10.json
 */
export const SECTION10_2_FIELD_NAMES = {
  // Foreign passport question
  HAS_FOREIGN_PASSPORT: "form1[0].Section10\\.1-10\\.2[0].RadioButtonList[3]",

  // First entry fields
  COUNTRY_1: "form1[0].Section10\\.1-10\\.2[0].DropDownList13[1]",
  PASSPORT_NUMBER_1: "form1[0].Section10\\.1-10\\.2[0].TextField11[4]",
  ISSUE_DATE_1: "form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[2]",
  CITY_1: "form1[0].Section10\\.1-10\\.2[0].TextField11[5]",
  COUNTRY_2_1: "form1[0].Section10\\.1-10\\.2[0].DropDownList13[2]",
  EXPLANATION_1: "form1[0].Section10\\.1-10\\.2[0].TextField11[6]",
} as const;

// ============================================================================
// DROPDOWN OPTIONS
// ============================================================================

/**
 * Country options for dropdown (abbreviated - full list available in the JSON)
 */
export const COUNTRY_OPTIONS = [
  "United States",
  "Afghanistan",
  "Albania",
  "Algeria",
  // Many more countries would be listed here
  "Zimbabwe",
] as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for dual citizenship field updates
 */
export type Section10FieldUpdate = {
  fieldPath: string;
  newValue: any;
  index?: number;
  subsection?: Section10SubsectionKey;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default Dual Citizenship Entry with the provided index
 */
export const createDefaultDualCitizenshipEntry = (
  index: number
): DualCitizenshipEntry => {
  // For index beyond the first entry, we would need to define field IDs
  // based on the pattern from the PDF structure
  const indexStr = index === 0 ? "1" : `${index + 1}`;

  return {
    country: {
      id:
        index === 0
          ? SECTION10_1_FIELD_IDS.COUNTRY_1
          : `dual_citizenship_country_${indexStr}`,
      name:
        index === 0
          ? SECTION10_1_FIELD_NAMES.COUNTRY_1
          : `dual_citizenship_country_${indexStr}`,
      type: "PDFDropdown",
      label: "Country of Citizenship",
      value: "",
      options: COUNTRY_OPTIONS,
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    howAcquired: {
      id:
        index === 0
          ? SECTION10_1_FIELD_IDS.HOW_ACQUIRED_1
          : `dual_citizenship_how_acquired_${indexStr}`,
      name:
        index === 0
          ? SECTION10_1_FIELD_NAMES.HOW_ACQUIRED_1
          : `dual_citizenship_how_acquired_${indexStr}`,
      type: "PDFTextField",
      label: "How Citizenship Was Acquired",
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    fromDate: {
      id:
        index === 0
          ? SECTION10_1_FIELD_IDS.FROM_DATE_1
          : `dual_citizenship_from_date_${indexStr}`,
      name:
        index === 0
          ? SECTION10_1_FIELD_NAMES.FROM_DATE_1
          : `dual_citizenship_from_date_${indexStr}`,
      type: "PDFTextField",
      label: "From Date",
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    isFromEstimated: {
      id:
        index === 0
          ? SECTION10_1_FIELD_IDS.FROM_ESTIMATED_1
          : `dual_citizenship_from_estimated_${indexStr}`,
      name:
        index === 0
          ? SECTION10_1_FIELD_NAMES.FROM_ESTIMATED_1
          : `dual_citizenship_from_estimated_${indexStr}`,
      type: "PDFCheckBox",
      label: "From Date Estimated",
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    toDate: {
      id:
        index === 0
          ? SECTION10_1_FIELD_IDS.TO_DATE_1
          : `dual_citizenship_to_date_${indexStr}`,
      name:
        index === 0
          ? SECTION10_1_FIELD_NAMES.TO_DATE_1
          : `dual_citizenship_to_date_${indexStr}`,
      type: "PDFTextField",
      label: "To Date",
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    isToEstimated: {
      id: index === 0 ? "9700" : `dual_citizenship_to_estimated_${indexStr}`, // ID not specified in the provided data
      name:
        index === 0
          ? "form1[0].Section10\\.1-10\\.2[0].#field[4]"
          : `dual_citizenship_to_estimated_${indexStr}`, // Name not specified
      type: "PDFCheckBox",
      label: "To Date Estimated",
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    isPresent: {
      id:
        index === 0
          ? SECTION10_1_FIELD_IDS.PRESENT_1
          : `dual_citizenship_present_${indexStr}`,
      name:
        index === 0
          ? SECTION10_1_FIELD_NAMES.PRESENT_1
          : `dual_citizenship_present_${indexStr}`,
      type: "PDFCheckBox",
      label: "Present",
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    hasPassport: {
      id:
        index === 0
          ? SECTION10_1_FIELD_IDS.HAS_PASSPORT_1
          : `dual_citizenship_has_passport_${indexStr}`,
      name:
        index === 0
          ? SECTION10_1_FIELD_NAMES.HAS_PASSPORT_1
          : `dual_citizenship_has_passport_${indexStr}`,
      type: "PDFRadioGroup",
      label: "Do you have a passport issued by this country?",
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    passportNumber: {
      id:
        index === 0
          ? SECTION10_1_FIELD_IDS.PASSPORT_NUMBER_1
          : `dual_citizenship_passport_number_${indexStr}`,
      name:
        index === 0
          ? SECTION10_1_FIELD_NAMES.PASSPORT_NUMBER_1
          : `dual_citizenship_passport_number_${indexStr}`,
      type: "PDFTextField",
      label: "Passport Number",
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    passportLocation: {
      id:
        index === 0
          ? SECTION10_1_FIELD_IDS.PASSPORT_LOCATION_1
          : `dual_citizenship_passport_location_${indexStr}`,
      name:
        index === 0
          ? SECTION10_1_FIELD_NAMES.PASSPORT_LOCATION_1
          : `dual_citizenship_passport_location_${indexStr}`,
      type: "PDFTextField",
      label: "Passport Location",
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    hasTakenAction: {
      id:
        index === 0
          ? SECTION10_1_FIELD_IDS.HAS_TAKEN_ACTION_1
          : `dual_citizenship_has_taken_action_${indexStr}`,
      name:
        index === 0
          ? SECTION10_1_FIELD_NAMES.HAS_TAKEN_ACTION_1
          : `dual_citizenship_has_taken_action_${indexStr}`,
      type: "PDFRadioGroup",
      label: "Have you taken any action to renounce your foreign citizenship?",
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    actionExplanation: {
      id:
        index === 0
          ? SECTION10_1_FIELD_IDS.ACTION_EXPLANATION_1
          : `dual_citizenship_action_explanation_${indexStr}`,
      name:
        index === 0
          ? SECTION10_1_FIELD_NAMES.ACTION_EXPLANATION_1
          : `dual_citizenship_action_explanation_${indexStr}`,
      type: "PDFTextField",
      label: "Explanation of Action Taken",
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
  };
};

/**
 * Creates a default Foreign Passport Entry with the provided index
 */
export const createDefaultForeignPassportEntry = (
  index: number
): ForeignPassportEntry => {
  // For index beyond the first entry, we would need to define field IDs
  // based on the pattern from the PDF structure
  const indexStr = index === 0 ? "1" : `${index + 1}`;

  return {
    country: {
      id:
        index === 0
          ? SECTION10_2_FIELD_IDS.COUNTRY_1
          : `foreign_passport_country_${indexStr}`,
      name:
        index === 0
          ? SECTION10_2_FIELD_NAMES.COUNTRY_1
          : `foreign_passport_country_${indexStr}`,
      type: "PDFDropdown",
      label: "Country of Issuance",
      value: "",
      options: COUNTRY_OPTIONS,
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    passportNumber: {
      id:
        index === 0
          ? SECTION10_2_FIELD_IDS.PASSPORT_NUMBER_1
          : `foreign_passport_number_${indexStr}`,
      name:
        index === 0
          ? SECTION10_2_FIELD_NAMES.PASSPORT_NUMBER_1
          : `foreign_passport_number_${indexStr}`,
      type: "PDFTextField",
      label: "Passport Number",
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    issueDate: {
      id:
        index === 0
          ? SECTION10_2_FIELD_IDS.ISSUE_DATE_1
          : `foreign_passport_issue_date_${indexStr}`,
      name:
        index === 0
          ? SECTION10_2_FIELD_NAMES.ISSUE_DATE_1
          : `foreign_passport_issue_date_${indexStr}`,
      type: "PDFTextField",
      label: "Date of Issuance",
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    city: {
      id:
        index === 0
          ? SECTION10_2_FIELD_IDS.CITY_1
          : `foreign_passport_city_${indexStr}`,
      name:
        index === 0
          ? SECTION10_2_FIELD_NAMES.CITY_1
          : `foreign_passport_city_${indexStr}`,
      type: "PDFTextField",
      label: "Place of Issuance (City)",
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    country2: {
      id:
        index === 0
          ? SECTION10_2_FIELD_IDS.COUNTRY_2_1
          : `foreign_passport_country2_${indexStr}`,
      name:
        index === 0
          ? SECTION10_2_FIELD_NAMES.COUNTRY_2_1
          : `foreign_passport_country2_${indexStr}`,
      type: "PDFDropdown",
      label: "Place of Issuance (Country)",
      value: "",
      options: COUNTRY_OPTIONS,
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    explanation: {
      id:
        index === 0
          ? SECTION10_2_FIELD_IDS.EXPLANATION_1
          : `foreign_passport_explanation_${indexStr}`,
      name:
        index === 0
          ? SECTION10_2_FIELD_NAMES.EXPLANATION_1
          : `foreign_passport_explanation_${indexStr}`,
      type: "PDFTextField",
      label: "Explanation",
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
  };
};

/**
 * Creates a default Section 10 data structure with correct field IDs
 */
export const createDefaultSection10 = (): Section10 => ({
  _id: 10,
  section10: {
  dualCitizenship: {
    hasDualCitizenship: {
      id: SECTION10_1_FIELD_IDS.HAS_DUAL_CITIZENSHIP,
      name: SECTION10_1_FIELD_NAMES.HAS_DUAL_CITIZENSHIP,
      type: "PDFRadioGroup",
      label:
        "Have you EVER been issued or granted citizenship in a country other than the U.S.?",
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    entries: [createDefaultDualCitizenshipEntry(0)],
  },
  foreignPassport: {
    hasForeignPassport: {
      id: SECTION10_2_FIELD_IDS.HAS_FOREIGN_PASSPORT,
      name: SECTION10_2_FIELD_NAMES.HAS_FOREIGN_PASSPORT,
      type: "PDFRadioGroup",
      label:
        "Have you EVER been issued a passport (or identity card for travel) by a country other than the U.S.?",
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
      entries: [createDefaultForeignPassportEntry(0)],
    },
  },
});

/**
 * Updates a specific field in the Section 10 data structure
 */
export const updateSection10Field = (
  section10Data: Section10,
  update: Section10FieldUpdate
): Section10 => {
  const {
    fieldPath,
    newValue,
    index = 0,
    subsection = "dualCitizenship",
  } = update;
  const newData = { ...section10Data };

  // Update the specified field based on the subsection
  if (subsection === "dualCitizenship") {
    if (fieldPath === "hasDualCitizenship") {
      newData.section10.dualCitizenship.hasDualCitizenship.value = newValue;
    } else if (fieldPath.startsWith("entries")) {
      // Make sure we have enough entries
      while (newData.section10.dualCitizenship.entries.length <= index) {
        newData.section10.dualCitizenship.entries.push(
          createDefaultDualCitizenshipEntry(
            newData.section10.dualCitizenship.entries.length
          )
        );
      }

      // Update the specific field in the entry
      const fieldName = fieldPath.split(".").pop();
      if (fieldName && fieldName in newData.section10.dualCitizenship.entries[index]) {
        (newData.section10.dualCitizenship.entries[index] as any)[fieldName].value =
          newValue;

        // Special handling for "present" checkbox
        if (fieldName === "isPresent" && newValue === true) {
          newData.section10.dualCitizenship.entries[index].toDate.value = "Present";
        }
      }
    }
  } else if (subsection === "foreignPassport") {
    if (fieldPath === "hasForeignPassport") {
      newData.section10.foreignPassport.hasForeignPassport.value = newValue;
    } else if (fieldPath.startsWith("entries")) {
      // Make sure we have enough entries
      while (newData.section10.foreignPassport.entries.length <= index) {
        newData.section10.foreignPassport.entries.push(
          createDefaultForeignPassportEntry(
            newData.section10.foreignPassport.entries.length
          )
        );
      }

      // Update the specific field in the entry
      const fieldName = fieldPath.split(".").pop();
      if (fieldName && fieldName in newData.section10.foreignPassport.entries[index]) {
        (newData.section10.foreignPassport.entries[index] as any)[fieldName].value =
          newValue;
      }
    }
  }

  return newData;
};

/**
 * Adds a new dual citizenship entry to the section data
 */
export const addDualCitizenshipEntry = (
  section10Data: Section10
): Section10 => {
  const newData = { ...section10Data };
  const newIndex = newData.section10.dualCitizenship.entries.length;

  newData.section10.dualCitizenship.entries.push(
    createDefaultDualCitizenshipEntry(newIndex)
  );

  return newData;
};

/**
 * Adds a new foreign passport entry to the section data
 */
export const addForeignPassportEntry = (
  section10Data: Section10
): Section10 => {
  const newData = { ...section10Data };
  const newIndex = newData.section10.foreignPassport.entries.length;

  newData.section10.foreignPassport.entries.push(
    createDefaultForeignPassportEntry(newIndex)
  );

  return newData;
};

/**
 * Removes a dual citizenship entry from the section data
 */
export const removeDualCitizenshipEntry = (
  section10Data: Section10,
  index: number
): Section10 => {
  const newData = { ...section10Data };

  if (index >= 0 && index < newData.section10.dualCitizenship.entries.length) {
    newData.section10.dualCitizenship.entries = [
      ...newData.section10.dualCitizenship.entries.slice(0, index),
      ...newData.section10.dualCitizenship.entries.slice(index + 1),
    ];
  }

  return newData;
};

/**
 * Removes a foreign passport entry from the section data
 */
export const removeForeignPassportEntry = (
  section10Data: Section10,
  index: number
): Section10 => {
  const newData = { ...section10Data };

  if (index >= 0 && index < newData.section10.foreignPassport.entries.length) {
    newData.section10.foreignPassport.entries = [
      ...newData.section10.foreignPassport.entries.slice(0, index),
      ...newData.section10.foreignPassport.entries.slice(index + 1),
    ];
  }

  return newData;
};
