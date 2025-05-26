/**
 * Test script to verify enhanced field parsing patterns
 */

// Import the enhanced field parsing function from compiled JS
import { extractSectionInfo } from './dist/sectionizer/src/sectionizer/utils/fieldParsing.js';

// Test cases based on the examples provided
const testCases = [
  // Section 21 examples
  {
    name: 'form1[0].Section21c[0].TextField11[0]',
    expected: { section: 21, subsection: 'C', entry: 1 }
  },
  {
    name: 'form1[0].Section21c[0].TextField11[6]',
    expected: { section: 21, subsection: 'C', entry: 2 }
  },
  {
    name: 'form1[0].Section21c[0].TextField11[12]',
    expected: { section: 21, subsection: 'C', entry: 3 }
  },
  {
    name: 'form1[0].Section21c[0].TextField11[18]',
    expected: { section: 21, subsection: 'C', entry: 4 }
  },
  {
    name: 'section21d3',
    expected: { section: 21, subsection: 'D', entry: 3 }
  },
  {
    name: 'section21d1',
    expected: { section: 21, subsection: 'D', entry: 1 }
  },
  {
    name: 'section21a',
    expected: { section: 21, subsection: 'A' }
  },
  {
    name: 'Section21a2',
    expected: { section: 21, subsection: 'A', entry: 2 }
  },
  {
    name: 'Section21e',
    expected: { section: 21, subsection: 'E' }
  },
  {
    name: 'Section21e1',
    expected: { section: 21, subsection: 'E', entry: 1 }
  },

  // Section 16 examples
  {
    name: 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]',
    expected: { section: 16, entry: 1 }
  },
  {
    name: 'form1[0].Section16_3[0].#area[1].From_Datefield_Name_2[2]',
    expected: { section: 16, entry: 3 }
  },

  // Section 17 examples
  {
    name: 'form1[0].Section17_1[0].#area[3].School6_State[0]',
    expected: { section: 17, subsection: '1', entry: 1 }
  },
  {
    name: 'form1[0].Section17_1_2[0].School6_State[0]',
    expected: { section: 17, subsection: '1', entry: 2 }
  },
  {
    name: 'form1[0].Section17_2[0].suffix[0]',
    expected: { section: 17, subsection: '2', entry: 1 }
  },
  {
    name: 'form1[0].Section17_2_2[0].suffix[0]',
    expected: { section: 17, subsection: '2', entry: 2 }
  },
  {
    name: 'form1[0].Section17_3_2[0].#area[2].School6_State[0]',
    expected: { section: 17, subsection: '3', entry: 2 }
  },

  // Section 8 (from Sections7-9) examples
  {
    name: 'form1[0].Sections7-9[0].p3-t68[0]',
    expected: { section: 8 }
  },
  {
    name: 'form1[0].Sections7-9[0].#area[0].From_Datefield_Name_2[0]',
    expected: { section: 8 }
  },
  {
    name: 'form1[0].Sections7-9[0].#area[0].To_Datefield_Name_2[0]',
    expected: { section: 8 }
  },
  {
    name: 'form1[0].Sections7-9[0].#area[0].#field[4]',
    expected: { section: 8 }
  },
  {
    name: 'form1[0].Sections7-9[0].TextField11[0]',
    expected: { section: 8 }
  },

  // Section 14 examples
  {
    name: 'form1[0].Section14_1[0].TextField11[2]',
    expected: { section: 14, subsection: '1', entry: 1 }
  },
  {
    name: 'form1[0].Section14_1[0].TextField11[1]',
    expected: { section: 14, subsection: '1', entry: 1 }
  },
  {
    name: 'form1[0].Section14_1[0].TextField11[0]',
    expected: { section: 14, subsection: '1', entry: 1 }
  },
  {
    name: 'form1[0].Section14_1[0].#area[0].RadioButtonList[0]',
    expected: { section: 14, subsection: '1', entry: 1 }
  }
];

console.log('Testing Enhanced Field Parsing Patterns');
console.log('=====================================\n');

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  try {
    const result = extractSectionInfo(testCase.name, { verbose: true, minConfidence: 0.7 });

    if (!result) {
      console.log(`❌ FAIL: "${testCase.name}" -> No result`);
      console.log(`   Expected: Section ${testCase.expected.section}${testCase.expected.subsection ? ` subsection ${testCase.expected.subsection}` : ''}${testCase.expected.entry ? ` entry ${testCase.expected.entry}` : ''}\n`);
      failed++;
      continue;
    }

    let success = result.section === testCase.expected.section;

    if (testCase.expected.subsection) {
      success = success && result.subsection === testCase.expected.subsection;
    }

    if (testCase.expected.entry) {
      success = success && result.entry === testCase.expected.entry;
    }

    if (success) {
      console.log(`✅ PASS: "${testCase.name}" -> Section ${result.section}${result.subsection ? ` subsection ${result.subsection}` : ''}${result.entry ? ` entry ${result.entry}` : ''} (confidence: ${result.confidence.toFixed(2)})`);
      passed++;
    } else {
      console.log(`❌ FAIL: "${testCase.name}" -> Section ${result.section}${result.subsection ? ` subsection ${result.subsection}` : ''}${result.entry ? ` entry ${result.entry}` : ''}`);
      console.log(`   Expected: Section ${testCase.expected.section}${testCase.expected.subsection ? ` subsection ${testCase.expected.subsection}` : ''}${testCase.expected.entry ? ` entry ${testCase.expected.entry}` : ''}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ERROR: "${testCase.name}" -> ${error.message}`);
    failed++;
  }
}

console.log('\n=====================================');
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('🎉 All tests passed! Enhanced patterns are working correctly.');
} else {
  console.log('⚠️  Some tests failed. Pattern matching needs improvement.');
}
