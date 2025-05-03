#!/usr/bin/env node

/**
 * PDF-Page-Data
 * 
 * This script displays all PDF form fields on a specified page of a PDF document.
 * 
 * Usage:
 *   npx tsx scripts/PDF-Page-data.ts <pageNumber> [pdfPath] [--save] [--summary]
 * 
 * Arguments:
 *   pageNumber - Required. The page number (1-based) to display fields for, or 'all' to show field counts for all pages
 *   pdfPath - Optional. Path to the PDF file. Defaults to resources/sf86.pdf
 *   --save - Optional. Save the field data to a JSON file
 *   --summary - Optional. Show a summary of field counts per page instead of detailed field info
 * 
 * The script will:
 * 1. Load the specified PDF (or default)
 * 2. Extract all form fields on the specified page(s)
 * 3. Display detailed information about each field or show a summary
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PDFDocument } from 'pdf-lib';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default PDF path if not specified
const DEFAULT_PDF_PATH = path.join(__dirname, '../tools/externalTools/sf862.pdf');

// Define types for our script
interface FieldMetadata {
  label?: string;
  maxLength?: number;
}

interface FieldData {
  id: string;
  name: string;
  type: string;
  page: number;
  value?: string;
  metadata: FieldMetadata;
}

interface TypeCounts {
  [key: string]: number;
}

interface PageStats {
  pageNumber: number;
  fieldCount: number;
  typeBreakdown: TypeCounts;
}

/**
 * Main function to run the PDF page field analyzer
 */
async function main(): Promise<void> {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    let pdfPath = DEFAULT_PDF_PATH;
    let pageNumber: number | string;
    let saveToFile = false;
    let showSummary = false;
    
    // Parse options
    const filteredArgs = args.filter(arg => {
      if (arg === '--save') {
        saveToFile = true;
        return false;
      }
      if (arg === '--summary') {
        showSummary = true;
        return false;
      }
      return true;
    });
    
    // Check if arguments were provided
    if (filteredArgs.length === 0) {
      console.error('Error: Page number is required');
      console.log('Usage: npx tsx scripts/PDF-Page-data.ts <pageNumber> [pdfPath] [--save] [--summary]');
      console.log('  pageNumber: Page number (1-based) or "all" to show field counts for all pages');
      console.log('  pdfPath: Path to the PDF file (optional)');
      console.log('  --save: Save the field data to a JSON file');
      console.log('  --summary: Show a summary of field counts per page instead of detailed field info');
      process.exit(1);
    } else if (filteredArgs.length === 1) {
      // Only page number provided
      pageNumber = filteredArgs[0].toLowerCase() === 'all' ? 'all' : parseInt(filteredArgs[0], 10);
    } else {
      // Both page number and PDF path provided
      pageNumber = filteredArgs[0].toLowerCase() === 'all' ? 'all' : parseInt(filteredArgs[0], 10);
      pdfPath = filteredArgs[1];
    }
    
    // Validate page number if it's a number
    if (typeof pageNumber === 'number' && (isNaN(pageNumber) || pageNumber < 1)) {
      console.error('Error: Page number must be a positive integer or "all"');
      process.exit(1);
    }
    
    console.log(`Using PDF: ${pdfPath}`);
    if (pageNumber === 'all') {
      console.log('Analyzing all pages');
    } else {
      console.log(`Analyzing Page: ${pageNumber}`);
    }
    
    // Check if PDF exists
    if (!fs.existsSync(pdfPath)) {
      console.error(`Error: PDF file not found at ${pdfPath}`);
      process.exit(1);
    }
    
    // Load the PDF
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Get the page count
    const pageCount = pdfDoc.getPageCount();
    
    // Check if page number is valid (if it's not 'all')
    if (typeof pageNumber === 'number' && pageNumber > pageCount) {
      console.error(`Error: Page number ${pageNumber} exceeds PDF's page count (${pageCount})`);
      process.exit(1);
    }
    
    // Get all form fields
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`Total fields in PDF: ${fields.length}`);
    
    // If showing all pages, analyze the whole document
    if (pageNumber === 'all') {
      // Initialize storage for field counts by page
      const pageStats: PageStats[] = [];
      for (let i = 0; i < pageCount; i++) {
        pageStats.push({
          pageNumber: i + 1,
          fieldCount: 0,
          typeBreakdown: {}
        });
      }
      
      // Assign each field to its page
      for (const field of fields) {
        const fieldPage = await findPageForField(field, pdfDoc);
        if (fieldPage !== undefined) {
          const pageIndex = fieldPage;
          pageStats[pageIndex].fieldCount += 1;
          
          // Track the field type
          const fieldType = field.constructor.name;
          if (!pageStats[pageIndex].typeBreakdown[fieldType]) {
            pageStats[pageIndex].typeBreakdown[fieldType] = 0;
          }
          pageStats[pageIndex].typeBreakdown[fieldType] += 1;
        }
      }
      
      // Display the summary
      console.log('\n========================================');
      console.log('FIELD COUNTS BY PAGE');
      console.log('========================================\n');
      
      let totalFields = 0;
      for (const page of pageStats) {
        totalFields += page.fieldCount;
        if (page.fieldCount > 0) {
          console.log(`Page ${page.pageNumber}: ${page.fieldCount} fields`);
          
          // Only show type breakdown if requested
          if (showSummary) {
            for (const [type, count] of Object.entries(page.typeBreakdown)) {
              console.log(`  - ${type}: ${count}`);
            }
          }
        }
      }
      
      console.log(`\nTotal fields found: ${totalFields}`);
      
      // Save to file if requested
      if (saveToFile) {
        const outputFileName = `${path.basename(pdfPath, '.pdf')}-field-summary.json`;
        fs.writeFileSync(outputFileName, JSON.stringify(pageStats, null, 2));
        console.log(`\nSaved field summary to: ${outputFileName}`);
      }
      
      // We're done with the summary
      return;
    }
    
    // We're analyzing a specific page
    // Find fields on the specified page
    const pageFields: FieldData[] = [];
    
    for (const field of fields) {
      const fieldName = field.getName();
      const fieldPage = await findPageForField(field, pdfDoc);
      
      if (fieldPage === (pageNumber as number) - 1) { // PDF-lib uses 0-based page indices
        // Create a field data object
        const fieldData: FieldData = {
          id: field.ref.tag.toString(),
          name: fieldName,
          type: field.constructor.name,
          page: fieldPage + 1, // Convert back to 1-based page number
          value: getFieldValue(field),
          metadata: extractFieldMetadata(field)
        };
        
        pageFields.push(fieldData);
      }
    }
    
    // Sort fields by name for better readability
    pageFields.sort((a, b) => a.name.localeCompare(b.name));
    
    // Display the results
    console.log('\n========================================');
    console.log(`FIELDS ON PAGE ${pageNumber} (${pageFields.length} fields found)`);
    console.log('========================================\n');
    
    if (pageFields.length === 0) {
      console.log('No form fields found on this page.');
      
      // Let's show a sample of fields to help diagnose the issue
      console.log('\nDiagnostic Information:');
      console.log('------------------------');
      
      // Get the first 5 fields to check their page info
      const sampleFields = fields.slice(0, 5);
      console.log(`Showing information for the first ${sampleFields.length} fields in the PDF:`);
      
      for (const field of sampleFields) {
        const fieldName = field.getName();
        console.log(`\nField Name: ${fieldName}`);
        console.log(`Field Type: ${field.constructor.name}`);
        
        // Try to determine page
        try {
          // Get the widget annotations for this field
          const widgets = field.acroField.getWidgets();
          console.log(`Widget count: ${widgets.length}`);
          
          if (widgets.length > 0) {
            const widget = widgets[0];
            const pageRef = widget.P();
            
            if (pageRef) {
              console.log(`Has page reference: Yes`);
              
              // Try to find the matching page
              let foundPage = false;
              for (let i = 0; i < pdfDoc.getPageCount(); i++) {
                const page = pdfDoc.getPage(i);
                if (page.ref === pageRef) {
                  console.log(`Found on page: ${i + 1}`);
                  foundPage = true;
                  break;
                }
              }
              
              if (!foundPage) {
                console.log(`Found on page: Not found (reference exists but no matching page)`);
              }
            } else {
              console.log(`Has page reference: No`);
            }
          } else {
            console.log(`No widget annotations found for this field`);
          }
        } catch (error: any) {
          console.log(`Error determining page: ${error.message}`);
        }
      }
      
      // Also let's print the total number of pages in the PDF
      console.log(`\nTotal Pages in PDF: ${pdfDoc.getPageCount()}`);
    } else {
      // If summary mode, just show the field count by type
      if (showSummary) {
        // Print summary
        console.log('Field Type Summary:');
        const typeCounts: TypeCounts = {};
        for (const field of pageFields) {
          typeCounts[field.type] = (typeCounts[field.type] || 0) + 1;
        }
        
        for (const [type, count] of Object.entries(typeCounts)) {
          console.log(`- ${type}: ${count}`);
        }
      } else {
        // Show detailed field information
        for (const field of pageFields) {
          console.log(`Field Name: ${field.name}`);
          console.log(`Field ID: ${field.id}`);
          console.log(`Type: ${field.type}`);
          console.log(`Label: ${field.metadata.label}`);
          
          if (field.value !== undefined) {
            console.log(`Current Value: ${field.value}`);
          }
          
          if (field.metadata.label) {
            console.log(`Label: ${field.metadata.label}`);
          }
          
          
          if (field.metadata.maxLength !== undefined) {
            console.log(`Max Length: ${field.metadata.maxLength}`);
          }
          
          console.log('----------------------------------------\n');
        }
        
        // Print summary
        console.log('Field Type Summary:');
        const typeCounts: TypeCounts = {};
        for (const field of pageFields) {
          typeCounts[field.type] = (typeCounts[field.type] || 0) + 1;
        }
        
        for (const [type, count] of Object.entries(typeCounts)) {
          console.log(`- ${type}: ${count}`);
        }
      }
      
      // Save to file if requested
      if (saveToFile) {
        const outputFileName = `${path.basename(pdfPath, '.pdf')}-page${pageNumber}-fields.json`;
        fs.writeFileSync(outputFileName, JSON.stringify(pageFields, null, 2));
        console.log(`\nSaved field data to: ${outputFileName}`);
      }
    }
    
  } catch (error) {
    console.error('Error analyzing PDF page:', error);
    process.exit(1);
  }
}

/**
 * Get the value of a PDF field based on its type
 */
function getFieldValue(field: any): string | undefined {
  try {
    const type = field.constructor.name;
    
    if (type === 'PDFTextField') {
      return field.getText();
    } else if (type === 'PDFDropdown' || type === 'PDFRadioGroup') {
      return field.getSelected();
    } else if (type === 'PDFCheckBox') {
      return field.isChecked() ? 'Yes' : 'No';
    }
    return undefined;
  } catch (error) {
    console.warn(`Could not get value for field: ${field.getName()}`);
    return undefined;
  }
}

/**
 * Extract additional metadata from a PDF field
 */
function extractFieldMetadata(field: any): FieldMetadata {
  try {
    // Create an object to store metadata
    const metadata: FieldMetadata = {};
    
    // Access the field's dictionary
    const dict = field.acroField.dict;
    
    // Extract Label (TU entry)
    const tuRaw = dict.get({ name: 'TU' });
    if (tuRaw && typeof tuRaw.decodeText === 'function') {
      metadata.label = tuRaw.decodeText();
    }
    
    // Extract MaxLength (MaxLen entry)
    const maxLenRaw = dict.get({ name: 'MaxLen' });
    if (maxLenRaw && typeof maxLenRaw.asNumber === 'function') {
      metadata.maxLength = maxLenRaw.asNumber();
    }
    
    return metadata;
  } catch (error) {
    console.warn(`Could not extract metadata for field: ${field.getName()}`);
    return {};
  }
}

/**
 * Find which page a field is on
 */
async function findPageForField(field: any, pdfDoc: PDFDocument): Promise<number | undefined> {
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
        return i; // Return 0-based page index
      }
    }
    
    return undefined;
  } catch (error) {
    console.warn(`Could not determine page for field: ${field.getName()}`);
    return undefined;
  }
}

// Run the main function
main().catch(console.error); 