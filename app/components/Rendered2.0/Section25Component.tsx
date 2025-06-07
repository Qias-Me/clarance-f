/**
 * Section 25: Investigation and Clearance Record Component
 *
 * This component provides the user interface for Section 25 of the SF-86 form,
 * which covers background investigations and security clearance eligibility records,
 * including investigations completed by US Government agencies, foreign governments,
 * clearance eligibility dates, levels of clearance granted, and any denials or revocations.
 */

import type { Section25SubsectionKey } from "api/interfaces/sections2.0/section25";
import React, { useState, useCallback } from "react";
import { useSection25, Section25Provider } from "~/state/contexts/sections2.0/section25";
import { useSF86Form } from "~/state/contexts/SF86FormContext";

interface Section25ComponentProps {
  onValidationChange?: (isValid: boolean) => void;
}

const Section25ComponentInner: React.FC<Section25ComponentProps> = ({
  onValidationChange,
}) => {
  const {
    sectionData,
    isLoading,
    updateSubsectionFlag,
    addBackgroundInvestigationEntry,
    addClearanceDenialEntry,
    addClearanceRevocationEntry,
    removeEntry,
    updateEntryField,
    getEntryCount,
    hasAnyInvestigations,
    hasAnyDenials,
    hasAnyRevocations,
    getCurrentInvestigationStatus,
    validateSection,
  } = useSection25();

  const sf86Form = useSF86Form();

  const [activeTab, setActiveTab] = useState<string>("backgroundInvestigations");

  // Handle validation changes
  React.useEffect(() => {
    if (onValidationChange) {
      const result = validateSection();
      onValidationChange(result.isValid);
    }
  }, [sectionData, onValidationChange, validateSection]);

  // State for validation
  const [isValid, setIsValid] = useState(false);

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        // Update the central form context with Section 25 data
        sf86Form.updateSectionData('section25', sectionData);

        // Save the form data to persistence layer
        await sf86Form.saveForm();

        console.log('✅ Section 25 data saved successfully:', sectionData);

        // Note: onNext callback would be passed as prop if needed for navigation
      } catch (error) {
        console.error('❌ Failed to save Section 25 data:', error);
        // Could show an error message to user here
      }
    }
  };
  

  // Get current investigation status
  const investigationStatus = getCurrentInvestigationStatus();

  

  const renderTabNavigation = () => (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8">
        {[
          { id: "backgroundInvestigations", label: "Background Investigations", count: getEntryCount("backgroundInvestigations") },
          { id: "clearanceDenials", label: "Clearance Denials", count: getEntryCount("clearanceDenials") },
          { id: "clearanceRevocations", label: "Clearance Revocations", count: getEntryCount("clearanceRevocations") },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-1">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );

  const renderBackgroundInvestigations = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Background Investigations</h3>
        <p className="text-blue-700 text-sm">
          List any background investigations completed by U.S. Government agencies, foreign governments,
          or other organizations. Include investigations for security clearances, employment, or other purposes.
        </p>
      </div>

      {/* Main Question */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg">
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            Have you EVER had a background investigation completed by any U.S. Government agency, foreign government, or other organization?
          </h4>

          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasBackgroundInvestigations"
                value="YES"
                checked={sectionData.section25.backgroundInvestigations.hasBackgroundInvestigations.value === "YES"}
                onChange={() => updateSubsectionFlag("backgroundInvestigations", "YES")}
                className="mr-2"
              />
              <span className="text-gray-700">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasBackgroundInvestigations"
                value="NO"
                checked={sectionData.section25.backgroundInvestigations.hasBackgroundInvestigations.value === "NO"}
                onChange={() => updateSubsectionFlag("backgroundInvestigations", "NO")}
                className="mr-2"
              />
              <span className="text-gray-700">No</span>
            </label>
          </div>
        </div>
      </div>

      {/* Investigation Entries */}
      {sectionData.section25.backgroundInvestigations.hasBackgroundInvestigations.value === "YES" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-900">Background Investigation Records</h4>
            <button
              onClick={addBackgroundInvestigationEntry}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Investigation
            </button>
          </div>

          {sectionData.section25.backgroundInvestigations.entries.map((entry, index) => (
            <div key={entry._id} className="bg-gray-50 p-6 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h5 className="text-md font-medium text-gray-900">Investigation #{index + 1}</h5>
                <button
                  onClick={() => removeEntry("backgroundInvestigations", index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Agency Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Investigating Agency Type
                  </label>
                  <select
                    value={entry.investigatingAgency.type.value}
                    onChange={(e) => updateEntryField("backgroundInvestigations", index, "investigatingAgency.type.value", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="US_GOVERNMENT">U.S. Government</option>
                    <option value="FOREIGN_GOVERNMENT">Foreign Government</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Agency Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agency Name
                  </label>
                  <input
                    type="text"
                    value={entry.investigatingAgency.agencyName.value}
                    onChange={(e) => updateEntryField("backgroundInvestigations", index, "investigatingAgency.agencyName.value", e.target.value)}
                    placeholder="Enter agency name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Investigation Completion Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Investigation Completion Date
                  </label>
                  <input
                    type="date"
                    value={entry.investigationCompletedDate.date.value}
                    onChange={(e) => updateEntryField("backgroundInvestigations", index, "investigationCompletedDate.date.value", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="mt-2 flex space-x-4">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={entry.investigationCompletedDate.estimated.value}
                        onChange={(e) => updateEntryField("backgroundInvestigations", index, "investigationCompletedDate.estimated.value", e.target.checked)}
                        className="mr-2"
                      />
                      Estimated
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={entry.investigationCompletedDate.dontKnow.value}
                        onChange={(e) => updateEntryField("backgroundInvestigations", index, "investigationCompletedDate.dontKnow.value", e.target.checked)}
                        className="mr-2"
                      />
                      Don't Know
                    </label>
                  </div>
                </div>

                {/* Clearance Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clearance Level Granted
                  </label>
                  <select
                    value={entry.clearanceLevel.level.value}
                    onChange={(e) => updateEntryField("backgroundInvestigations", index, "clearanceLevel.level.value", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="CONFIDENTIAL">Confidential</option>
                    <option value="SECRET">Secret</option>
                    <option value="TOP_SECRET">Top Secret</option>
                    <option value="SCI">SCI</option>
                    <option value="SAP">SAP</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Explanation */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Explanation
                </label>
                <textarea
                  value={entry.explanation.value}
                  onChange={(e) => updateEntryField("backgroundInvestigations", index, "explanation.value", e.target.value)}
                  placeholder="Provide any additional details or explanations..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderClearanceDenials = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <h3 className="text-lg font-medium text-yellow-900 mb-2">Clearance Denials</h3>
        <p className="text-yellow-700 text-sm">
          List any security clearance denials by U.S. Government agencies or foreign governments.
          Include the reason for denial and any appeals or subsequent actions.
        </p>
      </div>

      {/* Main Question */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg">
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            Have you EVER been denied security clearance eligibility or access authorization by any U.S. Government agency or foreign government?
          </h4>

          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasClearanceDenials"
                value="YES"
                checked={sectionData.section25.clearanceDenials.hasClearanceDenials.value === "YES"}
                onChange={() => updateSubsectionFlag("clearanceDenials", "YES")}
                className="mr-2"
              />
              <span className="text-gray-700">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasClearanceDenials"
                value="NO"
                checked={sectionData.section25.clearanceDenials.hasClearanceDenials.value === "NO"}
                onChange={() => updateSubsectionFlag("clearanceDenials", "NO")}
                className="mr-2"
              />
              <span className="text-gray-700">No</span>
            </label>
          </div>
        </div>
      </div>

      {/* Denial Entries */}
      {sectionData.section25.clearanceDenials.hasClearanceDenials.value === "YES" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-900">Clearance Denial Records</h4>
            <button
              onClick={addClearanceDenialEntry}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
            >
              Add Denial
            </button>
          </div>

          {sectionData.section25.clearanceDenials.entries.map((entry, index) => (
            <div key={entry._id} className="bg-gray-50 p-6 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h5 className="text-md font-medium text-gray-900">Denial #{index + 1}</h5>
                <button
                  onClick={() => removeEntry("clearanceDenials", index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Denying Agency
                  </label>
                  <input
                    type="text"
                    value={entry.denyingAgency.value}
                    onChange={(e) => updateEntryField("clearanceDenials", index, "denyingAgency.value", e.target.value)}
                    placeholder="Enter denying agency"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Denial Date
                  </label>
                  <input
                    type="date"
                    value={entry.denialDate.date.value}
                    onChange={(e) => updateEntryField("clearanceDenials", index, "denialDate.date.value", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Denial
                </label>
                <textarea
                  value={entry.reasonForDenial.value}
                  onChange={(e) => updateEntryField("clearanceDenials", index, "reasonForDenial.value", e.target.value)}
                  placeholder="Explain the reason for denial..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderClearanceRevocations = () => (
    <div className="space-y-6">
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <h3 className="text-lg font-medium text-red-900 mb-2">Clearance Revocations</h3>
        <p className="text-red-700 text-sm">
          List any security clearance revocations by U.S. Government agencies or foreign governments.
          Include whether the revocation was voluntary or involuntary and the circumstances.
        </p>
      </div>

      {/* Main Question */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg">
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            Have you EVER had security clearance eligibility or access authorization revoked by any U.S. Government agency or foreign government?
          </h4>

          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasClearanceRevocations"
                value="YES"
                checked={sectionData.section25.clearanceRevocations.hasClearanceRevocations.value === "YES"}
                onChange={() => updateSubsectionFlag("clearanceRevocations", "YES")}
                className="mr-2"
              />
              <span className="text-gray-700">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasClearanceRevocations"
                value="NO"
                checked={sectionData.section25.clearanceRevocations.hasClearanceRevocations.value === "NO"}
                onChange={() => updateSubsectionFlag("clearanceRevocations", "NO")}
                className="mr-2"
              />
              <span className="text-gray-700">No</span>
            </label>
          </div>
        </div>
      </div>

      {/* Revocation Entries */}
      {sectionData.section25.clearanceRevocations.hasClearanceRevocations.value === "YES" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-900">Clearance Revocation Records</h4>
            <button
              onClick={addClearanceRevocationEntry}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              Add Revocation
            </button>
          </div>

          {sectionData.section25.clearanceRevocations.entries.map((entry, index) => (
            <div key={entry._id} className="bg-gray-50 p-6 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h5 className="text-md font-medium text-gray-900">Revocation #{index + 1}</h5>
                <button
                  onClick={() => removeEntry("clearanceRevocations", index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Revoking Agency
                  </label>
                  <input
                    type="text"
                    value={entry.revokingAgency.value}
                    onChange={(e) => updateEntryField("clearanceRevocations", index, "revokingAgency.value", e.target.value)}
                    placeholder="Enter revoking agency"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Revocation Date
                  </label>
                  <input
                    type="date"
                    value={entry.revocationDate.date.value}
                    onChange={(e) => updateEntryField("clearanceRevocations", index, "revocationDate.date.value", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Revocation
                </label>
                <textarea
                  value={entry.reasonForRevocation.value}
                  onChange={(e) => updateEntryField("clearanceRevocations", index, "reasonForRevocation.value", e.target.value)}
                  placeholder="Explain the reason for revocation..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Was this revocation voluntary?
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`voluntaryRevocation_${index}`}
                      value="YES"
                      checked={entry.voluntaryRevocation.value === "YES"}
                      onChange={() => updateEntryField("clearanceRevocations", index, "voluntaryRevocation.value", "YES")}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`voluntaryRevocation_${index}`}
                      value="NO"
                      checked={entry.voluntaryRevocation.value === "NO"}
                      onChange={() => updateEntryField("clearanceRevocations", index, "voluntaryRevocation.value", "NO")}
                      className="mr-2"
                    />
                    <span className="text-gray-700">No</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading Section 25...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Section Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Section 25: Investigation and Clearance Record
        </h1>
        <p className="text-gray-600">
          Provide information about background investigations, security clearance denials, and revocations.
        </p>

        {/* Status Summary */}
        {(investigationStatus.hasActiveInvestigations || investigationStatus.hasCurrentIssues) && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-1">Investigation Status Summary</h3>
            <div className="text-sm text-blue-700 space-y-1">
              {investigationStatus.hasActiveInvestigations && (
                <div>✓ Has background investigations recorded</div>
              )}
              {investigationStatus.hasPendingClearances && (
                <div>⏳ Has pending clearances</div>
              )}
              {investigationStatus.hasCurrentIssues && (
                <div>⚠️ Has clearance issues (denials or revocations)</div>
              )}
              <div>📊 Total records: {investigationStatus.totalRecords}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      {renderTabNavigation()}

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === "backgroundInvestigations" && renderBackgroundInvestigations()}
        {activeTab === "clearanceDenials" && renderClearanceDenials()}
        {activeTab === "clearanceRevocations" && renderClearanceRevocations()}
      </div>
    </div>
  );
};

const Section25Component: React.FC<Section25ComponentProps> = ({
  onValidationChange,
}) => {
  return (
    <Section25Provider>
      <Section25ComponentInner onValidationChange={onValidationChange} />
    </Section25Provider>
  );
};

export default Section25Component;