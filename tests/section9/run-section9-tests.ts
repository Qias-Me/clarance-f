#!/usr/bin/env node

/**
 * Section 9 Test Runner
 * Executes comprehensive Section 9 citizenship tests with detailed reporting
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

const SECTION9_DIR = path.join(process.cwd(), 'tests', 'section9');
const RESULTS_DIR = path.join(SECTION9_DIR, 'test-results');

function ensureDirectoryExists(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
}

function runSection9Tests() {
  console.log('🚀 Starting Section 9 Comprehensive Test Suite');
  console.log('=====================================');
  console.log('📋 Test Coverage:');
  console.log('  • Section 9.1: Born to US Parents (22 fields)');
  console.log('  • Section 9.2: Naturalized Citizen (22 fields)');
  console.log('  • Section 9.3: Derived Citizen (15 fields)');
  console.log('  • Section 9.4: Non-US Citizen (18 fields)');
  console.log('  • Main Status: (1 field)');
  console.log('  • Total: 78 fields (100% coverage)');
  console.log('=====================================');
  
  // Ensure results directory exists
  ensureDirectoryExists(RESULTS_DIR);
  
  try {
    // Run the tests
    console.log('🧪 Executing Playwright tests...');
    
    const command = `npx playwright test --config=tests/section9/playwright.config.ts tests/section9/section9-comprehensive.test.ts`;
    
    console.log(`📝 Command: ${command}`);
    
    const result = execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      encoding: 'utf8'
    });
    
    console.log('✅ Section 9 tests completed successfully!');
    console.log('📊 Results saved to:', RESULTS_DIR);
    
  } catch (error) {
    console.error('❌ Section 9 tests failed:', error);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  runSection9Tests();
}

export { runSection9Tests };
