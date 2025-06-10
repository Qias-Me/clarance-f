#!/usr/bin/env node

/**
 * Section 10 Test Validation Script
 * 
 * Validates that all Section 10 test files are properly structured
 * and ready for execution.
 */

import { existsSync, readFileSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SECTION10_DIR = path.resolve(__dirname);

console.log('🔍 Section 10 Test Validation');
console.log('='.repeat(50));

// Check required files
const requiredFiles = [
  'section10-comprehensive.test.ts',
  'playwright.config.ts',
  'run-section10-tests.ts',
  'README.md'
];

console.log('\n📁 Checking required files...');
let allFilesExist = true;

for (const file of requiredFiles) {
  const filePath = path.join(SECTION10_DIR, file);
  if (existsSync(filePath)) {
    const stats = statSync(filePath);
    console.log(`✅ ${file} - Found (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} - Missing`);
    allFilesExist = false;
  }
}

// Check reference photos
const referencePhotos = [
  '10.1.png',
  '10.2.png',
  '10.2-Entry2.png'
];

console.log('\n📸 Checking reference photos...');
for (const photo of referencePhotos) {
  const photoPath = path.join(SECTION10_DIR, photo);
  if (existsSync(photoPath)) {
    const stats = statSync(photoPath);
    console.log(`✅ ${photo} - Found (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`⚠️ ${photo} - Missing (optional)`);
  }
}

// Validate test file structure
console.log('\n🧪 Validating test file structure...');

const testFilePath = path.join(SECTION10_DIR, 'section10-comprehensive.test.ts');
if (existsSync(testFilePath)) {
  const testContent = readFileSync(testFilePath, 'utf8');
  
  // Check for required test cases
  const requiredTestCases = [
    'should verify Section 10 field mapping initialization',
    'should fill out complete dual citizenship section',
    'should fill out complete foreign passport section',
    'should test all 122 fields in Section 10',
    'should generate PDF with all Section 10 data',
    'should monitor console for errors during complete workflow'
  ];
  
  console.log('  📋 Checking test cases...');
  for (const testCase of requiredTestCases) {
    if (testContent.includes(testCase)) {
      console.log(`  ✅ "${testCase}" - Found`);
    } else {
      console.log(`  ❌ "${testCase}" - Missing`);
      allFilesExist = false;
    }
  }
  
  // Check for required imports
  const requiredImports = [
    "import { test, expect, Page } from '@playwright/test'",
    'COMPREHENSIVE_TEST_DATA',
    'setupComprehensiveMonitoring',
    'navigateToSection10'
  ];
  
  console.log('  📦 Checking imports and functions...');
  for (const importItem of requiredImports) {
    if (testContent.includes(importItem)) {
      console.log(`  ✅ ${importItem} - Found`);
    } else {
      console.log(`  ❌ ${importItem} - Missing`);
      allFilesExist = false;
    }
  }
  
  // Check field count expectations
  if (testContent.includes('122')) {
    console.log('  ✅ Field count validation (122 fields) - Found');
  } else {
    console.log('  ⚠️ Field count validation (122 fields) - Not found');
  }
  
} else {
  console.log('  ❌ Test file not found');
  allFilesExist = false;
}

// Validate Playwright config
console.log('\n⚙️ Validating Playwright configuration...');

const configFilePath = path.join(SECTION10_DIR, 'playwright.config.ts');
if (existsSync(configFilePath)) {
  const configContent = readFileSync(configFilePath, 'utf8');
  
  const requiredConfigItems = [
    'baseURL',
    'trace',
    'screenshot',
    'video',
    'webServer',
    'timeout'
  ];
  
  for (const configItem of requiredConfigItems) {
    if (configContent.includes(configItem)) {
      console.log(`  ✅ ${configItem} - Configured`);
    } else {
      console.log(`  ⚠️ ${configItem} - Not found`);
    }
  }
} else {
  console.log('  ❌ Playwright config not found');
  allFilesExist = false;
}

// Summary
console.log('\n📊 Validation Summary');
console.log('='.repeat(50));

if (allFilesExist) {
  console.log('✅ All required files and structures are present');
  console.log('🚀 Section 10 tests are ready to run');
  console.log('\nNext steps:');
  console.log('1. Ensure the development server is running (npm run dev)');
  console.log('2. Run tests: npx playwright test section10-comprehensive.test.ts');
  console.log('3. Or use the test runner: node run-section10-tests.ts');
} else {
  console.log('❌ Some required files or structures are missing');
  console.log('🔧 Please check the missing items above and fix them');
}

console.log('\n📁 Test directory structure:');
console.log(`${SECTION10_DIR}/`);
console.log('├── section10-comprehensive.test.ts  (Main test suite)');
console.log('├── playwright.config.ts             (Playwright config)');
console.log('├── run-section10-tests.ts           (Test runner)');
console.log('├── validate-tests.ts                (This validation script)');
console.log('├── README.md                        (Documentation)');
console.log('├── 10.1.png                         (Reference photo)');
console.log('├── 10.2.png                         (Reference photo)');
console.log('└── 10.2-Entry2.png                  (Reference photo)');

console.log('\n🎯 Test Coverage:');
console.log('• Dual Citizenship: 23 fields');
console.log('• Foreign Passport: 99 fields');
console.log('• Total: 122 fields');
console.log('• Field mapping verification');
console.log('• Console error monitoring');
console.log('• PDF generation testing');

process.exit(allFilesExist ? 0 : 1);
