/**
 * Test for Section 16 (Foreign Activities) field reference fixes
 * 
 * This script validates that the field references in section16.ts are correctly
 * mapped to fields in section-16.json by testing the functionality of adding
 * foreign government activities and foreign business activities.
 */

// Note: Run this script with Node.js using --loader ts-node/esm for TypeScript support

import { createDefaultSection16, 
        createDefaultForeignGovernmentActivityEntry,
        createDefaultForeignBusinessActivityEntry } from './api/interfaces/sections2.0/section16.js';
import { createFieldFromReference, loadSectionReferences } from './api/utils/sections-references-loader.js';

// Load the section references
loadSectionReferences();

console.log("=== Testing Section 16 Field References ===");

// Test 1: Create a default section 16 structure
console.log("\n[Test 1] Creating default Section 16 structure");
try {
  const section16 = createDefaultSection16();
  console.log("✓ Default Section 16 structure created successfully");
} catch (error) {
  console.error("✗ Error creating default Section 16 structure:", error);
}

// Test 2: Create a foreign government activity entry
console.log("\n[Test 2] Creating foreign government activity entry");
try {
  const foreignGovtActivity = createDefaultForeignGovernmentActivityEntry();
  console.log("✓ Foreign government activity entry created successfully");
  
  // Validate key fields to ensure they have proper references
  const keysToCheck = ['organizationName', 'country', 'contactEmail', 'supervisorName'];
  
  keysToCheck.forEach(key => {
    if (foreignGovtActivity[key] && foreignGovtActivity[key].id && foreignGovtActivity[key].name) {
      console.log(`✓ Field '${key}' has valid references`);
      console.log(`  - ID: ${foreignGovtActivity[key].id}`);
      console.log(`  - Name: ${foreignGovtActivity[key].name}`);
    } else {
      console.error(`✗ Field '${key}' has invalid or missing references`);
      console.log(`  - Value:`, foreignGovtActivity[key]);
    }
  });
} catch (error) {
  console.error("✗ Error creating foreign government activity entry:", error);
}

// Test 3: Create a foreign business activity entry
console.log("\n[Test 3] Creating foreign business activity entry");
try {
  const foreignBusinessActivity = createDefaultForeignBusinessActivityEntry();
  console.log("✓ Foreign business activity entry created successfully");
  
  // Validate key fields to ensure they have proper references
  const keysToCheck = ['businessName', 'country', 'businessEmail', 'businessPhone'];
  
  keysToCheck.forEach(key => {
    if (foreignBusinessActivity[key] && foreignBusinessActivity[key].id && foreignBusinessActivity[key].name) {
      console.log(`✓ Field '${key}' has valid references`);
      console.log(`  - ID: ${foreignBusinessActivity[key].id}`);
      console.log(`  - Name: ${foreignBusinessActivity[key].name}`);
    } else {
      console.error(`✗ Field '${key}' has invalid or missing references`);
      console.log(`  - Value:`, foreignBusinessActivity[key]);
    }
  });
} catch (error) {
  console.error("✗ Error creating foreign business activity entry:", error);
}

console.log("\n=== Section 16 Field References Test Complete ==="); 