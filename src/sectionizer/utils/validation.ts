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
 * Fields that have section information for validation
 */
export interface ValidationSectionedField {
  name: string;        // Field name
  section: number;     // Section number
  subsection?: string; // Optional subsection identifier
  entry?: number;      // Optional entry number
}

/**
 * Detailed information about deviation for a section
 */
export interface SectionDeviation {
  section: number;         // Section number
  expected: number;        // Expected field count
  actual: number;          // Actual field count
  deviation: number;       // Difference (actual - expected)
  percentage: number;      // Deviation as percentage of expected
  isCritical?: boolean;    // Indicates if this section is critical/mandatory
  // Adding subsection and entry information
  expectedSubsections?: number; // Expected subsection count
  actualSubsections?: number;   // Actual subsection count 
  subsectionDeviation?: number; // Difference in subsections
  expectedEntries?: number;     // Expected entry count
  actualEntries?: number;       // Actual entry count
  entryDeviation?: number;      // Difference in entries
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
  unknownFieldCount: number;      // Count of fields that couldn't be categorized into a section
  alignmentPercentage: number;    // Percentage of sections that are aligned with expected counts
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
    undersizedSections: [],
    oversizedSections: [],
    message: "Validation successful",
    unknownFieldCount: 0,
    alignmentPercentage: 0
  };

  // Track unknown fields (section 0)
  if (sectionFields["0"] || sectionFields[0]) {
    result.unknownFieldCount = (sectionFields["0"] || sectionFields[0] || []).length;
  }
  
  // Calculate deviation for each section
  const sections = Object.keys(referenceCounts).map(Number);
  let alignedSections = 0;
  let totalSections = 0;
  
  sections.forEach(section => {
    // Skip ignored sections
    if (ignoreSections.includes(section)) {
      return;
    }
    
    totalSections++;
    
    // Get expected counts for this section
    const expected = referenceCounts[section] || { fields: 0, entries: 0, subsections: 0 };
    
    // Get actual fields for this section
    const sectionKey = section.toString();
    const fields = sectionFields[sectionKey] || sectionFields[section] || [];
    const actualFieldCount = fields.length;
    
    // Count subsections and entries
    const subsections = new Set<string>();
    const entries = new Set<number>();
    
    fields.forEach(field => {
      if (field.subsection) {
        subsections.add(field.subsection);
      }
      if (field.entry !== undefined) {
        entries.add(field.entry);
      }
    });
    
    const actualSubsectionCount = subsections.size;
    const actualEntryCount = entries.size;
    
    // Calculate deviations
    const fieldDeviation = actualFieldCount - expected.fields;
    const fieldDeviationPercent = expected.fields > 0 
      ? Math.abs(fieldDeviation) / expected.fields * 100 
      : (actualFieldCount > 0 ? 100 : 0);
      
    const subsectionDeviation = actualSubsectionCount - expected.subsections;
    const entryDeviation = actualEntryCount - expected.entries;
    
    // Calculate if this is a significant deviation
    const isSignificant = fieldDeviationPercent > maxDeviationPercent && Math.abs(fieldDeviation) > 2;
    
    // Add to the appropriate lists
    if (expected.fields > 0 && actualFieldCount === 0) {
      result.missingMandatorySections.push(section);
    } else if (isSignificant) {
      if (fieldDeviation < 0) {
        result.undersizedSections.push(section);
      } else if (!ignoreOverflowSections) {
        result.oversizedSections.push(section);
      }
    } else {
      // This section is within acceptable limits
      alignedSections++;
    }
    
    // Record detailed deviation info
    result.deviations.push({
      section,
      expected: expected.fields,
      actual: actualFieldCount,
      deviation: fieldDeviation,
      percentage: fieldDeviationPercent,
      isCritical: expected.fields > 0,
      // Add subsection and entry information
      expectedSubsections: expected.subsections,
      actualSubsections: actualSubsectionCount,
      subsectionDeviation: subsectionDeviation,
      expectedEntries: expected.entries,
      actualEntries: actualEntryCount,
      entryDeviation: entryDeviation
    });
  });
  
  // Calculate overall alignment percentage
  result.alignmentPercentage = totalSections > 0 ? (alignedSections / totalSections) * 100 : 0;
  
  // Determine overall success
  result.success = result.missingMandatorySections.length === 0 && 
                   result.undersizedSections.length === 0 && 
                   (!options.strict || result.oversizedSections.length === 0);
  
  // Generate human-readable message
  if (!result.success) {
    const messages = [];
    
    if (result.missingMandatorySections.length > 0) {
      messages.push(`Missing ${result.missingMandatorySections.length} mandatory sections (${result.missingMandatorySections.join(', ')})`);
    }
    
    if (result.undersizedSections.length > 0) {
      messages.push(`${result.undersizedSections.length} sections have too few fields (${result.undersizedSections.join(', ')})`);
    }
    
    if (options.strict && result.oversizedSections.length > 0) {
      messages.push(`${result.oversizedSections.length} sections have too many fields (${result.oversizedSections.join(', ')})`);
    }
    
    if (result.unknownFieldCount > 0) {
      messages.push(`${result.unknownFieldCount} fields could not be categorized`);
    }
    
    result.message = `Validation failed: ${messages.join('; ')}`;
  } else {
    result.message = `Validation successful with ${result.alignmentPercentage.toFixed(1)}% section alignment`;
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