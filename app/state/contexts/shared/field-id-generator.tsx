/**
 * Field ID Generation Utilities for SF-86 Form Architecture
 *
 * This module provides centralized field ID generation utilities that ensure
 * PDF compliance across all 30 sections. Based on the successful Section29
 * implementation and sectionizer JSON analysis.
 */

import type {
  SectionFieldConfig,
  SubsectionConfig,
  EntryFieldPattern,
  SectionId
} from './base-interfaces';

// ============================================================================
// SECTION FIELD CONFIGURATIONS
// ============================================================================

/**
 * Field ID patterns for all 30 sections based on sectionizer JSON analysis
 * Each section has specific patterns that must match the PDF structure exactly
 */
export const SECTION_FIELD_CONFIGS: Record<SectionId, SectionFieldConfig> = {
  section1: {
    sectionId: 'section1',
    prefix: 'Sections1-6[0]',
    subsections: {
      personalInfo: {
        prefix: 'Sections1-6[0]',
        simpleFields: {
          lastName: 'TextField11[0]',
          firstName: 'TextField11[1]',
          middleName: 'TextField11[2]',
          suffix: 'suffix[0]'
        }
      }
    }
  },

  section7: {
    sectionId: 'section7',
    prefix: 'Sections7-9[0]',
    subsections: {
      currentAddress: {
        prefix: 'Sections7-9[0]',
        simpleFields: {
          street: 'TextField11[13]',
          city: 'TextField11[14]',
          state: 'School6_State[0]',
          zipCode: 'TextField11[15]',
          country: 'DropDownList[0]'
        }
      },
      previousAddresses: {
        prefix: 'Section7_1[0]',
        entryPatterns: {
          'address.street': {
            pattern: (entryIndex) => `TextField11[${entryIndex * 5}]`,
            fieldType: 'text',
            label: (entryIndex) => `Previous Address #${entryIndex + 1} Street`
          },
          'address.city': {
            pattern: (entryIndex) => `TextField11[${entryIndex * 5 + 1}]`,
            fieldType: 'text',
            label: (entryIndex) => `Previous Address #${entryIndex + 1} City`
          },
          'dateRange.from': {
            pattern: (entryIndex) => `From_Datefield_Name_2[${entryIndex * 2}]`,
            fieldType: 'date',
            label: (entryIndex) => `Previous Address #${entryIndex + 1} From Date`
          }
        }
      }
    }
  },

  section29: {
    sectionId: 'section29',
    prefix: 'Section29[0]',
    subsections: {
      terrorismOrganizations: {
        prefix: 'Section29[0]',
        entryPatterns: {
          organizationName: {
            pattern: (entryIndex) => `TextField11[${entryIndex === 0 ? 1 : 8}]`,
            fieldType: 'text',
            label: (entryIndex) => `Entry #${entryIndex + 1}. Provide the full name of the organization.`
          },
          'address.street': {
            pattern: (entryIndex) => `#area[${entryIndex === 0 ? 1 : 3}].TextField11[${entryIndex === 0 ? 4 : 11}]`,
            fieldType: 'text',
            label: (entryIndex) => `Organization Address Street`
          },
          'address.city': {
            pattern: (entryIndex) => `#area[${entryIndex === 0 ? 1 : 3}].TextField11[${entryIndex === 0 ? 5 : 12}]`,
            fieldType: 'text',
            label: (entryIndex) => `Organization Address City`
          },
          'address.state': {
            pattern: (entryIndex) => `#area[${entryIndex === 0 ? 1 : 3}].School6_State[0]`,
            fieldType: 'select',
            label: (entryIndex) => `Organization Address State`
          },
          'address.zipCode': {
            pattern: (entryIndex) => `#area[${entryIndex === 0 ? 1 : 3}].TextField11[${entryIndex === 0 ? 6 : 13}]`,
            fieldType: 'text',
            label: (entryIndex) => `Organization Address Zip Code`
          },
          'address.country': {
            pattern: (entryIndex) => `#area[${entryIndex === 0 ? 1 : 3}].DropDownList6[0]`,
            fieldType: 'select',
            label: (entryIndex) => `Organization Address Country`
          },
          'dateRange.from': {
            pattern: (entryIndex) => `From_Datefield_Name_2[${entryIndex * 2}]`,
            fieldType: 'date',
            label: (entryIndex) => `Involvement From Date`
          },
          'dateRange.to': {
            pattern: (entryIndex) => `From_Datefield_Name_2[${entryIndex * 2 + 1}]`,
            fieldType: 'date',
            label: (entryIndex) => `Involvement To Date`
          },
          positions: {
            pattern: (entryIndex) => `TextField11[${entryIndex === 0 ? 0 : 7}]`,
            fieldType: 'textarea',
            label: (entryIndex) => `Positions held in the organization`
          },
          contributions: {
            pattern: (entryIndex) => `TextField11[${entryIndex === 0 ? 2 : 9}]`,
            fieldType: 'textarea',
            label: (entryIndex) => `Contributions made to the organization`
          },
          involvement: {
            pattern: (entryIndex) => `TextField11[${entryIndex === 0 ? 3 : 10}]`,
            fieldType: 'textarea',
            label: (entryIndex) => `Nature and reasons for involvement`
          }
        },
        simpleFields: {
          hasFlag: 'RadioButtonList[0]'
        }
      },
      terrorismActivities: {
        prefix: 'Section29_2[0]',
        entryPatterns: {
          activityDescription: {
            pattern: (entryIndex) => `TextField11[${entryIndex}]`,
            fieldType: 'textarea',
            label: (entryIndex) => `Activity Description #${entryIndex + 1}`
          }
        },
        simpleFields: {
          hasFlag: 'RadioButtonList[0]'
        }
      }
    }
  },

  // Placeholder configurations for other sections (to be implemented)
  section2: { sectionId: 'section2', prefix: 'Section2[0]', subsections: {} },
  section3: { sectionId: 'section3', prefix: 'Section3[0]', subsections: {} },
  section4: { sectionId: 'section4', prefix: 'Section4[0]', subsections: {} },
  section5: { sectionId: 'section5', prefix: 'Section5[0]', subsections: {} },
  section6: { sectionId: 'section6', prefix: 'Section6[0]', subsections: {} },
  section8: { sectionId: 'section8', prefix: 'Section8[0]', subsections: {} },
  section9: { sectionId: 'section9', prefix: 'Section9[0]', subsections: {} },
  section10: { sectionId: 'section10', prefix: 'Section10[0]', subsections: {} },
  section11: { sectionId: 'section11', prefix: 'Section11[0]', subsections: {} },
  section12: { sectionId: 'section12', prefix: 'Section12[0]', subsections: {} },
  section13: { sectionId: 'section13', prefix: 'Section13[0]', subsections: {} },
  section14: { sectionId: 'section14', prefix: 'Section14[0]', subsections: {} },
  section15: { sectionId: 'section15', prefix: 'Section15[0]', subsections: {} },
  section16: { sectionId: 'section16', prefix: 'Section16[0]', subsections: {} },
  section17: { sectionId: 'section17', prefix: 'Section17[0]', subsections: {} },
  section18: { sectionId: 'section18', prefix: 'Section18[0]', subsections: {} },
  section19: { sectionId: 'section19', prefix: 'Section19[0]', subsections: {} },
  section20: { sectionId: 'section20', prefix: 'Section20[0]', subsections: {} },
  section21: { sectionId: 'section21', prefix: 'Section21[0]', subsections: {} },
  section22: { sectionId: 'section22', prefix: 'Section22[0]', subsections: {} },
  section23: { sectionId: 'section23', prefix: 'Section23[0]', subsections: {} },
  section24: { sectionId: 'section24', prefix: 'Section24[0]', subsections: {} },
  section25: { sectionId: 'section25', prefix: 'Section25[0]', subsections: {} },
  section26: { sectionId: 'section26', prefix: 'Section26[0]', subsections: {} },
  section27: { sectionId: 'section27', prefix: 'Section27[0]', subsections: {} },
  section28: { sectionId: 'section28', prefix: 'Section28[0]', subsections: {} },
  section30: { sectionId: 'section30', prefix: 'Section30[0]', subsections: {} }
};

// ============================================================================
// FIELD ID GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate a complete field ID for any section field
 *
 * @param sectionId - The section identifier (e.g., 'section29')
 * @param subsectionKey - The subsection key (e.g., 'terrorismOrganizations')
 * @param fieldType - The field type (e.g., 'organizationName', 'address.street')
 * @param entryIndex - The entry index (0-based) for entry fields
 * @returns Complete PDF-compliant field ID
 */
export function generateFieldId(
  sectionId: SectionId,
  subsectionKey: string,
  fieldType: string,
  entryIndex?: number
): string {
  const sectionConfig = SECTION_FIELD_CONFIGS[sectionId];
  if (!sectionConfig) {
    throw new Error(`Section configuration not found for: ${sectionId}`);
  }

  const subsectionConfig = sectionConfig.subsections[subsectionKey];
  if (!subsectionConfig) {
    throw new Error(`Subsection configuration not found for: ${sectionId}.${subsectionKey}`);
  }

  // Handle simple fields (no entry index)
  if (subsectionConfig.simpleFields && subsectionConfig.simpleFields[fieldType]) {
    const fieldPattern = subsectionConfig.simpleFields[fieldType];
    return `form1[0].${subsectionConfig.prefix}.${fieldPattern}`;
  }

  // Handle entry fields (with entry index)
  if (subsectionConfig.entryPatterns && subsectionConfig.entryPatterns[fieldType]) {
    if (entryIndex === undefined) {
      throw new Error(`Entry index required for field type: ${fieldType}`);
    }

    const entryPattern = subsectionConfig.entryPatterns[fieldType];
    const fieldPattern = entryPattern.pattern(entryIndex);
    return `form1[0].${subsectionConfig.prefix}.${fieldPattern}`;
  }

  throw new Error(`Field pattern not found for: ${sectionId}.${subsectionKey}.${fieldType}`);
}

/**
 * Validate a field ID against the expected pattern
 *
 * @param fieldId - The field ID to validate
 * @returns True if the field ID is valid
 */
export function validateFieldId(fieldId: string): boolean {
  // Basic validation: must start with form1[0] and contain section prefix
  const basicPattern = /^form1\[0\]\.Section\d+(_\d+)?\[0\]\./;
  return basicPattern.test(fieldId);
}

/**
 * Extract section information from a field ID
 *
 * @param fieldId - The field ID to parse
 * @returns Section information or null if invalid
 */
export function parseFieldId(fieldId: string): {
  sectionId: string;
  subsectionPrefix: string;
  fieldPattern: string;
} | null {
  const match = fieldId.match(/^form1\[0\]\.(Section\d+(?:_\d+)?)\[0\]\.(.+)$/);
  if (!match) return null;

  const [, subsectionPrefix, fieldPattern] = match;
  const sectionMatch = subsectionPrefix.match(/^Section(\d+)/);
  if (!sectionMatch) return null;

  const sectionNumber = parseInt(sectionMatch[1], 10);
  const sectionId = `section${sectionNumber}` as SectionId;

  return {
    sectionId,
    subsectionPrefix,
    fieldPattern
  };
}

/**
 * Get field pattern for a specific field type
 *
 * @param sectionId - The section identifier
 * @param subsectionKey - The subsection key
 * @param fieldType - The field type
 * @returns Field pattern function or string
 */
export function getFieldPattern(
  sectionId: SectionId,
  subsectionKey: string,
  fieldType: string
): ((entryIndex: number) => string) | string | null {
  const sectionConfig = SECTION_FIELD_CONFIGS[sectionId];
  if (!sectionConfig) return null;

  const subsectionConfig = sectionConfig.subsections[subsectionKey];
  if (!subsectionConfig) return null;

  // Check simple fields first
  if (subsectionConfig.simpleFields && subsectionConfig.simpleFields[fieldType]) {
    return subsectionConfig.simpleFields[fieldType];
  }

  // Check entry patterns
  if (subsectionConfig.entryPatterns && subsectionConfig.entryPatterns[fieldType]) {
    return subsectionConfig.entryPatterns[fieldType].pattern;
  }

  return null;
}

/**
 * Get all field types for a subsection
 *
 * @param sectionId - The section identifier
 * @param subsectionKey - The subsection key
 * @returns Array of field types available in the subsection
 */
export function getSubsectionFieldTypes(
  sectionId: SectionId,
  subsectionKey: string
): string[] {
  const sectionConfig = SECTION_FIELD_CONFIGS[sectionId];
  if (!sectionConfig) return [];

  const subsectionConfig = sectionConfig.subsections[subsectionKey];
  if (!subsectionConfig) return [];

  const simpleFields = Object.keys(subsectionConfig.simpleFields || {});
  const entryFields = Object.keys(subsectionConfig.entryPatterns || {});

  return [...simpleFields, ...entryFields];
}

/**
 * Check if a field type requires an entry index
 *
 * @param sectionId - The section identifier
 * @param subsectionKey - The subsection key
 * @param fieldType - The field type
 * @returns True if the field type requires an entry index
 */
export function requiresEntryIndex(
  sectionId: SectionId,
  subsectionKey: string,
  fieldType: string
): boolean {
  const sectionConfig = SECTION_FIELD_CONFIGS[sectionId];
  if (!sectionConfig) return false;

  const subsectionConfig = sectionConfig.subsections[subsectionKey];
  if (!subsectionConfig) return false;

  // If it's in entryPatterns, it requires an entry index
  return !!(subsectionConfig.entryPatterns && subsectionConfig.entryPatterns[fieldType]);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate field IDs for all fields in an entry
 *
 * @param sectionId - The section identifier
 * @param subsectionKey - The subsection key
 * @param entryIndex - The entry index
 * @returns Object with field types as keys and field IDs as values
 */
export function generateEntryFieldIds(
  sectionId: SectionId,
  subsectionKey: string,
  entryIndex: number
): Record<string, string> {
  const fieldTypes = getSubsectionFieldTypes(sectionId, subsectionKey);
  const fieldIds: Record<string, string> = {};

  for (const fieldType of fieldTypes) {
    if (requiresEntryIndex(sectionId, subsectionKey, fieldType)) {
      fieldIds[fieldType] = generateFieldId(sectionId, subsectionKey, fieldType, entryIndex);
    }
  }

  return fieldIds;
}

/**
 * Generate field IDs for all simple fields in a subsection
 *
 * @param sectionId - The section identifier
 * @param subsectionKey - The subsection key
 * @returns Object with field types as keys and field IDs as values
 */
export function generateSubsectionFieldIds(
  sectionId: SectionId,
  subsectionKey: string
): Record<string, string> {
  const fieldTypes = getSubsectionFieldTypes(sectionId, subsectionKey);
  const fieldIds: Record<string, string> = {};

  for (const fieldType of fieldTypes) {
    if (!requiresEntryIndex(sectionId, subsectionKey, fieldType)) {
      fieldIds[fieldType] = generateFieldId(sectionId, subsectionKey, fieldType);
    }
  }

  return fieldIds;
}
