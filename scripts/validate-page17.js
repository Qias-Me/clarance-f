#!/usr/bin/env node

/**
 * Page 17 Validation Script
 * 
 * This script validates Section 13 page 17 field data and provides visual inspection guidance.
 * It demonstrates the fine-tuned workflow for checking and correcting field inputs.
 * 
 * Usage: node scripts/validate-page17.js <pdf-path>
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main validation function for page 17
 */
async function validatePage17(pdfPath) {
  console.log('🔍 Page 17 Validation Starting...');
  console.log('==================================');
  
  const outputDir = path.join(__dirname, '..', 'api', 'PDFoutput');
  const photosDir = path.join(__dirname, '..', 'api', 'PDFphotos');
  
  // Check if page data exists
  const pageDataPath = path.join(outputDir, 'page17.json');
  const pageImagePath = path.join(photosDir, 'page17.png');
  
  try {
    await fs.access(pageDataPath);
    console.log('✅ Page 17 data file found');
  } catch {
    console.error('❌ Page 17 data file not found. Run field extraction first.');
    console.error('   Command: node scripts/pdf-page-field-extractor.js <pdf-path> 17');
    return false;
  }
  
  try {
    await fs.access(pageImagePath);
    console.log('✅ Page 17 image file found');
  } catch {
    console.warn('⚠️ Page 17 image file not found. Run image generation first.');
    console.warn('   Command: node scripts/pdf-to-images.js <pdf-path>');
  }
  
  // Load and analyze page data
  console.log('\n📊 Loading page 17 field data...');
  const pageData = JSON.parse(await fs.readFile(pageDataPath, 'utf-8'));
  
  console.log(`📋 Total fields on page 17: ${pageData.fields.length}`);
  console.log(`📄 PDF source: ${pageData.metadata.pdfPath}`);
  console.log(`⏰ Extracted at: ${pageData.metadata.extractedAt}`);
  
  // Analyze field data
  const analysis = {
    totalFields: pageData.fields.length,
    filledFields: 0,
    emptyFields: 0,
    testDataFields: 0,
    criticalFields: [],
    testDataFound: []
  };
  
  console.log('\n🔍 Analyzing field data...');
  
  for (const field of pageData.fields) {
    if (field.value !== null && field.value !== undefined && field.value !== '') {
      analysis.filledFields++;
      
      // Check for our test data
      if (typeof field.value === 'string' && field.value.includes('UNIQUE_') && field.value.includes('_TEST_')) {
        analysis.testDataFields++;
        analysis.testDataFound.push({
          fieldName: field.name,
          label: field.label,
          value: field.value,
          coordinates: field.rect
        });
      }
      
      // Check for critical fields (employment-related)
      if (field.label && (
        field.label.includes('rank/position') ||
        field.label.includes('duty station') ||
        field.label.includes('employer') ||
        field.label.includes('supervisor')
      )) {
        analysis.criticalFields.push({
          fieldName: field.name,
          label: field.label,
          value: field.value,
          coordinates: field.rect
        });
      }
    } else {
      analysis.emptyFields++;
    }
  }
  
  // Display analysis results
  console.log('\n📊 FIELD ANALYSIS RESULTS');
  console.log('=========================');
  console.log(`📋 Total Fields: ${analysis.totalFields}`);
  console.log(`✅ Filled Fields: ${analysis.filledFields}`);
  console.log(`❌ Empty Fields: ${analysis.emptyFields}`);
  console.log(`🧪 Test Data Fields: ${analysis.testDataFields}`);
  console.log(`📈 Fill Rate: ${((analysis.filledFields / analysis.totalFields) * 100).toFixed(2)}%`);
  
  // Show test data found
  if (analysis.testDataFound.length > 0) {
    console.log('\n🧪 TEST DATA VALIDATION');
    console.log('=======================');
    for (const testField of analysis.testDataFound) {
      console.log(`✅ Found: ${testField.fieldName}`);
      console.log(`   📝 Label: ${testField.label}`);
      console.log(`   💾 Value: ${testField.value}`);
      console.log(`   📍 Position: x=${testField.coordinates.x}, y=${testField.coordinates.y}`);
      console.log('');
    }
  }
  
  // Show critical employment fields
  if (analysis.criticalFields.length > 0) {
    console.log('\n🎯 CRITICAL EMPLOYMENT FIELDS');
    console.log('=============================');
    for (const criticalField of analysis.criticalFields) {
      const status = criticalField.value ? '✅ FILLED' : '❌ EMPTY';
      console.log(`${status} ${criticalField.fieldName}`);
      console.log(`   📝 Label: ${criticalField.label}`);
      if (criticalField.value) {
        console.log(`   💾 Value: ${criticalField.value}`);
      }
      console.log(`   📍 Position: x=${criticalField.coordinates.x}, y=${criticalField.coordinates.y}`);
      console.log('');
    }
  }
  
  // Visual inspection guidance
  console.log('\n👁️ VISUAL INSPECTION GUIDANCE');
  console.log('==============================');
  console.log(`📸 Page Image: ${pageImagePath}`);
  console.log(`📊 Field Data: ${pageDataPath}`);
  console.log('');
  console.log('🔍 To visually verify field placement:');
  console.log('   1. Open the page image in a browser or image viewer');
  console.log('   2. Check that test data appears in the correct positions');
  console.log('   3. Verify field coordinates match visual placement');
  console.log('   4. Confirm critical employment fields are properly filled');
  console.log('');
  console.log('💡 Field Correction Suggestions:');
  
  if (analysis.emptyFields > analysis.filledFields) {
    console.log('   ⚠️ Many fields are empty - check field mapping logic');
  }
  
  if (analysis.testDataFields === 0) {
    console.log('   ❌ No test data found - verify PDF generation process');
  } else {
    console.log(`   ✅ ${analysis.testDataFields} test data fields found - validation successful`);
  }
  
  if (analysis.criticalFields.filter(f => !f.value).length > 0) {
    console.log('   ⚠️ Some critical employment fields are empty');
  }
  
  console.log('\n✨ Page 17 validation completed!');
  return true;
}

/**
 * Main function
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.error('❌ Error: PDF path is required');
      console.error('Usage: node scripts/validate-page17.js <pdf-path>');
      console.error('Example: node scripts/validate-page17.js ./workspace/SF86_Section13_Test_2025-07-21.pdf');
      process.exit(1);
    }

    const pdfPath = path.resolve(args[0]);
    
    // Check if PDF exists
    try {
      await fs.access(pdfPath);
      const stats = await fs.stat(pdfPath);
      console.log(`📄 PDF: ${pdfPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    } catch (error) {
      console.error(`❌ PDF file not found: ${pdfPath}`);
      process.exit(1);
    }

    const success = await validatePage17(pdfPath);
    
    if (success) {
      console.log('\n🎉 Validation workflow completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Validation workflow failed');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the validation
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
