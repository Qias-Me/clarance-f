/**
 * Unemployment Form Component (Section 13A.4)
 * 
 * Specialized form for unemployment periods with reference contact
 * information and unemployment-specific validation
 */

import React, { useState, useCallback } from 'react';
import { useSection13 } from '~/state/contexts/sections2.0/section13';
import type { UnemploymentEntry } from '../../../../api/interfaces/sections2.0/section13';

interface UnemploymentFormProps {
  entry: UnemploymentEntry;
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

export const UnemploymentForm: React.FC<UnemploymentFormProps> = ({
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
      {/* Unemployment Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unemployment Start Date (Month/Year) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="MM/YYYY"
            value={getFieldValue('unemploymentDates.fromDate')}
            onChange={(e) => handleFieldChange('unemploymentDates.fromDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="flex items-center mt-2">
            <input
              type="checkbox"
              checked={getFieldValue('unemploymentDates.fromEstimated') || false}
              onChange={(e) => handleFieldChange('unemploymentDates.fromEstimated', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Estimated</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unemployment End Date (Month/Year)
          </label>
          <input
            type="text"
            placeholder="MM/YYYY"
            value={getFieldValue('unemploymentDates.toDate')}
            onChange={(e) => handleFieldChange('unemploymentDates.toDate', e.target.value)}
            disabled={getFieldValue('unemploymentDates.present')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <div className="mt-2 space-y-1">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={getFieldValue('unemploymentDates.present') || false}
                onChange={(e) => handleFieldChange('unemploymentDates.present', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Still unemployed</span>
            </label>
            {!getFieldValue('unemploymentDates.present') && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={getFieldValue('unemploymentDates.toEstimated') || false}
                  onChange={(e) => handleFieldChange('unemploymentDates.toEstimated', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Estimated</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Reference Contact Information */}
      <div className="space-y-4">
        <h5 className="text-md font-medium text-gray-800">Reference Contact</h5>
        <p className="text-sm text-gray-600">
          Provide contact information for someone who can verify your unemployment period
          (e.g., family member, friend, former colleague, unemployment office).
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={getFieldValue('reference.firstName')}
              onChange={(e) => handleFieldChange('reference.firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={getFieldValue('reference.lastName')}
              onChange={(e) => handleFieldChange('reference.lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="tel"
              value={getFieldValue('reference.phone.number')}
              onChange={(e) => handleFieldChange('reference.phone.number', e.target.value)}
              placeholder="(555) 123-4567"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={getFieldValue('reference.phone.extension')}
              onChange={(e) => handleFieldChange('reference.phone.extension', e.target.value)}
              placeholder="Ext"
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Reference Address */}
      <div className="space-y-4">
        <h5 className="text-md font-medium text-gray-800">Reference Address</h5>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getFieldValue('reference.address.street')}
            onChange={(e) => handleFieldChange('reference.address.street', e.target.value)}
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
              value={getFieldValue('reference.address.city')}
              onChange={(e) => handleFieldChange('reference.address.city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <select
              value={getFieldValue('reference.address.state')}
              onChange={(e) => handleFieldChange('reference.address.state', e.target.value)}
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
              value={getFieldValue('reference.address.zipCode')}
              onChange={(e) => handleFieldChange('reference.address.zipCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Unemployment Information */}
      <div className="space-y-4">
        <h5 className="text-md font-medium text-gray-800">Additional Information</h5>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Unemployment Period Guidelines
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Include all periods of unemployment lasting 30 days or more</li>
                  <li>Provide a reference who can verify your unemployment status</li>
                  <li>If you received unemployment benefits, you may use the unemployment office as a reference</li>
                  <li>Family members or close friends can serve as references if no official records exist</li>
                  <li>Be prepared to explain the reason for unemployment if asked</li>
                </ul>
              </div>
            </div>
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

export default UnemploymentForm;
