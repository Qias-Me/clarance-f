import { type ApplicantFormValues } from '../../api/interfaces/formDefinition';
import { type FieldHierarchy, type FieldMetadata } from '../../api/interfaces/FieldMetadata';

// Define the section to context key mapping (hardcoded for now, should be imported properly)
// This should be replaced with the proper import when available
const SECTION_TO_CONTEXT_KEY: Record<number, string> = {
  1: 'personalInfo',
  2: 'birthInfo',
  3: 'placeOfBirth',
  4: 'aknowledgementInfo',
  5: 'namesInfo',
  6: 'physicalAttributes',
  7: 'contactInfo',
  8: 'passportInfo',
  9: 'citizenshipInfo',
  10: 'dualCitizenshipInfo',
  11: 'residencyInfo',
  12: 'schoolInfo',
  13: 'employmentInfo',
  14: 'serviceInfo',
  15: 'militaryHistoryInfo',
  16: 'peopleThatKnow',
  17: 'relationshipInfo',
  18: 'relativesInfo',
  19: 'foreignContacts',
  20: 'foreignActivities',
  21: 'mentalHealth',
  22: 'policeRecord',
  23: 'drugActivity',
  24: 'alcoholUse',
  25: 'investigationsInfo',
  26: 'finances',
  27: 'technology',
  28: 'civil',
  29: 'association',
  30: 'signature'
};

/**
 * Maps context values back to PDF field IDs for form submission
 * 
 * @param context The full context object with form values
 * @param fieldHierarchy The field hierarchy containing field metadata
 * @returns An object with PDF field IDs as keys and form values as values
 */
export function mapContextToPdfFields(
  context: ApplicantFormValues,
  fieldHierarchy: FieldHierarchy
): Record<string, string> {
  const result: Record<string, string> = {};
  
  if (!context || !fieldHierarchy) {
    console.warn('Invalid context or field hierarchy provided to mapContextToPdfFields');
    return result;
  }
  
  // Get all fields from the hierarchy
  const allFields = Object.values(fieldHierarchy)[0]?.fields || [];
  
  // Create a reverse mapping of section IDs to context keys
  const CONTEXT_KEY_TO_SECTION: Record<string, number> = {};
  Object.entries(SECTION_TO_CONTEXT_KEY).forEach(([sectionId, contextKey]) => {
    CONTEXT_KEY_TO_SECTION[contextKey] = parseInt(sectionId);
  });
  
  // Process each context section
  Object.entries(context).forEach(([contextKey, sectionData]) => {
    // Skip if section data is null or undefined
    if (!sectionData) return;
    
    // Get section ID from the context key
    const sectionId = CONTEXT_KEY_TO_SECTION[contextKey];
    
    if (sectionId) {
      // Map the section data to PDF fields
      mapSectionToPdfFields(sectionData, allFields, sectionId, result);
    }
  });
  
  return result;
}

/**
 * Maps a specific section of the context to PDF field IDs
 * 
 * @param sectionData The data for a specific context section
 * @param allFields All fields from the field hierarchy
 * @param sectionId The section ID for the current context section
 * @param result The result object to populate with mapped fields
 */
function mapSectionToPdfFields(
  sectionData: any,
  allFields: FieldMetadata[],
  sectionId: number,
  result: Record<string, string>
): void {
  // Get all fields for this section
  const sectionFields = allFields.filter(field => 
    (field.section && field.section.toString() === sectionId.toString()) ||
    (field.sectionName && getSectionNameFromId(sectionId) === field.sectionName)
  );
  
  if (!sectionFields || sectionFields.length === 0) {
    console.warn(`No fields found for section ${sectionId}`);
    return;
  }
  
  // Special handling for sections with dynamic entries
  if (hasDynamicEntries(sectionId)) {
    mapDynamicSectionToPdfFields(sectionData, sectionFields, sectionId, result);
    return;
  }
  
  // General mapping for flat or simple nested structures
  mapSimpleSectionToPdfFields(sectionData, sectionFields, result);
}

/**
 * Maps a simple (non-dynamic) section of the context to PDF field IDs
 * 
 * @param sectionData The data for a specific context section
 * @param sectionFields The fields for this section from the field hierarchy
 * @param result The result object to populate with mapped fields
 */
function mapSimpleSectionToPdfFields(
  sectionData: any,
  sectionFields: FieldMetadata[],
  result: Record<string, string>
): void {
  // Process a flat or simple nested object
  Object.entries(sectionData).forEach(([key, value]) => {
    // Skip fields without values
    if (value === null || value === undefined) return;
    
    // Handle nested objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      // For Field<T> objects with a value property
      if ('value' in value) {
        const fieldValue = value.value;
        if (fieldValue !== null && fieldValue !== undefined) {
          // Find the corresponding field in sectionFields
          const field = findFieldByContextKey(sectionFields, key);
          if (field && field.id) {
            result[addPdfSuffix(field.id.toString())] = fieldValue.toString();
          }
        }
      } else {
        // For nested objects (recursively process them)
        mapSimpleSectionToPdfFields(value, sectionFields, result);
      }
    } 
    // Handle simple values (strings, numbers, booleans)
    else if (!Array.isArray(value)) {
      // Find the corresponding field in sectionFields
      const field = findFieldByContextKey(sectionFields, key);
      if (field && field.id) {
        result[addPdfSuffix(field.id.toString())] = value.toString();
      }
    }
    // Handle arrays (might be array of Field<T> or other objects)
    else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        // For Field<T> objects with a value property
        if (typeof item === 'object' && 'value' in item) {
          const fieldValue = item.value;
          if (fieldValue !== null && fieldValue !== undefined) {
            // Find the corresponding field in sectionFields (usually with array index pattern)
            const field = findFieldByContextKeyAndIndex(sectionFields, key, index);
            if (field && field.id) {
              result[addPdfSuffix(field.id.toString())] = fieldValue.toString();
            }
          }
        } 
        // For complex objects in arrays
        else if (typeof item === 'object') {
          // Use a prefix to distinguish fields in the array
          const prefix = `${key}[${index}]`;
          mapNestedObjectToPdfFields(item, sectionFields, result, prefix);
        }
      });
    }
  });
}

/**
 * Maps a dynamic section (with entries array) of the context to PDF field IDs
 * 
 * @param sectionData The data for a specific context section
 * @param sectionFields The fields for this section from the field hierarchy
 * @param sectionId The section ID for the current context section
 * @param result The result object to populate with mapped fields
 */
function mapDynamicSectionToPdfFields(
  sectionData: any,
  sectionFields: FieldMetadata[],
  sectionId: number,
  result: Record<string, string>
): void {
  // Check if the section has an entries array
  if (sectionData.entries && Array.isArray(sectionData.entries)) {
    // Map each entry in the array
    sectionData.entries.forEach((entry: any, index: number) => {
      // Get fields for this entry based on the pattern
      const entryFields = getFieldsForDynamicEntry(sectionFields, sectionId, index);
      
      // Map this entry to PDF fields
      mapDynamicEntryToPdfFields(entry, entryFields, result, index);
    });
  }
  
  // Also map any top-level fields in the section
  const topLevelFields = { ...sectionData };
  delete topLevelFields.entries; // Remove entries to avoid double-mapping
  
  // Map the remaining top-level fields
  mapSimpleSectionToPdfFields(topLevelFields, sectionFields, result);
}

/**
 * Maps a single dynamic entry to PDF field IDs
 * 
 * @param entry The entry data
 * @param entryFields The fields for this entry from the field hierarchy
 * @param result The result object to populate with mapped fields
 * @param entryIndex The index of this entry in the entries array
 */
function mapDynamicEntryToPdfFields(
  entry: any,
  entryFields: FieldMetadata[],
  result: Record<string, string>,
  entryIndex: number
): void {
  // Process the entry object
  Object.entries(entry).forEach(([key, value]) => {
    // Skip fields without values
    if (value === null || value === undefined) return;
    
    // Handle nested objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      // For Field<T> objects with a value property
      if ('value' in value) {
        const fieldValue = value.value;
        if (fieldValue !== null && fieldValue !== undefined) {
          // Find the corresponding field for this entry
          const field = findFieldByEntryKeyAndIndex(entryFields, key, entryIndex);
          if (field && field.id) {
            result[addPdfSuffix(field.id.toString())] = fieldValue.toString();
          }
        }
      } else {
        // For nested objects, use a prefix for the keys
        const prefix = `entry[${entryIndex}].${key}`;
        mapNestedObjectToPdfFields(value, entryFields, result, prefix);
      }
    } 
    // Handle simple values
    else if (!Array.isArray(value)) {
      // Find the corresponding field for this entry
      const field = findFieldByEntryKeyAndIndex(entryFields, key, entryIndex);
      if (field && field.id) {
        result[addPdfSuffix(field.id.toString())] = value.toString();
      }
    }
    // Handle arrays within an entry
    else if (Array.isArray(value)) {
      value.forEach((item, itemIndex) => {
        // For Field<T> objects with a value property
        if (typeof item === 'object' && 'value' in item) {
          const fieldValue = item.value;
          if (fieldValue !== null && fieldValue !== undefined) {
            // Find the corresponding field for this nested array item
            const field = findFieldByEntryArrayItemAndIndex(entryFields, key, entryIndex, itemIndex);
            if (field && field.id) {
              result[addPdfSuffix(field.id.toString())] = fieldValue.toString();
            }
          }
        } 
        // For complex objects in arrays
        else if (typeof item === 'object') {
          // Use a prefix for nested arrays within entries
          const prefix = `entry[${entryIndex}].${key}[${itemIndex}]`;
          mapNestedObjectToPdfFields(item, entryFields, result, prefix);
        }
      });
    }
  });
}

/**
 * Maps a nested object to PDF field IDs
 * 
 * @param obj The nested object to map
 * @param fields The fields for the parent section
 * @param result The result object to populate with mapped fields
 * @param prefix A prefix to use for key matching, helpful for array items
 */
function mapNestedObjectToPdfFields(
  obj: any,
  fields: FieldMetadata[],
  result: Record<string, string>,
  prefix: string = ''
): void {
  // Process the nested object
  Object.entries(obj).forEach(([key, value]) => {
    // Skip fields without values
    if (value === null || value === undefined) return;
    
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    // Handle nested objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      // For Field<T> objects with a value property
      if ('value' in value) {
        const fieldValue = value.value;
        if (fieldValue !== null && fieldValue !== undefined) {
          // Find the corresponding field using the prefixed key
          const field = findFieldByNestedKey(fields, fullKey);
          if (field && field.id) {
            result[addPdfSuffix(field.id.toString())] = fieldValue.toString();
          }
        }
      } else {
        // Recursively process deeper nested objects
        mapNestedObjectToPdfFields(value, fields, result, fullKey);
      }
    } 
    // Handle simple values
    else if (!Array.isArray(value)) {
      // Find the corresponding field using the prefixed key
      const field = findFieldByNestedKey(fields, fullKey);
      if (field && field.id) {
        result[addPdfSuffix(field.id.toString())] = value.toString();
      }
    }
    // Handle arrays in nested objects
    else if (Array.isArray(value)) {
      value.forEach((item, itemIndex) => {
        // For Field<T> objects with a value property
        if (typeof item === 'object' && 'value' in item) {
          const fieldValue = item.value;
          if (fieldValue !== null && fieldValue !== undefined) {
            // Find the corresponding field using array notation
            const arrayKey = `${fullKey}[${itemIndex}]`;
            const field = findFieldByNestedKey(fields, arrayKey);
            if (field && field.id) {
              result[addPdfSuffix(field.id.toString())] = fieldValue.toString();
            }
          }
        } 
        // For complex objects in arrays
        else if (typeof item === 'object') {
          // Use array notation in the prefix
          const arrayPrefix = `${fullKey}[${itemIndex}]`;
          mapNestedObjectToPdfFields(item, fields, result, arrayPrefix);
        }
      });
    }
  });
}

/**
 * Determines if a section has dynamic entries based on section ID
 * 
 * @param sectionId The section ID to check
 * @returns True if the section has dynamic entries, false otherwise
 */
function hasDynamicEntries(sectionId: number): boolean {
  // Sections with dynamic entries (entries array)
  const dynamicSections = [5, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29];
  return dynamicSections.includes(sectionId);
}

/**
 * Gets fields for a specific entry in a dynamic section
 * 
 * @param fields All fields for the section
 * @param sectionId The section ID
 * @param entryIndex The index of the entry
 * @returns Fields that correspond to the entry
 */
function getFieldsForDynamicEntry(
  fields: FieldMetadata[],
  sectionId: number,
  entryIndex: number
): FieldMetadata[] {
  // Look for custom properties that might contain entry index information
  // Note: Since metadata property isn't in the interface, we'll use pattern matching on names
  
  // Try to find fields with array index pattern in name
  const fieldsWithArrayPattern = fields.filter(field => {
    const fieldName = field.name || '';
    return fieldName.match(new RegExp(`entries\\[${entryIndex}\\]`)) ||
           fieldName.match(new RegExp(`entry\\[${entryIndex}\\]`)) ||
           fieldName.match(new RegExp(`\\[${entryIndex}\\]`));
  });
  
  if (fieldsWithArrayPattern.length > 0) {
    return fieldsWithArrayPattern;
  }
  
  // Fallback to subsection approach if the entry index might be a subsection
  const subsectionIndex = entryIndex + 1; // Often form sections are 1-indexed
  return fields.filter(field => {
    const subsection = field.subsection;
    return subsection === subsectionIndex && field.section === sectionId;
  });
}

/**
 * Finds a field by context key
 * 
 * @param fields The fields to search in
 * @param key The context key to match
 * @returns The matching field or null if not found
 */
function findFieldByContextKey(fields: FieldMetadata[], key: string): FieldMetadata | null {
  // Try exact name match
  const exactMatch = fields.find(field => 
    (field.name && field.name.toLowerCase() === key.toLowerCase()) ||
    (field.label && field.label.toLowerCase() === key.toLowerCase())
  );
  
  if (exactMatch) return exactMatch;
  
  // Try partial match based on field label or name
  const partialMatch = fields.find(field => {
    const fieldName = field.name?.toLowerCase() || '';
    const fieldLabel = field.label?.toLowerCase() || '';
    const searchKey = key.toLowerCase();
    
    return fieldName.includes(searchKey) || 
           searchKey.includes(fieldName) ||
           fieldLabel.includes(searchKey) ||
           searchKey.includes(fieldLabel);
  });
  
  return partialMatch || null;
}

/**
 * Finds a field by context key and array index
 * 
 * @param fields The fields to search in
 * @param key The context key to match
 * @param index The array index to match
 * @returns The matching field or null if not found
 */
function findFieldByContextKeyAndIndex(
  fields: FieldMetadata[],
  key: string,
  index: number
): FieldMetadata | null {
  // Try to find by array pattern in name
  const arrayMatch = fields.find(field => {
    const fieldName = field.name?.toLowerCase() || '';
    const searchKey = key.toLowerCase();
    
    return fieldName.match(new RegExp(`${searchKey}\\[${index}\\]`)) ||
           fieldName.match(new RegExp(`${searchKey}_${index}`));
  });
  
  if (arrayMatch) return arrayMatch;
  
  // Try to find fields that might contain array indices in their names
  const heuristicMatch = fields.find(field => {
    const fieldName = field.name?.toLowerCase() || '';
    const searchKey = key.toLowerCase();
    
    return fieldName.includes(searchKey) && 
           (fieldName.includes(`[${index}]`) || 
            fieldName.includes(`_${index}`));
  });
  
  return heuristicMatch || null;
}

/**
 * Finds a field by entry key and index
 * 
 * @param fields The fields to search in
 * @param key The entry key to match
 * @param entryIndex The entry index to match
 * @returns The matching field or null if not found
 */
function findFieldByEntryKeyAndIndex(
  fields: FieldMetadata[],
  key: string,
  entryIndex: number
): FieldMetadata | null {
  // Try to find by entry pattern in name
  const entryMatch = fields.find(field => {
    const fieldName = field.name?.toLowerCase() || '';
    const searchKey = key.toLowerCase();
    
    return fieldName.match(new RegExp(`entries\\[${entryIndex}\\]\\.${searchKey}`)) ||
           fieldName.match(new RegExp(`entry\\[${entryIndex}\\]\\.${searchKey}`)) ||
           fieldName.match(new RegExp(`entry_${entryIndex}_${searchKey}`));
  });
  
  if (entryMatch) return entryMatch;
  
  // Since we can't use metadata directly, try using other heuristics
  // For example, check if the field name contains both the key and the entry index
  const heuristicMatch = fields.find(field => {
    const fieldName = field.name?.toLowerCase() || '';
    const searchKey = key.toLowerCase();
    
    return fieldName.includes(searchKey) && 
           (fieldName.includes(`[${entryIndex}]`) || 
            fieldName.includes(`_${entryIndex}_`));
  });
  
  if (heuristicMatch) return heuristicMatch;
  
  // Fallback to general field match for this key
  return findFieldByContextKey(fields, key);
}

/**
 * Finds a field by entry array item and indices
 * 
 * @param fields The fields to search in
 * @param key The array key to match
 * @param entryIndex The entry index to match
 * @param itemIndex The item index within the array to match
 * @returns The matching field or null if not found
 */
function findFieldByEntryArrayItemAndIndex(
  fields: FieldMetadata[],
  key: string,
  entryIndex: number,
  itemIndex: number
): FieldMetadata | null {
  // Try to find by nested array pattern in name
  const nestedArrayMatch = fields.find(field => {
    const fieldName = field.name?.toLowerCase() || '';
    const searchKey = key.toLowerCase();
    
    return fieldName.match(new RegExp(`entries\\[${entryIndex}\\]\\.${searchKey}\\[${itemIndex}\\]`)) ||
           fieldName.match(new RegExp(`entry\\[${entryIndex}\\]\\.${searchKey}\\[${itemIndex}\\]`)) ||
           fieldName.match(new RegExp(`entry_${entryIndex}_${searchKey}_${itemIndex}`));
  });
  
  if (nestedArrayMatch) return nestedArrayMatch;
  
  // Use name pattern matching instead of metadata
  const patternMatch = fields.find(field => {
    const fieldName = field.name?.toLowerCase() || '';
    const searchKey = key.toLowerCase();
    
    return fieldName.includes(searchKey) && 
           fieldName.includes(`[${entryIndex}]`) && 
           fieldName.includes(`[${itemIndex}]`);
  });
  
  return patternMatch || null;
}

/**
 * Finds a field by nested key (dot notation)
 * 
 * @param fields The fields to search in
 * @param key The nested key to match (using dot notation)
 * @returns The matching field or null if not found
 */
function findFieldByNestedKey(fields: FieldMetadata[], key: string): FieldMetadata | null {
  // Try to find by exact key match
  const exactMatch = fields.find(field => 
    field.name?.toLowerCase() === key.toLowerCase() ||
    field.label?.toLowerCase() === key.toLowerCase()
  );
  
  if (exactMatch) return exactMatch;
  
  // Try to find by key pattern
  // Convert dot notation to pattern: address.city -> address_city or address_0_city
  const keyPattern = key.replace(/\./g, '_').replace(/\[(\d+)\]/g, '_$1');
  
  const patternMatch = fields.find(field => {
    const fieldName = field.name?.toLowerCase() || '';
    const fieldLabel = field.label?.toLowerCase() || '';
    
    return fieldName.includes(keyPattern.toLowerCase()) ||
           fieldLabel.includes(keyPattern.toLowerCase());
  });
  
  return patternMatch || null;
}

/**
 * Gets a section name from its ID
 * 
 * @param sectionId The section ID
 * @returns The section name
 */
function getSectionNameFromId(sectionId: number): string {
  // Map section IDs to names
  const sectionNames: Record<number, string> = {
    1: 'Personal Information',
    2: 'Date of Birth',
    3: 'Place of Birth',
    4: 'Acknowledgement',
    5: 'Other Names',
    6: 'Physical Attributes',
    7: 'Contact Information',
    8: 'Passport Information',
    9: 'Citizenship',
    10: 'Dual/Multiple Citizenship',
    11: 'Residency',
    12: 'Education',
    13: 'Employment',
    14: 'Selective Service',
    15: 'Military History',
    16: 'People That Know You',
    17: 'Marital Status',
    18: 'Relatives',
    19: 'Foreign Contacts',
    20: 'Foreign Activities',
    21: 'Psychological and Emotional Health',
    22: 'Police Record',
    23: 'Illegal Drugs',
    24: 'Use of Alcohol',
    25: 'Investigations and Clearance Record',
    26: 'Financial Record',
    27: 'Use of Information Technology Systems',
    28: 'Involvement in Non-Criminal Court Actions',
    29: 'Association Record',
    30: 'Signature'
  };
  
  return sectionNames[sectionId] || `Section ${sectionId}`;
}

/**
 * Adds PDF suffix to field ID if needed
 * 
 * @param fieldId The field ID
 * @returns The field ID with PDF suffix if needed
 */
function addPdfSuffix(fieldId: string): string {
  // Check if the fieldId already has the PDF suffix
  if (fieldId.endsWith(' 0 R')) {
    return fieldId;
  }
  
  // Add the PDF suffix
  return `${fieldId} 0 R`;
} 