import fs from 'fs/promises';
import path from 'path';
import * as url from 'url';
import { sectionFieldPatterns } from './field-clusterer.js';
/**
 * Manages loading and caching of section rules, prioritizing TypeScript files
 */
export class RuleLoader {
    ruleCache = new Map();
    rulesDir;
    constructor(rulesDir) {
        this.rulesDir = rulesDir || path.join(process.cwd(), 'src', 'sectionizer', 'rules');
    }
    /**
     * Get rules for a specific section
     * @param section Section number to get rules for
     * @returns Promise resolving to the rules for the section
     */
    async getRulesForSection(section) {
        const sectionKey = `section-${section}`;
        // Return cached rules if available
        if (this.ruleCache.has(sectionKey)) {
            return this.ruleCache.get(sectionKey);
        }
        try {
            // First try to load rules from TypeScript file (preferred source of truth)
            const rules = await this.loadRulesFromTypeScript(section);
            if (rules && rules.rules.length > 0) {
                // Cache and return the loaded rules
                this.ruleCache.set(sectionKey, rules);
                return rules;
            }
            // If TypeScript loading failed, try JSON as fallback
            const jsonRules = await this.loadRulesFromJson(section);
            if (jsonRules && jsonRules.rules.length > 0) {
                // Cache and return the loaded rules
                this.ruleCache.set(sectionKey, jsonRules);
                return jsonRules;
            }
            // If both TypeScript and JSON loading failed, create default rules
            const defaultRules = this.createDefaultRules(section);
            // Cache and return the default rules
            this.ruleCache.set(sectionKey, defaultRules);
            return defaultRules;
        }
        catch (error) {
            console.warn(`Error loading rules for section ${section}:`, error);
            // Create default rules as fallback
            const defaultRules = this.createDefaultRules(section);
            this.ruleCache.set(sectionKey, defaultRules);
            return defaultRules;
        }
    }
    /**
     * Load rules from TypeScript file
     * @param section Section number
     * @returns Promise resolving to the rules for the section, or null if not found
     */
    async loadRulesFromTypeScript(section) {
        try {
            const sectionStr = section.toString().padStart(2, "0");
            const tsFilePath = path.join(this.rulesDir, `section${sectionStr}.rules.ts`);
            // Check if the TypeScript file exists
            try {
                await fs.access(tsFilePath);
            }
            catch (err) {
                // File doesn't exist
                return null;
            }
            // In a Node.js environment, we could use dynamic imports
            // For simplicity in this implementation, we'll parse the file contents
            const fileContent = await fs.readFile(tsFilePath, 'utf-8');
            // Extract the rules array using regex
            const rulesMatch = fileContent.match(/export const rules: MatchRule\[] = \[([\s\S]*?)\];/);
            if (!rulesMatch) {
                console.warn(`Could not extract rules from ${tsFilePath}`);
                return null;
            }
            // Parse the rules from the TypeScript content
            const rules = this.parseRulesFromTypeScript(rulesMatch[1], section.toString());
            return {
                rules,
            };
        }
        catch (error) {
            console.warn(`Error loading TypeScript rules for section ${section}:`, error);
            return null;
        }
    }
    /**
     * Load rules from JSON file (legacy format)
     * @param section Section number
     * @returns Promise resolving to the rules for the section, or null if not found
     */
    async loadRulesFromJson(section) {
        try {
            // Try to load rules from the JSON rule file - padded with leading zeros
            const sectionStr = section.toString();
            // Try both naming conventions for backward compatibility
            const ruleFile = path.join(this.rulesDir, `section${sectionStr}.rules.json`);
            let fileContent = null;
            fileContent = await fs.readFile(ruleFile, 'utf-8');
            if (!fileContent) {
                return null;
            }
            // Parse the JSON content
            const jsonData = JSON.parse(fileContent);
            // Handle both our format and potential third-party formats
            if (Array.isArray(jsonData)) {
                // If it's an array, assume it's a direct list of rules
                const rules = this.convertJsonRulesToMatchRules(jsonData);
                return { rules };
            }
            else if (jsonData.rules) {
                // If it has a rules property, use that
                const rules = this.convertJsonRulesToMatchRules(jsonData.rules);
                return { rules };
            }
            else {
                // Otherwise assume it's a SectionRules structure
                return jsonData;
            }
        }
        catch (error) {
            console.warn(`Error loading JSON rules for section ${section}:`, error);
            return null;
        }
    }
    /**
     * Create default rules for a section based on strict patterns
     * @param section Section number
     * @returns Default rule set for the section
     */
    createDefaultRules(section) {
        const defaultRules = {
            rules: [],
        };
        // Add strict pattern rules for this section if available
        if (Object.prototype.hasOwnProperty.call(sectionFieldPatterns, section)) {
            const patterns = sectionFieldPatterns[section];
            // Ensure we create patterns that use unpadded section numbers
            defaultRules.rules = patterns.map((pattern) => ({
                pattern: new RegExp(pattern.source, 'i'),
                confidence: 0.95,
                section: 0,
            }));
        }
        return defaultRules;
    }
    isFieldInSection(fieldName, section) {
        if (!fieldName)
            return false;
        const lowerName = fieldName.toLowerCase();
        // Check if we have patterns for this section
        if (!sectionFieldPatterns[section]) {
            return false;
        }
        // Check if the field name matches any pattern for this section
        const patterns = sectionFieldPatterns[section];
        return patterns.some(pattern => pattern.test(lowerName));
    }
    /**
     * Convert JSON rule objects to MatchRule objects
     * @param jsonRules Array of rule objects from JSON
     * @returns Array of MatchRule objects
     */
    convertJsonRulesToMatchRules(jsonRules) {
        return jsonRules.map(rule => {
            // Convert pattern from string or object to RegExp
            let pattern;
            if (typeof rule.pattern === 'string') {
                // Pattern is a string, convert to RegExp
                pattern = new RegExp(rule.pattern, rule.flags || 'i');
            }
            else if (rule.pattern instanceof RegExp) {
                // Pattern is already a RegExp
                pattern = rule.pattern;
            }
            else if (rule.pattern && typeof rule.pattern.source === 'string') {
                // Pattern is an object with source property
                pattern = new RegExp(rule.pattern.source, rule.pattern.flags || 'i');
            }
            else {
                // Fallback: use a safe default pattern that won't match anything
                console.warn('Invalid pattern found in JSON rule:', rule);
                pattern = /(?!)/; // Will not match anything
            }
            // Create MatchRule object
            return {
                pattern,
                section: rule.section || 0,
                subsection: rule.subsection || undefined,
                confidence: rule.confidence || 0.8,
                description: rule.description || '',
                // Other properties as needed
            };
        });
    }
    /**
     * Parse rules from TypeScript content
     * @param rulesText TypeScript rules array content
     * @param section Section number for error reporting
     * @returns Array of MatchRule objects
     */
    parseRulesFromTypeScript(rulesText, section) {
        const rules = [];
        try {
            // Split by rule objects (looking for pattern markers)
            const ruleBlocks = rulesText.split(/pattern: \//);
            // Skip the first empty split result
            for (let i = 1; i < ruleBlocks.length; i++) {
                const block = ruleBlocks[i];
                try {
                    // Extract pattern parts - improved to handle escaped brackets better
                    const patternEndIndex = this.findPatternEndIndex(block);
                    if (patternEndIndex === -1)
                        continue;
                    const patternSource = block.substring(0, patternEndIndex);
                    // Extract flags - look for the flags after the closing / of the regex
                    const flagsMatch = block.substring(patternEndIndex + 1).match(/^([gimuy]*),/);
                    const flags = flagsMatch ? flagsMatch[1] : '';
                    // Extract section
                    const sectionMatch = block.match(/section: ([\d.]+),/);
                    const section = sectionMatch ? parseInt(sectionMatch[1], 10) : 0;
                    // Extract subsection
                    const subsectionMatch = block.match(/subsection: ['"](.*?)['"],/);
                    const subsection = subsectionMatch ? subsectionMatch[1] : undefined;
                    // Extract confidence
                    const confidenceMatch = block.match(/confidence: ([\d.]+),/);
                    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.8;
                    // Extract description
                    const descriptionMatch = block.match(/description: ['"]([^'"]*?)['"],/);
                    const description = descriptionMatch ? descriptionMatch[1] : '';
                    // Create rule object with safely constructed RegExp
                    let pattern;
                    try {
                        // Handle escaped patterns more safely
                        const safePatternSource = patternSource.replace(/\\\\([[\]])/g, '\\$1');
                        pattern = new RegExp(safePatternSource, flags);
                    }
                    catch (regexError) {
                        console.warn(`Invalid regex in section ${section}: /${patternSource}/${flags}`, regexError);
                        // Create a fallback safe pattern
                        pattern = new RegExp("INVALID_PATTERN");
                        continue; // Skip this rule
                    }
                    // Create rule object
                    const rule = {
                        pattern,
                        section,
                        subsection,
                        confidence,
                        description
                    };
                    rules.push(rule);
                }
                catch (ruleError) {
                    console.warn(`Error parsing rule in section ${section}:`, ruleError);
                    // Continue with next rule
                }
            }
        }
        catch (parseError) {
            console.error(`Error parsing TypeScript rules for section ${section}:`, parseError);
        }
        return rules;
    }
    /**
     * Helper method to find the end index of a regex pattern, handling escaped brackets
     * @param text Text containing the regex pattern
     * @returns Index of the closing / of the regex pattern, or -1 if not found
     */
    findPatternEndIndex(text) {
        let inBrackets = false;
        let escapeNext = false;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (escapeNext) {
                escapeNext = false;
                continue;
            }
            if (char === '\\') {
                escapeNext = true;
                continue;
            }
            if (char === '[' && !inBrackets) {
                inBrackets = true;
                continue;
            }
            if (char === ']' && inBrackets) {
                inBrackets = false;
                continue;
            }
            // Only consider / as pattern end if we're not within brackets
            if (char === '/' && !inBrackets) {
                return i;
            }
        }
        // Pattern end not found
        return -1;
    }
    /**
     * Public version of parseRulesFromTypeScript for external use
     * @param rulesText TypeScript rules text to parse
     * @param section Section number or string
     * @returns Array of parsed MatchRule objects
     */
    parseRulesFromTypeScriptExternal(rulesText, section) {
        return this.parseRulesFromTypeScript(rulesText, section);
    }
    /**
     * Get available section numbers from rule files
     * @returns Promise resolving to an array of section numbers as strings
     */
    async getAvailableSections() {
        try {
            // Ensure rules directory exists
            try {
                await fs.access(this.rulesDir);
            }
            catch (error) {
                await fs.mkdir(this.rulesDir, { recursive: true });
                return Object.keys(sectionFieldPatterns).filter(s => s !== "0");
            }
            // Read all files in the rules directory
            const files = await fs.readdir(this.rulesDir);
            // Extract section numbers from filenames using the exact pattern from the photo:
            // section1.rules.ts and section1.rules.json
            const tsSectionPattern = /section(\d+)\.rules\.ts$/i;
            const jsonSectionPattern = /section(\d+)\.rules\.json$/i;
            // Get sections from both TypeScript and JSON files
            const sections = new Set();
            files.forEach(file => {
                // Check for TypeScript files first
                let match = file.match(tsSectionPattern);
                if (match && match[1]) {
                    sections.add(match[1]);
                    return;
                }
                // Then check for JSON files
                match = file.match(jsonSectionPattern);
                if (match && match[1]) {
                    sections.add(match[1]);
                }
            });
            // Convert Set to Array
            const sectionArray = Array.from(sections);
            // If we found section files, return those
            if (sectionArray.length > 0) {
                return sectionArray;
            }
            // Fallback to sectionFieldPatterns keys if no rule files found
            return Object.keys(sectionFieldPatterns).filter(s => s !== "0");
        }
        catch (error) {
            console.warn('Error getting available sections:', error);
            // Fallback to sectionFieldPatterns keys
            return Object.keys(sectionFieldPatterns).filter(s => s !== "0");
        }
    }
}
export const ruleLoader = new RuleLoader();
