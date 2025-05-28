/**
 * Test and Validation Script for SF-86 Field Distribution
 * 
 * This script tests the capacity-aware field categorization improvements
 * to ensure proper field distribution and reduced over-allocation.
 */

import { extractFields } from "./utils/extractFieldsBySection.js";
import { RuleEngine } from "./engine.js";
import { expectedFieldCounts, createSectionCapacityInfo } from "./utils/field-clusterer.js";
import type { CategorizedField } from "./utils/extractFieldsBySection.js";

interface TestResults {
  totalFields: number;
  expectedTotal: number;
  sectionDistribution: Record<number, number>;
  overAllocatedSections: Array<{
    section: number;
    current: number;
    expected: number;
    overBy: number;
    percentage: number;
  }>;
  underAllocatedSections: Array<{
    section: number;
    current: number;
    expected: number;
    underBy: number;
    percentage: number;
  }>;
  improvements: {
    section11Reduction: number;
    section12Reduction: number;
    section18Reduction: number;
    section20Reduction: number;
  };
}

/**
 * Test the field distribution with capacity-aware categorization
 */
async function testFieldDistribution(): Promise<TestResults> {
  console.log("🧪 Starting Field Distribution Test...");
  
  // Extract fields from the SF-86 PDF
  const inputPath = "C:\\Users\\Jason\\Desktop\\AI-Coding\\clarance-f\\src\\sf862.pdf";
  console.log(`📄 Extracting fields from: ${inputPath}`);
  
  const { fields } = await extractFields(inputPath, false);
  console.log(`📊 Extracted ${fields.length} total fields`);
  
  // Initialize rule engine
  console.log("🔧 Initializing rule engine...");
  const ruleEngine = new RuleEngine();
  await ruleEngine.loadRules();
  
  // Categorize fields using the enhanced logic
  console.log("🎯 Categorizing fields with capacity-aware logic...");
  const categorizedFields = await ruleEngine.categorizeFields(fields as CategorizedField[]);
  
  // Analyze results
  console.log("📈 Analyzing field distribution...");
  const results = analyzeFieldDistribution(categorizedFields);
  
  return results;
}

/**
 * Analyze the field distribution and compare against expected counts
 */
function analyzeFieldDistribution(fields: CategorizedField[]): TestResults {
  // Count fields per section
  const sectionDistribution: Record<number, number> = {};
  
  for (const field of fields) {
    const section = field.section || 0;
    sectionDistribution[section] = (sectionDistribution[section] || 0) + 1;
  }
  
  // Calculate expected total
  let expectedTotal = 0;
  for (const counts of Object.values(expectedFieldCounts)) {
    expectedTotal += counts.fields + counts.entries + counts.subsections;
  }
  
  // Identify over/under-allocated sections
  const overAllocatedSections: TestResults['overAllocatedSections'] = [];
  const underAllocatedSections: TestResults['underAllocatedSections'] = [];
  
  for (const [sectionStr, expectedCounts] of Object.entries(expectedFieldCounts)) {
    const section = parseInt(sectionStr, 10);
    const expectedCount = expectedCounts.fields + expectedCounts.entries + expectedCounts.subsections;
    const currentCount = sectionDistribution[section] || 0;
    
    if (currentCount > expectedCount * 1.1) {
      // Over-allocated (more than 110% of expected)
      overAllocatedSections.push({
        section,
        current: currentCount,
        expected: expectedCount,
        overBy: currentCount - expectedCount,
        percentage: ((currentCount - expectedCount) / expectedCount) * 100
      });
    } else if (currentCount < expectedCount * 0.9) {
      // Under-allocated (less than 90% of expected)
      underAllocatedSections.push({
        section,
        current: currentCount,
        expected: expectedCount,
        underBy: expectedCount - currentCount,
        percentage: ((expectedCount - currentCount) / expectedCount) * 100
      });
    }
  }
  
  // Calculate improvements for target sections
  const improvements = {
    section11Reduction: Math.max(0, (sectionDistribution[11] || 0) - expectedFieldCounts[11].fields),
    section12Reduction: Math.max(0, (sectionDistribution[12] || 0) - expectedFieldCounts[12].fields),
    section18Reduction: Math.max(0, (sectionDistribution[18] || 0) - expectedFieldCounts[18].fields),
    section20Reduction: Math.max(0, (sectionDistribution[20] || 0) - expectedFieldCounts[20].fields),
  };
  
  return {
    totalFields: fields.length,
    expectedTotal,
    sectionDistribution,
    overAllocatedSections: overAllocatedSections.sort((a, b) => b.overBy - a.overBy),
    underAllocatedSections: underAllocatedSections.sort((a, b) => b.underBy - a.underBy),
    improvements
  };
}

/**
 * Print detailed test results
 */
function printTestResults(results: TestResults): void {
  console.log("\n" + "=".repeat(60));
  console.log("📊 FIELD DISTRIBUTION TEST RESULTS");
  console.log("=".repeat(60));
  
  // Overall statistics
  console.log(`\n📈 OVERALL STATISTICS:`);
  console.log(`   Total Fields: ${results.totalFields}`);
  console.log(`   Expected Total: ${results.expectedTotal}`);
  console.log(`   Difference: ${results.totalFields - results.expectedTotal} (${results.totalFields === 6197 ? '✅ CORRECT' : '❌ INCORRECT'})`);
  
  // Over-allocated sections
  console.log(`\n⚠️  OVER-ALLOCATED SECTIONS (${results.overAllocatedSections.length}):`);
  if (results.overAllocatedSections.length === 0) {
    console.log(`   ✅ No over-allocated sections!`);
  } else {
    for (const section of results.overAllocatedSections) {
      console.log(`   Section ${section.section}: ${section.current}/${section.expected} (+${section.overBy}, +${section.percentage.toFixed(1)}%)`);
    }
  }
  
  // Under-allocated sections
  console.log(`\n📉 UNDER-ALLOCATED SECTIONS (${results.underAllocatedSections.length}):`);
  if (results.underAllocatedSections.length === 0) {
    console.log(`   ✅ No under-allocated sections!`);
  } else {
    for (const section of results.underAllocatedSections.slice(0, 10)) {
      console.log(`   Section ${section.section}: ${section.current}/${section.expected} (-${section.underBy}, -${section.percentage.toFixed(1)}%)`);
    }
    if (results.underAllocatedSections.length > 10) {
      console.log(`   ... and ${results.underAllocatedSections.length - 10} more`);
    }
  }
  
  // Target section improvements
  console.log(`\n🎯 TARGET SECTION IMPROVEMENTS:`);
  console.log(`   Section 11 over-allocation: ${results.improvements.section11Reduction} fields`);
  console.log(`   Section 12 over-allocation: ${results.improvements.section12Reduction} fields`);
  console.log(`   Section 18 over-allocation: ${results.improvements.section18Reduction} fields`);
  console.log(`   Section 20 over-allocation: ${results.improvements.section20Reduction} fields`);
  
  // Success criteria
  console.log(`\n✅ SUCCESS CRITERIA:`);
  console.log(`   Total field count maintained (6,197): ${results.totalFields === 6197 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Section 11 over-allocation reduced: ${results.improvements.section11Reduction < 70 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Section 12 over-allocation reduced: ${results.improvements.section12Reduction < 22 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Section 18 over-allocation reduced: ${results.improvements.section18Reduction < 1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Section 20 over-allocation reduced: ${results.improvements.section20Reduction < 581 ? '✅ PASS' : '❌ FAIL'}`);
}

/**
 * Main test execution
 */
async function main(): Promise<void> {
  try {
    const results = await testFieldDistribution();
    printTestResults(results);
    
    // Exit with appropriate code
    const allTestsPassed = 
      results.totalFields === 6197 &&
      results.improvements.section11Reduction < 70 &&
      results.improvements.section12Reduction < 22 &&
      results.improvements.section18Reduction < 1 &&
      results.improvements.section20Reduction < 581;
    
    if (allTestsPassed) {
      console.log(`\n🎉 ALL TESTS PASSED! Field distribution improvements are working correctly.`);
      process.exit(0);
    } else {
      console.log(`\n❌ SOME TESTS FAILED. Please review the field distribution logic.`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`\n💥 TEST EXECUTION FAILED:`, error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { testFieldDistribution, analyzeFieldDistribution, printTestResults };
