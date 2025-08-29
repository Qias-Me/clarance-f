/**
 * Base Section Interfaces
 * 
 * Core type definitions for SF-86 sections
 */

export interface Field<T = string> {
  id: string;
  value: T;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file' | 'ssn' | 'currency';
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  validation?: (value: T) => boolean;
  error?: string;
  warning?: string;
  helpText?: string;
  maxLength?: number;
  minLength?: number;
  min?: number | string;
  max?: number | string;
  pattern?: string;
  dependsOn?: string[];
  visible?: boolean;
}

export interface Section {
  sectionNumber: number;
  sectionName: string;
  fields: Field[];
  subsections?: Record<string, Field[]>;
  isComplete?: boolean;
  isValid?: boolean;
  lastModified?: Date;
}

export interface SectionData {
  [key: string]: any;
}

export interface SectionState<T = SectionData> {
  data: T;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  isDirty: boolean;
  isLoading: boolean;
  isValid: boolean;
  lastSaved?: Date;
}

export interface SectionContext<T = SectionData> {
  state: SectionState<T>;
  updateField: (field: string, value: any) => void;
  updateFields: (fields: Partial<T>) => void;
  validate: () => boolean;
  save: () => Promise<void>;
  load: () => Promise<void>;
  reset: () => void;
  getFieldError: (field: string) => string | undefined;
  getFieldWarning: (field: string) => string | undefined;
  isFieldValid: (field: string) => boolean;
}