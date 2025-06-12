/**
 * Section 29: Association Record - Component
 *
 * React component for SF-86 Section 29 using the new Form Architecture 2.0.
 * This component handles all 7 subsections of association records with full CRUD operations
 * and integrates with the Section29Provider context.
 *
 * Complete 7 Subsections (141 total fields):
 * 29.1: Terrorism Organizations (Section29[0]) - 33 fields
 * 29.2: Terrorism Activities (Section29_2[0]) - 13 fields
 * 29.3: Terrorism Advocacy (Section29_2[0]) - 13 fields (shares PDF section with 29.2)
 * 29.4: Violent Overthrow Organizations (Section29_3[0]) - 33 fields
 * 29.5: Violence/Force Organizations (Section29_4[0]) - 33 fields
 * 29.6: Overthrow Activities (Section29_5[0] RadioButtonList[0]) - 13 fields
 * 29.7: Terrorism Associations (Section29_5[0] RadioButtonList[1]) - 3 fields
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useSection29 } from '~/state/contexts/sections2.0/section29';
import { useSF86Form } from '~/state/contexts/sections2.0/SF86FormContext';
import { getUSStateOptions, getCountryOptions } from '../../../api/interfaces/sections2.0/base';
import type {
  SubsectionKey,
  OrganizationSubsectionKey,
  ActivitySubsectionKey,
  ActivityEntryType
} from '~/state/contexts/sections2.0/section29-field-generator';

interface Section29ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

// Maximum number of entries allowed per subsection
const MAX_ENTRIES_PER_SUBSECTION = 2;

// Use centralized US States from base.ts
const US_STATES = getUSStateOptions();

// Use centralized countries from base.ts
const COUNTRIES = getCountryOptions();

export const Section29Component: React.FC<Section29ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  const {
    section29Data,
    updateSubsectionFlag,
    addOrganizationEntry,
    addActivityEntry,
    removeEntry,
    updateFieldValue,
    validateSection
  } = useSection29();

  // SF86 Form Context for data persistence (like Section 1)
  const sf86Form = useSF86Form();

  // Ensure section29Data is available
  if (!section29Data) {
    return <div>Loading Section 29...</div>;
  }

  const [activeSubsection, setActiveSubsection] = useState<SubsectionKey>('terrorismOrganizations');
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set([0]));
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Track validation state internally (like Section 1)
  const [isValid, setIsValid] = useState(false);

  // Handle validation on component mount and when data changes (like Section 1)
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult);
    onValidationChange?.(validationResult);
  }, [section29Data, onValidationChange]); // FIXED: Removed validateSection to prevent infinite loops

  // Removed auto-sync to prevent infinite loops
  // Section 29 data is only submitted to main context on explicit submit (like Section 1)

  // Toggle entry expansion
  const toggleEntryExpansion = useCallback((index: number) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // Date validation helper
  const validateDate = (dateString: string, fieldName: string): string | null => {
    if (!dateString) return null;

    const datePattern = /^\d{4}-\d{2}$/;
    if (!datePattern.test(dateString)) {
      return `${fieldName} must be in YYYY-MM format`;
    }

    const [year, month] = dateString.split('-').map(Number);
    const currentYear = new Date().getFullYear();

    if (year < 1900 || year > currentYear + 1) {
      return `${fieldName} year must be between 1900 and ${currentYear + 1}`;
    }

    if (month < 1 || month > 12) {
      return `${fieldName} month must be between 01 and 12`;
    }

    return null;
  };

  // Complete 7 subsections configuration (141 total fields)
  const subsections = [
    {
      key: 'terrorismOrganizations' as SubsectionKey,
      title: '29.1 Terrorism Organizations',
      description: 'Are you now or have you EVER been a member of an organization dedicated to terrorism, either with an awareness of the organization\'s dedication to that end, or with the specific intent to further such activities?',
      type: 'organization' as const,
      fieldCount: 33
    },
    {
      key: 'terrorismActivities' as SubsectionKey,
      title: '29.2 Terrorism Activities',
      description: 'Have you EVER knowingly engaged in any acts of terrorism?',
      type: 'activity' as const,
      fieldCount: 13
    },
    {
      key: 'terrorismAdvocacy' as SubsectionKey,
      title: '29.3 Terrorism Advocacy',
      description: 'Have you EVER advocated any acts of terrorism or activities designed to overthrow the U.S. Government by force?',
      type: 'advocacy' as const,
      fieldCount: 13
    },
    {
      key: 'violentOverthrowOrganizations' as SubsectionKey,
      title: '29.4 Violent Overthrow Organizations',
      description: 'Have you EVER been a member of an organization dedicated to the use of violence or force to overthrow the United States Government, and which engaged in activities to that end with an awareness of the organization\'s dedication to that end or with the specific intent to further such activities?',
      type: 'organization' as const,
      fieldCount: 33
    },
    {
      key: 'violenceForceOrganizations' as SubsectionKey,
      title: '29.5 Violence/Force Organizations',
      description: 'Have you EVER been a member of an organization that advocates or practices commission of acts of force or violence to discourage others from exercising their rights under the U.S. Constitution or any state of the United States with the specific intent to further such action?',
      type: 'organization' as const,
      fieldCount: 33
    },
    {
      key: 'overthrowActivities' as SubsectionKey,
      title: '29.6 Overthrow Activities',
      description: 'Have you EVER knowingly engaged in activities designed to overthrow the U.S. Government by force?',
      type: 'activity' as const,
      fieldCount: 13
    },
    {
      key: 'terrorismAssociations' as SubsectionKey,
      title: '29.7 Terrorism Associations',
      description: 'Have you EVER associated with anyone involved in activities to further terrorism?',
      type: 'association' as const,
      fieldCount: 3
    }
  ];

  // Handle subsection flag changes
  const handleSubsectionFlagChange = (subsectionKey: SubsectionKey, value: "YES" | "NO") => {
    updateSubsectionFlag(subsectionKey, value);
  };

  // Handle adding entries with limit check
  const handleAddEntry = (subsectionKey: SubsectionKey) => {
    const subsection = subsections.find(s => s.key === subsectionKey);
    const currentEntries = section29Data.section29[subsectionKey]?.entries || [];

    // Check if we've reached the maximum entries limit
    if (currentEntries.length >= MAX_ENTRIES_PER_SUBSECTION) {
      // console.log(`Maximum of ${MAX_ENTRIES_PER_SUBSECTION} entries allowed per subsection.`);
      return;
    }

    if (subsection?.type === 'organization') {
      addOrganizationEntry(subsectionKey as OrganizationSubsectionKey);
    } else if (subsection?.type === 'activity') {
      // Default to terrorism activity type, could be made configurable
      addActivityEntry(subsectionKey as ActivitySubsectionKey, 'terrorism');
    } else if (subsection?.type === 'advocacy') {
      // Handle terrorism advocacy entries - use 'terrorism' type for now
      addActivityEntry(subsectionKey as ActivitySubsectionKey, 'terrorism');
    } else if (subsection?.type === 'association') {
      // Handle terrorism association entries
      addActivityEntry(subsectionKey as ActivitySubsectionKey, 'association');
    }
  };

  // Enhanced field update with validation
  const handleFieldChange = useCallback((
    subsectionKey: SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    value: any
  ) => {
    updateFieldValue(subsectionKey, entryIndex, fieldPath, value);

    // Real-time validation for date fields
    if (fieldPath.includes('date') && typeof value === 'string') {
      const error = validateDate(value, fieldPath);
      const errorKey = `${subsectionKey}-${entryIndex}-${fieldPath}`;
      if (error) {
        setValidationErrors(prev => ({
          ...prev,
          [errorKey]: [error]
        }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }
    }
  }, [updateFieldValue, validateDate]);

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result);
    onValidationChange?.(result);

    // console.log('🔍 Section 29 validation result:', result);
    // console.log('📊 Section 29 data before submission:', section29Data);

    if (result) {
      try {
        // console.log('🔄 Section 29: Starting data synchronization...');

        // Update the central form context with Section 29 data
        sf86Form.updateSectionData('section29', section29Data);

        // console.log('✅ Section 29: Data synchronization complete, proceeding to save...');

        // Get the current form data and update it with section29 data for immediate saving
        const currentFormData = sf86Form.exportForm();
        const updatedFormData = { ...currentFormData, section29: section29Data };

        // Save the form data to persistence layer with the updated data
        await sf86Form.saveForm(updatedFormData);

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section29');

        // console.log('✅ Section 29 data saved successfully:', section29Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        // console.error('❌ Failed to save Section 29 data:', error);
        // Show an error message to user
        // console.log('There was an error saving your information. Please try again.');
      }
    }
  };


  // Get current subsection data
  const getCurrentSubsectionData = () => {
    const data = section29Data.section29[activeSubsection];
    return data;
  };

  // Get flag field for current subsection
  const getFlagField = () => {
    const subsectionData = getCurrentSubsectionData();

    if (subsectionData && 'hasAssociation' in subsectionData) {
      return subsectionData.hasAssociation;
    } else if (subsectionData && 'hasActivity' in subsectionData) {
      return subsectionData.hasActivity;
    }
    return null;
  };

  const currentSubsection = subsections.find(s => s.key === activeSubsection);
  const flagField = getFlagField();
  const entries = getCurrentSubsectionData()?.entries || [];

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section29-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 29: Association Record
        </h2>
        <p className="text-gray-600">
          This section covers various types of associations and activities related to terrorism,
          violent overthrow, and related organizations. Complete all 7 subsections that apply to you.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Fields marked with <span className="text-red-500">*</span> are required when applicable.
        </div>
      </div>

      {/* Subsection Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {subsections.map((subsection) => (
              <button
                key={subsection.key}
                onClick={() => setActiveSubsection(subsection.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSubsection === subsection.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {subsection.title}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Current Subsection Content */}
      {currentSubsection && (
        <div className="space-y-6">
          {/* Subsection Question */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentSubsection.title}
            </h3>
            <p className="text-gray-700 mb-4">
              {currentSubsection.description}
            </p>

            {/* Yes/No Radio Buttons */}
            {flagField ? (
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`${activeSubsection}-flag`}
                    value="YES"
                    checked={flagField.value === "YES" || flagField.value?.startsWith?.("YES")}
                    onChange={() => handleSubsectionFlagChange(activeSubsection, "YES")}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`${activeSubsection}-flag`}
                    value="NO"
                    checked={flagField.value?.startsWith?.("NO") || flagField.value === "NO"}
                    onChange={() => handleSubsectionFlagChange(activeSubsection, "NO")}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
            ) : (
              <div className="text-red-500 text-sm">
                Flag field not found for this subsection. Please check the data structure.
              </div>
            )}
          </div>

          {/* Entries Section */}
          {(flagField?.value === "YES" || flagField?.value?.startsWith?.("YES")) && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {currentSubsection.type === 'organization' ? 'Organizations' :
                     currentSubsection.type === 'activity' ? 'Activities' :
                     currentSubsection.type === 'advocacy' ? 'Advocacy Instances' :
                     currentSubsection.type === 'association' ? 'Associations' : 'Entries'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Maximum {MAX_ENTRIES_PER_SUBSECTION} entries allowed
                  </p>
                </div>
                <button
                  onClick={() => handleAddEntry(activeSubsection)}
                  className={`px-4 py-2 text-white rounded-md transition-colors ${
                    entries.length >= MAX_ENTRIES_PER_SUBSECTION
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  disabled={entries.length >= MAX_ENTRIES_PER_SUBSECTION}
                  data-testid={`add-${activeSubsection}-entry`}
                >
                  Add {currentSubsection.type === 'organization' ? 'Organization' :
                       currentSubsection.type === 'activity' ? 'Activity' :
                       currentSubsection.type === 'advocacy' ? 'Advocacy Instance' :
                       currentSubsection.type === 'association' ? 'Association' : 'Entry'}
                  {entries.length >= MAX_ENTRIES_PER_SUBSECTION ? ' (Max Reached)' : ''}
                </button>
              </div>

              {/* Entry List */}
              {entries.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    No {currentSubsection.type === 'organization' ? 'organizations' :
                         currentSubsection.type === 'activity' ? 'activities' :
                         currentSubsection.type === 'advocacy' ? 'advocacy instances' :
                         currentSubsection.type === 'association' ? 'associations' : 'entries'} added yet.
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Click "Add {currentSubsection.type === 'organization' ? 'Organization' :
                               currentSubsection.type === 'activity' ? 'Activity' :
                               currentSubsection.type === 'advocacy' ? 'Advocacy Instance' :
                               currentSubsection.type === 'association' ? 'Association' : 'Entry'}" to get started.
                    Maximum {MAX_ENTRIES_PER_SUBSECTION} entries allowed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry: any, index: number) => (
                    <div key={entry._id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h5 className="text-md font-medium text-gray-900">
                            {currentSubsection.type === 'organization'
                              ? (entry.organizationName?.value || `Organization ${index + 1}`)
                              : currentSubsection.type === 'activity'
                              ? `Activity ${index + 1}`
                              : currentSubsection.type === 'advocacy'
                              ? `Advocacy Instance ${index + 1}`
                              : currentSubsection.type === 'association'
                              ? `Association ${index + 1}`
                              : `Entry ${index + 1}`
                            } of {MAX_ENTRIES_PER_SUBSECTION}
                          </h5>
                          {entry.address?.street?.value && (
                            <p className="text-sm text-gray-600">
                              {entry.address.street.value}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => toggleEntryExpansion(index)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            {expandedEntries.has(index) ? "Collapse" : "Expand"}
                          </button>
                          <button
                            onClick={() => removeEntry(activeSubsection, index)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                            data-testid={`remove-${activeSubsection}-entry-${index}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Entry Form Fields */}
                      {expandedEntries.has(index) && (
                      <div className="space-y-4">
                        {/* Organization-specific fields */}
                        {currentSubsection.type === 'organization' && (
                          <>
                            {/* Organization Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Organization Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={entry.organizationName?.value || ''}
                                onChange={(e) => handleFieldChange(activeSubsection, index, 'organizationName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter organization name"
                              />
                            </div>

                            {/* Address Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Street Address
                                </label>
                                <input
                                  type="text"
                                  value={entry.address?.street?.value || ''}
                                  onChange={(e) => handleFieldChange(activeSubsection, index, 'address.street', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Street address"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  City
                                </label>
                                <input
                                  type="text"
                                  value={entry.address?.city?.value || ''}
                                  onChange={(e) => handleFieldChange(activeSubsection, index, 'address.city', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="City"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  State <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={entry.address?.state?.value || ''}
                                  onChange={(e) => handleFieldChange(activeSubsection, index, 'address.state', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {US_STATES.map((state) => (
                                    <option key={state.value} value={state.value}>
                                      {state.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  ZIP Code
                                </label>
                                <input
                                  type="text"
                                  value={entry.address?.zipCode?.value || ''}
                                  onChange={(e) => handleFieldChange(activeSubsection, index, 'address.zipCode', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="ZIP code"
                                />
                              </div>
                            </div>

                            {/* Country */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Country <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={entry.address?.country?.value || ''}
                                onChange={(e) => handleFieldChange(activeSubsection, index, 'address.country', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                {COUNTRIES.map((country) => (
                                  <option key={country.value} value={country.value}>
                                    {country.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  From Date (Month/Year)
                                </label>
                                <input
                                  type="month"
                                  value={entry.dateRange?.from?.date?.value || ''}
                                  onChange={(e) => handleFieldChange(activeSubsection, index, 'dateRange.from.date', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <label className="flex items-center mt-2">
                                  <input
                                    type="checkbox"
                                    checked={entry.dateRange?.from?.estimated?.value || false}
                                    onChange={(e) => handleFieldChange(activeSubsection, index, 'dateRange.from.estimated', e.target.checked)}
                                    className="mr-2"
                                  />
                                  <span className="text-sm text-gray-600">Estimated</span>
                                </label>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  To Date (Month/Year)
                                </label>
                                <input
                                  type="month"
                                  value={entry.dateRange?.to?.date?.value || ''}
                                  onChange={(e) => handleFieldChange(activeSubsection, index, 'dateRange.to.date', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  disabled={entry.dateRange?.present?.value}
                                />
                                <label className="flex items-center mt-2">
                                  <input
                                    type="checkbox"
                                    checked={entry.dateRange?.to?.estimated?.value || false}
                                    onChange={(e) => handleFieldChange(activeSubsection, index, 'dateRange.to.estimated', e.target.checked)}
                                    className="mr-2"
                                    disabled={entry.dateRange?.present?.value}
                                  />
                                  <span className="text-sm text-gray-600">Estimated</span>
                                </label>
                                <label className="flex items-center mt-2">
                                  <input
                                    type="checkbox"
                                    checked={entry.dateRange?.present?.value || false}
                                    onChange={(e) => handleFieldChange(activeSubsection, index, 'dateRange.present', e.target.checked)}
                                    className="mr-2"
                                  />
                                  <span className="text-sm text-gray-600">Present</span>
                                </label>
                              </div>
                            </div>

                            {/* Positions */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Describe your role(s) or position(s)
                              </label>
                              <textarea
                                value={entry.positions?.description?.value || ''}
                                onChange={(e) => handleFieldChange(activeSubsection, index, 'positions.description', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                                placeholder="Describe your positions or roles in this organization"
                              />
                              <label className="flex items-center mt-2">
                                <input
                                  type="checkbox"
                                  checked={entry.positions?.noPositionsHeld?.value || false}
                                  onChange={(e) => handleFieldChange(activeSubsection, index, 'positions.noPositionsHeld', e.target.checked)}
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-600">No positions held</span>
                              </label>
                            </div>

                            {/* Contributions */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Describe your contributions
                              </label>
                              <textarea
                                value={entry.contributions?.description?.value || ''}
                                onChange={(e) => handleFieldChange(activeSubsection, index, 'contributions.description', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                                placeholder="Describe your contributions to this organization"
                              />
                              <label className="flex items-center mt-2">
                                <input
                                  type="checkbox"
                                  checked={entry.contributions?.noContributionsMade?.value || false}
                                  onChange={(e) => handleFieldChange(activeSubsection, index, 'contributions.noContributionsMade', e.target.checked)}
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-600">No contributions made</span>
                              </label>
                            </div>

                            {/* Involvement Description */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Describe your involvement
                              </label>
                              <textarea
                                value={entry.involvementDescription?.value || ''}
                                onChange={(e) => handleFieldChange(activeSubsection, index, 'involvementDescription', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                                placeholder="Describe the nature and reasons for your involvement"
                              />
                            </div>
                          </>
                        )}

                        {/* Activity-specific fields */}
                        {(currentSubsection.type === 'activity' || currentSubsection.type === 'advocacy') && (
                          <>
                            {/* Activity/Advocacy Description */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {currentSubsection.type === 'advocacy' ? 'Advocacy Reason' : 'Activity Description'}
                              </label>
                              <textarea
                                value={
                                  currentSubsection.type === 'advocacy'
                                    ? (entry.advocacyReason?.value || '')
                                    : (entry.activityDescription?.value || '')
                                }
                                onChange={(e) => handleFieldChange(
                                  activeSubsection,
                                  index,
                                  currentSubsection.type === 'advocacy' ? 'advocacyReason' : 'activityDescription',
                                  e.target.value
                                )}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                                placeholder={
                                  currentSubsection.type === 'advocacy'
                                    ? "Provide the reason(s) for advocating acts of terrorism"
                                    : "Describe the nature and reasons for the activity"
                                }
                              />
                            </div>

                            {/* Date Range for Activities */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  From Date (Month/Year)
                                </label>
                                <input
                                  type="month"
                                  value={entry.dateRange?.from?.date?.value || ''}
                                  onChange={(e) => handleFieldChange(activeSubsection, index, 'dateRange.from.date', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <label className="flex items-center mt-2">
                                  <input
                                    type="checkbox"
                                    checked={entry.dateRange?.from?.estimated?.value || false}
                                    onChange={(e) => handleFieldChange(activeSubsection, index, 'dateRange.from.estimated', e.target.checked)}
                                    className="mr-2"
                                  />
                                  <span className="text-sm text-gray-600">Estimated</span>
                                </label>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  To Date (Month/Year)
                                </label>
                                <input
                                  type="month"
                                  value={entry.dateRange?.to?.date?.value || ''}
                                  onChange={(e) => handleFieldChange(activeSubsection, index, 'dateRange.to.date', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  disabled={entry.dateRange?.present?.value}
                                />
                                <label className="flex items-center mt-2">
                                  <input
                                    type="checkbox"
                                    checked={entry.dateRange?.to?.estimated?.value || false}
                                    onChange={(e) => handleFieldChange(activeSubsection, index, 'dateRange.to.estimated', e.target.checked)}
                                    className="mr-2"
                                    disabled={entry.dateRange?.present?.value}
                                  />
                                  <span className="text-sm text-gray-600">Estimated</span>
                                </label>
                                <label className="flex items-center mt-2">
                                  <input
                                    type="checkbox"
                                    checked={entry.dateRange?.present?.value || false}
                                    onChange={(e) => handleFieldChange(activeSubsection, index, 'dateRange.present', e.target.checked)}
                                    className="mr-2"
                                  />
                                  <span className="text-sm text-gray-600">Present</span>
                                </label>
                              </div>
                            </div>

                          </>
                        )}

                        {/* Association-specific fields (29.7) */}
                        {currentSubsection.type === 'association' && (
                          <>
                            {/* Explanation for terrorism associations */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Explanation
                              </label>
                              <textarea
                                value={entry.explanation?.value || ''}
                                onChange={(e) => handleFieldChange(activeSubsection, index, 'explanation', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                                placeholder="Provide explanation of your association with anyone involved in activities to further terrorism"
                              />
                            </div>
                          </>
                        )}
                      </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Validation Errors Display */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Validation Errors</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc list-inside space-y-1">
                      {Object.entries(validationErrors).map(([key, errors]) =>
                        errors.map((error, index) => (
                          <li key={`${key}-${index}`}>{error}</li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Submit Button and Status */}
          <div className="mt-8 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {isValid ? (
                <span className="text-green-600">✅ Section 29 is valid and ready to save</span>
              ) : (
                <span className="text-red-600">❌ Please complete all required fields</span>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  isValid
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Section29Component;