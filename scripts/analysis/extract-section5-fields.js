import fs from 'fs';

// Function to read and parse the field-hierarchy.json file
function loadFieldHierarchy(filePath = 'reports/field-hierarchy.json') {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading field hierarchy:', error);
    return null;
  }
}

// Function to extract fields for a specific section
function extractFieldsForSection(fieldHierarchy, targetSection) {
  const sectionFields = [];
  
  // Helper function to recursively search for fields in nested objects
  function searchFieldsInObject(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    // Check if this is a field with a section property
    if (obj.section === targetSection && obj.id && obj.name) {
      sectionFields.push(obj);
      return;
    }
    
    // Check if this is an array of fields
    if (Array.isArray(obj)) {
      obj.forEach(item => searchFieldsInObject(item));
      return;
    }
    
    // Recursively search in all object properties
    Object.values(obj).forEach(value => searchFieldsInObject(value));
  }
  
  // Start the search from the root of the hierarchy
  searchFieldsInObject(fieldHierarchy);
  
  return sectionFields;
}

// Function to analyze and organize fields by form index patterns
function analyzeFieldPatterns(fields) {
  const patternGroups = {};
  
  fields.forEach(field => {
    // Try to extract form index from field name (e.g., form1[0].Sections1-6[0].section5[0].TextField11[1])
    // Look for patterns like "section5[0]", "section5[1]", etc.
    const sectionPattern = field.name.match(/section5\[\d+\]/);
    if (sectionPattern) {
      const pattern = sectionPattern[0];
      if (!patternGroups[pattern]) {
        patternGroups[pattern] = [];
      }
      patternGroups[pattern].push(field);
    } else {
      // If no section pattern found, put in "other" group
      if (!patternGroups['other']) {
        patternGroups['other'] = [];
      }
      patternGroups['other'].push(field);
    }
  });
  
  return patternGroups;
}

// Main execution
try {
  console.log('Loading field hierarchy...');
  const fieldHierarchy = loadFieldHierarchy();
  
  if (!fieldHierarchy) {
    console.error('Failed to load field hierarchy data');
    process.exit(1);
  }
  
  console.log('Extracting fields for section 5...');
  const section5Fields = extractFieldsForSection(fieldHierarchy, 5);
  
  console.log(`Found ${section5Fields.length} fields in section 5:`);
  
  // Display field details
  section5Fields.forEach((field, index) => {
    console.log(`\nField ${index + 1}:`);
    console.log(`  ID: ${field.id}`);
    console.log(`  Name: ${field.name}`);
    console.log(`  Label: ${field.label}`);
    console.log(`  Type: ${field.type}`);
    console.log(`  Value: ${field.value}`);
    console.log(`  Section: ${field.section}`);
    console.log(`  Section Name: ${field.sectionName}`);
    console.log(`  Confidence: ${field.confidence}`);
  });
  
  // Analyze field patterns to understand the repeating structure
  console.log('\nAnalyzing field patterns for repeating structures...');
  const patternGroups = analyzeFieldPatterns(section5Fields);
  
  console.log(`Found ${Object.keys(patternGroups).length} pattern groups:`);
  Object.entries(patternGroups).forEach(([pattern, fields]) => {
    console.log(`\nPattern: ${pattern}, Fields: ${fields.length}`);
    console.log(`Field IDs: ${fields.map(f => f.id).join(', ')}`);
  });
  
  // Save the results to a JSON file for reference
  const outputPath = 'scripts/analysis/section5-fields.json';
  fs.writeFileSync(outputPath, JSON.stringify(section5Fields, null, 2));
  console.log(`\nSection 5 fields saved to ${outputPath}`);
  
  // Save the pattern analysis for reference
  const patternOutputPath = 'scripts/analysis/section5-patterns.json';
  fs.writeFileSync(patternOutputPath, JSON.stringify(patternGroups, null, 2));
  console.log(`Pattern analysis saved to ${patternOutputPath}`);
  
} catch (error) {
  console.error('Error:', error);
} 