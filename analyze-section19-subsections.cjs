const fs = require('fs');
const data = JSON.parse(fs.readFileSync('api/sections-references/section-19.json', 'utf8'));

console.log('=== SECTION 19 SUBSECTION ANALYSIS ===');

const subsections = {};
data.fields.forEach(field => {
  const match = field.name.match(/Section19_(\d+)\[0\]/);
  if (match) {
    const subsectionNum = match[1];
    if (!subsections[subsectionNum]) subsections[subsectionNum] = [];
    subsections[subsectionNum].push(field.name);
  }
});

Object.keys(subsections).sort().forEach(subsection => {
  console.log(`Section19_${subsection}: ${subsections[subsection].length} fields`);
});

console.log('\n=== SAMPLE FIELDS FROM EACH SUBSECTION ===');
Object.keys(subsections).sort().forEach(subsection => {
  console.log(`\nSection19_${subsection} (first 5 fields):`);
  [...new Set(subsections[subsection])].slice(0, 5).forEach(field => {
    console.log(`  - ${field}`);
  });
});

console.log('\n=== UNIQUE FIELDS BY SUBSECTION ===');
Object.keys(subsections).sort().forEach(subsection => {
  const uniqueFields = [...new Set(subsections[subsection])];
  console.log(`Section19_${subsection}: ${uniqueFields.length} unique fields`);
});
