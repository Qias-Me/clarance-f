#!/usr/bin/env node

import fs from 'fs';

console.log("🔍 Analyzing Section14 field patterns...");

try {
  // Read the latest categorized fields
  console.log("Reading file: output/test31/categorized-fields.json");
  const data = fs.readFileSync('output/test31/categorized-fields.json', 'utf8');
  console.log("File read successfully, parsing JSON...");
  const fields = JSON.parse(data);
  console.log("JSON parsed successfully");

  console.log(`\n📊 Total fields: ${fields.length}`);

  // Find all fields with "Section14" in their names
  const section14NameFields = fields.filter(field =>
    field.name && field.name.includes("Section14")
  );

  console.log(`\n🔍 Found ${section14NameFields.length} fields with "Section14" in name`);

  // Group by actual section assignment
  const sectionGroups = {};
  section14NameFields.forEach(field => {
    const section = field.section || 0;
    if (!sectionGroups[section]) {
      sectionGroups[section] = [];
    }
    sectionGroups[section].push(field);
  });

  console.log(`\n📊 "Section14" fields distributed across sections:`);
  Object.entries(sectionGroups).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([section, fields]) => {
    console.log(`   Section ${section}: ${fields.length} fields`);

    // Show examples of field names
    console.log(`     Examples:`);
    fields.slice(0, 5).forEach((field, index) => {
      console.log(`       ${index + 1}. ${field.name}`);
      console.log(`          ID: ${field.id}, isExplicitlyDetected: ${field.isExplicitlyDetected}, wasMovedByHealing: ${field.wasMovedByHealing}`);
    });
    console.log('');
  });

  // Analyze specific patterns
  console.log(`\n🔍 PATTERN ANALYSIS:`);

  // Look for different Section14 patterns
  const patterns = {
    'Section14_1[0].TextField11': section14NameFields.filter(f => f.name.includes('Section14_1[0].TextField11')),
    'Section14_1[0].From_Datefield_Name_2': section14NameFields.filter(f => f.name.includes('Section14_1[0].From_Datefield_Name_2')),
    'Section14_1[0].#area': section14NameFields.filter(f => f.name.includes('Section14_1[0].#area')),
    'Section14_1[0].RadioButtonList': section14NameFields.filter(f => f.name.includes('Section14_1[0].RadioButtonList')),
    'Other Section14': section14NameFields.filter(f =>
      !f.name.includes('Section14_1[0].TextField11') &&
      !f.name.includes('Section14_1[0].From_Datefield_Name_2') &&
      !f.name.includes('Section14_1[0].#area') &&
      !f.name.includes('Section14_1[0].RadioButtonList')
    )
  };

  Object.entries(patterns).forEach(([pattern, fields]) => {
    if (fields.length > 0) {
      console.log(`\n   Pattern "${pattern}": ${fields.length} fields`);

      // Show section distribution for this pattern
      const patternSections = {};
      fields.forEach(field => {
        const section = field.section || 0;
        patternSections[section] = (patternSections[section] || 0) + 1;
      });

      console.log(`     Section distribution:`);
      Object.entries(patternSections).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([section, count]) => {
        console.log(`       Section ${section}: ${count} fields`);
      });

      // Show examples
      console.log(`     Examples:`);
      fields.slice(0, 3).forEach((field, index) => {
        console.log(`       ${index + 1}. ${field.name}`);
        console.log(`          Section: ${field.section}, ID: ${field.id}`);
      });
    }
  });

  // Check current section counts
  const section14Count = fields.filter(f => f.section === 14).length;
  const section15Count = fields.filter(f => f.section === 15).length;

  console.log(`\n📊 CURRENT SECTION COUNTS:`);
  console.log(`   Section 14: ${section14Count} (expected: 5)`);
  console.log(`   Section 15: ${section15Count} (expected: 130)`);

} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("\nAnalysis completed.");
