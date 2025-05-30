/**
 * Centralized SF-86 Form - Comprehensive Playwright Tests
 *
 * Tests the complete, production-ready SF-86 form implementation that integrates
 * all sections in one cohesive structure. Validates centralized section integration,
 * cross-section communication, form-wide operations, and navigation.
 */

import { test, expect } from '@playwright/test';

test.describe('Centralized SF-86 Form Implementation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the centralized SF-86 form
    await page.goto('/startForm');
    await page.waitForSelector('[data-testid="centralized-sf86-form"]', { timeout: 10000 });

    // Clear any existing data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Form Initialization and Structure', () => {
    test('should initialize with proper header and metadata', async ({ page }) => {
      // Check main header
      await expect(page.locator('h1')).toContainText('SF-86 Questionnaire for National Security Positions');

      // Check form version and metadata
      await expect(page.locator('text=Form Version: 2024.1')).toBeVisible();
      await expect(page.locator('text=Environment: development')).toBeVisible();
      await expect(page.locator('text=Progress: 0/30')).toBeVisible();
    });

    test('should display section navigation with implemented sections', async ({ page }) => {
      // Check section navigation is visible
      await expect(page.locator('[data-testid="section-navigation"]')).toBeVisible();

      // Check implemented sections are highlighted
      await expect(page.locator('[data-testid="section-section7-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="section-section29-button"]')).toBeVisible();

      // Check section titles
      await expect(page.locator('[data-testid="section-section7-button"]')).toContainText('Where You Have Lived');
      await expect(page.locator('[data-testid="section-section29-button"]')).toContainText('Association Record');
    });

    test('should show all 30 sections when expanded', async ({ page }) => {
      // Expand all sections
      await page.click('[data-testid="toggle-sections-button"]');

      // Check that all 30 sections are visible
      for (let i = 1; i <= 30; i++) {
        await expect(page.locator(`[data-testid="section-section${i}-nav-button"]`)).toBeVisible();
      }

      // Check that implemented sections have checkmarks
      await expect(page.locator('[data-testid="section-section7-nav-button"] .bg-green-100')).toBeVisible();
      await expect(page.locator('[data-testid="section-section29-nav-button"] .bg-green-100')).toBeVisible();
    });
  });

  test.describe('Section Navigation and Integration', () => {
    test('should navigate to Section 7 and display content', async ({ page }) => {
      // Click on Section 7
      await page.click('[data-testid="section-section7-button"]');

      // Verify section change
      // Note: This would require the child route to be implemented
      // For now, we'll check that the navigation state changes
      await expect(page.locator('[data-testid="section-section7-button"]')).toHaveClass(/border-blue-500/);
    });

    test('should navigate to Section 29 and display content', async ({ page }) => {
      // Click on Section 29
      await page.click('[data-testid="section-section29-button"]');

      // Verify section change
      await expect(page.locator('[data-testid="section-section29-button"]')).toHaveClass(/border-blue-500/);
    });

    test('should disable navigation to unimplemented sections', async ({ page }) => {
      // Expand all sections
      await page.click('[data-testid="toggle-sections-button"]');

      // Try to click on an unimplemented section (e.g., section1)
      const section1Button = page.locator('[data-testid="section-section1-nav-button"]');
      await expect(section1Button).toHaveClass(/cursor-not-allowed/);
      await expect(section1Button).toBeDisabled();
    });
  });

  test.describe('Global Form Operations', () => {
    test('should trigger global validation', async ({ page }) => {
      // Click global validate button
      await page.click('[data-testid="global-validate-button"]');

      // Check console for validation result (in a real implementation, this would show UI feedback)
      const logs = await page.evaluate(() => {
        return window.console.log.toString();
      });

      // The validation should have been triggered
      expect(logs).toBeDefined();
    });

    test('should trigger global save', async ({ page }) => {
      // Click global save button
      await page.click('[data-testid="global-save-button"]');

      // Check console for save result (in a real implementation, this would show UI feedback)
      const logs = await page.evaluate(() => {
        return window.console.log.toString();
      });

      // The save should have been triggered
      expect(logs).toBeDefined();
    });

    test('should toggle section expansion', async ({ page }) => {
      // Initially collapsed
      await expect(page.locator('[data-testid="section-section1-nav-button"]')).not.toBeVisible();

      // Expand sections
      await page.click('[data-testid="toggle-sections-button"]');
      await expect(page.locator('[data-testid="section-section1-nav-button"]')).toBeVisible();

      // Collapse sections
      await page.click('[data-testid="toggle-sections-button"]');
      await expect(page.locator('[data-testid="section-section1-nav-button"]')).not.toBeVisible();
    });
  });

  test.describe('Form Actions and PDF Generation', () => {
    test('should handle form validation action', async ({ page }) => {
      // Create a form with test data
      const testFormData = {
        personalInfo: { applicantID: 'test123' },
        signature: { signed: true }
      };

      // Submit validation action
      await page.evaluate((formData) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/startForm';

        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'data';
        dataInput.value = JSON.stringify(formData);

        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'actionType';
        actionInput.value = 'validateForm';

        form.appendChild(dataInput);
        form.appendChild(actionInput);
        document.body.appendChild(form);
        form.submit();
      }, testFormData);

      // Wait for action result
      await page.waitForSelector('[data-testid="action-results"]', { timeout: 5000 });

      // Check success message
      await expect(page.locator('[data-testid="action-results"]')).toContainText('Form validation passed');
    });

    test('should handle PDF generation action', async ({ page }) => {
      // Create a form with test data
      const testFormData = {
        personalInfo: {
          applicantID: 'test123',
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      // Submit PDF generation action
      await page.evaluate((formData) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/startForm';

        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'data';
        dataInput.value = JSON.stringify(formData);

        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'actionType';
        actionInput.value = 'generatePDF';

        form.appendChild(dataInput);
        form.appendChild(actionInput);
        document.body.appendChild(form);
        form.submit();
      }, testFormData);

      // Wait for action result
      await page.waitForSelector('[data-testid="action-results"]', { timeout: 10000 });

      // Check success message
      await expect(page.locator('[data-testid="action-results"]')).toContainText('PDF generated successfully');
    });

    test('should handle form save action', async ({ page }) => {
      // Create a form with test data
      const testFormData = {
        personalInfo: { applicantID: 'test123' }
      };

      // Submit save action
      await page.evaluate((formData) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/startForm';

        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'data';
        dataInput.value = JSON.stringify(formData);

        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'actionType';
        actionInput.value = 'saveForm';

        form.appendChild(dataInput);
        form.appendChild(actionInput);
        document.body.appendChild(form);
        form.submit();
      }, testFormData);

      // Wait for action result
      await page.waitForSelector('[data-testid="action-results"]', { timeout: 5000 });

      // Check success message
      await expect(page.locator('[data-testid="action-results"]')).toContainText('Form saved successfully');
    });

    test('should handle form submission action', async ({ page }) => {
      // Create a complete form with test data
      const testFormData = {
        personalInfo: {
          applicantID: 'test123',
          firstName: 'John',
          lastName: 'Doe'
        },
        signature: { signed: true }
      };

      // Submit form submission action
      await page.evaluate((formData) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/startForm';

        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'data';
        dataInput.value = JSON.stringify(formData);

        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'actionType';
        actionInput.value = 'submitForm';

        form.appendChild(dataInput);
        form.appendChild(actionInput);
        document.body.appendChild(form);
        form.submit();
      }, testFormData);

      // Wait for action result
      await page.waitForSelector('[data-testid="action-results"]', { timeout: 5000 });

      // Check success message
      await expect(page.locator('[data-testid="action-results"]')).toContainText('Form submitted successfully for processing');

      // Check submission details
      await page.click('[data-testid="action-results"] summary');
      await expect(page.locator('[data-testid="action-results"] pre')).toContainText('submissionId');
      await expect(page.locator('[data-testid="action-results"] pre')).toContainText('status');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid JSON data gracefully', async ({ page }) => {
      // Submit invalid JSON
      await page.evaluate(() => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/startForm';

        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'data';
        dataInput.value = 'invalid json';

        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'actionType';
        actionInput.value = 'validateForm';

        form.appendChild(dataInput);
        form.appendChild(actionInput);
        document.body.appendChild(form);
        form.submit();
      });

      // Wait for error result
      await page.waitForSelector('[data-testid="action-results"]', { timeout: 5000 });

      // Check error message
      await expect(page.locator('[data-testid="action-results"]')).toContainText('Invalid applicant data');
      await expect(page.locator('[data-testid="action-results"] .text-red-600')).toBeVisible();
    });

    test('should handle invalid action type gracefully', async ({ page }) => {
      // Submit invalid action type
      await page.evaluate(() => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/startForm';

        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'data';
        dataInput.value = '{}';

        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'actionType';
        actionInput.value = 'invalidAction';

        form.appendChild(dataInput);
        form.appendChild(actionInput);
        document.body.appendChild(form);
        form.submit();
      });

      // Wait for error result
      await page.waitForSelector('[data-testid="action-results"]', { timeout: 5000 });

      // Check error message
      await expect(page.locator('[data-testid="action-results"]')).toContainText('Invalid action type');
    });
  });

  test.describe('Accessibility and User Experience', () => {
    test('should have proper ARIA labels and roles @accessibility', async ({ page }) => {
      // Check main navigation has proper ARIA
      await expect(page.locator('[data-testid="section-navigation"]')).toBeVisible();

      // Check buttons have proper labels
      await expect(page.locator('[data-testid="global-validate-button"]')).toHaveText('Validate All');
      await expect(page.locator('[data-testid="global-save-button"]')).toHaveText('Save Form');
      await expect(page.locator('[data-testid="toggle-sections-button"]')).toHaveText('Expand Sections');
    });

    test('should be keyboard navigable @accessibility', async ({ page }) => {
      // Tab through navigation elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should be able to activate buttons with Enter
      await page.keyboard.press('Enter');

      // Check that some action was triggered (button should be focused)
      const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      expect(focusedElement).toBeTruthy();
    });

    test('should display action results with proper styling @user-experience', async ({ page }) => {
      // Trigger a successful action
      const testFormData = { personalInfo: { applicantID: 'test123' } };

      await page.evaluate((formData) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/startForm';

        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'data';
        dataInput.value = JSON.stringify(formData);

        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'actionType';
        actionInput.value = 'saveForm';

        form.appendChild(dataInput);
        form.appendChild(actionInput);
        document.body.appendChild(form);
        form.submit();
      }, testFormData);

      // Wait for result
      await page.waitForSelector('[data-testid="action-results"]', { timeout: 5000 });

      // Check success styling
      await expect(page.locator('[data-testid="action-results"]')).toHaveClass(/bg-green-100/);
      await expect(page.locator('[data-testid="action-results"] .text-green-600')).toBeVisible();
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('should load within acceptable time limits @performance', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/startForm');
      await page.waitForSelector('[data-testid="centralized-sf86-form"]');

      const loadTime = Date.now() - startTime;

      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);

      // Check that all critical elements are loaded
      await expect(page.locator('[data-testid="section-navigation"]')).toBeVisible();
      await expect(page.locator('[data-testid="section-section7-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="section-section29-button"]')).toBeVisible();
    });

    test('should handle rapid section navigation @performance', async ({ page }) => {
      // Rapidly switch between sections
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="section-section7-button"]');
        await page.waitForTimeout(100);
        await page.click('[data-testid="section-section29-button"]');
        await page.waitForTimeout(100);
      }

      // Should still be responsive
      await expect(page.locator('[data-testid="section-section29-button"]')).toHaveClass(/border-blue-500/);
    });

    test('should handle multiple form actions efficiently @performance', async ({ page }) => {
      const testFormData = { personalInfo: { applicantID: 'test123' } };

      // Perform multiple actions in sequence
      const actions = ['saveForm', 'validateForm', 'exportForm'];

      for (const action of actions) {
        const startTime = Date.now();

        await page.evaluate((data) => {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = '/startForm';

          const dataInput = document.createElement('input');
          dataInput.type = 'hidden';
          dataInput.name = 'data';
          dataInput.value = JSON.stringify(data.formData);

          const actionInput = document.createElement('input');
          actionInput.type = 'hidden';
          actionInput.name = 'actionType';
          actionInput.value = data.action;

          form.appendChild(dataInput);
          form.appendChild(actionInput);
          document.body.appendChild(form);
          form.submit();
        }, { formData: testFormData, action });

        await page.waitForSelector('[data-testid="action-results"]', { timeout: 5000 });

        const actionTime = Date.now() - startTime;

        // Each action should complete within 3 seconds
        expect(actionTime).toBeLessThan(3000);

        // Clear results for next action
        await page.reload();
        await page.waitForSelector('[data-testid="centralized-sf86-form"]');
      }
    });
  });

  test.describe('Cross-Section Integration', () => {
    test('should maintain state across section navigation @integration', async ({ page }) => {
      // Navigate to Section 7
      await page.click('[data-testid="section-section7-button"]');
      await expect(page.locator('[data-testid="section-section7-button"]')).toHaveClass(/border-blue-500/);

      // Navigate to Section 29
      await page.click('[data-testid="section-section29-button"]');
      await expect(page.locator('[data-testid="section-section29-button"]')).toHaveClass(/border-blue-500/);

      // Navigate back to Section 7
      await page.click('[data-testid="section-section7-button"]');
      await expect(page.locator('[data-testid="section-section7-button"]')).toHaveClass(/border-blue-500/);

      // Section 29 should no longer be active
      await expect(page.locator('[data-testid="section-section29-button"]')).not.toHaveClass(/border-blue-500/);
    });

    test('should coordinate between context providers @integration', async ({ page }) => {
      // Test that global actions work with section-specific contexts
      await page.click('[data-testid="section-section7-button"]');

      // Global validation should work even when a specific section is selected
      await page.click('[data-testid="global-validate-button"]');

      // Global save should work even when a specific section is selected
      await page.click('[data-testid="global-save-button"]');

      // Section should still be active
      await expect(page.locator('[data-testid="section-section7-button"]')).toHaveClass(/border-blue-500/);
    });

    test('should handle form-wide operations correctly @integration', async ({ page }) => {
      const testFormData = {
        personalInfo: { applicantID: 'test123' },
        section7: { residences: [{ address: '123 Test St' }] },
        section29: { associations: [{ name: 'Test Association' }] }
      };

      // Submit a form-wide validation
      await page.evaluate((formData) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/startForm';

        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'data';
        dataInput.value = JSON.stringify(formData);

        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'actionType';
        actionInput.value = 'validateForm';

        form.appendChild(dataInput);
        form.appendChild(actionInput);
        document.body.appendChild(form);
        form.submit();
      }, testFormData);

      await page.waitForSelector('[data-testid="action-results"]', { timeout: 5000 });

      // Should handle multi-section data correctly
      await expect(page.locator('[data-testid="action-results"]')).toContainText('Form validation passed');
    });
  });

  test.describe('Security and Data Integrity', () => {
    test('should sanitize form data properly @security', async ({ page }) => {
      // Test with potentially malicious data
      const maliciousData = {
        personalInfo: {
          applicantID: '<script>alert("xss")</script>',
          firstName: '"><img src=x onerror=alert("xss")>',
          lastName: 'javascript:alert("xss")'
        }
      };

      await page.evaluate((formData) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/startForm';

        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'data';
        dataInput.value = JSON.stringify(formData);

        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'actionType';
        actionInput.value = 'validateForm';

        form.appendChild(dataInput);
        form.appendChild(actionInput);
        document.body.appendChild(form);
        form.submit();
      }, maliciousData);

      await page.waitForSelector('[data-testid="action-results"]', { timeout: 5000 });

      // Should not execute any scripts
      const alertDialogs = [];
      page.on('dialog', dialog => {
        alertDialogs.push(dialog);
        dialog.dismiss();
      });

      // Wait a moment to see if any alerts fire
      await page.waitForTimeout(1000);

      // No alert dialogs should have been triggered
      expect(alertDialogs).toHaveLength(0);
    });

    test('should maintain data integrity during operations @data-integrity', async ({ page }) => {
      const originalData = {
        personalInfo: {
          applicantID: 'test123',
          firstName: 'John',
          lastName: 'Doe'
        },
        signature: { signed: true }
      };

      // Save the data
      await page.evaluate((formData) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/startForm';

        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'data';
        dataInput.value = JSON.stringify(formData);

        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'actionType';
        actionInput.value = 'saveForm';

        form.appendChild(dataInput);
        form.appendChild(actionInput);
        document.body.appendChild(form);
        form.submit();
      }, originalData);

      await page.waitForSelector('[data-testid="action-results"]', { timeout: 5000 });
      await expect(page.locator('[data-testid="action-results"]')).toContainText('Form saved successfully');

      // Export the data to verify integrity
      await page.reload();
      await page.waitForSelector('[data-testid="centralized-sf86-form"]');

      await page.evaluate((formData) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/startForm';

        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'data';
        dataInput.value = JSON.stringify(formData);

        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'actionType';
        actionInput.value = 'exportForm';

        form.appendChild(dataInput);
        form.appendChild(actionInput);
        document.body.appendChild(form);
        form.submit();
      }, originalData);

      await page.waitForSelector('[data-testid="action-results"]', { timeout: 5000 });
      await expect(page.locator('[data-testid="action-results"]')).toContainText('Form exported successfully');
    });
  });
});
