// Debug script to test section 8 pattern matching
import { sectionFieldPatterns } from './src/sectionizer/utils/field-clusterer.js';

// Test fields that should match section 8 patterns
const testFields = [
  { 
    id: 'test1', 
    name: 'form1[0].Sections7-9[0].#area[0].To_Datefield_Name_2[0]',
    section: 0,
    page: 6
  },
  { 
    id: 'test2', 
    name: 'form1[0].Sections7-9[0].#area[0].#field[4]',
    section: 0,
    page: 6
  },
  { 
    id: 'test3', 
    name: 'form1[0].Sections7-9[0].TextField11[0]',
    section: 0,
    page: 6
  },
  { 
    id: 'test4', 
    name: 'form1[0].Sections1-6[0].TextField11[0]',
    section: 0,
    page: 5
  }
];

console.log('=== SECTION 8 PATTERN DEBUGGING ===');
console.log('Section 8 patterns:', sectionFieldPatterns[8]);

console.log('\n=== TESTING INDIVIDUAL PATTERNS ===');
testFields.forEach((field, index) => {
  console.log(`\nField ${index + 1}: "${field.name}"`);
  
  const section8Patterns = sectionFieldPatterns[8];
  let matched = false;
  
  section8Patterns.forEach((pattern, patternIndex) => {
    const result = pattern.test(field.name);
    console.log(`  Pattern ${patternIndex + 1}: ${pattern} -> ${result ? 'MATCH ✓' : 'NO MATCH ✗'}`);
    if (result) matched = true;
  });
  
  console.log(`  Overall: ${matched ? 'MATCHES SECTION 8 ✓' : 'NO MATCH FOR SECTION 8 ✗'}`);
});

// Test the actual function logic
console.log('\n=== TESTING FUNCTION LOGIC ===');
function testFindSectionFieldsByPatterns(unknownFields, sectionId) {
  const sectionPatterns = sectionFieldPatterns[sectionId];
  
  console.log(`Looking for section ${sectionId} fields using ${sectionPatterns.length} patterns`);
  console.log(`Total unknown fields available: ${unknownFields.length}`);
  
  const exactMatches = unknownFields.filter((field) => {
    console.log(`Testing field "${field.name}" against section ${sectionId} patterns`);
    
    const matches = sectionPatterns.some((pattern) => {
      const result = pattern.test(field.name);
      if (result) {
        console.log(`  ✓ Pattern ${pattern} matched field "${field.name}"`);
      }
      return result;
    });
    
    if (!matches) {
      console.log(`  ✗ No patterns matched field "${field.name}"`);
    }
    
    return matches;
  });
  
  console.log(`Found ${exactMatches.length} exact matches for section ${sectionId} using patterns`);
  return exactMatches;
}

const matches = testFindSectionFieldsByPatterns(testFields, 8);
console.log('\nMatched fields:', matches.map(f => f.name));
