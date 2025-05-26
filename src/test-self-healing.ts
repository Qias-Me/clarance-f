/**
 * Test file for consolidated-self-healing.ts
 */
import { runConsolidatedSelfHealing, ConsolidatedSelfHealingManager } from './sectionizer/utils/consolidated-self-healing.js';
import { RuleEngine } from './sectionizer/engine.js';

// Mock data for testing
const mockSectionFields: Record<string, any[]> = {
  "0": [
    { id: "field1", name: "field1", section: 0 },
    { id: "field2", name: "field2", section: 0 },
    { id: "field3", name: "field3", section: 0 }
  ]
};

const mockReferenceCounts: Record<number, { fields: number, entries: number, subsections: number }> = {
  1: { fields: 5, entries: 0, subsections: 0 },
  2: { fields: 3, entries: 0, subsections: 0 },
  3: { fields: 4, entries: 0, subsections: 0 }
};

async function testSelfHealing() {
  console.log("Starting test of runConsolidatedSelfHealing...");
  
  try {
    // Initialize rule engine
    const ruleEngine = new RuleEngine();
    await ruleEngine.loadRules();
    
    console.log("Rules loaded:", ruleEngine.getRules().length);
    
    // Run the self-healing function
    console.log("Running consolidated self-healing...");
    const result = await runConsolidatedSelfHealing(
      ruleEngine,
      mockSectionFields,
      mockReferenceCounts,
      './output/test-result.json'
    );
    
    // Check the result
    console.log("Self-healing completed with result:", {
      success: result.success,
      iterations: result.iterations,
      corrections: result.corrections,
      finalSectionFieldsKeys: Object.keys(result.finalSectionFields),
      initialDeviation: result.initialDeviation,
      finalDeviation: result.finalDeviation,
      remainingUnknownCount: result.remainingUnknown.length
    });
    
    // Verify finalSectionFields is not empty
    if (Object.keys(result.finalSectionFields).length === 0) {
      console.error("ERROR: finalSectionFields is empty!");
    } else {
      console.log("SUCCESS: finalSectionFields contains data");
      console.log("Number of fields:", Object.values(result.finalSectionFields).flat().length);
    }
    
  } catch (error) {
    console.error("Error during testing:", error);
  }
}

// Run the test
testSelfHealing(); 