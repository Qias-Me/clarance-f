/**
 * Section 13 Field Mapping Verification Script
 * 
 * Verifies that all 1,920 fields from section-13.json are properly mapped
 * to the Section 13 interface and context implementation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load reference data
const referenceDataPath = path.join(__dirname, '../api/sections-references/section-13.json');
const referenceData = JSON.parse(fs.readFileSync(referenceDataPath, 'utf8'));

// Load interface mappings
const interfacePath = path.join(__dirname, '../api/interfaces/sections2.0/section13.ts');
const interfaceContent = fs.readFileSync(interfacePath, 'utf8');

console.log('🔍 SECTION 13 FIELD MAPPING VERIFICATION');
console.log('=' .repeat(60));

// Extract all field values from reference data
function extractFieldValues(obj, values = new Set()) {
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      obj.forEach(item => extractFieldValues(item, values));
    } else {
      Object.entries(obj).forEach(([key, value]) => {
        if (key === 'value' && typeof value === 'string') {
          values.add(value);
        } else {
          extractFieldValues(value, values);
        }
      });
    }
  }
  return values;
}

const allFieldValues = extractFieldValues(referenceData);
console.log(`📊 Total fields found in reference data: ${allFieldValues.size}`);

// Categorize fields by subsection
const fieldsBySubsection = {
  '13A.1': new Set(),
  '13A.2': new Set(),
  '13A.3': new Set(),
  '13A.4': new Set(),
  '13A.5': new Set(),
  '13A.6': new Set(),
  'other': new Set()
};

allFieldValues.forEach(field => {
  if (field.includes('sect13A.1')) {
    fieldsBySubsection['13A.1'].add(field);
  } else if (field.includes('sect13A.2')) {
    fieldsBySubsection['13A.2'].add(field);
  } else if (field.includes('sect13A.3')) {
    fieldsBySubsection['13A.3'].add(field);
  } else if (field.includes('sect13A.4')) {
    fieldsBySubsection['13A.4'].add(field);
  } else if (field.includes('sect13A.5')) {
    fieldsBySubsection['13A.5'].add(field);
  } else if (field.includes('sect13A.6')) {
    fieldsBySubsection['13A.6'].add(field);
  } else {
    fieldsBySubsection['other'].add(field);
  }
});

console.log('\n📋 FIELD DISTRIBUTION BY SUBSECTION:');
Object.entries(fieldsBySubsection).forEach(([subsection, fields]) => {
  console.log(`  ${subsection}: ${fields.size} fields`);
});

// Check interface mapping coverage
console.log('\n🔍 INTERFACE MAPPING ANALYSIS:');

// Extract field mappings from interface
const mappingMatches = interfaceContent.match(/SECTION13_FIELD_MAPPINGS[\s\S]*?} as const;/);
if (mappingMatches) {
  const mappingContent = mappingMatches[0];

  // Count mapped fields - look for all quoted field values
  const mappedFields = new Set();

  // Match sect13A.* fields
  const sectFieldMatches = mappingContent.match(/'sect13A\.[^']+'/g);
  if (sectFieldMatches) {
    sectFieldMatches.forEach(match => {
      mappedFields.add(match.replace(/'/g, ''));
    });
  }

  // Match other field patterns (13A*, ect*, etc.)
  const otherFieldMatches = mappingContent.match(/'[^']*13[^']*'/g);
  if (otherFieldMatches) {
    otherFieldMatches.forEach(match => {
      const field = match.replace(/'/g, '');
      if (!field.startsWith('sect13A')) {
        mappedFields.add(field);
      }
    });
  }

  // Match simple field names
  const simpleFieldMatches = mappingContent.match(/'[A-Za-z][^']*'/g);
  if (simpleFieldMatches) {
    simpleFieldMatches.forEach(match => {
      const field = match.replace(/'/g, '');
      if (!field.startsWith('sect13A') && !field.includes('13A') && field.length > 1) {
        mappedFields.add(field);
      }
    });
  }
  
  console.log(`📊 Fields mapped in interface: ${mappedFields.size}`);
  
  // Check coverage by subsection
  Object.entries(fieldsBySubsection).forEach(([subsection, referenceFields]) => {
    if (subsection !== 'other') {
      const mappedInSubsection = Array.from(mappedFields).filter(field => 
        field.includes(`sect13A.${subsection.split('.')[1]}`)
      );
      const coverage = referenceFields.size > 0 ? 
        (mappedInSubsection.length / referenceFields.size * 100).toFixed(1) : 0;
      
      console.log(`  ${subsection}: ${mappedInSubsection.length}/${referenceFields.size} (${coverage}%)`);
      
      // Show missing fields for each subsection
      if (mappedInSubsection.length < referenceFields.size) {
        const missing = Array.from(referenceFields).filter(field => !mappedFields.has(field));
        console.log(`    Missing: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ` ... and ${missing.length - 5} more` : ''}`);
      }
    }
  });
} else {
  console.log('❌ Could not find SECTION13_FIELD_MAPPINGS in interface file');
}

// Analyze field patterns
console.log('\n🔍 FIELD PATTERN ANALYSIS:');

// Group fields by pattern
const patterns = {
  entry1: Array.from(allFieldValues).filter(f => f.includes('Entry1')),
  entry2: Array.from(allFieldValues).filter(f => f.includes('Entry2')),
  fromDate: Array.from(allFieldValues).filter(f => f.includes('FromDate')),
  toDate: Array.from(allFieldValues).filter(f => f.includes('ToDate')),
  street: Array.from(allFieldValues).filter(f => f.includes('Street')),
  city: Array.from(allFieldValues).filter(f => f.includes('City')),
  zip: Array.from(allFieldValues).filter(f => f.toLowerCase().includes('zip')),
  phone: Array.from(allFieldValues).filter(f => f.includes('Phone')),
  supervisor: Array.from(allFieldValues).filter(f => f.includes('Supervisor')),
  apo: Array.from(allFieldValues).filter(f => f.includes('APO')),
  extension: Array.from(allFieldValues).filter(f => f.includes('Extension') || f.includes('Ext')),
  reason: Array.from(allFieldValues).filter(f => f.includes('Reason')),
  date: Array.from(allFieldValues).filter(f => f.includes('Date') && !f.includes('FromDate') && !f.includes('ToDate'))
};

Object.entries(patterns).forEach(([pattern, fields]) => {
  if (fields.length > 0) {
    console.log(`  ${pattern}: ${fields.length} fields`);
    if (fields.length <= 10) {
      console.log(`    Examples: ${fields.join(', ')}`);
    } else {
      console.log(`    Examples: ${fields.slice(0, 5).join(', ')} ... and ${fields.length - 5} more`);
    }
  }
});

// Check for critical missing patterns
console.log('\n⚠️  CRITICAL MISSING PATTERNS CHECK:');

const criticalPatterns = [
  { name: 'Multiple Employment Periods', pattern: /FromDate[1-4]|ToDate[1-4]/ },
  { name: 'APO/FPO Addresses', pattern: /_b_APO|_b2_APO/ },
  { name: 'Multiple Supervisors', pattern: /_a_Superviso|_b_Superviso/ },
  { name: 'Employment Issues', pattern: /sect13A\.5Entry1_/ },
  { name: 'Disciplinary Actions', pattern: /sect13A\.6Entry1_/ },
  { name: 'Address Variations', pattern: /_a_Street|_b1_Street|_b2_Street/ }
];

criticalPatterns.forEach(({ name, pattern }) => {
  const matchingFields = Array.from(allFieldValues).filter(field => pattern.test(field));
  console.log(`  ${name}: ${matchingFields.length} fields found`);
  if (matchingFields.length > 0 && matchingFields.length <= 5) {
    console.log(`    Examples: ${matchingFields.join(', ')}`);
  } else if (matchingFields.length > 5) {
    console.log(`    Examples: ${matchingFields.slice(0, 3).join(', ')} ... and ${matchingFields.length - 3} more`);
  }
});

// Generate recommendations
console.log('\n💡 RECOMMENDATIONS:');

const totalMapped = mappingMatches ? 
  (interfaceContent.match(/'sect13A\.[^']+'/g) || []).length : 0;
const totalReference = allFieldValues.size;
const overallCoverage = totalReference > 0 ? (totalMapped / totalReference * 100).toFixed(1) : 0;

console.log(`📊 Overall Coverage: ${totalMapped}/${totalReference} (${overallCoverage}%)`);

if (overallCoverage < 95) {
  console.log('🔧 ACTIONS NEEDED:');
  console.log('  1. Add missing field mappings to SECTION13_FIELD_MAPPINGS');
  console.log('  2. Update interface definitions to include all field variations');
  console.log('  3. Ensure context flattening function handles all subsections');
  console.log('  4. Add UI components for missing field types');
  console.log('  5. Update validation to cover all field patterns');
} else {
  console.log('✅ Field mapping coverage is excellent!');
}

console.log('\n🎯 NEXT STEPS:');
console.log('  1. Review missing fields by subsection');
console.log('  2. Update interface definitions for 100% coverage');
console.log('  3. Implement UI components for all field types');
console.log('  4. Test with actual PDF generation');
console.log('  5. Validate against SF-86 form requirements');

console.log('\n' + '=' .repeat(60));
console.log('🎉 SECTION 13 FIELD MAPPING VERIFICATION COMPLETE');
