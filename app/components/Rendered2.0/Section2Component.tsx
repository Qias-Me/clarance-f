/**
 * Section 2: Date of Birth - Component
 *
 * React component for SF-86 Section 2 using the new Form Architecture 2.0.
 * This component handles date of birth collection with automatic age calculation
 * and estimation checkbox functionality.
 */

import React, { useEffect, useState } from 'react';
import { useSection2 } from '~/state/contexts/sections2.0/section2';
import { useSF86Form } from '~/state/contexts/SF86FormContext';

interface Section2ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

const Section2Component: React.FC<Section2ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  const {
    section2Data,
    updateDateOfBirth,
    updateEstimated,
    validateSection,
    validateDateOfBirth,
    resetSection,
    getAge,
    isDirty,
    errors,
    isLoading
  } = useSection2();

  // Early return if data is not yet loaded or section2 is not available
  if (isLoading || !section2Data?.section2?.date || !section2Data?.section2?.isEstimated) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section2-loading">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Section 2...</p>
          </div>
        </div>
      </div>
    );
  }

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section2Data, validateSection, onValidationChange]);

  // Generate options for dropdowns
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      value: String(month).padStart(2, '0'),
      label: String(month).padStart(2, '0')
    };
  });

  const dayOptions = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return {
      value: String(day).padStart(2, '0'),
      label: String(day).padStart(2, '0')
    };
  });

  const systemCurrentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) => {
    const year = systemCurrentYear - 99 + i;
    return {
      value: String(year),
      label: String(year)
    };
  });

  // Getter functions for cleaner code - moved up to be available early
  const getDateValue = (): string => {
    return section2Data?.section2?.date?.value || '';
  };

  const getEstimatedValue = (): boolean => {
    return section2Data?.section2?.isEstimated?.value || false;
  };

  // Get date parts for display in dropdowns
  const getDateParts = (): { month: string, day: string, year: string } => {
    const dateValue = getDateValue();
    if (!dateValue) return { month: '', day: '', year: '' };

    try {
      // Handle MM/DD/YYYY format
      if (dateValue.includes('/')) {
        const [month, day, year] = dateValue.split('/');
        return { month, day, year };
      }

      // Handle YYYY-MM-DD format
      if (dateValue.includes('-')) {
        const [year, month, day] = dateValue.split('-');
        return { month, day, year };
      }

      // Fallback to date object
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return { month: '', day: '', year: '' };

      return {
        month: String(date.getMonth() + 1).padStart(2, '0'),
        day: String(date.getDate()).padStart(2, '0'),
        year: String(date.getFullYear())
      };
    } catch {
      return { month: '', day: '', year: '' };
    }
  };

  // Handle field changes - direct update pattern similar to Section1
  const handleDateFieldChange = (type: 'month' | 'day' | 'year', value: string) => {
    const { month, day, year } = getDateParts();

    // Create new date string with updated part
    let newMonth = month;
    let newDay = day;
    let newYear = year;

    if (type === 'month') newMonth = value;
    if (type === 'day') newDay = value;
    if (type === 'year') newYear = value;

    // Only update if we have all three values
    if (newMonth && newDay && newYear) {
      const newDate = `${newMonth}/${newDay}/${newYear}`;
      console.log('🔧 Section2Component: Updating date:', { newDate });

      // Update section data directly
      updateDateOfBirth(newDate);
    }
  };

  // Handle estimated checkbox change
  const handleEstimatedChange = (isEstimated: boolean) => {
    console.log('🔧 Section2Component: Updating estimated flag:', { isEstimated });
    updateEstimated(isEstimated);
  };

  // Handle form submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    console.log('🔍 Section 2 validation result:', result);
    console.log('📊 Section 2 data before submission:', section2Data);

    if (result.isValid) {
      try {
        // Update the central form context with Section 2 data
        sf86Form.updateSectionData('section2', section2Data);

        // Save the form data to persistence layer
        await sf86Form.saveForm();

        console.log('✅ Section 2 data saved successfully');

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('❌ Failed to save Section 2 data:', error);
        // Show an error message to user
        alert('There was an error saving your date of birth information. Please try again.');
      }
    }
  };

  // Validate date format and constraints
  const validateDate = (dateString: string): { isValid: boolean; error?: string } => {
    if (!dateString) {
      return { isValid: false, error: 'Date of birth is required' };
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return { isValid: false, error: 'Invalid date format' };
      }

      const dateValidation = validateDateOfBirth();
      if (!dateValidation.isValid && dateValidation.errors.length > 0) {
        return { isValid: false, error: dateValidation.errors[0] };
      }

      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid date format' };
    }
  };

  // Extract parts from current date
  const { month: currentMonth, day: currentDay, year: currentYear } = getDateParts();

  // Validate the current date
  const dateValidation = validateDate(getDateValue());

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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date of Birth */}
        <div>
          <label
            htmlFor="dateOfBirth"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Date of Birth <span className="text-red-500">*</span>
          </label>

          {/* Date dropdowns */}
          <div className="grid grid-cols-3 gap-4">
            {/* Month dropdown */}
            <div>
              <label htmlFor="monthSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                id="monthSelect"
                value={currentMonth}
                onChange={(e) => handleDateFieldChange('month', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Month</option>
                {monthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Day dropdown */}
            <div>
              <label htmlFor="daySelect" className="block text-sm font-medium text-gray-700 mb-1">
                Day
              </label>
              <select
                id="daySelect"
                value={currentDay}
                onChange={(e) => handleDateFieldChange('day', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Day</option>
                {dayOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year dropdown */}
            <div>
              <label htmlFor="yearSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                id="yearSelect"
                value={currentYear}
                onChange={(e) => handleDateFieldChange('year', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Year</option>
                {yearOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hidden original date input for compatibility */}
          <input
            type="hidden"
            id="dateOfBirth"
            data-testid="date-of-birth-field"
            value={getDateValue()}
          />

          {!dateValidation.isValid && getDateValue() && (
            <p className="mt-1 text-sm text-red-600" data-testid="date-format-error">
              {dateValidation.error}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Select your date of birth using the dropdowns above.
          </p>
        </div>

        {/* Estimated Checkbox */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="estimated"
              type="checkbox"
              data-testid="estimated-checkbox"
              checked={getEstimatedValue()}
              onChange={(e) => handleEstimatedChange(e.target.checked)}
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
            value={getAge() || ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600"
            placeholder="Age will be calculated automatically"
          />
          <p className="mt-1 text-xs text-gray-500">
            Your age is calculated automatically based on your date of birth.
          </p>
        </div>

        {/* Age Display */}
        {getDateValue() && (
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
                  Based on your date of birth ({getDateValue()}), you are currently {getAge() || 0} years old.
                  {getEstimatedValue() && (
                    <span className="font-medium"> (Estimated)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <span className="text-red-500">*</span> Required fields
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              data-testid="submit-section-button"
            >
              Submit & Continue
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
            Section Status: <span className={`font-medium ${isDirty ? 'text-orange-500' : 'text-green-500'}`}>
              {isDirty ? 'Modified, needs validation' : 'Ready for input'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Validation: <span className={`font-medium ${isValid ? 'text-green-500' : 'text-red-500'}`}>
              {isValid ? 'Valid' : 'Has errors'}
            </span>
          </div>
        </div>
      </form>

      {/* Debug Information (Development Only) */}
      {typeof window !== 'undefined' && window.location.search.includes('debug=true') && (
        <details className="mt-6 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Section 2 Data:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(section2Data, null, 2)}
            </pre>
            <h4 className="text-xs font-medium text-gray-600 mt-4 mb-2">Validation Errors:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(errors, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};

export default Section2Component;
