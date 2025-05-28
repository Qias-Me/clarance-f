#!/usr/bin/env node

// Test the regex patterns directly

const fieldName = "form1[0].Section11[0].From_Datefield_Name_2[2]";
const normalizedName = fieldName.toLowerCase().trim();

console.log("🔍 Testing regex patterns with field:", fieldName);
console.log("🔍 Normalized field:", normalizedName);
console.log("=" .repeat(60));

// Test the patterns from EncapsulatedFieldParser

// 1. Explicit section pattern
console.log("\n1. Testing parseExplicitSection pattern:");
const explicitPattern = /\bsection[_\s-]*(\d+)\b/i;
console.log(`   Pattern: ${explicitPattern.source}`);
const explicitMatch = normalizedName.match(explicitPattern);
console.log(`   Match: ${explicitMatch ? `Found: ${explicitMatch[0]}, captured: ${explicitMatch[1]}` : 'No match'}`);

// 2. Form section entry pattern
console.log("\n2. Testing parseFormSection entry pattern:");
const formSectionEntryPattern = /form\d+\[\d+\]\.section(\d+)_(\d+)\[\d+\]/i;
console.log(`   Pattern: ${formSectionEntryPattern.source}`);
const entryMatch = normalizedName.match(formSectionEntryPattern);
console.log(`   Match: ${entryMatch ? `Found: ${entryMatch[0]}, captured: ${entryMatch[1]}, ${entryMatch[2]}` : 'No match'}`);

// 3. Form section pattern
console.log("\n3. Testing parseFormSection pattern:");
const formSectionPattern = /form\d+\[\d+\]\.section(\d+)\[\d+\]/i;
console.log(`   Pattern: ${formSectionPattern.source}`);
const sectionMatch = normalizedName.match(formSectionPattern);
console.log(`   Match: ${sectionMatch ? `Found: ${sectionMatch[0]}, captured: ${sectionMatch[1]}` : 'No match'}`);

// 4. Section with subsection pattern
console.log("\n4. Testing parseSectionWithSubsection pattern:");
const sectionSubsectionPattern = /\bsection(\d+)([a-h])(\d*)\b/i;
console.log(`   Pattern: ${sectionSubsectionPattern.source}`);
const subsectionMatch = normalizedName.match(sectionSubsectionPattern);
console.log(`   Match: ${subsectionMatch ? `Found: ${subsectionMatch[0]}, captured: ${subsectionMatch[1]}, ${subsectionMatch[2]}, ${subsectionMatch[3]}` : 'No match'}`);

console.log("\n🎯 ANALYSIS:");
if (explicitMatch) {
  console.log("✅ Should be detected by parseExplicitSection");
} else if (sectionMatch) {
  console.log("✅ Should be detected by parseFormSection");
} else {
  console.log("❌ No pattern should match - this is the problem!");
}

console.log("\nTest completed.");
