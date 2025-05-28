#!/usr/bin/env node

import fs from 'fs';

console.log("🔍 Checking for unclassified fields...");

try {
  // Read the latest categorized fields
  const data = fs.readFileSync('output/test45/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);
  
  console.log(`📊 Total fields: ${fields.length}`);
  
  // Count fields by section
  const sectionCounts = {};
  fields.forEach(field => {
    const section = field.section || 0;
    sectionCounts[section] = (sectionCounts[section] || 0) + 1;
  });
  
  // Show section distribution
  console.log("\n📊 Section Distribution:");
  Object.keys(sectionCounts)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(section => {
      console.log(`   Section ${section}: ${sectionCounts[section]} fields`);
    });
  
  // Find unclassified fields (section 0)
  const unknownFields = fields.filter(field => field.section === 0);
  
  console.log(`\n🔍 Unclassified fields (section 0): ${unknownFields.length}`);
  
  if (unknownFields.length > 0) {
    console.log("\n📋 Examples of unclassified fields:");
    unknownFields.slice(0, 10).forEach((field, index) => {
      console.log(`   ${index + 1}. ${field.name}`);
      if (field.value) console.log(`      Value: "${field.value}"`);
      if (field.page) console.log(`      Page: ${field.page}`);
    });
    
    // Write to unknown.json
    const unknownData = {
      summary: {
        totalFields: fields.length,
        unknownFields: unknownFields.length,
        percentage: ((unknownFields.length / fields.length) * 100).toFixed(2),
        extractedAt: new Date().toISOString()
      },
      fields: unknownFields
    };
    
    fs.writeFileSync('unknown.json', JSON.stringify(unknownData, null, 2));
    console.log(`\n💾 Written ${unknownFields.length} unclassified fields to unknown.json`);
    
    // Also create simple list
    const simpleList = unknownFields.map(field => field.name).sort();
    fs.writeFileSync('unknown-simple.txt', simpleList.join('\n'));
    console.log(`💾 Written simple list to unknown-simple.txt`);
  } else {
    console.log("✅ All fields are classified!");
    
    // Still create empty files for consistency
    fs.writeFileSync('unknown.json', JSON.stringify({
      summary: {
        totalFields: fields.length,
        unknownFields: 0,
        percentage: "0.00",
        extractedAt: new Date().toISOString()
      },
      fields: []
    }, null, 2));
    
    fs.writeFileSync('unknown-simple.txt', '# No unclassified fields found\n');
    console.log("💾 Created empty unknown.json and unknown-simple.txt files");
  }
  
} catch (error) {
  console.error("❌ Error:", error.message);
  
  // Try to find available test directories
  console.log("\n🔍 Available test directories:");
  try {
    const dirs = fs.readdirSync('output').filter(item => 
      fs.statSync(`output/${item}`).isDirectory() && 
      fs.existsSync(`output/${item}/categorized-fields.json`)
    );
    
    dirs.forEach(dir => {
      console.log(`   ✅ output/${dir}/categorized-fields.json`);
    });
  } catch (e) {
    console.log("   No output directory found");
  }
}

console.log("\n🎯 Check completed!");
