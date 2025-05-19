import { cloneDeep } from 'lodash';
// Node.js fs and path modules are not directly available in browser environments
// We'll handle this in the loadFieldHierarchy function

/**
 * Represents the structure of a field in field-hierarchy.json
 */
export interface FieldMetadata {
  name: string;
  id: string;
  label: string;
  value: string;
  type: string;
  section: number;
  sectionName: string;
  confidence: number;
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

/**
 * Represents a field in the React context
 */
export interface ContextField {
  value: string;
  id: string;
  type: string;
  label: string;
  name?: string;
}

/**
 * Maps section numbers to their corresponding context file names
 */
export const sectionToFileMapping: Record<number, string> = {
  1: "personalInfo",
  2: "birthInfo",
  3: "placeOfBirth",
  4: "aknowledgementInfo",
  5: "namesInfo",
  6: "physicalAttributes",
  7: "contactInfo",
  8: "passportInfo",
  9: "citizenshipInfo",
  10: "dualCitizenshipInfo",
  11: "residencyInfo",
  12: "schoolInfo",
  13: "employmentInfo",
  14: "serviceInfo",
  15: "militaryHistoryInfo",
  16: "peopleThatKnow",
  17: "relationshipInfo",
  18: "relativesInfo",
  19: "foreignContacts",
  20: "foreignActivities",
  21: "mentalHealth",
  22: "policeRecord",
  23: "drugActivity",
  24: "alcoholUse",
  25: "investigationsInfo",
  26: "finances",
  27: "technology",
  28: "civil",
  29: "association",
  30: "signature"
};

/**
 * Maps file names to their corresponding section numbers and names
 */
export const fileToSectionMapping: Record<string, { id: string, name: string }> = {
  "personalInfo.tsx": { id: "1", name: "Full Name" },
  "birthInfo.tsx": { id: "2", name: "Date of Birth" },
  "placeOfBirth.tsx": { id: "3", name: "Place of Birth" },
  "aknowledgementInfo.tsx": { id: "4", name: "Social Security Number" },
  "namesInfo.tsx": { id: "5", name: "Other Names Used" },
  "physicalAttributes.tsx": { id: "6", name: "Your Identifying Information" },
  "contactInfo.tsx": { id: "7", name: "Your Contact Information" },
  "passportInfo.tsx": { id: "8", name: "U.S. Passport Information" },
  "citizenshipInfo.tsx": { id: "9", name: "Citizenship" },
  "dualCitizenshipInfo.tsx": { id: "10", name: "Dual/Multiple Citizenship & Foreign Passport Info" },
  "residencyInfo.tsx": { id: "11", name: "Where You Have Lived" },
  "schoolInfo.tsx": { id: "12", name: "Where you went to School" },
  "employmentInfo.tsx": { id: "13", name: "Employment Acitivites" },
  "serviceInfo.tsx": { id: "14", name: "Selective Service" },
  "militaryHistoryInfo.tsx": { id: "15", name: "Military History" },
  "peopleThatKnow.tsx": { id: "16", name: "People Who Know You Well" },
  "relationshipInfo.tsx": { id: "17", name: "Maritial/Relationship Status" },
  "relativesInfo.tsx": { id: "18", name: "Relatives" },
  "foreignContacts.tsx": { id: "19", name: "Foreign Contacts" },
  "foreignActivities.tsx": { id: "20", name: "Foreign Business, Activities, Government Contacts" },
  "mentalHealth.tsx": { id: "21", name: "Psycological and Emotional Health" },
  "policeRecord.tsx": { id: "22", name: "Police Record" },
  "drugActivity.tsx": { id: "23", name: "Illegal Use of Drugs and Drug Activity" },
  "alcoholUse.tsx": { id: "24", name: "Use of Alcohol" },
  "investigationsInfo.tsx": { id: "25", name: "Investigations and Clearance" },
  "finances.tsx": { id: "26", name: "Financial Record" },
  "technology.tsx": { id: "27", name: "Use of Information Technology Systems" },
  "civil.tsx": { id: "28", name: "Involvement in Non-Criminal Court Actions" },
  "association.tsx": { id: "29", name: "Association Record" },
  "signature.tsx": { id: "30", name: "Continuation Space" }
};

/**
 * Strips the "0 R" suffix from field IDs
 * 
 * @param id Field ID with "0 R" suffix
 * @returns Field ID without the suffix
 */
export function stripIdSuffix(id: string): string {
  return id.replace(/ 0 R$/, '');
}

/**
 * Adds back the "0 R" suffix to field IDs for runtime use
 * 
 * @param id Field ID without "0 R" suffix
 * @returns Field ID with the suffix added back
 */
export function addIdSuffix(id: string): string {
  return `${id} 0 R`;
}

/**
 * Parses and loads the field hierarchy JSON file
 * 
 * @param filePath Path to the field-hierarchy.json file (default is reports/field-hierarchy.json)
 * @returns Parsed field hierarchy data
 * @throws Error if file cannot be read or parsed
 */
export function loadFieldHierarchy(filePath: string = 'reports/field-hierarchy.json'): FieldHierarchy {
  try {
    // In a browser environment, direct file system access is not available
    // This would need to be implemented differently based on the runtime environment
    // For a Next.js app, you might use an API route or server component
    if (typeof window === 'undefined') {
      // Server-side environment
      try {
        // Dynamic import for Node.js modules (only available server-side)
        const fs = require('fs');
        const path = require('path');
        const resolvedPath = path.resolve(filePath);
        const fileData = fs.readFileSync(resolvedPath, 'utf8');
        return JSON.parse(fileData);
      } catch (err) {
        console.error('Server-side file loading error:', err);
        throw new Error(`Failed to load field hierarchy from ${filePath}`);
      }
    } else {
      // Client-side environment
      // This would typically use fetch() to an API endpoint
      throw new Error('loadFieldHierarchy must be called server-side or via an API endpoint');
    }
  } catch (error) {
    console.error('Error loading field hierarchy:', error);
    throw new Error(`Failed to load field hierarchy: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Analyzes field metadata to extract field patterns and statistics
 * 
 * @param fieldHierarchy Field hierarchy data
 * @returns Analysis of field patterns, types, and statistics
 */
export function analyzeFieldMetadata(fieldHierarchy: FieldHierarchy): {
  totalFields: number;
  fieldsBySection: Record<number, { count: number; name: string }>;
  fieldTypes: Record<string, number>;
  confidenceSummary: { high: number; medium: number; low: number };
} {
  const analysis = {
    totalFields: 0,
    fieldsBySection: {} as Record<number, { count: number; name: string }>,
    fieldTypes: {} as Record<string, number>,
    confidenceSummary: { high: 0, medium: 0, low: 0 },
  };

  // Process each form
  Object.values(fieldHierarchy).forEach(form => {
    if (!form.fields) return;

    // Process each field
    form.fields.forEach(field => {
      analysis.totalFields++;

      // Count by section
      if (field.section) {
        if (!analysis.fieldsBySection[field.section]) {
          analysis.fieldsBySection[field.section] = {
            count: 0,
            name: field.sectionName || `Unknown Section ${field.section}`
          };
        }
        analysis.fieldsBySection[field.section].count++;
      }

      // Count by field type
      if (field.type) {
        analysis.fieldTypes[field.type] = (analysis.fieldTypes[field.type] || 0) + 1;
      }

      // Categorize by confidence
      if (field.confidence >= 0.8) {
        analysis.confidenceSummary.high++;
      } else if (field.confidence >= 0.5) {
        analysis.confidenceSummary.medium++;
      } else {
        analysis.confidenceSummary.low++;
      }
    });
  });

  return analysis;
}

/**
 * Converts a field from field-hierarchy.json to the format used in context files
 * 
 * @param field Field metadata from field-hierarchy.json
 * @returns Field in context format
 */
export function convertToContextField(field: FieldMetadata): ContextField {
  return {
    value: field.value || '',
    id: stripIdSuffix(field.id),
    type: field.type,
    label: field.label,
    name: field.name
  };
}

/**
 * Groups all fields by section
 * 
 * @param fieldHierarchy Field hierarchy data
 * @returns Fields grouped by section number
 */
export function groupFieldsBySection(fieldHierarchy: Record<string, any>): Record<number, FieldMetadata[]> {
  const sections: Record<number, FieldMetadata[]> = {};
  
  // Iterate through each form
  Object.values(fieldHierarchy).forEach(form => {
    if (typeof form === 'object' && form !== null && Array.isArray(form.fields)) {
      // Process each field in the form
      form.fields.forEach((field: any) => {
        if (typeof field === 'object' && field !== null && 'section' in field) {
          const fieldData = field as FieldMetadata;
          const sectionNum = fieldData.section;
          
          if (!sections[sectionNum]) {
            sections[sectionNum] = [];
          }
          
          sections[sectionNum].push(fieldData);
        }
      });
    }
  });
  
  return sections;
}

/**
 * Extracts field metadata for a specific section
 * 
 * @param sectionNumber The section number to extract fields for
 * @param fieldHierarchy Field hierarchy data
 * @returns Array of field metadata for the specified section
 */
export function getFieldsForSection(sectionNumber: number, fieldHierarchy: Record<string, any>): FieldMetadata[] {
  const sections = groupFieldsBySection(fieldHierarchy);
  return sections[sectionNumber] || [];
}

/**
 * Creates section context data based on fields from field-hierarchy.json
 * 
 * @param sectionNumber The section number to create context for
 * @param fieldHierarchy Field hierarchy data
 * @returns Context data for the specified section
 */
export function createSectionContext(sectionNumber: number, fieldHierarchy: Record<string, any>): Record<string, any> {
  const fields = getFieldsForSection(sectionNumber, fieldHierarchy);
  const context: Record<string, any> = {};
  
  // Process each field to add it to the context
  fields.forEach(field => {
    // Extract the field name from the full name
    const nameParts = field.name.split('.');
    const lastPart = nameParts[nameParts.length - 1];
    const fieldNameMatch = lastPart.match(/([a-zA-Z]+)(\d+)?\[(\d+)\]/);
    
    if (fieldNameMatch) {
      const [, fieldType, fieldNumber, fieldIndex] = fieldNameMatch;
      let fieldName = fieldType.charAt(0).toLowerCase() + fieldType.slice(1);
      
      if (fieldNumber) {
        fieldName += fieldNumber;
      }
      
      const contextField = convertToContextField(field);
      
      // Add field to the context
      context[fieldName] = context[fieldName] || {};
      context[fieldName][fieldIndex] = contextField;
    }
  });
  
  return context;
}

/**
 * Updates an existing context with fields from field-hierarchy.json
 * 
 * @param existingContext Existing context data to update
 * @param sectionNumber The section number to update fields for
 * @param fieldHierarchy Field hierarchy data
 * @returns Updated context data
 */
export function updateContextWithFields(
  existingContext: Record<string, any>, 
  sectionNumber: number, 
  fieldHierarchy: Record<string, any>
): Record<string, any> {
  const newContext = createSectionContext(sectionNumber, fieldHierarchy);
  const updatedContext = cloneDeep(existingContext);
  
  // Merge the new context with the existing context
  Object.entries(newContext).forEach(([fieldName, fieldData]) => {
    updatedContext[fieldName] = {
      ...updatedContext[fieldName],
      ...fieldData
    };
  });
  
  return updatedContext;
}

/**
 * Processes the entire field hierarchy to create context data for all sections
 * 
 * @param fieldHierarchy Field hierarchy data
 * @returns Context data for all sections, keyed by section number
 */
export function processFieldHierarchy(fieldHierarchy: Record<string, any>): Record<number, any> {
  const sectionContexts: Record<number, any> = {};
  
  // Process each section
  Object.keys(sectionToFileMapping).forEach(sectionNumber => {
    const section = parseInt(sectionNumber, 10);
    sectionContexts[section] = createSectionContext(section, fieldHierarchy);
  });
  
  return sectionContexts;
}

/**
 * Extracts all unique field types from the field hierarchy
 * 
 * @param fieldHierarchy Field hierarchy data
 * @returns Array of unique field types
 */
export function extractFieldTypes(fieldHierarchy: FieldHierarchy): string[] {
  const fieldTypes = new Set<string>();
  
  Object.values(fieldHierarchy).forEach(form => {
    if (form.fields) {
      form.fields.forEach(field => {
        if (field.type) {
          fieldTypes.add(field.type);
        }
      });
    }
  });
  
  return Array.from(fieldTypes);
} 