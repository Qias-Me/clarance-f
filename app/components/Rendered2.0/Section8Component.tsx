/**
 * Section 8: U.S. Passport Information - Component
 *
 * React component for SF-86 Section 8 using the new Form Architecture 2.0.
 * This component handles collection of U.S. passport information including
 * passport number, name, issue date, and expiration date.
 */

import React, { useEffect, useState } from 'react';
import { useSection8 } from '~/state/contexts/sections2.0/section8';
import { useSF86Form } from '~/state/contexts/sections2.0/SF86FormContext';
import { getSuffixOptions } from '../../../api/interfaces/section-interfaces/base';

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
    errors,
    commitDraft
  } = useSection8();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();


  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section8Data]); // Removed validateSection and onValidationChange to prevent infinite loops

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    // console.log('🔍 Section 8 validation result:', result);
    // console.log('📊 Section 8 data before submission:', section8Data);

    if (result.isValid) {
      try {
        // console.log('🔄 Section 8: Starting data synchronization...');

        // Update the central form context with Section 8 data
        sf86Form.updateSectionData('section8', section8Data);

        // console.log('✅ Section 8: Data synchronization complete, proceeding to save...');

        // Get the current form data and update it with section8 data for immediate saving
        const currentFormData = sf86Form.exportForm();
        const updatedFormData = { ...currentFormData, section8: section8Data };

        // Save the form data to persistence layer with the updated data
        await sf86Form.saveForm(updatedFormData);

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section8');

        // console.log('✅ Section 8 data saved successfully:', section8Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        // console.error('❌ Failed to save Section 8 data:', error);
        // Show an error message to user
        // console.log('There was an error saving your information. Please try again.');
      }
    }
  };


  // Handle passport flag change (radio button)
  const handlePassportFlagChange = (value: 'YES' | 'NO') => {
    updatePassportFlag(value);
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
        {/* Passport Flag - Radio Buttons */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Do you have a U.S. passport (current or expired)? <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-6">
            <div className="flex items-center">
              <input
                type="radio"
                id="hasPassport-yes"
                name="hasPassport"
                value="YES"
                checked={section8Data.section8.hasPassport.value === 'YES'}
                onChange={() => handlePassportFlagChange('YES')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                data-testid="passport-flag-yes"
              />
              <label htmlFor="hasPassport-yes" className="ml-2 block text-sm text-gray-700">
                Yes
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="hasPassport-no"
                name="hasPassport"
                value="NO"
                checked={section8Data.section8.hasPassport.value === 'NO'}
                onChange={() => handlePassportFlagChange('NO')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                data-testid="passport-flag-no"
              />
              <label htmlFor="hasPassport-no" className="ml-2 block text-sm text-gray-700">
                No
              </label>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            If you don't have a passport, proceed to Section 9
          </p>
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
                <select
                  id="passport-suffix"
                  data-testid="passport-suffix-select"
                  value={section8Data.section8.nameOnPassport.suffix.value || ''}
                  onChange={(e) => updatePassportName('suffix', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {getSuffixOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      data-testid="passport-issue-date-estimated"
                      checked={section8Data.section8.dates.issueDate.estimated.value || false}
                      onChange={(e) => updatePassportDate('issueDate', section8Data.section8.dates.issueDate.date.value, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-600">Estimated</span>
                  </label>
                </div>
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
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      data-testid="passport-expiration-date-estimated"
                      checked={section8Data.section8.dates.expirationDate.estimated.value || false}
                      onChange={(e) => updatePassportDate('expirationDate', section8Data.section8.dates.expirationDate.date.value, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-600">Estimated</span>
                  </label>
                </div>
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

    
      </form>


    </div>
  );
};

export default Section8Component;