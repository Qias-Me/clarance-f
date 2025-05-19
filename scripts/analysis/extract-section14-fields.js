const fs = require('fs');
const path = require('path');

// Function to read and parse the field-hierarchy.json file
function loadFieldHierarchy(filePath = 'reports/field-hierarchy.json') {
  try {
    const data = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading or parsing field hierarchy:', error);
    return null;
  }
}

// Function to extract fields related to section 14 (Selective Service)
function extractSection14Fields(fieldHierarchy) {
  const section14Fields = [];
  
  // Iterate through each page in the field hierarchy
  Object.keys(fieldHierarchy).forEach(page => {
    const pageData = fieldHierarchy[page];
    
    // Iterate through each field on the page
    Object.keys(pageData).forEach(fieldKey => {
      const field = pageData[fieldKey];
      
      // Check if the field has a section property equal to 14
      if (field.section === 14) {
        section14Fields.push({
          id: field.id,
          label: field.label || '',
          type: field.type || '',
          value: field.value || '',
          section: field.section,
          subsection: field.subsection || null,
          page: page,
          fieldKey: fieldKey
        });
      }
    });
  });
  
  return section14Fields;
}

// Function to organize fields by subsection
function organizeBySubsection(fields) {
  const bySubsection = {};
  
  fields.forEach(field => {
    const subsection = field.subsection || 'main';
    if (!bySubsection[subsection]) {
      bySubsection[subsection] = [];
    }
    bySubsection[subsection].push(field);
  });
  
  return bySubsection;
}

// Main execution
const fieldHierarchy = loadFieldHierarchy();
if (fieldHierarchy) {
  const section14Fields = extractSection14Fields(fieldHierarchy);
  const fieldsBySubsection = organizeBySubsection(section14Fields);
  
  console.log(`Found ${section14Fields.length} fields for Section 14 (Selective Service)`);
  
  // Log fields by subsection
  console.log('\nFields by Subsection:');
  Object.keys(fieldsBySubsection).forEach(subsection => {
    console.log(`\nSubsection ${subsection}: ${fieldsBySubsection[subsection].length} fields`);
    console.log('ID\tLabel\tType\tValue');
    console.log('------------------------------------------------------------');
    fieldsBySubsection[subsection].forEach(field => {
      console.log(`${field.id}\t${field.label}\t${field.type}\t${field.value}`);
    });
  });
  
  // Write the results to a JSON file
  const outputPath = path.resolve(process.cwd(), 'scripts/analysis/section14-fields.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ 
      fields: section14Fields,
      bySubsection: fieldsBySubsection
    }, null, 2)
  );
  
  console.log(`\nResults written to ${outputPath}`);
} else {
  console.log('Failed to load field hierarchy');
} 