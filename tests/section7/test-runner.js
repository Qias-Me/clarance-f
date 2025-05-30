/**
 * Section 7 Test Runner
 * 
 * Simple test runner to validate Section 7 implementation
 * before running full Playwright tests.
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// TEST VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate that all required files exist
 */
function validateFiles() {
  console.log('🔍 Validating required files...');
  
  const requiredFiles = [
    'api/interfaces/sections/section7.ts',
    'app/state/contexts/sections/section7.tsx',
    'app/routes/test.section7.tsx',
    'tests/section7/section7.spec.ts',
    'tests/section7/playwright.config.ts'
  ];
  
  const missingFiles = [];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing required files:');
    missingFiles.forEach(file => console.error(`   - ${file}`));
    return false;
  }
  
  console.log('✅ All required files exist');
  return true;
}

/**
 * Validate TypeScript interfaces
 */
function validateInterfaces() {
  console.log('🔍 Validating TypeScript interfaces...');
  
  try {
    const interfaceFile = fs.readFileSync('api/interfaces/sections/section7.ts', 'utf8');
    
    // Check for required interfaces
    const requiredInterfaces = [
      'Section7',
      'ResidenceEntry',
      'Address',
      'DateRange',
      'VerificationContact'
    ];
    
    const missingInterfaces = requiredInterfaces.filter(
      interfaceName => !interfaceFile.includes(`interface ${interfaceName}`)
    );
    
    if (missingInterfaces.length > 0) {
      console.error('❌ Missing required interfaces:');
      missingInterfaces.forEach(name => console.error(`   - ${name}`));
      return false;
    }
    
    // Check for field ID patterns
    if (!interfaceFile.includes('SECTION7_FIELD_IDS')) {
      console.error('❌ Missing SECTION7_FIELD_IDS constant');
      return false;
    }
    
    console.log('✅ TypeScript interfaces are valid');
    return true;
  } catch (error) {
    console.error('❌ Error validating interfaces:', error.message);
    return false;
  }
}

/**
 * Validate Section 7 context implementation
 */
function validateContext() {
  console.log('🔍 Validating Section 7 context...');
  
  try {
    const contextFile = fs.readFileSync('app/state/contexts/sections/section7.tsx', 'utf8');
    
    // Check for required functions
    const requiredFunctions = [
      'updateResidenceHistoryFlag',
      'addResidenceEntry',
      'removeResidenceEntry',
      'updateFieldValue',
      'validateSection',
      'getChanges'
    ];
    
    const missingFunctions = requiredFunctions.filter(
      funcName => !contextFile.includes(funcName)
    );
    
    if (missingFunctions.length > 0) {
      console.error('❌ Missing required functions:');
      missingFunctions.forEach(name => console.error(`   - ${name}`));
      return false;
    }
    
    // Check for SF86Form integration
    if (!contextFile.includes('useSection86FormIntegration')) {
      console.error('❌ Missing SF86Form integration');
      return false;
    }
    
    // Check for proper exports
    if (!contextFile.includes('export const useSection7')) {
      console.error('❌ Missing useSection7 hook export');
      return false;
    }
    
    console.log('✅ Section 7 context is valid');
    return true;
  } catch (error) {
    console.error('❌ Error validating context:', error.message);
    return false;
  }
}

/**
 * Validate test page implementation
 */
function validateTestPage() {
  console.log('🔍 Validating test page...');
  
  try {
    const testPageFile = fs.readFileSync('app/routes/test.section7.tsx', 'utf8');
    
    // Check for required test IDs
    const requiredTestIds = [
      'section7-test-page',
      'has-lived-yes',
      'has-lived-no',
      'add-residence-entry',
      'residence-entry',
      'validate-section',
      'complete-and-continue'
    ];
    
    const missingTestIds = requiredTestIds.filter(
      testId => !testPageFile.includes(`data-testid="${testId}"`)
    );
    
    if (missingTestIds.length > 0) {
      console.error('❌ Missing required test IDs:');
      missingTestIds.forEach(id => console.error(`   - ${id}`));
      return false;
    }
    
    // Check for provider wrapping
    if (!testPageFile.includes('CompleteSF86FormProvider')) {
      console.error('❌ Missing CompleteSF86FormProvider wrapper');
      return false;
    }
    
    if (!testPageFile.includes('Section7Provider')) {
      console.error('❌ Missing Section7Provider wrapper');
      return false;
    }
    
    console.log('✅ Test page is valid');
    return true;
  } catch (error) {
    console.error('❌ Error validating test page:', error.message);
    return false;
  }
}

/**
 * Validate Playwright tests
 */
function validateTests() {
  console.log('🔍 Validating Playwright tests...');
  
  try {
    const testFile = fs.readFileSync('tests/section7/section7.spec.ts', 'utf8');
    
    // Check for required test categories
    const requiredTestCategories = [
      'Basic CRUD Operations',
      'Enhanced Entry Management',
      'Validation Logic',
      'SF86FormContext Integration',
      'Cross-Section Functionality',
      'Performance and Memory Management'
    ];
    
    const missingCategories = requiredTestCategories.filter(
      category => !testFile.includes(category)
    );
    
    if (missingCategories.length > 0) {
      console.error('❌ Missing required test categories:');
      missingCategories.forEach(cat => console.error(`   - ${cat}`));
      return false;
    }
    
    // Check for browser coverage
    const configFile = fs.readFileSync('tests/section7/playwright.config.ts', 'utf8');
    const requiredBrowsers = ['chromium', 'firefox', 'webkit'];
    
    const missingBrowsers = requiredBrowsers.filter(
      browser => !configFile.includes(browser)
    );
    
    if (missingBrowsers.length > 0) {
      console.error('❌ Missing browser coverage:');
      missingBrowsers.forEach(browser => console.error(`   - ${browser}`));
      return false;
    }
    
    console.log('✅ Playwright tests are valid');
    return true;
  } catch (error) {
    console.error('❌ Error validating tests:', error.message);
    return false;
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runValidation() {
  console.log('🚀 Starting Section 7 Implementation Validation\n');
  
  const validations = [
    { name: 'Files', fn: validateFiles },
    { name: 'Interfaces', fn: validateInterfaces },
    { name: 'Context', fn: validateContext },
    { name: 'Test Page', fn: validateTestPage },
    { name: 'Tests', fn: validateTests }
  ];
  
  let allValid = true;
  
  for (const validation of validations) {
    const isValid = validation.fn();
    if (!isValid) {
      allValid = false;
    }
    console.log(''); // Add spacing
  }
  
  if (allValid) {
    console.log('🎉 All validations passed! Section 7 implementation is ready for testing.');
    console.log('\nNext steps:');
    console.log('1. Run: npm run test:section7');
    console.log('2. Verify all tests pass across browsers');
    console.log('3. Check performance benchmarks');
    return true;
  } else {
    console.log('❌ Some validations failed. Please fix the issues above before proceeding.');
    return false;
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  runValidation().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runValidation };
