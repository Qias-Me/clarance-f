/**
 * Section 29 Association Record - Comprehensive Playwright Tests
 * 
 * Tests the complete CRUD functionality of Section 29 including:
 * - Navigation between subsections
 * - Yes/No radio button functionality
 * - Adding and removing organization/activity entries
 * - Field validation and data persistence
 * - PDF field mapping verification
 */

import { test, expect } from '@playwright/test';

test.describe('Section 29: Association Record', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the SF-86 form
    await page.goto('http://localhost:5173/startForm');
    
    // Wait for the form to load
    await expect(page.locator('[data-testid="section29-form"]')).toBeVisible();
    
    // Navigate to Section 29 (Association)
    await page.click('text=Association');
    
    // Wait for Section 29 to be active
    await expect(page.locator('h2:has-text("Section 29: Association Record")')).toBeVisible();
  });

  test('should display all 5 subsections with correct navigation', async ({ page }) => {
    // Verify all subsection tabs are present
    const expectedSubsections = [
      '29.1 Terrorism Organizations',
      '29.2 Terrorism Activities',
      '29.3 Violent Overthrow Organizations',
      '29.4 Violence/Force Organizations',
      '29.5 Overthrow Activities & Associations'
    ];

    for (const subsection of expectedSubsections) {
      await expect(page.locator(`button:has-text("${subsection}")`)).toBeVisible();
    }

    // Test navigation between subsections
    for (const subsection of expectedSubsections) {
      await page.click(`button:has-text("${subsection}")`);
      await expect(page.locator(`button:has-text("${subsection}")`)).toHaveClass(/border-blue-500/);
    }
  });

  test('should handle Yes/No radio buttons correctly', async ({ page }) => {
    // Start with 29.1 Terrorism Organizations (default)
    const yesRadio = page.locator('input[value="YES"]').first();
    const noRadio = page.locator('input[value="NO"]').first();

    // Initially should be "NO" (default)
    await expect(noRadio).toBeChecked();
    await expect(yesRadio).not.toBeChecked();

    // Click "YES"
    await yesRadio.click();
    await expect(yesRadio).toBeChecked();
    await expect(noRadio).not.toBeChecked();

    // Verify that entries section appears when "YES" is selected
    await expect(page.locator('text=Organizations')).toBeVisible();
    await expect(page.locator('[data-testid="add-terrorismOrganizations-entry"]')).toBeVisible();

    // Click "NO" again
    await noRadio.click();
    await expect(noRadio).toBeChecked();
    await expect(yesRadio).not.toBeChecked();

    // Verify that entries section disappears when "NO" is selected
    await expect(page.locator('[data-testid="add-terrorismOrganizations-entry"]')).not.toBeVisible();
  });

  test('should add and display organization entries correctly', async ({ page }) => {
    // Select "YES" to enable entry addition
    await page.locator('input[value="YES"]').first().click();
    
    // Verify initial state shows no entries
    await expect(page.locator('text=No organizations added yet.')).toBeVisible();
    
    // Click "Add Organization" button
    await page.click('[data-testid="add-terrorismOrganizations-entry"]');
    
    // Verify that an entry was added
    await expect(page.locator('text=No organizations added yet.')).not.toBeVisible();
    await expect(page.locator('text=Organization 1')).toBeVisible();
    
    // Verify entry fields are present
    await expect(page.locator('text=Remove')).toBeVisible();
    
    // Add a second organization
    await page.click('[data-testid="add-terrorismOrganizations-entry"]');
    await expect(page.locator('text=Organization 2')).toBeVisible();
    
    // Verify both entries are present
    const removeButtons = page.locator('button:has-text("Remove")');
    await expect(removeButtons).toHaveCount(2);
  });

  test('should remove organization entries correctly', async ({ page }) => {
    // Select "YES" and add two organizations
    await page.locator('input[value="YES"]').first().click();
    await page.click('[data-testid="add-terrorismOrganizations-entry"]');
    await page.click('[data-testid="add-terrorismOrganizations-entry"]');
    
    // Verify both entries exist
    await expect(page.locator('text=Organization 1')).toBeVisible();
    await expect(page.locator('text=Organization 2')).toBeVisible();
    
    // Remove the first entry
    await page.click('[data-testid="remove-terrorismOrganizations-entry-0"]');
    
    // Verify only one entry remains
    await expect(page.locator('button:has-text("Remove")')).toHaveCount(1);
    
    // Remove the remaining entry
    await page.click('[data-testid="remove-terrorismOrganizations-entry-0"]');
    
    // Verify no entries message appears
    await expect(page.locator('text=No organizations added yet.')).toBeVisible();
  });

  test('should handle activity subsections correctly', async ({ page }) => {
    // Navigate to Terrorism Activities (29.2)
    await page.click('button:has-text("29.2 Terrorism Activities")');
    
    // Select "YES"
    await page.locator('input[value="YES"]').first().click();
    
    // Verify activities section appears
    await expect(page.locator('text=Activities')).toBeVisible();
    await expect(page.locator('[data-testid="add-terrorismActivities-entry"]')).toBeVisible();
    
    // Add an activity
    await page.click('[data-testid="add-terrorismActivities-entry"]');
    
    // Verify activity was added
    await expect(page.locator('text=Activity 1')).toBeVisible();
  });

  test('should maintain state when switching between subsections', async ({ page }) => {
    // Add organization in 29.1
    await page.locator('input[value="YES"]').first().click();
    await page.click('[data-testid="add-terrorismOrganizations-entry"]');
    await expect(page.locator('text=Organization 1')).toBeVisible();
    
    // Switch to 29.2 and add activity
    await page.click('button:has-text("29.2 Terrorism Activities")');
    await page.locator('input[value="YES"]').first().click();
    await page.click('[data-testid="add-terrorismActivities-entry"]');
    await expect(page.locator('text=Activity 1')).toBeVisible();
    
    // Switch back to 29.1 and verify organization is still there
    await page.click('button:has-text("29.1 Terrorism Organizations")');
    await expect(page.locator('text=Organization 1')).toBeVisible();
    await expect(page.locator('input[value="YES"]').first()).toBeChecked();
  });

  test('should display PDF field mapping summary', async ({ page }) => {
    // Select "YES" and add an organization
    await page.locator('input[value="YES"]').first().click();
    await page.click('[data-testid="add-terrorismOrganizations-entry"]');
    
    // Verify PDF field mapping summary is displayed
    await expect(page.locator('text=PDF Field Mapping Summary')).toBeVisible();
    await expect(page.locator('text=Flag Field:')).toBeVisible();
    await expect(page.locator('text=Entries: 1')).toBeVisible();
    await expect(page.locator('text=Total Fields Mapped:')).toBeVisible();
  });

  test('should validate all subsection types work correctly', async ({ page }) => {
    const subsectionTests = [
      { name: '29.1 Terrorism Organizations', type: 'organization', testId: 'terrorismOrganizations' },
      { name: '29.2 Terrorism Activities', type: 'activity', testId: 'terrorismActivities' },
      { name: '29.3 Violent Overthrow Organizations', type: 'organization', testId: 'violentOverthrowOrganizations' },
      { name: '29.4 Violence/Force Organizations', type: 'organization', testId: 'violenceForceOrganizations' },
      { name: '29.5 Overthrow Activities & Associations', type: 'activity', testId: 'overthrowActivitiesAndAssociations' }
    ];

    for (const subsection of subsectionTests) {
      // Navigate to subsection
      await page.click(`button:has-text("${subsection.name}")`);
      
      // Select "YES"
      await page.locator('input[value="YES"]').first().click();
      
      // Verify correct entry type appears
      const expectedText = subsection.type === 'organization' ? 'Organizations' : 'Activities';
      await expect(page.locator(`text=${expectedText}`)).toBeVisible();
      
      // Verify add button exists
      await expect(page.locator(`[data-testid="add-${subsection.testId}-entry"]`)).toBeVisible();
      
      // Add an entry
      await page.click(`[data-testid="add-${subsection.testId}-entry"]`);
      
      // Verify entry was added
      const expectedEntryText = subsection.type === 'organization' ? 'Organization 1' : 'Activity 1';
      await expect(page.locator(`text=${expectedEntryText}`)).toBeVisible();
    }
  });

  test('should handle form validation and error states', async ({ page }) => {
    // Test that flag field error message appears when data structure is invalid
    // This tests the error handling in the component
    
    // Navigate to a subsection
    await page.click('button:has-text("29.1 Terrorism Organizations")');
    
    // The flag field should be available (not showing error)
    await expect(page.locator('text=Flag field not found')).not.toBeVisible();
    
    // Radio buttons should be functional
    await expect(page.locator('input[value="YES"]').first()).toBeVisible();
    await expect(page.locator('input[value="NO"]').first()).toBeVisible();
  });
});

test.describe('Section 29: Cross-browser Compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`should work correctly in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      test.skip(currentBrowser !== browserName, `Skipping ${browserName} test`);
      
      await page.goto('http://localhost:5173/startForm');
      await page.click('text=Association');
      
      // Basic functionality test
      await expect(page.locator('h2:has-text("Section 29: Association Record")')).toBeVisible();
      await page.locator('input[value="YES"]').first().click();
      await page.click('[data-testid="add-terrorismOrganizations-entry"]');
      await expect(page.locator('text=Organization 1')).toBeVisible();
    });
  });
});
