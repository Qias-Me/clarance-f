#!/usr/bin/env node

import fs from 'fs';

console.log("🔍 Finding missing Section 11 fields...");

try {
  // Read the categorized fields from test28
  const data = fs.readFileSync('output/test28/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);
  
  console.log(`\n📊 Total fields: ${fields.length}`);
  
  // Find all fields with "Section11" in their name
  const section11NameFields = fields.filter(field => 
    field.name && field.name.toLowerCase().includes("section11")
  );
  
  console.log(`\n🔍 Found ${section11NameFields.length} fields with "Section11" in name`);
  
  // Group by actual section assignment
  const sectionGroups = {};
  section11NameFields.forEach(field => {
    const section = field.section || 0;
    if (!sectionGroups[section]) {
      sectionGroups[section] = [];
    }
    sectionGroups[section].push(field);
  });
  
  console.log(`\n📊 Section11 fields distributed across sections:`);
  Object.entries(sectionGroups).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([section, fields]) => {
    console.log(`   Section ${section}: ${fields.length} fields`);
    
    // Show some examples if not in Section 11
    if (section !== '11') {
      console.log(`   Examples:`);
      fields.slice(0, 3).forEach(field => {
        console.log(`     - ${field.name} (ID: ${field.id})`);
        console.log(`       isExplicitlyDetected: ${field.isExplicitlyDetected}, wasMovedByHealing: ${field.wasMovedByHealing}`);
      });
    }
  });
  
  // Find fields that should be in Section 11 but aren't
  const misplacedFields = section11NameFields.filter(field => field.section !== 11);
  
  console.log(`\n❌ MISPLACED SECTION11 FIELDS: ${misplacedFields.length}`);
  misplacedFields.forEach((field, index) => {
    console.log(`${index + 1}. ${field.name}`);
    console.log(`   ID: ${field.id}`);
    console.log(`   Current Section: ${field.section}`);
    console.log(`   isExplicitlyDetected: ${field.isExplicitlyDetected}`);
    console.log(`   wasMovedByHealing: ${field.wasMovedByHealing}`);
    console.log(`   Confidence: ${field.confidence}`);
    console.log(``);
  });
  
  // Check current Section 11 count vs expected
  const currentSection11Count = fields.filter(f => f.section === 11).length;
  const expectedSection11Count = 254;
  const shortage = expectedSection11Count - currentSection11Count;
  
  console.log(`\n📊 SECTION 11 ANALYSIS:`);
  console.log(`   Current count: ${currentSection11Count}`);
  console.log(`   Expected count: ${expectedSection11Count}`);
  console.log(`   Shortage: ${shortage} fields`);
  console.log(`   Fields with "Section11" in name but not in Section 11: ${misplacedFields.length}`);
  
  if (misplacedFields.length >= shortage) {
    console.log(`   ✅ We have enough misplaced Section11 fields to fix the shortage!`);
  } else {
    console.log(`   ⚠️  We need to find ${shortage - misplacedFields.length} more fields for Section 11`);
  }
  
} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("\nAnalysis completed.");
