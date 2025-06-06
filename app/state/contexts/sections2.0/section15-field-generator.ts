/**
 * Section 15 Field Generator - Generate Field<T> objects from sections-reference data
 *
 * This module generates properly typed Field<T> objects for Section 15 using the
 * actual PDF field data from section-15.json reference file.
 */

import { createFieldFromReference } from '../../../../api/utils/sections-references-loader';
import type { Field, FieldWithOptions } from '../../../../api/interfaces/formDefinition2.0';
import { mapLogicalFieldToPdfField, getFieldMetadata, validateFieldExists, findSimilarFieldNames } from './section15-field-mapping';

/**
 * Generate a Field<T> object for a logical field path
 */
export function generateField<T = any>(
  logicalPath: string,
  defaultValue: T,
  options?: readonly string[]
): Field<T> | FieldWithOptions<T> {
  console.log(`🔄 Section15: Generating field for logical path: ${logicalPath}`);
  
  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  const fieldMetadata = getFieldMetadata(logicalPath);
  
  console.log(`🔍 Section15: Mapped to PDF field: ${pdfFieldName}`);
  
  // Validate that the field exists
  if (!validateFieldExists(pdfFieldName)) {
    console.warn(`⚠️ Section15: PDF field not found: ${pdfFieldName}`);
    console.warn(`🔍 Section15: Similar fields:`, findSimilarFieldNames(pdfFieldName, 3));
  }
  
  try {
    const field = createFieldFromReference(15, pdfFieldName, defaultValue);
    
    console.log(`✅ Section15: Successfully created field for ${logicalPath}:`, {
      id: field.id,
      name: field.name,
      type: field.type,
      label: field.label
    });
    
    if (options && options.length > 0) {
      return {
        ...field,
        options
      } as FieldWithOptions<T>;
    }
    
    return field as Field<T>;
  } catch (error) {
    console.warn(`❌ Section15: Failed to generate field for ${logicalPath}:`, error);
    
    // Fallback field structure
    const fallbackField: Field<T> = {
      id: fieldMetadata?.id?.replace(' 0 R', '') || '0000',
      name: pdfFieldName,
      type: fieldMetadata?.type || 'PDFTextField',
      label: fieldMetadata?.label || `Field ${logicalPath}`,
      value: defaultValue,
      rect: fieldMetadata?.rect || { x: 0, y: 0, width: 0, height: 0 }
    };
    
    console.log(`🔄 Section15: Using fallback field for ${logicalPath}:`, fallbackField);
    
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
  console.log(`🔄 Section15: Generating ${Object.keys(fieldMappings).length} fields`);
  
  const fields: Record<string, Field<T> | FieldWithOptions<T>> = {};
  
  Object.entries(fieldMappings).forEach(([logicalPath, config]) => {
    const fieldKey = logicalPath.split('.').pop() || logicalPath;
    fields[fieldKey] = generateField(logicalPath, config.defaultValue, config.options);
  });
  
  console.log(`✅ Section15: Generated ${Object.keys(fields).length} fields successfully`);
  
  return fields;
}

/**
 * Generate fields for military service entry
 */
export function generateMilitaryServiceFields(entryIndex: number): Record<string, Field<any> | FieldWithOptions<any>> {
  console.log(`🔄 Section15: Generating military service fields for entry ${entryIndex}`);
  
  const fieldMappings = {
    [`section15.militaryService.${entryIndex}.branch.value`]: { 
      defaultValue: '', 
      options: ['Army', 'Navy', 'Air Force', 'Marines', 'Coast Guard', 'Space Force'] 
    },
    [`section15.militaryService.${entryIndex}.status.value`]: { 
      defaultValue: '', 
      options: ['Active Duty', 'Active Reserve', 'Inactive Reserve'] 
    },
    [`section15.militaryService.${entryIndex}.serviceNumber.value`]: { defaultValue: '' },
    [`section15.militaryService.${entryIndex}.startDate.value`]: { defaultValue: '' },
    [`section15.militaryService.${entryIndex}.endDate.value`]: { defaultValue: '' },
    [`section15.militaryService.${entryIndex}.isStartDateEstimated.value`]: { defaultValue: false },
    [`section15.militaryService.${entryIndex}.isEndDateEstimated.value`]: { defaultValue: false },
    [`section15.militaryService.${entryIndex}.dischargeType.value`]: { 
      defaultValue: '', 
      options: ['Honorable', 'General', 'Other Than Honorable', 'Bad Conduct', 'Dishonorable'] 
    },
    [`section15.militaryService.${entryIndex}.dischargeReason.value`]: { defaultValue: '' },
  };
  
  return generateFields(fieldMappings);
}

/**
 * Generate fields for disciplinary procedures entry
 */
export function generateDisciplinaryFields(entryIndex: number): Record<string, Field<any> | FieldWithOptions<any>> {
  console.log(`🔄 Section15: Generating disciplinary fields for entry ${entryIndex}`);
  
  const fieldMappings = {
    [`section15.disciplinaryProcedures.${entryIndex}.date.value`]: { defaultValue: '' },
    [`section15.disciplinaryProcedures.${entryIndex}.isDateEstimated.value`]: { defaultValue: false },
    [`section15.disciplinaryProcedures.${entryIndex}.offense.value`]: { defaultValue: '' },
    [`section15.disciplinaryProcedures.${entryIndex}.action.value`]: { defaultValue: '' },
    [`section15.disciplinaryProcedures.${entryIndex}.agency.value`]: { defaultValue: '' },
  };
  
  return generateFields(fieldMappings);
}

/**
 * Generate fields for foreign military service entry
 */
export function generateForeignMilitaryFields(entryIndex: number): Record<string, Field<any> | FieldWithOptions<any>> {
  console.log(`🔄 Section15: Generating foreign military fields for entry ${entryIndex}`);
  
  const fieldMappings = {
    [`section15.foreignMilitaryService.${entryIndex}.country.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.branch.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.rank.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.startDate.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.endDate.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.isStartDateEstimated.value`]: { defaultValue: false },
    [`section15.foreignMilitaryService.${entryIndex}.isEndDateEstimated.value`]: { defaultValue: false },
  };
  
  return generateFields(fieldMappings);
}

/**
 * Generate main section fields (yes/no questions)
 */
export function generateMainSectionFields(): Record<string, Field<any> | FieldWithOptions<any>> {
  console.log(`🔄 Section15: Generating main section fields`);
  
  const fieldMappings = {
    'section15.militaryService.hasServed.value': { 
      defaultValue: '', 
      options: ['YES', 'NO (If NO, proceed to Section 15.2)'] 
    },
    'section15.disciplinaryProcedures.hasDisciplinaryAction.value': { 
      defaultValue: '', 
      options: ['YES', 'NO'] 
    },
    'section15.foreignMilitaryService.hasForeignService.value': { 
      defaultValue: '', 
      options: ['YES', 'NO'] 
    },
  };
  
  return generateFields(fieldMappings);
}

/**
 * Generate all Section 15 fields
 */
export function generateAllSection15Fields(): Record<string, Field<any> | FieldWithOptions<any>> {
  console.log(`🔄 Section15: Generating all Section 15 fields`);
  
  const allFields = {
    ...generateMainSectionFields(),
    ...generateMilitaryServiceFields(0),
    ...generateMilitaryServiceFields(1),
    ...generateDisciplinaryFields(0),
    ...generateDisciplinaryFields(1),
    ...generateForeignMilitaryFields(0),
    ...generateForeignMilitaryFields(1),
  };
  
  console.log(`✅ Section15: Generated ${Object.keys(allFields).length} total fields`);
  
  return allFields;
}
