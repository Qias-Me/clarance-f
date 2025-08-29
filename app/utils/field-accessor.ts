/**
 * Field Accessor Utility
 * 
 * Type-safe field access utility for form sections.
 * Replaces repetitive if-else chains with a more maintainable approach.
 */

import { type Field } from '../../api/interfaces/formDefinition2.0';

/**
 * Generic field accessor type
 */
export type FieldAccessor<T> = {
  get: (fieldPath: string) => string | boolean | number | undefined;
  set: (fieldPath: string, value: string | boolean | number) => void;
  getField: (fieldPath: string) => Field<any> | undefined;
  exists: (fieldPath: string) => boolean;
};

/**
 * Field mapping configuration
 */
export interface FieldMapping<T> {
  path: string;
  getter: (data: T) => Field<any> | undefined;
  setter?: (data: T, value: string | boolean | number) => void;
}

/**
 * Creates a type-safe field accessor for a section
 */
export function createFieldAccessor<T>(
  data: T,
  mappings: Record<string, FieldMapping<T>>,
  updateFunction?: (path: string, value: string | boolean | number) => void
): FieldAccessor<T> {
  return {
    get: (fieldPath: string): string | boolean | number | undefined => {
      const mapping = mappings[fieldPath];
      if (!mapping) return undefined;
      
      const field = mapping.getter(data);
      return field?.value;
    },

    set: (fieldPath: string, value: string | boolean | number): void => {
      if (!updateFunction) {
        throw new Error('Update function not provided');
      }
      
      const mapping = mappings[fieldPath];
      if (!mapping) {
        throw new Error(`Field path "${fieldPath}" not found in mappings`);
      }
      
      if (mapping.setter) {
        mapping.setter(data, value);
      } else {
        updateFunction(fieldPath, value);
      }
    },

    getField: (fieldPath: string): Field<any> | undefined => {
      const mapping = mappings[fieldPath];
      if (!mapping) return undefined;
      
      return mapping.getter(data);
    },

    exists: (fieldPath: string): boolean => {
      return fieldPath in mappings;
    }
  };
}

/**
 * Creates field mappings from a nested object structure
 */
export function createFieldMappingsFromObject<T extends Record<string, any>>(
  obj: T,
  basePath = ''
): Record<string, FieldMapping<T>> {
  const mappings: Record<string, FieldMapping<T>> = {};

  Object.keys(obj).forEach(key => {
    const fullPath = basePath ? `${basePath}.${key}` : key;
    const value = obj[key];

    if (value && typeof value === 'object' && 'value' in value) {
      // This is a field
      mappings[fullPath] = {
        path: fullPath,
        getter: (data: T) => {
          const parts = fullPath.split('.');
          let current: any = data;
          for (const part of parts) {
            current = current?.[part];
            if (!current) return undefined;
          }
          return current;
        }
      };
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively process nested objects
      const nestedMappings = createFieldMappingsFromObject(value, fullPath);
      Object.assign(mappings, nestedMappings);
    }
  });

  return mappings;
}

/**
 * Helper to validate required fields
 */
export function validateRequiredFields<T>(
  accessor: FieldAccessor<T>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const fieldPath of requiredFields) {
    const value = accessor.get(fieldPath);
    if (value === undefined || value === '' || value === null) {
      missingFields.push(fieldPath);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Helper to get all field values as a flat object
 */
export function getAllFieldValues<T>(
  accessor: FieldAccessor<T>,
  fieldPaths: string[]
): Record<string, string | boolean | number | undefined> {
  const values: Record<string, string | boolean | number | undefined> = {};

  for (const fieldPath of fieldPaths) {
    values[fieldPath] = accessor.get(fieldPath);
  }

  return values;
}

/**
 * Helper to batch update multiple fields
 */
export function batchUpdateFields<T>(
  accessor: FieldAccessor<T>,
  updates: Record<string, string | boolean | number>
): void {
  Object.entries(updates).forEach(([fieldPath, value]) => {
    accessor.set(fieldPath, value);
  });
}