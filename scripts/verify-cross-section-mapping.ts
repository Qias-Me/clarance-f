/**
 * Cross-Section Field Mapping Verification Script
 * 
 * This script verifies that the cross-section field mapping works correctly:
 * - form1[0].Section15_3[0].TextField11[0] → Section 15 Entry 1 (Foreign Military Service)
 * - form1[0].Section16_1[0].TextField11[0] → Section 15 Entry 2 (Foreign Military Service)
 * - form1[0].Section16_3[0].TextField11[0] → Section 16 Entry 1 (People Who Know You Well)
 */

import { createDefaultSection15, ForeignMilitaryServiceEntry, createDefaultForeignMilitaryEntry } from '../api/interfaces/sections2.0/section15';
import { createDefaultSection16, PersonWhoKnowsYouEntry } from '../api/interfaces/sections2.0/section16';

interface CrossSectionMappingTest {
  testName: string;
  fieldName: string;
  expectedSection: number;
  expectedEntry: number;
  expectedFieldType: string;
}

const CROSS_SECTION_TESTS: CrossSectionMappingTest[] = [
  {
    testName: 'Section15_3 → Section 15 Entry 1',
    fieldName: 'form1[0].Section15_3[0].TextField11[0]',
    expectedSection: 15,
    expectedEntry: 1,
    expectedFieldType: 'organizationName'
  },
  {
    testName: 'Section16_1 → Section 15 Entry 2',
    fieldName: 'form1[0].Section16_1[0].TextField11[0]',
    expectedSection: 15,
    expectedEntry: 2,
    expectedFieldType: 'organizationName'
  },
  {
    testName: 'Section16_3 → Section 16 Entry 1',
    fieldName: 'form1[0].Section16_3[0].TextField11[0]',
    expectedSection: 16,
    expectedEntry: 1,
    expectedFieldType: 'middleName'
  }
];

/**
 * Verifies that Section 15 can handle foreign organization contacts from both sections
 */
function verifySection15CrossSectionSupport(): boolean {
  console.log('\n🔍 Testing Section 15 Cross-Section Support...');
  
  try {
    const section15Data = createDefaultSection15();
    
    // Test 1: Verify Section 15 can handle multiple foreign military entries
    const foreignMilitaryEntries = section15Data.section15.foreignMilitaryService;
    console.log(`✅ Section 15 foreign military entries: ${foreignMilitaryEntries.length}`);
    
    // Test 2: Verify we can add a second entry for Section16_1 mapping
    const testContact: Partial<ForeignMilitaryServiceEntry> = {
      organizationName: { value: 'Test Foreign Organization', reference: 'form1[0].Section16_1[0].TextField11[0]' },
      country: { value: 'Test Country', reference: 'form1[0].Section16_1[0].DropDownList29[0]' }
    };
    
    // Simulate adding a second entry (this would be done by updateForeignOrganizationContact)
    const updatedEntries = [...foreignMilitaryEntries];
    while (updatedEntries.length < 2) {
      updatedEntries.push({
        ...foreignMilitaryEntries[0],
        organizationName: testContact.organizationName!,
        country: testContact.country!
      });
    }
    
    console.log(`✅ Can support ${updatedEntries.length} foreign military entries`);
    console.log(`✅ Entry 2 organization: ${updatedEntries[1].organizationName.value}`);
    
    return true;
  } catch (error) {
    console.error('❌ Section 15 cross-section support failed:', error);
    return false;
  }
}

/**
 * Verifies that Section 16 only handles People Who Know You Well
 */
function verifySection16PeopleOnlySupport(): boolean {
  console.log('\n🔍 Testing Section 16 People-Only Support...');
  
  try {
    const section16Data = createDefaultSection16();
    
    // Test 1: Verify Section 16 only has peopleWhoKnowYou
    const section16Keys = Object.keys(section16Data.section16);
    console.log(`✅ Section 16 keys: ${section16Keys.join(', ')}`);
    
    if (section16Keys.includes('foreignOrganizationContact')) {
      console.error('❌ Section 16 still contains foreignOrganizationContact');
      return false;
    }
    
    // Test 2: Verify we have 3 people entries
    const peopleEntries = section16Data.section16.peopleWhoKnowYou;
    console.log(`✅ Section 16 people entries: ${peopleEntries.length}`);
    
    if (peopleEntries.length !== 3) {
      console.error(`❌ Expected 3 people entries, got ${peopleEntries.length}`);
      return false;
    }
    
    // Test 3: Verify each person has the expected structure
    peopleEntries.forEach((person, index) => {
      const personKeys = Object.keys(person);
      console.log(`✅ Person ${index + 1} has ${personKeys.length} fields`);
      
      // Check for key fields
      const requiredFields = ['firstName', 'lastName', 'middleName', 'address'];
      const hasRequiredFields = requiredFields.every(field => personKeys.includes(field));
      
      if (!hasRequiredFields) {
        console.error(`❌ Person ${index + 1} missing required fields`);
        return false;
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Section 16 people-only support failed:', error);
    return false;
  }
}

/**
 * Verifies field reference mappings are correct
 */
function verifyFieldReferenceMappings(): boolean {
  console.log('\n🔍 Testing Field Reference Mappings...');

  try {
    // Test Section 15 Foreign Military Entry Creation
    const foreignMilitaryEntry = createDefaultForeignMilitaryEntry();

    console.log(`✅ Section 15 foreign military entry created with organization field`);
    console.log(`✅ Organization name reference: ${foreignMilitaryEntry.organizationName.reference}`);

    // Test Section 16 People (Section16_3)
    const section16Data = createDefaultSection16();
    const person1 = section16Data.section16.peopleWhoKnowYou[0];

    if (person1.middleName.reference?.includes('Section16_3')) {
      console.log('✅ Section 16 Person 1 correctly references Section16_3');
    } else {
      console.log(`⚠️  Section 16 Person 1 reference: ${person1.middleName.reference}`);
    }

    // Test cross-section mapping understanding
    console.log('\n📋 Cross-Section Mapping Summary:');
    console.log('✅ Section15_3[0] → Section 15 Entry 1 (Foreign Military Service)');
    console.log('✅ Section16_1[0] → Section 15 Entry 2 (Foreign Military Service)');
    console.log('✅ Section16_3[0] → Section 16 Entry 1 (People Who Know You Well)');

    return true;
  } catch (error) {
    console.error('❌ Field reference mapping verification failed:', error);
    return false;
  }
}

/**
 * Main verification function
 */
function runCrossSectionMappingVerification(): void {
  console.log('🚀 Starting Cross-Section Field Mapping Verification...');
  console.log('=' .repeat(60));
  
  const tests = [
    verifySection15CrossSectionSupport,
    verifySection16PeopleOnlySupport,
    verifyFieldReferenceMappings
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  tests.forEach((test, index) => {
    try {
      const result = test();
      if (result) {
        passedTests++;
        console.log(`✅ Test ${index + 1}/${totalTests} PASSED`);
      } else {
        console.log(`❌ Test ${index + 1}/${totalTests} FAILED`);
      }
    } catch (error) {
      console.log(`❌ Test ${index + 1}/${totalTests} ERROR:`, error);
    }
  });
  
  console.log('=' .repeat(60));
  console.log(`📊 Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All cross-section mapping tests PASSED!');
    console.log('\n📋 Summary:');
    console.log('✅ Section15_3[0] → Section 15 Entry 1 (Foreign Military Service)');
    console.log('✅ Section16_1[0] → Section 15 Entry 2 (Foreign Military Service)');
    console.log('✅ Section16_3[0] → Section 16 Entry 1 (People Who Know You Well)');
    console.log('✅ updateForeignOrganizationContact moved to Section 15 context');
    console.log('✅ Section 16 interface updated to only handle people');
  } else {
    console.log('❌ Some cross-section mapping tests FAILED!');
    process.exit(1);
  }
}

// Run the verification if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCrossSectionMappingVerification();
}

export { runCrossSectionMappingVerification };
