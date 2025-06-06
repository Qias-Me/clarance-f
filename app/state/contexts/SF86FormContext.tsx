/**
 * Central SF86FormContext for SF-86 Form Architecture
 *
 * This is the central coordinator that manages global form state across all 30 sections,
 * provides unified change tracking and validation, handles ApplicantFormValues integration,
 * and coordinates cross-section dependencies and navigation.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { cloneDeep, set, get, merge } from "lodash";
import type { ApplicantFormValues } from "../../../api/interfaces/formDefinition2.0";
import type {
  SectionRegistration,
  ValidationResult,
  ValidationError,
  ChangeSet,
} from "./shared/base-interfaces";
import {
  SectionIntegrationProvider,
  useSectionIntegration,
} from "./shared/section-integration";
import { clientPdfService2 } from "../../../api/service/clientPdfService2.0";
import DynamicService from "../../../api/service/dynamicService";
import { Section1Provider } from "./sections2.0/section1";
import { Section2Provider } from "./sections2.0/section2";
import { Section3Provider } from "./sections2.0/section3";
import { Section4Provider } from "./sections2.0/section4";
import { Section5Provider } from "./sections2.0/section5";
import { Section6Provider } from "./sections2.0/section6";
import { Section7Provider } from "./sections2.0/section7";
import { Section8Provider } from "./sections2.0/section8";
import { Section9Provider } from "./sections2.0/section9";
import { Section10Provider } from "./sections2.0/section10";
import { Section11Provider } from "./sections2.0/section11";
import { Section12Provider } from "./sections2.0/section12";
import { Section13Provider } from "./sections2.0/section13";
import { Section14Provider } from "./sections2.0/section14";
import { Section15Provider } from "./sections2.0/section15";

import { Section17Provider } from "./sections2.0/section17";
import { Section28Provider } from "./sections2.0/section28";
import { Section29Provider } from "./sections2.0/section29";
import { Section30Provider } from "./sections2.0/section30";
import { Section16Provider } from "./sections2.0/section16";
import { Section18Provider } from "./sections2.0/section18";

// ============================================================================
// SF86 FORM CONTEXT INTERFACE
// ============================================================================

/**
 * Central SF86FormContext interface
 * Provides global form state management and section coordination
 */
export interface SF86FormContextType {
  // Global State
  formData: ApplicantFormValues;
  isDirty: boolean;
  isValid: boolean;
  isLoading: boolean;
  errors: ValidationError[];

  // Section Management
  registeredSections: SectionRegistration[];
  activeSections: string[];
  completedSections: string[];

  // Global Operations
  updateFormData: (updates: Partial<ApplicantFormValues>) => void;
  updateSectionData: (sectionId: string, data: any) => void;
  getSectionData: (sectionId: string) => any;
  validateForm: () => ValidationResult;
  validateSection: (sectionId: string) => ValidationResult;
  saveForm: () => Promise<void>;
  loadForm: (data: ApplicantFormValues) => void;
  resetForm: () => void;
  exportForm: () => ApplicantFormValues;

  // Navigation
  navigateToSection: (sectionId: string) => void;
  getNextIncompleteSection: () => string | null;
  getPreviousSection: (currentSectionId: string) => string | null;
  getNextSection: (currentSectionId: string) => string | null;

  // Change Tracking
  getChanges: () => ChangeSet;
  hasUnsavedChanges: () => boolean;
  markSectionComplete: (sectionId: string) => void;
  markSectionIncomplete: (sectionId: string) => void;

  // Data Persistence
  autoSave: boolean;
  setAutoSave: (enabled: boolean) => void;
  lastSaved: Date | null;

  // Cross-Section Dependencies
  checkDependencies: (sectionId: string) => string[];
  resolveDependency: (
    dependentSection: string,
    requiredSection: string
  ) => void;

  // CRUD Operations for Sections
  createSectionEntry: (sectionId: string, entryData: any) => void;
  updateSectionEntry: (
    sectionId: string,
    entryIndex: number,
    entryData: any
  ) => void;
  deleteSectionEntry: (sectionId: string, entryIndex: number) => void;
  getSectionEntries: (sectionId: string) => any[];

  // Section-specific operations
  initializeSection: (sectionId: string, defaultData?: any) => void;
  clearSection: (sectionId: string) => void;
  duplicateEntry: (sectionId: string, entryIndex: number) => void;
  moveEntry: (sectionId: string, fromIndex: number, toIndex: number) => void;

  // Bulk operations
  bulkUpdateSections: (updates: Record<string, any>) => void;
  bulkValidateSections: (sectionIds: string[]) => ValidationResult;

  // PDF Integration
  generatePdf: () => Promise<{
    success: boolean;
    pdfBytes?: Uint8Array;
    errors: string[];
    fieldsMapped?: number;
    fieldsApplied?: number;
  }>;
  downloadPdf: (
    filename?: string
  ) => Promise<{ success: boolean; errors: string[] }>;
  validatePdfMapping: () => Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>;
  getPdfFieldStats: () => {
    totalFields: number;
    mappedFields: number;
    unmappedFields: number;
  };

  // New utility function
  diagnosePdfFieldMapping: (sectionName?: string) => Promise<any>;
}

/**
 * Default form data structure with all 30 SF-86 sections
 */
const DEFAULT_FORM_DATA: ApplicantFormValues = {
  // SF-86 Sections 1-30
  section1: undefined,
  section2: undefined,
  section3: undefined,
  section4: undefined,
  section5: undefined,
  section6: undefined,
  section7: undefined,
  section8: undefined,
  section9: undefined,
  section10: undefined,
  section11: undefined,
  section12: undefined,
  section13: undefined,
  section14: undefined,
  section15: undefined,
  section16: undefined,
  section17: undefined,
  section18: undefined,
  section19: undefined,
  section20: undefined,
  section21: undefined,
  section22: undefined,
  section23: undefined,
  section24: undefined,
  section25: undefined,
  section26: undefined,
  section27: undefined,
  section28: undefined,
  section29: undefined,
  section30: undefined,

  // Legacy/Additional sections
  print: undefined,
};

// ============================================================================
// SF86 FORM CONTEXT IMPLEMENTATION
// ============================================================================

/**
 * SF86FormContext - Central form coordinator
 */
const SF86FormContext = createContext<SF86FormContextType | null>(null);

/**
 * SF86FormProvider - Central form state provider
 */
export const SF86FormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Core state
  const [formData, setFormData] =
    useState<ApplicantFormValues>(DEFAULT_FORM_DATA);
  const [initialFormData, setInitialFormData] =
    useState<ApplicantFormValues>(DEFAULT_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Section integration with reactive registeredSections
  const integration = useSectionIntegration();
  const [registeredSections, setRegisteredSections] = useState<
    SectionRegistration[]
  >([]);

  // CRITICAL: Make registeredSections reactive to section registration events
  useEffect(() => {
    // Initialize with current sections ONLY ONCE on mount
    setRegisteredSections(integration.getAllSections());

    // Subscribe to section registration events
    const unsubscribe = integration.subscribeToEvents(
      "SECTION_UPDATE",
      (event) => {
        // Only log in debug mode to prevent console spam
        const isDebugMode =
          typeof window !== "undefined" &&
          window.location.search.includes("debug=true");

        if (isDebugMode && event.payload.action === "registered") {
          console.log(
            `🔄 SF86FormContext: Section registered: ${event.sectionId}`
          );
        }

        // FIXED: Only update on registration/unregistration, not on every update
        // This prevents infinite loops caused by baseSectionContext re-creation
        if (
          event.payload.action === "registered" ||
          event.payload.action === "unregistered"
        ) {
          const updatedSections = integration.getAllSections();

          // ENHANCED: Only update if sections actually changed (by section IDs only)
          setRegisteredSections((prevSections) => {
            // Compare only section IDs to detect real registration changes
            const prevSectionIds = prevSections.map((s) => s.sectionId).sort();
            const newSectionIds = updatedSections
              .map((s) => s.sectionId)
              .sort();

            // Only update if there are actual registration changes (not timestamp changes)
            if (
              JSON.stringify(prevSectionIds) !== JSON.stringify(newSectionIds)
            ) {
              if (isDebugMode) {
                console.log(
                  `🔄 SF86FormContext: Section registration changed`,
                  {
                    previous: prevSectionIds,
                    new: newSectionIds,
                  }
                );
              }
              return updatedSections;
            }

            return prevSections; // No change, return previous state to prevent re-renders
          });
        }
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, []); // FIXED: Remove integration dependency to prevent subscription re-creation

  // Data persistence service
  const dynamicService = useMemo(() => new DynamicService(), []);

  // Auto-save timer
  const autoSaveTimerRef = useRef<number | null>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Check if form has unsaved changes
   */
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  /**
   * Check if form is valid
   */
  const isValid = useMemo(() => {
    return errors.length === 0;
  }, [errors]);

  /**
   * Get active sections (sections with data)
   */
  const activeSections = useMemo(() => {
    return Object.keys(formData).filter(
      (key) => formData[key as keyof ApplicantFormValues] !== undefined
    );
  }, [formData]);

  // ============================================================================
  // FORM DATA OPERATIONS
  // ============================================================================

  /**
   * Update form data with partial updates
   */
  const updateFormData = useCallback(
    (updates: Partial<ApplicantFormValues>) => {
      setFormData((prevData) => {
        const newData = merge(cloneDeep(prevData), updates);

        // Emit form update event
        integration.emitEvent({
          type: "SECTION_UPDATE",
          sectionId: "global",
          payload: { updates, newData },
        });

        return newData;
      });
    },
    [integration]
  );

  /**
   * Update specific section data
   */
  const updateSectionData = useCallback(
    (sectionId: string, data: any) => {
      // Special debugging for Section 2
      if (sectionId === "section2") {
        console.log(
          "🔍 SF86FormContext: updateSectionData called for Section 2:",
          {
            sectionId,
            data,
            dateValue: data?.section2?.date?.value,
            estimatedValue: data?.section2?.isEstimated?.value,
          }
        );
      }

      // Special debugging for Section 29
      if (sectionId === "section29") {
        console.log(
          "🔍 SF86FormContext: updateSectionData called for Section 29:",
          {
            sectionId,
            data,
            dataType: typeof data,
            dataKeys: data ? Object.keys(data) : "N/A",
            section29Property: data?.section29,
            terrorismAssociations: data?.section29?.terrorismAssociations,
            entriesCount:
              data?.section29?.terrorismAssociations?.entries?.length || 0,
          }
        );
      }

      setFormData((prevData) => {
        const newData = cloneDeep(prevData);

        // Store data using standard approach - maintaining uniform double nesting structure
        set(newData, sectionId, data);

        // Special debugging for Section 2
        if (sectionId === "section2") {
          console.log(
            "🔍 SF86FormContext: After setting Section 2 data in formData:",
            {
              newFormData: newData,
              section2InFormData: newData.section2,
              dateInFormData: (newData.section2 as any)?.section2?.date?.value,
              estimatedInFormData: (newData.section2 as any)?.section2
                ?.isEstimated?.value,
            }
          );
        }

        // Special debugging for Section 14
        if (sectionId === "section14") {
          console.log(
            "🔍 SF86FormContext: updateSectionData called for Section 14:",
            {
              sectionId,
              data,
              section14Property: data?.section14,
              registrationStatus: data?.section14?.registrationStatus?.value,
              registrationNumber: data?.section14?.registrationNumber?.value,
              militaryServiceStatus: data?.section14?.militaryServiceStatus?.value,
            }
          );
          console.log(
            "🔍 SF86FormContext: After setting Section 14 data in formData:",
            {
              newFormData: newData,
              section14InFormData: newData.section14,
              section14Property: (newData.section14 as any)?.section14,
            }
          );
        }

        // Special debugging for Section 29
        if (sectionId === "section29") {
          console.log(
            "🔍 SF86FormContext: After setting Section 29 data in formData:",
            {
              newFormData: newData,
              section29InFormData: newData.section29,
              section29Property: (newData.section29 as any)?.section29,
              terrorismAssociations: (newData.section29 as any)?.section29
                ?.terrorismAssociations,
              entriesCount:
                (newData.section29 as any)?.section29?.terrorismAssociations
                  ?.entries?.length || 0,
            }
          );
        }

        // Emit section update event
        integration.emitEvent({
          type: "SECTION_UPDATE",
          sectionId,
          payload: { data },
        });

        return newData;
      });
    },
    [integration]
  );

  /**
   * Get specific section data
   */
  const getSectionData = useCallback(
    (sectionId: string) => {
      return get(formData, sectionId);
    },
    [formData]
  );

  // ============================================================================
  // VALIDATION OPERATIONS
  // ============================================================================

  /**
   * Validate the entire form
   */
  const validateForm = useCallback((): ValidationResult => {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];

    // Validate each registered section with defensive checks
    registeredSections.forEach((registration) => {
      // Add defensive checks to prevent undefined errors
      if (
        registration &&
        registration.context &&
        registration.context.validateSection
      ) {
        try {
          const sectionResult = registration.context.validateSection();
          if (sectionResult && sectionResult.errors) {
            allErrors.push(...sectionResult.errors);
          }
          if (sectionResult && sectionResult.warnings) {
            allWarnings.push(...sectionResult.warnings);
          }
        } catch (error) {
          console.warn(
            `⚠️ SF86FormContext: Validation failed for section ${registration.sectionId}:`,
            error
          );
          // Add a generic error for this section
          allErrors.push({
            field: "general",
            message: `Validation error in section ${registration.sectionId}`,
            code: "VALIDATION_ERROR",
            severity: "error",
          });
        }
      } else {
        console.warn(
          `⚠️ SF86FormContext: Section ${registration?.sectionId || "unknown"
          } missing validateSection method`
        );
      }
    });

    // Update global errors
    setErrors(allErrors);

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }, [registeredSections]);

  /**
   * Validate a specific section
   */
  const validateSection = useCallback(
    (sectionId: string): ValidationResult => {
      const registration = registeredSections.find(
        (r) => r.sectionId === sectionId
      );

      if (
        registration &&
        registration.context &&
        registration.context.validateSection
      ) {
        try {
          return registration.context.validateSection();
        } catch (error) {
          console.warn(
            `⚠️ SF86FormContext: Validation failed for section ${sectionId}:`,
            error
          );
          return {
            isValid: false,
            errors: [
              {
                field: "general",
                message: `Validation error in section ${sectionId}`,
                code: "VALIDATION_ERROR",
                severity: "error",
              },
            ],
            warnings: [],
          };
        }
      }

      return {
        isValid: true,
        errors: [],
        warnings: [],
      };
    },
    [registeredSections]
  );

  // ============================================================================
  // DATA COLLECTION OPERATIONS
  // ============================================================================

  /**
   * Collect data from all registered section contexts
   */
  const collectAllSectionData = useCallback((): ApplicantFormValues => {
    // TEMPORARY: Force debug mode for PDF generation investigation
    const isDebugMode = true; // typeof window !== 'undefined' && window.location.search.includes('debug=true');

    if (isDebugMode) {
      console.log(`\n🔍 ===== COLLECTING SECTION DATA =====`);
      console.log(`📊 Registered sections count: ${registeredSections.length}`);
      console.log(
        `📋 Registered section IDs:`,
        registeredSections.map((r) => r.sectionId)
      );
    }

    const collectedData = cloneDeep(formData);

    if (isDebugMode) {
      console.log(
        `📊 Starting with base form data:`,
        Object.keys(collectedData)
      );
      console.log(
        `📊 Base form data sections count:`,
        Object.keys(collectedData).length
      );
    }

    // Collect data from all registered section contexts
    registeredSections.forEach((registration, index) => {
      if (isDebugMode) {
        console.log(
          `\n📁 [${index + 1}/${registeredSections.length
          }] Processing section: ${registration.sectionId}`
        );
        console.log(`   📊 Section name: ${registration.sectionName}`);
        console.log(`   📊 Is active: ${registration.isActive}`);
        console.log(`   📊 Has context: ${!!registration.context}`);
        console.log(
          `   📊 Has sectionData: ${!!registration.context?.sectionData}`
        );
      }

      // PRIORITY FIX: Check for manually updated data first, then synced data, then registration data
      const manuallyUpdatedData = get(collectedData, registration.sectionId);
      const syncedData = integration.requestSectionData(registration.sectionId);
      const registrationData = registration.context?.sectionData;

      // Use manually updated data if available, otherwise use synced data, otherwise use registration data
      const sectionData = manuallyUpdatedData || syncedData || registrationData;

      if (isDebugMode) {
        console.log(`   🔧 Data source priority check:`);
        console.log(
          `     📊 Manually updated data exists: ${!!manuallyUpdatedData}`
        );
        console.log(`     📊 Synced data exists: ${!!syncedData}`);
        console.log(`     📊 Registration data exists: ${!!registrationData}`);
        console.log(
          `     📊 Using data source: ${manuallyUpdatedData
            ? "manual"
            : syncedData
              ? "synced"
              : "registration"
          }`
        );
      }

      if (sectionData) {
        if (isDebugMode) {
          console.log(`   📊 Section data type: ${typeof sectionData}`);
          console.log(
            `   📊 Section data keys:`,
            sectionData ? Object.keys(sectionData) : "N/A"
          );

          // Count Field objects in this section
          let fieldCount = 0;
          const countFields = (obj: any) => {
            if (obj && typeof obj === "object") {
              if ("id" in obj && "value" in obj) {
                fieldCount++;
              } else {
                Object.values(obj).forEach((val) => countFields(val));
              }
            }
          };
          countFields(sectionData);
          console.log(`   🎯 Field objects found: ${fieldCount}`);
        }

        // Special debugging for Section 29 when debug mode is enabled
        if (isDebugMode && registration.sectionId === "section29") {
          console.log(`   🔍 Section29 specific analysis:`);
          console.log(
            `     📊 terrorismAssociations:`,
            !!sectionData.terrorismAssociations
          );
          console.log(
            `     📊 entries:`,
            sectionData.terrorismAssociations?.entries?.length || 0
          );
        }

        // Special debugging for Section 2
        if (registration.sectionId === "section2") {
          console.log(`   🔍 Section2 specific analysis:`);
          console.log(`     📊 sectionData:`, sectionData);
          console.log(`     📊 section2 property:`, sectionData?.section2);
          console.log(
            `     📊 date value:`,
            sectionData?.section2?.date?.value
          );
          console.log(
            `     📊 estimated value:`,
            sectionData?.section2?.isEstimated?.value
          );
          console.log(
            `     📊 Data source used: ${manuallyUpdatedData
              ? "MANUAL UPDATE"
              : syncedData
                ? "SYNCED"
                : "REGISTRATION"
            }`
          );
        }

        // Set the data (this will overwrite if manually updated data was already there)
        set(collectedData, registration.sectionId, sectionData);

        if (isDebugMode) {
          console.log(
            `   ✅ Successfully collected data from ${registration.sectionId}`
          );
        }
      } else {
        if (isDebugMode) {
          console.log(
            `   ❌ No section data available for ${registration.sectionId}`
          );
          if (registration.context) {
            console.log(
              `     📊 Context properties:`,
              Object.keys(registration.context)
            );
          }
        }
      }
    });

    if (isDebugMode) {
      console.log(`\n📊 ===== COLLECTION SUMMARY =====`);
      console.log(
        `📈 Final collected data sections:`,
        Object.keys(collectedData)
      );
      console.log(
        `📈 Total sections collected: ${Object.keys(collectedData).length}`
      );

      // Count total Field objects across all sections
      let totalFields = 0;
      const countAllFields = (obj: any) => {
        if (obj && typeof obj === "object") {
          if ("id" in obj && "value" in obj) {
            totalFields++;
          } else {
            Object.values(obj).forEach((val) => countAllFields(val));
          }
        }
      };
      countAllFields(collectedData);
      console.log(`🎯 Total Field objects across all sections: ${totalFields}`);
      console.log(`🔍 ===== COLLECTION COMPLETE =====\n`);
    }

    return collectedData;
  }, [formData, registeredSections]);

  // ============================================================================
  // DATA PERSISTENCE OPERATIONS
  // ============================================================================

  /**
   * Save form data using IndexedDB for better persistence
   */
  const saveForm = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    const isDebugMode =
      typeof window !== "undefined" &&
      window.location.search.includes("debug=true");

    try {
      if (isDebugMode) {
        console.log("🚀 SF86FormContext: Starting form save process...");
      }

      // Collect data from all section contexts before saving
      const completeFormData = collectAllSectionData();

      if (isDebugMode) {
        console.log(
          "📊 SF86FormContext: Collected form data sections:",
          Object.keys(completeFormData)
        );
      }

      // Validate before saving
      const validationResult = validateForm();
      if (!validationResult.isValid && isDebugMode) {
        console.warn(
          "⚠️ SF86FormContext: Form validation failed, saving anyway for draft purposes"
        );
      }

      // Save complete form data to IndexedDB
      const saveResult = await dynamicService.saveUserFormData(
        "complete-form",
        completeFormData
      );

      if (!saveResult.success) {
        throw new Error(
          `Failed to save form data to IndexedDB: ${saveResult.message}`
        );
      }

      // Save completed sections metadata
      const completedSectionsData = { completedSections };
      await dynamicService.saveUserFormData(
        "completed-sections",
        completedSectionsData as any
      );

      // Update initial data to mark as saved
      setInitialFormData(cloneDeep(completeFormData));
      setLastSaved(saveResult.timestamp || new Date());

      if (isDebugMode) {
        console.log(
          "✅ SF86FormContext: Form data saved successfully to IndexedDB"
        );
        console.log(
          `📊 Save stats: ${saveResult.size} bytes, ${Object.keys(completeFormData).length
          } sections`
        );
      }

      // Emit save event to notify all sections
      integration.emitEvent({
        type: "DATA_SYNC",
        sectionId: "global",
        payload: {
          action: "saved",
          formData: completeFormData,
          method: "indexeddb",
          timestamp: saveResult.timestamp,
          size: saveResult.size,
        },
      });
    } catch (error) {
      console.error("❌ SF86FormContext: Failed to save form:", error);

      // Emit error event
      integration.emitEvent({
        type: "DATA_SYNC",
        sectionId: "global",
        payload: {
          action: "save_failed",
          error: String(error),
          method: "indexeddb",
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    validateForm,
    integration,
    dynamicService,
    collectAllSectionData,
    completedSections,
  ]);

  /**
   * Load form data from IndexedDB or provided data
   */
  const loadForm = useCallback(
    async (data?: ApplicantFormValues) => {
      const isDebugMode =
        typeof window !== "undefined" &&
        window.location.search.includes("debug=true");

      try {
        let formDataToLoad: ApplicantFormValues;

        if (data) {
          // Use provided data
          formDataToLoad = data;
          if (isDebugMode) {
            console.log("🔄 SF86FormContext: Loading provided form data");
          }
        } else {
          // Try to load from IndexedDB first
          if (isDebugMode) {
            console.log(
              "📂 SF86FormContext: Loading form data from IndexedDB..."
            );
          }
          const loadResult = await dynamicService.loadUserFormData(
            "complete-form"
          );

          if (loadResult.success && loadResult.formData) {
            formDataToLoad = loadResult.formData;
            if (isDebugMode) {
              console.log(
                "✅ SF86FormContext: Form data loaded successfully from IndexedDB"
              );
              console.log(
                `📊 Load stats: ${loadResult.size} bytes, ${Object.keys(formDataToLoad).length
                } sections`
              );
              console.log(
                `📋 Active sections: ${Object.keys(formDataToLoad).filter(
                  (k) =>
                    formDataToLoad[k as keyof ApplicantFormValues] !== undefined
                )}`
              );
            }
          } else {
            // Use default data if nothing is found
            formDataToLoad = DEFAULT_FORM_DATA;
            if (isDebugMode) {
              console.log(
                "📭 SF86FormContext: No saved data found, using default form data"
              );
            }
          }
        }

        // Set the form data first
        setFormData(cloneDeep(formDataToLoad));
        setInitialFormData(cloneDeep(formDataToLoad));

        if (isDebugMode) {
          console.log(
            "📤 SF86FormContext: Form data set in context, sections:",
            Object.keys(formDataToLoad)
          );
        }

        // Load completed sections metadata
        try {
          const metadataResult = await dynamicService.loadUserFormData(
            "completed-sections"
          );
          if (metadataResult.success && metadataResult.formData) {
            const completedSections =
              (metadataResult.formData as any).completedSections || [];
            setCompletedSections(completedSections);
            if (isDebugMode) {
              console.log(
                "📋 SF86FormContext: Completed sections loaded:",
                completedSections
              );
            }
          }
        } catch (error) {
          console.warn(
            "⚠️ SF86FormContext: Failed to load completed sections metadata:",
            error
          );
        }

        // Wait a brief moment for sections to potentially register, then emit load event
        setTimeout(() => {
          integration.emitEvent({
            type: "DATA_SYNC",
            sectionId: "global",
            payload: {
              action: "loaded",
              formData: formDataToLoad,
              method: "indexeddb",
              timestamp: new Date(),
            },
          });

          // Also emit a specific event to notify sections to update their local state
          integration.emitEvent({
            type: "SECTION_UPDATE",
            sectionId: "global",
            payload: {
              action: "data_synchronized",
              formData: formDataToLoad,
              source: "indexeddb",
            },
          });

          if (isDebugMode) {
            console.log(
              "📡 SF86FormContext: Load events emitted to all sections"
            );
          }
        }, 100);
      } catch (error) {
        console.error("❌ SF86FormContext: Failed to load form data:", error);
        // Use default data on error
        const defaultData = cloneDeep(DEFAULT_FORM_DATA);
        setFormData(defaultData);
        setInitialFormData(defaultData);

        // Emit error event
        integration.emitEvent({
          type: "DATA_SYNC",
          sectionId: "global",
          payload: {
            action: "load_failed",
            error: String(error),
            method: "indexeddb",
          },
        });
      }
    },
    [integration, dynamicService]
  );

  /**
   * Reset form to default state
   */
  const resetForm = useCallback(() => {
    setFormData(cloneDeep(DEFAULT_FORM_DATA));
    setInitialFormData(cloneDeep(DEFAULT_FORM_DATA));
    setCompletedSections([]);
    setErrors([]);
    setLastSaved(null);

    // Clear localStorage
    localStorage.removeItem("sf86-form-data");
    localStorage.removeItem("sf86-form-completed-sections");

    // Emit reset event
    integration.emitEvent({
      type: "SECTION_UPDATE",
      sectionId: "global",
      payload: { action: "reset" },
    });
  }, [integration]);

  /**
   * Export form data - collects data from all registered section contexts
   */
  const exportForm = useCallback((): ApplicantFormValues => {
    // Use collectAllSectionData to get the most up-to-date data from all section contexts
    return collectAllSectionData();
  }, [collectAllSectionData]);

  // ============================================================================
  // NAVIGATION OPERATIONS
  // ============================================================================

  /**
   * Navigate to a specific section
   */
  const navigateToSection = useCallback(
    (sectionId: string) => {
      integration.emitEvent({
        type: "NAVIGATION_REQUEST",
        sectionId,
        payload: { action: "navigate" },
      });
    },
    [integration]
  );

  /**
   * Get next incomplete section
   */
  const getNextIncompleteSection = useCallback((): string | null => {
    const allSectionIds = registeredSections.map((r) => r.sectionId);
    const incompleteSections = allSectionIds.filter(
      (id) => !completedSections.includes(id)
    );
    return incompleteSections.length > 0 ? incompleteSections[0] : null;
  }, [registeredSections, completedSections]);

  /**
   * Get previous section
   */
  const getPreviousSection = useCallback(
    (currentSectionId: string): string | null => {
      const allSectionIds = registeredSections.map((r) => r.sectionId);
      const currentIndex = allSectionIds.indexOf(currentSectionId);
      return currentIndex > 0 ? allSectionIds[currentIndex - 1] : null;
    },
    [registeredSections]
  );

  /**
   * Get next section
   */
  const getNextSection = useCallback(
    (currentSectionId: string): string | null => {
      const allSectionIds = registeredSections.map((r) => r.sectionId);
      const currentIndex = allSectionIds.indexOf(currentSectionId);
      return currentIndex < allSectionIds.length - 1
        ? allSectionIds[currentIndex + 1]
        : null;
    },
    [registeredSections]
  );

  // ============================================================================
  // CHANGE TRACKING OPERATIONS
  // ============================================================================

  /**
   * Get all changes made to the form
   */
  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Compare current data with initial data
    const compareObjects = (current: any, initial: any, path: string = "") => {
      if (typeof current !== typeof initial) {
        changes[path] = {
          oldValue: initial,
          newValue: current,
          timestamp: new Date(),
        };
        return;
      }

      if (typeof current === "object" && current !== null) {
        Object.keys(current).forEach((key) => {
          const newPath = path ? `${path}.${key}` : key;
          compareObjects(current[key], initial?.[key], newPath);
        });
      } else if (current !== initial) {
        changes[path] = {
          oldValue: initial,
          newValue: current,
          timestamp: new Date(),
        };
      }
    };

    compareObjects(formData, initialFormData);
    return changes;
  }, [formData, initialFormData]);

  /**
   * Check if form has unsaved changes
   */
  const hasUnsavedChanges = useCallback((): boolean => {
    return isDirty;
  }, [isDirty]);

  /**
   * Mark section as complete
   */
  const markSectionComplete = useCallback((sectionId: string) => {
    setCompletedSections((prev) => {
      if (!prev.includes(sectionId)) {
        return [...prev, sectionId];
      }
      return prev;
    });
  }, []);

  /**
   * Mark section as incomplete
   */
  const markSectionIncomplete = useCallback((sectionId: string) => {
    setCompletedSections((prev) => prev.filter((id) => id !== sectionId));
  }, []);

  // ============================================================================
  // DEPENDENCY MANAGEMENT
  // ============================================================================

  /**
   * Check dependencies for a section
   */
  const checkDependencies = useCallback((sectionId: string): string[] => {
    // This would be implemented based on specific section dependencies
    // For now, return empty array
    // TODO: Implement actual dependency checking logic
    console.debug(`Checking dependencies for section: ${sectionId}`);
    return [];
  }, []);

  /**
   * Resolve dependency between sections
   */
  const resolveDependency = useCallback(
    (dependentSection: string, requiredSection: string) => {
      // Implementation for resolving cross-section dependencies
      integration.emitEvent({
        type: "SECTION_UPDATE",
        sectionId: dependentSection,
        payload: {
          action: "dependency_resolved",
          requiredSection,
        },
      });
    },
    [integration]
  );

  // ============================================================================
  // CRUD OPERATIONS FOR SECTIONS
  // ============================================================================

  /**
   * Create a new entry in a section
   */
  const createSectionEntry = useCallback(
    (sectionId: string, entryData: any) => {
      setFormData((prevData) => {
        const newData = cloneDeep(prevData);
        const sectionData = get(newData, sectionId) || {};

        // Handle different section structures
        if (sectionData.entries && Array.isArray(sectionData.entries)) {
          sectionData.entries.push(entryData);
        } else {
          // Initialize entries array if it doesn't exist
          sectionData.entries = [entryData];
        }

        set(newData, sectionId, sectionData);

        // Emit entry creation event
        integration.emitEvent({
          type: "SECTION_UPDATE",
          sectionId,
          payload: { action: "entry_created", entryData },
        });

        return newData;
      });
    },
    [integration]
  );

  /**
   * Update an existing entry in a section
   */
  const updateSectionEntry = useCallback(
    (sectionId: string, entryIndex: number, entryData: any) => {
      setFormData((prevData) => {
        const newData = cloneDeep(prevData);
        const sectionData = get(newData, sectionId);

        if (
          sectionData?.entries &&
          Array.isArray(sectionData.entries) &&
          entryIndex >= 0 &&
          entryIndex < sectionData.entries.length
        ) {
          sectionData.entries[entryIndex] = entryData;
          set(newData, sectionId, sectionData);

          // Emit entry update event
          integration.emitEvent({
            type: "SECTION_UPDATE",
            sectionId,
            payload: { action: "entry_updated", entryIndex, entryData },
          });
        }

        return newData;
      });
    },
    [integration]
  );

  /**
   * Delete an entry from a section
   */
  const deleteSectionEntry = useCallback(
    (sectionId: string, entryIndex: number) => {
      setFormData((prevData) => {
        const newData = cloneDeep(prevData);
        const sectionData = get(newData, sectionId);

        if (
          sectionData?.entries &&
          Array.isArray(sectionData.entries) &&
          entryIndex >= 0 &&
          entryIndex < sectionData.entries.length
        ) {
          const deletedEntry = sectionData.entries.splice(entryIndex, 1)[0];
          set(newData, sectionId, sectionData);

          // Emit entry deletion event
          integration.emitEvent({
            type: "SECTION_UPDATE",
            sectionId,
            payload: { action: "entry_deleted", entryIndex, deletedEntry },
          });
        }

        return newData;
      });
    },
    [integration]
  );

  /**
   * Get all entries from a section
   */
  const getSectionEntries = useCallback(
    (sectionId: string): any[] => {
      const sectionData = get(formData, sectionId);
      return sectionData?.entries || [];
    },
    [formData]
  );

  /**
   * Initialize a section with default data
   */
  const initializeSection = useCallback(
    (sectionId: string, defaultData?: any) => {
      setFormData((prevData) => {
        const newData = cloneDeep(prevData);

        if (!get(newData, sectionId)) {
          set(newData, sectionId, defaultData || { entries: [] });

          // Emit section initialization event
          integration.emitEvent({
            type: "SECTION_UPDATE",
            sectionId,
            payload: { action: "section_initialized", defaultData },
          });
        }

        return newData;
      });
    },
    [integration]
  );

  /**
   * Clear all data from a section
   */
  const clearSection = useCallback(
    (sectionId: string) => {
      setFormData((prevData) => {
        const newData = cloneDeep(prevData);
        set(newData, sectionId, undefined);

        // Emit section clear event
        integration.emitEvent({
          type: "SECTION_UPDATE",
          sectionId,
          payload: { action: "section_cleared" },
        });

        return newData;
      });
    },
    [integration]
  );

  /**
   * Duplicate an entry in a section
   */
  const duplicateEntry = useCallback(
    (sectionId: string, entryIndex: number) => {
      setFormData((prevData) => {
        const newData = cloneDeep(prevData);
        const sectionData = get(newData, sectionId);

        if (
          sectionData?.entries &&
          Array.isArray(sectionData.entries) &&
          entryIndex >= 0 &&
          entryIndex < sectionData.entries.length
        ) {
          const entryToDuplicate = cloneDeep(sectionData.entries[entryIndex]);
          sectionData.entries.splice(entryIndex + 1, 0, entryToDuplicate);
          set(newData, sectionId, sectionData);

          // Emit entry duplication event
          integration.emitEvent({
            type: "SECTION_UPDATE",
            sectionId,
            payload: {
              action: "entry_duplicated",
              entryIndex,
              duplicatedEntry: entryToDuplicate,
            },
          });
        }

        return newData;
      });
    },
    [integration]
  );

  /**
   * Move an entry within a section
   */
  const moveEntry = useCallback(
    (sectionId: string, fromIndex: number, toIndex: number) => {
      setFormData((prevData) => {
        const newData = cloneDeep(prevData);
        const sectionData = get(newData, sectionId);

        if (
          sectionData?.entries &&
          Array.isArray(sectionData.entries) &&
          fromIndex >= 0 &&
          fromIndex < sectionData.entries.length &&
          toIndex >= 0 &&
          toIndex < sectionData.entries.length
        ) {
          const [movedEntry] = sectionData.entries.splice(fromIndex, 1);
          sectionData.entries.splice(toIndex, 0, movedEntry);
          set(newData, sectionId, sectionData);

          // Emit entry move event
          integration.emitEvent({
            type: "SECTION_UPDATE",
            sectionId,
            payload: { action: "entry_moved", fromIndex, toIndex, movedEntry },
          });
        }

        return newData;
      });
    },
    [integration]
  );

  /**
   * Bulk update multiple sections
   */
  const bulkUpdateSections = useCallback(
    (updates: Record<string, any>) => {
      setFormData((prevData) => {
        const newData = cloneDeep(prevData);

        Object.entries(updates).forEach(([sectionId, sectionData]) => {
          set(newData, sectionId, sectionData);
        });

        // Emit bulk update event
        integration.emitEvent({
          type: "SECTION_UPDATE",
          sectionId: "global",
          payload: { action: "bulk_update", updates },
        });

        return newData;
      });
    },
    [integration]
  );

  /**
   * Bulk validate multiple sections
   */
  const bulkValidateSections = useCallback(
    (sectionIds: string[]): ValidationResult => {
      const allErrors: ValidationError[] = [];
      const allWarnings: ValidationError[] = [];

      sectionIds.forEach((sectionId) => {
        const sectionResult = validateSection(sectionId);
        allErrors.push(...sectionResult.errors);
        allWarnings.push(...sectionResult.warnings);
      });

      return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
      };
    },
    [validateSection]
  );

  // ============================================================================
  // PDF INTEGRATION OPERATIONS
  // ============================================================================

  /**
   * Generate a filled PDF from current form data (client-side only for privacy)
   */
  const generatePdf = useCallback(async (): Promise<{
    success: boolean;
    pdfBytes?: Uint8Array;
    errors: string[];
    fieldsMapped?: number;
    fieldsApplied?: number;
  }> => {
    // TEMPORARY: Force debug mode for PDF generation investigation
    const isDebugMode = true; // typeof window !== 'undefined' && window.location.search.includes('debug=true');

    try {
      if (isDebugMode) {
        console.log("\n🚀 ===== PDF GENERATION START =====");
        console.log("📄 Generating PDF from form data (client-side only)...");
        console.log("🔍 Registered sections count:", registeredSections.length);
        console.log(
          "🔍 Registered section IDs:",
          registeredSections.map((r) => r.sectionId)
        );
      }

      // Collect data from all section contexts before generating PDF
      if (isDebugMode) {
        console.log("🔍 Collecting form data from all sections...");
      }
      const completeFormData = collectAllSectionData();

      if (isDebugMode) {
        console.log("\n📊 ===== FORM DATA FOR PDF GENERATION =====");
        console.log("📋 Form data sections:", Object.keys(completeFormData));
        console.log(
          "📈 Total sections: ",
          Object.keys(completeFormData).length
        );
        console.log(
          "🔍 Complete form data structure:",
          JSON.stringify(completeFormData, null, 2)
        );
        console.log(
          "📄 Starting enhanced form value mapping with form data sections:",
          Object.keys(completeFormData)
        );
      }

      // Use client-side PDF generation for privacy and security
      if (isDebugMode) {
        console.log("🔧 Calling PDF service to generate filled PDF...");
      }
      const result = await clientPdfService2.generateFilledPdf(
        completeFormData
      );

      if (result.success && result.pdfBytes) {
        if (isDebugMode) {
          console.log(
            `PDF generated successfully. Fields mapped: ${result.fieldsMapped}, Fields applied: ${result.fieldsApplied}`
          );
        }

        // Emit PDF generation event
        integration.emitEvent({
          type: "SECTION_UPDATE",
          sectionId: "global",
          payload: {
            action: "pdf_generated",
            fieldsMapped: result.fieldsMapped,
            fieldsApplied: result.fieldsApplied,
            errors: result.errors,
            warnings: result.warnings,
            method: "client",
            size: result.pdfBytes.length,
          },
        });

        return {
          success: true,
          pdfBytes: result.pdfBytes,
          errors: result.errors,
          fieldsMapped: result.fieldsMapped,
          fieldsApplied: result.fieldsApplied,
        };
      } else {
        return {
          success: false,
          errors: result.errors,
        };
      }
    } catch (error) {
      const errorMessage = `PDF generation failed: ${error}`;
      console.error(errorMessage);
      return {
        success: false,
        errors: [errorMessage],
      };
    }
  }, [collectAllSectionData, integration]);

  /**
   * Generate and download a filled PDF
   */
  const downloadPdf = useCallback(
    async (
      filename = "SF86-filled.pdf"
    ): Promise<{ success: boolean; errors: string[] }> => {
      const isDebugMode =
        typeof window !== "undefined" &&
        window.location.search.includes("debug=true");

      try {
        if (isDebugMode) {
          console.log(
            `Downloading PDF as: ${filename} (client-side only for privacy)`
          );
        }

        // Use client-side generation and download for privacy and security
        const result = await generatePdf();

        if (result.success && result.pdfBytes) {
          clientPdfService2.downloadPdf(result.pdfBytes, filename);

          // Emit download event
          integration.emitEvent({
            type: "SECTION_UPDATE",
            sectionId: "global",
            payload: {
              action: "pdf_downloaded",
              filename,
              method: "client",
              fieldsMapped: result.fieldsMapped,
              fieldsApplied: result.fieldsApplied,
            },
          });

          if (isDebugMode) {
            console.log(
              `PDF downloaded successfully: ${filename}. Fields applied: ${result.fieldsApplied}`
            );
          }
          return { success: true, errors: [] };
        } else {
          return { success: false, errors: result.errors };
        }
      } catch (error) {
        const errorMessage = `PDF download failed: ${error}`;
        console.error(errorMessage);
        return { success: false, errors: [errorMessage] };
      }
    },
    [generatePdf, integration]
  );

  /**
   * Validate PDF field mapping accuracy
   */
  const validatePdfMapping = useCallback(async (): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> => {
    try {
      const validationResults = await clientPdfService2.validateFieldMapping(
        formData
      );
      const stats = clientPdfService2.getFieldMappingStats();

      const errors: string[] = [];
      const warnings: string[] = [];

      // Check for validation issues
      const invalidFields = validationResults.filter((r) => !r.isValid);
      if (invalidFields.length > 0) {
        errors.push(`${invalidFields.length} fields failed validation`);
        invalidFields.forEach((field) => {
          errors.push(
            `Field ${field.fieldName} (${field.fieldId}): expected ${field.expectedValue}, got ${field.actualValue}`
          );
        });
      }

      // Check mapping coverage
      if (stats.unmappedFields > 0) {
        warnings.push(
          `${stats.unmappedFields} PDF fields are not mapped to form data`
        );
      }

      const isValid = errors.length === 0;
      const isDebugMode =
        typeof window !== "undefined" &&
        window.location.search.includes("debug=true");

      if (isDebugMode) {
        console.log(
          `PDF mapping validation: ${isValid ? "PASSED" : "FAILED"}. Mapped: ${stats.mappedFields
          }/${stats.totalFields}`
        );
      }

      return {
        isValid,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`PDF mapping validation failed: ${error}`],
        warnings: [],
      };
    }
  }, [formData]);

  /**
   * Get PDF field mapping statistics
   */
  const getPdfFieldStats = useCallback(() => {
    return clientPdfService2.getFieldMappingStats();
  }, []);

  /**
   * Diagnose PDF field mapping issues for troubleshooting
   * @param sectionName Optional section name to focus analysis
   */
  const diagnosePdfFieldMapping = useCallback(
    async (sectionName?: string): Promise<any> => {
      const isDebugMode =
        typeof window !== "undefined" &&
        window.location.search.includes("debug=true");

      try {
        if (isDebugMode) {
          console.log(`\n🔍 ===== PDF FIELD MAPPING DIAGNOSIS =====`);
        }

        // Collect all form data
        const completeFormData = collectAllSectionData();

        if (sectionName) {
          if (isDebugMode) {
            console.log(
              `🔍 Analyzing field mapping for section: ${sectionName}`
            );
          }

          // Use the debug utility from clientPdfService2
          const analysis = await clientPdfService2.debugSectionFieldMapping(
            sectionName,
            completeFormData
          );

          // Log summary of results
          const matchCount = analysis.mappingResults.filter(
            (r) => r.anyMatch
          ).length;
          const totalFields = analysis.mappingResults.length;
          const matchRate = totalFields
            ? ((matchCount / totalFields) * 100).toFixed(1)
            : "0";

          if (isDebugMode) {
            console.log(`\n📊 ===== SECTION MAPPING ANALYSIS =====`);
            console.log(`📋 Section: ${sectionName}`);
            console.log(`🔢 Total fields: ${totalFields}`);
            console.log(
              `✅ Fields with matches: ${matchCount} (${matchRate}%)`
            );
            console.log(
              `❌ Fields without matches: ${totalFields - matchCount}`
            );
          }

          // Show breakdown by match type
          const matchTypes = {
            directMatch: 0,
            nameMatch: 0,
            enhancedMatch: 0,
            partMatch: 0,
          };

          analysis.mappingResults.forEach((result) => {
            if (result.directMatch?.found) matchTypes.directMatch++;
            if (result.nameMatch?.found) matchTypes.nameMatch++;
            if (result.enhancedMatch?.found) matchTypes.enhancedMatch++;
            if (result.partMatch?.found) matchTypes.partMatch++;
          });

          if (isDebugMode) {
            console.log(`\n🔍 Match types breakdown:`);
            console.log(`- Direct ID matches: ${matchTypes.directMatch}`);
            console.log(`- Name-to-ID matches: ${matchTypes.nameMatch}`);
            console.log(`- Enhanced map matches: ${matchTypes.enhancedMatch}`);
            console.log(`- Part/fragment matches: ${matchTypes.partMatch}`);
          }

          // Show sample of unmatched fields for debugging
          const unmatchedFields = analysis.mappingResults
            .filter((r) => !r.anyMatch)
            .slice(0, 10)
            .map((r) => ({ id: r.fieldId, value: r.fieldValue }));

          if (unmatchedFields.length > 0 && isDebugMode) {
            console.log(`\n❌ Sample of unmatched fields:`);
            unmatchedFields.forEach((f, i) => {
              console.log(`  [${i + 1}] ID: "${f.id}" Value: "${f.value}"`);
            });
          }

          return analysis;
        } else {
          // Analyze all sections
          if (isDebugMode) {
            console.log(`🔍 Analyzing field mapping for all sections`);
          }

          const allSections = Object.keys(completeFormData);
          const results: Record<string, any> = {};

          for (const section of allSections) {
            results[section] = await clientPdfService2.debugSectionFieldMapping(
              section,
              completeFormData
            );
          }

          // Aggregate statistics
          let totalFields = 0;
          let matchedFields = 0;

          Object.values(results).forEach((analysis: any) => {
            totalFields += analysis.mappingResults.length;
            matchedFields += analysis.mappingResults.filter(
              (r: any) => r.anyMatch
            ).length;
          });

          const matchRate = totalFields
            ? ((matchedFields / totalFields) * 100).toFixed(1)
            : "0";

          if (isDebugMode) {
            console.log(`\n📊 ===== OVERALL MAPPING ANALYSIS =====`);
            console.log(`📋 Total sections analyzed: ${allSections.length}`);
            console.log(`🔢 Total fields: ${totalFields}`);
            console.log(
              `✅ Fields with matches: ${matchedFields} (${matchRate}%)`
            );
            console.log(
              `❌ Fields without matches: ${totalFields - matchedFields}`
            );
          }

          return results;
        }
      } catch (error) {
        console.error("Error analyzing PDF field mapping:", error);
        return { error: String(error) };
      }
    },
    [collectAllSectionData]
  );

  // ============================================================================
  // INITIALIZATION AND AUTO-SAVE FUNCTIONALITY
  // ============================================================================

  /**
   * Initialize form data on component mount
   */
  useEffect(() => {
    const initializeFormData = async () => {
      const isDebugMode =
        typeof window !== "undefined" &&
        window.location.search.includes("debug=true");

      if (isDebugMode) {
        console.log("Initializing SF86 Form Context...");
      }
      try {
        await loadForm(); // Load saved data if available
      } catch (error) {
        console.error("Failed to initialize form data:", error);
      }
    };

    initializeFormData();
  }, []); // Only run once on mount

  /**
   * Distribute loaded data to section contexts
   */
  const distributeDataToSections = useCallback(
    (formDataToDistribute: ApplicantFormValues) => {
      const isDebugMode =
        typeof window !== "undefined" &&
        window.location.search.includes("debug=true");

      if (isDebugMode) {
        console.log(
          "🔄 SF86FormContext: Distributing data to section contexts..."
        );
      }

      // Emit individual section data updates
      Object.keys(formDataToDistribute).forEach((sectionKey) => {
        const sectionData =
          formDataToDistribute[sectionKey as keyof ApplicantFormValues];
        if (sectionData) {
          integration.emitEvent({
            type: "SECTION_UPDATE",
            sectionId: sectionKey,
            payload: {
              action: "data_loaded",
              data: sectionData,
              source: "global_context",
            },
          });

          if (isDebugMode) {
            console.log(
              `📤 SF86FormContext: Distributed data to ${sectionKey}`
            );
          }
        }
      });
    },
    [integration]
  );

  /**
   * Enhanced auto-save when form data changes (with debouncing and proper state tracking)
   */
  useEffect(() => {
    const isDebugMode =
      typeof window !== "undefined" &&
      window.location.search.includes("debug=true");

    if (autoSave && isDirty && registeredSections.length > 0) {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      if (isDebugMode) {
        console.log("⏱️ SF86FormContext: Auto-save timer set (5 seconds)");
      }

      // Set new timer for auto-save (5 seconds after last change)
      autoSaveTimerRef.current = setTimeout(() => {
        if (isDebugMode) {
          console.log("🚀 SF86FormContext: Auto-save triggered");
        }
        saveForm().catch((error) => {
          console.error("❌ SF86FormContext: Auto-save failed:", error);
        });
      }, 5000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [isDirty, autoSave, registeredSections.length]); // Include registeredSections.length to ensure sections are ready

  /**
   * Handle section data synchronization when sections register
   */
  useEffect(() => {
    const isDebugMode =
      typeof window !== "undefined" &&
      window.location.search.includes("debug=true");

    // When new sections register, distribute existing data to them
    if (
      registeredSections.length > 0 &&
      Object.keys(formData).some(
        (key) => formData[key as keyof ApplicantFormValues] !== undefined
      )
    ) {
      if (isDebugMode) {
        console.log(
          "🔄 SF86FormContext: New sections registered, distributing existing data..."
        );
        console.log(`📊 Registered sections: ${registeredSections.length}`);
        console.log(
          `📋 Available data sections: ${Object.keys(formData).filter(
            (k) => formData[k as keyof ApplicantFormValues] !== undefined
          )}`
        );
      }

      // Use a small delay to ensure section contexts are fully initialized
      const timeoutId = setTimeout(() => {
        distributeDataToSections(formData);
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [registeredSections.length, distributeDataToSections]); // Trigger when sections register

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: SF86FormContextType = {
    // Global State
    formData,
    isDirty,
    isValid,
    isLoading,
    errors,

    // Section Management
    registeredSections,
    activeSections,
    completedSections,

    // Global Operations
    updateFormData,
    updateSectionData,
    getSectionData,
    validateForm,
    validateSection,
    saveForm,
    loadForm,
    resetForm,
    exportForm,

    // Navigation
    navigateToSection,
    getNextIncompleteSection,
    getPreviousSection,
    getNextSection,

    // Change Tracking
    getChanges,
    hasUnsavedChanges,
    markSectionComplete,
    markSectionIncomplete,

    // Data Persistence
    autoSave,
    setAutoSave,
    lastSaved,

    // Cross-Section Dependencies
    checkDependencies,
    resolveDependency,

    // CRUD Operations for Sections
    createSectionEntry,
    updateSectionEntry,
    deleteSectionEntry,
    getSectionEntries,

    // Section-specific operations
    initializeSection,
    clearSection,
    duplicateEntry,
    moveEntry,

    // Bulk operations
    bulkUpdateSections,
    bulkValidateSections,

    // PDF Integration
    generatePdf,
    downloadPdf,
    validatePdfMapping,
    getPdfFieldStats,

    // New utility function
    diagnosePdfFieldMapping,
  };

  return (
    <SF86FormContext.Provider value={contextValue}>
      {children}
    </SF86FormContext.Provider>
  );
};

/**
 * Hook to use SF86FormContext
 */
export const useSF86Form = (): SF86FormContextType => {
  const context = useContext(SF86FormContext);
  if (!context) {
    throw new Error("useSF86Form must be used within an SF86FormProvider");
  }
  return context;
};

/**
 * Complete SF86 Form Provider with Section Integration
 * This wraps both the section integration and the main form context
 * and includes all section providers to avoid "must be used within" errors
 *
 * This is the SINGLE provider that should be used in applications to avoid
 * redundant provider nesting. It includes all implemented sections.
 *
 * Usage: Simply wrap your app with <CompleteSF86FormProvider> instead of
 * manually nesting all individual section providers.
 *
 * Now includes ALL implemented sections: Section1, Section2, Section3, Section4, Section5, Section6, Section7, Section8, Section9, Section10, Section12, Section14, Section16, Section18, Section20, Section21, Section22, Section23, Section24, Section25, Section26, Section27, Section28, Section29, Section30
 */
export const CompleteSF86FormProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <SectionIntegrationProvider>
      <SF86FormProvider>
        <Section1Provider>
          <Section2Provider>
            <Section3Provider>
              <Section4Provider>
                <Section5Provider>
                  <Section6Provider>
                    <Section7Provider>
                      <Section8Provider>
                        <Section9Provider>
                          <Section10Provider>
                            <Section11Provider>
                              <Section12Provider>
                                {/* TEMPORARILY DISABLED: Section13Provider causing performance issues */}
                                <Section13Provider>
                                  <Section14Provider>
                                    <Section15Provider>
                                      <Section16Provider>
                                        <Section17Provider>
                                          <Section18Provider>
                                    {/*   <Section19Provider>
                                        <Section20Provider>
                                          <Section21Provider>
                                            <Section22Provider>
                                              <Section23Provider>
                                                <Section24Provider>
                                                  <Section25Provider>
                                                    <Section26Provider>
                                                      <Section27Provider> */}
                                          <Section28Provider>
                                            <Section29Provider>
                                              <Section30Provider>{children}</Section30Provider>
                                            </Section29Provider>
                                          </Section28Provider>
                                          {/* </Section27Provider>
                                                    </Section26Provider>
                                                  </Section25Provider>
                                                </Section24Provider>
                                              </Section23Provider>
                                            </Section22Provider>
                                          </Section21Provider>
                                        </Section20Provider>
                                      </Section19Provider>*/}
                                    </Section18Provider> 
                                        </Section17Provider>
                                      </Section16Provider>
                                    </Section15Provider>
                                  </Section14Provider>
                                </Section13Provider>
                              </Section12Provider>
                            </Section11Provider>
                          </Section10Provider>
                        </Section9Provider>
                      </Section8Provider>
                    </Section7Provider>
                  </Section6Provider>
                </Section5Provider>
              </Section4Provider>
            </Section3Provider>
          </Section2Provider>
        </Section1Provider>
      </SF86FormProvider>
    </SectionIntegrationProvider>
  );
};
