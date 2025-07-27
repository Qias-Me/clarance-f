#!/usr/bin/env node

/**
 * PDF Validation Workflow Script
 * 
 * This script demonstrates the new PDF validation service that processes PDFs in memory
 * and validates field inputs page by page. It integrates with the existing utilities:
 * - pdf-to-images: Generate page images for visual inspection
 * - extract-pdf-fields: Extract field data from specific pages
 * - clear-data: Clear previous validation data
 * 
 * Usage:
 *   node scripts/validate-pdf-workflow.js <pdf-path> [page-number]
 *   node scripts/validate-pdf-workflow.js ./workspace/SF86_Section13_Test_2025-07-21.pdf 17
 *   node scripts/validate-pdf-workflow.js ./workspace/SF86_Generated.pdf 17-33
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse page numbers from command line argument
 */
function parsePageNumbers(pageArg) {
  if (!pageArg) return [17]; // Default to page 17
  
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
    // Single page format: "17"
    const page = parseInt(pageArg.trim());
    if (isNaN(page)) {
      throw new Error(`Invalid page number: ${pageArg}`);
    }
    pages.push(page);
  }
  
  return pages.sort((a, b) => a - b);
}

/**
 * Main validation workflow
 */
async function main() {
  try {
    console.log('🚀 PDF Validation Workflow Starting...');
    console.log('=====================================');
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.error('❌ Error: PDF path is required');
      console.error('Usage: node scripts/validate-pdf-workflow.js <pdf-path> [page-numbers]');
      console.error('Example: node scripts/validate-pdf-workflow.js ./workspace/SF86_Section13_Test_2025-07-21.pdf 17');
      process.exit(1);
    }

    const pdfPath = path.resolve(args[0]);
    const targetPages = parsePageNumbers(args[1]);
    
    console.log(`📄 PDF Path: ${pdfPath}`);
    console.log(`🎯 Target Pages: ${targetPages.join(', ')}`);
    
    // Check if PDF exists
    try {
      await fs.access(pdfPath);
      const stats = await fs.stat(pdfPath);
      console.log(`✅ PDF found (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    } catch (error) {
      console.error(`❌ PDF file not found: ${pdfPath}`);
      process.exit(1);
    }

    // Load PDF into memory
    console.log('\n📖 Loading PDF into memory...');
    const pdfBytes = await fs.readFile(pdfPath);
    console.log(`✅ PDF loaded: ${pdfBytes.length} bytes`);

    // Step 1: Clear previous data
    console.log('\n🧹 Clearing previous validation data...');
    await runScript('clear-data', []);

    // Step 2: Generate page images
    console.log('\n📸 Generating page images...');
    await runScript('pdf-to-images', [pdfPath]);

    // Step 3: Extract field data
    console.log('\n📊 Extracting field data...');
    const pageRange = targetPages.length === 1 ? targetPages[0].toString() :
                     targetPages.length === 2 ? targetPages.join(',') :
                     `${Math.min(...targetPages)}-${Math.max(...targetPages)}`;
    await runScript('extract-pdf-fields', [pdfPath, pageRange]);

    // Step 4: Analyze extracted data
    console.log('\n🔍 Analyzing extracted field data...');
    const validationReport = await analyzeExtractedData(targetPages);

    // Display results
    console.log('\n📊 VALIDATION RESULTS');
    console.log('=====================');

    if (validationReport.success) {
      console.log('✅ Validation completed successfully');

      console.log(`📄 Total Pages Processed: ${validationReport.totalPages}`);
      console.log(`📊 Total Fields: ${validationReport.totalFields}`);
      console.log(`✅ Valid Fields: ${validationReport.validFields}`);
      console.log(`❌ Invalid Fields: ${validationReport.invalidFields}`);
      console.log(`📈 Success Rate: ${validationReport.totalFields > 0 ? ((validationReport.validFields / validationReport.totalFields) * 100).toFixed(2) : 0}%`);
      
      // Show page-specific results
      console.log('\n📋 Page-by-Page Results:');
      for (const page of validationReport.pages) {
        console.log(`\n📄 Page ${page.pageNumber}:`);
        console.log(`   📊 Total Fields: ${page.totalFields}`);
        console.log(`   ✅ Valid Fields: ${page.validFields}`);
        console.log(`   ❌ Invalid Fields: ${page.invalidFields}`);
        console.log(`   📸 Image: ${page.pageImagePath}`);
        console.log(`   📊 Data: ${page.pageDataPath}`);
        
        if (page.invalidFields > 0) {
          console.log(`   🔍 Invalid Field Details:`);
          const invalidFields = page.fields.filter(f => !f.isValid);
          for (const field of invalidFields.slice(0, 5)) { // Show first 5 invalid fields
            console.log(`     - ${field.fieldName}: ${field.error}`);
            if (field.suggestions && field.suggestions.length > 0) {
              console.log(`       💡 Suggestion: ${field.suggestions[0]}`);
            }
          }
          if (invalidFields.length > 5) {
            console.log(`     ... and ${invalidFields.length - 5} more invalid fields`);
          }
        }
      }
      
    } else {
      console.log('❌ Validation failed');
      if (validationReport.errors.length > 0) {
        console.log('\n💥 Errors:');
        validationReport.errors.forEach(error => console.log(`   - ${error}`));
      }
    }

    // Show processing time
    console.log(`\n⏱️ Total processing time: ${validationReport.processingTime}ms`);
    
    // Show available resources
    console.log('\n📁 Generated Resources:');
    console.log(`   📸 Page Images: api/PDFphotos/page${targetPages[0]}.png (and others)`);
    console.log(`   📊 Field Data: api/PDFoutput/page${targetPages[0]}.json (and others)`);
    if (validationReport.invalidFields > 0) {
      console.log(`   🔧 Field Corrections: api/PDFoutput/field_corrections.json`);
    }
    
    console.log('\n✨ Validation workflow completed!');
    console.log('💡 Next steps:');
    console.log('   1. Review page images for visual validation');
    console.log('   2. Check field data JSON files for detailed field information');
    console.log('   3. Apply field corrections if needed');
    console.log('   4. Re-run validation after corrections');

  } catch (error) {
    console.error('\n❌ Validation workflow failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

/**
 * Run a script utility
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
        console.log(`✅ Script ${scriptName} completed successfully`);
        resolve();
      } else {
        console.error(`❌ Script ${scriptName} failed with code ${code}`);
        if (stderr) console.error('📄 Error:', stderr);
        reject(new Error(`Script ${scriptName} failed: ${stderr || 'Unknown error'}`));
      }
    });

    process.on('error', (error) => {
      reject(new Error(`Failed to start script ${scriptName}: ${error.message}`));
    });
  });
}

/**
 * Analyze extracted field data
 */
async function analyzeExtractedData(targetPages) {
  const outputDir = path.join(__dirname, '..', 'api', 'PDFoutput');
  const photosDir = path.join(__dirname, '..', 'api', 'PDFphotos');

  const report = {
    success: true,
    totalPages: targetPages.length,
    totalFields: 0,
    validFields: 0,
    invalidFields: 0,
    pages: [],
    errors: [],
    warnings: []
  };

  try {
    for (const pageNumber of targetPages) {
      const pageDataPath = path.join(outputDir, `page${pageNumber}.json`);
      const pageImagePath = path.join(photosDir, `page${pageNumber}.png`);

      let pageData = null;
      try {
        const data = await fs.readFile(pageDataPath, 'utf-8');
        pageData = JSON.parse(data);
      } catch (error) {
        console.warn(`⚠️ Could not load page data for page ${pageNumber}:`, error.message);
        continue;
      }

      const pageResult = {
        pageNumber,
        totalFields: pageData.fields ? pageData.fields.length : 0,
        validFields: 0,
        invalidFields: 0,
        fields: [],
        pageImagePath,
        pageDataPath
      };

      // Simple validation: check if fields have values
      if (pageData.fields) {
        for (const field of pageData.fields) {
          const isValid = field.value !== null && field.value !== undefined && field.value !== '';

          if (isValid) {
            pageResult.validFields++;
          } else {
            pageResult.invalidFields++;
          }

          pageResult.fields.push({
            fieldId: field.id,
            fieldName: field.name,
            value: field.value,
            isValid,
            error: isValid ? null : 'Field is empty or null'
          });
        }
      }

      report.pages.push(pageResult);
      report.totalFields += pageResult.totalFields;
      report.validFields += pageResult.validFields;
      report.invalidFields += pageResult.invalidFields;
    }

    return report;

  } catch (error) {
    report.success = false;
    report.errors.push(error.message);
    return report;
  }
}

// Run the workflow
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
