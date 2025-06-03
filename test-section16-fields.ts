/**
 * Test for Section 16 (Foreign Activities) field reference fixes
 * 
 * This TypeScript test validates that the field references in section16.ts are correctly
 * mapped to fields in section-16.json by testing the creation of foreign activities entries.
 */

import { createDefaultSection16, 
        createDefaultForeignGovernmentActivityEntry,
        createDefaultForeignBusinessActivityEntry } from './api/interfaces/sections2.0/section16';
import { loadSectionReferences } from './api/utils/sections-references-loader';

// Main test function 
async function testSection16Fields() {
  console.log("=== Testing Section 16 Field References ===");

  // Load section references
  try {
    await loadSectionReferences();
    console.log("✓ Section references loaded successfully");
  } catch (error) {
    console.error("✗ Error loading section references:", error);
    return;
  }

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
      if (foreignGovtActivity[key as keyof typeof foreignGovtActivity] && 
          foreignGovtActivity[key as keyof typeof foreignGovtActivity].id && 
          foreignGovtActivity[key as keyof typeof foreignGovtActivity].name) {
        console.log(`✓ Field '${key}' has valid references`);
        console.log(`  - ID: ${foreignGovtActivity[key as keyof typeof foreignGovtActivity].id}`);
        console.log(`  - Name: ${foreignGovtActivity[key as keyof typeof foreignGovtActivity].name}`);
      } else {
        console.error(`✗ Field '${key}' has invalid or missing references`);
        console.log(`  - Value:`, foreignGovtActivity[key as keyof typeof foreignGovtActivity]);
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
      if (foreignBusinessActivity[key as keyof typeof foreignBusinessActivity] && 
          foreignBusinessActivity[key as keyof typeof foreignBusinessActivity].id && 
          foreignBusinessActivity[key as keyof typeof foreignBusinessActivity].name) {
        console.log(`✓ Field '${key}' has valid references`);
        console.log(`  - ID: ${foreignBusinessActivity[key as keyof typeof foreignBusinessActivity].id}`);
        console.log(`  - Name: ${foreignBusinessActivity[key as keyof typeof foreignBusinessActivity].name}`);
      } else {
        console.error(`✗ Field '${key}' has invalid or missing references`);
        console.log(`  - Value:`, foreignBusinessActivity[key as keyof typeof foreignBusinessActivity]);
      }
    });
  } catch (error) {
    console.error("✗ Error creating foreign business activity entry:", error);
  }

  console.log("\n=== Section 16 Field References Test Complete ===");
}

// Run the test
testSection16Fields().catch(console.error); 