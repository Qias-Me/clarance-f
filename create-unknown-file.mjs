#!/usr/bin/env node

import fs from 'fs';

console.log("🔍 Creating unknown fields analysis from test45 results...");

try {
  // Read the categorized fields from test45
  const data = fs.readFileSync('output/test45/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);
  
  console.log(`📊 Total fields analyzed: ${fields.length}`);
  
  // Count fields by section
  const sectionCounts = {};
  fields.forEach(field => {
    const section = field.section || 0;
    sectionCounts[section] = (sectionCounts[section] || 0) + 1;
  });
  
  // Find unclassified fields (section 0)
  const unknownFields = fields.filter(field => 
    field.section === 0 || field.section === null || field.section === undefined
  );
  
  console.log(`🔍 Unclassified fields (section 0): ${unknownFields.length}`);
  
  // Also identify potentially misclassified fields that might need attention
  const potentiallyMisclassified = [];
  
  // Check for fields that might be in wrong sections based on patterns
  fields.forEach(field => {
    const fieldName = field.name || "";
    const section = field.section;
    
    // Check for obvious mismatches
    if (fieldName.includes('Section20') && section !== 20) {
      potentiallyMisclassified.push({
        ...field,
        issue: `Field name suggests Section 20 but assigned to Section ${section}`
      });
    }
    
    if (fieldName.includes('SSN') && section !== 4) {
      potentiallyMisclassified.push({
        ...field,
        issue: `SSN field assigned to Section ${section} instead of Section 4`
      });
    }
    
    // Check for #subform fields that might be incorrectly assigned
    if (fieldName.includes('#subform') && field.wasMovedByHealing && !field.isExplicitlyDetected) {
      potentiallyMisclassified.push({
        ...field,
        issue: `#subform field moved by healing without explicit detection (Section ${section})`
      });
    }
  });
  
  // Create comprehensive analysis
  const analysis = {
    summary: {
      totalFields: fields.length,
      unknownFields: unknownFields.length,
      unknownPercentage: ((unknownFields.length / fields.length) * 100).toFixed(2),
      potentiallyMisclassified: potentiallyMisclassified.length,
      misclassifiedPercentage: ((potentiallyMisclassified.length / fields.length) * 100).toFixed(2),
      extractedAt: new Date().toISOString(),
      sourceFile: 'output/test45/categorized-fields.json'
    },
    sectionDistribution: sectionCounts,
    unknownFields: unknownFields,
    potentiallyMisclassified: potentiallyMisclassified.slice(0, 100), // Limit to first 100
    analysis: {
      notes: [
        "Unknown fields are those with section = 0, null, or undefined",
        "Potentially misclassified fields are identified based on naming patterns",
        "SSN fields should be in Section 4",
        "Section20 named fields should be in Section 20",
        "#subform fields moved by healing without explicit detection may need review"
      ]
    }
  };
  
  // Write detailed analysis to unknown.json
  fs.writeFileSync('unknown.json', JSON.stringify(analysis, null, 2));
  console.log(`💾 Written analysis to unknown.json`);
  
  // Create simple text file with unknown field names
  if (unknownFields.length > 0) {
    const simpleList = unknownFields.map(field => field.name).sort();
    fs.writeFileSync('unknown-simple.txt', simpleList.join('\n'));
    console.log(`💾 Written ${unknownFields.length} unknown field names to unknown-simple.txt`);
  } else {
    fs.writeFileSync('unknown-simple.txt', '# No unclassified fields found in test45 results\n# All 6197 fields have been assigned to sections\n');
    console.log(`💾 Created empty unknown-simple.txt (no unclassified fields)`);
  }
  
  // Create potentially misclassified fields file
  if (potentiallyMisclassified.length > 0) {
    const misclassifiedList = potentiallyMisclassified.map(field => 
      `${field.name} - ${field.issue}`
    );
    fs.writeFileSync('potentially-misclassified.txt', misclassifiedList.join('\n'));
    console.log(`💾 Written ${potentiallyMisclassified.length} potentially misclassified fields to potentially-misclassified.txt`);
  }
  
  // Display summary
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total fields: ${fields.length}`);
  console.log(`   Unclassified (section 0): ${unknownFields.length} (${analysis.summary.unknownPercentage}%)`);
  console.log(`   Potentially misclassified: ${potentiallyMisclassified.length} (${analysis.summary.misclassifiedPercentage}%)`);
  
  console.log(`\n📋 Section Distribution:`);
  Object.keys(sectionCounts)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(section => {
      const count = sectionCounts[section];
      const percentage = ((count / fields.length) * 100).toFixed(1);
      console.log(`   Section ${section}: ${count} fields (${percentage}%)`);
    });
  
  if (unknownFields.length > 0) {
    console.log(`\n📋 Examples of unclassified fields:`);
    unknownFields.slice(0, 5).forEach((field, index) => {
      console.log(`   ${index + 1}. ${field.name} (page: ${field.page || 'unknown'})`);
    });
  }
  
  if (potentiallyMisclassified.length > 0) {
    console.log(`\n⚠️  Examples of potentially misclassified fields:`);
    potentiallyMisclassified.slice(0, 5).forEach((field, index) => {
      console.log(`   ${index + 1}. ${field.name} - ${field.issue}`);
    });
  }
  
} catch (error) {
  console.error("❌ Error:", error.message);
  
  // Create empty files in case of error
  const errorAnalysis = {
    summary: {
      totalFields: 0,
      unknownFields: 0,
      unknownPercentage: "0.00",
      error: error.message,
      extractedAt: new Date().toISOString()
    },
    unknownFields: [],
    error: error.message
  };
  
  fs.writeFileSync('unknown.json', JSON.stringify(errorAnalysis, null, 2));
  fs.writeFileSync('unknown-simple.txt', `# Error occurred: ${error.message}\n`);
  
  console.log("💾 Created error files: unknown.json and unknown-simple.txt");
}

console.log("\n🎯 Analysis completed!");
