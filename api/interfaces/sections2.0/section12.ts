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
 * School types structure for multiple checkbox selections (matches official SF-86 form)
 */
export interface SchoolTypes {
  highSchool: Field<boolean>;
  vocationalTechnicalTrade: Field<boolean>;
  collegeUniversityMilitary: Field<boolean>;
  correspondenceDistanceOnline: Field<boolean>;
}

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

  // School types (4 fields - multiple checkboxes as per official SF-86 form)
  schoolTypes: SchoolTypes;

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
 * UPDATED: Now supports up to 5 entries with 100% field coverage
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
// HELPER FUNCTIONS - MOVED TO CONTEXT LAYER
// ============================================================================

// Import the new field generation system
import {
  generateSection12Field,
  generateSchoolEntryFields,
  generateGlobalFields
} from '../../../app/state/contexts/sections2.0/section12-field-generator';

// NOTE: All helper functions have been moved to the context layer
// (app/state/contexts/sections2.0/section12.tsx) to follow proper
// architectural patterns where:
// - Interface layer: Type definitions only
// - Context layer: State management and business logic
// - Component layer: UI rendering and user interaction















// ============================================================================
// EXPORTS
// ============================================================================

// All types are already exported via their interface/type declarations above
// All helper functions have been moved to the context layer for proper architecture