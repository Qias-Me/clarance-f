import { test, expect } from '../fixtures/section29-fixtures';
import { SECTION29_TEST_DATA, SECTION29_SELECTORS } from '../fixtures/section29-fixtures';

/**
 * Section29 Field ID Validation and Edge Cases Tests
 * 
 * Advanced tests for field ID generation validation, edge cases,
 * and compliance with PDF form requirements. These tests ensure
 * that field IDs are generated correctly under all conditions
 * and maintain compatibility with the SF-86 PDF structure.
 */

test.describe('Section29 Field ID Validation', () => {
  test.beforeEach(async ({ section29Page }) => {
    await section29Page.waitForSelector(SECTION29_SELECTORS.BASIC_FORM, { timeout: 10000 });
  });

  // ============================================================================
  // FIELD ID FORMAT VALIDATION TESTS
  // ============================================================================

  test.describe('Field ID Format Validation', () => {
    test('should validate field ID format structure', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up test scenario
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Get field ID and validate format
      const fieldId = await section29Utils.getFieldId('terrorism-org-name-0');
      
      // Validate basic structure: form1[0].Section29[0].FieldType[index]
      const formatRegex = /^form1\[0\]\.Section29(_\d+)?\[0\]\..+\[\d+\]$/;
      expect(fieldId).toMatch(formatRegex);
      
      // Validate specific components
      expect(fieldId).toMatch(/^form1\[0\]\./); // Form prefix
      expect(fieldId).toMatch(/\.Section29\[0\]\./); // Section identifier
      expect(fieldId).toMatch(/\[\d+\]$/); // Numeric index at end
    });

    test('should validate field ID component structure', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Test different field types
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      const fieldTests = [
        { 
          testId: 'terrorism-org-name-0', 
          expectedComponents: ['form1[0]', 'Section29[0]', 'TextField11[1]']
        },
        { 
          testId: 'terrorism-org-street-0', 
          expectedComponents: ['form1[0]', 'Section29[0]', '#area[1]', 'TextField11[0]']
        },
        { 
          testId: 'terrorism-org-from-date-0', 
          expectedComponents: ['form1[0]', 'Section29[0]', 'From_Datefield_Name_2[0]']
        },
        { 
          testId: 'terrorism-org-present-0', 
          expectedComponents: ['form1[0]', 'Section29[0]', '#field[13]']
        }
      ];

      for (const { testId, expectedComponents } of fieldTests) {
        const fieldId = await section29Utils.getFieldId(testId);
        
        for (const component of expectedComponents) {
          expect(fieldId).toContain(component);
        }
      }
    });

    test('should validate field ID character restrictions', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      const fieldId = await section29Utils.getFieldId('terrorism-org-name-0');
      
      // Validate allowed characters (alphanumeric, brackets, dots, underscores, hashes)
      const allowedCharsRegex = /^[a-zA-Z0-9\[\]._#]+$/;
      expect(fieldId).toMatch(allowedCharsRegex);
      
      // Should not contain spaces or special characters
      expect(fieldId).not.toMatch(/[\s!@$%^&*()+={}|;:'"<>?,/\\]/);
    });

    test('should validate field ID length constraints', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      const fieldIds = [
        await section29Utils.getFieldId('terrorism-org-name-0'),
        await section29Utils.getFieldId('terrorism-org-street-0'),
        await section29Utils.getFieldId('terrorism-org-from-date-0')
      ];

      for (const fieldId of fieldIds) {
        // Field IDs should be reasonable length (not too short or too long)
        expect(fieldId.length).toBeGreaterThan(20); // Minimum reasonable length
        expect(fieldId.length).toBeLessThan(100); // Maximum reasonable length
      }
    });
  });

  // ============================================================================
  // FIELD ID CONSISTENCY TESTS
  // ============================================================================

  test.describe('Field ID Consistency', () => {
    test('should maintain consistent field IDs across page reloads', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up initial state
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      const originalFieldId = await section29Utils.getFieldId('terrorism-org-name-0');
      
      // Reload page
      await section29Page.reload();
      await section29Page.waitForSelector(SECTION29_SELECTORS.BASIC_FORM, { timeout: 10000 });
      
      // Recreate same state
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      const reloadedFieldId = await section29Utils.getFieldId('terrorism-org-name-0');
      
      // Field ID should be consistent
      expect(reloadedFieldId).toBe(originalFieldId);
    });

    test('should maintain field ID consistency during rapid operations', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      
      // Rapidly add and remove entries
      for (let i = 0; i < 5; i++) {
        await section29Utils.addOrganizationEntry('terrorismOrganizations');
        const fieldId = await section29Utils.getFieldId('terrorism-org-name-0');
        
        // First entry should always have same field ID pattern
        expect(fieldId).toMatch(/form1\[0\]\.Section29\[0\]\.TextField11\[1\]/);
        
        await section29Utils.removeEntry('terrorismOrganizations', 0);
      }
    });

    test('should generate consistent field IDs for same entry types', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Test organization entries
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      const org1NameId = await section29Utils.getFieldId('terrorism-org-name-0');
      const org2NameId = await section29Utils.getFieldId('terrorism-org-name-1');
      
      // Both should follow organization pattern but with different indices
      expect(org1NameId).toMatch(/form1\[0\]\.Section29\[0\]\.TextField11\[1\]/);
      expect(org2NameId).toMatch(/form1\[0\]\.Section29\[0\]\.TextField11\[8\]/);
      
      // Test activity entries
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');
      await section29Utils.addActivityEntry('terrorismActivities');
      await section29Utils.addActivityEntry('terrorismActivities');
      
      const activity1Id = await section29Utils.getFieldId('terrorism-activity-description-0');
      const activity2Id = await section29Utils.getFieldId('terrorism-activity-description-1');
      
      // Both should follow activity pattern
      expect(activity1Id).toMatch(/form1\[0\]\.Section29_2\[0\]\.TextField11\[0\]/);
      expect(activity2Id).toMatch(/form1\[0\]\.Section29_2\[0\]\.TextField11\[\d+\]/);
    });
  });

  // ============================================================================
  // FIELD ID MAPPING TESTS
  // ============================================================================

  test.describe('Field ID Mapping Validation', () => {
    test('should map field types to correct PDF field patterns', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Test field type mappings
      const fieldMappings = [
        { testId: 'terrorism-org-name-0', expectedType: 'TextField11' },
        { testId: 'terrorism-org-street-0', expectedType: 'TextField11' },
        { testId: 'terrorism-org-city-0', expectedType: 'TextField11' },
        { testId: 'terrorism-org-from-date-0', expectedType: 'From_Datefield_Name_2' },
        { testId: 'terrorism-org-to-date-0', expectedType: 'From_Datefield_Name_2' },
        { testId: 'terrorism-org-present-0', expectedType: '#field' }
      ];

      for (const { testId, expectedType } of fieldMappings) {
        const fieldId = await section29Utils.getFieldId(testId);
        expect(fieldId).toContain(expectedType);
      }
    });

    test('should map subsections to correct section identifiers', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Test organization subsection mapping
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      const orgFieldId = await section29Utils.getFieldId('terrorism-org-name-0');
      expect(orgFieldId).toContain('Section29[0]');
      expect(orgFieldId).not.toContain('Section29_2');
      
      // Test activity subsection mapping
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');
      await section29Utils.addActivityEntry('terrorismActivities');
      
      const activityFieldId = await section29Utils.getFieldId('terrorism-activity-description-0');
      expect(activityFieldId).toContain('Section29_2[0]');
      expect(activityFieldId).not.toContain('Section29[0]');
    });

    test('should map entry indices to correct PDF indices', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Test Entry #1 (index 0) mappings
      const entry1NameId = await section29Utils.getFieldId('terrorism-org-name-0');
      const entry1StreetId = await section29Utils.getFieldId('terrorism-org-street-0');
      const entry1FromDateId = await section29Utils.getFieldId('terrorism-org-from-date-0');
      
      expect(entry1NameId).toContain('TextField11[1]'); // Entry #1 name index
      expect(entry1StreetId).toContain('#area[1].TextField11[0]'); // Entry #1 area index
      expect(entry1FromDateId).toContain('From_Datefield_Name_2[0]'); // Entry #1 date index

      // Test Entry #2 (index 1) mappings
      const entry2NameId = await section29Utils.getFieldId('terrorism-org-name-1');
      const entry2StreetId = await section29Utils.getFieldId('terrorism-org-street-1');
      const entry2FromDateId = await section29Utils.getFieldId('terrorism-org-from-date-1');
      
      expect(entry2NameId).toContain('TextField11[8]'); // Entry #2 name index
      expect(entry2StreetId).toContain('#area[3].TextField11[0]'); // Entry #2 area index
      expect(entry2FromDateId).toContain('From_Datefield_Name_2[2]'); // Entry #2 date index
    });
  });

  // ============================================================================
  // FIELD ID ERROR HANDLING TESTS
  // ============================================================================

  test.describe('Field ID Error Handling', () => {
    test('should handle missing field ID attributes gracefully', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Try to get field ID for non-existent element
      try {
        const nonExistentId = await section29Utils.getFieldId('non-existent-field');
        // Should return empty string or handle gracefully
        expect(typeof nonExistentId).toBe('string');
      } catch (error) {
        // Error handling is acceptable for non-existent elements
        expect(error).toBeDefined();
      }
    });

    test('should validate field IDs are not empty or null', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      const fieldIds = [
        await section29Utils.getFieldId('terrorism-org-name-0'),
        await section29Utils.getFieldId('terrorism-org-street-0'),
        await section29Utils.getFieldId('terrorism-org-city-0'),
        await section29Utils.getFieldId('terrorism-org-from-date-0')
      ];

      for (const fieldId of fieldIds) {
        expect(fieldId).toBeTruthy();
        expect(fieldId).not.toBe('');
        expect(fieldId).not.toBe(null);
        expect(fieldId).not.toBe(undefined);
      }
    });

    test('should handle field ID generation under stress conditions', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Create stress scenario with many entries
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      
      const fieldIds: string[] = [];
      
      // Add multiple entries rapidly
      for (let i = 0; i < 5; i++) {
        await section29Utils.addOrganizationEntry('terrorismOrganizations');
        const fieldId = await section29Utils.getFieldId(`terrorism-org-name-${i}`);
        fieldIds.push(fieldId);
        
        // Each field ID should be valid
        expect(fieldId).toBeTruthy();
        expect(fieldId).toMatch(/^form1\[0\]\.Section29\[0\]\./);
      }
      
      // All field IDs should be unique
      const uniqueIds = new Set(fieldIds);
      expect(uniqueIds.size).toBe(fieldIds.length);
    });
  });

  // ============================================================================
  // FIELD ID INTEGRATION TESTS
  // ============================================================================

  test.describe('Field ID Integration', () => {
    test('should integrate field IDs with form submission', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up form with data
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Test Organization');

      // Verify field ID is accessible for form processing
      const fieldId = await section29Utils.getFieldId('terrorism-org-name-0');
      const fieldValue = await section29Utils.getFieldValue('terrorism-org-name-0');
      
      expect(fieldId).toBeTruthy();
      expect(fieldValue).toBe('Test Organization');
      
      // Field ID should be suitable for form data mapping
      expect(fieldId).toMatch(/^form1\[0\]\.Section29\[0\]\.TextField11\[1\]$/);
    });

    test('should support field ID-based form validation', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Get field IDs for validation purposes
      const requiredFieldIds = [
        await section29Utils.getFieldId('terrorism-org-name-0'),
        await section29Utils.getFieldId('terrorism-org-street-0'),
        await section29Utils.getFieldId('terrorism-org-city-0')
      ];

      // All field IDs should be valid for validation logic
      for (const fieldId of requiredFieldIds) {
        expect(fieldId).toMatch(/^form1\[0\]\.Section29\[0\]\./);
        expect(fieldId.length).toBeGreaterThan(0);
      }

      // Trigger validation
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      await section29Page.waitForTimeout(500);
      
      // Validation should complete without field ID errors
      await expect(section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT)).toBeVisible();
    });

    test('should maintain field ID integrity during complex operations', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Perform complex sequence of operations
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      // Fill data
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'First Org');
      await section29Utils.fillEntryField('terrorismOrganizations', 1, 'name', 'Second Org');
      
      // Remove first entry
      await section29Utils.removeEntry('terrorismOrganizations', 0);
      
      // Remaining entry should maintain valid field ID
      const remainingFieldId = await section29Utils.getFieldId('terrorism-org-name-0');
      expect(remainingFieldId).toMatch(/^form1\[0\]\.Section29\[0\]\.TextField11\[1\]$/);
      
      // Add new entry
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      const newEntryFieldId = await section29Utils.getFieldId('terrorism-org-name-1');
      expect(newEntryFieldId).toMatch(/^form1\[0\]\.Section29\[0\]\.TextField11\[8\]$/);
      
      // Field IDs should remain unique
      expect(remainingFieldId).not.toBe(newEntryFieldId);
    });
  });
});
