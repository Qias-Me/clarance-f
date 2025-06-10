/**
 * Section 17: Marital Status - Component
 *
 * React component for SF-86 Section 17 using the new Form Architecture 2.0.
 * This component handles comprehensive marital status information including
 * current spouse/partner, former spouses, and cohabitant information.
 */

import React, { useEffect, useState } from 'react';
import { useSection17 } from '~/state/contexts/sections2.0/section17';
import { useSF86Form } from '~/state/contexts/SF86FormContext';
import type {
  Section17_1_CurrentSpouse,
  Section17_1_2_FormerSpouse,
  Section17_3_Cohabitant
} from '../../../api/interfaces/sections2.0/section17';
import {
  MARITAL_STATUS_OPTIONS,
  YES_NO_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  COUNTRY_OPTIONS
} from '../../../api/interfaces/sections2.0/section17';

// Additional options not in the simplified interface
const CITIZENSHIP_OPTIONS = [
  'United States',
  'Dual citizenship',
  'Foreign citizen'
];

const END_OF_MARRIAGE_OPTIONS = [
  'Divorced/Dissolved',
  'Annulled',
  'Widowed',
  'Separated'
];

interface Section17ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section17Component: React.FC<Section17ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  // Section 17 Context - UPDATED for new 6-subsection structure
  const {
    section17Data,
    updateCurrentSpouse,
    updateFormerSpouse,
    updateAdditionalFormerSpouse,
    updateFormerSpouseContinuation,
    updateCohabitant,
    updateCohabitantContinuation,
    validateSection,
    resetSection,
    isDirty,
    errors
  } = useSection17();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Component state - UPDATED for 6 subsections
  const [isValid, setIsValid] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'former' | 'additional' | 'continuation' | 'cohabitant' | 'cohabitantContinuation'>('current');
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section17Data]);

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);

    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        sf86Form.updateSectionData('section17', section17Data);
        await sf86Form.saveForm();
        console.log('✅ Section 17 data saved successfully:', section17Data);

        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('❌ Failed to save Section 17 data:', error);
      }
    }
  };

  // Helper function to safely get field value
  const getFieldValue = (obj: any, path: string): string => {
    return path.split('.').reduce((current, key) => current?.[key]?.value || '', obj);
  };

  // Helper function to check if field has error
  const hasFieldError = (fieldPath: string): boolean => {
    return showValidationErrors && !!errors[fieldPath];
  };

  const getFieldError = (fieldPath: string): string => {
    return errors[fieldPath] || '';
  };

  // Current Spouse Form Component - UPDATED for new structure
  const CurrentSpouseForm: React.FC<{ entry: Section17_1_CurrentSpouse }> = ({ entry }) => (
    <div className="bg-gray-50 p-6 rounded-lg mb-6">
      <h4 className="font-semibold text-lg mb-4">Current Spouse/Partner Information</h4>

      {/* Has Spouse/Partner - Primary Question */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Do you have a spouse or legally recognized civil union/domestic partner? <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-4">
          {YES_NO_OPTIONS.map(option => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                name="hasSpousePartner"
                value={option}
                checked={entry.hasSpousePartner.value === option}
                onChange={(e) => updateCurrentSpouse(`hasSpousePartner.value`, e.target.value)}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      {/* Marriage Type Questions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Are you married?
          </label>
          <div className="flex space-x-4">
            {YES_NO_OPTIONS.map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="isMarried"
                  value={option}
                  checked={entry.isMarried.value === option}
                  onChange={(e) => updateCurrentSpouse(`isMarried.value`, e.target.value)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Are you in a civil union?
          </label>
          <div className="flex space-x-4">
            {YES_NO_OPTIONS.map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="isCivilUnion"
                  value={option}
                  checked={entry.isCivilUnion.value === option}
                  onChange={(e) => updateCurrentSpouse(`isCivilUnion.value`, e.target.value)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Other relationship?
          </label>
          <div className="flex space-x-4">
            {YES_NO_OPTIONS.map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="hasOtherRelationship"
                  value={option}
                  checked={entry.hasOtherRelationship.value === option}
                  onChange={(e) => updateCurrentSpouse(`hasOtherRelationship.value`, e.target.value)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Show detailed spouse information if YES */}
      {entry.hasSpousePartner.value === 'YES' && (
        <>
          {/* Full Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={entry.fullName.lastName.value || ''}
                onChange={(e) => updateCurrentSpouse(`fullName.lastName.value`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={entry.fullName.firstName.value || ''}
                onChange={(e) => updateCurrentSpouse(`fullName.firstName.value`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Middle Name
              </label>
              <input
                type="text"
                value={entry.fullName.middleName.value || ''}
                onChange={(e) => updateCurrentSpouse(`fullName.middleName.value`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suffix
              </label>
              <select
                value={entry.fullName.suffix.value || ''}
                onChange={(e) => updateCurrentSpouse(`fullName.suffix.value`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select suffix</option>
                {entry.fullName.suffix.options?.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={entry.dateOfBirth.value.value || ''}
                onChange={(e) => updateCurrentSpouse(`dateOfBirth.value.value`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={entry.dateOfBirth.estimated.value || false}
                  onChange={(e) => updateCurrentSpouse(`dateOfBirth.estimated.value`, e.target.checked)}
                  className="mr-2"
                />
                Estimated
              </label>
            </div>
          </div>

          {/* Place of Birth */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birth City
              </label>
              <input
                type="text"
                value={entry.placeOfBirth.city.value || ''}
                onChange={(e) => updateCurrentSpouse(`placeOfBirth.city.value`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birth State
              </label>
              <input
                type="text"
                value={entry.placeOfBirth.state.value || ''}
                onChange={(e) => updateCurrentSpouse(`placeOfBirth.state.value`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birth Country <span className="text-red-500">*</span>
              </label>
              <select
                value={entry.placeOfBirth.country.value || ''}
                onChange={(e) => updateCurrentSpouse(`placeOfBirth.country.value`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select country</option>
                {COUNTRY_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Citizenship */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Citizenship <span className="text-red-500">*</span>
            </label>
            <select
              value={entry.citizenship.value || ''}
              onChange={(e) => updateCurrentSpouse(`citizenship.value`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select citizenship</option>
              {COUNTRY_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* SSN */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Security Number
            </label>
            <input
              type="text"
              value={entry.ssn.value || ''}
              onChange={(e) => updateCurrentSpouse(`ssn.value`, e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="123-45-6789"
              maxLength={9}
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter 9 digits only (no dashes or spaces)
            </p>
          </div>

          {/* Marriage Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marriage Date
              </label>
              <input
                type="date"
                value={entry.marriageDate.value.value || ''}
                onChange={(e) => updateCurrentSpouse(`marriageDate.value.value`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={entry.marriageDate.estimated.value || false}
                  onChange={(e) => updateCurrentSpouse(`marriageDate.estimated.value`, e.target.checked)}
                  className="mr-2"
                />
                Estimated
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Simplified placeholder for other subsections
  const PlaceholderForm: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="bg-gray-50 p-6 rounded-lg mb-6">
      <h4 className="font-semibold text-lg mb-2">{title}</h4>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-blue-800 text-sm">
          This subsection is part of the new 6-subsection architecture and will be implemented in the next phase.
        </p>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section17-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 17: Marital Status
        </h2>
        <p className="text-gray-600">
          Provide information about your current marital status, any former spouses, and cohabitation history.
        </p>
      </div>

      {/* Tab Navigation - UPDATED for 6 subsections */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4 overflow-x-auto">
          {[
            { id: 'current', label: 'Current Spouse', page: 39 },
            { id: 'former', label: 'Former Spouse', page: 40 },
            { id: 'additional', label: 'Additional Former', page: 41 },
            { id: 'continuation', label: 'Former Continuation', page: 42 },
            { id: 'cohabitant', label: 'Cohabitant', page: 43 },
            { id: 'cohabitantContinuation', label: 'Cohabitant Cont.', page: 44 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} <span className="text-xs text-gray-400">(p{tab.page})</span>
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Spouse Tab - Section17_1[0] */}
        {activeTab === 'current' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Current Spouse/Partner (Page 39)</h3>
              <p className="text-sm text-gray-600">
                Section17_1[0] - Provide information about your current marital status and spouse/partner.
              </p>
            </div>
            <CurrentSpouseForm entry={section17Data.section17.currentSpouse} />
          </div>
        )}

        {/* Former Spouse Tab - Section17_1_2[0] */}
        {activeTab === 'former' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Former Spouse (Page 40)</h3>
              <p className="text-sm text-gray-600">
                Section17_1_2[0] - Information about former spouses.
              </p>
            </div>
            <PlaceholderForm
              title="Former Spouse Information"
              description="This subsection handles former spouse details including marriage and divorce information."
            />
          </div>
        )}

        {/* Additional Former Spouse Tab - Section17_2[0] */}
        {activeTab === 'additional' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Additional Former Spouse (Page 41)</h3>
              <p className="text-sm text-gray-600">
                Section17_2[0] - Additional former spouse information.
              </p>
            </div>
            <PlaceholderForm
              title="Additional Former Spouse"
              description="This subsection handles additional former spouse entries."
            />
          </div>
        )}

        {/* Former Spouse Continuation Tab - Section17_2_2[0] */}
        {activeTab === 'continuation' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Former Spouse Continuation (Page 42)</h3>
              <p className="text-sm text-gray-600">
                Section17_2_2[0] - Continuation of former spouse information.
              </p>
            </div>
            <PlaceholderForm
              title="Former Spouse Continuation"
              description="This subsection provides additional space for former spouse information."
            />
          </div>
        )}

        {/* Cohabitant Tab - Section17_3[0] */}
        {activeTab === 'cohabitant' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Cohabitant (Page 43)</h3>
              <p className="text-sm text-gray-600">
                Section17_3[0] - Cohabitation relationship information.
              </p>
            </div>
            <PlaceholderForm
              title="Cohabitant Information"
              description="This subsection handles cohabitation relationship details."
            />
          </div>
        )}

        {/* Cohabitant Continuation Tab - Section17_3_2[0] */}
        {activeTab === 'cohabitantContinuation' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Cohabitant Continuation (Page 44)</h3>
              <p className="text-sm text-gray-600">
                Section17_3_2[0] - Continuation of cohabitant information.
              </p>
            </div>
            <PlaceholderForm
              title="Cohabitant Continuation"
              description="This subsection provides additional space for cohabitant information."
            />
          </div>
        )}

        {/* Validation Errors Summary */}
        {showValidationErrors && !isValid && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">Please correct the following errors:</h4>
            <ul className="text-sm text-red-700 list-disc list-inside">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={resetSection}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Reset Section
          </button>

          <div className="flex space-x-4">
            <span className={`text-sm ${isDirty ? 'text-orange-600' : 'text-green-600'}`}>
              {isDirty ? 'Unsaved changes' : 'All changes saved'}
            </span>

            <button
              type="submit"
              className={`px-6 py-2 rounded-md font-medium ${
                isValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isValid}
            >
              Save & Continue
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Section17Component;