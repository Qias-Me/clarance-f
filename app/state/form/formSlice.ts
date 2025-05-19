import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { 
  updateField, 
  addEntry, 
  removeEntry, 
  resetSection,
  type UpdateFieldPayload, 
  type EntryPayload, 
  type SectionPayload 
} from './formActions';
import { get, set, unset, cloneDeep } from 'lodash';

// Form state types
export interface FormState {
  // Dynamic object to store form data by section
  sections: {
    [sectionKey: string]: any;
  };
  // Track loading/validation states
  meta: {
    isValid: boolean;
    validatedSections: string[];
    isDirty: boolean;
    isSubmitting: boolean;
    errors: {
      [sectionKey: string]: string[];
    };
  };
}

// Initial state
const initialState: FormState = {
  sections: {},
  meta: {
    isValid: false,
    validatedSections: [],
    isDirty: false,
    isSubmitting: false,
    errors: {}
  }
};

// Create the form slice
const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    // Initialize form data for a section
    initializeSection(state, action: PayloadAction<{ sectionPath: string; data: any }>) {
      const { sectionPath, data } = action.payload;
      state.sections[sectionPath] = data;
    },
    
    // Mark a section as validated
    setSectionValidated(state, action: PayloadAction<{ sectionPath: string; isValid: boolean; errors?: string[] }>) {
      const { sectionPath, isValid, errors = [] } = action.payload;
      
      if (!state.meta.validatedSections.includes(sectionPath)) {
        state.meta.validatedSections.push(sectionPath);
      }
      
      if (!isValid) {
        state.meta.errors[sectionPath] = errors;
      } else {
        state.meta.errors[sectionPath] = [];
      }
      
      // Update overall validity
      state.meta.isValid = Object.values(state.meta.errors).every(
        sectionErrors => sectionErrors.length === 0
      );
    },
    
    // Set form submission state
    setSubmitting(state, action: PayloadAction<boolean>) {
      state.meta.isSubmitting = action.payload;
    },
    
    // Reset the entire form
    resetForm() {
      return initialState;
    }
  },
  // Handle external actions
  extraReducers: (builder) => {
    builder
      // Update a single field
      .addCase(updateField, (state, action) => {
        const { sectionPath, fieldPath, value } = action.payload;
        const fullPath = `sections.${sectionPath}.${fieldPath}`;
        
        // Update the field value
        set(state, fullPath, value);
        state.meta.isDirty = true;
      })
      
      // Add an entry to a repeatable section
      .addCase(addEntry, (state, action) => {
        const { sectionPath, newEntry } = action.payload;
        
        // Get the current entries array
        const entriesPath = `sections.${sectionPath}`;
        const entries = get(state, entriesPath, []);
        
        if (!Array.isArray(entries)) {
          // Initialize as array if not already
          set(state, entriesPath, [newEntry || {}]);
        } else {
          // Add to existing array - fix for "not assignable to parameter of type never"
          const typedEntries = entries as any[];
          typedEntries.push(newEntry || {});
        }
        
        state.meta.isDirty = true;
      })
      
      // Remove an entry from a repeatable section
      .addCase(removeEntry, (state, action) => {
        const { sectionPath, entryIndex } = action.payload;
        
        if (entryIndex === undefined) {
          console.error('No entry index provided for removeEntry action');
          return;
        }
        
        const entriesPath = `sections.${sectionPath}`;
        const entries = get(state, entriesPath, []);
        
        if (Array.isArray(entries) && entryIndex >= 0 && entryIndex < entries.length) {
          // Remove the entry at the specified index
          entries.splice(entryIndex, 1);
          state.meta.isDirty = true;
        }
      })
      
      // Reset a section to its initial state
      .addCase(resetSection, (state, action) => {
        const { sectionPath } = action.payload;
        
        // Remove the section data
        unset(state.sections, sectionPath);
        
        // Remove from validated sections
        state.meta.validatedSections = state.meta.validatedSections.filter(
          section => section !== sectionPath
        );
        
        // Clear section errors
        delete state.meta.errors[sectionPath];
        
        state.meta.isDirty = true;
      });
  }
});

// Export actions from the slice
export const { 
  initializeSection,
  setSectionValidated,
  setSubmitting,
  resetForm
} = formSlice.actions;

// Export the reducer
export default formSlice.reducer; 