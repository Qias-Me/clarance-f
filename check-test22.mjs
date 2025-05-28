#!/usr/bin/env node

import fs from 'fs';

console.log("🔍 Checking test22 results for field '9782 0 R'...");

try {
  // Read the JSON file
  const data = fs.readFileSync('output/test22/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);
  
  // Find the target field
  const targetField = fields.find(field => field.id === "9782 0 R");
  
  if (targetField) {
    console.log("\n✅ Found target field!");
    console.log(`   Section: ${targetField.section} (should be 11)`);
    console.log(`   isExplicitlyDetected: ${targetField.isExplicitlyDetected} (should be true)`);
    console.log(`   wasMovedByHealing: ${targetField.wasMovedByHealing} (should be false)`);
    
    if (targetField.section === 11 && targetField.isExplicitlyDetected === true) {
      console.log("\n🎉 SUCCESS: Fix is working!");
    } else {
      console.log("\n❌ FAILED: Fix is not working");
    }
  } else {
    console.log("\n❌ Field not found");
  }
  
} catch (error) {
  console.error("Error:", error.message);
}
