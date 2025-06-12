/**
 * Section 5: Other Names Used - Component
 *
 * React component for SF-86 Section 5 using the new Form Architecture 2.0.
 * This component handles collecting information about other names the person has used,
 * with the ability to add multiple entries with date ranges.
 */

import React, { useEffect, useState, useRef } from 'react';
import { useSection5 } from '~/state/contexts/sections2.0/section5';
import { useSF86Form } from '~/state/contexts/sections2.0/SF86FormContext';
import { getSuffixOptions } from '../../../api/interfaces/sections2.0/base';

interface Section5ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section5Component: React.FC<Section5ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  const {
    section5Data,
    updateHasOtherNames,
    addOtherNameEntry,
    removeOtherNameEntry,
    updateFieldValue,
    getEntryCount,
    getEntry,
    validateSection,
    resetSection,
    isDirty,
    errors,
    setValidationErrors
  } = useSection5();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);

    // Convert validation errors to the format expected by the component
    const errorMap: Record<string, string> = {};
    validationResult.errors.forEach(error => {
      errorMap[error.field] = error.message;
    });

    // Update the errors state in the Section5 context
    setValidationErrors(errorMap);
  }, [section5Data, validateSection, onValidationChange, setValidationErrors]); // Include all dependencies

  // Ensure data consistency on mount with defensive programming
  useEffect(() => {
    // Only run if section5Data is properly initialized
    if (!section5Data?.section5?.hasOtherNames) {
      return; // Skip if data not loaded yet
    }

    const entryCount = getEntryCount();
    const hasOtherNamesValue = section5Data.section5.hasOtherNames.value;

    // If we have entries but hasOtherNames is "NO", clear the entries
    if (entryCount > 0 && hasOtherNamesValue === "NO") {
      updateHasOtherNames(false);
    }
  }, [section5Data, getEntryCount, updateHasOtherNames]); // Run when data changes

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    // console.log('🔍 Section 5 validation result:', result);
    // console.log('📊 Section 5 data before submission:', section5Data);

    if (result.isValid) {
      try {
        // console.log('🔄 Section 5: Starting data synchronization...');

        // Update the central form context with Section 5 data
        sf86Form.updateSectionData('section5', section5Data);

        // console.log('✅ Section 5: Data synchronization complete, proceeding to save...');

        // Get the current form data and update it with section5 data for immediate saving
        const currentFormData = sf86Form.exportForm();
        const updatedFormData = { ...currentFormData, section5: section5Data };

        // Save the form data to persistence layer with the updated data
        await sf86Form.saveForm(updatedFormData);

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section5');

        // console.log('✅ Section 5 data saved successfully:', section5Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        // console.error('❌ Failed to save Section 5 data:', error);
        // Show an error message to user
        // console.log('There was an error saving your information. Please try again.');
      }
    }
  };



  // Use a ref to prevent multiple rapid calls
  const isAddingEntryRef = useRef(false);

  // Helper function to get current month/year in MM/YYYY format
  const getCurrentMonthYear = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11
    const year = now.getFullYear();
    return `${month}/${year}`;
  };

  // Custom handler for the "Present" checkbox
  const handlePresentChange = (index: number, isChecked: boolean) => {
    // Update the present field
    updateFieldValue(`section5.otherNames[${index}].present`, isChecked);

    // If checked, set the "to" field to current month/year
    // If unchecked, clear the "to" field
    const toValue = isChecked ? getCurrentMonthYear() : '';
    updateFieldValue(`section5.otherNames[${index}].to`, toValue);
  };

  // Handle Yes/No radio selection
  const handleHasOtherNamesChange = (value: boolean) => {
    if (value) {
      // If selecting "Yes", ensure we have exactly 1 entry
      // First, always update the flag
      updateHasOtherNames(true);

      // Prevent multiple rapid calls
      if (isAddingEntryRef.current) {
        return;
      }

      // Then, check if we need to add an entry (use a timeout to ensure state has updated)
      setTimeout(() => {
        const countAfterUpdate = getEntryCount();

        if (countAfterUpdate === 0 && !isAddingEntryRef.current) {
          isAddingEntryRef.current = true;
          addOtherNameEntry('handleHasOtherNamesChange');

          // Reset the flag after a short delay
          setTimeout(() => {
            isAddingEntryRef.current = false;
          }, 100);
        }
      }, 0);
    } else {
      // If selecting "No", clear all entries
      updateHasOtherNames(false);
    }
  };

  // Maximum number of other name entries allowed
  const MAX_OTHER_NAME_ENTRIES = 4;

  // Check if we can add more entries
  const canAddMoreEntries = () => {
    return getEntryCount() < MAX_OTHER_NAME_ENTRIES;
  };

  // Get value for Has Other Names radio buttons with defensive programming
  const getHasOtherNamesValue = (): boolean => {
    // Try the standard structure first
    if (section5Data?.section5?.hasOtherNames?.value) {
      return section5Data.section5.hasOtherNames.value === "YES";
    }

    // Try the flattened structure (cast to any to handle different data structures)
    const flattenedData = actualSection5Data as any;
    if (flattenedData?.value) {
      return flattenedData.value === "YES";
    }

    return false;
  };

  // Handle different data structures - the data might be stored with numeric keys
  const actualSection5Data = section5Data?.section5 ||
    (section5Data && Object.keys(section5Data).length > 0 ? Object.values(section5Data)[0] : null);



  // Check if data is still loading - be more permissive
  const isDataLoading = !section5Data || (!section5Data.section5 && !actualSection5Data);



  // Render a single other name entry
  const renderOtherNameEntry = (index: number) => {
    const entry = getEntry(index);
    if (!entry) return null;

    return (
      <div key={`other-name-${index}`} className="border rounded-lg p-4 mb-4 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Other Name #{index + 1}</h3>
          <button
            type="button"
            onClick={() => removeOtherNameEntry(index)}
            className="text-red-500 hover:text-red-700"
            aria-label={`Remove name entry ${index + 1}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name 
            </label>
            <input
              type="text"
              value={entry.lastName.value || ''}
              onChange={(e) => updateFieldValue(`section5.otherNames[${index}].lastName`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

              data-testid={`other-name-${index}-last-name`}
            />
            {errors[`section5.otherNames[${index}].lastName`] && (
              <p className="mt-1 text-sm text-red-600">
                {errors[`section5.otherNames[${index}].lastName`]}
              </p>
            )}
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name 
            </label>
            <input
              type="text"
              value={entry.firstName.value || ''}
              onChange={(e) => updateFieldValue(`section5.otherNames[${index}].firstName`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

              data-testid={`other-name-${index}-first-name`}
            />
            {errors[`section5.otherNames[${index}].firstName`] && (
              <p className="mt-1 text-sm text-red-600">
                {errors[`section5.otherNames[${index}].firstName`]}
              </p>
            )}
          </div>

          {/* Middle Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Middle Name
            </label>
            <input
              type="text"
              value={entry.middleName.value || ''}
              onChange={(e) => updateFieldValue(`section5.otherNames[${index}].middleName`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid={`other-name-${index}-middle-name`}
            />
          </div>

          {/* Suffix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suffix
            </label>
            <select
              value={entry.suffix.value || ''}
              onChange={(e) => updateFieldValue(`section5.otherNames[${index}].suffix`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid={`other-name-${index}-suffix`}
            >
              {getSuffixOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From (Month/Year)
            </label>
            <input
              type="text"
              value={entry.from.value || ''}
              onChange={(e) => updateFieldValue(`section5.otherNames[${index}].from`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="MM/YYYY"
              data-testid={`other-name-${index}-from-date`}
            />
            <div className="mt-1 flex items-center">
              <input
                type="checkbox"
                checked={entry.fromEstimate.value || false}
                onChange={(e) => updateFieldValue(`section5.otherNames[${index}].fromEstimate`, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                id={`from-estimate-${index}`}
                data-testid={`other-name-${index}-from-estimate`}
              />
              <label htmlFor={`from-estimate-${index}`} className="ml-2 block text-sm text-gray-700">
                Estimate
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Enter the month and year you began using this name (e.g., 01/2010).
            </p>
            {errors[`section5.otherNames[${index}].from`] && (
              <p className="mt-1 text-sm text-red-600">
                {errors[`section5.otherNames[${index}].from`]}
              </p>
            )}
          </div>

          {/* To Date / Present */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To (Month/Year)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={entry.to.value || ''}
                onChange={(e) => updateFieldValue(`section5.otherNames[${index}].to`, e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${entry.present.value ? 'bg-gray-100' : ''}`}
                placeholder="MM/YYYY"
                disabled={entry.present.value}
                data-testid={`other-name-${index}-to-date`}
              />
            </div>
            <div className="mt-1 flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={entry.toEstimate.value || false}
                  onChange={(e) => updateFieldValue(`section5.otherNames[${index}].toEstimate`, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  id={`to-estimate-${index}`}
                  disabled={entry.present.value}
                  data-testid={`other-name-${index}-to-estimate`}
                />
                <label htmlFor={`to-estimate-${index}`} className="ml-2 block text-sm text-gray-700">
                  Estimate
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={entry.present.value || false}
                  onChange={(e) => handlePresentChange(index, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  id={`present-${index}`}
                  data-testid={`other-name-${index}-present`}
                />
                <label htmlFor={`present-${index}`} className="ml-2 block text-sm text-gray-700">
                  Present
                </label>
              </div>
            </div>
            {errors[`section5.otherNames[${index}].to`] && (
              <p className="mt-1 text-sm text-red-600">
                {errors[`section5.otherNames[${index}].to`]}
              </p>
            )}
          </div>

          {/* Reason for Change */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Name Change
            </label>
            <textarea
              value={entry.reasonChanged.value || ''}
              onChange={(e) => updateFieldValue(`section5.otherNames[${index}].reasonChanged`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}

              data-testid={`other-name-${index}-reason`}
            ></textarea>
            <p className="mt-1 text-xs text-gray-500">
              Provide the reason why you changed your name (e.g., marriage, divorce, legal name change).
            </p>
            {errors[`section5.otherNames[${index}].reasonChanged`] && (
              <p className="mt-1 text-sm text-red-600">
                {errors[`section5.otherNames[${index}].reasonChanged`]}
              </p>
            )}
          </div>

          {/* Maiden Name Radio Buttons */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Is this a maiden name?
            </label>
            <div className="flex space-x-6">
              <div className="flex items-center">
                <input
                  type="radio"
                  id={`maiden-name-yes-${index}`}
                  name={`maiden-name-${index}`}
                  checked={entry.isMaidenName?.value === "YES"}
                  onChange={() => updateFieldValue(`section5.otherNames[${index}].isMaidenName`, "YES")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  data-testid={`other-name-${index}-maiden-name-yes`}
                />
                <label htmlFor={`maiden-name-yes-${index}`} className="ml-2 block text-sm text-gray-700">
                  Yes
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id={`maiden-name-no-${index}`}
                  name={`maiden-name-${index}`}
                  checked={entry.isMaidenName?.value === "NO"}
                  onChange={() => updateFieldValue(`section5.otherNames[${index}].isMaidenName`, "NO")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  data-testid={`other-name-${index}-maiden-name-no`}
                />
                <label htmlFor={`maiden-name-no-${index}`} className="ml-2 block text-sm text-gray-700">
                  No
                </label>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Select "Yes" if this name is a maiden name.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Show loading state while data is being loaded
  if (isDataLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section5-form">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Section 5: Other Names Used
          </h2>
          <p className="text-gray-600">
            Loading section data...
          </p>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section5-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 5: Other Names Used
        </h2>
        <p className="text-gray-600">
          Provide all other names you have used, including maiden names, nicknames, aliases, or other names
          you have gone by professionally or legally.
        </p>
      </div>

      {/* Other Names Used Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Has Other Names Radio Buttons */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Have you used any other names? <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-6">
            <div className="flex items-center">
              <input
                type="radio"
                id="hasOtherNames-yes"
                checked={getHasOtherNamesValue() === true}
                onChange={() => handleHasOtherNamesChange(true)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                data-testid="has-other-names-yes"
              />
              <label htmlFor="hasOtherNames-yes" className="ml-2 block text-sm text-gray-700">
                Yes
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="hasOtherNames-no"
                checked={getHasOtherNamesValue() === false}
                onChange={() => handleHasOtherNamesChange(false)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                data-testid="has-other-names-no"
              />
              <label htmlFor="hasOtherNames-no" className="ml-2 block text-sm text-gray-700">
                No
              </label>
            </div>
          </div>
          {errors['section5.hasOtherNames'] && (
            <p className="mt-1 text-sm text-red-600">
              {errors['section5.hasOtherNames']}
            </p>
          )}
        </div>



        {/* Other Names Entries */}
        {getHasOtherNamesValue() && (
          <div className="other-names-entries">
            {Array.from({ length: getEntryCount() }).map((_, index) => renderOtherNameEntry(index))}

            {/* Add Entry Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => addOtherNameEntry('addAnotherNameButton')}
                disabled={!canAddMoreEntries()}
                className={`flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${canAddMoreEntries()
                    ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500'
                    : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                  }`}
                data-testid="add-other-name-button"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Another Name ({getEntryCount()}/{MAX_OTHER_NAME_ENTRIES})
              </button>

              {/* Show message when at maximum */}
              {!canAddMoreEntries() && (
                <p className="mt-2 text-sm text-gray-500">
                  Maximum of {MAX_OTHER_NAME_ENTRIES} other names allowed.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
         
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
     
      </form>
      

      {/* Debug Information (Development Only) */}
      {typeof window !== 'undefined' && window.location.search.includes('debug=true') && (
        <details className="mt-6 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Section 5 Data (Structured Format - Preferred):</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(section5Data, null, 2)}
            </pre>

            <h4 className="text-xs font-medium text-gray-600 mt-4 mb-2">Section 5 Data (Flattened Format - ID Keys):</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify((() => {
                const flatFields: Record<string, any> = {};
                const addField = (field: any) => {
                  if (field && typeof field === 'object' && 'id' in field && 'value' in field) {
                    flatFields[field.id] = field;
                  }
                };

                // Flatten main flag field with defensive programming
                if (section5Data?.section5?.hasOtherNames) {
                  addField(section5Data.section5.hasOtherNames);
                }

                // Flatten entries with defensive programming
                if (section5Data?.section5?.otherNames && Array.isArray(section5Data.section5.otherNames)) {
                  section5Data.section5.otherNames.forEach((entry) => {
                    Object.entries(entry).forEach(([_, field]) => {
                      addField(field);
                    });
                  });
                }

                return flatFields;
              })(), null, 2)}
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

export default Section5Component;