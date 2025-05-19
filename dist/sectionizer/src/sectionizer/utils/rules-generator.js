import * as bridge from './bridgeAdapter.js';
import fs from 'fs/promises';
import path from 'path';
import { ruleLoader } from './rule-loader.js';
import { ruleExporter } from './rule-exporter.js';
import chalk from 'chalk';
/**
 * Self-healing rule generator for SF-86 field categorization
 * Analyzes unknown fields and proposes new rules to improve categorization
 */
export class RulesGenerator {
    /**
     * Analyzes unknown fields and generates new rule candidates
     * @param unknownFields Array of uncategorized fields
     * @returns Map of section numbers to new rules
     */
    async generateRuleCandidates(unknownFields) {
        // Initialize empty map to store rule candidates by section
        const ruleCandidates = new Map();
        if (!unknownFields || unknownFields.length === 0) {
            console.log('No unknown fields to analyze.');
            return ruleCandidates;
        }
        console.log(`Analyzing ${unknownFields.length} unknown fields for rule generation...`);
        // Group fields by potential section using various heuristics
        const sectionGroups = this.groupFieldsByPotentialSection(unknownFields);
        // For each section group, generate rule candidates
        for (const [section, fields] of sectionGroups.entries()) {
            console.log(`Generating rules for section ${section} with ${fields.length} fields...`);
            const candidates = this.generateCandidatesForSection(section, fields);
            if (candidates.length > 0) {
                ruleCandidates.set(section, candidates);
                console.log(`Generated ${candidates.length} rule candidates for section ${section}`);
            }
        }
        return ruleCandidates;
    }
    /**
     * Groups unknown fields by their potential section
     * @param fields Array of unknown fields
     * @returns Map of section numbers to fields
     */
    groupFieldsByPotentialSection(fields) {
        const groups = new Map();
        // Track fields that couldn't be assigned
        const unassigned = [];
        for (const field of fields) {
            let assigned = false;
            // Method 1: Try to extract section number from field name
            const nameSection = this.extractSectionFromName(field.name);
            // Method 2: Try to determine section from page number
            const pageSection = field.page > 0 ? bridge.pageRangeLookup(field.page) : null;
            // Method 3: Try the bridge's advanced categorization if available
            const bridgeResult = bridge.extractSectionInfo(field.name);
            // Method 4: Try fallback categorization
            const fallbackResult = bridge.fallbackCategorization(field);
            // Use the most reliable detection method (prioritize name over page over bridge over fallback)
            const sectionId = nameSection ||
                (pageSection ? String(pageSection) : null) ||
                (bridgeResult ? String(bridgeResult.section) : null) ||
                (fallbackResult ? String(fallbackResult.section) : null);
            if (sectionId) {
                // Only assign to sections 1-30
                const sectionNum = parseInt(sectionId);
                if (sectionNum >= 1 && sectionNum <= 30) {
                    // Add to the appropriate group
                    if (!groups.has(sectionId)) {
                        groups.set(sectionId, []);
                    }
                    groups.get(sectionId).push(field);
                    assigned = true;
                }
            }
            if (!assigned) {
                unassigned.push(field);
            }
        }
        // Try second-pass assignment for unassigned fields using content analysis
        if (unassigned.length > 0) {
            this.assignFieldsByContent(unassigned, groups);
        }
        // Log group statistics
        console.log(`Grouped ${fields.length} fields into ${groups.size} potential sections`);
        for (const [section, sectionFields] of groups.entries()) {
            console.log(`  Section ${section}: ${sectionFields.length} fields`);
        }
        return groups;
    }
    /**
     * Extracts potential section number from field name
     * @param fieldName Field name to analyze
     * @returns Section number string or null if not found
     */
    extractSectionFromName(fieldName) {
        // Pattern 1: Look for explicit "section" followed by a number
        const explicitMatch = fieldName.match(/section(\d+)/i);
        if (explicitMatch && explicitMatch[1]) {
            const section = parseInt(explicitMatch[1]);
            if (section >= 1 && section <= 30) {
                return String(section);
            }
        }
        // Pattern 2: Look for pattern like "13A" at the start
        const prefixMatch = fieldName.match(/^(\d+)[a-z]/i);
        if (prefixMatch && prefixMatch[1]) {
            const section = parseInt(prefixMatch[1]);
            if (section >= 1 && section <= 30) {
                return String(section);
            }
        }
        // Pattern 3: Look for section notation with underscore/dash
        const separatorMatch = fieldName.match(/[_-](\d+)[a-z]?[_-]/i);
        if (separatorMatch && separatorMatch[1]) {
            const section = parseInt(separatorMatch[1]);
            if (section >= 1 && section <= 30) {
                return String(section);
            }
        }
        return null;
    }
    /**
     * Second-pass assignment using content similarity and clustering
     * @param unassigned Unassigned fields to process
     * @param groups Existing section groups to add to
     */
    assignFieldsByContent(unassigned, groups) {
        // Skip if no unassigned fields
        if (unassigned.length === 0)
            return;
        // For each unassigned field, try to find the most similar assigned group
        for (const field of unassigned) {
            let bestSection = null;
            let bestScore = 0;
            // Compare with fields in each group
            for (const [section, sectionFields] of groups.entries()) {
                if (sectionFields.length === 0)
                    continue;
                // Calculate similarity based on field attributes
                const score = this.calculateSimilarityScore(field, sectionFields);
                if (score > bestScore) {
                    bestScore = score;
                    bestSection = section;
                }
            }
            // Assign to best matching section if score is high enough
            if (bestSection && bestScore > 0.5) {
                groups.get(bestSection).push(field);
            }
            else {
                // Create fallback group for truly unknown fields
                const fallbackSection = "1"; // Default to section 1 as fallback
                if (!groups.has(fallbackSection)) {
                    groups.set(fallbackSection, []);
                }
                groups.get(fallbackSection).push(field);
            }
        }
    }
    /**
     * Calculate similarity score between a field and a group of fields
     * @param field Field to compare
     * @param groupFields Group of fields to compare against
     * @returns Similarity score (0-1)
     */
    calculateSimilarityScore(field, groupFields) {
        // Bail if no group fields
        if (groupFields.length === 0)
            return 0;
        // Simple scoring based on name similarity and page proximity
        let nameScore = 0;
        let pageScore = 0;
        // Find closest field by page number
        const fieldPage = field.page;
        if (fieldPage > 0) {
            const pageDistances = groupFields
                .filter(f => f.page > 0)
                .map(f => Math.abs(f.page - fieldPage));
            if (pageDistances.length > 0) {
                const minDistance = Math.min(...pageDistances);
                // Closer pages = higher score (max 30 pages away = 0 score)
                pageScore = Math.max(0, 1 - (minDistance / 30));
            }
        }
        // Find name similarity by common substrings
        const fieldName = field.name.toLowerCase();
        for (const groupField of groupFields) {
            const groupFieldName = groupField.name.toLowerCase();
            // Simple prefix/suffix matching
            const prefixLength = this.commonPrefixLength(fieldName, groupFieldName);
            const suffixLength = this.commonSuffixLength(fieldName, groupFieldName);
            // Score based on largest common portion
            const maxCommonLength = Math.max(prefixLength, suffixLength);
            const nameSimScore = maxCommonLength / Math.min(fieldName.length, groupFieldName.length);
            // Track the highest name similarity
            nameScore = Math.max(nameScore, nameSimScore);
        }
        // Combine scores with weights (name is more important than page)
        return (nameScore * 0.7) + (pageScore * 0.3);
    }
    /**
     * Calculate length of common prefix between two strings
     * @param str1 First string
     * @param str2 Second string
     * @returns Length of common prefix
     */
    commonPrefixLength(str1, str2) {
        const minLength = Math.min(str1.length, str2.length);
        let i = 0;
        while (i < minLength && str1[i] === str2[i]) {
            i++;
        }
        return i;
    }
    /**
     * Calculate length of common suffix between two strings
     * @param str1 First string
     * @param str2 Second string
     * @returns Length of common suffix
     */
    commonSuffixLength(str1, str2) {
        const minLength = Math.min(str1.length, str2.length);
        let i = 0;
        while (i < minLength &&
            str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) {
            i++;
        }
        return i;
    }
    /**
     * Generates rule candidates for a specific section
     * @param section Section number or string
     * @param fields Fields to analyze
     * @returns Array of rule candidates
     */
    generateCandidatesForSection(section, fields) {
        if (fields.length === 0)
            return [];
        console.log(`Generating rules for section ${section} with ${fields.length} fields...`);
        // Get all unique field names
        const fieldNames = [...new Set(fields.map(f => f.name))];
        // Initialize arrays to store different types of rules
        const namingPatternRules = [];
        const prefixRules = [];
        const contentRules = [];
        const frequencyRules = [];
        const specialCaseRules = [];
        // 1. Exact section identifiers in field names (highest confidence)
        const exactSectionPatterns = [
            // Exact section number patterns
            new RegExp(`section[_\\. ]*(0*${section}|${section})\\b`, 'i'),
            new RegExp(`\\bs(0*${section}|${section})[_\\. ]`, 'i'),
            new RegExp(`\\[${section}\\]`, 'i'),
            new RegExp(`\\bform\\d*_section${section}\\b`, 'i'),
            new RegExp(`\\bsection${section}_`, 'i'),
            new RegExp(`\\bsection${section}\\b`, 'i'),
            new RegExp(`\\bs${section}_`, 'i')
        ];
        // Find fields matching exact patterns to set a baseline
        let exactMatchCount = 0;
        const exactMatchingFields = new Set();
        for (const pattern of exactSectionPatterns) {
            const matches = fieldNames.filter(name => pattern.test(name));
            if (matches.length > 0) {
                exactMatchCount += matches.length;
                matches.forEach(m => exactMatchingFields.add(m));
                namingPatternRules.push({
                    pattern,
                    subSection: '_default',
                    confidence: 0.98,
                    description: `Fields explicitly matching ${pattern}`
                });
            }
        }
        console.log(`Found ${exactMatchCount} fields with explicit section ${section} patterns`);
        // 2. Generate special case rules for specific sections
        // These are manually curated based on known section content
        this.addSpecialCaseRulesForSection(section, fields, specialCaseRules);
        // 3. Look for common prefixes in field names
        const prefixes = this.findCommonPrefixes(fieldNames);
        for (const [prefix, count] of Object.entries(prefixes)) {
            // Only use prefixes that appear frequently and aren't too short
            if (count >= 3 && prefix.length >= 4) {
                const escapedPrefix = this.escapeRegExp(prefix);
                prefixRules.push({
                    pattern: new RegExp(`^${escapedPrefix}`, 'i'),
                    subSection: '_default',
                    confidence: Math.min(0.93, 0.85 + (count / fieldNames.length * 0.1)),
                    description: `Fields starting with '${prefix}' (${count} fields)`
                });
            }
        }
        // 4. Analyze field values for section-specific content
        // Find fields with values that mention the section or have distinctive content
        contentRules.push(...this.createValueBasedPatterns(fields, section));
        // 5. Look for distinctive field name patterns (without explicit section number)
        // These will be lower confidence patterns used as fallbacks
        const patterns = this.extractDistinctivePatterns(fieldNames);
        // Test each pattern against all fields in this section
        for (const pattern of patterns) {
            const matchingFields = fieldNames.filter(name => pattern.test(name));
            // Avoid patterns that match too few fields or would be redundant
            if (matchingFields.length >= 5 &&
                !namingPatternRules.some(r => r.pattern.source === pattern.source)) {
                frequencyRules.push({
                    pattern,
                    subSection: '_default',
                    confidence: 0.87,
                    description: `Distinctive pattern matching ${matchingFields.length} fields`
                });
            }
        }
        // 6. For sections with few good patterns, add specific field name patterns
        // This is useful for sections that don't have clear naming conventions
        if (exactMatchCount === 0 && specialCaseRules.length === 0) {
            console.log(`No exact matches for section ${section}, creating specific field patterns`);
            // Create patterns from the most frequent field names directly
            const frequentFields = this.findMostFrequentFields(fieldNames, 10);
            for (const fieldName of frequentFields) {
                // Only use fields that are distinctive enough
                if (fieldName.length > 5) {
                    const escapedName = this.escapeRegExp(fieldName);
                    frequencyRules.push({
                        pattern: new RegExp(escapedName, 'i'),
                        subSection: '_default',
                        confidence: 0.86,
                        description: `Specific field name match: '${fieldName}'`
                    });
                }
            }
        }
        // 7. If section has subsections, create patterns for those
        const subsectionPatterns = this.extractSubsectionPatterns(section, fieldNames);
        for (const [subSection, pattern] of subsectionPatterns) {
            namingPatternRules.push({
                pattern,
                subSection,
                confidence: 0.95,
                description: `Subsection ${subSection} field pattern`
            });
        }
        // Combine all rule types with priority order
        const allRules = [
            ...namingPatternRules, // Highest confidence - explicit section refs
            ...specialCaseRules, // High confidence - custom rules for special sections
            ...contentRules, // Medium-high confidence - value-based
            ...prefixRules, // Medium confidence - common prefixes
            ...frequencyRules // Lower confidence - frequency-based patterns
        ];
        // Deduplicate patterns
        const uniqueRules = this.deduplicatePatterns(allRules);
        console.log(`Generated ${uniqueRules.length} unique rule candidates for section ${section}`);
        return uniqueRules;
    }
    /**
     * Find common prefixes in field names
     * @param fieldNames Array of field names
     * @returns Map of prefix to count
     */
    findCommonPrefixes(fieldNames) {
        const prefixCounts = {};
        // Check for prefixes of at least 4 characters
        const minPrefixLength = 4;
        for (const name of fieldNames) {
            // Check possible prefixes
            for (let i = minPrefixLength; i <= Math.min(name.length, 20); i++) {
                const prefix = name.substring(0, i);
                prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
            }
        }
        // Filter out prefixes that are too common (like 'form') or too rare
        const filteredPrefixes = {};
        const commonPrefixes = new Set(['form', 'field', 'input', 'sect', 'cont']);
        for (const [prefix, count] of Object.entries(prefixCounts)) {
            // Skip if it's a common generic prefix
            if (commonPrefixes.has(prefix.toLowerCase()))
                continue;
            // Keep if it appears in multiple fields
            if (count >= 3) {
                filteredPrefixes[prefix] = count;
            }
        }
        return filteredPrefixes;
    }
    /**
     * Extract distinctive patterns from field names
     * @param fieldNames Array of field names
     * @returns Array of regex patterns
     */
    extractDistinctivePatterns(fieldNames) {
        if (fieldNames.length < 3)
            return [];
        const patterns = [];
        // Look for common components
        const parts = fieldNames.map(name => {
            // Split by common separators
            return name.split(/[\[\]\.\_\-]/);
        });
        // Count part frequencies
        const partCounts = {};
        for (const nameParts of parts) {
            for (const part of nameParts) {
                if (part.length > 0) {
                    partCounts[part] = (partCounts[part] || 0) + 1;
                }
            }
        }
        // Find significant parts (appear in at least 30% of fields)
        const minCount = Math.max(3, Math.ceil(fieldNames.length * 0.3));
        const significantParts = Object.entries(partCounts)
            .filter(([part, count]) => count >= minCount && part.length >= 3)
            .map(([part]) => part);
        // Create regex patterns for each significant part
        for (const part of significantParts) {
            const escapedPart = this.escapeRegExp(part);
            patterns.push(new RegExp(`${escapedPart}`, 'i'));
        }
        return patterns;
    }
    /**
     * Deduplicate a list of match rules
     * @param rules Array of rules to deduplicate
     * @returns Deduplicated rules
     */
    deduplicatePatterns(rules) {
        // Use pattern source and confidence as deduplication key
        const uniqueRules = new Map();
        for (const rule of rules) {
            const key = `${rule.pattern.source}|${rule.subSection || '_default'}`;
            // If we have this pattern already, keep the one with higher confidence
            if (uniqueRules.has(key)) {
                const existing = uniqueRules.get(key);
                if ((rule.confidence || 0) > (existing.confidence || 0)) {
                    uniqueRules.set(key, rule);
                }
            }
            else {
                uniqueRules.set(key, rule);
            }
        }
        // Return unique rules sorted by confidence (highest first)
        return Array.from(uniqueRules.values())
            .sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    }
    /**
     * Add special case rules for specific sections based on known content
     * @param section Section number
     * @param fields Fields in the section
     * @param rules Array to add rules to
     */
    addSpecialCaseRulesForSection(section, fields, rules) {
        // Map of section numbers to special case patterns
        // These are hand-crafted patterns based on knowledge of the form
        const specialCases = {
            // Format: [pattern, description, confidence]
            "10": [
                [/foreign.*contacts/i, "Foreign contacts fields", 0.95],
                [/foreign.*national/i, "Foreign national fields", 0.95],
                [/foreign.*associate/i, "Foreign associate fields", 0.95]
            ],
            "12": [
                [/employment.*record/i, "Employment record fields", 0.95],
                [/employer/i, "Employer fields", 0.9],
                [/employment/i, "Employment fields", 0.9]
            ],
            "13": [
                [/education/i, "Education fields", 0.95],
                [/school/i, "School fields", 0.95],
                [/degree/i, "Degree fields", 0.9]
            ],
            "16": [
                [/financial.*record/i, "Financial record fields", 0.95],
                [/bankruptcy/i, "Bankruptcy fields", 0.95],
                [/debt/i, "Debt fields", 0.9]
            ],
            "18": [
                [/foreign.*travel/i, "Foreign travel fields", 0.95],
                [/travel/i, "Travel fields", 0.9],
                [/passport/i, "Passport fields", 0.95]
            ],
            "24": [
                [/substance.*abuse/i, "Substance abuse fields", 0.95],
                [/drug/i, "Drug use fields", 0.9],
                [/alcohol/i, "Alcohol use fields", 0.9]
            ],
            "26": [
                [/financial.*record/i, "Financial record fields", 0.95],
                [/financial.*conflict/i, "Financial conflict fields", 0.95]
            ],
            "27": [
                [/information.*technology/i, "IT fields", 0.95],
                [/computer/i, "Computer related fields", 0.9],
                [/hacking/i, "Hacking related fields", 0.95],
                [/unauthorized.*access/i, "Unauthorized access fields", 0.95]
            ]
        };
        // Add any special case patterns for this section
        if (specialCases[section]) {
            console.log(`Adding ${specialCases[section].length} special case patterns for section ${section}`);
            for (const [pattern, description, confidence] of specialCases[section]) {
                rules.push({
                    pattern,
                    subSection: '_default',
                    confidence,
                    description
                });
            }
        }
        // Add any additional patterns based on field examination
        const fieldValues = fields
            .filter(f => f.value && typeof f.value === 'string')
            .map(f => f.value);
        // Look for common topics in field values
        const topics = this.extractCommonTopics(fieldValues);
        for (const [topic, count] of Object.entries(topics)) {
            if (count >= 3) {
                rules.push({
                    pattern: new RegExp(this.escapeRegExp(topic), 'i'),
                    subSection: '_default',
                    confidence: 0.88,
                    description: `Fields related to '${topic}' (${count} occurrences)`
                });
            }
        }
    }
    /**
     * Find most frequent fields in a list of field names
     * @param fieldNames Array of field names
     * @param limit Max number to return
     * @returns Array of most frequent field names
     */
    findMostFrequentFields(fieldNames, limit) {
        // Get fields that appear multiple times
        const counts = {};
        for (const name of fieldNames) {
            // Create simplified versions of the names for comparison
            const simpleName = name
                .toLowerCase()
                .replace(/\d+/g, 'N') // Replace numbers with N
                .replace(/[_\-\.]/g, '_'); // Normalize separators
            counts[simpleName] = (counts[simpleName] || 0) + 1;
        }
        // Sort by frequency
        const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([name]) => name);
        return sorted;
    }
    /**
     * Extract common topics from field values
     * @param values Array of field values
     * @returns Map of topics to frequency
     */
    extractCommonTopics(values) {
        const topics = {};
        // List of common topics that might be useful for categorization
        const topicTerms = [
            "employment", "education", "travel", "residence", "citizenship",
            "criminal", "drug", "alcohol", "financial", "foreign", "military",
            "mental", "security", "personal", "identity", "medical", "legal",
            "contact", "reference", "investigation", "background", "clearance",
            "psychological", "technology", "computer", "internet", "social", "media",
            "marriage", "family", "relative", "spouse", "dependent", "address",
            "history", "record", "activity", "government", "classified", "sensitive",
            "training", "certificate", "license", "passport", "visa", "clearance"
        ];
        // Count occurrences of these topics in values
        for (const value of values) {
            if (!value)
                continue;
            const lowerValue = value.toLowerCase();
            for (const term of topicTerms) {
                if (lowerValue.includes(term)) {
                    topics[term] = (topics[term] || 0) + 1;
                }
            }
        }
        return topics;
    }
    /**
     * Extract subsection patterns from field names
     * @param section Main section number
     * @param fieldNames Field names to analyze
     * @returns Map of subsection identifier to pattern
     */
    extractSubsectionPatterns(section, fieldNames) {
        const patterns = new Map();
        // Common pattern: section10a, section10b, etc.
        const subsectionPattern = new RegExp(`section${section}([a-z]\\d*)`, 'i');
        const subsections = new Set();
        for (const name of fieldNames) {
            const match = name.match(subsectionPattern);
            if (match && match[1]) {
                subsections.add(match[1].toUpperCase());
            }
        }
        // Create patterns for each subsection
        for (const sub of subsections) {
            patterns.set(sub, new RegExp(`section${section}${sub}`, 'i'));
        }
        // Also look for X.Y.Z notation
        const dotNotationPattern = new RegExp(`${section}\\.([a-z\\d]+)`, 'i');
        for (const name of fieldNames) {
            const match = name.match(dotNotationPattern);
            if (match && match[1]) {
                const sub = match[1].toUpperCase();
                patterns.set(sub, new RegExp(`${section}\\.${match[1]}`, 'i'));
            }
        }
        return patterns;
    }
    /**
     * Creates patterns based on field values
     * @param fields Fields to analyze
     * @param section Section ID
     * @returns Array of rule candidates
     */
    createValueBasedPatterns(fields, section) {
        const patterns = [];
        // Find fields with distinctive values
        const fieldsWithValues = fields.filter(f => f.value && typeof f.value === 'string' && f.value.length > 0);
        // Look for fields with section number in their value
        const sectionInValue = fieldsWithValues.filter(f => {
            if (typeof f.value !== 'string')
                return false;
            return f.value.includes(`Section ${section}`) || f.value.includes(`section ${section}`);
        });
        if (sectionInValue.length > 0) {
            // Create pattern based on field name
            for (const field of sectionInValue) {
                patterns.push({
                    pattern: new RegExp(this.escapeRegExp(field.name), 'i'),
                    subSection: '_default',
                    confidence: 0.9,
                    description: `Field with section ${section} in its value`
                });
            }
        }
        return patterns;
    }
    /**
     * Escape special characters in a string for use in a RegExp
     * @param string String to escape
     * @returns Escaped string
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    /**
     * Updates rule files with new candidates
     * @param ruleCandidates Map of section numbers to new rules
     * @returns Promise resolving to array of updated section names
     */
    async updateRuleFiles(ruleCandidates) {
        if (!ruleCandidates || ruleCandidates.size === 0) {
            console.log('No rule candidates to update.');
            return [];
        }
        const updatedSections = [];
        let updatedRulesCount = 0;
        // Process each section's rule candidates
        for (const [section, candidates] of ruleCandidates.entries()) {
            if (candidates.length === 0) {
                console.log(`No rule candidates for section ${section}, skipping.`);
                continue;
            }
            console.log(`Processing ${candidates.length} rule candidates for section ${section}`);
            try {
                // Load existing rules for this section
                const existingRules = await ruleLoader.loadRules(section);
                // Always export rules regardless of duplication - force updates
                const newRules = candidates;
                console.log(`Section ${section}: Updating rules with ${newRules.length} candidates`);
                // Create both JSON and TypeScript files
                await ruleExporter.exportRules(section, newRules);
                await ruleExporter.createTypeScriptRulesFile(section, newRules);
                updatedSections.push(section);
                updatedRulesCount += newRules.length;
                console.log(`Successfully updated rules for section ${section}`);
            }
            catch (error) {
                console.error(`Error updating rules for section ${section}:`, error);
                // Try to create files even if loading existing rules failed
                try {
                    console.log(`Attempting to create new rule files for section ${section}`);
                    await ruleExporter.exportRules(section, candidates);
                    await ruleExporter.createTypeScriptRulesFile(section, candidates);
                    updatedSections.push(section);
                    updatedRulesCount += candidates.length;
                    console.log(`Successfully created rules for section ${section}`);
                }
                catch (createError) {
                    console.error(`Failed to create rule files for section ${section}:`, createError);
                }
            }
        }
        console.log(`Updated ${updatedSections.length} section rule files with ${updatedRulesCount} rules`);
        if (updatedSections.length === 0) {
            console.log('No rule files were updated.');
        }
        return updatedSections;
    }
    /**
     * Merges existing rules with new candidates
     * @param existing Existing rules
     * @param candidates New rule candidates
     * @returns Merged rules
     */
    mergeRules(existing, candidates) {
        const merged = [...existing];
        // Get string representations of existing patterns for efficient comparison
        const existingPatternsStr = new Set(existing.map(rule => rule.pattern.toString()));
        const existingPatternSources = new Set(existing.map(rule => rule.pattern.source));
        let newRulesAdded = 0;
        console.log(`Merging ${candidates.length} candidates with ${existing.length} existing rules`);
        for (const candidate of candidates) {
            const patternStr = candidate.pattern.toString();
            const patternSource = candidate.pattern.source;
            // Skip if exact pattern already exists
            if (existingPatternsStr.has(patternStr) || existingPatternSources.has(patternSource)) {
                console.log(`  Skipping exact pattern match: ${patternStr}`);
                continue;
            }
            // Also check for pattern similarity
            let isDuplicate = false;
            for (const existingRule of existing) {
                if (this.arePatternsEquivalent(existingRule.pattern, candidate.pattern)) {
                    console.log(`  Skipping similar pattern: ${patternStr} (similar to ${existingRule.pattern})`);
                    isDuplicate = true;
                    break;
                }
            }
            // Skip if pattern is a duplicate
            if (isDuplicate) {
                continue;
            }
            // Add the new rule
            merged.push(candidate);
            existingPatternsStr.add(patternStr);
            existingPatternSources.add(patternSource);
            newRulesAdded++;
        }
        console.log(`Added ${newRulesAdded} new rules after deduplication`);
        if (newRulesAdded === 0) {
            console.log(`No new rules needed - all patterns already exist`);
        }
        return merged;
    }
    /**
     * Checks if two regex patterns are equivalent
     * @param pattern1 First pattern
     * @param pattern2 Second pattern
     * @returns True if patterns are equivalent
     */
    arePatternsEquivalent(pattern1, pattern2) {
        // Quick equality check
        if (pattern1.toString() === pattern2.toString()) {
            return true;
        }
        // For more sophisticated comparison, normalize patterns
        const norm1 = pattern1.source.replace(/\\\s/g, ' ').replace(/\s+/g, '\\s+');
        const norm2 = pattern2.source.replace(/\\\s/g, ' ').replace(/\s+/g, '\\s+');
        // Simple pattern similarity check
        const similarity = this.patternSimilarity(norm1, norm2);
        return similarity > 0.9;
    }
    /**
     * Calculate similarity between two pattern strings
     * @param str1 First string
     * @param str2 Second string
     * @returns Similarity score (0-1)
     */
    patternSimilarity(str1, str2) {
        // Very basic similarity - ratio of common characters
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();
        // Count common characters
        let common = 0;
        for (let i = 0; i < s1.length; i++) {
            if (s2.includes(s1[i])) {
                common++;
            }
        }
        // Calculate similarity
        return common / Math.max(s1.length, s2.length);
    }
    /**
     * Generates rules for an array of enhanced fields
     * @param fields Array of fields with their enhanced metadata
     * @returns Map of section to rules
     */
    generateRulesForFields(fields) {
        console.log(`Generating rules for ${fields.length} fields...`);
        // Group fields by section
        const sectionFields = {};
        for (const field of fields) {
            if (!field.section)
                continue;
            const section = field.section.toString();
            if (!sectionFields[section]) {
                sectionFields[section] = [];
            }
            sectionFields[section].push(field);
        }
        // Validate section counts against known references (where available)
        this.validateSectionCounts(sectionFields);
        // Generate rules for each section
        const ruleMap = new Map();
        for (const [section, sFields] of Object.entries(sectionFields)) {
            if (sFields.length < 5) {
                console.log(`Skipping rule generation for section ${section} (only ${sFields.length} fields)`);
                continue;
            }
            console.log(`Generating rules for section ${section} with ${sFields.length} fields...`);
            const candidates = this.generateCandidatesForSection(section, sFields);
            // Validate candidates to ensure they don't over-match
            const validatedCandidates = this.validateCandidates(candidates, section, fields);
            if (validatedCandidates.length > 0) {
                console.log(`Generated ${validatedCandidates.length} validated rule candidates for section ${section}`);
                ruleMap.set(section, validatedCandidates);
            }
            else {
                console.log(`No valid rules generated for section ${section}`);
            }
        }
        return ruleMap;
    }
    /**
     * Validates section counts against reference data
     * @param sectionFields Map of section to fields
     */
    validateSectionCounts(sectionFields) {
        // Known reference counts from SF-86 form 
        const referenceCounts = {
            "1": 15, "2": 20, "3": 10, "4": 25, "5": 140,
            "6": 25, "7": 20, "8": 15, "9": 100, "10": 60,
            "11": 40, "12": 40, "13": 80, "14": 40, "15": 40,
            "16": 40, "17": 90, "18": 30, "19": 50, "20": 40,
            "21": 50, "22": 50, "23": 50, "24": 20, "25": 40,
            "26": 20, "27": 20, "28": 20, "29": 141, "30": 10
        };
        console.log('Validating section counts against reference data:');
        // Check for significant deviations
        let totalDeviation = 0;
        let sectionsWithDeviations = 0;
        for (let i = 1; i <= 30; i++) {
            const section = i.toString();
            const actualCount = sectionFields[section]?.length || 0;
            const expectedCount = referenceCounts[section] || 0;
            if (expectedCount > 0) {
                const deviation = actualCount - expectedCount;
                const percentDeviation = expectedCount > 0 ? (Math.abs(deviation) / expectedCount) * 100 : 0;
                totalDeviation += Math.abs(deviation);
                if (Math.abs(deviation) > 5 || percentDeviation > 10) {
                    console.log(chalk.yellow(`Section ${section}: ${actualCount} fields vs expected ${expectedCount} ` +
                        `(${deviation > 0 ? '+' : ''}${deviation}, ${percentDeviation.toFixed(1)}%)`));
                    sectionsWithDeviations++;
                }
            }
        }
        if (sectionsWithDeviations > 0) {
            console.log(chalk.yellow(`${sectionsWithDeviations} sections have significant count deviations. ` +
                `Total absolute deviation: ${totalDeviation} fields.`));
        }
        else {
            console.log(chalk.green('All section counts align well with reference data.'));
        }
    }
    /**
     * Validates rule candidates to ensure they don't over-match fields
     * @param candidates Rule candidates to validate
     * @param targetSection Section these rules are for
     * @param allFields All fields for cross-validation
     * @returns Validated rule candidates
     */
    validateCandidates(candidates, targetSection, allFields) {
        if (candidates.length === 0)
            return [];
        const validatedCandidates = [];
        // Group other sections' fields for testing
        const otherSectionFields = allFields.filter(f => f.section && f.section.toString() !== targetSection);
        // Get the target section fields
        const targetSectionFields = allFields.filter(f => f.section && f.section.toString() === targetSection);
        // Calculate ideal pattern coverage
        const targetFieldCount = targetSectionFields.length;
        let coveredFieldsSet = new Set();
        console.log(`Validating ${candidates.length} rule candidates for section ${targetSection} (${targetFieldCount} fields)`);
        // First pass - select high confidence patterns with zero false positives
        for (const candidate of candidates) {
            // Test how many fields this rule matches in the target section
            const targetMatches = targetSectionFields.filter(f => candidate.pattern.test(f.name));
            // Test how many fields this rule incorrectly matches in other sections
            const incorrectMatches = otherSectionFields.filter(f => candidate.pattern.test(f.name));
            // Calculate precision - what percentage of matches are correct
            const totalMatches = targetMatches.length + incorrectMatches.length;
            const precision = totalMatches > 0 ? targetMatches.length / totalMatches : 0;
            // Calculate recall - what percentage of target section fields are matched
            const recall = targetFieldCount > 0 ?
                targetMatches.length / targetFieldCount : 0;
            // Only accept rules with perfect precision and significant recall
            if (precision === 1.0 && targetMatches.length >= 3) {
                // Create a quality score message
                const qualityMessage = `Precision: 100%, ` +
                    `Recall: ${(recall * 100).toFixed(1)}%, ` +
                    `${targetMatches.length}/${targetFieldCount} fields`;
                // Add the matched field IDs to our coverage tracking
                for (const match of targetMatches) {
                    coveredFieldsSet.add(match.name);
                }
                // Set confidence based on recall and pattern specificity
                const patternSpecificity = candidate.pattern.source.length / 20; // longer patterns are more specific
                const confidence = 0.95 + (recall * 0.04) + (Math.min(patternSpecificity, 1) * 0.01);
                // Add confidence and quality message to the rule
                candidate.confidence = Math.min(confidence, 0.98);
                candidate.description = candidate.description ?
                    `${candidate.description} (${qualityMessage})` :
                    qualityMessage;
                validatedCandidates.push(candidate);
            }
        }
        // Second pass - if coverage is too low, accept rules with high (but not perfect) precision
        const coveredFields = coveredFieldsSet.size;
        const coveragePercent = (coveredFields / targetFieldCount) * 100;
        console.log(`First pass validated ${validatedCandidates.length} rule candidates covering ${coveredFields}/${targetFieldCount} fields (${coveragePercent.toFixed(1)}%)`);
        // If coverage is below 80%, add some more flexible rules
        if (coveragePercent < 80) {
            console.log(`Coverage too low (${coveragePercent.toFixed(1)}%), adding more flexible rules`);
            for (const candidate of candidates) {
                // Skip if we already validated this rule
                if (validatedCandidates.some(r => r.pattern.source === candidate.pattern.source)) {
                    continue;
                }
                // Test how many fields this rule matches in the target section
                const targetMatches = targetSectionFields.filter(f => candidate.pattern.test(f.name));
                // Test how many fields this rule incorrectly matches in other sections
                const incorrectMatches = otherSectionFields.filter(f => candidate.pattern.test(f.name));
                // Calculate precision - what percentage of matches are correct
                const totalMatches = targetMatches.length + incorrectMatches.length;
                const precision = totalMatches > 0 ? targetMatches.length / totalMatches : 0;
                // Calculate recall - what percentage of target section fields are matched
                const recall = targetFieldCount > 0 ?
                    targetMatches.length / targetFieldCount : 0;
                // Count new fields this rule would cover (that aren't already covered)
                const newCoveredFields = targetMatches.filter(f => !coveredFieldsSet.has(f.name)).length;
                // Only accept rules with high precision and that cover new fields
                if (precision >= 0.98 && newCoveredFields > 0) {
                    // Create a quality score message
                    const qualityMessage = `Precision: ${(precision * 100).toFixed(1)}%, ` +
                        `Adds ${newCoveredFields} fields, ` +
                        `${incorrectMatches.length} false positives`;
                    // Add the matched field IDs to our coverage tracking
                    for (const match of targetMatches) {
                        coveredFieldsSet.add(match.name);
                    }
                    // Set confidence based on precision
                    candidate.confidence = 0.9 + (precision * 0.08);
                    // Add confidence and quality message to the rule
                    candidate.description = candidate.description ?
                        `${candidate.description} (${qualityMessage})` :
                        qualityMessage;
                    validatedCandidates.push(candidate);
                }
            }
        }
        // Final coverage assessment
        const finalCoveredFields = coveredFieldsSet.size;
        const finalCoveragePercent = (finalCoveredFields / targetFieldCount) * 100;
        console.log(`Final coverage: ${finalCoveredFields}/${targetFieldCount} fields (${finalCoveragePercent.toFixed(1)}%)`);
        // Sort by confidence
        return validatedCandidates.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    }
}
// Export a singleton instance
export const rulesGenerator = new RulesGenerator();
