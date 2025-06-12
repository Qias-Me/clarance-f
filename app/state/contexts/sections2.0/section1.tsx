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
  useEffect
} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
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

import type { ValidationResult, ValidationError, ChangeSet } from '../shared/base-interfaces';
import { useSF86Form } from './SF86FormContext';

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
  updateFieldValue: (path: string, value: any) => void;

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

// Use the DRY approach with sections-references instead of hardcoded values
const createInitialSection1State = (): Section1 => {
  return createDefaultSection1();
};

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
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(section1Data) !== JSON.stringify(initialData);

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

    // Validate full name
    const validationContext: Section1ValidationContext = {
      rules: defaultValidationRules,
      allowInitialsOnly: false
    };

    const nameValidation = validateFullName(section1Data.section1, validationContext);

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

    // Don't call setErrors here - it causes infinite loops when called during render
    // Errors will be updated separately when needed

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

    return validateFullName(section1Data.section1, validationContext);
  }, [section1Data]);

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
  }, [section1Data, isInitialized, errors]); // Removed validateSection to prevent infinite loops

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updatePersonalInfo = useCallback((fieldPath: string, value: string) => {
    setSection1Data(prevData => {
      const newData = cloneDeep(prevData);
      set(newData, `section1.${fieldPath}.value`, value);
      return newData;
    });
  }, []);

  const updateFullNameField = useCallback((update: Section1FieldUpdate) => {
    setSection1Data(prevData => {
      return updateSection1Field(prevData, update);
    });
  }, []);

  /**
   * Generic field update function for integration compatibility
   * Maps generic field paths to Section 1 specific update functions
   */
  const updateFieldValue = useCallback((path: string, value: any) => {
    // Parse path to update the correct field
    if (path === 'section1.lastName') {
      updateFullNameField({ fieldPath: 'section1.lastName', newValue: value });
    } else if (path === 'section1.firstName') {
      updateFullNameField({ fieldPath: 'section1.firstName', newValue: value });
    } else if (path === 'section1.middleName') {
      updateFullNameField({ fieldPath: 'section1.middleName', newValue: value });
    } else if (path === 'section1.suffix') {
      updateFullNameField({ fieldPath: 'section1.suffix', newValue: value });
    }
  }, [updateFullNameField]);

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

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Simple change detection - compare with initial data
    if (JSON.stringify(section1Data) !== JSON.stringify(initialData)) {
      changes['section1'] = {
        oldValue: initialData,
        newValue: section1Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section1Data, initialData]);

  // ============================================================================
  // FIELD FLATTENING FOR PDF GENERATION
  // ============================================================================

  /**
   * Flatten Section1 data structure into Field objects for PDF generation
   * This converts the nested Section1 structure into a flat object with Field<T> objects
   * Following the Section 29 pattern for consistency
   */
  const flattenSection1Fields = useCallback((): Record<string, any> => {
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

    // Flatten section1 personal information fields
    if (section1Data.section1) {
      addField(section1Data.section1.lastName, 'section1.lastName');
      addField(section1Data.section1.firstName, 'section1.firstName');
      addField(section1Data.section1.middleName, 'section1.middleName');
      addField(section1Data.section1.suffix, 'section1.suffix');
    }

    return flatFields;
  }, [section1Data]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================
  // Access SF86FormContext to sync with loaded data
  const sf86Form = useSF86Form();

  // Sync with SF86FormContext when data is loaded
  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

    if (sf86Form.formData.section1 && sf86Form.formData.section1 !== section1Data) {
      if (isDebugMode) {
        console.log('🔄 Section1: Syncing with SF86FormContext loaded data');
      }

      // Load the data from SF86FormContext
      loadSection(sf86Form.formData.section1);

      if (isDebugMode) {
        console.log('✅ Section1: Data sync complete');
      }
    }
  }, [sf86Form.formData.section1, loadSection]);





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
    updateFieldValue,

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
