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
import type {
  Section29,
  OrganizationEntry,
  TerrorismActivityEntry,
  OverthrowActivityEntry,
  TerrorismAssociationEntry,
  Address,
  DateRange,
  PositionsField,
  ContributionsField,
} from "../../../../api/interfaces/sections2.0/section29";
import {
  generateFieldId,
  generateFieldName,
  generateFieldLabel,
  getFieldInputType,
  type SubsectionKey,
  type OrganizationSubsectionKey,
  type ActivitySubsectionKey,
  type ActivityEntryType,
  generateFieldRect,
} from "./section29-field-generator";
import type {
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

interface Section29ContextType {
  // State
  section29Data: Section29;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updateSubsectionFlag: (
    subsectionKey: SubsectionKey,
    hasValue: "YES" | "NO"
  ) => void;
  addOrganizationEntry: (subsectionKey: OrganizationSubsectionKey) => void;
  addActivityEntry: (
    subsectionKey: ActivitySubsectionKey,
    entryType: ActivityEntryType
  ) => void;
  removeEntry: (subsectionKey: SubsectionKey, entryIndex: number) => void;
  updateFieldValue: (
    subsectionKey: SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    newValue: any
  ) => void;

  // Enhanced Entry Management
  getEntryCount: (subsectionKey: SubsectionKey) => number;
  getEntry: (subsectionKey: SubsectionKey, entryIndex: number) => any;
  moveEntry: (
    subsectionKey: SubsectionKey,
    fromIndex: number,
    toIndex: number
  ) => void;
  duplicateEntry: (subsectionKey: SubsectionKey, entryIndex: number) => void;
  clearEntry: (subsectionKey: SubsectionKey, entryIndex: number) => void;
  bulkUpdateFields: (
    subsectionKey: SubsectionKey,
    entryIndex: number,
    fieldUpdates: Record<string, any>
  ) => void;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section29) => void;
  validateSection: () => boolean;
  getChanges: () => any;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

/**
 * DRY Initial State Creation using sections-references data
 * This eliminates hardcoded values and uses the single source of truth
 */
const createInitialSection29State = (): Section29 => {
  // Validate field count against sections-references
  validateSectionFieldCount(29, 141);

  return {
    _id: 29,
    section29: {
      // 29.1: Terrorism Organizations
      terrorismOrganizations: {
        hasAssociation: createFieldFromReference(
          29,
          "form1[0].Section29[0].RadioButtonList[0]",
          "NO (If NO, proceed to 29.2)"
        ),
        entries: [],
      },

      // 29.2: Terrorism Activities
      terrorismActivities: {
        hasActivity: createFieldFromReference(
          29,
          "form1[0].Section29_2[0].RadioButtonList[0]",
          "NO (If NO, proceed to 29.3)"
        ),
        entries: [],
      },

      // 29.3: Terrorism Advocacy
      terrorismAdvocacy: {
        hasActivity: createFieldFromReference(
          29,
          "form1[0].Section29_2[0].RadioButtonList[1]",
          "NO (Proceed to 29.4)"
        ),
        entries: [],
      },

      // 29.4: Violent Overthrow Organizations
      violentOverthrowOrganizations: {
        hasAssociation: createFieldFromReference(
          29,
          "form1[0].Section29_3[0].RadioButtonList[0]",
          "NO (If NO, proceed to 29.5)"
        ),
        entries: [],
      },

      // 29.5: Violence/Force Organizations
      violenceForceOrganizations: {
        hasAssociation: createFieldFromReference(
          29,
          "form1[0].Section29_4[0].RadioButtonList[0]",
          "NO (If NO, proceed to 29.6)"
        ),
        entries: [],
      },

      // 29.6: Overthrow Activities
      overthrowActivities: {
        hasActivity: createFieldFromReference(
          29,
          "form1[0].Section29_5[0].RadioButtonList[0]",
          "NO (If NO, proceed to 29.7)"
        ),
        entries: [],
      },

      // 29.7: Terrorism Associations
      terrorismAssociations: {
        hasAssociation: createFieldFromReference(
          29,
          "form1[0].Section29_5[0].RadioButtonList[1]",
          "NO "
        ),
        entries: [],
      },
    },
  };
};

// ============================================================================
// ENTRY TEMPLATE CREATORS
// ============================================================================

const createOrganizationEntryTemplate = (
  entryIndex: number,
  subsectionKey: OrganizationSubsectionKey
): OrganizationEntry => {
  // Generate field name first, then try to get numeric ID
  const organizationNameFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "organizationName"
  );
  const organizationNameFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "organizationName"
  );

  const involvementDescFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "involvementDescription"
  );
  const involvementDescFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "involvementDescription"
  );

  return {
    _id: Date.now() + Math.random(),
    organizationName: {
      id: organizationNameFieldId,
      name: organizationNameFieldName,
      type: getFieldInputType("organizationName"),
      label: generateFieldLabel("organizationName", entryIndex),
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    address: createAddressTemplate(entryIndex, subsectionKey),
    dateRange: createDateRangeTemplate(entryIndex, subsectionKey),
    positions: createPositionsFieldTemplate(entryIndex, subsectionKey),
    contributions: createContributionsFieldTemplate(entryIndex, subsectionKey),
    involvementDescription: {
      id: involvementDescFieldId,
      name: involvementDescFieldName,
      type: getFieldInputType("involvementDescription"),
      label: generateFieldLabel("involvementDescription", entryIndex),
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
  };
};

const createTerrorismActivityEntryTemplate = (
  entryIndex: number,
  subsectionKey: ActivitySubsectionKey
): TerrorismActivityEntry => {
  const activityDescFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "activityDescription"
  );
  const activityDescFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "activityDescription"
  );

  return {
    _id: Date.now() + Math.random(),
    activityDescription: {
      id: activityDescFieldId,
      name: activityDescFieldName,
      type: getFieldInputType("activityDescription"),
      label: generateFieldLabel("activityDescription", entryIndex),
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    dateRange: createDateRangeTemplate(entryIndex, subsectionKey),
  };
};

const createTerrorismAdvocacyEntryTemplate = (
  entryIndex: number,
  subsectionKey: ActivitySubsectionKey
): any => {
  const advocacyReasonFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "advocacyReason"
  );
  const advocacyReasonFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "advocacyReason"
  );

  return {
    _id: Date.now() + Math.random(),
    advocacyReason: {
      id: advocacyReasonFieldId,
      name: advocacyReasonFieldName,
      type: getFieldInputType("advocacyReason"),
      label: generateFieldLabel("advocacyReason", entryIndex),
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    dateRange: createDateRangeTemplate(entryIndex, subsectionKey),
  };
};

const createOverthrowActivityEntryTemplate = (
  entryIndex: number,
  subsectionKey: ActivitySubsectionKey
): OverthrowActivityEntry => {
  const activityDescFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "activityDescription"
  );
  const activityDescFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "activityDescription"
  );

  return {
    _id: Date.now() + Math.random(),
    activityDescription: {
      id: activityDescFieldId,
      name: activityDescFieldName,
      type: getFieldInputType("activityDescription"),
      label: generateFieldLabel("activityDescription", entryIndex),
      value: "",
      rect: generateFieldRect(subsectionKey, entryIndex, "organizationName"),
    },
    dateRange: createDateRangeTemplate(entryIndex, subsectionKey),
  };
};

const createTerrorismAssociationEntryTemplate = (
  entryIndex: number,
  subsectionKey: ActivitySubsectionKey
): TerrorismAssociationEntry => {
  const explanationFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "explanation"
  );
  const explanationFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "explanation"
  );

  return {
    _id: Date.now() + Math.random(),
    explanation: {
      id: explanationFieldId,
      name: explanationFieldName,
      type: getFieldInputType("explanation"),
      label: generateFieldLabel("explanation", entryIndex),
      value: "",
      rect: generateFieldRect(subsectionKey, entryIndex, "explanation"),
    },
  };
};

// ============================================================================
// HELPER TEMPLATE CREATORS
// ============================================================================

const createAddressTemplate = (
  entryIndex: number,
  subsectionKey: SubsectionKey
): Address => {
  // Generate field names and IDs for all address fields
  const streetFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "address.street"
  );
  const streetFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "address.street"
  );

  const cityFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "address.city"
  );
  const cityFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "address.city"
  );

  const stateFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "address.state"
  );
  const stateFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "address.state"
  );

  const zipCodeFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "address.zipCode"
  );
  const zipCodeFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "address.zipCode"
  );

  const countryFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "address.country"
  );
  const countryFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "address.country"
  );

  return {
    street: {
      id: streetFieldId,
      name: streetFieldName,
      type: getFieldInputType("address.street"),
      label: generateFieldLabel("address.street", entryIndex),
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    city: {
      id: cityFieldId,
      name: cityFieldName,
      type: getFieldInputType("address.city"),
      label: generateFieldLabel("address.city", entryIndex),
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    state: {
      id: stateFieldId,
      name: stateFieldName,
      type: getFieldInputType("address.state"),
      label: generateFieldLabel("address.state", entryIndex),
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    zipCode: {
      id: zipCodeFieldId,
      name: zipCodeFieldName,
      type: getFieldInputType("address.zipCode"),
      label: generateFieldLabel("address.zipCode", entryIndex),
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    country: {
      id: countryFieldId,
      name: countryFieldName,
      type: getFieldInputType("address.country"),
      label: generateFieldLabel("address.country", entryIndex),
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
  };
};

const createDateRangeTemplate = (
  entryIndex: number,
  subsectionKey: SubsectionKey
): DateRange => {
  // Generate field names and IDs for all date range fields
  const fromDateFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "dateRange.from"
  );
  const fromDateFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "dateRange.from"
  );

  const fromEstimatedFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "dateRange.from.estimated"
  );
  const fromEstimatedFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "dateRange.from.estimated"
  );

  const toDateFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "dateRange.to"
  );
  const toDateFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "dateRange.to"
  );

  const toEstimatedFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "dateRange.to.estimated"
  );
  const toEstimatedFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "dateRange.to.estimated"
  );

  const presentFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "dateRange.present"
  );
  const presentFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "dateRange.present"
  );

  return {
    from: {
      date: {
        id: fromDateFieldId,
        name: fromDateFieldName,
        type: getFieldInputType("dateRange.from"),
        label: generateFieldLabel("dateRange.from", entryIndex),
        value: "",
        rect: { x: 0, y: 0, width: 0, height: 0 },
      },
      estimated: {
        id: fromEstimatedFieldId,
        name: fromEstimatedFieldName,
        type: getFieldInputType("dateRange.from.estimated"),
        label: generateFieldLabel("dateRange.from.estimated", entryIndex),
        value: false,
        rect: { x: 0, y: 0, width: 0, height: 0 },
      },
    },
    to: {
      date: {
        id: toDateFieldId,
        name: toDateFieldName,
        type: getFieldInputType("dateRange.to"),
        label: generateFieldLabel("dateRange.to", entryIndex),
        value: "",
        rect: { x: 0, y: 0, width: 0, height: 0 },
      },
      estimated: {
        id: toEstimatedFieldId,
        name: toEstimatedFieldName,
        type: getFieldInputType("dateRange.to.estimated"),
        label: generateFieldLabel("dateRange.to.estimated", entryIndex),
        value: false,
        rect: { x: 0, y: 0, width: 0, height: 0 },
      },
    },
    present: {
      id: presentFieldId,
      name: presentFieldName,
      type: getFieldInputType("dateRange.present"),
      label: generateFieldLabel("dateRange.present", entryIndex),
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
  };
};

const createPositionsFieldTemplate = (
  entryIndex: number,
  subsectionKey: SubsectionKey
): PositionsField => {
  const descriptionFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "positions.description"
  );
  const descriptionFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "positions.description"
  );

  const noPositionsHeldFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "positions.noPositionsHeld"
  );
  const noPositionsHeldFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "positions.noPositionsHeld"
  );

  return {
    description: {
      id: descriptionFieldId,
      name: descriptionFieldName,
      type: getFieldInputType("positions.description"),
      label: generateFieldLabel("positions.description", entryIndex),
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    noPositionsHeld: {
      id: noPositionsHeldFieldId,
      name: noPositionsHeldFieldName,
      type: getFieldInputType("positions.noPositionsHeld"),
      label: generateFieldLabel("positions.noPositionsHeld", entryIndex),
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
  };
};

const createContributionsFieldTemplate = (
  entryIndex: number,
  subsectionKey: SubsectionKey
): ContributionsField => {
  const descriptionFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "contributions.description"
  );
  const descriptionFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "contributions.description"
  );

  const noContributionsMadeFieldName = generateFieldName(
    subsectionKey,
    entryIndex,
    "contributions.noContributionsMade"
  );
  const noContributionsMadeFieldId = generateFieldId(
    subsectionKey,
    entryIndex,
    "contributions.noContributionsMade"
  );

  return {
    description: {
      id: descriptionFieldId,
      name: descriptionFieldName,
      type: getFieldInputType("contributions.description"),
      label: generateFieldLabel("contributions.description", entryIndex),
      value: "",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    noContributionsMade: {
      id: noContributionsMadeFieldId,
      name: noContributionsMadeFieldName,
      type: getFieldInputType("contributions.noContributionsMade"),
      label: generateFieldLabel(
        "contributions.noContributionsMade",
        entryIndex
      ),
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
  };
};

// ============================================================================
// CONTEXT IMPLEMENTATION
// ============================================================================

const Section29Context = createContext<Section29ContextType | undefined>(
  undefined
);

export const Section29Provider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [section29Data, setSection29Data] = useState<Section29>(
    createInitialSection29State
  );
  const [isLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Section integration will be handled by useSection86FormIntegration below

  // Safeguard: Prevent data loss during save operations
  // Store a reference to the current data to prevent reset during re-registration
  const currentDataRef = React.useRef<Section29>(section29Data);
  React.useEffect(() => {
    currentDataRef.current = section29Data;
  }, [section29Data]);

  // Initialization effect - mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Update errors when section data changes (but not during initial render)
  useEffect(() => {
    // Skip validation on initial render to avoid infinite loops
    if (!isInitialized) return;

    const validationResult = validateSection();
    const newErrors: Record<string, string> = {};

    // Add validation rules as needed - currently basic implementation
    // TODO: Add specific validation logic when requirements are defined

    // Only update errors if they actually changed
    const currentErrorKeys = Object.keys(errors);
    const newErrorKeys = Object.keys(newErrors);
    const errorsChanged =
      currentErrorKeys.length !== newErrorKeys.length ||
      currentErrorKeys.some(key => errors[key] !== newErrors[key]);

    if (errorsChanged) {
      setErrors(newErrors);
    }
  }, [section29Data, isInitialized, errors]); // Removed validateSection to prevent infinite loops

  // ============================================================================
  // BASIC ACTIONS
  // ============================================================================

  const updateSubsectionFlag = useCallback(
    (subsectionKey: SubsectionKey, hasValue: "YES" | "NO") => {
      setSection29Data((prev) => {
        const updated = cloneDeep(prev);
        const subsection = updated.section29[subsectionKey];

        if (subsection && "hasAssociation" in subsection) {
          // Map YES/NO to the appropriate value for each subsection
          if (hasValue === "YES") {
            subsection.hasAssociation.value = "YES";
          } else {
            // Use the appropriate "NO" value based on subsection
            switch (subsectionKey) {
              case "terrorismOrganizations":
                subsection.hasAssociation.value = "NO (If NO, proceed to 29.2)";
                break;
              case "violentOverthrowOrganizations":
                subsection.hasAssociation.value = "NO (If NO, proceed to 29.5)";
                break;
              case "violenceForceOrganizations":
                subsection.hasAssociation.value = "NO (If NO, proceed to 29.6)";
                break;
              case "terrorismAssociations":
                subsection.hasAssociation.value = "NO ";
                break;
              default:
                subsection.hasAssociation.value = "NO ";
            }
          }
        } else if (subsection && "hasActivity" in subsection) {
          // Map YES/NO to the appropriate value for each subsection
          if (hasValue === "YES") {
            subsection.hasActivity.value = "YES";
          } else {
            // Use the appropriate "NO" value based on subsection
            switch (subsectionKey) {
              case "terrorismActivities":
                subsection.hasActivity.value = "NO (If NO, proceed to 29.3)";
                break;
              case "terrorismAdvocacy":
                subsection.hasActivity.value = "NO (Proceed to 29.4)";
                break;
              case "overthrowActivities":
                subsection.hasActivity.value = "NO (If NO, proceed to 29.7)";
                break;
              default:
                // This should not happen for activity subsections
                break;
            }
          }
        }

        setIsDirty(true);
        return updated;
      });
    },
    []
  );

  const addOrganizationEntry = useCallback(
    (subsectionKey: OrganizationSubsectionKey) => {
      setSection29Data((prev) => {
        const updated = cloneDeep(prev);
        const subsection = updated.section29[subsectionKey];
        const entryIndex = subsection?.entries?.length || 0;

        const newEntry = createOrganizationEntryTemplate(
          entryIndex,
          subsectionKey
        );
        subsection?.entries?.push(newEntry);

        setIsDirty(true);
        return updated;
      });
    },
    []
  );

  const addActivityEntry = useCallback(
    (subsectionKey: ActivitySubsectionKey, entryType: ActivityEntryType) => {
      setSection29Data((prev) => {
        const updated = cloneDeep(prev);
        const subsection = updated.section29[subsectionKey];
        const entryIndex = subsection?.entries?.length || 0;

        let newEntry: any;
        switch (entryType) {
          case "terrorism":
            // Check if this is actually a terrorism advocacy subsection
            if (subsectionKey === "terrorismAdvocacy") {
              newEntry = createTerrorismAdvocacyEntryTemplate(
                entryIndex,
                subsectionKey
              );
            } else {
              newEntry = createTerrorismActivityEntryTemplate(
                entryIndex,
                subsectionKey
              );
            }
            break;
          case "overthrow":
            newEntry = createOverthrowActivityEntryTemplate(
              entryIndex,
              subsectionKey
            );
            break;
          case "association":
            newEntry = createTerrorismAssociationEntryTemplate(
              entryIndex,
              subsectionKey
            );
            break;
          default:
            throw new Error(`Unknown activity entry type: ${entryType}`);
        }

        subsection?.entries?.push(newEntry);

        setIsDirty(true);
        return updated;
      });
    },
    []
  );

  const removeEntry = useCallback(
    (subsectionKey: SubsectionKey, entryIndex: number) => {
      setSection29Data((prev) => {
        const updated = cloneDeep(prev);
        const subsection = updated.section29[subsectionKey];

        if (
          subsection?.entries &&
          entryIndex >= 0 &&
          entryIndex < subsection?.entries.length
        ) {
          subsection?.entries.splice(entryIndex, 1);
          setIsDirty(true);
        }

        return updated;
      });
    },
    []
  );

  const updateFieldValue = useCallback(
    (
      subsectionKey: SubsectionKey,
      entryIndex: number,
      fieldPath: string,
      newValue: any
    ) => {
      console.log(`🔧 Section29: updateFieldValue called:`, {
        subsectionKey,
        entryIndex,
        fieldPath,
        newValue,
      });

      try {
        setSection29Data((prev) => {
          console.log(
            `🔍 Section29: updateFieldValue - starting with prev data:`,
            prev
          );

          const updated = cloneDeep(prev);
          const subsection = updated.section29[subsectionKey];

          console.log(
            `🔍 Section29: updateFieldValue - subsection found:`,
            !!subsection
          );
          console.log(
            `🔍 Section29: updateFieldValue - subsection:`,
            subsection
          );
          console.log(
            `🔍 Section29: updateFieldValue - entries length:`,
            subsection?.entries?.length
          );
          console.log(
            `🔍 Section29: updateFieldValue - entryIndex valid:`,
            entryIndex >= 0 && entryIndex < (subsection?.entries?.length || 0)
          );

          if (
            subsection?.entries &&
            entryIndex >= 0 &&
            entryIndex < subsection?.entries.length
          ) {
            const entry = subsection?.entries[entryIndex];
            console.log(
              `🔍 Section29: updateFieldValue - entry before update:`,
              entry
            );
            console.log(
              `🔍 Section29: updateFieldValue - field path: ${fieldPath}.value`
            );
            console.log(
              `🔍 Section29: updateFieldValue - current field value:`,
              get(entry, `${fieldPath}.value`)
            );

            try {
              set(entry, `${fieldPath}.value`, newValue);
              console.log(
                `✅ Section29: updateFieldValue - lodash set completed successfully`
              );
            } catch (setError) {
              console.error(
                `❌ Section29: updateFieldValue - lodash set failed:`,
                setError
              );
              throw setError;
            }

            console.log(
              `✅ Section29: updateFieldValue - field updated successfully`
            );
            console.log(
              `🔍 Section29: updateFieldValue - new field value:`,
              get(entry, `${fieldPath}.value`)
            );
            console.log(
              `🔍 Section29: updateFieldValue - entry after update:`,
              entry
            );

            setIsDirty(true);
            console.log(
              `🔄 Section29: updateFieldValue - setIsDirty(true) called`
            );
          } else {
            console.error(
              `❌ Section29: updateFieldValue - invalid entry access:`,
              {
                hasSubsection: !!subsection,
                hasEntries: !!subsection?.entries,
                entriesLength: subsection?.entries?.length,
                entryIndex,
                isValidIndex:
                  entryIndex >= 0 &&
                  entryIndex < (subsection?.entries?.length || 0),
              }
            );
          }

          console.log(
            `🔍 Section29: updateFieldValue - returning updated data:`,
            updated
          );
          return updated;
        });

        console.log(
          `✅ Section29: updateFieldValue - setSection29Data completed successfully`
        );
      } catch (error) {
        console.error(
          `❌ Section29: updateFieldValue - CRITICAL ERROR:`,
          error
        );
        console.error(
          `❌ Section29: updateFieldValue - Error stack:`,
          error instanceof Error ? error.stack : "No stack trace available"
        );
      }
    },
    []
  );

  // ============================================================================
  // ENHANCED ENTRY MANAGEMENT
  // ============================================================================

  const getEntryCount = useCallback(
    (subsectionKey: SubsectionKey): number => {
      return section29Data.section29[subsectionKey]?.entries?.length || 0;
    },
    [section29Data]
  );

  const getEntry = useCallback(
    (subsectionKey: SubsectionKey, entryIndex: number): any => {
      const subsection = section29Data.section29[subsectionKey];
      return subsection?.entries &&
        entryIndex >= 0 &&
        entryIndex < subsection?.entries.length
        ? subsection?.entries[entryIndex]
        : null;
    },
    [section29Data]
  );

  const moveEntry = useCallback(
    (subsectionKey: SubsectionKey, fromIndex: number, toIndex: number) => {
      setSection29Data((prev) => {
        const updated = cloneDeep(prev);
        const subsection = updated.section29[subsectionKey];

        if (
          subsection?.entries &&
          fromIndex >= 0 &&
          fromIndex < subsection?.entries.length &&
          toIndex >= 0 &&
          toIndex < subsection?.entries.length
        ) {
          const [movedEntry] = subsection?.entries.splice(fromIndex, 1);
          (subsection?.entries as any[])?.splice(toIndex, 0, movedEntry);
          setIsDirty(true);
        }

        return updated;
      });
    },
    []
  );

  const duplicateEntry = useCallback(
    (subsectionKey: SubsectionKey, entryIndex: number) => {
      setSection29Data((prev) => {
        const updated = cloneDeep(prev);
        const subsection = updated.section29[subsectionKey];

        if (
          subsection?.entries &&
          entryIndex >= 0 &&
          entryIndex < subsection?.entries.length
        ) {
          const originalEntry = subsection?.entries[entryIndex];
          const duplicatedEntry = cloneDeep(originalEntry);
          duplicatedEntry._id = Date.now() + Math.random();
          (subsection?.entries as any[])?.push(duplicatedEntry);
          setIsDirty(true);
        }

        return updated;
      });
    },
    []
  );

  const clearEntry = useCallback(
    (subsectionKey: SubsectionKey, entryIndex: number) => {
      setSection29Data((prev) => {
        const updated = cloneDeep(prev);
        const subsection = updated.section29[subsectionKey];

        if (
          subsection?.entries &&
          entryIndex >= 0 &&
          entryIndex < subsection?.entries.length
        ) {
          const entry = subsection?.entries[entryIndex] as any;
          // Clear all field values while preserving structure
          Object.keys(entry).forEach((key) => {
            if (
              key !== "_id" &&
              typeof entry[key] === "object" &&
              entry[key].value !== undefined
            ) {
              entry[key].value = entry[key].type === "checkbox" ? false : "";
            }
          });
          setIsDirty(true);
        }

        return updated;
      });
    },
    []
  );

  const bulkUpdateFields = useCallback(
    (
      subsectionKey: SubsectionKey,
      entryIndex: number,
      fieldUpdates: Record<string, any>
    ) => {
      setSection29Data((prev) => {
        const updated = cloneDeep(prev);
        const subsection = updated.section29[subsectionKey];

        if (
          subsection?.entries &&
          entryIndex >= 0 &&
          entryIndex < subsection?.entries.length
        ) {
          const entry = subsection?.entries[entryIndex];
          Object.entries(fieldUpdates).forEach(([fieldPath, newValue]) => {
            set(entry, `${fieldPath}.value`, newValue);
          });
          setIsDirty(true);
        }

        return updated;
      });
    },
    []
  );

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    setSection29Data(createInitialSection29State());
    setErrors({});
    setIsDirty(false);
  }, []);

  const loadSection = useCallback((data: Section29) => {
    console.log(`🔄 Section29: Loading section data`);
    console.log(`📊 Incoming data:`, data);
    console.log(`📊 Current data:`, currentDataRef.current);

    // Safeguard: Only load if the incoming data is different and not empty
    const currentData = currentDataRef.current;
    const hasCurrentEntries = Object.values(currentData).some(
      (subsection) =>
        subsection &&
        typeof subsection === "object" &&
        "entries" in subsection &&
        Array.isArray(subsection.entries) &&
        subsection.entries.length > 0
    );

    const hasIncomingEntries = Object.values(data).some(
      (subsection) =>
        subsection &&
        typeof subsection === "object" &&
        "entries" in subsection &&
        Array.isArray(subsection.entries) &&
        subsection.entries.length > 0
    );

    // If we have current data with entries and incoming data is empty/default, preserve current data
    if (hasCurrentEntries && !hasIncomingEntries) {
      console.log(
        `🛡️ Section29: Preserving current data - incoming data appears to be default/empty`
      );
      return;
    }

    // If incoming data has entries or current data is empty, load the new data
    console.log(`✅ Section29: Loading new data`);
    setSection29Data(data);
    setIsDirty(false);
  }, []);

  const validateSection = useCallback((): boolean => {
    // Basic validation logic
    const newErrors: Record<string, string> = {};

    // Add validation rules as needed

    // Don't call setErrors here to prevent infinite loops
    // Errors will be updated in separate useEffect
    return Object.keys(newErrors).length === 0;
  }, []); // FIXED: No dependencies to prevent infinite loops

  const getChanges = useCallback((): ChangeSet => {
    // Return changes for tracking purposes
    const changes: ChangeSet = {};

    if (isDirty) {
      changes['section29'] = {
        oldValue: createInitialSection29State(),
        newValue: section29Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section29Data, isDirty]);

  // ============================================================================
  // FIELD FLATTENING FOR PDF GENERATION
  // ============================================================================

  /**
   * Flatten Section29 data structure into Field objects for PDF generation
   * This converts the nested Section29 structure into a flat object with Field<T> objects
   */
  const flattenSection29Fields = useCallback((): Record<string, any> => {
    const flatFields: Record<string, any> = {};

    const addField = (field: any, _path: string) => {
      if (
        field &&
        typeof field === "object" &&
        "id" in field &&
        "value" in field
      ) {
        flatFields[field.id] = field;
      }
    };

    // Flatten main subsection flags
    Object.entries(section29Data).forEach(([subsectionKey, subsectionData]) => {
      if (subsectionKey === "_id") return;

      if (subsectionData && typeof subsectionData === "object") {
        // Add the main flag field (hasAssociation/hasActivity)
        if (
          "hasAssociation" in subsectionData &&
          subsectionData.hasAssociation
        ) {
          addField(
            subsectionData.hasAssociation,
            `${subsectionKey}.hasAssociation`
          );
        }
        if ("hasActivity" in subsectionData && subsectionData.hasActivity) {
          addField(subsectionData.hasActivity, `${subsectionKey}.hasActivity`);
        }

        // Flatten entries
        if (
          "entries" in subsectionData &&
          Array.isArray(subsectionData.entries)
        ) {
          subsectionData.entries.forEach((entry: any, entryIndex: number) => {
            const flattenEntry = (obj: any, prefix: string) => {
              Object.entries(obj).forEach(([key, value]) => {
                if (key === "_id") return;

                const currentPath = `${prefix}.${key}`;

                if (
                  value &&
                  typeof value === "object" &&
                  "id" in value &&
                  "value" in value
                ) {
                  // This is a Field object
                  addField(value, currentPath);
                } else if (value && typeof value === "object") {
                  // This is a nested object, recurse
                  flattenEntry(value, currentPath);
                }
              });
            };

            flattenEntry(entry, `${subsectionKey}.entries.${entryIndex}`);
          });
        }
      }
    });

    return flatFields;
  }, [section29Data]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Create a wrapper function that matches the integration hook's expected signature
  // Integration expects: (path: string, value: any) => void
  // Section 29 has: (subsectionKey, entryIndex, fieldPath, newValue) => void
  const updateFieldValueWrapper = useCallback((path: string, value: any) => {
    // Parse the path to extract subsection, entry index, and field path
    // Expected format: "section29.subsectionKey.entries[index].fieldPath"
    const pathParts = path.split('.');

    if (pathParts.length >= 4 && pathParts[0] === 'section29') {
      const subsectionKey = pathParts[1] as SubsectionKey;
      const entriesMatch = pathParts[2].match(/entries\[(\d+)\]/);

      if (entriesMatch) {
        const entryIndex = parseInt(entriesMatch[1]);
        const fieldPath = pathParts.slice(3).join('.');

        // Call Section 29's updateFieldValue with the correct signature
        updateFieldValue(subsectionKey, entryIndex, fieldPath, value);
        return;
      }
    }

    // Fallback: use lodash set for direct path updates
    setSection29Data(prev => {
      const updated = cloneDeep(prev);
      set(updated, path, value);
      return updated;
    });
  }, [updateFieldValue]);

  // Integration with main form context using Section 1 gold standard pattern
  // Note: integration variable is used internally by the hook for registration
  // Restored updateFieldValue parameter to match Section 1 pattern exactly
  const integration = useSection86FormIntegration(
    'section29',
    'Section 29: Associations',
    section29Data,
    setSection29Data,
    () => ({ isValid: validateSection(), errors: [], warnings: [] }), // Anonymous function like Section 1
    () => getChanges(), // Anonymous function like Section 1
    updateFieldValueWrapper // Pass wrapper function that matches expected signature
  );

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
    getChanges,
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
    throw new Error("useSection29 must be used within a Section29Provider");
  }
  return context;
};
