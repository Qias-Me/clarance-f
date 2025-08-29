/**
 * Section 13 Field Initializer
 * Creates comprehensive initial state with all 1086 fields properly initialized
 */

import type { Field, FieldWithOptions } from '../../api/interfaces/formDefinition2.0';
import { SECTION_13_ALL_FIELDS } from '../data/section13-complete-fields.js';
import { set, get } from 'lodash';

/**
 * Creates a Field<T> structure for any value
 */
const createField = <T = any>(
  value: T,
  id: string,
  type: string = 'PDFTextField',
  label: string = ''
): Field<T> => ({
  id,
  value,
  label,
  name: id.split('.').pop() || id,
  type,
  required: false,
  section: 13,
  rect: { x: 0, y: 0, width: 0, height: 0 }
});

/**
 * Initializes all fields from the mapping file into the data structure
 * Ensures all 1086 fields are properly created with Field<T> wrappers
 */
export const initializeAllSection13Fields = (baseData: any): any => {
  const data = { ...baseData };
  
  // Process each field from the mapping
  SECTION_13_ALL_FIELDS.forEach(fieldDef => {
    const { uiPath, fieldType, label, pdfFieldId } = fieldDef;
    
    // Skip if no UI path
    if (!uiPath) return;
    
    // Determine the initial value based on field type
    let initialValue: any;
    switch (fieldType) {
      case 'checkbox':
        initialValue = false;
        break;
      case 'radio':
      case 'select':
        initialValue = '';
        break;
      case 'text':
      default:
        initialValue = '';
        break;
    }
    
    // Create the field structure
    const field = createField(initialValue, uiPath, fieldType, label || '');
    
    // Parse the path to handle nested structures
    const pathSegments = uiPath.split('.');
    let currentPath = '';
    let parentObj = data;
    
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath = currentPath ? `${currentPath}.${segment}` : segment;
      
      // Handle array notation like entries[0]
      if (segment.includes('[')) {
        const match = segment.match(/^(.+)\[(\d+)\]$/);
        if (match) {
          const [, arrayName, indexStr] = match;
          const index = parseInt(indexStr, 10);
          
          // Ensure array exists
          if (!parentObj[arrayName]) {
            parentObj[arrayName] = [];
          }
          
          // Ensure array has enough entries
          while (parentObj[arrayName].length <= index) {
            parentObj[arrayName].push({});
          }
          
          // Move to the array element for next iteration
          if (i < pathSegments.length - 1) {
            parentObj = parentObj[arrayName][index];
          } else {
            // This is the final segment - set the field
            parentObj[arrayName][index] = field;
          }
        }
      } else {
        // Regular property
        if (i < pathSegments.length - 1) {
          // Not the final segment - ensure object exists
          if (!parentObj[segment]) {
            parentObj[segment] = {};
          }
          parentObj = parentObj[segment];
        } else {
          // Final segment - set the field
          parentObj[segment] = field;
        }
      }
    }
  });
  
  return data;
};

/**
 * Gets all unique entry indices from field paths
 * Returns a map of entry types to their maximum indices
 */
export const getRequiredEntryIndices = (): Record<string, number> => {
  const indices: Record<string, number> = {
    militaryEmployment: -1,
    nonFederalEmployment: -1,
    selfEmployment: -1,
    unemployment: -1,
    federalInfo: -1
  };
  
  SECTION_13_ALL_FIELDS.forEach(field => {
    const { uiPath } = field;
    if (!uiPath) return;
    
    // Check for each employment type
    Object.keys(indices).forEach(type => {
      if (uiPath.includes(`${type}.entries[`)) {
        const match = uiPath.match(new RegExp(`${type}\\.entries\\[(\\d+)\\]`));
        if (match) {
          const index = parseInt(match[1], 10);
          indices[type] = Math.max(indices[type], index);
        }
      }
    });
  });
  
  return indices;
};

/**
 * Creates empty entry structures for each employment type
 * based on the maximum indices found in the field mappings
 */
export const createEmptyEntries = () => {
  const indices = getRequiredEntryIndices();
  const entries: Record<string, any[]> = {};
  
  Object.entries(indices).forEach(([type, maxIndex]) => {
    entries[type] = [];
    for (let i = 0; i <= maxIndex; i++) {
      entries[type].push({
        _id: `${type}-${i}`,
        // Basic structure - will be populated by field initializer
      });
    }
  });
  
  return entries;
};

/**
 * Ensures all paths in the data structure exist
 * Creates nested objects/arrays as needed
 */
export const ensurePathExists = (data: any, path: string): void => {
  const segments = path.split('.');
  let current = data;
  
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    
    // Handle array notation
    if (segment.includes('[')) {
      const match = segment.match(/^(.+)\[(\d+)\]$/);
      if (match) {
        const [, arrayName, indexStr] = match;
        const index = parseInt(indexStr, 10);
        
        if (!current[arrayName]) {
          current[arrayName] = [];
        }
        
        while (current[arrayName].length <= index) {
          current[arrayName].push({});
        }
        
        current = current[arrayName][index];
      }
    } else {
      if (!current[segment]) {
        current[segment] = {};
      }
      current = current[segment];
    }
  }
};

/**
 * Validates that all required fields exist in the data structure
 */
export const validateFieldCoverage = (data: any): {
  total: number;
  found: number;
  missing: string[];
} => {
  const missing: string[] = [];
  let found = 0;
  
  SECTION_13_ALL_FIELDS.forEach(field => {
    const { uiPath } = field;
    if (!uiPath) return;
    
    const value = get(data, uiPath);
    if (value !== undefined) {
      found++;
    } else {
      missing.push(uiPath);
    }
  });
  
  return {
    total: SECTION_13_ALL_FIELDS.length,
    found,
    missing
  };
};