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
    [`section15.militaryService.${entryIndex}.serviceState.value`]: { defaultValue: '' },
    [`section15.militaryService.${entryIndex}.serviceStatus.value`]: {
      defaultValue: '',
      options: ['Officer', 'Enlisted', 'Other']
    },
    [`section15.militaryService.${entryIndex}.fromDate.month.value`]: { defaultValue: '' },
    [`section15.militaryService.${entryIndex}.fromDate.year.value`]: { defaultValue: '' },
    [`section15.militaryService.${entryIndex}.fromDateEstimated.value`]: { defaultValue: false },
    [`section15.militaryService.${entryIndex}.toDate.month.value`]: { defaultValue: '' },
    [`section15.militaryService.${entryIndex}.toDate.year.value`]: { defaultValue: '' },
    [`section15.militaryService.${entryIndex}.toDateEstimated.value`]: { defaultValue: false },
    [`section15.militaryService.${entryIndex}.isPresent.value`]: { defaultValue: false },
    [`section15.militaryService.${entryIndex}.serviceNumber.value`]: { defaultValue: '' },
    [`section15.militaryService.${entryIndex}.dischargeType.value`]: {
      defaultValue: '',
      options: ['Yes', 'No']
    },
    [`section15.militaryService.${entryIndex}.typeOfDischarge.value`]: {
      defaultValue: '',
      options: ['Honorable', 'General', 'Other Than Honorable', 'Bad Conduct', 'Dishonorable']
    },
    [`section15.militaryService.${entryIndex}.dischargeDate.month.value`]: { defaultValue: '' },
    [`section15.militaryService.${entryIndex}.dischargeDate.year.value`]: { defaultValue: '' },
    [`section15.militaryService.${entryIndex}.dischargeDateEstimated.value`]: { defaultValue: false },
    [`section15.militaryService.${entryIndex}.otherDischargeType.value`]: { defaultValue: '' },
    [`section15.militaryService.${entryIndex}.dischargeReason.value`]: { defaultValue: '' },
    [`section15.militaryService.${entryIndex}.currentStatus.activeDuty.value`]: { defaultValue: false },
    [`section15.militaryService.${entryIndex}.currentStatus.activeReserve.value`]: { defaultValue: false },
    [`section15.militaryService.${entryIndex}.currentStatus.inactiveReserve.value`]: { defaultValue: false },
  };

  return generateFields(fieldMappings);
}

/**
 * Generate fields for disciplinary procedures entry
 */
export function generateDisciplinaryFields(entryIndex: number): Record<string, Field<any> | FieldWithOptions<any>> {
  console.log(`🔄 Section15: Generating disciplinary fields for entry ${entryIndex}`);

  const fieldMappings = {
    [`section15.disciplinaryProcedures.${entryIndex}.procedureDate.month.value`]: { defaultValue: '' },
    [`section15.disciplinaryProcedures.${entryIndex}.procedureDate.year.value`]: { defaultValue: '' },
    [`section15.disciplinaryProcedures.${entryIndex}.procedureDateEstimated.value`]: { defaultValue: false },
    [`section15.disciplinaryProcedures.${entryIndex}.ucmjOffenseDescription.value`]: { defaultValue: '' },
    [`section15.disciplinaryProcedures.${entryIndex}.disciplinaryProcedureName.value`]: { defaultValue: '' },
    [`section15.disciplinaryProcedures.${entryIndex}.militaryCourtDescription.value`]: { defaultValue: '' },
    [`section15.disciplinaryProcedures.${entryIndex}.finalOutcome.value`]: { defaultValue: '' },
  };

  return generateFields(fieldMappings);
}

/**
 * Generate fields for foreign military service entry
 */
export function generateForeignMilitaryFields(entryIndex: number): Record<string, Field<any> | FieldWithOptions<any>> {
  console.log(`🔄 Section15: Generating foreign military fields for entry ${entryIndex}`);

  const fieldMappings = {
    [`section15.foreignMilitaryService.${entryIndex}.fromDate.month.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.fromDate.year.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.fromDateEstimated.value`]: { defaultValue: false },
    [`section15.foreignMilitaryService.${entryIndex}.toDate.month.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.toDate.year.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.toDateEstimated.value`]: { defaultValue: false },
    [`section15.foreignMilitaryService.${entryIndex}.isPresent.value`]: { defaultValue: false },
    [`section15.foreignMilitaryService.${entryIndex}.organizationName.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.country.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.highestRank.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.divisionDepartment.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.reasonForLeaving.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.circumstancesDescription.value`]: { defaultValue: '' },
    // Contact Person 1
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson1.firstName.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson1.middleName.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson1.lastName.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson1.suffix.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson1.streetAddress.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson1.city.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson1.state.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson1.country.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson1.zipCode.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson1.officialTitle.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson1.frequencyOfContact.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson1.associationFromDate.month.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson1.associationFromDate.year.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson1.associationToDate.month.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson1.associationToDate.year.value`]: { defaultValue: '' },
    // Contact Person 2
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson2.firstName.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson2.middleName.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson2.lastName.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson2.suffix.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson2.streetAddress.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson2.city.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson2.state.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson2.country.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson2.zipCode.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson2.officialTitle.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson2.frequencyOfContact.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson2.associationFromDate.month.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson2.associationFromDate.year.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson2.associationToDate.month.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson2.associationToDate.year.value`]: { defaultValue: '' },
    [`section15.foreignMilitaryService.${entryIndex}.contactPerson2.specify.value`]: { defaultValue: '' },
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
