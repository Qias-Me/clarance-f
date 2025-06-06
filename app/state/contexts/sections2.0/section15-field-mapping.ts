/**
 * Section 15 Field Mapping - Maps logical field paths to actual PDF field names
 *
 * This module provides mapping between the logical field paths used in the Section 15
 * component and the actual complex field names found in the sections-references JSON.
 */

import section15Data from '../../../../api/sections-references/section-15.json';

// Type definitions for Section 15 field data
interface Section15Field {
  id: string;
  name: string;
  value: string;
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
  reason?: string;
  uniqueId: string;
}

interface Section15JsonData {
  metadata: any;
  fields: Section15Field[];
  fieldsBySubsection: Record<string, Section15Field[]>;
  fieldsByEntry: Record<string, Section15Field[]>;
  statistics: any;
}

// Load the actual field data
const section15Fields: Section15Field[] = (section15Data as Section15JsonData).fields;

// Create a mapping from field names to field data
const fieldNameToDataMap = new Map<string, Section15Field>();
section15Fields.forEach(field => {
  fieldNameToDataMap.set(field.name, field);
});

// Create a mapping from field IDs to field data
const fieldIdToDataMap = new Map<string, Section15Field>();
section15Fields.forEach(field => {
  // Extract numeric ID from "17088 0 R" format
  const numericId = field.id.replace(' 0 R', '');
  fieldIdToDataMap.set(numericId, field);
});

/**
 * Section 15 Field Mappings - Maps logical field paths to actual PDF field names
 * 
 * Structure:
 * - Section 15.1: Military Service (Section14_1 fields)
 * - Section 15.2: Disciplinary Procedures (Section15_2 fields)  
 * - Section 15.3: Foreign Military Service (Section15_3 fields)
 */
export const SECTION15_FIELD_MAPPINGS = {
  // Main military service question
  'section15.militaryService.hasServed.value': 'form1[0].Section14_1[0].#area[4].RadioButtonList[1]',
  
  // Military Service Entry 1 (Section14_1 fields)
  'section15.militaryService.0.branch.value': 'form1[0].Section14_1[0].#area[5].#area[6].RadioButtonList[2]',
  'section15.militaryService.0.status.value': 'form1[0].Section14_1[0].#area[19].#field[27]', // Active Duty
  'section15.militaryService.0.serviceNumber.value': 'form1[0].Section14_1[0].TextField11[3]',
  'section15.militaryService.0.startDate.value': 'form1[0].Section14_1[0].#area[8].From_Datefield_Name_2[0]',
  'section15.militaryService.0.endDate.value': 'form1[0].Section14_1[0].#area[8].From_Datefield_Name_2[1]',
  'section15.militaryService.0.isStartDateEstimated.value': 'form1[0].Section14_1[0].#area[8].#field[7]',
  'section15.militaryService.0.isEndDateEstimated.value': 'form1[0].Section14_1[0].#area[8].#field[10]',
  'section15.militaryService.0.dischargeType.value': 'form1[0].Section14_1[0].#area[10].RadioButtonList[5]',
  'section15.militaryService.0.dischargeReason.value': 'form1[0].Section14_1[0].TextField11[5]',
  
  // Military Service Entry 2 (Section14_1 fields with different indices)
  'section15.militaryService.1.branch.value': 'form1[0].Section14_1[0].#area[12].RadioButtonList[7]',
  'section15.militaryService.1.status.value': 'form1[0].Section14_1[0].#area[19].#field[28]', // Active Reserve
  'section15.militaryService.1.serviceNumber.value': 'form1[0].Section14_1[0].TextField11[6]',
  'section15.militaryService.1.startDate.value': 'form1[0].Section14_1[0].#area[16].From_Datefield_Name_2[3]',
  'section15.militaryService.1.endDate.value': 'form1[0].Section14_1[0].#area[16].From_Datefield_Name_2[4]',
  'section15.militaryService.1.isStartDateEstimated.value': 'form1[0].Section14_1[0].#area[16].#field[18]',
  'section15.militaryService.1.isEndDateEstimated.value': 'form1[0].Section14_1[0].#area[16].#field[20]',
  'section15.militaryService.1.dischargeType.value': 'form1[0].Section14_1[0].#area[18].RadioButtonList[11]',
  'section15.militaryService.1.dischargeReason.value': 'form1[0].Section14_1[0].TextField11[8]',

  // Disciplinary Procedures Entry 1 (Section15_2 fields)
  'section15.disciplinaryProcedures.hasDisciplinaryAction.value': 'form1[0].Section15_2[0].#area[0].RadioButtonList[0]',
  'section15.disciplinaryProcedures.0.date.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[0]',
  'section15.disciplinaryProcedures.0.isDateEstimated.value': 'form1[0].Section15_2[0].#field[2]',
  'section15.disciplinaryProcedures.0.offense.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[1]',
  'section15.disciplinaryProcedures.0.action.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[2]',
  'section15.disciplinaryProcedures.0.agency.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[3]',

  // Disciplinary Procedures Entry 2 (Section15_2 fields)
  'section15.disciplinaryProcedures.1.date.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[5]',
  'section15.disciplinaryProcedures.1.isDateEstimated.value': 'form1[0].Section15_2[0].#field[8]',
  'section15.disciplinaryProcedures.1.offense.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[6]',
  'section15.disciplinaryProcedures.1.action.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[7]',
  'section15.disciplinaryProcedures.1.agency.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[8]',

  // Foreign Military Service Entry 1 (Section15_3 fields)
  'section15.foreignMilitaryService.hasForeignService.value': 'form1[0].Section15_3[0].RadioButtonList[0]',
  'section15.foreignMilitaryService.0.country.value': 'form1[0].Section15_3[0].DropDownList29[0]',
  'section15.foreignMilitaryService.0.branch.value': 'form1[0].Section15_3[0].TextField11[0]',
  'section15.foreignMilitaryService.0.rank.value': 'form1[0].Section15_3[0].TextField11[1]',
  'section15.foreignMilitaryService.0.startDate.value': 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[0]',
  'section15.foreignMilitaryService.0.endDate.value': 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[1]',
  'section15.foreignMilitaryService.0.isStartDateEstimated.value': 'form1[0].Section15_3[0].#area[0].#field[3]',
  'section15.foreignMilitaryService.0.isEndDateEstimated.value': 'form1[0].Section15_3[0].#area[0].#field[5]',

  // Foreign Military Service Entry 2 (Section15_3 fields) - Contact information
  'section15.foreignMilitaryService.1.country.value': 'form1[0].Section15_3[0].#area[2].#area[3].DropDownList6[0]',
  'section15.foreignMilitaryService.1.branch.value': 'form1[0].Section15_3[0].#area[2].TextField11[8]', // First name
  'section15.foreignMilitaryService.1.rank.value': 'form1[0].Section15_3[0].#area[2].TextField11[7]', // Last name
  'section15.foreignMilitaryService.1.startDate.value': 'form1[0].Section15_3[0].#area[2].From_Datefield_Name_2[2]',
  'section15.foreignMilitaryService.1.endDate.value': 'form1[0].Section15_3[0].#area[2].From_Datefield_Name_2[3]',
  'section15.foreignMilitaryService.1.isStartDateEstimated.value': 'form1[0].Section15_3[0].#area[2].#field[23]',
  'section15.foreignMilitaryService.1.isEndDateEstimated.value': 'form1[0].Section15_3[0].#area[2].#field[25]',
} as const;

/**
 * Map a logical field path to the actual PDF field name
 */
export function mapLogicalFieldToPdfField(logicalPath: string): string {
  return SECTION15_FIELD_MAPPINGS[logicalPath as keyof typeof SECTION15_FIELD_MAPPINGS] || logicalPath;
}

/**
 * Get field metadata for a logical field path
 */
export function getFieldMetadata(logicalPath: string): Section15Field | undefined {
  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  return getPdfFieldByName(pdfFieldName);
}

/**
 * Get PDF field by name
 */
export function getPdfFieldByName(fieldName: string): Section15Field | undefined {
  return fieldNameToDataMap.get(fieldName);
}

/**
 * Get PDF field by ID
 */
export function getPdfFieldById(fieldId: string): Section15Field | undefined {
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
 * Find similar field names for debugging
 */
export function findSimilarFieldNames(searchTerm: string, limit: number = 5): string[] {
  const allFields = getAllFieldNames();
  return allFields
    .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, limit);
}
