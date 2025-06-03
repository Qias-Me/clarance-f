#!/usr/bin/env node

/**
 * Fix Section 30 Duplicate Field Entries
 * 
 * This script removes duplicate field 16262 entries from section-30.json
 * to prevent field lookup conflicts that cause date/ZIP code cross-assignment.
 */

const fs = require('fs');
const path = require('path');

const SECTION30_JSON_PATH = path.join(__dirname, 'api/sections-references/section-30.json');

console.log('🔧 Starting Section 30 duplicate field cleanup...');

try {
  // Read the section-30.json file
  console.log('📖 Reading section-30.json...');
  const jsonContent = fs.readFileSync(SECTION30_JSON_PATH, 'utf8');
  const section30Data = JSON.parse(jsonContent);

  console.log(`📊 Total fields before cleanup: ${section30Data.length}`);

  // Find all field 16262 entries
  const field16262Indices = [];
  section30Data.forEach((field, index) => {
    if (field.id === '16262 0 R') {
      field16262Indices.push(index);
      console.log(`🔍 Found field 16262 at index ${index}: ${field.name}`);
    }
  });

  console.log(`📋 Found ${field16262Indices.length} duplicate field 16262 entries`);

  if (field16262Indices.length > 1) {
    // Keep only the first occurrence, remove the rest
    console.log('🧹 Removing duplicate entries...');
    
    // Remove from end to beginning to maintain indices
    for (let i = field16262Indices.length - 1; i >= 1; i--) {
      const indexToRemove = field16262Indices[i];
      console.log(`❌ Removing duplicate field 16262 at index ${indexToRemove}`);
      section30Data.splice(indexToRemove, 1);
    }

    // Write the cleaned data back to file
    console.log('💾 Writing cleaned data back to file...');
    const cleanedJsonContent = JSON.stringify(section30Data, null, 2);
    fs.writeFileSync(SECTION30_JSON_PATH, cleanedJsonContent, 'utf8');

    console.log(`✅ Cleanup complete!`);
    console.log(`📊 Total fields after cleanup: ${section30Data.length}`);
    console.log(`🗑️ Removed ${field16262Indices.length - 1} duplicate entries`);
    
    // Verify the fix
    const remainingField16262 = section30Data.filter(field => field.id === '16262 0 R');
    console.log(`✅ Verification: ${remainingField16262.length} field 16262 entry remaining`);
    
    if (remainingField16262.length === 1) {
      console.log(`✅ SUCCESS: Field 16262 now has only one entry:`);
      console.log(`   ID: ${remainingField16262[0].id}`);
      console.log(`   Name: ${remainingField16262[0].name}`);
      console.log(`   Label: ${remainingField16262[0].label}`);
    }
  } else {
    console.log('ℹ️ No duplicate entries found. File is already clean.');
  }

} catch (error) {
  console.error('❌ Error during cleanup:', error);
  process.exit(1);
}

console.log('🎉 Section 30 duplicate field cleanup completed successfully!'); 