const fs = require('fs');

try {
  // Read just a portion of the file to avoid memory issues
  const data = fs.readFileSync('reports/field-hierarchy.json', 'utf8');
  
  // Find a complete field entry
  const fieldMatch = data.match(/"name":\s*"[^"]+",\s*"id":\s*"[^"]+",\s*"label":\s*"[^"]+",\s*"value":\s*"[^"]+",\s*"type":\s*"[^"]+",\s*"section":\s*\d+,\s*"sectionName":\s*"[^"]+",\s*"confidence":\s*[\d\.]+/);
  
  if (fieldMatch) {
    console.log('Sample field entry found:');
    console.log('{' + fieldMatch[0] + '}');
  } else {
    console.log('No complete field entry found in the expected format.');
    
    // Try to find individual properties
    const nameMatch = data.match(/"name":\s*"([^"]+)"/);
    const idMatch = data.match(/"id":\s*"([^"]+)"/);
    const labelMatch = data.match(/"label":\s*"([^"]+)"/);
    const valueMatch = data.match(/"value":\s*"([^"]+)"/);
    const typeMatch = data.match(/"type":\s*"([^"]+)"/);
    const sectionMatch = data.match(/"section":\s*(\d+)/);
    const sectionNameMatch = data.match(/"sectionName":\s*"([^"]+)"/);
    const confidenceMatch = data.match(/"confidence":\s*([\d\.]+)/);
    
    console.log('Individual properties found:');
    if (nameMatch) console.log('name:', nameMatch[1]);
    if (idMatch) console.log('id:', idMatch[1]);
    if (labelMatch) console.log('label:', labelMatch[1]);
    if (valueMatch) console.log('value:', valueMatch[1]);
    if (typeMatch) console.log('type:', typeMatch[1]);
    if (sectionMatch) console.log('section:', sectionMatch[1]);
    if (sectionNameMatch) console.log('sectionName:', sectionNameMatch[1]);
    if (confidenceMatch) console.log('confidence:', confidenceMatch[1]);
  }
} catch (err) {
  console.error('Error:', err);
} 