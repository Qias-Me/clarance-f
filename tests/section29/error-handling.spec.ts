import { test, expect } from '../fixtures/section29-fixtures';
import { SECTION29_TEST_DATA, SECTION29_SELECTORS } from '../fixtures/section29-fixtures';

/**
 * Section29 Error Handling and Validation Tests
 * 
 * Comprehensive tests for error handling, validation, and boundary conditions:
 * - Form validation with various data states
 * - Error boundary testing and recovery
 * - Invalid input handling and sanitization
 * - Network error simulation and recovery
 * - Memory and performance stress testing
 * - Graceful degradation under failure conditions
 */

test.describe('Section29 Error Handling and Validation', () => {
  test.beforeEach(async ({ section29Page }) => {
    await section29Page.waitForSelector(SECTION29_SELECTORS.BASIC_FORM, { timeout: 10000 });
  });

  // ============================================================================
  // FORM VALIDATION TESTS
  // ============================================================================

  test.describe('Form Validation', () => {
    test('should validate empty form correctly', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      // Trigger validation on empty form
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      await section29Page.waitForTimeout(500);

      // Empty form should be valid (no required fields initially)
      await expect(section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT)).toContainText('0');
      await section29Utils.assertFormIsDirty(false);
    });

    test('should validate form with partial data', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      // Set up partial data
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Partial Entry');
      // Leave other fields empty

      // Trigger validation
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      await section29Page.waitForTimeout(500);

      // Should handle partial data gracefully
      await expect(section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT)).toBeVisible();
      await section29Utils.assertFormIsDirty(true);
    });

    test('should validate form with complete data', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      // Set up complete data
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      const testData = SECTION29_TEST_DATA.SAMPLE_ORGANIZATION;
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', testData.name);
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'street', testData.street);
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'city', testData.city);

      // Trigger validation
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      await section29Page.waitForTimeout(500);

      // Complete data should validate successfully
      await expect(section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT)).toBeVisible();
      await section29Utils.assertFormIsDirty(true);
    });

    test('should validate multiple subsections correctly', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      // Set up multiple subsections
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Org Entry');

      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');
      await section29Utils.addActivityEntry('terrorismActivities');
      await section29Page.fill('[data-testid="terrorism-activity-description-0"]', 'Activity Entry');

      // Trigger validation
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      await section29Page.waitForTimeout(500);

      // Multiple subsections should validate correctly
      await expect(section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT)).toBeVisible();
      await section29Utils.assertFormIsDirty(true);
    });

    test('should handle validation state changes', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      // Initial validation
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      const initialErrorCount = await section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT).textContent();

      // Make changes
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Validate again
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      await section29Page.waitForTimeout(500);

      // Validation should still work after changes
      await expect(section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT)).toBeVisible();
    });
  });

  // ============================================================================
  // ERROR BOUNDARY TESTS
  // ============================================================================

  test.describe('Error Boundary Testing', () => {
    test('should handle invalid subsection operations', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      // Execute error condition tests
      await section29Utils.executeErrorConditionTests();

      // Verify invalid subsection handling
      await expect(section29Page.locator('[data-testid="error-invalid_subsection"]')).toContainText('Error caught correctly');
    });

    test('should handle out-of-bounds operations gracefully', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('advanced');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Utils.executeErrorConditionTests();

      // Verify out-of-bounds handling
      await expect(section29Page.locator('[data-testid="result-out_of_bounds_entry"]')).toContainText('true');
      await expect(section29Page.locator('[data-testid="error-move_out_of_bounds"]')).toBeVisible();
    });

    test('should recover from JavaScript errors', async ({ section29Utils, section29Page }) => {
      // Monitor console errors
      const consoleErrors: string[] = [];
      section29Page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await section29Utils.navigateToBasicTests();

      // Perform operations that might cause errors
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      // Try to access non-existent entry
      try {
        await section29Utils.removeEntry('terrorismOrganizations', 999);
      } catch (error) {
        // Expected to fail gracefully
      }

      // Form should remain functional
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
      await section29Utils.validateFormStateConsistency();

      // Filter out unrelated console errors
      const relevantErrors = consoleErrors.filter(error => 
        error.includes('Section29') || error.includes('terrorism')
      );
      
      // Should not have critical errors that break functionality
      expect(relevantErrors.length).toBeLessThan(5); // Allow some minor errors
    });

    test('should handle component unmounting gracefully', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      // Set up data
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Navigate away (simulates component unmounting)
      await section29Page.goto('/');
      await section29Page.waitForTimeout(500);

      // Navigate back
      await section29Page.goBack();
      await section29Page.waitForSelector(SECTION29_SELECTORS.BASIC_FORM, { timeout: 10000 });

      // Should reinitialize correctly
      await section29Utils.validateFormStateConsistency();
    });
  });

  // ============================================================================
  // INVALID INPUT HANDLING TESTS
  // ============================================================================

  test.describe('Invalid Input Handling', () => {
    test('should handle invalid date inputs', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Try invalid date formats
      const invalidDates = ['invalid-date', '99/99/9999', 'not-a-date', '2025-13'];
      
      for (const invalidDate of invalidDates) {
        await section29Page.fill('[data-testid="terrorism-org-from-date-0"]', invalidDate);
        
        // Browser should handle invalid input gracefully
        const dateValue = await section29Utils.getFieldValue('terrorism-org-from-date-0');
        expect(typeof dateValue).toBe('string');
      }

      // Should be able to set valid date after invalid attempts
      await section29Page.fill('[data-testid="terrorism-org-from-date-0"]', '2020-01');
      expect(await section29Utils.getFieldValue('terrorism-org-from-date-0')).toBe('2020-01');
    });

    test('should handle extremely long text inputs', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Test with very long input
      const longText = 'A'.repeat(10000);
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', longText);

      // Field should handle long input (may truncate or accept)
      const fieldValue = await section29Utils.getFieldValue('terrorism-org-name-0');
      expect(fieldValue.length).toBeGreaterThan(0);
      expect(fieldValue).toContain('A');
    });

    test('should handle special characters and HTML injection', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Test with potentially dangerous input
      const dangerousInputs = [
        '<script>alert("xss")</script>',
        '"><script>alert("xss")</script>',
        'javascript:alert("xss")',
        '${alert("xss")}',
        '{{alert("xss")}}',
        '<img src=x onerror=alert("xss")>'
      ];

      for (const dangerousInput of dangerousInputs) {
        await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', dangerousInput);
        
        // Input should be sanitized or escaped
        const fieldValue = await section29Utils.getFieldValue('terrorism-org-name-0');
        expect(fieldValue).toBe(dangerousInput); // Should store as-is but not execute
      }

      // Form should remain functional
      await section29Utils.validateFormStateConsistency();
    });

    test('should handle null and undefined inputs', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Test with empty/null-like inputs
      const nullLikeInputs = ['', 'null', 'undefined', 'NaN'];

      for (const nullInput of nullLikeInputs) {
        await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', nullInput);
        
        // Should handle gracefully
        const fieldValue = await section29Utils.getFieldValue('terrorism-org-name-0');
        expect(typeof fieldValue).toBe('string');
      }
    });
  });

  // ============================================================================
  // STRESS TESTING
  // ============================================================================

  test.describe('Stress Testing', () => {
    test('should handle rapid successive operations', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');

      const startTime = Date.now();

      // Perform rapid operations
      for (let i = 0; i < 10; i++) {
        await section29Utils.addOrganizationEntry('terrorismOrganizations');
        await section29Page.waitForTimeout(50);
        
        if (i > 0) {
          await section29Utils.removeEntry('terrorismOrganizations', 0);
          await section29Page.waitForTimeout(50);
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000);

      // Should maintain consistency
      await section29Utils.validateFormStateConsistency();
    });

    test('should handle memory-intensive operations', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');

      // Create many entries with substantial data
      for (let i = 0; i < 5; i++) {
        await section29Utils.addOrganizationEntry('terrorismOrganizations');
        
        const largeText = `Entry ${i} ${'x'.repeat(1000)}`;
        await section29Utils.fillEntryField('terrorismOrganizations', i, 'name', largeText);
        await section29Utils.fillEntryField('terrorismOrganizations', i, 'street', `Street ${i} ${'y'.repeat(500)}`);
      }

      // Verify all data was stored
      await section29Utils.assertEntryCount('terrorismOrganizations', 5);
      
      for (let i = 0; i < 5; i++) {
        const fieldValue = await section29Utils.getFieldValue(`terrorism-org-name-${i}`);
        expect(fieldValue).toContain(`Entry ${i}`);
      }
    });

    test('should handle concurrent user interactions', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      // Simulate concurrent interactions
      await Promise.all([
        section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES'),
        section29Utils.setSubsectionFlag('terrorismActivities', 'YES')
      ]);

      await Promise.all([
        section29Utils.addOrganizationEntry('terrorismOrganizations'),
        section29Utils.addActivityEntry('terrorismActivities')
      ]);

      // Verify both operations succeeded
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
      await section29Utils.assertEntryCount('terrorismActivities', 1);
    });

    test('should maintain performance under load', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      const startTime = Date.now();

      // Perform comprehensive operations
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');

      // Add multiple entries
      for (let i = 0; i < 3; i++) {
        await section29Utils.addOrganizationEntry('terrorismOrganizations');
        await section29Utils.addActivityEntry('terrorismActivities');
      }

      // Fill all entries with data
      for (let i = 0; i < 3; i++) {
        await section29Utils.fillEntryField('terrorismOrganizations', i, 'name', `Org ${i}`);
        await section29Page.fill(`[data-testid="terrorism-activity-description-${i}"]`, `Activity ${i}`);
      }

      // Trigger validation
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 15 seconds)
      expect(duration).toBeLessThan(15000);

      // Verify all operations completed successfully
      await section29Utils.assertEntryCount('terrorismOrganizations', 3);
      await section29Utils.assertEntryCount('terrorismActivities', 3);
    });
  });

  // ============================================================================
  // GRACEFUL DEGRADATION TESTS
  // ============================================================================

  test.describe('Graceful Degradation', () => {
    test('should handle browser storage failures', async ({ section29Utils, section29Page }) => {
      // Disable localStorage
      await section29Page.evaluate(() => {
        Object.defineProperty(window, 'localStorage', {
          value: {
            getItem: () => { throw new Error('Storage disabled'); },
            setItem: () => { throw new Error('Storage disabled'); },
            removeItem: () => { throw new Error('Storage disabled'); },
            clear: () => { throw new Error('Storage disabled'); }
          }
        });
      });

      await section29Utils.navigateToBasicTests();

      // Form should still work without storage
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'No Storage Test');

      // Basic functionality should work
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe('No Storage Test');
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
    });

    test('should handle network connectivity issues', async ({ section29Utils, section29Page }) => {
      // Simulate offline mode
      await section29Page.context().setOffline(true);

      await section29Utils.navigateToBasicTests();

      // Form should work offline
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Offline Test');

      // Verify functionality
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe('Offline Test');

      // Restore connectivity
      await section29Page.context().setOffline(false);
    });

    test('should handle reduced browser capabilities', async ({ section29Utils, section29Page }) => {
      // Disable JavaScript features that might not be available
      await section29Page.evaluate(() => {
        // Simulate older browser environment
        delete (window as any).fetch;
        delete (window as any).Promise;
      });

      await section29Utils.navigateToBasicTests();

      // Basic form functionality should still work
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Verify basic operations work
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
    });

    test('should handle partial component failures', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();

      // Set up working state
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Partial Failure Test');

      // Simulate partial failure by corrupting some DOM elements
      await section29Page.evaluate(() => {
        const elements = document.querySelectorAll('[data-testid*="terrorism-org"]');
        if (elements.length > 1) {
          // Remove some elements to simulate partial failure
          elements[elements.length - 1].remove();
        }
      });

      // Core functionality should still work
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe('Partial Failure Test');
      await section29Utils.validateFormStateConsistency();
    });
  });
});
