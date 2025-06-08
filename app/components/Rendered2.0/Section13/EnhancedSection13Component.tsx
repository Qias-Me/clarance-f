/**
 * Enhanced Section 13 Component
 * 
 * Orchestrates all employment subsections (13A.1-13A.6) with proper
 * employment type routing and validation
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useSection13 } from '~/state/contexts/sections2.0/section13';
import EmploymentTypeSelector from './EmploymentTypeSelector';
import MilitaryEmploymentForm from './MilitaryEmploymentForm';
import NonFederalEmploymentForm from './NonFederalEmploymentForm';
import SelfEmploymentForm from './SelfEmploymentForm';
import UnemploymentForm from './UnemploymentForm';

interface EnhancedSection13ComponentProps {
  onValidationChange?: (isValid: boolean) => void;
}

type EmploymentFormStep = 'type-selection' | 'form-entry' | 'summary';

export const EnhancedSection13Component: React.FC<EnhancedSection13ComponentProps> = ({
  onValidationChange
}) => {
  const {
    sectionData,
    updateEmploymentFlag,
    updateGapsFlag,
    updateGapExplanation,
    getActiveEmploymentType,
    addMilitaryEmploymentEntry,
    addNonFederalEmploymentEntry,
    addSelfEmploymentEntry,
    addUnemploymentEntry,
    getMilitaryEmploymentEntryCount,
    getNonFederalEmploymentEntryCount,
    getSelfEmploymentEntryCount,
    getUnemploymentEntryCount,
    updateMilitaryEmploymentEntry,
    updateNonFederalEmploymentEntry,
    updateSelfEmploymentEntry,
    updateUnemploymentEntry,
    validateSection,
    saveToMainContext
  } = useSection13();

  const [currentStep, setCurrentStep] = useState<EmploymentFormStep>('type-selection');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<string>('');
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<number, string[]>>({});
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle employment type selection
  const handleEmploymentTypeSelected = useCallback((type: string) => {
    setSelectedEmploymentType(type);
    setCurrentStep('form-entry');
  }, []);

  // Handle adding new employment entry based on type
  const handleAddEmploymentEntry = useCallback(() => {
    const activeType = getActiveEmploymentType();
    
    switch (activeType) {
      case 'Active Military Duty':
      case 'Federal Civilian':
        addMilitaryEmploymentEntry();
        break;
      case 'State Government':
      case 'Private Company':
      case 'Other':
        addNonFederalEmploymentEntry();
        break;
      case 'Self-Employment':
        addSelfEmploymentEntry();
        break;
      case 'Unemployment':
        addUnemploymentEntry();
        break;
      default:
        console.warn('Unknown employment type:', activeType);
    }
  }, [
    getActiveEmploymentType,
    addMilitaryEmploymentEntry,
    addNonFederalEmploymentEntry,
    addSelfEmploymentEntry,
    addUnemploymentEntry
  ]);

  // Get total entry count across all employment types
  const getTotalEntryCount = useCallback(() => {
    return (
      getMilitaryEmploymentEntryCount() +
      getNonFederalEmploymentEntryCount() +
      getSelfEmploymentEntryCount() +
      getUnemploymentEntryCount()
    );
  }, [
    getMilitaryEmploymentEntryCount,
    getNonFederalEmploymentEntryCount,
    getSelfEmploymentEntryCount,
    getUnemploymentEntryCount
  ]);

  // Handle field updates for different employment types
  const handleFieldUpdate = useCallback((entryType: string, entryIndex: number, fieldPath: string, value: any) => {
    switch (entryType) {
      case 'military':
        updateMilitaryEmploymentEntry(entryIndex, fieldPath, value);
        break;
      case 'nonFederal':
        updateNonFederalEmploymentEntry(entryIndex, fieldPath, value);
        break;
      case 'selfEmployment':
        updateSelfEmploymentEntry(entryIndex, fieldPath, value);
        break;
      case 'unemployment':
        updateUnemploymentEntry(entryIndex, fieldPath, value);
        break;
      default:
        console.warn('Unknown entry type:', entryType);
    }
  }, [
    updateMilitaryEmploymentEntry,
    updateNonFederalEmploymentEntry,
    updateSelfEmploymentEntry,
    updateUnemploymentEntry
  ]);

  // Handle employment flag changes
  const handleEmploymentFlagChange = useCallback((value: "YES" | "NO") => {
    updateEmploymentFlag(value);
    if (value === "YES" && currentStep === 'type-selection') {
      // Stay on type selection if user says yes to employment
    } else if (value === "NO") {
      setCurrentStep('summary');
    }
  }, [updateEmploymentFlag, currentStep]);

  // Handle gaps flag changes
  const handleGapsFlagChange = useCallback((value: "YES" | "NO") => {
    updateGapsFlag(value);
  }, [updateGapsFlag]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    try {
      const validation = validateSection();
      if (validation.isValid) {
        saveToMainContext();
        console.log('✅ Section 13 saved successfully');
      } else {
        console.warn('❌ Section 13 validation failed:', validation.errors);
        setGlobalErrors(validation.errors || []);
      }
    } catch (error) {
      console.error('❌ Error saving Section 13:', error);
    } finally {
      setIsLoading(false);
    }
  }, [validateSection, saveToMainContext]);

  // Validation effect
  useEffect(() => {
    const validation = validateSection();
    setGlobalErrors(validation.errors || []);
    onValidationChange?.(validation.isValid);
  }, [sectionData, validateSection, onValidationChange]);

  // Render employment entries based on type
  const renderEmploymentEntries = () => {
    const activeType = getActiveEmploymentType();

    if (activeType === 'Active Military Duty' || activeType === 'Federal Civilian') {
      return sectionData?.section13?.militaryEmployment?.entries?.map((entry, index) => (
        <div key={entry._id} className="border rounded-lg p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              {activeType} Entry {index + 1}
            </h4>
            <button
              type="button"
              onClick={() => {
                // Handle remove military entry
                // removeMilitaryEmploymentEntry(index);
              }}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
          <MilitaryEmploymentForm
            entry={entry}
            entryIndex={index}
            onFieldUpdate={(fieldPath, value) => handleFieldUpdate('military', index, fieldPath, value)}
            validationErrors={validationErrors[index]}
          />
        </div>
      ));
    }

    if (activeType === 'State Government' || activeType === 'Private Company' || activeType === 'Other') {
      return sectionData?.section13?.nonFederalEmployment?.entries?.map((entry, index) => (
        <div key={entry._id} className="border rounded-lg p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              {activeType} Entry {index + 1}
            </h4>
            <button
              type="button"
              onClick={() => {
                // Handle remove non-federal entry
                // removeNonFederalEmploymentEntry(index);
              }}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
          <NonFederalEmploymentForm
            entry={entry}
            entryIndex={index}
            onFieldUpdate={(fieldPath, value) => handleFieldUpdate('nonFederal', index, fieldPath, value)}
            validationErrors={validationErrors[index]}
          />
        </div>
      ));
    }

    if (activeType === 'Self-Employment') {
      return sectionData?.section13?.selfEmployment?.entries?.map((entry, index) => (
        <div key={entry._id} className="border rounded-lg p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              Self-Employment Entry {index + 1}
            </h4>
            <button
              type="button"
              onClick={() => {
                // Handle remove self-employment entry
                // removeSelfEmploymentEntry(index);
              }}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
          <SelfEmploymentForm
            entry={entry}
            entryIndex={index}
            onFieldUpdate={(fieldPath, value) => handleFieldUpdate('selfEmployment', index, fieldPath, value)}
            validationErrors={validationErrors[index]}
          />
        </div>
      ));
    }

    if (activeType === 'Unemployment') {
      return sectionData?.section13?.unemployment?.entries?.map((entry, index) => (
        <div key={entry._id} className="border rounded-lg p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              Unemployment Period {index + 1}
            </h4>
            <button
              type="button"
              onClick={() => {
                // Handle remove unemployment entry
                // removeUnemploymentEntry(index);
              }}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
          <UnemploymentForm
            entry={entry}
            entryIndex={index}
            onFieldUpdate={(fieldPath, value) => handleFieldUpdate('unemployment', index, fieldPath, value)}
            validationErrors={validationErrors[index]}
          />
        </div>
      ));
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 13: Employment Activities
        </h2>
        <p className="text-gray-600">
          Provide information about your employment history for the past 10 years,
          including all types of employment, unemployment periods, and employment-related activities.
        </p>
      </div>

      {/* Show global validation errors */}
      {globalErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-sm font-medium text-red-800 mb-2">
            Please correct the following errors:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
            {globalErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Employment Questions */}
      <div className="space-y-6 mb-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            13.a. Have you been employed in the last 10 years?
          </h3>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasEmployment"
                checked={sectionData?.section13?.hasEmployment?.value === "YES"}
                onChange={() => handleEmploymentFlagChange("YES")}
                className="mr-2"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasEmployment"
                checked={sectionData?.section13?.hasEmployment?.value === "NO"}
                onChange={() => handleEmploymentFlagChange("NO")}
                className="mr-2"
              />
              <span className="text-sm">No</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            13.b. Are there any gaps in your employment history?
          </h3>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasGaps"
                checked={sectionData?.section13?.hasGaps?.value === "YES"}
                onChange={() => handleGapsFlagChange("YES")}
                className="mr-2"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasGaps"
                checked={sectionData?.section13?.hasGaps?.value === "NO"}
                onChange={() => handleGapsFlagChange("NO")}
                className="mr-2"
              />
              <span className="text-sm">No</span>
            </label>
          </div>

          {sectionData?.section13?.hasGaps?.value === "YES" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explain any gaps in employment:
              </label>
              <textarea
                value={sectionData?.section13?.gapExplanation?.value || ""}
                onChange={(e) => updateGapExplanation(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide details about any gaps in your employment history"
              />
            </div>
          )}
        </div>
      </div>

      {/* Employment Entry Section */}
      {sectionData?.section13?.hasEmployment?.value === "YES" && (
        <div className="space-y-6">
          {currentStep === 'type-selection' && (
            <EmploymentTypeSelector onTypeSelected={handleEmploymentTypeSelected} />
          )}

          {currentStep === 'form-entry' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {getActiveEmploymentType()} Employment History
                </h3>
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('type-selection')}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                  >
                    Change Type
                  </button>
                  <button
                    type="button"
                    onClick={handleAddEmploymentEntry}
                    disabled={getTotalEntryCount() >= 15}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    Add Entry
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {renderEmploymentEntries()}
              </div>

              {getTotalEntryCount() === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 mb-4">
                    No employment entries yet. Click "Add Entry" to get started.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Section 13'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSection13Component;
