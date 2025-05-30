import { test, expect } from '../fixtures/section29-fixtures';
import { SECTION29_TEST_DATA, SECTION29_SELECTORS } from '../fixtures/section29-fixtures';

/**
 * Section29 CRUD Operations Tests
 * 
 * Comprehensive tests for all Section29 Context CRUD methods:
 * - updateSubsectionFlag (YES/NO radio button interactions)
 * - addOrganizationEntry (organization entry creation)
 * - addActivityEntry (activity entry creation)
 * - removeEntry (entry deletion)
 * - updateFieldValue (field value updates)
 * 
 * These tests verify that all context methods work correctly with proper
 * state updates, immutable data handling, and UI synchronization.
 */

test.describe('Section29 CRUD Operations', () => {
  test.beforeEach(async ({ section29Page }) => {
    // Each test starts with a clean page
    await section29Page.waitForSelector(SECTION29_SELECTORS.BASIC_FORM, { timeout: 10000 });
  });

  // ============================================================================
  // UPDATE SUBSECTION FLAG TESTS
  // ============================================================================

  test.describe('updateSubsectionFlag Method', () => {
    test('should update terrorism organizations flag to YES', async ({ section29Utils, section29Page }) => {
      // Initial state should be NO
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_NO)).toBeChecked();
      await section29Utils.assertFormIsDirty(false);

      // Update to YES
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');

      // Verify state changes
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_YES)).toBeChecked();
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_NO)).not.toBeChecked();
      await section29Utils.assertFormIsDirty(true);

      // Verify entries section becomes visible
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_ENTRIES)).toBeVisible();
      await expect(section29Page.locator(SECTION29_SELECTORS.ADD_TERRORISM_ORG)).toBeVisible();
    });

    test('should update terrorism organizations flag to NO', async ({ section29Utils, section29Page }) => {
      // First set to YES
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_YES)).toBeChecked();

      // Then set back to NO
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'NO');

      // Verify state changes
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_NO)).toBeChecked();
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_YES)).not.toBeChecked();
      await section29Utils.assertFormIsDirty(true);

      // Verify entries section becomes hidden
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_ENTRIES)).not.toBeVisible();
    });

    test('should update terrorism activities flag', async ({ section29Utils, section29Page }) => {
      // Test terrorism activities subsection
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');

      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ACTIVITIES_YES)).toBeChecked();
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ACTIVITIES_NO)).not.toBeChecked();
      await section29Utils.assertFormIsDirty(true);

      // Verify entries section becomes visible
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ACTIVITIES_ENTRIES)).toBeVisible();
      await expect(section29Page.locator(SECTION29_SELECTORS.ADD_TERRORISM_ACTIVITY)).toBeVisible();
    });

    test('should handle multiple subsection flag updates', async ({ section29Utils, section29Page }) => {
      // Update multiple subsections
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');

      // Verify both are updated
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_YES)).toBeChecked();
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ACTIVITIES_YES)).toBeChecked();
      await section29Utils.assertFormIsDirty(true);

      // Both entry sections should be visible
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_ENTRIES)).toBeVisible();
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ACTIVITIES_ENTRIES)).toBeVisible();
    });
  });

  // ============================================================================
  // ADD ORGANIZATION ENTRY TESTS
  // ============================================================================

  test.describe('addOrganizationEntry Method', () => {
    test('should add organization entry to terrorism organizations', async ({ section29Utils, section29Page }) => {
      // Enable the subsection first
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      
      // Initial count should be 0
      await section29Utils.assertEntryCount('terrorismOrganizations', 0);

      // Add an organization entry
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Verify entry was added
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
      await expect(section29Page.locator('[data-testid="terrorism-org-entry-0"]')).toBeVisible();

      // Verify entry fields are present
      await expect(section29Page.locator('[data-testid="terrorism-org-name-0"]')).toBeVisible();
      await expect(section29Page.locator('[data-testid="terrorism-org-street-0"]')).toBeVisible();
      await expect(section29Page.locator('[data-testid="terrorism-org-city-0"]')).toBeVisible();
      await expect(section29Page.locator('[data-testid="terrorism-org-from-date-0"]')).toBeVisible();
      await expect(section29Page.locator('[data-testid="terrorism-org-to-date-0"]')).toBeVisible();
      await expect(section29Page.locator('[data-testid="terrorism-org-present-0"]')).toBeVisible();
    });

    test('should add multiple organization entries', async ({ section29Utils, section29Page }) => {
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');

      // Add multiple entries
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Verify all entries were added
      await section29Utils.assertEntryCount('terrorismOrganizations', 3);
      await expect(section29Page.locator('[data-testid="terrorism-org-entry-0"]')).toBeVisible();
      await expect(section29Page.locator('[data-testid="terrorism-org-entry-1"]')).toBeVisible();
      await expect(section29Page.locator('[data-testid="terrorism-org-entry-2"]')).toBeVisible();
    });

    test('should generate unique field IDs for each entry', async ({ section29Utils, section29Page }) => {
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      
      // Add two entries
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Get field IDs for both entries
      const entry1NameId = await section29Utils.getFieldId('terrorism-org-name-0');
      const entry2NameId = await section29Utils.getFieldId('terrorism-org-name-1');

      // Verify IDs are different and follow expected patterns
      expect(entry1NameId).not.toBe(entry2NameId);
      expect(entry1NameId).toContain('TextField11[1]'); // Entry #1 pattern
      expect(entry2NameId).toContain('TextField11[8]'); // Entry #2 pattern
    });

    test('should maintain form dirty state when adding entries', async ({ section29Utils, section29Page }) => {
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.assertFormIsDirty(true);

      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.assertFormIsDirty(true);
    });
  });

  // ============================================================================
  // ADD ACTIVITY ENTRY TESTS
  // ============================================================================

  test.describe('addActivityEntry Method', () => {
    test('should add activity entry to terrorism activities', async ({ section29Utils, section29Page }) => {
      // Enable the subsection first
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');
      
      // Initial count should be 0
      await section29Utils.assertEntryCount('terrorismActivities', 0);

      // Add an activity entry
      await section29Utils.addActivityEntry('terrorismActivities');

      // Verify entry was added
      await section29Utils.assertEntryCount('terrorismActivities', 1);
      await expect(section29Page.locator('[data-testid="terrorism-activity-entry-0"]')).toBeVisible();

      // Verify activity-specific fields are present
      await expect(section29Page.locator('[data-testid="terrorism-activity-description-0"]')).toBeVisible();
    });

    test('should add multiple activity entries', async ({ section29Utils, section29Page }) => {
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');

      // Add multiple entries
      await section29Utils.addActivityEntry('terrorismActivities');
      await section29Utils.addActivityEntry('terrorismActivities');

      // Verify all entries were added
      await section29Utils.assertEntryCount('terrorismActivities', 2);
      await expect(section29Page.locator('[data-testid="terrorism-activity-entry-0"]')).toBeVisible();
      await expect(section29Page.locator('[data-testid="terrorism-activity-entry-1"]')).toBeVisible();
    });

    test('should generate correct field IDs for activity entries', async ({ section29Utils, section29Page }) => {
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');
      await section29Utils.addActivityEntry('terrorismActivities');

      const activityDescriptionId = await section29Utils.getFieldId('terrorism-activity-description-0');
      
      // Verify activity field ID follows expected pattern
      expect(activityDescriptionId).toContain('Section29_2[0].TextField11[0]');
    });
  });

  // ============================================================================
  // REMOVE ENTRY TESTS
  // ============================================================================

  test.describe('removeEntry Method', () => {
    test('should remove organization entry', async ({ section29Utils, section29Page }) => {
      // Setup: Add entries first
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.assertEntryCount('terrorismOrganizations', 2);

      // Remove first entry
      await section29Utils.removeEntry('terrorismOrganizations', 0);

      // Verify entry was removed
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
      await expect(section29Page.locator('[data-testid="terrorism-org-entry-1"]')).not.toBeVisible();
    });

    test('should remove activity entry', async ({ section29Utils, section29Page }) => {
      // Setup: Add entries first
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');
      await section29Utils.addActivityEntry('terrorismActivities');
      await section29Utils.assertEntryCount('terrorismActivities', 1);

      // Remove the entry
      await section29Utils.removeEntry('terrorismActivities', 0);

      // Verify entry was removed
      await section29Utils.assertEntryCount('terrorismActivities', 0);
      await expect(section29Page.locator('[data-testid="terrorism-activity-entry-0"]')).not.toBeVisible();
    });

    test('should handle removing all entries', async ({ section29Utils, section29Page }) => {
      // Setup: Add multiple entries
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.assertEntryCount('terrorismOrganizations', 3);

      // Remove all entries one by one
      await section29Utils.removeEntry('terrorismOrganizations', 0);
      await section29Utils.assertEntryCount('terrorismOrganizations', 2);

      await section29Utils.removeEntry('terrorismOrganizations', 0);
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);

      await section29Utils.removeEntry('terrorismOrganizations', 0);
      await section29Utils.assertEntryCount('terrorismOrganizations', 0);

      // Verify no entries remain
      await expect(section29Page.locator('[data-testid="terrorism-org-entry-0"]')).not.toBeVisible();
    });

    test('should maintain form dirty state when removing entries', async ({ section29Utils, section29Page }) => {
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.assertFormIsDirty(true);

      await section29Utils.removeEntry('terrorismOrganizations', 0);
      await section29Utils.assertFormIsDirty(true);
    });
  });

  // ============================================================================
  // UPDATE FIELD VALUE TESTS
  // ============================================================================

  test.describe('updateFieldValue Method', () => {
    test('should update organization name field', async ({ section29Utils, section29Page }) => {
      // Setup: Add an organization entry
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Update organization name
      const testName = SECTION29_TEST_DATA.SAMPLE_ORGANIZATION.name;
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', testName);

      // Verify field was updated
      const fieldValue = await section29Utils.getFieldValue('terrorism-org-name-0');
      expect(fieldValue).toBe(testName);
      await section29Utils.assertFormIsDirty(true);
    });

    test('should update address fields', async ({ section29Utils, section29Page }) => {
      // Setup: Add an organization entry
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Update address fields
      const testData = SECTION29_TEST_DATA.SAMPLE_ORGANIZATION;
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'street', testData.street);
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'city', testData.city);

      // Verify fields were updated
      const streetValue = await section29Utils.getFieldValue('terrorism-org-street-0');
      const cityValue = await section29Utils.getFieldValue('terrorism-org-city-0');
      
      expect(streetValue).toBe(testData.street);
      expect(cityValue).toBe(testData.city);
    });

    test('should update date fields', async ({ section29Utils, section29Page }) => {
      // Setup: Add an organization entry
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Update date fields
      const fromDate = '2020-01';
      const toDate = '2021-12';
      
      await section29Page.fill('[data-testid="terrorism-org-from-date-0"]', fromDate);
      await section29Page.fill('[data-testid="terrorism-org-to-date-0"]', toDate);

      // Verify dates were updated
      const fromValue = await section29Utils.getFieldValue('terrorism-org-from-date-0');
      const toValue = await section29Utils.getFieldValue('terrorism-org-to-date-0');
      
      expect(fromValue).toBe(fromDate);
      expect(toValue).toBe(toDate);
    });

    test('should update checkbox fields', async ({ section29Utils, section29Page }) => {
      // Setup: Add an organization entry
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Initially checkbox should be unchecked
      const initialChecked = await section29Utils.isCheckboxChecked('terrorism-org-present-0');
      expect(initialChecked).toBe(false);

      // Check the present checkbox
      await section29Page.click('[data-testid="terrorism-org-present-0"]');

      // Verify checkbox was checked
      const finalChecked = await section29Utils.isCheckboxChecked('terrorism-org-present-0');
      expect(finalChecked).toBe(true);
    });

    test('should update activity description field', async ({ section29Utils, section29Page }) => {
      // Setup: Add an activity entry
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');
      await section29Utils.addActivityEntry('terrorismActivities');

      // Update activity description
      const testDescription = SECTION29_TEST_DATA.SAMPLE_ACTIVITY.description;
      await section29Page.fill('[data-testid="terrorism-activity-description-0"]', testDescription);

      // Verify field was updated
      const fieldValue = await section29Utils.getFieldValue('terrorism-activity-description-0');
      expect(fieldValue).toBe(testDescription);
    });

    test('should handle multiple field updates in sequence', async ({ section29Utils, section29Page }) => {
      // Setup: Add an organization entry
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Update multiple fields in sequence
      const testData = SECTION29_TEST_DATA.SAMPLE_ORGANIZATION;
      
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', testData.name);
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'street', testData.street);
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'city', testData.city);

      // Verify all fields were updated correctly
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe(testData.name);
      expect(await section29Utils.getFieldValue('terrorism-org-street-0')).toBe(testData.street);
      expect(await section29Utils.getFieldValue('terrorism-org-city-0')).toBe(testData.city);
      
      await section29Utils.assertFormIsDirty(true);
    });
  });

  // ============================================================================
  // INTEGRATION CRUD TESTS
  // ============================================================================

  test.describe('CRUD Integration Tests', () => {
    test('should handle complete CRUD workflow', async ({ section29Utils, section29Page }) => {
      // 1. Create: Enable subsection and add entries
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.assertEntryCount('terrorismOrganizations', 2);

      // 2. Update: Fill in data for first entry
      const testData = SECTION29_TEST_DATA.SAMPLE_ORGANIZATION;
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', testData.name);
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'street', testData.street);

      // 3. Read: Verify data was saved
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe(testData.name);
      expect(await section29Utils.getFieldValue('terrorism-org-street-0')).toBe(testData.street);

      // 4. Delete: Remove second entry
      await section29Utils.removeEntry('terrorismOrganizations', 1);
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);

      // 5. Verify first entry data persists
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe(testData.name);
      expect(await section29Utils.getFieldValue('terrorism-org-street-0')).toBe(testData.street);
    });

    test('should handle mixed organization and activity CRUD operations', async ({ section29Utils, section29Page }) => {
      // Add organization entries
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      // Add activity entries
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');
      await section29Utils.addActivityEntry('terrorismActivities');

      // Update both types
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Test Org');
      await section29Page.fill('[data-testid="terrorism-activity-description-0"]', 'Test Activity');

      // Verify both were updated
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe('Test Org');
      expect(await section29Utils.getFieldValue('terrorism-activity-description-0')).toBe('Test Activity');

      // Verify counts
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
      await section29Utils.assertEntryCount('terrorismActivities', 1);
    });
  });
});
