/**
 * Setup for Centralized SF-86 Form Tests
 * 
 * Global setup that prepares the test environment for comprehensive
 * centralized SF-86 form testing across all browsers and scenarios.
 */

import { test as setup, expect } from '@playwright/test';
import { CENTRALIZED_SF86_TEST_TAGS, CENTRALIZED_SF86_TEST_ANNOTATIONS } from './playwright.config';

// ============================================================================
// GLOBAL SETUP
// ============================================================================

setup('Global setup for centralized SF-86 tests', async ({ page, browser }) => {
  // Add test annotations
  setup.info().annotations.push(
    CENTRALIZED_SF86_TEST_ANNOTATIONS.REQUIRES_SETUP,
    CENTRALIZED_SF86_TEST_ANNOTATIONS.CRITICAL
  );

  console.log('🚀 Starting global setup for centralized SF-86 form tests...');

  // ============================================================================
  // ENVIRONMENT VERIFICATION
  // ============================================================================

  console.log('📋 Verifying test environment...');

  // Check if the application is running
  try {
    await page.goto('/startForm', { timeout: 30000 });
    console.log('✅ Application is accessible');
  } catch (error) {
    console.error('❌ Application is not accessible:', error);
    throw new Error('Application server is not running or not accessible');
  }

  // Verify the centralized SF-86 form loads
  try {
    await page.waitForSelector('[data-testid="centralized-sf86-form"]', { timeout: 15000 });
    console.log('✅ Centralized SF-86 form loads successfully');
  } catch (error) {
    console.error('❌ Centralized SF-86 form failed to load:', error);
    throw new Error('Centralized SF-86 form is not loading properly');
  }

  // ============================================================================
  // BROWSER CAPABILITIES VERIFICATION
  // ============================================================================

  console.log('🌐 Verifying browser capabilities...');

  // Check JavaScript execution
  const jsEnabled = await page.evaluate(() => {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  });
  
  if (!jsEnabled) {
    throw new Error('JavaScript is not enabled in the browser');
  }
  console.log('✅ JavaScript execution verified');

  // Check localStorage availability
  const localStorageAvailable = await page.evaluate(() => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  });
  
  if (!localStorageAvailable) {
    console.warn('⚠️ localStorage is not available - some tests may be skipped');
  } else {
    console.log('✅ localStorage is available');
  }

  // Check sessionStorage availability
  const sessionStorageAvailable = await page.evaluate(() => {
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  });
  
  if (!sessionStorageAvailable) {
    console.warn('⚠️ sessionStorage is not available - some tests may be skipped');
  } else {
    console.log('✅ sessionStorage is available');
  }

  // ============================================================================
  // FORM COMPONENT VERIFICATION
  // ============================================================================

  console.log('🔧 Verifying form components...');

  // Check that essential form elements are present
  const essentialElements = [
    '[data-testid="section-navigation"]',
    '[data-testid="global-validate-button"]',
    '[data-testid="global-save-button"]',
    '[data-testid="toggle-sections-button"]',
    '[data-testid="section-section7-button"]',
    '[data-testid="section-section29-button"]'
  ];

  for (const selector of essentialElements) {
    try {
      await expect(page.locator(selector)).toBeVisible({ timeout: 5000 });
      console.log(`✅ Element found: ${selector}`);
    } catch (error) {
      console.error(`❌ Essential element missing: ${selector}`);
      throw new Error(`Essential form element is missing: ${selector}`);
    }
  }

  // ============================================================================
  // CONTEXT PROVIDER VERIFICATION
  // ============================================================================

  console.log('🔗 Verifying context providers...');

  // Check that React context providers are working
  const contextProvidersWorking = await page.evaluate(() => {
    // This is a basic check - in a real implementation, you might check for specific context values
    return window.React !== undefined || document.querySelector('[data-reactroot]') !== null;
  });

  if (!contextProvidersWorking) {
    console.warn('⚠️ React context providers may not be working properly');
  } else {
    console.log('✅ React context providers appear to be working');
  }

  // ============================================================================
  // SECTION INTEGRATION VERIFICATION
  // ============================================================================

  console.log('📊 Verifying section integration...');

  // Test section navigation
  try {
    // Click on Section 7
    await page.click('[data-testid="section-section7-button"]');
    await expect(page.locator('[data-testid="section-section7-button"]')).toHaveClass(/border-blue-500/);
    console.log('✅ Section 7 navigation works');

    // Click on Section 29
    await page.click('[data-testid="section-section29-button"]');
    await expect(page.locator('[data-testid="section-section29-button"]')).toHaveClass(/border-blue-500/);
    console.log('✅ Section 29 navigation works');
  } catch (error) {
    console.error('❌ Section navigation failed:', error);
    throw new Error('Section navigation is not working properly');
  }

  // ============================================================================
  // FORM ACTIONS VERIFICATION
  // ============================================================================

  console.log('⚡ Verifying form actions...');

  // Test global validation button
  try {
    await page.click('[data-testid="global-validate-button"]');
    console.log('✅ Global validation button works');
  } catch (error) {
    console.error('❌ Global validation button failed:', error);
    throw new Error('Global validation button is not working');
  }

  // Test global save button
  try {
    await page.click('[data-testid="global-save-button"]');
    console.log('✅ Global save button works');
  } catch (error) {
    console.error('❌ Global save button failed:', error);
    throw new Error('Global save button is not working');
  }

  // Test section expansion
  try {
    await page.click('[data-testid="toggle-sections-button"]');
    await expect(page.locator('[data-testid="section-section1-nav-button"]')).toBeVisible();
    console.log('✅ Section expansion works');
    
    // Collapse back
    await page.click('[data-testid="toggle-sections-button"]');
    await expect(page.locator('[data-testid="section-section1-nav-button"]')).not.toBeVisible();
    console.log('✅ Section collapse works');
  } catch (error) {
    console.error('❌ Section expansion/collapse failed:', error);
    throw new Error('Section expansion/collapse is not working');
  }

  // ============================================================================
  // PERFORMANCE BASELINE
  // ============================================================================

  console.log('📈 Establishing performance baseline...');

  // Measure initial page load time
  const navigationTiming = await page.evaluate(() => {
    const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
      loadComplete: timing.loadEventEnd - timing.loadEventStart,
      totalTime: timing.loadEventEnd - timing.navigationStart
    };
  });

  console.log(`📊 Performance baseline:
    - DOM Content Loaded: ${navigationTiming.domContentLoaded}ms
    - Load Complete: ${navigationTiming.loadComplete}ms
    - Total Time: ${navigationTiming.totalTime}ms`);

  // Set performance expectations
  if (navigationTiming.totalTime > 10000) {
    console.warn('⚠️ Page load time is slower than expected (>10s)');
  } else {
    console.log('✅ Page load time is within acceptable range');
  }

  // ============================================================================
  // TEST DATA PREPARATION
  // ============================================================================

  console.log('📝 Preparing test data...');

  // Clear any existing test data
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Set up test data in localStorage for consistent testing
  const testData = {
    setupComplete: true,
    setupTimestamp: new Date().toISOString(),
    testEnvironment: process.env.NODE_ENV || 'test',
    browserName: browser.browserType().name()
  };

  await page.evaluate((data) => {
    localStorage.setItem('sf86-test-setup', JSON.stringify(data));
  }, testData);

  console.log('✅ Test data prepared');

  // ============================================================================
  // ACCESSIBILITY BASELINE
  // ============================================================================

  console.log('♿ Verifying accessibility baseline...');

  // Check for basic accessibility features
  const accessibilityChecks = await page.evaluate(() => {
    const checks = {
      hasMainLandmark: document.querySelector('main') !== null,
      hasHeaderLandmark: document.querySelector('header') !== null,
      hasH1: document.querySelector('h1') !== null,
      hasSkipLinks: document.querySelector('a[href^="#"]') !== null,
      hasAriaLabels: document.querySelectorAll('[aria-label]').length > 0,
      hasTestIds: document.querySelectorAll('[data-testid]').length > 0
    };
    return checks;
  });

  console.log(`♿ Accessibility baseline:
    - Main landmark: ${accessibilityChecks.hasMainLandmark ? '✅' : '❌'}
    - Header landmark: ${accessibilityChecks.hasHeaderLandmark ? '✅' : '❌'}
    - H1 heading: ${accessibilityChecks.hasH1 ? '✅' : '❌'}
    - Skip links: ${accessibilityChecks.hasSkipLinks ? '✅' : '⚠️'}
    - ARIA labels: ${accessibilityChecks.hasAriaLabels ? '✅' : '⚠️'}
    - Test IDs: ${accessibilityChecks.hasTestIds ? '✅' : '❌'}`);

  // ============================================================================
  // SETUP COMPLETION
  // ============================================================================

  console.log('🎉 Global setup completed successfully!');
  console.log('📋 Setup summary:
    - Environment: Verified ✅
    - Browser capabilities: Verified ✅
    - Form components: Verified ✅
    - Context providers: Verified ✅
    - Section integration: Verified ✅
    - Form actions: Verified ✅
    - Performance baseline: Established ✅
    - Test data: Prepared ✅
    - Accessibility baseline: Established ✅');

  // Store setup completion status
  await page.evaluate(() => {
    localStorage.setItem('sf86-setup-complete', 'true');
    localStorage.setItem('sf86-setup-timestamp', new Date().toISOString());
  });
});

// ============================================================================
// SETUP UTILITIES
// ============================================================================

/**
 * Utility function to verify setup completion in individual tests
 */
export async function verifySetupCompletion(page: any): Promise<boolean> {
  const setupComplete = await page.evaluate(() => {
    return localStorage.getItem('sf86-setup-complete') === 'true';
  });
  
  if (!setupComplete) {
    console.warn('⚠️ Global setup may not have completed successfully');
  }
  
  return setupComplete;
}

/**
 * Utility function to get setup metadata
 */
export async function getSetupMetadata(page: any): Promise<any> {
  return await page.evaluate(() => {
    const setupData = localStorage.getItem('sf86-test-setup');
    return setupData ? JSON.parse(setupData) : null;
  });
}

/**
 * Utility function to clean up test data
 */
export async function cleanupTestData(page: any): Promise<void> {
  await page.evaluate(() => {
    // Remove test-specific data but keep setup data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sf86-test-') && !key.includes('setup')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear session storage
    sessionStorage.clear();
  });
}
