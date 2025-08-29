/**
 * Section 5 Field Generator - Generate Field<T> objects from sections-reference data
 *
 * This module provides consistent field ID generation that matches the PDF field naming patterns
 * identified in the Section 5 JSON analysis. It ensures unique, predictable field IDs that
 * align with the existing PDF field structure for Section 5 (Other Names Used).
 *
 * Based on Section 29 field generator pattern for proper integration.
 */

import {
  mapLogicalFieldToPdfField,
  getFieldMetadata,
  validateFieldExists,
  findSimilarFieldNames,
  getPdfFieldByName,
  getNumericFieldId
} from './section5-field-mapping';
import { SECTION5_FIELD_IDS, SECTION5_FIELD_NAMES } from '../../../../api/interfaces/section-interfaces/section5';
import type { Field } from 'api/interfaces/formDefinition2.0';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type Section5FieldType =
  | 'hasOtherNames'
  | 'hasMaidenNames'
  | 'lastName'
  | 'firstName'
  | 'middleName'
  | 'suffix'
  | 'from'
  | 'fromEstimate'
  | 'to'
  | 'toEstimate'
  | 'reasonChanged'
  | 'present'
  | 'isMaidenName';

/**
 * Suffix options for Section 5 based on section-5.json
 */
export const SUFFIX_OPTIONS = [
  'Jr', 'Sr', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'Other'
] as const;

// ============================================================================
// FIELD PATTERN MAPPING
// ============================================================================

/**
 * Maps field types to their PDF field patterns based on entry index
 * Pattern analysis from Section 5 JSON data:
 * - Entry 0: TextField11[2,1,0], suffix[0], area[0], field[9]
 * - Entry 1: TextField11[6,5,4], suffix[1], area[1], field[19]
 * - Entry 2: TextField11[10,9,8], suffix[2], area[2], field[29]
 * - Entry 3: TextField11[14,13,12], suffix[3], area[3], field[39]
 */
const FIELD_PATTERN_MAP: Record<Section5FieldType, (entryIndex: number) => string> = {
  // Main question - always the same
  hasOtherNames: () => 'RadioButtonList[0]',

  // Maiden name question - always the same
  hasMaidenNames: () => 'RadioButtonList[1]',

  // Name fields - reverse order pattern (last, first, middle)
  lastName: (entryIndex) => `TextField11[${entryIndex * 4 + 2}]`,
  firstName: (entryIndex) => `TextField11[${entryIndex * 4 + 1}]`,
  middleName: (entryIndex) => `TextField11[${entryIndex * 4}]`,

  // Suffix field
  suffix: (entryIndex) => `suffix[${entryIndex}]`,

  // Date fields
  from: (entryIndex) => `#area[${entryIndex}].From_Datefield_Name_2[${entryIndex}]`,
  fromEstimate: (entryIndex) => {
    const fieldNumbers = [7, 17, 27, 37]; // field[7], field[17], field[27], field[37]
    return `#field[${fieldNumbers[entryIndex]}]`;
  },
  to: (entryIndex) => `#area[${entryIndex}].To_Datefield_Name_2[${entryIndex}]`,
  toEstimate: (entryIndex) => {
    const fieldNumbers = [8, 18, 28, 38]; // field[8], field[18], field[28], field[38]
    return `#field[${fieldNumbers[entryIndex]}]`;
  },

  // Reason field - offset by 1 from lastName
  reasonChanged: (entryIndex) => `TextField11[${entryIndex * 4 + 3}]`,

  // Present checkbox - specific field numbers
  present: (entryIndex) => `#field[${entryIndex === 0 ? 9 : entryIndex === 1 ? 19 : entryIndex === 2 ? 29 : 39}]`,

  // Maiden name radio button - follows pattern: RadioButtonList[2], RadioButtonList[3], RadioButtonList[4], RadioButtonList[5]
  isMaidenName: (entryIndex) => `RadioButtonList[${entryIndex + 2}]`
};

/**
 * Maps field types to their human-readable labels
 */
const FIELD_LABEL_MAP: Record<Section5FieldType, (entryIndex: number) => string> = {
  hasOtherNames: () => 'Have you used any other names?',
  hasMaidenNames: () => 'Are any of the names you listed maiden names?',
  lastName: (entryIndex) => `Other Name #${entryIndex + 1} - Last Name`,
  firstName: (entryIndex) => `Other Name #${entryIndex + 1} - First Name`,
  middleName: (entryIndex) => `Other Name #${entryIndex + 1} - Middle Name`,
  suffix: (entryIndex) => `Other Name #${entryIndex + 1} - Suffix`,
  from: (entryIndex) => `Other Name #${entryIndex + 1} - From (Month/Year)`,
  fromEstimate: (entryIndex) => `Other Name #${entryIndex + 1} - From Date Estimate`,
  to: (entryIndex) => `Other Name #${entryIndex + 1} - To (Month/Year)`,
  toEstimate: (entryIndex) => `Other Name #${entryIndex + 1} - To Date Estimate`,
  reasonChanged: (entryIndex) => `Other Name #${entryIndex + 1} - Reason for Name Change`,
  present: (entryIndex) => `Other Name #${entryIndex + 1} - Present`,
  isMaidenName: (entryIndex) => `Other Name #${entryIndex + 1} - Is Maiden Name`,
};

// ============================================================================
// MAIN GENERATION FUNCTIONS
// ============================================================================

/**
 * Generates a unique field ID that matches PDF field naming patterns
 * Returns numeric PDF field ID when available, falls back to field name
 *
 * @param entryIndex - The entry index within the section (0-3)
 * @param fieldType - The type of field being generated
 * @returns A unique field ID string (numeric ID preferred, field name as fallback)
 */
export const generateFieldId = (
  entryIndex: number,
  fieldType: Section5FieldType
): string => {
  // console.log(`🔍 generateFieldId called: entryIndex=${entryIndex}, fieldType="${fieldType}"`);

  // For main questions, use exact field ID
  if (fieldType === 'hasOtherNames') {
    // console.log(`🎯 Using exact field ID for hasOtherNames: ${SECTION5_FIELD_IDS.HAS_OTHER_NAMES}`);
    return SECTION5_FIELD_IDS.HAS_OTHER_NAMES;
  }

  if (fieldType === 'hasMaidenNames') {
    // console.log(`🎯 Using exact field ID for hasMaidenNames: ${SECTION5_FIELD_IDS.HAS_MAIDEN_NAMES}`);
    return SECTION5_FIELD_IDS.HAS_MAIDEN_NAMES;
  }

  // Generate logical path for entry fields
  const logicalPath = `section5.otherNames.${entryIndex}.${fieldType}.value`;
  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);

  // console.log(`📋 Logical path: "${logicalPath}" → PDF field: "${pdfFieldName}"`);

  // Try to get the actual field from PDF mapping
  const field = getPdfFieldByName(pdfFieldName);

  if (field) {
    // console.log(`✅ Found actual PDF field for ${fieldType}[${entryIndex}]: ${field.name}`);

    // Try to get numeric ID first (preferred for ID-based mapping)
    const numericId = field.id.replace(' 0 R', '');
    if (numericId) {
      // console.log(`🔢 Using numeric ID: ${numericId} (from field name: ${field.name})`);
      return numericId;
    } else {
      // console.log(`📛 No numeric ID available, using field name: ${field.name}`);
      return field.name;
    }
  }

  // Fallback to pattern-based approach
  // console.warn(`⚠️ No PDF field found for ${fieldType}[${entryIndex}]`);
  // console.warn(`Available suggestions:`, findSimilarFieldNames(pdfFieldName, 3));

  // Use pattern as fallback
  const fieldPattern = FIELD_PATTERN_MAP[fieldType];
  if (!fieldPattern) {
    throw new Error(`Unknown field type: ${fieldType}`);
  }

  const fieldSuffix = fieldPattern(entryIndex);
  const fallbackFieldName = `form1[0].Sections1-6[0].section5[0].${fieldSuffix}`;

  // console.warn(`Using fallback pattern: ${fallbackFieldName}`);

  // Try to get numeric ID for the fallback field name
  const numericId = getNumericFieldId(fallbackFieldName);
  if (numericId) {
    // console.log(`🔢 Using numeric ID: ${numericId} (from fallback field name: ${fallbackFieldName})`);
    return numericId;
  }

  return fallbackFieldName;
};

/**
 * Generates a PDF field name for a field
 *
 * @param entryIndex - The entry index within the section (0-3)
 * @param fieldType - The type of field being generated
 * @returns A PDF field name string
 */
export const generateFieldName = (
  entryIndex: number,
  fieldType: Section5FieldType
): string => {
  // For main questions, use exact field name
  if (fieldType === 'hasOtherNames') {
    return SECTION5_FIELD_NAMES.HAS_OTHER_NAMES;
  }

  if (fieldType === 'hasMaidenNames') {
    return SECTION5_FIELD_NAMES.HAS_MAIDEN_NAMES;
  }

  // For entry fields, generate based on pattern
  const fieldPattern = FIELD_PATTERN_MAP[fieldType];
  if (!fieldPattern) {
    throw new Error(`Unknown field type: ${fieldType}`);
  }

  const fieldSuffix = fieldPattern(entryIndex);
  return `form1[0].Sections1-6[0].section5[0].${fieldSuffix}`;
};

/**
 * Generates rect coordinates for a field in the PDF
 *
 * @param entryIndex - The entry index within the section (0-3)
 * @param fieldType - The type of field being generated
 * @returns An object with rect coordinates (x, y, width, height)
 */
export const generateFieldRect = (
  entryIndex: number,
  fieldType: Section5FieldType
): { x: number, y: number, width: number, height: number } => {
  // Generate the logical path and get PDF field name
  const logicalPath = fieldType === 'hasOtherNames'
    ? 'section5.hasOtherNames.value'
    : fieldType === 'hasMaidenNames'
    ? 'section5.hasMaidenNames.value'
    : `section5.otherNames.${entryIndex}.${fieldType}.value`;

  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  // console.log(`📋 Getting rect for: "${logicalPath}" → PDF field: "${pdfFieldName}"`);

  // Try to get the actual field data from the PDF mapping
  const field = getPdfFieldByName(pdfFieldName);

  // If field data with rect is available, use it
  if (field && field.rect) {
    // console.log(`📐 Using actual PDF rect for ${fieldType}[${entryIndex}]:`, field.rect);
    return field.rect;
  }

  // Return default rectangle if no field data is available
  // console.warn(`⚠️ No rect data found for ${fieldType}[${entryIndex}], using default`);
  return { x: 0, y: 0, width: 0, height: 0 };
};

/**
 * Generates a human-readable label for a field
 *
 * @param fieldType - The type of field being generated
 * @param entryIndex - The entry index within the section (0-3)
 * @returns A human-readable label string
 */
export const generateFieldLabel = (
  fieldType: Section5FieldType,
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
 *
 * @param fieldType - The field type
 * @returns The HTML input type
 */
export const getFieldInputType = (fieldType: Section5FieldType): string => {
  if (fieldType === 'hasOtherNames' || fieldType === 'hasMaidenNames' || fieldType === 'isMaidenName') {
    return 'radio';
  }

  if (fieldType === 'present' || fieldType === 'fromEstimate' || fieldType === 'toEstimate') {
    return 'checkbox';
  }

  if (fieldType === 'from' || fieldType === 'to') {
    return 'month'; // Month/Year input
  }

  if (fieldType === 'suffix') {
    return 'select';
  }

  if (fieldType === 'reasonChanged') {
    return 'textarea';
  }

  return 'text';
};

/**
 * Validates that a field ID matches the expected pattern
 *
 * @param fieldId - The field ID to validate
 * @returns True if the field ID is valid
 */
export const validateFieldId = (fieldId: string): boolean => {
  const pattern = /^(form1\[0\]\.Sections1-6\[0\]\.section5\[0\]\..+|\d{4,5})$/;
  return pattern.test(fieldId);
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a complete Field object for Section 5
 *
 * @param entryIndex - The entry index (0-3, or -1 for main question)
 * @param fieldType - The type of field being generated
 * @param defaultValue - The default value for the field
 * @param options - Optional array of options for dropdown/radio fields
 * @returns A complete Field object
 */
export function generateCompleteField<T = any>(
  entryIndex: number,
  fieldType: Section5FieldType,
  defaultValue: T,
  options?: readonly string[]
): Field<T> {
  const fieldId = generateFieldId(entryIndex, fieldType);
  const fieldName = generateFieldName(entryIndex, fieldType);
  const fieldRect = generateFieldRect(entryIndex, fieldType);
  const fieldLabel = generateFieldLabel(fieldType, entryIndex);

  // Get field metadata for type information
  const fieldMetadata = getPdfFieldByName(fieldName);
  const fieldType_pdf = fieldMetadata?.type || 'PDFTextField';

  const field: Field<T> = {
    id: fieldId,
    name: fieldName,
    type: fieldType_pdf,
    label: fieldLabel,
    value: defaultValue,
    rect: fieldRect
  };

  // Add options if provided (for dropdown/radio fields)
  if (options && options.length > 0) {
    (field as any).options = options;
  }

  console.log(`✅ Section5: Generated complete field for ${fieldType}[${entryIndex}]:`, {
    id: field.id,
    name: field.name,
    type: field.type,
    label: field.label
  });

  return field;
}

/**
 * Validate field generation for a specific entry
 */
export function validateEntryFieldGeneration(entryIndex: number): boolean {
  console.log(`🔍 Section5: Validating field generation for entry ${entryIndex}`);

  const requiredFields: Section5FieldType[] = ['lastName', 'firstName', 'middleName', 'suffix', 'from', 'fromEstimate', 'to', 'toEstimate', 'reasonChanged', 'present', 'isMaidenName'];

  for (const fieldType of requiredFields) {
    const logicalPath = `section5.otherNames.${entryIndex}.${fieldType}.value`;
    const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);

    if (!pdfFieldName) {
      // console.error(`❌ Section5: No PDF field mapping for ${logicalPath}`);
      return false;
    }

    if (!validateFieldExists(pdfFieldName)) {
      // console.error(`❌ Section5: PDF field does not exist: ${pdfFieldName}`);
      return false;
    }
  }

  // console.log(`✅ Section5: All fields validated for entry ${entryIndex}`);
  return true;
}

/**
 * Validate all Section 5 field generation
 */
export function validateAllSection5FieldGeneration(): boolean {
  // console.log(`🔍 Section5: Validating all Section 5 field generation`);

  // Validate main field
  const mainFieldName = mapLogicalFieldToPdfField('section5.hasOtherNames.value');
  if (!validateFieldExists(mainFieldName)) {
    // console.error(`❌ Section5: Main field does not exist: ${mainFieldName}`);
    return false;
  }

  // Validate all 4 entries
  for (let i = 0; i < 4; i++) {
    if (!validateEntryFieldGeneration(i)) {
      return false;
    }
  }

  // console.log(`✅ Section5: All Section 5 field generation validated`);
  return true;
}
