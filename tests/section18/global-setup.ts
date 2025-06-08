/**
 * Global Setup for Section 18 Tests
 * 
 * Prepares the test environment for comprehensive Section 18 testing
 */

import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up Section 18 test environment...');

  // Create test results directory
  const testResultsDir = 'test-results/section18';
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }

  // Create console logs directory
  const consoleLogsDir = path.join(testResultsDir, 'console-logs');
  if (!fs.existsSync(consoleLogsDir)) {
    fs.mkdirSync(consoleLogsDir, { recursive: true });
  }

  // Create screenshots directory
  const screenshotsDir = path.join(testResultsDir, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Launch browser to verify application is running
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('🔍 Verifying application is accessible...');
    await page.goto('http://localhost:3000', { timeout: 30000 });
    
    // Wait for the application to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    console.log('✅ Application is accessible');

    // Check if Section 18 is available
    try {
      await page.click('[data-testid="section-18-nav"]', { timeout: 5000 });
      await page.waitForSelector('[data-testid="section-18-content"]', { timeout: 5000 });
      console.log('✅ Section 18 is accessible');
    } catch (error) {
      console.log('⚠️ Section 18 navigation may not be available yet');
    }

  } catch (error) {
    console.error('❌ Failed to verify application accessibility:', error);
    throw error;
  } finally {
    await browser.close();
  }

  // Create test summary file
  const testSummary = {
    startTime: new Date().toISOString(),
    testSuite: 'Section 18 Comprehensive Tests',
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    errors: [],
    warnings: [],
    performance: {
      totalExecutionTime: 0,
      averageTestTime: 0
    }
  };

  fs.writeFileSync(
    path.join(testResultsDir, 'test-summary.json'),
    JSON.stringify(testSummary, null, 2)
  );

  console.log('✅ Section 18 test environment setup completed');
}

export default globalSetup;
