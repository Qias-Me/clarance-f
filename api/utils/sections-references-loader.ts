/**
 * Sections References Loader - DRY Solution for Field Data (API Utils)
 *
 * This utility loads field data from the sections-references JSON files to eliminate
 * hardcoded values in section interfaces and contexts. Located in api/utils for
 * proper access by both api/interfaces and app/state/contexts.
 */

// Import all sections-references JSON files (relative to api/utils)
import section1Data from '../interfaces/sections-references/section-1.json';
import section2Data from '../interfaces/sections-references/section-2.json';
import section4Data from '../interfaces/sections-references/section-4.json';
import section3Data from '../interfaces/sections-references/section-3.json';
import section5Data from '../interfaces/sections-references/section-5.json';
import section6Data from '../interfaces/sections-references/section-6.json';
import section7Data from '../interfaces/sections-references/section-7.json';
import section8Data from '../interfaces/sections-references/section-8.json';
import section9Data from '../interfaces/sections-references/section-9.json';
import section10Data from '../interfaces/sections-references/section-10.json';
import section11Data from '../interfaces/sections-references/section-11.json';
import section12Data from '../interfaces/sections-references/section-12.json';
import section13Data from '../interfaces/sections-references/section-13.json';
import section14Data from '../interfaces/sections-references/section-14.json';
import section15Data from '../interfaces/sections-references/section-15.json';

import section27Data from '../interfaces/sections-references/section-27.json';
import section28Data from '../interfaces/sections-references/section-28.json';
import section29Data from '../interfaces/sections-references/section-29.json';
import section30Data from '../interfaces/sections-references/section-30.json';

// ============================================================================
// TYPES
// ============================================================================

export interface FieldReference {
  id: string;
  name: string;
  page: number;
  label: string;
  type: 'PDFTextField' | 'PDFCheckBox' | 'PDFRadioGroup' | 'PDFDropdown';
  maxLength?: number;
  options?: string[];
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  section: number;
  confidence: number;
  uniqueId: string;
}

export interface SectionReference {
  metadata: {
    sectionId: number;
    sectionName: string;
    totalFields: number;
    subsectionCount: number;
    entryCount: number;
    exportDate: string;
    averageConfidence: number;
    pageRange: number[];
  };
  fields?: FieldReference[];
  fieldsByEntry?: Record<string, FieldReference[]>;
}

// ============================================================================
// SECTIONS REGISTRY
// ============================================================================

const sectionsRegistry: Record<number, SectionReference> = {
  1: section1Data as SectionReference,
  2: section2Data as SectionReference,
  3: section3Data as SectionReference,
  4: section4Data as SectionReference,
  5: section5Data as SectionReference,
  6: section6Data as SectionReference,
  7: section7Data as SectionReference,
  8: section8Data as SectionReference,
  9: section9Data as SectionReference,
  10: section10Data as SectionReference,
  11: section11Data as SectionReference,
  12: section12Data as SectionReference,
  13: section13Data as SectionReference,
  14: section14Data as SectionReference,
  15: section15Data as SectionReference,
  // 16: section16Data as SectionReference,
  // 17: section17Data as SectionReference,
  // 18: section18Data as SectionReference,
  // 19: section19Data as SectionReference,
  // 20: section20Data as SectionReference,
  // 21: section21Data as SectionReference,
  // 22: section22Data as SectionReference,
  // 23: section23Data as SectionReference,
  // 24: section24Data as SectionReference,
  // 25: section25Data as SectionReference,
  // 26: section26Data as SectionReference,
  27: section27Data as SectionReference,
  28: section28Data as SectionReference,
  29: section29Data as SectionReference,
  30: section30Data as SectionReference
};

// ============================================================================
// FIELD LOOKUP UTILITIES
// ============================================================================

/**
 * Get all fields for a specific section
 */
export function getSectionFields(sectionId: number): FieldReference[] {
  const sectionData = sectionsRegistry[sectionId];
  if (!sectionData) {
    throw new Error(`Section ${sectionId} not found in sections-references`);
  }

  // Handle both formats: direct fields array or fieldsByEntry object
  if (sectionData.fields) {
    return sectionData.fields;
  } else if (sectionData.fieldsByEntry) {
    // Flatten all entry arrays into a single fields array
    const allFields: FieldReference[] = [];
    Object.values(sectionData.fieldsByEntry).forEach(entryFields => {
      allFields.push(...entryFields);
    });
    return allFields;
  } else {
    throw new Error(`Section ${sectionId} has no fields or fieldsByEntry data`);
  }
}

/**
 * Get section metadata
 */
export function getSectionMetadata(sectionId: number) {
  const sectionData = sectionsRegistry[sectionId];
  if (!sectionData) {
    throw new Error(`Section ${sectionId} not found in sections-references`);
  }
  return sectionData.metadata;
}

/**
 * Find a field by its PDF field name
 */
export function findFieldByName(sectionId: number, fieldName: string): FieldReference | undefined {
  const fields = getSectionFields(sectionId);
  return fields.find(field => field.name === fieldName);
}

/**
 * Find a field by its ID (with or without ' 0 R' suffix)
 */
export function findFieldById(sectionId: number, fieldId: string): FieldReference | undefined {
  const fields = getSectionFields(sectionId);
  const cleanId = fieldId.replace(' 0 R', '');
  return fields.find(field => field.id.replace(' 0 R', '') === cleanId);
}

/**
 * Find fields by partial name match (useful for finding related fields)
 */
export function findFieldsByPartialName(sectionId: number, partialName: string): FieldReference[] {
  const fields = getSectionFields(sectionId);
  return fields.filter(field => field.name.includes(partialName));
}

/**
 * Get field by unique identifier
 */
export function findFieldByUniqueId(sectionId: number, uniqueId: string): FieldReference | undefined {
  const fields = getSectionFields(sectionId);
  return fields.find(field => field.uniqueId === uniqueId);
}

// ============================================================================
// FIELD CREATION UTILITIES (DRY)
// ============================================================================

/**
 * Create a Field<T> object from sections-references data
 * Fixed to match Field<T> interface requirements
 */
export function createFieldFromReference<T = any>(
  sectionId: number,
  fieldIdentifier: string,
  defaultValue: T
): {
  id: string;
  name: string;
  type: string;
  label: string;
  value: T;
  required: boolean;
  section: number;
  rect: { x: number; y: number; width: number; height: number };
} {
  // Try to find field by ID first, then by name, then by unique ID
  let fieldRef = findFieldById(sectionId, fieldIdentifier) ||
    findFieldByName(sectionId, fieldIdentifier) ||
    findFieldByUniqueId(sectionId, fieldIdentifier);

  if (!fieldRef) {
    console.warn(`Field not found in section ${sectionId}: ${fieldIdentifier}`);
    // Return a default field structure with proper Field<T> compliance
    return {
      id: fieldIdentifier, // Use the identifier as fallback ID
      name: fieldIdentifier, // Use the identifier as fallback name
      type: "PDFTextField", // Default type
      label: `Field ${fieldIdentifier}`, // Default label
      value: defaultValue,
      required: false, // Default to not required
      section: sectionId, // Set the section number
      rect: { x: 0, y: 0, width: 0, height: 0 } // Default rect
    };
  }

  return {
    id: fieldRef.id.replace(' 0 R', ''), // Remove ' 0 R' suffix for internal use
    name: fieldRef.name,
    type: fieldRef.type,
    label: fieldRef.label,
    value: defaultValue,
    required: false, // Add required field (default false)
    section: sectionId, // Add section field
    rect: fieldRef.rect
  };
}

/**
 * Create multiple fields from a list of identifiers
 */
export function createFieldsFromReferences<T = any>(
  sectionId: number,
  fieldMappings: Array<{ identifier: string; defaultValue: T }>
): Record<string, any> {
  const fields: Record<string, any> = {};

  fieldMappings.forEach(({ identifier, defaultValue }) => {
    const fieldKey = identifier.split('.').pop() || identifier; // Use last part as key
    fields[fieldKey] = createFieldFromReference(sectionId, identifier, defaultValue);
  });

  return fields;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate that a section has the expected number of fields
 */
export function validateSectionFieldCount(sectionId: number, expectedCount?: number): boolean {
  const metadata = getSectionMetadata(sectionId);
  const actualCount = metadata.totalFields;

  if (expectedCount && actualCount !== expectedCount) {
    console.error(`Section ${sectionId} field count mismatch: expected ${expectedCount}, got ${actualCount}`);
    return false;
  }

  // console.log(`Section ${sectionId} has ${actualCount} fields`);
  return true;
}

/**
 * Get expected field counts for validation
 */
export const EXPECTED_FIELD_COUNTS = {
  1: 4, // Will be determined from sections-references
  2: 2,
  3: 4, // Will be determined from sections-references
  6: 6, // Will be determined from sections-references
  7: 17,
  8: 10,
  9: 78,
  10: 122,
  11: 252,
  12: 150,
  13: 1086,
  14: 5,
  15: 95,
  16: 154,
  17: 332,
  18: 964,
  19: 277,
  20: 790,
  21: 486,
  22: 267,
  23: 191,
  24: 160,
  25: 79,
  26: 237,
  27: 57,
  28: 23,
  29: 141,
  30: 25
} as const;

/**
 * Validate all section field counts
 */
export function validateAllSectionFieldCounts(): Record<number, boolean> {
  const results: Record<number, boolean> = {};

  Object.entries(EXPECTED_FIELD_COUNTS).forEach(([sectionId, expectedCount]) => {
    const id = parseInt(sectionId);
    results[id] = validateSectionFieldCount(id, expectedCount);
  });

  return results;
}
<<<<<<< HEAD
=======

// ============================================================================
// SECTION-SPECIFIC UTILITIES
// ============================================================================

/**
 * Get Section 2 field references (Date of Birth)
 */
export function getSection2FieldReferences() {
  const fields = getSectionFields(2);
  return {
    dateField: fields.find(f => f.name.includes('From_Datefield_Name_2')),
    estimatedField: fields.find(f => f.name.includes('#field[18]'))
  };
}

// ============================================================================
// ADDITIONAL HELPER UTILITIES (used by Section 13 generator and validators)
// ============================================================================

/**
 * Validate that a field exists in a section by id/name/uniqueId
 */
export function validateFieldExists(identifier: string, sectionId: number = 13): boolean {
  const byId = findFieldById(sectionId, identifier);
  if (byId) return true;
  const byName = findFieldByName(sectionId, identifier);
  if (byName) return true;
  const byUnique = findFieldByUniqueId(sectionId, identifier);
  return !!byUnique;
}

/**
 * Get field metadata (FieldReference) by id/name/uniqueId if found
 */
export function getFieldMetadata(identifier: string, sectionId: number = 13) {
  return (
    findFieldById(sectionId, identifier) ||
    findFieldByName(sectionId, identifier) ||
    findFieldByUniqueId(sectionId, identifier)
  );
}

/**
 * Find similar field names (basic substring search) to assist mapping fixes
 */
export function findSimilarFieldNames(identifier: string, limit: number = 3, sectionId: number = 13): string[] {
  const fields = getSectionFields(sectionId);
  const needle = identifier.toLowerCase();
  const candidates = fields
    .map(f => f.name)
    .filter(name => name.toLowerCase().includes(needle) || needle.includes(name.toLowerCase()))
    .slice(0, limit);
  return candidates;
}

/**
 * Get the numeric field ID for an identifier if it exists in the section
 */
export function getNumericFieldId(identifier: string, sectionId: number = 13): string | undefined {
  const ref = getFieldMetadata(identifier, sectionId);
  return ref?.id?.replace(' 0 R', '');
}

/**
 * Get Section 29 field references by subsection
 */
export function getSection29FieldReferences() {
  const fields = getSectionFields(29);

  return {
    // 29.1: Terrorism Organizations
    terrorismOrganizations: fields.find(f => f.name === 'form1[0].Section29[0].RadioButtonList[0]'),

    // 29.2: Terrorism Activities
    terrorismActivities: fields.find(f => f.name === 'form1[0].Section29_2[0].RadioButtonList[0]'),

    // 29.3: Terrorism Advocacy
    terrorismAdvocacy: fields.find(f => f.name === 'form1[0].Section29_2[0].RadioButtonList[1]'),

    // 29.4: Violent Overthrow Organizations
    violentOverthrowOrganizations: fields.find(f => f.name === 'form1[0].Section29_3[0].RadioButtonList[0]'),

    // 29.5: Violence/Force Organizations
    violenceForceOrganizations: fields.find(f => f.name === 'form1[0].Section29_4[0].RadioButtonList[0]'),

    // 29.6: Overthrow Activities
    overthrowActivities: fields.find(f => f.name === 'form1[0].Section29_5[0].RadioButtonList[0]'),

    // 29.7: Terrorism Associations
    terrorismAssociations: fields.find(f => f.name === 'form1[0].Section29_5[0].RadioButtonList[1]')
  };
}

>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02
