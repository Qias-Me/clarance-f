/**
 * Section27 Context Provider - Use of Information Technology Systems
 *
 * React Context provider for SF-86 Section 27 (Use of Information Technology Systems) with
 * SF86FormContext integration and optimized defensive check logic.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { cloneDeep } from 'lodash';
import type {
  Section27,
  Section27SubsectionKey,
  Section27Entry,
  Section27_1Entry,
  Section27_2Entry,
  Section27_3Entry,
  TechnologyValidationResult
} from '../../../../api/interfaces/sections2.0/section27';
import {
  createDefaultSection27,
  createDefaultSection27_1Entry,
  createDefaultSection27_2Entry,
  createDefaultSection27_3Entry
} from '../../../../api/interfaces/sections2.0/section27';
import type {
  ValidationResult,
  ValidationError,
  ChangeSet,
  BaseSectionContext
} from '../shared/base-interfaces';
import { useSF86Form } from './SF86FormContext';

// ============================================================================
// CONTEXT TYPE DEFINITION
// ============================================================================

export interface Section27ContextType {
  // State
  section27Data: Section27;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updateSubsectionFlag: (subsectionKey: Section27SubsectionKey, value: "YES" | "NO") => void;
  addEntry: (subsectionKey: Section27SubsectionKey) => void;
  removeEntry: (subsectionKey: Section27SubsectionKey, entryIndex: number) => void;
  updateFieldValue: (subsectionKey: Section27SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => void;
  updateEntryField: (subsectionKey: Section27SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => void;

  // Utility Functions
  getEntryCount: (subsectionKey: Section27SubsectionKey) => number;
  getEntry: (subsectionKey: Section27SubsectionKey, entryIndex: number) => Section27Entry | undefined;

  // Validation
  validateSection: () => ValidationResult;
  validateTechnology: () => TechnologyValidationResult;

  // Submit-only mode
  submitSectionData: () => Promise<void>;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section27) => void;
  getChanges: () => ChangeSet;
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const createInitialSection27State = (): Section27 => {
  return createDefaultSection27();
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section27Context = createContext<Section27ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section27ProviderProps {
  children: React.ReactNode;
}

export const Section27Provider: React.FC<Section27ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section27Data, setSection27Data] = useState<Section27>(createInitialSection27State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section27>(createInitialSection27State());

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = useMemo(() => {
    return JSON.stringify(section27Data) !== JSON.stringify(initialData);
  }, [section27Data, initialData]);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Validate each subsection
    const subsections: Section27SubsectionKey[] = ['illegalAccess', 'illegalModification', 'unauthorizedEntry'];

    subsections.forEach(subsectionKey => {
      const subsection = section27Data.section27[subsectionKey];

      if (subsection.hasViolation.value === "YES") {
        // If violation is indicated, validate entries
        if (subsection.entries.length === 0) {
          validationErrors.push({
            field: `${subsectionKey}.entries`,
            message: `At least one entry is required when ${subsectionKey} violation is indicated`,
            code: 'VALIDATION_ERROR',
            severity: 'error'
          });
        } else {
          // Validate each entry
          subsection.entries.forEach((entry, index) => {
            if (!entry.description.value.trim()) {
              validationErrors.push({
                field: `${subsectionKey}.entries[${index}].description`,
                message: 'Description is required',
                code: 'VALIDATION_ERROR',
                severity: 'error'
              });
            }

            if (!entry.incidentDate.date.value.trim()) {
              validationErrors.push({
                field: `${subsectionKey}.entries[${index}].incidentDate`,
                message: 'Incident date is required',
                code: 'VALIDATION_ERROR',
                severity: 'error'
              });
            }
          });
        }
      }
    });

    // Update local errors
    const newErrors: Record<string, string> = {};
    validationErrors.forEach(error => {
      newErrors[error.field] = error.message;
    });
    setErrors(newErrors);

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section27Data]);

  const validateTechnology = useCallback((): TechnologyValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic technology validation
    const subsections: Section27SubsectionKey[] = ['illegalAccess', 'illegalModification', 'unauthorizedEntry'];

    subsections.forEach(subsectionKey => {
      const subsection = section27Data.section27[subsectionKey];

      if (subsection.hasViolation.value === "YES" && subsection.entries.length === 0) {
        errors.push(`${subsectionKey}: At least one entry is required when violation is indicated`);
      }
    });

    return { isValid: errors.length === 0, errors, warnings };
  }, [section27Data]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updateSubsectionFlag = useCallback((subsectionKey: Section27SubsectionKey, value: "YES" | "NO") => {
    console.log(`🔧 Section27: updateSubsectionFlag called with subsectionKey=${subsectionKey}, value=${value}`);
    setSection27Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section27[subsectionKey].hasViolation.value = value;

      // If setting to NO, clear entries
      if (value === "NO") {
        newData.section27[subsectionKey].entries = [];
        newData.section27[subsectionKey].entriesCount = 0;
        console.log(`🧹 Section27: Cleared entries for ${subsectionKey} because value is NO`);
      }
      // If setting to YES and no entries exist, auto-add the first entry
      else if (value === "YES" && newData.section27[subsectionKey].entries.length === 0) {
        let newEntry: Section27BaseEntry;
        const currentEntryCount = 0; // First entry

        switch (subsectionKey) {
          case 'illegalAccess':
            newEntry = createDefaultSection27_1Entry(currentEntryCount);
            break;
          case 'illegalModification':
            newEntry = createDefaultSection27_2Entry(currentEntryCount);
            break;
          case 'unauthorizedEntry':
            newEntry = createDefaultSection27_3Entry(currentEntryCount);
            break;
          default:
            throw new Error(`Unknown subsection: ${subsectionKey}`);
        }

        newData.section27[subsectionKey].entries.push(newEntry);
        newData.section27[subsectionKey].entriesCount = 1;
        console.log(`✅ Section27: Auto-added first entry for ${subsectionKey} when YES selected`, newEntry);
      }

      console.log(`✅ Section27: Updated subsection flag for ${subsectionKey} to ${value}`, newData.section27[subsectionKey]);
      return newData;
    });
  }, []);

  const addEntry = useCallback((subsectionKey: Section27SubsectionKey) => {
    console.log(`🔧 Section27: addEntry called for subsectionKey=${subsectionKey}`);
    setSection27Data(prevData => {
      const newData = cloneDeep(prevData);

      let newEntry: Section27BaseEntry;
      const currentEntryCount = newData.section27[subsectionKey].entries.length;

      switch (subsectionKey) {
        case 'illegalAccess':
          newEntry = createDefaultSection27_1Entry(currentEntryCount);
          break;
        case 'illegalModification':
          newEntry = createDefaultSection27_2Entry(currentEntryCount);
          break;
        case 'unauthorizedEntry':
          newEntry = createDefaultSection27_3Entry(currentEntryCount);
          break;
        default:
          throw new Error(`Unknown subsection: ${subsectionKey}`);
      }

      newData.section27[subsectionKey].entries.push(newEntry);
      newData.section27[subsectionKey].entriesCount = newData.section27[subsectionKey].entries.length;

      console.log(`✅ Section27: Added entry ${currentEntryCount} to ${subsectionKey}`, newEntry);
      return newData;
    });
  }, []);

  const removeEntry = useCallback((subsectionKey: Section27SubsectionKey, entryIndex: number) => {
    setSection27Data(prevData => {
      const newData = cloneDeep(prevData);

      if (entryIndex >= 0 && entryIndex < newData.section27[subsectionKey].entries.length) {
        newData.section27[subsectionKey].entries.splice(entryIndex, 1);
        newData.section27[subsectionKey].entriesCount = newData.section27[subsectionKey].entries.length;
      }

      return newData;
    });
  }, []);

  const updateFieldValue = useCallback((subsectionKey: Section27SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => {
    // Optimized for performance - reduced logging in production
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

    if (isDebugMode) {
      console.log(`🔧 Section27: updateFieldValue called with subsectionKey=${subsectionKey}, entryIndex=${entryIndex}, fieldPath=${fieldPath}, newValue=`, newValue);
    }

    setSection27Data(prevData => {
      const newData = cloneDeep(prevData);

      if (entryIndex >= 0 && entryIndex < newData.section27[subsectionKey].entries.length) {
        const entry = newData.section27[subsectionKey].entries[entryIndex];
        const pathParts = fieldPath.split('.');
        let current: any = entry;

        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]];
        }

        const lastKey = pathParts[pathParts.length - 1];
        if (current[lastKey] && typeof current[lastKey] === 'object' && 'value' in current[lastKey]) {
          current[lastKey].value = newValue;
          if (isDebugMode) {
            console.log(`✅ Section27: Updated field ${fieldPath} in entry ${entryIndex} of ${subsectionKey} to:`, newValue);
          }
        } else {
          current[lastKey] = newValue;
          if (isDebugMode) {
            console.log(`✅ Section27: Set field ${fieldPath} in entry ${entryIndex} of ${subsectionKey} to:`, newValue);
          }
        }
      } else {
        console.warn(`🚨 Section27: Invalid entry index ${entryIndex} for subsection ${subsectionKey}`);
      }

      // Mark that we have pending changes
      setPendingChanges(true);

      return newData;
    });
  }, []);

  const updateEntryField = useCallback((subsectionKey: Section27SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => {
    updateFieldValue(subsectionKey, entryIndex, fieldPath, newValue);
  }, [updateFieldValue]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getEntryCount = useCallback((subsectionKey: Section27SubsectionKey): number => {
    return section27Data.section27[subsectionKey].entries.length;
  }, [section27Data]);

  const getEntry = useCallback((subsectionKey: Section27SubsectionKey, entryIndex: number): Section27Entry | undefined => {
    const entries = section27Data.section27[subsectionKey].entries;
    return entryIndex >= 0 && entryIndex < entries.length ? entries[entryIndex] : undefined;
  }, [section27Data]);

  const resetSection = useCallback(() => {
    const newData = createInitialSection27State();
    setSection27Data(newData);
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section27) => {
    setSection27Data(cloneDeep(data));
    setErrors({});
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Simple change detection - compare with initial data
    if (JSON.stringify(section27Data) !== JSON.stringify(initialData)) {
      changes['section27'] = {
        oldValue: initialData,
        newValue: section27Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section27Data, initialData]);

  // ============================================================================
  // SUBMIT-ONLY MODE CONFIGURATION (Following Section 1 Pattern for Performance)
  // ============================================================================

  // Enable submit-only mode to prevent auto-sync on every field change
  // This ensures data is only synced to SF86FormContext when user explicitly submits
  const [submitOnlyMode] = useState(true); // Enable submit-only mode for Section 27
  const [pendingChanges, setPendingChanges] = useState(false);
  const lastSubmittedDataRef = useRef<Section27 | null>(null);

  /**
   * Manually sync data to main form context (submit-only mode)
   * This function should only be called when the user explicitly submits
   */
  const submitSectionData = useCallback(async () => {
    if (submitOnlyMode) {
      console.log('🚀 Section27: Manually syncing data to main form context (submit-only mode)');

      // Actually sync data to SF86FormContext
      sf86Form.updateSectionData('section27', section27Data);

      // Update tracking references
      lastSubmittedDataRef.current = cloneDeep(section27Data);
      setPendingChanges(false);

      console.log('✅ Section27: Data sync complete');
    }
  }, [submitOnlyMode, section27Data, sf86Form]);

  // ============================================================================
  // SF86FORM CONTEXT SYNCHRONIZATION
  // ============================================================================

  // Sync with SF86FormContext when data is loaded
  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

    if (sf86Form.formData.section27 && sf86Form.formData.section27 !== section27Data) {
      if (isDebugMode) {
        console.log('🔄 Section27: Syncing with SF86FormContext loaded data');
      }

      // Load the data from SF86FormContext
      loadSection(sf86Form.formData.section27);

      if (isDebugMode) {
        console.log('✅ Section27: Data sync complete');
      }
    }
  }, [sf86Form.formData.section27, loadSection]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Create BaseSectionContext for integration
  const contextId = useMemo(() => Math.random().toString(36).substring(2, 9), []);
  const baseSectionContext: BaseSectionContext = useMemo(() => ({
    sectionId: 'section27',
    sectionName: 'Section 27: Use of Information Technology Systems',
    sectionData: section27Data,
    isLoading,
    errors: Object.values(errors).map(msg => ({ field: 'general', message: msg, code: 'ERROR', severity: 'error' as const })),
    isDirty,
    lastUpdated: new Date(),
    updateFieldValue: (fieldPath: string, newValue: any) => {
      // Parse fieldPath to extract subsection and entry info
      const pathParts = fieldPath.split('.');
      if (pathParts.length >= 3) {
        const subsectionKey = pathParts[0] as Section27SubsectionKey;
        const entryIndex = parseInt(pathParts[1]);
        const remainingPath = pathParts.slice(2).join('.');
        updateFieldValue(subsectionKey, entryIndex, remainingPath, newValue);
      }
    },
    validateSection,
    resetSection,
    loadSection,
    getChanges
  }), [section27Data, isLoading, errors, isDirty, updateFieldValue, validateSection, resetSection, loadSection, getChanges]);



  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section27ContextType = {
    // State
    section27Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updateSubsectionFlag,
    addEntry,
    removeEntry,
    updateFieldValue,
    updateEntryField,

    // Utility Functions
    getEntryCount,
    getEntry,

    // Validation
    validateSection,
    validateTechnology,

    // Submit-only mode
    submitSectionData,

    // Utility
    resetSection,
    loadSection,
    getChanges,
  };

  return (
    <Section27Context.Provider value={contextValue}>
      {children}
    </Section27Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection27 = (): Section27ContextType => {
  const context = useContext(Section27Context);
  if (!context) {
    throw new Error('useSection27 must be used within a Section27Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section27Provider;
