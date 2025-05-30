/**
 * Section 2: Date of Birth - Context Provider
 *
 * React context provider for SF-86 Section 2 using the new Form Architecture 2.0.
 * This provider manages date of birth data with full CRUD operations,
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
  Section2,
  Section2SubsectionKey,
  Section2FieldUpdate,
  Section2ValidationRules,
  Section2ValidationContext,
  DateValidationResult
} from '../../../../api/interfaces/sections2.0/section2';
import {
  createDefaultSection2,
  validateDateOfBirth,
  updateSection2Field,
  calculateAge
} from '../../../../api/interfaces/sections2.0/section2';
import { useSection86FormIntegration } from '../shared/section-context-integration';
import type { ValidationResult, ValidationError } from '../shared/base-interfaces';

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section2ContextType {
  // State
  section2Data: Section2;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updateDateOfBirth: (date: string) => void;
  updateEstimated: (estimated: boolean) => void;
  updateDateField: (update: Section2FieldUpdate) => void;

  // Computed Values
  getAge: () => number | null;

  // Validation
  validateSection: () => ValidationResult;
  validateDateOfBirth: () => DateValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section2) => void;
  getChanges: () => any;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

const createInitialSection2State = (): Section2 => ({
  _id: 2,
  dateOfBirth: {
    date: {
      value: '',
      id: "form1[0].Sections1-6[0].From_Datefield_Name_2[0]",
      type: 'date',
      label: 'Date of Birth',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    estimated: {
      value: false,
      id: "form1[0].Sections1-6[0].#field[18]",
      type: 'checkbox',
      label: 'Estimated',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    }
  }
});

// ============================================================================
// VALIDATION RULES
// ============================================================================

const defaultValidationRules: Section2ValidationRules = {
  requiresDateOfBirth: true,
  minimumAge: 18,
  maximumAge: 120,
  allowsEstimatedDate: true,
  dateFormat: 'MM/DD/YYYY'
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section2Context = createContext<Section2ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section2ProviderProps {
  children: React.ReactNode;
}

export const Section2Provider: React.FC<Section2ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section2Data, setSection2Data] = useState<Section2>(createInitialSection2State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section2>(createInitialSection2State());

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(section2Data) !== JSON.stringify(initialData);

  const getAge = useCallback((): number | null => {
    if (!section2Data.dateOfBirth.date.value) return null;

    try {
      const birthDate = new Date(section2Data.dateOfBirth.date.value);
      if (isNaN(birthDate.getTime())) return null;

      return calculateAge(birthDate, new Date());
    } catch {
      return null;
    }
  }, [section2Data.dateOfBirth.date.value]);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Validate date of birth
    const validationContext: Section2ValidationContext = {
      currentDate: new Date(),
      rules: defaultValidationRules
    };

    const dateValidation = validateDateOfBirth(section2Data.dateOfBirth, validationContext);

    if (!dateValidation.isValid) {
      dateValidation.errors.forEach(error => {
        validationErrors.push({
          field: 'dateOfBirth',
          message: error,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      });
    }

    dateValidation.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'dateOfBirth',
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
  }, [section2Data]);

  const validateDateOfBirthOnly = useCallback((): DateValidationResult => {
    const validationContext: Section2ValidationContext = {
      currentDate: new Date(),
      rules: defaultValidationRules
    };

    return validateDateOfBirth(section2Data.dateOfBirth, validationContext);
  }, [section2Data]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updateDateOfBirthValue = useCallback((date: string) => {
    setSection2Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.dateOfBirth.date.value = date;
      return newData;
    });
  }, []);

  const updateEstimatedValue = useCallback((estimated: boolean) => {
    setSection2Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.dateOfBirth.estimated.value = estimated;
      return newData;
    });
  }, []);

  const updateDateFieldValue = useCallback((update: Section2FieldUpdate) => {
    setSection2Data(prevData => {
      return updateSection2Field(prevData, update);
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = createInitialSection2State();
    setSection2Data(newData);
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section2) => {
    setSection2Data(cloneDeep(data));
    setErrors({});
  }, []);

  const getChanges = useCallback(() => {
    return isDirty ? { section2: section2Data } : {};
  }, [section2Data, isDirty]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Integration with main form context (optional)
  // const integration = useSection86FormIntegration(
  //   'section2',
  //   'Section 2: Date of Birth',
  //   section2Data,
  //   setSection2Data,
  //   validateSection,
  //   getChanges
  // );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section2ContextType = {
    // State
    section2Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updateDateOfBirth: updateDateOfBirthValue,
    updateEstimated: updateEstimatedValue,
    updateDateField: updateDateFieldValue,

    // Computed Values
    getAge,

    // Validation
    validateSection,
    validateDateOfBirth: validateDateOfBirthOnly,

    // Utility
    resetSection,
    loadSection,
    getChanges
  };

  return (
    <Section2Context.Provider value={contextValue}>
      {children}
    </Section2Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection2 = (): Section2ContextType => {
  const context = useContext(Section2Context);
  if (!context) {
    throw new Error('useSection2 must be used within a Section2Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section2Provider;
