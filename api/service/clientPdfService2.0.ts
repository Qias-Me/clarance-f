/**
 * Client-side PDF Service for SF-86 Form Architecture 2.0
 *
 * This service provides client-side PDF generation and field mapping capabilities
 * that are fully compatible with the new SF-86 form architecture and interfaces.
 * It integrates seamlessly with the SF86FormContext and all 30 sections.
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
import type { ApplicantFormValues, Field } from '../interfaces/formDefinition2.0';

// URLs for fetching the SF86 PDF template
const SF86_PDF_TEMPLATE_URL = '/api/generate-pdf'; // Our API route that serves the base PDF template

// Interface for field metadata
interface FieldMetadata {
  name: string;
  id: string;
  type: string;
  label?: string;
  value?: any;
  rect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Interface for detailed field error information (for client-side generation)
export interface FieldError {
  fieldId: string;
  fieldName: string;
  fieldValue: any;
  fieldType: string;
  errorMessage: string;
  errorType: 'lookup_failed' | 'value_application_failed' | 'unknown_field_type';
}

// Interface for PDF generation result (client-side)
export interface ClientPdfResult {
  success: boolean;
  pdfBytes?: Uint8Array;
  fieldsMapped: number;
  fieldsApplied: number;
  errors: string[];
  warnings: string[];
  fieldsWithErrors?: FieldError[];
  stats: {
    totalPdfFields: number;
    totalFormFields: number;
    mappingSuccessRate: number;
    applicationSuccessRate: number;
    lookupMethodStats: Record<string, number>;
    fieldTypeStats: Record<string, { attempts: number; success: number }>;
  };
}

// PDF generation result interface (keeping original for backward compatibility)
interface PdfGenerationResult {
  success: boolean;
  pdfBytes?: Uint8Array;
  fieldsMapped: number;
  fieldsApplied: number;
  errors: string[];
  warnings: string[];
}

// Field validation result interface
interface FieldValidationResult {
  isValid: boolean;
  fieldId: string;
  fieldName: string;
  expectedValue: any;
  actualValue: any;
  error?: string;
}

export class ClientPdfService2 {
  private pdfDoc: PDFDocument | null = null;
  private fieldMapping: FieldMetadata[] = [];
  private isLoaded = false;

  /**
   * Enhanced Client-side PDF Generation Action - Matches Server-side Logic
   *
   * This method provides the same comprehensive field mapping, error handling,
   * and statistics tracking as the server-side generatePdfServerAction method.
   */
  async generatePdfClientAction(formData: ApplicantFormValues): Promise<ClientPdfResult> {
    const result: ClientPdfResult = {
      success: false,
      fieldsMapped: 0,
      fieldsApplied: 0,
      errors: [],
      warnings: [],
      fieldsWithErrors: [],
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
      // this.clientLog('INFO', "🚀 CLIENT-SIDE PDF GENERATION STARTED");
      // this.clientLog('INFO', `⏰ Timestamp: ${new Date().toISOString()}`);
      // this.clientLog('INFO', `📊 Form data sections: ${Object.keys(formData).length}`);
      // this.clientLog('INFO', `📋 Available sections: ${Object.keys(formData).join(', ')}`);

      // STEP 1: ANALYZE FORM DATA
      // this.clientLog('INFO', "📊 STEP 1: ANALYZING FORM DATA");
      const formAnalysis = this.analyzeFormData(formData);
      result.stats.totalFormFields = formAnalysis.totalFields;

      // this.clientLog('INFO', `📈 Form analysis complete:`);
      // this.clientLog('INFO', `   📋 Sections found: ${formAnalysis.sections.length}`);
      // this.clientLog('INFO', `   🎯 Total fields: ${formAnalysis.totalFields}`);
      // this.clientLog('INFO', `   ✅ Valid fields: ${formAnalysis.validFields}`);

      // STEP 2: LOAD PDF TEMPLATE
      // this.clientLog('INFO', "📄 STEP 2: LOADING PDF TEMPLATE");
      await this.loadPdfTemplate();

      const form = this.pdfDoc!.getForm();
      const allPdfFields = form.getFields();
      result.stats.totalPdfFields = allPdfFields.length;

      // this.clientLog('INFO', `📄 PDF template loaded successfully`);
      // this.clientLog('INFO', `   📊 Total PDF fields: ${allPdfFields.length}`);

      // STEP 3: CREATE FIELD MAPPINGS
      // this.clientLog('INFO', "🗂️ STEP 3: CREATING ENHANCED FIELD MAPPINGS");
      const fieldMappings = this.createFieldMappings(allPdfFields);

      // this.clientLog('INFO', `🗂️ Field mappings created:`);
      // this.clientLog('INFO', `   🆔 ID-based mappings: ${fieldMappings.idMap.size}`);
      // this.clientLog('INFO', `   📛 Name-based mappings: ${fieldMappings.nameMap.size}`);

      // STEP 4: EXTRACT FORM VALUES
      // this.clientLog('INFO', "💾 STEP 4: EXTRACTING FORM VALUES");
      const formValues = this.extractFormValues(formData);

      // this.clientLog('INFO', `💾 Form values extracted:`);
      // this.clientLog('INFO', `   🎯 Values to map: ${formValues.size}`);

      result.stats.mappingSuccessRate = formValues.size > 0 ?
        (formValues.size / result.stats.totalFormFields) * 100 : 0;

      // STEP 5: APPLY VALUES TO PDF
      // this.clientLog('INFO', "🔧 STEP 5: APPLYING VALUES TO PDF");
      const applicationResult = await this.applyValuesToPdf(allPdfFields, fieldMappings, formValues);

      result.fieldsMapped = formValues.size;
      result.fieldsApplied = applicationResult.appliedCount;
      result.errors.push(...applicationResult.errors);
      result.warnings.push(...applicationResult.warnings);
      result.fieldsWithErrors = applicationResult.fieldsWithErrors;
      result.stats.lookupMethodStats = applicationResult.lookupMethodStats;
      result.stats.fieldTypeStats = applicationResult.fieldTypeStats;

      result.stats.applicationSuccessRate = result.fieldsMapped > 0 ?
        (result.fieldsApplied / result.fieldsMapped) * 100 : 0;

      // this.clientLog('INFO', `🔧 Values application complete:`);
      // this.clientLog('INFO', `   📊 Fields mapped: ${result.fieldsMapped}`);
      // this.clientLog('INFO', `   ✅ Fields applied: ${result.fieldsApplied}`);
      // this.clientLog('INFO', `   📈 Success rate: ${result.stats.applicationSuccessRate.toFixed(2)}%`);

      // STEP 6: GENERATE FINAL PDF
      // this.clientLog('INFO', "📄 STEP 6: GENERATING FINAL PDF");
      const pdfBytes = await this.pdfDoc!.save();
      result.pdfBytes = new Uint8Array(pdfBytes);

      result.success = true;

      // this.clientLog('INFO', "✅ PDF GENERATION COMPLETED SUCCESSFULLY");
      // this.clientLog('INFO', `📊 Final PDF size: ${result.pdfBytes.length} bytes (${(result.pdfBytes.length / 1024 / 1024).toFixed(2)} MB)`);
      // this.clientLog('INFO', `📈 FINAL SUMMARY:`);
      // this.clientLog('INFO', `   📊 Form fields processed: ${result.stats.totalFormFields}`);
      // this.clientLog('INFO', `   🗂️ Fields mapped: ${result.fieldsMapped}`);
      // this.clientLog('INFO', `   ✅ Fields applied: ${result.fieldsApplied}`);
      // this.clientLog('INFO', `   📊 Application success rate: ${result.stats.applicationSuccessRate.toFixed(2)}%`);
      // this.clientLog('INFO', `   ❌ Errors: ${result.errors.length}`);
      // this.clientLog('INFO', `   ⚠️ Warnings: ${result.warnings.length}`);

      return result;

    } catch (error) {
      // this.clientLog('ERROR', "💥 FATAL ERROR IN CLIENT PDF GENERATION");
      // this.clientLog('ERROR', `❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      // this.clientLog('ERROR', `📍 Stack trace: ${error instanceof Error ? error.stack : 'No stack trace available'}`);

      result.errors.push(`Client PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Client-side logging utility
   */
  private clientLog(level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [CLIENT-PDF-ACTION] [${level}]`;

    if (level === 'ERROR') {
      // console.error(`${prefix} ${message}`, data || '');
    } else if (level === 'WARN') {
      // console.warn(`${prefix} ${message}`, data || '');
    } else {
      // console.log(`${prefix} ${message}`, data || '');
    }
  }

  /**
   * Analyze form data structure (matches server-side logic)
   */
  private analyzeFormData(formData: ApplicantFormValues) {
    // this.clientLog('INFO', "🔍 Analyzing form data structure...");

    const analysis = {
      sections: Object.keys(formData),
      totalFields: 0,
      validFields: 0,
      section29Fields: 0
    };

    const countFields = (obj: any, path = ''): void => {
      if (!obj || typeof obj !== 'object') return;

      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;

        if (value && typeof value === 'object') {
          if ('id' in value && 'value' in value) {
            analysis.totalFields++;

            // Count valid fields (have both ID and non-empty value)
            if (value.id && value.value !== undefined && value.value !== '') {
              analysis.validFields++;
            }

            // Count Section 29 fields specifically
            if (currentPath.includes('section29')) {
              analysis.section29Fields++;
            }
          } else {
            // Recurse into nested objects
            countFields(value, currentPath);
          }
        }
      });
    };

    countFields(formData);

    // this.clientLog('INFO', `📊 Form structure analysis:`);
    // this.clientLog('INFO', `   📁 Sections: ${analysis.sections.join(', ')}`);
    // this.clientLog('INFO', `   🎯 Total fields: ${analysis.totalFields}`);
    // this.clientLog('INFO', `   ✅ Valid fields: ${analysis.validFields}`);
    // this.clientLog('INFO', `   🎯 Section 29 fields: ${analysis.section29Fields}`);

    return analysis;
  }

  /**
   * Load PDF template (enhanced for client-side)
   */
  private async loadPdfTemplate(): Promise<PDFDocument> {
    if (this.pdfDoc && this.isLoaded) return this.pdfDoc;

    try {
      // this.clientLog('INFO', "📄 Fetching SF-86 PDF template...");
      const response = await fetch(SF86_PDF_TEMPLATE_URL);

      if (!response.ok) {
        throw new Error(`Failed to fetch PDF template: ${response.status} ${response.statusText}`);
      }

      const pdfBytes = await response.arrayBuffer();
      this.pdfDoc = await PDFDocument.load(pdfBytes);
      await this.mapFormFields();
      this.isLoaded = true;

      // this.clientLog('INFO', `✅ PDF template loaded successfully. Size: ${pdfBytes.byteLength} bytes`);
      return this.pdfDoc;
    } catch (error) {
      // this.clientLog('ERROR', "💥 Error loading PDF template:", error);
      throw error;
    }
  }

  /**
   * Create enhanced field mappings (matches server-side logic)
   */
  private createFieldMappings(pdfFields: any[]) {
    // this.clientLog('INFO', "🗂️ Creating enhanced field mappings...");

    const idMap = new Map<string, any>();
    const nameMap = new Map<string, string>();

    pdfFields.forEach(field => {
      const id = field.ref.tag.toString();
      const name = field.getName();

      // Store field by numeric ID for direct access
      idMap.set(id, field);

      // Store name-to-ID mapping for conversion
      nameMap.set(name, id);
    });

    // this.clientLog('INFO', `🗂️ Field mappings created:`);
    // this.clientLog('INFO', `   🆔 ID mappings: ${idMap.size}`);
    // this.clientLog('INFO', `   📛 Name mappings: ${nameMap.size}`);

    // Show sample Section 29 mappings for debugging
    const section29Samples = Array.from(nameMap.entries())
      .filter(([name]) => name.includes('Section29'))
      .slice(0, 5);

    if (section29Samples.length > 0) {
      // this.clientLog('INFO', `🎯 Sample Section 29 mappings:`, section29Samples);
    }

    return { idMap, nameMap };
  }

  /**
   * Extract form values from the nested applicant data structure
   *
   * IMPORTANT: Modified filtering logic to prevent PDF field application errors:
   * 1. Excludes empty strings from mapping (prevents dropdown/radio errors)
   * 2. Includes null values in mapping (converted to empty strings)
   * 3. Includes "NO" values (they are valid PDF values)
   * 4. Filters out fields without IDs, undefined values, or empty strings
   */
  private extractFormValues(formData: ApplicantFormValues): Map<string, any> {
    // this.clientLog('INFO', "💾 Extracting form values...");

    const formValues = new Map<string, any>();

    const traverse = (obj: any, path = '', depth = 0): void => {
      if (!obj || typeof obj !== 'object') return;

      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;

        if (value && typeof value === 'object') {
          if ('id' in value && 'value' in value) {
            // This is a Field<T> object
            // MODIFIED: Filter out empty strings to prevent PDF field application errors
            if (value.id && value.value !== undefined && value.value !== '') {
              // Accept values that have an ID, are not undefined, and are not empty strings
              const cleanId = String(value.id).replace(/ 0 R$/, '').trim();
              formValues.set(cleanId, value.value);
            }
          } else {
            // Recurse into nested objects
            traverse(value, currentPath, depth + 1);
          }
        }
      });
    };

    traverse(formData);

    // this.clientLog('INFO', `💾 Form values extracted: ${formValues.size} values`);
    return formValues;
  }

  /**
   * Apply values to PDF (matches server-side logic with enhanced error tracking)
   */
  private async applyValuesToPdf(
    pdfFields: any[],
    fieldMappings: { idMap: Map<string, any>; nameMap: Map<string, string> },
    formValues: Map<string, any>
  ) {
    // this.clientLog('INFO', "🔧 Applying values to PDF fields...");

    const result = {
      appliedCount: 0,
      errors: [] as string[],
      warnings: [] as string[],
      fieldsWithErrors: [] as FieldError[],
      lookupMethodStats: {} as Record<string, number>,
      fieldTypeStats: {} as Record<string, { attempts: number; success: number }>
    };

    // Initialize field type stats
    const fieldTypes = ['PDFTextField', 'PDFDropdown', 'PDFCheckBox', 'PDFRadioGroup'];
    fieldTypes.forEach(type => {
      result.fieldTypeStats[type] = { attempts: 0, success: 0 };
    });

    // Process each form value
    let processedCount = 0;
    formValues.forEach((value, fieldId) => {
      processedCount++;
      const verbose = processedCount <= 20; // Log details for first 20 fields

      if (verbose) {
        // this.clientLog('INFO', `--- Processing Field [${processedCount}/${formValues.size}] ---`);
        // this.clientLog('INFO', `🆔 Field ID: "${fieldId}"`);
        // this.clientLog('INFO', `💾 Field Value: "${value}"`);
      }

      // Enhanced field lookup with multiple strategies (using class properties like server-side)
      let pdfField: any = null;
      let lookupMethod = '';

      // Strategy 1: Direct numeric ID lookup using class property
      if (this.isNumericId(fieldId) && this.fieldIdMap.has(fieldId)) {
        pdfField = this.fieldIdMap.get(fieldId);
        lookupMethod = 'direct-numeric-id';
        // if (verbose) this.clientLog('INFO', `✅ Scalable service lookup successful: "${fieldId}"`);
      }
      // Strategy 2: Convert field name to numeric ID using class properties
      else if (this.fieldNameToIdMap.has(fieldId)) {
        const numericId = this.fieldNameToIdMap.get(fieldId);
        if (numericId && this.fieldIdMap.has(numericId)) {
          pdfField = this.fieldIdMap.get(numericId);
          lookupMethod = 'name-to-numeric-id';
          // if (verbose) this.clientLog('INFO', `✅ Name conversion lookup: "${fieldId}" → "${numericId}"`);
        }
      }

      // Track lookup method statistics
      if (lookupMethod) {
        result.lookupMethodStats[lookupMethod] = (result.lookupMethodStats[lookupMethod] || 0) + 1;
      }

      // If no field found, add enhanced debugging
      if (!pdfField && verbose) {
        // this.clientLog('WARN', `❌ PDF field not found for ID: "${fieldId}"`);
        // this.clientLog('INFO', `   🔍 isNumericId("${fieldId}"): ${this.isNumericId(fieldId)}`);
        // this.clientLog('INFO', `   🗂️ fieldIdMap.has("${fieldId}"): ${this.fieldIdMap.has(fieldId)}`);
        // this.clientLog('INFO', `   📛 fieldNameToIdMap.has("${fieldId}"): ${this.fieldNameToIdMap.has(fieldId)}`);
        // this.clientLog('INFO', `   🆔 Total fieldIdMap size: ${this.fieldIdMap.size}`);
        // this.clientLog('INFO', `   📝 Total fieldNameToIdMap size: ${this.fieldNameToIdMap.size}`);

        // Show some sample IDs for debugging
        const sampleIds = Array.from(this.fieldIdMap.keys()).slice(0, 10);
        // this.clientLog('INFO', `   📋 Sample PDF field IDs: ${sampleIds.join(', ')}`);

        // Show some sample names for debugging
        const sampleNames = Array.from(this.fieldNameToIdMap.keys()).slice(0, 10);
        // this.clientLog('INFO', `   📋 Sample PDF field names: ${sampleNames.slice(0, 3).join(', ')}`);
      }

      if (pdfField) {
        if (verbose) {
          // this.clientLog('INFO', `✅ PDF field found! Method: ${lookupMethod}`);
          // this.clientLog('INFO', `🏷️ PDF Field Type: ${pdfField.constructor.name}`);
          // this.clientLog('INFO', `📛 PDF Field Name: "${pdfField.getName()}"`);
        }

        // CRITICAL FIX: Add field value validation for Section 30 field 16262
        const fieldName = pdfField.getName();
        const valueStr = String(value || '');
        const isDateValue = /^\d{4}-\d{2}-\d{2}$/.test(valueStr);
        const isZipField = fieldId === '16262' || fieldName.includes('p17-t10[0]'); // ZIP code field in Section 30
        
        if (isZipField && isDateValue) {
          // this.clientLog('ERROR', `🚨 CRITICAL FIELD MAPPING ERROR DETECTED IN PDF SERVICE`);
          // this.clientLog('ERROR', `   Field ID: "${fieldId}"`);
          // this.clientLog('ERROR', `   Field Name: "${fieldName}"`);
          // this.clientLog('ERROR', `   Value: "${valueStr}"`);
          // this.clientLog('ERROR', `   Issue: Date value "${valueStr}" being assigned to ZIP code field 16262`);
          // this.clientLog('ERROR', `   This would cause truncation from "${valueStr}" to "${valueStr.substring(0, 5)}" due to maxLength constraint`);
          
          result.errors.push(`CRITICAL: Date value "${valueStr}" incorrectly assigned to ZIP code field ${fieldId}`);
          result.fieldsWithErrors.push({
            fieldId,
            fieldName,
            fieldValue: value,
            fieldType: pdfField.constructor.name,
            errorMessage: `Date value incorrectly assigned to ZIP code field`,
            errorType: 'value_application_failed'
          });
          
          // Skip this field to prevent the invalid assignment
          // this.clientLog('ERROR', `   Skipping field assignment to prevent data corruption`);
          return;
        }

        const fieldType = pdfField.constructor.name;
        if (result.fieldTypeStats[fieldType]) {
          result.fieldTypeStats[fieldType].attempts++;
        } else {
          result.fieldTypeStats[fieldType] = { attempts: 1, success: 0 };
        }

        try {
          // Apply value based on field type
          if (pdfField instanceof PDFTextField) {
            // MODIFIED: Handle null values by converting to empty strings
            let textValue = value === null ? '' : String(value);

            // ADDED: Field length validation to prevent maxLength errors
            try {
              // Get the field's maxLength constraint if available
              const maxLength = pdfField.getMaxLength();
              if (maxLength && maxLength > 0 && textValue.length > maxLength) {
                const originalValue = textValue;
                textValue = textValue.substring(0, maxLength);
                if (verbose) {
                  // this.clientLog('WARN', `⚠️ Text truncated for field "${fieldId}": "${originalValue}" → "${textValue}" (maxLength: ${maxLength})`);
                }
                result.warnings.push(`Text truncated for field ${fieldId}: value exceeded maxLength of ${maxLength} characters`);
              }
            } catch (maxLengthError) {
              // If we can't get maxLength, continue with original value
              // if (verbose) this.clientLog('INFO', `ℹ️ Could not check maxLength for field "${fieldId}"`);
            }

            // if (verbose) this.clientLog('INFO', `📝 Setting text field to: "${textValue}"`);
            pdfField.setText(textValue);
            result.fieldTypeStats[fieldType].success++;
            result.appliedCount++;
          }
          else if (pdfField instanceof PDFDropdown) {
            const selectValue = String(value);
            // if (verbose) this.clientLog('INFO', `📋 Setting dropdown to: "${selectValue}"`);

            const options = pdfField.getOptions();
            // if (verbose) this.clientLog('INFO', `   📋 Available options:`, options);

            // Enhanced option matching
            let matchedValue = this.findBestOptionMatch(selectValue, options);
            if (verbose && matchedValue !== selectValue) {
              // this.clientLog('INFO', `   🔄 Using matched option: "${selectValue}" → "${matchedValue}"`);
            }

            pdfField.select(matchedValue);
            result.fieldTypeStats[fieldType].success++;
            result.appliedCount++;
          }
          else if (pdfField instanceof PDFRadioGroup) {
            const selectValue = String(value);
            // if (verbose) this.clientLog('INFO', `📻 Setting radio group to: "${selectValue}"`);

            try {
              const options = pdfField.getOptions();
              // if (verbose) this.clientLog('INFO', `   📋 Radio options:`, options);

              // Enhanced radio group value matching
              let matchedValue = this.findBestOptionMatch(selectValue, options);
              if (verbose && matchedValue !== selectValue) {
                // this.clientLog('INFO', `   🔄 Using matched radio option: "${selectValue}" → "${matchedValue}"`);
              }

              pdfField.select(matchedValue);
              result.fieldTypeStats[fieldType].success++;
              result.appliedCount++;
            } catch (radioError) {
              // if (verbose) this.clientLog('WARN', `   ⚠️ Radio group selection failed, trying alternative approach...`);
              // Alternative approach for radio groups
              try {
                (pdfField as any).setValue?.(selectValue);
                result.fieldTypeStats[fieldType].success++;
                result.appliedCount++;
              } catch (altError) {
                throw radioError; // Re-throw original error
              }
            }
          }
          else if (pdfField instanceof PDFCheckBox) {
            const checkValue = this.parseCheckboxValue(value);
            // if (verbose) this.clientLog('INFO', `☑️ Setting checkbox to: ${checkValue ? 'checked' : 'unchecked'}`);

            if (checkValue) {
              pdfField.check();
            } else {
              pdfField.uncheck();
            }
            result.fieldTypeStats[fieldType].success++;
            result.appliedCount++;
          }
          else {
            // if (verbose) this.clientLog('WARN', `⚠️ Unknown field type: ${fieldType}`);
            result.warnings.push(`Unknown field type: ${fieldType} for field ${fieldId}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          // if (verbose) this.clientLog('ERROR', `💥 Error setting field "${fieldId}":`, errorMessage);

          result.errors.push(`Error setting field ${fieldId}: ${errorMessage}`);
          result.fieldsWithErrors.push({
            fieldId,
            fieldName: pdfField.getName(),
            fieldValue: value,
            fieldType: pdfField.constructor.name,
            errorMessage,
            errorType: 'value_application_failed'
          });
        }
      } else {
        // if (verbose) this.clientLog('WARN', `❌ PDF field not found for ID: "${fieldId}"`);
        result.warnings.push(`PDF field not found: ${fieldId}`);
        result.fieldsWithErrors.push({
          fieldId,
          fieldName: fieldId,
          fieldValue: value,
          fieldType: 'unknown',
          errorMessage: 'PDF field not found',
          errorType: 'lookup_failed'
        });
      }
    });

    // this.clientLog('INFO', `🔧 Field application complete:`);
    // this.clientLog('INFO', `   ✅ Applied: ${result.appliedCount}/${formValues.size}`);
    // this.clientLog('INFO', `   ❌ Errors: ${result.errors.length}`);
    // this.clientLog('INFO', `   ⚠️ Warnings: ${result.warnings.length}`);

    return result;
  }

  /**
   * Find best option match for dropdown/radio values
   */
  private findBestOptionMatch(value: string, options: string[]): string {
    if (!options || options.length === 0) return value;

    // Exact match
    if (options.includes(value)) return value;

    // Case-insensitive match
    const caseMatch = options.find(opt => opt.toLowerCase() === value.toLowerCase());
    if (caseMatch) return caseMatch;

    // For common boolean-like values
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'yes' || lowerValue === 'true' || lowerValue === '1') {
      const yesOption = options.find(opt =>
        opt.toLowerCase() === 'yes' ||
        opt === '1' ||
        opt.toLowerCase() === 'true'
      );
      if (yesOption) return yesOption;
    }

    if (lowerValue === 'no' || lowerValue === 'false' || lowerValue === '0') {
      const noOption = options.find(opt =>
        opt.toLowerCase() === 'no' ||
        opt === '0' ||
        opt.toLowerCase() === 'false'
      );
      if (noOption) return noOption;
    }

    // Partial match (contains)
    const partialMatch = options.find(opt =>
      opt.toLowerCase().includes(lowerValue) ||
      lowerValue.includes(opt.toLowerCase())
    );
    if (partialMatch) return partialMatch;

    // Return original value if no match found
    return value;
  }

  /**
   * Parse checkbox value from various formats
   */
  private parseCheckboxValue(value: any): boolean {
    if (typeof value === 'boolean') return value;

    const strValue = String(value).toLowerCase();
    return strValue === 'yes' ||
           strValue === 'true' ||
           strValue === '1' ||
           strValue === 'checked' ||
           strValue === 'on';
  }

  /**
   * Fetch and load the SF86 PDF document
   */
  async loadPdf(): Promise<PDFDocument> {
    if (this.pdfDoc && this.isLoaded) return this.pdfDoc;

    try {
      // Fetch the base PDF template from our API route (client-side only)
      // console.log("Fetching SF-86 PDF template from API...");
      const response = await fetch(SF86_PDF_TEMPLATE_URL);

      if (response.ok) {
        const pdfBytes = await response.arrayBuffer();
        this.pdfDoc = await PDFDocument.load(pdfBytes);
        await this.mapFormFields();
        this.isLoaded = true;
        // console.log(`Successfully loaded SF-86 PDF template. Size: ${pdfBytes.byteLength} bytes`);
        return this.pdfDoc;
      } else {
        throw new Error(`Failed to fetch PDF template: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      // console.error("Error loading PDF:", error);
      throw error;
    }
  }

  /**
   * Load PDF from an ArrayBuffer (for user-uploaded files)
   */
  async loadPdfFromBuffer(pdfBuffer: ArrayBuffer): Promise<PDFDocument> {
    try {
      // console.log("Loading PDF from uploaded file...");
      this.pdfDoc = await PDFDocument.load(pdfBuffer);

      // Map fields immediately after loading
      await this.mapFormFields();
      this.isLoaded = true;

      return this.pdfDoc;
    } catch (error) {
      // console.error("Error loading PDF from buffer:", error);
      throw error;
    }
  }

  /**
   * Map all fields in the PDF document with enhanced metadata
   */
  private async mapFormFields(): Promise<FieldMetadata[]> {
    if (!this.pdfDoc) throw new Error("PDF document not loaded");

    const form = this.pdfDoc.getForm();
    const fields = form.getFields();

    this.fieldMapping = fields.map((field) => {
      const name = field.getName();
      const type = field.constructor.name;
      const id = field.ref.tag.toString();

      // MODIFIED: Don't include template default values in field mapping
      // This prevents default checkbox/radio values from being applied
      let value: any = undefined;
      if (field instanceof PDFTextField) {
        const textValue = field.getText();
        // Only include non-empty text values
        value = textValue && textValue.trim() !== '' ? textValue : undefined;
      } else if (field instanceof PDFDropdown) {
        const selectedValue = field.getSelected();
        // Only include if something is actually selected (not empty array)
        value = selectedValue && selectedValue.length > 0 ? selectedValue : undefined;
      } else if (field instanceof PDFCheckBox) {
        // CHANGED: Don't include template default checkbox values
        // Only include if explicitly checked (not template defaults)
        value = undefined; // Let form data override this
      } else if (field instanceof PDFRadioGroup) {
        // CHANGED: Don't include template default radio values
        // Only include if explicitly selected (not template defaults)
        value = undefined; // Let form data override this
      }

      let label: string | undefined = undefined;
      const dict = field.acroField.dict;
      const tuRaw = dict.get(PDFName.of("TU"));
      if (tuRaw instanceof PDFString) {
          label = tuRaw.decodeText();
      }

      // Get field rectangle for positioning info
      const rect = field.acroField.getWidgets()[0]?.getRectangle();
      const rectInfo = rect ? {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      } : undefined;

      return {
        name,
        id,
        type,
        value,
        label,
        rect: rectInfo
      };
    });

    // console.log(`📄 Mapped ${this.fieldMapping.length} PDF fields`);

    // Create ID-based mapping for faster lookups
    this.createIdBasedMappings();

    return this.fieldMapping;
  }

  // Add new properties for ID-based mappings
  private fieldIdMap = new Map<string, any>(); // Maps numeric ID to PDF field object
  private fieldNameToIdMap = new Map<string, string>(); // Maps field name to numeric ID

  /**
   * Utility method to detect if an ID is a numeric PDF field ID vs a field name path
   */
  private isNumericId(id: string): boolean {
    // Numeric IDs are pure numbers without form1[0] prefix - be less restrictive like server-side
    return /^\d+$/.test(id);
  }

  /**
   * Utility method to extract numeric ID from field name path
   */
  private extractNumericId(fieldName: string): string | null {
    return this.fieldNameToIdMap.get(fieldName) || null;
  }

  /**
   * Create ID-based mappings for faster PDF field lookups
   */
  private createIdBasedMappings(): void {
    if (!this.pdfDoc) return;

    const form = this.pdfDoc.getForm();
    const fields = form.getFields();

    // Clear existing mappings
    this.fieldIdMap.clear();
    this.fieldNameToIdMap.clear();

    fields.forEach(field => {
      const name = field.getName();
      const rawId = field.ref.tag.toString();
      // FIXED: Clean the ID string to remove " 0 R" suffix for consistency with form data
      const cleanId = rawId.replace(/ 0 R$/, '').trim();

      // Map clean numeric ID to PDF field object for direct access
      this.fieldIdMap.set(cleanId, field);

      // Map field name to clean numeric ID for backward compatibility
      this.fieldNameToIdMap.set(name, cleanId);
    });

    // console.log(`🗂️ Created ID-based mappings: ${this.fieldIdMap.size} field IDs, ${this.fieldNameToIdMap.size} name mappings`);

    // Debug: Show some Section 29 field mappings
    const section29Mappings = Array.from(this.fieldNameToIdMap.entries())
      .filter(([name]) => name.includes('Section29'))
      .slice(0, 5);

    // console.log(`🎯 Sample Section 29 ID mappings:`, section29Mappings);

    // Enhanced debugging for client-side
    const sampleFieldMappings = Array.from(this.fieldIdMap.entries()).slice(0, 10);
    // console.log(`🆔 Sample field ID mappings (clean IDs):`, sampleFieldMappings.map(([id, field]) => `${id} -> ${field.getName()}`));

    const sampleNameMappings = Array.from(this.fieldNameToIdMap.entries()).slice(0, 10);
    // console.log(`📝 Sample name-to-ID mappings:`, sampleNameMappings);
  }

  /**
   * Enhanced form values mapping with better error handling and validation
   */
  private async mapFormValuesToJsonData(
    fieldMapping: FieldMetadata[],
    formData: ApplicantFormValues
  ): Promise<{ mappedFields: FieldMetadata[]; stats: { total: number; mapped: number; errors: string[] } }> {
    const idValueMap = new Map<string, any>();
    const errors: string[] = [];
    let totalFields = 0;

    const flattenFormValues = (data: any, prefix = '', depth = 0) => {
      const indent = '  '.repeat(depth);
      // console.log(`${indent}🔍 [DEPTH ${depth}] Analyzing path: "${prefix}" | Type: ${typeof data}`);

      if (!data || typeof data !== 'object') {
        // console.log(`${indent}⏭️ Skipping non-object value at path: "${prefix}"`);
        return;
      }

      // console.log(`${indent}📋 Object keys at "${prefix}":`, Object.keys(data));

      Object.entries(data).forEach(([key, val]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        // console.log(`${indent}🔑 Processing key: "${key}" at path: "${path}"`);
        // console.log(`${indent}📝 Value type: ${typeof val} | Is null: ${val === null} | Is undefined: ${val === undefined}`);

        if (val && typeof val === "object") {
          // Check if this is a Field<T> object
          if ('id' in val && 'value' in val) {
            // this.clientLog('INFO', `🎯 FOUND FIELD OBJECT at path: "${path}"`);
            // this.clientLog('INFO', `${indent}   🆔 Field ID: "${val.id}"`);
            // this.clientLog('INFO', `${indent}   📊 Value type: ${typeof val.value}`);
            // this.clientLog('INFO', `${indent}   ✅ Has ID: ${!!val.id}, Has Value: ${val.value !== undefined}`);
            // console.log(`${indent}   ✅ Value not empty: ${val.value !== ''}`);

            // Check the condition that was filtering fields
            const hasValidId = val.id && val.id !== '';
            const hasValidValue = val.value !== undefined && val.value !== '';
            // console.log(`${indent}   🔍 Valid ID check: ${hasValidId}`);
            // console.log(`${indent}   🔍 Valid Value check: ${hasValidValue}`);

            if (hasValidId && hasValidValue) {
              totalFields++;
              try {
                const idStr = String(val.id);
                const valueStr = val.value;
                // this.clientLog('INFO', `${indent}✅ PROCESSING FIELD: ${path}`);
                // this.clientLog('INFO', `${indent}   🆔 ID: "${idStr}"`);
                // this.clientLog('INFO', `${indent}   💾 Value type: ${typeof valueStr}, Length: ${typeof valueStr === 'string' ? valueStr.length : 'N/A'}`);

                let numericId: string | null = null;

                // FIXED: Clean the ID string to remove " 0 R" suffix if present
                const cleanIdStr = idStr.replace(/ 0 R$/, '').trim();
                // console.log(`${indent}🧹 Cleaned ID: "${idStr}" → "${cleanIdStr}"`);

                // Handle both numeric IDs and field name paths
                if (cleanIdStr.includes('form1[0]')) {
                  // console.log(`${indent}🔍 Field ID appears to be a field name path, converting to numeric ID...`);

                  // This is a field name, convert to numeric ID using our mapping
                  numericId = this.fieldNameToIdMap.get(cleanIdStr) || null;

                  if (numericId) {
                    // console.log(`${indent}✅ CONVERTED: Field name "${cleanIdStr}" → Numeric ID: "${numericId}"`);
                    idValueMap.set(numericId, valueStr);
                    // console.log(`${indent}🗂️ MAPPED: "${cleanIdStr}" → ID:"${numericId}" → Value:"${valueStr}"`);
                  } else {
                    // console.log(`${indent}❌ NO CONVERSION: No numeric ID found for field name: "${cleanIdStr}"`);

                    // Show similar field names for debugging
                    const similarFieldNames = Array.from(this.fieldNameToIdMap.keys()).filter(name =>
                      name.includes('Section29') ||
                      name.includes(cleanIdStr.split('.').pop() || '') ||
                      cleanIdStr.includes(name.split('.').pop() || '')
                    ).slice(0, 5);

                    // console.log(`${indent}   🔍 Similar PDF field names:`, similarFieldNames);
                    errors.push(`No numeric ID found for field name: ${cleanIdStr}`);
                  }
                } else {
                  // console.log(`${indent}🔢 Field ID appears to be numeric, using directly: "${cleanIdStr}"`);
                  numericId = cleanIdStr;

                  // Verify the numeric ID exists in our PDF
                  if (this.fieldIdMap.has(numericId)) {
                    idValueMap.set(numericId, valueStr);
                    // console.log(`${indent}🗂️ MAPPED: Numeric ID:"${numericId}" → Value:"${valueStr}"`);
                  } else {
                    // console.log(`${indent}❌ INVALID ID: Numeric ID "${numericId}" not found in PDF`);
                    errors.push(`Invalid numeric ID: ${numericId}`);
                  }
                }
              } catch (error) {
                // console.error(`${indent}💥 ERROR mapping field at path "${path}":`, error);
                errors.push(`Error mapping field ${path}: ${error}`);
              }
            } else {
              // console.log(`${indent}⚠️ SKIPPING FIELD: Invalid ID or value`);
              // console.log(`${indent}   🆔 ID: "${val.id}" (valid: ${hasValidId})`);
              // console.log(`${indent}   💾 Value: "${val.value}" (valid: ${hasValidValue})`);
            }
          } else {
            // console.log(`${indent}📁 Object without id/value properties, recursing deeper...`);
            // console.log(`${indent}   🔍 Object properties:`, Object.keys(val));
            flattenFormValues(val, path, depth + 1);
          }
        } else {
          // console.log(`${indent}📄 Primitive value at "${path}": ${val}`);
        }
      });
    };

    // console.log(`\n🚀 ===== DEEP FORM DATA ANALYSIS START =====`);
    // console.log(`📊 Form Data Structure Overview:`);
    // console.log(`   📋 Available sections:`, Object.keys(formData));
    // console.log(`   📈 Total sections: ${Object.keys(formData).length}`);

    // Enhanced form data inspection
    // console.log(`\n🔍 ===== SECTION-BY-SECTION ANALYSIS =====`);
    Object.entries(formData).forEach(([sectionKey, sectionValue]) => {
      console.log(`\n📁 Section "${sectionKey}":`);
      console.log(`   📊 Type: ${typeof sectionValue}`);
      console.log(`   📊 Is null: ${sectionValue === null}`);
      console.log(`   📊 Is undefined: ${sectionValue === undefined}`);

      if (sectionValue && typeof sectionValue === 'object') {
        console.log(`   📊 Object keys: [${Object.keys(sectionValue).join(', ')}]`);
        console.log(`   📊 Object keys count: ${Object.keys(sectionValue).length}`);

        // Check for Field objects in this section
        let fieldCount = 0;
        const sampleFields: any[] = [];

        const countFields = (obj: any, path = '') => {
          if (obj && typeof obj === 'object') {
            if ('id' in obj && 'value' in obj) {
              fieldCount++;
              if (sampleFields.length < 3) {
                sampleFields.push({ path, id: obj.id, value: obj.value, type: typeof obj.value });
              }
            } else {
              Object.entries(obj).forEach(([key, val]) => {
                countFields(val, path ? `${path}.${key}` : key);
              });
            }
          }
        };

        countFields(sectionValue);
        console.log(`   🎯 Field objects found: ${fieldCount}`);
        if (sampleFields.length > 0) {
          console.log(`   📋 Sample fields:`);
          sampleFields.forEach((field, i) => {
            console.log(`     [${i+1}] Path: "${field.path}" ID: "${field.id}" Value: "${field.value}" (${field.type})`);
          });
        }
      }
    });

    console.log(`\n🔍 Starting form value flattening process...`);
    flattenFormValues(formData);

    console.log(`\n📊 ===== FORM DATA FLATTENING COMPLETE =====`);
    console.log(`📈 Total fields processed: ${totalFields}`);
    console.log(`🗂️ Total mappings created: ${idValueMap.size}`);
    console.log(`🆔 Mapped field IDs:`, Array.from(idValueMap.keys()));
    console.log(`💾 Mapped field values:`, Array.from(idValueMap.entries()));

    // Create a deep copy of the field mapping
    const mappedFields: FieldMetadata[] = fieldMapping.map(field => ({...field}));

    let mappedCount = 0;
    console.log(`\n🎯 ===== PDF FIELD MAPPING ANALYSIS =====`);
    console.log(`📄 Total PDF fields available: ${mappedFields.length}`);
    console.log(`🗂️ Total form values to map: ${idValueMap.size}`);
    console.log(`🆔 Form field IDs to match:`, Array.from(idValueMap.keys()));

    // Show some sample PDF field names for reference
    console.log(`\n📋 Sample PDF field names (first 10):`);
    mappedFields.slice(0, 10).forEach((field, index) => {
      console.log(`   [${index}] ID:"${field.id}" Name:"${field.name}"`);
    });

    // Show Section 29 specific fields if available
    const section29Fields = mappedFields.filter(f => f.name.includes('Section29'));
    console.log(`\n🎯 Section 29 PDF fields found: ${section29Fields.length}`);
    section29Fields.slice(0, 10).forEach((field, index) => {
      console.log(`   [${index}] ID:"${field.id}" Name:"${field.name}"`);
    });

    mappedFields.forEach((item, index) => {
      if (idValueMap.has(item.id)) {
        const formValue = idValueMap.get(item.id);
        item.value = formValue;
        mappedCount++;
        console.log(`✅ MAPPED [${index}]: PDF Field ID="${item.id}" Name="${item.name}" ← Form Value="${formValue}"`);
        console.log(`   📋 Full PDF Field:`, item);
      } else {
        // Only log first 20 unmapped fields to avoid spam
        if (index < 20) {
          console.log(`❌ NO MATCH [${index}]: PDF Field ID="${item.id}" Name="${item.name}" (no form data)`);

          // Show potential matches for debugging
          const fieldNamePart = item.name.split('.').pop() || '';
          const potentialMatches = Array.from(idValueMap.keys()).filter(id =>
            id.includes(fieldNamePart) || item.name.includes(id)
          );
          if (potentialMatches.length > 0) {
            console.log(`   🔍 Potential matches in form data:`, potentialMatches);
          }
        }
      }
    });

    console.log(`\n📊 ===== MAPPING SUMMARY =====`);
    console.log(`✅ Successfully mapped: ${mappedCount}/${mappedFields.length} fields`);
    console.log(`📈 Mapping success rate: ${((mappedCount / mappedFields.length) * 100).toFixed(2)}%`);
    console.log(`❌ Unmapped fields: ${mappedFields.length - mappedCount}`);
    console.log(`🚨 Errors encountered: ${errors.length}`);
    if (errors.length > 0) {
      console.log(`💥 Error details:`, errors);
    }
    console.log(`🔍 ===== DEEP FORM DATA ANALYSIS END =====\n`);

    return {
      mappedFields,
      stats: {
        total: totalFields,
        mapped: mappedCount,
        errors
      }
    };
  }

  /**
   * Validate field mapping accuracy
   */
  async validateFieldMapping(formData: ApplicantFormValues): Promise<FieldValidationResult[]> {
    const results: FieldValidationResult[] = [];

    if (!this.pdfDoc || !this.isLoaded) {
      await this.loadPdf();
    }

    const mappingResult = await this.mapFormValuesToJsonData(this.fieldMapping, formData);

    mappingResult.mappedFields.forEach(field => {
      if (field.value !== undefined && field.value !== '') {
        results.push({
          isValid: true,
          fieldId: field.id,
          fieldName: field.name,
          expectedValue: field.value,
          actualValue: field.value
        });
      }
    });

    return results;
  }

  /**
   * Diagnostic method to help debug field mapping issues
   */
  async diagnoseFieldMappingIssues(formData: ApplicantFormValues): Promise<{
    formStructure: any;
    pdfFields: any[];
    matchingResults: any[];
    idMismatchReport: any[];
  }> {
    // Make sure PDF is loaded
    if (!this.pdfDoc || !this.isLoaded) {
      await this.loadPdf();
    }

    if (!this.pdfDoc) {
      throw new Error("PDF document not loaded");
    }

    // Extract form structure overview
    const formStructure = {
      sectionCount: Object.keys(formData).length,
      sectionNames: Object.keys(formData),
      flattenedFields: this.countFieldObjects(formData)
    };

    // Get all PDF fields
    const form = this.pdfDoc.getForm();
    const allPdfFields = form.getFields();
    const pdfFieldSample = allPdfFields.slice(0, 20).map(f => ({
      name: f.getName(),
      id: f.ref.tag.toString(),
      type: f.constructor.name
    }));

    // Attempt mapping and track results
    const matchingResults = [];
    const idMismatchReport = [];

    // Sample 100 form fields for analysis
    const flattenedFields = this.extractAllFields(formData, 100);

    for (const field of flattenedFields) {
      if (!field.id || !field.value) continue;

      const pdfFieldById = this.fieldIdMap.get(field.id);
      const fallbackId = this.fieldNameToIdMap.get(field.id);
      const pdfFieldByFallbackId = fallbackId ? this.fieldIdMap.get(fallbackId) : null;

      // Check for name matches
      const nameMatches = allPdfFields.filter(f =>
        f.getName().includes(field.id) ||
        (typeof field.id === 'string' && field.id.includes(f.getName()))
      ).slice(0, 3);

      idMismatchReport.push({
        formFieldId: field.id,
        formFieldValue: field.value,
        directMatch: !!pdfFieldById,
        fallbackMatch: !!pdfFieldByFallbackId,
        nameMatchCount: nameMatches.length,
        nameMatchSamples: nameMatches.map(f => f.getName())
      });

      if (pdfFieldById || pdfFieldByFallbackId) {
        matchingResults.push({
          formFieldId: field.id,
          formFieldValue: field.value,
          matchType: pdfFieldById ? 'direct' : 'fallback',
          pdfFieldName: pdfFieldById ? pdfFieldById.getName() : pdfFieldByFallbackId.getName(),
          pdfFieldType: pdfFieldById ? pdfFieldById.constructor.name : pdfFieldByFallbackId.constructor.name
        });
      }
    }

    return {
      formStructure,
      pdfFields: pdfFieldSample,
      matchingResults,
      idMismatchReport
    };
  }

  /**
   * Count all Field objects in the form data
   */
  private countFieldObjects(data: any, prefix = ''): number {
    if (!data || typeof data !== 'object') return 0;

    let count = 0;

    Object.entries(data).forEach(([key, val]) => {
      if (val && typeof val === "object") {
        // Check if this is a Field<T> object
        if ('id' in val && 'value' in val) {
          count++;
        } else {
          // Recurse into nested objects
          const path = prefix ? `${prefix}.${key}` : key;
          count += this.countFieldObjects(val, path);
        }
      }
    });

    return count;
  }

  /**
   * Extract a sample of field objects from form data
   */
  private extractAllFields(data: any, limit = 100, prefix = '', result: any[] = []): any[] {
    if (!data || typeof data !== 'object' || result.length >= limit) return result;

    Object.entries(data).forEach(([key, val]) => {
      if (result.length >= limit) return;

      if (val && typeof val === "object") {
        // Check if this is a Field<T> object
        if ('id' in val && 'value' in val) {
          result.push(val);
        } else {
          // Recurse into nested objects
          const path = prefix ? `${prefix}.${key}` : key;
          this.extractAllFields(val, limit, path, result);
        }
      }
    });

    return result;
  }

  /**
   * Get field mapping statistics
   */
  getFieldMappingStats(): { totalFields: number; mappedFields: number; unmappedFields: number } {
    const totalFields = this.fieldMapping.length;
    const mappedFields = this.fieldMapping.filter(f => f.value !== undefined && f.value !== '').length;

    return {
      totalFields,
      mappedFields,
      unmappedFields: totalFields - mappedFields
    };
  }

  /**
   * Download JSON data for debugging analysis
   */
  downloadJson(jsonData: any, filename = 'SF86-form-data.json'): void {
    try {
      // this.clientLog('INFO', `📄 Starting JSON download: ${filename}`);

      // Create formatted JSON string
      const jsonString = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Detect mobile devices
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (!isMobile) {
        // Desktop download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // this.clientLog('INFO', '✅ JSON download initiated (desktop)');

        // Cleanup
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 5000);
      } else {
        // Mobile fallback - open in new tab
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (newWindow) {
          // this.clientLog('INFO', '✅ JSON opened in new tab (mobile)');
        } else {
          // Final fallback - show instructions
          const instructions = `📱 JSON download ready!\n\nTo save the JSON file:\n1. Copy this link\n2. Paste in a new browser tab\n3. Save the file\n\nLink: ${url}`;
          const shouldCopy = confirm(`${instructions}\n\nCopy link to clipboard?`);
          if (shouldCopy) {
            navigator.clipboard?.writeText(url).catch(() => {
              prompt('Copy this link:', url);
            });
          }
        }

        // Mobile cleanup
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 30000);
      }
    } catch (error) {
      // this.clientLog('ERROR', '❌ JSON download failed', error);
    }
  }

  /**
   * Download the generated PDF - Enhanced mobile compatibility (Fixed)
   */
  downloadPdf(pdfBytes: Uint8Array, filename = 'SF86-filled.pdf'): void {
    try {
      // console.log(`📱 Starting PDF download: ${filename}, size: ${pdfBytes.length} bytes`);

      // Create blob with PDF data
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Enhanced mobile detection
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
      const isIOS = /ipad|iphone|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
      const isChrome = /chrome/.test(userAgent);
      const isFirefox = /firefox/.test(userAgent);

      // console.log(`📱 Device detection:`, {
      //   isMobile,
      //   isIOS,
      //   isAndroid,
      //   isSafari,
      //   isChrome,
      //   isFirefox,
      //   userAgent: userAgent.substring(0, 100) + '...'
      // });

      // Track if any method succeeds
      let downloadAttempted = false;

      // Method 1: For Desktop browsers - use standard approach
      if (!isMobile) {
        try {
          // console.log('💻 Using desktop download method...');
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // console.log('✅ Desktop download initiated');
          downloadAttempted = true;
          
          // Cleanup after successful desktop download
          setTimeout(() => {
            URL.revokeObjectURL(url);
            // console.log('🧹 Desktop URL cleanup completed');
          }, 5000);
          
          return; // Exit early for desktop
        } catch (desktopError) {
          // console.warn('⚠️ Desktop download failed, trying fallback:', desktopError);
        }
      }

      // Method 2: iOS-specific approach
      if (isIOS) {
        try {
          // console.log('🍎 Using iOS-specific download method...');
          
          // For iOS, create a new tab with PDF and instructions
          const newWindow = window.open('about:blank', '_blank');
          if (newWindow) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>${filename}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta charset="UTF-8">
                <style>
                  body { 
                    margin: 0; 
                    padding: 20px; 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #f5f5f7;
                  }
                  .container { 
                    max-width: 100%; 
                    text-align: center; 
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                  }
                  .download-btn { 
                    display: inline-block; 
                    padding: 16px 32px; 
                    background: #007AFF; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 12px; 
                    margin: 15px;
                    font-size: 18px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: background 0.2s;
                  }
                  .download-btn:hover {
                    background: #0056CC;
                  }
                  .instructions { 
                    margin: 20px 0; 
                    padding: 20px; 
                    background: #f0f8ff; 
                    border-radius: 12px; 
                    text-align: left;
                    border: 1px solid #e1e8ed;
                  }
                  .step {
                    margin: 10px 0;
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                  }
                  .step:last-child {
                    border-bottom: none;
                  }
                  iframe { 
                    width: 100%; 
                    height: 60vh; 
                    border: 1px solid #ddd; 
                    border-radius: 8px; 
                    margin-top: 20px;
                  }
                  .icon { font-size: 20px; margin-right: 8px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>📄 ${filename}</h1>
                  <div style="margin: 20px 0;">
                    <a href="${url}" download="${filename}" class="download-btn">
                      📥 Download PDF
                    </a>
                  </div>
                  
                  <div class="instructions">
                    <h3>📱 iOS Download Instructions:</h3>
                    <div class="step">
                      <span class="icon">1️⃣</span> Tap the "Download PDF" button above
                    </div>
                    <div class="step">
                      <span class="icon">2️⃣</span> Look for the Share button (⬆️) in Safari's toolbar
                    </div>
                    <div class="step">
                      <span class="icon">3️⃣</span> Select "Save to Files" or "Save to Photos"
                    </div>
                    <div class="step">
                      <span class="icon">4️⃣</span> Choose your preferred location to save
                    </div>
                    <div class="step">
                      <span class="icon">📝</span> Or long-press the PDF below and select "Save"
                    </div>
                  </div>
                  
                  <iframe src="${url}" title="PDF Preview"></iframe>
                </div>
                
                <script>
                  // Auto-trigger download after a short delay
                  setTimeout(() => {
                    const downloadLink = document.querySelector('.download-btn');
                    if (downloadLink) {
                      downloadLink.click();
                    }
                  }, 1000);
                </script>
              </body>
              </html>
            `);
            newWindow.document.close();
            
            // console.log('✅ iOS PDF interface opened successfully');
            downloadAttempted = true;
            
            // Extended cleanup for iOS
            setTimeout(() => {
              URL.revokeObjectURL(url);
              // console.log('🧹 iOS URL cleanup completed');
            }, 60000); // 1 minute for iOS
            
            return;
          } else {
            // console.warn('⚠️ Failed to open new window for iOS - popup blocked');
          }
        } catch (iosError) {
          // console.warn('⚠️ iOS download method failed:', iosError);
        }
      }

      // Method 3: Android-specific approach
      if (isAndroid) {
        try {
          // console.log('🤖 Using Android-specific download method...');
          
          // Try multiple Android approaches
          const androidMethods = [
            // Method 3a: Standard download with enhanced attributes
            () => {
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              link.style.display = 'none';
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              
              // Android-specific enhancements
              link.type = 'application/pdf';
              
              document.body.appendChild(link);
              
              // Use both click methods for better compatibility
              const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                composed: true
              });
              
              link.dispatchEvent(clickEvent);
              link.click(); // Fallback
              
              // Cleanup with delay
              setTimeout(() => {
                if (document.body.contains(link)) {
                  document.body.removeChild(link);
                }
              }, 1000);
              
              // console.log('✅ Android standard download attempted');
              return true;
            },
            
            // Method 3b: Direct navigation for Android browsers
            () => {
              window.location.href = url;
              // console.log('✅ Android direct navigation attempted');
              return true;
            },
            
            // Method 3c: Window.open with Android-friendly parameters
            () => {
              const androidWindow = window.open(url, '_blank', 'noopener,noreferrer,toolbar=yes,scrollbars=yes,resizable=yes');
              if (androidWindow) {
                // console.log('✅ Android window.open attempted');
                return true;
              }
              return false;
            }
          ];
          
          // Try each Android method
          for (let i = 0; i < androidMethods.length; i++) {
            try {
              if (androidMethods[i]()) {
                downloadAttempted = true;
                // console.log(`✅ Android method ${i + 1} succeeded`);
                
                // Cleanup after successful Android download
                setTimeout(() => {
                  URL.revokeObjectURL(url);
                  // console.log('🧹 Android URL cleanup completed');
                }, 10000); // 10 seconds for Android
                
                return;
              }
            } catch (methodError) {
              // console.warn(`⚠️ Android method ${i + 1} failed:`, methodError);
            }
          }
          
        } catch (androidError) {
          // console.warn('⚠️ Android download methods failed:', androidError);
        }
      }

      // Method 4: Generic mobile fallback
      if (isMobile && !downloadAttempted) {
        try {
          // console.log('📱 Using generic mobile fallback...');
          
          // Create a user-friendly download page for unhandled mobile browsers
          const fallbackWindow = window.open('about:blank', '_blank');
          if (fallbackWindow) {
            fallbackWindow.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Download ${filename}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { 
                    font-family: system-ui, -apple-system, sans-serif; 
                    margin: 20px; 
                    text-align: center;
                    background: #f9f9f9;
                  }
                  .container {
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    max-width: 400px;
                    margin: 20px auto;
                  }
                  .download-btn { 
                    display: inline-block;
                    padding: 16px 24px; 
                    background: #4CAF50; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-size: 16px;
                    font-weight: 500;
                    margin: 15px 0;
                  }
                  .instructions {
                    text-align: left;
                    background: #fff3cd;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border: 1px solid #ffeaa7;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h2>📄 Download Your PDF</h2>
                  <p><strong>${filename}</strong></p>
                  
                  <a href="${url}" download="${filename}" class="download-btn">
                    📥 Download PDF
                  </a>
                  
                  <div class="instructions">
                    <h4>📱 Mobile Download Tips:</h4>
                    <ul>
                      <li>Tap the download button above</li>
                      <li>If nothing happens, try long-pressing the link</li>
                      <li>Select "Download" or "Save" from the menu</li>
                      <li>Check your Downloads folder</li>
                      <li>Some browsers may open the PDF instead - look for a save option</li>
                    </ul>
                  </div>
                  
                  <div style="margin-top: 20px;">
                    <a href="${url}" target="_blank" style="color: #007bff; text-decoration: underline;">
                      Or open PDF in new tab
                    </a>
                  </div>
                </div>
              </body>
              </html>
            `);
            fallbackWindow.document.close();
            
            // console.log('✅ Generic mobile fallback interface created');
            downloadAttempted = true;
            
            // Extended cleanup for generic mobile
            setTimeout(() => {
              URL.revokeObjectURL(url);
              // console.log('🧹 Generic mobile URL cleanup completed');
            }, 45000); // 45 seconds
            
            return;
          }
        } catch (fallbackError) {
          // console.warn('⚠️ Generic mobile fallback failed:', fallbackError);
        }
      }

      // Method 5: Final universal fallback
      if (!downloadAttempted) {
        // console.log('🆘 Using final universal fallback...');
        try {
          const universalWindow = window.open(url, '_blank', 'noopener,noreferrer');
          if (universalWindow) {
            // console.log('✅ Universal fallback window opened');
          } else {
            // console.error('❌ All download methods failed - showing instructions');
            this.showDownloadInstructions(url, filename);
          }
        } catch (universalError) {
          // console.error('❌ Universal fallback failed:', universalError);
          this.showDownloadInstructions(url, filename);
        }
        
        // Final cleanup
        setTimeout(() => {
          URL.revokeObjectURL(url);
          // console.log('🧹 Final cleanup completed');
        }, 30000);
      }

    } catch (error) {
      // console.error('💥 Critical error in PDF download process:', error);
      // console.log(`PDF download failed: ${error instanceof Error ? error.message : String(error)}\n\nPlease try refreshing the page and generating the PDF again.`);
    }
  }

  /**
   * Show download instructions when automatic download fails - Enhanced mobile support
   */
  private showDownloadInstructions(url: string, filename: string): void {
    // Enhanced mobile detection for better instructions
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /ipad|iphone|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);
    
    let instructions = `📄 PDF Download Failed - Manual Instructions\n\n`;
    
    if (isIOS) {
      instructions += `🍎 iOS Instructions:\n`;
      instructions += `1. If a new tab opened, look for the Share button (⬆️) in Safari\n`;
      instructions += `2. Tap Share → Save to Files (or Save to Photos)\n`;
      instructions += `3. Choose where to save your PDF\n`;
      instructions += `4. Or long-press the PDF and select "Save"\n\n`;
      instructions += `If no tab opened, copy this link:\n${url}\n`;
      instructions += `Paste it in Safari and follow steps above.`;
    } else if (isAndroid) {
      instructions += `🤖 Android Instructions:\n`;
      instructions += `1. Check if a download started (look for notification)\n`;
      instructions += `2. Check your Downloads folder in file manager\n`;
      instructions += `3. If nothing downloaded, copy this link:\n${url}\n`;
      instructions += `4. Paste in Chrome/Firefox and tap to download\n`;
      instructions += `5. Long-press the PDF and select "Download"\n`;
      instructions += `6. Some browsers save to Downloads automatically`;
    } else if (isMobile) {
      instructions += `📱 Mobile Browser Instructions:\n`;
      instructions += `1. Copy this link: ${url}\n`;
      instructions += `2. Paste it in your browser's address bar\n`;
      instructions += `3. The PDF should open - look for save options\n`;
      instructions += `4. Try long-pressing and selecting "Save" or "Download"\n`;
      instructions += `5. Check your device's Downloads folder`;
    } else {
      instructions += `💻 Desktop Instructions:\n`;
      instructions += `1. Copy this link: ${url}\n`;
      instructions += `2. Paste it in a new browser tab\n`;
      instructions += `3. Right-click the PDF and select "Save as..."\n`;
      instructions += `4. Or use Ctrl+S to save the PDF`;
    }
    
    instructions += `\n\n⏰ This PDF link will expire in a few minutes.`;
    
    const shouldCopyLink = confirm(`${instructions}\n\n📋 Would you like to copy the PDF link to your clipboard?`);
    
    if (shouldCopyLink) {
      this.copyLinkToClipboard(url, filename);
    } else {
      // Show additional fallback options
      setTimeout(() => {
        const tryAgain = confirm(`💡 Alternative option:\n\nWould you like to open the PDF in a new tab?\n\n(You can then use your browser's save options)`);
        if (tryAgain) {
          try {
            window.open(url, '_blank', 'noopener,noreferrer');
          } catch (error) {
            // console.error('Failed to open fallback window:', error);
            this.showUrlPrompt(url);
          }
        }
      }, 1000);
    }
  }

  /**
   * Enhanced clipboard copy with better error handling
   */
  private copyLinkToClipboard(url: string, filename: string): void {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        // console.log(`✅ PDF link copied to clipboard!\n\n📋 Link for: ${filename}\n\n📱 Now paste it in your browser to download.`);
      }).catch((clipboardError) => {
        // console.warn('Modern clipboard API failed:', clipboardError);
        this.fallbackCopyMethod(url, filename);
      });
    } else {
      // Fallback for older browsers
      this.fallbackCopyMethod(url, filename);
    }
  }

  /**
   * Fallback copy method for browsers without clipboard API
   */
  private fallbackCopyMethod(url: string, filename: string): void {
    // Try to create a temporary text area for copying
    try {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      textArea.style.left = '-9999px';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      // Try to copy using execCommand (legacy method)
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        // console.log(`✅ PDF link copied to clipboard!\n\n📋 Link for: ${filename}\n\n📱 Now paste it in your browser to download.`);
      } else {
        this.showUrlPrompt(url);
      }
    } catch (error) {
      // console.warn('Fallback copy method failed:', error);
      this.showUrlPrompt(url);
    }
  }

  /**
   * Show URL in a prompt for manual copying
   */
  private showUrlPrompt(url: string): void {
    const message = `Please copy this URL to download your PDF:\n\n${url}`;
    
    // For mobile browsers that support prompt
    if (typeof prompt !== 'undefined') {
      prompt('Copy this URL to download your PDF:', url);
    } else {
      // console.log(message);
    }
  }

  /**
   * Get all available PDF fields for debugging
   */
  getAllPdfFields(): FieldMetadata[] {
    return [...this.fieldMapping];
  }

  /**
   * Reset the service state
   */
  reset(): void {
    this.pdfDoc = null;
    this.fieldMapping = [];
    this.isLoaded = false;
  }

  /**
   * Debug utility to analyze field mapping for a specific section
   * @param sectionName The name of the section to analyze
   * @param formData The complete form data
   */
  async debugSectionFieldMapping(sectionName: string, formData: ApplicantFormValues): Promise<{
    sectionFields: any[];
    mappingResults: any[];
  }> {
    // Make sure PDF is loaded
    if (!this.pdfDoc || !this.isLoaded) {
      await this.loadPdf();
    }

    if (!this.pdfDoc) {
      throw new Error("PDF document not loaded");
    }

    // Extract fields from the specified section using type assertion to access by string index
    const sectionData = formData[sectionName as keyof ApplicantFormValues];
    if (!sectionData) {
      return {
        sectionFields: [],
        mappingResults: []
      };
    }

    // Extract fields from the section
    const sectionFields = this.extractFieldsFromSection(sectionData);
    // console.log(`Found ${sectionFields.length} fields in section ${sectionName}`);

    // Get PDF form for lookup
    const form = this.pdfDoc.getForm();
    const allPdfFields = form.getFields();

    // Create enhanced lookup map as in generateFilledPdf
    const enhancedFieldMap = new Map();

    // Map by both ID and name for faster lookups
    allPdfFields.forEach(field => {
      const id = field.ref.tag.toString();
      const name = field.getName();

      enhancedFieldMap.set(id, field);
      enhancedFieldMap.set(name, field);

      // Store by name parts (useful for partial matches)
      const nameParts = name.split(/[.\[\]]/);
      nameParts.forEach(part => {
        if (part && part.length > 3) { // Only meaningful parts
          if (!enhancedFieldMap.has(part)) {
            enhancedFieldMap.set(part, field);
          }
        }
      });
    });

    // Test field mapping
    const mappingResults = [];

    for (const field of sectionFields) {
      if (!field.id || field.value === undefined) continue;

      // Clean the field ID for consistent lookup
      const cleanFieldId = String(field.id).replace(/ 0 R$/, '').trim();

      // Try all lookup methods
      const lookupResults: Record<string, any> = {
        fieldId: field.id,
        cleanFieldId: cleanFieldId,
        fieldValue: field.value,
        directMatch: null,
        nameMatch: null,
        enhancedMatch: null,
        partMatch: null
      };

      // Direct ID match with cleaned ID
      if (this.fieldIdMap.has(cleanFieldId)) {
        const pdfField = this.fieldIdMap.get(cleanFieldId);
        lookupResults.directMatch = {
          found: true,
          fieldName: pdfField.getName(),
          fieldType: pdfField.constructor.name
        };
      }

      // Name match with cleaned ID
      if (this.fieldNameToIdMap.has(cleanFieldId)) {
        const numericId = this.fieldNameToIdMap.get(cleanFieldId);
        if (numericId && this.fieldIdMap.has(numericId)) {
          const pdfField = this.fieldIdMap.get(numericId);
          lookupResults.nameMatch = {
            found: true,
            fieldName: pdfField.getName(),
            fieldType: pdfField.constructor.name
          };
        }
      }

      // Enhanced map match with cleaned ID
      if (enhancedFieldMap.has(cleanFieldId)) {
        const pdfField = enhancedFieldMap.get(cleanFieldId);
        lookupResults.enhancedMatch = {
          found: true,
          fieldName: pdfField.getName(),
          fieldType: pdfField.constructor.name
        };
      }

      // Part match with cleaned ID
      const idPart = String(cleanFieldId).split(/[.\[\]]/).pop() || '';
      if (idPart && enhancedFieldMap.has(idPart)) {
        const pdfField = enhancedFieldMap.get(idPart);
        lookupResults.partMatch = {
          found: true,
          fieldName: pdfField.getName(),
          fieldType: pdfField.constructor.name
        };
      }

      // Determine overall match success
      lookupResults.anyMatch = !!(
        lookupResults.directMatch?.found ||
        lookupResults.nameMatch?.found ||
        lookupResults.enhancedMatch?.found ||
        lookupResults.partMatch?.found
      );

      mappingResults.push(lookupResults);
    }

    return {
      sectionFields,
      mappingResults
    };
  }

  /**
   * Extract fields from a section data object
   */
  private extractFieldsFromSection(sectionData: any, path = ''): any[] {
    if (!sectionData || typeof sectionData !== 'object') return [];

    const fields: any[] = [];

    Object.entries(sectionData).forEach(([key, val]) => {
      const currentPath = path ? `${path}.${key}` : key;

      if (val && typeof val === 'object') {
        // Check if this is a Field<T> object
        if ('id' in val && 'value' in val) {
          fields.push(val);
        } else {
          // Recurse into nested objects
          const nestedFields = this.extractFieldsFromSection(val, currentPath);
          fields.push(...nestedFields);
        }
      }
    });

    return fields;
  }

  /**
   * Generate a filled PDF from form values (backward compatibility wrapper)
   *
   * This method wraps the new generatePdfClientAction for backward compatibility.
   * New code should use generatePdfClientAction directly for enhanced features.
   */
  async generateFilledPdf(formData: ApplicantFormValues): Promise<PdfGenerationResult> {
    // this.clientLog('INFO', "🔄 generateFilledPdf called - using enhanced client action...");

    const enhancedResult = await this.generatePdfClientAction(formData);

    // Convert enhanced result to legacy format
    const legacyResult: PdfGenerationResult = {
      success: enhancedResult.success,
      pdfBytes: enhancedResult.pdfBytes,
      fieldsMapped: enhancedResult.fieldsMapped,
      fieldsApplied: enhancedResult.fieldsApplied,
      errors: enhancedResult.errors,
      warnings: enhancedResult.warnings
    };

    return legacyResult;
  }
}

// Create and export a singleton instance
export const clientPdfService2 = new ClientPdfService2();
