/**
 * Section 15: Military History Component
 *
 * React component for SF-86 Section 15 (Military History) using the new Form Architecture 2.0.
 * This component provides a user interface for entering military service history, disciplinary
 * procedures, and foreign military service information following established patterns.
 */

import React, { useEffect, useState } from 'react';
import { useSection15 } from '~/state/contexts/sections2.0/section15';
import { useSF86Form } from '~/state/contexts/sections2.0/SF86FormContext';
import {
  MILITARY_SERVICE_OPTIONS,
  DISCIPLINARY_OPTIONS,
  FOREIGN_MILITARY_OPTIONS,
  MILITARY_BRANCH_OPTIONS,
  SERVICE_STATUS_OPTIONS,
  DISCHARGE_TYPE_OPTIONS
} from '../../../api/interfaces/sections2.0/section15';
import { getCountryOptions } from '../../../api/interfaces/sections2.0/base';

// Maximum number of entries allowed for each subsection
const MAX_MILITARY_SERVICE_ENTRIES = 2;
const MAX_DISCIPLINARY_ENTRIES = 2;
const MAX_FOREIGN_MILITARY_ENTRIES = 2;

interface Section15ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section15Component: React.FC<Section15ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  // Section 15 Context
  const {
    section15Data,
    errors,
    isDirty,
    updateHasServed,
    updateHasDisciplinaryAction,
    updateHasServedInForeignMilitary,
    addMilitaryServiceEntry,
    removeMilitaryServiceEntry,
    updateMilitaryServiceEntry,
    updateMilitaryServiceStatus,
    updateMilitaryServiceBranch,
    updateMilitaryServiceDates,
    updateMilitaryServiceState,
    updateMilitaryServiceDateEstimate,
    updateMilitaryServicePresent,
    updateMilitaryServiceNumber,
    updateMilitaryServiceDischargeType,
    updateMilitaryServiceTypeOfDischarge,
    updateMilitaryServiceDischargeDate,
    updateMilitaryServiceDischargeDateEstimate,
    updateMilitaryServiceOtherDischargeType,
    updateMilitaryServiceDischargeReason,
    updateMilitaryServiceCurrentStatus,
    addDisciplinaryEntry,
    removeDisciplinaryEntry,
    updateDisciplinaryEntry,
    updateDisciplinaryStatus,
    updateDisciplinaryProcedureDate,
    updateDisciplinaryProcedureDateEstimate,
    updateDisciplinaryUcmjOffense,
    updateDisciplinaryProcedureName,
    updateDisciplinaryCourtDescription,
    updateDisciplinaryFinalOutcome,
    addForeignMilitaryEntry,
    removeForeignMilitaryEntry,
    updateForeignMilitaryEntry,
    updateForeignMilitaryStatus,
    updateForeignMilitaryServiceDates,
    updateForeignMilitaryServiceDateEstimate,
    updateForeignMilitaryServicePresent,
    updateForeignMilitaryOrganizationName,
    updateForeignMilitaryCountry,
    updateForeignMilitaryHighestRank,
    updateForeignMilitaryDivisionDepartment,
    updateForeignMilitaryReasonForLeaving,
    updateForeignMilitaryCircumstances,
    updateForeignMilitaryContact,
    validateSection,
    resetSection,
    getVisibleFieldsForEntry
  } = useSection15();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);
  const [activeTab, setActiveTab] = useState<'military' | 'disciplinary' | 'foreign'>('military');

  const { militaryService, disciplinaryProcedures, foreignMilitaryService } = section15Data.section15;

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section15Data, onValidationChange, validateSection]);

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    // console.log('🔍 Section 15 validation result:', result);
    // console.log('📊 Section 15 data before submission:', section15Data);

    if (result.isValid) {
      try {
        // console.log('🔄 Section 15: Starting data synchronization...');

        // Update the central form context with Section 15 data
        sf86Form.updateSectionData('section15', section15Data);

        // console.log('✅ Section 15: Data synchronization complete, proceeding to save...');

        // Get the current form data and update it with section15 data for immediate saving
        const currentFormData = sf86Form.exportForm();
        const updatedFormData = { ...currentFormData, section15: section15Data };

        // Save the form data to persistence layer with the updated data
        await sf86Form.saveForm(updatedFormData);

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section15');

        // console.log('✅ Section 15 data saved successfully:', section15Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        // console.error('❌ Failed to save Section 15 data:', error);
        // Show an error message to user
        // console.log('There was an error saving your information. Please try again.');
      }
    }
  };


  // Reset function
  const handleReset = () => {
    resetSection();
  };

  // Helper function to get branch name
  const getBranchName = (branchCode: string): string => {
    const branches = {
      '1': 'Army',
      '2': 'Navy',
      '3': 'Marine Corps',
      '4': 'Air Force',
      '5': 'National Guard',
      '6': 'Coast Guard',
      '7': 'Other'
    };
    return branches[branchCode as keyof typeof branches] || branchCode;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section15-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 15: Military History
        </h2>
        <p className="text-gray-600">
          Provide information about your military service history, any disciplinary procedures,
          and foreign military service.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('military')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'military'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            15.1 Military Service
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('disciplinary')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'disciplinary'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            15.2 Disciplinary Procedures
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('foreign')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'foreign'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            15.3 Foreign Military Service
          </button>
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 15.1 Military Service Tab */}
        {activeTab === 'military' && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">U.S. Military Service History</h3>

              {/* Section-level Parent Question */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Have you ever served in the U.S. Military? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {MILITARY_SERVICE_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="hasServed"
                        value={option}
                        checked={section15Data.section15.militaryService.hasServed?.value === option}
                        onChange={(e) => updateHasServed(e.target.value === "YES" ? "YES" : "NO (If NO, proceed to Section 15.2) ")}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        data-testid={`military-service-${option.toLowerCase()}`}
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Show entries only if YES is selected */}
              {section15Data.section15.militaryService.hasServed?.value === 'YES' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Military Service Entries ({militaryService.entries.length})</h4>
                    {/* Add Service Entry Button - conditionally rendered based on limit */}
                    {militaryService.entries.length < MAX_MILITARY_SERVICE_ENTRIES ? (
                      <button
                        type="button"
                        onClick={addMilitaryServiceEntry}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        data-testid="add-military-service-entry"
                      >
                        Add Service Entry
                      </button>
                    ) : (
                      <div className="px-3 py-1 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <span className="text-yellow-800">
                          <strong>Maximum entries reached:</strong> You can only add up to {MAX_MILITARY_SERVICE_ENTRIES} military service entries.
                        </span>
                      </div>
                    )}
                  </div>

                  {militaryService.entries.map((entry, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-md font-medium">Service Entry #{index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeMilitaryServiceEntry(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                          data-testid={`remove-military-service-${index}`}
                        >
                          Remove
                        </button>
                      </div>

                      {/* Entry Fields - Always show when parent is YES */}
                      <div className="space-y-4">
                        {/* Branch of Service */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Branch of Service <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={entry.branch.value}
                            onChange={(e) => updateMilitaryServiceBranch(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select Branch</option>
                            {MILITARY_BRANCH_OPTIONS.map((branchCode) => (
                              <option key={branchCode} value={branchCode}>
                                {getBranchName(branchCode)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Service Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Status <span className="text-red-500">*</span>
                          </label>
                          <div className="space-y-2">
                            {SERVICE_STATUS_OPTIONS.map((status) => (
                              <label key={status} className="flex items-center space-x-3">
                                <input
                                  type="radio"
                                  name={`serviceStatus-${index}`}
                                  value={status}
                                  checked={entry.serviceStatus.value === status}
                                  onChange={(e) => updateMilitaryServiceEntry(index, 'serviceStatus.value', e.target.value)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-sm text-gray-700">
                                  {status === '1' ? 'Officer' : status === '2' ? 'Enlisted' : 'Other'}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Service Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              From Date (Month/Year) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={entry.fromDate.value}
                              onChange={(e) => updateMilitaryServiceDates(index, 'from', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              To Date (Month/Year)
                            </label>
                            <input
                              type="date"
                              value={entry.toDate.value}
                              onChange={(e) => updateMilitaryServiceDates(index, 'to', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={entry.isPresent.value}
                            />
                            <label className="flex items-center space-x-2 mt-2">
                              <input
                                type="checkbox"
                                checked={entry.isPresent.value}
                                onChange={(e) => updateMilitaryServiceEntry(index, 'isPresent.value', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">Present (Currently Serving)</span>
                            </label>
                          </div>
                        </div>

                        {/* State of Service for National Guard */}
                        {entry.branch.value === '5' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              State of Service (National Guard) <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={entry.serviceState.value}
                              onChange={(e) => updateMilitaryServiceState(index, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="">Select State</option>
                              {['AK', 'AL', 'AR', 'AS', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'FM', 'GA', 'GU', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MH', 'MI', 'MN', 'MO', 'MP', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'PR', 'PW', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VI', 'VT', 'WA', 'WI', 'WV', 'WY'].map((state) => (
                                <option key={state} value={state}>
                                  {state}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Date Estimate Checkboxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={entry.fromDateEstimated.value}
                                onChange={(e) => updateMilitaryServiceDateEstimate(index, 'from', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">From Date is Estimated</span>
                            </label>
                          </div>
                          <div>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={entry.toDateEstimated.value}
                                onChange={(e) => updateMilitaryServiceDateEstimate(index, 'to', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={entry.isPresent.value}
                              />
                              <span className="text-sm text-gray-700">To Date is Estimated</span>
                            </label>
                          </div>
                        </div>

                        {/* Service Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={entry.serviceNumber.value}
                            onChange={(e) => updateMilitaryServiceNumber(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your military service number"
                            required
                          />
                        </div>

                        {/* Discharge Information */}
                        <div className="space-y-4 border-t pt-4">
                          <h6 className="font-medium text-gray-900">Discharge Information</h6>

                          {/* Type of Discharge */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Type of Discharge <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                              {DISCHARGE_TYPE_OPTIONS.map((dischargeType) => (
                                <label key={dischargeType} className="flex items-center space-x-3">
                                  <input
                                    type="radio"
                                    name={`dischargeType-${index}`}
                                    value={dischargeType}
                                    checked={entry.typeOfDischarge?.value === dischargeType}
                                    onChange={(e) => updateMilitaryServiceTypeOfDischarge(index, e.target.value)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                  />
                                  <span className="text-sm text-gray-700">{dischargeType}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Other Discharge Type */}
                          {entry.typeOfDischarge?.value === 'Other' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Other Discharge Type <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={entry.otherDischargeType.value}
                                onChange={(e) => updateMilitaryServiceOtherDischargeType(index, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Specify other discharge type"
                                required
                              />
                            </div>
                          )}

                          {/* Discharge Date */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Discharge Date (Month/Year)
                            </label>
                            <input
                              type="date"
                              value={entry.dischargeDate.value}
                              onChange={(e) => updateMilitaryServiceDischargeDate(index, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <label className="flex items-center space-x-2 mt-2">
                              <input
                                type="checkbox"
                                checked={entry.dischargeDateEstimated.value}
                                onChange={(e) => updateMilitaryServiceDischargeDateEstimate(index, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">Discharge Date is Estimated</span>
                            </label>
                          </div>

                          {/* Discharge Reason */}
                          {entry.typeOfDischarge?.value && entry.typeOfDischarge.value !== 'Honorable' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Discharge <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                value={entry.dischargeReason.value}
                                onChange={(e) => updateMilitaryServiceDischargeReason(index, e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Provide the reason(s) for the discharge"
                                required
                              />
                            </div>
                          )}

                          {/* Current Status */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Status
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={entry.currentStatus.activeDuty.value}
                                  onChange={(e) => updateMilitaryServiceCurrentStatus(index, 'activeDuty', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">Active Duty</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={entry.currentStatus.activeReserve.value}
                                  onChange={(e) => updateMilitaryServiceCurrentStatus(index, 'activeReserve', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">Active Reserve</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={entry.currentStatus.inactiveReserve.value}
                                  onChange={(e) => updateMilitaryServiceCurrentStatus(index, 'inactiveReserve', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">Inactive Reserve</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 15.2 Disciplinary Procedures Tab */}
        {activeTab === 'disciplinary' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Military Disciplinary Procedures</h3>

              {/* Section-level Parent Question */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  In the last seven (7) years, have you been subject to court martial or other disciplinary procedure under the Uniform Code of Military Justice? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {DISCIPLINARY_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="hasBeenSubjectToDisciplinary"
                        value={option}
                        checked={section15Data.section15.disciplinaryProcedures.hasDisciplinaryAction?.value === option}
                        onChange={(e) => updateHasDisciplinaryAction(e.target.value === "YES" ? "YES" : "NO (If NO, proceed to Section 15.3) ")}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                        data-testid={`disciplinary-${option.toLowerCase()}`}
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Show entries only if YES is selected */}
              {section15Data.section15.disciplinaryProcedures.hasDisciplinaryAction?.value === 'YES' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Disciplinary Procedures ({disciplinaryProcedures.entries.length})</h4>
                    {/* Add Disciplinary Entry Button - conditionally rendered based on limit */}
                    {disciplinaryProcedures.entries.length < MAX_DISCIPLINARY_ENTRIES ? (
                      <button
                        type="button"
                        onClick={addDisciplinaryEntry}
                        className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                        data-testid="add-disciplinary-entry"
                      >
                        Add Disciplinary Entry
                      </button>
                    ) : (
                      <div className="px-3 py-1 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <span className="text-yellow-800">
                          <strong>Maximum entries reached:</strong> You can only add up to {MAX_DISCIPLINARY_ENTRIES} disciplinary procedure entries.
                        </span>
                      </div>
                    )}
                  </div>

                  {disciplinaryProcedures.entries.map((entry, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-md font-medium">Disciplinary Entry #{index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeDisciplinaryEntry(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                          data-testid={`remove-disciplinary-${index}`}
                        >
                          Remove
                        </button>
                      </div>

                      {/* Entry Fields - Always show when parent is YES */}
                      <div className="space-y-4">
                        {/* Procedure Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Procedure (Month/Year) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={entry.procedureDate.value}
                            onChange={(e) => updateDisciplinaryProcedureDate(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                          <label className="flex items-center space-x-2 mt-2">
                            <input
                              type="checkbox"
                              checked={entry.procedureDateEstimated.value}
                              onChange={(e) => updateDisciplinaryProcedureDateEstimate(index, e.target.checked)}
                              className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">Procedure Date is Estimated</span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            UCMJ Offense Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={entry.ucmjOffenseDescription.value}
                            onChange={(e) => updateDisciplinaryUcmjOffense(index, e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the UCMJ offense(s) for which you were charged..."
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Disciplinary Procedure Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={entry.disciplinaryProcedureName.value}
                            onChange={(e) => updateDisciplinaryProcedureName(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Court Martial, Article 15, Captain's mast, etc."
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Military Court Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={entry.militaryCourtDescription.value}
                            onChange={(e) => updateDisciplinaryCourtDescription(index, e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the military court or convening authority, including address..."
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Final Outcome <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={entry.finalOutcome.value}
                            onChange={(e) => updateDisciplinaryFinalOutcome(index, e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the final outcome (e.g., found guilty, fine, reduction in rank, imprisonment, etc.)"
                            required
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

        {/* 15.3 Foreign Military Service Tab */}
        {activeTab === 'foreign' && (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Foreign Military Service</h3>

              {/* Section-level Parent Question */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Have you ever served as a civilian or military member in a foreign country's military, intelligence, police, or other security organization? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {FOREIGN_MILITARY_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="hasServedInForeignMilitary"
                        value={option}
                        checked={section15Data.section15.foreignMilitaryService.hasServedInForeignMilitary?.value === option}
                        onChange={(e) => updateHasServedInForeignMilitary(e.target.value === "YES" ? "YES" : "NO (If NO, proceed to Section 16)")}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        data-testid={`foreign-military-${option.toLowerCase()}`}
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Show entries only if YES is selected */}
              {section15Data.section15.foreignMilitaryService.hasServedInForeignMilitary?.value === 'YES' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Foreign Military Service Entries ({foreignMilitaryService.entries.length})</h4>
                    {/* Add Foreign Service Entry Button - conditionally rendered based on limit */}
                    {foreignMilitaryService.entries.length < MAX_FOREIGN_MILITARY_ENTRIES ? (
                      <button
                        type="button"
                        onClick={addForeignMilitaryEntry}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        data-testid="add-foreign-military-entry"
                      >
                        Add Foreign Service Entry
                      </button>
                    ) : (
                      <div className="px-3 py-1 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <span className="text-yellow-800">
                          <strong>Maximum entries reached:</strong> You can only add up to {MAX_FOREIGN_MILITARY_ENTRIES} foreign military service entries.
                        </span>
                      </div>
                    )}
                  </div>

                  {foreignMilitaryService.entries.map((entry, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-md font-medium">Foreign Service Entry #{index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeForeignMilitaryEntry(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                          data-testid={`remove-foreign-military-${index}`}
                        >
                          Remove
                        </button>
                      </div>

                      {/* Entry Fields - Always show when parent is YES */}
                      <div className="space-y-4">
                        {/* Service Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              From Date (Month/Year) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={entry.fromDate.value}
                              onChange={(e) => updateForeignMilitaryServiceDates(index, 'from', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                            <label className="flex items-center space-x-2 mt-2">
                              <input
                                type="checkbox"
                                checked={entry.fromDateEstimated.value}
                                onChange={(e) => updateForeignMilitaryServiceDateEstimate(index, 'from', e.target.checked)}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">From Date is Estimated</span>
                            </label>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              To Date (Month/Year)
                            </label>
                            <input
                              type="date"
                              value={entry.toDate.value}
                              onChange={(e) => updateForeignMilitaryServiceDates(index, 'to', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={entry.isPresent.value}
                            />
                            <div className="space-y-2 mt-2">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={entry.isPresent.value}
                                  onChange={(e) => updateForeignMilitaryServicePresent(index, e.target.checked)}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">Present (Currently Serving)</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={entry.toDateEstimated.value}
                                  onChange={(e) => updateForeignMilitaryServiceDateEstimate(index, 'to', e.target.checked)}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                  disabled={entry.isPresent.value}
                                />
                                <span className="text-sm text-gray-700">To Date is Estimated</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Organization Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={entry.organizationName.value}
                              onChange={(e) => updateForeignMilitaryOrganizationName(index, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Name of foreign organization"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Country <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={entry.country.value}
                              onChange={(e) => updateForeignMilitaryCountry(index, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              {getCountryOptions().map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Highest Position/Rank <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={entry.highestRank.value}
                            onChange={(e) => updateForeignMilitaryHighestRank(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your highest position or rank"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Division/Department/Office
                          </label>
                          <input
                            type="text"
                            value={entry.divisionDepartment.value}
                            onChange={(e) => updateForeignMilitaryDivisionDepartment(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Division, department, or office in which you served"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Leaving
                          </label>
                          <textarea
                            value={entry.reasonForLeaving.value}
                            onChange={(e) => updateForeignMilitaryReasonForLeaving(index, e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the reason for leaving this service"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Circumstances Description
                          </label>
                          <textarea
                            value={entry.circumstancesDescription.value}
                            onChange={(e) => updateForeignMilitaryCircumstances(index, e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the circumstances of your association with this organization"
                          />
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-6 border-t pt-4">
                          <h6 className="font-medium text-gray-900">Contact Information</h6>

                          {/* Contact 1 */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h6 className="font-medium text-gray-800 mb-3 block">Contact 1</h6>
                            <div className="space-y-4">
                              {/* Full Name */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                  </label>
                                  <input
                                    type="text"
                                    value={entry.contactPerson1.firstName.value}
                                    onChange={(e) => updateForeignMilitaryContact(index, 1, 'firstName.value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="First name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Middle Name
                                  </label>
                                  <input
                                    type="text"
                                    value={entry.contactPerson1.middleName.value}
                                    onChange={(e) => updateForeignMilitaryContact(index, 1, 'middleName.value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Middle name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                  </label>
                                  <input
                                    type="text"
                                    value={entry.contactPerson1.lastName.value}
                                    onChange={(e) => updateForeignMilitaryContact(index, 1, 'lastName.value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Last name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Suffix
                                  </label>
                                  <input
                                    type="text"
                                    value={entry.contactPerson1.suffix.value}
                                    onChange={(e) => updateForeignMilitaryContact(index, 1, 'suffix.value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Jr., Sr., etc."
                                  />
                                </div>
                              </div>

                              {/* Association Period */}
                              <div className="space-y-4">
                                <h6 className="font-medium text-gray-700 text-sm">Association Period</h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      From Date
                                    </label>
                                    <input
                                      type="date"
                                      value={entry.contactPerson1.associationFromDate.value}
                                      onChange={(e) => updateForeignMilitaryContact(index, 1, 'associationFromDate.value', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="flex items-center space-x-2 mt-2">
                                      <input
                                        type="checkbox"
                                        checked={entry.contactPerson1.associationFromDateEstimated.value}
                                        onChange={(e) => updateForeignMilitaryContact(index, 1, 'associationFromDateEstimated.value', e.target.checked)}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                      />
                                      <span className="text-sm text-gray-700">From Date is Estimated</span>
                                    </label>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      To Date
                                    </label>
                                    <input
                                      type="date"
                                      value={entry.contactPerson1.associationToDate.value}
                                      onChange={(e) => updateForeignMilitaryContact(index, 1, 'associationToDate.value', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      disabled={entry.contactPerson1.associationIsPresent.value}
                                    />
                                    <div className="space-y-2 mt-2">
                                      <label className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={entry.contactPerson1.associationIsPresent.value}
                                          onChange={(e) => updateForeignMilitaryContact(index, 1, 'associationIsPresent.value', e.target.checked)}
                                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">Present (Ongoing Association)</span>
                                      </label>
                                      <label className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={entry.contactPerson1.associationToDateEstimated.value}
                                          onChange={(e) => updateForeignMilitaryContact(index, 1, 'associationToDateEstimated.value', e.target.checked)}
                                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                          disabled={entry.contactPerson1.associationIsPresent.value}
                                        />
                                        <span className="text-sm text-gray-700">To Date is Estimated</span>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Official Title and Frequency */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Official Title
                                  </label>
                                  <input
                                    type="text"
                                    value={entry.contactPerson1.officialTitle.value}
                                    onChange={(e) => updateForeignMilitaryContact(index, 1, 'officialTitle.value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Official title or position"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Frequency of Contact
                                  </label>
                                  <input
                                    type="text"
                                    value={entry.contactPerson1.frequencyOfContact.value}
                                    onChange={(e) => updateForeignMilitaryContact(index, 1, 'frequencyOfContact.value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Daily, Weekly, Monthly"
                                  />
                                </div>
                              </div>

                              {/* Address */}
                              <div className="space-y-4">
                                <h6 className="font-medium text-gray-700 text-sm">Address</h6>
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Street Address
                                    </label>
                                    <input
                                      type="text"
                                      value={entry.contactPerson1.street.value}
                                      onChange={(e) => updateForeignMilitaryContact(index, 1, 'street.value', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="Street address"
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City
                                      </label>
                                      <input
                                        type="text"
                                        value={entry.contactPerson1.city.value}
                                        onChange={(e) => updateForeignMilitaryContact(index, 1, 'city.value', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="City"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State
                                      </label>
                                      <input
                                        type="text"
                                        value={entry.contactPerson1.state.value}
                                        onChange={(e) => updateForeignMilitaryContact(index, 1, 'state.value', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="State/Province"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country
                                      </label>
                                      <select
                                        value={entry.contactPerson1.country.value}
                                        onChange={(e) => updateForeignMilitaryContact(index, 1, 'country.value', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      >
                                        {getCountryOptions().map((option) => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ZIP Code
                                      </label>
                                      <input
                                        type="text"
                                        value={entry.contactPerson1.zipCode.value}
                                        onChange={(e) => updateForeignMilitaryContact(index, 1, 'zipCode.value', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="ZIP/Postal code"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Contact 2 */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h6 className="font-medium text-gray-800 mb-3 block">Contact 2</h6>
                            <div className="space-y-4">
                              {/* Full Name */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                  </label>
                                  <input
                                    type="text"
                                    value={entry.contactPerson2.firstName.value}
                                    onChange={(e) => updateForeignMilitaryContact(index, 2, 'firstName.value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="First name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Middle Name
                                  </label>
                                  <input
                                    type="text"
                                    value={entry.contactPerson2.middleName.value}
                                    onChange={(e) => updateForeignMilitaryContact(index, 2, 'middleName.value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Middle name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                  </label>
                                  <input
                                    type="text"
                                    value={entry.contactPerson2.lastName.value}
                                    onChange={(e) => updateForeignMilitaryContact(index, 2, 'lastName.value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Last name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Suffix
                                  </label>
                                  <input
                                    type="text"
                                    value={entry.contactPerson2.suffix.value}
                                    onChange={(e) => updateForeignMilitaryContact(index, 2, 'suffix.value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Jr., Sr., etc."
                                  />
                                </div>
                              </div>

                              {/* Association Period */}
                              <div className="space-y-4">
                                <h6 className="font-medium text-gray-700 text-sm">Association Period</h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      From Date
                                    </label>
                                    <input
                                      type="date"
                                      value={entry.contactPerson2.associationFromDate.value}
                                      onChange={(e) => updateForeignMilitaryContact(index, 2, 'associationFromDate.value', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="flex items-center space-x-2 mt-2">
                                      <input
                                        type="checkbox"
                                        checked={entry.contactPerson2.associationFromDateEstimated.value}
                                        onChange={(e) => updateForeignMilitaryContact(index, 2, 'associationFromDateEstimated.value', e.target.checked)}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                      />
                                      <span className="text-sm text-gray-700">From Date is Estimated</span>
                                    </label>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      To Date
                                    </label>
                                    <input
                                      type="date"
                                      value={entry.contactPerson2.associationToDate.value}
                                      onChange={(e) => updateForeignMilitaryContact(index, 2, 'associationToDate.value', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      disabled={entry.contactPerson2.associationIsPresent.value}
                                    />
                                    <div className="space-y-2 mt-2">
                                      <label className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={entry.contactPerson2.associationIsPresent.value}
                                          onChange={(e) => updateForeignMilitaryContact(index, 2, 'associationIsPresent.value', e.target.checked)}
                                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">Present (Ongoing Association)</span>
                                      </label>
                                      <label className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={entry.contactPerson2.associationToDateEstimated.value}
                                          onChange={(e) => updateForeignMilitaryContact(index, 2, 'associationToDateEstimated.value', e.target.checked)}
                                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                          disabled={entry.contactPerson2.associationIsPresent.value}
                                        />
                                        <span className="text-sm text-gray-700">To Date is Estimated</span>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Official Title, Frequency, and Specify */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Official Title
                                  </label>
                                  <input
                                    type="text"
                                    value={entry.contactPerson2.officialTitle.value}
                                    onChange={(e) => updateForeignMilitaryContact(index, 2, 'officialTitle.value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Official title or position"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Frequency of Contact
                                  </label>
                                  <input
                                    type="text"
                                    value={entry.contactPerson2.frequencyOfContact.value}
                                    onChange={(e) => updateForeignMilitaryContact(index, 2, 'frequencyOfContact.value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Daily, Weekly, Monthly"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Specify
                                  </label>
                                  <input
                                    type="text"
                                    value={entry.contactPerson2.specify?.value || ''}
                                    onChange={(e) => updateForeignMilitaryContact(index, 2, 'specify.value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Additional specification"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Please correct the following errors:
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc space-y-1 pl-5">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset Section
          </button>

          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              {isDirty && (
                <span className="text-sm text-amber-600">
                  ⚠️ Unsaved changes
                </span>
              )}
              {isValid && (
                <span className="text-sm text-green-600">
                  ✅ Section valid
                </span>
              )}
            </div>

            <button
              type="submit"
              className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 ${
                isValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isValid}
            >
              Save & Continue
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Section15Component;