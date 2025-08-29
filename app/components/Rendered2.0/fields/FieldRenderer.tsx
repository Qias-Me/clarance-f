/**
 * Enhanced Field Renderer Component
 * Provides consistent field rendering across all sections with full field config support
 */

import React, { memo, useId } from 'react';
import type { FieldConfig } from '../../../config/field-configs';

interface FieldRendererProps {
  config: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  warning?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
}

export const FieldRenderer: React.FC<FieldRendererProps> = memo(({
  config,
  value,
  onChange,
  error,
  warning,
  helpText,
  disabled = false,
  className = ''
}) => {
  const { id, label, type, required, placeholder } = config;
  const fieldId = useId();
  const actualId = id || fieldId;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const newValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    onChange(newValue);
  };

  const renderInput = () => {
    const baseProps = {
      id: actualId,
      value: type === 'checkbox' ? undefined : (value || ''),
      onChange: handleChange,
      required,
      disabled,
      'aria-describedby': error ? `${actualId}-error` : warning ? `${actualId}-warning` : helpText ? `${actualId}-help` : undefined,
      'aria-invalid': !!error,
      className: `w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
        error ? 'border-red-500' : warning ? 'border-yellow-400' : ''
      } ${className}`
    };

    switch (type) {
      case 'select':
        const selectConfig = config as any; // Access options from extended config
        return (
          <select {...baseProps} value={value || ''}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {selectConfig.options?.map((option: any) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        const textareaConfig = config as any;
        return (
          <textarea
            {...baseProps}
            placeholder={placeholder}
            rows={textareaConfig.rows || 4}
            cols={textareaConfig.cols}
            style={{ resize: textareaConfig.resize || 'vertical' }}
          />
        );

      case 'checkbox':
        const checkboxConfig = config as any;
        return (
          <input
            type="checkbox"
            id={actualId}
            checked={!!value}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
            aria-describedby={error ? `${actualId}-error` : warning ? `${actualId}-warning` : helpText ? `${actualId}-help` : undefined}
          />
        );

      default:
        const textConfig = config as any;
        return (
          <input
            {...baseProps}
            type={type}
            placeholder={placeholder}
            autoComplete={textConfig.autoComplete}
            spellCheck={textConfig.spellCheck}
            pattern={textConfig.pattern || config.pattern}
            maxLength={textConfig.maxLength || config.maxLength}
            min={type === 'date' && textConfig.min}
            max={type === 'date' && textConfig.max}
          />
        );
    }
  };

  // Handle conditional rendering based on dependencies
  const shouldShow = () => {
    const conditionalConfig = (config as any).conditional;
    if (!conditionalConfig) return true;
    
    // This would need access to form data to evaluate conditions
    // For now, always show the field
    return true;
  };

  if (!shouldShow()) {
    return null;
  }

  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={actualId}
        className={`block text-sm font-medium text-gray-700 mb-2 ${
          type === 'checkbox' ? 'flex items-center' : ''
        } ${disabled ? 'text-gray-400' : ''}`}
      >
        {type === 'checkbox' && (
          <>
            {renderInput()}
            <span className="ml-2">
              {label} {required && <span className="text-red-500">*</span>}
            </span>
          </>
        )}
        {type !== 'checkbox' && (
          <>
            {label} {required && <span className="text-red-500">*</span>}
          </>
        )}
      </label>
      
      {type !== 'checkbox' && renderInput()}
      
      {(helpText || (config as any).helpText) && (
        <p id={`${actualId}-help`} className="mt-1 text-xs text-gray-500">
          {helpText || (config as any).helpText}
        </p>
      )}
      
      {error && (
        <p id={`${actualId}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {warning && !error && (
        <p id={`${actualId}-warning`} className="mt-1 text-sm text-yellow-600" role="alert">
          {warning}
        </p>
      )}
    </div>
  );
});

FieldRenderer.displayName = 'FieldRenderer';