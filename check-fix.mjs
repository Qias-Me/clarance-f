#!/usr/bin/env node

import fs from 'fs';

console.log("🔍 Checking if the fix worked for field '9782 0 R'...");

try {
  // Read the JSON file
  const data = fs.readFileSync('output/test18/categorized-fields.json', 'utf8');
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
    
    // Check if the fix worked
    const isCorrectSection = targetField.section === 11;
    const isExplicitlyDetected = targetField.isExplicitlyDetected === true;
    const wasNotMovedByHealing = targetField.wasMovedByHealing === false;
    
    console.log("\n🎯 FIX VERIFICATION:");
    
    if (isCorrectSection) {
      console.log("✅ Section: CORRECT (11)");
    } else {
      console.log(`❌ Section: INCORRECT (${targetField.section}, should be 11)`);
    }
    
    if (isExplicitlyDetected) {
      console.log("✅ Explicit Detection: WORKING (true)");
    } else {
      console.log("❌ Explicit Detection: NOT WORKING (false)");
    }
    
    if (wasNotMovedByHealing) {
      console.log("✅ Self-Healing: PROTECTED (not moved)");
    } else {
      console.log("❌ Self-Healing: MOVED FIELD (should be protected)");
    }
    
    // Overall result
    if (isCorrectSection && isExplicitlyDetected && wasNotMovedByHealing) {
      console.log("\n🎉 SUCCESS: All fixes are working correctly!");
    } else {
      console.log("\n❌ PARTIAL/NO FIX: Some issues remain");
    }
    
  } else {
    console.log("\n❌ Field '9782 0 R' not found in the categorized fields!");
  }
  
} catch (error) {
  console.error("Error reading or parsing file:", error.message);
}

console.log("\nCheck completed.");
