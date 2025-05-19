import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { 
  sectionFieldPatterns, 
  refinedSectionPageRanges,
  enhancedSectionCategorization,
  identifySectionByPageWithConfidence,
  enhancedMultiDimensionalCategorization,
  detectSectionFromFieldValue
} from '../utilities/page-categorization-bridge';

// Define field data type
interface FieldData {
  name: string;
  value: string | string[] | boolean | null;
  type: string;
  page?: number;
  label?: string;
}

/**
 * Extract field data from PDF form, categorize by section, and save to individual files
 * Based on the approach used in enhanced-pdf-validation.ts but simplified to focus on section extraction
 */
async function extractSectionFields() {
  console.log('Starting SF-86 form field extraction by section');
  
  // 1. Define the PDF path
  const pdfPath = path.join(process.cwd(), 'utilities', 'externalTools', 'sf861.pdf');
  console.log(`Loading PDF from: ${pdfPath}`);
  
  if (!fs.existsSync(pdfPath)) {
    console.error(`Error: PDF file not found at ${pdfPath}`);
    return;
  }

  // 2. Load the PDF
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  console.log(`PDF loaded successfully. Pages: ${pdfDoc.getPageCount()}`);

  // 3. Get all form fields
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  console.log(`Found ${fields.length} form fields`);

  // 4. Process each field
  // Add a mapping of subform indices to section numbers based on analysis of fields
  const subformToSectionMap: Record<string, number> = {
    // These mappings are based on analysis of field patterns
    '68': 21, // Based on subform index patterns in section 21
    '69': 21,
    '70': 21,
    '71': 21,
    '72': 21,
    '74': 22,
    '76': 22,
    '77': 22,
    '78': 23,
    '79': 23,
    '80': 23,
    '83': 24,
    '84': 24,
    '87': 25,
    '89': 26,
    '91': 26,
    '92': 26,
    '93': 26,
    '94': 27,
    '95': 28,
    '98': 29,
    '128': 30
  };

  // 5. Extract field data
  const fieldData: FieldData[] = [];
  
  // Pre-categorize fields by their patterns (fast categorization)
  const sectionFieldMap: Record<number, FieldData[]> = {};
  // Initialize section arrays
  for (let i = 1; i <= 30; i++) {
    sectionFieldMap[i] = [];
  }

  // Create a special list for uncategorized fields to process later
  const uncategorizedFields: FieldData[] = [];

  // First pass: Extract basic field data and do initial categorization
  for (const field of fields) {
    // Get basic field info
    const fieldName = field.getName();
    const fieldType = field.constructor.name;
    let fieldValue: string | string[] | boolean | null = null;
    
    // Get page number if available
    let pageNumber: number | undefined = undefined;
    const fieldRef = field.acroField.dict.get(PDFName.of('P'));
    if (fieldRef) {
      const pageObj = pdfDoc.context.lookup(fieldRef);
      if (pageObj) {
        // Find the page index
        for (let i = 0; i < pdfDoc.getPageCount(); i++) {
          if (pdfDoc.getPage(i).ref === fieldRef) {
            pageNumber = i + 1; // 1-indexed page number
            break;
          }
        }
      }
    }

    // Get value based on field type
    try {
      if (fieldType === 'PDFTextField') {
        fieldValue = field.getText() || '';
      } else if (fieldType === 'PDFCheckBox') {
        fieldValue = field.isChecked();
      } else if (fieldType === 'PDFRadioGroup') {
        fieldValue = field.getSelected() || '';
      } else if (fieldType === 'PDFDropdown') {
        fieldValue = field.getSelected() || [];
      } else if (fieldType === 'PDFOptionList') {
        fieldValue = field.getSelectedOptions() || [];
      }
    } catch (e) {
      console.warn(`Error getting value for field ${fieldName}: ${e}`);
      fieldValue = null;
    }

    // Get field label if available
    let fieldLabel: string | undefined = undefined;
    try {
      const fieldDict = field.acroField.dict;
      const altTextRef = fieldDict.get(PDFName.of('TU'));
      if (altTextRef instanceof PDFString) {
        fieldLabel = altTextRef.decodeText();
      }
    } catch (e) {
      console.warn(`Error getting label for field ${fieldName}: ${e}`);
    }

    if (!fieldLabel && fieldName.includes('#field')) {
      fieldLabel = fieldName.split('.').pop() || undefined;
    }

    // Create field data
    const data: FieldData = {
      name: fieldName,
      value: fieldValue,
      type: fieldType.toLowerCase().replace('pdf', ''),
      ...(pageNumber && { page: pageNumber }),
      ...(fieldLabel && { label: fieldLabel })
    };

    // Add to fieldData array
    fieldData.push(data);

    // Attempt to categorize the field into a section
    let sectionId = 0;
    let confidence = 0;

    // STRATEGY 1: Direct pattern matching using sectionFieldPatterns (most reliable)
    for (const [section, patterns] of Object.entries(sectionFieldPatterns)) {
      const sectionNum = parseInt(section);
      if (patterns.some(pattern => pattern.test(fieldName))) {
        sectionId = sectionNum;
        confidence = 0.95;
        break;
      }
    }

    // Add special validation for section 1 - ONLY these specific fields should be in section 1
    if (sectionId === 1) {
      // Make sure it's one of the explicitly defined section 1 fields
      const section1Patterns = [
        /form1\\[0\\]\\.Sections1-6\\[0\\]\\.TextField11\\[0\\]/i, // Last name
        /form1\\[0\\]\\.Sections1-6\\[0\\]\\.TextField11\\[1\\]/i, // First name
        /form1\\[0\\]\\.Sections1-6\\[0\\]\\.TextField11\\[2\\]/i, // Middle name
        /form1\\[0\\]\\.Sections1-6\\[0\\]\\.suffix\\[0\\]/i, // Name suffix
      ];
      
      if (!section1Patterns.some(pattern => pattern.test(fieldName))) {
        sectionId = 0;
        confidence = 0;
      }
    }

    // STRATEGY 2: Check page number against known section page ranges
    if (!sectionId && pageNumber) {
      const pageResult = identifySectionByPageWithConfidence(pageNumber);
      if (pageResult && pageResult.confidence > 0.7) {
        sectionId = pageResult.section;
        confidence = pageResult.confidence;
      }
    }

    // STRATEGY 3: Check if field value follows sectN naming pattern
    if (!sectionId && fieldValue && typeof fieldValue === 'string') {
      const valuePattern = detectSectionFromFieldValue(fieldValue);
      if (valuePattern && valuePattern.confidence > 0.8) {
        sectionId = valuePattern.section;
        confidence = valuePattern.confidence;
      }
    }
    
    // STRATEGY 4: Check for subform index patterns
    if (!sectionId) {
      // Look for subform index in field name
      const subformMatch = fieldName.match(/form1\[0\]\.#subform\[(\d+)\]/);
      if (subformMatch && subformMatch[1]) {
        const subformIndex = subformMatch[1];
        if (subformToSectionMap[subformIndex]) {
          sectionId = subformToSectionMap[subformIndex];
          confidence = 0.85;
        }
      }
    }
    
    // STRATEGY 5: Check for section explicit naming in the field name
    if (!sectionId) {
      // Look for "SectionXX" pattern in field name
      const sectionMatch = fieldName.match(/Section(\d+)([a-zA-Z]?)(\d*)/);
      if (sectionMatch) {
        const section = parseInt(sectionMatch[1]);
        if (section >= 1 && section <= 30) {
          sectionId = section;
          confidence = 0.9;
        }
      }
    }

    // Categorize the field or add to uncategorized list
    if (sectionId && confidence > 0.7) {
      sectionFieldMap[sectionId].push(data);
    } else {
      uncategorizedFields.push(data);
    }
  }

  // Process remaining uncategorized fields with the most comprehensive approach
  const unknownFields: FieldData[] = []; // Store fields that couldn't be categorized
  
  for (const field of uncategorizedFields) {
    // Try the most comprehensive multi-dimensional categorization
    const multiResult = enhancedMultiDimensionalCategorization(
      field.name,
      field.label,
      field.page || 0,
      field.value ? String(field.value) : undefined,
      []
    );
    
    if (multiResult && multiResult.section >= 1 && multiResult.section <= 30) {
      // Special validation for section 1 - ONLY allow explicitly matched fields
      if (multiResult.section === 1) {
        const section1ExplicitPatterns = [
          /form1\[0\]\.Sections1-6\[0\]\.TextField11\[0\]/i, // Last name
          /form1\[0\]\.Sections1-6\[0\]\.TextField11\[1\]/i, // First name
          /form1\[0\]\.Sections1-6\[0\]\.TextField11\[2\]/i, // Middle name
          /form1\[0\]\.Sections1-6\[0\]\.suffix\[0\]/i, // Name suffix
        ];
        
        if (section1ExplicitPatterns.some(pattern => pattern.test(field.name))) {
          sectionFieldMap[1].push(field);
        } else {
          // Check for subform index patterns
          let fieldCategorized = false;
          const subformMatch = field.name.match(/form1\[0\]\.#subform\[(\d+)\]/);
          if (subformMatch && subformMatch[1]) {
            const subformIndex = subformMatch[1];
            if (subformToSectionMap[subformIndex]) {
              sectionFieldMap[subformToSectionMap[subformIndex]].push(field);
              fieldCategorized = true;
            }
          }
          
          if (!fieldCategorized) {
            unknownFields.push(field);
          }
        }
      } else {
        sectionFieldMap[multiResult.section].push(field);
      }
    } else {
      // Last resort: If it's on pages 133-136, it's likely Section 30 (Continuation Space)
      if (field.page && field.page >= 133 && field.page <= 136) {
        sectionFieldMap[30].push(field);
      } else {
        // Check for subform index patterns
        let fieldCategorized = false;
        const subformMatch = field.name.match(/form1\[0\]\.#subform\[(\d+)\]/);
        if (subformMatch && subformMatch[1]) {
          const subformIndex = subformMatch[1];
          if (subformToSectionMap[subformIndex]) {
            sectionFieldMap[subformToSectionMap[subformIndex]].push(field);
            fieldCategorized = true;
          }
        }
        
        // Also check for nested subforms
        if (!fieldCategorized) {
          const nestedSubformMatch = field.name.match(/form1\[0\]\.Section(\d+)([a-zA-Z])(\d*)/);
          if (nestedSubformMatch) {
            const sectionNum = parseInt(nestedSubformMatch[1]);
            if (sectionNum >= 1 && sectionNum <= 30) {
              sectionFieldMap[sectionNum].push(field);
              fieldCategorized = true;
            }
          }
        }
        
        if (!fieldCategorized) {
          unknownFields.push(field);
        }
      }
    }
  }

  // 7. Print basic stats
  console.log('\nSection Field Counts:');
  for (const sectionId in sectionFieldMap) {
    const fields = sectionFieldMap[sectionId];
    console.log(`Section ${sectionId}: ${fields.length} fields`);
  }
  console.log(`Unknown fields: ${unknownFields.length} fields`);

  // 8. Save fields by section
  console.log('Saving section data to files...');
  
  // Create output directory if it doesn't exist
  const outputDir = path.join(process.cwd(), 'scripts', 'mySections');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate a section summary
  const sectionSummary = Object.entries(sectionFieldMap).map(([section, fields]) => ({
    section: parseInt(section),
    name: getSectionName(parseInt(section)),
    fieldCount: fields.length,
    filledFieldCount: fields.filter(f => f.value !== null && f.value !== '').length
  }));

  // Write section summary
  fs.writeFileSync(
    path.join(outputDir, 'section-summary.json'),
    JSON.stringify(sectionSummary, null, 2)
  );
  console.log(`Saved section summary to ${path.join(outputDir, 'section-summary.json')}`);

  // Write individual section files
  for (const [section, fields] of Object.entries(sectionFieldMap)) {
    const outputPath = path.join(outputDir, `section${section}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(fields, null, 2));
    console.log(`Saved section ${section} data to ${outputPath}`);

    // If there are fields in this section, try to identify subsections
    if (fields.length > 0) {
      const { subsections, names } = identifySubsections(parseInt(section), fields);
      
      // Only save subsections if there are more than just the default category
      if (Object.keys(subsections).length > 1 || (Object.keys(subsections).length === 1 && !subsections['default'])) {
        const outputSubsectionPath = path.join(outputDir, `section${section}-subsections.json`);
        
        // Create a combined structure with subsections and their names
        const subsectionOutput = {};
        
        // Add each subsection with its name
        for (const [subsecId, subsecFields] of Object.entries(subsections)) {
          subsectionOutput[subsecId] = {
            name: names[subsecId] || `Subsection ${subsecId}`,
            fields: subsecFields
          };
        }
        
        fs.writeFileSync(outputSubsectionPath, JSON.stringify(subsectionOutput, null, 2));
        console.log(`Saved section ${section} subsections to ${outputSubsectionPath}`);
      }
    }
  }
  
  // Save unknown fields
  if (unknownFields.length > 0) {
    const unknownOutputPath = path.join(outputDir, 'unknown.json');
    fs.writeFileSync(unknownOutputPath, JSON.stringify(unknownFields, null, 2));
    console.log(`Saved unknown fields to ${unknownOutputPath}`);
  }
}

/**
 * Get a human-readable name for a section number
 */
function getSectionName(sectionId: number): string {
  const sectionNames: Record<number, string> = {
    1: 'Full Name',
    2: 'Date of Birth',
    3: 'Place of Birth',
    4: 'Social Security Number',
    5: 'Other Names Used',
    6: 'Mother\'s Maiden Name',
    7: 'Phone Numbers',
    8: 'Email Addresses',
    9: 'Citizenship',
    10: 'Dual/Multiple Citizenship',
    11: 'Where You Have Lived',
    12: 'Where You Went to School',
    13: 'Employment Activities',
    14: 'Selective Service Record',
    15: 'Military History',
    16: 'People Who Know You Well',
    17: 'Marital Status',
    18: 'Relatives',
    19: 'Foreign Contacts',
    20: 'Foreign Activities',
    21: 'Foreign Business, Professional Activities, and Foreign Government Contacts',
    22: 'Foreign Business, Professional Activities, and Foreign Government Contacts (Continued)',
    23: 'Foreign Travel',
    24: 'Alcohol Consumption',
    25: 'Drug Use',
    26: 'Substance Abuse',
    27: 'Use of Information Technology Systems',
    28: 'Involvement in Non-Criminal Court Actions',
    29: 'Financial Record',
    30: 'Continuation Space'
  };
  
  return sectionNames[sectionId] || `Section ${sectionId}`;
}

/**
 * Identify subsections within a section based on field naming patterns
 */
function identifySubsections(sectionId: number, fields: FieldData[]): Record<string, any> {
  const subsectionMap: Record<string, FieldData[]> = {};
  const subsectionNames: Record<string, string> = {};
  
  // Default subsection for fields without clear subsection identifier
  subsectionMap['default'] = [];
  subsectionNames['default'] = 'Uncategorized Fields';

  // Section 21 has special subsection handling with mixed capitalization patterns
  const isSection21 = sectionId === 21;
  const section21SubsectionNames: Record<string, string> = {
    'a': 'Foreign Financial Interests - First Entry',
    'a2': 'Foreign Financial Interests - Second Entry', 
    'b': 'Foreign Real Estate - First Entry',
    'b2': 'Foreign Real Estate - Second Entry',
    'c': 'Foreign Benefits',
    'd1': 'Foreign Business/Professional Activities - First Entry',
    'd2': 'Foreign Business/Professional Activities - Second Entry',
    'd3': 'Foreign Business/Professional Activities - Third Entry',
    'e': 'Foreign Government Contacts - First Entry',
    'e1': 'Foreign Government Contacts - Second Entry',
  };
  
  for (const field of fields) {
    let subsectionIdentified = false;
    let subsectionId = '';
    
    // Special handling for Section 21 with complex subsection patterns
    if (isSection21) {
      // Check for both capitalization patterns: Section21a and section21a
      const sectionPatternUppercase = new RegExp(`Section${sectionId}([a-e]\\d*)\\[`, 'i');
      const sectionPatternLowercase = new RegExp(`section${sectionId}([a-e]\\d*)\\[`, 'i');
      
      const matchUpper = field.name.match(sectionPatternUppercase);
      const matchLower = field.name.match(sectionPatternLowercase);
      
      if (matchUpper || matchLower) {
        // Get the subsection letter+number (a, a2, b, b2, c, d1, d2, d3, e, e1)
        subsectionId = matchUpper ? matchUpper[1] : matchLower![1];
        
        if (!subsectionMap[subsectionId]) {
          subsectionMap[subsectionId] = [];
          subsectionNames[subsectionId] = section21SubsectionNames[subsectionId] || `Subsection ${subsectionId.toUpperCase()}`;
        }
        
        subsectionMap[subsectionId].push(field);
        subsectionIdentified = true;
      }
    } 
    // Standard approach for other sections
    else {
      // Look for patterns like "Section{N}" or "Section{N}_{M}"
      const sectionPattern = new RegExp(`Section${sectionId}(?:_?(\\d+))?\\[`, 'i');
      const match = field.name.match(sectionPattern);
      
      if (match) {
        // If there's a subsection number like "Section29_2", use it
        subsectionId = match[1] ? match[1] : '1';
        
        if (!subsectionMap[subsectionId]) {
          subsectionMap[subsectionId] = [];
          subsectionNames[subsectionId] = `Subsection ${subsectionId}`;
        }
        
        subsectionMap[subsectionId].push(field);
        subsectionIdentified = true;
      }
    }
    
    // Any other field name patterns for subsections
    if (!subsectionIdentified) {
      // Look for other patterns in field names or labels that might indicate subsections
      // For example, if a field has "subsection" or "part" in its label
      const label = field.label || '';
      
      if (
        label.includes('subsection') || 
        label.includes('part ') || 
        label.includes('section')
      ) {
        // Try to extract a subsection identifier from the label
        const partMatch = label.match(/part\s+(\w+)/i) || 
                         label.match(/subsection\s+(\w+)/i) || 
                         label.match(/section\s+\d+[.-](\w+)/i);
        
        if (partMatch) {
          subsectionId = partMatch[1];
          
          if (!subsectionMap[subsectionId]) {
            subsectionMap[subsectionId] = [];
            subsectionNames[subsectionId] = `Part ${subsectionId.toUpperCase()}`;
          }
          
          subsectionMap[subsectionId].push(field);
          subsectionIdentified = true;
        }
      }
    }
    
    // If no subsection pattern was found, put in default
    if (!subsectionIdentified) {
      subsectionMap['default'].push(field);
    }
  }

  // For section 21, analyze fields to identify any missing subsections
  if (isSection21) {
    // Look for patterns in field labels to identify subsections
    for (const field of subsectionMap['default']) {
      const label = field.label || '';
      
      // Financial interests
      if (label.includes('financial interest') || label.includes('currency')) {
        if (!subsectionMap['a']) {
          subsectionMap['a'] = [];
          subsectionNames['a'] = section21SubsectionNames['a'];
        }
        subsectionMap['a'].push(field);
        // Remove from default
        subsectionMap['default'] = subsectionMap['default'].filter(f => f !== field);
      }
      // Real estate
      else if (label.includes('real estate') || label.includes('property') || label.includes('land')) {
        if (!subsectionMap['b']) {
          subsectionMap['b'] = [];
          subsectionNames['b'] = section21SubsectionNames['b'];
        }
        subsectionMap['b'].push(field);
        // Remove from default
        subsectionMap['default'] = subsectionMap['default'].filter(f => f !== field);
      }
      // Benefits
      else if (label.includes('benefit') || label.includes('pension') || label.includes('retirement')) {
        if (!subsectionMap['c']) {
          subsectionMap['c'] = [];
          subsectionNames['c'] = section21SubsectionNames['c'];
        }
        subsectionMap['c'].push(field);
        // Remove from default
        subsectionMap['default'] = subsectionMap['default'].filter(f => f !== field);
      }
      // Business/Professional
      else if (label.includes('business') || label.includes('professional') || label.includes('employment')) {
        if (!subsectionMap['d1']) {
          subsectionMap['d1'] = [];
          subsectionNames['d1'] = section21SubsectionNames['d1'];
        }
        subsectionMap['d1'].push(field);
        // Remove from default
        subsectionMap['default'] = subsectionMap['default'].filter(f => f !== field);
      }
      // Government contact
      else if (label.includes('government') || label.includes('official') || label.includes('representative')) {
        if (!subsectionMap['e']) {
          subsectionMap['e'] = [];
          subsectionNames['e'] = section21SubsectionNames['e'];
        }
        subsectionMap['e'].push(field);
        // Remove from default
        subsectionMap['default'] = subsectionMap['default'].filter(f => f !== field);
      }
    }
  }
  
  // Remove empty subsections
  Object.keys(subsectionMap).forEach(key => {
    if (subsectionMap[key].length === 0) {
      delete subsectionMap[key];
      delete subsectionNames[key];
    }
  });
  
  return {
    subsections: subsectionMap,
    names: subsectionNames
  };
}

// Execute the main function
extractSectionFields().catch(error => {
  console.error('Error in field extraction:', error);
}); 