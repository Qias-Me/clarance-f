#!/usr/bin/env node

const fs = require('fs');

console.log("🔍 Analyzing Section 11 field distribution...");

try {
  // Read the categorized fields
  const data = fs.readFileSync('output/test13/categorized-fields.json', 'utf8');
  const fields = JSON.parse(data);
  
  console.log(`\n📊 Total fields: ${fields.length}`);
  
  // Find all fields currently assigned to Section 11
  const section11Fields = fields.filter(field => field.section === 11);
  console.log(`\n📊 Section 11 current count: ${section11Fields.length} (expected: 183)`);
  console.log(`   Over-allocation: +${section11Fields.length - 183} fields`);
  
  // Analyze field name patterns in Section 11
  const namePatterns = {};
  section11Fields.forEach(field => {
    // Extract pattern from field name
    let pattern = field.name;
    
    // Simplify patterns
    pattern = pattern.replace(/\[\d+\]/g, '[N]'); // Replace numbers with N
    pattern = pattern.replace(/form1\[N\]\./, ''); // Remove form prefix
    
    if (!namePatterns[pattern]) {
      namePatterns[pattern] = [];
    }
    namePatterns[pattern].push(field);
  });
  
  console.log(`\n📊 Field name patterns in Section 11:`);
  Object.entries(namePatterns)
    .sort((a, b) => b[1].length - a[1].length) // Sort by count
    .slice(0, 10) // Top 10 patterns
    .forEach(([pattern, fields]) => {
      console.log(`   ${pattern}: ${fields.length} fields`);
      
      // Show a few examples
      if (fields.length > 0) {
        console.log(`     Examples: ${fields.slice(0, 3).map(f => f.name).join(', ')}`);
      }
    });
  
  // Check for fields that might belong to other sections
  console.log(`\n🔍 Checking for potentially misplaced fields in Section 11:`);
  
  // Look for fields that might belong to Section 15 (Military History)
  const potentialSection15 = section11Fields.filter(field => 
    field.name.includes('Section14_1') || 
    field.name.includes('military') ||
    field.name.includes('service') ||
    field.name.includes('branch')
  );
  
  if (potentialSection15.length > 0) {
    console.log(`   🎯 Fields that might belong to Section 15: ${potentialSection15.length}`);
    potentialSection15.slice(0, 5).forEach(field => {
      console.log(`     - ${field.name} (ID: ${field.id})`);
    });
  }
  
  // Look for fields that might belong to Section 12 (Education)
  const potentialSection12 = section11Fields.filter(field => 
    field.name.includes('school') ||
    field.name.includes('education') ||
    field.name.includes('degree') ||
    field.name.includes('section_12')
  );
  
  if (potentialSection12.length > 0) {
    console.log(`   🎯 Fields that might belong to Section 12: ${potentialSection12.length}`);
    potentialSection12.slice(0, 5).forEach(field => {
      console.log(`     - ${field.name} (ID: ${field.id})`);
    });
  }
  
  // Check healing status
  const healedFields = section11Fields.filter(field => field.wasMovedByHealing);
  const explicitFields = section11Fields.filter(field => field.isExplicitlyDetected);
  
  console.log(`\n📊 Section 11 field categorization methods:`);
  console.log(`   Moved by healing: ${healedFields.length}`);
  console.log(`   Explicitly detected: ${explicitFields.length}`);
  console.log(`   Other: ${section11Fields.length - healedFields.length - explicitFields.length}`);
  
  // Check page distribution
  const pageDistribution = {};
  section11Fields.forEach(field => {
    const page = field.page || 'unknown';
    pageDistribution[page] = (pageDistribution[page] || 0) + 1;
  });
  
  console.log(`\n📊 Section 11 page distribution:`);
  Object.entries(pageDistribution)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([page, count]) => {
      console.log(`   Page ${page}: ${count} fields`);
    });
  
  // Expected page range for Section 11 is 10-13
  const expectedPages = [10, 11, 12, 13];
  const fieldsInExpectedPages = section11Fields.filter(field => 
    expectedPages.includes(field.page)
  );
  const fieldsOutsideExpectedPages = section11Fields.filter(field => 
    !expectedPages.includes(field.page)
  );
  
  console.log(`\n📊 Section 11 page range analysis:`);
  console.log(`   Fields in expected pages (10-13): ${fieldsInExpectedPages.length}`);
  console.log(`   Fields outside expected pages: ${fieldsOutsideExpectedPages.length}`);
  
  if (fieldsOutsideExpectedPages.length > 0) {
    console.log(`   Examples of fields outside expected pages:`);
    fieldsOutsideExpectedPages.slice(0, 5).forEach(field => {
      console.log(`     - Page ${field.page}: ${field.name}`);
    });
  }
  
} catch (error) {
  console.error("Error:", error.message);
}
