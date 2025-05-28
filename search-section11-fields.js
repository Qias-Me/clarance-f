#!/usr/bin/env node

import fs from 'fs';

console.log("Searching for Section11 fields with From_Datefield_Name_2...");

try {
  // Read the JSON file
  const data = fs.readFileSync('output/test13/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);

  // Find fields with Section11 and From_Datefield_Name_2 in their names
  const section11Fields = fields.filter(field =>
    field.name &&
    field.name.includes("Section11") &&
    field.name.includes("From_Datefield_Name_2")
  );

  console.log(`\nFound ${section11Fields.length} Section11 From_Datefield_Name_2 fields:`);

  section11Fields.forEach((field, index) => {
    console.log(`\n${index + 1}. Field ID: ${field.id}`);
    console.log(`   Name: ${field.name}`);
    console.log(`   Section: ${field.section}`);
    console.log(`   Confidence: ${field.confidence}`);
    console.log(`   Page: ${field.page}`);
    console.log(`   isExplicitlyDetected: ${field.isExplicitlyDetected}`);
    console.log(`   wasMovedByHealing: ${field.wasMovedByHealing}`);

    // Check if this is our target field
    if (field.id === "9782 0 R" || field.name.includes("[2]")) {
      console.log(`   🎯 TARGET FIELD FOUND!`);

      if (field.section === 11) {
        console.log(`   ✅ CORRECTLY categorized as Section 11`);
      } else {
        console.log(`   ❌ INCORRECTLY categorized as Section ${field.section}`);
      }

      if (field.isExplicitlyDetected === true) {
        console.log(`   ✅ Explicit detection: WORKING`);
      } else {
        console.log(`   ❌ Explicit detection: NOT WORKING`);
      }

      if (field.wasMovedByHealing === true) {
        console.log(`   ⚠️  Self-healing: Field was moved by healing process`);
      } else {
        console.log(`   ✅ Self-healing: Field was not moved`);
      }
    }
  });

  // Also search for the specific field ID
  console.log(`\n🔍 Searching specifically for field "9782 0 R"...`);
  const targetField = fields.find(field => field.id === "9782 0 R");

  if (targetField) {
    console.log(`\n🎯 FOUND TARGET FIELD "9782 0 R":`);
    console.log(`   Name: ${targetField.name}`);
    console.log(`   Section: ${targetField.section}`);
    console.log(`   Confidence: ${targetField.confidence}`);
    console.log(`   Page: ${targetField.page}`);
    console.log(`   isExplicitlyDetected: ${targetField.isExplicitlyDetected}`);
    console.log(`   wasMovedByHealing: ${targetField.wasMovedByHealing}`);

    if (targetField.section === 11) {
      console.log(`\n🎉 SUCCESS: Field is correctly categorized as Section 11!`);
    } else {
      console.log(`\n❌ ISSUE: Field is incorrectly categorized as Section ${targetField.section}!`);
    }
  } else {
    console.log(`\n❌ Field "9782 0 R" not found!`);
  }

} catch (error) {
  console.error("Error reading or parsing file:", error.message);
}

console.log("\nSearch completed.");
