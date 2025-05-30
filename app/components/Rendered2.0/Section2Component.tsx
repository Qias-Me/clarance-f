/**
 * Section 2: Date of Birth - Component
 *
 * React component for SF-86 Section 2 using the new Form Architecture 2.0.
 * This component handles date of birth collection with automatic age calculation
 * and estimation checkbox functionality.
 */

import React, { useEffect } from 'react';
import { useSection2 } from '~/state/contexts/sections2.0/section2';
import type { Section2 } from '../../../api/interfaces/sections2.0/section2';

interface Section2ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
}

export const Section2Component: React.FC<Section2ComponentProps> = ({
  className = '',
  onValidationChange
}) => {
  const {
    section2Data,
    updateDateOfBirth,
    updateEstimated,
    validateSection,
    resetSection,
    getAge,
    errors
  } = useSection2();

  // Handle field updates
  const handleFieldChange = (fieldPath: string, value: string | boolean) => {
    if (fieldPath === 'dateOfBirth.date') {
      updateDateOfBirth(value as string);
    } else if (fieldPath === 'dateOfBirth.estimated') {
      updateEstimated(value as boolean);
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Get field value safely
  const getFieldValue = (fieldPath: string): any => {
    const keys = fieldPath.split('.');
    let current: any = section2Data;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return fieldPath.includes('estimated') ? false : '';
      }
    }

    return current?.value ?? (fieldPath.includes('estimated') ? false : '');
  };

  // Auto-calculate age when date changes
  useEffect(() => {
    const dateValue = getFieldValue('dateOfBirth.date');
    if (dateValue) {
      const age = calculateAge(dateValue);
      handleFieldChange('dateOfBirth.age', age.toString());
    }
  }, [getFieldValue('dateOfBirth.date')]);

  // Handle validation
  const handleValidation = () => {
    const result = validateSection();
    onValidationChange?.(result.isValid);
    return result;
  };

  // Validate date format and constraints
  const validateDate = (dateString: string): { isValid: boolean; error?: string } => {
    if (!dateString) {
      return { isValid: false, error: 'Date of birth is required' };
    }

    const date = new Date(dateString);
    const today = new Date();

    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Invalid date format' };
    }

    if (date > today) {
      return { isValid: false, error: 'Date cannot be in the future' };
    }

    const age = calculateAge(dateString);
    if (age < 16) {
      return { isValid: false, error: 'Applicant must be at least 16 years old' };
    }

    if (age > 120) {
      return { isValid: false, error: 'Please verify the date of birth' };
    }

    return { isValid: true };
  };

  const dateValidation = validateDate(getFieldValue('dateOfBirth.date'));

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section2-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 2: Date of Birth
        </h2>
        <p className="text-gray-600">
          Provide your date of birth. If you are unsure of the exact date, check the "Estimated" box.
        </p>
      </div>

      {/* Date of Birth Form */}
      <div className="space-y-6">
        {/* Date of Birth */}
        <div>
          <label
            htmlFor="dateOfBirth"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dateOfBirth"
            data-testid="date-of-birth-field"
            value={getFieldValue('dateOfBirth.date')}
            onChange={(e) => handleFieldChange('dateOfBirth.date', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              !dateValidation.isValid && getFieldValue('dateOfBirth.date')
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
            required
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
          />
          {!dateValidation.isValid && getFieldValue('dateOfBirth.date') && (
            <p className="mt-1 text-sm text-red-600" data-testid="date-format-error">
              {dateValidation.error}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter your date of birth in MM/DD/YYYY format.
          </p>
        </div>

        {/* Estimated Checkbox */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="estimated"
              type="checkbox"
              data-testid="estimated-checkbox"
              checked={getFieldValue('dateOfBirth.estimated')}
              onChange={(e) => handleFieldChange('dateOfBirth.estimated', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="estimated" className="font-medium text-gray-700">
              Estimated
            </label>
            <p className="text-gray-500">
              Check this box if you are not certain of your exact date of birth.
            </p>
          </div>
        </div>

        {/* Calculated Age (Read-only) */}
        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Current Age
          </label>
          <input
            type="text"
            id="age"
            data-testid="age-field"
            value={getFieldValue('dateOfBirth.age')}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600"
            placeholder="Age will be calculated automatically"
          />
          <p className="mt-1 text-xs text-gray-500">
            Your age is calculated automatically based on your date of birth.
          </p>
        </div>

        {/* Age Display */}
        {getFieldValue('dateOfBirth.date') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Age Calculation
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  Based on your date of birth, you are currently {getAge() || 0} years old.
                  {getFieldValue('dateOfBirth.estimated') && (
                    <span className="font-medium"> (Estimated)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
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
          Section Status: <span className="font-medium">
            {dateValidation.isValid ? 'Valid' : 'Needs attention'}
          </span>
        </div>
      </div>

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Information (Development Only)
          </summary>
          <div className="mt-2">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Section 2 Data:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(section2Data, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};

export default Section2Component;
