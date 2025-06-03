/**
 * Cache Clearing Utilities
 * 
 * Provides utility functions to clear various types of cached data
 * including IndexedDB, localStorage, and sessionStorage.
 */

import DynamicService from '../../api/service/dynamicService';

export interface ClearCacheOptions {
  clearIndexedDB?: boolean;
  clearLocalStorage?: boolean;
  clearSessionStorage?: boolean;
  clearSpecificKeys?: string[];
  confirmBeforeClear?: boolean;
}

export interface ClearCacheResult {
  success: boolean;
  message: string;
  details: {
    indexedDB: { success: boolean; message: string };
    localStorage: { success: boolean; message: string; keysCleared: string[] };
    sessionStorage: { success: boolean; message: string; keysCleared: string[] };
  };
}

/**
 * Default SF-86 related keys to clear from storage
 */
const DEFAULT_SF86_KEYS = [
  'sf86-form-data',
  'sf86-form-completed-sections',
  'sf86-form-metadata',
  'sf86-section-progress',
  'sf86-validation-cache',
  'sf86-auto-save',
  'sf86-draft-data'
];

/**
 * Clear all SF-86 related cached data
 */
export async function clearSF86Cache(options: ClearCacheOptions = {}): Promise<ClearCacheResult> {
  const {
    clearIndexedDB = true,
    clearLocalStorage = true,
    clearSessionStorage = true,
    clearSpecificKeys = DEFAULT_SF86_KEYS,
    confirmBeforeClear = false
  } = options;

  console.log('🗑️ Starting SF-86 cache clear operation...');
  console.log('📋 Options:', options);

  // Show confirmation if required
  if (confirmBeforeClear) {
    const confirmed = window.confirm(
      'This will permanently delete all saved SF-86 form data including:\n\n' +
      '• All form progress and entries\n' +
      '• Saved drafts and auto-saves\n' +
      '• Section completion status\n' +
      '• Validation cache\n\n' +
      'Are you sure you want to continue?'
    );

    if (!confirmed) {
      return {
        success: false,
        message: 'Cache clear operation cancelled by user',
        details: {
          indexedDB: { success: false, message: 'Cancelled' },
          localStorage: { success: false, message: 'Cancelled', keysCleared: [] },
          sessionStorage: { success: false, message: 'Cancelled', keysCleared: [] }
        }
      };
    }
  }

  const result: ClearCacheResult = {
    success: true,
    message: '',
    details: {
      indexedDB: { success: false, message: '' },
      localStorage: { success: false, message: '', keysCleared: [] },
      sessionStorage: { success: false, message: '', keysCleared: [] }
    }
  };

  // Clear IndexedDB
  if (clearIndexedDB) {
    try {
      console.log('🗑️ Clearing IndexedDB...');
      const dynamicService = new DynamicService();
      const indexedDBResult = await dynamicService.deleteFormData();
      
      result.details.indexedDB = {
        success: indexedDBResult.success,
        message: indexedDBResult.message
      };

      if (indexedDBResult.success) {
        console.log('✅ IndexedDB cleared successfully');
      } else {
        console.warn('⚠️ IndexedDB clear failed:', indexedDBResult.message);
        result.success = false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('💥 IndexedDB clear error:', error);
      result.details.indexedDB = {
        success: false,
        message: `IndexedDB clear failed: ${errorMessage}`
      };
      result.success = false;
    }
  }

  // Clear localStorage
  if (clearLocalStorage) {
    try {
      console.log('🗑️ Clearing localStorage...');
      const clearedKeys: string[] = [];

      // Clear specific keys
      clearSpecificKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          clearedKeys.push(key);
          console.log(`🗑️ Cleared localStorage key: ${key}`);
        }
      });

      // Clear any other SF-86 related keys (pattern matching)
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sf86-') || key.startsWith('section-') || key.includes('form-data')) {
          if (!clearedKeys.includes(key)) {
            localStorage.removeItem(key);
            clearedKeys.push(key);
            console.log(`🗑️ Cleared localStorage key: ${key}`);
          }
        }
      });

      result.details.localStorage = {
        success: true,
        message: `Cleared ${clearedKeys.length} localStorage keys`,
        keysCleared: clearedKeys
      };

      console.log(`✅ localStorage cleared successfully (${clearedKeys.length} keys)`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('💥 localStorage clear error:', error);
      result.details.localStorage = {
        success: false,
        message: `localStorage clear failed: ${errorMessage}`,
        keysCleared: []
      };
      result.success = false;
    }
  }

  // Clear sessionStorage
  if (clearSessionStorage) {
    try {
      console.log('🗑️ Clearing sessionStorage...');
      const clearedKeys: string[] = [];

      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sf86-') || key.startsWith('section-') || key.includes('form-data')) {
          sessionStorage.removeItem(key);
          clearedKeys.push(key);
          console.log(`🗑️ Cleared sessionStorage key: ${key}`);
        }
      });

      result.details.sessionStorage = {
        success: true,
        message: `Cleared ${clearedKeys.length} sessionStorage keys`,
        keysCleared: clearedKeys
      };

      console.log(`✅ sessionStorage cleared successfully (${clearedKeys.length} keys)`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('💥 sessionStorage clear error:', error);
      result.details.sessionStorage = {
        success: false,
        message: `sessionStorage clear failed: ${errorMessage}`,
        keysCleared: []
      };
      result.success = false;
    }
  }

  // Generate summary message
  const successfulOperations = Object.values(result.details).filter(detail => detail.success).length;
  const totalOperations = [clearIndexedDB, clearLocalStorage, clearSessionStorage].filter(Boolean).length;

  if (result.success) {
    result.message = `Cache cleared successfully! (${successfulOperations}/${totalOperations} operations completed)`;
    console.log('🎉 Cache clear operation completed successfully!');
  } else {
    result.message = `Cache clear partially failed (${successfulOperations}/${totalOperations} operations completed)`;
    console.warn('⚠️ Cache clear operation completed with errors');
  }

  console.log('📊 Cache clear summary:', result);
  return result;
}

/**
 * Clear only IndexedDB data
 */
export async function clearIndexedDBOnly(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🗑️ Clearing IndexedDB only...');
    const dynamicService = new DynamicService();
    const result = await dynamicService.deleteFormData();
    
    if (result.success) {
      console.log('✅ IndexedDB cleared successfully');
    } else {
      console.warn('⚠️ IndexedDB clear failed:', result.message);
    }
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('💥 IndexedDB clear error:', error);
    return {
      success: false,
      message: `IndexedDB clear failed: ${errorMessage}`
    };
  }
}

/**
 * Clear only localStorage data
 */
export function clearLocalStorageOnly(keys: string[] = DEFAULT_SF86_KEYS): { success: boolean; message: string; keysCleared: string[] } {
  try {
    console.log('🗑️ Clearing localStorage only...');
    const clearedKeys: string[] = [];

    // Clear specific keys
    keys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        clearedKeys.push(key);
        console.log(`🗑️ Cleared localStorage key: ${key}`);
      }
    });

    // Clear any other SF-86 related keys (pattern matching)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sf86-') || key.startsWith('section-') || key.includes('form-data')) {
        if (!clearedKeys.includes(key)) {
          localStorage.removeItem(key);
          clearedKeys.push(key);
          console.log(`🗑️ Cleared localStorage key: ${key}`);
        }
      }
    });

    console.log(`✅ localStorage cleared successfully (${clearedKeys.length} keys)`);
    return {
      success: true,
      message: `Cleared ${clearedKeys.length} localStorage keys`,
      keysCleared: clearedKeys
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('💥 localStorage clear error:', error);
    return {
      success: false,
      message: `localStorage clear failed: ${errorMessage}`,
      keysCleared: []
    };
  }
}

/**
 * Get cache usage statistics
 */
export async function getCacheStats(): Promise<{
  indexedDB: { hasData: boolean; databases: string[] };
  localStorage: { keyCount: number; sf86Keys: string[]; totalSize: number };
  sessionStorage: { keyCount: number; sf86Keys: string[]; totalSize: number };
}> {
  const stats = {
    indexedDB: { hasData: false, databases: [] as string[] },
    localStorage: { keyCount: 0, sf86Keys: [] as string[], totalSize: 0 },
    sessionStorage: { keyCount: 0, sf86Keys: [] as string[], totalSize: 0 }
  };

  // Check IndexedDB
  try {
    const dynamicService = new DynamicService();
    const testResult = await dynamicService.loadUserFormData('complete-form');
    stats.indexedDB.hasData = testResult.success && !!testResult.formData;
    stats.indexedDB.databases = ['UserFormDB']; // Known database name
  } catch (error) {
    console.warn('Could not check IndexedDB stats:', error);
  }

  // Check localStorage
  try {
    const localKeys = Object.keys(localStorage);
    stats.localStorage.keyCount = localKeys.length;
    stats.localStorage.sf86Keys = localKeys.filter(key => 
      key.startsWith('sf86-') || key.startsWith('section-') || key.includes('form-data')
    );
    
    // Calculate approximate size
    let totalSize = 0;
    localKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += key.length + value.length;
      }
    });
    stats.localStorage.totalSize = totalSize;
  } catch (error) {
    console.warn('Could not check localStorage stats:', error);
  }

  // Check sessionStorage
  try {
    const sessionKeys = Object.keys(sessionStorage);
    stats.sessionStorage.keyCount = sessionKeys.length;
    stats.sessionStorage.sf86Keys = sessionKeys.filter(key => 
      key.startsWith('sf86-') || key.startsWith('section-') || key.includes('form-data')
    );
    
    // Calculate approximate size
    let totalSize = 0;
    sessionKeys.forEach(key => {
      const value = sessionStorage.getItem(key);
      if (value) {
        totalSize += key.length + value.length;
      }
    });
    stats.sessionStorage.totalSize = totalSize;
  } catch (error) {
    console.warn('Could not check sessionStorage stats:', error);
  }

  return stats;
}
