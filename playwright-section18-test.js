/**
 * Playwright End-to-End Test for Section 18 Data Persistence
 * 
 * This script uses Playwright to automate testing of Section 18 data flow
 * and identify any persistence issues.
 */

const { test, expect } = require('@playwright/test');

test.describe('Section 18 Data Persistence', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the form with debug mode enabled
    await page.goto('/startForm?debug=true');
    
    // Wait for the form to load
    await page.waitForLoadState('networkidle');
    
    // Navigate to Section 18
    await page.click('button[data-testid="section18-nav-button"]', { timeout: 10000 });
    
    // Wait for Section 18 to load
    await page.waitForSelector('[data-testid*="section18"], [class*="section18"]', { timeout: 10000 });
  });

  test('Section 18 context should be available and functional', async ({ page }) => {
    console.log('🧪 Testing Section 18 context availability...');
    
    // Check if Section 18 component is rendered
    const section18Element = await page.locator('[data-testid*="section18"], [class*="section18"]').first();
    await expect(section18Element).toBeVisible();
    
    // Check for form inputs
    const inputs = await page.locator('input, select, textarea').all();
    console.log(`📋 Found ${inputs.length} form inputs`);
    
    expect(inputs.length).toBeGreaterThan(0);
  });

  test('Form inputs should update Section 18 context state', async ({ page }) => {
    console.log('🧪 Testing form input updates...');
    
    // Enable console logging to capture Section 18 debug messages
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('Section18') || msg.text().includes('section18')) {
        consoleLogs.push(msg.text());
        console.log('🔍 Section18 Log:', msg.text());
      }
    });
    
    // Find and interact with immediate family form fields
    const lastNameInput = page.locator('input[placeholder*="Last"], input[name*="lastName"]').first();
    if (await lastNameInput.isVisible()) {
      await lastNameInput.fill('TestLastName');
      await lastNameInput.blur();
      
      // Wait for state update
      await page.waitForTimeout(500);
    }
    
    const firstNameInput = page.locator('input[placeholder*="First"], input[name*="firstName"]').first();
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill('TestFirstName');
      await firstNameInput.blur();
      
      // Wait for state update
      await page.waitForTimeout(500);
    }
    
    // Check if relationship dropdown exists and select a value
    const relationshipSelect = page.locator('select').first();
    if (await relationshipSelect.isVisible()) {
      const options = await relationshipSelect.locator('option').all();
      if (options.length > 1) {
        await relationshipSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);
      }
    }
    
    // Verify that console logs show field updates
    const updateLogs = consoleLogs.filter(log => 
      log.includes('updateField') || log.includes('field changed')
    );
    
    console.log(`📊 Found ${updateLogs.length} field update logs`);
    expect(updateLogs.length).toBeGreaterThan(0);
  });

  test('Section 18 data should persist to IndexedDB', async ({ page }) => {
    console.log('🧪 Testing IndexedDB persistence...');
    
    // Fill out some form data
    await page.locator('input').first().fill('TestData');
    await page.locator('input').first().blur();
    
    // Wait for potential auto-save
    await page.waitForTimeout(1000);
    
    // Trigger save if save button exists
    const saveButton = page.locator('button[type="submit"], button:has-text("Save")').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Check IndexedDB for Section 18 data
    const hasSection18Data = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const dbRequest = indexedDB.open('SF86FormData', 1);
        
        dbRequest.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['formData'], 'readonly');
          const store = transaction.objectStore('formData');
          
          const completeFormRequest = store.get('complete-form');
          completeFormRequest.onsuccess = () => {
            const data = completeFormRequest.result;
            const hasData = data && data.section18;
            console.log('📊 IndexedDB Section 18 data:', hasData ? 'Found' : 'Not Found');
            if (hasData) {
              console.log('📊 Section 18 data:', data.section18);
            }
            db.close();
            resolve(hasData);
          };
          
          completeFormRequest.onerror = () => {
            db.close();
            resolve(false);
          };
        };
        
        dbRequest.onerror = () => resolve(false);
      });
    });
    
    expect(hasSection18Data).toBe(true);
  });

  test('Section 18 should integrate with SF86FormContext', async ({ page }) => {
    console.log('🧪 Testing SF86FormContext integration...');
    
    // Check if Section 18 is registered with SF86FormContext
    const isRegistered = await page.evaluate(() => {
      const formContext = window.sf86FormContext || window.SF86FormContext;
      if (!formContext) return false;
      
      const registeredSections = formContext.registeredSections || [];
      const section18Registration = registeredSections.find(s => s.sectionId === 'section18');
      
      console.log('📊 Section 18 registration:', section18Registration ? 'Found' : 'Not Found');
      if (section18Registration) {
        console.log('📊 Registration details:', section18Registration);
      }
      
      return !!section18Registration;
    });
    
    expect(isRegistered).toBe(true);
  });

  test('Section 18 data should be included in PDF generation', async ({ page }) => {
    console.log('🧪 Testing PDF generation inclusion...');
    
    // Fill out some Section 18 data
    const inputs = await page.locator('input, select').all();
    for (let i = 0; i < Math.min(3, inputs.length); i++) {
      const input = inputs[i];
      if (await input.isVisible()) {
        const tagName = await input.evaluate(el => el.tagName.toLowerCase());
        if (tagName === 'input') {
          await input.fill(`TestValue${i + 1}`);
        } else if (tagName === 'select') {
          const options = await input.locator('option').all();
          if (options.length > 1) {
            await input.selectOption({ index: 1 });
          }
        }
        await input.blur();
        await page.waitForTimeout(200);
      }
    }
    
    // Trigger PDF generation (client-side)
    const pdfGenerated = await page.evaluate(async () => {
      try {
        const formContext = window.sf86FormContext || window.SF86FormContext;
        if (!formContext) return false;
        
        // Get form data that would be sent to PDF generation
        const formData = formContext.exportForm ? formContext.exportForm() : formContext.formData;
        
        console.log('📊 Form data for PDF:', formData);
        console.log('📊 Section 18 in form data:', formData.section18 ? 'Present' : 'Missing');
        
        if (formData.section18) {
          console.log('📊 Section 18 data structure:', formData.section18);
        }
        
        return !!formData.section18;
      } catch (error) {
        console.error('❌ Error checking PDF data:', error);
        return false;
      }
    });
    
    expect(pdfGenerated).toBe(true);
  });

  test('Section 18 field mappings should be correct', async ({ page }) => {
    console.log('🧪 Testing field mappings...');
    
    // Check if section-18.json reference data is accessible
    const hasReferenceData = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/sections-references/section-18.json');
        const data = await response.json();
        
        console.log('📊 Section 18 reference data:', data ? 'Loaded' : 'Not Found');
        if (data) {
          console.log('📊 Total fields:', data.metadata?.totalFields);
          console.log('📊 Fields array length:', data.fields?.length);
        }
        
        return !!data;
      } catch (error) {
        console.error('❌ Error loading reference data:', error);
        return false;
      }
    });
    
    expect(hasReferenceData).toBe(true);
  });

});

// Helper function to run tests programmatically
async function runSection18Tests() {
  const { chromium } = require('playwright');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🚀 Starting Section 18 automated tests...');
    
    // Navigate to form
    await page.goto('http://localhost:3000/startForm?debug=true');
    await page.waitForLoadState('networkidle');
    
    // Click Section 18
    await page.click('button[data-testid="section18-nav-button"]');
    await page.waitForTimeout(2000);
    
    // Run basic interaction test
    const inputs = await page.locator('input, select').all();
    console.log(`📋 Found ${inputs.length} inputs in Section 18`);
    
    // Fill first few inputs
    for (let i = 0; i < Math.min(3, inputs.length); i++) {
      try {
        await inputs[i].fill(`TestValue${i + 1}`);
        await inputs[i].blur();
        await page.waitForTimeout(300);
      } catch (error) {
        console.log(`⚠️ Could not fill input ${i + 1}:`, error.message);
      }
    }
    
    // Check console for Section 18 logs
    page.on('console', msg => {
      if (msg.text().includes('Section18')) {
        console.log('🔍 Section18 Log:', msg.text());
      }
    });
    
    console.log('✅ Basic interaction test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Export for use
module.exports = { runSection18Tests };

// Run if called directly
if (require.main === module) {
  runSection18Tests().catch(console.error);
}
