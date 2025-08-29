/**
 * Section 3: Place of Birth - Improved Component
 * Refactored with better maintainability and reusability
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSection3 } from '~/state/contexts/sections2.0/section3';
import { useSF86Form } from '~/state/contexts/sections2.0/SF86FormContext';
import { getCountryOptions, getUSStateOptions } from '../../../api/interfaces/section-interfaces/base';
import { useFormSubmission, FormActions } from './utils/formHelpers';
import { DebugPanel } from './utils/debugPanel';
import { FormField, FormFieldGroup } from './components/FormField';
import { SectionHeader } from './hoc/withSectionWrapper';
import { SECTION_CONFIGS } from './config/sectionConfig';

interface Section3ComponentImprovedProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

const SECTION_CONFIG = SECTION_CONFIGS.section3;

export const Section3ComponentImproved: React.FC<Section3ComponentImprovedProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  // Section 3 Context
  const {
    section3Data,
    updateFieldValue,
    validateSection,
    resetSection,
    errors
  } = useSection3();

  // SF86 Form Context
  const sf86Form = useSF86Form();

  // State
  const [isValid, setIsValid] = useState(false);

  // Memoized options
  const countryOptions = useMemo(() => getCountryOptions(), []);
  const stateOptions = useMemo(() => getUSStateOptions(), []);

  // Memoized field value getter
  const getFieldValue = useCallback((fieldPath: string): string => {
    const field = section3Data.section3[fieldPath];
    return field?.value || '';
  }, [section3Data]);

  // Check if US is selected
  const isUSSelected = useMemo(
    () => getFieldValue('country') === 'United States',
    [getFieldValue]
  );

  // Field change handler
  const handleFieldChange = useCallback(
    (fieldPath: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      updateFieldValue(`section3.${fieldPath}`, e.target.value);
    },
    [updateFieldValue]
  );

  // Form submission handler
  const handleSubmit = useFormSubmission({
    validateSection,
    sectionData: section3Data,
    sectionKey: 'section3',
    sf86Form,
    onValidationChange,
    onNext,
    onError: (error) => {
      console.error('Failed to save Section 3 data:', error);
    }
  });

  // Reset handler
  const handleReset = useCallback(() => {
    resetSection();
  }, [resetSection]);

  // Validation effect
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section3Data, validateSection, onValidationChange]);

  // Field configurations
  const fields = useMemo(() => ({
    country: {
      name: 'country',
      label: 'Country',
      required: true,
      type: 'select' as const,
      helpText: 'Select the country where you were born.',
      options: countryOptions
    },
    state: {
      name: 'state',
      label: 'State',
      required: isUSSelected,
      type: 'select' as const,
      helpText: 'Select the state where you were born.',
      options: stateOptions
    },
    city: {
      name: 'city',
      label: 'City',
      required: true,
      type: 'text' as const,
      placeholder: 'Enter city of birth',
      helpText: 'Enter the city where you were born.'
    },
    county: {
      name: 'county',
      label: 'County',
      required: false,
      type: 'text' as const,
      placeholder: 'Enter county of birth (if applicable)',
      helpText: 'Enter the county where you were born, if applicable.'
    }
  }), [countryOptions, stateOptions, isUSSelected]);

  return (
    <div 
      className={`bg-white rounded-lg shadow-lg p-6 ${className}`} 
      data-testid="section3-form"
    >
      <SectionHeader
        sectionNumber={SECTION_CONFIG.sectionNumber}
        title={SECTION_CONFIG.title}
        description={SECTION_CONFIG.description}
      />

      <form onSubmit={handleSubmit}>
        <FormFieldGroup>
          <FormField
            {...fields.country}
            value={getFieldValue('country')}
            onChange={handleFieldChange('country')}
            error={errors['section3.country']}
          />

          {isUSSelected && (
            <FormField
              {...fields.state}
              value={getFieldValue('state')}
              onChange={handleFieldChange('state')}
              error={errors['section3.state']}
            />
          )}

          <FormField
            {...fields.city}
            value={getFieldValue('city')}
            onChange={handleFieldChange('city')}
            error={errors['section3.city']}
          />

          <FormField
            {...fields.county}
            value={getFieldValue('county')}
            onChange={handleFieldChange('county')}
            error={errors['section3.county']}
          />
        </FormFieldGroup>

        <FormActions onReset={handleReset} />
      </form>

      <DebugPanel 
        data={section3Data} 
        errors={errors}
      />
    </div>
  );
};

export default Section3ComponentImproved;