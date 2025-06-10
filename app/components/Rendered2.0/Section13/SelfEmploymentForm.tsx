/**
 * Self-Employment Form Component (Section 13A.3)
 * 
 * Specialized form for self-employment with business information,
 * verifier contacts, and self-employment specific fields
 */

import React, { useState, useCallback } from 'react';
import { useSection13 } from '~/state/contexts/sections2.0/section13';
import type { SelfEmploymentEntry } from '../../../../api/interfaces/sections2.0/section13';

interface SelfEmploymentFormProps {
  entry: SelfEmploymentEntry;
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

export const SelfEmploymentForm: React.FC<SelfEmploymentFormProps> = ({
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
            Self-Employment Start Date (Month/Year) <span className="text-red-500">*</span>
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
            Self-Employment End Date (Month/Year)
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

      {/* Business Information */}
      <div className="space-y-4">
        <h5 className="text-md font-medium text-gray-800">Business Information</h5>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={getFieldValue('businessName')}
              onChange={(e) => handleFieldChange('businessName', e.target.value)}
              placeholder="Your business or company name"
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
              placeholder="e.g., Owner, Consultant, Freelancer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getFieldValue('businessType')}
            onChange={(e) => handleFieldChange('businessType', e.target.value)}
            placeholder="e.g., Consulting, Retail, Construction, Technology"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Business Address */}
      <div className="space-y-4">
        <h5 className="text-md font-medium text-gray-800">Business Address</h5>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getFieldValue('businessAddress.street')}
            onChange={(e) => handleFieldChange('businessAddress.street', e.target.value)}
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
              value={getFieldValue('businessAddress.city')}
              onChange={(e) => handleFieldChange('businessAddress.city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <select
              value={getFieldValue('businessAddress.state')}
              onChange={(e) => handleFieldChange('businessAddress.state', e.target.value)}
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
              value={getFieldValue('businessAddress.zipCode')}
              onChange={(e) => handleFieldChange('businessAddress.zipCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Business Contact Information */}
      <div className="space-y-4">
        <h5 className="text-md font-medium text-gray-800">Business Contact Information</h5>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Phone Number <span className="text-red-500">*</span>
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

      {/* Verifier Information */}
      <div className="space-y-4">
        <h5 className="text-md font-medium text-gray-800">Verifier Information</h5>
        <p className="text-sm text-gray-600">
          Provide contact information for someone who can verify your self-employment
          (e.g., accountant, business partner, major client, attorney).
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verifier First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={getFieldValue('verifierFirstName')}
              onChange={(e) => handleFieldChange('verifierFirstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verifier Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={getFieldValue('verifierLastName')}
              onChange={(e) => handleFieldChange('verifierLastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verifier Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="tel"
              value={getFieldValue('verifierPhone.number')}
              onChange={(e) => handleFieldChange('verifierPhone.number', e.target.value)}
              placeholder="(555) 123-4567"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={getFieldValue('verifierPhone.extension')}
              onChange={(e) => handleFieldChange('verifierPhone.extension', e.target.value)}
              placeholder="Ext"
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Verifier Address */}
      <div className="space-y-4">
        <h5 className="text-md font-medium text-gray-800">Verifier Address</h5>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getFieldValue('verifierAddress.street')}
            onChange={(e) => handleFieldChange('verifierAddress.street', e.target.value)}
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
              value={getFieldValue('verifierAddress.city')}
              onChange={(e) => handleFieldChange('verifierAddress.city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <select
              value={getFieldValue('verifierAddress.state')}
              onChange={(e) => handleFieldChange('verifierAddress.state', e.target.value)}
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
              value={getFieldValue('verifierAddress.zipCode')}
              onChange={(e) => handleFieldChange('verifierAddress.zipCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
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

export default SelfEmploymentForm;
