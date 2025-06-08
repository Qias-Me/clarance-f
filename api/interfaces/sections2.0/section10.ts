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
 * Travel Country Entry structure for foreign passport travel history
 * Represents one row in the travel countries table (6 rows per passport)
 */
export interface TravelCountryEntry {
  country: Field<string>;
  fromDate: Field<string>;
  isFromDateEstimated: Field<boolean>;
  toDate: Field<string>;
  isToDateEstimated: Field<boolean>;
  isPresent: Field<boolean>;
}

/**
 * Dual Citizenship Entry structure for Section 10.1
 * CORRECTED: Fixed field mappings based on reference data analysis
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
  hasRenounced: Field<string>;  // CORRECTED: was hasPassport
  renounceExplanation: Field<string>;  // CORRECTED: was passportNumber
  hasTakenAction: Field<string>;  // CORRECTED: was hasTakenAction
  actionExplanation: Field<string>;  // CORRECTED: was actionExplanation
}

/**
 * Foreign Passport Entry structure for Section 10.2
 * UPDATED: Added all missing fields identified in reference data analysis
 * Uses createFieldFromReference for DRY approach
 */
export interface ForeignPassportEntry {
  country: Field<string>;
  issueDate: Field<string>;
  isIssueDateEstimated: Field<boolean>;  // NEW: Missing estimate checkbox
  city: Field<string>;
  country2: Field<string>;
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  suffix: Field<string>;  // NEW: Missing suffix field
  passportNumber: Field<string>;
  expirationDate: Field<string>;
  isExpirationDateEstimated: Field<boolean>;  // NEW: Missing estimate checkbox
  usedForUSEntry: Field<boolean>;
  travelCountries: TravelCountryEntry[];  // NEW: Missing travel countries table (6 rows)
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
 * Creates a travel country entry using createFieldFromReference
 * Used for foreign passport travel history table (6 rows per passport)
 */
export const createTravelCountryEntry = (passportIndex: number = 0, rowIndex: number = 0): TravelCountryEntry => {
  // Determine the section pattern based on passport entry
  const sectionPattern = passportIndex === 0 ? 'Section10\\.1-10\\.2' : 'Section10-2';

  // Handle Row 6 special case (Row5[1] pattern)
  const isRow6 = rowIndex === 5;
  const rowPattern = isRow6 ? 'Row5[1]' : `Row${rowIndex + 1}[0]`;

  const basePattern = `form1[0].${sectionPattern}[0].Table1[0].${rowPattern}`;

  if (isRow6) {
    // Row 6 uses #field pattern
    return {
      country: createFieldFromReference(10, `${basePattern}.#field[0]`, ''),
      fromDate: createFieldFromReference(10, `${basePattern}.#field[1]`, ''),
      isFromDateEstimated: createFieldFromReference(10, `${basePattern}.Cell3[0]`, false),
      toDate: createFieldFromReference(10, `${basePattern}.#field[3]`, ''),
      isToDateEstimated: createFieldFromReference(10, `${basePattern}.Cell5[0]`, false),
      isPresent: createFieldFromReference(10, `${basePattern}.#field[5]`, false),
    };
  } else {
    // Rows 1-5 use Cell pattern
    return {
      country: createFieldFromReference(10, `${basePattern}.Cell1[0]`, ''),
      fromDate: createFieldFromReference(10, `${basePattern}.Cell2[0]`, ''),
      isFromDateEstimated: createFieldFromReference(10, `${basePattern}.Cell3[0]`, false),
      toDate: createFieldFromReference(10, `${basePattern}.Cell4[0]`, ''),
      isToDateEstimated: createFieldFromReference(10, `${basePattern}.Cell5[0]`, false),
      isPresent: createFieldFromReference(10, `${basePattern}.#field[5]`, false),
    };
  }
};

/**
 * Creates a dual citizenship entry using createFieldFromReference
 * CORRECTED: Fixed field mappings based on reference data analysis
 * Entry 1 uses actual field names from sections-reference, Entry 2 uses corrected mappings
 */
export const createDualCitizenshipEntry = (index: number = 0): DualCitizenshipEntry => {
  // For first entry, use exact field names from sections-reference
  if (index === 0) {
    return {
      country: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].DropDownList13[0]', ''),
      howAcquired: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[0]', ''),
      fromDate: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[0]', ''),
      toDate: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[1]', ''),
      isFromEstimated: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].#field[3]', false),
      isToEstimated: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].#field[6]', false),
      isPresent: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].#field[5]', false),
      hasRenounced: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[1]', ''),
      renounceExplanation: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[1]', ''),
      hasTakenAction: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[2]', ''),
      actionExplanation: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[2]', ''),
    };
  }

  // For second entry, use corrected field mappings from reference data
  if (index === 1) {
    return {
      country: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].DropDownList13[1]', ''),
      howAcquired: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[3]', ''),
      fromDate: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[2]', ''),
      toDate: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[3]', ''),
      isFromEstimated: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].#field[11]', false),
      isToEstimated: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].#field[14]', false),
      isPresent: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].#field[13]', false),
      hasRenounced: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[3]', ''),
      renounceExplanation: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[4]', ''),
      hasTakenAction: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[4]', ''),
      actionExplanation: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[5]', ''),
    };
  }

  // For additional entries beyond 2, use pattern-based field names (fallback)
  return {
    country: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].DropDownList13[0]`, ''),
    howAcquired: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[0]`, ''),
    fromDate: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].From_Datefield_Name_2[0]`, ''),
    toDate: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].From_Datefield_Name_2[1]`, ''),
    isFromEstimated: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].#field[3]`, false),
    isToEstimated: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].#field[6]`, false),
    isPresent: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].#field[5]`, false),
    hasRenounced: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].RadioButtonList[1]`, ''),
    renounceExplanation: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[1]`, ''),
    hasTakenAction: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].RadioButtonList[2]`, ''),
    actionExplanation: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[2]`, ''),
  };
};

/**
 * Creates a foreign passport entry using createFieldFromReference
 * UPDATED: Added all missing fields and corrected field mappings
 * Entry 1 uses Section10\.1-10\.2 pattern, Entry 2 uses Section10-2 pattern
 */
export const createForeignPassportEntry = (index: number = 0): ForeignPassportEntry => {
  // For first entry, use exact field names from sections-reference
  if (index === 0) {
    // Create travel countries table (6 rows)
    const travelCountries: TravelCountryEntry[] = [];
    for (let i = 0; i < 6; i++) {
      travelCountries.push(createTravelCountryEntry(0, i));
    }

    return {
      country: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].DropDownList14[0]', ''),
      issueDate: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[4]', ''),
      isIssueDateEstimated: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].#field[20]', false),
      city: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[6]', ''),
      country2: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].DropDownList11[0]', ''),
      lastName: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[7]', ''),
      firstName: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[8]', ''),
      middleName: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[9]', ''),
      suffix: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].suffix[0]', ''),
      passportNumber: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[10]', ''),
      expirationDate: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[5]', ''),
      isExpirationDateEstimated: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].#field[29]', false),
      usedForUSEntry: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[6]', false),
      travelCountries,
    };
  }

  // For second entry, use Section10-2 pattern from sections-reference
  if (index === 1) {
    // Create travel countries table (6 rows) for second passport
    const travelCountries: TravelCountryEntry[] = [];
    for (let i = 0; i < 6; i++) {
      travelCountries.push(createTravelCountryEntry(1, i));
    }

    return {
      country: createFieldFromReference(10, 'form1[0].Section10-2[0].DropDownList14[0]', ''),
      issueDate: createFieldFromReference(10, 'form1[0].Section10-2[0].From_Datefield_Name_2[0]', ''),
      isIssueDateEstimated: createFieldFromReference(10, 'form1[0].Section10-2[0].#field[4]', false),
      city: createFieldFromReference(10, 'form1[0].Section10-2[0].TextField11[0]', ''),
      country2: createFieldFromReference(10, 'form1[0].Section10-2[0].DropDownList11[0]', ''),
      lastName: createFieldFromReference(10, 'form1[0].Section10-2[0].TextField11[1]', ''),
      firstName: createFieldFromReference(10, 'form1[0].Section10-2[0].TextField11[2]', ''),
      middleName: createFieldFromReference(10, 'form1[0].Section10-2[0].TextField11[3]', ''),
      suffix: createFieldFromReference(10, 'form1[0].Section10-2[0].suffix[0]', ''),
      passportNumber: createFieldFromReference(10, 'form1[0].Section10-2[0].TextField11[4]', ''),
      expirationDate: createFieldFromReference(10, 'form1[0].Section10-2[0].From_Datefield_Name_2[1]', ''),
      isExpirationDateEstimated: createFieldFromReference(10, 'form1[0].Section10-2[0].#field[13]', false),
      usedForUSEntry: createFieldFromReference(10, 'form1[0].Section10-2[0].RadioButtonList[0]', false),
      travelCountries,
    };
  }

  // For additional entries beyond 2, use pattern-based field names (fallback)
  const travelCountries: TravelCountryEntry[] = [];
  for (let i = 0; i < 6; i++) {
    travelCountries.push(createTravelCountryEntry(index, i));
  }

  return {
    country: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].DropDownList14[0]`, ''),
    issueDate: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].From_Datefield_Name_2[4]`, ''),
    isIssueDateEstimated: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].#field[20]`, false),
    city: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[6]`, ''),
    country2: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].DropDownList11[0]`, ''),
    lastName: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[7]`, ''),
    firstName: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[8]`, ''),
    middleName: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[9]`, ''),
    suffix: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].suffix[0]`, ''),
    passportNumber: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[10]`, ''),
    expirationDate: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].From_Datefield_Name_2[5]`, ''),
    isExpirationDateEstimated: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].#field[29]`, false),
    usedForUSEntry: createFieldFromReference(10, `form1[0].Section10\\.1-10\\.2[${index}].RadioButtonList[6]`, false),
    travelCountries,
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
 * UPDATED: Added support for travel country updates
 */
export type Section10FieldUpdate = {
  fieldPath: string;
  newValue: any;
  index?: number;
  subsection?: Section10SubsectionKey;
  travelIndex?: number;  // NEW: For travel country updates
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
 * Adds a new travel country entry to a foreign passport
 */
export const addTravelCountryEntry = (section10Data: Section10, passportIndex: number): Section10 => {
  const newData = { ...section10Data };
  if (passportIndex >= 0 && passportIndex < newData.section10.foreignPassport.entries.length) {
    const passport = newData.section10.foreignPassport.entries[passportIndex];
    if (passport.travelCountries.length < 6) {
      const newTravelIndex = passport.travelCountries.length;
      passport.travelCountries.push(createTravelCountryEntry(passportIndex, newTravelIndex));
    }
  }
  return newData;
};

/**
 * Removes a travel country entry from a foreign passport
 */
export const removeTravelCountryEntry = (section10Data: Section10, passportIndex: number, travelIndex: number): Section10 => {
  const newData = { ...section10Data };
  if (passportIndex >= 0 && passportIndex < newData.section10.foreignPassport.entries.length) {
    const passport = newData.section10.foreignPassport.entries[passportIndex];
    if (travelIndex >= 0 && travelIndex < passport.travelCountries.length) {
      passport.travelCountries.splice(travelIndex, 1);
    }
  }
  return newData;
};

/**
 * Updates a specific field in the Section 10 data structure
 * UPDATED: Added support for travel countries and corrected field names
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
    travelIndex,
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

      // Handle travel countries updates
      if (fieldPath.includes("travelCountries") && travelIndex !== undefined) {
        const passport = newData.section10.foreignPassport.entries[index];
        // Make sure we have enough travel entries
        while (passport.travelCountries.length <= travelIndex) {
          passport.travelCountries.push(createTravelCountryEntry(index, passport.travelCountries.length));
        }

        const travelFieldName = fieldPath.split(".").pop();
        if (travelFieldName && travelFieldName in passport.travelCountries[travelIndex]) {
          (passport.travelCountries[travelIndex] as any)[travelFieldName].value = newValue;

          // Special handling for "present" checkbox in travel countries
          if (travelFieldName === "isPresent" && newValue === true) {
            passport.travelCountries[travelIndex].toDate.value = "Present";
          }
        }
      } else {
        // Update regular passport field
        const fieldName = fieldPath.split(".").pop();
        if (fieldName && fieldName in newData.section10.foreignPassport.entries[index]) {
          (newData.section10.foreignPassport.entries[index] as any)[fieldName].value = newValue;
        }
      }
    }
  }

  return newData;
};
