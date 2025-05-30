/**
 * Section Integration Framework Tests
 * 
 * Comprehensive tests for the section integration framework that allows individual
 * section contexts to integrate with the central SF86FormContext while maintaining
 * their independence and section-specific functionality.
 */

import { test, expect } from '@playwright/test';

test.describe('Section Integration Framework', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the section integration test page
    await page.goto('/test/section-integration');
    await page.waitForSelector('[data-testid="section-integration-test"]', { timeout: 10000 });
    
    // Clear any existing data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Bidirectional Data Synchronization', () => {
    test('should sync section data to central form when section changes', async ({ page }) => {
      // Update data in section29 context
      await page.click('[data-testid="section29-add-organization"]');
      await page.fill('[data-testid="section29-org-name"]', 'Test Organization');
      
      // Check that central form was updated
      const centralData = await page.locator('[data-testid="central-section29-data"]').textContent();
      expect(centralData).toContain('Test Organization');
      
      // Verify sync event was emitted
      await expect(page.locator('[data-testid="sync-events"]')).toContainText('SECTION_UPDATE');
    });

    test('should sync central form data to section when central changes', async ({ page }) => {
      // Update data through central form context
      await page.click('[data-testid="central-update-section29"]');
      await page.evaluate(() => {
        window.updateCentralSection29Data({
          terrorismOrganizations: {
            hasAssociation: { value: 'YES' },
            entries: [{ organizationName: { value: 'Central Test Org' } }]
          }
        });
      });
      
      // Check that section29 context was updated
      await expect(page.locator('[data-testid="section29-org-name"]')).toHaveValue('Central Test Org');
      
      // Verify data sync event was received
      await expect(page.locator('[data-testid="section29-events"]')).toContainText('DATA_SYNC');
    });

    test('should handle initial data loading from central form', async ({ page }) => {
      // Set up initial data in central form
      await page.evaluate(() => {
        localStorage.setItem('sf86-form-data', JSON.stringify({
          section29: {
            terrorismOrganizations: {
              hasAssociation: { value: 'YES' },
              entries: [{ organizationName: { value: 'Initial Org' } }]
            }
          }
        }));
      });
      
      // Reload page to trigger initial loading
      await page.reload();
      await page.waitForSelector('[data-testid="section-integration-test"]', { timeout: 10000 });
      
      // Verify section29 loaded the initial data
      await expect(page.locator('[data-testid="section29-org-name"]')).toHaveValue('Initial Org');
      await expect(page.locator('[data-testid="section29-has-association"]')).toHaveValue('YES');
    });

    test('should prevent infinite sync loops', async ({ page }) => {
      // Monitor sync events
      await page.evaluate(() => {
        window.syncEventCount = 0;
        window.addEventListener('section-sync', () => {
          window.syncEventCount++;
        });
      });
      
      // Make a change that could trigger a loop
      await page.click('[data-testid="section29-add-organization"]');
      await page.fill('[data-testid="section29-org-name"]', 'Loop Test');
      
      // Wait a bit for any potential loops
      await page.waitForTimeout(2000);
      
      // Check that sync events didn't spiral out of control
      const syncCount = await page.evaluate(() => window.syncEventCount);
      expect(syncCount).toBeLessThan(5); // Should be minimal, not hundreds
    });
  });

  test.describe('Integration Hook Functionality', () => {
    test('should provide all integration capabilities to sections', async ({ page }) => {
      // Check that section29 has access to integration methods
      const integrationMethods = await page.evaluate(() => {
        const section29Context = window.getSection29Context();
        return {
          hasMarkComplete: typeof section29Context.markComplete === 'function',
          hasMarkIncomplete: typeof section29Context.markIncomplete === 'function',
          hasTriggerGlobalValidation: typeof section29Context.triggerGlobalValidation === 'function',
          hasGetGlobalFormState: typeof section29Context.getGlobalFormState === 'function',
          hasNavigateToSection: typeof section29Context.navigateToSection === 'function',
          hasSaveForm: typeof section29Context.saveForm === 'function',
          hasEmitEvent: typeof section29Context.emitEvent === 'function',
          hasSubscribeToEvents: typeof section29Context.subscribeToEvents === 'function'
        };
      });
      
      expect(integrationMethods.hasMarkComplete).toBe(true);
      expect(integrationMethods.hasMarkIncomplete).toBe(true);
      expect(integrationMethods.hasTriggerGlobalValidation).toBe(true);
      expect(integrationMethods.hasGetGlobalFormState).toBe(true);
      expect(integrationMethods.hasNavigateToSection).toBe(true);
      expect(integrationMethods.hasSaveForm).toBe(true);
      expect(integrationMethods.hasEmitEvent).toBe(true);
      expect(integrationMethods.hasSubscribeToEvents).toBe(true);
    });

    test('should allow sections to mark themselves complete', async ({ page }) => {
      // Mark section29 as complete through integration
      await page.click('[data-testid="section29-mark-complete"]');
      
      // Check that central form shows section29 as complete
      await expect(page.locator('[data-testid="central-completed-sections"]')).toContainText('section29');
      
      // Mark section29 as incomplete
      await page.click('[data-testid="section29-mark-incomplete"]');
      
      // Check that central form removes section29 from completed
      const completedSections = await page.locator('[data-testid="central-completed-sections"]').textContent();
      expect(completedSections).not.toContain('section29');
    });

    test('should allow sections to trigger global validation', async ({ page }) => {
      // Add invalid data to multiple sections
      await page.click('[data-testid="add-invalid-data-multiple-sections"]');
      
      // Trigger global validation from section29
      await page.click('[data-testid="section29-trigger-global-validation"]');
      
      // Check that global validation result includes errors from multiple sections
      const validationResult = await page.locator('[data-testid="global-validation-result"]').textContent();
      const result = JSON.parse(validationResult || '{}');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1); // Multiple sections should have errors
    });

    test('should allow sections to access global form state', async ({ page }) => {
      // Add data to multiple sections
      await page.click('[data-testid="add-data-multiple-sections"]');
      
      // Get global form state from section29
      await page.click('[data-testid="section29-get-global-state"]');
      
      // Check that section29 can see data from other sections
      const globalState = await page.locator('[data-testid="section29-global-state"]').textContent();
      const state = JSON.parse(globalState || '{}');
      
      expect(state.formData).toHaveProperty('section29');
      expect(state.formData).toHaveProperty('section7');
      expect(state.isDirty).toBe(true);
    });

    test('should allow sections to navigate to other sections', async ({ page }) => {
      // Navigate from section29 to section30
      await page.click('[data-testid="section29-navigate-to-section30"]');
      
      // Check that navigation event was emitted
      await expect(page.locator('[data-testid="navigation-events"]')).toContainText('section30');
      
      // Check that current navigation target is updated
      await expect(page.locator('[data-testid="current-navigation-target"]')).toContainText('section30');
    });

    test('should allow sections to save the entire form', async ({ page }) => {
      // Add data to section29
      await page.click('[data-testid="section29-add-organization"]');
      
      // Save form through section29 integration
      await page.click('[data-testid="section29-save-form"]');
      
      // Check that form was saved
      const savedData = await page.evaluate(() => {
        return localStorage.getItem('sf86-form-data');
      });
      
      expect(savedData).toBeTruthy();
      const parsedData = JSON.parse(savedData || '{}');
      expect(parsedData).toHaveProperty('section29');
    });
  });

  test.describe('Event-Driven Communication', () => {
    test('should allow sections to emit events to other sections', async ({ page }) => {
      // Set up event listener in section7
      await page.click('[data-testid="section7-setup-event-listener"]');
      
      // Emit event from section29
      await page.click('[data-testid="section29-emit-test-event"]');
      
      // Check that section7 received the event
      await expect(page.locator('[data-testid="section7-received-events"]')).toContainText('test-event-from-section29');
    });

    test('should allow sections to subscribe to specific event types', async ({ page }) => {
      // Subscribe section7 to SECTION_UPDATE events
      await page.click('[data-testid="section7-subscribe-section-updates"]');
      
      // Emit SECTION_UPDATE event from section29
      await page.click('[data-testid="section29-emit-section-update"]');
      
      // Check that section7 received the SECTION_UPDATE event
      await expect(page.locator('[data-testid="section7-section-update-events"]')).toContainText('SECTION_UPDATE');
      
      // Emit different event type from section29
      await page.click('[data-testid="section29-emit-data-sync"]');
      
      // Check that section7 did NOT receive the DATA_SYNC event (not subscribed)
      const dataSyncEvents = await page.locator('[data-testid="section7-data-sync-events"]').textContent();
      expect(dataSyncEvents).toBe('');
    });

    test('should properly clean up event subscriptions', async ({ page }) => {
      // Subscribe section7 to events
      await page.click('[data-testid="section7-subscribe-events"]');
      
      // Unmount section7 component
      await page.click('[data-testid="unmount-section7"]');
      
      // Emit event from section29
      await page.click('[data-testid="section29-emit-test-event"]');
      
      // Check that no memory leaks or errors occurred
      const consoleErrors = await page.evaluate(() => {
        return window.consoleErrors || [];
      });
      
      expect(consoleErrors.filter(error => error.includes('subscription'))).toHaveLength(0);
    });

    test('should handle event emission errors gracefully', async ({ page }) => {
      // Mock event bus to throw error
      await page.evaluate(() => {
        window.mockEventBusError = true;
      });
      
      // Try to emit event
      await page.click('[data-testid="section29-emit-test-event"]');
      
      // Should handle error gracefully without crashing
      await expect(page.locator('[data-testid="section-integration-test"]')).toBeVisible();
      await expect(page.locator('[data-testid="event-emission-error"]')).toBeVisible();
    });
  });

  test.describe('Change Notification System', () => {
    test('should notify integration of all section changes', async ({ page }) => {
      // Monitor change notifications
      await page.evaluate(() => {
        window.changeNotifications = [];
        window.addEventListener('section-change', (event) => {
          window.changeNotifications.push(event.detail);
        });
      });
      
      // Make various changes in section29
      await page.click('[data-testid="section29-update-flag"]');
      await page.click('[data-testid="section29-add-organization"]');
      await page.click('[data-testid="section29-remove-organization"]');
      
      // Check that all changes were notified
      const notifications = await page.evaluate(() => window.changeNotifications);
      
      expect(notifications).toContainEqual(
        expect.objectContaining({ changeType: 'subsection_flag_updated' })
      );
      expect(notifications).toContainEqual(
        expect.objectContaining({ changeType: 'organization_entry_added' })
      );
      expect(notifications).toContainEqual(
        expect.objectContaining({ changeType: 'entry_removed' })
      );
    });

    test('should include relevant payload data in change notifications', async ({ page }) => {
      // Monitor change notifications
      await page.evaluate(() => {
        window.changeNotifications = [];
        window.addEventListener('section-change', (event) => {
          window.changeNotifications.push(event.detail);
        });
      });
      
      // Make a specific change
      await page.click('[data-testid="section29-update-flag-yes"]');
      
      // Check that notification includes relevant payload
      const notifications = await page.evaluate(() => window.changeNotifications);
      const flagUpdate = notifications.find(n => n.changeType === 'subsection_flag_updated');
      
      expect(flagUpdate).toBeDefined();
      expect(flagUpdate.payload).toHaveProperty('hasValue', 'YES');
      expect(flagUpdate.payload).toHaveProperty('subsectionKey');
    });
  });

  test.describe('Validation Integration', () => {
    test('should integrate section validation with global validation', async ({ page }) => {
      // Add invalid data to section29
      await page.click('[data-testid="section29-add-invalid-data"]');
      
      // Trigger validation through integration
      await page.click('[data-testid="section29-validate-and-sync"]');
      
      // Check that validation errors are reflected in global state
      const globalErrors = await page.locator('[data-testid="global-validation-errors"]').textContent();
      expect(globalErrors).toContain('terrorismOrganizations');
    });

    test('should listen for global validation requests', async ({ page }) => {
      // Add invalid data to section29
      await page.click('[data-testid="section29-add-invalid-data"]');
      
      // Trigger global validation from central context
      await page.click('[data-testid="central-trigger-global-validation"]');
      
      // Check that section29 validation was called and contributed errors
      const validationResult = await page.locator('[data-testid="global-validation-result"]').textContent();
      const result = JSON.parse(validationResult || '{}');
      
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: expect.stringContaining('section29')
        })
      );
    });
  });

  test.describe('Performance and Memory Management', () => {
    test('should not cause memory leaks with frequent integration calls', async ({ page }) => {
      // Perform many integration operations
      for (let i = 0; i < 100; i++) {
        await page.click('[data-testid="section29-rapid-integration-call"]');
        if (i % 10 === 0) {
          await page.waitForTimeout(10); // Small delay every 10 operations
        }
      }
      
      // Check that integration is still responsive
      await page.click('[data-testid="section29-mark-complete"]');
      await expect(page.locator('[data-testid="central-completed-sections"]')).toContainText('section29');
      
      // Check for memory leaks (basic check)
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

    test('should handle rapid data synchronization efficiently', async ({ page }) => {
      // Measure sync performance
      const startTime = Date.now();
      
      // Perform rapid data updates
      for (let i = 0; i < 50; i++) {
        await page.evaluate((index) => {
          window.updateSection29Data({
            terrorismOrganizations: {
              hasAssociation: { value: 'YES' },
              entries: [{ organizationName: { value: `Org ${index}` } }]
            }
          });
        }, i);
      }
      
      const endTime = Date.now();
      
      // Should complete within reasonable time (2 seconds)
      expect(endTime - startTime).toBeLessThan(2000);
      
      // Final data should be correctly synced
      await expect(page.locator('[data-testid="section29-org-name"]')).toHaveValue('Org 49');
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should handle integration hook failures gracefully', async ({ page }) => {
      // Mock integration hook to fail
      await page.evaluate(() => {
        window.mockIntegrationFailure = true;
      });
      
      // Try to use integration features
      await page.click('[data-testid="section29-mark-complete"]');
      
      // Should handle failure gracefully
      await expect(page.locator('[data-testid="integration-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="section-integration-test"]')).toBeVisible();
    });

    test('should provide fallback functionality when integration unavailable', async ({ page }) => {
      // Navigate to page without SF86FormProvider
      await page.goto('/test/section-integration-no-provider');
      await page.waitForSelector('[data-testid="section29-no-integration"]', { timeout: 10000 });
      
      // Try to use integration features
      await page.click('[data-testid="section29-mark-complete-fallback"]');
      
      // Should show fallback behavior (warning message)
      await expect(page.locator('[data-testid="integration-fallback-warning"]')).toBeVisible();
      
      // Basic section functionality should still work
      await page.click('[data-testid="section29-add-organization"]');
      await expect(page.locator('[data-testid="section29-org-count"]')).toContainText('1');
    });
  });
});
