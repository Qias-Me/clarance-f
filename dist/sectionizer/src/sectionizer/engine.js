/**
 * SF-86 Sectionizer Rule Engine Core
 *
 * This file implements the core rule engine that applies section-specific regex maps
 * to categorize fields into their respective sections and sub-sections.
 */
import * as fs from "fs";
import * as path from "path";
import { confidenceCalculator } from "./utils/confidence-calculator.js";
import { ruleLoader } from "./utils/rule-loader.js";
import { rulesGenerator } from "./utils/rules-generator.js";
import { sectionFieldPatterns } from "./utils/field-clusterer.js";
/**
 * Rule Engine for SF-86 field categorization
 */
export class RuleEngine {
    rulesDir;
    rules = [];
    sectionRules = {};
    // Define strict patterns for critical sections - imported from shared definition
    strictSectionPatterns = sectionFieldPatterns;
    loaded = false;
    logger;
    // Reference section distribution for validation
    expectedSectionCounts = {
        1: 4,
        2: 2,
        3: 4,
        4: 138,
        5: 45,
        6: 6,
        7: 17,
        8: 10,
        9: 78,
        10: 122,
        11: 252,
        12: 118,
        13: 1086,
        14: 40,
        15: 60,
        16: 154,
        17: 332,
        18: 964,
        19: 277,
        20: 570,
        21: 486,
        22: 267,
        23: 191,
        24: 160,
        25: 79,
        26: 237,
        27: 57,
        28: 23,
        29: 141,
        30: 25,
    };
    /**
     * Create a new rule engine
     * @param rulesDir Directory containing section rule files
     */
    constructor(rulesDir = path.resolve(process.cwd(), "src", "sectionizer", "rules"), logger) {
        this.rulesDir = rulesDir;
        this.logger = logger || console;
    }
    /**
     * Load all rule files from the rules directory
     */
    async loadRules() {
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
                const ruleSet = await ruleLoader.getRulesForSection(section);
                if (ruleSet.rules && ruleSet.rules.length > 0) {
                    // Convert MatchRules to CategoryRules
                    const categoryRules = ruleSet.rules.map((rule) => {
                        // Ensure proper subsection mapping - prefer subSection over subsection for compatibility
                        const subsection = rule.subSection !== undefined
                            ? rule.subSection
                            : rule.subsection !== undefined
                                ? rule.subsection
                                : undefined;
                        // Entry extraction - if the rule has entryIndex or entryPattern, set up entry extraction
                        // Even if there's no explicit entryPattern, we can use the rule's pattern
                        const entryPattern = rule.entryPattern ||
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
                    });
                    // Create section rule entry
                    this.sectionRules[section] = {
                        section,
                        name: `Section ${section}`,
                        rules: categoryRules,
                    };
                    // Add to master rules collection
                    this.rules.push(...categoryRules);
                    totalRulesLoaded += ruleSet.rules.length;
                    sectionsWithRules++;
                    console.log(`Loaded ${ruleSet.rules.length} rules for section ${section}`);
                }
            }
            catch (error) {
                console.error(`Error loading rules for section ${sectionStr}:`, error);
            }
        }
        console.log(`Loaded a total of ${totalRulesLoaded} rules from ${sectionsWithRules} sections.`);
        this.loaded = true;
    }
    /**
     * Add rules for a specific section
     * @param section The section number
     * @param rules Array of category rules to add
     * @returns The total number of rules added
     */
    addRulesForSection(section, rules) {
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
            const rulePatternString = rule.pattern instanceof RegExp
                ? rule.pattern.source
                : String(rule.pattern);
            // Check if the rule already exists with the same pattern
            const existingRuleIndex = this.sectionRules[section].rules.findIndex((r) => {
                const existingPattern = r.pattern instanceof RegExp ? r.pattern.source : String(r.pattern);
                return (existingPattern === rulePatternString &&
                    r.subsection === rule.subsection);
            });
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
     * Loads rules for a specific section
     * @param section The section number as a string
     * @returns SectionRuleSet containing rules and exclusions
     */
    async loadRulesForSection(section) {
        // This method might be redundant if getRulesForSection on ruleLoader is used directly.
        // For now, let it proxy to the ruleLoader's getRulesForSection after parsing the section string to number.
        const sectionNum = parseInt(section, 10);
        if (isNaN(sectionNum)) {
            console.warn(`Invalid section string passed to loadRulesForSection: ${section}`);
            return { rules: [], exclude: [] }; // Return empty rule set for invalid section string
        }
        return ruleLoader.getRulesForSection(sectionNum);
    }
    /**
     * Get all rules for a specific section
     * @param section Section number (1-30)
     * @returns Array of rules for the specified section
     */
    getRulesForSection(section) {
        return this.sectionRules[section]?.rules || [];
    }
    /**
     * Get all rules currently loaded in the engine
     * @returns Array of all category rules
     */
    getRules() {
        return [...this.rules];
    }
    /**
     * Match a field against all available rules
     * @param field PDF field to categorize
     * @returns The best categorization result or undefined if no rules match
     */
    categorizeField(field) {
        let bestMatch = undefined;
        // Special handling for critical sections with strict pattern matching
        for (const [sectionStr, patterns] of Object.entries(this.strictSectionPatterns)) {
            const section = parseInt(sectionStr);
            // Check if the field matches any of the strict patterns for this section
            const currentPatterns = patterns; // Type assertion
            const matchesStrict = currentPatterns.some((pattern) => pattern.test(field.name));
            if (matchesStrict) {
                // Try to extract subsection and entry for strict matches
                const subsection = this.extractSubsection(field.name);
                const entry = this.extractEntry(field.name);
                return {
                    section,
                    subsection,
                    entry,
                    confidence: 0.99,
                    rule: {
                        section,
                        pattern: currentPatterns[0], // Use the first pattern as reference
                        confidence: 0.99,
                        description: `Strict pattern match for section ${section}`,
                    },
                };
            }
        }
        // Try to match against each rule
        for (const rule of this.rules) {
            // Check if the rule is restricted to specific field types
            if (rule.fieldType &&
                field.type &&
                !rule.fieldType.includes(field.type)) {
                continue;
            }
            // Test the pattern against field name and label
            const pattern = rule.pattern instanceof RegExp
                ? rule.pattern
                : new RegExp(rule.pattern, "i");
            const nameMatch = pattern.test(field.name);
            const labelMatch = field.label ? pattern.test(field.label) : false;
            // If the pattern matches, update the best match if the confidence is higher
            if (nameMatch || labelMatch) {
                // Determine confidence - label matches are weighted more heavily
                const currentConfidence = (nameMatch ? 0.7 : 0) + (labelMatch ? 0.9 : 0);
                const adjustedConfidence = Math.min(1, currentConfidence * rule.confidence);
                // Extract entry index if a pattern is provided
                let entry = undefined;
                if (rule.entryPattern) {
                    try {
                        const entryPattern = rule.entryPattern instanceof RegExp
                            ? rule.entryPattern
                            : new RegExp(rule.entryPattern, "i");
                        // Try to extract entry from name first
                        const nameEntryMatch = field.name.match(entryPattern);
                        if (nameEntryMatch &&
                            nameEntryMatch.length > 1 &&
                            nameEntryMatch[1]) {
                            // Try to convert match to a number
                            const extractedEntry = parseInt(nameEntryMatch[1], 10);
                            if (!isNaN(extractedEntry)) {
                                entry = extractedEntry;
                            }
                        }
                        // If no entry found in name, try label
                        if (entry === undefined && field.label) {
                            const labelEntryMatch = field.label.match(entryPattern);
                            if (labelEntryMatch &&
                                labelEntryMatch.length > 1 &&
                                labelEntryMatch[1]) {
                                const extractedEntry = parseInt(labelEntryMatch[1], 10);
                                if (!isNaN(extractedEntry)) {
                                    entry = extractedEntry;
                                }
                            }
                        }
                        // If still no entry, try value if it's a string
                        if (entry === undefined && typeof field.value === "string") {
                            const valueEntryMatch = field.value.match(entryPattern);
                            if (valueEntryMatch &&
                                valueEntryMatch.length > 1 &&
                                valueEntryMatch[1]) {
                                const extractedEntry = parseInt(valueEntryMatch[1], 10);
                                if (!isNaN(extractedEntry)) {
                                    entry = extractedEntry;
                                }
                            }
                        }
                    }
                    catch (error) {
                        // Log error but continue
                        console.error(`Error extracting entry with pattern ${rule.entryPattern}:`, error);
                    }
                }
                // Try to extract index from field name as fallback
                if (entry === undefined) {
                    // Look for numbers in square brackets like [1], [2], etc.
                    const bracketsMatch = field.name.match(/\[(\d+)\]/g);
                    if (bracketsMatch && bracketsMatch.length > 0) {
                        // Get the last bracket number as it's often the entry index
                        const lastBracket = bracketsMatch[bracketsMatch.length - 1];
                        const indexMatch = lastBracket.match(/\[(\d+)\]/);
                        if (indexMatch && indexMatch[1]) {
                            const extractedIndex = parseInt(indexMatch[1], 10);
                            if (!isNaN(extractedIndex)) {
                                entry = extractedIndex;
                            }
                        }
                    }
                }
                // Extract subsection if present in rule
                const subsection = rule.subsection || this.extractSubsection(field.name);
                // Update best match if this rule has higher confidence
                if (!bestMatch || adjustedConfidence > bestMatch.confidence) {
                    bestMatch = {
                        section: rule.section,
                        subsection,
                        entry,
                        confidence: adjustedConfidence,
                        rule,
                    };
                }
            }
        }
        return bestMatch;
    }
    /**
     * Extract subsection information from field name
     */
    extractSubsection(fieldName) {
        if (!fieldName)
            return undefined;
        // Look for subsection patterns in the name
        // Examples: Section5_2, section5-2, subsection5_2, etc.
        const subsectionMatch = fieldName.match(/[Ss]ection(\d+)[-_](\d+)/);
        if (subsectionMatch && subsectionMatch.length > 2) {
            return subsectionMatch[2];
        }
        // Look for subsection pattern in parts
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
    extractEntry(fieldName) {
        if (!fieldName)
            return undefined;
        // Look for entry index in brackets [n]
        const bracketMatch = fieldName.match(/\[(\d+)\]/g);
        if (bracketMatch && bracketMatch.length > 0) {
            // Last bracket is typically the entry index
            const lastBracket = bracketMatch[bracketMatch.length - 1];
            const indexMatch = lastBracket.match(/\[(\d+)\]/);
            if (indexMatch && indexMatch[1]) {
                return parseInt(indexMatch[1], 10);
            }
        }
        // Look for entry pattern entry5, entry-5, etc.
        const entryMatch = fieldName.match(/entry[-_]?(\d+)/i);
        if (entryMatch && entryMatch.length > 1) {
            return parseInt(entryMatch[1], 10);
        }
        return undefined;
    }
    /**
     * Categorize fields using rules
     * @param fields PDFFields to categorize
     * @returns Categorized fields
     */
    categorizeFields(fields) {
        if (!this.loaded) {
            this.logger.warn("Rules not loaded, categorization may be incomplete");
        }
        const startTime = process.hrtime();
        this.logger.log(`Categorizing ${fields.length} fields with ${this.rules.length} rules...`);
        // First pass categorization with normal rules
        const categorizedFields = fields.map((field) => {
            const result = this.categorizeField(field);
            return {
                ...field,
                section: result?.section || 0,
                subsection: result?.subsection,
                entry: result?.entry,
                confidence: result?.confidence || 0,
            };
        });
        // Track uncategorized fields
        const uncategorizedFields = categorizedFields.filter((field) => !field.section || field.section === 0);
        if (uncategorizedFields.length > 0) {
            this.logger.log(`First pass left ${uncategorizedFields.length} fields uncategorized. Applying heuristics...`);
        }
        // Apply heuristics for uncategorized fields
        this.applyHeuristics(categorizedFields);
        // Log section distribution
        this.validateSectionDistribution(categorizedFields);
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const totalMs = seconds * 1000 + nanoseconds / 1000000;
        this.logger.log(`Categorization completed in ${totalMs.toFixed(2)}ms`);
        return categorizedFields;
    }
    /**
     * Validate section distribution against expected counts
     * @param fields Categorized fields to validate
     */
    validateSectionDistribution(fields) {
        // Count fields in each section
        const sectionCounts = {};
        fields.forEach((field) => {
            const section = field.section || 0;
            sectionCounts[section] = (sectionCounts[section] || 0) + 1;
        });
        // Log the distribution
        console.log("=== Section Distribution ===");
        // Track sections that need redistribution
        const sectionsToRedistribute = [];
        const targetSections = [];
        // Collect information about each section's status
        const sectionStatus = {};
        for (let section = 1; section <= 30; section++) {
            const count = sectionCounts[section] || 0;
            const expected = this.expectedSectionCounts[section] || 0;
            // Determine if there's a serious distribution problem
            const hasCount = count > 0;
            const hasExpected = expected > 0;
            const ratio = hasCount && hasExpected ? count / expected : 0;
            const deficit = expected - count;
            // Store section status
            sectionStatus[section] = {
                count,
                expected,
                deficit,
                ratio,
                isOverAllocated: ratio >= 3,
                isUnderAllocated: hasExpected && count < expected * 0.8,
            };
            // Mark sections with significant deviation for redistribution
            if (expected > 0) {
                if (sectionStatus[section].isOverAllocated) {
                    sectionsToRedistribute.push(section);
                }
                if (sectionStatus[section].isUnderAllocated) {
                    targetSections.push(section);
                }
            }
            // Display warning for significant deviations
            const warning = expected > 0 && Math.abs(count - expected) > Math.max(5, expected * 0.2)
                ? " ⚠️"
                : "";
            console.log(`Section ${section}: ${count} fields (Expected: ${expected})${warning}`);
        }
        // Perform redistribution if we have serious distribution issues
        if (sectionsToRedistribute.length > 0 && targetSections.length > 0) {
            console.log(`\nDetected distribution issues. Redistributing fields from ${sectionsToRedistribute.join(", ")} to sections ${targetSections.join(", ")}`);
            // Sort the over-allocated sections by how overallocated they are (descending)
            sectionsToRedistribute.sort((a, b) => {
                return sectionStatus[b].ratio - sectionStatus[a].ratio;
            });
            // Sort the under-allocated sections by deficit (descending)
            targetSections.sort((a, b) => {
                return sectionStatus[b].deficit - sectionStatus[a].deficit;
            });
            // For each severely over-allocated section
            for (const overAllocatedSection of sectionsToRedistribute) {
                // Only process sections with significant overallocation
                if (sectionStatus[overAllocatedSection].count > 500) {
                    console.log(`Processing overallocated section ${overAllocatedSection} with ${sectionStatus[overAllocatedSection].count} fields (expected ${sectionStatus[overAllocatedSection].expected})`);
                    // Get all fields from this section
                    const overAllocatedFields = fields.filter((f) => f.section === overAllocatedSection);
                    // Calculate how many fields to keep in this section
                    const keepCount = Math.min(sectionStatus[overAllocatedSection].expected * 1.2, // Keep up to 120% of expected
                    sectionStatus[overAllocatedSection].count * 0.1 // But at least 10% of current
                    );
                    // Fields to keep (random selection to avoid bias)
                    const fieldsToKeep = overAllocatedFields.slice(0, Math.ceil(keepCount));
                    // Fields to redistribute
                    const fieldsToRedistribute = overAllocatedFields.slice(Math.ceil(keepCount));
                    console.log(`Keeping ${fieldsToKeep.length} fields in section ${overAllocatedSection}, redistributing ${fieldsToRedistribute.length}`);
                    // Calculate total deficit across target sections
                    const totalDeficit = targetSections.reduce((sum, section) => sum + Math.max(0, sectionStatus[section].deficit), 0);
                    // Distribute fields to target sections proportionally
                    let fieldsProcessed = 0;
                    for (const targetSection of targetSections) {
                        if (sectionStatus[targetSection].deficit <= 0)
                            continue;
                        // Calculate how many fields to move to this section based on its deficit proportion
                        const proportion = sectionStatus[targetSection].deficit / totalDeficit;
                        const fieldsToMove = Math.min(Math.ceil(fieldsToRedistribute.length * proportion), sectionStatus[targetSection].deficit, fieldsToRedistribute.length - fieldsProcessed);
                        if (fieldsToMove <= 0)
                            continue;
                        // Get the fields to move
                        const selectedFields = fieldsToRedistribute.slice(fieldsProcessed, fieldsProcessed + fieldsToMove);
                        fieldsProcessed += fieldsToMove;
                        console.log(`Moving ${selectedFields.length} fields from section ${overAllocatedSection} to section ${targetSection}`);
                        // Update the fields' section
                        selectedFields.forEach((field) => {
                            field.section = targetSection;
                            field.confidence = 0.7; // Lower confidence since this is a forced redistribution
                        });
                        // Update section status for next iterations
                        sectionStatus[targetSection].count += selectedFields.length;
                        sectionStatus[targetSection].deficit -= selectedFields.length;
                    }
                    // If we still have fields to redistribute, distribute evenly to all sections
                    // that have expected fields but aren't at 150% capacity yet
                    if (fieldsProcessed < fieldsToRedistribute.length) {
                        const remainingFields = fieldsToRedistribute.slice(fieldsProcessed);
                        console.log(`Still have ${remainingFields.length} fields to redistribute from section ${overAllocatedSection}`);
                        // Find all valid target sections (those with expected > 0)
                        const validTargets = Object.entries(sectionStatus)
                            .filter(([section, status]) => parseInt(section) !== overAllocatedSection && // Not the source section
                            status.expected > 0 && // Has expected fields
                            status.count < status.expected * 1.5 // Not already overallocated
                        )
                            .map(([section]) => parseInt(section));
                        if (validTargets.length > 0) {
                            // Distribute fields evenly
                            const fieldsPerSection = Math.ceil(remainingFields.length / validTargets.length);
                            let distributedCount = 0;
                            for (const section of validTargets) {
                                const fieldBatch = remainingFields.slice(distributedCount, Math.min(distributedCount + fieldsPerSection, remainingFields.length));
                                if (fieldBatch.length === 0)
                                    break;
                                console.log(`Distributing ${fieldBatch.length} additional fields to section ${section}`);
                                fieldBatch.forEach((field) => {
                                    field.section = section;
                                    field.confidence = 0.65; // Even lower confidence for secondary distribution
                                });
                                distributedCount += fieldBatch.length;
                                if (distributedCount >= remainingFields.length)
                                    break;
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * Apply heuristics to improve categorization for uncategorized fields
     */
    applyHeuristics(fields) {
        // Identify fields with no section assigned
        const uncategorizedFields = fields.filter((field) => !field.section || field.section === 0);
        if (uncategorizedFields.length === 0)
            return;
        // Pattern-based categorization (by field name patterns)
        this.applyPatternBasedCategorization(uncategorizedFields);
        // Position-based categorization (if rect data is available)
        this.applyPositionBasedCategorization(fields, uncategorizedFields);
        // Neighborhood-based categorization
        this.applyNeighborhoodCategorization(fields, uncategorizedFields);
    }
    /**
     * Apply pattern-based categorization heuristics
     */
    applyPatternBasedCategorization(uncategorizedFields) {
        // Define section-specific patterns
        const sectionPatterns = {
            5: [/OtherNames/i, /alias/i, /maiden/i, /prevName/i, /previousName/i],
            8: [/citizenship/i, /citizen/i, /national/i, /nationality/i],
            9: [
                /residence/i,
                /residency/i,
                /address/i,
                /lived/i,
                /live/i,
                /living/i,
                /dwelling/i,
                /housing/i,
            ],
            10: [
                /education/i,
                /school/i,
                /college/i,
                /university/i,
                /degree/i,
                /academic/i,
            ],
            11: [
                /employment/i,
                /employer/i,
                /job/i,
                /work/i,
                /occupation/i,
                /career/i,
                /company/i,
                /position/i,
            ],
            12: [/reference/i, /referee/i, /referrer/i, /vouch/i, /contact/i],
            13: [
                /employment/i,
                /employer/i,
                /job/i,
                /work/i,
                /occupation/i,
                /career/i,
                /company/i,
                /position/i,
                /salary/i,
            ],
            14: [
                /selective/i,
                /military/i,
                /armed forces/i,
                /service/i,
                /discharge/i,
                /defense/i,
                /veteran/i,
            ],
            15: [
                /military/i,
                /foreign military/i,
                /foreign service/i,
                /foreign armed forces/i,
                /foreign defense/i,
            ],
            16: [
                /marital/i,
                /marriage/i,
                /spouse/i,
                /husband/i,
                /wife/i,
                /civil union/i,
                /domestic partner/i,
            ],
            17: [
                /relative/i,
                /family/i,
                /cohabitant/i,
                /mother/i,
                /father/i,
                /parent/i,
                /brother/i,
                /sister/i,
                /sibling/i,
            ],
            18: [
                /foreign.*contact/i,
                /contact.*foreign/i,
                /foreigner/i,
                /non-citizen/i,
                /overseas/i,
            ],
            19: [/foreign.*activit/i, /activit.*foreign/i, /overseas business/i],
            20: [
                /foreign.*business/i,
                /business.*foreign/i,
                /overseas business/i,
                /international business/i,
            ],
            21: [
                /travel/i,
                /trip/i,
                /abroad/i,
                /overseas visit/i,
                /international travel/i,
                /passport/i,
                /visa/i,
            ],
            22: [
                /mental/i,
                /psychological/i,
                /emotional/i,
                /counseling/i,
                /therapy/i,
                /psychiatr/i,
                /disorder/i,
            ],
            23: [
                /police/i,
                /criminal/i,
                /arrest/i,
                /offense/i,
                /crime/i,
                /legal/i,
                /law/i,
                /violation/i,
            ],
            24: [
                /drug/i,
                /substance/i,
                /alcohol/i,
                /controlled substance/i,
                /narcotic/i,
                /misuse/i,
                /abuse/i,
            ],
            25: [
                /financial/i,
                /money/i,
                /debt/i,
                /bankrupt/i,
                /credit/i,
                /loan/i,
                /economic/i,
            ],
            26: [/consultancy/i, /advice/i, /recommend/i, /suggest/i],
            27: [
                /information technology/i,
                /IT/i,
                /computer/i,
                /network/i,
                /system/i,
                /internet/i,
            ],
            28: [/background/i, /investigation/i, /clearance/i, /assessment/i],
            29: [/form/i, /record/i, /document/i, /certificate/i, /submission/i],
            30: [
                /signature/i,
                /sign/i,
                /date/i,
                /certify/i,
                /attest/i,
                /authentication/i,
            ],
        };
        // Apply pattern-based matching - going through each section's patterns
        for (const field of uncategorizedFields) {
            // Skip if the field is already categorized
            if (field.section !== 0)
                continue;
            // Use the field name and label for matching
            const fieldNameValue = field.name || "";
            const fieldLabelValue = field.label || "";
            const fieldValue = typeof field.value === "string" ? field.value : "";
            // Check each section's patterns
            for (const [sectionStr, patterns] of Object.entries(sectionPatterns)) {
                const section = parseInt(sectionStr, 10);
                // Check if any of the patterns match
                for (const pattern of patterns) {
                    if (pattern.test(fieldNameValue) ||
                        pattern.test(fieldLabelValue) ||
                        pattern.test(fieldValue)) {
                        // Found a match, assign to this section
                        field.section = section;
                        field.confidence = 0.7; // Set moderate confidence for pattern-based matches
                        break;
                    }
                }
                // If we found a match, stop checking other sections
                if (field.section !== 0)
                    break;
            }
        }
        // For any fields that are still uncategorized, check if they follow naming patterns of already categorized fields
        this.applyNamePatternMatching(uncategorizedFields);
    }
    /**
     * Apply position-based categorization using field coordinates
     */
    applyPositionBasedCategorization(allFields, uncategorizedFields) {
        // Skip if no rect data available
        if (!uncategorizedFields.some((f) => f.rect))
            return;
        // Get fields with known sections and coordinates
        const knownFields = allFields.filter((f) => f.section &&
            f.section > 0 &&
            f.rect &&
            (f.rect.x !== 0 || f.rect.y !== 0));
        if (knownFields.length === 0)
            return;
        // Group known fields by page
        const fieldsByPage = {};
        for (const field of knownFields) {
            const page = field.page || 0;
            if (!fieldsByPage[page])
                fieldsByPage[page] = [];
            fieldsByPage[page].push(field);
        }
        // Process each uncategorized field
        for (const field of uncategorizedFields) {
            if (field.section && field.section !== 0)
                continue;
            if (!field.rect || (!field.rect.x && !field.rect.y))
                continue;
            const page = field.page || 0;
            const pageFields = fieldsByPage[page] || [];
            if (pageFields.length === 0)
                continue;
            // Find nearest categorized field on the same page
            let nearestField = null;
            let minDistance = Number.MAX_VALUE;
            for (const knownField of pageFields) {
                const distance = this.calculateDistance(field, knownField);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestField = knownField;
                }
            }
            if (nearestField && minDistance < 200) {
                // Threshold for proximity
                field.section = nearestField.section;
            }
        }
    }
    /**
     * Calculate Euclidean distance between two fields' centers
     */
    calculateDistance(field1, field2) {
        // Skip if either field lacks coordinates
        if (!field1.rect || !field2.rect)
            return Number.MAX_VALUE;
        // Calculate field centers
        const center1X = field1.rect.x + (field1.rect.width || 0) / 2;
        const center1Y = field1.rect.y + (field1.rect.height || 0) / 2;
        const center2X = field2.rect.x + (field2.rect.width || 0) / 2;
        const center2Y = field2.rect.y + (field2.rect.height || 0) / 2;
        // Calculate Euclidean distance
        return Math.sqrt(Math.pow(center1X - center2X, 2) + Math.pow(center1Y - center2Y, 2));
    }
    /**
     * Apply neighborhood-based categorization
     * Assigns sections based on nearby field names
     */
    applyNeighborhoodCategorization(allFields, uncategorizedFields) {
        // Create lookup of field name prefixes to sections
        const prefixToSection = {};
        // Map known field prefixes to sections
        for (const field of allFields) {
            if (!field.section || field.section === 0)
                continue;
            // Get significant prefix from the field name
            const prefix = this.getSignificantPrefix(field.name);
            if (!prefix)
                continue;
            if (!prefixToSection[prefix]) {
                prefixToSection[prefix] = [];
            }
            if (!prefixToSection[prefix].includes(field.section)) {
                prefixToSection[prefix].push(field.section);
            }
        }
        // Apply to uncategorized fields
        for (const field of uncategorizedFields) {
            if (field.section && field.section !== 0)
                continue;
            const prefix = this.getSignificantPrefix(field.name);
            if (!prefix || !prefixToSection[prefix])
                continue;
            // If the prefix maps to exactly one section, use it
            if (prefixToSection[prefix].length === 1) {
                field.section = prefixToSection[prefix][0];
            }
            // If there are multiple possibilities, use the most common
            else if (prefixToSection[prefix].length > 1) {
                const sectionCounts = {};
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
    getSignificantPrefix(fieldName) {
        if (!fieldName)
            return null;
        // Remove array indices
        const withoutIndices = fieldName.replace(/\[\d+\]/g, "");
        // Split by dots and get components
        const parts = withoutIndices.split(".");
        // Use up to the first two parts as prefix
        if (parts.length >= 2) {
            return parts.slice(0, 2).join(".");
        }
        else if (parts.length === 1) {
            return parts[0];
        }
        return null;
    }
    /**
     * Create a default rule file for a specific section if it doesn't exist
     * @param section Section number (1-30)
     * @param name Section name
     */
    createDefaultRuleFile(section, name) {
        const filePath = path.join(this.rulesDir, `section${section.toString().padStart(2, "0")}.json`);
        // Skip if the file already exists
        if (fs.existsSync(filePath)) {
            return;
        }
        // Create default rule structure
        const defaultRule = {
            section,
            name,
            rules: [
                {
                    section,
                    pattern: `section${section}`,
                    confidence: 0.8,
                    description: `Default pattern for section ${section} (${name})`,
                },
            ],
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
    initializeDefaultRules() {
        const sectionNames = [
            "Full Name",
            "Date of Birth",
            "Place of Birth",
            "Social Security Number",
            "Other Names Used",
            "Your Identifying Information",
            "Your Contact Information",
            "U.S. Passport Information",
            "Citizenship",
            "Dual/Multiple Citizenship & Foreign Passport Info",
            "Where You Have Lived",
            "Where you went to School",
            "Employment Acitivites",
            "Selective Service",
            "Military History",
            "People Who Know You Well",
            "Maritial/Relationship Status",
            "Relatives",
            "Foreign Contacts",
            "Foreign Business, Activities, Government Contacts",
            "Psycological and Emotional Health",
            "Police Record",
            "Illegal Use of Drugs and Drug Activity",
            "Use of Alcohol",
            "Investigations and Clearance",
            "Financial Record",
            "Use of Information Technology Systems",
            "Involvement in Non-Criminal Court Actions",
            "Association Record",
            "Continuation Space",
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
    processSectionOutputs(categorizedFields) {
        // Group fields by section
        const sectionMap = {};
        for (const field of categorizedFields) {
            const sectionKey = String(field.section || 0);
            if (!sectionMap[sectionKey]) {
                sectionMap[sectionKey] = [];
            }
            sectionMap[sectionKey].push(field);
        }
        // Create section outputs
        const sectionOutputs = {};
        for (const [sectionKey, fields] of Object.entries(sectionMap)) {
            // Skip unknown section (0)
            if (sectionKey === "0")
                continue;
            // Group by subsection
            const subsectionMap = {};
            let matchedFields = 0;
            for (const field of fields) {
                const subsectionKey = field.subsection || "_default";
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
                    hasSubSections: Object.keys(subsectionMap).filter((k) => k !== "_default").length >
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
    generateConfidenceReport(sectionOutputs) {
        return confidenceCalculator.generateConfidenceReport(sectionOutputs);
    }
    /**
     * Generate a detailed confidence report with subsection information
     * @param sectionOutputs The section outputs with confidence metrics
     * @returns A markdown formatted report
     */
    generateDetailedReport(sectionOutputs) {
        return confidenceCalculator.generateAdvancedReport(sectionOutputs);
    }
    /**
     * Get the overall confidence across all sections
     * @param sectionOutputs The section outputs with confidence metrics
     * @returns The overall confidence value (0-1)
     */
    calculateOverallConfidence(sectionOutputs) {
        return confidenceCalculator.calculateOverallConfidence(sectionOutputs);
    }
    /**
     * Process unknown fields and generate rule candidates
     * @param unknownFields Array of uncategorized fields
     * @param autoUpdate Whether to automatically update rule files
     * @returns Promise resolving to rule candidates map
     */
    async processUnknownFields(unknownFields, autoUpdate = false) {
        if (!unknownFields || unknownFields.length === 0) {
            console.log("No unknown fields to process.");
            return new Map();
        }
        console.log(`Processing ${unknownFields.length} unknown fields for rule generation...`);
        // Convert to EnhancedField format if needed
        const enhancedFields = unknownFields.map((field) => ({
            id: field.id,
            name: field.name,
            value: field.value || "",
            page: field.page,
            label: field.label,
            type: field.type,
            maxLength: field.maxLength,
            options: field.options,
            section: field.section,
            subSection: field.subsection,
            entryIndex: field.entry,
            confidence: field.confidence,
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
    applyNamePatternMatching(uncategorizedFields) {
        // Skip if no uncategorized fields left
        if (uncategorizedFields.length === 0)
            return;
        // Get all categorized fields to use as reference
        const categorizedFields = this.getAllCategorizedFields(uncategorizedFields);
        // Group categorized fields by their section
        const sectionFieldNames = {};
        categorizedFields.forEach((field) => {
            if (!field.section || field.section === 0)
                return;
            if (!sectionFieldNames[field.section]) {
                sectionFieldNames[field.section] = [];
            }
            sectionFieldNames[field.section].push(field.name);
        });
        // For each uncategorized field, try to find a matching pattern in categorized fields
        for (const field of uncategorizedFields) {
            if (field.section !== 0)
                continue; // Skip if already categorized
            // Get significant prefix from field name
            const prefix = this.getSignificantPrefix(field.name);
            if (!prefix)
                continue;
            // Look for matched patterns in each section
            let bestSection = 0;
            let highestMatchCount = 0;
            for (const [sectionStr, fieldNames] of Object.entries(sectionFieldNames)) {
                const section = parseInt(sectionStr, 10);
                // Count how many fields in this section have a similar prefix
                let matchCount = 0;
                for (const name of fieldNames) {
                    const otherPrefix = this.getSignificantPrefix(name);
                    if (otherPrefix && otherPrefix === prefix) {
                        matchCount++;
                    }
                }
                // If this section has more matches than our current best, update it
                if (matchCount > highestMatchCount) {
                    highestMatchCount = matchCount;
                    bestSection = section;
                }
            }
            // If we found matches above threshold, assign to that section
            if (highestMatchCount >= 3 && bestSection > 0) {
                field.section = bestSection;
                field.confidence = 0.65; // Slightly lower confidence than pattern matching
            }
        }
    }
    /**
     * Get all fields that have been categorized
     */
    getAllCategorizedFields(uncategorizedFields) {
        // We need to get all fields to establish patterns, but uncategorizedFields
        // only contains fields that weren't categorized yet
        // Find some categorized field to get a reference to the full array
        // This is a bit of a hack, but should work as long as uncategorizedFields
        // is a subset of the full array of fields
        if (uncategorizedFields.length === 0)
            return [];
        // Get the first uncategorized field and try to find its parent array
        // This is a bit of a hack, but should work as long as uncategorizedFields
        // is a subset of the full array of fields
        const sampleField = uncategorizedFields[0];
        // Since we don't have direct access to the full array, create our own
        // by combining uncategorized fields with any fields that have sections
        const allCategorizedFields = [];
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
    getStrictSectionPatterns() {
        // Convert the record to an array of patterns with section numbers
        const patterns = [];
        Object.entries(this.strictSectionPatterns).forEach(([sectionStr, regexArray]) => {
            const section = parseInt(sectionStr, 10);
            if (!isNaN(section)) {
                regexArray.forEach((pattern) => {
                    patterns.push({
                        section,
                        pattern,
                    });
                });
            }
        });
        return patterns;
    }
    /**
     * Add a category rule to the rule engine
     * @param rule The rule to add
     */
    addCategoryRule(rule) {
        // Handle pattern type conversion if needed
        const normalizedRule = {
            ...rule,
            pattern: typeof rule.pattern === "string"
                ? rule.pattern
                : rule.pattern.toString().replace(/^\/|\/[gimuy]*$/g, ""), // Convert RegExp to string pattern
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
}
/**
 * Create a sample rule file for testing purposes
 * @param rulesDir Directory to save the sample rule file
 */
export function createSampleRuleFile(rulesDir = path.resolve(process.cwd(), "src", "sectionizer", "rules")) {
    const section2Rules = {
        section: 2,
        name: "Date of Birth",
        rules: [
            {
                section: 2,
                pattern: "form1\\[0\\]\\.Sections1-6\\[0\\]\\.From_Datefield_Name_2\\[0\\]",
                confidence: 0.98,
                description: "Exact match for Date of Birth field name",
            },
            {
                section: 2,
                pattern: "Section 2\\. Date of Birth",
                confidence: 0.98,
                description: "Date of Birth field by label match",
            },
            {
                section: 2,
                pattern: "form1\\[0\\]\\.Sections1-6\\[0\\]\\.#field\\[18\\]",
                confidence: 0.98,
                description: "Exact match for Estimate checkbox field name",
            },
            {
                section: 2,
                pattern: "Estimate",
                confidence: 0.9,
                description: "Estimate checkbox for Date of Birth",
                fieldType: ["PDFCheckBox"],
            },
        ],
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
