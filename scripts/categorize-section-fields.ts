/**
 * Section Field Categorization Tool
 * 
 * This script analyzes fields for a specific section and suggests
 * subsection categorization based on field name patterns.
 * 
 * Usage: npx tsx scripts/categorize-section-fields.ts <section-number>
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

interface FieldInfo {
  name: string;
  section?: number;
  subsection?: string;
  label?: string;
  value?: string | boolean | string[];
  type?: string;
  id?: string;
  confidence?: number;
}

interface PatternGroup {
  pattern: string;
  count: number;
  fields: string[];
  possibleSubsection?: string;
  confidence: number;
}

class SectionFieldCategorizer {
  private fields: FieldInfo[] = [];
  private patternGroups: Record<string, PatternGroup> = {};
  private sectionNumber: number;
  private outputDir: string = 'validation-results';
  private knownPatterns: Record<string, string> = {};
  
  constructor(sectionNumber: number) {
    this.sectionNumber = sectionNumber;
    
    // Initialize known pattern mappings
    this.initializeKnownPatterns();
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }
  
  /**
   * Initialize known section patterns based on documentation or analysis
   */
  private initializeKnownPatterns() {
    // Section 21 (Mental Health) patterns
    if (this.sectionNumber === 21) {
      this.knownPatterns = {
        'section21a': 'A',
        'section21b': 'B',
        'section21c': 'C',
        'section21d1': 'D1',
        'section21d2': 'D2',
        'section21d3': 'D3',
        'section21e': 'E',
        'section21e1': 'E1',
        '21a': 'A',
        '21b': 'B',
        '21c': 'C',
        '21d1': 'D1',
        '21d2': 'D2',
        '21d3': 'D3',
        '21e': 'E'
      };
    }
    // Add other section-specific patterns as needed
  }
  
  /**
   * Load field data from field-hierarchy.json
   */
  async loadFieldData(fieldHierarchyPath: string): Promise<void> {
    try {
      console.log(`Loading field data from ${fieldHierarchyPath}...`);
      
      // Read and parse the field hierarchy data
      const fieldData = fs.readFileSync(fieldHierarchyPath, 'utf8');
      const jsonData = JSON.parse(fieldData);
      
      // Process section data if present
      if (jsonData[this.sectionNumber.toString()]) {
        console.log(`Found data for section ${this.sectionNumber}`);
        await this.extractFieldsFromSection(jsonData[this.sectionNumber.toString()]);
      } else {
        // Try alternate format - sometimes field-hierarchy might store section data differently
        console.log('Checking alternate format...');
        let found = false;
        
        // Look for a "Section21" format (with capital S)
        const capitalSectionKey = `Section${this.sectionNumber}`;
        if (jsonData[capitalSectionKey]) {
          console.log(`Found data using capital format: ${capitalSectionKey}`);
          await this.extractFieldsFromSection(jsonData[capitalSectionKey]);
          found = true;
        }
        
        // Look for section data in a different nested structure
        if (!found) {
          console.log(`Section ${this.sectionNumber} not found as a direct key, searching in all data...`);
          await this.searchForFields(jsonData);
        }
      }
      
      console.log(`Found ${this.fields.length} fields for section ${this.sectionNumber}`);
      
      // If we still have no fields, try a more aggressive search
      if (this.fields.length === 0) {
        console.log('No fields found with standard search, trying aggressive search...');
        await this.aggressiveFieldSearch(jsonData);
        console.log(`After aggressive search: found ${this.fields.length} fields`);
      }
    } catch (error) {
      console.error('Error loading field data:', error);
      throw error;
    }
  }
  
  /**
   * Extract fields from section data
   */
  private async extractFieldsFromSection(sectionData: any): Promise<void> {
    console.log('Extracting fields from section data...');
    let extractedFields: FieldInfo[] = [];
    
    try {
      // Handle fieldsByValuePattern structure
      if (sectionData.fieldsByValuePattern) {
        console.log('Found fieldsByValuePattern structure');
        
        // Iterate through each pattern
        for (const patternKey of Object.keys(sectionData.fieldsByValuePattern)) {
          const patternData = sectionData.fieldsByValuePattern[patternKey];
          console.log(`Processing pattern: ${patternKey}`);
          
          // Process fieldsByRegex if present
          if (patternData.fieldsByRegex) {
            for (const regexKey of Object.keys(patternData.fieldsByRegex)) {
              const regexData = patternData.fieldsByRegex[regexKey];
              
              if (regexData.fields && Array.isArray(regexData.fields)) {
                console.log(`Found ${regexData.fields.length} fields in regex ${regexKey}`);
                for (const field of regexData.fields) {
                  const fieldWithSection = {
                    ...field,
                    section: this.sectionNumber
                  };
                  extractedFields.push(fieldWithSection);
                }
              }
            }
          }
          
          // Process fields at pattern level
          if (patternData.fields && Array.isArray(patternData.fields)) {
            console.log(`Found ${patternData.fields.length} fields at pattern level`);
            for (const field of patternData.fields) {
              const fieldWithSection = {
                ...field,
                section: this.sectionNumber
              };
              extractedFields.push(fieldWithSection);
            }
          }
        }
      } else {
        // Generic recursive field extraction if fieldsByValuePattern not found
        extractedFields = this.extractFieldsRecursive(sectionData, this.sectionNumber);
      }
      
      this.fields = extractedFields;
      console.log(`Successfully extracted ${this.fields.length} fields`);
    } catch (error) {
      console.error('Error during field extraction:', error);
      throw error;
    }
  }
  
  /**
   * Extract fields recursively from nested structure
   */
  private extractFieldsRecursive(data: any, sectionNumber: number): FieldInfo[] {
    const fields: FieldInfo[] = [];
    
    // If this is an array of fields
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.section === sectionNumber || (!item.section && item.name && this.fieldBelongsToSection(item.name, sectionNumber))) {
          const fieldWithSection = {
            ...item,
            section: sectionNumber
          };
          fields.push(fieldWithSection);
        }
      }
      return fields;
    }
    
    // If this is an object with nested data
    if (typeof data === 'object' && data !== null) {
      // Check for fields array
      if (data.fields && Array.isArray(data.fields)) {
        for (const field of data.fields) {
          if (field.section === sectionNumber || (!field.section && field.name && this.fieldBelongsToSection(field.name, sectionNumber))) {
            const fieldWithSection = {
              ...field,
              section: sectionNumber
            };
            fields.push(fieldWithSection);
          }
        }
      }
      
      // Check for fieldsByValuePattern
      if (data.fieldsByValuePattern) {
        for (const patternKey of Object.keys(data.fieldsByValuePattern)) {
          const patternData = data.fieldsByValuePattern[patternKey];
          
          // Process fieldsByRegex
          if (patternData.fieldsByRegex) {
            for (const regexKey of Object.keys(patternData.fieldsByRegex)) {
              const regexData = patternData.fieldsByRegex[regexKey];
              
              if (regexData.fields && Array.isArray(regexData.fields)) {
                for (const field of regexData.fields) {
                  if (field.section === sectionNumber || (!field.section && field.name && this.fieldBelongsToSection(field.name, sectionNumber))) {
                    const fieldWithSection = {
                      ...field,
                      section: sectionNumber
                    };
                    fields.push(fieldWithSection);
                  }
                }
              }
            }
          }
          
          // Process fields at pattern level
          if (patternData.fields && Array.isArray(patternData.fields)) {
            for (const field of patternData.fields) {
              if (field.section === sectionNumber || (!field.section && field.name && this.fieldBelongsToSection(field.name, sectionNumber))) {
                const fieldWithSection = {
                  ...field,
                  section: sectionNumber
                };
                fields.push(fieldWithSection);
              }
            }
          }
        }
      }
      
      // Recursively process all other object properties
      for (const key of Object.keys(data)) {
        if (typeof data[key] === 'object' && data[key] !== null && key !== 'fields' && key !== 'fieldsByValuePattern' && key !== 'fieldsByRegex') {
          const nestedFields = this.extractFieldsRecursive(data[key], sectionNumber);
          fields.push(...nestedFields);
        }
      }
    }
    
    return fields;
  }
  
  /**
   * Search for fields in the entire data structure
   */
  private async searchForFields(data: any): Promise<void> {
    const foundFields: FieldInfo[] = [];
    
    // Search through all sections
    for (const sectionKey of Object.keys(data)) {
      const sectionData = data[sectionKey];
      
      // Recursively extract fields from this section
      const extractedFields = this.extractFieldsRecursive(sectionData, this.sectionNumber);
      
      // Add any fields found that belong to our target section
      foundFields.push(...extractedFields);
    }
    
    this.fields = foundFields;
  }
  
  /**
   * Check if a field likely belongs to a section based on its name
   */
  private fieldBelongsToSection(fieldName: string, sectionNumber: number): boolean {
    const sectionPattern = new RegExp(`[Ss]ection(?:_)?${sectionNumber}\\b|\\bsection${sectionNumber}\\b|\\b${sectionNumber}[A-Za-z]`);
    return sectionPattern.test(fieldName);
  }
  
  /**
   * Analyze fields and group by patterns
   */
  analyzeSectionFields(): void {
    console.log(`Analyzing ${this.fields.length} fields for section ${this.sectionNumber}...`);
    
    // Extract patterns from field names
    for (const field of this.fields) {
      const patterns = this.extractPatternsFromFieldName(field.name);
      
      for (const pattern of patterns) {
        if (!this.patternGroups[pattern]) {
          this.patternGroups[pattern] = {
            pattern,
            count: 0,
            fields: [],
            confidence: 0.5 // Default confidence
          };
        }
        
        this.patternGroups[pattern].count++;
        this.patternGroups[pattern].fields.push(field.name);
      }
    }
    
    // Sort pattern groups by count
    const sortedPatterns = Object.values(this.patternGroups).sort((a, b) => b.count - a.count);
    
    // Analyze each pattern group and determine possible subsection
    for (const group of sortedPatterns) {
      const subsection = this.determineSubsectionFromPattern(group.pattern);
      if (subsection) {
        group.possibleSubsection = subsection;
        group.confidence = 0.8; // Higher confidence for recognized patterns
      }
    }
    
    // Log results
    console.log(`\nFound ${Object.keys(this.patternGroups).length} distinct patterns in section ${this.sectionNumber} fields\n`);
    
    const subsectionGroups: Record<string, string[]> = {};
    
    // Group by identified subsection
    for (const group of sortedPatterns) {
      if (group.possibleSubsection) {
        if (!subsectionGroups[group.possibleSubsection]) {
          subsectionGroups[group.possibleSubsection] = [];
        }
        subsectionGroups[group.possibleSubsection].push(group.pattern);
      }
    }
    
    // Display subsection groups
    console.log('Identified Subsections:');
    for (const [subsection, patterns] of Object.entries(subsectionGroups)) {
      console.log(`\nSubsection ${subsection}:`);
      console.log(`  Patterns: ${patterns.join(', ')}`);
      console.log(`  Field count: ${patterns.reduce((sum, pattern) => sum + this.patternGroups[pattern].count, 0)}`);
    }
    
    // Display unknown patterns
    console.log('\nUnknown Patterns:');
    for (const group of sortedPatterns) {
      if (!group.possibleSubsection && group.count > 5) { // Only show significant unknown patterns
        console.log(`  "${group.pattern}" (${group.count} fields)`);
      }
    }
    
    // Save results to file
    this.saveResults(sortedPatterns, subsectionGroups);
  }
  
  /**
   * Extract patterns from a field name
   */
  private extractPatternsFromFieldName(fieldName: string): string[] {
    const patterns: string[] = [];
    const fieldNameLower = fieldName.toLowerCase();
    
    // Look for section patterns
    const sectionPattern = new RegExp(`section${this.sectionNumber}([a-z]\\d*)`, 'i');
    const sectionMatch = fieldNameLower.match(sectionPattern);
    if (sectionMatch && sectionMatch[1]) {
      patterns.push(`section${this.sectionNumber}${sectionMatch[1].toLowerCase()}`);
    }
    
    // Look for section_X_Y patterns
    const underscorePattern = new RegExp(`section_${this.sectionNumber}_(\\d+)`, 'i');
    const underscoreMatch = fieldNameLower.match(underscorePattern);
    if (underscoreMatch && underscoreMatch[1]) {
      patterns.push(`section_${this.sectionNumber}_${underscoreMatch[1]}`);
    }
    
    // Look for form IDs with section (e.g., form1[0].Section21[0])
    const formPattern = new RegExp(`form\\d+\\[\\d+\\]\\.section${this.sectionNumber}([a-z]\\d*)`, 'i');
    const formMatch = fieldNameLower.match(formPattern);
    if (formMatch && formMatch[1]) {
      patterns.push(`section${this.sectionNumber}${formMatch[1].toLowerCase()}`);
    }
    
    // Look for abbreviated patterns (e.g., 21A, 21B)
    const abbreviatedPattern = new RegExp(`${this.sectionNumber}([a-z]\\d*)`, 'i');
    const abbreviatedMatch = fieldNameLower.match(abbreviatedPattern);
    if (abbreviatedMatch && abbreviatedMatch[1]) {
      patterns.push(`${this.sectionNumber}${abbreviatedMatch[1].toLowerCase()}`);
    }
    
    // Add form structure pattern if present
    if (fieldNameLower.includes(`section${this.sectionNumber}[`)) {
      patterns.push(`section${this.sectionNumber}`);
    }
    
    // If no specific pattern found, use generic section identifier
    if (patterns.length === 0 && fieldNameLower.includes(`section${this.sectionNumber}`)) {
      patterns.push(`section${this.sectionNumber}`);
    }
    
    // If no patterns identified but field belongs to section, use field path components
    if (patterns.length === 0) {
      const components = fieldName.split(/[.\[\]]/);
      for (const component of components) {
        const compLower = component.toLowerCase();
        if (compLower.includes(`section${this.sectionNumber}`) || 
            compLower.includes(`section_${this.sectionNumber}`) ||
            compLower.match(new RegExp(`\\b${this.sectionNumber}[a-z]\\d*\\b`, 'i'))) {
          patterns.push(compLower);
          break;
        }
      }
    }
    
    return patterns;
  }
  
  /**
   * Determine subsection from pattern
   */
  private determineSubsectionFromPattern(pattern: string): string | undefined {
    // Check known patterns first
    if (this.knownPatterns[pattern]) {
      return this.knownPatterns[pattern];
    }
    
    // Try to extract subsection letter/number
    const patternLower = pattern.toLowerCase();
    
    // Check for direct section+subsection pattern (e.g., section21a)
    const directMatch = patternLower.match(new RegExp(`section${this.sectionNumber}([a-z]\\d*)`, 'i'));
    if (directMatch && directMatch[1]) {
      return directMatch[1].toUpperCase();
    }
    
    // Check for underscore pattern (e.g., section_21_1)
    const underscoreMatch = patternLower.match(new RegExp(`section_${this.sectionNumber}_(\\d+)`, 'i'));
    if (underscoreMatch && underscoreMatch[1]) {
      // Convert number to letter (1->A, 2->B, etc.)
      const num = parseInt(underscoreMatch[1], 10);
      return String.fromCharCode(64 + num);
    }
    
    // Check for abbreviated pattern (e.g., 21a)
    const abbreviatedMatch = patternLower.match(new RegExp(`${this.sectionNumber}([a-z]\\d*)`, 'i'));
    if (abbreviatedMatch && abbreviatedMatch[1]) {
      return abbreviatedMatch[1].toUpperCase();
    }
    
    return undefined;
  }
  
  /**
   * Save results to file
   */
  private saveResults(patterns: PatternGroup[], subsectionGroups: Record<string, string[]>): void {
    const outputPath = path.join(this.outputDir, `section${this.sectionNumber}-analysis.json`);
    
    const result = {
      section: this.sectionNumber,
      totalFields: this.fields.length,
      patternGroups: patterns,
      subsectionGroups,
      // Generate field to subsection mapping
      fieldMapping: this.generateFieldMapping()
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\nAnalysis saved to: ${path.resolve(outputPath)}`);
    
    // Save field list with suggested subsections
    this.saveFieldList();
  }
  
  /**
   * Generate field to subsection mapping
   */
  private generateFieldMapping(): Record<string, string> {
    const mapping: Record<string, string> = {};
    
    for (const field of this.fields) {
      const patterns = this.extractPatternsFromFieldName(field.name);
      let subsection: string | undefined;
      
      // Try to find a subsection from any of the patterns
      for (const pattern of patterns) {
        const possibleSubsection = this.determineSubsectionFromPattern(pattern);
        if (possibleSubsection) {
          subsection = possibleSubsection;
          break;
        }
      }
      
      if (subsection) {
        mapping[field.name] = subsection;
      }
    }
    
    return mapping;
  }
  
  /**
   * Save list of fields with suggested subsections
   */
  private saveFieldList(): void {
    const outputPath = path.join(this.outputDir, `section${this.sectionNumber}-fields.csv`);
    
    // Create CSV header
    let csv = 'Field Name,Suggested Subsection,Label,Type\n';
    
    // Add each field
    for (const field of this.fields) {
      const patterns = this.extractPatternsFromFieldName(field.name);
      let subsection = 'UNKNOWN';
      
      // Try to find a subsection from any of the patterns
      for (const pattern of patterns) {
        const possibleSubsection = this.determineSubsectionFromPattern(pattern);
        if (possibleSubsection) {
          subsection = possibleSubsection;
          break;
        }
      }
      
      // Escape any commas in the values
      const escapedName = field.name.replace(/,/g, '\\,');
      const escapedLabel = field.label ? field.label.replace(/,/g, '\\,') : '';
      const escapedType = field.type ? field.type.replace(/,/g, '\\,') : '';
      
      csv += `${escapedName},${subsection},${escapedLabel},${escapedType}\n`;
    }
    
    fs.writeFileSync(outputPath, csv);
    console.log(`Field list saved to: ${path.resolve(outputPath)}`);
  }

  /**
   * Aggressive search for fields in any structure
   */
  private async aggressiveFieldSearch(data: any): Promise<void> {
    const foundFields: FieldInfo[] = [];
    
    // Function to recursively traverse all objects and arrays
    const traverse = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      // If it's an array
      if (Array.isArray(obj)) {
        for (const item of obj) {
          // If it looks like a field object with a name property
          if (item && typeof item === 'object' && item.name) {
            // Check if it belongs to our section or has a section21 name pattern
            if ((item.section === this.sectionNumber) || 
                (typeof item.name === 'string' && this.fieldBelongsToSection(item.name, this.sectionNumber))) {
              foundFields.push({
                ...item,
                section: this.sectionNumber
              });
            }
          }
          // Continue traversing
          traverse(item);
        }
      } else {
        // It's an object, process each property
        for (const key of Object.keys(obj)) {
          traverse(obj[key]);
        }
      }
    };
    
    // Start recursive traversal
    traverse(data);
    this.fields = foundFields;
  }
}

/**
 * Main function
 */
async function main() {
  if (process.argv.length < 3) {
    console.log('Usage: npx tsx scripts/categorize-section-fields.ts <section-number>');
    process.exit(1);
  }
  
  const sectionNumber = parseInt(process.argv[2], 10);
  
  if (isNaN(sectionNumber)) {
    console.error('Error: Section number must be a valid integer');
    process.exit(1);
  }
  
  try {
    const categorizer = new SectionFieldCategorizer(sectionNumber);
    
    // Default path to field hierarchy
    const fieldHierarchyPath = path.resolve('reports/field-hierarchy.json');
    
    await categorizer.loadFieldData(fieldHierarchyPath);
    categorizer.analyzeSectionFields();
    
    console.log('\nSection field categorization complete!');
    console.log('Run this tool on other sections to categorize those fields');
  } catch (error) {
    console.error('Error running section field categorizer:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 