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
import cloneDeep from 'lodash.clonedeep';
import set from 'lodash.set';
import type {
  Section15,
  Section15SubsectionKey,
  Section15FieldUpdate,
  Section15ValidationRules,
  Section15ValidationContext,
  MilitaryHistoryValidationResult,
  MilitaryServiceEntry,
  MilitaryDisciplinaryEntry,
  ForeignMilitaryServiceEntry
} from '../../../../api/interfaces/sections2.0/section15';
import {
  createDefaultSection15,
  createDefaultMilitaryServiceEntry,
  createDefaultDisciplinaryEntry,
  createDefaultForeignMilitaryEntry,
  validateMilitaryHistory,
  updateSection15Field,
  isSection15Complete,
  getVisibleFields
} from '../../../../api/interfaces/sections2.0/section15';

import { useSection86FormIntegration } from '../shared/section-context-integration';
import type { ValidationResult, ValidationError, ChangeSet } from '../shared/base-interfaces';

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

const createInitialSection15State = (): Section15 => {
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
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section15Data, setSection15Data] = useState<Section15>(createInitialSection15State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section15>(createInitialSection15State());
  const [isInitialized, setIsInitialized] = useState(false);

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
  // GENERAL FIELD UPDATES
  // ============================================================================

  const updateFieldValue = useCallback((path: string, value: any) => {
    setSection15Data(prev => {
      const newData = cloneDeep(prev);
      set(newData, path, value);
      return newData;
    });
  }, []);

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
    setSection15Data(data);
  }, []);

  const getChanges = useCallback(() => {
    // Simple change detection - in production might want more sophisticated diffing
    return section15Data;
  }, [section15Data]);

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
  }, [section15Data, isInitialized, errors]);

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