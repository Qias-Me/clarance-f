/**
 * Section 7: Your Contact Information - Component
 *
 * React component for SF-86 Section 7 using the new Form Architecture 2.0.
 * This component handles collection of contact information including phone
 * numbers, email addresses, and social media accounts.
 */

import React, { useEffect, useState } from 'react';
import { useSection7 } from '~/state/contexts/sections2.0/section7';
import { useSF86Form } from '~/state/contexts/SF86FormContext';

interface Section7ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section7Component: React.FC<Section7ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  const {
    section7Data,
    updatePhoneNumber,
    addPhoneNumber,
    removePhoneNumber,
    phoneNumbers,
    updateHomeEmail,
    updateWorkEmail,
    addEmailAddress,
    removeEmailAddress,
    emailAddresses,
    updateSocialMedia,
    addSocialMedia,
    removeSocialMedia,
    socialMedia,
    validateSection,
    resetSection,
    isDirty,
    errors
  } = useSection7();

  // SF86Form context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section7Data, phoneNumbers, emailAddresses, socialMedia]); // Removed validateSection and onValidationChange to prevent infinite loops

  // Handle form submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        // Update the central form context with Section 7 data
        sf86Form.updateSectionData('section7', section7Data);

        // Save the form data to persistence layer
        await sf86Form.saveForm();

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section7');

        console.log('✅ Section 7 data saved successfully:', section7Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('❌ Failed to save Section 7 data:', error);
        // Could show an error message to user here
      }
    }
  };



  // Render a general phone number entry (dynamic)
  const renderPhoneEntry = (phone: any, index: number) => {
    return (
      <div key={`phone-${index}`} className="border rounded-lg p-4 mb-4 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">Phone #{index + 1}</h4>
          {phoneNumbers.length > 1 && (
            <button
              type="button"
              onClick={() => removePhoneNumber(index)}
              className="text-red-500 hover:text-red-700"
              aria-label={`Remove phone ${index + 1}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Phone Number */}
          <div>
            <label
              htmlFor={`phone-number-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id={`phone-number-${index}`}
              data-testid={`phone-number-${index}`}
              value={phone.number?.value || ''}
              onChange={(e) => updatePhoneNumber(index, 'number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(123) 456-7890"
              required
            />
            {errors[`phoneNumbers[${index}].number`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`phoneNumbers[${index}].number`]}</p>
            )}
          </div>

          {/* Extension */}
          <div>
            <label
              htmlFor={`phone-extension-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Extension
            </label>
            <input
              type="text"
              id={`phone-extension-${index}`}
              data-testid={`phone-extension-${index}`}
              value={phone.extension?.value || ''}
              onChange={(e) => updatePhoneNumber(index, 'extension', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1234"
            />
          </div>
        </div>

        {/* Time preferences and international */}
        <div className="mt-4 space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={phone.dayTime?.value || false}
              onChange={(e) => updatePhoneNumber(index, 'dayTime', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Day time</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={phone.nightTime?.value || false}
              onChange={(e) => updatePhoneNumber(index, 'nightTime', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Night time</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={phone.isInternational?.value || false}
              onChange={(e) => updatePhoneNumber(index, 'isInternational', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">International or DSN phone number</span>
          </label>
        </div>
      </div>
    );
  };




  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section7-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 7: Your Contact Information
        </h2>
        <p className="text-gray-600">
          Provide your contact information including phone numbers, email addresses, and social media accounts.
        </p>
      </div>

      {/* Contact Information Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Fixed Email Fields Section */}
        <div className="border rounded-lg p-5 bg-blue-50">
          <h3 className="text-lg font-semibold mb-4">Primary Email Addresses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home Email Address
              </label>
              <input
                type="email"
                value={section7Data.section7.homeEmail.value || ''}
                onChange={(e) => updateHomeEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="home@example.com"
              />
              {errors['section7.homeEmail'] && (
                <p className="mt-1 text-sm text-red-600">{errors['section7.homeEmail']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Email Address
              </label>
              <input
                type="email"
                value={section7Data.section7.workEmail.value || ''}
                onChange={(e) => updateWorkEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="work@example.com"
              />
              {errors['section7.workEmail'] && (
                <p className="mt-1 text-sm text-red-600">{errors['section7.workEmail']}</p>
              )}
            </div>
          </div>
        </div>

        {/* Phone Numbers Section */}
        <div className="border rounded-lg p-5 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Phone Numbers</h3>
            <button
              type="button"
              onClick={addPhoneNumber}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm"
              data-testid="add-phone-button"
            >
              Add Phone
            </button>
          </div>

          {phoneNumbers && phoneNumbers.length > 0 ? (
            <div className="space-y-4">
              {phoneNumbers.map((phone, index) => renderPhoneEntry(phone, index))}
            </div>
          ) : (
            <p className="italic text-gray-500 mb-4">No phone numbers available.</p>
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

      </form>


    </div>
  );
};

export default Section7Component;