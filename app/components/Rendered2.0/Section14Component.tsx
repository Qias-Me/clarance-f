/**
 * Section 14: Selective Service Component
 *
 * React component for SF-86 Section 14 (Selective Service) using the new Form Architecture 2.0.
 * This component provides a user interface for entering selective service registration information
 * following the complete established patterns from other section components.
 */

import React, { useEffect, useState } from 'react';
import { useSection14 } from '~/state/contexts/sections2.0/section14';
import { useSF86Form } from '~/state/contexts/SF86FormContext';
import { REGISTRATION_STATUS_OPTIONS, MILITARY_SERVICE_OPTIONS } from '../../../api/interfaces/sections2.0/section14';

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
  // Section 14 Context
  const {
    section14Data,
    errors,
    isDirty,
    updateRegistrationStatus,
    updateRegistrationNumber,
    updateExplanation,
    updateMilitaryServiceStatus,
    validateSection,
    resetSection,
    getActiveExplanationField
  } = useSection14();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  const { registrationStatus, registrationNumber, noRegistrationExplanation, unknownStatusExplanation, militaryServiceStatus } = section14Data.section14;
  const activeExplanationField = getActiveExplanationField();

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
        // Update the central form context with Section 14 data
        sf86Form.updateSectionData('section14', section14Data);

        // Save the form data to persistence layer
        await sf86Form.saveForm();

        console.log('✅ Section 14 data saved successfully:', section14Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('❌ Failed to save Section 14 data:', error);
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

        {/* Registration Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Are you registered with the Selective Service System? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {REGISTRATION_STATUS_OPTIONS.map((option) => (
              <label key={option} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="registrationStatus"
                  value={option}
                  checked={registrationStatus.value === option}
                  onChange={(e) => updateRegistrationStatus(e.target.value)}
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
            All male U.S. citizens and male immigrants are required to register with the Selective Service within 30 days of their 18th birthday.
          </p>
        </div>

        {/* Conditional Fields Based on Registration Status */}
        {activeExplanationField === 'registrationNumber' && (
          <div>
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Registration Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="registrationNumber"
              value={registrationNumber.value}
              onChange={(e) => updateRegistrationNumber(e.target.value)}
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

        {activeExplanationField === 'noRegistrationExplanation' && (
          <div>
            <label htmlFor="noRegistrationExplanation" className="block text-sm font-medium text-gray-700 mb-2">
              Explanation for Non-Registration <span className="text-red-500">*</span>
            </label>
            <textarea
              id="noRegistrationExplanation"
              value={noRegistrationExplanation.value}
              onChange={(e) => updateExplanation('no', e.target.value)}
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

        {activeExplanationField === 'unknownStatusExplanation' && (
          <div>
            <label htmlFor="unknownStatusExplanation" className="block text-sm font-medium text-gray-700 mb-2">
              Explanation for Unknown Status <span className="text-red-500">*</span>
            </label>
            <textarea
              id="unknownStatusExplanation"
              value={unknownStatusExplanation.value}
              onChange={(e) => updateExplanation('unknown', e.target.value)}
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

        {/* Military Service Status */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="text-lg font-semibold mb-3">Military Service History</h3>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Have you ever served in the United States military? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {MILITARY_SERVICE_OPTIONS.map((option) => (
              <label key={option} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="militaryServiceStatus"
                  value={option}
                  checked={militaryServiceStatus.value === option}
                  onChange={(e) => updateMilitaryServiceStatus(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  data-testid={`military-service-${option.toLowerCase()}`}
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-600">
            This includes service in the Army, Navy, Air Force, Marines, Coast Guard, or National Guard.
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

        {/* Section Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Section Summary</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div>Registration Status: {registrationStatus.value || 'Not selected'}</div>
            {activeExplanationField === 'registrationNumber' && (
              <div>Registration Number: {registrationNumber.value || 'Not provided'}</div>
            )}
            {activeExplanationField === 'noRegistrationExplanation' && (
              <div>Explanation: {noRegistrationExplanation.value ? 'Provided' : 'Not provided'}</div>
            )}
            {activeExplanationField === 'unknownStatusExplanation' && (
              <div>Explanation: {unknownStatusExplanation.value ? 'Provided' : 'Not provided'}</div>
            )}
            <div>Military Service: {militaryServiceStatus.value || 'Not selected'}</div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Section14Component;