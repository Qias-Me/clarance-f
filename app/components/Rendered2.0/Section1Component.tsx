/**
 * Section 1: Information About You - Component
 * 
 * Modernized React component using withSectionWrapper HOC
 * Eliminates boilerplate and uses shared architecture patterns
 */

import React, { memo, useMemo } from 'react';
import { withSectionWrapper } from './hoc/withSectionWrapper';
import { useSection1 } from '~/state/contexts/sections2.0/section1';
import { FieldRenderer } from './fields/FieldRenderer';
import { SECTION_CONFIGS } from '../../config/field-configs';
import { getSuffixOptions } from '../../../api/interfaces/section-interfaces/base';
import { createFieldAccessor, type FieldMapping } from '../../utils/field-accessor';
import type { Section1 } from '../../../api/interfaces/section-interfaces/section1';

interface Section1FieldsProps {
  onValidationChange?: (isValid: boolean) => void;
}

const Section1Fields: React.FC<Section1FieldsProps> = ({ onValidationChange }) => {
  const { 
    section1Data,
    updatePersonalInfo,
    errors,
    isLoading,
    validateSection 
  } = useSection1();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  // Create field accessor for type-safe field access
  const fieldAccessor = useMemo(() => {
    const mappings: Record<string, FieldMapping<Section1>> = {
      'lastName': {
        path: 'lastName',
        getter: (data) => data.section1.lastName
      },
      'firstName': {
        path: 'firstName',
        getter: (data) => data.section1.firstName
      },
      'middleName': {
        path: 'middleName',
        getter: (data) => data.section1.middleName
      },
      'suffix': {
        path: 'suffix',
        getter: (data) => data.section1.suffix
      }
    };

    return createFieldAccessor(section1Data, mappings, updatePersonalInfo);
  }, [section1Data, updatePersonalInfo]);

  // Helper to get field value
  const getFieldValue = React.useCallback((fieldPath: string): string => {
    return fieldAccessor.get(fieldPath) as string || '';
  }, [fieldAccessor]);

  // Handle field updates with memoization and validation
  const handleFieldChange = React.useCallback((fieldPath: string, value: string) => {
    updatePersonalInfo(fieldPath, value);
    // Don't validate here - let useEffect handle it when data changes
  }, [updatePersonalInfo]);
  
  // Initial validation on mount
  React.useEffect(() => {
    const validationResult = validateSection();
    console.log('Section 1 Initial Validation:', validationResult);
    onValidationChange?.(validationResult.isValid);
  }, [validateSection, onValidationChange]);
  
  // Re-validate when section data changes
  React.useEffect(() => {
    // Skip initial render to avoid double validation
    if (section1Data && section1Data.section1) {
      const validationResult = validateSection();
      console.log('Section 1 Data Changed Validation:', validationResult);
      onValidationChange?.(validationResult.isValid);
    }
  }, [section1Data.section1.lastName.value, section1Data.section1.firstName.value, section1Data.section1.middleName.value, section1Data.section1.suffix.value, validateSection, onValidationChange]);


  return (
    <div className="space-y-6">
      <FieldRenderer
        config={{
          id: 'lastName',
          label: 'Last Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your last name'
        }}
        value={getFieldValue('lastName')}
        onChange={(value) => handleFieldChange('lastName', value as string)}
        error={errors['section1.fullName']}
        helpText="Enter your last name exactly as it appears on your birth certificate or passport."
      />

      <FieldRenderer
        config={{
          id: 'firstName',
          label: 'First Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your first name'
        }}
        value={getFieldValue('firstName')}
        onChange={(value) => handleFieldChange('firstName', value as string)}
        error={errors['section1.fullName']}
        helpText="Enter your first name exactly as it appears on your birth certificate or passport."
      />

      <FieldRenderer
        config={{
          id: 'middleName',
          label: 'Middle Name',
          type: 'text',
          required: false,
          placeholder: 'Enter your middle name (if applicable)'
        }}
        value={getFieldValue('middleName')}
        onChange={(value) => handleFieldChange('middleName', value as string)}
        helpText="Enter your middle name if you have one. Leave blank if not applicable."
      />

      <FieldRenderer
        config={{
          id: 'suffix',
          label: 'Suffix',
          type: 'select',
          required: false,
          options: getSuffixOptions().map(opt => ({ value: opt.value, label: opt.label }))
        }}
        value={getFieldValue('suffix')}
        onChange={(value) => handleFieldChange('suffix', value as string)}
        helpText="Select your name suffix if applicable (Jr., Sr., II, III, etc.)."
      />




    </div>
  );
};

export const Section1Component = withSectionWrapper(
  Section1Fields,
  {
    sectionNumber: 1,
    title: 'Information About You',
    description: 'Provide your full legal name as it appears on official documents.',
    enableProgressBar: true,
    enableAutoSave: true,
    enableKeyboardShortcuts: true
  }
);

export default Section1Component;
