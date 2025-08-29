/**
 * SSN Field Plugin
 * 
 * Specialized plugin for Social Security Number fields with formatting and validation
 */

import React, { useCallback, useMemo } from 'react';
import type { FieldPlugin, FieldPluginProps } from '../field-plugin.types';

const SSNFieldComponent: React.FC<FieldPluginProps<string>> = ({
  value,
  onChange,
  error,
  warning,
  disabled,
  readonly,
  field,
  context
}) => {
  // Format SSN for display
  const formattedValue = useMemo(() => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  }, [value]);
  
  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '');
    
    // Limit to 9 digits
    if (digits.length <= 9) {
      onChange(digits);
    }
  }, [onChange]);
  
  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const digits = pasted.replace(/\D/g, '').slice(0, 9);
    onChange(digits);
  }, [onChange]);
  
  return (
    <div className="ssn-field-plugin">
      <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
        {field.label || 'Social Security Number'}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={field.id}
        type="text"
        value={formattedValue}
        onChange={handleChange}
        onPaste={handlePaste}
        disabled={disabled}
        readOnly={readonly}
        placeholder="XXX-XX-XXXX"
        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
          error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        } ${disabled || readonly ? 'bg-gray-100' : ''}`}
        maxLength={11}
        autoComplete="off"
        inputMode="numeric"
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {warning && !error && (
        <p className="mt-1 text-sm text-yellow-600">{warning}</p>
      )}
    </div>
  );
};

export const SSNFieldPlugin: FieldPlugin<string> = {
  id: 'ssn-field-plugin',
  name: 'SSN Field Plugin',
  version: '1.0.0',
  description: 'Specialized field for Social Security Numbers with formatting and validation',
  author: 'SF86 Team',
  
  supportedTypes: ['ssn', 'PDFTextField'],
  priority: 10,
  
  component: SSNFieldComponent,
  
  canHandle: (field, context) => {
    return field.type === 'ssn' || 
           (field.type === 'PDFTextField' && 
            (field.name?.toLowerCase().includes('ssn') || 
             field.name?.toLowerCase().includes('social')));
  },
  
  validator: async (value, context) => {
    if (!value && context.services.storage.get(`${context.fieldPath}.required`)) {
      return {
        isValid: false,
        error: 'Social Security Number is required'
      };
    }
    
    if (value) {
      const digits = value.replace(/\D/g, '');
      
      if (digits.length !== 9) {
        return {
          isValid: false,
          error: 'SSN must be exactly 9 digits'
        };
      }
      
      // Check for invalid SSN patterns
      const invalidPrefixes = ['000', '666', '900', '999'];
      const prefix = digits.substring(0, 3);
      
      if (invalidPrefixes.includes(prefix)) {
        return {
          isValid: false,
          error: 'Invalid SSN format'
        };
      }
      
      // Check for all zeros in any segment
      if (digits.substring(0, 3) === '000' || 
          digits.substring(3, 5) === '00' || 
          digits.substring(5, 9) === '0000') {
        return {
          isValid: false,
          error: 'Invalid SSN format'
        };
      }
      
      // Check for sequential patterns
      if (digits === '123456789' || digits === '987654321') {
        return {
          isValid: false,
          warning: 'SSN appears to be a test value'
        };
      }
    }
    
    return { isValid: true };
  },
  
  transformer: {
    toForm: (value) => {
      if (typeof value === 'string') {
        return value.replace(/\D/g, '');
      }
      return '';
    },
    fromForm: (value) => {
      return value.replace(/\D/g, '');
    },
    toPDF: (value) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length === 9) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
      }
      return value;
    }
  }
};