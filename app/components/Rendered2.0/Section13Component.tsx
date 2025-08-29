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
<<<<<<< HEAD
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
=======
import { integratedValidationService, type IntegratedValidationResult } from '../../../api/service/integratedValidationService';
import { FieldMappingValidator } from '../tools/FieldMappingValidator';
>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02

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
    updateField,
    validateSection,
    resetSection,
    isDirty,
    errors,
<<<<<<< HEAD
    initializeEnhancedSupport,
    getEmploymentTypeStats
=======
    // Employment Entry Management
    addMilitaryEmploymentEntry,
    removeMilitaryEmploymentEntry,
    updateMilitaryEmploymentEntry,
    addNonFederalEmploymentEntry,
    removeNonFederalEmploymentEntry,
    updateNonFederalEmploymentEntry,
    addSelfEmploymentEntry,
    removeSelfEmploymentEntry,
    updateSelfEmploymentEntry,
    addUnemploymentEntry,
    removeUnemploymentEntry,
    updateUnemploymentEntry,
    getEmploymentEntryCount
>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02
  } = useSection13();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);
<<<<<<< HEAD
  
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
=======
  const [validationResult, setValidationResult] = useState<IntegratedValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showFieldMappingValidator, setShowFieldMappingValidator] = useState(false);
  const [pdfBytesForValidation, setPdfBytesForValidation] = useState<Uint8Array | null>(null);
>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02

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

<<<<<<< HEAD
  useEffect(() => {
    handleValidationChange();
  }, [handleValidationChange]);
=======
  // Handle field updates with correct structure
  const handleFieldChange = (fieldPath: string, value: any) => {
    updateField(`section13.${fieldPath}.value`, value);
  };

  // Handle employment entry field updates
  const handleEmploymentEntryFieldChange = (entryType: string, entryId: string | number, fieldPath: string, value: any) => {
    const stringEntryId = String(entryId);
    switch (entryType) {
      case 'militaryEmployment':
        updateMilitaryEmploymentEntry(stringEntryId, `${fieldPath}.value`, value);
        break;
      case 'nonFederalEmployment':
        updateNonFederalEmploymentEntry(stringEntryId, `${fieldPath}.value`, value);
        break;
      case 'selfEmployment':
        updateSelfEmploymentEntry(stringEntryId, `${fieldPath}.value`, value);
        break;
      case 'unemployment':
        updateUnemploymentEntry(stringEntryId, `${fieldPath}.value`, value);
        break;
    }
  };
>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02

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
<<<<<<< HEAD
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
=======
    setValidationResult(null);
  };

  // Handle validation inputs
  const handleValidateInputs = async () => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      console.log('🚀 Starting Section 13 input validation...');

      // Get the current form data from SF86FormContext
      const currentFormData = sf86Form.exportForm();
      console.log('📋 Current form data Section 13:', currentFormData.section13);

      // Ensure Section 13 data is synced with the form context
      if (currentFormData.section13 !== section13Data) {
        console.log('⚠️ Section 13 data mismatch detected, syncing...');
        // Update the form with current section data before generating PDF
        await sf86Form.updateSection(13, section13Data);
      }

      // Generate PDF using the existing PDF generation service
      const pdfResult = await sf86Form.generatePdf();

      if (!pdfResult.success) {
        throw new Error('Failed to generate PDF for validation');
      }

      // Use the actual PDF bytes from the generation result
      const pdfBytes = pdfResult.pdfBytes;

      if (!pdfBytes || pdfBytes.length === 0) {
        throw new Error('No PDF data received from generation process');
      }

      console.log('📄 PDF generated, starting validation...');
      console.log(`📊 PDF size: ${(pdfBytes.length / 1024 / 1024).toFixed(2)} MB`);

      // Extract expected values from the formData that was used to generate the PDF
      const expectedValues = extractExpectedValuesFromFormData(currentFormData.section13);
      console.log('📝 Extracted expected values from form data:', expectedValues);

      // Run integrated validation on page 17 (Section 13)
      const validationResult = await integratedValidationService.validateSection13Inputs(
        pdfBytes,
        {
          clearData: true,
          generateImages: true,
          extractFields: true,
          targetPage: 17,
          validateAgainstExpected: true,
          expectedValues: expectedValues
        }
      );

      setValidationResult(validationResult);
      console.log('✅ Validation completed successfully:', validationResult);

    } catch (error: any) {
      console.error('❌ Validation failed:', error);
      setValidationResult({
        success: false,
        targetPage: 17,
        section: 13,
        totalFields: 0,
        fieldsWithValues: 0,
        fieldsEmpty: 0,
        pageResult: {
          pageNumber: 17,
          totalFields: 0,
          fieldsWithValues: 0,
          fieldsEmpty: 0,
          fields: [],
          imageGenerated: false
        },
        errors: [error.message || 'Validation failed'],
        warnings: [],
        processingTime: 0,
        dataCleared: false,
        imageGenerated: false,
        fieldsExtracted: false
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Helper function to extract expected values from form data
  const extractExpectedValuesFromFormData = (formDataSection13: any): string[] => {
    const expectedValues: string[] = [];
    
    // Helper to safely extract field values
    const extractFieldValue = (field: any) => {
      if (typeof field === 'object' && field?.value !== undefined) {
        return field.value;
      }
      return field;
    };
    
    // Add main section values
    if (formDataSection13?.section13) {
      const mainSection = formDataSection13.section13;
      
      if (mainSection.hasEmployment) {
        expectedValues.push(extractFieldValue(mainSection.hasEmployment));
      }
      if (mainSection.hasGaps) {
        expectedValues.push(extractFieldValue(mainSection.hasGaps));
      }
      if (mainSection.gapExplanation) {
        expectedValues.push(extractFieldValue(mainSection.gapExplanation));
      }
      if (mainSection.employmentType) {
        expectedValues.push(extractFieldValue(mainSection.employmentType));
      }
      
      // Extract values from employment entries based on type
      const extractEmploymentValues = (entries: any[]) => {
        entries?.forEach(entry => {
          // Common fields
          if (entry.employerName) expectedValues.push(extractFieldValue(entry.employerName));
          if (entry.positionTitle) expectedValues.push(extractFieldValue(entry.positionTitle));
          if (entry.businessName) expectedValues.push(extractFieldValue(entry.businessName));
          if (entry.businessType) expectedValues.push(extractFieldValue(entry.businessType));
          if (entry.rankTitle) expectedValues.push(extractFieldValue(entry.rankTitle));
          if (entry.reason) expectedValues.push(extractFieldValue(entry.reason));
          
          // Nested fields
          if (entry.supervisor?.name) expectedValues.push(extractFieldValue(entry.supervisor.name));
          if (entry.dutyStation?.dutyStation) expectedValues.push(extractFieldValue(entry.dutyStation.dutyStation));
          if (entry.employerAddress?.street) expectedValues.push(extractFieldValue(entry.employerAddress.street));
          if (entry.employerAddress?.city) expectedValues.push(extractFieldValue(entry.employerAddress.city));
        });
      };
      
      // Process all employment types
      if (mainSection.militaryEmployment?.entries) {
        extractEmploymentValues(mainSection.militaryEmployment.entries);
      }
      if (mainSection.nonFederalEmployment?.entries) {
        extractEmploymentValues(mainSection.nonFederalEmployment.entries);
      }
      if (mainSection.selfEmployment?.entries) {
        extractEmploymentValues(mainSection.selfEmployment.entries);
      }
      if (mainSection.unemployment?.entries) {
        extractEmploymentValues(mainSection.unemployment.entries);
      }
    }
    
    // Filter out empty values
    return expectedValues.filter(val => val && String(val).trim() !== '');
  };

  // Get field value safely
  const getFieldValue = (fieldPath: string): string => {
    // Access section13Data correctly using the structure from the interface
    if (fieldPath === 'hasEmployment') {
      return section13Data.section13?.hasEmployment?.value || 'NO';
    } else if (fieldPath === 'hasGaps') {
      return section13Data.section13?.hasGaps?.value || 'NO';
    } else if (fieldPath === 'gapExplanation') {
      return section13Data.section13?.gapExplanation?.value || '';
    } else if (fieldPath === 'employmentType') {
      return section13Data.section13?.employmentType?.value || 'Other';
>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02
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
<<<<<<< HEAD
      
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
=======

      {/* Employment Information Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Has Employment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Do you have employment history to report? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasEmployment"
                value="YES"
                checked={getFieldValue('hasEmployment') === 'YES'}
                onChange={(e) => handleFieldChange('hasEmployment', e.target.value)}
                className="mr-2"
                required
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasEmployment"
                value="NO"
                checked={getFieldValue('hasEmployment') === 'NO'}
                onChange={(e) => handleFieldChange('hasEmployment', e.target.value)}
                className="mr-2"
                required
              />
              No
            </label>
          </div>
          {errors['hasEmployment'] && (
            <p className="mt-1 text-sm text-red-600">{errors['hasEmployment']}</p>
          )}
        </div>

        {/* Has Gaps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Do you have any gaps in your employment history? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasGaps"
                value="YES"
                checked={getFieldValue('hasGaps') === 'YES'}
                onChange={(e) => handleFieldChange('hasGaps', e.target.value)}
                className="mr-2"
                required
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasGaps"
                value="NO"
                checked={getFieldValue('hasGaps') === 'NO'}
                onChange={(e) => handleFieldChange('hasGaps', e.target.value)}
                className="mr-2"
                required
              />
              No
            </label>
          </div>
          {errors['hasGaps'] && (
            <p className="mt-1 text-sm text-red-600">{errors['hasGaps']}</p>
          )}
        </div>

        {/* Gap Explanation - Only show if has gaps */}
        {getFieldValue('hasGaps') === 'YES' && (
          <div>
            <label
              htmlFor="gapExplanation"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Please explain any gaps in your employment history <span className="text-red-500">*</span>
            </label>
            <textarea
              id="gapExplanation"
              data-testid="gap-explanation-field"
              value={getFieldValue('gapExplanation')}
              onChange={(e) => handleFieldChange('gapExplanation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide a detailed explanation for any gaps in your employment history"
              rows={4}
              required={getFieldValue('hasGaps') === 'YES'}
            />
            <p className="mt-1 text-xs text-gray-500">
              Provide a detailed explanation for any periods of unemployment or gaps in your employment history.
            </p>
            {errors['gapExplanation'] && (
              <p className="mt-1 text-sm text-red-600">{errors['gapExplanation']}</p>
            )}
          </div>
        )}

        {/* Employment Type Selection */}
        {getFieldValue('hasEmployment') === 'YES' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Select your employment type <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="employmentType"
                  value="Military"
                  checked={section13Data.section13?.employmentType?.value === "Military"}
                  onChange={(e) => handleFieldChange('employmentType', e.target.value)}
                  className="mr-2"
                  required
                />
                Active military duty station (Complete 13A.1, 13A.5 and 13A.6)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="employmentType"
                  value="National Guard/Reserve"
                  checked={section13Data.section13?.employmentType?.value === "National Guard/Reserve"}
                  onChange={(e) => handleFieldChange('employmentType', e.target.value)}
                  className="mr-2"
                  required
                />
                National Guard/Reserve (Complete 13A.1, 13A.5 and 13A.6)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="employmentType"
                  value="USPHS"
                  checked={section13Data.section13?.employmentType?.value === "USPHS"}
                  onChange={(e) => handleFieldChange('employmentType', e.target.value)}
                  className="mr-2"
                  required
                />
                USPHS Commissioned Corps (Complete 13A.1, 13A.5 and 13A.6)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="employmentType"
                  value="Federal"
                  checked={section13Data.section13?.employmentType?.value === "Federal"}
                  onChange={(e) => handleFieldChange('employmentType', e.target.value)}
                  className="mr-2"
                  required
                />
                Other Federal employment (Complete 13A.2, 13A.5 and 13A.6)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="employmentType"
                  value="State Government"
                  checked={section13Data.section13?.employmentType?.value === "State Government"}
                  onChange={(e) => handleFieldChange('employmentType', e.target.value)}
                  className="mr-2"
                  required
                />
                State Government (Complete 13A.2, 13A.5 and 13A.6)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="employmentType"
                  value="Federal Contractor"
                  checked={section13Data.section13?.employmentType?.value === "Federal Contractor"}
                  onChange={(e) => handleFieldChange('employmentType', e.target.value)}
                  className="mr-2"
                  required
                />
                Federal Contractor (Complete 13A.2, 13A.5 and 13A.6)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="employmentType"
                  value="Non-government employment"
                  checked={section13Data.section13?.employmentType?.value === "Non-government employment"}
                  onChange={(e) => handleFieldChange('employmentType', e.target.value)}
                  className="mr-2"
                  required
                />
                Non-government employment (Complete 13A.2, 13A.5 and 13A.6)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="employmentType"
                  value="Self-Employment"
                  checked={section13Data.section13?.employmentType?.value === "Self-Employment"}
                  onChange={(e) => handleFieldChange('employmentType', e.target.value)}
                  className="mr-2"
                  required
                />
                Self-Employment (Complete 13A.3, 13A.5 and 13A.6)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="employmentType"
                  value="Unemployment"
                  checked={section13Data.section13?.employmentType?.value === "Unemployment"}
                  onChange={(e) => handleFieldChange('employmentType', e.target.value)}
                  className="mr-2"
                  required
                />
                Unemployment (Complete 13A.4, 13A.5 and 13A.6)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="employmentType"
                  value="Other"
                  checked={section13Data.section13?.employmentType?.value === "Other"}
                  onChange={(e) => handleFieldChange('employmentType', e.target.value)}
                  className="mr-2"
                  required
                />
                Other (Provide explanation and complete 13A.2, 13A.5 and 13A.6)
              </label>
            </div>
            {errors['employmentType'] && (
              <p className="mt-1 text-sm text-red-600">{errors['employmentType']}</p>
            )}
          </div>
        )}

        {/* Employment Entries Section - Conditional Rendering Based on Type */}
        {getFieldValue('hasEmployment') === 'YES' && section13Data.section13?.employmentType?.value && (
          <div className="space-y-8 border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Employment History</h3>
            
            {/* Instructions based on employment type */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Based on your employment type selection, you need to complete the following subsections:
              </p>
              <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                {(section13Data.section13?.employmentType?.value === 'Military' || 
                  section13Data.section13?.employmentType?.value === 'National Guard/Reserve' ||
                  section13Data.section13?.employmentType?.value === 'USPHS') && (
                  <li>Complete 13A.1 (Military Employment), 13A.5 and 13A.6</li>
                )}
                {(section13Data.section13?.employmentType?.value === 'Federal' || 
                  section13Data.section13?.employmentType?.value === 'State Government' ||
                  section13Data.section13?.employmentType?.value === 'Federal Contractor' ||
                  section13Data.section13?.employmentType?.value === 'Non-government employment' ||
                  section13Data.section13?.employmentType?.value === 'Other') && (
                  <li>Complete 13A.2 (Non-Federal Employment), 13A.5 and 13A.6</li>
                )}
                {section13Data.section13?.employmentType?.value === 'Self-Employment' && (
                  <li>Complete 13A.3 (Self-Employment), 13A.5 and 13A.6</li>
                )}
                {section13Data.section13?.employmentType?.value === 'Unemployment' && (
                  <li>Complete 13A.4 (Unemployment), 13A.5 and 13A.6</li>
                )}
              </ul>
            </div>

            {/* Military/Federal Employment - Show only for relevant types */}
            {(section13Data.section13?.employmentType?.value === 'Military' || 
              section13Data.section13?.employmentType?.value === 'National Guard/Reserve' ||
              section13Data.section13?.employmentType?.value === 'USPHS') && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    13A.1 - Military/Federal Employment ({getEmploymentEntryCount('militaryEmployment')})
                  </h4>
                  <button
                    type="button"
                    onClick={addMilitaryEmploymentEntry}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={getEmploymentEntryCount('militaryEmployment') >= 4}
                  >
                    {getEmploymentEntryCount('militaryEmployment') >= 4 ? 'Max Entries Reached' : 'Add Entry'}
                  </button>
                </div>

              {section13Data.section13.militaryEmployment?.entries?.map((entry, index) => (
                <div key={entry._id} className="border border-gray-100 rounded-md p-4 mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-gray-800">Entry {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeMilitaryEmploymentEntry(String(entry._id))}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employer Name
                      </label>
                      <input
                        type="text"
                        value={entry.employerName?.value || ''}
                        onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'employerName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter employer name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position Title
                      </label>
                      <input
                        type="text"
                        value={entry.positionTitle?.value || ''}
                        onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'positionTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter position title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={entry.employmentDates?.fromDate?.value || ''}
                        onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'employmentDates.fromDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={entry.employmentDates?.toDate?.value || ''}
                        onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'employmentDates.toDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={entry.employmentDates?.present?.value}
                      />
                    </div>
                  </div>

                  {/* Employment Status and Position Details - PAGE 17 FIELDS */}
                  <div className="mt-6">
                    <h6 className="text-md font-medium text-gray-800 mb-3">Employment Status & Position</h6>

                    {/* Employment Status Dropdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Employment Status *
                        </label>
                        <select
                          value={entry.employmentStatus?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'employmentStatus', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Status</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Temporary">Temporary</option>
                          <option value="Seasonal">Seasonal</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={entry.employmentDates?.fromEstimated?.value || false}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'employmentDates.fromEstimated', e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-sm text-gray-700">From Date is Estimate</label>
                      </div>
                    </div>

                    {/* Position and Duty Station */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Most Recent Rank/Position Title *
                        </label>
                        <input
                          type="text"
                          value={entry.rankTitle?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'rankTitle', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter rank/position title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Assigned Duty Station *
                        </label>
                        <input
                          type="text"
                          value={entry.dutyStation?.dutyStation?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'dutyStation.dutyStation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter duty station"
                        />
                      </div>
                    </div>

                    {/* Other Explanation Field */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Other Explanation (if applicable)
                      </label>
                      <input
                        type="text"
                        value={entry.otherExplanation?.value || ''}
                        onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'otherExplanation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Provide explanation if needed"
                      />
                    </div>
                  </div>

                  {/* Duty Station Address - PAGE 17 FIELDS */}
                  <div className="mt-6">
                    <h6 className="text-md font-medium text-gray-800 mb-3">Duty Station Address</h6>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={entry.dutyStation?.street?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'dutyStation.street', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter duty station street address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          value={entry.dutyStation?.city?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'dutyStation.city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter city"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <select
                          value={entry.dutyStation?.state?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'dutyStation.state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select State</option>
                          <option value="AL">Alabama</option>
                          <option value="AK">Alaska</option>
                          <option value="AZ">Arizona</option>
                          <option value="AR">Arkansas</option>
                          <option value="CA">California</option>
                          <option value="CO">Colorado</option>
                          <option value="CT">Connecticut</option>
                          <option value="DE">Delaware</option>
                          <option value="FL">Florida</option>
                          <option value="GA">Georgia</option>
                          {/* Add more states as needed */}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          value={entry.dutyStation?.zipCode?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'dutyStation.zipCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Zip Code"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <select
                          value={entry.dutyStation?.country?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'dutyStation.country', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Country</option>
                          <option value="United States">United States</option>
                          <option value="Afghanistan">Afghanistan</option>
                          <option value="Germany">Germany</option>
                          <option value="Japan">Japan</option>
                          <option value="South Korea">South Korea</option>
                          {/* Add more countries as needed */}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* APO/FPO Address - PAGE 17 FIELDS */}
                  <div className="mt-6">
                    <h6 className="text-md font-medium text-gray-800 mb-3">APO/FPO Address (if applicable)</h6>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          APO/FPO Street Address
                        </label>
                        <input
                          type="text"
                          value={entry.apoAddress?.street?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'apoAddress.street', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter APO/FPO street address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          APO or FPO
                        </label>
                        <input
                          type="text"
                          value={entry.apoAddress?.apo?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'apoAddress.apo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter APO or FPO"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <select
                          value={entry.apoAddress?.state?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'apoAddress.state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select State</option>
                          <option value="AL">Alabama</option>
                          <option value="AK">Alaska</option>
                          <option value="AZ">Arizona</option>
                          <option value="AR">Arkansas</option>
                          <option value="CA">California</option>
                          <option value="CO">Colorado</option>
                          <option value="CT">Connecticut</option>
                          <option value="DE">Delaware</option>
                          <option value="FL">Florida</option>
                          <option value="GA">Georgia</option>
                          {/* Add more states as needed */}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          value={entry.apoAddress?.zipCode?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'apoAddress.zipCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter zip code"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Physical Location Address - PAGE 17 FIELDS */}
                  <div className="mt-6">
                    <h6 className="text-md font-medium text-gray-800 mb-3">Physical Location Address (if different from duty station)</h6>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={entry.physicalLocation?.street?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'physicalLocation.street', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter physical location street address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={entry.physicalLocation?.city?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'physicalLocation.city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter city"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <select
                          value={entry.physicalLocation?.state?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'physicalLocation.state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select State</option>
                          <option value="AL">Alabama</option>
                          <option value="AK">Alaska</option>
                          <option value="AZ">Arizona</option>
                          <option value="AR">Arkansas</option>
                          <option value="CA">California</option>
                          <option value="CO">Colorado</option>
                          <option value="CT">Connecticut</option>
                          <option value="DE">Delaware</option>
                          <option value="FL">Florida</option>
                          <option value="GA">Georgia</option>
                          {/* Add more states as needed */}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          value={entry.physicalLocation?.zipCode?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'physicalLocation.zipCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter zip code"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <select
                          value={entry.physicalLocation?.country?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'physicalLocation.country', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Country</option>
                          <option value="United States">United States</option>
                          <option value="Afghanistan">Afghanistan</option>
                          <option value="Germany">Germany</option>
                          <option value="Japan">Japan</option>
                          <option value="South Korea">South Korea</option>
                          {/* Add more countries as needed */}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Personal Phone Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Personal Phone Number
                        </label>
                        <input
                          type="text"
                          value={entry.phone?.number?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'phone.number', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter personal phone"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Extension
                        </label>
                        <input
                          type="text"
                          value={entry.phone?.extension?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'phone.extension', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Extension"
                        />
                      </div>

                      <div className="flex flex-col space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Phone Options
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={entry.phone?.isDSN?.value || false}
                              onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'phone.isDSN', e.target.checked)}
                              className="mr-1"
                            />
                            <span className="text-xs">DSN</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={entry.phone?.isDay?.value || false}
                              onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'phone.isDay', e.target.checked)}
                              className="mr-1"
                            />
                            <span className="text-xs">Day</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={entry.phone?.isNight?.value || false}
                              onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'phone.isNight', e.target.checked)}
                              className="mr-1"
                            />
                            <span className="text-xs">Night</span>
                          </label>
                        </div>
                      </div>
                    </div>

                  {/* Supervisor Information - COMPREHENSIVE */}
                  <div className="mt-6">
                    <h6 className="text-md font-medium text-gray-800 mb-3">Supervisor Information</h6>

                    {/* Basic Supervisor Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supervisor Name *
                        </label>
                        <input
                          type="text"
                          value={entry.supervisor?.name?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'supervisor.name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter supervisor name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supervisor Title/Rank *
                        </label>
                        <input
                          type="text"
                          value={entry.supervisor?.title?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'supervisor.title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter supervisor title/rank"
                        />
                      </div>
                    </div>

                    {/* Supervisor Phone Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supervisor Phone *
                        </label>
                        <input
                          type="text"
                          value={entry.supervisor?.phone?.number?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'supervisor.phone.number', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter supervisor phone"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Extension
                        </label>
                        <input
                          type="text"
                          value={entry.supervisor?.phone?.extension?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'supervisor.phone.extension', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Extension"
                        />
                      </div>

                      <div className="flex flex-col space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Phone Options
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={entry.supervisor?.phone?.isDSN?.value || false}
                              onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'supervisor.phone.isDSN', e.target.checked)}
                              className="mr-1"
                            />
                            <span className="text-xs">DSN</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={entry.supervisor?.phone?.isDay?.value || false}
                              onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'supervisor.phone.isDay', e.target.checked)}
                              className="mr-1"
                            />
                            <span className="text-xs">Day</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={entry.supervisor?.phone?.isNight?.value || false}
                              onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'supervisor.phone.isNight', e.target.checked)}
                              className="mr-1"
                            />
                            <span className="text-xs">Night</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Supervisor Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supervisor Email *
                        </label>
                        <input
                          type="email"
                          value={entry.supervisor?.email?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'supervisor.email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter supervisor email"
                        />
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={entry.supervisor?.emailUnknown?.value || false}
                            onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'supervisor.emailUnknown', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600">Email unknown</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Supervisor Physical Address - PAGE 17 FIELDS */}
                  <div className="mt-6">
                    <h6 className="text-md font-medium text-gray-800 mb-3">Supervisor Physical Address (if different from work location)</h6>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={entry.supervisor?.physicalAddress?.street?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'supervisor.physicalAddress.street', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter supervisor physical street address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={entry.supervisor?.physicalAddress?.city?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'supervisor.physicalAddress.city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter city"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <select
                          value={entry.supervisor?.physicalAddress?.state?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'supervisor.physicalAddress.state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select State</option>
                          <option value="AL">Alabama</option>
                          <option value="AK">Alaska</option>
                          <option value="AZ">Arizona</option>
                          <option value="AR">Arkansas</option>
                          <option value="CA">California</option>
                          <option value="CO">Colorado</option>
                          <option value="CT">Connecticut</option>
                          <option value="DE">Delaware</option>
                          <option value="FL">Florida</option>
                          <option value="GA">Georgia</option>
                          {/* Add more states as needed */}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          value={entry.supervisor?.physicalAddress?.zipCode?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'supervisor.physicalAddress.zipCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter zip code"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <select
                          value={entry.supervisor?.physicalAddress?.country?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'supervisor.physicalAddress.country', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Country</option>
                          <option value="United States">United States</option>
                          <option value="Afghanistan">Afghanistan</option>
                          <option value="Germany">Germany</option>
                          <option value="Japan">Japan</option>
                          <option value="South Korea">South Korea</option>
                          {/* Add more countries as needed */}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Additional Fields - PAGE 17 FIELDS */}
                  <div className="mt-6">
                    <h6 className="text-md font-medium text-gray-800 mb-3">Additional Information</h6>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Other Explanation
                        </label>
                        <textarea
                          value={entry.otherExplanation?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'otherExplanation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter other explanation if needed"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SSN (if required)
                        </label>
                        <input
                          type="text"
                          value={entry.ssn?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'ssn', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter SSN if required"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={entry.employmentDates?.present?.value || false}
                        onChange={(e) => handleEmploymentEntryFieldChange('militaryEmployment', entry._id, 'employmentDates.present', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Present (current employment)</span>
                    </label>
                  </div>
                </div>
              ))}

              {getEmploymentEntryCount('militaryEmployment') === 0 && (
                <p className="text-gray-500 text-center py-4">No military/federal employment entries added yet.</p>
              )}
              </div>
            )}

            {/* Non-Federal Employment - Show only for relevant types */}
            {(section13Data.section13?.employmentType?.value === 'Federal' || 
              section13Data.section13?.employmentType?.value === 'State Government' ||
              section13Data.section13?.employmentType?.value === 'Federal Contractor' ||
              section13Data.section13?.employmentType?.value === 'Non-government employment' ||
              section13Data.section13?.employmentType?.value === 'Other') && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    13A.2 - Non-Federal Employment ({getEmploymentEntryCount('nonFederalEmployment')})
                  </h4>
                  <button
                    type="button"
                    onClick={addNonFederalEmploymentEntry}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={getEmploymentEntryCount('nonFederalEmployment') >= 4}
                  >
                    {getEmploymentEntryCount('nonFederalEmployment') >= 4 ? 'Max Entries Reached' : 'Add Entry'}
                  </button>
                </div>

              {section13Data.section13.nonFederalEmployment?.entries?.map((entry, index) => (
                <div key={entry._id} className="border border-gray-100 rounded-md p-4 mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-gray-800">Entry {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeNonFederalEmploymentEntry(entry._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Basic Employment Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Employer Name
                        </label>
                        <input
                          type="text"
                          value={entry.employerName?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employerName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter employer name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Position Title
                        </label>
                        <input
                          type="text"
                          value={entry.positionTitle?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'positionTitle', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter position title"
                        />
                      </div>
                    </div>

                    {/* Employment Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From Date
                        </label>
                        <input
                          type="date"
                          value={entry.employmentDates?.fromDate?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employmentDates.fromDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          To Date
                        </label>
                        <input
                          type="date"
                          value={entry.employmentDates?.toDate?.value || ''}
                          onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employmentDates.toDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Present Employment Checkbox */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`present-${entry._id}`}
                        checked={entry.employmentDates?.present?.value || false}
                        onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employmentDates.present', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`present-${entry._id}`} className="ml-2 block text-sm text-gray-700">
                        Present (current employment)
                      </label>
                    </div>

                    {/* Supervisor Information */}
                    <div className="border-t pt-4">
                      <h6 className="text-sm font-medium text-gray-800 mb-3">Supervisor Information</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Supervisor Name
                          </label>
                          <input
                            type="text"
                            value={entry.supervisor?.name?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'supervisor.name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter supervisor name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Supervisor Title
                          </label>
                          <input
                            type="text"
                            value={entry.supervisor?.title?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'supervisor.title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter supervisor title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Supervisor Phone
                          </label>
                          <input
                            type="tel"
                            value={entry.supervisor?.phone?.number?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'supervisor.phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter supervisor phone"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Supervisor Email
                          </label>
                          <input
                            type="email"
                            value={entry.supervisor?.email?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'supervisor.email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter supervisor email"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Employer Address */}
                    <div className="border-t pt-4">
                      <h6 className="text-sm font-medium text-gray-800 mb-3">Employer Address</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={entry.employerAddress?.street?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employerAddress.street', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter street address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={entry.employerAddress?.city?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employerAddress.city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter city"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            value={entry.employerAddress?.state?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employerAddress.state', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter state"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            value={entry.employerAddress?.zipCode?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employerAddress.zipCode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter ZIP code"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            value={entry.employerAddress?.country?.value || ''}
                            onChange={(e) => handleEmploymentEntryFieldChange('nonFederalEmployment', entry._id, 'employerAddress.country', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter country"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {getEmploymentEntryCount('nonFederalEmployment') === 0 && (
                <p className="text-gray-500 text-center py-4">No non-federal employment entries added yet.</p>
              )}
              </div>
            )}

            {/* Self-Employment - Show only for Self-Employment type */}
            {section13Data.section13?.employmentType?.value === 'Self-Employment' && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    13A.3 - Self-Employment ({getEmploymentEntryCount('selfEmployment')})
                  </h4>
                  <button
                    type="button"
                    onClick={addSelfEmploymentEntry}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={getEmploymentEntryCount('selfEmployment') >= 4}
                  >
                    {getEmploymentEntryCount('selfEmployment') >= 4 ? 'Max Entries Reached' : 'Add Entry'}
                  </button>
                </div>

              {section13Data.section13.selfEmployment?.entries?.map((entry, index) => (
                <div key={entry._id} className="border border-gray-100 rounded-md p-4 mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-gray-800">Entry {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeSelfEmploymentEntry(entry._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={entry.businessName?.value || ''}
                        onChange={(e) => handleEmploymentEntryFieldChange('selfEmployment', entry._id, 'businessName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter business name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Type
                      </label>
                      <input
                        type="text"
                        value={entry.businessType?.value || ''}
                        onChange={(e) => handleEmploymentEntryFieldChange('selfEmployment', entry._id, 'businessType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter business type"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={entry.employmentDates?.fromDate?.value || ''}
                        onChange={(e) => handleEmploymentEntryFieldChange('selfEmployment', entry._id, 'employmentDates.fromDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={entry.employmentDates?.toDate?.value || ''}
                        onChange={(e) => handleEmploymentEntryFieldChange('selfEmployment', entry._id, 'employmentDates.toDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={entry.employmentDates?.present?.value}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={entry.employmentDates?.present?.value || false}
                        onChange={(e) => handleEmploymentEntryFieldChange('selfEmployment', entry._id, 'employmentDates.present', e.target.checked)}
                        className="mr-2"
                      />
                      Present (current employment)
                    </label>
                  </div>
                </div>
              ))}

              {getEmploymentEntryCount('selfEmployment') === 0 && (
                <p className="text-gray-500 text-center py-4">No self-employment entries added yet.</p>
              )}
              </div>
            )}

            {/* Unemployment - Show only for Unemployment type */}
            {section13Data.section13?.employmentType?.value === 'Unemployment' && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    13A.4 - Unemployment ({getEmploymentEntryCount('unemployment')})
                  </h4>
                  <button
                    type="button"
                    onClick={addUnemploymentEntry}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={getEmploymentEntryCount('unemployment') >= 4}
                  >
                    {getEmploymentEntryCount('unemployment') >= 4 ? 'Max Entries Reached' : 'Add Entry'}
                  </button>
                </div>

              {section13Data.section13.unemployment?.entries?.map((entry, index) => (
                <div key={entry._id} className="border border-gray-100 rounded-md p-4 mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-gray-800">Entry {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeUnemploymentEntry(entry._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={entry.unemploymentDates?.fromDate?.value || ''}
                        onChange={(e) => handleEmploymentEntryFieldChange('unemployment', entry._id, 'unemploymentDates.fromDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={entry.unemploymentDates?.toDate?.value || ''}
                        onChange={(e) => handleEmploymentEntryFieldChange('unemployment', entry._id, 'unemploymentDates.toDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Unemployment
                      </label>
                      <textarea
                        value={entry.reason?.value || ''}
                        onChange={(e) => handleEmploymentEntryFieldChange('unemployment', entry._id, 'reason', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Explain the reason for unemployment"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {getEmploymentEntryCount('unemployment') === 0 && (
                <p className="text-gray-500 text-center py-4">No unemployment entries added yet.</p>
              )}
              </div>
            )}
            
            {/* Add notice for multiple entries */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> You can add up to 4 entries total. Each entry represents a different employment period. 
                If you need to add a different type of employment, you'll need to complete the current entries first, 
                then start a new form section with a different employment type selected.
              </p>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <span className="text-red-500">*</span> Required fields
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              data-testid="submit-section-button"
            >
              Submit & Continue
            </button>

            <button
              type="button"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="validate-inputs-button"
              onClick={handleValidateInputs}
              disabled={isValidating}
            >
              {isValidating ? 'Validating...' : 'Validate Inputs'}
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
              data-testid="page-by-page-validation-button"
              onClick={async () => {
                // Generate PDF first
                const pdfResult = await sf86Form.generatePdf();
                if (pdfResult.success && pdfResult.pdfBytes) {
                  setPdfBytesForValidation(pdfResult.pdfBytes);
                  setShowFieldMappingValidator(true);
                } else {
                  alert('Failed to generate PDF for validation');
                }
              }}
            >
              Page-by-Page Validation
            </button>

            <button
              type="button"
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              data-testid="clear-section-button"
              onClick={handleReset}
            >
              Clear Section
            </button>
          </div>
        </div>
      </form>

      {/* Validation Results */}
      {validationResult && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Validation Results
          </h3>

          {validationResult.success ? (
            <div className="space-y-4">
              <div className="flex items-center text-green-600">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Validation completed successfully
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-600">Target Page</div>
                  <div className="text-lg font-bold text-blue-600">{validationResult.targetPage}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-600">Total Fields</div>
                  <div className="text-lg font-bold text-gray-900">{validationResult.totalFields}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-600">Fields with Values</div>
                  <div className="text-lg font-bold text-green-600">{validationResult.fieldsWithValues}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-600">Empty Fields</div>
                  <div className="text-lg font-bold text-red-600">{validationResult.fieldsEmpty}</div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <div>Processing time: {validationResult.processingTime}ms</div>
                <div>Data cleared: {validationResult.dataCleared ? 'Yes' : 'No'}</div>
                <div>Image generated: {validationResult.imageGenerated ? 'Yes' : 'No'}</div>
                <div>Fields extracted: {validationResult.fieldsExtracted ? 'Yes' : 'No'}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center text-red-600">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Validation failed
              </div>

              {validationResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validationResult.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Debug Information (Development Only) */}
      {typeof window !== 'undefined' && window.location.search.includes('debug=true') && (
        <details className="mt-6 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Section 13 Data:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(section13Data, null, 2)}
            </pre>
            <h4 className="text-xs font-medium text-gray-600 mt-4 mb-2">Validation Errors:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(errors, null, 2)}
            </pre>
          </div>
        </details>
      )}

      {/* Field Mapping Validator Modal */}
      {showFieldMappingValidator && pdfBytesForValidation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Section 13 Field Mapping Validation</h2>
              <button
                onClick={() => {
                  setShowFieldMappingValidator(false);
                  setPdfBytesForValidation(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              <FieldMappingValidator
                pdfBytes={pdfBytesForValidation}
                formData={section13Data}
                sectionNumber={13}
                startPage={17}
                endPage={33}
                onValidationComplete={(results) => {
                  console.log('Validation complete:', results);
                  // Handle completion
                }}
              />
            </div>
          </div>
        </div>
      )}
>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02
    </div>
  );
};

export default Section13Component;
