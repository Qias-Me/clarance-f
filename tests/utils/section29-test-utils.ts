import { Page, Locator, expect } from '@playwright/test';

/**
 * Section29 Test Utilities
 * 
 * Comprehensive utility functions for testing Section29 Context implementation
 * with Playwright. These utilities provide reusable methods for common testing
 * operations specific to Section29 functionality.
 */

export class Section29TestUtils {
  constructor(private page: Page) {}

  // ============================================================================
  // NAVIGATION UTILITIES
  // ============================================================================

  /**
   * Navigate to the basic test page and wait for it to load
   */
  async navigateToBasicTests(): Promise<void> {
    await this.page.goto('/test');
    await this.page.waitForSelector('[data-testid="section29-test-page"]', { timeout: 10000 });
    await this.page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 5000 });
  }

  /**
   * Navigate to the advanced test page and wait for it to load
   */
  async navigateToAdvancedTests(): Promise<void> {
    await this.page.goto('/test');
    await this.page.waitForSelector('[data-testid="advanced-test-navigation"]', { timeout: 10000 });
  }

  /**
   * Switch to a specific test tab (basic, advanced, integration)
   */
  async switchToTestTab(tab: 'basic' | 'advanced' | 'integration'): Promise<void> {
    if (tab === 'basic') {
      await this.navigateToBasicTests();
      await this.page.click('[data-testid="basic-test-tab"]');
    } else {
      await this.navigateToAdvancedTests();
      const tabSelector = tab === 'advanced' ? 'advanced-features-tab' : 
                         tab === 'integration' ? 'integration-tab' : 'field-id-tab';
      await this.page.click(`[data-testid="${tabSelector}"]`);
    }
    await this.page.waitForTimeout(500); // Allow tab switch to complete
  }

  // ============================================================================
  // FORM INTERACTION UTILITIES
  // ============================================================================

  /**
   * Set a subsection flag (YES/NO radio button)
   */
  async setSubsectionFlag(subsection: string, value: 'YES' | 'NO'): Promise<void> {
    const radioSelector = `[data-testid="${subsection}-${value.toLowerCase()}"]`;
    await this.page.click(radioSelector);
    await this.page.waitForTimeout(100); // Allow state update
  }

  /**
   * Add an organization entry to a subsection
   */
  async addOrganizationEntry(subsection: string): Promise<void> {
    const buttonSelector = `[data-testid="add-${subsection.replace('Organizations', '-org')}-button"]`;
    await this.page.click(buttonSelector);
    await this.page.waitForTimeout(500); // Allow entry to be added
  }

  /**
   * Add an activity entry to a subsection
   */
  async addActivityEntry(subsection: string): Promise<void> {
    const buttonSelector = `[data-testid="add-${subsection.replace('Activities', '-activity')}-button"]`;
    await this.page.click(buttonSelector);
    await this.page.waitForTimeout(500); // Allow entry to be added
  }

  /**
   * Fill a field in an entry
   */
  async fillEntryField(subsection: string, entryIndex: number, fieldType: string, value: string): Promise<void> {
    const fieldSelector = `[data-testid="${subsection.replace('Organizations', '-org').replace('Activities', '-activity')}-${fieldType}-${entryIndex}"]`;
    await this.page.fill(fieldSelector, value);
  }

  /**
   * Remove an entry from a subsection
   */
  async removeEntry(subsection: string, entryIndex: number): Promise<void> {
    const buttonSelector = `[data-testid="remove-${subsection.replace('Organizations', '-org').replace('Activities', '-activity')}-${entryIndex}"]`;
    await this.page.click(buttonSelector);
    await this.page.waitForTimeout(500); // Allow entry to be removed
  }

  // ============================================================================
  // ASSERTION UTILITIES
  // ============================================================================

  /**
   * Assert that a test result shows as passed
   */
  async assertTestResultPassed(testKey: string): Promise<void> {
    const resultSelector = `[data-testid="result-${testKey}"]`;
    await expect(this.page.locator(resultSelector)).toContainText('✓');
  }

  /**
   * Assert that a test result shows as failed
   */
  async assertTestResultFailed(testKey: string): Promise<void> {
    const resultSelector = `[data-testid="result-${testKey}"]`;
    await expect(this.page.locator(resultSelector)).toContainText('✗');
  }

  /**
   * Assert the current entry count for a subsection
   */
  async assertEntryCount(subsection: string, expectedCount: number): Promise<void> {
    const countSelector = `[data-testid="${subsection.replace('Organizations', '-orgs').replace('Activities', '-activities')}-count"]`;
    await expect(this.page.locator(countSelector)).toContainText(`Total entries: ${expectedCount}`);
  }

  /**
   * Assert that the form is dirty (has changes)
   */
  async assertFormIsDirty(isDirty: boolean = true): Promise<void> {
    const dirtySelector = '[data-testid="is-dirty"]';
    await expect(this.page.locator(dirtySelector)).toContainText(isDirty ? 'Yes' : 'No');
  }

  /**
   * Assert field ID pattern matches expected PDF pattern
   */
  async assertFieldIdPattern(testKey: string, shouldPass: boolean = true): Promise<void> {
    const resultSelector = `[data-testid="field-id-${testKey}"]`;
    const expectedText = shouldPass ? '✓ PASS' : '✗ FAIL';
    await expect(this.page.locator(resultSelector)).toContainText(expectedText);
  }

  // ============================================================================
  // ADVANCED FEATURE UTILITIES
  // ============================================================================

  /**
   * Execute advanced feature tests
   */
  async executeAdvancedFeatureTests(): Promise<void> {
    await this.page.click('[data-testid="test-advanced-features-button"]');
    await this.page.waitForTimeout(1000); // Allow tests to complete
  }

  /**
   * Execute error condition tests
   */
  async executeErrorConditionTests(): Promise<void> {
    await this.page.click('[data-testid="test-error-conditions-button"]');
    await this.page.waitForTimeout(1000); // Allow tests to complete
  }

  /**
   * Execute field ID validation tests
   */
  async executeFieldIdValidationTests(): Promise<void> {
    await this.page.click('[data-testid="validate-field-ids-button"]');
    await this.page.waitForTimeout(1000); // Allow tests to complete
  }

  /**
   * Execute data persistence tests
   */
  async executeDataPersistenceTests(): Promise<void> {
    await this.page.click('[data-testid="test-data-persistence-button"]');
    await this.page.waitForTimeout(1000); // Allow tests to complete
  }

  /**
   * Execute form reset test
   */
  async executeFormResetTest(): Promise<void> {
    await this.page.click('[data-testid="test-form-reset-button"]');
    await this.page.waitForTimeout(1000); // Allow reset to complete
  }

  // ============================================================================
  // DATA EXTRACTION UTILITIES
  // ============================================================================

  /**
   * Get the current value of a field by its data-testid
   */
  async getFieldValue(testId: string): Promise<string> {
    const element = this.page.locator(`[data-testid="${testId}"]`);
    return await element.inputValue();
  }

  /**
   * Get the current text content of an element
   */
  async getElementText(testId: string): Promise<string> {
    const element = this.page.locator(`[data-testid="${testId}"]`);
    return await element.textContent() || '';
  }

  /**
   * Get field ID from data-field-id attribute
   */
  async getFieldId(testId: string): Promise<string> {
    const element = this.page.locator(`[data-testid="${testId}"]`);
    return await element.getAttribute('data-field-id') || '';
  }

  /**
   * Check if an element is visible
   */
  async isElementVisible(testId: string): Promise<boolean> {
    const element = this.page.locator(`[data-testid="${testId}"]`);
    return await element.isVisible();
  }

  /**
   * Check if a checkbox is checked
   */
  async isCheckboxChecked(testId: string): Promise<boolean> {
    const element = this.page.locator(`[data-testid="${testId}"]`);
    return await element.isChecked();
  }

  // ============================================================================
  // VALIDATION UTILITIES
  // ============================================================================

  /**
   * Validate that all required elements are present on the page
   */
  async validatePageElements(requiredElements: string[]): Promise<void> {
    for (const elementId of requiredElements) {
      await expect(this.page.locator(`[data-testid="${elementId}"]`)).toBeVisible();
    }
  }

  /**
   * Validate form state consistency
   */
  async validateFormStateConsistency(): Promise<void> {
    // Check that form status elements are present
    await expect(this.page.locator('[data-testid="form-status"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="is-dirty"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="error-count"]')).toBeVisible();
  }

  /**
   * Wait for test results to be populated
   */
  async waitForTestResults(timeout: number = 5000): Promise<void> {
    await this.page.waitForFunction(
      () => {
        const results = document.querySelectorAll('[data-testid^="result-"]');
        return results.length > 0;
      },
      { timeout }
    );
  }

  // ============================================================================
  // CLEANUP UTILITIES
  // ============================================================================

  /**
   * Clear all form data and reset to initial state
   */
  async clearFormData(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await this.page.reload();
    await this.page.waitForSelector('[data-testid="section29-test-page"]', { timeout: 10000 });
  }
}
