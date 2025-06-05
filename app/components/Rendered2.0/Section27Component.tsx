/**
 * Section 27: Use of Information Technology Systems - Component
 *
 * React component for SF-86 Section 27 using the new Form Architecture 2.0.
 * This component handles collection of information about illegal access
 * and unauthorized modification of information technology systems.
 */

import type { Section27SubsectionKey } from 'api/interfaces/sections2.0/section27';
import React, { useEffect, useState } from 'react';
import { useSection27 } from '~/state/contexts/sections2.0/section27';
import { useSF86Form } from '~/state/contexts/SF86FormContext';

interface Section27ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}
export const Section27Component: React.FC<Section27ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  const {
    section27Data,
    updateSubsectionFlag,
    addEntry,
    removeEntry,
    updateFieldValue,
    validateSection,
    resetSection,
    getEntryCount,
    isDirty,
    errors
  } = useSection27();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  // Add debugging to track data changes
  // useEffect(() => {
  //   console.log('🔄 UI: section27Data changed:', {
  //     illegalAccess: {
  //       hasViolation: section27Data.section27.illegalAccess.hasViolation.value,
  //       entriesCount: section27Data.section27.illegalAccess.entries.length
  //     },
  //     illegalModification: {
  //       hasViolation: section27Data.section27.illegalModification.hasViolation.value,
  //       entriesCount: section27Data.section27.illegalModification.entries.length
  //     },
  //     unauthorizedUse: {
  //       hasViolation: section27Data.section27.unauthorizedUse.hasViolation.value,
  //       entriesCount: section27Data.section27.unauthorizedUse.entries.length
  //     }
  //   });
  // }, [section27Data]);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section27Data, validateSection, onValidationChange]);

  // Auto-save functionality with debounce
  useEffect(() => {
    // Only auto-save if there are actual changes and auto-save is enabled
    if (isDirty && sf86Form.autoSave) {
      const timeoutId = setTimeout(async () => {
        try {
          sf86Form.updateSectionData('section27', section27Data);
          await sf86Form.saveForm();
          console.log('🔄 Section 27 auto-saved successfully');
        } catch (error) {
          console.error('❌ Auto-save failed for Section 27:', error);
        }
      }, 2000); // 2 second debounce

      return () => clearTimeout(timeoutId);
    }
  }, [section27Data, isDirty, sf86Form]);

  // Handle form submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        console.log('💾 Submitting Section 27 data:', section27Data);
        sf86Form.updateSectionData('section27', section27Data);
        await sf86Form.saveForm();
        console.log('✅ Section 27 data saved successfully:', section27Data);
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('❌ Failed to save Section 27 data during submit:', error);
      }
    }
  };

  // Handle save without validation requirement
  const handleSave = async () => {
    try {
      console.log('💾 Manually saving Section 27 data:', section27Data);
      sf86Form.updateSectionData('section27', section27Data);
      await sf86Form.saveForm();
      console.log('✅ Section 27 data saved successfully (manual save):', section27Data);
    } catch (error) {
      console.error('❌ Failed to save Section 27 data (manual save):', error);
    }
  };

  // Handle subsection flag changes
  const handleSubsectionFlagChange = (subsectionKey: Section27SubsectionKey, value: 'YES' | 'NO') => {
    // console.log('🚩 UI: Subsection flag change:', { subsectionKey, value });
    updateSubsectionFlag(subsectionKey, value);
  };

  // Handle adding entries
  const handleAddEntry = (subsectionKey: Section27SubsectionKey) => {
    console.log('🚀 UI: Adding entry for subsection:', subsectionKey);
    // console.log('📊 UI: Current entries before add:', section27Data.section27[subsectionKey].entries);
    addEntry(subsectionKey);
    // setTimeout(() => {
    //   console.log('📊 UI: Entries after add (delayed check):', section27Data.section27[subsectionKey].entries);
    // }, 100);
  };

  // Handle removing entries
  const handleRemoveEntry = (subsectionKey: Section27SubsectionKey, entryIndex: number) => {
    console.log('🗑️ UI: Removing entry:', { subsectionKey, entryIndex });
    // console.log('📊 UI: Current entries before remove:', section27Data.section27[subsectionKey].entries);
    removeEntry(subsectionKey, entryIndex);
  };

  // Handle field value updates
  const handleFieldUpdate = (subsectionKey: Section27SubsectionKey, entryIndex: number, fieldPath: string, value: any) => {
    // console.log('✏️ UI: Field update requested:', { subsectionKey, entryIndex, fieldPath, value });
    // console.log('📊 UI: Current entry before update:', section27Data.section27[subsectionKey].entries[entryIndex]);
    updateFieldValue(subsectionKey, entryIndex, fieldPath, value);
    // setTimeout(() => {
    //   console.log('📊 UI: Entry after update (delayed check):', section27Data.section27[subsectionKey].entries[entryIndex]);
    // }, 100);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section27-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 27: Use of Information Technology Systems
        </h2>
        <p className="text-gray-600">
          Report any illegal access or unauthorized modification of information technology systems.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* 27.1: Illegal Access */}
        <div className="border rounded-lg p-6 bg-red-50">
          <h3 className="text-lg font-semibold mb-4 text-red-800">
            27.1 Illegal Access to Information Technology Systems
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Have you EVER illegally or without proper authorization accessed or attempted to access any information technology system?
          </p>

          <div className="space-y-2 mb-4">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="illegalAccess"
                value="YES"
                checked={section27Data.section27.illegalAccess.hasViolation.value === 'YES'}
                onChange={() => handleSubsectionFlagChange('illegalAccess', 'YES')}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                data-testid="illegal-access-yes"
              />
              <span className="text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="illegalAccess"
                value="NO"
                checked={section27Data.section27.illegalAccess.hasViolation.value === 'NO'}
                onChange={() => handleSubsectionFlagChange('illegalAccess', 'NO')}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                data-testid="illegal-access-no"
              />
              <span className="text-sm text-gray-700">No</span>
            </label>
          </div>

          {section27Data.section27.illegalAccess.hasViolation.value === 'YES' && (
            <div className="mt-4 p-4 bg-white rounded border">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Illegal Access Incidents ({getEntryCount('illegalAccess')})</h4>
                <button
                  type="button"
                  onClick={() => handleAddEntry('illegalAccess')}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  data-testid="add-illegal-access-entry"
                >
                  Add Incident
                </button>
              </div>

              {section27Data.section27.illegalAccess.entries.map((entry, index) => (
                <div key={index} className="border rounded p-4 mb-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-medium">Incident {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => handleRemoveEntry('illegalAccess', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      data-testid={`remove-illegal-access-${index}`}
                    >
                      Remove
                    </button>
                  </div>
                  
                  {/* Incident Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Incident Date
                      </label>
                      <input
                        type="date"
                        value={entry.incidentDate?.date?.value || ''}
                        onChange={(e) => handleFieldUpdate('illegalAccess', index, 'incidentDate.date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                        data-testid={`illegal-access-date-${index}`}
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={entry.incidentDate?.estimated?.value || false}
                          onChange={(e) => handleFieldUpdate('illegalAccess', index, 'incidentDate.estimated', e.target.checked)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          data-testid={`illegal-access-estimated-${index}`}
                        />
                        <span className="text-sm text-gray-700">Date is estimated</span>
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe the illegal access incident..."
                      value={entry.description?.value || ''}
                      onChange={(e) => handleFieldUpdate('illegalAccess', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                      rows={3}
                      data-testid={`illegal-access-description-${index}`}
                    />
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={entry.location?.street?.value || ''}
                          onChange={(e) => handleFieldUpdate('illegalAccess', index, 'location.street', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                          data-testid={`illegal-access-street-${index}`}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="City"
                          value={entry.location?.city?.value || ''}
                          onChange={(e) => handleFieldUpdate('illegalAccess', index, 'location.city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                          data-testid={`illegal-access-city-${index}`}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="State"
                          value={entry.location?.state?.value || ''}
                          onChange={(e) => handleFieldUpdate('illegalAccess', index, 'location.state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                          data-testid={`illegal-access-state-${index}`}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={entry.location?.zipCode?.value || ''}
                          onChange={(e) => handleFieldUpdate('illegalAccess', index, 'location.zipCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                          data-testid={`illegal-access-zipcode-${index}`}
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Country"
                        value={entry.location?.country?.value || ''}
                        onChange={(e) => handleFieldUpdate('illegalAccess', index, 'location.country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                        data-testid={`illegal-access-country-${index}`}
                      />
                    </div>
                  </div>

                  {/* Action Taken */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action Taken
                    </label>
                    <textarea
                      placeholder="Describe what action was taken regarding this incident..."
                      value={entry.actionTaken?.value || ''}
                      onChange={(e) => handleFieldUpdate('illegalAccess', index, 'actionTaken', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                      rows={2}
                      data-testid={`illegal-access-action-${index}`}
                    />
                  </div>

                  {/* Section 27.1 Specific Fields */}
                  {('systemAccessed' in entry) && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          System Accessed
                        </label>
                        <input
                          type="text"
                          placeholder="Name or description of the system accessed"
                          value={(entry as any).systemAccessed?.value || ''}
                          onChange={(e) => handleFieldUpdate('illegalAccess', index, 'systemAccessed', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                          data-testid={`illegal-access-system-${index}`}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Access Method
                        </label>
                        <input
                          type="text"
                          placeholder="How was the system accessed"
                          value={(entry as any).accessMethod?.value || ''}
                          onChange={(e) => handleFieldUpdate('illegalAccess', index, 'accessMethod', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                          data-testid={`illegal-access-method-${index}`}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 27.2: Illegal Modification */}
        <div className="border rounded-lg p-6 bg-orange-50">
          <h3 className="text-lg font-semibold mb-4 text-orange-800">
            27.2 Illegal Modification of Information Technology Systems
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Have you EVER illegally or without proper authorization modified, destroyed, manipulated, or denied others access to information in an information technology system?
          </p>

          <div className="space-y-2 mb-4">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="illegalModification"
                value="YES"
                checked={section27Data.section27.illegalModification.hasViolation.value === 'YES'}
                onChange={() => handleSubsectionFlagChange('illegalModification', 'YES')}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                data-testid="illegal-modification-yes"
              />
              <span className="text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="illegalModification"
                value="NO"
                checked={section27Data.section27.illegalModification.hasViolation.value === 'NO'}
                onChange={() => handleSubsectionFlagChange('illegalModification', 'NO')}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                data-testid="illegal-modification-no"
              />
              <span className="text-sm text-gray-700">No</span>
            </label>
          </div>

          {section27Data.section27.illegalModification.hasViolation.value === 'YES' && (
            <div className="mt-4 p-4 bg-white rounded border">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Illegal Modification Incidents ({getEntryCount('illegalModification')})</h4>
                <button
                  type="button"
                  onClick={() => handleAddEntry('illegalModification')}
                  className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                  data-testid="add-illegal-modification-entry"
                >
                  Add Incident
                </button>
              </div>

              {section27Data.section27.illegalModification.entries.map((entry, index) => (
                <div key={index} className="border rounded p-4 mb-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-medium">Incident {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => handleRemoveEntry('illegalModification', index)}
                      className="text-orange-600 hover:text-orange-800 text-sm"
                      data-testid={`remove-illegal-modification-${index}`}
                    >
                      Remove
                    </button>
                  </div>
                  
                  {/* Incident Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Incident Date
                      </label>
                      <input
                        type="date"
                        value={entry.incidentDate?.date?.value || ''}
                        onChange={(e) => handleFieldUpdate('illegalModification', index, 'incidentDate.date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                        data-testid={`illegal-modification-date-${index}`}
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={entry.incidentDate?.estimated?.value || false}
                          onChange={(e) => handleFieldUpdate('illegalModification', index, 'incidentDate.estimated', e.target.checked)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          data-testid={`illegal-modification-estimated-${index}`}
                        />
                        <span className="text-sm text-gray-700">Date is estimated</span>
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe the illegal modification incident..."
                      value={entry.description?.value || ''}
                      onChange={(e) => handleFieldUpdate('illegalModification', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                      rows={3}
                      data-testid={`illegal-modification-description-${index}`}
                    />
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={entry.location?.street?.value || ''}
                          onChange={(e) => handleFieldUpdate('illegalModification', index, 'location.street', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                          data-testid={`illegal-modification-street-${index}`}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="City"
                          value={entry.location?.city?.value || ''}
                          onChange={(e) => handleFieldUpdate('illegalModification', index, 'location.city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                          data-testid={`illegal-modification-city-${index}`}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="State"
                          value={entry.location?.state?.value || ''}
                          onChange={(e) => handleFieldUpdate('illegalModification', index, 'location.state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                          data-testid={`illegal-modification-state-${index}`}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={entry.location?.zipCode?.value || ''}
                          onChange={(e) => handleFieldUpdate('illegalModification', index, 'location.zipCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                          data-testid={`illegal-modification-zipcode-${index}`}
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Country"
                        value={entry.location?.country?.value || ''}
                        onChange={(e) => handleFieldUpdate('illegalModification', index, 'location.country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                        data-testid={`illegal-modification-country-${index}`}
                      />
                    </div>
                  </div>

                  {/* Action Taken */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action Taken
                    </label>
                    <textarea
                      placeholder="Describe what action was taken regarding this incident..."
                      value={entry.actionTaken?.value || ''}
                      onChange={(e) => handleFieldUpdate('illegalModification', index, 'actionTaken', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                      rows={2}
                      data-testid={`illegal-modification-action-${index}`}
                    />
                  </div>

                  {/* Section 27.2 Specific Fields */}
                  {('systemModified' in entry) && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          System Modified
                        </label>
                        <input
                          type="text"
                          placeholder="Name or description of the system modified"
                          value={(entry as any).systemModified?.value || ''}
                          onChange={(e) => handleFieldUpdate('illegalModification', index, 'systemModified', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                          data-testid={`illegal-modification-system-${index}`}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Modification Type
                        </label>
                        <input
                          type="text"
                          placeholder="Type of modification performed"
                          value={(entry as any).modificationType?.value || ''}
                          onChange={(e) => handleFieldUpdate('illegalModification', index, 'modificationType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                          data-testid={`illegal-modification-type-${index}`}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 27.3: Unauthorized Use */}
        <div className="border rounded-lg p-6 bg-blue-50">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">
            27.3 Unauthorized Use of Information Technology Systems
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Have you EVER introduced, removed, or used hardware, software, or media in connection with any information technology system without authorization, when specifically prohibited by rules, procedures, guidelines, or regulations?
          </p>

          <div className="space-y-2 mb-4">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="unauthorizedUse"
                value="YES"
                checked={section27Data.section27.unauthorizedUse.hasViolation.value === 'YES'}
                onChange={() => handleSubsectionFlagChange('unauthorizedUse', 'YES')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                data-testid="unauthorized-use-yes"
              />
              <span className="text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="unauthorizedUse"
                value="NO"
                checked={section27Data.section27.unauthorizedUse.hasViolation.value === 'NO'}
                onChange={() => handleSubsectionFlagChange('unauthorizedUse', 'NO')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                data-testid="unauthorized-use-no"
              />
              <span className="text-sm text-gray-700">No</span>
            </label>
          </div>

          {section27Data.section27.unauthorizedUse.hasViolation.value === 'YES' && (
            <div className="mt-4 p-4 bg-white rounded border">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Unauthorized Use Incidents ({getEntryCount('unauthorizedUse')})</h4>
                <button
                  type="button"
                  onClick={() => handleAddEntry('unauthorizedUse')}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  data-testid="add-unauthorized-use-entry"
                >
                  Add Incident
                </button>
              </div>

              {section27Data.section27.unauthorizedUse.entries.map((entry, index) => (
                <div key={index} className="border rounded p-4 mb-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-medium">Incident {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => handleRemoveEntry('unauthorizedUse', index)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      data-testid={`remove-unauthorized-use-${index}`}
                    >
                      Remove
                    </button>
                  </div>
                  
                  {/* Incident Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Incident Date
                      </label>
                      <input
                        type="date"
                        value={entry.incidentDate?.date?.value || ''}
                        onChange={(e) => handleFieldUpdate('unauthorizedUse', index, 'incidentDate.date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        data-testid={`unauthorized-use-date-${index}`}
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={entry.incidentDate?.estimated?.value || false}
                          onChange={(e) => handleFieldUpdate('unauthorizedUse', index, 'incidentDate.estimated', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          data-testid={`unauthorized-use-estimated-${index}`}
                        />
                        <span className="text-sm text-gray-700">Date is estimated</span>
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe the unauthorized use incident..."
                      value={entry.description?.value || ''}
                      onChange={(e) => handleFieldUpdate('unauthorizedUse', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      data-testid={`unauthorized-use-description-${index}`}
                    />
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={entry.location?.street?.value || ''}
                          onChange={(e) => handleFieldUpdate('unauthorizedUse', index, 'location.street', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                          data-testid={`unauthorized-use-street-${index}`}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="City"
                          value={entry.location?.city?.value || ''}
                          onChange={(e) => handleFieldUpdate('unauthorizedUse', index, 'location.city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                          data-testid={`unauthorized-use-city-${index}`}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="State"
                          value={entry.location?.state?.value || ''}
                          onChange={(e) => handleFieldUpdate('unauthorizedUse', index, 'location.state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                          data-testid={`unauthorized-use-state-${index}`}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={entry.location?.zipCode?.value || ''}
                          onChange={(e) => handleFieldUpdate('unauthorizedUse', index, 'location.zipCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                          data-testid={`unauthorized-use-zipcode-${index}`}
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Country"
                        value={entry.location?.country?.value || ''}
                        onChange={(e) => handleFieldUpdate('unauthorizedUse', index, 'location.country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        data-testid={`unauthorized-use-country-${index}`}
                      />
                    </div>
                  </div>

                  {/* Action Taken */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action Taken
                    </label>
                    <textarea
                      placeholder="Describe what action was taken regarding this incident..."
                      value={entry.actionTaken?.value || ''}
                      onChange={(e) => handleFieldUpdate('unauthorizedUse', index, 'actionTaken', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      data-testid={`unauthorized-use-action-${index}`}
                    />
                  </div>

                  {/* Section 27.3 Specific Fields */}
                  {('systemUsed' in entry) && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          System Used
                        </label>
                        <input
                          type="text"
                          placeholder="Name or description of the system used"
                          value={(entry as any).systemUsed?.value || ''}
                          onChange={(e) => handleFieldUpdate('unauthorizedUse', index, 'systemUsed', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                          data-testid={`unauthorized-use-system-${index}`}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Use Type
                        </label>
                        <input
                          type="text"
                          placeholder="Type of unauthorized use"
                          value={(entry as any).useType?.value || ''}
                          onChange={(e) => handleFieldUpdate('unauthorizedUse', index, 'useType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                          data-testid={`unauthorized-use-type-${index}`}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
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
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              data-testid="save-section-button"
              onClick={handleSave}
            >
              Save Section
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
        <div className="mt-4" data-testid="validation-status">
          <div className="text-sm text-gray-600">
            Section Status: <span className={`font-medium ${isDirty ? 'text-orange-500' : 'text-green-500'}`}>
              {isDirty ? 'Modified, needs save' : 'Up to date'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Validation: <span className={`font-medium ${isValid ? 'text-green-500' : 'text-red-500'}`}>
              {isValid ? 'Valid' : 'Has errors'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Auto-save: <span className={`font-medium ${sf86Form.autoSave ? 'text-green-500' : 'text-gray-500'}`}>
              {sf86Form.autoSave ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          {sf86Form.lastSaved && (
            <div className="text-sm text-gray-600">
              Last saved: <span className="font-medium text-blue-500">
                {sf86Form.lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </form>

      {/* Debug Information (Development Only) */}
      {typeof window !== 'undefined' && window.location.search.includes('debug=true') && (
        <details className="mt-6 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Section 27 Data:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(section27Data, null, 2)}
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

export default Section27Component;
