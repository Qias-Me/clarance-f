/**
 * IndexedDB Persistence Test
 * 
 * Simple test to verify that form data is properly saved and loaded from IndexedDB
 * Run this in the browser console with debug=true for detailed logging
 */

async function testIndexedDBPersistence() {
  console.log('🧪 Starting IndexedDB Persistence Test...');
  
  try {
    // Import the service (assuming it's available globally or you can import it)
    const { default: DynamicService } = await import('./api/service/dynamicService.ts');
    const dynamicService = new DynamicService();
    
    // Test data structure similar to Section 4 SSN data
    const testFormData = {
      section1: undefined,
      section2: undefined,
      section3: undefined,
      section4: {
        _id: 4,
        section4: {
          ssn: [{
            value: {
              id: "9441",
              name: "form1[0].Sections1-6[0].SSN[1]",
              type: "PDFTextField",
              label: "Social Security Number",
              value: "123-45-6789",
              rect: { x: 0, y: 0, width: 0, height: 0 }
            }
          }],
          notApplicable: {
            id: "9442",
            name: "form1[0].Sections1-6[0].CheckBox1[0]",
            type: "PDFCheckbox",
            label: "Not Applicable",
            value: false,
            rect: { x: 0, y: 0, width: 0, height: 0 }
          },
          Acknowledgement: {
            id: "17237",
            name: "form1[0].Sections1-6[0].RadioButtonList[0]",
            type: "PDFRadioGroup",
            label: "Acknowledgement",
            value: "YES",
            rect: { x: 0, y: 0, width: 0, height: 0 }
          }
        }
      },
      section5: undefined,
      // ... other sections would be undefined
      section30: undefined,
      print: undefined
    };
    
    console.log('📊 Test data prepared:', testFormData);
    
    // Test 1: Save data
    console.log('\n🔧 Test 1: Saving form data...');
    const saveResult = await dynamicService.saveUserFormData('complete-form', testFormData);
    
    if (saveResult.success) {
      console.log('✅ Save successful:', saveResult);
    } else {
      console.error('❌ Save failed:', saveResult);
      return false;
    }
    
    // Test 2: Load data
    console.log('\n🔧 Test 2: Loading form data...');
    const loadResult = await dynamicService.loadUserFormData('complete-form');
    
    if (loadResult.success && loadResult.formData) {
      console.log('✅ Load successful:', loadResult);
      
      // Test 3: Verify data integrity
      console.log('\n🔧 Test 3: Verifying data integrity...');
      const loadedData = loadResult.formData;
      
      // Check if Section 4 data matches
      const originalSSN = testFormData.section4.section4.ssn[0].value.value;
      const loadedSSN = loadedData.section4?.section4?.ssn?.[0]?.value?.value;
      
      if (originalSSN === loadedSSN) {
        console.log('✅ Data integrity verified - SSN matches:', originalSSN);
      } else {
        console.error('❌ Data integrity failed:', { original: originalSSN, loaded: loadedSSN });
        return false;
      }
      
      // Check timestamps and metadata
      if (saveResult.timestamp && loadResult.size) {
        console.log('📊 Metadata verification:');
        console.log(`   🕒 Save timestamp: ${saveResult.timestamp}`);
        console.log(`   📊 Data size: ${loadResult.size} bytes`);
      }
      
    } else {
      console.error('❌ Load failed:', loadResult);
      return false;
    }
    
    // Test 4: Get statistics
    console.log('\n🔧 Test 4: Getting form statistics...');
    const stats = await dynamicService.getFormDataStats();
    console.log('📊 Form statistics:', stats);
    
    // Test 5: Check if data exists
    console.log('\n🔧 Test 5: Checking data existence...');
    const hasData = await dynamicService.hasFormData();
    console.log('📋 Has form data:', hasData);
    
    console.log('\n🎉 All IndexedDB persistence tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ IndexedDB persistence test failed:', error);
    return false;
  }
}

// Function to test Section 4 SSN propagation
async function testSection4SSNPropagation() {
  console.log('\n🧪 Starting Section 4 SSN Propagation Test...');
  
  try {
    // Import Section 4 functions
    const { 
      createDefaultSection4, 
      updateMainSSNAndPropagate,
      propagateSSNToAllFields,
      getAllSSNFieldIds,
      getAllSSNFieldNames
    } = await import('./api/interfaces/sections2.0/section4.ts');
    
    // Test 1: Create default section
    console.log('\n🔧 Test 1: Creating default Section 4...');
    const defaultSection4 = createDefaultSection4();
    console.log('📊 Default Section 4:', defaultSection4);
    
    // Test 2: Update main SSN and propagate
    console.log('\n🔧 Test 2: Updating main SSN and propagating...');
    const testSSN = "987-65-4321";
    const updatedSection4 = updateMainSSNAndPropagate(defaultSection4, testSSN);
    
    console.log('📊 Updated Section 4 with propagated SSN:', updatedSection4);
    
    // Test 3: Verify propagation
    console.log('\n🔧 Test 3: Verifying SSN propagation...');
    const ssnEntries = updatedSection4.section4.ssn;
    const mainSSN = ssnEntries[0]?.value?.value;
    
    console.log(`📋 Main SSN: ${mainSSN}`);
    console.log(`📋 Total SSN entries: ${ssnEntries.length}`);
    
    // Check if all entries have the same SSN
    let propagationSuccess = true;
    for (let i = 1; i < ssnEntries.length; i++) {
      const entrySSN = ssnEntries[i]?.value?.value;
      if (entrySSN !== mainSSN) {
        console.error(`❌ SSN mismatch at entry ${i}: expected ${mainSSN}, got ${entrySSN}`);
        propagationSuccess = false;
        break;
      }
    }
    
    if (propagationSuccess) {
      console.log('✅ SSN propagation successful - all fields match');
    }
    
    // Test 4: Verify field IDs and names
    console.log('\n🔧 Test 4: Verifying field mappings...');
    const allFieldIds = getAllSSNFieldIds();
    const allFieldNames = getAllSSNFieldNames();
    
    console.log(`📊 Total field IDs: ${allFieldIds.length}`);
    console.log(`📊 Total field names: ${allFieldNames.length}`);
    console.log(`📋 Sample field IDs:`, allFieldIds.slice(0, 10));
    console.log(`📋 Sample field names:`, allFieldNames.slice(0, 5));
    
    if (allFieldIds.length === 137 && allFieldNames.length === 137) {
      console.log('✅ Field mapping counts are correct (137 total fields)');
    } else {
      console.error('❌ Field mapping counts are incorrect');
      return false;
    }
    
    console.log('\n🎉 Section 4 SSN propagation tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Section 4 SSN propagation test failed:', error);
    return false;
  }
}

// Function to run all persistence tests
async function runAllPersistenceTests() {
  console.log('🚀 Starting Comprehensive Persistence Tests...');
  console.log('=' .repeat(60));
  
  const test1Result = await testIndexedDBPersistence();
  const test2Result = await testSection4SSNPropagation();
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Test Results Summary:');
  console.log(`   IndexedDB Persistence: ${test1Result ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Section 4 SSN Propagation: ${test2Result ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (test1Result && test2Result) {
    console.log('\n🎉 ALL PERSISTENCE TESTS PASSED! 🎉');
    console.log('✅ Form data should now persist properly across page refreshes');
  } else {
    console.log('\n❌ Some tests failed. Please check the implementation.');
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testIndexedDBPersistence = testIndexedDBPersistence;
  window.testSection4SSNPropagation = testSection4SSNPropagation;
  window.runAllPersistenceTests = runAllPersistenceTests;
  
  console.log('🧪 Persistence test functions available:');
  console.log('   - testIndexedDBPersistence()');
  console.log('   - testSection4SSNPropagation()');
  console.log('   - runAllPersistenceTests()');
}

export {
  testIndexedDBPersistence,
  testSection4SSNPropagation,
  runAllPersistenceTests
}; 