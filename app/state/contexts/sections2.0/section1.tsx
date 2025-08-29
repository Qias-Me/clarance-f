/**
 * Section 1: Information About You - Context Provider
 *
 * React context provider for SF-86 Section 1 using the new Form Architecture 2.0.
 * This provider manages personal information data with full CRUD operations,
 * validation, and integration with the central SF86FormContext.
 * Enhanced with PDF-to-UI field mapping integration.
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
  NameValidationResult,
  PersonalInformation
} from '../../../../api/interfaces/section-interfaces/section1';
import {
  NAME_VALIDATION
} from '../../../../api/interfaces/section-interfaces/section1';
import { SUFFIX_OPTIONS } from '../../../../api/interfaces/section-interfaces/base';
import { createFieldFromReference, validateSectionFieldCount } from '../../../../api/utils/sections-references-loader';
import {
  getPdfFieldByName,
  getPdfFieldById,
  mapLogicalFieldToPdfField,
  getFieldMetadata,
  getMappingStatistics,
  validateFieldMappings,
  SECTION1_FIELD_MAPPINGS
} from './section1-field-mapping';

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

  // Enhanced PDF-to-UI Field Mapping Integration
  getPdfFieldMapping: (uiPath: string) => string | undefined;
  getUiFieldForPdfField: (pdfFieldId: string) => string | undefined;
  getFieldMappingMetadata: (logicalPath: string) => any;
  validateFieldMappings: () => { isValid: boolean; errors: string[]; warnings: string[] };
  getMappingStatistics: () => any;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section1) => void;
  getChanges: () => any;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

/**
 * Creates a default Section 1 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 * MOVED FROM INTERFACE TO CONTEXT - proper architectural separation
 */
const createDefaultSection1Internal = (): Section1 => {
  // Validate field count against sections-references
  validateSectionFieldCount(1);

  return {
    _id: 1,
    section1: {
      lastName: createFieldFromReference(
        1,
        'form1[0].Sections1-6[0].TextField11[0]',
        ''
      ),
      firstName: createFieldFromReference(
        1,
        'form1[0].Sections1-6[0].TextField11[1]',
        ''
      ),
      middleName: createFieldFromReference(
        1,
        'form1[0].Sections1-6[0].TextField11[2]',
        ''
      ),
      suffix: {
        ...createFieldFromReference(
          1,
          'form1[0].Sections1-6[0].suffix[0]',
          ''
        ),
        options: SUFFIX_OPTIONS
      }
    }
  };
};

// Use the DRY approach with sections-references instead of hardcoded values
const createInitialSection1State = (): Section1 => {
  return createDefaultSection1Internal();
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
// HELPER FUNCTIONS - MOVED FROM INTERFACE TO CONTEXT
// ============================================================================

/**
 * Updates a specific field in the Section 1 data structure
 * MOVED FROM INTERFACE TO CONTEXT - proper architectural separation
 */
const updateSection1FieldInternal = (
  section1Data: Section1,
  update: Section1FieldUpdate
): Section1 => {
  const { fieldPath, newValue } = update;
  const newData = { ...section1Data };

  // Update the specified field
  if (fieldPath === 'section1.lastName') {
    newData.section1.lastName.value = newValue;
  } else if (fieldPath === 'section1.firstName') {
    newData.section1.firstName.value = newValue;
  } else if (fieldPath === 'section1.middleName') {
    newData.section1.middleName.value = newValue;
  } else if (fieldPath === 'section1.suffix') {
    newData.section1.suffix.value = newValue;
  }

  return newData;
};

/**
 * Validates a full name entry
 * MOVED FROM INTERFACE TO CONTEXT - proper architectural separation
 */
const validateFullNameInternal = (fullName: PersonalInformation, context: Section1ValidationContext): NameValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get values safely - handle both direct values and nested .value properties
  const getFieldValue = (field: any): string => {
    if (typeof field === 'string') return field;
    if (field && typeof field === 'object' && 'value' in field) return field.value || '';
    return '';
  };

  const lastName = getFieldValue(fullName.lastName);
  const firstName = getFieldValue(fullName.firstName);
  const middleName = getFieldValue(fullName.middleName);
  const suffix = getFieldValue(fullName.suffix);

  // Required field validation
  if (context.rules.requiresLastName && !lastName.trim()) {
    errors.push('Last name is required');
  }

  if (context.rules.requiresFirstName && !firstName.trim()) {
    errors.push('First name is required');
  }

  // Length validation
  const fields = [
    { value: lastName, name: 'Last name' },
    { value: firstName, name: 'First name' },
    { value: middleName, name: 'Middle name' },
    { value: suffix, name: 'Suffix' }
  ];

  fields.forEach(field => {
    if (field.value && field.value.length > context.rules.maxNameLength) {
      errors.push(`${field.name} exceeds maximum length of ${context.rules.maxNameLength} characters`);
    }
  });

  // Character validation
  fields.forEach(field => {
    if (field.value && !NAME_VALIDATION.ALLOWED_CHARACTERS.test(field.value)) {
      errors.push(`${field.name} contains invalid characters`);
    }
  });

  // Initial-only validation
  if (context.allowInitialsOnly) {
    if (NAME_VALIDATION.INITIAL_PATTERN.test(firstName)) {
      warnings.push('First name appears to be an initial only');
    }
    if (NAME_VALIDATION.INITIAL_PATTERN.test(middleName)) {
      warnings.push('Middle name appears to be an initial only');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
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

    const nameValidation = validateFullNameInternal(section1Data.section1, validationContext);

    if (!nameValidation.isValid) {
      nameValidation.errors.forEach(error => {
        validationErrors.push({
          field: 'section1.fullName',
          message: error,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      });
    }

    nameValidation.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'section1.fullName',
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

    return validateFullNameInternal(section1Data.section1, validationContext);
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
      return updateSection1FieldInternal(prevData, update);
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
    if (sf86Form.formData.section1 && sf86Form.formData.section1 !== section1Data) {
      // Load the data from SF86FormContext
      loadSection(sf86Form.formData.section1);
    }
  }, [sf86Form.formData.section1, loadSection]);





  // ============================================================================
  // ENHANCED PDF-TO-UI FIELD MAPPING FUNCTIONS
  // ============================================================================

  /**
   * Get PDF field mapping for a UI path
   */
  const getPdfFieldMapping = useCallback((uiPath: string): string | undefined => {
    return mapLogicalFieldToPdfField(uiPath);
  }, []);

  /**
   * Get UI field path for a PDF field ID (reverse mapping)
   */
  const getUiFieldForPdfField = useCallback((pdfFieldId: string): string | undefined => {
    // Look through the SECTION1_FIELD_MAPPINGS to find the UI path
    for (const [uiPath, pdfField] of Object.entries(SECTION1_FIELD_MAPPINGS)) {
      if (pdfField === pdfFieldId) {
        return uiPath;
      }
    }
    return undefined;
  }, []);

  /**
   * Get field metadata for a logical field path
   */
  const getFieldMappingMetadata = useCallback((logicalPath: string) => {
    return getFieldMetadata(logicalPath);
  }, []);

  /**
   * Validate field mappings
   */
  const validateFieldMappingsFunc = useCallback(() => {
    return validateFieldMappings();
  }, []);

  /**
   * Get mapping statistics
   */
  const getMappingStatisticsFunc = useCallback(() => {
    return getMappingStatistics();
  }, []);

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

    // Enhanced PDF-to-UI Field Mapping Integration
    getPdfFieldMapping,
    getUiFieldForPdfField,
    getFieldMappingMetadata,
    validateFieldMappings: validateFieldMappingsFunc,
    getMappingStatistics: getMappingStatisticsFunc,

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
