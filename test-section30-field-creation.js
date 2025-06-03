/**
 * Test Script: Section 30 Field Creation Verification
 * 
 * This script tests the createFieldFromReference function for Section 30 fields
 * to verify that field IDs are being assigned correctly and there's no mixup
 * between date fields and zipcode fields.
 */

import { createFieldFromReference } from './api/utils/sections-references-loader.js';

console.log('🧪 Testing Section 30 Field Creation...\n');

// ============================================================================
// TEST FIELD CREATION FOR PROBLEM FIELDS
// ============================================================================

console.log('📋 Testing Problem Fields:');
console.log('==========================');

// Test the problematic zipcode field
console.log('\n1. Testing ZIP_CODE_PAGE2 (Field ID: 16262):');
try {
  const zipCodeField = createFieldFromReference(30, "16262", "");
  console.log('✅ ZIP Code Field Created:');
  console.log(`   ID: "${zipCodeField.id}"`);
  console.log(`   Name: "${zipCodeField.name}"`);
  console.log(`   Type: "${zipCodeField.type}"`);
  console.log(`   Label: "${zipCodeField.label}"`);
  console.log(`   Expected Name: "form1[0].continuation2[0].p17-t10[0]"`);
  console.log(`   Name Match: ${zipCodeField.name === "form1[0].continuation2[0].p17-t10[0]"}`);
} catch (error) {
  console.log('❌ ZIP Code Field Creation Failed:', error.message);
}

// Test the date fields that could be confused with zipcode
console.log('\n2. Testing DATE_SIGNED_PAGE2 (Field ID: 16269):');
try {
  const dateSignedField = createFieldFromReference(30, "16269", "");
  console.log('✅ Date Signed Field Created:');
  console.log(`   ID: "${dateSignedField.id}"`);
  console.log(`   Name: "${dateSignedField.name}"`);
  console.log(`   Type: "${dateSignedField.type}"`);
  console.log(`   Label: "${dateSignedField.label}"`);
  console.log(`   Expected Name: "form1[0].continuation2[0].p17-t2[0]"`);
  console.log(`   Name Match: ${dateSignedField.name === "form1[0].continuation2[0].p17-t2[0]"}`);
} catch (error) {
  console.log('❌ Date Signed Field Creation Failed:', error.message);
}

console.log('\n3. Testing DATE_OF_BIRTH (Field ID: 16267):');
try {
  const dateOfBirthField = createFieldFromReference(30, "16267", "");
  console.log('✅ Date of Birth Field Created:');
  console.log(`   ID: "${dateOfBirthField.id}"`);
  console.log(`   Name: "${dateOfBirthField.name}"`);
  console.log(`   Type: "${dateOfBirthField.type}"`);
  console.log(`   Label: "${dateOfBirthField.label}"`);
  console.log(`   Expected Name: "form1[0].continuation2[0].p17-t4[0]"`);
  console.log(`   Name Match: ${dateOfBirthField.name === "form1[0].continuation2[0].p17-t4[0]"}`);
} catch (error) {
  console.log('❌ Date of Birth Field Creation Failed:', error.message);
}

// ============================================================================
// TEST ALL SECTION 30 DATE AND ZIPCODE FIELDS
// ============================================================================

console.log('\n📋 Testing All Section 30 Date and ZIP Code Fields:');
console.log('====================================================');

const testFieldMappings = [
  // Date fields
  { name: 'DATE_SIGNED_PAGE1', id: '16258', expectedName: 'form1[0].continuation1[0].p17-t2[0]' },
  { name: 'DATE_SIGNED_PAGE2', id: '16269', expectedName: 'form1[0].continuation2[0].p17-t2[0]' },
  { name: 'DATE_OF_BIRTH', id: '16267', expectedName: 'form1[0].continuation2[0].p17-t4[0]' },
  { name: 'DATE_SIGNED_PAGE3', id: '16281', expectedName: 'form1[0].continuation3[0].p17-t2[0]' },
  { name: 'DATE_SIGNED_PAGE4', id: '16268', expectedName: 'form1[0].continuation4[0].p17-t2[0]' },
  
  // ZIP Code fields
  { name: 'ZIP_CODE_PAGE2', id: '16262', expectedName: 'form1[0].continuation2[0].p17-t10[0]' },
  { name: 'ZIP_CODE_PAGE3', id: '16275', expectedName: 'form1[0].continuation3[0].p17-t10[0]' },
];

const results = [];

testFieldMappings.forEach(test => {
  try {
    const field = createFieldFromReference(30, test.id, "");
    const isCorrect = field.name === test.expectedName;
    
    results.push({
      ...test,
      actualId: field.id,
      actualName: field.name,
      actualType: field.type,
      actualLabel: field.label,
      isCorrect,
      status: isCorrect ? '✅' : '❌'
    });
    
    console.log(`${isCorrect ? '✅' : '❌'} ${test.name}:`);
    console.log(`   Expected ID: ${test.id} | Actual ID: ${field.id}`);
    console.log(`   Expected Name: ${test.expectedName}`);
    console.log(`   Actual Name: ${field.name}`);
    console.log(`   Type: ${field.type} | Label: ${field.label}`);
    
    if (!isCorrect) {
      console.log(`   🚨 MISMATCH DETECTED!`);
    }
    console.log('');
  } catch (error) {
    results.push({
      ...test,
      status: '💥',
      error: error.message
    });
    console.log(`💥 ${test.name}: ERROR - ${error.message}\n`);
  }
});

// ============================================================================
// SUMMARY ANALYSIS
// ============================================================================

console.log('📊 FIELD CREATION TEST SUMMARY:');
console.log('================================');

const correctFields = results.filter(r => r.isCorrect);
const incorrectFields = results.filter(r => !r.isCorrect && !r.error);
const errorFields = results.filter(r => r.error);

console.log(`✅ Correct Fields: ${correctFields.length}/${results.length}`);
console.log(`❌ Incorrect Fields: ${incorrectFields.length}/${results.length}`);
console.log(`💥 Error Fields: ${errorFields.length}/${results.length}`);

if (incorrectFields.length > 0) {
  console.log('\n🚨 INCORRECT FIELD MAPPINGS:');
  incorrectFields.forEach(field => {
    console.log(`   ${field.name}: Expected "${field.expectedName}" but got "${field.actualName}"`);
  });
}

if (errorFields.length > 0) {
  console.log('\n💥 FIELD CREATION ERRORS:');
  errorFields.forEach(field => {
    console.log(`   ${field.name}: ${field.error}`);
  });
}

// ============================================================================
// FIELD ID CONFLICT DETECTION
// ============================================================================

console.log('\n🔍 FIELD ID CONFLICT DETECTION:');
console.log('================================');

const fieldIds = results.filter(r => r.actualId).map(r => r.actualId);
const duplicateIds = fieldIds.filter((id, index) => fieldIds.indexOf(id) !== index);

if (duplicateIds.length > 0) {
  console.log('🚨 DUPLICATE FIELD IDs DETECTED:');
  duplicateIds.forEach(id => {
    const fieldsWithId = results.filter(r => r.actualId === id);
    console.log(`   ID "${id}" used by: ${fieldsWithId.map(f => f.name).join(', ')}`);
  });
} else {
  console.log('✅ No duplicate field IDs detected');
}

console.log('\n🎯 DIAGNOSIS:');
console.log('=============');

if (correctFields.length === results.length) {
  console.log('✅ All field mappings are correct');
  console.log('   → Issue is likely NOT in createFieldFromReference()');
  console.log('   → Look at form state management or PDF service mapping');
} else {
  console.log('❌ Field mapping issues detected');
  console.log('   → createFieldFromReference() may be returning wrong data');
  console.log('   → Check sections-references data integrity');
}

console.log('\n🧪 Section 30 Field Creation Test Complete!'); 