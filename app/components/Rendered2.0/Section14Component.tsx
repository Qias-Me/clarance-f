/**
 * Section 14: Selective Service Component
 *
 * React component for SF-86 Section 14 (Selective Service) using the new Form Architecture 2.0.
 * This component provides a user interface for entering selective service registration information
 * following the complete established patterns from other section components.
 */

import React, { useEffect, useState } from 'react';
import { useSection14 } from '~/state/contexts/sections2.0/section14';
import { useSF86Form } from '~/state/contexts/sections2.0/SF86FormContext';
import { BORN_MALE_AFTER_1959_OPTIONS, REGISTRATION_STATUS_OPTIONS } from '../../../api/interfaces/section-interfaces/section14';

interface Section14ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section14Component: React.FC<Section14ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  // console.log('🔄 Section14Component: Component rendering...');

  // Section 14 Context
  const {
    section14Data,
    errors,
    isDirty,
    updateBornMaleAfter1959,
    updateRegistrationStatus,
    updateRegistrationNumber,
    updateExplanation,
    validateSection,
    resetSection,
    getActiveExplanationField
  } = useSection14();

  // console.log('🔍 Section14Component: section14Data=', section14Data);
  // console.log('🔍 Section14Component: isDirty=', isDirty);

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  const { bornMaleAfter1959, registrationStatus, registrationNumber, noRegistrationExplanation, unknownStatusExplanation } = section14Data.section14;
  const activeExplanationField = getActiveExplanationField();

  // console.log('🔍 Section14Component: Field values=', {
  //   bornMaleAfter1959: bornMaleAfter1959.value,
  //   registrationStatus: registrationStatus.value,
  //   registrationNumber: registrationNumber.value,
  //   noRegistrationExplanation: noRegistrationExplanation.value,
  //   unknownStatusExplanation: unknownStatusExplanation.value
  // });

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section14Data, onValidationChange, validateSection]);

  // Handle form submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        // console.log('🔄 Section 14: Starting data synchronization...');

        // Update the central form context with Section 14 data
        sf86Form.updateSectionData('section14', section14Data);

        // console.log('✅ Section 14: Data synchronization complete, proceeding to save...');

        // Get the current form data and update it with section14 data for immediate saving
        const currentFormData = sf86Form.exportForm();
        const updatedFormData = { ...currentFormData, section14: section14Data };

        // Save the form data to persistence layer with the updated data
        await sf86Form.saveForm(updatedFormData);

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section14');

        // console.log('✅ Section 14 data saved successfully:', section14Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        // console.error('❌ Failed to save Section 14 data:', error);
        // Could show an error message to user here
      }
    }
  };

  // Reset function
  const handleReset = () => {
    resetSection();
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section14-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 14: Selective Service
        </h2>
        <p className="text-gray-600">
          Provide information about your Selective Service registration status and military service history.
        </p>
      </div>

      {/* Selective Service Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Born Male After 1959 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Were you born a male after December 31, 1959? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {BORN_MALE_AFTER_1959_OPTIONS.map((option) => (
              <label key={option} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="bornMaleAfter1959"
                  value={option}
                  checked={bornMaleAfter1959.value === option}
                  onChange={(e) => {
                    // console.log(`🔍 Section14Component: Born male after 1959 changed to: ${e.target.value}`);
                    updateBornMaleAfter1959(e.target.value);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  data-testid={`born-male-after-1959-${option.toLowerCase()}`}
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {errors.bornMaleAfter1959 && (
            <p className="mt-1 text-sm text-red-600">{errors.bornMaleAfter1959}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            If NO, proceed to Section 15.
          </p>
        </div>

        {/* Registration Status - Only show if born male after 1959 */}
        {bornMaleAfter1959.value === 'YES' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Have you registered with the Selective Service System (SSS)? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {REGISTRATION_STATUS_OPTIONS.map((option) => (
                <label key={option} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="registrationStatus"
                    value={option}
                    checked={registrationStatus.value === option}
                    onChange={(e) => {
                      // console.log(`🔍 Section14Component: Registration status changed to: ${e.target.value}`);
                      updateRegistrationStatus(e.target.value);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    data-testid={`registration-status-${option.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.selectiveService && (
              <p className="mt-1 text-sm text-red-600">{errors.selectiveService}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              The Selective Service website, <a href="https://www.sss.gov" className="text-blue-600 underline">www.sss.gov</a>, can help provide the registration number for persons who have registered. Note: Selective Service Number is not your Social Security Number.
            </p>
          </div>
        )}

        {/* Conditional Fields Based on Registration Status - Only show if born male after 1959 */}
        {bornMaleAfter1959.value === 'YES' && activeExplanationField === 'registrationNumber' && (
          <div>
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Registration Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="registrationNumber"
              value={registrationNumber.value}
              onChange={(e) => {
                // console.log(`🔍 Section14Component: Registration number changed to: ${e.target.value}`);
                updateRegistrationNumber(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your Selective Service registration number"
              data-testid="registration-number-input"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter your complete Selective Service registration number as it appears on your documentation.
            </p>
          </div>
        )}

        {bornMaleAfter1959.value === 'YES' && activeExplanationField === 'noRegistrationExplanation' && (
          <div>
            <label htmlFor="noRegistrationExplanation" className="block text-sm font-medium text-gray-700 mb-2">
              Explanation for Non-Registration <span className="text-red-500">*</span>
            </label>
            <textarea
              id="noRegistrationExplanation"
              value={noRegistrationExplanation.value}
              onChange={(e) => {
                // console.log(`🔍 Section14Component: No registration explanation changed to: ${e.target.value}`);
                updateExplanation('no', e.target.value);
              }}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please explain why you are not registered with the Selective Service..."
              data-testid="no-registration-explanation"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Provide a detailed explanation for why you are not registered with the Selective Service System.
            </p>
          </div>
        )}

        {bornMaleAfter1959.value === 'YES' && activeExplanationField === 'unknownStatusExplanation' && (
          <div>
            <label htmlFor="unknownStatusExplanation" className="block text-sm font-medium text-gray-700 mb-2">
              Explanation for Unknown Status <span className="text-red-500">*</span>
            </label>
            <textarea
              id="unknownStatusExplanation"
              value={unknownStatusExplanation.value}
              onChange={(e) => {
                // console.log(`🔍 Section14Component: Unknown status explanation changed to: ${e.target.value}`);
                updateExplanation('unknown', e.target.value);
              }}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please explain why you don't know your Selective Service registration status..."
              data-testid="unknown-status-explanation"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Provide a detailed explanation for why you don't know your Selective Service registration status.
            </p>
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

        {/* Validation Status */}
     

        {/* Section Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Section Summary</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div>Born Male After 1959: {bornMaleAfter1959.value || 'Not selected'}</div>
            {bornMaleAfter1959.value === 'YES' && (
              <div>Registration Status: {registrationStatus.value || 'Not selected'}</div>
            )}
            {bornMaleAfter1959.value === 'YES' && activeExplanationField === 'registrationNumber' && (
              <div>Registration Number: {registrationNumber.value || 'Not provided'}</div>
            )}
            {bornMaleAfter1959.value === 'YES' && activeExplanationField === 'noRegistrationExplanation' && (
              <div>Explanation: {noRegistrationExplanation.value ? 'Provided' : 'Not provided'}</div>
            )}
            {bornMaleAfter1959.value === 'YES' && activeExplanationField === 'unknownStatusExplanation' && (
              <div>Explanation: {unknownStatusExplanation.value ? 'Provided' : 'Not provided'}</div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Section14Component;