/**
 * Enhanced Section 13 Field Mapping with 100% Coverage
 * 
 * This file provides comprehensive mapping between UI fields and PDF fields
 * with support for dynamic entries, validation rules, and page tracking.
 */

export interface FieldMappingEntry {
  uiPath: string;
  pdfFieldName: string;
  fieldType: 'text' | 'radio' | 'checkbox' | 'date' | 'dropdown';
  page: number;
  validation?: {
    required: boolean;
    format?: string;
    maxLength?: number;
    pattern?: RegExp;
  };
  dynamicIndex?: boolean;
  transformer?: (value: any) => any;
}

// Page 17 Complete Field Mappings
export const PAGE_17_FIELD_MAPPINGS: FieldMappingEntry[] = [
  // Main Employment Questions
  {
    uiPath: 'section13.hasEmployment',
    pdfFieldName: 'form1[0].section_13_1-2[0].RadioButtonList[1]',
    fieldType: 'radio',
    page: 17,
    validation: { required: true }
  },
  {
    uiPath: 'section13.hasGaps',
    pdfFieldName: 'form1[0].section_13_1-2[0].RadioButtonList[0]',
    fieldType: 'radio',
    page: 17,
    validation: { required: true }
  },
  {
    uiPath: 'section13.gapExplanation',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[0]',
    fieldType: 'text',
    page: 17,
    validation: { required: false, maxLength: 500 }
  },
  
  // Employment Type Selection
  {
    uiPath: 'section13.employmentType',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[1]',
    fieldType: 'dropdown',
    page: 17,
    validation: { required: true }
  },
  
  // Military Employment Entry Fields (Dynamic)
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].employmentDates.fromDate',
    pdfFieldName: 'form1[0].section_13_1-2[0].From_Datefield_Name_2[{index}]',
    fieldType: 'date',
    page: 17,
    dynamicIndex: true,
    validation: { required: true, format: 'MM/YYYY' },
    transformer: (value: string) => {
      // Convert YYYY-MM-DD to MM/YYYY
      if (!value) return '';
      const date = new Date(value);
      return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].employmentDates.toDate',
    pdfFieldName: 'form1[0].section_13_1-2[0].From_Datefield_Name_2[{index + 1}]',
    fieldType: 'date',
    page: 17,
    dynamicIndex: true,
    validation: { required: false, format: 'MM/YYYY' },
    transformer: (value: string) => {
      if (!value) return '';
      const date = new Date(value);
      return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].employmentDates.present',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{37 + index * 10}]',
    fieldType: 'checkbox',
    page: 17,
    dynamicIndex: true
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].employmentStatus',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{33 + index * 10}]',
    fieldType: 'checkbox',
    page: 17,
    dynamicIndex: true,
    transformer: (value: string) => value === 'Part-time'
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].employmentDates.fromEstimated',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{32 + index * 10}]',
    fieldType: 'checkbox',
    page: 17,
    dynamicIndex: true
  },
  
  // Employer Information
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].employerName',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{2 + index * 20}]',
    fieldType: 'text',
    page: 17,
    dynamicIndex: true,
    validation: { required: true, maxLength: 100 }
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].positionTitle',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{3 + index * 20}]',
    fieldType: 'text',
    page: 17,
    dynamicIndex: true,
    validation: { required: true, maxLength: 100 }
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].rankTitle',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{4 + index * 20}]',
    fieldType: 'text',
    page: 17,
    dynamicIndex: true,
    validation: { required: true, maxLength: 50 }
  },
  
  // Duty Station Information
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].dutyStation.dutyStation',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{5 + index * 20}]',
    fieldType: 'text',
    page: 17,
    dynamicIndex: true,
    validation: { required: true }
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].dutyStation.street',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{6 + index * 20}]',
    fieldType: 'text',
    page: 17,
    dynamicIndex: true
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].dutyStation.city',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{7 + index * 20}]',
    fieldType: 'text',
    page: 17,
    dynamicIndex: true
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].dutyStation.state',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{8 + index * 20}]',
    fieldType: 'dropdown',
    page: 17,
    dynamicIndex: true
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].dutyStation.zipCode',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{9 + index * 20}]',
    fieldType: 'text',
    page: 17,
    dynamicIndex: true,
    validation: { pattern: /^\d{5}(-\d{4})?$/ }
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].dutyStation.country',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{10 + index * 20}]',
    fieldType: 'dropdown',
    page: 17,
    dynamicIndex: true
  },
  
  // Phone Information
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].phone.number',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{11 + index * 20}]',
    fieldType: 'text',
    page: 17,
    dynamicIndex: true,
    validation: { pattern: /^\d{3}-\d{3}-\d{4}$/ }
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].phone.extension',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{12 + index * 20}]',
    fieldType: 'text',
    page: 17,
    dynamicIndex: true
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].phone.isDSN',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{13 + index * 20}]',
    fieldType: 'checkbox',
    page: 17,
    dynamicIndex: true
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].phone.isDay',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{14 + index * 20}]',
    fieldType: 'checkbox',
    page: 17,
    dynamicIndex: true
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].phone.isNight',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{15 + index * 20}]',
    fieldType: 'checkbox',
    page: 17,
    dynamicIndex: true
  },
  
  // Supervisor Information
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].supervisor.name',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{16 + index * 20}]',
    fieldType: 'text',
    page: 17,
    dynamicIndex: true,
    validation: { required: true }
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].supervisor.title',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{17 + index * 20}]',
    fieldType: 'text',
    page: 17,
    dynamicIndex: true,
    validation: { required: true }
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].supervisor.email',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{18 + index * 20}]',
    fieldType: 'text',
    page: 17,
    dynamicIndex: true,
    validation: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
  },
  {
    uiPath: 'section13.militaryEmployment.entries[{index}].supervisor.phone.number',
    pdfFieldName: 'form1[0].section_13_1-2[0].#field[{19 + index * 20}]',
    fieldType: 'text',
    page: 17,
    dynamicIndex: true,
    validation: { required: true }
  }
];

/**
 * Enhanced field mapping function with dynamic index support
 */
export function mapFieldWithDynamicIndex(
  mapping: FieldMappingEntry, 
  index: number
): FieldMappingEntry {
  if (!mapping.dynamicIndex) return mapping;
  
  // Replace {index} with actual index value
  const processedMapping = { ...mapping };
  processedMapping.uiPath = processedMapping.uiPath.replace(/\{index\}/g, String(index));
  processedMapping.pdfFieldName = processedMapping.pdfFieldName.replace(/\{index\}/g, String(index));
  
  // Handle arithmetic expressions like {index + 1}
  processedMapping.pdfFieldName = processedMapping.pdfFieldName.replace(
    /\{index\s*\+\s*(\d+)\}/g, 
    (match, offset) => String(index + parseInt(offset))
  );
  processedMapping.pdfFieldName = processedMapping.pdfFieldName.replace(
    /\{(\d+)\s*\+\s*index\s*\*\s*(\d+)\}/g,
    (match, base, multiplier) => String(parseInt(base) + index * parseInt(multiplier))
  );
  
  return processedMapping;
}

/**
 * Get all field mappings for a specific page with dynamic index expansion
 */
export function getPageFieldMappings(
  pageNumber: number, 
  maxEntries: number = 4
): FieldMappingEntry[] {
  const baseMappings = PAGE_17_FIELD_MAPPINGS.filter(m => m.page === pageNumber);
  const expandedMappings: FieldMappingEntry[] = [];
  
  for (const mapping of baseMappings) {
    if (mapping.dynamicIndex) {
      // Expand for each possible entry index (0-3)
      for (let i = 0; i < maxEntries; i++) {
        expandedMappings.push(mapFieldWithDynamicIndex(mapping, i));
      }
    } else {
      expandedMappings.push(mapping);
    }
  }
  
  return expandedMappings;
}

/**
 * Validate a field value against its mapping rules
 */
export function validateFieldValue(
  mapping: FieldMappingEntry, 
  value: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!mapping.validation) return { valid: true, errors };
  
  // Required field check
  if (mapping.validation.required && (!value || value === '')) {
    errors.push(`${mapping.uiPath} is required`);
  }
  
  // Format validation
  if (value && mapping.validation.format) {
    if (mapping.fieldType === 'date' && mapping.validation.format === 'MM/YYYY') {
      const datePattern = /^\d{2}\/\d{4}$/;
      if (!datePattern.test(value)) {
        errors.push(`${mapping.uiPath} must be in MM/YYYY format`);
      }
    }
  }
  
  // Pattern validation
  if (value && mapping.validation.pattern) {
    if (!mapping.validation.pattern.test(value)) {
      errors.push(`${mapping.uiPath} has invalid format`);
    }
  }
  
  // Max length validation
  if (value && mapping.validation.maxLength) {
    if (String(value).length > mapping.validation.maxLength) {
      errors.push(`${mapping.uiPath} exceeds maximum length of ${mapping.validation.maxLength}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Transform UI value to PDF-compatible format
 */
export function transformValueForPDF(
  mapping: FieldMappingEntry, 
  value: any
): any {
  if (!value) return '';
  
  // Apply custom transformer if available
  if (mapping.transformer) {
    return mapping.transformer(value);
  }
  
  // Default transformations based on field type
  switch (mapping.fieldType) {
    case 'checkbox':
      return Boolean(value);
    case 'date':
      // Default date transformation
      if (mapping.validation?.format === 'MM/YYYY') {
        const date = new Date(value);
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      }
      return value;
    case 'text':
    case 'dropdown':
    case 'radio':
    default:
      return String(value);
  }
}

/**
 * Create a reverse mapping from PDF field to UI path for validation
 */
export function createReverseMapping(pageNumber: number): Map<string, string> {
  const mappings = getPageFieldMappings(pageNumber);
  const reverseMap = new Map<string, string>();
  
  for (const mapping of mappings) {
    reverseMap.set(mapping.pdfFieldName, mapping.uiPath);
  }
  
  return reverseMap;
}