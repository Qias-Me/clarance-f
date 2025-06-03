/**
 * Test script to validate Section 16 field mappings
 * 
 * This script checks that all field references used in the section16.ts
 * factory functions actually exist in the section-16.json file.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility function to read JSON file
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}: ${error.message}`);
    return null;
  }
}

// Utility function to extract field references from TypeScript file
function extractFieldReferences(tsContent) {
  const references = [];
  const regex = /createFieldFromReference\(16,\s*['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = regex.exec(tsContent)) !== null) {
    references.push(match[1]);
  }
  
  return [...new Set(references)]; // Remove duplicates
}

// Validate field references
function validateFieldReferences() {
  console.log('Validating Section 16 field references...');
  
  // Read the files
  const sectionJsonPath = path.join(__dirname, 'api', 'sections-references', 'section-16.json');
  const sectionTsPath = path.join(__dirname, 'api', 'interfaces', 'sections2.0', 'section16.ts');
  
  const sectionJson = readJsonFile(sectionJsonPath);
  if (!sectionJson) {
    console.error('Failed to read section-16.json');
    return false;
  }
  
  let tsContent;
  try {
    tsContent = fs.readFileSync(sectionTsPath, 'utf8');
  } catch (error) {
    console.error(`Error reading ${sectionTsPath}: ${error.message}`);
    return false;
  }
  
  // Extract field references
  const references = extractFieldReferences(tsContent);
  console.log(`Found ${references.length} unique field references in section16.ts`);
  
  // Get all available field names
  const availableFields = new Set(sectionJson.fields.map(field => field.name));
  console.log(`Found ${availableFields.size} fields in section-16.json`);
  
  // Check if Section16_2 exists
  const hasSection16_2 = Array.from(availableFields).some(name => name.includes('Section16_2'));
  console.log(`Section16_2 exists: ${hasSection16_2}`);
  
  // Check which sections exist
  const sections = new Set();
  availableFields.forEach(name => {
    const match = name.match(/Section16_(\d+)/);
    if (match) {
      sections.add(match[1]);
    }
  });
  console.log(`Available sections: ${Array.from(sections).join(', ')}`);
  
  // Count fields in each section
  const sectionCounts = {};
  availableFields.forEach(name => {
    const match = name.match(/Section16_(\d+)/);
    if (match) {
      const section = match[1];
      sectionCounts[section] = (sectionCounts[section] || 0) + 1;
    }
  });
  console.log('Field count by section:');
  Object.entries(sectionCounts).forEach(([section, count]) => {
    console.log(`  Section16_${section}: ${count} fields`);
  });
  
  // Check each reference
  const missingReferences = [];
  for (const reference of references) {
    if (!availableFields.has(reference)) {
      missingReferences.push(reference);
    }
  }
  
  // Check for any references to Section16_2
  const section16_2References = references.filter(ref => ref.includes('Section16_2'));
  if (section16_2References.length > 0) {
    console.error('ERROR: Found references to non-existent Section16_2:');
    section16_2References.forEach(ref => console.error(`  - ${ref}`));
  }
  
  // Report results
  if (missingReferences.length === 0) {
    console.log('SUCCESS: All field references exist in section-16.json');
    return true;
  } else {
    console.error(`ERROR: Found ${missingReferences.length} missing field references:`);
    missingReferences.forEach(ref => console.error(`  - ${ref}`));
    return false;
  }
}

// Run the validation
validateFieldReferences(); 