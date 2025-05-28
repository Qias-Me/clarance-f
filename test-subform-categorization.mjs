#!/usr/bin/env node

// Test the enhanced #subform categorization logic
console.log("🧪 Testing Enhanced #subform Categorization...");

// Mock the CategorizedField interface
const createMockField = (name, page = 0, value = "", label = "") => ({
  name,
  page,
  value,
  label,
  section: 0,
  confidence: 0,
  isExplicitlyDetected: false,
  wasMovedByHealing: false
});

// Test cases for different types of #subform fields
const testFields = [
  // Employment-related #subform fields (should go to Section 13)
  createMockField("form1[0].#subform[10].TextField11[5]", 25, "Microsoft Corporation", "Employer Name"),
  createMockField("form1[0].#subform[15].From_Datefield_Name_2[2]", 28, "01/2020", "Employment Start Date"),
  
  // Education-related #subform fields (should go to Section 12)
  createMockField("form1[0].#subform[5].TextField11[3]", 15, "Harvard University", "School Name"),
  createMockField("form1[0].#subform[8].DropDownList[1]", 16, "Bachelor's Degree", "Degree Type"),
  
  // Address/residence-related #subform fields (should go to Section 11)
  createMockField("form1[0].#subform[3].TextField11[1]", 12, "123 Main Street", "Address"),
  createMockField("form1[0].#subform[4].From_Datefield_Name_2[0]", 13, "06/2018", "Residence Start Date"),
  
  // Relatives-related #subform fields (should go to Section 18)
  createMockField("form1[0].#subform[70].TextField11[2]", 55, "John Smith", "Father Name"),
  createMockField("form1[0].#subform[75].suffix[5]", 58, "Jr.", "Relative Suffix"),
  
  // References-related #subform fields (should go to Section 16)
  createMockField("form1[0].#subform[20].TextField11[8]", 38, "Jane Doe", "Reference Name"),
  
  // Foreign contacts-related #subform fields (should go to Section 19)
  createMockField("form1[0].#subform[25].TextField11[4]", 65, "Pierre Dubois", "Foreign Contact"),
  
  // Ambiguous #subform fields (should go to Section 20 - continuation)
  createMockField("form1[0].#subform[99].#field[10]", 135, "", ""),
];

// Mock the page ranges (simplified version)
const sectionPageRanges = {
  11: [10, 13], // Where You Have Lived
  12: [14, 16], // Where you went to School
  13: [17, 33], // Employment Activities
  16: [38, 38], // People Who Know You Well
  18: [45, 62], // Relatives
  19: [63, 66], // Foreign Contacts
  20: [133, 136], // Continuation Space
};

// Simplified categorization logic for testing
function testCategorizeSubformField(field) {
  const fieldName = field.name || "";
  const fieldValue = field.value || "";
  const fieldLabel = field.label || "";
  const page = field.page || 0;
  
  console.log(`\n🔍 Testing: ${fieldName} (page: ${page})`);
  console.log(`   Value: "${fieldValue}"`);
  console.log(`   Label: "${fieldLabel}"`);
  
  // Page-based analysis
  let pageSection = 0;
  let pageConfidence = 0;
  
  for (const [sectionStr, [startPage, endPage]] of Object.entries(sectionPageRanges)) {
    const section = parseInt(sectionStr, 10);
    if (page >= startPage && page <= endPage) {
      pageSection = section;
      pageConfidence = 0.8;
      break;
    }
  }
  
  // Value-based analysis
  const combinedText = `${fieldValue} ${fieldLabel}`.toLowerCase();
  let valueSection = 0;
  let valueConfidence = 0;
  
  if (/\b(employer|employment|job|work|position|company)\b/i.test(combinedText)) {
    valueSection = 13;
    valueConfidence = 0.7;
  } else if (/\b(school|education|college|university|degree)\b/i.test(combinedText)) {
    valueSection = 12;
    valueConfidence = 0.7;
  } else if (/\b(address|residence|lived|home|street)\b/i.test(combinedText)) {
    valueSection = 11;
    valueConfidence = 0.7;
  } else if (/\b(relative|family|father|mother|sibling|child)\b/i.test(combinedText)) {
    valueSection = 18;
    valueConfidence = 0.7;
  } else if (/\b(reference|contact|know|friend)\b/i.test(combinedText)) {
    valueSection = 16;
    valueConfidence = 0.7;
  } else if (/\b(foreign|international|overseas)\b/i.test(combinedText)) {
    valueSection = 19;
    valueConfidence = 0.7;
  }
  
  // Combine analyses
  let finalSection = 20; // Default to continuation
  let finalConfidence = 0.3;
  let reason = "Default assignment to continuation section";
  
  if (pageSection > 0 && valueSection > 0 && pageSection === valueSection) {
    // Perfect match between page and value analysis
    finalSection = pageSection;
    finalConfidence = 0.9;
    reason = `Page and value analysis agree on Section ${finalSection}`;
  } else if (pageSection > 0 && pageConfidence >= 0.8) {
    // Strong page-based evidence
    finalSection = pageSection;
    finalConfidence = pageConfidence;
    reason = `Strong page-based evidence for Section ${finalSection}`;
  } else if (valueSection > 0 && valueConfidence >= 0.7) {
    // Strong value-based evidence
    finalSection = valueSection;
    finalConfidence = valueConfidence;
    reason = `Strong value-based evidence for Section ${finalSection}`;
  }
  
  console.log(`   📊 Page Analysis: Section ${pageSection} (confidence: ${pageConfidence})`);
  console.log(`   📊 Value Analysis: Section ${valueSection} (confidence: ${valueConfidence})`);
  console.log(`   ✅ RESULT: Section ${finalSection} (confidence: ${finalConfidence.toFixed(2)}) - ${reason}`);
  
  return {
    section: finalSection,
    confidence: finalConfidence,
    reason: reason
  };
}

// Run tests
console.log("📋 Running #subform categorization tests...\n");

const results = testFields.map(field => {
  const result = testCategorizeSubformField(field);
  return { field, result };
});

// Summary
console.log("\n📊 SUMMARY:");
const sectionCounts = {};
results.forEach(({ result }) => {
  sectionCounts[result.section] = (sectionCounts[result.section] || 0) + 1;
});

Object.entries(sectionCounts)
  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
  .forEach(([section, count]) => {
    const sectionName = {
      11: "Where You Have Lived",
      12: "Where you went to School", 
      13: "Employment Activities",
      16: "People Who Know You Well",
      18: "Relatives",
      19: "Foreign Contacts",
      20: "Continuation Space"
    }[section] || "Unknown";
    
    console.log(`   Section ${section} (${sectionName}): ${count} fields`);
  });

console.log("\n🎯 Test completed!");
