const fs = require('fs');

// Load Section 19 reference data
const data = JSON.parse(fs.readFileSync('api/sections-references/section-19.json', 'utf8'));

// Extract unique field name patterns
const fieldNames = data.fields.map(f => f.name);
const uniqueNames = [...new Set(fieldNames)];

console.log('=== SECTION 19 FIELD ANALYSIS ===');
console.log('Total fields:', data.fields.length);
console.log('Unique field names:', uniqueNames.length);
console.log('');

// Group by field type patterns
const patterns = {};
uniqueNames.forEach(name => {
  // Extract the main pattern after Section19_1[0].
  const match = name.match(/Section19_1\[0\]\.(.+)/);
  if (match) {
    const pattern = match[1];
    const basePattern = pattern.replace(/\[\d+\]/g, '[N]');
    if (!patterns[basePattern]) patterns[basePattern] = [];
    patterns[basePattern].push(pattern);
  }
});

console.log('=== UNIQUE FIELD PATTERNS ===');
Object.keys(patterns).sort().forEach(pattern => {
  console.log(`${pattern} (${patterns[pattern].length} variations)`);
  if (patterns[pattern].length <= 5) {
    patterns[pattern].forEach(variation => console.log(`  - ${variation}`));
  } else {
    patterns[pattern].slice(0, 3).forEach(variation => console.log(`  - ${variation}`));
    console.log(`  ... and ${patterns[pattern].length - 3} more`);
  }
  console.log('');
});

// Analyze field types
console.log('=== FIELD TYPE ANALYSIS ===');
const fieldTypes = {};
data.fields.forEach(field => {
  if (!fieldTypes[field.type]) fieldTypes[field.type] = 0;
  fieldTypes[field.type]++;
});

Object.keys(fieldTypes).sort().forEach(type => {
  console.log(`${type}: ${fieldTypes[type]} fields`);
});

console.log('');

// Analyze labels to understand field purposes
console.log('=== FIELD LABEL ANALYSIS (First 20) ===');
const uniqueLabels = [...new Set(data.fields.map(f => f.label))];
uniqueLabels.slice(0, 20).forEach(label => {
  console.log(`- ${label}`);
});

if (uniqueLabels.length > 20) {
  console.log(`... and ${uniqueLabels.length - 20} more unique labels`);
}
