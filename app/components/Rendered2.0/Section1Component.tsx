/**
 * Section 1: Information About You - Component
 *
 * React component for SF-86 Section 1 using the new Form Architecture 2.0.
 * This component handles collection of personal identification information including
 * full legal name (last name, first name, middle name, suffix).
 */

import React, { useEffect, useState } from 'react';
import { useSection1 } from '~/state/contexts/sections2.0/section1';
import { useSF86Form } from '~/state/contexts/sections2.0/SF86FormContext';
import { getSuffixOptions } from '../../../api/interfaces/sections2.0/base';

interface Section1ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section1Component: React.FC<Section1ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  // Section 1 Context
  const {
    section1Data,
    updateFullName,
    validateSection,
    resetSection,
    isDirty,
    errors
  } = useSection1();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section1Data]);

  // Handle field updates with correct structure
  const handleFieldChange = (fieldPath: string, value: string) => {
    updateFullName({ fieldPath: `section1.${fieldPath}`, newValue: value });
  };

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    // console.log('🔍 Section 1 validation result:', result);
    // console.log('📊 Section 1 data before submission:', section1Data);

    if (result.isValid) {
      try {
        // console.log('🔄 Section 1: Starting data synchronization...');

        // Update the central form context with Section 1 data
        sf86Form.updateSectionData('section1', section1Data);

        // console.log('✅ Section 1: Data synchronization complete, proceeding to save...');

        // Get the current form data and update it with section1 data for immediate saving
        const currentFormData = sf86Form.exportForm();
        const updatedFormData = { ...currentFormData, section1: section1Data };

        // Save the form data to persistence layer with the updated data
        await sf86Form.saveForm(updatedFormData);

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section1');

        // console.log('✅ Section 1 data saved successfully:', section1Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        // console.error('❌ Failed to save Section 1 data:', error);
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
    // Access section1Data correctly using the structure from the interface
    if (fieldPath === 'lastName') {
      return section1Data.section1.lastName.value || '';
    } else if (fieldPath === 'firstName') {
      return section1Data.section1.firstName.value || '';
    } else if (fieldPath === 'middleName') {
      return section1Data.section1.middleName.value || '';
    } else if (fieldPath === 'suffix') {
      return section1Data.section1.suffix.value || '';
    }
    return '';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section1-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 1: Information About You
        </h2>
        <p className="text-gray-600">
          Provide your full legal name as it appears on official documents.
        </p>
      </div>

      {/* Personal Information Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            data-testid="last-name-field"
            value={getFieldValue('lastName')}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your last name"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter your last name exactly as it appears on your birth certificate or passport.
          </p>
          {errors['section1.lastName'] && (
            <p className="mt-1 text-sm text-red-600">{errors['section1.lastName']}</p>
          )}
        </div>

        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            data-testid="first-name-field"
            value={getFieldValue('firstName')}
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your first name"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter your first name exactly as it appears on your birth certificate or passport.
          </p>
          {errors['section1.firstName'] && (
            <p className="mt-1 text-sm text-red-600">{errors['section1.firstName']}</p>
          )}
        </div>

        {/* Middle Name */}
        <div>
          <label
            htmlFor="middleName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Middle Name
          </label>
          <input
            type="text"
            id="middleName"
            data-testid="middle-name-field"
            value={getFieldValue('middleName')}
            onChange={(e) => handleFieldChange('middleName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your middle name (if applicable)"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter your middle name if you have one. Leave blank if not applicable.
          </p>
        </div>

        {/* Suffix */}
        <div>
          <label
            htmlFor="suffix"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Suffix
          </label>
          <select
            id="suffix"
            data-testid="suffix-field"
            value={getFieldValue('suffix')}
            onChange={(e) => handleFieldChange('suffix', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {getSuffixOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Select your name suffix if applicable (Jr., Sr., II, III, etc.).
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

   
      </form>

      {/* Debug Information (Development Only) */}
      {typeof window !== 'undefined' && window.location.search.includes('debug=true') && (
        <details className="mt-6 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Section 1 Data:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(section1Data, null, 2)}
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

export default Section1Component;
