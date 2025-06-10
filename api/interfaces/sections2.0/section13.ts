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

  // Charges or allegations - sect13A.5Entry1_ChargesorAllegations
  hasChargesOrAllegations: Field<boolean>;
  chargesOrAllegations?: Field<string>; // sect13A.5Entry1_ChargesorAllegations

  // Unsatisfactory performance - sect13A.5Entry1_ReasonforUnsatisfactory
  hasUnsatisfactoryPerformance: Field<boolean>;
  reasonForUnsatisfactory?: Field<string>; // sect13A.5Entry1_ReasonforUnsatisfactory
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
export const EMPLOYMENT_TYPE_OPTIONS: EmploymentType[] = [
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
];

/**
 * Employment status options for dropdown
 */
export const EMPLOYMENT_STATUS_OPTIONS: EmploymentStatus[] = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Seasonal",
  "Volunteer",
  "Unemployed",
  "Other"
];

/**
 * Reason for leaving options for dropdown
 */
export const REASON_FOR_LEAVING_OPTIONS: ReasonForLeaving[] = [
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
];

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
export const createDefaultMilitaryEmploymentEntry = (entryId: string | number): MilitaryEmploymentEntry => {
  return {
    _id: entryId,
    employmentDates: {
      fromDate: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].From_Datefield_Name_2[0]', // Maps to sect13A.1Entry1FromDate
        ''
      ),
      fromEstimated: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].#field[32]', // Maps to sect13A.1Entry1FromEstimated
        false
      ),
      toDate: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].From_Datefield_Name_2[1]', // Maps to sect13A.1Entry1ToDate
        ''
      ),
      toEstimated: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].#field[36]', // Maps to sect13A.1Entry1ToEstimated
        false
      ),
      present: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].#field[37]', // Maps to sect13A.1Entry1Present
        false
      )
    },
    employmentStatus: {
      ...createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].p13a-1-1cb[0]', // Maps to sect13A.1Entry1EmploymentStatus
        'Full-time' as EmploymentStatus
      ),
      options: EMPLOYMENT_STATUS_OPTIONS
    },
    rankTitle: createFieldFromReference(
      13,
      'form1[0].section_13_1-2[0].p3-t68[3]', // Maps to sect13A.1Entry1RankTitle
      ''
    ),
    dutyStation: {
      dutyStation: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].p3-t68[4]', // Maps to sect13A.1Entry1DutyStation
        ''
      ),
      street: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].TextField11[9]', // Maps to sect13A.1Entry1DutyStreet
        ''
      ),
      city: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].TextField11[10]', // Maps to sect13A.1Entry1DutyCity
        ''
      ),
      state: {
        ...createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].School6_State[2]', // Maps to sect13A.1Entry1State
          ''
        ),
        options: []
      },
      zipCode: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].TextField11[11]', // Maps to sect13A.1Entry1DutyZip
        ''
      ),
      country: {
        ...createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].DropDownList20[0]', // Maps to sect13A.1Entry1Country
          ''
        ),
        options: []
      }
    },
    phone: {
      number: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].p3-t68[1]', // Maps to sect13A.1Entry1Phone
        ''
      ),
      extension: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].TextField11[12]', // Maps to sect13A.1Entry1Extension1
        ''
      ),
      isDSN: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].#field[26]', // Maps to DSN checkbox
        false
      ),
      isDay: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].#field[27]', // Maps to Day checkbox
        false
      ),
      isNight: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].#field[28]', // Maps to Night checkbox
        false
      )
    },
    supervisor: {
      name: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].TextField11[0]', // Maps to sect13A.1Entry1SupervisorName
        ''
      ),
      title: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].TextField11[1]', // Maps to sect13A.1Entry1SupervisorRank
        ''
      ),
      email: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].p3-t68[2]', // Maps to sect13A.1Entry1SupervisorEmail
        ''
      ),
      emailUnknown: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].#field[30]', // Maps to email unknown checkbox
        false
      ),
      phone: {
        number: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].p3-t68[0]', // Maps to sect13A.1Entry1SupervisorPhone
          ''
        ),
        extension: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].TextField11[2]', // Maps to supervisor phone extension
          ''
        ),
        isDSN: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].#field[17]', // Maps to DSN checkbox
          false
        ),
        isDay: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].#field[16]', // Maps to Day checkbox
          false
        ),
        isNight: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].#field[15]', // Maps to Night checkbox
          false
        )
      },
      workLocation: {
        street: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].TextField11[3]', // Maps to sect13A.1Entry1SupervisorAddress
          ''
        ),
        city: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].TextField11[4]', // Maps to sect13A.1Entry1SupervisorCity
          ''
        ),
        state: {
          ...createFieldFromReference(
            13,
            'form1[0].section_13_1-2[0].School6_State[0]', // Maps to sect13A.1Entry1State
            ''
          ),
          options: []
        },
        zipCode: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].TextField11[5]', // Maps to sect13A.1Entry1Superviso (zip)
          ''
        ),
        country: {
          ...createFieldFromReference(
            13,
            'form1[0].section_13_1-2[0].DropDownList18[0]', // Maps to supervisor country
            ''
          ),
          options: []
        }
      },
      hasApoFpo: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].TextField11[17]', // Maps to APO/FPO indicator
        false
      ),
      apoFpoAddress: {
        apoFpo: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].TextField11[17]', // Maps to sect13A.1Entry1_b_APO
          ''
        ),
        street: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].TextField11[16]', // Maps to sect13A.1Entry1_b_Street
          ''
        ),
        zipCode: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].TextField11[18]', // Maps to sect13A.1Entry1_b_Zip
          ''
        )
      },
      canContact: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].#field[30]', // Maps to can contact checkbox
        "YES" as "YES" | "NO"
      ),
      contactRestrictions: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].TextField11[13]', // Maps to contact restrictions
        ''
      )
    },
    otherExplanation: createFieldFromReference(
      13,
      'form1[0].section_13_1-2[0].TextField11[13]', // Maps to sect13A.1Entry1OtherExplanation
      ''
    ),
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Creates a default non-federal employment entry (Section 13A.2)
 * Maps to the correct PDF field names from section-13.json
 */
export const createDefaultNonFederalEmploymentEntry = (entryId: string | number): NonFederalEmploymentEntry => {
  return {
    _id: entryId,
    employmentDates: {
      fromDate: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].From_Datefield_Name_2[1]', // Maps to sect13A.2Entry1FromDate
        ''
      ),
      fromEstimated: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].#field[32]', // Maps to estimated checkbox
        false
      ),
      toDate: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].From_Datefield_Name_2[0]', // Maps to sect13A.2Entry1ToDate
        ''
      ),
      toEstimated: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].#field[36]', // Maps to estimated checkbox
        false
      ),
      present: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].#field[37]', // Maps to present checkbox
        false
      )
    },
    employmentStatus: {
      ...createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].RadioButtonList[1]', // Maps to employment status
        'Full-time' as EmploymentStatus
      ),
      options: EMPLOYMENT_STATUS_OPTIONS
    },
    employerName: createFieldFromReference(
      13,
      'form1[0].section13_2-2[0].TextField11[0]', // Maps to sect13A.2Entry1RecentEmployer
      ''
    ),
    positionTitle: createFieldFromReference(
      13,
      'form1[0].section13_2-2[0].TextField11[1]', // Maps to sect13A.2Entry1RecentTitle
      ''
    ),
    employerAddress: {
      street: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].TextField11[2]', // Maps to sect13A.2Entry1Street
        ''
      ),
      city: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].TextField11[3]', // Maps to sect13A.2Entry1City
        ''
      ),
      state: {
        ...createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].School6_State[0]', // Maps to state dropdown
          ''
        ),
        options: []
      },
      zipCode: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].TextField11[4]', // Maps to sect13A.2Entry1Zip
        ''
      ),
      country: {
        ...createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].DropDownList18[0]', // Maps to country dropdown
          ''
        ),
        options: []
      }
    },
    phone: {
      number: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].p3-t68[0]', // Maps to sect13A.2Entry1Phone
        ''
      ),
      extension: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].TextField11[8]', // Maps to sect13A.2Entry1Extension1
        ''
      ),
      isDSN: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].#field[26]', // Maps to DSN checkbox
        false
      ),
      isDay: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].#field[27]', // Maps to Day checkbox
        false
      ),
      isNight: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].#field[28]', // Maps to Night checkbox
        false
      )
    },
    hasAdditionalPeriods: createFieldFromReference(
      13,
      'form1[0].section13_2-2[0].RadioButtonList[2]', // Maps to additional periods question
      false
    ),
    additionalPeriods: [], // Will be populated dynamically
    hasPhysicalWorkAddress: createFieldFromReference(
      13,
      'form1[0].section13_2-2[0].RadioButtonList[3]', // Maps to physical work address question
      false
    ),
    supervisor: {
      name: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].TextField11[9]', // Maps to sect13A.2Entry1_SupervisorName
        ''
      ),
      title: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].TextField11[10]', // Maps to supervisor title
        ''
      ),
      email: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].p3-t68[2]', // Maps to supervisor email
        ''
      ),
      emailUnknown: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].#field[30]', // Maps to email unknown checkbox
        false
      ),
      phone: {
        number: createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].p3-t68[1]', // Maps to supervisor phone
          ''
        ),
        extension: createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].TextField11[11]', // Maps to supervisor extension
          ''
        ),
        isDSN: createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].#field[17]', // Maps to DSN checkbox
          false
        ),
        isDay: createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].#field[16]', // Maps to Day checkbox
          false
        ),
        isNight: createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].#field[15]', // Maps to Night checkbox
          false
        )
      },
      workLocation: {
        street: createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].TextField11[12]', // Maps to supervisor work address
          ''
        ),
        city: createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].TextField11[13]', // Maps to supervisor city
          ''
        ),
        state: {
          ...createFieldFromReference(
            13,
            'form1[0].section13_2-2[0].School6_State[1]', // Maps to supervisor state
            ''
          ),
          options: []
        },
        zipCode: createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].TextField11[14]', // Maps to supervisor zip
          ''
        ),
        country: {
          ...createFieldFromReference(
            13,
            'form1[0].section13_2-2[0].DropDownList19[0]', // Maps to supervisor country
            ''
          ),
          options: []
        }
      },
      hasApoFpo: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].RadioButtonList[4]', // Maps to APO/FPO question
        false
      ),
      canContact: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].#field[30]', // Maps to can contact checkbox
        "YES" as "YES" | "NO"
      ),
      contactRestrictions: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].TextField11[15]', // Maps to contact restrictions
        ''
      )
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Creates a default self-employment entry (Section 13A.3)
 * Maps to the correct PDF field names from section-13.json
 */
export const createDefaultSelfEmploymentEntry = (entryId: string | number): SelfEmploymentEntry => {
  return {
    _id: entryId,
    employmentDates: {
      fromDate: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].From_Datefield_Name_2[1]', // Maps to sect13A.3Entry1Start
        ''
      ),
      fromEstimated: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[32]', // Maps to estimated checkbox
        false
      ),
      toDate: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].From_Datefield_Name_2[0]', // Maps to sect13A.3Entry1ToDate
        ''
      ),
      toEstimated: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[36]', // Maps to estimated checkbox
        false
      ),
      present: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[37]', // Maps to present checkbox
        false
      )
    },
    businessName: createFieldFromReference(
      13,
      'form1[0].section13_3-2[0].p3-t68[3]', // Maps to sect13A.3Entry1Employment
      ''
    ),
    businessType: createFieldFromReference(
      13,
      'form1[0].section13_3-2[0].TextField11[0]', // Maps to business type
      ''
    ),
    positionTitle: createFieldFromReference(
      13,
      'form1[0].section13_3-2[0].p3-t68[4]', // Maps to sect13A.3Entry1PositionTitle
      ''
    ),
    businessAddress: {
      street: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].TextField11[9]', // Maps to sect13A.3Entry1Street
        ''
      ),
      city: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].TextField11[10]', // Maps to sect13A.3Entry1City
        ''
      ),
      state: {
        ...createFieldFromReference(
          13,
          'form1[0].section13_3-2[0].School6_State[0]', // Maps to state dropdown
          ''
        ),
        options: []
      },
      zipCode: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].TextField11[11]', // Maps to sect13A.3Entry1Zip
        ''
      ),
      country: {
        ...createFieldFromReference(
          13,
          'form1[0].section13_3-2[0].DropDownList18[0]', // Maps to country dropdown
          ''
        ),
        options: []
      }
    },
    phone: {
      number: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].p3-t68[1]', // Maps to sect13A.3Entry1Phone
        ''
      ),
      extension: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].TextField11[12]', // Maps to sect13A.3Entry1Ext
        ''
      ),
      isDSN: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[26]', // Maps to DSN checkbox
        false
      ),
      isDay: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[27]', // Maps to Day checkbox
        false
      ),
      isNight: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[28]', // Maps to Night checkbox
        false
      )
    },
    verifierFirstName: createFieldFromReference(
      13,
      'form1[0].section13_3-2[0].TextField11[1]', // Maps to sect13A.3Entry1_FName
      ''
    ),
    verifierLastName: createFieldFromReference(
      13,
      'form1[0].section13_3-2[0].TextField11[2]', // Maps to sect13A.3Entry1_LName
      ''
    ),
    verifierAddress: {
      street: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].TextField11[3]', // Maps to sect13A.3Entry1_Street
        ''
      ),
      city: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].TextField11[4]', // Maps to sect13A.3Entry1_City
        ''
      ),
      state: {
        ...createFieldFromReference(
          13,
          'form1[0].section13_3-2[0].School6_State[1]', // Maps to verifier state
          ''
        ),
        options: []
      },
      zipCode: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].TextField11[5]', // Maps to sect13A.3Entry1_Zip
        ''
      ),
      country: {
        ...createFieldFromReference(
          13,
          'form1[0].section13_3-2[0].DropDownList19[0]', // Maps to verifier country
          ''
        ),
        options: []
      }
    },
    verifierPhone: {
      number: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].p3-t68[2]', // Maps to sect13A.3Entry1_a_Phone
        ''
      ),
      extension: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].TextField11[6]', // Maps to sect13A.3Entry1_a_ext
        ''
      ),
      isDSN: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[17]', // Maps to DSN checkbox
        false
      ),
      isDay: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[16]', // Maps to Day checkbox
        false
      ),
      isNight: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[15]', // Maps to Night checkbox
        false
      )
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Creates a default unemployment entry (Section 13A.4)
 * Maps to the correct PDF field names from section-13.json
 */
export const createDefaultUnemploymentEntry = (entryId: string | number): UnemploymentEntry => {
  return {
    _id: entryId,
    unemploymentDates: {
      fromDate: createFieldFromReference(
        13,
        'form1[0].section13_4[0].From_Datefield_Name_2[1]', // Maps to sect13A.4Entry1_FromDate
        ''
      ),
      fromEstimated: createFieldFromReference(
        13,
        'form1[0].section13_4[0].#field[32]', // Maps to estimated checkbox
        false
      ),
      toDate: createFieldFromReference(
        13,
        'form1[0].section13_4[0].From_Datefield_Name_2[0]', // Maps to sect13A.4Entry1_ToDate
        ''
      ),
      toEstimated: createFieldFromReference(
        13,
        'form1[0].section13_4[0].#field[36]', // Maps to estimated checkbox
        false
      ),
      present: createFieldFromReference(
        13,
        'form1[0].section13_4[0].#field[37]', // Maps to present checkbox
        false
      )
    },
    reference: {
      firstName: createFieldFromReference(
        13,
        'form1[0].section13_4[0].TextField11[1]', // Maps to sect13A.4Entry1_FName
        ''
      ),
      lastName: createFieldFromReference(
        13,
        'form1[0].section13_4[0].TextField11[0]', // Maps to sect13A.4Entry1_LName
        ''
      ),
      address: {
        street: createFieldFromReference(
          13,
          'form1[0].section13_4[0].TextField11[2]', // Maps to sect13A.4Entry1_Street
          ''
        ),
        city: createFieldFromReference(
          13,
          'form1[0].section13_4[0].TextField11[3]', // Maps to sect13A.4Entry1_City
          ''
        ),
        state: {
          ...createFieldFromReference(
            13,
            'form1[0].section13_4[0].School6_State[0]', // Maps to state dropdown
            ''
          ),
          options: []
        },
        zipCode: createFieldFromReference(
          13,
          'form1[0].section13_4[0].TextField11[4]', // Maps to sect13A.4Entry1_Zip
          ''
        ),
        country: {
          ...createFieldFromReference(
            13,
            'form1[0].section13_4[0].DropDownList18[0]', // Maps to country dropdown
            ''
          ),
          options: []
        }
      },
      phone: {
        number: createFieldFromReference(
          13,
          'form1[0].section13_4[0].p3-t68[0]', // Maps to sect13A.4Entry1_Phone
          ''
        ),
        extension: createFieldFromReference(
          13,
          'form1[0].section13_4[0].TextField11[5]', // Maps to sect13A.4Entry1_Ext
          ''
        ),
        isDSN: createFieldFromReference(
          13,
          'form1[0].section13_4[0].#field[26]', // Maps to DSN checkbox
          false
        ),
        isDay: createFieldFromReference(
          13,
          'form1[0].section13_4[0].#field[27]', // Maps to Day checkbox
          false
        ),
        isNight: createFieldFromReference(
          13,
          'form1[0].section13_4[0].#field[28]', // Maps to Night checkbox
          false
        )
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Creates default federal employment information using actual field names from sections-references
 * Maps to the correct PDF field names that exist in section-13.json
 */
export const createDefaultFederalEmploymentInfo = (): FederalEmploymentInfo => ({
  hasFederalEmployment: createFieldFromReference(
    13,
    'form1[0].section13_5[0].RadioButtonList[0]', // Maps to sect13A.5Entry1HasFederalEmployment
    "NO" as "YES" | "NO"
  ),
  securityClearance: createFieldFromReference(
    13,
    'form1[0].section13_5[0].RadioButtonList[1]', // Maps to sect13A.5Entry1SecurityClearance
    "NO" as "YES" | "NO"
  ),
  clearanceLevel: createFieldFromReference(
    13,
    'form1[0].section13_5[0].TextField11[3]', // Maps to sect13A.5Entry1ClearanceLevel - CORRECTED
    ''
  ),
  clearanceDate: createFieldFromReference(
    13,
    'form1[0].section13_5[0].From_Datefield_Name_2[2]', // Maps to sect13A.5Entry1ClearanceDate - CORRECTED
    ''
  ),
  investigationDate: createFieldFromReference(
    13,
    'form1[0].section13_5[0].From_Datefield_Name_2[3]', // Maps to sect13A.5Entry1InvestigationDate - CORRECTED
    ''
  ),
  polygraphDate: createFieldFromReference(
    13,
    'form1[0].section13_5[0].From_Datefield_Name_2[4]', // Maps to sect13A.5Entry1PolygraphDate - CORRECTED
    ''
  ),
  accessToClassified: createFieldFromReference(
    13,
    'form1[0].section13_5[0].#field[22]', // Maps to sect13A.5Entry1AccessToClassified - CORRECTED
    "NO" as "YES" | "NO"
  ),
  classificationLevel: createFieldFromReference(
    13,
    'form1[0].section13_5[0].TextField11[4]', // Maps to sect13A.5Entry1ClassificationLevel - CORRECTED
    ''
  )
});

/**
 * Creates a default Section 13 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
export const createDefaultSection13 = (includeInitialEntry: boolean = false): Section13 => {
  // Validate field count against sections-references
  validateSectionFieldCount(13);

  const defaultSection: Section13 = {
    _id: 13,
    section13: {
      // Main employment questions - CORRECTED MAPPINGS
      hasEmployment: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].RadioButtonList[0]', // Maps to main employment type selection
        "NO" as "YES" | "NO"
      ),
      hasGaps: createFieldFromReference(
        13,
        'form1[0].section13_5[0].RadioButtonList[1]', // Maps to employment gaps question - CORRECTED
        "NO" as "YES" | "NO"
      ),
      gapExplanation: createFieldFromReference(
        13,
        'form1[0].section13_5[0].TextField11[3]', // Maps to gap explanation field - FIXED: TextField11[0] and TextField11[1] do not exist, using TextField11[3] (street1)
        ''
      ),

      // Employment type selection
      employmentType: {
        ...createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].RadioButtonList[0]', // Maps to employment type radio group
          'Other' as EmploymentType
        ),
        options: EMPLOYMENT_TYPE_OPTIONS
      },

      // Subsection structures
      militaryEmployment: {
        entries: [] as MilitaryEmploymentEntry[]
      },
      nonFederalEmployment: {
        entries: [] as NonFederalEmploymentEntry[]
      },
      selfEmployment: {
        entries: [] as SelfEmploymentEntry[]
      },
      unemployment: {
        entries: [] as UnemploymentEntry[]
      },

      // Generic entries (for backward compatibility)
      entries: [] as EmploymentEntry[],

      // Employment record issues (Section 13A.5)
      employmentRecordIssues: {
        wasFired: createFieldFromReference(
          13,
          'form1[0].section13_4[0].RadioButtonList[0]', // Maps to fired question
          false
        ),
        quitAfterBeingTold: createFieldFromReference(
          13,
          'form1[0].section13_4[0].RadioButtonList[1]', // Maps to quit question
          false
        ),
        leftByMutualAgreement: createFieldFromReference(
          13,
          'form1[0].section13_4[0].RadioButtonList[2]', // Maps to mutual agreement question
          false
        )
      },

      // Disciplinary actions (Section 13A.6)
      disciplinaryActions: {
        receivedWrittenWarning: createFieldFromReference(
          13,
          'form1[0].section13_4[0].RadioButtonList[2]', // Maps to written warning question - FIXED: RadioButtonList[3] does not exist, using RadioButtonList[2]
          false
        ),
        warningDates: [],
        warningReasons: []
      },

      // Federal employment information
      federalInfo: createDefaultFederalEmploymentInfo(),

    }
  };

  // Add initial entry if requested
  if (includeInitialEntry) {
    defaultSection.section13.militaryEmployment.entries.push(createDefaultMilitaryEmploymentEntry(Date.now()));
  }

  return defaultSection;
};

// ============================================================================
// UPDATE FUNCTIONS
// ============================================================================

/**
 * Update Section 13 field values following the Field<T> interface pattern
 * Handle nested employment entries and complex data structures
 */
export const updateSection13Field = (
  section13Data: Section13,
  update: Section13FieldUpdate
): Section13 => {
  const { fieldPath, newValue, entryIndex } = update;
  // Deep clone to avoid mutation
  const newData = JSON.parse(JSON.stringify(section13Data));
  
  // Debug logs to help identify field path issues
  console.log(`🔍 SECTION13 Field Update:`, { 
    fieldPath, 
    newValue, 
    entryIndex,
    valueType: typeof newValue 
  });

  // Main section flags
  if (fieldPath === 'section13.hasEmployment' || fieldPath === 'hasEmployment') {
    if (newData.section13?.hasEmployment) {
      newData.section13.hasEmployment.value = newValue;
    }
    return newData;
  }
  
  if (fieldPath === 'section13.hasGaps' || fieldPath === 'hasGaps') {
    if (newData.section13?.hasGaps) {
      newData.section13.hasGaps.value = newValue;
    }
    return newData;
  }
  
  if (fieldPath === 'section13.gapExplanation' || fieldPath === 'gapExplanation') {
    if (newData.section13?.gapExplanation) {
      newData.section13.gapExplanation.value = newValue;
    }
    return newData;
  }
  
  // Handle employment entries
  if (fieldPath.includes('entries') && entryIndex !== undefined) {
    if (entryIndex >= 0 && entryIndex < newData.section13.entries.length) {
      const entry = newData.section13.entries[entryIndex];
      
      // Handle employment dates
      if (fieldPath.includes('employmentDates.fromDate') || fieldPath.includes('fromDate')) {
        entry.employmentDates.fromDate.value = newValue;
      }
      else if (fieldPath.includes('employmentDates.toDate') || fieldPath.includes('toDate')) {
        entry.employmentDates.toDate.value = newValue;
      }
      else if (fieldPath.includes('employmentDates.fromEstimated') || fieldPath.includes('fromEstimated')) {
        entry.employmentDates.fromEstimated.value = Boolean(newValue);
      }
      else if (fieldPath.includes('employmentDates.toEstimated') || fieldPath.includes('toEstimated')) {
        entry.employmentDates.toEstimated.value = Boolean(newValue);
      }
      else if (fieldPath.includes('employmentDates.present') || fieldPath.includes('present')) {
        entry.employmentDates.present.value = Boolean(newValue);
      }
      
      // Handle employer information
      else if (fieldPath.includes('employmentType')) {
        entry.employmentType.value = newValue;
      }
      else if (fieldPath.includes('employmentStatus')) {
        entry.employmentStatus.value = newValue;
      }
      else if (fieldPath.includes('employerName')) {
        entry.employerName.value = newValue;
      }
      else if (fieldPath.includes('positionTitle')) {
        entry.positionTitle.value = newValue;
      }
      else if (fieldPath.includes('positionDescription')) {
        entry.positionDescription.value = newValue;
      }
      else if (fieldPath.includes('businessType')) {
        entry.businessType.value = newValue;
      }
      else if (fieldPath.includes('salary')) {
        entry.salary.value = newValue;
      }
      else if (fieldPath.includes('reasonForLeaving')) {
        entry.reasonForLeaving.value = newValue;
      }
      else if (fieldPath.includes('additionalComments')) {
        entry.additionalComments.value = newValue;
      }
      
      // Handle employer address
      else if (fieldPath.includes('employerAddress.street') || fieldPath.includes('street')) {
        entry.employerAddress.street.value = newValue;
      }
      else if (fieldPath.includes('employerAddress.city') || fieldPath.includes('city')) {
        entry.employerAddress.city.value = newValue;
      }
      else if (fieldPath.includes('employerAddress.state') || fieldPath.includes('state')) {
        entry.employerAddress.state.value = newValue;
      }
      else if (fieldPath.includes('employerAddress.zipCode') || fieldPath.includes('zipCode')) {
        entry.employerAddress.zipCode.value = newValue;
      }
      else if (fieldPath.includes('employerAddress.country') || fieldPath.includes('country')) {
        entry.employerAddress.country.value = newValue;
      }
      
      // Handle supervisor information
      else if (fieldPath.includes('supervisor.name') || fieldPath.endsWith('supervisorName')) {
        entry.supervisor.name.value = newValue;
      }
      else if (fieldPath.includes('supervisor.title') || fieldPath.endsWith('supervisorTitle')) {
        entry.supervisor.title.value = newValue;
      }
      else if (fieldPath.includes('supervisor.email') || fieldPath.endsWith('supervisorEmail')) {
        entry.supervisor.email.value = newValue;
      }
      else if (fieldPath.includes('supervisor.phone') || fieldPath.endsWith('supervisorPhone')) {
        entry.supervisor.phone.value = newValue;
      }
      else if (fieldPath.includes('supervisor.canContact') || fieldPath.includes('canContact')) {
        entry.supervisor.canContact.value = newValue;
      }
      else if (fieldPath.includes('supervisor.contactRestrictions') || fieldPath.includes('contactRestrictions')) {
        entry.supervisor.contactRestrictions.value = newValue;
      }
      
      // Handle direct property access as fallback
      else {
        console.log(`Using fallback for field path: ${fieldPath}`);
        const parts = fieldPath.split('.');
        const lastPart = parts[parts.length - 1];
        
        // Try to find the property by its last segment
        // For example, for "section13.entries.0.employerName", try to update "employerName"
        if (lastPart && lastPart in entry) {
          const prop = entry[lastPart as keyof typeof entry];
          if (prop && typeof prop === 'object' && 'value' in prop) {
            (prop as any).value = newValue;
          }
        }
      }
    }
    return newData;
  }
  
  // Handle federal employment info
  if (fieldPath.includes('federalInfo')) {
    const federal = newData.section13.federalInfo;
    
    if (fieldPath.includes('hasFederalEmployment')) {
      federal.hasFederalEmployment.value = newValue;
    }
    else if (fieldPath.includes('securityClearance')) {
      federal.securityClearance.value = newValue;
    }
    else if (fieldPath.includes('clearanceLevel')) {
      federal.clearanceLevel.value = newValue;
    }
    else if (fieldPath.includes('clearanceDate')) {
      federal.clearanceDate.value = newValue;
    }
    else if (fieldPath.includes('investigationDate')) {
      federal.investigationDate.value = newValue;
    }
    else if (fieldPath.includes('polygraphDate')) {
      federal.polygraphDate.value = newValue;
    }
    else if (fieldPath.includes('accessToClassified')) {
      federal.accessToClassified.value = newValue;
    }
    else if (fieldPath.includes('classificationLevel')) {
      federal.classificationLevel.value = newValue;
    }
  }
  
  // Fallback: try to guess the right field from the field path
  // This is helpful when handling dynamically generated field paths from components
  try {
    const pathParts = fieldPath.split('.');
    const lastPart = pathParts[pathParts.length - 1];
    
    if (lastPart === 'hasEmployment' && newData.section13?.hasEmployment) {
      newData.section13.hasEmployment.value = newValue;
    }
    else if (lastPart === 'hasGaps' && newData.section13?.hasGaps) {
      newData.section13.hasGaps.value = newValue;
    }
    else if (lastPart === 'gapExplanation' && newData.section13?.gapExplanation) {
      newData.section13.gapExplanation.value = newValue;
    }
  } catch (error) {
    console.error(`Section13: Failed to update field at path ${fieldPath}:`, error);
  }
  
  return newData;
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates employment dates
 */
export const validateEmploymentDates = (
  dateRange: EmploymentDateRange,
  context: Section13ValidationContext
): EmploymentValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if from date is provided
  if (!dateRange.fromDate.value) {
    errors.push("Employment start date is required");
  }

  // Check if to date is provided when not currently employed
  if (!dateRange.present.value && !dateRange.toDate.value) {
    errors.push("Employment end date is required when not currently employed");
  }

  // Validate date format and logic
  if (dateRange.fromDate.value && dateRange.toDate.value) {
    const fromDate = new Date(dateRange.fromDate.value);
    const toDate = new Date(dateRange.toDate.value);
    
    if (fromDate > toDate) {
      errors.push("Employment start date cannot be after end date");
    }
    
    if (toDate > context.currentDate) {
      warnings.push("Employment end date is in the future");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};




// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Formats employment date for display
 */
export const formatEmploymentDate = (date: string, format: 'MM/YYYY' | 'MM/DD/YYYY' = 'MM/YYYY'): string => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (format === 'MM/YYYY') {
      return dateObj.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' });
    } else {
      return dateObj.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    }
  } catch {
    return date;
  }
};

/**
 * Calculates employment duration in months
 */
export const calculateEmploymentDuration = (fromDate: string, toDate: string): number => {
  if (!fromDate || !toDate) return 0;

  try {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month
    return diffMonths;
  } catch {
    return 0;
  }
};
