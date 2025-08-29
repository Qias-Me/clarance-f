/**
 * Section 2: Date of Birth - Context Provider
 *
 * Refactored to match Section 1's simple, direct approach.
 * Eliminates complex enhanced template patterns in favor of straightforward React context.
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
  Section2,
  Section2FieldUpdate,
  DateValidationResult,
  Section2ValidationContext
} from '../../../../api/interfaces/section-interfaces/section2';
import {
  createDefaultSection2,
  validateDateOfBirth,
  updateSection2Field,
  calculateAge,
  AGE_LIMITS,
  DATE_VALIDATION_CONSTANTS
} from '../../../../api/interfaces/section-interfaces/section2';
import type { ValidationResult, ValidationError, ChangeSet } from '../shared/base-interfaces';
import { useSF86Form } from './SF86FormContext';

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
  updateFieldValue: (path: string, value: any) => void;

  // Validation
  validateSection: () => ValidationResult;
  validateDateOfBirth: () => DateValidationResult;

  // Computed Values
  getAge: () => number | null;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section2) => void;
  getChanges: () => any;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

/**
 * Creates the initial Section 2 state
 * Uses the DRY approach with sections-references instead of hardcoded values
 */
const createInitialSection2State = (): Section2 => {
  return createDefaultSection2();
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

/**
 * Default validation rules using constants
 */
const defaultValidationRules = {
  requiresDateOfBirth: true,
  minimumAge: AGE_LIMITS.MINIMUM,
  maximumAge: AGE_LIMITS.MAXIMUM,
  allowsEstimatedDate: true,
  dateFormat: DATE_VALIDATION_CONSTANTS.DEFAULT_FORMAT
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
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Check if data has been modified from initial state
   */
  const isDirty = JSON.stringify(section2Data) !== JSON.stringify(initialData);

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

    // Validate date of birth
    const validationContext: Section2ValidationContext = {
      currentDate: new Date(),
      rules: defaultValidationRules
    };

    const dateValidation = validateDateOfBirth(section2Data.section2, validationContext);

    if (!dateValidation.isValid) {
      dateValidation.errors.forEach(error => {
        validationErrors.push({
          field: 'section2.date',
          message: error,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      });
    }

    dateValidation.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'section2.date',
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
  }, [section2Data]);

  const validateDateOfBirthOnly = useCallback((): DateValidationResult => {
    const validationContext: Section2ValidationContext = {
      currentDate: new Date(),
      rules: defaultValidationRules
    };

    return validateDateOfBirth(section2Data.section2, validationContext);
  }, [section2Data]);

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
  }, [section2Data, isInitialized, errors]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  /**
   * Updates the date of birth field
   * @param date - The new date value (converts from YYYY-MM-DD to MM/DD/YYYY if needed)
   */
  const updateDateOfBirth = useCallback((date: string) => {
    // Convert from YYYY-MM-DD (HTML date input) to MM/DD/YYYY format
    let formattedDate = date;
    if (date && date.includes('-')) {
      const [year, month, day] = date.split('-');
      formattedDate = `${month}/${day}/${year}`;
    }
    
    setSection2Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section2.date.value = formattedDate;
      return newData;
    });
  }, []);

  /**
   * Updates the estimation checkbox
   * @param estimated - Whether the date is estimated
   */
  const updateEstimated = useCallback((estimated: boolean) => {
    setSection2Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section2.isEstimated.value = estimated;
      return newData;
    });
  }, []);

  /**
   * Updates a field using the Section2FieldUpdate type
   * @param update - The field update containing path and value
   */
  const updateDateFieldValue = useCallback((update: Section2FieldUpdate) => {
    setSection2Data(prevData => {
      return updateSection2Field(prevData, update);
    });
  }, []);

  /**
   * Generic field update function for integration compatibility
   * Maps generic field paths to Section 2 specific update functions
   * @param path - The field path to update
   * @param value - The new value for the field
   */
  const updateFieldValue = useCallback((path: string, value: string | boolean) => {
    // Parse path to update the correct field using specific handlers
    if (path === 'section2.date') {
      updateDateOfBirth(value);
      return;
    } else if (path === 'section2.isEstimated') {
      updateEstimated(value);
      return;
    }

    // CRITICAL FIX: Fallback using lodash set for any unmatched paths
    // This ensures compatibility with the integration system and prevents silent failures
    setSection2Data(prev => {
      const newData = cloneDeep(prev);
      set(newData, path, value);
      return newData;
    });
  }, [updateDateOfBirth, updateEstimated]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const getAge = useCallback((): number | null => {
    if (!section2Data?.section2?.date?.value) return null;

    try {
      const dateValue = section2Data.section2.date.value;

      // Parse MM/DD/YYYY format properly
      let parsedDate: Date;

      if (dateValue.includes('/')) {
        // Handle MM/DD/YYYY format
        const [month, day, year] = dateValue.split('/');
        parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Fallback for other formats
        parsedDate = new Date(dateValue);
      }

      if (isNaN(parsedDate.getTime())) return null;

      return calculateAge(parsedDate, new Date());
    } catch {
      return null;
    }
  }, [section2Data]);

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

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Simple change detection - compare with initial data
    if (JSON.stringify(section2Data) !== JSON.stringify(initialData)) {
      changes['section2'] = {
        oldValue: initialData,
        newValue: section2Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section2Data, initialData]);

  // ============================================================================
  // FIELD FLATTENING FOR PDF GENERATION
  // ============================================================================

  /**
   * Flatten Section2 data structure into Field objects for PDF generation
   * This converts the nested Section2 structure into a flat object with Field<T> objects
   * Following the Section 1 pattern for consistency
   */
  const flattenSection2Fields = useCallback((): Record<string, any> => {
    const flatFields: Record<string, any> = {};

    const addField = (field: any, _path: string) => {
      if (
        field &&
        typeof field === "object" &&
        "id" in field &&
        "value" in field
      ) {
        flatFields[field.id] = field;
      }
    };

    // Flatten section2 date of birth fields
    if (section2Data.section2) {
      addField(section2Data.section2.date, 'section2.date');
      addField(section2Data.section2.isEstimated, 'section2.isEstimated');
    }

    return flatFields;
  }, [section2Data]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================
  // Access SF86FormContext to sync with loaded data
  const sf86Form = useSF86Form();

  // Sync with SF86FormContext when data is loaded
  useEffect(() => {
    if (sf86Form.formData.section2 && sf86Form.formData.section2 !== section2Data) {
      // Load the data from SF86FormContext
      loadSection(sf86Form.formData.section2);
    }
  }, [sf86Form.formData.section2, loadSection]);

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
    updateDateOfBirth,
    updateEstimated,
    updateDateField: updateDateFieldValue,
    updateFieldValue,

    // Validation
    validateSection,
    validateDateOfBirth: validateDateOfBirthOnly,

    // Computed Values
    getAge,

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
