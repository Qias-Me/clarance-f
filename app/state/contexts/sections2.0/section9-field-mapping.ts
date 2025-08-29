/**
 * Section 9 Field Mapping - Load actual PDF field names from section-9.json
 *
 * This module loads the actual PDF field names and IDs from the section-9.json
 * reference file and provides mapping functions for Section 9 fields.
 *
 * Section 9 Structure:
 * - Main citizenship status radio button
 * - 4 subsections: 9.1 (Born to US Parents), 9.2 (Naturalized), 9.3 (Derived), 9.4 (Non-US Citizen)
 * - Total: 78 fields across all subsections
 */

import section9Data from '../../../../api/interfaces/sections-references/section-9.json';

// Types for the JSON structure
interface Section9Field {
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
interface Section9JsonData {
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
  fields: Section9Field[];
}

// Load the actual field data
const section9Fields: Section9Field[] = (section9Data as Section9JsonData).fields;

// Create a mapping from field names to field data
const fieldNameToDataMap = new Map<string, Section9Field>();
section9Fields.forEach(field => {
  fieldNameToDataMap.set(field.name, field);
});

// Create a mapping from field IDs to field data
const fieldIdToDataMap = new Map<string, Section9Field>();
section9Fields.forEach(field => {
  // Extract numeric ID from "17233 0 R" format
  const numericId = field.id.replace(' 0 R', '');
  fieldIdToDataMap.set(numericId, field);
});

/**
 * Get the actual PDF field data for a given field name
 */
export function getPdfFieldByName(fieldName: string): Section9Field | undefined {
  return fieldNameToDataMap.get(fieldName);
}

/**
 * Get the actual PDF field data for a given numeric field ID
 */
export function getPdfFieldById(fieldId: string): Section9Field | undefined {
  return fieldIdToDataMap.get(fieldId);
}

/**
 * Get the numeric field ID for a given field name
 */
export function getNumericFieldId(fieldName: string): string | undefined {
  const field = fieldNameToDataMap.get(fieldName);
  if (field) {
    return field.id.replace(' 0 R', '');
  }
  return undefined;
}
/**
 * Get all available field names for Section 9
 */
export function getAllSection9FieldNames(): string[] {
  return Array.from(fieldNameToDataMap.keys());
}

/**
 * Get all available numeric field IDs for Section 9
 */
export function getAllSection9FieldIds(): string[] {
  return Array.from(fieldIdToDataMap.keys());
}

/**
 * Search for fields by pattern (useful for debugging)
 */
export function searchFieldsByPattern(pattern: string): Section9Field[] {
  const regex = new RegExp(pattern, 'i');
  return section9Fields.filter(field =>
    regex.test(field.name) || regex.test(field.label || '')
  );
}

/**
 * Get field mapping statistics
 */
export function getFieldMappingStats() {
  return {
    totalFields: section9Fields.length,
    fieldNames: fieldNameToDataMap.size,
    fieldIds: fieldIdToDataMap.size,
    sectionName: (section9Data as Section9JsonData).metadata.sectionName,
    confidence: (section9Data as Section9JsonData).metadata.averageConfidence
  };
}
/**
 * Field mapping from logical names to PDF field names
 * Based on analysis of section-9.json structure
 */
export const SECTION9_FIELD_MAPPING = {
  // Main citizenship status
  'section9.status.value': 'form1[0].Sections7-9[0].RadioButtonList[1]',

  // Section 9.1 - Born to US Parents (Sections7-9 pattern)
  'section9.bornToUSParents.otherExplanation.value': 'form1[0].Sections7-9[0].TextField11[3]',
  'section9.bornToUSParents.documentNumber.value': 'form1[0].Sections7-9[0].TextField11[4]',
  'section9.bornToUSParents.issueCountry.value': 'form1[0].Sections7-9[0].DropDownList12[0]',
  'section9.bornToUSParents.issueState.value': 'form1[0].Sections7-9[0].School6_State[0]',
  'section9.bornToUSParents.issueCity.value': 'form1[0].Sections7-9[0].TextField11[5]',
  'section9.bornToUSParents.nameOnDocument.lastName.value': 'form1[0].Sections7-9[0].TextField11[7]',
  'section9.bornToUSParents.nameOnDocument.firstName.value': 'form1[0].Sections7-9[0].TextField11[8]',
  'section9.bornToUSParents.nameOnDocument.middleName.value': 'form1[0].Sections7-9[0].TextField11[6]',
  'section9.bornToUSParents.nameOnDocument.suffix.value': 'form1[0].Sections7-9[0].suffix[1]',
  'section9.bornToUSParents.documentIssueDate.value': 'form1[0].Sections7-9[0].From_Datefield_Name_2[1]',
  'section9.bornToUSParents.isIssueDateEstimated.value': 'form1[0].Sections7-9[0].#field[25]',
  'section9.bornToUSParents.certificateNumber.value': 'form1[0].Sections7-9[0].TextField11[12]',
  'section9.bornToUSParents.certificateIssueDate.value': 'form1[0].Sections7-9[0].From_Datefield_Name_2[2]',
  'section9.bornToUSParents.isCertificateDateEstimated.value': 'form1[0].Sections7-9[0].#field[28]',
  'section9.bornToUSParents.nameOnCertificate.lastName.value': 'form1[0].Sections7-9[0].TextField11[10]',
  'section9.bornToUSParents.nameOnCertificate.firstName.value': 'form1[0].Sections7-9[0].TextField11[11]',
  'section9.bornToUSParents.nameOnCertificate.middleName.value': 'form1[0].Sections7-9[0].TextField11[9]',
  'section9.bornToUSParents.nameOnCertificate.suffix.value': 'form1[0].Sections7-9[0].suffix[2]',
  'section9.bornToUSParents.wasBornOnMilitaryInstallation.value': 'form1[0].Sections7-9[0].RadioButtonList[2]',
  'section9.bornToUSParents.militaryBaseName.value': 'form1[0].Sections7-9[0].TextField11[18]',
  'section9.bornToUSParents.documentType.value': 'form1[0].Sections7-9[0].RadioButtonList[3]',

  // Section 9.2 - Naturalized Citizen (Section9\.1-9\.4 pattern)
  'section9.naturalizedCitizen.naturalizedCertificateNumber.value': 'form1[0].Section9\\.1-9\\.4[0].TextField11[6]',
  'section9.naturalizedCitizen.nameOnCertificate.lastName.value': 'form1[0].Section9\\.1-9\\.4[0].TextField11[2]',
  'section9.naturalizedCitizen.nameOnCertificate.firstName.value': 'form1[0].Section9\\.1-9\\.4[0].TextField11[3]',
  'section9.naturalizedCitizen.nameOnCertificate.middleName.value': 'form1[0].Section9\\.1-9\\.4[0].TextField11[1]',
  'section9.naturalizedCitizen.nameOnCertificate.suffix.value': 'form1[0].Section9\\.1-9\\.4[0].suffix[0]',
  'section9.naturalizedCitizen.courtAddress.street.value': 'form1[0].Section9\\.1-9\\.4[0].TextField11[4]',
  'section9.naturalizedCitizen.courtAddress.city.value': 'form1[0].Section9\\.1-9\\.4[0].TextField11[0]',
  'section9.naturalizedCitizen.courtAddress.state.value': 'form1[0].Section9\\.1-9\\.4[0].School6_State[0]',
  'section9.naturalizedCitizen.courtAddress.zipCode.value': 'form1[0].Section9\\.1-9\\.4[0].TextField11[5]',
  'section9.naturalizedCitizen.certificateIssueDate.value': 'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[0]',
  'section9.naturalizedCitizen.isCertificateDateEstimated.value': 'form1[0].Section9\\.1-9\\.4[0].#field[10]',
  'section9.naturalizedCitizen.otherExplanation.value': 'form1[0].Section9\\.1-9\\.4[0].TextField11[7]',
  'section9.naturalizedCitizen.courtName.value': 'form1[0].Section9\\.1-9\\.4[0].TextField11[15]',
  'section9.naturalizedCitizen.entryDate.value': 'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[4]',
  'section9.naturalizedCitizen.isEntryDateEstimated.value': 'form1[0].Section9\\.1-9\\.4[0].#field[32]',
  'section9.naturalizedCitizen.entryCity.value': 'form1[0].Section9\\.1-9\\.4[0].TextField11[16]',
  'section9.naturalizedCitizen.entryState.value': 'form1[0].Section9\\.1-9\\.4[0].School6_State[1]',
  'section9.naturalizedCitizen.priorCitizenship.value': 'form1[0].Section9\\.1-9\\.4[0].DropDownList15[0]',
  'section9.naturalizedCitizen.hasAlienRegistrationRadio.value': 'form1[0].Section9\\.1-9\\.4[0].RadioButtonList[1]',
  'section9.naturalizedCitizen.alienRegistrationNumber.value': 'form1[0].Section9\\.1-9\\.4[0].TextField11[9]',
} as const;

/**
 * Map a logical field path to the actual PDF field name
 */
export function mapLogicalFieldToPdfField(logicalPath: string): string {
  return SECTION9_FIELD_MAPPING[logicalPath as keyof typeof SECTION9_FIELD_MAPPING] || logicalPath;
}

/**
 * Get field metadata for a logical field path
 */
export function getFieldMetadata(logicalPath: string): Section9Field | undefined {
  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  return getPdfFieldByName(pdfFieldName);
}

/**
 * Check if a field path is a valid Section 9 field
 */
export function isValidSection9Field(fieldPath: string): boolean {
  return fieldPath in SECTION9_FIELD_MAPPING;
}

/**
 * Get all logical field paths for Section 9
 */
export function getAllLogicalFieldPaths(): string[] {
  return Object.keys(SECTION9_FIELD_MAPPING);
}