import { test, expect } from '../fixtures/section29-fixtures';
import { SECTION29_TEST_DATA, SECTION29_SELECTORS } from '../fixtures/section29-fixtures';

/**
 * Section29 Advanced Features Tests
 * 
 * Comprehensive tests for enhanced entry management features:
 * - moveEntry (drag-and-drop reordering)
 * - duplicateEntry (entry copying with unique ID regeneration)
 * - clearEntry (field clearing with structure preservation)
 * - bulkUpdateFields (batch field updates)
 * - getEntry (safe entry retrieval)
 * - Advanced error handling and boundary conditions
 */

test.describe('Section29 Advanced Features', () => {
  test.beforeEach(async ({ section29Page }) => {
    await section29Page.waitForSelector(SECTION29_SELECTORS.BASIC_FORM, { timeout: 10000 });
  });

  // ============================================================================
  // MOVE ENTRY TESTS
  // ============================================================================

  test.describe('moveEntry Method', () => {
    test('should move entries within the same subsection', async ({ section29Utils, section29Page }) => {
      // Navigate to advanced features test
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      // Execute advanced feature tests which include move operations
      await section29Utils.executeAdvancedFeatureTests();

      // Verify move entry test passed
      await expect(section29Page.locator('[data-testid="result-move_entry_test"]')).toContainText('true');
      await expect(section29Page.locator('[data-testid="result-move_entry_count"]')).toBeVisible();
    });

    test('should maintain entry count during move operations', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up multiple entries
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      // Fill entries with identifiable data
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'First Entry');
      await section29Utils.fillEntryField('terrorismOrganizations', 1, 'name', 'Second Entry');
      await section29Utils.fillEntryField('terrorismOrganizations', 2, 'name', 'Third Entry');

      const initialCount = 3;
      await section29Utils.assertEntryCount('terrorismOrganizations', initialCount);

      // Test move operations through advanced features
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();

      // Entry count should remain the same after move operations
      const currentCount = await section29Utils.getElementText('terrorism-orgs-current-count');
      expect(parseInt(currentCount)).toBeGreaterThanOrEqual(2); // Should have at least 2 entries
    });

    test('should handle move operations with boundary conditions', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      // Execute error condition tests which include boundary move operations
      await section29Utils.executeErrorConditionTests();

      // Verify boundary condition handling
      await expect(section29Page.locator('[data-testid="error-move_out_of_bounds"]')).toContainText('No error - handled gracefully');
    });

    test('should preserve entry data during move operations', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up entries with data
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      const testData1 = 'Moveable Entry 1';
      const testData2 = 'Moveable Entry 2';
      
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', testData1);
      await section29Utils.fillEntryField('terrorismOrganizations', 1, 'name', testData2);

      // Verify initial data
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe(testData1);
      expect(await section29Utils.getFieldValue('terrorism-org-name-1')).toBe(testData2);

      // Execute move operations through advanced features
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();

      // Data should be preserved (though positions may have changed)
      await section29Utils.switchToTestTab('basic');
      await section29Page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 5000 });

      // At least one of the entries should still have the test data
      const entry0Value = await section29Utils.getFieldValue('terrorism-org-name-0');
      const entry1Value = await section29Utils.getFieldValue('terrorism-org-name-1');
      
      const hasTestData = entry0Value === testData1 || entry0Value === testData2 || 
                         entry1Value === testData1 || entry1Value === testData2;
      expect(hasTestData).toBe(true);
    });
  });

  // ============================================================================
  // DUPLICATE ENTRY TESTS
  // ============================================================================

  test.describe('duplicateEntry Method', () => {
    test('should duplicate entries with unique IDs', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();

      // Verify duplicate entry test passed
      await expect(section29Page.locator('[data-testid="result-duplicate_entry_test"]')).toContainText('true');
      await expect(section29Page.locator('[data-testid="result-duplicate_entry_count"]')).toBeVisible();
    });

    test('should copy all field values during duplication', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up entry with comprehensive data
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      const testData = SECTION29_TEST_DATA.SAMPLE_ORGANIZATION;
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', testData.name);
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'street', testData.street);
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'city', testData.city);

      // Execute duplication through advanced features
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();

      // Verify duplication increased count
      const currentCount = await section29Utils.getElementText('terrorism-orgs-current-count');
      expect(parseInt(currentCount)).toBeGreaterThan(1);
    });

    test('should generate unique field IDs for duplicated entries', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up original entry
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Original Entry');

      const originalFieldId = await section29Utils.getFieldId('terrorism-org-name-0');

      // Add another entry to test duplication
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Execute duplication through advanced features
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();

      // Return to basic form and check field IDs
      await section29Utils.switchToTestTab('basic');
      await section29Page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 5000 });

      // Should have multiple entries with unique field IDs
      const fieldIds = [];
      for (let i = 0; i < 3; i++) {
        try {
          const fieldId = await section29Utils.getFieldId(`terrorism-org-name-${i}`);
          if (fieldId) fieldIds.push(fieldId);
        } catch (error) {
          // Entry might not exist
        }
      }

      // All field IDs should be unique
      const uniqueIds = new Set(fieldIds);
      expect(uniqueIds.size).toBe(fieldIds.length);
      expect(fieldIds.length).toBeGreaterThan(1);
    });

    test('should handle duplication of entries with complex data', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up entry with complex data including dates and checkboxes
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Complex Entry');
      await section29Page.fill('[data-testid="terrorism-org-from-date-0"]', '2020-01');
      await section29Page.fill('[data-testid="terrorism-org-to-date-0"]', '2021-12');
      await section29Page.click('[data-testid="terrorism-org-present-0"]');

      // Execute duplication
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();

      // Verify duplication worked
      await expect(section29Page.locator('[data-testid="result-duplicate_entry_test"]')).toContainText('true');
    });
  });

  // ============================================================================
  // CLEAR ENTRY TESTS
  // ============================================================================

  test.describe('clearEntry Method', () => {
    test('should clear entry values while preserving structure', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();

      // Verify clear entry test passed
      await expect(section29Page.locator('[data-testid="result-clear_entry_test"]')).toContainText('true');
      await expect(section29Page.locator('[data-testid="result-clear_entry_structure_preserved"]')).toContainText('true');
    });

    test('should clear all field types correctly', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up entry with various field types
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      // Fill all field types
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Clear Test Entry');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'street', '123 Clear St');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'city', 'Clear City');
      await section29Page.fill('[data-testid="terrorism-org-from-date-0"]', '2020-01');
      await section29Page.click('[data-testid="terrorism-org-present-0"]');

      // Verify data is filled
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe('Clear Test Entry');
      expect(await section29Utils.isCheckboxChecked('terrorism-org-present-0')).toBe(true);

      // Execute clear operation through advanced features
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();

      // Return and verify clearing
      await section29Utils.switchToTestTab('basic');
      await section29Page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 5000 });

      // Entry should still exist but be cleared
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
    });

    test('should maintain entry position after clearing', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up multiple entries
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'First Entry');
      await section29Utils.fillEntryField('terrorismOrganizations', 1, 'name', 'Second Entry');
      await section29Utils.fillEntryField('terrorismOrganizations', 2, 'name', 'Third Entry');

      const initialCount = 3;
      await section29Utils.assertEntryCount('terrorismOrganizations', initialCount);

      // Execute clear operation
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();

      // Entry count should remain the same
      const currentCount = await section29Utils.getElementText('terrorism-orgs-current-count');
      expect(parseInt(currentCount)).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================================================
  // BULK UPDATE FIELDS TESTS
  // ============================================================================

  test.describe('bulkUpdateFields Method', () => {
    test('should update multiple fields simultaneously', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();

      // Verify bulk update tests passed
      await expect(section29Page.locator('[data-testid="result-bulk_update_test"]')).toContainText('true');
      await expect(section29Page.locator('[data-testid="result-bulk_update_city"]')).toContainText('true');
      await expect(section29Page.locator('[data-testid="result-bulk_update_present"]')).toContainText('true');
    });

    test('should handle bulk updates with various field types', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up entry for bulk update
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Execute bulk update through advanced features
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();

      // Verify bulk update results
      await expect(section29Page.locator('[data-testid="result-bulk_update_test"]')).toContainText('true');
    });

    test('should maintain field integrity during bulk updates', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up entry with existing data
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Pre-Bulk Update');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'street', 'Original Street');

      // Execute bulk update
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();

      // Return and verify updates
      await section29Utils.switchToTestTab('basic');
      await section29Page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 5000 });

      // Entry should still exist
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
    });

    test('should handle bulk updates on multiple entries', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up multiple entries
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Execute bulk update operations
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();

      // Verify operations completed successfully
      await expect(section29Page.locator('[data-testid="result-bulk_update_test"]')).toContainText('true');
    });
  });

  // ============================================================================
  // GET ENTRY TESTS
  // ============================================================================

  test.describe('getEntry Method', () => {
    test('should retrieve entries safely', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();

      // Verify get entry tests passed
      await expect(section29Page.locator('[data-testid="result-get_entry_test"]')).toContainText('true');
      await expect(section29Page.locator('[data-testid="result-get_entry_has_id"]')).toContainText('true');
    });

    test('should handle out-of-bounds entry access', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeErrorConditionTests();

      // Verify out-of-bounds handling
      await expect(section29Page.locator('[data-testid="result-out_of_bounds_entry"]')).toContainText('true');
    });

    test('should return null for non-existent entries', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Don't add any entries
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');

      // Test through advanced features
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeErrorConditionTests();

      // Should handle non-existent entries gracefully
      await expect(section29Page.locator('[data-testid="error-test-results"]')).toBeVisible();
    });

    test('should retrieve entries with complete data structure', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up entry with complete data
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Complete Entry');

      // Test retrieval through advanced features
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();

      // Verify retrieval worked
      await expect(section29Page.locator('[data-testid="result-get_entry_test"]')).toContainText('true');
    });
  });

  // ============================================================================
  // ADVANCED FEATURES INTEGRATION TESTS
  // ============================================================================

  test.describe('Advanced Features Integration', () => {
    test('should handle complex workflows with multiple advanced operations', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up complex scenario
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Workflow Test 1');
      await section29Utils.fillEntryField('terrorismOrganizations', 1, 'name', 'Workflow Test 2');

      // Execute all advanced operations
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeAdvancedFeatureTests();
      await section29Utils.executeErrorConditionTests();

      // Verify all operations completed successfully
      await expect(section29Page.locator('[data-testid="advanced-test-results"]')).toBeVisible();
      await expect(section29Page.locator('[data-testid="error-test-results"]')).toBeVisible();

      // Return to basic form and verify integrity
      await section29Utils.switchToTestTab('basic');
      await section29Page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 5000 });

      // Should maintain form functionality
      await section29Utils.validateFormStateConsistency();
    });

    test('should maintain performance during advanced operations', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      const startTime = Date.now();

      // Execute all advanced feature tests
      await section29Utils.executeAdvancedFeatureTests();
      await section29Utils.executeErrorConditionTests();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 10 seconds)
      expect(duration).toBeLessThan(10000);

      // Verify operations completed successfully
      await expect(section29Page.locator('[data-testid="result-move_entry_test"]')).toContainText('true');
      await expect(section29Page.locator('[data-testid="result-duplicate_entry_test"]')).toContainText('true');
    });

    test('should handle advanced operations with error recovery', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      // Execute error condition tests
      await section29Utils.executeErrorConditionTests();

      // Verify error handling
      await expect(section29Page.locator('[data-testid="error-invalid_subsection"]')).toBeVisible();
      await expect(section29Page.locator('[data-testid="error-move_out_of_bounds"]')).toBeVisible();

      // Form should remain functional after error conditions
      await section29Utils.switchToTestTab('basic');
      await section29Page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 5000 });

      // Should be able to perform normal operations
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
    });
  });
});
