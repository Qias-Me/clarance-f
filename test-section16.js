/**
 * Simple test script to verify Section 16 data persistence
 * Run this in the browser console to test Section 16 functionality
 */

// Test Section 16 Data Persistence
async function testSection16DataPersistence() {
  console.log('🧪 Starting Section 16 Data Persistence Test...');
  
  try {
    // Navigate to Section 16 if not already there
    if (!window.location.href.includes('section16')) {
      console.log('📍 Navigating to Section 16...');
      window.location.href = '/startForm?section=16';
      return; // Exit and run again after navigation
    }
    
    console.log('✅ On Section 16 page');
    
    // Wait for React to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if Section 16 context is available
    const section16Elements = document.querySelectorAll('[data-testid*="section16"], [id*="section16"], input[name*="section16"]');
    console.log(`📊 Found ${section16Elements.length} Section 16 elements`);
    
    // Test field updates
    const testData = [
      { selector: 'input[name*="firstName"]', value: 'John', label: 'First Name' },
      { selector: 'input[name*="lastName"]', value: 'Doe', label: 'Last Name' },
      { selector: 'input[name*="emailAddress"]', value: 'john.doe@example.com', label: 'Email' },
      { selector: 'input[name*="phoneNumber"]', value: '555-123-4567', label: 'Phone' }
    ];
    
    let successCount = 0;
    
    for (const test of testData) {
      const element = document.querySelector(test.selector);
      if (element) {
        console.log(`🔄 Testing ${test.label} field...`);
        
        // Store original value
        const originalValue = element.value;
        
        // Update field
        element.value = test.value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Wait for React to process
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if value persisted
        if (element.value === test.value) {
          console.log(`✅ ${test.label} field updated successfully: ${test.value}`);
          successCount++;
        } else {
          console.log(`❌ ${test.label} field failed to update. Expected: ${test.value}, Got: ${element.value}`);
        }
      } else {
        console.log(`⚠️ ${test.label} field not found with selector: ${test.selector}`);
      }
    }
    
    // Check localStorage/IndexedDB for persistence
    console.log('🔍 Checking data persistence...');
    
    // Check localStorage
    const localStorageKeys = Object.keys(localStorage).filter(key => 
      key.includes('section16') || key.includes('sf86') || key.includes('form')
    );
    console.log(`📦 LocalStorage keys related to form: ${localStorageKeys.length}`);
    localStorageKeys.forEach(key => {
      console.log(`  - ${key}: ${localStorage.getItem(key)?.substring(0, 100)}...`);
    });
    
    // Check if IndexedDB is being used
    if ('indexedDB' in window) {
      console.log('🗄️ IndexedDB is available');
      
      // Try to access the SF86 database
      try {
        const dbRequest = indexedDB.open('SF86FormData');
        dbRequest.onsuccess = (event) => {
          const db = event.target.result;
          console.log(`📊 IndexedDB version: ${db.version}`);
          console.log(`📊 Object stores: ${Array.from(db.objectStoreNames).join(', ')}`);
        };
      } catch (error) {
        console.log('⚠️ Could not access IndexedDB:', error.message);
      }
    }
    
    // Summary
    console.log('\n📋 Test Summary:');
    console.log(`✅ Successful field updates: ${successCount}/${testData.length}`);
    console.log(`📦 LocalStorage entries: ${localStorageKeys.length}`);
    console.log(`🗄️ IndexedDB available: ${'indexedDB' in window ? 'Yes' : 'No'}`);
    
    if (successCount === testData.length) {
      console.log('🎉 All Section 16 tests passed!');
    } else {
      console.log('⚠️ Some Section 16 tests failed. Check the logs above.');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Check for React DevTools to verify context
function checkReactContext() {
  console.log('🔍 Checking React context availability...');
  
  if (window.React) {
    console.log('✅ React is available');
  } else {
    console.log('⚠️ React not found in global scope');
  }
  
  // Check for common React DevTools indicators
  const reactElements = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
  console.log(`📊 React elements found: ${reactElements.length}`);
  
  // Check for Section 16 specific elements
  const section16Indicators = [
    'section16',
    'people-who-know-you',
    'firstName',
    'lastName',
    'emailAddress'
  ];
  
  section16Indicators.forEach(indicator => {
    const elements = document.querySelectorAll(`[id*="${indicator}"], [name*="${indicator}"], [class*="${indicator}"]`);
    console.log(`📊 Elements with "${indicator}": ${elements.length}`);
  });
}

// Main test function
async function runSection16Tests() {
  console.log('🚀 Starting Section 16 Comprehensive Tests...');
  console.log('=' .repeat(50));
  
  checkReactContext();
  console.log('-'.repeat(30));
  await testSection16DataPersistence();
  
  console.log('=' .repeat(50));
  console.log('✅ Section 16 tests completed!');
}

// Auto-run if on Section 16 page
if (window.location.href.includes('section16') || window.location.href.includes('startForm')) {
  console.log('🎯 Section 16 test script loaded. Run runSection16Tests() to start testing.');
} else {
  console.log('📍 Navigate to Section 16 first, then run runSection16Tests()');
}

// Export for manual execution
window.runSection16Tests = runSection16Tests;
window.testSection16DataPersistence = testSection16DataPersistence;
window.checkReactContext = checkReactContext;
