#!/usr/bin/env node

/**
 * PDF to Images Converter
 *
 * This script converts a PDF file into individual page images (PNG format).
 *
 * Usage: node scripts/pdf-to-images.js <pdf-path>
 *
 * Examples:
 *   node scripts/pdf-to-images.js ./workspace/SF86_Section13_Test_2025-07-21.pdf
 *   node scripts/pdf-to-images.js ./public/clean.pdf
 *
 * Output: C:\Users\Jason\Desktop\AI-Coding\clarance-f\api\PDFphotos\page1.png, page2.png, etc.
 */

import pdf from 'pdf-poppler';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Script starting...');
console.log('📁 Script directory:', __dirname);

// Get PDF path from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Error: PDF path is required');
  console.error('Usage: node scripts/pdf-to-images.js <pdf-path>');
  console.error('Example: node scripts/pdf-to-images.js ./workspace/SF86_Section13_Test_2025-07-21.pdf');
  process.exit(1);
}

// Configuration
const PDF_PATH = path.resolve(args[0]);
const OUTPUT_DIR = path.join(__dirname, '..', 'api', 'PDFphotos');

// Additional directories to clear
const DATA_DIRECTORIES = [
  path.join(__dirname, '..', 'api', 'PDFphotos'),      // Generated page images
  path.join(__dirname, '..', 'api', 'PDFoutput'),     // PDF field extraction output
  path.join(__dirname, '..', 'workspace'),            // Validation reports and generated PDFs
];

console.log('📄 PDF Path:', PDF_PATH);
console.log('📂 Primary Output Dir:', OUTPUT_DIR);
console.log('🧹 Data directories to clear:', DATA_DIRECTORIES.length);

// PDF conversion options
const options = {
  format: 'png',
  out_dir: OUTPUT_DIR,
  out_prefix: 'page',
  page: null // Convert all pages
};

/**
 * Clear all accumulated data from previous runs
 * @param {string} preservePdfPath - PDF file path to preserve during clearing
 */
function clearAllData(preservePdfPath = null) {
  console.log('\n🧹 COMPREHENSIVE DATA CLEARING');
  console.log('='.repeat(50));

  let totalFilesRemoved = 0;
  let totalDirectoriesProcessed = 0;

  for (const dirPath of DATA_DIRECTORIES) {
    console.log(`\n📁 Processing directory: ${path.relative(__dirname, dirPath)}`);

    try {
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        let filesRemovedInDir = 0;

        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stat = fs.statSync(filePath);

          if (stat.isFile()) {
            // Determine if file should be removed based on directory and extension
            let shouldRemove = false;

            if (dirPath.includes('PDFphotos') && file.endsWith('.png')) {
              shouldRemove = true;
            } else if (dirPath.includes('PDFoutput') && file.endsWith('.json')) {
              shouldRemove = true;
            } else if (dirPath.includes('workspace')) {
              // Remove validation reports, generated PDFs, and temporary files
              // But preserve the PDF file we're currently processing
              const isCurrentPdf = preservePdfPath && path.resolve(filePath) === path.resolve(preservePdfPath);

              if (!isCurrentPdf && (file.endsWith('.json') ||
                  file.endsWith('.pdf') ||
                  file.includes('validation') ||
                  file.includes('SF86') ||
                  file.includes('demo-') ||
                  file.includes('section'))) {
                shouldRemove = true;
              }
            }

            if (shouldRemove) {
              fs.unlinkSync(filePath);
              console.log(`🗑️  Removed: ${file}`);
              filesRemovedInDir++;
              totalFilesRemoved++;
            } else {
              console.log(`⏭️  Skipped: ${file} (not a generated file)`);
            }
          }
        }

        console.log(`✅ Directory processed: ${filesRemovedInDir} files removed`);
        totalDirectoriesProcessed++;

      } else {
        console.log(`📁 Creating directory: ${path.relative(__dirname, dirPath)}`);
        fs.mkdirSync(dirPath, { recursive: true });
        totalDirectoriesProcessed++;
      }

    } catch (error) {
      console.error(`❌ Error processing ${dirPath}:`, error.message);
    }
  }

  console.log('\n📊 DATA CLEARING SUMMARY');
  console.log('-'.repeat(30));
  console.log(`🗑️  Total files removed: ${totalFilesRemoved}`);
  console.log(`📁 Directories processed: ${totalDirectoriesProcessed}`);
  console.log('✅ Data clearing completed\n');
}

/**
 * Clear the output directory if it exists, or create it if it doesn't
 * @deprecated Use clearAllData() for comprehensive clearing
 */
function prepareOutputDirectory() {
  console.log(`📁 Preparing output directory: ${OUTPUT_DIR}`);

  if (fs.existsSync(OUTPUT_DIR)) {
    // Clear existing files
    const files = fs.readdirSync(OUTPUT_DIR);
    for (const file of files) {
      if (file.endsWith('.png')) {
        const filePath = path.join(OUTPUT_DIR, file);
        fs.unlinkSync(filePath);
        console.log(`🗑️  Removed existing file: ${file}`);
      }
    }
  } else {
    // Create directory
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created output directory: ${OUTPUT_DIR}`);
  }
}

/**
 * Check if the PDF file exists
 */
function validatePdfFile() {
  console.log(`📄 Checking PDF file: ${PDF_PATH}`);
  
  if (!fs.existsSync(PDF_PATH)) {
    throw new Error(`PDF file not found: ${PDF_PATH}`);
  }
  
  const stats = fs.statSync(PDF_PATH);
  console.log(`✅ PDF file found (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
}

/**
 * Rename generated files to match required naming convention
 */
function renameGeneratedFiles() {
  console.log('🔄 Renaming files to match naming convention...');

  const files = fs.readdirSync(OUTPUT_DIR);
  const pngFiles = files.filter(file => file.endsWith('.png')).sort();

  let renamedCount = 0;

  for (let i = 0; i < pngFiles.length; i++) {
    const oldFileName = pngFiles[i];
    const newFileName = `page${i + 1}.png`;

    if (oldFileName !== newFileName) {
      const oldPath = path.join(OUTPUT_DIR, oldFileName);
      const newPath = path.join(OUTPUT_DIR, newFileName);

      fs.renameSync(oldPath, newPath);
      console.log(`📝 Renamed: ${oldFileName} → ${newFileName}`);
      renamedCount++;
    } else {
      console.log(`✅ Already correct: ${newFileName}`);
    }
  }

  console.log(`📋 Renamed ${renamedCount} files`);
  return pngFiles.length;
}

/**
 * Convert PDF to images using pdf-poppler
 */
async function convertPdfToImages() {
  try {
    console.log('\n🚀 STARTING PDF TO IMAGES CONVERSION');
    console.log('='.repeat(50));

    // Step 1: Clear all data from previous runs (preserve current PDF)
    clearAllData(PDF_PATH);

    // Step 2: Validate inputs
    validatePdfFile();

    console.log('🔄 Converting PDF pages to images...');
    console.log(`📄 Input: ${PDF_PATH}`);
    console.log(`📂 Output: ${OUTPUT_DIR}`);

    // Convert PDF to images
    const results = await pdf.convert(PDF_PATH, options);

    console.log(`✅ PDF conversion completed. Generated ${results.length} images.`);

    // Rename files to match required naming convention
    const totalFiles = renameGeneratedFiles();

    console.log('\n🎉 PDF TO IMAGES CONVERSION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`📂 Output directory: ${OUTPUT_DIR}`);
    console.log(`📊 Total pages converted: ${totalFiles}`);

    // List created files
    const files = fs.readdirSync(OUTPUT_DIR)
      .filter(file => file.endsWith('.png'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
      });

    console.log(`📋 Created files: ${files.join(', ')}`);

    console.log('\n✨ Ready for next workflow step!');
    console.log('💡 Next: Run field extraction or validation scripts');

  } catch (error) {
    console.error('❌ Error during PDF conversion:', error.message);
    console.error('Stack trace:', error.stack);

    if (error.message.includes('poppler')) {
      console.error('💡 Tip: pdf-poppler requires poppler-utils to be installed on your system.');
      console.error('   For Windows: Download poppler from https://blog.alivate.com.au/poppler-windows/');
      console.error('   Extract and add the bin folder to your PATH environment variable.');
    }

    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔧 ENHANCED PDF TO IMAGES CONVERTER');
  console.log('===================================');
  console.log('🧹 Includes comprehensive data clearing');
  console.log('📄 Converts PDF to individual page images');
  console.log('🔄 Prepares clean environment for validation\n');

  try {
    await convertPdfToImages();
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

export { convertPdfToImages, clearAllData };
