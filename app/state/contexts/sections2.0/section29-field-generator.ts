/**
 * Section 29 Field ID Generation Utilities
 *
 * This module provides consistent field ID generation that matches the PDF field naming patterns
 * identified in the Section 29 JSON analysis. It ensures unique, predictable field IDs that
 * align with the existing sectionizer logic and PDF field structure.
 */

import {
  getFieldSuggestions,
  getSubsectionPattern,
  getFieldBySubsectionAndType,
  getNumericFieldId
} from './section29-field-mapping';
import { SECTION29_RADIO_FIELD_IDS, SECTION29_RADIO_FIELD_NAMES } from '../../../../api/interfaces/sections2.0/section29';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SubsectionKey =
  | 'terrorismOrganizations'
  | 'terrorismActivities'
  | 'terrorismAdvocacy'
  | 'violentOverthrowOrganizations'
  | 'violenceForceOrganizations'
  | 'overthrowActivities'
  | 'terrorismAssociations'
  | 'overthrowActivitiesAndAssociations'; // Legacy support

export type OrganizationSubsectionKey =
  | 'terrorismOrganizations'
  | 'violentOverthrowOrganizations'
  | 'violenceForceOrganizations';

export type ActivitySubsectionKey =
  | 'terrorismActivities'
  | 'terrorismAdvocacy'
  | 'overthrowActivities'
  | 'terrorismAssociations'
  | 'overthrowActivitiesAndAssociations'; // Legacy support

export type ActivityEntryType = 'terrorism' | 'overthrow' | 'association';

export type FieldType =
  | 'hasAssociation'
  | 'hasActivity'
  | 'organizationName'
  | 'address.street'
  | 'address.city'
  | 'address.state'
  | 'address.zipCode'
  | 'address.country'
  | 'dateRange.from'
  | 'dateRange.to'
  | 'dateRange.present'
  | 'dateRange.from.estimated'
  | 'dateRange.to.estimated'
  | 'positions.description'
  | 'positions.noPositionsHeld'
  | 'contributions.description'
  | 'contributions.noContributionsMade'
  | 'involvementDescription'
  | 'activityDescription'
  | 'advocacyReason'
  | 'explanation';

// ============================================================================
// SUBSECTION MAPPING
// ============================================================================

/**
 * Maps subsection keys to their corresponding PDF field prefixes
 * Complete 7 subsections with 141 total fields
 */
const SUBSECTION_PDF_MAP: Record<SubsectionKey, string> = {
  terrorismOrganizations: 'Section29[0]',           // 29.1 - 33 fields
  terrorismActivities: 'Section29_2[0]',           // 29.2 - 13 fields
  terrorismAdvocacy: 'Section29_2[0]',             // 29.3 - 13 fields (shares with 29.2)
  violentOverthrowOrganizations: 'Section29_3[0]', // 29.4 - 33 fields
  violenceForceOrganizations: 'Section29_4[0]',    // 29.5 - 33 fields
  overthrowActivities: 'Section29_5[0]',           // 29.6 - 13 fields (RadioButtonList[0])
  terrorismAssociations: 'Section29_5[0]',         // 29.7 - 3 fields (RadioButtonList[1])
  overthrowActivitiesAndAssociations: 'Section29_5[0]' // Legacy support
};

// ============================================================================
// FIELD TYPE MAPPING
// ============================================================================

/**
 * Maps field types to their PDF field patterns based on entry index
 * Pattern analysis from Section 29 JSON data:
 * - Entry #1: lower indices (0-6), area[1], From_Datefield_Name_2[0-1]
 * - Entry #2: higher indices (7-13), area[3], From_Datefield_Name_2[2-3]
 */
const FIELD_PATTERN_MAP: Record<FieldType, (entryIndex: number) => string> = {
  // Yes/No questions - Updated to handle different radio button patterns per subsection
  // Note: These patterns are now handled by getRadioButtonFieldId() function for exact field IDs
  hasAssociation: () => 'RadioButtonList[0]', // Default pattern, overridden by exact field IDs
  hasActivity: () => 'RadioButtonList[0]',    // Default pattern, overridden by exact field IDs

  // Organization fields
  organizationName: (entryIndex) => `TextField11[${entryIndex === 0 ? 1 : 8}]`,

  // Address fields (area groups) - Updated to match actual PDF structure
  'address.street': (entryIndex) => `#area[${entryIndex === 0 ? 1 : 3}].TextField11[${entryIndex === 0 ? 4 : 11}]`,
  'address.city': (entryIndex) => `#area[${entryIndex === 0 ? 1 : 3}].TextField11[${entryIndex === 0 ? 5 : 12}]`,
  'address.state': (entryIndex) => `#area[${entryIndex === 0 ? 1 : 3}].School6_State[${entryIndex === 0 ? 0 : 1}]`,
  'address.zipCode': (entryIndex) => `#area[${entryIndex === 0 ? 1 : 3}].TextField11[${entryIndex === 0 ? 6 : 13}]`,
  'address.country': (entryIndex) => `#area[${entryIndex === 0 ? 1 : 3}].DropDownList${entryIndex === 0 ? 6 : 5}[0]`,

  // Date fields
  'dateRange.from': (entryIndex) => `From_Datefield_Name_2[${entryIndex * 2}]`,
  'dateRange.to': (entryIndex) => `From_Datefield_Name_2[${entryIndex * 2 + 1}]`,
  'dateRange.present': (entryIndex) => `#field[${entryIndex === 0 ? 13 : 29}]`,
  'dateRange.from.estimated': (entryIndex) => `#field[${entryIndex === 0 ? 15 : 31}]`,
  'dateRange.to.estimated': (entryIndex) => `#field[${entryIndex === 0 ? 17 : 33}]`,

  // Position and contribution fields
  'positions.description': (entryIndex) => `TextField11[${entryIndex === 0 ? 0 : 7}]`,
  'positions.noPositionsHeld': (entryIndex) => `#field[${entryIndex === 0 ? 6 : 22}]`,
  'contributions.description': (entryIndex) => `TextField11[${entryIndex === 0 ? 2 : 9}]`,
  'contributions.noContributionsMade': (entryIndex) => `#field[${entryIndex === 0 ? 7 : 23}]`,

  // Description fields
  involvementDescription: (entryIndex) => `TextField11[${entryIndex === 0 ? 3 : 10}]`,
  activityDescription: (entryIndex) => `TextField11[${entryIndex === 0 ? 0 : 3}]`,
  advocacyReason: (entryIndex) => `TextField11[${entryIndex === 0 ? 1 : 4}]`,
  explanation: (entryIndex) => `TextField11[${entryIndex === 0 ? 1 : 2}]`
};

// ============================================================================
// FIELD LABEL MAPPING
// ============================================================================

/**
 * Maps field types to their human-readable labels based on entry index
 */
const FIELD_LABEL_MAP: Record<FieldType, (entryIndex: number) => string> = {
  // Updated radio button labels to be more generic - specific labels are handled in context
  hasAssociation: () => 'Have you EVER been a member of an organization (Yes/No)',
  hasActivity: () => 'Have you EVER engaged in activities (Yes/No)',

  organizationName: (entryIndex) => `Entry #${entryIndex + 1}. Provide the full name of the organization`,

  'address.street': (entryIndex) => `Entry #${entryIndex + 1}. Street address of organization`,
  'address.city': (entryIndex) => `Entry #${entryIndex + 1}. City of organization`,
  'address.state': (entryIndex) => `Entry #${entryIndex + 1}. State of organization`,
  'address.zipCode': (entryIndex) => `Entry #${entryIndex + 1}. ZIP code of organization`,
  'address.country': (entryIndex) => `Entry #${entryIndex + 1}. Country of organization`,

  'dateRange.from': (entryIndex) => `Entry #${entryIndex + 1}. From date (Month/Year)`,
  'dateRange.to': (entryIndex) => `Entry #${entryIndex + 1}. To date (Month/Year)`,
  'dateRange.present': (entryIndex) => `Entry #${entryIndex + 1}. Present`,
  'dateRange.from.estimated': (entryIndex) => `Entry #${entryIndex + 1}. From date estimated`,
  'dateRange.to.estimated': (entryIndex) => `Entry #${entryIndex + 1}. To date estimated`,

  'positions.description': (entryIndex) => `Entry #${entryIndex + 1}. Describe the nature of your role(s) or position(s)`,
  'positions.noPositionsHeld': (entryIndex) => `Entry #${entryIndex + 1}. No positions held`,
  'contributions.description': (entryIndex) => `Entry #${entryIndex + 1}. Describe your contributions to this organization`,
  'contributions.noContributionsMade': (entryIndex) => `Entry #${entryIndex + 1}. No contributions made`,

  involvementDescription: (entryIndex) => `Entry #${entryIndex + 1}. Describe the nature and reasons for your involvement`,
  activityDescription: (entryIndex) => `Entry #${entryIndex + 1}. Describe the nature and reasons for the activity`,
  advocacyReason: (entryIndex) => `Entry #${entryIndex + 1}. Provide the reason(s) for advocating acts of terrorism`,
  explanation: (entryIndex) => `Entry #${entryIndex + 1}. Provide explanation`
};

// ============================================================================
// RADIO BUTTON FIELD ID MAPPING
// ============================================================================

/**
 * Returns the correct radio button field ID for a given subsection
 * Uses the exact field IDs from section-29.json reference
 */
const getRadioButtonFieldId = (subsectionKey: SubsectionKey, fieldType: FieldType): string | null => {
  // Only handle radio button fields
  if (fieldType !== 'hasAssociation' && fieldType !== 'hasActivity') {
    return null;
  }

  switch (subsectionKey) {
    case 'terrorismOrganizations':
      return SECTION29_RADIO_FIELD_IDS.TERRORISM_ORGANIZATIONS; // "16435 0 R"

    case 'terrorismActivities':
      return SECTION29_RADIO_FIELD_IDS.TERRORISM_ACTIVITIES; // "16433 0 R"

    case 'terrorismAdvocacy':
      return SECTION29_RADIO_FIELD_IDS.TERRORISM_ADVOCACY; // "16434 0 R"

    case 'violentOverthrowOrganizations':
      return SECTION29_RADIO_FIELD_IDS.VIOLENT_OVERTHROW_ORGANIZATIONS; // "16430 0 R"

    case 'violenceForceOrganizations':
      return SECTION29_RADIO_FIELD_IDS.VIOLENCE_FORCE_ORGANIZATIONS; // "16428 0 R"

    case 'overthrowActivities':
      return SECTION29_RADIO_FIELD_IDS.OVERTHROW_ACTIVITIES; // "16425 0 R"

    case 'terrorismAssociations':
      return SECTION29_RADIO_FIELD_IDS.TERRORISM_ASSOCIATIONS; // "16426 0 R"

    case 'overthrowActivitiesAndAssociations':
      // Legacy combined subsection - use the appropriate field based on field type
      if (fieldType === 'hasActivity') {
        return SECTION29_RADIO_FIELD_IDS.OVERTHROW_ACTIVITIES; // "16425 0 R"
      } else if (fieldType === 'hasAssociation') {
        return SECTION29_RADIO_FIELD_IDS.TERRORISM_ASSOCIATIONS; // "16426 0 R"
      }
      break;

    default:
      return null;
  }

  return null;
};

// ============================================================================
// MAIN GENERATION FUNCTIONS
// ============================================================================

/**
 * Generates a unique field ID that matches PDF field naming patterns
 * Returns numeric PDF field ID when available, falls back to field name
 *
 * @param subsectionKey - The subsection this field belongs to
 * @param entryIndex - The entry index within the subsection (0-based)
 * @param fieldType - The type of field being generated
 * @returns A unique field ID string (numeric ID preferred, field name as fallback)
 */
export const generateFieldId = (
  subsectionKey: SubsectionKey,
  entryIndex: number,
  fieldType: FieldType
): string => {

  console.log(`🔍 generateFieldId called: subsectionKey="${subsectionKey}", entryIndex=${entryIndex}, fieldType="${fieldType}"`);

  // PRIORITY 1: Check for radio button fields first (use exact PDF field IDs)
  const radioButtonFieldId = getRadioButtonFieldId(subsectionKey, fieldType);
  if (radioButtonFieldId) {
    console.log(`🎯 Using exact radio button field ID: ${radioButtonFieldId} for ${subsectionKey}.${fieldType}`);
    return radioButtonFieldId;
  }

  // PRIORITY 2: Get the correct subsection pattern based on subsection key and entry index
  const subsectionPattern = getSubsectionPattern(subsectionKey, entryIndex);
  console.log(`📋 Subsection pattern: "${subsectionPattern}"`);

  // Use the new subsection-aware field mapping with subsectionKey for radio buttons
  const field = getFieldBySubsectionAndType(subsectionPattern, fieldType, entryIndex, subsectionKey);

  if (field) {
    console.log(`✅ Found actual PDF field for ${subsectionKey}.${fieldType}[${entryIndex}]: ${field.name}`);

    // Try to get numeric ID first (preferred for ID-based mapping)
    const numericId = getNumericFieldId(field.name);
    if (numericId) {
      console.log(`🔢 Using numeric ID: ${numericId} (from field name: ${field.name})`);
      return numericId;
    } else {
      console.log(`📛 No numeric ID available, using field name: ${field.name}`);
      return field.name;
    }
  }

  // Fallback to the old pattern-based approach with detailed logging
  console.warn(`⚠️ No PDF field found for ${subsectionKey}.${fieldType}[${entryIndex}] in ${subsectionPattern}`);
  console.warn(`Available suggestions:`, getFieldSuggestions(fieldType));

  // TEMPORARY FIX: Use known correct field names for common cases
  if (subsectionKey === 'terrorismOrganizations') {
    if (fieldType === 'hasAssociation') {
      const fixedFieldName = 'form1[0].Section29[0].RadioButtonList[0]';
      console.log(`🔧 TEMPORARY FIX: Using known field name for terrorismOrganizations.hasAssociation`);

      // Try to get numeric ID for the fixed field name
      const numericId = getNumericFieldId(fixedFieldName);
      if (numericId) {
        console.log(`🔢 Using numeric ID: ${numericId} (from fixed field name: ${fixedFieldName})`);
        return numericId;
      }
      return fixedFieldName;
    }
    if (fieldType === 'organizationName') {
      const nameFieldIndex = entryIndex === 0 ? '1' : '8';
      const fixedFieldName = `form1[0].Section29[0].TextField11[${nameFieldIndex}]`;
      console.log(`🔧 TEMPORARY FIX: Using known field name for terrorismOrganizations.organizationName[${entryIndex}]: ${fixedFieldName}`);

      // Try to get numeric ID for the fixed field name
      const numericId = getNumericFieldId(fixedFieldName);
      if (numericId) {
        console.log(`🔢 Using numeric ID: ${numericId} (from fixed field name: ${fixedFieldName})`);
        return numericId;
      }
      return fixedFieldName;
    }
    if (fieldType === 'address.street') {
      const streetArea = entryIndex === 0 ? '1' : '3';
      const streetField = entryIndex === 0 ? '4' : '11';
      const fixedFieldName = `form1[0].Section29[0].#area[${streetArea}].TextField11[${streetField}]`;
      console.log(`🔧 TEMPORARY FIX: Using known field name for terrorismOrganizations.address.street[${entryIndex}]: ${fixedFieldName}`);

      // Try to get numeric ID for the fixed field name
      const numericId = getNumericFieldId(fixedFieldName);
      if (numericId) {
        console.log(`🔢 Using numeric ID: ${numericId} (from fixed field name: ${fixedFieldName})`);
        return numericId;
      }
      return fixedFieldName;
    }
  }

  // Use the old pattern as fallback
  const subsectionPrefix = SUBSECTION_PDF_MAP[subsectionKey];
  const fieldPattern = FIELD_PATTERN_MAP[fieldType];

  if (!fieldPattern) {
    throw new Error(`Unknown field type: ${fieldType}`);
  }

  const fieldSuffix = fieldPattern(entryIndex);
  const fallbackFieldName = `form1[0].${subsectionPrefix}.${fieldSuffix}`;

  console.warn(`Using fallback pattern: ${fallbackFieldName}`);

  // Try to get numeric ID for the fallback field name
  const numericId = getNumericFieldId(fallbackFieldName);
  if (numericId) {
    console.log(`🔢 Using numeric ID: ${numericId} (from fallback field name: ${fallbackFieldName})`);
    return numericId;
  }

  return fallbackFieldName;
};

/**
 * Generates a human-readable label for a field
 *
 * @param fieldType - The type of field being generated
 * @param entryIndex - The entry index within the subsection (0-based)
 * @returns A human-readable label string
 */
export const generateFieldLabel = (
  fieldType: FieldType,
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
export const getFieldInputType = (fieldType: FieldType): string => {
  if (fieldType === 'hasAssociation' || fieldType === 'hasActivity') {
    return 'radio';
  }

  if (fieldType.includes('estimated') || fieldType.includes('noPositions') ||
      fieldType.includes('noContributions') || fieldType === 'dateRange.present') {
    return 'checkbox';
  }

  if (fieldType.includes('date')) {
    return 'month'; // Month/Year input
  }

  if (fieldType.includes('state') || fieldType.includes('country')) {
    return 'select';
  }

  if (fieldType.includes('description') || fieldType.includes('explanation') ||
      fieldType === 'involvementDescription' || fieldType === 'activityDescription') {
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
  const pattern = /^form1\[0\]\.Section29(_\d+)?\[0\]\..+$/;
  return pattern.test(fieldId);
};
