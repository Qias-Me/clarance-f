/**
 * Section 2 Data Flow Test Script
 * 
 * This script tests the Section 2 data flow issue by simulating user interactions
 * and checking where the data flow breaks down during PDF generation.
 */

// Test function to be run in browser console
function testSection2DataFlow() {
  console.log('\n🔍 ===== SECTION 2 DATA FLOW TEST =====');
  
  // Step 1: Check if Section 2 context is available
  console.log('📊 Step 1: Checking Section 2 context availability...');
  
  // Try to access Section 2 through React DevTools or global context
  const section2Element = document.querySelector('[data-testid="section2-test-panel"]');
  if (!section2Element) {
    console.error('❌ Section 2 test panel not found. Make sure you are on /test route');
    return;
  }
  
  console.log('✅ Section 2 test panel found');
  
  // Step 2: Test custom actions
  console.log('📊 Step 2: Testing custom actions...');
  
  // Simulate clicking the "Fill Test Data" button
  const fillTestDataBtn = document.querySelector('[data-testid="section2-update-date-btn"]');
  if (fillTestDataBtn) {
    console.log('🔧 Clicking "Fill Test Data" button...');
    fillTestDataBtn.click();
    
    // Wait a bit for state updates
    setTimeout(() => {
      console.log('📊 Step 3: Checking data after custom actions...');
      
      // Check if date input has value
      const dateInput = document.querySelector('[data-testid="section2-date-input"]');
      if (dateInput) {
        console.log('📅 Date input value:', dateInput.value);
      }
      
      // Check if estimated checkbox is checked
      const estimatedCheckbox = document.querySelector('[data-testid="section2-estimated-checkbox"]');
      if (estimatedCheckbox) {
        console.log('☑️ Estimated checkbox checked:', estimatedCheckbox.checked);
      }
      
      // Step 4: Test data flow to SF86FormContext
      console.log('📊 Step 4: Testing data flow to SF86FormContext...');
      
      // Simulate clicking the "Test Section 2 Data Flow" button
      const testDataFlowBtn = document.querySelector('button');
      const buttons = Array.from(document.querySelectorAll('button'));
      const dataFlowBtn = buttons.find(btn => btn.textContent.includes('Test Section 2 Data Flow'));
      
      if (dataFlowBtn) {
        console.log('🔧 Clicking "Test Section 2 Data Flow" button...');
        dataFlowBtn.click();
        
        setTimeout(() => {
          console.log('📊 Step 5: Testing persistence...');
          
          // Simulate clicking the "Test Persistence" button
          const persistenceBtn = document.querySelector('[data-testid="section2-test-persistence-btn"]');
          if (persistenceBtn) {
            console.log('🔧 Clicking "Test Persistence" button...');
            persistenceBtn.click();
            
            setTimeout(() => {
              console.log('✅ Section 2 data flow test completed');
              console.log('🔍 Check the console logs above for detailed data flow information');
            }, 1000);
          }
        }, 500);
      }
    }, 500);
  } else {
    console.error('❌ Fill Test Data button not found');
  }
}

// Test function for manual data entry
function testSection2ManualEntry() {
  console.log('\n🔍 ===== SECTION 2 MANUAL ENTRY TEST =====');
  
  // Step 1: Fill date input manually
  const dateInput = document.querySelector('[data-testid="section2-date-input"]');
  if (dateInput) {
    console.log('📅 Setting date input to "01/15/1990"...');
    dateInput.value = '01/15/1990';
    dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    setTimeout(() => {
      console.log('📅 Date input value after change:', dateInput.value);
      
      // Step 2: Check estimated checkbox
      const estimatedCheckbox = document.querySelector('[data-testid="section2-estimated-checkbox"]');
      if (estimatedCheckbox) {
        console.log('☑️ Checking estimated checkbox...');
        estimatedCheckbox.checked = true;
        estimatedCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        
        setTimeout(() => {
          console.log('☑️ Estimated checkbox checked:', estimatedCheckbox.checked);
          console.log('✅ Manual entry test completed');
        }, 200);
      }
    }, 200);
  }
}

// Export functions for browser console use
if (typeof window !== 'undefined') {
  window.testSection2DataFlow = testSection2DataFlow;
  window.testSection2ManualEntry = testSection2ManualEntry;
  
  console.log('🔧 Section 2 test functions loaded:');
  console.log('   - testSection2DataFlow()');
  console.log('   - testSection2ManualEntry()');
  console.log('📝 Navigate to /test route and run these functions in browser console');
}
