/**
 * Section 20: Foreign Activities Component
 *
 * This component follows the established data flow pattern:
 * User Input → handleFieldChange → updateFieldValue → Section Context → SF86FormContext → IndexedDB
 *
 * Features:
 * - Foreign financial interests subsection
 * - Foreign business activities subsection
 * - Foreign travel subsection
 * - Dynamic entry management
 * - Validation integration
 * - PDF generation compatibility
 */

import React, { useState, useCallback } from 'react';
import { useSection20 } from '../../state/contexts/sections2.0/section20';
import { useSF86Form } from '../../state/contexts/SF86FormContext';
import type {
  Section20,
  ForeignFinancialInterestEntry,
  ForeignBusinessEntry,
  ForeignTravelEntry
} from '../../../api/interfaces/sections2.0/section20';

// ============================================================================
// FOREIGN ACTIVITIES SUBSECTION COMPONENT
// ============================================================================

// Map subsection keys to their actual field names
const FLAG_FIELD_MAP = {
  'foreignFinancialInterests': 'hasForeignFinancialInterests',
  'foreignBusinessActivities': 'hasForeignBusinessActivities',
  'foreignTravel': 'hasForeignTravel'
} as const;

interface ForeignActivitiesSubsectionProps {
  subsectionKey: 'foreignFinancialInterests' | 'foreignBusinessActivities' | 'foreignTravel';
  title: string;
  description: string;
}

const ForeignActivitiesSubsection: React.FC<ForeignActivitiesSubsectionProps> = ({
  subsectionKey,
  title,
  description
}) => {
  const section20 = useSection20();
  const sf86Form = useSF86Form();

  // Get subsection data with correct field names
  const subsectionData = section20.section20Data?.section20?.[subsectionKey];

  const flagFieldName = FLAG_FIELD_MAP[subsectionKey];
  const hasFlag = subsectionData?.[flagFieldName]?.value || 'NO';
  const entries = subsectionData?.entries || [];

  // Debug logging to track component re-renders and values
  console.log(`🔍 Section 20 - ${subsectionKey} component render:`, {
    subsectionData: subsectionData,
    flagFieldName: flagFieldName,
    hasFlag: hasFlag,
    flagFieldValue: subsectionData?.[flagFieldName]?.value,
    section20DataExists: !!section20.section20Data,
    section20Exists: !!section20.section20Data?.section20
  });

  // Handle flag change (YES/NO)
  const handleFlagChange = useCallback((value: 'YES' | 'NO') => {
    console.log(`🔄 Section 20 - ${subsectionKey} flag change:`, value);
    console.log(`🔍 Section 20 - Current section20Data before flag change:`, section20.section20Data);

    // FIXED: Use updateSubsectionFlag instead of updateFieldValue to maintain proper data structure
    // This ensures the field is stored as an object with .value property, not a direct string
    section20.updateSubsectionFlag(subsectionKey, value);

    // Log data after flag update
    setTimeout(() => {
      console.log(`🔍 Section 20 - section20Data after flag change:`, section20.section20Data);
    }, 100);

    // Automatically create an entry if YES is selected and no entries exist
    if (value === 'YES' && entries.length === 0) {
      console.log(`🚀 Section 20 - Auto-creating first entry for ${subsectionKey}`, {
        subsectionKey,
        entriesLength: entries.length,
        hasAddEntryFunction: typeof section20.addEntry === 'function'
      });
      section20.addEntry(subsectionKey);
    } else {
      console.log(`🔍 Section 20 - Not auto-creating entry:`, {
        value,
        entriesLength: entries.length,
        shouldCreate: value === 'YES' && entries.length === 0
      });
    }

    // Update in global form context
    console.log(`🔄 Section 20 - Updating SF86FormContext with section20Data:`, section20.section20Data);
    sf86Form.updateSectionData('section20', section20.section20Data);

    // Log SF86 form data after update
    setTimeout(() => {
      console.log(`🔍 Section 20 - SF86 formData after update:`, sf86Form.formData);
    }, 200);
  }, [section20, subsectionKey, sf86Form, entries.length]);

  // Handle field changes in entries
  const handleFieldChange = useCallback((entryIndex: number, fieldPath: string, newValue: any) => {
    console.log(`🔄 Section 20 - ${subsectionKey} entry ${entryIndex} field change:`, fieldPath, newValue);
    console.log(`🔍 Section 20 - Current section20Data before field change:`, section20.section20Data);

    // CRITICAL FIX: The component already includes .value in fieldPath (e.g., 'country.value')
    // So we don't need to add .value again - just use the fieldPath as provided
    const fullFieldPath = `section20.${subsectionKey}.entries[${entryIndex}].${fieldPath}`;
    console.log(`🔍 Section 20 - Full field path (CORRECTED):`, fullFieldPath);

    // DEBUGGING: Check if the path exists before updating
    const currentEntry = section20.section20Data.section20[subsectionKey].entries[entryIndex];
    console.log(`🔍 Section 20 - Current entry structure:`, currentEntry);

    // Extract field name from path (remove .value suffix if present)
    const fieldName = fieldPath.replace('.value', '');
    console.log(`🔍 Section 20 - Field name:`, fieldName);
    console.log(`🔍 Section 20 - Field exists in entry:`, fieldName in currentEntry);
    console.log(`🔍 Section 20 - Field object:`, currentEntry[fieldName]);
    console.log(`🔍 Section 20 - Current field value:`, currentEntry[fieldName]?.value);

    section20.updateFieldValue(fullFieldPath, newValue);

    // Log data after field update
    setTimeout(() => {
      console.log(`🔍 Section 20 - section20Data after field change:`, section20.section20Data);
      console.log(`🔍 Section 20 - Specific entry after change:`, section20.section20Data.section20[subsectionKey].entries[entryIndex]);
      console.log(`🔍 Section 20 - Updated field value:`, section20.section20Data.section20[subsectionKey].entries[entryIndex][fieldName]?.value);
    }, 100);

    // Update in global form context
    console.log(`🔄 Section 20 - Updating SF86FormContext with section20Data:`, section20.section20Data);
    sf86Form.updateSectionData('section20', section20.section20Data);

    // Log SF86 form data after update
    setTimeout(() => {
      console.log(`🔍 Section 20 - SF86 formData after field update:`, sf86Form.formData);
    }, 200);
  }, [section20, subsectionKey, sf86Form]);

  // Add new entry
  const handleAddEntry = useCallback(() => {
    console.log(`➕ Section 20 - Adding new ${subsectionKey} entry`);

    // Use the addEntry method to create a new entry
    section20.addEntry(subsectionKey);
  }, [section20, subsectionKey]);

  return (
    <div className="foreign-activities-subsection border rounded-lg p-6 mb-6 bg-white shadow-sm">
      <div className="subsection-header mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      {/* YES/NO Flag Selection */}
      <div className="flag-selection mb-4">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">
            Do you have any {title.toLowerCase()} to report?
          </legend>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name={`${subsectionKey}_flag`}
                value="NO"
                checked={hasFlag === 'NO'}
                onChange={() => handleFlagChange('NO')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">No</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`${subsectionKey}_flag`}
                value="YES"
                checked={hasFlag === 'YES'}
                onChange={() => handleFlagChange('YES')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Yes</span>
            </label>
          </div>
        </fieldset>
      </div>

      {/* Entry Forms (shown when YES is selected) */}
      {hasFlag === 'YES' && (
        <div className="entries-section">
          <div className="entries-header flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-800">
              {title} Details ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
            </h4>
            <button
              type="button"
              onClick={handleAddEntry}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add {title}
            </button>
          </div>

          {/* Entry List */}
          {entries.length === 0 ? (
            <div className="no-entries text-center py-8 text-gray-500">
              <p>No {title.toLowerCase()} entries yet.</p>
              <p className="text-sm">Click "Add {title}" to get started.</p>
            </div>
          ) : (
            <div className="entries-list space-y-4">
              {entries.map((entry: any, index: number) => (
                <ForeignActivityEntryForm
                  key={entry._id || index}
                  entry={entry}
                  entryIndex={index}
                  subsectionKey={subsectionKey}
                  onFieldChange={(fieldPath, newValue) =>
                    handleFieldChange(index, fieldPath, newValue)
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// FOREIGN ACTIVITY ENTRY FORM COMPONENT
// ============================================================================

interface ForeignActivityEntryFormProps {
  entry: ForeignFinancialInterestEntry | ForeignBusinessEntry | ForeignTravelEntry;
  entryIndex: number;
  subsectionKey: 'foreignFinancialInterests' | 'foreignBusinessActivities' | 'foreignTravel';
  onFieldChange: (fieldPath: string, newValue: any) => void;
}

const ForeignActivityEntryForm: React.FC<ForeignActivityEntryFormProps> = ({
  entry,
  entryIndex,
  subsectionKey,
  onFieldChange
}) => {
  return (
    <div className="entry-form border border-gray-200 rounded p-4 bg-gray-50">
      <div className="entry-header mb-3">
        <h5 className="text-sm font-medium text-gray-700">
          Entry #{entryIndex + 1}
        </h5>
      </div>

      <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Common fields for all foreign activities */}

        {/* Country Field - Different field names for different subsections */}
        {subsectionKey !== 'foreignTravel' && 'country' in entry && (
          <div className="form-field">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Country *
            </label>
            <input
              type="text"
              value={entry.country?.value || ''}
              onChange={(e) => onFieldChange('country.value', e.target.value)}
              placeholder="Enter country name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        {/* Country Visited Field - For travel entries */}
        {subsectionKey === 'foreignTravel' && 'countryVisited' in entry && (
          <div className="form-field">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Country Visited *
            </label>
            <input
              type="text"
              value={entry.countryVisited?.value || ''}
              onChange={(e) => onFieldChange('countryVisited.value', e.target.value)}
              placeholder="Enter country visited..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        {/* Date From Field */}
        {'dateFrom' in entry && (
          <div className="form-field">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date From *
            </label>
            <input
              type="date"
              value={entry.dateFrom?.date?.value || ''}
              onChange={(e) => onFieldChange('dateFrom.date.value', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        {/* Date To Field */}
        {'dateTo' in entry && (
          <div className="form-field">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={entry.dateTo?.date?.value || ''}
              onChange={(e) => onFieldChange('dateTo.date.value', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Description Field - Different field names for different subsections */}
        {subsectionKey === 'foreignFinancialInterests' && 'description' in entry && (
          <div className="form-field md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={entry.description?.value || ''}
              onChange={(e) => onFieldChange('description.value', e.target.value)}
              placeholder="Provide details about this financial interest..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        {/* Business Description Field - For business activities */}
        {subsectionKey === 'foreignBusinessActivities' && 'businessDescription' in entry && (
          <div className="form-field md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Business Description *
            </label>
            <textarea
              value={entry.businessDescription?.value || ''}
              onChange={(e) => onFieldChange('businessDescription.value', e.target.value)}
              placeholder="Describe the business activity..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}
      </div>

      {/* Subsection-specific fields */}
      {subsectionKey === 'foreignFinancialInterests' && (
        <div className="financial-interests-specific mt-4">
          <h6 className="text-xs font-medium text-gray-700 mb-2">Financial Interest Details</h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Financial Interest Type - FIXED: Use correct field name */}
            {'financialInterestType' in entry && (
              <div className="form-field">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Type of Financial Interest *
                </label>
                <select
                  value={entry.financialInterestType?.value || ''}
                  onChange={(e) => onFieldChange('financialInterestType.value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select type...</option>
                  <option value="bank_account">Bank Account</option>
                  <option value="investment">Investment</option>
                  <option value="property">Property</option>
                  <option value="business">Business</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {/* Date Acquired - FIXED: Use correct field structure */}
            {'dateAcquired' in entry && (
              <div className="form-field">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date Acquired *
                </label>
                <input
                  type="date"
                  value={entry.dateAcquired?.date?.value || ''}
                  onChange={(e) => onFieldChange('dateAcquired.date.value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* How Acquired */}
            {'howAcquired' in entry && (
              <div className="form-field">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  How Acquired
                </label>
                <input
                  type="text"
                  value={entry.howAcquired?.value || ''}
                  onChange={(e) => onFieldChange('howAcquired.value', e.target.value)}
                  placeholder="e.g., Purchase, Inheritance, Gift..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Current Value - FIXED: Use correct field structure */}
            {'currentValue' in entry && (
              <div className="form-field">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Current Value
                </label>
                <input
                  type="text"
                  value={entry.currentValue?.amount?.value || ''}
                  onChange={(e) => onFieldChange('currentValue.amount.value', e.target.value)}
                  placeholder="$0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {subsectionKey === 'foreignBusinessActivities' && (
        <div className="business-activities-specific mt-4">
          <h6 className="text-xs font-medium text-gray-700 mb-2">Business Activity Details</h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Type - FIXED: Use correct field name */}
            {'businessType' in entry && (
              <div className="form-field">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Business Type *
                </label>
                <input
                  type="text"
                  value={entry.businessType?.value || ''}
                  onChange={(e) => onFieldChange('businessType.value', e.target.value)}
                  placeholder="e.g., Consulting, Manufacturing..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* Is Ongoing */}
            {'isOngoing' in entry && (
              <div className="form-field">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Is this activity ongoing?
                </label>
                <select
                  value={entry.isOngoing?.value || ''}
                  onChange={(e) => onFieldChange('isOngoing.value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                </select>
              </div>
            )}

            {/* Received Compensation */}
            {'receivedCompensation' in entry && (
              <div className="form-field">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Did you receive compensation?
                </label>
                <select
                  value={entry.receivedCompensation?.value || ''}
                  onChange={(e) => onFieldChange('receivedCompensation.value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                </select>
              </div>
            )}

            {/* Circumstances */}
            {'circumstances' in entry && (
              <div className="form-field md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Circumstances
                </label>
                <textarea
                  value={entry.circumstances?.value || ''}
                  onChange={(e) => onFieldChange('circumstances.value', e.target.value)}
                  placeholder="Describe the circumstances of this business activity..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {subsectionKey === 'foreignTravel' && (
        <div className="foreign-travel-specific mt-4">
          <h6 className="text-xs font-medium text-gray-700 mb-2">Travel Details</h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Travel Dates From */}
            {'travelDates' in entry && (
              <div className="form-field">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Travel Date From *
                </label>
                <input
                  type="date"
                  value={entry.travelDates?.from?.date?.value || ''}
                  onChange={(e) => onFieldChange('travelDates.from.date.value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* Travel Dates To */}
            {'travelDates' in entry && (
              <div className="form-field">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Travel Date To *
                </label>
                <input
                  type="date"
                  value={entry.travelDates?.to?.date?.value || ''}
                  onChange={(e) => onFieldChange('travelDates.to.date.value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* Number of Days */}
            {'numberOfDays' in entry && (
              <div className="form-field">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Number of Days
                </label>
                <input
                  type="number"
                  value={entry.numberOfDays?.value || ''}
                  onChange={(e) => onFieldChange('numberOfDays.value', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Purpose */}
            {'purposeOfTravel' in entry && (
              <div className="form-field">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Purpose of Travel
                </label>
                <select
                  value={entry.purposeOfTravel?.value || ''}
                  onChange={(e) => onFieldChange('purposeOfTravel.value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select purpose...</option>
                  <option value="business">Business</option>
                  <option value="pleasure">Pleasure</option>
                  <option value="education">Education</option>
                  <option value="family">Family</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN SECTION 20 COMPONENT
// ============================================================================

export const Section20Component: React.FC = () => {
  const section20 = useSection20();
  const sf86Form = useSF86Form();
  const [isLoading, setIsLoading] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Handle validation and continue
  const handleValidateAndContinue = useCallback(async () => {
    console.log('🔍 Section 20 - Starting validation and continue process');
    setIsLoading(true);
    setShowValidationErrors(true);

    try {
      // Validate the section
      const validationResult = section20.validateSection();
      console.log('📋 Section 20 validation result:', validationResult);

      if (validationResult.isValid) {
        // Update the main form context with current section data
        sf86Form.updateSectionData('section20', section20.section20Data);

        // Save to IndexedDB
        await sf86Form.saveForm();
        console.log('✅ Section 20 data saved successfully to IndexedDB');

        // Log the data being saved for debugging
        console.log('💾 Section 20 data being saved:', section20.section20Data);
      } else {
        console.warn('⚠️ Section 20 validation failed:', validationResult.errors);
      }
    } catch (error) {
      console.error('❌ Failed to save Section 20 data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [section20, sf86Form]);

  return (
    <div className="section20-component max-w-4xl mx-auto p-6">
      {/* Section Header */}
      <div className="section-header mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Section 20: Foreign Activities
        </h1>
        <p className="text-gray-600">
          Report any foreign financial interests, business activities, or travel that may be relevant
          to your background investigation.
        </p>

        {/* Debug Info */}
        <div className="debug-info mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="font-medium">Section Data Status:</span>
              <span className="ml-1">{section20.section20Data ? 'Loaded' : 'Not Loaded'}</span>
            </div>
            <div>
              <span className="font-medium">Validation Status:</span>
              <span className="ml-1">{showValidationErrors ? 'Showing Errors' : 'Normal'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Foreign Activities Subsections */}
      <div className="subsections">
        <ForeignActivitiesSubsection
          subsectionKey="foreignFinancialInterests"
          title="Foreign Financial Interests"
          description="Do you have any financial interests in foreign countries (bank accounts, investments, property, etc.)?"
        />

        <ForeignActivitiesSubsection
          subsectionKey="foreignBusinessActivities"
          title="Foreign Business Activities"
          description="Have you been involved in any business activities in foreign countries?"
        />

        <ForeignActivitiesSubsection
          subsectionKey="foreignTravel"
          title="Foreign Travel"
          description="Have you traveled to foreign countries for business, pleasure, or other purposes?"
        />
      </div>

      {/* Form Actions */}
      <div className="form-actions mt-8 flex justify-between">
        <button
          type="button"
          className="px-6 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
        >
          Previous Section
        </button>

        <button
          type="button"
          onClick={handleValidateAndContinue}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Validating...' : 'Validate & Continue'}
        </button>
      </div>
    </div>
  );
};

export default Section20Component;