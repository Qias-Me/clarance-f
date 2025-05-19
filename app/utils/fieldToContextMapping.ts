/**
 * Field to Context Mapping Utility
 * 
 * This utility handles mapping field IDs from field-hierarchy.json to
 * context keys in the application's state management system.
 */

import { cloneDeep } from 'lodash';
import { type FieldMetadata, type FieldHierarchy } from '../../api/interfaces/FieldMetadata';
import { stripIdSuffix, addIdSuffix, processFormFieldIds } from './formHandler';
import { type ApplicantFormValues } from '../../api/interfaces/formDefinition';
import { sectionToFileMapping } from './fieldHierarchyParser';

/**
 * Interface representing a mapping between a field ID and its corresponding context key
 */
export interface FieldContextMapping {
  fieldId: string;
  sectionNumber: number;
  sectionName: string;
  contextKey: string;
  path: string[];
}

/**
 * Maps field IDs to context keys for a specific section
 * 
 * @param sectionNumber The section number to map
 * @param fields The fields for the section
 * @returns Mappings between field IDs and context keys
 */
export function mapSectionFieldsToContext(
  sectionNumber: number,
  fields: FieldMetadata[]
): FieldContextMapping[] {
  const mappings: FieldContextMapping[] = [];
  const contextKey = sectionToFileMapping[sectionNumber];
  
  if (!contextKey) {
    console.warn(`No context key mapping found for section ${sectionNumber}`);
    return mappings;
  }

  fields.forEach(field => {
    // Create a context path based on field properties
    // Make sure we're working with the stripped ID (no "0 R" suffix)
    const strippedId = stripIdSuffix(field.id);
    const nameSegments = field.name.split(/[\[\]\.]+/).filter(Boolean);
    
    // Generate context key path for the field
    const lastSegment = nameSegments[nameSegments.length - 1];
    const pathBase = [contextKey];
    
    // For field names that follow a pattern like "sectionX.fieldName"
    // Extract the field name part for the context path
    const fieldNameMatch = lastSegment.match(/([a-zA-Z]+)(\d*)$/);
    const fieldContextKey = fieldNameMatch ? fieldNameMatch[1] : lastSegment;
    
    // Build the full path to the field in the context
    mappings.push({
      fieldId: strippedId,
      sectionNumber: field.section,
      sectionName: field.sectionName,
      contextKey: fieldContextKey,
      path: [...pathBase, fieldContextKey]
    });
  });

  return mappings;
}

/**
 * Maps all fields to context keys
 * 
 * @param fieldHierarchy The field hierarchy data
 * @returns Mappings between all field IDs and context keys
 */
export function createFieldToContextMappings(
  fieldHierarchy: FieldHierarchy
): Record<string, FieldContextMapping> {
  const mappings: Record<string, FieldContextMapping> = {};
  
  // Process each form and section
  Object.values(fieldHierarchy).forEach(form => {
    if (!form.fields) return;
    
    // Group fields by section
    const fieldsBySection: Record<number, FieldMetadata[]> = {};
    
    form.fields.forEach(field => {
      const section = field.section;
      if (!fieldsBySection[section]) {
        fieldsBySection[section] = [];
      }
      fieldsBySection[section].push(field);
    });
    
    // Map fields for each section
    Object.entries(fieldsBySection).forEach(([sectionNum, sectionFields]) => {
      const sectionNumber = Number(sectionNum);
      const sectionMappings = mapSectionFieldsToContext(sectionNumber, sectionFields);
      
      // Add to global mappings - use stripped IDs as keys
      sectionMappings.forEach(mapping => {
        mappings[mapping.fieldId] = mapping;
      });
    });
  });
  
  return mappings;
}

/**
 * Apply field mappings to a context structure
 * 
 * @param context The context to update
 * @param mappings Field to context mappings
 * @param fieldValues Field values to apply
 * @returns Updated context with mapped values
 */
export function applyFieldMappingsToContext(
  context: ApplicantFormValues,
  mappings: Record<string, FieldContextMapping>,
  fieldValues: Record<string, any>
): ApplicantFormValues {
  const updatedContext = cloneDeep(context);
  
  Object.entries(fieldValues).forEach(([fieldId, value]) => {
    // Important: Ensure we're using stripped ID for lookups
    const strippedId = stripIdSuffix(fieldId);
    const mapping = mappings[strippedId];
    
    if (!mapping) {
      console.warn(`No mapping found for field ID ${fieldId} (stripped: ${strippedId})`);
      return;
    }
    
    // Follow the path to the target in the context
    const contextSection = updatedContext[mapping.path[0] as keyof ApplicantFormValues];
    
    if (!contextSection) {
      console.warn(`Section ${mapping.path[0]} not found in context`);
      return;
    }
    
    // For a real implementation, we would use a more sophisticated
    // algorithm to set nested properties, handle arrays, etc.
    // For now, we just log what would happen
    console.log(`Would set ${mapping.path.join('.')} to`, value);
    
    // Example of how we might actually set the value (commented out for now)
    /*
    if (mapping.path.length === 2 && typeof contextSection === 'object') {
      const [_, fieldKey] = mapping.path;
      if (fieldKey in contextSection) {
        const field = (contextSection as any)[fieldKey];
        // Always store IDs without the suffix in the context
        if (field && typeof field === 'object') {
          field.value = value;
          if (field.id) {
            field.id = stripIdSuffix(field.id);
          }
        }
      }
    }
    */
  });
  
  // Make sure all field IDs in the context are in the correct format (no "0 R" suffix)
  return processFormFieldIds(updatedContext, false);
}

/**
 * Get context value for a field ID
 * 
 * @param context The context structure
 * @param fieldId The field ID to look up
 * @param mappings Field to context mappings
 * @returns The context value for the field, or undefined if not found
 */
export function getContextValueForField(
  context: ApplicantFormValues,
  fieldId: string,
  mappings: Record<string, FieldContextMapping>
): any {
  // Ensure we strip the ID suffix for lookup
  const strippedId = stripIdSuffix(fieldId);
  const mapping = mappings[strippedId];
  
  if (!mapping) {
    console.warn(`No mapping found for field ID ${fieldId} (stripped: ${strippedId})`);
    return undefined;
  }
  
  const contextSection = context[mapping.path[0] as keyof ApplicantFormValues];
  
  if (!contextSection) {
    console.warn(`Section ${mapping.path[0]} not found in context`);
    return undefined;
  }
  
  // For a real implementation, we would use a more sophisticated
  // algorithm to get nested properties, handle arrays, etc.
  // For now, we just log what would happen
  console.log(`Would get value from ${mapping.path.join('.')}`);
  
  // Example of how we might actually get the value (commented out for now)
  /*
  if (mapping.path.length === 2 && typeof contextSection === 'object') {
    const [_, fieldKey] = mapping.path;
    if (fieldKey in contextSection) {
      const field = (contextSection as any)[fieldKey];
      if (field && typeof field === 'object' && 'value' in field) {
        return field.value;
      }
    }
  }
  */
  
  return undefined;
}

/**
 * Updates the context model with field values from field-hierarchy.json
 * 
 * @param context The context to update
 * @param fieldHierarchy The field hierarchy data
 * @returns Updated context with field values
 */
export function updateContextWithFieldHierarchy(
  context: ApplicantFormValues,
  fieldHierarchy: FieldHierarchy
): ApplicantFormValues {
  const mappings = createFieldToContextMappings(fieldHierarchy);
  const fieldValues: Record<string, any> = {};
  
  // Extract field values from hierarchy
  Object.values(fieldHierarchy).forEach(form => {
    if (!form.fields) return;
    
    form.fields.forEach(field => {
      // Use the field ID as is - applyFieldMappingsToContext will strip it
      fieldValues[field.id] = field.value;
    });
  });
  
  return applyFieldMappingsToContext(context, mappings, fieldValues);
} 