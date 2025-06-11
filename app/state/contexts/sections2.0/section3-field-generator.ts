/**
 * Section 3 Field Generator - Generate Field<T> objects from sections-reference data
 *
 * This module generates properly typed Field<T> objects for Section 3 using the
 * actual PDF field data from section-3.json reference file.
 */

import { createFieldFromReference } from '../../../../api/utils/sections-references-loader';
import type { Field } from '../../../../api/interfaces/formDefinition2.0';

// Import sections-references for Section 3
import section3References from '../../../../api/sections-references/section-3.json';

/**
 * Generate Section 3 fields using sections-references as source of truth
 * Section 3 contains place of birth information: city, county, country, state
 */

// ============================================================================
// FIELD MAPPINGS FROM SECTION-3.JSON
// ============================================================================

/**
 * Section 3 field mappings based on section-3.json:
 * - City: "9446 0 R" → "form1[0].Sections1-6[0].TextField11[3]"
 * - County: "9445 0 R" → "form1[0].Sections1-6[0].TextField11[4]"
 * - Country: "9444 0 R" → "form1[0].Sections1-6[0].DropDownList1[0]"
 * - State: "9443 0 R" → "form1[0].Sections1-6[0].School6_State[0]"
 */
export const SECTION3_FIELD_MAPPINGS = {
  city: 'form1[0].Sections1-6[0].TextField11[3]',
  county: 'form1[0].Sections1-6[0].TextField11[4]',
  country: 'form1[0].Sections1-6[0].DropDownList1[0]',
  state: 'form1[0].Sections1-6[0].School6_State[0]'
} as const;

// ============================================================================
// FIELD GENERATORS
// ============================================================================

/**
 * Generate city field
 */
export function generateCityField(defaultValue: string = ''): Field<string> {
  return createFieldFromReference(3, SECTION3_FIELD_MAPPINGS.city, defaultValue);
}

/**
 * Generate county field
 */
export function generateCountyField(defaultValue: string = ''): Field<string> {
  return createFieldFromReference(3, SECTION3_FIELD_MAPPINGS.county, defaultValue);
}

/**
 * Generate country field
 */
export function generateCountryField(defaultValue: string = 'United States'): Field<string> {
  return createFieldFromReference(3, SECTION3_FIELD_MAPPINGS.country, defaultValue);
}

/**
 * Generate state field
 */
export function generateStateField(defaultValue: string = ''): Field<string> {
  return createFieldFromReference(3, SECTION3_FIELD_MAPPINGS.state, defaultValue);
}

// ============================================================================
// COMPLETE SECTION GENERATOR
// ============================================================================

/**
 * Generate all Section 3 fields using sections-references
 */
export function generateSection3Fields() {
  return {
    city: generateCityField(),
    county: generateCountyField(),
    country: generateCountryField(),
    state: generateStateField()
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate that all Section 3 fields exist in sections-references
 */
export function validateSection3FieldMappings(): boolean {
  const requiredFields = Object.values(SECTION3_FIELD_MAPPINGS);
  const availableFields = section3References.fields.map(field => field.name);
  
  const missingFields = requiredFields.filter(field => !availableFields.includes(field));
  
  if (missingFields.length > 0) {
    // console.error('❌ Section 3 field mapping validation failed. Missing fields:', missingFields);
    return false;
  }
  
  // console.log('✅ Section 3 field mappings validated successfully');
  return true;
}

/**
 * Get field metadata from sections-references
 */
export function getSection3FieldMetadata(fieldName: keyof typeof SECTION3_FIELD_MAPPINGS) {
  const pdfFieldName = SECTION3_FIELD_MAPPINGS[fieldName];
  return section3References.fields.find(field => field.name === pdfFieldName);
}

// ============================================================================
// DEBUG UTILITIES
// ============================================================================

/**
 * Debug Section 3 field generation
 */
export function debugSection3Fields() {
  // console.log('🔍 Section 3 Field Generation Debug');
  // console.log('=====================================');
  
  const fields = generateSection3Fields();
  
  Object.entries(fields).forEach(([key, field]) => {
    // console.log(`${key}:`, {
  //     id: field.id,
  //     name: field.name,
  //     type: field.type,
  //     label: field.label,
  //     value: field.value
  //   });
  });
  
  // console.log('\n📊 Field Mapping Validation:');
  validateSection3FieldMappings();
  
  // console.log('\n📋 Available Fields in section-3.json:');
  section3References.fields.forEach(field => {
    // console.log(`- ${field.name} (ID: ${field.id})`);
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateCityField,
  generateCountyField,
  generateCountryField,
  generateStateField,
  generateSection3Fields,
  validateSection3FieldMappings,
  getSection3FieldMetadata,
  debugSection3Fields,
  SECTION3_FIELD_MAPPINGS
};
