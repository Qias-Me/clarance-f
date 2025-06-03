/**
 * Clear Cache Button Component
 *
 * Provides a button to clear all cached form data from IndexedDB and localStorage.
 * Includes confirmation dialog and loading states for better UX.
 */

import { useState } from 'react';
import { clearSF86Cache } from '../utils/clearCache';
import type { ClearCacheResult } from '../utils/clearCache';

interface ClearCacheButtonProps {
  onCacheCleared?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  confirmationRequired?: boolean;
}

export default function ClearCacheButton({
  onCacheCleared,
  className = '',
  variant = 'danger',
  size = 'md',
  showIcon = true,
  confirmationRequired = true
}: ClearCacheButtonProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastCleared, setLastCleared] = useState<Date | null>(null);

  // Base styles for different variants
  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  // Disabled styles
  const disabledStyles = 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300';

  const buttonClasses = `
    ${isClearing ? disabledStyles : variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
    rounded-md font-medium transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
    disabled:opacity-50 disabled:cursor-not-allowed
  `.trim();

  const handleClearCache = async () => {
    if (confirmationRequired && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsClearing(true);
    setShowConfirmation(false);

    try {
      console.log('🗑️ Starting cache clear operation...');

      // Use the centralized cache clearing utility
      const result: ClearCacheResult = await clearSF86Cache({
        clearIndexedDB: true,
        clearLocalStorage: true,
        clearSessionStorage: true,
        confirmBeforeClear: false // We handle confirmation in the component
      });

      if (result.success) {
        setLastCleared(new Date());
        console.log('🎉 Cache clear operation completed successfully!');

        // Notify parent component
        if (onCacheCleared) {
          onCacheCleared();
        }

        // Show success message with details
        const successMessage = `${result.message}\n\nDetails:\n` +
          `• IndexedDB: ${result.details.indexedDB.success ? '✅ Cleared' : '❌ Failed'}\n` +
          `• localStorage: ${result.details.localStorage.success ? `✅ Cleared ${result.details.localStorage.keysCleared.length} keys` : '❌ Failed'}\n` +
          `• sessionStorage: ${result.details.sessionStorage.success ? `✅ Cleared ${result.details.sessionStorage.keysCleared.length} keys` : '❌ Failed'}`;

        // Optional: Reload the page to ensure clean state
        if (window.confirm(`${successMessage}\n\nWould you like to reload the page to ensure a clean state?`)) {
          window.location.reload();
        }
      } else {
        console.warn('⚠️ Cache clear operation completed with errors:', result.message);
        alert(`Cache clear completed with some errors:\n\n${result.message}\n\nCheck the console for more details.`);
      }

    } catch (error) {
      console.error('💥 Error clearing cache:', error);
      alert(`Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsClearing(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  if (showConfirmation) {
    return (
      <div className="inline-flex items-center space-x-2">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-yellow-800">
                This will permanently delete all saved form data. Are you sure?
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleClearCache}
                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
              >
                Yes, Clear
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-start">
      <button
        onClick={handleClearCache}
        disabled={isClearing}
        className={buttonClasses}
        data-testid="clear-cache-button"
        title="Clear all cached form data from IndexedDB and localStorage"
      >
        {isClearing ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Clearing...
          </>
        ) : (
          <>
            {showIcon && (
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            Clear Cache
          </>
        )}
      </button>

      {lastCleared && (
        <p className="text-xs text-gray-500 mt-1">
          Last cleared: {lastCleared.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
