/**
 * Section 10: Dual/Multiple Citizenship & Foreign Passport - Field Generator
 *
 * This module provides field generation utilities that match the PDF field naming patterns
 * identified in the Section 10 JSON analysis. It ensures unique, predictable field IDs that
 * align with the existing SF-86 system and PDF field structure.
 */

import type { Field } from '../../../../api/interfaces/formDefinition2.0';
import { createFieldFromReference } from '../../../../api/utils/sections-references-loader';
import {
  mapLogicalFieldToPdfField,
  getFieldMetadata,
  validateFieldExists,
  findSimilarFieldNames,
  getNumericFieldId,
  validateSection10FieldMappings
} from './section10-field-mapping';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type Section10SubsectionKey = 'dualCitizenship' | 'foreignPassport';

export type DualCitizenshipFieldType =
  | 'hasDualCitizenship'
  | 'country'
  | 'howAcquired'
  | 'fromDate'
  | 'isFromEstimated'
  | 'toDate'
  | 'isPresent'
  | 'isToEstimated'
  | 'hasRenounced'
  | 'renounceExplanation'
  | 'hasTakenAction'
  | 'actionExplanation';

export type ForeignPassportFieldType =
  | 'hasForeignPassport'
  | 'country'
  | 'issueDate'
  | 'isIssueDateEstimated'
  | 'city'
  | 'country2'
  | 'lastName'
  | 'firstName'
  | 'middleName'
  | 'suffix'
  | 'passportNumber'
  | 'expirationDate'
  | 'isExpirationDateEstimated'
  | 'usedForUSEntry';

export type TravelCountryFieldType =
  | 'country'
  | 'fromDate'
  | 'isFromDateEstimated'
  | 'toDate'
  | 'isToDateEstimated'
  | 'isPresent';

// ============================================================================
// FIELD GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate a field using the Section 10 field mapping system
 */
export function generateSection10Field<T = any>(
  logicalPath: string,
  defaultValue: T
): Field<T> {
  // console.log(`🔄 Section10: Generating field for logical path: ${logicalPath}`);

  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  const fieldMetadata = getFieldMetadata(pdfFieldName);

  // console.log(`🔍 Section10: Mapped to PDF field: ${pdfFieldName}`);

  // Validate that the field exists
  if (!validateFieldExists(pdfFieldName)) {
    // console.warn(`⚠️ Section10: PDF field not found: ${pdfFieldName}`);
    // console.warn(`🔍 Section10: Similar fields:`, findSimilarFieldNames(pdfFieldName, 3));
  }

  // Get numeric ID if available
  const numericId = getNumericFieldId(pdfFieldName);
  if (numericId) {
    // console.log(`🔢 Section10: Using numeric ID: ${numericId} for field: ${pdfFieldName}`);
  }

  // Create field using the reference system
  try {
    const field = createFieldFromReference(10, pdfFieldName, defaultValue);
    // console.log(`✅ Section10: Field generation successful for: ${logicalPath}`);
    return field;
  } catch (error) {
    // console.error(`❌ Section10: Field generation failed for ${logicalPath}:`, error);

    // Fallback to basic field creation
    return {
      name: pdfFieldName,
      id: numericId || pdfFieldName,
      type: fieldMetadata?.type || 'text',
      label: fieldMetadata?.label || logicalPath,
      value: defaultValue,
    };
  }
}

/**
 * Generate dual citizenship field
 */
export function generateDualCitizenshipField<T = any>(
  fieldType: DualCitizenshipFieldType,
  entryIndex: number,
  defaultValue: T
): Field<T> {
  const logicalPath = entryIndex === -1
    ? `dualCitizenship.${fieldType}`
    : `dualCitizenship.entries[${entryIndex}].${fieldType}`;

  return generateSection10Field(logicalPath, defaultValue);
}

/**
 * Generate foreign passport field
 */
export function generateForeignPassportField<T = any>(
  fieldType: ForeignPassportFieldType,
  entryIndex: number,
  defaultValue: T
): Field<T> {
  const logicalPath = entryIndex === -1
    ? `foreignPassport.${fieldType}`
    : `foreignPassport.entries[${entryIndex}].${fieldType}`;

  return generateSection10Field(logicalPath, defaultValue);
}

/**
 * Generate travel country field
 */
export function generateTravelCountryField<T = any>(
  fieldType: TravelCountryFieldType,
  passportIndex: number,
  travelIndex: number,
  defaultValue: T
): Field<T> {
  const logicalPath = `foreignPassport.entries[${passportIndex}].travelCountries[${travelIndex}].${fieldType}`;

  return generateSection10Field(logicalPath, defaultValue);
}

// ============================================================================
// FIELD VALIDATION AND VERIFICATION
// ============================================================================

/**
 * Initialize Section 10 field mapping verification
 */
export function initializeSection10FieldMapping(): void {
  // console.log('🔄 Section10: Initializing section data with complete field mapping verification');

  const validation = validateSection10FieldMappings();

  // console.log(`🎯 Section10: Field mapping verification - ${validation.coverage.toFixed(1)}% coverage (${validation.mappedFields}/${validation.totalFields} fields)`);

  if (validation.coverage >= 100) {
    // console.log(`✅ Section10: All ${validation.totalFields} PDF form fields are properly mapped`);
  } else {
    // console.warn(`⚠️ Section10: ${validation.missingFields.length} fields are not mapped:`);
    validation.missingFields.slice(0, 10).forEach(field => {
      // console.warn(`  - ${field}`);
    });
    if (validation.missingFields.length > 10) {
      // console.warn(`  ... and ${validation.missingFields.length - 10} more`);
    }
  }

}

/**
 * Generate field ID for a specific field type and entry
 */
export function generateFieldId(
  subsection: Section10SubsectionKey,
  fieldType: string,
  entryIndex: number = 0,
  travelIndex?: number
): string {
  let logicalPath: string;

  if (subsection === 'dualCitizenship') {
    logicalPath = entryIndex === -1
      ? `dualCitizenship.${fieldType}`
      : `dualCitizenship.entries[${entryIndex}].${fieldType}`;
  } else if (subsection === 'foreignPassport') {
    if (travelIndex !== undefined) {
      logicalPath = `foreignPassport.entries[${entryIndex}].travelCountries[${travelIndex}].${fieldType}`;
    } else {
      logicalPath = entryIndex === -1
        ? `foreignPassport.${fieldType}`
        : `foreignPassport.entries[${entryIndex}].${fieldType}`;
    }
  } else {
    throw new Error(`Unknown subsection: ${subsection}`);
  }

  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  const numericId = getNumericFieldId(pdfFieldName);

  // console.log(`🔄 Section10: Generated field ID for ${logicalPath}: ${numericId || pdfFieldName}`);

  return numericId || pdfFieldName;
}

/**
 * Validate that all required fields can be generated
 */
export function validateFieldGeneration(): boolean {
  // console.log('🔍 Section10: Validating field generation capabilities');

  const testFields = [
    'dualCitizenship.hasDualCitizenship',
    'dualCitizenship.entries[0].country',
    'foreignPassport.hasForeignPassport',
    'foreignPassport.entries[0].country',
    'foreignPassport.entries[0].travelCountries[0].country',
    'foreignPassport.entries[1].country',
    'foreignPassport.entries[1].travelCountries[5].country'
  ];

  let allValid = true;

  testFields.forEach(logicalPath => {
    const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
    const exists = validateFieldExists(pdfFieldName);

    if (!exists) {
      // console.error(`❌ Section10: Field generation validation failed for: ${logicalPath} → ${pdfFieldName}`);
      allValid = false;
    } else {
      // console.log(`✅ Section10: Field generation validated for: ${logicalPath} → ${pdfFieldName}`);
    }
  });

  if (allValid) {
    // console.log('✅ Section10: All field generation validation tests passed');
  } else {
    // console.error('❌ Section10: Field generation validation failed');
  }

  return allValid;
}

// ============================================================================
// EXPORT INITIALIZATION
// ============================================================================

// Initialize field mapping on module load
initializeSection10FieldMapping();
