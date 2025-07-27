import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFName, PDFString } from 'pdf-lib';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Interfaces for validation results
export interface FieldValidationResult {
  fieldId: string;
  fieldName: string;
  expectedValue: any;
  actualValue: any;
  isValid: boolean;
  error?: string;
  suggestions?: string[];
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PageValidationResult {
  pageNumber: number;
  totalFields: number;
  validFields: number;
  invalidFields: number;
  fields: FieldValidationResult[];
  pageImagePath?: string;
  pageDataPath?: string;
}

export interface PdfValidationReport {
  success: boolean;
  totalPages: number;
  totalFields: number;
  validFields: number;
  invalidFields: number;
  pages: PageValidationResult[];
  errors: string[];
  warnings: string[];
  processingTime: number;
}

export interface FieldCorrectionSuggestion {
  fieldId: string;
  fieldName: string;
  currentValue: any;
  suggestedValue: any;
  reason: string;
  confidence: number;
}

/**
 * PDF Validation Service
 *
 * This service processes PDFs in memory and validates field inputs page by page.
 * It integrates with existing utilities (pdf-to-images, extract-pdf-fields, clear-data)
 * to provide comprehensive field validation and correction capabilities.
 */
class PdfValidationService {
  private pdfDoc: PDFDocument | null = null;
  private pdfBytes: Uint8Array | null = null;
  private outputDir: string;
  private photosDir: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'PDFoutput');
    this.photosDir = path.join(__dirname, '..', 'PDFphotos');
  }

  /**
   * Main validation workflow - processes PDF in memory
   */
  async validatePdfInMemory(
    pdfBytes: Uint8Array,
    targetPages: number[] = [],
    options: {
      generateImages?: boolean;
      extractFields?: boolean;
      validateFields?: boolean;
      correctFields?: boolean;
    } = {}
  ): Promise<PdfValidationReport> {
    const startTime = Date.now();
    const report: PdfValidationReport = {
      success: false,
      totalPages: 0,
      totalFields: 0,
      validFields: 0,
      invalidFields: 0,
      pages: [],
      errors: [],
      warnings: [],
      processingTime: 0
    };

    try {
      console.log('🚀 Starting PDF validation workflow...');

      // Step 1: Load PDF in memory
      this.pdfBytes = pdfBytes;
      this.pdfDoc = await PDFDocument.load(pdfBytes);
      report.totalPages = this.pdfDoc.getPageCount();

      console.log(`📄 PDF loaded: ${report.totalPages} pages, ${pdfBytes.length} bytes`);

      // Step 2: Determine pages to process
      const pagesToProcess = targetPages.length > 0 ? targetPages : [17]; // Default to page 17
      console.log(`🎯 Processing pages: ${pagesToProcess.join(', ')}`);

      // Step 3: Clear previous data
      await this.clearPreviousData();

      // Step 4: Generate images if requested
      if (options.generateImages !== false) {
        await this.generatePageImages();
      }

      // Step 5: Extract field data if requested
      if (options.extractFields !== false) {
        await this.extractFieldData(pagesToProcess);
      }

      // Step 6: Validate fields page by page
      if (options.validateFields !== false) {
        for (const pageNumber of pagesToProcess) {
          const pageResult = await this.validatePage(pageNumber);
          report.pages.push(pageResult);
          report.totalFields += pageResult.totalFields;
          report.validFields += pageResult.validFields;
          report.invalidFields += pageResult.invalidFields;
        }
      }

      // Step 7: Generate field corrections if requested
      if (options.correctFields === true) {
        await this.generateFieldCorrections(report);
      }

      report.success = true;
      report.processingTime = Date.now() - startTime;

      console.log(`✅ PDF validation completed in ${report.processingTime}ms`);
      console.log(`📊 Results: ${report.validFields}/${report.totalFields} fields valid`);

      return report;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ PDF validation failed:', errorMessage);
      report.errors.push(errorMessage);
      report.processingTime = Date.now() - startTime;
      return report;
    }
  }

  /**
   * Clear previous validation data
   */
  private async clearPreviousData(): Promise<void> {
    try {
      console.log('🧹 Clearing previous validation data...');

      // Clear PDFoutput directory
      try {
        const outputFiles = await fs.readdir(this.outputDir);
        for (const file of outputFiles) {
          if (file.endsWith('.json')) {
            await fs.unlink(path.join(this.outputDir, file));
          }
        }
        console.log(`🗑️ Cleared ${outputFiles.length} JSON files from PDFoutput`);
      } catch (error) {
        console.warn('⚠️ Could not clear PDFoutput directory:', error);
      }

      // Clear PDFphotos directory
      try {
        const photoFiles = await fs.readdir(this.photosDir);
        for (const file of photoFiles) {
          if (file.endsWith('.png')) {
            await fs.unlink(path.join(this.photosDir, file));
          }
        }
        console.log(`🗑️ Cleared ${photoFiles.length} PNG files from PDFphotos`);
      } catch (error) {
        console.warn('⚠️ Could not clear PDFphotos directory:', error);
      }
    } catch (error) {
      console.warn('⚠️ Error during data clearing:', error);
    }
  }

  /**
   * Generate page images using pdf-to-images script
   */
  private async generatePageImages(): Promise<void> {
    if (!this.pdfBytes) {
      throw new Error('PDF bytes not available for image generation');
    }

    try {
      console.log('📸 Generating page images...');

      // Save PDF to temporary file for processing
      const tempPdfPath = path.join(__dirname, '..', '..', 'workspace', 'temp_validation.pdf');
      await fs.writeFile(tempPdfPath, this.pdfBytes);

      // Run pdf-to-images script
      await this.runScript('pdf-to-images', [tempPdfPath]);

      // Clean up temporary file
      await fs.unlink(tempPdfPath);

      console.log('✅ Page images generated successfully');
    } catch (error) {
      console.error('❌ Failed to generate page images:', error);
      throw error;
    }
  }

  /**
   * Extract field data using pdf-page-field-extractor script
   */
  private async extractFieldData(pages: number[]): Promise<void> {
    if (!this.pdfBytes) {
      throw new Error('PDF bytes not available for field extraction');
    }

    try {
      console.log(`📊 Extracting field data for pages: ${pages.join(', ')}`);

      // Save PDF to temporary file for processing
      const tempPdfPath = path.join(__dirname, '..', '..', 'workspace', 'temp_validation.pdf');
      await fs.writeFile(tempPdfPath, this.pdfBytes);

      // Format page range for script
      const pageRange = pages.length === 1 ? pages[0].toString() :
                       pages.length === 2 ? pages.join(',') :
                       `${Math.min(...pages)}-${Math.max(...pages)}`;

      // Run field extraction script
      await this.runScript('extract-pdf-fields', [tempPdfPath, pageRange]);

      // Clean up temporary file
      await fs.unlink(tempPdfPath);

      console.log('✅ Field data extracted successfully');
    } catch (error) {
      console.error('❌ Failed to extract field data:', error);
      throw error;
    }
  }

  /**
   * Run a script utility
   */
  private async runScript(scriptName: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const scriptMap = {
        'pdf-to-images': 'scripts/pdf-to-images.js',
        'extract-pdf-fields': 'scripts/pdf-page-field-extractor.js',
        'clear-data': 'scripts/clear-data.js'
      };

      const scriptPath = scriptMap[scriptName as keyof typeof scriptMap];
      if (!scriptPath) {
        reject(new Error(`Unknown script: ${scriptName}`));
        return;
      }

      const fullScriptPath = path.join(__dirname, '..', '..', scriptPath);
      const process = spawn('node', [fullScriptPath, ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: path.join(__dirname, '..', '..')
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Script ${scriptName} completed successfully`);
          if (stdout) console.log('📄 Output:', stdout);
          resolve();
        } else {
          console.error(`❌ Script ${scriptName} failed with code ${code}`);
          if (stderr) console.error('📄 Error:', stderr);
          reject(new Error(`Script ${scriptName} failed: ${stderr || 'Unknown error'}`));
        }
      });

      process.on('error', (error: any) => {
        reject(new Error(`Failed to start script ${scriptName}: ${error.message}`));
      });
    });
  }

  /**
   * Validate a specific page
   */
  private async validatePage(pageNumber: number): Promise<PageValidationResult> {
    console.log(`🔍 Validating page ${pageNumber}...`);

    const result: PageValidationResult = {
      pageNumber,
      totalFields: 0,
      validFields: 0,
      invalidFields: 0,
      fields: [],
      pageImagePath: path.join(this.photosDir, `page${pageNumber}.png`),
      pageDataPath: path.join(this.outputDir, `page${pageNumber}.json`)
    };

    try {
      // Load page field data
      const pageData = await this.loadPageData(pageNumber);
      if (!pageData) {
        console.warn(`⚠️ No field data found for page ${pageNumber}`);
        return result;
      }

      result.totalFields = pageData.fields.length;
      console.log(`📊 Found ${result.totalFields} fields on page ${pageNumber}`);

      // Validate each field
      for (const field of pageData.fields) {
        const fieldResult = await this.validateField(field, pageNumber);
        result.fields.push(fieldResult);

        if (fieldResult.isValid) {
          result.validFields++;
        } else {
          result.invalidFields++;
        }
      }

      console.log(`✅ Page ${pageNumber} validation complete: ${result.validFields}/${result.totalFields} valid`);
      return result;

    } catch (error) {
      console.error(`❌ Error validating page ${pageNumber}:`, error);
      return result;
    }
  }

  /**
   * Load page field data from JSON file
   */
  private async loadPageData(pageNumber: number): Promise<any> {
    try {
      const dataPath = path.join(this.outputDir, `page${pageNumber}.json`);
      const data = await fs.readFile(dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn(`⚠️ Could not load page data for page ${pageNumber}:`, error);
      return null;
    }
  }

  /**
   * Validate an individual field
   */
  private async validateField(field: any, pageNumber: number): Promise<FieldValidationResult> {
    const result: FieldValidationResult = {
      fieldId: field.id,
      fieldName: field.name,
      expectedValue: field.value,
      actualValue: field.value,
      isValid: true,
      coordinates: field.rect
    };

    try {
      // Basic validation rules
      const validationRules = this.getValidationRules(field);

      for (const rule of validationRules) {
        const ruleResult = await rule.validate(field);
        if (!ruleResult.isValid) {
          result.isValid = false;
          result.error = ruleResult.error;
          result.suggestions = ruleResult.suggestions;
          break;
        }
      }

      // Log validation result for debugging
      if (!result.isValid) {
        console.log(`❌ Field validation failed: ${field.name} - ${result.error}`);
      }

    } catch (error) {
      result.isValid = false;
      result.error = `Validation error: ${error instanceof Error ? error.message : String(error)}`;
    }

    return result;
  }

  /**
   * Get validation rules for a field
   */
  private getValidationRules(field: any): ValidationRule[] {
    const rules: ValidationRule[] = [];

    // Add basic validation rules
    rules.push(new RequiredFieldRule());
    rules.push(new DataTypeRule());
    rules.push(new FieldLengthRule());

    // Add field-specific rules based on field name/type
    if (field.name.includes('Date') || field.label?.includes('date')) {
      rules.push(new DateFormatRule());
    }

    if (field.name.includes('Phone') || field.label?.includes('phone')) {
      rules.push(new PhoneFormatRule());
    }

    if (field.name.includes('Email') || field.label?.includes('email')) {
      rules.push(new EmailFormatRule());
    }

    if (field.name.includes('Zip') || field.label?.includes('zip')) {
      rules.push(new ZipCodeRule());
    }

    return rules;
  }

  /**
   * Generate field corrections for invalid fields
   */
  private async generateFieldCorrections(report: PdfValidationReport): Promise<void> {
    console.log('🔧 Generating field corrections...');

    const corrections: FieldCorrectionSuggestion[] = [];

    for (const page of report.pages) {
      for (const field of page.fields) {
        if (!field.isValid && field.suggestions && field.suggestions.length > 0) {
          corrections.push({
            fieldId: field.fieldId,
            fieldName: field.fieldName,
            currentValue: field.actualValue,
            suggestedValue: field.suggestions[0], // Use first suggestion
            reason: field.error || 'Field validation failed',
            confidence: 0.8 // Default confidence
          });
        }
      }
    }

    if (corrections.length > 0) {
      // Save corrections to file
      const correctionsPath = path.join(this.outputDir, 'field_corrections.json');
      await fs.writeFile(correctionsPath, JSON.stringify(corrections, null, 2));
      console.log(`💾 Saved ${corrections.length} field corrections to ${correctionsPath}`);
    } else {
      console.log('✅ No field corrections needed');
    }
  }

  /**
   * Validate specific page with visual inspection
   */
  async validatePageWithVisualInspection(pageNumber: number): Promise<PageValidationResult> {
    console.log(`🔍 Starting visual validation for page ${pageNumber}...`);

    // Ensure we have the necessary data
    const pageImagePath = path.join(this.photosDir, `page${pageNumber}.png`);
    const pageDataPath = path.join(this.outputDir, `page${pageNumber}.json`);

    try {
      // Check if image exists
      await fs.access(pageImagePath);
      console.log(`📸 Page image available: ${pageImagePath}`);
    } catch {
      console.warn(`⚠️ Page image not found: ${pageImagePath}`);
    }

    try {
      // Check if data exists
      await fs.access(pageDataPath);
      console.log(`📊 Page data available: ${pageDataPath}`);
    } catch {
      console.warn(`⚠️ Page data not found: ${pageDataPath}`);
    }

    // Perform validation
    return await this.validatePage(pageNumber);
  }

  /**
   * Get validation summary for all processed pages
   */
  getValidationSummary(report: PdfValidationReport): string {
    const summary = [
      `📊 PDF Validation Summary`,
      `=========================`,
      `📄 Total Pages: ${report.totalPages}`,
      `📋 Total Fields: ${report.totalFields}`,
      `✅ Valid Fields: ${report.validFields}`,
      `❌ Invalid Fields: ${report.invalidFields}`,
      `📈 Success Rate: ${report.totalFields > 0 ? ((report.validFields / report.totalFields) * 100).toFixed(2) : 0}%`,
      `⏱️ Processing Time: ${report.processingTime}ms`,
      ``,
      `📋 Page Details:`,
      ...report.pages.map(page =>
        `  Page ${page.pageNumber}: ${page.validFields}/${page.totalFields} valid fields`
      ),
      ``
    ];

    if (report.errors.length > 0) {
      summary.push(`❌ Errors:`, ...report.errors.map(e => `  - ${e}`), ``);
    }

    if (report.warnings.length > 0) {
      summary.push(`⚠️ Warnings:`, ...report.warnings.map(w => `  - ${w}`), ``);
    }

    return summary.join('\n');
  }
}

// Validation rule interfaces and classes
interface ValidationRule {
  validate(field: any): Promise<ValidationResult>;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
}

class RequiredFieldRule implements ValidationRule {
  async validate(field: any): Promise<ValidationResult> {
    // Check if required fields have values
    if (field.label?.includes('*') || field.label?.includes('required')) {
      if (!field.value || field.value === '') {
        return {
          isValid: false,
          error: 'Required field is empty',
          suggestions: ['Please provide a value for this required field']
        };
      }
    }
    return { isValid: true };
  }
}

class DataTypeRule implements ValidationRule {
  async validate(field: any): Promise<ValidationResult> {
    // Basic data type validation
    if (field.type === 'PDFCheckBox') {
      if (field.value !== null && typeof field.value !== 'boolean') {
        return {
          isValid: false,
          error: 'Checkbox field should have boolean value',
          suggestions: ['true', 'false']
        };
      }
    }
    return { isValid: true };
  }
}

class FieldLengthRule implements ValidationRule {
  async validate(field: any): Promise<ValidationResult> {
    if (field.type === 'PDFTextField' && field.value && typeof field.value === 'string') {
      // Check for reasonable length limits
      if (field.value.length > 1000) {
        return {
          isValid: false,
          error: 'Text field value is too long',
          suggestions: [field.value.substring(0, 1000)]
        };
      }
    }
    return { isValid: true };
  }
}

class DateFormatRule implements ValidationRule {
  async validate(field: any): Promise<ValidationResult> {
    if (field.value && typeof field.value === 'string') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(field.value)) {
        return {
          isValid: false,
          error: 'Invalid date format, expected YYYY-MM-DD',
          suggestions: ['2023-01-15', '2024-12-31']
        };
      }
    }
    return { isValid: true };
  }
}

class PhoneFormatRule implements ValidationRule {
  async validate(field: any): Promise<ValidationResult> {
    if (field.value && typeof field.value === 'string') {
      const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
      if (!phoneRegex.test(field.value)) {
        return {
          isValid: false,
          error: 'Invalid phone format, expected XXX-XXX-XXXX',
          suggestions: ['555-123-4567']
        };
      }
    }
    return { isValid: true };
  }
}

class EmailFormatRule implements ValidationRule {
  async validate(field: any): Promise<ValidationResult> {
    if (field.value && typeof field.value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        return {
          isValid: false,
          error: 'Invalid email format',
          suggestions: ['user@example.com']
        };
      }
    }
    return { isValid: true };
  }
}

class ZipCodeRule implements ValidationRule {
  async validate(field: any): Promise<ValidationResult> {
    if (field.value && typeof field.value === 'string') {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(field.value)) {
        return {
          isValid: false,
          error: 'Invalid ZIP code format, expected XXXXX or XXXXX-XXXX',
          suggestions: ['12345', '12345-6789']
        };
      }
    }
    return { isValid: true };
  }
}

export default PdfValidationService;
