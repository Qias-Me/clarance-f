/**
 * Section 10: Dual/Multiple Citizenship & Foreign Passport - Interface
 *
 * This interface defines the structure for SF-86 Section 10 data,
 * which collects information about dual citizenship and foreign passports.
 *
 * Uses sections-reference as single source of truth following Section 1 gold standard pattern.
 */

import type { Field } from "../formDefinition2.0";
import { createFieldFromReference } from '../../utils/sections-references-loader';

// ============================================================================
// CORE INTERFACES USING SECTIONS-REFERENCE AS SOURCE OF TRUTH
// ============================================================================

/**
 * Dual Citizenship Entry structure for Section 10.1
 * Uses createFieldFromReference for DRY approach
 */
export interface DualCitizenshipEntry {
  country: Field<string>;
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
 * Uses createFieldFromReference for DRY approach
 */
export interface ForeignPassportEntry {
  country: Field<string>;
  issueDate: Field<string>;
  city: Field<string>;
  country2: Field<string>;
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  passportNumber: Field<string>;
  expirationDate: Field<string>;
  usedForUSEntry: Field<boolean>;
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
// FIELD CREATION USING SECTIONS-REFERENCE (DRY APPROACH)
// ============================================================================

/**
 * Creates Section 10 fields using createFieldFromReference following Section 1 gold standard
 * All field names come from sections-reference/section-10.json as single source of truth
 */

// Main dual citizenship question - FIXED: Use correct default value from sections-reference
export const hasDualCitizenshipField = () =>
  createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[0]', 'NO (If NO, proceed to 10.2)');

// Main foreign passport question - FIXED: Use correct default value from sections-reference
export const hasForeignPassportField = () =>
  createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[5]', 'NO (If NO, proceed to Section 11)');

/**
 * Creates a dual citizenship entry using createFieldFromReference
 * Entry 1 uses actual field names from sections-reference, subsequent entries use pattern
 */
export const createDualCitizenshipEntry = (index: number = 0): DualCitizenshipEntry => {
  // For first entry, use exact field names from sections-reference
  if (index === 0) {
    const isToEstimated = createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].#field[6]', false);

    return {
      country: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].DropDownList13[0]', ''),
      howAcquired: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[0]', ''),
      fromDate: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[0]', ''),
      toDate: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[1]', ''),
      isFromEstimated: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].#field[3]', false),
      isToEstimated,
      isPresent: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].#field[5]', false),
      hasPassport: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[1]', ''),
      passportNumber: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[1]', ''),
      passportLocation: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[2]', ''),
      hasTakenAction: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[2]', ''),
      actionExplanation: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[3]', ''),
    };
  }

  // For additional entries, use pattern-based field names (would need to be defined in sections-reference)
  const entryNum = index + 1;
  return {
    country: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].DropDownList13[0]`, ''),
    howAcquired: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[0]`, ''),
    fromDate: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].From_Datefield_Name_2[0]`, ''),
    toDate: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].From_Datefield_Name_2[1]`, ''),
    isFromEstimated: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].#field[3]`, false),
    isToEstimated: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].#field[6]`, false),
    isPresent: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].#field[5]`, false),
    hasPassport: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].RadioButtonList[1]`, ''),
    passportNumber: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[1]`, ''),
    passportLocation: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[2]`, ''),
    hasTakenAction: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].RadioButtonList[2]`, ''),
    actionExplanation: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[3]`, ''),
  };
};

/**
 * Creates a foreign passport entry using createFieldFromReference
 * Entry 1 uses actual field names from sections-reference, subsequent entries use pattern
 */
export const createForeignPassportEntry = (index: number = 0): ForeignPassportEntry => {
  // For first entry, use exact field names from sections-reference
  if (index === 0) {
    const country = createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].DropDownList14[0]', '');

    return {
      country,
      issueDate: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[4]', ''),
      city: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[6]', ''),
      country2: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].DropDownList11[0]', ''),
      lastName: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[7]', ''),
      firstName: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[8]', ''),
      middleName: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[9]', ''),
      passportNumber: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[10]', ''),
      expirationDate: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[5]', ''),
      usedForUSEntry: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[6]', false),
    };
  }

  // For additional entries, use pattern-based field names (would need to be defined in sections-reference)
  return {
    country: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].DropDownList14[0]`, ''),
    issueDate: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].From_Datefield_Name_2[4]`, ''),
    city: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[6]`, ''),
    country2: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].DropDownList11[0]`, ''),
    lastName: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[7]`, ''),
    firstName: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[8]`, ''),
    middleName: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[9]`, ''),
    passportNumber: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[10]`, ''),
    expirationDate: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].From_Datefield_Name_2[5]`, ''),
    usedForUSEntry: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].RadioButtonList[6]`, false),
  };
};

/**
 * Creates default Section 10 data structure using createFieldFromReference
 * Following Section 1 gold standard pattern
 */
export const createDefaultSection10 = (): Section10 => ({
  _id: 10,
  section10: {
    dualCitizenship: {
      hasDualCitizenship: hasDualCitizenshipField(),
      entries: [createDualCitizenshipEntry(0)],
    },
    foreignPassport: {
      hasForeignPassport: hasForeignPassportField(),
      entries: [createForeignPassportEntry(0)],
    },
  },
});

// ============================================================================
// UTILITY TYPES AND FUNCTIONS
// ============================================================================

/**
 * Section 10 subsection keys for type safety
 */
export type Section10SubsectionKey = "dualCitizenship" | "foreignPassport";

/**
 * Type for Section 10 field updates
 */
export type Section10FieldUpdate = {
  fieldPath: string;
  newValue: any;
  index?: number;
  subsection?: Section10SubsectionKey;
};

/**
 * Adds a new dual citizenship entry
 */
export const addDualCitizenshipEntry = (section10Data: Section10): Section10 => {
  const newData = { ...section10Data };
  const newIndex = newData.section10.dualCitizenship.entries.length;
  newData.section10.dualCitizenship.entries.push(createDualCitizenshipEntry(newIndex));
  return newData;
};

/**
 * Adds a new foreign passport entry
 */
export const addForeignPassportEntry = (section10Data: Section10): Section10 => {
  const newData = { ...section10Data };
  const newIndex = newData.section10.foreignPassport.entries.length;
  newData.section10.foreignPassport.entries.push(createForeignPassportEntry(newIndex));
  return newData;
};

/**
 * Removes a dual citizenship entry
 */
export const removeDualCitizenshipEntry = (section10Data: Section10, index: number): Section10 => {
  const newData = { ...section10Data };
  if (index >= 0 && index < newData.section10.dualCitizenship.entries.length) {
    newData.section10.dualCitizenship.entries.splice(index, 1);
  }
  return newData;
};

/**
 * Removes a foreign passport entry
 */
export const removeForeignPassportEntry = (section10Data: Section10, index: number): Section10 => {
  const newData = { ...section10Data };
  if (index >= 0 && index < newData.section10.foreignPassport.entries.length) {
    newData.section10.foreignPassport.entries.splice(index, 1);
  }
  return newData;
};

/**
 * Updates a specific field in the Section 10 data structure
 * Simplified version that works with createFieldFromReference approach
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
          createDualCitizenshipEntry(newData.section10.dualCitizenship.entries.length)
        );
      }

      // Update the specific field in the entry
      const fieldName = fieldPath.split(".").pop();
      if (fieldName && fieldName in newData.section10.dualCitizenship.entries[index]) {
        (newData.section10.dualCitizenship.entries[index] as any)[fieldName].value = newValue;

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
          createForeignPassportEntry(newData.section10.foreignPassport.entries.length)
        );
      }

      // Update the specific field in the entry
      const fieldName = fieldPath.split(".").pop();
      if (fieldName && fieldName in newData.section10.foreignPassport.entries[index]) {
        (newData.section10.foreignPassport.entries[index] as any)[fieldName].value = newValue;
      }
    }
  }

  return newData;
};
