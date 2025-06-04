/**
 * Section 18 Field Mapping - Load actual PDF field names from section-18.json
 *
 * This module loads the actual PDF field names and IDs from the section-18.json
 * reference file and provides mapping functions for Section 18 fields.
 *
 * Section 18 Structure:
 * - Relatives and Associates information
 * - Total: 964 fields across all subsections
 * - Maps logical field names to actual PDF field names from sections-reference
 */

import section18Data from '../../../../api/sections-references/section-18.json';

// Types for the JSON structure
interface Section18Field {
  id: string;
  name: string;
  page: number;
  label: string;
  type: string;
  options?: any[];
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  section: number;
  confidence: number;
  wasMovedByHealing: boolean;
  isExplicitlyDetected?: boolean;
  uniqueId: string;
}

interface Section18JsonData {
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
  fields: Section18Field[];
}

// Load the actual field data
const section18Fields: Section18Field[] = (section18Data as Section18JsonData).fields;

// Create a mapping from field names to field data
const fieldNameToDataMap = new Map<string, Section18Field>();
section18Fields.forEach(field => {
  fieldNameToDataMap.set(field.name, field);
});

// Create a mapping from field IDs to field data
const fieldIdToDataMap = new Map<string, Section18Field>();
section18Fields.forEach(field => {
  // Extract numeric ID from "16435 0 R" format
  const numericId = field.id.replace(' 0 R', '');
  fieldIdToDataMap.set(numericId, field);
});

/**
 * Get the actual PDF field data for a given field name
 */
export function getPdfFieldByName(fieldName: string): Section18Field | undefined {
  return fieldNameToDataMap.get(fieldName);
}

/**
 * Get the actual PDF field data for a given numeric field ID
 */
export function getPdfFieldById(fieldId: string): Section18Field | undefined {
  return fieldIdToDataMap.get(fieldId);
}

/**
 * Get all fields for Section 18
 */
export function getAllSection18Fields(): Section18Field[] {
  return section18Fields;
}

/**
 * Field mapping from logical names to PDF field names
 * Based on analysis of section-18.json structure
 */
export const SECTION18_FIELD_MAPPING = {
  // Entry 1 - Immediate Family - Core fields
  'section18.immediateFamily[0].fullName.lastName.value': 'form1[0].Section18_1[0].TextField11[2]',
  'section18.immediateFamily[0].fullName.firstName.value': 'form1[0].Section18_1[0].TextField11[3]',
  'section18.immediateFamily[0].fullName.middleName.value': 'form1[0].Section18_1[0].TextField11[1]',
  'section18.immediateFamily[0].fullName.suffix.value': 'form1[0].Section18_1[0].suffix[0]',
  'section18.immediateFamily[0].relationship.value': 'form1[0].Section18_1[0].DropDownList5[0]',
  'section18.immediateFamily[0].placeOfBirth.city.value': 'form1[0].Section18_1[0].TextField11[0]',
  'section18.immediateFamily[0].placeOfBirth.state.value': 'form1[0].Section18_1[0].School6_State[0]',
  'section18.immediateFamily[0].placeOfBirth.country.value': 'form1[0].Section18_1[0].DropDownList24[0]',
  'section18.immediateFamily[0].citizenship.value': 'form1[0].Section18_1[0].DropDownList12[0]',
  
  // Other names used fields
  'immediateFamily.0.otherNames.hasOtherNames': 'form1[0].Section18_1[0].RadioButtonList[0]',
  'immediateFamily.0.otherNames.notApplicable': 'form1[0].Section18_1[0].#field[2]',
  
  // Other names entries
  'immediateFamily.0.otherNames.names.0.lastName': 'form1[0].Section18_1[0].TextField11[5]',
  'immediateFamily.0.otherNames.names.0.firstName': 'form1[0].Section18_1[0].TextField11[6]',
  'immediateFamily.0.otherNames.names.0.middleName': 'form1[0].Section18_1[0].TextField11[4]',
  'immediateFamily.0.otherNames.names.0.suffix': 'form1[0].Section18_1[0].suffix[1]',
  'immediateFamily.0.otherNames.names.0.fromDate': 'form1[0].Section18_1[0].#area[0].From_Datefield_Name_2[0]',
  'immediateFamily.0.otherNames.names.0.toDate': 'form1[0].Section18_1[0].#area[0].To_Datefield_Name_2[0]',
  'immediateFamily.0.otherNames.names.0.reason': 'form1[0].Section18_1[0].TextField11[19]',
  
  // Additional name entries
  'immediateFamily.0.otherNames.names.1.lastName': 'form1[0].Section18_1[0].TextField11[9]',
  'immediateFamily.0.otherNames.names.1.firstName': 'form1[0].Section18_1[0].TextField11[8]',
  'immediateFamily.0.otherNames.names.1.middleName': 'form1[0].Section18_1[0].TextField11[7]',
  'immediateFamily.0.otherNames.names.1.suffix': 'form1[0].Section18_1[0].suffix[2]',
  'immediateFamily.0.otherNames.names.1.fromDate': 'form1[0].Section18_1[0].#area[1].From_Datefield_Name_2[1]',
  'immediateFamily.0.otherNames.names.1.toDate': 'form1[0].Section18_1[0].#area[1].To_Datefield_Name_2[1]',
  'immediateFamily.0.otherNames.names.1.reason': 'form1[0].Section18_1[0].TextField11[20]',
  
  // More name entries...
  'immediateFamily.0.otherNames.names.2.lastName': 'form1[0].Section18_1[0].TextField11[12]',
  'immediateFamily.0.otherNames.names.2.firstName': 'form1[0].Section18_1[0].TextField11[11]',
  'immediateFamily.0.otherNames.names.2.middleName': 'form1[0].Section18_1[0].TextField11[10]',
  'immediateFamily.0.otherNames.names.2.suffix': 'form1[0].Section18_1[0].suffix[3]',
  'immediateFamily.0.otherNames.names.2.fromDate': 'form1[0].Section18_1[0].#area[2].From_Datefield_Name_2[2]',
  'immediateFamily.0.otherNames.names.2.toDate': 'form1[0].Section18_1[0].#area[2].To_Datefield_Name_2[2]',
  'immediateFamily.0.otherNames.names.2.reason': 'form1[0].Section18_1[0].TextField11[21]',
  
  'immediateFamily.0.otherNames.names.3.lastName': 'form1[0].Section18_1[0].TextField11[15]',
  'immediateFamily.0.otherNames.names.3.firstName': 'form1[0].Section18_1[0].TextField11[14]',
  'immediateFamily.0.otherNames.names.3.middleName': 'form1[0].Section18_1[0].TextField11[13]',
  'immediateFamily.0.otherNames.names.3.suffix': 'form1[0].Section18_1[0].suffix[4]',
  'immediateFamily.0.otherNames.names.3.fromDate': 'form1[0].Section18_1[0].#area[3].From_Datefield_Name_2[3]',
  'immediateFamily.0.otherNames.names.3.toDate': 'form1[0].Section18_1[0].#area[3].To_Datefield_Name_2[3]',
  'immediateFamily.0.otherNames.names.3.reason': 'form1[0].Section18_1[0].TextField11[22]',
  
  'immediateFamily.0.otherNames.names.4.lastName': 'form1[0].Section18_1[0].TextField11[18]',
  'immediateFamily.0.otherNames.names.4.firstName': 'form1[0].Section18_1[0].TextField11[17]',
  'immediateFamily.0.otherNames.names.4.middleName': 'form1[0].Section18_1[0].TextField11[16]',
  'immediateFamily.0.otherNames.names.4.suffix': 'form1[0].Section18_1[0].suffix[5]',
  
  // Mother's maiden name fields
  'immediateFamily.0.motherMaidenName.sameAsListed': 'form1[0].Section18_1[0].#field[14]',
  'immediateFamily.0.motherMaidenName.dontKnow': 'form1[0].Section18_1[0].#field[15]',
};

/**
 * Map a logical field path to the actual PDF field name
 */
export function mapLogicalFieldToPdfField(logicalPath: string): string {
  return SECTION18_FIELD_MAPPING[logicalPath as keyof typeof SECTION18_FIELD_MAPPING] || logicalPath;
}

/**
 * Get field metadata for a logical field path
 */
export function getFieldMetadata(logicalPath: string): Section18Field | undefined {
  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  return getPdfFieldByName(pdfFieldName);
}
