import { PDFCheckBox, PDFDocument, PDFDropdown, PDFName, PDFRadioGroup, PDFString, PDFTextField, PDFNumber, PDFArray, PDFDict, PDFObject } from "pdf-lib";
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
    /**
     * Extract rectangle coordinates from a PDF field widget
     * This is a more reliable method for extracting coordinates
     */
    extractRectFromWidget(widget) {
        try {
            if (!widget)
                return null;
            // Get the Rect array from the widget dictionary
            // Use a type guard to safely access dictionary
            const dict = widget.dict;
            if (!dict || typeof dict.lookup !== 'function')
                return null;
            const rectArray = dict.lookup(PDFName.of('Rect'));
            if (rectArray instanceof PDFArray && rectArray.size() === 4) {
                try {
                    // PDF coordinates are [left, bottom, right, top]
                    const x1 = rectArray.lookup(0, PDFNumber).asNumber();
                    const y1 = rectArray.lookup(1, PDFNumber).asNumber();
                    const x2 = rectArray.lookup(2, PDFNumber).asNumber();
                    const y2 = rectArray.lookup(3, PDFNumber).asNumber();
                    // Ensure coordinates are properly ordered (x1,y1 is lower-left)
                    return {
                        x: Math.min(x1, x2),
                        y: Math.min(y1, y2),
                        width: Math.abs(x2 - x1),
                        height: Math.abs(y2 - y1)
                    };
                }
                catch (e) {
                    console.warn('Error parsing rectangle array:', e);
                    return null;
                }
            }
        }
        catch (e) {
            console.warn('Error accessing widget dictionary:', e);
        }
        return null;
    }
    /**
     * Find all annotations for a field on a specific page
     * This is used as a backup method for getting field coordinates
     */
    findFieldAnnotationsOnPage(field, page) {
        try {
            // Get all annotations on this page
            const annotations = page.node.lookup(PDFName.of('Annots'));
            if (!(annotations instanceof PDFArray))
                return [];
            const fieldId = field.ref.toString();
            const fieldAnnotations = [];
            // Check each annotation to see if it belongs to our field
            for (let i = 0; i < annotations.size(); i++) {
                const annotation = annotations.lookup(i);
                if (!annotation)
                    continue;
                // Safely check if the annotation has a dict property
                const annotDict = annotation instanceof PDFDict ? annotation :
                    annotation.dict instanceof PDFDict ? annotation.dict : null;
                if (!annotDict)
                    continue;
                // The annotation may refer to the field directly or via a Parent reference
                const parent = annotDict.get(PDFName.of('Parent'));
                const isDirectField = annotation.toString().includes(fieldId);
                const isParentField = parent && parent.toString().includes(fieldId);
                if (isDirectField || isParentField) {
                    fieldAnnotations.push(annotation);
                }
            }
            return fieldAnnotations;
        }
        catch (e) {
            console.warn(`Error finding annotations for field: ${e}`);
            return [];
        }
    }
    /**
     * Safe method to extract a Rect array from an annotation
     */
    extractRectFromAnnotation(annotation) {
        try {
            // Handle different annotation structures
            let dict = null;
            if (annotation instanceof PDFDict) {
                dict = annotation;
            }
            else if (annotation.dict instanceof PDFDict) {
                dict = annotation.dict;
            }
            if (!dict)
                return null;
            const rectArray = dict.lookup(PDFName.of('Rect'));
            if (rectArray instanceof PDFArray && rectArray.size() === 4) {
                try {
                    const x1 = rectArray.lookup(0, PDFNumber).asNumber();
                    const y1 = rectArray.lookup(1, PDFNumber).asNumber();
                    const x2 = rectArray.lookup(2, PDFNumber).asNumber();
                    const y2 = rectArray.lookup(3, PDFNumber).asNumber();
                    return {
                        x: Math.min(x1, x2),
                        y: Math.min(y1, y2),
                        width: Math.abs(x2 - x1),
                        height: Math.abs(y2 - y1)
                    };
                }
                catch (e) {
                    console.warn('Error parsing annotation rectangle:', e);
                }
            }
        }
        catch (e) {
            console.warn('Error accessing annotation dictionary:', e);
        }
        return null;
    }
    /**
     * Extract field metadata from a PDF file
     * Enhanced coordinate extraction for better spatial analysis
     */
    async extractFieldMetadata(pdfPath) {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        const pages = pdfDoc.getPages();
        // Create a debug log to track coordinate extraction
        const debugLog = [];
        const coordExtractionStats = {
            total: fields.length,
            withCoordinates: 0,
            byMethod: {
                widget_direct: 0,
                widget_p_dict: 0,
                annotation_direct: 0,
                annotation_indirect: 0,
                annotation_search: 0,
                fallback: 0
            }
        };
        const fieldData = await Promise.all(fields.map(async (field) => {
            const name = field.getName();
            const type = field.constructor.name;
            const id = field.ref.tag.toString();
            let value = undefined;
            let label = undefined;
            let maxLength = undefined;
            let options = undefined;
            let page = undefined;
            let rect = undefined;
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
            }
            // Attempt to extract label, maxLength, options
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
                // Extract page number - essential for coordinate processing
                page = await this.findPageForField(field, pdfDoc);
            }
            catch (e) {
                console.error(`Error extracting metadata for field ${name}:`, e);
            }
            // *** ENHANCED COORDINATE EXTRACTION APPROACH ***
            // We'll use multiple methods and take the first successful one
            // Method 1: Extract from widgets
            try {
                const widgets = field.acroField.getWidgets();
                if (widgets && widgets.length > 0) {
                    // Try direct method from widget
                    const widgetRect = this.extractRectFromWidget(widgets[0]);
                    if (widgetRect && widgetRect.width > 0 && widgetRect.height > 0) {
                        rect = widgetRect;
                        coordExtractionStats.byMethod.widget_direct++;
                        debugLog.push({
                            field: name,
                            method: "widget_direct",
                            coordinates: rect,
                            page
                        });
                    }
                    // Try through widget's P dictionary (page reference)
                    else {
                        const widget = widgets[0];
                        if (widget && widget.P && typeof widget.P === 'function') {
                            const pageRef = widget.P();
                            if (pageRef) {
                                // Safely access the page dictionary
                                let pageRectDict = null;
                                try {
                                    // PDFRef doesn't have .dict directly, need to dereference it
                                    const pageObj = pdfDoc.context.lookup(pageRef);
                                    if (pageObj instanceof PDFDict) {
                                        pageRectDict = pageObj;
                                    }
                                    else if (pageObj.dict instanceof PDFDict) {
                                        pageRectDict = pageObj.dict;
                                    }
                                }
                                catch (e) {
                                    console.warn('Error dereferencing page', e);
                                }
                                if (pageRectDict && typeof pageRectDict.lookup === 'function') {
                                    const annotRect = pageRectDict.lookup(PDFName.of('Rect'));
                                    if (annotRect instanceof PDFArray && annotRect.size() === 4) {
                                        try {
                                            const x1 = annotRect.lookup(0, PDFNumber).asNumber();
                                            const y1 = annotRect.lookup(1, PDFNumber).asNumber();
                                            const x2 = annotRect.lookup(2, PDFNumber).asNumber();
                                            const y2 = annotRect.lookup(3, PDFNumber).asNumber();
                                            rect = {
                                                x: Math.min(x1, x2),
                                                y: Math.min(y1, y2),
                                                width: Math.abs(x2 - x1),
                                                height: Math.abs(y2 - y1)
                                            };
                                            coordExtractionStats.byMethod.widget_p_dict++;
                                            debugLog.push({
                                                field: name,
                                                method: "widget_p_dict",
                                                coordinates: rect,
                                                page
                                            });
                                        }
                                        catch (e) {
                                            console.warn(`Error extracting rect from P dict for ${name}:`, e);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (e) {
                console.warn(`Error extracting widget rectangle for field ${name}:`, e);
            }
            // Method 2: Directly access the annotation if known page
            if (!rect && page !== undefined) {
                try {
                    const pdfPage = pages[page - 1]; // Pages are 0-indexed
                    const fieldAnnotations = this.findFieldAnnotationsOnPage(field, pdfPage);
                    if (fieldAnnotations.length > 0) {
                        // Try to extract rectangle from the first annotation
                        const annotRect = this.extractRectFromAnnotation(fieldAnnotations[0]);
                        if (annotRect && annotRect.width > 0 && annotRect.height > 0) {
                            rect = annotRect;
                            coordExtractionStats.byMethod.annotation_direct++;
                            debugLog.push({
                                field: name,
                                method: "annotation_direct",
                                coordinates: rect,
                                page
                            });
                        }
                    }
                }
                catch (e) {
                    console.warn(`Error finding field annotations for ${name}:`, e);
                }
            }
            // Method 3: Search all annotations on the page by field ID
            if (!rect && page !== undefined) {
                try {
                    const pdfPage = pages[page - 1];
                    const annotations = pdfPage.node.lookup(PDFName.of('Annots'));
                    if (annotations instanceof PDFArray) {
                        const fieldRefStr = field.ref.toString();
                        for (let i = 0; i < annotations.size(); i++) {
                            const annotation = annotations.lookup(i);
                            if (!annotation)
                                continue;
                            // Check if this annotation refers to our field
                            const annotStr = annotation.toString();
                            if (annotStr.includes(fieldRefStr)) {
                                // Found an annotation for our field
                                const annotRect = this.extractRectFromAnnotation(annotation);
                                if (annotRect && annotRect.width > 0 && annotRect.height > 0) {
                                    rect = annotRect;
                                    coordExtractionStats.byMethod.annotation_search++;
                                    debugLog.push({
                                        field: name,
                                        method: "annotation_search",
                                        coordinates: rect,
                                        page
                                    });
                                    break;
                                }
                            }
                        }
                    }
                }
                catch (e) {
                    console.warn(`Error searching annotations for field ${name}:`, e);
                }
            }
            // Method 4: Fallback - set default reasonable coordinates if page is known
            if (!rect && page !== undefined) {
                // Set default coordinates based on field type
                const fieldType = type.toLowerCase();
                if (fieldType.includes('checkbox')) {
                    rect = { x: 100, y: 500, width: 15, height: 15 };
                }
                else if (fieldType.includes('radio')) {
                    rect = { x: 150, y: 500, width: 15, height: 15 };
                }
                else if (fieldType.includes('dropdown')) {
                    rect = { x: 200, y: 500, width: 150, height: 20 };
                }
                else {
                    // Default text field size
                    rect = { x: 250, y: 500, width: 200, height: 25 };
                }
                coordExtractionStats.byMethod.fallback++;
                debugLog.push({
                    field: name,
                    method: "fallback",
                    coordinates: rect,
                    page,
                    fieldType
                });
            }
            // If we found coordinates, increment the counter
            if (rect && (rect.width > 0 || rect.height > 0)) {
                coordExtractionStats.withCoordinates++;
            }
            // Return the completed field metadata
            return {
                name,
                id,
                type,
                value,
                label,
                maxLength,
                options,
                page,
                rect
            };
        }));
        // Save the debug log and stats for troubleshooting
        try {
            fs.writeFileSync(join(__dirname, "../../tools/externalTools/coordinates-debug.json"), JSON.stringify(debugLog, null, 2));
            fs.writeFileSync(join(__dirname, "../../tools/externalTools/coordinates-stats.json"), JSON.stringify(coordExtractionStats, null, 2));
        }
        catch (e) {
            console.warn("Could not save coordinates debug info:", e);
        }
        console.log(`Extracted coordinates for ${coordExtractionStats.withCoordinates} out of ${coordExtractionStats.total} fields (${(coordExtractionStats.withCoordinates / coordExtractionStats.total * 100).toFixed(1)}%)`);
        console.log('Coordinate extraction methods used:');
        Object.entries(coordExtractionStats.byMethod).forEach(([method, count]) => {
            console.log(`  ${method}: ${count} fields`);
        });
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
