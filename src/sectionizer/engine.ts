/**
 * SF-86 Sectionizer Rule Engine Core
 *
 * This file implements the core rule engine that applies section-specific regex maps
 * to categorize fields into their respective sections and sub-sections.
 */

import * as fs from "fs";
import * as path from "path";
import type {
  CategorizedField,
  PDFField,
} from "./utils/extractFieldsBySection.js";
import type { MatchRule, EnhancedField } from "./types.js";
import { confidenceCalculator } from "./utils/confidence-calculator.js";
import { ruleLoader } from "./utils/rule-loader.js";
import { rulesGenerator } from "./utils/rules-generator.js";
import {
  sectionFieldPatterns,
  expectedFieldCounts,
  subsectionPatterns,
  entryPatterns,
  sectionEntryPrefixes,
  sectionStructure,
  fieldClusterer
} from "./utils/field-clusterer.js";
import { ruleExporter } from './utils/rule-exporter.js';
import { applyEnhancedCategorization } from "./utils/enhanced-self-healingv1.js";

/**
 * Interface for rule definition
 */
export interface CategoryRule {
  section: number;
  pattern?: string | RegExp;
  confidence: number;
  description?: string;
  fieldType?: string[];
  subsection?: string;
  entryPattern?: string | RegExp;
  keywords?: string[]; // Add keywords property to the interface
}

/**
 * Interface for a rule file containing a set of rules for a specific section
 */
export interface SectionRules {
  section: number; // Section number
  name: string; // Section name
  rules: CategoryRule[]; // Array of categorization rules
}

/**
 * Section categorization result
 */
export interface CategorizationResult {
  section: number; // Section number (1-30)
  subsection?: string; // Subsection identifier (if applicable)
  entry?: number; // Entry index within a subsection (if applicable)
  confidence: number; // Confidence score (0-1)
  rule?: CategoryRule; // The rule that was matched (if any)
}

/**
 * Rule Engine for SF-86 field categorization
 */
export class RuleEngine {
  private rules: CategoryRule[] = [];
  private sectionRules: Record<number, SectionRules> = {};
  // Define strict patterns for critical sections - imported from shared definition
  private strictSectionPatterns = sectionFieldPatterns;
  private sectionStructure = sectionStructure;
  private loaded: boolean = false;
  private logger: any;
  // Add compiledPatterns Map to cache RegExp objects
  private compiledPatterns: Map<string, RegExp> = new Map();

  // Reference section distribution for validation
  private expectedSectionCounts = expectedFieldCounts;

  /**
   * Create a new rule engine
   * @param rulesDir Directory containing section rule files
   */
  constructor(
    private rulesDir: string = path.resolve(
      process.cwd(),
      "src",
      "sectionizer",
      "rules"
    ),
    logger?: any
  ) {
    this.logger = logger || console;
  }

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
    this.compiledPatterns.clear(); // Clear compiled patterns

    // Track total loaded rules for accurate reporting
    let totalRulesLoaded = 0;
    let sectionsWithRules = 0;

    // Load rules for each section
    for (const sectionStr of sectionNumbers) {
      try {
        const section = parseInt(sectionStr);
        const ruleSet = await ruleLoader.getRulesForSection(section);

        if (ruleSet.rules && ruleSet.rules.length > 0) {
          // Convert MatchRules to CategoryRules
          const categoryRules: CategoryRule[] = ruleSet.rules.map(
            (rule: any) => {
              // Ensure proper subsection mapping - prefer subsection over subsection for compatibility
              const subsection =
                rule.subsection !== undefined
                  ? rule.subsection
                  : undefined;

              // Entry extraction - if the rule has entryIndex or entryPattern, set up entry extraction
              // Even if there's no explicit entryPattern, we can use the rule's pattern
              const entryPattern =
                rule.entryPattern ||
                (rule.entryIndex ? rule.pattern : undefined);

              return {
                section,
                subsection,
                pattern: rule.pattern,
                confidence: rule.confidence || 0.7,
                description: rule.description,
                // If specified, include fieldType restrictions
                fieldType: rule.fieldType,
                // Include entry pattern if available
                entryPattern,
              };
            }
          );

          // Create section rule entry
          this.sectionRules[section] = {
            section,
            name: this.sectionStructure[section][0] || this.sectionStructure[0][0],
            rules: categoryRules,
          };

          // Add to master rules collection
          this.rules.push(...categoryRules);

          totalRulesLoaded += ruleSet.rules.length;
          sectionsWithRules++;

          console.log(
            `Loaded ${ruleSet.rules.length} rules for section ${section}`
          );
        }
      } catch (error) {
        console.error(`Error loading rules for section ${sectionStr}:`, error);
      }
    }

    console.log(
      `Loaded a total of ${totalRulesLoaded} rules from ${sectionsWithRules} sections.`
    );
    
    // Precompile patterns for better performance
    this.precompilePatterns();
    
    this.loaded = true;
  }

  /**
   * Precompile string patterns to RegExp objects for better performance
   * @private
   */
  private precompilePatterns(): void {
    console.time('precompilePatterns');
    
    let patternCount = 0;
    const patternTypes: Record<string, number> = {};
    const errors: string[] = [];
    
    // Precompile strict section patterns
    for (const [sectionStr, patterns] of Object.entries(this.strictSectionPatterns)) {
      const section = parseInt(sectionStr);
      if (isNaN(section)) continue;
      
      // Cast to any to handle both string[] and RegExp[] types
      (patterns as any[]).forEach((pattern, idx) => {
        const patternType = typeof pattern;
        patternTypes[patternType] = (patternTypes[patternType] || 0) + 1;
        
        try {
          if (typeof pattern === 'string' && pattern.trim() !== '') {
            const key = `strict_${section}_${idx}`;
            this.compiledPatterns.set(key, new RegExp(pattern, 'i'));
            patternCount++;
          } else if (pattern instanceof RegExp) {
            const key = `strict_${section}_${idx}`;
            this.compiledPatterns.set(key, pattern);
            patternCount++;
          }
        } catch (error: any) {
          errors.push(`Error compiling strict pattern for section ${section}: ${error.message}`);
        }
      });
    }
    
    // Precompile rule patterns
    if (this.rules && this.rules.length > 0) {
      console.log(`Precompiling ${this.rules.length} rule patterns...`);
      
      // Debug counters
      let stringPatterns = 0;
      let regexPatterns = 0;
      let otherPatterns = 0;
      let emptyPatterns = 0;
      
      for (const rule of this.rules) {
        // Track pattern types for debugging
        const patternType = rule.pattern ? typeof rule.pattern : 'undefined';
        patternTypes[patternType] = (patternTypes[patternType] || 0) + 1;
        
        if (!rule.pattern) {
          emptyPatterns++;
          continue;
        }
        
        if (typeof rule.pattern === 'string') {
          if (rule.pattern.trim() === '') {
            emptyPatterns++;
            continue;
          }
          
          stringPatterns++;
          try {
            const key = `rule_${rule.section}_${rule.pattern.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}`;
            if (!this.compiledPatterns.has(key)) {
              this.compiledPatterns.set(key, new RegExp(rule.pattern, 'i'));
              patternCount++;
            }
          } catch (error: any) {
            errors.push(`Error compiling pattern for section ${rule.section}: ${error.message}`);
          }
        } else if (rule.pattern instanceof RegExp) {
          regexPatterns++;
          try {
            const key = `rule_${rule.section}_regex_${patternCount}`;
            if (!this.compiledPatterns.has(key)) {
              this.compiledPatterns.set(key, rule.pattern);
              patternCount++;
            }
          } catch (error: any) {
            errors.push(`Error compiling RegExp pattern for section ${rule.section}: ${error.message}`);
          }
        } else {
          otherPatterns++;
        }
        
        // Also precompile entry patterns if they exist as strings
        if (rule.entryPattern) {
          const entryType = typeof rule.entryPattern;
          patternTypes[`entry_${entryType}`] = (patternTypes[`entry_${entryType}`] || 0) + 1;
          
          if (typeof rule.entryPattern === 'string' && rule.entryPattern.trim() !== '') {
            try {
              const key = `entry_${rule.section}_${rule.entryPattern.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}`;
              if (!this.compiledPatterns.has(key)) {
                this.compiledPatterns.set(key, new RegExp(rule.entryPattern, 'i'));
                patternCount++;
              }
            } catch (error: any) {
              errors.push(`Error compiling entry pattern for section ${rule.section}: ${error.message}`);
            }
          } else if (rule.entryPattern instanceof RegExp) {
            try {
              const key = `entry_${rule.section}_regex_${patternCount}`;
              if (!this.compiledPatterns.has(key)) {
                this.compiledPatterns.set(key, rule.entryPattern);
                patternCount++;
              }
            } catch (error: any) {
              errors.push(`Error compiling RegExp entry pattern for section ${rule.section}: ${error.message}`);
            }
          }
        }
      }
      
      // Print debug information
      console.log(`Pattern type counts: string=${stringPatterns}, regex=${regexPatterns}, other=${otherPatterns}, empty=${emptyPatterns}`);
      
      // Print pattern type distribution
      console.log("Pattern type distribution:");
      for (const [type, count] of Object.entries(patternTypes)) {
        console.log(`- ${type}: ${count}`);
      }
      
      // Print any errors
      if (errors.length > 0) {
        console.warn(`${errors.length} errors occurred during pattern compilation:`);
        errors.slice(0, 5).forEach(error => console.warn(`- ${error}`));
        if (errors.length > 5) {
          console.warn(`... and ${errors.length - 5} more errors`);
        }
      }
      
    } else {
      console.warn('No rules available for pattern compilation');
    }
    
    console.timeEnd('precompilePatterns');
    console.log(`Precompiled ${patternCount} patterns for faster matching (map size: ${this.compiledPatterns.size})`);
  }

  /**
   * Get a compiled RegExp pattern or compile a string pattern
   * @private
   * @param pattern String or RegExp pattern
   * @param section Optional section number for more specific caching
   * @returns Compiled RegExp pattern
   */
  private getCompiledPattern(pattern: string | RegExp, section: number = 0): RegExp {
    if (pattern instanceof RegExp) {
      return pattern;
    }
    
    const key = `${section > 0 ? 'section_' + section + '_' : ''}${pattern}`;
    
    let compiledPattern = this.compiledPatterns.get(key);
    if (!compiledPattern) {
      compiledPattern = new RegExp(pattern, 'i');
      this.compiledPatterns.set(key, compiledPattern);
    }
    
    return compiledPattern;
  }

  /**
   * Add rules for a specific section
   * @param section The section number
   * @param rules Array of category rules to add
   * @returns The total number of rules added
   */
  public addRulesForSection(section: number, rules: CategoryRule[]): number {
    if (!this.sectionRules[section]) {
      this.sectionRules[section] = {
        section,
        name: `Section ${section}`,
        rules: [],
      };
    }

    // Add each rule if it doesn't already exist (based on pattern)
    let addedCount = 0;
    for (const rule of rules) {
      const rulePatternString =
        rule.pattern instanceof RegExp
          ? rule.pattern.source
          : String(rule.pattern);

      // Check if the rule already exists with the same pattern
      const existingRuleIndex = this.sectionRules[section].rules.findIndex(
        (r) => {
          const existingPattern =
            r.pattern instanceof RegExp ? r.pattern.source : String(r.pattern);
          return (
            existingPattern === rulePatternString &&
            r.subsection === rule.subsection
          );
        }
      );

      // Add the rule if it doesn't exist
      if (existingRuleIndex === -1) {
        this.sectionRules[section].rules.push(rule);
        this.rules.push(rule);
        addedCount++;
      }
    }

    console.log(`Added ${addedCount} new rules for section ${section}`);
    return addedCount;
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
   * Get all rules currently loaded in the engine
   * @returns Array of all category rules
   */
  public getRules(): CategoryRule[] {
    return [...this.rules];
  }

  /**
   * Categorize a field using rules
   * @param field Field to categorize
   * @returns Categorized field
   */
  public categorizeField(field: PDFField): CategorizedField {
    // Initialize categorized field
    const categorized: CategorizedField = {
      ...field,
      section: 0,
      confidence: 0,
    };

    // Skip if field has no name
    if (!field.name) return categorized;

    try {
      // Try to use strict section patterns first (most accurate)
      const strictSectionMatch = this.matchStrictSectionPattern(field.name);
      if (strictSectionMatch) {
        categorized.section = strictSectionMatch.section;
        categorized.subsection = strictSectionMatch.subsection;
        categorized.entry =  strictSectionMatch.entry;
        categorized.entry = strictSectionMatch.entry;
        categorized.confidence = 0.95; // Very high confidence for strict patterns
        return categorized;
      }

      // Fast path: Check if we have a direct match in the pattern cache
      const fieldName = field.name.toLowerCase();
      
      // Check field label and value too if available
      const fieldLabel = field.label ? field.label.toLowerCase() : '';
      const fieldValue = typeof field.value === 'string' ? field.value.toLowerCase() : '';
      
      for (const rule of this.rules) {
        // Skip rules for sections that don't match the expected count profile
        if (rule.section && this.expectedSectionCounts[rule.section]) {
          const expectedCount = this.expectedSectionCounts[rule.section].fields;
          if (expectedCount === 0) continue; // Skip rules for sections with no expected fields
        }

        // First try direct pattern matching (fastest)
        if (rule.pattern) {
          // Use compiled pattern if available
          let pattern: RegExp;
          const patternKey = typeof rule.pattern === 'string' ? rule.pattern : rule.pattern.toString();
          
          if (this.compiledPatterns.has(patternKey)) {
            pattern = this.compiledPatterns.get(patternKey)!;
          } else {
            try {
              pattern = new RegExp(rule.pattern.toString(), 'i');
              this.compiledPatterns.set(patternKey, pattern);
            } catch (e) {
              continue; // Skip invalid patterns
            }
          }
          
          // Check name, label, and value against the pattern
          if (pattern.test(fieldName) || 
              (fieldLabel && pattern.test(fieldLabel)) || 
              (fieldValue && pattern.test(fieldValue))) {
            categorized.section = rule.section || 0;
            categorized.confidence = rule.confidence || 0.8;
            
            // Also extract subsection and entry if not already set
            if (!categorized.subsection) {
              categorized.subsection = rule.subsection || this.extractSubsection(field.name, categorized.section);
            }
            
            if (!categorized.entry && rule.entryPattern) {
              const entryMatch = fieldName.match(rule.entryPattern);
              if (entryMatch && entryMatch.length > 1) {
                const parsedEntry = parseInt(entryMatch[1], 10);
                if (!isNaN(parsedEntry)) {
                  categorized.entry = parsedEntry;
                }
              }
            }
            
            // If this is a high-confidence match, we can return early
            if (categorized.confidence > 0.85) {
              return categorized;
            }
          }
        }
      }
      
      // If we found a match with the fast path, return it
      if (categorized.section > 0) {
        return categorized;
      }

      // Slower path: Try more complex rules
      for (const rule of this.rules) {
        // Skip rules for sections that don't match the expected count profile
        if (rule.section && this.expectedSectionCounts[rule.section]) {
          const expectedCount = this.expectedSectionCounts[rule.section].fields;
          if (expectedCount === 0) continue; // Skip rules for sections with no expected fields
        }

        // Check for keyword matches (slower)
        if (rule.keywords && rule.keywords.length > 0) {
          const keywords = rule.keywords.map((k: string) => k.toLowerCase());
          
          // Try to match keywords in name, label, and value
          const matchesAllKeywordsInName = keywords.every((keyword: string) => fieldName.includes(keyword));
          const matchesAllKeywordsInLabel = fieldLabel ? keywords.every((keyword: string) => fieldLabel.includes(keyword)) : false;
          const matchesAllKeywordsInValue = fieldValue ? keywords.every((keyword: string) => fieldValue.includes(keyword)) : false;
          
          if (matchesAllKeywordsInName || matchesAllKeywordsInLabel || matchesAllKeywordsInValue) {
            categorized.section = rule.section || 0;
            categorized.confidence = rule.confidence || 0.75;
            
            // Also extract subsection and entry if not already set
            if (!categorized.subsection) {
              categorized.subsection = rule.subsection || this.extractSubsection(field.name, categorized.section);
            }
            
            if (!categorized.entry && rule.entryPattern) {
              const entryMatch = fieldName.match(rule.entryPattern);
              if (entryMatch && entryMatch.length > 1) {
                const parsedEntry = parseInt(entryMatch[1], 10);
                if (!isNaN(parsedEntry)) {
                  categorized.entry = parsedEntry;
                }
              }
            }
            
            break; // Stop at first keyword match
          }
        }
      }
    } catch (error) {
      // If categorization fails, log the error but return a default categorization
      console.error(`Error categorizing field ${field.name}:`, error);
    }

    return categorized;
  }

  /**
   * Extract subsection information from field name
   */
  private extractSubsection(fieldName: string, knownSection?: number): string | undefined {
    if (!fieldName) return undefined;

    let section = knownSection !== undefined && knownSection > 0 ? knownSection : 0;
    // Try to determine which section this field belongs to from its name if not provided
    if (section === 0) {
        const sectionMatch = fieldName.match(/[s]ection(\d+)/);
        if (sectionMatch && sectionMatch[1]) {
            section = parseInt(sectionMatch[1], 10);
        }
    }

    // First try section-specific patterns if we identified a section
    if (section > 0 && subsectionPatterns[section]) {
      for (const pattern of subsectionPatterns[section]) {
        const match = fieldName.match(pattern);
        if (match && match.length > 1) {
          // For section-specific patterns, the subsection is typically in capture group 1
          return match[1];
        }
      }
    }

    // If no match from section-specific patterns, try the generic patterns
    for (const pattern of subsectionPatterns[0]) {
      const match = fieldName.match(pattern);
      if (match && match.length > 2) {
        // Most patterns have the subsection in capture group 2
        return match[2];
      } else if (match && match.length > 1 && pattern.toString().includes('subsection')) {
        // For patterns with just the subsection identifier
        return match[1];
      }
    }

    // Look for subsection pattern in parts (fallback)
    const parts = fieldName.split(/[\\/_.]/);
    for (let i = 0; i < parts.length; i++) {
      if (/^subsection/i.test(parts[i]) && i + 1 < parts.length) {
        return parts[i + 1];
      }
    }

    // If contains subsection keyword but no number, use a generic subsection
    if (/subsection/i.test(fieldName)) {
      return "_default";
    }

    return undefined;
  }

  /**
   * Extract entry information from field name
   */
  private extractEntry(fieldName: string, knownSection?: number): number | undefined {
    if (!fieldName) return undefined;
    
    let section = knownSection !== undefined && knownSection > 0 ? knownSection : 0;
    // Try to determine which section this field belongs to from its name if not provided
    if (section === 0) {
        const sectionMatch = fieldName.match(/[Ss]ection(\d+)/);
        if (sectionMatch && sectionMatch[1]) {
            section = parseInt(sectionMatch[1], 10);
        }
    }

    // First try section-specific patterns if we identified a section
    if (section > 0 && entryPatterns[section]) {
      for (const pattern of entryPatterns[section]) {
        const match = fieldName.match(pattern);
        if (match && match.length > 1) {
          const parsedEntry = parseInt(match[1], 10);
          if (!isNaN(parsedEntry)) {
            return parsedEntry;
          }
        }
      }
    }

    // If no match from section-specific patterns, try the generic patterns
    for (const pattern of entryPatterns[0]) {
      const match = fieldName.match(pattern);
      if (match && match.length > 1) {
        const parsedEntry = parseInt(match[1], 10);
        if (!isNaN(parsedEntry)) {
          return parsedEntry;
        }
      }
    }

    // Look for section-specific entry patterns based on the field name
    for (const [sectionStr, prefixes] of Object.entries(sectionEntryPrefixes)) {
      const sectionNum = parseInt(sectionStr, 10);
      // If the field name contains any of the section's entry prefixes
      if (prefixes.some((prefix: string) => fieldName.toLowerCase().includes(prefix.toLowerCase()))) {
        // Extract numeric part after the prefix
        const match = fieldName.match(new RegExp(`${prefixes.join('|')}[_-]?(\\d+)`, 'i'));
        if (match && match.length > 1) {
          const parsedEntry = parseInt(match[1], 10);
          if (!isNaN(parsedEntry)) {
            return parsedEntry;
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Categorize fields using rules
   * @param fields PDFFields to categorize
   * @returns Categorized fields
   */
  public async categorizeFields(fields: CategorizedField[]): Promise<CategorizedField[]> {
    if (!this.loaded) {
      this.logger.warn("Rules not loaded, categorization may be incomplete");
    }

    const startTime = process.hrtime();
    this.logger.log(
      `Categorizing ${fields.length} fields with ${this.rules.length} rules...`
    );

    // Use batch processing for better performance with large field sets
    const batchSize = 100; // Adjust based on performance testing
    const totalFields = fields.length;
    let categorizedFields: CategorizedField[] = [];
    
    // First pass: categorize using traditional rules
    this.logger.log("First pass: Categorizing with existing rules");
    
    // Process fields in batches to avoid memory pressure
    for (let i = 0; i < totalFields; i += batchSize) {
      const batchEnd = Math.min(i + batchSize, totalFields);
      const batchFields = fields.slice(i, batchEnd);
      
      // Group fields by name pattern for more efficient processing
      const fieldGroups = this.groupFieldsByPattern(batchFields);
      let batchResults: CategorizedField[] = [];
      
      // Process each group with similar patterns
      for (const [pattern, groupFields] of fieldGroups.entries()) {
        // For small groups, process individually
        if (groupFields.length <= 3) {
          const groupResults = groupFields.map(field => {
            const result = this.categorizeField(field);
            return {
              ...field,
              section: result?.section || 0,
              subsection: result?.subsection,
              entry: result?.entry,
              confidence: result?.confidence || 0,
            } as CategorizedField;
          });
          
          batchResults = batchResults.concat(groupResults);
        } 
      }
      
      // Verify that we're processing all fields in the batch
      if (batchResults.length !== batchFields.length) {
        this.logger.warn(`Batch processing mismatch: expected ${batchFields.length} results but got ${batchResults.length}`);
      }
      
      // Add batch results to overall results
      categorizedFields = categorizedFields.concat(batchResults);
      
      // Log progress for large datasets
      if (totalFields > 1000 && (i + batchSize) % 1000 === 0) {
        this.logger.log(`Processed ${Math.min(i + batchSize, totalFields)}/${totalFields} fields...`);
      }
    }

    // Verify that all fields were processed
    if (categorizedFields.length !== totalFields) {
      this.logger.warn(`Processing mismatch: expected ${totalFields} categorized fields but got ${categorizedFields.length}`);
    }

    // Track uncategorized fields
    let uncategorizedFields = categorizedFields.filter(
      (field) => !field.section || field.section === 0
    );

    if (uncategorizedFields.length > 0) {
      this.logger.log(
        `First pass left ${uncategorizedFields.length} fields uncategorized (${(uncategorizedFields.length / totalFields * 100).toFixed(1)}%). Applying advanced techniques...`
      );
      
      // Second pass: Use field clustering, pattern analysis, and spatial techniques
      this.logger.log("Second pass: Applying heuristics via applyHeuristicsToUncategorizedFields");
      
      // // Apply the comprehensive heuristics method that includes:
      // // - Cluster-based categorization
      // // - Pattern-based categorization
      // // - Position-based categorization
      // // - Neighborhood-based categorization
      const { recategorized } = applyEnhancedCategorization(categorizedFields, this);
      categorizedFields = recategorized;
      // this.applyHeuristicsToUncategorizedFields(categorizedFields, uncategorizedFields);
      

      // Update count of uncategorized fields after heuristics
      uncategorizedFields = categorizedFields.filter(
        (field) => !field.section || field.section === 0
      );
      
      // If we still have uncategorized fields, use the rule generation techniques
      if (uncategorizedFields.length > 0) {
        this.logger.log(
          `After heuristics, still have ${uncategorizedFields.length} uncategorized fields (${(uncategorizedFields.length / totalFields * 100).toFixed(1)}%). Generating and applying dynamic rules...`
        );
        
        // Third pass: Generate rule candidates using processUnknownFields which uses generateCandidatesForSection internally
        const ruleCandidates = await this.processUnknownFields(uncategorizedFields, false);
        
        // Convert the rule candidates to category rules and apply them
        if (ruleCandidates.size > 0) {
          let rulesAdded = 0;
          
          for (const [sectionStr, rules] of ruleCandidates.entries()) {
            const section = parseInt(sectionStr, 10);
            if (isNaN(section) || section === 0) continue;
            
            // Convert MatchRules to CategoryRules
            const categoryRules: CategoryRule[] = rules.map(rule => ({
              section: section,
              pattern: typeof rule.pattern === 'string' ? rule.pattern : rule.pattern.toString().replace(/^\/|\/[gimuy]*$/g, ''),
              confidence: rule.confidence || 0.8,
              description: rule.description || `Dynamically generated rule for section ${section}`,
              subsection: rule.subsection
            }));
            
            // Add rules to the engine
            rulesAdded += this.addRulesForSection(section, categoryRules);
          }
          
          if (rulesAdded > 0) {
            this.logger.log(`Added ${rulesAdded} dynamically generated rules. Re-categorizing remaining fields...`);
            
            // Re-categorize uncategorized fields with the new rules
            for (const field of uncategorizedFields) {
              if (field.section === 0) {
                const result = this.categorizeField(field);
                if (result && result.section > 0) {
                  field.section = result.section;
                  field.subsection = result.subsection;
                  field.entry = result.entry;
                  field.confidence = result.confidence;
                }
              }
            }
          }
        }
      }
      
      // Final update of uncategorized count
      uncategorizedFields = categorizedFields.filter(
        (field) => !field.section || field.section === 0
      );
      
      this.logger.log(
        `Final categorization results: ${categorizedFields.length - uncategorizedFields.length}/${totalFields} fields categorized (${((categorizedFields.length - uncategorizedFields.length) / totalFields * 100).toFixed(1)}%), ${uncategorizedFields.length} remain uncategorized`
      );
    }

    // Log section distribution
    // this.validateSectionDistribution(categorizedFields);

    const [seconds, nanoseconds] = process.hrtime(startTime);
    const totalMs = seconds * 1000 + nanoseconds / 1000000;

    this.logger.log(`Categorization completed in ${totalMs.toFixed(2)}ms. Processed ${categorizedFields.length}/${totalFields} fields.`);
    return categorizedFields;
  }
  
  /**
   * Group fields by pattern similarity for batch processing
   * @private
   * @param fields Fields to group
   * @returns Map of pattern keys to field arrays
   */
  private groupFieldsByPattern(fields: CategorizedField[]): Map<string, CategorizedField[]> {
    const groups = new Map<string, CategorizedField[]>();
    
    // Handle empty input case
    if (!fields || fields.length === 0) {
      return groups;
    }
    
    // Default group for fields that can't be categorized by pattern
    const defaultGroup = "0";
    
    for (const field of fields) {
      try {
        // Skip fields with no name
        if (!field.name) {
          if (!groups.has(defaultGroup)) {
            groups.set(defaultGroup, []);
          }
          groups.get(defaultGroup)!.push(field);
          continue;
        }
        
        // Create a pattern key based on field properties
        // This helps group similar fields that will likely match the same rules
        const namePrefix = this.getSignificantPrefix(field.name) || 'unknown';
        const type = field.type || 'unknown';
        const page = field.page || -1;
        
        // If we couldn't get a prefix, use a simplified key
        if (!namePrefix) {
          const simpleKey = `${type}|${page}`;
          if (!groups.has(simpleKey)) {
            groups.set(simpleKey, []);
          }
          groups.get(simpleKey)!.push(field);
          continue;
        }
        
        // Create a key that combines these properties
        const key = `${namePrefix}|${type}|${page}`;
        
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        
        groups.get(key)!.push(field);
      } catch (error) {
        // If anything goes wrong, add to default group
        if (!groups.has(defaultGroup)) {
          groups.set(defaultGroup, []);
        }
        groups.get(defaultGroup)!.push(field);
      }
    }
    
    // Ensure all fields are accounted for
    const totalGrouped = Array.from(groups.values()).reduce((sum, group) => sum + group.length, 0);
    if (totalGrouped !== fields.length) {
      this.logger.warn(`Grouping mismatch: ${fields.length} input fields but grouped ${totalGrouped} fields`);
    }
    
    return groups;
  }


  
  /**
   * Validate section distribution against expected counts
   * @param fields Categorized fields to validate
   */
  private validateSectionDistribution(fields: CategorizedField[]): void {
    console.time('validateSectionDistribution');
    
    // Count fields in each section - use a more efficient approach
    const sectionCounts: Record<number, number> = {};
    
    // Pre-compute section counts in a single pass
    for (let i = 0; i < fields.length; i++) {
      const section = fields[i].section || 0;
      sectionCounts[section] = (sectionCounts[section] || 0) + 1;
    }

    // Track sections that need redistribution
    const sectionsToRedistribute: number[] = [];
    const targetSections: number[] = [];

    // Collect information about each section's status in a more efficient way
    const sectionStatus: Record<
      number,
      {
        count: number;
        expected: number;
        deficit: number;
        ratio: number;
        isOverAllocated: boolean;
        isUnderAllocated: boolean;
      }
    > = {};

    // Summary statistics
    let totalFields = 0;
    let totalExpected = 0;
    let overAllocatedCount = 0;
    let underAllocatedCount = 0;
    let uncategorizedCount = sectionCounts[0] || 0;

    // Pre-compute section status in a single pass
    for (let section = 1; section <= 30; section++) {
      const count = sectionCounts[section] || 0;
      totalFields += count;
      
      const expected = this.expectedSectionCounts[section] || { fields: 0, entries: 0, subsections: 0 };
      
      // Calculate total expected fields (including entries and subsections)
      const totalExpectedFields = expected.fields + expected.entries + expected.subsections;
      totalExpected += totalExpectedFields;

      // Determine if there's a serious distribution problem
      const hasCount = count > 0;
      const hasExpected = totalExpectedFields > 0;
      const ratio = hasCount && hasExpected ? count / totalExpectedFields : 0;
      const deficit = totalExpectedFields - count;

      // Store section status
      sectionStatus[section] = {
        count,
        expected: totalExpectedFields,
        deficit,
        ratio,
        isOverAllocated: ratio >= 3,
        isUnderAllocated: hasExpected && count < totalExpectedFields * 0.8,
      };

      // Mark sections with significant deviation for redistribution
      if (totalExpectedFields > 0) {
        if (sectionStatus[section].isOverAllocated) {
          sectionsToRedistribute.push(section);
          overAllocatedCount++;
        }

        if (sectionStatus[section].isUnderAllocated) {
          targetSections.push(section);
          underAllocatedCount++;
        }
      }
    }

    // Display distribution information in a more readable format
    console.log("\n=== SECTION DISTRIBUTION SUMMARY ===");
    console.log(`Total fields: ${totalFields} | Expected: ${totalExpected} | Uncategorized: ${uncategorizedCount}`);
    console.log(`Sections with too many fields: ${overAllocatedCount} | Sections with too few fields: ${underAllocatedCount}`);
    
    console.log("\n=== SECTION DISTRIBUTION DETAILS ===");
    console.log("Section | Actual | Expected | Diff | Status");
    console.log("--------|--------|----------|------|-------");
    
    // Display sections in numerical order (1-30)
    for (let section = 1; section <= 30; section++) {
      const status = sectionStatus[section];
      const expected = this.expectedSectionCounts[section] || { fields: 0, entries: 0, subsections: 0 };
      
      // Skip sections with no expected fields and no actual fields
      if (expected.fields === 0) continue;
      
      // Calculate deviation and status indicator
      const deviation = status.count - status.expected;
      let statusIndicator = "✓"; // Default: OK
      
      if (status.isOverAllocated) {
        statusIndicator = "⚠️ OVER";
      } else if (status.isUnderAllocated) {
        statusIndicator = "⚠️ UNDER";
      } else if (Math.abs(deviation) > Math.max(5, status.expected * 0.2)) {
        statusIndicator = "⚠️ OFF";
      }
      
      // Format the output
      console.log(
        `${section.toString().padStart(2, ' ')}     | ${status.count.toString().padEnd(6)} | ` +
        `${status.expected.toString().padEnd(8)} | ${deviation > 0 ? '+' : ''}${deviation.toString().padEnd(4)} | ${statusIndicator}`
      );
    }
    
    // If there are uncategorized fields, show them
    if (uncategorizedCount > 0) {
      console.log(
        `UNCAT  | ${uncategorizedCount.toString().padEnd(6)} | ${'-'.padEnd(8)} | ${'-'.padEnd(4)} | ⚠️ UNCATEGORIZED`
      );
    }
    console.timeEnd('validateSectionDistribution');
  }

  /**
   * Apply heuristics to uncategorized fields
   * @param allFields All fields (for reference)
   * @param uncategorizedFields Fields that need categorization
   */
  private applyHeuristicsToUncategorizedFields(
    allFields: CategorizedField[],
    uncategorizedFields: CategorizedField[]
  ): void {
    if (uncategorizedFields.length === 0) return;

    console.time('applyHeuristics');
    const initialUncategorizedCount = uncategorizedFields.length;
    
    // Cluster-based categorization (by field name, value, and label patterns)
    this.applyClusterBasedCategorization(uncategorizedFields);
    
    // Get updated count of uncategorized fields
    let remainingUncategorized = uncategorizedFields.filter(f => f.section === 0).length;
    this.logger.log(`After cluster-based categorization: ${initialUncategorizedCount - remainingUncategorized} fields categorized, ${remainingUncategorized} remaining`);

    // Pattern-based categorization (by field name patterns)
    this.applyPatternBasedCategorization(uncategorizedFields);
    
    // Get updated count again
    remainingUncategorized = uncategorizedFields.filter(f => f.section === 0).length;
    this.logger.log(`After pattern-based categorization: ${initialUncategorizedCount - remainingUncategorized} fields categorized, ${remainingUncategorized} remaining`);

    // Position-based categorization (if rect data is available)
    this.applyPositionBasedCategorization(allFields, uncategorizedFields);
    
    // Get updated count again
    remainingUncategorized = uncategorizedFields.filter(f => f.section === 0).length;
    this.logger.log(`After position-based categorization: ${initialUncategorizedCount - remainingUncategorized} fields categorized, ${remainingUncategorized} remaining`);

    // Neighborhood-based categorization
    this.applyNeighborhoodCategorization(allFields, uncategorizedFields);
    
    // Get final count
    remainingUncategorized = uncategorizedFields.filter(f => f.section === 0).length;
    this.logger.log(`After applying all heuristics: ${initialUncategorizedCount - remainingUncategorized} fields categorized, ${remainingUncategorized} remaining (${(remainingUncategorized / initialUncategorizedCount * 100).toFixed(1)}% of initially uncategorized)`);
    
    console.timeEnd('applyHeuristics');
  }

  /**
   * Apply cluster-based categorization using field clustering
   * Uses the fieldClusterer to group similar fields and assign sections
   * @param allFields All fields (for reference)
   * @param uncategorizedFields Fields that need categorization
   */
  private applyClusterBasedCategorization(
    uncategorizedFields: CategorizedField[]
  ): void {
    console.time('applyClusterBasedCategorization');
    
    // Skip if no uncategorized fields
    if (uncategorizedFields.length === 0) return;
    
    console.log(`Applying cluster-based categorization to ${uncategorizedFields.length} uncategorized fields`);
    
    // Run field clustering on uncategorized fields
    const clusters = fieldClusterer.clusterFields(uncategorizedFields);
    console.log(`Generated ${clusters.length} field clusters`);
    
    // Track how many fields we categorize
    let categorizedCount = 0;
    
    // Process each cluster to assign section if possible
    for (const cluster of clusters) {
      // Skip clusters with too few fields
      if (cluster.fields.length < 3) continue;
      
      // Skip clusters with low confidence
      if (cluster.confidence < 0.5) continue;
      
      // Try to determine section for this cluster
      const suggestion = fieldClusterer.suggestSectionForCluster(cluster);
      
      if (suggestion && suggestion.confidence > 0.6) {
        const section = suggestion.section;
        
        // Assign section to all fields in this cluster
        for (const field of cluster.fields) {
          // Only assign if field isn't already categorized
          if (field.section === 0) {
            field.section = section;
            field.confidence = Math.min(suggestion.confidence, 0.8); // Cap confidence
            categorizedCount++;
          }
        }
        
        console.log(`Assigned section ${section} to ${cluster.fields.length} fields in cluster "${cluster.pattern}" (confidence: ${suggestion.confidence.toFixed(2)})`);
      }
    }
    
    console.log(`Cluster-based categorization assigned ${categorizedCount} fields to sections`);
    console.timeEnd('applyClusterBasedCategorization');
  }

  /**
   * Apply pattern-based categorization heuristics
   */
  private applyPatternBasedCategorization(
    uncategorizedFields: CategorizedField[]
  ): void {
    // Define section-specific patterns
    const sectionPatterns = sectionFieldPatterns;

    // Apply pattern-based matching - going through each section's patterns
    for (const field of uncategorizedFields) {
      // Skip if the field is already categorized
      if (field.section !== 0) continue;

      // Use the field name and label for matching
      const fieldNameValue = field.name || "";
      const fieldLabelValue = field.label || "";
      const fieldValue = typeof field.value === "string" ? field.value : "";

      // Check each section's patterns
      for (const [sectionStr, patterns] of Object.entries(sectionPatterns)) {
        const section = parseInt(sectionStr, 10);

        // Check if any of the patterns match
        for (const pattern of patterns) {
          if (
            pattern.test(fieldNameValue) ||
            pattern.test(fieldLabelValue) ||
            pattern.test(fieldValue)
          ) {
            // Found a match, assign to this section
            field.section = section;
            field.confidence = 0.7; // Set moderate confidence for pattern-based matches
            break;
          }
        }

        // If we found a match, stop checking other sections
        if (field.section !== 0) break;
      }
    }

    // For any fields that are still uncategorized, check if they follow naming patterns of already categorized fields
    this.applyNamePatternMatching(uncategorizedFields);
  }

  /**
   * Apply position-based categorization using field coordinates
   */
  private applyPositionBasedCategorization(
    allFields: CategorizedField[],
    uncategorizedFields: CategorizedField[]
  ): void {
    // Skip if no rect data available
    if (!uncategorizedFields.some((f) => f.rect)) return;

    // Get fields with known sections and coordinates
    const knownFields = allFields.filter(
      (f) =>
        f.section &&
        f.section > 0 &&
        f.rect &&
        (f.rect.x !== 0 || f.rect.y !== 0)
    );

    if (knownFields.length === 0) return;

    // Group known fields by page and build spatial index
    const fieldsByPage: Record<number, CategorizedField[]> = {};
    const spatialIndexByPage: Record<number, Map<string, CategorizedField[]>> = {};
    
    // Create a grid-based spatial index for faster proximity lookups
    // Divide each page into cells (e.g., 10x10 grid)
    const gridSize = 50; // Size of each grid cell in points
    
    for (const field of knownFields) {
      const page = field.page || 0;
      
      // Add to page-based collection
      if (!fieldsByPage[page]) fieldsByPage[page] = [];
      fieldsByPage[page].push(field);
      
      // Skip fields without valid rect
      if (!field.rect) continue;
      
      // Add to spatial index
      if (!spatialIndexByPage[page]) {
        spatialIndexByPage[page] = new Map<string, CategorizedField[]>();
      }
      
      // Calculate grid cell coordinates for this field
      const minGridX = Math.floor(field.rect.x / gridSize);
      const maxGridX = Math.floor((field.rect.x + (field.rect.width || 0)) / gridSize);
      const minGridY = Math.floor(field.rect.y / gridSize);
      const maxGridY = Math.floor((field.rect.y + (field.rect.height || 0)) / gridSize);
      
      // Add field to all overlapping grid cells
      for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
        for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
          const cellKey = `${gridX},${gridY}`;
          
          if (!spatialIndexByPage[page].has(cellKey)) {
            spatialIndexByPage[page].set(cellKey, []);
          }
          
          spatialIndexByPage[page].get(cellKey)!.push(field);
        }
      }
    }
    
    // Cache for distance calculations to avoid redundant computations
    const distanceCache = new Map<string, number>();

    // Process each uncategorized field
    for (const field of uncategorizedFields) {
      if (field.section && field.section !== 0) continue;
      if (!field.rect || (!field.rect.x && !field.rect.y)) continue;

      const page = field.page || 0;
      const pageFields = fieldsByPage[page] || [];
      if (pageFields.length === 0) continue;

      // Use spatial index to find potential neighbors
      let candidateFields: CategorizedField[] = [];
      
      if (spatialIndexByPage[page]) {
        // Calculate grid cell for this field
        const gridX = Math.floor((field.rect.x + (field.rect.width || 0) / 2) / gridSize);
        const gridY = Math.floor((field.rect.y + (field.rect.height || 0) / 2) / gridSize);
        
        // Get fields from current cell and adjacent cells
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const cellKey = `${gridX + dx},${gridY + dy}`;
            const cellFields = spatialIndexByPage[page].get(cellKey);
            
            if (cellFields && cellFields.length > 0) {
              candidateFields = candidateFields.concat(cellFields);
            }
          }
        }
      }
      
      // If spatial index didn't find candidates, fall back to all fields on the page
      if (candidateFields.length === 0) {
        candidateFields = pageFields;
      }

      // Find nearest categorized field
      let nearestField: CategorizedField | null = null;
      let minDistance = Number.MAX_VALUE;

      for (const knownField of candidateFields) {
        // Create a unique key for this field pair to use with the distance cache
        const fieldPairKey = `${field.id}|${knownField.id}`;
        
        // Check if we've already calculated this distance
        let distance: number;
        if (distanceCache.has(fieldPairKey)) {
          distance = distanceCache.get(fieldPairKey)!;
        } else {
          distance = this.calculateDistance(field, knownField);
          distanceCache.set(fieldPairKey, distance);
        }
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestField = knownField;
        }
      }

      // Assign section if we found a nearby field
      if (nearestField && minDistance < 200) {
        // Threshold for proximity - adjust based on document scale
        field.section = nearestField.section;
        field.confidence = Math.max(0.6, 0.9 - minDistance / 400); // Higher confidence for closer fields
        
        // If very close, also copy subsection and entry
        if (minDistance < 50) {
          field.subsection = nearestField.subsection;
          if (typeof nearestField.entry === 'number') {
            field.entry = nearestField.entry;
          }
        }
      }
    }
    
    // Clear cache to free memory
    distanceCache.clear();
  }

  /**
   * Calculate Euclidean distance between two fields' centers
   * Optimized to handle edge cases and use center points
   */
  private calculateDistance(
    field1: CategorizedField,
    field2: CategorizedField
  ): number {
    // Skip if either field lacks coordinates
    if (!field1.rect || !field2.rect) return Number.MAX_VALUE;

    // Calculate field centers
    const center1X = field1.rect.x + (field1.rect.width || 0) / 2;
    const center1Y = field1.rect.y + (field1.rect.height || 0) / 2;
    const center2X = field2.rect.x + (field2.rect.width || 0) / 2;
    const center2Y = field2.rect.y + (field2.rect.height || 0) / 2;

    // Calculate Euclidean distance
    return Math.sqrt(
      Math.pow(center1X - center2X, 2) + Math.pow(center1Y - center2Y, 2)
    );
  }

  /**
   * Apply neighborhood-based categorization
   * Assigns sections based on nearby field names
   */
  private applyNeighborhoodCategorization(
    allFields: CategorizedField[],
    uncategorizedFields: CategorizedField[]
  ): void {
    // Create lookup of field name prefixes to sections
    const prefixToSection: Record<string, number[]> = {};

    // Map known field prefixes to sections
    for (const field of allFields) {
      if (!field.section || field.section === 0) continue;

      // Get significant prefix from the field name
      const prefix = this.getSignificantPrefix(field.name);
      if (!prefix) continue;

      if (!prefixToSection[prefix]) {
        prefixToSection[prefix] = [];
      }

      if (!prefixToSection[prefix].includes(field.section)) {
        prefixToSection[prefix].push(field.section);
      }
    }

    // Apply to uncategorized fields
    for (const field of uncategorizedFields) {
      if (field.section && field.section !== 0) continue;

      const prefix = this.getSignificantPrefix(field.name);
      if (!prefix || !prefixToSection[prefix]) continue;

      // If the prefix maps to exactly one section, use it
      if (prefixToSection[prefix].length === 1) {
        field.section = prefixToSection[prefix][0];
      }
      // If there are multiple possibilities, use the most common
      else if (prefixToSection[prefix].length > 1) {
        const sectionCounts: Record<number, number> = {};
        for (const section of prefixToSection[prefix]) {
          sectionCounts[section] = (sectionCounts[section] || 0) + 1;
        }

        let maxCount = 0;
        let maxSection = 0;
        for (const [section, count] of Object.entries(sectionCounts)) {
          if (count > maxCount) {
            maxCount = count;
            maxSection = parseInt(section, 10);
          }
        }

        if (maxSection > 0) {
          field.section = maxSection;
        }
      }
    }
  }

  /**
   * Get significant prefix from field name
   */
  private getSignificantPrefix(fieldName: string): string | null {
    if (!fieldName) return null;

    // Remove array indices
    const withoutIndices = fieldName.replace(/\[\d+\]/g, "");

    // Split by dots and get components
    const parts = withoutIndices.split(".");

    // Use up to the first two parts as prefix
    if (parts.length >= 2) {
      return parts.slice(0, 2).join(".");
    } else if (parts.length === 1) {
      return parts[0];
    }

    return null;
  }

  /**
   * Initialize default rule files for all 30 sections
   */
  public initializeDefaultRules(): void {
    // Create default rule files for all sections using names from sectionStructure
    for (let sectionNumber = 1; sectionNumber <= 30; sectionNumber++) {
      // Get the section name from sectionStructure (first element in the array)
      const sectionName = sectionStructure[sectionNumber][0];
      
      // Get the patterns for this section from strictSectionPatterns if available
      const sectionPatterns = this.strictSectionPatterns[sectionNumber] || [];
      
      // Create a default rule file with the patterns
      this.createDefaultRuleFile(sectionNumber, sectionName, sectionPatterns);
    }
  }

  /**
   * Create a default rule file for a specific section if it doesn't exist
   * @param section Section number (1-30)
   * @param name Section name
   * @param patterns Optional array of RegExp patterns for this section
   */
  public async createDefaultRuleFile(section: number, name: string, patterns: RegExp[] = []): Promise<void> {
    // Use padded section number for filename
    const sectionPadded = section.toString().padStart(2, "0");
    
    // Define file paths
    const tsFilePath = path.join(this.rulesDir, `section${sectionPadded}.rules.ts`);
    
    // Skip if the TypeScript file already exists
    if (fs.existsSync(tsFilePath)) {
      return;
    }

    // Create the rules directory if it doesn't exist
    if (!fs.existsSync(this.rulesDir)) {
      fs.mkdirSync(this.rulesDir, { recursive: true });
    }
    
    // Create MatchRule objects from the provided patterns
    const matchRules: MatchRule[] = [];

    // Add rules for each pattern provided
    if (patterns.length > 0) {
      patterns.forEach(pattern => {
        matchRules.push({
          pattern: pattern,
          section: section,
          confidence: 0.9,
          description: `Pattern from sectionFieldPatterns for section ${section}`
        });
      });
      
      console.log(`Added ${patterns.length} patterns to default rules for section ${section}`);
    }
    
    try {
      // Use the ruleExporter to create TypeScript file
      const tsPath = await ruleExporter.exportRulesToTypeScript(section, matchRules);
      console.log(`Created TypeScript rule file for section ${section} (${name}) at ${tsPath}`);
      
      // For backward compatibility, also create the JSON file
      const jsonPath = await ruleExporter.exportRules(section.toString(), matchRules);
      console.log(`Created JSON rule file for section ${section} (${name}) at ${jsonPath}`);
    } catch (error) {
      console.error(`Error creating rule files for section ${section}:`, error);
    }
  }



  
  /**
   * Process fields and generate section outputs with confidence metrics
   * @param categorizedFields The fields to process
   * @returns A map of section outputs with confidence metrics
   */
  public processSectionOutputs(
    categorizedFields: CategorizedField[]
  ): Record<string, any> {
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
      if (sectionKey === "0") continue;

      // Group by subsection
      const subsectionMap: Record<string, CategorizedField[]> = {};
      let matchedFields = 0;

      for (const field of fields) {
        const subsectionKey = field.subsection || "0";
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
      const sectionName =
        this.sectionRules[sectionNumber]?.name || "Unknown";

      // Create section output
      sectionOutputs[sectionKey] = {
        meta: {
          hasSubSections:
            Object.keys(subsectionMap).filter((k) => k !== "_default").length >
            0,
          confidence: 0, // Will be calculated by confidence calculator
          totalFields: 0, // Will be calculated by confidence calculator
          matchedFields,
          name: sectionName,
        },
        fields: subsectionMap,
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
  public calculateOverallConfidence(
    sectionOutputs: Record<string, any>
  ): number {
    return confidenceCalculator.calculateOverallConfidence(sectionOutputs);
  }

  /**
   * Process unknown fields and generate rule candidates
   * @param unknownFields Array of uncategorized fields
   * @param autoUpdate Whether to automatically update rule files
   * @returns Promise resolving to rule candidates map
   */
  public async processUnknownFields(
    unknownFields: CategorizedField[],
    autoUpdate: boolean = false
  ): Promise<Map<string, MatchRule[]>> {
    if (!unknownFields || unknownFields.length === 0) {
      console.log("No unknown fields to process.");
      return new Map();
    }

    console.log(
      `Processing ${unknownFields.length} unknown fields for rule generation...`
    );

    // Convert to EnhancedField format if needed
    const enhancedFields: EnhancedField[] = unknownFields.map((field) => ({
      id: field.id,
      name: field.name,
      value: field.value || "",
      page: field.page,
      label: field.label,
      type: field.type,
      maxLength: field.maxLength,
      options: field.options,
      section: field.section,
      subsection: field.subsection,
      entryIndex: field.entry,
      confidence: field.confidence,
    }));

    // Generate rule candidates
    const ruleCandidates = await rulesGenerator.generateRuleCandidates(
      enhancedFields
    );

    // Log candidate counts
    console.log(
      `Generated ${Array.from(ruleCandidates.entries()).reduce(
        (total, [_, rules]) => total + rules.length,
        0
      )} rule candidates across ${ruleCandidates.size} sections.`
    );
    for (const [section, candidates] of ruleCandidates.entries()) {
      console.log(`  Section ${section}: ${candidates.length} candidates`);
    }

    // Update rule files if requested
    if (autoUpdate && ruleCandidates.size > 0) {
      console.log("Automatically updating rule files with new candidates...");
      await rulesGenerator.updateRuleFiles(ruleCandidates);

      // Reload rules to incorporate the changes
      await this.loadRules();
      console.log("Rules reloaded with new additions.");
    }

    return ruleCandidates;
  }

  /**
   * Apply name pattern matching to categorize fields based on similar naming patterns
   */
  private applyNamePatternMatching(
    uncategorizedFields: CategorizedField[]
  ): void {
    // Skip if no uncategorized fields left
    if (uncategorizedFields.length === 0) return;
    
    console.time('applyNamePatternMatching');

    // Get all categorized fields to use as reference
    const categorizedFields = this.getAllCategorizedFields(uncategorizedFields);
    
    // Create a prefix-to-section index for faster lookups
    const prefixToSections = new Map<string, Map<number, number>>();
    
    // Build the index of prefixes to sections with counts
    for (const field of categorizedFields) {
      if (!field.section || field.section === 0) continue;
      
      const prefix = this.getSignificantPrefix(field.name);
      if (!prefix) continue;
      
      if (!prefixToSections.has(prefix)) {
        prefixToSections.set(prefix, new Map<number, number>());
      }
      
      const sectionCounts = prefixToSections.get(prefix)!;
      sectionCounts.set(field.section, (sectionCounts.get(field.section) || 0) + 1);
    }
    
    // Group uncategorized fields by prefix for batch processing
    const fieldsByPrefix = new Map<string, CategorizedField[]>();
    
    for (const field of uncategorizedFields) {
      if (field.section !== 0) continue; // Skip if already categorized
      
      const prefix = this.getSignificantPrefix(field.name);
      if (!prefix) continue;
      
      if (!fieldsByPrefix.has(prefix)) {
        fieldsByPrefix.set(prefix, []);
      }
      
      fieldsByPrefix.get(prefix)!.push(field);
    }
    
    // Process each group of fields with the same prefix
    let fieldsAssigned = 0;
    
    for (const [prefix, fields] of fieldsByPrefix.entries()) {
      // Skip if no matching prefix in categorized fields
      if (!prefixToSections.has(prefix)) continue;
      
      const sectionCounts = prefixToSections.get(prefix)!;
      
      // Find section with highest count for this prefix
      let bestSection = 0;
      let highestCount = 0;
      
      for (const [section, count] of sectionCounts.entries()) {
        if (count > highestCount) {
          highestCount = count;
          bestSection = section;
        }
      }
      
      // If we found a good match with sufficient evidence, assign all fields with this prefix
      if (bestSection > 0 && highestCount >= 3) {
        for (const field of fields) {
          field.section = bestSection;
          field.confidence = 0.65; // Slightly lower confidence than pattern matching
          fieldsAssigned++;
        }
      }
    }
    
    console.log(`Name pattern matching assigned ${fieldsAssigned} fields to sections`);
    console.timeEnd('applyNamePatternMatching');
  }

  /**
   * Get all fields that have been categorized
   */
  private getAllCategorizedFields(
    uncategorizedFields: CategorizedField[]
  ): CategorizedField[] {
    // We need to get all fields to establish patterns, but uncategorizedFields
    // only contains fields that weren't categorized yet

    // Find some categorized field to get a reference to the full array
    // This is a bit of a hack, but should work as long as uncategorizedFields
    // is a subset of the full array of fields
    if (uncategorizedFields.length === 0) return [];

    // Get the first uncategorized field and try to find its parent array
    // This is a bit of a hack, but should work as long as uncategorizedFields
    // is a subset of the full array of fields
    const sampleField = uncategorizedFields[0];

    // Since we don't have direct access to the full array, create our own
    // by combining uncategorized fields with any fields that have sections
    const allCategorizedFields: CategorizedField[] = [];

    // Add fields that have been categorized (not in uncategorizedFields)
    // We can check the section to determine if a field has been categorized
    for (const field of uncategorizedFields) {
      if (field.section && field.section !== 0) {
        allCategorizedFields.push(field);
      }
    }

    return allCategorizedFields;
  }

  // Add a getter method to expose strict section patterns
  public getStrictSectionPatterns() {
    // Convert the record to an array of patterns with section numbers
    const patterns: Array<{ section: number; pattern: RegExp }> = [];

    Object.entries(this.strictSectionPatterns).forEach(
      ([sectionStr, regexArray]) => {
        const section = parseInt(sectionStr, 10);
        if (!isNaN(section)) {
          (regexArray as RegExp[]).forEach((pattern: RegExp) => {
            patterns.push({
              section,
              pattern,
            });
          });
        }
      }
    );

    return patterns;
  }

  /**
   * Add a category rule to the rule engine
   * @param rule The rule to add
   */
  public addCategoryRule(rule: CategoryRule): void {
    // Handle pattern type conversion if needed
    const normalizedRule: CategoryRule = {
      ...rule,
      pattern:
        typeof rule.pattern === "string"
          ? rule.pattern
          : rule?.pattern?.toString().replace(/^\/|\/[gimuy]*$/g, ""), // Convert RegExp to string pattern
    };

    // Add the rule to our internal rule collection
    this.rules.push(normalizedRule);

    // Also add to section-specific rules if we have a section
    if (normalizedRule.section > 0) {
      const section = normalizedRule.section;

      // Initialize section rules if needed
      if (!this.sectionRules[section]) {
        this.sectionRules[section] = {
          section,
          name: `Section ${section}`,
          rules: [],
        };
      }

      // Add to section rules
      this.sectionRules[section].rules.push(normalizedRule);
    }
  }

  /**
   * Match a field name against strict section patterns
   * @param fieldName Field name to match
   * @returns Match result with section, subsection, and entry if found
   */
  private matchStrictSectionPattern(fieldName: string): { section: number, subsection?: string, entry?: number } | null {
    if (!fieldName) return null;
    
    // Convert to lowercase for case-insensitive matching
    const lowerFieldName = fieldName.toLowerCase();

    // Check each section's strict patterns
    for (const [sectionStr, patterns] of Object.entries(this.strictSectionPatterns)) {
      const section = parseInt(sectionStr);
      const currentPatterns = patterns as RegExp[]; // Type assertion
      
      // Check if the field matches any of the strict patterns for this section
      const matchFound = currentPatterns.some((pattern: RegExp) => {
        return pattern.test(lowerFieldName);
      });

      if (matchFound) {
        // Try to extract subsection and entry for strict matches
        const subsection = this.extractSubsection(fieldName, section);
        const entry = this.extractEntry(fieldName, section);

        return {
          section,
          subsection,
          entry
        };
      }
    }

    return null;
  }

  /**
   * Generate enhanced subsection rules from already categorized fields
   */
  public generateEnhancedSubsectionRules(
    fields: CategorizedField[],
    section: number,
    subsection: string
  ): CategoryRule[] {
    // Skip empty subsections
    if (!subsection || subsection === "_default") return [];

    // Get all fields from this section and subsection
    const subsectionFields = fields.filter(
      (f) => f.section === section && f.subsection === subsection
    );

    // Skip if not enough fields
    if (subsectionFields.length < 2) return [];

    const sectionId = section; // Using unpadded section number
    const rules: CategoryRule[] = [];
    
    // Collect common patterns
    const patternSet = new Set<string>();
    
    // Analyze field names to identify patterns
    fields.forEach(field => {
      if (!field.name) return;
      
      const fieldName = field.name.toLowerCase();
      
      // Pattern: section21d (direct)
      const directPattern = `section${sectionId}${subsection.toLowerCase()}`;
      if (fieldName.includes(directPattern)) {
        patternSet.add(directPattern);
      }
      
      // Pattern: section21_d (with underscore)
      const underscorePattern = `section${sectionId}_${subsection.toLowerCase()}`;
      if (fieldName.includes(underscorePattern)) {
        patternSet.add(underscorePattern);
      }
      
      // Pattern: section21.d (with dot)
      const dotPattern = `section${sectionId}.${subsection.toLowerCase()}`;
      if (fieldName.includes(dotPattern)) {
        patternSet.add(dotPattern);
      }
      
      // Look for form1[0].section21d type patterns
      // Use safe regex pattern checking
      try {
        const formPattern = `form1\\[\\d+\\]\\.section${sectionId}${subsection.toLowerCase()}`;
        const formRegex = new RegExp(formPattern, 'i');
        if (formRegex.test(fieldName)) {
          patternSet.add(formPattern);
        }
      } catch (e) {
        // Skip invalid pattern
        console.warn(`Invalid form pattern for section ${sectionId}${subsection}: ${e}`);
      }
    });
    
    // Create rules from pattern set
    patternSet.forEach(pattern => {
      try {
        // Verify the pattern is a valid regex before adding
        new RegExp(pattern, 'i');
        
        rules.push({
          section,
          subsection,
          pattern,
          confidence: 0.9,
          description: `Generated pattern for section ${section}${subsection}`
        });
      } catch (e) {
        console.warn(`Invalid pattern for section ${section}${subsection}: ${e}`);
      }
    });
    
    return rules;
  }

  /**
   * Get the number of compiled patterns in the rule engine
   */
  public getCompiledPatternsCount(): number {
    return this.compiledPatterns.size;
  }
}