import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory path
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Section structure definition
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

/**
 * Enhanced subsection detection patterns
 */
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
  /^sect(?<section>\d+)\.(?<subsection>\d+)/i,
  
  // Additional pattern for capturing subsections with hyphens
  /section(?<section>\d+)[-_](?<subsection>\d+)/i,
  
  // Pattern for alternate subsection format
  /(?<section>\d+)-(?<subsection>\d+)/,
  
  // Form1 style subsection patterns like "form1[0].Section15_2[0]"
  /form\d+\[\d+\]\.Section(?<section>\d+)_(?<subsection>\d+)/i,
  
  // Subforms with section identifiers
  /#subform\[\d+\]\.Section(?<section>\d+)_(?<subsection>\d+)/i,
  
  // Handle fieldName patterns with nested areas like "form1[0].Section15_3[0].#area[0]"
  /Section(?<section>\d+)_(?<subsection>\d+)\[\d+\]\.#area/i,
  
  // Handle patterns with multiple area identifiers
  /Section(?<section>\d+)_(?<subsection>\d+)\[\d+\]\.#area\[\d+\]\.#area\[\d+\]/i,

  // Handle fieldName with complex nesting "form1[0].Section15_3[0].#area[2].TextField11[7]"
  /Section(?<section>\d+)_(?<subsection>\d+)\[\d+\]\.#area\[\d+\]\./i,
  
  // Roman numeral subsections like "SectionXV_II"
  /Section(?<section>[IVX]+)_(?<subsection>[IVX]+)/i,

  // Handle patterns with text identifiers like "SectionA_1"
  /Section(?<section>[A-Z])_(?<subsection>\d+)/i,
];

/**
 * Enhanced detection of subsections from field metadata
 */
function detectSubsection(field) {
  if (!field) return null;
  
  // Check field name for subsection notation
  if (field.name) {
    // Try all patterns
    for (const pattern of subsectionPatterns) {
      const match = field.name.match(pattern);
      if (match?.groups?.section && match?.groups?.subsection) {
        // Parse section number, handling both numeric and Roman numerals
        let section = match.groups.section;
        let sectionNum = parseInt(section);
        
        // Handle Roman numerals if needed
        if (isNaN(sectionNum) && /^[IVX]+$/.test(section)) {
          sectionNum = romanToInt(section);
        }
        
        // Handle letter sections (A=1, B=2, etc.)
        if (isNaN(sectionNum) && /^[A-Z]$/.test(section)) {
          sectionNum = section.charCodeAt(0) - 64; // A=1, B=2, etc.
        }
        
        // Parse subsection
        let subsection = match.groups.subsection;
        let subsectionNum = parseInt(subsection);
        
        // Handle Roman numerals for subsections
        if (isNaN(subsectionNum) && /^[IVX]+$/.test(subsection)) {
          subsectionNum = romanToInt(subsection);
        }
        
        if (!isNaN(sectionNum) && !isNaN(subsectionNum)) {
          return {
            section: sectionNum,
            subsection: subsectionNum,
            confidence: 0.95,
            matchedPattern: pattern.toString(),
            matchedOn: 'name'
          };
        }
      }
    }
    
    // Special handling for Section_X_Y format
    if (field.name.includes('Section') && (field.name.includes('_') || field.name.includes('['))) {
      const complexMatch = field.name.match(/Section(\d+)_(\d+)/i);
      if (complexMatch && complexMatch.length >= 3) {
        return {
          section: parseInt(complexMatch[1]),
          subsection: parseInt(complexMatch[2]),
          confidence: 0.9,
          matchedPattern: 'Complex Section_X_Y pattern',
          matchedOn: 'name'
        };
      }
    }
  }
  
  // Check field label for subsection information
  if (field.label) {
    // Standard patterns like "Section 15.2 Entry #1"
    const labelPatterns = [
      /section\s+(?<section>\d+)\.(?<subsection>\d+)/i,
      /^(?<section>\d+)\.(?<subsection>\d+)\s+/i,
      /section\s+(?<section>\d+)\s+subsection\s+(?<subsection>\d+)/i,
      /^(?<section>\d+)\.(?<subsection>\d+)\s/i
    ];
    
    for (const pattern of labelPatterns) {
      const match = field.label.match(pattern);
      if (match?.groups?.section && match?.groups?.subsection) {
        return {
          section: parseInt(match.groups.section),
          subsection: parseInt(match.groups.subsection),
          confidence: 0.85,
          matchedPattern: pattern.toString(),
          matchedOn: 'label'
        };
      }
    }
  }
  
  // Check field value for subsection info if it's a string
  if (typeof field.value === 'string') {
    for (const pattern of subsectionPatterns) {
      const match = field.value.match(pattern);
      if (match?.groups?.section && match?.groups?.subsection) {
        return {
          section: parseInt(match.groups.section),
          subsection: parseInt(match.groups.subsection),
          confidence: 0.75,
          matchedPattern: pattern.toString(),
          matchedOn: 'value'
        };
      }
    }
  }
  
  // Infer from parts of the name if we have section information
  if (field.section && field.name) {
    // Try to extract subsection from parts of the name
    const parts = field.name.split(/[_.\[\]]/);
    for (let i = 0; i < parts.length; i++) {
      if (/^\d+$/.test(parts[i]) && i < parts.length - 1 && /^\d+$/.test(parts[i+1])) {
        const potentialSection = parseInt(parts[i]);
        const potentialSubsection = parseInt(parts[i+1]);
        
        // Only consider it a match if the section matches the field's section
        if (potentialSection === field.section) {
          return {
            section: potentialSection,
            subsection: potentialSubsection,
            confidence: 0.6,
            matchedPattern: 'Parts inference',
            matchedOn: 'parts'
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * Helper function to convert Roman numerals to integers
 */
function romanToInt(s) {
  const romanMap = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
  };
  
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    // If current value is less than next value, subtract
    if (i + 1 < s.length && romanMap[s[i]] < romanMap[s[i + 1]]) {
      result -= romanMap[s[i]];
    } else {
      result += romanMap[s[i]];
    }
  }
  
  return result;
}

/**
 * Main function to verify subsection detection coverage across all section field files
 */
async function verifySubsectionCoverage() {
  console.log('Verifying subsection detection coverage...');
  
  const analysisDir = join(__dirname);
  const sectionFiles = [];
  
  // Find all section-X-fields.json files
  for (let i = 1; i <= 30; i++) {
    const filePath = join(analysisDir, `section${i}-fields.json`);
    try {
      if (readFileSync(filePath)) {
        sectionFiles.push({
          section: i,
          path: filePath
        });
      }
    } catch (error) {
      // File doesn't exist, ignore
    }
  }
  
  console.log(`Found ${sectionFiles.length} section field files to analyze.`);
  
  // Analysis results
  const results = {
    totalFields: 0,
    fieldsWithSubsection: 0,
    fieldsWithoutSubsection: 0,
    detectionCoveragePercent: 0,
    patternMatches: {},
    matchedOn: {},
    subsectionCounts: {},
    sectionResults: []
  };
  
  // Process each section file
  for (const sectionFile of sectionFiles) {
    const sectionFields = JSON.parse(readFileSync(sectionFile.path, 'utf8'));
    
    // Skip if not in valid format
    if (!Array.isArray(sectionFields)) {
      console.log(`Skipping ${sectionFile.path} - content is not an array`);
      continue;
    }
    
    const sectionResult = {
      section: sectionFile.section,
      sectionName: sectionStructure[sectionFile.section]?.name || `Section ${sectionFile.section}`,
      totalFields: sectionFields.length,
      fieldsWithSubsection: 0,
      fieldsWithoutSubsection: 0,
      detectionCoveragePercent: 0,
      subsections: {},
      samplesWithoutSubsection: []
    };
    
    // Process each field in the section
    for (const field of sectionFields) {
      results.totalFields++;
      sectionResult.totalFields++;
      
      // Try to detect subsection
      const subsectionInfo = detectSubsection(field);
      
      if (subsectionInfo) {
        results.fieldsWithSubsection++;
        sectionResult.fieldsWithSubsection++;
        
        // Track pattern matching stats
        const patternKey = subsectionInfo.matchedPattern || 'Unknown pattern';
        results.patternMatches[patternKey] = (results.patternMatches[patternKey] || 0) + 1;
        
        // Track where the match was found
        const matchedOnKey = subsectionInfo.matchedOn || 'Unknown';
        results.matchedOn[matchedOnKey] = (results.matchedOn[matchedOnKey] || 0) + 1;
        
        // Track subsection counts
        const subsectionKey = `${subsectionInfo.section}.${subsectionInfo.subsection}`;
        results.subsectionCounts[subsectionKey] = (results.subsectionCounts[subsectionKey] || 0) + 1;
        
        // Add to section-specific results
        sectionResult.subsections[subsectionKey] = (sectionResult.subsections[subsectionKey] || 0) + 1;
      } else {
        results.fieldsWithoutSubsection++;
        sectionResult.fieldsWithoutSubsection++;
        
        // Store sample fields that couldn't be categorized (up to 5 per section)
        if (sectionResult.samplesWithoutSubsection.length < 5) {
          sectionResult.samplesWithoutSubsection.push({
            name: field.name,
            label: field.label,
            value: field.value,
            type: field.type
          });
        }
      }
    }
    
    // Calculate section coverage percentage
    sectionResult.detectionCoveragePercent = 
      sectionResult.totalFields > 0 
        ? (sectionResult.fieldsWithSubsection / sectionResult.totalFields) * 100 
        : 0;
    
    results.sectionResults.push(sectionResult);
  }
  
  // Calculate overall coverage percentage
  results.detectionCoveragePercent = 
    results.totalFields > 0 
      ? (results.fieldsWithSubsection / results.totalFields) * 100 
      : 0;
  
  // Sort section results by coverage (worst first)
  results.sectionResults.sort((a, b) => a.detectionCoveragePercent - b.detectionCoveragePercent);
  
  // Write results to file
  const outputPath = join(analysisDir, 'subsection-coverage-report.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n=== SUBSECTION DETECTION COVERAGE REPORT ===`);
  console.log(`Total fields analyzed: ${results.totalFields}`);
  console.log(`Fields with subsection detected: ${results.fieldsWithSubsection}`);
  console.log(`Fields without subsection: ${results.fieldsWithoutSubsection}`);
  console.log(`Overall detection coverage: ${results.detectionCoveragePercent.toFixed(2)}%`);
  console.log(`\nDetailed report saved to: ${outputPath}`);
  
  // Log sections with worst coverage
  console.log(`\nSections with lowest subsection detection coverage:`);
  results.sectionResults.slice(0, 5).forEach(section => {
    console.log(`${section.sectionName}: ${section.detectionCoveragePercent.toFixed(2)}% (${section.fieldsWithSubsection}/${section.totalFields})`);
  });
}

// Run the verification
verifySubsectionCoverage()
  .catch(error => console.error('Error verifying subsection coverage:', error)); 