import { useDispatch } from 'react-redux';
import { 
  updateField, 
  addEntry, 
  removeEntry, 
  resetSection 
} from '../form/formActions';
import { 
  initializeSection, 
  setSectionValidated, 
  setSubmitting, 
  resetForm 
} from '../form/formSlice';

/**
 * Custom hook providing form actions for components
 * 
 * @returns Object containing dispatchers for form actions
 */
export const useFormActions = () => {
  const dispatch = useDispatch();

  return {
    // Field actions
    updateField: (sectionPath: string, fieldPath: string, value: any) => {
      dispatch(updateField({ sectionPath, fieldPath, value }));
    },
    
    // Entry management
    addEntry: (sectionPath: string, newEntry?: any) => {
      dispatch(addEntry({ sectionPath, newEntry }));
    },
    
    removeEntry: (sectionPath: string, entryIndex: number) => {
      dispatch(removeEntry({ sectionPath, entryIndex }));
    },
    
    // Section management
    initializeSection: (sectionPath: string, data: any) => {
      dispatch(initializeSection({ sectionPath, data }));
    },
    
    resetSection: (sectionPath: string) => {
      dispatch(resetSection({ sectionPath }));
    },
    
    setSectionValidated: (sectionPath: string, isValid: boolean, errors?: string[]) => {
      dispatch(setSectionValidated({ sectionPath, isValid, errors }));
    },
    
    // Form management
    setSubmitting: (isSubmitting: boolean) => {
      dispatch(setSubmitting(isSubmitting));
    },
    
    resetForm: () => {
      dispatch(resetForm());
    }
  };
}; 