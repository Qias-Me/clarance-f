/**
 * Section 30: General Remarks (Continuation Sheets) - Component
 *
 * React component for SF-86 Section 30 using the new Form Architecture 2.0.
 * This component handles collection of continuation sheet information for
 * extended answers that don't fit in the regular form sections.
 */

import React, { useEffect, useState } from 'react';
import { useSection30 } from '~/state/contexts/sections2.0/section30';
import { useSF86Form } from '~/state/contexts/sections2.0/SF86FormContext';

interface Section30ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section30Component: React.FC<Section30ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  // Section 30 Context (Continuation Sheets)
  const {
    section30Data,
    updateFieldValue,
    validateSection,
    resetSection,
    isDirty,
    errors
  } = useSection30();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section30Data]);

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    // console.log('🔍 Section 30 validation result:', result);
    // console.log('📊 Section 30 data before submission:', section30Data);

    if (result.isValid) {
      try {
        // console.log('🔄 Section 30: Starting data synchronization...');

        // Update the central form context with Section 30 data
        sf86Form.updateSectionData('section30', section30Data);

        // console.log('✅ Section 30: Data synchronization complete, proceeding to save...');

        // Get the current form data and update it with section30 data for immediate saving
        const currentFormData = sf86Form.exportForm();
        const updatedFormData = { ...currentFormData, section30: section30Data };

        // Save the form data to persistence layer with the updated data
        await sf86Form.saveForm(updatedFormData);

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section30');

        // console.log('✅ Section 30 data saved successfully:', section30Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        // console.error('❌ Failed to save Section 30 data:', error);
        // Show an error message to user
        // console.log('There was an error saving your information. Please try again.');
      }
    }
  };



  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section30-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 30: General Remarks (Continuation Sheets)
        </h2>
        <p className="text-gray-600">
          Use this section to continue answers that don't fit in the regular form sections.
          Include your name and SSN at the top of each continuation sheet.
        </p>
      </div>

      {/* Continuation Sheets Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Continuation Sheet Content */}
        <div className="border rounded-lg p-5 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Continuation Sheet</h3>
          <p className="text-sm text-gray-600 mb-4">
            Use this space to continue answers that don't fit in the regular form sections.
          </p>

          {/* Continuation Text Area */}
          <div className="mb-6">
            <label
              htmlFor="continuation-content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Continuation Content
            </label>
            <textarea
              id="continuation-content"
              data-testid="continuation-content"
              value={section30Data.section30?.continuationSheet?.value || ''}
              onChange={(e) => updateFieldValue('section30.continuationSheet.value', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={8}
              placeholder="Use the space below to continue answers or provide additional information. Include your name and SSN at the top. Before each answer, identify the number of the item and attempt to maintain sequential order and question format."
            />
          </div>
        </div>

        {/* Personal Information */}
        <div className="border rounded-lg p-5 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <p className="text-sm text-gray-600 mb-4">
            Please provide your personal information for the continuation sheet.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                data-testid="fullName"
                value={section30Data.section30?.personalInfo?.fullName?.value || ''}
                onChange={(e) => updateFieldValue('section30.personalInfo.fullName.value', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="dateSigned"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date Signed <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dateSigned"
                data-testid="dateSigned"
                value={section30Data.section30?.personalInfo?.dateSigned?.value || ''}
                onChange={(e) => updateFieldValue('section30.personalInfo.dateSigned.value', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="otherNames"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Other Names Used
              </label>
              <input
                type="text"
                id="otherNames"
                data-testid="otherNames"
                value={section30Data.section30?.personalInfo?.otherNamesUsed?.value || ''}
                onChange={(e) => updateFieldValue('section30.personalInfo.otherNamesUsed.value', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter other names used"
              />
            </div>

            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                data-testid="dateOfBirth"
                value={section30Data.section30?.personalInfo?.dateOfBirth?.value || ''}
                onChange={(e) => updateFieldValue('section30.personalInfo.dateOfBirth.value', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-800 mb-2">Current Address</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="street"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Street Address
                </label>
                <input
                  type="text"
                  id="street"
                  data-testid="street"
                  value={section30Data.section30?.personalInfo?.currentAddress?.street?.value || ''}
                  onChange={(e) => updateFieldValue('section30.personalInfo.currentAddress.street.value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter street address"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  data-testid="city"
                  value={section30Data.section30?.personalInfo?.currentAddress?.city?.value || ''}
                  onChange={(e) => updateFieldValue('section30.personalInfo.currentAddress.city.value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  data-testid="state"
                  value={section30Data.section30?.personalInfo?.currentAddress?.state?.value || ''}
                  onChange={(e) => updateFieldValue('section30.personalInfo.currentAddress.state.value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label
                  htmlFor="zipCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  data-testid="zipCode"
                  value={section30Data.section30?.personalInfo?.currentAddress?.zipCode?.value || ''}
                  onChange={(e) => updateFieldValue('section30.personalInfo.currentAddress.zipCode.value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Telephone Number
            </label>
            <input
              type="tel"
              id="phone"
              data-testid="phone"
              value={section30Data.section30?.personalInfo?.currentAddress?.telephoneNumber?.value || ''}
              onChange={(e) => updateFieldValue('section30.personalInfo.currentAddress.telephoneNumber.value', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(XXX) XXX-XXXX"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {isDirty && <span className="text-orange-600">● Unsaved changes</span>}
            {Object.keys(errors).length > 0 && (
              <span className="text-red-600 ml-2">
                {Object.keys(errors).length} validation error(s)
              </span>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={resetSection}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              data-testid="reset-button"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={!isValid}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isValid
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              data-testid="submit-button"
            >
              Save & Continue
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Section30Component;
