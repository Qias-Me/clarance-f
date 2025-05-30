/**
 * Basic Section 7 Validation Test
 * 
 * Simple Node.js test to validate Section 7 implementation
 * before running full Playwright tests.
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

function testFileExistence() {
  console.log('🔍 Testing file existence...');
  
  const requiredFiles = [
    'api/interfaces/sections/section7.ts',
    'app/state/contexts/sections/section7.tsx',
    'app/routes/test.section7.tsx',
    'tests/section7/section7.spec.ts',
    'tests/section7/playwright.config.ts'
  ];
  
  let allExist = true;
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - MISSING`);
      allExist = false;
    }
  });
  
  return allExist;
}

function testInterfaceStructure() {
  console.log('\n🔍 Testing interface structure...');
  
  try {
    const interfaceContent = fs.readFileSync('api/interfaces/sections/section7.ts', 'utf8');
    
    const requiredInterfaces = [
      'interface Section7',
      'interface ResidenceEntry',
      'interface Address',
      'interface DateRange',
      'interface VerificationContact'
    ];
    
    const requiredConstants = [
      'SECTION7_FIELD_IDS',
      'RESIDENCE_TYPES',
      'VERIFICATION_RELATIONSHIPS'
    ];
    
    let allValid = true;
    
    requiredInterfaces.forEach(interfaceDef => {
      if (interfaceContent.includes(interfaceDef)) {
        console.log(`✅ ${interfaceDef}`);
      } else {
        console.log(`❌ ${interfaceDef} - MISSING`);
        allValid = false;
      }
    });
    
    requiredConstants.forEach(constant => {
      if (interfaceContent.includes(constant)) {
        console.log(`✅ ${constant}`);
      } else {
        console.log(`❌ ${constant} - MISSING`);
        allValid = false;
      }
    });
    
    return allValid;
  } catch (error) {
    console.log(`❌ Error reading interface file: ${error.message}`);
    return false;
  }
}

function testContextImplementation() {
  console.log('\n🔍 Testing context implementation...');
  
  try {
    const contextContent = fs.readFileSync('app/state/contexts/sections/section7.tsx', 'utf8');
    
    const requiredFunctions = [
      'updateResidenceHistoryFlag',
      'addResidenceEntry',
      'removeResidenceEntry',
      'updateFieldValue',
      'getResidenceCount',
      'validateSection',
      'getChanges'
    ];
    
    const requiredIntegrations = [
      'useSection86FormIntegration',
      'markComplete',
      'navigateToSection',
      'saveForm'
    ];
    
    let allValid = true;
    
    requiredFunctions.forEach(func => {
      if (contextContent.includes(func)) {
        console.log(`✅ ${func}`);
      } else {
        console.log(`❌ ${func} - MISSING`);
        allValid = false;
      }
    });
    
    requiredIntegrations.forEach(integration => {
      if (contextContent.includes(integration)) {
        console.log(`✅ ${integration}`);
      } else {
        console.log(`❌ ${integration} - MISSING`);
        allValid = false;
      }
    });
    
    // Check for proper exports
    if (contextContent.includes('export const useSection7')) {
      console.log('✅ useSection7 hook export');
    } else {
      console.log('❌ useSection7 hook export - MISSING');
      allValid = false;
    }
    
    if (contextContent.includes('export const Section7Provider')) {
      console.log('✅ Section7Provider export');
    } else {
      console.log('❌ Section7Provider export - MISSING');
      allValid = false;
    }
    
    return allValid;
  } catch (error) {
    console.log(`❌ Error reading context file: ${error.message}`);
    return false;
  }
}

function testTestPageImplementation() {
  console.log('\n🔍 Testing test page implementation...');
  
  try {
    const testPageContent = fs.readFileSync('app/routes/test.section7.tsx', 'utf8');
    
    const requiredTestIds = [
      'section7-test-page',
      'has-lived-yes',
      'has-lived-no',
      'add-residence-entry',
      'residence-entry',
      'validate-section',
      'complete-and-continue'
    ];
    
    const requiredProviders = [
      'CompleteSF86FormProvider',
      'Section7Provider'
    ];
    
    let allValid = true;
    
    requiredTestIds.forEach(testId => {
      if (testPageContent.includes(`data-testid="${testId}"`)) {
        console.log(`✅ ${testId} test ID`);
      } else {
        console.log(`❌ ${testId} test ID - MISSING`);
        allValid = false;
      }
    });
    
    requiredProviders.forEach(provider => {
      if (testPageContent.includes(provider)) {
        console.log(`✅ ${provider}`);
      } else {
        console.log(`❌ ${provider} - MISSING`);
        allValid = false;
      }
    });
    
    return allValid;
  } catch (error) {
    console.log(`❌ Error reading test page file: ${error.message}`);
    return false;
  }
}

function testPlaywrightTests() {
  console.log('\n🔍 Testing Playwright test structure...');
  
  try {
    const testContent = fs.readFileSync('tests/section7/section7.spec.ts', 'utf8');
    
    const requiredTestSuites = [
      'Basic CRUD Operations',
      'Enhanced Entry Management',
      'Validation Logic',
      'SF86FormContext Integration',
      'Cross-Section Functionality',
      'Performance and Memory Management'
    ];
    
    let allValid = true;
    
    requiredTestSuites.forEach(suite => {
      if (testContent.includes(suite)) {
        console.log(`✅ ${suite} test suite`);
      } else {
        console.log(`❌ ${suite} test suite - MISSING`);
        allValid = false;
      }
    });
    
    // Check for browser coverage in config
    const configContent = fs.readFileSync('tests/section7/playwright.config.ts', 'utf8');
    const requiredBrowsers = ['chromium', 'firefox', 'webkit'];
    
    requiredBrowsers.forEach(browser => {
      if (configContent.includes(browser)) {
        console.log(`✅ ${browser} browser config`);
      } else {
        console.log(`❌ ${browser} browser config - MISSING`);
        allValid = false;
      }
    });
    
    return allValid;
  } catch (error) {
    console.log(`❌ Error reading test files: ${error.message}`);
    return false;
  }
}

function testPackageJsonScripts() {
  console.log('\n🔍 Testing package.json scripts...');
  
  try {
    const packageContent = fs.readFileSync('package.json', 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    const requiredScripts = [
      'test:section7',
      'test:scalable-architecture'
    ];
    
    let allValid = true;
    
    requiredScripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        console.log(`✅ ${script} script`);
      } else {
        console.log(`❌ ${script} script - MISSING`);
        allValid = false;
      }
    });
    
    return allValid;
  } catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
    return false;
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

function runBasicValidation() {
  console.log('🚀 Running Section 7 Basic Validation Tests\n');
  
  const tests = [
    { name: 'File Existence', fn: testFileExistence },
    { name: 'Interface Structure', fn: testInterfaceStructure },
    { name: 'Context Implementation', fn: testContextImplementation },
    { name: 'Test Page Implementation', fn: testTestPageImplementation },
    { name: 'Playwright Tests', fn: testPlaywrightTests },
    { name: 'Package Scripts', fn: testPackageJsonScripts }
  ];
  
  let allPassed = true;
  const results = [];
  
  tests.forEach(test => {
    const passed = test.fn();
    results.push({ name: test.name, passed });
    if (!passed) {
      allPassed = false;
    }
  });
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.name}`);
  });
  
  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('🎉 All basic validation tests passed!');
    console.log('✅ Section 7 implementation is ready for Playwright testing.');
    console.log('\nNext steps:');
    console.log('1. Run: npm run test:section7');
    console.log('2. Verify all Playwright tests pass');
    console.log('3. Check performance benchmarks');
    return true;
  } else {
    console.log('❌ Some validation tests failed.');
    console.log('Please fix the issues above before running Playwright tests.');
    return false;
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const success = runBasicValidation();
  process.exit(success ? 0 : 1);
}

module.exports = { runBasicValidation };
