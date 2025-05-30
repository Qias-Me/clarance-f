/**
 * SF-86 Section Context Template
 *
 * This template provides a standardized structure for implementing any SF-86 section
 * following the proven Section29 patterns with SF86FormContext integration.
 *
 * USAGE:
 * 1. Copy this template to create a new section (e.g., section7.tsx)
 * 2. Replace all [SECTION_X] placeholders with your section details
 * 3. Update the interfaces and data structures for your section
 * 4. Implement section-specific CRUD operations
 * 5. Add validation logic specific to your section
 * 6. Test with the provided testing patterns
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
// [SECTION_X] INTERFACES - REPLACE WITH YOUR SECTION STRUCTURE
// ============================================================================

/**
 * Replace this with your section's data structure
 * Example: Section7 for residence history, Section13 for employment, etc.
 */
interface [SECTION_X]Data {
  _id: number;
  // Add your section-specific subsections here
  // Example for residence history:
  // residenceHistory: {
  //   hasHistory: Field<"YES" | "NO">;
  //   entries: ResidenceEntry[];
  // };
  // Example for employment:
  // employmentHistory: {
  //   hasEmployment: Field<"YES" | "NO">;
  //   entries: EmploymentEntry[];
  // };
}

/**
 * Replace with your section's entry types
 */
interface [SECTION_X]Entry {
  _id: number | string;
  // Add your entry-specific fields here
  // Example:
  // address: Address;
  // dateRange: DateRange;
  // description: Field<string>;
}

/**
 * Replace with your section's subsection keys
 */
type [SECTION_X]SubsectionKey =
  | 'subsection1'  // Replace with actual subsection names
  | 'subsection2'
  | 'subsection3';

// ============================================================================
// [SECTION_X] CONTEXT INTERFACE
// ============================================================================

/**
 * [SECTION_X] Context Type with SF86Form integration
 * Follow this pattern for all sections
 */
interface [SECTION_X]ContextType {
  // ============================================================================
  // CORE STATE (STANDARD FOR ALL SECTIONS)
  // ============================================================================

  // State
  [sectionX]Data: [SECTION_X]Data;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // ============================================================================
  // SECTION-SPECIFIC CRUD OPERATIONS (CUSTOMIZE FOR YOUR SECTION)
  // ============================================================================

  // Basic Actions (customize method names for your section)
  updateSubsectionFlag: (subsectionKey: [SECTION_X]SubsectionKey, hasValue: "YES" | "NO") => void;
  addEntry: (subsectionKey: [SECTION_X]SubsectionKey) => void;
  removeEntry: (subsectionKey: [SECTION_X]SubsectionKey, entryIndex: number) => void;
  updateFieldValue: (subsectionKey: [SECTION_X]SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => void;

  // Enhanced Entry Management (standard for all sections)
  getEntryCount: (subsectionKey: [SECTION_X]SubsectionKey) => number;
  getEntry: (subsectionKey: [SECTION_X]SubsectionKey, entryIndex: number) => [SECTION_X]Entry | null;
  moveEntry: (subsectionKey: [SECTION_X]SubsectionKey, fromIndex: number, toIndex: number) => void;
  duplicateEntry: (subsectionKey: [SECTION_X]SubsectionKey, entryIndex: number) => void;
  clearEntry: (subsectionKey: [SECTION_X]SubsectionKey, entryIndex: number) => void;
  bulkUpdateFields: (subsectionKey: [SECTION_X]SubsectionKey, entryIndex: number, fieldUpdates: Record<string, any>) => void;

  // Utility (standard for all sections)
  resetSection: () => void;
  loadSection: (data: [SECTION_X]Data) => void;
  validateSection: () => ValidationResult;
  getChanges: () => any;

  // ============================================================================
  // SF86FORM INTEGRATION CAPABILITIES (STANDARD FOR ALL SECTIONS)
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
// INITIAL STATE CREATION (CUSTOMIZE FOR YOUR SECTION)
// ============================================================================

/**
 * Create initial state for your section
 * Replace with your section's default data structure
 */
const createInitial[SECTION_X]State = (): [SECTION_X]Data => ({
  _id: [SECTION_NUMBER], // Replace with actual section number (e.g., 7, 13, etc.)
  // Add your section's initial subsections here
  // Example:
  // residenceHistory: {
  //   hasHistory: {
  //     id: "form1[0].Section7[0].RadioButtonList[0]",
  //     type: "radio",
  //     label: "Have you lived at your current address for at least 3 years?",
  //     value: "NO",
  //     isDirty: false,
  //     isValid: true,
  //     errors: []
  //   },
  //   entries: []
  // }
});

// ============================================================================
// ENTRY TEMPLATE CREATORS (CUSTOMIZE FOR YOUR SECTION)
// ============================================================================

/**
 * Create entry template for your section
 * Replace with your section's entry structure
 */
const create[SECTION_X]EntryTemplate = (entryIndex: number, subsectionKey: [SECTION_X]SubsectionKey): [SECTION_X]Entry => ({
  _id: Date.now() + Math.random(),
  // Add your entry fields here
  // Example:
  // address: {
  //   street: {
  //     id: `form1[0].Section7[0].TextField[${entryIndex}]`,
  //     type: "text",
  //     label: "Street Address",
  //     value: "",
  //     isDirty: false,
  //     isValid: true,
  //     errors: []
  //   },
  //   // ... other address fields
  // },
  // dateRange: {
  //   // ... date range fields
  // }
});

// ============================================================================
// HELPER FUNCTIONS (CUSTOMIZE FOR YOUR SECTION)
// ============================================================================

/**
 * Update field IDs when entry index changes
 * Customize the field paths for your section
 */
const updateEntryFieldIds = (entry: [SECTION_X]Entry, newEntryIndex: number, subsectionKey: [SECTION_X]SubsectionKey) => {
  // Implement field ID updates for your section's structure
  // Example:
  // if (entry.address?.street) {
  //   entry.address.street.id = `form1[0].Section7[0].TextField[${newEntryIndex}]`;
  // }
};

/**
 * Clear all field values in an entry
 * Standard implementation works for most sections
 */
const clearEntryValues = (entry: [SECTION_X]Entry) => {
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
// CONTEXT CREATION (STANDARD FOR ALL SECTIONS)
// ============================================================================

const [SECTION_X]Context = createContext<[SECTION_X]ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT (CUSTOMIZE VALIDATION AND CRUD OPERATIONS)
// ============================================================================

interface [SECTION_X]ProviderProps {
  children: ReactNode;
}

export const [SECTION_X]Provider: React.FC<[SECTION_X]ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT (STANDARD FOR ALL SECTIONS)
  // ============================================================================

  const [[sectionX]Data, set[SECTION_X]Data] = useState<[SECTION_X]Data>(createInitial[SECTION_X]State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<[SECTION_X]Data>(createInitial[SECTION_X]State());

  // ============================================================================
  // SF86FORM INTEGRATION (STANDARD FOR ALL SECTIONS)
  // ============================================================================

  /**
   * Validation function for SF86Form integration
   * CUSTOMIZE: Add your section-specific validation logic
   */
  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];

    // Add your section-specific validation logic here
    // Example:
    // if (!sectionXData.residenceHistory?.hasHistory?.value) {
    //   validationErrors.push({
    //     field: 'residenceHistory.hasHistory',
    //     message: 'Please answer about your residence history',
    //     code: 'REQUIRED',
    //     severity: 'error'
    //   });
    // }

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
  }, [[sectionX]Data]);

  /**
   * Change tracking function for SF86Form integration
   * STANDARD: This implementation works for all sections
   */
  const getChanges = useCallback(() => {
    const changes: Record<string, any> = {};

    if (JSON.stringify([sectionX]Data) !== JSON.stringify(initialData)) {
      changes.[sectionX] = {
        oldValue: initialData,
        newValue: [sectionX]Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [[sectionX]Data, initialData]);

  /**
   * SF86Form integration hook
   * STANDARD: Replace section ID and name
   */
  const integration = useSection86FormIntegration(
    '[sectionX]',  // Replace with actual section ID (e.g., 'section7')
    'Section [X]: [SECTION_NAME]',  // Replace with actual section name
    [sectionX]Data,
    set[SECTION_X]Data,
    validateSection,
    getChanges
  );

  // ============================================================================
  // COMPUTED VALUES (STANDARD FOR ALL SECTIONS)
  // ============================================================================

  const isDirty = useMemo(() => {
    return JSON.stringify([sectionX]Data) !== JSON.stringify(initialData);
  }, [[sectionX]Data, initialData]);

  // ============================================================================
  // SECTION-SPECIFIC CRUD OPERATIONS (CUSTOMIZE FOR YOUR SECTION)
  // ============================================================================

  /**
   * Update subsection flag (YES/NO questions)
   * CUSTOMIZE: Adjust for your section's subsection structure
   */
  const updateSubsectionFlag = useCallback((subsectionKey: [SECTION_X]SubsectionKey, hasValue: "YES" | "NO") => {
    set[SECTION_X]Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated[subsectionKey];

      // CUSTOMIZE: Adjust based on your subsection structure
      if (subsection && ('hasHistory' in subsection || 'hasEmployment' in subsection || 'hasAssociation' in subsection)) {
        // Update the appropriate flag field
        if ('hasHistory' in subsection) {
          subsection.hasHistory.value = hasValue;
        } else if ('hasEmployment' in subsection) {
          subsection.hasEmployment.value = hasValue;
        } else if ('hasAssociation' in subsection) {
          subsection.hasAssociation.value = hasValue;
        }
      }

      return updated;
    });

    // Notify integration of change
    integration.notifyChange('subsection_flag_updated', { subsectionKey, hasValue });
  }, [integration]);

  /**
   * Add new entry to subsection
   * CUSTOMIZE: Adjust for your section's entry types
   */
  const addEntry = useCallback((subsectionKey: [SECTION_X]SubsectionKey) => {
    set[SECTION_X]Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated[subsectionKey];

      if (subsection && 'entries' in subsection) {
        const entryIndex = subsection.entries.length;
        const newEntry = create[SECTION_X]EntryTemplate(entryIndex, subsectionKey);
        subsection.entries.push(newEntry);
      }

      return updated;
    });

    // Notify integration of change
    integration.notifyChange('entry_added', { subsectionKey });
  }, [integration]);

  /**
   * Remove entry from subsection
   * STANDARD: This implementation works for all sections
   */
  const removeEntry = useCallback((subsectionKey: [SECTION_X]SubsectionKey, entryIndex: number) => {
    set[SECTION_X]Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated[subsectionKey];

      if (subsection && 'entries' in subsection && Array.isArray(subsection.entries)) {
        if (entryIndex >= 0 && entryIndex < subsection.entries.length) {
          subsection.entries.splice(entryIndex, 1);
        }
      }

      return updated;
    });

    // Notify integration of change
    integration.notifyChange('entry_removed', { subsectionKey, entryIndex });
  }, [integration]);

  /**
   * Update field value in entry
   * STANDARD: This implementation works for all sections
   */
  const updateFieldValue = useCallback((
    subsectionKey: [SECTION_X]SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    newValue: any
  ) => {
    set[SECTION_X]Data(prev => {
      const updated = cloneDeep(prev);
      const fullPath = `${subsectionKey}.entries[${entryIndex}].${fieldPath}`;
      set(updated, fullPath, newValue);
      return updated;
    });

    // Notify integration of change
    integration.notifyChange('field_value_updated', { subsectionKey, entryIndex, fieldPath, newValue });
  }, [integration]);

  // ============================================================================
  // ENHANCED ENTRY MANAGEMENT (STANDARD FOR ALL SECTIONS)
  // ============================================================================

  const getEntryCount = useCallback((subsectionKey: [SECTION_X]SubsectionKey): number => {
    const subsection = [sectionX]Data[subsectionKey];
    return (subsection && 'entries' in subsection) ? subsection.entries.length : 0;
  }, [[sectionX]Data]);

  const getEntry = useCallback((subsectionKey: [SECTION_X]SubsectionKey, entryIndex: number): [SECTION_X]Entry | null => {
    const subsection = [sectionX]Data[subsectionKey];
    if (subsection && 'entries' in subsection && Array.isArray(subsection.entries)) {
      return subsection.entries[entryIndex] || null;
    }
    return null;
  }, [[sectionX]Data]);

  const moveEntry = useCallback((subsectionKey: [SECTION_X]SubsectionKey, fromIndex: number, toIndex: number) => {
    set[SECTION_X]Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated[subsectionKey];

      if (subsection && 'entries' in subsection && Array.isArray(subsection.entries)) {
        const entries = subsection.entries;
        if (fromIndex >= 0 && fromIndex < entries.length && toIndex >= 0 && toIndex < entries.length) {
          const [movedEntry] = entries.splice(fromIndex, 1);
          entries.splice(toIndex, 0, movedEntry);
        }
      }

      return updated;
    });

    // Notify integration of change
    integration.notifyChange('entry_moved', { subsectionKey, fromIndex, toIndex });
  }, [integration]);

  const duplicateEntry = useCallback((subsectionKey: [SECTION_X]SubsectionKey, entryIndex: number) => {
    set[SECTION_X]Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated[subsectionKey];

      if (subsection && 'entries' in subsection && Array.isArray(subsection.entries)) {
        const originalEntry = subsection.entries[entryIndex];
        if (originalEntry) {
          const duplicatedEntry = cloneDeep(originalEntry);
          // Generate new unique ID
          duplicatedEntry._id = Date.now() + Math.random();

          // Update field IDs to be unique
          const newEntryIndex = subsection.entries.length;
          updateEntryFieldIds(duplicatedEntry, newEntryIndex, subsectionKey);

          subsection.entries.push(duplicatedEntry);
        }
      }

      return updated;
    });

    // Notify integration of change
    integration.notifyChange('entry_duplicated', { subsectionKey, entryIndex });
  }, [integration]);

  const clearEntry = useCallback((subsectionKey: [SECTION_X]SubsectionKey, entryIndex: number) => {
    set[SECTION_X]Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated[subsectionKey];

      if (subsection && 'entries' in subsection && Array.isArray(subsection.entries)) {
        const entry = subsection.entries[entryIndex];
        if (entry) {
          // Clear all field values but keep structure
          clearEntryValues(entry);
        }
      }

      return updated;
    });

    // Notify integration of change
    integration.notifyChange('entry_cleared', { subsectionKey, entryIndex });
  }, [integration]);

  const bulkUpdateFields = useCallback((
    subsectionKey: [SECTION_X]SubsectionKey,
    entryIndex: number,
    fieldUpdates: Record<string, any>
  ) => {
    set[SECTION_X]Data(prev => {
      const updated = cloneDeep(prev);

      Object.entries(fieldUpdates).forEach(([fieldPath, newValue]) => {
        const fullPath = `${subsectionKey}.entries[${entryIndex}].${fieldPath}`;
        set(updated, fullPath, newValue);
      });

      return updated;
    });

    // Notify integration of change
    integration.notifyChange('fields_bulk_updated', { subsectionKey, entryIndex, fieldUpdates });
  }, [integration]);

  // ============================================================================
  // UTILITY FUNCTIONS (STANDARD FOR ALL SECTIONS)
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = createInitial[SECTION_X]State();
    set[SECTION_X]Data(newData);
    setErrors({});

    // Notify integration of reset
    integration.notifyChange('section_reset', { newData });
  }, [integration]);

  const loadSection = useCallback((data: [SECTION_X]Data) => {
    set[SECTION_X]Data(cloneDeep(data));
    setErrors({});

    // Notify integration of load
    integration.notifyChange('section_loaded', { data });
  }, [integration]);

  // ============================================================================
  // CONTEXT VALUE WITH INTEGRATION (STANDARD FOR ALL SECTIONS)
  // ============================================================================

  const contextValue: [SECTION_X]ContextType = {
    // ============================================================================
    // CORE STATE (STANDARD FOR ALL SECTIONS)
    // ============================================================================

    // State
    [sectionX]Data,
    isLoading,
    errors,
    isDirty,

    // ============================================================================
    // SECTION-SPECIFIC CRUD OPERATIONS (CUSTOMIZE METHOD NAMES)
    // ============================================================================

    // Basic Actions
    updateSubsectionFlag,
    addEntry,
    removeEntry,
    updateFieldValue,

    // Enhanced Entry Management
    getEntryCount,
    getEntry,
    moveEntry,
    duplicateEntry,
    clearEntry,
    bulkUpdateFields,

    // Utility
    resetSection,
    loadSection,
    validateSection,
    getChanges,

    // ============================================================================
    // SF86FORM INTEGRATION CAPABILITIES (STANDARD FOR ALL SECTIONS)
    // ============================================================================

    // Global Form Operations
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
    <[SECTION_X]Context.Provider value={contextValue}>
      {children}
    </[SECTION_X]Context.Provider>
  );
};

// ============================================================================
// CUSTOM HOOK (STANDARD FOR ALL SECTIONS)
// ============================================================================

/**
 * Hook to use [SECTION_X] Context with SF86Form integration
 * CUSTOMIZE: Replace hook name and error message
 */
export const use[SECTION_X] = (): [SECTION_X]ContextType => {
  const context = useContext([SECTION_X]Context);
  if (!context) {
    throw new Error('use[SECTION_X] must be used within a [SECTION_X]Provider');
  }
  return context;
};

// ============================================================================
  // BACKWARD COMPATIBILITY AND UTILITIES (STANDARD FOR ALL SECTIONS)
// ============================================================================

/**
 * Legacy export for backward compatibility
 */
export { [SECTION_X]Provider as [SECTION_X]ProviderIntegrated };
export { use[SECTION_X] as use[SECTION_X]Integrated };

/**
 * Utility to check if the context has integration capabilities
 */
export const hasIntegrationCapabilities = (context: any): boolean => {
  return !!(context?.markComplete && context?.triggerGlobalValidation && context?.navigateToSection);
};

/**
 * Utility to safely use integration features with fallback
 */
export const use[SECTION_X]WithFallback = () => {
  const context = use[SECTION_X]();

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
// EXPORTS (STANDARD FOR ALL SECTIONS)
// ============================================================================

export default [SECTION_X]Provider;
export type { [SECTION_X]ContextType, [SECTION_X]Data, [SECTION_X]Entry, [SECTION_X]SubsectionKey };

// ============================================================================
// TEMPLATE USAGE INSTRUCTIONS
// ============================================================================

/**
 * IMPLEMENTATION CHECKLIST:
 *
 * 1. REPLACE PLACEHOLDERS:
 *    - [SECTION_X] → Your section name (e.g., Section7, Section13)
 *    - [sectionX] → Camelcase version (e.g., section7, section13)
 *    - [SECTION_NUMBER] → Section number (e.g., 7, 13)
 *    - [SECTION_NAME] → Section title (e.g., "Residence History", "Employment")
 *
 * 2. CUSTOMIZE INTERFACES:
 *    - Update [SECTION_X]Data with your section's structure
 *    - Update [SECTION_X]Entry with your entry fields
 *    - Update [SECTION_X]SubsectionKey with your subsection names
 *
 * 3. IMPLEMENT TEMPLATES:
 *    - Update createInitial[SECTION_X]State() with your default data
 *    - Update create[SECTION_X]EntryTemplate() with your entry structure
 *    - Update updateEntryFieldIds() with your field paths
 *
 * 4. CUSTOMIZE VALIDATION:
 *    - Add your section-specific validation rules in validateSection()
 *    - Update error messages and field names
 *
 * 5. ADJUST CRUD OPERATIONS:
 *    - Customize updateSubsectionFlag() for your subsection structure
 *    - Adjust addEntry() if you have different entry types
 *    - Update method names if needed for your section
 *
 * 6. TEST IMPLEMENTATION:
 *    - Create test file following the testing patterns
 *    - Test all CRUD operations
 *    - Test SF86Form integration features
 *    - Verify backward compatibility
 *
 * 7. CREATE INTERFACES:
 *    - Add TypeScript interfaces to api/interfaces/sections/
 *    - Follow the Section29 interface patterns
 *
 * 8. DOCUMENTATION:
 *    - Document any section-specific patterns
 *    - Add usage examples
 *    - Update migration guides if needed
 */
