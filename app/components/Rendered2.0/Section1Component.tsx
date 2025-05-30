/**
 * Section 1: Information About You - Component
 *
 * React component for SF-86 Section 1 using the new Form Architecture 2.0.
 * This component integrates with SF86FormContext and provides a clean,
 * accessible interface for collecting personal information.
 */

import React from 'react';
import { useSection1 } from '~/state/contexts/sections2.0/section1';
import type { Section1 } from '../../../api/interfaces/sections2.0/section1';

interface Section1ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
}

export const Section1Component: React.FC<Section1ComponentProps> = ({
  className = '',
  onValidationChange
}) => {
  const {
    section1Data,
    updatePersonalInfo,
    validateSection,
    resetSection,
    errors
  } = useSection1();

  // Handle field updates
  const handleFieldChange = (fieldPath: string, value: string) => {
    updatePersonalInfo(fieldPath, value);
  };

  // Handle validation
  const handleValidation = () => {
    const result = validateSection();
    onValidationChange?.(result.isValid);
    return result;
  };

  // Get field value safely
  const getFieldValue = (fieldPath: string): string => {
    const keys = fieldPath.split('.');
    let current: any = section1Data;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return '';
      }
    }

    return current?.value || '';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section1-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 1: Information About You
        </h2>
        <p className="text-gray-600">
          Provide your full legal name as it appears on official documents.
        </p>
      </div>

      {/* Personal Information Form */}
      <div className="space-y-6">
        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            data-testid="last-name-field"
            value={getFieldValue('personalInfo.fullName.lastName')}
            onChange={(e) => handleFieldChange('fullName.lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your last name"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter your last name exactly as it appears on your birth certificate or passport.
          </p>
        </div>

        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            data-testid="first-name-field"
            value={getFieldValue('personalInfo.fullName.firstName')}
            onChange={(e) => handleFieldChange('fullName.firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your first name"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter your first name exactly as it appears on your birth certificate or passport.
          </p>
        </div>

        {/* Middle Name */}
        <div>
          <label
            htmlFor="middleName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Middle Name
          </label>
          <input
            type="text"
            id="middleName"
            data-testid="middle-name-field"
            value={getFieldValue('personalInfo.fullName.middleName')}
            onChange={(e) => handleFieldChange('fullName.middleName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your middle name (if applicable)"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter your middle name if you have one. Leave blank if not applicable.
          </p>
        </div>

        {/* Suffix */}
        <div>
          <label
            htmlFor="suffix"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Suffix
          </label>
          <select
            id="suffix"
            data-testid="suffix-field"
            value={getFieldValue('personalInfo.fullName.suffix')}
            onChange={(e) => handleFieldChange('fullName.suffix', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select suffix (if applicable)</option>
            <option value="Jr.">Jr.</option>
            <option value="Sr.">Sr.</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
            <option value="V">V</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Select your name suffix if applicable (Jr., Sr., II, III, etc.).
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          <span className="text-red-500">*</span> Required fields
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleValidation}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            data-testid="validate-section-button"
          >
            Validate Section
          </button>

          <button
            type="button"
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            data-testid="clear-section-button"
            onClick={resetSection}
          >
            Clear Section
          </button>
        </div>
      </div>

      {/* Validation Status */}
      <div className="mt-4" data-testid="validation-status">
        <div className="text-sm text-gray-600">
          Section Status: <span className="font-medium">Ready for input</span>
        </div>
      </div>

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Information (Development Only)
          </summary>
          <div className="mt-2">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Section 1 Data:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(section1Data, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};

export default Section1Component;
