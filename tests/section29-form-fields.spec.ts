/**
 * Section 29 Form Fields Test - Verify Entry Form Fields Functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Section 29: Form Fields Functionality', () => {
  test('should display and interact with organization form fields', async ({ page }) => {
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
    
    // Click "Add Organization" button
    await page.click('[data-testid="add-terrorismOrganizations-entry"]');
    
    // Wait for the entry to be added
    await page.waitForTimeout(1000);
    
    // Verify that form fields are now visible
    await expect(page.locator('label:has-text("Organization Name")')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter organization name"]')).toBeVisible();
    
    // Test organization name field
    const orgNameInput = page.locator('input[placeholder="Enter organization name"]');
    await orgNameInput.fill('Test Organization');
    await expect(orgNameInput).toHaveValue('Test Organization');
    
    // Test address fields
    await expect(page.locator('label:has-text("Street Address")')).toBeVisible();
    await expect(page.locator('label:has-text("City")')).toBeVisible();
    await expect(page.locator('label:has-text("State")')).toBeVisible();
    await expect(page.locator('label:has-text("ZIP Code")')).toBeVisible();
    await expect(page.locator('label:has-text("Country")')).toBeVisible();
    
    // Fill in address fields
    await page.fill('input[placeholder="Street address"]', '123 Main St');
    await page.fill('input[placeholder="City"]', 'Test City');
    await page.fill('input[placeholder="State"]', 'CA');
    await page.fill('input[placeholder="ZIP code"]', '12345');
    await page.fill('input[placeholder="Country"]', 'USA');
    
    // Test date fields
    await expect(page.locator('label:has-text("From Date (Month/Year)")')).toBeVisible();
    await expect(page.locator('label:has-text("To Date (Month/Year)")')).toBeVisible();
    
    // Fill in dates
    await page.fill('input[type="month"]', '2020-01');
    
    // Test checkboxes
    await expect(page.locator('text=Estimated')).toBeVisible();
    await expect(page.locator('text=Present')).toBeVisible();
    
    // Test description fields
    await expect(page.locator('label:has-text("Describe your role(s) or position(s)")')).toBeVisible();
    await expect(page.locator('label:has-text("Describe your contributions")')).toBeVisible();
    await expect(page.locator('label:has-text("Describe your involvement")')).toBeVisible();
    
    // Fill in descriptions
    await page.fill('textarea[placeholder*="positions or roles"]', 'Test position description');
    await page.fill('textarea[placeholder*="contributions"]', 'Test contributions description');
    await page.fill('textarea[placeholder*="involvement"]', 'Test involvement description');
    
    // Verify the header updates with the organization name
    await expect(page.locator('h5:has-text("Test Organization")')).toBeVisible();
    
    console.log('✅ All organization form fields are working correctly!');
  });

  test('should display activity form fields for activity subsections', async ({ page }) => {
    // Navigate to the form
    await page.goto('/startForm');
    
    // Wait for the form to load
    await page.waitForSelector('[data-testid="section29-form"]', { timeout: 10000 });
    
    // Click on Association tab
    await page.click('text=Association');
    
    // Navigate to Terrorism Activities (29.2)
    await page.click('button:has-text("29.2 Terrorism Activities")');
    
    // Select "YES"
    await page.click('input[value="YES"]');
    
    // Click "Add Activity" button
    await page.click('[data-testid="add-terrorismActivities-entry"]');
    
    // Wait for the entry to be added
    await page.waitForTimeout(1000);
    
    // Verify activity-specific fields are visible
    await expect(page.locator('label:has-text("Activity Description")')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="activity"]')).toBeVisible();
    
    // Test activity description field
    const activityDesc = page.locator('textarea[placeholder*="activity"]');
    await activityDesc.fill('Test activity description');
    await expect(activityDesc).toHaveValue('Test activity description');
    
    // Verify date fields are present for activities too
    await expect(page.locator('label:has-text("From Date (Month/Year)")')).toBeVisible();
    await expect(page.locator('label:has-text("To Date (Month/Year)")')).toBeVisible();
    
    console.log('✅ Activity form fields are working correctly!');
  });

  test('should maintain field values when switching between subsections', async ({ page }) => {
    // Navigate to the form
    await page.goto('/startForm');
    await page.waitForSelector('[data-testid="section29-form"]', { timeout: 10000 });
    await page.click('text=Association');
    
    // Add organization in 29.1
    await page.click('input[value="YES"]');
    await page.click('[data-testid="add-terrorismOrganizations-entry"]');
    await page.fill('input[placeholder="Enter organization name"]', 'Persistent Org');
    
    // Switch to 29.2 and add activity
    await page.click('button:has-text("29.2 Terrorism Activities")');
    await page.click('input[value="YES"]');
    await page.click('[data-testid="add-terrorismActivities-entry"]');
    await page.fill('textarea[placeholder*="activity"]', 'Persistent Activity');
    
    // Switch back to 29.1 and verify organization data persists
    await page.click('button:has-text("29.1 Terrorism Organizations")');
    await expect(page.locator('input[value="Persistent Org"]')).toBeVisible();
    
    // Switch back to 29.2 and verify activity data persists
    await page.click('button:has-text("29.2 Terrorism Activities")');
    await expect(page.locator('textarea[value="Persistent Activity"]')).toBeVisible();
    
    console.log('✅ Field values persist correctly across subsections!');
  });
});
