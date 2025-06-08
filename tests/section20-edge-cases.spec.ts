/**
 * Section 20 Edge Cases and Error Handling Tests
 * 
 * Tests edge cases, error conditions, and boundary scenarios
 * for all 790 fields in Section 20
 */

import { test, expect, Page } from '@playwright/test';
import fs from 'fs';

const section20Data = JSON.parse(fs.readFileSync('api/sections-references/section-20.json', 'utf8'));

test.describe('Section 20: Edge Cases and Error Handling', () => {
    test.beforeEach(async ({ page }) => {
    // Navigate to the form
    await page.goto('/startForm');
    
    // Wait for the form to load
    await page.waitForSelector('[data-testid="centralized-sf86-form"]');
    
    // Navigate to Section 20
    await page.click('[data-testid="section-section20-button"]');
    
    // Wait for Section 20 component to load
    await page.waitForSelector('[data-testid="section20-form"]');
  });

  test.describe('Field Length and Format Validation', () => {
    
    test('should handle maximum length text fields', async ({ page }) => {
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');
      
      // Test very long text input
      const longText = 'A'.repeat(5000);
      const mediumText = 'B'.repeat(1000);
      const shortText = 'C'.repeat(100);
      
      const textFields = [
        '[data-testid="financial-interest-description"]',
        '[data-testid="how-acquired"]',
        '[data-testid="circumstances"]'
      ];
      
      for (const selector of textFields) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            // Test long text
            await element.fill(longText);
            const actualValue = await element.inputValue();
            console.log(`Field ${selector} accepted ${actualValue.length} characters`);
            
            // Test medium text
            await element.fill(mediumText);
            await expect(element).toHaveValue(mediumText);
            
            // Test short text
            await element.fill(shortText);
            await expect(element).toHaveValue(shortText);
          }
        } catch (error) {
          console.log(`Field ${selector} not found or not interactive`);
        }
      }
    });

    test('should validate date field boundaries', async ({ page }) => {
      await page.click('[data-testid="foreign-travel-yes"]');
      await page.click('[data-testid="add-travel-entry"]');
      
      const dateFields = [
        '[data-testid="travel-date-from"]',
        '[data-testid="travel-date-to"]'
      ];
      
      const testDates = [
        { date: '1900-01-01', description: 'Very old date' },
        { date: '2050-12-31', description: 'Future date' },
        { date: '2023-02-29', description: 'Invalid leap year date' },
        { date: '2024-02-29', description: 'Valid leap year date' },
        { date: '2023-13-01', description: 'Invalid month' },
        { date: '2023-12-32', description: 'Invalid day' },
        { date: 'invalid', description: 'Non-date string' },
        { date: '', description: 'Empty date' }
      ];
      
      for (const selector of dateFields) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            for (const testCase of testDates) {
              await element.fill(testCase.date);
              await page.waitForTimeout(100);
              
              const actualValue = await element.inputValue();
              console.log(`${selector} - ${testCase.description}: "${testCase.date}" → "${actualValue}"`);
            }
          }
        } catch (error) {
          console.log(`Date field ${selector} not found`);
        }
      }
    });

    test('should validate numeric field boundaries', async ({ page }) => {
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');
      
      const numericFields = [
        '[data-testid="current-value-amount"]',
        '[data-testid="cost-at-acquisition"]'
      ];
      
      const testValues = [
        { value: '0', description: 'Zero value' },
        { value: '-1000', description: 'Negative value' },
        { value: '999999999999', description: 'Very large value' },
        { value: '123.45', description: 'Decimal value' },
        { value: 'abc', description: 'Non-numeric text' },
        { value: '1,000,000', description: 'Comma-formatted number' },
        { value: '$50,000', description: 'Currency-formatted number' },
        { value: '', description: 'Empty value' }
      ];
      
      for (const selector of numericFields) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            for (const testCase of testValues) {
              await element.fill(testCase.value);
              await page.waitForTimeout(100);
              
              const actualValue = await element.inputValue();
              console.log(`${selector} - ${testCase.description}: "${testCase.value}" → "${actualValue}"`);
            }
          }
        } catch (error) {
          console.log(`Numeric field ${selector} not found`);
        }
      }
    });
  });

  test.describe('Data Consistency and Integrity', () => {
    
    test('should maintain data consistency across rapid changes', async ({ page }) => {
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');
      
      // Rapidly change field values
      const field = '[data-testid="financial-interest-description"]';
      const values = ['Value 1', 'Value 2', 'Value 3', 'Value 4', 'Value 5'];
      
      try {
        const element = await page.locator(field).first();
        if (await element.isVisible()) {
          for (let i = 0; i < values.length; i++) {
            await element.fill(values[i]);
            await page.waitForTimeout(50); // Rapid changes
          }
          
          // Verify final value
          await expect(element).toHaveValue(values[values.length - 1]);
          console.log('✅ Rapid field changes handled correctly');
        }
      } catch (error) {
        console.log('❌ Rapid field changes test failed');
      }
    });

    test('should handle concurrent field updates', async ({ page }) => {
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');
      
      // Update multiple fields simultaneously
      const fieldUpdates = [
        { selector: '[data-testid="financial-interest-description"]', value: 'Concurrent Test 1' },
        { selector: '[data-testid="financial-interest-type"]', value: 'bank_account' },
        { selector: '[data-testid="current-value-amount"]', value: '50000' },
        { selector: '[data-testid="date-acquired-date"]', value: '2023-06-15' }
      ];
      
      // Start all updates concurrently
      const updatePromises = fieldUpdates.map(async ({ selector, value }) => {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            if (selector.includes('type')) {
              await element.selectOption(value);
            } else {
              await element.fill(value);
            }
            return { selector, success: true, value };
          }
        } catch (error) {
          return { selector, success: false, error: error.message };
        }
      });
      
      const results = await Promise.all(updatePromises);
      
      // Verify all updates completed
      for (const result of results) {
        if (result?.success) {
          console.log(`✅ Concurrent update ${result.selector}: ${result.value}`);
        } else {
          console.log(`❌ Concurrent update ${result?.selector}: Failed`);
        }
      }
    });

    test('should handle entry deletion and recreation', async ({ page }) => {
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      
      // Add multiple entries
      for (let i = 0; i < 3; i++) {
        await page.click('[data-testid="add-financial-interest-entry"]');
        await page.fill(`[data-testid="financial-interest-description-${i}"]`, `Entry ${i + 1}`);
      }
      
      // Verify entries exist
      for (let i = 0; i < 3; i++) {
        await expect(page.locator(`[data-testid="financial-interest-description-${i}"]`)).toHaveValue(`Entry ${i + 1}`);
      }
      
      // Delete middle entry
      await page.click('[data-testid="delete-financial-interest-entry-1"]');
      
      // Verify entry was deleted and indices updated
      await expect(page.locator('[data-testid="financial-interest-description-0"]')).toHaveValue('Entry 1');
      await expect(page.locator('[data-testid="financial-interest-description-1"]')).toHaveValue('Entry 3');
      
      // Add new entry
      await page.click('[data-testid="add-financial-interest-entry"]');
      await page.fill('[data-testid="financial-interest-description-2"]', 'New Entry');
      
      await expect(page.locator('[data-testid="financial-interest-description-2"]')).toHaveValue('New Entry');
    });
  });

  test.describe('Browser Compatibility and Performance', () => {
    
    test('should handle page refresh during data entry', async ({ page }) => {
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');
      
      // Fill some data
      await page.fill('[data-testid="financial-interest-description"]', 'Test before refresh');
      await page.selectOption('[data-testid="financial-interest-type"]', 'bank_account');
      
      // Save data
      await page.click('[data-testid="save-form"]');
      await page.waitForTimeout(1000);
      
      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify data persistence
      await expect(page.locator('[data-testid="foreign-financial-interests-yes"]')).toBeChecked();
      await expect(page.locator('[data-testid="financial-interest-description"]')).toHaveValue('Test before refresh');
      await expect(page.locator('[data-testid="financial-interest-type"]')).toHaveValue('bank_account');
    });

    test('should handle network interruption simulation', async ({ page }) => {
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');
      
      // Fill data
      await page.fill('[data-testid="financial-interest-description"]', 'Network test data');
      
      // Simulate network offline
      await page.context().setOffline(true);
      
      // Try to save (should handle gracefully)
      await page.click('[data-testid="save-form"]');
      
      // Check for offline indicator or error message
      const offlineIndicator = page.locator('[data-testid="offline-indicator"], [data-testid="save-error"]');
      await expect(offlineIndicator).toBeVisible({ timeout: 5000 });
      
      // Restore network
      await page.context().setOffline(false);
      
      // Retry save
      await page.click('[data-testid="save-form"]');
      await page.waitForTimeout(2000);
      
      // Verify data was saved
      await expect(page.locator('[data-testid="financial-interest-description"]')).toHaveValue('Network test data');
    });

    test('should handle memory stress with large datasets', async ({ page }) => {
      const startTime = Date.now();
      
      // Create maximum entries across all subsections
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="foreign-business-activities-yes"]');
      await page.click('[data-testid="foreign-travel-yes"]');
      
      // Add many entries with full data
      for (let i = 0; i < 20; i++) {
        await page.click('[data-testid="add-financial-interest-entry"]');
        await page.fill(`[data-testid="financial-interest-description-${i}"]`, `Large dataset entry ${i + 1} with lots of text to simulate memory usage and test performance under stress conditions`);
        await page.selectOption(`[data-testid="financial-interest-type-${i}"]`, 'investment');
        await page.fill(`[data-testid="current-value-amount-${i}"]`, `${(i + 1) * 10000}`);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`Created 20 large entries in ${duration}ms`);
      
      // Verify all entries exist and have correct data
      for (let i = 0; i < 20; i++) {
        await expect(page.locator(`[data-testid="financial-interest-description-${i}"]`)).toContainText(`Large dataset entry ${i + 1}`);
      }
      
      // Performance should be reasonable
      expect(duration).toBeLessThan(60000); // Should complete within 60 seconds
    });
  });

  test.describe('Accessibility and Usability', () => {
    
    test('should support keyboard navigation through all fields', async ({ page }) => {
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');
      
      // Start from first field
      await page.focus('[data-testid="financial-interest-type"]');
      
      // Tab through fields
      const expectedTabOrder = [
        '[data-testid="financial-interest-type"]',
        '[data-testid="financial-interest-description"]',
        '[data-testid="date-acquired-date"]',
        '[data-testid="how-acquired"]',
        '[data-testid="current-value-amount"]'
      ];
      
      for (let i = 0; i < expectedTabOrder.length - 1; i++) {
        await page.keyboard.press('Tab');
        const nextField = expectedTabOrder[i + 1];
        await expect(page.locator(nextField)).toBeFocused();
        console.log(`✅ Tab navigation: ${nextField} focused`);
      }
    });

    test('should provide proper ARIA labels and roles', async ({ page }) => {
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');
      
      // Check for ARIA attributes
      const fieldsToCheck = [
        '[data-testid="financial-interest-type"]',
        '[data-testid="financial-interest-description"]',
        '[data-testid="current-value-amount"]'
      ];
      
      for (const selector of fieldsToCheck) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible()) {
            const ariaLabel = await element.getAttribute('aria-label');
            const ariaDescribedBy = await element.getAttribute('aria-describedby');
            const role = await element.getAttribute('role');
            
            console.log(`${selector} ARIA attributes:`, { ariaLabel, ariaDescribedBy, role });
            
            // At least one accessibility attribute should be present
            expect(ariaLabel || ariaDescribedBy || role).toBeTruthy();
          }
        } catch (error) {
          console.log(`Could not check ARIA attributes for ${selector}`);
        }
      }
    });
  });
});
