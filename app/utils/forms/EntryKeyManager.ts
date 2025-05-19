/**
 * EntryKeyManager.ts
 * 
 * This utility provides functions for managing unique keys for dynamic entries
 * in form sections, ensuring that keys remain stable across operations.
 */

// Interface for objects with _id property
interface ObjectWithId {
  _id?: number | string;
  [key: string]: any;
}

/**
 * Generates a unique numeric ID not currently in use in the given array
 * 
 * @param entries Array of objects that may have _id properties
 * @returns A unique numeric ID
 */
export const generateUniqueId = (entries: ObjectWithId[]): number => {
  // If there are no entries, start with ID 1
  if (!entries || entries.length === 0) {
    return 1;
  }
  
  // Get all existing numeric IDs
  const existingIds = entries
    .map(entry => entry._id)
    .filter(id => id !== undefined && !isNaN(Number(id)))
    .map(id => Number(id));
  
  // If there are no existing IDs, start with ID 1
  if (existingIds.length === 0) {
    return 1;
  }
  
  // Find the maximum ID and add 1
  const maxId = Math.max(...existingIds);
  return maxId + 1;
};

/**
 * Ensures every entry in the array has a unique _id property
 * 
 * @param entries Array of objects that should have _id properties
 * @returns Array with guaranteed unique _id properties
 */
export const ensureUniqueIds = (entries: ObjectWithId[]): ObjectWithId[] => {
  if (!entries || !Array.isArray(entries)) {
    return [];
  }
  
  // Make a deep copy to avoid modifying the original
  const entriesCopy = JSON.parse(JSON.stringify(entries)) as ObjectWithId[];
  
  // Track assigned IDs to ensure uniqueness
  const assignedIds = new Set<number | string>();
  
  // Process each entry
  return entriesCopy.map(entry => {
    // If it already has a unique ID, use it
    if (entry._id !== undefined && !assignedIds.has(entry._id)) {
      assignedIds.add(entry._id);
      return entry;
    }
    
    // Otherwise, generate a new unique ID
    const newId = generateUniqueId(entriesCopy);
    assignedIds.add(newId);
    return { ...entry, _id: newId };
  });
};

/**
 * Finds an entry by its _id in an array
 * 
 * @param entries Array of objects with _id properties
 * @param id The _id to search for
 * @returns The matching entry or undefined if not found
 */
export const findEntryById = (
  entries: ObjectWithId[],
  id: number | string
): ObjectWithId | undefined => {
  if (!entries || !Array.isArray(entries)) {
    return undefined;
  }
  
  return entries.find(entry => entry._id === id);
};

/**
 * Converts an array index to the corresponding _id value
 * 
 * @param entries Array of objects with _id properties
 * @param index The array index
 * @returns The _id at the given index or undefined if not found
 */
export const indexToId = (
  entries: ObjectWithId[],
  index: number
): number | string | undefined => {
  if (!entries || !Array.isArray(entries) || index < 0 || index >= entries.length) {
    return undefined;
  }
  
  return entries[index]._id;
};

/**
 * Converts an _id to the corresponding array index
 * 
 * @param entries Array of objects with _id properties
 * @param id The _id to find
 * @returns The array index of the entry with the given _id, or -1 if not found
 */
export const idToIndex = (
  entries: ObjectWithId[],
  id: number | string
): number => {
  if (!entries || !Array.isArray(entries)) {
    return -1;
  }
  
  return entries.findIndex(entry => entry._id === id);
};

/**
 * Creates a mapping function to convert between array indices and _id values
 * 
 * @param entries Array of objects with _id properties
 * @returns Object with mapping functions
 */
export const createIndexIdMapper = (entries: ObjectWithId[]) => {
  return {
    indexToId: (index: number) => indexToId(entries, index),
    idToIndex: (id: number | string) => idToIndex(entries, id),
    findById: (id: number | string) => findEntryById(entries, id)
  };
};

/**
 * Gets the next available _id for a new entry
 * 
 * @param entries Array of existing entries with _id properties
 * @param preferredIds Optional array of preferred IDs to use if available
 * @returns The next _id to use for a new entry
 */
export const getNextAvailableId = (
  entries: ObjectWithId[],
  preferredIds?: (number | string)[]
): number | string => {
  // If there are preferred IDs, try to use one that's not already in the entries
  if (preferredIds && preferredIds.length > 0) {
    const existingIds = new Set(entries.map(entry => entry._id));
    
    for (const id of preferredIds) {
      if (!existingIds.has(id)) {
        return id;
      }
    }
  }
  
  // Otherwise, generate a new unique ID
  return generateUniqueId(entries);
};

/**
 * Adds an entry with a guaranteed unique _id
 * 
 * @param entries Array of existing entries
 * @param newEntry The new entry to add (will have _id property set or updated)
 * @returns Updated array including the new entry with unique _id
 */
export const addEntryWithUniqueId = (
  entries: ObjectWithId[],
  newEntry: ObjectWithId
): ObjectWithId[] => {
  if (!entries || !Array.isArray(entries)) {
    return [{ ...newEntry, _id: 1 }];
  }
  
  const entriesCopy = [...entries];
  const entryToAdd = { ...newEntry };
  
  // Ensure new entry has a unique ID
  if (entryToAdd._id === undefined) {
    entryToAdd._id = generateUniqueId(entriesCopy);
  } else {
    // Check if ID is already in use
    const idExists = entriesCopy.some(entry => entry._id === entryToAdd._id);
    if (idExists) {
      entryToAdd._id = generateUniqueId(entriesCopy);
    }
  }
  
  // Add the entry and return the updated array
  return [...entriesCopy, entryToAdd];
};

/**
 * Preserves the _id properties when replacing entries
 * 
 * @param oldEntries Previous array of entries
 * @param newEntries New array of entries (potentially without _id values)
 * @returns Updated array with _id values preserved where possible
 */
export const preserveIdsOnUpdate = (
  oldEntries: ObjectWithId[],
  newEntries: ObjectWithId[]
): ObjectWithId[] => {
  if (!newEntries || !Array.isArray(newEntries)) {
    return [];
  }
  
  if (!oldEntries || !Array.isArray(oldEntries) || oldEntries.length === 0) {
    return ensureUniqueIds(newEntries);
  }
  
  // Transfer IDs from old entries to new entries where possible
  return newEntries.map((entry, index) => {
    // If the new entry already has an ID, keep it (ensure uniqueness later)
    if (entry._id !== undefined) {
      return entry;
    }
    
    // Try to use the ID from the corresponding old entry
    if (index < oldEntries.length && oldEntries[index]._id !== undefined) {
      return { ...entry, _id: oldEntries[index]._id };
    }
    
    // Otherwise, leave without ID (will be assigned in ensureUniqueIds)
    return entry;
  });
};

// Export all functions as a named object for convenience
export const EntryKeyManager = {
  generateUniqueId,
  ensureUniqueIds,
  findEntryById,
  indexToId,
  idToIndex,
  createIndexIdMapper,
  getNextAvailableId,
  addEntryWithUniqueId,
  preserveIdsOnUpdate
};

export default EntryKeyManager; 