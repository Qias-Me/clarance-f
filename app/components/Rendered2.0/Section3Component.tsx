/**
 * Section 3: Place of Birth - Component
 *
 * React component for SF-86 Section 3 using the new Form Architecture 2.0.
 * This component handles collection of place of birth information including
 * country, state, city, and county of birth.
 */

import React, { useEffect, useState } from 'react';
import { useSection3 } from '~/state/contexts/sections2.0/section3';
import { useSF86Form } from '~/state/contexts/sections2.0/SF86FormContext';
import { getCountryOptions, getUSStateOptions } from '../../../api/interfaces/sections2.0/base';

interface Section3ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section3Component: React.FC<Section3ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  // Section 3 Context
  const {
    section3Data,
    updateFieldValue,
    validateSection,
    resetSection,
    isDirty,
    errors
  } = useSection3();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section3Data]);

  // Handle field updates with correct structure
  const handleFieldChange = (fieldPath: string, value: string) => {
    updateFieldValue(`section3.${fieldPath}`, value);
  };

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    // console.log('🔍 Section 3 validation result:', result);
    // console.log('📊 Section 3 data before submission:', section3Data);

    if (result.isValid) {
      try {
        // console.log('🔄 Section 3: Starting data synchronization...');

        // Update the central form context with Section 3 data
        sf86Form.updateSectionData('section3', section3Data);

        // console.log('✅ Section 3: Data synchronization complete, proceeding to save...');

        // Get the current form data and update it with section3 data for immediate saving
        const currentFormData = sf86Form.exportForm();
        const updatedFormData = { ...currentFormData, section3: section3Data };

        // Save the form data to persistence layer with the updated data
        await sf86Form.saveForm(updatedFormData);

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section3');

        // console.log('✅ Section 3 data saved successfully:', section3Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        // console.error('❌ Failed to save Section 3 data:', error);
        // Show an error message to user
        // console.log('There was an error saving your information. Please try again.');
      }
    }
  };


  // Reset function
  const handleReset = () => {
    resetSection();
  };

  // Get field value safely
  const getFieldValue = (fieldPath: string): string => {
    // Access section3Data correctly using the structure from the interface
    if (fieldPath === 'city') {
      return section3Data.section3.city?.value || '';
    } else if (fieldPath === 'county') {
      return section3Data.section3.county?.value || '';
    } else if (fieldPath === 'country') {
      return section3Data.section3.country?.value || '';
    } else if (fieldPath === 'state') {
      return section3Data.section3.state?.value || '';
    }
    return '';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section3-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 3: Place of Birth
        </h2>
        <p className="text-gray-600">
          Provide information about your place of birth including country, state, city, and county.
        </p>
      </div>

      {/* Place of Birth Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Country */}
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Country <span className="text-red-500">*</span>
          </label>
          <select
            id="country"
            data-testid="country-field"
            value={getFieldValue('country')}
            onChange={(e) => handleFieldChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {getCountryOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Select the country where you were born.
          </p>
          {errors['section3.country'] && (
            <p className="mt-1 text-sm text-red-600">{errors['section3.country']}</p>
          )}
        </div>

        {/* State (only show if US is selected) */}
        {getFieldValue('country') === 'United States' && (
          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              State <span className="text-red-500">*</span>
            </label>
            <select
              id="state"
              data-testid="state-field"
              value={getFieldValue('state')}
              onChange={(e) => handleFieldChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {getUSStateOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value || option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select the state where you were born.
            </p>
            {errors['section3.state'] && (
              <p className="mt-1 text-sm text-red-600">{errors['section3.state']}</p>
            )}
          </div>
        )}

        {/* City */}
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="city"
            data-testid="city-field"
            value={getFieldValue('city')}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter city of birth"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter the city where you were born.
          </p>
          {errors['section3.city'] && (
            <p className="mt-1 text-sm text-red-600">{errors['section3.city']}</p>
          )}
        </div>

        {/* County */}
        <div>
          <label
            htmlFor="county"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            County
          </label>
          <input
            type="text"
            id="county"
            data-testid="county-field"
            value={getFieldValue('county')}
            onChange={(e) => handleFieldChange('county', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter county of birth (if applicable)"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter the county where you were born, if applicable.
          </p>
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
              onClick={handleReset}
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
            <h4 className="text-xs font-medium text-gray-600 mb-2">Section 3 Data:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(section3Data, null, 2)}
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

export default Section3Component;
