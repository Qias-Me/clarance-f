/**
 * Section 5 Field Mapping - Maps logical field paths to actual PDF field names
 * 
 * This module provides field mapping functionality for Section 5 (Other Names Used)
 * based on the actual PDF field data from section-5.json reference file.
 * 
 * Structure:
 * - Main question: RadioButtonList[0] (Have you used other names?)
 * - Entry 1: TextField11[2,1,0], suffix[0], dates, checkboxes
 * - Entry 2: TextField11[6,5,4], suffix[1], dates, checkboxes  
 * - Entry 3: TextField11[10,9,8], suffix[2], dates, checkboxes
 * - Entry 4: TextField11[14,13,12], suffix[3], dates, checkboxes
 */

import section5Data from '../../../../api/sections-references/section-5.json';

// Type definitions for Section 5 field data
interface Section5Field {
  id: string;
  name: string;
  value?: any;
  page: number;
  label: string;
  type: string;
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
  wasMovedByHealing: boolean;
  isExplicitlyDetected: boolean;
  uniqueId: string;
}

interface Section5JsonData {
  metadata: any;
  fields: Section5Field[];
  fieldsBySubsection: Record<string, Section5Field[]>;
  fieldsByEntry: Record<string, Section5Field[]>;
  statistics: any;
}

// Load the actual field data
const section5Fields: Section5Field[] = (section5Data as Section5JsonData).fields;

// Create field name to data mapping
const fieldNameToDataMap = new Map<string, Section5Field>();
section5Fields.forEach(field => {
  fieldNameToDataMap.set(field.name, field);
});

// Create field ID to data mapping
const fieldIdToDataMap = new Map<string, Section5Field>();
section5Fields.forEach(field => {
  // Extract numeric ID from "9502 0 R" format
  const numericId = field.id.replace(' 0 R', '');
  fieldIdToDataMap.set(numericId, field);
});

/**
 * Section 5 Field Mappings - Maps logical field paths to actual PDF field names
 * 
 * Pattern Analysis from section-5.json:
 * - Main question: form1[0].Sections1-6[0].section5[0].RadioButtonList[0]
 * - Entry N fields follow patterns with incremental indices
 */
export const SECTION5_FIELD_MAPPINGS = {
  // Main question: Have you used other names?
  'section5.hasOtherNames.value': 'form1[0].Sections1-6[0].section5[0].RadioButtonList[0]',
  
  // Entry 1 fields (indices: 2,1,0 for TextField11, 0 for others)
  'section5.otherNames.0.lastName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[2]',
  'section5.otherNames.0.firstName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[1]',
  'section5.otherNames.0.middleName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[0]',
  'section5.otherNames.0.suffix.value': 'form1[0].Sections1-6[0].section5[0].suffix[0]',
  'section5.otherNames.0.from.value': 'form1[0].Sections1-6[0].section5[0].#area[0].From_Datefield_Name_2[0]',
  'section5.otherNames.0.to.value': 'form1[0].Sections1-6[0].section5[0].#area[0].To_Datefield_Name_2[0]',
  'section5.otherNames.0.reasonChanged.value': 'form1[0].Sections1-6[0].section5[0].TextField11[3]',
  'section5.otherNames.0.present.value': 'form1[0].Sections1-6[0].section5[0].#field[9]',
  
  // Entry 2 fields (indices: 6,5,4 for TextField11, 1 for others)
  'section5.otherNames.1.lastName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[6]',
  'section5.otherNames.1.firstName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[5]',
  'section5.otherNames.1.middleName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[4]',
  'section5.otherNames.1.suffix.value': 'form1[0].Sections1-6[0].section5[0].suffix[1]',
  'section5.otherNames.1.from.value': 'form1[0].Sections1-6[0].section5[0].#area[1].From_Datefield_Name_2[1]',
  'section5.otherNames.1.to.value': 'form1[0].Sections1-6[0].section5[0].#area[1].To_Datefield_Name_2[1]',
  'section5.otherNames.1.reasonChanged.value': 'form1[0].Sections1-6[0].section5[0].TextField11[7]',
  'section5.otherNames.1.present.value': 'form1[0].Sections1-6[0].section5[0].#field[19]',
  
  // Entry 3 fields (indices: 10,9,8 for TextField11, 2 for others)
  'section5.otherNames.2.lastName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[10]',
  'section5.otherNames.2.firstName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[9]',
  'section5.otherNames.2.middleName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[8]',
  'section5.otherNames.2.suffix.value': 'form1[0].Sections1-6[0].section5[0].suffix[2]',
  'section5.otherNames.2.from.value': 'form1[0].Sections1-6[0].section5[0].#area[2].From_Datefield_Name_2[2]',
  'section5.otherNames.2.to.value': 'form1[0].Sections1-6[0].section5[0].#area[2].To_Datefield_Name_2[2]',
  'section5.otherNames.2.reasonChanged.value': 'form1[0].Sections1-6[0].section5[0].TextField11[11]',
  'section5.otherNames.2.present.value': 'form1[0].Sections1-6[0].section5[0].#field[29]',
  
  // Entry 4 fields (indices: 14,13,12 for TextField11, 3 for others)
  'section5.otherNames.3.lastName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[14]',
  'section5.otherNames.3.firstName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[13]',
  'section5.otherNames.3.middleName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[12]',
  'section5.otherNames.3.suffix.value': 'form1[0].Sections1-6[0].section5[0].suffix[3]',
  'section5.otherNames.3.from.value': 'form1[0].Sections1-6[0].section5[0].#area[3].From_Datefield_Name_2[3]',
  'section5.otherNames.3.to.value': 'form1[0].Sections1-6[0].section5[0].#area[3].To_Datefield_Name_2[3]',
  'section5.otherNames.3.reasonChanged.value': 'form1[0].Sections1-6[0].section5[0].TextField11[15]',
  'section5.otherNames.3.present.value': 'form1[0].Sections1-6[0].section5[0].#field[39]',
} as const;

/**
 * Map a logical field path to the actual PDF field name
 */
export function mapLogicalFieldToPdfField(logicalPath: string): string {
  return SECTION5_FIELD_MAPPINGS[logicalPath as keyof typeof SECTION5_FIELD_MAPPINGS] || logicalPath;
}

/**
 * Get field metadata for a logical field path
 */
export function getFieldMetadata(logicalPath: string): Section5Field | undefined {
  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  return getPdfFieldByName(pdfFieldName);
}

/**
 * Get PDF field by name
 */
export function getPdfFieldByName(fieldName: string): Section5Field | undefined {
  return fieldNameToDataMap.get(fieldName);
}

/**
 * Get PDF field by ID
 */
export function getPdfFieldById(fieldId: string): Section5Field | undefined {
  return fieldIdToDataMap.get(fieldId);
}

/**
 * Get numeric field ID from field name (for ID-based mapping)
 */
export function getNumericFieldId(fieldName: string): string | null {
  const field = getPdfFieldByName(fieldName);
  if (field) {
    return field.id.replace(' 0 R', '');
  }
  return null;
}

/**
 * Validate that a field exists in the sections-references data
 */
export function validateFieldExists(fieldName: string): boolean {
  return fieldNameToDataMap.has(fieldName);
}

/**
 * Get all available field names for debugging
 */
export function getAllFieldNames(): string[] {
  return Array.from(fieldNameToDataMap.keys());
}

/**
 * Find similar field names for debugging purposes
 */
export function findSimilarFieldNames(targetName: string, maxResults: number = 5): string[] {
  const allNames = getAllFieldNames();
  const similar = allNames
    .filter(name => name.includes('section5') || name.includes('TextField11') || name.includes('suffix'))
    .slice(0, maxResults);
  return similar;
}

/**
 * Check if a field path is a valid Section 5 field
 */
export function isValidSection5Field(fieldPath: string): boolean {
  return fieldPath in SECTION5_FIELD_MAPPINGS;
}

/**
 * Get all logical field paths for Section 5
 */
export function getAllLogicalFieldPaths(): string[] {
  return Object.keys(SECTION5_FIELD_MAPPINGS);
}

/**
 * Generate dynamic field path for a specific entry index
 */
export function generateEntryFieldPath(entryIndex: number, fieldName: string): string {
  return `section5.otherNames.${entryIndex}.${fieldName}.value`;
}

/**
 * Get PDF field name for a specific entry and field
 */
export function getEntryFieldName(entryIndex: number, fieldName: string): string | null {
  const logicalPath = generateEntryFieldPath(entryIndex, fieldName);
  return mapLogicalFieldToPdfField(logicalPath);
}
