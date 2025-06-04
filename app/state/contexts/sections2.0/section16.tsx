/**
 * Section 16: People Who Know You Well - Context Provider
 *
 * React context provider for SF-86 Section 16 using the new Form Architecture 2.0.
 * This provider manages "People Who Know You Well" data with full CRUD operations,
 * validation, and integration with the central SF86FormContext.
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
import isEqual from 'lodash/isEqual';
import type {
  Section16,
  Section16SubsectionKey,
  Section16ValidationRules,
  Section16ValidationContext,
  Section16ValidationResult,
  ForeignOrganizationContactEntry,
  PersonWhoKnowsYouEntry
} from '../../../../api/interfaces/sections2.0/section16';
import {
  createDefaultSection16,
  createDefaultForeignOrganizationContactEntry,
  createDefaultPersonWhoKnowsYouEntry,
  validateSection16
} from '../../../../api/interfaces/sections2.0/section16';

import { useSection86FormIntegration } from '../shared/section-context-integration';
import type { ValidationResult, ValidationError, ChangeSet } from '../shared/base-interfaces';
import { SectionLogger, PerformanceMonitor } from '../shared/section-optimization-utils';

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section16ContextType {
  // State
  section16Data: Section16;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Entries 1-3: People Who Know You Well (Section16_3) - 36 fields each
  // Note: Section16_1 fields actually map to Section 15 Entry 2 (handled in Section15Context)
  updatePersonWhoKnowsYou: (index: number, person: Partial<PersonWhoKnowsYouEntry>) => void;

  // General Field Updates
  updateFieldValue: (path: string, value: any) => void;

  // Validation
  validateSection: () => ValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section16) => void;
  getChanges: () => any;
  isComplete: () => boolean;
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

const defaultValidationRules: Section16ValidationRules = {
  requiresForeignOrgContact: true,
  requiresAllThreePeople: true,
  requiresContactInfo: true,
  requiresDateRanges: true,
  maxNameLength: 100,
  minNameLength: 1
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createInitialSection16State(): Section16 {
  return createDefaultSection16();
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section16Context = createContext<Section16ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section16ProviderProps {
  children: React.ReactNode;
}

export const Section16Provider: React.FC<Section16ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section16Data, setSection16Data] = useState<Section16>(createInitialSection16State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section16>(createInitialSection16State());
  const [isInitialized, setIsInitialized] = useState(false);

  // Generate unique context ID for logging
  const contextId = useMemo(() => `section16-${Date.now()}`, []);

  // Initialize logging
  useEffect(() => {
    SectionLogger.info('section16', contextId, 'Section 16 context initialized', {
      totalPeople: section16Data.section16.peopleWhoKnowYou.length,
      expectedFields: 108
    });
  }, [contextId]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Compute isDirty following Section 1 pattern
  const isDirty = useMemo(() => {
    return JSON.stringify(section16Data) !== JSON.stringify(initialData);
  }, [section16Data, initialData]);

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

    const validationContext: Section16ValidationContext = {
      rules: defaultValidationRules,
      allowPartialCompletion: false
    };

    const section16Validation = validateSection16(section16Data.section16, validationContext);

    if (!section16Validation.isValid) {
      section16Validation.errors.forEach(error => {
        validationErrors.push({
          field: 'section16',
          message: error,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      });
    }

    section16Validation.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'section16',
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
  }, [section16Data]);

  // ============================================================================
  // NOTE: Section16_1 fields actually map to Section 15 Entry 2
  // The updateForeignOrganizationContact function is now in Section15Context
  // ============================================================================

  // ============================================================================
  // CRUD OPERATIONS - ENTRIES 2-4: PEOPLE WHO KNOW YOU WELL
  // ============================================================================

  const updatePersonWhoKnowsYou = useCallback((index: number, person: Partial<PersonWhoKnowsYouEntry>) => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      if (index >= 0 && index < newData.section16.peopleWhoKnowYou.length) {
        // FIXED: Properly handle Field<T> structure updates
        const currentPerson = newData.section16.peopleWhoKnowYou[index];

        // Update each field while preserving Field<T> structure
        Object.keys(person).forEach(key => {
          const fieldKey = key as keyof PersonWhoKnowsYouEntry;
          const newValue = person[fieldKey];

          if (newValue !== undefined) {
            if (fieldKey === 'address' && typeof newValue === 'object') {
              // Handle nested address object - newValue is the entire address object
              Object.keys(newValue).forEach(addressKey => {
                const addressField = addressKey as keyof typeof newValue;
                const newAddressFieldValue = (newValue as any)[addressField];

                if (currentPerson.address[addressField] && typeof currentPerson.address[addressField] === 'object') {
                  // If newAddressFieldValue is a Field<T> object, replace the entire field
                  // If it's a primitive value, update just the .value property
                  if (newAddressFieldValue && typeof newAddressFieldValue === 'object' && 'value' in newAddressFieldValue) {
                    // Replace entire Field<T> object
                    (currentPerson.address as any)[addressField] = newAddressFieldValue;
                  } else {
                    // Update just the .value property
                    (currentPerson.address[addressField] as any).value = newAddressFieldValue;
                  }
                }
              });
            } else if (currentPerson[fieldKey] && typeof currentPerson[fieldKey] === 'object') {
              // Handle direct fields - check if newValue is a Field<T> object or primitive value
              if (newValue && typeof newValue === 'object' && 'value' in newValue) {
                // Replace entire Field<T> object
                (currentPerson as any)[fieldKey] = newValue;
              } else {
                // Update just the .value property
                (currentPerson[fieldKey] as any).value = newValue;
              }
            } else {
              // Direct assignment for non-Field types
              (currentPerson as any)[fieldKey] = newValue;
            }
          }
        });
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // GENERAL FIELD OPERATIONS
  // ============================================================================

  /**
   * Generic field update function for integration compatibility
   * Simplified approach following Section 1 pattern
   */
  const updateFieldValue = useCallback((path: string, value: any) => {
    PerformanceMonitor.startTiming(`updateField-${path}`);

    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);

      try {
        // Use lodash set for all field updates - simpler and more reliable
        set(newData, path, value);

        SectionLogger.info('section16', contextId, `Field updated: ${path}`, {
          newValue: value
        });

        PerformanceMonitor.endTiming('section16', contextId, `updateField-${path}`);
        return newData;
      } catch (error) {
        SectionLogger.error('section16', contextId, `Failed to update field: ${path}`, {
          path,
          value,
          error: error instanceof Error ? error.message : String(error)
        });
        PerformanceMonitor.endTiming('section16', contextId, `updateField-${path}`);
        return prevData;
      }
    });
  }, [contextId]);

  // ============================================================================
  // UTILITY OPERATIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    setSection16Data(createInitialSection16State());
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section16) => {
    setSection16Data(data);
    setErrors({});
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Simple change detection following Section 1 pattern
    if (JSON.stringify(section16Data) !== JSON.stringify(initialData)) {
      changes['section16'] = {
        oldValue: initialData,
        newValue: section16Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section16Data, initialData]);

  const isComplete = useCallback(() => {
    // NOTE: Section16_1 fields (Foreign Organization Contact) are handled in Section 15 Entry 2
    // Section 16 only handles "People Who Know You Well" (Section16_3)

    // Check if we have all 3 people who know you well
    const hasRequiredPeople = section16Data.section16.peopleWhoKnowYou.length >= 3;

    // Check if at least some basic information is filled for each person
    const hasPeopleInfo = section16Data.section16.peopleWhoKnowYou.every(person =>
      person.firstName?.value && person.lastName?.value
    );

    // Check if at least one person has contact information
    const hasContactInfo = section16Data.section16.peopleWhoKnowYou.some(person =>
      person.emailAddress?.value || person.phoneNumber?.value || person.mobileNumber?.value
    );

    return hasRequiredPeople && hasPeopleInfo && hasContactInfo;
  }, [section16Data]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Integration with main form context using standard pattern
  const integration = useSection86FormIntegration(
    'section16',
    'Section 16: People Who Know You Well',
    section16Data,
    setSection16Data,
    validateSection,
    getChanges,
    updateFieldValue
  );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section16ContextType = useMemo(() => ({
    // State
    section16Data,
    isLoading,
    errors,
    isDirty,

    // Entries 1-3: People Who Know You Well (Section16_3)
    // Note: Section16_1 fields map to Section 15 Entry 2
    updatePersonWhoKnowsYou,

    // General Field Updates
    updateFieldValue,

    // Validation
    validateSection,

    // Utility
    resetSection,
    loadSection,
    getChanges,
    isComplete
  }), [
    section16Data, isLoading, errors, isDirty,
    updatePersonWhoKnowsYou, updateFieldValue, validateSection,
    resetSection, loadSection, getChanges, isComplete
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Section16Context.Provider value={contextValue}>
      {children}
    </Section16Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection16 = (): Section16ContextType => {
  const context = useContext(Section16Context);
  if (context === undefined) {
    throw new Error('useSection16 must be used within a Section16Provider');
  }
  return context;
}; 