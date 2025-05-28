#!/usr/bin/env node

import fs from 'fs';

console.log("🔍 Analyzing over-protection in Sections 14 and 16...");

try {
  // Read the latest categorized fields
  const data = fs.readFileSync('output/test28/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);
  
  console.log(`\n📊 Total fields: ${fields.length}`);
  
  // Analyze Section 14 (should be 5, currently 40)
  const section14Fields = fields.filter(f => f.section === 14);
  console.log(`\n🔍 SECTION 14 ANALYSIS (Expected: 5, Current: ${section14Fields.length}, Excess: +${section14Fields.length - 5})`);
  
  const section14Protected = section14Fields.filter(f => f.isExplicitlyDetected === true);
  const section14Moveable = section14Fields.filter(f => f.isExplicitlyDetected !== true);
  
  console.log(`   Protected fields: ${section14Protected.length}`);
  console.log(`   Moveable fields: ${section14Moveable.length}`);
  
  console.log(`\n   Protected field examples:`);
  section14Protected.slice(0, 5).forEach((field, index) => {
    console.log(`   ${index + 1}. ${field.name}`);
    console.log(`      ID: ${field.id}, Confidence: ${field.confidence}`);
  });
  
  console.log(`\n   Moveable field examples:`);
  section14Moveable.slice(0, 5).forEach((field, index) => {
    console.log(`   ${index + 1}. ${field.name}`);
    console.log(`      ID: ${field.id}, Confidence: ${field.confidence}`);
  });
  
  // Analyze Section 16 (should be 119, currently 154)
  const section16Fields = fields.filter(f => f.section === 16);
  console.log(`\n🔍 SECTION 16 ANALYSIS (Expected: 119, Current: ${section16Fields.length}, Excess: +${section16Fields.length - 119})`);
  
  const section16Protected = section16Fields.filter(f => f.isExplicitlyDetected === true);
  const section16Moveable = section16Fields.filter(f => f.isExplicitlyDetected !== true);
  
  console.log(`   Protected fields: ${section16Protected.length}`);
  console.log(`   Moveable fields: ${section16Moveable.length}`);
  
  console.log(`\n   Protected field examples:`);
  section16Protected.slice(0, 5).forEach((field, index) => {
    console.log(`   ${index + 1}. ${field.name}`);
    console.log(`      ID: ${field.id}, Confidence: ${field.confidence}`);
  });
  
  console.log(`\n   Moveable field examples:`);
  section16Moveable.slice(0, 5).forEach((field, index) => {
    console.log(`   ${index + 1}. ${field.name}`);
    console.log(`      ID: ${field.id}, Confidence: ${field.confidence}`);
  });
  
  // Check if there are fields with section indicators that might be over-protected
  console.log(`\n🔍 CHECKING FOR OVER-PROTECTION PATTERNS:`);
  
  const section14WithSectionNames = section14Fields.filter(f => 
    f.name && (f.name.includes("Section14") || f.name.includes("section14"))
  );
  console.log(`   Section 14 fields with "Section14" in name: ${section14WithSectionNames.length}`);
  
  const section16WithSectionNames = section16Fields.filter(f => 
    f.name && (f.name.includes("Section16") || f.name.includes("section16"))
  );
  console.log(`   Section 16 fields with "Section16" in name: ${section16WithSectionNames.length}`);
  
  // Check for fields that might be incorrectly protected
  const potentiallyOverProtected = [...section14Fields, ...section16Fields].filter(f => 
    f.isExplicitlyDetected === true && 
    f.confidence < 0.99 // High confidence should be protected, but lower confidence might be over-protection
  );
  
  console.log(`\n⚠️  POTENTIALLY OVER-PROTECTED FIELDS (confidence < 0.99): ${potentiallyOverProtected.length}`);
  potentiallyOverProtected.slice(0, 10).forEach((field, index) => {
    console.log(`   ${index + 1}. ${field.name}`);
    console.log(`      Section: ${field.section}, Confidence: ${field.confidence}, ID: ${field.id}`);
  });
  
} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("\nAnalysis completed.");
