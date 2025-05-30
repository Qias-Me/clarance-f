/**
 * Section7 Context - Residence History Example
 *
 * This is a concrete implementation of Section7 (Residence History) using the
 * section template. It demonstrates how to customize the template for a specific
 * section while following the proven Section29 patterns.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import type { Field } from "../../../../api/interfaces/formDefinition2.0";
import { useSection86FormIntegration } from "../shared/section-context-integration";
import type { ValidationResult, ValidationError } from "../shared/base-interfaces";

// ============================================================================
// SECTION7 INTERFACES - RESIDENCE HISTORY STRUCTURE
// ============================================================================

/**
 * Address structure for residence entries
 */
interface Address {
  street: Field<string>;
  city: Field<string>;
  state: Field<string>;
  zipCode: Field<string>;
  country: Field<string>;
}

/**
 * Date information with estimation flag
 */
interface DateInfo {
  date: Field<string>;
  estimated: Field<boolean>;
}

/**
 * Date range for residence periods
 */
interface DateRange {
  from: DateInfo;
  to: DateInfo;
  present: Field<boolean>;
}

/**
 * Individual residence entry
 */
interface ResidenceEntry {
  _id: number | string;
  address: Address;
  dateRange: DateRange;
  residenceType: Field<string>; // Own, Rent, Military Housing, etc.
  verificationSource: Field<string>; // Who can verify this residence
  verificationPhone: Field<string>;
}

/**
 * Section7 data structure for residence history
 */
interface Section7Data {
  _id: number;
  residenceHistory: {
    hasHistory: Field<"YES" | "NO">;
    entries: ResidenceEntry[];
  };
}

/**
 * Section7 subsection keys
 */
type Section7SubsectionKey = 'residenceHistory';

// ============================================================================
// SECTION7 CONTEXT INTERFACE
// ============================================================================

/**
 * Section7 Context Type with SF86Form integration
 */
interface Section7ContextType {
  // ============================================================================
  // CORE STATE
  // ============================================================================

  // State
  section7Data: Section7Data;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // ============================================================================
  // SECTION-SPECIFIC CRUD OPERATIONS
  // ============================================================================

  // Basic Actions
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
  bulkUpdateResidenceFields: (entryIndex: number, fieldUpdates: Record<string, any>) => void;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section7Data) => void;
  validateSection: () => ValidationResult;
  getChanges: () => any;

  // ============================================================================
  // SF86FORM INTEGRATION CAPABILITIES
  // ============================================================================

  // Global Form Operations
  markComplete: () => void;
  markIncomplete: () => void;
  triggerGlobalValidation: () => ValidationResult;
  getGlobalFormState: () => any;
  navigateToSection: (sectionId: string) => void;
  saveForm: () => Promise<void>;

  // Event System
  emitEvent: (event: any) => void;
  subscribeToEvents: (eventType: string, callback: Function) => () => void;
  notifyChange: (changeType: string, payload: any) => void;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

/**
 * Create initial state for Section7 (Residence History)
 */
const createInitialSection7State = (): Section7Data => ({
  _id: 7,
  residenceHistory: {
    hasHistory: {
      id: "form1[0].Section7[0].RadioButtonList[0]",
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

/**
 * Create residence entry template
 */
const createResidenceEntryTemplate = (entryIndex: number): ResidenceEntry => ({
  _id: Date.now() + Math.random(),
  address: {
    street: {
      id: `form1[0].Section7[0].TextField[${entryIndex * 5}]`,
      type: "text",
      label: "Street Address",
      value: "",
      isDirty: false,
      isValid: true,
      errors: []
    },
    city: {
      id: `form1[0].Section7[0].TextField[${entryIndex * 5 + 1}]`,
      type: "text",
      label: "City",
      value: "",
      isDirty: false,
      isValid: true,
      errors: []
    },
    state: {
      id: `form1[0].Section7[0].DropDownList[${entryIndex}]`,
      type: "select",
      label: "State",
      value: "",
      isDirty: false,
      isValid: true,
      errors: []
    },
    zipCode: {
      id: `form1[0].Section7[0].TextField[${entryIndex * 5 + 2}]`,
      type: "text",
      label: "ZIP Code",
      value: "",
      isDirty: false,
      isValid: true,
      errors: []
    },
    country: {
      id: `form1[0].Section7[0].TextField[${entryIndex * 5 + 3}]`,
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
        id: `form1[0].Section7[0].DateField[${entryIndex * 2}]`,
        type: "date",
        label: "From Date",
        value: "",
        isDirty: false,
        isValid: true,
        errors: []
      },
      estimated: {
        id: `form1[0].Section7[0].CheckBox[${entryIndex * 3}]`,
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
        id: `form1[0].Section7[0].DateField[${entryIndex * 2 + 1}]`,
        type: "date",
        label: "To Date",
        value: "",
        isDirty: false,
        isValid: true,
        errors: []
      },
      estimated: {
        id: `form1[0].Section7[0].CheckBox[${entryIndex * 3 + 1}]`,
        type: "checkbox",
        label: "Estimated",
        value: false,
        isDirty: false,
        isValid: true,
        errors: []
      }
    },
    present: {
      id: `form1[0].Section7[0].CheckBox[${entryIndex * 3 + 2}]`,
      type: "checkbox",
      label: "Present",
      value: false,
      isDirty: false,
      isValid: true,
      errors: []
    }
  },
  residenceType: {
    id: `form1[0].Section7[0].DropDownList[${entryIndex + 100}]`,
    type: "select",
    label: "Residence Type",
    value: "",
    isDirty: false,
    isValid: true,
    errors: []
  },
  verificationSource: {
    id: `form1[0].Section7[0].TextField[${entryIndex * 5 + 4}]`,
    type: "text",
    label: "Verification Source",
    value: "",
    isDirty: false,
    isValid: true,
    errors: []
  },
  verificationPhone: {
    id: `form1[0].Section7[0].TextField[${entryIndex * 5 + 5}]`,
    type: "tel",
    label: "Verification Phone",
    value: "",
    isDirty: false,
    isValid: true,
    errors: []
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Update field IDs when entry index changes
 */
const updateEntryFieldIds = (entry: ResidenceEntry, newEntryIndex: number) => {
  // Update address field IDs
  entry.address.street.id = `form1[0].Section7[0].TextField[${newEntryIndex * 5}]`;
  entry.address.city.id = `form1[0].Section7[0].TextField[${newEntryIndex * 5 + 1}]`;
  entry.address.state.id = `form1[0].Section7[0].DropDownList[${newEntryIndex}]`;
  entry.address.zipCode.id = `form1[0].Section7[0].TextField[${newEntryIndex * 5 + 2}]`;
  entry.address.country.id = `form1[0].Section7[0].TextField[${newEntryIndex * 5 + 3}]`;

  // Update date range field IDs
  entry.dateRange.from.date.id = `form1[0].Section7[0].DateField[${newEntryIndex * 2}]`;
  entry.dateRange.from.estimated.id = `form1[0].Section7[0].CheckBox[${newEntryIndex * 3}]`;
  entry.dateRange.to.date.id = `form1[0].Section7[0].DateField[${newEntryIndex * 2 + 1}]`;
  entry.dateRange.to.estimated.id = `form1[0].Section7[0].CheckBox[${newEntryIndex * 3 + 1}]`;
  entry.dateRange.present.id = `form1[0].Section7[0].CheckBox[${newEntryIndex * 3 + 2}]`;

  // Update other field IDs
  entry.residenceType.id = `form1[0].Section7[0].DropDownList[${newEntryIndex + 100}]`;
  entry.verificationSource.id = `form1[0].Section7[0].TextField[${newEntryIndex * 5 + 4}]`;
  entry.verificationPhone.id = `form1[0].Section7[0].TextField[${newEntryIndex * 5 + 5}]`;
};

/**
 * Clear all field values in an entry
 */
const clearEntryValues = (entry: ResidenceEntry) => {
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

  clearFieldsRecursively(entry);
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
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section7Data, setSection7Data] = useState<Section7Data>(createInitialSection7State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section7Data>(createInitialSection7State());

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  /**
   * Validation function for Section7 (Residence History)
   */
  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];

    // Validate residence history flag
    if (!section7Data.residenceHistory?.hasHistory?.value) {
      validationErrors.push({
        field: 'residenceHistory.hasHistory',
        message: 'Please answer about your residence history',
        code: 'REQUIRED',
        severity: 'error'
      });
    }

    // If NO to 3+ years at current address, validate entries
    if (section7Data.residenceHistory?.hasHistory?.value === 'NO') {
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
          // Validate address
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

          if (!entry.address.state.value) {
            validationErrors.push({
              field: `residenceHistory.entries[${index}].address.state`,
              message: `State is required for residence ${index + 1}`,
              code: 'REQUIRED',
              severity: 'error'
            });
          }

          // Validate date range
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

          // Validate residence type
          if (!entry.residenceType.value) {
            validationErrors.push({
              field: `residenceHistory.entries[${index}].residenceType`,
              message: `Residence type is required for residence ${index + 1}`,
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

  /**
   * Change tracking function for SF86Form integration
   */
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

  /**
   * SF86Form integration hook
   */
  const integration = useSection86FormIntegration(
    'section7',
    'Section 7: Residence History',
    section7Data,
    setSection7Data,
    validateSection,
    getChanges
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = useMemo(() => {
    return JSON.stringify(section7Data) !== JSON.stringify(initialData);
  }, [section7Data, initialData]);

  // ============================================================================
  // SECTION-SPECIFIC CRUD OPERATIONS
  // ============================================================================

  /**
   * Update residence history flag
   */
  const updateResidenceHistoryFlag = useCallback((hasValue: "YES" | "NO") => {
    setSection7Data(prev => {
      const updated = cloneDeep(prev);
      updated.residenceHistory.hasHistory.value = hasValue;
      return updated;
    });

    // Notify integration of change
    integration.notifyChange('residence_history_flag_updated', { hasValue });
  }, [integration]);

  /**
   * Add new residence entry
   */
  const addResidenceEntry = useCallback(() => {
    setSection7Data(prev => {
      const updated = cloneDeep(prev);
      const entryIndex = updated.residenceHistory.entries.length;
      const newEntry = createResidenceEntryTemplate(entryIndex);
      updated.residenceHistory.entries.push(newEntry);
      return updated;
    });

    // Notify integration of change
    integration.notifyChange('residence_entry_added', {});
  }, [integration]);

  /**
   * Remove residence entry
   */
  const removeResidenceEntry = useCallback((entryIndex: number) => {
    setSection7Data(prev => {
      const updated = cloneDeep(prev);
      if (entryIndex >= 0 && entryIndex < updated.residenceHistory.entries.length) {
        updated.residenceHistory.entries.splice(entryIndex, 1);
      }
      return updated;
    });

    // Notify integration of change
    integration.notifyChange('residence_entry_removed', { entryIndex });
  }, [integration]);

  /**
   * Update field value in residence entry
   */
  const updateFieldValue = useCallback((
    entryIndex: number,
    fieldPath: string,
    newValue: any
  ) => {
    setSection7Data(prev => {
      const updated = cloneDeep(prev);
      const fullPath = `residenceHistory.entries[${entryIndex}].${fieldPath}`;
      set(updated, fullPath, newValue);
      return updated;
    });

    // Notify integration of change
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

    // Notify integration of change
    integration.notifyChange('residence_entry_moved', { fromIndex, toIndex });
  }, [integration]);

  const duplicateResidenceEntry = useCallback((entryIndex: number) => {
    setSection7Data(prev => {
      const updated = cloneDeep(prev);
      const originalEntry = updated.residenceHistory.entries[entryIndex];
      if (originalEntry) {
        const duplicatedEntry = cloneDeep(originalEntry);
        // Generate new unique ID
        duplicatedEntry._id = Date.now() + Math.random();

        // Update field IDs to be unique
        const newEntryIndex = updated.residenceHistory.entries.length;
        updateEntryFieldIds(duplicatedEntry, newEntryIndex);

        updated.residenceHistory.entries.push(duplicatedEntry);
      }
      return updated;
    });

    // Notify integration of change
    integration.notifyChange('residence_entry_duplicated', { entryIndex });
  }, [integration]);

  const clearResidenceEntry = useCallback((entryIndex: number) => {
    setSection7Data(prev => {
      const updated = cloneDeep(prev);
      const entry = updated.residenceHistory.entries[entryIndex];
      if (entry) {
        // Clear all field values but keep structure
        clearEntryValues(entry);
      }
      return updated;
    });

    // Notify integration of change
    integration.notifyChange('residence_entry_cleared', { entryIndex });
  }, [integration]);

  const bulkUpdateResidenceFields = useCallback((
    entryIndex: number,
    fieldUpdates: Record<string, any>
  ) => {
    setSection7Data(prev => {
      const updated = cloneDeep(prev);

      Object.entries(fieldUpdates).forEach(([fieldPath, newValue]) => {
        const fullPath = `residenceHistory.entries[${entryIndex}].${fieldPath}`;
        set(updated, fullPath, newValue);
      });

      return updated;
    });

    // Notify integration of change
    integration.notifyChange('residence_fields_bulk_updated', { entryIndex, fieldUpdates });
  }, [integration]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = createInitialSection7State();
    setSection7Data(newData);
    setErrors({});

    // Notify integration of reset
    integration.notifyChange('section_reset', { newData });
  }, [integration]);

  const loadSection = useCallback((data: Section7Data) => {
    setSection7Data(cloneDeep(data));
    setErrors({});

    // Notify integration of load
    integration.notifyChange('section_loaded', { data });
  }, [integration]);

  // ============================================================================
  // CONTEXT VALUE WITH INTEGRATION
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
    bulkUpdateResidenceFields,

    // Utility
    resetSection,
    loadSection,
    validateSection,
    getChanges,

    // SF86Form Integration Capabilities
    markComplete: integration.markComplete,
    markIncomplete: integration.markIncomplete,
    triggerGlobalValidation: integration.triggerGlobalValidation,
    getGlobalFormState: integration.getGlobalFormState,
    navigateToSection: integration.navigateToSection,
    saveForm: integration.saveForm,

    // Event System
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
// CUSTOM HOOK
// ============================================================================

/**
 * Hook to use Section7 Context with SF86Form integration
 */
export const useSection7 = (): Section7ContextType => {
  const context = useContext(Section7Context);
  if (!context) {
    throw new Error('useSection7 must be used within a Section7Provider');
  }
  return context;
};

// ============================================================================
// BACKWARD COMPATIBILITY AND UTILITIES
// ============================================================================

/**
 * Legacy export for backward compatibility
 */
export { Section7Provider as Section7ProviderIntegrated };
export { useSection7 as useSection7Integrated };

/**
 * Utility to safely use integration features with fallback
 */
export const useSection7WithFallback = () => {
  const context = useSection7();

  return {
    ...context,
    // Safe integration methods with fallbacks
    markComplete: context.markComplete || (() => console.warn('Integration not available: markComplete')),
    markIncomplete: context.markIncomplete || (() => console.warn('Integration not available: markIncomplete')),
    triggerGlobalValidation: context.triggerGlobalValidation || (() => ({ isValid: true, errors: [], warnings: [] })),
    getGlobalFormState: context.getGlobalFormState || (() => ({})),
    navigateToSection: context.navigateToSection || ((sectionId: string) => console.warn(`Integration not available: navigateToSection(${sectionId})`)),
    saveForm: context.saveForm || (async () => console.warn('Integration not available: saveForm')),
    emitEvent: context.emitEvent || ((event: any) => console.warn('Integration not available: emitEvent', event)),
    subscribeToEvents: context.subscribeToEvents || ((eventType: string, callback: Function) => () => {}),
    notifyChange: context.notifyChange || ((changeType: string, payload: any) => console.warn('Integration not available: notifyChange', changeType, payload))
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section7Provider;
export type { Section7ContextType, Section7Data, ResidenceEntry, Section7SubsectionKey };
