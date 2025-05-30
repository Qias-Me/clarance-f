/**
 * Basic Section 29 Test - Verify Add Organization Functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Section 29: Basic Functionality', () => {
  test('should add organization entry when button is clicked', async ({ page }) => {
    // Navigate to the form
    await page.goto('/startForm');
    
    // Wait for the form to load
    await page.waitForSelector('[data-testid="section29-form"]', { timeout: 10000 });
    
    // Click on Association tab to navigate to Section 29
    await page.click('text=Association');
    
    // Wait for Section 29 to load
    await page.waitForSelector('h2:has-text("Section 29: Association Record")', { timeout: 5000 });
    
    // Select "YES" to enable entry addition
    await page.click('input[value="YES"]');
    
    // Wait for the add button to appear
    await page.waitForSelector('[data-testid="add-terrorismOrganizations-entry"]', { timeout: 5000 });
    
    // Verify initial state shows no entries
    await expect(page.locator('text=No organizations added yet.')).toBeVisible();
    
    // Click "Add Organization" button
    await page.click('[data-testid="add-terrorismOrganizations-entry"]');
    
    // Wait a moment for the entry to be added
    await page.waitForTimeout(1000);
    
    // Verify that an entry was added
    await expect(page.locator('text=No organizations added yet.')).not.toBeVisible();
    await expect(page.locator('text=Organization 1')).toBeVisible();
    
    console.log('✅ Add Organization functionality is working!');
  });
});
