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
  hasServed: FieldWithOptions<string>; // YES/NO radio button
  branch: FieldWithOptions<string>; // Service branch (1-7 options)
  serviceState: Field<string>; // State of service if National Guard
  serviceStatus: FieldWithOptions<string>; // Officer/Enlisted/Other
  
  // Service dates
  fromDate: DateField;
  fromDateEstimated: Field<boolean>;
  toDate: DateField;
  toDateEstimated: Field<boolean>;
  isPresent: Field<boolean>; // Still serving
  
  serviceNumber: Field<string>;
  
  // Discharge information
  dischargeType: FieldWithOptions<string>; // Radio button list
  typeOfDischarge: FieldWithOptions<string>; // Honorable/Dishonorable/etc
  dischargeDate: DateField;
  dischargeDateEstimated: Field<boolean>;
  otherDischargeType: Field<string>; // If "Other" selected
  dischargeReason: Field<string>; // Required if not honorable
  
  // Current status
  currentStatus: {
    activeDuty: Field<boolean>;
    activeReserve: Field<boolean>;
    inactiveReserve: Field<boolean>;
  };
}

/**
 * Court martial/disciplinary procedure entry for Section 15.2
 */
export interface MilitaryDisciplinaryEntry {
  hasBeenSubjectToDisciplinary: FieldWithOptions<string>; // YES/NO
  
  // Disciplinary procedure details
  procedureDate: DateField;
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
  hasServedInForeignMilitary: FieldWithOptions<string>; // YES/NO
  
  // Service period
  fromDate: DateField;
  fromDateEstimated: Field<boolean>;
  toDate: DateField;
  toDateEstimated: Field<boolean>;
  isPresent: Field<boolean>;
  
  // Organization details
  organizationName: Field<string>;
  country: Field<string>;
  highestRank: Field<string>;
  divisionDepartment: Field<string>;
  reasonForLeaving: Field<string>;
  circumstancesDescription: Field<string>;
  
  // Contact information
  contact1: {
    fullName: {
      firstName: Field<string>;
      middleName: Field<string>;
      lastName: Field<string>;
      suffix: Field<string>;
    };
    associationPeriod: {
      fromDate: DateField;
      fromDateEstimated: Field<boolean>;
      toDate: DateField;
      toDateEstimated: Field<boolean>;
      isPresent: Field<boolean>;
    };
    frequencyOfContact: Field<string>;
    officialTitle: Field<string>;
    address: {
      street: Field<string>;
      city: Field<string>;
      state: Field<string>;
      country: Field<string>;
      zipCode: Field<string>;
    };
  };
  
  contact2: {
    fullName: {
      firstName: Field<string>;
      middleName: Field<string>;
      lastName: Field<string>;
      suffix: Field<string>;
    };
    associationPeriod: {
      fromDate: DateField;
      fromDateEstimated: Field<boolean>;
      toDate: DateField;
      toDateEstimated: Field<boolean>;
      isPresent: Field<boolean>;
    };
    frequencyOfContact: Field<string>;
    officialTitle: Field<string>;
    specify: Field<string>; // Additional specification field
  };
}

/**
 * Section 15 main data structure
 */
export interface Section15 {
  _id: number;
  section15: {
    militaryService: MilitaryServiceEntry[];
    disciplinaryProcedures: MilitaryDisciplinaryEntry[];
    foreignMilitaryService: ForeignMilitaryServiceEntry[];
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
  "5", // Coast Guard
  "6", // Space Force
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
 * Yes/No options
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
      militaryService: [],
      disciplinaryProcedures: [],
      foreignMilitaryService: []
    }
  };
};

/**
 * Creates a default military service entry using actual field names from sections-references
 */
export const createDefaultMilitaryServiceEntry = (): MilitaryServiceEntry => {
  return {
    hasServed: {
      ...createFieldFromReference(15, 'form1[0].Section14_1[0].#area[4].RadioButtonList[1]', 'NO (If NO, proceed to Section 15.2) '),
      options: YES_NO_OPTIONS
    },
    branch: {
      ...createFieldFromReference(15, 'form1[0].Section14_1[0].#area[5].#area[6].RadioButtonList[2]', '5'),
      options: MILITARY_BRANCH_OPTIONS
    },
    serviceState: createFieldFromReference(15, 'form1[0].Section14_1[0].School6_State[0]', 'TX'),
    serviceStatus: {
      ...createFieldFromReference(15, 'form1[0].Section14_1[0].#area[7].RadioButtonList[3]', '3'),
      options: SERVICE_STATUS_OPTIONS
    },
    fromDate: {
      month: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[8].From_Datefield_Name_2[0]', 'fromDate'),
      year: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[8].From_Datefield_Name_2[0]', 'fromDate')
    },
    fromDateEstimated: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[8].#field[7]', true),
    toDate: {
      month: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[8].From_Datefield_Name_2[1]', 'toDate'),
      year: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[8].From_Datefield_Name_2[1]', 'toDate')
    },
    toDateEstimated: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[8].#field[10]', true),
    isPresent: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[8].#field[9]', true),
    serviceNumber: createFieldFromReference(15, 'form1[0].Section14_1[0].TextField11[3]', 'serviceNumber'),
    dischargeType: {
      ...createFieldFromReference(15, 'form1[0].Section14_1[0].#area[9].RadioButtonList[4]', 'YES'),
      options: DISCHARGE_TYPE_OPTIONS
    },
    typeOfDischarge: {
      ...createFieldFromReference(15, 'form1[0].Section14_1[0].#area[10].RadioButtonList[5]', '4'),
      options: DISCHARGE_TYPE_OPTIONS
    },
    dischargeDate: {
      month: createFieldFromReference(15, 'form1[0].Section14_1[0].From_Datefield_Name_2[2]', 'date'),
      year: createFieldFromReference(15, 'form1[0].Section14_1[0].From_Datefield_Name_2[2]', 'date')
    },
    dischargeDateEstimated: createFieldFromReference(15, 'form1[0].Section14_1[0].#field[13]', true),
    otherDischargeType: createFieldFromReference(15, 'form1[0].Section14_1[0].TextField11[4]', 'Other'),
    dischargeReason: createFieldFromReference(15, 'form1[0].Section14_1[0].TextField11[5]', 'dischargeReadon'),
    currentStatus: {
      activeDuty: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[19].#field[27]', false),
      activeReserve: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[19].#field[28]', false),
      inactiveReserve: createFieldFromReference(15, 'form1[0].Section14_1[0].#area[19].#field[29]', false)
    }
  };
};

/**
 * Creates a default disciplinary entry using actual field names from sections-references
 */
export const createDefaultDisciplinaryEntry = (): MilitaryDisciplinaryEntry => {
  return {
    hasBeenSubjectToDisciplinary: {
      ...createFieldFromReference(15, 'form1[0].Section15_2[0].#area[0].RadioButtonList[0]', 'NO (If NO, proceed to Section 15.3) '),
      options: YES_NO_OPTIONS
    },
    procedureDate: {
      month: createFieldFromReference(15, 'form1[0].Section15_2[0].From_Datefield_Name_2[0]', 'DateOfCourt1'),
      year: createFieldFromReference(15, 'form1[0].Section15_2[0].From_Datefield_Name_2[0]', 'DateOfCourt1')
    },
    procedureDateEstimated: createFieldFromReference(15, 'form1[0].Section15_2[0].#field[2]', true),
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
    hasServedInForeignMilitary: {
      ...createFieldFromReference(15, 'form1[0].Section15_3[0].RadioButtonList[0]', 'NO (If NO, proceed to Section 16)'),
      options: YES_NO_OPTIONS
    },
    fromDate: {
      month: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[0]', '2020-01-01'),
      year: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[0]', '2020-01-01')
    },
    fromDateEstimated: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].#field[3]', true),
    toDate: {
      month: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[1]', '2023-01-01'),
      year: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[1]', '2023-01-01')
    },
    toDateEstimated: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].#field[5]', true),
    isPresent: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].#field[6]', true),
    organizationName: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField11[0]', 'NameOfORg'),
    country: createFieldFromReference(15, 'form1[0].Section15_3[0].DropDownList29[0]', 'United States'),
    highestRank: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField11[1]', 'Manager'),
    divisionDepartment: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField11[2]', 'Human Resources'),
    reasonForLeaving: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField12[0]', 'Personal Reasons'),
    circumstancesDescription: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField13[0]', 'Team Collaboration'),
    contact1: {
      fullName: {
        firstName: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].TextField11[3]', '123 Main St'),
        middleName: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].TextField11[4]', 'Anytown'),
        lastName: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].School6_State[0]', 'CA'),
        suffix: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].DropDownList6[0]', 'USA')
      },
      associationPeriod: {
        fromDate: {
          month: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[0]', '2020-01-01'),
          year: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[0]', '2020-01-01')
        },
        fromDateEstimated: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].#field[3]', true),
        toDate: {
          month: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[1]', '2023-01-01'),
          year: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[1]', '2023-01-01')
        },
        toDateEstimated: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].#field[5]', true),
        isPresent: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].#field[6]', true)
      },
      frequencyOfContact: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField11[1]', 'Manager'),
      officialTitle: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField11[2]', 'Human Resources'),
      address: {
        street: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].TextField11[3]', '123 Main St'),
        city: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].TextField11[4]', 'Anytown'),
        state: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].School6_State[0]', 'CA'),
        country: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].DropDownList6[0]', 'USA'),
        zipCode: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].TextField11[3]', '123 Main St')
      }
    },
    contact2: {
      fullName: {
        firstName: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].TextField11[3]', '123 Main St'),
        middleName: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].TextField11[4]', 'Anytown'),
        lastName: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].School6_State[0]', 'CA'),
        suffix: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[2].#area[3].DropDownList6[0]', 'USA')
      },
      associationPeriod: {
        fromDate: {
          month: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[0]', '2020-01-01'),
          year: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[0]', '2020-01-01')
        },
        fromDateEstimated: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].#field[3]', true),
        toDate: {
          month: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[1]', '2023-01-01'),
          year: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[1]', '2023-01-01')
        },
        toDateEstimated: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].#field[5]', true),
        isPresent: createFieldFromReference(15, 'form1[0].Section15_3[0].#area[0].#field[6]', true)
      },
      frequencyOfContact: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField11[1]', 'Manager'),
      officialTitle: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField11[2]', 'Human Resources'),
      specify: createFieldFromReference(15, 'form1[0].Section15_3[0].TextField12[0]', 'Personal Reasons')
    }
  };
};

/**
 * Updates a Section 15 field
 */
export const updateSection15Field = (
  section15Data: Section15,
  update: Section15FieldUpdate
): Section15 => {
  const updatedData = { ...section15Data };
  
  // Handle field updates based on subsection and entry index
  // Implementation would use lodash.set or similar for deep updates
  
  return updatedData;
};

/**
 * Validates military history information
 */
export function validateMilitaryHistory(
  militaryData: Section15['section15'], 
  context: Section15ValidationContext
): MilitaryHistoryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate military service entries
  militaryData.militaryService.forEach((entry, index) => {
    if (entry.hasServed.value === 'YES') {
      if (!entry.branch.value) {
        errors.push(`Military service entry ${index + 1}: Branch is required`);
      }
      if (!entry.fromDate.month.value || !entry.fromDate.year.value) {
        errors.push(`Military service entry ${index + 1}: Service start date is required`);
      }
      if (!entry.serviceNumber.value) {
        errors.push(`Military service entry ${index + 1}: Service number is required`);
      }
    }
  });

  // Validate disciplinary procedures
  militaryData.disciplinaryProcedures.forEach((entry, index) => {
    if (entry.hasBeenSubjectToDisciplinary.value === 'YES') {
      if (!entry.ucmjOffenseDescription.value) {
        errors.push(`Disciplinary entry ${index + 1}: UCMJ offense description is required`);
      }
      if (!entry.disciplinaryProcedureName.value) {
        errors.push(`Disciplinary entry ${index + 1}: Disciplinary procedure name is required`);
      }
    }
  });

  // Validate foreign military service
  militaryData.foreignMilitaryService.forEach((entry, index) => {
    if (entry.hasServedInForeignMilitary.value === 'YES') {
      if (!entry.organizationName.value) {
        errors.push(`Foreign military entry ${index + 1}: Organization name is required`);
      }
      if (!entry.country.value) {
        errors.push(`Foreign military entry ${index + 1}: Country is required`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Checks if Section 15 is complete
 */
export function isSection15Complete(section15Data: Section15): boolean {
  const { militaryService, disciplinaryProcedures, foreignMilitaryService } = section15Data.section15;
  
  // Check if at least one subsection has been addressed
  const hasMilitaryServiceResponse = militaryService.some(entry => entry.hasServed.value);
  const hasDisciplinaryResponse = disciplinaryProcedures.some(entry => entry.hasBeenSubjectToDisciplinary.value);
  const hasForeignServiceResponse = foreignMilitaryService.some(entry => entry.hasServedInForeignMilitary.value);
  
  return hasMilitaryServiceResponse || hasDisciplinaryResponse || hasForeignServiceResponse;
}

/**
 * Determines which fields should be visible based on responses
 */
export function getVisibleFields(entry: MilitaryServiceEntry): string[] {
  const visibleFields: string[] = ['hasServed'];
  
  if (entry.hasServed.value === 'YES') {
    visibleFields.push(
      'branch', 'serviceStatus', 'fromDate', 'toDate', 
      'serviceNumber', 'dischargeType', 'currentStatus'
    );
    
    if (entry.branch.value === '5') { // National Guard
      visibleFields.push('serviceState');
    }
    
    if (entry.dischargeType.value && entry.dischargeType.value !== 'Honorable') {
      visibleFields.push('dischargeReason');
    }
    
    if (entry.typeOfDischarge.value === 'Other') {
      visibleFields.push('otherDischargeType');
    }
  }
  
  return visibleFields;
} 