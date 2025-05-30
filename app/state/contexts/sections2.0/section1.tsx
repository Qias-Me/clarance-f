/**
 * Section 1: Information About You - Context Provider
 *
 * React context provider for SF-86 Section 1 using the new Form Architecture 2.0.
 * This provider manages personal information data with full CRUD operations,
 * validation, and integration with the central SF86FormContext.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef
} from 'react';
import cloneDeep from 'lodash.clonedeep';
import set from 'lodash.set';
import type {
  Section1,
  Section1SubsectionKey,
  Section1FieldUpdate,
  Section1ValidationRules,
  Section1ValidationContext,
  NameValidationResult
} from '../../../../api/interfaces/sections2.0/section1';
import {
  createDefaultSection1,
  validateFullName,
  updateSection1Field
} from '../../../../api/interfaces/sections2.0/section1';

import { useSection86FormIntegration } from '../shared/section-context-integration';
import type { ValidationResult, ValidationError } from '../shared/base-interfaces';

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section1ContextType {
  // State
  section1Data: Section1;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updatePersonalInfo: (fieldPath: string, value: string) => void;
  updateFullName: (update: Section1FieldUpdate) => void;

  // Validation
  validateSection: () => ValidationResult;
  validateFullName: () => NameValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section1) => void;
  getChanges: () => any;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

const createInitialSection1State = (): Section1 => ({
  _id: 1,
  personalInfo: {
    fullName: {
      lastName: {
        value: '',
        id: "form1[0].Sections1-6[0].TextField11[0]",
        type: 'text',
        label: 'Last Name',
        rect: { x: 0, y: 0, width: 0, height: 0 }
      },
      firstName: {
        value: '',
        id: "form1[0].Sections1-6[0].TextField11[1]",
        type: 'text',
        label: 'First Name',
        rect: { x: 0, y: 0, width: 0, height: 0 }
      },
      middleName: {
        value: '',
        id: "form1[0].Sections1-6[0].TextField11[2]",
        type: 'text',
        label: 'Middle Name',
        rect: { x: 0, y: 0, width: 0, height: 0 }
      },
      suffix: {
        value: '',
        id: "form1[0].Sections1-6[0].suffix[0]",
        type: 'text',
        label: 'Suffix',
        rect: { x: 0, y: 0, width: 0, height: 0 }
      }
    }
  }
});

// ============================================================================
// VALIDATION RULES
// ============================================================================

const defaultValidationRules: Section1ValidationRules = {
  requiresLastName: true,
  requiresFirstName: true,
  allowsMiddleNameEmpty: true,
  allowsSuffixEmpty: true,
  maxNameLength: 50
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section1Context = createContext<Section1ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section1ProviderProps {
  children: React.ReactNode;
}

export const Section1Provider: React.FC<Section1ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section1Data, setSection1Data] = useState<Section1>(createInitialSection1State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section1>(createInitialSection1State());

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(section1Data) !== JSON.stringify(initialData);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Validate full name
    const validationContext: Section1ValidationContext = {
      rules: defaultValidationRules,
      allowInitialsOnly: false
    };

    const nameValidation = validateFullName(section1Data.personalInfo.fullName, validationContext);

    if (!nameValidation.isValid) {
      nameValidation.errors.forEach(error => {
        validationErrors.push({
          field: 'fullName',
          message: error,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      });
    }

    nameValidation.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'fullName',
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
    setErrors(newErrors);

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section1Data]);

  const validateFullNameOnly = useCallback((): NameValidationResult => {
    const validationContext: Section1ValidationContext = {
      rules: defaultValidationRules,
      allowInitialsOnly: false
    };

    return validateFullName(section1Data.personalInfo.fullName, validationContext);
  }, [section1Data]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updatePersonalInfo = useCallback((fieldPath: string, value: string) => {
    setSection1Data(prevData => {
      const newData = cloneDeep(prevData);
      set(newData, `personalInfo.fullName.${fieldPath}.value`, value);
      return newData;
    });
  }, []);

  const updateFullNameField = useCallback((update: Section1FieldUpdate) => {
    setSection1Data(prevData => {
      return updateSection1Field(prevData, update);
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = createInitialSection1State();
    setSection1Data(newData);
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section1) => {
    setSection1Data(cloneDeep(data));
    setErrors({});
  }, []);

  const getChanges = useCallback(() => {
    return isDirty ? { section1: section1Data } : {};
  }, [section1Data, isDirty]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Integration with main form context (optional)
  // const integration = useSection86FormIntegration(
  //   'section1',
  //   'Section 1: Information About You',
  //   section1Data,
  //   setSection1Data,
  //   validateSection,
  //   getChanges
  // );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section1ContextType = {
    // State
    section1Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updatePersonalInfo,
    updateFullName: updateFullNameField,

    // Validation
    validateSection,
    validateFullName: validateFullNameOnly,

    // Utility
    resetSection,
    loadSection,
    getChanges
  };

  return (
    <Section1Context.Provider value={contextValue}>
      {children}
    </Section1Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection1 = (): Section1ContextType => {
  const context = useContext(Section1Context);
  if (!context) {
    throw new Error('useSection1 must be used within a Section1Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section1Provider;
