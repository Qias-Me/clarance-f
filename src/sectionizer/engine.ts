/**
 * SF-86 Sectionizer Rule Engine Core
 * 
 * This file implements the core rule engine that applies section-specific regex maps
 * to categorize fields into their respective sections and sub-sections.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { CategorizedField, PDFField } from './utils/extractFieldsBySection.js';
import type { MatchRule, EnhancedField } from './types.js';
import { confidenceCalculator } from './utils/confidence-calculator.js';
import { ruleLoader } from './utils/rule-loader.js';
import { rulesGenerator } from './utils/rules-generator.js';

/**
 * Interface defining a rule for field categorization
 */
export interface CategoryRule {
  section: number;           // Section number (1-30)
  subsection?: string;       // Subsection identifier (e.g., "A", "B", "C")
  pattern: RegExp | string;  // Regex pattern to match field name or label
  confidence: number;        // Confidence level (0-1) for the match
  description?: string;      // Human-readable description of the rule
  fieldType?: string[];      // Optional array of field types this rule applies to
  entryPattern?: RegExp | string; // Optional pattern to extract entry index
}

/**
 * Interface for a rule file containing a set of rules for a specific section
 */
export interface SectionRules {
  section: number;            // Section number
  name: string;               // Section name
  rules: CategoryRule[];      // Array of categorization rules
}

/**
 * Section categorization result 
 */
export interface CategorizationResult {
  section: number;           // Section number (1-30)
  subsection?: string;       // Subsection identifier (if applicable)
  entry?: number;            // Entry index within a subsection (if applicable)
  confidence: number;        // Confidence score (0-1)
  rule?: CategoryRule;       // The rule that was matched (if any)
}

/**
 * Rule Engine for SF-86 field categorization
 */
export class RuleEngine {
  private rules: CategoryRule[] = [];
  private sectionRules: Record<number, SectionRules> = {};
  // Define strict patterns for critical sections
  private strictSectionPatterns: Record<number, RegExp[]> = {
    1: [
      /form1\[0\]\.Sections1-6\[0\]\.TextField11\[0\]/i, // Last name
      /form1\[0\]\.Sections1-6\[0\]\.TextField11\[1\]/i, // First name
      /form1\[0\]\.Sections1-6\[0\]\.TextField11\[2\]/i, // Middle name
      /form1\[0\]\.Sections1-6\[0\]\.suffix\[0\]/i, // Name suffix
    ],
    2: [
      /form1\[0\]\.Sections1-6\[0\]\.From_Datefield_Name_2\[0\]/i, // Date of Birth field
      /form1\[0\]\.Sections1-6\[0\]\.#field\[18\]/i, // Estimate checkbox
    ],
    3: [
      /form1\[0\]\.Sections1-6\[0\]\.TextField11\[3\]/i, // Birth city
      /form1\[0\]\.Sections1-6\[0\]\.TextField11\[4\]/i, // Birth county
      /form1\[0\]\.Sections1-6\[0\]\.School6_State\[0\]/i, // Birth state
      /form1\[0\]\.Sections1-6\[0\]\.DropDownList1\[0\]/i, // Birth country
    ],
    4: [
      /form1\[0\]\.Sections1-6\[0\]\.SSN\[0\]/i, // Primary SSN field
      /form1\[0\]\.Sections1-6\[0\]\.SSN\[1\]/i, // Secondary SSN field
      /\.SSN\[\d+\]/i, // Any SSN field
      /SSN/i, // Any field with SSN in the name
      /Social Security Number/i, // Any field with 'Social Security Number' label
    ],
    5: [
      /form1\[0\]\.Sections1-6\[0\]\.section5\[0\]/i,
      /form1\[0\]\.Sections1-6\[0\]\.section5\[0\]\.#area\[0\]\.From_Datefield_Name_2\[0\]/i,
    ],
    6: [
      /form1\[0\]\.Sections1-6\[0\]\.DropDownList7\[0\]/i, // Height in inches
      /form1\[0\]\.Sections1-6\[0\]\.DropDownList8\[0\]/i, // Height in feet
      /form1\[0\]\.Sections1-6\[0\]\.DropDownList9\[0\]/i, // Eye color
      /form1\[0\]\.Sections1-6\[0\]\.DropDownList10\[0\]/i, // Hair color
      /form1\[0\]\.Sections1-6\[0\]\.p3-rb3b\[0\]/i, // Sex Male or Female
      /form1\[0\]\.Sections1-6\[0\]\.TextField11\[5\]/i, // Weight in pounds
    ],
    13: [
      /form1\[0\]\.section_13_1\[\d+\]\.From_Datefield_Name_2\[0\]/i, // Section 13 date fields
    ],
    16: [
      /form1\[0\]\.Section16_1\[0\]\.#area\[0\]\.From_Datefield_Name_2\[0\]/i, // Section 16 date fields
    ]
  };

  /**
   * Create a new rule engine
   * @param rulesDir Directory containing section rule files
   */
  constructor(private rulesDir: string = path.resolve(process.cwd(), 'src', 'sectionizer', 'rules')) {}

  /**
   * Load all rule files from the rules directory
   */
  public async loadRules(): Promise<void> {
    // Create the rules directory if it doesn't exist
    if (!fs.existsSync(this.rulesDir)) {
      fs.mkdirSync(this.rulesDir, { recursive: true });
    }

    // Get available sections from rule loader
    const sectionNumbers = await ruleLoader.getAvailableSections();
    
    // Reset rules collections
    this.rules = [];
    this.sectionRules = {};
    
    // Track total loaded rules for accurate reporting
    let totalRulesLoaded = 0;
    let sectionsWithRules = 0;
    
    // Load rules for each section
    for (const sectionStr of sectionNumbers) {
      try {
        const section = parseInt(sectionStr);
        const ruleSet = await this.loadRulesForSection(sectionStr);
        
        if (ruleSet.rules && ruleSet.rules.length > 0) {
          // Convert MatchRules to CategoryRules
          const categoryRules: CategoryRule[] = ruleSet.rules.map((rule: any) => ({
            section,
            subsection: rule.subSection,
            pattern: rule.pattern,
            confidence: rule.confidence || 0.7,
            description: rule.description,
            entryPattern: rule.entryIndex ? undefined : undefined, // Placeholder for compatibility
          }));
          
          // Create section rule entry
          this.sectionRules[section] = {
            section,
            name: `Section ${section}`,
            rules: categoryRules
          };
          
          // Add to master rules collection
          this.rules.push(...categoryRules);
          
          totalRulesLoaded += ruleSet.rules.length;
          sectionsWithRules++;
          
          console.log(`Loaded ${ruleSet.rules.length} rules for section ${section}`);
        }
      } catch (error) {
        console.error(`Error loading rules for section ${sectionStr}:`, error);
      }
    }
    
    console.log(`Loaded a total of ${totalRulesLoaded} rules from ${sectionsWithRules} sections.`);
  }
  
  /**
   * Loads rules for a specific section
   * @param section The section number as a string
   * @returns SectionRuleSet containing rules and exclusions
   */
  private async loadRulesForSection(section: string): Promise<any> {
    return ruleLoader.loadRules(section);
  }

  /**
   * Get all rules for a specific section
   * @param section Section number (1-30)
   * @returns Array of rules for the specified section
   */
  public getRulesForSection(section: number): CategoryRule[] {
    return this.sectionRules[section]?.rules || [];
  }

  /**
   * Match a field against all available rules
   * @param field PDF field to categorize
   * @returns The best categorization result or undefined if no rules match
   */
  public categorizeField(field: PDFField): CategorizationResult | undefined {
    // Handle special case for "Not applicable" checkbox in Section 1
    if (field.name === "form1[0].Sections1-6[0].CheckBox1[0]" && field.label === "Not applicable") {
      return {
        section: 5,
        confidence: 0.99,
        rule: {
          section: 5,
          pattern: "form1[0].Sections1-6[0].CheckBox1[0]",
          confidence: 0.99,
          description: "Exact match for Not applicable checkbox"
        }
      };
    }

    let bestMatch: CategorizationResult | undefined = undefined;
    
    // Special handling for critical sections with strict pattern matching
    for (const [sectionStr, patterns] of Object.entries(this.strictSectionPatterns)) {
      const section = parseInt(sectionStr);
      
      // Check if the field matches any of the strict patterns for this section
      const matchesStrict = patterns.some(pattern => pattern.test(field.name));
      
      if (matchesStrict) {
        return {
          section,
          confidence: 0.99,
          rule: {
            section,
            pattern: patterns[0], // Use the first pattern as reference
            confidence: 0.99,
            description: `Strict pattern match for section ${section}`
          }
        };
      }
    }
    
    // Try to match against each rule
    for (const rule of this.rules) {
      // Check if the rule is restricted to specific field types
      if (rule.fieldType && field.type && !rule.fieldType.includes(field.type)) {
        continue;
      }
      
      // Test the pattern against field name and label
      const pattern = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern as string, 'i');
      const nameMatch = pattern.test(field.name);
      const labelMatch = field.label ? pattern.test(field.label) : false;
      
      // If the pattern matches, update the best match if the confidence is higher
      if (nameMatch || labelMatch) {
        // Determine confidence - label matches are weighted more heavily
        const currentConfidence = (nameMatch ? 0.7 : 0) + (labelMatch ? 0.9 : 0);
        const adjustedConfidence = Math.min(1, currentConfidence * rule.confidence);
        
        // Extract entry index if a pattern is provided
        let entry: number | undefined = undefined;
        if (rule.entryPattern) {
          const entryPattern = rule.entryPattern instanceof RegExp ? 
            rule.entryPattern : new RegExp(rule.entryPattern as string, 'i');
          const nameEntryMatch = field.name.match(entryPattern);
          const labelEntryMatch = field.label ? field.label.match(entryPattern) : null;
          
          if (nameEntryMatch && nameEntryMatch[1]) {
            entry = parseInt(nameEntryMatch[1], 10);
          } else if (labelEntryMatch && labelEntryMatch[1]) {
            entry = parseInt(labelEntryMatch[1], 10);
          }
        }
        
        // Update best match if this rule has higher confidence
        if (!bestMatch || adjustedConfidence > bestMatch.confidence) {
          bestMatch = {
            section: rule.section,
            subsection: rule.subsection,
            entry,
            confidence: adjustedConfidence,
            rule
          };
        }
      }
    }
    
    return bestMatch;
  }

  /**
   * Categorize a batch of fields using the rule engine
   * @param fields Array of PDF fields to categorize
   * @returns Array of categorized fields with section information
   */
  public categorizeFields(fields: PDFField[]): CategorizedField[] {
    const categorizedFields = fields.map(field => {
      const result = this.categorizeField(field);
      
      return {
        ...field,
        section: result?.section || 0,
        subsection: result?.subsection,
        entry: result?.entry,
        confidence: result?.confidence || 0
      };
    });
    
    // Validate section assignments for strict sections
    return this.validateSectionAssignments(categorizedFields);
  }

  /**
   * Validate section assignments to ensure accuracy
   * @param fields Categorized fields to validate
   * @returns Validated fields with corrected section assignments
   */
  private validateSectionAssignments(fields: CategorizedField[]): CategorizedField[] {
    // Track corrections for debugging
    const corrections: Record<string, number> = { total: 0 };
    
    // Create a copy of the fields to avoid modifying the originals
    const validatedFields = fields.map(field => {
      // Skip fields that are already uncategorized
      if (field.section === 0) return field;
      
      // Check if field belongs to a section with strict patterns
      if (field.section in this.strictSectionPatterns) {
        const sectionId = field.section;
        const patterns = this.strictSectionPatterns[sectionId];
        
        // If the field doesn't match any of the strict patterns for its assigned section,
        // mark it as uncategorized (or try to find a better match)
        if (!patterns.some(pattern => pattern.test(field.name))) {
          // Try to find a different strict section that matches
          for (const [otherSectionStr, otherPatterns] of Object.entries(this.strictSectionPatterns)) {
            const otherSection = parseInt(otherSectionStr);
            if (otherSection !== sectionId && otherPatterns.some(pattern => pattern.test(field.name))) {
              // Found a better strict section match
              const newField = { 
                ...field, 
                section: otherSection,
                confidence: 0.99
              };
              corrections[`reassigned_to_${otherSection}`] = (corrections[`reassigned_to_${otherSection}`] || 0) + 1;
              corrections.total++;
              return newField;
            }
          }
          
          // If no better match found, keep it as is but with reduced confidence
          // This allows the bridgeAdapter to override it if it has a better match
          return {
            ...field,
            confidence: Math.min(field.confidence, 0.6)
          };
        }
      }
      
      // Field passed validation, return as is
      return field;
    });
    
    // Log correction statistics if any were made
    if (corrections.total > 0) {
      console.log(`Made ${corrections.total} section assignment corrections.`);
      for (const [key, count] of Object.entries(corrections)) {
        if (key !== 'total') {
          console.log(`  ${key}: ${count}`);
        }
      }
    }
    
    return validatedFields;
  }

  /**
   * Create a default rule file for a specific section if it doesn't exist
   * @param section Section number (1-30)
   * @param name Section name
   */
  public createDefaultRuleFile(section: number, name: string): void {
    const filePath = path.join(this.rulesDir, `section${section.toString().padStart(2, '0')}.json`);
    
    // Skip if the file already exists
    if (fs.existsSync(filePath)) {
      return;
    }
    
    // Create default rule structure
    const defaultRule: SectionRules = {
      section,
      name,
      rules: [
        {
          section,
          pattern: `section${section}`,
          confidence: 0.8,
          description: `Default pattern for section ${section} (${name})`
        }
      ]
    };
    
    // Create the rules directory if it doesn't exist
    if (!fs.existsSync(this.rulesDir)) {
      fs.mkdirSync(this.rulesDir, { recursive: true });
    }
    
    // Write the rule file
    fs.writeFileSync(filePath, JSON.stringify(defaultRule, null, 2));
    console.log(`Created default rule file for section ${section} (${name}) at ${filePath}`);
  }

  /**
   * Initialize default rule files for all 30 sections
   */
  public initializeDefaultRules(): void {
    const sectionNames = [
      "Instructions",
      "Identification",
      "Where You Have Lived",
      "Where You Went To School",
      "Employment Activities",
      "People Who Know You Well",
      "Your Spouse",
      "Your Relatives",
      "Citizenship",
      "Dual/Multiple Citizenship",
      "Foreign Contacts",
      "Foreign Activities",
      "Financial Record",
      "Public Record",
      "Investigation and Clearance Record",
      "Financial Conflicts of Interest",
      "Association Record",
      "Foreign Business Relationships",
      "Government Contacts",
      "Your Foreign Activities",
      "Substance Use - Illegal Drugs & Drug Activities",
      "Alcohol Use",
      "Police Record",
      "Use of Information Technology",
      "Financial Distress",
      "Civil Court Actions",
      "Your Military Service",
      "Mental Health",
      "Security Violations",
      "Signature and Certification"
    ];
    
    // Create default rule files for all sections
    sectionNames.forEach((name, index) => {
      this.createDefaultRuleFile(index + 1, name);
    });
  }

  /**
   * Process fields and generate section outputs with confidence metrics
   * @param categorizedFields The fields to process
   * @returns A map of section outputs with confidence metrics
   */
  public processSectionOutputs(categorizedFields: CategorizedField[]): Record<string, any> {
    // Group fields by section
    const sectionMap: Record<string, CategorizedField[]> = {};
    
    for (const field of categorizedFields) {
      const sectionKey = String(field.section || 0);
      if (!sectionMap[sectionKey]) {
        sectionMap[sectionKey] = [];
      }
      sectionMap[sectionKey].push(field);
    }
    
    // Create section outputs
    const sectionOutputs: Record<string, any> = {};
    
    for (const [sectionKey, fields] of Object.entries(sectionMap)) {
      // Skip unknown section (0)
      if (sectionKey === '0') continue;
      
      // Group by subsection
      const subsectionMap: Record<string, CategorizedField[]> = {};
      let matchedFields = 0;
      
      for (const field of fields) {
        const subsectionKey = field.subsection || '_default';
        if (!subsectionMap[subsectionKey]) {
          subsectionMap[subsectionKey] = [];
        }
        subsectionMap[subsectionKey].push(field);
        
        // Count fields with confidence > 0.5 as "matched"
        if (field.confidence > 0.5) {
          matchedFields++;
        }
      }
      
      // Get section name from rules
      const sectionNumber = parseInt(sectionKey, 10);
      const sectionName = this.sectionRules[sectionNumber]?.name || `Section ${sectionKey}`;
      
      // Create section output
      sectionOutputs[sectionKey] = {
        meta: {
          hasSubSections: Object.keys(subsectionMap).filter(k => k !== '_default').length > 0,
          confidence: 0, // Will be calculated by confidence calculator
          totalFields: 0, // Will be calculated by confidence calculator
          matchedFields,
          name: sectionName
        },
        fields: subsectionMap
      };
    }
    
    // Calculate confidence metrics
    return confidenceCalculator.calculateConfidence(sectionOutputs);
  }

  /**
   * Generate a confidence report for all sections
   * @param sectionOutputs The section outputs with confidence metrics
   * @returns A markdown formatted report
   */
  public generateConfidenceReport(sectionOutputs: Record<string, any>): string {
    return confidenceCalculator.generateConfidenceReport(sectionOutputs);
  }

  /**
   * Generate a detailed confidence report with subsection information
   * @param sectionOutputs The section outputs with confidence metrics
   * @returns A markdown formatted report
   */
  public generateDetailedReport(sectionOutputs: Record<string, any>): string {
    return confidenceCalculator.generateAdvancedReport(sectionOutputs);
  }

  /**
   * Get the overall confidence across all sections
   * @param sectionOutputs The section outputs with confidence metrics
   * @returns The overall confidence value (0-1)
   */
  public calculateOverallConfidence(sectionOutputs: Record<string, any>): number {
    return confidenceCalculator.calculateOverallConfidence(sectionOutputs);
  }

  /**
   * Process unknown fields and generate rule candidates
   * @param unknownFields Array of uncategorized fields
   * @param autoUpdate Whether to automatically update rule files
   * @returns Promise resolving to rule candidates map
   */
  public async processUnknownFields(unknownFields: CategorizedField[], autoUpdate: boolean = false): Promise<Map<string, MatchRule[]>> {
    if (!unknownFields || unknownFields.length === 0) {
      console.log('No unknown fields to process.');
      return new Map();
    }
    
    console.log(`Processing ${unknownFields.length} unknown fields for rule generation...`);
    
    // Convert to EnhancedField format if needed
    const enhancedFields: EnhancedField[] = unknownFields.map(field => ({
      id: field.id,
      name: field.name,
      value: field.value || '',
      page: field.page,
      label: field.label,
      type: field.type,
      maxLength: field.maxLength,
      options: field.options,
      required: field.required,
      section: field.section,
      subSection: field.subsection,
      entryIndex: field.entry,
      confidence: field.confidence
    }));
    
    // Generate rule candidates
    const ruleCandidates = await rulesGenerator.generateRuleCandidates(enhancedFields);
    
    // Log candidate counts
    console.log(`Generated ${Array.from(ruleCandidates.entries()).reduce((total, [_, rules]) => total + rules.length, 0)} rule candidates across ${ruleCandidates.size} sections.`);
    for (const [section, candidates] of ruleCandidates.entries()) {
      console.log(`  Section ${section}: ${candidates.length} candidates`);
    }
    
    // Update rule files if requested
    if (autoUpdate && ruleCandidates.size > 0) {
      console.log('Automatically updating rule files with new candidates...');
      await rulesGenerator.updateRuleFiles(ruleCandidates);
      
      // Reload rules to incorporate the changes
      await this.loadRules();
      console.log('Rules reloaded with new additions.');
    }
    
    return ruleCandidates;
  }
}

/**
 * Create a sample rule file for testing purposes
 * @param rulesDir Directory to save the sample rule file
 */
export function createSampleRuleFile(rulesDir: string = path.resolve(process.cwd(), 'src', 'sectionizer', 'rules')): void {
  const section2Rules: SectionRules = {
    section: 2,
    name: "Date of Birth",
    rules: [
      {
        section: 2,
        pattern: "form1\\[0\\]\\.Sections1-6\\[0\\]\\.From_Datefield_Name_2\\[0\\]",
        confidence: 0.98,
        description: "Exact match for Date of Birth field name"
      },
      {
        section: 2,
        pattern: "Section 2\\. Date of Birth",
        confidence: 0.98,
        description: "Date of Birth field by label match"
      },
      {
        section: 2,
        pattern: "form1\\[0\\]\\.Sections1-6\\[0\\]\\.#field\\[18\\]",
        confidence: 0.98,
        description: "Exact match for Estimate checkbox field name"
      },
      {
        section: 2,
        pattern: "Estimate",
        confidence: 0.9,
        description: "Estimate checkbox for Date of Birth",
        fieldType: ["PDFCheckBox"]
      }
    ]
  };
  
  // Create the rules directory if it doesn't exist
  if (!fs.existsSync(rulesDir)) {
    fs.mkdirSync(rulesDir, { recursive: true });
  }
  
  // Write the sample rule file
  const filePath = path.join(rulesDir, "section02.json");
  fs.writeFileSync(filePath, JSON.stringify(section2Rules, null, 2));
  console.log(`Created sample rule file for section ${section2Rules.section} (${section2Rules.name}) at ${filePath}`);
} 