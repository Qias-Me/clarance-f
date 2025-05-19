import fs from 'fs/promises';
import path from 'path';
/**
 * Exports rules to JSON format for easier editing
 */
export class RuleExporter {
    /**
     * Exports rules to JSON format
     * @param section Section number
     * @param rules Rules to export
     * @returns Promise resolving when export is complete
     */
    async exportRules(section, rules) {
        const rulesDir = path.join(process.cwd(), 'src', 'sectionizer', 'rules');
        const jsonPath = path.join(rulesDir, `section${section}.rules.json`);
        // Convert rules to JSON-friendly format
        const jsonRules = rules.map(rule => ({
            pattern: rule.pattern.source,
            flags: rule.pattern.flags,
            subSection: rule.subSection,
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
    async exportAllRules(rulesMap) {
        const exportPromises = [];
        for (const [section, rules] of rulesMap.entries()) {
            exportPromises.push(this.exportRules(section, rules));
        }
        return Promise.all(exportPromises);
    }
    /**
     * Creates a TypeScript rules file from JSON rules
     * @param section Section number
     * @param rules Rules to export
     * @param name Section name (optional)
     * @returns Promise resolving to the path of the generated file
     */
    async createTypeScriptRulesFile(section, rules, name = `Section ${section}`) {
        const rulesDir = path.join(process.cwd(), 'src', 'sectionizer', 'rules');
        const tsPath = path.join(rulesDir, `section${section}.rules.ts`);
        console.log(`Creating TypeScript rules file for section ${section} with ${rules.length} rules`);
        try {
            // Make sure the rules directory exists
            await fs.mkdir(rulesDir, { recursive: true });
            // Generate TypeScript content
            let content = `/**\n`;
            content += ` * Rules for Section ${section}: ${name}\n`;
            content += ` * Generated: ${new Date().toISOString()}\n`;
            content += ` */\n\n`;
            content += `import type { MatchRule } from '../types.js';\n\n`;
            content += `export const rules: MatchRule[] = [\n`;
            // Add each rule
            rules.forEach((rule, index) => {
                content += `  {\n`;
                content += `    pattern: /${rule.pattern.source.replace(/\\/g, "\\\\")}/${rule.pattern.flags},\n`;
                content += `    subSection: '${rule.subSection || "_default"}',\n`;
                // Add entryIndex function if exists
                if (rule.entryIndex) {
                    try {
                        const fnString = rule.entryIndex.toString();
                        content += `    entryIndex: ${fnString},\n`;
                    }
                    catch (fnError) {
                        console.warn(`Warning: Could not convert entryIndex function to string for rule in section ${section}`, fnError);
                        // Skip this property if it can't be converted
                    }
                }
                // Add confidence if exists
                if (rule.confidence !== undefined) {
                    content += `    confidence: ${rule.confidence},\n`;
                }
                // Add description if exists
                if (rule.description) {
                    content += `    description: '${rule.description.replace(/'/g, "\\'")}',\n`;
                }
                content += `  }${index < rules.length - 1 ? ',' : ''}\n`;
            });
            content += `];\n`;
            // Write to file - use fs.writeFile directly with error handling
            try {
                await fs.writeFile(tsPath, content, 'utf-8');
                console.log(`Successfully wrote TypeScript rules file for section ${section} at ${tsPath}`);
                return tsPath;
            }
            catch (writeError) {
                console.error(`Error writing TypeScript rules file for section ${section}:`, writeError);
                // Create a backup JSON file instead
                const backupPath = path.join(rulesDir, `section${section}.rules.backup.json`);
                await fs.writeFile(backupPath, JSON.stringify(rules, null, 2), 'utf-8');
                console.log(`Created backup JSON rules file instead at ${backupPath}`);
                throw writeError; // Re-throw for caller to handle
            }
        }
        catch (error) {
            console.error(`Error creating TypeScript rules file for section ${section}:`, error);
            throw error; // Re-throw for caller to handle
        }
    }
}
export const ruleExporter = new RuleExporter();
