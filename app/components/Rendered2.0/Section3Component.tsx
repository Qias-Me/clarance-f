/**
 * Section 3: Place of Birth - Component
 * 
 * Modernized React component using withSectionWrapper HOC
 * Eliminates boilerplate and uses shared architecture patterns
 */

import React, { memo, useMemo, useCallback } from 'react';
import { withSectionWrapper } from './hoc/withSectionWrapper';
import { useSection3 } from '~/state/contexts/sections2.0/section3';
import { FieldRenderer } from './fields/FieldRenderer';
import { getCountryOptions, getUSStateOptions } from '../../../api/interfaces/section-interfaces/base';

interface Section3FieldsProps {
  onValidationChange?: (isValid: boolean) => void;
}

const Section3Fields: React.FC<Section3FieldsProps> = ({ onValidationChange }) => {
  const { 
    section3Data,
    updateFieldValue,
    errors,
    isLoading,
    validateSection
  } = useSection3();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  // Helper to get field value
  const getFieldValue = useCallback((fieldPath: string): string => {
    const sectionData = section3Data?.section3;
    if (!sectionData) return '';
    
    const field = sectionData[fieldPath as keyof typeof sectionData];
    return field?.value || '';
  }, [section3Data]);

  // Handle field updates with memoization
  const handleFieldChange = useCallback((fieldPath: string, value: string) => {
    updateFieldValue(`section3.${fieldPath}`, value);
  }, [updateFieldValue]);

  // Initial validation on mount
  React.useEffect(() => {
    const validationResult = validateSection();
    console.log('Section 3 Initial Validation:', validationResult);
    onValidationChange?.(validationResult.isValid);
  }, [validateSection, onValidationChange]);
  
  // Re-validate when section data changes
  React.useEffect(() => {
    if (section3Data && section3Data.section3) {
      const validationResult = validateSection();
      console.log('Section 3 Data Changed Validation:', validationResult);
      onValidationChange?.(validationResult.isValid);
    }
  }, [
    section3Data?.section3?.city?.value,
    section3Data?.section3?.state?.value,
    section3Data?.section3?.country?.value,
    section3Data?.section3?.county?.value,
    validateSection,
    onValidationChange
  ]);

  // Memoize options
  const countryOptions = useMemo(() => getCountryOptions(), []);
  const stateOptions = useMemo(() => getUSStateOptions(), []);
  const isUSSelected = useMemo(() => getFieldValue('country') === 'United States', [getFieldValue]);

  return (
    <div className="space-y-6">
      <FieldRenderer
        config={{
          id: 'country',
          label: 'Country',
          type: 'select',
          required: true,
          options: countryOptions
        }}
        value={getFieldValue('country')}
        onChange={(value) => handleFieldChange('country', value as string)}
        error={errors['section3.country']}
        helpText="Select the country where you were born."
      />

      {isUSSelected && (
        <FieldRenderer
          config={{
            id: 'state',
            label: 'State',
            type: 'select',
            required: true,
            options: stateOptions
          }}
          value={getFieldValue('state')}
          onChange={(value) => handleFieldChange('state', value as string)}
          error={errors['section3.state']}
          helpText="Select the state where you were born."
        />
      )}

      <FieldRenderer
        config={{
          id: 'city',
          label: 'City',
          type: 'text',
          required: true,
          placeholder: 'Enter city of birth'
        }}
        value={getFieldValue('city')}
        onChange={(value) => handleFieldChange('city', value as string)}
        error={errors['section3.city']}
        helpText="Enter the city where you were born."
      />

      <FieldRenderer
        config={{
          id: 'county',
          label: 'County',
          type: 'text',
          required: false,
          placeholder: 'Enter county of birth (if applicable)'
        }}
        value={getFieldValue('county')}
        onChange={(value) => handleFieldChange('county', value as string)}
        helpText="Enter the county where you were born, if applicable."
      />
    </div>
  );
};

export const Section3Component = withSectionWrapper(
  Section3Fields,
  {
    sectionNumber: 3,
    title: 'Place of Birth',
    description: 'Provide information about your place of birth including country, state, city, and county.',
    enableProgressBar: true,
    enableAutoSave: true,
    enableKeyboardShortcuts: true
  }
);

export default Section3Component;
