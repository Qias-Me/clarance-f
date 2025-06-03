/**
 * Section 3: Place of Birth - Context Provider
 *
 * React context provider for SF-86 Section 3 using the new Form Architecture 2.0.
 * This provider manages place of birth data with full CRUD operations,
 * validation, and integration with the central SF86FormContext.
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
  Section3,
  Section3SubsectionKey,
  Section3FieldUpdate,
  Section3ValidationRules,
  Section3ValidationContext,
  LocationValidationResult
} from '../../../../api/interfaces/sections2.0/section3';
import {
  createDefaultSection3,
  validatePlaceOfBirth,
  updateSection3Field
} from '../../../../api/interfaces/sections2.0/section3';

import { useSection86FormIntegration } from '../shared/section-context-integration';
import type { ValidationResult, ValidationError, SectionId } from '../shared/base-interfaces';

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section3ContextType {
  // State
  section3Data: Section3;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updatePlaceOfBirth: (fieldPath: string, value: string) => void;
  updateBirthLocation: (update: Section3FieldUpdate) => void;

  // Validation
  validateSection: () => ValidationResult;
  validateLocation: () => LocationValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section3) => void;
  getChanges: () => any;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

const createInitialSection3State = (): Section3 => createDefaultSection3();

// ============================================================================
// VALIDATION RULES
// ============================================================================

const defaultValidationRules: Section3ValidationRules = {
  requiresCity: true,
  requiresCountry: true,
  requiresStateForUS: true,
  allowsCountyEmpty: true,
  validCountries: [],
  validStates: []
};

// ============================================================================
// FIELD FLATTENING FOR PDF GENERATION
// ============================================================================

/**
 * Flattens Section 3 fields for PDF generation
 * Converts nested Field<T> objects to a flat Record<string, any> structure
 */
export const flattenSection3Fields = (section3Data: Section3): Record<string, any> => {
  const flattened: Record<string, any> = {};
  
  // Flatten place of birth fields
  if (section3Data.section3) {
    if (section3Data.section3.city) {
      flattened[section3Data.section3.city.id] = section3Data.section3.city;
    }
    if (section3Data.section3.county) {
      flattened[section3Data.section3.county.id] = section3Data.section3.county;
    }
    if (section3Data.section3.country) {
      flattened[section3Data.section3.country.id] = section3Data.section3.country;
    }
    if (section3Data.section3.state) {
      flattened[section3Data.section3.state.id] = section3Data.section3.state;
    }
  }

  return flattened;
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section3Context = createContext<Section3ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section3ProviderProps {
  children: React.ReactNode;
}

export const Section3Provider: React.FC<Section3ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section3Data, setSection3Data] = useState<Section3>(createInitialSection3State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section3>(createInitialSection3State());

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(section3Data) !== JSON.stringify(initialData);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Validate place of birth
    const validationContext: Section3ValidationContext = {
      rules: defaultValidationRules,
      defaultCountry: 'United States'
    };

    const locationValidation = validatePlaceOfBirth(section3Data.section3, validationContext);

    if (!locationValidation.isValid) {
      locationValidation.errors.forEach(error => {
        validationErrors.push({
          field: 'placeOfBirth',
          message: error,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      });
    }

    locationValidation.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'placeOfBirth',
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
  }, [section3Data]);

  const validateLocationOnly = useCallback((): LocationValidationResult => {
    const validationContext: Section3ValidationContext = {
      rules: defaultValidationRules,
      defaultCountry: 'United States'
    };

    return validatePlaceOfBirth(section3Data.section3, validationContext);
  }, [section3Data]);

  // ============================================================================
  // DATA UPDATE FUNCTIONS
  // ============================================================================

  const updatePlaceOfBirth = useCallback((fieldPath: string, value: string) => {
    setSection3Data(prevData => {
      const newData = cloneDeep(prevData);
      
      // Use lodash.set for nested field updates
      set(newData as any, fieldPath, value);
      
      return newData;
    });
  }, []);

  const updateBirthLocation = useCallback((update: Section3FieldUpdate) => {
    setSection3Data(prevData => {
      return updateSection3Field(prevData, update);
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    setSection3Data(createInitialSection3State());
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section3) => {
    setSection3Data(data);
    setErrors({});
  }, []);

  const getChanges = useCallback((): any => {
    return isDirty ? { 3: section3Data } : {};
  }, [section3Data, isDirty]);

  // ============================================================================
  // SF86FORM INTEGRATION WITH FIELD FLATTENING
  // ============================================================================

  const integration = useSection86FormIntegration<Section3>(
    'section3',
    'Section 3: Place of Birth',
    section3Data,
    setSection3Data,
    validateSection,
    getChanges
    // Removed flattenFields parameter to use structured format (preferred)
  );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section3ContextType = useMemo(() => ({
    // State
    section3Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updatePlaceOfBirth,
    updateBirthLocation,

    // Validation
    validateSection,
    validateLocation: validateLocationOnly,

    // Utility
    resetSection,
    loadSection,
    getChanges
  }), [
    section3Data,
    isLoading,
    errors,
    isDirty,
    updatePlaceOfBirth,
    updateBirthLocation,
    validateSection,
    validateLocationOnly,
    resetSection,
    loadSection,
    getChanges
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Section3Context.Provider value={contextValue}>
      {children}
    </Section3Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection3 = (): Section3ContextType => {
  const context = useContext(Section3Context);
  if (context === undefined) {
    throw new Error('useSection3 must be used within a Section3Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section3Provider;
export { Section3Context }; 