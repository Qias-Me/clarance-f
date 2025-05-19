/**
 * Represents the field metadata structure extracted from field-hierarchy.json
 * Each field in the form has specific metadata including ID, label, value, type, and section information
 */

/**
 * Enum representing common field types found in the form
 */
export enum FieldType {
  TEXT = "PDFTextField",
  CHECKBOX = "PDFCheckBox",
  RADIO = "PDFRadioButton",
  DROPDOWN = "PDFDropDown",
  DATE = "PDFDateField",
  SIGNATURE = "PDFSignatureField",
  // Add other field types as needed
}

/**
 * Flexible field value type to support different data types
 */
export type FieldValue = string | number | boolean | Date | string[] | null;

/**
 * Represents the field metadata structure extracted from field-hierarchy.json
 * Each field in the form has specific metadata including ID, label, value, type, and section information
 */
export interface FieldMetadata<T = string> {
  name: string;           // Form field name (e.g., "form1[0].Sections1-6[0].section5[0].TextField11[0]")
  id: string;             // Field ID with '0 R' suffix (e.g., "9502 0 R")
  label: string;          // Human-readable field label (e.g., "Middle Name")
  value: T;               // Field value or placeholder, generic to support different types
  type: string;           // Field type (e.g., "PDFTextField")
  section: number;        // Section number (1-30)
  sectionName: string;    // Human-readable section name (e.g., "Other Names Used")
  confidence: number;     // Confidence score for the field (0.0-1.0)
  validation?: {          // Optional validation rules
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  subsection?: number;    // Optional subsection number (e.g., 5 for section 9.5)
}

/**
 * Represents subsection information extracted from field metadata
 */
export interface SubsectionInfo {
  section: number;       // Parent section number (e.g., 9 for section 9.5)
  subsection: number;    // Subsection number (e.g., 5 for section 9.5)
  title?: string;        // Optional subsection title
  mappingStatus?: string;// Status of the subsection mapping (e.g., 'Detected', 'Inferred', 'Known')
}

/**
 * Represents a collection of fields grouped by section
 */
export interface SectionMetadata {
  sectionNumber: number;        // Section number (1-30)
  sectionName: string;          // Human-readable section name
  fields: FieldMetadata[];      // Array of fields in this section
  isRepeatable: boolean;        // Whether this section can have multiple entries
  maxEntries?: number;          // Maximum number of entries allowed (if repeatable)
  subsections?: SubsectionInfo[]; // Optional array of subsections within this section
}

/**
 * Represents a form structure containing fields
 */
export interface FormStructure {
  regex: string;
  confidence: number;
  fields: FieldMetadata[];
}

/**
 * Represents the entire field hierarchy structure from the JSON file
 */
export interface FieldHierarchy {
  [formKey: string]: FormStructure;
} 