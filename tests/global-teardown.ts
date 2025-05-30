import { FullConfig } from '@playwright/test';

/**
 * Global Teardown for Section29 Context Tests
 *
 * This teardown runs once after all tests complete and cleans up
 * the testing environment.
 */

export default async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting Section29 Context Test Suite Teardown...');

  try {
    // Log test completion statistics
    console.log('📊 Test suite completed');
    console.log(`🌐 Base URL: ${config.webServer?.url || 'http://localhost:5173'}`);
    console.log(`🎯 Test directory: ${config.testDir}`);

    // Clean up any test artifacts if needed
    console.log('🗑️ Cleaning up test artifacts...');

    // Note: Playwright automatically handles browser cleanup
    // Additional cleanup can be added here if needed

    console.log('✅ Global teardown completed successfully!');

  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw here to avoid masking test failures
  }
}
