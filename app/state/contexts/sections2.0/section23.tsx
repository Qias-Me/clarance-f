/**
 * Section 23: Illegal Use of Drugs or Drug Activity Context
 *
 * This context manages Section 23 of the SF-86 form, which covers illegal drug use,
 * drug-related activities, treatment history, and foreign drug use. It follows the
 * established patterns from Section 29 and integrates with the central SF86FormContext.
 */

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
import type {
  Section23,
  Section23SubsectionKey,
  DrugUseEntry,
  DrugActivityEntry,
  DrugTreatmentEntry,
  Address,
  DateRange,
  DateInfo,
  DrugType,
  DrugUseContext,
  DrugUseFrequency,
  DrugSource,
  DrugActivity,
} from "../../../../api/interfaces/sections2.0/section23";
import type {
  BaseSectionContext,
  ValidationResult,
  ValidationError,
  ChangeSet,
} from "../shared/base-interfaces";
import { useSection86FormIntegration } from "../shared/section-context-integration";
import {
  createFieldFromReference,
  validateSectionFieldCount,
} from "../../../../api/utils/sections-references-loader";

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

interface Section23ContextType {
  // Base interface properties
  sectionId: string;
  sectionName: string;
  sectionData: Section23;
  isLoading: boolean;
  errors: ValidationError[];
  isDirty: boolean;

  // Base methods
  updateFieldValue: (path: string, value: any) => void;
  validateSection: () => ValidationResult;
  resetSection: () => void;
  loadSection: (data: any) => void;
  getChanges: () => ChangeSet;

  // Optional base methods that may not apply to all sections
  getEntryCount?: (subsectionKey: string) => number;
  addEntry?: (subsectionKey: string, entryType?: string) => void;
  removeEntry?: (subsectionKey: Section23SubsectionKey, index: number) => void;
  moveEntry?: (subsectionKey: Section23SubsectionKey, fromIndex: number, toIndex: number) => void;
  duplicateEntry?: (subsectionKey: Section23SubsectionKey, index: number) => void;
  clearEntry?: (subsectionKey: Section23SubsectionKey, index: number) => void;

  // Section 23 specific methods
  updateSubsectionFlag: (
    subsectionKey: Section23SubsectionKey,
    hasValue: "YES" | "NO"
  ) => void;

  // Entry management for each subsection
  addDrugUseEntry: () => void;
  addDrugActivityEntry: () => void;
  addDrugTreatmentEntry: () => void;
  addForeignDrugUseEntry: () => void;

  // Field updates
  updateEntryField: (
    subsectionKey: Section23SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    newValue: any
  ) => void;

  // Bulk operations
  bulkUpdateFields: (
    subsectionKey: Section23SubsectionKey,
    entryIndex: number,
    fieldUpdates: Record<string, any>
  ) => void;

  // Utility functions
  getEntry: (subsectionKey: Section23SubsectionKey, entryIndex: number) => any;

  // Section-specific queries
  hasAnyDrugUse: () => boolean;
  hasAnyDrugActivity: () => boolean;
  hasAnyTreatment: () => boolean;
  getCurrentDrugStatus: () => {
    hasCurrentUse: boolean;
    hasIntentToContinue: boolean;
    requiresMonitoring: boolean;
  };

  // Validation helpers
  validateDrugUseEntry: (entryIndex: number) => ValidationResult;
  validateDrugActivityEntry: (entryIndex: number) => ValidationResult;
  validateDrugTreatmentEntry: (entryIndex: number) => ValidationResult;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

/**
 * Create initial Section 23 state using sections-references data
 * Fixed field mappings based on actual sections-references/section-23.json structure
 */
const createInitialSection23State = (): Section23 => {
  // Validate field count against sections-references
  validateSectionFieldCount(23, 191);

  return {
    _id: 23,
    section23: {
      // Drug Use Subsection (Section23_1) - Based on actual JSON field names
      drugUse: {
        // Main drug use questions - using actual field names from JSON
        hasUsedIllegalDrugs: createFieldFromReference(
          23,
          "form1[0].Section23_1[0].RadioButtonList[0]", // Actual field from JSON
          "NO"
        ),
        hasUsedPrescriptionDrugsIllegally: createFieldFromReference(
          23,
          "form1[0].Section23_1[0].RadioButtonList[1]", // Actual field from JSON
          "NO"
        ),
        hasUsedMarijuana: createFieldFromReference(
          23,
          "form1[0].Section23_1[0].#area[2].RadioButtonList[2]", // Actual field from JSON
          "NO"
        ),
        drugUseInLast7Years: createFieldFromReference(
          23,
          "form1[0].Section23_1[0].#area[3].RadioButtonList[3]", // Actual field from JSON
          "NO"
        ),
        drugUseWhileEmployed: createFieldFromReference(
          23,
          "form1[0].Section23_1[0].RadioButtonList[4]", // Actual field from JSON
          "NO"
        ),
        drugUseWithClearance: createFieldFromReference(
          23,
          "form1[0].Section23_1[0].#area[6].RadioButtonList[5]", // Actual field from JSON
          "NO"
        ),
        intentToContinueUse: createFieldFromReference(
          23,
          "form1[0].Section23_1[0].#area[7].RadioButtonList[6]", // Actual field from JSON
          "NO"
        ),
        intentExplanation: createFieldFromReference(
          23,
          "form1[0].Section23_1[0].TextField11[0]", // Actual field from JSON
          ""
        ),
        entries: [],
        entriesCount: 0,
      },

      // Drug Activity Subsection (Section23_2) - Based on actual JSON field names
      drugActivity: {
        hasEngagedInDrugActivity: createFieldFromReference(
          23,
          "form1[0].Section23_2[0].#area[1].RadioButtonList[0]", // Actual field from JSON
          "NO"
        ),
        hasSoldDrugs: createFieldFromReference(
          23,
          "form1[0].Section23_2[0].RadioButtonList[1]", // Actual field from JSON
          "NO"
        ),
        hasDistributedDrugs: createFieldFromReference(
          23,
          "form1[0].Section23_2[0].RadioButtonList[2]", // Actual field from JSON
          "NO"
        ),
        hasManufacturedDrugs: createFieldFromReference(
          23,
          "form1[0].Section23_2[0].RadioButtonList[3]", // Actual field from JSON
          "NO"
        ),
        hasTransportedDrugs: createFieldFromReference(
          23,
          "form1[0].Section23_2[0].#area[3].RadioButtonList[4]", // Actual field from JSON
          "NO"
        ),
        entries: [],
        entriesCount: 0,
      },

      // Drug Treatment Subsection (Section_23_3) - Based on actual JSON field names
      drugTreatment: {
        hasReceivedDrugTreatment: createFieldFromReference(
          23,
          "form1[0].Section_23_3[0].RadioButtonList[0]", // Actual field from JSON
          "NO"
        ),
        hasVoluntaryTreatment: createFieldFromReference(
          23,
          "form1[0].Section_23_3[0].RadioButtonList[1]", // Actual field from JSON
          "NO"
        ),
        // Using separate fields for court-ordered and current treatment
        hasCourtOrderedTreatment: createFieldFromReference(
          23,
          "form1[0].Section_23_5[0].#area[0].RadioButtonList[0]", // Treatment provider field
          "NO"
        ),
        currentlyInTreatment: createFieldFromReference(
          23,
          "form1[0].Section_23_5[0].RadioButtonList[1]", // Treatment provider field
          "NO"
        ),
        entries: [],
        entriesCount: 0,
      },

      // Foreign Drug Use Subsection (Section_23_4) - Based on actual JSON field names
      foreignDrugUse: {
        hasUsedDrugsAbroad: createFieldFromReference(
          23,
          "form1[0].Section_23_4[0].RadioButtonList[0]", // Actual field from JSON
          "NO"
        ),
        hasUsedLegalDrugsAbroad: createFieldFromReference(
          23,
          "form1[0].Section_23_4[0].#area[1].RadioButtonList[1]", // Actual field from JSON
          "NO"
        ),
        awareOfLocalLaws: createFieldFromReference(
          23,
          "form1[0].Section_23_4[0].RadioButtonList[2]", // Actual field from JSON
          "YES"
        ),
        entries: [],
        entriesCount: 0,
      },
    },
  };
};

// ============================================================================
// ENTRY TEMPLATE CREATORS
// ============================================================================

const createDrugUseEntryTemplate = (entryIndex: number): DrugUseEntry => {
  const baseId = `section23_drugUse_entry_${entryIndex}`;

  return {
    _id: createFieldFromReference(23, `${baseId}_id`, entryIndex),

    // Drug Information
    drugType: createFieldFromReference(23, `${baseId}_drugType`, "marijuana_cannabis" as DrugType),
    drugName: createFieldFromReference(23, `${baseId}_drugName`, ""),
    otherDrugDescription: createFieldFromReference(23, `${baseId}_otherDescription`, ""),

    // Use Details
    firstUse: createDateInfoTemplate(entryIndex, "firstUse"),
    mostRecentUse: createDateInfoTemplate(entryIndex, "mostRecentUse"),
    useFrequency: createFieldFromReference(23, `${baseId}_frequency`, "occasional" as DrugUseFrequency),
    numberOfTimes: createFieldFromReference(23, `${baseId}_numberOfTimes`, ""),
    natureOfUse: createFieldFromReference(23, `${baseId}_natureOfUse`, ""),

    // Context and Circumstances
    useContext: createFieldFromReference(23, `${baseId}_context`, "recreational" as DrugUseContext),
    circumstances: createFieldFromReference(23, `${baseId}_circumstances`, ""),
    reasonForUse: createFieldFromReference(23, `${baseId}_reason`, ""),

    // Location Information
    primaryUseLocation: createAddressTemplate(entryIndex, "primaryLocation"),
    otherUseLocations: createFieldFromReference(23, `${baseId}_otherLocations`, ""),

    // Social Context
    usedAlone: createFieldFromReference(23, `${baseId}_usedAlone`, false),
    usedWithOthers: createFieldFromReference(23, `${baseId}_usedWithOthers`, false),
    otherUsersKnown: createFieldFromReference(23, `${baseId}_otherUsersKnown`, false),
    socialCircleInvolvement: createFieldFromReference(23, `${baseId}_socialCircle`, ""),

    // Acquisition Details
    drugSource: createFieldFromReference(23, `${baseId}_source`, "friends" as DrugSource),
    sourceDetails: createFieldFromReference(23, `${baseId}_sourceDetails`, ""),
    costInformation: createFieldFromReference(23, `${baseId}_cost`, ""),

    // Current Status
    currentlyUsing: createFieldFromReference(23, `${baseId}_currentlyUsing`, false),
    intentToContinue: createFieldFromReference(23, `${baseId}_intentToContinue`, false),
    treatmentSought: createFieldFromReference(23, `${baseId}_treatmentSought`, false),
    treatmentDetails: createFieldFromReference(23, `${baseId}_treatmentDetails`, ""),

    // Impact Assessment
    workImpact: createFieldFromReference(23, `${baseId}_workImpact`, false),
    workImpactDetails: createFieldFromReference(23, `${baseId}_workImpactDetails`, ""),
    healthImpact: createFieldFromReference(23, `${baseId}_healthImpact`, false),
    healthImpactDetails: createFieldFromReference(23, `${baseId}_healthImpactDetails`, ""),
    legalIssues: createFieldFromReference(23, `${baseId}_legalIssues`, false),
    legalIssuesDetails: createFieldFromReference(23, `${baseId}_legalIssuesDetails`, ""),

    // Additional Information
    additionalDetails: createFieldFromReference(23, `${baseId}_additionalDetails`, ""),
    witnessesKnown: createFieldFromReference(23, `${baseId}_witnessesKnown`, false),
    witnessInformation: createFieldFromReference(23, `${baseId}_witnessInfo`, ""),
  };
};

const createDrugActivityEntryTemplate = (entryIndex: number): DrugActivityEntry => {
  const baseId = `section23_drugActivity_entry_${entryIndex}`;

  return {
    _id: createFieldFromReference(23, `${baseId}_id`, entryIndex),

    // Activity Information
    activityType: createFieldFromReference(23, `${baseId}_activityType`, "purchase" as DrugActivity),
    activityDescription: createFieldFromReference(23, `${baseId}_description`, ""),
    drugTypesInvolved: createFieldFromReference(23, `${baseId}_drugTypes`, []),

    // Timeline
    activityDates: createDateRangeTemplate(entryIndex, "activityDates"),
    frequencyOfActivity: createFieldFromReference(23, `${baseId}_frequency`, ""),

    // Location and Context
    activityLocation: createAddressTemplate(entryIndex, "activityLocation"),
    organizationInvolvement: createFieldFromReference(23, `${baseId}_orgInvolvement`, false),
    organizationDetails: createFieldFromReference(23, `${baseId}_orgDetails`, ""),

    // Financial Aspects
    moneyInvolved: createFieldFromReference(23, `${baseId}_moneyInvolved`, false),
    financialDetails: createFieldFromReference(23, `${baseId}_financialDetails`, ""),
    profitMade: createFieldFromReference(23, `${baseId}_profitMade`, false),
    profitAmount: createFieldFromReference(23, `${baseId}_profitAmount`, ""),

    // Legal Consequences
    arrestsRelated: createFieldFromReference(23, `${baseId}_arrests`, false),
    arrestDetails: createFieldFromReference(23, `${baseId}_arrestDetails`, ""),
    convictionsRelated: createFieldFromReference(23, `${baseId}_convictions`, false),
    convictionDetails: createFieldFromReference(23, `${baseId}_convictionDetails`, ""),

    // Other Participants
    othersInvolved: createFieldFromReference(23, `${baseId}_othersInvolved`, false),
    participantDetails: createFieldFromReference(23, `${baseId}_participantDetails`, ""),
    leadershipRole: createFieldFromReference(23, `${baseId}_leadership`, false),
    roleDescription: createFieldFromReference(23, `${baseId}_roleDescription`, ""),

    // Current Status
    activityStopped: createFieldFromReference(23, `${baseId}_stopped`, true),
    reasonForStopping: createFieldFromReference(23, `${baseId}_reasonStopped`, ""),
    likelihoodOfRecurrence: createFieldFromReference(23, `${baseId}_likelihood`, ""),

    // Additional Information
    additionalDetails: createFieldFromReference(23, `${baseId}_additionalDetails`, ""),
    cooperationWithAuthorities: createFieldFromReference(23, `${baseId}_cooperation`, false),
    cooperationDetails: createFieldFromReference(23, `${baseId}_cooperationDetails`, ""),
  };
};

const createDrugTreatmentEntryTemplate = (entryIndex: number): DrugTreatmentEntry => {
  const baseId = `section23_drugTreatment_entry_${entryIndex}`;

  return {
    _id: createFieldFromReference(23, `${baseId}_id`, entryIndex),

    // Treatment Information
    treatmentType: createFieldFromReference(23, `${baseId}_treatmentType`, "outpatient"),
    treatmentDescription: createFieldFromReference(23, `${baseId}_description`, ""),

    // Timeline
    treatmentDates: createDateRangeTemplate(entryIndex, "treatmentDates"),
    treatmentDuration: createFieldFromReference(23, `${baseId}_duration`, ""),

    // Provider Information
    providerName: createFieldFromReference(23, `${baseId}_providerName`, ""),
    providerAddress: createAddressTemplate(entryIndex, "providerAddress"),
    providerType: createFieldFromReference(23, `${baseId}_providerType`, ""),

    // Treatment Details
    voluntaryTreatment: createFieldFromReference(23, `${baseId}_voluntary`, true),
    courtOrdered: createFieldFromReference(23, `${baseId}_courtOrdered`, false),
    employmentRequired: createFieldFromReference(23, `${baseId}_employmentRequired`, false),
    reasonForTreatment: createFieldFromReference(23, `${baseId}_reason`, ""),

    // Outcomes
    treatmentCompleted: createFieldFromReference(23, `${baseId}_completed`, true),
    treatmentSuccessful: createFieldFromReference(23, `${baseId}_successful`, true),
    currentlyInTreatment: createFieldFromReference(23, `${baseId}_currentlyIn`, false),
    ongoingSupport: createFieldFromReference(23, `${baseId}_ongoingSupport`, false),

    // Relapse Information
    relapsedAfterTreatment: createFieldFromReference(23, `${baseId}_relapsed`, false),
    relapseDetails: createFieldFromReference(23, `${baseId}_relapseDetails`, ""),
    additionalTreatmentSought: createFieldFromReference(23, `${baseId}_additionalTreatment`, false),

    // Additional Information
    additionalDetails: createFieldFromReference(23, `${baseId}_additionalDetails`, ""),
    contactInformation: createFieldFromReference(23, `${baseId}_contactInfo`, ""),
  };
};

// Helper functions for creating common structures
const createAddressTemplate = (entryIndex: number, prefix: string): Address => {
  const baseId = `section23_${prefix}_${entryIndex}`;

  return {
    street: createFieldFromReference(23, `${baseId}_street`, ""),
    city: createFieldFromReference(23, `${baseId}_city`, ""),
    state: createFieldFromReference(23, `${baseId}_state`, ""),
    zipCode: createFieldFromReference(23, `${baseId}_zipCode`, ""),
    county: createFieldFromReference(23, `${baseId}_county`, ""),
    country: createFieldFromReference(23, `${baseId}_country`, "" as any),
  };
};

const createDateInfoTemplate = (entryIndex: number, prefix: string): DateInfo => {
  const baseId = `section23_${prefix}_${entryIndex}`;

  return {
    date: createFieldFromReference(23, `${baseId}_date`, ""),
    estimated: createFieldFromReference(23, `${baseId}_estimated`, false),
  };
};

const createDateRangeTemplate = (entryIndex: number, prefix: string): DateRange => {
  const baseId = `section23_${prefix}_${entryIndex}`;

  return {
    from: createDateInfoTemplate(entryIndex, `${prefix}_from`),
    to: createDateInfoTemplate(entryIndex, `${prefix}_to`),
    present: createFieldFromReference(23, `${baseId}_present`, false),
  };
};

// ============================================================================
// CONTEXT IMPLEMENTATION
// ============================================================================

const Section23Context = createContext<Section23ContextType | null>(null);

export const Section23Provider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Core state
  const [section23Data, setSection23Data] = useState<Section23>(
    createInitialSection23State()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [initialData, setInitialData] = useState<Section23>(
    createInitialSection23State()
  );

  // REMOVED: Integration hook moved to after function definitions

  // Update subsection flags
  const updateSubsectionFlag = useCallback((
    subsectionKey: Section23SubsectionKey,
    hasValue: "YES" | "NO"
  ) => {
    setSection23Data(prev => {
      const updated = cloneDeep(prev);

      // Map subsection keys to their flag field names with proper typing
      const flagMappings: Record<Section23SubsectionKey, string> = {
        drugUse: 'hasUsedIllegalDrugs',
        drugActivity: 'hasEngagedInDrugActivity',
        drugTreatment: 'hasReceivedDrugTreatment',
        foreignDrugUse: 'hasUsedDrugsAbroad',
      };

      const flagField = flagMappings[subsectionKey];
      if (flagField && updated.section23[subsectionKey]) {
        const subsection = updated.section23[subsectionKey] as any;
        if (subsection[flagField]) {
          subsection[flagField].value = hasValue;
        }
      }

      setIsDirty(true);
      return updated;
    });
  }, []);

  // Add entries for different subsections
  const addDrugUseEntry = useCallback(() => {
    setSection23Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated.section23.drugUse;
      const newEntry = createDrugUseEntryTemplate(subsection.entries.length);

      subsection.entries.push(newEntry);
      subsection.entriesCount = subsection.entries.length;

      setIsDirty(true);
      return updated;
    });
  }, []);

  const addDrugActivityEntry = useCallback(() => {
    setSection23Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated.section23.drugActivity;
      const newEntry = createDrugActivityEntryTemplate(subsection.entries.length);

      subsection.entries.push(newEntry);
      subsection.entriesCount = subsection.entries.length;

      setIsDirty(true);
      return updated;
    });
  }, []);

  const addDrugTreatmentEntry = useCallback(() => {
    setSection23Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated.section23.drugTreatment;
      const newEntry = createDrugTreatmentEntryTemplate(subsection.entries.length);

      subsection.entries.push(newEntry);
      subsection.entriesCount = subsection.entries.length;

      setIsDirty(true);
      return updated;
    });
  }, []);

  const addForeignDrugUseEntry = useCallback(() => {
    setSection23Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated.section23.foreignDrugUse;
      const newEntry = createDrugUseEntryTemplate(subsection.entries.length); // Reuse drug use template

      subsection.entries.push(newEntry);
      subsection.entriesCount = subsection.entries.length;

      setIsDirty(true);
      return updated;
    });
  }, []);

  // Remove entry
  const removeEntry = useCallback((
    subsectionKey: Section23SubsectionKey,
    entryIndex: number
  ) => {
    setSection23Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated.section23[subsectionKey];

      if (subsection?.entries && entryIndex >= 0 && entryIndex < subsection.entries.length) {
        subsection.entries.splice(entryIndex, 1);
        subsection.entriesCount = subsection.entries.length;
        setIsDirty(true);
      }

      return updated;
    });
  }, []);

  // Move entry with proper typing
  const moveEntry = useCallback((
    subsectionKey: Section23SubsectionKey,
    fromIndex: number,
    toIndex: number
  ) => {
    setSection23Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated.section23[subsectionKey];

      if (subsection?.entries &&
          fromIndex >= 0 && fromIndex < subsection.entries.length &&
          toIndex >= 0 && toIndex < subsection.entries.length) {
        const entries = subsection.entries as any[];
        const [movedEntry] = entries.splice(fromIndex, 1);
        entries.splice(toIndex, 0, movedEntry);
        setIsDirty(true);
      }

      return updated;
    });
  }, []);

  // Duplicate entry with proper typing
  const duplicateEntry = useCallback((
    subsectionKey: Section23SubsectionKey,
    entryIndex: number
  ) => {
    setSection23Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated.section23[subsectionKey];

      if (subsection?.entries && entryIndex >= 0 && entryIndex < subsection.entries.length) {
        const entries = subsection.entries as any[];
        const originalEntry = entries[entryIndex];
        const duplicatedEntry = cloneDeep(originalEntry);

        // Update the ID for the duplicated entry
        duplicatedEntry._id.value = entries.length;

        entries.push(duplicatedEntry);
        subsection.entriesCount = entries.length;
        setIsDirty(true);
      }

      return updated;
    });
  }, []);

  // Clear entry
  const clearEntry = useCallback((
    subsectionKey: Section23SubsectionKey,
    entryIndex: number
  ) => {
    setSection23Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated.section23[subsectionKey];

      if (subsection?.entries && entryIndex >= 0 && entryIndex < subsection.entries.length) {
        // Create a new template entry to replace the cleared one
        let newEntry;
        switch (subsectionKey) {
          case 'drugUse':
          case 'foreignDrugUse':
            newEntry = createDrugUseEntryTemplate(entryIndex);
            break;
          case 'drugActivity':
            newEntry = createDrugActivityEntryTemplate(entryIndex);
            break;
          case 'drugTreatment':
            newEntry = createDrugTreatmentEntryTemplate(entryIndex);
            break;
        }

        if (newEntry) {
          subsection.entries[entryIndex] = newEntry;
          setIsDirty(true);
        }
      }

      return updated;
    });
  }, []);

  // Update field value with path notation - Following Section 1 Gold Standard Pattern
  const updateFieldValue = useCallback((path: string, value: any) => {
    console.log(`🔄 Section23: updateFieldValue called with path: ${path}, value:`, value);

    setSection23Data(prev => {
      const updated = cloneDeep(prev);

      // Handle both direct field updates and .value property updates
      if (path.includes('.value')) {
        // Direct .value path update
        set(updated, path, value);
      } else {
        // Assume we need to update the .value property of the field
        set(updated, `${path}.value`, value);
      }

      setIsDirty(true);
      console.log(`✅ Section23: Field updated successfully. Path: ${path}, New data:`, updated);
      return updated;
    });
  }, []);

  // Update entry field
  const updateEntryField = useCallback((
    subsectionKey: Section23SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    newValue: any
  ) => {
    const fullPath = `section23.${subsectionKey}.entries.${entryIndex}.${fieldPath}`;
    updateFieldValue(fullPath, newValue);
  }, [updateFieldValue]);

  // Bulk update fields
  const bulkUpdateFields = useCallback((
    subsectionKey: Section23SubsectionKey,
    entryIndex: number,
    fieldUpdates: Record<string, any>
  ) => {
    setSection23Data(prev => {
      const updated = cloneDeep(prev);

      Object.entries(fieldUpdates).forEach(([fieldPath, value]) => {
        const fullPath = `section23.${subsectionKey}.entries.${entryIndex}.${fieldPath}`;
        set(updated, fullPath, value);
      });

      setIsDirty(true);
      return updated;
    });
  }, []);

  // Utility functions
  const getEntryCount = useCallback((subsectionKey: Section23SubsectionKey): number => {
    return section23Data.section23[subsectionKey]?.entries?.length || 0;
  }, [section23Data]);

  const getEntry = useCallback((subsectionKey: Section23SubsectionKey, entryIndex: number): any => {
    const subsection = section23Data.section23[subsectionKey];
    return subsection?.entries?.[entryIndex] || null;
  }, [section23Data]);

  // Section-specific queries
  const hasAnyDrugUse = useCallback((): boolean => {
    const drugUse = section23Data.section23.drugUse;
    return drugUse.hasUsedIllegalDrugs.value === "YES" ||
           drugUse.hasUsedPrescriptionDrugsIllegally.value === "YES" ||
           drugUse.hasUsedMarijuana.value === "YES";
  }, [section23Data]);

  const hasAnyDrugActivity = useCallback((): boolean => {
    const drugActivity = section23Data.section23.drugActivity;
    return drugActivity.hasEngagedInDrugActivity.value === "YES" ||
           drugActivity.hasSoldDrugs.value === "YES" ||
           drugActivity.hasDistributedDrugs.value === "YES" ||
           drugActivity.hasManufacturedDrugs.value === "YES" ||
           drugActivity.hasTransportedDrugs.value === "YES";
  }, [section23Data]);

  const hasAnyTreatment = useCallback((): boolean => {
    const treatment = section23Data.section23.drugTreatment;
    return treatment.hasReceivedDrugTreatment.value === "YES" ||
           treatment.hasVoluntaryTreatment.value === "YES" ||
           treatment.hasCourtOrderedTreatment.value === "YES";
  }, [section23Data]);

  const getCurrentDrugStatus = useCallback(() => {
    const drugUse = section23Data.section23.drugUse;
    const hasCurrentUse = drugUse.entries.some(entry =>
      entry.currentlyUsing?.value === true
    );
    const hasIntentToContinue = drugUse.intentToContinueUse.value === "YES" ||
      drugUse.entries.some(entry => entry.intentToContinue?.value === true);
    const requiresMonitoring = hasCurrentUse || hasIntentToContinue;

    return {
      hasCurrentUse,
      hasIntentToContinue,
      requiresMonitoring
    };
  }, [section23Data]);

  // Validation functions
  const validateSection = useCallback((): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validate drug use entries
    section23Data.section23.drugUse.entries.forEach((entry, index) => {
      const entryValidation = validateDrugUseEntry(index);
      errors.push(...entryValidation.errors);
      warnings.push(...entryValidation.warnings);
    });

    // Validate drug activity entries
    section23Data.section23.drugActivity.entries.forEach((entry, index) => {
      const entryValidation = validateDrugActivityEntry(index);
      errors.push(...entryValidation.errors);
      warnings.push(...entryValidation.warnings);
    });

    // Validate treatment entries
    section23Data.section23.drugTreatment.entries.forEach((entry, index) => {
      const entryValidation = validateDrugTreatmentEntry(index);
      errors.push(...entryValidation.errors);
      warnings.push(...entryValidation.warnings);
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [section23Data]);

  const validateDrugUseEntry = useCallback((entryIndex: number): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const entry = section23Data.section23.drugUse.entries[entryIndex];

    if (!entry) {
      errors.push({
        field: `drugUse.entries.${entryIndex}`,
        message: 'Entry not found',
        code: 'ENTRY_NOT_FOUND',
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    // Validate required fields
    if (!entry.drugType.value) {
      errors.push({
        field: `drugUse.entries.${entryIndex}.drugType`,
        message: 'Drug type is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    if (!entry.firstUse.date.value) {
      errors.push({
        field: `drugUse.entries.${entryIndex}.firstUse.date`,
        message: 'First use date is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    if (!entry.mostRecentUse.date.value) {
      errors.push({
        field: `drugUse.entries.${entryIndex}.mostRecentUse.date`,
        message: 'Most recent use date is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    // Validate date logic
    if (entry.firstUse.date.value && entry.mostRecentUse.date.value) {
      const firstDate = new Date(entry.firstUse.date.value);
      const recentDate = new Date(entry.mostRecentUse.date.value);

      if (firstDate > recentDate) {
        errors.push({
          field: `drugUse.entries.${entryIndex}.dates`,
          message: 'First use date cannot be after most recent use date',
          code: 'INVALID_DATE_RANGE',
          severity: 'error'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [section23Data]);

  const validateDrugActivityEntry = useCallback((entryIndex: number): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const entry = section23Data.section23.drugActivity.entries[entryIndex];

    if (!entry) {
      errors.push({
        field: `drugActivity.entries.${entryIndex}`,
        message: 'Entry not found',
        code: 'ENTRY_NOT_FOUND',
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    // Validate required fields
    if (!entry.activityType.value) {
      errors.push({
        field: `drugActivity.entries.${entryIndex}.activityType`,
        message: 'Activity type is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    if (!entry.activityDescription.value) {
      errors.push({
        field: `drugActivity.entries.${entryIndex}.activityDescription`,
        message: 'Activity description is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [section23Data]);

  const validateDrugTreatmentEntry = useCallback((entryIndex: number): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const entry = section23Data.section23.drugTreatment.entries[entryIndex];

    if (!entry) {
      errors.push({
        field: `drugTreatment.entries.${entryIndex}`,
        message: 'Entry not found',
        code: 'ENTRY_NOT_FOUND',
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    // Validate required fields
    if (!entry.treatmentType.value) {
      errors.push({
        field: `drugTreatment.entries.${entryIndex}.treatmentType`,
        message: 'Treatment type is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    if (!entry.providerName.value) {
      errors.push({
        field: `drugTreatment.entries.${entryIndex}.providerName`,
        message: 'Provider name is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [section23Data]);

  // Reset section
  const resetSection = useCallback(() => {
    const initialState = createInitialSection23State();
    setSection23Data(initialState);
    setInitialData(initialState);
    setIsDirty(false);
    setErrors({});
  }, []);

  // Load section data
  const loadSection = useCallback((data: Section23) => {
    setSection23Data(data);
    setInitialData(cloneDeep(data));
    setIsDirty(false);
  }, []);

  // Get changes
  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Compare current data with initial data to identify changes
    const compareObjects = (current: any, initial: any, path: string = '') => {
      if (typeof current !== typeof initial) {
        changes[path] = {
          oldValue: initial,
          newValue: current,
          timestamp: new Date()
        };
        return;
      }

      if (typeof current === 'object' && current !== null) {
        Object.keys(current).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;
          compareObjects(current[key], initial[key], currentPath);
        });
      } else if (current !== initial) {
        changes[path] = {
          oldValue: initial,
          newValue: current,
          timestamp: new Date()
        };
      }
    };

    compareObjects(section23Data, initialData);
    return changes;
  }, [section23Data, initialData]);

  // ============================================================================
  // SF86FORM INTEGRATION - Following Section 1 Gold Standard Pattern
  // ============================================================================

  // Add logging for debugging data flow
  useEffect(() => {
    console.log(`🔍 Section23: Context data updated:`, {
      section23Data,
      isDirty,
      hasUsedIllegalDrugs: section23Data.section23.drugUse.hasUsedIllegalDrugs.value,
      hasUsedPrescriptionDrugs: section23Data.section23.drugUse.hasUsedPrescriptionDrugsIllegally.value
    });
  }, [section23Data, isDirty]);

  // Integration with main form context using Section 1 pattern
  const integration = useSection86FormIntegration(
    'section23',
    'Section 23: Illegal Use of Drugs or Drug Activity',
    section23Data,
    setSection23Data,
    () => ({ isValid: validateSection().isValid, errors: validateSection().errors, warnings: validateSection().warnings }),
    () => getChanges(),
    updateFieldValue // Pass Section 23's updateFieldValue function to integration
  );

  // Create the context value with proper typing
  const contextValue: Section23ContextType = useMemo(() => ({
    // Base interface implementation
    sectionId: 'section23',
    sectionName: 'Illegal Use of Drugs or Drug Activity',
    sectionData: section23Data,
    isLoading,
    errors: Object.entries(errors).map(([field, message]) => ({
      field,
      message,
      code: 'VALIDATION_ERROR',
      severity: 'error' as const
    })),
    isDirty,

    // Base methods
    updateFieldValue,
    validateSection,
    resetSection,
    loadSection,
    getChanges,

    // Optional base methods - implement getEntryCount with proper typing
    getEntryCount: (subsectionKey: string) => {
      const typedKey = subsectionKey as Section23SubsectionKey;
      return section23Data.section23[typedKey]?.entries?.length || 0;
    },
    addEntry: (subsectionKey: string, entryType?: string) => {
      const typedKey = subsectionKey as Section23SubsectionKey;
      switch (typedKey) {
        case 'drugUse':
        case 'foreignDrugUse':
          addDrugUseEntry();
          break;
        case 'drugActivity':
          addDrugActivityEntry();
          break;
        case 'drugTreatment':
          addDrugTreatmentEntry();
          break;
      }
    },
    removeEntry: (subsectionKey: Section23SubsectionKey, index: number) => removeEntry(subsectionKey, index),
    moveEntry: (subsectionKey: Section23SubsectionKey, fromIndex: number, toIndex: number) => moveEntry(subsectionKey, fromIndex, toIndex),
    duplicateEntry: (subsectionKey: Section23SubsectionKey, index: number) => duplicateEntry(subsectionKey, index),
    clearEntry: (subsectionKey: Section23SubsectionKey, index: number) => clearEntry(subsectionKey, index),

    // Section-specific methods
    updateSubsectionFlag,
    addDrugUseEntry,
    addDrugActivityEntry,
    addDrugTreatmentEntry,
    addForeignDrugUseEntry,
    updateEntryField,
    bulkUpdateFields,
    getEntry,

    // Section-specific queries
    hasAnyDrugUse,
    hasAnyDrugActivity,
    hasAnyTreatment,
    getCurrentDrugStatus,

    // Validation methods
    validateDrugUseEntry,
    validateDrugActivityEntry,
    validateDrugTreatmentEntry,
  }), [
    section23Data,
    isLoading,
    errors,
    isDirty,
    updateFieldValue,
    validateSection,
    resetSection,
    loadSection,
    getChanges,
    updateSubsectionFlag,
    addDrugUseEntry,
    addDrugActivityEntry,
    addDrugTreatmentEntry,
    addForeignDrugUseEntry,
    removeEntry,
    moveEntry,
    duplicateEntry,
    clearEntry,
    updateEntryField,
    bulkUpdateFields,
    getEntry,
    hasAnyDrugUse,
    hasAnyDrugActivity,
    hasAnyTreatment,
    getCurrentDrugStatus,
    validateDrugUseEntry,
    validateDrugActivityEntry,
    validateDrugTreatmentEntry,
  ]);

  return (
    <Section23Context.Provider value={contextValue}>
      {children}
    </Section23Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection23 = (): Section23ContextType => {
  const context = useContext(Section23Context);
  if (!context) {
    throw new Error('useSection23 must be used within a Section23Provider');
  }
  return context;
};

export default Section23Provider;