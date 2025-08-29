/**
 * Section 1: Information About You - Unified Architecture Example
 * 
 * Shows how to migrate existing sections to use the new UnifiedSectionContext
 * This eliminates 90% of the boilerplate and provides consistent behavior
 */

import { createUnifiedSectionContext, createSectionHook } from './base/UnifiedSectionContext';
import type { ValidationError } from './base/UnifiedSectionContext';

// Section 1 data interface
export interface Section1Data {
  lastName: string;
  firstName: string;
  middleName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  suffix: string;
  // Additional fields as needed
}

// Default data for Section 1
const defaultSection1Data: Section1Data = {
  lastName: '',
  firstName: '',
  middleName: '',
  dateOfBirth: '',
  placeOfBirth: '',
  suffix: ''
};

// Validation rules for Section 1
const validateSection1 = (data: Section1Data): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required field validations
  if (!data.firstName?.trim()) {
    errors.push({
      field: 'firstName',
      message: 'First name is required',
      severity: 'error',
      rule: 'required'
    });
  }

  if (!data.lastName?.trim()) {
    errors.push({
      field: 'lastName',
      message: 'Last name is required',
      severity: 'error',
      rule: 'required'
    });
  }

  if (!data.dateOfBirth) {
    errors.push({
      field: 'dateOfBirth',
      message: 'Date of birth is required',
      severity: 'error',
      rule: 'required'
    });
  } else {
    // Date validation
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    
    if (birthDate >= today) {
      errors.push({
        field: 'dateOfBirth',
        message: 'Date of birth must be in the past',
        severity: 'error',
        rule: 'pastDate'
      });
    }

    const age = today.getFullYear() - birthDate.getFullYear();
    if (age > 120) {
      errors.push({
        field: 'dateOfBirth',
        message: 'Please verify the date of birth is correct',
        severity: 'warning',
        rule: 'reasonable'
      });
    }
  }

  if (!data.placeOfBirth?.trim()) {
    errors.push({
      field: 'placeOfBirth',
      message: 'Place of birth is required',
      severity: 'error',
      rule: 'required'
    });
  }

  // Length validations
  if (data.firstName && data.firstName.length > 50) {
    errors.push({
      field: 'firstName',
      message: 'First name cannot exceed 50 characters',
      severity: 'error',
      rule: 'maxLength'
    });
  }

  if (data.lastName && data.lastName.length > 50) {
    errors.push({
      field: 'lastName',
      message: 'Last name cannot exceed 50 characters',
      severity: 'error',
      rule: 'maxLength'
    });
  }

  return errors;
};

// Data transformation function
const transformSection1Data = (data: Section1Data): Section1Data => {
  return {
    ...data,
    // Normalize names (trim whitespace)
    firstName: data.firstName?.trim() || '',
    lastName: data.lastName?.trim() || '',
    middleName: data.middleName?.trim() || '',
    placeOfBirth: data.placeOfBirth?.trim() || '',
    // Normalize date format
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
  };
};

// Create the unified context - replaces 200+ lines of boilerplate!
export const {
  Provider: Section1Provider,
  useContext: useSection1Context,
  Context: Section1Context
} = createUnifiedSectionContext<Section1Data>({
  sectionName: 'Section1',
  sectionNumber: 1,
  defaultData: defaultSection1Data,
  validateSection: validateSection1,
  transformData: transformSection1Data,
  debounceMs: 300,
  autoSave: true // Enable auto-save for this section
});

// Enhanced hook with Section 1-specific utilities
export const useSection1 = createSectionHook(
  useSection1Context,
  1,
  (context) => ({
    // Backward compatibility
    section1Data: context.data,
    updatePersonalInfo: context.updateData,
    
    // Section-specific utilities
    getFullName: () => {
      const { firstName, middleName, lastName, suffix } = context.data;
      const nameParts = [firstName, middleName, lastName, suffix].filter(Boolean);
      return nameParts.join(' ');
    },
    
    getAge: () => {
      if (!context.data.dateOfBirth) return null;
      const birthDate = new Date(context.data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1;
      }
      return age;
    },
    
    isComplete: () => {
      const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'placeOfBirth'];
      return requiredFields.every(field => {
        const value = context.data[field as keyof Section1Data];
        return value && value.toString().trim().length > 0;
      });
    }
  })
);

// Legacy export for migration compatibility  
export const Section1ContextProvider = Section1Provider;