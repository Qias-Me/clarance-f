/**
 * SF-86 Form Helper Functions and Utilities
 * 
 * Utility functions for working with SF-86 form data structures,
 * converting between different formats, and managing form state.
 */

import type {
  SF86Form,
  SF86Section,
  SF86Subsection,
  SF86Entry,
  SF86FormField,
  SF86CategorizedField,
  SF86FieldType,
  ValidationState,
  ConfidenceLevel
} from './SF86FormTypes.js';

/**
 * Section names mapping for SF-86 form
 */
export const SF86_SECTION_NAMES: Record<number, string> = {
  1: "Information About You",
  2: "Citizenship", 
  3: "Where You Have Lived",
  4: "Activities",
  5: "Education",
  6: "Employment Activities", 
  7: "Where You Have Lived",
  8: "U.S. Passport Information",
  9: "Citizenship",
  10: "Relatives and Associates",
  11: "Where You Have Lived", 
  12: "Where You Went to School",
  13: "Employment Activities",
  14: "Military History",
  15: "Military History",
  16: "Foreign Activities",
  17: "Marital Status",
  18: "Relatives and Associates",
  19: "Foreign Activities", 
  20: "Foreign Activities",
  21: "Psychological and Emotional Health",
  22: "Police Record",
  23: "Illegal Use of Drugs or Drug Activity",
  24: "Use of Alcohol",
  25: "Investigation and Clearance Record",
  26: "Financial Record",
  27: "Use of Information Technology Systems",
  28: "Involvement in Non-Criminal Court Actions",
  29: "Association Record",
  30: "General Remarks"
};

/**
 * Sections that typically don't have subsections (1-8)
 */
export const SECTIONS_WITHOUT_SUBSECTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * Sections that are typically repeatable
 */
export const REPEATABLE_SECTIONS = [11, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];

/**
 * Convert confidence score to confidence level
 */
export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.9) return ConfidenceLevel.HIGH;
  if (confidence >= 0.7) return ConfidenceLevel.MEDIUM;
  return ConfidenceLevel.LOW;
}

/**
 * Convert PDF field type string to SF86FieldType enum
 */
export function mapFieldType(type: string): SF86FieldType {
  switch (type?.toLowerCase()) {
    case 'pdftextfield':
    case 'text':
      return SF86FieldType.TEXT;
    case 'pdfradiogroup':
    case 'radiogroup':
    case 'radio':
      return SF86FieldType.RADIO_GROUP;
    case 'pdfcheckbox':
    case 'checkbox':
      return SF86FieldType.CHECKBOX;
    case 'pdfdropdown':
    case 'dropdown':
    case 'select':
      return SF86FieldType.DROPDOWN;
    case 'pdfdatefield':
    case 'date':
      return SF86FieldType.DATE;
    case 'pdfsignature':
    case 'signature':
      return SF86FieldType.SIGNATURE;
    default:
      return SF86FieldType.UNKNOWN;
  }
}

/**
 * Generate unique field ID for hierarchical organization
 */
export function generateFieldId(
  section: number,
  subsection?: string,
  entry?: number,
  fieldName?: string
): string {
  let id = `section_${section}`;
  
  if (subsection) {
    id += `_sub_${subsection}`;
  }
  
  if (entry !== undefined && entry !== null) {
    id += `_entry_${entry}`;
  }
  
  if (fieldName) {
    const cleanName = fieldName.replace(/[^a-zA-Z0-9]/g, '_');
    id += `_field_${cleanName}`;
  }
  
  return id;
}

/**
 * Convert categorized field to form field
 */
export function convertToFormField(categorizedField: SF86CategorizedField): SF86FormField {
  const formField: SF86FormField = {
    ...categorizedField,
    type: mapFieldType(categorizedField.type as string),
    confidenceLevel: getConfidenceLevel(categorizedField.confidence),
    displayName: categorizedField.label || categorizedField.name,
    visible: true,
    disabled: false,
    validationState: ValidationState.EMPTY
  };

  // Generate unique ID if not present
  if (!formField.uniqueId) {
    formField.uniqueId = generateFieldId(
      formField.section,
      formField.subsection,
      formField.entry,
      formField.name
    );
  }

  return formField;
}

/**
 * Group fields by section, subsection, and entry
 */
export function groupFieldsHierarchically(
  fields: SF86CategorizedField[]
): Record<number, Record<string, Record<string, SF86CategorizedField[]>>> {
  const grouped: Record<number, Record<string, Record<string, SF86CategorizedField[]>>> = {};

  fields.forEach(field => {
    const section = field.section;
    const subsection = field.subsection || 'default';
    const entry = field.entry?.toString() || 'default';

    if (!grouped[section]) {
      grouped[section] = {};
    }
    
    if (!grouped[section][subsection]) {
      grouped[section][subsection] = {};
    }
    
    if (!grouped[section][subsection][entry]) {
      grouped[section][subsection][entry] = [];
    }
    
    grouped[section][subsection][entry].push(field);
  });

  return grouped;
}

/**
 * Create SF86Entry from grouped fields
 */
export function createEntry(
  entryNumber: number,
  fields: SF86CategorizedField[]
): SF86Entry {
  return {
    entryNumber,
    displayName: `Entry ${entryNumber}`,
    fields: fields.map(convertToFormField),
    isComplete: false,
    isDeletable: entryNumber > 1, // First entry usually not deletable
    validationState: ValidationState.EMPTY
  };
}

/**
 * Create SF86Subsection from grouped fields
 */
export function createSubsection(
  subsectionId: string,
  entriesData: Record<string, SF86CategorizedField[]>
): SF86Subsection {
  const entries: SF86Entry[] = [];
  const standaloneFields: SF86FormField[] = [];

  Object.entries(entriesData).forEach(([entryKey, fields]) => {
    if (entryKey === 'default') {
      // Fields without specific entry numbers become standalone
      standaloneFields.push(...fields.map(convertToFormField));
    } else {
      const entryNumber = parseInt(entryKey, 10);
      if (!isNaN(entryNumber)) {
        entries.push(createEntry(entryNumber, fields));
      }
    }
  });

  // Sort entries by entry number
  entries.sort((a, b) => a.entryNumber - b.entryNumber);

  return {
    subsectionId,
    displayName: `Subsection ${subsectionId.toUpperCase()}`,
    isRepeatable: entries.length > 1,
    maxEntries: 10, // Default max entries
    minEntries: 1,
    entries,
    standaloneFields: standaloneFields.length > 0 ? standaloneFields : undefined,
    validationState: ValidationState.EMPTY
  };
}

/**
 * Create SF86Section from grouped fields
 */
export function createSection(
  sectionId: number,
  subsectionsData: Record<string, Record<string, SF86CategorizedField[]>>
): SF86Section {
  const subsections: Record<string, SF86Subsection> = {};
  const standaloneFields: SF86FormField[] = [];

  Object.entries(subsectionsData).forEach(([subsectionKey, entriesData]) => {
    if (subsectionKey === 'default') {
      // Fields without specific subsection become standalone
      Object.values(entriesData).flat().forEach(field => {
        standaloneFields.push(convertToFormField(field));
      });
    } else {
      subsections[subsectionKey] = createSubsection(subsectionKey, entriesData);
    }
  });

  const hasSubsections = Object.keys(subsections).length > 0;
  const isRepeatable = REPEATABLE_SECTIONS.includes(sectionId);

  return {
    sectionId,
    sectionName: SF86_SECTION_NAMES[sectionId] || `Section ${sectionId}`,
    hasSubsections,
    isRepeatable,
    subsections,
    standaloneFields: standaloneFields.length > 0 ? standaloneFields : undefined,
    completionPercentage: 0,
    validationState: ValidationState.EMPTY,
    required: true,
    visible: true
  };
}

/**
 * Convert categorized fields to complete SF86Form structure
 */
export function createSF86Form(categorizedFields: SF86CategorizedField[]): SF86Form {
  const groupedFields = groupFieldsHierarchically(categorizedFields);
  const sections: Record<number, SF86Section> = {};

  Object.entries(groupedFields).forEach(([sectionKey, subsectionsData]) => {
    const sectionId = parseInt(sectionKey, 10);
    if (!isNaN(sectionId) && sectionId > 0 && sectionId <= 30) {
      sections[sectionId] = createSection(sectionId, subsectionsData);
    }
  });

  return {
    metadata: {
      version: '1.0',
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      totalFields: categorizedFields.length,
      completionPercentage: 0,
      validationState: ValidationState.EMPTY
    },
    sections,
    submissionState: 'draft',
    navigation: {
      currentSection: 1,
      completedSections: [],
      availableSections: Object.keys(sections).map(Number).sort((a, b) => a - b)
    }
  };
}

/**
 * Calculate completion percentage for a section
 */
export function calculateSectionCompletion(section: SF86Section): number {
  let totalFields = 0;
  let completedFields = 0;

  // Count standalone fields
  if (section.standaloneFields) {
    totalFields += section.standaloneFields.length;
    completedFields += section.standaloneFields.filter(field => 
      field.value !== undefined && field.value !== null && field.value !== ''
    ).length;
  }

  // Count subsection fields
  Object.values(section.subsections).forEach(subsection => {
    subsection.entries.forEach(entry => {
      totalFields += entry.fields.length;
      completedFields += entry.fields.filter(field =>
        field.value !== undefined && field.value !== null && field.value !== ''
      ).length;
    });

    if (subsection.standaloneFields) {
      totalFields += subsection.standaloneFields.length;
      completedFields += subsection.standaloneFields.filter(field =>
        field.value !== undefined && field.value !== null && field.value !== ''
      ).length;
    }
  });

  return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
}

/**
 * Update form completion percentages
 */
export function updateFormCompletion(form: SF86Form): SF86Form {
  const updatedSections = { ...form.sections };
  let totalCompletion = 0;

  Object.values(updatedSections).forEach(section => {
    section.completionPercentage = calculateSectionCompletion(section);
    totalCompletion += section.completionPercentage;
  });

  const overallCompletion = Object.keys(updatedSections).length > 0 
    ? Math.round(totalCompletion / Object.keys(updatedSections).length)
    : 0;

  return {
    ...form,
    metadata: {
      ...form.metadata,
      completionPercentage: overallCompletion,
      lastModified: new Date().toISOString()
    },
    sections: updatedSections
  };
}
