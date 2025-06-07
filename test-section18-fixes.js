/**
 * Section 18 Data Persistence Fix Verification Script
 * 
 * This script tests the fixes applied to Section 18 data flow
 * Run this in the browser console while on /startForm with Section 18 active.
 */

const testSection18Fixes = {
  
  // Test 1: Verify updateField calls work correctly
  testUpdateFieldCalls() {
    console.log('\n🧪 TEST 1: updateField Function Calls');
    
    try {
      // Check if Section 18 context is available
      const section18Context = window.useSection18?.();
      if (!section18Context) {
        console.log('❌ Section 18 context not available');
        return false;
      }
      
      console.log('✅ Section 18 context available');
      console.log('📊 Context methods:', Object.keys(section18Context));
      
      // Check if updateField function exists
      if (typeof section18Context.updateField === 'function') {
        console.log('✅ updateField function available');
        
        // Test updateField call (this should trigger the new logic)
        try {
          section18Context.updateField('fullName.firstName.value', 'TestFirstName', 0, 'immediateFamily');
          console.log('✅ updateField call successful');
          return true;
        } catch (error) {
          console.error('❌ updateField call failed:', error);
          return false;
        }
      } else {
        console.log('❌ updateField function not available');
        return false;
      }
    } catch (error) {
      console.error('❌ Test 1 failed:', error);
      return false;
    }
  },

  // Test 2: Verify SF86FormContext integration
  testSF86FormContextIntegration() {
    console.log('\n🧪 TEST 2: SF86FormContext Integration');
    
    try {
      const formContext = window.sf86FormContext || window.SF86FormContext;
      if (!formContext) {
        console.log('❌ SF86FormContext not available');
        return false;
      }
      
      console.log('✅ SF86FormContext available');
      
      // Check if Section 18 is registered
      const registeredSections = formContext.registeredSections || [];
      const section18Registration = registeredSections.find(s => s.sectionId === 'section18');
      
      if (section18Registration) {
        console.log('✅ Section 18 registered with SF86FormContext');
        console.log('📊 Registration:', section18Registration);
        
        // Test updateFieldValue wrapper call
        if (section18Registration.updateFieldValue) {
          try {
            section18Registration.updateFieldValue('section18.immediateFamily[0].fullName.firstName.value', 'TestValue');
            console.log('✅ updateFieldValue wrapper call successful');
            return true;
          } catch (error) {
            console.error('❌ updateFieldValue wrapper call failed:', error);
            return false;
          }
        } else {
          console.log('❌ updateFieldValue not available in registration');
          return false;
        }
      } else {
        console.log('❌ Section 18 not registered');
        return false;
      }
    } catch (error) {
      console.error('❌ Test 2 failed:', error);
      return false;
    }
  },

  // Test 3: Simulate form input and verify data flow
  async testFormInputDataFlow() {
    console.log('\n🧪 TEST 3: Form Input Data Flow');
    
    try {
      // Find Section 18 form inputs
      const inputs = document.querySelectorAll(`
        input[placeholder*="First"],
        input[placeholder*="Last"],
        select[value*="Select relationship"]
      `);
      
      console.log(`📊 Found ${inputs.length} Section 18 inputs`);
      
      if (inputs.length === 0) {
        console.log('⚠️ No Section 18 inputs found');
        return false;
      }
      
      // Test input interaction with console monitoring
      const consoleLogs = [];
      const originalLog = console.log;
      console.log = function(...args) {
        const message = args.join(' ');
        if (message.includes('Section18') || message.includes('updateField')) {
          consoleLogs.push(message);
        }
        originalLog.apply(console, args);
      };
      
      // Interact with first input
      const firstInput = inputs[0];
      firstInput.focus();
      firstInput.value = 'TestDataFlow';
      firstInput.dispatchEvent(new Event('input', { bubbles: true }));
      firstInput.dispatchEvent(new Event('change', { bubbles: true }));
      firstInput.dispatchEvent(new Event('blur', { bubbles: true }));
      
      // Wait for events to process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Restore console.log
      console.log = originalLog;
      
      // Check if Section 18 logs were captured
      const section18Logs = consoleLogs.filter(log => 
        log.includes('Section18') && (log.includes('updateField') || log.includes('updateFieldValue'))
      );
      
      console.log(`📊 Captured ${section18Logs.length} Section 18 update logs`);
      section18Logs.forEach(log => console.log(`   🔍 ${log}`));
      
      return section18Logs.length > 0;
    } catch (error) {
      console.error('❌ Test 3 failed:', error);
      return false;
    }
  },

  // Test 4: Verify data persistence in context
  testDataPersistence() {
    console.log('\n🧪 TEST 4: Data Persistence in Context');
    
    try {
      // Access Section 18 context data
      const section18Context = window.useSection18?.();
      if (!section18Context) {
        console.log('❌ Section 18 context not available');
        return false;
      }
      
      const { section18Data } = section18Context;
      console.log('📊 Section 18 data:', section18Data);
      
      // Check if immediate family data exists
      if (section18Data?.section18?.immediateFamily) {
        const immediateFamily = section18Data.section18.immediateFamily;
        console.log(`📊 Immediate family entries: ${immediateFamily.length}`);
        
        if (immediateFamily.length > 0) {
          const firstEntry = immediateFamily[0];
          console.log('📊 First immediate family entry:', firstEntry);
          
          // Check if entry has proper field structure
          if (firstEntry.fullName && firstEntry.fullName.firstName) {
            console.log('✅ Proper field structure found');
            console.log('📊 First name field:', firstEntry.fullName.firstName);
            return true;
          } else {
            console.log('❌ Improper field structure');
            return false;
          }
        } else {
          console.log('⚠️ No immediate family entries');
          return false;
        }
      } else {
        console.log('❌ No immediate family data structure');
        return false;
      }
    } catch (error) {
      console.error('❌ Test 4 failed:', error);
      return false;
    }
  },

  // Test 5: Check IndexedDB persistence
  async testIndexedDBPersistence() {
    console.log('\n🧪 TEST 5: IndexedDB Persistence');
    
    try {
      if (!window.indexedDB) {
        console.log('❌ IndexedDB not available');
        return false;
      }
      
      return new Promise((resolve) => {
        const dbRequest = indexedDB.open('SF86FormData', 1);
        
        dbRequest.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['formData'], 'readonly');
          const store = transaction.objectStore('formData');
          
          const completeFormRequest = store.get('complete-form');
          completeFormRequest.onsuccess = () => {
            const data = completeFormRequest.result;
            
            if (data && data.section18) {
              console.log('✅ Section 18 data found in IndexedDB');
              console.log('📊 Section 18 IndexedDB data:', data.section18);
              
              // Check if data has proper structure
              if (data.section18.section18 && data.section18.section18.immediateFamily) {
                console.log('✅ Proper Section 18 structure in IndexedDB');
                resolve(true);
              } else {
                console.log('⚠️ Section 18 data structure incomplete in IndexedDB');
                resolve(false);
              }
            } else {
              console.log('❌ No Section 18 data in IndexedDB');
              resolve(false);
            }
            
            db.close();
          };
          
          completeFormRequest.onerror = () => {
            console.error('❌ Error reading IndexedDB data');
            db.close();
            resolve(false);
          };
        };
        
        dbRequest.onerror = () => {
          console.error('❌ Error opening IndexedDB');
          resolve(false);
        };
      });
    } catch (error) {
      console.error('❌ Test 5 failed:', error);
      return false;
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 === SECTION 18 FIX VERIFICATION STARTED ===\n');
    
    const results = {
      updateFieldCalls: this.testUpdateFieldCalls(),
      sf86FormContextIntegration: this.testSF86FormContextIntegration(),
      formInputDataFlow: await this.testFormInputDataFlow(),
      dataPersistence: this.testDataPersistence(),
      indexedDBPersistence: await this.testIndexedDBPersistence()
    };
    
    console.log('\n📊 === TEST RESULTS SUMMARY ===');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! Section 18 fixes are working correctly.');
    } else {
      console.log('⚠️ Some tests failed. The fixes may need additional work.');
    }
    
    return results;
  }
};

// Auto-setup when script loads
if (typeof window !== 'undefined') {
  window.testSection18Fixes = testSection18Fixes;
  console.log('🔧 Section 18 Fix Verification Tools Loaded!');
  console.log('📋 Run testSection18Fixes.runAllTests() to verify the fixes');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testSection18Fixes;
}
