/**
 * IndexedDB Service for Form Data Persistence
 * 
 * This service provides functions for storing, retrieving, and managing form data
 * using IndexedDB for persistence across browser sessions.
 */

// Database configuration
const DB_NAME = 'ClaranceFormDB';
const DB_VERSION = 1;
const FORM_STORE = 'formData';
const META_STORE = 'metaData';

// Error handling helper
const handleError = (error: any): void => {
  console.error('IndexedDB operation failed:', error);
};

/**
 * Opens a connection to the IndexedDB database
 * Returns a promise that resolves to the database instance
 */
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Handle database upgrades/creation
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(FORM_STORE)) {
        // Store for form section data with sectionKey as key
        db.createObjectStore(FORM_STORE, { keyPath: 'sectionKey' });
      }
      
      if (!db.objectStoreNames.contains(META_STORE)) {
        // Store for metadata and user settings
        const metaStore = db.createObjectStore(META_STORE, { keyPath: 'key' });
        
        // Add version info record
        const versionInfo = {
          key: 'version',
          value: DB_VERSION,
          timestamp: new Date().toISOString()
        };
        metaStore.add(versionInfo);
      }
    };

    // Handle connection success
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    // Handle connection errors
    request.onerror = (event) => {
      reject(new Error('Failed to open IndexedDB: ' + (event.target as IDBOpenDBRequest).error));
    };
  });
};

/**
 * Saves a form section's data to IndexedDB
 */
export const saveFormSection = async (sectionKey: string, data: any): Promise<boolean> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FORM_STORE, 'readwrite');
      const store = transaction.objectStore(FORM_STORE);
      
      // Format the data object with metadata
      const recordData = {
        sectionKey,
        data,
        timestamp: new Date().toISOString(),
      };
      
      // Add or update the record
      const request = store.put(recordData);
      
      request.onsuccess = () => resolve(true);
      request.onerror = (event) => {
        handleError(event);
        reject(new Error('Failed to save form section: ' + (event.target as IDBRequest).error));
      };
      
      // Close the database connection when transaction is complete
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    handleError(error);
    return false;
  }
};

/**
 * Retrieves a form section's data from IndexedDB
 */
export const getFormSection = async (sectionKey: string): Promise<any | null> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FORM_STORE, 'readonly');
      const store = transaction.objectStore(FORM_STORE);
      
      // Get the record for this section
      const request = store.get(sectionKey);
      
      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        resolve(result ? result.data : null);
      };
      
      request.onerror = (event) => {
        handleError(event);
        reject(new Error('Failed to retrieve form section: ' + (event.target as IDBRequest).error));
      };
      
      // Close the database connection when transaction is complete
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    handleError(error);
    return null;
  }
};

/**
 * Retrieves all form sections data from IndexedDB
 */
export const getAllFormSections = async (): Promise<Record<string, any> | null> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FORM_STORE, 'readonly');
      const store = transaction.objectStore(FORM_STORE);
      
      // Get all records
      const request = store.getAll();
      
      request.onsuccess = (event) => {
        const results = (event.target as IDBRequest).result;
        if (results && results.length > 0) {
          // Format the results into a key-value object
          const sectionsData: Record<string, any> = {};
          results.forEach((record: { sectionKey: string; data: any }) => {
            sectionsData[record.sectionKey] = record.data;
          });
          resolve(sectionsData);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = (event) => {
        handleError(event);
        reject(new Error('Failed to retrieve all form sections: ' + (event.target as IDBRequest).error));
      };
      
      // Close the database connection when transaction is complete
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    handleError(error);
    return null;
  }
};

/**
 * Removes a form section from IndexedDB
 */
export const removeFormSection = async (sectionKey: string): Promise<boolean> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FORM_STORE, 'readwrite');
      const store = transaction.objectStore(FORM_STORE);
      
      // Delete the section record
      const request = store.delete(sectionKey);
      
      request.onsuccess = () => resolve(true);
      request.onerror = (event) => {
        handleError(event);
        reject(new Error('Failed to remove form section: ' + (event.target as IDBRequest).error));
      };
      
      // Close the database connection when transaction is complete
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    handleError(error);
    return false;
  }
};

/**
 * Clears all form data from IndexedDB
 */
export const clearAllFormData = async (): Promise<boolean> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FORM_STORE, 'readwrite');
      const store = transaction.objectStore(FORM_STORE);
      
      // Clear all records in the store
      const request = store.clear();
      
      request.onsuccess = () => resolve(true);
      request.onerror = (event) => {
        handleError(event);
        reject(new Error('Failed to clear form data: ' + (event.target as IDBRequest).error));
      };
      
      // Close the database connection when transaction is complete
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    handleError(error);
    return false;
  }
};

/**
 * Saves form metadata to IndexedDB
 */
export const saveFormMeta = async (key: string, value: any): Promise<boolean> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(META_STORE, 'readwrite');
      const store = transaction.objectStore(META_STORE);
      
      // Format the metadata object
      const metaData = {
        key,
        value,
        timestamp: new Date().toISOString(),
      };
      
      // Add or update the record
      const request = store.put(metaData);
      
      request.onsuccess = () => resolve(true);
      request.onerror = (event) => {
        handleError(event);
        reject(new Error('Failed to save metadata: ' + (event.target as IDBRequest).error));
      };
      
      // Close the database connection when transaction is complete
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    handleError(error);
    return false;
  }
};

/**
 * Retrieves form metadata from IndexedDB
 */
export const getFormMeta = async (key: string): Promise<any | null> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(META_STORE, 'readonly');
      const store = transaction.objectStore(META_STORE);
      
      // Get the record for this key
      const request = store.get(key);
      
      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        resolve(result ? result.value : null);
      };
      
      request.onerror = (event) => {
        handleError(event);
        reject(new Error('Failed to retrieve metadata: ' + (event.target as IDBRequest).error));
      };
      
      // Close the database connection when transaction is complete
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    handleError(error);
    return null;
  }
};

/**
 * Check if IndexedDB is supported and available
 */
export const isIndexedDBAvailable = (): boolean => {
  return window && 'indexedDB' in window;
};

/**
 * Check if the database exists
 */
export const checkDatabaseExists = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Try to open the database without specifying version
    const request = indexedDB.open(DB_NAME);
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Database exists
      db.close();
      resolve(true);
    };
    
    request.onerror = () => {
      // Database does not exist or cannot be accessed
      resolve(false);
    };
  });
};

/**
 * Default export of all IndexedDB service functions
 */
export default {
  saveFormSection,
  getFormSection,
  getAllFormSections,
  removeFormSection,
  clearAllFormData,
  saveFormMeta,
  getFormMeta,
  isIndexedDBAvailable,
  checkDatabaseExists
}; 