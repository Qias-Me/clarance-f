/**
 * Simple test runner for field distribution validation
 * Run this script to test the capacity-aware field categorization improvements
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Running Field Distribution Test...');
console.log('This will test the capacity-aware field categorization improvements');
console.log('Expected outcomes:');
console.log('  - Total field count: 6,197 (maintained)');
console.log('  - Section 11 over-allocation: reduced from +70');
console.log('  - Section 12 over-allocation: reduced from +22');
console.log('  - Section 18 over-allocation: reduced from +1');
console.log('  - Section 20 over-allocation: reduced from +581');
console.log('');

// Run the test script
const testScript = join(__dirname, 'src', 'sectionizer', 'test-field-distribution.ts');
const testProcess = spawn('npx', ['tsx', testScript], {
  stdio: 'inherit',
  cwd: __dirname
});

testProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n🎉 Field distribution test completed successfully!');
  } else {
    console.log('\n❌ Field distribution test failed. Please review the results above.');
  }
  process.exit(code);
});

testProcess.on('error', (error) => {
  console.error('💥 Failed to run test:', error.message);
  console.log('\nTry running manually with:');
  console.log(`npx tsx ${testScript}`);
  process.exit(1);
});
