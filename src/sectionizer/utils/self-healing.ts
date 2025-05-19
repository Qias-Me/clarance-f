/**
 * Self-healing utility for SF-86 field categorization
 * 
 * This file implements the iterative self-healing mechanism that processes
 * unknown fields and generates new rules until convergence.
 */

import type { EnhancedField, MatchRule } from '../types.js';
import { rulesGenerator, RulesGenerator } from './rules-generator.js';
import { RuleEngine } from '../engine.js';
import type { extractFieldsBySection, CategorizedField } from './extractFieldsBySection.js';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { 
  identifySectionByPageWithConfidence, 
  enhancedMultiDimensionalCategorization,
  detectSectionFromFieldValue,
  extractSectionInfoFromName,
  getNeighborFieldContext,
  sectionClassifications
} from '../../../utilities/page-categorization-bridge.js';

/**
 * Interface for section statistics comparison
 */
export interface SectionDeviation {
  section: number;
  actual: number;
  expected: number;
  deviation: number;
  deviationPercent?: number;
  fields?: CategorizedField[];
}

/**
 * Manages the iterative self-healing process for field categorization
 */
export class SelfHealingManager {
  // Make iteration public so it can be accessed by reportGenerator
  public iteration = 0;
  // Keep these protected for derived classes
  protected previousUnknownCount = Infinity;
  protected previousMiscategorizedCount = Infinity;
  
  /**
   * Constructor for SelfHealingManager
   * @param maxIterations Maximum number of iterations to attempt
   */
  constructor(protected maxIterations = 5) {}
  
  /**
   * Process unknown fields to improve categorization
   * @param ruleEngine Rule engine with categorization logic
   * @param unknownFields Uncategorized fields to process
   * @param autoUpdate Automatically update rule files
   * @param logProgress Log progress during processing
   * @returns Results of the self-healing process
   */
  public async processUnknownFields(
    ruleEngine: RuleEngine,
    unknownFields: CategorizedField[],
    autoUpdate = true,
    logProgress = true
  ): Promise<{
    success: boolean;
    iterations: number;
    remainingUnknown: CategorizedField[];
    generatedRules: number;
    improvedFields: number;
    ruleCandidates: Map<string, MatchRule[]>;
  }> {
    // Reset iteration counter
    this.iteration = 0;
    this.previousUnknownCount = unknownFields.length;
    
    // Track metrics
    let totalGeneratedRules = 0;
    let initialUnknownCount = unknownFields.length;
    let currentUnknownFields = [...unknownFields];
    let latestRuleCandidates = new Map<string, MatchRule[]>();
    
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
          } else {
            console.log('No rule files were actually updated despite having rule candidates.');
          }
        } catch (error) {
          console.error('Error updating rule files:', error);
        }
      }
      
      // Wait for rule engine to reload rules after file update
      if (autoUpdate && rulesUpdated) {
        try {
          await ruleEngine.loadRules();
          console.log('Successfully reloaded rules into the engine.');
        } catch (error) {
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
      } else {
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
  public async correctMiscategorizedFields(
    ruleEngine: RuleEngine,
    sectionFields: Record<string, CategorizedField[]>,
    referenceCounts: Record<number, number>,
    deviationThreshold = 0.2
  ): Promise<{
    success: boolean;
    iterations: number;
    corrections: number;
    rulesGenerated: number;
    finalSectionFields: Record<string, CategorizedField[]>;
    deviations: SectionDeviation[];
  }> {
    console.log(chalk.cyan('\n=== Starting Self-Healing Process ==='));
    
    // Make a deep copy of section fields
    let currentSectionFields = this.cloneSectionFields(sectionFields);
    let lastDeviationCheckFields: CategorizedField[] = [];
    let totalCorrections = 0;
    let totalRulesGenerated = 0;
    let iterations = 0;
    let maxAttemptsForSection = 2; // Try at most twice per section with major deviations
    let remainingAttempts = maxAttemptsForSection;
    let processedSections = new Set<number>();
    
    // Track per-section corrections
    const sectionsProcessed = new Set<number>();
    
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
        } else {
          remainingAttempts--;
        }
      }
      
      // Create a map of fields that need correction
      let correctionsBySection: Record<string, Array<{
        field: CategorizedField,
        fromSection: number,
        toSection: number,
        confidence: number,
        pattern: string
      }>> = {};
      
      // Identify candidate fields to move between sections
      for (const deviation of sectionsToProcess) {
        const sectionId = deviation.section;
        const sectionStr = sectionId.toString();
        
        if (deviation.deviation > 0) {
          // This section has too many fields - identify candidates to move out
          console.log(chalk.yellow(`Section ${sectionId} has ${deviation.deviation} too many fields (${deviation.actual} vs expected ${deviation.expected})`));
          
          // Get candidate fields to move out based on confidence and patterns
          const candidateFields = this.identifyCandidatesToMoveOut(
            sectionFields[sectionStr] || [],
            sectionId,
            underPopulated
          );
          
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
        } else if (deviation.deviation < 0) {
          // This section has too few fields - identify candidates to move in
          console.log(chalk.yellow(`Section ${sectionId} has ${Math.abs(deviation.deviation)} too few fields (${deviation.actual} vs expected ${deviation.expected})`));
          
          // Check other sections for possible candidates to move to this section
          const candidateFields = this.identifyCandidatesToMoveIn(
            allFields,
            sectionId,
            overPopulated
          );
          
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
        if (remainingAttempts <= 0) break;
        continue;
      }
      
      console.log(`Making ${totalCorrectionsCandidates} field corrections in this iteration.`);
      
      // Group fields by target section for rule generation
      const fieldsByTargetSection = new Map<number, CategorizedField[]>();
      
      // Apply corrections to each section
      for (const [targetSectionStr, corrections] of Object.entries(correctionsBySection)) {
        const targetSection = parseInt(targetSectionStr, 10);
        const targetFields: CategorizedField[] = [];
        
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
      const ruleCandidates = new Map<string, MatchRule[]>();
      let sectionRulesGenerated = 0;
      
      // Generate rule candidates for each target section
      for (const [section, fields] of fieldsByTargetSection.entries()) {
        // Skip if too few fields for a meaningful pattern
        if (fields.length < 3) continue;
        
        console.log(`Generating rule candidates for section ${section} with ${fields.length} fields...`);
        
        // Create enhanced fields for rule generation
        const enhancedFields: EnhancedField[] = fields.map(field => ({
          id: field.id,
          name: field.name,
          value: field.value || '',
          page: field.page,
          label: field.label,
          type: field.type,
          maxLength: field.maxLength,
          options: field.options,
          required: field.required,
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
      } else {
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
          } else {
            console.log(chalk.yellow('No rules were actually updated despite having candidates. This may indicate an issue with rule generation or file permissions.'));
            // Continue with the iterations even if no rules were updated
          }
        } catch (error) {
          console.error('Error updating rules:', error);
          console.log(chalk.yellow('Will continue with field corrections regardless of rule status.'));
        }
      }
      
      // Apply corrections directly to the fields, even if rules weren't updated
      console.log('Applying corrections to fields...');
      
      // Create a map of field ID to its new section
      const fieldCorrections: Record<string, number> = {};
      
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
  private async handleExtremeDeviations(
    ruleEngine: RuleEngine,
    sectionFields: Record<string, CategorizedField[]>,
    extremeDeviations: SectionDeviation[],
    underrepresentedSections: SectionDeviation[]
  ): Promise<void> {
    console.log(chalk.cyan('Applying special handling for extreme deviations...'));
    
    for (const deviation of extremeDeviations) {
      const sectionId = deviation.section;
      const fields = sectionFields[sectionId.toString()] || [];
      
      if (fields.length === 0) continue;
      
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
                    required: field.required,
                    section: bestTarget.section,
                    subSection: field.subsection,
                    entryIndex: field.entry,
                    confidence: field.confidence
                  } as EnhancedField));
                  
                  // Generate rules for this specific group
                  const ruleCandidates = await rulesGenerator.generateRuleCandidates(enhancedFields);
                  
                  if (ruleCandidates.has(bestTarget.section.toString())) {
                    const rules = ruleCandidates.get(bestTarget.section.toString()) || [];
                    if (rules.length > 0) {
                      console.log(chalk.green(`    Generated ${rules.length} rules for this group`));
                      
                      // Update rules immediately
                      const mapToUpdate = new Map<string, MatchRule[]>();
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
                required: field.required,
                section: bestTarget.section,
                subSection: field.subsection,
                entryIndex: field.entry,
                confidence: field.confidence
              } as EnhancedField));
              
              // Generate rules for this specific sequence
              const ruleCandidates = await rulesGenerator.generateRuleCandidates(enhancedFields);
              
              if (ruleCandidates.has(bestTarget.section.toString())) {
                const rules = ruleCandidates.get(bestTarget.section.toString()) || [];
                if (rules.length > 0) {
                  console.log(chalk.green(`  Generated ${rules.length} rules for this sequence`));
                  
                  // Update rules immediately
                  const mapToUpdate = new Map<string, MatchRule[]>();
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
  private groupFieldsByPatternsEnhanced(fields: CategorizedField[]): Record<string, CategorizedField[]> {
    const patterns: Record<string, CategorizedField[]> = {};
    
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
      } else if (field.name.match(/section\d+_[a-z]/i)) {
        enhancedPattern = 'section#_letter';
      } else if (field.name.match(/s\d+_[a-z]/i)) {
        enhancedPattern = 's#_letter';
      } else if (field.name.match(/\#field\[\d+\]/i)) {
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
    return Object.fromEntries(
      Object.entries(patterns)
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
  private advancedPatternMatch(
    pattern: string, 
    fields: CategorizedField[], 
    section: number
  ): {confidence: number; reason: string} {
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
  private getSectionKeywords(section: number): string[] {
    const sectionKeywords: Record<number, string[]> = {
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
  private groupFieldsByPage(fields: CategorizedField[]): Record<number, CategorizedField[]> {
    const result: Record<number, CategorizedField[]> = {};
    
    for (const field of fields) {
      if (!field.page) continue;
      
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
  private identifyFieldSequences(fields: CategorizedField[]): Array<{
    basePattern: string;
    fields: CategorizedField[];
  }> {
    const result: Array<{
      basePattern: string;
      fields: CategorizedField[];
    }> = [];
    
    // Group fields by common name patterns first
    const namePatterns: Record<string, CategorizedField[]> = {};
    
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
      if (patternFields.length < 5) continue; // Need at least 5 fields to consider it a sequence
      
      // Extract indices and sort
      const indices: number[] = [];
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
        if (indices[i] === indices[i-1] + 1) {
          consecutiveCount++;
        } else if (indices[i] !== indices[i-1]) {
          // Allow some gaps
          if (indices[i] - indices[i-1] > 3) {
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
  private findBestTargetSection(
    fields: CategorizedField[],
    targetSections: SectionDeviation[]
  ): { section: number; confidence: number } | null {
    let bestMatch = null;
    let highestConfidence = 0;
    
    for (const targetSection of targetSections) {
      const { confidence } = this.advancedPatternMatch(
        fields[0].name, // Use the first field's name as a representative pattern
        fields,
        targetSection.section
      );
      
      // Also consider how well this field count would fit the target section's deficit
      const countFitScore = Math.min(
        fields.length / Math.abs(targetSection.deviation),
        Math.abs(targetSection.deviation) / fields.length
      );
      
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
  private deduplicateCorrections(candidates: Array<{
    field: CategorizedField;
    fromSection: number;
    toSection: number;
    confidence: number;
    pattern: string;
  }>): typeof candidates {
    const seen = new Set<string>();
    const result: typeof candidates = [];
    
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
  private async recategorizeUnknownFields(
    ruleEngine: RuleEngine, 
    fields: CategorizedField[]
  ): Promise<CategorizedField[]> {
    // Categorize each field
    const recategorized = fields.map(field => {
      const result = ruleEngine.categorizeField(field);
      
      if (result) {
        // Update categorization
        return {
          ...field,
          section: result.section,
          subsection: result.subsection,
          entry: result.entry,
          confidence: result.confidence
        };
      }
      
      // No match, return original field
      return field;
    });
    
    // Return fields that are still uncategorized (section 0 or no section)
    return recategorized.filter(field => !field.section || field.section === 0);
  }

  /**
   * Clone the section fields object to avoid modifying the original
   * @param sectionFields Original section fields
   * @returns Cloned section fields
   */
  protected cloneSectionFields(sectionFields: Record<string, CategorizedField[]>): Record<string, CategorizedField[]> {
    const clone: Record<string, CategorizedField[]> = {};
    
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
  protected calculateDeviations(
    sectionFields: Record<string, CategorizedField[]>,
    referenceCounts: Record<number, number>,
    threshold = 0.2
  ): SectionDeviation[] {
    const deviations: SectionDeviation[] = [];
    
    // Calculate deviations for each section
    for (const [sectionStr, expectedCount] of Object.entries(referenceCounts)) {
      const section = parseInt(sectionStr);
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
  protected countMiscategorizedFields(deviations: SectionDeviation[]): number {
    return deviations.reduce((sum, dev) => sum + Math.abs(dev.deviation), 0);
  }

  /**
   * Populate deviation objects with the actual fields for analysis
   * @param deviations Section deviations
   * @param sectionFields Current section fields
   * @returns Updated deviations with fields populated
   */
  protected populateDeviationFields(
    deviations: SectionDeviation[],
    sectionFields: Record<string, CategorizedField[]>
  ): SectionDeviation[] {
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
  protected reorganizeFieldsBySections(fields: CategorizedField[]): Record<string, CategorizedField[]> {
    const result: Record<string, CategorizedField[]> = {};
    
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
  protected groupCorrectionsBySection(corrections: Array<{
    field: CategorizedField;
    fromSection: number;
    toSection: number;
    confidence: number;
    pattern: string;
  }>): Record<string, typeof corrections> {
    const result: Record<string, typeof corrections> = {};
    
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
   * @param extractFieldsFn Function to extract fields from PDF
   * @param pdfPath Path to PDF file
   * @param keepUnknown Whether to keep unknown field history
   * @param referenceCounts Optional reference counts for validation
   * @returns Result of self-healing process
   */
  public async runIterativeSelfHealing(
    ruleEngine: RuleEngine,
    extractFieldsFn: typeof extractFieldsBySection,
    pdfPath: string,
    keepUnknown = false,
    referenceCounts?: Record<number, number>
  ): Promise<{
    success: boolean;
    iterations: number;
    remainingUnknown: CategorizedField[];
    finalSectionFields: Record<string, CategorizedField[]>;
  }> {
    // Reset iteration counter
    this.iteration = 0;
    
    // Initialize with the fields from PDF
    let currentSectionFields = await extractFieldsFn(pdfPath);
    let remainingUnknown = currentSectionFields['0'] || [];
    let initialUnknownCount = remainingUnknown.length;
    
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
      const unknownDir = path.resolve(process.cwd(), 'scripts/unknown-history');
      if (!fs.existsSync(unknownDir)) {
        fs.mkdirSync(unknownDir, { recursive: true });
      }
      
      // Save initial unknown fields
      fs.writeFileSync(
        path.join(unknownDir, 'unknown-initial.json'),
        JSON.stringify(remainingUnknown, null, 2)
      );
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
      
      // Get new section fields - reorganize them internally since we can't call extractFieldsFn with field array
      const updatedFields = this.reorganizeFieldsBySections(allFieldsWithProcessed);
      currentSectionFields = updatedFields;
      
      // Update unknown fields
      remainingUnknown = currentSectionFields['0'] || [];
      
      // Save current state if requested
      if (keepUnknown && remainingUnknown.length > 0) {
        const iterationFilePath = path.join(
          path.resolve(process.cwd(), 'scripts/unknown-history'), 
          `unknown-iteration-${this.iteration}.json`
        );
        fs.writeFileSync(
          iterationFilePath,
          JSON.stringify(remainingUnknown, null, 2)
        );
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
        
        const correctionResult = await this.correctMiscategorizedFields(
          ruleEngine,
          currentSectionFields,
          referenceCounts
        );
        
        if (correctionResult.corrections > 0) {
          console.log(chalk.green(`Corrected ${correctionResult.corrections} miscategorized fields.`));
          currentSectionFields = correctionResult.finalSectionFields;
        }
      }
    }
    
    console.log(chalk.green(`Self-healing process complete after ${this.iteration} iterations.`));
    console.log(chalk.green(`Improved classification for ${totalImprovedFields} fields (${(totalImprovedFields / initialUnknownCount * 100).toFixed(2)}%).`));
    
    return {
      success: remainingUnknown.length === 0,
      iterations: this.iteration,
      remainingUnknown,
      finalSectionFields: currentSectionFields
    };
  }

  /**
   * Identify repeating field groups within a large section
   * @param fields Fields to analyze for repeating patterns
   * @returns Array of field groups with patterns
   */
  protected identifyRepeatingFieldGroups(fields: CategorizedField[]): Array<{
    pattern: string;
    fields: CategorizedField[];
  }> {
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
  private async regroupFieldsBySections(fields: CategorizedField[]): Promise<Record<string, CategorizedField[]>> {
    try {
      // Import the groupFieldsBySection function here to avoid circular dependencies
      const { groupFieldsBySection } = await import('./extractFieldsBySection.js');
      // Call the function with the fields array
      return await groupFieldsBySection(fields, false);
    } catch (error) {
      console.error('Error regrouping fields:', error);
      
      // Fallback implementation if import fails
      const sectionFields: Record<string, CategorizedField[]> = {};
      
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
  private getAllFieldsFromSections(sectionFields: Record<string, CategorizedField[]>): CategorizedField[] {
    return Object.values(sectionFields).flat();
  }

  /**
   * Identify sections with significant deviations from expected counts
   * @param fields All fields to analyze
   * @param referenceCounts Expected counts by section
   * @param deviationThreshold Threshold to consider a deviation significant (0.2 = 20%)
   * @returns Array of section deviations
   */
  private identifySectionDeviations(
    fields: CategorizedField[],
    referenceCounts: Record<number, number>,
    deviationThreshold: number
  ): SectionDeviation[] {
    // Count fields by section
    const sectionCounts: Record<number, number> = {};
    
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
    const deviations: SectionDeviation[] = [];
    
    for (const [sectionStr, expectedCount] of Object.entries(referenceCounts)) {
      const section = parseInt(sectionStr);
      if (isNaN(section) || section < 1 || section > 30) continue;
      
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
  protected enhancedPatternMatch(
    pattern: string,
    fields: CategorizedField[],
    section: number
  ): {confidence: number; reason: string} {
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
  private matchFieldsByContent(
    fields: CategorizedField[],
    deviations: SectionDeviation[]
  ): Array<{
    field: CategorizedField;
    toSection: number;
    confidence: number;
    reason: string;
  }> {
    // Basic implementation - return empty array
    return [];
  }

  /**
   * Apply content-based corrections to fields
   * @param fields Original fields
   * @param corrections Content-based corrections to apply
   * @returns Updated fields with corrections applied
   */
  private applyContentBasedCorrections(
    fields: CategorizedField[],
    corrections: Array<{
      field: CategorizedField;
      toSection: number;
      confidence: number;
      reason: string;
    }>
  ): CategorizedField[] {
    if (corrections.length === 0) return fields;
    
    // Create a map of field IDs to new section assignments
    const correctionMap = new Map<string, number>();
    corrections.forEach(c => correctionMap.set(c.field.id, c.toSection));
    
    // Apply corrections
    return fields.map(field => {
      if (correctionMap.has(field.id)) {
        return {
          ...field,
          section: correctionMap.get(field.id)!,
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
  private identifyCandidatesToMoveOut(
    sectionFields: CategorizedField[],
    sourceSection: number,
    targetSections: SectionDeviation[]
  ): Array<{
    field: CategorizedField;
    fromSection: number;
    toSection: number;
    confidence: number;
    pattern: string;
  }> {
    // Skip if no fields
    if (!sectionFields || sectionFields.length === 0) {
      return [];
    }
    
    // Calculate how many fields should be considered for moving
    const maxFieldsToMove = Math.min(
      Math.ceil(sectionFields.length * 0.2), // Don't move more than 20% of fields
      20 // Cap at 20 fields per operation
    );
    
    if (maxFieldsToMove <= 0) return [];
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
            const typicalPageRanges: Record<number, [number, number]> = {
              16: [25, 30],  // Section 16 is typically on pages 25-30
              9: [15, 20],   // Section 9 is typically on pages 15-20
              27: [40, 45]   // Section 27 is typically on pages 40-45
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
      .filter((item): item is NonNullable<typeof item> => item !== null)
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
  private identifyCandidatesToMoveIn(
    allFields: CategorizedField[],
    targetSection: number,
    sourceSections: SectionDeviation[]
  ): Array<{
    field: CategorizedField;
    fromSection: number;
    toSection: number;
    confidence: number;
    pattern: string;
  }> {
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
          const typicalPageRanges: Record<number, [number, number]> = {
            16: [25, 30],  // Section 16 is typically on pages 25-30
            9: [15, 20],   // Section 9 is typically on pages 15-20
            27: [40, 45],  // Section 27 is typically on pages 40-45
            29: [50, 55]   // Section 29 is typically on pages 50-55
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
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 15); // Limit to 15 candidates per section
    
    console.log(`Found ${candidates.length} candidate fields to move into section ${targetSection}`);
    return this.deduplicateCorrections(candidates);
  }
}

// Export a singleton instance
export const selfHealer = new SelfHealingManager(); 