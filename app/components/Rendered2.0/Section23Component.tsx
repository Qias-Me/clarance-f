/**
 * Section 23: Illegal Use of Drugs or Drug Activity Component
 *
 * This component provides the user interface for Section 23 of the SF-86 form,
 * which covers illegal drug use, drug-related activities, treatment history,
 * and foreign drug use. It integrates with the Section23Context for state management.
 */

import type { Section23SubsectionKey } from "../../../api/interfaces/sections2.0/section23";
import React, { useState, useCallback } from "react";
import { useSection23 } from "~/state/contexts/sections2.0/section23";
import { useSF86Form } from "~/state/contexts/SF86FormContext";

interface Section23ComponentProps {
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section23Component: React.FC<Section23ComponentProps> = ({
  onValidationChange,
  onNext,
}) => {
  const {
    section23Data,
    updateSubsectionFlag,
    updateFieldValue,
    addDrugUseEntry,
    addDrugActivityEntry,
    addDrugTreatmentEntry,
    addForeignDrugUseEntry,
    removeEntry,
    updateEntryField,
    validateSection,
    hasAnyDrugUse,
    hasAnyDrugActivity,
    hasAnyTreatment,
    getCurrentDrugStatus,
    getEntryCount,
  } = useSection23();

  const sf86Form = useSF86Form();

  const [activeSubsection, setActiveSubsection] = useState<Section23SubsectionKey>("drugUse");
  const [isValid, setIsValid] = useState(true);

  // Handle validation changes
  const handleValidation = useCallback(() => {
    const validation = validateSection();
    onValidationChange?.(validation.isValid);
    return validation;
  }, [validateSection, onValidationChange]);

  // Handle subsection flag changes with proper field path updates
  const handleSubsectionFlagChange = useCallback((
    subsectionKey: Section23SubsectionKey,
    fieldName: string,
    value: "YES" | "NO"
  ) => {
    console.log(`🔄 Section23Component: Updating ${subsectionKey}.${fieldName} to ${value}`);
    const fieldPath = `section23.${subsectionKey}.${fieldName}.value`;
    updateFieldValue(fieldPath, value);
    setTimeout(handleValidation, 0);
  }, [updateFieldValue, handleValidation]);

  // Handle direct field updates
  const handleDirectFieldUpdate = useCallback((
    fieldPath: string,
    value: any
  ) => {
    console.log(`🔄 Section23Component: Direct field update ${fieldPath} to`, value);
    updateFieldValue(fieldPath, value);
    setTimeout(handleValidation, 0);
  }, [updateFieldValue, handleValidation]);

  // Handle field updates for entries
  const handleFieldUpdate = useCallback((
    subsectionKey: Section23SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    value: any
  ) => {
    updateEntryField(subsectionKey, entryIndex, fieldPath, value);
    setTimeout(handleValidation, 0);
  }, [updateEntryField, handleValidation]);

  // Get drug status for monitoring
  const drugStatus = getCurrentDrugStatus();

    // Handle submission with data persistence
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const result = validateSection();
      setIsValid(result.isValid);
      onValidationChange?.(result.isValid);
  
      if (result.isValid) {
        try {
          // Update the central form context with Section 1 data
          sf86Form.updateSectionData('section23', section23Data);
  
          // Save the form data to persistence layer
          await sf86Form.saveForm();
  
          console.log('✅ Section 23 data saved successfully:', section23Data);
  
          // Proceed to next section if callback provided
          if (onNext) {
            onNext();
          }
        } catch (error) {
          console.error('❌ Failed to save Section 23 data:', error);
          // Could show an error message to user here
        }
      }
    };
  

  return (
    <div className="bg-white rounded-lg shadow-lg p-6" data-testid="section23-container">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Section 23: Illegal Use of Drugs or Drug Activity
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Report illegal drug use and drug-related activities within specified timeframes.
          This includes both federally illegal drugs and substances that may be legal under
          state law but illegal federally.
        </p>

        {/* Status Indicators */}
        {(hasAnyDrugUse() || hasAnyDrugActivity() || hasAnyTreatment()) && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Drug-Related Issues Reported</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    {hasAnyDrugUse() && <li>Drug use reported</li>}
                    {hasAnyDrugActivity() && <li>Drug-related activities reported</li>}
                    {hasAnyTreatment() && <li>Treatment history reported</li>}
                    {drugStatus.requiresMonitoring && <li className="font-semibold">Ongoing monitoring may be required</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subsection Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1" aria-label="Subsections">
          {[
            { key: "drugUse" as const, name: "Drug Use (23.1)", count: getEntryCount("drugUse") },
            { key: "drugActivity" as const, name: "Drug Activity (23.2)", count: getEntryCount("drugActivity") },
            { key: "drugTreatment" as const, name: "Treatment (23.3)", count: getEntryCount("drugTreatment") },
            { key: "foreignDrugUse" as const, name: "Foreign Use (23.4)", count: getEntryCount("foreignDrugUse") },
          ].map((subsection) => (
            <button
              key={subsection.key}
              onClick={() => setActiveSubsection(subsection.key)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeSubsection === subsection.key
                  ? "bg-blue-500 text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              data-testid={`${subsection.key}-tab`}
            >
              {subsection.name}
              {subsection.count > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-100 bg-blue-600 rounded-full">
                  {subsection.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Drug Use Subsection */}
      {activeSubsection === "drugUse" && (
        <div className="space-y-6" data-testid="drug-use-subsection">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              23.1 Illegal Use of Drugs (Last 7 Years)
            </h3>

            {/* Flag Questions */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Have you illegally used any drugs or controlled substances?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasUsedIllegalDrugs"
                      value="YES"
                      checked={section23Data.section23.drugUse.hasUsedIllegalDrugs.value === "YES"}
                      onChange={() => handleSubsectionFlagChange("drugUse", "hasUsedIllegalDrugs", "YES")}
                      className="mr-2"
                      data-testid="illegal-drugs-yes"
                    />
                    YES
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasUsedIllegalDrugs"
                      value="NO"
                      checked={section23Data.section23.drugUse.hasUsedIllegalDrugs.value === "NO"}
                      onChange={() => handleSubsectionFlagChange("drugUse", "hasUsedIllegalDrugs", "NO")}
                      className="mr-2"
                      data-testid="illegal-drugs-no"
                    />
                    NO
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Have you illegally used prescription drugs?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasUsedPrescriptionDrugsIllegally"
                      value="YES"
                      checked={section23Data.section23.drugUse.hasUsedPrescriptionDrugsIllegally.value === "YES"}
                      onChange={() => handleSubsectionFlagChange("drugUse", "hasUsedPrescriptionDrugsIllegally", "YES")}
                      className="mr-2"
                      data-testid="prescription-drugs-yes"
                    />
                    YES
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasUsedPrescriptionDrugsIllegally"
                      value="NO"
                      checked={section23Data.section23.drugUse.hasUsedPrescriptionDrugsIllegally.value === "NO"}
                      onChange={() => handleSubsectionFlagChange("drugUse", "hasUsedPrescriptionDrugsIllegally", "NO")}
                      className="mr-2"
                      data-testid="prescription-drugs-no"
                    />
                    NO
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Do you intend to use illegal drugs in the future?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="intentToContinueUse"
                      value="YES"
                      checked={section23Data.section23.drugUse.intentToContinueUse.value === "YES"}
                      onChange={() => handleSubsectionFlagChange("drugUse", "intentToContinueUse", "YES")}
                      className="mr-2"
                      data-testid="intent-continue-yes"
                    />
                    YES
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="intentToContinueUse"
                      value="NO"
                      checked={section23Data.section23.drugUse.intentToContinueUse.value === "NO"}
                      onChange={() => handleSubsectionFlagChange("drugUse", "intentToContinueUse", "NO")}
                      className="mr-2"
                      data-testid="intent-continue-no"
                    />
                    NO
                  </label>
                </div>
              </div>

              {section23Data.section23.drugUse.intentToContinueUse.value === "YES" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explain your intention to continue using illegal drugs:
                  </label>
                  <textarea
                    value={section23Data.section23.drugUse.intentExplanation.value || ""}
                    onChange={(e) => handleDirectFieldUpdate("section23.drugUse.intentExplanation.value", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide explanation..."
                    data-testid="intent-explanation"
                  />
                </div>
              )}
            </div>

            {/* Add Entry Button */}
            {hasAnyDrugUse() && (
              <div className="mb-6">
                <button
                  onClick={addDrugUseEntry}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  data-testid="add-drug-use-entry"
                >
                  Add Drug Use Entry
                </button>
              </div>
            )}

            {/* Entries List */}
            {section23Data.section23.drugUse.entries.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-800">Drug Use Entries:</h4>
                {section23Data.section23.drugUse.entries.map((entry, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <h5 className="text-sm font-semibold text-gray-700">Entry {index + 1}</h5>
                      <button
                        onClick={() => removeEntry("drugUse", index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        data-testid={`remove-drug-use-entry-${index}`}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Drug Type:
                        </label>
                        <select
                          value={entry.drugType.value || ""}
                          onChange={(e) => handleFieldUpdate("drugUse", index, "drugType.value", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select drug type...</option>
                          <option value="marijuana_cannabis">Marijuana/Cannabis</option>
                          <option value="cocaine">Cocaine</option>
                          <option value="heroin">Heroin</option>
                          <option value="prescription_drugs">Prescription Drugs</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Drug Name:
                        </label>
                        <input
                          type="text"
                          value={entry.drugName.value || ""}
                          onChange={(e) => handleFieldUpdate("drugUse", index, "drugName.value", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Specific drug name..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Use Date:
                        </label>
                        <input
                          type="date"
                          value={entry.firstUse.date.value || ""}
                          onChange={(e) => handleFieldUpdate("drugUse", index, "firstUse.date.value", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Most Recent Use:
                        </label>
                        <input
                          type="date"
                          value={entry.mostRecentUse.date.value || ""}
                          onChange={(e) => handleFieldUpdate("drugUse", index, "mostRecentUse.date.value", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nature of Use, Frequency, and Number of Times:
                      </label>
                      <textarea
                        value={entry.natureOfUse.value || ""}
                        onChange={(e) => handleFieldUpdate("drugUse", index, "natureOfUse.value", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the nature of use, frequency, and number of times..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drug Activity Subsection */}
      {activeSubsection === "drugActivity" && (
        <div className="space-y-6" data-testid="drug-activity-subsection">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              23.2 Drug-Related Activities
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Have you ever been involved in the sale, distribution, or trafficking of illegal drugs?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasEngagedInDrugActivity"
                      value="YES"
                      checked={section23Data.section23.drugActivity.hasEngagedInDrugActivity.value === "YES"}
                      onChange={() => handleSubsectionFlagChange("drugActivity", "YES")}
                      className="mr-2"
                    />
                    YES
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasEngagedInDrugActivity"
                      value="NO"
                      checked={section23Data.section23.drugActivity.hasEngagedInDrugActivity.value === "NO"}
                      onChange={() => handleSubsectionFlagChange("drugActivity", "NO")}
                      className="mr-2"
                    />
                    NO
                  </label>
                </div>
              </div>
            </div>

            {hasAnyDrugActivity() && (
              <div className="mb-6">
                <button
                  onClick={addDrugActivityEntry}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  data-testid="add-drug-activity-entry"
                >
                  Add Drug Activity Entry
                </button>
              </div>
            )}

            {section23Data.section23.drugActivity.entries.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-800">Drug Activity Entries:</h4>
                {section23Data.section23.drugActivity.entries.map((entry, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <h5 className="text-sm font-semibold text-gray-700">Activity {index + 1}</h5>
                      <button
                        onClick={() => removeEntry("drugActivity", index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        data-testid={`remove-drug-activity-entry-${index}`}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Activity Type:
                        </label>
                        <select
                          value={entry.activityType.value || ""}
                          onChange={(e) => handleFieldUpdate("drugActivity", index, "activityType.value", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select activity type...</option>
                          <option value="purchase">Purchase</option>
                          <option value="sale">Sale</option>
                          <option value="distribution">Distribution</option>
                          <option value="manufacturing">Manufacturing</option>
                          <option value="trafficking">Trafficking</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Activity Description:
                        </label>
                        <textarea
                          value={entry.activityDescription.value || ""}
                          onChange={(e) => handleFieldUpdate("drugActivity", index, "activityDescription.value", e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Describe the activity in detail..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drug Treatment Subsection */}
      {activeSubsection === "drugTreatment" && (
        <div className="space-y-6" data-testid="drug-treatment-subsection">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              23.3 Drug Treatment History
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Have you ever received treatment for drug abuse?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasReceivedDrugTreatment"
                      value="YES"
                      checked={section23Data.section23.drugTreatment.hasReceivedDrugTreatment.value === "YES"}
                      onChange={() => handleSubsectionFlagChange("drugTreatment", "YES")}
                      className="mr-2"
                    />
                    YES
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasReceivedDrugTreatment"
                      value="NO"
                      checked={section23Data.section23.drugTreatment.hasReceivedDrugTreatment.value === "NO"}
                      onChange={() => handleSubsectionFlagChange("drugTreatment", "NO")}
                      className="mr-2"
                    />
                    NO
                  </label>
                </div>
              </div>
            </div>

            {hasAnyTreatment() && (
              <div className="mb-6">
                <button
                  onClick={addDrugTreatmentEntry}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  data-testid="add-drug-treatment-entry"
                >
                  Add Treatment Entry
                </button>
              </div>
            )}

            {section23Data.section23.drugTreatment.entries.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-800">Treatment Entries:</h4>
                {section23Data.section23.drugTreatment.entries.map((entry, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <h5 className="text-sm font-semibold text-gray-700">Treatment {index + 1}</h5>
                      <button
                        onClick={() => removeEntry("drugTreatment", index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        data-testid={`remove-drug-treatment-entry-${index}`}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Treatment Type:
                        </label>
                        <select
                          value={entry.treatmentType.value || ""}
                          onChange={(e) => handleFieldUpdate("drugTreatment", index, "treatmentType.value", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select treatment type...</option>
                          <option value="inpatient">Inpatient</option>
                          <option value="outpatient">Outpatient</option>
                          <option value="counseling">Counseling</option>
                          <option value="support_group">Support Group</option>
                          <option value="detox">Detox</option>
                          <option value="rehabilitation">Rehabilitation</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Provider Name:
                        </label>
                        <input
                          type="text"
                          value={entry.providerName.value || ""}
                          onChange={(e) => handleFieldUpdate("drugTreatment", index, "providerName.value", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Treatment provider name..."
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Treatment Description:
                      </label>
                      <textarea
                        value={entry.treatmentDescription.value || ""}
                        onChange={(e) => handleFieldUpdate("drugTreatment", index, "treatmentDescription.value", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the treatment received..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Foreign Drug Use Subsection */}
      {activeSubsection === "foreignDrugUse" && (
        <div className="space-y-6" data-testid="foreign-drug-use-subsection">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              23.4 Foreign Drug Use
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Have you used drugs while outside the United States?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasUsedDrugsAbroad"
                      value="YES"
                      checked={section23Data.section23.foreignDrugUse.hasUsedDrugsAbroad.value === "YES"}
                      onChange={() => handleSubsectionFlagChange("foreignDrugUse", "YES")}
                      className="mr-2"
                    />
                    YES
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasUsedDrugsAbroad"
                      value="NO"
                      checked={section23Data.section23.foreignDrugUse.hasUsedDrugsAbroad.value === "NO"}
                      onChange={() => handleSubsectionFlagChange("foreignDrugUse", "NO")}
                      className="mr-2"
                    />
                    NO
                  </label>
                </div>
              </div>
            </div>

            {section23Data.section23.foreignDrugUse.hasUsedDrugsAbroad.value === "YES" && (
              <div className="mb-6">
                <button
                  onClick={addForeignDrugUseEntry}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  data-testid="add-foreign-drug-use-entry"
                >
                  Add Foreign Drug Use Entry
                </button>
              </div>
            )}

            {section23Data.section23.foreignDrugUse.entries.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-800">Foreign Drug Use Entries:</h4>
                {section23Data.section23.foreignDrugUse.entries.map((entry, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <h5 className="text-sm font-semibold text-gray-700">Foreign Use {index + 1}</h5>
                      <button
                        onClick={() => removeEntry("foreignDrugUse", index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        data-testid={`remove-foreign-drug-use-entry-${index}`}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Drug Type:
                        </label>
                        <select
                          value={entry.drugType.value || ""}
                          onChange={(e) => handleFieldUpdate("foreignDrugUse", index, "drugType.value", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select drug type...</option>
                          <option value="marijuana_cannabis">Marijuana/Cannabis</option>
                          <option value="cocaine">Cocaine</option>
                          <option value="heroin">Heroin</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country/Location:
                        </label>
                        <input
                          type="text"
                          value={entry.primaryUseLocation.country.value || ""}
                          onChange={(e) => handleFieldUpdate("foreignDrugUse", index, "primaryUseLocation.country.value", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Country where drug was used..."
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Circumstances:
                      </label>
                      <textarea
                        value={entry.circumstances.value || ""}
                        onChange={(e) => handleFieldUpdate("foreignDrugUse", index, "circumstances.value", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the circumstances of drug use while abroad..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validation Summary */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleValidation}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors mr-4"
          data-testid="validate-section23"
        >
          Validate Section
        </button>

        <div className="mt-4 text-sm text-gray-600">
          <p>
            <strong>Section Status:</strong> {" "}
            {hasAnyDrugUse() || hasAnyDrugActivity() || hasAnyTreatment()
              ? "Has drug-related issues reported"
              : "No drug-related issues reported"
            }
          </p>

          {drugStatus.requiresMonitoring && (
            <p className="mt-2 text-yellow-700 font-medium">
              ⚠️ This section indicates ongoing drug concerns that may require additional monitoring or evaluation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Section23Component;