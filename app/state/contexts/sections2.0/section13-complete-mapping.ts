/**
 * Section 13 Complete Field Mapping
 * 
 * Simplified module that re-exports functionality from the consolidated field mapping system.
 * This module exists for backward compatibility - core functionality is in section13-field-mapping.ts
 */

import {
  generateEnhancedFieldMapping,
  getFieldsByEmploymentType,
  validateFieldCoverage as validateCoverage,
  type FieldMapping,
  type FieldMetadata
} from './section13-field-mapping';

// Backward compatibility interface
export interface CompleteFieldMapping {
  pdfFieldId: string;
  uiPath: string;
  fieldType: 'text' | 'select' | 'checkbox' | 'radio';
  label: string;
  page: number;
  value?: string;
  options?: string[];
  required?: boolean;
  validation?: any;
}

/**
 * Generate complete field mappings (backward compatibility)
 */
export const generateCompleteFieldMappings = async (): Promise<CompleteFieldMapping[]> => {
  const mappings = await generateEnhancedFieldMapping();
  
  return mappings.map(mapping => ({
    pdfFieldId: mapping.pdfField,
    uiPath: mapping.uiPath,
    fieldType: convertFieldType(mapping.fieldType),
    label: mapping.metadata?.label || '',
    page: mapping.metadata?.page || 17,
    value: mapping.uiPath,
    required: false,
    options: getFieldOptions(mapping)
  }));
};

/**
 * Convert field type to legacy format
 */
function convertFieldType(type?: string): 'text' | 'select' | 'checkbox' | 'radio' {
  switch (type) {
    case 'PDFCheckBox': return 'checkbox';
    case 'PDFDropdown': return 'select';
    case 'PDFRadioGroup': return 'radio';
    default: return 'text';
  }
}

/**
 * Get field options for dropdowns and radio groups
 */
function getFieldOptions(mapping: FieldMapping): string[] | undefined {
  const fieldName = mapping.uiPath.toLowerCase();
  const label = (mapping.metadata?.label || '').toLowerCase();
  
  if (fieldName.includes('state') || label.includes('state')) {
    return ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
  }
  
  if (fieldName.includes('country') || label.includes('country')) {
    return ['United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 
            'France', 'Italy', 'Spain', 'Japan', 'China', 'India', 'Other'];
  }
  
  if (fieldName.includes('branch') || label.includes('branch')) {
    return ['Army', 'Navy', 'Air Force', 'Marines', 'Coast Guard', 'Space Force'];
  }
  
  if (fieldName.includes('discharge') || label.includes('discharge')) {
    return ['Honorable', 'General', 'Other Than Honorable', 'Bad Conduct', 
            'Dishonorable', 'Entry Level', 'Medical', 'Other'];
  }
  
  if (fieldName.includes('employment') && fieldName.includes('type')) {
    return ['Military Service', 'Federal Employment', 'State Government', 
            'Local Government', 'Private Company', 'Non-Profit Organization',
            'Self-Employment', 'Contract Work', 'Consulting', 'Unemployment', 'Other'];
  }
  
  return undefined;
}

/**
 * Group fields by employment type and entry index
 */
export const groupFieldsByEmploymentType = async (): Promise<Record<string, CompleteFieldMapping[]>> => {
  const mappings = await generateCompleteFieldMappings();
  
  const groups: Record<string, CompleteFieldMapping[]> = {
    military: [],
    federal: [],
    nonFederal: [],
    selfEmployment: [],
    unemployment: [],
    general: []
  };
  
  mappings.forEach(mapping => {
    if (mapping.uiPath.includes('militaryEmployment')) {
      groups.military.push(mapping);
    } else if (mapping.uiPath.includes('federalEmployment')) {
      groups.federal.push(mapping);
    } else if (mapping.uiPath.includes('nonFederalEmployment')) {
      groups.nonFederal.push(mapping);
    } else if (mapping.uiPath.includes('selfEmployment')) {
      groups.selfEmployment.push(mapping);
    } else if (mapping.uiPath.includes('unemployment')) {
      groups.unemployment.push(mapping);
    } else {
      groups.general.push(mapping);
    }
  });
  
  return groups;
};

/**
 * Get all unique field paths for interface generation
 */
export const getAllUniqueFieldPaths = async (): Promise<Set<string>> => {
  const mappings = await generateCompleteFieldMappings();
  const paths = new Set<string>();
  
  mappings.forEach(mapping => {
    // Extract the base path without array indices
    const basePath = mapping.uiPath.replace(/\[\d+\]/g, '[]');
    paths.add(basePath);
  });
  
  return paths;
};

/**
 * Validate that all fields are properly mapped
 */
export const validateFieldCoverage = async (): Promise<{
  total: number;
  mapped: number;
  unmapped: string[];
  coverage: number;
}> => {
  const mappings = await generateCompleteFieldMappings();
  const coverage = await validateCoverage(mappings.map(m => m.uiPath));
  
  return {
    total: coverage.total,
    mapped: coverage.implemented,
    unmapped: coverage.missingFields,
    coverage: coverage.coverage
  };
};
