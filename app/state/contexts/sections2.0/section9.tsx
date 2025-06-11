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
  useMemo
} from 'react';
import { cloneDeep } from 'lodash';
import set from 'lodash/set';
import type {
  Section9,
  BornInUSInfo,
  NaturalizedCitizenInfo,
  DerivedCitizenInfo,
  NonUSCitizenInfo
} from '../../../../api/interfaces/sections2.0/section9';
import { createDefaultSection9 } from '../../../../api/interfaces/sections2.0/section9';
import type {
  ValidationResult,
  ValidationError,
  ChangeSet
} from '../shared/base-interfaces';
import { useSection86FormIntegration } from '../shared/section-context-integration';

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
    // console.log('🏗️ Section9: Initializing with default data:', defaultData);
    // console.log('🔍 Section9: Status field:', defaultData.section9.status);
    // console.log('🔍 Section9: BornToUSParents field:', defaultData.section9.bornToUSParents);
    return defaultData;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section9>(createDefaultSection9());

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
  }, [section9Data]);

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
    console.log(`🔄 Section9: updateBornToUSParentsInfo called with field=${field}, value=`, value);

    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);

      // Ensure bornToUSParents exists - initialize if needed
      if (!newData.section9.bornToUSParents) {
        console.log('🔧 Section9: Creating bornToUSParents structure');
        // Get the default structure from createDefaultSection9
        const defaultData = createDefaultSection9();
        newData.section9.bornToUSParents = defaultData.section9.bornToUSParents;
      }

      if (newData.section9.bornToUSParents) {
        const fieldObject = newData.section9.bornToUSParents[field];
        if (fieldObject && typeof fieldObject === 'object' && 'value' in fieldObject) {
          (fieldObject as any).value = value;
          console.log(`✅ Section9: Updated bornToUSParents.${field}.value = ${value}`);
        } else {
          console.warn(`🚨 Section9: Field ${field} not found in bornToUSParents or is not a valid field object:`, fieldObject);
        }
      }

      return newData;
    });
  }, []);

  const updateNaturalizedInfo = useCallback((field: keyof NaturalizedCitizenInfo, value: any) => {
    console.log(`🔄 Section9: updateNaturalizedInfo called with field=${field}, value=`, value);

    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);

      // Ensure naturalizedCitizen exists - initialize if needed
      if (!newData.section9.naturalizedCitizen) {
        console.log('🔧 Section9: Creating naturalizedCitizen structure');
        // Get the default structure from createDefaultSection9
        const defaultData = createDefaultSection9();
        newData.section9.naturalizedCitizen = defaultData.section9.naturalizedCitizen;
      }

      if (newData.section9.naturalizedCitizen) {
        const fieldObject = newData.section9.naturalizedCitizen[field];
        if (fieldObject && typeof fieldObject === 'object' && 'value' in fieldObject) {
          (fieldObject as any).value = value;
          console.log(`✅ Section9: Updated naturalizedCitizen.${field}.value = ${value}`);
        } else {
          console.warn(`🚨 Section9: Field ${field} not found in naturalizedCitizen or is not a valid field object:`, fieldObject);
        }
      }

      return newData;
    });
  }, []);

  const updateDerivedInfo = useCallback((field: keyof DerivedCitizenInfo, value: any) => {
    console.log(`🔄 Section9: updateDerivedInfo called with field=${field}, value=`, value);

    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);

      // Ensure derivedCitizen exists - initialize if needed
      if (!newData.section9.derivedCitizen) {
        console.log('🔧 Section9: Creating derivedCitizen structure');
        // Get the default structure from createDefaultSection9
        const defaultData = createDefaultSection9();
        newData.section9.derivedCitizen = defaultData.section9.derivedCitizen;
      }

      if (newData.section9.derivedCitizen) {
        const fieldObject = newData.section9.derivedCitizen[field];
        if (fieldObject && typeof fieldObject === 'object' && 'value' in fieldObject) {
          (fieldObject as any).value = value;
          console.log(`✅ Section9: Updated derivedCitizen.${field}.value = ${value}`);
        } else {
          console.warn(`🚨 Section9: Field ${field} not found in derivedCitizen or is not a valid field object:`, fieldObject);
        }
      }

      return newData;
    });
  }, []);

  const updateNonUSCitizenInfo = useCallback((field: keyof NonUSCitizenInfo, value: any) => {
    console.log(`🔄 Section9: updateNonUSCitizenInfo called with field=${field}, value=`, value);

    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);

      // Ensure nonUSCitizen exists - initialize if needed
      if (!newData.section9.nonUSCitizen) {
        console.log('🔧 Section9: Creating nonUSCitizen structure');
        // Get the default structure from createDefaultSection9
        const defaultData = createDefaultSection9();
        newData.section9.nonUSCitizen = defaultData.section9.nonUSCitizen;
      }

      if (newData.section9.nonUSCitizen) {
        const fieldObject = newData.section9.nonUSCitizen[field];
        if (fieldObject && typeof fieldObject === 'object' && 'value' in fieldObject) {
          (fieldObject as any).value = value;
          console.log(`✅ Section9: Updated nonUSCitizen.${field}.value = ${value}`);
        } else {
          console.warn(`🚨 Section9: Field ${field} not found in nonUSCitizen or is not a valid field object:`, fieldObject);
        }
      }

      return newData;
    });
  }, []);

  const updateFieldValue = useCallback((fieldPath: string, newValue: any) => {
    console.log(`🔄 Section9: updateFieldValue called with fieldPath=${fieldPath}, newValue=`, newValue);

    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);
      const fullPath = `section9.${fieldPath}.value`;
      set(newData, fullPath, newValue);

      console.log(`📊 Section9: updateFieldValue - updated local state for path=${fullPath}`);
      console.log(`📊 Section9: updateFieldValue - new section9Data:`, newData);

      return newData;
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = createDefaultSection9();
    setSection9Data(newData);
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section9) => {
    setSection9Data(cloneDeep(data));
    setErrors({});
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Simple change detection - compare with initial data
    if (JSON.stringify(section9Data) !== JSON.stringify(initialData)) {
      changes['section9'] = {
        oldValue: initialData,
        newValue: section9Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section9Data, initialData]);

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
    console.log(`🔄 Section9: updateFieldValueWrapper called with path=${path}, value=`, value);

    // Parse path to update the correct field using existing subsection functions
    if (path === 'section9.status' || path === 'status') {
      console.log(`📊 Section9: Updating citizenship status`);
      updateCitizenshipStatus(value);
    } else if (path.startsWith('section9.bornToUSParents.') || path.startsWith('bornToUSParents.')) {
      const fieldName = path.replace(/^(section9\.)?bornToUSParents\./, '');
      console.log(`📊 Section9: Updating bornToUSParents field: ${fieldName}`);

      // Handle nested paths like 'nameOnDocument.firstName' using lodash set
      if (fieldName.includes('.')) {
        console.log(`📊 Section9: Handling nested field path: ${fieldName}`);
        setSection9Data(prev => {
          const updated = cloneDeep(prev);
          const fullPath = `section9.bornToUSParents.${fieldName}.value`;
          set(updated, fullPath, value);
          console.log(`✅ Section9: Updated nested field at path: ${fullPath}`);

          return updated;
        });
      } else {
        // Handle direct fields using existing function
        updateBornToUSParentsInfo(fieldName as keyof BornInUSInfo, value);
      }
    } else if (path.startsWith('section9.naturalizedCitizen.') || path.startsWith('naturalizedCitizen.')) {
      const fieldName = path.replace(/^(section9\.)?naturalizedCitizen\./, '');
      console.log(`📊 Section9: Updating naturalizedCitizen field: ${fieldName}`);

      // Handle nested paths using lodash set
      if (fieldName.includes('.')) {
        console.log(`📊 Section9: Handling nested field path: ${fieldName}`);
        setSection9Data(prev => {
          const updated = cloneDeep(prev);
          const fullPath = `section9.naturalizedCitizen.${fieldName}.value`;
          set(updated, fullPath, value);
          console.log(`✅ Section9: Updated nested field at path: ${fullPath}`);

          return updated;
        });
      } else {
        // Handle direct fields using existing function
        updateNaturalizedInfo(fieldName as keyof NaturalizedCitizenInfo, value);
      }
    } else if (path.startsWith('section9.derivedCitizen.') || path.startsWith('derivedCitizen.')) {
      const fieldName = path.replace(/^(section9\.)?derivedCitizen\./, '');
      console.log(`📊 Section9: Updating derivedCitizen field: ${fieldName}`);

      // Handle nested paths using lodash set
      if (fieldName.includes('.')) {
        console.log(`📊 Section9: Handling nested field path: ${fieldName}`);
        setSection9Data(prev => {
          const updated = cloneDeep(prev);
          const fullPath = `section9.derivedCitizen.${fieldName}.value`;
          set(updated, fullPath, value);
          console.log(`✅ Section9: Updated nested field at path: ${fullPath}`);

          return updated;
        });
      } else {
        // Handle direct fields using existing function
        updateDerivedInfo(fieldName as keyof DerivedCitizenInfo, value);
      }
    } else if (path.startsWith('section9.nonUSCitizen.') || path.startsWith('nonUSCitizen.')) {
      const fieldName = path.replace(/^(section9\.)?nonUSCitizen\./, '');
      console.log(`📊 Section9: Updating nonUSCitizen field: ${fieldName}`);

      // Handle nested paths using lodash set
      if (fieldName.includes('.')) {
        console.log(`📊 Section9: Handling nested field path: ${fieldName}`);
        setSection9Data(prev => {
          const updated = cloneDeep(prev);
          const fullPath = `section9.nonUSCitizen.${fieldName}.value`;
          set(updated, fullPath, value);
          console.log(`✅ Section9: Updated nested field at path: ${fullPath}`);

          return updated;
        });
      } else {
        // Handle direct fields using existing function
        updateNonUSCitizenInfo(fieldName as keyof NonUSCitizenInfo, value);
      }
    } else {
      // Fallback: use lodash set for direct path updates
      console.log(`📊 Section9: Using fallback lodash set for path: ${path}`);
      setSection9Data(prev => {
        const updated = cloneDeep(prev);
        set(updated, path, value);

        return updated;
      });
    }

    console.log(`✅ Section9: updateFieldValueWrapper completed for path=${path}`);
  }, [updateCitizenshipStatus, updateBornToUSParentsInfo, updateNaturalizedInfo, updateDerivedInfo, updateNonUSCitizenInfo]);

  // Integration with main form context using Section 1 gold standard pattern
  // Note: integration variable is used internally by the hook for registration
  const integration = useSection86FormIntegration(
    'section9',
    'Section 9: Citizenship of Your Parents',
    section9Data,
    setSection9Data,
    () => ({ isValid: validateSection().isValid, errors: validateSection().errors, warnings: validateSection().warnings }),
    getChanges,
    updateFieldValueWrapper // Pass wrapper function that matches expected signature
  );



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
