/**
 * Cross-Section Functionality Tests
 * 
 * Comprehensive tests for cross-section coordination, dependencies, navigation,
 * and communication within the scalable SF-86 form architecture.
 */

import { test, expect } from '@playwright/test';

test.describe('Cross-Section Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the cross-section test page
    await page.goto('/test/cross-section');
    await page.waitForSelector('[data-testid="cross-section-test"]', { timeout: 10000 });
    
    // Clear any existing data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Section Navigation and Flow', () => {
    test('should navigate between sections in correct order', async ({ page }) => {
      // Start at section 7
      await page.click('[data-testid="navigate-to-section7"]');
      await expect(page.locator('[data-testid="current-section"]')).toContainText('section7');
      
      // Navigate to next section
      await page.click('[data-testid="navigate-next"]');
      await expect(page.locator('[data-testid="current-section"]')).toContainText('section8');
      
      // Navigate to previous section
      await page.click('[data-testid="navigate-previous"]');
      await expect(page.locator('[data-testid="current-section"]')).toContainText('section7');
    });

    test('should skip to next incomplete section', async ({ page }) => {
      // Mark several sections as complete
      await page.click('[data-testid="mark-section7-complete"]');
      await page.click('[data-testid="mark-section8-complete"]');
      await page.click('[data-testid="mark-section9-complete"]');
      
      // Navigate to next incomplete section
      await page.click('[data-testid="navigate-next-incomplete"]');
      
      // Should skip completed sections and go to first incomplete
      const currentSection = await page.locator('[data-testid="current-section"]').textContent();
      expect(currentSection).not.toBe('section7');
      expect(currentSection).not.toBe('section8');
      expect(currentSection).not.toBe('section9');
      expect(currentSection).toBeTruthy();
    });

    test('should handle section completion workflow', async ({ page }) => {
      // Navigate to section29
      await page.click('[data-testid="navigate-to-section29"]');
      
      // Fill out required data
      await page.click('[data-testid="section29-terrorism-no"]');
      await page.click('[data-testid="section29-activities-no"]');
      await page.click('[data-testid="section29-overthrow-no"]');
      await page.click('[data-testid="section29-violence-no"]');
      await page.click('[data-testid="section29-other-no"]');
      
      // Complete section and navigate to next
      await page.click('[data-testid="complete-and-continue"]');
      
      // Should mark section29 as complete and navigate to section30
      await expect(page.locator('[data-testid="completed-sections"]')).toContainText('section29');
      await expect(page.locator('[data-testid="current-section"]')).toContainText('section30');
    });

    test('should prevent navigation to sections with unmet dependencies', async ({ page }) => {
      // Try to navigate to a section that depends on incomplete sections
      await page.click('[data-testid="navigate-to-dependent-section"]');
      
      // Should show dependency warning
      await expect(page.locator('[data-testid="dependency-warning"]')).toBeVisible();
      await expect(page.locator('[data-testid="dependency-warning"]')).toContainText('complete required sections');
      
      // Should not navigate to the dependent section
      const currentSection = await page.locator('[data-testid="current-section"]').textContent();
      expect(currentSection).not.toBe('dependent-section');
    });
  });

  test.describe('Cross-Section Data Dependencies', () => {
    test('should propagate data changes to dependent sections', async ({ page }) => {
      // Set up dependency: Section 29 terrorism flag affects Section 30
      await page.click('[data-testid="navigate-to-section29"]');
      await page.click('[data-testid="section29-terrorism-yes"]');
      
      // Navigate to dependent section
      await page.click('[data-testid="navigate-to-section30"]');
      
      // Should show additional fields based on Section 29 data
      await expect(page.locator('[data-testid="section30-terrorism-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="section30-additional-screening"]')).toBeVisible();
    });

    test('should update dependent sections when source data changes', async ({ page }) => {
      // Initially set terrorism flag to YES
      await page.click('[data-testid="navigate-to-section29"]');
      await page.click('[data-testid="section29-terrorism-yes"]');
      
      // Navigate to dependent section and verify additional fields
      await page.click('[data-testid="navigate-to-section30"]');
      await expect(page.locator('[data-testid="section30-terrorism-details"]')).toBeVisible();
      
      // Go back and change terrorism flag to NO
      await page.click('[data-testid="navigate-to-section29"]');
      await page.click('[data-testid="section29-terrorism-no"]');
      
      // Return to dependent section
      await page.click('[data-testid="navigate-to-section30"]');
      
      // Additional fields should now be hidden
      await expect(page.locator('[data-testid="section30-terrorism-details"]')).not.toBeVisible();
    });

    test('should validate cross-section data consistency', async ({ page }) => {
      // Set conflicting data across sections
      await page.click('[data-testid="set-conflicting-employment-data"]');
      
      // Trigger cross-section validation
      await page.click('[data-testid="validate-cross-section-consistency"]');
      
      // Should detect and report conflicts
      const validationResult = await page.locator('[data-testid="cross-section-validation"]').textContent();
      const result = JSON.parse(validationResult || '{}');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'CROSS_SECTION_CONFLICT',
          message: expect.stringContaining('employment dates')
        })
      );
    });

    test('should resolve dependencies automatically when possible', async ({ page }) => {
      // Set up a dependency chain
      await page.click('[data-testid="setup-dependency-chain"]');
      
      // Complete the root section
      await page.click('[data-testid="complete-root-section"]');
      
      // Should automatically resolve dependent sections
      await expect(page.locator('[data-testid="dependency-resolution-status"]')).toContainText('resolved');
      
      // Dependent sections should now be accessible
      await page.click('[data-testid="navigate-to-dependent-section"]');
      await expect(page.locator('[data-testid="current-section"]')).toContainText('dependent-section');
    });
  });

  test.describe('Event-Driven Cross-Section Communication', () => {
    test('should broadcast events to all interested sections', async ({ page }) => {
      // Set up event listeners in multiple sections
      await page.click('[data-testid="setup-multi-section-listeners"]');
      
      // Emit event from section29
      await page.click('[data-testid="section29-emit-background-check-event"]');
      
      // Check that multiple sections received the event
      await expect(page.locator('[data-testid="section7-received-events"]')).toContainText('background_check_required');
      await expect(page.locator('[data-testid="section13-received-events"]')).toContainText('background_check_required');
      await expect(page.locator('[data-testid="section15-received-events"]')).toContainText('background_check_required');
    });

    test('should handle event cascades without infinite loops', async ({ page }) => {
      // Set up event cascade: Section A -> Section B -> Section C
      await page.click('[data-testid="setup-event-cascade"]');
      
      // Monitor event count
      await page.evaluate(() => {
        window.eventCascadeCount = 0;
        window.addEventListener('section-cascade-event', () => {
          window.eventCascadeCount++;
        });
      });
      
      // Trigger initial event
      await page.click('[data-testid="trigger-cascade-event"]');
      
      // Wait for cascade to complete
      await page.waitForTimeout(1000);
      
      // Check that cascade completed without infinite loop
      const eventCount = await page.evaluate(() => window.eventCascadeCount);
      expect(eventCount).toBeGreaterThan(0);
      expect(eventCount).toBeLessThan(10); // Should not spiral out of control
    });

    test('should filter events by section relevance', async ({ page }) => {
      // Set up section-specific event filters
      await page.click('[data-testid="setup-event-filters"]');
      
      // Emit employment-related event
      await page.click('[data-testid="emit-employment-event"]');
      
      // Only employment-related sections should receive it
      await expect(page.locator('[data-testid="section13-employment-events"]')).toContainText('employment_update');
      await expect(page.locator('[data-testid="section14-employment-events"]')).toContainText('employment_update');
      
      // Non-employment sections should not receive it
      const section7Events = await page.locator('[data-testid="section7-employment-events"]').textContent();
      expect(section7Events).toBe('');
    });

    test('should handle event subscription cleanup on section unmount', async ({ page }) => {
      // Mount section with event subscription
      await page.click('[data-testid="mount-temporary-section"]');
      await page.click('[data-testid="setup-temporary-event-listener"]');
      
      // Verify subscription is active
      await page.click('[data-testid="emit-test-event"]');
      await expect(page.locator('[data-testid="temporary-section-events"]')).toContainText('test_event');
      
      // Unmount section
      await page.click('[data-testid="unmount-temporary-section"]');
      
      // Emit event again
      await page.click('[data-testid="emit-test-event"]');
      
      // Check that no memory leaks or errors occurred
      const consoleErrors = await page.evaluate(() => {
        return window.consoleErrors || [];
      });
      
      expect(consoleErrors.filter(error => error.includes('subscription'))).toHaveLength(0);
    });
  });

  test.describe('Global Form State Coordination', () => {
    test('should maintain consistent global state across sections', async ({ page }) => {
      // Update data in multiple sections
      await page.click('[data-testid="update-section7-data"]');
      await page.click('[data-testid="update-section13-data"]');
      await page.click('[data-testid="update-section29-data"]');
      
      // Check global state from any section
      await page.click('[data-testid="get-global-state-from-section7"]');
      
      const globalState = await page.locator('[data-testid="section7-global-state"]').textContent();
      const state = JSON.parse(globalState || '{}');
      
      expect(state.formData).toHaveProperty('section7');
      expect(state.formData).toHaveProperty('section13');
      expect(state.formData).toHaveProperty('section29');
      expect(state.isDirty).toBe(true);
    });

    test('should coordinate validation across all sections', async ({ page }) => {
      // Add invalid data to multiple sections
      await page.click('[data-testid="add-invalid-data-section7"]');
      await page.click('[data-testid="add-invalid-data-section13"]');
      await page.click('[data-testid="add-invalid-data-section29"]');
      
      // Trigger global validation from any section
      await page.click('[data-testid="section7-trigger-global-validation"]');
      
      // Should collect errors from all sections
      const validationResult = await page.locator('[data-testid="global-validation-result"]').textContent();
      const result = JSON.parse(validationResult || '{}');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({ field: expect.stringContaining('section7') }));
      expect(result.errors).toContainEqual(expect.objectContaining({ field: expect.stringContaining('section13') }));
      expect(result.errors).toContainEqual(expect.objectContaining({ field: expect.stringContaining('section29') }));
    });

    test('should coordinate auto-save across all sections', async ({ page }) => {
      // Enable auto-save
      await page.click('[data-testid="enable-auto-save"]');
      
      // Make changes in multiple sections rapidly
      await page.click('[data-testid="rapid-changes-multiple-sections"]');
      
      // Wait for auto-save debounce
      await page.waitForTimeout(6000);
      
      // Check that all changes were saved
      const savedData = await page.evaluate(() => {
        return localStorage.getItem('sf86-form-data');
      });
      
      expect(savedData).toBeTruthy();
      const parsedData = JSON.parse(savedData || '{}');
      expect(parsedData).toHaveProperty('section7');
      expect(parsedData).toHaveProperty('section13');
      expect(parsedData).toHaveProperty('section29');
    });

    test('should handle section completion tracking globally', async ({ page }) => {
      // Complete sections in various orders
      await page.click('[data-testid="complete-section29"]');
      await page.click('[data-testid="complete-section7"]');
      await page.click('[data-testid="complete-section13"]');
      
      // Check global completion status
      const completedSections = await page.locator('[data-testid="global-completed-sections"]').textContent();
      const completed = JSON.parse(completedSections || '[]');
      
      expect(completed).toContain('section7');
      expect(completed).toContain('section13');
      expect(completed).toContain('section29');
      
      // Check completion percentage
      const completionPercentage = await page.locator('[data-testid="completion-percentage"]').textContent();
      expect(parseInt(completionPercentage || '0')).toBeGreaterThan(0);
    });
  });

  test.describe('Performance and Scalability', () => {
    test('should handle multiple sections efficiently', async ({ page }) => {
      // Load all 30 sections
      await page.click('[data-testid="load-all-sections"]');
      
      // Measure loading time
      const startTime = Date.now();
      await page.waitForSelector('[data-testid="all-sections-loaded"]', { timeout: 10000 });
      const endTime = Date.now();
      
      // Should load within reasonable time (5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
      
      // All sections should be responsive
      await page.click('[data-testid="test-all-sections-responsive"]');
      await expect(page.locator('[data-testid="all-sections-responsive"]')).toContainText('true');
    });

    test('should handle rapid cross-section updates efficiently', async ({ page }) => {
      // Perform rapid updates across multiple sections
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        await page.evaluate((index) => {
          // Simulate rapid updates across sections
          window.updateMultipleSections(index);
        }, i);
        
        if (i % 20 === 0) {
          await page.waitForTimeout(10); // Small delay every 20 operations
        }
      }
      
      const endTime = Date.now();
      
      // Should complete within reasonable time (3 seconds)
      expect(endTime - startTime).toBeLessThan(3000);
      
      // Final state should be consistent
      await expect(page.locator('[data-testid="cross-section-consistency"]')).toContainText('consistent');
    });

    test('should manage memory efficiently with many sections', async ({ page }) => {
      // Load all sections and perform operations
      await page.click('[data-testid="load-all-sections"]');
      await page.click('[data-testid="perform-memory-intensive-operations"]');
      
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
      
      // Should not have memory leaks
      const memoryLeakCheck = await page.evaluate(() => {
        return window.checkMemoryLeaks ? window.checkMemoryLeaks() : { hasLeaks: false };
      });
      
      expect(memoryLeakCheck.hasLeaks).toBe(false);
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should handle section communication failures gracefully', async ({ page }) => {
      // Mock communication failure
      await page.evaluate(() => {
        window.mockCommunicationFailure = true;
      });
      
      // Try cross-section operation
      await page.click('[data-testid="attempt-cross-section-operation"]');
      
      // Should handle failure gracefully
      await expect(page.locator('[data-testid="communication-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="cross-section-test"]')).toBeVisible();
      
      // Other sections should still function
      await page.click('[data-testid="test-individual-section-function"]');
      await expect(page.locator('[data-testid="individual-section-working"]')).toContainText('true');
    });

    test('should recover from corrupted cross-section state', async ({ page }) => {
      // Corrupt cross-section state
      await page.evaluate(() => {
        window.corruptCrossSectionState();
      });
      
      // Trigger recovery
      await page.click('[data-testid="trigger-state-recovery"]');
      
      // Should recover to consistent state
      await expect(page.locator('[data-testid="state-recovery-status"]')).toContainText('recovered');
      
      // Cross-section functionality should work again
      await page.click('[data-testid="test-cross-section-functionality"]');
      await expect(page.locator('[data-testid="cross-section-functional"]')).toContainText('true');
    });

    test('should handle section dependency resolution failures', async ({ page }) => {
      // Set up failing dependency
      await page.click('[data-testid="setup-failing-dependency"]');
      
      // Try to resolve dependencies
      await page.click('[data-testid="resolve-dependencies"]');
      
      // Should handle failure gracefully
      await expect(page.locator('[data-testid="dependency-resolution-error"]')).toBeVisible();
      
      // Should provide fallback behavior
      await expect(page.locator('[data-testid="dependency-fallback"]')).toBeVisible();
    });
  });
});
