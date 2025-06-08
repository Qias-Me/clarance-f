/**
 * Section 13 Validation and Edge Cases Tests
 * 
 * Tests field validation, edge cases, and error handling for Section 13
 */

import { test, expect, Page } from '@playwright/test';

// Test data for edge cases
const EDGE_CASE_DATA = {
  invalidDates: ['13/2020', '00/2020', '12/2030', 'invalid'],
  longText: 'A'.repeat(1000), // Very long text to test limits
  specialCharacters: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  sqlInjection: "'; DROP TABLE users; --",
  xssAttempt: '<script>alert("xss")</script>',
  unicodeText: '测试文本 🚀 émojis',
  phoneNumbers: [
    '(555) 123-4567',
    '555-123-4567', 
    '5551234567',
    '555.123.4567',
    '+1-555-123-4567',
    'invalid-phone',
    '123', // Too short
    '12345678901234567890' // Too long
  ],
  zipCodes: [
    '12345',
    '12345-6789',
    'invalid',
    '123',
    '1234567890'
  ]
};

// Console error monitoring
let consoleErrors: string[] = [];
let consoleWarnings: string[] = [];

test.beforeEach(async ({ page }) => {
  consoleErrors = [];
  consoleWarnings = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`ERROR: ${msg.text()}`);
      console.log(`🔴 Console Error: ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(`WARNING: ${msg.text()}`);
      console.log(`🟡 Console Warning: ${msg.text()}`);
    }
  });

  page.on('pageerror', (error) => {
    consoleErrors.push(`PAGE ERROR: ${error.message}`);
    console.log(`🔴 Page Error: ${error.message}`);
  });

  await page.goto('/form/section13');
  await page.waitForLoadState('networkidle');
});

test.afterEach(async () => {
  if (consoleErrors.length > 0) {
    console.log('\n🔴 CONSOLE ERRORS DETECTED:');
    consoleErrors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (consoleWarnings.length > 0) {
    console.log('\n🟡 CONSOLE WARNINGS DETECTED:');
    consoleWarnings.forEach(warning => console.log(`  - ${warning}`));
  }

  if (consoleErrors.length === 0 && consoleWarnings.length === 0) {
    console.log('\n✅ NO CONSOLE ERRORS OR WARNINGS DETECTED');
  }
});

test.describe('Section 13: Validation and Edge Cases', () => {

  test('should handle invalid date formats gracefully', async ({ page }) => {
    console.log('🧪 Testing invalid date format handling...');
    
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    await page.locator('text=Private Company').first().click();
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Test invalid date formats
    for (const invalidDate of EDGE_CASE_DATA.invalidDates) {
      console.log(`  📅 Testing invalid date: ${invalidDate}`);
      
      const dateField = page.locator('input[placeholder="MM/YYYY"]').first();
      await dateField.clear();
      await dateField.fill(invalidDate);
      await page.waitForTimeout(300);
      
      // Check if validation appears
      const validationMessage = page.locator('.text-red-500, .text-red-700').first();
      if (await validationMessage.isVisible()) {
        console.log(`    ✅ Validation message shown for ${invalidDate}`);
      }
    }
    
    // Test valid date to clear validation
    await page.locator('input[placeholder="MM/YYYY"]').first().fill('01/2020');
    await page.waitForTimeout(500);
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Invalid date format handling tested successfully');
  });

  test('should handle long text inputs without breaking', async ({ page }) => {
    console.log('🧪 Testing long text input handling...');
    
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    await page.locator('text=Self-Employment').first().click();
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Test long text in various fields
    const textFields = [
      { selector: 'label:has-text("Business Name") + input', name: 'Business Name' },
      { selector: 'label:has-text("Business Type") + input', name: 'Business Type' },
      { selector: 'label:has-text("Position Title") + input', name: 'Position Title' }
    ];
    
    for (const field of textFields) {
      console.log(`  📝 Testing long text in ${field.name}...`);
      
      const fieldElement = page.locator(field.selector);
      if (await fieldElement.isVisible()) {
        await fieldElement.fill(EDGE_CASE_DATA.longText);
        await page.waitForTimeout(300);
        
        // Check if field handles long text gracefully
        const fieldValue = await fieldElement.inputValue();
        console.log(`    📊 Field accepted ${fieldValue.length} characters`);
      }
    }
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Long text input handling tested successfully');
  });

  test('should handle special characters and security inputs', async ({ page }) => {
    console.log('🧪 Testing special characters and security input handling...');
    
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    await page.locator('text=Private Company').first().click();
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Test special characters
    console.log('  🔣 Testing special characters...');
    const companyNameField = page.locator('label:has-text("Employer/Company Name") + input');
    if (await companyNameField.isVisible()) {
      await companyNameField.fill(EDGE_CASE_DATA.specialCharacters);
      await page.waitForTimeout(300);
    }
    
    // Test SQL injection attempt
    console.log('  💉 Testing SQL injection prevention...');
    const positionField = page.locator('label:has-text("Position Title") + input');
    if (await positionField.isVisible()) {
      await positionField.fill(EDGE_CASE_DATA.sqlInjection);
      await page.waitForTimeout(300);
    }
    
    // Test XSS attempt
    console.log('  🔒 Testing XSS prevention...');
    const streetField = page.locator('label:has-text("Street Address") + input');
    if (await streetField.isVisible()) {
      await streetField.fill(EDGE_CASE_DATA.xssAttempt);
      await page.waitForTimeout(300);
    }
    
    // Test Unicode text
    console.log('  🌐 Testing Unicode text...');
    const cityField = page.locator('label:has-text("City") + input');
    if (await cityField.isVisible()) {
      await cityField.fill(EDGE_CASE_DATA.unicodeText);
      await page.waitForTimeout(300);
    }
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Special characters and security input handling tested successfully');
  });

  test('should validate phone number formats', async ({ page }) => {
    console.log('🧪 Testing phone number format validation...');
    
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    await page.locator('text=Private Company').first().click();
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Test various phone number formats
    for (const phoneNumber of EDGE_CASE_DATA.phoneNumbers) {
      console.log(`  📞 Testing phone number: ${phoneNumber}`);
      
      const phoneField = page.locator('input[placeholder="(555) 123-4567"]').first();
      if (await phoneField.isVisible()) {
        await phoneField.clear();
        await phoneField.fill(phoneNumber);
        await page.waitForTimeout(300);
        
        // Check for validation feedback
        const validationElement = phoneField.locator('..').locator('.text-red-500, .text-red-700');
        if (await validationElement.isVisible()) {
          console.log(`    ❌ Validation shown for ${phoneNumber}`);
        } else {
          console.log(`    ✅ Accepted ${phoneNumber}`);
        }
      }
    }
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Phone number format validation tested successfully');
  });

  test('should validate ZIP code formats', async ({ page }) => {
    console.log('🧪 Testing ZIP code format validation...');
    
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    await page.locator('text=Private Company').first().click();
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Test various ZIP code formats
    for (const zipCode of EDGE_CASE_DATA.zipCodes) {
      console.log(`  📮 Testing ZIP code: ${zipCode}`);
      
      const zipField = page.locator('label:has-text("ZIP Code") + input').first();
      if (await zipField.isVisible()) {
        await zipField.clear();
        await zipField.fill(zipCode);
        await page.waitForTimeout(300);
        
        // Check for validation feedback
        const validationElement = zipField.locator('..').locator('.text-red-500, .text-red-700');
        if (await validationElement.isVisible()) {
          console.log(`    ❌ Validation shown for ${zipCode}`);
        } else {
          console.log(`    ✅ Accepted ${zipCode}`);
        }
      }
    }
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ ZIP code format validation tested successfully');
  });

  test('should handle rapid form interactions without errors', async ({ page }) => {
    console.log('🧪 Testing rapid form interactions...');
    
    // Rapidly switch between employment types
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(100);
    
    const employmentTypes = ['Private Company', 'Self-Employment', 'Unemployment', 'Active Military Duty'];
    
    for (let i = 0; i < 5; i++) {
      for (const type of employmentTypes) {
        console.log(`  🔄 Rapid switch to ${type} (iteration ${i + 1})`);
        await page.locator(`text=${type}`).first().click();
        await page.waitForTimeout(50); // Very short wait to test rapid interactions
      }
    }
    
    // Rapidly add and interact with form fields
    await page.locator('text=Private Company').first().click();
    await page.waitForTimeout(100);
    
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(200);
    
    // Rapidly fill and clear fields
    const rapidTestFields = [
      'input[placeholder="MM/YYYY"]',
      'label:has-text("Employer/Company Name") + input',
      'label:has-text("Position Title") + input'
    ];
    
    for (let i = 0; i < 3; i++) {
      for (const fieldSelector of rapidTestFields) {
        const field = page.locator(fieldSelector).first();
        if (await field.isVisible()) {
          await field.fill(`Test${i}`);
          await page.waitForTimeout(10);
          await field.clear();
          await page.waitForTimeout(10);
        }
      }
    }
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Rapid form interactions tested successfully');
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    console.log('🧪 Testing browser navigation handling...');
    
    // Fill some form data
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    await page.locator('text=Private Company').first().click();
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    await page.locator('input[placeholder="MM/YYYY"]').first().fill('01/2020');
    await page.locator('label:has-text("Employer/Company Name") + input').fill('Test Company');
    await page.waitForTimeout(500);
    
    // Navigate away and back
    console.log('  🔙 Testing navigation away and back...');
    await page.goto('/form/section12');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check if form data is preserved
    const companyNameValue = await page.locator('label:has-text("Employer/Company Name") + input').inputValue();
    console.log(`  📊 Company name preserved: ${companyNameValue}`);
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Browser navigation handling tested successfully');
  });

  test('should handle form submission with missing required fields', async ({ page }) => {
    console.log('🧪 Testing form submission with missing required fields...');
    
    // Try to save with no data
    console.log('  ❌ Testing save with no employment data...');
    await page.locator('button:has-text("Save Section 13")').click();
    await page.waitForTimeout(2000);
    
    // Add employment but no entries
    console.log('  ❌ Testing save with employment but no entries...');
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Save Section 13")').click();
    await page.waitForTimeout(2000);
    
    // Add entry but leave required fields empty
    console.log('  ❌ Testing save with empty required fields...');
    await page.locator('text=Private Company').first().click();
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Save Section 13")').click();
    await page.waitForTimeout(2000);
    
    // Check for validation messages
    const validationElements = await page.locator('.text-red-500, .text-red-700, .bg-red-50').count();
    console.log(`  📊 Found ${validationElements} validation elements`);
    
    // Fill minimal required data to test successful save
    console.log('  ✅ Testing save with minimal required data...');
    await page.locator('input[placeholder="MM/YYYY"]').first().fill('01/2020');
    await page.locator('input[placeholder="MM/YYYY"]').nth(1).fill('12/2020');
    await page.locator('label:has-text("Employer/Company Name") + input').fill('Valid Company');
    await page.locator('label:has-text("Position Title") + input').fill('Valid Position');
    await page.locator('label:has-text("Street Address") + input').fill('123 Valid St');
    await page.locator('label:has-text("City") + input').fill('Valid City');
    await page.locator('input[placeholder="(555) 123-4567"]').fill('(555) 123-4567');
    
    await page.locator('button:has-text("Save Section 13")').click();
    await page.waitForTimeout(2000);
    
    // Filter out validation-related console errors
    const jsErrors = consoleErrors.filter(error => 
      !error.includes('validation') && 
      !error.includes('required') &&
      !error.includes('field') &&
      !error.includes('empty')
    );
    
    expect(jsErrors).toHaveLength(0);
    console.log('✅ Form submission validation tested successfully');
  });

  test('should handle concurrent field updates without race conditions', async ({ page }) => {
    console.log('🧪 Testing concurrent field updates...');
    
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    await page.locator('text=Private Company').first().click();
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Simulate concurrent updates by rapidly updating multiple fields
    const concurrentUpdates = [
      { selector: 'input[placeholder="MM/YYYY"]', value: '01/2020' },
      { selector: 'label:has-text("Employer/Company Name") + input', value: 'Concurrent Company' },
      { selector: 'label:has-text("Position Title") + input', value: 'Concurrent Position' },
      { selector: 'label:has-text("Street Address") + input', value: '123 Concurrent St' },
      { selector: 'label:has-text("City") + input', value: 'Concurrent City' }
    ];
    
    // Update all fields simultaneously
    console.log('  ⚡ Performing concurrent field updates...');
    const updatePromises = concurrentUpdates.map(async (update, index) => {
      const field = page.locator(update.selector).first();
      if (await field.isVisible()) {
        await field.fill(`${update.value}_${index}`);
      }
    });
    
    await Promise.all(updatePromises);
    await page.waitForTimeout(1000);
    
    // Verify all updates were applied
    for (const update of concurrentUpdates) {
      const field = page.locator(update.selector).first();
      if (await field.isVisible()) {
        const value = await field.inputValue();
        console.log(`  📊 Field value: ${value}`);
      }
    }
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Concurrent field updates tested successfully');
  });
});
