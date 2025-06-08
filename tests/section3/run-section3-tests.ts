#!/usr/bin/env node

/**
 * Section 3 Test Runner
 * 
 * Automated test runner for Section 3 (Place of Birth) tests with enhanced
 * reporting and error handling.
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  testDir: 'tests/section3',
  configFile: 'tests/section3/playwright.config.ts',
  resultsDir: 'test-results/section3-artifacts',
  baseUrl: 'http://localhost:5173',
  timeout: 60000,
  retries: 2
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message: string) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`${message}`, colors.bright + colors.cyan);
  log(`${'='.repeat(60)}`, colors.cyan);
}

function logStep(step: string) {
  log(`\n🔄 ${step}`, colors.blue);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function checkPrerequisites(): Promise<boolean> {
  logStep('Checking prerequisites...');
  
  try {
    // Check if Playwright is installed
    execSync('npx playwright --version', { stdio: 'pipe' });
    logSuccess('Playwright is installed');
    
    // Check if test directory exists
    if (!existsSync(CONFIG.testDir)) {
      logError(`Test directory not found: ${CONFIG.testDir}`);
      return false;
    }
    logSuccess('Test directory found');
    
    // Check if config file exists
    if (!existsSync(CONFIG.configFile)) {
      logError(`Config file not found: ${CONFIG.configFile}`);
      return false;
    }
    logSuccess('Config file found');
    
    // Create results directory if it doesn't exist
    if (!existsSync(CONFIG.resultsDir)) {
      mkdirSync(CONFIG.resultsDir, { recursive: true });
      logSuccess('Created results directory');
    }
    
    return true;
  } catch (error) {
    logError(`Prerequisites check failed: ${error}`);
    return false;
  }
}

async function checkServerAvailability(): Promise<boolean> {
  logStep('Checking server availability...');
  
  try {
    const response = await fetch(CONFIG.baseUrl);
    if (response.ok) {
      logSuccess(`Server is running at ${CONFIG.baseUrl}`);
      return true;
    } else {
      logWarning(`Server responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Server is not available at ${CONFIG.baseUrl}`);
    logError('Please start the development server with: npm run dev');
    return false;
  }
}

function runTests(testFile?: string): boolean {
  logStep('Running Section 3 tests...');
  
  try {
    const testPath = testFile ? path.join(CONFIG.testDir, testFile) : CONFIG.testDir;
    const command = `npx playwright test ${testPath} --config=${CONFIG.configFile}`;
    
    log(`Command: ${command}`, colors.cyan);
    
    execSync(command, { 
      stdio: 'inherit',
      timeout: CONFIG.timeout * 1000 
    });
    
    logSuccess('All tests completed successfully!');
    return true;
  } catch (error) {
    logError('Some tests failed. Check the output above for details.');
    return false;
  }
}

function generateReport(): void {
  logStep('Generating test report...');
  
  try {
    const reportCommand = `npx playwright show-report test-results/section3-html-report`;
    log(`Opening report with: ${reportCommand}`, colors.cyan);
    
    // Note: This will open the report in the default browser
    execSync(reportCommand, { stdio: 'inherit' });
    
    logSuccess('Test report opened in browser');
  } catch (error) {
    logWarning('Could not open test report automatically');
    log('You can manually open: test-results/section3-html-report/index.html', colors.yellow);
  }
}

async function main() {
  logHeader('Section 3 (Place of Birth) Test Runner');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const testFile = args.find(arg => arg.endsWith('.test.ts'));
  const shouldOpenReport = args.includes('--report');
  const skipServerCheck = args.includes('--skip-server-check');
  
  try {
    // Check prerequisites
    const prerequisitesOk = await checkPrerequisites();
    if (!prerequisitesOk) {
      process.exit(1);
    }
    
    // Check server availability (unless skipped)
    if (!skipServerCheck) {
      const serverOk = await checkServerAvailability();
      if (!serverOk) {
        logWarning('Server check failed. Use --skip-server-check to bypass this check.');
        process.exit(1);
      }
    }
    
    // Run tests
    const testsOk = runTests(testFile);
    
    // Generate report if requested
    if (shouldOpenReport) {
      generateReport();
    }
    
    // Final status
    if (testsOk) {
      logHeader('🎉 Section 3 Tests Completed Successfully!');
      log('All Section 3 place of birth functionality is working correctly.', colors.green);
    } else {
      logHeader('❌ Section 3 Tests Failed');
      log('Some tests failed. Please review the output and fix any issues.', colors.red);
      process.exit(1);
    }
    
  } catch (error) {
    logError(`Test runner failed: ${error}`);
    process.exit(1);
  }
}

// Usage information
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  logHeader('Section 3 Test Runner - Usage');
  log('npm run test:section3                    # Run all Section 3 tests');
  log('npm run test:section3 -- --report       # Run tests and open report');
  log('npm run test:section3 -- specific.test.ts # Run specific test file');
  log('npm run test:section3 -- --skip-server-check # Skip server availability check');
  log('npm run test:section3 -- --help         # Show this help');
  process.exit(0);
}

// Run the main function
main().catch(error => {
  logError(`Unexpected error: ${error}`);
  process.exit(1);
});
