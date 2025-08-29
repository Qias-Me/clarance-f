/**
 * Section 13: Employment Activities - Component
 * 
 * Main container component for SF-86 Section 13 Employment Activities form.
 * Integrates dynamic field rendering (1,086 fields) with legacy static rendering.
 * 
 * @features
 * - Dynamic Field Renderer: JSON-driven field generation for all 1,086 fields
 * - Legacy Support: Static field definitions for compatibility
 * - Enhanced Integration: Real-time field mapping and validation
 * - Employment Type Branching: Conditional field sets based on employment type
 * 
 * @architecture Form Architecture 2.0 with Field<T> interfaces
 * @maintainability Refactored for single responsibility and modularity
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSection13 } from '~/state/contexts/sections2.0/section13';
import { usePerformanceMonitor } from '../../utils/performance-monitor';
import { useSF86Form } from '~/state/contexts/sections2.0/SF86FormContext';
import { EmploymentSection } from './EmploymentSection';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import Section13FullRenderer from './Section13FullRenderer';
import VirtualizedFields, { createFieldConfig, createFieldGroup, type FieldConfig, type FieldGroup } from './VirtualizedFields';
import { cloneDeep } from 'lodash';
import { 
  EMPLOYMENT_TYPES,
  NON_FEDERAL_EMPLOYMENT_TYPES,
  MAX_EMPLOYMENT_ENTRIES,
  VALIDATION_MESSAGES,
  FIELD_TYPE_LABELS,
  SECTION_13_TABS
} from '~/constants/section13-constants';
import {
  createEmploymentEntry,
  normalizeValue,
  normalizeFieldPath,
  getNestedFieldValue,
  setNestedFieldValue,
  validateEmploymentEntry
} from '../../utils/section13-helpers';

interface Section13ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section13Component: React.FC<Section13ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  // Performance monitoring for this complex section
  const { recommendations } = usePerformanceMonitor('Section13Component');
  // Section 13 Context
  const {
    section13Data,
    updateFieldValue,
    validateSection,
    resetSection,
    isDirty,
    errors,
    initializeEnhancedSupport,
    getEmploymentTypeStats
  } = useSection13();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);
  
  // Toggle between legacy and virtualized field rendering
  const [useVirtualizedRenderer, setUseVirtualizedRenderer] = useState(true);
  
  /**
   * Get field value safely with improved path resolution
   * @param {string} fieldPath - Path to the field value
   * @returns {string | boolean} The field value or empty string if not found
   */
  const getFieldValue = useCallback((fieldPath: string): string | boolean => {
    const normalizedPath = normalizeFieldPath(fieldPath);
    return getNestedFieldValue(section13Data, normalizedPath);
  }, [section13Data]);

  /**
   * Handle field updates with correct structure - Enhanced for complex nested objects
   * @param {string} fieldPath - Path to the field being updated
   * @param {string | boolean} value - New value for the field
   */
  const handleFieldChange = useCallback((fieldPath: string, value: string | boolean) => {
    const normalizedValue = normalizeValue(value);
    const finalPath = normalizeFieldPath(fieldPath);
    updateFieldValue(finalPath, normalizedValue);
  }, [updateFieldValue]);
  
  // Convert section data to VirtualizedFields format
  const fieldConfigs = useMemo((): FieldConfig[] => {
    if (!section13Data?.section13) return [];
    
    const configs: FieldConfig[] = [];
    
    // Helper to create field config from section data
    const addFieldConfig = (path: string, label: string, type: FieldConfig['type'] = 'text', options?: string[]) => {
      const value = getFieldValue(path);
      configs.push(createFieldConfig(
        path,
        label,
        value,
        (newValue) => handleFieldChange(path, newValue),
        { type, options, required: path.includes('required') }
      ));
    };
    
    // Employment Record Issues
    addFieldConfig('section13.employmentRecordIssues.wasFired.value', 'Were you ever fired from a job?', 'checkbox');
    addFieldConfig('section13.employmentRecordIssues.quitAfterBeingTold.value', 'Did you quit after being told you would be fired?', 'checkbox');
    addFieldConfig('section13.employmentRecordIssues.leftByMutualAgreement.value', 'Did you leave by mutual agreement?', 'checkbox');
    addFieldConfig('section13.employmentRecordIssues.hasChargesOrAllegations.value', 'Do you have charges or allegations?', 'checkbox');
    
    // Disciplinary Actions
    addFieldConfig('section13.disciplinaryActions.receivedWrittenWarning.value', 'Received written warning?', 'checkbox');
    
    return configs;
  }, [section13Data, getFieldValue, handleFieldChange]);
  
  // Group fields by category
  const fieldGroups = useMemo((): FieldGroup[] => {
    const employmentIssues = fieldConfigs.filter(field => field.id.includes('employmentRecordIssues'));
    const disciplinaryActions = fieldConfigs.filter(field => field.id.includes('disciplinaryActions'));
    
    return [
      createFieldGroup('Employment Record Issues', employmentIssues),
      createFieldGroup('Disciplinary Actions', disciplinaryActions)
    ];
  }, [fieldConfigs]);

  // Initialize enhanced field mapping support on component mount
  // Fixed: Removed circular dependency that was causing infinite re-render
  useEffect(() => {
    let isMounted = true;
    
    const initializeEnhancedIntegration = async () => {
      try {
        if (isMounted && typeof initializeEnhancedSupport === 'function') {
          await initializeEnhancedSupport();
          
          if (isMounted && typeof getEmploymentTypeStats === 'function') {
            const stats = await getEmploymentTypeStats();
            console.log('📊 Section13Component: Field Coverage Statistics:', stats);
          }
        }
      } catch (error) {
        console.error('❌ Section13Component: Enhanced field mapping initialization failed:', error);
      }
    };
    
    initializeEnhancedIntegration();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  // Handle validation when data changes
  const handleValidationChange = useCallback(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [validateSection, onValidationChange]);

  useEffect(() => {
    handleValidationChange();
  }, [handleValidationChange]);

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        // Update the central form context with Section 13 data
        sf86Form.updateSectionData('section13', section13Data);

        // Get the current form data and update it with section13 data for immediate saving
        const currentFormData = sf86Form.exportForm();
        const updatedFormData = { ...currentFormData, section13: section13Data };

        // Save the form data to persistence layer with the updated data
        await sf86Form.saveForm(updatedFormData);

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section13');

        // Proceed to next section if callback provided
        onNext?.();
      } catch (error) {
        console.error('❌ Failed to save Section 13 data:', error);
        
        // Proper error handling with user notification
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        // In a real application, you would show a toast notification or modal
        // For now, we'll use a simple alert - this should be replaced with proper UI
        if (typeof window !== 'undefined') {
          window.alert(`Failed to save Section 13 data: ${errorMessage}. Please try again.`);
        }
        
        // Log error for debugging/monitoring
        console.error('Section 13 save error details:', {
          error: errorMessage,
          timestamp: new Date().toISOString(),
          section: 'section13',
          action: 'save_attempt'
        });
      }
    }
  };

  // Reset function
  const handleReset = useCallback(() => {
    resetSection();
  }, [resetSection]);

  // Check if any employment record issues are true
  const hasAnyEmploymentIssues = useMemo((): boolean => {
    const issues = section13Data.section13?.employmentRecordIssues;
    if (!issues) return false;
    return Boolean(
      issues.wasFired?.value || 
      issues.quitAfterBeingTold?.value || 
      issues.leftByMutualAgreement?.value || 
      issues.hasChargesOrAllegations?.value
    );
  }, [
    section13Data.section13?.employmentRecordIssues?.wasFired?.value,
    section13Data.section13?.employmentRecordIssues?.quitAfterBeingTold?.value,
    section13Data.section13?.employmentRecordIssues?.leftByMutualAgreement?.value,
    section13Data.section13?.employmentRecordIssues?.hasChargesOrAllegations?.value
  ]);

  // Check if any disciplinary actions are true
  const hasAnyDisciplinaryActions = useMemo((): boolean => {
    const actions = section13Data.section13?.disciplinaryActions;
    if (!actions) return false;
    return Boolean(actions.receivedWrittenWarning?.value);
  }, [section13Data.section13?.disciplinaryActions?.receivedWrittenWarning?.value]);

  // Employment entry management functions
  const addEmploymentEntry = (entryType: string) => {
    // Create a new entry with the proper Field<T> structure
    const createField = (value: any, id: string) => ({
      id,
      value,
      label: '',
      name: id,
      type: 'PDFTextField',
      required: false,
      section: 13,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    });

    const newEntry = {
      _id: `${entryType}-${Date.now()}`,
      employerName: createField('', `${entryType}EmployerName`),
      positionTitle: createField('', `${entryType}PositionTitle`),
      employmentDates: {
        fromDate: createField('', `${entryType}FromDate`),
        toDate: createField('', `${entryType}ToDate`),
        present: createField(false, `${entryType}Present`)
      },
      address: {
        street: createField('', `${entryType}Street`),
        city: createField('', `${entryType}City`),
        state: createField('', `${entryType}State`),
        zipCode: createField('', `${entryType}ZipCode`),
        country: createField('United States', `${entryType}Country`)
      },
      supervisor: {
        name: createField('', `${entryType}SupervisorName`),
        title: createField('', `${entryType}SupervisorTitle`),
        email: createField('', `${entryType}SupervisorEmail`),
        phone: {
          number: createField('', `${entryType}SupervisorPhone`),
          extension: createField('', `${entryType}SupervisorExtension`)
        }
      },
      reasonForLeaving: createField('', `${entryType}ReasonForLeaving`),
      additionalComments: createField('', `${entryType}AdditionalComments`)
    };

    // Get current entries and add the new one
    const currentEntries = section13Data.section13?.[entryType]?.entries || [];
    const updatedSection = {
      ...section13Data.section13?.[entryType],
      entries: [...currentEntries, newEntry]
    };
    
    updateFieldValue(`section13.${entryType}`, updatedSection);
  };

  const updateEmploymentEntry = (entryType: string, index: number, field: string, value: string) => {
    const currentEntries = section13Data.section13?.[entryType]?.entries || [];
    const updatedEntries = cloneDeep(currentEntries);
    
    if (updatedEntries[index]) {
      // Handle nested field updates for Field<T> structure
      if (field.includes('.')) {
        const fieldParts = field.split('.');
        let current = updatedEntries[index];
        
        // Navigate to the nested object
        for (let i = 0; i < fieldParts.length - 1; i++) {
          if (!current[fieldParts[i]]) {
            current[fieldParts[i]] = {};
          }
          current = current[fieldParts[i]];
        }
        
        // Set the final value in the Field<T> structure
        const finalField = fieldParts[fieldParts.length - 1];
        if (current[finalField] && typeof current[finalField] === 'object' && 'value' in current[finalField]) {
          current[finalField].value = value;
        } else {
          current[finalField] = { value, id: `${entryType}${field}`, label: '', name: `${entryType}${field}`, type: 'PDFTextField', required: false, section: 13, rect: { x: 0, y: 0, width: 0, height: 0 } };
        }
      } else {
        // Direct field update
        if (updatedEntries[index][field] && typeof updatedEntries[index][field] === 'object' && 'value' in updatedEntries[index][field]) {
          updatedEntries[index][field].value = value;
        } else {
          updatedEntries[index][field] = { value, id: `${entryType}${field}`, label: '', name: `${entryType}${field}`, type: 'PDFTextField', required: false, section: 13, rect: { x: 0, y: 0, width: 0, height: 0 } };
        }
      }
      
      // Update the entire employment section
      const updatedSection = {
        ...section13Data.section13?.[entryType],
        entries: updatedEntries
      };
      
      updateFieldValue(`section13.${entryType}`, updatedSection);
    }
  };

  const removeEmploymentEntry = (entryType: string, index: number) => {
    const currentEntries = section13Data.section13?.[entryType]?.entries || [];
    const updatedEntries = currentEntries.filter((_, i) => i !== index);
    
    const updatedSection = {
      ...section13Data.section13?.[entryType],
      entries: updatedEntries
    };
    
    updateFieldValue(`section13.${entryType}`, updatedSection);
  };

  return (
    <div className={`${className}`} data-testid="section13-form">
      {/* Renderer toggle */}
      <div className="mb-4">
        <button
          onClick={() => setUseVirtualizedRenderer(!useVirtualizedRenderer)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
        >
          {useVirtualizedRenderer ? 'Switch to Legacy Renderer' : 'Switch to Virtualized Renderer'}
        </button>
        <span className="ml-2 text-sm text-gray-600">
          {useVirtualizedRenderer ? 'Using Virtual Scrolling (Recommended)' : 'Using Legacy Renderer'}
        </span>
      </div>
      
      {/* Conditional rendering based on toggle */}
      {useVirtualizedRenderer ? (
        <VirtualizedFields
          groups={fieldGroups}
          maxVisibleHeight={600}
          itemHeight={80}
          overscanCount={5}
          onFieldChange={handleFieldChange}
        />
      ) : (
        <Section13FullRenderer onValidationChange={onValidationChange} />
      )}
      
      {/* Form submission buttons */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default Section13Component;
