/**
 * Enhanced Redux Middleware for IndexedDB Persistence
 * 
 * This middleware syncs the Redux form state with IndexedDB for persistence
 * using the improved IndexedDBService for better performance and reliability.
 */

import type { Middleware, Dispatch, Action } from '@reduxjs/toolkit';
import { 
  FormActionTypes,
  type UpdateFieldPayload,
  type EntryPayload,
  type SectionPayload 
} from './formActions';

// Import the dynamic service singleton
import DynamicService from '../../../api/service/dynamicService';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';
const dynamicService = isBrowser ? new DynamicService() : null;

/**
 * Type for our Redux state that includes form state
 */
interface AppState {
  form: {
    sections: Record<string, any>;
  };
}

/**
 * Enhanced middleware to sync Redux form state with IndexedDB
 */
export const enhancedIndexedDBMiddleware: Middleware = 
  (store) => (next) => (action) => {
    // Run the action first (we want to update Redux state before persisting)
    const result = next(action);
    
    // Skip IndexedDB operations if we're not in a browser or dynamicService isn't available
    if (!isBrowser || !dynamicService) {
      return result;
    }
    
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
          dynamicService.saveUserFormData(sectionPath, sectionData)
            .catch(error => console.error('Error saving form data:', error));
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
        
        // Save the section data to IndexedDB immediately after entry changes
        if (sectionData) {
          dynamicService.saveUserFormDataImmediate(baseSectionPath, sectionData)
            .catch(error => console.error('Error saving form data after entry change:', error));
        }
        break;
      }
      
      case FormActionTypes.RESET_SECTION: {
        if (!('payload' in action)) break;
        const payload = action.payload as SectionPayload;
        const { sectionPath } = payload;
        if (!sectionPath) break;
        
        // Remove the section data from IndexedDB
        dynamicService.deleteUserFormData(sectionPath)
          .catch(error => console.error('Error removing section data:', error));
        break;
      }
      
      case 'form/initializeSection': {
        if (!('payload' in action)) break;
        const payload = action.payload as { sectionPath: string; data: any };
        const { sectionPath, data } = payload;
        if (!sectionPath || !data) break;
        
        // Save the initialized section to IndexedDB
        dynamicService.saveUserFormDataImmediate(sectionPath, data)
          .catch(error => console.error('Error saving initialized section:', error));
        break;
      }
      
      case 'form/resetForm': {
        // Clear all form data from IndexedDB
        dynamicService.deleteAllFormData()
          .catch(error => console.error('Error clearing all form data:', error));
        break;
      }
      
      default:
        // No action needed for other action types
        break;
    }
    
    return result;
  }; 