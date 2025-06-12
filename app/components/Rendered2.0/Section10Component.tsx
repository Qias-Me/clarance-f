/**
 * Section 10: Dual/Multiple Citizenship & Foreign Passport - Component
 *
 * React component for SF-86 Section 10 using the new Form Architecture 2.0.
 * This component handles collection of dual citizenship information including
 * foreign countries of citizenship, how obtained, dates, and foreign passport details.
 */

import React, { useEffect, useState } from 'react';
import { useSection10 } from '~/state/contexts/sections2.0/section10';
import { useSF86Form } from '~/state/contexts/sections2.0/SF86FormContext';
import { getSuffixOptions, getCountryOptions } from '../../../api/interfaces/sections2.0/base';

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
    addTravelCountry,        // NEW: Travel country management
    removeTravelCountry,     // NEW: Travel country management
    updateTravelCountry,     // NEW: Travel country management
    canAddTravelCountry,     // NEW: Travel country management
    validateSection,
    resetSection,
    canAddDualCitizenship,
    canAddForeignPassport,
    // NEW: Submit-only mode functions
    submitSectionData,
    hasPendingChanges
    // REMOVED: isDirty - only save button should trigger state updates
    // FIXED: Removed errors from context to prevent infinite loops
  } = useSection10();

  // Clean implementation - no excessive logging

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);
  // FIXED: Enhanced error state management with proper typing
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  // Submit state management
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PERFORMANCE FIX: Only validate on component mount, not on every data change
  useEffect(() => {
    // Initial validation on component mount
    performValidation();
  }, []); // Remove section10Data dependency to prevent validation on every change

  // Separate validation function for explicit calls
  const performValidation = () => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);

    // FIXED: Properly convert ValidationError[] to Record<string, string>
    if (validationResult.errors && Array.isArray(validationResult.errors)) {
      const errorMap: Record<string, string> = {};
      validationResult.errors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
    } else {
      setErrors({});
    }

    // Handle validation warnings if present
    if (validationResult.warnings && validationResult.warnings.length > 0) {
      setValidationWarnings(validationResult.warnings.map(w => w.message || w.toString()));
    } else {
      setValidationWarnings([]);
    }

    // Log validation details in debug mode (only when explicitly called)
    if (typeof window !== 'undefined' && window.location.search.includes('debug=true')) {
      // console.log('🔍 Section10: Validation result:', {
      //   isValid: validationResult.isValid,
      //   errorCount: validationResult.errors?.length || 0,
      //   warningCount: validationResult.warnings?.length || 0,
      //   errors: validationResult.errors,
      //   warnings: validationResult.warnings
      // });
    }

    return validationResult;
  };

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // PERFORMANCE FIX: Only validate and log on submit
    // console.log('🚀 Section10: Form submitted - running validation');
    const result = performValidation();
    // console.log('🔍 Section10: Validation result:', result);
    // console.log('📊 Section10: Data being submitted:', section10Data);

    if (result.isValid) {
      try {
        // console.log('🔄 Section 10: Starting data synchronization...');

        // Update the central form context with Section 10 data
        sf86Form.updateSectionData('section10', section10Data);

        // console.log('✅ Section 10: Data synchronization complete, proceeding to save...');

        // Get the current form data and update it with section10 data for immediate saving
        const currentFormData = sf86Form.exportForm();
        const updatedFormData = { ...currentFormData, section10: section10Data };

        // Save the form data to persistence layer with the updated data
        await sf86Form.saveForm(updatedFormData);

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section10');

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section10');

        // console.log('✅ Section 10 data saved successfully:', section10Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        // console.error('❌ Failed to save Section 10 data:', error);
        // Show an error message to user
        // console.log('There was an error saving your information. Please try again.');
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

  // Render a dual citizenship entry with ALL FIELDS (corrected mappings)
  const renderDualCitizenshipEntry = (citizenship: any, index: number) => {
    return (
      <div key={`citizenship-${index}`} className="border rounded-lg p-4 mb-4 bg-gray-50" data-entry={index}>
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
          {/* Country - DropDownList13[0/1] */}
          <div>
            <label
              htmlFor={`citizenship-country-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Country <span className="text-red-500">*</span>
            </label>
            <select
              id={`citizenship-country-${index}`}
              data-testid={`citizenship-country-${index}`}
              value={citizenship.country?.value || ''}
              onChange={(e) => updateDualCitizenship(index, 'country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {getCountryOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors[`dualCitizenship.entries[${index}].country`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`dualCitizenship.entries[${index}].country`]}</p>
            )}
          </div>

          {/* How Acquired - TextField11[0/3] */}
          <div>
            <label
              htmlFor={`citizenship-how-acquired-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              How Citizenship Was Acquired <span className="text-red-500">*</span>
            </label>
            <textarea
              id={`citizenship-how-acquired-${index}`}
              data-testid={`citizenship-how-acquired-${index}`}
              value={citizenship.howAcquired?.value || ''}
              onChange={(e) => updateDualCitizenship(index, 'howAcquired', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe how citizenship was acquired (e.g., birth, naturalization, marriage)"
              rows={3}
              required
            />
            {errors[`dualCitizenship.entries[${index}].howAcquired`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`dualCitizenship.entries[${index}].howAcquired`]}</p>
            )}
          </div>

          {/* Date Range with Estimate Checkboxes */}
          <div className="grid grid-cols-2 gap-4">
            {/* From Date - From_Datefield_Name_2[0/2] */}
            <div>
              <label
                htmlFor={`citizenship-from-date-${index}`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                From Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id={`citizenship-from-date-${index}`}
                data-testid={`citizenship-from-date-${index}`}
                value={citizenship.fromDate?.value || ''}
                onChange={(e) => updateDualCitizenship(index, 'fromDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={citizenship.isFromEstimated?.value || false}
                  onChange={(e) => updateDualCitizenship(index, 'isFromEstimated', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">From date is estimated</span>
              </label>
              {errors[`dualCitizenship.entries[${index}].fromDate`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`dualCitizenship.entries[${index}].fromDate`]}</p>
              )}
            </div>

            {/* To Date - From_Datefield_Name_2[1/3] */}
            <div>
              <label
                htmlFor={`citizenship-to-date-${index}`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                To Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id={`citizenship-to-date-${index}`}
                data-testid={`citizenship-to-date-${index}`}
                value={citizenship.isPresent?.value ? '' : citizenship.toDate?.value || ''}
                onChange={(e) => updateDualCitizenship(index, 'toDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={citizenship.isPresent?.value}
                required={!citizenship.isPresent?.value}
              />
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={citizenship.isToEstimated?.value || false}
                    onChange={(e) => updateDualCitizenship(index, 'isToEstimated', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={citizenship.isPresent?.value}
                  />
                  <span className="ml-2 text-sm text-gray-600">To date is estimated</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={citizenship.isPresent?.value || false}
                    onChange={(e) => {
                      updateDualCitizenship(index, 'isPresent', e.target.checked);
                      if (e.target.checked) {
                        updateDualCitizenship(index, 'toDate', 'Present');
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Present (still have citizenship)</span>
                </label>
              </div>
              {errors[`dualCitizenship.entries[${index}].toDate`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`dualCitizenship.entries[${index}].toDate`]}</p>
              )}
            </div>
          </div>

          {/* Has Renounced - RadioButtonList[1/3] - CORRECTED FIELD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Have you renounced this citizenship? <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`citizenship-has-renounced-${index}`}
                  value="YES"
                  checked={citizenship.hasRenounced?.value === 'YES'}
                  onChange={(e) => updateDualCitizenship(index, 'hasRenounced', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`citizenship-has-renounced-${index}`}
                  value="NO"
                  checked={citizenship.hasRenounced?.value === 'NO'}
                  onChange={(e) => updateDualCitizenship(index, 'hasRenounced', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Renounce Explanation - TextField11[1/4] - CORRECTED FIELD */}
          <div>
            <label
              htmlFor={`citizenship-renounce-explanation-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Explanation of Renunciation Status
            </label>
            <textarea
              id={`citizenship-renounce-explanation-${index}`}
              data-testid={`citizenship-renounce-explanation-${index}`}
              value={citizenship.renounceExplanation?.value || ''}
              onChange={(e) => updateDualCitizenship(index, 'renounceExplanation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Explain your renunciation status or plans"
              rows={3}
            />
          </div>

          {/* Has Taken Action - RadioButtonList[2/4] */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Have you taken any action to renounce this citizenship?
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`citizenship-has-taken-action-${index}`}
                  value="YES"
                  checked={citizenship.hasTakenAction?.value === 'YES'}
                  onChange={(e) => updateDualCitizenship(index, 'hasTakenAction', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`citizenship-has-taken-action-${index}`}
                  value="NO"
                  checked={citizenship.hasTakenAction?.value === 'NO'}
                  onChange={(e) => updateDualCitizenship(index, 'hasTakenAction', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Action Explanation - TextField11[2/5] */}
          <div>
            <label
              htmlFor={`citizenship-action-explanation-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Explanation of Actions Taken
            </label>
            <textarea
              id={`citizenship-action-explanation-${index}`}
              data-testid={`citizenship-action-explanation-${index}`}
              value={citizenship.actionExplanation?.value || ''}
              onChange={(e) => updateDualCitizenship(index, 'actionExplanation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe any actions taken regarding renunciation"
              rows={3}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render travel countries table for a passport
  const renderTravelCountriesTable = (passport: any, passportIndex: number) => {
    const travelCountries = passport.travelCountries || [];

    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-md font-medium text-gray-900">Countries Visited with this Passport</h5>
          <button
            type="button"
            onClick={() => addTravelCountry(passportIndex)}
            disabled={!canAddTravelCountry(passportIndex)}
            className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded ${
              canAddTravelCountry(passportIndex)
                ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                : 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
            }`}
          >
            Add Country {!canAddTravelCountry(passportIndex) && '(Max 6)'}
          </button>
        </div>

        {travelCountries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {travelCountries.map((travel: any, travelIndex: number) => (
                  <tr key={`travel-${passportIndex}-${travelIndex}`} data-row={travelIndex}>
                    <td className="px-3 py-2">
                      <select
                        value={travel.country?.value || ''}
                        onChange={(e) => updateTravelCountry(passportIndex, travelIndex, 'country', e.target.value)}
                        className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 ${
                          errors[`foreignPassport.entries[${passportIndex}].travelCountries[${travelIndex}].country`]
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      >
                        {getCountryOptions().map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors[`foreignPassport.entries[${passportIndex}].travelCountries[${travelIndex}].country`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors[`foreignPassport.entries[${passportIndex}].travelCountries[${travelIndex}].country`]}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={travel.fromDate?.value || ''}
                        onChange={(e) => updateTravelCountry(passportIndex, travelIndex, 'fromDate', e.target.value)}
                        className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 ${
                          errors[`foreignPassport.entries[${passportIndex}].travelCountries[${travelIndex}].fromDate`]
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                      <label className="flex items-center mt-1">
                        <input
                          type="checkbox"
                          checked={travel.isFromDateEstimated?.value || false}
                          onChange={(e) => updateTravelCountry(passportIndex, travelIndex, 'isFromDateEstimated', e.target.checked)}
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-1 text-xs text-gray-600">Est.</span>
                      </label>
                      {errors[`foreignPassport.entries[${passportIndex}].travelCountries[${travelIndex}].fromDate`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors[`foreignPassport.entries[${passportIndex}].travelCountries[${travelIndex}].fromDate`]}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={travel.isPresent?.value ? '' : travel.toDate?.value || ''}
                        onChange={(e) => updateTravelCountry(passportIndex, travelIndex, 'toDate', e.target.value)}
                        disabled={travel.isPresent?.value}
                        className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 disabled:bg-gray-100 ${
                          errors[`foreignPassport.entries[${passportIndex}].travelCountries[${travelIndex}].toDate`]
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                      <label className="flex items-center mt-1">
                        <input
                          type="checkbox"
                          checked={travel.isToDateEstimated?.value || false}
                          onChange={(e) => updateTravelCountry(passportIndex, travelIndex, 'isToDateEstimated', e.target.checked)}
                          disabled={travel.isPresent?.value}
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:bg-gray-100"
                        />
                        <span className="ml-1 text-xs text-gray-600">Est.</span>
                      </label>
                      {errors[`foreignPassport.entries[${passportIndex}].travelCountries[${travelIndex}].toDate`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors[`foreignPassport.entries[${passportIndex}].travelCountries[${travelIndex}].toDate`]}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={travel.isPresent?.value || false}
                          onChange={(e) => {
                            updateTravelCountry(passportIndex, travelIndex, 'isPresent', e.target.checked);
                            if (e.target.checked) {
                              updateTravelCountry(passportIndex, travelIndex, 'toDate', 'Present');
                            }
                          }}
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-1 text-xs text-gray-600">Present</span>
                      </label>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeTravelCountry(passportIndex, travelIndex)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No travel countries added yet.</p>
        )}
      </div>
    );
  };

  // Render a foreign passport entry with ALL FIELDS including travel countries table
  const renderForeignPassportEntry = (passport: any, index: number) => {
    return (
      <div key={`passport-${index}`} className="border rounded-lg p-4 mb-4 bg-gray-50" data-entry={index}>
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
          {/* Passport Country - DropDownList14[0] */}
          <div>
            <label
              htmlFor={`passport-country-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Passport Country <span className="text-red-500">*</span>
            </label>
            <select
              id={`passport-country-${index}`}
              data-testid={`passport-country-${index}`}
              value={passport.country?.value || ''}
              onChange={(e) => updateForeignPassport(index, 'country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {getCountryOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors[`foreignPassport.entries[${index}].country`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`foreignPassport.entries[${index}].country`]}</p>
            )}
          </div>

          {/* Issue Date with Estimate - From_Datefield_Name_2[4/0] + #field[20/4] */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor={`passport-issue-date-${index}`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id={`passport-issue-date-${index}`}
                data-testid={`passport-issue-date-${index}`}
                value={passport.issueDate?.value || ''}
                onChange={(e) => updateForeignPassport(index, 'issueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={passport.isIssueDateEstimated?.value || false}
                  onChange={(e) => updateForeignPassport(index, 'isIssueDateEstimated', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Issue date is estimated</span>
              </label>
              {errors[`foreignPassport.entries[${index}].issueDate`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`foreignPassport.entries[${index}].issueDate`]}</p>
              )}
            </div>

            {/* Expiration Date with Estimate - From_Datefield_Name_2[5/1] + #field[29/13] */}
            <div>
              <label
                htmlFor={`passport-expiration-date-${index}`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Expiration Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id={`passport-expiration-date-${index}`}
                data-testid={`passport-expiration-date-${index}`}
                value={passport.expirationDate?.value || ''}
                onChange={(e) => updateForeignPassport(index, 'expirationDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={passport.isExpirationDateEstimated?.value || false}
                  onChange={(e) => updateForeignPassport(index, 'isExpirationDateEstimated', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Expiration date is estimated</span>
              </label>
              {errors[`foreignPassport.entries[${index}].expirationDate`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`foreignPassport.entries[${index}].expirationDate`]}</p>
              )}
            </div>
          </div>

          {/* City - TextField11[6/0] */}
          <div>
            <label
              htmlFor={`passport-city-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              City of Issue <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={`passport-city-${index}`}
              data-testid={`passport-city-${index}`}
              value={passport.city?.value || ''}
              onChange={(e) => updateForeignPassport(index, 'city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter city where passport was issued"
              required
            />
            {errors[`foreignPassport.entries[${index}].city`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`foreignPassport.entries[${index}].city`]}</p>
            )}
          </div>

          {/* Issuing Country - DropDownList11[0] */}
          <div>
            <label
              htmlFor={`passport-country2-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Issuing Country <span className="text-red-500">*</span>
            </label>
            <select
              id={`passport-country2-${index}`}
              data-testid={`passport-country2-${index}`}
              value={passport.country2?.value || ''}
              onChange={(e) => updateForeignPassport(index, 'country2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {getCountryOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Name Fields - TextField11[7,8,9/1,2,3] */}
          <div className="grid grid-cols-4 gap-4">
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

            {/* Suffix - suffix[0] - NEW FIELD */}
            <div>
              <label
                htmlFor={`passport-suffix-${index}`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Suffix
              </label>
              <select
                id={`passport-suffix-${index}`}
                data-testid={`passport-suffix-${index}`}
                value={passport.suffix?.value || ''}
                onChange={(e) => updateForeignPassport(index, 'suffix', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {getSuffixOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Passport Number - TextField11[10/4] */}
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

          {/* Used for Entry to US - RadioButtonList[6/0] */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Have you used this passport to enter the United States? <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`passport-used-for-us-entry-${index}`}
                  value="YES"
                  checked={passport.usedForUSEntry?.value === true || passport.usedForUSEntry?.value === 'YES'}
                  onChange={() => updateForeignPassport(index, 'usedForUSEntry', true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`passport-used-for-us-entry-${index}`}
                  value="NO"
                  checked={passport.usedForUSEntry?.value === false || passport.usedForUSEntry?.value === 'NO'}
                  onChange={() => updateForeignPassport(index, 'usedForUSEntry', false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
        </div>

        {/* Travel Countries Table - Table1[0] - NEW SECTION */}
        {renderTravelCountriesTable(passport, index)}
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

      {/* Pending Changes Indicator */}
      {hasPendingChanges() && (
        <div className="mb-4 p-3 border rounded-lg bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-700">
              <strong>Unsaved Changes:</strong> You have made changes that will be saved when you click "Submit & Continue".
            </p>
          </div>
        </div>
      )}

      {/* Validation Summary */}
      {(Object.keys(errors).length > 0 || validationWarnings.length > 0) && (
        <div className="mb-6 p-4 border rounded-lg bg-yellow-50 border-yellow-200">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Validation Issues</h3>

          {Object.keys(errors).length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-red-700 mb-1">Errors ({Object.keys(errors).length}):</h4>
              <ul className="text-xs text-red-600 space-y-1">
                {Object.entries(errors).slice(0, 5).map(([field, message]) => (
                  <li key={field}>• {message}</li>
                ))}
                {Object.keys(errors).length > 5 && (
                  <li className="text-gray-500">... and {Object.keys(errors).length - 5} more</li>
                )}
              </ul>
            </div>
          )}

          {validationWarnings.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-yellow-700 mb-1">Warnings ({validationWarnings.length}):</h4>
              <ul className="text-xs text-yellow-600 space-y-1">
                {validationWarnings.slice(0, 3).map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
                {validationWarnings.length > 3 && (
                  <li className="text-gray-500">... and {validationWarnings.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

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
                  // Update the flag first
                  const newValue = e.target.checked ? 'YES' : 'NO (If NO, proceed to 10.2)';
                  updateDualCitizenshipFlag(newValue);

                  // If checking YES and no entries exist, automatically add the first entry
                  if (e.target.checked && getDualCitizenships().length === 0) {
                    // Use setTimeout to ensure the flag update is processed first
                    setTimeout(() => {
                      addDualCitizenship();
                    }, 0);
                  }
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
              {getDualCitizenships().length > 0 && (
                <div className="mb-4">
                  {getDualCitizenships().map((citizenship, index) => renderDualCitizenshipEntry(citizenship, index))}
                </div>
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
                onChange={(e) => {
                  // Update the flag first
                  const newValue = e.target.checked ? 'YES' : 'NO (If NO, proceed to Section 11)';
                  updateForeignPassportFlag(newValue);

                  // If checking YES and no entries exist, automatically add the first entry
                  if (e.target.checked && getForeignPassports().length === 0) {
                    // Use setTimeout to ensure the flag update is processed first
                    setTimeout(() => {
                      addForeignPassport();
                    }, 0);
                  }
                }}
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
              {getForeignPassports().length > 0 && (
                <div className="mb-4">
                  {getForeignPassports().map((passport, index) => renderForeignPassportEntry(passport, index))}
                </div>
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

        {/* Submit Error Display */}
        {submitError && (
          <div className="mt-6 p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{submitError}</p>
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
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'
              }`}
              data-testid="submit-section-button"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Submit & Continue'
              )}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500'
              }`}
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