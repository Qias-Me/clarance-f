/**
 * Section 1: Information About You - Improved Context Provider
 * 
 * Uses the new BaseSectionContext to eliminate code duplication
 * Provides type-safe operations with improved performance
 */

import React, { useMemo } from 'react';
import { createSectionContext, ValidationUtils, Field } from './base/BaseSectionContext';
import type { ValidationError } from './base/BaseSectionContext';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PersonalInformation {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  suffix: Field<string>;
  previousNames: Field<boolean>;
  otherNamesUsed: OtherName[];
  dateOfBirth: Field<string>;
  placeOfBirth: BirthPlace;
  ssn: Field<string>;
  alsoKnownAs: Field<string>;
}

export interface OtherName {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  datesUsed: {
    from: Field<string>;
    to: Field<string>;
  };
}

export interface BirthPlace {
  city: Field<string>;
  state: Field<string>;
  country: Field<string>;
}

export interface Section1Data {
  _id: number;
  section1: PersonalInformation;
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

const validateSection1 = (data: Section1Data): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { section1 } = data;
  
  // Required field validation
  const requiredFields = [
    { field: 'section1.lastName', value: section1.lastName.value, label: 'Last Name' },
    { field: 'section1.firstName', value: section1.firstName.value, label: 'First Name' },
    { field: 'section1.dateOfBirth', value: section1.dateOfBirth.value, label: 'Date of Birth' },
    { field: 'section1.ssn', value: section1.ssn.value, label: 'Social Security Number' },
  ];
  
  requiredFields.forEach(({ field, value, label }) => {
    const error = ValidationUtils.required(value, label);
    if (error) {
      errors.push({ ...error, field });
    }
  });
  
  // SSN format validation
  if (section1.ssn.value) {
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    if (!ssnRegex.test(section1.ssn.value)) {
      errors.push({
        field: 'section1.ssn',
        message: 'SSN must be in format XXX-XX-XXXX',
        severity: 'error'
      });
    }
  }
  
  // Date validation
  if (section1.dateOfBirth.value) {
    const dob = new Date(section1.dateOfBirth.value);
    const now = new Date();
    const age = (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    if (age < 16) {
      errors.push({
        field: 'section1.dateOfBirth',
        message: 'Must be at least 16 years old',
        severity: 'error'
      });
    }
    
    if (age > 130) {
      errors.push({
        field: 'section1.dateOfBirth',
        message: 'Please verify date of birth',
        severity: 'warning'
      });
    }
  }
  
  // Other names validation
  section1.otherNamesUsed.forEach((name, index) => {
    if (!name.lastName.value || !name.firstName.value) {
      errors.push({
        field: `section1.otherNamesUsed.${index}`,
        message: 'Other name requires first and last name',
        severity: 'error'
      });
    }
  });
  
  return errors;
};

// ============================================================================
// INITIAL STATE FACTORY
// ============================================================================

const createInitialSection1 = (): Section1Data => ({
  _id: 1,
  section1: {
    lastName: { value: '' },
    firstName: { value: '' },
    middleName: { value: '' },
    suffix: { value: '' },
    previousNames: { value: false },
    otherNamesUsed: [],
    dateOfBirth: { value: '' },
    placeOfBirth: {
      city: { value: '' },
      state: { value: '' },
      country: { value: 'United States' }
    },
    ssn: { value: '' },
    alsoKnownAs: { value: '' }
  }
});

// ============================================================================
// CREATE CONTEXT USING BASE
// ============================================================================

const { Provider: BaseProvider, useContext: useBaseContext } = createSectionContext<Section1Data>({
  sectionName: 'Section1',
  defaultData: createInitialSection1(),
  validateSection: validateSection1
});

// ============================================================================
// ENHANCED CONTEXT WITH SECTION-SPECIFIC FEATURES
// ============================================================================

export interface Section1ContextType {
  // All base functionality
  section1Data: Section1Data;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;
  
  // Type-safe field updates
  updatePersonalInfo: (fieldPath: string, value: string | boolean) => void;
  updateOtherName: (index: number, field: keyof OtherName, value: string) => void;
  addOtherName: () => void;
  removeOtherName: (index: number) => void;
  
  // Validation
  validateSection: () => boolean;
  validateFullName: () => { isValid: boolean; errors: string[] };
  
  // Utilities
  resetSection: () => void;
  loadSection: (data: Section1Data) => void;
  getFieldValue: <T = string>(path: string) => T | undefined;
}

const Section1Context = React.createContext<Section1ContextType | undefined>(undefined);

export const Section1Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const baseContext = useBaseContext();
  
  // Section-specific methods
  const updatePersonalInfo = useMemo(() => 
    (fieldPath: string, value: string | boolean) => {
      baseContext.updateField(`section1.${fieldPath}.value`, value);
    },
    [baseContext]
  );
  
  const updateOtherName = useMemo(() =>
    (index: number, field: keyof OtherName, value: string) => {
      baseContext.updateField(`section1.otherNamesUsed.${index}.${field}.value`, value);
    },
    [baseContext]
  );
  
  const addOtherName = useMemo(() => () => {
    const currentNames = baseContext.data.section1.otherNamesUsed;
    const newName: OtherName = {
      lastName: { value: '' },
      firstName: { value: '' },
      middleName: { value: '' },
      datesUsed: {
        from: { value: '' },
        to: { value: '' }
      }
    };
    baseContext.updateField('section1.otherNamesUsed', [...currentNames, newName]);
  }, [baseContext]);
  
  const removeOtherName = useMemo(() => (index: number) => {
    const currentNames = baseContext.data.section1.otherNamesUsed;
    baseContext.updateField(
      'section1.otherNamesUsed',
      currentNames.filter((_, i) => i !== index)
    );
  }, [baseContext]);
  
  const validateFullName = useMemo(() => () => {
    const errors: string[] = [];
    const { lastName, firstName } = baseContext.data.section1;
    
    if (!lastName.value) errors.push('Last name is required');
    if (!firstName.value) errors.push('First name is required');
    
    if (lastName.value && lastName.value.length > 100) {
      errors.push('Last name must be 100 characters or less');
    }
    
    if (firstName.value && firstName.value.length > 100) {
      errors.push('First name must be 100 characters or less');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [baseContext.data]);
  
  const contextValue: Section1ContextType = {
    section1Data: baseContext.data,
    isLoading: baseContext.isLoading,
    errors: baseContext.errorMap,
    isDirty: baseContext.isDirty,
    updatePersonalInfo,
    updateOtherName,
    addOtherName,
    removeOtherName,
    validateSection: baseContext.validate,
    validateFullName,
    resetSection: baseContext.reset,
    loadSection: (data: Section1Data) => {
      baseContext.updateMultipleFields({ section1: data.section1 });
    },
    getFieldValue: baseContext.getFieldValue
  };
  
  return (
    <BaseProvider sectionId="section1">
      <Section1Context.Provider value={contextValue}>
        {children}
      </Section1Context.Provider>
    </BaseProvider>
  );
};

export const useSection1 = () => {
  const context = React.useContext(Section1Context);
  if (!context) {
    throw new Error('useSection1 must be used within Section1Provider');
  }
  return context;
};