import { useState, useEffect, useCallback } from 'react';
import { get, set, cloneDeep } from 'lodash';
import { EntryKeyManager } from './EntryKeyManager';
import { generateFieldId, processEntryFieldIds, stripIdSuffix, addIdSuffix } from '../formHandler';
// Import Redux hooks
import { useFormActions, useFormState } from '../../state/hooks';
// Import SubsectionInfo type
import type { SubsectionInfo } from '../../../api/interfaces/FieldMetadata';

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
  subsectionId?: string; // Optional subsection identifier (e.g., "9.1")
};

// Type for subsection configuration
interface SubsectionConfig {
  parentSectionPath: string;  // Path to the parent section (e.g., 'citizenshipInfo')
  subsectionId: string;       // Subsection identifier (e.g., '9.1')
  entriesPath: string;        // Path to the entries array within the subsection
  hasFlag?: string;           // Path to the hasFlag field for this subsection (if any)
}

export interface UseFormEntryManagerOptions {
  // Maximum number of entries allowed per section (default: unlimited)
  maxEntries?: number | { [sectionPath: string]: number };
  // Default visibility state when initializing (default: true)
  defaultVisible?: boolean;
  // Function to determine if a section is active (e.g., if "hasX" is true)
  isSectionActive?: (formData: FormData, sectionPath: string) => boolean;
  // Subsection configurations (for handling subsection-specific entries)
  subsectionConfigs?: SubsectionConfig[];
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
  // Add an entry to a subsection
  addSubsectionEntry: (subsectionPath: string, subsectionId: string, newItem?: any) => void;
  // Remove an entry from a subsection
  removeSubsectionEntry: (subsectionPath: string, subsectionId: string, index: number) => void;
  // Get subsection configuration for a given path
  getSubsectionConfig: (subsectionPath: string, subsectionId: string) => SubsectionConfig | undefined;
}

// Default subsection configurations for known subsections
const DEFAULT_SUBSECTION_CONFIGS: SubsectionConfig[] = [
  // Citizenship subsections
  {
    parentSectionPath: 'citizenshipInfo',
    subsectionId: '9.1',
    entriesPath: 'citizenshipInfo.section9_1.entries',
    hasFlag: 'citizenshipInfo.section9_1.hasEntries'
  },
  {
    parentSectionPath: 'citizenshipInfo',
    subsectionId: '9.2',
    entriesPath: 'citizenshipInfo.section9_2.entries',
    hasFlag: 'citizenshipInfo.section9_2.hasEntries'
  },
  {
    parentSectionPath: 'citizenshipInfo',
    subsectionId: '9.3',
    entriesPath: 'citizenshipInfo.section9_3.entries',
    hasFlag: 'citizenshipInfo.section9_3.hasEntries'
  },
  {
    parentSectionPath: 'citizenshipInfo',
    subsectionId: '9.4',
    entriesPath: 'citizenshipInfo.section9_4.entries',
    hasFlag: 'citizenshipInfo.section9_4.hasEntries'
  },
  {
    parentSectionPath: 'citizenshipInfo',
    subsectionId: '9.5',
    entriesPath: 'citizenshipInfo.section9_5.entries',
    hasFlag: 'citizenshipInfo.section9_5.hasEntries'
  },
  // Employment subsections
  {
    parentSectionPath: 'employmentInfo',
    subsectionId: '13.2',
    entriesPath: 'employmentInfo.section13_2.entries',
    hasFlag: 'employmentInfo.section13_2.hasEntries'
  },
  {
    parentSectionPath: 'employmentInfo',
    subsectionId: '13.3',
    entriesPath: 'employmentInfo.section13_3.entries',
    hasFlag: 'employmentInfo.section13_3.hasEntries'
  },
  {
    parentSectionPath: 'employmentInfo',
    subsectionId: '13.4',
    entriesPath: 'employmentInfo.section13_4.entries',
    hasFlag: 'employmentInfo.section13_4.hasEntries'
  },
  {
    parentSectionPath: 'employmentInfo',
    subsectionId: '13.5',
    entriesPath: 'employmentInfo.section13_5.entries',
    hasFlag: 'employmentInfo.section13_5.hasEntries'
  },
  // Relatives subsections
  {
    parentSectionPath: 'relativesInfo',
    subsectionId: '18.1',
    entriesPath: 'relativesInfo.section18_1.entries',
    hasFlag: 'relativesInfo.section18_1.hasEntries'
  },
  {
    parentSectionPath: 'relativesInfo',
    subsectionId: '18.2',
    entriesPath: 'relativesInfo.section18_2.entries',
    hasFlag: 'relativesInfo.section18_2.hasEntries'
  },
  {
    parentSectionPath: 'relativesInfo',
    subsectionId: '18.3',
    entriesPath: 'relativesInfo.section18_3.entries',
    hasFlag: 'relativesInfo.section18_3.hasEntries'
  }
];

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
    subsectionConfigs = DEFAULT_SUBSECTION_CONFIGS
  } = options;

  // State to track which entries are visible
  const [visibilityMap, setVisibilityMap] = useState<EntryVisibilityMap>({});
  
  // State to track subsection visibility maps
  const [subsectionVisibilityMap, setSubsectionVisibilityMap] = useState<Record<string, EntryVisibilityMap>>({});

  // Access Redux hooks inside the function to allow for optional Redux usage
  // These will be undefined if called outside a React component
  let formActions: ReturnType<typeof useFormActions> | undefined;
  let formState: ReturnType<typeof useFormState> | undefined;

  try {
    formActions = useFormActions();
    formState = useFormState();
  } catch (error) {
    // If we're not in a React component context, these will be undefined
    console.debug('Redux hooks not available, using direct update method');
  }

  // Synchronize visibility with Redux store changes
  useEffect(() => {
    // Skip synchronization if Redux is not available
    if (!formState) return;
    
    // Function to initialize visibility from Redux data
    const syncVisibilityWithReduxState = () => {
      // Get a list of all sections to check
      const dynamicSections = FormEntryManager.getDynamicSections();
      
      // Initialize each section
      dynamicSections.forEach(sectionPath => {
        try {
          const sectionData = formState?.getSectionData(sectionPath);
          if (sectionData) {
            // Get entries from the section data
            const entriesPath = FormEntryManager.getEntriesPath(sectionPath);
            const entriesParts = entriesPath.split('.');
            const entriesKey = entriesParts[entriesParts.length - 1];
            const entries = sectionData[entriesKey as keyof typeof sectionData] as any[];
            
            // Skip if no entries or section is not active
            if (!Array.isArray(entries) || entries.length === 0) {
              return;
            }
            
            // Check if section is active
            const isActive = FormEntryManager.isSectionActive(sectionData, sectionPath);
            if (!isActive) {
              return;
            }
            
            // Update visibility map for this section
            setVisibilityMap(prevMap => {
              // Only update if the visibility doesn't already exist
              if (prevMap[sectionPath] && prevMap[sectionPath].length > 0) {
                return prevMap;
              }
              
              const visibleIndices = entries.map((_, index) => index);
              return {
                ...prevMap,
                [sectionPath]: visibleIndices
              };
            });
          }
        } catch (error) {
          console.error(`Error syncing visibility for section ${sectionPath}:`, error);
        }
      });
      
      // Initialize subsections
      subsectionConfigs.forEach(config => {
        try {
          const parentSectionData = formState?.getSectionData(config.parentSectionPath);
          if (parentSectionData) {
            // Get entries path components
            const entriesPathParts = config.entriesPath.split('.');
            const lastPart = entriesPathParts.pop();
            if (!lastPart) return;
            
            // Navigate to the subsection object
            let subsectionData = parentSectionData;
            for (let i = 1; i < entriesPathParts.length; i++) {
              const part = entriesPathParts[i];
              subsectionData = subsectionData[part as keyof typeof subsectionData];
              
              // If we can't find the subsection, skip
              if (!subsectionData) return;
            }
            
            // Get entries for this subsection
            const entries = subsectionData[lastPart as keyof typeof subsectionData] as any[];
            
            // Skip if no entries
            if (!Array.isArray(entries) || entries.length === 0) {
              return;
            }
            
            // Check if subsection is active using hasFlag if defined
            if (config.hasFlag) {
              const hasFlagParts = config.hasFlag.split('.');
              const hasFlagKey = hasFlagParts[hasFlagParts.length - 1];
              
              // Navigate to the parent object containing the hasFlag
              let hasFlagParent = parentSectionData;
              for (let i = 1; i < hasFlagParts.length - 1; i++) {
                const part = hasFlagParts[i];
                hasFlagParent = hasFlagParent[part as keyof typeof hasFlagParent];
                
                // If we can't find the parent, skip
                if (!hasFlagParent) return;
              }
              
              // Check if hasFlag indicates the subsection is active
              const hasFlagValue = hasFlagParent[hasFlagKey as keyof typeof hasFlagParent];
              const isActive = hasFlagValue === 'YES' || hasFlagValue === true;
              if (!isActive) {
                return;
              }
            }
            
            // Update subsection visibility map
            setSubsectionVisibilityMap(prevMap => {
              // Create a subsection key (e.g., 'citizenshipInfo.9.1')
              const subsectionKey = `${config.parentSectionPath}.${config.subsectionId}`;
              
              // Only update if the visibility doesn't already exist
              if (prevMap[subsectionKey] && 
                  prevMap[subsectionKey][config.entriesPath] && 
                  prevMap[subsectionKey][config.entriesPath].length > 0) {
                return prevMap;
              }
              
              const visibleIndices = entries.map((_, index) => index);
              return {
                ...prevMap,
                [subsectionKey]: {
                  ...(prevMap[subsectionKey] || {}),
                  [config.entriesPath]: visibleIndices
                }
              };
            });
          }
        } catch (error) {
          console.error(`Error syncing visibility for subsection ${config.subsectionId}:`, error);
        }
      });
    };
    
    // Run synchronization
    syncVisibilityWithReduxState();
    
    // No need for a dependency array here since we only want to do this once
    // when the Redux state is first available
  }, [formState, subsectionConfigs]);

  // Get the number of visible entries for a section
  const getVisibleCount = useCallback((sectionPath: string) => {
    return (visibilityMap[sectionPath] || []).length;
  }, [visibilityMap]);

  // Add a new entry (make it visible)
  const addEntry = useCallback((sectionPath: string, newItem?: any) => {
    // Update visibility in local state
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
    
    // If Redux is available, also dispatch an action to add the entry to the data store
    if (formActions) {
      // Create a new entry based on the newItem or an empty object as fallback
      formActions.addEntry(sectionPath, newItem || {});
      
      // If the section has a "has" flag (e.g., "hasNames"), ensure it's set to "YES"
      const hasFlag = FormEntryManager.getHasFlagPath(sectionPath);
      if (hasFlag) {
        const hasFlagParts = hasFlag.split('.');
        const hasFlagField = hasFlagParts.length > 1 ? hasFlagParts.pop() || '' : hasFlag;
        const hasFlagSection = hasFlagParts.join('.');
        
        formActions.updateField(hasFlagSection, hasFlagField, "YES");
      }
    }
  }, [maxEntries, formActions]);

  // Remove an entry (hide it)
  const removeEntry = useCallback((sectionPath: string, index: number) => {
    // Update visibility in local state
    setVisibilityMap((prevMap) => {
      const sectionVisibility = prevMap[sectionPath] || [];
      
      // Remove the index from visible entries
      const updatedVisibility = sectionVisibility.filter(i => i !== index);
      
      // Update the visibility map
      return {
        ...prevMap,
        [sectionPath]: updatedVisibility
      };
    });
    
    // If Redux is available, also dispatch an action to remove the entry from the data store
    if (formActions) {
      // Remove the entry from Redux store
      formActions.removeEntry(sectionPath, index);
      
      // If we've removed all entries and there's a "has" flag, set it to "NO"
      const visibleCount = getVisibleCount(sectionPath);
      if (visibleCount <= 1) { // Since we haven't updated the count yet, check for <=1
        const hasFlag = FormEntryManager.getHasFlagPath(sectionPath);
        if (hasFlag) {
          const hasFlagParts = hasFlag.split('.');
          const hasFlagField = hasFlagParts.length > 1 ? hasFlagParts.pop() || '' : hasFlag;
          const hasFlagSection = hasFlagParts.join('.');
          
          formActions.updateField(hasFlagSection, hasFlagField, "NO");
        }
      }
    }
  }, [formActions, getVisibleCount]);

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

  // Get subsection configuration for a given path and subsection ID
  const getSubsectionConfig = useCallback((subsectionPath: string, subsectionId: string): SubsectionConfig | undefined => {
    return subsectionConfigs.find(config => 
      config.parentSectionPath === subsectionPath && config.subsectionId === subsectionId
    );
  }, [subsectionConfigs]);

  // Add an entry to a subsection
  const addSubsectionEntry = useCallback((subsectionPath: string, subsectionId: string, newItem?: any) => {
    // Find the configuration for this subsection
    const config = getSubsectionConfig(subsectionPath, subsectionId);
    if (!config) {
      console.error(`No configuration found for subsection ${subsectionPath}.${subsectionId}`);
      return;
    }
    
    // Create a subsection key (e.g., 'citizenshipInfo.9.1')
    const subsectionKey = `${subsectionPath}.${subsectionId}`;
    
    // Update subsection visibility map
    setSubsectionVisibilityMap((prevMap) => {
      // Get existing entries for this subsection
      const entriesVisibility = (prevMap[subsectionKey] && prevMap[subsectionKey][config.entriesPath]) || [];
      
      // Determine the new index
      const newIndex = entriesVisibility.length > 0 
        ? Math.max(...entriesVisibility) + 1 
        : 0;
      
      // Check if we're at maximum entries
      const maxForSection = typeof maxEntries === 'object' 
        ? (maxEntries[config.entriesPath] || Infinity) 
        : maxEntries;
      
      if (entriesVisibility.length >= maxForSection) {
        console.warn(`Maximum entries (${maxForSection}) reached for ${config.entriesPath}`);
        return prevMap;
      }
      
      // Add the new index to visible entries
      return {
        ...prevMap,
        [subsectionKey]: {
          ...(prevMap[subsectionKey] || {}),
          [config.entriesPath]: [...entriesVisibility, newIndex]
        }
      };
    });
    
    // If Redux is available, dispatch action to add the entry to the data store
    if (formActions) {
      // Add proper subsection metadata to the new item
      const processedItem = newItem ? { ...newItem } : {};
      
      // Add subsection info to the item
      processedItem.subsectionInfo = {
        section: parseInt(subsectionId.split('.')[0]),
        subsection: parseInt(subsectionId.split('.')[1])
      };
      
      // Add the entry to the Redux store
      if (typeof formActions.addSubsectionEntry === 'function') {
        formActions.addSubsectionEntry(config.entriesPath, processedItem);
      } else {
        // Fallback: use regular addEntry if subsection-specific method is not available
        console.warn('addSubsectionEntry not available in formActions, using fallback approach');
        // Create path for the entries array
        const entriesPathParts = config.entriesPath.split('.');
        const entriesArrayPath = entriesPathParts.slice(0, -1).join('.');
        formActions.addEntry(entriesArrayPath, processedItem);
      }
      
      // If the subsection has a "has" flag, set it to "YES"
      if (config.hasFlag) {
        const hasFlagParts = config.hasFlag.split('.');
        const hasFlagField = hasFlagParts.length > 1 ? hasFlagParts.pop() || '' : config.hasFlag;
        const hasFlagSection = hasFlagParts.join('.');
        
        formActions.updateField(hasFlagSection, hasFlagField, "YES");
      }
    }
  }, [formActions, getSubsectionConfig, maxEntries]);

  // Remove an entry from a subsection
  const removeSubsectionEntry = useCallback((subsectionPath: string, subsectionId: string, index: number) => {
    // Find the configuration for this subsection
    const config = getSubsectionConfig(subsectionPath, subsectionId);
    if (!config) {
      console.error(`No configuration found for subsection ${subsectionPath}.${subsectionId}`);
      return;
    }
    
    // Create a subsection key (e.g., 'citizenshipInfo.9.1')
    const subsectionKey = `${subsectionPath}.${subsectionId}`;
    
    // Update subsection visibility map
    setSubsectionVisibilityMap((prevMap) => {
      // Get existing entries for this subsection
      const entriesVisibility = (prevMap[subsectionKey] && prevMap[subsectionKey][config.entriesPath]) || [];
      
      // Remove the index from visible entries
      const updatedVisibility = entriesVisibility.filter(i => i !== index);
      
      // Update the visibility map
      return {
        ...prevMap,
        [subsectionKey]: {
          ...(prevMap[subsectionKey] || {}),
          [config.entriesPath]: updatedVisibility
        }
      };
    });
    
    // If Redux is available, dispatch action to remove the entry from the data store
    if (formActions) {
      // Remove the entry from the Redux store
      if (typeof formActions.removeSubsectionEntry === 'function') {
        formActions.removeSubsectionEntry(config.entriesPath, index);
      } else {
        // Fallback: use regular removeEntry if subsection-specific method is not available
        console.warn('removeSubsectionEntry not available in formActions, using fallback approach');
        // Create path for the entries array
        const entriesPathParts = config.entriesPath.split('.');
        const entriesArrayPath = entriesPathParts.slice(0, -1).join('.');
        formActions.removeEntry(entriesArrayPath, index);
      }
      
      // If the subsection has a "has" flag and there are no more entries, set it to "NO"
      if (config.hasFlag) {
        // Get visible count for this subsection
        const entriesVisibility = (subsectionVisibilityMap[subsectionKey] && 
                                   subsectionVisibilityMap[subsectionKey][config.entriesPath]) || [];
        
        if (entriesVisibility.length <= 1) { // Since we haven't updated the count yet, check for <=1
          const hasFlagParts = config.hasFlag.split('.');
          const hasFlagField = hasFlagParts.length > 1 ? hasFlagParts.pop() || '' : config.hasFlag;
          const hasFlagSection = hasFlagParts.join('.');
          
          formActions.updateField(hasFlagSection, hasFlagField, "NO");
        }
      }
    }
  }, [formActions, getSubsectionConfig, subsectionVisibilityMap]);

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
      
      // If Redux is available, ensure the "has" flag is "NO"
      if (formActions) {
        const hasFlag = FormEntryManager.getHasFlagPath(sectionPath);
        if (hasFlag) {
          const hasFlagParts = hasFlag.split('.');
          const hasFlagField = hasFlagParts.length > 1 ? hasFlagParts.pop() || '' : hasFlag;
          const hasFlagSection = hasFlagParts.join('.');
          
          formActions.updateField(hasFlagSection, hasFlagField, "NO");
        }
      }
      
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
        
        // If Redux is available, ensure entries are initialized and "has" flag is "YES"
        if (formActions) {
          // Initialize the section if entries exist
          const entriesField = entriesPath.split('.').pop() || 'entries';
          const sectionPathBase = entriesPath.replace(new RegExp(`\\.${entriesField}$`), '');
          
          // Ensure the "has" flag is "YES"
          const hasFlag = FormEntryManager.getHasFlagPath(sectionPath);
          if (hasFlag) {
            const hasFlagParts = hasFlag.split('.');
            const hasFlagField = hasFlagParts.length > 1 ? hasFlagParts.pop() || '' : hasFlag;
            const hasFlagSection = hasFlagParts.join('.');
            
            formActions.updateField(hasFlagSection, hasFlagField, "YES");
          }
        }
      } 
      // If no entries exist but section is active, add one entry by default
      else if (defaultVisible) {
        setVisibilityMap(prevMap => ({
          ...prevMap,
          [sectionPath]: [0]
        }));
        
        // If Redux is available, add an initial empty entry
        if (formActions) {
          formActions.addEntry(sectionPath);
          
          // Ensure the "has" flag is "YES"
          const hasFlag = FormEntryManager.getHasFlagPath(sectionPath);
          if (hasFlag) {
            const hasFlagParts = hasFlag.split('.');
            const hasFlagField = hasFlagParts.length > 1 ? hasFlagParts.pop() || '' : hasFlag;
            const hasFlagSection = hasFlagParts.join('.');
            
            formActions.updateField(hasFlagSection, hasFlagField, "YES");
          }
        }
      }
    }
  }, [defaultVisible, isSectionActive, formActions]);

  // Toggle section active/inactive
  const toggleSection = useCallback((sectionPath: string, isActive: boolean, formData: FormData) => {
    if (isActive) {
      // Add the first entry if activating section
      if (getVisibleCount(sectionPath) === 0 && defaultVisible) {
        setVisibilityMap(prevMap => ({
          ...prevMap,
          [sectionPath]: [0]
        }));
        
        // If Redux is available, add an initial entry to the data store
        if (formActions) {
          // Get template entries from context/form data if available
          const entriesPath = FormEntryManager.getEntriesPath(sectionPath);
          const contextEntries = get(formData, entriesPath, []);
          
          // Add a new entry or initialize with empty if no template
          if (Array.isArray(contextEntries) && contextEntries.length > 0) {
            formActions.addEntry(sectionPath, contextEntries[0]);
          } else {
            formActions.addEntry(sectionPath);
          }
          
          // Set the "has" flag to "YES"
          const hasFlag = FormEntryManager.getHasFlagPath(sectionPath);
          if (hasFlag) {
            const hasFlagParts = hasFlag.split('.');
            const hasFlagField = hasFlagParts.length > 1 ? hasFlagParts.pop() || '' : hasFlag;
            const hasFlagSection = hasFlagParts.join('.');
            
            formActions.updateField(hasFlagSection, hasFlagField, "YES");
          }
        }
      }
    } else {
      // Clear visibility if deactivating section
      setVisibilityMap(prevMap => ({
        ...prevMap,
        [sectionPath]: []
      }));
      
      // If Redux is available, also update the "has" flag to "NO"
      if (formActions) {
        const hasFlag = FormEntryManager.getHasFlagPath(sectionPath);
        if (hasFlag) {
          const hasFlagParts = hasFlag.split('.');
          const hasFlagField = hasFlagParts.length > 1 ? hasFlagParts.pop() || '' : hasFlag;
          const hasFlagSection = hasFlagParts.join('.');
          
          formActions.updateField(hasFlagSection, hasFlagField, "NO");
        }
      }
    }
  }, [defaultVisible, getVisibleCount, formActions]);

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
    canAddMoreEntries,
    addSubsectionEntry,
    removeSubsectionEntry,
    getSubsectionConfig
  };
};

/**
 * Transforms a field ID between the context format and the PDF format
 * Context format: "9502"
 * PDF format: "9502 0 R"
 */
export const transformFieldId = {
  /**
   * Adds "0 R" suffix for PDF format
   * 
   * @param id Field ID to convert to PDF format
   * @returns Field ID with "0 R" suffix added if not already present
   */
  toPdfFormat: (id: string): string => {
    if (!id) return id;
    
    // Check if the ID is already in PDF format
    if (id.endsWith(' 0 R')) {
      return id;
    }
    
    // Ensure no partial matches by checking for whitespace before adding suffix
    if (id.includes(' 0 R')) {
      const cleanId = id.replace(/ 0 R/g, '');
      return `${cleanId} 0 R`;
    }
    
    return `${id} 0 R`;
  },
  
  /**
   * Removes "0 R" suffix for context format
   * 
   * @param id Field ID to convert to context format
   * @returns Field ID with "0 R" suffix removed
   */
  toContextFormat: (id: string): string => {
    if (!id) return id;
    
    // Handle case where ID already doesn't have the suffix
    if (!id.includes(' 0 R')) {
      return id;
    }
    
    // Remove all instances of the suffix (in case of duplication)
    return id.replace(/ 0 R/g, '');
  },
  
  /**
   * Validates if a field ID is in the correct format
   * 
   * @param id Field ID to validate
   * @param format Expected format ('pdf' or 'context')
   * @returns Whether the ID is in the correct format
   */
  isValidFormat: (id: string, format: 'pdf' | 'context'): boolean => {
    if (!id) return false;
    
    if (format === 'pdf') {
      return id.endsWith(' 0 R');
    } else {
      return !id.includes(' 0 R');
    }
  },
  
  /**
   * Checks if two field IDs are equivalent (match after normalizing format)
   * 
   * @param id1 First field ID to compare
   * @param id2 Second field ID to compare
   * @returns Whether the IDs are equivalent
   */
  areEquivalent: (id1: string, id2: string): boolean => {
    if (!id1 || !id2) return false;
    
    const normalizedId1 = transformFieldId.toContextFormat(id1);
    const normalizedId2 = transformFieldId.toContextFormat(id2);
    
    return normalizedId1 === normalizedId2;
  }
};

/**
 * Utility class for managing form entries
 * Handles adding, removing, and updating form entries while maintaining IDs and context
 */
export class FormEntryManager {
  /**
   * Get the path to the entries array for a section
   * 
   * @param sectionPath The path to the section
   * @returns The path to the entries array for the section
   */
  static getEntriesPath(sectionPath: string): string {
    // Special cases based on section path
    switch (sectionPath) {
      case 'namesInfo':
        return 'namesInfo.names';
      case 'residencyInfo':
        return 'residencyInfo.residences';
      case 'employmentInfo':
        return 'employmentInfo.employments';
      case 'relativesInfo':
        return 'relativesInfo.relatives';
      case 'schoolInfo':
        return 'schoolInfo.schools';
      case 'contactInfo':
        return 'contactInfo.contactPoints';
      default:
        // If it's a subsection path, extract and handle appropriately
        if (sectionPath.includes('.section')) {
          return sectionPath;
        }
        
        // For other cases, try to infer from section name
        const parts = sectionPath.split('.');
        const lastPart = parts[parts.length - 1];
        
        // If path already ends with 'entries', use as is
        if (lastPart === 'entries') {
          return sectionPath;
        }
        
        // If the section path itself is 'entries', return as is (already an entries path)
        if (sectionPath === 'entries') {
          return sectionPath;
        }
        
        // Try to infer entries path from section name
        if (lastPart.endsWith('s')) {
          return sectionPath; // Assume plural form is already the entries
        } else {
          // For subsection paths with pattern 'sectionXX_Y', append '.entries'
          if (/section\d+_\d+$/.test(lastPart)) {
            return `${sectionPath}.entries`;
          }
          
          // Add 'entries' to path
          return `${sectionPath}.entries`;
        }
    }
  }
  
  /**
   * Get the path to the "has" flag for a section (e.g., "hasNames")
   * This flag controls whether the section is active/enabled
   * 
   * @param sectionPath The path to the section
   * @returns The path to the "has" flag for the section, or undefined if not applicable
   */
  static getHasFlagPath(sectionPath: string): string | undefined {
    // Special cases based on section path
    switch (sectionPath) {
      case 'namesInfo':
        return 'namesInfo.hasNames';
      case 'residencyInfo':
        return 'residencyInfo.hasResidences';
      case 'employmentInfo':
        return 'employmentInfo.hasEmployments';
      case 'relativesInfo':
        return 'relativesInfo.hasRelatives';
      case 'foreignContacts':
        return 'foreignContacts.hasContacts';
      case 'schoolInfo':
        return 'schoolInfo.hasSchools';
      case 'contactInfo.contactPoints':
        return 'contactInfo.hasContactPoints';
      default:
        // If it's a subsection path, extract and handle appropriately
        if (sectionPath.includes('.section')) {
          // For subsection paths (e.g., 'citizenshipInfo.section9_1.entries')
          // Return corresponding hasFlag (e.g., 'citizenshipInfo.section9_1.hasEntries')
          const parts = sectionPath.split('.');
          
          // If path ends with 'entries', replace with 'hasEntries'
          if (parts[parts.length - 1] === 'entries') {
            parts[parts.length - 1] = 'hasEntries';
            return parts.join('.');
          }
          
          // Otherwise, add 'hasEntries' flag in the same context as the subsection
          if (parts.length >= 2) {
            return [...parts.slice(0, -1), 'hasEntries'].join('.');
          }
        }
        
        // Try to infer has flag from section name
        const parts = sectionPath.split('.');
        const lastPart = parts[parts.length - 1];
        
        if (lastPart.endsWith('s')) {
          // Remove trailing 's' and prepend 'has'
          const baseName = lastPart.substring(0, lastPart.length - 1);
          const capitalized = baseName.charAt(0).toUpperCase() + baseName.slice(1);
          const hasFlagName = `has${capitalized}s`;
          
          // Return full path with the has flag
          return [...parts.slice(0, -1), hasFlagName].join('.');
        } else {
          // For non-plural sections, try to infer
          return undefined;
        }
    }
  }
  
  /**
   * Check if a section is active based on its "has" flag
   * 
   * @param formData The form data containing the section
   * @param sectionPath The path to the section
   * @returns Whether the section is active
   */
  static isSectionActive(formData: any, sectionPath: string): boolean {
    const hasFlag = this.getHasFlagPath(sectionPath);
    
    if (!hasFlag) {
      // If there's no has flag, assume the section is always active
      return true;
    }
    
    // Get the value of the has flag
    const hasFlagValue = get(formData, hasFlag);
    
    // Check if the has flag is set to a truthy value
    return hasFlagValue === 'YES' || hasFlagValue === true;
  }
  
  /**
   * Get a list of all dynamically managed sections
   * These are sections with repeatable entries that need special handling
   * 
   * @returns Array of section paths for dynamically managed sections
   */
  static getDynamicSections(): string[] {
    return [
      'namesInfo',
      'residencyInfo',
      'employmentInfo',
      'relativesInfo',
      'foreignContacts',
      'schoolInfo',
      'contactInfo.contactPoints',
      'citizenshipInfo.section9_1.entries',
      'citizenshipInfo.section9_2.entries',
      'citizenshipInfo.section9_3.entries',
      'citizenshipInfo.section9_4.entries',
      'citizenshipInfo.section9_5.entries',
      'employmentInfo.section13_2.entries',
      'employmentInfo.section13_3.entries',
      'employmentInfo.section13_4.entries',
      'employmentInfo.section13_5.entries',
      'relativesInfo.section18_1.entries',
      'relativesInfo.section18_2.entries',
      'relativesInfo.section18_3.entries',
      'foreignContacts.section19_1.entries',
      'foreignContacts.section19_2.entries',
      'foreignContacts.section19_3.entries',
      'foreignContacts.section19_4.entries',
      'policeRecord.section22_1.entries',
      'policeRecord.section22_2.entries',
      'policeRecord.section22_3.entries',
      'policeRecord.section22_4.entries',
      'policeRecord.section22_5.entries',
      'policeRecord.section22_6.entries',
      'financialRecord.section26_2.entries',
      'financialRecord.section26_3.entries',
      'financialRecord.section26_6.entries',
      'financialRecord.section26_7.entries',
      'financialRecord.section26_8.entries',
      'financialRecord.section26_9.entries',
      'associationRecord.section29_2.entries',
      'associationRecord.section29_3.entries',
      'associationRecord.section29_4.entries',
      'associationRecord.section29_5.entries'
    ];
  }
  
  /**
   * Get a list of known subsection configurations
   * 
   * @returns Array of subsection configurations
   */
  static getSubsectionConfigs(): SubsectionConfig[] {
    return [
      // Citizenship subsections (Section 9)
      {
        parentSectionPath: 'citizenshipInfo',
        subsectionId: '9.1',
        entriesPath: 'citizenshipInfo.section9_1.entries',
        hasFlag: 'citizenshipInfo.section9_1.hasEntries'
      },
      {
        parentSectionPath: 'citizenshipInfo',
        subsectionId: '9.2',
        entriesPath: 'citizenshipInfo.section9_2.entries',
        hasFlag: 'citizenshipInfo.section9_2.hasEntries'
      },
      {
        parentSectionPath: 'citizenshipInfo',
        subsectionId: '9.3',
        entriesPath: 'citizenshipInfo.section9_3.entries',
        hasFlag: 'citizenshipInfo.section9_3.hasEntries'
      },
      {
        parentSectionPath: 'citizenshipInfo',
        subsectionId: '9.4',
        entriesPath: 'citizenshipInfo.section9_4.entries',
        hasFlag: 'citizenshipInfo.section9_4.hasEntries'
      },
      {
        parentSectionPath: 'citizenshipInfo',
        subsectionId: '9.5',
        entriesPath: 'citizenshipInfo.section9_5.entries',
        hasFlag: 'citizenshipInfo.section9_5.hasEntries'
      },
      
      // Dual citizenship subsections (Section 10)
      {
        parentSectionPath: 'dualCitizenshipInfo',
        subsectionId: '10.1',
        entriesPath: 'dualCitizenshipInfo.section10_1.entries',
        hasFlag: 'dualCitizenshipInfo.section10_1.hasEntries'
      },
      {
        parentSectionPath: 'dualCitizenshipInfo',
        subsectionId: '10.2',
        entriesPath: 'dualCitizenshipInfo.section10_2.entries',
        hasFlag: 'dualCitizenshipInfo.section10_2.hasEntries'
      },
      
      // Employment subsections (Section 13)
      {
        parentSectionPath: 'employmentInfo',
        subsectionId: '13.2',
        entriesPath: 'employmentInfo.section13_2.entries',
        hasFlag: 'employmentInfo.section13_2.hasEntries'
      },
      {
        parentSectionPath: 'employmentInfo',
        subsectionId: '13.3',
        entriesPath: 'employmentInfo.section13_3.entries',
        hasFlag: 'employmentInfo.section13_3.hasEntries'
      },
      {
        parentSectionPath: 'employmentInfo',
        subsectionId: '13.4',
        entriesPath: 'employmentInfo.section13_4.entries',
        hasFlag: 'employmentInfo.section13_4.hasEntries'
      },
      {
        parentSectionPath: 'employmentInfo',
        subsectionId: '13.5',
        entriesPath: 'employmentInfo.section13_5.entries',
        hasFlag: 'employmentInfo.section13_5.hasEntries'
      },
      
      // Relatives subsections (Section 18)
      {
        parentSectionPath: 'relativesInfo',
        subsectionId: '18.1',
        entriesPath: 'relativesInfo.section18_1.entries',
        hasFlag: 'relativesInfo.section18_1.hasEntries'
      },
      {
        parentSectionPath: 'relativesInfo',
        subsectionId: '18.2',
        entriesPath: 'relativesInfo.section18_2.entries',
        hasFlag: 'relativesInfo.section18_2.hasEntries'
      },
      {
        parentSectionPath: 'relativesInfo',
        subsectionId: '18.3',
        entriesPath: 'relativesInfo.section18_3.entries',
        hasFlag: 'relativesInfo.section18_3.hasEntries'
      },
      
      // Foreign contacts subsections (Section 19)
      {
        parentSectionPath: 'foreignContacts',
        subsectionId: '19.1',
        entriesPath: 'foreignContacts.section19_1.entries',
        hasFlag: 'foreignContacts.section19_1.hasEntries'
      },
      {
        parentSectionPath: 'foreignContacts',
        subsectionId: '19.2',
        entriesPath: 'foreignContacts.section19_2.entries',
        hasFlag: 'foreignContacts.section19_2.hasEntries'
      },
      {
        parentSectionPath: 'foreignContacts',
        subsectionId: '19.3',
        entriesPath: 'foreignContacts.section19_3.entries',
        hasFlag: 'foreignContacts.section19_3.hasEntries'
      },
      {
        parentSectionPath: 'foreignContacts',
        subsectionId: '19.4',
        entriesPath: 'foreignContacts.section19_4.entries',
        hasFlag: 'foreignContacts.section19_4.hasEntries'
      },
      
      // Police record subsections (Section 22)
      {
        parentSectionPath: 'policeRecord',
        subsectionId: '22.1',
        entriesPath: 'policeRecord.section22_1.entries',
        hasFlag: 'policeRecord.section22_1.hasEntries'
      },
      {
        parentSectionPath: 'policeRecord',
        subsectionId: '22.2',
        entriesPath: 'policeRecord.section22_2.entries',
        hasFlag: 'policeRecord.section22_2.hasEntries'
      },
      {
        parentSectionPath: 'policeRecord',
        subsectionId: '22.3',
        entriesPath: 'policeRecord.section22_3.entries',
        hasFlag: 'policeRecord.section22_3.hasEntries'
      },
      {
        parentSectionPath: 'policeRecord',
        subsectionId: '22.4',
        entriesPath: 'policeRecord.section22_4.entries',
        hasFlag: 'policeRecord.section22_4.hasEntries'
      },
      {
        parentSectionPath: 'policeRecord',
        subsectionId: '22.5',
        entriesPath: 'policeRecord.section22_5.entries',
        hasFlag: 'policeRecord.section22_5.hasEntries'
      },
      {
        parentSectionPath: 'policeRecord',
        subsectionId: '22.6',
        entriesPath: 'policeRecord.section22_6.entries',
        hasFlag: 'policeRecord.section22_6.hasEntries'
      },
      
      // Financial record subsections (Section 26)
      {
        parentSectionPath: 'financialRecord',
        subsectionId: '26.2',
        entriesPath: 'financialRecord.section26_2.entries',
        hasFlag: 'financialRecord.section26_2.hasEntries'
      },
      {
        parentSectionPath: 'financialRecord',
        subsectionId: '26.3',
        entriesPath: 'financialRecord.section26_3.entries',
        hasFlag: 'financialRecord.section26_3.hasEntries'
      },
      {
        parentSectionPath: 'financialRecord',
        subsectionId: '26.6',
        entriesPath: 'financialRecord.section26_6.entries',
        hasFlag: 'financialRecord.section26_6.hasEntries'
      },
      {
        parentSectionPath: 'financialRecord',
        subsectionId: '26.7',
        entriesPath: 'financialRecord.section26_7.entries',
        hasFlag: 'financialRecord.section26_7.hasEntries'
      },
      {
        parentSectionPath: 'financialRecord',
        subsectionId: '26.8',
        entriesPath: 'financialRecord.section26_8.entries',
        hasFlag: 'financialRecord.section26_8.hasEntries'
      },
      {
        parentSectionPath: 'financialRecord',
        subsectionId: '26.9',
        entriesPath: 'financialRecord.section26_9.entries',
        hasFlag: 'financialRecord.section26_9.hasEntries'
      },
      
      // Association record subsections (Section 29)
      {
        parentSectionPath: 'associationRecord',
        subsectionId: '29.2',
        entriesPath: 'associationRecord.section29_2.entries',
        hasFlag: 'associationRecord.section29_2.hasEntries'
      },
      {
        parentSectionPath: 'associationRecord',
        subsectionId: '29.3',
        entriesPath: 'associationRecord.section29_3.entries',
        hasFlag: 'associationRecord.section29_3.hasEntries'
      },
      {
        parentSectionPath: 'associationRecord',
        subsectionId: '29.4',
        entriesPath: 'associationRecord.section29_4.entries',
        hasFlag: 'associationRecord.section29_4.hasEntries'
      },
      {
        parentSectionPath: 'associationRecord',
        subsectionId: '29.5',
        entriesPath: 'associationRecord.section29_5.entries',
        hasFlag: 'associationRecord.section29_5.hasEntries'
      }
    ];
  }
  
  /**
   * Extract subsection information from a section path
   * 
   * @param sectionPath The path to check for subsection indicators
   * @returns Subsection info object or null if not a subsection path
   */
  static extractSubsectionInfo(sectionPath: string): SubsectionInfo | null {
    // Check for patterns like 'citizenshipInfo.section9_1'
    const match = sectionPath.match(/\.section(\d+)_(\d+)/);
    if (match) {
      return {
        section: parseInt(match[1]),
        subsection: parseInt(match[2])
      };
    }
    
    // Check for direct subsection references like '9.1'
    const directMatch = sectionPath.match(/^(\d+)\.(\d+)$/);
    if (directMatch) {
      return {
        section: parseInt(directMatch[1]),
        subsection: parseInt(directMatch[2])
      };
    }
    
    return null;
  }
  
  /**
   * Get the entries path for a specific subsection
   * 
   * @param parentSectionPath The path to the parent section
   * @param subsectionId The subsection identifier (e.g., '9.1')
   * @returns The path to the entries array for the subsection
   */
  static getSubsectionEntriesPath(parentSectionPath: string, subsectionId: string): string {
    const [sectionNum, subsectionNum] = subsectionId.split('.').map(Number);
    return `${parentSectionPath}.section${sectionNum}_${subsectionNum}.entries`;
  }
  
  /**
   * Get the "has" flag path for a specific subsection
   * 
   * @param parentSectionPath The path to the parent section
   * @param subsectionId The subsection identifier (e.g., '9.1')
   * @returns The path to the "has" flag for the subsection
   */
  static getSubsectionHasFlagPath(parentSectionPath: string, subsectionId: string): string {
    const [sectionNum, subsectionNum] = subsectionId.split('.').map(Number);
    return `${parentSectionPath}.section${sectionNum}_${subsectionNum}.hasEntries`;
  }
  
  /**
   * Get the default base ID for a field in a specific subsection
   * Used for determining field IDs in dynamic entries
   * 
   * @param parentSectionPath The path to the parent section
   * @param subsectionId The subsection identifier (e.g., '9.1')
   * @returns The default base ID for fields in this subsection
   */
  static getSubsectionBaseId(parentSectionPath: string, subsectionId: string): string {
    const [sectionNum, subsectionNum] = subsectionId.split('.').map(Number);
    
    // Define base IDs for known subsections
    const knownBaseIds: Record<string, string> = {
      '9.1': '9100',
      '9.2': '9200',
      '9.3': '9300',
      '9.4': '9400',
      '9.5': '9500',
      '10.1': '10100',
      '10.2': '10200',
      '13.2': '13200',
      '13.3': '13300',
      '13.4': '13400',
      '13.5': '13500',
      '18.1': '18100',
      '18.2': '18200',
      '18.3': '18300',
      '19.1': '19100',
      '19.2': '19200',
      '19.3': '19300',
      '19.4': '19400',
      '22.1': '22100',
      '22.2': '22200',
      '22.3': '22300',
      '22.4': '22400',
      '22.5': '22500',
      '22.6': '22600',
      '26.2': '26200',
      '26.3': '26300',
      '26.6': '26600',
      '26.7': '26700',
      '26.8': '26800',
      '26.9': '26900',
      '29.2': '29200',
      '29.3': '29300',
      '29.4': '29400',
      '29.5': '29500'
    };
    
    // Return known base ID if available
    if (knownBaseIds[subsectionId]) {
      return knownBaseIds[subsectionId];
    }
    
    // Generate a default base ID based on section and subsection numbers
    return `${sectionNum}${subsectionNum}00`;
  }
  
  /**
   * Process field IDs within a subsection entry
   * Ensures correct field IDs are generated for the entry's position
   * 
   * @param entry The entry object to process
   * @param index The index of the entry
   * @param parentSectionPath The path to the parent section
   * @param subsectionId The subsection identifier
   * @returns A clone of the entry with updated field IDs
   */
  static processSubsectionEntryFieldIds(
    entry: any, 
    index: number, 
    parentSectionPath: string, 
    subsectionId: string
  ): any {
    if (!entry || typeof entry !== 'object') {
      return entry;
    }
    
    // Create a clone to avoid modifying the original
    const processedEntry = cloneDeep(entry);
    
    // Get entries path for this subsection
    const entriesPath = this.getSubsectionEntriesPath(parentSectionPath, subsectionId);
    
    // Process field IDs recursively
    const processObject = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      // Process each property
      for (const key in obj) {
        const value = obj[key];
        
        // Skip _id property as it's used for entry tracking
        if (key === '_id') continue;
        
        if (value && typeof value === 'object') {
          // Special case for field objects with 'id' and 'value' properties
          if ('id' in value && 'value' in value) {
            // This is a field object, update its ID
            const baseId = value.id;
            
            // Generate new ID with subsection context
            try {
              // Extract section and subsection numbers
              const [sectionNum, subsectionNum] = subsectionId.split('.').map(Number);
              
              // Strip suffix from baseId if present
              const cleanId = stripIdSuffix(baseId);
              
              // Generate new field ID
              if (index === 0) {
                // First entry keeps original ID
                value.id = cleanId;
              } else {
                // Calculate offset based on subsection pattern
                let offset: number;
                
                switch (`${sectionNum}.${subsectionNum}`) {
                  case '9.1': // Citizenship - Born Abroad
                  case '9.2': // Citizenship - Naturalized
                  case '9.3': // Citizenship - Derived
                  case '9.4': // Citizenship - Non-Citizen
                  case '9.5': // Citizenship - Other
                    offset = -(7 * index);
                    break;
                    
                  case '10.1': // Dual citizenship - Current
                  case '10.2': // Dual citizenship - Previous
                    offset = -(6 * index);
                    break;
                    
                  case '13.2': // Employment - Contractor
                  case '13.3': // Employment - Self-Employment
                  case '13.4': // Employment - Unemployment
                  case '13.5': // Employment - Other
                    offset = -(8 * index);
                    break;
                    
                  case '18.1': // Relatives - Immediate Family
                  case '18.2': // Relatives - Extended Family
                  case '18.3': // Relatives - Other
                    offset = -(10 * index);
                    break;
                    
                  case '19.1': // Foreign Contacts - Close Associates
                  case '19.2': // Foreign Contacts - Business
                  case '19.3': // Foreign Contacts - Government
                  case '19.4': // Foreign Contacts - Other
                    offset = -(9 * index);
                    break;
                    
                  case '22.1': // Police Record - Arrests
                  case '22.2': // Police Record - Charges
                  case '22.3': // Police Record - Convictions
                  case '22.4': // Police Record - Domestic Violence
                  case '22.5': // Police Record - Court Orders
                  case '22.6': // Police Record - Other
                    offset = -(7 * index);
                    break;
                    
                  case '26.2': // Financial Record - Bankruptcy
                  case '26.3': // Financial Record - Tax Liens
                  case '26.6': // Financial Record - Delinquent Debts
                  case '26.7': // Financial Record - Gambling Debts
                  case '26.8': // Financial Record - Failure to File Taxes
                  case '26.9': // Financial Record - Financial Problems
                    offset = -(8 * index);
                    break;
                    
                  case '29.2': // Association Record - Terrorist Organizations
                  case '29.3': // Association Record - Criminal Organizations
                  case '29.4': // Association Record - Extremist Organizations
                  case '29.5': // Association Record - Other Organizations
                    offset = -(6 * index);
                    break;
                    
                  default:
                    // Default offset
                    offset = -(5 * index);
                }
                
                // Apply offset to base ID
                const numericId = parseInt(cleanId, 10);
                if (!isNaN(numericId)) {
                  value.id = (numericId + offset).toString();
                } else {
                  // Fallback for non-numeric IDs
                  value.id = `${cleanId}_${index}`;
                }
              }
            } catch (error) {
              console.error(`Error generating ID for subsection ${subsectionId} entry ${index}:`, error);
              // Fallback approach
              value.id = `${baseId}_sub${subsectionId}_${index}`;
            }
          } else {
            // Recursively process nested objects
            processObject(value);
          }
        }
      }
    };
    
    // Start processing from the root object
    processObject(processedEntry);
    
    // Ensure the entry has subsection info
    if (!processedEntry.subsectionInfo) {
      processedEntry.subsectionInfo = {
        section: parseInt(subsectionId.split('.')[0]),
        subsection: parseInt(subsectionId.split('.')[1])
      };
    }
    
    return processedEntry;
  }
  
  /**
   * Check if a section path refers to a subsection
   * 
   * @param sectionPath The section path to check
   * @returns Whether the path refers to a subsection
   */
  static isSubsectionPath(sectionPath: string): boolean {
    // Check for patterns like 'citizenshipInfo.section9_1'
    if (sectionPath.match(/\.section\d+_\d+/)) {
      return true;
    }
    
    // Check for direct subsection references like '9.1'
    if (sectionPath.match(/^\d+\.\d+$/)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Generate field ID for a subsection field
   * 
   * @param baseId The base field ID
   * @param index The entry index
   * @param subsectionId The subsection identifier (e.g., '9.1')
   * @returns The generated field ID
   */
  static generateSubsectionFieldId(baseId: string, index: number, subsectionId: string): string {
    if (index === 0) {
      // First entry uses the base ID
      return stripIdSuffix(baseId);
    }
    
    // Extract section and subsection numbers
    const [sectionNum, subsectionNum] = subsectionId.split('.').map(Number);
    
    // Strip suffix from baseId if present
    const cleanId = stripIdSuffix(baseId);
    
    // Calculate offset based on subsection pattern
    let offset: number;
    
    switch (`${sectionNum}.${subsectionNum}`) {
      case '9.1': // Citizenship - Born Abroad
      case '9.2': // Citizenship - Naturalized
      case '9.3': // Citizenship - Derived
      case '9.4': // Citizenship - Non-Citizen
      case '9.5': // Citizenship - Other
        offset = -(7 * index);
        break;
        
      case '10.1': // Dual citizenship - Current
      case '10.2': // Dual citizenship - Previous
        offset = -(6 * index);
        break;
        
      case '13.2': // Employment - Contractor
      case '13.3': // Employment - Self-Employment
      case '13.4': // Employment - Unemployment
      case '13.5': // Employment - Other
        offset = -(8 * index);
        break;
        
      case '18.1': // Relatives - Immediate Family
      case '18.2': // Relatives - Extended Family
      case '18.3': // Relatives - Other
        offset = -(10 * index);
        break;
        
      case '19.1': // Foreign Contacts - Close Associates
      case '19.2': // Foreign Contacts - Business
      case '19.3': // Foreign Contacts - Government
      case '19.4': // Foreign Contacts - Other
        offset = -(9 * index);
        break;
        
      case '22.1': // Police Record - Arrests
      case '22.2': // Police Record - Charges
      case '22.3': // Police Record - Convictions
      case '22.4': // Police Record - Domestic Violence
      case '22.5': // Police Record - Court Orders
      case '22.6': // Police Record - Other
        offset = -(7 * index);
        break;
        
      case '26.2': // Financial Record - Bankruptcy
      case '26.3': // Financial Record - Tax Liens
      case '26.6': // Financial Record - Delinquent Debts
      case '26.7': // Financial Record - Gambling Debts
      case '26.8': // Financial Record - Failure to File Taxes
      case '26.9': // Financial Record - Financial Problems
        offset = -(8 * index);
        break;
        
      case '29.2': // Association Record - Terrorist Organizations
      case '29.3': // Association Record - Criminal Organizations
      case '29.4': // Association Record - Extremist Organizations
      case '29.5': // Association Record - Other Organizations
        offset = -(6 * index);
        break;
        
      default:
        // Default offset
        offset = -(5 * index);
    }
    
    // Apply offset to base ID
    const numericId = parseInt(cleanId, 10);
    if (!isNaN(numericId)) {
      return (numericId + offset).toString();
    } else {
      // Fallback for non-numeric IDs
      return `${cleanId}_${index}`;
    }
  }
  
  /**
   * Get the parent section from a subsection path
   * 
   * @param subsectionPath The subsection path
   * @returns The parent section path
   */
  static getParentSectionFromSubsectionPath(subsectionPath: string): string {
    // Handle paths like 'citizenshipInfo.section9_1.entries'
    const match = subsectionPath.match(/^(.+)\.section\d+_\d+\..+$/);
    if (match) {
      return match[1];
    }
    
    // For direct subsection IDs like '9.1', return null
    return '';
  }
  
  // ... rest of the static methods

  // ... methods from the old code
}

// Define the constraints for each section
interface SectionConstraints {
  // Maximum number of entries allowed (undefined for unlimited)
  maxEntries?: number;
  
  // Whether to prevent removing the last entry when section is active
  preventRemovingLastEntry?: boolean;
  
  // Whether to reset the last entry (keeping its ID) instead of removing it
  resetLastEntryInsteadOfRemoving?: boolean;
  
  // Function to reset an entry's values while preserving its structure and IDs
  resetEntry?: (entry: any) => void;
  
  // Function to validate entries before updating
  validateBeforeUpdate?: (entries: any[]) => boolean;
  
  // Function to validate when activating a section
  validateOnActivation?: (entries: any[]) => boolean;
  
  // Function to initialize a new entry with section-specific defaults
  initializeNewEntry?: (entry: any, currentEntries: any[]) => any;
  
  // Function to call when a section is deactivated
  onDeactivate?: (sectionPath: string, entries: any[]) => void;
  
  // Function to call after an entry is removed
  onEntryRemoved?: (sectionPath: string, index: number, remainingEntries: any[]) => void;
}

export default FormEntryManager; 