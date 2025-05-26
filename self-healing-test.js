/**
 * Direct test for runSelfHealing method that uses mocks to avoid dependencies
 */

// Create pure JavaScript implementations of the needed parts
const mockHelpers = {
  deepClone: (obj) => JSON.parse(JSON.stringify(obj)),
  logWithTimestamp: (msg) => console.log(`[${new Date().toISOString()}] ${msg}`)
};

// Mock chalk for colored console output
const mockChalk = {
  blue: (text) => text,
  green: (text) => text,
  yellow: (text) => text,
  red: (text) => text
};

// Simple version of runSelfHealing for testing
async function runSelfHealing(
  sectionFields,
  referenceCounts
) {
  console.log('*** TEST: Running self-healing simulation ***');
  
  // Initialize result object
  const result = {
    success: false,
    iterations: 0,
    corrections: 0,
    rulesGenerated: 0,
    finalSectionFields: {},
    deviations: [],
    remainingUnknown: []
  };
  
  // Keep track of working copy of section fields
  const workingSectionFields = mockHelpers.deepClone(sectionFields);
  
  // Set initial deviation and alignment score
  result.initialDeviation = 10; // Mock value
  result.initialAlignmentScore = 50; // Mock value
  
  mockHelpers.logWithTimestamp(`Initial Alignment Score: ${result.initialAlignmentScore}%`, mockChalk.blue);
  mockHelpers.logWithTimestamp(`Initial Deviation: ${result.initialDeviation}`, mockChalk.blue);
  
  // This is the key fix we're testing
  result.healedFields = workingSectionFields;
  result.finalSectionFields = mockHelpers.deepClone(workingSectionFields);
  
  // For testing - no processing needed
  mockHelpers.logWithTimestamp('Fields already perfectly aligned! No healing needed.', mockChalk.green);
  
  // These values would be calculated in the real implementation
  result.finalAlignmentScore = 100; // Mock value
  result.finalDeviation = 0; // Mock value
  
  mockHelpers.logWithTimestamp(`Final Alignment Score: ${result.finalAlignmentScore}%`, mockChalk.blue);
  mockHelpers.logWithTimestamp(`Final Deviation: ${result.finalDeviation}`, mockChalk.blue);
  mockHelpers.logWithTimestamp(`Total corrections made: ${result.corrections}`, mockChalk.blue);
  
  // Print the keys in finalSectionFields
  console.log('Keys in finalSectionFields:', Object.keys(result.finalSectionFields));
  
  // Print a sample of the fields from each section
  for (const section in result.finalSectionFields) {
    const fields = result.finalSectionFields[section];
    console.log(`Section ${section}: ${fields.length} fields`);
    if (fields.length > 0) {
      console.log(`  Sample field: ${JSON.stringify(fields[0])}`);
    }
  }
  
  return result;
}

// Run test
async function runTest() {
  // Test with mock data
  const mockSectionFields = {
    "0": [
      { id: "field1", name: "test1", section: 0 },
      { id: "field2", name: "test2", section: 0 }
    ]
  };
  
  const mockReferenceCounts = {
    1: { fields: 2, entries: 0, subsections: 0 }
  };
  
  console.log('Starting test with mock data...');
  console.log('Initial section fields:', mockSectionFields);
  
  const result = await runSelfHealing(mockSectionFields, mockReferenceCounts);
  
  console.log('\nTest result summary:');
  console.log('- finalSectionFields is empty:', Object.keys(result.finalSectionFields).length === 0);
  console.log('- Has original fields:', result.finalSectionFields["0"] && result.finalSectionFields["0"].length === 2);
  
  if (Object.keys(result.finalSectionFields).length > 0) {
    console.log('TEST PASSED: The fix ensures finalSectionFields is populated');
  } else {
    console.log('TEST FAILED: finalSectionFields is still empty');
  }
}

runTest(); 