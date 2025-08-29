/**
 * Section 1 Optimized Context - Modern Architecture
 * 
 * Migrated to use OptimizedSectionContext with performance monitoring
 * Maintains backward compatibility while providing enhanced performance
 */

import React from 'react';
import { createOptimizedSectionContext } from '../base/OptimizedSectionContext';
import { SECTION_CONFIGS } from '../../../config/field-configs';
import type {
  Section1,
  PersonalInformation
} from '../../../../api/interfaces/section-interfaces/section1';

// Section 1 data interface - extends the config-based approach
export interface Section1Data extends PersonalInformation {
  lastName: string;
  firstName: string;
  middleName?: string;
  dateOfBirth: string;
  placeOfBirth: string;
  suffix?: string;
  [key: string]: any; // Allow additional fields from config
}

// Get section configuration
const sectionConfig = SECTION_CONFIGS.section1;

// Generate default data based on field configuration
const defaultSection1Data: Section1Data = {
  lastName: '',
  firstName: '',
  middleName: '',
  dateOfBirth: '',
  placeOfBirth: '',
  suffix: ''
};

// Enhanced validation using both config and custom rules
const validateSection1 = (data: Section1Data) => {
  const errors: any[] = [];

  // Config-based validation
  sectionConfig.fields.forEach(field => {
    const value = data[field.id];
    
    field.validation?.forEach(validationRule => {
      switch (validationRule.type) {
        case 'required':
          if (!value || (typeof value === 'string' && !value.trim())) {
            errors.push({
              field: field.id,
              rule: 'required',
              message: validationRule.message,
              severity: validationRule.severity
            });
          }
          break;
        case 'maxLength':
          if (value && typeof value === 'string' && value.length > (validationRule.value || 0)) {
            errors.push({
              field: field.id,
              rule: 'maxLength',
              message: validationRule.message,
              severity: validationRule.severity
            });
          }
          break;
      }
    });
  });

  // Custom validation rules for Section 1
  if (data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (birthDate >= today) {
      errors.push({
        field: 'dateOfBirth',
        rule: 'pastDate',
        message: 'Date of birth must be in the past',
        severity: 'error'
      });
    }
    
    if (age > 120) {
      errors.push({
        field: 'dateOfBirth',
        rule: 'reasonable',
        message: 'Please verify the date of birth is correct',
        severity: 'warning'
      });
    }
  }

  // Name combination validation
  if (data.firstName && data.lastName) {
    const fullName = `${data.firstName} ${data.middleName || ''} ${data.lastName}`.trim();
    if (fullName.length > 100) {
      errors.push({
        field: 'fullName',
        rule: 'maxLength',
        message: 'Full name cannot exceed 100 characters',
        severity: 'error'
      });
    }
  }

  return errors;
};

// Create optimized context
export const {
  Provider: Section1Provider,
  useContext: useSection1Context,
  Context: Section1Context
} = createOptimizedSectionContext<Section1Data>({
  sectionName: 'Section1',
  defaultData: defaultSection1Data,
  validateSection: validateSection1,
  transformData: (data) => {
    // Data transformation logic
    const transformed = { ...data };
    
    // Normalize names (trim whitespace, proper case)
    if (transformed.firstName) {
      transformed.firstName = transformed.firstName.trim();
    }
    if (transformed.lastName) {
      transformed.lastName = transformed.lastName.trim();
    }
    if (transformed.middleName) {
      transformed.middleName = transformed.middleName.trim();
    }

    // Format place of birth
    if (transformed.placeOfBirth) {
      transformed.placeOfBirth = transformed.placeOfBirth.trim();
    }

    // Validate and format date
    if (transformed.dateOfBirth) {
      const date = new Date(transformed.dateOfBirth);
      if (!isNaN(date.getTime())) {
        transformed.dateOfBirth = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      }
    }

    return transformed;
  },
  cacheTimeout: 30000, // 30 seconds
  debounceDelay: 300    // 300ms
});

// Enhanced hook with additional utilities
export function useSection1() {
  const context = useSection1Context();
  
  return {
    ...context,
    // Backward compatibility methods
    section1Data: context.data,
    updatePersonalInfo: (updates: Partial<Section1Data>) => {
      context.updateData(updates);
    },
    // New utilities
    sectionConfig: sectionConfig,
    fieldConfigs: sectionConfig.fields,
    
    // Helper methods
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
      const requiredFields = sectionConfig.fields.filter(f => f.required);
      return requiredFields.every(field => {
        const value = context.data[field.id];
        return value && (typeof value !== 'string' || value.trim().length > 0);
      });
    }
  };
}

// Export type for backward compatibility
export type { Section1Data };

// Legacy export for migration compatibility
export const Section1ContextProvider = Section1Provider;