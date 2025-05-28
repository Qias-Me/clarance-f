#!/usr/bin/env node

import fs from 'fs';

console.log("🔍 Analyzing field details from test24 output...");

try {
  // Read the categorized fields
  const data = fs.readFileSync('output/test24/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);
  
  // Find our target field
  const targetField = fields.find(field => field.id === "9782 0 R");
  
  if (targetField) {
    console.log("\n✅ Found target field!");
    console.log("📋 COMPLETE FIELD DETAILS:");
    console.log(JSON.stringify(targetField, null, 2));
    
    // Check for other Section11 fields
    console.log("\n🔍 Looking for other Section11 fields...");
    const section11Fields = fields.filter(field => 
      field.name && field.name.includes("Section11")
    );
    
    console.log(`\n📊 Found ${section11Fields.length} fields with "Section11" in name:`);
    
    section11Fields.slice(0, 10).forEach((field, index) => {
      console.log(`${index + 1}. ID: ${field.id}`);
      console.log(`   Name: ${field.name}`);
      console.log(`   Section: ${field.section}`);
      console.log(`   isExplicitlyDetected: ${field.isExplicitlyDetected}`);
      console.log(`   wasMovedByHealing: ${field.wasMovedByHealing}`);
      console.log(`   Confidence: ${field.confidence}`);
      console.log("");
    });
    
    if (section11Fields.length > 10) {
      console.log(`... and ${section11Fields.length - 10} more`);
    }
    
    // Check section distribution
    const sectionCounts = {};
    section11Fields.forEach(field => {
      sectionCounts[field.section] = (sectionCounts[field.section] || 0) + 1;
    });
    
    console.log("\n📊 Section distribution of Section11 fields:");
    Object.entries(sectionCounts).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([section, count]) => {
      console.log(`   Section ${section}: ${count} fields`);
    });
    
  } else {
    console.log("\n❌ Target field not found!");
  }
  
} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("\nAnalysis completed.");
