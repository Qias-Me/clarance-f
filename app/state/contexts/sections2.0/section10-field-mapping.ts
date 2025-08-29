/**
 * Section 10: Dual/Multiple Citizenship & Foreign Passport - Field Mapping
 *
 * This file contains the mapping between logical field paths and PDF field names
 * for SF-86 Section 10. It provides field validation, metadata access, and
 * comprehensive field mapping verification following the Section 29 pattern.
 */

import section10Data from '../../../../api/interfaces/sections-references/section-10.json';

// Types for the JSON structure
interface Section10Field {
  id: string;
  name: string;
  page: number;
  label: string;
  type: string;
  options: any[];
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

interface Section10JsonData {
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
  fields: Section10Field[];
}

// Load the actual field data
const section10Fields: Section10Field[] = (section10Data as Section10JsonData).fields;

// Create a mapping from field names to field data
const fieldNameToDataMap = new Map<string, Section10Field>();
section10Fields.forEach(field => {
  fieldNameToDataMap.set(field.name, field);
});

// ============================================================================
// FIELD MAPPING DEFINITIONS
// ============================================================================

/**
 * Comprehensive field mapping for Section 10
 * Maps logical field paths to actual PDF field names from section-10.json
 */
export const SECTION10_FIELD_MAPPINGS = {
  // Main questions
  'dualCitizenship.hasDualCitizenship': 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[0]',
  'foreignPassport.hasForeignPassport': 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[5]',

  // Dual Citizenship Entry 1
  'dualCitizenship.entries[0].country': 'form1[0].Section10\\.1-10\\.2[0].DropDownList13[0]',
  'dualCitizenship.entries[0].howAcquired': 'form1[0].Section10\\.1-10\\.2[0].TextField11[0]',
  'dualCitizenship.entries[0].fromDate': 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[0]',
  'dualCitizenship.entries[0].isFromEstimated': 'form1[0].Section10\\.1-10\\.2[0].#field[3]',
  'dualCitizenship.entries[0].toDate': 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[1]',
  'dualCitizenship.entries[0].isPresent': 'form1[0].Section10\\.1-10\\.2[0].#field[5]',
  'dualCitizenship.entries[0].isToEstimated': 'form1[0].Section10\\.1-10\\.2[0].#field[6]',
  'dualCitizenship.entries[0].hasRenounced': 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[1]',
  'dualCitizenship.entries[0].renounceExplanation': 'form1[0].Section10\\.1-10\\.2[0].TextField11[1]',
  'dualCitizenship.entries[0].hasTakenAction': 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[2]',
  'dualCitizenship.entries[0].actionExplanation': 'form1[0].Section10\\.1-10\\.2[0].TextField11[2]',

  // Dual Citizenship Entry 2
  'dualCitizenship.entries[1].country': 'form1[0].Section10\\.1-10\\.2[0].DropDownList13[1]',
  'dualCitizenship.entries[1].howAcquired': 'form1[0].Section10\\.1-10\\.2[0].TextField11[3]',
  'dualCitizenship.entries[1].fromDate': 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[2]',
  'dualCitizenship.entries[1].isFromEstimated': 'form1[0].Section10\\.1-10\\.2[0].#field[11]',
  'dualCitizenship.entries[1].toDate': 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[3]',
  'dualCitizenship.entries[1].isPresent': 'form1[0].Section10\\.1-10\\.2[0].#field[13]',
  'dualCitizenship.entries[1].isToEstimated': 'form1[0].Section10\\.1-10\\.2[0].#field[14]',
  'dualCitizenship.entries[1].hasRenounced': 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[3]',
  'dualCitizenship.entries[1].renounceExplanation': 'form1[0].Section10\\.1-10\\.2[0].TextField11[4]',
  'dualCitizenship.entries[1].hasTakenAction': 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[4]',
  'dualCitizenship.entries[1].actionExplanation': 'form1[0].Section10\\.1-10\\.2[0].TextField11[5]',

  // Foreign Passport Entry 1
  'foreignPassport.entries[0].country': 'form1[0].Section10\\.1-10\\.2[0].DropDownList14[0]',
  'foreignPassport.entries[0].issueDate': 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[4]',
  'foreignPassport.entries[0].isIssueDateEstimated': 'form1[0].Section10\\.1-10\\.2[0].#field[20]',
  'foreignPassport.entries[0].city': 'form1[0].Section10\\.1-10\\.2[0].TextField11[6]',
  'foreignPassport.entries[0].country2': 'form1[0].Section10\\.1-10\\.2[0].DropDownList11[0]',
  'foreignPassport.entries[0].lastName': 'form1[0].Section10\\.1-10\\.2[0].TextField11[7]',
  'foreignPassport.entries[0].firstName': 'form1[0].Section10\\.1-10\\.2[0].TextField11[8]',
  'foreignPassport.entries[0].middleName': 'form1[0].Section10\\.1-10\\.2[0].TextField11[9]',
  'foreignPassport.entries[0].suffix': 'form1[0].Section10\\.1-10\\.2[0].suffix[0]',
  'foreignPassport.entries[0].passportNumber': 'form1[0].Section10\\.1-10\\.2[0].TextField11[10]',
  'foreignPassport.entries[0].expirationDate': 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[5]',
  'foreignPassport.entries[0].isExpirationDateEstimated': 'form1[0].Section10\\.1-10\\.2[0].#field[29]',
  'foreignPassport.entries[0].usedForUSEntry': 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[6]',

  // Foreign Passport Entry 2 (Section10-2 pattern)
  'foreignPassport.entries[1].country': 'form1[0].Section10-2[0].DropDownList14[0]',
  'foreignPassport.entries[1].issueDate': 'form1[0].Section10-2[0].From_Datefield_Name_2[0]',
  'foreignPassport.entries[1].isIssueDateEstimated': 'form1[0].Section10-2[0].#field[4]',
  'foreignPassport.entries[1].city': 'form1[0].Section10-2[0].TextField11[0]',
  'foreignPassport.entries[1].country2': 'form1[0].Section10-2[0].DropDownList11[0]',
  'foreignPassport.entries[1].lastName': 'form1[0].Section10-2[0].TextField11[1]',
  'foreignPassport.entries[1].firstName': 'form1[0].Section10-2[0].TextField11[2]',
  'foreignPassport.entries[1].middleName': 'form1[0].Section10-2[0].TextField11[3]',
  'foreignPassport.entries[1].suffix': 'form1[0].Section10-2[0].suffix[0]',
  'foreignPassport.entries[1].passportNumber': 'form1[0].Section10-2[0].TextField11[4]',
  'foreignPassport.entries[1].expirationDate': 'form1[0].Section10-2[0].From_Datefield_Name_2[1]',
  'foreignPassport.entries[1].isExpirationDateEstimated': 'form1[0].Section10-2[0].#field[13]',
  'foreignPassport.entries[1].usedForUSEntry': 'form1[0].Section10-2[0].RadioButtonList[0]',
};

// ============================================================================
// TRAVEL COUNTRIES FIELD MAPPING
// ============================================================================

/**
 * Generate travel countries field mappings for a specific passport entry
 */
export function getTravelCountriesFieldMappings(passportIndex: number): Record<string, string> {
  const mappings: Record<string, string> = {};
  const sectionPattern = passportIndex === 0 ? 'Section10\\.1-10\\.2' : 'Section10-2';
  
  for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
    const isRow6 = rowIndex === 5;
    const rowPattern = isRow6 ? 'Row5[1]' : `Row${rowIndex + 1}[0]`;
    const basePattern = `form1[0].${sectionPattern}[0].Table1[0].${rowPattern}`;
    
    if (isRow6) {
      // Row 6 uses #field pattern
      mappings[`foreignPassport.entries[${passportIndex}].travelCountries[${rowIndex}].country`] = `${basePattern}.#field[0]`;
      mappings[`foreignPassport.entries[${passportIndex}].travelCountries[${rowIndex}].fromDate`] = `${basePattern}.#field[1]`;
      mappings[`foreignPassport.entries[${passportIndex}].travelCountries[${rowIndex}].isFromDateEstimated`] = `${basePattern}.Cell3[0]`;
      mappings[`foreignPassport.entries[${passportIndex}].travelCountries[${rowIndex}].toDate`] = `${basePattern}.#field[3]`;
      mappings[`foreignPassport.entries[${passportIndex}].travelCountries[${rowIndex}].isToDateEstimated`] = `${basePattern}.Cell5[0]`;
      mappings[`foreignPassport.entries[${passportIndex}].travelCountries[${rowIndex}].isPresent`] = `${basePattern}.#field[5]`;
    } else {
      // Rows 1-5 use Cell pattern
      mappings[`foreignPassport.entries[${passportIndex}].travelCountries[${rowIndex}].country`] = `${basePattern}.Cell1[0]`;
      mappings[`foreignPassport.entries[${passportIndex}].travelCountries[${rowIndex}].fromDate`] = `${basePattern}.Cell2[0]`;
      mappings[`foreignPassport.entries[${passportIndex}].travelCountries[${rowIndex}].isFromDateEstimated`] = `${basePattern}.Cell3[0]`;
      mappings[`foreignPassport.entries[${passportIndex}].travelCountries[${rowIndex}].toDate`] = `${basePattern}.Cell4[0]`;
      mappings[`foreignPassport.entries[${passportIndex}].travelCountries[${rowIndex}].isToDateEstimated`] = `${basePattern}.Cell5[0]`;
      mappings[`foreignPassport.entries[${passportIndex}].travelCountries[${rowIndex}].isPresent`] = `${basePattern}.#field[5]`;
    }
  }
  
  return mappings;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Map a logical field path to its corresponding PDF field name
 */
export function mapLogicalFieldToPdfField(logicalPath: string): string {
  // Check direct mappings first
  if (SECTION10_FIELD_MAPPINGS[logicalPath]) {
    return SECTION10_FIELD_MAPPINGS[logicalPath];
  }
  
  // Check travel countries mappings
  const travelMatch = logicalPath.match(/foreignPassport\.entries\[(\d+)\]\.travelCountries\[(\d+)\]\./);
  if (travelMatch) {
    const passportIndex = parseInt(travelMatch[1]);
    const travelMappings = getTravelCountriesFieldMappings(passportIndex);
    if (travelMappings[logicalPath]) {
      return travelMappings[logicalPath];
    }
  }
  
  console.warn(`⚠️ Section10: No mapping found for logical path: ${logicalPath}`);
  return logicalPath; // Return as-is if no mapping found
}

/**
 * Get field metadata from the section-10.json data
 */
export function getFieldMetadata(pdfFieldName: string): Section10Field | null {
  return fieldNameToDataMap.get(pdfFieldName) || null;
}

/**
 * Validate that a PDF field exists in the reference data
 */
export function validateFieldExists(pdfFieldName: string): boolean {
  return fieldNameToDataMap.has(pdfFieldName);
}

/**
 * Find similar field names for debugging
 */
export function findSimilarFieldNames(targetField: string, maxResults: number = 5): string[] {
  const allFieldNames = Array.from(fieldNameToDataMap.keys());
  const similar = allFieldNames
    .filter(name => name.includes(targetField.split('.').pop() || ''))
    .slice(0, maxResults);
  return similar;
}

/**
 * Get numeric field ID if available
 */
export function getNumericFieldId(pdfFieldName: string): string | null {
  const fieldData = getFieldMetadata(pdfFieldName);
  return fieldData?.id || null;
}

/**
 * Validate Section 10 field mappings and return coverage statistics
 */
export function validateSection10FieldMappings(): {
  totalFields: number;
  mappedFields: number;
  coverage: number;
  missingFields: string[];
} {
  const allPdfFields = Array.from(fieldNameToDataMap.keys());
  const mappedPdfFields = new Set(Object.values(SECTION10_FIELD_MAPPINGS));
  
  // Add travel countries mappings
  for (let passportIndex = 0; passportIndex < 2; passportIndex++) {
    const travelMappings = getTravelCountriesFieldMappings(passportIndex);
    Object.values(travelMappings).forEach(pdfField => mappedPdfFields.add(pdfField));
  }
  
  const missingFields = allPdfFields.filter(field => !mappedPdfFields.has(field));
  const coverage = (mappedPdfFields.size / allPdfFields.length) * 100;
  
  return {
    totalFields: allPdfFields.length,
    mappedFields: mappedPdfFields.size,
    coverage,
    missingFields
  };
}
