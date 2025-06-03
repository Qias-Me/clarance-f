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
import {
  createEnhancedSectionContext,
  StandardFieldOperations,
  type EnhancedSectionContextType
} from '../shared/enhanced-section-template';

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
    section13Data.section13.entries.forEach((entry, index) => {
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

// ============================================================================
// SECTION 13 CONFIGURATION (GOLD STANDARD)
// ============================================================================

const section13Config = {
  sectionId: 'section13',
  sectionName: 'Section 13: Employment Activities',
  expectedFieldCount: 500, // Estimated based on complexity
  createInitialState: () => createDefaultSection13(true),
  validateSection: (data: Section13): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Validate employment history
    const validationContext: Section13ValidationContext = {
      currentDate: new Date(),
      minimumAge: 16,
      investigationTimeFrame: 10, // 10 years back
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

    const employmentValidation = validateSection13(data, validationContext);
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
  },
  
  // Fix: Update the updateField function to properly handle section13 field structures
  updateField: (data: Section13, fieldPath: string, newValue: any): Section13 => {
    console.log(`Section13 updateField called with: path=${fieldPath}, value=`, newValue);
    
    if (fieldPath === 'section13.hasEmployment' || 
        fieldPath === 'hasEmployment' || 
        fieldPath.endsWith('.hasEmployment')) {
      return StandardFieldOperations.updateFieldValue(data, 'section13.hasEmployment', newValue);
    }
    
    if (fieldPath === 'section13.hasGaps' || 
        fieldPath === 'hasGaps' || 
        fieldPath.endsWith('.hasGaps')) {
      return StandardFieldOperations.updateFieldValue(data, 'section13.hasGaps', newValue);
    }
    
    if (fieldPath === 'section13.gapExplanation' || 
        fieldPath === 'gapExplanation' || 
        fieldPath.endsWith('.gapExplanation')) {
      return StandardFieldOperations.updateFieldValue(data, 'section13.gapExplanation', newValue);
    }
    
    // Handle array entries with specific indexes (e.g., section13.entries[0].employerName)
    const entryMatch = fieldPath.match(/section13\.entries\[(\d+)\]\.(.+)/) || 
                      fieldPath.match(/entries\[(\d+)\]\.(.+)/);
    
    if (entryMatch) {
      const entryIndex = parseInt(entryMatch[1]);
      const entryField = entryMatch[2];
      
      // Use the specific update function for entries
      return updateSection13Field(data, {
        fieldPath: `section13.entries[${entryIndex}].${entryField}`,
        newValue,
        entryIndex
      });
    }
    
    // For all other paths, try using updateSection13Field from interfaces
    return updateSection13Field(data, { fieldPath, newValue });
  },
  
  // Add custom actions for employment entry operations
  customActions: {
    // Add a new employment entry
    addEmploymentEntry: (data: Section13): Section13 => {
      console.log('Adding new employment entry');
      const currentIndex = data.section13.entries.length;
      const newEntry = createDefaultEmploymentEntry(Date.now(), currentIndex);
      const updated = JSON.parse(JSON.stringify(data));
      updated.section13.entries = [...updated.section13.entries, newEntry];
      updated.section13.entriesCount = updated.section13.entries.length;
      return updated;
    },
    
    // Remove an employment entry
    removeEmploymentEntry: (data: Section13, entryIndex: number): Section13 => {
      console.log(`Removing employment entry at index ${entryIndex}`);
      const updated = JSON.parse(JSON.stringify(data));
      updated.section13.entries = updated.section13.entries.filter((_: EmploymentEntry, index: number) => index !== entryIndex);
      updated.section13.entriesCount = updated.section13.entries.length;
      return updated;
    },
    
    // Update employment flag
    updateEmploymentFlag: (data: Section13, hasEmployment: "YES" | "NO"): Section13 => {
      console.log(`Updating employment flag to ${hasEmployment}`);
      const updated = JSON.parse(JSON.stringify(data));
      if (updated.section13?.hasEmployment) {
        updated.section13.hasEmployment.value = hasEmployment;
      }
      return updated;
    },
    
    // Update gaps flag
    updateGapsFlag: (data: Section13, hasGaps: "YES" | "NO"): Section13 => {
      console.log(`Updating gaps flag to ${hasGaps}`);
      const updated = JSON.parse(JSON.stringify(data));
      if (updated.section13?.hasGaps) {
        updated.section13.hasGaps.value = hasGaps;
      }
      return updated;
    }
  },
  
  // Make sure to expose the flattening function for PDF generation
  flattenFields: flattenSection13Fields,
  
  // Add a getFieldCount method to help with validation
  getFieldCount: (data: Section13): number => {
    return Object.keys(flattenSection13Fields(data)).length;
  }
};

// ============================================================================
// ENHANCED SECTION CONTEXT
// ============================================================================

const { SectionProvider, useSection: useSectionContext } = createEnhancedSectionContext(section13Config);

// ============================================================================
// SECTION 13 CONTEXT TYPE
// ============================================================================

export interface Section13ContextType extends EnhancedSectionContextType<Section13> {
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
// SECTION 13 PROVIDER
// ============================================================================

export const Section13Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🔄 Section13Provider: Initializing with enhanced section template...');
  
  // Use enhanced section template to create provider
  return (
    <SectionProvider>
      {children}
    </SectionProvider>
  );
};

// ============================================================================
// SECTION 13 HOOK
// ============================================================================

export const useSection13 = (): Section13ContextType => {
  console.log('🔄 useSection13: Hook called from component');
  const baseContext = useSectionContext();
  
  console.log('🔄 useSection13: Context data available:', {
    sectionId: baseContext?.sectionData?._id,
    hasData: !!baseContext?.sectionData,
    hasEmployment: baseContext?.sectionData?.section13?.hasEmployment?.value,
    entryCount: baseContext?.sectionData?.section13?.entries?.length
  });

  const getEmploymentEntryCount = (): number => {
    return baseContext.sectionData.section13.entries.length;
  };

  const getTotalEmploymentYears = (): number => {
    return baseContext.sectionData.section13.entries.reduce((total: number, entry: EmploymentEntry) => {
      const duration = calculateEmploymentDuration(
        entry.employmentDates.fromDate.value,
        entry.employmentDates.toDate.value || new Date().toISOString()
      );
      return total + Math.floor(duration / 12); // Convert months to years
    }, 0);
  };

  const getCurrentEmployer = (): string | null => {
    const currentEntry = baseContext.sectionData.section13.entries.find(
      (entry: EmploymentEntry) => entry.employmentDates.present.value
    );
    return currentEntry ? currentEntry.employerName.value : null;
  };

  const getEmploymentGaps = (): Array<{ start: string; end: string; duration: number }> => {
    const entries = [...baseContext.sectionData.section13.entries]
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
  };

  const validateEmploymentHistoryOnly = (): EmploymentValidationResult => {
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

    return validateSection13(baseContext.sectionData, validationContext);
  };

  const validateEmploymentEntryOnly = (entryIndex: number): EmploymentValidationResult => {
    const entry = baseContext.sectionData.section13.entries[entryIndex];
    if (!entry) {
      return {
        isValid: false,
        errors: ['Employment entry not found'],
        warnings: []
      };
    }

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
  };

  const addEmploymentEntry = (): void => {
    baseContext.customActions.addEmploymentEntry();
  };

  const removeEmploymentEntry = (entryIndex: number): void => {
    baseContext.customActions.removeEmploymentEntry(entryIndex);
  };

  const moveEmploymentEntry = (fromIndex: number, toIndex: number): void => {
    // Custom action for moving entries
    const currentEntries = baseContext.sectionData.section13.entries;
    const entries = [...currentEntries];
    const [movedEntry] = entries.splice(fromIndex, 1);
    entries.splice(toIndex, 0, movedEntry);
    
    // Use loadSection to update the entire data structure
    const updated = { ...baseContext.sectionData };
    updated.section13.entries = entries;
    baseContext.loadSection(updated);
  };

  const duplicateEmploymentEntry = (entryIndex: number): void => {
    const entry = baseContext.sectionData.section13.entries[entryIndex];
    if (!entry) return;
    
    const duplicatedEntry = {
      ...entry,
      _id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updated = { ...baseContext.sectionData };
    updated.section13.entries = [...updated.section13.entries, duplicatedEntry];
    updated.section13.entriesCount = updated.section13.entries.length;
    baseContext.loadSection(updated);
  };

  const clearEmploymentEntry = (entryIndex: number): void => {
    const updated = { ...baseContext.sectionData };
    if (updated.section13.entries[entryIndex]) {
      updated.section13.entries[entryIndex] = createDefaultEmploymentEntry(Date.now());
    }
    baseContext.loadSection(updated);
  };

  const updateEmploymentEntry = (entryIndex: number, fieldPath: string, value: any): void => {
    // Update field using the section's updateField method
    const fullPath = `section13.entries[${entryIndex}].${fieldPath}`;
    baseContext.updateField(fullPath, value);
  };

  const updateEmploymentFlag = (hasEmployment: "YES" | "NO"): void => {
    baseContext.customActions.updateEmploymentFlag(hasEmployment);
  };

  const updateGapsFlag = (hasGaps: "YES" | "NO"): void => {
    baseContext.customActions.updateGapsFlag(hasGaps);
  };

  const updateGapExplanation = (explanation: string): void => {
    baseContext.updateField('section13.gapExplanation', explanation);
  };

  const updateEmploymentType = (entryIndex: number, employmentType: string): void => {
    const fullPath = `section13.entries[${entryIndex}].employmentType`;
    baseContext.updateField(fullPath, employmentType);
  };

  const updateEmploymentDates = (entryIndex: number, fromDate: string, toDate: string, present?: boolean): void => {
    baseContext.updateField(`section13.entries[${entryIndex}].employmentDates.fromDate`, fromDate);
    baseContext.updateField(`section13.entries[${entryIndex}].employmentDates.toDate`, toDate);
    if (present !== undefined) {
      baseContext.updateField(`section13.entries[${entryIndex}].employmentDates.present`, present);
    }
  };

  const updateEmployerAddress = (entryIndex: number, address: Partial<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>): void => {
    Object.entries(address).forEach(([key, value]) => {
      baseContext.updateField(`section13.entries[${entryIndex}].employerAddress.${key}`, value);
    });
  };

  const updateSupervisorInfo = (entryIndex: number, supervisor: Partial<{
    name: string;
    title: string;
    email: string;
    phone: string;
    canContact: "YES" | "NO";
    contactRestrictions: string;
  }>): void => {
    Object.entries(supervisor).forEach(([key, value]) => {
      baseContext.updateField(`section13.entries[${entryIndex}].supervisor.${key}`, value);
    });
  };

  const updateFederalEmploymentFlag = (hasFederalEmployment: "YES" | "NO"): void => {
    baseContext.updateField('section13.federalInfo.hasFederalEmployment', hasFederalEmployment);
  };

  const updateSecurityClearance = (hasSecurityClearance: "YES" | "NO"): void => {
    baseContext.updateField('section13.federalInfo.securityClearance', hasSecurityClearance);
  };

  const updateClearanceInfo = (clearanceInfo: Partial<{
    level: string;
    date: string;
    investigationDate: string;
    polygraphDate: string;
  }>): void => {
    Object.entries(clearanceInfo).forEach(([key, value]) => {
      baseContext.updateField(`section13.federalInfo.${key}`, value);
    });
  };

  const formatEmploymentDateWrapper = (date: string, format?: 'MM/YYYY' | 'MM/DD/YYYY'): string => {
    return formatEmploymentDate(date, format);
  };

  const calculateEmploymentDurationWrapper = (entryIndex: number): number => {
    const entry = baseContext.sectionData.section13.entries[entryIndex];
    if (!entry) return 0;
    
    return calculateEmploymentDuration(
      entry.employmentDates.fromDate.value,
      entry.employmentDates.toDate.value || new Date().toISOString()
    );
  };

  const getEmploymentTypeOptions = (): string[] => {
    return EMPLOYMENT_TYPE_OPTIONS;
  };

  const getEmploymentStatusOptions = (): string[] => {
    return EMPLOYMENT_STATUS_OPTIONS;
  };

  const getReasonForLeavingOptions = (): string[] => {
    return REASON_FOR_LEAVING_OPTIONS;
  };

  return {
    ...baseContext,
    getEmploymentEntryCount,
    getTotalEmploymentYears,
    getCurrentEmployer,
    getEmploymentGaps,
    validateEmploymentHistory: validateEmploymentHistoryOnly,
    validateEmploymentEntry: validateEmploymentEntryOnly,
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
    formatEmploymentDate: formatEmploymentDateWrapper,
    calculateEmploymentDuration: calculateEmploymentDurationWrapper,
    getEmploymentTypeOptions,
    getEmploymentStatusOptions,
    getReasonForLeavingOptions
  };
}; 