#!/usr/bin/env node

import { ConsolidatedSelfHealingManager } from './src/sectionizer/utils/consolidated-self-healing.js';

console.log("🧪 Testing Section14_1 field handling fix...");

// Create a test instance
const manager = new ConsolidatedSelfHealingManager();

// Test the explicit section extraction for Section14_1 fields
const testFields = [
  "form1[0].Section14_1[0].#field[24]",
  "form1[0].Section14_1[0].#area[16].From_Datefield_Name_2[4]", 
  "form1[0].Section14_1[0].TextField11[0]",
  "form1[0].Section11[0].TextField11[0]", // Control - should work normally
];

console.log("\n📋 Testing explicit section extraction:");

testFields.forEach((fieldName, index) => {
  console.log(`\n${index + 1}. Testing: ${fieldName}`);
  
  try {
    // Access the protected method through reflection
    const result = manager.extractExplicitSectionFromName(fieldName);
    console.log(`   Result: Section ${result.section}, Confidence: ${result.confidence}`);
    console.log(`   Reason: ${result.reason}`);
    
    if (fieldName.includes("Section14_1")) {
      if (result.section === 0) {
        console.log(`   ✅ SUCCESS: Section14_1 field correctly deferred to pattern-based categorization`);
      } else {
        console.log(`   ❌ ISSUE: Section14_1 field was not deferred (section: ${result.section})`);
      }
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
});

console.log("\n🎯 Test completed!");
