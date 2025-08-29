/**
 * Section 13 Complete Field Definitions
 * Auto-generated from section-13.json reference file
 * Contains all 1086 fields for Section 13: Employment Activities
 */

import {
  generateSection13Fields,
  getFieldsForEmploymentType,
  getFieldsForEntry,
  getSection13FieldStats,
  type Section13FieldDefinition
} from '../utils/section13-field-generator';

// Export the field definition type
export type { Section13FieldDefinition };

// Generate all 1086 fields from the reference data
export const SECTION_13_ALL_FIELDS = generateSection13Fields();

// Export field statistics
export const SECTION_13_FIELD_STATS = getSection13FieldStats();

// Export categorized fields for easy access
export const SECTION_13_FIELDS_BY_TYPE = {
  military: getFieldsForEmploymentType('military'),
  nonFederal: getFieldsForEmploymentType('nonFederal'),
  selfEmployment: getFieldsForEmploymentType('selfEmployment'),
  unemployment: getFieldsForEmploymentType('unemployment'),
  federal: getFieldsForEmploymentType('federal'),
  employmentRecordIssues: getFieldsForEmploymentType('employmentRecordIssues'),
  disciplinaryActions: getFieldsForEmploymentType('disciplinaryActions')
};

// Export utility functions
export { getFieldsForEntry, getFieldsForEmploymentType };

// Log field coverage on module load
console.log('✅ Section 13 Complete Fields loaded:', {
  totalFields: SECTION_13_ALL_FIELDS.length,
  expectedFields: 1086,
  coverage: `${((SECTION_13_ALL_FIELDS.length / 1086) * 100).toFixed(2)}%`,
  stats: SECTION_13_FIELD_STATS
});

// Validate field coverage
if (SECTION_13_ALL_FIELDS.length !== 1086) {
  console.warn(`⚠️ Section 13 field count mismatch: Expected 1086, got ${SECTION_13_ALL_FIELDS.length}`);
  
  // Log missing field categories if any
  const missingCategories = Object.entries(SECTION_13_FIELD_STATS.categories)
    .filter(([category, count]) => count === 0)
    .map(([category]) => category);
    
  if (missingCategories.length > 0) {
    console.warn('⚠️ Missing field categories:', missingCategories);
  }
}

// Export a validation function to check field completeness
export function validateSection13FieldCoverage(): {
  isComplete: boolean;
  totalFields: number;
  expectedFields: number;
  missingFields: number;
  coverage: string;
  details: Record<string, any>;
} {
  const totalFields = SECTION_13_ALL_FIELDS.length;
  const expectedFields = 1086;
  const missingFields = expectedFields - totalFields;
  const coverage = `${((totalFields / expectedFields) * 100).toFixed(2)}%`;
  
  return {
    isComplete: totalFields === expectedFields,
    totalFields,
    expectedFields,
    missingFields,
    coverage,
    details: SECTION_13_FIELD_STATS
  };
}