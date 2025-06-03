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
import type { CurrentSpouseEntry, FormerSpouseEntry, CohabitantEntry } from '../../../api/interfaces/sections2.0/section17';
import {
  MARITAL_STATUS_OPTIONS,
  YES_NO_OPTIONS,
  DOCUMENT_TYPE_OPTIONS
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
  // Section 17 Context
  const {
    section17Data,
    updateCurrentSpouse,
    addCurrentSpouse,
    removeCurrentSpouse,
    updateFormerSpouse,
    addFormerSpouse,
    removeFormerSpouse,
    updateCohabitant,
    addCohabitant,
    removeCohabitant,
    validateSection,
    resetSection,
    isDirty,
    errors
  } = useSection17();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Component state
  const [isValid, setIsValid] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'former' | 'cohabitant'>('current');
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    console.log('🔄 Section17Component: useEffect triggered - section17Data changed');
    console.log('📊 Section17Component: Current spouse count:', section17Data.section17.currentSpouse.length);

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

  // Current Spouse Form Component
  const CurrentSpouseForm: React.FC<{ entry: CurrentSpouseEntry; index: number }> = ({ entry, index }) => (
    <div className="bg-gray-50 p-6 rounded-lg mb-6">
      <h4 className="font-semibold text-lg mb-4">Current Spouse/Partner Information</h4>

      {/* Marital Status */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Marital Status <span className="text-red-500">*</span>
        </label>
        <select
          value={getFieldValue(entry, 'maritalStatus')}
          onChange={(e) => updateCurrentSpouse(`maritalStatus.value`, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select marital status</option>
          {MARITAL_STATUS_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {hasFieldError('maritalStatus') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('maritalStatus')}</p>
        )}
      </div>

      {/* Show spouse fields only if married, separated, etc. */}
      {entry.maritalStatus.value && entry.maritalStatus.value !== 'Never married' && (
        <>
          {/* Has Spouse/Partner */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Do you have a spouse or legally recognized civil union/domestic partner?
            </label>
            <div className="flex space-x-4">
              {YES_NO_OPTIONS.map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name={`hasSpousePartner_${index}`}
                    value={option}
                    checked={getFieldValue(entry, 'hasSpousePartner') === option}
                    onChange={(e) => updateCurrentSpouse(`hasSpousePartner.value`, e.target.value)}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Show detailed spouse information if YES */}
          {getFieldValue(entry, 'hasSpousePartner') === 'YES' && (
            <>
              {/* Full Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={getFieldValue(entry, 'fullName.lastName')}
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
                    value={getFieldValue(entry, 'fullName.firstName')}
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
                    value={getFieldValue(entry, 'fullName.middleName')}
                    onChange={(e) => updateCurrentSpouse(`fullName.middleName.value`, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suffix
                  </label>
                  <input
                    type="text"
                    value={getFieldValue(entry, 'fullName.suffix')}
                    onChange={(e) => updateCurrentSpouse(`fullName.suffix.value`, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Jr., Sr., III, etc."
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birth Month <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={getFieldValue(entry, 'dateOfBirth.month')}
                    onChange={(e) => updateCurrentSpouse(`dateOfBirth.month.value`, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Month</option>
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birth Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={getFieldValue(entry, 'dateOfBirth.year')}
                    onChange={(e) => updateCurrentSpouse(`dateOfBirth.year.value`, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="YYYY"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={getFieldValue(entry, 'dateOfBirth.estimated') === 'true'}
                      onChange={(e) => updateCurrentSpouse(`dateOfBirth.estimated.value`, e.target.checked)}
                      className="mr-2"
                    />
                    Estimated
                  </label>
                </div>
              </div>

              {/* Citizenship */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Citizenship <span className="text-red-500">*</span>
                </label>
                <select
                  value={getFieldValue(entry, 'citizenship')}
                  onChange={(e) => updateCurrentSpouse(`citizenship.value`, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select citizenship</option>
                  {CITIZENSHIP_OPTIONS.map(option => (
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
                  value={getFieldValue(entry, 'ssn')}
                  onChange={(e) => updateCurrentSpouse(`ssn.value`, e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="123-45-6789"
                  maxLength={9}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter 9 digits only (no dashes or spaces)
                </p>
              </div>

              {/* Marriage Date (if married) */}
              {entry.maritalStatus.value === 'Married' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marriage Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={getFieldValue(entry, 'marriageDate')}
                      onChange={(e) => updateCurrentSpouse(`marriageDate.value`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="MM/DD/YYYY"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={getFieldValue(entry, 'marriageEstimated') === 'true'}
                        onChange={(e) => updateCurrentSpouse(`marriageEstimated.value`, e.target.checked)}
                        className="mr-2"
                      />
                      Estimated
                    </label>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );

  // Former Spouse Form Component (simplified for brevity)
  const FormerSpouseForm: React.FC<{ entry: FormerSpouseEntry; index: number }> = ({ entry, index }) => (
    <div className="bg-gray-50 p-6 rounded-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-lg">Former Spouse #{index + 1}</h4>
        <button
          type="button"
          onClick={() => removeFormerSpouse(index)}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Remove
        </button>
      </div>

      {/* Has Former Spouse */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Have you been married before?
        </label>
        <div className="flex space-x-4">
          {YES_NO_OPTIONS.map(option => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                name={`hasFormerSpouse_${index}`}
                value={option}
                checked={getFieldValue(entry, 'hasFormerSpouse') === option}
                onChange={(e) => updateFormerSpouse(index, `hasFormerSpouse.value`, e.target.value)}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      {/* Show former spouse details if YES */}
      {getFieldValue(entry, 'hasFormerSpouse') === 'YES' && (
        <>
          {/* Full Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={getFieldValue(entry, 'fullName.lastName')}
                onChange={(e) => updateFormerSpouse(index, `fullName.lastName.value`, e.target.value)}
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
                value={getFieldValue(entry, 'fullName.firstName')}
                onChange={(e) => updateFormerSpouse(index, `fullName.firstName.value`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* End of Marriage */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for end of marriage <span className="text-red-500">*</span>
            </label>
            <select
              value={getFieldValue(entry, 'reasonForEnd')}
              onChange={(e) => updateFormerSpouse(index, `reasonForEnd.value`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select reason</option>
              {END_OF_MARRIAGE_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </>
      )}
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

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'current', label: 'Current Status', count: section17Data.section17.currentSpouse.length },
            { id: 'former', label: 'Former Spouses', count: section17Data.section17.formerSpouses.length },
            { id: 'cohabitant', label: 'Cohabitants', count: section17Data.section17.cohabitants.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Spouse Tab */}
        {activeTab === 'current' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Current Marital Status</h3>
              <p className="text-sm text-gray-600">
                Provide information about your current marital status and spouse/partner if applicable.
              </p>
            </div>

            {section17Data.section17.currentSpouse.map((entry, index) => (
              <CurrentSpouseForm key={index} entry={entry} index={index} />
            ))}

            {section17Data.section17.currentSpouse.length === 0 && (
              <button
                type="button"
                onClick={addCurrentSpouse}
                className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
              >
                + Add Current Marital Status Information
              </button>
            )}
          </div>
        )}

        {/* Former Spouses Tab */}
        {activeTab === 'former' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Former Spouses</h3>
              <p className="text-sm text-gray-600">
                List all former spouses, including information about marriages that ended in divorce, annulment, or death.
              </p>
            </div>

            {section17Data.section17.formerSpouses.map((entry, index: number) => (
              <FormerSpouseForm key={index} entry={entry} index={index} />
            ))}

            <button
              type="button"
              onClick={addFormerSpouse}
              className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
            >
              + Add Former Spouse
            </button>
          </div>
        )}

        {/* Cohabitants Tab */}
        {activeTab === 'cohabitant' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Cohabitants</h3>
              <p className="text-sm text-gray-600">
                List any persons with whom you have cohabited in a relationship similar to marriage.
              </p>
            </div>

            {section17Data.section17.cohabitants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No cohabitants added yet.</p>
                <button
                  type="button"
                  onClick={addCohabitant}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  + Add Cohabitant
                </button>
              </div>
            ) : (
              <>
                {section17Data.section17.cohabitants.map((entry, index: number) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-lg">Cohabitant #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeCohabitant(index)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    {/* Simplified cohabitant form for brevity */}
                    <p className="text-sm text-gray-600">Cohabitant form fields would go here...</p>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCohabitant}
                  className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
                >
                  + Add Another Cohabitant
                </button>
              </>
            )}
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