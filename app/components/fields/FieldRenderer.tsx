/**
 * Field Renderer Component
 * 
 * Generic field rendering system for SF-86 form sections
 */

import React, { memo, useCallback, useMemo } from 'react';
import type { ValidationResult } from '../../types/validation.types';

export interface FieldConfig<T = any> {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file' | 'ssn' | 'currency';
  value: T;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  validation?: (value: T) => ValidationResult;
  onChange: (value: T) => void;
  error?: string;
  warning?: string;
  helpText?: string;
  maxLength?: number;
  minLength?: number;
  min?: number | string;
  max?: number | string;
  step?: number;
  pattern?: string;
  accept?: string;
  multiple?: boolean;
  rows?: number;
  cols?: number;
  autoComplete?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  dependsOn?: string[];
  visible?: boolean;
  transform?: (value: string) => T;
  format?: (value: T) => string;
}

interface FieldRendererProps<T = any> {
  field: FieldConfig<T>;
  showLabel?: boolean;
  inline?: boolean;
  compact?: boolean;
}

/**
 * Format SSN with dashes
 */
function formatSSN(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
}

/**
 * Format currency
 */
function formatCurrency(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) return value;
  
  const dollars = parts[0] || '0';
  const cents = parts[1] ? `.${parts[1].slice(0, 2)}` : '';
  
  const formattedDollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `$${formattedDollars}${cents}`;
}

/**
 * Format phone number
 */
function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
}

/**
 * Base field renderer
 */
export const FieldRenderer = memo(<T extends any>({
  field,
  showLabel = true,
  inline = false,
  compact = false
}: FieldRendererProps<T>) => {
  const {
    id,
    name,
    label,
    type,
    value,
    required,
    placeholder,
    disabled,
    readOnly,
    error,
    warning,
    helpText,
    onChange,
    className,
    inputClassName,
    labelClassName,
    errorClassName,
    visible = true
  } = field;
  
  const fieldId = useMemo(() => id || name, [id, name]);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let newValue: any = e.target.value;
    
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      newValue = e.target.value ? Number(e.target.value) : '';
    } else if (type === 'file') {
      newValue = (e.target as HTMLInputElement).files;
    }
    
    if (field.transform) {
      newValue = field.transform(newValue);
    }
    
    onChange(newValue);
  }, [type, onChange, field.transform]);
  
  const formattedValue = useMemo(() => {
    if (field.format) {
      return field.format(value);
    }
    
    if (type === 'ssn' && typeof value === 'string') {
      return formatSSN(value);
    }
    
    if (type === 'currency' && typeof value === 'string') {
      return formatCurrency(value);
    }
    
    if (type === 'tel' && typeof value === 'string') {
      return formatPhoneNumber(value);
    }
    
    return value as string;
  }, [type, value, field.format]);
  
  if (!visible) {
    return null;
  }
  
  const containerClass = [
    'field-container',
    inline && 'field-inline',
    compact && 'field-compact',
    error && 'field-has-error',
    warning && 'field-has-warning',
    disabled && 'field-disabled',
    className
  ].filter(Boolean).join(' ');
  
  const inputClass = [
    'field-input',
    inputClassName
  ].filter(Boolean).join(' ');
  
  const labelClass = [
    'field-label',
    required && 'field-required',
    labelClassName
  ].filter(Boolean).join(' ');
  
  const renderInput = () => {
    const baseProps = {
      id: fieldId,
      name: name || fieldId,
      disabled,
      readOnly,
      required,
      'aria-invalid': !!error,
      'aria-describedby': [
        error && `${fieldId}-error`,
        warning && `${fieldId}-warning`,
        helpText && `${fieldId}-help`
      ].filter(Boolean).join(' ') || undefined,
      className: inputClass
    };
    
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            value={formattedValue}
            onChange={handleChange}
            placeholder={placeholder}
            maxLength={field.maxLength}
            minLength={field.minLength}
            rows={field.rows || 4}
            cols={field.cols}
          />
        );
        
      case 'select':
        return (
          <select
            {...baseProps}
            value={value as string}
            onChange={handleChange}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {field.options?.map(option => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'radio':
        return (
          <div className="field-radio-group" role="radiogroup" aria-labelledby={`${fieldId}-label`}>
            {field.options?.map(option => (
              <label key={option.value} className="field-radio-label">
                <input
                  type="radio"
                  name={name || fieldId}
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                  disabled={disabled || option.disabled}
                  required={required}
                  className="field-radio-input"
                />
                <span className="field-radio-text">{option.label}</span>
              </label>
            ))}
          </div>
        );
        
      case 'checkbox':
        return (
          <label className="field-checkbox-label">
            <input
              {...baseProps}
              type="checkbox"
              checked={!!value}
              onChange={handleChange}
              className="field-checkbox-input"
            />
            <span className="field-checkbox-text">
              {placeholder || label}
            </span>
          </label>
        );
        
      case 'file':
        return (
          <input
            {...baseProps}
            type="file"
            onChange={handleChange}
            accept={field.accept}
            multiple={field.multiple}
          />
        );
        
      case 'ssn':
        return (
          <input
            {...baseProps}
            type="text"
            value={formattedValue}
            onChange={handleChange}
            placeholder={placeholder || '###-##-####'}
            maxLength={11}
            pattern="\d{3}-\d{2}-\d{4}"
            autoComplete="off"
          />
        );
        
      case 'currency':
        return (
          <input
            {...baseProps}
            type="text"
            value={formattedValue}
            onChange={handleChange}
            placeholder={placeholder || '$0.00'}
            pattern="^\$[\d,]+(\.\d{2})?$"
          />
        );
        
      default:
        return (
          <input
            {...baseProps}
            type={type}
            value={formattedValue}
            onChange={handleChange}
            placeholder={placeholder}
            maxLength={field.maxLength}
            minLength={field.minLength}
            min={field.min}
            max={field.max}
            step={field.step}
            pattern={field.pattern}
            autoComplete={field.autoComplete}
          />
        );
    }
  };
  
  return (
    <div className={containerClass}>
      {showLabel && type !== 'checkbox' && (
        <label
          id={`${fieldId}-label`}
          htmlFor={fieldId}
          className={labelClass}
        >
          {label}
          {required && <span className="field-required-indicator" aria-label="required">*</span>}
        </label>
      )}
      
      {renderInput()}
      
      {helpText && (
        <div id={`${fieldId}-help`} className="field-help">
          {helpText}
        </div>
      )}
      
      {error && (
        <div
          id={`${fieldId}-error`}
          className={errorClassName || 'field-error'}
          role="alert"
        >
          {error}
        </div>
      )}
      
      {warning && !error && (
        <div
          id={`${fieldId}-warning`}
          className="field-warning"
          role="status"
        >
          {warning}
        </div>
      )}
    </div>
  );
});

FieldRenderer.displayName = 'FieldRenderer';

/**
 * Field group renderer for related fields
 */
export interface FieldGroupProps {
  title?: string;
  description?: string;
  fields: FieldConfig[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const FieldGroup = memo(({
  title,
  description,
  fields,
  columns = 1,
  className
}: FieldGroupProps) => {
  const groupClass = [
    'field-group',
    `field-group-cols-${columns}`,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <fieldset className={groupClass}>
      {title && <legend className="field-group-title">{title}</legend>}
      {description && <p className="field-group-description">{description}</p>}
      
      <div className="field-group-fields">
        {fields.map(field => (
          <FieldRenderer key={field.id} field={field} />
        ))}
      </div>
    </fieldset>
  );
});

FieldGroup.displayName = 'FieldGroup';

/**
 * Dynamic field renderer that can handle conditional fields
 */
export interface DynamicFieldProps {
  fields: FieldConfig[];
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  errors?: Record<string, string>;
  warnings?: Record<string, string>;
}

export const DynamicFieldRenderer = memo(({
  fields,
  values,
  onChange,
  errors = {},
  warnings = {}
}: DynamicFieldProps) => {
  const visibleFields = useMemo(() => {
    return fields.filter(field => {
      if (!field.dependsOn || field.dependsOn.length === 0) {
        return field.visible !== false;
      }
      
      return field.dependsOn.every(depId => {
        const depValue = values[depId];
        return depValue !== undefined && depValue !== null && depValue !== '';
      });
    });
  }, [fields, values]);
  
  return (
    <>
      {visibleFields.map(field => (
        <FieldRenderer
          key={field.id}
          field={{
            ...field,
            value: values[field.id],
            error: errors[field.id],
            warning: warnings[field.id],
            onChange: (value) => onChange(field.id, value)
          }}
        />
      ))}
    </>
  );
});

DynamicFieldRenderer.displayName = 'DynamicFieldRenderer';