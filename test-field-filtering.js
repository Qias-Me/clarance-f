/**
 * SF-86 Field Filtering Test Script
 * 
 * This script tests the less restrictive field filtering logic in PDF generation.
 * It focuses on edge cases like empty strings, null values, and "NO" values.
 * 
 * Run with: node test-field-filtering.js
 */

// Mock imports for testing
const mockValues = [
  { id: "9557", name: "form1[0].Sections7-9[0].#field[45]", value: true }, // Regular boolean - should be included
  { id: "9558", name: "form1[0].Sections7-9[0].#field[44]", value: false }, // False boolean - should be included
  { id: "1001", name: "form1[0].TestSection[0].#field[1]", value: "" }, // Empty string - should now be included
  { id: "1002", name: "form1[0].TestSection[0].#field[2]", value: null }, // Null value - should now be included
  { id: "1003", name: "form1[0].TestSection[0].#field[3]", value: "NO" }, // "NO" string - should be included
  { id: "1004", name: "form1[0].TestSection[0].#field[4]", value: "NO (If NO, proceed to 29.2)" }, // "NO" with text - should be included
  { id: "1005", name: "form1[0].TestSection[0].#field[5]", value: 0 }, // Zero number - should be included
  { id: "", name: "form1[0].TestSection[0].#field[6]", value: "Test" }, // Missing ID - should still be filtered out
  { id: "1007", name: "form1[0].TestSection[0].#field[7]", value: undefined }, // Undefined value - should still be filtered out
];

// Mock the restrictive filter function (old behavior)
function restrictiveFilter(values) {
  return values.filter(value => 
    value.id && value.value !== undefined && value.value !== '' && value.value !== null
  );
}

// Mock the new less restrictive filter function (new behavior)
function lessRestrictiveFilter(values) {
  return values.filter(value => 
    value.id && value.value !== undefined
  );
}

// Run the test
console.log("===== SF-86 FIELD FILTERING TEST =====\n");
console.log(`Total test values: ${mockValues.length}`);

// Test old behavior
const oldFilteredValues = restrictiveFilter(mockValues);
console.log(`\nOld restrictive filter (BEFORE CHANGE):`);
console.log(`Values accepted: ${oldFilteredValues.length}/${mockValues.length}`);
console.log("Accepted values:");
oldFilteredValues.forEach((value, index) => {
  console.log(`  ${index + 1}. ID: "${value.id}", Value: "${value.value}" (${typeof value.value})`);
});

// Test new behavior
const newFilteredValues = lessRestrictiveFilter(mockValues);
console.log(`\nNew less restrictive filter (AFTER CHANGE):`);
console.log(`Values accepted: ${newFilteredValues.length}/${mockValues.length}`);
console.log("Accepted values:");
newFilteredValues.forEach((value, index) => {
  console.log(`  ${index + 1}. ID: "${value.id}", Value: "${value.value}" (${typeof value.value})`);
});

// Highlight the difference
const difference = newFilteredValues.length - oldFilteredValues.length;
console.log(`\nIMPROVEMENT: ${difference} more values accepted with new filter logic`);

// Show specific types that are now accepted
const emptyStrings = newFilteredValues.filter(v => v.value === "").length;
const nullValues = newFilteredValues.filter(v => v.value === null).length;
const noValues = newFilteredValues.filter(v => 
  typeof v.value === "string" && v.value.toUpperCase().startsWith("NO")
).length;
const zeroValues = newFilteredValues.filter(v => v.value === 0).length;

console.log("\nNEW VALUES ACCEPTED:");
console.log(`  - Empty strings: ${emptyStrings}`);
console.log(`  - Null values: ${nullValues}`);
console.log(`  - "NO" values: ${noValues}`);
console.log(`  - Zero values: ${zeroValues}`);

console.log("\n===== TEST COMPLETE ====="); 