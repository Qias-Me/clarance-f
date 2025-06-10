#!/usr/bin/env node

/**
 * Section 10 Test Runner
 * 
 * Runs comprehensive tests for Section 10: Dual/Multiple Citizenship & Foreign Passport
 * - All 122 fields testing
 * - Field mapping verification
 * - Console error monitoring
 * - PDF generation testing
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const SECTION10_DIR = path.resolve(__dirname);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

console.log('🧪 Section 10 Test Runner');
console.log('='.repeat(50));
console.log(`📁 Test Directory: ${SECTION10_DIR}`);
console.log(`📁 Project Root: ${PROJECT_ROOT}`);

// Check if required files exist
const requiredFiles = [
  'section10-comprehensive.test.ts',
  'playwright.config.ts'
];

console.log('\n🔍 Checking required files...');
for (const file of requiredFiles) {
  const filePath = path.join(SECTION10_DIR, file);
  if (existsSync(filePath)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.log(`❌ ${file} - Missing`);
    process.exit(1);
  }
}

// Check if reference photos exist
const referencePhotos = [
  '10.1.png',
  '10.2.png',
  '10.2-Entry2.png'
];

console.log('\n📸 Checking reference photos...');
for (const photo of referencePhotos) {
  const photoPath = path.join(SECTION10_DIR, photo);
  if (existsSync(photoPath)) {
    console.log(`✅ ${photo} - Found`);
  } else {
    console.log(`⚠️ ${photo} - Missing (optional)`);
  }
}

// Function to run command with proper error handling
function runCommand(command: string, description: string): void {
  console.log(`\n🔄 ${description}...`);
  console.log(`💻 Command: ${command}`);
  
  try {
    const output = execSync(command, {
      cwd: SECTION10_DIR,
      stdio: 'inherit',
      encoding: 'utf8'
    });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed:`);
    console.error(error);
    process.exit(1);
  }
}

// Main test execution
async function runSection10Tests() {
  console.log('\n🚀 Starting Section 10 Tests');
  console.log('='.repeat(50));

  // Install dependencies if needed
  if (!existsSync(path.join(PROJECT_ROOT, 'node_modules'))) {
    runCommand('npm install', 'Installing dependencies');
  }

  // Install Playwright browsers if needed
  runCommand('npx playwright install', 'Installing Playwright browsers');

  // Run the comprehensive test suite
  console.log('\n🧪 Running Section 10 Comprehensive Tests');
  console.log('-'.repeat(40));
  
  const testCommand = 'npx playwright test section10-comprehensive.test.ts --config=playwright.config.ts';
  runCommand(testCommand, 'Section 10 Comprehensive Tests');

  // Generate test report
  console.log('\n📊 Generating Test Report');
  console.log('-'.repeat(40));
  
  const reportCommand = 'npx playwright show-report test-results/html-report';
  try {
    runCommand(reportCommand, 'Opening Test Report');
  } catch (error) {
    console.log('⚠️ Could not open test report automatically');
    console.log(`📁 Test report available at: ${path.join(SECTION10_DIR, 'test-results/html-report/index.html')}`);
  }

  console.log('\n🎉 Section 10 Tests Completed Successfully!');
  console.log('='.repeat(50));
  console.log('📊 Test Results Summary:');
  console.log('  - All 122 fields tested');
  console.log('  - Field mapping verification completed');
  console.log('  - Console error monitoring completed');
  console.log('  - PDF generation testing completed');
  console.log(`📁 Detailed results: ${path.join(SECTION10_DIR, 'test-results/')}`);
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('\n📖 Section 10 Test Runner Help');
  console.log('='.repeat(50));
  console.log('Usage: npm run test:section10 [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h     Show this help message');
  console.log('  --debug        Run tests in debug mode');
  console.log('  --headed       Run tests in headed mode (visible browser)');
  console.log('');
  console.log('Examples:');
  console.log('  npm run test:section10');
  console.log('  npm run test:section10 -- --headed');
  console.log('  npm run test:section10 -- --debug');
  process.exit(0);
}

// Add debug/headed mode support
if (args.includes('--debug')) {
  process.env.PWDEBUG = '1';
  console.log('🐛 Debug mode enabled');
}

if (args.includes('--headed')) {
  process.env.PLAYWRIGHT_HEADED = '1';
  console.log('👁️ Headed mode enabled');
}

// Run the tests
runSection10Tests().catch((error) => {
  console.error('\n❌ Section 10 Test Runner failed:');
  console.error(error);
  process.exit(1);
});
