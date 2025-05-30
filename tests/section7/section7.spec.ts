/**
 * Section 7: Where You Have Lived (Residence History) - Comprehensive Playwright Tests
 *
 * Tests all CRUD operations, SF86FormContext integration, validation logic,
 * cross-section functionality, and performance requirements.
 */

import { test, expect } from '@playwright/test';

test.describe('Section 7: Where You Have Lived', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Section 7 test page
    await page.goto('/test/section7');
    await page.waitForSelector('[data-testid="section7-test-page"]', { timeout: 10000 });

    // Clear any existing data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Basic CRUD Operations', () => {
    test('should initialize with default state', async ({ page }) => {
      // Check initial state
      const hasLivedFlag = await page.locator('[data-testid="has-lived-at-current-address"]').inputValue();
      expect(hasLivedFlag).toBe('NO');

      // Should have no residence entries initially
      const entryCount = await page.locator('[data-testid="residence-entry"]').count();
      expect(entryCount).toBe(0);

      // Should show form for adding residence history
      await expect(page.locator('[data-testid="residence-history-form"]')).toBeVisible();
    });

    test('should update residence history flag', async ({ page }) => {
      // Update flag to YES
      await page.click('[data-testid="has-lived-yes"]');

      // Verify flag was updated
      const hasLivedFlag = await page.locator('[data-testid="has-lived-at-current-address"]').inputValue();
      expect(hasLivedFlag).toBe('YES');

      // Should hide residence history form when YES
      await expect(page.locator('[data-testid="residence-history-form"]')).not.toBeVisible();

      // Update flag to NO
      await page.click('[data-testid="has-lived-no"]');

      // Should show residence history form when NO
      await expect(page.locator('[data-testid="residence-history-form"]')).toBeVisible();
    });

    test('should add residence entry', async ({ page }) => {
      // Set flag to NO to show form
      await page.click('[data-testid="has-lived-no"]');

      // Add residence entry
      await page.click('[data-testid="add-residence-entry"]');

      // Should have one entry
      const entryCount = await page.locator('[data-testid="residence-entry"]').count();
      expect(entryCount).toBe(1);

      // Entry should have all required fields
      await expect(page.locator('[data-testid="residence-entry-0"] [data-testid="street-address"]')).toBeVisible();
      await expect(page.locator('[data-testid="residence-entry-0"] [data-testid="city"]')).toBeVisible();
      await expect(page.locator('[data-testid="residence-entry-0"] [data-testid="state"]')).toBeVisible();
      await expect(page.locator('[data-testid="residence-entry-0"] [data-testid="zip-code"]')).toBeVisible();
      await expect(page.locator('[data-testid="residence-entry-0"] [data-testid="from-date"]')).toBeVisible();
      await expect(page.locator('[data-testid="residence-entry-0"] [data-testid="to-date"]')).toBeVisible();
    });

    test('should remove residence entry', async ({ page }) => {
      // Set flag to NO and add entry
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');

      // Verify entry exists
      let entryCount = await page.locator('[data-testid="residence-entry"]').count();
      expect(entryCount).toBe(1);

      // Remove entry
      await page.click('[data-testid="residence-entry-0"] [data-testid="remove-entry"]');

      // Should have no entries
      entryCount = await page.locator('[data-testid="residence-entry"]').count();
      expect(entryCount).toBe(0);
    });

    test('should update field values', async ({ page }) => {
      // Set flag to NO and add entry
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');

      // Update address fields
      await page.fill('[data-testid="residence-entry-0"] [data-testid="street-address"]', '123 Test Street');
      await page.fill('[data-testid="residence-entry-0"] [data-testid="city"]', 'Test City');
      await page.selectOption('[data-testid="residence-entry-0"] [data-testid="state"]', 'CA');
      await page.fill('[data-testid="residence-entry-0"] [data-testid="zip-code"]', '12345');

      // Update date fields
      await page.fill('[data-testid="residence-entry-0"] [data-testid="from-date"]', '2020-01-01');
      await page.fill('[data-testid="residence-entry-0"] [data-testid="to-date"]', '2023-01-01');

      // Update verification contact
      await page.fill('[data-testid="residence-entry-0"] [data-testid="verification-name"]', 'John Landlord');
      await page.fill('[data-testid="residence-entry-0"] [data-testid="verification-phone"]', '555-123-4567');

      // Verify values were updated
      expect(await page.locator('[data-testid="residence-entry-0"] [data-testid="street-address"]').inputValue()).toBe('123 Test Street');
      expect(await page.locator('[data-testid="residence-entry-0"] [data-testid="city"]').inputValue()).toBe('Test City');
      expect(await page.locator('[data-testid="residence-entry-0"] [data-testid="state"]').inputValue()).toBe('CA');
      expect(await page.locator('[data-testid="residence-entry-0"] [data-testid="zip-code"]').inputValue()).toBe('12345');
    });

    test('should handle multiple residence entries', async ({ page }) => {
      // Set flag to NO
      await page.click('[data-testid="has-lived-no"]');

      // Add multiple entries
      await page.click('[data-testid="add-residence-entry"]');
      await page.click('[data-testid="add-residence-entry"]');
      await page.click('[data-testid="add-residence-entry"]');

      // Should have three entries
      const entryCount = await page.locator('[data-testid="residence-entry"]').count();
      expect(entryCount).toBe(3);

      // Each entry should have unique field IDs
      await expect(page.locator('[data-testid="residence-entry-0"]')).toBeVisible();
      await expect(page.locator('[data-testid="residence-entry-1"]')).toBeVisible();
      await expect(page.locator('[data-testid="residence-entry-2"]')).toBeVisible();

      // Fill different data in each entry
      await page.fill('[data-testid="residence-entry-0"] [data-testid="street-address"]', '123 First Street');
      await page.fill('[data-testid="residence-entry-1"] [data-testid="street-address"]', '456 Second Avenue');
      await page.fill('[data-testid="residence-entry-2"] [data-testid="street-address"]', '789 Third Boulevard');

      // Verify each entry has correct data
      expect(await page.locator('[data-testid="residence-entry-0"] [data-testid="street-address"]').inputValue()).toBe('123 First Street');
      expect(await page.locator('[data-testid="residence-entry-1"] [data-testid="street-address"]').inputValue()).toBe('456 Second Avenue');
      expect(await page.locator('[data-testid="residence-entry-2"] [data-testid="street-address"]').inputValue()).toBe('789 Third Boulevard');
    });
  });

  test.describe('Enhanced Entry Management', () => {
    test('should move residence entries', async ({ page }) => {
      // Set flag to NO and add entries
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');
      await page.click('[data-testid="add-residence-entry"]');

      // Fill entries with different data
      await page.fill('[data-testid="residence-entry-0"] [data-testid="street-address"]', 'First Address');
      await page.fill('[data-testid="residence-entry-1"] [data-testid="street-address"]', 'Second Address');

      // Move first entry to second position
      await page.click('[data-testid="residence-entry-0"] [data-testid="move-down"]');

      // Verify entries were swapped
      expect(await page.locator('[data-testid="residence-entry-0"] [data-testid="street-address"]').inputValue()).toBe('Second Address');
      expect(await page.locator('[data-testid="residence-entry-1"] [data-testid="street-address"]').inputValue()).toBe('First Address');
    });

    test('should duplicate residence entry', async ({ page }) => {
      // Set flag to NO and add entry
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');

      // Fill entry with data
      await page.fill('[data-testid="residence-entry-0"] [data-testid="street-address"]', '123 Test Street');
      await page.fill('[data-testid="residence-entry-0"] [data-testid="city"]', 'Test City');

      // Duplicate entry
      await page.click('[data-testid="residence-entry-0"] [data-testid="duplicate-entry"]');

      // Should have two entries
      const entryCount = await page.locator('[data-testid="residence-entry"]').count();
      expect(entryCount).toBe(2);

      // Both entries should have same data
      expect(await page.locator('[data-testid="residence-entry-0"] [data-testid="street-address"]').inputValue()).toBe('123 Test Street');
      expect(await page.locator('[data-testid="residence-entry-1"] [data-testid="street-address"]').inputValue()).toBe('123 Test Street');
    });

    test('should clear residence entry', async ({ page }) => {
      // Set flag to NO and add entry
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');

      // Fill entry with data
      await page.fill('[data-testid="residence-entry-0"] [data-testid="street-address"]', '123 Test Street');
      await page.fill('[data-testid="residence-entry-0"] [data-testid="city"]', 'Test City');

      // Clear entry
      await page.click('[data-testid="residence-entry-0"] [data-testid="clear-entry"]');

      // Fields should be empty
      expect(await page.locator('[data-testid="residence-entry-0"] [data-testid="street-address"]').inputValue()).toBe('');
      expect(await page.locator('[data-testid="residence-entry-0"] [data-testid="city"]').inputValue()).toBe('');
    });

    test('should bulk update fields', async ({ page }) => {
      // Set flag to NO and add entry
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');

      // Use bulk update feature
      await page.click('[data-testid="residence-entry-0"] [data-testid="bulk-update"]');

      // Fill bulk update form
      await page.fill('[data-testid="bulk-update-street"]', '123 Bulk Street');
      await page.fill('[data-testid="bulk-update-city"]', 'Bulk City');
      await page.selectOption('[data-testid="bulk-update-state"]', 'NY');
      await page.click('[data-testid="apply-bulk-update"]');

      // Verify fields were updated
      expect(await page.locator('[data-testid="residence-entry-0"] [data-testid="street-address"]').inputValue()).toBe('123 Bulk Street');
      expect(await page.locator('[data-testid="residence-entry-0"] [data-testid="city"]').inputValue()).toBe('Bulk City');
      expect(await page.locator('[data-testid="residence-entry-0"] [data-testid="state"]').inputValue()).toBe('NY');
    });
  });

  test.describe('Validation Logic', () => {
    test('should validate required main question', async ({ page }) => {
      // Try to validate without answering main question
      await page.click('[data-testid="validate-section"]');

      // Should show validation error
      await expect(page.locator('[data-testid="validation-error"]')).toContainText('Please answer about your current address residence duration');
    });

    test('should validate required residence entries when flag is NO', async ({ page }) => {
      // Set flag to NO but don't add entries
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="validate-section"]');

      // Should show validation error for missing entries
      await expect(page.locator('[data-testid="validation-error"]')).toContainText('Please provide your residence history for the past 3 years');
    });

    test('should validate required fields in residence entries', async ({ page }) => {
      // Set flag to NO and add entry
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');

      // Leave required fields empty and validate
      await page.click('[data-testid="validate-section"]');

      // Should show validation errors for required fields
      await expect(page.locator('[data-testid="validation-error"]')).toContainText('Street address is required');
      await expect(page.locator('[data-testid="validation-error"]')).toContainText('City is required');
      await expect(page.locator('[data-testid="validation-error"]')).toContainText('From date is required');
    });

    test('should validate date range logic', async ({ page }) => {
      // Set flag to NO and add entry
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');

      // Fill required fields but leave to date empty without checking present
      await page.fill('[data-testid="residence-entry-0"] [data-testid="street-address"]', '123 Test Street');
      await page.fill('[data-testid="residence-entry-0"] [data-testid="city"]', 'Test City');
      await page.fill('[data-testid="residence-entry-0"] [data-testid="from-date"]', '2020-01-01');

      // Validate
      await page.click('[data-testid="validate-section"]');

      // Should show validation error for missing to date
      await expect(page.locator('[data-testid="validation-error"]')).toContainText('To date is required for residence 1 (or check Present)');
    });

    test('should pass validation with complete data', async ({ page }) => {
      // Set flag to NO and add entry
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');

      // Fill all required fields
      await page.fill('[data-testid="residence-entry-0"] [data-testid="street-address"]', '123 Test Street');
      await page.fill('[data-testid="residence-entry-0"] [data-testid="city"]', 'Test City');
      await page.selectOption('[data-testid="residence-entry-0"] [data-testid="state"]', 'CA');
      await page.fill('[data-testid="residence-entry-0"] [data-testid="from-date"]', '2020-01-01');
      await page.fill('[data-testid="residence-entry-0"] [data-testid="to-date"]', '2023-01-01');

      // Validate
      await page.click('[data-testid="validate-section"]');

      // Should show validation success
      await expect(page.locator('[data-testid="validation-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="validation-error"]')).not.toBeVisible();
    });

    test('should pass validation when flag is YES', async ({ page }) => {
      // Set flag to YES (no residence history needed)
      await page.click('[data-testid="has-lived-yes"]');

      // Validate
      await page.click('[data-testid="validate-section"]');

      // Should pass validation
      await expect(page.locator('[data-testid="validation-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="validation-error"]')).not.toBeVisible();
    });
  });

  test.describe('SF86FormContext Integration', () => {
    test('should integrate with SF86FormContext', async ({ page }) => {
      // Check that integration methods are available
      const integrationMethods = await page.evaluate(() => {
        const section7Context = window.getSection7Context();
        return {
          hasMarkComplete: typeof section7Context.markComplete === 'function',
          hasMarkIncomplete: typeof section7Context.markIncomplete === 'function',
          hasTriggerGlobalValidation: typeof section7Context.triggerGlobalValidation === 'function',
          hasNavigateToSection: typeof section7Context.navigateToSection === 'function',
          hasSaveForm: typeof section7Context.saveForm === 'function'
        };
      });

      expect(integrationMethods.hasMarkComplete).toBe(true);
      expect(integrationMethods.hasMarkIncomplete).toBe(true);
      expect(integrationMethods.hasTriggerGlobalValidation).toBe(true);
      expect(integrationMethods.hasNavigateToSection).toBe(true);
      expect(integrationMethods.hasSaveForm).toBe(true);
    });

    test('should mark section complete and navigate', async ({ page }) => {
      // Fill valid data
      await page.click('[data-testid="has-lived-yes"]');

      // Mark complete and navigate
      await page.click('[data-testid="complete-and-continue"]');

      // Should mark section as complete
      await expect(page.locator('[data-testid="section-status"]')).toContainText('complete');

      // Should navigate to next section
      await expect(page.locator('[data-testid="current-section"]')).toContainText('section8');
    });

    test('should trigger global validation', async ({ page }) => {
      // Add invalid data to multiple sections
      await page.click('[data-testid="add-invalid-data-multiple-sections"]');

      // Trigger global validation from section7
      await page.click('[data-testid="section7-trigger-global-validation"]');

      // Should show global validation results
      const validationResult = await page.locator('[data-testid="global-validation-result"]').textContent();
      const result = JSON.parse(validationResult || '{}');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1); // Multiple sections should have errors
    });

    test('should save form data', async ({ page }) => {
      // Add residence data
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');
      await page.fill('[data-testid="residence-entry-0"] [data-testid="street-address"]', '123 Test Street');

      // Save form through section7 integration
      await page.click('[data-testid="section7-save-form"]');

      // Check that form was saved
      const savedData = await page.evaluate(() => {
        return localStorage.getItem('sf86-form-data');
      });

      expect(savedData).toBeTruthy();
      const parsedData = JSON.parse(savedData || '{}');
      expect(parsedData).toHaveProperty('section7');
    });

    test('should emit and receive events', async ({ page }) => {
      // Set up event listener in another section
      await page.click('[data-testid="setup-section8-event-listener"]');

      // Emit event from section7
      await page.click('[data-testid="section7-emit-residence-update"]');

      // Check that section8 received the event
      await expect(page.locator('[data-testid="section8-received-events"]')).toContainText('residence_update');
    });

    test('should sync data with central form', async ({ page }) => {
      // Update data in section7
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');
      await page.fill('[data-testid="residence-entry-0"] [data-testid="street-address"]', '123 Sync Street');

      // Check that central form was updated
      const centralData = await page.locator('[data-testid="central-section7-data"]').textContent();
      expect(centralData).toContain('123 Sync Street');

      // Update data through central form
      await page.evaluate(() => {
        window.updateCentralSection7Data({
          residenceHistory: {
            hasLivedAtCurrentAddressFor3Years: { value: 'YES' },
            entries: []
          }
        });
      });

      // Check that section7 was updated
      const hasLivedFlag = await page.locator('[data-testid="has-lived-at-current-address"]').inputValue();
      expect(hasLivedFlag).toBe('YES');
    });
  });

  test.describe('Cross-Section Functionality', () => {
    test('should communicate with other sections', async ({ page }) => {
      // Set up cross-section communication
      await page.click('[data-testid="setup-cross-section-communication"]');

      // Update residence data that affects other sections
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');
      await page.fill('[data-testid="residence-entry-0"] [data-testid="street-address"]', '123 International Street');
      await page.selectOption('[data-testid="residence-entry-0"] [data-testid="country"]', 'Canada');

      // Should trigger events for other sections
      await expect(page.locator('[data-testid="section8-foreign-residence-alert"]')).toBeVisible();
      await expect(page.locator('[data-testid="section9-citizenship-check"]')).toBeVisible();
    });

    test('should handle section dependencies', async ({ page }) => {
      // Try to navigate to dependent section without completing section7
      await page.click('[data-testid="navigate-to-dependent-section"]');

      // Should show dependency warning
      await expect(page.locator('[data-testid="dependency-warning"]')).toBeVisible();
      await expect(page.locator('[data-testid="dependency-warning"]')).toContainText('complete Section 7');

      // Complete section7
      await page.click('[data-testid="has-lived-yes"]');
      await page.click('[data-testid="mark-section7-complete"]');

      // Should now allow navigation
      await page.click('[data-testid="navigate-to-dependent-section"]');
      await expect(page.locator('[data-testid="current-section"]')).toContainText('dependent-section');
    });

    test('should validate cross-section data consistency', async ({ page }) => {
      // Set up conflicting data across sections
      await page.click('[data-testid="set-conflicting-residence-data"]');

      // Trigger cross-section validation
      await page.click('[data-testid="validate-cross-section-consistency"]');

      // Should detect and report conflicts
      const validationResult = await page.locator('[data-testid="cross-section-validation"]').textContent();
      const result = JSON.parse(validationResult || '{}');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'CROSS_SECTION_CONFLICT',
          message: expect.stringContaining('residence dates')
        })
      );
    });
  });

  test.describe('Performance and Memory Management', () => {
    test('should handle rapid updates efficiently', async ({ page }) => {
      // Set flag to NO and add entry
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');

      // Measure performance of rapid updates
      const startTime = Date.now();

      // Perform rapid field updates
      for (let i = 0; i < 50; i++) {
        await page.fill('[data-testid="residence-entry-0"] [data-testid="street-address"]', `Address ${i}`);
        if (i % 10 === 0) {
          await page.waitForTimeout(10); // Small delay every 10 operations
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (3 seconds)
      expect(duration).toBeLessThan(3000);

      // Final value should be correct
      expect(await page.locator('[data-testid="residence-entry-0"] [data-testid="street-address"]').inputValue()).toBe('Address 49');
    });

    test('should manage memory efficiently with multiple entries', async ({ page }) => {
      // Set flag to NO
      await page.click('[data-testid="has-lived-no"]');

      // Add many entries
      for (let i = 0; i < 20; i++) {
        await page.click('[data-testid="add-residence-entry"]');
        await page.fill(`[data-testid="residence-entry-${i}"] [data-testid="street-address"]`, `Address ${i}`);
      }

      // Check memory usage
      const memoryInfo = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize
        } : null;
      });

      if (memoryInfo) {
        expect(memoryInfo.usedJSHeapSize).toBeLessThan(memoryInfo.totalJSHeapSize * 0.8);
      }

      // Should still be responsive
      await page.click('[data-testid="validate-section"]');
      await expect(page.locator('[data-testid="validation-result"]')).toBeVisible();
    });

    test('should clean up properly on unmount', async ({ page }) => {
      // Set up section with data and event listeners
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');
      await page.click('[data-testid="setup-event-listeners"]');

      // Unmount section
      await page.click('[data-testid="unmount-section7"]');

      // Check that no memory leaks or errors occurred
      const consoleErrors = await page.evaluate(() => {
        return window.consoleErrors || [];
      });

      expect(consoleErrors.filter(error => error.includes('subscription'))).toHaveLength(0);
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should handle integration failures gracefully', async ({ page }) => {
      // Mock integration failure
      await page.evaluate(() => {
        window.mockIntegrationFailure = true;
      });

      // Try to use integration features
      await page.click('[data-testid="section7-mark-complete"]');

      // Should handle failure gracefully
      await expect(page.locator('[data-testid="integration-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="section7-test-page"]')).toBeVisible();

      // Basic section functionality should still work
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');
      await expect(page.locator('[data-testid="residence-entry-0"]')).toBeVisible();
    });

    test('should recover from data corruption', async ({ page }) => {
      // Set up valid data
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');
      await page.fill('[data-testid="residence-entry-0"] [data-testid="street-address"]', '123 Test Street');

      // Corrupt data
      await page.evaluate(() => {
        window.corruptSection7Data();
      });

      // Trigger recovery
      await page.click('[data-testid="trigger-data-recovery"]');

      // Should recover to valid state
      await expect(page.locator('[data-testid="data-recovery-status"]')).toContainText('recovered');

      // Section should be functional again
      await page.click('[data-testid="add-residence-entry"]');
      await expect(page.locator('[data-testid="residence-entry"]').count()).resolves.toBeGreaterThan(0);
    });

    test('should handle validation errors gracefully', async ({ page }) => {
      // Mock validation to throw error
      await page.evaluate(() => {
        window.mockValidationError = true;
      });

      // Try to validate
      await page.click('[data-testid="validate-section"]');

      // Should handle error gracefully
      await expect(page.locator('[data-testid="validation-error-handler"]')).toBeVisible();
      await expect(page.locator('[data-testid="section7-test-page"]')).toBeVisible();
    });
  });

  test.describe('Accessibility and User Experience', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Set flag to NO and add entry
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');

      // Navigate using keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.type('123 Keyboard Street');
      await page.keyboard.press('Tab');
      await page.keyboard.type('Keyboard City');

      // Verify values were entered
      expect(await page.locator('[data-testid="residence-entry-0"] [data-testid="street-address"]').inputValue()).toBe('123 Keyboard Street');
      expect(await page.locator('[data-testid="residence-entry-0"] [data-testid="city"]').inputValue()).toBe('Keyboard City');
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Check main question has proper ARIA
      const mainQuestion = page.locator('[data-testid="has-lived-at-current-address-group"]');
      await expect(mainQuestion).toHaveAttribute('role', 'radiogroup');
      await expect(mainQuestion).toHaveAttribute('aria-labelledby');

      // Add entry and check form accessibility
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');

      // Check entry has proper structure
      const entry = page.locator('[data-testid="residence-entry-0"]');
      await expect(entry).toHaveAttribute('role', 'group');
      await expect(entry).toHaveAttribute('aria-label');
    });

    test('should announce validation errors to screen readers', async ({ page }) => {
      // Set flag to NO and add entry
      await page.click('[data-testid="has-lived-no"]');
      await page.click('[data-testid="add-residence-entry"]');

      // Trigger validation with errors
      await page.click('[data-testid="validate-section"]');

      // Check that errors are announced
      const errorRegion = page.locator('[data-testid="validation-errors"]');
      await expect(errorRegion).toHaveAttribute('role', 'alert');
      await expect(errorRegion).toHaveAttribute('aria-live', 'polite');
    });
  });
});
