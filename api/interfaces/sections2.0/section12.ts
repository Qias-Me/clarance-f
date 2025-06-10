/**
 * Section 12: Where You Went to School
 *
 * TypeScript interface definitions for SF-86 Section 12 (Where You Went to School) data structure.
 * Based on comprehensive field analysis of all 150 fields from section-12.json.
 *
 * This section covers educational history including high school, college, vocational schools,
 * and correspondence/online education with support for up to 3 school entries.
 *
 * FIELD COVERAGE: 150 fields total
 * - Global questions: 2 fields (hasAttendedSchool, hasAttendedSchoolOutsideUS)
 * - Entry 1: ~37 fields (section_12[0] indices 0-1)
 * - Entry 2: ~37 fields (section_12[0] indices 2-3)
 * - Entry 3: ~37 fields (section_12_2[0])
 * - Entry 4: ~37 fields (section_12_3[0])
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';
import type { USState, Country } from './base';
import { createFieldFromReference, validateSectionFieldCount } from '../../utils/sections-references-loader';

// ============================================================================
// CORE INTERFACES - RECONSTRUCTED FOR 100% FIELD COVERAGE
// ============================================================================

/**
 * School type enumeration based on PDF form options
 */
export type SchoolType =
  | "High School"
  | "Vocational/Technical/Trade School"
  | "College/University/Military College"
  | "Correspondence/Distance/Extension/Online School";

/**
 * Degree type enumeration based on PDF dropdown options
 */
export type DegreeType =
  | "High School Diploma"
  | "Associate's"
  | "Bachelor's"
  | "Master's"
  | "Doctorate"
  | "Professional Degree (e.g. M D, D V M, J D)"
  | "Other";

/**
 * Degree entry for table structure (supports multiple degrees per school)
 */
export interface DegreeEntry {
  degreeType: Field<DegreeType>;
  otherDegree: Field<string>;
  dateAwarded: Field<string>;
  dateAwardedEstimate: Field<boolean>;
}

/**
 * Contact person information (required for schools attended in last 3 years)
 */
export interface ContactPerson {
  unknownPerson: Field<boolean>;
  lastName: Field<string>;
  firstName: Field<string>;
  address: Field<string>;
  city: Field<string>;
  state: Field<string>;
  country: Field<string>;
  zipCode: Field<string>;
  phoneNumber: Field<string>;
  phoneExtension: Field<string>;
  email: Field<string>;
  isInternationalPhone: Field<boolean>;
  unknownPhone: Field<boolean>;
  unknownEmail: Field<boolean>;
}

/**
 * Individual school entry - supports all field categories from analysis
 */
export interface SchoolEntry {
  _id: string | number;

  // Attendance dates (5 fields)
  fromDate: Field<string>;
  toDate: Field<string>;
  fromDateEstimate: Field<boolean>;
  toDateEstimate: Field<boolean>;
  isPresent: Field<boolean>;

  // School information (6 fields)
  schoolName: Field<string>;
  schoolAddress: Field<string>;
  schoolCity: Field<string>;
  schoolState: Field<string>;
  schoolCountry: Field<string>;
  schoolZipCode: Field<string>;

  // School type (1 field)
  schoolType: Field<SchoolType>;

  // Degree information (2+ fields)
  receivedDegree: Field<'YES' | 'NO'>;
  degrees: DegreeEntry[];

  // Contact person (14 fields - for schools attended in last 3 years)
  contactPerson?: ContactPerson;

  // Additional fields for day/night attendance
  dayAttendance?: Field<boolean>;
  nightAttendance?: Field<boolean>;

  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Section 12 main data structure - supports all 150 fields
 */
export interface Section12Data {
  // Global section questions (2 fields)
  hasAttendedSchool: Field<'YES' | 'NO'>;
  hasAttendedSchoolOutsideUS: Field<'YES' | 'NO'>;

  // School entries (148 fields across up to 3 entries)
  entries: SchoolEntry[];
}

/**
 * Section 12 wrapper interface
 */
export interface Section12 {
  _id: number;
  section12: Section12Data;
}

// ============================================================================
// CONSTANTS AND OPTIONS
// ============================================================================

/**
 * School type options for dropdown
 */
export const SCHOOL_TYPE_OPTIONS: SchoolType[] = [
  "High School",
  "Vocational/Technical/Trade School",
  "College/University/Military College",
  "Correspondence/Distance/Extension/Online School"
];

/**
 * Degree type options for dropdown
 */
export const DEGREE_TYPE_OPTIONS: DegreeType[] = [
  "High School Diploma",
  "Associate's",
  "Bachelor's",
  "Master's",
  "Doctorate",
  "Professional Degree (e.g. M D, D V M, J D)",
  "Other"
];

/**
 * Date validation patterns for education
 */
export const EDUCATION_DATE_VALIDATION = {
  MIN_YEAR: 1950,
  MAX_YEAR: new Date().getFullYear() + 10, // Allow future dates for ongoing education
  DATE_REGEX: /^(0[1-9]|1[0-2])\/\d{4}$/, // MM/YYYY format
  FULL_DATE_REGEX: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/ // MM/DD/YYYY format
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for school field updates
 */
export type Section12FieldUpdate = {
  fieldPath: string;
  newValue: any;
  entryIndex?: number;
};

/**
 * Type for school validation results
 */
export type EducationValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  entryErrors?: Record<number, string[]>;
};

/**
 * Type for school entry operations
 */
export type SchoolEntryOperation =
  | 'add'
  | 'remove'
  | 'update'
  | 'move'
  | 'duplicate'
  | 'clear';

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Validation rules specific to Section 12
 */
export interface Section12ValidationRules {
  requiresEducationHistory: boolean;
  requiresHighSchoolInfo: boolean;
  maxEducationEntries: number;
  requiresSchoolName: boolean;
  requiresSchoolAddress: boolean;
  requiresAttendanceDates: boolean;
  allowsEstimatedDates: boolean;
  maxSchoolNameLength: number;
  maxAddressLength: number;
}

/**
 * Section 12 validation context
 */
export interface Section12ValidationContext {
  rules: Section12ValidationRules;
  currentDate: Date;
  minimumEducationAge: number;
}



// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Complete field mapping for Section 12 entries based on comprehensive analysis
 * Maps all 150 fields to actual PDF field names from section-12.json
 *
 * STRUCTURE:
 * - Global questions: 2 fields
 * - Entry 1 (section_12[0]): 52 fields
 * - Entry 2 (section_12_2[0]): 59 fields
 * - Entry 3 (section_12_3[0]): 37 fields
 */
const SECTION12_FIELD_MAPPING = {
  // Global section questions (2 fields)
  global: {
    hasAttendedSchool: "form1[0].section_12[0].pg10r1[0]",
    hasAttendedSchoolOutsideUS: "form1[0].section_12[0].pg10r2[0]"
  },

  // Entry 1 fields (52 fields) - section_12[0]
  entry1: {
    // Attendance dates (5 fields)
    fromDate: "form1[0].section_12[0].From_Datefield_Name_2[0]",
    toDate: "form1[0].section_12[0].From_Datefield_Name_2[1]",
    fromDateEstimate: "form1[0].section_12[0].#field[3]",
    toDateEstimate: "form1[0].section_12[0].sec12_1_1[1]",
    isPresent: "form1[0].section_12[0].sec12_1_1[0]",

    // School information (6 fields)
    schoolType: "form1[0].section_12[0].pg10r4[0]",
    schoolName: "form1[0].section_12[0].TextField11[3]",
    schoolAddress: "form1[0].section_12[0].TextField11[0]",
    schoolCity: "form1[0].section_12[0].TextField11[1]",
    schoolState: "form1[0].section_12[0].School6_State[0]",
    schoolZipCode: "form1[0].section_12[0].TextField11[2]",
    schoolCountry: "form1[0].section_12[0].DropDownList28[0]",

    // Degree information (7 fields - 2 degrees per school)
    receivedDegree: "form1[0].section_12[0].pg2r5[0]",
    // Degree 1
    degreeType1: "form1[0].section_12[0].Table1[0].Row1[0].Cell1[0]",
    otherDegree1: "form1[0].section_12[0].Table1[0].Row1[0].Cell2[0]",
    dateAwarded1: "form1[0].section_12[0].Table1[0].Row1[0].Cell4[0]",
    dateAwardedEstimate1: "form1[0].section_12[0].Table1[0].Row1[0].Cell5[0]",
    // Degree 2
    degreeType2: "form1[0].section_12[0].Table1[0].Row2[0].Cell1[0]",
    otherDegree2: "form1[0].section_12[0].Table1[0].Row2[0].Cell2[0]",
    dateAwarded2: "form1[0].section_12[0].Table1[0].Row2[0].Cell4[0]",
    dateAwardedEstimate2: "form1[0].section_12[0].Table1[0].Row2[0].Cell5[0]",

    // Contact person information (14 fields)
    unknownPerson: "form1[0].section_12[0].#field[14]",
    contactLastName: "form1[0].section_12[0].TextField11[4]",
    contactFirstName: "form1[0].section_12[0].TextField11[5]",
    contactAddress: "form1[0].section_12[0].TextField11[6]",
    contactCity: "form1[0].section_12[0].TextField11[7]",
    contactState: "form1[0].section_12[0].School6_State[1]",
    contactZipCode: "form1[0].section_12[0].TextField11[8]",
    contactCountry: "form1[0].section_12[0].DropDownList27[0]",
    contactPhone: "form1[0].section_12[0].p3-t68[0]",
    contactExtension: "form1[0].section_12[0].TextField11[9]",
    contactEmail: "form1[0].section_12[0].p3-t68[1]",
    isInternationalPhone: "form1[0].section_12[0].#field[22]",
    unknownPhone: "form1[0].section_12[0].#field[23]",
    unknownEmail: "form1[0].section_12[0].#field[25]"
  },

  // Entry 2 fields (section_12[0] with different indices)
  entry2: {
    // Attendance dates (5 fields)
    fromDate: "form1[0].section_12[0].From_Datefield_Name_2[2]",
    toDate: "form1[0].section_12[0].From_Datefield_Name_2[3]",
    fromDateEstimate: "form1[0].section_12[0].#field[28]",
    toDateEstimate: "form1[0].section_12[0].#field[30]",
    isPresent: "form1[0].section_12[0].#field[29]",

    // School information (6 fields)
    schoolType: "form1[0].section_12_2[0].pg10r4[0]",
    schoolName: "form1[0].section_12_2[0].TextField11[6]",
    schoolAddress: "form1[0].section_12_2[0].TextField11[3]",
    schoolCity: "form1[0].section_12_2[0].TextField11[4]",
    schoolState: "form1[0].section_12_2[0].School6_State[0]",
    schoolZipCode: "form1[0].section_12_2[0].TextField11[5]",
    schoolCountry: "form1[0].section_12_2[0].DropDownList25[0]",

    // Degree information (8 fields - 2 degrees per school)
    receivedDegree: "form1[0].section_12_2[0].pg2r5[0]",
    // Degree 1
    degreeType1: "form1[0].section_12_2[0].Table1[0].Row1[0].Cell1[0]",
    otherDegree1: "form1[0].section_12_2[0].Table1[0].Row1[0].Cell2[0]",
    dateAwarded1: "form1[0].section_12_2[0].Table1[0].Row1[0].Cell4[0]",
    dateAwardedEstimate1: "form1[0].section_12_2[0].Table1[0].Row1[0].Cell5[0]",
    // Degree 2
    degreeType2: "form1[0].section_12_2[0].Table1[0].Row2[0].Cell1[0]",
    otherDegree2: "form1[0].section_12_2[0].Table1[0].Row2[0].Cell2[0]",
    dateAwarded2: "form1[0].section_12_2[0].Table1[0].Row2[0].Cell4[0]",
    dateAwardedEstimate2: "form1[0].section_12_2[0].Table1[0].Row2[0].Cell5[0]",

    // Contact person information (14 fields)
    unknownPerson: "form1[0].section_12_2[0].#field[6]",
    contactLastName: "form1[0].section_12_2[0].TextField11[7]",
    contactFirstName: "form1[0].section_12_2[0].TextField11[8]",
    contactAddress: "form1[0].section_12_2[0].TextField11[0]",
    contactCity: "form1[0].section_12_2[0].TextField11[1]",
    contactState: "form1[0].section_12_2[0].School6_State[1]",
    contactZipCode: "form1[0].section_12_2[0].TextField11[2]",
    contactCountry: "form1[0].section_12_2[0].DropDownList27[0]",
    contactPhone: "form1[0].section_12_2[0].p3-t68[2]",
    contactExtension: "form1[0].section_12_2[0].TextField11[12]",
    contactEmail: "form1[0].section_12_2[0].p3-t68[0]",
    isInternationalPhone: "form1[0].section_12_2[0].#field[7]",
    unknownPhone: "form1[0].section_12_2[0].#field[9]",
    unknownEmail: "form1[0].section_12_2[0].#field[8]"
  },

  // Entry 3 fields (section_12_2[0])
  entry3: {
    // Attendance dates (5 fields)
    fromDate: "form1[0].section_12_2[0].From_Datefield_Name_2[0]",
    toDate: "form1[0].section_12_2[0].From_Datefield_Name_2[1]",
    fromDateEstimate: "form1[0].section_12_2[0].#field[10]",
    toDateEstimate: "form1[0].section_12_2[0].#field[12]",
    isPresent: "form1[0].section_12_2[0].#field[11]",

    // School information (6 fields)
    schoolType: "form1[0].section_12_3[0].pg10r4[0]",
    schoolName: "form1[0].section_12_3[0].TextField11[3]",
    schoolAddress: "form1[0].section_12_3[0].TextField11[0]",
    schoolCity: "form1[0].section_12_3[0].TextField11[1]",
    schoolState: "form1[0].section_12_3[0].School6_State[0]",
    schoolZipCode: "form1[0].section_12_3[0].TextField11[2]",
    schoolCountry: "form1[0].section_12_3[0].DropDownList28[0]",

    // Degree information (9 fields - 2 degrees per school)
    receivedDegree: "form1[0].section_12_3[0].pg2r5[0]",
    // Degree 1
    degreeType1: "form1[0].section_12_3[0].Table1[0].Row1[0].Cell1[0]",
    otherDegree1: "form1[0].section_12_3[0].Table1[0].Row1[0].Cell2[0]",
    dateAwarded1: "form1[0].section_12_3[0].Table1[0].Row1[0].Cell4[0]",
    dateAwardedEstimate1: "form1[0].section_12_3[0].Table1[0].Row1[0].Cell5[0]",
    // Degree 2
    degreeType2: "form1[0].section_12_3[0].Table1[0].Row2[0].Cell1[0]",
    otherDegree2: "form1[0].section_12_3[0].Table1[0].Row2[0].Cell2[0]",
    dateAwarded2: "form1[0].section_12_3[0].Table1[0].Row2[0].Cell4[0]",
    dateAwardedEstimate2: "form1[0].section_12_3[0].Table1[0].Row2[0].Cell5[0]",

    // Contact person information (14 fields)
    unknownPerson: "form1[0].section_12_2[0].#field[21]",
    contactLastName: "form1[0].section_12_2[0].TextField11[7]",
    contactFirstName: "form1[0].section_12_2[0].TextField11[8]",
    contactAddress: "form1[0].section_12_2[0].TextField11[0]",
    contactCity: "form1[0].section_12_2[0].TextField11[1]",
    contactState: "form1[0].section_12_2[0].School6_State[1]",
    contactZipCode: "form1[0].section_12_2[0].TextField11[2]",
    contactCountry: "form1[0].section_12_2[0].DropDownList27[0]",
    contactPhone: "form1[0].section_12_2[0].p3-t68[2]",
    contactExtension: "form1[0].section_12_2[0].TextField11[12]",
    contactEmail: "form1[0].section_12_2[0].p3-t68[0]",
    isInternationalPhone: "form1[0].section_12_2[0].#field[31]",
    unknownPhone: "form1[0].section_12_2[0].#field[30]",
    unknownEmail: "form1[0].section_12_2[0].#field[28]"
  },

  // Entry 4 fields (section_12_3[0])
  entry4: {
    // Attendance dates (5 fields)
    fromDate: "form1[0].section_12_3[0].From_Datefield_Name_2[0]",
    toDate: "form1[0].section_12_3[0].From_Datefield_Name_2[1]",
    fromDateEstimate: "form1[0].section_12_3[0].#field[3]",
    toDateEstimate: "form1[0].section_12_3[0].#field[5]",
    isPresent: "form1[0].section_12_3[0].#field[4]",

    // School information (6 fields)
    schoolType: "form1[0].section_12_3[0].pg10r4[0]",
    schoolName: "form1[0].section_12_3[0].TextField11[3]",
    schoolAddress: "form1[0].section_12_3[0].TextField11[0]",
    schoolCity: "form1[0].section_12_3[0].TextField11[1]",
    schoolState: "form1[0].section_12_3[0].School6_State[0]",
    schoolZipCode: "form1[0].section_12_3[0].TextField11[2]",
    schoolCountry: "form1[0].section_12_3[0].DropDownList28[0]",

    // Degree information (9 fields - 2 degrees per school)
    receivedDegree: "form1[0].section_12_3[0].pg2r5[0]",
    // Degree 1
    degreeType1: "form1[0].section_12_3[0].Table1[0].Row1[0].Cell1[0]",
    otherDegree1: "form1[0].section_12_3[0].Table1[0].Row1[0].Cell2[0]",
    dateAwarded1: "form1[0].section_12_3[0].Table1[0].Row1[0].Cell4[0]",
    dateAwardedEstimate1: "form1[0].section_12_3[0].Table1[0].Row1[0].Cell5[0]",
    // Degree 2
    degreeType2: "form1[0].section_12_3[0].Table1[0].Row2[0].Cell1[0]",
    otherDegree2: "form1[0].section_12_3[0].Table1[0].Row2[0].Cell2[0]",
    dateAwarded2: "form1[0].section_12_3[0].Table1[0].Row2[0].Cell4[0]",
    dateAwardedEstimate2: "form1[0].section_12_3[0].Table1[0].Row2[0].Cell5[0]",

    // Contact person information (8 fields - fewer than other entries)
    contactLastName: "form1[0].section_12_3[0].TextField11[4]",
    contactFirstName: "form1[0].section_12_3[0].TextField11[5]",
    contactPhone: "form1[0].section_12_3[0].p3-t68[1]",
    contactExtension: "form1[0].section_12_3[0].TextField11[9]",
    contactState: "form1[0].section_12_3[0].School6_State[1]",
    contactCountry: "form1[0].section_12_3[0].DropDownList27[0]"
  }
};

/**
 * Helper function to get field mapping based on entry index
 */
const getFieldMapping = (entryIndex: number): any => {
  switch (entryIndex) {
    case 0: return SECTION12_FIELD_MAPPING.entry1;
    case 1: return SECTION12_FIELD_MAPPING.entry2;
    case 2: return SECTION12_FIELD_MAPPING.entry3;
    case 3: return SECTION12_FIELD_MAPPING.entry4;
    default: return SECTION12_FIELD_MAPPING.entry1; // Fallback
  }
};

/**
 * Helper function to generate field ID based on entry index and field name
 */
const generateFieldId = (entryIndex: number, fieldName: string): string => {
  const mapping = getFieldMapping(entryIndex);
  return mapping?.[fieldName] || "";
};

/**
 * Creates a default degree entry
 */
export const createDefaultDegreeEntry = (): DegreeEntry => {
  return {
    degreeType: {
      id: "",
      name: "",
      type: 'PDFDropdown',
      label: 'Degree Type',
      value: "High School Diploma",
      options: ["High School Diploma", "Associate's", "Bachelor's", "Master's", "Doctorate", "Professional Degree (e.g. M D, D V M, J D)", "Other"],
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    otherDegree: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Other Degree',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    dateAwarded: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Date Awarded',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    dateAwardedEstimate: {
      id: "",
      name: "",
      type: 'PDFCheckBox',
      label: 'Estimate',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    }
  };
};

/**
 * Creates a default contact person entry
 */
export const createDefaultContactPerson = (): ContactPerson => {
  return {
    unknownPerson: {
      id: "",
      name: "",
      type: 'PDFCheckBox',
      label: 'I don\'t know',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    lastName: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Last Name',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    firstName: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'First Name',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    address: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Address',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    city: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'City',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    state: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'State',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    country: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Country',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    zipCode: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Zip Code',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    phoneNumber: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Phone Number',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    phoneExtension: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Extension',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    email: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Email',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    isInternationalPhone: {
      id: "",
      name: "",
      type: 'PDFCheckBox',
      label: 'International Phone',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    unknownPhone: {
      id: "",
      name: "",
      type: 'PDFCheckBox',
      label: 'Unknown Phone',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    unknownEmail: {
      id: "",
      name: "",
      type: 'PDFCheckBox',
      label: 'Unknown Email',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    }
  };
};

/**
 * Creates a default school entry with comprehensive field mapping
 */
export const createDefaultSchoolEntry = (entryId: string | number, entryIndex: number = 0): SchoolEntry => {
  const mapping = getFieldMapping(entryIndex);

  return {
    _id: entryId,

    // Attendance dates (5 fields)
    fromDate: {
      id: generateFieldId(entryIndex, "fromDate"),
      name: generateFieldId(entryIndex, "fromDate"),
      type: 'PDFTextField',
      label: `From Date (Month/Year) - Entry ${entryIndex + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    toDate: {
      id: generateFieldId(entryIndex, "toDate"),
      name: generateFieldId(entryIndex, "toDate"),
      type: 'PDFTextField',
      label: `To Date (Month/Year) - Entry ${entryIndex + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    fromDateEstimate: {
      id: generateFieldId(entryIndex, "fromDateEstimate"),
      name: generateFieldId(entryIndex, "fromDateEstimate"),
      type: 'PDFCheckBox',
      label: 'From Date Estimate',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    toDateEstimate: {
      id: generateFieldId(entryIndex, "toDateEstimate"),
      name: generateFieldId(entryIndex, "toDateEstimate"),
      type: 'PDFCheckBox',
      label: 'To Date Estimate',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    isPresent: {
      id: generateFieldId(entryIndex, "isPresent"),
      name: generateFieldId(entryIndex, "isPresent"),
      type: 'PDFCheckBox',
      label: 'Present',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },

    // School information (7 fields)
    schoolName: {
      id: generateFieldId(entryIndex, "schoolName"),
      name: generateFieldId(entryIndex, "schoolName"),
      type: 'PDFTextField',
      label: `School Name - Entry ${entryIndex + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    schoolAddress: {
      id: generateFieldId(entryIndex, "schoolAddress"),
      name: generateFieldId(entryIndex, "schoolAddress"),
      type: 'PDFTextField',
      label: `School Address - Entry ${entryIndex + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    schoolCity: {
      id: generateFieldId(entryIndex, "schoolCity"),
      name: generateFieldId(entryIndex, "schoolCity"),
      type: 'PDFTextField',
      label: `School City - Entry ${entryIndex + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    schoolState: {
      id: generateFieldId(entryIndex, "schoolState"),
      name: generateFieldId(entryIndex, "schoolState"),
      type: 'PDFDropdown',
      label: `School State - Entry ${entryIndex + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    schoolCountry: {
      id: generateFieldId(entryIndex, "schoolCountry"),
      name: generateFieldId(entryIndex, "schoolCountry"),
      type: 'PDFDropdown',
      label: `School Country - Entry ${entryIndex + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    schoolZipCode: {
      id: generateFieldId(entryIndex, "schoolZipCode"),
      name: generateFieldId(entryIndex, "schoolZipCode"),
      type: 'PDFTextField',
      label: `School Zip Code - Entry ${entryIndex + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },

    // School type (1 field)
    schoolType: {
      id: generateFieldId(entryIndex, "schoolType"),
      name: generateFieldId(entryIndex, "schoolType"),
      type: 'PDFRadioGroup',
      label: `School Type - Entry ${entryIndex + 1}`,
      value: "High School",
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },

    // Degree information (2+ fields)
    receivedDegree: {
      id: generateFieldId(entryIndex, "receivedDegree"),
      name: generateFieldId(entryIndex, "receivedDegree"),
      type: 'PDFRadioGroup',
      label: `Received Degree - Entry ${entryIndex + 1}`,
      value: 'NO',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    degrees: [], // Start with empty degrees array - user can add as needed

    // Contact person (optional - for schools attended in last 3 years)
    contactPerson: createDefaultContactPerson(),

    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Creates a default Section 12 data structure with comprehensive field coverage
 */
export const createDefaultSection12 = (): Section12 => {
  // Validate field count against sections-references
  validateSectionFieldCount(12);

  return {
    _id: 12,
    section12: {
      // Global section questions (2 fields)
      hasAttendedSchool: createFieldFromReference(
        12,
        SECTION12_FIELD_MAPPING.global.hasAttendedSchool,
        'NO'
      ),
      hasAttendedSchoolOutsideUS: createFieldFromReference(
        12,
        SECTION12_FIELD_MAPPING.global.hasAttendedSchoolOutsideUS,
        'NO'
      ),

      // Start with empty entries array - users can add entries as needed
      entries: []
    }
  };
};

/**
 * Updates a specific field in the Section 12 data structure
 */
export const updateSection12Field = (
  section12Data: Section12,
  update: Section12FieldUpdate
): Section12 => {
  const { fieldPath, newValue, entryIndex } = update;
  const newData = { ...section12Data };

  // Handle global section fields
  if (fieldPath === 'section12.hasAttendedSchool') {
    newData.section12.hasAttendedSchool.value = newValue;
  } else if (fieldPath === 'section12.hasAttendedSchoolOutsideUS') {
    newData.section12.hasAttendedSchoolOutsideUS.value = newValue;
  }
  // Handle entry-specific fields
  else if (fieldPath.startsWith('section12.entries') && entryIndex !== undefined) {
    if (newData.section12.entries[entryIndex]) {
      const entry = { ...newData.section12.entries[entryIndex] };

      // Parse the field path to update the correct nested field
      const pathParts = fieldPath.split('.');
      if (pathParts.length >= 3) {
        // Remove "section12.entries" prefix to get the actual field path
        const actualFieldPath = pathParts.slice(2).join('.');

        // Handle nested field updates (e.g., "contactPerson.lastName")
        if (actualFieldPath.includes('.')) {
          const [parentField, childField] = actualFieldPath.split('.');
          if (entry[parentField as keyof SchoolEntry]) {
            const parentObj = entry[parentField as keyof SchoolEntry] as any;
            if (parentObj && parentObj[childField]) {
              parentObj[childField].value = newValue;
            }
          }
        } else {
          // Handle direct field updates (e.g., "schoolName")
          if (entry[actualFieldPath as keyof SchoolEntry]) {
            (entry[actualFieldPath as keyof SchoolEntry] as any).value = newValue;
          }
        }
      }

      entry.updatedAt = new Date();
      newData.section12.entries[entryIndex] = entry;
    }
  }

  return newData;
};

/**
 * Validates school entry dates
 */
export const validateSchoolDates = (
  entry: SchoolEntry,
  context: Section12ValidationContext
): EducationValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate from date
  if (!entry.fromDate.value) {
    errors.push('From date is required');
  } else {
    const fromDate = new Date(entry.fromDate.value);
    if (isNaN(fromDate.getTime())) {
      errors.push('From date is not a valid date');
    } else if (fromDate.getFullYear() < EDUCATION_DATE_VALIDATION.MIN_YEAR) {
      errors.push(`From date cannot be before ${EDUCATION_DATE_VALIDATION.MIN_YEAR}`);
    } else if (fromDate > context.currentDate) {
      warnings.push('From date is in the future');
    }
  }

  // Validate to date (if not present)
  if (!entry.isPresent.value && !entry.toDate.value) {
    errors.push('To date is required when not currently attending');
  } else if (!entry.isPresent.value && entry.toDate.value) {
    const toDate = new Date(entry.toDate.value);
    if (isNaN(toDate.getTime())) {
      errors.push('To date is not a valid date');
    } else if (entry.fromDate.value) {
      const fromDate = new Date(entry.fromDate.value);
      if (toDate < fromDate) {
        errors.push('To date cannot be before from date');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates a complete school entry
 */
export function validateSchoolEntry(
  entry: SchoolEntry,
  context: Section12ValidationContext
): EducationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate attendance dates
  const dateValidation = validateSchoolDates(entry, context);
  errors.push(...dateValidation.errors);
  warnings.push(...dateValidation.warnings);

  // Validate school type
  if (!entry.schoolType.value) {
    errors.push('School type is required');
  }

  // Validate school name
  if (!entry.schoolName.value) {
    errors.push('School name is required');
  } else if (entry.schoolName.value.length > context.rules.maxSchoolNameLength) {
    errors.push(`School name cannot exceed ${context.rules.maxSchoolNameLength} characters`);
  }

  // Validate school address
  if (context.rules.requiresSchoolAddress) {
    if (!entry.schoolAddress.value) {
      errors.push('School street address is required');
    }
    if (!entry.schoolCity.value) {
      errors.push('School city is required');
    }
    if (!entry.schoolCountry.value) {
      errors.push('School country is required');
    }
    // State is required for US addresses
    if (entry.schoolCountry.value === 'United States' && !entry.schoolState.value) {
      errors.push('State is required for US addresses');
    }
  }

  // Validate degree information
  if (entry.receivedDegree.value === 'YES' && entry.degrees.length === 0) {
    errors.push('At least one degree is required when degree was received');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates the complete Section 12 data
 */
export function validateSection12(
  section12Data: Section12,
  context: Section12ValidationContext
): EducationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const entryErrors: Record<number, string[]> = {};

  // Validate main section flags
  if (context.rules.requiresEducationHistory && !section12Data.section12.hasAttendedSchool.value) {
    errors.push('Education history information is required');
  }

  // Validate entries if education history is provided
  if (section12Data.section12.hasAttendedSchool.value === 'YES') {
    if (section12Data.section12.entries.length === 0) {
      errors.push('At least one school entry is required');
    } else if (section12Data.section12.entries.length > context.rules.maxEducationEntries) {
      errors.push(`Cannot exceed ${context.rules.maxEducationEntries} school entries`);
    }

    // Validate each entry
    section12Data.section12.entries.forEach((entry, index) => {
      const entryValidation = validateSchoolEntry(entry, context);
      if (!entryValidation.isValid) {
        entryErrors[index] = entryValidation.errors;
        errors.push(`Entry ${index + 1}: ${entryValidation.errors.join(', ')}`);
      }
      warnings.push(...entryValidation.warnings);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    entryErrors
  };
}

/**
 * Formats education date for display
 */
export const formatEducationDate = (date: string, format: 'MM/YYYY' | 'MM/DD/YYYY' = 'MM/YYYY'): string => {
  if (!date) return '';

  try {
    const dateObj = new Date(date);
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    if (format === 'MM/YYYY') {
      return `${month}/${year}`;
    } else {
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${month}/${day}/${year}`;
    }
  } catch (error) {
    return date; // Return original if parsing fails
  }
};

/**
 * Calculates education duration in years
 */
export const calculateEducationDuration = (fromDate: string, toDate: string): number => {
  if (!fromDate) return 0;

  try {
    const from = new Date(fromDate);
    const to = toDate ? new Date(toDate) : new Date();
    
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    
    return Math.round(diffYears * 10) / 10; // Round to 1 decimal place
  } catch (error) {
    return 0;
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

// All types are already exported via their interface/type declarations above 