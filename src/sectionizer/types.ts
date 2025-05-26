/**
 * SF-86 Sectionizer - Core Types and Interfaces
 * 
 * This file defines the core data types and interfaces used throughout the application.
 * It centralizes all type definitions to ensure consistency and maintainability.
 */

/**
 * Field metadata extracted from the PDF
 */
export interface FieldMetadata {
  /** Unique identifier for the field */
  id: string;
  
  /** Name of the field in the PDF */
  name: string;
  
  /** Current value of the field */
  value: string | string[] | boolean;
  
  /** Page number where the field appears */
  page: number;
  
  /** Human-readable label for the field (if available) */
  label?: string;
  
  /** Field type (text, checkbox, dropdown, etc.) */
  type?: string;
  
  /** Maximum length for text fields */
  maxLength?: number;
  
  /** Available options for dropdown/radio fields */
  options?: string[];
  
}

/**
 * Enhanced field with section information
 */
export interface EnhancedField extends FieldMetadata {
  /** Section number (1-30) or section name */
  section?: string | number;
  
  /** Subsection identifier (e.g., "A", "B", "C") */
  subsection?: string;
  
  /** Entry index within subsection */
  entryIndex?: number;
  
  /** Confidence score of categorization (0-1) */
  confidence?: number;
}

/**
 * Rule matching interface for section categorization
 */
export interface MatchRule {
  /** Regular expression pattern to match field names */
  pattern: RegExp;

  /** Section number (1-30) */
  section: number;
  
  /** Subsection identifier (e.g., "A", "B", "C") */
  subsection?: string;
  
  /** Function to extract entry index from regex match */
  entryIndex?: (m: RegExpMatchArray) => number;
  
  /** Confidence score for matches (0-1) */
  confidence?: number;
  
  /** Description of what the rule is matching */
  description?: string;
}

/**
 * Metadata for a section
 */
export interface SectionMeta {
  /** Whether the section has subsections */
  hasSubSections: boolean;
  
  /** Overall confidence score for the section categorization */
  confidence: number;
  
  /** Total number of fields in the section */
  totalFields: number;
  
  /** Number of fields matched by rules */
  matchedFields: number;
  
  /** Count of fields by subsection */
  fieldsBySubsection?: Record<string, number>;
  
  /** Page range for the section [start, end] */
  pageRange?: [number, number];
  
  /** Section name */
  name?: string;
  
  /** Section description */
  description?: string;
}

/**
 * Output structure for each section
 */
export interface SectionOutput {
  /** Section metadata */
  meta: SectionMeta;
  
  /** Fields grouped by subsection */
  fields: Record<string, EnhancedField[]>;
}

/**
 * Unknown fields that couldn't be categorized
 */
export interface UnknownFields {
  /** Array of uncategorized fields */
  fields: EnhancedField[];
  
  /** Timestamp when the unknown fields were collected */
  timestamp: string;
  
  /** Iteration number in the self-healing process */
  iteration: number;
  
  /** Rules that were tried but failed to match */
  attempted_rules?: string[];
  
  /** AI-suggested patterns for matching these fields */
  suggested_patterns?: string[];
}

/**
 * Configuration options for the sectionizer
 */
export interface SectionizerConfig {
  /** Maximum number of self-healing iterations */
  maxIterations: number;
  
  /** Minimum confidence to accept a match */
  confidenceThreshold: number;
  
  /** Whether to keep history of unknown fields */
  keepUnknownHistory: boolean;
  
  /** Directory for output files */
  outputDir: string;
  
  /** Path for the sectionizer report */
  reportPath: string;
  
  /** Directory containing rule files */
  rulesDir: string;
}

/**
 * Overall results of the sectionizer process
 */
export interface SectionizerResults {
  /** Total fields processed */
  totalFields: number;
  
  /** Fields successfully categorized */
  categorizedFields: number;
  
  /** Fields that couldn't be categorized */
  uncategorizedFields: number;
  
  /** Number of self-healing iterations run */
  iterations: number;
  
  /** Section metadata by section number */
  sections: Record<number, SectionMeta>;
  
  /** Processing time in milliseconds */
  completionTime: number;
  
  /** Percentage of fields successfully categorized */
  successRate: number;
}

/**
 * PDF field from existing extractFieldsBySection.ts
 * @deprecated Use FieldMetadata instead
 */
export interface PDFField extends FieldMetadata {}

/**
 * Categorized field from existing extractFieldsBySection.ts 
 * @deprecated Use EnhancedField instead
 */
export interface CategorizedField extends PDFField {
  section: number;
  subsection?: string;
  entry?: number;
  confidence: number;
}

/**
 * Result of categorization operation
 */
export interface CategorizationResult {
  /** Section number (1-30) */
  section: number;
  
  /** Subsection identifier (e.g., "A", "B", "C") */
  subsection?: string;
  
  /** Entry index within subsection */
  entry?: number;
  
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Individual category rule with pattern information
 */
export interface CategoryRule {
  /** Section number (1-30) */
  section: number;
  
  /** Subsection identifier (optional) */
  subsection?: string;
  
  /** Pattern string (converted to RegExp) */
  pattern: string;
  
  /** Confidence score for matches (0-1) */
  confidence: number;
  
  /** Description of what the rule is matching */
  description?: string;
  
  /** Pattern for extracting entry index */
  entryPattern?: string;
}

/**
 * Collection of rules for a specific section
 */
export interface SectionRules {
  /** Section number (1-30) */
  section: number;
  
  /** Section name */
  name: string;
  
  /** Array of rules for this section */
  rules: CategoryRule[];
} 