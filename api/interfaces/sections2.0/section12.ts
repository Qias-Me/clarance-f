/**
 * Section 12: Where You Went to School
 *
 * TypeScript interface definitions for SF-86 Section 12 (Where You Went to School) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-12.json.
 * 
 * This section covers educational history including high school, college, vocational schools,
 * and correspondence/online education with 150 fields across pages 14-16.
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';
import type { USState, Country } from './base';
import { createFieldFromReference, validateSectionFieldCount } from '../../utils/sections-references-loader';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Date range information for education attendance
 */
export interface EducationDateRange {
  fromDate: Field<string>;
  fromEstimated: Field<boolean>;
  toDate: Field<string>;
  toEstimated: Field<boolean>;
  present: Field<boolean>;
}

/**
 * School address information
 */
export interface SchoolAddress {
  street: Field<string>;
  city: Field<string>;
  state: FieldWithOptions<USState>;
  zipCode: Field<string>;
  country: FieldWithOptions<Country>;
}

/**
 * School type enumeration based on PDF form options
 */
export type SchoolType = 
  | "High School"
  | "Vocational/Technical/Trade School" 
  | "College/University/Military College"
  | "Correspondence/Distance/Extension/Online School";

/**
 * Degree type enumeration
 */
export type DegreeType =
  | "High School Diploma"
  | "Associate"
  | "Bachelor"
  | "Master"
  | "Doctorate"
  | "Professional"
  | "Certificate"
  | "Other";

/**
 * Individual education entry
 */
export interface EducationEntry {
  _id: string | number;
  attendanceDates: EducationDateRange;
  schoolType: FieldWithOptions<SchoolType>;
  schoolName: Field<string>;
  schoolAddress: SchoolAddress;
  degreeReceived: Field<boolean>;
  degreeType: FieldWithOptions<DegreeType>;
  degreeDate: Field<string>;
  degreeEstimated: Field<boolean>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Education history subsection
 */
export interface EducationHistory {
  hasEducation: Field<"YES" | "NO">;
  hasHighSchool: Field<"YES" | "NO">;
  entries: EducationEntry[];
  entriesCount: number;
}

/**
 * Section 12 main data structure
 */
export interface Section12 {
  _id: number;
  section12: EducationHistory;
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 12 subsection keys for type safety
 */
export type Section12SubsectionKey = 'educationHistory';

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 12 (Where You Went to School)
 * Based on the actual field IDs from section-12.json
 */
export const SECTION12_FIELD_IDS = {
  // Main section radio buttons
  HAS_EDUCATION: "17183", // form1[0].section_12[0].pg10r1[0]
  HAS_HIGH_SCHOOL: "17184", // form1[0].section_12[0].pg10r2[0]
  
  // Entry 1 fields (pattern for multiple entries)
  ENTRY1_FROM_DATE: "10095", // form1[0].section_12[0].From_Datefield_Name_2[0]
  ENTRY1_FROM_ESTIMATED: "10094", // form1[0].section_12[0].#field[3]
  ENTRY1_TO_PRESENT: "10093", // form1[0].section_12[0].sec12_1_1[0]
  ENTRY1_TO_ESTIMATED: "10092", // form1[0].section_12[0].sec12_1_1[1]
  ENTRY1_SCHOOL_TYPE: "17185", // form1[0].section_12[0].pg10r4[0]
  ENTRY1_DEGREE_RECEIVED: "17186", // form1[0].section_12[0].pg2r5[0]
  ENTRY1_SCHOOL_ADDRESS: "10085", // form1[0].section_12[0].TextField11[0]
  ENTRY1_SCHOOL_CITY: "10084", // form1[0].section_12[0].TextField11[1]
  ENTRY1_SCHOOL_STATE: "10083", // form1[0].section_12[0].School6_State[0]
  ENTRY1_SCHOOL_COUNTRY: "10082", // form1[0].section_12[0].DropDownList28[0]
} as const;

/**
 * Field name mappings for Section 12 (Where You Went to School)
 * Full field paths from section-12.json
 */
export const SECTION12_FIELD_NAMES = {
  // Main section radio buttons
  HAS_EDUCATION: "form1[0].section_12[0].pg10r1[0]",
  HAS_HIGH_SCHOOL: "form1[0].section_12[0].pg10r2[0]",
  
  // Entry 1 fields (pattern for multiple entries)
  ENTRY1_FROM_DATE: "form1[0].section_12[0].From_Datefield_Name_2[0]",
  ENTRY1_FROM_ESTIMATED: "form1[0].section_12[0].#field[3]",
  ENTRY1_TO_PRESENT: "form1[0].section_12[0].sec12_1_1[0]",
  ENTRY1_TO_ESTIMATED: "form1[0].section_12[0].sec12_1_1[1]",
  ENTRY1_SCHOOL_TYPE: "form1[0].section_12[0].pg10r4[0]",
  ENTRY1_DEGREE_RECEIVED: "form1[0].section_12[0].pg2r5[0]",
  ENTRY1_SCHOOL_ADDRESS: "form1[0].section_12[0].TextField11[0]",
  ENTRY1_SCHOOL_CITY: "form1[0].section_12[0].TextField11[1]",
  ENTRY1_SCHOOL_STATE: "form1[0].section_12[0].School6_State[0]",
  ENTRY1_SCHOOL_COUNTRY: "form1[0].section_12[0].DropDownList28[0]",
} as const;

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
// HELPER TYPES
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
  "Associate",
  "Bachelor",
  "Master",
  "Doctorate",
  "Professional",
  "Certificate",
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
 * Type for education field updates
 */
export type Section12FieldUpdate = {
  fieldPath: string;
  newValue: any;
  entryIndex?: number;
};

/**
 * Type for education validation results
 */
export type EducationValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  entryErrors?: Record<number, string[]>;
};

/**
 * Type for education entry operations
 */
export type EducationEntryOperation = 
  | 'add'
  | 'remove'
  | 'update'
  | 'move'
  | 'duplicate'
  | 'clear';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default education entry
 */
export const createDefaultEducationEntry = (entryId: string | number): EducationEntry => ({
  _id: entryId,
  attendanceDates: {
    fromDate: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'From Date (Month/Year)',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    fromEstimated: {
      id: "",
      name: "",
      type: 'PDFCheckBox',
      label: 'Estimate',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    toDate: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'To Date (Month/Year)',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    toEstimated: {
      id: "",
      name: "",
      type: 'PDFCheckBox',
      label: 'Estimate',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    present: {
      id: "",
      name: "",
      type: 'PDFCheckBox',
      label: 'Present',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    }
  },
  schoolType: {
    id: "",
    name: "",
    type: 'PDFRadioGroup',
    label: 'School Type',
    value: 'High School' as SchoolType,
    options: SCHOOL_TYPE_OPTIONS,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  schoolName: {
    id: "",
    name: "",
    type: 'PDFTextField',
    label: 'School Name',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  schoolAddress: {
    street: {
      id: "",
      name: "",
      type: 'PDFTextField',
      label: 'Street Address',
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
      type: 'PDFDropdown',
      label: 'State',
      value: '',
      options: [], // Will be populated with USState options
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
    country: {
      id: "",
      name: "",
      type: 'PDFDropdown',
      label: 'Country',
      value: '',
      options: [], // Will be populated with Country options
      rect: { x: 0, y: 0, width: 0, height: 0 }
    }
  },
  degreeReceived: {
    id: "",
    name: "",
    type: 'PDFRadioGroup',
    label: 'Did you receive a degree?',
    value: false,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  degreeType: {
    id: "",
    name: "",
    type: 'PDFDropdown',
    label: 'Degree Type',
    value: 'High School Diploma' as DegreeType,
    options: DEGREE_TYPE_OPTIONS,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  degreeDate: {
    id: "",
    name: "",
    type: 'PDFTextField',
    label: 'Degree Date',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  degreeEstimated: {
    id: "",
    name: "",
    type: 'PDFCheckBox',
    label: 'Estimate',
    value: false,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

/**
 * Creates a default Section 12 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 * 
 * Updated to include a default education entry to improve user experience
 */
export const createDefaultSection12 = (): Section12 => {
  // Validate field count against sections-references
  validateSectionFieldCount(12);

  // Create default entry for better UX - user can remove it if not needed
  const defaultEntry = createDefaultEducationEntry(Date.now());

  return {
    _id: 12,
    section12: {
      hasEducation: createFieldFromReference(
        12,
        'form1[0].section_12[0].pg10r1[0]',
        'YES'  // Default to YES for better UX - most people have education
      ),
      hasHighSchool: createFieldFromReference(
        12,
        'form1[0].section_12[0].pg10r2[0]',
        'NO'
      ),
      entries: [defaultEntry],  // Start with one default entry
      entriesCount: 1
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

  // Handle main section fields
  if (fieldPath === 'section12.hasEducation') {
    newData.section12.hasEducation.value = newValue;
  } else if (fieldPath === 'section12.hasHighSchool') {
    newData.section12.hasHighSchool.value = newValue;
  }
  // Handle entry-specific fields
  else if (fieldPath.startsWith('section12.entries') && entryIndex !== undefined) {
    if (newData.section12.entries[entryIndex]) {
      const entry = { ...newData.section12.entries[entryIndex] };
      
      // Parse the field path to update the correct nested field
      const pathParts = fieldPath.split('.');
      if (pathParts.length >= 3) {
        const fieldName = pathParts[2];
        
        // Handle nested field updates
        if (fieldName.includes('.')) {
          const [parentField, childField] = fieldName.split('.');
          if (entry[parentField as keyof EducationEntry]) {
            (entry[parentField as keyof EducationEntry] as any)[childField].value = newValue;
          }
        } else {
          if (entry[fieldName as keyof EducationEntry]) {
            (entry[fieldName as keyof EducationEntry] as any).value = newValue;
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
 * Validates education date range
 */
export const validateEducationDates = (
  dateRange: EducationDateRange,
  context: Section12ValidationContext
): EducationValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate from date
  if (!dateRange.fromDate.value) {
    errors.push('From date is required');
  } else {
    const fromDate = new Date(dateRange.fromDate.value);
    if (isNaN(fromDate.getTime())) {
      errors.push('From date is not a valid date');
    } else if (fromDate.getFullYear() < EDUCATION_DATE_VALIDATION.MIN_YEAR) {
      errors.push(`From date cannot be before ${EDUCATION_DATE_VALIDATION.MIN_YEAR}`);
    } else if (fromDate > context.currentDate) {
      warnings.push('From date is in the future');
    }
  }

  // Validate to date (if not present)
  if (!dateRange.present.value && !dateRange.toDate.value) {
    errors.push('To date is required when not currently attending');
  } else if (!dateRange.present.value && dateRange.toDate.value) {
    const toDate = new Date(dateRange.toDate.value);
    if (isNaN(toDate.getTime())) {
      errors.push('To date is not a valid date');
    } else if (dateRange.fromDate.value) {
      const fromDate = new Date(dateRange.fromDate.value);
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
 * Validates a complete education entry
 */
export function validateEducationEntry(
  entry: EducationEntry,
  context: Section12ValidationContext
): EducationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate attendance dates
  const dateValidation = validateEducationDates(entry.attendanceDates, context);
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
    if (!entry.schoolAddress.street.value) {
      errors.push('School street address is required');
    }
    if (!entry.schoolAddress.city.value) {
      errors.push('School city is required');
    }
    if (!entry.schoolAddress.country.value) {
      errors.push('School country is required');
    }
    // State is required for US addresses
    if (entry.schoolAddress.country.value === 'United States' as Country && !entry.schoolAddress.state.value) {
      errors.push('State is required for US addresses');
    }
  }

  // Validate degree information
  if (entry.degreeReceived.value && !entry.degreeType.value) {
    errors.push('Degree type is required when degree was received');
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
  if (context.rules.requiresEducationHistory && !section12Data.section12.hasEducation.value) {
    errors.push('Education history information is required');
  }

  // Validate entries if education history is provided
  if (section12Data.section12.hasEducation.value === 'YES') {
    if (section12Data.section12.entries.length === 0) {
      errors.push('At least one education entry is required');
    } else if (section12Data.section12.entries.length > context.rules.maxEducationEntries) {
      errors.push(`Cannot exceed ${context.rules.maxEducationEntries} education entries`);
    }

    // Validate each entry
    section12Data.section12.entries.forEach((entry, index) => {
      const entryValidation = validateEducationEntry(entry, context);
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