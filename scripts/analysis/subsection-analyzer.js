import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

// Get the directory path
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Define paths
const fieldHierarchyPath = join(__dirname, '../../reports/field-hierarchy.json');
const outputPath = join(__dirname, '../../reports/subsection-analysis.json');

// Section structure definition (from enhanced-pdf-validation.ts)
const sectionStructure = {
  1: { name: "Full Name" },
  2: { name: "Date of Birth" },
  3: { name: "Place of Birth" },
  4: { name: "Social Security Number" },
  5: { name: "Other Names Used" },
  6: { name: "Your Identifying Information" },
  7: { name: "Your Contact Information" },
  8: { name: "U.S. Passport Information" },
  9: { name: "Citizenship" },
  10: { name: "Dual/Multiple Citizenship & Foreign Passport Info" },
  11: { name: "Where You Have Lived" },
  12: { name: "Where you went to School" },
  13: { name: "Employment Activities" },
  14: { name: "Selective Service" },
  15: { name: "Military History" },
  16: { name: "People Who Know You Well" },
  17: { name: "Marital/Relationship Status" },
  18: { name: "Relatives" },
  19: { name: "Foreign Contacts" },
  20: { name: "Foreign Business, Activities, Government Contacts" },
  21: { name: "Psychological and Emotional Health" },
  22: { name: "Police Record" },
  23: { name: "Illegal Use of Drugs and Drug Activity" },
  24: { name: "Use of Alcohol" },
  25: { name: "Investigations and Clearance" },
  26: { name: "Financial Record" },
  27: { name: "Use of Information Technology Systems" },
  28: { name: "Involvement in Non-Criminal Court Actions" },
  29: { name: "Association Record" },
  30: { name: "Continuation Space" }
};

console.log('Reading field-hierarchy.json...');
let fieldHierarchy;
try {
  const rawData = readFileSync(fieldHierarchyPath, 'utf8');
  fieldHierarchy = JSON.parse(rawData);
  console.log('Successfully parsed field-hierarchy.json');
} catch (error) {
  console.error('Error reading or parsing field-hierarchy.json:', error);
  process.exit(1);
}

// Data structures for analyzing subsections
const subsections = {};
const parentSections = new Set();
const sectionTitles = {};
const unmappedFields = [];

// Patterns to detect subsection identifiers in field names
const subsectionPatterns = [
  // Direct subsection patterns like "Section9.1-9.4[0]"
  /Section(?<section>\d+)\.(?<subsection>\d+)(?:-\d+\.\d+)?(?:\[.*?\])?/i,
  
  // Escaped subsection patterns like "Section9\\.1-9\\.4"
  /Section(?<section>\d+)\\\\.(?<subsection>\d+)(?:-\d+\\\\.d+)?/i,
  
  // Numeric subsection patterns like "9.1" or "18.2"
  /^(?<section>\d+)\.(?<subsection>\d+)$/,
  
  // Section with underscore subsection like "section13_2-2"
  /section(?<section>\d+)_(?<subsection>[0-9.\-]+)/i,
  
  // Fields with subsection value patterns
  /^sect(?<section>\d+)\.(?<subsection>\d+)/i
];

// Utility function to determine if a field ID or name represents a subsection
function detectSubsection(fieldName) {
  if (!fieldName) return null;
  
  // Check all subsection patterns
  for (const pattern of subsectionPatterns) {
    const match = fieldName.match(pattern);
    if (match?.groups?.section && match?.groups?.subsection) {
      return {
        section: parseInt(match.groups.section),
        subsection: parseInt(match.groups.subsection),
        confidence: 0.9
      };
    }
  }
  
  // Special handling for known subsection format "12.1"
  if (/^\d+\.\d+$/.test(fieldName)) {
    const [section, subsection] = fieldName.split('.').map(Number);
    return { section, subsection, confidence: 0.95 };
  }
  
  return null;
}

// Process fields to extract subsections
console.log('Analyzing fields for subsections...');

// Stats tracking
let totalFields = 0;
let subsectionFields = 0;
let fieldsWithPage = 0;

// Field name pattern counters
const patternCounts = {};

// Process each page in the hierarchy
for (const pageNumber in fieldHierarchy) {
  if (isNaN(parseInt(pageNumber))) continue; // Skip non-numeric keys
  
  const pageData = fieldHierarchy[pageNumber];
  fieldsWithPage++;
  
  // Handle the specific structure of field-hierarchy.json
  // Page -> fieldsByValuePattern -> fieldsByRegex -> fields
  if (pageData.fieldsByValuePattern) {
    for (const patternKey in pageData.fieldsByValuePattern) {
      const patternData = pageData.fieldsByValuePattern[patternKey];
      
      if (patternData.fieldsByRegex) {
        for (const regexKey in patternData.fieldsByRegex) {
          const regexData = patternData.fieldsByRegex[regexKey];
          
          if (regexData.fields && Array.isArray(regexData.fields)) {
            for (const field of regexData.fields) {
              totalFields++;
              
              if (!field.name) continue;
              
              // Track field name patterns for analysis
              const simplifiedPattern = field.name.replace(/\[\d+\]/g, '[]').replace(/\d+/g, 'N');
              patternCounts[simplifiedPattern] = (patternCounts[simplifiedPattern] || 0) + 1;
              
              // Check if the field name contains subsection information
              const subsectionInfo = detectSubsection(field.name);
              
              if (subsectionInfo) {
                subsectionFields++;
                const { section, subsection } = subsectionInfo;
                const subsectionId = `${section}.${subsection}`;
                parentSections.add(section.toString());
                
                // Initialize subsection entry if it doesn't exist
                if (!subsections[subsectionId]) {
                  subsections[subsectionId] = {
                    id: subsectionId,
                    section,
                    subsection,
                    title: field.label || field.sectionName || `Subsection ${subsectionId}`,
                    parentSection: section.toString(),
                    parentSectionName: sectionStructure[section]?.name || `Section ${section}`,
                    fields: [],
                    pages: new Set([parseInt(pageNumber)]),
                    mappingStatus: 'Detected'
                  };
                } else {
                  // Add page to existing subsection
                  subsections[subsectionId].pages.add(parseInt(pageNumber));
                }
                
                // Add field to subsection
                subsections[subsectionId].fields.push({
                  name: field.name,
                  id: field.id,
                  label: field.label,
                  value: field.value,
                  section: field.section,
                  sectionName: field.sectionName,
                  confidence: field.confidence,
                  page: parseInt(pageNumber)
                });
              } else if (field.section) {
                // Track section info for fields that have section but not subsection
                const sectionId = field.section.toString();
                if (!sectionTitles[sectionId] && field.sectionName) {
                  sectionTitles[sectionId] = field.sectionName;
                }
                
                // Also check if the field value contains subsection information
                if (typeof field.value === 'string') {
                  const valueSubsectionInfo = detectSubsection(field.value);
                  if (valueSubsectionInfo) {
                    subsectionFields++;
                    const { section, subsection } = valueSubsectionInfo;
                    const subsectionId = `${section}.${subsection}`;
                    parentSections.add(section.toString());
                    
                    // Initialize subsection entry if it doesn't exist
                    if (!subsections[subsectionId]) {
                      subsections[subsectionId] = {
                        id: subsectionId,
                        section,
                        subsection,
                        title: `Subsection ${subsectionId}`,
                        parentSection: section.toString(),
                        parentSectionName: sectionStructure[section]?.name || `Section ${section}`,
                        fields: [],
                        pages: new Set([parseInt(pageNumber)]),
                        mappingStatus: 'Inferred'
                      };
                    } else {
                      // Add page to existing subsection
                      subsections[subsectionId].pages.add(parseInt(pageNumber));
                    }
                    
                    // Add field to subsection
                    subsections[subsectionId].fields.push({
                      name: field.name,
                      id: field.id,
                      label: field.label,
                      value: field.value,
                      section: field.section,
                      sectionName: field.sectionName,
                      confidence: field.confidence,
                      page: parseInt(pageNumber)
                    });
                  }
                }
              } else {
                // Track unmapped fields
                unmappedFields.push({
                  name: field.name,
                  id: field.id,
                  label: field.label,
                  value: field.value,
                  page: parseInt(pageNumber)
                });
              }
            }
          }
        }
      }
    }
  }
}

// Find subsections using section field correlations if direct detection failed
console.log('Inferring additional subsections based on field correlations...');

// For sections known to have formal subsections (like section 9, 13, 18)
const sectionsWithFormalSubsections = [9, 13, 18, 20, 26, 27];

// Array of field names mapped to their sections for correlation analysis
const fieldToSectionMap = [];

// Process all fields to build a correlation dataset
for (const pageNumber in fieldHierarchy) {
  if (isNaN(parseInt(pageNumber))) continue;
  
  const pageData = fieldHierarchy[pageNumber];
  
  if (pageData.fieldsByValuePattern) {
    for (const patternKey in pageData.fieldsByValuePattern) {
      const patternData = pageData.fieldsByValuePattern[patternKey];
      
      if (patternData.fieldsByRegex) {
        for (const regexKey in patternData.fieldsByRegex) {
          const regexData = patternData.fieldsByRegex[regexKey];
          
          if (regexData.fields && Array.isArray(regexData.fields)) {
            for (const field of regexData.fields) {
              if (field.section && field.name) {
                fieldToSectionMap.push({
                  name: field.name,
                  section: field.section,
                  page: parseInt(pageNumber),
                  value: field.value
                });
              }
            }
          }
        }
      }
    }
  }
}

// For each formal subsection section, try to infer subsections
for (const sectionId of sectionsWithFormalSubsections) {
  // Get all fields for this section
  const sectionFields = fieldToSectionMap.filter(f => f.section === sectionId);
  
  // Skip if no fields
  if (!sectionFields.length) continue;
  
  // Group by page
  const fieldsByPage = {};
  sectionFields.forEach(field => {
    if (!fieldsByPage[field.page]) fieldsByPage[field.page] = [];
    fieldsByPage[field.page].push(field);
  });
  
  // For each page, look for patterns that might indicate subsections
  for (const page in fieldsByPage) {
    const pageFields = fieldsByPage[page];
    
    // Check field values for subsection hints
    const potentialSubsections = new Set();
    
    for (const field of pageFields) {
      // Skip fields already assigned to subsections
      const alreadyAssigned = Object.values(subsections).some(sub => 
        sub.fields.some(f => f.name === field.name)
      );
      
      if (alreadyAssigned) continue;
      
      // Check field value for subsection hints
      if (typeof field.value === 'string') {
        // Check for section with number patterns
        const matches = field.value.match(/^sect(\d+)\.(\d+)/i) || 
                      field.value.match(/^(\d+)\.(\d+)/);
        
        if (matches && matches.length >= 3) {
          const section = parseInt(matches[1]);
          const subsection = parseInt(matches[2]);
          
          if (section === sectionId) {
            potentialSubsections.add(subsection);
          }
        }
      }
      
      // Check name patterns for subsection hint
      if (field.name.includes(`section${sectionId}_`)) {
        const subMatch = field.name.match(new RegExp(`section${sectionId}_(\\d+)`, 'i'));
        if (subMatch && subMatch[1]) {
          potentialSubsections.add(parseInt(subMatch[1]));
        }
      }
    }
    
    // If we found potential subsections, create entries for them
    for (const subsectionNumber of potentialSubsections) {
      const subsectionId = `${sectionId}.${subsectionNumber}`;
      
      if (!subsections[subsectionId]) {
        // Create new subsection entry
        subsections[subsectionId] = {
          id: subsectionId,
          section: sectionId,
          subsection: subsectionNumber,
          title: `${sectionStructure[sectionId]?.name || `Section ${sectionId}`} - Subsection ${subsectionNumber}`,
          parentSection: sectionId.toString(),
          parentSectionName: sectionStructure[sectionId]?.name || `Section ${sectionId}`,
          fields: [],
          pages: new Set([parseInt(page)]),
          mappingStatus: 'Inferred'
        };
        
        parentSections.add(sectionId.toString());
      } else {
        // Add page to existing subsection
        subsections[subsectionId].pages.add(parseInt(page));
      }
      
      // Add any fields from the same page/section that aren't already in a subsection
      for (const field of pageFields) {
        const alreadyAssigned = Object.values(subsections).some(sub => 
          sub.fields.some(f => f.name === field.name)
        );
        
        if (!alreadyAssigned) {
          subsections[subsectionId].fields.push({
            name: field.name,
            section: field.section,
            page: parseInt(page),
            value: field.value,
            mappingConfidence: 'Inferred'
          });
        }
      }
    }
  }
}

// Add known subsections for section 9 if not already detected
// Section 9 has well-defined subsections in the form:
// 9.1: U.S. Citizen by Birth (Born in U.S.)
// 9.2: U.S. Citizen by Birth (Born Abroad to U.S. Parent(s))
// 9.3: Naturalized U.S. Citizen
// 9.4: Derived U.S. Citizen
// 9.5: Not a U.S. Citizen
const section9Subsections = {
  "9.1": "U.S. Citizen by Birth (Born in U.S.)",
  "9.2": "U.S. Citizen by Birth (Born Abroad to U.S. Parent(s))",
  "9.3": "Naturalized U.S. Citizen",
  "9.4": "Derived U.S. Citizen",
  "9.5": "Not a U.S. Citizen"
};

for (const [subId, title] of Object.entries(section9Subsections)) {
  if (!subsections[subId]) {
    const [section, subsection] = subId.split('.').map(Number);
    // Check if we have any section 9 fields
    const section9Fields = fieldToSectionMap.filter(f => f.section === 9);
    if (section9Fields.length > 0) {
      // Get unique pages for section 9
      const section9Pages = [...new Set(section9Fields.map(f => f.page))];
      
      subsections[subId] = {
        id: subId,
        section: section,
        subsection: subsection,
        title: title,
        parentSection: section.toString(),
        parentSectionName: sectionStructure[section].name,
        fields: [],
        pages: new Set(section9Pages),
        mappingStatus: 'Known'
      };
      
      parentSections.add(section.toString());
    }
  } else {
    // Update title for existing subsection
    subsections[subId].title = title;
  }
}

// Convert set of pages to array for each subsection
Object.values(subsections).forEach(subsection => {
  subsection.pages = Array.from(subsection.pages).sort((a, b) => a - b);
  
  // If we have pages, use them to help determine mapping status
  if (subsection.pages.length > 0) {
    subsection.pageRange = [Math.min(...subsection.pages), Math.max(...subsection.pages)];
  }
});

// Generate summary and stats
const summary = {
  totalFields,
  subsectionFields,
  fieldsWithPage,
  unmappedFields: unmappedFields.length,
  totalSubsections: Object.keys(subsections).length,
  parentSections: Array.from(parentSections).sort((a, b) => parseInt(a) - parseInt(b)),
  subsectionsByParent: {},
  
  // Add frequency of top field patterns
  topFieldPatterns: Object.entries(patternCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([pattern, count]) => ({ pattern, count }))
};

// Group subsections by parent section
Array.from(parentSections).forEach(parent => {
  summary.subsectionsByParent[parent] = Object.values(subsections)
    .filter(sub => sub.parentSection === parent)
    .map(sub => ({
      id: sub.id,
      title: sub.title,
      fieldCount: sub.fields.length,
      pages: sub.pages,
      pageRange: sub.pageRange,
      mappingStatus: sub.mappingStatus
    }))
    .sort((a, b) => {
      const [, aNum] = a.id.split('.');
      const [, bNum] = b.id.split('.');
      return parseInt(aNum) - parseInt(bNum);
    });
});

// Prepare the result
const result = {
  summary,
  subsections: Object.values(subsections).sort((a, b) => {
    const [aParent, aNum] = a.id.split('.').map(Number);
    const [bParent, bNum] = b.id.split('.').map(Number);
    
    if (aParent !== bParent) {
      return aParent - bParent;
    }
    return aNum - bNum;
  }),
  // Include a sample of unmapped fields for debugging
  unmappedFieldsSample: unmappedFields.slice(0, 50)
};

// Write the result to a file
console.log('Writing results to subsection-analysis.json...');
writeFileSync(outputPath, JSON.stringify(result, null, 2));

console.log('Analysis complete!');
console.log(`Found ${result.summary.totalSubsections} subsections across ${result.summary.parentSections.length} parent sections.`);
console.log(`Processed ${totalFields} total fields, identified ${subsectionFields} subsection fields.`);
console.log(`Results saved to: ${outputPath}`); 