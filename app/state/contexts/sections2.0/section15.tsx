/**
 * Section 15: Military History - Context Provider
 *
 * React context provider for SF-86 Section 15 using the new Form Architecture 2.0.
 * This provider manages military history data with full CRUD operations for military service,
 * disciplinary procedures, and foreign military service with validation and integration.
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
  Section15,
  Section15SubsectionKey,
  Section15ValidationRules,
  Section15ValidationContext,
  MilitaryHistoryValidationResult,
  ForeignMilitaryServiceEntry
} from '../../../../api/interfaces/sections2.0/section15';
import {
  createDefaultSection15,
  createDefaultMilitaryServiceEntry,
  createDefaultDisciplinaryEntry,
  createDefaultForeignMilitaryEntry,
  validateMilitaryHistory,
  isSection15Complete,
  getVisibleFields
} from '../../../../api/interfaces/sections2.0/section15';

import { useSection86FormIntegration } from '../shared/section-context-integration';
import type { ValidationResult, ValidationError, ChangeSet } from '../shared/base-interfaces';
import {
  validateSectionFieldCount,
} from "../../../../api/utils/sections-references-loader";

// ============================================================================
// VALIDATION RULES
// ============================================================================

const DEFAULT_SECTION15_VALIDATION_RULES: Section15ValidationRules = {
  requiresMilitaryServiceStatus: true,
  requiresServiceDetailsIfServed: true,
  requiresDischargeInfoIfCompleted: true,
  requiresDisciplinaryDetailsIfYes: true,
  requiresForeignServiceDetailsIfYes: true,
  requiresContactInfoForForeignService: true,
  maxDescriptionLength: 2000,
  maxServiceNumberLength: 20
};

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section15ContextType {
  // State
  section15Data: Section15;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Military Service Actions
  addMilitaryServiceEntry: () => void;
  removeMilitaryServiceEntry: (index: number) => void;
  updateMilitaryServiceEntry: (index: number, fieldPath: string, value: any) => void;
  updateMilitaryServiceStatus: (index: number, status: string) => void;
  updateMilitaryServiceBranch: (index: number, branch: string) => void;
  updateMilitaryServiceDates: (index: number, type: 'from' | 'to', month: string, year: string) => void;

  // Disciplinary Actions
  addDisciplinaryEntry: () => void;
  removeDisciplinaryEntry: (index: number) => void;
  updateDisciplinaryEntry: (index: number, fieldPath: string, value: any) => void;
  updateDisciplinaryStatus: (index: number, status: string) => void;

  // Foreign Military Actions
  addForeignMilitaryEntry: () => void;
  removeForeignMilitaryEntry: (index: number) => void;
  updateForeignMilitaryEntry: (index: number, fieldPath: string, value: any) => void;
  updateForeignMilitaryStatus: (index: number, status: string) => void;

  // Cross-Section Support: Handle Section16_1 fields that map to Section 15 Entry 2
  updateForeignOrganizationContact: (contact: Partial<ForeignMilitaryServiceEntry>) => void;

  // General Field Updates
  updateFieldValue: (path: string, value: any) => void;

  // Validation
  validateSection: () => ValidationResult;
  validateMilitaryHistoryInfo: () => MilitaryHistoryValidationResult;
  isComplete: () => boolean;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section15) => void;
  getChanges: () => any;
  getVisibleFieldsForEntry: (entryType: Section15SubsectionKey, index: number) => string[];
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

/**
 * DRY Initial State Creation using sections-references data
 * This eliminates hardcoded values and uses the single source of truth
 */
const createInitialSection15State = (): Section15 => {
  // Validate field count against sections-references
  validateSectionFieldCount(15, 95);

  return createDefaultSection15();
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section15Context = createContext<Section15ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section15ProviderProps {
  children: React.ReactNode;
}

export const Section15Provider: React.FC<Section15ProviderProps> = ({ children }) => {
  // console.log('🔄 Section15Provider: Provider initializing...');

  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section15Data, setSection15Data] = useState<Section15>(createInitialSection15State());
  const [isLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section15>(createInitialSection15State());
  const [isInitialized, setIsInitialized] = useState(false);

  // console.log('🔍 Section15Provider: State initialized', {
  //   section15Data,
  //   isLoading,
  //   errors,
  //   isInitialized,
  //   isDirty: JSON.stringify(section15Data) !== JSON.stringify(initialData)
  // });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(section15Data) !== JSON.stringify(initialData);

  // Set initialized flag after component mounts
  useEffect(() => {
    setIsInitialized(true);
  }, []);



  // ============================================================================
  // MILITARY SERVICE ACTIONS
  // ============================================================================

  const addMilitaryServiceEntry = useCallback(() => {
    setSection15Data(prev => ({
      ...prev,
      section15: {
        ...prev.section15,
        militaryService: [...prev.section15.militaryService, createDefaultMilitaryServiceEntry()]
      }
    }));
  }, []);

  const removeMilitaryServiceEntry = useCallback((index: number) => {
    setSection15Data(prev => ({
      ...prev,
      section15: {
        ...prev.section15,
        militaryService: prev.section15.militaryService.filter((_, i) => i !== index)
      }
    }));
  }, []);

  const updateMilitaryServiceEntry = useCallback((index: number, fieldPath: string, value: any) => {
    setSection15Data(prev => {
      const newData = cloneDeep(prev);
      set(newData, `section15.militaryService.${index}.${fieldPath}`, value);
      return newData;
    });
  }, []);

  const updateMilitaryServiceStatus = useCallback((index: number, status: string) => {
    updateMilitaryServiceEntry(index, 'hasServed.value', status);
  }, [updateMilitaryServiceEntry]);

  const updateMilitaryServiceBranch = useCallback((index: number, branch: string) => {
    updateMilitaryServiceEntry(index, 'branch.value', branch);
  }, [updateMilitaryServiceEntry]);

  const updateMilitaryServiceDates = useCallback((index: number, type: 'from' | 'to', month: string, year: string) => {
    updateMilitaryServiceEntry(index, `${type}Date.month.value`, month);
    updateMilitaryServiceEntry(index, `${type}Date.year.value`, year);
  }, [updateMilitaryServiceEntry]);

  // ============================================================================
  // DISCIPLINARY ACTIONS
  // ============================================================================

  const addDisciplinaryEntry = useCallback(() => {
    setSection15Data(prev => ({
      ...prev,
      section15: {
        ...prev.section15,
        disciplinaryProcedures: [...prev.section15.disciplinaryProcedures, createDefaultDisciplinaryEntry()]
      }
    }));
  }, []);

  const removeDisciplinaryEntry = useCallback((index: number) => {
    setSection15Data(prev => ({
      ...prev,
      section15: {
        ...prev.section15,
        disciplinaryProcedures: prev.section15.disciplinaryProcedures.filter((_, i) => i !== index)
      }
    }));
  }, []);

  const updateDisciplinaryEntry = useCallback((index: number, fieldPath: string, value: any) => {
    setSection15Data(prev => {
      const newData = cloneDeep(prev);
      set(newData, `section15.disciplinaryProcedures.${index}.${fieldPath}`, value);
      return newData;
    });
  }, []);

  const updateDisciplinaryStatus = useCallback((index: number, status: string) => {
    updateDisciplinaryEntry(index, 'hasBeenSubjectToDisciplinary.value', status);
  }, [updateDisciplinaryEntry]);

  // ============================================================================
  // FOREIGN MILITARY ACTIONS
  // ============================================================================

  const addForeignMilitaryEntry = useCallback(() => {
    setSection15Data(prev => ({
      ...prev,
      section15: {
        ...prev.section15,
        foreignMilitaryService: [...prev.section15.foreignMilitaryService, createDefaultForeignMilitaryEntry()]
      }
    }));
  }, []);

  const removeForeignMilitaryEntry = useCallback((index: number) => {
    setSection15Data(prev => ({
      ...prev,
      section15: {
        ...prev.section15,
        foreignMilitaryService: prev.section15.foreignMilitaryService.filter((_, i) => i !== index)
      }
    }));
  }, []);

  const updateForeignMilitaryEntry = useCallback((index: number, fieldPath: string, value: any) => {
    setSection15Data(prev => {
      const newData = cloneDeep(prev);
      set(newData, `section15.foreignMilitaryService.${index}.${fieldPath}`, value);
      return newData;
    });
  }, []);

  const updateForeignMilitaryStatus = useCallback((index: number, status: string) => {
    updateForeignMilitaryEntry(index, 'hasServedInForeignMilitary.value', status);
  }, [updateForeignMilitaryEntry]);

  // ============================================================================
  // CROSS-SECTION SUPPORT: Section16_1 → Section 15 Entry 2
  // ============================================================================

  const updateForeignOrganizationContact = useCallback((contact: Partial<ForeignMilitaryServiceEntry>) => {
    // Ensure we have at least 2 foreign military entries (Entry 1 from Section15_3, Entry 2 from Section16_1)
    setSection15Data(prev => {
      const currentEntries = prev.section15.foreignMilitaryService;
      const updatedEntries = [...currentEntries];

      // Ensure we have at least 2 entries
      while (updatedEntries.length < 2) {
        updatedEntries.push(createDefaultForeignMilitaryEntry());
      }

      // Update Entry 2 (index 1) with the contact information from Section16_1 fields
      updatedEntries[1] = {
        ...updatedEntries[1],
        ...contact
      };

      return {
        ...prev,
        section15: {
          ...prev.section15,
          foreignMilitaryService: updatedEntries
        }
      };
    });
  }, []);

  // ============================================================================
  // GENERAL FIELD UPDATES
  // ============================================================================

  const updateFieldValue = useCallback((path: string, value: any) => {
    console.log('🔄 Section15: updateFieldValue called', {
      path,
      value
    });

    setSection15Data(prev => {
      const newData = cloneDeep(prev);
      console.log('🔍 Section15: Before field update', {
        path,
        value,
        prevData: prev,
        newDataBefore: newData
      });

      set(newData, path, value);

      console.log('🔍 Section15: After field update', {
        path,
        value,
        newDataAfter: newData,
        fieldValueSet: get(newData, path)
      });

      return newData;
    });
  }, []); // Removed section15Data dependency to prevent infinite loops

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    const validationContext: Section15ValidationContext = {
      rules: DEFAULT_SECTION15_VALIDATION_RULES,
      allowPartialCompletion: false
    };

    const militaryHistoryValidation = validateMilitaryHistory(section15Data.section15, validationContext);

    if (!militaryHistoryValidation.isValid) {
      militaryHistoryValidation.errors.forEach(error => {
        validationErrors.push({
          field: 'militaryHistory',
          message: error,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      });
    }

    militaryHistoryValidation.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'militaryHistory',
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
  }, [section15Data]);

  const validateMilitaryHistoryInfo = useCallback((): MilitaryHistoryValidationResult => {
    const validationContext: Section15ValidationContext = {
      rules: DEFAULT_SECTION15_VALIDATION_RULES,
      allowPartialCompletion: false
    };

    return validateMilitaryHistory(section15Data.section15, validationContext);
  }, [section15Data]);

  const isComplete = useCallback((): boolean => {
    return isSection15Complete(section15Data);
  }, [section15Data]);

  const getVisibleFieldsForEntry = useCallback((entryType: Section15SubsectionKey, index: number): string[] => {
    if (entryType === 'militaryService' && section15Data.section15.militaryService[index]) {
      return getVisibleFields(section15Data.section15.militaryService[index]);
    }
    return [];
  }, [section15Data]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    setSection15Data(createInitialSection15State());
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section15) => {
    console.log(`🔄 Section15: Loading section data`);
    console.log(`📊 Incoming data:`, data);

    // Safeguard: Only load if the incoming data is different and not empty
    const hasCurrentEntries =
      section15Data.section15.militaryService.length > 0 ||
      section15Data.section15.disciplinaryProcedures.length > 0 ||
      section15Data.section15.foreignMilitaryService.length > 0;

    const hasIncomingEntries =
      data.section15.militaryService.length > 0 ||
      data.section15.disciplinaryProcedures.length > 0 ||
      data.section15.foreignMilitaryService.length > 0;

    // If we have current data with entries and incoming data is empty/default, preserve current data
    if (hasCurrentEntries && !hasIncomingEntries) {
      console.log(
        `🛡️ Section15: Preserving current data - incoming data appears to be default/empty`
      );
      return;
    }

    // If incoming data has entries or current data is empty, load the new data
    console.log(`✅ Section15: Loading new data`);
    setSection15Data(data);
  }, [section15Data]);

  const getChanges = useCallback((): ChangeSet => {
    // Return changes for tracking purposes
    const changes: ChangeSet = {};

    if (isDirty) {
      changes['section15'] = {
        oldValue: createInitialSection15State(),
        newValue: section15Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section15Data, isDirty]);

  // ============================================================================
  // FIELD FLATTENING FOR PDF GENERATION
  // ============================================================================

  /**
   * Flatten Section15 data structure into Field objects for PDF generation
   * This converts the nested Section15 structure into a flat object with Field<T> objects
   * TODO: Implement when needed for PDF generation
   */
  // Commented out for now - will implement when needed for PDF generation
  // const flattenSection15Fields = useCallback((): Record<string, any> => { ... }, [section15Data]);

  // ============================================================================
  // SF86 FORM INTEGRATION
  // ============================================================================

  // console.log('🔄 Section15: About to call useSection86FormIntegration...');

  // Create wrapper function for updateFieldValue following Section 29 pattern
  const updateFieldValueWrapper = useCallback((path: string, value: any) => {
    // console.log('🔄 Section15: updateFieldValueWrapper called', { path, value });

    // Parse the path to extract subsection, entry index, and field path
    // Expected format: "section15.subsectionKey.entries[index].fieldPath"
    const pathParts = path.split('.');

    if (pathParts.length >= 4 && pathParts[0] === 'section15') {
      const subsectionKey = pathParts[1] as Section15SubsectionKey;
      const entriesMatch = pathParts[2].match(/entries\[(\d+)\]/);

      if (entriesMatch) {
        const entryIndex = parseInt(entriesMatch[1]);
        const fieldPath = pathParts.slice(3).join('.');

        console.log('🔍 Section15: Parsed path', {
          subsectionKey,
          entryIndex,
          fieldPath,
          value
        });

        // Call the appropriate update function based on subsection
        if (subsectionKey === 'militaryService') {
          updateMilitaryServiceEntry(entryIndex, fieldPath, value);
        } else if (subsectionKey === 'disciplinaryProcedures') {
          updateDisciplinaryEntry(entryIndex, fieldPath, value);
        } else if (subsectionKey === 'foreignMilitaryService') {
          updateForeignMilitaryEntry(entryIndex, fieldPath, value);
        }
        return;
      }
    }

    // Fallback: use lodash set for direct path updates
    console.log('🔍 Section15: Using direct path update', { path, value });
    updateFieldValue(path, value);
  }, [updateFieldValue, updateMilitaryServiceEntry, updateDisciplinaryEntry, updateForeignMilitaryEntry]);

  // Integration with main form context using Section 29 gold standard pattern
  // Note: integration variable is used internally by the hook for registration
  const integration = useSection86FormIntegration(
    'section15',
    'Section 15: Military History',
    section15Data,
    setSection15Data,
    () => ({ isValid: validateSection().isValid, errors: [], warnings: [] }), // Anonymous function like Section 29
    () => getChanges(), // Anonymous function like Section 29
    updateFieldValueWrapper // Pass wrapper function that matches expected signature
  );

  // console.log('🔍 Section15: Integration hook result', { integration });

  // Update errors when section data changes (but not during initial render)
  useEffect(() => {
    if (!isInitialized) return;

    const validationResult = validateSection();
    const newErrors: Record<string, string> = {};

    validationResult.errors.forEach(error => {
      newErrors[error.field] = error.message;
    });

    const currentErrorKeys = Object.keys(errors);
    const newErrorKeys = Object.keys(newErrors);
    const errorsChanged =
      currentErrorKeys.length !== newErrorKeys.length ||
      currentErrorKeys.some(key => errors[key] !== newErrors[key]);

    if (errorsChanged) {
      setErrors(newErrors);
    }
  }, [section15Data, isInitialized, errors, validateSection]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section15ContextType = {
    // State
    section15Data,
    isLoading,
    errors,
    isDirty,

    // Military Service Actions
    addMilitaryServiceEntry,
    removeMilitaryServiceEntry,
    updateMilitaryServiceEntry,
    updateMilitaryServiceStatus,
    updateMilitaryServiceBranch,
    updateMilitaryServiceDates,

    // Disciplinary Actions
    addDisciplinaryEntry,
    removeDisciplinaryEntry,
    updateDisciplinaryEntry,
    updateDisciplinaryStatus,

    // Foreign Military Actions
    addForeignMilitaryEntry,
    removeForeignMilitaryEntry,
    updateForeignMilitaryEntry,
    updateForeignMilitaryStatus,

    // Cross-Section Support
    updateForeignOrganizationContact,

    // General Actions
    updateFieldValue,

    // Validation
    validateSection,
    validateMilitaryHistoryInfo,
    isComplete,

    // Utility
    resetSection,
    loadSection,
    getChanges,
    getVisibleFieldsForEntry
  };

  return (
    <Section15Context.Provider value={contextValue}>
      {children}
    </Section15Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection15 = (): Section15ContextType => {
  const context = useContext(Section15Context);
  if (context === undefined) {
    throw new Error('useSection15 must be used within a Section15Provider');
  }
  return context;
};