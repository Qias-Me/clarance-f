/**
 * Military Employment Form Component (Section 13A.1)
 * 
 * Specialized form for military and federal employment with duty station,
 * rank/title, APO/FPO addresses, and enhanced supervisor information
 */

import React, { useState, useCallback } from 'react';
import { useSection13 } from '~/state/contexts/sections2.0/section13';
import type { MilitaryEmploymentEntry } from '../../../../api/interfaces/sections2.0/section13';

interface MilitaryEmploymentFormProps {
  entry: MilitaryEmploymentEntry;
  entryIndex: number;
  onFieldUpdate: (fieldPath: string, value: any) => void;
  validationErrors?: string[];
}

const US_STATES = [
  { value: '', label: 'Select State...' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'CA', label: 'California' },
  { value: 'FL', label: 'Florida' },
  { value: 'TX', label: 'Texas' },
  { value: 'NY', label: 'New York' },
  // Add more states as needed
];

const EMPLOYMENT_STATUS_OPTIONS = [
  'Full-time',
  'Part-time', 
  'Contractor',
  'Temporary',
  'Seasonal'
];

export const MilitaryEmploymentForm: React.FC<MilitaryEmploymentFormProps> = ({
  entry,
  entryIndex,
  onFieldUpdate,
  validationErrors = []
}) => {
  const [localFormData, setLocalFormData] = useState<Record<string, any>>({});
  const { formatEmploymentDate } = useSection13();

  // Helper function to get field value (local or from entry)
  const getFieldValue = useCallback((fieldPath: string) => {
    const keys = fieldPath.split('.');
    let value = localFormData[fieldPath];
    
    if (value === undefined) {
      // Get from entry data
      let current: any = entry;
      for (const key of keys) {
        current = current?.[key];
      }
      value = current?.value || current || '';
    }
    
    return value;
  }, [localFormData, entry]);

  // Handle field updates
  const handleFieldChange = useCallback((fieldPath: string, value: any) => {
    setLocalFormData(prev => ({
      ...prev,
      [fieldPath]: value
    }));
    onFieldUpdate(fieldPath, value);
  }, [onFieldUpdate]);

  return (
    <div className="space-y-6">
      {/* Employment Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Start Date (Month/Year) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="MM/YYYY"
            value={getFieldValue('employmentDates.fromDate')}
            onChange={(e) => handleFieldChange('employmentDates.fromDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="flex items-center mt-2">
            <input
              type="checkbox"
              checked={getFieldValue('employmentDates.fromEstimated') || false}
              onChange={(e) => handleFieldChange('employmentDates.fromEstimated', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Estimated</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service End Date (Month/Year)
          </label>
          <input
            type="text"
            placeholder="MM/YYYY"
            value={getFieldValue('employmentDates.toDate')}
            onChange={(e) => handleFieldChange('employmentDates.toDate', e.target.value)}
            disabled={getFieldValue('employmentDates.present')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <div className="mt-2 space-y-1">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={getFieldValue('employmentDates.present') || false}
                onChange={(e) => handleFieldChange('employmentDates.present', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Present</span>
            </label>
            {!getFieldValue('employmentDates.present') && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={getFieldValue('employmentDates.toEstimated') || false}
                  onChange={(e) => handleFieldChange('employmentDates.toEstimated', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Estimated</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Military Information */}
      <div className="space-y-4">
        <h5 className="text-md font-medium text-gray-800">Military/Federal Information</h5>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rank/Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={getFieldValue('rankTitle')}
              onChange={(e) => handleFieldChange('rankTitle', e.target.value)}
              placeholder="e.g., Captain, GS-12, Lieutenant"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Status <span className="text-red-500">*</span>
            </label>
            <select
              value={getFieldValue('employmentStatus')}
              onChange={(e) => handleFieldChange('employmentStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select status...</option>
              {EMPLOYMENT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Duty Station Information */}
      <div className="space-y-4">
        <h5 className="text-md font-medium text-gray-800">Duty Station/Work Location</h5>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duty Station/Installation <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getFieldValue('dutyStation.dutyStation')}
            onChange={(e) => handleFieldChange('dutyStation.dutyStation', e.target.value)}
            placeholder="e.g., Fort Bragg, Pentagon, Naval Air Station"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getFieldValue('dutyStation.street')}
            onChange={(e) => handleFieldChange('dutyStation.street', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={getFieldValue('dutyStation.city')}
              onChange={(e) => handleFieldChange('dutyStation.city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <select
              value={getFieldValue('dutyStation.state')}
              onChange={(e) => handleFieldChange('dutyStation.state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {US_STATES.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
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
              value={getFieldValue('dutyStation.zipCode')}
              onChange={(e) => handleFieldChange('dutyStation.zipCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Phone Information */}
      <div className="space-y-4">
        <h5 className="text-md font-medium text-gray-800">Contact Information</h5>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={getFieldValue('phone.number')}
              onChange={(e) => handleFieldChange('phone.number', e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extension
            </label>
            <input
              type="text"
              value={getFieldValue('phone.extension')}
              onChange={(e) => handleFieldChange('phone.extension', e.target.value)}
              placeholder="1234"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={getFieldValue('phone.isDSN') || false}
              onChange={(e) => handleFieldChange('phone.isDSN', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">DSN</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={getFieldValue('phone.isDay') || false}
              onChange={(e) => handleFieldChange('phone.isDay', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Day</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={getFieldValue('phone.isNight') || false}
              onChange={(e) => handleFieldChange('phone.isNight', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Night</span>
          </label>
        </div>
      </div>

      {/* Supervisor Information */}
      <div className="space-y-4">
        <h5 className="text-md font-medium text-gray-800">Supervisor Information</h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supervisor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={getFieldValue('supervisor.name')}
              onChange={(e) => handleFieldChange('supervisor.name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supervisor Rank/Title
            </label>
            <input
              type="text"
              value={getFieldValue('supervisor.title')}
              onChange={(e) => handleFieldChange('supervisor.title', e.target.value)}
              placeholder="e.g., Major, GS-13, Director"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supervisor Phone <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="tel"
                value={getFieldValue('supervisor.phone.number')}
                onChange={(e) => handleFieldChange('supervisor.phone.number', e.target.value)}
                placeholder="(555) 123-4567"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={getFieldValue('supervisor.phone.extension')}
                onChange={(e) => handleFieldChange('supervisor.phone.extension', e.target.value)}
                placeholder="Ext"
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supervisor Email
            </label>
            <input
              type="email"
              value={getFieldValue('supervisor.email')}
              onChange={(e) => handleFieldChange('supervisor.email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="flex items-center mt-1">
              <input
                type="checkbox"
                checked={getFieldValue('supervisor.emailUnknown') || false}
                onChange={(e) => handleFieldChange('supervisor.emailUnknown', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Email unknown</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Can this supervisor be contacted? <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name={`supervisor-contact-${entryIndex}`}
                checked={getFieldValue('supervisor.canContact') === "YES"}
                onChange={() => handleFieldChange('supervisor.canContact', "YES")}
                className="mr-2"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`supervisor-contact-${entryIndex}`}
                checked={getFieldValue('supervisor.canContact') === "NO"}
                onChange={() => handleFieldChange('supervisor.canContact', "NO")}
                className="mr-2"
              />
              <span className="text-sm">No</span>
            </label>
          </div>
        </div>

        {getFieldValue('supervisor.canContact') === "NO" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Restrictions (Explain why supervisor cannot be contacted)
            </label>
            <textarea
              value={getFieldValue('supervisor.contactRestrictions')}
              onChange={(e) => handleFieldChange('supervisor.contactRestrictions', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Show validation errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Please correct the following errors:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilitaryEmploymentForm;
