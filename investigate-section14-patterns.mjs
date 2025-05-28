#!/usr/bin/env node

import fs from 'fs';

console.log("🔍 Investigating Section14 field naming patterns...");

try {
  // Read the categorized fields from test28
  const data = fs.readFileSync('output/test28/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);
  
  console.log(`\n📊 Total fields: ${fields.length}`);
  
  // Find all fields with "Section14" in their names
  const section14NameFields = fields.filter(field => 
    field.name && field.name.toLowerCase().includes("section14")
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
  });
  
  // Analyze the field names to find patterns
  console.log(`\n🔍 DETAILED ANALYSIS OF "Section14" FIELD PATTERNS:`);
  
  // Look for different naming patterns
  const patterns = {
    'Section14_1': section14NameFields.filter(f => f.name.includes('Section14_1')),
    'Section14-': section14NameFields.filter(f => f.name.includes('Section14-')),
    'Section14[': section14NameFields.filter(f => f.name.includes('Section14[')),
    'Other': section14NameFields.filter(f => 
      !f.name.includes('Section14_1') && 
      !f.name.includes('Section14-') && 
      !f.name.includes('Section14[')
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
  
  // Check if there are similar patterns for Section15
  console.log(`\n🔍 COMPARING WITH SECTION15 PATTERNS:`);
  
  const section15NameFields = fields.filter(field => 
    field.name && field.name.toLowerCase().includes("section15")
  );
  
  console.log(`   Fields with "Section15" in name: ${section15NameFields.length}`);
  
  if (section15NameFields.length > 0) {
    const section15Groups = {};
    section15NameFields.forEach(field => {
      const section = field.section || 0;
      section15Groups[section] = (section15Groups[section] || 0) + 1;
    });
    
    console.log(`   Section15 fields distributed across sections:`);
    Object.entries(section15Groups).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([section, count]) => {
      console.log(`     Section ${section}: ${count} fields`);
    });
    
    console.log(`   Section15 field examples:`);
    section15NameFields.slice(0, 3).forEach((field, index) => {
      console.log(`     ${index + 1}. ${field.name}`);
      console.log(`        Section: ${field.section}, ID: ${field.id}`);
    });
  }
  
  // Check current section counts
  const section14Count = fields.filter(f => f.section === 14).length;
  const section15Count = fields.filter(f => f.section === 15).length;
  
  console.log(`\n📊 CURRENT SECTION COUNTS:`);
  console.log(`   Section 14: ${section14Count} (expected: 5, excess: +${section14Count - 5})`);
  console.log(`   Section 15: ${section15Count} (expected: 130, shortage: ${130 - section15Count})`);
  
  // Check if moving some Section14 fields to Section15 would help balance
  const excessSection14 = section14Count - 5;
  const shortageSection15 = 130 - section15Count;
  
  console.log(`\n💡 BALANCING ANALYSIS:`);
  console.log(`   Section 14 excess: ${excessSection14}`);
  console.log(`   Section 15 shortage: ${shortageSection15}`);
  
  if (excessSection14 > 0 && shortageSection15 > 0) {
    const canTransfer = Math.min(excessSection14, shortageSection15);
    console.log(`   ✅ Could transfer ${canTransfer} fields from Section 14 to Section 15 to improve balance`);
  }
  
} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("\nInvestigation completed.");
