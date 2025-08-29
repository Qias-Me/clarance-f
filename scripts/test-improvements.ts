#!/usr/bin/env tsx
/**
 * Test script to verify all improvements are working
 */

import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TestResult {
  test: string;
  status: 'pass' | 'fail';
  message?: string;
}

const tests: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<boolean>): Promise<void> {
  try {
    const result = await testFn();
    tests.push({
      test: name,
      status: result ? 'pass' : 'fail',
      message: result ? undefined : 'Test returned false'
    });
  } catch (error) {
    tests.push({
      test: name,
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function main() {
  console.log('🧪 Testing Improvements...\n');
  
  // Test 1: VirtualizedFields component exists
  await runTest('VirtualizedFields component exists', async () => {
    const filePath = path.join(process.cwd(), 'app/components/Rendered2.0/VirtualizedFields.tsx');
    await fs.access(filePath);
    return true;
  });
  
  // Test 2: FieldMappingFactory exists
  await runTest('FieldMappingFactory exists', async () => {
    const filePath = path.join(process.cwd(), 'app/utils/field-mapping-factory.ts');
    await fs.access(filePath);
    return true;
  });
  
  // Test 3: BaseSectionContext exists
  await runTest('BaseSectionContext exists', async () => {
    const filePath = path.join(process.cwd(), 'app/state/contexts/sections2.0/base/BaseSectionContext.tsx');
    await fs.access(filePath);
    return true;
  });
  
  // Test 4: Section utilities exist
  await runTest('Section utilities exist', async () => {
    const filePath = path.join(process.cwd(), 'app/utils/section-utilities.ts');
    await fs.access(filePath);
    return true;
  });
  
  // Test 5: Migration script exists
  await runTest('Migration script exists', async () => {
    const filePath = path.join(process.cwd(), 'scripts/consolidate-sections.ts');
    await fs.access(filePath);
    return true;
  });
  
  // Test 6: Check for lodash usage in new files
  await runTest('No lodash in new components', async () => {
    const filePath = path.join(process.cwd(), 'app/components/Rendered2.0/VirtualizedFields.tsx');
    const content = await fs.readFile(filePath, 'utf-8');
    return !content.includes('lodash');
  });
  
  // Test 7: Check for immer in BaseSectionContext
  await runTest('Immer used in BaseSectionContext', async () => {
    const filePath = path.join(process.cwd(), 'app/state/contexts/sections2.0/base/BaseSectionContext.tsx');
    const content = await fs.readFile(filePath, 'utf-8');
    return content.includes('immer');
  });
  
  // Test 8: Check TypeScript compilation
  await runTest('TypeScript compilation', async () => {
    const { stderr } = await execAsync('npx tsc --noEmit --skipLibCheck');
    return !stderr;
  });
  
  // Test 9: React dependencies installed
  await runTest('React-window installed', async () => {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    return 'react-window' in packageJson.dependencies;
  });
  
  // Test 10: Error boundary installed
  await runTest('React-error-boundary installed', async () => {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    return 'react-error-boundary' in packageJson.dependencies;
  });
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS');
  console.log('='.repeat(60) + '\n');
  
  const passed = tests.filter(t => t.status === 'pass').length;
  const failed = tests.filter(t => t.status === 'fail').length;
  
  tests.forEach(test => {
    const icon = test.status === 'pass' ? '✅' : '❌';
    console.log(`${icon} ${test.test}`);
    if (test.message) {
      console.log(`   └─ ${test.message}`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`Summary: ${passed} passed, ${failed} failed, ${tests.length} total`);
  console.log('='.repeat(60));
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);