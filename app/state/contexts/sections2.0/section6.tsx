/**
 * Section 6: Your Identifying Information - Context Provider
 *
 * React context provider for SF-86 Section 6 using the new Form Architecture 2.0.
 * This provider manages physical identifying information data with full CRUD operations,
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
  Section6,
  Section6SubsectionKey,
  Section6FieldUpdate,
  HairColor,
  EyeColor,
  Sex,
  HeightFeet,
  HeightInches
} from '../../../../api/interfaces/sections2.0/section6';
import {
  createDefaultSection6,
  updateSection6Field,
  calculateTotalHeightInches,
  formatHeight
} from '../../../../api/interfaces/sections2.0/section6';

import type { ValidationResult, ValidationError, SectionId } from '../shared/base-interfaces';

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section6ContextType {
  // State
  section6Data: Section6;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updatePhysicalInfo: (fieldPath: string, value: string) => void;
  updateIdentifyingInfo: (update: Section6FieldUpdate) => void;

  // Specific Field Updates
  updateHeight: (feet: HeightFeet, inches: HeightInches) => void;
  updateWeight: (weight: string) => void;
  updateHairColor: (color: HairColor) => void;
  updateEyeColor: (color: EyeColor) => void;
  updateSex: (sex: Sex) => void;

  // Generic Field Update (for integration)
  updateFieldValue: (path: string, value: any) => void;

  // Validation
  validateSection: () => ValidationResult;
  validatePhysicalInfo: () => boolean;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section6) => void;
  getChanges: () => any;
  getTotalHeightInches: () => number;
  getFormattedHeight: () => string;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

const createInitialSection6State = (): Section6 => createDefaultSection6();

// ============================================================================
// FIELD FLATTENING FOR PDF GENERATION
// ============================================================================

/**
 * Flattens Section 6 fields for PDF generation
 * Converts nested Field<T> objects to a flat Record<string, any> structure
 */
export const flattenSection6Fields = (section6Data: Section6): Record<string, any> => {
  const flattened: Record<string, any> = {};
  
  // Flatten physical information fields
  if (section6Data.section6) {
    if (section6Data.section6.heightFeet) {
      flattened[section6Data.section6.heightFeet.id] = section6Data.section6.heightFeet;
    }
    if (section6Data.section6.heightInches) {
      flattened[section6Data.section6.heightInches.id] = section6Data.section6.heightInches;
    }
    if (section6Data.section6.weight) {
      flattened[section6Data.section6.weight.id] = section6Data.section6.weight;
    }
    if (section6Data.section6.hairColor) {
      flattened[section6Data.section6.hairColor.id] = section6Data.section6.hairColor;
    }
    if (section6Data.section6.eyeColor) {
      flattened[section6Data.section6.eyeColor.id] = section6Data.section6.eyeColor;
    }
    if (section6Data.section6.sex) {
      flattened[section6Data.section6.sex.id] = section6Data.section6.sex;
    }
  }

  return flattened;
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section6Context = createContext<Section6ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section6ProviderProps {
  children: React.ReactNode;
}

export const Section6Provider: React.FC<Section6ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section6Data, setSection6Data] = useState<Section6>(createInitialSection6State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section6>(createInitialSection6State());

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(section6Data) !== JSON.stringify(initialData);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Validate height feet
    if (!section6Data.section6.heightFeet.value) {
      validationErrors.push({
        field: 'heightFeet',
        message: 'Height (feet) is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    // Validate height inches
    if (!section6Data.section6.heightInches.value) {
      validationErrors.push({
        field: 'heightInches',
        message: 'Height (inches) is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    // Validate weight
    if (!section6Data.section6.weight.value) {
      validationErrors.push({
        field: 'weight',
        message: 'Weight is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    } else {
      const weightNum = parseInt(section6Data.section6.weight.value);
      if (isNaN(weightNum) || weightNum <= 0 || weightNum > 1000) {
        validationErrors.push({
          field: 'weight',
          message: 'Weight must be a valid number between 1 and 1000 pounds',
          code: 'INVALID_VALUE',
          severity: 'error'
        });
      }
    }

    // Validate hair color
    if (!section6Data.section6.hairColor.value) {
      validationErrors.push({
        field: 'hairColor',
        message: 'Hair color is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    // Validate eye color
    if (!section6Data.section6.eyeColor.value) {
      validationErrors.push({
        field: 'eyeColor',
        message: 'Eye color is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    // Validate sex
    if (!section6Data.section6.sex.value) {
      validationErrors.push({
        field: 'sex',
        message: 'Sex is required',
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
  }, [section6Data]);

  const validatePhysicalInfo = useCallback((): boolean => {
    const validation = validateSection();
    return validation.isValid;
  }, [validateSection]);

  // ============================================================================
  // DATA UPDATE FUNCTIONS
  // ============================================================================

  const updatePhysicalInfo = useCallback((fieldPath: string, value: string) => {
    setSection6Data(prevData => {
      const newData = cloneDeep(prevData);
      
      // Use lodash.set for nested field updates
      set(newData as any, fieldPath, value);
      
      return newData;
    });
  }, []);

  const updateIdentifyingInfo = useCallback((update: Section6FieldUpdate) => {
    setSection6Data(prevData => {
      return updateSection6Field(prevData, update);
    });
  }, []);

  // ============================================================================
  // SPECIFIC FIELD UPDATES
  // ============================================================================

  const updateHeight = useCallback((feet: HeightFeet, inches: HeightInches) => {
    setSection6Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section6.heightFeet.value = feet;
      newData.section6.heightInches.value = inches;
      return newData;
    });
  }, []);

  const updateWeight = useCallback((weight: string) => {
    setSection6Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section6.weight.value = weight;
      return newData;
    });
  }, []);

  const updateHairColor = useCallback((color: HairColor) => {
    setSection6Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section6.hairColor.value = color;
      return newData;
    });
  }, []);

  const updateEyeColor = useCallback((color: EyeColor) => {
    setSection6Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section6.eyeColor.value = color;
      return newData;
    });
  }, []);

  const updateSex = useCallback((sex: Sex) => {
    setSection6Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section6.sex.value = sex;
      return newData;
    });
  }, []);

  /**
   * Generic field update function for integration compatibility
   * Maps generic field paths to Section 6 specific update functions
   */
  const updateFieldValue = useCallback((path: string, value: any) => {
    // Parse path to update the correct field
    if (path === 'section6.heightFeet') {
      updateIdentifyingInfo({ fieldPath: 'section6.heightFeet', newValue: value });
    } else if (path === 'section6.heightInches') {
      updateIdentifyingInfo({ fieldPath: 'section6.heightInches', newValue: value });
    } else if (path === 'section6.weight') {
      updateIdentifyingInfo({ fieldPath: 'section6.weight', newValue: value });
    } else if (path === 'section6.hairColor') {
      updateIdentifyingInfo({ fieldPath: 'section6.hairColor', newValue: value });
    } else if (path === 'section6.eyeColor') {
      updateIdentifyingInfo({ fieldPath: 'section6.eyeColor', newValue: value });
    } else if (path === 'section6.sex') {
      updateIdentifyingInfo({ fieldPath: 'section6.sex', newValue: value });
    }
  }, [updateIdentifyingInfo]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    setSection6Data(createInitialSection6State());
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section6) => {
    setSection6Data(data);
    setErrors({});
  }, []);

  const getChanges = useCallback((): any => {
    return isDirty ? { 6: section6Data } : {};
  }, [section6Data, isDirty]);

  const getTotalHeightInches = useCallback((): number => {
    return calculateTotalHeightInches(
      section6Data.section6.heightFeet.value,
      section6Data.section6.heightInches.value
    );
  }, [section6Data]);

  const getFormattedHeight = useCallback((): string => {
    return formatHeight(
      section6Data.section6.heightFeet.value,
      section6Data.section6.heightInches.value
    );
  }, [section6Data]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

 
  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section6ContextType = useMemo(() => ({
    // State
    section6Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updatePhysicalInfo,
    updateIdentifyingInfo,

    // Specific Field Updates
    updateHeight,
    updateWeight,
    updateHairColor,
    updateEyeColor,
    updateSex,

    // Generic Field Update (for integration)
    updateFieldValue,

    // Validation
    validateSection,
    validatePhysicalInfo,

    // Utility
    resetSection,
    loadSection,
    getChanges,
    getTotalHeightInches,
    getFormattedHeight
  }), [
    section6Data,
    isLoading,
    errors,
    isDirty,
    updatePhysicalInfo,
    updateIdentifyingInfo,
    updateHeight,
    updateWeight,
    updateHairColor,
    updateEyeColor,
    updateSex,
    updateFieldValue,
    validateSection,
    validatePhysicalInfo,
    resetSection,
    loadSection,
    getChanges,
    getTotalHeightInches,
    getFormattedHeight
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Section6Context.Provider value={contextValue}>
      {children}
    </Section6Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection6 = (): Section6ContextType => {
  const context = useContext(Section6Context);
  if (context === undefined) {
    throw new Error('useSection6 must be used within a Section6Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section6Provider;
export { Section6Context }; 