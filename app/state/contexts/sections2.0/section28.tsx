/**
 * Section28 Context Provider - Involvement in Non-Criminal Court Actions
 *
 * React Context provider for SF-86 Section 28 (Involvement in Non-Criminal Court Actions) with
 * SF86FormContext integration and optimized defensive check logic.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { cloneDeep } from 'lodash';
import type {
  Section28,
  Section28SubsectionKey,
  CourtActionEntry,
  Section28ValidationResult,
  CourtActionValidationResult
} from '../../../../api/interfaces/section-interfaces/section28';
import {
  createDefaultSection28,
  createDefaultCourtActionEntry
} from '../../../../api/interfaces/section-interfaces/section28';
import type {
  ValidationResult,
  ValidationError,
  ChangeSet,
  BaseSectionContext
} from '../shared/base-interfaces';
import { useSF86Form } from './SF86FormContext';

// Maximum number of court action entries allowed
const MAX_COURT_ACTION_ENTRIES = 2;

// ============================================================================
// CONTEXT TYPE DEFINITION
// ============================================================================

export interface Section28ContextType {
  // State - Updated to match component expectations
  sectionData: Section28;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions - Updated to match component expectations
  updateHasCourtActions: (value: "YES" | "NO (If NO, proceed to Section 29)") => void;
  addCourtAction: () => void;
  removeCourtAction: (entryId: string) => void;
  updateCourtAction: (entryId: string, updatedEntry: CourtActionEntry) => void;

  // Field update function for integration compatibility
  updateFieldValue: (path: string, value: any) => void;

  // Utility Functions
  getCourtActionEntryCount: () => number;
  getCourtActionEntry: (entryIndex: number) => CourtActionEntry | undefined;

  // Validation
  validateSection: () => ValidationResult;
  validateCourtAction: (entryIndex: number) => CourtActionValidationResult;
  validateAllCourtActions: () => Section28ValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section28) => void;
  getChanges: () => ChangeSet;
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const createInitialSection28State = (): Section28 => {
  return createDefaultSection28();
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section28Context = createContext<Section28ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section28ProviderProps {
  children: React.ReactNode;
}

export const Section28Provider: React.FC<Section28ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section28Data, setSection28Data] = useState<Section28>(createInitialSection28State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section28>(createInitialSection28State());
  const [isInitialized, setIsInitialized] = useState(false);

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = useMemo(() => {
    return JSON.stringify(section28Data) !== JSON.stringify(initialData);
  }, [section28Data, initialData]);

  // Set initialized flag after component mounts
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateCourtAction = useCallback((entryIndex: number): CourtActionValidationResult => {
    const entry = section28Data.section28.courtActionEntries[entryIndex];
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!entry) {
      errors.push('Court action entry not found');
      return { isValid: false, errors, warnings };
    }

    // Validate required fields
    if (!entry.dateOfAction.date.value.trim()) {
      errors.push('Date of action is required');
    }

    if (!entry.courtName.value.trim()) {
      errors.push('Court name is required');
    }

    if (!entry.natureOfAction.value.trim()) {
      errors.push('Nature of action is required');
    }

    if (!entry.resultsDescription.value.trim()) {
      errors.push('Results description is required');
    }

    if (!entry.principalParties.value.trim()) {
      errors.push('Principal parties are required');
    }

    // Validate address
    if (!entry.courtAddress.street.value.trim()) {
      errors.push('Court address street is required');
    }

    if (!entry.courtAddress.city.value.trim()) {
      errors.push('Court address city is required');
    }

    if (!entry.courtAddress.country.value.trim()) {
      errors.push('Court address country is required');
    }

    // US-specific validation
    if (entry.courtAddress.country.value === 'United States' || entry.courtAddress.country.value === 'US') {
      if (!entry.courtAddress.state?.value?.trim()) {
        errors.push('State is required for US addresses');
      }
      if (!entry.courtAddress.zipCode?.value?.trim()) {
        warnings.push('Zip code is recommended for US addresses');
      }
    }

    // Date format validation
    const datePattern = /^\d{1,2}\/\d{4}$/;
    if (entry.dateOfAction.date.value && !datePattern.test(entry.dateOfAction.date.value)) {
      warnings.push('Date should be in MM/YYYY format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [section28Data]);

  const validateAllCourtActions = useCallback((): Section28ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const courtActionResults: CourtActionValidationResult[] = [];

    // Validate main question
    if (!section28Data.section28.hasCourtActions.value) {
      errors.push('Court actions question must be answered');
    }

    // If YES was selected, validate entries
    if (section28Data.section28.hasCourtActions.value === "YES") {
      if (section28Data.section28.courtActionEntries.length === 0) {
        errors.push('At least one court action entry is required when "YES" is selected');
      } else {
        // Validate each entry
        section28Data.section28.courtActionEntries.forEach((_, index) => {
          const result = validateCourtAction(index);
          courtActionResults.push(result);

          if (!result.isValid) {
            errors.push(...result.errors.map(error => `Entry ${index + 1}: ${error}`));
          }

          warnings.push(...result.warnings.map(warning => `Entry ${index + 1}: ${warning}`));
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      courtActionResults
    };
  }, [section28Data, validateCourtAction]);

  const validateSection = useCallback((): ValidationResult => {
    // Skip validation on initial render to avoid infinite loops
    if (!isInitialized) {
      return {
        isValid: true,
        errors: [],
        warnings: []
      };
    }

    const validationResult = validateAllCourtActions();
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Convert string errors to ValidationError objects
    validationResult.errors.forEach(error => {
      validationErrors.push({
        field: 'general',
        message: error,
        code: 'VALIDATION_ERROR',
        severity: 'error'
      });
    });

    validationResult.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'general',
        message: warning,
        code: 'VALIDATION_WARNING',
        severity: 'warning'
      });
    });

    // Update local errors
    const newErrors: Record<string, string> = {};
    validationErrors.forEach(error => {
      newErrors[error.field] = error.message;
    });

    // Only update errors if they actually changed and component is initialized
    const currentErrorKeys = Object.keys(errors);
    const newErrorKeys = Object.keys(newErrors);
    const errorsChanged =
      currentErrorKeys.length !== newErrorKeys.length ||
      currentErrorKeys.some(key => errors[key] !== newErrors[key]);

    if (errorsChanged) {
      setErrors(newErrors);
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [validateAllCourtActions, isInitialized, errors]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updateHasCourtActions = useCallback((value: "YES" | "NO (If NO, proceed to Section 29)") => {
    setSection28Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section28.hasCourtActions.value = value;

      // Clear entries if NO is selected
      if (value === "NO (If NO, proceed to Section 29)") {
        newData.section28.courtActionEntries = [];
        console.log('🧹 Section28: Cleared court action entries because value is NO');
      }
      // If setting to YES and no entries exist, auto-add the first entry
      else if (value === "YES" && newData.section28.courtActionEntries.length === 0) {
        const newEntry = createDefaultCourtActionEntry(0); // First entry
        newEntry._id = Date.now() + Math.random(); // Set unique ID
        newData.section28.courtActionEntries.push(newEntry);
        console.log('✅ Section28: Auto-added first court action entry when YES selected', newEntry);
      }

      return newData;
    });
  }, []);

  const addCourtAction = useCallback(() => {
    setSection28Data(prevData => {
      const newData = cloneDeep(prevData);

      // Enforce maximum entry limit
      if (newData.section28.courtActionEntries.length >= MAX_COURT_ACTION_ENTRIES) {
        console.warn(`⚠️ Section28: Cannot add more than ${MAX_COURT_ACTION_ENTRIES} court action entries`);
        return prevData; // Return unchanged data
      }

      const entryIndex = newData.section28.courtActionEntries.length; // Use current length as index
      const newEntry = createDefaultCourtActionEntry(entryIndex);
      // Set a unique ID for the entry
      newEntry._id = Date.now() + Math.random();
      newData.section28.courtActionEntries.push(newEntry);
      console.log(`✅ Section28: Added court action entry #${entryIndex + 1}. Total entries: ${newData.section28.courtActionEntries.length}`);
      return newData;
    });
  }, []);

  const removeCourtAction = useCallback((entryId: string) => {
    setSection28Data(prevData => {
      const newData = cloneDeep(prevData);
      const numericId = parseFloat(entryId);
      newData.section28.courtActionEntries = newData.section28.courtActionEntries.filter(
        entry => entry._id !== numericId
      );
      return newData;
    });
  }, []);

  const updateCourtAction = useCallback((entryId: string, updatedEntry: CourtActionEntry) => {
    setSection28Data(prevData => {
      const newData = cloneDeep(prevData);
      const numericId = parseFloat(entryId);
      const entryIndex = newData.section28.courtActionEntries.findIndex(
        entry => entry._id === numericId
      );

      if (entryIndex !== -1) {
        newData.section28.courtActionEntries[entryIndex] = cloneDeep(updatedEntry);
      }

      return newData;
    });
  }, []);

  // Optimized field update method with reduced cloning
  const updateCourtActionField = useCallback((entryIndex: number, fieldPath: string, newValue: any) => {
    setSection28Data(prevData => {
      // Only clone if we're actually making a change
      const entry = prevData.section28.courtActionEntries[entryIndex];
      if (!entry) {
          console.error(`Court action entry ${entryIndex} not found`);
        
        return prevData;
      }

      // Check if the value is actually changing to avoid unnecessary updates
      const pathParts = fieldPath.split('.');
      let current: any = entry;

      // Navigate to the field
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (current[pathParts[i]] === undefined) {
            console.error(`Field path ${fieldPath} not found in court action entry`);
          
          return prevData;
        }
        current = current[pathParts[i]];
      }

      const finalField = pathParts[pathParts.length - 1];
      const currentValue = current[finalField]?.value ?? current[finalField];

      // Skip update if value hasn't changed
      if (currentValue === newValue) {
        return prevData;
      }

      // Only now perform the deep clone since we know we need to update
      const newData = cloneDeep(prevData);
      const newEntry = newData.section28.courtActionEntries[entryIndex];
      let newCurrent: any = newEntry;

      // Navigate to the field in the cloned data
      for (let i = 0; i < pathParts.length - 1; i++) {
        newCurrent = newCurrent[pathParts[i]];
      }

      // Update the field
      if (newCurrent[finalField] && typeof newCurrent[finalField] === 'object' && 'value' in newCurrent[finalField]) {
        newCurrent[finalField].value = newValue;
      } else {
        newCurrent[finalField] = newValue;
      }

      return newData;
    });
  }, []);

  /**
   * Optimized field update function for integration compatibility
   * Reduced logging and improved performance for real-time input
   */
  const updateFieldValue = useCallback((path: string, value: any) => {
    // Only log in debug mode to improve performance
      console.log(`🔍 Section28: updateFieldValue path=${path}`);
    

    // Parse path to update the correct field
    if (path === 'section28.hasCourtActions' || path === 'hasCourtActions') {
      updateHasCourtActions(value);
      return;
    }

    if (path.startsWith('section28.courtActionEntries') || path.includes('courtActionEntries')) {
      // Optimized path parsing
      let entryIndex: number;
      let fieldPath: string;

      // Handle array bracket notation first (most common)
      const bracketMatch = path.match(/courtActionEntries\[(\d+)\]\.(.+)/);
      if (bracketMatch) {
        entryIndex = parseInt(bracketMatch[1]);
        fieldPath = bracketMatch[2];
      } else {
        // Handle dot notation
        const pathParts = path.split('.');
        const entriesIndex = pathParts.findIndex(part => part === 'courtActionEntries');
        if (entriesIndex >= 0 && pathParts.length > entriesIndex + 2) {
          entryIndex = parseInt(pathParts[entriesIndex + 1]);
          fieldPath = pathParts.slice(entriesIndex + 2).join('.');
        } else {
          console.error(`Section28: Invalid path format: ${path}`);

          return;
        }
      }

      updateCourtActionField(entryIndex, fieldPath, value);
      return;
    }

    console.warn(`Section28: Unhandled field path: ${path}`);

  }, [updateHasCourtActions, updateCourtActionField]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getCourtActionEntryCount = useCallback(() => {
    return section28Data.section28.courtActionEntries.length;
  }, [section28Data]);

  const getCourtActionEntry = useCallback((entryIndex: number): CourtActionEntry | undefined => {
    return section28Data.section28.courtActionEntries[entryIndex];
  }, [section28Data]);

  const resetSection = useCallback(() => {
    const freshData = createInitialSection28State();
    setSection28Data(freshData);
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section28) => {
    setSection28Data(cloneDeep(data));
    setErrors({});
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    if (isDirty) {
      changes.section28 = {
        oldValue: initialData,
        newValue: section28Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [isDirty, initialData, section28Data]);

  // ============================================================================
  // SF86FORM CONTEXT SYNCHRONIZATION
  // ============================================================================

  // Sync with SF86FormContext when data is loaded
  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

    if (sf86Form.formData.section28 && sf86Form.formData.section28 !== section28Data) {
      if (isDebugMode) {
        console.log('🔄 Section28: Syncing with SF86FormContext loaded data');
      }

      // Load the data from SF86FormContext
      loadSection(sf86Form.formData.section28);

      if (isDebugMode) {
        console.log('✅ Section28: Data sync complete');
      }
    }
  }, [sf86Form.formData.section28, loadSection]);

  // ============================================================================
  // SF86FORM INTEGRATION - Following Section 29 pattern
  // ============================================================================

  // Optimized wrapper function with minimal overhead
  const updateFieldValueWrapper = useCallback((path: string, value: any) => {
    // Direct call to updateFieldValue with minimal processing
    // Only normalize path if necessary
    const targetPath = path.startsWith('section28.') || path.includes('courtActionEntries')
      ? path
      : `section28.${path}`;

    updateFieldValue(targetPath, value);
  }, [updateFieldValue]);



  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section28ContextType = {
    // State - Updated property names to match component expectations
    sectionData: section28Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions - Updated function names to match component expectations
    updateHasCourtActions,
    addCourtAction,
    removeCourtAction,
    updateCourtAction,
    updateFieldValue,

    // Utility Functions
    getCourtActionEntryCount,
    getCourtActionEntry,

    // Validation
    validateSection,
    validateCourtAction,
    validateAllCourtActions,

    // Utility
    resetSection,
    loadSection,
    getChanges
  };

  return (
    <Section28Context.Provider value={contextValue}>
      {children}
    </Section28Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection28 = (): Section28ContextType => {
  const context = useContext(Section28Context);
  if (context === undefined) {
    throw new Error('useSection28 must be used within a Section28Provider');
  }
  return context;
};

// ============================================================================
// EXPORT
// ============================================================================

export default Section28Provider;