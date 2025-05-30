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

import React, { useState } from 'react';
import { useSection29 } from '~/state/contexts/sections2.0/section29';
import type {
  SubsectionKey,
  OrganizationSubsectionKey,
  ActivitySubsectionKey,
  ActivityEntryType
} from '~/state/contexts/sections2.0/section29-field-generator';

interface Section29ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
}

 const Section29Component: React.FC<Section29ComponentProps> = ({
  className = '',
  onValidationChange
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

  // Ensure section29Data is available
  if (!section29Data) {
    return <div>Loading Section 29...</div>;
  }

  const [activeSubsection, setActiveSubsection] = useState<SubsectionKey>('terrorismOrganizations');

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

  // Handle adding entries
  const handleAddEntry = (subsectionKey: SubsectionKey) => {
    const subsection = subsections.find(s => s.key === subsectionKey);

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

  // Handle field value changes
  const handleFieldChange = (
    subsectionKey: SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    value: any
  ) => {
    updateFieldValue(subsectionKey, entryIndex, fieldPath, value);
  };

  // Handle validation
  const handleValidation = () => {
    const result = validateSection();
    onValidationChange?.(result);
    return result;
  };

  // Get current subsection data
  const getCurrentSubsectionData = () => {
    const data = section29Data[activeSubsection];
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
          violent overthrow, and related organizations.
        </p>
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
                    checked={flagField.value === "YES"}
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
                    checked={flagField.value === "NO"}
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
          {flagField?.value === "YES" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-gray-900">
                  {currentSubsection.type === 'organization' ? 'Organizations' :
                   currentSubsection.type === 'activity' ? 'Activities' :
                   currentSubsection.type === 'advocacy' ? 'Advocacy Instances' :
                   currentSubsection.type === 'association' ? 'Associations' : 'Entries'}
                </h4>
                <button
                  onClick={() => handleAddEntry(activeSubsection)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  data-testid={`add-${activeSubsection}-entry`}
                >
                  Add {currentSubsection.type === 'organization' ? 'Organization' :
                       currentSubsection.type === 'activity' ? 'Activity' :
                       currentSubsection.type === 'advocacy' ? 'Advocacy Instance' :
                       currentSubsection.type === 'association' ? 'Association' : 'Entry'}
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
                            }
                          </h5>
                          {entry.address?.street?.value && (
                            <p className="text-sm text-gray-600">
                              {entry.address.street.value}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeEntry(activeSubsection, index)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                          data-testid={`remove-${activeSubsection}-entry-${index}`}
                        >
                          Remove
                        </button>
                      </div>

                      {/* Entry Form Fields */}
                      <div className="space-y-4">
                        {/* Organization-specific fields */}
                        {currentSubsection.type === 'organization' && (
                          <>
                            {/* Organization Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Organization Name
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
                                  State
                                </label>
                                <input
                                  type="text"
                                  value={entry.address?.state?.value || ''}
                                  onChange={(e) => handleFieldChange(activeSubsection, index, 'address.state', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="State"
                                />
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
                                Country
                              </label>
                              <input
                                type="text"
                                value={entry.address?.country?.value || ''}
                                onChange={(e) => handleFieldChange(activeSubsection, index, 'address.country', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Country"
                              />
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Field Mapping Summary */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">PDF Field Mapping Summary</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Current Subsection:</strong> {currentSubsection?.title}</p>
              <p><strong>Expected Fields:</strong> {currentSubsection?.fieldCount || 0}</p>
              <p><strong>Flag Field:</strong> {flagField?.id || 'N/A'}</p>
              <p><strong>Entries:</strong> {entries.length}</p>
              <p><strong>Total Fields Mapped:</strong> {
                (flagField ? 1 : 0) +
                entries.reduce((total: number, entry: any) => {
                  return total + Object.keys(entry).filter(key =>
                    key !== '_id' && typeof entry[key] === 'object' && entry[key]?.id
                  ).length;
                }, 0)
              }</p>
              <div className="mt-2 pt-2 border-t border-gray-300">
                <p><strong>Section 29 Total:</strong> 141 fields across 7 subsections</p>
                <div className="text-xs text-gray-500 mt-1">
                  29.1: 33 • 29.2: 13 • 29.3: 13 • 29.4: 33 • 29.5: 33 • 29.6: 13 • 29.7: 3
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Section29Component;