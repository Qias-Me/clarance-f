/**
 * Base Types for SF-86 Sections
 * 
 * Shared interfaces and types used across all sections
 */

import type { Field, FieldWithOptions } from '../../formDefinition2.0';

/**
 * Base interface for all sections
 */
export interface BaseSection<T> {
  _id: number;
  sectionNumber: number;
  sectionName: string;
  data: T;
  metadata?: {
    lastModified?: string;
    completionStatus?: 'not_started' | 'in_progress' | 'completed';
    validationStatus?: 'valid' | 'invalid' | 'pending';
  };
}

/**
 * Base section with validation support
 */
export interface BaseSectionWithValidation<T> extends BaseSection<T> {
  validation?: {
    isValid: boolean;
    errors?: ValidationError[];
    warnings?: ValidationWarning[];
  };
}

/**
 * Standard validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  severity?: 'error' | 'critical';
}

/**
 * Standard validation warning
 */
export interface ValidationWarning {
  field: string;
  message: string;
}

/**
 * Person name structure (used in multiple sections)
 */
export interface PersonName {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName?: Field<string>;
  suffix?: FieldWithOptions<string>;
  otherNames?: Field<string>;
}

/**
 * Date range structure (used in employment, education, etc.)
 */
export interface DateRange {
  fromDate: Field<string>;
  fromDateEstimated?: Field<boolean>;
  toDate: Field<string>;
  toDateEstimated?: Field<boolean>;
  present?: Field<boolean>;
}

/**
 * Address structure (used in multiple sections)
 */
export interface Address {
  street: Field<string>;
  street2?: Field<string>;
  city: Field<string>;
  state: FieldWithOptions<string>;
  zipCode: Field<string>;
  country: FieldWithOptions<string>;
  countyOrProvince?: Field<string>;
}

/**
 * Contact information
 */
export interface ContactInfo {
  phone?: PhoneNumber;
  email?: Field<string>;
  address?: Address;
}

/**
 * Phone number structure
 */
export interface PhoneNumber {
  number: Field<string>;
  extension?: Field<string>;
  type?: FieldWithOptions<'home' | 'work' | 'mobile' | 'other'>;
  international?: Field<boolean>;
}

/**
 * Explanation/comment structure for additional information
 */
export interface Explanation {
  hasExplanation: Field<boolean>;
  explanation?: Field<string>;
  attachments?: Attachment[];
}

/**
 * Attachment structure
 */
export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadDate: string;
}

/**
 * Base entry interface for repeatable sections
 */
export interface BaseEntry {
  _id: string;
  _index?: number;
  _isDeleted?: boolean;
}

/**
 * Entry with date range
 */
export interface DatedEntry extends BaseEntry {
  dateRange: DateRange;
}

/**
 * Entry with address
 */
export interface AddressedEntry extends BaseEntry {
  address: Address;
}

/**
 * Standard field update structure
 */
export interface FieldUpdate<T = any> {
  path: string;
  value: T;
  previousValue?: T;
  timestamp?: string;
}

/**
 * Section context state
 */
export interface SectionContextState<T> {
  data: T;
  isLoading: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

/**
 * Section context actions
 */
export interface SectionContextActions<T> {
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  updateFields: (fields: Partial<T>) => void;
  validateSection: () => Promise<ValidationResult>;
  clearErrors: () => void;
  reset: () => void;
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
  fieldErrors?: Record<string, string>;
}

/**
 * Common field validation rules
 */
export interface FieldValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

/**
 * Section configuration
 */
export interface SectionConfig<T> {
  sectionNumber: number;
  sectionName: string;
  sectionTitle: string;
  sectionDescription?: string;
  initialData: T;
  validationRules?: Record<keyof T, FieldValidationRules>;
  dependencies?: number[]; // Other section numbers this depends on
}

/**
 * Field mapping for PDF generation
 */
export interface FieldMapping {
  uiPath: string;
  pdfFieldId: string;
  pdfFieldName?: string;
  transformer?: (value: any) => string;
}

/**
 * Section field mappings
 */
export interface SectionFieldMappings {
  sectionNumber: number;
  mappings: FieldMapping[];
}

/**
 * Common boolean choice field
 */
export type BooleanChoice = Field<'YES' | 'NO'>;

/**
 * Helper type for nested field paths
 */
export type FieldPath<T> = {
  [K in keyof T]: T[K] extends Field<any>
    ? K
    : T[K] extends object
    ? `${K & string}.${FieldPath<T[K]>}`
    : never;
}[keyof T];

/**
 * Helper type for field values
 */
export type FieldValue<T> = T extends Field<infer U> ? U : never;

/**
 * Helper type for extracting all fields from a section
 */
export type ExtractFields<T> = {
  [K in keyof T]: T[K] extends Field<any> ? T[K] : never;
};

/**
 * US States enum
 */
export enum USState {
  AL = 'Alabama',
  AK = 'Alaska',
  AZ = 'Arizona',
  AR = 'Arkansas',
  CA = 'California',
  CO = 'Colorado',
  CT = 'Connecticut',
  DE = 'Delaware',
  DC = 'District of Columbia',
  FL = 'Florida',
  GA = 'Georgia',
  HI = 'Hawaii',
  ID = 'Idaho',
  IL = 'Illinois',
  IN = 'Indiana',
  IA = 'Iowa',
  KS = 'Kansas',
  KY = 'Kentucky',
  LA = 'Louisiana',
  ME = 'Maine',
  MD = 'Maryland',
  MA = 'Massachusetts',
  MI = 'Michigan',
  MN = 'Minnesota',
  MS = 'Mississippi',
  MO = 'Missouri',
  MT = 'Montana',
  NE = 'Nebraska',
  NV = 'Nevada',
  NH = 'New Hampshire',
  NJ = 'New Jersey',
  NM = 'New Mexico',
  NY = 'New York',
  NC = 'North Carolina',
  ND = 'North Dakota',
  OH = 'Ohio',
  OK = 'Oklahoma',
  OR = 'Oregon',
  PA = 'Pennsylvania',
  RI = 'Rhode Island',
  SC = 'South Carolina',
  SD = 'South Dakota',
  TN = 'Tennessee',
  TX = 'Texas',
  UT = 'Utah',
  VT = 'Vermont',
  VA = 'Virginia',
  WA = 'Washington',
  WV = 'West Virginia',
  WI = 'Wisconsin',
  WY = 'Wyoming'
}

/**
 * Common country codes
 */
export enum Country {
  US = 'United States',
  CA = 'Canada',
  MX = 'Mexico',
  GB = 'United Kingdom',
  FR = 'France',
  DE = 'Germany',
  JP = 'Japan',
  CN = 'China',
  IN = 'India',
  // Add more as needed
}