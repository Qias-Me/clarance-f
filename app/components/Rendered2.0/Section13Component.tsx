/**
 * Section 13: Employment Activities - Component
 *
 * React component for SF-86 Section 13 using the new Form Architecture 2.0.
 * This component handles collection of employment history information including
 * employment status, gaps, and explanations.
 */

import React, { useEffect, useState } from 'react';
import { useSection13 } from '~/state/contexts/sections2.0/section13';
import { useSF86Form } from '~/state/contexts/sections2.0/SF86FormContext';

interface Section13ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section13Component: React.FC<Section13ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  // Section 13 Context
  const {
    section13Data,
    updateFieldValue,
    validateSection,
    resetSection,
    isDirty,
    errors
  } = useSection13();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section13Data]);

  // Handle field updates with correct structure
  const handleFieldChange = (fieldPath: string, value: string) => {
    updateFieldValue(`section13.${fieldPath}`, value);
  };

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    // console.log('🔍 Section 13 validation result:', result);
    // console.log('📊 Section 13 data before submission:', section13Data);

    if (result.isValid) {
      try {
        // console.log('🔄 Section 13: Starting data synchronization...');

        // Update the central form context with Section 13 data
        sf86Form.updateSectionData('section13', section13Data);

        // console.log('✅ Section 13: Data synchronization complete, proceeding to save...');

        // Get the current form data and update it with section13 data for immediate saving
        const currentFormData = sf86Form.exportForm();
        const updatedFormData = { ...currentFormData, section13: section13Data };

        // Save the form data to persistence layer with the updated data
        await sf86Form.saveForm(updatedFormData);

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section13');

        // console.log('✅ Section 13 data saved successfully:', section13Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        // console.error('❌ Failed to save Section 13 data:', error);
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
    // Access section13Data correctly using the structure from the interface
    if (fieldPath === 'hasEmployment') {
      return section13Data.section13?.hasEmployment?.value || 'NO';
    } else if (fieldPath === 'hasGaps') {
      return section13Data.section13?.hasGaps?.value || 'NO';
    } else if (fieldPath === 'gapExplanation') {
      return section13Data.section13?.gapExplanation?.value || '';
    }
    return '';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section13-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 13: Employment Activities
        </h2>
        <p className="text-gray-600">
          Provide information about your employment history and any gaps in employment.
        </p>
      </div>

      {/* Employment Information Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Has Employment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Do you have employment history to report? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasEmployment"
                value="YES"
                checked={getFieldValue('hasEmployment') === 'YES'}
                onChange={(e) => handleFieldChange('hasEmployment', e.target.value)}
                className="mr-2"
                required
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasEmployment"
                value="NO"
                checked={getFieldValue('hasEmployment') === 'NO'}
                onChange={(e) => handleFieldChange('hasEmployment', e.target.value)}
                className="mr-2"
                required
              />
              No
            </label>
          </div>
          {errors['hasEmployment'] && (
            <p className="mt-1 text-sm text-red-600">{errors['hasEmployment']}</p>
          )}
        </div>

        {/* Has Gaps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Do you have any gaps in your employment history? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasGaps"
                value="YES"
                checked={getFieldValue('hasGaps') === 'YES'}
                onChange={(e) => handleFieldChange('hasGaps', e.target.value)}
                className="mr-2"
                required
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasGaps"
                value="NO"
                checked={getFieldValue('hasGaps') === 'NO'}
                onChange={(e) => handleFieldChange('hasGaps', e.target.value)}
                className="mr-2"
                required
              />
              No
            </label>
          </div>
          {errors['hasGaps'] && (
            <p className="mt-1 text-sm text-red-600">{errors['hasGaps']}</p>
          )}
        </div>

        {/* Gap Explanation - Only show if has gaps */}
        {getFieldValue('hasGaps') === 'YES' && (
          <div>
            <label
              htmlFor="gapExplanation"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Please explain any gaps in your employment history <span className="text-red-500">*</span>
            </label>
            <textarea
              id="gapExplanation"
              data-testid="gap-explanation-field"
              value={getFieldValue('gapExplanation')}
              onChange={(e) => handleFieldChange('gapExplanation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide a detailed explanation for any gaps in your employment history"
              rows={4}
              required={getFieldValue('hasGaps') === 'YES'}
            />
            <p className="mt-1 text-xs text-gray-500">
              Provide a detailed explanation for any periods of unemployment or gaps in your employment history.
            </p>
            {errors['gapExplanation'] && (
              <p className="mt-1 text-sm text-red-600">{errors['gapExplanation']}</p>
            )}
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
            <h4 className="text-xs font-medium text-gray-600 mb-2">Section 13 Data:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(section13Data, null, 2)}
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

export default Section13Component;
