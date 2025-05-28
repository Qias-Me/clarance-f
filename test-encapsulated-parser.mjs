#!/usr/bin/env node

// Test the EncapsulatedFieldParser directly

import { EncapsulatedFieldParser } from './src/sectionizer/utils/encapsulated-field-parser.js';

const fieldName = "form1[0].Section11[0].From_Datefield_Name_2[2]";

console.log("🔍 Testing EncapsulatedFieldParser with field:", fieldName);
console.log("=" .repeat(60));

try {
  const result = EncapsulatedFieldParser.parseFieldHierarchy(fieldName, true);
  
  console.log("\n📋 Result:");
  if (result) {
    console.log("✅ SUCCESS:", JSON.stringify(result, null, 2));
  } else {
    console.log("❌ FAILED: No result returned");
  }
  
} catch (error) {
  console.error("❌ ERROR:", error.message);
  console.error(error.stack);
}

console.log("\nTest completed.");
