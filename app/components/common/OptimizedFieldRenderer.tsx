import React, { memo, useCallback, useMemo } from 'react';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: (value: any) => string | null;
  className?: string;
  disabled?: boolean;
}

interface OptimizedFieldRendererProps {
  field: FieldConfig;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string | null;
  touched?: boolean;
  onBlur?: (name: string) => void;
}

const OptimizedFieldRenderer = memo(({
  field,
  value,
  onChange,
  error,
  touched,
  onBlur
}: OptimizedFieldRendererProps) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const newValue = field.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    onChange(field.name, newValue);
  }, [field.name, field.type, onChange]);

  const handleBlur = useCallback(() => {
    onBlur?.(field.name);
  }, [field.name, onBlur]);

  const fieldClassName = useMemo(() => {
    const baseClass = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
    const errorClass = error && touched ? "border-red-500" : "border-gray-300";
    return `${baseClass} ${errorClass} ${field.className || ''}`.trim();
  }, [error, touched, field.className]);

  const renderField = useMemo(() => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
        return (
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled}
            className={fieldClassName}
            aria-invalid={!!(error && touched)}
            aria-describedby={error && touched ? `${field.name}-error` : undefined}
          />
        );

      case 'select':
        return (
          <select
            id={field.name}
            name={field.name}
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            required={field.required}
            disabled={field.disabled}
            className={fieldClassName}
            aria-invalid={!!(error && touched)}
            aria-describedby={error && touched ? `${field.name}-error` : undefined}
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={!!value}
              onChange={handleChange}
              onBlur={handleBlur}
              required={field.required}
              disabled={field.disabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              aria-invalid={!!(error && touched)}
              aria-describedby={error && touched ? `${field.name}-error` : undefined}
            />
            <label htmlFor={field.name} className="ml-2 text-sm text-gray-700">
              {field.label}
            </label>
          </div>
        );

      case 'textarea':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled}
            rows={4}
            className={fieldClassName}
            aria-invalid={!!(error && touched)}
            aria-describedby={error && touched ? `${field.name}-error` : undefined}
          />
        );

      default:
        return null;
    }
  }, [field, value, handleChange, handleBlur, fieldClassName, error, touched]);

  if (field.type === 'checkbox') {
    return (
      <div className="mb-4">
        {renderField}
        {error && touched && (
          <p id={`${field.name}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField}
      {error && touched && (
        <p id={`${field.name}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

OptimizedFieldRenderer.displayName = 'OptimizedFieldRenderer';

export default OptimizedFieldRenderer;