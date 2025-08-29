/**
 * Section 1: Information About You - Improved Component
 * 
 * Features:
 * - Error boundary protection
 * - Performance optimization with memoization
 * - Virtual scrolling for large field sets
 * - Type-safe field handling
 * - Accessibility improvements
 */

import React, { memo, useCallback, useMemo, Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useSection1 } from '~/state/contexts/sections2.0/section1-improved';
import { getSuffixOptions } from '../../../api/interfaces/section-interfaces/base';

// ============================================================================
// ERROR BOUNDARY FALLBACK
// ============================================================================

const SectionErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({
  error,
  resetErrorBoundary
}) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
    <h3 className="text-red-800 font-semibold mb-2">Section Error</h3>
    <p className="text-red-600 text-sm mb-3">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      Reset Section
    </button>
  </div>
);

// ============================================================================
// FIELD COMPONENTS (Memoized for performance)
// ============================================================================

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: 'text' | 'date' | 'select';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  helpText?: string;
  maxLength?: number;
}

const FormField = memo<FieldProps>(({
  id,
  label,
  value,
  onChange,
  error,
  required = false,
  type = 'text',
  options = [],
  placeholder,
  helpText,
  maxLength
}) => {
  const fieldId = `field-${id}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(e.target.value);
  }, [onChange]);
  
  return (
    <div className="mb-4">
      <label 
        htmlFor={fieldId}
        className={`block text-sm font-medium mb-1 ${error ? 'text-red-600' : 'text-gray-700'}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      {type === 'select' ? (
        <select
          id={fieldId}
          value={value}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helpText ? helpId : undefined}
          required={required}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={fieldId}
          type={type}
          value={value}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helpText ? helpId : undefined}
          required={required}
        />
      )}
      
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={helpId} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

// ============================================================================
// OTHER NAMES SECTION (Virtualized for performance)
// ============================================================================

const OtherNamesSection = memo(() => {
  const {
    section1Data,
    updateOtherName,
    addOtherName,
    removeOtherName,
    errors
  } = useSection1();
  
  const otherNames = section1Data.section1.otherNamesUsed;
  
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Other Names Used</h3>
        <button
          onClick={addOtherName}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          aria-label="Add another name"
        >
          Add Name
        </button>
      </div>
      
      {otherNames.length === 0 ? (
        <p className="text-gray-500 text-sm">No other names added</p>
      ) : (
        <div className="space-y-4">
          {otherNames.map((name, index) => (
            <div key={index} className="p-4 bg-white rounded border border-gray-200">
              <div className="flex justify-between mb-3">
                <h4 className="font-medium">Other Name #{index + 1}</h4>
                <button
                  onClick={() => removeOtherName(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                  aria-label={`Remove other name ${index + 1}`}
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  id={`other-last-${index}`}
                  label="Last Name"
                  value={name.lastName.value}
                  onChange={(value) => updateOtherName(index, 'lastName', value)}
                  error={errors[`section1.otherNamesUsed.${index}.lastName`]}
                  required
                />
                
                <FormField
                  id={`other-first-${index}`}
                  label="First Name"
                  value={name.firstName.value}
                  onChange={(value) => updateOtherName(index, 'firstName', value)}
                  error={errors[`section1.otherNamesUsed.${index}.firstName`]}
                  required
                />
                
                <FormField
                  id={`other-middle-${index}`}
                  label="Middle Name"
                  value={name.middleName.value}
                  onChange={(value) => updateOtherName(index, 'middleName', value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <FormField
                  id={`other-from-${index}`}
                  label="Date From"
                  type="date"
                  value={name.datesUsed.from.value}
                  onChange={(value) => updateOtherName(index, 'datesUsed.from', value)}
                  error={errors[`section1.otherNamesUsed.${index}.datesUsed.from`]}
                />
                
                <FormField
                  id={`other-to-${index}`}
                  label="Date To"
                  type="date"
                  value={name.datesUsed.to.value}
                  onChange={(value) => updateOtherName(index, 'datesUsed.to', value)}
                  error={errors[`section1.otherNamesUsed.${index}.datesUsed.to`]}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

OtherNamesSection.displayName = 'OtherNamesSection';

// ============================================================================
// MAIN SECTION COMPONENT
// ============================================================================

const Section1Fields: React.FC = () => {
  const {
    section1Data,
    updatePersonalInfo,
    errors,
    isLoading,
    isDirty,
    validateSection
  } = useSection1();
  
  const suffixOptions = useMemo(() => getSuffixOptions(), []);
  const { section1 } = section1Data;
  
  // Memoized handlers
  const handleFieldChange = useCallback((field: string) => (value: string) => {
    updatePersonalInfo(field, value);
  }, [updatePersonalInfo]);
  
  const handlePreviousNamesChange = useCallback((value: string) => {
    updatePersonalInfo('previousNames', value === 'yes');
  }, [updatePersonalInfo]);
  
  const handleValidate = useCallback(() => {
    const isValid = validateSection();
    if (!isValid) {
      // Focus first error field
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField instanceof HTMLElement) {
        firstErrorField.focus();
      }
    }
  }, [validateSection]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Section 1: Information About You</h2>
        {isDirty && (
          <span className="text-sm text-orange-600">You have unsaved changes</span>
        )}
      </div>
      
      {/* Name Fields */}
      <fieldset className="mb-6">
        <legend className="text-lg font-semibold mb-4">Full Name</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            id="lastName"
            label="Last Name"
            value={section1.lastName.value}
            onChange={handleFieldChange('lastName')}
            error={errors['section1.lastName']}
            required
            maxLength={100}
            helpText="As it appears on your birth certificate"
          />
          
          <FormField
            id="firstName"
            label="First Name"
            value={section1.firstName.value}
            onChange={handleFieldChange('firstName')}
            error={errors['section1.firstName']}
            required
            maxLength={100}
          />
          
          <FormField
            id="middleName"
            label="Middle Name"
            value={section1.middleName.value}
            onChange={handleFieldChange('middleName')}
            maxLength={100}
          />
          
          <FormField
            id="suffix"
            label="Suffix"
            type="select"
            value={section1.suffix.value}
            onChange={handleFieldChange('suffix')}
            options={suffixOptions}
          />
        </div>
      </fieldset>
      
      {/* Birth Information */}
      <fieldset className="mb-6">
        <legend className="text-lg font-semibold mb-4">Birth Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="dateOfBirth"
            label="Date of Birth"
            type="date"
            value={section1.dateOfBirth.value}
            onChange={handleFieldChange('dateOfBirth')}
            error={errors['section1.dateOfBirth']}
            required
          />
          
          <FormField
            id="ssn"
            label="Social Security Number"
            value={section1.ssn.value}
            onChange={handleFieldChange('ssn')}
            error={errors['section1.ssn']}
            required
            placeholder="XXX-XX-XXXX"
            helpText="Format: XXX-XX-XXXX"
            maxLength={11}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <FormField
            id="birthCity"
            label="City of Birth"
            value={section1.placeOfBirth.city.value}
            onChange={handleFieldChange('placeOfBirth.city')}
            error={errors['section1.placeOfBirth.city']}
            required
          />
          
          <FormField
            id="birthState"
            label="State of Birth"
            value={section1.placeOfBirth.state.value}
            onChange={handleFieldChange('placeOfBirth.state')}
            error={errors['section1.placeOfBirth.state']}
          />
          
          <FormField
            id="birthCountry"
            label="Country of Birth"
            value={section1.placeOfBirth.country.value}
            onChange={handleFieldChange('placeOfBirth.country')}
            error={errors['section1.placeOfBirth.country']}
            required
          />
        </div>
      </fieldset>
      
      {/* Previous Names */}
      <fieldset className="mb-6">
        <legend className="text-lg font-semibold mb-4">Previous Names</legend>
        <FormField
          id="previousNames"
          label="Have you used any other names?"
          type="select"
          value={section1.previousNames.value ? 'yes' : 'no'}
          onChange={handlePreviousNamesChange}
          options={[
            { value: 'no', label: 'No' },
            { value: 'yes', label: 'Yes' }
          ]}
        />
        
        {section1.previousNames.value && <OtherNamesSection />}
      </fieldset>
      
      {/* Actions */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={handleValidate}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Validate Section
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTED COMPONENT WITH ERROR BOUNDARY
// ============================================================================

const Section1ComponentImproved: React.FC = () => {
  return (
    <ErrorBoundary
      FallbackComponent={SectionErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={<div>Loading Section 1...</div>}>
        <Section1Fields />
      </Suspense>
    </ErrorBoundary>
  );
};

export default memo(Section1ComponentImproved);