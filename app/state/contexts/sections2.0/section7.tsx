/**
 * Section 7: Where You Have Lived (Residence History)
 *
 * Complete implementation of SF-86 Section 7 using the scalable architecture
 * with SF86FormContext integration, comprehensive CRUD operations, and validation.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import cloneDeep from "lodash.clonedeep";
import set from "lodash.set";
import type { Field } from "../../../api/interfaces/formDefinition2.0";
import { useSection86FormIntegration } from "../shared/section-context-integration";
import type { ValidationResult, ValidationError } from "../shared/base-interfaces";
import type {
  Section7,
  ResidenceEntry,
  Section7SubsectionKey,
  Address,
  DateRange,
  VerificationContact,
  SECTION7_FIELD_IDS
} from "../../../api/interfaces/sections2.0/section7";

// ============================================================================
// SECTION 7 CONTEXT INTERFACE
// ============================================================================

interface Section7ContextType {
  // Core State
  section7Data: Section7;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Section-Specific CRUD Operations
  updateResidenceHistoryFlag: (hasValue: "YES" | "NO") => void;
  addResidenceEntry: () => void;
  removeResidenceEntry: (entryIndex: number) => void;
  updateFieldValue: (entryIndex: number, fieldPath: string, newValue: any) => void;

  // Enhanced Entry Management
  getResidenceCount: () => number;
  getResidenceEntry: (entryIndex: number) => ResidenceEntry | null;
  moveResidenceEntry: (fromIndex: number, toIndex: number) => void;
  duplicateResidenceEntry: (entryIndex: number) => void;
  clearResidenceEntry: (entryIndex: number) => void;
  bulkUpdateFields: (entryIndex: number, fieldUpdates: Record<string, any>) => void;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section7) => void;
  validateSection: () => ValidationResult;
  getChanges: () => any;

  // SF86Form Integration
  markComplete: () => void;
  markIncomplete: () => void;
  triggerGlobalValidation: () => ValidationResult;
  getGlobalFormState: () => any;
  navigateToSection: (sectionId: string) => void;
  saveForm: () => Promise<void>;
  emitEvent: (event: any) => void;
  subscribeToEvents: (eventType: string, callback: Function) => () => void;
  notifyChange: (changeType: string, payload: any) => void;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

const createInitialSection7State = (): Section7 => ({
  _id: 7,
  residenceHistory: {
    hasLivedAtCurrentAddressFor3Years: {
      id: "form1[0].Sections7-9[0].RadioButtonList[0]",
      type: "radio",
      label: "Have you lived at your current address for at least 3 years?",
      value: "NO",
      isDirty: false,
      isValid: true,
      errors: []
    },
    entries: []
  }
});

// ============================================================================
// ENTRY TEMPLATE CREATORS
// ============================================================================

const createResidenceEntryTemplate = (entryIndex: number): ResidenceEntry => ({
  _id: Date.now() + Math.random(),
  address: {
    street: {
      id: `form1[0].Sections7-9[0].TextField[${entryIndex * 10}]`,
      type: "text",
      label: "Street Address",
      value: "",
      isDirty: false,
      isValid: true,
      errors: []
    },
    city: {
      id: `form1[0].Sections7-9[0].TextField[${entryIndex * 10 + 1}]`,
      type: "text",
      label: "City",
      value: "",
      isDirty: false,
      isValid: true,
      errors: []
    },
    state: {
      id: `form1[0].Sections7-9[0].DropDownList[${entryIndex}]`,
      type: "select",
      label: "State",
      value: "",
      isDirty: false,
      isValid: true,
      errors: []
    },
    zipCode: {
      id: `form1[0].Sections7-9[0].TextField[${entryIndex * 10 + 2}]`,
      type: "text",
      label: "ZIP Code",
      value: "",
      isDirty: false,
      isValid: true,
      errors: []
    },
    country: {
      id: `form1[0].Sections7-9[0].TextField[${entryIndex * 10 + 3}]`,
      type: "text",
      label: "Country",
      value: "United States",
      isDirty: false,
      isValid: true,
      errors: []
    }
  },
  dateRange: {
    from: {
      date: {
        id: `form1[0].Sections7-9[0].DateField[${entryIndex * 2}]`,
        type: "date",
        label: "From Date",
        value: "",
        isDirty: false,
        isValid: true,
        errors: []
      },
      estimated: {
        id: `form1[0].Sections7-9[0].CheckBox[${entryIndex * 6}]`,
        type: "checkbox",
        label: "Estimated",
        value: false,
        isDirty: false,
        isValid: true,
        errors: []
      }
    },
    to: {
      date: {
        id: `form1[0].Sections7-9[0].DateField[${entryIndex * 2 + 1}]`,
        type: "date",
        label: "To Date",
        value: "",
        isDirty: false,
        isValid: true,
        errors: []
      },
      estimated: {
        id: `form1[0].Sections7-9[0].CheckBox[${entryIndex * 6 + 1}]`,
        type: "checkbox",
        label: "Estimated",
        value: false,
        isDirty: false,
        isValid: true,
        errors: []
      }
    },
    present: {
      id: `form1[0].Sections7-9[0].CheckBox[${entryIndex * 6 + 2}]`,
      type: "checkbox",
      label: "Present",
      value: false,
      isDirty: false,
      isValid: true,
      errors: []
    }
  },
  residenceType: {
    id: `form1[0].Sections7-9[0].DropDownList[${entryIndex + 100}]`,
    type: "select",
    label: "Residence Type",
    value: "RENT",
    isDirty: false,
    isValid: true,
    errors: []
  },
  verificationSource: {
    name: {
      id: `form1[0].Sections7-9[0].TextField[${entryIndex * 10 + 4}]`,
      type: "text",
      label: "Verification Contact Name",
      value: "",
      isDirty: false,
      isValid: true,
      errors: []
    },
    phone: {
      id: `form1[0].Sections7-9[0].TextField[${entryIndex * 10 + 5}]`,
      type: "tel",
      label: "Verification Contact Phone",
      value: "",
      isDirty: false,
      isValid: true,
      errors: []
    },
    email: {
      id: `form1[0].Sections7-9[0].TextField[${entryIndex * 10 + 6}]`,
      type: "text",
      label: "Verification Contact Email",
      value: "",
      isDirty: false,
      isValid: true,
      errors: []
    },
    relationship: {
      id: `form1[0].Sections7-9[0].TextField[${entryIndex * 10 + 7}]`,
      type: "text",
      label: "Relationship to Verification Contact",
      value: "",
      isDirty: false,
      isValid: true,
      errors: []
    }
  },
  additionalInfo: {
    id: `form1[0].Sections7-9[0].TextArea[${entryIndex}]`,
    type: "textarea",
    label: "Additional Information",
    value: "",
    isDirty: false,
    isValid: true,
    errors: []
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const clearFieldsRecursively = (obj: any) => {
  if (!obj || typeof obj !== 'object') return;

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (key === 'value' && obj.id && obj.type && obj.label) {
        // This is a Field<T> object
        if (typeof obj.value === 'boolean') {
          obj.value = false;
        } else {
          obj.value = '';
        }
      } else if (typeof obj[key] === 'object') {
        clearFieldsRecursively(obj[key]);
      }
    }
  }
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section7Context = createContext<Section7ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface Section7ProviderProps {
  children: ReactNode;
}

export const Section7Provider: React.FC<Section7ProviderProps> = ({ children }) => {
  // Core State Management
  const [section7Data, setSection7Data] = useState<Section7>(createInitialSection7State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section7>(createInitialSection7State());

  // SF86Form Integration
  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];

    // Validate main question
    if (!section7Data.residenceHistory?.hasLivedAtCurrentAddressFor3Years?.value) {
      validationErrors.push({
        field: 'residenceHistory.hasLivedAtCurrentAddressFor3Years',
        message: 'Please answer about your current address residence duration',
        code: 'REQUIRED',
        severity: 'error'
      });
    }

    // If NO to 3+ years, validate residence entries
    if (section7Data.residenceHistory?.hasLivedAtCurrentAddressFor3Years?.value === 'NO') {
      if (!section7Data.residenceHistory.entries || section7Data.residenceHistory.entries.length === 0) {
        validationErrors.push({
          field: 'residenceHistory.entries',
          message: 'Please provide your residence history for the past 3 years',
          code: 'REQUIRED_CONDITIONAL',
          severity: 'error'
        });
      } else {
        // Validate each residence entry
        section7Data.residenceHistory.entries.forEach((entry, index) => {
          if (!entry.address.street.value) {
            validationErrors.push({
              field: `residenceHistory.entries[${index}].address.street`,
              message: `Street address is required for residence ${index + 1}`,
              code: 'REQUIRED',
              severity: 'error'
            });
          }

          if (!entry.address.city.value) {
            validationErrors.push({
              field: `residenceHistory.entries[${index}].address.city`,
              message: `City is required for residence ${index + 1}`,
              code: 'REQUIRED',
              severity: 'error'
            });
          }

          if (!entry.dateRange.from.date.value) {
            validationErrors.push({
              field: `residenceHistory.entries[${index}].dateRange.from.date`,
              message: `From date is required for residence ${index + 1}`,
              code: 'REQUIRED',
              severity: 'error'
            });
          }

          if (!entry.dateRange.present.value && !entry.dateRange.to.date.value) {
            validationErrors.push({
              field: `residenceHistory.entries[${index}].dateRange.to.date`,
              message: `To date is required for residence ${index + 1} (or check Present)`,
              code: 'REQUIRED',
              severity: 'error'
            });
          }
        });
      }
    }

    // Update local errors for backward compatibility
    const newErrors: Record<string, string> = {};
    validationErrors.forEach(error => {
      newErrors[error.field] = error.message;
    });
    setErrors(newErrors);

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: []
    };
  }, [section7Data]);

  const getChanges = useCallback(() => {
    const changes: Record<string, any> = {};

    if (JSON.stringify(section7Data) !== JSON.stringify(initialData)) {
      changes.section7 = {
        oldValue: initialData,
        newValue: section7Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section7Data, initialData]);

  const integration = useSection86FormIntegration(
    'section7',
    'Section 7: Where You Have Lived',
    section7Data,
    setSection7Data,
    validateSection,
    getChanges
  );

  const isDirty = useMemo(() => {
    return JSON.stringify(section7Data) !== JSON.stringify(initialData);
  }, [section7Data, initialData]);

  // ============================================================================
  // SECTION-SPECIFIC CRUD OPERATIONS
  // ============================================================================

  const updateResidenceHistoryFlag = useCallback((hasValue: "YES" | "NO") => {
    setSection7Data(prev => {
      const updated = cloneDeep(prev);
      updated.residenceHistory.hasLivedAtCurrentAddressFor3Years.value = hasValue;
      return updated;
    });

    integration.notifyChange('residence_history_flag_updated', { hasValue });
  }, [integration]);

  const addResidenceEntry = useCallback(() => {
    setSection7Data(prev => {
      const updated = cloneDeep(prev);
      const entryIndex = updated.residenceHistory.entries.length;
      const newEntry = createResidenceEntryTemplate(entryIndex);
      updated.residenceHistory.entries.push(newEntry);
      return updated;
    });

    integration.notifyChange('residence_entry_added', {});
  }, [integration]);

  const removeResidenceEntry = useCallback((entryIndex: number) => {
    setSection7Data(prev => {
      const updated = cloneDeep(prev);
      if (entryIndex >= 0 && entryIndex < updated.residenceHistory.entries.length) {
        updated.residenceHistory.entries.splice(entryIndex, 1);
      }
      return updated;
    });

    integration.notifyChange('residence_entry_removed', { entryIndex });
  }, [integration]);

  const updateFieldValue = useCallback((entryIndex: number, fieldPath: string, newValue: any) => {
    setSection7Data(prev => {
      const updated = cloneDeep(prev);
      const fullPath = `residenceHistory.entries[${entryIndex}].${fieldPath}`;
      set(updated, fullPath, newValue);
      return updated;
    });

    integration.notifyChange('residence_field_updated', { entryIndex, fieldPath, newValue });
  }, [integration]);

  // ============================================================================
  // ENHANCED ENTRY MANAGEMENT
  // ============================================================================

  const getResidenceCount = useCallback((): number => {
    return section7Data.residenceHistory.entries.length;
  }, [section7Data]);

  const getResidenceEntry = useCallback((entryIndex: number): ResidenceEntry | null => {
    return section7Data.residenceHistory.entries[entryIndex] || null;
  }, [section7Data]);

  const moveResidenceEntry = useCallback((fromIndex: number, toIndex: number) => {
    setSection7Data(prev => {
      const updated = cloneDeep(prev);
      const entries = updated.residenceHistory.entries;
      if (fromIndex >= 0 && fromIndex < entries.length && toIndex >= 0 && toIndex < entries.length) {
        const [movedEntry] = entries.splice(fromIndex, 1);
        entries.splice(toIndex, 0, movedEntry);
      }
      return updated;
    });

    integration.notifyChange('residence_entry_moved', { fromIndex, toIndex });
  }, [integration]);

  const duplicateResidenceEntry = useCallback((entryIndex: number) => {
    setSection7Data(prev => {
      const updated = cloneDeep(prev);
      const originalEntry = updated.residenceHistory.entries[entryIndex];
      if (originalEntry) {
        const duplicatedEntry = cloneDeep(originalEntry);
        duplicatedEntry._id = Date.now() + Math.random();
        updated.residenceHistory.entries.push(duplicatedEntry);
      }
      return updated;
    });

    integration.notifyChange('residence_entry_duplicated', { entryIndex });
  }, [integration]);

  const clearResidenceEntry = useCallback((entryIndex: number) => {
    setSection7Data(prev => {
      const updated = cloneDeep(prev);
      const entry = updated.residenceHistory.entries[entryIndex];
      if (entry) {
        clearFieldsRecursively(entry);
      }
      return updated;
    });

    integration.notifyChange('residence_entry_cleared', { entryIndex });
  }, [integration]);

  const bulkUpdateFields = useCallback((entryIndex: number, fieldUpdates: Record<string, any>) => {
    setSection7Data(prev => {
      const updated = cloneDeep(prev);
      Object.entries(fieldUpdates).forEach(([fieldPath, newValue]) => {
        const fullPath = `residenceHistory.entries[${entryIndex}].${fieldPath}`;
        set(updated, fullPath, newValue);
      });
      return updated;
    });

    integration.notifyChange('residence_bulk_update', { entryIndex, fieldUpdates });
  }, [integration]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = createInitialSection7State();
    setSection7Data(newData);
    setErrors({});
    integration.notifyChange('section_reset', { newData });
  }, [integration]);

  const loadSection = useCallback((data: Section7) => {
    setSection7Data(cloneDeep(data));
    setErrors({});
    integration.notifyChange('section_loaded', { data });
  }, [integration]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section7ContextType = {
    // Core State
    section7Data,
    isLoading,
    errors,
    isDirty,

    // Section-Specific CRUD Operations
    updateResidenceHistoryFlag,
    addResidenceEntry,
    removeResidenceEntry,
    updateFieldValue,

    // Enhanced Entry Management
    getResidenceCount,
    getResidenceEntry,
    moveResidenceEntry,
    duplicateResidenceEntry,
    clearResidenceEntry,
    bulkUpdateFields,

    // Utility
    resetSection,
    loadSection,
    validateSection,
    getChanges,

    // SF86Form Integration
    markComplete: integration.markComplete,
    markIncomplete: integration.markIncomplete,
    triggerGlobalValidation: integration.triggerGlobalValidation,
    getGlobalFormState: integration.getGlobalFormState,
    navigateToSection: integration.navigateToSection,
    saveForm: integration.saveForm,
    emitEvent: integration.emitEvent,
    subscribeToEvents: integration.subscribeToEvents,
    notifyChange: integration.notifyChange
  };

  return (
    <Section7Context.Provider value={contextValue}>
      {children}
    </Section7Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection7 = (): Section7ContextType => {
  const context = useContext(Section7Context);
  if (!context) {
    throw new Error('useSection7 must be used within a Section7Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section7Provider;
export type { Section7ContextType };
