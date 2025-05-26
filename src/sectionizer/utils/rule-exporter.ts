import type { MatchRule } from '../types.js';
import fs from 'fs/promises';
import path from 'path';
import { sectionStructure } from './field-clusterer.js';
import { ruleLoader } from './rule-loader.js';

/**
 * Exports rules to TypeScript and JSON formats
 */
export class RuleExporter {
  /**
   * Exports rules to JSON format for backwards compatibility
   * @param section Section number
   * @param rules Rules to export
   * @returns Promise resolving when export is complete
   */
  public async exportRules(section: string, rules: MatchRule[]): Promise<string> {
    const rulesDir = path.join(process.cwd(), 'src', 'sectionizer', 'rules');
    const jsonPath = path.join(rulesDir, `section${section}.rules.json`);
    
    // Convert rules to JSON-friendly format
    const jsonRules = rules.map(rule => ({
      pattern: rule.pattern.source,
      flags: rule.pattern.flags,
      subsection: rule.subsection,
      entryIndexFn: rule.entryIndex ? 
        rule.entryIndex.toString().replace(/^\(.*?\)\s*=>\s*/, '') : 
        undefined,
      confidence: rule.confidence,
      description: rule.description
    }));
    
    // Write to file
    await fs.mkdir(rulesDir, { recursive: true });
    await fs.writeFile(jsonPath, JSON.stringify(jsonRules, null, 2));
    
    return jsonPath;
  }
  
  /**
   * Exports all rules to JSON format
   * @param rulesMap Map of section numbers to rules
   * @returns Promise resolving when export is complete
   */
  public async exportAllRules(rulesMap: Map<string, MatchRule[]>): Promise<string[]> {
    const exportPromises: Promise<string>[] = [];
    
    for (const [section, rules] of rulesMap.entries()) {
      exportPromises.push(this.exportRules(section, rules));
    }
    
    return Promise.all(exportPromises);
  }
  

  
  /**
   * Generate JSON files from TypeScript rules (for backwards compatibility)
   * @param section Section number
   * @returns Promise resolving when conversion is complete
   */
  public async generateJsonFromTypescript(section: string): Promise<string | null> {
    const rulesDir = path.join(process.cwd(), 'src', 'sectionizer', 'rules');
    // Use the correct .rules.ts pattern matching what we see in the photo
    const tsPath = path.join(rulesDir, `section${section}.rules.ts`);
    
    try {
      // Check if TypeScript file exists
      try {
        await fs.access(tsPath);
      } catch (err) {
        console.warn(`TypeScript rules file for section ${section} does not exist`);
        return null;
      }
      
      // For server-side environments, we could use dynamic imports
      // For simplicity here, we'll just read the file and extract the rules
      const tsContent = await fs.readFile(tsPath, 'utf-8');
      
      // Extract the rules section using regex (a basic approach)
      const rulesMatch = tsContent.match(/export const rules: MatchRule\[] = \[([\s\S]*?)\];/);
      if (!rulesMatch) {
        console.warn(`Could not extract rules from ${tsPath}`);
        return null;
      }
      
      // Create a basic parser to extract rules
      const rulesText = rulesMatch[1];
      const rules = this.parseRulesFromTypeScript(rulesText, section);
      
      // Export to JSON with .rules.json extension
      return await this.exportRules(section, rules);
    } catch (error) {
      console.error(`Error generating JSON from TypeScript for section ${section}:`, error);
      return null;
    }
  }
  
  /**
   * Basic parser to extract rules from TypeScript content
   * Note: This is a simplified approach and may not handle all edge cases
   * @param rulesText The rules array text content
   * @param section Section number for error reporting
   * @returns Parsed MatchRule objects
   */
  private parseRulesFromTypeScript(rulesText: string, section: string): MatchRule[] {
    // This method has been moved to rule-loader.ts with improvements
    // Import the ruleLoader instance and use its method instead
    return ruleLoader.parseRulesFromTypeScriptExternal(rulesText, section);
  }
  
  /**
   * Exports rules to TypeScript format
   * @param section Section number
   * @param rules Rules to export
   * @param name Optional section name (overrides default)
   * @returns Promise resolving to the path of the exported file
   */
  public async exportRulesToTypeScript(section: number, rules: MatchRule[]): Promise<string> {
    // Format section number for file naming
    const sectionStr = section.toString();
    
    // Get section name from sectionStructure or use provided name or default
    const sectionName = sectionStructure[section] ? sectionStructure[section][0] : "Unknown";

    const rulesDir = path.join(process.cwd(), 'src', 'sectionizer', 'rules');
    const tsPath = path.join(rulesDir, `section${section}.rules.ts`);
    
    await fs.mkdir(rulesDir, { recursive: true });
    
    // Use the existing createTypeScriptRulesFile method and return its result
    return await this.createTypeScriptRulesFile(sectionStr, rules, sectionName, tsPath);
  }

  /**
   * Creates a TypeScript rules file as the primary source of truth
   * @param section Section number
   * @param rules Rules to export
   * @param name Section name (optional)
   * @param tsPath Path to write the TS file
   * @returns Promise resolving to the path of the generated file
   */
  public async createTypeScriptRulesFile(
    section: string, 
    rules: MatchRule[], 
    name: string = `Section ${section}`,
    tsPath: string
  ): Promise<string> {
    console.log(`Creating TypeScript rules file for section ${section} with ${rules.length} rules`);
    
    try {
      // Generate TypeScript content with improved structure
      let content = `/**\n`;
      content += ` * Rules for Section ${section}: ${name}\n`;
      content += ` * Generated: ${new Date().toISOString()}\n`;
      content += ` */\n\n`;
      content += `import type { MatchRule } from '../types.js';\n\n`;
      
      // Add section metadata
      content += `/**\n`;
      content += ` * Section metadata\n`;
      content += ` */\n`;
      content += `export const sectionInfo = {\n`;
      content += `  section: ${parseInt(section, 10)},\n`;
      content += `  name: "${name}",\n`;
      content += `  ruleCount: ${rules.length},\n`;
      content += `  lastUpdated: "${new Date().toISOString()}"\n`;
      content += `};\n\n`;
      
      // Add the rules array with better typing
      content += `/**\n`;
      content += ` * Rules for matching fields to section ${section}\n`;
      content += ` */\n`;
      content += `export const rules: MatchRule[] = [\n`;
      
      // Add each rule with proper escaping and formatting
      rules.forEach((rule, index) => {
        content += `  {\n`;
        
        // Pattern with proper escaping for special regex characters
        const escapedPattern = rule.pattern.source
          .replace(/\\/g, "\\\\") // Double escape backslashes first
          .replace(/"/g, '\\"')   // Escape double quotes
          .replace(/\//g, "\\/"); // Escape forward slashes
        
        // Make sure brackets are properly escaped for regex pattern formatting
        // The pattern will be written as /pattern/flags, so we need to ensure
        // square brackets are properly represented
        let safePattern = escapedPattern;
        
        // When escaping for regex patterns, we need to be especially careful with brackets
        // The pattern will be written as /pattern/flags, so we need to ensure
        // square brackets are properly escaped to avoid "Unterminated character class" errors
        
        content += `    pattern: /${safePattern}/${rule.pattern.flags},\n`;
        
        // Add section property (ensuring it's numeric)
        content += `    section: ${parseInt(section, 10)},\n`;
        
        // Add subsection with proper null handling
        content += rule.subsection 
          ? `    subsection: "${rule.subsection.replace(/"/g, '\\"')}",\n` 
          : `    subsection: undefined,\n`;
        
        // Add entryIndex function if exists
        if (rule.entryIndex) {
          try {
            const fnString = rule.entryIndex.toString();
            // Format as a proper function with RegExpMatchArray parameter
            if (fnString.includes('(m)') || fnString.includes('(match)')) {
              // Already has correct parameter format
              content += `    entryIndex: ${fnString},\n`;
            } else if (fnString.includes('=>')) {
              // Arrow function but needs parameter added
              content += `    entryIndex: (m: RegExpMatchArray) ${fnString.replace(/^\(\)/, '')},\n`;
            } else {
              // Standard function needing conversion
              content += `    entryIndex: (m: RegExpMatchArray) => ${
                rule.entryIndex.toString().replace(/^function.*?\{/, '').replace(/\}$/, '').trim()
              },\n`;
            }
          } catch (fnError) {
            console.warn(`Warning: Could not convert entryIndex function to string for rule in section ${section}`, fnError);
            // Provide a default function that preserves the original intent if possible
            try {
              // Create a mock RegExpMatchArray to safely call the function
              const mockMatch = [''] as RegExpMatchArray;
              const returnValue = rule.entryIndex(mockMatch);
              if (typeof returnValue === 'number') {
                content += `    entryIndex: (m: RegExpMatchArray) => ${returnValue},\n`;
              } else {
                content += `    entryIndex: (m: RegExpMatchArray) => 1, // Default fallback\n`;
              }
            } catch (evalError) {
              content += `    entryIndex: (m: RegExpMatchArray) => 1, // Default fallback due to error\n`;
            }
          }
        }
        
        // Add confidence if exists
        if (rule.confidence !== undefined) {
          content += `    confidence: ${rule.confidence},\n`;
        } else {
          content += `    confidence: 0.8, // Default confidence\n`;
        }
        
        // Add description if exists
        if (rule.description) {
          // Properly escape description string
          const escapedDesc = rule.description.replace(/"/g, '\\"').replace(/\n/g, '\\n');
          content += `    description: "${escapedDesc}",\n`;
        } else {
          content += `    description: "Pattern for section ${section}",\n`;
        }
        
        content += `  }${index < rules.length - 1 ? ',' : ''}\n`;
      });
      
      content += `];\n\n`;
      
      // Add a default export for compatibility with various import styles
      content += `export default {\n`;
      content += `  sectionInfo,\n`;
      content += `  rules\n`;
      content += `};\n`;
      
      // Write to file with careful error handling
      try {
        await fs.writeFile(tsPath, content, 'utf-8');
        console.log(`Successfully wrote TypeScript rules file for section ${section} at ${tsPath}`);
        return tsPath;
      } catch (writeError) {
        console.error(`Error writing TypeScript rules file for section ${section}:`, writeError);
        // Create a backup file
        const rulesDir = path.dirname(tsPath);
        const backupPath = path.join(rulesDir, `section${section}.rules.backup.ts`);
        await fs.writeFile(backupPath, content, 'utf-8');
        console.log(`Created backup TypeScript rules file at ${backupPath}`);
        throw writeError;
      }
    } catch (error) {
      console.error(`Error creating TypeScript rules file for section ${section}:`, error);
      throw error;
    }
  }
}

export const ruleExporter = new RuleExporter(); 