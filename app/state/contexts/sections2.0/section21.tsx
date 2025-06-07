/**
 * Section 21: Psychological and Emotional Health - Context Provider
 *
 * React context provider for SF-86 Section 21 (Psychological and Emotional Health) following the established
 * patterns from Section 1 and Section 29. Provides comprehensive state management, CRUD operations for mental
 * health entries, validation, and SF86FormContext integration.
 *
 * This section covers mental health consultations, diagnoses, treatments, hospitalizations,
 * and other psychological/emotional health issues.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo
} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import type { Field } from '../formDefinition2.0';
import { createFieldFromReference } from '../../utils/sections-references-loader';
import { createSection21MainQuestionField } from './section21-field-mapping';
import { useSection86FormIntegration } from '../shared/section-context-integration';
import type { ValidationResult, ValidationError, ChangeSet } from '../shared/base-interfaces';

// ============================================================================
// LOCAL TYPE DEFINITIONS (avoiding import path issues)
// ============================================================================

/**
 * Address structure used across multiple sections
 */
export interface Address {
  street: Field<string>;
  city: Field<string>;
  state: Field<string>;
  zipCode: Field<string>;
  country: Field<string>;
}

/**
 * Date range structure used across multiple sections
 */
export interface DateRange {
  from: DateInfo;
  to: DateInfo;
  present: Field<boolean>;
}

/**
 * Date information with estimation flag
 */
export interface DateInfo {
  date: Field<string>;
  estimated: Field<boolean>;
}

/**
 * Name structure used across multiple sections
 */
export interface NameInfo {
  first: Field<string>;
  middle: Field<string>;
  last: Field<string>;
  suffix: Field<string>;
}

// ============================================================================
// SECTION 21 CORE INTERFACES
// ============================================================================

/**
 * Types of mental health consultations/treatments
 */
export type MentalHealthConsultationType = 
  | 'consultation'
  | 'treatment' 
  | 'counseling'
  | 'hospitalization'
  | 'court_ordered'
  | 'other';

/**
 * Mental health consultation entry
 */
export interface MentalHealthEntry {
  _id: Field<string | number>;
  consultationType: Field<MentalHealthConsultationType>;
  reason: Field<string>;
  diagnosis: Field<string>;
  treatmentDetails: Field<string>;
  dateRange: DateRange;
  professionalInfo: {
    name: NameInfo;
    title: Field<string>;
    organization: Field<string>;
    address: Address;
    phone: Field<string>;
  };
  wasVoluntary: Field<boolean>;
  currentlyReceivingTreatment: Field<boolean>;
  medicationPrescribed: Field<boolean>;
  medicationDetails: Field<string>;
  additionalComments: Field<string>;
}

/**
 * Court-ordered mental health treatment entry
 */
export interface CourtOrderedTreatmentEntry {
  _id: Field<string | number>;
  courtName: Field<string>;
  courtAddress: Address;
  orderDate: DateInfo;
  treatmentType: Field<string>;
  reason: Field<string>;
  treatmentProvider: {
    name: NameInfo;
    organization: Field<string>;
    address: Address;
  };
  treatmentDuration: DateRange;
  wasCompleted: Field<boolean>;
  currentStatus: Field<string>;
}

/**
 * Section 21 subsection keys
 */
export type Section21SubsectionKey = 
  | 'mentalHealthConsultations'
  | 'courtOrderedTreatment'
  | 'hospitalization'
  | 'otherMentalHealth';

/**
 * Mental health subsection structure
 */
export interface MentalHealthSubsection {
  hasConsultation: Field<'YES' | 'NO'>;
  entries: MentalHealthEntry[];
  entriesCount: number;
}

/**
 * Court-ordered treatment subsection structure
 */
export interface CourtOrderedSubsection {
  hasCourtOrdered: Field<'YES' | 'NO'>;
  entries: CourtOrderedTreatmentEntry[];
  entriesCount: number;
}

/**
 * Main Section 21 interface
 */
export interface Section21 {
  _id: number;
  section21: {
    mentalHealthConsultations: MentalHealthSubsection;
    courtOrderedTreatment: CourtOrderedSubsection;
    hospitalization: MentalHealthSubsection;
    otherMentalHealth: MentalHealthSubsection;
  };
}

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Mental health validation context
 */
export interface Section21ValidationContext {
  currentDate: Date;
  rules: {
    requiresReason: boolean;
    requiresProfessionalInfo: boolean;
    requiresDateRange: boolean;
    requiresTreatmentDetails: boolean;
    maxReasonLength: number;
    maxTreatmentLength: number;
    allowsFutureDate: boolean;
  };
  requiresDocumentation: boolean;
}

/**
 * Mental health validation result
 */
export interface MentalHealthValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequiredFields: string[];
}

// ============================================================================
// FIELD UPDATE INTERFACES
// ============================================================================

/**
 * Section 21 field update structure
 */
export interface Section21FieldUpdate {
  subsectionKey: Section21SubsectionKey;
  entryIndex?: number;
  fieldPath: string;
  newValue: any;
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Creates a default mental health entry
 */
export const createDefaultMentalHealthEntry = (): MentalHealthEntry => {
  return {
    _id: createFieldFromReference(21, 'entry_id', Date.now()),
    consultationType: createFieldFromReference(21, 'consultation_type', 'consultation'),
    reason: createFieldFromReference(21, 'reason', ''),
    diagnosis: createFieldFromReference(21, 'diagnosis', ''),
    treatmentDetails: createFieldFromReference(21, 'treatment_details', ''),
    dateRange: {
      from: {
        date: createFieldFromReference(21, 'date_from', ''),
        estimated: createFieldFromReference(21, 'date_from_estimated', false)
      },
      to: {
        date: createFieldFromReference(21, 'date_to', ''),
        estimated: createFieldFromReference(21, 'date_to_estimated', false)
      },
      present: createFieldFromReference(21, 'present', false)
    },
    professionalInfo: {
      name: {
        first: createFieldFromReference(21, 'professional_first_name', ''),
        middle: createFieldFromReference(21, 'professional_middle_name', ''),
        last: createFieldFromReference(21, 'professional_last_name', ''),
        suffix: createFieldFromReference(21, 'professional_suffix', '')
      },
      title: createFieldFromReference(21, 'professional_title', ''),
      organization: createFieldFromReference(21, 'professional_organization', ''),
      address: {
        street: createFieldFromReference(21, 'professional_street', ''),
        city: createFieldFromReference(21, 'professional_city', ''),
        state: createFieldFromReference(21, 'professional_state', ''),
        zipCode: createFieldFromReference(21, 'professional_zip', ''),
        country: createFieldFromReference(21, 'professional_country', 'United States')
      },
      phone: createFieldFromReference(21, 'professional_phone', '')
    },
    wasVoluntary: createFieldFromReference(21, 'was_voluntary', true),
    currentlyReceivingTreatment: createFieldFromReference(21, 'currently_receiving_treatment', false),
    medicationPrescribed: createFieldFromReference(21, 'medication_prescribed', false),
    medicationDetails: createFieldFromReference(21, 'medication_details', ''),
    additionalComments: createFieldFromReference(21, 'additional_comments', '')
  };
};

/**
 * Creates a default court-ordered treatment entry
 */
export const createDefaultCourtOrderedEntry = (): CourtOrderedTreatmentEntry => {
  return {
    _id: createFieldFromReference(21, 'court_entry_id', Date.now()),
    courtName: createFieldFromReference(21, 'court_name', ''),
    courtAddress: {
      street: createFieldFromReference(21, 'court_street', ''),
      city: createFieldFromReference(21, 'court_city', ''),
      state: createFieldFromReference(21, 'court_state', ''),
      zipCode: createFieldFromReference(21, 'court_zip', ''),
      country: createFieldFromReference(21, 'court_country', 'United States')
    },
    orderDate: {
      date: createFieldFromReference(21, 'order_date', ''),
      estimated: createFieldFromReference(21, 'order_date_estimated', false)
    },
    treatmentType: createFieldFromReference(21, 'court_treatment_type', ''),
    reason: createFieldFromReference(21, 'court_reason', ''),
    treatmentProvider: {
      name: {
        first: createFieldFromReference(21, 'provider_first_name', ''),
        middle: createFieldFromReference(21, 'provider_middle_name', ''),
        last: createFieldFromReference(21, 'provider_last_name', ''),
        suffix: createFieldFromReference(21, 'provider_suffix', '')
      },
      organization: createFieldFromReference(21, 'provider_organization', ''),
      address: {
        street: createFieldFromReference(21, 'provider_street', ''),
        city: createFieldFromReference(21, 'provider_city', ''),
        state: createFieldFromReference(21, 'provider_state', ''),
        zipCode: createFieldFromReference(21, 'provider_zip', ''),
        country: createFieldFromReference(21, 'provider_country', 'United States')
      }
    },
    treatmentDuration: {
      from: {
        date: createFieldFromReference(21, 'treatment_date_from', ''),
        estimated: createFieldFromReference(21, 'treatment_date_from_estimated', false)
      },
      to: {
        date: createFieldFromReference(21, 'treatment_date_to', ''),
        estimated: createFieldFromReference(21, 'treatment_date_to_estimated', false)
      },
      present: createFieldFromReference(21, 'treatment_present', false)
    },
    wasCompleted: createFieldFromReference(21, 'was_completed', true),
    currentStatus: createFieldFromReference(21, 'current_status', '')
  };
};

/**
 * Creates default Section 21 data structure
 */
export const createDefaultSection21 = (): Section21 => {
  return {
    _id: 21,
    section21: {
      mentalHealthConsultations: {
        hasConsultation: createSection21MainQuestionField('mentalIncompetence', 'NO'),
        entries: [],
        entriesCount: 0
      },
      courtOrderedTreatment: {
        hasCourtOrdered: createSection21MainQuestionField('courtOrderedTreatment', 'NO'),
        entries: [],
        entriesCount: 0
      },
      hospitalization: {
        hasConsultation: createSection21MainQuestionField('hospitalization', 'NO'),
        entries: [],
        entriesCount: 0
      },
      otherMentalHealth: {
        hasConsultation: createSection21MainQuestionField('otherMentalHealth', 'NO'),
        entries: [],
        entriesCount: 0
      }
    }
  };
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates a mental health entry
 */
export const validateMentalHealthEntry = (
  entry: MentalHealthEntry, 
  context: Section21ValidationContext
): MentalHealthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];

  // Required field validations
  if (context.rules.requiresReason && !entry.reason?.value?.trim()) {
    errors.push('Reason for consultation is required');
    missingFields.push('reason');
  }

  if (context.rules.requiresProfessionalInfo) {
    if (!entry.professionalInfo?.name?.last?.value?.trim()) {
      errors.push('Professional\'s last name is required');
      missingFields.push('professionalInfo.name.last');
    }
  }

  if (context.rules.requiresDateRange) {
    if (!entry.dateRange?.from?.date?.value) {
      errors.push('Start date is required');
      missingFields.push('dateRange.from.date');
    }
  }

  // Length validations
  if (entry.reason?.value && entry.reason.value.length > context.rules.maxReasonLength) {
    errors.push(`Reason exceeds maximum length of ${context.rules.maxReasonLength} characters`);
  }

  if (entry.treatmentDetails?.value && entry.treatmentDetails.value.length > context.rules.maxTreatmentLength) {
    errors.push(`Treatment details exceed maximum length of ${context.rules.maxTreatmentLength} characters`);
  }

  // Date validations
  if (entry.dateRange?.from?.date?.value) {
    const fromDate = new Date(entry.dateRange.from.date.value);
    if (!context.rules.allowsFutureDate && fromDate > context.currentDate) {
      warnings.push('Start date is in the future');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingRequiredFields: missingFields
  };
};

/**
 * Validates entire Section 21
 */
export const validateSection21 = (
  section21: Section21,
  context: Section21ValidationContext
): MentalHealthValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const allMissingFields: string[] = [];

  // Validate each subsection
  Object.entries(section21.section21).forEach(([subsectionKey, subsection]) => {
    if ('hasConsultation' in subsection && subsection.hasConsultation?.value === 'YES') {
      subsection.entries.forEach((entry: any, index: number) => {
        const entryValidation = validateMentalHealthEntry(entry, context);
        
        entryValidation.errors.forEach(error => {
          allErrors.push(`${subsectionKey} Entry ${index + 1}: ${error}`);
        });
        
        entryValidation.warnings.forEach(warning => {
          allWarnings.push(`${subsectionKey} Entry ${index + 1}: ${warning}`);
        });
        
        entryValidation.missingRequiredFields.forEach(field => {
          allMissingFields.push(`${subsectionKey}[${index}].${field}`);
        });
      });
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    missingRequiredFields: allMissingFields
  };
};

// ============================================================================
// UPDATE FUNCTIONS
// ============================================================================

/**
 * Updates a field in Section 21
 */
export const updateSection21Field = (
  section21: Section21,
  update: Section21FieldUpdate
): Section21 => {
  const newSection21 = { ...section21 };
  const subsection = newSection21.section21[update.subsectionKey];

  if (update.entryIndex !== undefined && subsection.entries[update.entryIndex]) {
    // Update entry field
    const entry = { ...subsection.entries[update.entryIndex] };
    
    // Handle nested field paths
    const pathParts = update.fieldPath.split('.');
    let current = entry as any;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    
    current[pathParts[pathParts.length - 1]] = update.newValue;
    subsection.entries[update.entryIndex] = entry;
  } else if (update.fieldPath === 'hasConsultation' || update.fieldPath === 'hasCourtOrdered') {
    // Update subsection flag
    if ('hasConsultation' in subsection) {
      subsection.hasConsultation = { ...subsection.hasConsultation, value: update.newValue };
    }
    if ('hasCourtOrdered' in subsection) {
      (subsection as any).hasCourtOrdered = { ...(subsection as any).hasCourtOrdered, value: update.newValue };
    }
  }

  return newSection21;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculates the total number of mental health consultations across all subsections
 */
export const getTotalMentalHealthEntries = (section21: Section21): number => {
  return Object.values(section21.section21).reduce((total, subsection) => {
    return total + (subsection.entries?.length || 0);
  }, 0);
};

/**
 * Checks if any mental health issues are reported
 */
export const hasAnyMentalHealthIssues = (section21: Section21): boolean => {
  return Object.values(section21.section21).some(subsection => {
    if ('hasConsultation' in subsection) {
      return subsection.hasConsultation?.value === 'YES';
    }
    if ('hasCourtOrdered' in subsection) {
      return (subsection as any).hasCourtOrdered?.value === 'YES';
    }
    return false;
  });
};

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section21ContextType {
  // State
  section21Data: Section21;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updateSubsectionFlag: (subsectionKey: Section21SubsectionKey, value: 'YES' | 'NO') => void;
  updateEntryField: (subsectionKey: Section21SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => void;
  addEntry: (subsectionKey: Section21SubsectionKey) => void;
  removeEntry: (subsectionKey: Section21SubsectionKey, entryIndex: number) => void;
  updateFieldValue: (path: string, value: any) => void;

  // Validation
  validateSection: () => ValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section21) => void;
  getChanges: () => any;

  // Section-specific utility functions
  getTotalMentalHealthEntries: () => number;
  hasAnyMentalHealthIssues: () => boolean;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section21Context = createContext<Section21ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section21ProviderProps {
  children: React.ReactNode;
}

export const Section21Provider: React.FC<Section21ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section21Data, setSection21Data] = useState<Section21>(createDefaultSection21());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section21>(createDefaultSection21());
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = useMemo(() => {
    return JSON.stringify(section21Data) !== JSON.stringify(initialData);
  }, [section21Data, initialData]);

  // Set initialized flag after component mounts
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Create validation context
    const validationContext: Section21ValidationContext = {
      currentDate: new Date(),
      rules: {
        requiresReason: true,
        requiresProfessionalInfo: true,
        requiresDateRange: true,
        requiresTreatmentDetails: true,
        maxReasonLength: 500,
        maxTreatmentLength: 1000,
        allowsFutureDate: false
      },
      requiresDocumentation: false
    };

    // Validate using the existing validation function
    const section21Validation = validateSection21(section21Data, validationContext);

    section21Validation.errors.forEach(error => {
      validationErrors.push({
        field: 'section21',
        message: error,
        code: 'VALIDATION_ERROR',
        severity: 'error'
      });
    });

    section21Validation.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'section21',
        message: warning,
        code: 'VALIDATION_WARNING',
        severity: 'warning'
      });
    });

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section21Data]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updateSubsectionFlag = useCallback((subsectionKey: Section21SubsectionKey, value: 'YES' | 'NO') => {
    console.log(`🔄 Section21Context: updateSubsectionFlag called with ${subsectionKey} = ${value}`);

    setSection21Data(prevData => {
      const newData = cloneDeep(prevData);
      const subsection = newData.section21[subsectionKey];

      if ('hasConsultation' in subsection) {
        subsection.hasConsultation = { ...subsection.hasConsultation, value };
      }
      if ('hasCourtOrdered' in subsection) {
        (subsection as any).hasCourtOrdered = { ...(subsection as any).hasCourtOrdered, value };
      }

      console.log(`✅ Section21Context: updateSubsectionFlag updated data:`, newData);
      return newData;
    });
  }, []);

  const updateEntryField = useCallback((subsectionKey: Section21SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => {
    console.log(`🔄 Section21Context: updateEntryField called with ${subsectionKey}[${entryIndex}].${fieldPath} = ${newValue}`);

    setSection21Data(prevData => {
      const newData = cloneDeep(prevData);
      const subsection = newData.section21[subsectionKey];

      if (subsection.entries[entryIndex]) {
        set(subsection.entries[entryIndex], fieldPath, newValue);
      }

      console.log(`✅ Section21Context: updateEntryField updated data:`, newData);
      return newData;
    });
  }, []);

  const addEntry = useCallback((subsectionKey: Section21SubsectionKey) => {
    console.log(`🔄 Section21Context: addEntry called for ${subsectionKey}`);

    setSection21Data(prevData => {
      const newData = cloneDeep(prevData);
      const subsection = newData.section21[subsectionKey];

      // Create new entry based on subsection type
      let newEntry: any;
      if (subsectionKey === 'courtOrderedTreatment') {
        newEntry = createDefaultCourtOrderedEntry();
      } else {
        newEntry = createDefaultMentalHealthEntry();
      }

      subsection.entries.push(newEntry);
      subsection.entriesCount = subsection.entries.length;

      console.log(`✅ Section21Context: addEntry added entry to ${subsectionKey}:`, newData);
      return newData;
    });
  }, []);

  const removeEntry = useCallback((subsectionKey: Section21SubsectionKey, entryIndex: number) => {
    console.log(`🔄 Section21Context: removeEntry called for ${subsectionKey}[${entryIndex}]`);

    setSection21Data(prevData => {
      const newData = cloneDeep(prevData);
      const subsection = newData.section21[subsectionKey];

      if (entryIndex >= 0 && entryIndex < subsection.entries.length) {
        subsection.entries.splice(entryIndex, 1);
        subsection.entriesCount = subsection.entries.length;
      }

      console.log(`✅ Section21Context: removeEntry removed entry from ${subsectionKey}:`, newData);
      return newData;
    });
  }, []);

  /**
   * Generic field update function for SF86FormContext integration
   * Maps generic field paths to Section 21 specific update functions
   */
  const updateFieldValue = useCallback((path: string, value: any) => {
    console.log(`🔍 Section21Context: updateFieldValue called with path=${path}, value=`, value);

    setSection21Data(prevData => {
      const newData = cloneDeep(prevData);

      // Handle both direct field paths and mapped paths
      let targetPath = path;

      // If the path doesn't start with 'section21.', prepend it
      if (!path.startsWith('section21.')) {
        targetPath = `section21.${path}`;
      }

      set(newData, targetPath, value);
      console.log(`✅ Section21Context: updateFieldValue - field updated at path: ${targetPath}`);
      return newData;
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = createDefaultSection21();
    setSection21Data(newData);
    setErrors({});
    console.log('🔄 Section21Context: resetSection called');
  }, []);

  const loadSection = useCallback((data: Section21) => {
    setSection21Data(cloneDeep(data));
    setErrors({});
    console.log('🔄 Section21Context: loadSection called with data:', data);
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Simple change detection - compare with initial data
    if (JSON.stringify(section21Data) !== JSON.stringify(initialData)) {
      changes['section21'] = {
        oldValue: initialData,
        newValue: section21Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section21Data, initialData]);

  // ============================================================================
  // SECTION-SPECIFIC UTILITY FUNCTIONS
  // ============================================================================

  const getTotalMentalHealthEntries = useCallback((): number => {
    return getTotalMentalHealthEntries(section21Data);
  }, [section21Data]);

  const hasAnyMentalHealthIssuesCallback = useCallback((): boolean => {
    return hasAnyMentalHealthIssues(section21Data);
  }, [section21Data]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Integration with main form context using standard pattern
  const integration = useSection86FormIntegration(
    'section21',
    'Section 21: Psychological and Emotional Health',
    section21Data,
    setSection21Data,
    () => ({ isValid: validateSection().isValid, errors: validateSection().errors, warnings: validateSection().warnings }),
    getChanges,
    updateFieldValue // Pass Section 21's updateFieldValue function to integration
  );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section21ContextType = {
    // State
    section21Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updateSubsectionFlag,
    updateEntryField,
    addEntry,
    removeEntry,
    updateFieldValue,

    // Validation
    validateSection,

    // Utility
    resetSection,
    loadSection,
    getChanges,

    // Section-specific utility functions
    getTotalMentalHealthEntries,
    hasAnyMentalHealthIssues: hasAnyMentalHealthIssuesCallback
  };

  return (
    <Section21Context.Provider value={contextValue}>
      {children}
    </Section21Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection21 = (): Section21ContextType => {
  const context = useContext(Section21Context);
  if (!context) {
    throw new Error('useSection21 must be used within a Section21Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section21Provider;