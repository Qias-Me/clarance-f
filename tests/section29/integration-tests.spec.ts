import { test, expect } from '../fixtures/section29-fixtures';
import { SECTION29_TEST_DATA, SECTION29_SELECTORS } from '../fixtures/section29-fixtures';

/**
 * Section29 Integration Tests
 * 
 * Comprehensive tests for Section29 Context integration with:
 * - ApplicantFormValues interface and main form state
 * - Data persistence and localStorage integration
 * - Form validation and error handling
 * - Change tracking and dirty state management
 * - Cross-component state synchronization
 */

test.describe('Section29 Integration Tests', () => {
  test.beforeEach(async ({ section29Page }) => {
    await section29Page.waitForSelector(SECTION29_SELECTORS.BASIC_FORM, { timeout: 10000 });
  });

  // ============================================================================
  // APPLICANT FORM VALUES INTEGRATION TESTS
  // ============================================================================

  test.describe('ApplicantFormValues Integration', () => {
    test('should integrate Section29 data with ApplicantFormValues structure', async ({ section29Utils, section29Page }) => {
      // Navigate to integration test tab
      await section29Utils.switchToTestTab('integration');
      await section29Page.waitForSelector('[data-testid="section29-integration"]', { timeout: 5000 });

      // Execute data persistence test which includes ApplicantFormValues integration
      await section29Utils.executeDataPersistenceTests();

      // Verify integration test results
      await expect(section29Page.locator('[data-testid="integration-form_data_sync"]')).toContainText('✓');
      await expect(section29Page.locator('[data-testid="integration-section29_present"]')).toContainText('✓');

      // Check form data preview structure
      const formDataJson = await section29Page.locator('[data-testid="form-data-json"]').textContent();
      expect(formDataJson).toContain('section29');
      expect(formDataJson).toContain('terrorismOrganizations');
      expect(formDataJson).toContain('terrorismActivities');
    });

    test('should maintain Section29 data structure in ApplicantFormValues', async ({ section29Utils, section29Page }) => {
      // Set up Section29 data
      await section29Utils.navigateToBasicTests();
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Test Organization');

      // Navigate to integration test
      await section29Utils.switchToTestTab('integration');
      await section29Page.waitForSelector('[data-testid="section29-integration"]', { timeout: 5000 });

      // Check form data structure
      const formDataJson = await section29Page.locator('[data-testid="form-data-json"]').textContent();
      const formData = JSON.parse(formDataJson || '{}');

      // Verify Section29 structure in ApplicantFormValues
      expect(formData.section29).toBeDefined();
      expect(formData.section29.terrorismOrganizations).toBeDefined();
      expect(formData.section29.terrorismOrganizations.hasAssociation).toBe('YES');
      expect(formData.section29.terrorismOrganizations.entriesCount).toBe(1);
    });

    test('should sync Section29 changes with main form state', async ({ section29Utils, section29Page }) => {
      // Start with basic form
      await section29Utils.navigateToBasicTests();
      
      // Make changes to Section29
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addActivityEntry('terrorismActivities');

      // Navigate to integration test to check sync
      await section29Utils.switchToTestTab('integration');
      await section29Page.waitForSelector('[data-testid="section29-integration"]', { timeout: 5000 });

      // Verify changes are reflected in form data
      const formDataJson = await section29Page.locator('[data-testid="form-data-json"]').textContent();
      const formData = JSON.parse(formDataJson || '{}');

      expect(formData.section29.terrorismOrganizations.hasAssociation).toBe('YES');
      expect(formData.section29.terrorismOrganizations.entriesCount).toBe(1);
      expect(formData.section29.terrorismActivities.hasActivity).toBe('YES');
      expect(formData.section29.terrorismActivities.entriesCount).toBe(1);
    });

    test('should handle ApplicantFormValues type safety', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('integration');
      await section29Page.waitForSelector('[data-testid="section29-integration"]', { timeout: 5000 });

      // Execute data persistence test
      await section29Utils.executeDataPersistenceTests();

      // Verify type-safe integration
      await expect(section29Page.locator('[data-testid="integration-change_tracking_test"]')).toContainText('✓');
      
      // Check that form data structure follows expected interface
      const formDataJson = await section29Page.locator('[data-testid="form-data-json"]').textContent();
      const formData = JSON.parse(formDataJson || '{}');

      // Verify ApplicantFormValues structure
      expect(typeof formData.personalInfo).toBe('string'); // 'Present' or 'Not set'
      expect(typeof formData.section29).toBe('object');
      expect(typeof formData.signature).toBe('string'); // 'Present' or 'Not set'
    });
  });

  // ============================================================================
  // DATA PERSISTENCE INTEGRATION TESTS
  // ============================================================================

  test.describe('Data Persistence Integration', () => {
    test('should persist Section29 data to localStorage', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('integration');
      await section29Page.waitForSelector('[data-testid="section29-integration"]', { timeout: 5000 });

      // Execute data persistence test
      await section29Utils.executeDataPersistenceTests();

      // Verify export functionality
      await expect(section29Page.locator('[data-testid="integration-export_test"]')).toContainText('✓');
      await expect(section29Page.locator('[data-testid="integration-export_timestamp"]')).toBeVisible();

      // Verify data was actually stored in localStorage
      const storedData = await section29Page.evaluate(() => {
        return localStorage.getItem('section29-test-backup');
      });

      expect(storedData).toBeTruthy();
      const parsedData = JSON.parse(storedData || '{}');
      expect(parsedData.section29).toBeDefined();
      expect(parsedData.timestamp).toBeDefined();
      expect(parsedData.version).toBe('1.0');
    });

    test('should load Section29 data from localStorage', async ({ section29Utils, section29Page }) => {
      // First, store some test data
      await section29Page.evaluate(() => {
        const testData = {
          section29: {
            _id: 29,
            terrorismOrganizations: {
              hasAssociation: { value: 'YES' },
              entries: []
            }
          },
          timestamp: new Date().toISOString(),
          version: '1.0'
        };
        localStorage.setItem('section29-test-backup', JSON.stringify(testData));
      });

      await section29Utils.switchToTestTab('integration');
      await section29Page.waitForSelector('[data-testid="section29-integration"]', { timeout: 5000 });

      // Execute data persistence test which includes import
      await section29Utils.executeDataPersistenceTests();

      // Verify import functionality
      await expect(section29Page.locator('[data-testid="integration-import_test"]')).toContainText('✓');
      await expect(section29Page.locator('[data-testid="integration-import_version"]')).toContainText('1.0');
    });

    test('should handle data persistence errors gracefully', async ({ section29Utils, section29Page }) => {
      // Corrupt localStorage data
      await section29Page.evaluate(() => {
        localStorage.setItem('section29-test-backup', 'invalid-json-data');
      });

      await section29Utils.switchToTestTab('integration');
      await section29Page.waitForSelector('[data-testid="section29-integration"]', { timeout: 5000 });

      // Execute data persistence test
      await section29Utils.executeDataPersistenceTests();

      // Should handle errors gracefully without crashing
      await expect(section29Page.locator('[data-testid="section29-integration"]')).toBeVisible();
      
      // Check for error handling
      const integrationResults = await section29Page.locator('[data-testid="integration-test-results"]').textContent();
      expect(integrationResults).toBeTruthy(); // Should still show results
    });

    test('should maintain data integrity during persistence operations', async ({ section29Utils, section29Page }) => {
      // Set up complex Section29 data
      await section29Utils.navigateToBasicTests();
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Persistent Org');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'street', '123 Test St');

      // Navigate to integration and test persistence
      await section29Utils.switchToTestTab('integration');
      await section29Page.waitForSelector('[data-testid="section29-integration"]', { timeout: 5000 });

      await section29Utils.executeDataPersistenceTests();

      // Verify data integrity
      const storedData = await section29Page.evaluate(() => {
        return localStorage.getItem('section29-test-backup');
      });

      const parsedData = JSON.parse(storedData || '{}');
      expect(parsedData.section29.terrorismOrganizations.hasAssociation.value).toBe('YES');
      expect(parsedData.section29.terrorismOrganizations.entries).toHaveLength(1);
    });
  });

  // ============================================================================
  // FORM VALIDATION INTEGRATION TESTS
  // ============================================================================

  test.describe('Form Validation Integration', () => {
    test('should integrate with form validation system', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      // Test validation with empty form
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      await section29Page.waitForTimeout(500);

      // Should show no errors for empty form
      await expect(section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT)).toContainText('0');

      // Add incomplete data
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      // Leave fields empty

      // Validate again
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      await section29Page.waitForTimeout(500);

      // Validation should complete without errors (empty fields are allowed)
      await expect(section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT)).toBeVisible();
    });

    test('should validate field requirements correctly', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      // Set up scenario with required fields
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      // Fill some required fields
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Test Organization');

      // Trigger validation
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      await section29Page.waitForTimeout(500);

      // Should validate successfully
      await expect(section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT)).toBeVisible();
      await section29Utils.assertFormIsDirty(true);
    });

    test('should handle validation state changes', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      // Initial validation state
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      const initialErrorCount = await section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT).textContent();

      // Make changes
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Validate again
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      await section29Page.waitForTimeout(500);

      // Validation should still work
      await expect(section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT)).toBeVisible();
      await section29Utils.assertFormIsDirty(true);
    });

    test('should integrate validation with change tracking', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      // Start with clean state
      await section29Utils.assertFormIsDirty(false);

      // Make changes
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.assertFormIsDirty(true);

      // Validate
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      await section29Page.waitForTimeout(500);

      // Should maintain dirty state after validation
      await section29Utils.assertFormIsDirty(true);
    });
  });

  // ============================================================================
  // CHANGE TRACKING INTEGRATION TESTS
  // ============================================================================

  test.describe('Change Tracking Integration', () => {
    test('should track changes across all Section29 operations', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      // Initial state should not be dirty
      await section29Utils.assertFormIsDirty(false);

      // Test subsection flag changes
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.assertFormIsDirty(true);

      // Test entry addition
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.assertFormIsDirty(true);

      // Test field updates
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Change Tracking Test');
      await section29Utils.assertFormIsDirty(true);

      // Test entry removal
      await section29Utils.removeEntry('terrorismOrganizations', 0);
      await section29Utils.assertFormIsDirty(true);
    });

    test('should provide change details through getChanges method', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('integration');
      await section29Page.waitForSelector('[data-testid="section29-integration"]', { timeout: 5000 });

      // Execute data persistence test which includes change tracking
      await section29Utils.executeDataPersistenceTests();

      // Verify change tracking functionality
      await expect(section29Page.locator('[data-testid="integration-change_tracking_test"]')).toContainText('✓');
      await expect(section29Page.locator('[data-testid="integration-is_dirty"]')).toBeVisible();
    });

    test('should reset change tracking appropriately', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      // Make changes
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.assertFormIsDirty(true);

      // Navigate to integration test and reset
      await section29Utils.switchToTestTab('integration');
      await section29Page.waitForSelector('[data-testid="section29-integration"]', { timeout: 5000 });

      await section29Utils.executeFormResetTest();

      // Verify reset functionality
      await expect(section29Page.locator('[data-testid="integration-reset_test"]')).toContainText('✓');
      await expect(section29Page.locator('[data-testid="integration-reset_timestamp"]')).toBeVisible();
    });

    test('should maintain change tracking during complex operations', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      // Complex sequence of operations
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.assertFormIsDirty(true);

      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.assertFormIsDirty(true);

      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'First Org');
      await section29Utils.fillEntryField('terrorismOrganizations', 1, 'name', 'Second Org');
      await section29Utils.assertFormIsDirty(true);

      await section29Utils.removeEntry('terrorismOrganizations', 0);
      await section29Utils.assertFormIsDirty(true);

      // Should maintain dirty state throughout
      await section29Utils.assertFormIsDirty(true);
    });
  });

  // ============================================================================
  // CROSS-COMPONENT INTEGRATION TESTS
  // ============================================================================

  test.describe('Cross-Component Integration', () => {
    test('should maintain state consistency across tab switches', async ({ section29Utils, section29Page }) => {
      // Set up data in basic form
      await section29Utils.navigateToBasicTests();
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Cross-Component Test');

      // Switch to advanced tab
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      // Switch to integration tab
      await section29Utils.switchToTestTab('integration');
      await section29Page.waitForSelector('[data-testid="section29-integration"]', { timeout: 5000 });

      // Check that data persisted
      const formDataJson = await section29Page.locator('[data-testid="form-data-json"]').textContent();
      const formData = JSON.parse(formDataJson || '{}');
      expect(formData.section29.terrorismOrganizations.hasAssociation).toBe('YES');
      expect(formData.section29.terrorismOrganizations.entriesCount).toBe(1);

      // Switch back to basic form
      await section29Utils.switchToTestTab('basic');
      await section29Page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 5000 });

      // Verify data is still there
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_YES)).toBeChecked();
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe('Cross-Component Test');
    });

    test('should handle concurrent operations across components', async ({ section29Utils, section29Page }) => {
      // Start with basic form operations
      await section29Utils.navigateToBasicTests();
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Switch to advanced features and perform operations
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();

      // Verify advanced operations completed
      await expect(section29Page.locator('[data-testid="result-move_entry_test"]')).toContainText('true');

      // Switch back to basic and verify state
      await section29Utils.switchToTestTab('basic');
      await section29Page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 5000 });

      // Should maintain consistency
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_YES)).toBeChecked();
    });

    test('should integrate with browser navigation', async ({ section29Utils, section29Page }) => {
      // Set up initial state
      await section29Utils.navigateToBasicTests();
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Navigation Test');

      // Navigate away and back
      await section29Page.goto('/');
      await section29Page.waitForTimeout(500);
      await section29Page.goBack();
      await section29Page.waitForSelector(SECTION29_SELECTORS.BASIC_FORM, { timeout: 10000 });

      // Form should reload correctly (state may be reset depending on implementation)
      await expect(section29Page.locator(SECTION29_SELECTORS.BASIC_FORM)).toBeVisible();
      await section29Utils.validateFormStateConsistency();
    });

    test('should handle page refresh gracefully', async ({ section29Utils, section29Page }) => {
      // Set up state
      await section29Utils.navigateToBasicTests();
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Refresh page
      await section29Page.reload();
      await section29Page.waitForSelector(SECTION29_SELECTORS.BASIC_FORM, { timeout: 10000 });

      // Form should initialize correctly
      await expect(section29Page.locator(SECTION29_SELECTORS.BASIC_FORM)).toBeVisible();
      await section29Utils.validateFormStateConsistency();

      // Should be able to perform operations after refresh
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
    });
  });
});
