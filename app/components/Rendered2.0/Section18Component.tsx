/**
 * Section 18: Relatives - Component (REDESIGNED)
 *
 * React component for SF-86 Section 18 using the new Form Architecture 2.0.
 * This component handles the actual PDF form structure with 6 relative entries
 * and subsections 18.1-18.5.
 */

import React, { useEffect, useState } from 'react';
import { useSection18 } from '~/state/contexts/sections2.0/Section18';
import { useSF86Form } from '~/state/contexts/SF86FormContext';
import type {
  RelativeEntry,
  Section18SubsectionKey
} from '../../../api/interfaces/sections2.0/Section18';
import { SECTION18_OPTIONS } from '~/state/contexts/sections2.0/section18-field-generator';
import Section18_2Component from './sections/Section18_2';
import Section18_3Component from './sections/Section18_3';
import { Section18_5Component } from './sections/Section18_5';

// Maximum number of relatives allowed (as per PDF form structure)
const MAX_RELATIVES = 6;

interface Section18ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section18Component: React.FC<Section18ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  // Section 18 Context (REDESIGNED)
  const {
    section18Data,
    relatives,
    // relativeTypes, // DEPRECATED: Now handled per entry
    addRelative,
    updateRelative,
    removeRelative,
    duplicateRelative,
    getRelativeByEntryNumber,
    updateSubsection,
    getSubsectionData,
    updateField,
    updateFieldValue,
    getFieldValue,
    // updateRelativeTypeSelection, // DEPRECATED: Now handled per entry
    validate,
    validateEntry,
    validationErrors,
    isComplete,
    resetSection
  } = useSection18();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Component state
  const [isValid, setIsValid] = useState(false);
  const [activeRelativeIndex, setActiveRelativeIndex] = useState(0);
  const [activeSubsection, setActiveSubsection] = useState<Section18SubsectionKey>('section18_1');
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validate();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section18Data, validate, onValidationChange]);

  // Helper function to get field value safely
  const getFieldValueSafe = (relative: RelativeEntry, subsection: Section18SubsectionKey, fieldPath: string) => {
    try {
      return getFieldValue(fieldPath, relative.entryNumber, subsection) || '';
    } catch (error) {
      console.warn(`Failed to get field value for ${fieldPath}:`, error);
      return '';
    }
  };

  // Helper function to handle field updates
  const handleFieldUpdate = (relative: RelativeEntry, subsection: Section18SubsectionKey, fieldPath: string, value: any) => {
    try {
      updateFieldValue(relative.entryNumber, subsection, fieldPath, value);
      setIsDirty(true);
    } catch (error) {
      console.error(`Failed to update field ${fieldPath}:`, error);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationResult = validate();
    setShowValidationErrors(true);
    
    if (validationResult.isValid) {
      onNext?.();
    }
  };

  // DEPRECATED: Global relative type selection removed
  // Relative type selection now happens per entry in Section 18.1
  // Each relative has its own relativeType dropdown field

  // Render relative navigation tabs
  const renderRelativeNavigation = () => (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {relatives.map((relative, index) => (
          <button
            key={relative.entryNumber}
            onClick={() => setActiveRelativeIndex(index)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeRelativeIndex === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Entry #{relative.entryNumber}
            {getFieldValueSafe(relative, 'section18_1', 'fullName.firstName') && 
             ` - ${getFieldValueSafe(relative, 'section18_1', 'fullName.firstName')}`}
          </button>
        ))}
        {relatives.length < MAX_RELATIVES && (
          <button
            onClick={addRelative}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200"
            disabled={relatives.length >= MAX_RELATIVES}
          >
            + Add Relative ({relatives.length}/{MAX_RELATIVES})
          </button>
        )}
      </div>
    </div>
  );

  // Render subsection navigation
  const renderSubsectionNavigation = () => (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {(['section18_1', 'section18_2', 'section18_3', 'section18_4', 'section18_5'] as Section18SubsectionKey[]).map((subsection) => (
          <button
            key={subsection}
            onClick={() => setActiveSubsection(subsection)}
            className={`px-3 py-2 rounded text-sm font-medium ${
              activeSubsection === subsection
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {subsection.replace('section18_', '18.')}
          </button>
        ))}
      </div>
    </div>
  );

  // Render basic form fields for Section 18.1
  const renderSection18_1 = (relative: RelativeEntry) => (
    <div className="space-y-4">
      <h4 className="text-md font-semibold">18.1 - Basic Information</h4>
      
      {/* Relative Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Relationship Type <span className="text-red-500">*</span>
        </label>
        <select
          value={getFieldValueSafe(relative, 'section18_1', 'relativeType')}
          onChange={(e) => handleFieldUpdate(relative, 'section18_1', 'relativeType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select relationship</option>
          {SECTION18_OPTIONS.RELATIVE_TYPES.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Full Name */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getFieldValueSafe(relative, 'section18_1', 'fullName.firstName')}
            onChange={(e) => handleFieldUpdate(relative, 'section18_1', 'fullName.firstName', e.target.value)}
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
            value={getFieldValueSafe(relative, 'section18_1', 'fullName.middleName')}
            onChange={(e) => handleFieldUpdate(relative, 'section18_1', 'fullName.middleName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getFieldValueSafe(relative, 'section18_1', 'fullName.lastName')}
            onChange={(e) => handleFieldUpdate(relative, 'section18_1', 'fullName.lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Date of Birth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Birth Month
          </label>
          <input
            type="text"
            placeholder="MM"
            value={getFieldValueSafe(relative, 'section18_1', 'dateOfBirth.month')}
            onChange={(e) => handleFieldUpdate(relative, 'section18_1', 'dateOfBirth.month', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Birth Year
          </label>
          <input
            type="text"
            placeholder="YYYY"
            value={getFieldValueSafe(relative, 'section18_1', 'dateOfBirth.year')}
            onChange={(e) => handleFieldUpdate(relative, 'section18_1', 'dateOfBirth.year', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Place of Birth */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Birth City
          </label>
          <input
            type="text"
            value={getFieldValueSafe(relative, 'section18_1', 'placeOfBirth.city')}
            onChange={(e) => handleFieldUpdate(relative, 'section18_1', 'placeOfBirth.city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Birth State
          </label>
          <select
            value={getFieldValueSafe(relative, 'section18_1', 'placeOfBirth.state')}
            onChange={(e) => handleFieldUpdate(relative, 'section18_1', 'placeOfBirth.state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select state</option>
            {SECTION18_OPTIONS.STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Birth Country
          </label>
          <select
            value={getFieldValueSafe(relative, 'section18_1', 'placeOfBirth.country')}
            onChange={(e) => handleFieldUpdate(relative, 'section18_1', 'placeOfBirth.country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select country</option>
            {SECTION18_OPTIONS.COUNTRIES.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Other Names Section */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h5 className="text-md font-semibold text-gray-800 mb-4">
          Other Names Used
        </h5>
        <p className="text-sm text-gray-600 mb-4">
          Provide other names used and the period of time that your relative used them
          (such as maiden name by a former marriage, former name, alias, or nickname).
        </p>

        {/* Not Applicable Checkbox */}
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={getFieldValueSafe(relative, 'section18_1', 'otherNames.0.isApplicable') || false}
              onChange={(e) => {
                // Update all other name entries' isApplicable flag
                for (let i = 0; i < 4; i++) {
                  handleFieldUpdate(relative, 'section18_1', `otherNames.${i}.isApplicable`, e.target.checked);
                }
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Not applicable (no other names used)
            </span>
          </label>
        </div>

        {/* Other Names Entries */}
        {!getFieldValueSafe(relative, 'section18_1', 'otherNames.0.isApplicable') && (
          <div className="space-y-8">
            {[1, 2, 3, 4].map((otherNameIndex) => (
              <div key={otherNameIndex} className="p-4 bg-white rounded-lg border border-gray-200">
                <h6 className="text-sm font-medium text-gray-800 mb-4">
                  Other Name #{otherNameIndex}
                </h6>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={getFieldValueSafe(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.fullName.firstName`) || ''}
                      onChange={(e) => handleFieldUpdate(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.fullName.firstName`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={getFieldValueSafe(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.fullName.middleName`) || ''}
                      onChange={(e) => handleFieldUpdate(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.fullName.middleName`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter middle name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={getFieldValueSafe(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.fullName.lastName`) || ''}
                      onChange={(e) => handleFieldUpdate(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.fullName.lastName`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Suffix
                    </label>
                    <select
                      value={getFieldValueSafe(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.fullName.suffix`) || ''}
                      onChange={(e) => handleFieldUpdate(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.fullName.suffix`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select suffix</option>
                      {SECTION18_OPTIONS.SUFFIX.map(suffix => (
                        <option key={suffix} value={suffix}>{suffix}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Time Period Used */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From (Month/Year)
                    </label>
                    <input
                      type="text"
                      value={getFieldValueSafe(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.timeUsed.from.month`) || ''}
                      onChange={(e) => handleFieldUpdate(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.timeUsed.from.month`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="MM/YYYY"
                    />
                    <div className="mt-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={getFieldValueSafe(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.timeUsed.from.isEstimated`) || false}
                          onChange={(e) => handleFieldUpdate(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.timeUsed.from.isEstimated`, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Estimated</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To (Month/Year)
                    </label>
                    <input
                      type="text"
                      value={getFieldValueSafe(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.timeUsed.to.month`) || ''}
                      onChange={(e) => handleFieldUpdate(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.timeUsed.to.month`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="MM/YYYY"
                    />
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={getFieldValueSafe(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.timeUsed.to.isEstimated`) || false}
                          onChange={(e) => handleFieldUpdate(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.timeUsed.to.isEstimated`, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Estimated</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={getFieldValueSafe(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.timeUsed.isPresent`) || false}
                          onChange={(e) => handleFieldUpdate(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.timeUsed.isPresent`, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Present (still using)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Reason for Change */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Name Change
                  </label>
                  <textarea
                    value={getFieldValueSafe(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.reasonForChange`) || ''}
                    onChange={(e) => handleFieldUpdate(relative, 'section18_1', `otherNames.${otherNameIndex - 1}.reasonForChange`, e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide the reason(s) why the name changed"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Not Applicable Message */}
        {getFieldValueSafe(relative, 'section18_1', 'otherNames.0.isApplicable') && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              No other names have been used by this relative.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Render placeholder for other subsections
  const renderOtherSubsections = (_relative: RelativeEntry, subsection: Section18SubsectionKey) => (
    <div className="space-y-4">
      <h4 className="text-md font-semibold">
        {subsection.replace('section18_', '18.')} - {
          subsection === 'section18_2' ? 'Current Address' :
          subsection === 'section18_3' ? 'Citizenship Documentation' :
          subsection === 'section18_4' ? 'Non-US Citizen Documentation' :
          subsection === 'section18_5' ? 'Contact Information' : 'Unknown'
        }
      </h4>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">
          This subsection will be implemented with the specific fields for {subsection}.
          The structure is now in place to support all 964 fields from the PDF form.
        </p>
      </div>
    </div>
  );

  // Get current relative
  const currentRelative = relatives[activeRelativeIndex];

  return (
    <div className={`section18-component ${className}`}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Section 18: Relatives
          </h2>
          <p className="text-gray-600">
            Provide information about your relatives. You can add up to 6 relatives with detailed information for each.
          </p>
        </div>

        {/* Relative Type Selection - Now handled per entry in Section 18.1 */}

        {/* Relative Navigation */}
        {relatives.length > 0 && renderRelativeNavigation()}

        {/* Current Relative Form */}
        {currentRelative && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Entry #{currentRelative.entryNumber}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => duplicateRelative(currentRelative.entryNumber)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => removeRelative(currentRelative.entryNumber)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Subsection Navigation */}
            {renderSubsectionNavigation()}

            {/* Subsection Content */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {activeSubsection === 'section18_1' && renderSection18_1(currentRelative)}
              {activeSubsection === 'section18_2' && (
                <Section18_2Component
                  relative={currentRelative}
                  onFieldUpdate={(fieldPath, value) => handleFieldUpdate(currentRelative, 'section18_2', fieldPath, value)}
                />
              )}
              {activeSubsection === 'section18_3' && (
                <Section18_3Component
                  relative={currentRelative}
                  onFieldUpdate={(fieldPath, value) => handleFieldUpdate(currentRelative, 'section18_3', fieldPath, value)}
                />
              )}
              {activeSubsection === 'section18_5' && (
                <Section18_5Component
                  relative={currentRelative}
                  onFieldUpdate={(fieldPath, value) => handleFieldUpdate(currentRelative, 'section18_5', fieldPath, value)}
                />
              )}
              {activeSubsection === 'section18_4' && renderOtherSubsections(currentRelative, activeSubsection)}

              {/* Validation Errors */}
              {showValidationErrors && validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetSection}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Reset Section
                </button>
                <div className="flex space-x-3">
                  <span className={`text-sm ${isComplete ? 'text-green-600' : 'text-gray-500'}`}>
                    {isComplete ? '✓ Section Complete' : 'Section Incomplete'}
                  </span>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* No Relatives Message */}
        {relatives.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No relatives added yet. You can add up to {MAX_RELATIVES} relatives.</p>
            <button
              onClick={addRelative}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add First Relative
            </button>
          </div>
        )}

        {/* Maximum Entries Warning */}
        {relatives.length >= MAX_RELATIVES && (
          <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Maximum number of relatives ({MAX_RELATIVES}) reached. Remove an existing relative to add a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section18Component;
