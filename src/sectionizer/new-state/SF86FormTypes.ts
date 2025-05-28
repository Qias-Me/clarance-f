/**
 * SF-86 Form Type Definitions
 * 
 * Comprehensive TypeScript interfaces for the SF-86 form structure
 * designed for online form usage with hierarchical organization:
 * Section → Subsection → Entry → Fields
 * 
 * Based on analysis of actual SF-86 field data patterns and structures.
 */

/**
 * Enumeration for field types found in SF-86 forms
 */
export enum SF86FieldType {
  /** Text input field */
  TEXT = 'PDFTextField',
  /** Radio button group */
  RADIO_GROUP = 'PDFRadioGroup',
  /** Checkbox field */
  CHECKBOX = 'PDFCheckBox',
  /** Dropdown/select field */
  DROPDOWN = 'PDFDropdown',
  /** Date field */
  DATE = 'PDFDateField',
  /** Signature field */
  SIGNATURE = 'PDFSignature',
  /** Unknown or unspecified type */
  UNKNOWN = 'unknown'
}

/**
 * Enumeration for validation states
 */
export enum ValidationState {
  VALID = 'valid',
  INVALID = 'invalid',
  PENDING = 'pending',
  EMPTY = 'empty'
}

/**
 * Enumeration for confidence levels in field categorization
 */
export enum ConfidenceLevel {
  HIGH = 'high',     // >= 0.9
  MEDIUM = 'medium', // 0.7 - 0.89
  LOW = 'low'        // < 0.7
}

/**
 * Spatial coordinates for field positioning
 */
export interface FieldCoordinates {
  /** X position (left) */
  x: number;
  /** Y position (bottom) */
  y: number;
  /** Field width */
  width: number;
  /** Field height */
  height: number;
}

/**
 * Core field metadata extracted from PDF
 */
export interface SF86FieldMetadata {
  /** Unique identifier for the field (e.g., "17042 0 R") */
  id: string;
  
  /** Original field name from PDF (e.g., "form1[0].Section16_1[0].RadioButtonList[0]") */
  name: string;
  
  /** Current field value */
  value?: string | string[] | boolean | null;
  
  /** Page number where field appears */
  page: number;
  
  /** Human-readable label for the field */
  label?: string;
  
  /** Field type from PDF */
  type: SF86FieldType;
  
  /** Available options for dropdown/radio fields */
  options?: string[];
  
  /** Maximum length for text fields */
  maxLength?: number;
  
  /** Field position and dimensions */
  rect?: FieldCoordinates;
  
  /** Whether this field is required */
  required?: boolean;
  
  /** Field validation state */
  validationState?: ValidationState;
  
  /** Custom validation message */
  validationMessage?: string;
}

/**
 * Enhanced field with section categorization information
 */
export interface SF86CategorizedField extends SF86FieldMetadata {
  /** Section number (1-30) */
  section: number;
  
  /** Subsection identifier (A, B, C, 1, 2, 3, etc.) */
  subsection?: string;
  
  /** Entry number within subsection */
  entry?: number;
  
  /** Confidence score of categorization (0-1) */
  confidence: number;
  
  /** Confidence level category */
  confidenceLevel?: ConfidenceLevel;
  
  /** Unique identifier for hierarchical organization */
  uniqueId?: string;
  
  /** Whether field was moved by self-healing process */
  wasMovedByHealing?: boolean;
  
  /** Whether field was explicitly detected and protected */
  isExplicitlyDetected?: boolean;
  
  /** Reason for categorization (for debugging) */
  reason?: string;
}

/**
 * Form field for online form usage
 */
export interface SF86FormField extends SF86CategorizedField {
  /** Display name for the form */
  displayName?: string;
  
  /** Help text or description */
  helpText?: string;
  
  /** Field placeholder text */
  placeholder?: string;
  
  /** Whether field is disabled */
  disabled?: boolean;
  
  /** Whether field is visible */
  visible?: boolean;
  
  /** Field group or category for UI organization */
  fieldGroup?: string;
  
  /** Conditional logic - fields this depends on */
  dependsOn?: string[];
  
  /** Conditional logic - show when condition is met */
  showWhen?: {
    field: string;
    value: any;
    operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  };
}

/**
 * Entry within a subsection (for repeatable sections)
 */
export interface SF86Entry {
  /** Entry number/index */
  entryNumber: number;
  
  /** Entry display name */
  displayName?: string;
  
  /** Fields in this entry */
  fields: SF86FormField[];
  
  /** Whether this entry is complete */
  isComplete?: boolean;
  
  /** Whether this entry can be deleted */
  isDeletable?: boolean;
  
  /** Entry validation state */
  validationState?: ValidationState;
  
  /** Entry-level validation messages */
  validationMessages?: string[];
}

/**
 * Subsection within a section
 */
export interface SF86Subsection {
  /** Subsection identifier (A, B, C, 1, 2, 3, etc.) */
  subsectionId: string;
  
  /** Subsection display name */
  displayName: string;
  
  /** Subsection description */
  description?: string;
  
  /** Whether this subsection supports multiple entries */
  isRepeatable: boolean;
  
  /** Maximum number of entries allowed */
  maxEntries?: number;
  
  /** Minimum number of entries required */
  minEntries?: number;
  
  /** Entries in this subsection */
  entries: SF86Entry[];
  
  /** Fields that don't belong to specific entries */
  standaloneFields?: SF86FormField[];
  
  /** Subsection validation state */
  validationState?: ValidationState;
  
  /** Subsection-level validation messages */
  validationMessages?: string[];
}

/**
 * Complete SF-86 section
 */
export interface SF86Section {
  /** Section number (1-30) */
  sectionId: number;
  
  /** Section display name */
  sectionName: string;
  
  /** Section description */
  description?: string;
  
  /** Whether this section has subsections */
  hasSubsections: boolean;
  
  /** Whether this section supports multiple entries */
  isRepeatable: boolean;
  
  /** Page range where section appears */
  pageRange?: [number, number];
  
  /** Subsections within this section */
  subsections: Record<string, SF86Subsection>;
  
  /** Fields that don't belong to specific subsections */
  standaloneFields?: SF86FormField[];
  
  /** Section completion percentage (0-100) */
  completionPercentage?: number;
  
  /** Section validation state */
  validationState?: ValidationState;
  
  /** Section-level validation messages */
  validationMessages?: string[];
  
  /** Whether section is required */
  required?: boolean;
  
  /** Whether section is currently visible/accessible */
  visible?: boolean;
}

/**
 * Complete SF-86 form structure
 */
export interface SF86Form {
  /** Form metadata */
  metadata: {
    /** Form version */
    version: string;
    
    /** Form creation date */
    createdDate: string;
    
    /** Last modified date */
    lastModified: string;
    
    /** Total number of fields */
    totalFields: number;
    
    /** Form completion percentage */
    completionPercentage: number;
    
    /** Form validation state */
    validationState: ValidationState;
  };
  
  /** All sections in the form */
  sections: Record<number, SF86Section>;
  
  /** Form-level validation messages */
  validationMessages?: string[];
  
  /** Form submission state */
  submissionState?: 'draft' | 'submitted' | 'approved' | 'rejected';
  
  /** Form navigation state */
  navigation?: {
    currentSection: number;
    completedSections: number[];
    availableSections: number[];
  };
}
