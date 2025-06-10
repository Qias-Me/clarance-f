/**
 * Section 13 Field Generator System
 * Automated field generation based on section-13.json reference data
 * 
 * This file provides automated field generation for all Section 13 fields
 * with proper validation, error handling, and fallback mechanisms.
 */

import type { Field, FieldWithOptions } from '../../../../api/interfaces/formDefinition2.0';
import {
  getPdfFieldByName,
  getPdfFieldById,
  getPdfFieldForEntry,
  validateFieldExists,
  findSimilarFieldNames,
  getFieldMetadata,
  verifySection13FieldMapping
} from './section13-field-mapping';

// ============================================================================
// FIELD GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate a Field<T> object for a logical field path
 */
export function generateField<T = any>(
  logicalPath: string,
  defaultValue: T,
  options?: readonly string[]
): Field<T> | FieldWithOptions<T> {
  console.log(`🔄 Section13: Generating field for logical path: ${logicalPath}`);
  
  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  const fieldMetadata = getFieldMetadata(pdfFieldName);
  
  console.log(`🔍 Section13: Mapped to PDF field: ${pdfFieldName}`);
  
  // Validate that the field exists
  if (!validateFieldExists(pdfFieldName)) {
    console.warn(`⚠️ Section13: PDF field not found: ${pdfFieldName}`);
    console.warn(`🔍 Section13: Similar fields:`, findSimilarFieldNames(pdfFieldName, 3));
  }

  try {
    const field: Field<T> = {
      id: fieldMetadata?.id?.replace(' 0 R', '') || '0000',
      name: pdfFieldName,
      type: fieldMetadata?.type || 'PDFTextField',
      label: fieldMetadata?.label || `Field ${logicalPath}`,
      value: defaultValue,
      rect: fieldMetadata?.rect || { x: 0, y: 0, width: 0, height: 0 }
    };

    console.log(`✅ Section13: Generated field for ${logicalPath}:`, field);

    if (options && options.length > 0) {
      return {
        ...field,
        options
      } as FieldWithOptions<T>;
    }
    
    return field as Field<T>;
  } catch (error) {
    console.warn(`❌ Section13: Failed to generate field for ${logicalPath}:`, error);
    
    // Fallback field structure
    const fallbackField: Field<T> = {
      id: fieldMetadata?.id?.replace(' 0 R', '') || '0000',
      name: pdfFieldName,
      type: fieldMetadata?.type || 'PDFTextField',
      label: fieldMetadata?.label || `Field ${logicalPath}`,
      value: defaultValue,
      rect: fieldMetadata?.rect || { x: 0, y: 0, width: 0, height: 0 }
    };
    
    console.log(`🔄 Section13: Using fallback field for ${logicalPath}:`, fallbackField);
    
    if (options && options.length > 0) {
      return {
        ...fallbackField,
        options
      } as FieldWithOptions<T>;
    }
    
    return fallbackField;
  }
}

/**
 * Generate multiple fields from a mapping object
 */
export function generateFields<T = any>(
  fieldMappings: Record<string, { defaultValue: T; options?: readonly string[] }>
): Record<string, Field<T> | FieldWithOptions<T>> {
  console.log(`🔄 Section13: Generating ${Object.keys(fieldMappings).length} fields`);
  
  const fields: Record<string, Field<T> | FieldWithOptions<T>> = {};
  
  Object.entries(fieldMappings).forEach(([logicalPath, config]) => {
    const fieldKey = logicalPath.split('.').pop() || logicalPath;
    fields[fieldKey] = generateField(logicalPath, config.defaultValue, config.options);
  });
  
  console.log(`✅ Section13: Generated ${Object.keys(fields).length} fields successfully`);
  
  return fields;
}

/**
 * Generate field for a specific subsection and entry
 */
export function generateFieldForEntry<T = any>(
  subsection: string,
  entryIndex: number,
  fieldType: string,
  defaultValue: T,
  options?: readonly string[]
): Field<T> | FieldWithOptions<T> {
  console.log(`🔄 Section13: Generating field for ${subsection}[${entryIndex}].${fieldType}`);
  
  const field = getPdfFieldForEntry(subsection, entryIndex, fieldType);
  
  if (field) {
    const generatedField: Field<T> = {
      id: field.id?.replace(' 0 R', '') || '0000',
      name: field.name,
      type: field.type,
      label: field.label || `${subsection} ${fieldType}`,
      value: defaultValue,
      rect: field.rect || { x: 0, y: 0, width: 0, height: 0 }
    };

    if (options && options.length > 0) {
      return {
        ...generatedField,
        options
      } as FieldWithOptions<T>;
    }
    
    return generatedField;
  } else {
    console.warn(`⚠️ Section13: Field not found for ${subsection}[${entryIndex}].${fieldType}, using fallback`);
    
    const fallbackField: Field<T> = {
      id: '0000',
      name: `form1[0].${subsection}[${entryIndex}].${fieldType}`,
      type: 'PDFTextField',
      label: `${subsection} ${fieldType}`,
      value: defaultValue,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    };

    if (options && options.length > 0) {
      return {
        ...fallbackField,
        options
      } as FieldWithOptions<T>;
    }
    
    return fallbackField;
  }
}

// ============================================================================
// LOGICAL PATH MAPPING
// ============================================================================

/**
 * Basic logical field path mappings for Section 13
 * This maps logical paths to actual PDF field names
 */
const SECTION13_FIELD_MAPPINGS = {
  // Main section fields
  'section13.hasEmployment.value': 'form1[0].section_13_1-2[0].RadioButtonList[0]',
  'section13.hasGaps.value': 'form1[0].section13_5[0].RadioButtonList[1]',
  'section13.gapExplanation.value': 'form1[0].section13_5[0].TextField11[3]', // Fixed from TextField11[0] and TextField11[1] - using TextField11[3] (street1)
  
  // Non-Federal Employment (13A.2)
  'section13.nonFederalEmployment.entries[0].employerName.value': 'form1[0].section13_2[0].TextField11[0]',
  'section13.nonFederalEmployment.entries[0].employerAddress.street.value': 'form1[0].section13_2[0].TextField11[4]',
  'section13.nonFederalEmployment.entries[0].employerAddress.city.value': 'form1[0].section13_2[0].TextField11[5]',
  'section13.nonFederalEmployment.entries[0].employerAddress.state.value': 'form1[0].section13_2[0].School6_State[1]',
  
  // Self-Employment (13A.3)
  'section13.selfEmployment.entries[0].businessName.value': 'form1[0].section13_3[0].TextField11[0]',
  'section13.selfEmployment.entries[0].businessAddress.street.value': 'form1[0].section13_3[0].TextField11[5]',
  'section13.selfEmployment.entries[0].businessAddress.city.value': 'form1[0].section13_3[0].TextField11[6]',
  'section13.selfEmployment.entries[0].businessAddress.state.value': 'form1[0].section13_3[0].School6_State[1]',
  
  // Unemployment (13A.4)
  'section13.unemployment.entries[0].firstName.value': 'form1[0].section13_4[0].TextField11[0]',
  'section13.unemployment.entries[0].lastName.value': 'form1[0].section13_4[0].TextField11[1]',
  'section13.unemployment.entries[0].hasReference.value': 'form1[0].section13_4[0].RadioButtonList[0]',
  
  // Employment Issues (13A.5)
  'section13.employmentRecordIssues.hasFederalEmployment.value': 'form1[0].section13_5[0].RadioButtonList[0]',
  'section13.employmentRecordIssues.securityClearance.value': 'form1[0].section13_5[0].RadioButtonList[1]',
  'section13.employmentRecordIssues.clearanceLevel.value': 'form1[0].section13_5[0].TextField11[3]',
  
  // Disciplinary Actions (13A.6) - Fixed field reference
  'section13.disciplinaryActions.receivedWrittenWarning.value': 'form1[0].section13_4[0].RadioButtonList[2]', // Fixed from RadioButtonList[3]
} as const;

/**
 * Map a logical field path to the actual PDF field name
 */
export function mapLogicalFieldToPdfField(logicalPath: string): string {
  return SECTION13_FIELD_MAPPINGS[logicalPath as keyof typeof SECTION13_FIELD_MAPPINGS] || logicalPath;
}

// ============================================================================
// SPECIALIZED FIELD GENERATORS
// ============================================================================

/**
 * Generate fields for Non-Federal Employment entries
 */
export function generateNonFederalEmploymentFields(entryIndex: number): Record<string, Field<any>> {
  console.log(`🔄 Section13: Generating Non-Federal Employment fields for entry ${entryIndex}`);
  
  const fields: Record<string, Field<any>> = {};
  
  // Basic employment fields
  fields.employerName = generateFieldForEntry('section13_2', entryIndex, 'TextField11[0]', '');
  fields.positionTitle = generateFieldForEntry('section13_2', entryIndex, 'TextField11[1]', '');
  fields.employerStreet = generateFieldForEntry('section13_2', entryIndex, 'TextField11[4]', '');
  fields.employerCity = generateFieldForEntry('section13_2', entryIndex, 'TextField11[5]', '');
  fields.employerState = generateFieldForEntry('section13_2', entryIndex, 'School6_State[1]', '');
  
  console.log(`✅ Section13: Generated ${Object.keys(fields).length} Non-Federal Employment fields`);
  
  return fields;
}

/**
 * Generate fields for Self-Employment entries
 */
export function generateSelfEmploymentFields(entryIndex: number): Record<string, Field<any>> {
  console.log(`🔄 Section13: Generating Self-Employment fields for entry ${entryIndex}`);
  
  const fields: Record<string, Field<any>> = {};
  
  // Basic self-employment fields
  fields.businessName = generateFieldForEntry('section13_3', entryIndex, 'TextField11[0]', '');
  fields.businessType = generateFieldForEntry('section13_3', entryIndex, 'TextField11[4]', '');
  fields.businessStreet = generateFieldForEntry('section13_3', entryIndex, 'TextField11[5]', '');
  fields.businessCity = generateFieldForEntry('section13_3', entryIndex, 'TextField11[6]', '');
  fields.businessState = generateFieldForEntry('section13_3', entryIndex, 'School6_State[1]', '');
  
  console.log(`✅ Section13: Generated ${Object.keys(fields).length} Self-Employment fields`);
  
  return fields;
}

/**
 * Generate fields for Unemployment entries
 */
export function generateUnemploymentFields(entryIndex: number): Record<string, Field<any>> {
  console.log(`🔄 Section13: Generating Unemployment fields for entry ${entryIndex}`);
  
  const fields: Record<string, Field<any>> = {};
  
  // Basic unemployment fields
  fields.firstName = generateFieldForEntry('section13_4', entryIndex, 'TextField11[0]', '');
  fields.lastName = generateFieldForEntry('section13_4', entryIndex, 'TextField11[1]', '');
  fields.hasReference = generateFieldForEntry('section13_4', entryIndex, 'RadioButtonList[0]', false);
  fields.referenceStreet = generateFieldForEntry('section13_4', entryIndex, 'TextField11[7]', '');
  fields.referenceCity = generateFieldForEntry('section13_4', entryIndex, 'TextField11[8]', '');
  
  console.log(`✅ Section13: Generated ${Object.keys(fields).length} Unemployment fields`);
  
  return fields;
}

/**
 * Generate all Section 13 fields
 */
export function generateAllSection13Fields(): Record<string, Field<any> | FieldWithOptions<any>> {
  console.log(`🔄 Section13: Generating all Section 13 fields`);
  
  // Verify field mapping first
  const verification = verifySection13FieldMapping();
  if (!verification.success) {
    console.warn(`⚠️ Section13: Field mapping verification failed, proceeding with available fields`);
  }
  
  const allFields = {
    // Main section fields
    hasEmployment: generateField('section13.hasEmployment.value', 'NO', ['YES', 'NO']),
    hasGaps: generateField('section13.hasGaps.value', 'NO', ['YES', 'NO']),
    gapExplanation: generateField('section13.gapExplanation.value', ''),
    
    // Generate entry fields for each subsection
    ...generateNonFederalEmploymentFields(0),
    ...generateSelfEmploymentFields(0),
    ...generateUnemploymentFields(0),
  };
  
  console.log(`✅ Section13: Generated ${Object.keys(allFields).length} total fields`);
  
  return allFields;
}

// ============================================================================
// FIELD VALIDATION
// ============================================================================

/**
 * Validate that all generated fields have valid PDF field mappings
 */
export function validateGeneratedFields(fields: Record<string, Field<any>>): {
  valid: number;
  invalid: number;
  invalidFields: string[];
} {
  console.log(`🔍 Section13: Validating ${Object.keys(fields).length} generated fields`);
  
  let valid = 0;
  let invalid = 0;
  const invalidFields: string[] = [];
  
  Object.entries(fields).forEach(([fieldKey, field]) => {
    if (validateFieldExists(field.name)) {
      valid++;
    } else {
      invalid++;
      invalidFields.push(fieldKey);
    }
  });
  
  console.log(`📊 Section13: Field validation results: ${valid} valid, ${invalid} invalid`);
  
  if (invalidFields.length > 0) {
    console.warn(`⚠️ Section13: Invalid fields:`, invalidFields);
  }
  
  return { valid, invalid, invalidFields };
}
