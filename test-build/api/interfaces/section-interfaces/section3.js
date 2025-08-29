"use strict";
/**
 * Section 3: Place of Birth
 *
 * TypeScript interface definitions for SF-86 Section 3 (Place of Birth) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-3.json.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSection3Field = exports.createDefaultSection3 = exports.getStateList = exports.getCountryList = exports.LOCATION_VALIDATION = exports.US_STATES = exports.BIRTH_COUNTRIES = exports.SECTION3_FIELD_NAMES = exports.SECTION3_FIELD_IDS = void 0;
exports.validatePlaceOfBirth = validatePlaceOfBirth;
exports.isUSLocation = isUSLocation;
exports.formatLocationForDisplay = formatLocationForDisplay;
const sections_references_loader_1 = require("../../utils/sections-references-loader");
// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================
/**
 * PDF field ID mappings for Section 3 (Place of Birth)
 * Based on the actual field IDs from section-3.json (4-digit format)
 */
exports.SECTION3_FIELD_IDS = {
    // Place of birth fields
    CITY: "9446", // form1[0].Sections1-6[0].TextField11[3]
    COUNTY: "9445", // form1[0].Sections1-6[0].TextField11[4] 
    COUNTRY: "9444", // form1[0].Sections1-6[0].DropDownList1[0]
    STATE: "9443" // form1[0].Sections1-6[0].School6_State[1]
};
/**
 * Field name mappings for Section 3 (Place of Birth)
 * Full field paths from section-3.json
 */
exports.SECTION3_FIELD_NAMES = {
    // Place of birth fields
    CITY: "form1[0].Sections1-6[0].TextField11[3]",
    COUNTY: "form1[0].Sections1-6[0].TextField11[4]",
    COUNTRY: "form1[0].Sections1-6[0].DropDownList1[0]",
    STATE: "form1[0].Sections1-6[0].School6_State[1]"
};
// ============================================================================
// HELPER TYPES
// ============================================================================
/**
 * Common countries for birth place
 */
exports.BIRTH_COUNTRIES = {
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
};
/**
 * US States and territories
 */
exports.US_STATES = {
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
};
/**
 * Location validation patterns
 */
exports.LOCATION_VALIDATION = {
    MIN_CITY_LENGTH: 1,
    MAX_CITY_LENGTH: 50,
    MAX_COUNTY_LENGTH: 50,
    CITY_PATTERN: /^[a-zA-Z\s\-'\.]*$/,
    COUNTY_PATTERN: /^[a-zA-Z\s\-'\.]*$/
};
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Get list of countries for dropdown
 */
const getCountryList = () => [
    "United States",
    "Afghanistan",
    "Albania",
    "Algeria",
    // This would typically include all countries from the dropdown
    // Abbreviated for brevity
];
exports.getCountryList = getCountryList;
/**
 * Get list of US states for dropdown
 */
const getStateList = () => [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL",
    "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
    "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
    "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
    "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];
exports.getStateList = getStateList;
/**
 * Creates a default Section 3 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
const createDefaultSection3 = () => {
    // Validate field count against sections-references
    (0, sections_references_loader_1.validateSectionFieldCount)(3);
    return {
        _id: 3,
        section3: {
            city: (0, sections_references_loader_1.createFieldFromReference)(3, 'form1[0].Sections1-6[0].TextField11[3]', ''),
            county: (0, sections_references_loader_1.createFieldFromReference)(3, 'form1[0].Sections1-6[0].TextField11[4]', ''),
            country: (0, sections_references_loader_1.createFieldFromReference)(3, 'form1[0].Sections1-6[0].DropDownList1[0]', 'United States'),
            state: (0, sections_references_loader_1.createFieldFromReference)(3, 'form1[0].Sections1-6[0].School6_State[0]', '')
        }
    };
};
exports.createDefaultSection3 = createDefaultSection3;
/**
 * Updates a specific field in the Section 3 data structure
 */
const updateSection3Field = (section3Data, update) => {
    const { fieldPath, newValue } = update;
    const newData = { ...section3Data };
    // Update the specified field
    if (fieldPath === 'section3.city') {
        newData.section3.city.value = newValue;
    }
    else if (fieldPath === 'section3.county') {
        newData.section3.county.value = newValue;
    }
    else if (fieldPath === 'section3.country') {
        newData.section3.country.value = newValue;
        // Handle state field visibility based on country selection
        if (newValue !== 'United States' && newData.section3.state) {
            newData.section3.state.value = '';
        }
    }
    else if (fieldPath === 'section3.state' && newData.section3.state) {
        newData.section3.state.value = newValue;
    }
    return newData;
};
exports.updateSection3Field = updateSection3Field;
/**
 * Validates place of birth information
 */
function validatePlaceOfBirth(section3, context) {
    const errors = [];
    const warnings = [];
    // Required field validation
    if (context.rules.requiresCity && !section3.city.value.trim()) {
        errors.push('City is required');
    }
    if (context.rules.requiresCountry && !section3.country.value.trim()) {
        errors.push('Country is required');
    }
    // US-specific validation
    if (section3.country.value === exports.BIRTH_COUNTRIES.US) {
        if (context.rules.requiresStateForUS && !section3.state?.value.trim()) {
            errors.push('State is required for US birth locations');
        }
        if (section3.state?.value && !Object.keys(exports.US_STATES).some(key => exports.US_STATES[key] === section3.state.value)) {
            warnings.push('State may not be a valid US state or territory');
        }
    }
    // Length validation
    if (section3.city.value.length > exports.LOCATION_VALIDATION.MAX_CITY_LENGTH) {
        errors.push(`City name exceeds maximum length of ${exports.LOCATION_VALIDATION.MAX_CITY_LENGTH} characters`);
    }
    if (section3.county.value.length > exports.LOCATION_VALIDATION.MAX_COUNTY_LENGTH) {
        errors.push(`County name exceeds maximum length of ${exports.LOCATION_VALIDATION.MAX_COUNTY_LENGTH} characters`);
    }
    // Character validation
    if (section3.city.value && !exports.LOCATION_VALIDATION.CITY_PATTERN.test(section3.city.value)) {
        errors.push('City name contains invalid characters');
    }
    if (section3.county.value && !exports.LOCATION_VALIDATION.COUNTY_PATTERN.test(section3.county.value)) {
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
function isUSLocation(section3) {
    return section3.country.value === exports.BIRTH_COUNTRIES.US;
}
/**
 * Gets formatted location string for display
 */
function formatLocationForDisplay(section3) {
    const parts = [];
    if (section3.city.value)
        parts.push(section3.city.value);
    if (section3.county.value)
        parts.push(`${section3.county.value} County`);
    if (section3.state?.value)
        parts.push(section3.state.value);
    if (section3.country.value)
        parts.push(section3.country.value);
    return parts.join(', ');
}
