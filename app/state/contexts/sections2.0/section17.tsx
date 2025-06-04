/**
 * Section 17: Marital Status - Context Provider
 *
 * React context provider for SF-86 Section 17 using the new Form Architecture 2.0.
 * This provider manages marital status data with full CRUD operations,
 * validation, and integration with the central SF86FormContext.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import get from 'lodash/get';
import type {
  Section17,
  Section17SubsectionKey,
  Section17FieldUpdate,
  Section17ValidationResult,
  CurrentSpouseEntry,
  FormerSpouseEntry,
  CohabitantEntry
} from '../../../../api/interfaces/sections2.0/section17';
import {
  createDefaultSection17,
  createDefaultCurrentSpouseEntry,
  createDefaultFormerSpouseEntry,
  createDefaultCohabitantEntry,
  validateSection17,
  isSection17Complete
} from '../../../../api/interfaces/sections2.0/section17';

// Custom integration approach - avoiding the problematic useSection86FormIntegration
import { useSF86Form } from '../SF86FormContext';
import type { ValidationResult, ValidationError, ChangeSet } from '../shared/base-interfaces';

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section17ContextType {
  // State
  section17Data: Section17;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Current Spouse Actions
  updateCurrentSpouse: (fieldPath: string, value: any) => void;
  addCurrentSpouse: () => void;
  removeCurrentSpouse: (index: number) => void;

  // Former Spouse Actions
  updateFormerSpouse: (index: number, fieldPath: string, value: any) => void;
  addFormerSpouse: () => void;
  removeFormerSpouse: (index: number) => void;

  // Cohabitant Actions
  updateCohabitant: (index: number, fieldPath: string, value: any) => void;
  addCohabitant: () => void;
  removeCohabitant: (index: number) => void;

  // Generic Field Updates
  updateFieldValue: (path: string, value: any) => void;
  updateEntry: (subsection: Section17SubsectionKey, index: number, fieldPath: string, value: any) => void;

  // Validation
  validateSection: () => ValidationResult;
  validateSection17: () => Section17ValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section17) => void;
  getChanges: () => any;
  isComplete: () => boolean;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

// Use the DRY approach with sections-references instead of hardcoded values
const createInitialSection17State = (): Section17 => {
  return createDefaultSection17();
};

// ============================================================================
// VALIDATION CONFIGURATION
// ============================================================================

// Simplified validation configuration - no complex rules needed

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section17Context = createContext<Section17ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section17ProviderProps {
  children: React.ReactNode;
}

export const Section17Provider: React.FC<Section17ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT - Following Section 29 Gold Standard Pattern
  // ============================================================================

  const [section17Data, setSection17Data] = useState<Section17>(createInitialSection17State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Set initialized flag after component mounts
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Use simplified validation
    const section17Validation = validateSection17(section17Data);

    if (!section17Validation.isValid) {
      section17Validation.errors.forEach(error => {
        validationErrors.push({
          field: 'section17',
          message: error,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      });
    }

    section17Validation.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'section17',
        message: warning,
        code: 'VALIDATION_WARNING',
        severity: 'warning'
      });
    });

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section17Data]);

  const validateSection17Only = useCallback((): Section17ValidationResult => {
    return validateSection17(section17Data);
  }, [section17Data]);

  // Update errors when section data changes (but not during initial render)
  useEffect(() => {
    // Skip validation on initial render to avoid infinite loops
    if (!isInitialized) return;

    const validationResult = validateSection();
    const newErrors: Record<string, string> = {};

    validationResult.errors.forEach(error => {
      newErrors[error.field] = error.message;
    });

    // Only update errors if they actually changed
    const currentErrorKeys = Object.keys(errors);
    const newErrorKeys = Object.keys(newErrors);
    const errorsChanged =
      currentErrorKeys.length !== newErrorKeys.length ||
      currentErrorKeys.some(key => errors[key] !== newErrors[key]);

    if (errorsChanged) {
      setErrors(newErrors);
    }
  }, [section17Data, isInitialized, errors]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  /**
   * Update current spouse information
   * Handles Field<T> structures - expects full field paths including .value
   * Following Section 29 gold standard pattern with proper isDirty tracking
   */
  const updateCurrentSpouse = useCallback((fieldPath: string, value: any) => {
    setSection17Data(prevData => {
      const newData = cloneDeep(prevData);

      // Ensure current spouse array exists and has at least one entry
      if (!newData.section17.currentSpouse.length) {
        newData.section17.currentSpouse.push(createDefaultCurrentSpouseEntry());
      }

      // Use full path as provided (component now includes .value)
      const fullPath = `section17.currentSpouse.0.${fieldPath}`;
      set(newData, fullPath, value);

      // Set dirty flag like Section 29
      setIsDirty(true);

      return newData;
    });
  }, []);

  /**
   * Add a new current spouse entry (though typically only one exists)
   * Following Section 29 gold standard pattern with proper isDirty tracking
   */
  const addCurrentSpouse = useCallback(() => {
    console.log('🔄 Section17Context: addCurrentSpouse called');
    setSection17Data(prevData => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultCurrentSpouseEntry();
      newData.section17.currentSpouse.push(newEntry);

      // Debug logging to see the actual field structure
      console.log('✅ Section17Context: Current spouse entry added');
      console.log('🔍 Section17Context: lastName field details:', {
        id: newEntry.fullName?.lastName?.id,
        name: newEntry.fullName?.lastName?.name,
        type: newEntry.fullName?.lastName?.type,
        label: newEntry.fullName?.lastName?.label,
        value: newEntry.fullName?.lastName?.value
      });
      console.log('🔍 Section17Context: firstName field details:', {
        id: newEntry.fullName?.firstName?.id,
        name: newEntry.fullName?.firstName?.name,
        type: newEntry.fullName?.firstName?.type,
        label: newEntry.fullName?.firstName?.label,
        value: newEntry.fullName?.firstName?.value
      });
      console.log('📊 Section17Context: Updated data', newData);

      // Set dirty flag like Section 29
      setIsDirty(true);

      return newData;
    });
  }, []);

  /**
   * Remove current spouse entry
   */
  const removeCurrentSpouse = useCallback((index: number) => {
    setSection17Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section17.currentSpouse.splice(index, 1);
      setIsDirty(true);
      return newData;
    });
  }, []);

  /**
   * Update former spouse information
   * Handles Field<T> structures - expects full field paths including .value
   * Following Section 29 gold standard pattern with proper isDirty tracking
   */
  const updateFormerSpouse = useCallback((index: number, fieldPath: string, value: any) => {
    setSection17Data(prevData => {
      const newData = cloneDeep(prevData);

      // Ensure the array has enough entries
      while (newData.section17.formerSpouses.length <= index) {
        newData.section17.formerSpouses.push(createDefaultFormerSpouseEntry());
      }

      // Use full path as provided (component now includes .value)
      const fullPath = `section17.formerSpouses.${index}.${fieldPath}`;
      set(newData, fullPath, value);

      // Set dirty flag like Section 29
      setIsDirty(true);

      return newData;
    });
  }, []);

  /**
   * Add a new former spouse entry
   */
  const addFormerSpouse = useCallback(() => {
    setSection17Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section17.formerSpouses.push(createDefaultFormerSpouseEntry());
      setIsDirty(true);
      return newData;
    });
  }, []);

  /**
   * Remove former spouse entry
   */
  const removeFormerSpouse = useCallback((index: number) => {
    setSection17Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section17.formerSpouses.splice(index, 1);
      setIsDirty(true);
      return newData;
    });
  }, []);

  /**
   * Update cohabitant information
   * Handles Field<T> structures - expects full field paths including .value
   * Following Section 29 gold standard pattern with proper isDirty tracking
   */
  const updateCohabitant = useCallback((index: number, fieldPath: string, value: any) => {
    setSection17Data(prevData => {
      const newData = cloneDeep(prevData);

      // Ensure the array has enough entries
      while (newData.section17.cohabitants.length <= index) {
        newData.section17.cohabitants.push(createDefaultCohabitantEntry());
      }

      // Use full path as provided (component now includes .value)
      const fullPath = `section17.cohabitants.${index}.${fieldPath}`;
      set(newData, fullPath, value);

      // Set dirty flag like Section 29
      setIsDirty(true);

      return newData;
    });
  }, []);

  /**
   * Add a new cohabitant entry
   */
  const addCohabitant = useCallback(() => {
    setSection17Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section17.cohabitants.push(createDefaultCohabitantEntry());
      setIsDirty(true);
      return newData;
    });
  }, []);

  /**
   * Remove cohabitant entry
   */
  const removeCohabitant = useCallback((index: number) => {
    setSection17Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section17.cohabitants.splice(index, 1);
      setIsDirty(true);
      return newData;
    });
  }, []);

  /**
   * Generic field update function for integration compatibility
   * Maps generic field paths to Section 17 specific update functions
   * Following Section 29 gold standard pattern with proper isDirty tracking
   */
  const updateFieldValue = useCallback((path: string, value: any) => {
    // Parse path to update the correct field using specific update functions
    if (path.startsWith('section17.currentSpouse.0.')) {
      const fieldPath = path.replace('section17.currentSpouse.0.', '');
      updateCurrentSpouse(fieldPath, value);
    } else if (path.match(/^section17\.formerSpouses\.(\d+)\./)) {
      const match = path.match(/^section17\.formerSpouses\.(\d+)\.(.+)$/);
      if (match) {
        const index = parseInt(match[1], 10);
        const fieldPath = match[2];
        updateFormerSpouse(index, fieldPath, value);
      }
    } else if (path.match(/^section17\.cohabitants\.(\d+)\./)) {
      const match = path.match(/^section17\.cohabitants\.(\d+)\.(.+)$/);
      if (match) {
        const index = parseInt(match[1], 10);
        const fieldPath = match[2];
        updateCohabitant(index, fieldPath, value);
      }
    } else {
      // Fallback to direct path setting for other fields
      setSection17Data(prevData => {
        const newData = cloneDeep(prevData);
        set(newData, path, value);
        setIsDirty(true);
        return newData;
      });
    }
  }, [updateCurrentSpouse, updateFormerSpouse, updateCohabitant]);

  /**
   * Update entry in a specific subsection
   */
  const updateEntry = useCallback((
    subsection: Section17SubsectionKey,
    index: number,
    fieldPath: string,
    value: any
  ) => {
    // Use the specific update functions based on subsection
    switch (subsection) {
      case 'currentSpouse':
        updateCurrentSpouse(fieldPath, value);
        break;
      case 'formerSpouses':
        updateFormerSpouse(index, fieldPath, value);
        break;
      case 'cohabitants':
        updateCohabitant(index, fieldPath, value);
        break;
      default:
        console.warn(`Unknown subsection: ${subsection}`);
    }
  }, [updateCurrentSpouse, updateFormerSpouse, updateCohabitant]);

  /**
   * Load section data from external source
   * Following Section 29 gold standard pattern with safeguards
   */
  const loadSection = useCallback((data: Section17) => {
    console.log('🔄 Section17: Loading section data');
    console.log('📊 Incoming data:', data);

    setSection17Data(data);
    setIsDirty(false);
  }, []);

  /**
   * Reset section to initial state
   * Following Section 29 gold standard pattern
   */
  const resetSection = useCallback(() => {
    setSection17Data(createInitialSection17State());
    setErrors({});
    setIsDirty(false);
  }, []);

  /**
   * Get changes made to the section
   * Following Section 29 gold standard pattern with isDirty tracking
   */
  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Use isDirty flag like Section 29
    if (isDirty) {
      changes['section17'] = {
        oldValue: createInitialSection17State(),
        newValue: section17Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section17Data, isDirty]);

  /**
   * Check if section is complete
   */
  const isComplete = useCallback(() => {
    return isSection17Complete(section17Data);
  }, [section17Data]);

  // ============================================================================
  // FIELD FLATTENING FOR PDF GENERATION - Following Section 29 Pattern
  // ============================================================================

  /**
   * Flatten Section17 data structure into Field objects for PDF generation
   * This converts the nested Section17 structure into a flat object with Field<T> objects
   * Following the Section 29 pattern for consistency
   */
  const flattenSection17Fields = useCallback((): Record<string, any> => {
    const flatFields: Record<string, any> = {};

    const addField = (field: any, _path: string) => {
      if (
        field &&
        typeof field === "object" &&
        "id" in field &&
        "value" in field
      ) {
        flatFields[field.id] = field;
      }
    };

    // Flatten current spouse entries
    section17Data.section17.currentSpouse.forEach((entry: CurrentSpouseEntry, entryIndex: number) => {
      const flattenEntry = (obj: any, prefix: string) => {
        Object.entries(obj).forEach(([key, value]) => {
          if (key === "_id") return;

          const currentPath = `${prefix}.${key}`;

          if (
            value &&
            typeof value === "object" &&
            "id" in value &&
            "value" in value
          ) {
            // This is a Field object
            addField(value, currentPath);
          } else if (value && typeof value === "object") {
            // This is a nested object, recurse
            flattenEntry(value, currentPath);
          }
        });
      };

      flattenEntry(entry, `currentSpouse.entries.${entryIndex}`);
    });

    // Flatten former spouse entries
    section17Data.section17.formerSpouses.forEach((entry: FormerSpouseEntry, entryIndex: number) => {
      const flattenEntry = (obj: any, prefix: string) => {
        Object.entries(obj).forEach(([key, value]) => {
          if (key === "_id") return;

          const currentPath = `${prefix}.${key}`;

          if (
            value &&
            typeof value === "object" &&
            "id" in value &&
            "value" in value
          ) {
            // This is a Field object
            addField(value, currentPath);
          } else if (value && typeof value === "object") {
            // This is a nested object, recurse
            flattenEntry(value, currentPath);
          }
        });
      };

      flattenEntry(entry, `formerSpouses.entries.${entryIndex}`);
    });

    // Flatten cohabitant entries
    section17Data.section17.cohabitants.forEach((entry: CohabitantEntry, entryIndex: number) => {
      const flattenEntry = (obj: any, prefix: string) => {
        Object.entries(obj).forEach(([key, value]) => {
          if (key === "_id") return;

          const currentPath = `${prefix}.${key}`;

          if (
            value &&
            typeof value === "object" &&
            "id" in value &&
            "value" in value
          ) {
            // This is a Field object
            addField(value, currentPath);
          } else if (value && typeof value === "object") {
            // This is a nested object, recurse
            flattenEntry(value, currentPath);
          }
        });
      };

      flattenEntry(entry, `cohabitants.entries.${entryIndex}`);
    });

    return flatFields;
  }, [section17Data]);

  // ============================================================================
  // SF86FORM INTEGRATION - Following Section 29 Gold Standard Pattern
  // ============================================================================

  // Create a wrapper function that matches the integration hook's expected signature
  // Integration expects: (path: string, value: any) => void
  // Section 17 has: (subsectionKey, entryIndex, fieldPath, newValue) => void
  const updateFieldValueWrapper = useCallback((path: string, value: any) => {
    // Parse the path to extract subsection, entry index, and field path
    // Expected format: "section17.subsectionKey.entries[index].fieldPath"
    const pathParts = path.split('.');

    if (pathParts.length >= 4 && pathParts[0] === 'section17') {
      const subsectionKey = pathParts[1];
      const entriesMatch = pathParts[2].match(/entries\[(\d+)\]/);

      if (entriesMatch) {
        const entryIndex = parseInt(entriesMatch[1]);
        const fieldPath = pathParts.slice(3).join('.');

        // Call Section 17's updateFieldValue with the correct signature
        updateFieldValue(path, value);
        return;
      }
    }

    // Fallback: use lodash set for direct path updates
    setSection17Data(prev => {
      const updated = cloneDeep(prev);
      set(updated, path, value);
      setIsDirty(true);
      return updated;
    });
  }, [updateFieldValue]);

  // ============================================================================
  // CUSTOM SF86FORM INTEGRATION - Simplified to avoid infinite loops
  // ============================================================================

  // Custom minimal integration that avoids the circular dependency issues
  // in the standard useSection86FormIntegration hook
  const { updateSectionData } = useSF86Form();

  // Simple integration: just sync data to global context when it changes
  useEffect(() => {
    // Debounce the update to avoid excessive calls
    const timeoutId = setTimeout(() => {
      updateSectionData('section17', section17Data);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [section17Data, updateSectionData]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section17ContextType = {
    // State
    section17Data,
    isLoading,
    errors,
    isDirty,

    // Current Spouse Actions
    updateCurrentSpouse,
    addCurrentSpouse,
    removeCurrentSpouse,

    // Former Spouse Actions
    updateFormerSpouse,
    addFormerSpouse,
    removeFormerSpouse,

    // Cohabitant Actions
    updateCohabitant,
    addCohabitant,
    removeCohabitant,

    // Generic Field Updates
    updateFieldValue,
    updateEntry,

    // Validation
    validateSection,
    validateSection17: validateSection17Only,

    // Utility
    resetSection,
    loadSection,
    getChanges,
    isComplete
  };

  return (
    <Section17Context.Provider value={contextValue}>
      {children}
    </Section17Context.Provider>
  );
};

// ============================================================================
// HOOK FOR CONSUMING CONTEXT
// ============================================================================

export const useSection17 = (): Section17ContextType => {
  const context = useContext(Section17Context);
  if (context === undefined) {
    throw new Error('useSection17 must be used within a Section17Provider');
  }
  return context;
};