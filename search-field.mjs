#!/usr/bin/env node

import fs from 'fs';

console.log("🔍 Searching for specific fields...");

try {
  const data = fs.readFileSync('output/test36/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);
  
  console.log(`📊 Total fields: ${fields.length}`);
  
  // Search for specific fields
  const searchFields = [
    "form1[0].Sections7-9[0].TextField11[14]",
    "form1[0].Section14_1[0].#field[24]",
    "form1[0].Section14_1[0].#area[16].From_Datefield_Name_2[4]",
    "form1[0].#subform[70].suffix[5]"
  ];
  
  console.log(`\n🔍 SEARCHING FOR SPECIFIC FIELDS:`);
  
  searchFields.forEach((searchName, index) => {
    console.log(`\n${index + 1}. Searching for: ${searchName}`);
    
    const field = fields.find(f => f.name === searchName);
    
    if (field) {
      console.log(`   ✅ FOUND:`);
      console.log(`      Section: ${field.section}`);
      console.log(`      Value: ${field.value || 'N/A'}`);
      console.log(`      wasMovedByHealing: ${field.wasMovedByHealing}`);
      console.log(`      isExplicitlyDetected: ${field.isExplicitlyDetected}`);
      console.log(`      Confidence: ${field.confidence}`);
    } else {
      console.log(`   ❌ NOT FOUND`);
    }
  });
  
  // Count Section14_1 fields by section
  console.log(`\n📊 SECTION14_1 FIELD DISTRIBUTION:`);
  const section14Fields = fields.filter(f => f.name.includes('Section14_1'));
  console.log(`   Total Section14_1 fields: ${section14Fields.length}`);
  
  const sectionCounts = {};
  section14Fields.forEach(field => {
    sectionCounts[field.section] = (sectionCounts[field.section] || 0) + 1;
  });
  
  Object.entries(sectionCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([section, count]) => {
      console.log(`   Section ${section}: ${count} fields`);
    });
  
  // Show some examples of Section14_1 fields in each section
  console.log(`\n📋 EXAMPLES OF SECTION14_1 FIELDS:`);
  [14, 15, 1, 2, 3].forEach(section => {
    const sectionFields = section14Fields.filter(f => f.section === section);
    if (sectionFields.length > 0) {
      console.log(`\n   Section ${section} (${sectionFields.length} fields):`);
      sectionFields.slice(0, 3).forEach((field, idx) => {
        console.log(`      ${idx + 1}. ${field.name} (${field.wasMovedByHealing ? 'moved by healing' : 'original'})`);
      });
    }
  });
  
} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("\nSearch completed.");
