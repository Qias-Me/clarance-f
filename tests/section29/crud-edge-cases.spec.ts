import { test, expect } from '../fixtures/section29-fixtures';
import { SECTION29_TEST_DATA, SECTION29_SELECTORS } from '../fixtures/section29-fixtures';

/**
 * Section29 CRUD Edge Cases and Error Conditions Tests
 * 
 * Tests for edge cases, boundary conditions, and error scenarios
 * in Section29 Context CRUD operations to ensure robust error handling
 * and graceful degradation under unusual conditions.
 */

test.describe('Section29 CRUD Edge Cases', () => {
  test.beforeEach(async ({ section29Page }) => {
    await section29Page.waitForSelector(SECTION29_SELECTORS.BASIC_FORM, { timeout: 10000 });
  });

  // ============================================================================
  // BOUNDARY CONDITION TESTS
  // ============================================================================

  test.describe('Boundary Conditions', () => {
    test('should handle rapid successive CRUD operations', async ({ section29Utils, section29Page }) => {
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');

      // Rapidly add multiple entries
      for (let i = 0; i < 5; i++) {
        await section29Utils.addOrganizationEntry('terrorismOrganizations');
        await section29Page.waitForTimeout(50); // Minimal wait
      }

      // Verify all entries were added
      await section29Utils.assertEntryCount('terrorismOrganizations', 5);

      // Rapidly remove entries
      for (let i = 4; i >= 0; i--) {
        await section29Utils.removeEntry('terrorismOrganizations', i);
        await section29Page.waitForTimeout(50);
      }

      // Verify all entries were removed
      await section29Utils.assertEntryCount('terrorismOrganizations', 0);
    });

    test('should handle maximum field length inputs', async ({ section29Utils, section29Page }) => {
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Test with very long input
      const longText = 'A'.repeat(1000);
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', longText);

      // Verify field accepts long input (or truncates appropriately)
      const fieldValue = await section29Utils.getFieldValue('terrorism-org-name-0');
      expect(fieldValue.length).toBeGreaterThan(0);
      expect(fieldValue).toContain('A');
    });

    test('should handle special characters in field inputs', async ({ section29Utils, section29Page }) => {
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Test with special characters
      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?`~"\'\\';
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', specialText);

      const fieldValue = await section29Utils.getFieldValue('terrorism-org-name-0');
      expect(fieldValue).toBe(specialText);
    });

    test('should handle unicode characters', async ({ section29Utils, section29Page }) => {
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Test with unicode characters
      const unicodeText = '测试组织 🏢 Тест Организация';
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', unicodeText);

      const fieldValue = await section29Utils.getFieldValue('terrorism-org-name-0');
      expect(fieldValue).toBe(unicodeText);
    });

    test('should handle empty string inputs', async ({ section29Utils, section29Page }) => {
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Fill field with content first
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Test Organization');
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe('Test Organization');

      // Clear the field
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', '');
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe('');
    });
  });

  // ============================================================================
  // STATE CONSISTENCY TESTS
  // ============================================================================

  test.describe('State Consistency', () => {
    test('should maintain state consistency during rapid flag changes', async ({ section29Utils, section29Page }) => {
      // Rapidly toggle subsection flags
      for (let i = 0; i < 5; i++) {
        await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
        await section29Page.waitForTimeout(50);
        await section29Utils.setSubsectionFlag('terrorismOrganizations', 'NO');
        await section29Page.waitForTimeout(50);
      }

      // Final state should be NO
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_NO)).toBeChecked();
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_ENTRIES)).not.toBeVisible();
    });

    test('should preserve entry data when toggling subsection flags', async ({ section29Utils, section29Page }) => {
      // Add entry and fill data
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Test Organization');

      // Toggle to NO and back to YES
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'NO');
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');

      // Data should be preserved
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe('Test Organization');
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
    });

    test('should handle concurrent operations on different subsections', async ({ section29Utils, section29Page }) => {
      // Enable both subsections
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');

      // Add entries to both
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addActivityEntry('terrorismActivities');

      // Update both simultaneously
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Org Name');
      await section29Page.fill('[data-testid="terrorism-activity-description-0"]', 'Activity Description');

      // Verify both updates worked
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe('Org Name');
      expect(await section29Utils.getFieldValue('terrorism-activity-description-0')).toBe('Activity Description');

      // Verify counts are correct
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
      await section29Utils.assertEntryCount('terrorismActivities', 1);
    });
  });

  // ============================================================================
  // ERROR RECOVERY TESTS
  // ============================================================================

  test.describe('Error Recovery', () => {
    test('should recover from invalid date inputs', async ({ section29Utils, section29Page }) => {
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Try to input invalid date
      await section29Page.fill('[data-testid="terrorism-org-from-date-0"]', 'invalid-date');
      
      // Field should handle invalid input gracefully
      const dateValue = await section29Utils.getFieldValue('terrorism-org-from-date-0');
      // Browser will either reject invalid input or convert it
      expect(typeof dateValue).toBe('string');

      // Try valid date after invalid
      await section29Page.fill('[data-testid="terrorism-org-from-date-0"]', '2020-01');
      expect(await section29Utils.getFieldValue('terrorism-org-from-date-0')).toBe('2020-01');
    });

    test('should handle form submission with incomplete data', async ({ section29Utils, section29Page }) => {
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Fill only some fields
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Partial Org');
      // Leave other fields empty

      // Trigger validation
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      await section29Page.waitForTimeout(500);

      // Form should handle partial data gracefully
      await section29Utils.assertFormIsDirty(true);
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe('Partial Org');
    });

    test('should maintain form state after page interactions', async ({ section29Utils, section29Page }) => {
      // Set up form data
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Persistent Org');

      // Interact with other page elements
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      await section29Page.waitForTimeout(100);

      // Scroll the page
      await section29Page.evaluate(() => window.scrollTo(0, 500));
      await section29Page.waitForTimeout(100);
      await section29Page.evaluate(() => window.scrollTo(0, 0));

      // Data should persist
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe('Persistent Org');
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
    });
  });

  // ============================================================================
  // PERFORMANCE EDGE CASES
  // ============================================================================

  test.describe('Performance Edge Cases', () => {
    test('should handle large number of entries efficiently', async ({ section29Utils, section29Page }) => {
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');

      const startTime = Date.now();
      
      // Add 10 entries (reasonable upper limit for testing)
      for (let i = 0; i < 10; i++) {
        await section29Utils.addOrganizationEntry('terrorismOrganizations');
        await section29Page.waitForTimeout(50);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify all entries were added
      await section29Utils.assertEntryCount('terrorismOrganizations', 10);

      // Performance should be reasonable (less than 10 seconds for 10 entries)
      expect(duration).toBeLessThan(10000);

      // Verify last entry is functional
      await section29Utils.fillEntryField('terrorismOrganizations', 9, 'name', 'Last Entry');
      expect(await section29Utils.getFieldValue('terrorism-org-name-9')).toBe('Last Entry');
    });

    test('should handle rapid field updates without data loss', async ({ section29Utils, section29Page }) => {
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Rapidly update the same field
      const updates = ['Update 1', 'Update 2', 'Update 3', 'Final Update'];
      
      for (const update of updates) {
        await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', update);
        await section29Page.waitForTimeout(25);
      }

      // Final value should be the last update
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe('Final Update');
    });

    test('should handle memory-intensive operations', async ({ section29Utils, section29Page }) => {
      // Create multiple entries with substantial data
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      
      for (let i = 0; i < 5; i++) {
        await section29Utils.addOrganizationEntry('terrorismOrganizations');
        
        // Fill each entry with substantial data
        const largeText = `Large organization name ${i} ${'x'.repeat(100)}`;
        await section29Utils.fillEntryField('terrorismOrganizations', i, 'name', largeText);
        await section29Utils.fillEntryField('terrorismOrganizations', i, 'street', `Street ${i} ${'y'.repeat(50)}`);
        await section29Utils.fillEntryField('terrorismOrganizations', i, 'city', `City ${i}`);
      }

      // Verify all data was stored correctly
      for (let i = 0; i < 5; i++) {
        const expectedName = `Large organization name ${i} ${'x'.repeat(100)}`;
        expect(await section29Utils.getFieldValue(`terrorism-org-name-${i}`)).toBe(expectedName);
      }

      await section29Utils.assertEntryCount('terrorismOrganizations', 5);
    });
  });

  // ============================================================================
  // BROWSER COMPATIBILITY TESTS
  // ============================================================================

  test.describe('Browser Compatibility', () => {
    test('should handle browser back/forward navigation', async ({ section29Utils, section29Page }) => {
      // Set up initial state
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Navigation Test');

      // Navigate away and back (simulate browser navigation)
      await section29Page.goto('/');
      await section29Page.waitForTimeout(500);
      await section29Page.goBack();
      await section29Page.waitForSelector(SECTION29_SELECTORS.BASIC_FORM, { timeout: 10000 });

      // State might be reset depending on implementation
      // This test verifies the form loads correctly after navigation
      await expect(section29Page.locator(SECTION29_SELECTORS.BASIC_FORM)).toBeVisible();
      await section29Utils.validateFormStateConsistency();
    });

    test('should handle page refresh', async ({ section29Utils, section29Page }) => {
      // Set up initial state
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Refresh the page
      await section29Page.reload();
      await section29Page.waitForSelector(SECTION29_SELECTORS.BASIC_FORM, { timeout: 10000 });

      // Form should load correctly (state might be reset)
      await expect(section29Page.locator(SECTION29_SELECTORS.BASIC_FORM)).toBeVisible();
      await section29Utils.validateFormStateConsistency();
    });

    test('should handle window resize during operations', async ({ section29Utils, section29Page }) => {
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Resize window during field update
      await section29Page.setViewportSize({ width: 800, height: 600 });
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Resize Test');

      // Resize again
      await section29Page.setViewportSize({ width: 1200, height: 800 });
      
      // Verify field value persists
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe('Resize Test');

      // Reset to original size
      await section29Page.setViewportSize({ width: 1280, height: 720 });
    });
  });
});
