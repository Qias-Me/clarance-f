/**
 * Section 29 Field Mapping Test Suite
 *
 * Comprehensive test to verify that all Section 29 subsections and their fields
 * are properly mapped to PDF field IDs and functioning correctly.
 *
 * Tests all 5 subsections:
 * - Terrorism Organizations (Section29[0])
 * - Terrorism Activities (Section29_2[0])
 * - Violent Overthrow Organizations (Section29_3[0])
 * - Violence/Force Organizations (Section29_4[0])
 * - Overthrow Activities & Associations (Section29_5[0])
 */

import { test, expect } from '@playwright/test';

// Test data for each subsection type
const testData = {
  organizationEntry: {
    organizationName: 'Test Organization',
    address: {
      street: '123 Test Street',
      city: 'Test City',
      state: 'CA',
      zipCode: '12345',
      country: 'United States'
    },
    dateRange: {
      from: '01/2020',
      to: '12/2022'
    },
    positions: 'Test Position Description',
    contributions: 'Test Contributions Description',
    involvement: 'Test Involvement Description'
  },
  activityEntry: {
    description: 'Test Activity Description',
    dateRange: {
      from: '01/2020',
      to: '12/2022'
    }
  },
  associationEntry: {
    explanation: 'Test Association Explanation'
  }
};

// Subsection configuration matching the component
const subsections = [
  {
    key: 'terrorismOrganizations',
    title: '29.1 Terrorism Organizations',
    type: 'organization',
    expectedPdfPrefix: 'Section29[0]'
  },
  {
    key: 'terrorismActivities',
    title: '29.2 Terrorism Activities',
    type: 'activity',
    expectedPdfPrefix: 'Section29_2[0]'
  },
  {
    key: 'violentOverthrowOrganizations',
    title: '29.3 Violent Overthrow Organizations',
    type: 'organization',
    expectedPdfPrefix: 'Section29_3[0]'
  },
  {
    key: 'violenceForceOrganizations',
    title: '29.4 Violence/Force Organizations',
    type: 'organization',
    expectedPdfPrefix: 'Section29_4[0]'
  },
  {
    key: 'overthrowActivitiesAndAssociations',
    title: '29.5 Overthrow Activities & Associations',
    type: 'activity',
    expectedPdfPrefix: 'Section29_5[0]'
  }
];

test.describe('Section 29 Field Mapping Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the form
    await page.goto('/startForm');
    
    // Wait for the form to load
    await page.waitForSelector('[data-testid="centralized-sf86-form"]');
    
    // Navigate to Section 29
    await page.click('[data-testid="section-section29-button"]');
    
    // Wait for Section 29 component to load
    await page.waitForSelector('[data-testid="section29-form"]');
  });

  test('Section 29 component loads with all subsection tabs', async ({ page }) => {
    // Verify the main section header
    await expect(page.locator('h2')).toContainText('Section 29: Association Record');
    
    // Verify all subsection tabs are present
    for (const subsection of subsections) {
      await expect(page.locator('button').filter({ hasText: subsection.title })).toBeVisible();
    }
  });

  test('All subsections have proper Yes/No flag fields', async ({ page }) => {
    for (const subsection of subsections) {
      // Click on the subsection tab
      await page.click(`button:has-text("${subsection.title}")`);
      
      // Wait for subsection content to load
      await page.waitForTimeout(500);
      
      // Verify Yes/No radio buttons are present
      const yesRadio = page.locator(`input[name="${subsection.key}-flag"][value="YES"]`);
      const noRadio = page.locator(`input[name="${subsection.key}-flag"][value="NO"]`);
      
      await expect(yesRadio).toBeVisible();
      await expect(noRadio).toBeVisible();
      
      // Verify "No" is selected by default
      await expect(noRadio).toBeChecked();
    }
  });

  test('PDF Field Mapping Summary displays correctly', async ({ page }) => {
    // Check the PDF Field Mapping Summary section
    const summarySection = page.locator('div:has-text("PDF Field Mapping Summary")');
    await expect(summarySection).toBeVisible();
    
    // Verify it shows flag field ID
    await expect(summarySection.locator('p:has-text("Flag Field:")')).toBeVisible();
    
    // Verify it shows entry count
    await expect(summarySection.locator('p:has-text("Entries:")')).toBeVisible();
    
    // Verify it shows total fields mapped
    await expect(summarySection.locator('p:has-text("Total Fields Mapped:")')).toBeVisible();
  });

  test('Organization subsections show entry forms when Yes is selected', async ({ page }) => {
    const organizationSubsections = subsections.filter(s => s.type === 'organization');
    
    for (const subsection of organizationSubsections) {
      // Navigate to subsection
      await page.click(`button:has-text("${subsection.title}")`);
      await page.waitForTimeout(500);
      
      // Select "Yes"
      await page.click(`input[name="${subsection.key}-flag"][value="YES"]`);
      
      // Verify the "Add Organization" button appears
      const addButton = page.locator(`[data-testid="add-${subsection.key}-entry"]`);
      await expect(addButton).toBeVisible();
      await expect(addButton).toContainText('Add Organization');
      
      // Verify empty state message
      await expect(page.locator('text=No organizations added yet')).toBeVisible();
    }
  });

  test('Activity subsections show entry forms when Yes is selected', async ({ page }) => {
    const activitySubsections = subsections.filter(s => s.type === 'activity');
    
    for (const subsection of activitySubsections) {
      // Navigate to subsection
      await page.click(`button:has-text("${subsection.title}")`);
      await page.waitForTimeout(500);
      
      // Select "Yes"
      await page.click(`input[name="${subsection.key}-flag"][value="YES"]`);
      
      // Verify the "Add Activity" button appears
      const addButton = page.locator(`[data-testid="add-${subsection.key}-entry"]`);
      await expect(addButton).toBeVisible();
      await expect(addButton).toContainText('Add Activity');
      
      // Verify empty state message
      await expect(page.locator('text=No activities added yet')).toBeVisible();
    }
  });

  test('Can add and remove entries in organization subsections', async ({ page }) => {
    const subsection = subsections.find(s => s.key === 'terrorismOrganizations')!;
    
    // Navigate to terrorism organizations
    await page.click(`button:has-text("${subsection.title}")`);
    await page.waitForTimeout(500);
    
    // Select "Yes"
    await page.click(`input[name="${subsection.key}-flag"][value="YES"]`);
    
    // Add an entry
    await page.click(`[data-testid="add-${subsection.key}-entry"]`);
    
    // Verify entry appears
    await expect(page.locator('text=Organization 1')).toBeVisible();
    
    // Verify remove button is present
    const removeButton = page.locator(`[data-testid="remove-${subsection.key}-entry-0"]`);
    await expect(removeButton).toBeVisible();
    
    // Remove the entry
    await removeButton.click();
    
    // Verify entry is removed and empty state returns
    await expect(page.locator('text=No organizations added yet')).toBeVisible();
  });

  test('Can add and remove entries in activity subsections', async ({ page }) => {
    const subsection = subsections.find(s => s.key === 'terrorismActivities')!;
    
    // Navigate to terrorism activities
    await page.click(`button:has-text("${subsection.title}")`);
    await page.waitForTimeout(500);
    
    // Select "Yes"
    await page.click(`input[name="${subsection.key}-flag"][value="YES"]`);
    
    // Add an entry
    await page.click(`[data-testid="add-${subsection.key}-entry"]`);
    
    // Verify entry appears
    await expect(page.locator('text=Activity 1')).toBeVisible();
    
    // Verify remove button is present
    const removeButton = page.locator(`[data-testid="remove-${subsection.key}-entry-0"]`);
    await expect(removeButton).toBeVisible();
    
    // Remove the entry
    await removeButton.click();
    
    // Verify entry is removed and empty state returns
    await expect(page.locator('text=No activities added yet')).toBeVisible();
  });

  test('Field mapping count updates when entries are added', async ({ page }) => {
    const subsection = subsections.find(s => s.key === 'terrorismOrganizations')!;
    
    // Navigate to terrorism organizations
    await page.click(`button:has-text("${subsection.title}")`);
    await page.waitForTimeout(500);
    
    // Check initial field count (should be 1 for the flag field)
    const summarySection = page.locator('div:has-text("PDF Field Mapping Summary")');
    await expect(summarySection.locator('p:has-text("Total Fields Mapped: 1")')).toBeVisible();
    
    // Select "Yes"
    await page.click(`input[name="${subsection.key}-flag"][value="YES"]`);
    
    // Add an entry
    await page.click(`[data-testid="add-${subsection.key}-entry"]`);
    
    // Wait for entry to be added
    await page.waitForTimeout(500);
    
    // Check that field count has increased (flag field + organization entry fields)
    const totalFieldsText = await summarySection.locator('p:has-text("Total Fields Mapped:")').textContent();
    const fieldCount = parseInt(totalFieldsText?.match(/\d+$/)?.[0] || '0');
    
    // Should be more than 1 (flag field + entry fields)
    expect(fieldCount).toBeGreaterThan(1);
  });

  test('All subsections maintain state when switching between tabs', async ({ page }) => {
    // Set up different states for different subsections
    
    // Set terrorism organizations to Yes with an entry
    await page.click('button:has-text("29.1 Terrorism Organizations")');
    await page.click('input[name="terrorismOrganizations-flag"][value="YES"]');
    await page.click('[data-testid="add-terrorismOrganizations-entry"]');
    
    // Set terrorism activities to Yes
    await page.click('button:has-text("29.2 Terrorism Activities")');
    await page.click('input[name="terrorismActivities-flag"][value="YES"]');
    
    // Leave violent overthrow as No (default)
    await page.click('button:has-text("29.3 Violent Overthrow Organizations")');
    // Should already be "No" by default
    
    // Go back to terrorism organizations and verify state is preserved
    await page.click('button:has-text("29.1 Terrorism Organizations")');
    await expect(page.locator('input[name="terrorismOrganizations-flag"][value="YES"]')).toBeChecked();
    await expect(page.locator('text=Organization 1')).toBeVisible();
    
    // Go to terrorism activities and verify state is preserved
    await page.click('button:has-text("29.2 Terrorism Activities")');
    await expect(page.locator('input[name="terrorismActivities-flag"][value="YES"]')).toBeChecked();
    await expect(page.locator('[data-testid="add-terrorismActivities-entry"]')).toBeVisible();
    
    // Go to violent overthrow and verify it's still "No"
    await page.click('button:has-text("29.3 Violent Overthrow Organizations")');
    await expect(page.locator('input[name="violentOverthrowOrganizations-flag"][value="NO"]')).toBeChecked();
  });
});
