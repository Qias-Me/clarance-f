/**
 * Section 16 Field Mapping Validation
 * 
 * This script tests whether the field mappings work correctly by directly 
 * simulating the data flow that would happen when filling out section 16 forms.
 */

const fs = require('fs');
const path = require('path');

// The paths to our JSON file and TypeScript file
const SECTION16_JSON_PATH = path.join(__dirname, 'api', 'sections-references', 'section-16.json');
const SECTION16_TS_PATH = path.join(__dirname, 'api', 'interfaces', 'sections2.0', 'section16.ts');

// Function to read the JSON file
function readSection16Json() {
  try {
    const content = fs.readFileSync(SECTION16_JSON_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading section-16.json: ${error.message}`);
    return null;
  }
}

// Function to read the TypeScript file
function readSection16Ts() {
  try {
    const content = fs.readFileSync(SECTION16_TS_PATH, 'utf8');
    return content;
  } catch (error) {
    console.error(`Error reading section16.ts: ${error.message}`);
    return null;
  }
}

// Extract all field references from TypeScript file
function extractFieldReferences(tsContent) {
  const references = [];
  const regex = /createFieldFromReference\(16,\s*['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = regex.exec(tsContent)) !== null) {
    references.push(match[1]);
  }
  
  return [...new Set(references)]; // Remove duplicates
}

// Validate field mappings
function validateFieldMappings() {
  console.log('\n--- SECTION 16 FIELD MAPPING VALIDATION ---\n');
  
  // Step 1: Load the JSON data
  const section16Json = readSection16Json();
  if (!section16Json) {
    console.error('❌ Failed to load section-16.json');
    process.exit(1);
  }
  
  // Step 2: Load the TypeScript data
  const section16Ts = readSection16Ts();
  if (!section16Ts) {
    console.error('❌ Failed to load section16.ts');
    process.exit(1);
  }
  
  // Step 3: Extract available field names from JSON
  const availableFields = new Set(section16Json.fields.map(f => f.name));
  console.log(`Found ${availableFields.size} fields in section-16.json`);
  
  // Step 4: Extract field references from TypeScript
  const fieldReferences = extractFieldReferences(section16Ts);
  console.log(`Found ${fieldReferences.length} unique field references in section16.ts`);
  
  // Check which sections exist in the JSON
  const sections = new Set();
  availableFields.forEach(name => {
    const match = name.match(/Section16_(\d+)/);
    if (match) {
      sections.add(match[1]);
    }
  });
  console.log(`Available sections: ${Array.from(sections).join(', ')}`);
  
  // Count fields in each section
  const sectionCounts = {};
  availableFields.forEach(name => {
    const match = name.match(/Section16_(\d+)/);
    if (match) {
      const section = match[1];
      sectionCounts[section] = (sectionCounts[section] || 0) + 1;
    }
  });
  
  console.log('\nField count by section:');
  Object.entries(sectionCounts).forEach(([section, count]) => {
    console.log(`  Section16_${section}: ${count} fields`);
  });
  
  // Step 5: Check for Section16_2 references
  const section16_2References = fieldReferences.filter(ref => ref.includes('Section16_2'));
  if (section16_2References.length > 0) {
    console.error('\n❌ ERROR: Found references to non-existent Section16_2:');
    section16_2References.forEach(ref => console.error(`  - ${ref}`));
  } else {
    console.log('\n✅ No references to non-existent Section16_2');
  }
  
  // Step 6: Check for missing field references
  const missingReferences = fieldReferences.filter(ref => !availableFields.has(ref));
  if (missingReferences.length > 0) {
    console.error('\n❌ ERROR: Found missing field references:');
    missingReferences.forEach(ref => console.error(`  - ${ref}`));
    console.log(`\n❌ VALIDATION FAILED: ${missingReferences.length} field references are missing`);
    process.exit(1);
  } else {
    console.log('\n✅ All field references exist in the JSON');
  }
  
  // Step 7: Check specifically for previous problematic references
  const contactEmailRef = fieldReferences.find(ref => ref.includes('Section16_3[0].TextField11[33]'));
  if (contactEmailRef) {
    console.error('\n❌ ERROR: Found problematic contactEmail reference:');
    console.error(`  - ${contactEmailRef}`);
    console.log('\n❌ VALIDATION FAILED: contactEmail field is still using TextField11[33]');
    process.exit(1);
  } else {
    console.log('\n✅ contactEmail field is no longer using TextField11[33]');
  }
  
  // Final result
  console.log('\n🎉 SUCCESS: All Section 16 field mappings are valid');
  console.log('\nThese fixes will prevent "Field not found in section 16" errors when adding foreign activities to the form.');
}

// Run validation
validateFieldMappings(); 