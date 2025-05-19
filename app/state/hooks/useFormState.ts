import { useTypedSelector } from '.';
import type { RootState } from '../store';
import { get } from 'lodash';

/**
 * Custom hook to access form state
 * 
 * @returns Object containing form state selectors
 */
export const useFormState = () => {
  const formState = useTypedSelector((state: RootState) => state.form);

  return {
    // Get section data
    getSectionData: <T>(sectionPath: string): T | undefined => {
      return get(formState.sections, sectionPath);
    },
    
    // Get field value
    getFieldValue: <T>(sectionPath: string, fieldPath: string): T | undefined => {
      return get(formState.sections, `${sectionPath}.${fieldPath}`);
    },
    
    // Get validation state
    isSectionValid: (sectionPath: string): boolean => {
      return !formState.meta.errors[sectionPath] || formState.meta.errors[sectionPath].length === 0;
    },
    
    getSectionErrors: (sectionPath: string): string[] => {
      return formState.meta.errors[sectionPath] || [];
    },
    
    // Global form state
    isFormValid: (): boolean => formState.meta.isValid,
    isDirty: (): boolean => formState.meta.isDirty,
    isSubmitting: (): boolean => formState.meta.isSubmitting,
    
    // Get all validated sections
    getValidatedSections: (): string[] => formState.meta.validatedSections,
    
    // Check if section has been validated
    isSectionValidated: (sectionPath: string): boolean => {
      return formState.meta.validatedSections.includes(sectionPath);
    },
    
    // Get all form errors
    getAllErrors: (): Record<string, string[]> => formState.meta.errors
  };
}; 