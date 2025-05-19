#!/usr/bin/env node
/**
 * Set Unidentified Fields Script
 *
 * This script opens the SF86 form, sets values for unidentified fields identified
 * in reports/unidentified-fields.json, and saves the PDF with a new filename.
 *
 * Usage:
 *   npx tsx scripts/set-unidentified-fields.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PDFDocument, PDFCheckBox, PDFTextField, PDFRadioGroup, PDFDropdown } from 'pdf-lib';
// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// File paths
const SOURCE_PDF_PATH = path.join(__dirname, './externalTools/sf861.pdf');
const TARGET_PDF_PATH = path.join(__dirname, './externalTools/sf86v2pointOh.pdf');
const UNIDENTIFIED_FIELDS_PATH = path.join(__dirname, '../reports/unidentified-fields.json');
/**
 * Main function to set values for unidentified fields in the PDF
 */
async function main() {
    try {
        console.log('Starting Set Unidentified Fields Script...');
        // Check if source PDF exists
        if (!fs.existsSync(SOURCE_PDF_PATH)) {
            console.error(`Error: Source PDF file not found at ${SOURCE_PDF_PATH}`);
            process.exit(1);
        }
        // Check if unidentified fields JSON exists
        if (!fs.existsSync(UNIDENTIFIED_FIELDS_PATH)) {
            console.error(`Error: Unidentified fields JSON not found at ${UNIDENTIFIED_FIELDS_PATH}`);
            process.exit(1);
        }
        // Read the unidentified fields data
        const unidentifiedFieldsData = JSON.parse(fs.readFileSync(UNIDENTIFIED_FIELDS_PATH, 'utf-8'));
        console.log(`Loaded ${unidentifiedFieldsData.count} unidentified fields to set.`);
        // Load the PDF directly with pdf-lib since PdfService doesn't have loadPdf method
        console.log(`Opening source PDF: ${SOURCE_PDF_PATH}`);
        const pdfBytes = fs.readFileSync(SOURCE_PDF_PATH);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        // Create a map of field names to PDF form fields for easier lookup
        const fieldMap = new Map(form.getFields().map(f => [f.getName(), f]));
        // Set values for unidentified fields
        console.log('Setting values for unidentified fields:');
        for (const field of unidentifiedFieldsData.fields) {
            console.log(`  - Setting value for field: ${field.name} (${field.label})`);
            // Check if the field exists in the form
            const formField = fieldMap.get(field.name);
            if (!formField) {
                console.warn(`    Warning: Field ${field.name} not found in PDF`);
                continue;
            }
            // Determine appropriate value based on field type
            try {
                if (formField instanceof PDFCheckBox) {
                    console.log('    Setting checkbox value to checked');
                    formField.check();
                }
                else if (formField instanceof PDFRadioGroup) {
                    // For radio groups, we need to select one of the available options
                    const options = formField.getOptions();
                    if (options.length > 0) {
                        console.log(`    Setting radio button to first option: ${options[0]}`);
                        formField.select(options[0]);
                    }
                    else {
                        console.warn('    Warning: Radio group has no options');
                    }
                }
                else if (formField instanceof PDFTextField) {
                    const value = `Value for ${field.label || field.name}`;
                    console.log(`    Setting text field value to: "${value}"`);
                    formField.setText(value);
                }
                else if (formField instanceof PDFDropdown) {
                    const options = formField.getOptions();
                    if (options.length > 0) {
                        console.log(`    Setting dropdown to first option: ${options[0]}`);
                        formField.select(options[0]);
                    }
                    else {
                        console.warn('    Warning: Dropdown has no options');
                    }
                }
                else {
                    console.warn(`    Warning: Unsupported field type: ${formField.constructor.name}`);
                }
            }
            catch (error) {
                console.warn(`    Warning: Could not set value for field ${field.name}: ${error.message}`);
            }
        }
        // Save the modified PDF with improved error handling
        console.log(`Saving modified PDF to: ${TARGET_PDF_PATH}`);
        try {
            const modifiedPdfBytes = await pdfDoc.save();
            // Ensure target directory exists
            const targetDir = path.dirname(TARGET_PDF_PATH);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            // Write file with synchronous method for simplicity
            fs.writeFileSync(TARGET_PDF_PATH, modifiedPdfBytes);
            console.log(`Successfully saved modified PDF to: ${TARGET_PDF_PATH}`);
        }
        catch (saveError) {
            console.error(`Error saving PDF: ${saveError.message}`);
            console.error('This might happen if the file is currently open in another program.');
            process.exit(1);
        }
        console.log('Process completed successfully.');
    }
    catch (error) {
        console.error('Error setting unidentified field values:', error.message);
        process.exit(1);
    }
}
// Run the script
main().catch(console.error);
