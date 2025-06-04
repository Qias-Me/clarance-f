/**
 * Section 24: Use of Alcohol Component
 *
 * This component provides the user interface for Section 24 of the SF-86 form,
 * which covers alcohol use and its negative impacts on work performance,
 * professional or personal relationships, finances, and incidents involving
 * law enforcement or public safety personnel.
 */

import type { Section24SubsectionKey } from "api/interfaces/sections2.0/section24";
import React, { useState, useCallback } from "react";
import { useSection24 } from "~/state/contexts/sections2.0/section24";
import { useSF86Form } from "~/state/contexts/SF86FormContext";

interface Section24ComponentProps {
  onValidationChange?: (isValid: boolean) => void;
}

export const Section24Component: React.FC<Section24ComponentProps> = ({
  onValidationChange,
}) => {
  const {
    sectionData,
    updateSubsectionFlag,
    addAlcoholImpactEntry,
    addAlcoholTreatmentEntry,
    addAlcoholConsumptionEntry,
    removeEntry,
    updateEntryField,
    validateSection,
    hasAnyAlcoholImpacts,
    hasAnyAlcoholTreatment,
    hasCurrentAlcoholConcerns,
    getCurrentAlcoholStatus,
    getEntryCount,
  } = useSection24();

  const sf86Form = useSF86Form();

  const [activeSubsection, setActiveSubsection] = useState<Section24SubsectionKey>("alcoholImpacts");

  // Handle validation changes
  const handleValidation = useCallback(() => {
    const validation = validateSection();
    onValidationChange?.(validation.isValid);
    return validation;
  }, [validateSection, onValidationChange]);

  // Handle subsection flag changes
  const handleSubsectionFlagChange = useCallback((
    subsectionKey: Section24SubsectionKey,
    value: "YES" | "NO"
  ) => {
    updateSubsectionFlag(subsectionKey, value);
    setTimeout(handleValidation, 0);
  }, [updateSubsectionFlag, handleValidation]);

  // Handle field updates
  const handleFieldUpdate = useCallback((
    subsectionKey: Section24SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    value: any
  ) => {
    updateEntryField(subsectionKey, entryIndex, fieldPath, value);
    setTimeout(handleValidation, 0);
  }, [updateEntryField, handleValidation]);

  // Get alcohol status for monitoring
  const alcoholStatus = getCurrentAlcoholStatus();

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        // Update the central form context with Section 1 data
        sf86Form.updateSectionData('section24', section24Data);

        // Save the form data to persistence layer
        await sf86Form.saveForm();

        console.log('✅ Section 27 data saved successfully:', section24Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('❌ Failed to save Section 27 data:', error);
        // Could show an error message to user here
      }
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-lg p-6" data-testid="section24-container">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Section 24: Use of Alcohol
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Report alcohol use and its negative impacts on work performance, professional or
          personal relationships, finances, and incidents involving law enforcement or
          public safety personnel within the last 7 years.
        </p>

        {/* Status Indicators */}
        {(hasAnyAlcoholImpacts() || hasAnyAlcoholTreatment() || hasCurrentAlcoholConcerns()) && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Alcohol-Related Issues Reported</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    {hasAnyAlcoholImpacts() && <li>Alcohol impacts reported</li>}
                    {hasAnyAlcoholTreatment() && <li>Treatment history reported</li>}
                    {hasCurrentAlcoholConcerns() && <li>Current concerns reported</li>}
                    {alcoholStatus.requiresMonitoring && <li className="font-semibold">Ongoing monitoring may be required</li>}
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
            { key: "alcoholImpacts" as const, name: "Alcohol Impacts (24.1)", count: getEntryCount("alcoholImpacts") },
            { key: "alcoholTreatment" as const, name: "Treatment (24.2)", count: getEntryCount("alcoholTreatment") },
            { key: "alcoholConsumption" as const, name: "Current Use (24.3)", count: getEntryCount("alcoholConsumption") },
          ].map((subsection) => (
            <button
              key={subsection.key}
              onClick={() => setActiveSubsection(subsection.key)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeSubsection === subsection.key
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

      {/* Alcohol Impacts Subsection */}
      {activeSubsection === "alcoholImpacts" && (
        <div className="space-y-6" data-testid="alcohol-impacts-subsection">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              24.1 Negative Impacts from Alcohol Use (Last 7 Years)
            </h3>

            {/* Flag Questions */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Has your use of alcohol had a negative impact on your work performance?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasWorkPerformanceImpact"
                      value="YES"
                      checked={sectionData.section24.alcoholImpacts.hasWorkPerformanceImpact.value === "YES"}
                      onChange={() => handleSubsectionFlagChange("alcoholImpacts", "YES")}
                      className="mr-2"
                    />
                    YES
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasWorkPerformanceImpact"
                      value="NO"
                      checked={sectionData.section24.alcoholImpacts.hasWorkPerformanceImpact.value === "NO"}
                      onChange={() => handleSubsectionFlagChange("alcoholImpacts", "NO")}
                      className="mr-2"
                    />
                    NO
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Has your use of alcohol had a negative impact on your professional or personal relationships?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasRelationshipImpact"
                      value="YES"
                      checked={sectionData.section24.alcoholImpacts.hasRelationshipImpact.value === "YES"}
                      onChange={() => handleSubsectionFlagChange("alcoholImpacts", "YES")}
                      className="mr-2"
                    />
                    YES
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasRelationshipImpact"
                      value="NO"
                      checked={sectionData.section24.alcoholImpacts.hasRelationshipImpact.value === "NO"}
                      onChange={() => handleSubsectionFlagChange("alcoholImpacts", "NO")}
                      className="mr-2"
                    />
                    NO
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Has your use of alcohol resulted in intervention by law enforcement/public safety personnel?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasLawEnforcementInvolvement"
                      value="YES"
                      checked={sectionData.section24.alcoholImpacts.hasLawEnforcementInvolvement.value === "YES"}
                      onChange={() => handleSubsectionFlagChange("alcoholImpacts", "YES")}
                      className="mr-2"
                    />
                    YES
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasLawEnforcementInvolvement"
                      value="NO"
                      checked={sectionData.section24.alcoholImpacts.hasLawEnforcementInvolvement.value === "NO"}
                      onChange={() => handleSubsectionFlagChange("alcoholImpacts", "NO")}
                      className="mr-2"
                    />
                    NO
                  </label>
                </div>
              </div>
            </div>

            {/* Add Entry Button */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={addAlcoholImpactEntry}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                data-testid="add-alcohol-impact-entry"
              >
                Add Alcohol Impact Entry
              </button>
              <span className="text-sm text-gray-500">
                {getEntryCount("alcoholImpacts")} entries
              </span>
            </div>

            {/* Entries List */}
            {sectionData.section24.alcoholImpacts.entries.length > 0 && (
              <div className="space-y-4">
                {sectionData.section24.alcoholImpacts.entries.map((entry, index) => (
                  <div key={entry._id.value} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-md font-medium text-gray-900">
                        Alcohol Impact Entry {index + 1}
                      </h4>
                      <button
                        onClick={() => removeEntry("alcoholImpacts", index)}
                        className="text-red-600 hover:text-red-800"
                        data-testid={`remove-alcohol-impact-${index}`}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Impact Type
                        </label>
                        <select
                          value={entry.impactType.value}
                          onChange={(e) => handleFieldUpdate("alcoholImpacts", index, "impactType.value", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="work_performance">Work Performance</option>
                          <option value="professional_relationships">Professional Relationships</option>
                          <option value="personal_relationships">Personal Relationships</option>
                          <option value="financial_impact">Financial Impact</option>
                          <option value="law_enforcement_intervention">Law Enforcement</option>
                          <option value="public_safety_intervention">Public Safety</option>
                          <option value="health_consequences">Health Consequences</option>
                          <option value="legal_consequences">Legal Consequences</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Incident From Date
                        </label>
                        <input
                          type="date"
                          value={entry.incidentDates.from.date.value}
                          onChange={(e) => handleFieldUpdate("alcoholImpacts", index, "incidentDates.from.date.value", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Impact Description
                        </label>
                        <textarea
                          value={entry.impactDescription.value}
                          onChange={(e) => handleFieldUpdate("alcoholImpacts", index, "impactDescription.value", e.target.value)}
                          placeholder="Describe the negative impact from alcohol use..."
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Circumstances
                        </label>
                        <textarea
                          value={entry.circumstances.value}
                          onChange={(e) => handleFieldUpdate("alcoholImpacts", index, "circumstances.value", e.target.value)}
                          placeholder="Describe the circumstances surrounding this incident..."
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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

      {/* Alcohol Treatment Subsection */}
      {activeSubsection === "alcoholTreatment" && (
        <div className="space-y-6" data-testid="alcohol-treatment-subsection">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              24.2 Alcohol Treatment or Counseling
            </h3>

            {/* Flag Questions */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Have you ever received treatment or counseling for alcohol use?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasReceivedAlcoholTreatment"
                      value="YES"
                      checked={sectionData.section24.alcoholTreatment.hasReceivedAlcoholTreatment.value === "YES"}
                      onChange={() => handleSubsectionFlagChange("alcoholTreatment", "YES")}
                      className="mr-2"
                    />
                    YES
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasReceivedAlcoholTreatment"
                      value="NO"
                      checked={sectionData.section24.alcoholTreatment.hasReceivedAlcoholTreatment.value === "NO"}
                      onChange={() => handleSubsectionFlagChange("alcoholTreatment", "NO")}
                      className="mr-2"
                    />
                    NO
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Are you currently receiving treatment or counseling for alcohol use?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="currentlyInTreatment"
                      value="YES"
                      checked={sectionData.section24.alcoholTreatment.currentlyInTreatment.value === "YES"}
                      onChange={() => handleSubsectionFlagChange("alcoholTreatment", "YES")}
                      className="mr-2"
                    />
                    YES
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="currentlyInTreatment"
                      value="NO"
                      checked={sectionData.section24.alcoholTreatment.currentlyInTreatment.value === "NO"}
                      onChange={() => handleSubsectionFlagChange("alcoholTreatment", "NO")}
                      className="mr-2"
                    />
                    NO
                  </label>
                </div>
              </div>
            </div>

            {/* Add Entry Button */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={addAlcoholTreatmentEntry}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                data-testid="add-alcohol-treatment-entry"
              >
                Add Treatment Entry
              </button>
              <span className="text-sm text-gray-500">
                {getEntryCount("alcoholTreatment")} entries
              </span>
            </div>

            {/* Treatment Entries */}
            {sectionData.section24.alcoholTreatment.entries.length > 0 && (
              <div className="space-y-4">
                {sectionData.section24.alcoholTreatment.entries.map((entry, index) => (
                  <div key={entry._id.value} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-md font-medium text-gray-900">
                        Treatment Entry {index + 1}
                      </h4>
                      <button
                        onClick={() => removeEntry("alcoholTreatment", index)}
                        className="text-red-600 hover:text-red-800"
                        data-testid={`remove-alcohol-treatment-${index}`}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Treatment Type
                        </label>
                        <select
                          value={entry.treatmentType.value}
                          onChange={(e) => handleFieldUpdate("alcoholTreatment", index, "treatmentType.value", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="inpatient_rehabilitation">Inpatient Rehabilitation</option>
                          <option value="outpatient_treatment">Outpatient Treatment</option>
                          <option value="alcoholics_anonymous">Alcoholics Anonymous</option>
                          <option value="individual_counseling">Individual Counseling</option>
                          <option value="group_therapy">Group Therapy</option>
                          <option value="family_counseling">Family Counseling</option>
                          <option value="employee_assistance_program">Employee Assistance Program</option>
                          <option value="court_ordered_treatment">Court Ordered Treatment</option>
                          <option value="detoxification">Detoxification</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Provider Name
                        </label>
                        <input
                          type="text"
                          value={entry.providerName.value}
                          onChange={(e) => handleFieldUpdate("alcoholTreatment", index, "providerName.value", e.target.value)}
                          placeholder="Name of treatment provider"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Treatment From Date
                        </label>
                        <input
                          type="date"
                          value={entry.treatmentDates.from.date.value}
                          onChange={(e) => handleFieldUpdate("alcoholTreatment", index, "treatmentDates.from.date.value", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Treatment To Date
                        </label>
                        <input
                          type="date"
                          value={entry.treatmentDates.to.date.value}
                          onChange={(e) => handleFieldUpdate("alcoholTreatment", index, "treatmentDates.to.date.value", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Treatment Description
                        </label>
                        <textarea
                          value={entry.treatmentDescription.value}
                          onChange={(e) => handleFieldUpdate("alcoholTreatment", index, "treatmentDescription.value", e.target.value)}
                          placeholder="Describe the treatment or counseling received..."
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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

      {/* Alcohol Consumption Subsection */}
      {activeSubsection === "alcoholConsumption" && (
        <div className="space-y-6" data-testid="alcohol-consumption-subsection">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              24.3 Current Alcohol Use
            </h3>

            {/* Flag Questions */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Do you currently consume alcohol?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="currentlyConsumesAlcohol"
                      value="YES"
                      checked={sectionData.section24.alcoholConsumption.currentlyConsumesAlcohol.value === "YES"}
                      onChange={() => handleSubsectionFlagChange("alcoholConsumption", "YES")}
                      className="mr-2"
                    />
                    YES
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="currentlyConsumesAlcohol"
                      value="NO"
                      checked={sectionData.section24.alcoholConsumption.currentlyConsumesAlcohol.value === "NO"}
                      onChange={() => handleSubsectionFlagChange("alcoholConsumption", "NO")}
                      className="mr-2"
                    />
                    NO
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Do you have concerns about your alcohol use?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="concernsAboutUse"
                      value="YES"
                      checked={sectionData.section24.alcoholConsumption.concernsAboutUse.value === "YES"}
                      onChange={() => handleSubsectionFlagChange("alcoholConsumption", "YES")}
                      className="mr-2"
                    />
                    YES
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="concernsAboutUse"
                      value="NO"
                      checked={sectionData.section24.alcoholConsumption.concernsAboutUse.value === "NO"}
                      onChange={() => handleSubsectionFlagChange("alcoholConsumption", "NO")}
                      className="mr-2"
                    />
                    NO
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Consumption Frequency
                </label>
                <select
                  value={sectionData.section24.alcoholConsumption.consumptionFrequency.value}
                  onChange={(e) => handleFieldUpdate("alcoholConsumption", 0, "consumptionFrequency.value", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="never">Never</option>
                  <option value="rarely">Rarely</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="several_times_week">Several Times a Week</option>
                  <option value="daily">Daily</option>
                  <option value="multiple_times_daily">Multiple Times Daily</option>
                  <option value="binge_drinking">Binge Drinking</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Add Entry Button */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={addAlcoholConsumptionEntry}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                data-testid="add-alcohol-consumption-entry"
              >
                Add Consumption Pattern Entry
              </button>
              <span className="text-sm text-gray-500">
                {getEntryCount("alcoholConsumption")} entries
              </span>
            </div>

            {/* Consumption Entries */}
            {sectionData.section24.alcoholConsumption.entries.length > 0 && (
              <div className="space-y-4">
                {sectionData.section24.alcoholConsumption.entries.map((entry, index) => (
                  <div key={entry._id.value} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-md font-medium text-gray-900">
                        Consumption Pattern {index + 1}
                      </h4>
                      <button
                        onClick={() => removeEntry("alcoholConsumption", index)}
                        className="text-red-600 hover:text-red-800"
                        data-testid={`remove-alcohol-consumption-${index}`}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Typical Frequency
                        </label>
                        <select
                          value={entry.typicalFrequency.value}
                          onChange={(e) => handleFieldUpdate("alcoholConsumption", index, "typicalFrequency.value", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="never">Never</option>
                          <option value="rarely">Rarely</option>
                          <option value="monthly">Monthly</option>
                          <option value="weekly">Weekly</option>
                          <option value="several_times_week">Several Times a Week</option>
                          <option value="daily">Daily</option>
                          <option value="multiple_times_daily">Multiple Times Daily</option>
                          <option value="binge_drinking">Binge Drinking</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Typical Quantity
                        </label>
                        <input
                          type="text"
                          value={entry.typicalQuantity.value}
                          onChange={(e) => handleFieldUpdate("alcoholConsumption", index, "typicalQuantity.value", e.target.value)}
                          placeholder="e.g., 2-3 drinks, 1 glass of wine"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Consumption Context
                        </label>
                        <textarea
                          value={entry.consumptionContext.value}
                          onChange={(e) => handleFieldUpdate("alcoholConsumption", index, "consumptionContext.value", e.target.value)}
                          placeholder="Describe the typical context or setting for alcohol consumption..."
                          rows={2}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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

      {/* Validation Summary */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleValidation}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors mr-4"
          data-testid="validate-section24"
        >
          Validate Section
        </button>

        <span className="text-sm text-gray-600">
          Total entries: {getEntryCount("alcoholImpacts") + getEntryCount("alcoholTreatment") + getEntryCount("alcoholConsumption")}
        </span>
      </div>
    </div>
  );
};

export default Section24Component;