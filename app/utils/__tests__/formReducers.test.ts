/// <reference types="jest" />

import formReducer, { 
  initializeSection, 
  setSectionValidated, 
  setSubmitting, 
  resetForm,
  type FormState 
} from '../../state/form/formSlice';
import { 
  updateField, 
  addEntry, 
  removeEntry, 
  resetSection 
} from '../../state/form/formActions';

describe('Form Reducers', () => {
  // Initial test state
  let initialState: FormState;

  beforeEach(() => {
    // Reset state before each test
    initialState = {
      sections: {
        namesInfo: {
          hasNames: { value: 'YES' },
          names: [
            {
              _id: 1,
              firstName: { value: 'John' },
              lastName: { value: 'Doe' }
            }
          ]
        },
        personalInfo: {
          firstName: { value: 'Jane' },
          lastName: { value: 'Smith' }
        }
      },
      meta: {
        isValid: true,
        validatedSections: ['personalInfo'],
        isDirty: false,
        isSubmitting: false,
        errors: {}
      }
    };
  });

  describe('Field Update Reducer', () => {
    test('should update a simple field value', () => {
      const action = updateField({
        sectionPath: 'personalInfo',
        fieldPath: 'firstName.value',
        value: 'Alice'
      });

      const nextState = formReducer(initialState, action);

      expect(nextState.sections.personalInfo.firstName.value).toBe('Alice');
      expect(nextState.meta.isDirty).toBe(true);
    });

    test('should update a nested field value', () => {
      const action = updateField({
        sectionPath: 'namesInfo',
        fieldPath: 'names[0].firstName.value',
        value: 'Robert'
      });

      const nextState = formReducer(initialState, action);

      expect(nextState.sections.namesInfo.names[0].firstName.value).toBe('Robert');
      expect(nextState.meta.isDirty).toBe(true);
    });

    test('should create nested paths if they do not exist', () => {
      const action = updateField({
        sectionPath: 'contactInfo',
        fieldPath: 'phoneNumber.value',
        value: '555-1234'
      });

      const nextState = formReducer(initialState, action);

      expect(nextState.sections.contactInfo.phoneNumber.value).toBe('555-1234');
    });
  });

  describe('Entry Management Reducers', () => {
    test('should add an entry to an existing array', () => {
      const newEntry = {
        _id: 2,
        firstName: { value: 'Jane' },
        lastName: { value: 'Smith' }
      };

      const action = addEntry({
        sectionPath: 'namesInfo.names',
        newEntry
      });

      const nextState = formReducer(initialState, action);

      expect(nextState.sections.namesInfo.names.length).toBe(2);
      expect(nextState.sections.namesInfo.names[1]).toEqual(newEntry);
    });

    test('should initialize an array when adding to a non-existent path', () => {
      const newEntry = {
        _id: 1,
        type: { value: 'Home' },
        number: { value: '555-1234' }
      };

      const action = addEntry({
        sectionPath: 'contactInfo.phoneNumbers',
        newEntry
      });

      const nextState = formReducer(initialState, action);

      expect(Array.isArray(nextState.sections.contactInfo.phoneNumbers)).toBe(true);
      expect(nextState.sections.contactInfo.phoneNumbers).toEqual([newEntry]);
    });

    test('should remove an entry from an array', () => {
      // First add a second entry to remove
      let state = { ...initialState };
      state.sections.namesInfo.names.push({
        _id: 2,
        firstName: { value: 'Jane' },
        lastName: { value: 'Smith' }
      });

      const action = removeEntry({
        sectionPath: 'namesInfo.names',
        entryIndex: 1
      });

      const nextState = formReducer(state, action);

      expect(nextState.sections.namesInfo.names.length).toBe(1);
      expect(nextState.sections.namesInfo.names[0]._id).toBe(1);
    });

    test('should handle removing an entry with invalid index', () => {
      const action = removeEntry({
        sectionPath: 'namesInfo.names',
        entryIndex: 5 // Out of bounds
      });

      const nextState = formReducer(initialState, action);

      // State should remain unchanged
      expect(nextState.sections.namesInfo.names).toEqual(initialState.sections.namesInfo.names);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Section Management Reducers', () => {
    test('should reset a section to its initial state', () => {
      const action = resetSection({
        sectionPath: 'namesInfo'
      });

      const nextState = formReducer(initialState, action);

      expect(nextState.sections.namesInfo).toBeUndefined();
      expect(nextState.sections.personalInfo).toBeDefined(); // Other sections remain
    });

    test('should initialize a section with provided data', () => {
      const sectionData = {
        cityOfBirth: { value: 'New York' },
        stateOfBirth: { value: 'NY' }
      };

      const action = initializeSection({
        sectionPath: 'birthInfo',
        data: sectionData
      });

      const nextState = formReducer(initialState, action);

      expect(nextState.sections.birthInfo).toEqual(sectionData);
    });

    test('should mark a section as validated with errors', () => {
      const errors = ['Field is required', 'Invalid format'];
      const action = setSectionValidated({
        sectionPath: 'namesInfo',
        isValid: false,
        errors
      });

      const nextState = formReducer(initialState, action);

      expect(nextState.meta.validatedSections).toContain('namesInfo');
      expect(nextState.meta.errors.namesInfo).toEqual(errors);
      expect(nextState.meta.isValid).toBe(false);
    });

    test('should mark a section as validated with no errors', () => {
      const action = setSectionValidated({
        sectionPath: 'namesInfo',
        isValid: true
      });

      const nextState = formReducer(initialState, action);

      expect(nextState.meta.validatedSections).toContain('namesInfo');
      expect(nextState.meta.errors.namesInfo).toEqual([]);
      expect(nextState.meta.isValid).toBe(true);
    });
  });

  describe('Form Management Reducers', () => {
    test('should set submitting state', () => {
      const action = setSubmitting(true);
      const nextState = formReducer(initialState, action);

      expect(nextState.meta.isSubmitting).toBe(true);
    });

    test('should reset the entire form state', () => {
      const action = resetForm();
      const nextState = formReducer(initialState, action);

      expect(nextState).toEqual({
        sections: {},
        meta: {
          isValid: false,
          validatedSections: [],
          isDirty: false,
          isSubmitting: false,
          errors: {}
        }
      });
    });
  });
}); 