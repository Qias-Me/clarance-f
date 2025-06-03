/**
 * Section 30: General Remarks (Continuation Sheets) - Component
 *
 * React component for SF-86 Section 30 using the new Form Architecture 2.0.
 * This component handles collection of continuation sheet information for
 * extended answers that don't fit in the regular form sections.
 */

import React, { useEffect, useState } from 'react';
import { useSection30 } from '~/state/contexts/sections2.0/section30';
import { useSF86Form } from '~/state/contexts/SF86FormContext';

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
    updateHasContinuationSheets,
    addContinuationEntry,
    removeContinuationEntry,
    updateFieldValue,
    getContinuationEntryCount,
    getContinuationEntry,
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

  // Handle submission with data persistence (following Section 1 gold standard pattern)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Section 30 form submission started');
    console.log('📊 Current Section 30 data:', section30Data);

    const result = validateSection();
    console.log('🔍 Section 30 validation result:', result);

    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        console.log('💾 Updating SF86FormContext with Section 30 data...');
        // Update the central form context with Section 30 data
        sf86Form.updateSectionData('section30', section30Data);

        console.log('💾 Saving form data to IndexedDB...');
        // Save the form data to persistence layer
        await sf86Form.saveForm();

        console.log('✅ Section 30 data saved successfully:', section30Data);

        // Proceed to next section if callback provided
        if (onNext) {
          console.log('➡️ Proceeding to next section...');
          onNext();
        }
      } catch (error) {
        console.error('❌ Failed to save Section 30 data:', error);
        // Could show an error message to user here
      }
    } else {
      console.warn('⚠️ Section 30 validation failed:', result.errors);
    }
  };

  // Render a continuation entry
  const renderContinuationEntry = (entry: any, index: number) => {
    if (!entry) return null;

    return (
      <div key={`continuation-${index}`} className="border rounded-lg p-4 mb-4 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">Continuation Sheet #{index + 1}</h4>
          <button
            type="button"
            onClick={() => removeContinuationEntry(index)}
            className="text-red-500 hover:text-red-700"
            aria-label={`Remove continuation sheet ${index + 1}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Remarks Text Area */}
        <div className="mb-4">
          <label
            htmlFor={`remarks-${index}`}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Continuation Remarks <span className="text-red-500">*</span>
          </label>
          <textarea
            id={`remarks-${index}`}
            data-testid={`remarks-${index}`}
            value={entry.remarks?.value || ''}
            onChange={(e) => updateFieldValue(`section30.entries[${index}].remarks.value`, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={6}
            placeholder="Use the space below to continue answers or a blank sheet(s) of paper. Include your name and SSN at the top of each blank sheet(s). Before each answer, identify the number of the item and attempt to maintain sequential order and question format."
            required
          />
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor={`fullName-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={`fullName-${index}`}
              data-testid={`fullName-${index}`}
              value={entry.personalInfo?.fullName?.value || ''}
              onChange={(e) => updateFieldValue(`section30.entries[${index}].personalInfo.fullName.value`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label
              htmlFor={`dateSigned-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Date Signed <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id={`dateSigned-${index}`}
              data-testid={`dateSigned-${index}`}
              value={entry.personalInfo?.dateSigned?.value || ''}
              onChange={(e) => updateFieldValue(`section30.entries[${index}].personalInfo.dateSigned.value`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor={`otherNames-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Other Names Used
            </label>
            <input
              type="text"
              id={`otherNames-${index}`}
              data-testid={`otherNames-${index}`}
              value={entry.personalInfo?.otherNamesUsed?.value || ''}
              onChange={(e) => updateFieldValue(`section30.entries[${index}].personalInfo.otherNamesUsed.value`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter other names used"
            />
          </div>

          <div>
            <label
              htmlFor={`dateOfBirth-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id={`dateOfBirth-${index}`}
              data-testid={`dateOfBirth-${index}`}
              value={entry.personalInfo?.dateOfBirth?.value || ''}
              onChange={(e) => updateFieldValue(`section30.entries[${index}].personalInfo.dateOfBirth.value`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="mb-4">
          <h5 className="text-md font-medium text-gray-800 mb-2">Current Address</h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor={`street-${index}`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Street Address
              </label>
              <input
                type="text"
                id={`street-${index}`}
                data-testid={`street-${index}`}
                value={entry.personalInfo?.currentAddress?.street?.value || ''}
                onChange={(e) => updateFieldValue(`section30.entries[${index}].personalInfo.currentAddress.street.value`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter street address"
              />
            </div>

            <div>
              <label
                htmlFor={`city-${index}`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                City
              </label>
              <input
                type="text"
                id={`city-${index}`}
                data-testid={`city-${index}`}
                value={entry.personalInfo?.currentAddress?.city?.value || ''}
                onChange={(e) => updateFieldValue(`section30.entries[${index}].personalInfo.currentAddress.city.value`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label
                htmlFor={`state-${index}`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                State
              </label>
              <input
                type="text"
                id={`state-${index}`}
                data-testid={`state-${index}`}
                value={entry.personalInfo?.currentAddress?.state?.value || ''}
                onChange={(e) => updateFieldValue(`section30.entries[${index}].personalInfo.currentAddress.state.value`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter state"
              />
            </div>

            <div>
              <label
                htmlFor={`zipCode-${index}`}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ZIP Code
              </label>
              <input
                type="text"
                id={`zipCode-${index}`}
                data-testid={`zipCode-${index}`}
                value={entry.personalInfo?.currentAddress?.zipCode?.value || ''}
                onChange={(e) => updateFieldValue(`section30.entries[${index}].personalInfo.currentAddress.zipCode.value`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter ZIP code"
              />
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div className="mb-4">
          <label
            htmlFor={`phone-${index}`}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Telephone Number
          </label>
          <input
            type="tel"
            id={`phone-${index}`}
            data-testid={`phone-${index}`}
            value={entry.personalInfo?.currentAddress?.telephoneNumber?.value || ''}
            onChange={(e) => updateFieldValue(`section30.entries[${index}].personalInfo.currentAddress.telephoneNumber.value`, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="(XXX) XXX-XXXX"
          />
        </div>
      </div>
    );
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
        {/* Has Continuation Sheets Question */}
        <div className="border rounded-lg p-5 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Do you need continuation sheets?</h3>

          <div className="mb-4">
            <label className="flex items-center space-x-3 mb-4">
              <input
                type="radio"
                name="hasContinuationSheets"
                value="YES"
                checked={section30Data.section30?.hasContinuationSheets?.value === 'YES'}
                onChange={() => updateHasContinuationSheets('YES')}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                data-testid="continuation-sheets-yes"
              />
              <span className="text-sm font-medium text-gray-700">
                Yes, I need continuation sheets for extended answers
              </span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="hasContinuationSheets"
                value="NO"
                checked={section30Data.section30?.hasContinuationSheets?.value === 'NO'}
                onChange={() => updateHasContinuationSheets('NO')}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                data-testid="continuation-sheets-no"
              />
              <span className="text-sm font-medium text-gray-700">
                No, I do not need continuation sheets
              </span>
            </label>
          </div>
        </div>

        {/* Continuation Entries */}
        {section30Data.section30?.hasContinuationSheets?.value === 'YES' && (
          <div className="border rounded-lg p-5 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Continuation Sheets</h3>

            {getContinuationEntryCount() > 0 ? (
              <div className="mb-4">
                {Array.from({ length: getContinuationEntryCount() }).map((_, index) =>
                  renderContinuationEntry(getContinuationEntry(index), index)
                )}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">No continuation sheets added yet.</p>
            )}

            <button
              type="button"
              onClick={() => addContinuationEntry()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              data-testid="add-continuation-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Continuation Sheet
            </button>
          </div>
        )}

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
