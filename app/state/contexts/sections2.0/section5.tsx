/**
 * Section 5: Other Names Used Context
 *
 * React context implementation for SF-86 Section 5 (Other Names Used) following the established
 * patterns from Section 2, 7, 9, and 29. Provides comprehensive state management, CRUD operations,
 * and SF86FormContext integration.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode} from 'react';
import { cloneDeep, isEqual } from 'lodash';
import type {
  Section5,
  OtherNameEntry,
  Section5FieldUpdate
} from '../../../../api/interfaces/sections2.0/section5';
import {
  createDefaultSection5 as createDefaultSection5Impl,
  updateSection5Field as updateSection5FieldImpl,
  addOtherNameEntry as addOtherNameEntryImpl,
  removeOtherNameEntry as removeOtherNameEntryImpl
} from '../../../../api/interfaces/sections2.0/section5';
import type {
  ValidationResult,
  ValidationError,
  ChangeSet,
  BaseSectionContext
} from '../shared/base-interfaces';
import { useSectionIntegration } from '../shared/section-integration';
import DynamicService from '../../../../api/service/dynamicService';

// ============================================================================
// CONTEXT TYPE DEFINITION
// ============================================================================

interface Section5ContextType {
  // ============================================================================
  // CORE STATE
  // ============================================================================

  section5Data: Section5;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  // Basic Actions
  updateHasOtherNames: (value: boolean) => void;
  addOtherNameEntry: () => void;
  removeOtherNameEntry: (index: number) => void;
  updateFieldValue: (fieldPath: string, value: any, index?: number) => void;

  // Enhanced Entry Management
  getEntryCount: () => number;
  getEntry: (index: number) => OtherNameEntry | null;
  moveEntry: (fromIndex: number, toIndex: number) => void;
  duplicateEntry: (index: number) => void;
  clearEntry: (index: number) => void;
  bulkUpdateFields: (updates: Section5FieldUpdate[]) => void;

  // ============================================================================
  // VALIDATION & PERSISTENCE
  // ============================================================================

  validateSection: () => ValidationResult;
  saveSection: () => Promise<void>;
  loadSection: () => Promise<void>;
  resetSection: () => void;
  exportSection: () => Section5;

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  getChanges: () => ChangeSet;
  hasUnsavedChanges: () => boolean;
  getFieldValue: (fieldPath: string, index?: number) => any;
  setFieldValue: (fieldPath: string, value: any, index?: number) => void;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section5Context = createContext<Section5ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface Section5ProviderProps {
  children: ReactNode;
}

export const Section5Provider: React.FC<Section5ProviderProps> = ({ children }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [section5Data, setSection5Data] = useState<Section5>(createDefaultSection5Impl());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initialData = useRef<Section5>(createDefaultSection5Impl());

  // ============================================================================
  // VALIDATION LOGIC
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];

    // Validate has other names flag
    if (section5Data.section5.hasOtherNames.value === "YES") {
      // If user has other names, validate at least one entry
      if (section5Data.section5.otherNames.length === 0) {
        validationErrors.push({
          field: 'section5.hasOtherNames',
          message: 'If you have other names, you must provide at least one entry',
          code: 'REQUIRED_ENTRY',
          severity: 'error'
        });
      } else {
        // Validate each entry
        section5Data.section5.otherNames.forEach((entry, index) => {
          if (!entry.lastName.value.trim()) {
            validationErrors.push({
              field: `section5.otherNames[${index}].lastName`,
              message: 'Last name is required',
              code: 'REQUIRED_FIELD',
              severity: 'error'
            });
          }

          if (!entry.firstName.value.trim()) {
            validationErrors.push({
              field: `section5.otherNames[${index}].firstName`,
              message: 'First name is required',
              code: 'REQUIRED_FIELD',
              severity: 'error'
            });
          }

          if (!entry.from.value.trim()) {
            validationErrors.push({
              field: `section5.otherNames[${index}].from`,
              message: 'From date is required',
              code: 'REQUIRED_FIELD',
              severity: 'error'
            });
          }

          if (!entry.present.value && !entry.to.value.trim()) {
            validationErrors.push({
              field: `section5.otherNames[${index}].to`,
              message: 'To date is required when not marked as present',
              code: 'REQUIRED_FIELD',
              severity: 'error'
            });
          }

          if (!entry.reasonChanged.value.trim()) {
            validationErrors.push({
              field: `section5.otherNames[${index}].reasonChanged`,
              message: 'Reason for name change is required',
              code: 'REQUIRED_FIELD',
              severity: 'error'
            });
          }
        });
      }
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: []
    };
  }, [section5Data]);

  // ============================================================================
  // CHANGE TRACKING
  // ============================================================================

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    if (!isEqual(section5Data, initialData.current)) {
      changes.section5 = {
        oldValue: initialData.current,
        newValue: section5Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section5Data]);

  // ============================================================================
  // FIELD FLATTENING FOR PDF GENERATION
  // ============================================================================

  /**
   * Flatten Section5 data structure into Field objects for PDF generation
   * This converts the nested Section5 structure into a flat object with Field<T> objects
   */
  const flattenSection5Fields = useCallback((): Record<string, any> => {
    const flatFields: Record<string, any> = {};

    const addField = (field: any, _path: string) => {
      if (field && typeof field === 'object' && 'id' in field && 'value' in field) {
        flatFields[field.id] = field;
      }
    };

    // Flatten main flag field
    if (section5Data.section5.hasOtherNames) {
      addField(section5Data.section5.hasOtherNames, 'section5.hasOtherNames');
    }

    // Flatten entries
    section5Data.section5.otherNames.forEach((entry, entryIndex) => {
      const flattenEntry = (obj: any, prefix: string) => {
        Object.entries(obj).forEach(([key, value]) => {
          if (key === '_id') return;

          const currentPath = `${prefix}.${key}`;

          if (value && typeof value === 'object' && 'id' in value && 'value' in value) {
            // This is a Field object
            addField(value, currentPath);
          } else if (value && typeof value === 'object') {
            // This is a nested object, recurse
            flattenEntry(value, currentPath);
          }
        });
      };

      flattenEntry(entry, `section5.otherNames.${entryIndex}`);
    });

    return flatFields;
  }, [section5Data]);



  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = useMemo(() => {
    return !isEqual(section5Data, initialData.current);
  }, [section5Data]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updateHasOtherNames = useCallback((value: boolean) => {
    setSection5Data(prevData => {
      const newData = cloneDeep(prevData);

      if(value) {
        newData.section5.hasOtherNames.value = "YES";
      } else {
        newData.section5.hasOtherNames.value = "NO";
      }

      // If setting to false, clear all entries
      if (!value) {
        newData.section5.otherNames = [];
      } else if (newData.section5.otherNames.length === 0) {
        // If setting to true and no entries exist, add one default entry
        const updatedData = addOtherNameEntryImpl(newData);
        newData.section5.otherNames = updatedData.section5.otherNames;
      }

      return newData;
    });
  }, []);

  const addOtherNameEntry = useCallback(() => {
    setSection5Data(prevData => addOtherNameEntryImpl(prevData));
  }, []);

  const removeOtherNameEntry = useCallback((index: number) => {
    setSection5Data(prevData => removeOtherNameEntryImpl(prevData, index));
  }, []);

  const updateFieldValue = useCallback((fieldPath: string, value: any, index?: number) => {
    setSection5Data(prevData => updateSection5FieldImpl(prevData, { fieldPath, newValue: value, index }));
  }, []);

  // ============================================================================
  // ENHANCED ENTRY MANAGEMENT
  // ============================================================================

  const getEntryCount = useCallback(() => {
    return section5Data.section5.otherNames.length;
  }, [section5Data]);

  const getEntry = useCallback((index: number): OtherNameEntry | null => {
    return section5Data.section5.otherNames[index] || null;
  }, [section5Data]);

  const moveEntry = useCallback((fromIndex: number, toIndex: number) => {
    setSection5Data(prevData => {
      const newData = cloneDeep(prevData);
      const entries = newData.section5.otherNames;

      if (fromIndex >= 0 && fromIndex < entries.length && toIndex >= 0 && toIndex < entries.length) {
        const [movedEntry] = entries.splice(fromIndex, 1);
        entries.splice(toIndex, 0, movedEntry);
      }

      return newData;
    });
  }, []);

  const duplicateEntry = useCallback((index: number) => {
    setSection5Data(prevData => {
      const newData = cloneDeep(prevData);
      const entryToDuplicate = newData.section5.otherNames[index];

      if (entryToDuplicate) {
        const duplicatedEntry = cloneDeep(entryToDuplicate);
        // Clear some fields that shouldn't be duplicated
        duplicatedEntry.lastName.value = '';
        duplicatedEntry.firstName.value = '';
        duplicatedEntry.middleName.value = '';

        newData.section5.otherNames.splice(index + 1, 0, duplicatedEntry);
      }

      return newData;
    });
  }, []);

  const clearEntry = useCallback((index: number) => {
    setSection5Data(prevData => {
      const newData = cloneDeep(prevData);
      const entry = newData.section5.otherNames[index];

      if (entry) {
        entry.lastName.value = '';
        entry.firstName.value = '';
        entry.middleName.value = '';
        entry.suffix.value = '';
        entry.from.value = '';
        entry.to.value = '';
        entry.reasonChanged.value = '';
        entry.present.value = false;
      }

      return newData;
    });
  }, []);

  const bulkUpdateFields = useCallback((updates: Section5FieldUpdate[]) => {
    setSection5Data(prevData => {
      let newData = cloneDeep(prevData);

      updates.forEach(update => {
        newData = updateSection5FieldImpl(newData, update);
      });

      return newData;
    });
  }, []);

  // ============================================================================
  // PERSISTENCE OPERATIONS
  // ============================================================================

  const saveSection = useCallback(async () => {
    setIsLoading(true);
    try {
      const dynamicService = new DynamicService();
      const formData = { section5: section5Data };
      await dynamicService.saveUserFormData('section5', formData as any);
      initialData.current = cloneDeep(section5Data);
    } catch (error) {
      console.error('Failed to save Section 5:', error);
      setErrors(prev => ({ ...prev, save: 'Failed to save section data' }));
    } finally {
      setIsLoading(false);
    }
  }, [section5Data]);


  const loadSection = useCallback(async (data?: Section5) => {
    if (data) {
      // Direct data loading (from SF86FormContext)
      console.log(`🔄 Section5: Loading section data directly`);
      setSection5Data(data);
      initialData.current = cloneDeep(data);
    } else {
      // Async loading from storage
      setIsLoading(true);
      try {
        const dynamicService = new DynamicService();
        const response = await dynamicService.loadUserFormData('section5');
        if (response.success && response.formData?.section5) {
          setSection5Data(response.formData.section5);
          initialData.current = cloneDeep(response.formData.section5);
        }
      } catch (error) {
        console.error('Failed to load Section 5:', error);
        setErrors(prev => ({ ...prev, load: 'Failed to load section data' }));
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const resetSection = useCallback(() => {
    const defaultData = createDefaultSection5Impl();
    setSection5Data(defaultData);
    initialData.current = cloneDeep(defaultData);
    setErrors({});
  }, []);

  const exportSection = useCallback(() => {
    return cloneDeep(section5Data);
  }, [section5Data]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const hasUnsavedChanges = useCallback(() => {
    return isDirty;
  }, [isDirty]);

  const getFieldValue = useCallback((fieldPath: string, index?: number) => {
    const pathParts = fieldPath.split('.');
    let current: any = section5Data;

    for (const part of pathParts) {
      if (part.includes('[') && part.includes(']') && index !== undefined) {
        const arrayName = part.split('[')[0];
        current = current[arrayName][index];
      } else {
        current = current[part];
      }
    }

    return current?.value || current;
  }, [section5Data]);

  const setFieldValue = useCallback((fieldPath: string, value: any, index?: number) => {
    updateFieldValue(fieldPath, value, index);
  }, [updateFieldValue]);

  // ============================================================================
  // SECTION INTEGRATION
  // ============================================================================

  // Create BaseSectionContext interface for integration with stable memoization
  const baseSectionContext: BaseSectionContext = useMemo(() => {
    return {
      sectionId: 'section5',
      sectionName: 'Other Names Used',
      sectionData: section5Data, // Use structured data format (preferred)
      isLoading,
      errors: Object.keys(errors).map(key => ({
        field: key,
        message: errors[key],
        code: 'VALIDATION_ERROR',
        severity: 'error' as const
      })),
      isDirty,
      updateFieldValue: (path: string, value: any) => {
        updateFieldValue(path, value);
      },
      validateSection: () => ({
        isValid: validateSection().isValid,
        errors: [],
        warnings: []
      }),
      resetSection,
      loadSection,
      getChanges: () => ({}) // Return empty changeset for now
    };
  }, [section5Data, isLoading, errors, isDirty, updateFieldValue, validateSection, resetSection, loadSection]);

  // Integration with SF86FormContext
  const integration = useSectionIntegration();

  // Register section with SF86FormContext
  useEffect(() => {
    integration.registerSection({
      sectionId: 'section5',
      sectionName: 'Other Names Used',
      context: baseSectionContext,
      isActive: true,
      lastUpdated: new Date()
    });

    return () => {
      integration.unregisterSection('section5');
    };
  }, [integration]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section5ContextType = {
    // Core State
    section5Data,
    isLoading,
    errors,
    isDirty,

    // CRUD Operations
    updateHasOtherNames,
    addOtherNameEntry,
    removeOtherNameEntry,
    updateFieldValue,

    // Enhanced Entry Management
    getEntryCount,
    getEntry,
    moveEntry,
    duplicateEntry,
    clearEntry,
    bulkUpdateFields,

    // Validation & Persistence
    validateSection,
    saveSection,
    loadSection,
    resetSection,
    exportSection,

    // Utility Functions
    getChanges,
    hasUnsavedChanges,
    getFieldValue,
    setFieldValue
  };

  return (
    <Section5Context.Provider value={contextValue}>
      {children}
    </Section5Context.Provider>
  );
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Hook to use Section 5 Context with SF86Form integration
 */
export const useSection5 = (): Section5ContextType => {
  const context = useContext(Section5Context);
  if (!context) {
    throw new Error('useSection5 must be used within a Section5Provider');
  }
  return context;
};
