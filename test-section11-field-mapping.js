/**
 * Test Section 11 Field Mapping Implementation
 * 
 * This test verifies that the new Section 11 field mapping utilities work correctly
 * and that all 4 entries can be created using sections-references as source of truth.
 */

// Import the field mapping utilities
import { 
  debugAllEntries, 
  getEntryPattern, 
  generateFieldName, 
  getFieldByEntryAndType,
  validateEntryFields 
} from './app/state/contexts/sections2.0/section11-field-mapping.js';

import { 
  createDefaultResidenceEntry,
  createDefaultSection11 
} from './api/interfaces/sections2.0/section11.ts';

console.log('🧪 Starting Section 11 Field Mapping Tests...\n');

// Test 1: Debug all entries to see field structure
console.log('=== TEST 1: Debug All Entries ===');
debugAllEntries();

// Test 2: Test entry patterns
console.log('\n=== TEST 2: Entry Patterns ===');
for (let i = 0; i < 4; i++) {
  const pattern = getEntryPattern(i);
  console.log(`Entry ${i + 1}: ${pattern}`);
}

// Test 3: Test field name generation
console.log('\n=== TEST 3: Field Name Generation ===');
const testFieldTypes = [
  'From_Datefield_Name_2[0]',
  'From_Datefield_Name_2[1]',
  '#field[15]',
  '#field[17]',
  'TextField11[3]',
  'TextField11[4]',
  'p3-t68[3]'
];

for (let entryIndex = 0; entryIndex < 4; entryIndex++) {
  console.log(`\n--- Entry ${entryIndex + 1} Field Names ---`);
  testFieldTypes.forEach(fieldType => {
    const fieldName = generateFieldName(fieldType, entryIndex);
    console.log(`  ${fieldType} → ${fieldName}`);
  });
}

// Test 4: Test field lookup
console.log('\n=== TEST 4: Field Lookup ===');
for (let entryIndex = 0; entryIndex < 4; entryIndex++) {
  console.log(`\n--- Entry ${entryIndex + 1} Field Lookup ---`);
  
  // Test key fields
  const keyFields = [
    'From_Datefield_Name_2[0]',  // From Date
    'p3-t68[3]',                 // Email field
    'TextField11[3]',            // Street Address
    'TextField11[6]'             // Contact Last Name
  ];
  
  keyFields.forEach(fieldType => {
    const field = getFieldByEntryAndType(entryIndex, fieldType);
    if (field) {
      console.log(`  ✅ ${fieldType}: Found (ID: ${field.id})`);
    } else {
      console.log(`  ❌ ${fieldType}: Not found`);
    }
  });
}

// Test 5: Validate entry fields
console.log('\n=== TEST 5: Entry Field Validation ===');
for (let entryIndex = 0; entryIndex < 4; entryIndex++) {
  const isValid = validateEntryFields(entryIndex);
  console.log(`Entry ${entryIndex + 1}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
}

// Test 6: Test residence entry creation
console.log('\n=== TEST 6: Residence Entry Creation ===');
for (let entryIndex = 0; entryIndex < 4; entryIndex++) {
  try {
    console.log(`\n--- Creating Entry ${entryIndex + 1} ---`);
    const entry = createDefaultResidenceEntry(entryIndex);
    
    // Check key fields
    console.log(`  From Date: ${entry.fromDate.name || 'No name'} = ${entry.fromDate.value}`);
    console.log(`  Email: ${entry.contactPerson.email.name || 'No name'} = ${entry.contactPerson.email.value}`);
    console.log(`  Street: ${entry.address.streetAddress.name || 'No name'} = ${entry.address.streetAddress.value}`);
    
    console.log(`  ✅ Entry ${entryIndex + 1} created successfully`);
  } catch (error) {
    console.error(`  ❌ Entry ${entryIndex + 1} creation failed:`, error.message);
  }
}

// Test 7: Test Section 11 creation
console.log('\n=== TEST 7: Section 11 Creation ===');
try {
  const section11 = createDefaultSection11();
  console.log(`✅ Section 11 created with ${section11.section11.residences.length} residence(s)`);
  
  // Test adding more entries
  console.log('\n--- Testing Multiple Entries ---');
  for (let i = 1; i < 4; i++) {
    try {
      const newEntry = createDefaultResidenceEntry(i);
      section11.section11.residences.push(newEntry);
      console.log(`✅ Added entry ${i + 1}`);
    } catch (error) {
      console.error(`❌ Failed to add entry ${i + 1}:`, error.message);
    }
  }
  
  console.log(`Final Section 11 has ${section11.section11.residences.length} residence entries`);
} catch (error) {
  console.error('❌ Section 11 creation failed:', error.message);
}

console.log('\n🏁 Section 11 Field Mapping Tests Complete!');
