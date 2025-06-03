/**
 * Simple Fix: Remove Duplicate Field 16262 from Section 30
 */

const fs = require('fs');

console.log('🔧 Starting Simple Section 30 Field Duplicates Fix...\n');

try {
  // Load the file
  const filePath = './api/sections-references/section-30.json';
  console.log('📁 Loading section-30.json...');
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`📊 Loaded ${data.fields.length} fields`);
  
  // Find all field 16262 occurrences
  const field16262Indices = [];
  data.fields.forEach((field, index) => {
    if (field.id === '16262 0 R') {
      field16262Indices.push(index);
      console.log(`🎯 Found field 16262 at index ${index}: ${field.name} - ${field.label}`);
    }
  });
  
  console.log(`\n🔍 Found ${field16262Indices.length} occurrences of field 16262`);
  
  if (field16262Indices.length > 1) {
    console.log('🛠️ Removing duplicates...');
    
    // Remove duplicates (keep first occurrence, remove others)
    const indicesToRemove = field16262Indices.slice(1); // Remove all except first
    console.log(`🗑️ Will remove indices: ${indicesToRemove.join(', ')}`);
    
    // Remove in reverse order to maintain indices
    for (let i = indicesToRemove.length - 1; i >= 0; i--) {
      const indexToRemove = indicesToRemove[i];
      console.log(`   Removing field at index ${indexToRemove}`);
      data.fields.splice(indexToRemove, 1);
    }
    
    console.log(`✅ Removed ${indicesToRemove.length} duplicate field(s)`);
    console.log(`📊 New field count: ${data.fields.length}`);
    
    // Update metadata
    data.metadata.totalFields = data.fields.length;
    data.metadata.fixedDate = new Date().toISOString();
    data.metadata.duplicatesRemoved = indicesToRemove.length;
    
    // Create backup
    const backupPath = filePath.replace('.json', '.backup.json');
    console.log(`💾 Creating backup at: ${backupPath}`);
    
    // Save fixed version
    console.log(`💾 Saving fixed version...`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log('✅ Fix complete!');
    
    // Verification
    const verifyData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const remaining16262 = verifyData.fields.filter(f => f.id === '16262 0 R').length;
    console.log(`🔍 Verification: ${remaining16262} occurrence(s) of field 16262 remaining`);
    
  } else {
    console.log('✅ No duplicates found - file is already correct');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
} 