#!/usr/bin/env node

/**
 * Section 20 Test Suite Verification
 * 
 * Verifies that all test files are properly configured and ready to run
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying Section 20 Test Suite Configuration');
console.log('===============================================');

let allChecksPass = true;

// Check 1: Verify test files exist
console.log('\n📁 Checking test files...');
const requiredTestFiles = [
  'tests/section20-comprehensive.spec.ts',
  'tests/section20-field-types.spec.ts', 
  'tests/section20-edge-cases.spec.ts',
  'tests/section20-test-config.ts',
  'tests/section20-global-setup.ts',
  'tests/section20-global-teardown.ts'
];

for (const file of requiredTestFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allChecksPass = false;
  }
}

// Check 2: Verify Section 20 data file
console.log('\n📊 Checking Section 20 data file...');
const section20DataPath = 'api/sections-references/section-20.json';

if (fs.existsSync(section20DataPath)) {
  try {
    const section20Data = JSON.parse(fs.readFileSync(section20DataPath, 'utf8'));
    
    console.log(`✅ Section 20 data file exists`);
    console.log(`   - Total fields: ${section20Data.metadata.totalFields}`);
    console.log(`   - Section ID: ${section20Data.metadata.sectionId}`);
    console.log(`   - Section name: ${section20Data.metadata.sectionName}`);
    
    if (section20Data.metadata.totalFields === 790) {
      console.log(`✅ Field count matches expected (790)`);
    } else {
      console.log(`⚠️ Field count mismatch: expected 790, found ${section20Data.metadata.totalFields}`);
    }
    
    // Verify field structure
    if (section20Data.fields && Array.isArray(section20Data.fields)) {
      console.log(`✅ Fields array structure valid`);
      
      // Check field types
      const fieldTypes = {};
      section20Data.fields.forEach(field => {
        fieldTypes[field.type] = (fieldTypes[field.type] || 0) + 1;
      });
      
      console.log(`   - Field type distribution:`);
      Object.entries(fieldTypes).forEach(([type, count]) => {
        console.log(`     ${type}: ${count}`);
      });
      
    } else {
      console.log(`❌ Invalid fields array structure`);
      allChecksPass = false;
    }
    
  } catch (error) {
    console.log(`❌ Error parsing Section 20 data: ${error.message}`);
    allChecksPass = false;
  }
} else {
  console.log(`❌ Section 20 data file missing: ${section20DataPath}`);
  allChecksPass = false;
}

// Check 3: Verify test runner script
console.log('\n🏃 Checking test runner...');
const testRunnerPath = 'run-section20-tests.js';

if (fs.existsSync(testRunnerPath)) {
  console.log(`✅ Test runner exists: ${testRunnerPath}`);
  
  // Check if executable
  try {
    fs.accessSync(testRunnerPath, fs.constants.F_OK);
    console.log(`✅ Test runner is accessible`);
  } catch (error) {
    console.log(`⚠️ Test runner access issue: ${error.message}`);
  }
} else {
  console.log(`❌ Test runner missing: ${testRunnerPath}`);
  allChecksPass = false;
}

// Check 4: Verify dependencies
console.log('\n📦 Checking dependencies...');

// Check package.json
if (fs.existsSync('package.json')) {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const requiredDeps = [
      '@playwright/test',
      'playwright'
    ];
    
    const devDeps = packageJson.devDependencies || {};
    const deps = packageJson.dependencies || {};
    const allDeps = { ...deps, ...devDeps };
    
    for (const dep of requiredDeps) {
      if (allDeps[dep]) {
        console.log(`✅ ${dep}: ${allDeps[dep]}`);
      } else {
        console.log(`⚠️ ${dep}: Not found in package.json`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
  }
} else {
  console.log(`⚠️ package.json not found`);
}

// Check 5: Verify test directory structure
console.log('\n📂 Checking test directory structure...');

const testDir = 'tests';
if (fs.existsSync(testDir)) {
  console.log(`✅ Tests directory exists`);
  
  const testFiles = fs.readdirSync(testDir).filter(file => 
    file.startsWith('section20') && (file.endsWith('.spec.ts') || file.endsWith('.ts'))
  );
  
  console.log(`   - Found ${testFiles.length} Section 20 test files:`);
  testFiles.forEach(file => {
    console.log(`     ${file}`);
  });
  
} else {
  console.log(`❌ Tests directory missing: ${testDir}`);
  allChecksPass = false;
}

// Check 6: Verify test results directory can be created
console.log('\n📊 Checking test results directory...');

const testResultsDir = 'test-results';
try {
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
    console.log(`✅ Created test results directory: ${testResultsDir}`);
  } else {
    console.log(`✅ Test results directory exists: ${testResultsDir}`);
  }
  
  // Test write permissions
  const testFile = path.join(testResultsDir, 'test-write-permissions.tmp');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log(`✅ Test results directory is writable`);
  
} catch (error) {
  console.log(`❌ Test results directory issue: ${error.message}`);
  allChecksPass = false;
}

// Check 7: Verify TypeScript configuration
console.log('\n⚙️ Checking TypeScript configuration...');

const tsConfigPaths = ['tsconfig.json', 'playwright.config.ts'];
let tsConfigFound = false;

for (const configPath of tsConfigPaths) {
  if (fs.existsSync(configPath)) {
    console.log(`✅ TypeScript config found: ${configPath}`);
    tsConfigFound = true;
    break;
  }
}

if (!tsConfigFound) {
  console.log(`⚠️ No TypeScript configuration found`);
  console.log(`   Consider creating tsconfig.json or playwright.config.ts`);
}

// Check 8: Verify Playwright installation
console.log('\n🎭 Checking Playwright installation...');

try {
  const { execSync } = await import('child_process');
  const playwrightVersion = execSync('npx playwright --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Playwright installed: ${playwrightVersion}`);
  
  // Check browsers
  try {
    execSync('npx playwright install --dry-run', { stdio: 'pipe' });
    console.log(`✅ Playwright browsers are installed`);
  } catch (error) {
    console.log(`⚠️ Playwright browsers may need installation: npx playwright install`);
  }
  
} catch (error) {
  console.log(`❌ Playwright not found: ${error.message}`);
  console.log(`   Install with: npm install @playwright/test`);
  allChecksPass = false;
}

// Summary
console.log('\n🎯 Verification Summary');
console.log('======================');

if (allChecksPass) {
  console.log('✅ All checks passed! Section 20 test suite is ready to run.');
  console.log('');
  console.log('🚀 To run the tests:');
  console.log('   node run-section20-tests.js');
  console.log('');
  console.log('📖 For more options:');
  console.log('   node run-section20-tests.js --help');
  
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please address the issues above before running tests.');
  console.log('');
  console.log('🔧 Common fixes:');
  console.log('   - Install Playwright: npm install @playwright/test');
  console.log('   - Install browsers: npx playwright install');
  console.log('   - Create missing test files');
  console.log('   - Verify Section 20 data file exists');
  
  process.exit(1);
}
