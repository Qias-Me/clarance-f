/**
 * Section 14: Selective Service - Context Provider
 *
 * React context provider for SF-86 Section 14 using the new Form Architecture 2.0.
 * This provider manages selective service registration data with full CRUD operations,
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
  Section14,
  Section14SubsectionKey,
  Section14FieldUpdate,
  Section14ValidationRules,
  Section14ValidationContext,
  SelectiveServiceValidationResult
} from '../../../../api/interfaces/sections2.0/section14';
import {
  createDefaultSection14,
  validateSelectiveService,
  updateSection14Field,
  DEFAULT_SECTION14_VALIDATION_RULES,
  isSection14Complete,
  getActiveExplanationField
} from '../../../../api/interfaces/sections2.0/section14';

import { useSection86FormIntegration } from '../shared/section-context-integration';
import type { ValidationResult, ValidationError, ChangeSet } from '../shared/base-interfaces';

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section14ContextType {
  // State
  section14Data: Section14;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updateSelectiveServiceInfo: (fieldPath: string, value: string) => void;
  updateRegistrationStatus: (status: string) => void;
  updateRegistrationNumber: (number: string) => void;
  updateExplanation: (type: 'no' | 'unknown', explanation: string) => void;
  updateMilitaryServiceStatus: (status: string) => void;
  updateFieldValue: (path: string, value: any) => void;

  // Validation
  validateSection: () => ValidationResult;
  validateSelectiveServiceInfo: () => SelectiveServiceValidationResult;
  isComplete: () => boolean;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section14) => void;
  getChanges: () => any;
  getActiveExplanationField: () => 'registrationNumber' | 'noRegistrationExplanation' | 'unknownStatusExplanation' | null;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

// Use the DRY approach with sections-references instead of hardcoded values
const createInitialSection14State = (): Section14 => {
  return createDefaultSection14();
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section14Context = createContext<Section14ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section14ProviderProps {
  children: React.ReactNode;
}

export const Section14Provider: React.FC<Section14ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section14Data, setSection14Data] = useState<Section14>(createInitialSection14State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section14>(createInitialSection14State());
  const [isInitialized, setIsInitialized] = useState(false);

  // Integration with the central SF86FormContext - will be initialized below

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(section14Data) !== JSON.stringify(initialData);

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

    // Validate selective service information
    const validationContext: Section14ValidationContext = {
      rules: DEFAULT_SECTION14_VALIDATION_RULES,
      allowPartialCompletion: false
    };

    const selectiveServiceValidation = validateSelectiveService(section14Data.section14, validationContext);

    if (!selectiveServiceValidation.isValid) {
      selectiveServiceValidation.errors.forEach(error => {
        validationErrors.push({
          field: 'selectiveService',
          message: error,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      });
    }

    selectiveServiceValidation.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'selectiveService',
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
  }, [section14Data]);

  const validateSelectiveServiceInfo = useCallback((): SelectiveServiceValidationResult => {
    const validationContext: Section14ValidationContext = {
      rules: DEFAULT_SECTION14_VALIDATION_RULES,
      allowPartialCompletion: false
    };

    return validateSelectiveService(section14Data.section14, validationContext);
  }, [section14Data]);

  const isComplete = useCallback((): boolean => {
    return isSection14Complete(section14Data);
  }, [section14Data]);

  const getActiveExplanationFieldCallback = useCallback(() => {
    return getActiveExplanationField(section14Data.section14.registrationStatus.value);
  }, [section14Data.section14.registrationStatus.value]);

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
  }, [section14Data, isInitialized, errors]); // Removed validateSection to prevent infinite loops

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updateSelectiveServiceInfo = useCallback((fieldPath: string, value: string) => {
    setSection14Data(prevData => {
      const newData = updateSection14Field(prevData, { fieldPath, newValue: value });
      return newData;
    });
  }, []);

  const updateRegistrationStatus = useCallback((status: string) => {
    updateSelectiveServiceInfo('section14.registrationStatus', status);
  }, [updateSelectiveServiceInfo]);

  const updateRegistrationNumber = useCallback((number: string) => {
    updateSelectiveServiceInfo('section14.registrationNumber', number);
  }, [updateSelectiveServiceInfo]);

  const updateExplanation = useCallback((type: 'no' | 'unknown', explanation: string) => {
    const fieldPath = type === 'no' 
      ? 'section14.noRegistrationExplanation' 
      : 'section14.unknownStatusExplanation';
    updateSelectiveServiceInfo(fieldPath, explanation);
  }, [updateSelectiveServiceInfo]);

  const updateMilitaryServiceStatus = useCallback((status: string) => {
    updateSelectiveServiceInfo('section14.militaryServiceStatus', status);
  }, [updateSelectiveServiceInfo]);

  const updateFieldValue = useCallback((path: string, value: any) => {
    // Parse path to update the correct field
    if (path === 'section14.registrationStatus') {
      updateRegistrationStatus(value);
    } else if (path === 'section14.registrationNumber') {
      updateRegistrationNumber(value);
    } else if (path === 'section14.noRegistrationExplanation') {
      updateExplanation('no', value);
    } else if (path === 'section14.unknownStatusExplanation') {
      updateExplanation('unknown', value);
    } else if (path === 'section14.militaryServiceStatus') {
      updateMilitaryServiceStatus(value);
    }
  }, [updateRegistrationStatus, updateRegistrationNumber, updateExplanation, updateMilitaryServiceStatus]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const defaultData = createDefaultSection14();
    setSection14Data(defaultData);
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section14) => {
    setSection14Data(cloneDeep(data));
    setErrors({});
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Simple change detection - compare with initial data
    if (JSON.stringify(section14Data) !== JSON.stringify(initialData)) {
      changes['section14'] = {
        oldValue: initialData,
        newValue: section14Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section14Data, initialData]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Integration with main form context using standard pattern
  // Note: integration variable is used internally by the hook for registration
  const integration = useSection86FormIntegration(
    'section14',
    'Section 14: Selective Service',
    section14Data,
    setSection14Data,
    () => ({ isValid: validateSection().isValid, errors: validateSection().errors, warnings: validateSection().warnings }),
    getChanges,
    updateFieldValue // Pass Section 14's updateFieldValue function to integration
  );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section14ContextType = {
    // State
    section14Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updateSelectiveServiceInfo,
    updateRegistrationStatus,
    updateRegistrationNumber,
    updateExplanation,
    updateMilitaryServiceStatus,
    updateFieldValue,

    // Validation
    validateSection,
    validateSelectiveServiceInfo,
    isComplete,

    // Utility
    resetSection,
    loadSection,
    getChanges,
    getActiveExplanationField: getActiveExplanationFieldCallback
  };

  return (
    <Section14Context.Provider value={contextValue}>
      {children}
    </Section14Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection14 = (): Section14ContextType => {
  const context = useContext(Section14Context);
  if (context === undefined) {
    throw new Error('useSection14 must be used within a Section14Provider');
  }
  return context;
}; 