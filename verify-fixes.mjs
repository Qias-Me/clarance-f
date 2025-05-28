#!/usr/bin/env node

import fs from 'fs';

console.log("🔍 Verifying fixes for specific misclassified fields...");

try {
  // Read the categorized fields from test36 (after latest fixes)
  const data = fs.readFileSync('output/test36/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);

  console.log(`\n📊 Total fields: ${fields.length}`);

  // Define the specific problematic fields to verify
  const testFields = [
    {
      name: "form1[0].Sections7-9[0].TextField11[14]",
      value: "sect7workEmail",
      expectedSection: 7,
      description: "Work Email (Should be Section 7)"
    },
    {
      name: "form1[0].Section14_1[0].#field[24]",
      expectedSection: [14, 15],
      description: "Section14_1 Checkbox (Should be Section 14 or 15)"
    },
    {
      namePattern: "form1[0].#subform[70].suffix[5]",
      value: "Visit family or friends",
      expectedSection: 18,
      description: "Subform Suffix (Should be Section 18)"
    }
  ];

  console.log(`\n🎯 VERIFICATION RESULTS:`);

  let fixedCount = 0;
  let totalTests = testFields.length;

  testFields.forEach((testField, index) => {
    console.log(`\n${index + 1}. ${testField.description}`);

    // Find the actual field in the data
    let actualField;
    if (testField.name) {
      actualField = fields.find(f => f.name === testField.name);
    } else if (testField.namePattern) {
      actualField = fields.find(f => f.name === testField.namePattern);
    }

    if (actualField) {
      console.log(`   ✅ FOUND: ${actualField.name}`);
      console.log(`   Section: ${actualField.section}`);
      console.log(`   Value: ${actualField.value || 'N/A'}`);
      console.log(`   wasMovedByHealing: ${actualField.wasMovedByHealing}`);
      console.log(`   isExplicitlyDetected: ${actualField.isExplicitlyDetected}`);

      // Check if it's correctly categorized
      const isCorrect = Array.isArray(testField.expectedSection)
        ? testField.expectedSection.includes(actualField.section)
        : actualField.section === testField.expectedSection;

      if (isCorrect) {
        console.log(`   ✅ FIXED! Correctly categorized in Section ${actualField.section}`);
        fixedCount++;
      } else {
        console.log(`   ❌ STILL INCORRECT - Expected: ${Array.isArray(testField.expectedSection) ? testField.expectedSection.join(' or ') : testField.expectedSection}, Got: ${actualField.section}`);
      }
    } else {
      console.log(`   ❌ NOT FOUND`);

      // Try to find similar fields
      const searchTerm = testField.name || testField.namePattern;
      const baseName = searchTerm.split('[')[0];
      const similarFields = fields.filter(f => f.name.includes(baseName));

      if (similarFields.length > 0) {
        console.log(`   🔍 Similar fields found: ${similarFields.length}`);
        similarFields.slice(0, 3).forEach((field, idx) => {
          console.log(`      ${idx + 1}. ${field.name} (Section: ${field.section})`);
        });
      }
    }
  });

  console.log(`\n📊 SUMMARY:`);
  console.log(`   Fixed: ${fixedCount}/${totalTests} (${Math.round(fixedCount/totalTests*100)}%)`);

  // Check overall section balance
  console.log(`\n📊 SECTION BALANCE CHECK:`);
  const sectionCounts = {};
  fields.forEach(field => {
    sectionCounts[field.section] = (sectionCounts[field.section] || 0) + 1;
  });

  const expectedCounts = {
    7: 17, 14: 5, 15: 130, 18: 964, 20: 790
  };

  [7, 14, 15, 18, 20].forEach(section => {
    const current = sectionCounts[section] || 0;
    const expected = expectedCounts[section];
    const diff = current - expected;
    const status = diff === 0 ? '✅' : (diff > 0 ? '⚠️ +' : '❌ ');
    console.log(`   Section ${section}: ${current}/${expected} ${status}${Math.abs(diff)}`);
  });

  // Check for fields that might still be misclassified in Section 20
  console.log(`\n🔍 SECTION 20 ANALYSIS:`);
  const section20Fields = fields.filter(f => f.section === 20);
  console.log(`   Total Section 20 fields: ${section20Fields.length}`);

  const suspiciousInSection20 = section20Fields.filter(f =>
    f.name.includes('Sections7-9') ||
    f.name.includes('Section14_1') ||
    f.name.includes('#subform')
  );

  console.log(`   Suspicious fields in Section 20: ${suspiciousInSection20.length}`);
  if (suspiciousInSection20.length > 0) {
    console.log(`   Examples:`);
    suspiciousInSection20.slice(0, 5).forEach((field, idx) => {
      console.log(`      ${idx + 1}. ${field.name} (${field.value || 'no value'})`);
    });
  }

} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("\nVerification completed.");
