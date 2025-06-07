/**
 * Section 19 Field Generator
 * 
 * Generates Section 19 fields using the DRY approach with sections-references
 * as the single source of truth. Follows Section 29 implementation patterns.
 */

import { createFieldFromReference } from '../../../../api/utils/sections-references-loader';
import type { Field } from '../../../../api/interfaces/formDefinition2.0';

// Import sections-references for Section 19
import section19References from '../../../../api/sections-references/section-19.json';

/**
 * Generate Section 19 fields using sections-references as source of truth
 * Section 19 has 4 subsections: Section19_1, Section19_2, Section19_3, Section19_4
 * Each subsection contains identical field structures for foreign national contacts
 */

export interface Section19FieldMap {
  [subsectionKey: string]: {
    [fieldType: string]: Field<any>;
  };
}

/**
 * Generate fields for a specific Section 19 subsection
 */
export function generateSection19SubsectionFields(subsectionKey: string): Record<string, Field<any>> {
  console.log(`🔍 Generating Section 19 fields for subsection: ${subsectionKey}`);
  
  const fields: Record<string, Field<any>> = {};
  
  // Filter fields for this specific subsection
  const subsectionFields = section19References.fields.filter(field => 
    field.name.includes(`Section${subsectionKey}[0]`)
  );
  
  console.log(`📊 Found ${subsectionFields.length} fields for ${subsectionKey}`);
  
  // Generate fields using createFieldFromReference
  subsectionFields.forEach(fieldRef => {
    try {
      const fieldKey = extractFieldKey(fieldRef.name);
      if (fieldKey) {
        const field = createFieldFromReference(19, fieldRef.name, '');
        fields[fieldKey] = field;
        console.log(`✅ Generated field: ${fieldKey} -> ${fieldRef.name}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to generate field for ${fieldRef.name}:`, error);
    }
  });
  
  return fields;
}

/**
 * Extract a meaningful field key from the PDF field name
 */
function extractFieldKey(pdfFieldName: string): string | null {
  // Extract field type and index from PDF field names like:
  // form1[0].Section19_1[0].RadioButtonList[0] -> radioButtonList_0
  // form1[0].Section19_1[0].TextField11[1] -> textField11_1
  // form1[0].Section19_1[0].DropDownList12[0] -> dropDownList12_0
  
  const patterns = [
    // Radio buttons
    /Section19_\d+\[0\]\.RadioButtonList\[(\d+)\]/,
    // Text fields
    /Section19_\d+\[0\]\.TextField11\[(\d+)\]/,
    // Dropdown lists
    /Section19_\d+\[0\]\.DropDownList12\[(\d+)\]/,
    /Section19_\d+\[0\]\.DropDownList28\[(\d+)\]/,
    // Name fields
    /Section19_\d+\[0\]\.Name_List_Long\[(\d+)\]/,
    // Date fields
    /Section19_\d+\[0\]\.Date_List\[(\d+)\]/,
    // Other specific patterns
    /Section19_\d+\[0\]\.([^[]+)\[(\d+)\]/
  ];
  
  for (const pattern of patterns) {
    const match = pdfFieldName.match(pattern);
    if (match) {
      const fieldType = match[1] || extractFieldType(pdfFieldName);
      const index = match[2] || match[1];
      return `${fieldType}_${index}`;
    }
  }
  
  // Fallback: extract last part of field name
  const lastPart = pdfFieldName.split('.').pop();
  if (lastPart) {
    return lastPart.replace(/\[|\]/g, '_').toLowerCase();
  }
  
  return null;
}

/**
 * Extract field type from PDF field name
 */
function extractFieldType(pdfFieldName: string): string {
  if (pdfFieldName.includes('RadioButtonList')) return 'radioButton';
  if (pdfFieldName.includes('TextField')) return 'textField';
  if (pdfFieldName.includes('DropDownList')) return 'dropDown';
  if (pdfFieldName.includes('Name_List_Long')) return 'nameField';
  if (pdfFieldName.includes('Date_List')) return 'dateField';
  return 'field';
}

/**
 * Generate all Section 19 fields for all 4 subsections
 */
export function generateAllSection19Fields(): Section19FieldMap {
  console.log('🚀 Generating all Section 19 fields...');
  
  const allFields: Section19FieldMap = {};
  
  // Generate fields for all 4 subsections
  const subsections = ['19_1', '19_2', '19_3', '19_4'];
  
  subsections.forEach(subsectionKey => {
    allFields[subsectionKey] = generateSection19SubsectionFields(subsectionKey);
  });
  
  console.log(`✅ Generated Section 19 fields for ${subsections.length} subsections`);
  console.log(`📊 Total field groups: ${Object.keys(allFields).length}`);
  
  return allFields;
}

/**
 * Get field count for validation
 */
export function getSection19FieldCount(): number {
  return section19References.fields.length;
}

/**
 * Get subsection field count
 */
export function getSubsectionFieldCount(subsectionKey: string): number {
  return section19References.fields.filter(field => 
    field.name.includes(`Section${subsectionKey}[0]`)
  ).length;
}

/**
 * Validate Section 19 field structure
 */
export function validateSection19Fields(): {
  isValid: boolean;
  errors: string[];
  fieldCount: number;
  subsectionCounts: Record<string, number>;
} {
  const errors: string[] = [];
  const subsectionCounts: Record<string, number> = {};
  
  // Check total field count
  const totalFields = getSection19FieldCount();
  if (totalFields !== 277) {
    errors.push(`Expected 277 fields, found ${totalFields}`);
  }
  
  // Check each subsection
  const subsections = ['19_1', '19_2', '19_3', '19_4'];
  subsections.forEach(subsectionKey => {
    const count = getSubsectionFieldCount(subsectionKey);
    subsectionCounts[subsectionKey] = count;
    
    if (count === 0) {
      errors.push(`No fields found for subsection ${subsectionKey}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    fieldCount: totalFields,
    subsectionCounts
  };
}
