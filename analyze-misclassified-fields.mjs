#!/usr/bin/env node

import fs from 'fs';

console.log("🔍 Analyzing specific misclassified fields in test13...");

try {
  // Read the categorized fields from test13
  const data = fs.readFileSync('output/test13/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);
  
  console.log(`\n📊 Total fields: ${fields.length}`);
  
  // Define the specific problematic fields to analyze
  const problematicFields = [
    {
      name: "form1[0].Sections7-9[0].TextField11[14]",
      value: "sect7workEmail",
      expectedSection: 7,
      description: "Work Email (Should be Section 7)"
    },
    {
      name: "form1[0].Section14_1[0].#field[24]",
      value: null, // Estimate checkbox
      expectedSection: [14, 15],
      description: "Section14_1 Checkbox (Should be Section 14 or 15)"
    },
    {
      name: "form1[0].#subform[70].suffix[5]",
      value: "Visit family or friends",
      expectedSection: 18,
      description: "Subform Suffix (Should be Section 18)"
    }
  ];
  
  console.log(`\n🎯 ANALYZING SPECIFIC PROBLEMATIC FIELDS:`);
  
  problematicFields.forEach((problemField, index) => {
    console.log(`\n${index + 1}. ${problemField.description}`);
    console.log(`   Expected Pattern: ${problemField.name}`);
    console.log(`   Expected Value: ${problemField.value || 'N/A'}`);
    console.log(`   Expected Section: ${Array.isArray(problemField.expectedSection) ? problemField.expectedSection.join(' or ') : problemField.expectedSection}`);
    
    // Find the actual field in the data
    const actualField = fields.find(f => f.name === problemField.name);
    
    if (actualField) {
      console.log(`   ✅ FOUND IN DATA:`);
      console.log(`      Actual Section: ${actualField.section}`);
      console.log(`      Actual Value: ${actualField.value || 'N/A'}`);
      console.log(`      Confidence: ${actualField.confidence}`);
      console.log(`      wasMovedByHealing: ${actualField.wasMovedByHealing}`);
      console.log(`      isExplicitlyDetected: ${actualField.isExplicitlyDetected}`);
      console.log(`      Page: ${actualField.page}`);
      console.log(`      UniqueId: ${actualField.uniqueId}`);
      
      // Check if it's correctly categorized
      const isCorrect = Array.isArray(problemField.expectedSection) 
        ? problemField.expectedSection.includes(actualField.section)
        : actualField.section === problemField.expectedSection;
        
      if (isCorrect) {
        console.log(`      ✅ CORRECTLY CATEGORIZED`);
      } else {
        console.log(`      ❌ INCORRECTLY CATEGORIZED`);
        console.log(`      🔍 ISSUE ANALYSIS:`);
        
        if (actualField.wasMovedByHealing) {
          console.log(`         - Field was moved by self-healing algorithm`);
        } else {
          console.log(`         - Field was initially categorized incorrectly`);
        }
        
        if (!actualField.isExplicitlyDetected) {
          console.log(`         - Field was not protected from movement`);
        } else {
          console.log(`         - Field was protected but still ended up wrong`);
        }
      }
    } else {
      console.log(`   ❌ NOT FOUND IN DATA`);
      
      // Try to find similar fields
      const similarFields = fields.filter(f => 
        f.name.includes(problemField.name.split('[')[0]) ||
        (problemField.value && f.value && f.value.toString().includes(problemField.value))
      );
      
      if (similarFields.length > 0) {
        console.log(`   🔍 SIMILAR FIELDS FOUND: ${similarFields.length}`);
        similarFields.slice(0, 3).forEach((field, idx) => {
          console.log(`      ${idx + 1}. ${field.name} (Section: ${field.section}, Value: ${field.value})`);
        });
      }
    }
  });
  
  // Analyze Section 20 fields to see what's ending up there
  console.log(`\n📊 SECTION 20 ANALYSIS (Expected: 790 fields):`);
  const section20Fields = fields.filter(f => f.section === 20);
  console.log(`   Current count: ${section20Fields.length}`);
  
  // Group Section 20 fields by pattern
  const section20Patterns = {};
  section20Fields.forEach(field => {
    const pattern = field.name.split('[')[0]; // Get base pattern
    section20Patterns[pattern] = (section20Patterns[pattern] || 0) + 1;
  });
  
  console.log(`\n   Top patterns in Section 20:`);
  Object.entries(section20Patterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([pattern, count]) => {
      console.log(`      ${pattern}: ${count} fields`);
    });
  
  // Look for fields that might belong to other sections but ended up in Section 20
  console.log(`\n🔍 POTENTIAL MISCLASSIFICATIONS IN SECTION 20:`);
  
  const suspiciousPatterns = [
    { pattern: 'Sections7-9', expectedSection: 7 },
    { pattern: 'Section14_1', expectedSection: [14, 15] },
    { pattern: '#subform', expectedSection: 18 },
    { pattern: 'Section11', expectedSection: 11 },
    { pattern: 'section_12', expectedSection: 12 }
  ];
  
  suspiciousPatterns.forEach(({ pattern, expectedSection }) => {
    const suspiciousFields = section20Fields.filter(f => f.name.includes(pattern));
    if (suspiciousFields.length > 0) {
      console.log(`\n   ${pattern} fields in Section 20: ${suspiciousFields.length}`);
      console.log(`   Expected section: ${Array.isArray(expectedSection) ? expectedSection.join(' or ') : expectedSection}`);
      
      suspiciousFields.slice(0, 3).forEach((field, idx) => {
        console.log(`      ${idx + 1}. ${field.name}`);
        console.log(`         Value: ${field.value || 'N/A'}`);
        console.log(`         wasMovedByHealing: ${field.wasMovedByHealing}`);
        console.log(`         isExplicitlyDetected: ${field.isExplicitlyDetected}`);
      });
    }
  });
  
} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("\nAnalysis completed.");
