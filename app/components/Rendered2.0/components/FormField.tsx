/**
 * Reusable Form Field Component
 * Provides consistent field rendering with validation
 */

import React from 'react';
import { FieldConfig } from '../hooks/useValidatedField';

interface FormFieldProps extends FieldConfig {
  value: string;
  error?: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur?: () => void;
  options?: Array<{ value: string; label: string }>;
  fieldMappingInfo?: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  required = false,
  type = 'text',
  placeholder,
  helpText,
  value,
  error,
  onChange,
  onBlur,
  options,
  fieldMappingInfo,
  className = ''
}) => {
  const fieldId = name;
  const testId = `${name}-field`;

  return (
    <div className={className}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label} {required && <span className="text-red-500">*</span>}
        {fieldMappingInfo}
      </label>

      {type === 'select' && options ? (
        <select
          id={fieldId}
          data-testid={testId}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required={required}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={fieldId}
          data-testid={testId}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
          required={required}
        />
      )}

      {helpText && (
        <p className="mt-1 text-xs text-gray-500">
          {helpText}
        </p>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

/**
 * Form field group for organizing related fields
 */
export const FormFieldGroup: React.FC<{
  title?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};