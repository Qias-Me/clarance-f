/**
 * Section 15: Military History Component
 *
 * React component for SF-86 Section 15 (Military History) using the new Form Architecture 2.0.
 * This component provides a user interface for entering military service history, disciplinary
 * procedures, and foreign military service information following established patterns.
 */

import React, { useEffect, useState } from 'react';
import { useSection15 } from '~/state/contexts/sections2.0/section15';
import { useSF86Form } from '~/state/contexts/SF86FormContext';
import {
  YES_NO_OPTIONS,
  MILITARY_BRANCH_OPTIONS,
  SERVICE_STATUS_OPTIONS,
  DISCHARGE_TYPE_OPTIONS
} from '../../../api/interfaces/sections2.0/section15';

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
    addMilitaryServiceEntry,
    removeMilitaryServiceEntry,
    updateMilitaryServiceEntry,
    updateMilitaryServiceStatus,
    updateMilitaryServiceBranch,
    updateMilitaryServiceDates,
    addDisciplinaryEntry,
    removeDisciplinaryEntry,
    updateDisciplinaryEntry,
    updateDisciplinaryStatus,
    addForeignMilitaryEntry,
    removeForeignMilitaryEntry,
    updateForeignMilitaryEntry,
    updateForeignMilitaryStatus,
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

  // Handle form submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        sf86Form.updateSectionData('section15', section15Data);
        await sf86Form.saveForm();
        console.log('✅ Section 15 data saved successfully:', section15Data);
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('❌ Failed to save Section 15 data:', error);
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
      '5': 'Coast Guard',
      '6': 'Space Force',
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

              {militaryService.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No military service entries added yet.</p>
                  <button
                    type="button"
                    onClick={addMilitaryServiceEntry}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add Military Service Entry
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {militaryService.map((entry, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-medium">Military Service Entry #{index + 1}</h4>
                        {militaryService.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMilitaryServiceEntry(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove Entry
                          </button>
                        )}
                      </div>

                      {/* Has Served Question */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Have you ever served in the U.S. Military? <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          {YES_NO_OPTIONS.map((option) => (
                            <label key={option} className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name={`hasServed-${index}`}
                                value={option}
                                checked={entry.hasServed.value === option}
                                onChange={(e) => updateMilitaryServiceStatus(index, e.target.value)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Conditional Fields - Show if served */}
                      {entry.hasServed.value === 'YES' && (
                        <div className="space-y-4 border-t pt-4">
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
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={entry.fromDate.month.value}
                                  onChange={(e) => updateMilitaryServiceDates(index, 'from', e.target.value, entry.fromDate.year.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                >
                                  <option value="">Month</option>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  value={entry.fromDate.year.value}
                                  onChange={(e) => updateMilitaryServiceDates(index, 'from', entry.fromDate.month.value, e.target.value)}
                                  placeholder="Year"
                                  min="1900"
                                  max={new Date().getFullYear()}
                                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                To Date (Month/Year)
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={entry.toDate.month.value}
                                  onChange={(e) => updateMilitaryServiceDates(index, 'to', e.target.value, entry.toDate.year.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  disabled={entry.isPresent.value}
                                >
                                  <option value="">Month</option>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  value={entry.toDate.year.value}
                                  onChange={(e) => updateMilitaryServiceDates(index, 'to', entry.toDate.month.value, e.target.value)}
                                  placeholder="Year"
                                  min="1900"
                                  max={new Date().getFullYear()}
                                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  disabled={entry.isPresent.value}
                                />
                              </div>
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

                          {/* Service Number */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Service Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={entry.serviceNumber.value}
                              onChange={(e) => updateMilitaryServiceEntry(index, 'serviceNumber.value', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter your military service number"
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addMilitaryServiceEntry}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600"
                  >
                    + Add Another Military Service Entry
                  </button>
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
              <p className="text-sm text-gray-600 mb-4">
                In the last seven (7) years, have you been subject to court martial or other disciplinary procedure under the Uniform Code of Military Justice?
              </p>

              {disciplinaryProcedures.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No disciplinary entries added yet.</p>
                  <button
                    type="button"
                    onClick={addDisciplinaryEntry}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    Add Disciplinary Entry
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {disciplinaryProcedures.map((entry, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-medium">Disciplinary Entry #{index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeDisciplinaryEntry(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove Entry
                        </button>
                      </div>

                      {/* Has Been Subject to Disciplinary */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Have you been subject to court martial or disciplinary procedure? <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          {YES_NO_OPTIONS.map((option) => (
                            <label key={option} className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name={`hasDisciplinary-${index}`}
                                value={option}
                                checked={entry.hasBeenSubjectToDisciplinary.value === option}
                                onChange={(e) => updateDisciplinaryStatus(index, e.target.value)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Conditional Fields - Show if YES */}
                      {entry.hasBeenSubjectToDisciplinary.value === 'YES' && (
                        <div className="space-y-4 border-t pt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              UCMJ Offense Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={entry.ucmjOffenseDescription.value}
                              onChange={(e) => updateDisciplinaryEntry(index, 'ucmjOffenseDescription.value', e.target.value)}
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
                              onChange={(e) => updateDisciplinaryEntry(index, 'disciplinaryProcedureName.value', e.target.value)}
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
                              onChange={(e) => updateDisciplinaryEntry(index, 'militaryCourtDescription.value', e.target.value)}
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
                              onChange={(e) => updateDisciplinaryEntry(index, 'finalOutcome.value', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Describe the final outcome (e.g., found guilty, fine, reduction in rank, imprisonment, etc.)"
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addDisciplinaryEntry}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600"
                  >
                    + Add Another Disciplinary Entry
                  </button>
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
              <p className="text-sm text-gray-600 mb-4">
                Have you ever served as a civilian or military member in a foreign country's military, intelligence, police, or other security organization?
              </p>

              {foreignMilitaryService.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No foreign military service entries added yet.</p>
                  <button
                    type="button"
                    onClick={addForeignMilitaryEntry}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Add Foreign Military Entry
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {foreignMilitaryService.map((entry, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-medium">Foreign Military Service Entry #{index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeForeignMilitaryEntry(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove Entry
                        </button>
                      </div>

                      {/* Has Served in Foreign Military */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Have you served in a foreign military organization? <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          {YES_NO_OPTIONS.map((option) => (
                            <label key={option} className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name={`hasForeignService-${index}`}
                                value={option}
                                checked={entry.hasServedInForeignMilitary.value === option}
                                onChange={(e) => updateForeignMilitaryStatus(index, e.target.value)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Conditional Fields - Show if YES */}
                      {entry.hasServedInForeignMilitary.value === 'YES' && (
                        <div className="space-y-4 border-t pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Organization Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={entry.organizationName.value}
                                onChange={(e) => updateForeignMilitaryEntry(index, 'organizationName.value', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Name of foreign organization"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={entry.country.value}
                                onChange={(e) => updateForeignMilitaryEntry(index, 'country.value', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Country name"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Highest Position/Rank <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={entry.highestRank.value}
                              onChange={(e) => updateForeignMilitaryEntry(index, 'highestRank.value', e.target.value)}
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
                              onChange={(e) => updateForeignMilitaryEntry(index, 'divisionDepartment.value', e.target.value)}
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
                              onChange={(e) => updateForeignMilitaryEntry(index, 'reasonForLeaving.value', e.target.value)}
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
                              onChange={(e) => updateForeignMilitaryEntry(index, 'circumstancesDescription.value', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Describe the circumstances of your association with this organization"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addForeignMilitaryEntry}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600"
                  >
                    + Add Another Foreign Military Entry
                  </button>
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