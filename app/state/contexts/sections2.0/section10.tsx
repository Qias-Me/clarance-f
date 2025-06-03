import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import get from "lodash/get";
import { createFieldFromReference } from "../../../../api/utils/sections-references-loader";
import type { BaseSectionContext, SectionRegistration } from "../shared/base-interfaces";
import { useSectionIntegration } from "../shared/section-integration";
import { SECTION10_1_FIELD_NAMES, SECTION10_2_FIELD_NAMES } from "../../../../api/interfaces/sections2.0/section10";

// ============================================================================
// INTERFACES
// ============================================================================

// Dual Citizenship Entry interface
interface DualCitizenshipEntry {
  _id: number;
  country: {
    id: string;
    name: string;
    type: string;
    label: string;
    value: string;
    rect: { x: number; y: number; width: number; height: number };
  };
  howObtained: {
    id: string;
    name: string;
    type: string;
    label: string;
    value: string;
    rect: { x: number; y: number; width: number; height: number };
  };
  otherMethod?: {
    id: string;
    name: string;
    type: string;
    label: string;
    value: string;
    rect: { x: number; y: number; width: number; height: number };
  };
  dateObtained: {
    id: string;
    name: string;
    type: string;
    label: string;
    value: string;
    rect: { x: number; y: number; width: number; height: number };
  };
  hasExercisedRights: {
    id: string;
    name: string;
    type: string;
    label: string;
    value: boolean;
    rect: { x: number; y: number; width: number; height: number };
  };
  rightsExplanation?: {
    id: string;
    name: string;
    type: string;
    label: string;
    value: string;
    rect: { x: number; y: number; width: number; height: number };
  };
}

// Foreign Passport Entry interface
interface ForeignPassportEntry {
  _id: number;
  country: {
    id: string;
    name: string;
    type: string;
    label: string;
    value: string;
    rect: { x: number; y: number; width: number; height: number };
  };
  passportNumber: {
    id: string;
    name: string;
    type: string;
    label: string;
    value: string;
    rect: { x: number; y: number; width: number; height: number };
  };
  issueDate: {
    id: string;
    name: string;
    type: string;
    label: string;
    value: string;
    rect: { x: number; y: number; width: number; height: number };
  };
  expirationDate: {
    id: string;
    name: string;
    type: string;
    label: string;
    value: string;
    rect: { x: number; y: number; width: number; height: number };
  };
  usedForUSEntry: {
    id: string;
    name: string;
    type: string;
    label: string;
    value: boolean;
    rect: { x: number; y: number; width: number; height: number };
  };
  lastUsedDate?: {
    id: string;
    name: string;
    type: string;
    label: string;
    value: string;
    rect: { x: number; y: number; width: number; height: number };
  };
}

// Section 10 Data interface
interface Section10 {
  _id: number;
  section10:{
  dualCitizenship: {
    hasDualCitizenship: {
      id: string;
      name: string;
      type: string;
      label: string;
      value: string;
      rect: { x: number; y: number; width: number; height: number };
    };
    entries: DualCitizenshipEntry[];
  };
  foreignPassport: {
    hasForeignPassport: {
      id: string;
      name: string;
      type: string;
      label: string;
      value: string;
      rect: { x: number; y: number; width: number; height: number };
    };
    entries: ForeignPassportEntry[];
  };
}
}

// Section10 Context interface
interface Section10ContextType {
  // State
  section10Data: Section10;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Dual Citizenship Actions
  updateDualCitizenshipFlag: (value: "YES" | "NO") => void;
  addDualCitizenship: () => void;
  removeDualCitizenship: (index: number) => void;
  updateDualCitizenship: (index: number, field: string, value: any) => void;

  // Foreign Passport Actions
  updateForeignPassportFlag: (value: "YES" | "NO") => void;
  addForeignPassport: () => void;
  removeForeignPassport: (index: number) => void;
  updateForeignPassport: (index: number, field: string, value: any) => void;

  // Utility Functions
  resetSection: () => void;
  loadSection: (data: Section10) => void;
  validateSection: () => { isValid: boolean; errors: any[] };
  getChanges: () => any;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

/**
 * Create initial state for Section 10
 */
const createInitialSection10State = (): Section10 => {
  return {
    _id: 10,
    section10: {
    dualCitizenship: {
      hasDualCitizenship: createFieldFromReference(
        10,
        SECTION10_1_FIELD_NAMES.HAS_DUAL_CITIZENSHIP, // Use correct field name from interface
        "NO"
      ),
      entries: []
    },
    foreignPassport: {
      hasForeignPassport: createFieldFromReference(
        10,
        SECTION10_2_FIELD_NAMES.HAS_FOREIGN_PASSPORT, // Use correct field name from interface
        "NO"
      ),
      entries: []
    }
  }
  };
};

// ============================================================================
// ENTRY TEMPLATE CREATORS
// ============================================================================

/**
 * Create a new dual citizenship entry template
 */
const createDualCitizenshipEntryTemplate = (index: number): DualCitizenshipEntry => {
  const idPrefix = `10_dual_citizenship_${index}`;

  return {
    _id: Date.now() + Math.random(),
    country: {
      id: `${idPrefix}_country`,
      name: `section10.dualCitizenship.entries[${index}].country`,
      type: 'text',
      label: `Country of Citizenship ${index + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    howObtained: {
      id: `${idPrefix}_how_obtained`,
      name: `section10.dualCitizenship.entries[${index}].howObtained`,
      type: 'select',
      label: `How Citizenship Obtained ${index + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    otherMethod: {
      id: `${idPrefix}_other_method`,
      name: `section10.dualCitizenship.entries[${index}].otherMethod`,
      type: 'text',
      label: `Other Method ${index + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    dateObtained: {
      id: `${idPrefix}_date_obtained`,
      name: `section10.dualCitizenship.entries[${index}].dateObtained`,
      type: 'date',
      label: `Date Obtained ${index + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    hasExercisedRights: {
      id: `${idPrefix}_has_exercised_rights`,
      name: `section10.dualCitizenship.entries[${index}].hasExercisedRights`,
      type: 'checkbox',
      label: `Exercised Rights ${index + 1}`,
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    rightsExplanation: {
      id: `${idPrefix}_rights_explanation`,
      name: `section10.dualCitizenship.entries[${index}].rightsExplanation`,
      type: 'textarea',
      label: `Rights Explanation ${index + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    }
  };
};

/**
 * Create a new foreign passport entry template
 */
const createForeignPassportEntryTemplate = (index: number): ForeignPassportEntry => {
  const idPrefix = `10_foreign_passport_${index}`;

  return {
    _id: Date.now() + Math.random(),
    country: {
      id: `${idPrefix}_country`,
      name: `section10.foreignPassport.entries[${index}].country`,
      type: 'text',
      label: `Country of Issuance ${index + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    passportNumber: {
      id: `${idPrefix}_passport_number`,
      name: `section10.foreignPassport.entries[${index}].passportNumber`,
      type: 'text',
      label: `Passport Number ${index + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    issueDate: {
      id: `${idPrefix}_issue_date`,
      name: `section10.foreignPassport.entries[${index}].issueDate`,
      type: 'date',
      label: `Issue Date ${index + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    expirationDate: {
      id: `${idPrefix}_expiration_date`,
      name: `section10.foreignPassport.entries[${index}].expirationDate`,
      type: 'date',
      label: `Expiration Date ${index + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    usedForUSEntry: {
      id: `${idPrefix}_used_for_us_entry`,
      name: `section10.foreignPassport.entries[${index}].usedForUSEntry`,
      type: 'checkbox',
      label: `Used for US Entry ${index + 1}`,
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    lastUsedDate: {
      id: `${idPrefix}_last_used_date`,
      name: `section10.foreignPassport.entries[${index}].lastUsedDate`,
      type: 'date',
      label: `Last Used Date ${index + 1}`,
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    }
  };
};

// ============================================================================
// CONTEXT IMPLEMENTATION
// ============================================================================

const Section10Context = createContext<Section10ContextType | undefined>(undefined);

export const Section10Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [section10Data, setSection10Data] = useState<Section10>(createInitialSection10State);
  const [isLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Section integration for data collection
  const integration = useSectionIntegration();

  // Safeguard: Prevent data loss during save operations
  // Store a reference to the current data to prevent reset during re-registration
  const currentDataRef = React.useRef<Section10>(section10Data);
  React.useEffect(() => {
    currentDataRef.current = section10Data;
  }, [section10Data]);

  // ============================================================================
  // DUAL CITIZENSHIP ACTIONS
  // ============================================================================

  const updateDualCitizenshipFlag = useCallback((value: "YES" | "NO") => {
    setSection10Data(prev => {
      const updated = cloneDeep(prev);
      updated.section10.dualCitizenship.hasDualCitizenship.value = value;
      setIsDirty(true);
      return updated;
    });
  }, []);

  const addDualCitizenship = useCallback(() => {
    setSection10Data(prev => {
      const updated = cloneDeep(prev);
      const entryIndex = updated.section10.dualCitizenship.entries.length;
      updated.section10.dualCitizenship.entries.push(createDualCitizenshipEntryTemplate(entryIndex));
      setIsDirty(true);
      return updated;
    });
  }, []);

  const removeDualCitizenship = useCallback((index: number) => {
    setSection10Data(prev => {
      const updated = cloneDeep(prev);
      if (index >= 0 && index < updated.section10.dualCitizenship.entries.length) {
        updated.section10.dualCitizenship.entries.splice(index, 1);
        setIsDirty(true);
      }
      return updated;
    });
  }, []);

  const updateDualCitizenship = useCallback((index: number, field: string, value: any) => {
    setSection10Data(prev => {
      const updated = cloneDeep(prev);
      if (index >= 0 && index < updated.section10.dualCitizenship.entries.length) {
        const entry = updated.section10.dualCitizenship.entries[index];
        set(entry, `${field}.value`, value);
        setIsDirty(true);
      }
      return updated;
    });
  }, []);

  // ============================================================================
  // FOREIGN PASSPORT ACTIONS
  // ============================================================================

  const updateForeignPassportFlag = useCallback((value: "YES" | "NO") => {
    setSection10Data(prev => {
      const updated = cloneDeep(prev);
      updated.section10.foreignPassport.hasForeignPassport.value = value;
      setIsDirty(true);
      return updated;
    });
  }, []);

  const addForeignPassport = useCallback(() => {
    setSection10Data(prev => {
      const updated = cloneDeep(prev);
      const entryIndex = updated.section10.foreignPassport.entries.length;
      updated.section10.foreignPassport.entries.push(createForeignPassportEntryTemplate(entryIndex));
      setIsDirty(true);
      return updated;
    });
  }, []);

  const removeForeignPassport = useCallback((index: number) => {
    setSection10Data(prev => {
      const updated = cloneDeep(prev);
      if (index >= 0 && index < updated.section10.foreignPassport.entries.length) {
        updated.section10.foreignPassport.entries.splice(index, 1);
        setIsDirty(true);
      }
      return updated;
    });
  }, []);

  const updateForeignPassport = useCallback((index: number, field: string, value: any) => {
    setSection10Data(prev => {
      const updated = cloneDeep(prev);
      if (index >= 0 && index < updated.section10.foreignPassport.entries.length) {
        const entry = updated.section10.foreignPassport.entries[index];
        set(entry, `${field}.value`, value);
        setIsDirty(true);
      }
      return updated;
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    setSection10Data(createInitialSection10State());
    setErrors({});
    setIsDirty(false);
  }, []);

  const loadSection = useCallback((data: Section10) => {
    // Safeguard: Only load if the incoming data is different and not empty
    const currentData = currentDataRef.current;
    const hasCurrentEntries =
      (currentData.section10.dualCitizenship.entries.length > 0 ||
       currentData.section10.foreignPassport.entries.length > 0);

    const hasIncomingEntries =
      (data.section10.dualCitizenship.entries?.length > 0 ||
       data.section10.foreignPassport.entries?.length > 0);

    // If we have current data with entries and incoming data is empty/default, preserve current data
    if (hasCurrentEntries && !hasIncomingEntries) {
      console.log(`🛡️ Section10: Preserving current data - incoming data appears to be default/empty`);
      return;
    }

    // If incoming data has entries or current data is empty, load the new data
    setSection10Data(data);
    setIsDirty(false);
  }, []);

  const validateSection = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const validationErrors: Array<{ field: string, message: string, code: string, severity: 'error' | 'warning' }> = [];
    const warnings: Array<{ field: string, message: string, code: string, severity: 'error' | 'warning' }> = [];

    // Validate dual citizenship entries
    if (section10Data.section10.dualCitizenship.hasDualCitizenship.value === 'YES') {
      section10Data.section10.dualCitizenship.entries.forEach((entry, index) => {
        if (!entry.country.value) {
          const errorMsg = 'Country is required';
          newErrors[`dualCitizenship.entries[${index}].country`] = errorMsg;
          validationErrors.push({
            field: `dualCitizenship.entries[${index}].country`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }

        if (!entry.howObtained.value) {
          const errorMsg = 'How citizenship was obtained is required';
          newErrors[`dualCitizenship.entries[${index}].howObtained`] = errorMsg;
          validationErrors.push({
            field: `dualCitizenship.entries[${index}].howObtained`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }

        if (entry.howObtained.value === 'OTHER' && !entry.otherMethod?.value) {
          const errorMsg = 'Please specify how citizenship was obtained';
          newErrors[`dualCitizenship.entries[${index}].otherMethod`] = errorMsg;
          validationErrors.push({
            field: `dualCitizenship.entries[${index}].otherMethod`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }

        if (!entry.dateObtained.value) {
          const errorMsg = 'Date obtained is required';
          newErrors[`dualCitizenship.entries[${index}].dateObtained`] = errorMsg;
          validationErrors.push({
            field: `dualCitizenship.entries[${index}].dateObtained`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }

        if (entry.hasExercisedRights.value && !entry.rightsExplanation?.value) {
          const errorMsg = 'Explanation is required';
          newErrors[`dualCitizenship.entries[${index}].rightsExplanation`] = errorMsg;
          validationErrors.push({
            field: `dualCitizenship.entries[${index}].rightsExplanation`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }
      });
    }

    // Validate foreign passport entries
    if (section10Data.section10.foreignPassport.hasForeignPassport.value === 'YES') {
      section10Data.section10.foreignPassport.entries.forEach((entry, index) => {
        if (!entry.country.value) {
          const errorMsg = 'Country is required';
          newErrors[`foreignPassport.entries[${index}].country`] = errorMsg;
          validationErrors.push({
            field: `foreignPassport.entries[${index}].country`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }

        if (!entry.passportNumber.value) {
          const errorMsg = 'Passport number is required';
          newErrors[`foreignPassport.entries[${index}].passportNumber`] = errorMsg;
          validationErrors.push({
            field: `foreignPassport.entries[${index}].passportNumber`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }

        if (!entry.issueDate.value) {
          const errorMsg = 'Issue date is required';
          newErrors[`foreignPassport.entries[${index}].issueDate`] = errorMsg;
          validationErrors.push({
            field: `foreignPassport.entries[${index}].issueDate`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }

        if (!entry.expirationDate.value) {
          const errorMsg = 'Expiration date is required';
          newErrors[`foreignPassport.entries[${index}].expirationDate`] = errorMsg;
          validationErrors.push({
            field: `foreignPassport.entries[${index}].expirationDate`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }

        if (entry.usedForUSEntry.value && !entry.lastUsedDate?.value) {
          const errorMsg = 'Last used date is required';
          newErrors[`foreignPassport.entries[${index}].lastUsedDate`] = errorMsg;
          validationErrors.push({
            field: `foreignPassport.entries[${index}].lastUsedDate`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }
      });
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: validationErrors,
      warnings
    };
  }, [section10Data]);

  const getChanges = useCallback(() => {
    // Return changes for tracking purposes
    return isDirty ? section10Data : null;
  }, [section10Data, isDirty]);

  // ============================================================================
  // FIELD FLATTENING FOR PDF GENERATION
  // ============================================================================

  /**
   * Flatten Section10 data structure into Field objects for PDF generation
   */
  const flattenSection10Fields = useCallback((): Record<string, any> => {
    const flatFields: Record<string, any> = {};

    const addField = (field: any) => {
      if (field && typeof field === 'object' && 'id' in field && 'value' in field) {
        flatFields[field.id] = field;
      }
    };

    // Add main flags
    addField(section10Data.section10.dualCitizenship.hasDualCitizenship);
    addField(section10Data.section10.foreignPassport.hasForeignPassport);

    // Add dual citizenship entries
    section10Data.section10.dualCitizenship.entries.forEach(entry => {
      addField(entry.country);
      addField(entry.howObtained);
      if (entry.otherMethod) addField(entry.otherMethod);
      addField(entry.dateObtained);
      addField(entry.hasExercisedRights);
      if (entry.rightsExplanation) addField(entry.rightsExplanation);
    });

    // Add foreign passport entries
    section10Data.section10.foreignPassport.entries.forEach(entry => {
      addField(entry.country);
      addField(entry.passportNumber);
      addField(entry.issueDate);
      addField(entry.expirationDate);
      addField(entry.usedForUSEntry);
      if (entry.lastUsedDate) addField(entry.lastUsedDate);
    });

    return flatFields;
  }, [section10Data]);

  // ============================================================================
  // SECTION INTEGRATION
  // ============================================================================

  // Create BaseSectionContext interface for integration with stable memoization
  const baseSectionContext: BaseSectionContext = useMemo(() => {
    return {
      sectionId: 'section10',
      sectionName: 'Dual Citizenship & Foreign Passport',
      sectionData: section10Data, // Use structured data like Section 29
      isLoading,
      errors: Object.keys(errors).map(key => ({
        field: key,
        message: errors[key],
        code: 'VALIDATION_ERROR',
        severity: 'error' as const
      })),
      isDirty,
      updateFieldValue: (path: string, value: any) => {
        // Parse path to extract section, entry index, and field
        const pathParts = path.split('.');

        if (pathParts[0] === 'dualCitizenship') {
          if (pathParts[1] === 'hasDualCitizenship') {
            updateDualCitizenshipFlag(value as 'YES' | 'NO');
          } else if (pathParts[1] === 'entries' && pathParts.length >= 4) {
            const entryIndex = parseInt(pathParts[2].replace(/[^\d]/g, ''), 10);
            const fieldPath = pathParts.slice(3).join('.');
            updateDualCitizenship(entryIndex, fieldPath, value);
          }
        } else if (pathParts[0] === 'foreignPassport') {
          if (pathParts[1] === 'hasForeignPassport') {
            updateForeignPassportFlag(value as 'YES' | 'NO');
          } else if (pathParts[1] === 'entries' && pathParts.length >= 4) {
            const entryIndex = parseInt(pathParts[2].replace(/[^\d]/g, ''), 10);
            const fieldPath = pathParts.slice(3).join('.');
            updateForeignPassport(entryIndex, fieldPath, value);
          }
        }
      },
      validateSection: () => validateSection(),
      resetSection,
      loadSection,
      getChanges: () => ({}) // Return empty changeset for now
    };
  }, [
    section10Data,
    isLoading,
    errors,
    isDirty,
    updateDualCitizenshipFlag,
    updateDualCitizenship,
    updateForeignPassportFlag,
    updateForeignPassport,
    validateSection,
    resetSection,
    loadSection,
    flattenSection10Fields
  ]);

  // Register section with integration system - ONLY ONCE on mount
  useEffect(() => {
    const registration: SectionRegistration = {
      sectionId: 'section10',
      sectionName: 'Dual Citizenship & Foreign Passport',
      context: baseSectionContext,
      isActive: true,
      lastUpdated: new Date()
    };

    integration.registerSection(registration);

    return () => {
      integration.unregisterSection('section10');
    };
  }, [integration]); // Intentionally NOT dependent on baseSectionContext

  // Listen for DATA_SYNC events to prevent data loss during save operations
  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

    const unsubscribe = integration.subscribeToEvents?.('DATA_SYNC', (event) => {
      // Only handle events for this section or global events
      if (event.sectionId === 'section10' || event.sectionId === 'global') {
        const { action, formData } = event.payload;

        if (action === 'saved') {
          if (isDebugMode) {
            console.log(`💾 Section10: Form was saved, preserving current data`);
          }
          // Don't load data on save - preserve current state
          return;
        }

        if (action === 'loaded' && formData?.section10) {
          if (isDebugMode) {
            console.log(`📥 Section10: Loading data from DATA_SYNC event`);
          }
          loadSection(formData.section10);
        }
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [integration, loadSection]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section10ContextType = {
    // State
    section10Data,
    isLoading,
    errors,
    isDirty,

    // Dual Citizenship Actions
    updateDualCitizenshipFlag,
    addDualCitizenship,
    removeDualCitizenship,
    updateDualCitizenship,

    // Foreign Passport Actions
    updateForeignPassportFlag,
    addForeignPassport,
    removeForeignPassport,
    updateForeignPassport,

    // Utility Functions
    resetSection,
    loadSection,
    validateSection,
    getChanges
  };

  return (
    <Section10Context.Provider value={contextValue}>
      {children}
    </Section10Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection10 = (): Section10ContextType => {
  const context = useContext(Section10Context);
  if (context === undefined) {
    throw new Error('useSection10 must be used within a Section10Provider');
  }
  return context;
};