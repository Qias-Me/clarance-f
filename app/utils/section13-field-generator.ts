/**
 * Section 13 Field Generator
 * Generates all 1086 fields from the section-13.json reference file
 */

import section13Reference from '../../api/interfaces/sections-references/section-13.json';
import section13Mappings from '../../api/mappings/section-13-mappings.json';

export interface Section13FieldDefinition {
  uiPath: string;
  pdfFieldId: string;
  label: string;
  type: 'text' | 'checkbox' | 'dropdown' | 'radio' | 'date' | 'textarea';
  required: boolean;
  page?: number;
  options?: string[];
  value?: any;
  metadata?: {
    section?: string;
    subsection?: string;
    entryType?: string;
    entryIndex?: number;
    fieldCategory?: string;
  };
}

/**
 * Parse field type from PDF field type
 */
function getFieldType(pdfType: string): Section13FieldDefinition['type'] {
  switch (pdfType) {
    case 'PDFCheckBox':
      return 'checkbox';
    case 'PDFRadioGroup':
      return 'radio';
    case 'PDFDropdown':
      return 'dropdown';
    case 'PDFTextField':
    default:
      return 'text';
  }
}

/**
 * Determine field category based on UI path
 */
function getFieldCategory(uiPath: string): string {
  if (uiPath.includes('militaryEmployment')) return 'military';
  if (uiPath.includes('nonFederalEmployment')) return 'nonFederal';
  if (uiPath.includes('selfEmployment')) return 'selfEmployment';
  if (uiPath.includes('unemployment')) return 'unemployment';
  if (uiPath.includes('federalInfo')) return 'federal';
  if (uiPath.includes('employmentRecordIssues')) return 'employmentRecordIssues';
  if (uiPath.includes('disciplinaryActions')) return 'disciplinaryActions';
  if (uiPath.includes('employmentType')) return 'employmentType';
  return 'general';
}

/**
 * Generate all Section 13 fields
 */
export function generateSection13Fields(): Section13FieldDefinition[] {
  const fields: Section13FieldDefinition[] = [];
  
  // Process all mappings from section-13-mappings.json (1086 fields)
  section13Mappings.mappings.forEach((mapping: any) => {
    // Find corresponding reference field for additional metadata
    const refField = section13Reference.fields.find((f: any) => 
      f.name === mapping.pdfFieldId
    );
    
    const field: Section13FieldDefinition = {
      uiPath: mapping.uiPath || '',
      pdfFieldId: mapping.pdfFieldId || '',
      label: mapping.label || refField?.label || '',
      type: getFieldType(mapping.type || refField?.type || 'PDFTextField'),
      required: false, // Can be enhanced with validation rules
      page: mapping.page || refField?.page,
      options: refField?.options,
      metadata: {
        section: 'section13',
        fieldCategory: getFieldCategory(mapping.uiPath || ''),
        entryType: mapping.entryType,
        entryIndex: mapping.entryIndex
      }
    };
    
    fields.push(field);
  });
  
  return fields;
}

/**
 * Get fields for specific employment type
 */
export function getFieldsForEmploymentType(
  type: 'military' | 'nonFederal' | 'selfEmployment' | 'unemployment' | 'federal' | 'employmentRecordIssues' | 'disciplinaryActions'
): Section13FieldDefinition[] {
  const allFields = generateSection13Fields();
  return allFields.filter(field => field.metadata?.fieldCategory === type);
}

/**
 * Get fields for specific entry
 */
export function getFieldsForEntry(entryType: string, entryIndex: number): Section13FieldDefinition[] {
  const allFields = generateSection13Fields();
  return allFields.filter(field => 
    field.metadata?.entryType === entryType && 
    field.metadata?.entryIndex === entryIndex
  );
}

/**
 * Field statistics
 */
export function getSection13FieldStats() {
  const allFields = generateSection13Fields();
  const categories = allFields.reduce((acc, field) => {
    const category = field.metadata?.fieldCategory || 'uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const types = allFields.reduce((acc, field) => {
    acc[field.type] = (acc[field.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalFields: allFields.length,
    expectedFields: 1086,
    coverage: `${((allFields.length / 1086) * 100).toFixed(2)}%`,
    categories,
    types
  };
}

// Export generated fields as constants
export const SECTION_13_ALL_FIELDS = generateSection13Fields();
export const SECTION_13_FIELD_STATS = getSection13FieldStats();

// Export categorized fields
export const SECTION_13_FIELDS_BY_TYPE = {
  military: getFieldsForEmploymentType('military'),
  nonFederal: getFieldsForEmploymentType('nonFederal'),
  selfEmployment: getFieldsForEmploymentType('selfEmployment'),
  unemployment: getFieldsForEmploymentType('unemployment'),
  federal: getFieldsForEmploymentType('federal'),
  employmentRecordIssues: getFieldsForEmploymentType('employmentRecordIssues'),
  disciplinaryActions: getFieldsForEmploymentType('disciplinaryActions')
};

console.log('📊 Section 13 Field Generator initialized:', {
  totalFields: SECTION_13_ALL_FIELDS.length,
  stats: SECTION_13_FIELD_STATS
});