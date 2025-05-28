/**
 * SF-86 Form Data Converter
 * 
 * Utilities to convert between different SF-86 data formats:
 * - Legacy CategorizedField format to new SF86Form structure
 * - Section export JSON to SF86Form structure
 * - Form state serialization/deserialization
 */

import type { CategorizedField } from '../utils/extractFieldsBySection.js';
import type {
  SF86Form,
  SF86Section,
  SF86CategorizedField,
  SF86FieldType
} from './SF86FormTypes.js';
import {
  createSF86Form,
  convertToFormField,
  mapFieldType,
  getConfidenceLevel,
  generateFieldId,
  updateFormCompletion
} from './SF86FormHelpers.js';

/**
 * Section export data structure (from section-exporter.ts)
 */
interface SectionExportData {
  metadata: {
    sectionId: number;
    sectionName: string;
    totalFields: number;
    subsectionCount: number;
    entryCount: number;
    exportDate: string;
    averageConfidence: number;
    pageRange?: [number, number];
  };
  fields: any[];
  fieldsBySubsection: Record<string, any[]>;
  fieldsByEntry: Record<string, any[]>;
  statistics: {
    fieldTypes: Record<string, number>;
    confidenceDistribution: {
      high: number;
      medium: number;
      low: number;
    };
  };
}

/**
 * Convert legacy CategorizedField to SF86CategorizedField
 */
export function convertLegacyField(legacyField: CategorizedField): SF86CategorizedField {
  return {
    id: legacyField.id,
    name: legacyField.name,
    value: legacyField.value,
    page: legacyField.page,
    label: legacyField.label,
    type: mapFieldType(legacyField.type || 'unknown'),
    options: legacyField.options,
    maxLength: legacyField.maxLength,
    rect: legacyField.rect ? {
      x: legacyField.rect.x || 0,
      y: legacyField.rect.y || 0,
      width: legacyField.rect.width || 0,
      height: legacyField.rect.height || 0
    } : undefined,
    section: legacyField.section,
    subsection: legacyField.subsection,
    entry: legacyField.entry,
    confidence: legacyField.confidence,
    confidenceLevel: getConfidenceLevel(legacyField.confidence),
    uniqueId: legacyField.uniqueId || generateFieldId(
      legacyField.section,
      legacyField.subsection,
      legacyField.entry,
      legacyField.name
    ),
    wasMovedByHealing: legacyField.wasMovedByHealing,
    isExplicitlyDetected: legacyField.isExplicitlyDetected,
    reason: (legacyField as any).reason
  };
}

/**
 * Convert array of legacy CategorizedFields to SF86Form
 */
export function convertLegacyFieldsToForm(legacyFields: CategorizedField[]): SF86Form {
  const convertedFields = legacyFields.map(convertLegacyField);
  const form = createSF86Form(convertedFields);
  return updateFormCompletion(form);
}

/**
 * Convert section export JSON data to SF86Form
 */
export function convertSectionExportsToForm(
  sectionExports: Record<string, SectionExportData>
): SF86Form {
  const allFields: SF86CategorizedField[] = [];

  Object.values(sectionExports).forEach(sectionData => {
    if (sectionData.fields && Array.isArray(sectionData.fields)) {
      sectionData.fields.forEach(field => {
        try {
          const convertedField = convertLegacyField(field as CategorizedField);
          allFields.push(convertedField);
        } catch (error) {
          console.warn('Failed to convert field:', field, error);
        }
      });
    }
  });

  return createSF86Form(allFields);
}

/**
 * Load SF86Form from section export directory
 */
export async function loadFormFromSectionExports(
  sectionsDirectoryPath: string
): Promise<SF86Form> {
  const fs = await import('fs');
  const path = await import('path');

  const sectionExports: Record<string, SectionExportData> = {};

  try {
    // Read index file to get list of sections
    const indexPath = path.join(sectionsDirectoryPath, 'index.json');
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

    // Load each section file
    for (const sectionInfo of indexData.sections) {
      const sectionPath = path.join(sectionsDirectoryPath, sectionInfo.fileName);
      if (fs.existsSync(sectionPath)) {
        const sectionData = JSON.parse(fs.readFileSync(sectionPath, 'utf8'));
        sectionExports[sectionInfo.sectionId] = sectionData;
      }
    }

    // Also try to load uncategorized fields
    const uncategorizedPath = path.join(sectionsDirectoryPath, 'uncategorized.json');
    if (fs.existsSync(uncategorizedPath)) {
      const uncategorizedData = JSON.parse(fs.readFileSync(uncategorizedPath, 'utf8'));
      sectionExports['0'] = uncategorizedData;
    }

  } catch (error) {
    console.error('Error loading section exports:', error);
    throw new Error(`Failed to load form from section exports: ${error}`);
  }

  return convertSectionExportsToForm(sectionExports);
}

/**
 * Serialize SF86Form to JSON string
 */
export function serializeForm(form: SF86Form): string {
  return JSON.stringify(form, null, 2);
}

/**
 * Deserialize JSON string to SF86Form
 */
export function deserializeForm(jsonString: string): SF86Form {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Validate basic structure
    if (!parsed.metadata || !parsed.sections) {
      throw new Error('Invalid form structure: missing metadata or sections');
    }

    // Ensure proper typing for enums and dates
    const form: SF86Form = {
      ...parsed,
      metadata: {
        ...parsed.metadata,
        createdDate: new Date(parsed.metadata.createdDate).toISOString(),
        lastModified: new Date(parsed.metadata.lastModified).toISOString()
      }
    };

    return form;
  } catch (error) {
    throw new Error(`Failed to deserialize form: ${error}`);
  }
}

/**
 * Export SF86Form to section-based JSON files
 */
export async function exportFormToSectionFiles(
  form: SF86Form,
  outputDirectory: string
): Promise<void> {
  const fs = await import('fs');
  const path = await import('path');

  // Create output directory
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  const exportedSections: any[] = [];

  // Export each section
  Object.values(form.sections).forEach(section => {
    const sectionData = convertSectionToExportFormat(section);
    const fileName = `section-${section.sectionId}.json`;
    const filePath = path.join(outputDirectory, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(sectionData, null, 2));
    
    exportedSections.push({
      sectionId: section.sectionId,
      sectionName: section.sectionName,
      fieldCount: getTotalFieldCount(section),
      fileName
    });
  });

  // Create index file
  const indexData = {
    exportDate: new Date().toISOString(),
    totalSections: exportedSections.length,
    totalFiles: exportedSections.length + 1, // +1 for index file
    sections: exportedSections.sort((a, b) => a.sectionId - b.sectionId)
  };

  const indexPath = path.join(outputDirectory, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
}

/**
 * Convert SF86Section to section export format
 */
function convertSectionToExportFormat(section: SF86Section): SectionExportData {
  const allFields = getAllFieldsInSection(section);
  
  // Group fields by subsection and entry
  const fieldsBySubsection: Record<string, any[]> = {};
  const fieldsByEntry: Record<string, any[]> = {};
  
  allFields.forEach(field => {
    const subsection = field.subsection || 'default';
    const entry = field.entry?.toString() || 'default';
    
    if (!fieldsBySubsection[subsection]) {
      fieldsBySubsection[subsection] = [];
    }
    fieldsBySubsection[subsection].push(field);
    
    if (!fieldsByEntry[entry]) {
      fieldsByEntry[entry] = [];
    }
    fieldsByEntry[entry].push(field);
  });

  // Calculate statistics
  const fieldTypes: Record<string, number> = {};
  let highConfidence = 0;
  let mediumConfidence = 0;
  let lowConfidence = 0;

  allFields.forEach(field => {
    const type = field.type || 'unknown';
    fieldTypes[type] = (fieldTypes[type] || 0) + 1;

    const confidence = field.confidence || 0;
    if (confidence >= 0.9) {
      highConfidence++;
    } else if (confidence >= 0.7) {
      mediumConfidence++;
    } else {
      lowConfidence++;
    }
  });

  return {
    metadata: {
      sectionId: section.sectionId,
      sectionName: section.sectionName,
      totalFields: allFields.length,
      subsectionCount: Object.keys(fieldsBySubsection).length,
      entryCount: Object.keys(fieldsByEntry).length,
      exportDate: new Date().toISOString(),
      averageConfidence: allFields.length > 0 
        ? allFields.reduce((sum, field) => sum + (field.confidence || 0), 0) / allFields.length
        : 0,
      pageRange: section.pageRange
    },
    fields: allFields,
    fieldsBySubsection,
    fieldsByEntry,
    statistics: {
      fieldTypes,
      confidenceDistribution: {
        high: highConfidence,
        medium: mediumConfidence,
        low: lowConfidence
      }
    }
  };
}

/**
 * Get all fields in a section (helper function)
 */
function getAllFieldsInSection(section: SF86Section): any[] {
  const fields: any[] = [];
  
  // Add standalone fields
  if (section.standaloneFields) {
    fields.push(...section.standaloneFields);
  }
  
  // Add subsection fields
  Object.values(section.subsections).forEach(subsection => {
    if (subsection.standaloneFields) {
      fields.push(...subsection.standaloneFields);
    }
    
    subsection.entries.forEach(entry => {
      fields.push(...entry.fields);
    });
  });
  
  return fields;
}

/**
 * Get total field count in a section
 */
function getTotalFieldCount(section: SF86Section): number {
  return getAllFieldsInSection(section).length;
}

/**
 * Create a minimal form structure for testing
 */
export function createMinimalForm(): SF86Form {
  return {
    metadata: {
      version: '1.0',
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      totalFields: 0,
      completionPercentage: 0,
      validationState: 'empty' as any
    },
    sections: {},
    submissionState: 'draft',
    navigation: {
      currentSection: 1,
      completedSections: [],
      availableSections: []
    }
  };
}
