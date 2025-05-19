const fs = require('fs');

try {
  // Read the field-hierarchy.json file
  const data = fs.readFileSync('reports/field-hierarchy.json', 'utf8');
  
  // Parse the JSON data
  const fieldHierarchy = JSON.parse(data);
  
  // Get a sample entry to examine structure
  let sampleEntry = null;
  
  // Find the first field in the hierarchy
  for (const pageKey in fieldHierarchy) {
    if (fieldHierarchy[pageKey].fields && fieldHierarchy[pageKey].fields.length > 0) {
      sampleEntry = fieldHierarchy[pageKey].fields[0];
      break;
    } else if (fieldHierarchy[pageKey].regex && fieldHierarchy[pageKey].fields) {
      sampleEntry = fieldHierarchy[pageKey].fields[0];
      break;
    }
  }
  
  // Display the sample entry structure
  console.log('Sample Field Entry Structure:');
  console.log(JSON.stringify(sampleEntry, null, 2));
  
  // Count fields by section
  const fieldsBySection = {};
  let totalFields = 0;
  
  // Function to process fields from any level
  const processFields = (fields) => {
    if (!Array.isArray(fields)) return;
    
    fields.forEach(field => {
      totalFields++;
      
      if (field.section) {
        fieldsBySection[field.section] = fieldsBySection[field.section] || {
          count: 0,
          name: field.sectionName || `Unknown Section ${field.section}`
        };
        fieldsBySection[field.section].count++;
      }
    });
  };
  
  // Process all fields in the hierarchy
  for (const pageKey in fieldHierarchy) {
    if (fieldHierarchy[pageKey].fields) {
      processFields(fieldHierarchy[pageKey].fields);
    }
  }
  
  // Display the section summary
  console.log('\nFields by Section:');
  Object.keys(fieldsBySection).sort((a, b) => parseInt(a) - parseInt(b)).forEach(sectionNumber => {
    const section = fieldsBySection[sectionNumber];
    console.log(`Section ${sectionNumber} (${section.name}): ${section.count} fields`);
  });
  
  console.log(`\nTotal fields: ${totalFields}`);
  
} catch (err) {
  console.error('Error:', err);
} 