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

// Main execution
try {
  console.log('Loading field hierarchy...');
  const fieldHierarchy = loadFieldHierarchy();
  
  if (!fieldHierarchy) {
    console.error('Failed to load field hierarchy data');
    process.exit(1);
  }
  
  console.log('Extracting fields for section 2...');
  const section2Fields = extractFieldsForSection(fieldHierarchy, 2);
  
  console.log(`Found ${section2Fields.length} fields in section 2:`);
  
  // Display field details
  section2Fields.forEach((field, index) => {
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
  
  // Save the results to a JSON file for reference
  const outputPath = 'scripts/analysis/section2-fields.json';
  fs.writeFileSync(outputPath, JSON.stringify(section2Fields, null, 2));
  console.log(`\nSection 2 fields saved to ${outputPath}`);
  
} catch (error) {
  console.error('Error:', error);
} 