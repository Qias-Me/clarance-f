/**
 * Section Constants
 * 
 * Centralized constants for all form sections.
 * Eliminates magic strings and provides consistent values across the application.
 */

/**
 * Section IDs
 */
export const SECTION_IDS = {
  SECTION_1: 'section1',
  SECTION_2: 'section2',
  SECTION_3: 'section3',
  SECTION_4: 'section4',
  SECTION_5: 'section5',
  SECTION_6: 'section6',
  SECTION_7: 'section7',
  SECTION_8: 'section8',
  SECTION_9: 'section9',
  SECTION_10: 'section10',
  SECTION_11: 'section11',
  SECTION_12: 'section12',
  SECTION_13: 'section13',
  SECTION_14: 'section14',
  SECTION_15: 'section15',
  SECTION_16: 'section16',
  SECTION_17: 'section17',
  SECTION_18: 'section18',
  SECTION_19: 'section19',
  SECTION_20: 'section20',
  SECTION_21: 'section21',
  SECTION_22: 'section22',
  SECTION_23: 'section23',
  SECTION_24: 'section24',
  SECTION_25: 'section25',
  SECTION_26: 'section26',
  SECTION_27: 'section27',
  SECTION_28: 'section28',
  SECTION_29: 'section29',
  SECTION_30: 'section30'
} as const;

/**
 * Section Names
 */
export const SECTION_NAMES: Record<string, string> = {
  [SECTION_IDS.SECTION_1]: 'Information About You',
  [SECTION_IDS.SECTION_2]: 'Date of Birth',
  [SECTION_IDS.SECTION_3]: 'Place of Birth',
  [SECTION_IDS.SECTION_4]: 'Social Security Number',
  [SECTION_IDS.SECTION_5]: 'Other Names Used',
  [SECTION_IDS.SECTION_6]: 'Citizenship',
  [SECTION_IDS.SECTION_7]: 'Where You Have Lived',
  [SECTION_IDS.SECTION_8]: 'Where You Went to School',
  [SECTION_IDS.SECTION_9]: 'Your Employment Activities',
  [SECTION_IDS.SECTION_10]: 'People Who Know You Well',
  [SECTION_IDS.SECTION_11]: 'Your Spouse or Partner',
  [SECTION_IDS.SECTION_12]: 'Your Relatives',
  [SECTION_IDS.SECTION_13]: 'Your Employment Record',
  [SECTION_IDS.SECTION_14]: 'Your Military History',
  [SECTION_IDS.SECTION_15]: 'Federal Service',
  [SECTION_IDS.SECTION_16]: 'Clearance Record',
  [SECTION_IDS.SECTION_17]: 'Foreign Activities',
  [SECTION_IDS.SECTION_18]: 'Foreign Business',
  [SECTION_IDS.SECTION_19]: 'Foreign Contacts',
  [SECTION_IDS.SECTION_20]: 'Foreign Travel',
  [SECTION_IDS.SECTION_21]: 'Psychological Health',
  [SECTION_IDS.SECTION_22]: 'Police Record',
  [SECTION_IDS.SECTION_23]: 'Illegal Use of Drugs',
  [SECTION_IDS.SECTION_24]: 'Use of Alcohol',
  [SECTION_IDS.SECTION_25]: 'Investigations',
  [SECTION_IDS.SECTION_26]: 'Financial Record',
  [SECTION_IDS.SECTION_27]: 'Use of IT Systems',
  [SECTION_IDS.SECTION_28]: 'Involvement in Non-Criminal Court Actions',
  [SECTION_IDS.SECTION_29]: 'Association Record',
  [SECTION_IDS.SECTION_30]: 'References'
};

/**
 * Field Types
 */
export const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PHONE: 'phone',
  DATE: 'date',
  SELECT: 'select',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  TEXTAREA: 'textarea',
  NUMBER: 'number',
  SSN: 'ssn',
  ZIP: 'zip',
  CURRENCY: 'currency'
} as const;

/**
 * Validation Messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must not exceed ${max} characters`,
  INVALID_DATE: 'Invalid date',
  FUTURE_DATE: 'Date cannot be in the future',
  PAST_DATE: 'Date cannot be in the past',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PHONE: 'Invalid phone number',
  INVALID_SSN: 'Invalid Social Security Number',
  INVALID_ZIP: 'Invalid ZIP code',
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Must not exceed ${max}`,
  PATTERN_MISMATCH: 'Please match the requested format',
  SELECTION_REQUIRED: 'Please make a selection'
};

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  DISPLAY: 'MM/DD/YYYY',
  ISO: 'YYYY-MM-DD',
  PDF: 'MM-DD-YYYY',
  SHORT: 'MM/YYYY'
} as const;

/**
 * Employment Types
 */
export const EMPLOYMENT_TYPES = {
  FEDERAL_CIVILIAN: 'Federal Civilian Service',
  FEDERAL_CONTRACTOR: 'Federal Contractor',
  MILITARY: 'Military',
  STATE_GOVERNMENT: 'State Government',
  LOCAL_GOVERNMENT: 'Local Government',
  PRIVATE_COMPANY: 'Private Company',
  SELF_EMPLOYED: 'Self-Employed',
  UNEMPLOYMENT: 'Unemployment',
  EDUCATION: 'Education',
  NON_PROFIT: 'Non-Profit Organization',
  FOREIGN_GOVERNMENT: 'Foreign Government',
  CONTRACT_WORK: 'Contract Work',
  CONSULTING: 'Consulting',
  OTHER: 'Other'
} as const;

/**
 * Degree Types
 */
export const DEGREE_TYPES = {
  HIGH_SCHOOL: 'High School Diploma',
  GED: 'GED',
  ASSOCIATES: 'Associate Degree',
  BACHELORS: 'Bachelor Degree',
  MASTERS: 'Master Degree',
  DOCTORATE: 'Doctorate',
  PROFESSIONAL: 'Professional',
  VOCATIONAL: 'Vocational/Technical',
  OTHER: 'Other'
} as const;

/**
 * Relationship Types
 */
export const RELATIONSHIP_TYPES = {
  SPOUSE: 'Spouse',
  PARTNER: 'Partner',
  PARENT: 'Parent',
  SIBLING: 'Sibling',
  CHILD: 'Child',
  FRIEND: 'Friend',
  COLLEAGUE: 'Colleague',
  NEIGHBOR: 'Neighbor',
  OTHER: 'Other'
} as const;

/**
 * Yes/No Options
 */
export const YES_NO_OPTIONS = [
  { value: 'YES', label: 'Yes' },
  { value: 'NO', label: 'No' }
] as const;

/**
 * Common Select Options
 */
export const COMMON_OPTIONS = {
  YES_NO: YES_NO_OPTIONS,
  STATES: [] as const, // Would be populated with actual state list
  COUNTRIES: [] as const, // Would be populated with actual country list
  MONTHS: Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1).padStart(2, '0')
  })),
  DAYS: Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1).padStart(2, '0')
  })),
  YEARS: (startYear: number, endYear: number) => 
    Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
      value: String(startYear + i),
      label: String(startYear + i)
    }))
};

/**
 * Default Values
 */
export const DEFAULT_VALUES = {
  TEXT: '',
  DATE: '',
  SELECT: '',
  CHECKBOX: false,
  RADIO: '',
  NUMBER: 0,
  ARRAY: []
} as const;

/**
 * Maximum Lengths
 */
export const MAX_LENGTHS = {
  NAME: 50,
  ADDRESS_LINE: 100,
  CITY: 50,
  STATE: 2,
  ZIP: 10,
  PHONE: 20,
  EMAIL: 100,
  SSN: 11,
  DESCRIPTION: 500,
  NOTES: 1000
} as const;

/**
 * Minimum Ages
 */
export const AGE_LIMITS = {
  MIN_AGE: 16,
  MAX_AGE: 120,
  EMPLOYMENT_MIN_AGE: 14,
  MILITARY_MIN_AGE: 17
} as const;