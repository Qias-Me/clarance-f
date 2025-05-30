/**
 * SF86FormContext Integration Tests
 * 
 * Comprehensive tests for the central SF86FormContext that coordinates all 30 sections,
 * manages global form state, handles ApplicantFormValues integration, and provides
 * unified change tracking and validation.
 */

import { test, expect } from '@playwright/test';

test.describe('SF86FormContext - Central Form Coordinator', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the SF86FormContext test page
    await page.goto('/test/sf86-form-context');
    await page.waitForSelector('[data-testid="sf86-form-context-test"]', { timeout: 10000 });
    
    // Clear any existing data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Global Form State Management', () => {
    test('should initialize with default ApplicantFormValues structure', async ({ page }) => {
      // Check initial form state
      const formData = await page.locator('[data-testid="global-form-data"]').textContent();
      const parsedData = JSON.parse(formData || '{}');
      
      expect(parsedData).toHaveProperty('personalInfo');
      expect(parsedData).toHaveProperty('aknowledgementInfo');
      expect(parsedData).toHaveProperty('section29');
      expect(parsedData).toHaveProperty('signature');
      expect(parsedData).toHaveProperty('print');
    });

    test('should track global form dirty state', async ({ page }) => {
      // Initial state should not be dirty
      await expect(page.locator('[data-testid="global-is-dirty"]')).toContainText('false');
      
      // Update section data
      await page.click('[data-testid="update-section29-data"]');
      
      // Should now be dirty
      await expect(page.locator('[data-testid="global-is-dirty"]')).toContainText('true');
    });

    test('should track global form validation state', async ({ page }) => {
      // Initial state should be valid (no required fields filled)
      await expect(page.locator('[data-testid="global-is-valid"]')).toContainText('true');
      
      // Add invalid data to trigger validation errors
      await page.click('[data-testid="add-invalid-section29-data"]');
      await page.click('[data-testid="trigger-global-validation"]');
      
      // Should now be invalid
      await expect(page.locator('[data-testid="global-is-valid"]')).toContainText('false');
      
      // Check validation errors are displayed
      await expect(page.locator('[data-testid="global-validation-errors"]')).toContainText('error');
    });

    test('should manage section completion tracking', async ({ page }) => {
      // Initially no sections should be completed
      const initialCompleted = await page.locator('[data-testid="completed-sections"]').textContent();
      expect(initialCompleted).toBe('[]');
      
      // Mark section29 as complete
      await page.click('[data-testid="mark-section29-complete"]');
      
      // Should show section29 as completed
      await expect(page.locator('[data-testid="completed-sections"]')).toContainText('section29');
      
      // Mark section29 as incomplete
      await page.click('[data-testid="mark-section29-incomplete"]');
      
      // Should remove section29 from completed list
      const finalCompleted = await page.locator('[data-testid="completed-sections"]').textContent();
      expect(finalCompleted).toBe('[]');
    });
  });

  test.describe('Section Registration and Management', () => {
    test('should register sections with the central context', async ({ page }) => {
      // Check that sections are registered
      const registeredSections = await page.locator('[data-testid="registered-sections"]').textContent();
      const sections = JSON.parse(registeredSections || '[]');
      
      expect(sections).toContainEqual(
        expect.objectContaining({
          sectionId: 'section29',
          sectionName: 'Section 29: Associations'
        })
      );
    });

    test('should track active sections (sections with data)', async ({ page }) => {
      // Initially no sections should be active
      const initialActive = await page.locator('[data-testid="active-sections"]').textContent();
      expect(JSON.parse(initialActive || '[]')).toHaveLength(0);
      
      // Add data to section29
      await page.click('[data-testid="add-section29-data"]');
      
      // Should show section29 as active
      await expect(page.locator('[data-testid="active-sections"]')).toContainText('section29');
    });

    test('should coordinate section data updates', async ({ page }) => {
      // Update section data through central context
      await page.click('[data-testid="update-section-data-centrally"]');
      
      // Verify data was updated in both central context and section context
      await expect(page.locator('[data-testid="central-section29-data"]')).toContainText('updated');
      await expect(page.locator('[data-testid="section29-context-data"]')).toContainText('updated');
    });
  });

  test.describe('Data Persistence and Auto-Save', () => {
    test('should save form data to localStorage', async ({ page }) => {
      // Add some data
      await page.click('[data-testid="add-section29-data"]');
      
      // Trigger save
      await page.click('[data-testid="save-form"]');
      
      // Check localStorage
      const savedData = await page.evaluate(() => {
        return localStorage.getItem('sf86-form-data');
      });
      
      expect(savedData).toBeTruthy();
      const parsedData = JSON.parse(savedData || '{}');
      expect(parsedData).toHaveProperty('section29');
    });

    test('should load form data from localStorage', async ({ page }) => {
      // Set up test data in localStorage
      await page.evaluate(() => {
        const testData = {
          section29: {
            _id: 29,
            terrorismOrganizations: {
              hasAssociation: { value: 'YES' },
              entries: [{ _id: 1, organizationName: { value: 'Test Org' } }]
            }
          }
        };
        localStorage.setItem('sf86-form-data', JSON.stringify(testData));
      });
      
      // Reload page to trigger data loading
      await page.reload();
      await page.waitForSelector('[data-testid="sf86-form-context-test"]', { timeout: 10000 });
      
      // Verify data was loaded
      await expect(page.locator('[data-testid="section29-loaded-data"]')).toContainText('Test Org');
    });

    test('should auto-save after changes with debounce', async ({ page }) => {
      // Enable auto-save
      await page.click('[data-testid="enable-auto-save"]');
      
      // Make a change
      await page.click('[data-testid="add-section29-data"]');
      
      // Wait for auto-save debounce (5 seconds)
      await page.waitForTimeout(6000);
      
      // Check that auto-save occurred
      await expect(page.locator('[data-testid="last-saved"]')).not.toContainText('null');
    });

    test('should handle save errors gracefully', async ({ page }) => {
      // Mock localStorage to throw error
      await page.evaluate(() => {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = () => {
          throw new Error('Storage quota exceeded');
        };
      });
      
      // Try to save
      await page.click('[data-testid="save-form"]');
      
      // Should show error state
      await expect(page.locator('[data-testid="save-error"]')).toBeVisible();
    });
  });

  test.describe('Global Validation Coordination', () => {
    test('should coordinate validation across all sections', async ({ page }) => {
      // Add invalid data to multiple sections
      await page.click('[data-testid="add-invalid-section29-data"]');
      await page.click('[data-testid="add-invalid-section7-data"]');
      
      // Trigger global validation
      await page.click('[data-testid="trigger-global-validation"]');
      
      // Should collect errors from all sections
      const validationResult = await page.locator('[data-testid="global-validation-result"]').textContent();
      const result = JSON.parse(validationResult || '{}');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: expect.stringContaining('section29')
        })
      );
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: expect.stringContaining('section7')
        })
      );
    });

    test('should validate individual sections through central context', async ({ page }) => {
      // Add invalid data to section29
      await page.click('[data-testid="add-invalid-section29-data"]');
      
      // Validate only section29
      await page.click('[data-testid="validate-section29-only"]');
      
      // Should show section-specific validation result
      const validationResult = await page.locator('[data-testid="section29-validation-result"]').textContent();
      const result = JSON.parse(validationResult || '{}');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: expect.stringContaining('terrorismOrganizations')
        })
      );
    });
  });

  test.describe('Navigation and Section Coordination', () => {
    test('should navigate between sections', async ({ page }) => {
      // Navigate to section29
      await page.click('[data-testid="navigate-to-section29"]');
      
      // Should emit navigation event
      await expect(page.locator('[data-testid="current-navigation-target"]')).toContainText('section29');
      
      // Navigate to section30
      await page.click('[data-testid="navigate-to-section30"]');
      
      // Should update navigation target
      await expect(page.locator('[data-testid="current-navigation-target"]')).toContainText('section30');
    });

    test('should get next incomplete section', async ({ page }) => {
      // Mark some sections as complete
      await page.click('[data-testid="mark-section29-complete"]');
      await page.click('[data-testid="mark-section7-complete"]');
      
      // Get next incomplete section
      await page.click('[data-testid="get-next-incomplete"]');
      
      // Should return first incomplete section
      const nextIncomplete = await page.locator('[data-testid="next-incomplete-section"]').textContent();
      expect(nextIncomplete).not.toBe('section29');
      expect(nextIncomplete).not.toBe('section7');
      expect(nextIncomplete).toBeTruthy();
    });

    test('should get previous and next sections', async ({ page }) => {
      // Test previous section for section29
      await page.click('[data-testid="get-previous-section29"]');
      const previousSection = await page.locator('[data-testid="previous-section-result"]').textContent();
      expect(previousSection).toBe('section28');
      
      // Test next section for section29
      await page.click('[data-testid="get-next-section29"]');
      const nextSection = await page.locator('[data-testid="next-section-result"]').textContent();
      expect(nextSection).toBe('section30');
    });
  });

  test.describe('Change Tracking and History', () => {
    test('should track all form changes', async ({ page }) => {
      // Make multiple changes
      await page.click('[data-testid="add-section29-data"]');
      await page.click('[data-testid="add-section7-data"]');
      
      // Get changes
      await page.click('[data-testid="get-form-changes"]');
      
      // Should track changes for both sections
      const changes = await page.locator('[data-testid="form-changes"]').textContent();
      const parsedChanges = JSON.parse(changes || '{}');
      
      expect(parsedChanges).toHaveProperty('section29');
      expect(parsedChanges).toHaveProperty('section7');
      expect(parsedChanges.section29).toHaveProperty('timestamp');
      expect(parsedChanges.section7).toHaveProperty('timestamp');
    });

    test('should detect unsaved changes', async ({ page }) => {
      // Initially should have no unsaved changes
      await expect(page.locator('[data-testid="has-unsaved-changes"]')).toContainText('false');
      
      // Make a change
      await page.click('[data-testid="add-section29-data"]');
      
      // Should detect unsaved changes
      await expect(page.locator('[data-testid="has-unsaved-changes"]')).toContainText('true');
      
      // Save changes
      await page.click('[data-testid="save-form"]');
      
      // Should no longer have unsaved changes
      await expect(page.locator('[data-testid="has-unsaved-changes"]')).toContainText('false');
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should handle section registration errors gracefully', async ({ page }) => {
      // Try to register invalid section
      await page.click('[data-testid="register-invalid-section"]');
      
      // Should handle error without crashing
      await expect(page.locator('[data-testid="sf86-form-context-test"]')).toBeVisible();
      await expect(page.locator('[data-testid="registration-error"]')).toBeVisible();
    });

    test('should handle validation errors gracefully', async ({ page }) => {
      // Mock validation to throw error
      await page.evaluate(() => {
        window.mockValidationError = true;
      });
      
      // Try to validate
      await page.click('[data-testid="trigger-global-validation"]');
      
      // Should handle error gracefully
      await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    });

    test('should recover from corrupted localStorage data', async ({ page }) => {
      // Set corrupted data in localStorage
      await page.evaluate(() => {
        localStorage.setItem('sf86-form-data', 'invalid json data');
      });
      
      // Reload page
      await page.reload();
      await page.waitForSelector('[data-testid="sf86-form-context-test"]', { timeout: 10000 });
      
      // Should recover with default data
      const formData = await page.locator('[data-testid="global-form-data"]').textContent();
      const parsedData = JSON.parse(formData || '{}');
      expect(parsedData).toHaveProperty('personalInfo');
    });
  });

  test.describe('Performance and Memory Management', () => {
    test('should not cause memory leaks with multiple updates', async ({ page }) => {
      // Perform many rapid updates
      for (let i = 0; i < 50; i++) {
        await page.click('[data-testid="rapid-update-section29"]');
        await page.waitForTimeout(10); // Small delay to prevent overwhelming
      }
      
      // Check that the context is still responsive
      await expect(page.locator('[data-testid="global-is-dirty"]')).toContainText('true');
      
      // Check memory usage (basic check)
      const memoryInfo = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize
        } : null;
      });
      
      if (memoryInfo) {
        expect(memoryInfo.usedJSHeapSize).toBeLessThan(memoryInfo.totalJSHeapSize * 0.8);
      }
    });

    test('should handle large form data efficiently', async ({ page }) => {
      // Add large amount of data
      await page.click('[data-testid="add-large-dataset"]');
      
      // Measure performance
      const startTime = Date.now();
      await page.click('[data-testid="trigger-global-validation"]');
      const endTime = Date.now();
      
      // Should complete validation within reasonable time (5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
      
      // Should still be responsive
      await expect(page.locator('[data-testid="global-validation-result"]')).toBeVisible();
    });
  });
});
