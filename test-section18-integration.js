/**
 * Section 18 Integration Test Script
 * 
 * This script tests the complete data flow for Section 18 to identify
 * and fix any persistence issues.
 * 
 * Run this in the browser console while on /startForm with Section 18 active.
 */

// Test utilities for Section 18
const testSection18Integration = {
  
  // Test 1: Verify Section 18 Context is Available
  testContextAvailability() {
    console.log('\n🧪 TEST 1: Section 18 Context Availability');
    
    try {
      // Check if we can access the Section 18 context
      const section18Element = document.querySelector('[data-testid*="section18"], [class*="section18"]');
      console.log('📋 Section 18 DOM Element:', section18Element ? '✅ Found' : '❌ Not Found');
      
      // Check for React DevTools
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('📋 React DevTools:', '✅ Available');
      } else {
        console.log('📋 React DevTools:', '❌ Not Available');
      }
      
      return section18Element !== null;
    } catch (error) {
      console.error('❌ Context availability test failed:', error);
      return false;
    }
  },

  // Test 2: Simulate Form Input and Check State Updates
  testFormInputUpdates() {
    console.log('\n🧪 TEST 2: Form Input Updates');
    
    try {
      // Find Section 18 form inputs
      const inputs = document.querySelectorAll(`
        input[name*="section18"],
        input[data-section="18"],
        select[name*="section18"],
        textarea[name*="section18"],
        input[placeholder*="Last name"],
        input[placeholder*="First name"],
        select[value*="Select relationship"]
      `);
      
      console.log(`📋 Found ${inputs.length} potential Section 18 inputs`);
      
      if (inputs.length === 0) {
        console.log('⚠️ No Section 18 inputs found. Trying alternative selectors...');
        
        // Try broader selectors
        const allInputs = document.querySelectorAll('input, select, textarea');
        const section18Inputs = Array.from(allInputs).filter(input => {
          const parent = input.closest('[data-testid*="section18"], [class*="section18"], [id*="section18"]');
          return parent !== null;
        });
        
        console.log(`📋 Found ${section18Inputs.length} inputs in Section 18 containers`);
        
        if (section18Inputs.length > 0) {
          return this.testInputInteraction(section18Inputs);
        } else {
          console.log('❌ No Section 18 inputs found with any method');
          return false;
        }
      }
      
      return this.testInputInteraction(Array.from(inputs));
    } catch (error) {
      console.error('❌ Form input test failed:', error);
      return false;
    }
  },

  // Helper: Test input interaction
  testInputInteraction(inputs) {
    console.log(`🔧 Testing interaction with ${inputs.length} inputs...`);
    
    let successCount = 0;
    
    inputs.forEach((input, index) => {
      try {
        const testValue = `TestValue${index + 1}`;
        const originalValue = input.value;
        
        console.log(`   [${index + 1}] Testing input:`, {
          type: input.type,
          name: input.name,
          id: input.id,
          className: input.className,
          originalValue
        });
        
        // Focus and set value
        input.focus();
        
        if (input.type === 'select-one') {
          // For select elements, choose the first non-empty option
          const options = input.querySelectorAll('option[value]:not([value=""])');
          if (options.length > 0) {
            input.value = options[0].value;
          }
        } else {
          input.value = testValue;
        }
        
        // Trigger events
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true }));
        
        console.log(`   [${index + 1}] ✅ Set value to: ${input.value}`);
        successCount++;
        
      } catch (error) {
        console.error(`   [${index + 1}] ❌ Error:`, error);
      }
    });
    
    console.log(`📊 Successfully updated ${successCount}/${inputs.length} inputs`);
    return successCount > 0;
  },

  // Test 3: Check IndexedDB Persistence
  async testIndexedDBPersistence() {
    console.log('\n🧪 TEST 3: IndexedDB Persistence');
    
    try {
      if (!window.indexedDB) {
        console.log('❌ IndexedDB not available');
        return false;
      }
      
      return new Promise((resolve) => {
        const dbRequest = indexedDB.open('SF86FormData', 1);
        
        dbRequest.onsuccess = (event) => {
          const db = event.target.result;
          console.log('✅ IndexedDB connection successful');
          
          const transaction = db.transaction(['formData'], 'readonly');
          const store = transaction.objectStore('formData');
          
          // Check for Section 18 data
          const requests = [
            store.get('complete-form'),
            store.get('section-section18')
          ];
          
          let completedRequests = 0;
          let hasSection18Data = false;
          
          requests.forEach((request, index) => {
            request.onsuccess = () => {
              completedRequests++;
              const data = request.result;
              
              if (index === 0 && data && data.section18) {
                console.log('✅ Section 18 found in complete form data');
                console.log('   📊 Section 18 data:', data.section18);
                hasSection18Data = true;
              } else if (index === 1 && data) {
                console.log('✅ Individual Section 18 data found');
                console.log('   📊 Individual data:', data);
                hasSection18Data = true;
              }
              
              if (completedRequests === requests.length) {
                if (!hasSection18Data) {
                  console.log('⚠️ No Section 18 data found in IndexedDB');
                }
                db.close();
                resolve(hasSection18Data);
              }
            };
            
            request.onerror = () => {
              completedRequests++;
              console.error(`❌ Error reading ${index === 0 ? 'complete form' : 'individual section'} data`);
              
              if (completedRequests === requests.length) {
                db.close();
                resolve(hasSection18Data);
              }
            };
          });
        };
        
        dbRequest.onerror = () => {
          console.error('❌ IndexedDB connection failed');
          resolve(false);
        };
      });
    } catch (error) {
      console.error('❌ IndexedDB test failed:', error);
      return false;
    }
  },

  // Test 4: Check SF86FormContext Integration
  testSF86FormContextIntegration() {
    console.log('\n🧪 TEST 4: SF86FormContext Integration');
    
    try {
      // Try to access the global form context
      const formContext = window.sf86FormContext || window.SF86FormContext;
      
      if (!formContext) {
        console.log('❌ SF86FormContext not accessible globally');
        return false;
      }
      
      console.log('✅ SF86FormContext accessible');
      
      // Check registered sections
      const registeredSections = formContext.registeredSections || [];
      const section18Registration = registeredSections.find(s => s.sectionId === 'section18');
      
      if (section18Registration) {
        console.log('✅ Section 18 is registered with SF86FormContext');
        console.log('   📊 Registration details:', section18Registration);
        
        // Check if section has data
        const section18Data = formContext.getSectionData ? formContext.getSectionData('section18') : null;
        if (section18Data) {
          console.log('✅ Section 18 data available in SF86FormContext');
          console.log('   📊 Data:', section18Data);
        } else {
          console.log('⚠️ Section 18 registered but no data available');
        }
        
        return true;
      } else {
        console.log('❌ Section 18 not registered with SF86FormContext');
        console.log('   📊 Registered sections:', registeredSections.map(s => s.sectionId));
        return false;
      }
    } catch (error) {
      console.error('❌ SF86FormContext integration test failed:', error);
      return false;
    }
  },

  // Test 5: Trigger Save and Verify Persistence
  async testSaveAndPersistence() {
    console.log('\n🧪 TEST 5: Save and Persistence');
    
    try {
      // Look for save button
      const saveButton = document.querySelector(`
        button[type="submit"],
        button[data-testid*="save"],
        button[class*="save"],
        button:contains("Save")
      `);
      
      if (saveButton) {
        console.log('✅ Save button found, triggering save...');
        saveButton.click();
        
        // Wait a moment for save to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if data was persisted
        return await this.testIndexedDBPersistence();
      } else {
        console.log('⚠️ No save button found, trying programmatic save...');
        
        // Try to trigger save programmatically
        const formContext = window.sf86FormContext || window.SF86FormContext;
        if (formContext && formContext.saveForm) {
          await formContext.saveForm();
          console.log('✅ Programmatic save triggered');
          
          // Wait and check persistence
          await new Promise(resolve => setTimeout(resolve, 1000));
          return await this.testIndexedDBPersistence();
        } else {
          console.log('❌ No save method available');
          return false;
        }
      }
    } catch (error) {
      console.error('❌ Save and persistence test failed:', error);
      return false;
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 === SECTION 18 INTEGRATION TESTING STARTED ===\n');
    
    const results = {
      contextAvailability: this.testContextAvailability(),
      formInputUpdates: this.testFormInputUpdates(),
      indexedDBPersistence: await this.testIndexedDBPersistence(),
      sf86FormContextIntegration: this.testSF86FormContextIntegration(),
      saveAndPersistence: await this.testSaveAndPersistence()
    };
    
    console.log('\n📊 === TEST RESULTS SUMMARY ===');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! Section 18 integration is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Check the detailed logs above for issues.');
    }
    
    return results;
  }
};

// Auto-setup when script loads
if (typeof window !== 'undefined') {
  window.testSection18Integration = testSection18Integration;
  console.log('🔧 Section 18 Integration Test Tools Loaded!');
  console.log('📋 Run testSection18Integration.runAllTests() to start comprehensive testing');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testSection18Integration;
}
