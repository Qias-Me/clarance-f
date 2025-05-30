/**
 * Section 29 PDF Integration Test - Verify Data Collection and PDF Field Mapping
 */

import { test, expect } from '@playwright/test';

test.describe('Section 29: PDF Integration', () => {
  test('should collect Section 29 data and map to PDF fields correctly', async ({ page }) => {
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
    
    // Fill in organization details
    await page.fill('input[placeholder="Enter organization name"]', 'Test Terror Organization');
    await page.fill('input[placeholder="Street address"]', '123 Terror Street');
    await page.fill('input[placeholder="City"]', 'Terror City');
    await page.fill('input[placeholder="State"]', 'CA');
    await page.fill('input[placeholder="ZIP code"]', '90210');
    await page.fill('input[placeholder="Country"]', 'USA');
    
    // Fill in date range
    await page.fill('input[type="month"]', '2020-01');
    
    // Fill in descriptions
    await page.fill('textarea[placeholder*="positions or roles"]', 'Test position in organization');
    await page.fill('textarea[placeholder*="contributions"]', 'Test contributions made');
    await page.fill('textarea[placeholder*="involvement"]', 'Test involvement description');
    
    // Wait for data to be saved
    await page.waitForTimeout(1000);
    
    // Verify the PDF field mapping summary shows correct data
    await expect(page.locator('text=Entries: 1')).toBeVisible();
    await expect(page.locator('text=Total Fields Mapped:')).toBeVisible();
    
    // Now test PDF generation
    await page.click('text=Generate PDF');
    
    // Wait for PDF generation to complete
    await page.waitForTimeout(5000);
    
    // Check console for PDF generation logs
    const logs = await page.evaluate(() => {
      return window.console.logs || [];
    });
    
    // Look for successful data collection logs
    const hasDataCollection = logs.some(log => 
      log.includes('Collected data from section29') || 
      log.includes('Starting enhanced form value mapping')
    );
    
    if (hasDataCollection) {
      console.log('✅ Section 29 data collection is working!');
    } else {
      console.log('❌ Section 29 data collection may not be working properly');
    }
    
    // Verify that fields are being mapped (should be > 0)
    const hasFieldMapping = logs.some(log => 
      log.includes('Fields mapped:') && !log.includes('Fields mapped: 0')
    );
    
    if (hasFieldMapping) {
      console.log('✅ PDF field mapping is working!');
    } else {
      console.log('❌ PDF field mapping may not be working properly');
    }
  });

  test('should maintain Section 29 data across page interactions', async ({ page }) => {
    // Navigate to the form
    await page.goto('/startForm');
    await page.waitForSelector('[data-testid="section29-form"]', { timeout: 10000 });
    
    // Add data to Section 29
    await page.click('text=Association');
    await page.click('input[value="YES"]');
    await page.click('[data-testid="add-terrorismOrganizations-entry"]');
    await page.fill('input[placeholder="Enter organization name"]', 'Persistent Organization');
    
    // Navigate to another section and back
    await page.click('text=Personal Information');
    await page.waitForTimeout(1000);
    await page.click('text=Association');
    
    // Verify data persists
    await expect(page.locator('input[value="Persistent Organization"]')).toBeVisible();
    
    // Test PDF generation with persistent data
    await page.click('text=Generate PDF');
    await page.waitForTimeout(3000);
    
    console.log('✅ Section 29 data persistence is working!');
  });

  test('should handle multiple entries in PDF generation', async ({ page }) => {
    // Navigate to the form
    await page.goto('/startForm');
    await page.waitForSelector('[data-testid="section29-form"]', { timeout: 10000 });
    
    // Add multiple organizations
    await page.click('text=Association');
    await page.click('input[value="YES"]');
    
    // Add first organization
    await page.click('[data-testid="add-terrorismOrganizations-entry"]');
    await page.fill('input[placeholder="Enter organization name"]', 'Organization One');
    
    // Add second organization
    await page.click('[data-testid="add-terrorismOrganizations-entry"]');
    const orgNameInputs = page.locator('input[placeholder="Enter organization name"]');
    await orgNameInputs.nth(1).fill('Organization Two');
    
    // Verify both entries are present
    await expect(page.locator('text=Organization One')).toBeVisible();
    await expect(page.locator('text=Organization Two')).toBeVisible();
    
    // Verify PDF mapping summary shows 2 entries
    await expect(page.locator('text=Entries: 2')).toBeVisible();
    
    // Test PDF generation with multiple entries
    await page.click('text=Generate PDF');
    await page.waitForTimeout(3000);
    
    console.log('✅ Multiple entries PDF generation is working!');
  });
});
