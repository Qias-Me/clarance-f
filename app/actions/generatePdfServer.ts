/**
 * Server Action for PDF Generation with Terminal Logging
 *
 * This server action processes SF-86 form data entirely on the server-side,
 * providing comprehensive terminal logging for development debugging.
 * All PDF generation logic runs server-side with detailed console output.
 */

import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFName,
  PDFRadioGroup,
  PDFString,
  PDFTextField
} from 'pdf-lib';
import type { ApplicantFormValues } from '../../api/interfaces/formDefinition2.0';

// SF-86 PDF template URL
const SF86_PDF_URL = 'https://www.opm.gov/forms/pdf_fill/sf86.pdf';

// Server-side logging utility
function serverLog(level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [SERVER-PDF-ACTION] [${level}]`;

  switch (level) {
    case 'INFO':
      console.log(`${prefix} ${message}`, data ? JSON.stringify(data, null, 2) : '');
      break;
    case 'WARN':
      console.warn(`${prefix} ${message}`, data ? JSON.stringify(data, null, 2) : '');
      break;
    case 'ERROR':
      console.error(`${prefix} ${message}`, data ? JSON.stringify(data, null, 2) : '');
      break;
  }
}

// Interface for PDF generation result
interface ServerPdfResult {
  success: boolean;
  pdfBytes?: Uint8Array;
  fieldsMapped: number;
  fieldsApplied: number;
  errors: string[];
  warnings: string[];
  stats: {
    totalPdfFields: number;
    totalFormFields: number;
    mappingSuccessRate: number;
    applicationSuccessRate: number;
    lookupMethodStats: Record<string, number>;
    fieldTypeStats: Record<string, { attempts: number; success: number }>;
  };
}

/**
 * Main server action for PDF generation
 */
export async function generatePdfServerAction(formData: ApplicantFormValues): Promise<ServerPdfResult> {
  serverLog('INFO', "\n" + "=".repeat(80));
  serverLog('INFO', "🚀 SERVER ACTION: PDF GENERATION STARTED");
  serverLog('INFO', "=".repeat(80));

  const result: ServerPdfResult = {
    success: false,
    fieldsMapped: 0,
    fieldsApplied: 0,
    errors: [],
    warnings: [],
    stats: {
      totalPdfFields: 0,
      totalFormFields: 0,
      mappingSuccessRate: 0,
      applicationSuccessRate: 0,
      lookupMethodStats: {},
      fieldTypeStats: {}
    }
  };

  try {
    // Step 1: Analyze incoming form data
    serverLog('INFO', "\n📥 STEP 1: ANALYZING FORM DATA STRUCTURE");
    serverLog('INFO', "-".repeat(50));

    const formAnalysis = analyzeFormData(formData);
    result.stats.totalFormFields = formAnalysis.totalFields;

    serverLog('INFO', `📊 Form analysis complete:`, {
      sections: formAnalysis.sections,
      totalFields: formAnalysis.totalFields,
      validFields: formAnalysis.validFields,
      section29Fields: formAnalysis.section29Fields
    });

    // Step 2: Fetch and load PDF template
    serverLog('INFO', "\n📄 STEP 2: FETCHING PDF TEMPLATE");
    serverLog('INFO', "-".repeat(50));

    const pdfDoc = await loadPdfTemplate();
    const form = pdfDoc.getForm();
    const allPdfFields = form.getFields();
    result.stats.totalPdfFields = allPdfFields.length;

    serverLog('INFO', `✅ PDF template loaded successfully`);
    serverLog('INFO', `📊 Total PDF fields: ${allPdfFields.length}`);

    // Step 3: Create field mappings
    serverLog('INFO', "\n🗂️ STEP 3: CREATING FIELD MAPPINGS");
    serverLog('INFO', "-".repeat(50));

    const fieldMappings = createFieldMappings(allPdfFields);
    serverLog('INFO', `✅ Field mappings created: ${fieldMappings.idMap.size} ID mappings, ${fieldMappings.nameMap.size} name mappings`);

    // Step 4: Extract and map form values
    serverLog('INFO', "\n🔍 STEP 4: EXTRACTING FORM VALUES");
    serverLog('INFO', "-".repeat(50));

    const formValues = extractFormValues(formData);
    result.fieldsMapped = formValues.size;

    serverLog('INFO', `✅ Form values extracted: ${formValues.size} valid fields`);
    serverLog('INFO', `📋 Sample field IDs:`, Array.from(formValues.keys()).slice(0, 10));

    // Step 5: Apply values to PDF fields
    serverLog('INFO', "\n🔧 STEP 5: APPLYING VALUES TO PDF FIELDS");
    serverLog('INFO', "-".repeat(50));

    const applicationResult = await applyValuesToPdf(allPdfFields, fieldMappings, formValues);
    result.fieldsApplied = applicationResult.applied;
    result.errors = applicationResult.errors;
    result.warnings = applicationResult.warnings;
    result.stats.lookupMethodStats = applicationResult.lookupMethodStats;
    result.stats.fieldTypeStats = applicationResult.fieldTypeStats;

    // Step 6: Generate final PDF
    serverLog('INFO', "\n💾 STEP 6: GENERATING FINAL PDF");
    serverLog('INFO', "-".repeat(50));

    const pdfBytes = await pdfDoc.save();
    result.pdfBytes = new Uint8Array(pdfBytes);

    serverLog('INFO', `✅ PDF generated successfully`);
    serverLog('INFO', `📊 Final PDF size: ${pdfBytes.byteLength} bytes (${(pdfBytes.byteLength / 1024 / 1024).toFixed(2)} MB)`);

    // Calculate final statistics
    result.stats.mappingSuccessRate = (result.fieldsMapped / result.stats.totalFormFields) * 100;
    result.stats.applicationSuccessRate = (result.fieldsApplied / result.fieldsMapped) * 100;
    result.success = true;

    // Final summary
    serverLog('INFO', "\n🎉 PDF GENERATION COMPLETED SUCCESSFULLY");
    serverLog('INFO', "=".repeat(80));
    serverLog('INFO', `📊 FINAL SUMMARY:`);
    serverLog('INFO', `   📈 Form fields processed: ${result.stats.totalFormFields}`);
    serverLog('INFO', `   🗂️ Fields mapped: ${result.fieldsMapped}`);
    serverLog('INFO', `   ✅ Fields applied: ${result.fieldsApplied}`);
    serverLog('INFO', `   📊 Application success rate: ${result.stats.applicationSuccessRate.toFixed(2)}%`);
    serverLog('INFO', `   ❌ Errors: ${result.errors.length}`);
    serverLog('INFO', `   ⚠️ Warnings: ${result.warnings.length}`);
    serverLog('INFO', "=".repeat(80) + "\n");

    return result;

  } catch (error) {
    serverLog('ERROR', "\n💥 FATAL ERROR DURING PDF GENERATION");
    serverLog('ERROR', "-".repeat(50));
    serverLog('ERROR', `❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    serverLog('ERROR', `📍 Stack trace:`, error instanceof Error ? error.stack : 'No stack trace');

    result.errors.push(`Server PDF generation failed: ${error}`);
    return result;
  }
}

/**
 * Analyze form data structure
 */
function analyzeFormData(formData: ApplicantFormValues) {
  serverLog('INFO', "🔍 Analyzing form data structure...");

  const analysis = {
    sections: Object.keys(formData),
    totalFields: 0,
    validFields: 0,
    section29Fields: 0
  };

  function countFields(obj: any, path = ''): void {
    if (!obj || typeof obj !== 'object') return;

    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;

      if (value && typeof value === 'object') {
        if ('id' in value && 'value' in value) {
          analysis.totalFields++;
          if (value.id && value.value !== undefined && value.value !== '') {
            analysis.validFields++;
            if (currentPath.includes('section29')) {
              analysis.section29Fields++;
            }
          }
        } else {
          countFields(value, currentPath);
        }
      }
    });
  }

  countFields(formData);

  serverLog('INFO', `📊 Form structure:`, {
    sections: analysis.sections.length,
    totalFields: analysis.totalFields,
    validFields: analysis.validFields,
    section29Fields: analysis.section29Fields
  });

  return analysis;
}

/**
 * Load PDF template from URL
 */
async function loadPdfTemplate(): Promise<PDFDocument> {
  serverLog('INFO', `🌐 Fetching PDF template from: ${SF86_PDF_URL}`);

  const response = await fetch(SF86_PDF_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
  }

  const pdfBytes = await response.arrayBuffer();
  serverLog('INFO', `📄 PDF template fetched: ${pdfBytes.byteLength} bytes`);

  const pdfDoc = await PDFDocument.load(pdfBytes);
  serverLog('INFO', `✅ PDF document loaded successfully`);

  return pdfDoc;
}

/**
 * Create field mapping structures
 */
function createFieldMappings(pdfFields: any[]) {
  serverLog('INFO', "🗂️ Creating field mapping structures...");

  const idMap = new Map<string, any>();
  const nameMap = new Map<string, string>();

  pdfFields.forEach(field => {
    const name = field.getName();
    const numericId = field.ref.tag.toString();

    idMap.set(numericId, field);
    nameMap.set(name, numericId);
  });

  // Log Section 29 specific mappings
  const section29Mappings = Array.from(nameMap.entries())
    .filter(([name]) => name.includes('Section29'))
    .slice(0, 10);

  serverLog('INFO', `🎯 Sample Section 29 mappings:`, section29Mappings);

  return { idMap, nameMap };
}

/**
 * Extract form values from nested form data
 */
function extractFormValues(formData: ApplicantFormValues): Map<string, any> {
  serverLog('INFO', "🔍 Extracting form values from nested structure...");

  const formValues = new Map<string, any>();
  let processedCount = 0;

  function traverse(obj: any, path = '', depth = 0): void {
    if (!obj || typeof obj !== 'object') return;

    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;

      if (value && typeof value === 'object') {
        if ('id' in value && 'value' in value) {
          processedCount++;
          const isVerbose = processedCount <= 20; // Detailed logging for first 20 fields

          if (isVerbose) {
            serverLog('INFO', `🎯 Field found at ${currentPath}:`, {
              id: value.id,
              value: value.value,
              type: typeof value.value
            });
          }

          if (value.id && value.value !== undefined && value.value !== '' && value.value !== null) {
            formValues.set(String(value.id), value.value);

            if (isVerbose) {
              serverLog('INFO', `✅ Mapped: "${value.id}" → "${value.value}"`);
            }
          }
        } else {
          traverse(value, currentPath, depth + 1);
        }
      }
    });
  }

  traverse(formData);

  serverLog('INFO', `✅ Form value extraction complete: ${formValues.size} valid fields`);
  return formValues;
}

/**
 * Apply form values to PDF fields with comprehensive logging
 */
async function applyValuesToPdf(
  pdfFields: any[],
  fieldMappings: { idMap: Map<string, any>; nameMap: Map<string, string> },
  formValues: Map<string, any>
) {
  serverLog('INFO', `🔧 Starting field application process...`);
  serverLog('INFO', `📊 PDF fields available: ${pdfFields.length}`);
  serverLog('INFO', `📊 Form values to apply: ${formValues.size}`);

  const stats = {
    applied: 0,
    skipped: 0,
    errors: 0,
    lookupMethodStats: {} as Record<string, number>,
    fieldTypeStats: {
      textField: { attempts: 0, success: 0 },
      dropdown: { attempts: 0, success: 0 },
      checkbox: { attempts: 0, success: 0 },
      radioGroup: { attempts: 0, success: 0 },
      unknown: { attempts: 0, success: 0 }
    }
  };

  const errors: string[] = [];
  const warnings: string[] = [];

  let processedCount = 0;
  for (const [fieldId, fieldValue] of formValues.entries()) {
    processedCount++;
    const isVerbose = processedCount <= 20; // Detailed logging for first 20 fields

    if (isVerbose) {
      serverLog('INFO', `\n--- Processing Field [${processedCount}/${formValues.size}] ---`);
      serverLog('INFO', `🆔 Field ID: "${fieldId}"`);
      serverLog('INFO', `💾 Field Value: "${fieldValue}"`);
    }

    // Try multiple lookup strategies
    let pdfField: any = null;
    let lookupMethod = '';

    // Strategy 1: Direct numeric ID lookup
    if (/^\d+/.test(fieldId) && fieldMappings.idMap.has(fieldId.replace(' 0 R', ''))) {
      const numericId = fieldId.replace(' 0 R', '');
      pdfField = fieldMappings.idMap.get(numericId);
      lookupMethod = 'direct-numeric-id';
      if (isVerbose) serverLog('INFO', `✅ Direct numeric ID lookup: "${numericId}"`);
    }
    // Strategy 2: Field name to numeric ID conversion
    else if (fieldMappings.nameMap.has(fieldId)) {
      const numericId = fieldMappings.nameMap.get(fieldId);
      if (numericId && fieldMappings.idMap.has(numericId)) {
        pdfField = fieldMappings.idMap.get(numericId);
        lookupMethod = 'name-to-numeric-id';
        if (isVerbose) serverLog('INFO', `✅ Name-to-ID conversion: "${fieldId}" → "${numericId}"`);
      }
    }
    // Strategy 3: Partial name matching
    else {
      const matchingField = pdfFields.find(f =>
        f.getName() === fieldId ||
        f.getName().includes(fieldId) ||
        fieldId.includes(f.getName())
      );

      if (matchingField) {
        pdfField = matchingField;
        lookupMethod = 'partial-name-match';
        if (isVerbose) serverLog('INFO', `✅ Partial name match: "${matchingField.getName()}"`);
      }
    }

    // Track lookup method effectiveness
    stats.lookupMethodStats[lookupMethod] = (stats.lookupMethodStats[lookupMethod] || 0) + 1;

    if (pdfField) {
      if (isVerbose) {
        serverLog('INFO', `✅ PDF field found! Method: ${lookupMethod}`);
        serverLog('INFO', `📊 PDF Field Type: ${pdfField.constructor.name}`);
        serverLog('INFO', `📛 PDF Field Name: "${pdfField.getName()}"`);
      }

      try {
        // Apply value based on field type
        if (pdfField instanceof PDFTextField) {
          stats.fieldTypeStats.textField.attempts++;
          const textValue = String(fieldValue);
          if (isVerbose) serverLog('INFO', `📝 Setting text field to: "${textValue}"`);
          pdfField.setText(textValue);
          stats.fieldTypeStats.textField.success++;
          stats.applied++;
        }
        else if (pdfField instanceof PDFDropdown || pdfField instanceof PDFRadioGroup) {
          const isDropdown = pdfField instanceof PDFDropdown;
          stats.fieldTypeStats[isDropdown ? 'dropdown' : 'radioGroup'].attempts++;

          const selectValue = String(fieldValue);
          if (isVerbose) serverLog('INFO', `📋 Setting ${isDropdown ? 'dropdown' : 'radio'} to: "${selectValue}"`);

          // Get available options
          let options: string[] = [];
          try {
            options = pdfField.getOptions();
            if (isVerbose) serverLog('INFO', `   📋 Available options:`, options);
          } catch (error) {
            if (isVerbose) serverLog('WARN', `   ⚠️ Could not get options:`, error);
            options = ['YES', 'NO', 'Yes', 'No ', 'true', 'false', '1', '0'];
          }

          // Enhanced option matching with special handling for "No " (pdf-lib requirement)
          let matchedValue = selectValue;
          if (options.length > 0) {
            // Try exact match first
            if (options.includes(selectValue)) {
              matchedValue = selectValue;
              if (isVerbose) serverLog('INFO', `   ✅ Exact match found`);
            } else {
              // Try case-insensitive match
              const caseMatch = options.find(opt => opt.toLowerCase() === selectValue.toLowerCase());
              if (caseMatch) {
                matchedValue = caseMatch;
                if (isVerbose) serverLog('INFO', `   🔄 Case-insensitive match: "${caseMatch}"`);
              } else {
                // Special handling for radio buttons with pdf-lib requirements
                const lowerValue = selectValue.toLowerCase();
                if (lowerValue === 'no' || lowerValue === 'false' || lowerValue === '0') {
                  // Look for "No " (with space) as required by pdf-lib
                  const noOption = options.find(opt =>
                    opt === 'No ' || opt.toLowerCase() === 'no' || opt === '0' || opt.toLowerCase() === 'false'
                  );
                  if (noOption) {
                    matchedValue = noOption;
                    if (isVerbose) serverLog('INFO', `   🔄 Mapped to NO option: "${noOption}"`);
                  }
                } else if (lowerValue === 'yes' || lowerValue === 'true' || lowerValue === '1') {
                  const yesOption = options.find(opt =>
                    opt === 'Yes' || opt.toLowerCase() === 'yes' || opt === '1' || opt.toLowerCase() === 'true'
                  );
                  if (yesOption) {
                    matchedValue = yesOption;
                    if (isVerbose) serverLog('INFO', `   🔄 Mapped to YES option: "${yesOption}"`);
                  }
                }
              }
            }
          }

          // Apply the value
          try {
            pdfField.select(matchedValue);
            if (isVerbose) serverLog('INFO', `   ✅ Successfully set to: "${matchedValue}"`);
            stats.fieldTypeStats[isDropdown ? 'dropdown' : 'radioGroup'].success++;
            stats.applied++;
          } catch (selectError) {
            if (isVerbose) serverLog('ERROR', `   ❌ Failed to select "${matchedValue}":`, selectError);
            stats.errors++;
            errors.push(`Failed to set ${isDropdown ? 'dropdown' : 'radio'} field ${pdfField.getName()}: ${selectError}`);
          }
        }
        else if (pdfField instanceof PDFCheckBox) {
          stats.fieldTypeStats.checkbox.attempts++;
          const strValue = String(fieldValue).toLowerCase();
          if (isVerbose) serverLog('INFO', `☑️ Setting checkbox, value: "${strValue}"`);

          if (strValue === "yes" || strValue === "true" || strValue === "1" || strValue === "checked") {
            pdfField.check();
          } else {
            pdfField.uncheck();
          }

          stats.fieldTypeStats.checkbox.success++;
          stats.applied++;
        }
        else {
          stats.fieldTypeStats.unknown.attempts++;
          if (isVerbose) serverLog('WARN', `⚠️ UNKNOWN FIELD TYPE: ${pdfField.constructor.name}`);
          warnings.push(`Unknown field type: ${pdfField.constructor.name} for field ${pdfField.getName()}`);
        }
      } catch (error) {
        if (isVerbose) serverLog('ERROR', `💥 ERROR setting field:`, error);
        stats.errors++;
        errors.push(`Error setting field ${pdfField.getName()}: ${error}`);
      }
    } else {
      if (isVerbose) serverLog('WARN', `❌ PDF field not found for ID: "${fieldId}"`);
      stats.skipped++;
      warnings.push(`PDF field not found: ${fieldId}`);
    }
  }

  // Log final statistics
  serverLog('INFO', "\n📊 FIELD APPLICATION STATISTICS");
  serverLog('INFO', "-".repeat(40));
  serverLog('INFO', `✅ Fields successfully applied: ${stats.applied}`);
  serverLog('INFO', `❌ Fields skipped (not found): ${stats.skipped}`);
  serverLog('INFO', `💥 Errors encountered: ${stats.errors}`);
  serverLog('INFO', `📈 Application success rate: ${((stats.applied / formValues.size) * 100).toFixed(2)}%`);

  serverLog('INFO', `\n📊 Lookup method effectiveness:`);
  Object.entries(stats.lookupMethodStats).forEach(([method, count]) => {
    const percentage = ((count / formValues.size) * 100).toFixed(1);
    serverLog('INFO', `   ${method}: ${count}/${formValues.size} (${percentage}%)`);
  });

  serverLog('INFO', `\n📊 Success by field type:`);
  Object.entries(stats.fieldTypeStats).forEach(([type, {attempts, success}]) => {
    if (attempts > 0) {
      const rate = ((success/attempts)*100).toFixed(1);
      serverLog('INFO', `   ${type}: ${success}/${attempts} (${rate}%)`);
    }
  });

  return {
    applied: stats.applied,
    errors,
    warnings,
    lookupMethodStats: stats.lookupMethodStats,
    fieldTypeStats: stats.fieldTypeStats
  };
}
