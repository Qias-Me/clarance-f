/**
 * Section 3: Place of Birth
 *
 * TypeScript interface definitions for SF-86 Section 3 place of birth data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings.
 */

import type { Field } from '../formDefinition2.0';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Place of birth location information
 */
export interface PlaceOfBirth {
  city: Field<string>;
  county: Field<string>;
  state: Field<string>;
  country: Field<string>;
}

/**
 * Section 3 main data structure
 */
export interface Section3 {
  _id: number;
  placeOfBirth: PlaceOfBirth;
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 3 subsection keys for type safety
 */
export type Section3SubsectionKey = 'placeOfBirth';

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
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID patterns for Section 3
 * Based on the Sections1-6 pattern from the JSON reference
 */
export const SECTION3_FIELD_IDS = {
  // Place of birth fields
  CITY: "form1[0].Sections1-6[0].TextField11[3]",
  COUNTY: "form1[0].Sections1-6[0].TextField11[4]",
  STATE: "form1[0].Sections1-6[0].School6_State[0]",
  COUNTRY: "form1[0].Sections1-6[0].DropDownList1[0]"
} as const;

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
 * Type for creating new Section 3 data
 */
export type CreateSection3Params = {
  defaultCountry?: string;
  defaultState?: string;
};

/**
 * Type for Section 3 field updates
 */
export type Section3FieldUpdate = {
  fieldPath: 'city' | 'county' | 'state' | 'country';
  newValue: string;
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
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 3 data structure
 */
export function createDefaultSection3(params?: CreateSection3Params): Section3 {
  return {
    _id: 3,
    placeOfBirth: {
      city: { value: '', id: SECTION3_FIELD_IDS.CITY },
      county: { value: '', id: SECTION3_FIELD_IDS.COUNTY },
      state: { value: params?.defaultState || '', id: SECTION3_FIELD_IDS.STATE },
      country: { value: params?.defaultCountry || BIRTH_COUNTRIES.US, id: SECTION3_FIELD_IDS.COUNTRY }
    }
  };
}

/**
 * Validates place of birth information
 */
export function validatePlaceOfBirth(placeOfBirth: PlaceOfBirth, context: Section3ValidationContext): LocationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validation
  if (context.rules.requiresCity && !placeOfBirth.city.value.trim()) {
    errors.push('City is required');
  }

  if (context.rules.requiresCountry && !placeOfBirth.country.value.trim()) {
    errors.push('Country is required');
  }

  // US-specific validation
  if (placeOfBirth.country.value === BIRTH_COUNTRIES.US) {
    if (context.rules.requiresStateForUS && !placeOfBirth.state.value.trim()) {
      errors.push('State is required for US birth locations');
    }
    
    if (placeOfBirth.state.value && !Object.values(US_STATES).includes(placeOfBirth.state.value)) {
      warnings.push('State may not be a valid US state or territory');
    }
  }

  // Length validation
  if (placeOfBirth.city.value.length > LOCATION_VALIDATION.MAX_CITY_LENGTH) {
    errors.push(`City name exceeds maximum length of ${LOCATION_VALIDATION.MAX_CITY_LENGTH} characters`);
  }

  if (placeOfBirth.county.value.length > LOCATION_VALIDATION.MAX_COUNTY_LENGTH) {
    errors.push(`County name exceeds maximum length of ${LOCATION_VALIDATION.MAX_COUNTY_LENGTH} characters`);
  }

  // Character validation
  if (placeOfBirth.city.value && !LOCATION_VALIDATION.CITY_PATTERN.test(placeOfBirth.city.value)) {
    errors.push('City name contains invalid characters');
  }

  if (placeOfBirth.county.value && !LOCATION_VALIDATION.COUNTY_PATTERN.test(placeOfBirth.county.value)) {
    errors.push('County name contains invalid characters');
  }

  // Country validation
  if (context.rules.validCountries.length > 0 && 
      !context.rules.validCountries.includes(placeOfBirth.country.value)) {
    warnings.push('Country may not be in the approved list');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Updates a specific field in Section 3
 */
export function updateSection3Field(
  section3: Section3, 
  update: Section3FieldUpdate
): Section3 {
  const updated = { ...section3 };
  
  switch (update.fieldPath) {
    case 'city':
      updated.placeOfBirth.city.value = update.newValue;
      break;
    case 'county':
      updated.placeOfBirth.county.value = update.newValue;
      break;
    case 'state':
      updated.placeOfBirth.state.value = update.newValue;
      break;
    case 'country':
      updated.placeOfBirth.country.value = update.newValue;
      // Clear state if country is not US
      if (update.newValue !== BIRTH_COUNTRIES.US) {
        updated.placeOfBirth.state.value = '';
      }
      break;
  }
  
  return updated;
}

/**
 * Checks if a location is within the United States
 */
export function isUSLocation(placeOfBirth: PlaceOfBirth): boolean {
  return placeOfBirth.country.value === BIRTH_COUNTRIES.US;
}

/**
 * Gets formatted location string for display
 */
export function formatLocationForDisplay(placeOfBirth: PlaceOfBirth): string {
  const parts: string[] = [];
  
  if (placeOfBirth.city.value) parts.push(placeOfBirth.city.value);
  if (placeOfBirth.county.value) parts.push(`${placeOfBirth.county.value} County`);
  if (placeOfBirth.state.value) parts.push(placeOfBirth.state.value);
  if (placeOfBirth.country.value) parts.push(placeOfBirth.country.value);
  
  return parts.join(', ');
}
