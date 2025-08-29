import { useMemo } from 'react';
import sectionFieldsConfig from '../config/section-fields.json';

export interface FieldConfig {
  name: string;
  type: 'text' | 'email' | 'date' | 'select' | 'checkbox' | 'textarea' | 'location' | 'repeating';
  label: string;
  required?: boolean;
  maxLength?: number;
  options?: Array<{ value: string; label: string }>;
  validation?: string[];
  conditionalFields?: Record<string, FieldConfig[]>;
  fields?: FieldConfig[]; // For complex types like location, repeating
  placeholder?: string;
  helpText?: string;
}

export interface SectionConfig {
  title: string;
  fields: FieldConfig[];
}

/**
 * Hook to get field configuration for a section
 */
export function useSectionConfig(sectionNumber: number): SectionConfig | null {
  return useMemo(() => {
    const sectionKey = `section${sectionNumber}`;
    const config = (sectionFieldsConfig as Record<string, SectionConfig>)[sectionKey];
    return config || null;
  }, [sectionNumber]);
}

/**
 * Hook to get all available sections
 */
export function useAvailableSections(): Array<{ number: number; title: string }> {
  return useMemo(() => {
    return Object.entries(sectionFieldsConfig as Record<string, SectionConfig>)
      .map(([key, config]) => ({
        number: parseInt(key.replace('section', '')),
        title: config.title
      }))
      .sort((a, b) => a.number - b.number);
  }, []);
}

/**
 * Generate default data structure from field config
 */
export function generateDefaultData(fields: FieldConfig[]): Record<string, any> {
  const defaultData: Record<string, any> = {};
  
  fields.forEach(field => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'textarea':
        defaultData[field.name] = '';
        break;
      case 'date':
        defaultData[field.name] = null;
        break;
      case 'select':
        defaultData[field.name] = field.required ? field.options?.[0]?.value || '' : '';
        break;
      case 'checkbox':
        defaultData[field.name] = false;
        break;
      case 'location':
        defaultData[field.name] = field.fields ? 
          generateDefaultData(field.fields) : 
          { city: '', state: '', country: 'US' };
        break;
      case 'repeating':
        defaultData[field.name] = [];
        break;
      default:
        defaultData[field.name] = '';
    }
  });
  
  return defaultData;
}

/**
 * Generate validation rules from field config
 */
export function generateValidationRules(fields: FieldConfig[]) {
  return (data: Record<string, any>) => {
    const errors: Array<{ field: string; message: string; severity: 'error' | 'warning' }> = [];
    
    fields.forEach(field => {
      const value = data[field.name];
      
      if (field.validation) {
        field.validation.forEach(rule => {
          let error = null;
          
          switch (rule) {
            case 'required':
              if (!value || (Array.isArray(value) && value.length === 0)) {
                error = {
                  field: field.name,
                  message: `${field.label} is required`,
                  severity: 'error' as const
                };
              }
              break;
            case 'maxLength':
              if (value && typeof value === 'string' && field.maxLength && value.length > field.maxLength) {
                error = {
                  field: field.name,
                  message: `${field.label} must be ${field.maxLength} characters or less`,
                  severity: 'error' as const
                };
              }
              break;
            case 'email':
              if (value && typeof value === 'string') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                  error = {
                    field: field.name,
                    message: `${field.label} must be a valid email address`,
                    severity: 'error' as const
                  };
                }
              }
              break;
            case 'date':
              if (value && isNaN(Date.parse(value))) {
                error = {
                  field: field.name,
                  message: `${field.label} must be a valid date`,
                  severity: 'error' as const
                };
              }
              break;
            case 'pastDate':
              if (value) {
                const inputDate = new Date(value);
                const today = new Date();
                if (inputDate >= today) {
                  error = {
                    field: field.name,
                    message: `${field.label} must be in the past`,
                    severity: 'error' as const
                  };
                }
              }
              break;
          }
          
          if (error) errors.push(error);
        });
      }
    });
    
    return errors;
  };
}