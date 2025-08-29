import React, { ReactNode, useCallback } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface FormSectionProps {
  title: string;
  sectionNumber?: string;
  description?: string;
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void | Promise<void>;
  isValid?: boolean;
  errors?: string[];
  warnings?: string[];
  isSubmitting?: boolean;
  className?: string;
  showProgress?: boolean;
  completedSteps?: number;
  totalSteps?: number;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  sectionNumber,
  description,
  children,
  onSubmit,
  isValid = true,
  errors = [],
  warnings = [],
  isSubmitting = false,
  className = '',
  showProgress = false,
  completedSteps = 0,
  totalSteps = 0
}) => {
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && !isSubmitting) {
      await onSubmit(e);
    }
  }, [onSubmit, isSubmitting]);

  return (
    <ErrorBoundary>
      <div className={`bg-white shadow-lg rounded-lg p-6 ${className}`}>
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {sectionNumber && (
                  <span className="text-blue-600 mr-2">Section {sectionNumber}:</span>
                )}
                {title}
              </h2>
              {description && (
                <p className="mt-2 text-sm text-gray-600">{description}</p>
              )}
            </div>
            {showProgress && totalSteps > 0 && (
              <div className="text-right">
                <span className="text-sm text-gray-500">
                  Step {completedSteps} of {totalSteps}
                </span>
                <div className="mt-2 w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validation Messages */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Please correct the following errors:
                </h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <svg
                className="h-5 w-5 text-yellow-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Warning:</h3>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {children}

          {/* Submit Button */}
          {onSubmit && (
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className={`
                  px-6 py-3 rounded-md font-medium text-white
                  transition-all duration-200
                  ${
                    isValid && !isSubmitting
                      ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      : 'bg-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Save and Continue'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </ErrorBoundary>
  );
};