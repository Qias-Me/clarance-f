/**
 * Advanced Field Generators for Complex PDF Structures
 * 
 * This module provides specialized field generators for handling complex PDF structures
 * like Section 18's multi-dimensional arrays, dynamic indices, and nested field patterns.
 */

import { createFieldFromReference } from './sections-references-loader';
import { enhancedFieldLookup, resolveDynamicFieldPath, parseFieldPath } from './enhanced-pdf-field-mapping';
import type { Field, FieldWithOptions } from '../interfaces/formDefinition2.0';

// ============================================================================
// ADVANCED FIELD GENERATION PATTERNS
// ============================================================================

/**
 * Generate fields for multi-dimensional array structures (like Section 18)
 */
export function generateMultiDimensionalFields<T = any>(
  sectionId: number,
  baseTemplate: string,
  dimensions: {
    entries: number;      // Number of main entries (relatives)
    subEntries: number;   // Number of sub-entries per main entry (other names, addresses, etc.)
  },
  defaultValue: T,
  options?: readonly string[]
): Field<T>[][] {
  const result: Field<T>[][] = [];
  
  for (let entryIndex = 0; entryIndex < dimensions.entries; entryIndex++) {
    const subFields: Field<T>[] = [];
    
    for (let subIndex = 0; subIndex < dimensions.subEntries; subIndex++) {
      const resolvedPath = resolveDynamicFieldPath(baseTemplate, {
        entryIndex,
        subIndex,
        entry: entryIndex,
        sub: subIndex,
        i: entryIndex,
        j: subIndex
      }).resolvedPath;
      
      const field = generateAdvancedField(sectionId, resolvedPath, defaultValue, options);
      subFields.push(field);
    }
    
    result.push(subFields);
  }
  
  return result;
}

/**
 * Generate field with enhanced lookup and fallback strategies
 */
export function generateAdvancedField<T = any>(
  sectionId: number,
  fieldPath: string,
  defaultValue: T,
  options?: readonly string[]
): Field<T> | FieldWithOptions<T> {
  console.log(`🔄 Advanced: Generating field for path: ${fieldPath}`);
  
  const lookupResult = enhancedFieldLookup(sectionId, fieldPath, true);
  
  if (lookupResult.success && lookupResult.fieldData) {
    console.log(`✅ Advanced: Found field data for ${fieldPath}`);
    
    const field: Field<T> = {
      id: lookupResult.fieldData.id.replace(' 0 R', ''),
      name: lookupResult.fieldData.name,
      type: lookupResult.fieldData.type,
      label: lookupResult.fieldData.label,
      value: defaultValue,
      rect: lookupResult.fieldData.rect
    };
    
    if (options && options.length > 0) {
      return {
        ...field,
        options
      } as FieldWithOptions<T>;
    }
    
    return field;
  }
  
  // Enhanced fallback with suggestions
  console.warn(`⚠️ Advanced: Field not found: ${fieldPath}`);
  if (lookupResult.suggestions && lookupResult.suggestions.length > 0) {
    console.warn(`🔍 Advanced: Suggestions: ${lookupResult.suggestions.slice(0, 3).join(', ')}`);
  }
  
  // Create fallback field with enhanced metadata
  const components = parseFieldPath(fieldPath);
  const fallbackField: Field<T> = {
    id: generateFallbackId(fieldPath),
    name: fieldPath,
    type: inferFieldType(fieldPath, defaultValue),
    label: generateFieldLabel(fieldPath, components),
    value: defaultValue,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  };
  
  console.log(`🔄 Advanced: Using enhanced fallback field for ${fieldPath}:`, fallbackField);
  
  if (options && options.length > 0) {
    return {
      ...fallbackField,
      options
    } as FieldWithOptions<T>;
  }
  
  return fallbackField;
}

/**
 * Generate Section 18 specific field patterns
 */
export function generateSection18FieldPattern(
  entryNumber: number,
  subsection: '18_1' | '18_2' | '18_3',
  fieldType: string,
  fieldIndex?: number,
  areaIndex?: number
): string {
  const pdfEntryIndex = entryNumber - 1; // Convert to 0-based
  
  const patterns = {
    '18_1': {
      // Basic relative information
      firstName: `form1[0].Section18_1[${pdfEntryIndex}].TextField11[1]`,
      middleName: `form1[0].Section18_1[${pdfEntryIndex}].TextField11[2]`,
      lastName: `form1[0].Section18_1[${pdfEntryIndex}].TextField11[0]`,
      suffix: `form1[0].Section18_1[${pdfEntryIndex}].suffix[0]`,
      relationship: `form1[0].Section18_1[${pdfEntryIndex}].DropDownList15[0]`,
      citizenship: `form1[0].Section18_1[${pdfEntryIndex}].DropDownList15[1]`,
      birthDate: `form1[0].Section18_1[${pdfEntryIndex}].From_Datefield_Name_2[0]`,
      birthDateEstimate: `form1[0].Section18_1[${pdfEntryIndex}].#field[1]`,
      birthPlace: `form1[0].Section18_1[${pdfEntryIndex}].TextField11[3]`,
      // Other names pattern with dynamic indices
      otherNameFirstName: fieldIndex !== undefined ? 
        `form1[0].Section18_1[${pdfEntryIndex}].TextField11[${[6,11,14,17][fieldIndex]}]` : 
        `form1[0].Section18_1[${pdfEntryIndex}].TextField11[{fieldIndex}]`,
      otherNameMiddleName: fieldIndex !== undefined ? 
        `form1[0].Section18_1[${pdfEntryIndex}].TextField11[${[4,10,13,16][fieldIndex]}]` : 
        `form1[0].Section18_1[${pdfEntryIndex}].TextField11[{fieldIndex}]`,
      otherNameLastName: fieldIndex !== undefined ? 
        `form1[0].Section18_1[${pdfEntryIndex}].TextField11[${[9,12,15,18][fieldIndex]}]` : 
        `form1[0].Section18_1[${pdfEntryIndex}].TextField11[{fieldIndex}]`,
      otherNameSuffix: fieldIndex !== undefined ? 
        `form1[0].Section18_1[${pdfEntryIndex}].suffix[${[1,3,4,5][fieldIndex]}]` : 
        `form1[0].Section18_1[${pdfEntryIndex}].suffix[{fieldIndex}]`,
    },
    '18_2': {
      // Current address information
      streetAddress: `form1[0].Section18_2[${pdfEntryIndex}].TextField11[0]`,
      streetAddress2: `form1[0].Section18_2[${pdfEntryIndex}].TextField11[1]`,
      city: `form1[0].Section18_2[${pdfEntryIndex}].TextField11[2]`,
      state: `form1[0].Section18_2[${pdfEntryIndex}].School6_State[0]`,
      zipCode: `form1[0].Section18_2[${pdfEntryIndex}].TextField11[3]`,
      country: `form1[0].Section18_2[${pdfEntryIndex}].DropDownList15[0]`,
      fromDate: `form1[0].Section18_2[${pdfEntryIndex}].From_Datefield_Name_2[0]`,
      fromDateEstimate: `form1[0].Section18_2[${pdfEntryIndex}].#field[1]`,
      toDate: `form1[0].Section18_2[${pdfEntryIndex}].To_Datefield_Name_2[0]`,
      toDateEstimate: `form1[0].Section18_2[${pdfEntryIndex}].#field[2]`,
      isPresent: `form1[0].Section18_2[${pdfEntryIndex}].#field[3]`,
      // APO/FPO fields
      apoFpoType: `form1[0].Section18_2[${pdfEntryIndex}].DropDownList15[1]`,
      apoFpoCode: `form1[0].Section18_2[${pdfEntryIndex}].TextField11[4]`,
    },
    '18_3': {
      // Contact and foreign relations (includes 18.4 and 18.5 functionality)
      // Contact methods
      contactInPerson: `form1[0].Section18_3[${pdfEntryIndex}].#field[4]`,
      contactTelephone: `form1[0].Section18_3[${pdfEntryIndex}].#field[2]`,
      contactElectronic: `form1[0].Section18_3[${pdfEntryIndex}].#field[3]`,
      contactWritten: `form1[0].Section18_3[${pdfEntryIndex}].#field[5]`,
      contactOther: `form1[0].Section18_3[${pdfEntryIndex}].#field[6]`,
      contactOtherExplanation: `form1[0].Section18_3[${pdfEntryIndex}].TextField11[5]`,
      // Contact frequency
      frequencyDaily: `form1[0].Section18_3[${pdfEntryIndex}].#field[9]`,
      frequencyWeekly: `form1[0].Section18_3[${pdfEntryIndex}].#field[10]`,
      frequencyMonthly: `form1[0].Section18_3[${pdfEntryIndex}].#field[7]`,
      frequencyQuarterly: `form1[0].Section18_3[${pdfEntryIndex}].#field[13]`,
      frequencyAnnually: `form1[0].Section18_3[${pdfEntryIndex}].#field[8]`,
      frequencyOther: `form1[0].Section18_3[${pdfEntryIndex}].#field[12]`,
      frequencyOtherExplanation: `form1[0].Section18_3[${pdfEntryIndex}].TextField11[0]`,
      // Documentation types (18.4 functionality)
      docI551: `form1[0].Section18_3[${pdfEntryIndex}].#field[30]`,
      docI766: `form1[0].Section18_3[${pdfEntryIndex}].#field[29]`,
      docUSVisa: `form1[0].Section18_3[${pdfEntryIndex}].#field[32]`,
      docI94: `form1[0].Section18_3[${pdfEntryIndex}].#field[35]`,
      docI20: `form1[0].Section18_3[${pdfEntryIndex}].#field[33]`,
      docDS2019: `form1[0].Section18_3[${pdfEntryIndex}].#field[34]`,
      docOther: `form1[0].Section18_3[${pdfEntryIndex}].#field[31]`,
      docNumber: `form1[0].Section18_3[${pdfEntryIndex}].TextField11[7]`,
      docExpiration: `form1[0].Section18_3[${pdfEntryIndex}].From_Datefield_Name_2[4]`,
      // Contact dates (18.5 functionality)
      firstContactDate: areaIndex !== undefined ? 
        `form1[0].Section18_3[${pdfEntryIndex}].#area[${areaIndex}].From_Datefield_Name_2[0]` :
        `form1[0].Section18_3[${pdfEntryIndex}].#area[1].From_Datefield_Name_2[0]`,
      lastContactDate: areaIndex !== undefined ? 
        `form1[0].Section18_3[${pdfEntryIndex}].#area[${areaIndex}].From_Datefield_Name_2[1]` :
        `form1[0].Section18_3[${pdfEntryIndex}].#area[1].From_Datefield_Name_2[1]`,
    }
  };
  
  const pattern = patterns[subsection][fieldType as keyof typeof patterns[typeof subsection]];
  
  if (!pattern) {
    console.warn(`⚠️ Section18: Unknown field type "${fieldType}" for subsection ${subsection}`);
    return `form1[0].Section${subsection}[${pdfEntryIndex}].UnknownField[${fieldType}]`;
  }
  
  return pattern;
}

/**
 * Generate batch fields for complex structures
 */
export function generateBatchFields<T = any>(
  sectionId: number,
  fieldDefinitions: Array<{
    key: string;
    path: string;
    defaultValue: T;
    options?: readonly string[];
  }>
): Record<string, Field<T> | FieldWithOptions<T>> {
  const fields: Record<string, Field<T> | FieldWithOptions<T>> = {};
  
  fieldDefinitions.forEach(({ key, path, defaultValue, options }) => {
    fields[key] = generateAdvancedField(sectionId, path, defaultValue, options);
  });
  
  return fields;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate fallback ID for fields not found in PDF
 */
function generateFallbackId(fieldPath: string): string {
  // Create a hash-like ID from the field path
  let hash = 0;
  for (let i = 0; i < fieldPath.length; i++) {
    const char = fieldPath.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString().padStart(4, '0');
}

/**
 * Infer field type from path and default value
 */
function inferFieldType(fieldPath: string, defaultValue: any): string {
  if (typeof defaultValue === 'boolean') return 'PDFCheckBox';
  if (fieldPath.includes('Date') || fieldPath.includes('date')) return 'PDFTextField';
  if (fieldPath.includes('DropDown') || fieldPath.includes('dropdown')) return 'PDFDropdown';
  if (fieldPath.includes('RadioButton') || fieldPath.includes('radio')) return 'PDFRadioGroup';
  return 'PDFTextField';
}

/**
 * Generate human-readable label from field path
 */
function generateFieldLabel(fieldPath: string, components: ReturnType<typeof parseFieldPath>): string {
  // Extract meaningful parts from the path
  const pathParts = fieldPath.split(/[.\[\]]/);
  const meaningfulParts = pathParts.filter(part => 
    part && 
    !part.match(/^\d+$/) && 
    !part.includes('form1') &&
    !part.includes('#field') &&
    !part.includes('#area')
  );
  
  if (meaningfulParts.length > 0) {
    const lastPart = meaningfulParts[meaningfulParts.length - 1];
    // Convert camelCase to Title Case
    return lastPart.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
  
  return `Field ${fieldPath}`;
}

/**
 * Validate field generation parameters
 */
export function validateFieldGenerationParams(
  sectionId: number,
  fieldPath: string,
  defaultValue: any
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!sectionId || sectionId < 1 || sectionId > 30) {
    errors.push('Invalid section ID: must be between 1 and 30');
  }
  
  if (!fieldPath || fieldPath.trim().length === 0) {
    errors.push('Field path cannot be empty');
  }
  
  if (defaultValue === undefined) {
    errors.push('Default value cannot be undefined');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
