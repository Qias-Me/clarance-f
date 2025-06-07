#!/usr/bin/env node

/**
 * Section 20 Comprehensive Test Runner
 * 
 * Executes all 790 field tests for Section 20 (Foreign Activities)
 * with comprehensive reporting and analysis
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Section 20 Comprehensive Test Suite');
console.log('=====================================');
console.log('Testing all 790 fields in Section 20 (Foreign Activities)');
console.log('');

// Configuration
const config = {
  testDir: './tests',
  outputDir: './test-results',
  browsers: ['chromium', 'firefox', 'webkit'],
  parallel: true,
  retries: 2,
  timeout: 60000,
  headless: true
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  browser: args.includes('--browser') ? args[args.indexOf('--browser') + 1] : 'all',
  headed: args.includes('--headed'),
  debug: args.includes('--debug'),
  quick: args.includes('--quick'),
  report: args.includes('--report-only'),
  clean: args.includes('--clean')
};

// Clean previous results if requested
if (options.clean) {
  console.log('🧹 Cleaning previous test results...');
  if (fs.existsSync(config.outputDir)) {
    fs.rmSync(config.outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Validate environment
function validateEnvironment() {
  console.log('🔍 Validating test environment...');
  
  // Check if Playwright is installed
  try {
    execSync('npx playwright --version', { stdio: 'pipe' });
    console.log('✅ Playwright is installed');
  } catch (error) {
    console.error('❌ Playwright not found. Please install with: npm install @playwright/test');
    process.exit(1);
  }
  
  // Check if Section 20 data file exists
  const section20DataPath = 'api/sections-references/section-20.json';
  if (!fs.existsSync(section20DataPath)) {
    console.error(`❌ Section 20 data file not found: ${section20DataPath}`);
    process.exit(1);
  }
  
  // Load and validate Section 20 data
  try {
    const section20Data = JSON.parse(fs.readFileSync(section20DataPath, 'utf8'));
    if (section20Data.metadata.totalFields !== 790) {
      console.warn(`⚠️ Warning: Expected 790 fields, found ${section20Data.metadata.totalFields}`);
    }
    console.log(`✅ Section 20 data validated (${section20Data.metadata.totalFields} fields)`);
  } catch (error) {
    console.error('❌ Invalid Section 20 data file:', error.message);
    process.exit(1);
  }
  
  // Check test files exist
  const testFiles = [
    'tests/section20-comprehensive.spec.ts',
    'tests/section20-field-types.spec.ts',
    'tests/section20-edge-cases.spec.ts'
  ];
  
  for (const testFile of testFiles) {
    if (!fs.existsSync(testFile)) {
      console.error(`❌ Test file not found: ${testFile}`);
      process.exit(1);
    }
  }
  
  console.log('✅ All test files found');
  console.log('');
}

// Build Playwright command
function buildPlaywrightCommand() {
  let command = 'npx playwright test';
  
  // Add test files
  command += ' tests/section20-*.spec.ts';
  
  // Add browser selection
  if (options.browser !== 'all') {
    command += ` --project=${options.browser}`;
  }
  
  // Add headed mode
  if (options.headed) {
    command += ' --headed';
  }
  
  // Add debug mode
  if (options.debug) {
    command += ' --debug';
  }
  
  // Add quick mode (fewer retries, single browser)
  if (options.quick) {
    command += ' --project=chromium --retries=0';
  }
  
  // Add output directory
  command += ` --output=${config.outputDir}`;
  
  // Add reporter
  command += ' --reporter=html,json,list';
  
  return command;
}

// Execute tests
async function runTests() {
  if (options.report) {
    console.log('📊 Generating report from existing results...');
    generateReport();
    return;
  }
  
  console.log('🧪 Starting Section 20 comprehensive tests...');
  console.log(`📋 Test configuration:`);
  console.log(`   - Browser: ${options.browser}`);
  console.log(`   - Headed: ${options.headed}`);
  console.log(`   - Debug: ${options.debug}`);
  console.log(`   - Quick: ${options.quick}`);
  console.log('');
  
  const command = buildPlaywrightCommand();
  console.log(`🔧 Command: ${command}`);
  console.log('');
  
  const startTime = Date.now();
  
  try {
    // Execute Playwright tests
    execSync(command, { 
      stdio: 'inherit',
      env: { 
        ...process.env,
        CI: 'true' // Enable CI mode for better reporting
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('');
    console.log('✅ Tests completed successfully!');
    console.log(`⏱️ Total duration: ${Math.round(duration / 1000)}s`);
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('');
    console.log('❌ Tests completed with failures');
    console.log(`⏱️ Total duration: ${Math.round(duration / 1000)}s`);
    console.log('');
    console.log('📊 Check the test report for detailed results');
  }
  
  // Generate additional reports
  generateReport();
}

// Generate comprehensive report
function generateReport() {
  console.log('📊 Generating comprehensive test report...');
  
  try {
    // Check for test results
    const resultsFile = path.join(config.outputDir, 'results.json');
    if (!fs.existsSync(resultsFile)) {
      console.log('⚠️ No test results found. Run tests first.');
      return;
    }
    
    // Load test results
    const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    
    // Generate summary
    const summary = {
      totalTests: results.stats?.total || 0,
      passed: results.stats?.passed || 0,
      failed: results.stats?.failed || 0,
      skipped: results.stats?.skipped || 0,
      duration: results.stats?.duration || 0
    };
    
    summary.passRate = summary.totalTests > 0 ? 
      Math.round((summary.passed / summary.totalTests) * 100) : 0;
    
    console.log('');
    console.log('📈 Test Summary:');
    console.log(`   Total Tests: ${summary.totalTests}`);
    console.log(`   Passed: ${summary.passed}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Skipped: ${summary.skipped}`);
    console.log(`   Pass Rate: ${summary.passRate}%`);
    console.log(`   Duration: ${Math.round(summary.duration / 1000)}s`);
    
    // Save summary
    fs.writeFileSync(
      path.join(config.outputDir, 'summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log('');
    console.log('📁 Reports generated:');
    console.log(`   - HTML Report: ${path.join(config.outputDir, 'index.html')}`);
    console.log(`   - JSON Results: ${path.join(config.outputDir, 'results.json')}`);
    console.log(`   - Summary: ${path.join(config.outputDir, 'summary.json')}`);
    
  } catch (error) {
    console.error('❌ Error generating report:', error.message);
  }
}

// Print usage information
function printUsage() {
  console.log('Usage: node run-section20-tests.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --browser <name>    Run tests on specific browser (chromium, firefox, webkit)');
  console.log('  --headed           Run tests in headed mode (visible browser)');
  console.log('  --debug            Run tests in debug mode');
  console.log('  --quick            Quick test run (single browser, no retries)');
  console.log('  --report-only      Generate report from existing results');
  console.log('  --clean            Clean previous test results');
  console.log('  --help             Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node run-section20-tests.js                    # Run all tests');
  console.log('  node run-section20-tests.js --browser chromium # Run on Chrome only');
  console.log('  node run-section20-tests.js --headed           # Run with visible browser');
  console.log('  node run-section20-tests.js --quick            # Quick test run');
  console.log('  node run-section20-tests.js --report-only      # Generate report only');
}

// Main execution
async function main() {
  if (args.includes('--help')) {
    printUsage();
    return;
  }
  
  validateEnvironment();
  await runTests();
  
  console.log('');
  console.log('🎉 Section 20 comprehensive testing complete!');
  console.log('');
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
  process.exit(1);
});

// Run the test suite
main().catch((error) => {
  console.error('❌ Test execution failed:', error.message);
  process.exit(1);
});
