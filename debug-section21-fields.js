// Debug Section 21 field update issues
console.log('🔍 ===== SECTION 21 FIELD DEBUG ANALYSIS =====');

// Step 1: Navigate to Section 21
console.log('📍 Step 1: Navigating to Section 21...');
const section21Button = document.querySelector('[data-testid="section-section21-nav-button"]');
if (section21Button) {
  console.log('✅ Section 21 button found');
  section21Button.click();
  
  setTimeout(() => {
    console.log('📍 Step 2: Analyzing Section 21 form structure...');
    
    // Check for Section 21 form elements
    const section21Container = document.querySelector('[data-testid*="section21"], .section21, #section21');
    if (section21Container) {
      console.log('✅ Section 21 container found:', section21Container.className);
      
      // Find all input fields in Section 21
      const inputFields = section21Container.querySelectorAll('input, textarea, select');
      console.log('📊 Total input fields found:', inputFields.length);
      
      inputFields.forEach((field, index) => {
        console.log(`Field ${index}:`, {
          type: field.type,
          name: field.name,
          id: field.id,
          value: field.value,
          placeholder: field.placeholder,
          className: field.className
        });
      });
      
      // Step 3: Test field updates
      console.log('📍 Step 3: Testing field updates...');
      
      if (inputFields.length > 0) {
        const testField = inputFields[0];
        console.log('🧪 Testing field update on:', testField.name || testField.id);
        
        // Add event listeners to track changes
        testField.addEventListener('input', (e) => {
          console.log('🔄 Input event fired:', {
            fieldName: e.target.name,
            fieldId: e.target.id,
            newValue: e.target.value,
            timestamp: new Date().toISOString()
          });
        });
        
        testField.addEventListener('change', (e) => {
          console.log('🔄 Change event fired:', {
            fieldName: e.target.name,
            fieldId: e.target.id,
            newValue: e.target.value,
            timestamp: new Date().toISOString()
          });
        });
        
        // Simulate user input
        testField.focus();
        testField.value = 'TEST_VALUE_' + Date.now();
        testField.dispatchEvent(new Event('input', { bubbles: true }));
        testField.dispatchEvent(new Event('change', { bubbles: true }));
        
        console.log('🧪 Test input dispatched, checking field value after 1 second...');
        
        setTimeout(() => {
          console.log('📊 Field value after test:', {
            fieldValue: testField.value,
            expectedValue: 'TEST_VALUE_' + (Date.now() - 1000),
            valueMatches: testField.value.includes('TEST_VALUE_')
          });
          
          // Step 4: Check React context state
          console.log('📍 Step 4: Checking React context state...');
          
          // Try to access React DevTools
          if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            console.log('✅ React DevTools available');
            
            // Look for Section 21 context in React fiber
            const rootElement = document.querySelector('#root');
            if (rootElement && rootElement._reactInternalFiber) {
              console.log('✅ React fiber found, analyzing context...');
              
              // This is a simplified way to check for context
              // In a real scenario, we'd need more sophisticated React DevTools integration
              console.log('🔍 React fiber structure available for analysis');
            }
          }
          
          // Step 5: Check for console errors related to Section 21
          console.log('📍 Step 5: Checking for Section 21 related errors...');
          
          // Monitor for any new console errors
          const originalError = console.error;
          console.error = function(...args) {
            if (args.some(arg => String(arg).toLowerCase().includes('section21'))) {
              console.log('🚨 Section 21 related error detected:', args);
            }
            originalError.apply(console, args);
          };
          
        }, 1000);
        
      } else {
        console.log('❌ No input fields found in Section 21');
      }
      
    } else {
      console.log('❌ Section 21 container not found');
      
      // Check what's actually rendered
      const allSections = document.querySelectorAll('[data-testid*="section"], .section, [id*="section"]');
      console.log('📊 All section elements found:', allSections.length);
      allSections.forEach((section, index) => {
        console.log(`Section ${index}:`, {
          testId: section.getAttribute('data-testid'),
          className: section.className,
          id: section.id
        });
      });
    }
    
  }, 1000);
  
} else {
  console.log('❌ Section 21 button not found');
  
  // Check all available navigation buttons
  const allNavButtons = document.querySelectorAll('[data-testid*="section"][data-testid*="nav-button"]');
  console.log('📊 All navigation buttons found:', allNavButtons.length);
  allNavButtons.forEach((button, index) => {
    console.log(`Nav button ${index}:`, {
      testId: button.getAttribute('data-testid'),
      text: button.textContent,
      className: button.className
    });
  });
}

// Step 6: Monitor for Section 21 context logs
console.log('📍 Step 6: Monitoring for Section 21 context logs...');

// Override console.log to catch Section 21 related logs
const originalLog = console.log;
console.log = function(...args) {
  if (args.some(arg => String(arg).includes('Section21') || String(arg).includes('section21'))) {
    originalLog('🔍 SECTION21 LOG DETECTED:', ...args);
  }
  originalLog.apply(console, args);
};

console.log('✅ Section 21 debug monitoring active');
