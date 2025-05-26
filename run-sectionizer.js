/**
 * Script to run the sectionizer with the proper Node.js options
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the sectionizer index.ts
const sectionizerPath = path.join(__dirname, 'src', 'sectionizer', 'index.ts');

console.log(`Running sectionizer from: ${sectionizerPath}`);

// Node.js options
const nodeOptions = [
  '--no-warnings',
  '--experimental-specifier-resolution=node',
  '--loader=ts-node/esm',
  sectionizerPath
];

// Spawn the process
const sectionizer = spawn('node', nodeOptions, {
  stdio: 'inherit', // Pass all stdio to the parent process
  shell: true       // Run in shell to handle Windows-specific issues
});

// Handle process exit
sectionizer.on('close', (code) => {
  console.log(`Sectionizer process exited with code ${code}`);
}); 