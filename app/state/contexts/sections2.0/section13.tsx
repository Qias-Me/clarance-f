/**
 * Section 13: Employment Activities - Context Provider (GOLD STANDARD)
 *
 * This is a GOLD STANDARD implementation for SF-86 Section 13, demonstrating
 * optimal patterns for DRY principles, performance optimization, and createDefaultSection compatibility.
 *
 * FIELD COUNT: TBD fields (to be validated against sections-references/section-13.json)
 *
 * Features:
 * - Enhanced section template with performance monitoring
 * - Standardized field operations and validation
 * - createDefaultSection compatibility
 * - Performance-optimized logging
 * - Memory-efficient state management
 * - Employment entry management with CRUD operations
 */

import type {
  Section13,
  Section13FieldUpdate,
  EmploymentValidationResult,
  Section13ValidationContext,
  EmploymentEntry,
  MilitaryEmploymentEntry,
  NonFederalEmploymentEntry,
  SelfEmploymentEntry,
  UnemploymentEntry,
  EmploymentEntryOperation
} from '../../../../api/interfaces/sections2.0/section13';
import {
  createDefaultSection13,
  updateSection13Field,
  createDefaultMilitaryEmploymentEntry,
  createDefaultNonFederalEmploymentEntry,
  createDefaultSelfEmploymentEntry,
  createDefaultUnemploymentEntry,
  formatEmploymentDate,
  calculateEmploymentDuration,
  EMPLOYMENT_TYPE_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  REASON_FOR_LEAVING_OPTIONS
} from '../../../../api/interfaces/sections2.0/section13';
import type { ValidationResult, ValidationError } from '../shared/base-interfaces';
import type { Field } from '../../../../api/interfaces/formDefinition2.0';
import { useSF86Form } from '../SF86FormContext';
import { useSection86FormIntegration } from '../shared/section-context-integration';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { cloneDeep } from 'lodash';

// ============================================================================
// FIELD FLATTENING FOR PDF GENERATION
// ============================================================================



// Enhanced Template configuration removed - now using direct integration approach

// ============================================================================
// SECTION 13 CONTEXT INTERFACE
// ============================================================================

export interface Section13ContextType {
  // Core section data and state
  sectionData: Section13;
  setSectionData: React.Dispatch<React.SetStateAction<Section13>>;
  isLoading: boolean;
  isDirty: boolean;

  // Save function for performance optimization
  saveToMainContext: () => void;

  // Validation
  validateSection: () => ValidationResult;
  // Section-specific computed values
  getEmploymentEntryCount: () => number;
  getTotalEmploymentYears: () => number;
  getCurrentEmployer: () => string | null;
  getEmploymentGaps: () => Array<{ start: string; end: string; duration: number }>;

  // Section-specific validation
  validateEmploymentEntry: (entryIndex: number) => EmploymentValidationResult;

  // Employment type management (removed duplicate)

  // Military employment (13A.1) management
  addMilitaryEmploymentEntry: () => void;
  removeMilitaryEmploymentEntry: (entryIndex: number) => void;
  updateMilitaryEmploymentEntry: (entryIndex: number, fieldPath: string, newValue: any) => void;
  getMilitaryEmploymentEntryCount: () => number;

  // Non-federal employment (13A.2) management
  addNonFederalEmploymentEntry: () => void;
  removeNonFederalEmploymentEntry: (entryIndex: number) => void;
  updateNonFederalEmploymentEntry: (entryIndex: number, fieldPath: string, newValue: any) => void;
  getNonFederalEmploymentEntryCount: () => number;

  // Self-employment (13A.3) management
  addSelfEmploymentEntry: () => void;
  removeSelfEmploymentEntry: (entryIndex: number) => void;
  updateSelfEmploymentEntry: (entryIndex: number, fieldPath: string, newValue: any) => void;
  getSelfEmploymentEntryCount: () => number;

  // Unemployment (13A.4) management
  addUnemploymentEntry: () => void;
  removeUnemploymentEntry: (entryIndex: number) => void;
  updateUnemploymentEntry: (entryIndex: number, fieldPath: string, newValue: any) => void;
  getUnemploymentEntryCount: () => number;

  // Employment entry management
  addEmploymentEntry: () => void;
  removeEmploymentEntry: (entryIndex: number) => void;
  moveEmploymentEntry: (fromIndex: number, toIndex: number) => void;
  duplicateEmploymentEntry: (entryIndex: number) => void;
  clearEmploymentEntry: (entryIndex: number) => void;
  updateEmploymentEntry: (entryIndex: number, fieldPath: string, value: any) => void;

  // Employment-specific field updates
  updateEmploymentFlag: (hasEmployment: "YES" | "NO") => void;
  updateGapsFlag: (hasGaps: "YES" | "NO") => void;
  updateGapExplanation: (explanation: string) => void;
  updateEmploymentTypeForEntry: (entryIndex: number, employmentType: string) => void;
  updateEmploymentType: (employmentType: string) => void;
  getActiveEmploymentType: () => string | null;
  updateEmploymentDates: (entryIndex: number, fromDate: string, toDate: string, present?: boolean) => void;
  updateEmployerAddress: (entryIndex: number, address: Partial<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>) => void;
  updateSupervisorInfo: (entryIndex: number, supervisor: Partial<{
    name: string;
    title: string;
    email: string;
    phone: string;
    canContact: "YES" | "NO";
    contactRestrictions: string;
  }>) => void;

  // Federal employment management
  updateFederalEmploymentFlag: (hasFederalEmployment: "YES" | "NO") => void;
  updateSecurityClearance: (hasSecurityClearance: "YES" | "NO") => void;
  updateClearanceInfo: (clearanceInfo: Partial<{
    level: string;
    date: string;
    investigationDate: string;
    polygraphDate: string;
  }>) => void;

  // Utility functions
  formatEmploymentDate: (date: string, format?: 'MM/YYYY' | 'MM/DD/YYYY') => string;
  calculateEmploymentDuration: (entryIndex: number) => number;
  getEmploymentTypeOptions: () => string[];
  getEmploymentStatusOptions: () => string[];
  getReasonForLeavingOptions: () => string[];

}

// ============================================================================
// SECTION 13 CONTEXT
// ============================================================================

const Section13Context = createContext<Section13ContextType | undefined>(undefined);

// ============================================================================
// SECTION 13 PROVIDER
// ============================================================================

export const Section13Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // console.log('🔄 Section13Provider: Initializing with performance optimization...');

  // Initialize section data with complete field mapping verification
  const [sectionData, setSectionData] = useState<Section13>(() => {
    console.log('🔄 Section13: Initializing section data');

    // Import and run field mapping verification
    import('./section13-field-mapping').then(({ verifySection13FieldMapping }) => {
      const verification = verifySection13FieldMapping();
      console.log('📊 Section13: Field mapping verification results:', verification);

      if (verification.success) {
        console.log('✅ Section13: All field mappings verified successfully');
      } else {
        console.warn('⚠️ Section13: Field mapping verification issues detected');
        console.warn(`   Missing fields: ${verification.missingFields.length}`);
        console.warn(`   Total fields: ${verification.totalFields}/1086`);
      }
    }).catch(error => {
      console.warn('❌ Section13: Failed to load field mapping verification:', error);
    });

    return createDefaultSection13(true);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Get SF86 form context for save operations only
  const sf86Form = useSF86Form();



  // Field update function
  const updateFieldValue = useCallback((fieldPath: string, newValue: any) => {
    console.log(`🔍 Section13: updateFieldValue called with path=${fieldPath}, value=`, newValue);

    setSectionData(prevData => {
      // Extract entryIndex from fieldPath if it's an entry field
      let entryIndex: number | undefined;
      const entryMatch = fieldPath.match(/section13\.entries\[(\d+)\]\.(.+)/) ||
                        fieldPath.match(/entries\[(\d+)\]\.(.+)/);

      if (entryMatch) {
        entryIndex = parseInt(entryMatch[1]);
        console.log(`🔍 Section13: Extracted entryIndex ${entryIndex} from fieldPath ${fieldPath}`);
      }

      const updatedData = updateSection13Field(prevData, { fieldPath, newValue, entryIndex });
      setIsDirty(true);
      return updatedData;
    });
  }, []);

  // Changes tracking
  const getChanges = useCallback(() => {
    return {
      hasChanges: isDirty,
      changedFields: [],
      summary: `Section 13 has ${isDirty ? 'unsaved' : 'no'} changes`
    };
  }, [isDirty]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Integration with main form context using Section 29 pattern
  // Note: integration variable is used internally by the hook for registration
  const integration = useSection86FormIntegration(
    'section13',
    'Section 13: Employment Activities',
    sectionData,
    setSectionData,
    () => ({ isValid: validateSection().isValid, errors: validateSection().errors, warnings: validateSection().warnings }),
    getChanges,
    updateFieldValue // Pass Section 13's updateFieldValue function to integration
  );

  // Legacy save function for backward compatibility (now just calls integration)
  const saveToMainContext = useCallback(() => {
    console.log('🔄 Section13: Legacy saveToMainContext called - using integration instead');
    // The integration hook handles automatic saving, so this is now a no-op
    // but kept for backward compatibility with existing components
  }, []);

  // ============================================================================
  // EMPLOYMENT-SPECIFIC FUNCTIONS
  // ============================================================================

  const getEmploymentEntryCount = useCallback((): number => {
    // Count all employment entries across all subsections for comprehensive total
    const militaryCount = sectionData.section13?.militaryEmployment?.entries?.length || 0;
    const nonFederalCount = sectionData.section13?.nonFederalEmployment?.entries?.length || 0;
    const selfEmploymentCount = sectionData.section13?.selfEmployment?.entries?.length || 0;
    const unemploymentCount = sectionData.section13?.unemployment?.entries?.length || 0;
    const genericCount = sectionData.section13?.entries?.length || 0;

    const totalCount = militaryCount + nonFederalCount + selfEmploymentCount + unemploymentCount + genericCount;
    console.log(`📊 Section13: Total employment entries: ${totalCount} (Military: ${militaryCount}, Non-Federal: ${nonFederalCount}, Self: ${selfEmploymentCount}, Unemployment: ${unemploymentCount}, Generic: ${genericCount})`);

    return totalCount;
  }, [
    sectionData.section13?.militaryEmployment?.entries?.length,
    sectionData.section13?.nonFederalEmployment?.entries?.length,
    sectionData.section13?.selfEmployment?.entries?.length,
    sectionData.section13?.unemployment?.entries?.length,
    sectionData.section13?.entries?.length
  ]);

  const getTotalEmploymentYears = useCallback((): number => {
    return sectionData.section13.entries.reduce((total: number, entry: EmploymentEntry) => {
      const duration = calculateEmploymentDuration(
        entry.employmentDates.fromDate.value,
        entry.employmentDates.toDate.value || new Date().toISOString()
      );
      return total + Math.floor(duration / 12); // Convert months to years
    }, 0);
  }, [sectionData.section13.entries]);

  const getCurrentEmployer = useCallback((): string | null => {
    const currentEntry = sectionData.section13.entries.find(
      (entry: EmploymentEntry) => entry.employmentDates.present.value
    );
    return currentEntry ? currentEntry.employerName.value : null;
  }, [sectionData.section13.entries]);

  const getEmploymentGaps = useCallback((): Array<{ start: string; end: string; duration: number }> => {
    const entries = [...sectionData.section13.entries]
      .sort((a: EmploymentEntry, b: EmploymentEntry) => new Date(a.employmentDates.fromDate.value).getTime() - new Date(b.employmentDates.fromDate.value).getTime());

    const gaps: Array<{ start: string; end: string; duration: number }> = [];

    for (let i = 0; i < entries.length - 1; i++) {
      const currentEnd = new Date(entries[i].employmentDates.toDate.value);
      const nextStart = new Date(entries[i + 1].employmentDates.fromDate.value);

      if (nextStart > currentEnd) {
        gaps.push({
          start: entries[i].employmentDates.toDate.value,
          end: entries[i + 1].employmentDates.fromDate.value,
          duration: Math.ceil((nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
        });
      }
    }

    return gaps;
  }, [sectionData.section13.entries]);

  // Employment type management (removed duplicate - using the one below)

  // Military employment (13A.1) management functions
  const addMilitaryEmploymentEntry = useCallback(() => {
    console.log('🔄 Section13: Adding new military employment entry');
    setSectionData(prevData => {
      const newEntry = createDefaultMilitaryEmploymentEntry(Date.now());
      const updated = cloneDeep(prevData);
      updated.section13.militaryEmployment.entries = [...updated.section13.militaryEmployment.entries, newEntry];
      setIsDirty(true);
      return updated;
    });
  }, []);

  const removeMilitaryEmploymentEntry = useCallback((entryIndex: number) => {
    console.log(`🔄 Section13: Removing military employment entry at index ${entryIndex}`);
    setSectionData(prevData => {
      const updated = cloneDeep(prevData);
      updated.section13.militaryEmployment.entries = updated.section13.militaryEmployment.entries.filter((_, index) => index !== entryIndex);
      setIsDirty(true);
      return updated;
    });
  }, []);

  const updateMilitaryEmploymentEntry = useCallback((entryIndex: number, fieldPath: string, newValue: any) => {
    console.log(`🔄 Section13: Updating military employment entry ${entryIndex}, field ${fieldPath}`);
    updateFieldValue(`section13.militaryEmployment.entries[${entryIndex}].${fieldPath}`, newValue);
  }, [updateFieldValue]);

  const getMilitaryEmploymentEntryCount = useCallback(() => {
    return sectionData.section13?.militaryEmployment?.entries?.length || 0;
  }, [sectionData]);

  // Non-federal employment (13A.2) management functions
  const addNonFederalEmploymentEntry = useCallback(() => {
    console.log('🔄 Section13: Adding new non-federal employment entry');
    setSectionData(prevData => {
      const newEntry = createDefaultNonFederalEmploymentEntry(Date.now());
      const updated = cloneDeep(prevData);
      updated.section13.nonFederalEmployment.entries = [...updated.section13.nonFederalEmployment.entries, newEntry];
      setIsDirty(true);
      return updated;
    });
  }, []);

  const removeNonFederalEmploymentEntry = useCallback((entryIndex: number) => {
    console.log(`🔄 Section13: Removing non-federal employment entry at index ${entryIndex}`);
    setSectionData(prevData => {
      const updated = cloneDeep(prevData);
      updated.section13.nonFederalEmployment.entries = updated.section13.nonFederalEmployment.entries.filter((_, index) => index !== entryIndex);
      setIsDirty(true);
      return updated;
    });
  }, []);

  const updateNonFederalEmploymentEntry = useCallback((entryIndex: number, fieldPath: string, newValue: any) => {
    console.log(`🔄 Section13: Updating non-federal employment entry ${entryIndex}, field ${fieldPath}`);
    updateFieldValue(`section13.nonFederalEmployment.entries[${entryIndex}].${fieldPath}`, newValue);
  }, [updateFieldValue]);

  const getNonFederalEmploymentEntryCount = useCallback(() => {
    return sectionData.section13?.nonFederalEmployment?.entries?.length || 0;
  }, [sectionData]);

  // Self-employment (13A.3) management functions
  const addSelfEmploymentEntry = useCallback(() => {
    console.log('🔄 Section13: Adding new self-employment entry');
    setSectionData(prevData => {
      const newEntry = createDefaultSelfEmploymentEntry(Date.now());
      const updated = cloneDeep(prevData);
      updated.section13.selfEmployment.entries = [...updated.section13.selfEmployment.entries, newEntry];
      setIsDirty(true);
      return updated;
    });
  }, []);

  const removeSelfEmploymentEntry = useCallback((entryIndex: number) => {
    console.log(`🔄 Section13: Removing self-employment entry at index ${entryIndex}`);
    setSectionData(prevData => {
      const updated = cloneDeep(prevData);
      updated.section13.selfEmployment.entries = updated.section13.selfEmployment.entries.filter((_, index) => index !== entryIndex);
      setIsDirty(true);
      return updated;
    });
  }, []);

  const updateSelfEmploymentEntry = useCallback((entryIndex: number, fieldPath: string, newValue: any) => {
    console.log(`🔄 Section13: Updating self-employment entry ${entryIndex}, field ${fieldPath}`);
    updateFieldValue(`section13.selfEmployment.entries[${entryIndex}].${fieldPath}`, newValue);
  }, [updateFieldValue]);

  const getSelfEmploymentEntryCount = useCallback(() => {
    return sectionData.section13?.selfEmployment?.entries?.length || 0;
  }, [sectionData]);

  // Unemployment (13A.4) management functions
  const addUnemploymentEntry = useCallback(() => {
    console.log('🔄 Section13: Adding new unemployment entry');
    setSectionData(prevData => {
      const newEntry = createDefaultUnemploymentEntry(Date.now());
      const updated = cloneDeep(prevData);
      updated.section13.unemployment.entries = [...updated.section13.unemployment.entries, newEntry];
      setIsDirty(true);
      return updated;
    });
  }, []);

  const removeUnemploymentEntry = useCallback((entryIndex: number) => {
    console.log(`🔄 Section13: Removing unemployment entry at index ${entryIndex}`);
    setSectionData(prevData => {
      const updated = cloneDeep(prevData);
      updated.section13.unemployment.entries = updated.section13.unemployment.entries.filter((_, index) => index !== entryIndex);
      setIsDirty(true);
      return updated;
    });
  }, []);

  const updateUnemploymentEntry = useCallback((entryIndex: number, fieldPath: string, newValue: any) => {
    console.log(`🔄 Section13: Updating unemployment entry ${entryIndex}, field ${fieldPath}`);
    updateFieldValue(`section13.unemployment.entries[${entryIndex}].${fieldPath}`, newValue);
  }, [updateFieldValue]);

  const getUnemploymentEntryCount = useCallback(() => {
    return sectionData.section13?.unemployment?.entries?.length || 0;
  }, [sectionData]);

  // Legacy employment entry management (for backward compatibility)
  const addEmploymentEntry = useCallback(() => {
    console.log('🔄 Section13: Adding new employment entry (legacy - using non-federal as default)');
    console.log('💡 Section13: Consider using specific employment type functions for better type safety');

    // Create a default non-federal employment entry (most common type)
    // This provides backward compatibility while maintaining functionality
    setSectionData(prevData => {
      const newEntry = createDefaultNonFederalEmploymentEntry(Date.now());
      const updated = cloneDeep(prevData);

      // Add to both the specific non-federal entries and generic entries for compatibility
      updated.section13.nonFederalEmployment.entries = [...updated.section13.nonFederalEmployment.entries, newEntry];

      // Also add to generic entries array for legacy compatibility
      updated.section13.entries = [...updated.section13.entries, newEntry as any];

      setIsDirty(true);
      console.log('✅ Section13: Successfully added new employment entry (non-federal type)');
      return updated;
    });
  }, []);

  const removeEmploymentEntry = useCallback((entryIndex: number) => {
    console.log(`🔄 Section13: Removing employment entry at index ${entryIndex}`);
    setSectionData(prevData => {
      const updated = cloneDeep(prevData);
      updated.section13.entries = updated.section13.entries.filter((_: EmploymentEntry, index: number) => index !== entryIndex);
      setIsDirty(true);
      return updated;
    });
  }, []);

  const updateEmploymentEntry = useCallback((entryIndex: number, fieldPath: string, value: any) => {
    console.log(`🔄 Section13: Updating employment entry ${entryIndex}, field ${fieldPath}, value:`, value);
    updateFieldValue(`section13.entries[${entryIndex}].${fieldPath}`, value);
  }, [updateFieldValue]);

  // Employment flag updates
  const updateEmploymentFlag = useCallback((hasEmployment: "YES" | "NO") => {
    console.log(`🔄 Section13: Updating employment flag to ${hasEmployment}`);
    updateFieldValue('section13.hasEmployment', hasEmployment);
  }, [updateFieldValue]);

  const updateGapsFlag = useCallback((hasGaps: "YES" | "NO") => {
    console.log(`🔄 Section13: Updating gaps flag to ${hasGaps}`);
    updateFieldValue('section13.hasGaps', hasGaps);
  }, [updateFieldValue]);

  const updateGapExplanation = useCallback((explanation: string) => {
    console.log(`🔄 Section13: Updating gap explanation`);
    updateFieldValue('section13.gapExplanation', explanation);
  }, [updateFieldValue]);

  const updateEmploymentType = useCallback((employmentType: string) => {
    console.log(`🔄 Section13: Updating employment type: ${employmentType}`);
    updateFieldValue('section13.employmentType', employmentType);
  }, [updateFieldValue]);

  const getActiveEmploymentType = useCallback((): string | null => {
    const currentType = sectionData.section13.employmentType?.value;
    console.log(`🔍 Section13: Getting active employment type: ${currentType || 'none'}`);
    return currentType || null;
  }, [sectionData.section13.employmentType]);


  // Utility functions
  const getEmploymentTypeOptions = useCallback(() => EMPLOYMENT_TYPE_OPTIONS, []);
  const getEmploymentStatusOptions = useCallback(() => EMPLOYMENT_STATUS_OPTIONS, []);
  const getReasonForLeavingOptions = useCallback(() => REASON_FOR_LEAVING_OPTIONS, []);

  // TODO: Field mapping verification functions (1,086 fields) will be implemented later
  // when SECTION13_VERIFICATION and SECTION13_COMPLETE_FIELD_MAPPINGS are available

  // Utility function for date formatting
  const formatEmploymentDate = useCallback((date: string, format: 'MM/YYYY' | 'MM/DD/YYYY' = 'MM/YYYY'): string => {
    if (!date) return '';

    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return date; // Return original if invalid

      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear().toString();
      const day = dateObj.getDate().toString().padStart(2, '0');

      return format === 'MM/DD/YYYY' ? `${month}/${day}/${year}` : `${month}/${year}`;
    } catch {
      return date; // Return original if parsing fails
    }
  }, []);

  // Validation function
  const validateSection = useCallback((): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Basic validation - can be expanded later
    if (sectionData.section13.hasEmployment.value === "YES" && sectionData.section13.entries.length === 0) {
      errors.push({
        field: 'section13.entries',
        message: "At least one employment entry is required when employment is indicated",
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [sectionData]);

  // Placeholder functions for interface compliance
  const moveEmploymentEntry = useCallback((fromIndex: number, toIndex: number) => {
    console.log(`🔄 Section13: Moving employment entry from ${fromIndex} to ${toIndex}`);
    // Implementation would go here
  }, []);

  const duplicateEmploymentEntry = useCallback((entryIndex: number) => {
    console.log(`🔄 Section13: Duplicating employment entry ${entryIndex}`);
    // Implementation would go here
  }, []);

  const clearEmploymentEntry = useCallback((entryIndex: number) => {
    console.log(`🔄 Section13: Clearing employment entry ${entryIndex}`);
    // Implementation would go here
  }, []);

  const updateEmploymentTypeFunc = useCallback((entryIndex: number, employmentType: string) => {
    updateEmploymentEntry(entryIndex, 'employmentType', employmentType);
  }, [updateEmploymentEntry]);

  const updateEmploymentDates = useCallback((entryIndex: number, fromDate: string, toDate: string, present?: boolean) => {
    updateEmploymentEntry(entryIndex, 'employmentDates.fromDate', fromDate);
    updateEmploymentEntry(entryIndex, 'employmentDates.toDate', toDate);
    if (present !== undefined) {
      updateEmploymentEntry(entryIndex, 'employmentDates.present', present);
    }
  }, [updateEmploymentEntry]);

  const updateEmployerAddress = useCallback((entryIndex: number, address: any) => {
    Object.entries(address).forEach(([key, value]) => {
      updateEmploymentEntry(entryIndex, `employerAddress.${key}`, value);
    });
  }, [updateEmploymentEntry]);

  const updateSupervisorInfo = useCallback((entryIndex: number, supervisor: any) => {
    Object.entries(supervisor).forEach(([key, value]) => {
      updateEmploymentEntry(entryIndex, `supervisor.${key}`, value);
    });
  }, [updateEmploymentEntry]);

  const updateFederalEmploymentFlag = useCallback((hasFederalEmployment: "YES" | "NO") => {
    updateFieldValue('section13.federalInfo.hasFederalEmployment', hasFederalEmployment);
  }, [updateFieldValue]);

  const updateSecurityClearance = useCallback((hasSecurityClearance: "YES" | "NO") => {
    updateFieldValue('section13.federalInfo.securityClearance', hasSecurityClearance);
  }, [updateFieldValue]);

  const updateClearanceInfo = useCallback((clearanceInfo: any) => {
    Object.entries(clearanceInfo).forEach(([key, value]) => {
      updateFieldValue(`section13.federalInfo.${key}`, value);
    });
  }, [updateFieldValue]);

  const calculateEmploymentDurationFunc = useCallback((entryIndex: number): number => {
    if (entryIndex >= 0 && entryIndex < sectionData.section13.entries.length) {
      const entry = sectionData.section13.entries[entryIndex];
      return calculateEmploymentDuration(
        entry.employmentDates.fromDate.value,
        entry.employmentDates.toDate.value || new Date().toISOString()
      );
    }
    return 0;
  }, [sectionData.section13.entries]);

  // Section-specific validation function
  const validateEmploymentEntry = useCallback((entryIndex: number): EmploymentValidationResult => {
    // Get current data fresh to avoid stale closure
    const currentData = sectionData;

    // Check if entry index is valid
    if (entryIndex < 0 || !currentData?.section13?.entries || entryIndex >= currentData.section13.entries.length) {
      return {
        isValid: false,
        errors: [`Entry ${entryIndex + 1} does not exist`],
        warnings: []
      };
    }

    const entry = currentData.section13.entries[entryIndex];
    if (!entry) {
      return {
        isValid: false,
        errors: [`Entry ${entryIndex + 1} is not properly initialized`],
        warnings: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!entry.employerName?.value?.trim()) {
      errors.push('Employer name is required');
    }

    if (!entry.positionTitle?.value?.trim()) {
      errors.push('Position title is required');
    }

    // Validate employment dates
    if (!entry.employmentDates?.fromDate?.value?.trim()) {
      errors.push('Employment start date is required');
    }

    if (!entry.employmentDates?.present?.value && !entry.employmentDates?.toDate?.value?.trim()) {
      errors.push('Employment end date is required when not currently employed');
    }

    // Validate date format and logic
    if (entry.employmentDates?.fromDate?.value && entry.employmentDates?.toDate?.value) {
      const fromDate = new Date(entry.employmentDates.fromDate.value);
      const toDate = new Date(entry.employmentDates.toDate.value);

      if (fromDate > toDate) {
        errors.push('Employment start date cannot be after end date');
      }

      if (toDate > new Date()) {
        warnings.push('Employment end date is in the future');
      }
    }

    // Validate supervisor information if required
    if (!entry.supervisor?.name?.value?.trim()) {
      errors.push('Supervisor name is required');
    }

    if (!entry.supervisor?.title?.value?.trim()) {
      errors.push('Supervisor title is required');
    }

    // Validate address information
    if (!entry.employerAddress?.street?.value?.trim()) {
      errors.push('Employer street address is required');
    }

    if (!entry.employerAddress?.city?.value?.trim()) {
      errors.push('Employer city is required');
    }

    if (!entry.employerAddress?.state?.value?.trim()) {
      errors.push('Employer state is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [sectionData]);

  // Context value
  const contextValue: Section13ContextType = {
    sectionData,
    setSectionData,
    isLoading,
    isDirty,
    saveToMainContext,
    validateSection,
    validateEmploymentEntry,
    getEmploymentEntryCount,
    getTotalEmploymentYears,
    getCurrentEmployer,
    getEmploymentGaps,

    // Employment type management
    updateEmploymentType,
    getActiveEmploymentType,

    // Military employment (13A.1) management
    addMilitaryEmploymentEntry,
    removeMilitaryEmploymentEntry,
    updateMilitaryEmploymentEntry,
    getMilitaryEmploymentEntryCount,

    // Non-federal employment (13A.2) management
    addNonFederalEmploymentEntry,
    removeNonFederalEmploymentEntry,
    updateNonFederalEmploymentEntry,
    getNonFederalEmploymentEntryCount,

    // Self-employment (13A.3) management
    addSelfEmploymentEntry,
    removeSelfEmploymentEntry,
    updateSelfEmploymentEntry,
    getSelfEmploymentEntryCount,

    // Unemployment (13A.4) management
    addUnemploymentEntry,
    removeUnemploymentEntry,
    updateUnemploymentEntry,
    getUnemploymentEntryCount,

    // Employment entry management
    addEmploymentEntry,
    removeEmploymentEntry,
    moveEmploymentEntry,
    duplicateEmploymentEntry,
    clearEmploymentEntry,
    updateEmploymentEntry,

    // Employment-specific field updates
    updateEmploymentFlag,
    updateGapsFlag,
    updateGapExplanation,
    updateEmploymentTypeForEntry: updateEmploymentTypeFunc,
    updateEmploymentDates,
    updateEmployerAddress,
    updateSupervisorInfo,

    // Federal employment management
    updateFederalEmploymentFlag,
    updateSecurityClearance,
    updateClearanceInfo,

    // Utility functions
    formatEmploymentDate,
    calculateEmploymentDuration: calculateEmploymentDurationFunc,
    getEmploymentTypeOptions,
    getEmploymentStatusOptions,
    getReasonForLeavingOptions
  };

  return (
    <Section13Context.Provider value={contextValue}>
      {children}
    </Section13Context.Provider>
  );
};

// ============================================================================
// SECTION 13 HOOK
// ============================================================================

export const useSection13 = (): Section13ContextType => {
  console.log('🔄 useSection13: Hook called from component');
  const context = useContext(Section13Context);

  if (!context) {
    throw new Error('useSection13 must be used within a Section13Provider');
  }

  console.log('🔄 useSection13: Context data available:', {
    sectionId: context.sectionData._id,
    hasData: !!context.sectionData,
    hasEmployment: context.sectionData.section13.hasEmployment.value,
    entryCount: context.sectionData.section13.entries.length
  });

  return context;
};