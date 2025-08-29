/**
 * Section9 Context Provider - Citizenship of Your Parents
 *
 * React Context provider for SF-86 Section 9 (Citizenship of Your Parents) with
 * SF86FormContext integration and optimized defensive check logic.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect
} from 'react';
import { cloneDeep } from 'lodash';
import set from 'lodash/set';
import type {
  Section9,
  BornInUSInfo,
  NaturalizedCitizenInfo,
  DerivedCitizenInfo,
  NonUSCitizenInfo
} from '../../../../api/interfaces/section-interfaces/section9';
import { createDefaultSection9 } from '../../../../api/interfaces/section-interfaces/section9';
import type {
  ValidationResult,
  ValidationError,
  ChangeSet
} from '../shared/base-interfaces';
import { useSF86Form } from './SF86FormContext';

// ============================================================================
// CONTEXT TYPE DEFINITION
// ============================================================================

export interface Section9ContextType {
  // State
  section9Data: Section9;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updateCitizenshipStatus: (status: Section9['section9']['status']['value']) => void;
  updateFieldValue: (fieldPath: string, newValue: any) => void;
  updateBornToUSParentsInfo: (field: keyof BornInUSInfo, value: any) => void;
  updateNaturalizedInfo: (field: keyof NaturalizedCitizenInfo, value: any) => void;
  updateDerivedInfo: (field: keyof DerivedCitizenInfo, value: any) => void;
  updateNonUSCitizenInfo: (field: keyof NonUSCitizenInfo, value: any) => void;

  // Validation
  validateSection: () => ValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section9) => void;
  getChanges: () => ChangeSet;
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

// Use the DRY createDefaultSection9 from the interface
// This eliminates hardcoded values and uses sections-references as single source of truth

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section9Context = createContext<Section9ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section9ProviderProps {
  children: React.ReactNode;
}

export const Section9Provider: React.FC<Section9ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section9Data, setSection9Data] = useState<Section9>(() => {
    const defaultData = createDefaultSection9();
    return defaultData;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section9>(() => createDefaultSection9());
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = useMemo(() => {
    return JSON.stringify(section9Data) !== JSON.stringify(initialData);
  }, [section9Data, initialData]);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Basic validation based on citizenship status
    const status = section9Data.section9.status.value;

    if (status === "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) ") {
      // Validate born to US parents info
      const bornInfo = section9Data.section9.bornToUSParents;
      if (bornInfo && !bornInfo.documentNumber.value.trim()) {
        validationErrors.push({
          field: 'documentNumber',
          message: 'Document number is required for birth to US parents',
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      }
    } else if (status === "I am a naturalized U.S. citizen. (Complete 9.2) ") {
      // Validate naturalized citizen info
      const natInfo = section9Data.section9.naturalizedCitizen;
      if (natInfo && !natInfo.naturalizedCertificateNumber.value.trim()) {
        validationErrors.push({
          field: 'naturalizedCertificateNumber',
          message: 'Certificate number is required for naturalized citizens',
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      }
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section9Data]);

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
  }, [section9Data, isInitialized, errors, validateSection]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updateCitizenshipStatus = useCallback((status: Section9['section9']['status']['value']) => {
    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section9.status.value = status;
      return newData;
    });
  }, []);

  const updateBornToUSParentsInfo = useCallback((field: keyof BornInUSInfo, value: any) => {
    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);

      // Ensure bornToUSParents exists - initialize if needed
      if (!newData.section9.bornToUSParents) {
        const defaultData = createDefaultSection9();
        newData.section9.bornToUSParents = defaultData.section9.bornToUSParents;
      }

      if (newData.section9.bornToUSParents) {
        const fieldObject = newData.section9.bornToUSParents[field];
        if (fieldObject && typeof fieldObject === 'object' && 'value' in fieldObject) {
          (fieldObject as any).value = value;
        }
      }

      return newData;
    });
  }, []);

  const updateNaturalizedInfo = useCallback((field: keyof NaturalizedCitizenInfo, value: any) => {
    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);

      // Ensure naturalizedCitizen exists - initialize if needed
      if (!newData.section9.naturalizedCitizen) {
        const defaultData = createDefaultSection9();
        newData.section9.naturalizedCitizen = defaultData.section9.naturalizedCitizen;
      }

      if (newData.section9.naturalizedCitizen) {
        const fieldObject = newData.section9.naturalizedCitizen[field];
        if (fieldObject && typeof fieldObject === 'object' && 'value' in fieldObject) {
          (fieldObject as any).value = value;
        }
      }

      return newData;
    });
  }, []);

  const updateDerivedInfo = useCallback((field: keyof DerivedCitizenInfo, value: any) => {
    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);

      // Ensure derivedCitizen exists - initialize if needed
      if (!newData.section9.derivedCitizen) {
        const defaultData = createDefaultSection9();
        newData.section9.derivedCitizen = defaultData.section9.derivedCitizen;
      }

      if (newData.section9.derivedCitizen) {
        const fieldObject = newData.section9.derivedCitizen[field];
        if (fieldObject && typeof fieldObject === 'object' && 'value' in fieldObject) {
          (fieldObject as any).value = value;
        }
      }

      return newData;
    });
  }, []);

  const updateNonUSCitizenInfo = useCallback((field: keyof NonUSCitizenInfo, value: any) => {
    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);

      // Ensure nonUSCitizen exists - initialize if needed
      if (!newData.section9.nonUSCitizen) {
        const defaultData = createDefaultSection9();
        newData.section9.nonUSCitizen = defaultData.section9.nonUSCitizen;
      }

      if (newData.section9.nonUSCitizen) {
        const fieldObject = newData.section9.nonUSCitizen[field];
        if (fieldObject && typeof fieldObject === 'object' && 'value' in fieldObject) {
          (fieldObject as any).value = value;
        }
      }

      return newData;
    });
  }, []);

  const updateFieldValue = useCallback((fieldPath: string, newValue: any) => {
    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);
      const fullPath = `section9.${fieldPath}.value`;
      set(newData, fullPath, newValue);
      return newData;
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const defaultData = createDefaultSection9();
    setSection9Data(defaultData);
    setErrors({});
  }, []);

  const loadSection = useCallback(async (data: Section9) => {
    setIsLoading(true);
    try {
      setSection9Data(data);
      setIsInitialized(true);
    } catch (error) {
      // Error loading data
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Simple change detection - compare with initial data
    if (isDirty) {
      changes['section9'] = {
        oldValue: initialData,
        newValue: section9Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section9Data, isDirty, initialData]);

  // ============================================================================
  // FIELD FLATTENING FOR PDF GENERATION
  // ============================================================================

  /**
   * Flatten Section9 data structure into Field objects for PDF generation
   * This converts the nested Section9 structure into a flat object with Field<T> objects
   * Using the robust recursive approach from Section 29 for consistency and reliability
   */
  const flattenSection9Fields = useCallback((): Record<string, any> => {
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

    // Recursive function to flatten any nested object structure
    // This approach automatically handles any field structure without hardcoding field names
    const flattenEntry = (obj: any, prefix: string) => {
      Object.entries(obj).forEach(([key, value]) => {
        if (key === "_id") return;

        const currentPath = `${prefix}.${key}`;

        if (
          value &&
          typeof value === "object" &&
          "id" in value &&
          "value" in value
        ) {
          // This is a Field object - add it to flatFields
          addField(value, currentPath);
        } else if (value && typeof value === "object") {
          // This is a nested object, recurse into it
          flattenEntry(value, currentPath);
        }
      });
    };

    // Flatten the entire section9 data structure recursively
    if (section9Data.section9) {
      flattenEntry(section9Data.section9, 'section9');
    }

    return flatFields;
  }, [section9Data]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  /**
   * Integration field update wrapper function for SF86FormContext compatibility
   * Following Section 29 pattern to bridge signature mismatch between integration and section-specific functions
   * Integration expects: (path: string, value: any) => void
   * Section 9 has: various subsection-specific update functions
   */
  const updateFieldValueWrapper = useCallback((path: string, value: any) => {
    // Simple path mapping following Section 1 pattern
    if (path === 'section9.status' || path === 'status') {
      updateCitizenshipStatus(value);
    } else if (path.startsWith('section9.bornToUSParents.') || path.startsWith('bornToUSParents.')) {
      const fieldName = path.replace(/^(section9\.)?bornToUSParents\./, '');
      if (fieldName.includes('.')) {
        // Handle nested paths with direct field update
        updateFieldValue(`bornToUSParents.${fieldName}`, value);
      } else {
        updateBornToUSParentsInfo(fieldName as keyof BornInUSInfo, value);
      }
    } else if (path.startsWith('section9.naturalizedCitizen.') || path.startsWith('naturalizedCitizen.')) {
      const fieldName = path.replace(/^(section9\.)?naturalizedCitizen\./, '');
      if (fieldName.includes('.')) {
        updateFieldValue(`naturalizedCitizen.${fieldName}`, value);
      } else {
        updateNaturalizedInfo(fieldName as keyof NaturalizedCitizenInfo, value);
      }
    } else if (path.startsWith('section9.derivedCitizen.') || path.startsWith('derivedCitizen.')) {
      const fieldName = path.replace(/^(section9\.)?derivedCitizen\./, '');
      if (fieldName.includes('.')) {
        updateFieldValue(`derivedCitizen.${fieldName}`, value);
      } else {
        updateDerivedInfo(fieldName as keyof DerivedCitizenInfo, value);
      }
    } else if (path.startsWith('section9.nonUSCitizen.') || path.startsWith('nonUSCitizen.')) {
      const fieldName = path.replace(/^(section9\.)?nonUSCitizen\./, '');
      if (fieldName.includes('.')) {
        updateFieldValue(`nonUSCitizen.${fieldName}`, value);
      } else {
        updateNonUSCitizenInfo(fieldName as keyof NonUSCitizenInfo, value);
      }
    } else {
      // Fallback: use direct field update
      updateFieldValue(path.replace('section9.', ''), value);
    }
  }, [updateCitizenshipStatus, updateBornToUSParentsInfo, updateNaturalizedInfo, updateDerivedInfo, updateNonUSCitizenInfo, updateFieldValue]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================
  // Access SF86FormContext to sync with loaded data
  const sf86Form = useSF86Form();

  // Sync with SF86FormContext when data is loaded
  useEffect(() => {
    if (sf86Form.formData.section9 && sf86Form.formData.section9 !== section9Data) {
      // Load the data from SF86FormContext
      loadSection(sf86Form.formData.section9);
    }
  }, [sf86Form.formData.section9, loadSection]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section9ContextType = {
    // State
    section9Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updateCitizenshipStatus,
    updateFieldValue,
    updateBornToUSParentsInfo,
    updateNaturalizedInfo,
    updateDerivedInfo,
    updateNonUSCitizenInfo,

    // Validation
    validateSection,

    // Utility
    resetSection,
    loadSection,
    getChanges,
  };

  return (
    <Section9Context.Provider value={contextValue}>
      {children}
    </Section9Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection9 = (): Section9ContextType => {
  const context = useContext(Section9Context);
  if (!context) {
    throw new Error('useSection9 must be used within a Section9Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section9Provider;
