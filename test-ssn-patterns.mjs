#!/usr/bin/env node

// Test SSN pattern matching
console.log("🧪 Testing SSN Pattern Matching...");

const testField = "form1[0].Section18_3[5].SSN[0]";

const ssnPatterns = [
  /\.SSN\[\d+\]/i,                                    // Basic SSN pattern
  /form1\[0\]\.Sections1-6\[0\]\.SSN\[\d+\]/i,       // Sections1-6 SSN fields
  /form1\[0\]\.Sections7-9\[0\]\.SSN\[\d+\]/i,       // Sections7-9 SSN fields
  /form1\[0\]\.Section\d+.*\.SSN\[\d+\]/i,           // Any Section with SSN
  /form1\[0\]\.section\d+.*\.SSN\[\d+\]/i,           // Any section with SSN (lowercase)
  /form1\[0\]\.#subform\[\d+\]\.SSN\[\d+\]/i,        // Subform SSN fields
  /form1\[0\]\.#subform\[\d+\]\.#subform\[\d+\]\.SSN\[\d+\]/i, // Nested subform SSN
  /form1\[0\]\.continuation\d*\[0\]\.SSN\[\d+\]/i,   // Continuation SSN fields
  /form1\[0\]\.Section_\d+.*\.SSN\[\d+\]/i,          // Section_ format SSN fields
  /form1\[0\]\.Section18_3\[5\]\.SSN\[0\]/i,         // Specific field
  /form1\[0\]\.Section18_\d+\[\d+\]\.SSN\[\d+\]/i,   // All Section18_X[Y].SSN[Z] patterns
  /form1\[0\]\.Section\d+_\d+\[\d+\]\.SSN\[\d+\]/i,  // All SectionX_Y[Z].SSN[W] patterns
];

const section18Patterns = [
  /form1\[0\]\.Section18/i,
  /form1\[0\]\.section18/i,
];

console.log(`\n🔍 Testing field: ${testField}`);

console.log("\n📊 SSN Pattern Results (Section 4):");
ssnPatterns.forEach((pattern, index) => {
  const matches = pattern.test(testField);
  console.log(`${index + 1}. ${pattern.toString()} → ${matches ? '✅ MATCH' : '❌ NO MATCH'}`);
});

console.log("\n📊 Section 18 Pattern Results:");
section18Patterns.forEach((pattern, index) => {
  const matches = pattern.test(testField);
  console.log(`${index + 1}. ${pattern.toString()} → ${matches ? '✅ MATCH' : '❌ NO MATCH'}`);
});

console.log("\n🎯 Analysis:");
console.log("- If ANY SSN pattern matches, the field should go to Section 4");
console.log("- If Section 18 patterns match but SSN patterns also match, SSN should win");
console.log("- The issue might be in the pattern processing order in the engine");

// Test the specific problematic pattern
const problematicPattern = /form1\[0\]\.Section\d+.*\.SSN\[\d+\]/i;
console.log(`\n🔍 Testing problematic pattern: ${problematicPattern.toString()}`);
console.log(`Field: ${testField}`);
console.log(`Match: ${problematicPattern.test(testField) ? '✅ MATCH' : '❌ NO MATCH'}`);

// Break down the pattern
console.log("\n🔍 Pattern breakdown:");
console.log("- form1\\[0\\] → matches 'form1[0]'");
console.log("- Section\\d+ → matches 'Section18'");  
console.log("- .* → matches '_3[5]'");
console.log("- SSN\\[\\d+\\] → matches 'SSN[0]'");

// Test each part
const parts = [
  { name: "form1[0]", pattern: /form1\[0\]/, text: "form1[0]" },
  { name: "Section18", pattern: /Section\d+/, text: "Section18" },
  { name: "_3[5]", pattern: /.*/, text: "_3[5]" },
  { name: "SSN[0]", pattern: /SSN\[\d+\]/, text: "SSN[0]" }
];

console.log("\n🔍 Testing pattern parts:");
parts.forEach(part => {
  const matches = part.pattern.test(part.text);
  console.log(`${part.name}: ${part.pattern.toString()} → ${matches ? '✅ MATCH' : '❌ NO MATCH'}`);
});

console.log("\n🎯 Test completed!");
