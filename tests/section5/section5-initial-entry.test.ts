/**
 * Section 5 Initial Entry Test
 * 
 * Tests that Section 5 only renders 1 entry when user selects "Yes"
 * and allows adding more entries up to 4 total.
 */

import { test, expect } from '@playwright/test';

test.describe('Section 5 - Initial Entry Behavior', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the form
    await page.goto('http://localhost:5174/startForm');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Navigate to Section 5
    await page.click('[data-testid="section-section5-nav-button"]');
    
    // Wait for Section 5 to load
    await page.waitForSelector('[data-testid="section5-form"]');
  });

  test('should show no entries initially', async ({ page }) => {
    // Initially, no entries should be visible
    const entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
    await expect(entries).toHaveCount(0);
    
    // Add button should not be visible when "No" is selected or nothing is selected
    const addButton = page.locator('[data-testid="add-other-name-button"]');
    await expect(addButton).not.toBeVisible();
  });

  test('should render exactly 1 entry when user selects "Yes"', async ({ page }) => {
    // Select "Yes" for having other names
    await page.click('[data-testid="has-other-names-yes"]');

    // Wait a moment for the state to update
    await page.waitForTimeout(100);

    // Should show exactly 1 entry
    const entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
    await expect(entries).toHaveCount(1);

    // Verify the entry is for index 0
    await expect(page.locator('[data-testid="other-name-0-last-name"]')).toBeVisible();

    // Add button should be visible and show (1/4)
    const addButton = page.locator('[data-testid="add-other-name-button"]');
    await expect(addButton).toBeVisible();
    await expect(addButton).toContainText('Add Another Name (1/4)');
  });

  test('should allow adding more entries up to 4 total', async ({ page }) => {
    // Select "Yes" for having other names
    await page.click('[data-testid="has-other-names-yes"]');
    
    // Should start with 1 entry
    let entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
    await expect(entries).toHaveCount(1);
    
    const addButton = page.locator('[data-testid="add-other-name-button"]');
    
    // Add second entry
    await addButton.click();
    entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
    await expect(entries).toHaveCount(2);
    await expect(addButton).toContainText('Add Another Name (2/4)');
    
    // Add third entry
    await addButton.click();
    entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
    await expect(entries).toHaveCount(3);
    await expect(addButton).toContainText('Add Another Name (3/4)');
    
    // Add fourth entry
    await addButton.click();
    entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
    await expect(entries).toHaveCount(4);
    await expect(addButton).toContainText('Add Another Name (4/4)');
    
    // Button should be disabled now
    await expect(addButton).toBeDisabled();
    
    // Should show maximum message
    await expect(page.locator('text=Maximum of 4 other names allowed.')).toBeVisible();
  });

  test('should clear all entries when user selects "No"', async ({ page }) => {
    // Select "Yes" and add some entries
    await page.click('[data-testid="has-other-names-yes"]');
    
    // Add another entry
    await page.click('[data-testid="add-other-name-button"]');
    
    // Should have 2 entries
    let entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
    await expect(entries).toHaveCount(2);
    
    // Select "No"
    await page.click('[data-testid="has-other-names-no"]');
    
    // Should have no entries
    entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
    await expect(entries).toHaveCount(0);
    
    // Add button should not be visible
    const addButton = page.locator('[data-testid="add-other-name-button"]');
    await expect(addButton).not.toBeVisible();
  });

  test('should allow removing entries', async ({ page }) => {
    // Select "Yes" for having other names
    await page.click('[data-testid="has-other-names-yes"]');
    
    // Add another entry to have 2 total
    await page.click('[data-testid="add-other-name-button"]');
    
    // Should have 2 entries
    let entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
    await expect(entries).toHaveCount(2);
    
    // Remove the first entry (index 0)
    await page.click('button[aria-label="Remove name entry 1"]');
    
    // Should have 1 entry left
    entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
    await expect(entries).toHaveCount(1);
    
    // The remaining entry should be at index 0 (re-indexed)
    await expect(page.locator('[data-testid="other-name-0-last-name"]')).toBeVisible();
  });

  test('should maintain form data when switching between Yes/No/Yes', async ({ page }) => {
    // Select "Yes" and fill in some data
    await page.click('[data-testid="has-other-names-yes"]');
    
    // Fill in the first entry
    await page.fill('[data-testid="other-name-0-last-name"]', 'Smith');
    await page.fill('[data-testid="other-name-0-first-name"]', 'John');
    
    // Select "No" (should clear entries)
    await page.click('[data-testid="has-other-names-no"]');
    
    // Select "Yes" again (should create new empty entry)
    await page.click('[data-testid="has-other-names-yes"]');
    
    // Should have 1 empty entry
    const entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
    await expect(entries).toHaveCount(1);
    
    // Entry should be empty
    await expect(page.locator('[data-testid="other-name-0-last-name"]')).toHaveValue('');
    await expect(page.locator('[data-testid="other-name-0-first-name"]')).toHaveValue('');
  });
});
