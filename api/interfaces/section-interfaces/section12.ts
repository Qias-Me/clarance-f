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
  degreeType: FieldWithOptions<DegreeType>;
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
 * UPDATED: Now supports up to 4 entries with 100% field coverage
 */
export interface Section12Data {
  // Global section questions (2 fields)
  hasAttendedSchool: Field<'YES' | 'NO'>;
  hasAttendedSchoolOutsideUS: Field<'YES' | 'NO'>;

  // School entries (148 fields across up to 5 entries - complete coverage achieved)
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
export const SCHOOL_TYPE_OPTIONS = [
  "High School",
  "Vocational/Technical/Trade School",
  "College/University/Military College",
  "Correspondence/Distance/Extension/Online School"
] as const;

/**
 * Degree type options for dropdown
 */
export const DEGREE_TYPE_OPTIONS = [
  "High School Diploma",
  "Associate's",
  "Bachelor's",
  "Master's",
  "Doctorate",
  "Professional Degree (e.g. M D, D V M, J D)",
  "Other"
] as const;

/**
 * Date validation patterns for education
 */
export const EDUCATION_DATE_VALIDATION = {
  MIN_YEAR: 1950,
  MAX_YEAR: new Date().getFullYear() + 10, // Allow future dates for ongoing education
  DATE_REGEX: /^(0[1-9]|1[0-2])\/(\d{4})$/, // MM/YYYY format with capture groups
  FULL_DATE_REGEX: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(\d{4})$/ // MM/DD/YYYY format with capture groups
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

// Import the new field generation system
import {
  generateSection12Field,
  generateSchoolEntryFields,
  generateGlobalFields
} from '../../../app/state/contexts/sections2.0/section12-field-generator';









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
      required: false,
      section: 12,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    dateAwardedEstimate: {
      id: "",
      name: "",
      type: 'PDFCheckBox',
      label: 'Estimate',
      value: false,
      required: false,
      section: 12,
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
 * Creates a default school entry using the new field generation system
 */
export const createDefaultSchoolEntry = (entryId: string | number, entryIndex: number = 0): SchoolEntry => {
  return {
    _id: entryId,

    // Attendance dates (5 fields)
    fromDate: generateSection12Field(`section12.entries[${entryIndex}].fromDate`, ''),
    toDate: generateSection12Field(`section12.entries[${entryIndex}].toDate`, ''),
    fromDateEstimate: generateSection12Field(`section12.entries[${entryIndex}].fromDateEstimate`, false),
    toDateEstimate: generateSection12Field(`section12.entries[${entryIndex}].toDateEstimate`, false),
    isPresent: generateSection12Field(`section12.entries[${entryIndex}].isPresent`, false),

    // School information (7 fields)
    schoolName: generateSection12Field(`section12.entries[${entryIndex}].schoolName`, ''),
    schoolAddress: generateSection12Field(`section12.entries[${entryIndex}].schoolAddress`, ''),
    schoolCity: generateSection12Field(`section12.entries[${entryIndex}].schoolCity`, ''),
    schoolState: generateSection12Field(`section12.entries[${entryIndex}].schoolState`, ''),
    schoolCountry: generateSection12Field(`section12.entries[${entryIndex}].schoolCountry`, ''),
    schoolZipCode: generateSection12Field(`section12.entries[${entryIndex}].schoolZipCode`, ''),

    // School type (1 field)
    schoolType: generateSection12Field(`section12.entries[${entryIndex}].schoolType`, 'High School'),

    // Degree information (2+ fields)
    receivedDegree: generateSection12Field(`section12.entries[${entryIndex}].receivedDegree`, 'NO'),
    degrees: [], // Start with empty degrees array - user can add as needed

    // Contact person (optional - for schools attended in last 3 years)
    contactPerson: createDefaultContactPerson(),

    // Day/Night attendance fields
    dayAttendance: generateSection12Field(`section12.entries[${entryIndex}].dayAttendance`, false),
    nightAttendance: generateSection12Field(`section12.entries[${entryIndex}].nightAttendance`, false),

    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Creates a default Section 12 data structure using the new field generation system
 */
export const createDefaultSection12 = (): Section12 => {
  // Validate field count against sections-references
  validateSectionFieldCount(12);

  // Generate global fields using the new system
  const globalFields = generateGlobalFields();

  return {
    _id: 12,
    section12: {
      // Global section questions (2 fields)
      hasAttendedSchool: globalFields.hasAttendedSchool,
      hasAttendedSchoolOutsideUS: globalFields.hasAttendedSchoolOutsideUS,

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
 * Parse MM/YYYY date format to Date object
 */
const parseEducationDate = (dateString: string): Date | null => {
  if (!dateString) return null;

  // Check if it matches MM/YYYY format
  const mmYyyyMatch = dateString.match(EDUCATION_DATE_VALIDATION.DATE_REGEX);
  if (mmYyyyMatch) {
    // Use regex capture groups: [fullMatch, month, year]
    const [, month, year] = mmYyyyMatch;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Validate month and year ranges
    if (monthNum < 1 || monthNum > 12) return null;
    if (yearNum < EDUCATION_DATE_VALIDATION.MIN_YEAR || yearNum > EDUCATION_DATE_VALIDATION.MAX_YEAR) return null;

    const date = new Date(yearNum, monthNum - 1, 1);
    return isNaN(date.getTime()) ? null : date;
  }

  // Try parsing as full date
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
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
    const fromDate = parseEducationDate(entry.fromDate.value);
    if (!fromDate) {
      errors.push('From date is not a valid date (use MM/YYYY format)');
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
    const toDate = parseEducationDate(entry.toDate.value);
    if (!toDate) {
      errors.push('To date is not a valid date (use MM/YYYY format)');
    } else if (entry.fromDate.value) {
      const fromDate = parseEducationDate(entry.fromDate.value);
      if (fromDate && toDate < fromDate) {
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
 * Check if a school entry is essentially empty (no meaningful data entered)
 */
const isEmptySchoolEntry = (entry: SchoolEntry): boolean => {
  return !entry.schoolName.value?.trim() &&
         !entry.fromDate.value?.trim() &&
         !entry.toDate.value?.trim() &&
         !entry.schoolAddress.value?.trim() &&
         !entry.schoolCity.value?.trim();
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

  // Skip validation for empty entries - they're allowed
  if (isEmptySchoolEntry(entry)) {
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

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