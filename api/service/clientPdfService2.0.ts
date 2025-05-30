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

// PDF generation result interface
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
   * Fetch and load the SF86 PDF document
   */
  async loadPdf(): Promise<PDFDocument> {
    if (this.pdfDoc && this.isLoaded) return this.pdfDoc;

    try {
      // Fetch the base PDF template from our API route (client-side only)
      console.log("Fetching SF-86 PDF template from API...");
      const response = await fetch(SF86_PDF_TEMPLATE_URL);

      if (response.ok) {
        const pdfBytes = await response.arrayBuffer();
        this.pdfDoc = await PDFDocument.load(pdfBytes);
        await this.mapFormFields();
        this.isLoaded = true;
        console.log(`Successfully loaded SF-86 PDF template. Size: ${pdfBytes.byteLength} bytes`);
        return this.pdfDoc;
      } else {
        throw new Error(`Failed to fetch PDF template: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error loading PDF:", error);
      throw error;
    }
  }

  /**
   * Load PDF from an ArrayBuffer (for user-uploaded files)
   */
  async loadPdfFromBuffer(pdfBuffer: ArrayBuffer): Promise<PDFDocument> {
    try {
      console.log("Loading PDF from uploaded file...");
      this.pdfDoc = await PDFDocument.load(pdfBuffer);

      // Map fields immediately after loading
      await this.mapFormFields();
      this.isLoaded = true;

      return this.pdfDoc;
    } catch (error) {
      console.error("Error loading PDF from buffer:", error);
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

    console.log(`📄 Mapped ${this.fieldMapping.length} PDF fields`);

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
    // Numeric IDs are pure numbers without form1[0] prefix
    return /^\d+$/.test(id) && !id.includes('form1[0]') && !id.includes('Section');
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
      const numericId = field.ref.tag.toString();

      // Map numeric ID to PDF field object for direct access
      this.fieldIdMap.set(numericId, field);

      // Map field name to numeric ID for backward compatibility
      this.fieldNameToIdMap.set(name, numericId);
    });

    console.log(`🗂️ Created ID-based mappings: ${this.fieldIdMap.size} field IDs, ${this.fieldNameToIdMap.size} name mappings`);

    // Debug: Show some Section 29 field mappings
    const section29Mappings = Array.from(this.fieldNameToIdMap.entries())
      .filter(([name]) => name.includes('Section29'))
      .slice(0, 5);

    console.log(`🎯 Sample Section 29 ID mappings:`, section29Mappings);
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
      console.log(`${indent}🔍 [DEPTH ${depth}] Analyzing path: "${prefix}" | Type: ${typeof data}`);

      if (!data || typeof data !== 'object') {
        console.log(`${indent}⏭️ Skipping non-object value at path: "${prefix}"`);
        return;
      }

      console.log(`${indent}📋 Object keys at "${prefix}":`, Object.keys(data));

      Object.entries(data).forEach(([key, val]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        console.log(`${indent}🔑 Processing key: "${key}" at path: "${path}"`);
        console.log(`${indent}📝 Value type: ${typeof val} | Is null: ${val === null} | Is undefined: ${val === undefined}`);

        if (val && typeof val === "object") {
          // Check if this is a Field<T> object
          if ('id' in val && 'value' in val) {
            console.log(`${indent}🎯 FOUND FIELD OBJECT at path: "${path}"`);
            console.log(`${indent}   📋 Full field object:`, JSON.stringify(val, null, 2));
            console.log(`${indent}   🆔 Field ID: "${val.id}"`);
            console.log(`${indent}   💾 Field Value: "${val.value}"`);
            console.log(`${indent}   📊 Value type: ${typeof val.value}`);
            console.log(`${indent}   ✅ Has ID: ${!!val.id}`);
            console.log(`${indent}   ✅ Has Value: ${val.value !== undefined}`);
            console.log(`${indent}   ✅ Value not empty: ${val.value !== ''}`);

            // Check the condition that was filtering fields
            const hasValidId = val.id && val.id !== '';
            const hasValidValue = val.value !== undefined && val.value !== '';
            console.log(`${indent}   🔍 Valid ID check: ${hasValidId}`);
            console.log(`${indent}   🔍 Valid Value check: ${hasValidValue}`);

            if (hasValidId && hasValidValue) {
              totalFields++;
              try {
                const idStr = String(val.id);
                const valueStr = val.value;
                console.log(`${indent}✅ PROCESSING FIELD: ${path}`);
                console.log(`${indent}   🆔 ID: "${idStr}"`);
                console.log(`${indent}   💾 Value: ${typeof valueStr === 'object' ? JSON.stringify(valueStr) : valueStr}`);

                let numericId: string | null = null;

                // Handle both numeric IDs and field name paths
                if (idStr.includes('form1[0]')) {
                  console.log(`${indent}🔍 Field ID appears to be a field name path, converting to numeric ID...`);

                  // This is a field name, convert to numeric ID using our mapping
                  numericId = this.fieldNameToIdMap.get(idStr) || null;

                  if (numericId) {
                    console.log(`${indent}✅ CONVERTED: Field name "${idStr}" → Numeric ID: "${numericId}"`);
                    idValueMap.set(numericId, valueStr);
                    console.log(`${indent}🗂️ MAPPED: "${idStr}" → ID:"${numericId}" → Value:"${valueStr}"`);
                  } else {
                    console.log(`${indent}❌ NO CONVERSION: No numeric ID found for field name: "${idStr}"`);

                    // Show similar field names for debugging
                    const similarFieldNames = Array.from(this.fieldNameToIdMap.keys()).filter(name =>
                      name.includes('Section29') ||
                      name.includes(idStr.split('.').pop() || '') ||
                      idStr.includes(name.split('.').pop() || '')
                    ).slice(0, 5);

                    console.log(`${indent}   🔍 Similar PDF field names:`, similarFieldNames);
                    errors.push(`No numeric ID found for field name: ${idStr}`);
                  }
                } else {
                  console.log(`${indent}🔢 Field ID appears to be numeric, using directly: "${idStr}"`);
                  numericId = idStr;

                  // Verify the numeric ID exists in our PDF
                  if (this.fieldIdMap.has(numericId)) {
                    idValueMap.set(numericId, valueStr);
                    console.log(`${indent}🗂️ MAPPED: Numeric ID:"${numericId}" → Value:"${valueStr}"`);
                  } else {
                    console.log(`${indent}❌ INVALID ID: Numeric ID "${numericId}" not found in PDF`);
                    errors.push(`Invalid numeric ID: ${numericId}`);
                  }
                }
              } catch (error) {
                console.error(`${indent}💥 ERROR mapping field at path "${path}":`, error);
                errors.push(`Error mapping field ${path}: ${error}`);
              }
            } else {
              console.log(`${indent}⚠️ SKIPPING FIELD: Invalid ID or value`);
              console.log(`${indent}   🆔 ID: "${val.id}" (valid: ${hasValidId})`);
              console.log(`${indent}   💾 Value: "${val.value}" (valid: ${hasValidValue})`);
            }
          } else {
            console.log(`${indent}📁 Object without id/value properties, recursing deeper...`);
            console.log(`${indent}   🔍 Object properties:`, Object.keys(val));
            flattenFormValues(val, path, depth + 1);
          }
        } else {
          console.log(`${indent}📄 Primitive value at "${path}": ${val}`);
        }
      });
    };

    console.log(`\n🚀 ===== DEEP FORM DATA ANALYSIS START =====`);
    console.log(`📊 Form Data Structure Overview:`);
    console.log(`   📋 Available sections:`, Object.keys(formData));
    console.log(`   📈 Total sections: ${Object.keys(formData).length}`);
    console.log(`   🔍 Full form data:`, JSON.stringify(formData, null, 2));

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
   * Generate a filled PDF from form values with comprehensive error handling
   */
  async generateFilledPdf(formData: ApplicantFormValues): Promise<PdfGenerationResult> {
    const result: PdfGenerationResult = {
      success: false,
      fieldsMapped: 0,
      fieldsApplied: 0,
      errors: [],
      warnings: []
    };

    try {
      console.log("Starting enhanced client-side PDF generation");

      // Make sure PDF is loaded
      if (!this.pdfDoc || !this.isLoaded) {
        await this.loadPdf();
      }

      if (!this.pdfDoc) {
        result.errors.push("Failed to load PDF document");
        return result;
      }

      // Map form values to PDF fields
      const mappingResult = await this.mapFormValuesToJsonData(this.fieldMapping, formData);
      result.fieldsMapped = mappingResult.stats.mapped;
      result.errors.push(...mappingResult.stats.errors);

      console.log(`\n🔍 ===== FIELD FILTERING FOR APPLICATION =====`);
      console.log(`📊 Total mapped fields before filtering: ${mappingResult.mappedFields.length}`);

      // ENHANCED: More selective filtering to exclude default/template values
      const appliedFields = mappingResult.mappedFields.filter((field, index) => {
        // Verbose logging for first 10 fields to better understand filtering
        const verbose = index < 10;
        if (verbose) {
          console.log(`\n🔍 [${index}] Evaluating field for application:`);
          console.log(`   🆔 Field ID: "${field.id}"`);
          console.log(`   📛 Field Name: "${field.name}"`);
          console.log(`   💾 Field Value: "${field.value}"`);
          console.log(`   📊 Value Type: ${typeof field.value}`);
          console.log(`   🏷️ Field Type: ${field.type || 'unknown'}`);
        }

        // Skip fields with null/undefined values
        if (field.value === null || field.value === undefined) {
          if (verbose) console.log(`   ❌ FILTERED OUT: Null/undefined value`);
          return false;
        }

        // Skip empty arrays
        if (Array.isArray(field.value) && field.value.length === 0) {
          if (verbose) console.log(`   ❌ FILTERED OUT: Empty array`);
          return false;
        }

        // Skip empty strings
        if (field.value === "") {
          if (verbose) console.log(`   ❌ FILTERED OUT: Empty string value`);
          return false;
        }

        // SIMPLIFIED: Since we fixed the root cause (template defaults),
        // we can now use simpler filtering logic
        // Only filter out clearly invalid values, let form data through

        // Include all other values (text fields, dropdowns, explicit selections)
        if (verbose) console.log(`   ✅ INCLUDED: Valid value ("${field.value}")`);
        return true;
      });

      console.log(`\n📊 ===== FILTERING RESULTS =====`);
      console.log(`📈 Fields before filtering: ${mappingResult.mappedFields.length}`);
      console.log(`📈 Fields after filtering: ${appliedFields.length}`);

      // Show sample of fields to apply
      console.log(`📋 Sample fields to apply (first 10):`,
        appliedFields.slice(0, 10).map(f => ({ id: f.id, name: f.name, value: f.value })));

      console.log(`\n🔧 ===== PDF FIELD APPLICATION PROCESS =====`);
      console.log(`🎯 Applying ${appliedFields.length} fields to PDF`);

      // Get the form and use our ID-based mapping for faster lookups
      const form = this.pdfDoc.getForm();
      const allPdfFields = form.getFields();

      console.log(`\n📄 ===== PDF FORM ANALYSIS =====`);
      console.log(`📊 Total PDF form fields available: ${allPdfFields.length}`);

      // Show Section 29 specific PDF fields (if any)
      const section29PdfFields = allPdfFields.filter(f => f.getName().includes('Section29'));
      if (section29PdfFields.length > 0) {
        console.log(`🎯 Section 29 PDF fields found: ${section29PdfFields.length}`);
        section29PdfFields.slice(0, 5).forEach((field, index) => {
          console.log(`   [${index}] "${field.getName()}" (ID: ${field.ref.tag.toString()})`);
        });
      }

      // ADDED: Enhanced field ID lookup with multiple strategies
      console.log(`\n🔧 ===== ENHANCED FIELD MAPPING =====`);
      console.log(`🗂️ Building comprehensive field lookup map`);

      // Create a more comprehensive lookup map
      const enhancedFieldMap = new Map();

      // Map by both ID and name for faster lookups
      allPdfFields.forEach(field => {
        const id = field.ref.tag.toString();
        const name = field.getName();

        // Store field by numeric ID
        enhancedFieldMap.set(id, field);

        // Store field by full name
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

      console.log(`🗂️ Enhanced field map created with ${enhancedFieldMap.size} entries`);

      // Apply values to fields with enhanced lookup strategy
      let appliedCount = 0;
      let skippedCount = 0;

      console.log(`\n🔧 ===== FIELD APPLICATION LOOP =====`);

      // Track success metrics for field types
      const successMetrics = {
        textField: { attempts: 0, success: 0 },
        dropdown: { attempts: 0, success: 0 },
        checkbox: { attempts: 0, success: 0 },
        radioGroup: { attempts: 0, success: 0 },
        unknown: { attempts: 0, success: 0 }
      };

      appliedFields.forEach((field, index) => {
        // Only log detailed info for first 20 fields to reduce verbosity
        const verbose = index < 20;

        if (verbose) {
          console.log(`\n--- 🔧 Processing Field [${index + 1}/${appliedFields.length}] ---`);
          console.log(`🆔 Field ID: "${field.id}"`);
          console.log(`📛 Field Name: "${field.name}"`);
          console.log(`💾 Field Value: "${field.value}"`);
        }

        // ENHANCED: Optimized field lookup strategy prioritizing ID-based mapping
        let pdfField: any = null;
        let lookupMethod = '';

        // Step 1: Check if field.id is already a numeric ID
        if (this.isNumericId(field.id)) {
          if (verbose) console.log(`🔢 Field ID is numeric: "${field.id}"`);

          if (this.fieldIdMap.has(field.id)) {
            pdfField = this.fieldIdMap.get(field.id);
            lookupMethod = 'direct-numeric-id';
            if (verbose) console.log(`✅ Direct numeric ID lookup successful`);
          } else {
            if (verbose) console.log(`❌ Numeric ID "${field.id}" not found in PDF`);
          }
        }
        // Step 2: Try primary ID lookup (for field name paths)
        else if (this.fieldIdMap.has(field.id)) {
          pdfField = this.fieldIdMap.get(field.id);
          lookupMethod = 'primary-id';
          if (verbose) console.log(`✅ Primary ID lookup successful`);
        }
        // Step 3: Convert field name to numeric ID
        else {
          const numericId = this.extractNumericId(field.id);
          if (numericId && this.fieldIdMap.has(numericId)) {
            pdfField = this.fieldIdMap.get(numericId);
            lookupMethod = 'converted-to-numeric-id';
            if (verbose) console.log(`✅ Field name converted to numeric ID: "${field.id}" → "${numericId}"`);
          } else if (verbose) {
            console.log(`❌ No numeric ID conversion available for: "${field.id}"`);
          }
        }

        // Step 4: Try additional fallback methods if no PDF field found yet
        if (!pdfField) {
          // Try fallback name lookup
          if (this.fieldNameToIdMap.has(field.name)) {
            const fallbackId = this.fieldNameToIdMap.get(field.name);
            if (fallbackId && this.fieldIdMap.has(fallbackId)) {
              pdfField = this.fieldIdMap.get(fallbackId);
              lookupMethod = 'name-to-id';
              if (verbose) console.log(`✅ Fallback name lookup successful: "${field.name}" → "${fallbackId}"`);
            }
          }
          // Try enhanced lookup map
          else if (enhancedFieldMap.has(field.id)) {
            pdfField = enhancedFieldMap.get(field.id);
            lookupMethod = 'enhanced-id';
            if (verbose) console.log(`✅ Enhanced ID lookup successful`);
          }
          else if (enhancedFieldMap.has(field.name)) {
            pdfField = enhancedFieldMap.get(field.name);
            lookupMethod = 'enhanced-name';
            if (verbose) console.log(`✅ Enhanced name lookup successful`);
          }
          // Try lookup by last part of name/id as final fallback
          else {
            const idPart = String(field.id).split(/[.\[\]]/).pop() || '';
            const namePart = String(field.name).split(/[.\[\]]/).pop() || '';

            if (idPart && enhancedFieldMap.has(idPart)) {
              pdfField = enhancedFieldMap.get(idPart);
              lookupMethod = 'id-part';
              if (verbose) console.log(`✅ ID part lookup successful: "${idPart}"`);
            }
            else if (namePart && enhancedFieldMap.has(namePart)) {
              pdfField = enhancedFieldMap.get(namePart);
              lookupMethod = 'name-part';
              if (verbose) console.log(`✅ Name part lookup successful: "${namePart}"`);
            }
          }
        }

        if (pdfField) {
          if (verbose) {
            console.log(`✅ PDF field found! Method: ${lookupMethod}`);
            console.log(`📊 PDF Field Type: ${pdfField.constructor.name}`);
            console.log(`📛 PDF Field Name: "${pdfField.getName()}"`);
          }

          try {
            if (pdfField instanceof PDFTextField) {
              successMetrics.textField.attempts++;
              const textValue = String(field.value);
              if (verbose) console.log(`📝 Setting text field to: "${textValue}"`);
              pdfField.setText(textValue);
              successMetrics.textField.success++;
              appliedCount++;
            }
            else if (pdfField instanceof PDFDropdown || pdfField instanceof PDFRadioGroup) {
              const isDropdown = pdfField instanceof PDFDropdown;
              successMetrics[isDropdown ? 'dropdown' : 'radioGroup'].attempts++;

              const selectValue = String(field.value);
              if (verbose) console.log(`📋 Setting ${isDropdown ? 'dropdown' : 'radio'} to: "${selectValue}"`);

              // ENHANCED: Get available options for both dropdowns and radio groups
              let options: string[] = [];
              if (isDropdown) {
                options = pdfField.getOptions();
                if (verbose) console.log(`   📋 Dropdown available options:`, options);
              } else {
                // For radio groups, get options differently
                try {
                  options = pdfField.getOptions();
                  if (verbose) console.log(`   📋 Radio group available options:`, options);
                } catch (error) {
                  if (verbose) console.log(`   ⚠️ Could not get radio group options:`, error);
                  // For radio groups without explicit options, try common values
                  options = ['YES', 'NO', 'Yes', 'No', 'true', 'false', '1', '0'];
                  if (verbose) console.log(`   🔄 Using fallback radio options:`, options);
                }
              }

              // Enhanced option matching for both field types
              let matchedValue = selectValue;
              let optionMatched = false;

              if (options.length > 0) {
                // First try exact match
                if (options.includes(selectValue)) {
                  matchedValue = selectValue;
                  optionMatched = true;
                  if (verbose) console.log(`   ✅ Exact match found: "${selectValue}"`);
                } else {
                  // Try case-insensitive match
                  const caseInsensitiveMatch = options.find(
                    opt => opt.toLowerCase() === selectValue.toLowerCase()
                  );

                  if (caseInsensitiveMatch) {
                    matchedValue = caseInsensitiveMatch;
                    optionMatched = true;
                    if (verbose) console.log(`   🔄 Case-insensitive match: "${selectValue}" → "${caseInsensitiveMatch}"`);
                  } else {
                    // For radio groups, try common value mappings
                    if (!isDropdown) {
                      const lowerValue = selectValue.toLowerCase();
                      if (lowerValue === 'no' || lowerValue === 'false' || lowerValue === '0') {
                        const noOption = options.find(opt => opt.toLowerCase() === 'no' || opt === '0' || opt.toLowerCase() === 'false');
                        if (noOption) {
                          matchedValue = noOption;
                          optionMatched = true;
                          if (verbose) console.log(`   🔄 Mapped "${selectValue}" to NO option: "${noOption}"`);
                        }
                      } else if (lowerValue === 'yes' || lowerValue === 'true' || lowerValue === '1') {
                        const yesOption = options.find(opt => opt.toLowerCase() === 'yes' || opt === '1' || opt.toLowerCase() === 'true');
                        if (yesOption) {
                          matchedValue = yesOption;
                          optionMatched = true;
                          if (verbose) console.log(`   🔄 Mapped "${selectValue}" to YES option: "${yesOption}"`);
                        }
                      }
                    }

                    if (!optionMatched) {
                      if (verbose) console.log(`   ⚠️ No matching option found for "${selectValue}" in:`, options);
                      if (verbose) console.log(`   🔄 Attempting to set value anyway...`);
                    }
                  }
                }
              } else {
                if (verbose) console.log(`   ⚠️ No options available, setting value directly`);
              }

              // Apply the value
              try {
                pdfField.select(matchedValue);
                if (verbose) console.log(`   ✅ Successfully set ${isDropdown ? 'dropdown' : 'radio'} to: "${matchedValue}"`);
                successMetrics[isDropdown ? 'dropdown' : 'radioGroup'].success++;
                appliedCount++;
              } catch (selectError) {
                if (verbose) console.log(`   ❌ Failed to select "${matchedValue}":`, selectError);
                // For radio groups, try alternative approach
                if (!isDropdown) {
                  try {
                    // Try to set the value directly on the radio group
                    if (verbose) console.log(`   🔄 Trying alternative radio group approach...`);
                    (pdfField as any).setValue?.(matchedValue);
                    successMetrics.radioGroup.success++;
                    appliedCount++;
                    if (verbose) console.log(`   ✅ Alternative approach succeeded`);
                  } catch (altError) {
                    if (verbose) console.log(`   ❌ Alternative approach also failed:`, altError);
                    throw selectError; // Re-throw original error
                  }
                } else {
                  throw selectError; // Re-throw for dropdowns
                }
              }
            }
            else if (pdfField instanceof PDFCheckBox) {
              successMetrics.checkbox.attempts++;
              const strValue = String(field.value).toLowerCase();
              if (verbose) console.log(`☑️ Setting checkbox, value: "${strValue}"`);

              // More flexible checkbox value handling
              if (strValue === "yes" || strValue === "true" || strValue === "1" || strValue === "checked") {
                pdfField.check();
              } else {
                pdfField.uncheck();
              }

              successMetrics.checkbox.success++;
              appliedCount++;
            }
            else {
              successMetrics.unknown.attempts++;
              if (verbose) {
                console.log(`⚠️ UNKNOWN FIELD TYPE: ${pdfField.constructor.name}`);
                console.log(`   🔍 Available methods:`, Object.getOwnPropertyNames(Object.getPrototypeOf(pdfField)));
              }
              result.warnings.push(`Unknown field type: ${pdfField.constructor.name} for field ${field.name}`);
            }
          } catch (error) {
            if (verbose) {
              console.error(`💥 ERROR setting field "${field.name}":`, error);
              console.error(`   🔍 Error details:`, {
                message: error instanceof Error ? error.message : String(error),
                fieldName: field.name,
                fieldValue: field.value,
                pdfFieldType: pdfField.constructor.name
              });
            }
            result.errors.push(`Error setting field ${field.name}: ${error}`);
          }
        } else {
          if (verbose) {
            console.log(`❌ PDF FIELD NOT FOUND: "${field.id}" / "${field.name}"`);
          }
          skippedCount++;
          result.warnings.push(`PDF field not found: ${field.id} / ${field.name}`);
        }
      });

      console.log(`\n📊 ===== FIELD APPLICATION METRICS =====`);
      console.log(`✅ Total fields applied: ${appliedCount}/${appliedFields.length} (${((appliedCount/appliedFields.length)*100).toFixed(1)}%)`);
      console.log(`❌ Fields skipped (not found): ${skippedCount}`);

      // Track lookup method effectiveness
      const lookupMethodStats = new Map<string, number>();
      appliedFields.forEach((field) => {
        // Re-run lookup logic to track method used (simplified version)
        let method = 'unknown';
        if (this.isNumericId(field.id) && this.fieldIdMap.has(field.id)) {
          method = 'direct-numeric-id';
        } else if (this.fieldIdMap.has(field.id)) {
          method = 'primary-id';
        } else if (this.extractNumericId(field.id)) {
          method = 'converted-to-numeric-id';
        } else {
          method = 'fallback-methods';
        }
        lookupMethodStats.set(method, (lookupMethodStats.get(method) || 0) + 1);
      });

      console.log(`📊 Lookup method effectiveness:`);
      lookupMethodStats.forEach((count, method) => {
        const percentage = ((count / appliedFields.length) * 100).toFixed(1);
        console.log(`   ${method}: ${count}/${appliedFields.length} (${percentage}%)`);
      });

      console.log(`📊 Success by field type:`);
      Object.entries(successMetrics).forEach(([type, {attempts, success}]) => {
        if (attempts > 0) {
          const rate = ((success/attempts)*100).toFixed(1);
          console.log(`   ${type}: ${success}/${attempts} (${rate}%)`);
        }
      });

      result.fieldsApplied = appliedCount;

      // Save the PDF
      const modifiedPdfBytes = await this.pdfDoc.save();
      result.pdfBytes = new Uint8Array(modifiedPdfBytes);
      result.success = true;

      return result;
    } catch (error) {
      console.error("Error generating PDF:", error);
      result.errors.push(`PDF generation failed: ${error}`);
      return result;
    }
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
   * Download the generated PDF - enhanced version with better browser compatibility
   */
  downloadPdf(pdfBytes: Uint8Array, filename = 'SF86-filled.pdf'): void {
    try {
      console.log(`Starting PDF download: ${filename}, size: ${pdfBytes.length} bytes`);

      // Create blob with PDF data
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
      // Trigger download
      link.click();
      console.log('Download link clicked');

      // Clean up after a short delay to ensure download starts
      setTimeout(() => {
        try {
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
          console.log('Download cleanup completed');
        } catch (cleanupError) {
          console.warn('Error during download cleanup:', cleanupError);
        }
      }, 100);

      console.log(`PDF download initiated successfully: ${filename}`);
    } catch (error) {
      console.error('Error during PDF download:', error);

      // Fallback method using window.open
      try {
        console.log('Attempting fallback download method...');
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');

        if (newWindow) {
          // Set a title for the new window
          newWindow.document.title = filename;
          console.log('PDF opened in new window as fallback');
        } else {
          throw new Error('Failed to open PDF in new window - popup blocked?');
        }

        // Clean up URL after delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
      } catch (fallbackError) {
        console.error('Fallback download method also failed:', fallbackError);
        alert(`PDF download failed. Error: ${error}\nFallback error: ${fallbackError}\n\nPlease check your browser's download settings and popup blocker.`);
      }
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
    console.log(`Found ${sectionFields.length} fields in section ${sectionName}`);

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

      // Store by name parts for partial matches
      const nameParts = name.split(/[.\[\]]/);
      nameParts.forEach(part => {
        if (part && part.length > 3) {
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

      // Try all lookup methods
      const lookupResults: Record<string, any> = {
        fieldId: field.id,
        fieldValue: field.value,
        directMatch: null,
        nameMatch: null,
        enhancedMatch: null,
        partMatch: null
      };

      // Direct ID match
      if (this.fieldIdMap.has(field.id)) {
        const pdfField = this.fieldIdMap.get(field.id);
        lookupResults.directMatch = {
          found: true,
          fieldName: pdfField.getName(),
          fieldType: pdfField.constructor.name
        };
      }

      // Name match
      if (this.fieldNameToIdMap.has(field.id)) {
        const numericId = this.fieldNameToIdMap.get(field.id);
        if (numericId && this.fieldIdMap.has(numericId)) {
          const pdfField = this.fieldIdMap.get(numericId);
          lookupResults.nameMatch = {
            found: true,
            fieldName: pdfField.getName(),
            fieldType: pdfField.constructor.name
          };
        }
      }

      // Enhanced map match
      if (enhancedFieldMap.has(field.id)) {
        const pdfField = enhancedFieldMap.get(field.id);
        lookupResults.enhancedMatch = {
          found: true,
          fieldName: pdfField.getName(),
          fieldType: pdfField.constructor.name
        };
      }

      // Part match
      const idPart = String(field.id).split(/[.\[\]]/).pop() || '';
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
}

// Create and export a singleton instance
export const clientPdfService2 = new ClientPdfService2();
