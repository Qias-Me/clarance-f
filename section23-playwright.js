/**
 * Comprehensive Section 23 Field Analysis
 * Analyzes all 191 fields and identifies mapping issues
 */

import fs from 'fs';

// Load the sections-references JSON
const section23Json = JSON.parse(
  fs.readFileSync('./api/sections-references/section-23.json', 'utf8')
);

console.log('🔍 COMPREHENSIVE SECTION 23 FIELD ANALYSIS');
console.log('==========================================');
console.log(`Total fields: ${section23Json.fields.length}`);
console.log(`Expected: 191 fields\n`);

// Analyze field patterns by subsection
const subsectionAnalysis = {};
const fieldTypes = {};
const pageDistribution = {};

section23Json.fields.forEach(field => {
  const name = field.name;
  
  // Extract subsection pattern
  let subsection = 'unknown';
  if (name.includes('Section23_1[0]')) subsection = 'Section23_1';
  else if (name.includes('Section23_2[0]')) subsection = 'Section23_2';
  else if (name.includes('Section_23_3[0]')) subsection = 'Section_23_3';
  else if (name.includes('Section_23_4[0]')) subsection = 'Section_23_4';
  else if (name.includes('Section_23_5[0]')) subsection = 'Section_23_5';
  else if (name.includes('Section_23_6_1[0]')) subsection = 'Section_23_6_1';
  else if (name.includes('Section_23_6[0]')) subsection = 'Section_23_6';
  
  // Track subsections
  if (!subsectionAnalysis[subsection]) {
    subsectionAnalysis[subsection] = [];
  }
  subsectionAnalysis[subsection].push(field);
  
  // Track field types
  fieldTypes[field.type] = (fieldTypes[field.type] || 0) + 1;
  
  // Track page distribution
  pageDistribution[field.page] = (pageDistribution[field.page] || 0) + 1;
});

console.log('📊 SUBSECTION BREAKDOWN:');
console.log('========================');
Object.keys(subsectionAnalysis).forEach(subsection => {
  const fields = subsectionAnalysis[subsection];
  console.log(`\n${subsection}: ${fields.length} fields`);
  
  // Show field type breakdown for this subsection
  const typeBreakdown = {};
  fields.forEach(f => {
    typeBreakdown[f.type] = (typeBreakdown[f.type] || 0) + 1;
  });
  
  Object.keys(typeBreakdown).forEach(type => {
    console.log(`  - ${type}: ${typeBreakdown[type]} fields`);
  });
  
  // Show first few field examples
  console.log(`  Examples:`);
  fields.slice(0, 3).forEach(f => {
    console.log(`    • ${f.name} (${f.type})`);
  });
});

console.log('\n📋 FIELD TYPE SUMMARY:');
console.log('======================');
Object.keys(fieldTypes).forEach(type => {
  console.log(`${type}: ${fieldTypes[type]} fields`);
});

console.log('\n📄 PAGE DISTRIBUTION:');
console.log('=====================');
Object.keys(pageDistribution).sort((a, b) => parseInt(a) - parseInt(b)).forEach(page => {
  console.log(`Page ${page}: ${pageDistribution[page]} fields`);
});

console.log('\n🔍 CRITICAL FIELD ANALYSIS:');
console.log('===========================');

// Analyze key fields that should be mapped in context
const keyFields = {
  'Drug Use Questions': [
    'form1[0].Section23_1[0].RadioButtonList[0]',
    'form1[0].Section23_1[0].RadioButtonList[1]',
    'form1[0].Section23_1[0].#area[2].RadioButtonList[2]',
    'form1[0].Section23_1[0].#area[3].RadioButtonList[3]',
    'form1[0].Section23_1[0].RadioButtonList[4]',
    'form1[0].Section23_1[0].#area[6].RadioButtonList[5]',
    'form1[0].Section23_1[0].#area[7].RadioButtonList[6]'
  ],
  'Drug Activity Questions': [
    'form1[0].Section23_2[0].#area[1].RadioButtonList[0]',
    'form1[0].Section23_2[0].RadioButtonList[1]',
    'form1[0].Section23_2[0].RadioButtonList[2]',
    'form1[0].Section23_2[0].RadioButtonList[3]',
    'form1[0].Section23_2[0].#area[3].RadioButtonList[4]'
  ],
  'Treatment Questions': [
    'form1[0].Section_23_3[0].RadioButtonList[0]',
    'form1[0].Section_23_3[0].RadioButtonList[1]'
  ],
  'Foreign Drug Use': [
    'form1[0].Section_23_4[0].RadioButtonList[0]',
    'form1[0].Section_23_4[0].#area[1].RadioButtonList[1]',
    'form1[0].Section_23_4[0].RadioButtonList[2]'
  ]
};

Object.keys(keyFields).forEach(category => {
  console.log(`\n${category}:`);
  keyFields[category].forEach(fieldName => {
    const found = section23Json.fields.find(f => f.name === fieldName);
    if (found) {
      console.log(`  ✅ ${fieldName} - Found (ID: ${found.id})`);
    } else {
      console.log(`  ❌ ${fieldName} - NOT FOUND`);
    }
  });
});

console.log('\n🚨 MISSING FIELD MAPPINGS ANALYSIS:');
console.log('===================================');

// Check what percentage of fields are actually mapped in the current context
const currentlyMappedFields = [
  'form1[0].Section23_1[0].RadioButtonList[0]',
  'form1[0].Section23_1[0].RadioButtonList[1]',
  'form1[0].Section23_1[0].#area[2].RadioButtonList[2]',
  'form1[0].Section23_1[0].#area[3].RadioButtonList[3]',
  'form1[0].Section23_1[0].RadioButtonList[4]',
  'form1[0].Section23_1[0].#area[6].RadioButtonList[5]',
  'form1[0].Section23_1[0].#area[7].RadioButtonList[6]',
  'form1[0].Section23_1[0].TextField11[0]',
  'form1[0].Section23_2[0].#area[1].RadioButtonList[0]',
  'form1[0].Section23_2[0].RadioButtonList[1]',
  'form1[0].Section23_2[0].RadioButtonList[2]',
  'form1[0].Section23_2[0].RadioButtonList[3]',
  'form1[0].Section23_2[0].#area[3].RadioButtonList[4]',
  'form1[0].Section_23_3[0].RadioButtonList[0]',
  'form1[0].Section_23_3[0].RadioButtonList[1]',
  'form1[0].Section_23_5[0].#area[0].RadioButtonList[0]',
  'form1[0].Section_23_5[0].RadioButtonList[1]',
  'form1[0].Section_23_4[0].RadioButtonList[0]',
  'form1[0].Section_23_4[0].#area[1].RadioButtonList[1]',
  'form1[0].Section_23_4[0].RadioButtonList[2]'
];

const mappedCount = currentlyMappedFields.filter(fieldName => 
  section23Json.fields.find(f => f.name === fieldName)
).length;

console.log(`Currently mapped fields: ${mappedCount}/${currentlyMappedFields.length}`);
console.log(`Total available fields: ${section23Json.fields.length}`);
console.log(`Coverage: ${((mappedCount / section23Json.fields.length) * 100).toFixed(1)}%`);

console.log('\n💡 RECOMMENDATIONS:');
console.log('===================');
console.log('1. Only basic flag fields are currently mapped (~20 out of 191 fields)');
console.log('2. Missing mappings for:');
console.log('   - Date fields (From_Datefield_Name_2)');
console.log('   - Text description fields (TextField11)');
console.log('   - Checkbox fields (#field)');
console.log('   - Treatment provider information');
console.log('   - Address fields');
console.log('3. Need dynamic field generation for entries');
console.log('4. Consider using field patterns for systematic mapping');
