#!/usr/bin/env node

/**
 * Comprehensive Data Clearing Utility
 * 
 * This utility clears all accumulated data from previous runs across
 * the entire SF-86 project, including:
 * - Generated PDF images (PDFphotos)
 * - PDF field extraction output (PDFoutput) 
 * - Validation reports and generated PDFs (workspace)
 * - Temporary files and logs
 * 
 * Usage:
 *   node scripts/clear-data.js
 *   node scripts/clear-data.js --dry-run
 *   node scripts/clear-data.js --target=workspace
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const targetArg = args.find(arg => arg.startsWith('--target='));
const specificTarget = targetArg ? targetArg.split('=')[1] : null;

// Data directories configuration
const DATA_DIRECTORIES = {
  pdfphotos: {
    path: path.join(__dirname, '..', 'api', 'PDFphotos'),
    description: 'Generated PDF page images',
    patterns: ['*.png'],
    extensions: ['.png']
  },
  pdfoutput: {
    path: path.join(__dirname, '..', 'api', 'PDFoutput'),
    description: 'PDF field extraction output',
    patterns: ['*.json'],
    extensions: ['.json']
  },
};

/**
 * Check if a file should be removed based on directory configuration
 */
function shouldRemoveFile(filePath, fileName, dirConfig) {
  // Check extensions
  if (dirConfig.extensions) {
    const hasMatchingExtension = dirConfig.extensions.some(ext => fileName.endsWith(ext));
    if (!hasMatchingExtension) return false;
  }

  // Check keywords
  if (dirConfig.keywords) {
    const hasMatchingKeyword = dirConfig.keywords.some(keyword => fileName.includes(keyword));
    if (hasMatchingKeyword) return true;
  }

  // If no keywords specified, remove all files with matching extensions
  if (!dirConfig.keywords && dirConfig.extensions) {
    return dirConfig.extensions.some(ext => fileName.endsWith(ext));
  }

  return false;
}

/**
 * Clear data from a specific directory
 */
function clearDirectory(dirKey, dirConfig) {
  console.log(`\n📁 Processing: ${dirKey.toUpperCase()}`);
  console.log(`   Path: ${path.relative(__dirname, dirConfig.path)}`);
  console.log(`   Description: ${dirConfig.description}`);
  
  let filesRemoved = 0;
  let filesSkipped = 0;
  let totalSize = 0;

  try {
    if (fs.existsSync(dirConfig.path)) {
      const files = fs.readdirSync(dirConfig.path);
      
      if (files.length === 0) {
        console.log(`   📂 Directory is empty`);
        return { filesRemoved: 0, filesSkipped: 0, totalSize: 0 };
      }

      for (const file of files) {
        const filePath = path.join(dirConfig.path, file);
        
        try {
          const stat = fs.statSync(filePath);
          
          if (stat.isFile()) {
            if (shouldRemoveFile(filePath, file, dirConfig)) {
              const fileSize = stat.size;
              
              if (isDryRun) {
                console.log(`   🔍 Would remove: ${file} (${(fileSize / 1024).toFixed(1)} KB)`);
              } else {
                fs.unlinkSync(filePath);
                console.log(`   🗑️  Removed: ${file} (${(fileSize / 1024).toFixed(1)} KB)`);
              }
              
              filesRemoved++;
              totalSize += fileSize;
            } else {
              console.log(`   ⏭️  Skipped: ${file} (not a generated file)`);
              filesSkipped++;
            }
          } else if (stat.isDirectory()) {
            console.log(`   📁 Skipped directory: ${file}`);
            filesSkipped++;
          }
        } catch (fileError) {
          console.error(`   ❌ Error processing ${file}:`, fileError.message);
          filesSkipped++;
        }
      }

    } else {
      console.log(`   📁 Creating directory: ${dirConfig.path}`);
      if (!isDryRun) {
        fs.mkdirSync(dirConfig.path, { recursive: true });
      }
    }

  } catch (error) {
    console.error(`   ❌ Error processing directory:`, error.message);
  }

  console.log(`   ✅ Summary: ${filesRemoved} removed, ${filesSkipped} skipped, ${(totalSize / 1024 / 1024).toFixed(2)} MB cleared`);
  
  return { filesRemoved, filesSkipped, totalSize };
}

/**
 * Main data clearing function
 */
function clearAllData() {
  console.log('🧹 COMPREHENSIVE DATA CLEARING UTILITY');
  console.log('='.repeat(50));
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No files will actually be removed');
    console.log('-'.repeat(50));
  }

  if (specificTarget) {
    console.log(`🎯 Target: ${specificTarget.toUpperCase()} only`);
    console.log('-'.repeat(50));
  }

  let totalFilesRemoved = 0;
  let totalFilesSkipped = 0;
  let totalSizeCleared = 0;
  let directoriesProcessed = 0;

  // Process directories
  const directoriesToProcess = specificTarget 
    ? { [specificTarget]: DATA_DIRECTORIES[specificTarget] }
    : DATA_DIRECTORIES;

  for (const [dirKey, dirConfig] of Object.entries(directoriesToProcess)) {
    if (!dirConfig) {
      console.error(`❌ Unknown target: ${dirKey}`);
      continue;
    }

    const result = clearDirectory(dirKey, dirConfig);
    totalFilesRemoved += result.filesRemoved;
    totalFilesSkipped += result.filesSkipped;
    totalSizeCleared += result.totalSize;
    directoriesProcessed++;
  }

  // Final summary
  console.log('\n📊 FINAL SUMMARY');
  console.log('='.repeat(30));
  console.log(`🗑️  Files ${isDryRun ? 'to be removed' : 'removed'}: ${totalFilesRemoved}`);
  console.log(`⏭️  Files skipped: ${totalFilesSkipped}`);
  console.log(`📁 Directories processed: ${directoriesProcessed}`);
  console.log(`💾 Total size ${isDryRun ? 'to be' : ''} cleared: ${(totalSizeCleared / 1024 / 1024).toFixed(2)} MB`);
  
  if (isDryRun) {
    console.log('\n💡 Run without --dry-run to actually remove files');
  } else {
    console.log('\n✅ Data clearing completed successfully!');
    console.log('🚀 Environment is clean and ready for new runs');
  }

  return {
    filesRemoved: totalFilesRemoved,
    filesSkipped: totalFilesSkipped,
    totalSize: totalSizeCleared,
    directoriesProcessed
  };
}

/**
 * Display help information
 */
function showHelp() {
  console.log('🧹 Comprehensive Data Clearing Utility');
  console.log('=====================================\n');
  
  console.log('Usage:');
  console.log('  node scripts/clear-data.js                    # Clear all data');
  console.log('  node scripts/clear-data.js --dry-run          # Preview what would be removed');
  console.log('  node scripts/clear-data.js --target=workspace # Clear specific directory only\n');
  
  console.log('Available targets:');
  for (const [key, config] of Object.entries(DATA_DIRECTORIES)) {
    console.log(`  ${key.padEnd(12)} - ${config.description}`);
  }
  
  console.log('\nDirectories that will be processed:');
  for (const [key, config] of Object.entries(DATA_DIRECTORIES)) {
    console.log(`  📁 ${key}: ${path.relative(process.cwd(), config.path)}`);
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
  } else {
    try {
      clearAllData();
    } catch (error) {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    }
  }
}

export { clearAllData, DATA_DIRECTORIES };
