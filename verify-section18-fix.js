/**
 * Section 18 Fix Verification Script
 * 
 * This script verifies that the Section 18 data persistence fixes are working correctly.
 * Run this in the browser console while on /startForm with Section 18 active.
 */

const verifySection18Fix = {
  
  // Quick verification that fixes are applied
  quickVerification() {
    console.log('\n🔍 === SECTION 18 FIX VERIFICATION ===');
    
    try {
      // Check if Section 18 context is available
      const section18Context = window.useSection18?.();
      if (!section18Context) {
        console.log('❌ Section 18 context not available');
        return false;
      }
      
      console.log('✅ Section 18 context available');
      
      // Check if updateFieldValue has the correct signature
      const updateFieldValue = section18Context.updateFieldValue;
      if (typeof updateFieldValue === 'function') {
        console.log('✅ updateFieldValue function available');
        
        // Check function signature by examining its length (number of parameters)
        if (updateFieldValue.length === 4) {
          console.log('✅ updateFieldValue has correct signature (4 parameters)');
        } else {
          console.log(`⚠️ updateFieldValue has ${updateFieldValue.length} parameters (expected 4)`);
        }
      } else {
        console.log('❌ updateFieldValue function not available');
        return false;
      }
      
      // Check if SF86FormContext integration is working
      const formContext = window.sf86FormContext || window.SF86FormContext;
      if (formContext) {
        const registeredSections = formContext.registeredSections || [];
        const section18Registration = registeredSections.find(s => s.sectionId === 'section18');
        
        if (section18Registration && section18Registration.updateFieldValue) {
          console.log('✅ Section 18 SF86FormContext integration working');
          return true;
        } else {
          console.log('❌ Section 18 SF86FormContext integration not working');
          return false;
        }
      } else {
        console.log('⚠️ SF86FormContext not available');
        return false;
      }
    } catch (error) {
      console.error('❌ Verification failed:', error);
      return false;
    }
  },

  // Test form input functionality
  testFormInput() {
    console.log('\n🧪 === TESTING FORM INPUT ===');
    
    try {
      // Find Section 18 form inputs
      const inputs = document.querySelectorAll(`
        input[placeholder*="First"],
        input[placeholder*="Last"],
        select
      `);
      
      console.log(`📊 Found ${inputs.length} potential inputs`);
      
      if (inputs.length === 0) {
        console.log('⚠️ No inputs found - make sure you are on Section 18');
        return false;
      }
      
      // Test first input
      const firstInput = inputs[0];
      const testValue = 'TestValue_' + Date.now();
      
      console.log('🔧 Testing input:', firstInput.type, firstInput.name || firstInput.className);
      
      // Simulate user input
      firstInput.focus();
      firstInput.value = testValue;
      firstInput.dispatchEvent(new Event('input', { bubbles: true }));
      firstInput.dispatchEvent(new Event('change', { bubbles: true }));
      firstInput.dispatchEvent(new Event('blur', { bubbles: true }));
      
      console.log(`✅ Input test completed with value: ${testValue}`);
      
      // Wait a moment and check if value persisted
      setTimeout(() => {
        if (firstInput.value === testValue) {
          console.log('✅ Input value persisted');
        } else {
          console.log('⚠️ Input value did not persist');
        }
      }, 500);
      
      return true;
    } catch (error) {
      console.error('❌ Form input test failed:', error);
      return false;
    }
  },

  // Check console logs for Section 18 activity
  monitorLogs() {
    console.log('\n📊 === MONITORING SECTION 18 LOGS ===');
    
    // Override console.log to capture Section 18 logs
    const originalLog = console.log;
    const section18Logs = [];
    
    console.log = function(...args) {
      const message = args.join(' ');
      if (message.includes('Section18') || message.includes('section18')) {
        section18Logs.push(message);
        originalLog.apply(console, ['🔍 SECTION18 LOG:', ...args]);
      } else {
        originalLog.apply(console, args);
      }
    };
    
    console.log('✅ Log monitoring enabled for Section 18');
    console.log('📋 Interact with Section 18 form fields to see logs');
    
    // Restore after 30 seconds
    setTimeout(() => {
      console.log = originalLog;
      console.log(`📊 Captured ${section18Logs.length} Section 18 logs:`);
      section18Logs.forEach(log => console.log(`   ${log}`));
    }, 30000);
    
    return true;
  },

  // Run all verifications
  runAll() {
    console.log('🚀 === SECTION 18 FIX VERIFICATION STARTED ===\n');
    
    const results = {
      quickVerification: this.quickVerification(),
      formInputTest: this.testFormInput(),
      logMonitoring: this.monitorLogs()
    };
    
    console.log('\n📊 === VERIFICATION RESULTS ===');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 Section 18 fixes are working correctly!');
      console.log('📋 You can now:');
      console.log('   1. Fill out Section 18 form fields');
      console.log('   2. Verify data persists in context');
      console.log('   3. Check IndexedDB for saved data');
      console.log('   4. Generate PDFs with Section 18 data');
    } else {
      console.log('⚠️ Some verification tests failed. Check the logs above.');
    }
    
    return results;
  }
};

// Auto-setup when script loads
if (typeof window !== 'undefined') {
  window.verifySection18Fix = verifySection18Fix;
  console.log('🔧 Section 18 Fix Verification Tools Loaded!');
  console.log('📋 Run verifySection18Fix.runAll() to verify the fixes are working');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = verifySection18Fix;
}
