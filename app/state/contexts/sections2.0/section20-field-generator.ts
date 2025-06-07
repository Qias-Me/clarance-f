/**
 * Section 20 Field ID Generation Utilities
 *
 * This module provides consistent field ID generation that matches the PDF field naming patterns
 * identified in the Section 20 JSON analysis. It ensures unique, predictable field IDs that
 * align with the existing sectionizer logic and PDF field structure.
 */

import {
  getFieldBySubsectionAndType,
  getSubsectionPattern,
  getNumericFieldId,
  type SubsectionPattern
} from './section20-field-mapping';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type Section20SubsectionKey =
  | 'foreignFinancialInterests'
  | 'foreignBusinessActivities'
  | 'foreignTravel';

export type Section20FieldType =
  | 'hasForeignFinancialInterests'
  | 'hasForeignBusinessActivities'
  | 'hasForeignTravel'
  | 'financialInterestType'
  | 'description'
  | 'dateAcquired'
  | 'howAcquired'
  | 'costAtAcquisition'
  | 'currentValue'
  | 'isCurrentlyOwned'
  | 'hasCoOwners'
  | 'coOwnerFirstName'
  | 'coOwnerLastName'
  | 'coOwnerRelationship'
  | 'businessDescription'
  | 'businessType'
  | 'businessCountry'
  | 'travelCountry'
  | 'travelPurpose'
  | 'travelDays';

// ============================================================================
// SUBSECTION MAPPING
// ============================================================================

/**
 * Maps subsection keys to their corresponding PDF field prefixes
 * Based on sections-references analysis:
 * - Section20a[0]: Foreign Financial Interests (has RadioButtonList[0] and RadioButtonList[1])
 * - Section20a2[0]: Foreign Business Activities and Travel (has only RadioButtonList[0])
 */
const SUBSECTION_PDF_MAP: Record<Section20SubsectionKey, string> = {
  foreignFinancialInterests: 'Section20a[0]',    // Main financial interests
  foreignBusinessActivities: 'Section20a2[0]',  // Business activities
  foreignTravel: 'Section20a2[0]'                // Travel activities (shares Section20a2 with business)
};

// ============================================================================
// FIELD LABEL MAPPING
// ============================================================================

/**
 * Maps field types to their human-readable labels
 */
const FIELD_LABEL_MAP: Record<Section20FieldType, (entryIndex: number) => string> = {
  hasForeignFinancialInterests: () => 'Do you have any foreign financial interests?',
  hasForeignBusinessActivities: () => 'Do you have any foreign business activities?',
  hasForeignTravel: () => 'Do you have any foreign travel?',
  
  financialInterestType: (entryIndex) => `Entry #${entryIndex + 1}. Type of financial interest`,
  description: (entryIndex) => `Entry #${entryIndex + 1}. Description`,
  dateAcquired: (entryIndex) => `Entry #${entryIndex + 1}. Date acquired`,
  howAcquired: (entryIndex) => `Entry #${entryIndex + 1}. How acquired`,
  costAtAcquisition: (entryIndex) => `Entry #${entryIndex + 1}. Cost at acquisition`,
  currentValue: (entryIndex) => `Entry #${entryIndex + 1}. Current value`,
  isCurrentlyOwned: (entryIndex) => `Entry #${entryIndex + 1}. Currently owned`,
  hasCoOwners: (entryIndex) => `Entry #${entryIndex + 1}. Has co-owners`,
  
  coOwnerFirstName: (entryIndex) => `Entry #${entryIndex + 1}. Co-owner first name`,
  coOwnerLastName: (entryIndex) => `Entry #${entryIndex + 1}. Co-owner last name`,
  coOwnerRelationship: (entryIndex) => `Entry #${entryIndex + 1}. Co-owner relationship`,
  
  businessDescription: (entryIndex) => `Entry #${entryIndex + 1}. Business description`,
  businessType: (entryIndex) => `Entry #${entryIndex + 1}. Business type`,
  businessCountry: (entryIndex) => `Entry #${entryIndex + 1}. Business country`,
  
  travelCountry: (entryIndex) => `Entry #${entryIndex + 1}. Country visited`,
  travelPurpose: (entryIndex) => `Entry #${entryIndex + 1}. Purpose of travel`,
  travelDays: (entryIndex) => `Entry #${entryIndex + 1}. Number of days`
};

// ============================================================================
// MAIN GENERATION FUNCTIONS
// ============================================================================

/**
 * Generates a unique field ID that matches PDF field naming patterns
 * Returns numeric PDF field ID when available, falls back to field name
 */
export const generateFieldId = (
  subsectionKey: Section20SubsectionKey,
  entryIndex: number,
  fieldType: Section20FieldType
): string => {
  console.log(`🔍 Section20 generateFieldId: subsectionKey="${subsectionKey}", entryIndex=${entryIndex}, fieldType="${fieldType}"`);

  // Get the correct subsection pattern
  const subsectionPattern = getSubsectionPattern(subsectionKey, entryIndex);
  console.log(`📋 Section20 subsection pattern: "${subsectionPattern}"`);

  // Try to get the actual field from PDF mapping
  const field = getFieldBySubsectionAndType(subsectionPattern, fieldType, entryIndex, subsectionKey);

  if (field) {
    console.log(`✅ Section20 found PDF field: ${field.name} (ID: ${field.id})`);
    
    // Try to get numeric ID first (preferred)
    const numericId = getNumericFieldId(field.name);
    if (numericId) {
      console.log(`🔢 Section20 using numeric ID: ${numericId}`);
      return numericId;
    } else {
      console.log(`📛 Section20 using field name: ${field.name}`);
      return field.name;
    }
  }

  // Fallback: generate field name based on pattern
  console.warn(`⚠️ Section20 no PDF field found, using fallback for ${subsectionKey}.${fieldType}[${entryIndex}]`);
  
  const subsectionPrefix = SUBSECTION_PDF_MAP[subsectionKey];
  const fallbackFieldName = `form1[0].${subsectionPrefix}.${fieldType}[${entryIndex}]`;
  
  console.warn(`Section20 fallback field name: ${fallbackFieldName}`);
  return fallbackFieldName;
};

/**
 * Generates a PDF field name for a field
 */
export const generateFieldName = (
  subsectionKey: Section20SubsectionKey,
  entryIndex: number,
  fieldType: Section20FieldType
): string => {
  // Get the correct subsection pattern
  const subsectionPattern = getSubsectionPattern(subsectionKey, entryIndex);
  
  // Try to get the actual field from PDF mapping
  const field = getFieldBySubsectionAndType(subsectionPattern, fieldType, entryIndex, subsectionKey);
  
  if (field) {
    return field.name;
  }

  // Fallback: generate based on pattern
  const subsectionPrefix = SUBSECTION_PDF_MAP[subsectionKey];
  return `form1[0].${subsectionPrefix}.${fieldType}[${entryIndex}]`;
};

/**
 * Generates rect coordinates for a field in the PDF
 */
export const generateFieldRect = (
  subsectionKey: Section20SubsectionKey,
  entryIndex: number,
  fieldType: Section20FieldType
): { x: number, y: number, width: number, height: number } => {
  // Get the correct subsection pattern
  const subsectionPattern = getSubsectionPattern(subsectionKey, entryIndex);
  
  // Try to get the actual field data from PDF mapping
  const field = getFieldBySubsectionAndType(subsectionPattern, fieldType, entryIndex, subsectionKey);
  
  if (field && field.rect) {
    console.log(`📐 Section20 using actual PDF rect for ${subsectionKey}.${fieldType}[${entryIndex}]:`, field.rect);
    return field.rect;
  }

  // Return default rectangle if no field data is available
  console.warn(`⚠️ Section20 no rect data found for ${subsectionKey}.${fieldType}[${entryIndex}], using default`);
  return { x: 0, y: 0, width: 0, height: 0 };
};

/**
 * Generates a human-readable label for a field
 */
export const generateFieldLabel = (
  fieldType: Section20FieldType,
  entryIndex: number
): string => {
  const labelGenerator = FIELD_LABEL_MAP[fieldType];

  if (!labelGenerator) {
    throw new Error(`Unknown field type: ${fieldType}`);
  }

  return labelGenerator(entryIndex);
};

/**
 * Determines the appropriate field type based on HTML input requirements
 */
export const getFieldInputType = (fieldType: Section20FieldType): string => {
  if (fieldType.startsWith('has') || fieldType.includes('isCurrently')) {
    return 'radio';
  }

  if (fieldType.includes('date')) {
    return 'month'; // Month/Year input
  }

  if (fieldType.includes('cost') || fieldType.includes('value') || fieldType === 'travelDays') {
    return 'number';
  }

  if (fieldType.includes('country')) {
    return 'select';
  }

  if (fieldType.includes('description') || fieldType.includes('purpose')) {
    return 'textarea';
  }

  return 'text';
};

/**
 * Validates that a field ID matches the expected pattern
 */
export const validateFieldId = (fieldId: string): boolean => {
  const pattern = /^(form1\[0\]\.Section20a2?\[0\]\..+|\d+)$/;
  return pattern.test(fieldId);
};
