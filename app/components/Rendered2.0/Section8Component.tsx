/**
 * Section 8: U.S. Passport Information - Component
 *
 * React component for SF-86 Section 8 using the new Form Architecture 2.0.
 * This component handles collection of U.S. passport information including
 * passport number, name, issue date, and expiration date.
 */

import React, { useEffect, useState } from 'react';
import { useSection8 } from '~/state/contexts/sections2.0/section8';

interface Section8ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section8Component: React.FC<Section8ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  const {
    section8Data,
    updatePassportFlag,
    updatePassportNumber,
    updatePassportName,
    updatePassportDate,
    validateSection,
    validatePassport,
    resetSection,
    isDirty,
    errors
  } = useSection8();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section8Data]); // Removed validateSection and onValidationChange to prevent infinite loops

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid && onNext) {
      onNext();
    }
  };

  // Handle passport flag change
  const handlePassportFlagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked ? 'YES' : 'NO';
    updatePassportFlag(value as 'YES' | 'NO');
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section8-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 8: U.S. Passport Information
        </h2>
        <p className="text-gray-600">
          Provide information about your U.S. passport, if you have one.
        </p>
      </div>

      {/* Passport Information Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Passport Flag */}
        <div className="mb-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={section8Data.section8.hasPassport.value === 'YES'}
              onChange={handlePassportFlagChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              data-testid="passport-flag-checkbox"
            />
            <span className="text-base font-medium text-gray-700">
              I have a U.S. passport
            </span>
          </label>
        </div>

        {/* Passport Details (conditionally shown) */}
        {section8Data.section8.hasPassport.value === 'YES' && (
          <div className="border rounded-lg p-5 bg-gray-50 space-y-4">
            <h3 className="text-lg font-semibold mb-4">Passport Details</h3>

            {/* Passport Number */}
            <div>
              <label
                htmlFor="passport-number"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Passport Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="passport-number"
                data-testid="passport-number-input"
                value={section8Data.section8.passportNumber.value || ''}
                onChange={(e) => updatePassportNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter passport number"
                required
              />
              {errors['section8.passportNumber'] && (
                <p className="mt-1 text-sm text-red-600">{errors['section8.passportNumber']}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Last Name */}
              <div>
                <label
                  htmlFor="passport-lastname"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name (as shown on passport) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="passport-lastname"
                  data-testid="passport-lastname-input"
                  value={section8Data.section8.nameOnPassport.lastName.value || ''}
                  onChange={(e) => updatePassportName('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter last name"
                  required
                />
                {errors['section8.nameOnPassport.lastName'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['section8.nameOnPassport.lastName']}</p>
                )}
              </div>

              {/* First Name */}
              <div>
                <label
                  htmlFor="passport-firstname"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name (as shown on passport) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="passport-firstname"
                  data-testid="passport-firstname-input"
                  value={section8Data.section8.nameOnPassport.firstName.value || ''}
                  onChange={(e) => updatePassportName('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter first name"
                  required
                />
                {errors['section8.nameOnPassport.firstName'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['section8.nameOnPassport.firstName']}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Middle Name */}
              <div>
                <label
                  htmlFor="passport-middlename"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Middle Name (as shown on passport)
                </label>
                <input
                  type="text"
                  id="passport-middlename"
                  data-testid="passport-middlename-input"
                  value={section8Data.section8.nameOnPassport.middleName.value || ''}
                  onChange={(e) => updatePassportName('middleName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter middle name (if applicable)"
                />
                {errors['section8.nameOnPassport.middleName'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['section8.nameOnPassport.middleName']}</p>
                )}
              </div>

              {/* Suffix */}
              <div>
                <label
                  htmlFor="passport-suffix"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Suffix (as shown on passport)
                </label>
                <input
                  type="text"
                  id="passport-suffix"
                  data-testid="passport-suffix-input"
                  value={section8Data.section8.nameOnPassport.suffix.value || ''}
                  onChange={(e) => updatePassportName('suffix', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Jr., Sr., III, etc. (if applicable)"
                />
                {errors['section8.nameOnPassport.suffix'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['section8.nameOnPassport.suffix']}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Issue Date */}
              <div>
                <label
                  htmlFor="passport-issue-date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="passport-issue-date"
                  data-testid="passport-issue-date-input"
                  value={section8Data.section8.dates.issueDate.date.value || ''}
                  onChange={(e) => updatePassportDate('issueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MM/DD/YYYY"
                  required
                />
                {errors['section8.dates.issueDate'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['section8.dates.issueDate']}</p>
                )}
              </div>

              {/* Expiration Date */}
              <div>
                <label
                  htmlFor="passport-expiration-date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Expiration Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="passport-expiration-date"
                  data-testid="passport-expiration-date-input"
                  value={section8Data.section8.dates.expirationDate.date.value || ''}
                  onChange={(e) => updatePassportDate('expirationDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MM/DD/YYYY"
                  required
                />
                {errors['section8.dates.expirationDate'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['section8.dates.expirationDate']}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <span className="text-red-500">*</span> Required fields
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              data-testid="submit-section-button"
            >
              Submit & Continue
            </button>

            <button
              type="button"
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              data-testid="clear-section-button"
              onClick={resetSection}
            >
              Clear Section
            </button>
          </div>
        </div>

        {/* Validation Status */}
        <div className="mt-4" data-testid="validation-status">
          <div className="text-sm text-gray-600">
            Section Status: <span className={`font-medium ${isDirty ? 'text-orange-500' : 'text-green-500'}`}>
              {isDirty ? 'Modified, needs validation' : 'Ready for input'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Validation: <span className={`font-medium ${isValid ? 'text-green-500' : 'text-red-500'}`}>
              {isValid ? 'Valid' : 'Has errors'}
            </span>
          </div>
          {section8Data.section8.hasPassport.value === 'YES' && (
            <div className="text-sm text-gray-600">
              Passport Validation: <span className={`font-medium ${validatePassport().isValid ? 'text-green-500' : 'text-red-500'}`}>
                {validatePassport().isValid ? 'Valid' : 'Has errors'}
              </span>
            </div>
          )}
        </div>
      </form>

      {/* Debug Information (Development Only) */}
      {typeof window !== 'undefined' && window.location.search.includes('debug=true') && (
        <details className="mt-6 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Section 8 Data:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(section8Data, null, 2)}
            </pre>
            <h4 className="text-xs font-medium text-gray-600 mt-4 mb-2">Validation Errors:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(errors, null, 2)}
            </pre>
            <h4 className="text-xs font-medium text-gray-600 mt-4 mb-2">Passport Validation Result:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(validatePassport(), null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};

export default Section8Component;