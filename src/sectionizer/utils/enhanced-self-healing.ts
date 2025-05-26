/**
 * Enhanced Self-Healing Module
 * 
 * This module applies advanced rules and heuristics to improve the categorization
 * of fields that couldn't be properly assigned using standard rules.
 */

import fs from 'fs';
import path from 'path';
import { RuleEngine } from '../engine.js';
import type { CategorizedField } from './extractFieldsBySection.js';
import { 
  enhancedMultiDimensionalCategorization, 
  extractSectionInfoFromName, 
  identifySectionByPage,
  identifySectionByPageWithConfidence,
  detectSectionFromFieldValue,
  sectionClassifications,
  refinedSectionPageRanges
} from './fieldParsing.js';
import { 
  predictSectionBySpatialProximity, 
  calculateSpatialConfidenceBoost, 
  extractSpatialInfo,
  getPositionalSectionScore,
  clusterFieldsSpatially,
  getSpatialNeighbors
} from './spatialAnalysis.js';
import { sectionFieldPatterns } from './field-clusterer.js';

/**
 * Interface for deviation information
 */
interface DeviationInfo {
  section: number;
  expected: number;
  actual: number;
  deviation: number;
  percentage: number;
  isSignificant: boolean;
  shouldCorrect: boolean;
}

/**
 * Interface for section correction information
 */
interface SectionCorrection {
  from: string;
  to: string;
  count: number;
}

/**
 * Interface for enhanced self-healing result
 */
export interface EnhancedSelfHealingResult {
  success: boolean;
  iterations: number;
  corrections: number;
  rulesGenerated: number;
  finalSectionFields: Record<string, CategorizedField[]>;
  deviations: any[];
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
  deviationInfo: any; // relaxed type to avoid mismatch
  rulesGenerated: number;
}

/**
 * EnhancedSelfHealing class
 * 
 * This class provides advanced rules and heuristics to improve the categorization
 * of fields that couldn't be properly assigned using standard rules.
 */
export class EnhancedSelfHealer {
  // Cache existing section data between runs
  private static existingSectionData: Record<string, CategorizedField[]> | null = null;
  
  // Critical sections that must be present
  private readonly criticalSections: number[] = [13];
  
  /**
   * Constructor for EnhancedSelfHealer
   */
  constructor() {}

  /**
   * Check if the categorized fields now match the expected counts for each section
   * 
   * @param sectionFields Current categorized fields by section
   * @param referenceCounts Expected field counts by section
   * @param threshold Tolerance threshold (0.0-1.0) for deviation
   * @returns Boolean indicating if counts are aligned
   */
  public verifyFieldCountAlignment(
    sectionFields: Record<string, CategorizedField[]>,
    referenceCounts: Record<number, number>,
    threshold: number = 0.3  // Use stricter threshold (changed from 0.7)
  ): boolean {
    // Check alignment between actual and expected counts
    let aligned = true;
    let totalDeviation = 0;
    let totalExpected = 0;
    let criticalSectionsAligned = true;
    
    // Define critical sections that must be aligned better than others
    const criticalSections = [1, 2, 4, 5, 8, 13, 14, 15, 17, 21, 27];
    
    // Track all deviations for logging
    const deviations: {section: number, expected: number, actual: number, deviation: number, percentage: number}[] = [];
    
    // Calculate how many sections are "close enough"
    let sectionsWithinThreshold = 0;
    let totalSections = 0;
    
    // Track extreme deviations (>500%)
    let hasExtremeDeviations = false;
    
    // Check if section 0 (unknown) still has fields
    const unknownFieldCount = sectionFields["0"]?.length || 0;
    
    for (const [sectionKey, expectedCount] of Object.entries(referenceCounts)) {
      const sectionNumber = parseInt(sectionKey, 10);
      if (isNaN(sectionNumber) || expectedCount <= 0) continue;
      
      totalSections++;
      const actualCount = (sectionFields[sectionKey] || []).length;
      const deviation = Math.abs(actualCount - expectedCount);
      const deviationPercentage = expectedCount > 0 ? deviation / expectedCount : 1;
      
      // Check for extreme deviations (>500%)
      if (deviationPercentage > 5.0) {
        hasExtremeDeviations = true;
      }
      
      // Add to deviations array for logging
      deviations.push({
        section: sectionNumber,
        expected: expectedCount,
        actual: actualCount,
        deviation: actualCount - expectedCount, // Use signed value
        percentage: deviationPercentage * 100
      });
      
      // Check if this section is within threshold
      if (deviationPercentage <= threshold) {
        sectionsWithinThreshold++;
      } else {
        aligned = false;
        
        // Track if critical sections are not aligned
        if (criticalSections.includes(sectionNumber) && deviationPercentage > threshold * 0.8) {
          criticalSectionsAligned = false;
        }
      }
      
      totalDeviation += deviation;
      totalExpected += expectedCount;
    }
    
    // Calculate overall alignment percentage
    const overallAlignmentPercentage = totalSections > 0 ? (sectionsWithinThreshold / totalSections) * 100 : 0;
    const overallDeviationPercentage = totalExpected > 0 ? (totalDeviation / totalExpected) * 100 : 100;
    
    console.log(`Overall alignment: ${overallAlignmentPercentage.toFixed(2)}% of sections within threshold`);
    console.log(`Overall deviation: ${overallDeviationPercentage.toFixed(2)}% of expected fields`);
    console.log(`Uncategorized fields remaining: ${unknownFieldCount}`);
    
    // Log all deviations sorted by percentage (highest first)
    console.log("\nSection Deviations:");
    deviations
      .sort((a, b) => b.percentage - a.percentage)
      .forEach(d => {
        const sign = d.deviation > 0 ? "+" : "";
        console.log(`  Section ${d.section}: ${d.actual} fields (expected ${d.expected}, ${sign}${d.deviation}, ${d.percentage.toFixed(2)}%)`);
      });
    
    // Determine if we're "good enough" for real-world usage
    // Modified to be stricter and never consider "good enough" if there are extreme deviations
    // or if section 0 still has a significant number of uncategorized fields
    const maxAcceptableUnknownFields = Math.min(20, Math.ceil(totalExpected * 0.01)); // Maximum 1% of total expected fields or 20 fields
    const isUnknownFieldsAcceptable = unknownFieldCount <= maxAcceptableUnknownFields;
    
    // Never consider alignment "good enough" if section 0 still has a significant number of fields
    const isGoodEnough = 
      !hasExtremeDeviations && // Never "good enough" if there are extreme deviations
      isUnknownFieldsAcceptable && // Required: few or no fields in section 0
      ((overallAlignmentPercentage >= 75) || // 75% of sections are within threshold
      (criticalSectionsAligned && overallAlignmentPercentage >= 60) || // Critical sections aligned and 60% of all sections
      (overallDeviationPercentage <= 20)); // Overall deviation is less than 20%
    
    console.log(`\nAlignment check ${isGoodEnough ? 'PASSED' : 'FAILED'}: ${isGoodEnough ? 'Good enough for output generation' : 'More correction needed'}`);
    if (!isUnknownFieldsAcceptable) {
      console.log(`Too many uncategorized fields (${unknownFieldCount}). Goal: ${maxAcceptableUnknownFields} or fewer.`);
    }
    
    return isGoodEnough;
  }

  /**
   * Check if all sections are aligned with reference counts within threshold
   */
  public allSectionsAligned(
    sectionFields: Record<string, CategorizedField[]>,
    referenceCounts: Record<number, number>,
    deviationThreshold: number = 0.2
  ): boolean {
    // Get deviation info
    const deviationInfo = this.evaluateSectionDeviations(sectionFields, referenceCounts, deviationThreshold);
    
    // Check if all essential sections are present
    for (const section of this.criticalSections) {
      if (!sectionFields[section.toString()] || sectionFields[section.toString()].length === 0) {
        console.warn(`Missing critical section ${section}`);
        return false;
      }
    }
    
    // Calculate the percentage of sections that are aligned
    const alignmentPercentage = deviationInfo.alignmentScore;
    
    // Consider aligned if at least 80% of sections are within threshold
    return alignmentPercentage >= 80;
  }

  /**
   * Calculate the overall section alignment percentage
   *
   * @param sectionFields Current categorized fields by section
   * @param referenceCounts Expected field counts by section
   * @returns Percentage of sections that are within threshold
   */
  public calculateAlignmentPercentage(
    sectionFields: Record<string, CategorizedField[]>,
    referenceCounts: Record<number, number>
  ): number {
    if (!referenceCounts || Object.keys(referenceCounts).length === 0) {
      return NaN; // Cannot calculate without reference counts
    }
    
    let totalExpected = 0;
    let totalDeviation = 0;
    
    Object.entries(referenceCounts).forEach(([sectionNumStr, expectedCount]) => {
      const sectionNum = parseInt(sectionNumStr, 10);
      if (!isNaN(sectionNum) && sectionNum > 0 && expectedCount > 0) {
        const actualCount = sectionFields[sectionNum.toString()]?.length || 0;
        const deviation = Math.abs(actualCount - expectedCount);
        
        totalExpected += expectedCount;
        totalDeviation += deviation;
      }
    });
    
    if (totalExpected === 0) return 0;
    return 100 - (totalDeviation / totalExpected * 100);
  }

  /**
   * Load existing section data if available
   */
  public loadExistingSectionData(outputPath: string): Record<string, CategorizedField[]> | null {
    // Return cached data if available
    if (EnhancedSelfHealer.existingSectionData !== null) {
      return EnhancedSelfHealer.existingSectionData;
    }
    
    // Try to load from the section-data directory
    const sectionDataPath = path.join(process.cwd(), 'src', 'section-data', 'section-data.json');
    
    try {
      if (fs.existsSync(sectionDataPath)) {
        console.log(`Found existing section data at ${sectionDataPath}, loading...`);
        const data = fs.readFileSync(sectionDataPath, 'utf8');
        EnhancedSelfHealer.existingSectionData = JSON.parse(data);
        console.log(`Successfully loaded section data with ${EnhancedSelfHealer.existingSectionData ? Object.keys(EnhancedSelfHealer.existingSectionData).length : 0} sections`);
        return EnhancedSelfHealer.existingSectionData;
      }
    } catch (error) {
      console.error(`Error loading existing section data: ${error}`);
    }
    
    return null;
  }

  /**
   * Save intermediate section data for future runs
   */
  public saveSectionData(
    sectionFields: Record<string, CategorizedField[]>, 
    outputPath: string
  ): void {
    try {
      // Create the section-data directory if it doesn't exist
      const sectionDataDir = path.join(process.cwd(), 'src', 'section-data');
      if (!fs.existsSync(sectionDataDir)) {
        fs.mkdirSync(sectionDataDir, { recursive: true });
      }
      
      // Save the section data for future runs
      const sectionDataPath = path.join(sectionDataDir, 'section-data.json');
      fs.writeFileSync(sectionDataPath, JSON.stringify(sectionFields, null, 2));
      console.log(`Saved final intermediate section data to ${sectionDataPath}`);
      
      // Update the cache
      EnhancedSelfHealer.existingSectionData = { ...sectionFields };
    } catch (error) {
      console.error(`Error saving section data: ${error}`);
    }
  }

  /**
   * Fix the getStringValue function to handle null safely
   */
  private getStringValue(value: any): string {
    if (typeof value === 'string') {
      return value;
    } else if (Array.isArray(value) && value.length > 0) {
      return String(value[0]);
    } else if (value !== null && value !== undefined) {
      return String(value);
    }
    return "";  // Return empty string instead of null
  }

  /**
   * Evaluate if section deviations are within acceptable thresholds
   */
  public evaluateSectionDeviations(
    sectionFields: Record<string, CategorizedField[]>,
    referenceCounts: Record<number, number>,
    deviationThreshold: number = 0.2
  ): { 
    deviations: DeviationInfo[];
    alignmentScore: number; 
    sectionsAligned: number;
    totalValidSections: number;
    missingSections: number[];
    oversizedSections: number[];
  } {
    // Collect deviation info
    const deviations: DeviationInfo[] = [];
    let totalValidSections = 0;
    let sectionsWithinThreshold = 0;
    
    // Get a list of completely empty sections that should have fields
    const missingSections: number[] = [];
    const oversizedSections: number[] = [];
    
    // Check each section with a reference count
    for (const [sectionIdStr, expectedCount] of Object.entries(referenceCounts)) {
      const sectionId = parseInt(sectionIdStr, 10);
      if (isNaN(sectionId)) continue;
      
      // Special handling for section 0 (uncategorized fields)
      // We may want uncategorized fields, so only calculate deviation if we expect none
      const isUncategorizedSection = sectionId === 0;
      
      const sectionArray = sectionFields[sectionIdStr] || [];
      const actualCount = sectionArray.length;
      
      // Track completely missing sections (that should have fields)
      if (expectedCount > 0 && actualCount === 0) {
        missingSections.push(sectionId);
      }
      
      // Track significantly oversized sections
      if (expectedCount > 0 && actualCount > expectedCount * 1.5) {
        oversizedSections.push(sectionId);
      }
      
      const deviation = Math.abs(actualCount - expectedCount);
      const percentage = expectedCount > 0 ? deviation / expectedCount : 0;
      
      // For non-uncategorized sections, we always count them
      if (!isUncategorizedSection) {
        totalValidSections++;
        
        if (percentage <= deviationThreshold) {
          sectionsWithinThreshold++;
        }
      } 
      // For uncategorized section, only count it if we expect 0 or fewer uncategorized fields than we have
      else if (expectedCount === 0 || actualCount > expectedCount) {
        totalValidSections++;
        
        if (percentage <= deviationThreshold) {
          sectionsWithinThreshold++;
        }
      }
      
      // Calculate if this deviation is significant and should be corrected
      // Use variable thresholds for different sections
      const sectionThreshold = this.getSectionSpecificThreshold(sectionId, deviationThreshold);
      const isSignificant = percentage > sectionThreshold;
      
      // Determine if this section should be corrected, with special priority for sections 8 and 27
      const isHighPrioritySection = [8, 27, 9, 13].includes(sectionId);
      const shouldCorrect = isSignificant && 
        // Don't try to force fields into categorized sections if they should be in section 0
        !(isUncategorizedSection && actualCount <= expectedCount) && 
        // Give higher priority to completely missing sections and high-priority sections
        (isHighPrioritySection || actualCount === 0 || actualCount < expectedCount * 0.7);
      
      deviations.push({
        section: sectionId,
        expected: expectedCount,
        actual: actualCount,
        deviation,
        percentage,
        isSignificant,
        shouldCorrect
      });
    }
    
    // Calculate alignment score (percentage of aligned sections)
    const alignmentScore = totalValidSections > 0
      ? (sectionsWithinThreshold / totalValidSections) * 100
      : 0;
    
    // Add missing and oversized section information to the result for use by other functions
    return {
      deviations,
      alignmentScore,
      sectionsAligned: sectionsWithinThreshold,
      totalValidSections,
      missingSections,
      oversizedSections
    } as any;
  }

  /**
   * Get section-specific threshold to account for sections needing tighter or looser validation
   */
  private getSectionSpecificThreshold(sectionId: number, defaultThreshold: number): number {
    // High-priority sections with stricter alignment requirements
    if ([1, 2, 3, 4, 8, 27].includes(sectionId)) {
      return defaultThreshold * 0.5; // Stricter threshold
    }
    
    // Medium-priority sections with normal threshold
    if ([5, 9, 13, 17, 18, 20, 21].includes(sectionId)) {
      return defaultThreshold;
    }
    
    // Low-priority sections with more lenient threshold
    return defaultThreshold * 1.5; // More lenient
  }

  /**
   * Get detailed information about deviations between actual and expected field counts
   * @param sectionFields Current section fields
   * @param referenceCounts Expected field counts by section
   * @returns Array of deviation information objects
   */
  public getDeviationInfo(
    sectionFields: Record<string, CategorizedField[]>,
    referenceCounts: Record<number, number>
  ): Array<{section: number, expected: number, actual: number, deviation: number, percentage: number}> {
    const deviations: Array<{section: number, expected: number, actual: number, deviation: number, percentage: number}> = [];
    
    // Check each section with a reference count
    for (const [sectionKey, expectedCount] of Object.entries(referenceCounts)) {
      const sectionNumber = parseInt(sectionKey, 10);
      if (isNaN(sectionNumber) || sectionNumber === 0 || expectedCount <= 0) continue;
      
      const actualCount = (sectionFields[sectionKey] || []).length;
      const deviation = actualCount - expectedCount;
      const percentage = expectedCount > 0 ? (deviation / expectedCount) * 100 : 0;
      
      // Only add if there's a deviation
      if (deviation !== 0) {
        deviations.push({
          section: sectionNumber,
          expected: expectedCount,
          actual: actualCount,
          deviation,
          percentage
        });
      }
    }
    
    // Sort by deviation percentage (most significant first)
    deviations.sort((a, b) => Math.abs(b.percentage) - Math.abs(a.percentage));
    
    return deviations;
  }
  
  /**
   * Extract a simplified pattern from field name for grouping
   */
  private getFieldPattern(fieldName: string): string {
    // Remove indexes and normalize
    return fieldName
      .replace(/\[\d+\]/g, '[]')
      .replace(/\d{1,2}(?!\d)/g, 'N')
      .replace(/\d+/g, 'N')
      .split('.')
      .slice(0, 2)
      .join('.');
  }
  
  /**
   * Try to determine potential section from a field name pattern
   */
  private getPotentialSectionFromPattern(pattern: string): number {
    // Look for section indicators in the pattern
    const sectionMatch = pattern.match(/[Ss]ection(\d+)|[Ss](\d+)[._]/);
    if (sectionMatch) {
      const section = parseInt(sectionMatch[1] || sectionMatch[2], 10);
      if (section >= 1 && section <= 30) {
        return section;
      }
    }
    
    // Check for special section patterns
    if (/employmentactivit|employment[._]/i.test(pattern)) {
      return 13; // Employment activities
    }
    if (/residence|lived|address[._]/i.test(pattern)) {
      return 11; // Where you lived
    }
    if (/education|school/i.test(pattern)) {
      return 12; // Education
    }
    if (/relative|family/i.test(pattern)) {
      return 18; // Relatives
    }
    if (/citizen/i.test(pattern)) {
      return 9; // Citizenship
    }
    if (/passport/i.test(pattern)) {
      return 8; // Passport info
    }
    if (/contact/i.test(pattern)) {
      return 7; // Contact info
    }
    if (/druguse|drug[._]/i.test(pattern)) {
      return 23; // Drug use
    }
    if (/alcohol/i.test(pattern)) {
      return 24; // Alcohol use
    }
    if (/police|criminal|crime/i.test(pattern)) {
      return 22; // Police record
    }
    if (/financial|finance|bank/i.test(pattern)) {
      return 26; // Financial record
    }
    if (/military/i.test(pattern)) {
      return 15; // Military history
    }
    if (/foreign[._]?contact/i.test(pattern)) {
      return 19; // Foreign contacts
    }
    
    return 0; // No section identified
  }
  
  /**
   * Ensure critical sections exist in the section fields
   */
  public ensureCriticalSections(
    sectionFields: Record<string, CategorizedField[]>,
    criticalSections: number[] = this.criticalSections
  ): Record<string, CategorizedField[]> {
    const result = { ...sectionFields };
    
    for (const section of criticalSections) {
      const sectionKey = section.toString();
      
      // If the section doesn't exist or is empty, create a placeholder
      if (!result[sectionKey] || result[sectionKey].length === 0) {
        console.log(`Creating placeholder for critical section ${section}`);
        
        // If section doesn't exist at all, create it
        if (!result[sectionKey]) {
          result[sectionKey] = [];
        }
        
        // Create a placeholder field for section 13 if it's missing
        if (section === 13 && result[sectionKey].length === 0) {
          const placeholderField: CategorizedField = {
            id: `placeholder-section-${section}`,
            name: `section${section}Placeholder`,
            page: 65, // Typical page for section 13
            section: section,
            confidence: 1.0,
            value: '',
            label: `Section ${section} Placeholder`
          };
          
          result[sectionKey].push(placeholderField);
        }
      }
    }
    
    return result;
  }
  
  /**
   * Check if all critical sections exist in the data
   */
  public criticalSectionsExist(
    sectionFields: Record<string, CategorizedField[]>,
    criticalSections: number[] = this.criticalSections
  ): boolean {
    for (const section of criticalSections) {
      const sectionKey = section.toString();
      if (!sectionFields[sectionKey] || sectionFields[sectionKey].length === 0) {
        console.warn(`Missing critical section ${section}`);
        return false;
      }
    }
    return true;
  }
  
  /**
   * Trim oversized sections to expected counts just before saving
   */
  public trimOversizedSections(
    sectionFields: Record<string, CategorizedField[]>,
    referenceCounts: Record<number, number>
  ): void {
    Object.entries(referenceCounts).forEach(([sectionKey, expected]) => {
      const expectedCount = expected as number;
      if (expectedCount <= 0) return;
      const actualArr = sectionFields[sectionKey] || [];
      if (actualArr.length > expectedCount) {
        // Sort by confidence (lowest first) and move extras to section 0
        const extras = actualArr.sort((a,b)=>a.confidence-b.confidence).slice(0, actualArr.length - expectedCount);
        // Remove extras from section
        sectionFields[sectionKey] = actualArr.slice(actualArr.length - expectedCount);
        if (!sectionFields['0']) sectionFields['0'] = [];
        extras.forEach(f => {
          f.section = 0;
          f.confidence = 0;
          sectionFields['0'].push(f);
        });
        console.log(`Trimmed ${extras.length} excess fields from section ${sectionKey}`);
      }
    });
  }
} 