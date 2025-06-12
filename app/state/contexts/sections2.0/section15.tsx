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

import type { ValidationResult, ValidationError, ChangeSet } from '../shared/base-interfaces';
import {
  validateSectionFieldCount,
} from "../../../../api/utils/sections-references-loader";
import { useSF86Form } from './SF86FormContext';

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

  // Section-level Parent Questions (with auto-generation)
  updateHasServed: (value: "YES" | "NO") => void;
  updateHasBeenSubjectToDisciplinary: (value: "YES" | "NO") => void;
  updateHasServedInForeignMilitary: (value: "YES" | "NO") => void;

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

const Section15Provider: React.FC<Section15ProviderProps> = ({ children }) => {
  // console.log('🔄 Section15Provider: Provider initializing...');

  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section15Data, setSection15Data] = useState<Section15>(createInitialSection15State());
  const [isLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section15>(createInitialSection15State());
  const [isInitialized, setIsInitialized] = useState(false);

  // SF86 Form Context for data persistence and synchronization
  const sf86Form = useSF86Form();

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
  // SECTION-LEVEL PARENT QUESTIONS (with auto-generation)
  // ============================================================================

  const updateHasServed = useCallback((value: "YES" | "NO") => {
    console.log(`🔧 Section15: updateHasServed called with value=${value}`);
    setSection15Data(prevData => {
      console.log(`🔍 Section15: Current prevData structure:`, prevData);
      console.log(`🔍 Section15: prevData.section15:`, prevData.section15);
      console.log(`🔍 Section15: prevData.section15.hasServed:`, prevData.section15.hasServed);

      const newData = cloneDeep(prevData);
      console.log(`🔍 Section15: newData after cloneDeep:`, newData);
      console.log(`🔍 Section15: newData.section15.hasServed after cloneDeep:`, newData.section15.hasServed);

      // Ensure hasServed field exists
      if (!newData.section15.hasServed) {
        console.log(`🔧 Section15: hasServed field missing, initializing manually...`);
        newData.section15.hasServed = {
          value: "NO",
          options: ["YES", "NO"],
          id: "hasServed",
          name: "hasServed",
          type: "radio",
          label: "Have you ever served in the U.S. Military?"
        };
        console.log(`🔍 Section15: newData.section15.hasServed after manual initialization:`, newData.section15.hasServed);
      }

      console.log(`🔍 Section15: About to set value on:`, newData.section15.hasServed);
      newData.section15.hasServed.value = value;

      // If setting to NO, clear entries
      if (value === "NO") {
        newData.section15.militaryService = [];
        console.log(`🧹 Section15: Cleared military service entries because value is NO`);
      }
      // If setting to YES and no entries exist, auto-add the first entry
      else if (value === "YES" && newData.section15.militaryService.length === 0) {
        const newEntry = createDefaultMilitaryServiceEntry();
        newData.section15.militaryService.push(newEntry);
        console.log(`✅ Section15: Auto-added first military service entry when YES selected`, newEntry);
      }

      console.log(`✅ Section15: Updated hasServed to ${value}`, newData.section15);
      return newData;
    });
  }, []);

  const updateHasBeenSubjectToDisciplinary = useCallback((value: "YES" | "NO") => {
    console.log(`🔧 Section15: updateHasBeenSubjectToDisciplinary called with value=${value}`);
    setSection15Data(prevData => {
      const newData = cloneDeep(prevData);

      // Ensure hasBeenSubjectToDisciplinary field exists
      if (!newData.section15.hasBeenSubjectToDisciplinary) {
        console.log(`🔧 Section15: hasBeenSubjectToDisciplinary field missing, initializing manually...`);
        newData.section15.hasBeenSubjectToDisciplinary = {
          value: "NO",
          options: ["YES", "NO"],
          id: "hasBeenSubjectToDisciplinary",
          name: "hasBeenSubjectToDisciplinary",
          type: "radio",
          label: "Have you been subject to court martial or disciplinary procedure?"
        };
      }

      newData.section15.hasBeenSubjectToDisciplinary.value = value;

      // If setting to NO, clear entries
      if (value === "NO") {
        newData.section15.disciplinaryProcedures = [];
        console.log(`🧹 Section15: Cleared disciplinary entries because value is NO`);
      }
      // If setting to YES and no entries exist, auto-add the first entry
      else if (value === "YES" && newData.section15.disciplinaryProcedures.length === 0) {
        const newEntry = createDefaultDisciplinaryEntry();
        newData.section15.disciplinaryProcedures.push(newEntry);
        console.log(`✅ Section15: Auto-added first disciplinary entry when YES selected`, newEntry);
      }

      console.log(`✅ Section15: Updated hasBeenSubjectToDisciplinary to ${value}`, newData.section15);
      return newData;
    });
  }, []);

  const updateHasServedInForeignMilitary = useCallback((value: "YES" | "NO") => {
    console.log(`🔧 Section15: updateHasServedInForeignMilitary called with value=${value}`);
    setSection15Data(prevData => {
      const newData = cloneDeep(prevData);

      // Ensure hasServedInForeignMilitary field exists
      if (!newData.section15.hasServedInForeignMilitary) {
        console.log(`🔧 Section15: hasServedInForeignMilitary field missing, initializing manually...`);
        newData.section15.hasServedInForeignMilitary = {
          value: "NO",
          options: ["YES", "NO"],
          id: "hasServedInForeignMilitary",
          name: "hasServedInForeignMilitary",
          type: "radio",
          label: "Have you served in a foreign military organization?"
        };
      }

      newData.section15.hasServedInForeignMilitary.value = value;

      // If setting to NO, clear entries
      if (value === "NO") {
        newData.section15.foreignMilitaryService = [];
        console.log(`🧹 Section15: Cleared foreign military service entries because value is NO`);
      }
      // If setting to YES and no entries exist, auto-add the first entry
      else if (value === "YES" && newData.section15.foreignMilitaryService.length === 0) {
        const newEntry = createDefaultForeignMilitaryEntry();
        newData.section15.foreignMilitaryService.push(newEntry);
        console.log(`✅ Section15: Auto-added first foreign military service entry when YES selected`, newEntry);
      }

      console.log(`✅ Section15: Updated hasServedInForeignMilitary to ${value}`, newData.section15);
      return newData;
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
      return getVisibleFields(section15Data.section15.militaryService[index], section15Data.section15);
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

    // Preserve parent questions if they exist in current data but not in incoming data
    const mergedData = { ...data };
    if (section15Data.section15.hasServed && !data.section15.hasServed) {
      console.log(`🔧 Section15: Preserving current hasServed field`);
      mergedData.section15.hasServed = section15Data.section15.hasServed;
    }
    if (section15Data.section15.hasBeenSubjectToDisciplinary && !data.section15.hasBeenSubjectToDisciplinary) {
      console.log(`🔧 Section15: Preserving current hasBeenSubjectToDisciplinary field`);
      mergedData.section15.hasBeenSubjectToDisciplinary = section15Data.section15.hasBeenSubjectToDisciplinary;
    }
    if (section15Data.section15.hasServedInForeignMilitary && !data.section15.hasServedInForeignMilitary) {
      console.log(`🔧 Section15: Preserving current hasServedInForeignMilitary field`);
      mergedData.section15.hasServedInForeignMilitary = section15Data.section15.hasServedInForeignMilitary;
    }

    // If incoming data has entries or current data is empty, load the new data
    console.log(`✅ Section15: Loading merged data`);
    setSection15Data(mergedData);
  }, []);

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
  // SF86 FORM CONTEXT SYNCHRONIZATION
  // ============================================================================

  // Sync with SF86FormContext when data is loaded
  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

    if (sf86Form.formData.section15 && sf86Form.formData.section15 !== section15Data) {
      if (isDebugMode) {
        console.log('🔄 Section15: Syncing with SF86FormContext loaded data');
      }

      // Load the data from SF86FormContext
      loadSection(sf86Form.formData.section15);

      if (isDebugMode) {
        console.log('✅ Section15: Data sync complete');
      }
    }
  }, [sf86Form.formData.section15, loadSection]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section15ContextType = {
    // State
    section15Data,
    isLoading,
    errors,
    isDirty,

    // Section-level Parent Questions (with auto-generation)
    updateHasServed,
    updateHasBeenSubjectToDisciplinary,
    updateHasServedInForeignMilitary,

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

export default Section15Provider;