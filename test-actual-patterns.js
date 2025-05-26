// Test the actual patterns against the actual field names found in the output
const actualFieldNames = [
  'form1[0].Sections7-9[0].TextField11[13]',
  'form1[0].Sections7-9[0].p3-t68[2]',
  'form1[0].Sections7-9[0].RadioButtonList[0]',
  'form1[0].Sections7-9[0].p3-t68[0]',
  'form1[0].Sections7-9[0].#area[0].From_Datefield_Name_2[0]',
  'form1[0].Sections7-9[0].#area[0].To_Datefield_Name_2[0]',
  'form1[0].Sections7-9[0].#area[0].#field[4]',
  'form1[0].Sections7-9[0].TextField11[0]'
];

const section8Patterns = [
  /form1\[0\]\.Sections7-9\[0\]\.p3-t68\[0\]/i,
  /form1\[0\]\.Sections7-9\[0\]\.#area\[0\]\.From_Datefield_Name_2\[0\]/i,
  /form1\[0\]\.Sections7-9\[0\]\.#area\[0\]\.To_Datefield_Name_2\[0\]/i,
  /form1\[0\]\.Sections7-9\[0\]\.#area\[0\]\.#field\[4\]/i,
  /form1\[0\]\.Sections7-9\[0\]\.TextField11\[0\]/i,
  /form1\[0\]\.Sections7-9\[0\]\..*passport/i,
  /form1\[0\]\.Sections7-9\[0\]\..*section8/i,
  /form1\[0\]\.Sections7-9\[0\]\..*p3-t68\[\d+\]/i,
];

console.log('=== TESTING ACTUAL FIELD NAMES AGAINST SECTION 8 PATTERNS ===');

actualFieldNames.forEach((fieldName, fieldIndex) => {
  console.log(`\nField ${fieldIndex + 1}: "${fieldName}"`);
  
  let matched = false;
  section8Patterns.forEach((pattern, patternIndex) => {
    const result = pattern.test(fieldName);
    if (result) {
      console.log(`  ✓ MATCHES pattern ${patternIndex + 1}: ${pattern}`);
      matched = true;
    }
  });
  
  if (!matched) {
    console.log(`  ✗ NO MATCHES`);
    
    // Test individual components
    console.log(`  Debug tests:`);
    console.log(`    Contains "Sections7-9": ${fieldName.includes('Sections7-9')}`);
    console.log(`    Contains "#area": ${fieldName.includes('#area')}`);
    console.log(`    Contains "p3-t68": ${fieldName.includes('p3-t68')}`);
    
    // Test if the issue is with # character escaping
    const testPattern1 = /form1\[0\]\.Sections7-9\[0\]\.#area\[0\]\.From_Datefield_Name_2\[0\]/i;
    const testPattern2 = /form1\[0\]\.Sections7-9\[0\]\.\#area\[0\]\.From_Datefield_Name_2\[0\]/i;
    console.log(`    Test pattern without \\#: ${testPattern1.test(fieldName)}`);
    console.log(`    Test pattern with \\#: ${testPattern2.test(fieldName)}`);
  }
});

console.log('\n=== SUMMARY ===');
let totalMatches = 0;
actualFieldNames.forEach(fieldName => {
  const hasMatch = section8Patterns.some(pattern => pattern.test(fieldName));
  if (hasMatch) totalMatches++;
});

console.log(`Total fields tested: ${actualFieldNames.length}`);
console.log(`Fields that matched: ${totalMatches}`);
console.log(`Match rate: ${Math.round(totalMatches/actualFieldNames.length*100)}%`);
