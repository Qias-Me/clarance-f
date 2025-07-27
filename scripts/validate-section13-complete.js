#!/usr/bin/env node

/**
 * Complete Section 13 Validation Script
 * 
 * This script validates all Section 13 pages (17-33) with comprehensive field analysis,
 * auto-correction suggestions, and visual inspection guidance.
 * 
 * Usage: node scripts/validate-section13-complete.js <pdf-path>
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Section 13 configuration
const SECTION_13_PAGES = Array.from({ length: 17 }, (_, i) => i + 17); // Pages 17-33
const SECTION_13_METADATA = {
  name: "Employment Activities",
  pages: SECTION_13_PAGES,
  expectedTestData: [
    'UNIQUE_POSITION_TEST_123',
    'UNIQUE_MILITARY_EMPLOYER_TEST_456', 
    'UNIQUE_GAP_EXPLANATION_TEST_789',
    'UNIQUE_NONFED_EMPLOYER_TEST_999'
  ],
  criticalFieldPatterns: [
    'rank/position',
    'duty station',
    'employer',
    'supervisor',
    'employment',
    'position title',
    'organization',
    'address',
    'phone',
    'email',
    'dates'
  ]
};

/**
 * Run utility scripts
 */
async function runScript(scriptName, args) {
  return new Promise((resolve, reject) => {
    const scriptMap = {
      'pdf-to-images': 'scripts/pdf-to-images.js',
      'extract-pdf-fields': 'scripts/pdf-page-field-extractor.js',
      'clear-data': 'scripts/clear-data.js'
    };

    const scriptPath = scriptMap[scriptName];
    if (!scriptPath) {
      reject(new Error(`Unknown script: ${scriptName}`));
      return;
    }

    const fullScriptPath = path.join(__dirname, '..', scriptPath);
    const process = spawn('node', [fullScriptPath, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.join(__dirname, '..')
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
        console.log(`✅ ${scriptName} completed successfully`);
        resolve(stdout);
      } else {
        console.error(`❌ ${scriptName} failed with code ${code}`);
        if (stderr) console.error('Error:', stderr);
        reject(new Error(`Script ${scriptName} failed: ${stderr || 'Unknown error'}`));
      }
    });

    process.on('error', (error) => {
      reject(new Error(`Failed to start script ${scriptName}: ${error.message}`));
    });
  });
}

/**
 * Validate field value based on field type and label
 */
function validateFieldValue(field) {
  const validation = {
    isValid: true,
    errors: [],
    suggestions: [],
    confidence: 1.0
  };

  if (!field.value || field.value === null || field.value === '') {
    // Check if field appears to be required
    if (field.label && (
      field.label.includes('*') ||
      field.label.includes('required') ||
      field.label.includes('must') ||
      field.label.includes('provide')
    )) {
      validation.isValid = false;
      validation.errors.push('Required field is empty');
      validation.suggestions.push('Please provide a value for this required field');
      validation.confidence = 0.9;
    }
    return validation;
  }

  const value = String(field.value);
  const label = (field.label || '').toLowerCase();

  // Date validation
  if (label.includes('date') || field.name.includes('date')) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      validation.isValid = false;
      validation.errors.push('Invalid date format');
      validation.suggestions.push('Use YYYY-MM-DD format (e.g., 2023-01-15)');
      validation.confidence = 0.8;
    }
  }

  // Phone validation
  if (label.includes('phone') || label.includes('telephone')) {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    if (!phoneRegex.test(value)) {
      validation.isValid = false;
      validation.errors.push('Invalid phone format');
      validation.suggestions.push('Use XXX-XXX-XXXX format (e.g., 555-123-4567)');
      validation.confidence = 0.8;
    }
  }

  // Email validation
  if (label.includes('email')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      validation.isValid = false;
      validation.errors.push('Invalid email format');
      validation.suggestions.push('Use valid email format (e.g., user@example.com)');
      validation.confidence = 0.8;
    }
  }

  // ZIP code validation
  if (label.includes('zip') || label.includes('postal')) {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(value)) {
      validation.isValid = false;
      validation.errors.push('Invalid ZIP code format');
      validation.suggestions.push('Use XXXXX or XXXXX-XXXX format');
      validation.confidence = 0.8;
    }
  }

  // Length validation
  if (value.length > 1000) {
    validation.isValid = false;
    validation.errors.push('Field value is too long');
    validation.suggestions.push('Shorten the text to under 1000 characters');
    validation.confidence = 0.9;
  }

  return validation;
}

/**
 * Analyze a single page
 */
async function analyzePage(pageNumber) {
  const outputDir = path.join(__dirname, '..', 'api', 'PDFoutput');
  const photosDir = path.join(__dirname, '..', 'api', 'PDFphotos');
  
  const pageDataPath = path.join(outputDir, `page${pageNumber}.json`);
  const pageImagePath = path.join(photosDir, `page${pageNumber}.png`);
  
  const analysis = {
    pageNumber,
    totalFields: 0,
    filledFields: 0,
    emptyFields: 0,
    validFields: 0,
    invalidFields: 0,
    testDataFields: 0,
    criticalFields: 0,
    fields: [],
    testDataFound: [],
    criticalFieldsFound: [],
    validationErrors: [],
    hasImage: false,
    hasData: false
  };

  try {
    // Check if data file exists
    await fs.access(pageDataPath);
    analysis.hasData = true;
  } catch {
    analysis.validationErrors.push(`Page ${pageNumber} data file not found`);
    return analysis;
  }

  try {
    // Check if image file exists
    await fs.access(pageImagePath);
    analysis.hasImage = true;
  } catch {
    analysis.validationErrors.push(`Page ${pageNumber} image file not found`);
  }

  // Load page data
  const pageData = JSON.parse(await fs.readFile(pageDataPath, 'utf-8'));
  analysis.totalFields = pageData.fields.length;

  // Analyze each field
  for (const field of pageData.fields) {
    const fieldAnalysis = {
      fieldId: field.id,
      fieldName: field.name,
      label: field.label,
      value: field.value,
      coordinates: field.rect,
      validation: validateFieldValue(field)
    };

    analysis.fields.push(fieldAnalysis);

    // Count field types
    if (field.value !== null && field.value !== undefined && field.value !== '') {
      analysis.filledFields++;
    } else {
      analysis.emptyFields++;
    }

    if (fieldAnalysis.validation.isValid) {
      analysis.validFields++;
    } else {
      analysis.invalidFields++;
    }

    // Check for test data
    if (typeof field.value === 'string') {
      for (const testData of SECTION_13_METADATA.expectedTestData) {
        if (field.value.includes(testData)) {
          analysis.testDataFields++;
          analysis.testDataFound.push({
            testData,
            fieldName: field.name,
            label: field.label,
            value: field.value,
            coordinates: field.rect
          });
          break;
        }
      }
    }

    // Check for critical fields
    if (field.label) {
      const label = field.label.toLowerCase();
      for (const pattern of SECTION_13_METADATA.criticalFieldPatterns) {
        if (label.includes(pattern)) {
          analysis.criticalFields++;
          analysis.criticalFieldsFound.push({
            pattern,
            fieldName: field.name,
            label: field.label,
            value: field.value,
            coordinates: field.rect,
            isFilled: field.value !== null && field.value !== undefined && field.value !== ''
          });
          break;
        }
      }
    }
  }

  return analysis;
}

/**
 * Generate comprehensive validation report
 */
function generateValidationReport(pageAnalyses) {
  const report = {
    section: 'Section 13 - Employment Activities',
    totalPages: pageAnalyses.length,
    summary: {
      totalFields: 0,
      filledFields: 0,
      emptyFields: 0,
      validFields: 0,
      invalidFields: 0,
      testDataFields: 0,
      criticalFields: 0
    },
    testDataValidation: {
      expectedTestData: SECTION_13_METADATA.expectedTestData.length,
      foundTestData: 0,
      testDataDetails: []
    },
    criticalFieldsAnalysis: {
      totalCriticalFields: 0,
      filledCriticalFields: 0,
      emptyCriticalFields: 0
    },
    pageDetails: pageAnalyses,
    recommendations: []
  };

  // Calculate summary statistics
  for (const page of pageAnalyses) {
    report.summary.totalFields += page.totalFields;
    report.summary.filledFields += page.filledFields;
    report.summary.emptyFields += page.emptyFields;
    report.summary.validFields += page.validFields;
    report.summary.invalidFields += page.invalidFields;
    report.summary.testDataFields += page.testDataFields;
    report.summary.criticalFields += page.criticalFields;

    // Collect test data
    for (const testData of page.testDataFound) {
      if (!report.testDataValidation.testDataDetails.find(t => t.testData === testData.testData)) {
        report.testDataValidation.foundTestData++;
        report.testDataValidation.testDataDetails.push(testData);
      }
    }

    // Count critical fields
    for (const criticalField of page.criticalFieldsFound) {
      report.criticalFieldsAnalysis.totalCriticalFields++;
      if (criticalField.isFilled) {
        report.criticalFieldsAnalysis.filledCriticalFields++;
      } else {
        report.criticalFieldsAnalysis.emptyCriticalFields++;
      }
    }
  }

  // Generate recommendations
  const fillRate = (report.summary.filledFields / report.summary.totalFields) * 100;
  const validationRate = (report.summary.validFields / report.summary.totalFields) * 100;
  const testDataRate = (report.testDataValidation.foundTestData / report.testDataValidation.expectedTestData) * 100;

  if (fillRate < 50) {
    report.recommendations.push('⚠️ Low field fill rate - check field mapping logic');
  }
  if (validationRate < 90) {
    report.recommendations.push('⚠️ Some fields have validation errors - review field formats');
  }
  if (testDataRate < 100) {
    report.recommendations.push('❌ Not all test data found - verify PDF generation process');
  }
  if (report.criticalFieldsAnalysis.emptyCriticalFields > 0) {
    report.recommendations.push('⚠️ Some critical employment fields are empty');
  }

  if (report.recommendations.length === 0) {
    report.recommendations.push('✅ All validations passed - Section 13 looks good!');
  }

  return report;
}

/**
 * Main validation function
 */
async function validateSection13Complete(pdfPath) {
  console.log('🚀 Complete Section 13 Validation Starting...');
  console.log('==============================================');
  console.log(`📄 PDF: ${pdfPath}`);
  console.log(`📋 Pages: ${SECTION_13_PAGES.join(', ')}`);
  console.log(`🧪 Expected Test Data: ${SECTION_13_METADATA.expectedTestData.length} items`);

  try {
    // Step 1: Clear previous data
    console.log('\n🧹 Step 1: Clearing previous validation data...');
    await runScript('clear-data', []);

    // Step 2: Generate page images
    console.log('\n📸 Step 2: Generating page images...');
    await runScript('pdf-to-images', [pdfPath]);

    // Step 3: Extract field data for all Section 13 pages
    console.log('\n📊 Step 3: Extracting field data...');
    const pageRange = `${SECTION_13_PAGES[0]}-${SECTION_13_PAGES[SECTION_13_PAGES.length - 1]}`;
    await runScript('extract-pdf-fields', [pdfPath, pageRange]);

    // Step 4: Analyze each page
    console.log('\n🔍 Step 4: Analyzing pages...');
    const pageAnalyses = [];

    for (const pageNumber of SECTION_13_PAGES) {
      console.log(`   📄 Analyzing page ${pageNumber}...`);
      const analysis = await analyzePage(pageNumber);
      pageAnalyses.push(analysis);
    }

    // Step 5: Generate comprehensive report
    console.log('\n📋 Step 5: Generating validation report...');
    const report = generateValidationReport(pageAnalyses);

    // Step 6: Display results
    displayValidationResults(report);

    // Step 7: Save detailed report
    await saveValidationReport(report);

    return report;

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    throw error;
  }
}

/**
 * Display validation results
 */
function displayValidationResults(report) {
  console.log('\n📊 SECTION 13 VALIDATION RESULTS');
  console.log('=================================');

  // Summary statistics
  console.log(`📋 ${report.section}`);
  console.log(`📄 Total Pages: ${report.totalPages}`);
  console.log(`📊 Total Fields: ${report.summary.totalFields}`);
  console.log(`✅ Filled Fields: ${report.summary.filledFields} (${((report.summary.filledFields / report.summary.totalFields) * 100).toFixed(2)}%)`);
  console.log(`❌ Empty Fields: ${report.summary.emptyFields}`);
  console.log(`🔍 Valid Fields: ${report.summary.validFields} (${((report.summary.validFields / report.summary.totalFields) * 100).toFixed(2)}%)`);
  console.log(`⚠️ Invalid Fields: ${report.summary.invalidFields}`);

  // Test data validation
  console.log('\n🧪 TEST DATA VALIDATION');
  console.log('=======================');
  console.log(`📊 Expected: ${report.testDataValidation.expectedTestData}`);
  console.log(`✅ Found: ${report.testDataValidation.foundTestData}`);
  console.log(`📈 Success Rate: ${((report.testDataValidation.foundTestData / report.testDataValidation.expectedTestData) * 100).toFixed(2)}%`);

  if (report.testDataValidation.testDataDetails.length > 0) {
    console.log('\n🎯 Test Data Details:');
    for (const testData of report.testDataValidation.testDataDetails) {
      console.log(`   ✅ ${testData.testData}`);
      console.log(`      📍 Page: ${Math.floor(testData.coordinates.y / 50) + 17} (estimated)`);
      console.log(`      📝 Field: ${testData.fieldName}`);
      console.log(`      💾 Value: ${testData.value.substring(0, 100)}...`);
    }
  }

  // Critical fields analysis
  console.log('\n🎯 CRITICAL FIELDS ANALYSIS');
  console.log('===========================');
  console.log(`📊 Total Critical Fields: ${report.criticalFieldsAnalysis.totalCriticalFields}`);
  console.log(`✅ Filled: ${report.criticalFieldsAnalysis.filledCriticalFields}`);
  console.log(`❌ Empty: ${report.criticalFieldsAnalysis.emptyCriticalFields}`);
  console.log(`📈 Fill Rate: ${report.criticalFieldsAnalysis.totalCriticalFields > 0 ? ((report.criticalFieldsAnalysis.filledCriticalFields / report.criticalFieldsAnalysis.totalCriticalFields) * 100).toFixed(2) : 0}%`);

  // Page-by-page summary
  console.log('\n📄 PAGE-BY-PAGE SUMMARY');
  console.log('=======================');
  for (const page of report.pageDetails) {
    const status = page.hasData ? '✅' : '❌';
    const imageStatus = page.hasImage ? '📸' : '❌';
    console.log(`${status} Page ${page.pageNumber}: ${page.filledFields}/${page.totalFields} filled, ${page.testDataFields} test data ${imageStatus}`);
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('==================');
  for (const recommendation of report.recommendations) {
    console.log(`   ${recommendation}`);
  }

  // Visual inspection guidance
  console.log('\n👁️ VISUAL INSPECTION RESOURCES');
  console.log('===============================');
  console.log('📸 Page Images: api/PDFphotos/page17.png through page33.png');
  console.log('📊 Field Data: api/PDFoutput/page17.json through page33.json');
  console.log('📋 Full Report: api/PDFoutput/section13_validation_report.json');
  console.log('');
  console.log('🔍 To verify field placement:');
  console.log('   1. Open page images in browser for visual inspection');
  console.log('   2. Cross-reference with field data JSON files');
  console.log('   3. Check coordinates match visual placement');
  console.log('   4. Verify test data appears in correct positions');
}

/**
 * Save detailed validation report
 */
async function saveValidationReport(report) {
  try {
    const outputDir = path.join(__dirname, '..', 'api', 'PDFoutput');
    const reportPath = path.join(outputDir, 'section13_validation_report.json');

    const detailedReport = {
      ...report,
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      metadata: {
        script: 'validate-section13-complete.js',
        section: 13,
        pages: SECTION_13_PAGES,
        expectedTestData: SECTION_13_METADATA.expectedTestData
      }
    };

    await fs.writeFile(reportPath, JSON.stringify(detailedReport, null, 2));
    console.log(`💾 Detailed report saved: ${reportPath}`);
  } catch (error) {
    console.warn('⚠️ Could not save validation report:', error.message);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.error('❌ Error: PDF path is required');
      console.error('Usage: node scripts/validate-section13-complete.js <pdf-path>');
      console.error('Example: node scripts/validate-section13-complete.js ./workspace/SF86_Section13_Test_2025-07-21.pdf');
      process.exit(1);
    }

    const pdfPath = path.resolve(args[0]);

    // Check if PDF exists
    try {
      await fs.access(pdfPath);
      const stats = await fs.stat(pdfPath);
      console.log(`📄 PDF found: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
      console.error(`❌ PDF file not found: ${pdfPath}`);
      process.exit(1);
    }

    const report = await validateSection13Complete(pdfPath);

    console.log('\n🎉 Complete Section 13 validation finished!');
    console.log(`📊 Overall Success: ${report.testDataValidation.foundTestData}/${report.testDataValidation.expectedTestData} test data found`);

    process.exit(0);

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
