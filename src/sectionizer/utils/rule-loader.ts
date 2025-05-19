import type { MatchRule } from '../types.js';
import fs from 'fs/promises';
import path from 'path';
import * as url from 'url';

/**
 * Structure to hold both inclusion and exclusion rules for a section
 */
export interface SectionRuleSet {
  rules: MatchRule[];
  exclude: MatchRule[];
}

// Reference to the section field patterns in enhanced-pdf-validation.ts
// These are the strict patterns that should be used for initial categorization
const strictSectionPatterns: Record<string, RegExp[]> = {
  "1": [
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[0\]/i, // Last name
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[1\]/i, // First name
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[2\]/i, // Middle name
    /form1\[0\]\.Sections1-6\[0\]\.suffix\[0\]/i, // Name suffix
  ],
  "2": [
    /form1\[0\]\.Sections1-6\[0\]\.From_Datefield_Name_2\[0\]/i, // Date of Birth field
    /form1\[0\]\.Sections1-6\[0\]\.#field\[18\]/i, // Second DOB field
  ],
  "3": [
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[3\]/i, // Birth city
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[4\]/i, // Birth county
    /form1\[0\]\.Sections1-6\[0\]\.School6_State\[0\]/i, // Birth state
    /form1\[0\]\.Sections1-6\[0\]\.DropDownList1\[0\]/i,
  ],
  "4": [
    /form1\[0\]\.Sections1-6\[0\]\.SSN\[0\]/i, // Primary SSN field
    /form1\[0\]\.Sections1-6\[0\]\.SSN\[1\]/i, // Secondary SSN field
    /\.SSN\[\d+\]/i,  // ALL SSN fields anywhere in the document including bottom of pages
    /form1\[0\]\.#subform\[\d+\]\.SSN\[\d+\]/i, // SSN fields in different subforms
    /SSN$/i, // SSN fields with no index
    /\.SSN_/i, // SSN fields with underscore
    /form1\[0\]\.Sections1-6\[0\]\.RadioButtonList\[0\]/i, // Radio button list for section 4
    /form1\[0\]\.Sections1-6\[0\]\.CheckBox4\[0\]/i, // Section 4 "Not applicable" checkbox
    /.*(?:ssn|social\s*security).*(?:checkbox|check\s*box).*/i, // Any SSN-related checkbox
  ],
  "5": [
    // STRICT: Only specific section5 patterns that match exactly 45 fields
    /form1\[0\]\.Sections1-6\[0\]\.section5\[0\]\.TextField11\[\d+\]/i, // Section 5 text fields
    /form1\[0\]\.Sections1-6\[0\]\.section5\[0\]\.RadioButtonList\[\d+\]/i, // Section 5 radio buttons
    /form1\[0\]\.Sections1-6\[0\]\.section5\[0\]\.suffix\[\d+\]/i, // Section 5 suffix dropdowns
    /form1\[0\]\.Sections1-6\[0\]\.section5\[0\]\.#area\[\d+\]\.From_Datefield_Name_2\[\d+\]/i, // From date fields
    /form1\[0\]\.Sections1-6\[0\]\.section5\[0\]\.#area\[\d+\]\.To_Datefield_Name_2\[\d+\]/i, // To date fields
    /form1\[0\]\.Sections1-6\[0\]\.section5\[0\]\.#field\[\d+\]/i, // Section 5 misc fields/checkboxes
    // Do not include any CheckBox1 patterns or other non-section5 fields
  ],
  "6": [
    // STRICT: Only these 6 specific fields should be in section 6
    /form1\[0\]\.Sections1-6\[0\]\.DropDownList7\[0\]/i, // Height in inches
    /form1\[0\]\.Sections1-6\[0\]\.DropDownList8\[0\]/i, // Height in feets
    /form1\[0\]\.Sections1-6\[0\]\.DropDownList9\[0\]/i, // Eye color
    /form1\[0\]\.Sections1-6\[0\]\.DropDownList10\[0\]/i, // Hair color
    /form1\[0\]\.Sections1-6\[0\]\.p3-rb3b\[0\]/i, // Sex Male or Female
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[5\]/i, // Wieght in pounds
  ],
  "7": [
    // STRICT: Only these specific patterns should be in section 7 (Your Contact Information)
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[13\]/i, // Home email address
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[14\]/i, // Work email address
    /form1\[0\]\.Sections7-9\[0\]\.p3-t68\[1\]/i, // Home telephone number
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[15\]/i, // Extension for home phone
    /form1\[0\]\.Sections7-9\[0\]\.#field\[33\]/i, // Home telephone checkbox - International
    /form1\[0\]\.Sections7-9\[0\]\.#field\[34\]/i, // Night checkbox for home phone
    /form1\[0\]\.Sections7-9\[0\]\.#field\[35\]/i, // Day checkbox for home phone
    /form1\[0\]\.Sections7-9\[0\]\.p3-t68\[2\]/i, // Work telephone number
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[16\]/i, // Extension for work phone
    /form1\[0\]\.Sections7-9\[0\]\.#field\[38\]/i, // Work telephone checkbox - International
    /form1\[0\]\.Sections7-9\[0\]\.#field\[39\]/i, // Night checkbox for work phone
    /form1\[0\]\.Sections7-9\[0\]\.#field\[40\]/i, // Day checkbox for work phone
    /form1\[0\]\.Sections7-9\[0\]\.p3-t68\[3\]/i, // Mobile/cell phone number
    /form1\[0\]\.Sections7-9\[0\]\.TextField11\[17\]/i, // Extension for mobile
    /form1\[0\]\.Sections7-9\[0\]\.#field\[43\]/i, // Mobile phone checkbox - International
    /form1\[0\]\.Sections7-9\[0\]\.#field\[44\]/i, // Night checkbox for mobile
    /form1\[0\]\.Sections7-9\[0\]\.#field\[45\]/i, // Day checkbox for mobile
  ],
};

/**
 * Manages loading and caching of section rules
 */
export class RuleLoader {
  private ruleCache: Map<string, SectionRuleSet> = new Map();
  private rulesDir: string;
  
  constructor(rulesDir?: string) {
    this.rulesDir = rulesDir || path.join(process.cwd(), 'src', 'sectionizer', 'rules');
  }
  
  /**
   * Loads rules for a specific section
   * @param section The section number as a string
   * @returns Object containing rules and exclusions
   */
  public async loadRules(section: string): Promise<SectionRuleSet> {
    // Check cache first
    if (this.ruleCache.has(section)) {
      return this.ruleCache.get(section)!;
    }
    
    try {
      // First check if we have strict patterns for this section (highest priority)
      if (strictSectionPatterns[section]) {
        const strictRules: MatchRule[] = strictSectionPatterns[section].map(pattern => ({
          pattern,
          subSection: '_default',
          confidence: 0.99,
          description: `Strict pattern for section ${section}`
        }));
        
        if (strictRules.length > 0) {
          console.log(`Using ${strictRules.length} strict patterns for section ${section}`);
          
          // Try to load exclusions from file
          try {
            const fileRules = await this.loadRulesFromFile(section);
            const combinedRules: SectionRuleSet = {
              rules: [...strictRules, ...fileRules.rules], // Strict rules take precedence
              exclude: fileRules.exclude
            };
            this.ruleCache.set(section, combinedRules);
            return combinedRules;
          } catch (e) {
            // If loading file rules fails, just use strict rules
            const strictRuleSet: SectionRuleSet = { rules: strictRules, exclude: [] };
            this.ruleCache.set(section, strictRuleSet);
            return strictRuleSet;
          }
        }
      }
      
      // If no strict patterns or they're empty, fall back to file rules
      const ruleSet = await this.loadRulesFromFile(section);
      this.ruleCache.set(section, ruleSet);
      return ruleSet;
    } catch (error) {
      // If file doesn't exist or has errors, return empty arrays
      console.warn(`Warning: Could not load rules for section ${section}:`, error);
      const emptyRuleSet: SectionRuleSet = { rules: [], exclude: [] };
      this.ruleCache.set(section, emptyRuleSet);
      return emptyRuleSet;
    }
  }
  
  /**
   * Loads rules from a file
   * @param section The section number as a string
   * @returns Object containing rules and exclusions
   */
  private async loadRulesFromFile(section: string): Promise<SectionRuleSet> {
    // Normalize section number by removing leading zeros
    const normalizedSection = section.replace(/^0+/, '');
    // Padded version with leading zero for single-digit sections
    const paddedSection = normalizedSection.length === 1 ? `0${normalizedSection}` : normalizedSection;
    
    // Define all possible file paths for this section
    const possiblePaths = [
      // Primary formats (most standard)
      path.join(this.rulesDir, `section${normalizedSection}.rules.json`),
      path.join(this.rulesDir, `section${normalizedSection}.rules.ts`),
      
      // Alternative formats with leading zeros
      path.join(this.rulesDir, `section${paddedSection}.rules.json`),
      path.join(this.rulesDir, `section${paddedSection}.rules.ts`),
      
      // Legacy formats
      path.join(this.rulesDir, `section${normalizedSection}.json`),
      path.join(this.rulesDir, `section${paddedSection}.json`)
    ];
    
    // Try all possible paths
    for (const filePath of possiblePaths) {
      try {
        const fileExt = path.extname(filePath);
        
        // Handle JSON files
        if (fileExt === '.json') {
          await fs.access(filePath);
          console.log(`Found rules file: ${filePath}`);
          const content = await fs.readFile(filePath, 'utf-8');
          const jsonData = JSON.parse(content);
          
          // Check if the JSON has the expected structure
          if (jsonData.rules && Array.isArray(jsonData.rules)) {
            const rules = this.convertRules(jsonData.rules);
            const exclude = jsonData.exclude && Array.isArray(jsonData.exclude) 
              ? this.convertRules(jsonData.exclude) 
              : [];
            console.log(`Successfully loaded ${rules.length} rules and ${exclude.length} exclusions from JSON file for section ${normalizedSection}`);
            return { rules, exclude };
          }
          
          // Direct array of rules (old format)
          if (Array.isArray(jsonData)) {
            const rules = this.convertRules(jsonData);
            console.log(`Successfully loaded ${rules.length} rules from JSON file for section ${normalizedSection}`);
            return { rules, exclude: [] };
          }
        }
        
        // Handle TypeScript files
        if (fileExt === '.ts') {
          await fs.access(filePath);
          console.log(`Found TypeScript rules file: ${filePath}`);
          
          try {
            // Convert to file URL for import
            const fileUrl = url.pathToFileURL(filePath).href;
            
            // Dynamic import of section rules
            const rulesModule = await import(fileUrl);
            const rules = rulesModule.rules || [];
            const exclude = rulesModule.exclude || [];
            console.log(`Successfully loaded ${rules.length} rules and ${exclude.length} exclusions from TypeScript file for section ${normalizedSection}`);
            return { rules, exclude };
          } catch (importError) {
            console.warn(`Warning: Could not import TypeScript rules from ${filePath}:`, importError);
            // Continue to the next path
          }
        }
      } catch (error) {
        // Just continue to the next path
      }
    }
    
    // If we reach here, no valid rule files were found
    console.log(`No rule files found for section ${normalizedSection}`);
    return { rules: [], exclude: [] };
  }
  
  /**
   * Converts JSON rule structures to MatchRule objects
   * @param jsonRules Array of rule objects from JSON
   * @returns Array of properly typed MatchRule objects
   */
  private convertRules(jsonRules: any[]): MatchRule[] {
    return jsonRules.map(rule => ({
      pattern: new RegExp(rule.pattern instanceof RegExp ? rule.pattern.source : rule.pattern, rule.flags || 'i'),
      subSection: rule.subSection || rule.subsection || '_default',
      entryIndex: rule.entryIndexFn ? 
        new Function('m', `return ${rule.entryIndexFn}`) as (m: RegExpMatchArray) => number : 
        rule.entryPattern ? 
          ((m: RegExpMatchArray) => {
            const entryPattern = new RegExp(rule.entryPattern, 'i');
            const match = m[0].match(entryPattern);
            return match && match[1] ? parseInt(match[1], 10) : 0;
          }) :
          undefined,
      confidence: rule.confidence || 0.7,
      description: rule.description
    }));
  }
  
  /**
   * Clears the rule cache
   */
  public clearCache(): void {
    this.ruleCache.clear();
  }
  
  /**
   * Gets all available section numbers
   * @returns Array of normalized section numbers
   */
  public async getAvailableSections(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.rulesDir);
      
      // Match different possible file patterns
      const allPatterns = [
        /^section(\d+)\.rules\.ts$/,
        /^section(\d+)\.rules\.json$/,
        /^section(\d+)\.json$/
      ];
      
      const allSections = [];
      
      // Process files using all patterns
      for (const pattern of allPatterns) {
        const matchedFiles = files.filter(file => file.match(pattern))
          .map(file => {
            const match = file.match(pattern);
            if (match && match[1]) {
              // Normalize section numbers by removing leading zeros
              return match[1].replace(/^0+/, '');
            }
            return '';
          })
          .filter(Boolean);
        
        allSections.push(...matchedFiles);
      }
      
      // Remove duplicates and sort numerically
      const uniqueSections = [...new Set(allSections)]
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
      
      console.log(`Found rule files for sections: ${uniqueSections.join(', ')}`);
      return uniqueSections;
    } catch (error) {
      console.warn('Warning: Could not read rules directory:', error);
      return [];
    }
  }
}

export const ruleLoader = new RuleLoader(); 