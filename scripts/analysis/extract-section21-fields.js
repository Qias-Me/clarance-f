import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Function to extract fields related to section 21 (Mental Health)
function extractSection21Fields(fieldHierarchy) {
  const section21Fields = [];
  
  // Create categories to organize fields
  const categories = {
    mentalIncompetence: [],     // Section 21A
    courtOrdered: [],           // Section 21B
    hospitalization: [],        // Section 21C
    diagnosis: [],              // Section 21D
    currentTreatment: [],       // Section 21D.1
    mentalHealthAffects: [],    // Section 21E
    general: [],                // General Section 21 fields
    unknown: []                 // Uncategorized fields
  };
  
  // Iterate through the field hierarchy to find section 21 fields
  if (fieldHierarchy) {
    // Handle either page-based or section-based structure
    if (fieldHierarchy.sections && fieldHierarchy.sections[21]) {
      // Direct section access
      const section21 = fieldHierarchy.sections[21];
      
      if (section21.fields && Array.isArray(section21.fields)) {
        section21.fields.forEach(field => {
          section21Fields.push(field);
          categorizeField(field, categories);
        });
      }
    } else {
      // Need to search through pages
      Object.keys(fieldHierarchy).forEach(page => {
        const pageData = fieldHierarchy[page];
        
        // Handle different field hierarchy structures
        if (pageData.fields && Array.isArray(pageData.fields)) {
          // Direct fields array
          pageData.fields.forEach(field => {
            if (field.section === 21) {
              section21Fields.push(field);
              categorizeField(field, categories);
            }
          });
        } else if (pageData.fieldsByValuePattern) {
          // Nested structure with patterns
          Object.values(pageData.fieldsByValuePattern).forEach(pattern => {
            if (pattern.fieldsByRegex) {
              Object.values(pattern.fieldsByRegex).forEach(regexData => {
                if (regexData.fields && Array.isArray(regexData.fields)) {
                  regexData.fields.forEach(field => {
                    if (field.section === 21) {
                      section21Fields.push(field);
                      categorizeField(field, categories);
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }
  
  // Analyze the fields
  const analysisResults = {
    totalFields: section21Fields.length,
    fieldsByCategory: {
      mentalIncompetence: categories.mentalIncompetence.length,
      courtOrdered: categories.courtOrdered.length,
      hospitalization: categories.hospitalization.length,
      diagnosis: categories.diagnosis.length,
      currentTreatment: categories.currentTreatment.length,
      mentalHealthAffects: categories.mentalHealthAffects.length,
      general: categories.general.length,
      unknown: categories.unknown.length
    },
    fieldTypes: countFieldTypes(section21Fields),
    uniqueLabels: extractUniqueLabels(section21Fields),
    categories: categories
  };
  
  return {
    fields: section21Fields,
    analysis: analysisResults
  };
}

// Function to categorize a field based on its properties
function categorizeField(field, categories) {
  if (!field) return;
  
  // Extract subsection from field name or metadata
  const subsection = field.subsection || extractSubsectionFromName(field.name);
  
  // Check for keywords in field name or label
  const name = (field.name || '').toLowerCase();
  const label = (field.label || '').toLowerCase();
  const id = field.id ? field.id.toString() : '';
  
  if (subsection === '21A' || name.includes('incompetent') || label.includes('incompetent') || 
      name.includes('mentally incompetent') || label.includes('mentally incompetent')) {
    categories.mentalIncompetence.push(field);
  } else if (subsection === '21B' || name.includes('consult mental') || label.includes('consult mental') ||
             name.includes('order') || label.includes('court order')) {
    categories.courtOrdered.push(field);
  } else if (subsection === '21C' || name.includes('hospital') || label.includes('hospital') ||
             name.includes('admission') || label.includes('admission')) {
    categories.hospitalization.push(field);
  } else if (subsection === '21D' || name.includes('diagnos') || label.includes('diagnos') ||
             name.includes('condition') || label.includes('condition')) {
    categories.diagnosis.push(field);
  } else if (subsection === '21D.1' || subsection === '21D1' || 
             name.includes('current treatment') || label.includes('current treatment') ||
             name.includes('currently in treatment') || label.includes('currently in treatment')) {
    categories.currentTreatment.push(field);
  } else if (subsection === '21E' || name.includes('affect') || label.includes('affect') ||
             name.includes('judgment') || label.includes('judgment')) {
    categories.mentalHealthAffects.push(field);
  } else if (field.section === 21 && !subsection) {
    // General section 21 fields without specific subsection
    categories.general.push(field);
  } else {
    // Unknown categorization
    categories.unknown.push(field);
  }
}

// Function to extract subsection from field name (e.g., "Section21A-1" -> "21A")
function extractSubsectionFromName(name) {
  if (!name) return null;
  
  // Common patterns for section/subsection in field names
  const patterns = [
    /Section(?:_|\s)?21([A-E])/i,       // Section21A, Section_21B, Section 21C
    /21([A-E])(?:-|\.)?\d*/i,           // 21A, 21A-1, 21B.2
    /S21([A-E])/i,                      // S21A, S21B
    /Sect(?:ion)?21([A-E])/i            // Sect21A, Section21B
  ];
  
  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match && match[1]) {
      return `21${match[1]}`;
    }
  }
  
  return null;
}

// Function to count different field types
function countFieldTypes(fields) {
  const types = {};
  
  fields.forEach(field => {
    const type = field.type || 'unknown';
    types[type] = (types[type] || 0) + 1;
  });
  
  return types;
}

// Function to extract unique labels with counts
function extractUniqueLabels(fields) {
  const labels = {};
  
  fields.forEach(field => {
    if (field.label) {
      labels[field.label] = (labels[field.label] || 0) + 1;
    }
  });
  
  return labels;
}

// Main execution
(async function main() {
  const fieldHierarchy = loadFieldHierarchy();
  if (!fieldHierarchy) {
    console.error('Failed to load field hierarchy. Make sure the file exists and is valid JSON.');
    return;
  }
  
  const { fields, analysis } = extractSection21Fields(fieldHierarchy);
  
  // Save the extracted fields to a JSON file
  const outputFilePath = path.resolve(process.cwd(), 'scripts/analysis/section21-fields.json');
  fs.writeFileSync(outputFilePath, JSON.stringify(fields, null, 2));
  
  // Save the analysis to a separate file
  const analysisFilePath = path.resolve(process.cwd(), 'scripts/analysis/section21-analysis.json');
  fs.writeFileSync(analysisFilePath, JSON.stringify(analysis, null, 2));
  
  console.log(`Section 21 Field Analysis Complete:`);
  console.log(`- Total fields: ${analysis.totalFields}`);
  console.log('- Fields by category:');
  Object.entries(analysis.fieldsByCategory).forEach(([category, count]) => {
    console.log(`  - ${category}: ${count}`);
  });
  console.log('- Field types:');
  Object.entries(analysis.fieldTypes).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });
  console.log(`- Unique labels: ${Object.keys(analysis.uniqueLabels).length}`);
  
  console.log(`\nResults saved to:\n- ${outputFilePath}\n- ${analysisFilePath}`);
})(); 