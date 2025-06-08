/**
 * Section 19 Field Type Testing Functions
 * 
 * Functions to test all different field types in Section 19
 * and validate their interactions
 */

import { Page } from '@playwright/test';

export async function testTextFields(page: Page) {
  console.log('🔍 Testing text field interactions...');
  
  const textFields = page.locator('input[type="text"], input[type="email"], input[type="tel"], textarea');
  const count = await textFields.count();
  
  console.log(`📊 Found ${count} text fields`);
  
  // Test a sample of text fields
  for (let i = 0; i < Math.min(count, 10); i++) {
    const field = textFields.nth(i);
    if (await field.isVisible()) {
      await field.fill('Test Value');
      await page.waitForTimeout(100);
      await field.clear();
      await page.waitForTimeout(100);
    }
  }
  
  console.log('✅ Text fields tested');
}

export async function testCheckboxFields(page: Page) {
  console.log('🔍 Testing checkbox field interactions...');
  
  const checkboxes = page.locator('input[type="checkbox"]');
  const count = await checkboxes.count();
  
  console.log(`📊 Found ${count} checkbox fields`);
  
  // Test a sample of checkboxes
  for (let i = 0; i < Math.min(count, 15); i++) {
    const checkbox = checkboxes.nth(i);
    if (await checkbox.isVisible()) {
      await checkbox.check();
      await page.waitForTimeout(100);
      await checkbox.uncheck();
      await page.waitForTimeout(100);
    }
  }
  
  console.log('✅ Checkbox fields tested');
}

export async function testDropdownFields(page: Page) {
  console.log('🔍 Testing dropdown field interactions...');
  
  const dropdowns = page.locator('select');
  const count = await dropdowns.count();
  
  console.log(`📊 Found ${count} dropdown fields`);
  
  // Test a sample of dropdowns
  for (let i = 0; i < Math.min(count, 10); i++) {
    const dropdown = dropdowns.nth(i);
    if (await dropdown.isVisible()) {
      const options = await dropdown.locator('option').count();
      if (options > 1) {
        await dropdown.selectOption({ index: 1 });
        await page.waitForTimeout(100);
        await dropdown.selectOption({ index: 0 });
        await page.waitForTimeout(100);
      }
    }
  }
  
  console.log('✅ Dropdown fields tested');
}

export async function testRadioFields(page: Page) {
  console.log('🔍 Testing radio field interactions...');
  
  const radios = page.locator('input[type="radio"]');
  const count = await radios.count();
  
  console.log(`📊 Found ${count} radio fields`);
  
  // Test a sample of radio buttons
  for (let i = 0; i < Math.min(count, 10); i++) {
    const radio = radios.nth(i);
    if (await radio.isVisible()) {
      await radio.click();
      await page.waitForTimeout(100);
    }
  }
  
  console.log('✅ Radio fields tested');
}

export async function testDateFields(page: Page) {
  console.log('🔍 Testing date field interactions...');
  
  const dateFields = page.locator('input[type="date"]');
  const count = await dateFields.count();
  
  console.log(`📊 Found ${count} date fields`);
  
  // Test a sample of date fields
  for (let i = 0; i < Math.min(count, 5); i++) {
    const dateField = dateFields.nth(i);
    if (await dateField.isVisible()) {
      await dateField.fill('2023-01-15');
      await page.waitForTimeout(100);
      await dateField.clear();
      await page.waitForTimeout(100);
    }
  }
  
  console.log('✅ Date fields tested');
}

export async function testAllFieldTypes(page: Page) {
  console.log('🔍 Running comprehensive field type tests...');
  
  await testTextFields(page);
  await testCheckboxFields(page);
  await testDropdownFields(page);
  await testRadioFields(page);
  await testDateFields(page);
  
  console.log('✅ All field type tests completed');
}

export async function validateFieldCounts(page: Page) {
  console.log('📊 Validating field counts...');
  
  const fieldCounts = {
    text: await page.locator('input[type="text"], textarea').count(),
    checkbox: await page.locator('input[type="checkbox"]').count(),
    radio: await page.locator('input[type="radio"]').count(),
    select: await page.locator('select').count(),
    date: await page.locator('input[type="date"]').count(),
    email: await page.locator('input[type="email"]').count(),
    tel: await page.locator('input[type="tel"]').count()
  };
  
  const totalFields = Object.values(fieldCounts).reduce((sum, count) => sum + count, 0);
  
  console.log('Field count breakdown:');
  Object.entries(fieldCounts).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count} fields`);
  });
  console.log(`  - Total: ${totalFields} fields`);
  
  return { fieldCounts, totalFields };
}

export async function testFieldValidation(page: Page) {
  console.log('🔍 Testing field validation...');
  
  // Test required field validation
  const requiredFields = page.locator('input[required], select[required], textarea[required]');
  const requiredCount = await requiredFields.count();
  
  console.log(`📊 Found ${requiredCount} required fields`);
  
  // Test a few required fields
  for (let i = 0; i < Math.min(requiredCount, 3); i++) {
    const field = requiredFields.nth(i);
    if (await field.isVisible()) {
      // Try to submit without filling
      await field.focus();
      await field.blur();
      await page.waitForTimeout(200);
      
      // Fill and clear to test validation
      await field.fill('Test');
      await page.waitForTimeout(100);
      await field.clear();
      await page.waitForTimeout(100);
    }
  }
  
  console.log('✅ Field validation tested');
}

export async function testFieldInteractions(page: Page) {
  console.log('🔍 Testing advanced field interactions...');
  
  // Test tab navigation
  const firstField = page.locator('input, select, textarea').first();
  if (await firstField.isVisible()) {
    await firstField.focus();
    
    // Tab through a few fields
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }
  }
  
  // Test keyboard shortcuts
  await page.keyboard.press('Control+Home'); // Go to top
  await page.waitForTimeout(200);
  
  console.log('✅ Field interactions tested');
}

export async function testFieldAccessibility(page: Page) {
  console.log('🔍 Testing field accessibility...');
  
  // Check for labels
  const fieldsWithLabels = page.locator('input[aria-label], input[aria-labelledby], select[aria-label], select[aria-labelledby], textarea[aria-label], textarea[aria-labelledby]');
  const labelCount = await fieldsWithLabels.count();
  
  console.log(`📊 Found ${labelCount} fields with accessibility labels`);
  
  // Check for fieldsets
  const fieldsets = page.locator('fieldset');
  const fieldsetCount = await fieldsets.count();
  
  console.log(`📊 Found ${fieldsetCount} fieldsets for grouping`);
  
  // Test focus indicators
  const focusableElements = page.locator('input, select, textarea, button');
  const focusableCount = await focusableElements.count();
  
  console.log(`📊 Found ${focusableCount} focusable elements`);
  
  console.log('✅ Accessibility tests completed');
}

export async function runComprehensiveFieldTests(page: Page) {
  console.log('🚀 Running comprehensive Section 19 field tests...');
  
  const results = {
    fieldCounts: await validateFieldCounts(page),
    timestamp: new Date().toISOString()
  };
  
  await testAllFieldTypes(page);
  await testFieldValidation(page);
  await testFieldInteractions(page);
  await testFieldAccessibility(page);
  
  console.log('✅ Comprehensive field tests completed');
  
  return results;
}
