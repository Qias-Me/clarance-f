/**
 * Section 13 Constants
 * 
 * Constants for Section 13 (Employment Activities) configuration
 */

export const TOTAL_SECTION_13_FIELDS = 1086;

export const FIELD_COUNTS_BY_TYPE = {
  text: 450,
  date: 120,
  select: 85,
  checkbox: 231,
  radio: 200
};

export const MAX_EMPLOYMENT_ENTRIES = 10;

export const MIN_EMPLOYMENT_DURATION_MONTHS = 3;

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Currently Employed' },
  { value: 'resigned', label: 'Resigned' },
  { value: 'terminated', label: 'Terminated' },
  { value: 'laid_off', label: 'Laid Off' },
  { value: 'retired', label: 'Retired' },
  { value: 'other', label: 'Other' }
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'full_time', label: 'Full-Time' },
  { value: 'part_time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'military', label: 'Military Service' },
  { value: 'self_employed', label: 'Self-Employed' }
];

// Additional exports that components are expecting
export const EMPLOYMENT_TYPES = EMPLOYMENT_TYPE_OPTIONS;

export const NON_FEDERAL_EMPLOYMENT_TYPES = EMPLOYMENT_TYPE_OPTIONS.filter(
  type => !['military'].includes(type.value)
);

export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  invalidDate: 'Please enter a valid date',
  dateRange: 'End date must be after start date',
  employmentGap: 'Employment gap exceeds allowable period',
  duplicateEmployer: 'Duplicate employer entry detected'
};

export const FIELD_TYPE_LABELS = {
  text: 'Text Input',
  date: 'Date Field',
  select: 'Dropdown',
  checkbox: 'Checkbox',
  radio: 'Radio Button'
};

export const SECTION_13_TABS = [
  { id: 'current', label: 'Current Employment', fields: 150 },
  { id: 'previous', label: 'Previous Employment', fields: 400 },
  { id: 'gaps', label: 'Employment Gaps', fields: 200 },
  { id: 'additional', label: 'Additional Information', fields: 336 }
];