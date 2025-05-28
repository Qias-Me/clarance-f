#!/usr/bin/env node

// Simple test to verify conflict detection logic

console.log("Testing conflict detection logic...");

// Mock MatchRule interface
class MockMatchRule {
  constructor(pattern, section, confidence, description) {
    this.pattern = new RegExp(pattern);
    this.section = section;
    this.confidence = confidence;
    this.description = description;
  }
}

// Mock the conflict detection logic
function removeConflictingGenericRules(allRules) {
  console.log("🔍 Detecting and removing conflicting generic rules...");
  
  // Track patterns that appear in multiple sections with same confidence
  const patternTracker = new Map();
  
  // First pass: collect all patterns and their sections
  for (const [section, rules] of allRules.entries()) {
    for (const rule of rules) {
      const patternKey = `${rule.pattern.source}_${rule.pattern.flags}`;
      
      if (!patternTracker.has(patternKey)) {
        patternTracker.set(patternKey, []);
      }
      
      patternTracker.get(patternKey).push({
        section,
        confidence: rule.confidence,
        rule
      });
    }
  }
  
  // Second pass: identify conflicting patterns
  const conflictingPatterns = new Set();
  const genericPatternsToRemove = new Set();
  
  for (const [patternKey, occurrences] of patternTracker.entries()) {
    if (occurrences.length > 1) {
      // Check if it's a generic pattern that appears in multiple sections
      const pattern = occurrences[0].rule.pattern.source;
      const isGenericPattern = 
        pattern.startsWith('^form1[0]') ||
        pattern.startsWith('^form1\\[0\\]') ||
        pattern === 'text' ||
        pattern === 'dropdown' ||
        pattern.match(/^form\d*\[/);
      
      if (isGenericPattern) {
        // Check if they have similar confidence levels (within 0.1)
        const confidences = occurrences.map(o => o.confidence);
        const minConf = Math.min(...confidences);
        const maxConf = Math.max(...confidences);
        
        if (maxConf - minConf <= 0.1) {
          console.log(`❌ Found conflicting generic pattern: ${pattern}`);
          console.log(`   Appears in sections: ${occurrences.map(o => o.section).join(', ')}`);
          console.log(`   Confidence range: ${minConf} - ${maxConf}`);
          
          conflictingPatterns.add(patternKey);
          genericPatternsToRemove.add(pattern);
        }
      }
    }
  }
  
  // Third pass: remove conflicting generic patterns
  const cleanedRules = new Map();
  let totalRemoved = 0;
  
  for (const [section, rules] of allRules.entries()) {
    const filteredRules = rules.filter(rule => {
      const patternKey = `${rule.pattern.source}_${rule.pattern.flags}`;
      const shouldRemove = conflictingPatterns.has(patternKey);
      
      if (shouldRemove) {
        console.log(`🗑️  Removing conflicting rule from section ${section}: ${rule.pattern.source} (confidence: ${rule.confidence})`);
        totalRemoved++;
      }
      
      return !shouldRemove;
    });
    
    cleanedRules.set(section, filteredRules);
  }
  
  console.log(`✅ Removed ${totalRemoved} conflicting generic rules from ${conflictingPatterns.size} patterns`);
  
  if (genericPatternsToRemove.size > 0) {
    console.log("📋 Removed patterns:", Array.from(genericPatternsToRemove).join(', '));
  }
  
  return cleanedRules;
}

// Test data - simulate the conflicting rules
const testRules = new Map();

// Section 11 rules
testRules.set(11, [
  new MockMatchRule('^form1[0]', 11, 0.85, 'Generic form1[0] pattern for section 11'),
  new MockMatchRule('form1\\[0\\]\\.Section11', 11, 0.9, 'Specific Section11 pattern'),
  new MockMatchRule('sect11', 11, 0.9, 'Section 11 abbreviation')
]);

// Section 15 rules
testRules.set(15, [
  new MockMatchRule('^form1[0]', 15, 0.85, 'Generic form1[0] pattern for section 15'),
  new MockMatchRule('military.*history', 15, 0.85, 'Military history pattern')
]);

// Section 14 rules
testRules.set(14, [
  new MockMatchRule('^form1[0]', 14, 0.85, 'Generic form1[0] pattern for section 14'),
  new MockMatchRule('text', 14, 0.75, 'Text pattern')
]);

console.log("\n📊 Before conflict detection:");
for (const [section, rules] of testRules.entries()) {
  console.log(`Section ${section}: ${rules.length} rules`);
  rules.forEach(rule => {
    console.log(`  - ${rule.pattern.source} (confidence: ${rule.confidence})`);
  });
}

// Apply conflict detection
const cleanedRules = removeConflictingGenericRules(testRules);

console.log("\n📊 After conflict detection:");
for (const [section, rules] of cleanedRules.entries()) {
  console.log(`Section ${section}: ${rules.length} rules`);
  rules.forEach(rule => {
    console.log(`  - ${rule.pattern.source} (confidence: ${rule.confidence})`);
  });
}

console.log("\n✅ Test completed!");

// Test the specific case mentioned by the user
console.log("\n🧪 Testing specific field case:");
const fieldName = "form1[0].Section11[0].From_Datefield_Name_2[2]";

console.log(`Field name: ${fieldName}`);

// Test against remaining rules
for (const [section, rules] of cleanedRules.entries()) {
  for (const rule of rules) {
    if (rule.pattern.test(fieldName)) {
      console.log(`✅ Matches Section ${section} rule: ${rule.pattern.source} (confidence: ${rule.confidence})`);
    }
  }
}
