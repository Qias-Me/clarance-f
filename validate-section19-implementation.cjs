/**
 * Section 19 Implementation Validation Script
 * 
 * This script validates that the Section 19 context implementation properly
 * maps all 277 fields from the reference data to ensure complete PDF coverage.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 SECTION 19 IMPLEMENTATION VALIDATION');
console.log('=====================================');

// Load reference data
const referenceDataPath = 'api/sections-references/section-19.json';
let referenceData;

try {
  referenceData = JSON.parse(fs.readFileSync(referenceDataPath, 'utf8'));
  console.log(`✅ Loaded reference data: ${referenceData.fields.length} total fields`);
} catch (error) {
  console.error(`❌ Failed to load reference data from ${referenceDataPath}:`, error.message);
  process.exit(1);
}

// Extract unique field names from reference data
const referenceFieldNames = [...new Set(referenceData.fields.map(f => f.name))];
console.log(`📊 Unique reference fields: ${referenceFieldNames.length}`);

// Load field mapping
const fieldMappingPath = 'app/state/contexts/sections2.0/section19-field-mapping.ts';
let fieldMappingContent;

try {
  fieldMappingContent = fs.readFileSync(fieldMappingPath, 'utf8');
  console.log(`✅ Loaded field mapping file`);
} catch (error) {
  console.error(`❌ Failed to load field mapping from ${fieldMappingPath}:`, error.message);
  process.exit(1);
}

// Extract mapped field names from the mapping file
// Handle both literal strings and template strings
const mappedFieldNames = [];

// Look for literal field paths
const literalFieldRegex = /'(form1\[0\]\.Section19_\d+\[0\]\..*?)'/g;
let match;

while ((match = literalFieldRegex.exec(fieldMappingContent)) !== null) {
  mappedFieldNames.push(match[1]);
}

// Look for template string patterns and expand them for subsections 1-4
const templateFieldRegex = /`(form1\[0\]\.Section19_\$\{subsectionNumber\}\[0\]\..*?)`/g;
while ((match = templateFieldRegex.exec(fieldMappingContent)) !== null) {
  const template = match[1];
  // Expand template for subsections 1-4
  for (let i = 1; i <= 4; i++) {
    const expandedField = template.replace('${subsectionNumber}', i.toString());
    mappedFieldNames.push(expandedField);
  }
}

console.log(`📊 Mapped fields in implementation: ${mappedFieldNames.length}`);

// Find missing fields
const missingFields = referenceFieldNames.filter(refField => !mappedFieldNames.includes(refField));
const extraFields = mappedFieldNames.filter(mappedField => !referenceFieldNames.includes(mappedField));

console.log('\n🔍 VALIDATION RESULTS');
console.log('====================');

console.log(`📊 Reference Fields: ${referenceFieldNames.length}`);
console.log(`📊 Mapped Fields: ${mappedFieldNames.length}`);
console.log(`📊 Missing Fields: ${missingFields.length}`);
console.log(`📊 Extra Fields: ${extraFields.length}`);

const isValid = missingFields.length === 0 && extraFields.length === 0;
console.log(`📊 Validation Status: ${isValid ? '✅ PASSED' : '❌ FAILED'}`);

if (missingFields.length > 0) {
  console.log('\n❌ MISSING FIELDS (not mapped in implementation):');
  missingFields.slice(0, 20).forEach((field, index) => {
    console.log(`  ${index + 1}. ${field}`);
  });
  if (missingFields.length > 20) {
    console.log(`  ... and ${missingFields.length - 20} more missing fields`);
  }
}

if (extraFields.length > 0) {
  console.log('\n⚠️ EXTRA FIELDS (mapped but not in reference):');
  extraFields.slice(0, 10).forEach((field, index) => {
    console.log(`  ${index + 1}. ${field}`);
  });
  if (extraFields.length > 10) {
    console.log(`  ... and ${extraFields.length - 10} more extra fields`);
  }
}

// Analyze field types in reference data
console.log('\n📊 REFERENCE DATA FIELD TYPE ANALYSIS');
console.log('====================================');

const fieldTypes = {};
referenceData.fields.forEach(field => {
  if (!fieldTypes[field.type]) fieldTypes[field.type] = 0;
  fieldTypes[field.type]++;
});

Object.keys(fieldTypes).sort().forEach(type => {
  console.log(`${type}: ${fieldTypes[type]} fields`);
});

// Analyze field patterns
console.log('\n📊 FIELD PATTERN ANALYSIS');
console.log('=========================');

const patterns = {};
referenceFieldNames.forEach(name => {
  const match = name.match(/Section19_1\[0\]\.(.+)/);
  if (match) {
    const pattern = match[1];
    const basePattern = pattern.replace(/\[\d+\]/g, '[N]');
    if (!patterns[basePattern]) patterns[basePattern] = [];
    patterns[basePattern].push(pattern);
  }
});

console.log('Top field patterns:');
Object.keys(patterns)
  .sort((a, b) => patterns[b].length - patterns[a].length)
  .slice(0, 10)
  .forEach(pattern => {
    console.log(`  ${pattern}: ${patterns[pattern].length} variations`);
  });

// Generate recommendations
console.log('\n💡 RECOMMENDATIONS');
console.log('==================');

if (missingFields.length > 0) {
  console.log(`1. Add ${missingFields.length} missing fields to the field mapping`);
  console.log('2. Update the createDefaultForeignContactEntry function to use all mapped fields');
  console.log('3. Ensure all field categories are represented in the context structure');
}

if (extraFields.length > 0) {
  console.log(`4. Review ${extraFields.length} extra fields - they may be duplicates or incorrect`);
}

console.log('5. Run comprehensive testing with Playwright to verify PDF generation');
console.log('6. Validate that all field types (text, checkbox, dropdown, radio) are properly handled');

console.log('\n🎯 NEXT STEPS');
console.log('=============');
console.log('1. Fix missing field mappings in section19-field-mapping.ts');
console.log('2. Update context implementation to use all mapped fields');
console.log('3. Test PDF generation with all fields populated');
console.log('4. Verify field validation and error handling');

// Exit with appropriate code
process.exit(isValid ? 0 : 1);
