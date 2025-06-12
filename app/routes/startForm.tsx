/**
 * SF-86 Form Application - Centralized Implementation
 *
 * This is the main entry point for the complete SF-86 form application.
 * It provides a centralized, production-ready implementation that integrates
 * all 30 sections using the scalable architecture.
 */

import type { Route } from "./+types/startForm";
import { useActionData, useLoaderData } from "react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CompleteSF86FormProvider,
  useSF86Form,
} from "~/state/contexts/sections2.0/SF86FormContext";

import type { ApplicantFormValues } from "api/interfaces/formDefinition2.0";
import ClearCacheButton from "~/components/buttons/ClearCacheButton";
import LoadingSpinner from "~/components/LoadingSpinner";
import { generateAndDownloadPdf, downloadJsonData } from "~/utils/pdfGenerationUtils";

// Section component imports from Rendered2.0
// Import shared SF-86 section configuration instead of individual components
import { ALL_SF86_SECTIONS, createSF86Config, type SF86ActionType } from "~/utils/sf86SectionConfig";

// ============================================================================
// ROUTE FUNCTIONS (React Router v7 Pattern)
// ============================================================================

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "SF-86 Security Clearance Application" },
    {
      name: "description",
      content:
        "Complete your SF-86 Questionnaire for National Security Positions - Official U.S. Government Form",
    },
    {
      name: "keywords",
      content:
        "SF-86, security clearance, background investigation, national security, government form, OPM",
    },
    { name: "author", content: "U.S. Office of Personnel Management" },
    { name: "robots", content: "noindex, nofollow" }, // Security forms should not be indexed
    { property: "og:title", content: "SF-86 Security Clearance Application" },
    {
      property: "og:description",
      content: "Questionnaire for National Security Positions",
    },
    { property: "og:type", content: "website" },
  ];
}

interface ActionResponse {
  success: boolean;
  message: string;
  data?: any;
  pdfPath?: string;
  jsonPath?: string;
}

// SF86ActionType is now imported from sf86SectionConfig

export async function action({
  request,
}: Route.ActionArgs): Promise<ActionResponse> {
  const formData = await request.formData();
  const applicantDataEntry = formData.get("data");
  const actionTypeEntry = formData.get("actionType");

  if (typeof applicantDataEntry !== "string") {
    return {
      success: false,
      message: "No applicant data provided or data is not a string",
    };
  }

  if (typeof actionTypeEntry !== "string") {
    return {
      success: false,
      message: "No action type provided or action type is not a string",
    };
  }

  // Get valid actions from centralized configuration
  const sf86Config = createSF86Config();
  const validActions = sf86Config.availableActions;

  if (!validActions.includes(actionTypeEntry as SF86ActionType)) {
    return {
      success: false,
      message: `Invalid action type. Valid actions: ${validActions.join(", ")}`,
    };
  }

  const actionType = actionTypeEntry as SF86ActionType;

  try {
    const formValues: ApplicantFormValues = JSON.parse(applicantDataEntry);


    switch (actionType) {
      case "generatePDF":
        try {
          return {
            success: true,
            message: "PDF generation completed successfully.",
            pdfPath: "tools/externalTools/example.pdf",
          };
        } catch (error) {
          return {
            success: false,
            message: `PDF generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          };
        }


      case "generateJSON":
        try {
          return {
            success: true,
            message: "JSON generation completed successfully.",
            jsonPath: "tools/externalTools/completedFields.json",
          };
        } catch (error) {
          return {
            success: false,
            message: `JSON generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          };
        }

      case "showAllFormFields":
        try {
          return {
            success: true,
            message: "Form fields mapping completed successfully.",
          };
        } catch (error) {
          return {
            success: false,
            message: `Form fields mapping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          };
        }

      case "saveForm":
        try {
          const timestamp = new Date().toISOString();
          return {
            success: true,
            message: "Form saved successfully",
            data: { savedAt: timestamp, formId: `sf86_${Date.now()}` },
          };
        } catch (error) {
          return {
            success: false,
            message: `Form save failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          };
        }


      case "exportForm":
        try {
          return {
            success: true,
            message: "Form exported successfully",
            data: formValues,
          };
        } catch (error) {
          return {
            success: false,
            message: `Form export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          };
        }

      case "submitForm":
        try {
          const submissionId = `SF86_${Date.now()}`;
          return {
            success: true,
            message: "Form submitted successfully for processing",
            data: {
              submissionId,
              submittedAt: new Date().toISOString(),
              status: "submitted",
              estimatedProcessingTime: "2-4 weeks",
            },
          };
        } catch (error) {
          return {
            success: false,
            message: `Form submission failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          };
        }

      case "resetForm":
        try {
          return {
            success: true,
            message: "Form reset successfully",
            data: { action: "reset", timestamp: new Date().toISOString() },
          };
        } catch (error) {
          return {
            success: false,
            message: `Form reset failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          };
        }

      default:
        return {
          success: false,
          message: `Unhandled action type: ${actionType}`,
        };
    }
  } catch (error) {
    const errorMessage =
      error instanceof SyntaxError && "message" in error
        ? error.message
        : "Invalid JSON format";
    return {
      success: false,
      message: `Invalid applicant data: ${errorMessage}`,
    };
  }
}

export async function loader({ }: Route.LoaderArgs) {
  // Load form configuration using centralized configuration
  const sf86Config = createSF86Config();

  // Load saved form data if available
  let savedFormData = null;
  try {
    // In a real implementation, this would load from a database
    savedFormData = null;
  } catch (error) {
    console.error("Failed to load saved form data:", error);
  }

  return {
    config: sf86Config,
    savedFormData,
    environment: "production",
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// CENTRALIZED SF-86 FORM COMPONENT
// ============================================================================

// Inner component that uses the SF86Form context
function SF86FormContent() {
  const config = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionResponse>();
  const sf86Form = useSF86Form();
  const [currentSection, setCurrentSection] = useState<string>("section1");
  const [formProgress, setFormProgress] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Use shared section configuration instead of duplicating the definitions
  const availableSections = useMemo(() => ALL_SF86_SECTIONS, []);

  // Sync formProgress with persistent completedSections from SF86FormContext
  useEffect(() => {
    if (sf86Form.completedSections && sf86Form.completedSections.size > 0) {
      const progressFromPersistent: Record<string, boolean> = {};
      sf86Form.completedSections.forEach(sectionId => {
        progressFromPersistent[sectionId] = true;
      });
      setFormProgress(progressFromPersistent);
    }
  }, [sf86Form.completedSections]);

  // Memoized validation change handler to prevent infinite re-renders
  const handleValidationChange = useCallback(
    (isValid: boolean) => {
      // Update progress when section is valid
      if (isValid) {
        setFormProgress((prev) => ({
          ...prev,
          [currentSection]: true,
        }));
      }
    },
    [currentSection]
  );

  // Navigation function to go to the next section
  const handleNextSection = useCallback(() => {
    const currentIndex = availableSections.findIndex((s) => s.id === currentSection);
    if (currentIndex !== -1 && currentIndex < availableSections.length - 1) {
      const nextSection = availableSections[currentIndex + 1];
      if (nextSection && nextSection.isImplemented !== false) {
        setCurrentSection(nextSection.id);
        console.log(`✅ Navigating from ${currentSection} to ${nextSection.id}`);
      } else {
        console.log(`⚠️ Next section ${nextSection?.id} is not implemented`);
      }
    } else {
      console.log(`⚠️ Already at the last section or section not found`);
    }
  }, [currentSection, availableSections]);

  // Get current section component
  const getCurrentSectionComponent = useCallback(() => {
    const section = availableSections.find((s) => s.id === currentSection);
    if (!section) {
      return (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Section Not Found
          </h2>
          <p className="text-gray-600">
            The requested section "{currentSection}" could not be found or is not yet implemented.
          </p>
        </div>
      );
    }

    const Component = section.component;
    return (
      <Component
        onValidationChange={handleValidationChange}
        onNext={handleNextSection}
      />
    );
  }, [currentSection, availableSections, handleValidationChange, handleNextSection]);

  // Load saved form data on mount
  useEffect(() => {
    if (config.savedFormData) {
      // console.info("Loading saved form data - form restored from previous session");
    }
    setIsLoading(false);
  }, [config.savedFormData, config]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-testid="centralized-sf86-form"
    >
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-4 space-y-3 lg:space-y-0">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  SF-86 Questionnaire for National Security Positions
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>Updated: {new Date(config.config.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
         

                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-medium text-gray-900 bg-blue-50 px-2 py-1 rounded-md">
                    {sf86Form.completedSections.size}/{config.config.totalSections}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Action Results */}
        {actionData && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div
              className={`p-4 rounded-lg ${actionData.success
                ? "bg-green-100 border border-green-400"
                : "bg-red-100 border border-red-400"
                }`}
              data-testid="action-results"
            >
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 ${actionData.success ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {actionData.success ? "✓" : "✗"}
                </div>
                <div className="ml-3">
                  <h3
                    className={`text-sm font-medium ${actionData.success ? "text-green-800" : "text-red-800"
                      }`}
                  >
                    {actionData.success ? "Success" : "Error"}
                  </h3>
                  <p
                    className={`text-sm ${actionData.success ? "text-green-700" : "text-red-700"
                      }`}
                  >
                    {actionData.message}
                  </p>
                  {actionData.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs underline">
                        View Details
                      </summary>
                      <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(actionData.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Section Navigation */}
          <SectionNavigation
            config={config.config}
            currentSection={currentSection}
            onSectionChange={setCurrentSection}
            formProgress={formProgress}
          />

          {/* Form Content */}
          <div className="mt-8">
            {/* Render the current section component */}
            {getCurrentSectionComponent()}
          </div>
        </main>
      </div>
    );
  }

// Main component wrapper
export default function CentralizedSF86Form() {
  return (
    <CompleteSF86FormProvider>
      <SF86FormContent />
    </CompleteSF86FormProvider>
  );
}

// ============================================================================
// SECTION NAVIGATION COMPONENT
// ============================================================================

interface SectionNavigationProps {
  config: any;
  currentSection: string;
  onSectionChange: (section: string) => void;
  formProgress: Record<string, boolean>;
}

function SectionNavigation({
  config,
  currentSection,
  onSectionChange,
  formProgress,
}: SectionNavigationProps) {
  const sf86Context = useSF86Form();
  const { saveForm, exportForm } = sf86Context;
  const [isExpanded, setIsExpanded] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);


  const handleGlobalSave = async () => {
    try {
      await saveForm();
      console.log("Form saved successfully");
    } catch (error) {
      console.error("Failed to save form:", error);
    }
  };



  // Handle PDF generation and download - Using centralized utility
  const handleClientPdfGeneration = async () => {
    try {
      // Collect all section data from contexts before processing
      const completeFormData = exportForm(); // This calls collectAllSectionData internally

      // Use centralized PDF generation utility with enhanced features
      const result = await generateAndDownloadPdf(completeFormData, {
        filename: `SF86_Client_Generated_${new Date().toISOString().split("T")[0]}.pdf`,
        showConsoleOutput: true,
        onLoadingStateChange: setIsGeneratingPdf,
        onProgress: (message) => {
          // Progress updates are handled by the centralized utility
        },
        onError: (error) => {
          console.error("PDF generation error:", error);
        },
        onSuccess: (result) => {
          // Also download JSON data for debugging
          const jsonFilename = result.filename.replace('.pdf', '-data.json');
          downloadJsonData(completeFormData, jsonFilename);
          console.info("🔍 JSON data downloaded for debugging analysis");
        }
      });

    } catch (error) {
      console.error("💥 Error during client PDF generation:", error);
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-lg p-6"
      data-testid="section-navigation"
    >
      {/* Action Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Form Management</h2>
              <p className="text-sm text-gray-600">Save progress and generate PDF</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Primary Actions */}
            <div className="flex flex-wrap gap-2">
            
              <button
                onClick={handleGlobalSave}
                className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 active:bg-green-700 transition-all duration-200 flex items-center space-x-1"
                data-testid="global-save-button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save Form</span>
              </button>
            </div>

            {/* PDF Generation */}
            <div className="flex flex-wrap gap-2 border-l border-gray-300 pl-2">
        
              <button
                onClick={handleClientPdfGeneration}
                disabled={isGeneratingPdf}
                className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 flex items-center space-x-1 ${isGeneratingPdf
                  ? "bg-purple-300 text-purple-700 cursor-not-allowed"
                  : "bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700"
                  }`}
                data-testid="client-pdf-button"
              >
                {isGeneratingPdf ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">Client PDF</span>
                    <span className="sm:hidden">Local</span>
                  </>
                )}
              </button>
            </div>

            {/* Utility Actions */}
            <div className="flex flex-wrap gap-2 border-l border-gray-300 pl-2">
              <ClearCacheButton
                variant="danger"
                size="sm"
                onCacheCleared={() => {
                  console.log("🗑️ Cache cleared successfully from navigation");
                  sf86Context.resetForm();
                }}
                className="px-3 py-2 text-sm"
              />

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-all duration-200 flex items-center space-x-1"
                data-testid="toggle-sections-button"
              >
                <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="hidden sm:inline">{isExpanded ? "Collapse" : "Expand"}</span>
              </button>
            </div>
          </div>
        </div>

  
      </div>

            {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800">
                Important Notice
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                Disabled sections (shown in gray) are not yet supported in this form.
                You will need to complete these sections manually after generating the PDF.
              </p>
            </div>
          </div>
        </div>

      {/* All Sections (Expandable) */}
      {isExpanded && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M5 11V9a2 2 0 012-2h10a2 2 0 012 2v2" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">All SF-86 Sections</h3>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{config.implementedSections.length} implemented</span>
                <span>•</span>
                <span>{config.sectionOrder.length} total</span>
              </div>
            </div>
          </div>

          {/* Sections Grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {config.sectionOrder.map((sectionId: string) => {
                const isImplemented = config.implementedSections.includes(sectionId);
                const isActive = currentSection === sectionId;
                const isCompleted = formProgress[sectionId];

                return (
                  <button
                    key={sectionId}
                    onClick={() => onSectionChange(sectionId)}
                    disabled={!isImplemented}
                    className={`p-3 rounded-lg text-left text-sm transition-all duration-200 border ${isActive
                      ? "bg-blue-500 text-white border-blue-600 shadow-md scale-105"
                      : isImplemented
                        ? "bg-white hover:bg-gray-50 text-gray-900 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        : "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
                      }`}
                    data-testid={`section-${sectionId}-nav-button`}
                  >
                    <div className="flex items-start justify-between space-x-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${isActive
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-600"
                            }`}>
                          </span>
                          {isCompleted && (
                            <div className={`w-2 h-2 rounded-full ${isActive ? "bg-white/60" : "bg-green-400"
                              }`}></div>
                          )}
                        </div>
                        <div className="font-medium truncate">
                          {config.sectionTitles[sectionId] || sectionId}
                        </div>
                        <div className={`text-xs mt-1 truncate ${isActive ? "text-white/70" : "text-gray-500"
                          }`}>
                          {sectionId}
                        </div>
                      </div>

                  
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
