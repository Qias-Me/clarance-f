#!/usr/bin/env node

import fs from 'fs';

console.log("🔍 Analyzing SSN Fields in test43...");

try {
  // Read the categorized fields
  const data = fs.readFileSync('output/test43/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);
  
  console.log(`📊 Total fields: ${fields.length}`);
  
  // Find all SSN fields
  const ssnFields = fields.filter(field => 
    field.name && field.name.includes('SSN[')
  );
  
  console.log(`🔍 Found ${ssnFields.length} SSN fields:`);
  
  // Group by section
  const ssnBySection = {};
  ssnFields.forEach(field => {
    const section = field.section || 0;
    if (!ssnBySection[section]) {
      ssnBySection[section] = [];
    }
    ssnBySection[section].push(field);
  });
  
  // Display results
  Object.keys(ssnBySection)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(section => {
      const count = ssnBySection[section].length;
      console.log(`\n📍 Section ${section}: ${count} SSN fields`);
      
      // Show first few examples
      ssnBySection[section].slice(0, 3).forEach((field, index) => {
        console.log(`   ${index + 1}. ${field.name} (confidence: ${field.confidence || 'N/A'})`);
      });
      
      if (ssnBySection[section].length > 3) {
        console.log(`   ... and ${ssnBySection[section].length - 3} more`);
      }
    });
  
  // Check the specific field mentioned by user
  const specificField = ssnFields.find(field => 
    field.name === "form1[0].Section18_3[5].SSN[0]"
  );
  
  if (specificField) {
    console.log(`\n🎯 SPECIFIC FIELD ANALYSIS: form1[0].Section18_3[5].SSN[0]`);
    console.log(`   Section: ${specificField.section}`);
    console.log(`   Confidence: ${specificField.confidence}`);
    console.log(`   isExplicitlyDetected: ${specificField.isExplicitlyDetected}`);
    console.log(`   wasMovedByHealing: ${specificField.wasMovedByHealing}`);
  } else {
    console.log(`\n❌ SPECIFIC FIELD NOT FOUND: form1[0].Section18_3[5].SSN[0]`);
  }
  
  // Summary
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total SSN fields: ${ssnFields.length}`);
  console.log(`   SSN fields in Section 4: ${ssnBySection[4]?.length || 0}`);
  console.log(`   SSN fields in Section 18: ${ssnBySection[18]?.length || 0}`);
  console.log(`   SSN fields in other sections: ${ssnFields.length - (ssnBySection[4]?.length || 0) - (ssnBySection[18]?.length || 0)}`);
  
  if (ssnBySection[18] && ssnBySection[18].length > 0) {
    console.log(`\n⚠️  ISSUE: ${ssnBySection[18].length} SSN fields are still in Section 18 instead of Section 4!`);
    console.log(`   This explains why Section 18 has 965 fields instead of 947 (965 - 18 = 947)`);
  }
  
} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("\n🎯 Analysis completed!");
