/**
 * Section 27: Use of Information Technology Systems - Component
 *
 * React component for SF-86 Section 27 using the new Form Architecture 2.0.
 * This component handles collection of information about illegal access
 * and unauthorized modification of information technology systems.
 */

import type { Section27SubsectionKey, Section27 } from 'api/interfaces/sections2.0/section27';
import React, { useEffect, useState, useCallback } from 'react';
import { useSection27 } from '~/state/contexts/sections2.0/section27';
import { useSF86Form } from '~/state/contexts/sections2.0/SF86FormContext';
import { cloneDeep, set } from 'lodash';

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
    validateSection,
    resetSection,
    getEntryCount,
    submitSectionData,
    errors
  } = useSection27();

  const sf86Form = useSF86Form();

  // Local state for form inputs (performance optimization - Section 1 pattern)
  const [localSectionData, setLocalSectionData] = useState<Section27>(section27Data);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  // Sync local state when context data changes (initial load)
  useEffect(() => {
    setLocalSectionData(section27Data);
    setHasLocalChanges(false);
  }, [section27Data]);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section27Data, validateSection, onValidationChange]);

  // Handle submission with data persistence (optimized for performance)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // console.log('🔍 Section 27: Starting form submission...');
    // console.log('📊 Section 27 context data:', section27Data);
    // console.log('📊 Section 27 local data:', localSectionData);

    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    // console.log('🔍 Section 27 validation result:', result);

    if (result.isValid) {
      try {
        // console.log('🔄 Section 27: Starting data synchronization...');

        // Use submit-only mode for optimal performance
        await submitSectionData();

        // console.log('✅ Section 27: Data synchronization complete, proceeding to save...');

        // Get the current form data and update it with section27 data for immediate saving
        const currentFormData = sf86Form.exportForm();
        const updatedFormData = { ...currentFormData, section27: section27Data };

        // Save the form data to persistence layer with the updated data
        await sf86Form.saveForm(updatedFormData);

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section27');

        // console.log('✅ Section 27 data saved successfully:', section27Data);

        // Clear local changes flag
        setHasLocalChanges(false);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        // console.error('❌ Failed to save Section 27 data:', error);
        // Show an error message to user
        // console.log('There was an error saving your information. Please try again.');
      }
    }
  };


  // Handle subsection flag changes
  const handleSubsectionFlagChange = (subsectionKey: Section27SubsectionKey, value: 'YES' | 'NO') => {
    updateSubsectionFlag(subsectionKey, value);
  };

  // Handle adding entries
  const handleAddEntry = (subsectionKey: Section27SubsectionKey) => {
    addEntry(subsectionKey);
  };

  // Handle removing entries
  const handleRemoveEntry = (subsectionKey: Section27SubsectionKey, entryIndex: number) => {
    removeEntry(subsectionKey, entryIndex);
  };



  // Handle field value updates (optimized for performance - local state only)
  const handleFieldUpdate = useCallback((subsectionKey: Section27SubsectionKey, entryIndex: number, fieldPath: string, value: any) => {
    // console.log('🔧 Section 27: Updating field locally:', { subsectionKey, entryIndex, fieldPath, value });

    // Update local state instead of context for optimal performance
    setLocalSectionData(prev => {
      const updated = cloneDeep(prev);
      const fullFieldPath = `section27.${subsectionKey}.entries[${entryIndex}].${fieldPath}`;
      set(updated, fullFieldPath, value);
      return updated;
    });

    // Mark that we have local changes
    setHasLocalChanges(true);
  }, []);

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

              {section27Data.section27.illegalAccess.entries.map((_, index) => (
                <div key={index} className="border rounded p-3 mb-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
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
                  <textarea
                    placeholder="Describe the illegal access incident..."
                    value={localSectionData.section27.illegalAccess.entries[index]?.description?.value || ''}
                    onChange={(e) => handleFieldUpdate('illegalAccess', index, 'description.value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={3}
                    data-testid={`illegal-access-description-${index}`}
                  />
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

              {section27Data.section27.illegalModification.entries.map((_, index) => (
                <div key={index} className="border rounded p-3 mb-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
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
                  <textarea
                    placeholder="Describe the illegal modification incident..."
                    value={localSectionData.section27.illegalModification.entries[index]?.description?.value || ''}
                    onChange={(e) => handleFieldUpdate('illegalModification', index, 'description.value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={3}
                    data-testid={`illegal-modification-description-${index}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 27.3: Unauthorized Entry */}
        <div className="border rounded-lg p-6 bg-purple-50">
          <h3 className="text-lg font-semibold mb-4 text-purple-800">
            27.3 Unauthorized Entry to Information Technology Systems
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Have you EVER made any unauthorized entry into any information technology system?
          </p>

          <div className="space-y-2 mb-4">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="unauthorizedEntry"
                value="YES"
                checked={section27Data.section27.unauthorizedEntry.hasViolation.value === 'YES'}
                onChange={() => handleSubsectionFlagChange('unauthorizedEntry', 'YES')}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                data-testid="unauthorized-entry-yes"
              />
              <span className="text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="unauthorizedEntry"
                value="NO"
                checked={section27Data.section27.unauthorizedEntry.hasViolation.value === 'NO'}
                onChange={() => handleSubsectionFlagChange('unauthorizedEntry', 'NO')}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                data-testid="unauthorized-entry-no"
              />
              <span className="text-sm text-gray-700">No</span>
            </label>
          </div>

          {section27Data.section27.unauthorizedEntry.hasViolation.value === 'YES' && (
            <div className="mt-4 p-4 bg-white rounded border">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Unauthorized Entry Incidents ({getEntryCount('unauthorizedEntry')})</h4>
                <button
                  type="button"
                  onClick={() => handleAddEntry('unauthorizedEntry')}
                  className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                  data-testid="add-unauthorized-entry-entry"
                >
                  Add Incident
                </button>
              </div>

              {section27Data.section27.unauthorizedEntry.entries.map((_, index) => (
                <div key={index} className="border rounded p-3 mb-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium">Incident {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => handleRemoveEntry('unauthorizedEntry', index)}
                      className="text-purple-600 hover:text-purple-800 text-sm"
                      data-testid={`remove-unauthorized-entry-${index}`}
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    placeholder="Describe the unauthorized entry incident..."
                    value={localSectionData.section27.unauthorizedEntry.entries[index]?.description?.value || ''}
                    onChange={(e) => handleFieldUpdate('unauthorizedEntry', index, 'description.value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={3}
                    data-testid={`unauthorized-entry-description-${index}`}
                  />
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
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              data-testid="clear-section-button"
              onClick={resetSection}
            >
              Clear Section
            </button>
          </div>
        </div>

        {/* Validation Status */}
     
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
