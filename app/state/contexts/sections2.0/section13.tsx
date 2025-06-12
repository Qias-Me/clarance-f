/**
 * Section 13: Employment Activities - Context Provider
 *
 * React context provider for SF-86 Section 13 using the new Form Architecture 2.0.
 * This provider manages employment history data with full CRUD operations,
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
import type {
  Section13,
  Section13ValidationRules
} from '../../../../api/interfaces/sections2.0/section13';
import {
  createDefaultSection13,
  updateSection13Field
} from '../../../../api/interfaces/sections2.0/section13';

import type { ValidationResult, ValidationError, ChangeSet } from '../shared/base-interfaces';
import { useSF86Form } from './SF86FormContext';

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section13ContextType {
  // State
  section13Data: Section13;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updateEmploymentInfo: (fieldPath: string, value: string) => void;
  updateFieldValue: (path: string, value: any) => void;

  // Validation
  validateSection: () => ValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section13) => void;
  getChanges: () => any;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

// Use the DRY approach with sections-references instead of hardcoded values
const createInitialSection13State = (): Section13 => {
  return createDefaultSection13();
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

const defaultValidationRules: Section13ValidationRules = {
  requiresEmploymentHistory: true,
  requiresGapExplanation: true,
  maxEmploymentEntries: 10,
  requiresEmployerName: true,
  requiresPositionTitle: true,
  requiresEmploymentDates: true,
  requiresSupervisorInfo: true,
  allowsEstimatedDates: true,
  maxEmployerNameLength: 100,
  maxPositionDescriptionLength: 500,
  maxCommentLength: 1000,
  timeFrameYears: 10
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section13Context = createContext<Section13ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section13ProviderProps {
  children: React.ReactNode;
}

export const Section13Provider: React.FC<Section13ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section13Data, setSection13Data] = useState<Section13>(createInitialSection13State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section13>(createInitialSection13State());
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(section13Data) !== JSON.stringify(initialData);

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

    // Basic validation for employment questions
    if (!section13Data.section13?.hasEmployment?.value) {
      validationErrors.push({
        field: 'hasEmployment',
        message: 'Please indicate if you have employment history',
        code: 'VALIDATION_ERROR',
        severity: 'error'
      });
    }

    // If has gaps, require explanation
    if (section13Data.section13?.hasGaps?.value === 'YES' && 
        !section13Data.section13?.gapExplanation?.value?.trim()) {
      validationErrors.push({
        field: 'gapExplanation',
        message: 'Please provide an explanation for employment gaps',
        code: 'VALIDATION_ERROR',
        severity: 'error'
      });
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section13Data]);

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
  }, [section13Data, isInitialized, errors]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updateEmploymentInfo = useCallback((fieldPath: string, value: string) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      set(newData, `section13.${fieldPath}.value`, value);
      return newData;
    });
  }, []);

  /**
   * Generic field update function for integration compatibility
   * Maps generic field paths to Section 13 specific update functions
   */
  const updateFieldValue = useCallback((path: string, value: any) => {
    setSection13Data(prevData => {
      return updateSection13Field(prevData, { fieldPath: path, newValue: value });
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = createInitialSection13State();
    setSection13Data(newData);
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section13) => {
    setSection13Data(cloneDeep(data));
    setErrors({});
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Simple change detection - compare with initial data
    if (JSON.stringify(section13Data) !== JSON.stringify(initialData)) {
      changes['section13'] = {
        oldValue: initialData,
        newValue: section13Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section13Data, initialData]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================
  // Access SF86FormContext to sync with loaded data
  const sf86Form = useSF86Form();

  // Sync with SF86FormContext when data is loaded
  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

    if (sf86Form.formData.section13 && sf86Form.formData.section13 !== section13Data) {
      if (isDebugMode) {
        console.log('🔄 Section13: Syncing with SF86FormContext loaded data');
      }

      // Load the data from SF86FormContext
      loadSection(sf86Form.formData.section13);

      if (isDebugMode) {
        console.log('✅ Section13: Data sync complete');
      }
    }
  }, [sf86Form.formData.section13, loadSection]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section13ContextType = {
    // State
    section13Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updateEmploymentInfo,
    updateFieldValue,

    // Validation
    validateSection,

    // Utility
    resetSection,
    loadSection,
    getChanges
  };

  return (
    <Section13Context.Provider value={contextValue}>
      {children}
    </Section13Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection13 = (): Section13ContextType => {
  const context = useContext(Section13Context);
  if (!context) {
    throw new Error('useSection13 must be used within a Section13Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section13Provider;
