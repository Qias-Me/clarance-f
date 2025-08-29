/**
 * Simplified SF86FormContext for SF-86 Form Architecture
 *
 * This is the central aggregation and submission point that manages global form state
 * across all 30 sections. Individual section contexts handle their own complex operations,
 * local state management, and validation. This context focuses solely on:
 * - Aggregating data from all sections
 * - Providing submission mechanism for final form submission
 * - Handling PDF generation and data persistence
 * - Maintaining clean separation of concerns
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { cloneDeep, set } from "lodash";
import type { ApplicantFormValues } from "../../../../api/interfaces/formDefinition2.0";
import { clientPdfService2 } from "../../../../api/service/clientPdfService2.0";
import DynamicService from "../../../../api/service/dynamicService";
import Section1Provider from "./section1";
import Section2Provider from "./section2";
import Section3Provider from "./section3";
import Section4Provider from "./section4";
import Section5Provider from "./section5";
import Section6Provider from "./section6";
import Section7Provider from "./section7";
import Section8Provider from "./section8";
import Section9Provider from "./section9";
import Section10Provider from "./section10";
import Section11Provider from "./section11";
import Section12Provider from "./section12";
import Section13Provider from "./section13";
import Section14Provider from "./section14";
import Section15Provider from "./section15";
import Section27Provider from "./section27";
import Section28Provider from "./section28";
import Section29Provider from "./section29";
import Section30Provider from "./section30";

// ============================================================================
// SIMPLIFIED SF86 FORM CONTEXT INTERFACE
// ============================================================================

/**
 * Simplified SF86FormContext interface
 * Focuses on core aggregation and submission functionality
 * Individual section contexts handle their own complex operations
 */
export interface SF86FormContextType {
  // Core State
  formData: ApplicantFormValues;
  isDirty: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
  completedSections: Set<string>;

  // Core Operations
  updateSectionData: (sectionId: string, data: any) => void;
  saveForm: (dataToSave?: ApplicantFormValues) => Promise<void>;
  loadForm: (data?: ApplicantFormValues) => Promise<void>;
  resetForm: () => void;
  exportForm: () => ApplicantFormValues;
  markSectionComplete: (sectionId: string) => void;

  // PDF Integration
  generatePdf: () => Promise<{
    success: boolean;
    pdfBytes?: Uint8Array;
    errors: string[];
    fieldsMapped?: number;
    fieldsApplied?: number;
  }>;
  downloadPdf: (
    filename?: string,
    alsoDownloadJson?: boolean
  ) => Promise<{ success: boolean; errors: string[] }>;
  downloadJsonData: (
    filename?: string
  ) => { success: boolean; errors: string[] };
}



// ============================================================================
// SIMPLIFIED SF86 FORM CONTEXT IMPLEMENTATION
// ============================================================================

/**
 * SF86FormContext - Simplified central form coordinator
 */
const SF86FormContext = createContext<SF86FormContextType | null>(null);

/**
 * SF86FormProvider - Simplified central form state provider
 */
export const SF86FormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Core state - simplified to essentials only
  const [formData, setFormData] = useState<ApplicantFormValues>({
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
    section27: undefined,
    section28: undefined,
    section29: undefined,
    section30: undefined,
    print: undefined,
  });
  const [initialFormData, setInitialFormData] = useState<ApplicantFormValues>({
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
    section14: undefined,
    section15: undefined,
    section27: undefined,
    section28: undefined,
    section29: undefined,
    section30: undefined,
    print: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  // Data persistence service
  const dynamicService = useMemo(() => new DynamicService(), []);

  // Load completed sections from localStorage on initialization
  useEffect(() => {
    try {
      const savedCompletedSections = localStorage.getItem("sf86-form-completed-sections");
      if (savedCompletedSections) {
        const sectionsArray = JSON.parse(savedCompletedSections);
        if (Array.isArray(sectionsArray)) {
          setCompletedSections(new Set(sectionsArray));
        }
      }
    } catch (error) {
      console.warn("Failed to load completed sections from localStorage:", error);
    }
  }, []);



  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Check if form has unsaved changes
   */
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  // ============================================================================
  // CORE OPERATIONS
  // ============================================================================

  /**
   * Update specific section data - simplified version
   * Individual sections call this when they want to submit their data
   */
  const updateSectionData = useCallback((sectionId: string, data: any) => {
    const isDebugMode =
      typeof window !== "undefined" &&
      window.location.search.includes("debug=true");

    // Update section data for the given section ID

    setFormData((prevData) => {
      const newData = cloneDeep(prevData);
      set(newData, sectionId, data);

      // Section data updated successfully

      return newData;
    });
  }, []);

  /**
   * Save form data to persistence layer
   * @param dataToSave - Optional form data to save. If not provided, uses current formData state
   */
  const saveForm = useCallback(async (dataToSave?: ApplicantFormValues): Promise<void> => {
    setIsLoading(true);
    const isDebugMode =
      typeof window !== "undefined" &&
      window.location.search.includes("debug=true");

    try {
      // Use provided data or current formData state
      const dataForSaving = dataToSave || formData;

      // Starting form save process
      const activeSections = Object.keys(dataForSaving).filter(k => dataForSaving[k as keyof ApplicantFormValues] !== undefined);

      // Save complete form data to IndexedDB
      const saveResult = await dynamicService.saveUserFormData(
        "complete-form",
        dataForSaving
      );

      if (!saveResult.success) {
        throw new Error(
          `Failed to save form data to IndexedDB: ${saveResult.message}`
        );
      }

      // Update initial data to mark as saved
      setInitialFormData(cloneDeep(dataForSaving));
      setLastSaved(saveResult.timestamp || new Date());

      // Form data saved successfully to IndexedDB
    } catch (error) {
      console.error("❌ SF86FormContext: Failed to save form:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [formData, dynamicService]);

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
          // Try to load from IndexedDB
          if (isDebugMode) {
            console.log("📂 SF86FormContext: Loading form data from IndexedDB...");
          }
          const loadResult = await dynamicService.loadUserFormData("complete-form");

          if (loadResult.success && loadResult.formData) {
            formDataToLoad = loadResult.formData;
            if (isDebugMode) {
              console.log("✅ SF86FormContext: Form data loaded successfully from IndexedDB");
            }
          } else {
            // Use default data if nothing is found
            formDataToLoad = {
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
              section14: undefined,
              section15: undefined,
              section27: undefined,
              section28: undefined,
              section29: undefined,
              section30: undefined,
              print: undefined,
            };
            if (isDebugMode) {
              console.log("📭 SF86FormContext: No saved data found, using default form data");
            }
          }
        }

        // Set the form data
        setFormData(cloneDeep(formDataToLoad));
        setInitialFormData(cloneDeep(formDataToLoad));

        if (isDebugMode) {
          console.log("📤 SF86FormContext: Form data set in context");
        }
      } catch (error) {
        console.error("❌ SF86FormContext: Failed to load form data:", error);
        // Use default data on error
        const defaultData = cloneDeep({
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
          section14: undefined,
          section15: undefined,
          section27: undefined,
          section28: undefined,
          section29: undefined,
          section30: undefined,
          print: undefined,
        });
        setFormData(defaultData);
        setInitialFormData(defaultData);
      }
    },
    [dynamicService]
  );

  // Load form data from IndexedDB on initialization
  useEffect(() => {
    const initializeFormData = async () => {
      const isDebugMode =
        typeof window !== "undefined" &&
        window.location.search.includes("debug=true");

      if (isDebugMode) {
        console.log("🔄 SF86FormContext: Initializing form data on mount...");
      }

      try {
        // Try to load from IndexedDB
        if (isDebugMode) {
          console.log("📂 SF86FormContext: Loading form data from IndexedDB...");
        }
        const loadResult = await dynamicService.loadUserFormData("complete-form");

        if (loadResult.success && loadResult.formData) {
          const formDataToLoad = loadResult.formData;
          if (isDebugMode) {
            console.log("✅ SF86FormContext: Form data loaded successfully from IndexedDB");
          }

          // Set the form data
          setFormData(cloneDeep(formDataToLoad));
          setInitialFormData(cloneDeep(formDataToLoad));
        } else {
          if (isDebugMode) {
            console.log("📭 SF86FormContext: No saved data found, using default form data");
          }
        }

        if (isDebugMode) {
          console.log("✅ SF86FormContext: Form data initialization complete");
        }
      } catch (error) {
        console.error("❌ SF86FormContext: Failed to initialize form data:", error);
      }
    };

    initializeFormData();
  }, [dynamicService]);

  /**
   * Reset form to default state
   */
  const resetForm = useCallback(() => {
    const defaultData = {
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
      section14: undefined,
      section15: undefined,
      section27: undefined,
      section28: undefined,
      section29: undefined,
      section30: undefined,
      print: undefined,
    };
    setFormData(cloneDeep(defaultData));
    setInitialFormData(cloneDeep(defaultData));
    setLastSaved(null);
    setCompletedSections(new Set());

    // Clear localStorage
    localStorage.removeItem("sf86-form-data");
    localStorage.removeItem("sf86-form-completed-sections");
  }, []);

  /**
   * Export form data for PDF generation or other purposes
   */
  const exportForm = useCallback((): ApplicantFormValues => {
    return cloneDeep(formData);
  }, [formData]);

  /**
   * Mark a section as complete
   */
  const markSectionComplete = useCallback((sectionId: string) => {
    const isDebugMode =
      typeof window !== "undefined" &&
      window.location.search.includes("debug=true");

    if (isDebugMode) {
      console.log(`✅ SF86FormContext: Marking section ${sectionId} as complete`);
    }

    setCompletedSections((prevCompleted) => {
      const newCompleted = new Set(prevCompleted);
      newCompleted.add(sectionId);

      // Also save to localStorage for persistence
      localStorage.setItem("sf86-form-completed-sections", JSON.stringify(Array.from(newCompleted)));

      return newCompleted;
    });
  }, []);

  // ============================================================================
  // PDF INTEGRATION
  // ============================================================================

  /**
   * Generate PDF from current form data
   */
  const generatePdf = useCallback(async () => {
    const isDebugMode =
      typeof window !== "undefined" &&
      window.location.search.includes("debug=true");

    try {
      if (isDebugMode) {
        console.log("🔄 SF86FormContext: Starting PDF generation...");
      }

      // Use current form data for PDF generation
      const result = await clientPdfService2.generateFilledPdf(formData);

      if (isDebugMode) {
        console.log("✅ SF86FormContext: PDF generation complete", {
          success: result.success,
          fieldsMapped: result.fieldsMapped,
          fieldsApplied: result.fieldsApplied,
        });
      }

      return result;
    } catch (error) {
      console.error("❌ SF86FormContext: PDF generation failed:", error);
      return {
        success: false,
        errors: [String(error)],
        fieldsMapped: 0,
        fieldsApplied: 0,
      };
    }
  }, [formData]);

  /**
   * Download PDF with optional JSON data
   */
  const downloadPdf = useCallback(
    async (filename?: string, alsoDownloadJson?: boolean) => {
      try {
        const pdfResult = await generatePdf();

        if (!pdfResult.success || !('pdfBytes' in pdfResult) || !pdfResult.pdfBytes) {
          return {
            success: false,
            errors: pdfResult.errors || ["Failed to generate PDF"],
          };
        }

        // Download PDF
        const pdfBlob = new Blob([pdfResult.pdfBytes], {
          type: "application/pdf",
        });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const pdfLink = document.createElement("a");
        pdfLink.href = pdfUrl;
        pdfLink.download = filename || `sf86-form-${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(pdfLink);
        pdfLink.click();
        document.body.removeChild(pdfLink);
        URL.revokeObjectURL(pdfUrl);

        // Optionally download JSON
        if (alsoDownloadJson) {
          downloadJsonData(filename?.replace(".pdf", ".json"));
        }

        return { success: true, errors: [] };
      } catch (error) {
        console.error("❌ SF86FormContext: PDF download failed:", error);
        return {
          success: false,
          errors: [String(error)],
        };
      }
    },
    [generatePdf]
  );

  /**
   * Download form data as JSON
   */
  const downloadJsonData = useCallback(
    (filename?: string) => {
      try {
        const jsonData = JSON.stringify(formData, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename || `sf86-form-data-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return { success: true, errors: [] };
      } catch (error) {
        console.error("❌ SF86FormContext: JSON download failed:", error);
        return {
          success: false,
          errors: [String(error)],
        };
      }
    },
    [formData]
  );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: SF86FormContextType = {
    // Core State
    formData,
    isDirty,
    isLoading,
    lastSaved,
    completedSections,

    // Core Operations
    updateSectionData,
    saveForm,
    loadForm,
    resetForm,
    exportForm,
    markSectionComplete,

    // PDF Integration
    generatePdf,
    downloadPdf,
    downloadJsonData,
  };

  return (
    <SF86FormContext.Provider value={contextValue}>
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
                              <Section13Provider>
                                <Section14Provider>
                                <Section15Provider>
                                  <Section27Provider>
                                    <Section28Provider>
                                      <Section29Provider>
                                        <Section30Provider>
                                          {children}
                                        </Section30Provider>
                                      </Section29Provider>
                                    </Section28Provider>
                                    </Section27Provider>
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
 * Complete SF86FormProvider - Alias for backward compatibility
 * This ensures existing imports continue to work
 */
export const CompleteSF86FormProvider = SF86FormProvider;
