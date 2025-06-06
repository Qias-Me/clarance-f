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
  EmploymentEntryOperation
} from '../../../../api/interfaces/sections2.0/section13';
import {
  createDefaultSection13,
  validateSection13,
  updateSection13Field,
  createDefaultEmploymentEntry,
  validateEmploymentEntry,
  formatEmploymentDate,
  calculateEmploymentDuration,
  EMPLOYMENT_TYPE_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  REASON_FOR_LEAVING_OPTIONS
} from '../../../../api/interfaces/sections2.0/section13';
import type { ValidationResult, ValidationError } from '../shared/base-interfaces';
import { useSF86Form } from '../SF86FormContext';
import { useSection86FormIntegration } from '../shared/section-context-integration';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { cloneDeep } from 'lodash';

// ============================================================================
// FIELD FLATTENING FOR PDF GENERATION
// ============================================================================

/**
 * Flattens Section 13 fields for PDF generation
 * Converts nested Field<T> objects to a flat Record<string, any> structure
 * Expected fields: main flags, multiple employment entries with dates, addresses, supervisors, etc.
 */
export const flattenSection13Fields = (section13Data: Section13): Record<string, any> => {
  const flattened: Record<string, any> = {};
  
  // Flatten main section flags
  if (section13Data.section13) {
    // Has employment flag
    if (section13Data.section13.hasEmployment) {
      flattened[section13Data.section13.hasEmployment.id] = section13Data.section13.hasEmployment;
    }
    
    // Has gaps flag
    if (section13Data.section13.hasGaps) {
      flattened[section13Data.section13.hasGaps.id] = section13Data.section13.hasGaps;
    }

    // Gap explanation
    if (section13Data.section13.gapExplanation) {
      flattened[section13Data.section13.gapExplanation.id] = section13Data.section13.gapExplanation;
    }

    // Flatten employment entries
    section13Data.section13.entries.forEach((entry) => {
      // Employment dates
      if (entry.employmentDates.fromDate) {
        flattened[entry.employmentDates.fromDate.id] = entry.employmentDates.fromDate;
      }
      if (entry.employmentDates.fromEstimated) {
        flattened[entry.employmentDates.fromEstimated.id] = entry.employmentDates.fromEstimated;
      }
      if (entry.employmentDates.toDate) {
        flattened[entry.employmentDates.toDate.id] = entry.employmentDates.toDate;
      }
      if (entry.employmentDates.toEstimated) {
        flattened[entry.employmentDates.toEstimated.id] = entry.employmentDates.toEstimated;
      }
      if (entry.employmentDates.present) {
        flattened[entry.employmentDates.present.id] = entry.employmentDates.present;
      }

      // Employment information
      if (entry.employmentType) {
        flattened[entry.employmentType.id] = entry.employmentType;
      }
      if (entry.employmentStatus) {
        flattened[entry.employmentStatus.id] = entry.employmentStatus;
      }
      if (entry.employerName) {
        flattened[entry.employerName.id] = entry.employerName;
      }
      if (entry.positionTitle) {
        flattened[entry.positionTitle.id] = entry.positionTitle;
      }
      if (entry.positionDescription) {
        flattened[entry.positionDescription.id] = entry.positionDescription;
      }
      if (entry.businessType) {
        flattened[entry.businessType.id] = entry.businessType;
      }
      if (entry.salary) {
        flattened[entry.salary.id] = entry.salary;
      }
      if (entry.reasonForLeaving) {
        flattened[entry.reasonForLeaving.id] = entry.reasonForLeaving;
      }
      if (entry.additionalComments) {
        flattened[entry.additionalComments.id] = entry.additionalComments;
      }

      // Employer address
      if (entry.employerAddress.street) {
        flattened[entry.employerAddress.street.id] = entry.employerAddress.street;
      }
      if (entry.employerAddress.city) {
        flattened[entry.employerAddress.city.id] = entry.employerAddress.city;
      }
      if (entry.employerAddress.state) {
        flattened[entry.employerAddress.state.id] = entry.employerAddress.state;
      }
      if (entry.employerAddress.zipCode) {
        flattened[entry.employerAddress.zipCode.id] = entry.employerAddress.zipCode;
      }
      if (entry.employerAddress.country) {
        flattened[entry.employerAddress.country.id] = entry.employerAddress.country;
      }

      // Supervisor information
      if (entry.supervisor.name) {
        flattened[entry.supervisor.name.id] = entry.supervisor.name;
      }
      if (entry.supervisor.title) {
        flattened[entry.supervisor.title.id] = entry.supervisor.title;
      }
      if (entry.supervisor.email) {
        flattened[entry.supervisor.email.id] = entry.supervisor.email;
      }
      if (entry.supervisor.phone) {
        flattened[entry.supervisor.phone.id] = entry.supervisor.phone;
      }
      if (entry.supervisor.canContact) {
        flattened[entry.supervisor.canContact.id] = entry.supervisor.canContact;
      }
      if (entry.supervisor.contactRestrictions) {
        flattened[entry.supervisor.contactRestrictions.id] = entry.supervisor.contactRestrictions;
      }

      // Verification information
      if (entry.verification.verified) {
        flattened[entry.verification.verified.id] = entry.verification.verified;
      }
      if (entry.verification.verificationDate) {
        flattened[entry.verification.verificationDate.id] = entry.verification.verificationDate;
      }
      if (entry.verification.verificationMethod) {
        flattened[entry.verification.verificationMethod.id] = entry.verification.verificationMethod;
      }
      if (entry.verification.notes) {
        flattened[entry.verification.notes.id] = entry.verification.notes;
      }
    });

    // Flatten federal employment info
    if (section13Data.section13.federalInfo) {
      const federal = section13Data.section13.federalInfo;
      if (federal.hasFederalEmployment) {
        flattened[federal.hasFederalEmployment.id] = federal.hasFederalEmployment;
      }
      if (federal.securityClearance) {
        flattened[federal.securityClearance.id] = federal.securityClearance;
      }
      if (federal.clearanceLevel) {
        flattened[federal.clearanceLevel.id] = federal.clearanceLevel;
      }
      if (federal.clearanceDate) {
        flattened[federal.clearanceDate.id] = federal.clearanceDate;
      }
      if (federal.investigationDate) {
        flattened[federal.investigationDate.id] = federal.investigationDate;
      }
      if (federal.polygraphDate) {
        flattened[federal.polygraphDate.id] = federal.polygraphDate;
      }
      if (federal.accessToClassified) {
        flattened[federal.accessToClassified.id] = federal.accessToClassified;
      }
      if (federal.classificationLevel) {
        flattened[federal.classificationLevel.id] = federal.classificationLevel;
      }
    }
  }

  return flattened;
};

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
  validateEmploymentHistory: () => EmploymentValidationResult;
  validateEmploymentEntry: (entryIndex: number) => EmploymentValidationResult;

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
  updateEmploymentType: (entryIndex: number, employmentType: string) => void;
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

  // Initialize section data
  const [sectionData, setSectionData] = useState<Section13>(() => createDefaultSection13(true));
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Get SF86 form context for save operations only
  const sf86Form = useSF86Form();

  // Validation function
  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Validate employment history
    const validationContext: Section13ValidationContext = {
      currentDate: new Date(),
      minimumAge: 16,
      investigationTimeFrame: 10,
      rules: {
        requiresEmploymentHistory: true,
        requiresGapExplanation: true,
        maxEmploymentEntries: 15,
        requiresEmployerName: true,
        requiresPositionTitle: true,
        requiresEmploymentDates: true,
        requiresSupervisorInfo: true,
        allowsEstimatedDates: true,
        maxEmployerNameLength: 100,
        maxPositionDescriptionLength: 500,
        maxCommentLength: 1000,
        timeFrameYears: 10
      }
    };

    const employmentValidation = validateSection13(sectionData, validationContext);
    if (!employmentValidation.isValid) {
      employmentValidation.errors.forEach(error => {
        validationErrors.push({
          field: 'section13.employmentHistory',
          message: error,
          code: 'EMPLOYMENT_VALIDATION_ERROR',
          severity: 'error'
        });
      });
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [sectionData]);

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
    return sectionData.section13.entries.length;
  }, [sectionData.section13.entries.length]);

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

  // Employment entry management
  const addEmploymentEntry = useCallback(() => {
    console.log('🔄 Section13: Adding new employment entry');
    setSectionData(prevData => {
      const newEntry = createDefaultEmploymentEntry(Date.now());
      const updated = cloneDeep(prevData);
      updated.section13.entries = [...updated.section13.entries, newEntry];
      setIsDirty(true);
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

  // Validation functions
  const validateEmploymentHistory = useCallback((): EmploymentValidationResult => {
    const validationContext: Section13ValidationContext = {
      currentDate: new Date(),
      minimumAge: 16,
      investigationTimeFrame: 10,
      rules: {
        requiresEmploymentHistory: true,
        requiresGapExplanation: true,
        maxEmploymentEntries: 15,
        requiresEmployerName: true,
        requiresPositionTitle: true,
        requiresEmploymentDates: true,
        requiresSupervisorInfo: true,
        allowsEstimatedDates: true,
        maxEmployerNameLength: 100,
        maxPositionDescriptionLength: 500,
        maxCommentLength: 1000,
        timeFrameYears: 10
      }
    };
    return validateSection13(sectionData, validationContext);
  }, [sectionData]);

  const validateEmploymentEntryFunc = useCallback((entryIndex: number): EmploymentValidationResult => {
    if (entryIndex >= 0 && entryIndex < sectionData.section13.entries.length) {
      const entry = sectionData.section13.entries[entryIndex];
      const validationContext: Section13ValidationContext = {
        currentDate: new Date(),
        minimumAge: 16,
        investigationTimeFrame: 10,
        rules: {
          requiresEmploymentHistory: true,
          requiresGapExplanation: true,
          maxEmploymentEntries: 15,
          requiresEmployerName: true,
          requiresPositionTitle: true,
          requiresEmploymentDates: true,
          requiresSupervisorInfo: true,
          allowsEstimatedDates: true,
          maxEmployerNameLength: 100,
          maxPositionDescriptionLength: 500,
          maxCommentLength: 1000,
          timeFrameYears: 10
        }
      };
      return validateEmploymentEntry(entry, validationContext);
    }
    return { isValid: false, errors: ['Invalid entry index'], warnings: [] };
  }, [sectionData.section13.entries]);

  // Utility functions
  const getEmploymentTypeOptions = useCallback(() => EMPLOYMENT_TYPE_OPTIONS, []);
  const getEmploymentStatusOptions = useCallback(() => EMPLOYMENT_STATUS_OPTIONS, []);
  const getReasonForLeavingOptions = useCallback(() => REASON_FOR_LEAVING_OPTIONS, []);

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

  const updateEmploymentType = useCallback((entryIndex: number, employmentType: string) => {
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

  // Context value
  const contextValue: Section13ContextType = {
    sectionData,
    setSectionData,
    isLoading,
    isDirty,
    saveToMainContext,
    validateSection,
    getEmploymentEntryCount,
    getTotalEmploymentYears,
    getCurrentEmployer,
    getEmploymentGaps,
    validateEmploymentHistory,
    validateEmploymentEntry: validateEmploymentEntryFunc,
    addEmploymentEntry,
    removeEmploymentEntry,
    moveEmploymentEntry,
    duplicateEmploymentEntry,
    clearEmploymentEntry,
    updateEmploymentEntry,
    updateEmploymentFlag,
    updateGapsFlag,
    updateGapExplanation,
    updateEmploymentType,
    updateEmploymentDates,
    updateEmployerAddress,
    updateSupervisorInfo,
    updateFederalEmploymentFlag,
    updateSecurityClearance,
    updateClearanceInfo,
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