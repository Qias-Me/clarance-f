import { PDFCheckBox, PDFDocument, PDFDropdown, PDFName, PDFRadioGroup, PDFString, PDFTextField, PDFNumber, PDFArray, } from "pdf-lib";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
// Handle __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export class PdfService {
    //Simple Methods
    async mapFilledValuesfrom_PDF(pdfDoc) {
        const form = pdfDoc.getForm();
        return form.getFields().reduce((acc, field) => {
            const type = field.constructor.name;
            const value = field instanceof PDFTextField
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
        }, []);
    }
    async mapFormValuesToJsonData(json, formValues) {
        const idValueMap = new Map();
        const flattenFormValues = (data) => {
            Object.values(data).forEach((val) => {
                if (val && typeof val === "object") {
                    if (val.id && "value" in val) {
                        idValueMap.set(`${val.id} 0 R`, val.value);
                    }
                    else {
                        flattenFormValues(val);
                    }
                }
            });
        };
        flattenFormValues(formValues);
        json.forEach((item) => {
            if (idValueMap.has(item.id))
                item.value = idValueMap.get(item.id);
        });
        return json;
    }
    async mapFormFields(pdfDoc) {
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        const fieldData = fields.map((field) => {
            const name = field.getName();
            const type = field.constructor.name;
            const id = field.ref.tag.toString(); // Extract only the sequence of consecutive numbers
            let value = undefined;
            if (field instanceof PDFTextField) {
                value = field.getText();
            }
            else if (field instanceof PDFDropdown) {
                value = field.getSelected();
            }
            else if (field instanceof PDFCheckBox) {
                value = field.isChecked() ? "Yes" : "No";
            }
            else if (field instanceof PDFRadioGroup) {
                value = field.getSelected();
            }
            let label = undefined;
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
    async setFieldValue(field, value) {
        if (field instanceof PDFTextField)
            field.setText(value);
        else if (field instanceof PDFDropdown || field instanceof PDFRadioGroup)
            field.select(value);
        else if (field instanceof PDFCheckBox)
            value.toLowerCase() === "yes" ? field.check() : field.uncheck();
    }
    //Advanced Methods
    async applyValues_toPDF(formData) {
        try {
            const pdfPath = join(__dirname, "../../tools/externalTools/sf861.pdf");
            const pdfDoc = await PDFDocument.load(fs.readFileSync(pdfPath));
            const fieldMapping = await this.mapFormFields(pdfDoc);
            const finalForm = await this.mapFormValuesToJsonData(fieldMapping, formData);
            fs.writeFileSync(join(__dirname, "../../tools/externalTools/Reference.json"), JSON.stringify(finalForm, null, 2));
            const appliedFields = finalForm.filter(field => {
                // Skip fields with no value
                if (!field.value)
                    return false;
                // Skip empty arrays
                if (Array.isArray(field.value) && field.value.length === 0)
                    return false;
                // Skip "No", "NO", or empty string values
                if (field.value === "No" || field.value === "NO" || field.value === "")
                    return false;
                // Include all other values
                return true;
            });
            fs.writeFileSync(join(__dirname, "../../tools/externalTools/Labels.json"), JSON.stringify(appliedFields, null, 2));
            const form = pdfDoc.getForm();
            const fieldMap = new Map(form.getFields().map((f) => [f.getName(), f]));
            await Promise.all(finalForm.map(async ({ name, value }) => {
                if (value && fieldMap.has(name)) {
                    await this.setFieldValue(fieldMap.get(name), value);
                }
            }));
            const modifiedPdfBytes = await pdfDoc.save();
            await fs.promises.writeFile(join(__dirname, "../../tools/externalTools/example.pdf"), modifiedPdfBytes);
            return { success: true, formData, message: "PDF filled successfully and saved." };
        }
        catch (error) {
            return { success: false, message: `Error processing PDF: ${error}` };
        }
    }
    async generateJSON_fromPDF(formData) {
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
        }
        catch (error) {
            console.error(`Error processing PDF: ${error}`);
            return {
                success: false,
                message: `Error processing PDF: ${error}`,
            };
        }
    }
    async showAllFormFields(formData) {
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
        }
        catch (error) {
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
    async findPageForField(field, pdfDoc) {
        try {
            // Get the field widget annotations to determine page
            const widget = field.acroField.getWidgets()[0];
            if (!widget)
                return undefined;
            // Get the page reference for this widget
            const pageRef = widget.P();
            if (!pageRef)
                return undefined;
            // Find the matching page by comparing page references
            for (let i = 0; i < pdfDoc.getPageCount(); i++) {
                const page = pdfDoc.getPage(i);
                if (page.ref === pageRef) {
                    return i + 1; // Return 1-based page index
                }
            }
            return undefined;
        }
        catch (error) {
            console.warn(`Could not determine page for field: ${field.getName()}`);
            return undefined;
        }
    }
    async extractFieldMetadata(pdfPath) {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        const fieldData = await Promise.all(fields.map(async (field) => {
            const name = field.getName();
            const type = field.constructor.name;
            const id = field.ref.tag.toString();
            let value = undefined; // Extracted value
            let label = undefined; // Field label (TU entry)
            let maxLength = undefined; // Max length constraint
            let options = undefined; // Options for dropdown/radio
            let page = undefined; // Page number where the field appears
            let required = undefined; // If the field is required
            let rect = undefined; // Field rectangle
            // Extract current value with improved type handling
            try {
                if (field instanceof PDFTextField) {
                    value = field.getText() || undefined;
                }
                else if (field instanceof PDFDropdown) {
                    value = field.getSelected() || undefined;
                    if (Array.isArray(value) && value.length === 0) {
                        value = undefined;
                    }
                }
                else if (field instanceof PDFCheckBox) {
                    const isChecked = field.isChecked();
                    value = isChecked !== undefined ? isChecked : undefined;
                }
                else if (field instanceof PDFRadioGroup) {
                    value = field.getSelected() || undefined;
                }
            }
            catch (e) {
                console.error(`Error extracting value for field ${name}:`, e);
                // Leave value as undefined if extraction fails
            }
            // Attempt to extract label, maxLength, options, required status, and rectangle coordinates
            try {
                const dict = field.acroField.dict;
                // Extract Label (TU entry)
                const tuRaw = dict.get(PDFName.of("TU"));
                if (tuRaw instanceof PDFString) {
                    label = tuRaw.decodeText();
                }
                // Extract MaxLength (/MaxLen entry) - common for text fields
                const maxLenRaw = dict.get(PDFName.of('MaxLen'));
                if (maxLenRaw instanceof PDFNumber) {
                    maxLength = maxLenRaw.asNumber();
                }
                // Extract Options (/Opt entry) - common for dropdowns/radio groups
                const optRaw = dict.get(PDFName.of('Opt'));
                if (optRaw instanceof PDFArray) {
                    options = optRaw.asArray().map(opt => {
                        // Options can be strings or [exportValue, displayValue] pairs
                        if (opt instanceof PDFString) {
                            return opt.decodeText();
                        }
                        else if (opt instanceof PDFArray && opt.size() === 2) {
                            // Use the display value (second element) if it's a pair
                            const displayValue = opt.get(1);
                            if (displayValue instanceof PDFString) {
                                return displayValue.decodeText();
                            }
                        }
                        return opt?.toString() ?? ''; // Fallback
                    }).filter(opt => opt !== ''); // Filter out empty strings
                }
                // Look for the required flag (Ff bit 0x2)
                const flagsRaw = dict.get(PDFName.of('Ff'));
                if (flagsRaw instanceof PDFNumber) {
                    const flags = flagsRaw.asNumber();
                    // Check if required bit is set (bit 1, value 2)
                    required = (flags & 2) !== 0;
                }
                // Extract page number
                page = await this.findPageForField(field, pdfDoc);
                // Extract rectangle coordinates from the widget
                try {
                    const widget = field.acroField.getWidgets()[0];
                    if (widget) {
                        // Prefer the high-level helper if available in pdf-lib@^1.17.0
                        try {
                            if (typeof widget.getRectangle === 'function') {
                                const wRect = widget.getRectangle();
                                if (wRect && typeof wRect.x === 'number') {
                                    rect = {
                                        x: wRect.x,
                                        y: wRect.y,
                                        width: wRect.width,
                                        height: wRect.height,
                                    };
                                }
                            }
                        }
                        catch { /* ignore */ }
                        // Fallback to low-level dictionary lookup when getRectangle is unavailable
                        if (!rect) {
                            const rectArray = widget.dict.lookup(PDFName.of('Rect'));
                            if (rectArray && rectArray instanceof PDFArray && rectArray.size() === 4) {
                                // PDF coordinates are typically [left, bottom, right, top]
                                const x1Obj = rectArray.get(0);
                                const y1Obj = rectArray.get(1);
                                const x2Obj = rectArray.get(2);
                                const y2Obj = rectArray.get(3);
                                // Safely convert to numbers, checking types
                                const x1 = x1Obj instanceof PDFNumber ? x1Obj.asNumber() : 0;
                                const y1 = y1Obj instanceof PDFNumber ? y1Obj.asNumber() : 0;
                                const x2 = x2Obj instanceof PDFNumber ? x2Obj.asNumber() : 0;
                                const y2 = y2Obj instanceof PDFNumber ? y2Obj.asNumber() : 0;
                                rect = {
                                    x: Math.min(x1, x2),
                                    y: Math.min(y1, y2),
                                    width: Math.abs(x2 - x1),
                                    height: Math.abs(y2 - y1),
                                };
                            }
                        }
                    }
                }
                catch (e) {
                    console.warn(`Could not extract rectangle for field: ${name}`, e);
                }
            }
            catch (e) {
                console.error(`Error extracting metadata for field ${name}:`, e);
                // Leave constraints as undefined if extraction fails
            }
            return {
                name,
                id,
                type,
                value, // Include current value for context if helpful
                label,
                maxLength,
                options,
                required,
                page,
                rect
            };
        }));
        return fieldData;
    }
    /**
     * Validates PDF form fields for a specific section by setting values and reading them back
     *
     * @param sectionId Section ID
     * @param testValues Test values to set and validate
     * @returns Validation report
     */
    async validatePdfFormBySection(sectionId, testValues) {
        try {
            // 1. Load the PDF
            const pdfPath = join(__dirname, "../../tools/externalTools/sf861.pdf");
            const pdfDoc = await PDFDocument.load(fs.readFileSync(pdfPath));
            const form = pdfDoc.getForm();
            // Create a mapping of field names to PDF form fields
            const fieldMap = new Map(form.getFields().map((f) => [f.getName(), f]));
            // 2. Set the test values
            const fieldsToTest = [];
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
            // Get section name (this could be enhanced to use actual section names)
            const sectionNames = {
                1: "Full Name",
                2: "Date of Birth",
                3: "Place of Birth",
                4: "Social Security Number",
                5: "Other Names Used",
                6: "Identifying Information",
                7: "Contact Information",
                8: "U.S. Passport Information",
                9: "Citizenship",
                // Add more sections as needed
            };
            // 6. Generate validation report
            return {
                success: discrepancies.length === 0,
                section: sectionId,
                sectionName: sectionNames[sectionId] || `Section ${sectionId}`,
                fieldsValidated: fieldsToTest.length,
                fieldsWithDiscrepancies: discrepancies.length,
                discrepancies,
                message: discrepancies.length === 0
                    ? `All ${fieldsToTest.length} fields in section ${sectionId} validated successfully`
                    : `Found ${discrepancies.length} discrepancies in section ${sectionId}`
            };
        }
        catch (error) {
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
    async batchValidatePdfSections(sectionData) {
        const sectionReports = [];
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
        }
        finally {
            // Clean up the temporary validation file
            const validationTempPath = join(__dirname, `../../tools/externalTools/validation_temp.pdf`);
            if (fs.existsSync(validationTempPath)) {
                try {
                    fs.unlinkSync(validationTempPath);
                }
                catch (error) {
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
    generateValidationReport(batchReport) {
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
}
