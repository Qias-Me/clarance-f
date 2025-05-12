import { useState, useEffect, useCallback } from 'react';
import { get, set, cloneDeep } from 'lodash';

// Type for the visibility map
type EntryVisibilityMap = {
  [sectionPath: string]: number[]; // Array of visible indices for each section
};

// Type for the form data with any structure
type FormData = Record<string, any>;

// Type for entry info to track metadata about entries
type EntryInfo = {
  isVisible: boolean;
  index: number;
  contextIndex: number;
};

export interface UseFormEntryManagerOptions {
  // Maximum number of entries allowed per section (default: unlimited)
  maxEntries?: number | { [sectionPath: string]: number };
  // Default visibility state when initializing (default: true)
  defaultVisible?: boolean;
  // Function to determine if a section is active (e.g., if "hasX" is true)
  isSectionActive?: (formData: FormData, sectionPath: string) => boolean;
}

export interface FormEntryManagerResult {
  // Add an entry to a section (making it visible)
  addEntry: (sectionPath: string, newItem?: any) => void;
  // Remove an entry from a section (hiding it)
  removeEntry: (sectionPath: string, index: number) => void;
  // Get only visible entries for a section
  getVisibleEntries: (sectionPath: string, allEntries: any[]) => any[];
  // Check if an entry is visible
  isEntryVisible: (sectionPath: string, index: number) => boolean;
  // Get the number of visible entries for a section
  getVisibleCount: (sectionPath: string) => number;
  // Initialize visibility for a section based on current data
  initializeSection: (sectionPath: string, formData: FormData) => void;
  // Handle toggling a section on/off (e.g., "hasNames" checkbox)
  toggleSection: (sectionPath: string, isActive: boolean, formData: FormData) => void;
  // Get all entry info for a section (for more advanced operations)
  getEntryInfo: (sectionPath: string) => EntryInfo[];
  // Set the visibility map directly (for advanced control)
  setVisibilityMap: (newMap: EntryVisibilityMap) => void;
  // Get indices of visible entries
  getVisibleIndices: (sectionPath: string) => number[];
  // Check if more entries can be added
  canAddMoreEntries: (sectionPath: string) => boolean;
}

/**
 * Custom hook for managing the visibility of form entries without modifying the actual form data
 * 
 * @param options Configuration options for the form entry manager
 * @returns Object with methods for managing entry visibility
 */
export const useFormEntryManager = (
  options: UseFormEntryManagerOptions = {}
): FormEntryManagerResult => {
  // Default options
  const {
    maxEntries = Infinity,
    defaultVisible = true,
    isSectionActive = () => true,
  } = options;

  // State to track which entries are visible
  const [visibilityMap, setVisibilityMap] = useState<EntryVisibilityMap>({});

  // Add a new entry (make it visible)
  const addEntry = useCallback((sectionPath: string, newItem?: any) => {
    setVisibilityMap((prevMap) => {
      const sectionVisibility = prevMap[sectionPath] || [];
      
      // Determine the new index - either the next available index, or the length of current visible
      const newIndex = sectionVisibility.length > 0 
        ? Math.max(...sectionVisibility) + 1 
        : 0;
      
      // Check if we're at the maximum for this section
      const maxForSection = typeof maxEntries === 'object' 
        ? (maxEntries[sectionPath] || Infinity) 
        : maxEntries;
      
      if (sectionVisibility.length >= maxForSection) {
        console.warn(`Maximum entries (${maxForSection}) reached for ${sectionPath}`);
        return prevMap;
      }
      
      // Add the new index to visible entries
      return {
        ...prevMap,
        [sectionPath]: [...sectionVisibility, newIndex],
      };
    });
  }, [maxEntries]);

  // Remove an entry (hide it)
  const removeEntry = useCallback((sectionPath: string, index: number) => {
    setVisibilityMap((prevMap) => {
      const sectionVisibility = prevMap[sectionPath] || [];
      
      // Remove the index from visible entries
      return {
        ...prevMap,
        [sectionPath]: sectionVisibility.filter(i => i !== index),
      };
    });
  }, []);

  // Get only the visible entries for a section
  const getVisibleEntries = useCallback((sectionPath: string, allEntries: any[]) => {
    const visibleIndices = visibilityMap[sectionPath] || [];
    
    if (!Array.isArray(allEntries)) {
      console.warn(`Entries for ${sectionPath} is not an array:`, allEntries);
      return [];
    }
    
    // Filter the entries to only include visible ones, in the order defined by the visibility map
    return visibleIndices
      .filter(index => index < allEntries.length)
      .map(index => allEntries[index]);
  }, [visibilityMap]);

  // Check if an entry is visible
  const isEntryVisible = useCallback((sectionPath: string, index: number) => {
    const visibleIndices = visibilityMap[sectionPath] || [];
    return visibleIndices.includes(index);
  }, [visibilityMap]);

  // Get the number of visible entries for a section
  const getVisibleCount = useCallback((sectionPath: string) => {
    return (visibilityMap[sectionPath] || []).length;
  }, [visibilityMap]);

  // Initialize visibility for a section based on current data
  const initializeSection = useCallback((sectionPath: string, formData: FormData) => {
    const entriesPath = sectionPath.includes('.') ? sectionPath : `${sectionPath}.entries`;
    const entries = get(formData, entriesPath, []);
    
    // If section is not active, clear visibility
    if (!isSectionActive(formData, sectionPath)) {
      setVisibilityMap(prevMap => ({
        ...prevMap,
        [sectionPath]: []
      }));
      return;
    }
    
    if (Array.isArray(entries)) {
      // Initialize visibility for existing entries
      // If entries exist, make them visible by default
      if (entries.length > 0) {
        const visibleIndices = entries.map((_, index) => index);
        setVisibilityMap(prevMap => ({
          ...prevMap,
          [sectionPath]: visibleIndices
        }));
      } 
      // If no entries exist but section is active, add one entry by default
      else if (defaultVisible) {
        setVisibilityMap(prevMap => ({
          ...prevMap,
          [sectionPath]: [0]
        }));
      }
    }
  }, [defaultVisible, isSectionActive]);

  // Toggle section active/inactive
  const toggleSection = useCallback((sectionPath: string, isActive: boolean, formData: FormData) => {
    if (isActive) {
      // Add the first entry if activating section
      if (getVisibleCount(sectionPath) === 0 && defaultVisible) {
        setVisibilityMap(prevMap => ({
          ...prevMap,
          [sectionPath]: [0]
        }));
      }
    } else {
      // Clear visibility if deactivating section
      setVisibilityMap(prevMap => ({
        ...prevMap,
        [sectionPath]: []
      }));
    }
  }, [defaultVisible, getVisibleCount]);

  // Get detailed info about all entries for a section
  const getEntryInfo = useCallback((sectionPath: string): EntryInfo[] => {
    const visibleIndices = visibilityMap[sectionPath] || [];
    
    return visibleIndices.map((index, arrayIndex) => ({
      isVisible: true,
      index, // The actual index in the form data
      contextIndex: arrayIndex // The index in the visible entries array
    }));
  }, [visibilityMap]);

  // Get the indices of visible entries
  const getVisibleIndices = useCallback((sectionPath: string) => {
    return visibilityMap[sectionPath] || [];
  }, [visibilityMap]);

  // Check if more entries can be added
  const canAddMoreEntries = useCallback((sectionPath: string) => {
    const currentCount = getVisibleCount(sectionPath);
    const maxForSection = typeof maxEntries === 'object' 
      ? (maxEntries[sectionPath] || Infinity) 
      : maxEntries;
      
    return currentCount < maxForSection;
  }, [getVisibleCount, maxEntries]);

  return {
    addEntry,
    removeEntry,
    getVisibleEntries,
    isEntryVisible,
    getVisibleCount,
    initializeSection,
    toggleSection,
    getEntryInfo,
    setVisibilityMap,
    getVisibleIndices,
    canAddMoreEntries
  };
};

/**
 * Transforms a field ID between the context format and the PDF format
 * Context format: "9502"
 * PDF format: "9502 0 R"
 */
export const transformFieldId = {
  // Add "0 R" suffix for PDF format
  toPdfFormat: (id: string): string => {
    return id.endsWith(' 0 R') ? id : `${id} 0 R`;
  },
  
  // Remove "0 R" suffix for context format
  toContextFormat: (id: string): string => {
    return id.replace(' 0 R', '');
  }
};

/**
 * Utility functions for managing form entries
 */
export const FormEntryManager = {
  /**
   * Creates a data mapper for form entries to handle adding/removing entries
   * 
   * @param formData The current form data
   * @param contextData The context data with all available templates
   * @param onInputChange Function to update the form data
   * @returns Object with functions to manage entries
   */
  createDataMapper: (
    formData: FormData,
    contextData: FormData,
    onInputChange: (path: string, value: any) => void
  ) => {
    // Add an entry to a section using context data as template
    const addEntry = (sectionPath: string) => {
      const currentEntries = get(formData, `${sectionPath}.entries`, []);
      const contextEntries = get(contextData, `${sectionPath}.entries`, []);
      
      if (contextEntries.length > currentEntries.length) {
        const newEntry = cloneDeep(contextEntries[currentEntries.length]);
        const updatedEntries = [...currentEntries, newEntry];
        onInputChange(`${sectionPath}.entries`, updatedEntries);
      }
    };
    
    // Remove an entry from a section
    const removeEntry = (sectionPath: string, index: number) => {
      const currentEntries = get(formData, `${sectionPath}.entries`, []);
      if (index >= 0 && index < currentEntries.length) {
        const updatedEntries = [...currentEntries];
        updatedEntries.splice(index, 1);
        onInputChange(`${sectionPath}.entries`, updatedEntries);
      }
    };
    
    // Toggle a section on/off
    const toggleSection = (sectionPath: string, isActive: boolean) => {
      // Update the section's active flag
      onInputChange(`${sectionPath}.hasEntries.value`, isActive ? "YES" : "NO");
      
      // If activating, ensure at least one entry exists
      if (isActive) {
        const currentEntries = get(formData, `${sectionPath}.entries`, []);
        if (currentEntries.length === 0) {
          addEntry(sectionPath);
        }
      } else {
        // If deactivating, clear the entries
        onInputChange(`${sectionPath}.entries`, []);
      }
    };
    
    return {
      addEntry,
      removeEntry,
      toggleSection
    };
  },
  
  /**
   * Utility to get the correct path for entries in a section
   * 
   * @param sectionPath Base path for the section
   * @returns The correct path for the entries array
   */
  getEntriesPath: (sectionPath: string): string => {
    // Handle special cases for different sections
    switch (sectionPath) {
      case 'namesInfo':
        return 'namesInfo.names';
      case 'relativesInfo':
        return 'relativesInfo.relatives';
      case 'foreignContacts':
        return 'foreignContacts.contacts';
      default:
        // Default case - check if entries is explicitly in the path
        return sectionPath.includes('.entries') ? sectionPath : `${sectionPath}.entries`;
    }
  },
  
  /**
   * Check if a section is active based on its "has" property
   * 
   * @param formData The form data
   * @param sectionPath Path to the section
   * @returns Whether the section is active
   */
  isSectionActive: (formData: FormData, sectionPath: string): boolean => {
    // Determine the correct path for the "has" property
    let hasPropertyPath;
    
    // Handle special cases for different sections
    switch (sectionPath) {
      case 'namesInfo':
        hasPropertyPath = 'namesInfo.hasNames.value';
        break;
      case 'relativesInfo':
        hasPropertyPath = 'relativesInfo.hasRelatives.value';
        break;
      case 'foreignContacts':
        hasPropertyPath = 'foreignContacts.hasContacts.value';
        break;
      default:
        // Default case - look for hasEntries property
        hasPropertyPath = sectionPath.includes('.')
          ? `${sectionPath.split('.')[0]}.hasEntries.value`
          : `${sectionPath}.hasEntries.value`;
    }
    
    const hasValue = get(formData, hasPropertyPath, "NO");
    return hasValue === "YES";
  }
};

export default FormEntryManager; 