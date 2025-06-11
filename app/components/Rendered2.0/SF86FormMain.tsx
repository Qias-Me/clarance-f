/**
 * SF-86 Form Main Component
 *
 * Main form component that integrates all SF-86 sections using the new
 * Form Architecture 2.0. This component provides navigation between sections
 * and demonstrates the complete form functionality.
 */

import React, { useState, useCallback, useMemo } from "react";
import { useSF86Form } from "~/state/contexts/SF86FormContext";
import { clientPdfService2 } from "../../../api/service/clientPdfService2.0";
// Import shared SF-86 section configuration instead of individual components
import { getActiveSections } from "~/utils/sf86SectionConfig";

interface SF86FormMainProps {
  className?: string;
}

const SF86FormMain: React.FC<SF86FormMainProps> = ({ className = "" }) => {
  const { generatePdf, validateForm, saveForm, formData, exportForm, downloadJsonData, completedSections } =
    useSF86Form();
  const [currentSection, setCurrentSection] = useState<string>("section1");
  const [sectionValidation, setSectionValidation] = useState<
    Record<string, boolean>
  >({});

  // Use shared section configuration instead of duplicating the definitions
  // This gets the currently active sections for development/testing
  const availableSections = useMemo(() => getActiveSections(), []);

  // Handle section validation updates
  const handleSectionValidation = useCallback(
    (sectionId: string, isValid: boolean) => {
      setSectionValidation((prev) => ({
        ...prev,
        [sectionId]: isValid,
      }));
    },
    []
  ); // Empty dependency array since setSectionValidation is stable

  // Handle PDF generation and download - CLIENT-SIDE processing
  const handleGeneratePdfLocal = async () => {
    try {
      console.log("🚀 Starting CLIENT-SIDE PDF generation process...");
      console.log("📊 Base form data:", formData);

      // Collect all section data from contexts before processing
      const completeFormData = exportForm(); // This calls collectAllSectionData internally
      console.log(
        "📋 Complete form data collected from contexts:",
        completeFormData
      );

      const result = await generatePdf();

      if (result.success && result.pdfBytes) {
        // Use the service's download method directly
        const filename = `SF86_Client_Generated_${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        console.log(`📄 Initiating download with filename: ${filename}`);

        // Call the enhanced download method
        clientPdfService2.downloadPdf(result.pdfBytes, filename);

        // Also download JSON data for debugging
        const jsonFilename = filename.replace('.pdf', '-data.json');
        console.log(`📄 Also downloading JSON data: ${jsonFilename}`);
        downloadJsonData(jsonFilename);

        console.log("✅ PDF and JSON downloaded successfully!");
        console.log(
          `📊 Statistics: ${result.fieldsApplied}/${result.fieldsMapped} fields applied`
        );

        // Show success message with detailed info
        const message =
          `🎉 CLIENT-SIDE PDF generated and downloaded successfully!\n\n` +
          `📊 Client Processing Details:\n` +
          `• Fields mapped: ${result.fieldsMapped}\n` +
          `• Fields applied: ${result.fieldsApplied}\n` +
          `• PDF size: ${result.pdfBytes.length} bytes\n` +
          `• PDF filename: ${filename}\n` +
          `• JSON filename: ${jsonFilename}\n\n` +
          `🔍 JSON data downloaded for debugging analysis\n\n` +
          `💡 If the download doesn't start automatically, check your browser's download settings or popup blocker.`;

        alert(message);
      } else {
        console.error("❌ Client PDF generation failed:", result.errors);
        const errorMessage = `❌ Client-side PDF generation failed:\n\n${result.errors.join(
          "\n"
        )}`;
        alert(errorMessage);
      }
    } catch (error) {
      console.error("💥 Error during client PDF generation:", error);
      const errorMessage = `💥 Client PDF generation error: ${error}`;
      alert(errorMessage);
    }
  };

  // Handle PDF generation and download - SERVER-SIDE processing with terminal logging
  const handleGeneratePdfServer = async () => {
    try {
      console.log("🚀 Starting SERVER-SIDE PDF generation process...");
      console.log("📊 Form data to send:", formData);

      // Collect all section data from contexts before sending to server
      const completeFormData = exportForm(); // This calls collectAllSectionData internally
      console.log("📋 Complete form data collected:", completeFormData);

      // Create form data for the server action
      const actionFormData = new FormData();
      actionFormData.append("data", JSON.stringify(completeFormData));
      actionFormData.append("actionType", "generatePDFServer");

      console.log("📡 Sending request to server action...");

      // Submit to the server action via startForm route
      const response = await fetch("/startForm", {
        method: "POST",
        body: actionFormData,
      });

      const result = (await response.json()) as any; // Type assertion for server response
      console.log("📄 Server PDF generation result:", result);

      if (result.success && result.data?.pdfBase64) {
        console.log(`✅ PDF generation successful!`);
        console.log(`📊 Fields mapped: ${result.data.fieldsMapped}`);
        console.log(`📊 Fields applied: ${result.data.fieldsApplied}`);
        console.log(`📈 Success rate: ${result.data.successRate?.toFixed(2)}%`);
        console.log("📄 Check your terminal for detailed server logs!");

        // Create download link for the PDF
        const pdfBlob = new Blob(
          [
            Uint8Array.from(atob(result.data.pdfBase64), (c) =>
              c.charCodeAt(0)
            ),
          ],
          { type: "application/pdf" }
        );

        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        const filename = `SF86_Server_Generated_${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Also download JSON data for debugging
        const jsonFilename = filename.replace('.pdf', '-data.json');
        console.log(`📄 Also downloading JSON data: ${jsonFilename}`);
        downloadJsonData(jsonFilename);

        // Show success message with detailed server-side info
        const message =
          `🎉 SERVER-SIDE PDF generated and downloaded successfully!\n\n` +
          `📊 Server Processing Details:\n` +
          `• Fields mapped: ${result.data.fieldsMapped}\n` +
          `• Fields applied: ${result.data.fieldsApplied}\n` +
          `• Success rate: ${result.data.successRate?.toFixed(2)}%\n` +
          `• Total PDF fields: ${result.data.totalPdfFields}\n` +
          `• Total form fields: ${result.data.totalFormFields}\n` +
          `• PDF filename: ${filename}\n` +
          `• JSON filename: ${jsonFilename}\n\n` +
          `🔍 JSON data downloaded for debugging analysis\n\n` +
          `🖥️ IMPORTANT: Check your terminal/console for comprehensive field mapping logs!\n` +
          `This includes detailed analysis of Section 29 radio button mappings and field lookup effectiveness.`;

        alert(message);
      } else {
        const errorMessage =
          `❌ Server-side PDF generation failed:\n\n${result.message}\n\n` +
          `🔍 Check your terminal for detailed error logs.`;
        console.error("❌ Server PDF generation failed:", result.message);
        if (result.data?.errors) {
          console.error("🔍 Server errors:", result.data.errors);
        }
        alert(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        `💥 Server PDF generation error: ${error}\n\n` +
        `🔍 Check your terminal for detailed error information.`;
      console.error("💥 Server PDF generation error:", error);
      alert(errorMessage);
    }
  };

  // Handle form validation
  const handleValidateForm = () => {
    const result = validateForm();
    alert(
      `Form validation: ${result.isValid ? "PASSED" : "FAILED"}\nErrors: ${
        result.errors.length
      }\nWarnings: ${result.warnings.length}`
    );
  };

  // Handle form save
  const handleSaveForm = async () => {
    try {
      await saveForm();

      // Collect all section data from contexts before processing
      const completeFormData = exportForm(); // This calls collectAllSectionData internally
      console.log(
        "📋 Complete form data collected from contexts:",
        completeFormData
      );

      alert("Form saved successfully!");
    } catch (error) {
      alert(`Form save error: ${error}`);
    }
  };

  // Handle standalone JSON download
  const handleDownloadJson = () => {
    try {
      const filename = `SF86_Form_Data_${
        new Date().toISOString().split("T")[0]
      }.json`;
      console.log(`📄 Downloading JSON data: ${filename}`);

      const result = downloadJsonData(filename);

      if (result.success) {
        alert(`🎉 JSON data downloaded successfully!\n\nFilename: ${filename}\n\n🔍 This file contains all form data for debugging analysis.`);
      } else {
        alert(`❌ JSON download failed:\n\n${result.errors.join("\n")}`);
      }
    } catch (error) {
      console.error("💥 JSON download error:", error);
      alert(`💥 JSON download error: ${error}`);
    }
  };

  // Get current section component
  const getCurrentSectionComponent = useCallback(() => {
    const section = availableSections.find((s) => s.id === currentSection);
    if (!section) return null;

    const Component = section.component;
    return (
      <Component
        onValidationChange={(isValid: boolean) =>
          handleSectionValidation(currentSection, isValid)
        }
      />
    );
  }, [currentSection, handleSectionValidation, availableSections]); // Include dependencies

  return (
    <div
      className={`min-h-screen bg-gray-50 ${className}`}
      data-testid="sf86-form-container"
    >
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                SF-86 Questionnaire for National Security Positions
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Form Architecture 2.0 - Comprehensive Implementation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500" data-testid="form-status">
                Status: Active
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Section Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
              {/* Navigation Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Form Sections
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {Object.values(sectionValidation).filter(Boolean).length} of {availableSections.length} completed
                </p>
              </div>

              {/* Progress Bar */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round((completedSections.length / availableSections.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${(completedSections.length / availableSections.length) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Navigation List */}
              <nav className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-1">
                  {availableSections.map((section, index) => {
                    const isActive = currentSection === section.id;
                    const isCompleted = completedSections.includes(section.id);
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => setCurrentSection(section.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                          isActive
                            ? "bg-blue-500 text-white shadow-md transform scale-[1.02]"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200"
                        }`}
                        data-testid={`${section.id}-tab`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {/* Section Number */}
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isActive 
                                ? "bg-white/20 text-white" 
                                : isCompleted
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {isCompleted ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                index + 1
                              )}
                            </div>
                            
                            {/* Section Name */}
                            <span className="truncate flex-1">{section.name}</span>
                          </div>
                          
                          {/* Status Indicator */}
                          <div className="flex-shrink-0">
                            {isCompleted && (
                              <div className={`w-2 h-2 rounded-full ${
                                isActive ? "bg-white/60" : "bg-green-400"
                              }`}></div>
                            )}
                            {isActive && !isCompleted && (
                              <div className="w-2 h-2 rounded-full bg-white/60"></div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* Form Actions */}
              <div className="border-t border-gray-100 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Actions
                </h3>
                
                <div className="space-y-2">
                  <button
                    onClick={handleValidateForm}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 text-sm font-medium flex items-center justify-center group"
                    data-testid="validate-form-button"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Validate Form
                  </button>

                  <button
                    onClick={handleSaveForm}
                    className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-all duration-200 text-sm font-medium flex items-center justify-center group"
                    data-testid="save-form-button"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Form
                  </button>

                  <button
                    onClick={handleDownloadJson}
                    className="w-full px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 active:bg-teal-700 transition-all duration-200 text-sm font-medium flex items-center justify-center group"
                    data-testid="download-json-button"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M7 7h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
                    </svg>
                    Download JSON
                  </button>

                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2 font-medium">PDF Generation</p>
                    
                    <button
                      onClick={handleGeneratePdfLocal}
                      className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 active:bg-purple-700 transition-all duration-200 text-sm font-medium flex items-center justify-center group mb-2"
                      data-testid="generate-pdf-button"
                    >
                      <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Local PDF
                    </button>

                    <button
                      onClick={handleGeneratePdfServer}
                      className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 transition-all duration-200 text-sm font-medium flex items-center justify-center group"
                      data-testid="generate-pdf-server-button"
                    >
                      <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                      Server PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Statistics */}
              <div className="border-t border-gray-100 p-4 bg-gradient-to-br from-gray-50 to-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Statistics
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">{availableSections.length}</div>
                    <div className="text-xs text-gray-600">Total Sections</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-green-600">
                      {completedSections.length}
                    </div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                </div>
                
                <div className="mt-3 bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>Architecture Version</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">2.0</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Completion Rate</span>
                    <span className="font-medium text-gray-800">
                      {Math.round((completedSections.length / availableSections.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">{getCurrentSectionComponent()}</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>SF-86 Form Architecture 2.0 - Demonstration Implementation</p>
            <p className="mt-1">
              This is a demonstration of the new scalable SF-86 form
              architecture with comprehensive PDF integration and testing
              infrastructure.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SF86FormMain;
