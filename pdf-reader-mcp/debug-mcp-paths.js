// Debug script to understand MCP path resolution
import path from 'path';
import fs from 'fs';
import { resolvePath, PROJECT_ROOT } from './dist/utils/pathUtils.js';

console.log('=== MCP Path Resolution Debug ===');
console.log('Current working directory:', process.cwd());
console.log('PROJECT_ROOT from pathUtils:', PROJECT_ROOT);

// Test different path variations
const testPaths = [
  'SF86_Section13_Validation_2025-07-18.pdf',
  './SF86_Section13_Validation_2025-07-18.pdf',
  'workspace/SF86_Section13_Validation_2025-07-18.pdf',
  '../workspace/SF86_Section13_Validation_2025-07-18.pdf'
];

testPaths.forEach(testPath => {
  console.log(`\n--- Testing path: "${testPath}" ---`);
  try {
    const resolved = resolvePath(testPath);
    console.log(`✅ Resolved successfully: ${resolved}`);
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }
});

// List files in current directory
console.log('\n--- Files in current directory ---');
try {
  const files = fs.readdirSync('.');
  const pdfFiles = files.filter(f => f.endsWith('.pdf'));
  console.log('PDF files found:', pdfFiles);
} catch (e) {
  console.log('Error reading directory:', e.message);
}

// List files in workspace directory
console.log('\n--- Files in workspace directory ---');
try {
  const workspacePath = path.resolve(PROJECT_ROOT, 'workspace');
  console.log('Workspace path:', workspacePath);
  const files = fs.readdirSync(workspacePath);
  const pdfFiles = files.filter(f => f.endsWith('.pdf'));
  console.log('PDF files in workspace:', pdfFiles);
} catch (e) {
  console.log('Error reading workspace directory:', e.message);
}
