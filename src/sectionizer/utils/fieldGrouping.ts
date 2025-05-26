/**
 * Field Grouping Utilities
 * 
 * Consolidated functions for grouping fields by section, subsection, and other criteria.
 * This replaces multiple implementations found throughout the codebase.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Base field interface that all grouped fields conform to
 */
export interface BaseField {
  name: string;
  id?: string;
  [key: string]: any;
}

/**
 * Field with section information
 */
export interface SectionedField extends BaseField {
  section: number; // Section number (1-30)
  subsection?: string; // Subsection identifier (e.g., "A", "B", "C")
  entry?: number; // Entry index within subsection
  confidence?: number; // Confidence score of categorization (0-1)
}

/**
 * Options for groupFieldsBySection function
 */
export interface GroupFieldsOptions {
  /**
   * Whether to save uncategorized fields to unknown.json
   */
  saveUnknown?: boolean;
  
  /**
   * Directory to save unknown fields to (if saveUnknown is true)
   */
  outputDir?: string;
  
  /**
   * Return type format: 'record' returns Record<string, T[]>, 'map' returns Map<number, T[]>
   */
  returnType?: 'record' | 'map';
  
  /**
   * Whether section keys in record should be strings (default) or numbers
   */
  numberKeys?: boolean;
  
  /**
   * Whether to deduplicate fields based on ID or name
   */
  deduplicate?: boolean;
}

/**
 * Group fields by section number
 * 
 * @typeParam T - Field type, must extend SectionedField
 * @param fields - Array of fields to group
 * @param options - Grouping options
 * @returns Promise resolving to grouped fields (Record or Map based on options)
 */
export async function groupFieldsBySection<T extends SectionedField>(
  fields: T[],
  options: GroupFieldsOptions = {}
): Promise<Record<string, T[]> | Map<number, T[]>> {
  const {
    saveUnknown = false,
    outputDir = process.cwd(),
    returnType = 'record',
    numberKeys = false,
    deduplicate = true
  } = options;
  
  // Initialize section containers based on return type
  let sectionFields: Record<string, T[]> = {};
  let sectionMap = new Map<number, T[]>();
  
  // Initialize section arrays with empty arrays for sections 0-30
  if (returnType === 'record') {
    for (let i = 0; i <= 30; i++) {
      sectionFields[i.toString()] = [];
    }
  }
  
  // Track field IDs to avoid duplication if requested
  const processedFieldIds = deduplicate ? new Set<string>() : new Set();
  
  // First prioritize fields with sections > 0
  fields
    .filter((field) => field.section > 0)
    .forEach((field) => {
      // Skip if we're deduplicating and this field has been processed
      if (deduplicate) {
        const fieldId = field.id || field.name || JSON.stringify(field);
        if (processedFieldIds.has(fieldId)) {
          return;
        }
        processedFieldIds.add(fieldId);
      }
      
      // Add to appropriate container based on return type
      if (returnType === 'map') {
        if (!sectionMap.has(field.section)) {
          sectionMap.set(field.section, []);
        }
        sectionMap.get(field.section)?.push(field);
      } else {
        // Record type
        const sectionKey = field.section.toString();
        if (!sectionFields[sectionKey]) {
          sectionFields[sectionKey] = [];
        }
        sectionFields[sectionKey].push(field);
      }
    });
  
  // Now handle fields with section 0 (uncategorized)
  fields
    .filter((field) => field.section === 0 || field.section === undefined)
    .forEach((field) => {
      // Skip if we're deduplicating and this field has been processed
      if (deduplicate) {
        const fieldId = field.id || field.name || JSON.stringify(field);
        if (processedFieldIds.has(fieldId)) {
          return;
        }
        processedFieldIds.add(fieldId);
      }
      
      const sectionZeroField = { ...field, section: 0 } as T;
      
      // Add to appropriate container based on return type
      if (returnType === 'map') {
        if (!sectionMap.has(0)) {
          sectionMap.set(0, []);
        }
        sectionMap.get(0)?.push(sectionZeroField);
      } else {
        // Record type
        sectionFields["0"].push(sectionZeroField);
      }
    });
  
  // Log stats
  const totalFields = deduplicate ? processedFieldIds.size : fields.length;
  const sectionCount = returnType === 'map' ? sectionMap.size : Object.keys(sectionFields).length;

  console.log(`Grouped ${totalFields} ${deduplicate ? 'unique ' : ''}fields into ${sectionCount - 1} sections`);
  
  // Save unknown fields if requested and there are any
  if (saveUnknown) {
    const unknownFields = returnType === 'map' 
      ? sectionMap.get(0) || []
      : sectionFields["0"];
      
    if (unknownFields.length > 0) {
      const unknownPath = path.join(outputDir, 'unknown.json');
      await fs.promises.writeFile(
        unknownPath,
        JSON.stringify(unknownFields, null, 2),
        'utf8'
      );
      console.log(`Saved ${unknownFields.length} unknown fields to ${unknownPath}`);
    }
  }
  
  // Convert keys to numbers if requested and we're returning a record
  if (returnType === 'record' && numberKeys) {
    const numericSectionFields: Record<number, T[]> = {};
    for (const [sectionStr, fields] of Object.entries(sectionFields)) {
      numericSectionFields[parseInt(sectionStr, 10)] = fields;
    }
    return numericSectionFields as any;
  }
  
  // Return the appropriate container based on returnType
  return returnType === 'map' ? sectionMap : sectionFields;
}

/**
 * Group fields by subsection within each section
 * 
 * @typeParam T - Field type, must extend SectionedField
 * @param fields - Array of fields to group
 * @returns Promise resolving to record mapping section numbers to records mapping subsection names to arrays of fields
 */
export async function groupFieldsBySubsection<T extends SectionedField>(
  fields: T[]
): Promise<Record<number, Record<string, T[]>>> {
  const result: Record<number, Record<string, T[]>> = {};
  
  // First group by section
  const sectionGroups = await groupFieldsBySection(fields, { 
    returnType: 'record',
    numberKeys: true,
    deduplicate: true,
    saveUnknown: false
  }) as Record<number, T[]>;
  
  // Then group each section by subsection
  for (const [sectionStr, sectionFields] of Object.entries(sectionGroups)) {
    const sectionNum = parseInt(sectionStr, 10);
    if (isNaN(sectionNum)) continue;
    
    result[sectionNum] = {};
    
    // Group this section's fields by subsection
    for (const field of sectionFields) {
      const subsection = field.subsection || 'default';
      if (!result[sectionNum][subsection]) {
        result[sectionNum][subsection] = [];
      }
      result[sectionNum][subsection].push(field);
    }
  }
  
  return result;
}

/**
 * Group fields by entry within each subsection
 * 
 * @typeParam T - Field type, must extend SectionedField
 * @param fields - Array of fields to group
 * @returns Promise resolving to nested record mapping section to subsection to entry to fields
 */
export async function groupFieldsByEntry<T extends SectionedField>(
  fields: T[]
): Promise<Record<number, Record<string, Record<number, T[]>>>> {
  const result: Record<number, Record<string, Record<number, T[]>>> = {};
  
  // First group by section and subsection
  const subsectionGroups = await groupFieldsBySubsection(fields);
  
  // Then group each subsection by entry
  for (const [sectionStr, subsections] of Object.entries(subsectionGroups)) {
    const sectionNum = parseInt(sectionStr, 10);
    if (isNaN(sectionNum)) continue;
    
    result[sectionNum] = {};
    
    // Process each subsection
    for (const [subsectionName, subsectionFields] of Object.entries(subsections)) {
      result[sectionNum][subsectionName] = {};
      
      // Group by entry
      for (const field of subsectionFields) {
        const entry = field.entry || 0;
        if (!result[sectionNum][subsectionName][entry]) {
          result[sectionNum][subsectionName][entry] = [];
        }
        result[sectionNum][subsectionName][entry].push(field);
      }
    }
  }
  
  return result;
} 