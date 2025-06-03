/**
 * Fix Section 30 Field Duplicates Script
 * 
 * This script removes duplicate field entries from section-30.json that are
 * causing field mapping collisions in the PDF service.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 ===== FIXING SECTION 30 FIELD DUPLICATES =====\n');

// ============================================================================
// LOAD SECTION 30 REFERENCE DATA
// ============================================================================

const sectionFilePath = path.join(__dirname, 'api', 'sections-references', 'section-30.json');
console.log(`📂 Loading section data from: ${sectionFilePath}`);

if (!fs.existsSync(sectionFilePath)) {
  console.error(`❌ File not found: ${sectionFilePath}`);
  process.exit(1);
}

const sectionData = JSON.parse(fs.readFileSync(sectionFilePath, 'utf8'));
console.log(`✅ Loaded section data with ${sectionData.fields.length} fields`);

// ============================================================================
// ANALYZE DUPLICATES
// ============================================================================

console.log('\n🔍 ===== ANALYZING FIELD DUPLICATES =====\n');

const fieldIdCounts = new Map();
const duplicateFields = new Map();

// Count occurrences of each field ID
sectionData.fields.forEach((field, index) => {
  const cleanId = field.id.replace(' 0 R', '');
  
  if (!fieldIdCounts.has(cleanId)) {
    fieldIdCounts.set(cleanId, []);
  }
  fieldIdCounts.get(cleanId).push({ field, index });
});

// Identify duplicates
fieldIdCounts.forEach((occurrences, fieldId) => {
  if (occurrences.length > 1) {
    duplicateFields.set(fieldId, occurrences);
    console.log(`🔄 Field ID ${fieldId} appears ${occurrences.length} times:`);
    occurrences.forEach((occurrence, i) => {
      console.log(`  [${i+1}] Index ${occurrence.index}: ${occurrence.field.name} (${occurrence.field.label})`);
    });
    console.log('');
  }
});

console.log(`📊 Total unique field IDs: ${fieldIdCounts.size}`);
console.log(`🔄 Duplicate field IDs: ${duplicateFields.size}`);

// ============================================================================
// REMOVE DUPLICATES
// ============================================================================

console.log('\n🧹 ===== REMOVING DUPLICATE FIELDS =====\n');

const fieldsToRemove = [];
const keptFields = new Set();

duplicateFields.forEach((occurrences, fieldId) => {
  console.log(`🔧 Processing duplicates for field ${fieldId}:`);
  
  // Keep the first occurrence, mark others for removal
  const firstOccurrence = occurrences[0];
  keptFields.add(firstOccurrence.index);
  console.log(`  ✅ Keeping occurrence at index ${firstOccurrence.index}`);
  
  // Mark other occurrences for removal
  for (let i = 1; i < occurrences.length; i++) {
    const occurrence = occurrences[i];
    fieldsToRemove.push(occurrence.index);
    console.log(`  ❌ Removing occurrence at index ${occurrence.index}`);
  }
  console.log('');
});

console.log(`📊 Fields to remove: ${fieldsToRemove.length}`);
console.log(`📊 Fields to keep: ${sectionData.fields.length - fieldsToRemove.length}`);

// ============================================================================
// CREATE CLEANED DATA
// ============================================================================

console.log('\n🏗️ ===== CREATING CLEANED DATA =====\n');

// Sort removal indices in descending order to avoid index shifting issues
fieldsToRemove.sort((a, b) => b - a);

const originalFieldCount = sectionData.fields.length;
const cleanedFields = [...sectionData.fields];

fieldsToRemove.forEach(index => {
  console.log(`🗑️ Removing field at index ${index}: ${cleanedFields[index].name}`);
  cleanedFields.splice(index, 1);
});

// Update the section data
const cleanedSectionData = {
  ...sectionData,
  fields: cleanedFields,
  metadata: {
    ...sectionData.metadata,
    totalFields: cleanedFields.length
  }
};

console.log(`✅ Cleaned data created:`);
console.log(`   📊 Original field count: ${originalFieldCount}`);
console.log(`   📊 Cleaned field count: ${cleanedFields.length}`);
console.log(`   📊 Fields removed: ${originalFieldCount - cleanedFields.length}`);

// ============================================================================
// VERIFY NO DUPLICATES REMAIN
// ============================================================================

console.log('\n🔍 ===== VERIFYING CLEANED DATA =====\n');

const verificationCounts = new Map();
cleanedFields.forEach(field => {
  const cleanId = field.id.replace(' 0 R', '');
  verificationCounts.set(cleanId, (verificationCounts.get(cleanId) || 0) + 1);
});

let hasDuplicates = false;
verificationCounts.forEach((count, fieldId) => {
  if (count > 1) {
    console.log(`❌ Still has duplicates: Field ${fieldId} appears ${count} times`);
    hasDuplicates = true;
  }
});

if (!hasDuplicates) {
  console.log(`✅ Verification passed: No duplicate field IDs remain`);
  console.log(`📊 Unique field IDs: ${verificationCounts.size}`);
} else {
  console.error(`❌ Verification failed: Duplicates still exist`);
  process.exit(1);
}

// ============================================================================
// SAVE CLEANED DATA
// ============================================================================

console.log('\n💾 ===== SAVING CLEANED DATA =====\n');

// Create backup of original file
const backupPath = sectionFilePath + '.backup';
console.log(`📋 Creating backup: ${backupPath}`);
fs.writeFileSync(backupPath, JSON.stringify(sectionData, null, 2));

// Save cleaned data
console.log(`💾 Saving cleaned data: ${sectionFilePath}`);
fs.writeFileSync(sectionFilePath, JSON.stringify(cleanedSectionData, null, 2));

console.log('✅ File saved successfully');

// ============================================================================
// SPECIFIC FIELD 16262 VALIDATION
// ============================================================================

console.log('\n🎯 ===== FIELD 16262 VALIDATION =====\n');

const field16262 = cleanedFields.find(f => f.id.replace(' 0 R', '') === '16262');
if (field16262) {
  console.log(`✅ Field 16262 found and unique:`);
  console.log(`   🆔 ID: ${field16262.id}`);
  console.log(`   📛 Name: ${field16262.name}`);
  console.log(`   🏷️ Label: ${field16262.label}`);
  console.log(`   📝 Type: ${field16262.type}`);
  console.log(`   📏 Max Length: ${field16262.maxLength}`);
  console.log(`   🔗 Unique ID: ${field16262.uniqueId}`);
} else {
  console.error(`❌ Field 16262 not found after cleanup!`);
  process.exit(1);
}

console.log('\n🎉 ===== FIX COMPLETED SUCCESSFULLY =====\n');
console.log('✅ Section 30 field duplicates have been removed');
console.log('✅ Field 16262 is now unique and should not cause mapping collisions');
console.log('✅ Backup created in case rollback is needed');
console.log('\nNext steps:');
console.log('1. Test the PDF generation with Section 30 data');
console.log('2. Verify that date values go to correct date fields');
console.log('3. Verify that ZIP code values go to the ZIP code field');
console.log('4. If successful, the backup file can be deleted'); 