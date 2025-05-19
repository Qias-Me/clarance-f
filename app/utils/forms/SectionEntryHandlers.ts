/**
 * SectionEntryHandlers.ts
 * 
 * This utility provides specialized handlers for section-specific entry behavior
 * in the form, accommodating unique requirements for different form sections.
 */

import { FormEntryManager } from './FormEntryManager';
import { EntryKeyManager } from './EntryKeyManager';

// Type definitions
type FormData = Record<string, any>;
type EntryHandler = {
  getEntriesPath: (sectionPath: string) => string;
  getHasFlagPath: (sectionPath: string) => string | null;
  maxEntries: number | null;
  minEntries: number;
  requireAtLeastOne: boolean;
  getEntryValidator?: (sectionPath: string, formData: FormData) => (entry: any) => boolean;
  getEntryTemplate?: (sectionPath: string, formData: FormData, index: number) => any;
  onEntryAdded?: (sectionPath: string, formData: FormData, newEntry: any, index: number) => void;
  onEntryRemoved?: (sectionPath: string, formData: FormData, removedEntry: any, index: number) => void;
};

// Registry of section-specific handlers
const sectionHandlers: Record<string, EntryHandler> = {
  // Names section (Section 5)
  namesInfo: {
    getEntriesPath: () => 'namesInfo.names',
    getHasFlagPath: () => 'namesInfo.hasNames.value',
    maxEntries: 4, // Maximum of 4 alternative names allowed
    minEntries: 1, // At least one name when section is active
    requireAtLeastOne: true,
    getEntryValidator: () => (entry: any) => {
      // A valid name entry should have at least first or last name
      return !!(
        entry &&
        ((entry.firstName?.value && entry.firstName.value.trim()) ||
         (entry.lastName?.value && entry.lastName.value.trim()))
      );
    },
    onEntryAdded: (sectionPath, formData, newEntry) => {
      // When a name is added, ensure proper initialization
      if (newEntry.endDate?.isPresent?.value === 'YES') {
        // If "Present" is checked, set the date value to "Present"
        newEntry.endDate.date.value = 'Present';
      }
    }
  },
  
  // Relatives section (Section 17)
  relativesInfo: {
    getEntriesPath: () => 'relativesInfo.relatives',
    getHasFlagPath: () => 'relativesInfo.hasRelatives.value',
    maxEntries: null, // No fixed maximum
    minEntries: 1, // At least one relative when active
    requireAtLeastOne: true,
    getEntryValidator: () => (entry: any) => {
      // A valid relative should have a name and relationship
      return !!(
        entry &&
        entry.lastName?.value &&
        entry.firstName?.value &&
        entry.relationship?.value
      );
    }
  },
  
  // Foreign contacts section (Section 18)
  foreignContacts: {
    getEntriesPath: () => 'foreignContacts.contacts',
    getHasFlagPath: () => 'foreignContacts.hasContacts.value',
    maxEntries: null, // No fixed maximum
    minEntries: 1,
    requireAtLeastOne: true
  },
  
  // Employment history section (Section 12)
  employmentInfo: {
    getEntriesPath: () => 'employmentInfo',
    getHasFlagPath: () => null, // No "has" flag for employment - always required
    maxEntries: null, // No fixed maximum
    minEntries: 1, // At least one employment entry is required
    requireAtLeastOne: true,
    getEntryValidator: () => (entry: any) => {
      // A valid employment entry needs basic employment info
      return !!(
        entry &&
        entry.section13A &&
        entry.section13A[0]?.employmentActivity?.value
      );
    }
  },
  
  // Residency history section (Section 10)
  'residencyInfo.entries': {
    getEntriesPath: () => 'residencyInfo.entries',
    getHasFlagPath: () => null, // Always required
    maxEntries: null,
    minEntries: 1,
    requireAtLeastOne: true
  },
  
  // Contact numbers section (Section 6)
  'contactInfo.contactNumbers': {
    getEntriesPath: () => 'contactInfo.contactNumbers',
    getHasFlagPath: () => null, // Always required
    maxEntries: null,
    minEntries: 1, // At least one contact number required
    requireAtLeastOne: true,
    getEntryValidator: () => (entry: any) => {
      // Valid contact requires a number and type
      return !!(
        entry &&
        entry.number?.value &&
        entry.type?.value
      );
    }
  },
  
  // School entries (Section 11)
  'schoolInfo.entries': {
    getEntriesPath: () => 'schoolInfo.entries',
    getHasFlagPath: () => null, // Always required
    maxEntries: null,
    minEntries: 1,
    requireAtLeastOne: true
  }
};

/**
 * Get the appropriate handler for a specific section
 * 
 * @param sectionPath The path to the section
 * @returns The section-specific handler or a default handler
 */
export const getSectionHandler = (sectionPath: string): EntryHandler => {
  // If there's a direct match in the registry, return that handler
  if (sectionPath in sectionHandlers) {
    return sectionHandlers[sectionPath];
  }
  
  // For path segments like "section.subsection", try to match just the section
  const basePath = sectionPath.split('.')[0];
  if (basePath in sectionHandlers) {
    return sectionHandlers[basePath];
  }
  
  // Return a default handler
  return {
    getEntriesPath: (path) => FormEntryManager.getEntriesPath(path),
    getHasFlagPath: (path) => FormEntryManager.getHasFlagPath(path),
    maxEntries: null,
    minEntries: 0,
    requireAtLeastOne: false
  };
};

/**
 * Get the maximum number of entries allowed for a section
 * 
 * @param sectionPath The path to the section
 * @returns The maximum number of entries or null for unlimited
 */
export const getMaxEntries = (sectionPath: string): number | null => {
  const handler = getSectionHandler(sectionPath);
  return handler.maxEntries;
};

/**
 * Check if a section requires at least one entry when active
 * 
 * @param sectionPath The path to the section
 * @returns Whether at least one entry is required
 */
export const requiresAtLeastOneEntry = (sectionPath: string): boolean => {
  const handler = getSectionHandler(sectionPath);
  return handler.requireAtLeastOne;
};

/**
 * Get the correct path for a section's entries
 * 
 * @param sectionPath The path to the section
 * @returns The path to the entries array
 */
export const getEntriesPath = (sectionPath: string): string => {
  const handler = getSectionHandler(sectionPath);
  return handler.getEntriesPath(sectionPath);
};

/**
 * Get the path to a section's "has" flag
 * 
 * @param sectionPath The path to the section
 * @returns The path to the "has" flag or null if not applicable
 */
export const getHasFlagPath = (sectionPath: string): string | null => {
  const handler = getSectionHandler(sectionPath);
  return handler.getHasFlagPath(sectionPath);
};

/**
 * Get a validator function for entries in a section
 * 
 * @param sectionPath The path to the section
 * @param formData The current form data
 * @returns A function that validates an entry
 */
export const getEntryValidator = (
  sectionPath: string,
  formData: FormData
): ((entry: any) => boolean) => {
  const handler = getSectionHandler(sectionPath);
  
  // Use the handler's validator if available
  if (handler.getEntryValidator) {
    return handler.getEntryValidator(sectionPath, formData);
  }
  
  // Default validator - any non-empty object is valid
  return (entry: any) => !!entry && typeof entry === 'object';
};

/**
 * Process entry after adding to apply section-specific logic
 * 
 * @param sectionPath The path to the section
 * @param formData The current form data
 * @param newEntry The newly added entry
 * @param index The index of the new entry
 */
export const processAddedEntry = (
  sectionPath: string,
  formData: FormData,
  newEntry: any,
  index: number
): void => {
  const handler = getSectionHandler(sectionPath);
  
  // Call the handler's onEntryAdded function if available
  if (handler.onEntryAdded) {
    handler.onEntryAdded(sectionPath, formData, newEntry, index);
  }
};

/**
 * Process entry before removing to apply section-specific logic
 * 
 * @param sectionPath The path to the section
 * @param formData The current form data
 * @param entryToRemove The entry being removed
 * @param index The index of the entry being removed
 */
export const processRemovedEntry = (
  sectionPath: string,
  formData: FormData,
  entryToRemove: any,
  index: number
): void => {
  const handler = getSectionHandler(sectionPath);
  
  // Call the handler's onEntryRemoved function if available
  if (handler.onEntryRemoved) {
    handler.onEntryRemoved(sectionPath, formData, entryToRemove, index);
  }
};

/**
 * Check if an entry can be removed based on section rules
 * 
 * @param sectionPath The path to the section
 * @param formData The current form data
 * @param index The index of the entry to remove
 * @returns Whether the entry can be removed
 */
export const canRemoveEntry = (
  sectionPath: string,
  formData: FormData,
  index: number
): boolean => {
  const handler = getSectionHandler(sectionPath);
  const entriesPath = handler.getEntriesPath(sectionPath);
  
  // Get the current entries
  const entries = formData[entriesPath] || [];
  
  // If this is the last entry and the section requires at least one, prevent removal
  if (
    entries.length <= handler.minEntries &&
    handler.requireAtLeastOne
  ) {
    // Check if the section is active
    const hasFlagPath = handler.getHasFlagPath(sectionPath);
    if (!hasFlagPath || formData[hasFlagPath] === 'YES') {
      // Section is active and requires at least one entry
      return false;
    }
  }
  
  return true;
};

// Export a combined object for convenience
export const SectionEntryHandlers = {
  getSectionHandler,
  getMaxEntries,
  requiresAtLeastOneEntry,
  getEntriesPath,
  getHasFlagPath,
  getEntryValidator,
  processAddedEntry,
  processRemovedEntry,
  canRemoveEntry
};

 