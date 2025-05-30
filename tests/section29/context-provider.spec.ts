import { test, expect } from '../fixtures/section29-fixtures';
import { SECTION29_SELECTORS } from '../fixtures/section29-fixtures';
import { ContextTestHelpers } from '../utils/context-test-helpers';

/**
 * Section29 Context Provider Tests
 * 
 * Tests specifically focused on React Context provider functionality:
 * - Provider initialization and setup
 * - Context value propagation to child components
 * - Error handling when context is used outside provider
 * - State management and immutability
 * - Performance characteristics of context operations
 */

test.describe('Section29 Context Provider', () => {
  let contextHelpers: ContextTestHelpers;

  test.beforeEach(async ({ section29Page }) => {
    contextHelpers = new ContextTestHelpers(section29Page);
    await section29Page.waitForSelector(SECTION29_SELECTORS.BASIC_FORM, { timeout: 10000 });
  });

  // ============================================================================
  // PROVIDER INITIALIZATION TESTS
  // ============================================================================

  test.describe('Provider Initialization', () => {
    test('should initialize Section29Provider correctly', async ({ section29Page }) => {
      // Test that provider initializes and provides context to child components
      await contextHelpers.testProviderInitialization();

      // Verify all expected context-dependent elements are present
      await expect(section29Page.locator(SECTION29_SELECTORS.FORM_STATUS)).toBeVisible();
      await expect(section29Page.locator(SECTION29_SELECTORS.IS_DIRTY)).toBeVisible();
      await expect(section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT)).toBeVisible();
      await expect(section29Page.locator(SECTION29_SELECTORS.VALIDATE_BUTTON)).toBeVisible();

      // Verify subsection elements are present
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS)).toBeVisible();
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ACTIVITIES)).toBeVisible();
    });

    test('should provide initial context state correctly', async ({ section29Page }) => {
      // Verify initial state values
      const isDirtyText = await section29Page.locator(SECTION29_SELECTORS.IS_DIRTY).textContent();
      expect(isDirtyText).toBe('No');

      const errorCountText = await section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT).textContent();
      expect(errorCountText).toBe('0');

      // Verify initial radio button states
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_NO)).toBeChecked();
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_YES)).not.toBeChecked();
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ACTIVITIES_NO)).toBeChecked();
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ACTIVITIES_YES)).not.toBeChecked();

      // Verify entry sections are initially hidden
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_ENTRIES)).not.toBeVisible();
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ACTIVITIES_ENTRIES)).not.toBeVisible();
    });

    test('should handle context error conditions gracefully', async ({ section29Page }) => {
      await contextHelpers.testContextErrorHandling();
      
      // Verify no JavaScript errors in console
      const consoleErrors: string[] = [];
      section29Page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Perform some context operations
      await section29Page.click(SECTION29_SELECTORS.TERRORISM_ORGS_YES);
      await section29Page.click(SECTION29_SELECTORS.ADD_TERRORISM_ORG);
      await section29Page.waitForTimeout(500);

      // Filter out unrelated errors
      const contextRelatedErrors = consoleErrors.filter(error => 
        error.includes('Section29') || 
        error.includes('useSection29') ||
        error.includes('Context')
      );

      expect(contextRelatedErrors.length).toBe(0);
    });
  });

  // ============================================================================
  // CONTEXT VALUE PROPAGATION TESTS
  // ============================================================================

  test.describe('Context Value Propagation', () => {
    test('should propagate context value updates to all consumers', async ({ section29Page }) => {
      await contextHelpers.testContextValuePropagation();

      // Additional verification of value propagation
      await section29Page.click(SECTION29_SELECTORS.TERRORISM_ORGS_YES);
      
      // Verify state change propagated to form status
      await expect(section29Page.locator(SECTION29_SELECTORS.IS_DIRTY)).toContainText('Yes');
      
      // Verify UI elements updated accordingly
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_ENTRIES)).toBeVisible();
      await expect(section29Page.locator(SECTION29_SELECTORS.ADD_TERRORISM_ORG)).toBeVisible();
    });

    test('should maintain context state across component re-renders', async ({ section29Page, section29Utils }) => {
      // Set up initial state
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Test Organization');

      // Force re-render by switching tabs
      await section29Page.click('[data-testid="advanced-test-tab"]');
      await section29Page.waitForTimeout(500);
      await section29Page.click('[data-testid="basic-test-tab"]');
      await section29Page.waitForTimeout(500);

      // Verify state persisted
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_YES)).toBeChecked();
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe('Test Organization');
    });

    test('should handle rapid context updates without race conditions', async ({ section29Page, section29Utils }) => {
      // Perform rapid updates
      for (let i = 0; i < 5; i++) {
        await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
        await section29Page.waitForTimeout(50);
        await section29Utils.setSubsectionFlag('terrorismOrganizations', 'NO');
        await section29Page.waitForTimeout(50);
      }

      // Final state should be consistent
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_NO)).toBeChecked();
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_ENTRIES)).not.toBeVisible();
    });
  });

  // ============================================================================
  // STATE MANAGEMENT TESTS
  // ============================================================================

  test.describe('State Management', () => {
    test('should maintain immutable state updates', async ({ section29Page }) => {
      await contextHelpers.testImmutableStateUpdates();

      // Additional immutability verification
      await section29Page.click(SECTION29_SELECTORS.TERRORISM_ORGS_YES);
      await section29Page.click(SECTION29_SELECTORS.ADD_TERRORISM_ORG);

      // Verify state changes are reflected in UI
      await expect(section29Page.locator(SECTION29_SELECTORS.IS_DIRTY)).toContainText('Yes');
      await expect(section29Page.locator('[data-testid="terrorism-org-entry-0"]')).toBeVisible();
    });

    test('should handle concurrent state updates correctly', async ({ section29Page, section29Utils }) => {
      // Enable both subsections simultaneously
      await Promise.all([
        section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES'),
        section29Utils.setSubsectionFlag('terrorismActivities', 'YES')
      ]);

      // Verify both updates took effect
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_YES)).toBeChecked();
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ACTIVITIES_YES)).toBeChecked();

      // Add entries to both subsections
      await Promise.all([
        section29Utils.addOrganizationEntry('terrorismOrganizations'),
        section29Utils.addActivityEntry('terrorismActivities')
      ]);

      // Verify both entries were added
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
      await section29Utils.assertEntryCount('terrorismActivities', 1);
    });

    test('should preserve state during error conditions', async ({ section29Page, section29Utils }) => {
      // Set up valid state
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.fillEntryField('terrorismOrganizations', 0, 'name', 'Valid Organization');

      // Attempt invalid operation (try to access non-existent entry)
      try {
        await section29Utils.removeEntry('terrorismOrganizations', 999);
      } catch (error) {
        // Expected to fail gracefully
      }

      // Verify original state is preserved
      expect(await section29Utils.getFieldValue('terrorism-org-name-0')).toBe('Valid Organization');
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);
    });
  });

  // ============================================================================
  // CONTEXT METHOD AVAILABILITY TESTS
  // ============================================================================

  test.describe('Context Method Availability', () => {
    test('should provide all required context methods', async ({ section29Page }) => {
      await contextHelpers.testContextMethodAvailability();

      // Verify all CRUD operations are functional
      await section29Page.click(SECTION29_SELECTORS.TERRORISM_ORGS_YES);
      await expect(section29Page.locator(SECTION29_SELECTORS.IS_DIRTY)).toContainText('Yes');

      await section29Page.click(SECTION29_SELECTORS.ADD_TERRORISM_ORG);
      await expect(section29Page.locator('[data-testid="terrorism-org-entry-0"]')).toBeVisible();

      await section29Page.fill('[data-testid="terrorism-org-name-0"]', 'Method Test Org');
      expect(await section29Page.inputValue('[data-testid="terrorism-org-name-0"]')).toBe('Method Test Org');

      await section29Page.click('[data-testid="remove-terrorism-org-0"]');
      await expect(section29Page.locator('[data-testid="terrorism-org-entry-0"]')).not.toBeVisible();
    });

    test('should provide validation methods', async ({ section29Page }) => {
      await contextHelpers.testContextValidation();

      // Test validation button functionality
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      await section29Page.waitForTimeout(500);

      // Validation should complete without errors
      await expect(section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT)).toContainText('0');
    });

    test('should provide utility methods', async ({ section29Page, section29Utils }) => {
      // Test getEntryCount method
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.assertEntryCount('terrorismOrganizations', 0);

      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.assertEntryCount('terrorismOrganizations', 1);

      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.assertEntryCount('terrorismOrganizations', 2);

      // Test isDirty tracking
      await section29Utils.assertFormIsDirty(true);
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  test.describe('Context Performance', () => {
    test('should handle multiple rapid updates efficiently', async ({ section29Page }) => {
      await contextHelpers.testContextPerformance();

      // Additional performance verification
      const startTime = Date.now();

      // Perform 20 rapid operations
      for (let i = 0; i < 20; i++) {
        await section29Page.click(SECTION29_SELECTORS.TERRORISM_ORGS_YES);
        await section29Page.waitForTimeout(25);
        await section29Page.click(SECTION29_SELECTORS.TERRORISM_ORGS_NO);
        await section29Page.waitForTimeout(25);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 5 seconds)
      expect(duration).toBeLessThan(5000);

      // Final state should be consistent
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_NO)).toBeChecked();
    });

    test('should not cause memory leaks with repeated operations', async ({ section29Page }) => {
      await contextHelpers.testMemoryLeaks();

      // Additional memory leak verification
      // Perform operations that could cause memory leaks
      for (let i = 0; i < 10; i++) {
        await section29Page.click(SECTION29_SELECTORS.TERRORISM_ORGS_YES);
        await section29Page.click(SECTION29_SELECTORS.ADD_TERRORISM_ORG);
        await section29Page.click('[data-testid="remove-terrorism-org-0"]');
        await section29Page.click(SECTION29_SELECTORS.TERRORISM_ORGS_NO);
        await section29Page.waitForTimeout(50);
      }

      // Page should remain responsive
      await expect(section29Page.locator(SECTION29_SELECTORS.BASIC_FORM)).toBeVisible();
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      await expect(section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT)).toBeVisible();
    });

    test('should optimize re-renders with useCallback', async ({ section29Page, section29Utils }) => {
      // This test verifies that context methods are properly memoized
      // by checking that rapid operations don't cause performance issues

      const startTime = Date.now();

      // Perform operations that would cause excessive re-renders if not optimized
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      
      for (let i = 0; i < 5; i++) {
        await section29Utils.addOrganizationEntry('terrorismOrganizations');
        await section29Utils.fillEntryField('terrorismOrganizations', i, 'name', `Org ${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete efficiently (less than 3 seconds for 5 entries)
      expect(duration).toBeLessThan(3000);

      // Verify all operations completed successfully
      await section29Utils.assertEntryCount('terrorismOrganizations', 5);
      for (let i = 0; i < 5; i++) {
        expect(await section29Utils.getFieldValue(`terrorism-org-name-${i}`)).toBe(`Org ${i}`);
      }
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  test.describe('Context Integration', () => {
    test('should integrate with React Router correctly', async ({ section29Page }) => {
      await contextHelpers.testRouterIntegration();

      // Additional router integration verification
      await section29Page.click(SECTION29_SELECTORS.TERRORISM_ORGS_YES);
      await expect(section29Page.locator(SECTION29_SELECTORS.IS_DIRTY)).toContainText('Yes');

      // Navigate between tabs (client-side routing)
      await section29Page.click('[data-testid="advanced-test-tab"]');
      await section29Page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

      await section29Page.click('[data-testid="basic-test-tab"]');
      await section29Page.waitForSelector(SECTION29_SELECTORS.BASIC_FORM, { timeout: 5000 });

      // Context state should persist (if using client-side routing)
      await expect(section29Page.locator(SECTION29_SELECTORS.TERRORISM_ORGS_YES)).toBeChecked();
    });

    test('should integrate with browser storage correctly', async ({ section29Page }) => {
      await contextHelpers.testStorageIntegration();

      // Additional storage integration verification
      await section29Page.click('[data-testid="integration-test-tab"]');
      await section29Page.waitForSelector('[data-testid="section29-integration"]', { timeout: 5000 });

      await section29Page.click('[data-testid="test-data-persistence-button"]');
      await section29Page.waitForTimeout(1000);

      // Verify storage operations completed successfully
      await expect(section29Page.locator('[data-testid="integration-export_test"]')).toContainText('✓');
    });

    test('should handle error boundaries correctly', async ({ section29Page }) => {
      await contextHelpers.testErrorBoundaryBehavior();

      // Verify error handling doesn't break the application
      await expect(section29Page.locator(SECTION29_SELECTORS.BASIC_FORM)).toBeVisible();
      await section29Page.click(SECTION29_SELECTORS.VALIDATE_BUTTON);
      await expect(section29Page.locator(SECTION29_SELECTORS.ERROR_COUNT)).toBeVisible();
    });
  });
});
