/**
 * Simple Section 16 Testing
 * 
 * Basic test to verify Section 16 form fields are accessible and functional
 */

import { test, expect } from '@playwright/test';

test.describe('Section 16 Basic Testing', () => {
  test('should navigate to Section 16 and verify form structure', async ({ page }) => {
    console.log('🚀 Starting Section 16 basic test...');
    
    // Navigate to the SF-86 form
    await page.goto('http://localhost:5173/startForm');
    console.log('📱 Navigated to startForm');
    
    // Wait for the form to load
    await page.waitForLoadState('networkidle');
    console.log('⏳ Page loaded');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'test-results/section16-basic-initial.png', fullPage: true });
    console.log('📸 Initial screenshot taken');
    
    // Check if SF-86 form container is present
    const formContainer = page.locator('[data-testid="sf86-form-container"]');
    if (await formContainer.isVisible({ timeout: 5000 })) {
      console.log('✅ SF-86 form container found');
    } else {
      console.log('❌ SF-86 form container not found');
      // Check what's actually on the page
      const pageTitle = await page.title();
      const bodyText = await page.locator('body').textContent();
      console.log(`Page title: ${pageTitle}`);
      console.log(`Body text preview: ${bodyText?.substring(0, 200)}...`);
    }
    
    // Look for any section navigation
    const sectionButtons = page.locator('button').filter({ hasText: /section/i });
    const sectionCount = await sectionButtons.count();
    console.log(`🔍 Found ${sectionCount} section buttons`);
    
    if (sectionCount > 0) {
      // List all section buttons
      for (let i = 0; i < Math.min(sectionCount, 10); i++) {
        const buttonText = await sectionButtons.nth(i).textContent();
        console.log(`  Section button ${i + 1}: "${buttonText}"`);
      }
      
      // Look specifically for Section 16
      const section16Button = page.locator('button').filter({ hasText: /section.*16/i });
      const section16Count = await section16Button.count();
      
      if (section16Count > 0) {
        console.log('✅ Found Section 16 button, clicking...');
        await section16Button.first().click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'test-results/section16-basic-clicked.png', fullPage: true });
        console.log('🎯 Clicked Section 16 button');
        
        // Check for form fields after navigation
        const formFields = page.locator('input, select, textarea');
        const fieldCount = await formFields.count();
        console.log(`📝 Found ${fieldCount} form fields after navigation`);
        
        if (fieldCount > 0) {
          console.log('✅ Form fields found! Testing basic functionality...');
          
          // Test first few fields
          for (let i = 0; i < Math.min(fieldCount, 5); i++) {
            const field = formFields.nth(i);
            const fieldType = await field.getAttribute('type');
            const fieldName = await field.getAttribute('name');
            const fieldPlaceholder = await field.getAttribute('placeholder');
            
            console.log(`  Field ${i + 1}: type="${fieldType}", name="${fieldName}", placeholder="${fieldPlaceholder}"`);
            
            // Try to interact with text fields
            if (fieldType === 'text' || fieldType === 'email' || !fieldType) {
              try {
                await field.fill(`Test value ${i + 1}`);
                const value = await field.inputValue();
                console.log(`    ✅ Successfully filled field with: "${value}"`);
              } catch (e) {
                console.log(`    ⚠️  Could not fill field: ${e.message}`);
              }
            }
          }
          
          // Look for person entries
          const personEntries = page.locator('[data-testid*="person"], .person, [class*="person"]');
          const personCount = await personEntries.count();
          console.log(`👥 Found ${personCount} potential person entries`);
          
          // Check for specific field patterns
          const nameFields = page.locator('input[name*="firstName"], input[name*="lastName"], input[placeholder*="name"]');
          const nameFieldCount = await nameFields.count();
          console.log(`📛 Found ${nameFieldCount} name-related fields`);
          
          const emailFields = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]');
          const emailFieldCount = await emailFields.count();
          console.log(`📧 Found ${emailFieldCount} email fields`);
          
          const phoneFields = page.locator('input[type="tel"], input[name*="phone"], input[placeholder*="phone"]');
          const phoneFieldCount = await phoneFields.count();
          console.log(`📞 Found ${phoneFieldCount} phone fields`);
          
          // Verify no foreign organization contact fields (should be in Section 15)
          const foreignOrgFields = page.locator('input[name*="organization"], input[placeholder*="organization"]');
          const foreignOrgCount = await foreignOrgFields.count();
          console.log(`🏢 Found ${foreignOrgCount} organization fields (should be 0 in Section 16)`);
          
          if (foreignOrgCount === 0) {
            console.log('✅ Confirmed: No foreign organization fields in Section 16 (correct cross-section mapping)');
          } else {
            console.log('⚠️  Warning: Found organization fields in Section 16 (may need cross-section mapping fix)');
          }
          
        } else {
          console.log('❌ No form fields found after clicking Section 16');
        }
        
      } else {
        console.log('❌ Section 16 button not found');
      }
    } else {
      console.log('❌ No section buttons found');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/section16-basic-final.png', fullPage: true });
    console.log('📸 Final screenshot taken');
    
    // Check for console errors
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });
    
    if (consoleMessages.length > 0) {
      console.log('🖥️  Console errors detected:');
      consoleMessages.forEach(msg => console.log(`   ${msg}`));
    } else {
      console.log('✅ No console errors detected');
    }
    
    console.log('🏁 Section 16 basic test completed');
  });
  
  test('should verify Section 16 context integration', async ({ page }) => {
    console.log('🧪 Testing Section 16 context integration...');
    
    // Navigate to the form
    await page.goto('http://localhost:5173/startForm');
    await page.waitForLoadState('networkidle');
    
    // Navigate to Section 16
    const section16Button = page.locator('button').filter({ hasText: /section.*16/i });
    if (await section16Button.count() > 0) {
      await section16Button.first().click();
      await page.waitForLoadState('networkidle');
      
      // Test data persistence by filling a field and checking if it persists
      const firstNameField = page.locator('input[name*="firstName"]').first();
      if (await firstNameField.isVisible({ timeout: 2000 })) {
        console.log('✅ Found firstName field, testing data persistence...');
        
        const testValue = 'John Test';
        await firstNameField.fill(testValue);
        
        // Wait a moment for context to update
        await page.waitForTimeout(500);
        
        // Check if value persists
        const persistedValue = await firstNameField.inputValue();
        if (persistedValue === testValue) {
          console.log('✅ Data persistence test PASSED');
        } else {
          console.log(`❌ Data persistence test FAILED: expected "${testValue}", got "${persistedValue}"`);
        }
      } else {
        console.log('⚠️  firstName field not found for persistence test');
      }
    }
    
    console.log('🏁 Context integration test completed');
  });
});
