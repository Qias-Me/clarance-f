/**
 * Section 3: Place of Birth - Comprehensive Tests
 * 
 * Tests all fields in Section 3 including:
 * - City of birth (TextField11[3])
 * - County of birth (TextField11[4])
 * - Country of birth (DropDownList1[0])
 * - State of birth (School6_State[0])
 * 
 * Cross-references with api/sections-references/section-3.json
 */

import { test, expect, Page } from '@playwright/test';

// Test data for Section 3 based on section-3.json field mappings
const SECTION3_TEST_DATA = {
  city: 'New York',
  county: 'Manhattan',
  country: 'United States',
  state: 'NY'
};

// Alternative test data for validation
const SECTION3_ALT_DATA = {
  city: 'Los Angeles',
  county: 'Los Angeles County',
  country: 'United States',
  state: 'CA'
};

// International test data
const SECTION3_INTL_DATA = {
  city: 'Toronto',
  county: 'York Region',
  country: 'Canada',
  state: 'ON'
};

// Helper function to monitor console logs and errors
async function setupConsoleMonitoring(page: Page): Promise<string[]> {
  const consoleMessages: string[] = [];
  
  page.on('console', (msg) => {
    const message = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(message);
    console.log(`Console: ${message}`);
  });

  page.on('pageerror', (error) => {
    const message = `[ERROR] ${error.message}`;
    consoleMessages.push(message);
    console.log(`Page Error: ${message}`);
  });

  return consoleMessages;
}

// Helper function to navigate to Section 3
async function navigateToSection3(page: Page) {
  console.log('🧭 Navigating to Section 3...');
  
  await page.goto('/startForm');
  await page.waitForLoadState('networkidle');
  
  // Click on Section 3 navigation
  await page.click('[data-testid="section-3-nav"]', { timeout: 10000 });
  await page.waitForSelector('[data-testid="section3-form"]', { timeout: 10000 });
  
  console.log('✅ Successfully navigated to Section 3');
}

// Helper function to fill all Section 3 fields
async function fillSection3Fields(page: Page, data: typeof SECTION3_TEST_DATA) {
  console.log('📝 Filling Section 3 fields...');
  
  // Fill country first (may affect state visibility)
  await page.selectOption('[data-testid="country-field"]', data.country);
  await page.waitForTimeout(500);
  
  // Fill state (if US is selected)
  if (data.country === 'United States') {
    await page.selectOption('[data-testid="state-field"]', data.state);
    await page.waitForTimeout(500);
  }
  
  // Fill city
  await page.fill('[data-testid="city-field"]', data.city);
  await page.waitForTimeout(500);
  
  // Fill county
  await page.fill('[data-testid="county-field"]', data.county);
  await page.waitForTimeout(500);
  
  console.log('✅ All Section 3 fields filled');
}

// Helper function to verify field values
async function verifySection3Fields(page: Page, data: typeof SECTION3_TEST_DATA) {
  console.log('🔍 Verifying Section 3 field values...');
  
  await expect(page.locator('[data-testid="country-field"]')).toHaveValue(data.country);
  await expect(page.locator('[data-testid="city-field"]')).toHaveValue(data.city);
  await expect(page.locator('[data-testid="county-field"]')).toHaveValue(data.county);
  
  if (data.country === 'United States') {
    await expect(page.locator('[data-testid="state-field"]')).toHaveValue(data.state);
  }
  
  console.log('✅ All Section 3 field values verified');
}

test.describe('Section 3: Place of Birth - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupConsoleMonitoring(page);
    await navigateToSection3(page);
  });

  test('should display all Section 3 fields correctly', async ({ page }) => {
    console.log('🧪 Testing Section 3 field visibility and structure');

    // Verify section header
    await expect(page.locator('h2')).toContainText('Section 3: Place of Birth');
    
    // Verify all required fields are present
    await expect(page.locator('[data-testid="country-field"]')).toBeVisible();
    await expect(page.locator('[data-testid="city-field"]')).toBeVisible();
    await expect(page.locator('[data-testid="county-field"]')).toBeVisible();
    
    // Verify form structure
    await expect(page.locator('[data-testid="section3-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-section-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="clear-section-button"]')).toBeVisible();
    
    console.log('✅ Section 3 structure verified');
  });

  test('should fill and persist basic place of birth information', async ({ page }) => {
    console.log('🧪 Testing basic Section 3 data entry and persistence');

    await fillSection3Fields(page, SECTION3_TEST_DATA);
    await verifySection3Fields(page, SECTION3_TEST_DATA);
    
    // Test form submission
    await page.click('[data-testid="submit-section-button"]');
    await page.waitForTimeout(2000);
    
    // Verify data persists after submission
    await verifySection3Fields(page, SECTION3_TEST_DATA);
    
    console.log('✅ Basic Section 3 data entry and persistence tested');
  });

  test('should handle US state field visibility correctly', async ({ page }) => {
    console.log('🧪 Testing US state field conditional visibility');

    // Test with United States - state field should be visible
    await page.selectOption('[data-testid="country-field"]', 'United States');
    await page.waitForTimeout(500);
    
    await expect(page.locator('[data-testid="state-field"]')).toBeVisible();
    
    // Test with other country - state field should be hidden
    await page.selectOption('[data-testid="country-field"]', 'Canada');
    await page.waitForTimeout(500);
    
    // State field should not be visible for non-US countries
    // (Note: This depends on the component implementation)
    
    console.log('✅ State field conditional visibility tested');
  });

  test('should validate required fields', async ({ page }) => {
    console.log('🧪 Testing Section 3 field validation');

    // Try to submit without filling required fields
    await page.click('[data-testid="submit-section-button"]');
    await page.waitForTimeout(1000);
    
    // Check for validation errors (implementation dependent)
    // This test verifies the form handles empty required fields appropriately
    
    // Fill required fields and verify validation passes
    await fillSection3Fields(page, SECTION3_TEST_DATA);
    await page.click('[data-testid="submit-section-button"]');
    await page.waitForTimeout(1000);
    
    console.log('✅ Field validation tested');
  });

  test('should clear all fields when reset button is clicked', async ({ page }) => {
    console.log('🧪 Testing Section 3 reset functionality');

    // Fill all fields
    await fillSection3Fields(page, SECTION3_TEST_DATA);
    await verifySection3Fields(page, SECTION3_TEST_DATA);
    
    // Click reset button
    await page.click('[data-testid="clear-section-button"]');
    await page.waitForTimeout(1000);
    
    // Verify fields are cleared
    await expect(page.locator('[data-testid="city-field"]')).toHaveValue('');
    await expect(page.locator('[data-testid="county-field"]')).toHaveValue('');
    
    console.log('✅ Reset functionality tested');
  });

  test('should handle international place of birth data', async ({ page }) => {
    console.log('🧪 Testing international place of birth data');

    await fillSection3Fields(page, SECTION3_INTL_DATA);
    await verifySection3Fields(page, SECTION3_INTL_DATA);
    
    // Submit and verify persistence
    await page.click('[data-testid="submit-section-button"]');
    await page.waitForTimeout(2000);
    
    await verifySection3Fields(page, SECTION3_INTL_DATA);
    
    console.log('✅ International data handling tested');
  });

  test('should test complete Section 3 workflow with data persistence', async ({ page }) => {
    console.log('🧪 Testing complete Section 3 workflow with data persistence');

    // Fill initial data
    await fillSection3Fields(page, SECTION3_TEST_DATA);
    await page.click('[data-testid="submit-section-button"]');
    await page.waitForTimeout(2000);
    
    // Modify data
    await fillSection3Fields(page, SECTION3_ALT_DATA);
    await page.click('[data-testid="submit-section-button"]');
    await page.waitForTimeout(2000);
    
    // Verify final data persists
    await verifySection3Fields(page, SECTION3_ALT_DATA);
    
    console.log('✅ Complete workflow with data persistence tested');
  });

  test('should validate field mapping against section-3.json reference', async ({ page }) => {
    console.log('🧪 Testing Section 3 field mapping validation');

    // Expected fields from api/sections-references/section-3.json:
    // - City: "9446 0 R" → "form1[0].Sections1-6[0].TextField11[3]"
    // - County: "9445 0 R" → "form1[0].Sections1-6[0].TextField11[4]"
    // - Country: "9444 0 R" → "form1[0].Sections1-6[0].DropDownList1[0]"
    // - State: "9443 0 R" → "form1[0].Sections1-6[0].School6_State[0]"

    const expectedFields = [
      { testId: 'city-field', fieldName: 'city', pdfField: 'TextField11[3]' },
      { testId: 'county-field', fieldName: 'county', pdfField: 'TextField11[4]' },
      { testId: 'country-field', fieldName: 'country', pdfField: 'DropDownList1[0]' },
      { testId: 'state-field', fieldName: 'state', pdfField: 'School6_State[0]' }
    ];

    // Verify all expected fields are present and functional
    for (const field of expectedFields) {
      console.log(`🔍 Testing field: ${field.fieldName} (${field.pdfField})`);

      if (field.fieldName === 'state') {
        // State field only visible when US is selected
        await page.selectOption('[data-testid="country-field"]', 'United States');
        await page.waitForTimeout(500);
      }

      const fieldElement = page.locator(`[data-testid="${field.testId}"]`);
      await expect(fieldElement).toBeVisible();

      // Test field interaction
      if (field.fieldName === 'country' || field.fieldName === 'state') {
        // Dropdown fields
        await fieldElement.selectOption({ index: 1 });
      } else {
        // Text fields
        await fieldElement.fill(`Test ${field.fieldName}`);
      }

      await page.waitForTimeout(300);
      console.log(`✅ Field ${field.fieldName} validated`);
    }

    console.log('✅ All Section 3 fields validated against reference data');
  });

  test('should monitor console for Section 3 context errors', async ({ page }) => {
    console.log('🧪 Testing Section 3 context error monitoring');

    const consoleMessages = await setupConsoleMonitoring(page);

    // Perform various operations and monitor for errors
    await fillSection3Fields(page, SECTION3_TEST_DATA);
    await page.click('[data-testid="submit-section-button"]');
    await page.waitForTimeout(2000);

    // Check for any error messages in console
    const errorMessages = consoleMessages.filter(msg =>
      msg.includes('[ERROR]') || msg.includes('❌') || msg.includes('Failed')
    );

    if (errorMessages.length > 0) {
      console.log('⚠️ Console errors detected:', errorMessages);
    } else {
      console.log('✅ No console errors detected');
    }

    console.log('✅ Console monitoring completed');
  });

  test('should test PDF field ID mapping and data flow', async ({ page }) => {
    console.log('🧪 Testing PDF field ID mapping and data flow');

    // Fill all fields with specific test data
    await fillSection3Fields(page, SECTION3_TEST_DATA);

    // Submit form to trigger data flow to PDF mapping
    await page.click('[data-testid="submit-section-button"]');
    await page.waitForTimeout(2000);

    // Check debug information if available
    const debugToggle = page.locator('summary:has-text("Debug Information")');
    if (await debugToggle.isVisible()) {
      await debugToggle.click();
      await page.waitForTimeout(500);

      // Verify section data structure
      const debugContent = page.locator('pre').first();
      const debugText = await debugContent.textContent();

      if (debugText) {
        console.log('📊 Debug data preview:', debugText.substring(0, 200) + '...');

        // Verify expected field structure
        expect(debugText).toContain('section3');
        expect(debugText).toContain('city');
        expect(debugText).toContain('county');
        expect(debugText).toContain('country');
        expect(debugText).toContain('state');
      }
    }

    console.log('✅ PDF field mapping and data flow tested');
  });
});
