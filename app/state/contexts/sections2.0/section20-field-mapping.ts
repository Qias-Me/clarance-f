/**
 * Section 20 Field Mapping Utilities
 *
 * This module provides field mapping functionality for Section 20 (Foreign Activities)
 * based on the sections-references/section-20.json data. It follows the Section 29 pattern
 * for consistent field resolution and PDF field ID mapping.
 */

import sectionsReferencesData from '../../../../../api/sections-references/section-20.json';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface FieldReference {
  name: string;
  id: string;
  type: string;
  label: string;
  rect?: { x: number; y: number; width: number; height: number };
  value?: any;
}

export type SubsectionPattern = 'Section20a[0]' | 'Section20a2[0]';

// ============================================================================
// FIELD MAPPING CACHE
// ============================================================================

let fieldMappingCache: Record<string, FieldReference[]> | null = null;
let numericIdCache: Record<string, string> | null = null;

/**
 * Initialize field mapping cache from sections-references data
 */
const initializeFieldMapping = (): void => {
  if (fieldMappingCache) return;

  fieldMappingCache = {};
  numericIdCache = {};

  // Process the sections-references data
  const data = sectionsReferencesData as any;
  
  // Extract all fields from the JSON structure
  const processFields = (obj: any, prefix: string = '') => {
    if (!obj || typeof obj !== 'object') return;

    Object.entries(obj).forEach(([key, value]) => {
      if (key === 'fields' && Array.isArray(value)) {
        // This is a fields array
        value.forEach((field: any) => {
          if (field.name && field.id) {
            const fieldRef: FieldReference = {
              name: field.name,
              id: field.id,
              type: field.type || 'text',
              label: field.label || field.name,
              rect: field.rect,
              value: field.value
            };

            // Determine subsection pattern from field name
            let subsectionPattern: string = 'unknown';
            if (field.name.includes('Section20a[0]')) {
              subsectionPattern = 'Section20a[0]';
            } else if (field.name.includes('Section20a2[0]')) {
              subsectionPattern = 'Section20a2[0]';
            }

            // Add to cache
            if (!fieldMappingCache![subsectionPattern]) {
              fieldMappingCache![subsectionPattern] = [];
            }
            fieldMappingCache![subsectionPattern].push(fieldRef);

            // Add to numeric ID cache
            numericIdCache![field.name] = field.id;
          }
        });
      } else if (typeof value === 'object') {
        // Recurse into nested objects
        processFields(value, prefix ? `${prefix}.${key}` : key);
      }
    });
  };

  processFields(data);

  console.log('🔍 Section20 Field Mapping Cache initialized:', {
    totalSubsections: Object.keys(fieldMappingCache).length,
    fieldCounts: Object.entries(fieldMappingCache).map(([key, fields]) => ({
      subsection: key,
      count: fields.length
    }))
  });
};

// ============================================================================
// SUBSECTION PATTERN MAPPING
// ============================================================================

/**
 * Maps subsection keys to their PDF field patterns
 */
export const getSubsectionPattern = (subsectionKey: string, entryIndex: number): SubsectionPattern => {
  // Based on section-20.json analysis:
  // - Section20a[0]: Main foreign financial interests (Entry #1)
  // - Section20a2[0]: Second foreign financial interests (Entry #2)
  
  if (subsectionKey === 'foreignFinancialInterests') {
    return entryIndex === 0 ? 'Section20a[0]' : 'Section20a2[0]';
  }
  
  // For other subsections, use Section20a2 pattern
  return 'Section20a2[0]';
};

// ============================================================================
// FIELD LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get field by subsection pattern and field type
 */
export const getFieldBySubsectionAndType = (
  subsectionPattern: string,
  fieldType: string,
  entryIndex: number,
  subsectionKey?: string
): FieldReference | null => {
  initializeFieldMapping();

  if (!fieldMappingCache![subsectionPattern]) {
    console.warn(`⚠️ No fields found for subsection pattern: ${subsectionPattern}`);
    return null;
  }

  const fields = fieldMappingCache![subsectionPattern];

  // Try to find field by type and pattern matching
  const candidates = fields.filter(field => {
    const fieldName = field.name.toLowerCase();
    const fieldTypeKey = fieldType.toLowerCase();

    // Map field types to PDF field patterns
    if (fieldTypeKey.includes('radio') || fieldTypeKey === 'hasforeignfinancialinterests') {
      return fieldName.includes('radiobuttonlist');
    }
    if (fieldTypeKey.includes('text') || fieldTypeKey.includes('name') || fieldTypeKey.includes('description')) {
      return fieldName.includes('textfield11');
    }
    if (fieldTypeKey.includes('numeric') || fieldTypeKey.includes('cost') || fieldTypeKey.includes('value')) {
      return fieldName.includes('numericfield1');
    }
    if (fieldTypeKey.includes('date')) {
      return fieldName.includes('from_datefield_name_2');
    }
    if (fieldTypeKey.includes('dropdown') || fieldTypeKey.includes('country')) {
      return fieldName.includes('dropdownlist');
    }
    if (fieldTypeKey.includes('checkbox') || fieldTypeKey.includes('field')) {
      return fieldName.includes('#field');
    }

    return false;
  });

  if (candidates.length > 0) {
    // Return the first candidate for now
    // In a more sophisticated implementation, we'd match by index
    return candidates[0];
  }

  console.warn(`⚠️ No field found for type "${fieldType}" in subsection "${subsectionPattern}"`);
  return null;
};

/**
 * Get numeric field ID from field name
 */
export const getNumericFieldId = (fieldName: string): string | null => {
  initializeFieldMapping();

  if (numericIdCache![fieldName]) {
    return numericIdCache![fieldName];
  }

  console.warn(`⚠️ No numeric ID found for field: ${fieldName}`);
  return null;
};

/**
 * Get field suggestions for debugging
 */
export const getFieldSuggestions = (fieldType: string): string[] => {
  initializeFieldMapping();

  const allFields: FieldReference[] = [];
  Object.values(fieldMappingCache!).forEach(fields => {
    allFields.push(...fields);
  });

  // Return first 5 field names as suggestions
  return allFields.slice(0, 5).map(field => field.name);
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate that all expected subsection patterns exist
 */
export const validateSubsectionPatterns = (): boolean => {
  initializeFieldMapping();

  const expectedPatterns = ['Section20a[0]', 'Section20a2[0]'];
  const missingPatterns = expectedPatterns.filter(pattern => !fieldMappingCache![pattern]);

  if (missingPatterns.length > 0) {
    console.error(`❌ Missing subsection patterns: ${missingPatterns.join(', ')}`);
    return false;
  }

  console.log('✅ All expected subsection patterns found');
  return true;
};

/**
 * Get total field count across all subsections
 */
export const getTotalFieldCount = (): number => {
  initializeFieldMapping();

  let total = 0;
  Object.values(fieldMappingCache!).forEach(fields => {
    total += fields.length;
  });

  return total;
};
