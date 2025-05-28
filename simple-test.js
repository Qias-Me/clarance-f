// Simple test to verify our Section14_1 fix
console.log("🧪 Testing Section14_1 field handling...");

// Simulate the explicit section extraction logic
function extractExplicitSectionFromName(fieldName) {
  const sectionPattern1 = /form1\[0\]\.Section(\d+)(?:_\d+|\\\\\.|\.|_|-|\[)/i;
  const match1 = fieldName.match(sectionPattern1);
  
  if (match1) {
    const sectionNum = parseInt(match1[1], 10);
    
    if (sectionNum >= 1 && sectionNum <= 30) {
      // SPECIAL CASE: Don't override pattern-based categorization for Section14_1 fields
      if (sectionNum === 14 && fieldName.includes("Section14_1")) {
        console.log(`   ⚠️  SKIPPING Section14_1 field - letting pattern-based categorization handle it`);
        return {
          section: 0,
          confidence: 0,
          reason: "Section14_1 field - deferred to pattern-based categorization",
        };
      }
      
      return {
        section: sectionNum,
        confidence: 0.99,
        reason: `Explicit section reference in form path: Section${sectionNum}`,
      };
    }
  }
  
  return {
    section: 0,
    confidence: 0,
    reason: "No explicit section reference found",
  };
}

// Test fields
const testFields = [
  "form1[0].Section14_1[0].#field[24]",
  "form1[0].Section14_1[0].#area[16].From_Datefield_Name_2[4]", 
  "form1[0].Section14_1[0].TextField11[0]",
  "form1[0].Section11[0].TextField11[0]", // Control - should work normally
];

console.log("\n📋 Testing explicit section extraction:");

testFields.forEach((fieldName, index) => {
  console.log(`\n${index + 1}. Testing: ${fieldName}`);
  
  const result = extractExplicitSectionFromName(fieldName);
  console.log(`   Result: Section ${result.section}, Confidence: ${result.confidence}`);
  console.log(`   Reason: ${result.reason}`);
  
  if (fieldName.includes("Section14_1")) {
    if (result.section === 0) {
      console.log(`   ✅ SUCCESS: Section14_1 field correctly deferred to pattern-based categorization`);
    } else {
      console.log(`   ❌ ISSUE: Section14_1 field was not deferred (section: ${result.section})`);
    }
  } else if (fieldName.includes("Section11")) {
    if (result.section === 11) {
      console.log(`   ✅ SUCCESS: Section11 field correctly detected`);
    } else {
      console.log(`   ❌ ISSUE: Section11 field not detected correctly`);
    }
  }
});

console.log("\n🎯 Test completed!");
