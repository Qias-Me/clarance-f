/**
 * Section 4: Social Security Number - Context Provider
 *
 * React context provider for SF-86 Section 4 using the new Form Architecture 2.0.
 * This provider manages Social Security Number data with full CRUD operations,
 * validation, and integration with the central SF86FormContext.
 * 
 * Note: This section manages 138 fields including 2 main SSN inputs and 
 * 136 auto-fill fields that propagate the SSN throughout the entire form.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo
} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import type {
  Section4,
  Section4SubsectionKey,
  Section4FieldUpdate,
  Section4ValidationRules,
  Section4ValidationContext,
  SSNValidationResult
} from '../../../../api/interfaces/sections2.0/section4';
import {
  createDefaultSection4,
  validateSSN,
  updateSection4Field,
  updateMainSSNAndPropagate,
  propagateSSNToAllFields as propagateSSNHelper
} from '../../../../api/interfaces/sections2.0/section4';

import { useSection86FormIntegration } from '../shared/section-context-integration';
import type { ValidationResult, ValidationError, SectionId } from '../shared/base-interfaces';

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section4ContextType {
  // State
  section4Data: Section4;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updateSSN: (ssn: string) => void;
  updateSSNField: (update: Section4FieldUpdate) => void;
  toggleNotApplicable: (value: boolean) => void;
  updateAcknowledgement: (value: "YES" | "NO") => void;

  // Validation
  validateSection: () => ValidationResult;
  validateSSNOnly: () => SSNValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section4) => void;
  getChanges: () => any;
  propagateSSNToAllFields: () => void;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

const createInitialSection4State = (): Section4 => createDefaultSection4();

// ============================================================================
// VALIDATION RULES
// ============================================================================

const defaultValidationRules: Section4ValidationRules = {
  requiresSSN: true,
  allowsPartialSSN: false
};

// ============================================================================
// FIELD FLATTENING FOR PDF GENERATION
// ============================================================================

/**
 * Flattens Section 4 fields for PDF generation
 * Converts nested Field<T> objects to a flat Record<string, any> structure
 * Handles all 138 SSN fields including auto-fill propagation
 */
export const flattenSection4Fields = (section4Data: Section4): Record<string, any> => {
  const flattened: Record<string, any> = {};
  
  // Flatten main SSN fields
  if (section4Data.section4) {
    // Main SSN array (usually just one SSN value)
    if (section4Data.section4.ssn && section4Data.section4.ssn.length > 0) {
      section4Data.section4.ssn.forEach((ssnEntry, index) => {
        if (ssnEntry.value) {
          flattened[ssnEntry.value.id] = ssnEntry.value;
        }
      });
    }

    // Not applicable field
    if (section4Data.section4.notApplicable) {
      flattened[section4Data.section4.notApplicable.id] = section4Data.section4.notApplicable;
    }

    // Acknowledgement field
    if (section4Data.section4.Acknowledgement) {
      flattened[section4Data.section4.Acknowledgement.id] = section4Data.section4.Acknowledgement;
    }
  }

  return flattened;
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section4Context = createContext<Section4ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section4ProviderProps {
  children: React.ReactNode;
}

export const Section4Provider: React.FC<Section4ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section4Data, setSection4Data] = useState<Section4>(createInitialSection4State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section4>(createInitialSection4State());

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(section4Data) !== JSON.stringify(initialData);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Skip validation if not applicable is checked
    if (section4Data.section4.notApplicable?.value) {
      return {
        isValid: true,
        errors: [],
        warnings: []
      };
    }

    // Validate SSN
    const validationContext: Section4ValidationContext = {
      rules: defaultValidationRules
    };

    if (section4Data.section4.ssn && section4Data.section4.ssn.length > 0) {
      const primarySSN = section4Data.section4.ssn[0];
      if (primarySSN?.value?.value) {
        const ssnValidation = validateSSN(primarySSN.value.value, validationContext);

        if (!ssnValidation.isValid) {
          ssnValidation.errors.forEach(error => {
            validationErrors.push({
              field: 'ssn',
              message: error,
              code: 'VALIDATION_ERROR',
              severity: 'error'
            });
          });
        }

        ssnValidation.warnings.forEach(warning => {
          validationWarnings.push({
            field: 'ssn',
            message: warning,
            code: 'VALIDATION_WARNING',
            severity: 'warning'
          });
        });
      } else if (defaultValidationRules.requiresSSN) {
        validationErrors.push({
          field: 'ssn',
          message: 'Social Security Number is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }
    } else if (defaultValidationRules.requiresSSN) {
      validationErrors.push({
        field: 'ssn',
        message: 'Social Security Number is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

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
  }, [section4Data]);

  const validateSSNOnly = useCallback((): SSNValidationResult => {
    const validationContext: Section4ValidationContext = {
      rules: defaultValidationRules
    };

    if (section4Data.section4.ssn && section4Data.section4.ssn.length > 0) {
      const primarySSN = section4Data.section4.ssn[0];
      if (primarySSN?.value?.value) {
        return validateSSN(primarySSN.value.value, validationContext);
      }
    }

    return {
      isValid: false,
      errors: ['No SSN provided'],
      warnings: []
    };
  }, [section4Data]);

  // ============================================================================
  // DATA UPDATE FUNCTIONS
  // ============================================================================

  const updateSSN = useCallback((ssn: string) => {
    setSection4Data(prevData => {
      // Use the enhanced SSN propagation logic
      return updateMainSSNAndPropagate(prevData, ssn);
    });
  }, []);

  const updateSSNField = useCallback((update: Section4FieldUpdate) => {
    setSection4Data(prevData => {
      return updateSection4Field(prevData, update);
    });
  }, []);

  const toggleNotApplicable = useCallback((value: boolean) => {
    setSection4Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section4.notApplicable) {
        newData.section4.notApplicable.value = value;
      }
      
      // Clear SSN if not applicable is checked
      if (value && newData.section4.ssn) {
        newData.section4.ssn.forEach(ssnEntry => {
          if (ssnEntry.value) {
            ssnEntry.value.value = '';
          }
        });
      }
      
      return newData;
    });
  }, []);

  const updateAcknowledgement = useCallback((value: "YES" | "NO") => {
    setSection4Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section4.Acknowledgement) {
        newData.section4.Acknowledgement.value = value;
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    setSection4Data(createInitialSection4State());
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section4) => {
    setSection4Data(data);
    setErrors({});
  }, []);

  const getChanges = useCallback((): any => {
    return isDirty ? { 4: section4Data } : {};
  }, [section4Data, isDirty]);


  const propagateSSNToAllFields = useCallback(() => {
    setSection4Data(prevData => {
      // Get the main SSN value
      const mainSSN = prevData.section4.ssn?.[0]?.value?.value || '';
      if (mainSSN) {
        // Use the propagation logic from the interface
        return propagateSSNHelper(prevData, mainSSN);
      }
      return prevData;
    });
  }, []);

  // ============================================================================
  // SF86FORM INTEGRATION WITH FIELD FLATTENING
  // ============================================================================

  const integration = useSection86FormIntegration<Section4>(
    'section4',
    'Section 4: Social Security Number',
    section4Data,
    setSection4Data,
    validateSection,
    getChanges
    // Removed flattenFields parameter to use structured format (preferred)
  );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section4ContextType = useMemo(() => ({
    // State
    section4Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updateSSN,
    updateSSNField,
    toggleNotApplicable,
    updateAcknowledgement,

    // Validation
    validateSection,
    validateSSNOnly,

    // Utility
    resetSection,
    loadSection,
    getChanges,
    propagateSSNToAllFields
  }), [
    section4Data,
    isLoading,
    errors,
    isDirty,
    updateSSN,
    updateSSNField,
    toggleNotApplicable,
    updateAcknowledgement,
    validateSection,
    validateSSNOnly,
    resetSection,
    loadSection,
    getChanges,
    propagateSSNToAllFields
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Section4Context.Provider value={contextValue}>
      {children}
    </Section4Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection4 = (): Section4ContextType => {
  const context = useContext(Section4Context);
  if (context === undefined) {
    throw new Error('useSection4 must be used within a Section4Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section4Provider;
export { Section4Context }; 