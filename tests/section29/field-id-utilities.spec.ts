import { test, expect } from '../fixtures/section29-fixtures';
import { SECTION29_TEST_DATA, SECTION29_SELECTORS } from '../fixtures/section29-fixtures';

/**
 * Section29 Field ID Generation Utilities Tests
 * 
 * Tests for the underlying field ID generation utilities and functions
 * used by the Section29 Context. These tests verify that the field ID
 * generation logic works correctly at the utility level, independent
 * of the React Context implementation.
 */

test.describe('Section29 Field ID Utilities', () => {
  test.beforeEach(async ({ section29Page }) => {
    await section29Page.waitForSelector(SECTION29_SELECTORS.BASIC_FORM, { timeout: 10000 });
  });

  // ============================================================================
  // FIELD ID GENERATION FUNCTION TESTS
  // ============================================================================

  test.describe('Field ID Generation Functions', () => {
    test('should test field ID generation utilities directly', async ({ section29Page }) => {
      // Test the field ID generation utilities by examining generated IDs
      await section29Page.goto('/test');
      await section29Page.waitForSelector('[data-testid="section29-field-id-validation"]', { timeout: 10000 });

      // Execute the field ID validation which tests the utilities
      await section29Page.click('[data-testid="validate-field-ids-button"]');
      await section29Page.waitForTimeout(1000);

      // Verify that the utilities generated correct patterns
      const results = await section29Page.locator('[data-testid="field-id-test-results"]').textContent();
      expect(results).toContain('✓ PASS');
    });

    test('should validate subsection key mapping', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('fieldid');
      await section29Page.waitForSelector('[data-testid="section29-field-id-validation"]', { timeout: 5000 });

      await section29Utils.executeFieldIdValidationTests();

      // Verify subsection mappings are correct
      const terrorismOrgsPattern = await section29Utils.getElementText('field-id-terrorism_orgs_id_value');
      const terrorismActivitiesPattern = await section29Utils.getElementText('field-id-terrorism_activities_id_value');

      // Terrorism organizations should map to Section29[0]
      expect(terrorismOrgsPattern).toContain('Section29[0].RadioButtonList[0]');
      
      // Terrorism activities should map to Section29_2[0]
      expect(terrorismActivitiesPattern).toContain('Section29_2[0].RadioButtonList[0]');
      
      // They should be different
      expect(terrorismOrgsPattern).not.toBe(terrorismActivitiesPattern);
    });

    test('should validate entry index calculation', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('fieldid');
      await section29Page.waitForSelector('[data-testid="section29-field-id-validation"]', { timeout: 5000 });

      await section29Utils.executeFieldIdValidationTests();

      // Verify entry index calculations
      const entry1NameId = await section29Utils.getElementText('field-id-entry1_org_name_id');
      const entry2NameId = await section29Utils.getElementText('field-id-entry2_org_name_id');

      // Entry #1 should use lower indices
      expect(entry1NameId).toContain('TextField11[1]');
      
      // Entry #2 should use higher indices
      expect(entry2NameId).toContain('TextField11[8]');
      
      // Verify the index difference follows expected pattern
      const entry1Index = entry1NameId.match(/TextField11\[(\d+)\]/)?.[1];
      const entry2Index = entry2NameId.match(/TextField11\[(\d+)\]/)?.[1];
      
      expect(parseInt(entry1Index || '0')).toBeLessThan(parseInt(entry2Index || '0'));
    });

    test('should validate field type mapping', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('fieldid');
      await section29Page.waitForSelector('[data-testid="section29-field-id-validation"]', { timeout: 5000 });

      await section29Utils.executeFieldIdValidationTests();

      // Test different field type mappings
      const entry1NameId = await section29Utils.getElementText('field-id-entry1_org_name_id');
      const entry1StreetId = await section29Utils.getElementText('field-id-entry1_street_id');
      const entry1FromDateId = await section29Utils.getElementText('field-id-entry1_from_date_id');
      const activityDescId = await section29Utils.getElementText('field-id-activity_description_id');

      // Verify field type patterns
      expect(entry1NameId).toContain('TextField11[1]'); // Text field
      expect(entry1StreetId).toContain('#area[1].TextField11[0]'); // Area-grouped text field
      expect(entry1FromDateId).toContain('From_Datefield_Name_2[0]'); // Date field
      expect(activityDescId).toContain('TextField11[0]'); // Activity text field
    });
  });

  // ============================================================================
  // FIELD ID PATTERN VALIDATION TESTS
  // ============================================================================

  test.describe('Field ID Pattern Validation', () => {
    test('should validate all expected PDF patterns', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('fieldid');
      await section29Page.waitForSelector('[data-testid="section29-field-id-validation"]', { timeout: 5000 });

      await section29Utils.executeFieldIdValidationTests();

      // Check expected patterns reference
      const expectedPatterns = await section29Page.locator('[data-testid="expected-patterns"]').textContent();
      
      // Verify all expected patterns are documented
      expect(expectedPatterns).toContain('form1[0].Section29[0].RadioButtonList[0]');
      expect(expectedPatterns).toContain('form1[0].Section29_2[0].RadioButtonList[0]');
      expect(expectedPatterns).toContain('form1[0].Section29[0].TextField11[1]');
      expect(expectedPatterns).toContain('form1[0].Section29[0].TextField11[8]');
      expect(expectedPatterns).toContain('form1[0].Section29[0].#area[1].TextField11[0]');
      expect(expectedPatterns).toContain('form1[0].Section29[0].#area[3].TextField11[0]');
      expect(expectedPatterns).toContain('form1[0].Section29[0].From_Datefield_Name_2[0]');
      expect(expectedPatterns).toContain('form1[0].Section29[0].From_Datefield_Name_2[2]');
    });

    test('should validate pattern compliance results', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('fieldid');
      await section29Page.waitForSelector('[data-testid="section29-field-id-validation"]', { timeout: 5000 });

      await section29Utils.executeFieldIdValidationTests();

      // Verify all pattern tests pass
      const patternTests = [
        'terrorism_orgs_id_pattern',
        'terrorism_activities_id_pattern',
        'entry1_org_name_pattern',
        'entry1_street_pattern',
        'entry1_from_date_pattern',
        'entry2_org_name_pattern',
        'entry2_street_pattern',
        'entry2_from_date_pattern',
        'activity_description_pattern'
      ];

      for (const patternTest of patternTests) {
        await section29Utils.assertFieldIdPattern(patternTest, true);
      }
    });

    test('should validate pattern consistency across test runs', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('fieldid');
      await section29Page.waitForSelector('[data-testid="section29-field-id-validation"]', { timeout: 5000 });

      // Run validation multiple times
      for (let i = 0; i < 3; i++) {
        await section29Utils.executeFieldIdValidationTests();
        await section29Page.waitForTimeout(500);

        // Results should be consistent
        await section29Utils.assertFieldIdPattern('entry1_org_name_pattern', true);
        await section29Utils.assertFieldIdPattern('entry2_org_name_pattern', true);
        await section29Utils.assertFieldIdPattern('activity_description_pattern', true);
      }
    });
  });

  // ============================================================================
  // FIELD ID UTILITY EDGE CASES
  // ============================================================================

  test.describe('Field ID Utility Edge Cases', () => {
    test('should handle boundary entry indices', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Test with maximum reasonable number of entries
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      
      // Add multiple entries to test index handling
      for (let i = 0; i < 5; i++) {
        await section29Utils.addOrganizationEntry('terrorismOrganizations');
      }

      // Verify field IDs for different entry positions
      const fieldIds = [];
      for (let i = 0; i < 5; i++) {
        const fieldId = await section29Utils.getFieldId(`terrorism-org-name-${i}`);
        fieldIds.push(fieldId);
        
        // Each should have valid format
        expect(fieldId).toMatch(/^form1\[0\]\.Section29\[0\]\.TextField11\[\d+\]$/);
      }

      // All should be unique
      const uniqueIds = new Set(fieldIds);
      expect(uniqueIds.size).toBe(fieldIds.length);
    });

    test('should handle different subsection types consistently', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Test multiple subsection types
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');
      await section29Utils.addActivityEntry('terrorismActivities');

      // Get field IDs from different subsections
      const orgFieldId = await section29Utils.getFieldId('terrorism-org-name-0');
      const activityFieldId = await section29Utils.getFieldId('terrorism-activity-description-0');

      // Verify subsection-specific patterns
      expect(orgFieldId).toMatch(/^form1\[0\]\.Section29\[0\]\./);
      expect(activityFieldId).toMatch(/^form1\[0\]\.Section29_2\[0\]\./);
      
      // Verify they use different section identifiers
      expect(orgFieldId).not.toContain('Section29_2');
      expect(activityFieldId).not.toContain('Section29[0]');
    });

    test('should handle field ID generation under rapid operations', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');

      // Rapidly add and remove entries
      const fieldIds: string[] = [];
      
      for (let i = 0; i < 3; i++) {
        await section29Utils.addOrganizationEntry('terrorismOrganizations');
        const fieldId = await section29Utils.getFieldId('terrorism-org-name-0');
        fieldIds.push(fieldId);
        
        // Should maintain consistent pattern for first entry
        expect(fieldId).toMatch(/^form1\[0\]\.Section29\[0\]\.TextField11\[1\]$/);
        
        await section29Utils.removeEntry('terrorismOrganizations', 0);
      }

      // All field IDs should have been consistent
      const uniqueIds = new Set(fieldIds);
      expect(uniqueIds.size).toBe(1); // Should all be the same for position 0
    });
  });

  // ============================================================================
  // FIELD ID UTILITY INTEGRATION TESTS
  // ============================================================================

  test.describe('Field ID Utility Integration', () => {
    test('should integrate with React Context state management', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Test integration with context state
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      // Field ID should be available immediately after entry creation
      const fieldId = await section29Utils.getFieldId('terrorism-org-name-0');
      expect(fieldId).toBeTruthy();
      expect(fieldId).toMatch(/^form1\[0\]\.Section29\[0\]\.TextField11\[1\]$/);
      
      // Should work with field updates
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Test Org');
      const fieldValue = await section29Utils.getFieldValue('terrorism-org-name-0');
      expect(fieldValue).toBe('Test Org');
    });

    test('should support field ID-based form operations', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Test that field IDs work with form operations
      const nameFieldId = await section29Utils.getFieldId('terrorism-org-name-0');
      const streetFieldId = await section29Utils.getFieldId('terrorism-org-street-0');
      const dateFieldId = await section29Utils.getFieldId('terrorism-org-from-date-0');

      // All should be valid for form operations
      expect(nameFieldId).toBeTruthy();
      expect(streetFieldId).toBeTruthy();
      expect(dateFieldId).toBeTruthy();

      // Should support field targeting
      await section29Page.fill(`[data-field-id="${nameFieldId}"]`, 'Field ID Test');
      const value = await section29Page.inputValue(`[data-field-id="${nameFieldId}"]`);
      expect(value).toBe('Field ID Test');
    });

    test('should maintain field ID integrity during complex workflows', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Complex workflow: multiple subsections, entries, and operations
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');
      await section29Utils.addActivityEntry('terrorismActivities');

      // Collect all field IDs
      const allFieldIds = [
        await section29Utils.getFieldId('terrorism-org-name-0'),
        await section29Utils.getFieldId('terrorism-org-name-1'),
        await section29Utils.getFieldId('terrorism-org-street-0'),
        await section29Utils.getFieldId('terrorism-org-street-1'),
        await section29Utils.getFieldId('terrorism-activity-description-0')
      ];

      // All should be valid and unique
      for (const fieldId of allFieldIds) {
        expect(fieldId).toBeTruthy();
        expect(fieldId).toMatch(/^form1\[0\]\.Section29(_\d+)?\[0\]\./);
      }

      const uniqueIds = new Set(allFieldIds);
      expect(uniqueIds.size).toBe(allFieldIds.length);

      // Remove an entry and verify remaining IDs are still valid
      await section29Utils.removeEntry('terrorismOrganizations', 0);
      
      const remainingOrgFieldId = await section29Utils.getFieldId('terrorism-org-name-0');
      const activityFieldId = await section29Utils.getFieldId('terrorism-activity-description-0');
      
      expect(remainingOrgFieldId).toBeTruthy();
      expect(activityFieldId).toBeTruthy();
      expect(remainingOrgFieldId).not.toBe(activityFieldId);
    });
  });

  // ============================================================================
  // FIELD ID UTILITY PERFORMANCE TESTS
  // ============================================================================

  test.describe('Field ID Utility Performance', () => {
    test('should generate field IDs efficiently', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      const startTime = Date.now();
      
      // Generate many field IDs rapidly
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      
      for (let i = 0; i < 10; i++) {
        await section29Utils.addOrganizationEntry('terrorismOrganizations');
        await section29Utils.getFieldId(`terrorism-org-name-${i}`);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete efficiently (less than 5 seconds for 10 entries)
      expect(duration).toBeLessThan(5000);
      
      // Verify all entries were created successfully
      await section29Utils.assertEntryCount('terrorismOrganizations', 10);
    });

    test('should handle field ID caching appropriately', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Get same field ID multiple times
      const fieldId1 = await section29Utils.getFieldId('terrorism-org-name-0');
      const fieldId2 = await section29Utils.getFieldId('terrorism-org-name-0');
      const fieldId3 = await section29Utils.getFieldId('terrorism-org-name-0');

      // Should return consistent results
      expect(fieldId1).toBe(fieldId2);
      expect(fieldId2).toBe(fieldId3);
      expect(fieldId1).toMatch(/^form1\[0\]\.Section29\[0\]\.TextField11\[1\]$/);
    });
  });
});
