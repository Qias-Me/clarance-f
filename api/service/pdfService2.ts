import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFName,
  PDFRadioGroup,
  PDFString,
  PDFTextField,
  PDFNumber,
  PDFArray,
  PDFPage,
  PDFForm,
  PDFField,
  PDFSignature,
  PDFDict,
  StandardFonts
} from "pdf-lib";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import type { ApplicantFormValues } from "../interfaces/formDefinition";
import path from "path";

// Handle __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface UserServiceResponse {
  success: boolean;
  formData?: ApplicantFormValues;
  message: string;
}

// interface PDFFormField {
//   name: string;
//   id: string;
//   type: "PDFTextField" | "PDFRadioGroup" | "PDFDropdown" | "PDFCheckBox";
//   value: string | string[] | undefined;
// }

// Interface for the extracted metadata
interface FieldMetadata {
  name: string;
  id: string;
  type: string;
  label?: string;
  value?: string | string[] | boolean; // Added boolean for checkbox values
  maxLength?: number;
  options?: string[];
  required?: boolean; // If pdf-lib supports this directly
  page?: number;     // Add page number property
  rect?: {          // Add rectangle coordinates
    x: number;      // Left position
    y: number;      // Bottom position
    width: number;  // Width of the field
    height: number; // Height of the field
  };
}

export class PdfService {

    //Simple Methods

  async mapFilledValuesfrom_PDF(pdfDoc: PDFDocument) {
    const form = pdfDoc.getForm();

    return form.getFields().reduce((acc, field) => {
      const type = field.constructor.name;
      const value =
        field instanceof PDFTextField
          ? field.getText()
          : field instanceof PDFDropdown
          ? field.getSelected()
          : field instanceof PDFCheckBox
          ? field.isChecked()
            ? "Yes"
            : undefined
          : field instanceof PDFRadioGroup
          ? field.getSelected()
          : undefined;


      if (value && (!Array.isArray(value) || value.length > 0)) {
        acc.push({
          name: field.getName(),
          id: field.ref.tag.toString(),
          label: field.acroField.dict.get(PDFName.of("TU"))?.toString(),
          type,
          value,
        });
      }
      return acc;
    }, [] as any[]);
  }

  async mapFormValuesToJsonData(json: any[], formValues: ApplicantFormValues) {
    const idValueMap = new Map<string, string>();

    const flattenFormValues = (data: any) => {
      Object.values(data).forEach((val: any) => {
        if (val && typeof val === "object") {
          if (val.id && "value" in val) {
            idValueMap.set(`${val.id} 0 R`, val.value);
          } else {
            flattenFormValues(val);
          }
        }
      });
    };

    flattenFormValues(formValues);

    json.forEach((item) => {
      if (idValueMap.has(item.id)) item.value = idValueMap.get(item.id);
    });

    return json;
  }


  async mapFormFields(pdfDoc: PDFDocument) {
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    const fieldData = fields.map((field) => {
      const name = field.getName();
      const type = field.constructor.name;
      const id = field.ref.tag.toString(); // Extract only the sequence of consecutive numbers
      let value: string | string[] | undefined = undefined;
      if (field instanceof PDFTextField) {
        value = field.getText();
      } else if (field instanceof PDFDropdown) {
        value = field.getSelected();
      } else if (field instanceof PDFCheckBox) {
        value = field.isChecked() ? "Yes" : "No";
      } else if (field instanceof PDFRadioGroup) {
        value = field.getSelected();
      }

      let label: string | undefined = undefined;

      const dict = field.acroField.dict;
      const tuRaw = dict.get(PDFName.of("TU"));
      if (tuRaw instanceof PDFString) {
          label = tuRaw.decodeText();
      }

      return {
        name,
        id,
        type,
        value,
        label
      };
    });

    return fieldData;
  }

  async setFieldValue(field: any, value: string) {
    if (field instanceof PDFTextField) field.setText(value);
    else if (field instanceof PDFDropdown || field instanceof PDFRadioGroup)
      field.select(value);
    else if (field instanceof PDFCheckBox)
      value.toLowerCase() === "yes" ? field.check() : field.uncheck();
  }

  public getFieldValue(field: any): string | string[] | boolean | undefined {
    if (field instanceof PDFTextField) {
      return field.getText();
    } else if (field instanceof PDFDropdown) {
      return field.getSelected();
    } else if (field instanceof PDFCheckBox) {
      return field.isChecked(); // Return boolean for checkboxes
    } else if (field instanceof PDFRadioGroup) {
      return field.getSelected();
    }
    return undefined; // Default for unknown or unhandled field types
  }

  //Advanced Methods

async applyValues_toPDF(formData: ApplicantFormValues): Promise<UserServiceResponse> {
  try {
    const pdfPath = join(__dirname, "../../tools/externalTools/sf861.pdf");
    const pdfDoc = await PDFDocument.load(fs.readFileSync(pdfPath));

    const fieldMapping = await this.mapFormFields(pdfDoc);
    const finalForm = await this.mapFormValuesToJsonData(fieldMapping, formData);

    fs.writeFileSync(
      join(__dirname, "../../tools/externalTools/Reference.json"),
      JSON.stringify(finalForm, null, 2)
    );

    const appliedFields = finalForm.filter(field => {
      // Skip fields with no value
      if (!field.value) return false;

      // Skip empty arrays
      if (Array.isArray(field.value) && field.value.length === 0) return false;

      // Skip "No", "NO", or empty string values
      if (field.value === "No" || field.value === "NO" || field.value === "") return false;

      // Include all other values
      return true;
    });

    fs.writeFileSync(
      join(__dirname, "../../tools/externalTools/Labels.json"),
      JSON.stringify(appliedFields, null, 2)
    );

    const form = pdfDoc.getForm();
    const fieldMap = new Map(form.getFields().map((f) => [f.getName(), f]));

    await Promise.all(
      finalForm.map(async ({ name, value }) => {
        if (value && fieldMap.has(name)) {
          await this.setFieldValue(fieldMap.get(name), value as string);
        }
      })
    );

    const modifiedPdfBytes = await pdfDoc.save();

    await fs.promises.writeFile(
      join(__dirname, "../../tools/externalTools/example.pdf"),
      modifiedPdfBytes
    );

    return { success: true, formData, message: "PDF filled successfully and saved." };
  } catch (error) {
    return { success: false, message: `Error processing PDF: ${error}` };
  }
}


async generateJSON_fromPDF(
    formData: ApplicantFormValues
  ): Promise<UserServiceResponse> {
    try {
      // Load the PDF from a local file
      const pdfPath = join(__dirname, "../../tools/externalTools/sf862.pdf"); // Adjust path if necessary
      const pdfBytes = fs.readFileSync(pdfPath);

      console.log("PDF loaded from file.");

      const pdfDoc = await PDFDocument.load(pdfBytes);

      console.log("PDF document loaded.");

      const fieldMapping = await this.mapFilledValuesfrom_PDF(pdfDoc);

      console.log("Form fields mapped. v1");

      // Convert object or array to JSON string
      const dataToWrite = JSON.stringify(fieldMapping, null, 2); // null and 2 for pretty formatting

      // // Write to file synchronously
      const myOutputPath = join(__dirname, "../../tools/externalTools/completedFields.json");
      fs.writeFileSync(myOutputPath, dataToWrite);

      console.log("Form values mapped to completedFields.json");
      console.log("PDF fields updated.");
      console.log("PDF saved to file.");

      return {
        success: true,
        formData,
        message: "PDF filled successfully and saved.",
      };
    } catch (error) {
      console.error(`Error processing PDF: ${error}`);
      return {
        success: false,
        message: `Error processing PDF: ${error}`,
      };
    }
  }

  async showAllFormFields(
    formData: ApplicantFormValues
  ): Promise<UserServiceResponse> {
    try {
      // Load the PDF from a local file
      const pdfPath = join(__dirname, "../../tools/externalTools/sf862.pdf"); // Adjust path if necessary
      const pdfBytes = fs.readFileSync(pdfPath);

      console.log("PDF loaded from file.");

      const pdfDoc = await PDFDocument.load(pdfBytes);

      console.log("PDF document loaded.");

      const fieldMapping = await this.mapFormFields(pdfDoc);

      console.log("Form fields mapped.");

      // Convert object or array to JSON string
      const dataToWrite = JSON.stringify(fieldMapping, null, 2); // null and 2 for pretty formatting

      // // Write to file synchronously
      const myOutputPath = join(__dirname, "../../tools/externalTools/allFieldsTo_JSON.json");
      fs.writeFileSync(myOutputPath, dataToWrite);

      console.log("Form values mapped to allFieldsTo_JSON.json");

      return {
        success: true,
        formData,
        message: "Fields Mapped successfully and saved.",
      };
    } catch (error) {
      console.error(`Error processing PDF: ${error}`);
      return {
        success: false,
        message: `Error processing PDF: ${error}`,
      };
    }
  }

  /**
   * Find which page a field is on
   */
  private async findPageForField(field: any, pdfDoc: PDFDocument): Promise<number | undefined> {
    try {
      // Get the field widget annotations to determine page
      const widget = field.acroField.getWidgets()[0];
      if (!widget) return undefined;

      // Get the page reference for this widget
      const pageRef = widget.P();
      if (!pageRef) return undefined;

      // Find the matching page by comparing page references
      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const page = pdfDoc.getPage(i);
        if (page.ref === pageRef) {
          return i + 1; // Return 1-based page index
        }
      }

      return undefined;
    } catch (error) {
      console.warn(`Could not determine page for field: ${field.getName()}`);
      return undefined;
    }
  }

  /**
   * Extract rectangle coordinates from a PDF field widget
   * This is a more reliable method for extracting coordinates
   */
  private extractRectFromWidget(widget: any): { x: number; y: number; width: number; height: number } | null {
    try {
      if (!widget) return null;

      // Get the Rect array from the widget dictionary
      // Use type assertion to handle the TypeScript type issue with dict property
      const widgetDict = (widget as any).dict;
      if (!widgetDict) return null;

      const rectArray = widgetDict.lookup(PDFName.of('Rect'));

      if (rectArray instanceof PDFArray && rectArray.size() === 4) {
        try {
          // PDF coordinates are [left, bottom, right, top]
          const x1 = rectArray.lookup(0, PDFNumber).asNumber();
          const y1 = rectArray.lookup(1, PDFNumber).asNumber();
          const x2 = rectArray.lookup(2, PDFNumber).asNumber();
          const y2 = rectArray.lookup(3, PDFNumber).asNumber();

          // Ensure coordinates are properly ordered (x1,y1 is lower-left) and round to 2 decimal places
          return {
            x: Math.round(Math.min(x1, x2) * 100) / 100,
            y: Math.round(Math.min(y1, y2) * 100) / 100,
            width: Math.round(Math.abs(x2 - x1) * 100) / 100,
            height: Math.round(Math.abs(y2 - y1) * 100) / 100
          };
        } catch (e) {
          console.warn('Error parsing rectangle array:', e);
          return null;
        }
      }
    } catch (e) {
      console.warn('Error accessing widget dictionary:', e);
    }

    return null;
  }

  /**
   * Find all annotations for a field on a specific page
   * This is used as a backup method for getting field coordinates
   */
  private findFieldAnnotationsOnPage(field: any, page: any): any[] {
    try {
      // Get all annotations on this page
      const annotations = page.node.lookup(PDFName.of('Annots'));
      if (!(annotations instanceof PDFArray)) return [];

      const fieldId = field.ref.toString();
      const fieldAnnotations = [];

      // Check each annotation to see if it belongs to our field
      for (let i = 0; i < annotations.size(); i++) {
        const annotation = annotations.lookup(i);
        if (!annotation) continue;

        // Check if this annotation belongs to our field
        // Use type assertion to handle the TypeScript type issue with dict property
        const annotDict = (annotation as any).dict;
        if (!annotDict) continue;

        // The annotation may refer to the field directly or via a Parent reference
        const parent = annotDict.get(PDFName.of('Parent'));
        const isDirectField = annotation.toString().includes(fieldId);
        const isParentField = parent && parent.toString().includes(fieldId);

        if (isDirectField || isParentField) {
          fieldAnnotations.push(annotation);
        }
      }

      return fieldAnnotations;
    } catch (e) {
      console.warn(`Error finding annotations for field: ${e}`);
      return [];
    }
  }

  /**
   * Extract field metadata from a PDF file
   * @param pdfPath Path to the PDF file
   * @returns Array of field metadata objects
   */
  public async extractFieldMetadata(
    pdfPath: string
  ): Promise<FieldMetadata[]> {
    console.log(`Extracting field metadata from: ${pdfPath}`);

    // Load the PDF document
    const pdfDoc = await this.loadPdf(pdfPath);
    if (!pdfDoc) {
      throw new Error("Failed to load PDF document");
    }

    // Get all form fields from the PDF
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    console.log(`PDF loaded successfully. Processing ${fields.length} form fields...`);

    // Extract field data
    const fieldDataList: FieldMetadata[] = [];
    const seenFieldIds = new Set<string>(); // Keep track of processed field IDs
    let directExtractionCount = 0;
    let annotationCount = 0;
    let backupCount = 0;
    let fallbackCount = 0;
    let checkboxSampleLogged = 0;
    let radioSampleLogged = 0;
    let textSampleLogged = 0;
    const SAMPLE_LOG_LIMIT = 3; // Log up to 3 samples for each type

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];

      // Get field properties
      const fieldName = field.getName();
      const fieldType = field.constructor.name;
      // Log the field type for every field
      // console.log(`Processing field: ${fieldName}, Type: ${fieldType}`);

      const widgets = field.acroField.getWidgets();
      const pages = this.getFieldPages(field, pdfDoc);
      const fieldId = field.ref.tag.toString();

      // Extract label from acroField dict
      let fieldLabel: string | undefined;
      try {
        const dict = field.acroField.dict;
        const tuRaw = dict.get(PDFName.of("TU"));
        if (tuRaw instanceof PDFString) {
          fieldLabel = tuRaw.decodeText();
        }

        // If TU not available, try TT (tooltip)
        if (!fieldLabel) {
          const ttRaw = dict.get(PDFName.of("TT"));
          if (ttRaw instanceof PDFString) {
            fieldLabel = ttRaw.decodeText();
          }
        }

        // If no label found, use a formatted version of the field name
        if (!fieldLabel) {
          fieldLabel = fieldName.replace(/([A-Z])/g, ' $1')
            .replace(/^_*/, '')
            .replace(/_/g, ' ')
            .trim();
        }
      } catch (error) {
        console.warn(`Could not extract label for field ${fieldName}: ${error}`);
      }

      // If we've already processed this fieldId, skip it
      if (seenFieldIds.has(fieldId)) {
        continue;
      }

      // Most fields have only one widget, but some may have multiple
      // We'll take the data from the first widget for deduplication purposes
      if (widgets.length > 0) {
        const widget = widgets[0]; // Process only the first widget for this field

        // Try to extract coordinates using different methods
        let coordinates = this.extractRectFromWidget(widget);
        let extractionMethod = "widget";

        if (coordinates) {
          directExtractionCount++;
        } else {
          // Try alternative method based on annotations
          coordinates = this.extractRectFromAnnotation(field, pdfDoc);
          extractionMethod = "annotation";
          if (coordinates) {
            annotationCount++;
          } else {
            // Try backup method
            coordinates = this.extractRectFromFieldObject(field);
            extractionMethod = "fieldObject";
            if (coordinates) {
              backupCount++;
            } else {
              // Last resort fallback: Use -1 to indicate failure to extract actual coordinates
              coordinates = { x: -1, y: -1, width: -1, height: -1 };
              extractionMethod = "fallback";
              fallbackCount++;
            }
          }
        }

        // Get page number (0-based)
        const pageIndex = this.getWidgetPage(widget, pdfDoc);

        // Log sample data
        const logSample = (type: string, currentLogged: number) => {
          if (currentLogged < SAMPLE_LOG_LIMIT) {
            console.log(`  [Sample] Type: ${fieldType}, Name: ${fieldName}, Label: ${fieldLabel}, Page: ${pageIndex !== null ? pageIndex + 1 : 'N/A'}, Coords: ${JSON.stringify(coordinates)}`);
            return currentLogged + 1;
          }
          return currentLogged;
        };

        if (fieldType === "PDFCheckBox") {
          checkboxSampleLogged = logSample("Checkbox", checkboxSampleLogged);
        } else if (fieldType === "PDFRadioGroup") {
          radioSampleLogged = logSample("RadioGroup", radioSampleLogged);
        } else if (fieldType === "PDFTextField") {
          textSampleLogged = logSample("TextField", textSampleLogged);

        } else {
          // Log any other field types encountered, just once per type for brevity
          if (!seenFieldIds.has(`otherTypeLogged_${fieldType}`)) {
            console.log(`  [Encountered other field type] Type: ${fieldType}, Name: ${fieldName}`);
            seenFieldIds.add(`otherTypeLogged_${fieldType}`);
          }
        }


        // Extract field options for dropdown and radio button fields
        let fieldOptions: string[] | undefined;
        try {
          fieldOptions = this.extractFieldOptions(field);
        } catch (error) {
          console.warn(`Could not extract options for field: ${fieldName}`, error);
          fieldOptions = undefined;
        }

        // Create field metadata object
        fieldDataList.push({
          id: fieldId,
          name: fieldName,
          type: fieldType,
          label: fieldLabel,
          value: this.getFieldValue(field),
          options: fieldOptions,
          page: pageIndex !== null ? pageIndex + 1 : undefined,
          rect: coordinates
        });
        seenFieldIds.add(fieldId); // Mark this fieldId as processed
      } else {
        // Fallback for fields without widgets (should also be unique by fieldId)
        if (!seenFieldIds.has(fieldId)) {
           console.warn(`Field '${fieldName}' (ID: ${fieldId}, Type: ${fieldType}) has no widgets. Using fallback coordinates.`);
          fieldDataList.push({
            id: fieldId,
            name: fieldName,
            type: fieldType,
            label: fieldLabel,
            value: this.getFieldValue(field),
            page: pages.length > 0 ? pages[0] + 1 : 1, // Use getFieldPages as fallback
            // Use -1 to indicate failure to extract actual coordinates
            rect: { x: -1, y: -1, width: -1, height: -1 }
          });
          fallbackCount++; // Count this as a fallback
          seenFieldIds.add(fieldId); // Mark this fieldId as processed
        }
      }
    }

    // Create debug report
    try {
      // Ensure the output directory exists
      const outputDir = path.join(process.cwd(), 'output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(outputDir, 'coordinates-debug.json'),
        JSON.stringify(fieldDataList, null, 2)
      );
    } catch (error) {
      console.error(`Could not save coordinates debug log: ${error}`);
    }

    // Count how many fields have valid coordinates
    const fieldsWithCoordinates = fieldDataList.filter(field => field.rect &&
      (field.rect.width > 0 || field.rect.height > 0)); // A width or height > 0 implies valid rect

    console.log(`Extracted coordinates for ${fieldsWithCoordinates.length} out of ${fieldDataList.length} unique fields (${(fieldDataList.length > 0 ? (fieldsWithCoordinates.length/fieldDataList.length*100) : 0).toFixed(1)}%)`);
    console.log(`Extraction method breakdown:
      - Direct widget extraction: ${directExtractionCount}
      - Annotation-based: ${annotationCount}
      - Backup method: ${backupCount}
      - Fallback (no widgets or all methods failed): ${fallbackCount}
    `);

    return fieldDataList;
  }

  /**
   * Validates PDF form fields for a specific section by setting values and reading them back
   *
   * @param sectionId Section ID
   * @param testValues Test values to set and validate
   * @returns Validation report
   */
  async validatePdfFormBySection(sectionId: number, testValues: Record<string, string>): Promise<{
    success: boolean;
    section: number;
    sectionName: string;
    fieldsValidated: number;
    fieldsWithDiscrepancies: number;
    discrepancies: Array<{
      fieldName: string;
      expected: string;
      actual: string | null;
    }>;
    message: string;
  }> {
    try {
      // 1. Load the PDF
      const pdfPath = join(__dirname, "src/sf862.pdf");
      const pdfDoc = await PDFDocument.load(fs.readFileSync(pdfPath));
      const form = pdfDoc.getForm();

      // Create a mapping of field names to PDF form fields
      const fieldMap = new Map(form.getFields().map((f) => [f.getName(), f]));

      // 2. Set the test values
      const fieldsToTest: string[] = [];

      for (const [fieldName, value] of Object.entries(testValues)) {
        if (fieldMap.has(fieldName)) {
          await this.setFieldValue(fieldMap.get(fieldName), value);
          fieldsToTest.push(fieldName);
        }
      }

      // 3. Save the PDF with test values - use a single temporary file for all validations
      const validationPdfPath = join(__dirname, `../../tools/externalTools/validation_temp.pdf`);
      const modifiedPdfBytes = await pdfDoc.save();
      fs.writeFileSync(validationPdfPath, modifiedPdfBytes);

      // 4. Read back the PDF to verify values
      const verificationDoc = await PDFDocument.load(fs.readFileSync(validationPdfPath));
      const verificationFields = await this.mapFormFields(verificationDoc);

      // 5. Compare input and output values
      const discrepancies = [];
      for (const fieldName of fieldsToTest) {
        const expectedValue = testValues[fieldName];
        const fieldInfo = verificationFields.find(f => f.name === fieldName);
        const actualValue = fieldInfo?.value?.toString() || null;

        if (expectedValue !== actualValue) {
          discrepancies.push({
            fieldName,
            expected: expectedValue,
            actual: actualValue
          });
        }
      }

      // 6. Generate validation report
      return {
        success: discrepancies.length === 0,
        section: sectionId,
        sectionName: `Section ${sectionId}`,
        fieldsValidated: fieldsToTest.length,
        fieldsWithDiscrepancies: discrepancies.length,
        discrepancies,
        message: discrepancies.length === 0
          ? `All ${fieldsToTest.length} fields in section ${sectionId} validated successfully`
          : `Found ${discrepancies.length} discrepancies in section ${sectionId}`
      };
    } catch (error) {
      console.error(`Error validating section ${sectionId}:`, error);
      return {
        success: false,
        section: sectionId,
        sectionName: `Section ${sectionId}`,
        fieldsValidated: 0,
        fieldsWithDiscrepancies: 0,
        discrepancies: [],
        message: `Error validating section ${sectionId}: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Batch validate multiple sections of the PDF
   *
   * @param sectionData Map of section IDs to test values
   * @returns Consolidated validation report for all sections
   */
  async batchValidatePdfSections(sectionData: Map<number, Record<string, string>>): Promise<{
    overallSuccess: boolean;
    sectionsValidated: number;
    sectionsWithDiscrepancies: number;
    totalFieldsValidated: number;
    totalDiscrepancies: number;
    sectionReports: Array<Awaited<ReturnType<PdfService['validatePdfFormBySection']>>>;
  }> {
    const sectionReports: Array<Awaited<ReturnType<PdfService['validatePdfFormBySection']>>> = [];
    let totalFieldsValidated = 0;
    let totalDiscrepancies = 0;

    try {
      for (const [sectionId, testValues] of sectionData.entries()) {
        // We need to await the promise before we can use its results
        const report = await this.validatePdfFormBySection(sectionId, testValues);
        sectionReports.push(report);

        totalFieldsValidated += report.fieldsValidated;
        totalDiscrepancies += report.fieldsWithDiscrepancies;
      }

      const sectionsWithDiscrepancies = sectionReports.filter(report => !report.success).length;

      return {
        overallSuccess: sectionsWithDiscrepancies === 0,
        sectionsValidated: sectionReports.length,
        sectionsWithDiscrepancies,
        totalFieldsValidated,
        totalDiscrepancies,
        sectionReports
      };
    } finally {
      // Clean up the temporary validation file
      const validationTempPath = join(__dirname, `../../tools/externalTools/validation_temp.pdf`);
      if (fs.existsSync(validationTempPath)) {
        try {
          fs.unlinkSync(validationTempPath);
        } catch (error) {
          console.warn(`Failed to clean up temporary validation file: ${error}`);
        }
      }
    }
  }

  /**
   * Generates a human-readable validation report for PDF form fields
   *
   * @param batchReport The batch validation report
   * @returns Formatted string with validation results
   */
  generateValidationReport(batchReport: Awaited<ReturnType<PdfService['batchValidatePdfSections']>>): string {
    let report = `PDF FORM FIELD VALIDATION REPORT\n`;
    report += `================================\n\n`;

    report += `Summary:\n`;
    report += `- Sections validated: ${batchReport.sectionsValidated}\n`;
    report += `- Overall success: ${batchReport.overallSuccess ? 'YES ✓' : 'NO ✗'}\n`;
    report += `- Sections with discrepancies: ${batchReport.sectionsWithDiscrepancies}\n`;
    report += `- Total fields validated: ${batchReport.totalFieldsValidated}\n`;
    report += `- Total discrepancies: ${batchReport.totalDiscrepancies}\n\n`;

    if (batchReport.totalDiscrepancies > 0) {
      report += `SECTIONS WITH DISCREPANCIES:\n`;
      report += `-------------------------\n\n`;

      for (const sectionReport of batchReport.sectionReports) {
        if (!sectionReport.success) {
          report += `Section ${sectionReport.section} (${sectionReport.sectionName}):\n`;
          report += `- Fields validated: ${sectionReport.fieldsValidated}\n`;
          report += `- Fields with discrepancies: ${sectionReport.fieldsWithDiscrepancies}\n\n`;

          report += `  Discrepancies:\n`;
          for (const discrepancy of sectionReport.discrepancies) {
            report += `  - Field: ${discrepancy.fieldName}\n`;
            report += `    Expected: ${discrepancy.expected}\n`;
            report += `    Actual: ${discrepancy.actual === null ? 'NULL' : discrepancy.actual}\n\n`;
          }
        }
      }
    }

    report += `SECTION DETAILS:\n`;
    report += `---------------\n\n`;

    for (const sectionReport of batchReport.sectionReports) {
      report += `Section ${sectionReport.section} (${sectionReport.sectionName}):\n`;
      report += `- Status: ${sectionReport.success ? 'SUCCESS ✓' : 'FAILED ✗'}\n`;
      report += `- Fields validated: ${sectionReport.fieldsValidated}\n`;
      report += `- Fields with discrepancies: ${sectionReport.fieldsWithDiscrepancies}\n`;
      report += `- Message: ${sectionReport.message}\n\n`;
    }

    return report;
  }

  /**
   * Load a PDF document from file path
   * @param pdfPath Path to the PDF file
   * @returns Loaded PDF document or null if loading fails
   */
  private async loadPdf(pdfPath: string): Promise<PDFDocument | null> {
    try {
      const pdfBytes = fs.readFileSync(pdfPath);
      return await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    } catch (error) {
      console.error(`Error loading PDF: ${error}`);
      return null;
    }
  }

  /**
   * Get all pages where a field appears
   * @param field PDF form field
   * @param pdfDoc PDF document
   * @returns Array of page indices (0-based)
   */
  private getFieldPages(field: PDFField, pdfDoc: PDFDocument): number[] {
    const pages: number[] = [];
    try {
      const widgets = field.acroField.getWidgets();

      for (const widget of widgets) {
        const pageIndex = this.getWidgetPage(widget, pdfDoc);
        if (pageIndex !== null && !pages.includes(pageIndex)) {
          pages.push(pageIndex);
        }
      }
    } catch (error) {
      console.error(`Error getting field pages: ${error}`);
    }
    return pages;
  }

  /**
   * Get the page index of a widget
   * @param widget Field widget
   * @param pdfDoc PDF document
   * @returns Page index (0-based) or null if not found
   */
  private getWidgetPage(widget: any, pdfDoc: PDFDocument): number | null {
    try {
      const widgetDict = widget.dict;
      if (!widgetDict) return null;

      // Get the page reference from the widget
      const pageRef = widgetDict.get(PDFName.of('P'));
      if (!pageRef) return null;

      // Find the page index by matching references
      const pages = pdfDoc.getPages();
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].ref === pageRef) {
          return i;
        }
      }
    } catch (error) {
      console.error(`Error getting widget page: ${error}`);
    }
    return null;
  }

  /**
   * Extract rectangle from field annotations
   * @param field PDF form field
   * @param pdfDoc PDF document
   * @returns Rectangle coordinates or null if not found
   */
  private extractRectFromAnnotation(field: PDFField, pdfDoc: PDFDocument): { x: number; y: number; width: number; height: number } | null {
    try {
      const pages = pdfDoc.getPages();
      const fieldPages = this.getFieldPages(field, pdfDoc);

      for (const pageIndex of fieldPages) {
        const page = pages[pageIndex];
        if (!page) continue;

        // Get annotations for the page
        const annotations = page.node.lookup(PDFName.of('Annots'));
        if (!(annotations instanceof PDFArray)) continue;

        // Find the annotation for this field
        for (let i = 0; i < annotations.size(); i++) {
          const annot = annotations.lookup(i);
          if (!annot) continue;

          const annotDict = (annot as any).dict;
          if (!annotDict) continue;

          // Check if this annotation belongs to our field
          const fieldRef = annotDict.get(PDFName.of('Parent')) || annot;
          const fieldObj = field.acroField;

          if (fieldRef && fieldRef.toString() === fieldObj.ref.toString()) {
            // Found matching annotation, get its rectangle
            const annotRect = annotDict.lookup(PDFName.of('Rect'));
            if (annotRect instanceof PDFArray && annotRect.size() === 4) {
              const x1 = annotRect.lookup(0, PDFNumber).asNumber();
              const y1 = annotRect.lookup(1, PDFNumber).asNumber();
              const x2 = annotRect.lookup(2, PDFNumber).asNumber();
              const y2 = annotRect.lookup(3, PDFNumber).asNumber();

              return {
                x: Math.round(Math.min(x1, x2) * 100) / 100,
                y: Math.round(Math.min(y1, y2) * 100) / 100,
                width: Math.round(Math.abs(x2 - x1) * 100) / 100,
                height: Math.round(Math.abs(y2 - y1) * 100) / 100
              };
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error extracting rect from annotation: ${error}`);
    }
    return null;
  }

  /**
   * Extract field options for dropdown and radio button fields using pdf-lib API
   * @param field PDF form field
   * @returns Array of option values or undefined if field has no options
   */
  private extractFieldOptions(field: PDFField): string[] | undefined {
    try {
      // Handle different field types that have options
      if (field instanceof PDFDropdown) {
        // For dropdown fields, get all available options
        const options = field.getOptions();
        return options.length > 0 ? options : undefined;
      } else if (field instanceof PDFRadioGroup) {
        // For radio groups, get all available option values
        const options = field.getOptions();
        return options.length > 0 ? options : undefined;
      } else {
        // For other field types (text fields, checkboxes), there are no options
        // Note: PDFOptionList (list boxes) would also have getOptions() but it's not commonly used in SF-86
        return undefined;
      }
    } catch (error) {
      console.warn(`Error extracting options for field ${field.getName()}:`, error);
      return undefined;
    }
  }

  /**
   * Extract rectangle directly from the field object
   * @param field PDF form field
   * @returns Rectangle coordinates or null if not found
   */
  private extractRectFromFieldObject(field: PDFField): { x: number; y: number; width: number; height: number } | null {
    try {
      const dict = field.acroField.dict;
      if (!dict) return null;

      // Some fields store coordinates directly
      const rectArray = dict.lookup(PDFName.of('Rect'));

      if (rectArray instanceof PDFArray && rectArray.size() === 4) {
        const x1 = rectArray.lookup(0, PDFNumber).asNumber();
        const y1 = rectArray.lookup(1, PDFNumber).asNumber();
        const x2 = rectArray.lookup(2, PDFNumber).asNumber();
        const y2 = rectArray.lookup(3, PDFNumber).asNumber();

        return {
          x: Math.round(Math.min(x1, x2) * 100) / 100,
          y: Math.round(Math.min(y1, y2) * 100) / 100,
          width: Math.round(Math.abs(x2 - x1) * 100) / 100,
          height: Math.round(Math.abs(y2 - y1) * 100) / 100
        };
      }
    } catch (error) {
      console.error(`Error extracting rect from field object: ${error}`);
    }
    return null;
  }

}


