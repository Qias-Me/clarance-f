/**
 * Section 18 Data Flow Debugging Script
 * 
 * This script provides comprehensive debugging for Section 18 data persistence issues.
 * Run this in the browser console while on /startForm with Section 18 active.
 */

// Enable debug mode
if (typeof window !== 'undefined') {
  const url = new URL(window.location);
  url.searchParams.set('debug', 'true');
  if (window.location.search !== url.search) {
    console.log('🔧 Enabling debug mode...');
    window.location.href = url.toString();
  }
}

// Debug utilities
const debugSection18 = {
  
  // 1. Check Section 18 Context Registration
  checkContextRegistration() {
    console.log('\n🔍 === SECTION 18 CONTEXT REGISTRATION CHECK ===');
    
    // Check if Section 18 context is available
    try {
      const section18Context = window.React?.useContext?.(window.Section18Context);
      console.log('📋 Section 18 Context:', section18Context ? '✅ Available' : '❌ Not Found');
    } catch (error) {
      console.log('📋 Section 18 Context: ❌ Error accessing context:', error.message);
    }
    
    // Check SF86FormContext registration
    try {
      const sf86Context = window.sf86FormContext || window.SF86FormContext;
      if (sf86Context) {
        const registeredSections = sf86Context.registeredSections || [];
        const section18Registration = registeredSections.find(s => s.sectionId === 'section18');
        console.log('📋 SF86 Context Registration:', section18Registration ? '✅ Registered' : '❌ Not Registered');
        if (section18Registration) {
          console.log('   📊 Registration Details:', section18Registration);
        }
      } else {
        console.log('📋 SF86 Context: ❌ Not Found');
      }
    } catch (error) {
      console.log('📋 SF86 Context: ❌ Error accessing context:', error.message);
    }
  },

  // 2. Check Section 18 Component Mounting
  checkComponentMounting() {
    console.log('\n🔍 === SECTION 18 COMPONENT MOUNTING CHECK ===');
    
    // Check if Section 18 component is in DOM
    const section18Elements = document.querySelectorAll('[data-testid*="section18"], [class*="section18"], [id*="section18"]');
    console.log('📋 Section 18 DOM Elements:', section18Elements.length > 0 ? `✅ Found ${section18Elements.length} elements` : '❌ Not Found');
    
    if (section18Elements.length > 0) {
      section18Elements.forEach((el, index) => {
        console.log(`   [${index + 1}] Element:`, el.tagName, el.className, el.id);
      });
    }
    
    // Check for Section 18 form inputs
    const section18Inputs = document.querySelectorAll('input[name*="section18"], input[data-section="18"], select[name*="section18"], textarea[name*="section18"]');
    console.log('📋 Section 18 Form Inputs:', section18Inputs.length > 0 ? `✅ Found ${section18Inputs.length} inputs` : '❌ Not Found');
    
    if (section18Inputs.length > 0) {
      section18Inputs.forEach((input, index) => {
        console.log(`   [${index + 1}] Input:`, input.type, input.name, input.value);
      });
    }
  },

  // 3. Check Field Mapping and PDF Integration
  checkFieldMapping() {
    console.log('\n🔍 === SECTION 18 FIELD MAPPING CHECK ===');
    
    // Check if section-18.json is loaded
    try {
      fetch('/api/sections-references/section-18.json')
        .then(response => response.json())
        .then(data => {
          console.log('📋 Section 18 Reference Data:', data ? '✅ Loaded' : '❌ Not Found');
          if (data) {
            console.log('   📊 Total Fields:', data.metadata?.totalFields || 'Unknown');
            console.log('   📊 Subsection Count:', data.metadata?.subsectionCount || 'Unknown');
            console.log('   📊 Entry Count:', data.metadata?.entryCount || 'Unknown');
            console.log('   📊 Fields Array Length:', data.fields?.length || 'Unknown');
          }
        })
        .catch(error => {
          console.log('📋 Section 18 Reference Data: ❌ Error loading:', error.message);
        });
    } catch (error) {
      console.log('📋 Section 18 Reference Data: ❌ Error:', error.message);
    }
  },

  // 4. Check IndexedDB Storage
  async checkIndexedDBStorage() {
    console.log('\n🔍 === SECTION 18 INDEXEDDB STORAGE CHECK ===');
    
    try {
      // Check if IndexedDB is available
      if (!window.indexedDB) {
        console.log('📋 IndexedDB: ❌ Not Available');
        return;
      }
      
      console.log('📋 IndexedDB: ✅ Available');
      
      // Try to open the database
      const dbRequest = indexedDB.open('SF86FormData', 1);
      
      dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        console.log('📋 SF86FormData Database: ✅ Opened Successfully');
        
        // Check for Section 18 data
        const transaction = db.transaction(['formData'], 'readonly');
        const store = transaction.objectStore('formData');
        
        // Check for complete form data
        const completeFormRequest = store.get('complete-form');
        completeFormRequest.onsuccess = () => {
          const completeForm = completeFormRequest.result;
          if (completeForm && completeForm.section18) {
            console.log('📋 Section 18 in Complete Form: ✅ Found');
            console.log('   📊 Section 18 Data:', completeForm.section18);
          } else {
            console.log('📋 Section 18 in Complete Form: ❌ Not Found');
          }
        };
        
        // Check for individual section data
        const sectionRequest = store.get('section-section18');
        sectionRequest.onsuccess = () => {
          const sectionData = sectionRequest.result;
          if (sectionData) {
            console.log('📋 Individual Section 18 Data: ✅ Found');
            console.log('   📊 Section Data:', sectionData);
          } else {
            console.log('📋 Individual Section 18 Data: ❌ Not Found');
          }
        };
        
        db.close();
      };
      
      dbRequest.onerror = (event) => {
        console.log('📋 SF86FormData Database: ❌ Error opening:', event.target.error);
      };
      
    } catch (error) {
      console.log('📋 IndexedDB Check: ❌ Error:', error.message);
    }
  },

  // 5. Test Form Input Simulation
  simulateFormInput() {
    console.log('\n🔍 === SECTION 18 FORM INPUT SIMULATION ===');
    
    // Find Section 18 inputs and simulate user input
    const section18Inputs = document.querySelectorAll('input[name*="section18"], input[data-section="18"], select[name*="section18"], textarea[name*="section18"]');
    
    if (section18Inputs.length === 0) {
      console.log('📋 Form Input Simulation: ❌ No Section 18 inputs found');
      return;
    }
    
    console.log('📋 Form Input Simulation: ✅ Starting simulation...');
    
    section18Inputs.forEach((input, index) => {
      const testValue = `Test Value ${index + 1}`;
      console.log(`   [${index + 1}] Testing input:`, input.name, input.type);
      
      // Simulate user input
      input.focus();
      input.value = testValue;
      
      // Trigger events
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      
      console.log(`   [${index + 1}] Set value to:`, testValue);
    });
    
    // Wait and check if values persisted
    setTimeout(() => {
      console.log('\n📋 Checking if values persisted after 2 seconds...');
      section18Inputs.forEach((input, index) => {
        console.log(`   [${index + 1}] Current value:`, input.value);
      });
    }, 2000);
  },

  // 6. Monitor Context Updates
  monitorContextUpdates() {
    console.log('\n🔍 === SECTION 18 CONTEXT UPDATE MONITORING ===');
    
    // Override console.log to capture Section 18 related logs
    const originalLog = console.log;
    console.log = function(...args) {
      const message = args.join(' ');
      if (message.includes('section18') || message.includes('Section 18')) {
        originalLog.apply(console, ['🔍 SECTION 18 LOG:', ...args]);
      } else {
        originalLog.apply(console, args);
      }
    };
    
    console.log('📋 Context Update Monitoring: ✅ Enabled (watching for section18 logs)');
  },

  // 7. Run All Checks
  async runAllChecks() {
    console.log('🚀 === COMPREHENSIVE SECTION 18 DEBUGGING STARTED ===\n');
    
    this.checkContextRegistration();
    this.checkComponentMounting();
    this.checkFieldMapping();
    await this.checkIndexedDBStorage();
    this.monitorContextUpdates();
    
    console.log('\n✅ === COMPREHENSIVE SECTION 18 DEBUGGING COMPLETED ===');
    console.log('📋 Next Steps:');
    console.log('   1. Navigate to Section 18 if not already there');
    console.log('   2. Run debugSection18.simulateFormInput() to test form inputs');
    console.log('   3. Check browser console for section18 related logs');
    console.log('   4. Check Network tab for API calls');
    console.log('   5. Check Application tab > IndexedDB for data persistence');
  }
};

// Auto-run if script is executed directly
if (typeof window !== 'undefined') {
  window.debugSection18 = debugSection18;
  console.log('🔧 Section 18 Debug Tools Loaded!');
  console.log('📋 Run debugSection18.runAllChecks() to start comprehensive debugging');
  console.log('📋 Run debugSection18.simulateFormInput() to test form inputs');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = debugSection18;
}
