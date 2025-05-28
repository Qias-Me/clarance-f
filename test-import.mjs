#!/usr/bin/env node

// Test if the categorizeSubformField function can be imported and used
console.log("🧪 Testing categorizeSubformField import...");

try {
  // Try to import the function
  const { categorizeSubformField } = await import('./src/sectionizer/utils/field-clusterer.js');
  
  console.log("✅ Successfully imported categorizeSubformField");
  console.log("Function type:", typeof categorizeSubformField);
  
  // Test with a mock field
  const mockField = {
    name: "form1[0].#subform[10].TextField11[5]",
    page: 25,
    value: "Microsoft Corporation",
    label: "Employer Name",
    section: 0,
    confidence: 0,
    isExplicitlyDetected: false,
    wasMovedByHealing: false
  };
  
  console.log("\n🔍 Testing with mock employment field:");
  console.log("Field:", mockField.name);
  console.log("Page:", mockField.page);
  console.log("Value:", mockField.value);
  
  const result = categorizeSubformField(mockField);
  
  console.log("\n📊 Result:");
  console.log("Section:", result.section);
  console.log("Confidence:", result.confidence);
  console.log("Reason:", result.reason);
  
} catch (error) {
  console.error("❌ Error importing or using categorizeSubformField:", error.message);
  console.error("Stack:", error.stack);
}

console.log("\n🎯 Test completed!");
