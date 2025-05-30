/**
 * CRUD Operation Templates for SF-86 Form Architecture
 *
 * This module provides reusable CRUD operation templates that all section contexts
 * can use. Based on the proven Section29 patterns with React hooks optimization.
 */

import { useCallback, useMemo } from 'react';
import { cloneDeep, set, get, unset } from 'lodash';
import type {
  BaseEntry,
  BaseSubsection,
  BulkUpdate,
  ChangeSet,
  ValidationResult,
  ValidationError,
  SectionId
} from './base-interfaces';
import { generateFieldId, generateEntryFieldIds } from './field-id-generator';
import type { Field } from "../../../../api/interfaces/formDefinition2.0";

// ============================================================================
// CRUD OPERATION HOOKS
// ============================================================================

/**
 * Hook that provides standard CRUD operations for section contexts
 * Based on the proven Section29 implementation patterns
 */
export function useCRUDOperations<T extends BaseEntry>(
  sectionId: SectionId,
  sectionData: any,
  setSectionData: (data: any) => void,
  subsectionKey: string
) {
  /**
   * Add a new entry to a subsection
   * Follows the exact pattern from Section29 Context
   */
  const addEntry = useCallback((entryTemplate: Partial<T>) => {
    setSectionData((prevData: any) => {
      const newData = cloneDeep(prevData);
      const subsection = get(newData, subsectionKey) as BaseSubsection;

      if (!subsection) {
        console.error(`Subsection not found: ${subsectionKey}`);
        return prevData;
      }

      // Calculate entry index
      const entryIndex = subsection.entries.length;

      // Generate field IDs for the new entry
      const fieldIds = generateEntryFieldIds(sectionId, subsectionKey, entryIndex);

      // Create new entry with generated field IDs
      const newEntry: T = {
        _id: Date.now() + Math.random(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...entryTemplate,
      } as T;

      // Apply field IDs to the entry fields
      Object.entries(fieldIds).forEach(([fieldType, fieldId]) => {
        const fieldPath = fieldType.replace('.', '.');
        const existingField = get(newEntry, fieldPath);
        if (existingField && typeof existingField === 'object' && 'id' in existingField) {
          set(newEntry, `${fieldPath}.id`, fieldId);
        }
      });

      // Add entry to subsection
      subsection.entries.push(newEntry);
      subsection.entriesCount = subsection.entries.length;

      return newData;
    });
  }, [sectionId, subsectionKey, setSectionData]);

  /**
   * Remove an entry from a subsection
   * Follows the exact pattern from Section29 Context
   */
  const removeEntry = useCallback((index: number) => {
    setSectionData((prevData: any) => {
      const newData = cloneDeep(prevData);
      const subsection = get(newData, subsectionKey) as BaseSubsection;

      if (!subsection || index < 0 || index >= subsection.entries.length) {
        console.error(`Invalid entry index: ${index}`);
        return prevData;
      }

      // Remove entry
      subsection.entries.splice(index, 1);
      subsection.entriesCount = subsection.entries.length;

      // Regenerate field IDs for remaining entries
      subsection.entries.forEach((entry, entryIndex) => {
        const fieldIds = generateEntryFieldIds(sectionId, subsectionKey, entryIndex);
        Object.entries(fieldIds).forEach(([fieldType, fieldId]) => {
          const fieldPath = fieldType.replace('.', '.');
          const existingField = get(entry, fieldPath);
          if (existingField && typeof existingField === 'object' && 'id' in existingField) {
            set(entry, `${fieldPath}.id`, fieldId);
          }
        });
      });

      return newData;
    });
  }, [sectionId, subsectionKey, setSectionData]);

  /**
   * Update a specific field in an entry
   * Follows the exact pattern from Section29 Context
   */
  const updateEntry = useCallback((index: number, fieldPath: string, value: any) => {
    setSectionData((prevData: any) => {
      const newData = cloneDeep(prevData);
      const subsection = get(newData, subsectionKey) as BaseSubsection;

      if (!subsection || index < 0 || index >= subsection.entries.length) {
        console.error(`Invalid entry index: ${index}`);
        return prevData;
      }

      const entry = subsection.entries[index];
      const fullPath = `${subsectionKey}.entries[${index}].${fieldPath}`;

      // Update the field value
      set(newData, fullPath, value);

      // Update timestamp
      entry.updatedAt = new Date();

      return newData;
    });
  }, [subsectionKey, setSectionData]);

  /**
   * Move an entry to a different position
   * Advanced operation for better UX
   */
  const moveEntry = useCallback((fromIndex: number, toIndex: number) => {
    setSectionData((prevData: any) => {
      const newData = cloneDeep(prevData);
      const subsection = get(newData, subsectionKey) as BaseSubsection;

      if (!subsection ||
          fromIndex < 0 || fromIndex >= subsection.entries.length ||
          toIndex < 0 || toIndex >= subsection.entries.length) {
        console.error(`Invalid move indices: ${fromIndex} -> ${toIndex}`);
        return prevData;
      }

      // Move the entry
      const [movedEntry] = subsection.entries.splice(fromIndex, 1);
      subsection.entries.splice(toIndex, 0, movedEntry);

      // Regenerate field IDs for all entries
      subsection.entries.forEach((entry, entryIndex) => {
        const fieldIds = generateEntryFieldIds(sectionId, subsectionKey, entryIndex);
        Object.entries(fieldIds).forEach(([fieldType, fieldId]) => {
          const fieldPath = fieldType.replace('.', '.');
          const existingField = get(entry, fieldPath);
          if (existingField && typeof existingField === 'object' && 'id' in existingField) {
            set(entry, `${fieldPath}.id`, fieldId);
          }
        });
        entry.updatedAt = new Date();
      });

      return newData;
    });
  }, [sectionId, subsectionKey, setSectionData]);

  /**
   * Duplicate an entry
   * Advanced operation for better UX
   */
  const duplicateEntry = useCallback((index: number) => {
    setSectionData((prevData: any) => {
      const newData = cloneDeep(prevData);
      const subsection = get(newData, subsectionKey) as BaseSubsection;

      if (!subsection || index < 0 || index >= subsection.entries.length) {
        console.error(`Invalid entry index: ${index}`);
        return prevData;
      }

      const originalEntry = subsection.entries[index];
      const entryIndex = subsection.entries.length;

      // Create duplicate with new ID and timestamps
      const duplicatedEntry = {
        ...cloneDeep(originalEntry),
        _id: Date.now() + Math.random(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Generate new field IDs for the duplicated entry
      const fieldIds = generateEntryFieldIds(sectionId, subsectionKey, entryIndex);
      Object.entries(fieldIds).forEach(([fieldType, fieldId]) => {
        const fieldPath = fieldType.replace('.', '.');
        const existingField = get(duplicatedEntry, fieldPath);
        if (existingField && typeof existingField === 'object' && 'id' in existingField) {
          set(duplicatedEntry, `${fieldPath}.id`, fieldId);
        }
      });

      // Add duplicated entry
      subsection.entries.push(duplicatedEntry);
      subsection.entriesCount = subsection.entries.length;

      return newData;
    });
  }, [sectionId, subsectionKey, setSectionData]);

  /**
   * Clear all fields in an entry (reset to default values)
   * Advanced operation for better UX
   */
  const clearEntry = useCallback((index: number) => {
    setSectionData((prevData: any) => {
      const newData = cloneDeep(prevData);
      const subsection = get(newData, subsectionKey) as BaseSubsection;

      if (!subsection || index < 0 || index >= subsection.entries.length) {
        console.error(`Invalid entry index: ${index}`);
        return prevData;
      }

      const entry = subsection.entries[index];
      const entryId = entry._id;
      const createdAt = entry.createdAt;

      // Generate field IDs for the entry
      const fieldIds = generateEntryFieldIds(sectionId, subsectionKey, index);

      // Create a new empty entry with the same ID and field IDs
      const clearedEntry: any = {
        _id: entryId,
        createdAt,
        updatedAt: new Date(),
      };

      // Apply field IDs to empty fields
      Object.entries(fieldIds).forEach(([fieldType, fieldId]) => {
        const fieldPath = fieldType.replace('.', '.');
        const emptyField: Field<any> = {
          id: fieldId,
          value: '',
          isDirty: false,
          isValid: true,
          errors: []
        };
        set(clearedEntry, fieldPath, emptyField);
      });

      // Replace the entry
      subsection.entries[index] = clearedEntry;

      return newData;
    });
  }, [sectionId, subsectionKey, setSectionData]);

  /**
   * Get entry count for the subsection
   */
  const getEntryCount = useCallback((): number => {
    const subsection = get(sectionData, subsectionKey) as BaseSubsection;
    return subsection?.entriesCount || 0;
  }, [sectionData, subsectionKey]);

  /**
   * Get a specific entry safely
   */
  const getEntry = useCallback((index: number): T | null => {
    const subsection = get(sectionData, subsectionKey) as BaseSubsection;
    if (!subsection || index < 0 || index >= subsection.entries.length) {
      return null;
    }
    return subsection.entries[index] as T;
  }, [sectionData, subsectionKey]);

  return {
    addEntry,
    removeEntry,
    updateEntry,
    moveEntry,
    duplicateEntry,
    clearEntry,
    getEntryCount,
    getEntry
  };
}

// ============================================================================
// FIELD UPDATE OPERATIONS
// ============================================================================

/**
 * Hook that provides field update operations
 * Based on the proven Section29 implementation patterns
 */
export function useFieldOperations(
  sectionData: any,
  setSectionData: (data: any) => void
) {
  /**
   * Update a field value at any path in the section data
   * Follows the exact pattern from Section29 Context
   */
  const updateFieldValue = useCallback((path: string, value: any) => {
    setSectionData((prevData: any) => {
      const newData = cloneDeep(prevData);
      set(newData, path, value);
      return newData;
    });
  }, [setSectionData]);

  /**
   * Update subsection flag (YES/NO questions)
   * Follows the exact pattern from Section29 Context
   */
  const updateSubsectionFlag = useCallback((subsectionKey: string, value: "YES" | "NO") => {
    updateFieldValue(`${subsectionKey}.hasFlag.value`, value);
  }, [updateFieldValue]);

  /**
   * Bulk update multiple fields at once
   * Advanced operation for better performance
   */
  const bulkUpdateFields = useCallback((updates: BulkUpdate[]) => {
    setSectionData((prevData: any) => {
      const newData = cloneDeep(prevData);

      updates.forEach(({ path, value }) => {
        set(newData, path, value);
      });

      return newData;
    });
  }, [setSectionData]);

  /**
   * Reset a field to its default value
   */
  const resetField = useCallback((path: string, defaultValue: any = '') => {
    updateFieldValue(path, defaultValue);
  }, [updateFieldValue]);

  /**
   * Clear multiple fields at once
   */
  const clearFields = useCallback((paths: string[]) => {
    const updates: BulkUpdate[] = paths.map(path => ({ path, value: '' }));
    bulkUpdateFields(updates);
  }, [bulkUpdateFields]);

  return {
    updateFieldValue,
    updateSubsectionFlag,
    bulkUpdateFields,
    resetField,
    clearFields
  };
}

// ============================================================================
// VALIDATION OPERATIONS
// ============================================================================

/**
 * Hook that provides validation operations
 */
export function useValidationOperations(sectionData: any) {
  /**
   * Validate the entire section
   */
  const validateSection = useCallback((): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Basic validation logic (to be extended by specific sections)
    // This is a template that sections can override

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [sectionData]);

  /**
   * Validate a specific field
   */
  const validateField = useCallback((path: string, value: any): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Basic field validation (to be extended)
    if (typeof value === 'string' && value.trim() === '') {
      errors.push({
        field: path,
        message: 'This field is required',
        code: 'REQUIRED',
        severity: 'error'
      });
    }

    return errors;
  }, []);

  return {
    validateSection,
    validateField
  };
}

// ============================================================================
// CHANGE TRACKING OPERATIONS
// ============================================================================

/**
 * Hook that provides change tracking operations
 */
export function useChangeTracking(sectionData: any, initialData: any) {
  /**
   * Get all changes made to the section
   */
  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Compare current data with initial data
    // This is a simplified implementation
    const compareObjects = (current: any, initial: any, path: string = '') => {
      if (typeof current !== typeof initial) {
        changes[path] = {
          oldValue: initial,
          newValue: current,
          timestamp: new Date()
        };
        return;
      }

      if (typeof current === 'object' && current !== null) {
        Object.keys(current).forEach(key => {
          const newPath = path ? `${path}.${key}` : key;
          compareObjects(current[key], initial?.[key], newPath);
        });
      } else if (current !== initial) {
        changes[path] = {
          oldValue: initial,
          newValue: current,
          timestamp: new Date()
        };
      }
    };

    compareObjects(sectionData, initialData);
    return changes;
  }, [sectionData, initialData]);

  /**
   * Check if the section has any changes
   */
  const isDirty = useMemo((): boolean => {
    const changes = getChanges();
    return Object.keys(changes).length > 0;
  }, [getChanges]);

  return {
    getChanges,
    isDirty
  };
}

// ============================================================================
// EXPORT ALL HOOKS
// ============================================================================

export {
  useCRUDOperations,
  useFieldOperations,
  useValidationOperations,
  useChangeTracking
};
