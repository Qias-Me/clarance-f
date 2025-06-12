/**
 * Section 6: Physical Characteristics - Component
 *
 * React component for SF-86 Section 6 using the new Form Architecture 2.0.
 * This component handles collection of physical identifying information including
 * height, weight, hair color, eye color, and sex.
 */

import React, { useEffect, useState } from 'react';
import { useSection6 } from '~/state/contexts/sections2.0/section6';
import { useSF86Form } from '~/state/contexts/sections2.0/SF86FormContext';
import {
  HAIR_COLOR_OPTIONS,
  EYE_COLOR_OPTIONS,
  HEIGHT_FEET_OPTIONS,
  HEIGHT_INCHES_OPTIONS,
  type HairColor,
  type EyeColor,
  type HeightFeet,
  type HeightInches,
  type Sex
} from '../../../api/interfaces/sections2.0/section6';

interface Section6ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section6Component: React.FC<Section6ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  const {
    section6Data,
    updateHeight,
    updateWeight,
    updateHairColor,
    updateEyeColor,
    updateSex,
    validateSection,
    resetSection,
    getTotalHeightInches,
    getFormattedHeight,
    isDirty,
    errors
  } = useSection6();

  // SF86Form context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section6Data]);

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    // console.log('🔍 Section 6 validation result:', result);
    // console.log('📊 Section 6 data before submission:', section6Data);

    if (result.isValid) {
      try {
        // console.log('🔄 Section 6: Starting data synchronization...');

        // Update the central form context with Section 6 data and wait for synchronization
        sf86Form.updateSectionData('section6', section6Data);

        // console.log('✅ Section 6: Data synchronization complete, proceeding to save...');

        // Save the form data to persistence layer
        await sf86Form.saveForm();

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section6');

        // console.log('✅ Section 6 data saved successfully:', section6Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        // console.error('❌ Failed to save Section 6 data:', error);
        // Show an error message to user
        // console.log('There was an error saving your information. Please try again.');
      }
    }
  };


  // Get current values
  const getHeightFeet = (): HeightFeet => section6Data.section6.heightFeet.value as HeightFeet || '';
  const getHeightInches = (): HeightInches => section6Data.section6.heightInches.value as HeightInches || '';
  const getWeight = (): string => section6Data.section6.weight.value || '';
  const getHairColor = (): HairColor => section6Data.section6.hairColor.value|| '';
  const getEyeColor = (): EyeColor => section6Data.section6.eyeColor.value|| '';
  const getSex = (): Sex => section6Data.section6.sex.value|| '';

  // Validation helpers
  const validateWeight = (weight: string): { isValid: boolean; error?: string } => {
    if (!weight) {
      return { isValid: false, error: 'Weight is required' };
    }

    const weightNum = parseInt(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      return { isValid: false, error: 'Weight must be a positive number' };
    }

    if (weightNum < 50 || weightNum > 1000) {
      return { isValid: false, error: 'Weight must be between 50 and 1000 pounds' };
    }

    return { isValid: true };
  };

  const weightValidation = validateWeight(getWeight());

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section6-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 6: Physical Characteristics
        </h2>
        <p className="text-gray-600">
          Provide your physical identifying information. All fields are required for identification purposes.
        </p>
      </div>

      {/* Physical Characteristics Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Height Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="heightFeet"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Height (Feet) <span className="text-red-500">*</span>
            </label>
            <select
              id="heightFeet"
              data-testid="height-feet-select"
              value={getHeightFeet()}
              onChange={(e) => updateHeight(e.target.value as HeightFeet, getHeightInches())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {HEIGHT_FEET_OPTIONS.map((feet) => (
                <option key={feet} value={feet}>
                  {feet}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="heightInches"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Height (Inches) <span className="text-red-500">*</span>
            </label>
            <select
              id="heightInches"
              data-testid="height-inches-select"
              value={getHeightInches()}
              onChange={(e) => updateHeight(getHeightFeet(), e.target.value as HeightInches)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {HEIGHT_INCHES_OPTIONS.map((inches) => (
                <option key={inches} value={inches}>
                  {inches}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Height Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Total Height
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                Your height is {getFormattedHeight()} ({getTotalHeightInches()} inches total)
              </div>
            </div>
          </div>
        </div>

        {/* Weight */}
        <div>
          <label
            htmlFor="weight"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Weight (in pounds) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="weight"
            data-testid="weight-field"
            value={getWeight()}
            onChange={(e) => updateWeight(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              !weightValidation.isValid && getWeight()
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="Enter weight in pounds"
            min="50"
            max="1000"
            required
          />
          {!weightValidation.isValid && getWeight() && (
            <p className="mt-1 text-sm text-red-600" data-testid="weight-error">
              {weightValidation.error}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter your weight in pounds (50-1000 lbs).
          </p>
        </div>

        {/* Hair Color */}
        <div>
          <label
            htmlFor="hairColor"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Hair Color <span className="text-red-500">*</span>
          </label>
          <select
            id="hairColor"
            data-testid="hair-color-select"
            value={getHairColor()}
            onChange={(e) => updateHairColor(e.target.value as HairColor)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select hair color</option>
            {HAIR_COLOR_OPTIONS.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Eye Color */}
        <div>
          <label
            htmlFor="eyeColor"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Eye Color <span className="text-red-500">*</span>
          </label>
          <select
            id="eyeColor"
            data-testid="eye-color-select"
            value={getEyeColor()}
            onChange={(e) => updateEyeColor(e.target.value as EyeColor)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select eye color</option>
            {EYE_COLOR_OPTIONS.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Sex */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sex <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-6">
            <div className="flex items-center">
              <input
                id="sex-male"
                type="radio"
                name="sex"
                value="Male"
                checked={getSex() === 'Male'}
                onChange={(e) => updateSex(e.target.value as Sex)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                data-testid="sex-male-radio"
              />
              <label htmlFor="sex-male" className="ml-2 text-sm font-medium text-gray-700">
                Male
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="sex-female"
                type="radio"
                name="sex"
                value="Female"
                checked={getSex() === 'Female'}
                onChange={(e) => updateSex(e.target.value as Sex)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                data-testid="sex-female-radio"
              />
              <label htmlFor="sex-female" className="ml-2 text-sm font-medium text-gray-700">
                Female
              </label>
            </div>
          </div>
        </div>

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
     
      </form>

      {/* Debug Information (Development Only) */}
      {typeof window !== 'undefined' && window.location.search.includes('debug=true') && (
        <details className="mt-6 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Section 6 Data:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(section6Data, null, 2)}
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

export default Section6Component;
