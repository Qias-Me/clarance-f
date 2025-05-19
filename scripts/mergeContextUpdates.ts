import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * This script merges the updated context files from the reports directory
 * with the original context files in the app/state/contexts/sections directory
 */
async function mergeContextUpdates() {
  console.log('Starting context file merging process...');
  
  // Directory paths
  const reportsDir = path.join(process.cwd(), 'reports');
  const sectionsDir = path.join(process.cwd(), 'app', 'state', 'contexts', 'sections');
  const backupDir = path.join(process.cwd(), 'backups', 'contexts', 'sections');
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(path.join(process.cwd(), 'backups'))) {
    fs.mkdirSync(path.join(process.cwd(), 'backups'));
  }
  if (!fs.existsSync(path.join(process.cwd(), 'backups', 'contexts'))) {
    fs.mkdirSync(path.join(process.cwd(), 'backups', 'contexts'));
  }
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  // Check if the reports directory exists
  if (!fs.existsSync(reportsDir)) {
    console.error(`Reports directory not found at ${reportsDir}`);
    console.log('Run npm run validate-section-contexts first to generate the updated context files');
    return;
  }

  // Get all updated context files
  const updatedFiles = fs.readdirSync(reportsDir)
    .filter(file => file.startsWith('updated-') && file.endsWith('.tsx'));
  
  if (updatedFiles.length === 0) {
    console.error('No updated context files found in the reports directory');
    console.log('Run npm run validate-section-contexts first to generate the updated context files');
    return;
  }
  
  console.log(`Found ${updatedFiles.length} updated context files to merge`);
  
  // Process each updated file
  const results = {
    success: 0,
    skipped: 0,
    error: 0
  };
  
  for (const updatedFile of updatedFiles) {
    const originalFileName = updatedFile.replace('updated-', '');
    const updatedFilePath = path.join(reportsDir, updatedFile);
    const originalFilePath = path.join(sectionsDir, originalFileName);
    
    console.log(`\nProcessing ${originalFileName}...`);
    
    // Check if the original file exists
    if (!fs.existsSync(originalFilePath)) {
      console.warn(`Original file not found at ${originalFilePath}, skipping...`);
      results.skipped++;
      continue;
    }
    
    try {
      // Create backup of original file
      const backupFilePath = path.join(backupDir, `${originalFileName}.bak.${Date.now()}`);
      fs.copyFileSync(originalFilePath, backupFilePath);
      console.log(`Backup created at ${backupFilePath}`);
      
      // Read file contents
      const updatedContent = fs.readFileSync(updatedFilePath, 'utf-8');
      const originalContent = fs.readFileSync(originalFilePath, 'utf-8');
      
      // Extract field IDs from both files for better comparison
      const originalIds = extractContextFieldIds(originalContent);
      const updatedIds = extractContextFieldIds(updatedContent);
      
      // Check if the updated file has new fields
      const hasNewFields = updatedIds.some(id => !originalIds.includes(id));
      
      if (!hasNewFields && updatedContent === originalContent) {
        console.log(`No changes detected for ${originalFileName}, skipping...`);
        results.skipped++;
        continue;
      }
      
      // Copy the updated file to the original location
      fs.copyFileSync(updatedFilePath, originalFilePath);
      console.log(`✅ Successfully merged changes for ${originalFileName}`);
      results.success++;
    } catch (error) {
      console.error(`❌ Error merging ${originalFileName}: ${error}`);
      results.error++;
    }
  }
  
  // Display summary
  console.log('\n========== MERGE SUMMARY ==========');
  console.log(`Total files processed: ${updatedFiles.length}`);
  console.log(`Successfully merged: ${results.success}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Errors: ${results.error}`);
  console.log('==================================');
  
  // Suggest next steps
  if (results.success > 0) {
    console.log('\nNext steps:');
    console.log('1. Review the merged files to ensure they look correct');
    console.log('2. Run npm run validate-section-contexts again to verify all fields are now present');
    console.log('3. Run any type checking or linting to fix any potential issues');
    console.log('4. Test the application to ensure all form fields work correctly');
  }
}

/**
 * Extract all field IDs from a context file content
 */
function extractContextFieldIds(content: string): string[] {
  const idRegex = /id:\s*["'](\d+)["']/g;
  const ids: string[] = [];
  let match;
  
  while ((match = idRegex.exec(content)) !== null) {
    ids.push(match[1]);
  }
  
  return ids;
}

// Interactive confirmation before proceeding
function confirmMerge() {
  console.log('\n⚠️  WARNING: This script will overwrite your context files with the updated versions ⚠️');
  console.log('Backups will be created in the backups/contexts/sections directory');
  console.log('Make sure you have committed your changes before proceeding\n');
  
  try {
    // Try to get confirmation from user
    const response = process.argv.includes('--yes') ? 'y' : 
      execSync('set /p response=Are you sure you want to continue? (y/N): ').toString().trim().toLowerCase();
    
    if (response === 'y' || response === 'yes') {
      mergeContextUpdates().catch(console.error);
    } else {
      console.log('Merge operation cancelled');
    }
  } catch (error) {
    // If we can't get interactive input, just proceed with a warning
    console.log('Could not get interactive input. Proceeding with merge...');
    mergeContextUpdates().catch(console.error);
  }
}

// Start the confirmation process
confirmMerge(); 