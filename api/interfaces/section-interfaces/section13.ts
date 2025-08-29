/**
 * Section 13: Employment Activities
 *
 * TypeScript interface definitions for SF-86 Section 13 (Employment Activities) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-13.json.
 * 
 * This section covers employment history including employers, positions, dates, supervisors,
 * and employment-related activities with extensive fields across multiple pages.
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';
import type { USState, Country } from './base';
import { cloneDeep } from 'lodash';
import { set } from 'lodash';
import { createFieldFromReference, validateSectionFieldCount } from '../../utils/sections-references-loader';
import { 
  TOTAL_SECTION_13_FIELDS,
  FIELD_COUNTS_BY_TYPE,
  MAX_EMPLOYMENT_ENTRIES,
  MIN_EMPLOYMENT_DURATION_MONTHS
} from '~/constants/section13-constants';


// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Employment date range information
 */
export interface EmploymentDateRange {
  fromDate: Field<string>;
  fromEstimated: Field<boolean>;
  toDate: Field<string>;
  toEstimated: Field<boolean>;
  present: Field<boolean>;
}

/**
 * Employment address information
 */
export interface EmploymentAddress {
  street: Field<string>;
  city: Field<string>;
  state: FieldWithOptions<USState>;
  zipCode: Field<string>;
  country: FieldWithOptions<Country>;
}

/**
 * Duty station address for military employment
 */
export interface DutyStationAddress {
  dutyStation: Field<string>;
  street: Field<string>;
  city: Field<string>;
  state: FieldWithOptions<USState>;
  zipCode: Field<string>;
  country: FieldWithOptions<Country>;
}

/**
 * APO/FPO address information
 */
export interface ApoFpoAddress {
  apoFpo: Field<string>;
  street: Field<string>;
  zipCode: Field<string>;
}

/**
 * Phone information with extension
 */
export interface PhoneInfo {
  number: Field<string>;
  extension: Field<string>;
  isDSN: Field<boolean>;
  isDay: Field<boolean>;
  isNight: Field<boolean>;
}

/**
 * Employment type enumeration based on SF-86 form options
 */
export type EmploymentType = 
  | "Federal Employment"
  | "State Government"
  | "Local Government"
  | "Private Company"
  | "Non-Profit Organization"
  | "Self-Employment"
  | "Military Service"
  | "Contract Work"
  | "Consulting"
  | "Unemployment"
  | "Other";

/**
 * Employment status enumeration
 */
export type EmploymentStatus =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Temporary"
  | "Seasonal"
  | "Volunteer"
  | "Unemployed"
  | "Other";

/**
 * Type guards for employment types
 */
export const isGovernmentEmployment = (type: EmploymentType): boolean => {
  return type === "Federal Employment" || 
         type === "State Government" || 
         type === "Local Government";
};

export const isFederalEmployment = (type: EmploymentType): boolean => {
  return type === "Federal Employment" || type === "Military Service";
};

export const isPrivateEmployment = (type: EmploymentType): boolean => {
  return type === "Private Company" || 
         type === "Non-Profit Organization" || 
         type === "Contract Work" || 
         type === "Consulting" || 
         type === "Self-Employment";
};

/**
 * Reason for leaving enumeration
 */
export type ReasonForLeaving =
  | "Resigned"
  | "Terminated"
  | "Laid Off"
  | "Contract Ended"
  | "Career Change"
  | "Relocation"
  | "Better Opportunity"
  | "Education"
  | "Family Reasons"
  | "Retirement"
  | "Still Employed"
  | "Other";

/**
 * Supervisor contact information
 */
export interface SupervisorContact {
  name: Field<string>;
  title: Field<string>;
  email: Field<string>;
  emailUnknown: Field<boolean>;
  phone: PhoneInfo;
  workLocation: EmploymentAddress;
  hasApoFpo: Field<boolean>;
  apoFpoAddress?: ApoFpoAddress;
  canContact: Field<"YES" | "NO">;
  contactRestrictions: Field<string>;
}

/**
 * Additional employment period for Section 13A.2
 * Maps to: sect13A.2Entry1_FromDate1-4, sect13A.2Entry1_ToDate1-4, etc.
 */
export interface AdditionalEmploymentPeriod {
  _id: string | number;
  fromDate: Field<string>;
  toDate: Field<string>;
  positionTitle: Field<string>;
  supervisor: Field<string>;
}

/**
 * Multiple additional employment periods for Section 13A.2
 * Based on reference data showing FromDate1-4, ToDate1-4, PositionTitle1-4, Supervisor1-4
 */
export interface MultipleEmploymentPeriods {
  // Period 1 - sect13A.2Entry1_FromDate1, sect13A.2Entry1_ToDate1, etc.
  periods?: {
    fromDate: Field<string>; // sect13A.2Entry1_FromDate1
    toDate: Field<string>; // sect13A.2Entry1_ToDate1
    positionTitle: Field<string>; // sect13A.2Entry1_PositionTitle1
    supervisor: Field<string>; // sect13A.2Entry1_Supervisor1
  }[];
}

/**
 * Reference contact for unemployment verification
 */
export interface UnemploymentReference {
  firstName: Field<string>;
  lastName: Field<string>;
  address: EmploymentAddress;
  phone: PhoneInfo;
}

/**
 * Employment record issues for Section 13A.5
 */
export interface EmploymentRecordIssues {
  // Main questions - RadioButtonList fields from JSON analysis
  wasFired: Field<boolean>; // RadioButtonList[0] on page 33
  quitAfterBeingTold: Field<boolean>;
  leftByMutualAgreement: Field<boolean>;
  hasChargesOrAllegations: Field<boolean>;
  hasUnsatisfactoryPerformance: Field<boolean>;

  // Employment dates structure (discovered in JSON - 62 total fields)
  employmentDates: {
    fromDate: Field<string>;
    toDate: Field<string>; // From_Datefield_Name_2[1] 
    present: Field<boolean>; // #field[12] checkbox
    fromEstimated: Field<boolean>; // #field[10] checkbox
    toEstimated: Field<boolean>;
  };

  // Additional addresses for employment issues (JSON page 33)
  additionalAddresses: Array<{
    street: Field<string>; // TextField11[0]
    city: Field<string>; // TextField11[1] 
    state: FieldWithOptions<USState>; // School6_State[0] dropdown
    country: FieldWithOptions<Country>; // DropDownList2[0]
    zipCode: Field<string>; // TextField11[2]
  }>;

  // Detailed reason fields for each issue type
  reasonForFiring?: Field<string>;
  reasonForQuitting?: Field<string>; 
  reasonForLeaving?: Field<string>;
  reasonForUnsatisfactory?: Field<string>;
  chargesOrAllegations?: Field<string>;

  // Specific incident date fields
  dateFired?: Field<string>;
  dateQuit?: Field<string>;
  dateLeftMutual?: Field<string>;
  generalLeavingDate?: Field<string>
}

/**
 * Disciplinary actions for Section 13A.6
 * Maps to: sect13A.6Entry1_* fields from reference data
 */
export interface DisciplinaryActions {
  receivedWrittenWarning: Field<boolean>;

  warningDates: Field<string>[];
  warningReasons: Field<string>[];
}

/**
 * Employment verification information
 */
export interface EmploymentVerification {
  verified: Field<boolean>;
  verificationDate: Field<string>;
  verificationMethod: Field<string>;
  notes: Field<string>;
}

/**
 * Section 13A.1 - Military/Federal Employment Entry
 */
export interface MilitaryEmploymentEntry {
  _id: string | number;
  employmentDates: EmploymentDateRange;
  employmentStatus: FieldWithOptions<EmploymentStatus>;

  // Military-specific information
  rankTitle: Field<string>;
  dutyStation: DutyStationAddress;
  phone: PhoneInfo;

  // Supervisor information
  supervisor: SupervisorContact;

  // Other explanation if employment type is "Other"
  otherExplanation?: Field<string>;

}

/**
 * Section 13A.2 - Non-Federal Employment Entry
 */
export interface NonFederalEmploymentEntry {
  _id: string | number;
  employmentDates: EmploymentDateRange;
  employmentStatus: FieldWithOptions<EmploymentStatus>;

  // Employer information
  employerName: Field<string>;
  positionTitle: Field<string>;
  employerAddress: EmploymentAddress;
  phone: PhoneInfo;

  // Additional employment periods - based on reference data showing multiple periods
  hasAdditionalPeriods: Field<boolean>;
  additionalPeriods: AdditionalEmploymentPeriod[]; // Legacy array format
  multipleEmploymentPeriods: MultipleEmploymentPeriods; // New structured format matching reference data

  // Physical work address (if different)
  hasPhysicalWorkAddress: Field<boolean>;
  physicalWorkAddress?: EmploymentAddress;

  // Supervisor information
  supervisor: SupervisorContact;

}

/**
 * Section 13A.3 - Self-Employment Entry
 */
export interface SelfEmploymentEntry {
  _id: string | number;
  employmentDates: EmploymentDateRange;

  // Business information
  businessName: Field<string>;
  businessType: Field<string>;
  positionTitle: Field<string>;
  businessAddress: EmploymentAddress;
  phone: PhoneInfo;

  // Verifier information
  verifierFirstName: Field<string>;
  verifierLastName: Field<string>;
  verifierAddress: EmploymentAddress;
  verifierPhone: PhoneInfo;

}

/**
 * Section 13A.4 - Unemployment Entry
 */
export interface UnemploymentEntry {
  _id: string | number;
  unemploymentDates: EmploymentDateRange;

  // Reference contact
  reference: UnemploymentReference;

}

/**
 * Generic employment entry (for backward compatibility)
 */
export interface EmploymentEntry {
  _id: string | number;
  employmentDates: EmploymentDateRange;
  employmentType: FieldWithOptions<EmploymentType>;
  employmentStatus: FieldWithOptions<EmploymentStatus>;

  // Employer information
  employerName: Field<string>;
  employerAddress: EmploymentAddress;
  businessType: Field<string>;

  // Position information
  positionTitle: Field<string>;
  positionDescription: Field<string>;
  salary: Field<string>;

  // Supervisor information
  supervisor: SupervisorContact;

  // Employment details
  reasonForLeaving: FieldWithOptions<ReasonForLeaving>;
  additionalComments: Field<string>;

  // Verification
  verification: EmploymentVerification;

}

/**
 * Federal employment specific information
 */
export interface FederalEmploymentInfo {
  hasFederalEmployment: Field<"YES" | "NO">;
  securityClearance: Field<"YES" | "NO">;
  clearanceLevel: Field<string>;
  clearanceDate: Field<string>;
  investigationDate: Field<string>;
  polygraphDate: Field<string>;
  accessToClassified: Field<"YES" | "NO">;
  classificationLevel: Field<string>;
}

/**
 * Employment history subsection with all employment types
 */
export interface EmploymentHistory {
  // Employment type selection
  employmentType: FieldWithOptions<EmploymentType>;
  otherExplanation?: Field<string>;

  // Subsection 13A.1 - Military/Federal Employment
  // Reference data shows Entry1, Entry2 patterns
  militaryEmployment: {
    entries: MilitaryEmploymentEntry[];
  };

  // Subsection 13A.2 - Non-Federal Employment
  // Reference data shows Entry1, Entry2 patterns with multiple periods each
  nonFederalEmployment: {
    entries: NonFederalEmploymentEntry[];
  };

  // Subsection 13A.3 - Self-Employment
  // Reference data shows Entry1 pattern
  selfEmployment: {
    entries: SelfEmploymentEntry[];
  };

  // Subsection 13A.4 - Unemployment
  // Reference data shows Entry1 pattern
  unemployment: {
    entries: UnemploymentEntry[];
  };

  // Subsection 13A.5 - Employment Record Issues
  employmentRecordIssues: EmploymentRecordIssues;

  // Subsection 13A.6 - Disciplinary Actions
  disciplinaryActions: DisciplinaryActions;

  // Federal employment information
  federalInfo: FederalEmploymentInfo;

  // Generic entries (for backward compatibility)
  entries: EmploymentEntry[];
}

/**
 * Section 13 main data structure
 */
export interface Section13 {
  _id: number;
  section13: EmploymentHistory;
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 13 subsection keys for type safety
 */
export type Section13SubsectionKey = 'employmentHistory' | 'federalEmployment';

/**
 * Field name mappings for Section 13 (Employment Activities)
 * Full field paths from section-13.json
 */
export const SECTION13_FIELD_NAMES = {
  // Main section questions - using actual field names from section-13.json
  EMPLOYMENT_TYPE_RADIO_1: "form1[0].section_13_1-2[0].RadioButtonList[0]",
  EMPLOYMENT_STATUS_RADIO_1: "form1[0].section_13_1-2[0].RadioButtonList[1]",
  
  // Entry 1 fields - actual field names from section-13.json
  ENTRY1_SUPERVISOR_NAME: "form1[0].section_13_1-2[0].TextField11[0]",
  ENTRY1_SUPERVISOR_RANK: "form1[0].section_13_1-2[0].TextField11[1]",
  ENTRY1_FROM_DATE: "form1[0].section_13_1-2[0].From_Datefield_Name_2[0]",
  ENTRY1_TO_DATE: "form1[0].section_13_1-2[0].From_Datefield_Name_2[1]",
  
  // Federal employment section
  FEDERAL_EMPLOYMENT_MAIN: "form1[0].section13_5[0].RadioButtonList[0]",
  FEDERAL_EMPLOYMENT_RESPONSE: "form1[0].section13_5[0].RadioButtonList[1]",
} as const;

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Validation rules specific to Section 13
 */
export interface Section13ValidationRules {
  requiresEmploymentHistory: boolean;
  requiresGapExplanation: boolean;
  maxEmploymentEntries: number;
  requiresEmployerName: boolean;
  requiresPositionTitle: boolean;
  requiresEmploymentDates: boolean;
  requiresSupervisorInfo: boolean;
  allowsEstimatedDates: boolean;
  maxEmployerNameLength: number;
  maxPositionDescriptionLength: number;
  maxCommentLength: number;
  timeFrameYears: number;
}

/**
 * Section 13 validation context
 */
export interface Section13ValidationContext {
  rules: Section13ValidationRules;
  currentDate: Date;
  minimumAge: number;
  investigationTimeFrame: number;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Employment type options for dropdown
 */
export const EMPLOYMENT_TYPE_OPTIONS = [
  "Federal Employment",
  "State Government",
  "Local Government",
  "Private Company",
  "Non-Profit Organization",
  "Self-Employment",
  "Military Service",
  "Contract Work",
  "Consulting",
  "Unemployment",
  "Other"
] as const;

/**
 * Employment status options for dropdown
 */
export const EMPLOYMENT_STATUS_OPTIONS = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Seasonal",
  "Volunteer",
  "Unemployed",
  "Other"
] as const;

/**
 * Reason for leaving options for dropdown
 */
export const REASON_FOR_LEAVING_OPTIONS = [
  "Resigned",
  "Terminated",
  "Laid Off",
  "Contract Ended",
  "Career Change",
  "Relocation",
  "Better Opportunity",
  "Education",
  "Family Reasons",
  "Retirement",
  "Still Employed",
  "Other"
] as const;

// ============================================================================
// OPERATION TYPES
// ============================================================================

/**
 * Section 13 field update type
 */
export type Section13FieldUpdate = {
  fieldPath: string;
  newValue: any;
  entryIndex?: number;
};

/**
 * Employment validation result
 */
export type EmploymentValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  entryErrors?: Record<number, string[]>;
};

/**
 * Employment entry operation type
 */
export type EmploymentEntryOperation = 
  | 'add'
  | 'remove'
  | 'update'
  | 'move'
  | 'duplicate'
  | 'clear';

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Creates a default military employment entry (Section 13A.1)
 * Maps to the correct PDF field names from section-13.json
 */

/**
 * Creates a default non-federal employment entry (Section 13A.2)
 * Maps to the correct PDF field names from section-13.json
 */

/**
 * Creates a default self-employment entry (Section 13A.3)
 * Maps to the correct PDF field names from section-13.json
 */

/**
 * Creates a default unemployment entry (Section 13A.4)
 * Maps to the correct PDF field names from section-13.json
 */


/**
 * Creates a default Section 13 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */

// ============================================================================
// UPDATE FUNCTIONS
// ============================================================================

// Note: updateSection13Field has been moved to the context file (section13.tsx)

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates employment dates
 */




// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Formats employment date for display
 */

/**
 * Calculates employment duration in months
 */
