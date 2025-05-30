import { Page, expect } from '@playwright/test';

/**
 * Context Test Helpers
 * 
 * Specialized utilities for testing React Context providers and their behavior
 * in the Section29 implementation. These helpers focus on context-specific
 * testing scenarios like provider initialization, context value propagation,
 * and error boundary testing.
 */

export class ContextTestHelpers {
  constructor(private page: Page) {}

  // ============================================================================
  // CONTEXT PROVIDER TESTING
  // ============================================================================

  /**
   * Test that Section29Provider correctly provides context to child components
   */
  async testProviderInitialization(): Promise<void> {
    // Navigate to test page
    await this.page.goto('/test');
    await this.page.waitForSelector('[data-testid="section29-test-page"]', { timeout: 10000 });

    // Check that context-dependent elements are rendered
    await expect(this.page.locator('[data-testid="form-status"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="is-dirty"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="error-count"]')).toBeVisible();

    // Verify initial context state
    const isDirtyText = await this.page.locator('[data-testid="is-dirty"]').textContent();
    expect(isDirtyText).toBe('No'); // Should start as not dirty

    const errorCountText = await this.page.locator('[data-testid="error-count"]').textContent();
    expect(errorCountText).toBe('0'); // Should start with no errors
  }

  /**
   * Test context error handling when used outside provider
   */
  async testContextErrorHandling(): Promise<void> {
    // This would require a special test route without provider
    // For now, we'll test that the provider is properly wrapping components
    await this.page.goto('/test');
    
    // Check for any console errors related to context
    const consoleErrors: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await this.page.waitForSelector('[data-testid="section29-test-page"]', { timeout: 10000 });
    
    // Verify no context-related errors
    const contextErrors = consoleErrors.filter(error => 
      error.includes('useSection29') || 
      error.includes('Section29Provider') ||
      error.includes('Context')
    );
    
    expect(contextErrors.length).toBe(0);
  }

  /**
   * Test context value updates and propagation
   */
  async testContextValuePropagation(): Promise<void> {
    await this.page.goto('/test');
    await this.page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 10000 });

    // Initial state check
    await expect(this.page.locator('[data-testid="is-dirty"]')).toContainText('No');

    // Make a change that should update context
    await this.page.click('[data-testid="terrorism-orgs-yes"]');
    
    // Verify context state updated
    await expect(this.page.locator('[data-testid="is-dirty"]')).toContainText('Yes');

    // Make another change
    await this.page.click('[data-testid="add-terrorism-org-button"]');
    await this.page.waitForTimeout(500);

    // Verify entry count updated
    await expect(this.page.locator('[data-testid="terrorism-orgs-count"]')).toContainText('Total entries: 1');
  }

  // ============================================================================
  // STATE MANAGEMENT TESTING
  // ============================================================================

  /**
   * Test immutable state updates
   */
  async testImmutableStateUpdates(): Promise<void> {
    await this.page.goto('/test');
    await this.page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 10000 });

    // Capture initial state reference
    const initialStateSnapshot = await this.page.evaluate(() => {
      // Access the context state through the window object if exposed for testing
      return JSON.stringify((window as any).__section29TestState__ || {});
    });

    // Make a state change
    await this.page.click('[data-testid="terrorism-orgs-yes"]');
    await this.page.waitForTimeout(100);

    // Capture new state reference
    const newStateSnapshot = await this.page.evaluate(() => {
      return JSON.stringify((window as any).__section29TestState__ || {});
    });

    // Verify state actually changed
    expect(initialStateSnapshot).not.toBe(newStateSnapshot);
  }

  /**
   * Test context performance with multiple rapid updates
   */
  async testContextPerformance(): Promise<void> {
    await this.page.goto('/test');
    await this.page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 10000 });

    // Enable YES to allow entry creation
    await this.page.click('[data-testid="terrorism-orgs-yes"]');
    await this.page.waitForTimeout(100);

    const startTime = Date.now();

    // Perform multiple rapid operations
    for (let i = 0; i < 5; i++) {
      await this.page.click('[data-testid="add-terrorism-org-button"]');
      await this.page.waitForTimeout(50); // Minimal wait
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Verify all entries were created
    await expect(this.page.locator('[data-testid="terrorism-orgs-count"]')).toContainText('Total entries: 5');

    // Performance should be reasonable (less than 5 seconds for 5 operations)
    expect(duration).toBeLessThan(5000);
  }

  // ============================================================================
  // CONTEXT METHOD TESTING
  // ============================================================================

  /**
   * Test all context methods are available and functional
   */
  async testContextMethodAvailability(): Promise<void> {
    await this.page.goto('/test');
    await this.page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 10000 });

    // Test updateSubsectionFlag
    await this.page.click('[data-testid="terrorism-orgs-yes"]');
    await expect(this.page.locator('[data-testid="is-dirty"]')).toContainText('Yes');

    // Test addOrganizationEntry
    await this.page.click('[data-testid="add-terrorism-org-button"]');
    await expect(this.page.locator('[data-testid="terrorism-orgs-count"]')).toContainText('Total entries: 1');

    // Test updateFieldValue
    await this.page.fill('[data-testid="terrorism-org-name-0"]', 'Test Organization');
    
    // Verify field was updated
    const fieldValue = await this.page.inputValue('[data-testid="terrorism-org-name-0"]');
    expect(fieldValue).toBe('Test Organization');

    // Test removeEntry
    await this.page.click('[data-testid="remove-terrorism-org-0"]');
    await expect(this.page.locator('[data-testid="terrorism-orgs-count"]')).toContainText('Total entries: 0');
  }

  /**
   * Test context validation methods
   */
  async testContextValidation(): Promise<void> {
    await this.page.goto('/test');
    await this.page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 10000 });

    // Test validation with no errors
    await this.page.click('[data-testid="validate-button"]');
    await this.page.waitForTimeout(500);
    
    // Should have no validation errors initially
    await expect(this.page.locator('[data-testid="error-count"]')).toContainText('0');
  }

  // ============================================================================
  // CONTEXT INTEGRATION TESTING
  // ============================================================================

  /**
   * Test context integration with React Router
   */
  async testRouterIntegration(): Promise<void> {
    // Test navigation between different test pages
    await this.page.goto('/test');
    await this.page.waitForSelector('[data-testid="section29-test-page"]', { timeout: 10000 });

    // Make some changes
    await this.page.click('[data-testid="terrorism-orgs-yes"]');
    await expect(this.page.locator('[data-testid="is-dirty"]')).toContainText('Yes');

    // Navigate to advanced tests
    await this.page.click('[data-testid="advanced-test-tab"]');
    await this.page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

    // Context state should persist across tab switches
    // (This depends on how the tabs are implemented - if they're client-side routing)
  }

  /**
   * Test context with browser storage
   */
  async testStorageIntegration(): Promise<void> {
    await this.page.goto('/test');
    await this.page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 10000 });

    // Switch to integration tab
    await this.page.click('[data-testid="integration-test-tab"]');
    await this.page.waitForSelector('[data-testid="section29-integration"]', { timeout: 5000 });

    // Test data persistence
    await this.page.click('[data-testid="test-data-persistence-button"]');
    await this.page.waitForTimeout(1000);

    // Check that persistence test passed
    await expect(this.page.locator('[data-testid="integration-export_test"]')).toContainText('✓');
    await expect(this.page.locator('[data-testid="integration-import_test"]')).toContainText('✓');
  }

  // ============================================================================
  // ERROR BOUNDARY TESTING
  // ============================================================================

  /**
   * Test context behavior under error conditions
   */
  async testErrorBoundaryBehavior(): Promise<void> {
    await this.page.goto('/test');
    await this.page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 10000 });

    // Switch to advanced features to test error conditions
    await this.page.click('[data-testid="advanced-test-tab"]');
    await this.page.waitForSelector('[data-testid="section29-advanced-features"]', { timeout: 5000 });

    // Execute error condition tests
    await this.page.click('[data-testid="test-error-conditions-button"]');
    await this.page.waitForTimeout(1000);

    // Verify error handling worked correctly
    await expect(this.page.locator('[data-testid="error-invalid_subsection"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="result-out_of_bounds_entry"]')).toContainText('true');
  }

  // ============================================================================
  // MEMORY LEAK TESTING
  // ============================================================================

  /**
   * Test for potential memory leaks in context usage
   */
  async testMemoryLeaks(): Promise<void> {
    // This is a basic test - in a real scenario you'd use more sophisticated tools
    await this.page.goto('/test');
    await this.page.waitForSelector('[data-testid="section29-test-page"]', { timeout: 10000 });

    // Perform multiple operations that could cause memory leaks
    for (let i = 0; i < 10; i++) {
      // Navigate between tabs
      await this.page.click('[data-testid="basic-test-tab"]');
      await this.page.waitForTimeout(100);
      await this.page.click('[data-testid="advanced-test-tab"]');
      await this.page.waitForTimeout(100);
      await this.page.click('[data-testid="integration-test-tab"]');
      await this.page.waitForTimeout(100);
    }

    // Check that the page is still responsive
    await this.page.click('[data-testid="basic-test-tab"]');
    await expect(this.page.locator('[data-testid="section29-basic-form"]')).toBeVisible();
  }
}
