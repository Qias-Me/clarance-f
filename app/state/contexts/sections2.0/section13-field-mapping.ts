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

  // Non-Federal Employment (13A.2) - Entry 0
  'section13.nonFederalEmployment.entries[0].employerName.value': 'form1[0].section13_2[0].TextField11[0]',
  'section13.nonFederalEmployment.entries[0].positionTitle.value': 'form1[0].section13_2[0].TextField11[1]',
  'section13.nonFederalEmployment.entries[0].employerAddress.street.value': 'form1[0].section13_2[0].TextField11[4]',
  'section13.nonFederalEmployment.entries[0].employerAddress.city.value': 'form1[0].section13_2[0].TextField11[5]',
  'section13.nonFederalEmployment.entries[0].employerAddress.state.value': 'form1[0].section13_2[0].School6_State[1]',

  // Self-Employment (13A.3) - Entry 0
  'section13.selfEmployment.entries[0].businessName.value': 'form1[0].section13_3[0].TextField11[0]',
  'section13.selfEmployment.entries[0].businessType.value': 'form1[0].section13_3[0].TextField11[4]',
  'section13.selfEmployment.entries[0].businessAddress.street.value': 'form1[0].section13_3[0].TextField11[5]',
  'section13.selfEmployment.entries[0].businessAddress.city.value': 'form1[0].section13_3[0].TextField11[6]',
  'section13.selfEmployment.entries[0].businessAddress.state.value': 'form1[0].section13_3[0].School6_State[1]',

  // Unemployment (13A.4) - Entry 0
  'section13.unemployment.entries[0].firstName.value': 'form1[0].section13_4[0].TextField11[0]',
  'section13.unemployment.entries[0].lastName.value': 'form1[0].section13_4[0].TextField11[1]',
  'section13.unemployment.entries[0].hasReference.value': 'form1[0].section13_4[0].RadioButtonList[0]',
  'section13.unemployment.entries[0].referenceAddress.street.value': 'form1[0].section13_4[0].TextField11[7]',
  'section13.unemployment.entries[0].referenceAddress.city.value': 'form1[0].section13_4[0].TextField11[8]',

  // Employment Issues (13A.5)
  'section13.employmentRecordIssues.hasFederalEmployment.value': 'form1[0].section13_5[0].RadioButtonList[0]',
  'section13.employmentRecordIssues.securityClearance.value': 'form1[0].section13_5[0].RadioButtonList[1]',
  'section13.employmentRecordIssues.clearanceLevel.value': 'form1[0].section13_5[0].TextField11[3]',
  'section13.employmentRecordIssues.classificationLevel.value': 'form1[0].section13_5[0].TextField11[4]',

  // Disciplinary Actions (13A.6) - Fixed field reference
  'section13.disciplinaryActions.receivedWrittenWarning.value': 'form1[0].section13_4[0].RadioButtonList[2]', // Fixed from RadioButtonList[3]
} as const;

/**
 * Map a logical field path to the actual PDF field name
 */
export function mapLogicalFieldToPdfField(logicalPath: string): string {
  return SECTION13_FIELD_MAPPINGS[logicalPath as keyof typeof SECTION13_FIELD_MAPPINGS] || logicalPath;
}

// Export field maps for external use
export { fieldNameToDataMap, fieldIdToDataMap };
