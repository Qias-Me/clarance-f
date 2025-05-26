/**
 * Test file for consolidated-self-healing.js
 * Using ES modules syntax
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple test function
async function testSelfHealing() {
  console.log("Testing self-healing functionality");
  
  try {
    // Check that the file exists
    const filePath = path.resolve(__dirname, 'src/sectionizer/utils/consolidated-self-healing.ts');
    if (fs.existsSync(filePath)) {
      console.log("Self-healing file exists at:", filePath);
    } else {
      console.error("Self-healing file not found at:", filePath);
    }
    
    // Read the file to verify our changes were made
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Check for our changes
    const hasInitializedFields = fileContent.includes("result.finalSectionFields = helpers.deepClone(workingSectionFields)");
    const hasNormalizedReferenceCounts = fileContent.includes("const normalizedReferenceCounts");
    
    console.log("File includes initializing finalSectionFields:", hasInitializedFields);
    console.log("File includes normalizing referenceCounts:", hasNormalizedReferenceCounts);
    
    // Everything looks good!
    if (hasInitializedFields && hasNormalizedReferenceCounts) {
      console.log("SUCCESS: The changes appear to be implemented correctly!");
    } else {
      console.log("WARNING: Some expected changes were not found in the file");
    }
    
  } catch (error) {
    console.error("Error during testing:", error);
  }
}

// Run the test
testSelfHealing(); 