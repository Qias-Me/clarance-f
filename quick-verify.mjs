#!/usr/bin/env node

import fs from 'fs';

console.log("🔍 Quick verification of specific problematic fields...");

try {
  const data = fs.readFileSync('output/test36/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);
  
  console.log(`📊 Total fields: ${fields.length}`);
  
  // Check specific fields
  const testFields = [
    {
      name: "form1[0].Sections7-9[0].TextField11[14]",
      expectedSection: 7,
      description: "Work Email"
    },
    {
      name: "form1[0].Section14_1[0].#field[24]",
      expectedSection: 14,
      description: "Section14_1 Checkbox"
    },
    {
      name: "form1[0].Section14_1[0].#area[16].From_Datefield_Name_2[4]",
      expectedSection: 15,
      description: "Section14_1 Date Field (should be in Section 15)"
    }
  ];
  
  console.log(`\n🎯 VERIFICATION RESULTS:`);
  
  testFields.forEach((testField, index) => {
    const field = fields.find(f => f.name === testField.name);
    
    if (field) {
      const isCorrect = field.section === testField.expectedSection;
      const status = isCorrect ? '✅ FIXED' : '❌ STILL WRONG';
      
      console.log(`\n${index + 1}. ${testField.description}`);
      console.log(`   Field: ${testField.name}`);
      console.log(`   Expected Section: ${testField.expectedSection}`);
      console.log(`   Actual Section: ${field.section}`);
      console.log(`   Status: ${status}`);
      console.log(`   wasMovedByHealing: ${field.wasMovedByHealing}`);
      console.log(`   isExplicitlyDetected: ${field.isExplicitlyDetected}`);
    } else {
      console.log(`\n${index + 1}. ${testField.description}`);
      console.log(`   Field: ${testField.name}`);
      console.log(`   Status: ❌ NOT FOUND`);
    }
  });
  
  // Check section counts
  console.log(`\n📊 SECTION BALANCE CHECK:`);
  const sectionCounts = {};
  fields.forEach(field => {
    sectionCounts[field.section] = (sectionCounts[field.section] || 0) + 1;
  });
  
  const expectedCounts = { 7: 17, 14: 5, 15: 130, 18: 964, 20: 790 };
  
  [7, 14, 15, 18, 20].forEach(section => {
    const current = sectionCounts[section] || 0;
    const expected = expectedCounts[section];
    const status = current === expected ? '✅' : '❌';
    console.log(`   Section ${section}: ${current}/${expected} ${status}`);
  });
  
} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("\nVerification completed.");
