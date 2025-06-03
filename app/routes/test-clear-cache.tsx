/**
 * Test Clear Cache Page
 * 
 * A dedicated test page to demonstrate and test the Clear Cache functionality.
 * This page allows testing different cache clearing scenarios and viewing cache statistics.
 */

import { useState, useEffect } from 'react';
import ClearCacheButton from '~/components/ClearCacheButton';
import { getCacheStats, clearSF86Cache, clearIndexedDBOnly, clearLocalStorageOnly } from '~/utils/clearCache';
import type { Route } from "./+types/test-clear-cache";

export default function TestClearCache() {
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load cache statistics on component mount
  useEffect(() => {
    loadCacheStats();
  }, []);

  const loadCacheStats = async () => {
    setIsLoading(true);
    try {
      const stats = await getCacheStats();
      setCacheStats(stats);
      console.log('📊 Cache stats loaded:', stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCacheCleared = () => {
    console.log('🗑️ Cache cleared callback triggered');
    // Reload cache stats after clearing
    setTimeout(() => {
      loadCacheStats();
    }, 1000);
  };

  const handleClearIndexedDBOnly = async () => {
    setIsLoading(true);
    try {
      const result = await clearIndexedDBOnly();
      alert(`IndexedDB Clear Result: ${result.success ? 'Success' : 'Failed'}\n${result.message}`);
      loadCacheStats();
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLocalStorageOnly = () => {
    setIsLoading(true);
    try {
      const result = clearLocalStorageOnly();
      alert(`localStorage Clear Result: ${result.success ? 'Success' : 'Failed'}\n${result.message}\nKeys cleared: ${result.keysCleared.length}`);
      loadCacheStats();
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addTestDataToStorage = () => {
    // Add some test data to localStorage and sessionStorage
    const testData = {
      timestamp: new Date().toISOString(),
      testValue: 'This is test data for cache clearing demonstration'
    };

    localStorage.setItem('sf86-test-data', JSON.stringify(testData));
    localStorage.setItem('sf86-form-data', JSON.stringify({ section1: { name: 'Test User' } }));
    localStorage.setItem('sf86-form-completed-sections', JSON.stringify(['section1', 'section7']));
    
    sessionStorage.setItem('sf86-session-test', JSON.stringify(testData));
    sessionStorage.setItem('section-temp-data', JSON.stringify({ tempField: 'temp value' }));

    alert('Test data added to localStorage and sessionStorage');
    loadCacheStats();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Clear Cache Test Page</h1>
            <p className="mt-2 text-sm text-gray-600">
              Test and demonstrate the Clear Cache functionality for SF-86 form data.
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* Cache Statistics */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-blue-900">Cache Statistics</h2>
                <button
                  onClick={loadCacheStats}
                  disabled={isLoading}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Refresh Stats'}
                </button>
              </div>

              {cacheStats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* IndexedDB Stats */}
                  <div className="bg-white p-3 rounded border">
                    <h3 className="font-medium text-gray-900 mb-2">IndexedDB</h3>
                    <div className="text-sm text-gray-600">
                      <p>Has Data: {cacheStats.indexedDB.hasData ? '✅ Yes' : '❌ No'}</p>
                      <p>Databases: {cacheStats.indexedDB.databases.length}</p>
                    </div>
                  </div>

                  {/* localStorage Stats */}
                  <div className="bg-white p-3 rounded border">
                    <h3 className="font-medium text-gray-900 mb-2">localStorage</h3>
                    <div className="text-sm text-gray-600">
                      <p>Total Keys: {cacheStats.localStorage.keyCount}</p>
                      <p>SF-86 Keys: {cacheStats.localStorage.sf86Keys.length}</p>
                      <p>Size: ~{Math.round(cacheStats.localStorage.totalSize / 1024)} KB</p>
                      {cacheStats.localStorage.sf86Keys.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-blue-600">View SF-86 Keys</summary>
                          <ul className="mt-1 text-xs">
                            {cacheStats.localStorage.sf86Keys.map((key: string) => (
                              <li key={key} className="truncate">• {key}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  </div>

                  {/* sessionStorage Stats */}
                  <div className="bg-white p-3 rounded border">
                    <h3 className="font-medium text-gray-900 mb-2">sessionStorage</h3>
                    <div className="text-sm text-gray-600">
                      <p>Total Keys: {cacheStats.sessionStorage.keyCount}</p>
                      <p>SF-86 Keys: {cacheStats.sessionStorage.sf86Keys.length}</p>
                      <p>Size: ~{Math.round(cacheStats.sessionStorage.totalSize / 1024)} KB</p>
                      {cacheStats.sessionStorage.sf86Keys.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-blue-600">View SF-86 Keys</summary>
                          <ul className="mt-1 text-xs">
                            {cacheStats.sessionStorage.sf86Keys.map((key: string) => (
                              <li key={key} className="truncate">• {key}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">
                    {isLoading ? 'Loading cache statistics...' : 'Click "Refresh Stats" to load cache statistics'}
                  </p>
                </div>
              )}
            </div>

            {/* Test Data Management */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-4">Test Data Management</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={addTestDataToStorage}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Add Test Data
                </button>
                <a
                  href="/startForm"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors inline-block"
                >
                  Go to SF-86 Form
                </a>
              </div>
            </div>

            {/* Clear Cache Options */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-red-900 mb-4">Clear Cache Options</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Complete Clear */}
                <div className="bg-white p-3 rounded border">
                  <h3 className="font-medium text-gray-900 mb-2">Complete Clear</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Clears all SF-86 data from IndexedDB, localStorage, and sessionStorage.
                  </p>
                  <ClearCacheButton
                    variant="danger"
                    size="sm"
                    onCacheCleared={handleCacheCleared}
                    confirmationRequired={true}
                  />
                </div>

                {/* IndexedDB Only */}
                <div className="bg-white p-3 rounded border">
                  <h3 className="font-medium text-gray-900 mb-2">IndexedDB Only</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Clears only IndexedDB data, leaving localStorage and sessionStorage intact.
                  </p>
                  <button
                    onClick={handleClearIndexedDBOnly}
                    disabled={isLoading}
                    className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 disabled:opacity-50"
                  >
                    Clear IndexedDB
                  </button>
                </div>

                {/* localStorage Only */}
                <div className="bg-white p-3 rounded border">
                  <h3 className="font-medium text-gray-900 mb-2">localStorage Only</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Clears only localStorage data, leaving IndexedDB and sessionStorage intact.
                  </p>
                  <button
                    onClick={handleClearLocalStorageOnly}
                    disabled={isLoading}
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 disabled:opacity-50"
                  >
                    Clear localStorage
                  </button>
                </div>

                {/* Quick Clear (No Confirmation) */}
                <div className="bg-white p-3 rounded border">
                  <h3 className="font-medium text-gray-900 mb-2">Quick Clear</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Complete clear without confirmation dialog (for testing).
                  </p>
                  <ClearCacheButton
                    variant="danger"
                    size="sm"
                    onCacheCleared={handleCacheCleared}
                    confirmationRequired={false}
                  />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Testing Instructions</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Click "Add Test Data" to populate localStorage and sessionStorage with test data</li>
                <li>Navigate to the SF-86 form and fill out some sections to create IndexedDB data</li>
                <li>Return to this page and refresh the cache statistics to see the data</li>
                <li>Test different clear cache options to see how they affect different storage types</li>
                <li>Use the browser's Developer Tools (F12) to inspect storage directly</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
