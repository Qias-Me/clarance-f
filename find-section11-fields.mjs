#!/usr/bin/env node

import fs from 'fs';

console.log("🔍 Searching for Section11 fields in test28 output...");

try {
  // Read the categorized fields
  const data = fs.readFileSync('output/test28/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);
  
  console.log(`\n📊 Total fields: ${fields.length}`);
  
  // Find all fields with "Section11" in their name
  const section11Fields = fields.filter(field => 
    field.name && field.name.toLowerCase().includes("section11")
  );
  
  console.log(`\n🔍 Found ${section11Fields.length} fields with "Section11" in name:`);
  
  // Look specifically for our target fields
  const targetField1 = fields.find(f => f.id === "9782 0 R");
  const targetField2 = fields.find(f => f.id === "9858 0 R");
  
  console.log(`\n🎯 TARGET FIELD 1 (9782 0 R):`);
  if (targetField1) {
    console.log(`   ✅ FOUND: ${targetField1.name}`);
    console.log(`   Section: ${targetField1.section}`);
    console.log(`   isExplicitlyDetected: ${targetField1.isExplicitlyDetected}`);
    console.log(`   wasMovedByHealing: ${targetField1.wasMovedByHealing}`);
  } else {
    console.log(`   ❌ NOT FOUND`);
  }
  
  console.log(`\n🎯 TARGET FIELD 2 (9858 0 R):`);
  if (targetField2) {
    console.log(`   ✅ FOUND: ${targetField2.name}`);
    console.log(`   Section: ${targetField2.section}`);
    console.log(`   isExplicitlyDetected: ${targetField2.isExplicitlyDetected}`);
    console.log(`   wasMovedByHealing: ${targetField2.wasMovedByHealing}`);
  } else {
    console.log(`   ❌ NOT FOUND`);
  }
  
  // Look for fields with "Section11-2" pattern
  const section11DashFields = fields.filter(field => 
    field.name && field.name.includes("Section11-")
  );
  
  console.log(`\n🔍 Fields with "Section11-" pattern: ${section11DashFields.length}`);
  section11DashFields.slice(0, 5).forEach((field, index) => {
    console.log(`${index + 1}. ID: ${field.id}, Name: ${field.name}, Section: ${field.section}`);
  });
  
  // Look for fields with "TextField11" pattern
  const textField11Fields = fields.filter(field => 
    field.name && field.name.includes("TextField11")
  );
  
  console.log(`\n🔍 Fields with "TextField11" pattern: ${textField11Fields.length}`);
  textField11Fields.slice(0, 5).forEach((field, index) => {
    console.log(`${index + 1}. ID: ${field.id}, Name: ${field.name}, Section: ${field.section}`);
  });
  
  // Show section distribution of Section11 fields
  const sectionCounts = {};
  section11Fields.forEach(field => {
    sectionCounts[field.section] = (sectionCounts[field.section] || 0) + 1;
  });
  
  console.log(`\n📊 Section distribution of Section11 fields:`);
  Object.entries(sectionCounts).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([section, count]) => {
    console.log(`   Section ${section}: ${count} fields`);
  });
  
} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("\nSearch completed.");
