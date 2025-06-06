#!/usr/bin/env node

/**
 * Test Section 15 Field Mapping
 * 
 * This script tests the updated field mapping for Section 15 to ensure
 * all mapped field names exist in the sections-references data.
 */

const fs = require('fs');
const path = require('path');

// Load the sections-references data
const section15DataPath = path.join(__dirname, 'api/sections-references/section-15.json');
const section15Data = JSON.parse(fs.readFileSync(section15DataPath, 'utf8'));

// Extract field names from the sections-references
const availableFields = new Set();
section15Data.fields.forEach(field => {
  availableFields.add(field.name);
});

console.log(`📊 Section 15 has ${availableFields.size} available fields`);

// Field mappings from the updated mapping file
const SECTION15_FIELD_MAPPINGS = {
  // Main military service question
  'section15.militaryService.hasServed.value': 'form1[0].Section14_1[0].#area[4].RadioButtonList[1]',
  
  // Military Service Entry 1 (Section14_1 fields)
  'section15.militaryService.0.branch.value': 'form1[0].Section14_1[0].#area[5].#area[6].RadioButtonList[2]',
  'section15.militaryService.0.status.value': 'form1[0].Section14_1[0].#area[19].#field[27]',
  'section15.militaryService.0.serviceNumber.value': 'form1[0].Section14_1[0].TextField11[3]',
  'section15.militaryService.0.startDate.value': 'form1[0].Section14_1[0].#area[8].From_Datefield_Name_2[0]',
  'section15.militaryService.0.endDate.value': 'form1[0].Section14_1[0].#area[8].From_Datefield_Name_2[1]',
  'section15.militaryService.0.isStartDateEstimated.value': 'form1[0].Section14_1[0].#area[8].#field[7]',
  'section15.militaryService.0.isEndDateEstimated.value': 'form1[0].Section14_1[0].#area[8].#field[10]',
  'section15.militaryService.0.dischargeType.value': 'form1[0].Section14_1[0].#area[10].RadioButtonList[5]',
  'section15.militaryService.0.dischargeReason.value': 'form1[0].Section14_1[0].TextField11[5]',
  
  // Military Service Entry 2 (Section14_1 fields with different indices)
  'section15.militaryService.1.branch.value': 'form1[0].Section14_1[0].#area[12].RadioButtonList[7]',
  'section15.militaryService.1.status.value': 'form1[0].Section14_1[0].#area[19].#field[28]',
  'section15.militaryService.1.serviceNumber.value': 'form1[0].Section14_1[0].TextField11[6]',
  'section15.militaryService.1.startDate.value': 'form1[0].Section14_1[0].#area[16].From_Datefield_Name_2[3]',
  'section15.militaryService.1.endDate.value': 'form1[0].Section14_1[0].#area[16].From_Datefield_Name_2[4]',
  'section15.militaryService.1.isStartDateEstimated.value': 'form1[0].Section14_1[0].#area[16].#field[18]',
  'section15.militaryService.1.isEndDateEstimated.value': 'form1[0].Section14_1[0].#area[16].#field[20]',
  'section15.militaryService.1.dischargeType.value': 'form1[0].Section14_1[0].#area[18].RadioButtonList[11]',
  'section15.militaryService.1.dischargeReason.value': 'form1[0].Section14_1[0].TextField11[8]',

  // Disciplinary Procedures Entry 1 (Section15_2 fields)
  'section15.disciplinaryProcedures.hasDisciplinaryAction.value': 'form1[0].Section15_2[0].#area[0].RadioButtonList[0]',
  'section15.disciplinaryProcedures.0.date.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[0]',
  'section15.disciplinaryProcedures.0.isDateEstimated.value': 'form1[0].Section15_2[0].#field[2]',
  'section15.disciplinaryProcedures.0.offense.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[1]',
  'section15.disciplinaryProcedures.0.action.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[2]',
  'section15.disciplinaryProcedures.0.agency.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[3]',
  
  // Disciplinary Procedures Entry 2 (Section15_2 fields)
  'section15.disciplinaryProcedures.1.date.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[5]',
  'section15.disciplinaryProcedures.1.isDateEstimated.value': 'form1[0].Section15_2[0].#field[8]',
  'section15.disciplinaryProcedures.1.offense.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[6]',
  'section15.disciplinaryProcedures.1.action.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[7]',
  'section15.disciplinaryProcedures.1.agency.value': 'form1[0].Section15_2[0].From_Datefield_Name_2[8]',

  // Foreign Military Service Entry 1 (Section15_3 fields)
  'section15.foreignMilitaryService.hasForeignService.value': 'form1[0].Section15_3[0].RadioButtonList[0]',
  'section15.foreignMilitaryService.0.country.value': 'form1[0].Section15_3[0].DropDownList29[0]',
  'section15.foreignMilitaryService.0.branch.value': 'form1[0].Section15_3[0].TextField11[0]',
  'section15.foreignMilitaryService.0.rank.value': 'form1[0].Section15_3[0].TextField11[1]',
  'section15.foreignMilitaryService.0.startDate.value': 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[0]',
  'section15.foreignMilitaryService.0.endDate.value': 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[1]',
  'section15.foreignMilitaryService.0.isStartDateEstimated.value': 'form1[0].Section15_3[0].#area[0].#field[3]',
  'section15.foreignMilitaryService.0.isEndDateEstimated.value': 'form1[0].Section15_3[0].#area[0].#field[5]',
  
  // Foreign Military Service Entry 2 (Section15_3 fields) - Contact information
  'section15.foreignMilitaryService.1.country.value': 'form1[0].Section15_3[0].#area[2].#area[3].DropDownList6[0]',
  'section15.foreignMilitaryService.1.branch.value': 'form1[0].Section15_3[0].#area[2].TextField11[8]',
  'section15.foreignMilitaryService.1.rank.value': 'form1[0].Section15_3[0].#area[2].TextField11[7]',
  'section15.foreignMilitaryService.1.startDate.value': 'form1[0].Section15_3[0].#area[2].From_Datefield_Name_2[2]',
  'section15.foreignMilitaryService.1.endDate.value': 'form1[0].Section15_3[0].#area[2].From_Datefield_Name_2[3]',
  'section15.foreignMilitaryService.1.isStartDateEstimated.value': 'form1[0].Section15_3[0].#area[2].#field[23]',
  'section15.foreignMilitaryService.1.isEndDateEstimated.value': 'form1[0].Section15_3[0].#area[2].#field[25]',
};

// Test each mapping
console.log('\n🔍 Testing field mappings...\n');

let validMappings = 0;
let invalidMappings = 0;
const invalidFields = [];

Object.entries(SECTION15_FIELD_MAPPINGS).forEach(([logicalPath, pdfFieldName]) => {
  const exists = availableFields.has(pdfFieldName);
  
  if (exists) {
    console.log(`✅ ${logicalPath} → ${pdfFieldName}`);
    validMappings++;
  } else {
    console.log(`❌ ${logicalPath} → ${pdfFieldName} (NOT FOUND)`);
    invalidMappings++;
    invalidFields.push(pdfFieldName);
  }
});

console.log('\n📊 Summary:');
console.log(`✅ Valid mappings: ${validMappings}`);
console.log(`❌ Invalid mappings: ${invalidMappings}`);
console.log(`📈 Success rate: ${((validMappings / (validMappings + invalidMappings)) * 100).toFixed(1)}%`);

if (invalidFields.length > 0) {
  console.log('\n🔍 Invalid field names:');
  invalidFields.forEach(field => {
    console.log(`   - ${field}`);
  });
  
  console.log('\n💡 Suggestions:');
  console.log('   Check the sections-references data for similar field names');
  console.log('   Verify the field structure in section-15.json');
}

console.log('\n🎯 Test complete!');
