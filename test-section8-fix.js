// Test the updated section 8 patterns
import { sectionFieldPatterns, expectedFieldCounts } from './src/sectionizer/utils/field-clusterer.js';

console.log('=== SECTION 8 PATTERN FIX TEST ===');
console.log('Expected field count for section 8:', expectedFieldCounts[8]);
console.log('Number of patterns for section 8:', sectionFieldPatterns[8].length);
console.log('Section 8 patterns:');
sectionFieldPatterns[8].forEach((pattern, index) => {
  console.log(`  ${index + 1}. ${pattern}`);
});

// Test fields that should match section 8 patterns
const testFields = [
  'form1[0].Sections7-9[0].#area[0].To_Datefield_Name_2[0]',
  'form1[0].Sections7-9[0].#area[0].#field[4]',
  'form1[0].Sections7-9[0].TextField11[0]',
  'form1[0].Sections7-9[0].p3-t68[0]',
  'form1[0].Sections7-9[0].p3-t68[1]',
  'form1[0].Sections7-9[0].passportNumber[0]',
  'form1[0].Sections7-9[0].section8Field[0]',
];

console.log('\n=== TESTING FIELD MATCHES ===');
let totalMatches = 0;

testFields.forEach((fieldName, index) => {
  console.log(`\nField ${index + 1}: "${fieldName}"`);
  
  let matched = false;
  sectionFieldPatterns[8].forEach((pattern, patternIndex) => {
    const result = pattern.test(fieldName);
    if (result) {
      console.log(`  ✓ Matches pattern ${patternIndex + 1}: ${pattern}`);
      matched = true;
    }
  });
  
  if (matched) {
    totalMatches++;
    console.log(`  Result: MATCH ✓`);
  } else {
    console.log(`  Result: NO MATCH ✗`);
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total test fields: ${testFields.length}`);
console.log(`Fields that matched: ${totalMatches}`);
console.log(`Expected field count: ${expectedFieldCounts[8].fields}`);
console.log(`Pattern coverage: ${totalMatches}/${expectedFieldCounts[8].fields} (${Math.round(totalMatches/expectedFieldCounts[8].fields*100)}%)`);

if (totalMatches >= expectedFieldCounts[8].fields) {
  console.log('✓ SUCCESS: Enough patterns to meet expected field count');
} else {
  console.log('⚠ WARNING: May need more patterns or adjust expected count');
}
