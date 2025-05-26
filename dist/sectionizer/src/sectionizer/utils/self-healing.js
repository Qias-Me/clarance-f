/**
 * Self-healing utility for SF-86 field categorization
 *
 * This file implements the iterative self-healing mechanism that processes
 * unknown fields and generates new rules until convergence.
 */
import { rulesGenerator, RulesGenerator } from './rules-generator.js';
import { RuleEngine } from '../engine.js';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { identifySectionByPageWithConfidence, enhancedMultiDimensionalCategorization, detectSectionFromFieldValue, extractSectionInfoFromName, getNeighborFieldContext, sectionClassifications } from './fieldParsing.js';
/**
 * Manages the iterative self-healing process for field categorization
 */
export class SelfHealingManager {
    maxIterations;
    // Make iteration public so it can be accessed by reportGenerator
    iteration = 0;
    // Keep these protected for derived classes
    previousUnknownCount = Infinity;
    previousMiscategorizedCount = Infinity;
    /**
     * Constructor for SelfHealingManager
     * @param maxIterations Maximum number of iterations to attempt
     */
    constructor(maxIterations = 5) {
        this.maxIterations = maxIterations;
    }
    /**
     * Process unknown fields to improve categorization
     * @param ruleEngine Rule engine with categorization logic
     * @param unknownFields Uncategorized fields to process
     * @param autoUpdate Automatically update rule files
     * @param logProgress Log progress during processing
     * @returns Results of the self-healing process
     */
    async processUnknownFields(ruleEngine, unknownFields, autoUpdate = true, logProgress = true) {
        // Reset iteration counter
        this.iteration = 0;
        this.previousUnknownCount = unknownFields.length;
        // Track metrics
        let totalGeneratedRules = 0;
        let initialUnknownCount = unknownFields.length;
        let currentUnknownFields = [...unknownFields];
        let latestRuleCandidates = new Map();
        // No unknown fields to process
        if (unknownFields.length === 0) {
            if (logProgress) {
                console.log('No unknown fields to process.');
            }
            return {
                success: true,
                iterations: 0,
                remainingUnknown: [],
                generatedRules: 0,
                improvedFields: 0,
                ruleCandidates: new Map()
            };
        }
        // Initialize the rule generator
        const rulesGenerator = new RulesGenerator();
        while (currentUnknownFields.length > 0 && this.iteration < this.maxIterations) {
            this.iteration++;
            if (logProgress) {
                console.log(`\nIteration ${this.iteration}: Analyzing ${currentUnknownFields.length} unknown fields...`);
            }
            // Generate rule candidates
            latestRuleCandidates = await ruleEngine.processUnknownFields(currentUnknownFields, false); // Don't auto-update - we'll handle it ourselves
            if (latestRuleCandidates.size === 0) {
                if (logProgress) {
                    console.log('No new rules could be generated. Breaking iteration loop.');
                }
                break;
            }
            // Count generated rules
            const generatedRules = Array.from(latestRuleCandidates.entries())
                .reduce((total, [_, rules]) => total + rules.length, 0);
            totalGeneratedRules += generatedRules;
            if (logProgress) {
                console.log(`Generated ${generatedRules} new rules for ${latestRuleCandidates.size} sections`);
            }
            // Explicitly update rule files
            let rulesUpdated = false;
            if (autoUpdate && latestRuleCandidates.size > 0) {
                try {
                    const updatedSections = await rulesGenerator.updateRuleFiles(latestRuleCandidates);
                    if (updatedSections.length > 0) {
                        console.log(`Successfully updated rules for ${updatedSections.length} sections: ${updatedSections.join(', ')}`);
                        rulesUpdated = true;
                    }
                    else {
                        console.log('No rule files were actually updated despite having rule candidates.');
                    }
                }
                catch (error) {
                    console.error('Error updating rule files:', error);
                }
            }
            // Wait for rule engine to reload rules after file update
            if (autoUpdate && rulesUpdated) {
                try {
                    await ruleEngine.loadRules();
                    console.log('Successfully reloaded rules into the engine.');
                }
                catch (error) {
                    console.error('Error reloading rules:', error);
                    console.log('Will continue with existing rules.');
                }
            }
            // Re-categorize fields to see if we've improved
            currentUnknownFields = await this.recategorizeUnknownFields(ruleEngine, currentUnknownFields);
            if (logProgress) {
                console.log(`Re-processing complete. ${currentUnknownFields.length} fields remain unclassified.`);
            }
            // Check if we're making progress
            if (currentUnknownFields.length >= this.previousUnknownCount) {
                if (logProgress) {
                    console.log('No improvement in classification, stopping iterations.');
                }
                break;
            }
            this.previousUnknownCount = currentUnknownFields.length;
        }
        // Calculate improvement
        const improvedFields = initialUnknownCount - currentUnknownFields.length;
        if (logProgress) {
            if (currentUnknownFields.length === 0) {
                console.log('\nSuccess: All fields have been categorized!');
            }
            else {
                console.log(`\nPartial success: ${currentUnknownFields.length} fields could not be categorized after ${this.iteration} iterations.`);
            }
            console.log(`Generated ${totalGeneratedRules} new rules during the self-healing process.`);
            console.log(`Improved classification for ${improvedFields} fields (${(improvedFields / initialUnknownCount * 100).toFixed(2)}%).`);
        }
        return {
            success: currentUnknownFields.length === 0,
            iterations: this.iteration,
            remainingUnknown: currentUnknownFields,
            generatedRules: totalGeneratedRules,
            improvedFields,
            ruleCandidates: latestRuleCandidates
        };
    }
    /**
     * Correct miscategorized fields based on section statistics
     * @param ruleEngine Rule engine
     * @param sectionFields Current section fields
     * @param referenceCounts Expected counts for each section
     * @param deviationThreshold Minimum deviation to consider significant (as a proportion)
     * @returns Corrected section fields
     */
    async correctMiscategorizedFields(ruleEngine, sectionFields, referenceCounts, deviationThreshold = 0.2) {
        console.log(chalk.cyan('\n=== Starting Self-Healing Process ==='));
        // Make a deep copy of section fields
        let currentSectionFields = this.cloneSectionFields(sectionFields);
        let lastDeviationCheckFields = [];
        let totalCorrections = 0;
        let totalRulesGenerated = 0;
        let iterations = 0;
        let maxAttemptsForSection = 2; // Try at most twice per section with major deviations
        let remainingAttempts = maxAttemptsForSection;
        let processedSections = new Set();
        // Track per-section corrections
        const sectionsProcessed = new Set();
        // Initialize the rule generator
        const rulesGenerator = new RulesGenerator();
        // First, identify significant deviations
        const initialDeviations = this.calculateDeviations(currentSectionFields, referenceCounts, deviationThreshold);
        console.log(`Found ${initialDeviations.length} sections with count deviations exceeding threshold.`);
        // Separate overpopulated and underpopulated sections
        const overPopulated = initialDeviations.filter(dev => dev.deviation > 0);
        const underPopulated = initialDeviations.filter(dev => dev.deviation < 0);
        console.log(`Sections with too many fields: ${overPopulated.length}`);
        console.log(`Sections with too few fields: ${underPopulated.length}`);
        // Prioritize sections with extreme deviations
        const majorDeviations = initialDeviations
            .filter(dev => Math.abs(dev.deviationPercent || 0) > 0.5) // More than 50% deviation
            .sort((a, b) => Math.abs(b.deviationPercent || 0) - Math.abs(a.deviationPercent || 0));
        if (majorDeviations.length > 0) {
            console.log(chalk.yellow(`Found ${majorDeviations.length} sections with major deviations (>50%):`));
            for (const dev of majorDeviations.slice(0, 3)) { // Show top 3
                console.log(chalk.yellow(`  Section ${dev.section}: ${dev.actual} vs expected ${dev.expected} (${dev.deviation > 0 ? '+' : ''}${dev.deviation})`));
            }
        }
        // Start with an iteration to process general field misplacements
        do {
            this.iteration++; // Increment the manager's iteration counter
            iterations++;
            console.log(chalk.cyan(`\n--- Iteration ${iterations} ---`));
            // Get the latest set of fields from all sections
            const allFields = Object.entries(currentSectionFields)
                .filter(([key]) => key !== '0')
                .flatMap(([_, fields]) => fields);
            // Check for deviations to target for correction
            const deviations = this.calculateDeviations(currentSectionFields, referenceCounts, deviationThreshold);
            const deviationsWithFields = this.populateDeviationFields(deviations, currentSectionFields);
            if (deviations.length === 0) {
                console.log(chalk.green('No significant count deviations found.'));
                break;
            }
            // Store fields for this deviation check
            lastDeviationCheckFields = [...allFields];
            // Sort sections by absolute deviation
            const sortedDeviations = [...deviationsWithFields]
                .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
            // Identify sections with deviations that exceed threshold
            const sectionsWithExcessiveDeviations = sortedDeviations
                .filter(d => Math.abs(d.deviationPercent || 0) > deviationThreshold)
                .filter(d => !processedSections.has(d.section) || remainingAttempts > 0);
            console.log(chalk.yellow(`Found ${sectionsWithExcessiveDeviations.length} sections with excessive deviations: ${sectionsWithExcessiveDeviations.join(', ')}`));
            // Process all sections with excessive deviations instead of just the first 2
            const sectionsToProcess = sectionsWithExcessiveDeviations;
            if (sectionsToProcess.length === 0) {
                console.log(chalk.green(`No sections with excessive deviations found.`));
                return {
                    success: true,
                    iterations: 0,
                    corrections: 0,
                    rulesGenerated: 0,
                    finalSectionFields: sectionFields,
                    deviations: []
                };
            }
            // Track which sections we've processed
            for (const section of sectionsToProcess) {
                if (!processedSections.has(section.section)) {
                    processedSections.add(section.section);
                }
                else {
                    remainingAttempts--;
                }
            }
            // Create a map of fields that need correction
            let correctionsBySection = {};
            // Identify candidate fields to move between sections
            for (const deviation of sectionsToProcess) {
                const sectionId = deviation.section;
                const sectionStr = sectionId.toString();
                if (deviation.deviation > 0) {
                    // This section has too many fields - identify candidates to move out
                    console.log(chalk.yellow(`Section ${sectionId} has ${deviation.deviation} too many fields (${deviation.actual} vs expected ${deviation.expected})`));
                    // Get candidate fields to move out based on confidence and patterns
                    const candidateFields = this.identifyCandidatesToMoveOut(sectionFields[sectionStr] || [], sectionId, underPopulated);
                    // Add to corrections map
                    if (candidateFields.length > 0) {
                        for (const candidate of candidateFields) {
                            const targetSection = candidate.toSection.toString();
                            if (!correctionsBySection[targetSection]) {
                                correctionsBySection[targetSection] = [];
                            }
                            correctionsBySection[targetSection].push(candidate);
                        }
                        console.log(chalk.yellow(`Found ${candidateFields.length} candidates to move out of section ${sectionId}`));
                    }
                }
                else if (deviation.deviation < 0) {
                    // This section has too few fields - identify candidates to move in
                    console.log(chalk.yellow(`Section ${sectionId} has ${Math.abs(deviation.deviation)} too few fields (${deviation.actual} vs expected ${deviation.expected})`));
                    // Check other sections for possible candidates to move to this section
                    const candidateFields = this.identifyCandidatesToMoveIn(allFields, sectionId, overPopulated);
                    // Add to corrections map
                    if (candidateFields.length > 0) {
                        if (!correctionsBySection[sectionStr]) {
                            correctionsBySection[sectionStr] = [];
                        }
                        correctionsBySection[sectionStr].push(...candidateFields);
                        console.log(chalk.yellow(`Found ${candidateFields.length} candidates to move into section ${sectionId}`));
                    }
                }
            }
            // Count total corrections for this iteration
            const totalCorrectionsCandidates = Object.values(correctionsBySection)
                .reduce((sum, candidates) => sum + candidates.length, 0);
            if (totalCorrectionsCandidates === 0) {
                console.log(`No corrections found. ${remainingAttempts > 0 ? 'Continuing to next iteration.' : 'Exiting self-healing loop.'}`);
                if (remainingAttempts <= 0)
                    break;
                continue;
            }
            console.log(`Making ${totalCorrectionsCandidates} field corrections in this iteration.`);
            // Group fields by target section for rule generation
            const fieldsByTargetSection = new Map();
            // Apply corrections to each section
            for (const [targetSectionStr, corrections] of Object.entries(correctionsBySection)) {
                const targetSection = parseInt(targetSectionStr, 10);
                const targetFields = [];
                // Apply each correction
                for (const correction of corrections) {
                    // Update field's section
                    const updatedField = {
                        ...correction.field,
                        section: targetSection
                    };
                    targetFields.push(updatedField);
                    totalCorrections++;
                }
                // Store for rule generation
                if (targetFields.length > 0) {
                    fieldsByTargetSection.set(targetSection, targetFields);
                }
            }
            // Generate rules from the corrections
            const ruleCandidates = new Map();
            let sectionRulesGenerated = 0;
            // Generate rule candidates for each target section
            for (const [section, fields] of fieldsByTargetSection.entries()) {
                // Skip if too few fields for a meaningful pattern
                if (fields.length < 3)
                    continue;
                console.log(`Generating rule candidates for section ${section} with ${fields.length} fields...`);
                // Create enhanced fields for rule generation
                const enhancedFields = fields.map(field => ({
                    id: field.id,
                    name: field.name,
                    value: field.value || '',
                    page: field.page,
                    label: field.label,
                    type: field.type,
                    maxLength: field.maxLength,
                    options: field.options,
                    section,
                    confidence: field.confidence
                }));
                // Generate rule candidates
                const sectionRules = await rulesGenerator.generateRuleCandidates(enhancedFields);
                // Add to the ruleCandidates map
                for (const [sectionStr, rules] of sectionRules.entries()) {
                    if (!ruleCandidates.has(sectionStr)) {
                        ruleCandidates.set(sectionStr, []);
                    }
                    const existingRules = ruleCandidates.get(sectionStr) || [];
                    const combinedRules = [...existingRules, ...rules];
                    ruleCandidates.set(sectionStr, combinedRules);
                    sectionRulesGenerated += rules.length;
                    console.log(`Generated ${rules.length} new rules for section ${sectionStr} (total: ${combinedRules.length})`);
                }
            }
            console.log(`Generated ${sectionRulesGenerated} rule candidates for ${ruleCandidates.size} sections.`);
            totalRulesGenerated += sectionRulesGenerated;
            if (ruleCandidates.size === 0) {
                console.log(chalk.yellow('No rule candidates were generated. Skipping rule update.'));
            }
            else {
                // Log rule candidates for debugging
                console.log('Rule candidates generated:');
                for (const [section, rules] of ruleCandidates.entries()) {
                    console.log(`  Section ${section}: ${rules.length} rules`);
                    // Log a sample rule if available
                    if (rules.length > 0) {
                        console.log(`    Sample rule pattern: ${rules[0].pattern}`);
                    }
                }
                // Update rules - this is a critical step
                try {
                    console.log('Updating rule files with new candidates...');
                    const updatedSections = await rulesGenerator.updateRuleFiles(ruleCandidates);
                    if (updatedSections.length > 0) {
                        console.log(chalk.green(`Successfully updated rules for ${updatedSections.length} sections: ${updatedSections.join(', ')}`));
                        // Explicitly reload rules to ensure they're available in this session
                        console.log('Reloading rules into the rule engine...');
                        await ruleEngine.loadRules();
                        console.log(chalk.green('Successfully reloaded rules into the rule engine.'));
                    }
                    else {
                        console.log(chalk.yellow('No rules were actually updated despite having candidates. This may indicate an issue with rule generation or file permissions.'));
                        // Continue with the iterations even if no rules were updated
                    }
                }
                catch (error) {
                    console.error('Error updating rules:', error);
                    console.log(chalk.yellow('Will continue with field corrections regardless of rule status.'));
                }
            }
            // Apply corrections directly to the fields, even if rules weren't updated
            console.log('Applying corrections to fields...');
            // Create a map of field ID to its new section
            const fieldCorrections = {};
            // Extract field corrections from the correctionsBySection
            for (const [sectionStr, corrections] of Object.entries(correctionsBySection)) {
                const targetSection = parseInt(sectionStr, 10);
                for (const correction of corrections) {
                    fieldCorrections[correction.field.id] = targetSection;
                }
            }
            // Apply the corrections to all fields
            const updatedFields = lastDeviationCheckFields.map(field => {
                // Check if this field has a correction
                if (fieldCorrections[field.id]) {
                    return {
                        ...field,
                        section: fieldCorrections[field.id]
                    };
                }
                return field;
            });
            // Regroup fields by section after applying corrections
            currentSectionFields = this.reorganizeFieldsBySections(updatedFields);
            // Stop if we've hit the maximum iterations or no more attempts remain
            if (iterations >= this.maxIterations || remainingAttempts <= 0) {
                console.log(chalk.yellow(`Reached ${remainingAttempts <= 0 ? 'maximum attempts per section' : 'maximum iterations'}. Stopping self-healing process.`));
                break;
            }
        } while (true);
        // Calculate final deviations
        const finalDeviations = this.calculateDeviations(currentSectionFields, referenceCounts, deviationThreshold);
        return {
            success: finalDeviations.length === 0,
            iterations,
            corrections: totalCorrections,
            rulesGenerated: totalRulesGenerated,
            finalSectionFields: currentSectionFields,
            deviations: finalDeviations
        };
    }
    /**
     * Special handler for extreme deviations (>300% of expected)
     * This applies more aggressive correction for sections with extremely high field counts
     */
    async handleExtremeDeviations(ruleEngine, sectionFields, extremeDeviations, underrepresentedSections) {
        console.log(chalk.cyan('Applying special handling for extreme deviations...'));
        for (const deviation of extremeDeviations) {
            const sectionId = deviation.section;
            const fields = sectionFields[sectionId.toString()] || [];
            if (fields.length === 0)
                continue;
            console.log(chalk.cyan(`Analyzing section ${sectionId} with ${fields.length} fields (expected ${deviation.expected})`));
            // Group fields by page to identify clusters
            const fieldsByPage = this.groupFieldsByPage(fields);
            console.log(chalk.cyan(`Found fields across ${Object.keys(fieldsByPage).length} different pages`));
            // Look for pages with unusually high field counts
            const averageFieldsPerPage = fields.length / Object.keys(fieldsByPage).length;
            const highDensityPages = Object.entries(fieldsByPage)
                .filter(([_, pageFields]) => pageFields.length > averageFieldsPerPage * 1.5)
                .sort(([_, a], [__, b]) => b.length - a.length);
            if (highDensityPages.length > 0) {
                console.log(chalk.cyan(`Found ${highDensityPages.length} pages with unusually high field counts:`));
                for (const [page, pageFields] of highDensityPages) {
                    console.log(chalk.cyan(`  Page ${page}: ${pageFields.length} fields`));
                    // Analyze these fields for common patterns
                    const patternGroups = this.groupFieldsByPatternsEnhanced(pageFields);
                    // Find larger groups that may be misplaced
                    const largeGroups = Object.entries(patternGroups)
                        .filter(([_, groupFields]) => groupFields.length > 5)
                        .sort(([_, a], [__, b]) => b.length - a.length);
                    if (largeGroups.length > 0) {
                        console.log(chalk.cyan(`  Found ${largeGroups.length} large pattern groups on page ${page}:`));
                        for (const [pattern, groupFields] of largeGroups) {
                            console.log(chalk.cyan(`    Pattern "${pattern}": ${groupFields.length} fields`));
                            // Try to find the best target section for this group
                            if (underrepresentedSections.length > 0) {
                                const bestTarget = this.findBestTargetSection(groupFields, underrepresentedSections);
                                if (bestTarget && bestTarget.confidence > 0.5) {
                                    console.log(chalk.green(`    Likely belongs to Section ${bestTarget.section} (confidence: ${(bestTarget.confidence * 100).toFixed(2)}%)`));
                                    // Create more specific rules for this group
                                    const enhancedFields = groupFields.map(field => ({
                                        id: field.id,
                                        name: field.name,
                                        value: field.value || '',
                                        page: field.page,
                                        label: field.label,
                                        type: field.type,
                                        maxLength: field.maxLength,
                                        options: field.options,
                                        section: bestTarget.section,
                                        subsection: field.subsection,
                                        entry: field.entry || 0,
                                        confidence: field.confidence
                                    }));
                                    // Generate rules for this specific group
                                    const ruleCandidates = await rulesGenerator.generateRuleCandidates(enhancedFields);
                                    if (ruleCandidates.has(bestTarget.section.toString())) {
                                        const rules = ruleCandidates.get(bestTarget.section.toString()) || [];
                                        if (rules.length > 0) {
                                            console.log(chalk.green(`    Generated ${rules.length} rules for this group`));
                                            // Update rules immediately
                                            const mapToUpdate = new Map();
                                            mapToUpdate.set(bestTarget.section.toString(), rules);
                                            await rulesGenerator.updateRuleFiles(mapToUpdate);
                                            // Reload rules to apply changes
                                            await ruleEngine.loadRules();
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // Look for field name sequences that may indicate form structure
            const sequenceGroups = this.identifyFieldSequences(fields);
            if (sequenceGroups.length > 0) {
                console.log(chalk.cyan(`Found ${sequenceGroups.length} potential field sequences in section ${sectionId}:`));
                for (const group of sequenceGroups) {
                    console.log(chalk.cyan(`  Sequence base: "${group.basePattern}" with ${group.fields.length} fields`));
                    // Check if this sequence might belong to an underrepresented section
                    if (underrepresentedSections.length > 0) {
                        const bestTarget = this.findBestTargetSection(group.fields, underrepresentedSections);
                        if (bestTarget && bestTarget.confidence > 0.45) {
                            console.log(chalk.green(`  Sequence likely belongs to Section ${bestTarget.section} (confidence: ${(bestTarget.confidence * 100).toFixed(2)}%)`));
                            // Create more specific rules for this sequence
                            const enhancedFields = group.fields.map(field => ({
                                id: field.id,
                                name: field.name,
                                value: field.value || '',
                                page: field.page,
                                label: field.label,
                                type: field.type,
                                maxLength: field.maxLength,
                                options: field.options,
                                section: bestTarget.section,
                                subsection: field.subsection,
                                entry: field.entry || 0,
                                confidence: field.confidence
                            }));
                            // Generate rules for this specific sequence
                            const ruleCandidates = await rulesGenerator.generateRuleCandidates(enhancedFields);
                            if (ruleCandidates.has(bestTarget.section.toString())) {
                                const rules = ruleCandidates.get(bestTarget.section.toString()) || [];
                                if (rules.length > 0) {
                                    console.log(chalk.green(`  Generated ${rules.length} rules for this sequence`));
                                    // Update rules immediately
                                    const mapToUpdate = new Map();
                                    mapToUpdate.set(bestTarget.section.toString(), rules);
                                    await rulesGenerator.updateRuleFiles(mapToUpdate);
                                    // Reload rules to apply changes
                                    await ruleEngine.loadRules();
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * Enhanced field pattern grouping that identifies more complex patterns
     * @param fields Fields to group
     * @returns Map of pattern to fields
     */
    groupFieldsByPatternsEnhanced(fields) {
        const patterns = {};
        // First pass - group by basic patterns
        for (const field of fields) {
            // Extract pattern from name (keep alphanumeric parts, replace numbers with '#')
            const basicPattern = field.name
                .replace(/\d+/g, '#')
                .replace(/\[\d+\]/g, '[#]')
                .replace(/\.#\./g, '.#.')
                .replace(/form#\[#\]/g, 'form#[#]');
            // Enhanced pattern - detect common form field structures
            let enhancedPattern = basicPattern;
            // Check for form structure patterns
            if (field.name.match(/form\[\d+\]\.section\d+_\d+/i)) {
                enhancedPattern = 'form[#].section#_#';
            }
            else if (field.name.match(/section\d+_[a-z]/i)) {
                enhancedPattern = 'section#_letter';
            }
            else if (field.name.match(/s\d+_[a-z]/i)) {
                enhancedPattern = 's#_letter';
            }
            else if (field.name.match(/\#field\[\d+\]/i)) {
                enhancedPattern = '#field[#]';
            }
            // Use page number as additional context for grouping if available
            if (field.page) {
                enhancedPattern = `page${field.page}_${enhancedPattern}`;
            }
            if (!patterns[enhancedPattern]) {
                patterns[enhancedPattern] = [];
            }
            patterns[enhancedPattern].push(field);
        }
        // Filter out single-field patterns
        return Object.fromEntries(Object.entries(patterns)
            .filter(([_, fields]) => fields.length > 1)
            .sort(([_, a], [__, b]) => b.length - a.length) // Sort by group size (largest first)
        );
    }
    /**
     * Advanced pattern matching that considers multiple factors
     * @param pattern Field pattern to match
     * @param fields Sample fields with this pattern
     * @param section Target section
     * @returns Object with confidence score (0-1) and reason
     */
    advancedPatternMatch(pattern, fields, section) {
        // Default implementation 
        return {
            confidence: 0.5,
            reason: 'Basic pattern match' // Ensure reason is always a string
        };
    }
    /**
     * Get keywords associated with a specific section
     * @param section Section number
     * @returns Array of keywords
     */
    getSectionKeywords(section) {
        const sectionKeywords = {
            1: ['name', 'fullname', 'lastname', 'firstname', 'middle', 'suffix'],
            2: ['birth', 'dob', 'date', 'born'],
            3: ['birthplace', 'placeofbirth', 'born', 'city', 'county', 'country'],
            4: ['ssn', 'social', 'security', 'number'],
            5: ['phone', 'telephone', 'email', 'contact', 'address'],
            6: ['physical', 'height', 'weight', 'hair', 'eye', 'sex', 'gender', 'color'],
            7: ['spouse', 'married', 'marriage', 'wife', 'husband', 'partner'],
            8: ['relative', 'family', 'father', 'mother', 'sibling', 'child', 'children'],
            9: ['citizenship', 'citizen', 'nationality', 'national', 'country'],
            10: ['dual', 'multiple', 'citizenship', 'passport'],
            13: ['financial', 'finance', 'money', 'bank', 'loan', 'account', 'credit'],
            15: ['investigation', 'clearance', 'background', 'security'],
            16: ['conflict', 'interest', 'financial', 'disclosure'],
            24: ['technology', 'computer', 'unauthorized', 'hack', 'system', 'access'],
            25: ['financial', 'distress', 'bankruptcy', 'tax', 'debt', 'lien', 'repossession'],
            29: ['security', 'violation', 'classified', 'unauthorized', 'disclosure'],
            30: ['signature', 'certification', 'certify', 'sign']
        };
        return section in sectionKeywords ? sectionKeywords[section] : [];
    }
    /**
     * Group fields by page number
     * @param fields Fields to group
     * @returns Map of page numbers to fields
     */
    groupFieldsByPage(fields) {
        const result = {};
        for (const field of fields) {
            if (!field.page)
                continue;
            if (!result[field.page]) {
                result[field.page] = [];
            }
            result[field.page].push(field);
        }
        return result;
    }
    /**
     * Identify fields that appear to be part of a repeating pattern/sequence
     * @param fields Fields to analyze
     * @returns Array of field groups
     */
    identifyFieldSequences(fields) {
        const result = [];
        // Group fields by common name patterns first
        const namePatterns = {};
        for (const field of fields) {
            // Extract numeric index pattern from field name
            const match = field.name.match(/^(.*?)(\d+)(.*)$/);
            if (match) {
                const [_, prefix, index, suffix] = match;
                const basePattern = `${prefix}#${suffix}`;
                if (!namePatterns[basePattern]) {
                    namePatterns[basePattern] = [];
                }
                namePatterns[basePattern].push(field);
            }
        }
        // Find sequences with multiple fields and consecutive indices
        for (const [pattern, patternFields] of Object.entries(namePatterns)) {
            if (patternFields.length < 5)
                continue; // Need at least 5 fields to consider it a sequence
            // Extract indices and sort
            const indices = [];
            for (const field of patternFields) {
                const match = field.name.match(/^(.*?)(\d+)(.*)$/);
                if (match) {
                    indices.push(parseInt(match[2], 10));
                }
            }
            indices.sort((a, b) => a - b);
            // Check if indices form a sequence
            let isSequence = true;
            let consecutiveCount = 0;
            for (let i = 1; i < indices.length; i++) {
                if (indices[i] === indices[i - 1] + 1) {
                    consecutiveCount++;
                }
                else if (indices[i] !== indices[i - 1]) {
                    // Allow some gaps
                    if (indices[i] - indices[i - 1] > 3) {
                        isSequence = false;
                        break;
                    }
                }
            }
            // If at least 60% of indices are consecutive, consider it a sequence
            if (isSequence && consecutiveCount >= Math.floor(indices.length * 0.6)) {
                result.push({
                    basePattern: pattern,
                    fields: patternFields
                });
            }
        }
        return result;
    }
    /**
     * Find the best target section for a group of fields
     * @param fields Group of fields to analyze
     * @param targetSections Possible target sections
     * @returns Best target section and confidence
     */
    findBestTargetSection(fields, targetSections) {
        let bestMatch = null;
        let highestConfidence = 0;
        for (const targetSection of targetSections) {
            const { confidence } = this.advancedPatternMatch(fields[0].name, // Use the first field's name as a representative pattern
            fields, targetSection.section);
            // Also consider how well this field count would fit the target section's deficit
            const countFitScore = Math.min(fields.length / Math.abs(targetSection.deviation), Math.abs(targetSection.deviation) / fields.length);
            // Combine pattern confidence with count fit score
            const combinedConfidence = (confidence * 0.7) + (countFitScore * 0.3);
            if (combinedConfidence > highestConfidence) {
                highestConfidence = combinedConfidence;
                bestMatch = {
                    section: targetSection.section,
                    confidence: combinedConfidence
                };
            }
        }
        return bestMatch;
    }
    /**
     * Deduplicate correction candidates to prevent double-correction of the same field
     * @param candidates Correction candidates
     * @returns Deduplicated corrections array
     */
    deduplicateCorrections(candidates) {
        const seen = new Set();
        const result = [];
        for (const candidate of candidates) {
            const key = candidate.field.id;
            if (!seen.has(key)) {
                seen.add(key);
                result.push(candidate);
            }
        }
        return result;
    }
    /**
     * Recategorize fields using the rule engine
     * @param ruleEngine Rule engine instance
     * @param fields Fields to recategorize
     * @returns Updated array of unknown fields
     */
    async recategorizeUnknownFields(ruleEngine, fields) {
        // Categorize each field
        const recategorized = await ruleEngine.categorizeFields(fields);
        // Return fields that are still uncategorized (section 0 or no section)
        return recategorized.filter(field => !field.section || field.section === 0);
    }
    /**
     * Clone the section fields object to avoid modifying the original
     * @param sectionFields Original section fields
     * @returns Cloned section fields
     */
    cloneSectionFields(sectionFields) {
        const clone = {};
        for (const [section, fields] of Object.entries(sectionFields)) {
            clone[section] = [...fields];
        }
        return clone;
    }
    /**
     * Calculate deviations between actual and expected field counts
     * @param sectionFields Current section fields
     * @param referenceCounts Expected field counts
     * @param threshold Minimum deviation percentage to consider
     * @returns Array of significant deviations
     */
    calculateDeviations(sectionFields, referenceCounts, threshold = 0.2) {
        const deviations = [];
        // Calculate deviations for each section
        for (const [sectionStr, countData] of Object.entries(referenceCounts)) {
            const section = parseInt(sectionStr);
            if (isNaN(section))
                continue;
            // Get expected count - support both simple number and complex object formats
            let expectedCount = 0;
            if (typeof countData === 'number') {
                expectedCount = countData;
            }
            else if (typeof countData === 'object' && countData !== null) {
                // Extract the 'fields' property if it exists
                if ('fields' in countData) {
                    expectedCount = countData.fields;
                }
            }
            // Skip if we couldn't determine expected count
            if (expectedCount <= 0)
                continue;
            const actualCount = (sectionFields[section.toString()] || []).length;
            const deviation = actualCount - expectedCount;
            const deviationPercentage = Math.abs(deviation) / expectedCount;
            // Only consider significant deviations
            if (deviationPercentage >= threshold) {
                deviations.push({
                    section,
                    actual: actualCount,
                    expected: expectedCount,
                    deviation,
                    deviationPercent: deviationPercentage
                });
            }
        }
        return deviations;
    }
    /**
     * Count total miscategorized fields based on deviations
     * @param deviations Section deviations
     * @returns Total number of miscategorized fields
     */
    countMiscategorizedFields(deviations) {
        return deviations.reduce((sum, dev) => sum + Math.abs(dev.deviation), 0);
    }
    /**
     * Populate deviation objects with the actual fields for analysis
     * @param deviations Section deviations
     * @param sectionFields Current section fields
     * @returns Updated deviations with fields populated
     */
    populateDeviationFields(deviations, sectionFields) {
        return deviations.map(dev => ({
            ...dev,
            fields: sectionFields[dev.section.toString()] || []
        }));
    }
    /**
     * Reorganize fields into sections based on their categorization
     * @param fields Categorized fields
     * @returns Fields organized by section
     */
    reorganizeFieldsBySections(fields) {
        const result = {};
        for (const field of fields) {
            const section = field.section.toString();
            if (!result[section]) {
                result[section] = [];
            }
            result[section].push(field);
        }
        return result;
    }
    /**
     * Group corrections by their target section
     * @param corrections Correction candidates
     * @returns Map of section to corrections
     */
    groupCorrectionsBySection(corrections) {
        const result = {};
        for (const correction of corrections) {
            const section = correction.toSection.toString();
            if (!result[section]) {
                result[section] = [];
            }
            result[section].push(correction);
        }
        return result;
    }
    /**
     * Run iterative self-healing until convergence or max iterations reached
     * @param ruleEngine Rule engine instance
     * @param fields Array of categorized fields to process
     * @param keepUnknown Whether to keep unknown field history
     * @param referenceCounts Optional reference counts for validation
     * @param outputDir Optional output directory for saving history files
     * @returns Result of self-healing process
     */
    async runIterativeSelfHealing(ruleEngine, fields, keepUnknown = false, referenceCounts, outputDir) {
        // Reset iteration counter
        this.iteration = 0;
        // Organize fields by section
        let currentSectionFields = this.reorganizeFieldsBySections(fields);
        let remainingUnknown = currentSectionFields['0'] || [];
        let initialUnknownCount = remainingUnknown.length;
        // Track subsection and entry rules generated
        let subsectionRulesGenerated = 0;
        let entryRulesGenerated = 0;
        // Check if there are any unknown fields to process
        if (initialUnknownCount === 0) {
            console.log(chalk.green('No unknown fields to process.'));
            return {
                success: true,
                iterations: 0,
                remainingUnknown: [],
                finalSectionFields: currentSectionFields
            };
        }
        console.log(chalk.cyan(`Starting self-healing process with ${initialUnknownCount} unknown fields...`));
        // Keep track of unknown fields between iterations if requested
        if (keepUnknown) {
            const unknownDir = outputDir
                ? path.resolve(process.cwd(), outputDir, 'unknown-history')
                : path.resolve(process.cwd(), 'scripts/unknown-history');
            if (!fs.existsSync(unknownDir)) {
                fs.mkdirSync(unknownDir, { recursive: true });
            }
            // Save initial unknown fields
            fs.writeFileSync(path.join(unknownDir, 'unknown-initial.json'), JSON.stringify(remainingUnknown, null, 2));
        }
        let totalImprovedFields = 0;
        this.previousUnknownCount = initialUnknownCount;
        // Iterative process
        while (this.iteration < this.maxIterations) {
            this.iteration++;
            console.log(chalk.cyan(`\nIteration ${this.iteration}: Processing ${remainingUnknown.length} unknown fields...`));
            // Process unknown fields to generate rules
            const processResult = await this.processUnknownFields(ruleEngine, remainingUnknown);
            // Re-categorize all fields
            const allFields = Object.entries(currentSectionFields)
                .filter(([key]) => key !== '0')
                .flatMap(([_, fields]) => fields);
            // Add the remaining unknown fields after processing
            const allFieldsWithProcessed = [...allFields, ...processResult.remainingUnknown];
            // Get new section fields - reorganize them internally
            const updatedFields = this.reorganizeFieldsBySections(allFieldsWithProcessed);
            currentSectionFields = updatedFields;
            // Generate subsection rules for all sections with sufficient data
            const subsectionRules = this.generateSubsectionRulesForAllSections(currentSectionFields);
            // Only add new rules if we found some
            if (subsectionRules.length > 0) {
                console.log(chalk.blue(`Generated ${subsectionRules.length} subsection and entry rules`));
                // Count types of rules generated
                const subCount = subsectionRules.filter(r => !r.entryIndex).length;
                const entryCount = subsectionRules.filter(r => r.entryIndex).length;
                subsectionRulesGenerated += subCount;
                entryRulesGenerated += entryCount;
                console.log(chalk.blue(`Added ${subCount} subsection rules and ${entryCount} entry rules`));
                // Add the rules to the rule engine
                for (const rule of subsectionRules) {
                    // Find which section this rule belongs to
                    let sectionId = 0;
                    for (const [sectionStr, sectionFields] of Object.entries(currentSectionFields)) {
                        if (sectionStr === '0')
                            continue;
                        const section = parseInt(sectionStr, 10);
                        if (isNaN(section))
                            continue;
                        // Check if this rule matches any fields in this section
                        const matchesSection = sectionFields.some(field => rule.pattern instanceof RegExp && rule.pattern.test(field.name));
                        if (matchesSection) {
                            sectionId = section;
                            break;
                        }
                    }
                    if (sectionId > 0) {
                        // Convert MatchRule to CategoryRule
                        const categoryRule = {
                            section: sectionId,
                            subsection: rule.subsection,
                            pattern: rule.pattern,
                            confidence: rule.confidence || 0.8,
                            description: rule.description
                        };
                        ruleEngine.addRulesForSection(sectionId, [categoryRule]);
                    }
                }
                // Re-apply categorization to improve subsection and entry classification
                const beforeSubCatCount = this.countFieldsWithoutSubsectionOrEntry(currentSectionFields);
                // Apply the new rules to re-categorize the fields
                for (const [sectionStr, sectionFields] of Object.entries(currentSectionFields)) {
                    if (sectionStr === '0')
                        continue; // Skip unknown fields
                    const sectionId = parseInt(sectionStr, 10);
                    if (isNaN(sectionId))
                        continue;
                    try {
                        // Recategorize all fields in this section by sending them through the engine again
                        const recategorizedFields = await ruleEngine.categorizeFields(sectionFields);
                        // Update the section fields with type safety - only if we got results back
                        if (recategorizedFields && recategorizedFields.length > 0) {
                            currentSectionFields[sectionStr] = recategorizedFields;
                        }
                    }
                    catch (error) {
                        console.warn(`Error recategorizing fields for section ${sectionStr}:`, error);
                    }
                }
                // Check if we've improved subsection/entry categorization
                const afterSubCatCount = this.countFieldsWithoutSubsectionOrEntry(currentSectionFields);
                const subsectionImprovement = beforeSubCatCount - afterSubCatCount;
                if (subsectionImprovement > 0) {
                    console.log(chalk.green(`Improved subsection/entry categorization for ${subsectionImprovement} fields`));
                }
            }
            // Update unknown fields
            remainingUnknown = currentSectionFields['0'] || [];
            // Save current state if requested
            if (keepUnknown && remainingUnknown.length > 0) {
                const unknownDir = outputDir
                    ? path.resolve(process.cwd(), outputDir, 'unknown-history')
                    : path.resolve(process.cwd(), 'scripts/unknown-history');
                const iterationFilePath = path.join(unknownDir, `unknown-iteration-${this.iteration}.json`);
                fs.writeFileSync(iterationFilePath, JSON.stringify(remainingUnknown, null, 2));
            }
            // Check if we've improved
            if (remainingUnknown.length >= this.previousUnknownCount) {
                console.log(chalk.yellow('No improvement in classification, stopping iterations.'));
                break;
            }
            // Calculate improvement
            const improvedFields = this.previousUnknownCount - remainingUnknown.length;
            totalImprovedFields += improvedFields;
            this.previousUnknownCount = remainingUnknown.length;
            console.log(chalk.green(`Iteration ${this.iteration}: Categorized ${improvedFields} fields.`));
            console.log(chalk.green(`Remaining unknown: ${remainingUnknown.length} / ${initialUnknownCount}`));
            // Break if all fields are categorized
            if (remainingUnknown.length === 0) {
                console.log(chalk.green('All fields successfully categorized.'));
                break;
            }
            // If reference counts are provided, also try to correct miscategorized fields
            if (referenceCounts && Object.keys(referenceCounts).length > 0) {
                console.log(chalk.cyan('Checking for miscategorized fields based on reference counts...'));
                // Convert complex reference counts to simple number format if needed
                const simplifiedCounts = {};
                for (const [sectionStr, countData] of Object.entries(referenceCounts)) {
                    const section = parseInt(sectionStr, 10);
                    if (isNaN(section))
                        continue;
                    // Support both simple number and complex object formats
                    if (typeof countData === 'number') {
                        simplifiedCounts[section] = countData;
                    }
                    else if (typeof countData === 'object' && countData !== null) {
                        // Extract the 'fields' property if it exists
                        if ('fields' in countData) {
                            simplifiedCounts[section] = countData.fields;
                        }
                    }
                }
                const correctionResult = await this.correctMiscategorizedFields(ruleEngine, currentSectionFields, simplifiedCounts);
                if (correctionResult.corrections > 0) {
                    console.log(chalk.green(`Corrected ${correctionResult.corrections} miscategorized fields.`));
                    currentSectionFields = correctionResult.finalSectionFields;
                }
            }
        }
        console.log(chalk.green(`Self-healing process complete after ${this.iteration} iterations.`));
        console.log(chalk.green(`Improved classification for ${totalImprovedFields} fields (${(totalImprovedFields / initialUnknownCount * 100).toFixed(2)}%).`));
        console.log(chalk.green(`Generated ${subsectionRulesGenerated} subsection rules and ${entryRulesGenerated} entry rules.`));
        return {
            success: remainingUnknown.length === 0,
            iterations: this.iteration,
            remainingUnknown,
            finalSectionFields: currentSectionFields,
            subsectionRulesGenerated,
            entryRulesGenerated
        };
    }
    /**
     * Count fields that don't have subsection or entry values
     * @param sectionFields Sections and their fields
     * @returns Count of fields missing subsection or entry classification
     */
    countFieldsWithoutSubsectionOrEntry(sectionFields) {
        let count = 0;
        for (const [sectionStr, fields] of Object.entries(sectionFields)) {
            if (sectionStr === '0')
                continue; // Skip unknown fields
            const sectionId = parseInt(sectionStr, 10);
            if (isNaN(sectionId))
                continue;
            // For sections 1-8, only count missing entry values
            if (sectionId <= 8) {
                count += fields.filter(f => !f.entry).length;
            }
            else {
                // For other sections, count fields missing either subsection or entry
                count += fields.filter(f => !f.subsection || !f.entry).length;
            }
        }
        return count;
    }
    /**
     * Identify repeating field groups within a large section
     * @param fields Fields to analyze for repeating patterns
     * @returns Array of field groups with patterns
     */
    identifyRepeatingFieldGroups(fields) {
        // Group fields by patterns using enhanced pattern detection
        const patternGroups = this.groupFieldsByPatternsEnhanced(fields);
        // Convert to array format expected by the caller
        return Object.entries(patternGroups)
            .filter(([_, groupFields]) => groupFields.length >= 5) // Only include groups with at least 5 fields
            .map(([pattern, groupFields]) => ({
            pattern,
            fields: groupFields
        }));
    }
    /**
     * Re-apply field grouping by section after rule changes
     */
    async regroupFieldsBySections(fields) {
        try {
            // Import the groupFieldsBySection function from the new consolidated utility
            const { groupFieldsBySection } = await import('./fieldGrouping.js');
            // Call the function with the fields array, ensuring we get a record back
            const result = await groupFieldsBySection(fields, {
                saveUnknown: false,
                returnType: 'record'
            });
            // We know this will be a Record due to our returnType setting
            return result;
        }
        catch (error) {
            console.error('Error regrouping fields:', error);
            // Fallback implementation if import fails
            const sectionFields = {};
            // Initialize section arrays with empty arrays
            for (let i = 0; i <= 30; i++) {
                sectionFields[i.toString()] = [];
            }
            // Populate section arrays
            fields.forEach(field => {
                const sectionKey = field.section.toString();
                if (!sectionFields[sectionKey]) {
                    sectionFields[sectionKey] = [];
                }
                sectionFields[sectionKey].push(field);
            });
            return sectionFields;
        }
    }
    /**
     * Get all fields from section objects
     * @param sectionFields Object mapping section IDs to field arrays
     * @returns Combined array of all fields
     */
    getAllFieldsFromSections(sectionFields) {
        return Object.values(sectionFields).flat();
    }
    /**
     * Identify sections with significant deviations from expected counts
     * @param fields All fields to analyze
     * @param referenceCounts Expected counts by section
     * @param deviationThreshold Threshold to consider a deviation significant (0.2 = 20%)
     * @returns Array of section deviations
     */
    identifySectionDeviations(fields, referenceCounts, deviationThreshold) {
        // Count fields by section
        const sectionCounts = {};
        // Initialize with zeros
        for (let i = 1; i <= 30; i++) {
            sectionCounts[i] = 0;
        }
        // Count actual fields
        fields.forEach(field => {
            if (field.section >= 1 && field.section <= 30) {
                sectionCounts[field.section] = (sectionCounts[field.section] || 0) + 1;
            }
        });
        // Calculate deviations
        const deviations = [];
        for (const [sectionStr, expectedCount] of Object.entries(referenceCounts)) {
            const section = parseInt(sectionStr);
            if (isNaN(section) || section < 1 || section > 30)
                continue;
            const actualCount = sectionCounts[section] || 0;
            const deviation = actualCount - expectedCount;
            const deviationPercent = expectedCount > 0
                ? Math.abs(deviation) / expectedCount
                : 0;
            // Only include significant deviations
            if (deviationPercent >= deviationThreshold) {
                deviations.push({
                    section,
                    expected: expectedCount,
                    actual: actualCount,
                    deviation,
                    deviationPercent
                });
            }
        }
        return deviations;
    }
    /**
     * Enhanced pattern matching for field names
     * @param pattern Field pattern to analyze
     * @param fields Fields to consider
     * @param section Target section
     * @returns Match confidence and reason
     */
    enhancedPatternMatch(pattern, fields, section) {
        // Default implementation 
        return {
            confidence: 0.5,
            reason: 'Basic pattern match' // Ensure reason is always a string
        };
    }
    /**
     * Match fields to potential sections by content
     * @param fields Fields to analyze
     * @param deviations Section deviations to consider
     * @returns Array of content-based assignments
     */
    matchFieldsByContent(fields, deviations) {
        // Basic implementation - return empty array
        return [];
    }
    /**
     * Apply content-based corrections to fields
     * @param fields Original fields
     * @param corrections Content-based corrections to apply
     * @returns Updated fields with corrections applied
     */
    applyContentBasedCorrections(fields, corrections) {
        if (corrections.length === 0)
            return fields;
        // Create a map of field IDs to new section assignments
        const correctionMap = new Map();
        corrections.forEach(c => correctionMap.set(c.field.id, c.toSection));
        // Apply corrections
        return fields.map(field => {
            if (correctionMap.has(field.id)) {
                return {
                    ...field,
                    section: correctionMap.get(field.id),
                    confidence: 0.9 // High confidence for corrected fields
                };
            }
            return field;
        });
    }
    /**
     * Identify candidate fields to move out of a section based on confidence and patterns
     * @param sectionFields Fields in the source section
     * @param sourceSection Source section ID
     * @param targetSections Possible target sections
     * @returns Array of candidate corrections
     */
    identifyCandidatesToMoveOut(sectionFields, sourceSection, targetSections) {
        // Skip if no fields
        if (!sectionFields || sectionFields.length === 0) {
            return [];
        }
        // Calculate how many fields should be considered for moving
        const maxFieldsToMove = Math.min(Math.ceil(sectionFields.length * 0.2), // Don't move more than 20% of fields
        20 // Cap at 20 fields per operation
        );
        if (maxFieldsToMove <= 0)
            return [];
        console.log(`Looking for up to ${maxFieldsToMove} fields to move out of section ${sourceSection}`);
        // Only consider target sections that have negative deviations (need more fields)
        const validTargetSections = targetSections.filter(section => section.deviation < 0);
        if (validTargetSections.length === 0) {
            console.log(`No valid target sections found with negative deviations for section ${sourceSection}`);
            return [];
        }
        // Find the fields that are least likely to belong to this section
        const candidates = sectionFields
            .map(field => {
            // For testing purposes, let's use a simple pattern matching approach
            // Examine if field name contains any hints about belonging to a different section
            for (const targetSection of validTargetSections) {
                const targetSectionStr = targetSection.section.toString();
                // Check for explicit section references in field name
                const containsSectionRef = new RegExp(`section${targetSectionStr}|s${targetSectionStr}_`, 'i').test(field.name);
                if (containsSectionRef) {
                    return {
                        field,
                        confidence: 0.85,
                        fromSection: sourceSection,
                        toSection: targetSection.section,
                        pattern: field.name.replace(/\d+/g, '#')
                    };
                }
                // Check if field is on a page typically associated with the target section
                if (field.page) {
                    // Simple mapping of page ranges to sections (this is just an example and should be enhanced)
                    const typicalPageRanges = {
                        16: [25, 30], // Section 16 is typically on pages 25-30
                        9: [15, 20], // Section 9 is typically on pages 15-20
                        27: [40, 45] // Section 27 is typically on pages 40-45
                    };
                    if (targetSection.section in typicalPageRanges) {
                        const [minPage, maxPage] = typicalPageRanges[targetSection.section];
                        if (field.page >= minPage && field.page <= maxPage) {
                            return {
                                field,
                                confidence: 0.75,
                                fromSection: sourceSection,
                                toSection: targetSection.section,
                                pattern: `page${field.page}_pattern`
                            };
                        }
                    }
                }
            }
            return null;
        })
            .filter((item) => item !== null)
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, maxFieldsToMove);
        console.log(`Found ${candidates.length} candidate fields to move out of section ${sourceSection}`);
        return candidates;
    }
    /**
     * Identify candidate fields to move into a section based on confidence and patterns
     * @param allFields All fields from all sections
     * @param targetSection Target section ID
     * @param sourceSections Possible source sections
     * @returns Array of candidate corrections
     */
    identifyCandidatesToMoveIn(allFields, targetSection, sourceSections) {
        // Skip if no fields
        if (!allFields || allFields.length === 0) {
            return [];
        }
        console.log(`Looking for fields to move into section ${targetSection}`);
        // Only consider fields from sections with too many fields
        const validSourceSections = sourceSections.filter(section => section.deviation > 0);
        if (validSourceSections.length === 0) {
            console.log(`No valid source sections found with positive deviations for section ${targetSection}`);
            return [];
        }
        // Only consider fields from sections with too many fields
        const candidateFields = allFields.filter(field => {
            const fromSection = field.section;
            return validSourceSections.some(section => section.section === fromSection);
        });
        if (candidateFields.length === 0) {
            console.log(`No candidate fields found from source sections for section ${targetSection}`);
            return [];
        }
        console.log(`Found ${candidateFields.length} potential candidate fields from source sections`);
        // Find fields that might belong better in the target section
        const candidates = candidateFields
            .map(field => {
            // Check for explicit references to target section in field name
            const targetSectionStr = targetSection.toString();
            const containsTargetSectionRef = new RegExp(`section${targetSectionStr}|s${targetSectionStr}_`, 'i').test(field.name);
            if (containsTargetSectionRef) {
                return {
                    field,
                    confidence: 0.85,
                    fromSection: field.section,
                    toSection: targetSection,
                    pattern: field.name.replace(/\d+/g, '#')
                };
            }
            // Check if field is on a page typically associated with the target section
            if (field.page) {
                // Simple mapping of page ranges to sections
                const typicalPageRanges = {
                    16: [25, 30], // Section 16 is typically on pages 25-30
                    9: [15, 20], // Section 9 is typically on pages 15-20
                    27: [40, 45], // Section 27 is typically on pages 40-45
                    29: [50, 55] // Section 29 is typically on pages 50-55
                };
                if (targetSection in typicalPageRanges) {
                    const [minPage, maxPage] = typicalPageRanges[targetSection];
                    if (field.page >= minPage && field.page <= maxPage) {
                        return {
                            field,
                            confidence: 0.75,
                            fromSection: field.section,
                            toSection: targetSection,
                            pattern: `page${field.page}_pattern`
                        };
                    }
                }
            }
            // Check for field labels that might indicate it belongs to target section
            const sectionKeywords = this.getSectionKeywords(targetSection);
            if (sectionKeywords.length > 0 && field.label) {
                for (const keyword of sectionKeywords) {
                    if (field.label.toLowerCase().includes(keyword.toLowerCase())) {
                        return {
                            field,
                            confidence: 0.8,
                            fromSection: field.section,
                            toSection: targetSection,
                            pattern: `label_${keyword}`
                        };
                    }
                }
            }
            return null;
        })
            .filter((item) => item !== null)
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 15); // Limit to 15 candidates per section
        console.log(`Found ${candidates.length} candidate fields to move into section ${targetSection}`);
        return this.deduplicateCorrections(candidates);
    }
    /**
     * Analyze fields and generate subsection/entry rules for all sections
     * @param sectionFields Fields grouped by section
     * @returns Array of rule candidates
     */
    generateSubsectionRulesForAllSections(sectionFields) {
        const allRules = [];
        // Process each section
        Object.entries(sectionFields).forEach(([sectionIdStr, fields]) => {
            const sectionId = parseInt(sectionIdStr, 10);
            if (isNaN(sectionId) || sectionId === 0)
                return;
            // Skip sections with very few fields
            if (fields.length < 5)
                return;
            // Generate rules for this section
            const sectionRules = this.generateSubsectionRules(fields, sectionId);
            if (sectionRules.length > 0) {
                allRules.push(...sectionRules);
            }
        });
        return allRules;
    }
    /**
     * Generate entry rules for all sections
     * @param sectionFields Fields grouped by section
     * @returns Array of rules for entry categorization
     */
    generateEntryRulesForAllSections(sectionFields) {
        const allRules = [];
        // Process each section
        Object.entries(sectionFields).forEach(([sectionIdStr, fields]) => {
            const sectionId = parseInt(sectionIdStr, 10);
            if (isNaN(sectionId) || sectionId === 0)
                return;
            // Skip sections with very few fields
            if (fields.length < 5)
                return;
            // Skip sections 1-8 as they typically don't have entries
            if (sectionId <= 8)
                return;
            // Group fields by subsection
            const fieldsBySubsection = {};
            fields.forEach(field => {
                const subsection = field.subsection || 'base';
                if (!fieldsBySubsection[subsection]) {
                    fieldsBySubsection[subsection] = [];
                }
                fieldsBySubsection[subsection].push(field);
            });
            // Process each subsection
            Object.entries(fieldsBySubsection).forEach(([subsection, subsectionFields]) => {
                // Find fields with entries
                const fieldsWithEntries = subsectionFields.filter(field => field.entry && field.entry > 0);
                if (fieldsWithEntries.length >= 3) { // Need at least 3 fields with entries to establish a pattern
                    // Get unique entry numbers
                    const entryNumbers = Array.from(new Set(fieldsWithEntries.map(field => field.entry))).filter(entry => entry !== undefined);
                    if (entryNumbers.length >= 2) { // Need at least 2 entries to generate meaningful rules
                        // Generate entry rules for this subsection
                        const entryRules = this.generateEntryRules(subsectionFields, sectionId, subsection === 'base' ? '' : subsection, entryNumbers);
                        if (entryRules.length > 0) {
                            allRules.push(...entryRules);
                        }
                    }
                }
            });
            // Generate base entry rules for sections that have entries but not subsections
            if (fields.some(field => field.entry && field.entry > 0 && !field.subsection)) {
                const baseEntryRules = this.generateEntryRulesForBaseSection(fields, sectionId);
                if (baseEntryRules.length > 0) {
                    allRules.push(...baseEntryRules);
                }
            }
        });
        return allRules;
    }
    /**
     * Analyze fields within a section to generate subsection and entry categorization rules
     * @param sectionFields Fields from a specific section
     * @param sectionId Section number
     * @returns Array of subsection rules
     */
    generateSubsectionRules(sectionFields, sectionId) {
        // Skip subsection rule generation for sections 1-8 as they don't have subsections
        if (sectionId <= 8) {
            return this.generateEntryRulesForBaseSection(sectionFields, sectionId);
        }
        const rules = [];
        // Group fields by subsection
        const subsectionGroups = {};
        sectionFields.forEach(field => {
            const sub = field.subsection || 'unknown';
            if (!subsectionGroups[sub]) {
                subsectionGroups[sub] = [];
            }
            subsectionGroups[sub].push(field);
        });
        // Skip if no fields have subsections
        if (Object.keys(subsectionGroups).length <= 1 && subsectionGroups['unknown']) {
            console.log(`Section ${sectionId} has no subsection information in field data, attempting pattern detection`);
            // Try to detect subsection patterns from field names
            const detectedPatterns = this.detectSubsectionPatternsFromNames(sectionFields, sectionId);
            if (detectedPatterns.size > 0) {
                console.log(`Detected ${detectedPatterns.size} potential subsections from field name patterns`);
                // Add rules for each detected subsection
                for (const [subsection, pattern] of detectedPatterns.entries()) {
                    rules.push({
                        pattern: new RegExp(pattern, 'i'),
                        section: sectionId,
                        subsection: subsection,
                        confidence: 0.85,
                        description: `Detected pattern for subsection ${subsection} in section ${sectionId}`
                    });
                }
            }
            return rules;
        }
        console.log(`Section ${sectionId} has ${Object.keys(subsectionGroups).length} subsections: ${Object.keys(subsectionGroups).filter(s => s !== 'unknown').join(', ')}`);
        // Process each subsection to extract patterns
        for (const [subsection, fields] of Object.entries(subsectionGroups)) {
            if (subsection === 'unknown')
                continue;
            // Group by entry for further analysis
            const entriesMap = {};
            fields.forEach(field => {
                const entry = field.entry || 0;
                if (!entriesMap[entry]) {
                    entriesMap[entry] = [];
                }
                entriesMap[entry].push(field);
            });
            // Collect common patterns
            const patternSet = new Set();
            // Analyze field names to identify patterns
            fields.forEach(field => {
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
                // Form pattern: form1[0].Section21D[0]
                const formPattern = `form1\\[\\d+\\]\\.section${sectionId}[-_]?${subsection.toLowerCase()}`;
                if (fieldName.match(new RegExp(formPattern, 'i'))) {
                    patternSet.add(formPattern);
                }
                // Additional common patterns
                const commonPatterns = [
                    `s${sectionId}${subsection.toLowerCase()}`,
                    `s${sectionId}_${subsection.toLowerCase()}`
                ];
                for (const pattern of commonPatterns) {
                    if (fieldName.includes(pattern)) {
                        patternSet.add(pattern);
                    }
                }
            });
            // Generate entry-specific rules if we have multiple entries
            const entries = Object.keys(entriesMap).map(Number).filter(e => e > 0).sort();
            if (entries.length > 0) {
                console.log(`Subsection ${subsection} has entries: ${entries.join(', ')}`);
                // Generate entry patterns
                entries.forEach(entry => {
                    // Common entry pattern formats
                    const entryPatterns = [
                        `section${sectionId}${subsection.toLowerCase()}${entry}`, // section21d1
                        `section${sectionId}_${subsection.toLowerCase()}_${entry}`, // section21_d_1
                        `section${sectionId}\\.${subsection.toLowerCase()}\\.${entry}`, // section21.d.1
                        `form1\\[\\d+\\]\\.section${sectionId}[-_]?${subsection.toLowerCase()}[-_]?${entry}`, // form1[0].Section21D_1[0]
                    ];
                    // Add entry patterns
                    entryPatterns.forEach(patternStr => {
                        rules.push({
                            pattern: new RegExp(patternStr, 'i'),
                            section: sectionId,
                            subsection: subsection,
                            confidence: 0.92,
                            description: `Entry ${entry} pattern for subsection ${subsection} in section ${sectionId}`,
                            entryIndex: (m) => entry
                        });
                    });
                });
            }
            // Add subsection patterns
            patternSet.forEach(patternStr => {
                rules.push({
                    pattern: new RegExp(patternStr, 'i'),
                    section: sectionId,
                    subsection: subsection,
                    confidence: 0.9,
                    description: `Subsection ${subsection} pattern for section ${sectionId}`
                });
            });
            // If no specific patterns found, add a generic pattern
            if (patternSet.size === 0) {
                const genericPattern = `section[-_]?${sectionId}.*?[^a-z]${subsection.toLowerCase()}[^a-z0-9]`;
                rules.push({
                    pattern: new RegExp(genericPattern, 'i'),
                    section: sectionId,
                    subsection: subsection,
                    confidence: 0.75,
                    description: `Generic pattern for subsection ${subsection} in section ${sectionId}`
                });
            }
        }
        // Add special case handlers for complex sections
        this.addSpecialCaseSectionRules(rules, sectionId);
        return rules;
    }
    /**
     * Detect subsection patterns from field names when no explicit subsection info is available
     * @param fields Fields to analyze
     * @param sectionId Section ID
     * @returns Map of detected subsections to patterns
     */
    detectSubsectionPatternsFromNames(fields, sectionId) {
        const subsectionPatterns = new Map();
        // Common subsection pattern formats
        const patternFormats = [
            { regex: new RegExp(`section${sectionId}([a-z])`, 'i'), group: 1 },
            { regex: new RegExp(`section${sectionId}_([a-z])`, 'i'), group: 1 },
            { regex: new RegExp(`section${sectionId}\\.([a-z])`, 'i'), group: 1 },
            { regex: new RegExp(`s${sectionId}_([a-z])`, 'i'), group: 1 }
        ];
        // Check each field for subsection indicators
        for (const field of fields) {
            for (const { regex, group } of patternFormats) {
                const match = field.name.match(regex);
                if (match && match[group]) {
                    const subsection = match[group].toLowerCase();
                    const pattern = match[0];
                    if (!subsectionPatterns.has(subsection)) {
                        subsectionPatterns.set(subsection, pattern);
                    }
                }
            }
        }
        return subsectionPatterns;
    }
    /**
     * Get special rules for specific sections based on known structures
     * @param sectionId Section number
     * @returns Array of special rules
     */
    getSpecialSectionRules(sectionId) {
        const specialRules = [];
        // Section-specific rule definitions
        switch (sectionId) {
            case 17: // Marital Status
                [
                    { sub: "1", pattern: "Section17_1", desc: "Current marriage" },
                    { sub: "2", pattern: "Section17_2", desc: "Former spouse" },
                    { sub: "3", pattern: "Section17_3", desc: "Cohabitants" }
                ].forEach(({ sub, pattern, desc }) => {
                    specialRules.push({
                        pattern: new RegExp(pattern, 'i'),
                        section: 17, // Set section explicitly 
                        subsection: sub,
                        confidence: 0.9,
                        description: `${desc} subsection in Section 17`
                    });
                });
                break;
            case 21: // Mental Health
                [
                    { sub: "a", pattern: "section21a", desc: "Mental health treatment" },
                    { sub: "c", pattern: "section21c", desc: "Mental health disorders" },
                    { sub: "d", pattern: "section21d", desc: "Mental health hospitalizations" },
                    { sub: "e", pattern: "section21e", desc: "Mental health conditions not covered" }
                ].forEach(({ sub, pattern, desc }) => {
                    specialRules.push({
                        pattern: new RegExp(pattern, 'i'),
                        section: 21,
                        subsection: sub,
                        confidence: 0.92,
                        description: `${desc} subsection in Section 21`
                    });
                });
                break;
            case 20: // Foreign Activities
                [
                    { sub: "a", pattern: "section20a", desc: "Foreign contacts" },
                    { sub: "b", pattern: "section20b", desc: "Foreign business" },
                    { sub: "c", pattern: "section20c", desc: "Foreign travel" }
                ].forEach(({ sub, pattern, desc }) => {
                    specialRules.push({
                        pattern: new RegExp(pattern, 'i'),
                        section: 20,
                        subsection: sub,
                        confidence: 0.92,
                        description: `${desc} subsection in Section 20`
                    });
                });
                break;
        }
        return specialRules;
    }
    /**
     * Generate rules for specific entries within a subsection
     * @param fields Fields from a subsection
     * @param sectionId Section number
     * @param subsection Subsection identifier
     * @param entries Array of entry numbers
     * @returns Array of entry-specific rules
     */
    generateEntryRules(fields, sectionId, subsection, entries) {
        const rules = [];
        // Group fields by entry
        const fieldsByEntry = {};
        for (const entry of entries) {
            fieldsByEntry[entry] = fields.filter(f => f.entry === entry);
        }
        // Generate rules for each entry
        for (const entry of entries) {
            const entryFields = fieldsByEntry[entry];
            if (entryFields.length < 2)
                continue; // Skip if too few fields
            // Common entry pattern formats - make sure to escape special regex characters
            const entryPatterns = [
                `section${sectionId}${subsection.toLowerCase()}${entry}`.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), // section21d1
                `section${sectionId}_${subsection.toLowerCase()}_${entry}`.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), // section21_d_1
                `section${sectionId}\\.${subsection.toLowerCase()}\\.${entry}`, // section21.d.1 (already escaped)
                `form1\\[\\d+\\]\\.section${sectionId}[-_]?${subsection.toLowerCase()}[-_]?${entry}` // form1[0].Section21D_1[0] (already escaped)
            ];
            // Add entry patterns
            for (const patternStr of entryPatterns) {
                try {
                    // Validate the pattern is a valid regex before adding it
                    new RegExp(patternStr, 'i');
                    rules.push({
                        pattern: new RegExp(patternStr, 'i'),
                        section: sectionId,
                        subsection: subsection,
                        confidence: 0.92,
                        description: `Entry ${entry} pattern for subsection ${subsection} in section ${sectionId}`,
                        entryIndex: (m) => entry
                    });
                }
                catch (error) {
                    console.warn(`Invalid entry pattern regex: ${patternStr}`);
                    // Skip this pattern
                }
            }
            // Look for specific patterns in this entry's fields
            const uniquePatterns = this.findUniqueEntryPatterns(entryFields, entry);
            for (const pattern of uniquePatterns) {
                if (!entryPatterns.includes(pattern)) {
                    try {
                        // Validate the pattern is a valid regex before adding it
                        new RegExp(pattern, 'i');
                        rules.push({
                            pattern: new RegExp(pattern, 'i'),
                            section: sectionId,
                            subsection: subsection,
                            confidence: 0.88,
                            description: `Custom entry ${entry} pattern for subsection ${subsection} in section ${sectionId}`,
                            entryIndex: (m) => entry
                        });
                    }
                    catch (error) {
                        console.warn(`Invalid custom entry pattern regex: ${pattern}`);
                        // Skip this pattern
                    }
                }
            }
        }
        return rules;
    }
    /**
     * Find unique patterns that identify a specific entry
     * @param fields Fields from an entry
     * @param entry Entry number
     * @returns Array of unique patterns
     */
    findUniqueEntryPatterns(fields, entry) {
        const patterns = new Set();
        // Find common prefixes/suffixes
        if (fields.length >= 2) {
            const names = fields.map(f => f.name);
            const commonPrefix = this.findCommonPrefix(names);
            if (commonPrefix && commonPrefix.length > 5) {
                // Only add if the prefix doesn't contain square brackets, which would cause regex issues
                if (!commonPrefix.includes('[')) {
                    patterns.add(commonPrefix);
                }
            }
            // Extract patterns with entry number, avoiding complex nested structures
            for (const field of fields) {
                const entryStr = entry.toString();
                const entryIndex = field.name.indexOf(entryStr);
                if (entryIndex >= 0) {
                    // Get context around the entry number (5 chars before and after)
                    const start = Math.max(0, entryIndex - 5);
                    const end = Math.min(field.name.length, entryIndex + entryStr.length + 5);
                    const context = field.name.substring(start, end);
                    // Only create patterns if the context doesn't contain square brackets, which are problematic
                    if (context.length > entryStr.length + 2 && !context.includes('[') && !context.includes(']')) {
                        // Simple regex escape for the reduced number of special chars we still need to handle
                        const escapedContext = context
                            .replace(/\\/g, '\\\\')
                            .replace(/\./g, '\\.')
                            .replace(/\+/g, '\\+')
                            .replace(/\*/g, '\\*')
                            .replace(/\?/g, '\\?')
                            .replace(/\^/g, '\\^')
                            .replace(/\$/g, '\\$')
                            .replace(/\{/g, '\\{')
                            .replace(/\}/g, '\\}')
                            .replace(/\(/g, '\\(')
                            .replace(/\)/g, '\\)')
                            .replace(/\|/g, '\\|');
                        const pattern = escapedContext.replace(entryStr, '\\d+');
                        patterns.add(pattern);
                    }
                }
            }
            // Add a simple, safe fallback pattern for entries
            const safePattern = `_${entry}_`;
            patterns.add(safePattern);
        }
        return Array.from(patterns);
    }
    /**
     * Find the longest common prefix among strings
     * @param strings Array of strings to analyze
     * @returns Longest common prefix, or empty string if none
     */
    findCommonPrefix(strings) {
        if (strings.length === 0)
            return '';
        if (strings.length === 1)
            return strings[0];
        let prefix = '';
        const firstStr = strings[0].toLowerCase();
        for (let i = 0; i < firstStr.length; i++) {
            const char = firstStr[i];
            for (let j = 1; j < strings.length; j++) {
                if (i >= strings[j].length || strings[j].toLowerCase()[i] !== char) {
                    return prefix;
                }
            }
            prefix += char;
        }
        return prefix;
    }
    /**
     * Add special case rules for complex sections with unique patterns
     * @param rules Rules array to modify
     * @param sectionId Section number
     */
    addSpecialCaseSectionRules(rules, sectionId) {
        // Special cases for specific sections
        switch (sectionId) {
            case 17: // Marital Status
                [
                    { sub: "1", patternStr: "Section17_1", desc: "Current marriage" },
                    { sub: "2", patternStr: "Section17_2", desc: "Former spouse" },
                    { sub: "3", patternStr: "Section17_3", desc: "Cohabitants" }
                ].forEach(({ sub, patternStr, desc }) => {
                    rules.push({
                        pattern: new RegExp(patternStr, 'i'),
                        section: 17, // Set section explicitly 
                        subsection: sub,
                        confidence: 0.9,
                        description: `${desc} subsection in Section 17`
                    });
                });
                break;
            case 21: // Mental Health
                [
                    { sub: "a", patternStr: "section21a", desc: "Mental health treatment" },
                    { sub: "c", patternStr: "section21c", desc: "Mental health disorders" },
                    { sub: "d", patternStr: "section21d", desc: "Mental health hospitalizations" },
                    { sub: "e", patternStr: "section21e", desc: "Mental health conditions not covered" }
                ].forEach(({ sub, patternStr, desc }) => {
                    // Only add if not already present
                    if (!rules.some(r => r.pattern instanceof RegExp && r.pattern.source === patternStr)) {
                        rules.push({
                            pattern: new RegExp(patternStr, 'i'),
                            section: 21,
                            subsection: sub,
                            confidence: 0.92,
                            description: `${desc} subsection in Section 21`
                        });
                    }
                });
                break;
            case 20: // Foreign Activities
                [
                    { sub: "a", patternStr: "section20a", desc: "Foreign contacts" },
                    { sub: "b", patternStr: "section20b", desc: "Foreign business" },
                    { sub: "c", patternStr: "section20c", desc: "Foreign travel" }
                ].forEach(({ sub, patternStr, desc }) => {
                    // Only add if not already present
                    if (!rules.some(r => r.pattern instanceof RegExp && r.pattern.source === patternStr)) {
                        rules.push({
                            pattern: new RegExp(patternStr, 'i'),
                            section: 20,
                            subsection: sub,
                            confidence: 0.92,
                            description: `${desc} subsection in Section 20`
                        });
                    }
                });
                break;
        }
    }
    /**
     * Generate entry rules for sections 1-8 that don't have subsections
     * @param sectionFields Fields from a basic section
     * @param sectionId Section number (1-8)
     * @returns Array of entry categorization rules
     */
    generateEntryRulesForBaseSection(sectionFields, sectionId) {
        if (sectionId > 8)
            return [];
        const rules = [];
        // Group fields by entry
        const entriesMap = {};
        sectionFields.forEach(field => {
            const entry = field.entry || 0;
            if (!entriesMap[entry]) {
                entriesMap[entry] = [];
            }
            entriesMap[entry].push(field);
        });
        // Skip if no entries or only entry 0
        const entries = Object.keys(entriesMap).map(Number).filter(e => e > 0);
        if (entries.length === 0) {
            return [];
        }
        console.log(`Section ${sectionId} has ${entries.length} entries`);
        // Generate rules for each entry
        entries.forEach(entry => {
            const fields = entriesMap[entry];
            if (fields.length < 2)
                return; // Skip if too few fields
            // Find common patterns in field names
            const commonPrefix = this.findCommonPrefix(fields.map(f => f.name));
            if (commonPrefix && commonPrefix.length > 3) {
                rules.push({
                    pattern: new RegExp(`${commonPrefix}.*`, 'i'),
                    section: sectionId,
                    subsection: undefined,
                    confidence: 0.8,
                    description: `Entry ${entry} pattern for section ${sectionId}`,
                    entryIndex: (m) => entry
                });
            }
            // Try specific entry patterns
            const entryPatterns = [
                `section${sectionId}_${entry}`,
                `section${sectionId}\\.${entry}`,
                `s${sectionId}_${entry}`,
                `form1\\[\\d+\\]\\.section${sectionId}[-_]?${entry}`
            ];
            entryPatterns.forEach(patternStr => {
                rules.push({
                    pattern: new RegExp(patternStr, 'i'),
                    section: sectionId,
                    subsection: undefined,
                    confidence: 0.9,
                    description: `Entry ${entry} pattern for section ${sectionId}`,
                    entryIndex: (m) => entry
                });
            });
        });
        return rules;
    }
    /**
     * Use field coordinates to perform dimensional analysis for better classification
     * This helps with fields that are on the same page but in different visual regions
     * @param fields Fields to analyze
     * @returns Fields with improved classification based on spatial analysis
     */
    analyzeFieldPositions(fields) {
        // Create a copy of the fields to avoid mutation
        const enhancedFields = [...fields];
        // Group fields by page number for spatial analysis
        const fieldsByPage = {};
        // First, group all fields by their page number
        for (const field of enhancedFields) {
            if (!field.page || field.page <= 0)
                continue;
            if (!fieldsByPage[field.page]) {
                fieldsByPage[field.page] = [];
            }
            fieldsByPage[field.page].push(field);
        }
        // Process each page independently
        for (const [pageNum, pageFields] of Object.entries(fieldsByPage)) {
            const page = parseInt(pageNum, 10);
            if (isNaN(page))
                continue;
            // Find fields with known coordinates on this page
            const fieldsWithCoords = pageFields.filter(f => f.rect &&
                typeof f.rect.y === 'number' &&
                typeof f.rect.x === 'number' &&
                typeof f.rect.height === 'number' &&
                typeof f.rect.width === 'number');
            if (fieldsWithCoords.length < 3)
                continue; // Need enough fields for analysis
            // Analyze spatial distribution: likely sections by position
            // Section assignment based on vertical position (y-coordinate clusters)
            this.assignSectionsByVerticalPosition(fieldsWithCoords, page);
            // Detect subsection groups based on horizontal alignment
            this.detectSubsectionsFromAlignment(fieldsWithCoords);
            // Detect entries based on repeating patterns in vertical spacing
            this.detectEntriesFromSpacing(fieldsWithCoords);
        }
        return enhancedFields;
    }
    /**
     * Assign sections to fields based on vertical position analysis
     * @param fields Fields with coordinate data
     * @param pageNum Page number being analyzed
     */
    assignSectionsByVerticalPosition(fields, pageNum) {
        if (fields.length === 0)
            return;
        // Sort fields by vertical position on the page
        fields.sort((a, b) => {
            // Safe access for rect properties
            const aTop = a.rect?.y ?? 0;
            const bTop = b.rect?.y ?? 0;
            return aTop - bTop; // Sort top-to-bottom
        });
        // Find vertical clusters (groups of fields that are closely spaced vertically)
        const verticalClusters = [];
        let currentCluster = [fields[0]];
        let prevY = fields[0].rect?.y ?? 0;
        // Group fields into clusters based on vertical proximity
        for (let i = 1; i < fields.length; i++) {
            const field = fields[i];
            const currentY = field.rect?.y ?? 0;
            // If this field is within a reasonable vertical distance from the previous one,
            // add it to the current cluster, otherwise start a new cluster
            const verticalGap = currentY - prevY;
            if (verticalGap < 30) { // Threshold for vertical grouping - may need tuning
                currentCluster.push(field);
            }
            else {
                // Save current cluster and start a new one
                verticalClusters.push([...currentCluster]);
                currentCluster = [field];
            }
            prevY = currentY;
        }
        // Add the last cluster if not empty
        if (currentCluster.length > 0) {
            verticalClusters.push(currentCluster);
        }
        // Now analyze each vertical cluster for section patterns
        for (const cluster of verticalClusters) {
            if (cluster.length < 2)
                continue; // Skip singleton clusters
            // Extract unique sections in this cluster
            const sectionCounts = {};
            for (const field of cluster) {
                if (field.section && field.section > 0) {
                    sectionCounts[field.section] = (sectionCounts[field.section] || 0) + 1;
                }
            }
            // Find the most common section in this cluster
            let bestSection = 0;
            let maxCount = 0;
            for (const [sectionStr, count] of Object.entries(sectionCounts)) {
                const section = parseInt(sectionStr, 10);
                if (count > maxCount) {
                    maxCount = count;
                    bestSection = section;
                }
            }
            // If we found a dominant section and it has enough evidence
            if (bestSection > 0 && maxCount >= Math.max(2, cluster.length * 0.3)) {
                // Assign that section to all unknown fields in the cluster
                for (const field of cluster) {
                    if (!field.section || field.section === 0) {
                        field.section = bestSection;
                        field.confidence = 0.75; // Reasonable confidence for spatial assignment
                    }
                }
            }
        }
        // Check for specific page-section correlations using reference data
        this.applyPageBasedSectionRules(fields, pageNum);
    }
    /**
     * Apply known page-to-section mappings for better classification
     * @param fields Fields to process
     * @param pageNum Page number
     */
    applyPageBasedSectionRules(fields, pageNum) {
        // Known page-to-section mappings (derived from form structure)
        // This could be moved to a configuration file for better maintainability
        const pageSectionMappings = {
            6: 8, // Section 8 (Passport) is primarily on page 6
            44: 12, // Section 12 (Education) starts around page 44
            45: 12,
            46: 12,
            47: 12,
            55: 15, // Section 15 (Military History)
            56: 15,
            57: 15,
            58: 15,
            65: 16, // Section 16 (People Who Know You)
            66: 16,
            67: 16,
            68: 16,
            80: 20, // Section 20 (Foreign Activities)
            81: 20,
            82: 20,
            83: 20,
            84: 20,
            85: 20,
            86: 20,
            125: 27, // Section 27 (Technology)
            126: 27
        };
        // If this page has a strong section correlation and the field has no section
        const sectionForPage = pageSectionMappings[pageNum];
        if (sectionForPage) {
            // Find unknown fields on this page
            const unknownFields = fields.filter(f => !f.section || f.section === 0);
            if (unknownFields.length > 0) {
                console.log(`Applying page-based rule: assigning section ${sectionForPage} to ${unknownFields.length} fields on page ${pageNum}`);
                // Assign the section based on page
                for (const field of unknownFields) {
                    field.section = sectionForPage;
                    field.confidence = 0.85; // High confidence for page-based assignment
                }
            }
        }
    }
    /**
     * Detect subsections based on horizontal alignment of fields
     * @param fields Fields with coordinate data
     */
    detectSubsectionsFromAlignment(fields) {
        // Group fields by section first
        const sectionGroups = {};
        for (const field of fields) {
            if (!field.section || field.section === 0)
                continue;
            if (!sectionGroups[field.section]) {
                sectionGroups[field.section] = [];
            }
            sectionGroups[field.section].push(field);
        }
        // Process each section group to find subsections based on horizontal alignment
        for (const [sectionStr, sectionFields] of Object.entries(sectionGroups)) {
            const section = parseInt(sectionStr, 10);
            if (isNaN(section) || section <= 8 || sectionFields.length < 3)
                continue;
            // Sort fields by horizontal position
            sectionFields.sort((a, b) => {
                // Safe rect access
                const aLeft = a.rect?.x ?? 0;
                const bLeft = b.rect?.x ?? 0;
                return aLeft - bLeft; // Sort left-to-right
            });
            // Find horizontal clusters (could indicate subsections or entry columns)
            const horizontalClusters = [];
            let currentCluster = [sectionFields[0]];
            let prevX = sectionFields[0].rect?.x ?? 0;
            // Group by horizontal position
            for (let i = 1; i < sectionFields.length; i++) {
                const field = sectionFields[i];
                const currentX = field.rect?.x ?? 0;
                const horizontalGap = Math.abs(currentX - prevX);
                // If close horizontally, group together
                if (horizontalGap < 20) { // Threshold may need tuning
                    currentCluster.push(field);
                }
                else {
                    // Save current cluster and start a new one
                    horizontalClusters.push([...currentCluster]);
                    currentCluster = [field];
                }
                prevX = currentX;
            }
            // Add the last cluster if not empty
            if (currentCluster.length > 0) {
                horizontalClusters.push(currentCluster);
            }
            // For sections with subsections, analyze each horizontal cluster
            if (horizontalClusters.length > 1) {
                // Assign provisional subsection labels based on horizontal position
                for (let i = 0; i < horizontalClusters.length; i++) {
                    const cluster = horizontalClusters[i];
                    // Extract existing subsection information
                    const subsectionCounts = {};
                    for (const field of cluster) {
                        if (field.subsection) {
                            subsectionCounts[field.subsection] = (subsectionCounts[field.subsection] || 0) + 1;
                        }
                    }
                    // Find most common existing subsection
                    let bestSubsection = '';
                    let maxCount = 0;
                    for (const [sub, count] of Object.entries(subsectionCounts)) {
                        if (count > maxCount) {
                            maxCount = count;
                            bestSubsection = sub;
                        }
                    }
                    // If a clear subsection pattern exists, use it
                    if (bestSubsection && maxCount >= Math.max(2, cluster.length * 0.3)) {
                        // Apply to fields without subsection
                        for (const field of cluster) {
                            if (!field.subsection) {
                                field.subsection = bestSubsection;
                                field.confidence = Math.min(1.0, (field.confidence || 0.7) + 0.05);
                            }
                        }
                    }
                    // Otherwise create a positional subsection based on index
                    else if (cluster.length >= 3) {
                        // Use letters for subsections: a, b, c...
                        const subsectionLetter = String.fromCharCode(97 + i); // 97 = 'a'
                        // Apply to fields without subsection
                        for (const field of cluster) {
                            if (!field.subsection) {
                                field.subsection = subsectionLetter;
                                field.confidence = 0.7; // Moderate confidence
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * Detect entries based on repeating patterns in vertical spacing
     * @param fields Fields with coordinate data to analyze
     */
    detectEntriesFromSpacing(fields) {
        // Group by section and subsection
        const sectionSubsectionGroups = {};
        for (const field of fields) {
            if (!field.section)
                continue;
            // Key format: "section.subsection"
            const subsection = field.subsection || undefined;
            const key = `${field.section}.${subsection}`;
            if (!sectionSubsectionGroups[key]) {
                sectionSubsectionGroups[key] = [];
            }
            sectionSubsectionGroups[key].push(field);
        }
        // Process each group to find entry patterns
        for (const [groupKey, groupFields] of Object.entries(sectionSubsectionGroups)) {
            if (groupFields.length < 5)
                continue; // Need enough fields to detect patterns
            // Sort fields by vertical position
            groupFields.sort((a, b) => {
                const aTop = a.rect?.y ?? 0;
                const bTop = b.rect?.y ?? 0;
                return aTop - bTop;
            });
            // Look for repeating vertical spacing patterns which could indicate entries
            const spacings = [];
            for (let i = 1; i < groupFields.length; i++) {
                const prevField = groupFields[i - 1];
                const currField = groupFields[i];
                const prevBottom = (prevField.rect?.y ?? 0) + (prevField.rect?.height ?? 0);
                const currTop = currField.rect?.y ?? 0;
                const spacing = currTop - prevBottom;
                if (spacing > 0) {
                    spacings.push(spacing);
                }
            }
            // Find frequently occurring large gaps (potential entry boundaries)
            if (spacings.length > 2) {
                // Find "large" gaps (above average)
                const avgSpacing = spacings.reduce((sum, val) => sum + val, 0) / spacings.length;
                const largeGaps = [];
                for (let i = 0; i < spacings.length; i++) {
                    if (spacings[i] > avgSpacing * 1.5) { // Threshold for "large" gap
                        largeGaps.push(i); // Index of the field after the large gap
                    }
                }
                // If we found potential entry boundaries
                if (largeGaps.length > 0) {
                    let entryIndex = 1; // Start with entry 1
                    let lastGroupStart = 0;
                    // Apply entry indexing based on gaps
                    for (const gapIndex of largeGaps) {
                        // Set entry for all fields from lastGroupStart up to this gap
                        for (let j = lastGroupStart; j <= gapIndex; j++) {
                            if (j < groupFields.length && !groupFields[j].entry) {
                                groupFields[j].entry = entryIndex;
                                groupFields[j].confidence = Math.min(1.0, (groupFields[j].confidence || 0.7) + 0.05);
                            }
                        }
                        // Move to next entry
                        entryIndex++;
                        lastGroupStart = gapIndex + 1;
                    }
                    // Handle remaining fields (last entry)
                    for (let j = lastGroupStart; j < groupFields.length; j++) {
                        if (!groupFields[j].entry) {
                            groupFields[j].entry = entryIndex;
                            groupFields[j].confidence = Math.min(1.0, (groupFields[j].confidence || 0.7) + 0.05);
                        }
                    }
                }
            }
        }
    }
    /**
     * Process fields using self-healing approach, utilizing field coordinates for dimensional analysis
     * @param fields Array of fields to process
     * @returns Processed fields with improved categorization
     */
    enhanceFieldsWithCoordinates(fields) {
        // First, apply basic self-healing to get preliminary categorization
        let processedFields = [...fields];
        // Now apply dimensional analysis using field coordinates
        processedFields = this.analyzeFieldPositions(processedFields);
        // Gather statistics on the improvements
        const beforeUnknown = fields.filter(f => !f.section).length;
        const afterUnknown = processedFields.filter(f => !f.section).length;
        const beforeSubsections = fields.filter(f => f.section && f.subsection).length;
        const afterSubsections = processedFields.filter(f => f.section && f.subsection).length;
        const beforeEntries = fields.filter(f => f.section && f.entry).length;
        const afterEntries = processedFields.filter(f => f.section && f.entry).length;
        console.log(`Coordinate analysis results:
      - Sections: ${beforeUnknown - afterUnknown} additional fields categorized
      - Subsections: ${afterSubsections - beforeSubsections} additional fields with subsections
      - Entries: ${afterEntries - beforeEntries} additional fields with entries`);
        return processedFields;
    }
}
// Export a singleton instance
export const selfHealer = new SelfHealingManager();
