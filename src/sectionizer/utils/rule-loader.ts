import type { MatchRule } from '../types.js';
import fs from 'fs/promises';
import path from 'path';
import * as url from 'url';
import { strictSectionPatterns, isFieldInSection } from './section-patterns.js';

/**
 * Structure to hold both inclusion and exclusion rules for a section
 */
export interface SectionRuleSet {
  rules: MatchRule[];
  exclude: MatchRule[];
}

// Reference to the section field patterns in shared section-patterns.ts
// No need to redefine these patterns here anymore

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
   * Get rules for a specific section
   * @param section Section number to get rules for
   * @returns Promise resolving to the rules for the section
   */
  async getRulesForSection(section: number): Promise<SectionRuleSet> {
    const sectionKey = `section-${section}`;
    
    // Return cached rules if available
    if (this.ruleCache.has(sectionKey)) {
      return this.ruleCache.get(sectionKey)!;
    }
    
    try {
      // Try to load rules from the rule file
      const ruleFile = path.join(this.rulesDir, `section-${section}.json`);
      const fileContent = await fs.readFile(ruleFile, 'utf-8');
      const sectionRules = JSON.parse(fileContent) as SectionRuleSet;
      
      // Cache and return the loaded rules
      this.ruleCache.set(sectionKey, sectionRules);
      return sectionRules;
    } catch (error) {
      // If no rule file exists, create a default rule set using the strict patterns
      const defaultRules: SectionRuleSet = {
        rules: [],
        exclude: []
      };
      
      // Add strict pattern rules for this section if available
      const sectionStr = section.toString();
      if (strictSectionPatterns[sectionStr]) {
        defaultRules.rules = strictSectionPatterns[sectionStr].map((pattern: RegExp) => ({
          pattern: new RegExp(pattern.source, 'i'),
          confidence: 0.95,
          subSection: '_default'
        }));
      }
      
      // Cache and return the default rules
      this.ruleCache.set(sectionKey, defaultRules);
      return defaultRules;
    }
  }
  
  /**
   * Load rules for a specific section
   * @param section The section number as a string
   * @returns Promise resolving to the rules for the section
   */
  async loadRules(section: string): Promise<SectionRuleSet> {
    // Convert section string to number for getRulesForSection
    const sectionNum = parseInt(section, 10);
    if (isNaN(sectionNum)) {
      return { rules: [], exclude: [] };
    }
    
    return this.getRulesForSection(sectionNum);
  }
  
  /**
   * Get available section numbers from rule files
   * @returns Promise resolving to an array of section numbers as strings
   */
  async getAvailableSections(): Promise<string[]> {
    try {
      // Ensure rules directory exists
      try {
        await fs.access(this.rulesDir);
      } catch (error) {
        await fs.mkdir(this.rulesDir, { recursive: true });
        return Object.keys(strictSectionPatterns).filter(s => s !== "0");
      }
      
      // Read all files in the rules directory
      const files = await fs.readdir(this.rulesDir);
      
      // Extract section numbers from filenames
      const sectionPattern = /section[-_]?(\d+)\.json$/i;
      const sections = files
        .map(file => {
          const match = file.match(sectionPattern);
          return match ? match[1] : null;
        })
        .filter(s => s !== null) as string[];
      
      // If no rules found, use strictSectionPatterns keys
      if (sections.length === 0) {
        return Object.keys(strictSectionPatterns).filter(s => s !== "0");
      }
      
      return sections;
    } catch (error) {
      console.warn('Error getting available sections:', error);
      // Fallback to strictSectionPatterns keys
      return Object.keys(strictSectionPatterns).filter(s => s !== "0");
    }
  }
  
  /**
   * Test if a field belongs to a section using all available rules
   * @param fieldName Field name to test
   * @param section Section number to test against
   * @returns True if the field belongs to the section, false otherwise
   */
  isFieldInSection(fieldName: string, section: number): boolean {
    // Use the shared isFieldInSection function
    return isFieldInSection(fieldName, section);
  }
}

export const ruleLoader = new RuleLoader(); 