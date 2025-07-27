#!/usr/bin/env node

/**
 * SF-86 PDF Validation Script
 * 
 * This script validates that entered data is correctly applied to the generated PDF
 * using the validation workflow. It integrates the functionality of:
 * - pdf-to-images.js (PDF to image conversion)
 * - pdf-page-field-extractor.js (PDF field extraction)
 * - clear-data.js (data clearing)
 * 
 * Usage:
 *   node tests/read-generated-pdf.js ./workspace/{GENERATED_PDF}.pdf
 *   node tests/read-generated-pdf.js ./workspace/SF86_Section13_Generated_2025-07-21.pdf
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFName, PDFString } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SECTION_13_PAGE = 17;
const EXPECTED_VALUES = [
  'UNIQUE_POSITION_TEST_123',
  'UNIQUE_MILITARY_EMPLOYER_TEST_456', 
  'UNIQUE_GAP_EXPLANATION_TEST_789',
  'UNIQUE_NONFED_EMPLOYER_TEST_999'
];

/**
 * Main validation function
 */
async function validateGeneratedPdf() {
  console.log('🚀 Starting PDF Validation...');
  console.log('='.repeat(50));
  
  // Get PDF path from command line arguments
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('❌ Error: PDF path is required');
    console.error('Usage: node tests/read-generated-pdf.js <pdf-path>');
    console.error('Example: node tests/read-generated-pdf.js ./workspace/SF86_Section13_Generated_2025-07-21.pdf');
    process.exit(1);
  }
  
  const pdfPath = path.resolve(args[0]);
  
  try {
    // Step 1: Validate PDF file exists
    console.log(`📄 Validating PDF: ${pdfPath}`);
    await fs.access(pdfPath);
    const stats = await fs.stat(pdfPath);
    console.log(`📊 PDF Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Step 2: Load PDF and extract fields
    console.log('\n🔍 Loading PDF and extracting fields...');
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    const form = pdfDoc.getForm();
    const allFields = form.getFields();
    
    console.log(`📋 Total fields in PDF: ${allFields.length}`);
    
    // Step 3: Extract fields from Section 13 page (page 17)
    console.log(`\n📄 Extracting fields from page ${SECTION_13_PAGE}...`);
    const pageFields = [];
    let fieldsWithValues = 0;
    let fieldsEmpty = 0;
    
    for (const field of allFields) {
      const fieldPage = getFieldPageNumber(field, pdfDoc);
      
      if (fieldPage === SECTION_13_PAGE) {
        const fieldData = {
          id: field.ref.tag.toString(),
          name: field.getName(),
          value: extractFieldValue(field),
          page: fieldPage,
          label: extractFieldLabel(field),
          type: field.constructor.name,
          rect: extractFieldRect(field),
          section: 13
        };
        
        pageFields.push(fieldData);
        
        if (fieldData.value && fieldData.value !== '' && fieldData.value !== false) {
          fieldsWithValues++;
        } else {
          fieldsEmpty++;
        }
      }
    }
    
    console.log(`📊 Page ${SECTION_13_PAGE} Results:`);
    console.log(`   - Total fields: ${pageFields.length}`);
    console.log(`   - Fields with values: ${fieldsWithValues}`);
    console.log(`   - Empty fields: ${fieldsEmpty}`);
    
    // Step 4: Validate against expected values
    console.log('\n🔍 Validating against expected values...');
    const validationResults = validateAgainstExpectedValues(pageFields);
    
    console.log(`📊 Validation Results:`);
    console.log(`   - Expected values found: ${validationResults.matchedCount}/${EXPECTED_VALUES.length}`);
    console.log(`   - Success rate: ${validationResults.successRate}%`);
    
    if (validationResults.matchedValues.length > 0) {
      console.log(`✅ Matched values: ${validationResults.matchedValues.join(', ')}`);
    }
    
    if (validationResults.missingValues.length > 0) {
      console.log(`❌ Missing values: ${validationResults.missingValues.join(', ')}`);
    }
    
    // Step 5: Save validation report
    const reportPath = path.join(__dirname, '..', 'workspace', `validation-report-${Date.now()}.json`);
    const report = {
      metadata: {
        pdfPath,
        validationDate: new Date().toISOString(),
        targetPage: SECTION_13_PAGE,
        section: 13
      },
      summary: {
        totalFields: pageFields.length,
        fieldsWithValues,
        fieldsEmpty,
        expectedValuesFound: validationResults.matchedCount,
        totalExpectedValues: EXPECTED_VALUES.length,
        successRate: validationResults.successRate
      },
      fields: pageFields,
      validation: validationResults
    };
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Validation report saved: ${reportPath}`);
    
    // Step 6: Final summary
    console.log('\n🎉 PDF Validation Completed!');
    console.log('='.repeat(50));
    
    if (validationResults.matchedCount === EXPECTED_VALUES.length) {
      console.log('✅ All expected values found in PDF - Validation PASSED');
      process.exit(0);
    } else {
      console.log('⚠️  Some expected values missing - Validation PARTIAL');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

/**
 * Helper functions
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
            return i + 1;
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not determine page for field ${field.getName()}`);
  }
  return null;
}

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
    console.warn(`Warning: Could not extract value for field ${field.getName()}`);
  }
  return null;
}

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
  return field.getName();
}

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

function validateAgainstExpectedValues(fields) {
  const matchedValues = [];
  const missingValues = [...EXPECTED_VALUES];
  
  // Check each field value against expected values
  for (const field of fields) {
    if (field.value && typeof field.value === 'string') {
      for (const expectedValue of EXPECTED_VALUES) {
        if (field.value.includes(expectedValue) || field.value === expectedValue) {
          if (!matchedValues.includes(expectedValue)) {
            matchedValues.push(expectedValue);
            const index = missingValues.indexOf(expectedValue);
            if (index > -1) {
              missingValues.splice(index, 1);
            }
          }
        }
      }
    }
  }
  
  const matchedCount = matchedValues.length;
  const totalExpected = EXPECTED_VALUES.length;
  const successRate = totalExpected > 0 ? (matchedCount / totalExpected * 100).toFixed(1) : '0';
  
  return {
    matchedCount,
    totalExpected,
    successRate: parseFloat(successRate),
    matchedValues,
    missingValues
  };
}

// Run the validation
validateGeneratedPdf().catch(console.error);
