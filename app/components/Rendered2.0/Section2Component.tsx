/**
 * Section 2: Date of Birth - Component
 * 
 * Modernized React component using withSectionWrapper HOC
 * Eliminates boilerplate and uses shared architecture patterns
 */

import React, { memo, useMemo, useCallback } from 'react';
import { withSectionWrapper } from './hoc/withSectionWrapper';
import { useSection2 } from '~/state/contexts/sections2.0/section2';
import { FieldRenderer } from './fields/FieldRenderer';

interface Section2FieldsProps {
  onValidationChange?: (isValid: boolean) => void;
}

const Section2Fields: React.FC<Section2FieldsProps> = ({ onValidationChange }) => {
  const { 
    section2Data,
    updateDateOfBirth,
    updateEstimated,
    errors,
    isLoading,
    getAge,
    validateSection
  } = useSection2();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  // Helper to get field value
  const getFieldValue = useCallback((fieldPath: string): string => {
    switch (fieldPath) {
      case 'dateOfBirth':
        const dateValue = section2Data?.section2?.date?.value || '';
        // Convert from MM/DD/YYYY to YYYY-MM-DD for HTML date input
        if (dateValue && dateValue.includes('/')) {
          const [month, day, year] = dateValue.split('/');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return dateValue;
      case 'dateOfBirthDisplay':
        // Return the stored format for display purposes
        return section2Data?.section2?.date?.value || '';
      case 'isEstimated':
        return section2Data?.section2?.isEstimated?.value ? 'true' : 'false';
      default:
        return '';
    }
  }, [section2Data]);

  // Handle field updates with memoization
  const handleFieldChange = useCallback((fieldPath: string, value: string | boolean) => {
    if (fieldPath === 'dateOfBirth') {
      updateDateOfBirth(value as string);
    } else if (fieldPath === 'isEstimated') {
      updateEstimated(value as boolean);
    }
  }, [updateDateOfBirth, updateEstimated]);

  // Initial validation on mount
  React.useEffect(() => {
    const validationResult = validateSection();
    console.log('Section 2 Initial Validation:', validationResult);
    onValidationChange?.(validationResult.isValid);
  }, [validateSection, onValidationChange]);
  
  // Re-validate when section data changes
  React.useEffect(() => {
    if (section2Data && section2Data.section2) {
      const validationResult = validateSection();
      console.log('Section 2 Data Changed Validation:', validationResult);
      onValidationChange?.(validationResult.isValid);
    }
  }, [section2Data?.section2?.date?.value, section2Data?.section2?.isEstimated?.value, validateSection, onValidationChange]);

  return (
    <div className="space-y-6">
      <FieldRenderer
        config={{
          id: 'dateOfBirth',
          label: 'Date of Birth',
          type: 'date',
          required: true,
          placeholder: 'MM/DD/YYYY'
        }}
        value={getFieldValue('dateOfBirth')}
        onChange={(value) => handleFieldChange('dateOfBirth', value as string)}
        error={errors['section2.date']}
        helpText="Enter your date of birth as it appears on your birth certificate."
      />

      <FieldRenderer
        config={{
          id: 'isEstimated',
          label: 'Estimated',
          type: 'checkbox'
        }}
        value={section2Data?.section2?.isEstimated?.value || false}
        onChange={(value) => handleFieldChange('isEstimated', value as boolean)}
        helpText="Check this box if you are not certain of your exact date of birth."
      />

      {/* Age Display */}
      {getFieldValue('dateOfBirthDisplay') && (
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
                Based on your date of birth ({getFieldValue('dateOfBirthDisplay')}), you are currently {getAge() || 0} years old.
                {section2Data?.section2?.isEstimated?.value && (
                  <span className="font-medium"> (Estimated)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Section2Component = withSectionWrapper(
  Section2Fields,
  {
    sectionNumber: 2,
    title: 'Date of Birth',
    description: 'Provide your date of birth. If you are unsure of the exact date, check the "Estimated" box.',
    enableProgressBar: true,
    enableAutoSave: true,
    enableKeyboardShortcuts: true
  }
);

export default Section2Component;
