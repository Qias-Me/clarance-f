/**
 * FieldMappingFactory
 * Centralized field mapping system for UI to PDF field conversions
 * Eliminates error-prone manual mapping and provides type safety
 */

import { produce } from 'immer';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface FieldMapping {
  uiPath: string;
  pdfField: string;
  validation?: string[];
  transformer?: FieldTransformer;
  metadata?: Record<string, unknown>;
}

export interface FieldTransformer {
  toPdf: (value: any) => any;
  fromPdf: (value: any) => any;
}

export interface FieldSchema<T = any> {
  [key: string]: {
    pdfPattern?: string;
    pdfField?: string;
    validation?: string[];
    transformer?: FieldTransformer;
    required?: boolean;
    maxLength?: number;
    type?: 'text' | 'date' | 'number' | 'boolean' | 'select' | 'array';
    metadata?: Record<string, unknown>;
  };
}

export interface MappingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  coverage: {
    mapped: number;
    unmapped: number;
    total: number;
  };
}

// ============================================================================
// FIELD TRANSFORMERS
// ============================================================================

export const CommonTransformers = {
  date: {
    toPdf: (value: string) => {
      if (!value) return '';
      const date = new Date(value);
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
    },
    fromPdf: (value: string) => {
      if (!value) return '';
      const [month, day, year] = value.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  },
  
  boolean: {
    toPdf: (value: boolean) => value ? 'Yes' : 'No',
    fromPdf: (value: string) => value === 'Yes' || value === 'true' || value === '1'
  },
  
  ssn: {
    toPdf: (value: string) => value.replace(/-/g, ''),
    fromPdf: (value: string) => {
      if (!value || value.length !== 9) return value;
      return `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5)}`;
    }
  },
  
  phone: {
    toPdf: (value: string) => value.replace(/[^0-9]/g, ''),
    fromPdf: (value: string) => {
      if (!value || value.length !== 10) return value;
      return `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`;
    }
  },
  
  uppercase: {
    toPdf: (value: string) => value?.toUpperCase() || '',
    fromPdf: (value: string) => value
  },
  
  trim: {
    toPdf: (value: string) => value?.trim() || '',
    fromPdf: (value: string) => value?.trim() || ''
  }
} as const;

// ============================================================================
// FIELD MAPPING SERVICE
// ============================================================================

export class FieldMappingService<T = any> {
  private mappings: Map<string, FieldMapping>;
  private reverseMappings: Map<string, string>;
  private validationCache: Map<string, any>;
  
  constructor(mappings: FieldMapping[]) {
    this.mappings = new Map(mappings.map(m => [m.uiPath, m]));
    this.reverseMappings = new Map(mappings.map(m => [m.pdfField, m.uiPath]));
    this.validationCache = new Map();
  }
  
  /**
   * Get PDF field name for a UI field path
   */
  getPdfField(uiPath: string): string | undefined {
    const mapping = this.mappings.get(uiPath);
    return mapping?.pdfField;
  }
  
  /**
   * Get UI field path for a PDF field name
   */
  getUiPath(pdfField: string): string | undefined {
    return this.reverseMappings.get(pdfField);
  }
  
  /**
   * Transform UI value to PDF format
   */
  transformToPdf(uiPath: string, value: any): any {
    const mapping = this.mappings.get(uiPath);
    if (!mapping?.transformer) return value;
    return mapping.transformer.toPdf(value);
  }
  
  /**
   * Transform PDF value to UI format
   */
  transformFromPdf(pdfField: string, value: any): any {
    const uiPath = this.reverseMappings.get(pdfField);
    if (!uiPath) return value;
    
    const mapping = this.mappings.get(uiPath);
    if (!mapping?.transformer) return value;
    return mapping.transformer.fromPdf(value);
  }
  
  /**
   * Validate field value
   */
  validateField(uiPath: string, value: any): string[] {
    const mapping = this.mappings.get(uiPath);
    if (!mapping?.validation) return [];
    
    const errors: string[] = [];
    
    for (const rule of mapping.validation) {
      if (rule === 'required' && !value) {
        errors.push(`${uiPath} is required`);
      } else if (rule.startsWith('maxLength:')) {
        const maxLength = parseInt(rule.split(':')[1]);
        if (value?.length > maxLength) {
          errors.push(`${uiPath} exceeds maximum length of ${maxLength}`);
        }
      } else if (rule === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          errors.push(`${uiPath} must be a valid email`);
        }
      } else if (rule === 'date') {
        if (value && isNaN(Date.parse(value))) {
          errors.push(`${uiPath} must be a valid date`);
        }
      }
    }
    
    return errors;
  }
  
  /**
   * Batch transform UI data to PDF format
   */
  transformDataToPdf(uiData: T): Record<string, any> {
    const pdfData: Record<string, any> = {};
    
    for (const [uiPath, mapping] of this.mappings) {
      const value = this.getNestedValue(uiData, uiPath);
      const transformedValue = mapping.transformer 
        ? mapping.transformer.toPdf(value)
        : value;
      
      if (transformedValue !== undefined) {
        pdfData[mapping.pdfField] = transformedValue;
      }
    }
    
    return pdfData;
  }
  
  /**
   * Batch transform PDF data to UI format
   */
  transformDataFromPdf(pdfData: Record<string, any>): Partial<T> {
    const uiData: any = {};
    
    for (const [pdfField, value] of Object.entries(pdfData)) {
      const uiPath = this.reverseMappings.get(pdfField);
      if (!uiPath) continue;
      
      const mapping = this.mappings.get(uiPath);
      const transformedValue = mapping?.transformer 
        ? mapping.transformer.fromPdf(value)
        : value;
      
      this.setNestedValue(uiData, uiPath, transformedValue);
    }
    
    return uiData;
  }
  
  /**
   * Get all mappings
   */
  getAllMappings(): FieldMapping[] {
    return Array.from(this.mappings.values());
  }
  
  /**
   * Validate all mappings
   */
  validateMappings(): MappingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for duplicate PDF fields
    const pdfFields = new Map<string, string[]>();
    for (const mapping of this.mappings.values()) {
      if (!pdfFields.has(mapping.pdfField)) {
        pdfFields.set(mapping.pdfField, []);
      }
      pdfFields.get(mapping.pdfField)!.push(mapping.uiPath);
    }
    
    for (const [pdfField, uiPaths] of pdfFields) {
      if (uiPaths.length > 1) {
        warnings.push(`PDF field "${pdfField}" is mapped to multiple UI paths: ${uiPaths.join(', ')}`);
      }
    }
    
    // Check for missing required fields
    for (const mapping of this.mappings.values()) {
      if (!mapping.pdfField) {
        errors.push(`UI path "${mapping.uiPath}" has no PDF field mapping`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      coverage: {
        mapped: this.mappings.size,
        unmapped: 0, // Would need PDF schema to calculate
        total: this.mappings.size
      }
    };
  }
  
  // Utility methods
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (key.includes('*')) {
        // Handle array wildcards
        const [arrayKey, ...rest] = key.split('*');
        if (!Array.isArray(current[arrayKey])) return undefined;
        
        return current[arrayKey].map((item: any) => {
          return this.getNestedValue(item, rest.join('*').slice(1));
        });
      }
      
      if (current == null || typeof current !== 'object') {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }
  
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }
}

// ============================================================================
// FIELD MAPPING FACTORY
// ============================================================================

export class FieldMappingFactory {
  private static cache = new Map<string, FieldMappingService>();
  
  /**
   * Create a field mapping service for a section
   */
  static createMapping<T = any>(
    sectionName: string,
    schema: FieldSchema<T>
  ): FieldMappingService<T> {
    const cacheKey = `${sectionName}-${JSON.stringify(schema)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const mappings = this.generateMappings(schema);
    const service = new FieldMappingService<T>(mappings);
    
    this.cache.set(cacheKey, service);
    
    return service;
  }
  
  /**
   * Generate mappings from schema
   */
  private static generateMappings<T>(schema: FieldSchema<T>): FieldMapping[] {
    const mappings: FieldMapping[] = [];
    
    for (const [uiPath, config] of Object.entries(schema)) {
      const pdfField = config.pdfField || this.derivePdfField(uiPath, config.pdfPattern);
      
      mappings.push({
        uiPath,
        pdfField,
        validation: this.buildValidation(config),
        transformer: config.transformer || this.getDefaultTransformer(config.type),
        metadata: config.metadata
      });
    }
    
    return mappings;
  }
  
  /**
   * Derive PDF field name from UI path and pattern
   */
  private static derivePdfField(uiPath: string, pattern?: string): string {
    if (pattern) {
      // Handle patterns with placeholders
      return pattern.replace(/{(\w+)}/g, (match, key) => {
        if (key === 'index') {
          // Extract index from path if available
          const indexMatch = uiPath.match(/\[(\d+)\]/);
          return indexMatch ? indexMatch[1] : '0';
        }
        return key;
      });
    }
    
    // Default derivation: convert camelCase to PDF field format
    return uiPath
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('_')
      .replace(/([A-Z])/g, '_$1')
      .replace(/^_/, '')
      .toUpperCase();
  }
  
  /**
   * Build validation rules from config
   */
  private static buildValidation(config: any): string[] {
    const validation: string[] = [];
    
    if (config.required) validation.push('required');
    if (config.maxLength) validation.push(`maxLength:${config.maxLength}`);
    if (config.type === 'date') validation.push('date');
    if (config.validation) validation.push(...config.validation);
    
    return validation;
  }
  
  /**
   * Get default transformer for field type
   */
  private static getDefaultTransformer(type?: string): FieldTransformer | undefined {
    switch (type) {
      case 'date':
        return CommonTransformers.date;
      case 'boolean':
        return CommonTransformers.boolean;
      default:
        return CommonTransformers.trim;
    }
  }
  
  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache size
   */
  static getCacheSize(): number {
    return this.cache.size;
  }
}

// ============================================================================
// SECTION-SPECIFIC SCHEMAS
// ============================================================================

export const Section1Schema: FieldSchema = {
  'section1.lastName': {
    pdfField: 'form1[0].Sections1-6[0].TextField11[0]',
    validation: ['required', 'maxLength:100'],
    transformer: CommonTransformers.uppercase
  },
  'section1.firstName': {
    pdfField: 'form1[0].Sections1-6[0].TextField12[0]',
    validation: ['required', 'maxLength:100'],
    transformer: CommonTransformers.uppercase
  },
  'section1.middleName': {
    pdfField: 'form1[0].Sections1-6[0].TextField13[0]',
    validation: ['maxLength:100'],
    transformer: CommonTransformers.uppercase
  },
  'section1.suffix': {
    pdfField: 'form1[0].Sections1-6[0].TextField14[0]',
    validation: ['maxLength:10']
  },
  'section1.dateOfBirth': {
    pdfField: 'form1[0].Sections1-6[0].DateField1[0]',
    validation: ['required', 'date'],
    type: 'date',
    transformer: CommonTransformers.date
  },
  'section1.ssn': {
    pdfField: 'form1[0].Sections1-6[0].TextField15[0]',
    validation: ['required'],
    transformer: CommonTransformers.ssn
  }
};

export const Section13Schema: FieldSchema = {
  'employment.*.companyName': {
    pdfPattern: 'form1[0].Section13[0].Company_{index}[0]',
    validation: ['required', 'maxLength:100']
  },
  'employment.*.startDate': {
    pdfPattern: 'form1[0].Section13[0].StartDate_{index}[0]',
    validation: ['required', 'date'],
    type: 'date',
    transformer: CommonTransformers.date
  },
  'employment.*.endDate': {
    pdfPattern: 'form1[0].Section13[0].EndDate_{index}[0]',
    validation: ['date'],
    type: 'date',
    transformer: CommonTransformers.date
  },
  'employment.*.currentlyEmployed': {
    pdfPattern: 'form1[0].Section13[0].Current_{index}[0]',
    type: 'boolean',
    transformer: CommonTransformers.boolean
  }
};