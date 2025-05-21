#!/usr/bin/env node

/**
 * Process Sample Fields Script
 * 
 * This utility script runs the sectionizer on a sample JSON file
 * containing field data with coordinates.
 * 
 * Usage: 
 *   node process-sample.js
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the sample fields JSON file
const sampleFieldsPath = path.resolve(__dirname, 'sample-fields.json');

// Path to the output directory
const outputDirPath = path.resolve(__dirname, '../../output/test15');

// Output directory for debugging
const debugOutputPath = path.resolve(__dirname, '../../output/test15-debug');

console.log('Running sectionizer on sample fields JSON file...');
console.log(`Sample fields: ${sampleFieldsPath}`);
console.log(`Output directory: ${outputDirPath}`);

try {
  // Create the command to run the sectionizer
  const command = `npx tsx ../../src/sectionizer/index.ts --pdf-path="${sampleFieldsPath}" --output-dir="${outputDirPath}" --debug-dir="${debugOutputPath}" --log-level=debug`;
  
  // Execute the command
  console.log(`Executing: ${command}`);
  const result = execSync(command, { cwd: __dirname, stdio: 'inherit' });
  
  console.log('Processing complete!');
} catch (error) {
  console.error('Error running sectionizer:', error);
  process.exit(1);
} 