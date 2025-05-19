/**
 * Redux Middleware for IndexedDB Persistence
 * 
 * This middleware syncs the Redux form state with IndexedDB for persistence.
 * It intercepts relevant actions to save changes, and loads data on initialization.
 */

import type { Middleware, MiddlewareAPI, Dispatch, Action } from '@reduxjs/toolkit';
import { 
  FormActionTypes,
  type UpdateFieldPayload,
  type EntryPayload,
  type SectionPayload 
} from './formActions';
import {
  saveFormSection,
  getFormSection,
  getAllFormSections,
  removeFormSection
} from '../../utils/indexedDBService';
import { debounce } from 'lodash';

/**
 * A delay to prevent excessive IndexedDB writes during rapid form updates
 */
const SAVE_DELAY_MS = 500;

/**
 * Creates a debounced version of saveFormSection to prevent excessive writes
 */
const debouncedSaveSection = debounce(
  async (sectionPath: string, data: any) => {
    try {
      await saveFormSection(sectionPath, data);
    } catch (error) {
      console.error('Error saving form data to IndexedDB:', error);
    }
  },
  SAVE_DELAY_MS,
  { maxWait: 2000 }
);

/**
 * Type for our Redux state that includes form state
 */
interface AppState {
  form: {
    sections: Record<string, any>;
  };
}

/**
 * Middleware to sync Redux form state with IndexedDB
 */
export const indexedDBMiddleware: Middleware = 
  (store) => (next) => (action) => {
    // Run the action first (we want to update Redux state before persisting)
    const result = next(action);
    
    // Check if action is an object with a type and payload
    if (typeof action !== 'object' || action === null || !('type' in action)) {
      return result;
    }
    
    // After state update, handle IndexedDB persistence based on action type
    const actionType = action.type as string;
    
    switch (actionType) {
      case FormActionTypes.UPDATE_FIELD: {
        if (!('payload' in action)) break;
        const payload = action.payload as UpdateFieldPayload;
        const { sectionPath } = payload;
        if (!sectionPath) break;
        
        // Get the current state of the section
        const state = store.getState() as AppState;
        const sectionData = state.form.sections[sectionPath];
        
        // Save the section data to IndexedDB with debounce
        if (sectionData) {
          debouncedSaveSection(sectionPath, sectionData);
        }
        break;
      }
      
      case FormActionTypes.ADD_ENTRY:
      case FormActionTypes.REMOVE_ENTRY: {
        if (!('payload' in action)) break;
        const payload = action.payload as EntryPayload;
        const { sectionPath } = payload;
        if (!sectionPath) break;
        
        // Get the current state of the section
        const state = store.getState() as AppState;
        
        // Extract the base section path (for nested arrays like 'namesInfo.names')
        const baseSectionPath = sectionPath.split('.')[0];
        const sectionData = state.form.sections[baseSectionPath];
        
        // Save the section data to IndexedDB
        if (sectionData) {
          debouncedSaveSection(baseSectionPath, sectionData);
        }
        break;
      }
      
      case FormActionTypes.RESET_SECTION: {
        if (!('payload' in action)) break;
        const payload = action.payload as SectionPayload;
        const { sectionPath } = payload;
        if (!sectionPath) break;
        
        // Remove the section data from IndexedDB
        removeFormSection(sectionPath).catch(error => {
          console.error('Error removing form section from IndexedDB:', error);
        });
        break;
      }
      
      case 'form/initializeSection': {
        if (!('payload' in action)) break;
        const payload = action.payload as { sectionPath: string; data: any };
        const { sectionPath, data } = payload;
        if (!sectionPath || !data) break;
        
        // Save the initialized section to IndexedDB
        debouncedSaveSection(sectionPath, data);
        break;
      }
      
      case 'form/resetForm': {
        // Clear all form data from IndexedDB
        import('../../utils/indexedDBService').then(({ clearAllFormData }) => {
          clearAllFormData().catch(error => {
            console.error('Error clearing form data from IndexedDB:', error);
          });
        });
        break;
      }
      
      default:
        // No action needed for other action types
        break;
    }
    
    return result;
  };

/**
 * Loads form data from IndexedDB and initializes the Redux store
 */
export const loadFormDataFromIndexedDB = async (store: { dispatch: Dispatch }) => {
  try {
    // Get all form sections from IndexedDB
    const sectionsData = await getAllFormSections();
    
    if (sectionsData) {
      // Initialize each section in the Redux store
      Object.entries(sectionsData).forEach(([sectionPath, data]) => {
        store.dispatch({
          type: 'form/initializeSection',
          payload: { sectionPath, data }
        });
      });
      
      console.log('Form data loaded from IndexedDB');
    }
  } catch (error) {
    console.error('Error loading form data from IndexedDB:', error);
  }
};

/**
 * Default export of the middleware
 */
export default indexedDBMiddleware; 