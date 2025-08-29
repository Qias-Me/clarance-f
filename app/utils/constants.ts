// Centralized constants to replace magic strings and numbers

export const VALIDATION_PATTERNS = {
  SSN: /^\d{3}-\d{2}-\d{4}$/,
  PHONE: /^\(\d{3}\) \d{3}-\d{4}$/,
  ZIP: /^\d{5}(-\d{4})?$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
} as const;

export const VALIDATION_MESSAGES = {
  SSN: 'SSN must be in format 123-45-6789',
  PHONE: 'Phone must be in format (123) 456-7890',
  ZIP: 'ZIP code must be in format 12345 or 12345-6789',
  EMAIL: 'Please enter a valid email address',
  REQUIRED: (field: string) => `${field} is required`,
  MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters`,
  MAX_LENGTH: (field: string, max: number) => `${field} must be no more than ${max} characters`,
  INVALID_DATE: 'Please enter a valid date',
  DATE_RANGE: (start: string, end: string) => `Date must be between ${start} and ${end}`,
} as const;

export const FORM_LIMITS = {
  MAX_DUAL_CITIZENSHIP: 2,
  MAX_FOREIGN_PASSPORTS: 5,
  MAX_TRAVEL_COUNTRIES: 10,
  MAX_EMPLOYMENT_HISTORY: 20,
  MAX_RESIDENCES: 10,
  MAX_REFERENCES: 7,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_TEXT_LENGTH: 1000,
  MIN_TEXT_LENGTH: 2,
} as const;

export const DEBOUNCE_DELAYS = {
  TEXT_INPUT: 300,
  NUMBER_INPUT: 300,
  DATE_INPUT: 200,
  SELECT_INPUT: 100,
  CHECKBOX_INPUT: 100,
  ADDRESS_INPUT: 500,
  EMPLOYMENT_HISTORY: 1000,
  VALIDATION: 400,
  SEARCH: 500,
} as const;

export const API_ENDPOINTS = {
  GENERATE_PDF: '/api/generate-pdf',
  VALIDATE_PDF: '/api/validate-pdf',
  PDF_PROXY: '/api/pdf-proxy',
  SAVE_FORM: '/api/save-form',
  LOAD_FORM: '/api/load-form',
} as const;

export const SECTION_NAMES = {
  1: 'Full Name',
  2: 'Other Names Used',
  3: 'Date and Place of Birth',
  4: 'Social Security Number',
  5: 'Identification and Contact Information',
  6: 'U.S. Passport Information',
  7: 'Citizenship',
  8: 'Dual/Multiple Citizenship',
  9: 'Foreign Contacts',
  10: 'Dual/Multiple Citizenship and Foreign Passport',
  11: 'Foreign Activities',
  12: 'Foreign Business, Professional Activities, and Foreign Government Contacts',
  13: 'Employment Activities',
  14: 'Employment Record',
  15: 'Military History',
  16: 'People Who Know You Well',
  17: 'Marital Status',
  18: 'Relatives',
  19: 'Foreign Contacts',
  20: 'Foreign Activities',
  21: 'Psychological and Emotional Health',
  22: 'Police Record',
  23: 'Illegal Use of Drugs and Drug Activity',
  24: 'Use of Alcohol',
  25: 'Investigations and Clearance Record',
  26: 'Financial Record',
  27: 'Use of Information Technology Systems',
  28: 'Involvement in Non-Criminal Court Actions',
  29: 'Association Record',
  30: 'General Remarks',
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  AUTHZ_ERROR: 'AUTHZ_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  INVALID_INPUT: 'INVALID_INPUT',
} as const;

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export const STORAGE_KEYS = {
  FORM_DATA: 'sf86_form_data',
  USER_PREFERENCES: 'sf86_user_preferences',
  SESSION_ID: 'sf86_session_id',
  AUTH_TOKEN: 'sf86_auth_token',
  DRAFT_DATA: 'sf86_draft_data',
  LAST_SAVED: 'sf86_last_saved',
} as const;

export const PERFORMANCE_THRESHOLDS = {
  FCP: { warning: 1800, critical: 3000 },
  LCP: { warning: 2500, critical: 4000 },
  FID: { warning: 100, critical: 300 },
  CLS: { warning: 0.1, critical: 0.25 },
  TTFB: { warning: 800, critical: 1800 },
} as const;

export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  DAY: 24 * 60 * 60 * 1000, // 1 day
} as const;