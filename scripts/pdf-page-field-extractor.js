#!/usr/bin/env node

/**
 * SF-86 PDF Page-Specific Field Extraction Script
 * 
 * This script reads specific PDF page content to validate that fields are properly set.
 * It extracts field information in the same structure as section-x.json files and outputs
 * individual page JSON files to api/PDFoutput directory.
 * 
 * Usage: 
 *   node tests/pdf-page-field-extractor.js <pdf-path> <page-numbers>
 *   node tests/pdf-page-field-extractor.js ./workspace/SF86_Generated.pdf 17,18,19
 *   node tests/pdf-page-field-extractor.js ./workspace/SF86_Generated.pdf 17-33
 *   node tests/pdf-page-field-extractor.js ./workspace/SF86_Generated.pdf 5
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFName, PDFString } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse page numbers from command line argument
 * Supports formats: "5", "17,18,19", "17-33"
 */
function parsePageNumbers(pageArg) {
  const pages = [];
  
  if (pageArg.includes('-')) {
    // Range format: "17-33"
    const [start, end] = pageArg.split('-').map(num => parseInt(num.trim()));
    if (isNaN(start) || isNaN(end) || start > end) {
      throw new Error(`Invalid page range: ${pageArg}`);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  } else if (pageArg.includes(',')) {
    // Comma-separated format: "17,18,19"
    const pageList = pageArg.split(',').map(num => parseInt(num.trim()));
    for (const page of pageList) {
      if (isNaN(page)) {
        throw new Error(`Invalid page number: ${page}`);
      }
      pages.push(page);
    }
  } else {
    // Single page format: "5"
    const page = parseInt(pageArg.trim());
    if (isNaN(page)) {
      throw new Error(`Invalid page number: ${pageArg}`);
    }
    pages.push(page);
  }
  
  return pages.sort((a, b) => a - b);
}

/**
 * Get field page number from PDF field
 */
function getFieldPageNumber(field, pdfDoc) {
  try {
    const widgets = field.acroField.getWidgets();
    if (widgets.length > 0) {
      const widget = widgets[0];
      const pageRef = widget.dict.get(PDFName.of('P'));
      if (pageRef) {
        const pages = pdfDoc.getPages();
        for (let i = 0; i < pages.length; i++) {
          if (pages[i].ref.toString() === pageRef.toString()) {
            return i + 1; // Convert to 1-based page numbering
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not determine page for field ${field.getName()}`);
  }
  return null;
}

/**
 * Extract field value based on field type
 */
function extractFieldValue(field) {
  try {
    if (field instanceof PDFTextField) {
      const textValue = field.getText();
      return textValue && textValue.trim() !== '' ? textValue : null;
    } else if (field instanceof PDFDropdown) {
      const selectedValue = field.getSelected();
      return selectedValue && selectedValue.length > 0 ? selectedValue[0] : null;
    } else if (field instanceof PDFCheckBox) {
      return field.isChecked();
    } else if (field instanceof PDFRadioGroup) {
      const selectedValue = field.getSelected();
      return selectedValue || null;
    }
  } catch (error) {
    console.warn(`Warning: Could not extract value for field ${field.getName()}: ${error.message}`);
  }
  return null;
}

/**
 * Extract field label from PDF field
 */
function extractFieldLabel(field) {
  try {
    const dict = field.acroField.dict;
    const tuRaw = dict.get(PDFName.of("TU"));
    if (tuRaw instanceof PDFString) {
      return tuRaw.decodeText();
    }
  } catch (error) {
    console.warn(`Warning: Could not extract label for field ${field.getName()}`);
  }
  return field.getName(); // Fallback to field name if no label
}

/**
 * Extract field rectangle information
 */
function extractFieldRect(field) {
  try {
    const widgets = field.acroField.getWidgets();
    if (widgets.length > 0) {
      const rect = widgets[0].getRectangle();
      if (rect) {
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        };
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not extract rectangle for field ${field.getName()}`);
  }
  return null;
}

/**
 * Determine section number from field name or page number
 */
function determineSectionNumber(fieldName, pageNumber) {
  // Try to extract section from field name first
  const sectionMatches = [
    /section[_\s]*(\d+)/i,
    /Section(\d+)/,
    /sec(\d+)/i,
    /s(\d+)/i
  ];
  
  for (const regex of sectionMatches) {
    const match = fieldName.match(regex);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  // Fallback to page-based section determination
  if (pageNumber >= 5 && pageNumber <= 6) return 1; // Sections 1-6
  if (pageNumber === 7) return 7;
  if (pageNumber >= 8 && pageNumber <= 13) return 8;
  if (pageNumber >= 14 && pageNumber <= 16) return 12;
  if (pageNumber >= 17 && pageNumber <= 33) return 13;
  if (pageNumber >= 34 && pageNumber <= 50) return 14;
  
  return null;
}

/**
 * Ensure output directory exists and clear old data
 */
async function ensureOutputDirectory() {
  const outputDir = path.join(__dirname, '../api/PDFoutput');

  try {
    await fs.access(outputDir);
    // Directory exists, clear old JSON files
    console.log('🧹 Clearing old data from api/PDFoutput directory...');
    const files = await fs.readdir(outputDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    if (jsonFiles.length > 0) {
      console.log(`📄 Removing ${jsonFiles.length} old JSON files...`);
      for (const file of jsonFiles) {
        await fs.unlink(path.join(outputDir, file));
      }
      console.log('✅ Old data cleared successfully');
    } else {
      console.log('📂 Directory is already clean');
    }
  } catch (error) {
    console.log('📁 Creating api/PDFoutput directory...');
    await fs.mkdir(outputDir, { recursive: true });
  }

  return outputDir;
}

/**
 * Extract PDF fields for specific pages and save individual page files
 */
async function extractPdfFieldsByPage(pdfPath, targetPages) {
  try {
    console.log('🚀 SF-86 PDF Page-Specific Field Extraction Starting...');
    console.log(`📄 PDF Path: ${pdfPath}`);
    console.log(`📋 Target Pages: ${targetPages.join(', ')}`);
    
    // Verify PDF file exists
    const stats = await fs.stat(pdfPath);
    console.log(`📊 PDF Size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Load PDF document
    console.log('📖 Loading PDF document...');
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    console.log(`📄 PDF loaded successfully. Total pages: ${pdfDoc.getPageCount()}`);
    
    // Get form and fields
    const form = pdfDoc.getForm();
    const allFields = form.getFields();
    console.log(`📋 Total form fields found: ${allFields.length}`);
    
    // Ensure output directory exists
    const outputDir = await ensureOutputDirectory();
    
    // Group fields by page
    console.log('🔍 Grouping fields by page...');
    const fieldsByPage = {};
    
    // Initialize page objects for target pages
    for (const pageNum of targetPages) {
      fieldsByPage[pageNum] = [];
    }
    
    // Extract and group field information
    for (const field of allFields) {
      const fieldName = field.getName();
      const fieldId = field.ref.tag.toString();
      const fieldType = field.constructor.name;
      const fieldPage = getFieldPageNumber(field, pdfDoc);
      
      // Only include fields on target pages
      if (fieldPage && targetPages.includes(fieldPage)) {
        const fieldData = {
          id: fieldId,
          name: fieldName,
          value: extractFieldValue(field),
          page: fieldPage,
          label: extractFieldLabel(field),
          type: fieldType,
          rect: extractFieldRect(field),
          section: determineSectionNumber(fieldName, fieldPage)
        };
        
        fieldsByPage[fieldPage].push(fieldData);
      }
    }
    
    // Save individual page files
    console.log('💾 Saving individual page files...');
    const savedFiles = [];
    
    for (const pageNum of targetPages) {
      const pageFields = fieldsByPage[pageNum];
      const pageData = {
        metadata: {
          pdfPath: pdfPath,
          pageNumber: pageNum,
          totalFieldsOnPage: pageFields.length,
          extractedAt: new Date().toISOString(),
          section: pageFields.length > 0 ? determineSectionNumber('', pageNum) : null
        },
        fields: pageFields
      };
      
      const fileName = `page${pageNum}.json`;
      const filePath = path.join(outputDir, fileName);
      
      await fs.writeFile(filePath, JSON.stringify(pageData, null, 2));
      savedFiles.push(filePath);
      
      console.log(`✅ Page ${pageNum}: ${pageFields.length} fields saved to ${fileName}`);
    }
    
    console.log('\n📊 Extraction Summary:');
    console.log('─'.repeat(50));
    console.log(`📄 Total pages processed: ${targetPages.length}`);
    console.log(`📁 Files saved to: ${outputDir}`);
    console.log(`📋 Files created: ${savedFiles.length}`);
    
    return {
      outputDirectory: outputDir,
      savedFiles: savedFiles,
      pageCount: targetPages.length,
      fieldsByPage: fieldsByPage
    };
    
  } catch (error) {
    console.error('❌ PDF Page Field Extraction Error:', error.message);
    throw error;
  }
}

/**
 * Command line interface
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node tests/pdf-page-field-extractor.js <pdf-path> <page-numbers>');
    console.log('');
    console.log('Examples:');
    console.log('  node tests/pdf-page-field-extractor.js ./workspace/SF86_Generated.pdf 17,18,19');
    console.log('  node tests/pdf-page-field-extractor.js ./workspace/SF86_Generated.pdf 17-33');
    console.log('  node tests/pdf-page-field-extractor.js ./workspace/SF86_Generated.pdf 5');
    console.log('');
    console.log('Output: Individual page JSON files saved to api/PDFoutput/pageX.json');
    process.exit(1);
  }
  
  const pdfPath = args[0];
  const pageArg = args[1];
  
  try {
    const targetPages = parsePageNumbers(pageArg);
    const results = await extractPdfFieldsByPage(pdfPath, targetPages);
    
    console.log('\n✅ PDF page field extraction completed successfully');
    console.log(`📁 Check api/PDFoutput/ for individual page JSON files`);
    
  } catch (error) {
    console.error('\n❌ PDF page field extraction failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('pdf-page-field-extractor.js')) {
  main();
}

export { extractPdfFieldsByPage, parsePageNumbers };
