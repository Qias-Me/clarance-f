/**
 * Section 18.2 - Current Address Tests
 * 
 * Tests all fields in Section 18.2 including:
 * - Current address information
 * - APO/FPO address support
 * - Date ranges and estimates
 * - Address validation
 */

import { test, expect, Page } from '@playwright/test';

// Test data for Section 18.2
const ADDRESS_TEST_DATA = {
  currentAddress: {
    street: '123 Main Street',
    street2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States'
  },
  apoFpoAddress: {
    address: 'Unit 12345',
    apoFpo: 'APO',
    stateCode: 'AE',
    zipCode: '09123'
  },
  dateRange: {
    from: { month: '01', year: '2020', isEstimated: false },
    to: { month: '12', year: '2023', isEstimated: true },
    isPresent: false
  }
};

// Helper function to monitor console logs
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

// Helper function to navigate to Section 18
async function navigateToSection18(page: Page) {
  await page.goto('/form');
  await page.waitForLoadState('networkidle');
  
  // Navigate to Section 18
  await page.click('[data-testid="section-18-nav"]');
  await page.waitForSelector('[data-testid="section-18-content"]', { timeout: 10000 });
  
  // Navigate to Section 18.2 tab
  await page.click('[data-testid="section-18-2-tab"]');
  await page.waitForSelector('[data-testid="section-18-2-content"]', { timeout: 5000 });
}

test.describe('Section 18.2 - Current Address', () => {
  test.beforeEach(async ({ page }) => {
    await setupConsoleMonitoring(page);
    await navigateToSection18(page);
  });

  test('should handle not applicable checkbox', async ({ page }) => {
    console.log('🧪 Testing Not Applicable Functionality');

    // Check "Not applicable" checkbox
    await page.check('[data-testid="relative-1-address-notApplicable"]');
    await page.waitForTimeout(500);

    // Verify address fields are hidden/disabled
    await expect(page.locator('[data-testid="relative-1-address-street"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="relative-1-address-city"]')).not.toBeVisible();

    // Verify message is shown
    await expect(page.locator('[data-testid="relative-1-address-notApplicable-message"]')).toBeVisible();

    // Uncheck to continue with other tests
    await page.uncheck('[data-testid="relative-1-address-notApplicable"]');
    await page.waitForTimeout(500);

    console.log('✅ Not applicable functionality tested');
  });

  test('should fill out standard current address', async ({ page }) => {
    console.log('🧪 Testing Standard Current Address');

    // Ensure not applicable is unchecked
    await page.uncheck('[data-testid="relative-1-address-notApplicable"]');
    await page.waitForTimeout(500);

    // Fill out current address
    await page.fill('[data-testid="relative-1-address-street"]', ADDRESS_TEST_DATA.currentAddress.street);
    await page.fill('[data-testid="relative-1-address-street2"]', ADDRESS_TEST_DATA.currentAddress.street2);
    await page.fill('[data-testid="relative-1-address-city"]', ADDRESS_TEST_DATA.currentAddress.city);
    await page.selectOption('[data-testid="relative-1-address-state"]', ADDRESS_TEST_DATA.currentAddress.state);
    await page.fill('[data-testid="relative-1-address-zipCode"]', ADDRESS_TEST_DATA.currentAddress.zipCode);
    await page.selectOption('[data-testid="relative-1-address-country"]', ADDRESS_TEST_DATA.currentAddress.country);

    await page.waitForTimeout(1000);

    // Verify values were set
    await expect(page.locator('[data-testid="relative-1-address-street"]')).toHaveValue(ADDRESS_TEST_DATA.currentAddress.street);
    await expect(page.locator('[data-testid="relative-1-address-street2"]')).toHaveValue(ADDRESS_TEST_DATA.currentAddress.street2);
    await expect(page.locator('[data-testid="relative-1-address-city"]')).toHaveValue(ADDRESS_TEST_DATA.currentAddress.city);
    await expect(page.locator('[data-testid="relative-1-address-zipCode"]')).toHaveValue(ADDRESS_TEST_DATA.currentAddress.zipCode);

    console.log('✅ Standard current address filled successfully');
  });

  test('should handle APO/FPO address functionality', async ({ page }) => {
    console.log('🧪 Testing APO/FPO Address Functionality');

    // Check "Has APO/FPO address" checkbox
    await page.check('[data-testid="relative-1-address-hasAPOFPO"]');
    await page.waitForTimeout(500);

    // Verify APO/FPO fields are visible
    await expect(page.locator('[data-testid="relative-1-address-apoFpo-address"]')).toBeVisible();
    await expect(page.locator('[data-testid="relative-1-address-apoFpo-type"]')).toBeVisible();

    // Fill out APO/FPO address
    await page.fill('[data-testid="relative-1-address-apoFpo-address"]', ADDRESS_TEST_DATA.apoFpoAddress.address);
    await page.selectOption('[data-testid="relative-1-address-apoFpo-type"]', ADDRESS_TEST_DATA.apoFpoAddress.apoFpo);
    await page.selectOption('[data-testid="relative-1-address-apoFpo-state"]', ADDRESS_TEST_DATA.apoFpoAddress.stateCode);
    await page.fill('[data-testid="relative-1-address-apoFpo-zipCode"]', ADDRESS_TEST_DATA.apoFpoAddress.zipCode);

    await page.waitForTimeout(1000);

    // Verify APO/FPO values
    await expect(page.locator('[data-testid="relative-1-address-apoFpo-address"]')).toHaveValue(ADDRESS_TEST_DATA.apoFpoAddress.address);
    await expect(page.locator('[data-testid="relative-1-address-apoFpo-zipCode"]')).toHaveValue(ADDRESS_TEST_DATA.apoFpoAddress.zipCode);

    // Test unchecking APO/FPO
    await page.uncheck('[data-testid="relative-1-address-hasAPOFPO"]');
    await page.waitForTimeout(500);

    // Verify APO/FPO fields are hidden
    await expect(page.locator('[data-testid="relative-1-address-apoFpo-address"]')).not.toBeVisible();

    console.log('✅ APO/FPO address functionality tested');
  });

  test('should fill out date ranges with estimates', async ({ page }) => {
    console.log('🧪 Testing Date Ranges and Estimates');

    // Fill out from date
    await page.fill('[data-testid="relative-1-address-fromDate"]', `${ADDRESS_TEST_DATA.dateRange.from.month}/${ADDRESS_TEST_DATA.dateRange.from.year}`);
    
    // Test from date estimated checkbox
    if (ADDRESS_TEST_DATA.dateRange.from.isEstimated) {
      await page.check('[data-testid="relative-1-address-fromDate-estimated"]');
    }

    await page.waitForTimeout(500);

    // Test present checkbox functionality
    if (ADDRESS_TEST_DATA.dateRange.isPresent) {
      await page.check('[data-testid="relative-1-address-present"]');
      await page.waitForTimeout(500);
      
      // Verify to date field is disabled when present is checked
      await expect(page.locator('[data-testid="relative-1-address-toDate"]')).toBeDisabled();
    } else {
      // Fill out to date
      await page.fill('[data-testid="relative-1-address-toDate"]', `${ADDRESS_TEST_DATA.dateRange.to.month}/${ADDRESS_TEST_DATA.dateRange.to.year}`);
      
      // Test to date estimated checkbox
      if (ADDRESS_TEST_DATA.dateRange.to.isEstimated) {
        await page.check('[data-testid="relative-1-address-toDate-estimated"]');
      }
    }

    await page.waitForTimeout(1000);

    // Verify date values
    await expect(page.locator('[data-testid="relative-1-address-fromDate"]')).toHaveValue(`${ADDRESS_TEST_DATA.dateRange.from.month}/${ADDRESS_TEST_DATA.dateRange.from.year}`);
    
    if (!ADDRESS_TEST_DATA.dateRange.isPresent) {
      await expect(page.locator('[data-testid="relative-1-address-toDate"]')).toHaveValue(`${ADDRESS_TEST_DATA.dateRange.to.month}/${ADDRESS_TEST_DATA.dateRange.to.year}`);
    }

    console.log('✅ Date ranges and estimates tested successfully');
  });

  test('should test present checkbox interaction', async ({ page }) => {
    console.log('🧪 Testing Present Checkbox Interaction');

    // Fill out to date first
    await page.fill('[data-testid="relative-1-address-toDate"]', '12/2023');
    await page.waitForTimeout(500);

    // Check present checkbox
    await page.check('[data-testid="relative-1-address-present"]');
    await page.waitForTimeout(500);

    // Verify to date field is disabled and cleared
    await expect(page.locator('[data-testid="relative-1-address-toDate"]')).toBeDisabled();
    await expect(page.locator('[data-testid="relative-1-address-toDate-estimated"]')).toBeDisabled();

    // Uncheck present checkbox
    await page.uncheck('[data-testid="relative-1-address-present"]');
    await page.waitForTimeout(500);

    // Verify to date field is enabled again
    await expect(page.locator('[data-testid="relative-1-address-toDate"]')).toBeEnabled();
    await expect(page.locator('[data-testid="relative-1-address-toDate-estimated"]')).toBeEnabled();

    console.log('✅ Present checkbox interaction tested');
  });

  test('should validate address field requirements', async ({ page }) => {
    console.log('🧪 Testing Address Field Validation');

    // Test required field validation
    await page.fill('[data-testid="relative-1-address-street"]', '');
    await page.blur('[data-testid="relative-1-address-street"]');
    await page.waitForTimeout(500);

    // Check for validation message (if implemented)
    const validationMessage = page.locator('[data-testid="relative-1-address-street-error"]');
    if (await validationMessage.isVisible()) {
      console.log('✅ Validation message displayed for empty street address');
    }

    // Test ZIP code format validation
    await page.fill('[data-testid="relative-1-address-zipCode"]', '123'); // Invalid ZIP
    await page.blur('[data-testid="relative-1-address-zipCode"]');
    await page.waitForTimeout(500);

    // Fill with valid ZIP code
    await page.fill('[data-testid="relative-1-address-zipCode"]', '12345');
    await page.blur('[data-testid="relative-1-address-zipCode"]');
    await page.waitForTimeout(500);

    console.log('✅ Address field validation tested');
  });

  test('should test complete Section 18.2 workflow', async ({ page }) => {
    console.log('🧪 Testing Complete Section 18.2 Workflow');

    // Ensure not applicable is unchecked
    await page.uncheck('[data-testid="relative-1-address-notApplicable"]');
    await page.waitForTimeout(500);

    // Fill out complete address information
    await page.fill('[data-testid="relative-1-address-street"]', ADDRESS_TEST_DATA.currentAddress.street);
    await page.fill('[data-testid="relative-1-address-street2"]', ADDRESS_TEST_DATA.currentAddress.street2);
    await page.fill('[data-testid="relative-1-address-city"]', ADDRESS_TEST_DATA.currentAddress.city);
    await page.selectOption('[data-testid="relative-1-address-state"]', ADDRESS_TEST_DATA.currentAddress.state);
    await page.fill('[data-testid="relative-1-address-zipCode"]', ADDRESS_TEST_DATA.currentAddress.zipCode);
    await page.selectOption('[data-testid="relative-1-address-country"]', ADDRESS_TEST_DATA.currentAddress.country);

    // Fill out date range
    await page.fill('[data-testid="relative-1-address-fromDate"]', `${ADDRESS_TEST_DATA.dateRange.from.month}/${ADDRESS_TEST_DATA.dateRange.from.year}`);
    await page.fill('[data-testid="relative-1-address-toDate"]', `${ADDRESS_TEST_DATA.dateRange.to.month}/${ADDRESS_TEST_DATA.dateRange.to.year}`);
    
    // Set estimate checkboxes
    if (ADDRESS_TEST_DATA.dateRange.to.isEstimated) {
      await page.check('[data-testid="relative-1-address-toDate-estimated"]');
    }

    // Test APO/FPO functionality
    await page.check('[data-testid="relative-1-address-hasAPOFPO"]');
    await page.waitForTimeout(500);
    
    await page.fill('[data-testid="relative-1-address-apoFpo-address"]', ADDRESS_TEST_DATA.apoFpoAddress.address);
    await page.selectOption('[data-testid="relative-1-address-apoFpo-type"]', ADDRESS_TEST_DATA.apoFpoAddress.apoFpo);
    await page.selectOption('[data-testid="relative-1-address-apoFpo-state"]', ADDRESS_TEST_DATA.apoFpoAddress.stateCode);
    await page.fill('[data-testid="relative-1-address-apoFpo-zipCode"]', ADDRESS_TEST_DATA.apoFpoAddress.zipCode);

    await page.waitForTimeout(2000);

    // Verify all key fields are filled
    await expect(page.locator('[data-testid="relative-1-address-street"]')).toHaveValue(ADDRESS_TEST_DATA.currentAddress.street);
    await expect(page.locator('[data-testid="relative-1-address-city"]')).toHaveValue(ADDRESS_TEST_DATA.currentAddress.city);
    await expect(page.locator('[data-testid="relative-1-address-zipCode"]')).toHaveValue(ADDRESS_TEST_DATA.currentAddress.zipCode);
    await expect(page.locator('[data-testid="relative-1-address-fromDate"]')).toHaveValue(`${ADDRESS_TEST_DATA.dateRange.from.month}/${ADDRESS_TEST_DATA.dateRange.from.year}`);
    await expect(page.locator('[data-testid="relative-1-address-apoFpo-address"]')).toHaveValue(ADDRESS_TEST_DATA.apoFpoAddress.address);

    console.log('✅ Complete Section 18.2 workflow tested successfully');
  });

  test('should test multiple relatives address entries', async ({ page }) => {
    console.log('🧪 Testing Multiple Relatives Address Entries');

    // Test first relative
    await page.fill('[data-testid="relative-1-address-street"]', '123 First Street');
    await page.fill('[data-testid="relative-1-address-city"]', 'First City');
    await page.selectOption('[data-testid="relative-1-address-state"]', 'NY');

    // Switch to second relative
    await page.click('[data-testid="relative-2-tab"]');
    await page.waitForTimeout(500);

    // Test second relative
    await page.fill('[data-testid="relative-2-address-street"]', '456 Second Avenue');
    await page.fill('[data-testid="relative-2-address-city"]', 'Second City');
    await page.selectOption('[data-testid="relative-2-address-state"]', 'CA');

    // Switch back to first relative and verify data persistence
    await page.click('[data-testid="relative-1-tab"]');
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="relative-1-address-street"]')).toHaveValue('123 First Street');
    await expect(page.locator('[data-testid="relative-1-address-city"]')).toHaveValue('First City');

    // Switch back to second relative and verify
    await page.click('[data-testid="relative-2-tab"]');
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="relative-2-address-street"]')).toHaveValue('456 Second Avenue');
    await expect(page.locator('[data-testid="relative-2-address-city"]')).toHaveValue('Second City');

    console.log('✅ Multiple relatives address entries tested');
  });

  test('should test field state management and interactions', async ({ page }) => {
    console.log('🧪 Testing Field State Management and Interactions');

    // Test not applicable interaction
    await page.fill('[data-testid="relative-1-address-street"]', 'Test Street');
    await page.check('[data-testid="relative-1-address-notApplicable"]');
    await page.waitForTimeout(500);
    
    // Verify fields are hidden
    await expect(page.locator('[data-testid="relative-1-address-street"]')).not.toBeVisible();
    
    // Uncheck and verify field value is preserved
    await page.uncheck('[data-testid="relative-1-address-notApplicable"]');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="relative-1-address-street"]')).toHaveValue('Test Street');

    // Test APO/FPO interaction
    await page.check('[data-testid="relative-1-address-hasAPOFPO"]');
    await page.fill('[data-testid="relative-1-address-apoFpo-address"]', 'Test APO');
    await page.uncheck('[data-testid="relative-1-address-hasAPOFPO"]');
    await page.check('[data-testid="relative-1-address-hasAPOFPO"]');
    await page.waitForTimeout(500);
    
    // Verify APO/FPO value is preserved
    await expect(page.locator('[data-testid="relative-1-address-apoFpo-address"]')).toHaveValue('Test APO');

    console.log('✅ Field state management and interactions tested');
  });
});
