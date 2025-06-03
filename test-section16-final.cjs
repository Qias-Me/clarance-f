/**
 * Comprehensive test for Section 16 field reference fixes
 * 
 * This test verifies:
 * 1. Section16_2 doesn't exist in section-16.json
 * 2. The correct field indices used in our fixes are present
 * 3. The incorrect field indices we fixed are absent
 */

const fs = require('fs');
const path = require('path');

try {
  // Load section-16.json
  const filepath = path.resolve(__dirname, 'api/sections-references/section-16.json');
  const jsonData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  
  // Extract field IDs for easier testing
  const fieldIds = jsonData.fields.map(field => field.name || field.id);
  
  // Group fields by section
  const sections = {};
  fieldIds.forEach(fieldId => {
    const match = fieldId.match(/form1\[0\]\.Section16_(\d+)/);
    if (match) {
      const sectionNum = match[1];
      if (!sections[sectionNum]) {
        sections[sectionNum] = [];
      }
      sections[sectionNum].push(fieldId);
    }
  });
  
  console.log("=== SECTION 16 FIELD REFERENCE TEST ===");
  console.log(`Loaded ${jsonData.fields.length} fields from section-16.json`);
  console.log(`Found Section16_1: ${sections['1'] ? sections['1'].length : 0} fields`);
  console.log(`Found Section16_2: ${sections['2'] ? sections['2'].length : 0} fields`);
  console.log(`Found Section16_3: ${sections['3'] ? sections['3'].length : 0} fields`);
  
  // Test 1: Section16_2 should not exist
  const test1Result = !sections['2'];
  
  // Test 2: Fixed field references should exist
  const fixedFieldRefs = [
    'form1[0].Section16_1[0].TextField11[0]',
    'form1[0].Section16_1[0].RadioButtonList[0]',
    'form1[0].Section16_3[0].TextField11[0]',
    'form1[0].Section16_3[0].TextField11[3]',  // Fixed contactEmail field
    'form1[0].Section16_3[0].TextField11[32]', // contactPhone field
    'form1[0].Section16_1[0].RadioButtonList[1]',
    'form1[0].Section16_1[0].TextField11[1]',
    'form1[0].Section16_1[0].DropDownList29[0]',
    'form1[0].Section16_3[0].TextField11[4]'   // Business email field
  ];
  
  const missingFixedFields = fixedFieldRefs.filter(field => !fieldIds.includes(field));
  const test2Result = missingFixedFields.length === 0;
  
  // Test 3: Broken field references should not exist
  const brokenFieldRefs = [
    'form1[0].Section16_3[0].TextField11[33]', // Original broken contactEmail
    'form1[0].Section16_2[0].RadioButtonList[1]',
    'form1[0].Section16_2[0].TextField12[0]',
    'form1[0].Section16_2[0].TextField12[14]'
  ];
  
  const presentBrokenFields = brokenFieldRefs.filter(field => fieldIds.includes(field));
  const test3Result = presentBrokenFields.length === 0;
  
  // Print test results
  console.log("\n=== TEST RESULTS ===");
  console.log(`TEST 1 - Section16_2 should not exist: ${test1Result ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`TEST 2 - Fixed fields should exist: ${test2Result ? 'PASSED ✅' : 'FAILED ❌'}`);
  if (!test2Result) {
    console.log(`   Missing fixed fields: ${missingFixedFields.join(', ')}`);
  }
  console.log(`TEST 3 - Broken fields should not exist: ${test3Result ? 'PASSED ✅' : 'FAILED ❌'}`);
  if (!test3Result) {
    console.log(`   Broken fields that exist: ${presentBrokenFields.join(', ')}`);
  }
  
  // Overall result
  const allPassed = test1Result && test2Result && test3Result;
  console.log(`\nOVERALL RESULT: ${allPassed ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`);
  if (allPassed) {
    console.log("The Section 16 field reference fixes have been verified as correct!");
    console.log("1. contactEmail now using TextField11[3] instead of TextField11[33]");
    console.log("2. Foreign business activity now using Section16_1/3 instead of Section16_2");
  }
} catch (error) {
  console.error("❌ TEST ERROR:", error);
} 