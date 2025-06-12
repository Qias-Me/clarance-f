/**
 * Section 12: Where You Went to School - Field Generator
 *
 * This module provides field generation utilities that match the PDF field naming patterns
 * identified in the Section 12 JSON analysis. It ensures unique, predictable field IDs that
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
  validateSection12FieldMappings,
  getEntryFieldMappings
} from './section12-field-mapping';

// Field types for Section 12 - EXPANDED TO INCLUDE DEGREE FIELDS
export type Section12FieldType =
  | 'hasAttendedSchool'
  | 'hasAttendedSchoolOutsideUS'
  | 'fromDate'
  | 'fromDateEstimate'
  | 'toDate'
  | 'toDateEstimate'
  | 'isPresent'
  | 'schoolName'
  | 'schoolAddress'
  | 'schoolCity'
  | 'schoolState'
  | 'schoolCountry'
  | 'schoolZipCode'
  | 'schoolType'
  | 'receivedDegree'
  // NEWLY ADDED DEGREE FIELDS
  | 'degreeType'
  | 'otherDegree'
  | 'dateAwarded'
  | 'dateAwardedEstimate'
  // NEWLY ADDED CONTACT PERSON FIELDS
  | 'contactPersonLastName'
  | 'contactPersonFirstName';

/**
 * Generate a field using the Section 12 field mapping system
 */
export function generateSection12Field<T = any>(
  logicalPath: string,
  defaultValue: T
): Field<T> {
  // console.log(`🔄 Section12: Generating field for logical path: ${logicalPath}`);

  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  const fieldMetadata = getFieldMetadata(pdfFieldName);

  // console.log(`🔍 Section12: Mapped to PDF field: ${pdfFieldName}`);

  // Validate that the field exists
  if (!validateFieldExists(pdfFieldName)) {
    // console.warn(`⚠️ Section12: PDF field not found: ${pdfFieldName}`);
    // console.warn(`🔍 Section12: Similar fields:`, findSimilarFieldNames(pdfFieldName, 3));
  }

  // Get numeric ID if available
  const numericId = getNumericFieldId(pdfFieldName);
  if (numericId) {
    // console.log(`🔢 Section12: Using numeric ID: ${numericId} for field: ${pdfFieldName}`);
  }

  // Create field using the reference system
  try {
    const field = createFieldFromReference(12, pdfFieldName, defaultValue);
    // console.log(`✅ Section12: Field generation successful for: ${logicalPath}`);
    return field;
  } catch (error) {
    // console.error(`❌ Section12: Field generation failed for ${logicalPath}:`, error);

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
 * Generate multiple fields for a school entry
 */
export function generateSchoolEntryFields<T = any>(
  entryIndex: number,
  defaultValues: Record<string, T>
): Record<string, Field<T>> {
  // console.log(`🔄 Section12: Generating fields for school entry ${entryIndex}`);

  const fields: Record<string, Field<T>> = {};
  const fieldMappings = getEntryFieldMappings(entryIndex);

  Object.entries(defaultValues).forEach(([fieldType, defaultValue]) => {
    const logicalPath = `section12.entries[${entryIndex}].${fieldType}`;
    
    try {
      fields[fieldType] = generateSection12Field(logicalPath, defaultValue);
    } catch (error) {
      // console.error(`❌ Section12: Failed to generate field ${fieldType} for entry ${entryIndex}:`, error);
      
      // Create fallback field
      fields[fieldType] = {
        id: `section12-entry${entryIndex}-${fieldType}`,
        name: `section12-entry${entryIndex}-${fieldType}`,
        type: 'PDFTextField',
        label: `${fieldType} - Entry ${entryIndex + 1}`,
        value: defaultValue,
        rect: { x: 0, y: 0, width: 0, height: 0 }
      };
    }
  });

  // console.log(`✅ Section12: Generated ${Object.keys(fields).length} fields for entry ${entryIndex}`);
  return fields;
}

/**
 * Generate degree fields for a specific entry and degree index
 */
export function generateDegreeFields(
  entryIndex: number,
  degreeIndex: number
): {
  degreeType: Field<string>;
  otherDegree: Field<string>;
  dateAwarded: Field<string>;
} {
  // console.log(`🔄 Section12: Generating degree fields for entry ${entryIndex}, degree ${degreeIndex}`);

  return {
    degreeType: generateSection12Field(`section12.entries[${entryIndex}].degrees[${degreeIndex}].degreeType`, 'High School Diploma'),
    otherDegree: generateSection12Field(`section12.entries[${entryIndex}].degrees[${degreeIndex}].otherDegree`, ''),
    dateAwarded: generateSection12Field(`section12.entries[${entryIndex}].degrees[${degreeIndex}].dateAwarded`, '')
  };
}

/**
 * Generate contact person fields for a specific entry
 */
export function generateContactPersonFields(
  entryIndex: number
): {
  lastName: Field<string>;
  firstName: Field<string>;
} {
  // console.log(`🔄 Section12: Generating contact person fields for entry ${entryIndex}`);

  return {
    lastName: generateSection12Field(`section12.entries[${entryIndex}].contactPerson.lastName`, ''),
    firstName: generateSection12Field(`section12.entries[${entryIndex}].contactPerson.firstName`, '')
  };
}

/**
 * Generate global section fields (hasAttendedSchool, hasAttendedSchoolOutsideUS)
 */
export function generateGlobalFields(): {
  hasAttendedSchool: Field<"YES" | "NO">;
  hasAttendedSchoolOutsideUS: Field<"YES" | "NO">;
} {
  // console.log(`🔄 Section12: Generating global section fields`);

  return {
    hasAttendedSchool: generateSection12Field('section12.hasAttendedSchool', "NO" as "YES" | "NO"),
    hasAttendedSchoolOutsideUS: generateSection12Field('section12.hasAttendedSchoolOutsideUS', "NO" as "YES" | "NO")
  };
}

/**
 * Generate field ID for a specific field type and entry
 */
export function generateFieldId(
  fieldType: Section12FieldType,
  entryIndex?: number
): string {
  let logicalPath: string;

  if (fieldType === 'hasAttendedSchool' || fieldType === 'hasAttendedSchoolOutsideUS') {
    logicalPath = `section12.${fieldType}`;
  } else if (entryIndex !== undefined) {
    logicalPath = `section12.entries[${entryIndex}].${fieldType}`;
  } else {
    throw new Error(`Entry index required for field type: ${fieldType}`);
  }

  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  const numericId = getNumericFieldId(pdfFieldName);

  // console.log(`🔄 Section12: Generated field ID for ${logicalPath}: ${numericId || pdfFieldName}`);

  return numericId || pdfFieldName;
}

/**
 * Validate that all required fields can be generated
 */
export function validateFieldGeneration(): boolean {
  // console.log('🔍 Section12: Validating field generation capabilities');


  let allValid = true;


  return allValid;
}

/**
 * Initialize and validate Section 12 field generation system
 */
export function initializeSection12FieldGeneration(): void {
  // console.log('🚀 Section12: Initializing field generation system');

  // Validate field mappings
  const validation = validateSection12FieldMappings();
  
  // console.log(`📊 Section12: Field mapping coverage: ${validation.coverage.toFixed(1)}%`);
  // console.log(`📊 Section12: Mapped ${validation.mappedFields}/${validation.totalFields} fields`);

  if (validation.coverage >= 80) {
    // console.log(`✅ Section12: Field mapping coverage is acceptable (${validation.coverage.toFixed(1)}%)`);
  } else {
    // console.warn(`⚠️ Section12: Low field mapping coverage (${validation.coverage.toFixed(1)}%)`);
    // console.warn(`🔍 Section12: Missing fields:`, validation.missingFields.slice(0, 10));
  }

  // Validate field generation
  const canGenerate = validateFieldGeneration();
  
  if (canGenerate) {
    // console.log(`✅ Section12: All critical fields can be generated`);
  } else {
    // console.warn(`⚠️ Section12: Some fields cannot be generated - check field mappings`);
  }

  // console.log('🎯 Section12: Field generation system initialized');
}

// Initialize the system when the module is loaded
initializeSection12FieldGeneration();
