// Test script to debug path resolution
const path = require('path');
const fs = require('fs');

console.log('=== PDF Reader MCP Path Resolution Debug ===');
console.log('Current working directory:', process.cwd());
console.log('Parent directory:', path.resolve(process.cwd(), '..'));

const PROJECT_ROOT = path.resolve(process.cwd(), '..');
console.log('Project root:', PROJECT_ROOT);

const testPath = 'workspace/SF86_Section13_Validation_2025-07-18.pdf';
const resolved = path.resolve(PROJECT_ROOT, testPath);
console.log('Resolved path:', resolved);

// Check if file exists
try {
  fs.accessSync(resolved);
  console.log('File exists: YES');
  const stats = fs.statSync(resolved);
  console.log('File size:', stats.size, 'bytes');
} catch (e) {
  console.log('File exists: NO -', e.message);
}

// List workspace directory
const workspaceDir = path.resolve(PROJECT_ROOT, 'workspace');
console.log('Workspace directory:', workspaceDir);
try {
  const files = fs.readdirSync(workspaceDir);
  console.log('Files in workspace:', files);
} catch (e) {
  console.log('Cannot read workspace directory:', e.message);
}
