/**
 * Manual Section 29 Field Mapping Test Script
 * 
 * This script can be run in the browser console to test Section 29 field mapping
 * Navigate to http://localhost:5173/startForm and run this in the console
 */

console.log('🚀 Starting Section 29 Field Mapping Test...');

// Test results object
const testResults = {
  componentLoaded: false,
  subsectionTabsFound: 0,
  flagFieldsWorking: false,
  entryCreationWorking: false,
  fieldMappingCorrect: false,
  pdfFieldIdsValid: false
};

// Helper function to wait for element
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

// Helper function to simulate click
function simulateClick(element) {
  const event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  element.dispatchEvent(event);
}

// Helper function to simulate input change
function simulateInputChange(element, value) {
  element.value = value;
  const event = new Event('change', { bubbles: true });
  element.dispatchEvent(event);
}

// Main test function
async function runSection29Tests() {
  try {
    console.log('📍 Step 1: Looking for Section 29 button...');
    
    // Find and click Section 29 button
    const section29Button = await waitForElement('[data-testid="section-section29-button"]');
    if (section29Button) {
      console.log('✓ Section 29 button found');
      simulateClick(section29Button);
      
      // Wait for Section 29 component to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('📍 Step 2: Checking if Section 29 component loaded...');
      const section29Form = document.querySelector('[data-testid="section29-form"]');
      
      if (section29Form) {
        console.log('✓ Section 29 component loaded successfully');
        testResults.componentLoaded = true;
        
        // Check for main header
        const header = document.querySelector('h2:contains("Section 29: Association Record")') || 
                      document.querySelector('h2[text*="Section 29"]') ||
                      Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Section 29'));
        
        if (header) {
          console.log('✓ Section 29 header found:', header.textContent);
        }
        
        console.log('📍 Step 3: Checking subsection tabs...');
        
        // Check for subsection tabs
        const expectedTabs = [
          '29.1 Terrorism Organizations',
          '29.2 Terrorism Activities',
          '29.3 Violent Overthrow Organizations',
          '29.4 Violence/Force Organizations',
          '29.5 Overthrow Activities & Associations'
        ];
        
        let tabsFound = 0;
        for (const tabText of expectedTabs) {
          const tab = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent.includes(tabText) || btn.textContent.includes(tabText.replace('29.', ''))
          );
          if (tab) {
            console.log(`✓ Found tab: ${tabText}`);
            tabsFound++;
          } else {
            console.log(`✗ Missing tab: ${tabText}`);
          }
        }
        
        testResults.subsectionTabsFound = tabsFound;
        console.log(`Found ${tabsFound}/5 subsection tabs`);
        
        console.log('📍 Step 4: Testing first subsection functionality...');
        
        // Test first subsection (Terrorism Organizations)
        const firstTab = Array.from(document.querySelectorAll('button')).find(btn => 
          btn.textContent.includes('29.1') || btn.textContent.includes('Terrorism Organizations')
        );
        
        if (firstTab) {
          simulateClick(firstTab);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check for Yes/No radio buttons
          const yesRadio = document.querySelector('input[name="terrorismOrganizations-flag"][value="YES"]');
          const noRadio = document.querySelector('input[name="terrorismOrganizations-flag"][value="NO"]');
          
          if (yesRadio && noRadio) {
            console.log('✓ Yes/No radio buttons found');
            testResults.flagFieldsWorking = true;
            
            // Test selecting Yes
            simulateClick(yesRadio);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Look for Add Organization button
            const addButton = document.querySelector('[data-testid="add-terrorismOrganizations-entry"]');
            if (addButton) {
              console.log('✓ Add Organization button appears when Yes is selected');
              
              // Test adding an entry
              simulateClick(addButton);
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Check if entry was added
              const entryCard = Array.from(document.querySelectorAll('*')).find(el => 
                el.textContent && el.textContent.includes('Organization 1')
              );
              
              if (entryCard) {
                console.log('✓ Organization entry added successfully');
                testResults.entryCreationWorking = true;
              } else {
                console.log('✗ Organization entry was not added');
              }
            } else {
              console.log('✗ Add Organization button not found');
            }
          } else {
            console.log('✗ Yes/No radio buttons not found');
          }
        }
        
        console.log('📍 Step 5: Checking PDF Field Mapping Summary...');
        
        // Check PDF Field Mapping Summary
        const summarySection = Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent && el.textContent.includes('PDF Field Mapping Summary')
        );
        
        if (summarySection) {
          console.log('✓ PDF Field Mapping Summary section found');
          
          // Get the flag field ID
          const flagFieldElement = Array.from(summarySection.querySelectorAll('*')).find(el => 
            el.textContent && el.textContent.includes('Flag Field:')
          );
          
          if (flagFieldElement) {
            const flagFieldText = flagFieldElement.textContent;
            console.log('Flag Field ID:', flagFieldText);
            
            if (flagFieldText.includes('form1[0].Section29')) {
              console.log('✓ Flag field ID follows correct PDF pattern');
              testResults.pdfFieldIdsValid = true;
            } else {
              console.log('✗ Flag field ID does not follow expected pattern');
            }
          }
          
          testResults.fieldMappingCorrect = true;
        } else {
          console.log('✗ PDF Field Mapping Summary section not found');
        }
        
      } else {
        console.log('✗ Section 29 component did not load');
        
        // List available elements for debugging
        const allTestIds = Array.from(document.querySelectorAll('[data-testid]')).map(el => el.getAttribute('data-testid'));
        console.log('Available test IDs:', allTestIds);
      }
      
    } else {
      console.log('✗ Section 29 button not found');
      
      // List all available buttons for debugging
      const allButtons = Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()).filter(Boolean);
      console.log('Available buttons:', allButtons.slice(0, 10));
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
  
  // Print final results
  console.log('\n📊 FINAL TEST RESULTS:');
  console.log('='.repeat(50));
  Object.entries(testResults).forEach(([key, value]) => {
    const status = typeof value === 'boolean' ? (value ? '✓' : '✗') : value;
    console.log(`${key}: ${status}`);
  });
  console.log('='.repeat(50));
  
  return testResults;
}

// Auto-run the test
runSection29Tests().then(results => {
  console.log('🎉 Section 29 field mapping test completed!');
  
  // Calculate success rate
  const booleanResults = Object.values(results).filter(v => typeof v === 'boolean');
  const successCount = booleanResults.filter(Boolean).length;
  const successRate = (successCount / booleanResults.length) * 100;
  
  console.log(`📈 Success Rate: ${successRate.toFixed(1)}% (${successCount}/${booleanResults.length} tests passed)`);
  
  if (successRate >= 80) {
    console.log('🎯 Section 29 field mapping is working correctly!');
  } else {
    console.log('⚠️ Section 29 field mapping needs attention');
  }
}).catch(error => {
  console.error('💥 Test execution failed:', error);
});
