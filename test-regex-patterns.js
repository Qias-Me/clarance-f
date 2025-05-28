#!/usr/bin/env node

// Test script to verify regex patterns for Section 11 and Section 15

const fieldName = "form1[0].Section11[0].From_Datefield_Name_2[2]";

console.log("Testing regex patterns for field:", fieldName);
console.log("=" .repeat(60));

// Section 11 patterns
console.log("\n🔍 Section 11 Patterns:");

// Pattern 1: form1\\[0\\]\\.Section11 (from TypeScript file)
const section11Pattern1 = /form1\[0\]\.Section11/i;
console.log(`Pattern: ${section11Pattern1}`);
console.log(`Matches: ${section11Pattern1.test(fieldName)}`);

// Pattern 2: sect11 (from TypeScript file)
const section11Pattern2 = /sect11/i;
console.log(`Pattern: ${section11Pattern2}`);
console.log(`Matches: ${section11Pattern2.test(fieldName)}`);

// Section 15 patterns
console.log("\n🔍 Section 15 Patterns:");

// Pattern 1: ^form1[0] (generic pattern)
const section15Pattern1 = /^form1\[0\]/;
console.log(`Pattern: ${section15Pattern1}`);
console.log(`Matches: ${section15Pattern1.test(fieldName)}`);

// Pattern 2: dropdown
const section15Pattern2 = /dropdown/i;
console.log(`Pattern: ${section15Pattern2}`);
console.log(`Matches: ${section15Pattern2.test(fieldName)}`);

console.log("\n📊 Analysis:");
console.log("=" .repeat(60));

if (section11Pattern1.test(fieldName)) {
    console.log("✅ Section 11 specific pattern matches (confidence: 0.9)");
} else {
    console.log("❌ Section 11 specific pattern does NOT match");
}

if (section15Pattern1.test(fieldName)) {
    console.log("⚠️  Section 15 generic pattern also matches (confidence: 0.85)");
} else {
    console.log("✅ Section 15 generic pattern does NOT match");
}

console.log("\n🎯 Expected Behavior:");
console.log("The Section 11 specific pattern (0.9 confidence) should override");
console.log("the Section 15 generic pattern (0.85 confidence).");

console.log("\n🔧 Testing rule processing order simulation:");

let bestSection = 0;
let bestConfidence = 0;

// Simulate Section 15 rule being processed first
if (section15Pattern1.test(fieldName)) {
    console.log("1. Section 15 generic rule matches (confidence: 0.85)");
    if (0.85 > bestConfidence) {
        bestSection = 15;
        bestConfidence = 0.85;
        console.log("   → Field assigned to Section 15");
    }
}

// Simulate Section 11 rule being processed second
if (section11Pattern1.test(fieldName)) {
    console.log("2. Section 11 specific rule matches (confidence: 0.9)");
    if (0.9 > bestConfidence) {
        bestSection = 11;
        bestConfidence = 0.9;
        console.log("   → Field reassigned to Section 11 (higher confidence)");
    } else {
        console.log("   → Field stays in Section 15 (should not happen!)");
    }
}

console.log(`\n🏁 Final Result: Section ${bestSection} with confidence ${bestConfidence}`);

if (bestSection === 11) {
    console.log("✅ CORRECT: Field should be in Section 11");
} else {
    console.log("❌ INCORRECT: Field should be in Section 11, not Section " + bestSection);
}

console.log("\n🐛 If the field is still in Section 15, possible issues:");
console.log("1. Section 11 rules are not being loaded properly");
console.log("2. Rule processing order is incorrect");
console.log("3. Confidence comparison logic has a bug");
console.log("4. Self-healing process is overriding the correct classification");
