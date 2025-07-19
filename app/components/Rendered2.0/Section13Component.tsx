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
    updateField,
    validateSection,
    resetSection,
    isDirty,
    errors,
    // Employment Entry Management
    addMilitaryEmploymentEntry,
    removeMilitaryEmploymentEntry,
    updateMilitaryEmploymentEntry,
    addNonFederalEmploymentEntry,
    removeNonFederalEmploymentEntry,
    updateNonFederalEmploymentEntry,
    addSelfEmploymentEntry,
    removeSelfEmploymentEntry,
    updateSelfEmploymentEntry,
    addUnemploymentEntry,
    removeUnemploymentEntry,
    updateUnemploymentEntry,
    getEmploymentEntryCount
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
  const handleFieldChange = (fieldPath: string, value: any) => {
    updateField(`section13.${fieldPath}.value`, value);
  };

  // Handle employment entry field updates
  const handleEmploymentEntryFieldChange = (entryType: string, entryId: string, fieldPath: string, value: any) => {
    switch (entryType) {
      case 'militaryEmployment':
        updateMilitaryEmploymentEntry(entryId, `${fieldPath}.value`, value);
        break;
      case 'nonFederalEmployment':
        updateNonFederalEmploymentEntry(entryId, `${fieldPath}.value`, value);
        break;
      case 'selfEmployment':
        updateSelfEmploymentEntry(entryId, `${fieldPath}.value`, value);
        break;
      case 'unemployment':
        updateUnemploymentEntry(entryId, `${fieldPath}.value`, value);
        break;
    }
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

        {/* Employment Entries Section */}
        {getFieldValue('hasEmployment') === 'YES' && (
          <div className="space-y-8 border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Employment History</h3>

            {/* Military/Federal Employment */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Military/Federal Employment ({getEmploymentEntryCount('militaryEmployment')})
                </h4>
                <button
                  type="button"
                  onClick={addMilitaryEmploymentEntry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Entry
                </button>
              </div>

              {section13Data.section13.militaryEmployment?.entries?.map((entry, index) => (
                <div key={entry._id} className="border border-gray-100 rounded-md p-4 mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-gray-800">Entry {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeMilitaryEmploymentEntry(entry._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employer Name
                      </label>
                      <input
                        type="text"
                        value={entry.employerName?.value || ''}
                        onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'employerName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter employer name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position Title
                      </label>
                      <input
                        type="text"
                        value={entry.positionTitle?.value || ''}
                        onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'positionTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter position title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={entry.employmentDates?.fromDate?.value || ''}
                        onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'employmentDates.fromDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={entry.employmentDates?.toDate?.value || ''}
                        onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'employmentDates.toDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={entry.employmentDates?.present?.value}
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={entry.employmentDates?.present?.value || false}
                        onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'employmentDates.present', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Present (current employment)</span>
                    </label>
                  </div>
                </div>
              ))}

              {getEmploymentEntryCount('militaryEmployment') === 0 && (
                <p className="text-gray-500 text-center py-4">No military/federal employment entries added yet.</p>
              )}
            </div>

            {/* Non-Federal Employment */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Non-Federal Employment ({getEmploymentEntryCount('nonFederalEmployment')})
                </h4>
                <button
                  type="button"
                  onClick={addNonFederalEmploymentEntry}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Add Entry
                </button>
              </div>

              {section13Data.section13.nonFederalEmployment?.entries?.map((entry, index) => (
                <div key={entry._id} className="border border-gray-100 rounded-md p-4 mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-gray-800">Entry {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeNonFederalEmploymentEntry(entry._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Basic Employment Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Employer Name
                        </label>
                        <input
                          type="text"
                          value={entry.employerName?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employerName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter employer name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Position Title
                        </label>
                        <input
                          type="text"
                          value={entry.positionTitle?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'positionTitle', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter position title"
                        />
                      </div>
                    </div>

                    {/* Employment Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From Date
                        </label>
                        <input
                          type="date"
                          value={entry.employmentDates?.fromDate?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employmentDates.fromDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          To Date
                        </label>
                        <input
                          type="date"
                          value={entry.employmentDates?.toDate?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employmentDates.toDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Present Employment Checkbox */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`present-${entry._id}`}
                        checked={entry.employmentDates?.present?.value || false}
                        onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employmentDates.present', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`present-${entry._id}`} className="ml-2 block text-sm text-gray-700">
                        Present (current employment)
                      </label>
                    </div>

                    {/* Supervisor Information */}
                    <div className="border-t pt-4">
                      <h6 className="text-sm font-medium text-gray-800 mb-3">Supervisor Information</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Supervisor Name
                          </label>
                          <input
                            type="text"
                            value={entry.supervisor?.name?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'supervisor.name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter supervisor name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Supervisor Title
                          </label>
                          <input
                            type="text"
                            value={entry.supervisor?.title?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'supervisor.title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter supervisor title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Supervisor Phone
                          </label>
                          <input
                            type="tel"
                            value={entry.supervisor?.phone?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'supervisor.phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter supervisor phone"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Supervisor Email
                          </label>
                          <input
                            type="email"
                            value={entry.supervisor?.email?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'supervisor.email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter supervisor email"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Employer Address */}
                    <div className="border-t pt-4">
                      <h6 className="text-sm font-medium text-gray-800 mb-3">Employer Address</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={entry.employerAddress?.street?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employerAddress.street', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter street address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={entry.employerAddress?.city?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employerAddress.city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter city"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            value={entry.employerAddress?.state?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employerAddress.state', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter state"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            value={entry.employerAddress?.zipCode?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employerAddress.zipCode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter ZIP code"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            value={entry.employerAddress?.country?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employerAddress.country', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter country"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {getEmploymentEntryCount('nonFederalEmployment') === 0 && (
                <p className="text-gray-500 text-center py-4">No non-federal employment entries added yet.</p>
              )}
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
