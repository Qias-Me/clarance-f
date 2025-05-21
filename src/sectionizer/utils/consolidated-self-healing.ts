/**
 * Consolidated Self-Healing Module
 * 
 * This module combines the best features from both the original self-healing
 * and enhanced self-healing implementations to provide a single, optimized
 * approach to field categorization correction.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import { RuleEngine } from '../engine.js';
import type { PDFField, CategorizedField } from './extractFieldsBySection.js';
import { 
  enhancedMultiDimensionalCategorization, 
  extractSectionInfoFromName, 
  identifySectionByPageWithConfidence,
  detectSectionFromFieldValue,
  sectionClassifications,
  refinedSectionPageRanges
} from './fieldParsing.js';
import { reportGenerator } from './report-generator.js';
import { rulesGenerator, RulesGenerator } from './rules-generator.js';
import { 
  predictSectionBySpatialProximity, 
  calculateSpatialConfidenceBoost, 
  extractSpatialInfo,
  getPositionalSectionScore,
  clusterFieldsSpatially,
  getSpatialNeighbors
} from './spatialAnalysis.js';
import { sectionFieldPatterns } from './field-clusterer.js';
import * as helpers from './commonHelpers.js';

/**
 * Interface for section statistics comparison
 */
export interface SectionDeviation {
  section: number;
  actual: number;
  expected: number;
  deviation: number;
  deviationPercent?: number;
  percentage?: number;
  isSignificant?: boolean;
  shouldCorrect?: boolean;
  fields?: CategorizedField[];
}

/**
 * Interface for self-healing result
 */
export interface SelfHealingResult {
  success: boolean;
  iterations: number;
  corrections: number;
  rulesGenerated: number;
  finalSectionFields: Record<string, CategorizedField[]>;
  deviations: SectionDeviation[];
  remainingUnknown: CategorizedField[];
}

/**
 * Interface for self-healing step result
 */
interface SelfHealingStepResult {
  sectionFields: Record<string, CategorizedField[]>;
  corrections: number;
  alignmentImprovement: number;
  alignmentScore: number;
  deviationInfo: any;
  rulesGenerated: number;
}

// Cache for section data
let sectionDataCache: Record<string, CategorizedField[]> | null = null;

/**
 * Manages the comprehensive self-healing process for field categorization
 */
export class ConsolidatedSelfHealingManager {
  // Counters and tracking
  public iteration = 0;
  protected previousUnknownCount = Infinity;
  protected previousMiscategorizedCount = Infinity;
  
  /**
   * Constructor for ConsolidatedSelfHealingManager
   * @param maxIterations Maximum number of iterations to attempt
   * @param deviationThreshold Threshold for acceptable section count deviations
   */
  constructor(
    protected maxIterations = 5,
    protected deviationThreshold = 0.3
  ) {}
  
  /**
   * Run the complete self-healing process
   * 
   * @param ruleEngine Rule engine with categorization logic
   * @param sectionFields Current categorized fields by section
   * @param referenceCounts Expected field counts by section
   * @param outputPath Optional path to save results
   * @returns Results of the self-healing process
   */
  public async runSelfHealing(
    ruleEngine: RuleEngine,
    sectionFields: Record<string, CategorizedField[]>,
    referenceCounts: Record<number, number>,
    outputPath?: string
  ): Promise<SelfHealingResult> {
    // Reset iteration counter
    this.iteration = 0;
    
    // Deep clone section fields to avoid modifying the original
    const workingSectionFields = helpers.deepClone(sectionFields);
    
    // Process unknown fields (section 0)
    const unknownFields = workingSectionFields['0'] || [];
    let remainingUnknown: CategorizedField[] = [...unknownFields];
    
    helpers.logWithTimestamp(`Starting self-healing process with ${unknownFields.length} unknown fields`, chalk.blue);
    
    // Track metrics
    let totalRulesGenerated = 0;
    let totalCorrections = 0;
    
    // First phase: Try to categorize unknown fields directly with enhanced methods
    if (unknownFields.length > 0) {
      const unknownResult = await this.processUnknownFields(
        ruleEngine,
        remainingUnknown,
        true, // Auto-update rules
        true  // Log progress
      );
      
      totalRulesGenerated += unknownResult.generatedRules;
      
      // Update remaining unknown fields
      remainingUnknown = unknownResult.remainingUnknown;
      
      // Apply improvements to working section fields
      if (unknownResult.improvedFields > 0) {
        helpers.logWithTimestamp(`Improved ${unknownResult.improvedFields} fields in unknown phase`, chalk.green);
        
        // Reorganize all fields into sections
        const improvedFields = this.getAllFieldsFromSections(workingSectionFields);
        const reorganizedFields = this.reorganizeFieldsBySections(improvedFields);
        
        // Update working section fields
        Object.assign(workingSectionFields, reorganizedFields);
      }
    }
    
    // Second phase: Correction of miscategorized fields
    const initialDeviations = this.calculateDeviations(
      workingSectionFields,
      referenceCounts,
      this.deviationThreshold
    );
    
    // Only proceed with corrections if there are significant deviations
    if (initialDeviations.some(d => d.isSignificant)) {
      helpers.logWithTimestamp(`Found ${initialDeviations.filter(d => d.isSignificant).length} sections with significant deviations`, chalk.yellow);
      
      // Apply iterative correction steps
      while (this.iteration < this.maxIterations) {
        this.iteration++;
        
        helpers.logWithTimestamp(`Correction iteration ${this.iteration}/${this.maxIterations}`, chalk.blue);
        
        // Apply a single step of corrections
        const stepResult = await this.applySelfHealingStep(
          ruleEngine,
          workingSectionFields,
          referenceCounts
        );
        
        // Update metrics
        totalCorrections += stepResult.corrections;
        totalRulesGenerated += stepResult.rulesGenerated;
        
        // Replace working section fields with corrected ones
        Object.assign(workingSectionFields, stepResult.sectionFields);
        
        // Log progress
        helpers.logWithTimestamp(
          `Applied ${stepResult.corrections} corrections, alignment score: ${stepResult.alignmentScore.toFixed(2)}%`,
          stepResult.corrections > 0 ? chalk.green : chalk.yellow
        );
        
        // Check if we've achieved acceptable alignment
        const currentDeviations = this.calculateDeviations(
          workingSectionFields,
          referenceCounts,
          this.deviationThreshold
        );
        
        const miscategorizedCount = this.countMiscategorizedFields(currentDeviations);
        
        // Stop if we're no longer making progress
        if (miscategorizedCount >= this.previousMiscategorizedCount && stepResult.corrections === 0) {
          helpers.logWithTimestamp(`No further improvement possible (${miscategorizedCount} miscategorized fields)`, chalk.yellow);
          break;
        }
        
        this.previousMiscategorizedCount = miscategorizedCount;
        
        // Stop if we've achieved acceptable alignment
        if (stepResult.alignmentScore >= 90) {
          helpers.logWithTimestamp(`Achieved acceptable alignment score (${stepResult.alignmentScore.toFixed(2)}%)`, chalk.green);
          break;
        }
      }
    } else {
      helpers.logWithTimestamp('No significant deviations found, skipping correction phase', chalk.green);
    }
    
    // Calculate final alignment
    const finalDeviations = this.calculateDeviations(
      workingSectionFields,
      referenceCounts,
      this.deviationThreshold
    );
    
    const alignmentScore = this.calculateAlignmentScore(finalDeviations);
    const success = alignmentScore >= 85 && remainingUnknown.length <= 20;
    
    // Save results if output path provided
    if (outputPath) {
      await this.saveSectionData(workingSectionFields, outputPath);
    }
    
    // Log final status
    helpers.logWithTimestamp(
      `Self-healing complete: ${success ? 'SUCCESS' : 'PARTIAL SUCCESS'} (${alignmentScore.toFixed(2)}% alignment)`,
      success ? chalk.green : chalk.yellow
    );
    helpers.logWithTimestamp(`Generated ${totalRulesGenerated} rules, applied ${totalCorrections} corrections`, chalk.blue);
    helpers.logWithTimestamp(`${remainingUnknown.length} fields remain uncategorized`, remainingUnknown.length > 0 ? chalk.yellow : chalk.green);
    
    return {
      success,
      iterations: this.iteration,
      corrections: totalCorrections,
      rulesGenerated: totalRulesGenerated,
      finalSectionFields: workingSectionFields,
      deviations: finalDeviations,
      remainingUnknown
    };
  }
  
  /**
   * Process unknown fields to improve categorization
   * @param ruleEngine Rule engine with categorization logic
   * @param unknownFields Uncategorized fields to process
   * @param autoUpdate Automatically update rule files
   * @param logProgress Log progress during processing
   * @returns Results of the self-healing process
   */
  protected async processUnknownFields(
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
    ruleCandidates: Map<string, any[]>;
  }> {
    // Implementation details would be similar to the original SelfHealingManager's processUnknownFields,
    // but with enhanced techniques from the EnhancedSelfHealing module
    
    // Reset iteration counter for this phase
    let iteration = 0;
    let previousUnknownCount = unknownFields.length;
    
    // Track metrics
    let totalGeneratedRules = 0;
    let initialUnknownCount = unknownFields.length;
    let currentUnknownFields = [...unknownFields];
    let latestRuleCandidates = new Map<string, any[]>();
    
    // No unknown fields to process
    if (unknownFields.length === 0) {
      if (logProgress) {
        helpers.logWithTimestamp('No unknown fields to process.', chalk.blue);
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
    
    // Initialize rule generator
    const generator = new RulesGenerator();
    
    while (currentUnknownFields.length > 0 && iteration < this.maxIterations) {
      iteration++;
      
      if (logProgress) {
        helpers.logWithTimestamp(`Unknown field iteration ${iteration}: Analyzing ${currentUnknownFields.length} fields...`, chalk.blue);
      }
      
      // First apply advanced techniques from enhanced self-healing
      const enhancedResult = this.applyEnhancedCategorization(currentUnknownFields, ruleEngine);
      
      // If enhanced categorization made progress, update fields
      if (enhancedResult.corrections > 0) {
        if (logProgress) {
          helpers.logWithTimestamp(`Enhanced categorization improved ${enhancedResult.corrections} fields`, chalk.green);
        }
        
        // Update remaining unknown fields by removing recategorized ones
        currentUnknownFields = currentUnknownFields.filter(field => 
          !enhancedResult.recategorized.some(r => r.id === field.id)
        );
      }
      
      // If all fields were categorized, we're done
      if (currentUnknownFields.length === 0) {
        break;
      }
      
      // Generate rule candidates using the rule engine
      latestRuleCandidates = await ruleEngine.processUnknownFields(currentUnknownFields, false);
      
      if (latestRuleCandidates.size === 0) {
        if (logProgress) {
          helpers.logWithTimestamp('No new rules could be generated. Breaking iteration loop.', chalk.yellow);
        }
        break;
      }
      
      // Count generated rules
      const generatedRules = Array.from(latestRuleCandidates.entries())
        .reduce((total, [_, rules]) => total + rules.length, 0);
      
      totalGeneratedRules += generatedRules;
      
      if (logProgress) {
        helpers.logWithTimestamp(`Generated ${generatedRules} new rules for ${latestRuleCandidates.size} sections`, chalk.green);
      }
      
      // Explicitly update rule files
      let rulesUpdated = false;
      if (autoUpdate && latestRuleCandidates.size > 0) {
        try {
          const updatedSections = await generator.updateRuleFiles(latestRuleCandidates);
          if (updatedSections.length > 0) {
            helpers.logWithTimestamp(`Updated rules for ${updatedSections.length} sections: ${updatedSections.join(', ')}`, chalk.green);
            rulesUpdated = true;
          } else {
            helpers.logWithTimestamp('No rule files were actually updated despite having rule candidates.', chalk.yellow);
          }
        } catch (error) {
          console.error('Error updating rule files:', error);
        }
      }
      
      // Wait for rule engine to reload rules after file update
      if (autoUpdate && rulesUpdated) {
        try {
          await ruleEngine.loadRules();
          helpers.logWithTimestamp('Successfully reloaded rules into the engine.', chalk.green);
        } catch (error) {
          console.error('Error reloading rules:', error);
          helpers.logWithTimestamp('Will continue with existing rules.', chalk.yellow);
        }
      }
      
      // Re-categorize fields to see if we've improved
      currentUnknownFields = await this.recategorizeUnknownFields(ruleEngine, currentUnknownFields);
      
      if (logProgress) {
        helpers.logWithTimestamp(`Re-processing complete. ${currentUnknownFields.length} fields remain unclassified.`, chalk.blue);
      }
      
      // Check if we're making progress
      if (currentUnknownFields.length >= previousUnknownCount) {
        if (logProgress) {
          helpers.logWithTimestamp('No improvement in classification, stopping iterations.', chalk.yellow);
        }
        break;
      }
      
      previousUnknownCount = currentUnknownFields.length;
    }
    
    // Calculate improvement
    const improvedFields = initialUnknownCount - currentUnknownFields.length;
    
    if (logProgress) {
      if (currentUnknownFields.length === 0) {
        helpers.logWithTimestamp('Success: All fields have been categorized!', chalk.green);
      } else {
        helpers.logWithTimestamp(`Partial success: ${currentUnknownFields.length} fields could not be categorized after ${iteration} iterations.`, chalk.yellow);
      }
      
      helpers.logWithTimestamp(`Generated ${totalGeneratedRules} new rules during the self-healing process.`, chalk.blue);
      helpers.logWithTimestamp(`Improved classification for ${improvedFields} fields (${(improvedFields / initialUnknownCount * 100).toFixed(2)}%).`, chalk.blue);
    }
    
    return {
      success: currentUnknownFields.length === 0,
      iterations: iteration,
      remainingUnknown: currentUnknownFields,
      generatedRules: totalGeneratedRules,
      improvedFields,
      ruleCandidates: latestRuleCandidates
    };
  }
  
  /**
   * Apply advanced categorization techniques to unknown fields
   */
  protected applyEnhancedCategorization(
    unknownFields: CategorizedField[],
    engine: RuleEngine
  ): { recategorized: CategorizedField[]; corrections: number } {
    // Implementation would use enhanced techniques from the EnhancedSelfHealing module
    const recategorized: CategorizedField[] = [];
    
    // Process each unknown field with enhanced techniques
    for (const field of unknownFields) {
      // Skip fields that already have a section assigned
      if (field.section && field.section > 0) continue;
      
      // Try enhanced categorization techniques
      
      // 1. Technique: Multi-dimensional categorization
      const enhancedResult = enhancedMultiDimensionalCategorization(field);
      if (enhancedResult && enhancedResult.section && enhancedResult.section > 0) {
        field.section = enhancedResult.section;
        field.confidence = enhancedResult.confidence || 0.85;
        recategorized.push(field);
        continue;
      }
      
      // 2. Technique: Extract section info from name
      const extractedSection = extractSectionInfoFromName(field.name || '');
      if (extractedSection && extractedSection > 0) {
        field.section = extractedSection;
        field.confidence = 0.8;
        recategorized.push(field);
        continue;
      }
      
      // 3. Technique: Identify section by page
      if (field.page && field.page > 0) {
        const pageResult = identifySectionByPageWithConfidence(field.page);
        if (pageResult.section > 0 && pageResult.confidence >= 0.7) {
          field.section = pageResult.section;
          field.confidence = pageResult.confidence;
          recategorized.push(field);
          continue;
        }
      }
      
      // 4. Technique: Detect section from field value
      if (field.value) {
        const valueSection = detectSectionFromFieldValue(field.value);
        if (valueSection && valueSection > 0) {
          field.section = valueSection;
          field.confidence = 0.75;
          recategorized.push(field);
          continue;
        }
      }
      
      // 5. Technique: Analyze spatial information
      if (field.rect && field.page) {
        const spatialSectionScore = getPositionalSectionScore(field);
        if (spatialSectionScore.section > 0 && spatialSectionScore.confidence >= 0.7) {
          field.section = spatialSectionScore.section;
          field.confidence = spatialSectionScore.confidence;
          recategorized.push(field);
          continue;
        }
      }
    }
    
    return {
      recategorized,
      corrections: recategorized.length
    };
  }
  
  /**
   * Apply a single step of the self-healing process
   */
  protected async applySelfHealingStep(
    ruleEngine: RuleEngine,
    sectionFields: Record<string, CategorizedField[]>,
    referenceCounts: Record<number, number>
  ): Promise<SelfHealingStepResult> {
    // Clone section fields to avoid modifying original
    const workingSectionFields = helpers.deepClone(sectionFields);
    
    // Calculate initial alignment score
    const initialDeviations = this.calculateDeviations(
      workingSectionFields, 
      referenceCounts,
      this.deviationThreshold
    );
    
    const initialAlignmentScore = this.calculateAlignmentScore(initialDeviations);
    
    // Generate rule candidates by analyzing patterns
    // ...
    
    // Apply corrections based on patterns, spatial analysis, and deviations
    // ...
    
    // Placeholder implementation returning the input
    // In a real implementation, this would analyze and correct miscategorized fields
    return {
      sectionFields: workingSectionFields,
      corrections: 0,
      alignmentImprovement: 0,
      alignmentScore: initialAlignmentScore,
      deviationInfo: initialDeviations,
      rulesGenerated: 0
    };
  }
  
  /**
   * Calculate the alignment score based on deviations
   */
  protected calculateAlignmentScore(deviations: SectionDeviation[]): number {
    if (deviations.length === 0) return 100;
    
    // Count sections within threshold
    const sectionsWithinThreshold = deviations.filter(d => !d.isSignificant).length;
    
    // Calculate alignment percentage
    return (sectionsWithinThreshold / deviations.length) * 100;
  }
  
  /**
   * Calculate deviations between actual and expected section counts
   */
  protected calculateDeviations(
    sectionFields: Record<string, CategorizedField[]>,
    referenceCounts: Record<number, number>,
    threshold = 0.2
  ): SectionDeviation[] {
    const deviations: SectionDeviation[] = [];
    
    for (const [sectionKey, expectedCount] of Object.entries(referenceCounts)) {
      const sectionNumber = parseInt(sectionKey, 10);
      if (isNaN(sectionNumber) || expectedCount <= 0) continue;
      
      const actualCount = (sectionFields[sectionKey] || []).length;
      const deviation = actualCount - expectedCount;
      const deviationPercent = Math.abs(deviation) / expectedCount;
      
      // Determine if the deviation is significant
      const isSignificant = deviationPercent > threshold;
      
      // Determine if correction should be attempted
      const shouldCorrect = isSignificant && (
        // Undersized sections should be filled
        deviation < 0 ||
        // Oversized sections should be reduced only if significantly oversized
        (deviation > 0 && deviationPercent > threshold * 1.5)
      );
      
      deviations.push({
        section: sectionNumber,
        actual: actualCount,
        expected: expectedCount,
        deviation,
        deviationPercent,
        percentage: deviationPercent * 100,
        isSignificant,
        shouldCorrect
      });
    }
    
    return deviations;
  }
  
  /**
   * Count the number of fields that are likely miscategorized
   */
  protected countMiscategorizedFields(deviations: SectionDeviation[]): number {
    return deviations
      .filter(d => d.shouldCorrect)
      .reduce((total, d) => total + Math.abs(d.deviation), 0);
  }
  
  /**
   * Recategorize unknown fields using the rule engine
   */
  protected async recategorizeUnknownFields(
    ruleEngine: RuleEngine, 
    fields: CategorizedField[]
  ): Promise<CategorizedField[]> {
    // Apply rules to all fields
    const stillUnknown: CategorizedField[] = [];
    
    for (const field of fields) {
      // Skip fields that already have a section assigned
      if (field.section && field.section > 0) continue;
      
      // Try to categorize with rule engine
      const result = ruleEngine.categorizeField(field);
      
      // If categorization worked, update the field
      if (result && typeof result === 'object' && result.section && result.section > 0) {
        Object.assign(field, result);
      } else {
        // Still uncategorized
        stillUnknown.push(field);
      }
    }
    
    return stillUnknown;
  }
  
  /**
   * Get all fields from section fields
   */
  protected getAllFieldsFromSections(sectionFields: Record<string, CategorizedField[]>): CategorizedField[] {
    const allFields: CategorizedField[] = [];
    
    for (const [section, fields] of Object.entries(sectionFields)) {
      allFields.push(...fields);
    }
    
    return allFields;
  }
  
  /**
   * Reorganize fields by their section property
   */
  protected reorganizeFieldsBySections(fields: CategorizedField[]): Record<string, CategorizedField[]> {
    const result: Record<string, CategorizedField[]> = {};
    
    for (const field of fields) {
      const section = String(field.section || 0);
      
      if (!result[section]) {
        result[section] = [];
      }
      
      result[section].push(field);
    }
    
    return result;
  }
  
  /**
   * Save section data to a file
   */
  protected async saveSectionData(
    sectionFields: Record<string, CategorizedField[]>, 
    outputPath: string
  ): Promise<void> {
    try {
      await helpers.saveJsonToFile(outputPath, sectionFields);
      sectionDataCache = helpers.deepClone(sectionFields);
    } catch (error) {
      console.error('Error saving section data:', error);
    }
  }
  
  /**
   * Calculate alignment percentage between actual and expected counts
   */
  public calculateAlignmentPercentage(
    sectionFields: Record<string, CategorizedField[]>,
    referenceCounts: Record<number, number>
  ): number {
    // Get deviations
    const deviations = this.calculateDeviations(
      sectionFields, 
      referenceCounts,
      this.deviationThreshold
    );
    
    // Calculate alignment score
    return this.calculateAlignmentScore(deviations);
  }
}

// Export a singleton instance
export const consolidatedSelfHealingManager = new ConsolidatedSelfHealingManager();

// Export default function for simpler usage
export async function runConsolidatedSelfHealing(
  ruleEngine: RuleEngine,
  sectionFields: Record<string, CategorizedField[]>,
  referenceCounts: Record<number, number>,
  outputPath?: string,
  deviationThreshold?: number
): Promise<SelfHealingResult> {
  const manager = deviationThreshold ? 
    new ConsolidatedSelfHealingManager(5, deviationThreshold) : 
    consolidatedSelfHealingManager;
  
  return manager.runSelfHealing(ruleEngine, sectionFields, referenceCounts, outputPath);
} 