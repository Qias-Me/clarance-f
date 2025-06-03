/**
 * Section 16 Field Mapping Validation
 * 
 * This script directly tests the section 16 field mappings by:
 * 1. Loading the section-16.json file
 * 2. Creating entries using the factory functions
 * 3. Verifying all referenced fields exist
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the section16 functions
import { 
  createDefaultForeignGovernmentActivityEntry,
  createDefaultForeignBusinessActivityEntry,
  createDefaultForeignOrganizationEntry,
  createDefaultForeignPropertyEntry,
  createDefaultForeignBusinessTravelEntry,
  createDefaultForeignConferenceEntry,
  createDefaultForeignGovernmentContactEntry
} from '../api/interfaces/sections2.0/section16.js';

// Read the section-16.json file
function getSectionFields() {
  const filePath = path.join(__dirname, '..', 'api', 'sections-references', 'section-16.json');
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    return data.fields.map(field => field.name);
  } catch (error) {
    console.error(`Error reading section-16.json: ${error}`);
    return [];
  }
}

// Extract field references from an entry
function extractFieldReferences(entry) {
  const references = new Set();
  
  function processField(field) {
    if (field && typeof field === 'object') {
      if (field.name && typeof field.name === 'string') {
        references.add(field.name);
      }
      
      // Process child fields
      for (const key in field) {
        if (typeof field[key] === 'object' && field[key] !== null) {
          processField(field[key]);
        }
      }
    }
  }
  
  processField(entry);
  return Array.from(references);
}

// Validate field references for each entry type
function validateFieldMapping() {
  console.log('Validating Section 16 field mappings...\n');
  
  // Get all available field names
  const availableFields = getSectionFields();
  console.log(`Found ${availableFields.length} fields in section-16.json`);
  
  // Check for Section16_2
  const hasSection16_2 = availableFields.some(name => name.includes('Section16_2'));
  console.log(`Section16_2 exists: ${hasSection16_2}\n`);
  
  // Test each entry type
  const entryTypes = [
    { 
      name: 'Foreign Government Activity', 
      factory: createDefaultForeignGovernmentActivityEntry 
    },
    { 
      name: 'Foreign Business Activity', 
      factory: createDefaultForeignBusinessActivityEntry 
    },
    { 
      name: 'Foreign Organization', 
      factory: createDefaultForeignOrganizationEntry 
    },
    { 
      name: 'Foreign Property', 
      factory: createDefaultForeignPropertyEntry 
    },
    { 
      name: 'Foreign Business Travel', 
      factory: createDefaultForeignBusinessTravelEntry 
    },
    { 
      name: 'Foreign Conference', 
      factory: createDefaultForeignConferenceEntry 
    },
    { 
      name: 'Foreign Government Contact', 
      factory: createDefaultForeignGovernmentContactEntry 
    }
  ];
  
  let allValid = true;
  
  for (const entryType of entryTypes) {
    try {
      console.log(`Testing ${entryType.name} entry...`);
      
      // Create an entry using the factory function
      const entry = entryType.factory();
      
      // Extract field references
      const references = extractFieldReferences(entry);
      
      // Check if all references exist in the available fields
      const missingReferences = references.filter(ref => !availableFields.includes(ref));
      
      if (missingReferences.length === 0) {
        console.log(`✅ All field references in ${entryType.name} are valid`);
      } else {
        console.error(`❌ Found ${missingReferences.length} missing field references in ${entryType.name}:`);
        missingReferences.forEach(ref => console.error(`   - ${ref}`));
        allValid = false;
      }
      
      console.log(''); // Add space between each entry type
    } catch (error) {
      console.error(`❌ Error testing ${entryType.name}: ${error.message}`);
      allValid = false;
    }
  }
  
  // Final result
  if (allValid) {
    console.log('🎉 SUCCESS: All Section 16 field mappings are valid');
  } else {
    console.error('❌ FAILED: Some Section 16 field mappings are invalid');
    process.exit(1);
  }
}

// Run the validation
validateFieldMapping(); 