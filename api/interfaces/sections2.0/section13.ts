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
  phone: Field<string>;
  canContact: Field<"YES" | "NO">;
  contactRestrictions: Field<string>;
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
 * Individual employment entry
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
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
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
 * Employment history subsection
 */
export interface EmploymentHistory {
  hasEmployment: Field<"YES" | "NO">;
  hasGaps: Field<"YES" | "NO">;
  gapExplanation: Field<string>;
  entries: EmploymentEntry[];
  entriesCount: number;
  federalInfo: FederalEmploymentInfo;
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

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 13 (Employment Activities)
 * Based on the actual field IDs from section-13.json
 */
export const SECTION13_FIELD_IDS = {
  // Main section radio buttons - these are the actual uniqueIds from section-13.json
  EMPLOYMENT_TYPE_RADIO_1: "section_13_field_form1_0__section_13_1_2_0__RadioButtonList_0_",
  EMPLOYMENT_STATUS_RADIO_1: "section_13_field_form1_0__section_13_1_2_0__RadioButtonList_1_",
  
  // Entry 1 fields - actual field IDs from section-13.json
  ENTRY1_SUPERVISOR_NAME: "section_13_field_form1_0__section_13_1_2_0__TextField11_0_",
  ENTRY1_SUPERVISOR_RANK: "section_13_field_form1_0__section_13_1_2_0__TextField11_1_",
  ENTRY1_FROM_DATE: "section_13_field_form1_0__section_13_1_2_0__From_Datefield_Name_2_0_",
  ENTRY1_TO_DATE: "section_13_field_form1_0__section_13_1_2_0__From_Datefield_Name_2_1_",
  
  // Different employment type sections
  FEDERAL_EMPLOYMENT_RADIO: "section_13_field_form1_0__section13_2_2_0__RadioButtonList_0_",
  SELF_EMPLOYMENT_RADIO: "section_13_field_form1_0__section13_3_2_0__RadioButtonList_0_", 
  UNEMPLOYMENT_RADIO: "section_13_field_form1_0__section13_4_0__RadioButtonList_0_",
  
  // Section 13.5 question - this appears to be the main federal employment question
  FEDERAL_EMPLOYMENT_MAIN: "section_13_field_form1_0__section13_5_0__RadioButtonList_0_",
  FEDERAL_EMPLOYMENT_RESPONSE: "section_13_field_form1_0__section13_5_0__RadioButtonList_1_",
} as const;

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
 * Creates a default employment entry
 */
export const createDefaultEmploymentEntry = (entryId: string | number, index: number = 0): EmploymentEntry => ({
  _id: entryId,
  employmentDates: {
    fromDate: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__From_Datefield_Name_2_0_`,
      name: `form1[0].section_13_1-2[${index}].From_Datefield_Name_2[0]`,
      type: 'PDFTextField',
      label: 'Employment Start Date',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    fromEstimated: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__CheckBox7_0_`,
      name: `form1[0].section_13_1-2[${index}].CheckBox7[0]`,
      type: 'PDFCheckBox',
      label: 'Start Date Estimated',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    toDate: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__From_Datefield_Name_2_1_`,
      name: `form1[0].section_13_1-2[${index}].From_Datefield_Name_2[1]`,
      type: 'PDFTextField',
      label: 'Employment End Date',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    toEstimated: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__CheckBox7_1_`,
      name: `form1[0].section_13_1-2[${index}].CheckBox7[1]`,
      type: 'PDFCheckBox',
      label: 'End Date Estimated',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    present: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__CheckBox22_0_`,
      name: `form1[0].section_13_1-2[${index}].CheckBox22[0]`,
      type: 'PDFCheckBox',
      label: 'Present',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    }
  },
  employmentType: {
    id: `section_13_field_form1_0__section_13_1_2_${index}__RadioButtonList_0_`,
    name: `form1[0].section_13_1-2[${index}].RadioButtonList[0]`,
    type: 'PDFRadioGroup',
    label: 'Employment Type',
    value: 'Private Company' as EmploymentType,
    options: EMPLOYMENT_TYPE_OPTIONS,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  employmentStatus: {
    id: `section_13_field_form1_0__section_13_1_2_${index}__RadioButtonList_1_`,
    name: `form1[0].section_13_1-2[${index}].RadioButtonList[1]`,
    type: 'PDFRadioGroup',
    label: 'Employment Status',
    value: 'Full-time' as EmploymentStatus,
    options: EMPLOYMENT_STATUS_OPTIONS,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  employerName: {
    id: `section_13_field_form1_0__section_13_1_2_${index}__TextField11_2_`,
    name: `form1[0].section_13_1-2[${index}].TextField11[2]`,
    type: 'PDFTextField',
    label: 'Employer Name',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  employerAddress: {
    street: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__TextField11_3_`,
      name: `form1[0].section_13_1-2[${index}].TextField11[3]`,
      type: 'PDFTextField',
      label: 'Street Address',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    city: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__TextField11_4_`,
      name: `form1[0].section_13_1-2[${index}].TextField11[4]`,
      type: 'PDFTextField',
      label: 'City',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    state: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__School6_State_1_`,
      name: `form1[0].section_13_1-2[${index}].School6_State[1]`,
      type: 'PDFDropdown',
      label: 'State',
      value: '',
      options: [],
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    zipCode: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__TextField11_5_`,
      name: `form1[0].section_13_1-2[${index}].TextField11[5]`,
      type: 'PDFTextField',
      label: 'Zip Code',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    country: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__DropDownList13_0_`,
      name: `form1[0].section_13_1-2[${index}].DropDownList13[0]`,
      type: 'PDFDropdown',
      label: 'Country',
      value: '',
      options: [],
      rect: { x: 0, y: 0, width: 0, height: 0 }
    }
  },
  businessType: {
    id: `section_13_field_form1_0__section_13_1_2_${index}__TextField11_6_`,
    name: `form1[0].section_13_1-2[${index}].TextField11[6]`,
    type: 'PDFTextField',
    label: 'Business Type',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  positionTitle: {
    id: `section_13_field_form1_0__section_13_1_2_${index}__TextField11_7_`,
    name: `form1[0].section_13_1-2[${index}].TextField11[7]`,
    type: 'PDFTextField',
    label: 'Position Title',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  positionDescription: {
    id: `section_13_field_form1_0__section_13_1_2_${index}__TextField13_0_`,
    name: `form1[0].section_13_1-2[${index}].TextField13[0]`,
    type: 'PDFTextField',
    label: 'Position Description',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  salary: {
    id: `section_13_field_form1_0__section_13_1_2_${index}__TextField11_8_`,
    name: `form1[0].section_13_1-2[${index}].TextField11[8]`,
    type: 'PDFTextField',
    label: 'Salary',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  supervisor: {
    name: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__TextField11_0_`,
      name: `form1[0].section_13_1-2[${index}].TextField11[0]`,
      type: 'PDFTextField',
      label: 'Supervisor Name',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    title: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__TextField11_1_`,
      name: `form1[0].section_13_1-2[${index}].TextField11[1]`,
      type: 'PDFTextField',
      label: 'Supervisor Title',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    email: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__TextField11_9_`,
      name: `form1[0].section_13_1-2[${index}].TextField11[9]`,
      type: 'PDFTextField',
      label: 'Supervisor Email',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    phone: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__TextField11_10_`,
      name: `form1[0].section_13_1-2[${index}].TextField11[10]`,
      type: 'PDFTextField',
      label: 'Supervisor Phone',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    canContact: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__RadioButtonList_2_`,
      name: `form1[0].section_13_1-2[${index}].RadioButtonList[2]`,
      type: 'PDFRadioGroup',
      label: 'Can Contact',
      value: "YES",
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    contactRestrictions: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__TextField13_1_`,
      name: `form1[0].section_13_1-2[${index}].TextField13[1]`,
      type: 'PDFTextField',
      label: 'Contact Restrictions',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    }
  },
  reasonForLeaving: {
    id: `section_13_field_form1_0__section_13_1_2_${index}__field_29_`,
    name: `form1[0].section_13_1-2[${index}].field[29]`,
    type: 'PDFDropdown',
    label: 'Reason for Leaving',
    value: 'Still Employed' as ReasonForLeaving,
    options: REASON_FOR_LEAVING_OPTIONS,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  additionalComments: {
    id: `section_13_field_form1_0__section_13_1_2_${index}__TextField13_2_`,
    name: `form1[0].section_13_1-2[${index}].TextField13[2]`,
    type: 'PDFTextField',
    label: 'Additional Comments',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  verification: {
    verified: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__CheckBox7_2_`,
      name: `form1[0].section_13_1-2[${index}].CheckBox7[2]`,
      type: 'PDFCheckBox',
      label: 'Verified',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    verificationDate: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__From_Datefield_Name_2_2_`,
      name: `form1[0].section_13_1-2[${index}].From_Datefield_Name_2[2]`,
      type: 'PDFTextField',
      label: 'Verification Date',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    verificationMethod: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__TextField11_11_`,
      name: `form1[0].section_13_1-2[${index}].TextField11[11]`,
      type: 'PDFTextField',
      label: 'Verification Method',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    notes: {
      id: `section_13_field_form1_0__section_13_1_2_${index}__TextField13_3_`,
      name: `form1[0].section_13_1-2[${index}].TextField13[3]`,
      type: 'PDFTextField',
      label: 'Verification Notes',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

/**
 * Creates default federal employment information
 */
export const createDefaultFederalEmploymentInfo = (): FederalEmploymentInfo => ({
  hasFederalEmployment: {
    id: SECTION13_FIELD_IDS.FEDERAL_EMPLOYMENT_MAIN,
    name: SECTION13_FIELD_NAMES.FEDERAL_EMPLOYMENT_MAIN,
    type: 'PDFRadioGroup',
    label: 'Federal Employment',
    value: "NO",
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  securityClearance: {
    id: SECTION13_FIELD_IDS.FEDERAL_EMPLOYMENT_RESPONSE,
    name: SECTION13_FIELD_NAMES.FEDERAL_EMPLOYMENT_RESPONSE,
    type: 'PDFRadioGroup',
    label: 'Security Clearance',
    value: "NO",
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  clearanceLevel: {
    id: "section_13_field_form1_0__section13_5_0__TextField_0_",
    name: "form1[0].section13_5[0].TextField[0]",
    type: 'PDFTextField',
    label: 'Clearance Level',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  clearanceDate: {
    id: "section_13_field_form1_0__section13_5_0__DateField_0_",
    name: "form1[0].section13_5[0].DateField[0]",
    type: 'PDFTextField',
    label: 'Clearance Date',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  investigationDate: {
    id: "section_13_field_form1_0__section13_5_0__DateField_1_",
    name: "form1[0].section13_5[0].DateField[1]",
    type: 'PDFTextField',
    label: 'Investigation Date',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  polygraphDate: {
    id: "section_13_field_form1_0__section13_5_0__DateField_2_",
    name: "form1[0].section13_5[0].DateField[2]",
    type: 'PDFTextField',
    label: 'Polygraph Date',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  accessToClassified: {
    id: "section_13_field_form1_0__section13_5_0__RadioButtonList_2_",
    name: "form1[0].section13_5[0].RadioButtonList[2]",
    type: 'PDFRadioGroup',
    label: 'Access to Classified',
    value: "NO",
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  classificationLevel: {
    id: "section_13_field_form1_0__section13_5_0__TextField_1_",
    name: "form1[0].section13_5[0].TextField[1]",
    type: 'PDFTextField',
    label: 'Classification Level',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  }
});

/**
 * Creates a default Section 13 data structure
 */
export const createDefaultSection13 = (includeInitialEntry: boolean = false): Section13 => {
  const defaultSection: Section13 = {
    _id: 13,
    section13: {
      hasEmployment: {
        id: SECTION13_FIELD_IDS.EMPLOYMENT_TYPE_RADIO_1,
        name: SECTION13_FIELD_NAMES.EMPLOYMENT_TYPE_RADIO_1,
        type: 'PDFRadioGroup',
        label: 'Employment Type Selection',
        value: "NO" as "YES" | "NO",
        rect: { x: 0, y: 0, width: 0, height: 0 }
      },
      hasGaps: {
        id: SECTION13_FIELD_IDS.EMPLOYMENT_STATUS_RADIO_1,
        name: SECTION13_FIELD_NAMES.EMPLOYMENT_STATUS_RADIO_1,
        type: 'PDFRadioGroup',
        label: 'Employment Status Selection',
        value: "NO" as "YES" | "NO",
        rect: { x: 0, y: 0, width: 0, height: 0 }
      },
      gapExplanation: {
        id: SECTION13_FIELD_IDS.ENTRY1_SUPERVISOR_NAME,
        name: SECTION13_FIELD_NAMES.ENTRY1_SUPERVISOR_NAME,
        type: 'PDFTextField',
        label: 'Supervisor Name',
        value: '',
        rect: { x: 0, y: 0, width: 0, height: 0 }
      },
      entries: [] as EmploymentEntry[],
      entriesCount: 0,
      federalInfo: createDefaultFederalEmploymentInfo()
    }
  };
  
  // Add initial entry if requested
  if (includeInitialEntry) {
    defaultSection.section13.entries.push(createDefaultEmploymentEntry(Date.now(), 0));
    defaultSection.section13.entriesCount = 1;
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

/**
 * Validates an employment entry
 */
export function validateEmploymentEntry(
  entry: EmploymentEntry,
  context: Section13ValidationContext
): EmploymentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!entry.employerName.value) {
    errors.push("Employer name is required");
  }

  if (!entry.positionTitle.value) {
    errors.push("Position title is required");
  }

  if (!entry.supervisor.name.value) {
    errors.push("Supervisor name is required");
  }

  if (!entry.supervisor.phone.value) {
    errors.push("Supervisor phone number is required");
  }

  // Validate employment dates
  const dateValidation = validateEmploymentDates(entry.employmentDates, context);
  errors.push(...dateValidation.errors);
  warnings.push(...dateValidation.warnings);

  // Validate address
  if (!entry.employerAddress.street.value) {
    errors.push("Employer address is required");
  }

  if (!entry.employerAddress.city.value) {
    errors.push("Employer city is required");
  }

  // Validate field lengths
  if (entry.employerName.value.length > context.rules.maxEmployerNameLength) {
    errors.push(`Employer name exceeds maximum length of ${context.rules.maxEmployerNameLength} characters`);
  }

  if (entry.positionDescription.value.length > context.rules.maxPositionDescriptionLength) {
    errors.push(`Position description exceeds maximum length of ${context.rules.maxPositionDescriptionLength} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates complete Section 13 data
 */
export function validateSection13(
  section13Data: Section13,
  context: Section13ValidationContext
): EmploymentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const entryErrors: Record<number, string[]> = {};

  // Validate main employment flag
  if (!section13Data.section13.hasEmployment.value) {
    errors.push("Employment history question must be answered");
  }

  // If has employment, validate entries
  if (section13Data.section13.hasEmployment.value === "YES") {
    if (section13Data.section13.entries.length === 0) {
      errors.push("At least one employment entry is required when employment history is indicated");
    }

    // Validate each entry
    section13Data.section13.entries.forEach((entry, index) => {
      const entryValidation = validateEmploymentEntry(entry, context);
      if (!entryValidation.isValid) {
        entryErrors[index] = entryValidation.errors;
        errors.push(`Employment entry ${index + 1}: ${entryValidation.errors.join(', ')}`);
      }
      warnings.push(...entryValidation.warnings);
    });

    // Check for employment gaps if indicated
    if (section13Data.section13.hasGaps.value === "YES" && !section13Data.section13.gapExplanation.value) {
      errors.push("Gap explanation is required when employment gaps are indicated");
    }
  }

  // Validate federal employment info
  if (section13Data.section13.federalInfo.hasFederalEmployment.value === "YES") {
    if (section13Data.section13.federalInfo.securityClearance.value === "YES" && 
        !section13Data.section13.federalInfo.clearanceLevel.value) {
      warnings.push("Security clearance level should be specified when clearance is indicated");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    entryErrors: Object.keys(entryErrors).length > 0 ? entryErrors : undefined
  };
}

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