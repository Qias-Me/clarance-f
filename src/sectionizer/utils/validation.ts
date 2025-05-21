/**
 * Validation Utilities
 * 
 * Consolidated functions for data validation across the sectionizer project.
 * This replaces multiple implementations found throughout the codebase.
 */

import * as fs from 'fs';
import * as path from 'path';
import { expectedFieldCounts } from './field-clusterer.js';

/**
 * Interface for basic sectioned field
 */
export interface ValidationSectionedField {
  section: number;
}

/**
 * Section deviation information
 */
export interface SectionDeviation {
  section: number;       // Section number
  expected: number;      // Expected field count
  actual: number;        // Actual field count
  deviation: number;     // Difference (actual - expected)
  percentage: number;    // Percentage deviation
  isCritical?: boolean;  // Indicates if this section is critical/mandatory
}

/**
 * Result of section count validation
 */
export interface SectionValidationResult {
  success: boolean;      // Overall validation result
  deviations: SectionDeviation[];  // Detailed deviations by section
  missingMandatorySections: number[];  // Sections that are required but missing
  undersizedSections: number[];    // Sections with too few fields
  oversizedSections: number[];     // Sections with too many fields
  message: string;       // Human-readable result message
}

/**
 * Options for section validation
 */
export interface ValidationOptions {
  maxDeviationPercent?: number;  // Maximum acceptable percentage deviation
  strict?: boolean;              // Use stricter validation thresholds
  ignoreSections?: number[];     // Sections to exclude from validation
  ignoreOverflowSections?: boolean; // Whether to ignore high-numbered overflow sections
  mandatorySections?: number[];  // Sections that must be present
}

// Default critical/mandatory sections that should always be present
export const DEFAULT_MANDATORY_SECTIONS = [
  1, 2, 5, 13, 17, 19
];

/**
 * Validate section counts against reference counts
 * 
 * @param sectionFields Map of sections to fields
 * @param referenceCounts Reference counts for validation
 * @param options Validation options
 * @returns Validation result object
 */
export function validateSectionCounts<T extends ValidationSectionedField>(
  sectionFields: Record<string | number, T[]>,
  referenceCounts: Record<number, { fields: number; entries: number; subsections: number; }> = expectedFieldCounts,
  options: ValidationOptions = {}
): SectionValidationResult {
  // Default options
  const {
    maxDeviationPercent = options.strict ? 10 : 30,
    ignoreOverflowSections = !options.strict,
    ignoreSections = []
  } = options;
  
  // Initialize result
  const result: SectionValidationResult = {
    success: true,
    deviations: [],
    missingMandatorySections: [],
    oversizedSections: [],
    undersizedSections: [],
    message: ""
  };
  
  // Keep track of numbers to identify any important missing sections
  const missingNumbers: number[] = [];
  const mandatorySections = options.mandatorySections || DEFAULT_MANDATORY_SECTIONS;
  
  // Track non-zero sections and their counts
  const sectionCounts: Record<number, number> = {};
  
  // Convert string keys to numbers and build counts
  for (const [key, fields] of Object.entries(sectionFields)) {
    const sectionNum = parseInt(key, 10);
    if (!isNaN(sectionNum)) {
      sectionCounts[sectionNum] = fields.length;
    }
  }
  
  // Check for missing sections
  for (const section of mandatorySections) {
    if (!(section in sectionCounts) || sectionCounts[section] === 0) {
      result.missingMandatorySections.push(section);
      result.success = false;
    }
  }
  
  // Calculate deviations from expected counts
  for (const [sectionStr, expected] of Object.entries(referenceCounts)) {
    const section = parseInt(sectionStr, 10);
    
    // Skip section 0 (uncategorized)
    if (section === 0 || ignoreSections.includes(section)) {
      continue;
    }
    
    const expectedCount = expected.fields; // Use fields count for comparison
    const actual = sectionCounts[section] || 0;
    
    // Skip sections with no expectation
    if (expectedCount === 0) {
      continue;
    }
    
    const deviation = actual - expectedCount;
    const deviationPercent = Math.abs(deviation) / expectedCount * 100;
    
    // Record this section's deviation
    result.deviations.push({
        section,
        expected: expectedCount,
      actual,
        deviation,
      percentage: deviationPercent
    });
    
    // Check if this deviation is too large
    if (deviationPercent > maxDeviationPercent) {
      // For overflow sections, we might be more lenient
      if (section >= 20 && ignoreOverflowSections) {
        continue;
      }
      
      // Otherwise, mark as problem section
      result.success = false;
      
      if (deviation < 0) {
        result.undersizedSections.push(section);
      } else {
        result.oversizedSections.push(section);
      }
    }
  }
  
  // Build result message
  if (result.success) {
    result.message = "Section counts validation passed successfully.";
  } else {
    const issues: string[] = [];
    
    if (result.missingMandatorySections.length > 0) {
      issues.push(`Missing mandatory sections: ${result.missingMandatorySections.join(", ")}`);
    }
    
    if (result.undersizedSections.length > 0) {
      issues.push(`Undersized sections: ${result.undersizedSections.join(", ")}`);
    }
    
    if (result.oversizedSections.length > 0) {
      issues.push(`Oversized sections: ${result.oversizedSections.join(", ")}`);
    }
    
    result.message = `Section counts validation failed: ${issues.join("; ")}`;
  }
  
  return result;
}

/**
 * Identifies sections with the most significant count problems
 * 
 * @param validationResult Result from validateSectionCounts
 * @param maxProblems Maximum number of problems to return
 * @returns Array of the most problematic section numbers
 */
export function identifyProblemSections(
  validationResult: SectionValidationResult,
  maxProblems: number = 5
): number[] {
  // First prioritize critical sections with problems
  const criticalProblems = validationResult.deviations
    .filter(dev => dev.isCritical && dev.percentage > 30)
    .map(dev => dev.section);
    
  // Then add sections with extreme deviations (>100%)
  const extremeDeviations = validationResult.deviations
    .filter(dev => dev.percentage > 100 && !criticalProblems.includes(dev.section))
    .map(dev => dev.section);
  
  // Then add remaining sections with highest deviations
  const remainingProblems = validationResult.deviations
    .filter(dev => !criticalProblems.includes(dev.section) && !extremeDeviations.includes(dev.section))
    .map(dev => dev.section);
  
  // Combine and limit to maxProblems
  return [...criticalProblems, ...extremeDeviations, ...remainingProblems].slice(0, maxProblems);
}

/**
 * Load reference counts from file or use defaults
 * 
 * @param filePath Optional path to JSON file with reference counts
 * @returns Reference counts object
 */
export function loadReferenceCounts(filePath?: string): Record<number, { fields: number; entries: number; subsections: number; }> {
  if (!filePath) {
    return expectedFieldCounts;
  }
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      
      // Convert string keys to numbers
      const result: Record<number, { fields: number; entries: number; subsections: number; }> = {};
      for (const [key, value] of Object.entries(parsed)) {
        const numKey = parseInt(key, 10);
        if (!isNaN(numKey) && 
            typeof value === 'object' && 
            value !== null &&
            typeof (value as any).fields === 'number' &&
            typeof (value as any).entries === 'number' &&
            typeof (value as any).subsections === 'number') {
          result[numKey] = value as { fields: number; entries: number; subsections: number; };
        }
      }
      
      return result;
    }
  } catch (error) {
    console.error(`Error loading reference counts: ${error}`);
  }
  
  return expectedFieldCounts;
}

/**
 * Validate that a PDF file exists and is accessible
 * 
 * @param pdfPath Path to the PDF file
 * @returns Promise that resolves to true if valid, or rejects with error
 */
export async function validatePdf(pdfPath: string): Promise<boolean> {
  try {
    const fileHandle = await fs.promises.open(pdfPath, 'r');
    await fileHandle.close();
    return true;
  } catch (error) {
    const errorMessage = `Invalid PDF file: ${pdfPath}. ${error}`;
    throw new Error(errorMessage);
  }
} 