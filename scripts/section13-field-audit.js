#!/usr/bin/env node

/**
 * Section 13 Field Audit Script
 * Comprehensive analysis of all 1,086 fields in section-13.json
 * Maps fields to implementation and creates coverage checklist
 */

const fs = require('fs');
const path = require('path');

// Load Section 13 JSON data
const section13Path = path.join(__dirname, '../api/sections-references/section-13.json');
const section13Data = JSON.parse(fs.readFileSync(section13Path, 'utf8'));

console.log('🔍 SECTION 13 REFERENCE DATA DEEP AUDIT');
console.log('=' .repeat(50));

// Basic metadata analysis
console.log('\n📊 METADATA ANALYSIS:');
console.log(`- Section ID: ${section13Data.metadata.sectionId}`);
console.log(`- Total Fields: ${section13Data.metadata.totalFields}`);
console.log(`- Page Range: ${section13Data.metadata.pageRange.start}-${section13Data.metadata.pageRange.end}`);
console.log(`- Subsection Count: ${section13Data.metadata.subsectionCount}`);
console.log(`- Actual Fields in Array: ${section13Data.fields.length}`);

// Field pattern analysis
console.log('\n🔍 FIELD PATTERN ANALYSIS:');
const fieldPatterns = {};
const subsectionPatterns = {};
const pageDistribution = {};

section13Data.fields.forEach(field => {
  // Extract pattern from field name
  const fieldName = field.name || field.value || 'unknown';
  const pattern = fieldName.replace(/\d+/g, '*').replace(/\[\d+\]/g, '[*]');
  
  if (!fieldPatterns[pattern]) {
    fieldPatterns[pattern] = [];
  }
  fieldPatterns[pattern].push(field);
  
  // Track subsection patterns
  if (field.section) {
    if (!subsectionPatterns[field.section]) {
      subsectionPatterns[field.section] = 0;
    }
    subsectionPatterns[field.section]++;
  }
  
  // Track page distribution
  if (field.page) {
    if (!pageDistribution[field.page]) {
      pageDistribution[field.page] = 0;
    }
    pageDistribution[field.page]++;
  }
});

// Display top field patterns
console.log('\n📋 TOP FIELD PATTERNS:');
const sortedPatterns = Object.entries(fieldPatterns)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 20);

sortedPatterns.forEach(([pattern, fields]) => {
  console.log(`  ${pattern}: ${fields.length} fields`);
});

// Display subsection distribution
console.log('\n📊 SUBSECTION DISTRIBUTION:');
Object.entries(subsectionPatterns)
  .sort((a, b) => b[1] - a[1])
  .forEach(([section, count]) => {
    console.log(`  ${section}: ${count} fields`);
  });

// Display page distribution
console.log('\n📄 PAGE DISTRIBUTION:');
Object.entries(pageDistribution)
  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
  .forEach(([page, count]) => {
    console.log(`  Page ${page}: ${count} fields`);
  });

// Employment subsection analysis
console.log('\n🏢 EMPLOYMENT SUBSECTION ANALYSIS:');
const employmentSections = {
  '13A.1': 'Military Employment',
  '13A.2': 'Non-Federal Employment', 
  '13A.3': 'Self-Employment',
  '13A.4': 'Unemployment',
  '13A.5': 'Employment Record Issues',
  '13A.6': 'Disciplinary Actions',
  '13B': 'Additional Employment Questions',
  '13C': 'Employment Verification'
};

Object.entries(employmentSections).forEach(([sectionId, description]) => {
  const sectionFields = section13Data.fields.filter(field => 
    field.section === sectionId || 
    (field.name && field.name.includes(sectionId.replace('.', '')))
  );
  console.log(`  ${sectionId} (${description}): ${sectionFields.length} fields`);
});

// Field type analysis
console.log('\n📝 FIELD TYPE ANALYSIS:');
const fieldTypes = {};
section13Data.fields.forEach(field => {
  const type = field.type || 'unknown';
  if (!fieldTypes[type]) {
    fieldTypes[type] = 0;
  }
  fieldTypes[type]++;
});

Object.entries(fieldTypes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`  ${type}: ${count} fields`);
  });

console.log('\n✅ AUDIT COMPLETE - Ready for field mapping analysis');
