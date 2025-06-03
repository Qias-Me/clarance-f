/**
 * Comprehensive Fix: Section 30 Field Duplicates - Remove Duplicates from section-30.json
 * 
 * ISSUE IDENTIFIED: Field ID 16262 appears 3 times as duplicates in section-30.json
 * This causes field mapping collisions where multiple field objects compete for the same ID.
 * 
 * ROOT CAUSE: 
 * - Field "16262 0 R" appears at lines 266, 907, and 1549
 * - All three entries are identical (same name, page, label, type, maxLength)
 * - Creates ambiguity in fieldNameToIdMap and field lookups
 * - Date values get incorrectly mapped to ZIP code field due to mapping conflicts
 * 
 * SOLUTION: Remove duplicate entries, keeping only the first occurrence
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Section 30 Field Duplicates Fix...\n');

// ============================================================================
// ANALYZE CURRENT SECTION-30.JSON FILE
// ============================================================================

const section30FilePath = './api/sections-references/section-30.json';

console.log('📁 Loading section-30.json file...');
const section30Data = JSON.parse(fs.readFileSync(section30FilePath, 'utf8'));

console.log(`📊 Current file structure:`);
console.log(`   Total fields: ${section30Data.fields.length}`);
console.log(`   Metadata total fields: ${section30Data.metadata.totalFields}`);

// ============================================================================
// IDENTIFY DUPLICATE FIELD IDS
// ============================================================================

console.log('\n🔍 Analyzing field ID duplicates...');

const fieldIdCounts = new Map();
const duplicateFieldIds = new Set();

section30Data.fields.forEach((field, index) => {
  const id = field.id;
  if (!fieldIdCounts.has(id)) {
    fieldIdCounts.set(id, []);
  }
  fieldIdCounts.get(id).push({ index, field });
  
  if (fieldIdCounts.get(id).length > 1) {
    duplicateFieldIds.add(id);
  }
});

console.log(`\n📋 Duplicate Field ID Analysis:`);
console.log(`   Total unique field IDs: ${fieldIdCounts.size}`);
console.log(`   Duplicate field IDs found: ${duplicateFieldIds.size}`);

duplicateFieldIds.forEach(id => {
  const occurrences = fieldIdCounts.get(id);
  console.log(`\n🚨 DUPLICATE: Field ID "${id}"`);
  console.log(`   Occurrences: ${occurrences.length}`);
  
  occurrences.forEach((occurrence, i) => {
    const field = occurrence.field;
    console.log(`   [${i + 1}] Index ${occurrence.index}: "${field.name}" (Page ${field.page}) - ${field.label}`);
  });
});

// ============================================================================
// SPECIFIC ANALYSIS FOR FIELD 16262
// ============================================================================

console.log(`\n🎯 DETAILED ANALYSIS FOR FIELD 16262:`);
const field16262Occurrences = fieldIdCounts.get('16262 0 R') || [];

if (field16262Occurrences.length > 1) {
  console.log(`   Found ${field16262Occurrences.length} duplicates of field 16262`);
  
  field16262Occurrences.forEach((occurrence, i) => {
    const field = occurrence.field;
    console.log(`\n   Duplicate ${i + 1} (Index ${occurrence.index}):`);
    console.log(`     ID: ${field.id}`);
    console.log(`     Name: ${field.name}`);
    console.log(`     Page: ${field.page}`);
    console.log(`     Label: ${field.label}`);
    console.log(`     Type: ${field.type}`);
    console.log(`     MaxLength: ${field.maxLength}`);
    console.log(`     UniqueId: ${field.uniqueId}`);
  });
  
  // Verify all duplicates are identical
  const firstField = field16262Occurrences[0].field;
  const allIdentical = field16262Occurrences.every(occurrence => {
    const field = occurrence.field;
    return (
      field.name === firstField.name &&
      field.page === firstField.page &&
      field.label === firstField.label &&
      field.type === firstField.type &&
      field.maxLength === firstField.maxLength
    );
  });
  
  console.log(`\n   ✅ All duplicates identical: ${allIdentical}`);
  
  if (allIdentical) {
    console.log(`   🎯 RESOLUTION: Keep first occurrence (Index ${field16262Occurrences[0].index}), remove others`);
  }
} else {
  console.log(`   ✅ No duplicates found for field 16262`);
}

// ============================================================================
// CREATE FIXED VERSION (REMOVE DUPLICATES)
// ============================================================================

console.log(`\n🛠️ Creating fixed version without duplicates...`);

// Track which field IDs we've seen to remove duplicates
const seenFieldIds = new Set();
const fixedFields = [];
const removedDuplicates = [];

section30Data.fields.forEach((field, originalIndex) => {
  const id = field.id;
  
  if (!seenFieldIds.has(id)) {
    // First occurrence - keep it
    seenFieldIds.add(id);
    fixedFields.push(field);
  } else {
    // Duplicate - remove it
    removedDuplicates.push({
      originalIndex,
      id: field.id,
      name: field.name,
      label: field.label
    });
    console.log(`   🗑️ Removing duplicate: Index ${originalIndex} - ID "${id}" - "${field.name}"`);
  }
});

console.log(`\n📊 Fix Summary:`);
console.log(`   Original fields: ${section30Data.fields.length}`);
console.log(`   Fixed fields: ${fixedFields.length}`);
console.log(`   Removed duplicates: ${removedDuplicates.length}`);

// ============================================================================
// CREATE BACKUP AND SAVE FIXED VERSION
// ============================================================================

// Create backup of original file
const backupPath = section30FilePath.replace('.json', '.backup.json');
console.log(`\n💾 Creating backup at: ${backupPath}`);
fs.writeFileSync(backupPath, JSON.stringify(section30Data, null, 2));

// Create fixed version
const fixedData = {
  ...section30Data,
  fields: fixedFields,
  metadata: {
    ...section30Data.metadata,
    totalFields: fixedFields.length,
    fixedDate: new Date().toISOString(),
    duplicatesRemoved: removedDuplicates.length,
    originalTotalFields: section30Data.fields.length
  }
};

console.log(`\n💾 Saving fixed version...`);
fs.writeFileSync(section30FilePath, JSON.stringify(fixedData, null, 2));

// ============================================================================
// VERIFICATION
// ============================================================================

console.log(`\n✅ VERIFICATION:`);

// Reload and verify the fixed file
const verificationData = JSON.parse(fs.readFileSync(section30FilePath, 'utf8'));
console.log(`   Fixed file fields: ${verificationData.fields.length}`);

// Check for remaining duplicates
const verificationIds = new Set();
let remainingDuplicates = 0;

verificationData.fields.forEach(field => {
  if (verificationIds.has(field.id)) {
    remainingDuplicates++;
  } else {
    verificationIds.add(field.id);
  }
});

console.log(`   Remaining duplicates: ${remainingDuplicates}`);
console.log(`   Unique field IDs: ${verificationIds.size}`);

// Verify specific fields are present
const hasField16262 = verificationData.fields.some(f => f.id === '16262 0 R');
const hasField16269 = verificationData.fields.some(f => f.id === '16269 0 R');
const hasField16267 = verificationData.fields.some(f => f.id === '16267 0 R');

console.log(`\n🎯 Critical Field Verification:`);
console.log(`   Field 16262 (ZIP Code): ${hasField16262 ? '✅ Present' : '❌ Missing'}`);
console.log(`   Field 16269 (Date Signed Page 2): ${hasField16269 ? '✅ Present' : '❌ Missing'}`);
console.log(`   Field 16267 (Date of Birth): ${hasField16267 ? '✅ Present' : '❌ Missing'}`);

// ============================================================================
// IMPACT ANALYSIS
// ============================================================================

console.log(`\n📈 EXPECTED IMPACT:`);
console.log(`   ✅ Field mapping collisions resolved`);
console.log(`   ✅ Date values will no longer map to ZIP code field 16262`);
console.log(`   ✅ Field creation from references will be consistent`);
console.log(`   ✅ PDF service field lookups will be deterministic`);
console.log(`   ✅ No more "Text truncated" warnings for dates in ZIP fields`);

console.log(`\n🎯 NEXT STEPS:`);
console.log(`   1. Test field creation: createFieldFromReference(30, "16262", "")`);
console.log(`   2. Test form data collection with Section 30`);
console.log(`   3. Test PDF generation with Section 30 data`);
console.log(`   4. Verify no date values assigned to field 16262`);
console.log(`   5. Verify ZIP codes correctly assigned to field 16262`);

console.log(`\n🔧 Section 30 Field Duplicates Fix Complete!`);
console.log(`📄 Backup saved to: ${backupPath}`);
console.log(`📄 Fixed file saved to: ${section30FilePath}`); 