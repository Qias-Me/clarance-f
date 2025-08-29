/**
 * Section Field Mapping Utilities
 * 
 * Standardized field mapping system for SF-86 sections
 */

import type { Field } from '../interfaces/section-interfaces/base';
import { logger } from '../services/Logger';

export interface FieldMapping {
  uiPath: string;
  pdfFieldId: string;
  transform?: (value: any) => any;
  validator?: (value: any) => boolean;
  required?: boolean;
  defaultValue?: any;
}

export interface SectionFieldMapping {
  sectionNumber: number;
  sectionName: string;
  version: string;
  fields: FieldMapping[];
  subsections?: Record<string, FieldMapping[]>;
}

/**
 * Field mapping registry for all sections
 */
export class FieldMappingRegistry {
  private static instance: FieldMappingRegistry;
  private mappings = new Map<number, SectionFieldMapping>();
  private pdfFieldIndex = new Map<string, FieldMapping>();
  
  private constructor() {}
  
  static getInstance(): FieldMappingRegistry {
    if (!FieldMappingRegistry.instance) {
      FieldMappingRegistry.instance = new FieldMappingRegistry();
    }
    return FieldMappingRegistry.instance;
  }
  
  /**
   * Register field mappings for a section
   */
  register(mapping: SectionFieldMapping): void {
    this.mappings.set(mapping.sectionNumber, mapping);
    
    // Index PDF fields for quick lookup
    mapping.fields.forEach(field => {
      this.pdfFieldIndex.set(field.pdfFieldId, field);
    });
    
    // Index subsection fields
    if (mapping.subsections) {
      Object.values(mapping.subsections).forEach(subsectionFields => {
        subsectionFields.forEach(field => {
          this.pdfFieldIndex.set(field.pdfFieldId, field);
        });
      });
    }
    
    logger.info(`Registered field mappings for section ${mapping.sectionNumber}`, 'FieldMappingRegistry', {
      fieldCount: mapping.fields.length,
      subsectionCount: Object.keys(mapping.subsections || {}).length
    });
  }
  
  /**
   * Get field mappings for a section
   */
  getSection(sectionNumber: number): SectionFieldMapping | undefined {
    return this.mappings.get(sectionNumber);
  }
  
  /**
   * Get field mapping by PDF field ID
   */
  getByPdfField(pdfFieldId: string): FieldMapping | undefined {
    return this.pdfFieldIndex.get(pdfFieldId);
  }
  
  /**
   * Get all registered sections
   */
  getAllSections(): SectionFieldMapping[] {
    return Array.from(this.mappings.values());
  }
  
  /**
   * Validate field value against mapping rules
   */
  validateField(pdfFieldId: string, value: any): boolean {
    const mapping = this.pdfFieldIndex.get(pdfFieldId);
    if (!mapping) return true;
    
    if (mapping.required && !value) {
      return false;
    }
    
    if (mapping.validator) {
      return mapping.validator(value);
    }
    
    return true;
  }
  
  /**
   * Transform field value according to mapping rules
   */
  transformField(pdfFieldId: string, value: any): any {
    const mapping = this.pdfFieldIndex.get(pdfFieldId);
    if (!mapping) return value;
    
    if (mapping.transform) {
      return mapping.transform(value);
    }
    
    return value;
  }
  
  /**
   * Get statistics about field mappings
   */
  getStatistics(): {
    totalSections: number;
    totalFields: number;
    totalPdfFields: number;
    mappedSections: number[];
    unmappedSections: number[];
  } {
    const mappedSections = Array.from(this.mappings.keys());
    const allSections = Array.from({ length: 30 }, (_, i) => i + 1);
    const unmappedSections = allSections.filter(s => !mappedSections.includes(s));
    
    let totalFields = 0;
    this.mappings.forEach(mapping => {
      totalFields += mapping.fields.length;
      if (mapping.subsections) {
        Object.values(mapping.subsections).forEach(fields => {
          totalFields += fields.length;
        });
      }
    });
    
    return {
      totalSections: this.mappings.size,
      totalFields,
      totalPdfFields: this.pdfFieldIndex.size,
      mappedSections,
      unmappedSections
    };
  }
}

/**
 * Field mapping builder for creating mappings fluently
 */
export class FieldMappingBuilder {
  private mapping: SectionFieldMapping;
  
  constructor(sectionNumber: number, sectionName: string, version = '1.0.0') {
    this.mapping = {
      sectionNumber,
      sectionName,
      version,
      fields: [],
      subsections: {}
    };
  }
  
  /**
   * Add a field mapping
   */
  addField(
    uiPath: string,
    pdfFieldId: string,
    options?: Partial<FieldMapping>
  ): this {
    this.mapping.fields.push({
      uiPath,
      pdfFieldId,
      ...options
    });
    return this;
  }
  
  /**
   * Add multiple field mappings
   */
  addFields(fields: FieldMapping[]): this {
    this.mapping.fields.push(...fields);
    return this;
  }
  
  /**
   * Add a subsection with field mappings
   */
  addSubsection(name: string, fields: FieldMapping[]): this {
    if (!this.mapping.subsections) {
      this.mapping.subsections = {};
    }
    this.mapping.subsections[name] = fields;
    return this;
  }
  
  /**
   * Build and register the mapping
   */
  build(): SectionFieldMapping {
    const registry = FieldMappingRegistry.getInstance();
    registry.register(this.mapping);
    return this.mapping;
  }
}

/**
 * Common field transformers
 */
export const FieldTransformers = {
  /**
   * Format date to MM/DD/YYYY
   */
  dateToMMDDYYYY: (value: string | Date): string => {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  },
  
  /**
   * Format phone number
   */
  phoneNumber: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 10) return value;
    
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  },
  
  /**
   * Format SSN
   */
  ssn: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 9) return value;
    
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  },
  
  /**
   * Boolean to Yes/No
   */
  booleanToYesNo: (value: boolean): string => {
    return value ? 'Yes' : 'No';
  },
  
  /**
   * Currency formatter
   */
  currency: (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  },
  
  /**
   * Uppercase transformer
   */
  uppercase: (value: string): string => {
    return value.toUpperCase();
  },
  
  /**
   * Lowercase transformer
   */
  lowercase: (value: string): string => {
    return value.toLowerCase();
  },
  
  /**
   * Title case transformer
   */
  titleCase: (value: string): string => {
    return value.replace(/\w\S*/g, txt => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
};

/**
 * Common field validators
 */
export const FieldValidators = {
  /**
   * Required field validator
   */
  required: (value: any): boolean => {
    return value !== null && value !== undefined && value !== '';
  },
  
  /**
   * Email validator
   */
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  /**
   * Phone number validator
   */
  phoneNumber: (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 10;
  },
  
  /**
   * SSN validator
   */
  ssn: (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 9 && !['000', '666', '900', '999'].includes(cleaned.slice(0, 3));
  },
  
  /**
   * Date validator
   */
  date: (value: string | Date): boolean => {
    const date = value instanceof Date ? value : new Date(value);
    return !isNaN(date.getTime());
  },
  
  /**
   * Past date validator
   */
  pastDate: (value: string | Date): boolean => {
    const date = value instanceof Date ? value : new Date(value);
    return !isNaN(date.getTime()) && date < new Date();
  },
  
  /**
   * Future date validator
   */
  futureDate: (value: string | Date): boolean => {
    const date = value instanceof Date ? value : new Date(value);
    return !isNaN(date.getTime()) && date > new Date();
  },
  
  /**
   * Minimum length validator
   */
  minLength: (min: number) => (value: string): boolean => {
    return value.length >= min;
  },
  
  /**
   * Maximum length validator
   */
  maxLength: (max: number) => (value: string): boolean => {
    return value.length <= max;
  },
  
  /**
   * Range validator
   */
  range: (min: number, max: number) => (value: number): boolean => {
    return value >= min && value <= max;
  }
};

/**
 * Create field mapping from UI field definition
 */
export function createFieldMapping(
  field: Field<any>,
  pdfFieldId: string,
  options?: Partial<FieldMapping>
): FieldMapping {
  return {
    uiPath: field.id,
    pdfFieldId,
    required: field.required,
    defaultValue: field.value,
    ...options
  };
}

/**
 * Batch create field mappings
 */
export function createFieldMappings(
  fields: Field<any>[],
  pdfFieldPrefix: string,
  options?: Partial<FieldMapping>
): FieldMapping[] {
  return fields.map((field, index) => 
    createFieldMapping(
      field,
      `${pdfFieldPrefix}_${index + 1}`,
      options
    )
  );
}

/**
 * Map UI data to PDF fields
 */
export function mapToPdfFields(
  sectionNumber: number,
  uiData: Record<string, any>
): Record<string, any> {
  const registry = FieldMappingRegistry.getInstance();
  const sectionMapping = registry.getSection(sectionNumber);
  
  if (!sectionMapping) {
    logger.warn(`No field mapping found for section ${sectionNumber}`, 'mapToPdfFields');
    return {};
  }
  
  const pdfData: Record<string, any> = {};
  
  // Map main fields
  sectionMapping.fields.forEach(mapping => {
    const value = uiData[mapping.uiPath];
    if (value !== undefined) {
      pdfData[mapping.pdfFieldId] = mapping.transform 
        ? mapping.transform(value)
        : value;
    } else if (mapping.defaultValue !== undefined) {
      pdfData[mapping.pdfFieldId] = mapping.defaultValue;
    }
  });
  
  // Map subsection fields
  if (sectionMapping.subsections) {
    Object.entries(sectionMapping.subsections).forEach(([subsectionName, fields]) => {
      const subsectionData = uiData[subsectionName];
      if (subsectionData) {
        fields.forEach(mapping => {
          const value = subsectionData[mapping.uiPath];
          if (value !== undefined) {
            pdfData[mapping.pdfFieldId] = mapping.transform
              ? mapping.transform(value)
              : value;
          } else if (mapping.defaultValue !== undefined) {
            pdfData[mapping.pdfFieldId] = mapping.defaultValue;
          }
        });
      }
    });
  }
  
  return pdfData;
}

/**
 * Validate section data against field mappings
 */
export function validateSectionData(
  sectionNumber: number,
  uiData: Record<string, any>
): {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
} {
  const registry = FieldMappingRegistry.getInstance();
  const sectionMapping = registry.getSection(sectionNumber);
  
  if (!sectionMapping) {
    return { isValid: true, errors: [] };
  }
  
  const errors: Array<{ field: string; message: string }> = [];
  
  sectionMapping.fields.forEach(mapping => {
    const value = uiData[mapping.uiPath];
    
    if (mapping.required && !value) {
      errors.push({
        field: mapping.uiPath,
        message: `${mapping.uiPath} is required`
      });
    }
    
    if (mapping.validator && value !== undefined && !mapping.validator(value)) {
      errors.push({
        field: mapping.uiPath,
        message: `${mapping.uiPath} is invalid`
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}