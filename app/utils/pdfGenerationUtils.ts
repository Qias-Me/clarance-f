/**
 * PDF Generation Utilities
 *
 * Centralized PDF generation logic to eliminate duplication between components.
 * This utility provides consistent PDF generation with proper error handling,
 * mobile device detection, and comprehensive user feedback.
 * Enhanced with Section 1 PDF-to-UI field mapping integration.
 */

import { clientPdfService2 } from "../../api/service/clientPdfService2.0";
import { EnhancedPdfServiceWithSection1Integration } from "../services/enhancedPdfServiceWithSection1Integration";
import type { ApplicantFormValues } from "../../api/interfaces/formDefinition2.0";

// Create enhanced service instance for Section 1 integration
const enhancedPdfService = new EnhancedPdfServiceWithSection1Integration();

export interface PdfGenerationOptions {
  filename?: string;
  showConsoleOutput?: boolean;
  onProgress?: (message: string) => void;
  onError?: (error: string) => void;
  onSuccess?: (result: PdfGenerationResult) => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
  useEnhancedSection1Integration?: boolean; // New option for enhanced integration
}

export interface PdfValidationConfig {
  targetPage: number;
  sectionReference: string;
  expectedFields?: any[];
  inMemoryValidation?: boolean;
}

export interface PdfGenerationResult {
  success: boolean;
  filename: string;
  pdfBytes?: Uint8Array;
  fieldsMapped: number;
  fieldsApplied: number;
  errors: string[];
  warnings: string[];
  stats?: {
    totalPdfFields: number;
    totalFormFields: number;
    applicationSuccessRate: number;
  };
<<<<<<< HEAD
  // Enhanced Section 1 integration data
  section1Statistics?: any;
  section1Validation?: any;
=======
  validation?: {
    success: boolean;
    fieldsFound: any[];
    fieldsMatched: number;
    fieldsMissing: any[];
    errors: string[];
  };
>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02
}

/**
 * Generate and download PDF using client-side processing with enhanced mobile support
 * Enhanced with Section 1 PDF-to-UI field mapping integration
 */
export async function generateAndDownloadPdf(
  formData: ApplicantFormValues,
  options: PdfGenerationOptions = {}
): Promise<PdfGenerationResult> {
  const {
    filename = `SF86_Generated_${new Date().toISOString().split("T")[0]}.pdf`,
    showConsoleOutput = true,
    onProgress,
    onError,
    onSuccess,
    onLoadingStateChange,
    useEnhancedSection1Integration = true // Default to using enhanced integration
  } = options;

  const result: PdfGenerationResult = {
    success: false,
    filename,
    fieldsMapped: 0,
    fieldsApplied: 0,
    errors: [],
    warnings: []
  };

  try {
    onLoadingStateChange?.(true);

    if (showConsoleOutput) {
      console.info("🚀 Starting ENHANCED CLIENT-SIDE PDF generation process...");
      console.info("=".repeat(80));
      console.info(`⏰ Timestamp: ${new Date().toISOString()}`);
      // console.info(`📊 Form data sections: ${Object.keys(formData).length}`);
    }
    onProgress?.("Starting PDF generation...");

<<<<<<< HEAD
    // Use the enhanced client PDF service
    // Generate PDF using enhanced service with Section 1 integration or legacy service
    let pdfResult;
    if (useEnhancedSection1Integration) {
      if (showConsoleOutput) {
        console.info("🔗 Using Enhanced PDF Service with Section 1 Integration");
      }
      onProgress?.("Applying enhanced Section 1 field mappings...");
      
      try {
        pdfResult = await enhancedPdfService.generateEnhancedPdf(formData);
        
        if (showConsoleOutput && pdfResult.section1Statistics) {
          console.info("📊 Section 1 Integration Statistics:");
          console.info(`   🎯 Section 1 Fields Processed: ${pdfResult.section1Statistics.totalSection1Fields || 0}`);
          console.info(`   ✅ Successful Mappings: ${pdfResult.section1Statistics.successfulMappings || 0}`);
          console.info(`   ❌ Failed Mappings: ${pdfResult.section1Statistics.failedMappings || 0}`);
          console.info(`   📈 Mapping Success Rate: ${((pdfResult.section1Statistics.mappingSuccessRate || 0) * 100).toFixed(1)}%`);
          console.info(`   🔗 Integration Mappings: ${pdfResult.section1Statistics.integrationMappings || 0}`);
          console.info(`   🔄 Legacy Mappings: ${pdfResult.section1Statistics.legacyMappings || 0}`);
        }
      } catch (enhancedError) {
        if (showConsoleOutput) {
          console.warn("⚠️ Enhanced PDF Service failed, falling back to legacy service:", enhancedError);
        }
        onProgress?.("Enhanced service failed, using legacy PDF generation...");
        pdfResult = await clientPdfService2.generatePdfClientAction(formData);
      }
    } else {
      if (showConsoleOutput) {
        console.info("🔄 Using Legacy PDF Service");
      }
      pdfResult = await clientPdfService2.generatePdfClientAction(formData);
    }
=======
    // Use the enhanced client PDF service with validation
    const pdfResult = await clientPdfService2.generatePdfWithValidation(formData, {
      targetPages: [17], // Default to Section 13 page 17
      enableValidation: true,
      enableCorrection: true,
      generateImages: true
    });
>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02

    // Update result with PDF service response
    result.success = pdfResult.success;
    result.pdfBytes = pdfResult.pdfBytes;
    result.fieldsMapped = pdfResult.fieldsMapped;
    result.fieldsApplied = pdfResult.fieldsApplied;
    result.errors = pdfResult.errors;
    result.warnings = pdfResult.warnings;
    result.stats = {
      totalPdfFields: pdfResult.stats.totalPdfFields,
      totalFormFields: pdfResult.stats.totalFormFields,
      applicationSuccessRate: pdfResult.stats.applicationSuccessRate
    };

    // Log validation results if available
    if (pdfResult.validationReport) {
      if (showConsoleOutput) {
        console.info('🔍 PDF Validation Results:');
        console.info(`   📊 Total Fields: ${pdfResult.validationReport.totalFields}`);
        console.info(`   ✅ Valid Fields: ${pdfResult.validationReport.validFields}`);
        console.info(`   ❌ Invalid Fields: ${pdfResult.validationReport.invalidFields}`);
        console.info(`   📈 Success Rate: ${pdfResult.validationReport.totalFields > 0 ? ((pdfResult.validationReport.validFields / pdfResult.validationReport.totalFields) * 100).toFixed(2) : 0}%`);

        if (pdfResult.validationReport.invalidFields > 0) {
          console.warn('⚠️ Some fields failed validation. Check console for details.');
        }
      }
    }

    if (pdfResult.success && pdfResult.pdfBytes) {
      if (showConsoleOutput) {
        console.info(`📄 Initiating download with filename: ${filename}`);
      }
      onProgress?.("Downloading PDF...");

      // Enhanced mobile device detection
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOSDevice = /ipad|iphone|ipod/.test(userAgent);
      const isAndroidDevice = /android/.test(userAgent);
      const isMobileDevice = isIOSDevice || isAndroidDevice || /mobile/.test(userAgent);

      if (showConsoleOutput && isMobileDevice) {
        if (isIOSDevice) {
          console.info("📱 iOS device detected - using enhanced mobile download method");
        } else if (isAndroidDevice) {
          console.info("📱 Android device detected - using enhanced mobile download method");
        } else {
          console.info("📱 Mobile device detected - using enhanced mobile download method");
        }
      }

      // ENABLED: Automatic PDF download for validation workflow
      console.log('✅ PDF download ENABLED for validation workflow');
      console.log(`📄 Downloading: ${filename} (${pdfResult.pdfBytes.length} bytes)`);
      clientPdfService2.downloadPdf(pdfResult.pdfBytes, filename);

      if (showConsoleOutput) {
        console.info("\n🎉 ENHANCED CLIENT PDF GENERATION COMPLETED SUCCESSFULLY");
        console.info("=".repeat(80));
        console.info(`📊 Summary: ${result.fieldsApplied}/${result.fieldsMapped} fields applied (${result.stats?.applicationSuccessRate?.toFixed(2) || 0}%)`);
        console.info(`📄 PDF size: ${pdfResult.pdfBytes.length} bytes (${(pdfResult.pdfBytes.length / 1024 / 1024).toFixed(2)} MB)`);
        console.info(`⏰ Completed at: ${new Date().toISOString()}`);
        console.info("=".repeat(80));
      }

      // Generate comprehensive user message with device-specific instructions
      const mobileInstructions = getMobileInstructions(isIOSDevice, isAndroidDevice, isMobileDevice);
      // const successMessage = generateSuccessMessage(result, filename, mobileInstructions);

      // onProgress?.(successMessage);
      onSuccess?.(result);
    } else {
      if (showConsoleOutput) {
        console.error("\n💥 ENHANCED CLIENT PDF GENERATION FAILED");
        console.error("=".repeat(80));
        console.error(`🚨 Total Errors: ${result.errors.length}`);
        console.error(`⚠️ Total Warnings: ${result.warnings?.length || 0}`);
        console.error(`📊 Fields Mapped: ${result.fieldsMapped || 0}`);
        console.error(`📊 Fields Applied: ${result.fieldsApplied || 0}`);

        if (result.errors.length > 0) {
          console.error("\n💥 ===== DETAILED ERROR REPORT =====");
          result.errors.forEach((error, index) => {
            console.error(`   [${index + 1}] ${error}`);
          });
        }
        console.error("=".repeat(80));
      }

      const errorMessage = generateErrorMessage(result);
      onError?.(errorMessage);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors.push(errorMessage);

    if (showConsoleOutput) {
      console.error("💥 FATAL ERROR IN ENHANCED CLIENT PDF GENERATION");
      console.error("-".repeat(50));
      console.error(`❌ Error: ${errorMessage}`);
      console.error(`📍 Stack trace:`, error instanceof Error ? error.stack : "No stack trace available");
      console.error("-".repeat(50));
    }

    const fatalErrorMessage = `💥 Enhanced client PDF generation error:\n\n${errorMessage}\n\nCheck the browser console for details.`;
    onError?.(fatalErrorMessage);
  } finally {
    onLoadingStateChange?.(false);
  }

  return result;
}

/**
 * Generate and save PDF to project directory for analysis
 */
export async function generateAndSavePdfForAnalysis(
  formData: ApplicantFormValues,
  options: PdfGenerationOptions = {}
): Promise<PdfGenerationResult> {
  const {
    filename = `SF86_Analysis_${new Date().toISOString().split("T")[0]}.pdf`,
    showConsoleOutput = true,
    onProgress,
    onError,
    onSuccess
  } = options;

  const result: PdfGenerationResult = {
    success: false,
    filename,
    fieldsMapped: 0,
    fieldsApplied: 0,
    errors: [],
    warnings: []
  };

  try {
    if (showConsoleOutput) {
      console.log("🔬 Starting PDF generation for analysis...");
    }
    onProgress?.("Generating PDF for analysis...");

    // Create form data for the server action
    const actionFormData = new FormData();
    actionFormData.append("data", JSON.stringify(formData));
    actionFormData.append("actionType", "generatePDFForAnalysis");

    // Submit to the server action via startForm route
    const response = await fetch("/startForm", {
      method: "POST",
      body: actionFormData,
    });

    const serverResult = await response.json();

    if (serverResult.success) {
      result.success = true;
      result.fieldsMapped = serverResult.fieldsMapped || 0;
      result.fieldsApplied = serverResult.fieldsApplied || 0;
      result.savedPath = serverResult.savedPath;

      if (showConsoleOutput) {
        console.log(`✅ PDF saved for analysis at: ${result.savedPath}`);
        console.log(`📊 Fields mapped: ${result.fieldsMapped}, Fields applied: ${result.fieldsApplied}`);
      }

      onSuccess?.(result);
    } else {
      result.errors = serverResult.errors || ["Server PDF generation failed"];
      if (showConsoleOutput) {
        console.error("❌ Server PDF generation failed:", result.errors);
      }
      onError?.(result.errors[0]);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    result.errors = [errorMessage];

    if (showConsoleOutput) {
      console.error("💥 Error during server PDF generation:", error);
    }
    onError?.(errorMessage);
  }

  return result;
}

/**
 * Generate PDF with immediate validation workflow
 */
export async function generateAndValidatePdf(
  formData: ApplicantFormValues,
  validationConfig: PdfValidationConfig,
  options: PdfGenerationOptions = {}
): Promise<PdfGenerationResult> {
  const {
    filename = `SF86_Validated_${new Date().toISOString().split("T")[0]}.pdf`,
    showConsoleOutput = true,
    onProgress,
    onError,
    onSuccess
  } = options;

  const result: PdfGenerationResult = {
    success: false,
    filename,
    fieldsMapped: 0,
    fieldsApplied: 0,
    errors: [],
    warnings: []
  };

  try {
    onProgress?.("Generating PDF with validation...");

    // Load expected fields from section reference if not provided
    let expectedFields = validationConfig.expectedFields;
    if (!expectedFields && validationConfig.sectionReference) {
      try {
        const response = await fetch(`/api/sections-references/${validationConfig.sectionReference}.json`);
        const sectionData = await response.json();
        expectedFields = sectionData.fields?.filter((field: any) => field.page === validationConfig.targetPage) || [];
      } catch (error) {
        console.warn(`Could not load section reference: ${validationConfig.sectionReference}`);
        expectedFields = [];
      }
    }

    // Generate PDF with immediate validation
    const pdfResult = await clientPdfService2.generatePdfClientActionWithValidation(formData, {
      targetPage: validationConfig.targetPage,
      expectedFields: expectedFields || [],
      sectionReference: validationConfig.sectionReference
    });

    // Update result with PDF service response
    result.success = pdfResult.success;
    result.pdfBytes = pdfResult.pdfBytes;
    result.fieldsMapped = pdfResult.fieldsMapped;
    result.fieldsApplied = pdfResult.fieldsApplied;
    result.errors = pdfResult.errors;
    result.warnings = pdfResult.warnings;
    result.validation = pdfResult.validation;
    result.stats = {
      totalPdfFields: pdfResult.stats.totalPdfFields,
      totalFormFields: pdfResult.stats.totalFormFields,
      applicationSuccessRate: pdfResult.stats.applicationSuccessRate
    };

    if (pdfResult.success && pdfResult.pdfBytes) {
      // Download PDF for manual inspection unless in-memory only mode
      if (!validationConfig.inMemoryValidation) {
        clientPdfService2.downloadPdf(pdfResult.pdfBytes, filename);
      }

      if (showConsoleOutput && result.validation) {
        console.info("\n🔍 PDF VALIDATION RESULTS");
        console.info("=".repeat(50));
        console.info(`📄 Target Page: ${validationConfig.targetPage}`);
        console.info(`📊 Fields Found: ${result.validation.fieldsFound.length}`);
        console.info(`✅ Fields Matched: ${result.validation.fieldsMatched}`);
        console.info(`❌ Fields Missing: ${result.validation.fieldsMissing.length}`);

        if (result.validation.fieldsMissing.length > 0) {
          console.warn("Missing fields:", result.validation.fieldsMissing.map((f: any) => f.name));
        }
        console.info("=".repeat(50));
      }

      onSuccess?.(result);
    }

    return result;

  } catch (error: any) {
    const errorMsg = `PDF generation with validation failed: ${error.message}`;
    result.errors.push(errorMsg);
    onError?.(errorMsg);
    throw error;
  }
}

/**
 * Generate PDF for server-side processing (via fetch to startForm route)
 */
export async function generatePdfViaServer(
  formData: ApplicantFormValues,
  options: PdfGenerationOptions = {}
): Promise<PdfGenerationResult> {
  const {
    filename = `SF86_Server_Generated_${new Date().toISOString().split("T")[0]}.pdf`,
    showConsoleOutput = true,
    onProgress,
    onError,
    onSuccess
  } = options;

  const result: PdfGenerationResult = {
    success: false,
    filename,
    fieldsMapped: 0,
    fieldsApplied: 0,
    errors: [],
    warnings: []
  };

  try {
    if (showConsoleOutput) {
      console.log("🚀 Starting SERVER-SIDE PDF generation process...");
    }
    onProgress?.("Sending data to server...");

    // Create form data for the server action
    const actionFormData = new FormData();
    actionFormData.append("data", JSON.stringify(formData));
    actionFormData.append("actionType", "generatePDFServer");

    // Submit to the server action via startForm route
    const response = await fetch("/startForm", {
      method: "POST",
      body: actionFormData,
    });

    const serverResult = await response.json();

    if (serverResult.success && serverResult.data?.pdfBase64) {
      onProgress?.("Server processing complete, downloading PDF...");

      // Convert base64 to blob and download
      const pdfBlob = new Blob(
        [Uint8Array.from(atob(serverResult.data.pdfBase64), (c) => c.charCodeAt(0))],
        { type: "application/pdf" }
      );

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update result
      result.success = true;
      result.fieldsMapped = serverResult.data.fieldsMapped || 0;
      result.fieldsApplied = serverResult.data.fieldsApplied || 0;
      result.stats = {
        totalPdfFields: serverResult.data.totalPdfFields || 0,
        totalFormFields: serverResult.data.totalFormFields || 0,
        applicationSuccessRate: serverResult.data.successRate || 0
      };

      if (showConsoleOutput) {
        console.log("✅ Server-side PDF generated and downloaded successfully!");
      }

      onSuccess?.(result);
    } else {
      const errorMessage = `❌ Server-side PDF generation failed:\n\n${serverResult.message}`;
      result.errors.push(errorMessage);
      
      if (showConsoleOutput) {
        console.error(errorMessage);
      }
      onError?.(errorMessage);
    }
  } catch (error) {
    const errorMessage = `💥 Server PDF generation error: ${error}`;
    result.errors.push(errorMessage);
    
    if (showConsoleOutput) {
      console.error(errorMessage);
    }
    onError?.(errorMessage);
  }

  return result;
}

/**
 * Get mobile-specific download instructions
 */
function getMobileInstructions(isIOSDevice: boolean, isAndroidDevice: boolean, isMobileDevice: boolean): string {
  if (isIOSDevice) {
    return `\n🍎 iOS Users:\n` +
      `• If download didn't start, check if a new tab opened\n` +
      `• Look for the Share button (⬆️) in Safari's toolbar\n` +
      `• Tap Share → Save to Files (or Save to Photos)\n` +
      `• Choose your preferred save location\n` +
      `• Alternative: Long-press the PDF and select "Save"\n`;
  } else if (isAndroidDevice) {
    return `\n🤖 Android Users:\n` +
      `• Check your notification panel for download progress\n` +
      `• PDF should be saved to Downloads folder automatically\n` +
      `• If no download, check if a new tab opened\n` +
      `• Try long-pressing the PDF and selecting "Download"\n` +
      `• Some browsers may open PDF instead - look for save options\n`;
  } else if (isMobileDevice) {
    return `\n📱 Mobile Browser:\n` +
      `• Download behavior varies by mobile browser\n` +
      `• Check if a new tab opened with the PDF\n` +
      `• Look for save/download options in your browser\n` +
      `• Check your device's Downloads folder\n`;
  } else {
    return `\n💻 Desktop: If download doesn't start, check browser's download settings or popup blocker.\n`;
  }
}

/**
 * Generate comprehensive success message
 */
function generateSuccessMessage(result: PdfGenerationResult, filename: string, mobileInstructions: string): string {
  return `🎉 ENHANCED CLIENT-SIDE PDF Generated Successfully!\n\n` +
    `📊 Processing Statistics:\n` +
    `• Total form fields: ${result.stats?.totalFormFields || 0}\n` +
    `• Fields mapped: ${result.fieldsMapped}\n` +
    `• Fields applied: ${result.fieldsApplied}\n` +
    `• Success rate: ${result.stats?.applicationSuccessRate?.toFixed(2) || 0}%\n` +
    `• PDF size: ${result.pdfBytes ? (result.pdfBytes.length / 1024 / 1024).toFixed(2) : 0} MB\n` +
    `• Filename: ${filename}\n` +
    `• Errors: ${result.errors.length}\n` +
    `• Warnings: ${result.warnings?.length || 0}\n` +
    mobileInstructions +
    `\n🔍 Check the browser console for detailed field mapping logs!`;
}

/**
 * Generate comprehensive error message
 */
function generateErrorMessage(result: PdfGenerationResult): string {
  return `❌ Enhanced client-side PDF generation failed.\n\n` +
    `🚨 ${result.errors.length} errors encountered.\n` +
    `⚠️ ${result.warnings?.length || 0} warnings.\n\n` +
    `📊 Fields mapped: ${result.fieldsMapped || 0}\n` +
    `📊 Fields applied: ${result.fieldsApplied || 0}\n\n` +
    `🔍 Check the browser console for detailed error information.\n\n` +
    `${result.errors.slice(0, 5).join("\n")}`;
}

/**
 * Download JSON data for debugging with enhanced error handling
 */
export function downloadJsonData(formData: ApplicantFormValues, filename?: string): { success: boolean; errors: string[] } {
  const jsonFilename = filename || `SF86_Form_Data_${new Date().toISOString().split("T")[0]}.json`;
  const result = { success: false, errors: [] as string[] };

  try {
    const jsonString = JSON.stringify(formData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = jsonFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.info(`📄 JSON data downloaded: ${jsonFilename}`);
    result.success = true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('💥 JSON download error:', errorMessage);
    result.errors.push(errorMessage);
  }

  return result;
}
