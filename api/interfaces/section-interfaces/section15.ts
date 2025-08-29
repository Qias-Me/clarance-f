/**
 * Section 15: Military History
 *
 * TypeScript interface definitions for SF-86 Section 15 (Military History) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-15.json.
 * 
 * Section 15 covers:
 * - Military service history (15.1)
 * - Court martial or disciplinary procedure history (15.2)  
 * - Foreign military service (15.3)
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';
import { createFieldFromReference, validateSectionFieldCount } from '../../utils/sections-references-loader';

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Date field structure used in SF-86 forms
 */
export interface DateField {
  month: Field<string>;
  year: Field<string>;
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Military service entry structure for Section 15.1
 */
export interface MilitaryServiceEntry {
  branch: FieldWithOptions<string>; // Service branch (1-7 options)
  serviceState: Field<string>; // State of service if National Guard
  serviceStatus: FieldWithOptions<string>; // Officer/Enlisted/Other

  // Service dates (using single value fields to match mapping)
  fromDate: Field<string>;
  fromDateEstimated: Field<boolean>;
  toDate: Field<string>;
  toDateEstimated: Field<boolean>;
  isPresent: Field<boolean>; // Still serving

  serviceNumber: Field<string>;

  // Discharge information
  dischargeType: FieldWithOptions<string>; // Radio button list
  typeOfDischarge?: FieldWithOptions<string>; // Honorable/Dishonorable/etc (optional for second entry)
  dischargeDate: Field<string>;
  dischargeDateEstimated: Field<boolean>;
  otherDischargeType: Field<string>; // If "Other" selected
  dischargeReason: Field<string>; // Required if not honorable

  // Current status
  currentStatus: {
    activeDuty: Field<boolean>;
    activeReserve: Field<boolean>;
    inactiveReserve: Field<boolean>;
  };

  // Additional service information fields
  additionalServiceInfo?: Field<string>;
  secondaryBranch?: Field<string>; // For the missing RadioButtonList[7] field
}

/**
 * Court martial/disciplinary procedure entry for Section 15.2
 */
export interface MilitaryDisciplinaryEntry {
  // Disciplinary procedure details
  procedureDate: Field<string>; // Using single value field to match mapping
  procedureDateEstimated: Field<boolean>;
  ucmjOffenseDescription: Field<string>; // Description of UCMJ offense
  disciplinaryProcedureName: Field<string>; // Court Martial, Article 15, etc.
  militaryCourtDescription: Field<string>; // Court or authority details
  finalOutcome: Field<string>; // Outcome description
}

/**
 * Foreign military service entry for Section 15.3
 */
export interface ForeignMilitaryServiceEntry {
  // Service period (using single value fields to match mapping)
  fromDate: Field<string>;
  fromDateEstimated: Field<boolean>;
  toDate: Field<string>;
  toDateEstimated: Field<boolean>;
  isPresent: Field<boolean>;

  // Organization details
  organizationName: Field<string>;
  country: Field<string>;
  highestRank: Field<string>;
  divisionDepartment: Field<string>;
  reasonForLeaving: Field<string>;
  circumstancesDescription: Field<string>;

  // Contact information (matching field mapping structure)
  contactPerson1: {
    firstName: Field<string>;
    middleName: Field<string>;
    lastName: Field<string>;
    suffix: Field<string>;
    associationFromDate: Field<string>; // Single value field
    associationFromDateEstimated: Field<boolean>;
    associationToDate: Field<string>; // Single value field
    associationToDateEstimated: Field<boolean>;
    associationIsPresent: Field<boolean>;
    frequencyOfContact: Field<string>;
    officialTitle: Field<string>;
    street: Field<string>;
    city: Field<string>;
    state: Field<string>;
    country: Field<string>;
    zipCode: Field<string>;
  };

  contactPerson2: {
    firstName: Field<string>;
    middleName: Field<string>;
    lastName: Field<string>;
    suffix: Field<string>;
    associationFromDate: Field<string>; // Single value field
    associationFromDateEstimated: Field<boolean>;
    associationToDate: Field<string>; // Single value field
    associationToDateEstimated: Field<boolean>;
    associationIsPresent: Field<boolean>;
    frequencyOfContact: Field<string>;
    officialTitle: Field<string>;
    street: Field<string>;
    city: Field<string>;
    state: Field<string>;
    country: Field<string>;
    zipCode: Field<string>;
    specify?: Field<string>; // Only contactPerson2 has specify field
  };
}

/**
 * Section 15 main data structure
 */
export interface Section15 {
  _id: number;
  section15: {
    // Military Service section (15.1)
    militaryService: {
      hasServed: FieldWithOptions<"YES" | "NO (If NO, proceed to Section 15.2) ">; // YES/NO radio button
      entries: MilitaryServiceEntry[]; // Array of military service entries
    };

    // Disciplinary Procedures section (15.2)
    disciplinaryProcedures: {
      hasDisciplinaryAction: FieldWithOptions<"YES" | "NO (If NO, proceed to Section 15.3) ">; // YES/NO
      entries: MilitaryDisciplinaryEntry[]; // Array of disciplinary entries
    };

    // Foreign Military Service section (15.3)
    foreignMilitaryService: {
      hasServedInForeignMilitary: FieldWithOptions<"YES" | "NO (If NO, proceed to Section 16)">; // YES/NO
      entries: ForeignMilitaryServiceEntry[]; // Array of foreign military entries
    };
  };
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 15 subsection keys for type safety
 */
export type Section15SubsectionKey = 'militaryService' | 'disciplinaryProcedures' | 'foreignMilitaryService';

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 15 (Military History)
 * Based on the actual field IDs from section-15.json
 */
export const SECTION15_FIELD_IDS = {
  // 15.1 Military Service
  HAS_SERVED: "17088", // Has served radio button
  SERVICE_BRANCH: "17087", // Branch selection (1-7)
  SERVICE_STATE: "11394", // State dropdown for National Guard
  SERVICE_STATUS: "17085", // Officer/Enlisted/Other
  SERVICE_FROM_DATE: "11466", // From date
  SERVICE_FROM_ESTIMATED: "11465", // From date estimate checkbox
  SERVICE_TO_DATE: "11464", // To date
  SERVICE_TO_PRESENT: "11463", // Present checkbox
  SERVICE_TO_ESTIMATED: "11462", // To date estimate checkbox
  SERVICE_NUMBER: "11461", // Service number
  DISCHARGE_TYPE: "17084", // Discharge type radio
  TYPE_OF_DISCHARGE: "17083", // Honorable/Other discharge type
  DISCHARGE_DATE: "11459", // Discharge date
  DISCHARGE_ESTIMATED: "11458", // Discharge date estimate
  OTHER_DISCHARGE_TYPE: "11457", // Other discharge type text
  DISCHARGE_REASON: "11456", // Reason for discharge

  // Current status checkboxes
  ACTIVE_DUTY: "11455",
  ACTIVE_RESERVE: "11454",
  INACTIVE_RESERVE: "11453",

  // 15.2 Disciplinary Procedures
  HAS_DISCIPLINARY: "17082", // Has been subject to disciplinary
  PROCEDURE_DATE: "11452", // Date of procedure
  PROCEDURE_ESTIMATED: "11451", // Procedure date estimate
  UCMJ_OFFENSE: "11450", // UCMJ offense description
  DISCIPLINARY_NAME: "11449", // Name of disciplinary procedure
  MILITARY_COURT: "11448", // Military court description
  FINAL_OUTCOME: "11447", // Final outcome

  // 15.3 Foreign Military Service
  HAS_FOREIGN_SERVICE: "17081", // Has served in foreign military
  FOREIGN_FROM_DATE: "11446", // Foreign service from date
  FOREIGN_FROM_ESTIMATED: "11445", // Foreign from date estimate
  FOREIGN_TO_DATE: "11444", // Foreign service to date
  FOREIGN_TO_ESTIMATED: "11443", // Foreign to date estimate
  FOREIGN_PRESENT: "11442", // Currently serving
  ORGANIZATION_NAME: "11441", // Foreign organization name
  COUNTRY: "11440", // Country
  HIGHEST_RANK: "11439", // Highest position/rank
  DIVISION_DEPARTMENT: "11438", // Division/department
  REASON_LEAVING: "11437", // Reason for leaving
  CIRCUMSTANCES: "11436", // Circumstances description

  // Contact 1
  CONTACT1_LAST_NAME: "11435",
  CONTACT1_FIRST_NAME: "11434",
  CONTACT1_MIDDLE_NAME: "11433",
  CONTACT1_SUFFIX: "11432",
  CONTACT1_FROM_DATE: "11431",
  CONTACT1_FROM_ESTIMATED: "11430",
  CONTACT1_TO_DATE: "11429",
  CONTACT1_TO_ESTIMATED: "11428",
  CONTACT1_PRESENT: "11427",
  CONTACT1_FREQUENCY: "11426",
  CONTACT1_TITLE: "11425",
  CONTACT1_STREET: "11424",
  CONTACT1_CITY: "11423",
  CONTACT1_STATE: "11422",
  CONTACT1_COUNTRY: "11421",
  CONTACT1_ZIP: "11420",

  // Contact 2
  CONTACT2_LAST_NAME: "11419",
  CONTACT2_FIRST_NAME: "11418",
  CONTACT2_MIDDLE_NAME: "11417",
  CONTACT2_SUFFIX: "11416",
  CONTACT2_FROM_DATE: "11415",
  CONTACT2_FROM_ESTIMATED: "11414",
  CONTACT2_TO_DATE: "11413",
  CONTACT2_TO_ESTIMATED: "11412",
  CONTACT2_PRESENT: "11411",
  CONTACT2_FREQUENCY: "11410",
  CONTACT2_TITLE: "11409",
  CONTACT2_SPECIFY: "11408",
} as const;

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Validation rules specific to Section 15
 */
export interface Section15ValidationRules {
  requiresMilitaryServiceStatus: boolean;
  requiresServiceDetailsIfServed: boolean;
  requiresDischargeInfoIfCompleted: boolean;
  requiresDisciplinaryDetailsIfYes: boolean;
  requiresForeignServiceDetailsIfYes: boolean;
  requiresContactInfoForForeignService: boolean;
  maxDescriptionLength: number;
  maxServiceNumberLength: number;
}

/**
 * Section 15 validation context
 */
export interface Section15ValidationContext {
  rules: Section15ValidationRules;
  allowPartialCompletion: boolean;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Military service branch options
 */
export const MILITARY_BRANCH_OPTIONS = [
  "1", // Army
  "2", // Navy
  "3", // Marine Corps
  "4", // Air Force
  "5", // National Guard
  "6", // Coast Guard
  "7"  // Other
] as const;

/**
 * Service status options
 */
export const SERVICE_STATUS_OPTIONS = [
  "1", // Officer
  "2", // Enlisted
  "3"  // Other
] as const;

/**
 * Yes/No options for military service
 */
export const MILITARY_SERVICE_OPTIONS = [
  "YES",
  "NO (If NO, proceed to Section 15.2) "
] as const;

/**
 * Yes/No options for disciplinary procedures
 */
export const DISCIPLINARY_OPTIONS = [
  "YES",
  "NO (If NO, proceed to Section 15.3) "
] as const;

/**
 * Yes/No options for foreign military service
 */
export const FOREIGN_MILITARY_OPTIONS = [
  "YES",
  "NO (If NO, proceed to Section 16)"
] as const;

/**
 * Generic Yes/No options (for backward compatibility)
 */
export const YES_NO_OPTIONS = [
  "YES",
  "NO"
] as const;

/**
 * Discharge type options
 */
export const DISCHARGE_TYPE_OPTIONS = [
  "Honorable",
  "General Under Honorable Conditions",
  "Other Than Honorable",
  "Bad Conduct",
  "Dishonorable",
  "Entry Level Separation",
  "Other"
] as const;

/**
 * Validation patterns for Section 15
 */
export const SECTION15_VALIDATION = {
  SERVICE_NUMBER_MIN_LENGTH: 1,
  SERVICE_NUMBER_MAX_LENGTH: 20,
  DESCRIPTION_MIN_LENGTH: 1,
  DESCRIPTION_MAX_LENGTH: 2000,
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  SERVICE_NUMBER_PATTERN: /^[A-Za-z0-9\-\s]*$/,
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for military history field updates
 */
export type Section15FieldUpdate = {
  fieldPath: string;
  newValue: any;
  entryIndex?: number;
  subsection: Section15SubsectionKey;
};

/**
 * Type for military history validation results
 */
export type MilitaryHistoryValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 15 data structure using DRY approach with sections-references
 */
export const createDefaultSection15 = (): Section15 => {
  // Validate field count against sections-references
  validateSectionFieldCount(15);

  return {
    _id: 15,
    section15: {
      militaryService: {
        hasServed: {
          ...createFieldFromReference(15, 'form1[0].Section14_1[0].#area[4].RadioButtonList[1]', 'NO (If NO, proceed to Section 15.2) '),
          options: MILITARY_SERVICE_OPTIONS
        },
        entries: []
      },
      disciplinaryProcedures: {
        hasDisciplinaryAction: {
          ...createFieldFromReference(15, 'form1[0].Section15_2[0].#area[0].RadioButtonList[0]', 'NO (If NO, proceed to Section 15.3) '),
          options: DISCIPLINARY_OPTIONS
        },
        entries: []
      },
      foreignMilitaryService: {
        hasServedInForeignMilitary: {
          ...createFieldFromReference(15, 'form1[0].Section15_3[0].RadioButtonList[0]', 'NO (If NO, proceed to Section 16)'),
          options: FOREIGN_MILITARY_OPTIONS
        },
        entries: []
      }
    }
  };
};

/**
 * Creates a default military service entry using actual field names from sections-references
 */
export const createDefaultMilitaryServiceEntry = (): MilitaryServiceEntry => {
  return {
    branch: {
      ...createFieldFromReference(15, 'form1[0].Section14_1[0].#area[5].#area[6].RadioButtonList[2]', '5'),
      options: MILITARY_BRANCH_OPTIONS
    },
    serviceState: createFieldFromReference(15, 'form1[0].Section14_1[0].School6_State[0]', 'TX'),
    serviceStatus: {
      ...createFieldFromReference(15, 'form1[0].Section14_1[0].#area[7].RadioButtonList[3]', '3'),
      options: SERVICE_STATUS_OPTIONS
    },
    fromDate: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[8].From_Datefield_Name_2[0]', ''),
    fromDateEstimated: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[8].#field[7]', false),
    toDate: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[8].From_Datefield_Name_2[1]', ''),
    toDateEstimated: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[8].#field[10]', false),
    isPresent: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[8].#field[9]', false),
    serviceNumber: createFieldFromReference(15, 'form1[0].Section14_1[0].TextField11[3]', ''),
    dischargeType: {
      ...createFieldFromReference(15, 'form1[0].Section14_1[0].#area[9].RadioButtonList[4]', ''),
      options: DISCHARGE_TYPE_OPTIONS
    },
    typeOfDischarge: {
      ...createFieldFromReference(15, 'form1[0].Section14_1[0].#area[10].RadioButtonList[5]', ''),
      options: DISCHARGE_TYPE_OPTIONS
    },
    dischargeDate: createFieldFromReference(15, 'form1[0].Section14_1[0].From_Datefield_Name_2[2]', ''),
    dischargeDateEstimated: createFieldFromReference(15, 'form1[0].Section14_1[0].#field[13]', false),
    otherDischargeType: createFieldFromReference(15, 'form1[0].Section14_1[0].TextField11[4]', ''),
    dischargeReason: createFieldFromReference(15, 'form1[0].Section14_1[0].TextField11[5]', ''),
    currentStatus: {
      activeDuty: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[19].#field[27]', false),
      activeReserve: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[19].#field[28]', false),
      inactiveReserve: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[19].#field[29]', false)
    },
    additionalServiceInfo: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[11].RadioButtonList[6]', ''),
    secondaryBranch: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[12].RadioButtonList[7]', '')
  };
};

/**
 * Creates a default disciplinary entry using actual field names from sections-references
 */
export const createDefaultDisciplinaryEntry = (): MilitaryDisciplinaryEntry => {
  return {
    procedureDate: createFieldFromReference(15, 'form1[0].Section15_2[0].From_Datefield_Name_2[0]', ''),
    procedureDateEstimated: createFieldFromReference(15, 'form1[0].Section15_2[0].#field[2]', false),
    ucmjOffenseDescription: createFieldFromReference(15, 'form1[0].Section15_2[0].From_Datefield_Name_2[1]', 'OffencesCharged1'),
    disciplinaryProcedureName: createFieldFromReference(15, 'form1[0].Section15_2[0].From_Datefield_Name_2[2]', 'DisplinaryProcedure1'),
    militaryCourtDescription: createFieldFromReference(15, 'form1[0].Section15_2[0].From_Datefield_Name_2[3]', 'CourtCharged1'),
    finalOutcome: createFieldFromReference(15, 'form1[0].Section15_2[0].From_Datefield_Name_2[4]', 'FinalOutcome1')
  };
};

/**
 * Creates a default foreign military service entry using actual field names from sections-references
 */
export const createDefaultForeignMilitaryEntry = (): ForeignMilitaryServiceEntry => {
  return {
    fromDate: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[0]', ''),
    fromDateEstimated: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].#field[3]', false),
    toDate: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[1]', ''),
    toDateEstimated: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].#field[5]', false),
    isPresent: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].#field[6]', false),
    organizationName: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField11[0]', ''),
    country: createFieldFromReference(15, 'form1[0].Section15_3[0].DropDownList29[0]', ''),
    highestRank: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField11[1]', ''),
    divisionDepartment: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField11[2]', ''),
    reasonForLeaving: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField12[0]', ''),
    circumstancesDescription: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField13[0]', ''),
    contactPerson1: {
      firstName: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[5].TextField11[16]', ''),
      middleName: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[5].TextField11[15]', ''),
      lastName: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[5].TextField11[14]', ''),
      suffix: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[5].suffix[1]', ''),
      associationFromDate: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[5].#area[7].From_Datefield_Name_2[4]', ''),
      associationFromDateEstimated: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[5].#area[7].#field[39]', false),
      associationToDate: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[5].#area[7].From_Datefield_Name_2[5]', ''),
      associationToDateEstimated: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[5].#area[7].#field[41]', false),
      associationIsPresent: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[5].#area[7].#field[42]', false),
      frequencyOfContact: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[5].TextField11[18]', ''),
      officialTitle: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[5].TextField11[17]', ''),
      street: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[5].#area[6].TextField11[11]', ''),
      city: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[5].#area[6].TextField11[12]', ''),
      state: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[5].#area[6].School6_State[1]', ''),
      country: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[5].#area[6].DropDownList7[0]', ''),
      zipCode: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[5].#area[6].TextField11[13]', '')
    },
    contactPerson2: {
      firstName: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].TextField11[8]', ''),
      middleName: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].TextField11[6]', ''),
      lastName: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].TextField11[7]', ''),
      suffix: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].suffix[0]', ''),
      associationFromDate: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].From_Datefield_Name_2[2]', ''),
      associationFromDateEstimated: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#field[23]', false),
      associationToDate: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].From_Datefield_Name_2[3]', ''),
      associationToDateEstimated: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#field[25]', false),
      associationIsPresent: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#field[26]', false),
      frequencyOfContact: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField11[9]', ''),
      officialTitle: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField11[10]', ''),
      street: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].TextField11[3]', ''),
      city: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].TextField11[4]', ''),
      state: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].School6_State[0]', ''),
      country: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].DropDownList6[0]', ''),
      zipCode: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].TextField11[5]', ''),
      specify: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField11[19]', '')
    },


  };
};

