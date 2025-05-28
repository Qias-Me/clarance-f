#!/usr/bin/env node

import fs from 'fs';

console.log("Searching for field '9782 0 R'...");

try {
  // Read the JSON file
  const data = fs.readFileSync('output/test13/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);
  
  // Find the target field
  const targetField = fields.find(field => field.id === "9782 0 R");
  
  if (targetField) {
    console.log("\n✅ Found target field!");
    console.log("📋 Field Details:");
    console.log(`   ID: ${targetField.id}`);
    console.log(`   Name: ${targetField.name}`);
    console.log(`   Section: ${targetField.section}`);
    console.log(`   Confidence: ${targetField.confidence}`);
    console.log(`   Page: ${targetField.page}`);
    console.log(`   isExplicitlyDetected: ${targetField.isExplicitlyDetected}`);
    console.log(`   wasMovedByHealing: ${targetField.wasMovedByHealing}`);
    
    // Check if it's correctly categorized
    if (targetField.section === 11) {
      console.log("\n🎉 SUCCESS: Field is correctly categorized as Section 11!");
    } else if (targetField.section === 15) {
      console.log("\n❌ ISSUE: Field is still incorrectly categorized as Section 15!");
    } else {
      console.log(`\n⚠️  Field is categorized as Section ${targetField.section}`);
    }
    
    // Check if explicit detection worked
    if (targetField.isExplicitlyDetected === true) {
      console.log("✅ Explicit detection: WORKING");
    } else {
      console.log("❌ Explicit detection: NOT WORKING");
    }
    
    // Check if self-healing moved it
    if (targetField.wasMovedByHealing === true) {
      console.log("⚠️  Self-healing: Field was moved by healing process");
    } else {
      console.log("✅ Self-healing: Field was not moved");
    }
    
  } else {
    console.log("\n❌ Field '9782 0 R' not found in the categorized fields!");
  }
  
} catch (error) {
  console.error("Error reading or parsing file:", error.message);
}

console.log("\nSearch completed.");
