/**
 * Section 4: Social Security Number - Component
 *
 * React component for SF-86 Section 4 using the new Form Architecture 2.0.
 * This component handles collection of Social Security Number information
 * with just 3 fields: SSN, Not Applicable checkbox, and Acknowledgement radio.
 */

import React, { useEffect, useState } from 'react';
import { useSection4 } from '~/state/contexts/sections2.0/section4';
import { useSF86Form } from '~/state/contexts/SF86FormContext';

interface Section4ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section4Component: React.FC<Section4ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  const {
    section4Data,
    updateSSN,
    toggleNotApplicable,
    updateAcknowledgement,
    validateSection,
    resetSection,
    isDirty,
    errors
  } = useSection4();

    // SF86 Form Context for data persistence
    const sf86Form = useSF86Form();
  

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section4Data]);

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        // Update the central form context with Section 4 data
        sf86Form.updateSectionData('section4', section4Data);

        // Save the form data to persistence layer
        await sf86Form.saveForm();

        console.log('✅ Section 4 data saved successfully:', section4Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('❌ Failed to save Section 4 data:', error);
        // Could show an error message to user here
      }
    }
  };

  // Handle SSN input change
  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSSN(e.target.value);
  };

  // Handle not applicable checkbox
  const handleNotApplicableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    toggleNotApplicable(e.target.checked);
  };

  // Handle acknowledgement radio button
  const handleAcknowledgementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAcknowledgement(e.target.value as 'YES' | 'NO');
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section4-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 4: Social Security Number
        </h2>
        <p className="text-gray-600">
          Provide your Social Security Number information.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

             {/* 3. Acknowledgement Radio Buttons */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="text-lg font-semibold mb-3">Acknowledgement</h3>
          <p className="text-sm text-gray-700 mb-3">
            I understand that providing false information may result in criminal penalties.
          </p>
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="acknowledgement"
                value="YES"
                checked={section4Data.section4.Acknowledgement.value === 'YES'}
                onChange={handleAcknowledgementChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                data-testid="acknowledgement-yes"
              />
              <span className="text-sm text-gray-700">Yes, I acknowledge</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="acknowledgement"
                value="NO"
                checked={section4Data.section4.Acknowledgement.value === 'NO'}
                onChange={handleAcknowledgementChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                data-testid="acknowledgement-no"
              />
              <span className="text-sm text-gray-700">No, I do not acknowledge</span>
            </label>
          </div>
        </div>

        {/* 1. SSN Field */}
        <div>
          <label
            htmlFor="ssn-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Social Security Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="ssn-input"
            data-testid="ssn-input"
            value={section4Data.section4.ssn[0]?.value?.value}
            onChange={handleSSNChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="XXXXXXXXX"
            maxLength={9}
            required={!section4Data.section4.notApplicable.value}
          />
          {errors['section4.ssn'] && (
            <p className="mt-1 text-sm text-red-600">{errors['section4.ssn']}</p>
          )}
        </div>

        {/* 2. Not Applicable Checkbox */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={section4Data.section4.notApplicable.value }
              onChange={handleNotApplicableChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              data-testid="not-applicable-checkbox"
            />
            <span className="text-base font-medium text-gray-700">
              Not Applicable (I do not have a Social Security Number)
            </span>
          </label>
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
            Section Status: <span className={`font-medium ${isDirty ? 'text-orange-500' : 'text-green-500'}`}>
              {isDirty ? 'Modified, needs validation' : 'Ready for input'}
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
            <h4 className="text-xs font-medium text-gray-600 mb-2">Section 4 Data:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(section4Data, null, 2)}
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

export default Section4Component;
