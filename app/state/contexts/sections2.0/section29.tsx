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
import type { Field } from "../../../../api/interfaces/formDefinition2.0";
import type {
  Section29,
  OrganizationEntry,
  TerrorismActivityEntry,
  OverthrowActivityEntry,
  TerrorismAssociationEntry,
  Address,
  DateRange,
  DateInfo,
  PositionsField,
  ContributionsField,
  SECTION29_RADIO_FIELD_IDS,
  SECTION29_RADIO_FIELD_NAMES
} from "../../../../api/interfaces/sections2.0/section29";
import {
  generateFieldId,
  generateFieldLabel,
  getFieldInputType,
  type SubsectionKey,
  type OrganizationSubsectionKey,
  type ActivitySubsectionKey,
  type ActivityEntryType,
  type FieldType
} from "./section29-field-generator";
import type {
  BaseSectionContext,
  SectionRegistration,
  ValidationResult,
  ValidationError
} from "../shared/base-interfaces";
import { useSectionIntegration } from "../shared/section-integration";

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

interface Section29ContextType {
  // State
  section29Data: Section29;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updateSubsectionFlag: (subsectionKey: SubsectionKey, hasValue: "YES" | "NO") => void;
  addOrganizationEntry: (subsectionKey: OrganizationSubsectionKey) => void;
  addActivityEntry: (subsectionKey: ActivitySubsectionKey, entryType: ActivityEntryType) => void;
  removeEntry: (subsectionKey: SubsectionKey, entryIndex: number) => void;
  updateFieldValue: (subsectionKey: SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => void;

  // Enhanced Entry Management
  getEntryCount: (subsectionKey: SubsectionKey) => number;
  getEntry: (subsectionKey: SubsectionKey, entryIndex: number) => any;
  moveEntry: (subsectionKey: SubsectionKey, fromIndex: number, toIndex: number) => void;
  duplicateEntry: (subsectionKey: SubsectionKey, entryIndex: number) => void;
  clearEntry: (subsectionKey: SubsectionKey, entryIndex: number) => void;
  bulkUpdateFields: (subsectionKey: SubsectionKey, entryIndex: number, fieldUpdates: Record<string, any>) => void;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section29) => void;
  validateSection: () => boolean;
  getChanges: () => any;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

const createInitialSection29State = (): Section29 => ({
  _id: 29,
  // 29.1: Terrorism Organizations (Section29[0]) - 33 fields
  terrorismOrganizations: {
    hasAssociation: {
      id: "16435 0 R", // Use exact PDF field ID from section-29.json
      type: "radio",
      label: "Have you EVER been a member of an organization dedicated to terrorism, either with an awareness of the organization's dedication to that end or with the specific intent to further such activities?",
      value: "NO" as "YES" | "NO",
      rect: { x: 452.83, y: 659.45, width: 9, height: 9 }
    },
    entries: []
  },
  // 29.2: Terrorism Activities (Section29_2[0]) - 13 fields
  terrorismActivities: {
    hasActivity: {
      id: "16433 0 R", // Use exact PDF field ID from section-29.json
      type: "radio",
      label: "Have you EVER engaged in any acts of terrorism?",
      value: "NO" as "YES" | "NO",
      rect: { x: 452.83, y: 704.45, width: 9, height: 9 }
    },
    entries: []
  },
  // 29.3: Terrorism Advocacy (Section29_2[0]) - 13 fields (shares PDF section with 29.2)
  terrorismAdvocacy: {
    hasActivity: {
      id: "16434 0 R", // Use exact PDF field ID from section-29.json
      type: "radio",
      label: "Have you EVER advocated any acts of terrorism or activities designed to overthrow the U.S. Government by force?",
      value: "NO" as "YES" | "NO",
      rect: { x: 470.83, y: 569.45, width: 9, height: 9 }
    },
    entries: []
  },
  // 29.4: Violent Overthrow Organizations (Section29_3[0]) - 33 fields
  violentOverthrowOrganizations: {
    hasAssociation: {
      id: "16430 0 R", // Use exact PDF field ID from section-29.json
      type: "radio",
      label: "Have you EVER been a member of an organization dedicated to the use of violence or force to overthrow the United States Government, and which engaged in activities to that end with an awareness of the organization's dedication to that end or with the specific intent to further such activities?",
      value: "NO" as "YES" | "NO",
      rect: { x: 452.83, y: 706.7, width: 9, height: 9 }
    },
    entries: []
  },
  // 29.5: Violence/Force Organizations (Section29_4[0]) - 33 fields
  violenceForceOrganizations: {
    hasAssociation: {
      id: "16428 0 R", // Use exact PDF field ID from section-29.json
      type: "radio",
      label: "Have you EVER been a member of an organization that advocates or practices commission of acts of force or violence to discourage others from exercising their rights under the U.S. Constitution or laws of the United States or of any state with the specific intent to further such action?",
      value: "NO" as "YES" | "NO",
      rect: { x: 452.83, y: 659.45, width: 9, height: 9 }
    },
    entries: []
  },
  // 29.6: Overthrow Activities (Section29_5[0] RadioButtonList[0]) - 13 fields
  overthrowActivities: {
    hasActivity: {
      id: "16425 0 R", // Use exact PDF field ID from section-29.json
      type: "radio",
      label: "Have you EVER knowingly engaged in activities designed to overthrow the U.S. Government by force?",
      value: "NO" as "YES" | "NO",
      rect: { x: 452.83, y: 794.45, width: 9, height: 9 }
    },
    entries: []
  },
  // 29.7: Terrorism Associations (Section29_5[0] RadioButtonList[1]) - 3 fields
  terrorismAssociations: {
    hasAssociation: {
      id: "16426 0 R", // Use exact PDF field ID from section-29.json
      type: "radio",
      label: "Have you EVER associated with anyone involved in activities to further terrorism?",
      value: "NO" as "YES" | "NO",
      rect: { x: 452.83, y: 839.45, width: 9, height: 9 }
    },
    entries: []
  },
  // Legacy combined subsection for backward compatibility
  overthrowActivitiesAndAssociations: {
    hasActivity: {
      id: "16425 0 R", // Same as overthrowActivities - RadioButtonList[0]
      type: "radio",
      label: "Have you EVER engaged in any other activities designed to overthrow the U.S. Government by force?",
      value: "NO" as "YES" | "NO",
      rect: { x: 452.83, y: 659.45, width: 9, height: 9 }
    },
    hasAssociation: {
      id: "16426 0 R", // Same as terrorismAssociations - RadioButtonList[1]
      type: "radio",
      label: "Have you EVER been a member of an organization dedicated to terrorism, either with an awareness of the organization's dedication to that end or with the specific intent to further such activities?",
      value: "NO" as "YES" | "NO",
      rect: { x: 452.83, y: 704.45, width: 9, height: 9 }
    },
    entries: []
  }
});

// ============================================================================
// ENTRY TEMPLATE CREATORS
// ============================================================================

const createOrganizationEntryTemplate = (entryIndex: number, subsectionKey: OrganizationSubsectionKey): OrganizationEntry => ({
  _id: Date.now() + Math.random(),
  organizationName: {
    id: generateFieldId(subsectionKey, entryIndex, 'organizationName'),
    type: getFieldInputType('organizationName'),
    label: generateFieldLabel('organizationName', entryIndex),
    value: "",
    rect: { x: 35.81, y: 583.91, width: 557.95, height: 17.61 }
  },
  address: createAddressTemplate(entryIndex, subsectionKey),
  dateRange: createDateRangeTemplate(entryIndex, subsectionKey),
  positions: createPositionsFieldTemplate(entryIndex, subsectionKey),
  contributions: createContributionsFieldTemplate(entryIndex, subsectionKey),
  involvementDescription: {
    id: generateFieldId(subsectionKey, entryIndex, 'involvementDescription'),
    type: getFieldInputType('involvementDescription'),
    label: generateFieldLabel('involvementDescription', entryIndex),
    value: "",
    rect: { x: 283.5, y: 466.33, width: 310.5, height: 15.01 }
  }
});

const createTerrorismActivityEntryTemplate = (entryIndex: number, subsectionKey: ActivitySubsectionKey): TerrorismActivityEntry => ({
  _id: Date.now() + Math.random(),
  activityDescription: {
    id: generateFieldId(subsectionKey, entryIndex, 'activityDescription'),
    type: getFieldInputType('activityDescription'),
    label: generateFieldLabel('activityDescription', entryIndex),
    value: "",
    rect: { x: 35.81, y: 636.75, width: 306.19, height: 25.51 }
  },
  dateRange: createDateRangeTemplate(entryIndex, subsectionKey)
});

const createTerrorismAdvocacyEntryTemplate = (entryIndex: number, subsectionKey: ActivitySubsectionKey): any => ({
  _id: Date.now() + Math.random(),
  advocacyReason: {
    id: generateFieldId(subsectionKey, entryIndex, 'advocacyReason'),
    type: getFieldInputType('advocacyReason'),
    label: generateFieldLabel('advocacyReason', entryIndex),
    value: "",
    rect: { x: 35.81, y: 636.75, width: 306.19, height: 25.51 }
  },
  dateRange: createDateRangeTemplate(entryIndex, subsectionKey)
});

const createOverthrowActivityEntryTemplate = (entryIndex: number, subsectionKey: ActivitySubsectionKey): OverthrowActivityEntry => ({
  _id: Date.now() + Math.random(),
  activityDescription: {
    id: generateFieldId(subsectionKey, entryIndex, 'activityDescription'),
    type: getFieldInputType('activityDescription'),
    label: generateFieldLabel('activityDescription', entryIndex),
    value: "",
    rect: { x: 35.81, y: 636.75, width: 306.19, height: 25.51 }
  },
  dateRange: createDateRangeTemplate(entryIndex, subsectionKey)
});

const createTerrorismAssociationEntryTemplate = (entryIndex: number, subsectionKey: ActivitySubsectionKey): TerrorismAssociationEntry => ({
  _id: Date.now() + Math.random(),
  explanation: {
    id: generateFieldId(subsectionKey, entryIndex, 'explanation'),
    type: getFieldInputType('explanation'),
    label: generateFieldLabel('explanation', entryIndex),
    value: "",
    rect: { x: 35.81, y: 483.75, width: 306.19, height: 27.76 }
  }
});

// ============================================================================
// HELPER TEMPLATE CREATORS
// ============================================================================

const createAddressTemplate = (entryIndex: number, subsectionKey: SubsectionKey): Address => ({
  street: {
    id: generateFieldId(subsectionKey, entryIndex, 'address.street'),
    type: getFieldInputType('address.street'),
    label: generateFieldLabel('address.street', entryIndex),
    value: "",
    rect: { x: 36, y: 547.3, width: 171, height: 14.77 }
  },
  city: {
    id: generateFieldId(subsectionKey, entryIndex, 'address.city'),
    type: getFieldInputType('address.city'),
    label: generateFieldLabel('address.city', entryIndex),
    value: "",
    rect: { x: 211.5, y: 547.3, width: 110.88, height: 14.91 }
  },
  state: {
    id: generateFieldId(subsectionKey, entryIndex, 'address.state'),
    type: getFieldInputType('address.state'),
    label: generateFieldLabel('address.state', entryIndex),
    value: "",
    rect: { x: 329.04, y: 544.46, width: 45.5, height: 17.61 }
  },
  zipCode: {
    id: generateFieldId(subsectionKey, entryIndex, 'address.zipCode'),
    type: getFieldInputType('address.zipCode'),
    label: generateFieldLabel('address.zipCode', entryIndex),
    value: "",
    rect: { x: 380.73, y: 547.3, width: 66, height: 14.15 }
  },
  country: {
    id: generateFieldId(subsectionKey, entryIndex, 'address.country'),
    type: getFieldInputType('address.country'),
    label: generateFieldLabel('address.country', entryIndex),
    value: "",
    rect: { x: 450.88, y: 547.3, width: 142, height: 14.91 }
  }
});

const createDateRangeTemplate = (entryIndex: number, subsectionKey: SubsectionKey): DateRange => ({
  from: {
    date: {
      id: generateFieldId(subsectionKey, entryIndex, 'dateRange.from'),
      type: getFieldInputType('dateRange.from'),
      label: generateFieldLabel('dateRange.from', entryIndex),
      value: "",
      rect: { x: 36, y: 506.45, width: 83.25, height: 17.73 }
    },
    estimated: {
      id: generateFieldId(subsectionKey, entryIndex, 'dateRange.from.estimated'),
      type: getFieldInputType('dateRange.from.estimated'),
      label: generateFieldLabel('dateRange.from.estimated', entryIndex),
      value: false,
      rect: { x: 125.25, y: 509.45, width: 9, height: 9 }
    }
  },
  to: {
    date: {
      id: generateFieldId(subsectionKey, entryIndex, 'dateRange.to'),
      type: getFieldInputType('dateRange.to'),
      label: generateFieldLabel('dateRange.to', entryIndex),
      value: "",
      rect: { x: 157.51, y: 506.45, width: 74.07, height: 17.73 }
    },
    estimated: {
      id: generateFieldId(subsectionKey, entryIndex, 'dateRange.to.estimated'),
      type: getFieldInputType('dateRange.to.estimated'),
      label: generateFieldLabel('dateRange.to.estimated', entryIndex),
      value: false,
      rect: { x: 237.58, y: 509.45, width: 9, height: 9 }
    }
  },
  present: {
    id: generateFieldId(subsectionKey, entryIndex, 'dateRange.present'),
    type: getFieldInputType('dateRange.present'),
    label: generateFieldLabel('dateRange.present', entryIndex),
    value: false,
    rect: { x: 252.58, y: 509.45, width: 9, height: 9 }
  }
});

const createPositionsFieldTemplate = (entryIndex: number, subsectionKey: SubsectionKey): PositionsField => ({
  description: {
    id: generateFieldId(subsectionKey, entryIndex, 'positions.description'),
    type: getFieldInputType('positions.description'),
    label: generateFieldLabel('positions.description', entryIndex),
    value: "",
    rect: { x: 283.5, y: 507.25, width: 310.5, height: 23.59 }
  },
  noPositionsHeld: {
    id: generateFieldId(subsectionKey, entryIndex, 'positions.noPositionsHeld'),
    type: getFieldInputType('positions.noPositionsHeld'),
    label: generateFieldLabel('positions.noPositionsHeld', entryIndex),
    value: false,
    rect: { x: 283.5, y: 535.84, width: 9, height: 9 }
  }
});

const createContributionsFieldTemplate = (entryIndex: number, subsectionKey: SubsectionKey): ContributionsField => ({
  description: {
    id: generateFieldId(subsectionKey, entryIndex, 'contributions.description'),
    type: getFieldInputType('contributions.description'),
    label: generateFieldLabel('contributions.description', entryIndex),
    value: "",
    rect: { x: 283.5, y: 466.33, width: 310.5, height: 15.01 }
  },
  noContributionsMade: {
    id: generateFieldId(subsectionKey, entryIndex, 'contributions.noContributionsMade'),
    type: getFieldInputType('contributions.noContributionsMade'),
    label: generateFieldLabel('contributions.noContributionsMade', entryIndex),
    value: false,
    rect: { x: 283.5, y: 485.34, width: 9, height: 9 }
  }
});

// ============================================================================
// CONTEXT IMPLEMENTATION
// ============================================================================

const Section29Context = createContext<Section29ContextType | undefined>(undefined);

export const Section29Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [section29Data, setSection29Data] = useState<Section29>(createInitialSection29State);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Section integration for data collection
  const integration = useSectionIntegration();

  // ============================================================================
  // BASIC ACTIONS
  // ============================================================================

  const updateSubsectionFlag = useCallback((subsectionKey: SubsectionKey, hasValue: "YES" | "NO") => {
    setSection29Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated[subsectionKey];

      if ('hasAssociation' in subsection) {
        subsection.hasAssociation.value = hasValue;
      } else if ('hasActivity' in subsection) {
        subsection.hasActivity.value = hasValue;
      }

      setIsDirty(true);
      return updated;
    });
  }, []);

  const addOrganizationEntry = useCallback((subsectionKey: OrganizationSubsectionKey) => {
    setSection29Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated[subsectionKey];
      const entryIndex = subsection.entries.length;

      const newEntry = createOrganizationEntryTemplate(entryIndex, subsectionKey);
      subsection.entries.push(newEntry);

      setIsDirty(true);
      return updated;
    });
  }, []);

  const addActivityEntry = useCallback((subsectionKey: ActivitySubsectionKey, entryType: ActivityEntryType) => {
    setSection29Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated[subsectionKey];
      const entryIndex = subsection.entries.length;

      let newEntry: any;
      switch (entryType) {
        case 'terrorism':
          // Check if this is actually a terrorism advocacy subsection
          if (subsectionKey === 'terrorismAdvocacy') {
            newEntry = createTerrorismAdvocacyEntryTemplate(entryIndex, subsectionKey);
          } else {
            newEntry = createTerrorismActivityEntryTemplate(entryIndex, subsectionKey);
          }
          break;
        case 'overthrow':
          newEntry = createOverthrowActivityEntryTemplate(entryIndex, subsectionKey);
          break;
        case 'association':
          newEntry = createTerrorismAssociationEntryTemplate(entryIndex, subsectionKey);
          break;
        default:
          throw new Error(`Unknown activity entry type: ${entryType}`);
      }

      subsection.entries.push(newEntry);

      setIsDirty(true);
      return updated;
    });
  }, []);

  const removeEntry = useCallback((subsectionKey: SubsectionKey, entryIndex: number) => {
    setSection29Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated[subsectionKey];

      if (entryIndex >= 0 && entryIndex < subsection.entries.length) {
        subsection.entries.splice(entryIndex, 1);
        setIsDirty(true);
      }

      return updated;
    });
  }, []);

  const updateFieldValue = useCallback((
    subsectionKey: SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    newValue: any
  ) => {
    setSection29Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated[subsectionKey];

      if (entryIndex >= 0 && entryIndex < subsection.entries.length) {
        const entry = subsection.entries[entryIndex];
        set(entry, `${fieldPath}.value`, newValue);
        setIsDirty(true);
      }

      return updated;
    });
  }, []);

  // ============================================================================
  // ENHANCED ENTRY MANAGEMENT
  // ============================================================================

  const getEntryCount = useCallback((subsectionKey: SubsectionKey): number => {
    return section29Data[subsectionKey].entries.length;
  }, [section29Data]);

  const getEntry = useCallback((subsectionKey: SubsectionKey, entryIndex: number): any => {
    const subsection = section29Data[subsectionKey];
    return entryIndex >= 0 && entryIndex < subsection.entries.length
      ? subsection.entries[entryIndex]
      : null;
  }, [section29Data]);

  const moveEntry = useCallback((subsectionKey: SubsectionKey, fromIndex: number, toIndex: number) => {
    setSection29Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated[subsectionKey];

      if (fromIndex >= 0 && fromIndex < subsection.entries.length &&
          toIndex >= 0 && toIndex < subsection.entries.length) {
        const [movedEntry] = subsection.entries.splice(fromIndex, 1);
        subsection.entries.splice(toIndex, 0, movedEntry);
        setIsDirty(true);
      }

      return updated;
    });
  }, []);

  const duplicateEntry = useCallback((subsectionKey: SubsectionKey, entryIndex: number) => {
    setSection29Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated[subsectionKey];

      if (entryIndex >= 0 && entryIndex < subsection.entries.length) {
        const originalEntry = subsection.entries[entryIndex];
        const duplicatedEntry = cloneDeep(originalEntry);
        duplicatedEntry._id = Date.now() + Math.random();
        subsection.entries.push(duplicatedEntry);
        setIsDirty(true);
      }

      return updated;
    });
  }, []);

  const clearEntry = useCallback((subsectionKey: SubsectionKey, entryIndex: number) => {
    setSection29Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated[subsectionKey];

      if (entryIndex >= 0 && entryIndex < subsection.entries.length) {
        const entry = subsection.entries[entryIndex];
        // Clear all field values while preserving structure
        Object.keys(entry).forEach(key => {
          if (key !== '_id' && typeof entry[key] === 'object' && entry[key].value !== undefined) {
            entry[key].value = entry[key].type === 'checkbox' ? false : '';
          }
        });
        setIsDirty(true);
      }

      return updated;
    });
  }, []);

  const bulkUpdateFields = useCallback((
    subsectionKey: SubsectionKey,
    entryIndex: number,
    fieldUpdates: Record<string, any>
  ) => {
    setSection29Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated[subsectionKey];

      if (entryIndex >= 0 && entryIndex < subsection.entries.length) {
        const entry = subsection.entries[entryIndex];
        Object.entries(fieldUpdates).forEach(([fieldPath, newValue]) => {
          set(entry, `${fieldPath}.value`, newValue);
        });
        setIsDirty(true);
      }

      return updated;
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    setSection29Data(createInitialSection29State());
    setErrors({});
    setIsDirty(false);
  }, []);

  const loadSection = useCallback((data: Section29) => {
    setSection29Data(data);
    setIsDirty(false);
  }, []);

  const validateSection = useCallback((): boolean => {
    // Basic validation logic
    const newErrors: Record<string, string> = {};

    // Add validation rules as needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [section29Data]);

  const getChanges = useCallback(() => {
    // Return changes for tracking purposes
    return isDirty ? section29Data : null;
  }, [section29Data, isDirty]);

  // ============================================================================
  // SECTION INTEGRATION
  // ============================================================================

  // Create BaseSectionContext interface for integration with proper memoization
  const baseSectionContext: BaseSectionContext = useMemo(() => ({
    sectionId: 'section29',
    sectionName: 'Association Record',
    sectionData: section29Data,
    isLoading,
    errors: Object.keys(errors).map(key => ({
      field: key,
      message: errors[key],
      code: 'VALIDATION_ERROR',
      severity: 'error' as const
    })),
    isDirty,
    updateFieldValue: (path: string, value: any) => {
      // Parse path to extract subsection, entry index, and field path
      const pathParts = path.split('.');
      if (pathParts.length >= 3) {
        const subsectionKey = pathParts[0] as SubsectionKey;
        const entryIndex = parseInt(pathParts[1]);
        const fieldPath = pathParts.slice(2).join('.');
        updateFieldValue(subsectionKey, entryIndex, fieldPath, value);
      }
    },
    validateSection: () => ({
      isValid: validateSection(),
      errors: [],
      warnings: []
    }),
    resetSection,
    loadSection,
    getChanges: () => ({}) // Return empty changeset for now
  }), [section29Data, isLoading, errors, isDirty, updateFieldValue, validateSection, resetSection, loadSection]);

  // Register section with integration system
  useEffect(() => {
    console.log(`🔄 Section29: Registering with integration system`);
    console.log(`📊 Section29 data being registered:`, section29Data);
    console.log(`📈 Section29 entries count:`, {
      terrorismOrganizations: section29Data.terrorismOrganizations?.entries?.length || 0,
      terrorismActivities: section29Data.terrorismActivities?.entries?.length || 0,
      terrorismAdvocacy: section29Data.terrorismAdvocacy?.entries?.length || 0,
      violentOverthrowOrganizations: section29Data.violentOverthrowOrganizations?.entries?.length || 0,
      violenceForceOrganizations: section29Data.violenceForceOrganizations?.entries?.length || 0,
      overthrowActivities: section29Data.overthrowActivities?.entries?.length || 0,
      terrorismAssociations: section29Data.terrorismAssociations?.entries?.length || 0,
      overthrowActivitiesAndAssociations: section29Data.overthrowActivitiesAndAssociations?.entries?.length || 0
    });

    const registration: SectionRegistration = {
      sectionId: 'section29',
      sectionName: 'Association Record',
      context: baseSectionContext,
      isActive: true,
      lastUpdated: new Date()
    };

    integration.registerSection(registration);

    return () => {
      console.log(`🔄 Section29: Unregistering from integration system`);
      integration.unregisterSection('section29');
    };
  }, [integration, baseSectionContext]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section29ContextType = {
    // State
    section29Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updateSubsectionFlag,
    addOrganizationEntry,
    addActivityEntry,
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
    getChanges
  };

  return (
    <Section29Context.Provider value={contextValue}>
      {children}
    </Section29Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection29 = (): Section29ContextType => {
  const context = useContext(Section29Context);
  if (context === undefined) {
    throw new Error('useSection29 must be used within a Section29Provider');
  }
  return context;
};