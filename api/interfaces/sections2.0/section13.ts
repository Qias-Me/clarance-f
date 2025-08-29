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
  apo: Field<string>; // Added for PAGE 17 fields
  street: Field<string>;
  state: FieldWithOptions<USState>; // Added for PAGE 17 fields
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
  physicalAddress?: EmploymentAddress; // Added for PAGE 17 fields
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
  // Fired from job - sect13A.5Entry1_DateFired, sect13A.5Entry1_ReasonForBeingFired
  wasFired: Field<boolean>;
  dateFired?: Field<string>; // sect13A.5Entry1_DateFired
  reasonForFiring?: Field<string>; // sect13A.5Entry1_ReasonForBeingFired

  // Quit after being told - sect13A.5Entry1_DateQuit, sect13A.5Entry1_ReasonForQuitting
  quitAfterBeingTold: Field<boolean>;
  dateQuit?: Field<string>; // sect13A.5Entry1_DateQuit
  reasonForQuitting?: Field<string>; // sect13A.5Entry1_ReasonForQuitting

  // Left by mutual agreement - sect13A.5Entry1_DateLeftMutual, sect13A.5Entry1_ResonForLEaving
  leftByMutualAgreement: Field<boolean>;
  dateLeftMutual?: Field<string>; // sect13A.5Entry1_DateLeftMutual
  reasonForLeaving?: Field<string>; // sect13A.5Entry1_ResonForLEaving

  // General leaving date - sect13A.5Entry1_DateLeft
  generalLeavingDate?: Field<string>; // sect13A.5Entry1_DateLeft

  // Note: hasChargesOrAllegations and hasUnsatisfactoryPerformance fields don't exist in the actual PDF
  // These were removed after verification against section-13.json
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

  // Employer information (for PDF mapping compatibility)
  employerName: Field<string>;
  positionTitle: Field<string>;

  // Military-specific information
  rankTitle: Field<string>;
  dutyStation: DutyStationAddress;
  phone: PhoneInfo;

  // Additional address fields for PAGE 17 fields
  apoAddress?: ApoFpoAddress;
  physicalLocation?: EmploymentAddress;

  // Supervisor information
  supervisor: SupervisorContact;

  // Other explanation if employment type is "Other"
  otherExplanation?: Field<string>;

  // SSN field for PAGE 17 fields
  ssn?: Field<string>;

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
  // Main employment questions
  hasEmployment: Field<"YES" | "NO">;
  hasGaps: Field<"YES" | "NO">;
  gapExplanation: Field<string>;

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
// ARCHITECTURAL NOTE
// ============================================================================
//
// Note: Helper functions have been moved to the context layer to follow
// proper Interface → Context → Component architectural hierarchy.
// Functions like createDefaultMilitaryEmploymentEntry, createDefaultNonFederalEmploymentEntry,
// createDefaultSelfEmploymentEntry, createDefaultUnemploymentEntry, createDefaultSection13,
// updateSection13Field, validateEmploymentDates, formatEmploymentDate, and calculateEmploymentDuration
// are now implemented in app/state/contexts/sections2.0/Section13.tsx
//