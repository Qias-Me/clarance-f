/**
 * Base Section Configuration
 * 
 * Scalable configuration system for all SF-86 sections (1-30)
 * Provides consistent structure while allowing section-specific customization
 * 
 * @module config/section-base
 */

/**
 * Base configuration interface that all sections must implement
 */
export interface SectionConfig {
  // Section metadata
  metadata: {
    id: number;
    name: string;
    fullName?: string;
    description: string;
    totalFields: number;
    subsectionCount?: number;
    entryCount?: number;
    pageRange: number[];
    hasMultipleEntries?: boolean;
    maxEntries?: number;
  };

  // Field configuration
  fields: {
    ids: Record<string, string>;
    names: Record<string, string>;
    mappings: Record<string, string>;
  };

  // Validation configuration
  validation: {
    rules: Record<string, any>;
    messages: {
      required: Record<string, string>;
      invalid: Record<string, string>;
      warnings: Record<string, string>;
    };
    confidence?: {
      high: number;
      medium: number;
      low: number;
      warningThreshold: number;
    };
  };

  // Component configuration
  component?: {
    displaySettings?: Record<string, any>;
    maxInputLength?: Record<string, number>;
    placeholders?: Record<string, string>;
    tooltips?: Record<string, string>;
    helpText?: Record<string, string>;
  };

  // Feature flags
  features?: {
    showFieldMappingInfo?: boolean;
    enableEnhancedPdfGeneration?: boolean;
    enableAutoSave?: boolean;
    enableValidationOnBlur?: boolean;
    enableProgressTracking?: boolean;
  };
}

/**
 * Base validation rules that apply to all sections
 */
export const BASE_VALIDATION_RULES = {
  maxTextLength: 1000,
  maxNameLength: 50,
  maxAddressLength: 100,
  maxPhoneLength: 20,
  maxEmailLength: 100,
  dateFormat: 'MM/DD/YYYY',
  phoneFormat: /^\d{3}-\d{3}-\d{4}$/,
  emailFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  alphanumericOnly: /^[a-zA-Z0-9\s]*$/,
  lettersOnly: /^[a-zA-Z\s]*$/,
  numbersOnly: /^\d*$/
} as const;

/**
 * Common field confidence thresholds
 */
export const FIELD_CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.5,
  LOW: 0.3,
  WARNING: 0.5
} as const;

/**
 * Common error message templates
 */
export const ERROR_MESSAGE_TEMPLATES = {
  required: (fieldName: string) => `${fieldName} is required`,
  invalid: (fieldName: string) => `${fieldName} contains invalid characters`,
  tooLong: (fieldName: string, maxLength: number) => 
    `${fieldName} exceeds maximum length of ${maxLength} characters`,
  tooShort: (fieldName: string, minLength: number) => 
    `${fieldName} must be at least ${minLength} characters`,
  invalidFormat: (fieldName: string, format: string) => 
    `${fieldName} must be in ${format} format`,
  dateInFuture: (fieldName: string) => `${fieldName} cannot be in the future`,
  dateInPast: (fieldName: string) => `${fieldName} cannot be in the past`,
  invalidRange: (fieldName: string, min: any, max: any) => 
    `${fieldName} must be between ${min} and ${max}`
} as const;

/**
 * Section categories for grouping related sections
 */
export enum SectionCategory {
  PERSONAL = 'Personal Information',
  CITIZENSHIP = 'Citizenship',
  RESIDENCE = 'Residence History',
  EMPLOYMENT = 'Employment',
  EDUCATION = 'Education',
  MILITARY = 'Military',
  FOREIGN = 'Foreign Activities',
  SECURITY = 'Security',
  LEGAL = 'Legal History',
  FINANCIAL = 'Financial',
  SUBSTANCE = 'Substance Use',
  MENTAL = 'Mental Health',
  TECHNOLOGY = 'Technology',
  ASSOCIATIONS = 'Associations',
  REFERENCES = 'References'
}

/**
 * Map sections to their categories
 */
export const SECTION_CATEGORIES: Record<number, SectionCategory> = {
  1: SectionCategory.PERSONAL,
  2: SectionCategory.CITIZENSHIP,
  3: SectionCategory.RESIDENCE,
  4: SectionCategory.PERSONAL,
  5: SectionCategory.RESIDENCE,
  6: SectionCategory.REFERENCES,
  7: SectionCategory.PERSONAL,
  8: SectionCategory.CITIZENSHIP,
  9: SectionCategory.EDUCATION,
  10: SectionCategory.RESIDENCE,
  11: SectionCategory.EMPLOYMENT,
  12: SectionCategory.FOREIGN,
  13: SectionCategory.EMPLOYMENT,
  14: SectionCategory.SECURITY,
  15: SectionCategory.MILITARY,
  16: SectionCategory.FOREIGN,
  17: SectionCategory.PERSONAL,
  18: SectionCategory.FOREIGN,
  19: SectionCategory.FOREIGN,
  20: SectionCategory.FOREIGN,
  21: SectionCategory.MENTAL,
  22: SectionCategory.LEGAL,
  23: SectionCategory.SUBSTANCE,
  24: SectionCategory.SUBSTANCE,
  25: SectionCategory.LEGAL,
  26: SectionCategory.FINANCIAL,
  27: SectionCategory.TECHNOLOGY,
  28: SectionCategory.LEGAL,
  29: SectionCategory.ASSOCIATIONS,
  30: SectionCategory.REFERENCES
} as const;

/**
 * Base class for section configuration
 */
export abstract class BaseSectionConfig implements SectionConfig {
  abstract metadata: SectionConfig['metadata'];
  abstract fields: SectionConfig['fields'];
  abstract validation: SectionConfig['validation'];
  
  component: SectionConfig['component'] = {
    displaySettings: {},
    maxInputLength: {},
    placeholders: {},
    tooltips: {},
    helpText: {}
  };

  features: SectionConfig['features'] = {
    showFieldMappingInfo: false,
    enableEnhancedPdfGeneration: true,
    enableAutoSave: true,
    enableValidationOnBlur: true,
    enableProgressTracking: true
  };

  /**
   * Get the section category
   */
  getCategory(): SectionCategory {
    return SECTION_CATEGORIES[this.metadata.id] || SectionCategory.PERSONAL;
  }

  /**
   * Check if section has multiple entries
   */
  hasMultipleEntries(): boolean {
    return this.metadata.hasMultipleEntries || false;
  }

  /**
   * Get maximum number of entries allowed
   */
  getMaxEntries(): number {
    return this.metadata.maxEntries || 1;
  }

  /**
   * Generate error message from template
   */
  generateErrorMessage(template: keyof typeof ERROR_MESSAGE_TEMPLATES, ...args: any[]): string {
    const templateFunc = ERROR_MESSAGE_TEMPLATES[template];
    return typeof templateFunc === 'function' ? templateFunc(...args) : templateFunc;
  }

  /**
   * Validate field confidence
   */
  isFieldConfidenceAcceptable(confidence: number): boolean {
    const threshold = this.validation.confidence?.warningThreshold || FIELD_CONFIDENCE_THRESHOLDS.WARNING;
    return confidence >= threshold;
  }
}