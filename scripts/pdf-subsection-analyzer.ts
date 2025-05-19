/**
 * PDF Field Subsection Analyzer
 * 
 * This script analyzes a field hierarchy JSON file to identify and categorize
 * subsections within each form section. It extends the functionality of the
 * pdf-field-validator.ts script to focus specifically on subsection patterns.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Define field data structure with subsection support
interface FieldData {
  name: string;
  value: string | boolean | string[];
  section?: number;
  subsection?: string;
  page?: number;
  label?: string;
}

// Define subsection information structure
interface SubsectionInfo {
  section: number;
  subsection: string;
  name: string;
  fieldCount: number;
  fields: string[];
  patterns: string[];
}

class SubsectionAnalyzer {
  private fieldMetadata: Record<string, any> = {};
  private sectionPageRanges: Record<number, [number, number]> = {};
  private outputDir: string;
  private reportDir: string;
  private subsectionPatterns: Record<number, string[]> = {};
  private rl: readline.Interface;
  
  constructor() {
    this.outputDir = path.join(process.cwd(), 'validation-results');
    this.reportDir = path.join(process.cwd(), 'reports');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // Initialize readline interface for user input
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Initialize known subsection patterns for each main section
    this.initializeKnownSubsectionPatterns();
  }
  
  /**
   * Initialize known subsection patterns for each section based on form structure
   */
  private initializeKnownSubsectionPatterns(): void {
    // Initialize with common subsection patterns (typically A, B, C, etc.)
    for (let i = 1; i <= 30; i++) {
      this.subsectionPatterns[i] = ['A', 'B', 'C', 'D', 'E'];
    }
    
    // Override with specific known patterns for certain sections
    // Section 21 - Mental Health
    this.subsectionPatterns[21] = ['A', 'B', 'C', 'D', 'E', 'D1', 'D2', 'D3', 'E1'];
    
    // Based on the fields we saw, update some additional sections
    this.subsectionPatterns[13] = ['A', 'B', 'C']; 
    this.subsectionPatterns[18] = ['A', 'B', 'C', 'D', 'E']; 
    this.subsectionPatterns[20] = ['A', 'B', 'C', 'D'];
  }
  
  /**
   * Initialize the analyzer by loading field metadata
   */
  async initialize(): Promise<void> {
    console.log('Initializing Subsection Analyzer...');
    
    try {
      // Load section page ranges if available
      try {
        const sectionRangesPath = path.join(this.reportDir, 'section-page-ranges.json');
        if (fs.existsSync(sectionRangesPath)) {
          this.sectionPageRanges = JSON.parse(fs.readFileSync(sectionRangesPath, 'utf8'));
          console.log(`Loaded section page ranges for ${Object.keys(this.sectionPageRanges).length} sections`);
        } else {
          // Define some default ranges based on the references
          this.sectionPageRanges = {
            1: [1, 1],
            2: [1, 1],
            // ... other sections
            21: [73, 76],
            // ... remaining sections
          };
          console.log('Using default section page ranges');
        }
      } catch (error) {
        console.warn('Error loading section page ranges:', error);
      }
      
      // Load metadata from existing reports
      const metadataPath = path.join(this.reportDir, 'field-metadata.json');
      const fieldSectionsPath = path.join(this.reportDir, 'field-sections.json');
      const fieldLabelsPath = path.join(this.reportDir, 'field-labels.json');
      
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        this.fieldMetadata = metadata.reduce((acc: Record<string, any>, field: any) => {
          acc[field.name] = field;
          return acc;
        }, {});
        console.log(`Loaded metadata for ${Object.keys(this.fieldMetadata).length} fields`);
      }
      
      // Load section information if available
      if (fs.existsSync(fieldSectionsPath)) {
        const sections = JSON.parse(fs.readFileSync(fieldSectionsPath, 'utf8'));
        for (const [fieldName, data] of Object.entries(sections)) {
          if (this.fieldMetadata[fieldName]) {
            this.fieldMetadata[fieldName].section = (data as any).section;
            this.fieldMetadata[fieldName].sectionName = (data as any).sectionName;
          }
        }
        console.log('Enhanced field metadata with section information');
      }
      
      // Load field labels if available
      if (fs.existsSync(fieldLabelsPath)) {
        const labels = JSON.parse(fs.readFileSync(fieldLabelsPath, 'utf8'));
        for (const [fieldName, label] of Object.entries(labels)) {
          if (this.fieldMetadata[fieldName]) {
            this.fieldMetadata[fieldName].label = label;
          }
        }
        console.log('Enhanced field metadata with label information');
      }
      
      console.log('Subsection Analyzer initialized successfully');
    } catch (error) {
      console.error('Error initializing Subsection Analyzer:', error);
      throw error;
    }
  }
  
  /**
   * Process field hierarchy file specifically for subsection analysis
   */
  async analyzeFieldHierarchy(data: any): Promise<FieldData[]> {
    console.log('Analyzing field hierarchy for subsection patterns...');
    
    const fields: FieldData[] = [];
    
    try {
      // Process field hierarchy
      if (typeof data === 'object' && data !== null) {
        // For each page in the hierarchy
        for (const [pageNum, pageData] of Object.entries(data)) {
          if (!pageData || typeof pageData !== 'object' || !('fieldsByValuePattern' in pageData)) continue;
          
          console.log(`Processing page ${pageNum}...`);
          
          // For each value pattern in the page
          for (const [patternKey, patternData] of Object.entries((pageData as any).fieldsByValuePattern)) {
            // For each regex pattern in the value pattern
            for (const [regexKey, regexData] of Object.entries((patternData as any).fieldsByRegex || {})) {
              // For each field in the regex pattern
              for (const field of ((regexData as any).fields || [])) {
                if (field && field.name) {
                  const fieldName = field.name;
                  
                  // Determine section and subsection
                  const section = field.section || this.determineSection(field);
                  const subsection = field.subsection || this.determineSubsection(field, section);
                  
                  if (section || subsection) {
                    fields.push({
                      name: fieldName,
                      value: field.value || 'Sample',
                      section: section,
                      subsection: subsection,
                      page: parseInt(pageNum as string),
                      label: field.label
                    });
                  }
                }
              }
            }
          }
        }
      } else if (Array.isArray(data)) {
        // If the hierarchy is an array of fields
        for (const field of data) {
          if (field && field.name) {
            const section = field.section || this.determineSection(field);
            const subsection = field.subsection || this.determineSubsection(field, section);
            
            if (section || subsection) {
              fields.push({
                name: field.name,
                value: field.value || 'Sample',
                section: section,
                subsection: subsection,
                page: field.page,
                label: field.label
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error analyzing field hierarchy:', error);
    }
    
    console.log(`Analyzed ${fields.length} fields with section/subsection information`);
    return fields;
  }
  
  /**
   * Determine the section for a field based on its metadata, name, or label
   */
  private determineSection(field: any): number | undefined {
    // If section is already specified, use it
    if (field.section && typeof field.section === 'number') {
      return field.section;
    }
    
    // If the field is in the metadata, use the section from there
    if (field.name && this.fieldMetadata[field.name]?.section) {
      return this.fieldMetadata[field.name].section;
    }
    
    // Try to extract section from field name (Section21A-DeclaredIncompetent)
    if (field.name) {
      const sectionMatch = field.name.match(/Section(\d+)[A-Z]?[-_]/i);
      if (sectionMatch && sectionMatch[1]) {
        return parseInt(sectionMatch[1]);
      }
    }
    
    // Try to extract from field label
    if (field.label) {
      const sectionMatch = field.label.match(/Section (\d+)[A-Z]?:/i);
      if (sectionMatch && sectionMatch[1]) {
        return parseInt(sectionMatch[1]);
      }
    }
    
    return undefined;
  }
  
  /**
   * Determine the subsection for a field based on patterns and naming conventions
   */
  private determineSubsection(field: any, section?: number): string | undefined {
    // Already has subsection
    if (field.subsection) {
      return field.subsection;
    }
    
    if (!section) {
      section = this.determineSection(field);
      if (!section) return undefined;
    }
    
    // Check field name pattern (e.g., "Section21A-DeclaredIncompetent")
    if (field.name) {
      // Primary pattern match: Section21a, section21a, Section21a[0], etc.
      const primaryPatternMatch = field.name.match(new RegExp(`[Ss]ection${section}([a-zA-Z]\\d*)(?:\\[|_|-|\\.)`, 'i'));
      if (primaryPatternMatch && primaryPatternMatch[1]) {
        return primaryPatternMatch[1].toUpperCase();
      }
      
      // Look for SectionXXA pattern
      const subsectionMatch = field.name.match(new RegExp(`Section${section}([A-Z]\\d*)[-_]`, 'i'));
      if (subsectionMatch && subsectionMatch[1]) {
        return subsectionMatch[1].toUpperCase();
      }
      
      // Look for XXA pattern (e.g., "21A-Question")
      const shortMatch = field.name.match(new RegExp(`${section}([A-Z]\\d*)[-_]`, 'i'));
      if (shortMatch && shortMatch[1]) {
        return shortMatch[1].toUpperCase();
      }
      
      // Look for SubsectionA pattern
      const subMatch = field.name.match(/Subsection([A-Z]\d*)/i);
      if (subMatch && subMatch[1]) {
        return subMatch[1].toUpperCase();
      }
      
      // Check for sections with explicit numbering like Section21a[0]
      // The trailing [0] often appears in form field identifiers
      const explicitMatch = field.name.match(new RegExp(`[Ss]ection${section}([a-zA-Z]\\d*)\\[\\d+\\]`, 'i'));
      if (explicitMatch && explicitMatch[1]) {
        return explicitMatch[1].toUpperCase();
      }
      
      // Check for numbered subsections like section21d1, section21d2, etc.
      const numberedMatch = field.name.match(new RegExp(`[Ss]ection${section}([a-zA-Z])(\\d+)`, 'i'));
      if (numberedMatch && numberedMatch[1]) {
        return `${numberedMatch[1].toUpperCase()}${numberedMatch[2]}`;
      }
      
      // Special case for sections with underscores: section_13_1, section_13_2
      const underscoredMatch = field.name.match(new RegExp(`section_${section}_(\\d+)`, 'i'));
      if (underscoredMatch && underscoredMatch[1]) {
        // Use a letter based on the number (1=A, 2=B, etc.)
        const subsectionLetter = String.fromCharCode(64 + parseInt(underscoredMatch[1]));
        return subsectionLetter;
      }
      
      // Match section ranges like section_13_1-2
      const rangeMatch = field.name.match(new RegExp(`section_${section}_(\\d+)-(\\d+)`, 'i'));
      if (rangeMatch && rangeMatch[1]) {
        // Use the first number as the subsection (1=A, 2=B, etc.)
        const subsectionLetter = String.fromCharCode(64 + parseInt(rangeMatch[1]));
        return subsectionLetter;
      }
    }
    
    // Check field label pattern (e.g., "Section 21A: Mental Health")
    if (field.label) {
      // Look for "Section XXA:" pattern
      const labelMatch = field.label.match(new RegExp(`Section ${section}([A-Z]\\d*):`, 'i'));
      if (labelMatch && labelMatch[1]) {
        return labelMatch[1].toUpperCase();
      }
      
      // Look for "XXA." pattern
      const shortLabelMatch = field.label.match(new RegExp(`${section}([A-Z]\\d*)\\.`, 'i'));
      if (shortLabelMatch && shortLabelMatch[1]) {
        return shortLabelMatch[1].toUpperCase();
      }
      
      // Look for "Subsection A:" pattern
      const subLabelMatch = field.label.match(/Subsection ([A-Z]\d*):/i);
      if (subLabelMatch && subLabelMatch[1]) {
        return subLabelMatch[1].toUpperCase();
      }
    }
    
    return undefined;
  }
  
  /**
   * Generate a subsection report with all identified subsections and their fields
   */
  generateSubsectionReport(fields: FieldData[]): SubsectionInfo[] {
    console.log('Generating subsection report...');
    
    // Group fields by section and subsection
    const subsectionMap: Record<string, SubsectionInfo> = {};
    
    for (const field of fields) {
      if (field.section && field.subsection) {
        const key = `${field.section}-${field.subsection}`;
        
        if (!subsectionMap[key]) {
          subsectionMap[key] = {
            section: field.section,
            subsection: field.subsection,
            name: `Section ${field.section}${field.subsection}`,
            fieldCount: 0,
            fields: [],
            patterns: []
          };
        }
        
        subsectionMap[key].fieldCount++;
        subsectionMap[key].fields.push(field.name);
        
        // Add field name pattern if it might help with identification
        const namePattern = this.extractPatternFromFieldName(field.name);
        if (namePattern && !subsectionMap[key].patterns.includes(namePattern)) {
          subsectionMap[key].patterns.push(namePattern);
        }
      }
    }
    
    // Convert to array and sort by section and subsection
    const subsections = Object.values(subsectionMap).sort((a, b) => {
      if (a.section !== b.section) {
        return a.section - b.section;
      }
      return a.subsection.localeCompare(b.subsection);
    });
    
    // Save the subsection report
    const reportPath = path.join(this.outputDir, 'subsection-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(subsections, null, 2));
    console.log(`Subsection report saved to: ${reportPath}`);
    
    return subsections;
  }
  
  /**
   * Extract patterns from field names that could help identify subsections
   */
  private extractPatternFromFieldName(fieldName: string): string | null {
    // Extract patterns like "Section21A-", "21A_", "SubsectionA-", etc.
    const patterns = [
      /Section(\d+)([A-Z])[-_]/i,
      /(\d+)([A-Z])[-_]/i,
      /Subsection([A-Z])[-_]/i
    ];
    
    for (const pattern of patterns) {
      const match = fieldName.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return null;
  }
  
  /**
   * Generate a mapping of fields to subsections
   */
  generateFieldSubsectionMapping(fields: FieldData[]): void {
    const mapping: Record<string, {section: number, subsection: string}> = {};
    
    for (const field of fields) {
      if (field.section && field.subsection) {
        mapping[field.name] = {
          section: field.section,
          subsection: field.subsection
        };
      }
    }
    
    // Save the field-to-subsection mapping
    const mappingPath = path.join(this.outputDir, 'field-subsection-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
    console.log(`Field-to-subsection mapping saved to: ${mappingPath}`);
  }
  
  /**
   * Generate a summary of subsection coverage statistics
   */
  generateSubsectionCoverageReport(subsections: SubsectionInfo[]): void {
    // Group by section
    const sectionMap: Record<number, {
      section: number,
      subsectionCount: number,
      fieldCount: number,
      subsections: string[]
    }> = {};
    
    for (const subsection of subsections) {
      if (!sectionMap[subsection.section]) {
        sectionMap[subsection.section] = {
          section: subsection.section,
          subsectionCount: 0,
          fieldCount: 0,
          subsections: []
        };
      }
      
      sectionMap[subsection.section].subsectionCount++;
      sectionMap[subsection.section].fieldCount += subsection.fieldCount;
      sectionMap[subsection.section].subsections.push(subsection.subsection);
    }
    
    // Convert to array and sort by section
    const sectionCoverage = Object.values(sectionMap).sort((a, b) => a.section - b.section);
    
    // Save the coverage report
    const coveragePath = path.join(this.outputDir, 'subsection-coverage.json');
    fs.writeFileSync(coveragePath, JSON.stringify(sectionCoverage, null, 2));
    console.log(`Subsection coverage report saved to: ${coveragePath}`);
    
    // Print summary to console
    console.log('\n========== SUBSECTION COVERAGE SUMMARY ==========');
    console.log(`Total sections with subsections: ${sectionCoverage.length}`);
    console.log(`Total subsections identified: ${subsections.length}`);
    
    console.log('\nSection breakdown:');
    for (const section of sectionCoverage) {
      console.log(`  Section ${section.section}: ${section.subsectionCount} subsections (${section.subsections.join(', ')}), ${section.fieldCount} fields`);
    }
    console.log('=================================================\n');
  }
  
  /**
   * Identify missing subsections based on known patterns
   */
  identifyMissingSubsections(subsections: SubsectionInfo[]): void {
    console.log('\nChecking for missing subsections based on patterns...');
    
    const missingSubsections: Array<{section: number, subsection: string}> = [];
    const foundSubsections: Record<number, string[]> = {};
    
    // Build a lookup of found subsections
    for (const subsection of subsections) {
      if (!foundSubsections[subsection.section]) {
        foundSubsections[subsection.section] = [];
      }
      
      foundSubsections[subsection.section].push(subsection.subsection);
    }
    
    // Check for missing subsections in each section
    for (const [sectionStr, expectedSubsections] of Object.entries(this.subsectionPatterns)) {
      const section = parseInt(sectionStr);
      const found = foundSubsections[section] || [];
      
      for (const expected of expectedSubsections) {
        if (!found.includes(expected)) {
          missingSubsections.push({
            section,
            subsection: expected
          });
        }
      }
    }
    
    // Save missing subsections report
    if (missingSubsections.length > 0) {
      const missingPath = path.join(this.outputDir, 'missing-subsections.json');
      fs.writeFileSync(missingPath, JSON.stringify(missingSubsections, null, 2));
      console.log(`Found ${missingSubsections.length} potentially missing subsections. Saved to: ${missingPath}`);
      
      console.log('\nPotentially missing subsections:');
      for (const missing of missingSubsections) {
        console.log(`  Section ${missing.section}${missing.subsection}`);
      }
    } else {
      console.log('No missing subsections identified based on known patterns.');
    }
  }
  
  /**
   * Suggest improvements to the subsection detection logic
   */
  suggestImprovements(fields: FieldData[], subsections: SubsectionInfo[]): void {
    console.log('\nAnalyzing detection patterns for potential improvements...');
    
    // Track fields with sections but no subsections
    const fieldsWithoutSubsections = fields.filter(f => f.section && !f.subsection);
    
    if (fieldsWithoutSubsections.length > 0) {
      console.log(`Found ${fieldsWithoutSubsections.length} fields with section but no subsection assigned.`);
      
      // Group by section for analysis
      const bySection: Record<number, string[]> = {};
      
      for (const field of fieldsWithoutSubsections) {
        if (!field.section) continue;
        
        if (!bySection[field.section]) {
          bySection[field.section] = [];
        }
        
        bySection[field.section].push(field.name);
      }
      
      // Analyze each section for patterns
      for (const [sectionStr, fieldNames] of Object.entries(bySection)) {
        if (fieldNames.length > 5) {
          console.log(`  Section ${sectionStr}: ${fieldNames.length} fields without subsection. Sample field names:`);
          for (const name of fieldNames.slice(0, 5)) {
            console.log(`    - ${name}`);
          }
        }
      }
      
      // Save unassigned fields for further analysis
      const unassignedPath = path.join(this.outputDir, 'unassigned-subsection-fields.json');
      fs.writeFileSync(unassignedPath, JSON.stringify(
        fieldsWithoutSubsections.map(f => ({
          name: f.name,
          section: f.section,
          label: f.label
        })), 
        null, 
        2
      ));
      console.log(`\nSaved unassigned fields to: ${unassignedPath}`);
      
      // Suggest improvements based on analysis
      console.log('\nSuggested improvements:');
      console.log('  1. Analyze unassigned fields to identify additional subsection patterns');
      console.log('  2. Check section definitions in the form documentation');
      console.log('  3. Consider manual mapping for fields in sections with low subsection coverage');
    } else {
      console.log('All fields with sections have subsections assigned.');
    }
  }
  
  /**
   * Run the complete analysis process for a field hierarchy JSON
   */
  async analyzeHierarchy(hierarchyPath: string): Promise<void> {
    try {
      console.log(`Starting subsection analysis of field hierarchy: ${hierarchyPath}`);
      
      // Initialize the analyzer
      await this.initialize();
      
      // Load and parse the hierarchy
      const hierarchyData = JSON.parse(fs.readFileSync(hierarchyPath, 'utf8'));
      
      // Analyze the field hierarchy specifically for subsections
      const analyzedFields = await this.analyzeFieldHierarchy(hierarchyData);
      console.log(`Analyzed ${analyzedFields.length} fields for subsection information`);
      
      // Generate the subsection report
      const subsections = this.generateSubsectionReport(analyzedFields);
      
      // Generate field-to-subsection mapping
      this.generateFieldSubsectionMapping(analyzedFields);
      
      // Generate subsection coverage report
      this.generateSubsectionCoverageReport(subsections);
      
      // Identify potentially missing subsections
      this.identifyMissingSubsections(subsections);
      
      // Suggest improvements to detection logic
      this.suggestImprovements(analyzedFields, subsections);
      
      console.log('\nSubsection analysis complete! Results saved to validation-results directory.');
    } catch (error) {
      console.error('Error in subsection analysis process:', error);
      throw error;
    } finally {
      if (this.rl) {
        this.rl.close();
      }
    }
  }
}

// Main execution
async function main() {
  if (process.argv.length < 3) {
    console.error('Usage: npx tsx scripts/pdf-subsection-analyzer.ts <path-to-field-hierarchy.json>');
    process.exit(1);
  }
  
  const hierarchyPath = process.argv[2];
  
  if (!fs.existsSync(hierarchyPath)) {
    console.error(`Error: Field hierarchy file not found at ${hierarchyPath}`);
    process.exit(1);
  }
  
  const analyzer = new SubsectionAnalyzer();
  await analyzer.analyzeHierarchy(hierarchyPath);
}

// Run the script
main().catch(console.error); 