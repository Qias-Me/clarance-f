/**
 * Section Component Factory
 * 
 * Factory for creating standardized section components with consistent UI and behavior
 */

import React, { useCallback, useEffect, useState, memo, useMemo } from 'react';
import type { ValidationResult } from '../../../types/validation.types';
import { FieldRenderer, DynamicFieldRenderer, FieldGroup } from '../../fields/FieldRenderer';
import type { FieldConfig } from '../../fields/FieldRenderer';
import { logger } from '../../../services/Logger';
import { VirtualScrollSection } from './VirtualScrollSection';
import { usePerformanceMonitor } from '../../../hooks/usePerformanceMonitor';

export interface SectionComponentConfig {
  sectionNumber: number;
  sectionTitle: string;
  sectionDescription?: string;
  fields: FieldConfig[];
  fieldGroups?: Array<{
    title: string;
    description?: string;
    fields: string[]; // field IDs
  }>;
  subsections?: Array<{
    id: string;
    title: string;
    description?: string;
    fields: FieldConfig[];
    repeatable?: boolean;
    maxEntries?: number;
  }>;
  validation?: (data: Record<string, any>) => ValidationResult;
  onSubmit?: (data: Record<string, any>) => Promise<void>;
  customComponents?: Record<string, React.ComponentType<any>>;
  enableVirtualScroll?: boolean;
  virtualScrollThreshold?: number;
}

export interface SectionComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
  showNavigation?: boolean;
  showProgress?: boolean;
  readOnly?: boolean;
}

/**
 * Error Boundary for section components
 */
class SectionErrorBoundary extends React.Component<
  { children: React.ReactNode; sectionNumber: number },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; sectionNumber: number }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(`Section ${this.props.sectionNumber} crashed`, error, 'SectionErrorBoundary');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-800 font-semibold">
            Error in Section {this.props.sectionNumber}
          </h3>
          <p className="text-red-600 mt-2">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Progress indicator component
 */
const ProgressIndicator = memo(({ 
  current, 
  total 
}: { 
  current: number; 
  total: number; 
}) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Section {current} of {total}</span>
        <span>{Math.round(percentage)}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';

/**
 * Creates a standardized section component
 */
export function createSectionComponent(
  config: SectionComponentConfig,
  useSection: () => any
): React.FC<SectionComponentProps> {
  const SectionComponent: React.FC<SectionComponentProps> = memo(({
    className,
    onValidationChange,
    onNext,
    showNavigation = true,
    showProgress = false,
    readOnly = false
  }) => {
    const {
      sectionData,
      isLoading,
      errors,
      warnings,
      isDirty,
      updateField,
      updateFields,
      validateSection,
      saveData
    } = useSection();

    const [isValid, setIsValid] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [subsectionEntries, setSubsectionEntries] = useState<Record<string, any[]>>({});
    const performanceMonitor = usePerformanceMonitor(`Section${config.sectionNumber}Component`);

    // Validate on mount and data changes
    useEffect(() => {
      const result = validateSection();
      const valid = result.isValid;
      setIsValid(valid);
      
      if (onValidationChange) {
        onValidationChange(valid);
      }
    }, [sectionData, validateSection, onValidationChange]);

    // Handle field change
    const handleFieldChange = useCallback((fieldId: string, value: any) => {
      updateField(fieldId, value);
    }, [updateField]);

    // Handle subsection entry addition
    const addSubsectionEntry = useCallback((subsectionId: string) => {
      const subsection = config.subsections?.find(s => s.id === subsectionId);
      if (!subsection) return;

      const currentEntries = subsectionEntries[subsectionId] || [];
      if (subsection.maxEntries && currentEntries.length >= subsection.maxEntries) {
        logger.warn(`Maximum entries reached for ${subsectionId}`, 'SectionComponent');
        return;
      }

      const newEntry = subsection.fields.reduce((acc, field) => {
        acc[field.id] = field.value || '';
        return acc;
      }, {} as Record<string, any>);

      setSubsectionEntries(prev => ({
        ...prev,
        [subsectionId]: [...currentEntries, newEntry]
      }));
    }, [subsectionEntries, config.subsections]);

    // Handle subsection entry removal
    const removeSubsectionEntry = useCallback((subsectionId: string, index: number) => {
      setSubsectionEntries(prev => ({
        ...prev,
        [subsectionId]: prev[subsectionId].filter((_, i) => i !== index)
      }));
    }, []);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!isValid) {
        logger.warn(`Section ${config.sectionNumber} validation failed`, 'SectionComponent');
        return;
      }

      setIsSubmitting(true);
      try {
        // Save section data
        await saveData();

        // Custom submit handler
        if (config.onSubmit) {
          await config.onSubmit(sectionData);
        }

        // Navigate to next section
        if (onNext) {
          onNext();
        }

        logger.info(`Section ${config.sectionNumber} submitted`, 'SectionComponent');
      } catch (error) {
        logger.error(`Section ${config.sectionNumber} submission failed`, error as Error, 'SectionComponent');
      } finally {
        setIsSubmitting(false);
      }
    };

    // Render loading state
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // Prepare field configs with values and errors (memoized)
    const fieldsWithState = useMemo(() => 
      config.fields.map(field => ({
        ...field,
        value: sectionData[field.id],
        error: errors[field.id],
        warning: warnings[field.id],
        onChange: (value: any) => handleFieldChange(field.id, value),
        disabled: readOnly || isSubmitting
      })),
      [config.fields, sectionData, errors, warnings, handleFieldChange, readOnly, isSubmitting]
    );
    
    // Determine if virtual scrolling should be used
    const shouldUseVirtualScroll = config.enableVirtualScroll !== false && 
      fieldsWithState.length > (config.virtualScrollThreshold || 50);

    return (
      <SectionErrorBoundary sectionNumber={config.sectionNumber}>
        <div className={`section-component section-${config.sectionNumber} ${className || ''}`}>
          {showProgress && (
            <ProgressIndicator current={config.sectionNumber} total={30} />
          )}

          <div className="bg-white shadow-sm rounded-lg p-6">
            <header className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Section {config.sectionNumber}: {config.sectionTitle}
              </h2>
              {config.sectionDescription && (
                <p className="mt-2 text-gray-600">{config.sectionDescription}</p>
              )}
              {isDirty && (
                <div className="mt-2 text-sm text-amber-600">
                  <span className="inline-flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Unsaved changes
                  </span>
                </div>
              )}
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Render field groups */}
              {config.fieldGroups ? (
                config.fieldGroups.map(group => (
                  <FieldGroup
                    key={group.title}
                    title={group.title}
                    description={group.description}
                    fields={fieldsWithState.filter(f => group.fields.includes(f.id))}
                    className="mb-6"
                  />
                ))
              ) : shouldUseVirtualScroll ? (
                <VirtualScrollSection
                  fields={fieldsWithState}
                  className="h-[600px]"
                  renderField={(field) => (
                    <FieldRenderer
                      key={field.id}
                      config={field}
                      value={field.value}
                      onChange={field.onChange}
                      error={field.error}
                      warning={field.warning}
                      disabled={field.disabled}
                    />
                  )}
                />
              ) : (
                <DynamicFieldRenderer
                  fields={fieldsWithState}
                  values={sectionData}
                  onChange={handleFieldChange}
                  errors={errors}
                  warnings={warnings}
                />
              )}

              {/* Render subsections */}
              {config.subsections?.map(subsection => (
                <div key={subsection.id} className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">{subsection.title}</h3>
                  {subsection.description && (
                    <p className="text-gray-600 mb-4">{subsection.description}</p>
                  )}
                  
                  {subsection.repeatable ? (
                    <div className="space-y-4">
                      {(subsectionEntries[subsection.id] || []).map((entry, index) => (
                        <div key={index} className="p-4 border rounded-md">
                          <div className="flex justify-between mb-4">
                            <span className="font-medium">Entry {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeSubsectionEntry(subsection.id, index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                          <DynamicFieldRenderer
                            fields={subsection.fields.map(f => ({
                              ...f,
                              id: `${subsection.id}.${index}.${f.id}`,
                              value: entry[f.id]
                            }))}
                            values={entry}
                            onChange={(fieldId, value) => {
                              const newEntries = [...(subsectionEntries[subsection.id] || [])];
                              newEntries[index] = { ...newEntries[index], [fieldId]: value };
                              setSubsectionEntries(prev => ({
                                ...prev,
                                [subsection.id]: newEntries
                              }));
                            }}
                            errors={{}}
                            warnings={{}}
                          />
                        </div>
                      ))}
                      
                      {(!subsection.maxEntries || 
                        (subsectionEntries[subsection.id]?.length || 0) < subsection.maxEntries) && (
                        <button
                          type="button"
                          onClick={() => addSubsectionEntry(subsection.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Add {subsection.title}
                        </button>
                      )}
                    </div>
                  ) : (
                    <DynamicFieldRenderer
                      fields={subsection.fields}
                      values={sectionData}
                      onChange={handleFieldChange}
                      errors={errors}
                      warnings={warnings}
                    />
                  )}
                </div>
              ))}

              {/* Navigation buttons */}
              {showNavigation && (
                <div className="flex justify-between pt-6 border-t">
                  <button
                    type="button"
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                    disabled={isSubmitting}
                  >
                    Previous
                  </button>
                  
                  <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className={`px-6 py-2 rounded font-medium ${
                      isValid && !isSubmitting
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? 'Saving...' : 'Save and Continue'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </SectionErrorBoundary>
    );
  });

  SectionComponent.displayName = `Section${config.sectionNumber}Component`;
  
  return memo(SectionComponent);
}