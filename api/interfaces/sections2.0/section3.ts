/**
 * Section 3: Place of Birth
 *
 * TypeScript interface definitions for SF-86 Section 3 (Place of Birth) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-3.json.
 */

import type { Field } from '../formDefinition2.0';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Place of Birth information structure for Section 3
 */
export interface PlaceOfBirth {
  city: Field<string>;
  county: Field<string>;
  country: Field<string>;
  state?: Field<string>; // Only present for US births
}

/**
 * Section 3 main data structure
 */
export interface Section3 {
  _id: number;
  section3: PlaceOfBirth;
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 3 subsection keys for type safety
 */
export type Section3SubsectionKey = 'section3';

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 3 (Place of Birth)
 * Based on the actual field IDs from section-3.json (4-digit format)
 */
export const SECTION3_FIELD_IDS = {
  // Place of birth fields
  CITY: "9446", // form1[0].Sections1-6[0].TextField11[3]
  COUNTY: "9445", // form1[0].Sections1-6[0].TextField11[4] 
  COUNTRY: "9444", // form1[0].Sections1-6[0].DropDownList1[0]
  STATE: "9443" // form1[0].Sections1-6[0].School6_State[1]
} as const;

/**
 * Field name mappings for Section 3 (Place of Birth)
 * Full field paths from section-3.json
 */
export const SECTION3_FIELD_NAMES = {
  // Place of birth fields
  CITY: "form1[0].Sections1-6[0].TextField11[3]",
  COUNTY: "form1[0].Sections1-6[0].TextField11[4]",
  COUNTRY: "form1[0].Sections1-6[0].DropDownList1[0]",
  STATE: "form1[0].Sections1-6[0].School6_State[1]"
} as const;

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Validation rules specific to Section 3
 */
export interface Section3ValidationRules {
  requiresCity: boolean;
  requiresCountry: boolean;
  requiresStateForUS: boolean;
  allowsCountyEmpty: boolean;
  validCountries: string[];
  validStates: string[];
}

/**
 * Section 3 validation context
 */
export interface Section3ValidationContext {
  rules: Section3ValidationRules;
  defaultCountry: string;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Common countries for birth place
 */
export const BIRTH_COUNTRIES = {
  US: 'United States',
  CA: 'Canada',
  MX: 'Mexico',
  UK: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  JP: 'Japan',
  CN: 'China',
  IN: 'India',
  OTHER: 'Other'
} as const;

/**
 * US States and territories
 */
export const US_STATES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia', PR: 'Puerto Rico', VI: 'Virgin Islands', GU: 'Guam',
  AS: 'American Samoa', MP: 'Northern Mariana Islands'
} as const;

/**
 * Location validation patterns
 */
export const LOCATION_VALIDATION = {
  MIN_CITY_LENGTH: 1,
  MAX_CITY_LENGTH: 50,
  MAX_COUNTY_LENGTH: 50,
  CITY_PATTERN: /^[a-zA-Z\s\-'\.]*$/,
  COUNTY_PATTERN: /^[a-zA-Z\s\-'\.]*$/
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for place of birth field updates
 */
export type Section3FieldUpdate = {
  fieldPath: string;
  newValue: any;
};

/**
 * Type for location validation results
 */
export type LocationValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get list of countries for dropdown
 */
export const getCountryList = (): string[] => [
  "United States",
  "Afghanistan",
  "Albania",
  "Algeria",
  // This would typically include all countries from the dropdown
  // Abbreviated for brevity
];

/**
 * Get list of US states for dropdown
 */
export const getStateList = (): string[] => [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL",
  "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
  "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
  "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

/**
 * Creates a default Section 3 data structure with correct field IDs
 */
export const createDefaultSection3 = (): Section3 => ({
  _id: 3,
  section3: {
    city: {
      id: SECTION3_FIELD_IDS.CITY,
      name: SECTION3_FIELD_NAMES.CITY,
      type: 'PDFTextField',
      label: 'City',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    county: {
      id: SECTION3_FIELD_IDS.COUNTY,
      name: SECTION3_FIELD_NAMES.COUNTY,
      type: 'PDFTextField',
      label: 'County',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    country: {
      id: SECTION3_FIELD_IDS.COUNTRY,
      name: SECTION3_FIELD_NAMES.COUNTRY,
      type: 'PDFDropdown',
      label: 'Country',
      value: 'United States',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    state: {
      id: SECTION3_FIELD_IDS.STATE,
      name: SECTION3_FIELD_NAMES.STATE,
      type: 'PDFDropdown',
      label: 'State',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    }
  }
});

/**
 * Updates a specific field in the Section 3 data structure
 */
export const updateSection3Field = (
  section3Data: Section3,
  update: Section3FieldUpdate
): Section3 => {
  const { fieldPath, newValue } = update;
  const newData = { ...section3Data };
  
  // Update the specified field
  if (fieldPath === 'section3.city') {
    newData.section3.city.value = newValue;
  } else if (fieldPath === 'section3.county') {
    newData.section3.county.value = newValue;
  } else if (fieldPath === 'section3.country') {
    newData.section3.country.value = newValue;
    
    // Handle state field visibility based on country selection
    if (newValue !== 'United States' && newData.section3.state) {
      newData.section3.state.value = '';
    }
  } else if (fieldPath === 'section3.state' && newData.section3.state) {
    newData.section3.state.value = newValue;
  }
  
  return newData;
};

/**
 * Validates place of birth information
 */
export function validatePlaceOfBirth(section3: PlaceOfBirth, context: Section3ValidationContext): LocationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validation
  if (context.rules.requiresCity && !section3.city.value.trim()) {
    errors.push('City is required');
  }

  if (context.rules.requiresCountry && !section3.country.value.trim()) {
    errors.push('Country is required');
  }

  // US-specific validation
  if (section3.country.value === BIRTH_COUNTRIES.US) {
    if (context.rules.requiresStateForUS && !section3.state?.value.trim()) {
      errors.push('State is required for US birth locations');
    }
    
    if (section3.state?.value && !Object.keys(US_STATES).some(key => US_STATES[key as keyof typeof US_STATES] === section3.state!.value)) {
      warnings.push('State may not be a valid US state or territory');
    }
  }

  // Length validation
  if (section3.city.value.length > LOCATION_VALIDATION.MAX_CITY_LENGTH) {
    errors.push(`City name exceeds maximum length of ${LOCATION_VALIDATION.MAX_CITY_LENGTH} characters`);
  }

  if (section3.county.value.length > LOCATION_VALIDATION.MAX_COUNTY_LENGTH) {
    errors.push(`County name exceeds maximum length of ${LOCATION_VALIDATION.MAX_COUNTY_LENGTH} characters`);
  }

  // Character validation
  if (section3.city.value && !LOCATION_VALIDATION.CITY_PATTERN.test(section3.city.value)) {
    errors.push('City name contains invalid characters');
  }

  if (section3.county.value && !LOCATION_VALIDATION.COUNTY_PATTERN.test(section3.county.value)) {
    errors.push('County name contains invalid characters');
  }

  // Country validation
  if (context.rules.validCountries.length > 0 && 
      !context.rules.validCountries.includes(section3.country.value)) {
    warnings.push('Country may not be in the approved list');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Checks if a location is within the United States
 */
export function isUSLocation(section3: PlaceOfBirth): boolean {
  return section3.country.value === BIRTH_COUNTRIES.US;
}

/**
 * Gets formatted location string for display
 */
export function formatLocationForDisplay(section3: PlaceOfBirth): string {
  const parts: string[] = [];
  
  if (section3.city.value) parts.push(section3.city.value);
  if (section3.county.value) parts.push(`${section3.county.value} County`);
  if (section3.state?.value) parts.push(section3.state.value);
  if (section3.country.value) parts.push(section3.country.value);
  
  return parts.join(', ');
}
