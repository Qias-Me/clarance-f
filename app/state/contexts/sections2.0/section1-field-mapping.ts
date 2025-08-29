/**
 * Section 1 PDF-to-UI Field Mapping Service
 * 
 * Provides comprehensive field mapping between UI state, PDF fields, and context data
 * for Section 1 (Information About You) using the integration folder mappings.
 */

// Note: These imports may need to be adjusted based on the actual file structure
// For now, we'll implement the service without direct JSON imports
// and use fetch or other methods to load data at runtime

// Type definitions for section 1 field data
export interface Section1Field {
  id: string;
  name: string;
  value: any;
  page: number;
  label: string;
  type: string;
  maxLength?: number;
  rect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  section: number;
  confidence: number;
  wasMovedByHealing?: boolean;
  entry?: number;
  uniqueId: string;
  options?: string[];
}

interface Section1JsonData {
  metadata: {
    sectionId: number;
    sectionName: string;
    totalFields: number;
    subsectionCount: number;
    entryCount: number;
    exportDate: string;
    averageConfidence: number;
    pageRange: number[];
  };
  fields: Section1Field[];
  statistics: {
    fieldTypes: Record<string, number>;
    confidenceDistribution: Record<string, number>;
  };
}

interface Section1MappingData {
  metadata: {
    pdfPath: string;
    section: number;
    timestamp: string;
    version: string;
  };
  summary: {
    totalMappings: number;
    averageConfidence: number;
    highConfidenceMappings: number;
    lowConfidenceMappings: number;
    validatedMappings: number;
  };
  mappings: Array<{
    uiPath: string;
    pdfFieldId: string;
    confidence: number;
  }>;
}

// Load section 1 field data (temporarily disabled to fix import issues)
const section1Fields: Section1Field[] = [];
const mappings: Section1MappingData = {
  metadata: {
    pdfPath: "",
    section: 1,
    timestamp: "",
    version: ""
  },
  summary: {
    totalMappings: 0,
    averageConfidence: 0,
    highConfidenceMappings: 0,
    lowConfidenceMappings: 0,
    validatedMappings: 0
  },
  mappings: []
};

// Create mapping from field names to field data
const fieldNameToDataMap = new Map<string, Section1Field>();
section1Fields.forEach(field => {
  fieldNameToDataMap.set(field.name, field);
});

// Create mapping from field IDs to field data  
const fieldIdToDataMap = new Map<string, Section1Field>();
section1Fields.forEach(field => {
  // Extract numeric ID from "9449 0 R" format
  const numericId = field.id.replace(' 0 R', '');
  fieldIdToDataMap.set(numericId, field);
});

// Create UI path to PDF field mapping
const uiPathToPdfFieldMap = new Map<string, string>();
mappings.mappings.forEach(mapping => {
  uiPathToPdfFieldMap.set(mapping.uiPath, mapping.pdfFieldId);
});

// Create PDF field to UI path mapping
const pdfFieldToUiPathMap = new Map<string, string>();
mappings.mappings.forEach(mapping => {
  pdfFieldToUiPathMap.set(mapping.pdfFieldId, mapping.uiPath);
});

/**
 * Section 1 Field Mappings - Maps logical field paths to actual PDF field names
 * Based on the integration/sections/section-1-mappings.json file
 */
export const SECTION1_FIELD_MAPPINGS = {
  // Personal information fields
  'section1.lastName.value': 'form1[0].Sections1-6[0].TextField11[0]',
  'section1.firstName.value': 'form1[0].Sections1-6[0].TextField11[1]', 
  'section1.middleName.value': 'form1[0].Sections1-6[0].TextField11[2]',
  'section1.suffix.value': 'form1[0].Sections1-6[0].suffix[0]',
} as const;

/**
 * Get the actual PDF field data for a given field name
 */
export function getPdfFieldByName(fieldName: string): Section1Field | undefined {
  return fieldNameToDataMap.get(fieldName);
}

/**
 * Get the actual PDF field data for a given numeric field ID
 */
export function getPdfFieldById(fieldId: string): Section1Field | undefined {
  return fieldIdToDataMap.get(fieldId);
}

/**
 * Get the numeric field ID for a given field name
 */
export function getNumericFieldId(fieldName: string): string | undefined {
  const field = fieldNameToDataMap.get(fieldName);
  if (field) {
    return field.id.replace(' 0 R', '');
  }
  return undefined;
}

/**
 * Map a logical field path to the actual PDF field name
 */
export function mapLogicalFieldToPdfField(logicalPath: string): string {
  return SECTION1_FIELD_MAPPINGS[logicalPath as keyof typeof SECTION1_FIELD_MAPPINGS] || logicalPath;
}

/**
 * Get field metadata for a logical field path
 */
export function getFieldMetadata(logicalPath: string): Section1Field | undefined {
  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  return getPdfFieldByName(pdfFieldName);
}

/**
 * Get UI path for a PDF field ID
 */
export function getUiPathForPdfField(pdfFieldId: string): string | undefined {
  return pdfFieldToUiPathMap.get(pdfFieldId);
}

/**
 * Get PDF field ID for a UI path
 */
export function getPdfFieldIdForUiPath(uiPath: string): string | undefined {
  return uiPathToPdfFieldMap.get(uiPath);
}

/**
 * Get all available field names for Section 1
 */
export function getAllSection1FieldNames(): string[] {
  return Array.from(fieldNameToDataMap.keys());
}

/**
 * Get all available numeric field IDs for Section 1
 */
export function getAllSection1FieldIds(): string[] {
  return Array.from(fieldIdToDataMap.keys());
}

/**
 * Get mapping statistics for debugging
 */
export function getMappingStatistics() {
  return {
    totalFields: section1Fields.length,
    fieldNameMappings: fieldNameToDataMap.size,
    fieldIdMappings: fieldIdToDataMap.size,
    uiPathMappings: uiPathToPdfFieldMap.size,
    mappingSummary: mappings.summary,
    fieldTypes: (section1Data as Section1JsonData).statistics.fieldTypes,
    confidenceDistribution: (section1Data as Section1JsonData).statistics.confidenceDistribution
  };
}

/**
 * Validate field mapping consistency
 */
export function validateFieldMappings(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check that all UI paths have corresponding PDF fields
  for (const [uiPath, pdfFieldId] of uiPathToPdfFieldMap) {
    const field = getPdfFieldByName(pdfFieldId);
    if (!field) {
      errors.push(`UI path "${uiPath}" maps to PDF field "${pdfFieldId}" which does not exist`);
    }
  }

  // Check field confidence levels
  for (const field of section1Fields) {
    if (field.confidence < 0.5) {
      warnings.push(`Field "${field.name}" has low confidence: ${field.confidence}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Export integration data for debugging
 */
export const INTEGRATION_DATA = {
  section1Data: {
    metadata: {
      sectionId: 1,
      sectionName: "Information About You",
      totalFields: 0,
      subsectionCount: 0,
      entryCount: 0,
      exportDate: "",
      averageConfidence: 0,
      pageRange: []
    },
    fields: [],
    statistics: {
      fieldTypes: {},
      confidenceDistribution: {}
    }
  },
  mappings: mappings,
  fieldCount: section1Fields.length,
  mappingCount: mappings.mappings.length
};
