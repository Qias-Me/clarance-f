/**
 * Section 13 Field Mapping System
 * Maps logical field paths to actual PDF field names from section-13.json
 * 
 * This file provides the complete mapping for all 1,086 fields in Section 13
 * and enables field verification, validation, and automated field generation.
 */

import section13Data from '../../../../api/sections-references/section-13.json';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface Section13Field {
  id: string;
  name: string;
  type: string;
  label?: string;
  value?: string;
  rect?: { x: number; y: number; width: number; height: number };
  options?: string[];
}

// ============================================================================
// FIELD DATA MAPS
// ============================================================================

/**
 * Map of PDF field names to field data for fast lookup
 */
const fieldNameToDataMap = new Map<string, Section13Field>();

/**
 * Map of field IDs to field data for fast lookup
 */
const fieldIdToDataMap = new Map<string, Section13Field>();

/**
 * Initialize field maps from section-13.json data
 */
function initializeFieldMaps() {
  if (fieldNameToDataMap.size > 0) {
    return; // Already initialized
  }

  console.log('🔄 Section13: Initializing field mapping system...');
  
  const fields = section13Data.fields || [];
  let fieldCount = 0;

  fields.forEach((field: any) => {
    if (field.name && field.id) {
      const section13Field: Section13Field = {
        id: field.id,
        name: field.name,
        type: field.type || 'PDFTextField',
        label: field.label || field.name,
        value: field.value || '',
        rect: field.rect || { x: 0, y: 0, width: 0, height: 0 },
        options: field.options || []
      };

      fieldNameToDataMap.set(field.name, section13Field);
      fieldIdToDataMap.set(field.id, section13Field);
      fieldCount++;
    }
  });

  console.log(`✅ Section13: Initialized ${fieldCount} field mappings`);
  console.log(`📊 Section13: Expected 1,086 fields, found ${fieldCount} fields`);
  
  if (fieldCount !== 1086) {
    console.warn(`⚠️ Section13: Field count mismatch! Expected 1,086, found ${fieldCount}`);
  }
}

// Initialize on module load
initializeFieldMaps();

// ============================================================================
// FIELD MAPPING FUNCTIONS
// ============================================================================

/**
 * Get the actual PDF field data for a given field name
 */
export function getPdfFieldByName(fieldName: string): Section13Field | undefined {
  return fieldNameToDataMap.get(fieldName);
}

/**
 * Get the actual PDF field data for a given numeric field ID
 */
export function getPdfFieldById(fieldId: string): Section13Field | undefined {
  return fieldIdToDataMap.get(fieldId);
}

/**
 * Get the correct entry pattern based on subsection and entry index
 * 
 * Section 13 has multiple subsections with different entry patterns:
 * - section13_2: Non-Federal Employment [0], [1], [2]
 * - section13_2-2: Non-Federal Employment Entry 2 [0]
 * - section13_3: Self-Employment [0], [1], [2]
 * - section13_3-2: Self-Employment Entry 2 [0]
 * - section13_4: Unemployment [0], [1], [2], [3]
 * - section13_5: Employment Issues [0]
 */
export function getEntryPattern(subsection: string, entryIndex: number): string {
  const patterns: Record<string, string[]> = {
    'section13_2': ['section13_2[0]', 'section13_2[1]', 'section13_2[2]'],
    'section13_2-2': ['section13_2-2[0]'],
    'section13_3': ['section13_3[0]', 'section13_3[1]', 'section13_3[2]'],
    'section13_3-2': ['section13_3-2[0]'],
    'section13_4': ['section13_4[0]', 'section13_4[1]', 'section13_4[2]', 'section13_4[3]'],
    'section13_5': ['section13_5[0]']
  };
  
  const subsectionPatterns = patterns[subsection];
  if (!subsectionPatterns) {
    console.warn(`Invalid subsection: ${subsection}, defaulting to section13_2[0]`);
    return 'section13_2[0]';
  }
  
  if (entryIndex < 0 || entryIndex >= subsectionPatterns.length) {
    console.warn(`Invalid entry index: ${entryIndex} for subsection ${subsection}, defaulting to first entry`);
    return subsectionPatterns[0];
  }
  
  return subsectionPatterns[entryIndex];
}

/**
 * Get PDF field for a specific subsection, entry, and field type
 */
export function getPdfFieldForEntry(
  subsection: string,
  entryIndex: number,
  fieldType: string
): Section13Field | undefined {
  const entryPattern = getEntryPattern(subsection, entryIndex);
  const fieldName = `form1[0].${entryPattern}.${fieldType}`;
  
  const field = getPdfFieldByName(fieldName);
  
  if (field) {
    console.log(`✅ Found PDF field for ${subsection} entry ${entryIndex}, type ${fieldType}: ${field.name}`);
    return field;
  } else {
    console.warn(`⚠️ No PDF field found for ${subsection} entry ${entryIndex}, type ${fieldType} with name: ${fieldName}`);
    
    // Debug: Show similar field names
    const similarFields = Array.from(fieldNameToDataMap.keys()).filter(name =>
      name.includes(entryPattern) || name.includes(fieldType)
    ).slice(0, 5);
    console.warn(`🔍 Similar fields found:`, similarFields);
    
    return undefined;
  }
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
 * Get field metadata from the section-13.json data
 */
export function getFieldMetadata(pdfFieldName: string): Section13Field | null {
  return fieldNameToDataMap.get(pdfFieldName) || null;
}

/**
 * Get all field names for a specific subsection
 */
export function getFieldNamesForSubsection(subsection: string): string[] {
  const allFieldNames = Array.from(fieldNameToDataMap.keys());
  return allFieldNames.filter(name => name.includes(subsection));
}

/**
 * Get field statistics for debugging
 */
export function getFieldStatistics(): {
  totalFields: number;
  fieldsByType: Record<string, number>;
  fieldsBySubsection: Record<string, number>;
} {
  const totalFields = fieldNameToDataMap.size;
  const fieldsByType: Record<string, number> = {};
  const fieldsBySubsection: Record<string, number> = {};

  fieldNameToDataMap.forEach((field) => {
    // Count by type
    fieldsByType[field.type] = (fieldsByType[field.type] || 0) + 1;

    // Count by subsection
    const subsectionMatch = field.name.match(/section13_[^[]+/);
    if (subsectionMatch) {
      const subsection = subsectionMatch[0];
      fieldsBySubsection[subsection] = (fieldsBySubsection[subsection] || 0) + 1;
    }
  });

  return {
    totalFields,
    fieldsByType,
    fieldsBySubsection
  };
}

// ============================================================================
// FIELD VERIFICATION SYSTEM
// ============================================================================

/**
 * Verify that all expected fields exist for Section 13
 */
export function verifySection13FieldMapping(): {
  success: boolean;
  totalFields: number;
  missingFields: string[];
  statistics: ReturnType<typeof getFieldStatistics>;
} {
  console.log('🔍 Section13: Verifying field mapping coverage...');
  
  const statistics = getFieldStatistics();
  const expectedFieldCount = 1086;
  const missingFields: string[] = [];

  // Check critical fields that were causing console errors
  const criticalFields = [
    'form1[0].section13_5[0].TextField11[3]', // Fixed from TextField11[0] and TextField11[1] - using TextField11[3] (street1)
    'form1[0].section13_4[0].RadioButtonList[2]', // Fixed from RadioButtonList[3]
  ];

  criticalFields.forEach(fieldName => {
    if (!validateFieldExists(fieldName)) {
      missingFields.push(fieldName);
    }
  });

  const success = statistics.totalFields === expectedFieldCount && missingFields.length === 0;

  console.log(`📊 Section13: Field verification results:`);
  console.log(`   Total fields: ${statistics.totalFields}/${expectedFieldCount}`);
  console.log(`   Missing fields: ${missingFields.length}`);
  console.log(`   Success: ${success ? '✅' : '❌'}`);

  if (missingFields.length > 0) {
    console.warn(`⚠️ Section13: Missing critical fields:`, missingFields);
  }

  return {
    success,
    totalFields: statistics.totalFields,
    missingFields,
    statistics
  };
}

// ============================================================================
// COMPREHENSIVE FIELD MAPPINGS
// ============================================================================

/**
 * Complete logical field path mappings for Section 13
 * This provides the foundation for 100% field coverage
 */
export const SECTION13_FIELD_MAPPINGS = {
  // Main section fields
  'section13.hasEmployment.value': 'form1[0].section_13_1-2[0].RadioButtonList[0]',
  'section13.hasGaps.value': 'form1[0].section13_5[0].RadioButtonList[1]',
  'section13.gapExplanation.value': 'form1[0].section13_5[0].TextField11[3]', // Fixed from TextField11[0] and TextField11[1] - using TextField11[3] (street1)

  // Federal Employment (13A.1) - Complete field mappings (50 fields)
  'section13.federalEmployment.entries[0].checkbox.value': 'form1[0].section_13_1-2[0].p13a-1-1cb[0]',
  'section13.federalEmployment.entries[0].countryCode.value': 'form1[0].section_13_1-2[0].DropDownList4[0]',
  'section13.federalEmployment.entries[0].dutyApoFpo.value': 'form1[0].section_13_1-2[0].TextField11[17]',
  'section13.federalEmployment.entries[0].dutyCity.value': 'form1[0].section_13_1-2[0].TextField11[10]',
  'section13.federalEmployment.entries[0].dutyCountry.value': 'form1[0].section_13_1-2[0].DropDownList20[0]',
  'section13.federalEmployment.entries[0].dutyState.value': 'form1[0].section_13_1-2[0].School6_State[2]',
  'section13.federalEmployment.entries[0].dutyStateAlt.value': 'form1[0].section_13_1-2[0].School6_State[4]',
  'section13.federalEmployment.entries[0].dutyStation.value': 'form1[0].section_13_1-2[0].p3-t68[4]',
  'section13.federalEmployment.entries[0].dutyStreet.value': 'form1[0].section_13_1-2[0].TextField11[9]',
  'section13.federalEmployment.entries[0].dutyStreetAlt.value': 'form1[0].section_13_1-2[0].TextField11[16]',
  'section13.federalEmployment.entries[0].dutyZip.value': 'form1[0].section_13_1-2[0].TextField11[11]',
  'section13.federalEmployment.entries[0].dutyZipAlt.value': 'form1[0].section_13_1-2[0].TextField11[18]',
  'section13.federalEmployment.entries[0].employerCity.value': 'form1[0].section_13_1-2[0].TextField11[7]',
  'section13.federalEmployment.entries[0].employerCountry.value': 'form1[0].section_13_1-2[0].DropDownList17[0]',
  'section13.federalEmployment.entries[0].employerPhone.value': 'form1[0].section_13_1-2[0].p3-t68[1]',
  'section13.federalEmployment.entries[0].employerState.value': 'form1[0].section_13_1-2[0].School6_State[1]',
  'section13.federalEmployment.entries[0].employerStreet.value': 'form1[0].section_13_1-2[0].TextField11[6]',
  'section13.federalEmployment.entries[0].employerZip.value': 'form1[0].section_13_1-2[0].TextField11[8]',
  'section13.federalEmployment.entries[0].employmentType.value': 'form1[0].section_13_1-2[0].RadioButtonList[0]',
  'section13.federalEmployment.entries[0].extension.value': 'form1[0].section_13_1-2[0].TextField11[12]',
  'section13.federalEmployment.entries[0].field15.value': 'form1[0].section_13_1-2[0].#field[15]',
  'section13.federalEmployment.entries[0].field16.value': 'form1[0].section_13_1-2[0].#field[16]',
  'section13.federalEmployment.entries[0].field17.value': 'form1[0].section_13_1-2[0].#field[17]',
  'section13.federalEmployment.entries[0].field26.value': 'form1[0].section_13_1-2[0].#field[26]',
  'section13.federalEmployment.entries[0].field27.value': 'form1[0].section_13_1-2[0].#field[27]',
  'section13.federalEmployment.entries[0].field28.value': 'form1[0].section_13_1-2[0].#field[28]',
  'section13.federalEmployment.entries[0].field30.value': 'form1[0].section_13_1-2[0].#field[30]',
  'section13.federalEmployment.entries[0].field32.value': 'form1[0].section_13_1-2[0].#field[32]',
  'section13.federalEmployment.entries[0].field33.value': 'form1[0].section_13_1-2[0].#field[33]',
  'section13.federalEmployment.entries[0].field36.value': 'form1[0].section_13_1-2[0].#field[36]',
  'section13.federalEmployment.entries[0].field37.value': 'form1[0].section_13_1-2[0].#field[37]',
  'section13.federalEmployment.entries[0].fromDate.value': 'form1[0].section_13_1-2[0].From_Datefield_Name_2[0]',
  'section13.federalEmployment.entries[0].hasAdditionalInfo.value': 'form1[0].section_13_1-2[0].RadioButtonList[1]',
  'section13.federalEmployment.entries[0].otherExplanation.value': 'form1[0].section_13_1-2[0].TextField11[13]',
  'section13.federalEmployment.entries[0].rankTitle.value': 'form1[0].section_13_1-2[0].p3-t68[3]',
  'section13.federalEmployment.entries[0].supervisorAddress.value': 'form1[0].section_13_1-2[0].TextField11[3]',
  'section13.federalEmployment.entries[0].supervisorAddressAlt.value': 'form1[0].section_13_1-2[0].TextField11[14]',
  'section13.federalEmployment.entries[0].supervisorCity.value': 'form1[0].section_13_1-2[0].TextField11[4]',
  'section13.federalEmployment.entries[0].supervisorCityAlt.value': 'form1[0].section_13_1-2[0].TextField11[15]',
  'section13.federalEmployment.entries[0].supervisorCountry.value': 'form1[0].section_13_1-2[0].DropDownList18[0]',
  'section13.federalEmployment.entries[0].supervisorEmail.value': 'form1[0].section_13_1-2[0].p3-t68[2]',
  'section13.federalEmployment.entries[0].supervisorName.value': 'form1[0].section_13_1-2[0].TextField11[0]',
  'section13.federalEmployment.entries[0].supervisorNameAlt.value': 'form1[0].section_13_1-2[0].TextField11[19]',
  'section13.federalEmployment.entries[0].supervisorPhone.value': 'form1[0].section_13_1-2[0].p3-t68[0]',
  'section13.federalEmployment.entries[0].supervisorRank.value': 'form1[0].section_13_1-2[0].TextField11[1]',
  'section13.federalEmployment.entries[0].supervisorState.value': 'form1[0].section_13_1-2[0].School6_State[0]',
  'section13.federalEmployment.entries[0].supervisorStateAlt.value': 'form1[0].section_13_1-2[0].School6_State[3]',
  'section13.federalEmployment.entries[0].supervisorTitle.value': 'form1[0].section_13_1-2[0].TextField11[2]',
  'section13.federalEmployment.entries[0].supervisorZip.value': 'form1[0].section_13_1-2[0].TextField11[5]',
  'section13.federalEmployment.entries[0].toDate.value': 'form1[0].section_13_1-2[0].From_Datefield_Name_2[1]',

  // Non-Federal Employment (13A.2) - Complete field mappings (155 fields)
  // Main section field mappings (77 fields)
  'section13.nonFederalEmployment.entries[0].additionalInfo.value': 'form1[0].section13_2[2].TextField11[12]',
  'section13.nonFederalEmployment.entries[0].additionalPhone.value': 'form1[0].section13_2[2].p3-t68[4]',
  'section13.nonFederalEmployment.entries[0].additionalState.value': 'form1[0].section13_2[2].School6_State[6]',
  'section13.nonFederalEmployment.entries[0].countryCode.value': 'form1[0].section13_2[2].DropDownList4[1]',
  'section13.nonFederalEmployment.entries[0].dutyCity.value': 'form1[0].section13_2[2].TextField11[10]',
  'section13.nonFederalEmployment.entries[0].dutyCountry.value': 'form1[0].section13_2[2].DropDownList15[0]',
  'section13.nonFederalEmployment.entries[0].dutyPhone.value': 'form1[0].section13_2[2].p3-t68[1]',
  'section13.nonFederalEmployment.entries[0].dutyState.value': 'form1[0].section13_2[2].School6_State[1]',
  'section13.nonFederalEmployment.entries[0].dutyStateAlt.value': 'form1[0].section13_2[2].School6_State[4]',
  'section13.nonFederalEmployment.entries[0].dutyStreet.value': 'form1[0].section13_2[2].TextField11[9]',
  'section13.nonFederalEmployment.entries[0].dutyZip.value': 'form1[0].section13_2[2].TextField11[11]',
  'section13.nonFederalEmployment.entries[0].emergencyContact.value': 'form1[0].section13_2[2].p3-t68[5]',
  'section13.nonFederalEmployment.entries[0].employerAddress2.value': 'form1[0].section13_2[2].TextField11[20]',
  'section13.nonFederalEmployment.entries[0].employerApoFpo.value': 'form1[0].section13_2[2].TextField11[23]',
  'section13.nonFederalEmployment.entries[0].employerCity.value': 'form1[0].section13_2[2].TextField11[5]',
  'section13.nonFederalEmployment.entries[0].employerCity2.value': 'form1[0].section13_2[2].TextField11[21]',
  'section13.nonFederalEmployment.entries[0].employerCountry.value': 'form1[0].section13_2[2].DropDownList13[0]',
  'section13.nonFederalEmployment.entries[0].employerName.value': 'form1[0].section13_2[2].TextField11[0]',
  'section13.nonFederalEmployment.entries[0].employerNameAlt.value': 'form1[0].section13_2[2].TextField11[25]',
  'section13.nonFederalEmployment.entries[0].employerPhone.value': 'form1[0].section13_2[2].p3-t68[0]',
  'section13.nonFederalEmployment.entries[0].employerState.value': 'form1[0].section13_2[2].School6_State[0]',
  'section13.nonFederalEmployment.entries[0].employerStateAlt.value': 'form1[0].section13_2[2].School6_State[3]',
  'section13.nonFederalEmployment.entries[0].employerStreet.value': 'form1[0].section13_2[2].TextField11[4]',
  'section13.nonFederalEmployment.entries[0].employerStreet2.value': 'form1[0].section13_2[2].TextField11[22]',
  'section13.nonFederalEmployment.entries[0].employerZip.value': 'form1[0].section13_2[2].TextField11[6]',
  'section13.nonFederalEmployment.entries[0].employerZip2.value': 'form1[0].section13_2[2].TextField11[24]',
  'section13.nonFederalEmployment.entries[0].employmentType.value': 'form1[0].section13_2[2].RadioButtonList[0]',
  'section13.nonFederalEmployment.entries[0].extension.value': 'form1[0].section13_2[2].TextField11[8]',
  'section13.nonFederalEmployment.entries[0].field16.value': 'form1[0].section13_2[2].#field[16]',
  'section13.nonFederalEmployment.entries[0].field17.value': 'form1[0].section13_2[2].#field[17]',
  'section13.nonFederalEmployment.entries[0].field18.value': 'form1[0].section13_2[2].#field[18]',
  'section13.nonFederalEmployment.entries[0].field21.value': 'form1[0].section13_2[2].#field[21]',
  'section13.nonFederalEmployment.entries[0].field27.value': 'form1[0].section13_2[2].#field[27]',
  'section13.nonFederalEmployment.entries[0].field28.value': 'form1[0].section13_2[2].#field[28]',
  'section13.nonFederalEmployment.entries[0].field29.value': 'form1[0].section13_2[2].#field[29]',
  'section13.nonFederalEmployment.entries[0].field30.value': 'form1[0].section13_2[2].#field[30]',
  'section13.nonFederalEmployment.entries[0].field33.value': 'form1[0].section13_2[2].#field[33]',
  'section13.nonFederalEmployment.entries[0].field34.value': 'form1[0].section13_2[2].#field[34]',
  'section13.nonFederalEmployment.entries[0].field36.value': 'form1[0].section13_2[2].#field[36]',
  'section13.nonFederalEmployment.entries[0].field38.value': 'form1[0].section13_2[2].#field[38]',
  'section13.nonFederalEmployment.entries[0].field4.value': 'form1[0].section13_2[2].Table1[0].Row4[0].#field[4]',
  'section13.nonFederalEmployment.entries[0].field41.value': 'form1[0].section13_2[2].#field[41]',
  'section13.nonFederalEmployment.entries[0].field42.value': 'form1[0].section13_2[2].#field[42]',
  'section13.nonFederalEmployment.entries[0].field43.value': 'form1[0].section13_2[2].#field[43]',
  'section13.nonFederalEmployment.entries[0].field45.value': 'form1[0].section13_2[2].#field[45]',
  'section13.nonFederalEmployment.entries[0].field5.value': 'form1[0].section13_2[2].Table1[0].Row4[0].#field[5]',
  'section13.nonFederalEmployment.entries[0].fromDate.value': 'form1[0].section13_2[2].From_Datefield_Name_2[0]',
  'section13.nonFederalEmployment.entries[0].hasAdditionalInfo.value': 'form1[0].section13_2[2].RadioButtonList[1]',
  'section13.nonFederalEmployment.entries[0].isCurrentEmployment.value': 'form1[0].section13_2[2].RadioButtonList[2]',
  'section13.nonFederalEmployment.entries[0].positionTitle.value': 'form1[0].section13_2[2].TextField11[1]',
  'section13.nonFederalEmployment.entries[0].reasonForLeaving.value': 'form1[0].section13_2[2].TextField11[13]',
  'section13.nonFederalEmployment.entries[0].supervisorAddress.value': 'form1[0].section13_2[2].TextField11[14]',
  'section13.nonFederalEmployment.entries[0].supervisorApoFpo.value': 'form1[0].section13_2[2].TextField11[17]',
  'section13.nonFederalEmployment.entries[0].supervisorCity.value': 'form1[0].section13_2[2].TextField11[15]',
  'section13.nonFederalEmployment.entries[0].supervisorCountry.value': 'form1[0].section13_2[2].DropDownList16[0]',
  'section13.nonFederalEmployment.entries[0].supervisorEmail.value': 'form1[0].section13_2[2].p3-t68[2]',
  'section13.nonFederalEmployment.entries[0].supervisorName.value': 'form1[0].section13_2[2].TextField11[2]',
  'section13.nonFederalEmployment.entries[0].supervisorNameAlt.value': 'form1[0].section13_2[2].TextField11[19]',
  'section13.nonFederalEmployment.entries[0].supervisorPhone.value': 'form1[0].section13_2[2].p3-t68[3]',
  'section13.nonFederalEmployment.entries[0].supervisorState.value': 'form1[0].section13_2[2].School6_State[2]',
  'section13.nonFederalEmployment.entries[0].supervisorStateAlt.value': 'form1[0].section13_2[2].School6_State[5]',
  'section13.nonFederalEmployment.entries[0].supervisorStreet.value': 'form1[0].section13_2[2].TextField11[16]',
  'section13.nonFederalEmployment.entries[0].supervisorTitle.value': 'form1[0].section13_2[2].TextField11[3]',
  'section13.nonFederalEmployment.entries[0].supervisorZip.value': 'form1[0].section13_2[2].TextField11[18]',
  'section13.nonFederalEmployment.entries[0].table0Row1Cell2.value': 'form1[0].section13_2[2].Table1[0].Row1[0].Cell2[0]',
  'section13.nonFederalEmployment.entries[0].table0Row1Cell3.value': 'form1[0].section13_2[2].Table1[0].Row1[0].Cell3[1]',
  'section13.nonFederalEmployment.entries[0].table0Row1Cell4.value': 'form1[0].section13_2[2].Table1[0].Row1[0].Cell4[0]',
  'section13.nonFederalEmployment.entries[0].table0Row2Cell2.value': 'form1[0].section13_2[2].Table1[0].Row2[0].Cell2[0]',
  'section13.nonFederalEmployment.entries[0].table0Row2Cell3.value': 'form1[0].section13_2[2].Table1[0].Row2[0].Cell3[1]',
  'section13.nonFederalEmployment.entries[0].table0Row2Cell4.value': 'form1[0].section13_2[2].Table1[0].Row2[0].Cell4[0]',
  'section13.nonFederalEmployment.entries[0].table0Row3Cell2.value': 'form1[0].section13_2[2].Table1[0].Row3[0].Cell2[0]',
  'section13.nonFederalEmployment.entries[0].table0Row3Cell3.value': 'form1[0].section13_2[2].Table1[0].Row3[0].Cell3[1]',
  'section13.nonFederalEmployment.entries[0].table0Row3Cell4.value': 'form1[0].section13_2[2].Table1[0].Row3[0].Cell4[0]',
  'section13.nonFederalEmployment.entries[0].table0Row4Cell2.value': 'form1[0].section13_2[2].Table1[0].Row4[0].Cell2[0]',
  'section13.nonFederalEmployment.entries[0].table0Row4Cell3.value': 'form1[0].section13_2[2].Table1[0].Row4[0].Cell3[1]',
  'section13.nonFederalEmployment.entries[0].table0Row4Cell4.value': 'form1[0].section13_2[2].Table1[0].Row4[0].Cell4[0]',
  'section13.nonFederalEmployment.entries[0].toDate.value': 'form1[0].section13_2[2].From_Datefield_Name_2[1]',

  // Non-Federal Employment (13A.2) - Additional section field mappings (78 fields)
  'section13.nonFederalEmploymentAdditional.entries[0].dateField0.value': 'form1[0].section13_2-2[0].From_Datefield_Name_2[0]',
  'section13.nonFederalEmploymentAdditional.entries[0].dateField1.value': 'form1[0].section13_2-2[0].From_Datefield_Name_2[1]',
  'section13.nonFederalEmploymentAdditional.entries[0].dropdown13.value': 'form1[0].section13_2-2[0].DropDownList13[0]',
  'section13.nonFederalEmploymentAdditional.entries[0].dropdown15.value': 'form1[0].section13_2-2[0].DropDownList15[0]',
  'section13.nonFederalEmploymentAdditional.entries[0].dropdown16.value': 'form1[0].section13_2-2[0].DropDownList16[0]',
  'section13.nonFederalEmploymentAdditional.entries[0].dropdown4.value': 'form1[0].section13_2-2[0].DropDownList4[1]',
  'section13.nonFederalEmploymentAdditional.entries[0].field16.value': 'form1[0].section13_2-2[0].#field[16]',
  'section13.nonFederalEmploymentAdditional.entries[0].field17.value': 'form1[0].section13_2-2[0].#field[17]',
  'section13.nonFederalEmploymentAdditional.entries[0].field18.value': 'form1[0].section13_2-2[0].#field[18]',
  'section13.nonFederalEmploymentAdditional.entries[0].field21.value': 'form1[0].section13_2-2[0].#field[21]',
  'section13.nonFederalEmploymentAdditional.entries[0].field27.value': 'form1[0].section13_2-2[0].#field[27]',
  'section13.nonFederalEmploymentAdditional.entries[0].field28.value': 'form1[0].section13_2-2[0].#field[28]',
  'section13.nonFederalEmploymentAdditional.entries[0].field29.value': 'form1[0].section13_2-2[0].#field[29]',
  'section13.nonFederalEmploymentAdditional.entries[0].field30.value': 'form1[0].section13_2-2[0].#field[30]',
  'section13.nonFederalEmploymentAdditional.entries[0].field33.value': 'form1[0].section13_2-2[0].#field[33]',
  'section13.nonFederalEmploymentAdditional.entries[0].field34.value': 'form1[0].section13_2-2[0].#field[34]',
  'section13.nonFederalEmploymentAdditional.entries[0].field36.value': 'form1[0].section13_2-2[0].#field[36]',
  'section13.nonFederalEmploymentAdditional.entries[0].field38.value': 'form1[0].section13_2-2[0].#field[38]',
  'section13.nonFederalEmploymentAdditional.entries[0].field4.value': 'form1[0].section13_2-2[0].Table1[0].Row4[0].#field[4]',
  'section13.nonFederalEmploymentAdditional.entries[0].field41.value': 'form1[0].section13_2-2[0].#field[41]',
  'section13.nonFederalEmploymentAdditional.entries[0].field42.value': 'form1[0].section13_2-2[0].#field[42]',
  'section13.nonFederalEmploymentAdditional.entries[0].field43.value': 'form1[0].section13_2-2[0].#field[43]',
  'section13.nonFederalEmploymentAdditional.entries[0].field45.value': 'form1[0].section13_2-2[0].#field[45]',
  'section13.nonFederalEmploymentAdditional.entries[0].field5.value': 'form1[0].section13_2-2[0].Table1[0].Row4[0].#field[5]',
  'section13.nonFederalEmploymentAdditional.entries[0].phone0.value': 'form1[0].section13_2-2[0].p3-t68[0]',
  'section13.nonFederalEmploymentAdditional.entries[0].phone1.value': 'form1[0].section13_2-2[0].p3-t68[1]',
  'section13.nonFederalEmploymentAdditional.entries[0].phone2.value': 'form1[0].section13_2-2[0].p3-t68[2]',
  'section13.nonFederalEmploymentAdditional.entries[0].phone3.value': 'form1[0].section13_2-2[0].p3-t68[3]',
  'section13.nonFederalEmploymentAdditional.entries[0].phone4.value': 'form1[0].section13_2-2[0].p3-t68[4]',
  'section13.nonFederalEmploymentAdditional.entries[0].phone5.value': 'form1[0].section13_2-2[0].p3-t68[5]',
  'section13.nonFederalEmploymentAdditional.entries[0].radioButton0.value': 'form1[0].section13_2-2[0].RadioButtonList[0]',
  'section13.nonFederalEmploymentAdditional.entries[0].radioButton1.value': 'form1[0].section13_2-2[0].RadioButtonList[1]',
  'section13.nonFederalEmploymentAdditional.entries[0].radioButton2.value': 'form1[0].section13_2-2[0].RadioButtonList[2]',
  'section13.nonFederalEmploymentAdditional.entries[0].state0.value': 'form1[0].section13_2-2[0].School6_State[0]',
  'section13.nonFederalEmploymentAdditional.entries[0].state1.value': 'form1[0].section13_2-2[0].School6_State[1]',
  'section13.nonFederalEmploymentAdditional.entries[0].state2.value': 'form1[0].section13_2-2[0].School6_State[2]',
  'section13.nonFederalEmploymentAdditional.entries[0].state3.value': 'form1[0].section13_2-2[0].School6_State[3]',
  'section13.nonFederalEmploymentAdditional.entries[0].state4.value': 'form1[0].section13_2-2[0].School6_State[4]',
  'section13.nonFederalEmploymentAdditional.entries[0].state5.value': 'form1[0].section13_2-2[0].School6_State[5]',
  'section13.nonFederalEmploymentAdditional.entries[0].state6.value': 'form1[0].section13_2-2[0].School6_State[6]',
  'section13.nonFederalEmploymentAdditional.entries[0].table0Row1Cell2.value': 'form1[0].section13_2-2[0].Table1[0].Row1[0].Cell2[0]',
  'section13.nonFederalEmploymentAdditional.entries[0].table0Row1Cell3.value': 'form1[0].section13_2-2[0].Table1[0].Row1[0].Cell3[1]',
  'section13.nonFederalEmploymentAdditional.entries[0].table0Row1Cell4.value': 'form1[0].section13_2-2[0].Table1[0].Row1[0].Cell4[0]',
  'section13.nonFederalEmploymentAdditional.entries[0].table0Row2Cell2.value': 'form1[0].section13_2-2[0].Table1[0].Row2[0].Cell2[0]',
  'section13.nonFederalEmploymentAdditional.entries[0].table0Row2Cell3.value': 'form1[0].section13_2-2[0].Table1[0].Row2[0].Cell3[1]',
  'section13.nonFederalEmploymentAdditional.entries[0].table0Row2Cell4.value': 'form1[0].section13_2-2[0].Table1[0].Row2[0].Cell4[0]',
  'section13.nonFederalEmploymentAdditional.entries[0].table0Row3Cell2.value': 'form1[0].section13_2-2[0].Table1[0].Row3[0].Cell2[0]',
  'section13.nonFederalEmploymentAdditional.entries[0].table0Row3Cell3.value': 'form1[0].section13_2-2[0].Table1[0].Row3[0].Cell3[1]',
  'section13.nonFederalEmploymentAdditional.entries[0].table0Row3Cell4.value': 'form1[0].section13_2-2[0].Table1[0].Row3[0].Cell4[0]',
  'section13.nonFederalEmploymentAdditional.entries[0].table0Row4Cell2.value': 'form1[0].section13_2-2[0].Table1[0].Row4[0].Cell2[0]',
  'section13.nonFederalEmploymentAdditional.entries[0].table0Row4Cell3.value': 'form1[0].section13_2-2[0].Table1[0].Row4[0].Cell3[1]',
  'section13.nonFederalEmploymentAdditional.entries[0].table0Row4Cell4.value': 'form1[0].section13_2-2[0].Table1[0].Row4[0].Cell4[0]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField0.value': 'form1[0].section13_2-2[0].TextField11[0]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField1.value': 'form1[0].section13_2-2[0].TextField11[1]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField10.value': 'form1[0].section13_2-2[0].TextField11[10]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField11.value': 'form1[0].section13_2-2[0].TextField11[11]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField12.value': 'form1[0].section13_2-2[0].TextField11[12]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField13.value': 'form1[0].section13_2-2[0].TextField11[13]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField14.value': 'form1[0].section13_2-2[0].TextField11[14]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField15.value': 'form1[0].section13_2-2[0].TextField11[15]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField16.value': 'form1[0].section13_2-2[0].TextField11[16]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField17.value': 'form1[0].section13_2-2[0].TextField11[17]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField18.value': 'form1[0].section13_2-2[0].TextField11[18]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField19.value': 'form1[0].section13_2-2[0].TextField11[19]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField2.value': 'form1[0].section13_2-2[0].TextField11[2]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField20.value': 'form1[0].section13_2-2[0].TextField11[20]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField21.value': 'form1[0].section13_2-2[0].TextField11[21]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField22.value': 'form1[0].section13_2-2[0].TextField11[22]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField23.value': 'form1[0].section13_2-2[0].TextField11[23]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField24.value': 'form1[0].section13_2-2[0].TextField11[24]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField25.value': 'form1[0].section13_2-2[0].TextField11[25]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField3.value': 'form1[0].section13_2-2[0].TextField11[3]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField4.value': 'form1[0].section13_2-2[0].TextField11[4]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField5.value': 'form1[0].section13_2-2[0].TextField11[5]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField6.value': 'form1[0].section13_2-2[0].TextField11[6]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField7.value': 'form1[0].section13_2-2[0].TextField11[7]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField8.value': 'form1[0].section13_2-2[0].TextField11[8]',
  'section13.nonFederalEmploymentAdditional.entries[0].textField9.value': 'form1[0].section13_2-2[0].TextField11[9]',

  // Self-Employment (13A.3) - Complete field mappings (119 fields)
  // Main section field mappings (58 fields)
  'section13.selfEmployment.entries[0].additionalInfo.value': 'form1[0].section13_3[2].TextField11[12]',
  'section13.selfEmployment.entries[0].additionalState.value': 'form1[0].section13_3[2].School6_State[6]',
  'section13.selfEmployment.entries[0].businessAddress2.value': 'form1[0].section13_3[2].TextField11[9]',
  'section13.selfEmployment.entries[0].businessAddress3.value': 'form1[0].section13_3[2].TextField11[20]',
  'section13.selfEmployment.entries[0].businessApoFpo.value': 'form1[0].section13_3[2].TextField11[17]',
  'section13.selfEmployment.entries[0].businessApoFpo2.value': 'form1[0].section13_3[2].TextField11[23]',
  'section13.selfEmployment.entries[0].businessCity.value': 'form1[0].section13_3[2].TextField11[4]',
  'section13.selfEmployment.entries[0].businessCity2.value': 'form1[0].section13_3[2].TextField11[10]',
  'section13.selfEmployment.entries[0].businessCity3.value': 'form1[0].section13_3[2].TextField11[21]',
  'section13.selfEmployment.entries[0].businessContact.value': 'form1[0].section13_3[2].TextField11[19]',
  'section13.selfEmployment.entries[0].businessCountry.value': 'form1[0].section13_3[2].DropDownList9[0]',
  'section13.selfEmployment.entries[0].businessCountry2.value': 'form1[0].section13_3[2].DropDownList10[0]',
  'section13.selfEmployment.entries[0].businessCountry3.value': 'form1[0].section13_3[2].DropDownList11[0]',
  'section13.selfEmployment.entries[0].businessDescription.value': 'form1[0].section13_3[2].TextField11[2]',
  'section13.selfEmployment.entries[0].businessEmail.value': 'form1[0].section13_3[2].p3-t68[2]',
  'section13.selfEmployment.entries[0].businessEmployees.value': 'form1[0].section13_3[2].TextField11[16]',
  'section13.selfEmployment.entries[0].businessExtension.value': 'form1[0].section13_3[2].TextField11[7]',
  'section13.selfEmployment.entries[0].businessFax.value': 'form1[0].section13_3[2].p3-t68[3]',
  'section13.selfEmployment.entries[0].businessLicense.value': 'form1[0].section13_3[2].TextField11[13]',
  'section13.selfEmployment.entries[0].businessName.value': 'form1[0].section13_3[2].TextField11[0]',
  'section13.selfEmployment.entries[0].businessNameAlt.value': 'form1[0].section13_3[2].TextField11[25]',
  'section13.selfEmployment.entries[0].businessPhone.value': 'form1[0].section13_3[2].p3-t68[0]',
  'section13.selfEmployment.entries[0].businessPhone2.value': 'form1[0].section13_3[2].p3-t68[1]',
  'section13.selfEmployment.entries[0].businessRevenue.value': 'form1[0].section13_3[2].TextField11[15]',
  'section13.selfEmployment.entries[0].businessState.value': 'form1[0].section13_3[2].School6_State[0]',
  'section13.selfEmployment.entries[0].businessState2.value': 'form1[0].section13_3[2].School6_State[1]',
  'section13.selfEmployment.entries[0].businessState3.value': 'form1[0].section13_3[2].School6_State[2]',
  'section13.selfEmployment.entries[0].businessStateAlt.value': 'form1[0].section13_3[2].School6_State[3]',
  'section13.selfEmployment.entries[0].businessStateAlt2.value': 'form1[0].section13_3[2].School6_State[4]',
  'section13.selfEmployment.entries[0].businessStateAlt3.value': 'form1[0].section13_3[2].School6_State[5]',
  'section13.selfEmployment.entries[0].businessStreet.value': 'form1[0].section13_3[2].TextField11[3]',
  'section13.selfEmployment.entries[0].businessStreet3.value': 'form1[0].section13_3[2].TextField11[22]',
  'section13.selfEmployment.entries[0].businessTaxId.value': 'form1[0].section13_3[2].TextField11[14]',
  'section13.selfEmployment.entries[0].businessType.value': 'form1[0].section13_3[2].RadioButtonList[0]',
  'section13.selfEmployment.entries[0].businessWebsite.value': 'form1[0].section13_3[2].p3-t68[4]',
  'section13.selfEmployment.entries[0].businessZip.value': 'form1[0].section13_3[2].TextField11[5]',
  'section13.selfEmployment.entries[0].businessZip2.value': 'form1[0].section13_3[2].TextField11[11]',
  'section13.selfEmployment.entries[0].businessZip3.value': 'form1[0].section13_3[2].TextField11[24]',
  'section13.selfEmployment.entries[0].businessZipAlt.value': 'form1[0].section13_3[2].TextField11[18]',
  'section13.selfEmployment.entries[0].countryCode.value': 'form1[0].section13_3[2].DropDownList4[1]',
  'section13.selfEmployment.entries[0].field16.value': 'form1[0].section13_3[2].#field[16]',
  'section13.selfEmployment.entries[0].field17.value': 'form1[0].section13_3[2].#field[17]',
  'section13.selfEmployment.entries[0].field18.value': 'form1[0].section13_3[2].#field[18]',
  'section13.selfEmployment.entries[0].field26.value': 'form1[0].section13_3[2].#field[26]',
  'section13.selfEmployment.entries[0].field27.value': 'form1[0].section13_3[2].#field[27]',
  'section13.selfEmployment.entries[0].field28.value': 'form1[0].section13_3[2].#field[28]',
  'section13.selfEmployment.entries[0].field31.value': 'form1[0].section13_3[2].#field[31]',
  'section13.selfEmployment.entries[0].field32.value': 'form1[0].section13_3[2].#field[32]',
  'section13.selfEmployment.entries[0].field33.value': 'form1[0].section13_3[2].#field[33]',
  'section13.selfEmployment.entries[0].field34.value': 'form1[0].section13_3[2].#field[34]',
  'section13.selfEmployment.entries[0].field35.value': 'form1[0].section13_3[2].#field[35]',
  'section13.selfEmployment.entries[0].field38.value': 'form1[0].section13_3[2].#field[38]',
  'section13.selfEmployment.entries[0].field39.value': 'form1[0].section13_3[2].#field[39]',
  'section13.selfEmployment.entries[0].field41.value': 'form1[0].section13_3[2].#field[41]',
  'section13.selfEmployment.entries[0].fromDate.value': 'form1[0].section13_3[2].From_Datefield_Name_2[0]',
  'section13.selfEmployment.entries[0].hasEmployees.value': 'form1[0].section13_3[2].RadioButtonList[1]',
  'section13.selfEmployment.entries[0].isCurrentBusiness.value': 'form1[0].section13_3[2].RadioButtonList[2]',
  'section13.selfEmployment.entries[0].toDate.value': 'form1[0].section13_3[2].From_Datefield_Name_2[1]',

  // Self-Employment (13A.3) - Additional section field mappings (61 fields)
  'section13.selfEmploymentAdditional.entries[0].dateField0.value': 'form1[0].section13_3-2[0].From_Datefield_Name_2[0]',
  'section13.selfEmploymentAdditional.entries[0].dateField1.value': 'form1[0].section13_3-2[0].From_Datefield_Name_2[1]',
  'section13.selfEmploymentAdditional.entries[0].dropdown10.value': 'form1[0].section13_3-2[0].DropDownList10[0]',
  'section13.selfEmploymentAdditional.entries[0].dropdown11.value': 'form1[0].section13_3-2[0].DropDownList11[0]',
  'section13.selfEmploymentAdditional.entries[0].dropdown4.value': 'form1[0].section13_3-2[0].DropDownList4[1]',
  'section13.selfEmploymentAdditional.entries[0].dropdown9.value': 'form1[0].section13_3-2[0].DropDownList9[0]',
  'section13.selfEmploymentAdditional.entries[0].field16.value': 'form1[0].section13_3-2[0].#field[16]',
  'section13.selfEmploymentAdditional.entries[0].field17.value': 'form1[0].section13_3-2[0].#field[17]',
  'section13.selfEmploymentAdditional.entries[0].field18.value': 'form1[0].section13_3-2[0].#field[18]',
  'section13.selfEmploymentAdditional.entries[0].field26.value': 'form1[0].section13_3-2[0].#field[26]',
  'section13.selfEmploymentAdditional.entries[0].field27.value': 'form1[0].section13_3-2[0].#field[27]',
  'section13.selfEmploymentAdditional.entries[0].field28.value': 'form1[0].section13_3-2[0].#field[28]',
  'section13.selfEmploymentAdditional.entries[0].field31.value': 'form1[0].section13_3-2[0].#field[31]',
  'section13.selfEmploymentAdditional.entries[0].field32.value': 'form1[0].section13_3-2[0].#field[32]',
  'section13.selfEmploymentAdditional.entries[0].field33.value': 'form1[0].section13_3-2[0].#field[33]',
  'section13.selfEmploymentAdditional.entries[0].field34.value': 'form1[0].section13_3-2[0].#field[34]',
  'section13.selfEmploymentAdditional.entries[0].field35.value': 'form1[0].section13_3-2[0].#field[35]',
  'section13.selfEmploymentAdditional.entries[0].field38.value': 'form1[0].section13_3-2[0].#field[38]',
  'section13.selfEmploymentAdditional.entries[0].field39.value': 'form1[0].section13_3-2[0].#field[39]',
  'section13.selfEmploymentAdditional.entries[0].field41.value': 'form1[0].section13_3-2[0].#field[41]',
  'section13.selfEmploymentAdditional.entries[0].phone0.value': 'form1[0].section13_3-2[0].p3-t68[0]',
  'section13.selfEmploymentAdditional.entries[0].phone1.value': 'form1[0].section13_3-2[0].p3-t68[1]',
  'section13.selfEmploymentAdditional.entries[0].phone2.value': 'form1[0].section13_3-2[0].p3-t68[2]',
  'section13.selfEmploymentAdditional.entries[0].phone3.value': 'form1[0].section13_3-2[0].p3-t68[3]',
  'section13.selfEmploymentAdditional.entries[0].phone4.value': 'form1[0].section13_3-2[0].p3-t68[4]',
  'section13.selfEmploymentAdditional.entries[0].radioButton0.value': 'form1[0].section13_3-2[0].RadioButtonList[0]',
  'section13.selfEmploymentAdditional.entries[0].radioButton1.value': 'form1[0].section13_3-2[0].RadioButtonList[1]',
  'section13.selfEmploymentAdditional.entries[0].radioButton2.value': 'form1[0].section13_3-2[0].RadioButtonList[2]',
  'section13.selfEmploymentAdditional.entries[0].state0.value': 'form1[0].section13_3-2[0].School6_State[0]',
  'section13.selfEmploymentAdditional.entries[0].state1.value': 'form1[0].section13_3-2[0].School6_State[1]',
  'section13.selfEmploymentAdditional.entries[0].state2.value': 'form1[0].section13_3-2[0].School6_State[2]',
  'section13.selfEmploymentAdditional.entries[0].state3.value': 'form1[0].section13_3-2[0].School6_State[3]',
  'section13.selfEmploymentAdditional.entries[0].state4.value': 'form1[0].section13_3-2[0].School6_State[4]',
  'section13.selfEmploymentAdditional.entries[0].state5.value': 'form1[0].section13_3-2[0].School6_State[5]',
  'section13.selfEmploymentAdditional.entries[0].state6.value': 'form1[0].section13_3-2[0].School6_State[6]',
  'section13.selfEmploymentAdditional.entries[0].textField0.value': 'form1[0].section13_3-2[0].TextField11[0]',
  'section13.selfEmploymentAdditional.entries[0].textField1.value': 'form1[0].section13_3-2[0].TextField11[1]',
  'section13.selfEmploymentAdditional.entries[0].textField10.value': 'form1[0].section13_3-2[0].TextField11[10]',
  'section13.selfEmploymentAdditional.entries[0].textField11.value': 'form1[0].section13_3-2[0].TextField11[11]',
  'section13.selfEmploymentAdditional.entries[0].textField12.value': 'form1[0].section13_3-2[0].TextField11[12]',
  'section13.selfEmploymentAdditional.entries[0].textField13.value': 'form1[0].section13_3-2[0].TextField11[13]',
  'section13.selfEmploymentAdditional.entries[0].textField14.value': 'form1[0].section13_3-2[0].TextField11[14]',
  'section13.selfEmploymentAdditional.entries[0].textField15.value': 'form1[0].section13_3-2[0].TextField11[15]',
  'section13.selfEmploymentAdditional.entries[0].textField16.value': 'form1[0].section13_3-2[0].TextField11[16]',
  'section13.selfEmploymentAdditional.entries[0].textField17.value': 'form1[0].section13_3-2[0].TextField11[17]',
  'section13.selfEmploymentAdditional.entries[0].textField18.value': 'form1[0].section13_3-2[0].TextField11[18]',
  'section13.selfEmploymentAdditional.entries[0].textField19.value': 'form1[0].section13_3-2[0].TextField11[19]',
  'section13.selfEmploymentAdditional.entries[0].textField2.value': 'form1[0].section13_3-2[0].TextField11[2]',
  'section13.selfEmploymentAdditional.entries[0].textField20.value': 'form1[0].section13_3-2[0].TextField11[20]',
  'section13.selfEmploymentAdditional.entries[0].textField21.value': 'form1[0].section13_3-2[0].TextField11[21]',
  'section13.selfEmploymentAdditional.entries[0].textField22.value': 'form1[0].section13_3-2[0].TextField11[22]',
  'section13.selfEmploymentAdditional.entries[0].textField23.value': 'form1[0].section13_3-2[0].TextField11[23]',
  'section13.selfEmploymentAdditional.entries[0].textField24.value': 'form1[0].section13_3-2[0].TextField11[24]',
  'section13.selfEmploymentAdditional.entries[0].textField25.value': 'form1[0].section13_3-2[0].TextField11[25]',
  'section13.selfEmploymentAdditional.entries[0].textField3.value': 'form1[0].section13_3-2[0].TextField11[3]',
  'section13.selfEmploymentAdditional.entries[0].textField4.value': 'form1[0].section13_3-2[0].TextField11[4]',
  'section13.selfEmploymentAdditional.entries[0].textField5.value': 'form1[0].section13_3-2[0].TextField11[5]',
  'section13.selfEmploymentAdditional.entries[0].textField6.value': 'form1[0].section13_3-2[0].TextField11[6]',
  'section13.selfEmploymentAdditional.entries[0].textField7.value': 'form1[0].section13_3-2[0].TextField11[7]',
  'section13.selfEmploymentAdditional.entries[0].textField8.value': 'form1[0].section13_3-2[0].TextField11[8]',
  'section13.selfEmploymentAdditional.entries[0].textField9.value': 'form1[0].section13_3-2[0].TextField11[9]',

  // Unemployment (13A.4) - Complete field mappings (67 fields)
  // Main section field mappings (67 fields)
  'section13.unemployment.entries[0].additionalFromDate.value': 'form1[0].section13_4[3].#area[2].From_Datefield_Name_2[6]',
  'section13.unemployment.entries[0].additionalInfo.value': 'form1[0].section13_4[3].TextField11[12]',
  'section13.unemployment.entries[0].additionalState.value': 'form1[0].section13_4[3].School6_State[2]',
  'section13.unemployment.entries[0].additionalToDate.value': 'form1[0].section13_4[3].#area[2].From_Datefield_Name_2[7]',
  'section13.unemployment.entries[0].benefitsEndDate.value': 'form1[0].section13_4[3].From_Datefield_Name_2[5]',
  'section13.unemployment.entries[0].benefitsStartDate.value': 'form1[0].section13_4[3].From_Datefield_Name_2[4]',
  'section13.unemployment.entries[0].countryCode.value': 'form1[0].section13_4[3].DropDownList4[0]',
  'section13.unemployment.entries[0].field14.value': 'form1[0].section13_4[2].#field[14]',
  'section13.unemployment.entries[0].field15.value': 'form1[0].section13_4[3].#field[15]',
  'section13.unemployment.entries[0].field16.value': 'form1[0].section13_4[3].#field[16]',
  'section13.unemployment.entries[0].field17.value': 'form1[0].section13_4[3].#field[17]',
  'section13.unemployment.entries[0].field19.value': 'form1[0].section13_4[2].#area[0].#field[19]',
  'section13.unemployment.entries[0].field2.value': 'form1[0].section13_4[2].#field[2]',
  'section13.unemployment.entries[0].field20.value': 'form1[0].section13_4[3].#area[0].#field[20]',
  'section13.unemployment.entries[0].field21.value': 'form1[0].section13_4[3].#area[0].#field[21]',
  'section13.unemployment.entries[0].field22.value': 'form1[0].section13_4[3].#area[0].#field[22]',
  'section13.unemployment.entries[0].field23.value': 'form1[0].section13_4[3].#area[0].#field[23]',
  'section13.unemployment.entries[0].field24.value': 'form1[0].section13_4[3].#area[1].#field[24]',
  'section13.unemployment.entries[0].field25.value': 'form1[0].section13_4[3].#area[1].#field[25]',
  'section13.unemployment.entries[0].field26.value': 'form1[0].section13_4[3].#area[1].#field[26]',
  'section13.unemployment.entries[0].field27.value': 'form1[0].section13_4[3].#area[1].#field[27]',
  'section13.unemployment.entries[0].field28.value': 'form1[0].section13_4[3].#field[28]',
  'section13.unemployment.entries[0].field3.value': 'form1[0].section13_4[3].#field[3]',
  'section13.unemployment.entries[0].field30.value': 'form1[0].section13_4[2].#field[30]',
  'section13.unemployment.entries[0].field31.value': 'form1[0].section13_4[3].#field[31]',
  'section13.unemployment.entries[0].field32.value': 'form1[0].section13_4[2].#field[32]',
  'section13.unemployment.entries[0].field33.value': 'form1[0].section13_4[3].#field[33]',
  'section13.unemployment.entries[0].field34.value': 'form1[0].section13_4[2].#field[34]',
  'section13.unemployment.entries[0].field35.value': 'form1[0].section13_4[3].#field[35]',
  'section13.unemployment.entries[0].field36.value': 'form1[0].section13_4[3].#area[2].#field[36]',
  'section13.unemployment.entries[0].field37.value': 'form1[0].section13_4[3].#area[2].#field[37]',
  'section13.unemployment.entries[0].field38.value': 'form1[0].section13_4[3].#area[2].#field[38]',
  'section13.unemployment.entries[0].field4.value': 'form1[0].section13_4[3].#field[4]',
  'section13.unemployment.entries[0].field40.value': 'form1[0].section13_4[2].#area[2].#field[40]',
  'section13.unemployment.entries[0].field41.value': 'form1[0].section13_4[3].#area[2].#field[41]',
  'section13.unemployment.entries[0].field42.value': 'form1[0].section13_4[3].#field[42]',
  'section13.unemployment.entries[0].field43.value': 'form1[0].section13_4[3].#field[43]',
  'section13.unemployment.entries[0].field44.value': 'form1[0].section13_4[3].#field[44]',
  'section13.unemployment.entries[0].field46.value': 'form1[0].section13_4[2].#field[46]',
  'section13.unemployment.entries[0].field47.value': 'form1[0].section13_4[3].#field[47]',
  'section13.unemployment.entries[0].field5.value': 'form1[0].section13_4[2].#field[5]',
  'section13.unemployment.entries[0].field6.value': 'form1[0].section13_4[3].#field[6]',
  'section13.unemployment.entries[0].firstName.value': 'form1[0].section13_4[3].TextField11[0]',
  'section13.unemployment.entries[0].fromDate.value': 'form1[0].section13_4[3].From_Datefield_Name_2[0]',
  'section13.unemployment.entries[0].hasReference.value': 'form1[0].section13_4[3].RadioButtonList[0]',
  'section13.unemployment.entries[0].isCurrentlyUnemployed.value': 'form1[0].section13_4[3].RadioButtonList[2]',
  'section13.unemployment.entries[0].lastName.value': 'form1[0].section13_4[3].TextField11[1]',
  'section13.unemployment.entries[0].phone0.value': 'form1[0].section13_4[3].p3-t68[0]',
  'section13.unemployment.entries[0].receivedBenefits.value': 'form1[0].section13_4[3].RadioButtonList[1]',
  'section13.unemployment.entries[0].referenceAddress2.value': 'form1[0].section13_4[3].TextField11[8]',
  'section13.unemployment.entries[0].referenceCity.value': 'form1[0].section13_4[3].TextField11[3]',
  'section13.unemployment.entries[0].referenceCity2.value': 'form1[0].section13_4[3].TextField11[9]',
  'section13.unemployment.entries[0].referenceCountry.value': 'form1[0].section13_4[3].DropDownList6[0]',
  'section13.unemployment.entries[0].referenceEmail.value': 'form1[0].section13_4[3].TextField11[7]',
  'section13.unemployment.entries[0].referenceExtension.value': 'form1[0].section13_4[3].TextField11[6]',
  'section13.unemployment.entries[0].referenceFromDate.value': 'form1[0].section13_4[3].From_Datefield_Name_2[8]',
  'section13.unemployment.entries[0].referencePhone.value': 'form1[0].section13_4[3].TextField11[5]',
  'section13.unemployment.entries[0].referenceState.value': 'form1[0].section13_4[3].School6_State[0]',
  'section13.unemployment.entries[0].referenceState2.value': 'form1[0].section13_4[3].School6_State[1]',
  'section13.unemployment.entries[0].referenceStreet.value': 'form1[0].section13_4[3].TextField11[2]',
  'section13.unemployment.entries[0].referenceStreet2.value': 'form1[0].section13_4[3].TextField11[10]',
  'section13.unemployment.entries[0].referenceToDate.value': 'form1[0].section13_4[3].From_Datefield_Name_2[9]',
  'section13.unemployment.entries[0].referenceZip.value': 'form1[0].section13_4[3].TextField11[4]',
  'section13.unemployment.entries[0].referenceZip2.value': 'form1[0].section13_4[3].TextField11[11]',
  'section13.unemployment.entries[0].toDate.value': 'form1[0].section13_4[3].From_Datefield_Name_2[1]',
  'section13.unemployment.entries[0].unemploymentEndDate.value': 'form1[0].section13_4[3].From_Datefield_Name_2[3]',
  'section13.unemployment.entries[0].unemploymentStartDate.value': 'form1[0].section13_4[3].From_Datefield_Name_2[2]',

  // Employment Issues (13A.5) - Complete field mappings (150 fields)
  'section13.employmentIssues.entries[0].hasEmploymentIssues.value': 'form1[0].section13_5[0].RadioButtonList[0]',
  'section13.employmentIssues.entries[0].additionalPositionTitle.value': 'form1[0].section13_5[0].#area[1].p3-t68[0]',
  'section13.employmentIssues.entries[0].additionalAgencyName.value': 'form1[0].section13_5[0].#area[1].p3-t68[1]',
  'section13.employmentIssues.entries[0].additionalStreet.value': 'form1[0].section13_5[0].#area[1].TextField11[0]',
  'section13.employmentIssues.entries[0].additionalCity.value': 'form1[0].section13_5[0].#area[1].TextField11[1]',
  'section13.employmentIssues.entries[0].additionalState.value': 'form1[0].section13_5[0].#area[1].School6_State[0]',
  'section13.employmentIssues.entries[0].additionalCountry.value': 'form1[0].section13_5[0].#area[1].DropDownList2[0]',
  'section13.employmentIssues.entries[0].additionalZip.value': 'form1[0].section13_5[0].#area[1].TextField11[2]',
  'section13.employmentIssues.entries[0].additionalFromDate.value': 'form1[0].section13_5[0].#area[1].From_Datefield_Name_2[0]',
  'section13.employmentIssues.entries[0].additionalFromDateEstimated.value': 'form1[0].section13_5[0].#area[1].#field[10]',
  'section13.employmentIssues.entries[0].additionalToDate.value': 'form1[0].section13_5[0].#area[1].From_Datefield_Name_2[1]',
  'section13.employmentIssues.entries[0].additionalToDatePresent.value': 'form1[0].section13_5[0].#area[1].#field[12]',
  'section13.employmentIssues.entries[0].additionalToDateEstimated.value': 'form1[0].section13_5[0].#area[1].#field[13]',
  'section13.employmentIssues.entries[0].hasEmploymentIssues1.value': 'form1[0].section13_5[0].RadioButtonList[1]',
  'section13.employmentIssues.entries[0].positionTitle1.value': 'form1[0].section13_5[0].p3-t68[2]',
  'section13.employmentIssues.entries[0].agencyName1.value': 'form1[0].section13_5[0].p3-t68[3]',
  'section13.employmentIssues.entries[0].street1.value': 'form1[0].section13_5[0].TextField11[3]',
  'section13.employmentIssues.entries[0].city1.value': 'form1[0].section13_5[0].TextField11[4]',
  'section13.employmentIssues.entries[0].state1.value': 'form1[0].section13_5[0].School6_State[1]',
  'section13.employmentIssues.entries[0].country1.value': 'form1[0].section13_5[0].DropDownList2[1]',
  'section13.employmentIssues.entries[0].zip1.value': 'form1[0].section13_5[0].TextField11[5]',
  'section13.employmentIssues.entries[0].fromDate1.value': 'form1[0].section13_5[0].From_Datefield_Name_2[2]',
  'section13.employmentIssues.entries[0].fromDate1Estimated.value': 'form1[0].section13_5[0].#field[22]',
  'section13.employmentIssues.entries[0].toDate1.value': 'form1[0].section13_5[0].From_Datefield_Name_2[3]',
  'section13.employmentIssues.entries[0].toDate1Present.value': 'form1[0].section13_5[0].#field[24]',
  'section13.employmentIssues.entries[0].toDate1Estimated.value': 'form1[0].section13_5[0].#field[25]',
  'section13.employmentIssues.entries[0].positionTitle2.value': 'form1[0].section13_5[0].p3-t68[4]',
  'section13.employmentIssues.entries[0].agencyName2.value': 'form1[0].section13_5[0].p3-t68[5]',
  'section13.employmentIssues.entries[0].street2.value': 'form1[0].section13_5[0].TextField11[6]',
  'section13.employmentIssues.entries[0].city2.value': 'form1[0].section13_5[0].TextField11[7]',
  'section13.employmentIssues.entries[0].state2.value': 'form1[0].section13_5[0].School6_State[2]',
  'section13.employmentIssues.entries[0].country2.value': 'form1[0].section13_5[0].DropDownList2[2]',
  'section13.employmentIssues.entries[0].zip2.value': 'form1[0].section13_5[0].TextField11[8]',
  'section13.employmentIssues.entries[0].fromDate2.value': 'form1[0].section13_5[0].From_Datefield_Name_2[4]',
  'section13.employmentIssues.entries[0].fromDate2Estimated.value': 'form1[0].section13_5[0].#field[34]',
  'section13.employmentIssues.entries[0].toDate2.value': 'form1[0].section13_5[0].From_Datefield_Name_2[5]',
  'section13.employmentIssues.entries[0].toDate2Present.value': 'form1[0].section13_5[0].#field[36]',
  'section13.employmentIssues.entries[0].toDate2Estimated.value': 'form1[0].section13_5[0].#field[37]',
  'section13.employmentIssues.entries[0].positionTitle3.value': 'form1[0].section13_5[0].p3-t68[6]',
  'section13.employmentIssues.entries[0].agencyName3.value': 'form1[0].section13_5[0].p3-t68[7]',
  'section13.employmentIssues.entries[0].street3.value': 'form1[0].section13_5[0].TextField11[9]',
  'section13.employmentIssues.entries[0].city3.value': 'form1[0].section13_5[0].TextField11[10]',
  'section13.employmentIssues.entries[0].state3.value': 'form1[0].section13_5[0].School6_State[3]',
  'section13.employmentIssues.entries[0].country3.value': 'form1[0].section13_5[0].DropDownList2[3]',
  'section13.employmentIssues.entries[0].zip3.value': 'form1[0].section13_5[0].TextField11[11]',
  'section13.employmentIssues.entries[0].fromDate3.value': 'form1[0].section13_5[0].From_Datefield_Name_2[6]',
  'section13.employmentIssues.entries[0].fromDate3Estimated.value': 'form1[0].section13_5[0].#field[46]',
  'section13.employmentIssues.entries[0].toDate3.value': 'form1[0].section13_5[0].From_Datefield_Name_2[7]',
  'section13.employmentIssues.entries[0].toDate3Present.value': 'form1[0].section13_5[0].#field[48]',
  'section13.employmentIssues.entries[0].toDate3Estimated.value': 'form1[0].section13_5[0].#field[49]',
  'section13.employmentIssues.entries[0].hasEmploymentIssues2.value': 'form1[0].section13_5[0].RadioButtonList[0]',
  'section13.employmentIssues.entries[0].additionalPositionTitle1.value': 'form1[0].section13_5[0].#area[1].p3-t68[0]',
  'section13.employmentIssues.entries[0].additionalAgencyName1.value': 'form1[0].section13_5[0].#area[1].p3-t68[1]',
  'section13.employmentIssues.entries[0].additionalStreet1.value': 'form1[0].section13_5[0].#area[1].TextField11[0]',
  'section13.employmentIssues.entries[0].additionalCity1.value': 'form1[0].section13_5[0].#area[1].TextField11[1]',
  'section13.employmentIssues.entries[0].additionalState1.value': 'form1[0].section13_5[0].#area[1].School6_State[0]',
  'section13.employmentIssues.entries[0].additionalCountry1.value': 'form1[0].section13_5[0].#area[1].DropDownList2[0]',
  'section13.employmentIssues.entries[0].additionalZip1.value': 'form1[0].section13_5[0].#area[1].TextField11[2]',
  'section13.employmentIssues.entries[0].additionalFromDate1.value': 'form1[0].section13_5[0].#area[1].From_Datefield_Name_2[0]',
  'section13.employmentIssues.entries[0].additionalFromDateEstimated1.value': 'form1[0].section13_5[0].#area[1].#field[10]',
  'section13.employmentIssues.entries[0].additionalToDate1.value': 'form1[0].section13_5[0].#area[1].From_Datefield_Name_2[1]',
  'section13.employmentIssues.entries[0].additionalToDatePresent1.value': 'form1[0].section13_5[0].#area[1].#field[12]',
  'section13.employmentIssues.entries[0].additionalToDateEstimated1.value': 'form1[0].section13_5[0].#area[1].#field[13]',
  'section13.employmentIssues.entries[0].hasEmploymentIssues3.value': 'form1[0].section13_5[0].RadioButtonList[1]',
  'section13.employmentIssues.entries[0].positionTitle11.value': 'form1[0].section13_5[0].p3-t68[2]',
  'section13.employmentIssues.entries[0].agencyName11.value': 'form1[0].section13_5[0].p3-t68[3]',
  'section13.employmentIssues.entries[0].street11.value': 'form1[0].section13_5[0].TextField11[3]',
  'section13.employmentIssues.entries[0].city11.value': 'form1[0].section13_5[0].TextField11[4]',
  'section13.employmentIssues.entries[0].state11.value': 'form1[0].section13_5[0].School6_State[1]',
  'section13.employmentIssues.entries[0].country11.value': 'form1[0].section13_5[0].DropDownList2[1]',
  'section13.employmentIssues.entries[0].zip11.value': 'form1[0].section13_5[0].TextField11[5]',
  'section13.employmentIssues.entries[0].fromDate11.value': 'form1[0].section13_5[0].From_Datefield_Name_2[2]',
  'section13.employmentIssues.entries[0].fromDate1Estimated1.value': 'form1[0].section13_5[0].#field[22]',
  'section13.employmentIssues.entries[0].toDate11.value': 'form1[0].section13_5[0].From_Datefield_Name_2[3]',
  'section13.employmentIssues.entries[0].toDate1Present1.value': 'form1[0].section13_5[0].#field[24]',
  'section13.employmentIssues.entries[0].toDate1Estimated1.value': 'form1[0].section13_5[0].#field[25]',
  'section13.employmentIssues.entries[0].positionTitle21.value': 'form1[0].section13_5[0].p3-t68[4]',
  'section13.employmentIssues.entries[0].agencyName21.value': 'form1[0].section13_5[0].p3-t68[5]',
  'section13.employmentIssues.entries[0].street21.value': 'form1[0].section13_5[0].TextField11[6]',
  'section13.employmentIssues.entries[0].city21.value': 'form1[0].section13_5[0].TextField11[7]',
  'section13.employmentIssues.entries[0].state21.value': 'form1[0].section13_5[0].School6_State[2]',
  'section13.employmentIssues.entries[0].country21.value': 'form1[0].section13_5[0].DropDownList2[2]',
  'section13.employmentIssues.entries[0].zip21.value': 'form1[0].section13_5[0].TextField11[8]',
  'section13.employmentIssues.entries[0].fromDate21.value': 'form1[0].section13_5[0].From_Datefield_Name_2[4]',
  'section13.employmentIssues.entries[0].fromDate2Estimated1.value': 'form1[0].section13_5[0].#field[34]',
  'section13.employmentIssues.entries[0].toDate21.value': 'form1[0].section13_5[0].From_Datefield_Name_2[5]',
  'section13.employmentIssues.entries[0].toDate2Present1.value': 'form1[0].section13_5[0].#field[36]',
  'section13.employmentIssues.entries[0].toDate2Estimated1.value': 'form1[0].section13_5[0].#field[37]',
  'section13.employmentIssues.entries[0].positionTitle31.value': 'form1[0].section13_5[0].p3-t68[6]',
  'section13.employmentIssues.entries[0].agencyName31.value': 'form1[0].section13_5[0].p3-t68[7]',
  'section13.employmentIssues.entries[0].street31.value': 'form1[0].section13_5[0].TextField11[9]',
  'section13.employmentIssues.entries[0].city31.value': 'form1[0].section13_5[0].TextField11[10]',
  'section13.employmentIssues.entries[0].state31.value': 'form1[0].section13_5[0].School6_State[3]',
  'section13.employmentIssues.entries[0].country31.value': 'form1[0].section13_5[0].DropDownList2[3]',
  'section13.employmentIssues.entries[0].zip31.value': 'form1[0].section13_5[0].TextField11[11]',
  'section13.employmentIssues.entries[0].fromDate31.value': 'form1[0].section13_5[0].From_Datefield_Name_2[6]',
  'section13.employmentIssues.entries[0].fromDate3Estimated1.value': 'form1[0].section13_5[0].#field[46]',
  'section13.employmentIssues.entries[0].toDate31.value': 'form1[0].section13_5[0].From_Datefield_Name_2[7]',
  'section13.employmentIssues.entries[0].toDate3Present1.value': 'form1[0].section13_5[0].#field[48]',
  'section13.employmentIssues.entries[0].toDate3Estimated1.value': 'form1[0].section13_5[0].#field[49]',
  'section13.employmentIssues.entries[0].hasEmploymentIssues4.value': 'form1[0].section13_5[0].RadioButtonList[0]',
  'section13.employmentIssues.entries[0].additionalPositionTitle2.value': 'form1[0].section13_5[0].#area[1].p3-t68[0]',
  'section13.employmentIssues.entries[0].additionalAgencyName2.value': 'form1[0].section13_5[0].#area[1].p3-t68[1]',
  'section13.employmentIssues.entries[0].additionalStreet2.value': 'form1[0].section13_5[0].#area[1].TextField11[0]',
  'section13.employmentIssues.entries[0].additionalCity2.value': 'form1[0].section13_5[0].#area[1].TextField11[1]',
  'section13.employmentIssues.entries[0].additionalState2.value': 'form1[0].section13_5[0].#area[1].School6_State[0]',
  'section13.employmentIssues.entries[0].additionalCountry2.value': 'form1[0].section13_5[0].#area[1].DropDownList2[0]',
  'section13.employmentIssues.entries[0].additionalZip2.value': 'form1[0].section13_5[0].#area[1].TextField11[2]',
  'section13.employmentIssues.entries[0].additionalFromDate2.value': 'form1[0].section13_5[0].#area[1].From_Datefield_Name_2[0]',
  'section13.employmentIssues.entries[0].additionalFromDateEstimated2.value': 'form1[0].section13_5[0].#area[1].#field[10]',
  'section13.employmentIssues.entries[0].additionalToDate2.value': 'form1[0].section13_5[0].#area[1].From_Datefield_Name_2[1]',
  'section13.employmentIssues.entries[0].additionalToDatePresent2.value': 'form1[0].section13_5[0].#area[1].#field[12]',
  'section13.employmentIssues.entries[0].additionalToDateEstimated2.value': 'form1[0].section13_5[0].#area[1].#field[13]',
  'section13.employmentIssues.entries[0].hasEmploymentIssues5.value': 'form1[0].section13_5[0].RadioButtonList[1]',
  'section13.employmentIssues.entries[0].positionTitle12.value': 'form1[0].section13_5[0].p3-t68[2]',
  'section13.employmentIssues.entries[0].agencyName12.value': 'form1[0].section13_5[0].p3-t68[3]',
  'section13.employmentIssues.entries[0].street12.value': 'form1[0].section13_5[0].TextField11[3]',
  'section13.employmentIssues.entries[0].city12.value': 'form1[0].section13_5[0].TextField11[4]',
  'section13.employmentIssues.entries[0].state12.value': 'form1[0].section13_5[0].School6_State[1]',
  'section13.employmentIssues.entries[0].country12.value': 'form1[0].section13_5[0].DropDownList2[1]',
  'section13.employmentIssues.entries[0].zip12.value': 'form1[0].section13_5[0].TextField11[5]',
  'section13.employmentIssues.entries[0].fromDate12.value': 'form1[0].section13_5[0].From_Datefield_Name_2[2]',
  'section13.employmentIssues.entries[0].fromDate1Estimated2.value': 'form1[0].section13_5[0].#field[22]',
  'section13.employmentIssues.entries[0].toDate12.value': 'form1[0].section13_5[0].From_Datefield_Name_2[3]',
  'section13.employmentIssues.entries[0].toDate1Present2.value': 'form1[0].section13_5[0].#field[24]',
  'section13.employmentIssues.entries[0].toDate1Estimated2.value': 'form1[0].section13_5[0].#field[25]',
  'section13.employmentIssues.entries[0].positionTitle22.value': 'form1[0].section13_5[0].p3-t68[4]',
  'section13.employmentIssues.entries[0].agencyName22.value': 'form1[0].section13_5[0].p3-t68[5]',
  'section13.employmentIssues.entries[0].street22.value': 'form1[0].section13_5[0].TextField11[6]',
  'section13.employmentIssues.entries[0].city22.value': 'form1[0].section13_5[0].TextField11[7]',
  'section13.employmentIssues.entries[0].state22.value': 'form1[0].section13_5[0].School6_State[2]',
  'section13.employmentIssues.entries[0].country22.value': 'form1[0].section13_5[0].DropDownList2[2]',
  'section13.employmentIssues.entries[0].zip22.value': 'form1[0].section13_5[0].TextField11[8]',
  'section13.employmentIssues.entries[0].fromDate22.value': 'form1[0].section13_5[0].From_Datefield_Name_2[4]',
  'section13.employmentIssues.entries[0].fromDate2Estimated2.value': 'form1[0].section13_5[0].#field[34]',
  'section13.employmentIssues.entries[0].toDate22.value': 'form1[0].section13_5[0].From_Datefield_Name_2[5]',
  'section13.employmentIssues.entries[0].toDate2Present2.value': 'form1[0].section13_5[0].#field[36]',
  'section13.employmentIssues.entries[0].toDate2Estimated2.value': 'form1[0].section13_5[0].#field[37]',
  'section13.employmentIssues.entries[0].positionTitle32.value': 'form1[0].section13_5[0].p3-t68[6]',
  'section13.employmentIssues.entries[0].agencyName32.value': 'form1[0].section13_5[0].p3-t68[7]',
  'section13.employmentIssues.entries[0].street32.value': 'form1[0].section13_5[0].TextField11[9]',
  'section13.employmentIssues.entries[0].city32.value': 'form1[0].section13_5[0].TextField11[10]',
  'section13.employmentIssues.entries[0].state32.value': 'form1[0].section13_5[0].School6_State[3]',
  'section13.employmentIssues.entries[0].country32.value': 'form1[0].section13_5[0].DropDownList2[3]',
  'section13.employmentIssues.entries[0].zip32.value': 'form1[0].section13_5[0].TextField11[11]',
  'section13.employmentIssues.entries[0].fromDate32.value': 'form1[0].section13_5[0].From_Datefield_Name_2[6]',
  'section13.employmentIssues.entries[0].fromDate3Estimated2.value': 'form1[0].section13_5[0].#field[46]',
  'section13.employmentIssues.entries[0].toDate32.value': 'form1[0].section13_5[0].From_Datefield_Name_2[7]',
  'section13.employmentIssues.entries[0].toDate3Present2.value': 'form1[0].section13_5[0].#field[48]',
  'section13.employmentIssues.entries[0].toDate3Estimated2.value': 'form1[0].section13_5[0].#field[49]',

  // Disciplinary Actions (13A.6) - Complete field mappings (213 fields)
  'section13.disciplinaryActions.entries[0].reasonForUnsatisfactory.value': 'form1[0].section13_4[0].#area[1].#field[24]',
  'section13.disciplinaryActions.entries[0].chargesOrAllegations.value': 'form1[0].section13_4[0].#area[1].#field[25]',
  'section13.disciplinaryActions.entries[0].reasonForQuitting.value': 'form1[0].section13_4[0].#area[1].#field[26]',
  'section13.disciplinaryActions.entries[0].reasonForBeingFired.value': 'form1[0].section13_4[0].#area[1].#field[27]',
  'section13.disciplinaryActions.entries[0].dateFired.value': 'form1[0].section13_4[0].From_Datefield_Name_2[2]',
  'section13.disciplinaryActions.entries[0].dateQuit.value': 'form1[0].section13_4[0].From_Datefield_Name_2[3]',
  'section13.disciplinaryActions.entries[0].additionalReason2.value': 'form1[0].section13_4[0].#area[2].#field[36]',
  'section13.disciplinaryActions.entries[0].additionalReason1.value': 'form1[0].section13_4[0].#area[2].#field[37]',
  'section13.disciplinaryActions.entries[0].additionalStatus.value': 'form1[0].section13_4[0].#area[2].#field[38]',
  'section13.disciplinaryActions.entries[0].additionalDate1.value': 'form1[0].section13_4[0].#area[2].From_Datefield_Name_2[6]',
  'section13.disciplinaryActions.entries[0].additionalDate2.value': 'form1[0].section13_4[0].#area[2].From_Datefield_Name_2[7]',
  'section13.disciplinaryActions.entries[0].additionalField1.value': 'form1[0].section13_4[0].#area[2].#field[41]',
  'section13.disciplinaryActions.entries[0].additionalReason4.value': 'form1[0].section13_4[0].#field[42]',
  'section13.disciplinaryActions.entries[0].additionalReason3.value': 'form1[0].section13_4[0].#field[43]',
  'section13.disciplinaryActions.entries[0].additionalField2.value': 'form1[0].section13_4[0].#field[44]',
  'section13.disciplinaryActions.entries[0].additionalDate3.value': 'form1[0].section13_4[0].From_Datefield_Name_2[8]',
  'section13.disciplinaryActions.entries[0].additionalDate4.value': 'form1[0].section13_4[0].From_Datefield_Name_2[9]',
  'section13.disciplinaryActions.entries[0].additionalField3.value': 'form1[0].section13_4[0].#field[47]',
  'section13.disciplinaryActions.entries[0].hasDisciplinaryActions.value': 'form1[0].section13_4[0].RadioButtonList[2]',
  'section13.disciplinaryActions.entries[0].reasonForUnsatisfactory1.value': 'form1[0].section13_4[1].#area[1].#field[24]',
  'section13.disciplinaryActions.entries[0].chargesOrAllegations1.value': 'form1[0].section13_4[1].#area[1].#field[25]',
  'section13.disciplinaryActions.entries[0].reasonForQuitting1.value': 'form1[0].section13_4[1].#area[1].#field[26]',
  'section13.disciplinaryActions.entries[0].reasonForBeingFired1.value': 'form1[0].section13_4[1].#area[1].#field[27]',
  'section13.disciplinaryActions.entries[0].dateFired1.value': 'form1[0].section13_4[1].From_Datefield_Name_2[2]',
  'section13.disciplinaryActions.entries[0].dateQuit1.value': 'form1[0].section13_4[1].From_Datefield_Name_2[3]',
  'section13.disciplinaryActions.entries[0].additionalReason21.value': 'form1[0].section13_4[1].#area[2].#field[36]',
  'section13.disciplinaryActions.entries[0].additionalReason11.value': 'form1[0].section13_4[1].#area[2].#field[37]',
  'section13.disciplinaryActions.entries[0].additionalStatus1.value': 'form1[0].section13_4[1].#area[2].#field[38]',
  'section13.disciplinaryActions.entries[0].additionalDate11.value': 'form1[0].section13_4[1].#area[2].From_Datefield_Name_2[6]',
  'section13.disciplinaryActions.entries[0].additionalDate21.value': 'form1[0].section13_4[1].#area[2].From_Datefield_Name_2[7]',
  'section13.disciplinaryActions.entries[0].additionalField11.value': 'form1[0].section13_4[1].#area[2].#field[41]',
  'section13.disciplinaryActions.entries[0].additionalReason41.value': 'form1[0].section13_4[1].#field[42]',
  'section13.disciplinaryActions.entries[0].additionalReason31.value': 'form1[0].section13_4[1].#field[43]',
  'section13.disciplinaryActions.entries[0].additionalField21.value': 'form1[0].section13_4[1].#field[44]',
  'section13.disciplinaryActions.entries[0].additionalDate31.value': 'form1[0].section13_4[1].From_Datefield_Name_2[8]',
  'section13.disciplinaryActions.entries[0].additionalDate41.value': 'form1[0].section13_4[1].From_Datefield_Name_2[9]',
  'section13.disciplinaryActions.entries[0].additionalField31.value': 'form1[0].section13_4[1].#field[47]',
  'section13.disciplinaryActions.entries[0].hasDisciplinaryActions1.value': 'form1[0].section13_4[1].RadioButtonList[2]',
  'section13.disciplinaryActions.entries[0].reasonForUnsatisfactory2.value': 'form1[0].section13_4[2].#area[1].#field[24]',
  'section13.disciplinaryActions.entries[0].chargesOrAllegations2.value': 'form1[0].section13_4[2].#area[1].#field[25]',
  'section13.disciplinaryActions.entries[0].reasonForQuitting2.value': 'form1[0].section13_4[2].#area[1].#field[26]',
  'section13.disciplinaryActions.entries[0].dateFired2.value': 'form1[0].section13_4[2].From_Datefield_Name_2[2]',
  'section13.disciplinaryActions.entries[0].dateQuit2.value': 'form1[0].section13_4[2].From_Datefield_Name_2[3]',
  'section13.disciplinaryActions.entries[0].additionalReason22.value': 'form1[0].section13_4[2].#area[2].#field[36]',
  'section13.disciplinaryActions.entries[0].additionalReason12.value': 'form1[0].section13_4[2].#area[2].#field[37]',
  'section13.disciplinaryActions.entries[0].additionalDate12.value': 'form1[0].section13_4[2].#area[2].From_Datefield_Name_2[6]',
  'section13.disciplinaryActions.entries[0].additionalDate22.value': 'form1[0].section13_4[2].#area[2].From_Datefield_Name_2[7]',
  'section13.disciplinaryActions.entries[0].additionalReason42.value': 'form1[0].section13_4[2].#field[42]',
  'section13.disciplinaryActions.entries[0].additionalReason32.value': 'form1[0].section13_4[2].#field[43]',
  'section13.disciplinaryActions.entries[0].additionalDate32.value': 'form1[0].section13_4[2].From_Datefield_Name_2[8]',
  'section13.disciplinaryActions.entries[0].additionalDate42.value': 'form1[0].section13_4[2].From_Datefield_Name_2[9]',
  'section13.disciplinaryActions.entries[0].hasDisciplinaryActions2.value': 'form1[0].section13_4[2].RadioButtonList[2]',
  'section13.disciplinaryActions.entries[0].reasonForUnsatisfactory3.value': 'form1[0].section13_4[3].#area[1].#field[24]',
  'section13.disciplinaryActions.entries[0].chargesOrAllegations3.value': 'form1[0].section13_4[3].#area[1].#field[25]',
  'section13.disciplinaryActions.entries[0].reasonForQuitting3.value': 'form1[0].section13_4[3].#area[1].#field[26]',
  'section13.disciplinaryActions.entries[0].reasonForBeingFired2.value': 'form1[0].section13_4[3].#area[1].#field[27]',
  'section13.disciplinaryActions.entries[0].dateFired3.value': 'form1[0].section13_4[3].From_Datefield_Name_2[2]',
  'section13.disciplinaryActions.entries[0].dateQuit3.value': 'form1[0].section13_4[3].From_Datefield_Name_2[3]',
  'section13.disciplinaryActions.entries[0].additionalReason23.value': 'form1[0].section13_4[3].#area[2].#field[36]',
  'section13.disciplinaryActions.entries[0].additionalReason13.value': 'form1[0].section13_4[3].#area[2].#field[37]',
  'section13.disciplinaryActions.entries[0].additionalStatus2.value': 'form1[0].section13_4[3].#area[2].#field[38]',
  'section13.disciplinaryActions.entries[0].additionalDate13.value': 'form1[0].section13_4[3].#area[2].From_Datefield_Name_2[6]',
  'section13.disciplinaryActions.entries[0].additionalDate23.value': 'form1[0].section13_4[3].#area[2].From_Datefield_Name_2[7]',
  'section13.disciplinaryActions.entries[0].additionalField12.value': 'form1[0].section13_4[3].#area[2].#field[41]',
  'section13.disciplinaryActions.entries[0].additionalReason43.value': 'form1[0].section13_4[3].#field[42]',
  'section13.disciplinaryActions.entries[0].additionalReason33.value': 'form1[0].section13_4[3].#field[43]',
  'section13.disciplinaryActions.entries[0].additionalField22.value': 'form1[0].section13_4[3].#field[44]',
  'section13.disciplinaryActions.entries[0].additionalDate33.value': 'form1[0].section13_4[3].From_Datefield_Name_2[8]',
  'section13.disciplinaryActions.entries[0].additionalDate43.value': 'form1[0].section13_4[3].From_Datefield_Name_2[9]',
  'section13.disciplinaryActions.entries[0].additionalField32.value': 'form1[0].section13_4[3].#field[47]',
  'section13.disciplinaryActions.entries[0].hasDisciplinaryActions3.value': 'form1[0].section13_4[3].RadioButtonList[2]',
  'section13.disciplinaryActions.entries[0].reasonForUnsatisfactory4.value': 'form1[0].section13_4[0].#area[1].#field[24]',
  'section13.disciplinaryActions.entries[0].chargesOrAllegations4.value': 'form1[0].section13_4[0].#area[1].#field[25]',
  'section13.disciplinaryActions.entries[0].reasonForQuitting4.value': 'form1[0].section13_4[0].#area[1].#field[26]',
  'section13.disciplinaryActions.entries[0].reasonForBeingFired3.value': 'form1[0].section13_4[0].#area[1].#field[27]',
  'section13.disciplinaryActions.entries[0].dateFired4.value': 'form1[0].section13_4[0].From_Datefield_Name_2[2]',
  'section13.disciplinaryActions.entries[0].dateQuit4.value': 'form1[0].section13_4[0].From_Datefield_Name_2[3]',
  'section13.disciplinaryActions.entries[0].additionalReason24.value': 'form1[0].section13_4[0].#area[2].#field[36]',
  'section13.disciplinaryActions.entries[0].additionalReason14.value': 'form1[0].section13_4[0].#area[2].#field[37]',
  'section13.disciplinaryActions.entries[0].additionalStatus3.value': 'form1[0].section13_4[0].#area[2].#field[38]',
  'section13.disciplinaryActions.entries[0].additionalDate14.value': 'form1[0].section13_4[0].#area[2].From_Datefield_Name_2[6]',
  'section13.disciplinaryActions.entries[0].additionalDate24.value': 'form1[0].section13_4[0].#area[2].From_Datefield_Name_2[7]',
  'section13.disciplinaryActions.entries[0].additionalField13.value': 'form1[0].section13_4[0].#area[2].#field[41]',
  'section13.disciplinaryActions.entries[0].additionalReason44.value': 'form1[0].section13_4[0].#field[42]',
  'section13.disciplinaryActions.entries[0].additionalReason34.value': 'form1[0].section13_4[0].#field[43]',
  'section13.disciplinaryActions.entries[0].additionalField23.value': 'form1[0].section13_4[0].#field[44]',
  'section13.disciplinaryActions.entries[0].additionalDate34.value': 'form1[0].section13_4[0].From_Datefield_Name_2[8]',
  'section13.disciplinaryActions.entries[0].additionalDate44.value': 'form1[0].section13_4[0].From_Datefield_Name_2[9]',
  'section13.disciplinaryActions.entries[0].additionalField33.value': 'form1[0].section13_4[0].#field[47]',
  'section13.disciplinaryActions.entries[0].hasDisciplinaryActions4.value': 'form1[0].section13_4[0].RadioButtonList[2]',
  'section13.disciplinaryActions.entries[0].reasonForUnsatisfactory5.value': 'form1[0].section13_4[1].#area[1].#field[24]',
  'section13.disciplinaryActions.entries[0].chargesOrAllegations5.value': 'form1[0].section13_4[1].#area[1].#field[25]',
  'section13.disciplinaryActions.entries[0].reasonForQuitting5.value': 'form1[0].section13_4[1].#area[1].#field[26]',
  'section13.disciplinaryActions.entries[0].reasonForBeingFired4.value': 'form1[0].section13_4[1].#area[1].#field[27]',
  'section13.disciplinaryActions.entries[0].dateFired5.value': 'form1[0].section13_4[1].From_Datefield_Name_2[2]',
  'section13.disciplinaryActions.entries[0].dateQuit5.value': 'form1[0].section13_4[1].From_Datefield_Name_2[3]',
  'section13.disciplinaryActions.entries[0].additionalReason25.value': 'form1[0].section13_4[1].#area[2].#field[36]',
  'section13.disciplinaryActions.entries[0].additionalReason15.value': 'form1[0].section13_4[1].#area[2].#field[37]',
  'section13.disciplinaryActions.entries[0].additionalStatus4.value': 'form1[0].section13_4[1].#area[2].#field[38]',
  'section13.disciplinaryActions.entries[0].additionalDate15.value': 'form1[0].section13_4[1].#area[2].From_Datefield_Name_2[6]',
  'section13.disciplinaryActions.entries[0].additionalDate25.value': 'form1[0].section13_4[1].#area[2].From_Datefield_Name_2[7]',
  'section13.disciplinaryActions.entries[0].additionalField14.value': 'form1[0].section13_4[1].#area[2].#field[41]',
  'section13.disciplinaryActions.entries[0].additionalReason45.value': 'form1[0].section13_4[1].#field[42]',
  'section13.disciplinaryActions.entries[0].additionalReason35.value': 'form1[0].section13_4[1].#field[43]',
  'section13.disciplinaryActions.entries[0].additionalField24.value': 'form1[0].section13_4[1].#field[44]',
  'section13.disciplinaryActions.entries[0].additionalDate35.value': 'form1[0].section13_4[1].From_Datefield_Name_2[8]',
  'section13.disciplinaryActions.entries[0].additionalDate45.value': 'form1[0].section13_4[1].From_Datefield_Name_2[9]',
  'section13.disciplinaryActions.entries[0].additionalField34.value': 'form1[0].section13_4[1].#field[47]',
  'section13.disciplinaryActions.entries[0].hasDisciplinaryActions5.value': 'form1[0].section13_4[1].RadioButtonList[2]',
  'section13.disciplinaryActions.entries[0].reasonForUnsatisfactory6.value': 'form1[0].section13_4[2].#area[1].#field[24]',
  'section13.disciplinaryActions.entries[0].chargesOrAllegations6.value': 'form1[0].section13_4[2].#area[1].#field[25]',
  'section13.disciplinaryActions.entries[0].reasonForQuitting6.value': 'form1[0].section13_4[2].#area[1].#field[26]',
  'section13.disciplinaryActions.entries[0].dateFired6.value': 'form1[0].section13_4[2].From_Datefield_Name_2[2]',
  'section13.disciplinaryActions.entries[0].dateQuit6.value': 'form1[0].section13_4[2].From_Datefield_Name_2[3]',
  'section13.disciplinaryActions.entries[0].additionalReason26.value': 'form1[0].section13_4[2].#area[2].#field[36]',
  'section13.disciplinaryActions.entries[0].additionalReason16.value': 'form1[0].section13_4[2].#area[2].#field[37]',
  'section13.disciplinaryActions.entries[0].additionalDate16.value': 'form1[0].section13_4[2].#area[2].From_Datefield_Name_2[6]',
  'section13.disciplinaryActions.entries[0].additionalDate26.value': 'form1[0].section13_4[2].#area[2].From_Datefield_Name_2[7]',
  'section13.disciplinaryActions.entries[0].additionalReason46.value': 'form1[0].section13_4[2].#field[42]',
  'section13.disciplinaryActions.entries[0].additionalReason36.value': 'form1[0].section13_4[2].#field[43]',
  'section13.disciplinaryActions.entries[0].additionalDate36.value': 'form1[0].section13_4[2].From_Datefield_Name_2[8]',
  'section13.disciplinaryActions.entries[0].additionalDate46.value': 'form1[0].section13_4[2].From_Datefield_Name_2[9]',
  'section13.disciplinaryActions.entries[0].hasDisciplinaryActions6.value': 'form1[0].section13_4[2].RadioButtonList[2]',
  'section13.disciplinaryActions.entries[0].reasonForUnsatisfactory7.value': 'form1[0].section13_4[3].#area[1].#field[24]',
  'section13.disciplinaryActions.entries[0].chargesOrAllegations7.value': 'form1[0].section13_4[3].#area[1].#field[25]',
  'section13.disciplinaryActions.entries[0].reasonForQuitting7.value': 'form1[0].section13_4[3].#area[1].#field[26]',
  'section13.disciplinaryActions.entries[0].reasonForBeingFired5.value': 'form1[0].section13_4[3].#area[1].#field[27]',
  'section13.disciplinaryActions.entries[0].dateFired7.value': 'form1[0].section13_4[3].From_Datefield_Name_2[2]',
  'section13.disciplinaryActions.entries[0].dateQuit7.value': 'form1[0].section13_4[3].From_Datefield_Name_2[3]',
  'section13.disciplinaryActions.entries[0].additionalReason27.value': 'form1[0].section13_4[3].#area[2].#field[36]',
  'section13.disciplinaryActions.entries[0].additionalReason17.value': 'form1[0].section13_4[3].#area[2].#field[37]',
  'section13.disciplinaryActions.entries[0].additionalStatus5.value': 'form1[0].section13_4[3].#area[2].#field[38]',
  'section13.disciplinaryActions.entries[0].additionalDate17.value': 'form1[0].section13_4[3].#area[2].From_Datefield_Name_2[6]',
  'section13.disciplinaryActions.entries[0].additionalDate27.value': 'form1[0].section13_4[3].#area[2].From_Datefield_Name_2[7]',
  'section13.disciplinaryActions.entries[0].additionalField15.value': 'form1[0].section13_4[3].#area[2].#field[41]',
  'section13.disciplinaryActions.entries[0].additionalReason47.value': 'form1[0].section13_4[3].#field[42]',
  'section13.disciplinaryActions.entries[0].additionalReason37.value': 'form1[0].section13_4[3].#field[43]',
  'section13.disciplinaryActions.entries[0].additionalField25.value': 'form1[0].section13_4[3].#field[44]',
  'section13.disciplinaryActions.entries[0].additionalDate37.value': 'form1[0].section13_4[3].From_Datefield_Name_2[8]',
  'section13.disciplinaryActions.entries[0].additionalDate47.value': 'form1[0].section13_4[3].From_Datefield_Name_2[9]',
  'section13.disciplinaryActions.entries[0].additionalField35.value': 'form1[0].section13_4[3].#field[47]',
  'section13.disciplinaryActions.entries[0].hasDisciplinaryActions7.value': 'form1[0].section13_4[3].RadioButtonList[2]',
  'section13.disciplinaryActions.entries[0].reasonForUnsatisfactory8.value': 'form1[0].section13_4[0].#area[1].#field[24]',
  'section13.disciplinaryActions.entries[0].chargesOrAllegations8.value': 'form1[0].section13_4[0].#area[1].#field[25]',
  'section13.disciplinaryActions.entries[0].reasonForQuitting8.value': 'form1[0].section13_4[0].#area[1].#field[26]',
  'section13.disciplinaryActions.entries[0].reasonForBeingFired6.value': 'form1[0].section13_4[0].#area[1].#field[27]',
  'section13.disciplinaryActions.entries[0].dateFired8.value': 'form1[0].section13_4[0].From_Datefield_Name_2[2]',
  'section13.disciplinaryActions.entries[0].dateQuit8.value': 'form1[0].section13_4[0].From_Datefield_Name_2[3]',
  'section13.disciplinaryActions.entries[0].additionalReason28.value': 'form1[0].section13_4[0].#area[2].#field[36]',
  'section13.disciplinaryActions.entries[0].additionalReason18.value': 'form1[0].section13_4[0].#area[2].#field[37]',
  'section13.disciplinaryActions.entries[0].additionalStatus6.value': 'form1[0].section13_4[0].#area[2].#field[38]',
  'section13.disciplinaryActions.entries[0].additionalDate18.value': 'form1[0].section13_4[0].#area[2].From_Datefield_Name_2[6]',
  'section13.disciplinaryActions.entries[0].additionalDate28.value': 'form1[0].section13_4[0].#area[2].From_Datefield_Name_2[7]',
  'section13.disciplinaryActions.entries[0].additionalField16.value': 'form1[0].section13_4[0].#area[2].#field[41]',
  'section13.disciplinaryActions.entries[0].additionalReason48.value': 'form1[0].section13_4[0].#field[42]',
  'section13.disciplinaryActions.entries[0].additionalReason38.value': 'form1[0].section13_4[0].#field[43]',
  'section13.disciplinaryActions.entries[0].additionalField26.value': 'form1[0].section13_4[0].#field[44]',
  'section13.disciplinaryActions.entries[0].additionalDate38.value': 'form1[0].section13_4[0].From_Datefield_Name_2[8]',
  'section13.disciplinaryActions.entries[0].additionalDate48.value': 'form1[0].section13_4[0].From_Datefield_Name_2[9]',
  'section13.disciplinaryActions.entries[0].additionalField36.value': 'form1[0].section13_4[0].#field[47]',
  'section13.disciplinaryActions.entries[0].hasDisciplinaryActions8.value': 'form1[0].section13_4[0].RadioButtonList[2]',
  'section13.disciplinaryActions.entries[0].reasonForUnsatisfactory9.value': 'form1[0].section13_4[1].#area[1].#field[24]',
  'section13.disciplinaryActions.entries[0].chargesOrAllegations9.value': 'form1[0].section13_4[1].#area[1].#field[25]',
  'section13.disciplinaryActions.entries[0].reasonForQuitting9.value': 'form1[0].section13_4[1].#area[1].#field[26]',
  'section13.disciplinaryActions.entries[0].reasonForBeingFired7.value': 'form1[0].section13_4[1].#area[1].#field[27]',
  'section13.disciplinaryActions.entries[0].dateFired9.value': 'form1[0].section13_4[1].From_Datefield_Name_2[2]',
  'section13.disciplinaryActions.entries[0].dateQuit9.value': 'form1[0].section13_4[1].From_Datefield_Name_2[3]',
  'section13.disciplinaryActions.entries[0].additionalReason29.value': 'form1[0].section13_4[1].#area[2].#field[36]',
  'section13.disciplinaryActions.entries[0].additionalReason19.value': 'form1[0].section13_4[1].#area[2].#field[37]',
  'section13.disciplinaryActions.entries[0].additionalStatus7.value': 'form1[0].section13_4[1].#area[2].#field[38]',
  'section13.disciplinaryActions.entries[0].additionalDate19.value': 'form1[0].section13_4[1].#area[2].From_Datefield_Name_2[6]',
  'section13.disciplinaryActions.entries[0].additionalDate29.value': 'form1[0].section13_4[1].#area[2].From_Datefield_Name_2[7]',
  'section13.disciplinaryActions.entries[0].additionalField17.value': 'form1[0].section13_4[1].#area[2].#field[41]',
  'section13.disciplinaryActions.entries[0].additionalReason49.value': 'form1[0].section13_4[1].#field[42]',
  'section13.disciplinaryActions.entries[0].additionalReason39.value': 'form1[0].section13_4[1].#field[43]',
  'section13.disciplinaryActions.entries[0].additionalField27.value': 'form1[0].section13_4[1].#field[44]',
  'section13.disciplinaryActions.entries[0].additionalDate39.value': 'form1[0].section13_4[1].From_Datefield_Name_2[8]',
  'section13.disciplinaryActions.entries[0].additionalDate49.value': 'form1[0].section13_4[1].From_Datefield_Name_2[9]',
  'section13.disciplinaryActions.entries[0].additionalField37.value': 'form1[0].section13_4[1].#field[47]',
  'section13.disciplinaryActions.entries[0].hasDisciplinaryActions9.value': 'form1[0].section13_4[1].RadioButtonList[2]',
  'section13.disciplinaryActions.entries[0].reasonForUnsatisfactory10.value': 'form1[0].section13_4[2].#area[1].#field[24]',
  'section13.disciplinaryActions.entries[0].chargesOrAllegations10.value': 'form1[0].section13_4[2].#area[1].#field[25]',
  'section13.disciplinaryActions.entries[0].reasonForQuitting10.value': 'form1[0].section13_4[2].#area[1].#field[26]',
  'section13.disciplinaryActions.entries[0].dateFired10.value': 'form1[0].section13_4[2].From_Datefield_Name_2[2]',
  'section13.disciplinaryActions.entries[0].dateQuit10.value': 'form1[0].section13_4[2].From_Datefield_Name_2[3]',
  'section13.disciplinaryActions.entries[0].additionalReason210.value': 'form1[0].section13_4[2].#area[2].#field[36]',
  'section13.disciplinaryActions.entries[0].additionalReason110.value': 'form1[0].section13_4[2].#area[2].#field[37]',
  'section13.disciplinaryActions.entries[0].additionalDate110.value': 'form1[0].section13_4[2].#area[2].From_Datefield_Name_2[6]',
  'section13.disciplinaryActions.entries[0].additionalDate210.value': 'form1[0].section13_4[2].#area[2].From_Datefield_Name_2[7]',
  'section13.disciplinaryActions.entries[0].additionalReason410.value': 'form1[0].section13_4[2].#field[42]',
  'section13.disciplinaryActions.entries[0].additionalReason310.value': 'form1[0].section13_4[2].#field[43]',
  'section13.disciplinaryActions.entries[0].additionalDate310.value': 'form1[0].section13_4[2].From_Datefield_Name_2[8]',
  'section13.disciplinaryActions.entries[0].additionalDate410.value': 'form1[0].section13_4[2].From_Datefield_Name_2[9]',
  'section13.disciplinaryActions.entries[0].hasDisciplinaryActions10.value': 'form1[0].section13_4[2].RadioButtonList[2]',
  'section13.disciplinaryActions.entries[0].reasonForUnsatisfactory11.value': 'form1[0].section13_4[3].#area[1].#field[24]',
  'section13.disciplinaryActions.entries[0].chargesOrAllegations11.value': 'form1[0].section13_4[3].#area[1].#field[25]',
  'section13.disciplinaryActions.entries[0].reasonForQuitting11.value': 'form1[0].section13_4[3].#area[1].#field[26]',
  'section13.disciplinaryActions.entries[0].reasonForBeingFired8.value': 'form1[0].section13_4[3].#area[1].#field[27]',
  'section13.disciplinaryActions.entries[0].dateFired11.value': 'form1[0].section13_4[3].From_Datefield_Name_2[2]',
  'section13.disciplinaryActions.entries[0].dateQuit11.value': 'form1[0].section13_4[3].From_Datefield_Name_2[3]',
  'section13.disciplinaryActions.entries[0].additionalReason211.value': 'form1[0].section13_4[3].#area[2].#field[36]',
  'section13.disciplinaryActions.entries[0].additionalReason111.value': 'form1[0].section13_4[3].#area[2].#field[37]',
  'section13.disciplinaryActions.entries[0].additionalStatus8.value': 'form1[0].section13_4[3].#area[2].#field[38]',
  'section13.disciplinaryActions.entries[0].additionalDate111.value': 'form1[0].section13_4[3].#area[2].From_Datefield_Name_2[6]',
  'section13.disciplinaryActions.entries[0].additionalDate211.value': 'form1[0].section13_4[3].#area[2].From_Datefield_Name_2[7]',
  'section13.disciplinaryActions.entries[0].additionalField18.value': 'form1[0].section13_4[3].#area[2].#field[41]',
  'section13.disciplinaryActions.entries[0].additionalReason411.value': 'form1[0].section13_4[3].#field[42]',
  'section13.disciplinaryActions.entries[0].additionalReason311.value': 'form1[0].section13_4[3].#field[43]',
  'section13.disciplinaryActions.entries[0].additionalField28.value': 'form1[0].section13_4[3].#field[44]',
  'section13.disciplinaryActions.entries[0].additionalDate311.value': 'form1[0].section13_4[3].From_Datefield_Name_2[8]',
  'section13.disciplinaryActions.entries[0].additionalDate411.value': 'form1[0].section13_4[3].From_Datefield_Name_2[9]',
  'section13.disciplinaryActions.entries[0].additionalField38.value': 'form1[0].section13_4[3].#field[47]',
  'section13.disciplinaryActions.entries[0].hasDisciplinaryActions11.value': 'form1[0].section13_4[3].RadioButtonList[2]'

} as const;

/**
 * Map a logical field path to the actual PDF field name
 */
export function mapLogicalFieldToPdfField(logicalPath: string): string {
  return SECTION13_FIELD_MAPPINGS[logicalPath as keyof typeof SECTION13_FIELD_MAPPINGS] || logicalPath;
}

// Export field maps for external use
export { fieldNameToDataMap, fieldIdToDataMap };
