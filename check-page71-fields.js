#!/usr/bin/env node

const fs = require('fs');

console.log("🔍 Checking page 71 fields and total field count...");

try {
  // Read the categorized fields
  const data = fs.readFileSync('output/test13/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);
  
  console.log(`\n📊 Total fields: ${fields.length}`);
  
  // Check if we have the expected 6197 fields
  if (fields.length !== 6197) {
    console.log(`❌ FIELD COUNT MISMATCH! Expected 6197, got ${fields.length} (difference: ${fields.length - 6197})`);
  } else {
    console.log(`✅ Field count is correct: 6197`);
  }
  
  // Find fields on page 71
  const page71Fields = fields.filter(f => f.page === 71);
  console.log(`\n🔍 Fields on page 71: ${page71Fields.length}`);
  
  if (page71Fields.length > 0) {
    console.log("\nPage 71 fields:");
    page71Fields.forEach((field, index) => {
      console.log(`${index + 1}. Section ${field.section}: ${field.name}`);
      console.log(`   Value: ${field.value || 'no value'}`);
      console.log(`   Confidence: ${field.confidence}`);
      console.log(`   isExplicitlyDetected: ${field.isExplicitlyDetected}`);
      console.log(`   wasMovedByHealing: ${field.wasMovedByHealing}`);
      console.log(`   Reason: ${field.reason || 'not specified'}`);
      console.log('');
    });
  }
  
  // Check section distribution
  const sectionCounts = {};
  fields.forEach(field => {
    sectionCounts[field.section] = (sectionCounts[field.section] || 0) + 1;
  });
  
  console.log("\n📊 Section distribution:");
  Object.entries(sectionCounts)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([section, count]) => {
      console.log(`Section ${section}: ${count} fields`);
    });
  
  // Check for Section15_3 fields specifically
  const section15_3Fields = fields.filter(f => f.name && f.name.includes('Section15_3'));
  console.log(`\n🔍 Section15_3 fields: ${section15_3Fields.length}`);
  
  if (section15_3Fields.length > 0) {
    console.log("\nSection15_3 fields:");
    section15_3Fields.slice(0, 10).forEach((field, index) => {
      console.log(`${index + 1}. Section ${field.section}, Page ${field.page}: ${field.name}`);
    });
  }
  
} catch (error) {
  console.error("Error:", error.message);
}
