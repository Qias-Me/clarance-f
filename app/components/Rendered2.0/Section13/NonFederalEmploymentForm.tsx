/**
 * Non-Federal Employment Form Component (Section 13A.2)
 * 
 * Specialized form for non-federal employment including private companies,
 * state government, contractors with additional employment periods and
 * physical work addresses
 */

import React, { useState, useCallback } from 'react';
import { useSection13 } from '~/state/contexts/sections2.0/section13';
import type { NonFederalEmploymentEntry } from '../../../../api/interfaces/sections2.0/section13';

interface NonFederalEmploymentFormProps {
  entry: NonFederalEmploymentEntry;
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

export const NonFederalEmploymentForm: React.FC<NonFederalEmploymentFormProps> = ({
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

      // Handle Field<T> objects properly
      if (current && typeof current === 'object') {
        // If it's a Field<T> object with a value property, extract the value
        if ('value' in current) {
          value = current.value;
        }
        // If it's an object without a value property, it might be malformed data
        else if (typeof current === 'object' && !Array.isArray(current)) {
          console.warn(`Field ${fieldPath} is an object without a value property:`, current);
          value = '';
        }
        // Otherwise use the current value
        else {
          value = current;
        }
      } else {
        // For primitive values, use as-is
        value = current || '';
      }
    }

    // Ensure we never return an object to the input field
    if (typeof value === 'object' && value !== null) {
      console.warn(`Field ${fieldPath} is still an object after processing:`, value);
      return '';
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
            Employment Start Date (Month/Year) <span className="text-red-500">*</span>
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
            Employment End Date (Month/Year)
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

      {/* Employer Information */}
      <div className="space-y-4">
        <h5 className="text-md font-medium text-gray-800">Employer Information</h5>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employer/Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={getFieldValue('employerName')}
              onChange={(e) => handleFieldChange('employerName', e.target.value)}
              placeholder="Company or organization name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={getFieldValue('positionTitle')}
              onChange={(e) => handleFieldChange('positionTitle', e.target.value)}
              placeholder="Your job title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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

      {/* Employer Address */}
      <div className="space-y-4">
        <h5 className="text-md font-medium text-gray-800">Employer Address</h5>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getFieldValue('employerAddress.street')}
            onChange={(e) => handleFieldChange('employerAddress.street', e.target.value)}
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
              value={getFieldValue('employerAddress.city')}
              onChange={(e) => handleFieldChange('employerAddress.city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <select
              value={getFieldValue('employerAddress.state')}
              onChange={(e) => handleFieldChange('employerAddress.state', e.target.value)}
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
              value={getFieldValue('employerAddress.zipCode')}
              onChange={(e) => handleFieldChange('employerAddress.zipCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
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
      </div>

      {/* Additional Employment Periods */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Did you have additional employment periods with this employer?
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name={`additional-periods-${entryIndex}`}
                checked={getFieldValue('hasAdditionalPeriods') === true}
                onChange={() => handleFieldChange('hasAdditionalPeriods', true)}
                className="mr-2"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`additional-periods-${entryIndex}`}
                checked={getFieldValue('hasAdditionalPeriods') === false}
                onChange={() => handleFieldChange('hasAdditionalPeriods', false)}
                className="mr-2"
              />
              <span className="text-sm">No</span>
            </label>
          </div>
        </div>

        {getFieldValue('hasAdditionalPeriods') && (
          <div className="ml-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 mb-2">
              Additional employment periods will be collected in a separate section.
            </p>
          </div>
        )}
      </div>

      {/* Physical Work Address */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Did you work at a different physical location than the employer address?
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name={`physical-address-${entryIndex}`}
                checked={getFieldValue('hasPhysicalWorkAddress') === true}
                onChange={() => handleFieldChange('hasPhysicalWorkAddress', true)}
                className="mr-2"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`physical-address-${entryIndex}`}
                checked={getFieldValue('hasPhysicalWorkAddress') === false}
                onChange={() => handleFieldChange('hasPhysicalWorkAddress', false)}
                className="mr-2"
              />
              <span className="text-sm">No</span>
            </label>
          </div>
        </div>

        {getFieldValue('hasPhysicalWorkAddress') && (
          <div className="ml-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 mb-2">
              Physical work address details will be collected in a separate section.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NonFederalEmploymentForm;
