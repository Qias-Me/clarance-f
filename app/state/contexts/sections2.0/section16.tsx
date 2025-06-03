/**
 * Section 16: Foreign Activities - Context Provider
 *
 * React context provider for SF-86 Section 16 using the new Form Architecture 2.0.
 * This provider manages foreign activities data with full CRUD operations,
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
import type {
  Section16,
  Section16SubsectionKey,
  Section16FieldUpdate,
  Section16ValidationRules,
  Section16ValidationContext,
  ForeignActivitiesValidationResult,
  ForeignGovernmentActivityEntry,
  ForeignBusinessActivityEntry,
  ForeignOrganizationEntry,
  ForeignPropertyEntry,
  ForeignBusinessTravelEntry,
  ForeignConferenceEntry,
  ForeignGovernmentContactEntry
} from '../../../../api/interfaces/sections2.0/section16';
import {
  createDefaultSection16,
  createDefaultForeignGovernmentActivityEntry,
  createDefaultForeignBusinessActivityEntry,
  createDefaultForeignOrganizationEntry,
  createDefaultForeignPropertyEntry,
  createDefaultForeignBusinessTravelEntry,
  createDefaultForeignConferenceEntry,
  createDefaultForeignGovernmentContactEntry,
  updateSection16Field,
  validateForeignActivities,
  isSection16Complete
} from '../../../../api/interfaces/sections2.0/section16';

import { useSection86FormIntegration } from '../shared/section-context-integration';
import type { ValidationResult, ValidationError } from '../shared/base-interfaces';

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section16ContextType {
  // State
  section16Data: Section16;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Foreign Government Activities (16.1)
  addForeignGovernmentActivity: () => void;
  removeForeignGovernmentActivity: (index: number) => void;
  updateForeignGovernmentActivity: (index: number, activity: Partial<ForeignGovernmentActivityEntry>) => void;

  // Foreign Business Activities (16.2) 
  addForeignBusinessActivity: () => void;
  removeForeignBusinessActivity: (index: number) => void;
  updateForeignBusinessActivity: (index: number, activity: Partial<ForeignBusinessActivityEntry>) => void;

  // Foreign Organizations (16.3)
  addForeignOrganization: () => void;
  removeForeignOrganization: (index: number) => void;
  updateForeignOrganization: (index: number, organization: Partial<ForeignOrganizationEntry>) => void;

  // Foreign Property (16.4)
  addForeignProperty: () => void;
  removeForeignProperty: (index: number) => void;
  updateForeignProperty: (index: number, property: Partial<ForeignPropertyEntry>) => void;

  // Foreign Business Travel (16.5)
  addForeignBusinessTravel: () => void;
  removeForeignBusinessTravel: (index: number) => void;
  updateForeignBusinessTravel: (index: number, travel: Partial<ForeignBusinessTravelEntry>) => void;

  // Foreign Conferences (16.6)
  addForeignConference: () => void;
  removeForeignConference: (index: number) => void;
  updateForeignConference: (index: number, conference: Partial<ForeignConferenceEntry>) => void;

  // Foreign Government Contacts (16.7)
  addForeignGovernmentContact: () => void;
  removeForeignGovernmentContact: (index: number) => void;
  updateForeignGovernmentContact: (index: number, contact: Partial<ForeignGovernmentContactEntry>) => void;

  // General Field Updates
  updateFieldValue: (path: string, value: any) => void;
  updateField: (update: Section16FieldUpdate) => void;

  // Validation
  validateSection: () => ValidationResult;
  validateForeignActivities: () => ForeignActivitiesValidationResult;

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
  requiresActivityDetailsIfYes: true,
  requiresContactInfoForActivities: true,
  requiresFinancialDisclosure: true,
  requiresDateRanges: true,
  maxDescriptionLength: 1000,
  maxNameLength: 100
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

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(section16Data) !== JSON.stringify(initialData);

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

    const foreignActivitiesValidation = validateForeignActivities(section16Data.section16, validationContext);

    if (!foreignActivitiesValidation.isValid) {
      foreignActivitiesValidation.errors.forEach(error => {
        validationErrors.push({
          field: 'foreignActivities',
          message: error,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      });
    }

    foreignActivitiesValidation.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'foreignActivities',
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

  const validateForeignActivitiesOnly = useCallback((): ForeignActivitiesValidationResult => {
    const validationContext: Section16ValidationContext = {
      rules: defaultValidationRules,
      allowPartialCompletion: false
    };

    return validateForeignActivities(section16Data.section16, validationContext);
  }, [section16Data]);

  // ============================================================================
  // CRUD OPERATIONS - FOREIGN GOVERNMENT ACTIVITIES
  // ============================================================================

  const addForeignGovernmentActivity = useCallback(() => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      const newActivity = createDefaultForeignGovernmentActivityEntry();
      newData.section16.foreignGovernmentActivities.push(newActivity);
      return newData;
    });
  }, []);

  const removeForeignGovernmentActivity = useCallback((index: number) => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      if (index >= 0 && index < newData.section16.foreignGovernmentActivities.length) {
        newData.section16.foreignGovernmentActivities.splice(index, 1);
      }
      return newData;
    });
  }, []);

  const updateForeignGovernmentActivity = useCallback((index: number, activity: Partial<ForeignGovernmentActivityEntry>) => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      if (index >= 0 && index < newData.section16.foreignGovernmentActivities.length) {
        Object.assign(newData.section16.foreignGovernmentActivities[index], activity);
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // CRUD OPERATIONS - FOREIGN BUSINESS ACTIVITIES
  // ============================================================================

  const addForeignBusinessActivity = useCallback(() => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section16.foreignBusinessActivities.push(createDefaultForeignBusinessActivityEntry());
      return newData;
    });
  }, []);

  const removeForeignBusinessActivity = useCallback((index: number) => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      if (index >= 0 && index < newData.section16.foreignBusinessActivities.length) {
        newData.section16.foreignBusinessActivities.splice(index, 1);
      }
      return newData;
    });
  }, []);

  const updateForeignBusinessActivity = useCallback((index: number, activity: Partial<ForeignBusinessActivityEntry>) => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      if (index >= 0 && index < newData.section16.foreignBusinessActivities.length) {
        Object.assign(newData.section16.foreignBusinessActivities[index], activity);
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // CRUD OPERATIONS - FOREIGN ORGANIZATIONS
  // ============================================================================

  const addForeignOrganization = useCallback(() => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section16.foreignOrganizations.push(createDefaultForeignOrganizationEntry());
      return newData;
    });
  }, []);

  const removeForeignOrganization = useCallback((index: number) => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      if (index >= 0 && index < newData.section16.foreignOrganizations.length) {
        newData.section16.foreignOrganizations.splice(index, 1);
      }
      return newData;
    });
  }, []);

  const updateForeignOrganization = useCallback((index: number, organization: Partial<ForeignOrganizationEntry>) => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      if (index >= 0 && index < newData.section16.foreignOrganizations.length) {
        Object.assign(newData.section16.foreignOrganizations[index], organization);
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // CRUD OPERATIONS - FOREIGN PROPERTY
  // ============================================================================

  const addForeignProperty = useCallback(() => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section16.foreignProperty.push(createDefaultForeignPropertyEntry());
      return newData;
    });
  }, []);

  const removeForeignProperty = useCallback((index: number) => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      if (index >= 0 && index < newData.section16.foreignProperty.length) {
        newData.section16.foreignProperty.splice(index, 1);
      }
      return newData;
    });
  }, []);

  const updateForeignProperty = useCallback((index: number, property: Partial<ForeignPropertyEntry>) => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      if (index >= 0 && index < newData.section16.foreignProperty.length) {
        Object.assign(newData.section16.foreignProperty[index], property);
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // CRUD OPERATIONS - FOREIGN BUSINESS TRAVEL
  // ============================================================================

  const addForeignBusinessTravel = useCallback(() => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section16.foreignBusinessTravel.push(createDefaultForeignBusinessTravelEntry());
      return newData;
    });
  }, []);

  const removeForeignBusinessTravel = useCallback((index: number) => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      if (index >= 0 && index < newData.section16.foreignBusinessTravel.length) {
        newData.section16.foreignBusinessTravel.splice(index, 1);
      }
      return newData;
    });
  }, []);

  const updateForeignBusinessTravel = useCallback((index: number, travel: Partial<ForeignBusinessTravelEntry>) => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      if (index >= 0 && index < newData.section16.foreignBusinessTravel.length) {
        Object.assign(newData.section16.foreignBusinessTravel[index], travel);
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // CRUD OPERATIONS - FOREIGN CONFERENCES
  // ============================================================================

  const addForeignConference = useCallback(() => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section16.foreignConferences.push(createDefaultForeignConferenceEntry());
      return newData;
    });
  }, []);

  const removeForeignConference = useCallback((index: number) => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      if (index >= 0 && index < newData.section16.foreignConferences.length) {
        newData.section16.foreignConferences.splice(index, 1);
      }
      return newData;
    });
  }, []);

  const updateForeignConference = useCallback((index: number, conference: Partial<ForeignConferenceEntry>) => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      if (index >= 0 && index < newData.section16.foreignConferences.length) {
        Object.assign(newData.section16.foreignConferences[index], conference);
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // CRUD OPERATIONS - FOREIGN GOVERNMENT CONTACTS
  // ============================================================================

  const addForeignGovernmentContact = useCallback(() => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section16.foreignGovernmentContacts.push(createDefaultForeignGovernmentContactEntry());
      return newData;
    });
  }, []);

  const removeForeignGovernmentContact = useCallback((index: number) => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      if (index >= 0 && index < newData.section16.foreignGovernmentContacts.length) {
        newData.section16.foreignGovernmentContacts.splice(index, 1);
      }
      return newData;
    });
  }, []);

  const updateForeignGovernmentContact = useCallback((index: number, contact: Partial<ForeignGovernmentContactEntry>) => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      if (index >= 0 && index < newData.section16.foreignGovernmentContacts.length) {
        Object.assign(newData.section16.foreignGovernmentContacts[index], contact);
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // GENERAL FIELD OPERATIONS
  // ============================================================================

  const updateFieldValue = useCallback((path: string, value: any) => {
    setSection16Data(prevData => {
      const newData = cloneDeep(prevData);
      set(newData, path, value);
      return newData;
    });
  }, []);

  const updateField = useCallback((update: Section16FieldUpdate) => {
    setSection16Data(prevData => {
      return updateSection16Field(prevData, update);
    });
  }, []);

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

  const getChanges = useCallback(() => {
    const changes: Record<string, any> = {};
    if (JSON.stringify(section16Data) !== JSON.stringify(initialData)) {
      changes.section16 = {
        oldValue: initialData,
        newValue: section16Data,
        timestamp: new Date()
      };
    }
    return changes;
  }, [section16Data, initialData]);

  const isComplete = useCallback(() => {
    return isSection16Complete(section16Data);
  }, [section16Data]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Integration with main form context using standard pattern
  const integration = useSection86FormIntegration(
    'section16',
    'Section 16: Foreign Activities',
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

    // Foreign Government Activities (16.1)
    addForeignGovernmentActivity,
    removeForeignGovernmentActivity,
    updateForeignGovernmentActivity,

    // Foreign Business Activities (16.2)
    addForeignBusinessActivity,
    removeForeignBusinessActivity,
    updateForeignBusinessActivity,

    // Foreign Organizations (16.3)
    addForeignOrganization,
    removeForeignOrganization,
    updateForeignOrganization,

    // Foreign Property (16.4)
    addForeignProperty,
    removeForeignProperty,
    updateForeignProperty,

    // Foreign Business Travel (16.5)
    addForeignBusinessTravel,
    removeForeignBusinessTravel,
    updateForeignBusinessTravel,

    // Foreign Conferences (16.6)
    addForeignConference,
    removeForeignConference,
    updateForeignConference,

    // Foreign Government Contacts (16.7)
    addForeignGovernmentContact,
    removeForeignGovernmentContact,
    updateForeignGovernmentContact,

    // General Field Updates
    updateFieldValue,
    updateField,

    // Validation
    validateSection,
    validateForeignActivities: validateForeignActivitiesOnly,

    // Utility
    resetSection,
    loadSection,
    getChanges,
    isComplete
  }), [
    section16Data, isLoading, errors, isDirty,
    addForeignGovernmentActivity, removeForeignGovernmentActivity, updateForeignGovernmentActivity,
    addForeignBusinessActivity, removeForeignBusinessActivity, updateForeignBusinessActivity,
    addForeignOrganization, removeForeignOrganization, updateForeignOrganization,
    addForeignProperty, removeForeignProperty, updateForeignProperty,
    addForeignBusinessTravel, removeForeignBusinessTravel, updateForeignBusinessTravel,
    addForeignConference, removeForeignConference, updateForeignConference,
    addForeignGovernmentContact, removeForeignGovernmentContact, updateForeignGovernmentContact,
    updateFieldValue, updateField, validateSection, validateForeignActivitiesOnly,
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