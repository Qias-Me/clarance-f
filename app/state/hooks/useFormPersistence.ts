/**
 * Custom hook for working with form data persistence
 * Provides methods to manually save, load, and clear form data
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { 
  saveFormSection, 
  getFormSection, 
  clearAllFormData,
  isIndexedDBAvailable 
} from '../../utils/indexedDBService';

/**
 * Hook for working with IndexedDB form persistence
 * @returns Object with methods for manual form persistence operations
 */
export const useFormPersistence = () => {
  const dispatch = useDispatch();
  
  /**
   * Manually save a form section to IndexedDB
   */
  const saveSection = useCallback(async (sectionPath: string, data: any): Promise<boolean> => {
    try {
      const result = await saveFormSection(sectionPath, data);
      return result;
    } catch (error) {
      console.error('Error saving form section:', error);
      return false;
    }
  }, []);
  
  /**
   * Manually load a form section from IndexedDB
   */
  const loadSection = useCallback(async (sectionPath: string): Promise<any> => {
    try {
      // Get the data from IndexedDB
      const data = await getFormSection(sectionPath);
      
      if (data) {
        // Update Redux store
        dispatch({
          type: 'form/initializeSection',
          payload: { sectionPath, data }
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error loading form section:', error);
      return null;
    }
  }, [dispatch]);
  
  /**
   * Clear all saved form data
   */
  const clearAllData = useCallback(async (): Promise<boolean> => {
    try {
      const result = await clearAllFormData();
      
      if (result) {
        // Reset the form state in Redux
        dispatch({ type: 'form/resetForm' });
      }
      
      return result;
    } catch (error) {
      console.error('Error clearing form data:', error);
      return false;
    }
  }, [dispatch]);
  
  /**
   * Check if browser supports IndexedDB storage
   */
  const isSupported = useCallback((): boolean => {
    return isIndexedDBAvailable();
  }, []);
  
  return {
    saveSection,
    loadSection,
    clearAllData,
    isSupported
  };
};

export default useFormPersistence; 