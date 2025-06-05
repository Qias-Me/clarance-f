/**
 * Section 10: Dual/Multiple Citizenship & Foreign Passport - Component
 *
 * React component for SF-86 Section 10 using the new Form Architecture 2.0.
 * This component handles collection of dual citizenship information including
 * foreign countries of citizenship, how obtained, dates, and foreign passport details.
 */

import React, { useEffect, useState } from 'react';
import { useSection10 } from '~/state/contexts/sections2.0/section10';
import { useSF86Form } from '~/state/contexts/SF86FormContext';

interface Section10ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

const Section10Component: React.FC<Section10ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  const {
    section10Data,
    updateDualCitizenshipFlag,
    addDualCitizenship,
    removeDualCitizenship,
    updateDualCitizenship,
    updateForeignPassportFlag,
    addForeignPassport,
    removeForeignPassport,
    updateForeignPassport,
    validateSection,
    resetSection,
    canAddDualCitizenship,
    canAddForeignPassport
    // REMOVED: isDirty - only save button should trigger state updates
    // FIXED: Removed errors from context to prevent infinite loops
  } = useSection10();

  // Clean implementation - no excessive logging

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);
  // FIXED: Local errors state to prevent infinite loops
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);

    // FIXED: Handle errors from validation result instead of relying on context errors state
    // This prevents infinite loops since we're not calling setErrors in validateSection
    if ((validationResult as any).fieldErrors) {
      setLocalErrors((validationResult as any).fieldErrors);
    } else {
      setLocalErrors({});
    }
  }, [section10Data]); // FIXED: Removed validateSection from deps to prevent infinite loop

  // Use local errors instead of context errors to prevent infinite loops
  const errors = localErrors;

  // Handle form submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        // Update the central form context with Section 10 data
        sf86Form.updateSectionData('section10', section10Data);

        // Save the form data to persistence layer
        await sf86Form.saveForm();

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('Failed to save Section 10 data:', error);
      }
    }
  };



  // Get dual citizenships
  const getDualCitizenships = () => {
    return section10Data.section10.dualCitizenship?.entries || [];
  };

  // Get foreign passports
  const getForeignPassports = () => {
    return section10Data.section10.foreignPassport?.entries || [];
  };

  // Render a dual citizenship entry
  const renderDualCitizenshipEntry = (citizenship: any, index: number) => {
    return (
      <div key={`citizenship-${index}`} className="border rounded-lg p-4 mb-4 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">Dual Citizenship #{index + 1}</h4>
          <button
            type="button"
            onClick={() => removeDualCitizenship(index)}
            className="text-red-500 hover:text-red-700"
            aria-label={`Remove citizenship ${index + 1}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* Country */}
          <div>
            <label
              htmlFor={`citizenship-country-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={`citizenship-country-${index}`}
              data-testid={`citizenship-country-${index}`}
              value={citizenship.country?.value || ''}
              onChange={(e) => updateDualCitizenship(index, 'country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter country name"
              required
            />
            {errors[`dualCitizenship.entries[${index}].country`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`dualCitizenship.entries[${index}].country`]}</p>
            )}
          </div>

          {/* How Acquired - Fixed field name to match interface */}
          <div>
            <label
              htmlFor={`citizenship-how-acquired-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              How Citizenship Was Acquired <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={`citizenship-how-acquired-${index}`}
              data-testid={`citizenship-how-acquired-${index}`}
              value={citizenship.howAcquired?.value || ''}
              onChange={(e) => updateDualCitizenship(index, 'howAcquired', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe how citizenship was acquired"
              required
            />
            {errors[`dualCitizenship.entries[${index}].howAcquired`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`dualCitizenship.entries[${index}].howAcquired`]}</p>
            )}
          </div>

          {/* From Date - Fixed field name to match interface */}
          <div>
            <label
              htmlFor={`citizenship-from-date-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              From Date <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={`citizenship-from-date-${index}`}
              data-testid={`citizenship-from-date-${index}`}
              value={citizenship.fromDate?.value || ''}
              onChange={(e) => updateDualCitizenship(index, 'fromDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="MM/DD/YYYY"
              required
            />
            {errors[`dualCitizenship.entries[${index}].fromDate`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`dualCitizenship.entries[${index}].fromDate`]}</p>
            )}
          </div>

          {/* To Date - Fixed field name to match interface */}
          <div>
            <label
              htmlFor={`citizenship-to-date-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              To Date <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={`citizenship-to-date-${index}`}
              data-testid={`citizenship-to-date-${index}`}
              value={citizenship.toDate?.value || ''}
              onChange={(e) => updateDualCitizenship(index, 'toDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="MM/DD/YYYY or 'Present'"
              required
            />
            {errors[`dualCitizenship.entries[${index}].toDate`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`dualCitizenship.entries[${index}].toDate`]}</p>
            )}
          </div>
        </div>


      </div>
    );
  };

  // Render a foreign passport entry
  const renderForeignPassportEntry = (passport: any, index: number) => {
    return (
      <div key={`passport-${index}`} className="border rounded-lg p-4 mb-4 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">Foreign Passport #{index + 1}</h4>
          <button
            type="button"
            onClick={() => removeForeignPassport(index)}
            className="text-red-500 hover:text-red-700"
            aria-label={`Remove passport ${index + 1}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* Country */}
          <div>
            <label
              htmlFor={`passport-country-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={`passport-country-${index}`}
              data-testid={`passport-country-${index}`}
              value={passport.country?.value || ''}
              onChange={(e) => updateForeignPassport(index, 'country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter country name"
              required
            />
            {errors[`foreignPassport.entries[${index}].country`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`foreignPassport.entries[${index}].country`]}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label
              htmlFor={`passport-city-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={`passport-city-${index}`}
              data-testid={`passport-city-${index}`}
              value={passport.city?.value || ''}
              onChange={(e) => updateForeignPassport(index, 'city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter city"
              required
            />
            {errors[`foreignPassport.entries[${index}].city`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`foreignPassport.entries[${index}].city`]}</p>
            )}
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                htmlFor={`passport-first-name-${index}`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id={`passport-first-name-${index}`}
                data-testid={`passport-first-name-${index}`}
                value={passport.firstName?.value || ''}
                onChange={(e) => updateForeignPassport(index, 'firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="First name"
                required
              />
              {errors[`foreignPassport.entries[${index}].firstName`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`foreignPassport.entries[${index}].firstName`]}</p>
              )}
            </div>

            <div>
              <label
                htmlFor={`passport-middle-name-${index}`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Middle Name
              </label>
              <input
                type="text"
                id={`passport-middle-name-${index}`}
                data-testid={`passport-middle-name-${index}`}
                value={passport.middleName?.value || ''}
                onChange={(e) => updateForeignPassport(index, 'middleName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Middle name"
              />
              {errors[`foreignPassport.entries[${index}].middleName`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`foreignPassport.entries[${index}].middleName`]}</p>
              )}
            </div>

            <div>
              <label
                htmlFor={`passport-last-name-${index}`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id={`passport-last-name-${index}`}
                data-testid={`passport-last-name-${index}`}
                value={passport.lastName?.value || ''}
                onChange={(e) => updateForeignPassport(index, 'lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Last name"
                required
              />
              {errors[`foreignPassport.entries[${index}].lastName`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`foreignPassport.entries[${index}].lastName`]}</p>
              )}
            </div>
          </div>

          {/* Passport Number */}
          <div>
            <label
              htmlFor={`passport-number-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Passport Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={`passport-number-${index}`}
              data-testid={`passport-number-${index}`}
              value={passport.passportNumber?.value || ''}
              onChange={(e) => updateForeignPassport(index, 'passportNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter passport number"
              required
            />
            {errors[`foreignPassport.entries[${index}].passportNumber`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`foreignPassport.entries[${index}].passportNumber`]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Issue Date */}
            <div>
              <label
                htmlFor={`passport-issue-date-${index}`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id={`passport-issue-date-${index}`}
                data-testid={`passport-issue-date-${index}`}
                value={passport.issueDate?.value || ''}
                onChange={(e) => updateForeignPassport(index, 'issueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="MM/DD/YYYY"
                required
              />
              {errors[`foreignPassport.entries[${index}].issueDate`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`foreignPassport.entries[${index}].issueDate`]}</p>
              )}
            </div>

            {/* Expiration Date */}
            <div>
              <label
                htmlFor={`passport-expiration-date-${index}`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Expiration Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id={`passport-expiration-date-${index}`}
                data-testid={`passport-expiration-date-${index}`}
                value={passport.expirationDate?.value || ''}
                onChange={(e) => updateForeignPassport(index, 'expirationDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="MM/DD/YYYY"
                required
              />
              {errors[`foreignPassport.entries[${index}].expirationDate`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`foreignPassport.entries[${index}].expirationDate`]}</p>
              )}
            </div>
          </div>

          {/* Used for Entry to US */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={passport.usedForUSEntry?.value || false}
                onChange={(e) => updateForeignPassport(index, 'usedForUSEntry', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                data-testid={`passport-used-for-us-entry-${index}`}
              />
              <span className="text-sm text-gray-700">
                I have used this passport to enter the United States
              </span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section10-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 10: Dual/Multiple Citizenship & Foreign Passport
        </h2>
        <p className="text-gray-600">
          Provide information about dual or multiple citizenship and foreign passports.
        </p>
      </div>

      {/* Dual Citizenship and Foreign Passport Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dual Citizenship Section */}
        <div className="border rounded-lg p-5 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Dual/Multiple Citizenship</h3>

          <div className="mb-4">
            <label className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                checked={section10Data.section10.dualCitizenship?.hasDualCitizenship?.value === 'YES'}
                onChange={(e) => {
                  // FIXED: Use correct values from sections-reference
                  updateDualCitizenshipFlag(e.target.checked ? 'YES' : 'NO (If NO, proceed to 10.2)');
                }}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                data-testid="dual-citizenship-flag-checkbox"
              />
              <span className="text-base font-medium text-gray-700">
                I have dual or multiple citizenship
              </span>
            </label>
            {/* DEBUG: Show current state only in debug mode */}
            {typeof window !== 'undefined' && window.location.search.includes('debug=true') && (
              <div className="text-xs text-gray-500 mb-2">
                DEBUG: Current value = "{section10Data.section10.dualCitizenship?.hasDualCitizenship?.value}" |
                Checked = {section10Data.section10.dualCitizenship?.hasDualCitizenship?.value === 'YES' ? 'true' : 'false'}
              </div>
            )}
          </div>

          {section10Data.section10.dualCitizenship?.hasDualCitizenship?.value === 'YES' && (
            <>
              {getDualCitizenships().length > 0 ? (
                <div className="mb-4">
                  {getDualCitizenships().map((citizenship, index) => renderDualCitizenshipEntry(citizenship, index))}
                </div>
              ) : (
                <p className="italic text-gray-500 mb-4">No dual citizenships added yet.</p>
              )}

              <button
                type="button"
                onClick={addDualCitizenship}
                disabled={!canAddDualCitizenship()}
                className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  canAddDualCitizenship()
                    ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    : 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
                data-testid="add-dual-citizenship-button"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Dual Citizenship {!canAddDualCitizenship() && '(Max 2)'}
              </button>
            </>
          )}
        </div>

        {/* Foreign Passport Section */}
        <div className="border rounded-lg p-5 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Foreign Passport</h3>

          <div className="mb-4">
            <label className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                checked={section10Data.section10.foreignPassport?.hasForeignPassport?.value === 'YES'}
                onChange={(e) => updateForeignPassportFlag(e.target.checked ? 'YES' : 'NO (If NO, proceed to Section 11)')}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                data-testid="foreign-passport-flag-checkbox"
              />
              <span className="text-base font-medium text-gray-700">
                I have been issued a foreign passport
              </span>
            </label>
          </div>

          {section10Data.section10.foreignPassport?.hasForeignPassport?.value === 'YES' && (
            <>
              {getForeignPassports().length > 0 ? (
                <div className="mb-4">
                  {getForeignPassports().map((passport, index) => renderForeignPassportEntry(passport, index))}
                </div>
              ) : (
                <p className="italic text-gray-500 mb-4">No foreign passports added yet.</p>
              )}

              <button
                type="button"
                onClick={addForeignPassport}
                disabled={!canAddForeignPassport()}
                className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  canAddForeignPassport()
                    ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    : 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
                data-testid="add-foreign-passport-button"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Foreign Passport {!canAddForeignPassport() && '(Max 2)'}
              </button>
            </>
          )}
        </div>

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
            Section Status: <span className={`font-medium ${isValid ? 'text-green-500' : 'text-red-500'}`}>
              {isValid ? 'Valid - Ready to submit' : 'Please complete required fields'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Validation: <span className={`font-medium ${isValid ? 'text-green-500' : 'text-red-500'}`}>
              {isValid ? 'Valid' : 'Has errors'}
            </span>
          </div>
        </div>
      </form>

      {/* Debug Information (Development Only) */}
      {typeof window !== 'undefined' && window.location.search.includes('debug=true') && (
        <details className="mt-6 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Section 10 Data:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(section10Data, null, 2)}
            </pre>
            <h4 className="text-xs font-medium text-gray-600 mt-4 mb-2">Validation Errors:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(errors, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};

export default Section10Component;