/**
 * Base Section Component
 * 
 * Abstract component providing common functionality for all SF-86 sections
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ValidationResult } from '../../types/validation.types';
import { logger } from '../../services/Logger';

export interface BaseSectionProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
  sectionNumber: number;
  sectionTitle: string;
}

export interface SectionField<T = string> {
  id: string;
  value: T;
  label: string;
  type: 'text' | 'date' | 'select' | 'radio' | 'checkbox' | 'textarea';
  required: boolean;
  validation?: (value: T) => ValidationResult;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  visible?: boolean;
  dependsOn?: string[];
}

export interface SectionState<T> {
  data: T;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  isDirty: boolean;
  isLoading: boolean;
  isValid: boolean;
  lastSaved?: Date;
}

export abstract class BaseSection<T> extends React.Component<
  BaseSectionProps,
  SectionState<T>
> {
  protected validationTimeoutRef: NodeJS.Timeout | null = null;
  protected saveTimeoutRef: NodeJS.Timeout | null = null;
  
  constructor(props: BaseSectionProps) {
    super(props);
    
    this.state = {
      data: this.getInitialData(),
      errors: {},
      warnings: {},
      isDirty: false,
      isLoading: false,
      isValid: true
    };
  }
  
  /**
   * Get initial data for the section
   */
  protected abstract getInitialData(): T;
  
  /**
   * Get fields configuration for the section
   */
  protected abstract getFields(): SectionField[];
  
  /**
   * Validate section data
   */
  protected abstract validateSection(data: T): ValidationResult;
  
  /**
   * Save section data
   */
  protected abstract saveSection(data: T): Promise<void>;
  
  /**
   * Load section data
   */
  protected abstract loadSection(): Promise<T>;
  
  componentDidMount() {
    this.loadData();
  }
  
  componentWillUnmount() {
    if (this.validationTimeoutRef) {
      clearTimeout(this.validationTimeoutRef);
    }
    if (this.saveTimeoutRef) {
      clearTimeout(this.saveTimeoutRef);
    }
  }
  
  componentDidUpdate(prevProps: BaseSectionProps, prevState: SectionState<T>) {
    if (prevState.isValid !== this.state.isValid && this.props.onValidationChange) {
      this.props.onValidationChange(this.state.isValid);
    }
    
    if (prevState.data !== this.state.data) {
      this.debouncedValidation();
      if (this.state.isDirty) {
        this.debouncedSave();
      }
    }
  }
  
  private loadData = async () => {
    this.setState({ isLoading: true });
    
    try {
      const data = await this.loadSection();
      this.setState({
        data,
        isLoading: false,
        isDirty: false
      });
    } catch (error) {
      logger.error(`Failed to load section ${this.props.sectionNumber}`, error as Error, 'BaseSection');
      this.setState({ isLoading: false });
    }
  };
  
  private debouncedValidation = () => {
    if (this.validationTimeoutRef) {
      clearTimeout(this.validationTimeoutRef);
    }
    
    this.validationTimeoutRef = setTimeout(() => {
      this.validateData();
    }, 300);
  };
  
  private debouncedSave = () => {
    if (this.saveTimeoutRef) {
      clearTimeout(this.saveTimeoutRef);
    }
    
    this.saveTimeoutRef = setTimeout(() => {
      this.save();
    }, 1000);
  };
  
  protected validateData = () => {
    const result = this.validateSection(this.state.data);
    
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    
    result.errors?.forEach(error => {
      if (error.field) {
        errors[error.field] = error.message;
      }
    });
    
    result.warnings?.forEach(warning => {
      if (warning.field) {
        warnings[warning.field] = warning.message;
      }
    });
    
    this.setState({
      errors,
      warnings,
      isValid: result.isValid
    });
    
    return result;
  };
  
  protected save = async () => {
    if (!this.state.isDirty) return;
    
    try {
      await this.saveSection(this.state.data);
      this.setState({
        isDirty: false,
        lastSaved: new Date()
      });
      
      logger.info(`Section ${this.props.sectionNumber} saved`, 'BaseSection');
    } catch (error) {
      logger.error(`Failed to save section ${this.props.sectionNumber}`, error as Error, 'BaseSection');
    }
  };
  
  protected handleFieldChange = <K extends keyof T>(field: K, value: T[K]) => {
    this.setState(prevState => ({
      data: {
        ...prevState.data,
        [field]: value
      },
      isDirty: true
    }));
  };
  
  protected handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationResult = this.validateData();
    
    if (!validationResult.isValid) {
      logger.warn(`Section ${this.props.sectionNumber} validation failed`, 'BaseSection', {
        errors: validationResult.errors
      });
      return;
    }
    
    await this.save();
    
    if (this.props.onNext) {
      this.props.onNext();
    }
  };
  
  protected renderField = (field: SectionField): React.ReactNode => {
    const error = this.state.errors[field.id];
    const warning = this.state.warnings[field.id];
    
    const baseProps = {
      id: field.id,
      name: field.id,
      required: field.required,
      disabled: field.disabled || this.state.isLoading,
      'aria-invalid': !!error,
      'aria-describedby': error ? `${field.id}-error` : undefined
    };
    
    return (
      <div key={field.id} className="form-field">
        <label htmlFor={field.id} className="form-label">
          {field.label}
          {field.required && <span className="required">*</span>}
        </label>
        
        {this.renderFieldInput(field, baseProps)}
        
        {error && (
          <div id={`${field.id}-error`} className="field-error" role="alert">
            {error}
          </div>
        )}
        
        {warning && !error && (
          <div className="field-warning" role="status">
            {warning}
          </div>
        )}
      </div>
    );
  };
  
  private renderFieldInput = (field: SectionField, baseProps: any): React.ReactNode => {
    switch (field.type) {
      case 'text':
      case 'date':
        return (
          <input
            {...baseProps}
            type={field.type}
            value={field.value as string}
            placeholder={field.placeholder}
            onChange={(e) => this.handleFieldChange(field.id as keyof T, e.target.value as T[keyof T])}
            className="form-input"
          />
        );
        
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            value={field.value as string}
            placeholder={field.placeholder}
            onChange={(e) => this.handleFieldChange(field.id as keyof T, e.target.value as T[keyof T])}
            className="form-textarea"
            rows={4}
          />
        );
        
      case 'select':
        return (
          <select
            {...baseProps}
            value={field.value as string}
            onChange={(e) => this.handleFieldChange(field.id as keyof T, e.target.value as T[keyof T])}
            className="form-select"
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'radio':
        return (
          <div className="form-radio-group">
            {field.options?.map(option => (
              <label key={option.value} className="form-radio-label">
                <input
                  {...baseProps}
                  type="radio"
                  value={option.value}
                  checked={field.value === option.value}
                  onChange={(e) => this.handleFieldChange(field.id as keyof T, e.target.value as T[keyof T])}
                  className="form-radio"
                />
                {option.label}
              </label>
            ))}
          </div>
        );
        
      case 'checkbox':
        return (
          <label className="form-checkbox-label">
            <input
              {...baseProps}
              type="checkbox"
              checked={field.value as unknown as boolean}
              onChange={(e) => this.handleFieldChange(field.id as keyof T, e.target.checked as unknown as T[keyof T])}
              className="form-checkbox"
            />
            {field.placeholder || 'Check to confirm'}
          </label>
        );
        
      default:
        return null;
    }
  };
  
  render() {
    const { className, sectionTitle } = this.props;
    const { isLoading, isDirty, lastSaved } = this.state;
    const fields = this.getFields();
    
    return (
      <div className={`base-section ${className || ''}`}>
        <div className="section-header">
          <h2 className="section-title">
            Section {this.props.sectionNumber}: {sectionTitle}
          </h2>
          
          <div className="section-status">
            {isLoading && <span className="status-loading">Loading...</span>}
            {isDirty && <span className="status-dirty">Unsaved changes</span>}
            {lastSaved && !isDirty && (
              <span className="status-saved">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        
        <form onSubmit={this.handleSubmit} className="section-form">
          <div className="form-fields">
            {fields.map(field => this.renderField(field))}
          </div>
          
          <div className="form-actions">
            <button
              type="submit"
              disabled={!this.state.isValid || isLoading}
              className="btn btn-primary"
            >
              Save and Continue
            </button>
          </div>
        </form>
      </div>
    );
  }
}

/**
 * Hook-based BaseSection for functional components
 */
export function useBaseSection<T>(
  config: {
    sectionNumber: number;
    getInitialData: () => T;
    validateSection: (data: T) => ValidationResult;
    saveSection: (data: T) => Promise<void>;
    loadSection: () => Promise<T>;
  }
) {
  const [state, setState] = useState<SectionState<T>>({
    data: config.getInitialData(),
    errors: {},
    warnings: {},
    isDirty: false,
    isLoading: false,
    isValid: true
  });
  
  const validationTimeoutRef = useRef<NodeJS.Timeout>();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const data = await config.loadSection();
      setState(prev => ({
        ...prev,
        data,
        isLoading: false,
        isDirty: false
      }));
    } catch (error) {
      logger.error(`Failed to load section ${config.sectionNumber}`, error as Error, 'useBaseSection');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [config]);
  
  const validateData = useCallback(() => {
    const result = config.validateSection(state.data);
    
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    
    result.errors?.forEach(error => {
      if (error.field) {
        errors[error.field] = error.message;
      }
    });
    
    result.warnings?.forEach(warning => {
      if (warning.field) {
        warnings[warning.field] = warning.message;
      }
    });
    
    setState(prev => ({
      ...prev,
      errors,
      warnings,
      isValid: result.isValid
    }));
    
    return result;
  }, [config, state.data]);
  
  const save = useCallback(async () => {
    if (!state.isDirty) return;
    
    try {
      await config.saveSection(state.data);
      setState(prev => ({
        ...prev,
        isDirty: false,
        lastSaved: new Date()
      }));
      
      logger.info(`Section ${config.sectionNumber} saved`, 'useBaseSection');
    } catch (error) {
      logger.error(`Failed to save section ${config.sectionNumber}`, error as Error, 'useBaseSection');
    }
  }, [config, state.data, state.isDirty]);
  
  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value
      },
      isDirty: true
    }));
  }, []);
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    validationTimeoutRef.current = setTimeout(() => {
      validateData();
    }, 300);
    
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [state.data, validateData]);
  
  useEffect(() => {
    if (!state.isDirty) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      save();
    }, 1000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.isDirty, save]);
  
  return {
    state,
    updateField,
    validateData,
    save,
    loadData
  };
}