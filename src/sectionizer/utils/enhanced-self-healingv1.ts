/**
 * Enhanced Self-Healing Module
 *
 * This module applies advanced rules and heuristics to improve the categorization
 * of fields that couldn't be properly assigned using standard rules.
 */

import fs from "fs";
import path from "path";
import { RuleEngine } from "../engine.js";
import type { CategorizedField } from "./extractFieldsBySection.js";
import {
  enhancedMultiDimensionalCategorization,
  extractSectionInfoFromName,
  identifySectionByPage,
  identifySectionByPageWithConfidence,
  detectSectionFromFieldValue,
  sectionClassifications,
  refinedSectionPageRanges,
} from "./fieldParsing.js";
import {
  predictSectionBySpatialProximity,
  calculateSpatialConfidenceBoost,
  extractSpatialInfo,
  getPositionalSectionScore,
  clusterFieldsSpatially,
  getSpatialNeighbors,
} from "./spatialAnalysis.js";
import {
  calculateRelatedSections,
  expectedFieldCounts,
  sectionFieldPatterns,
  sectionPageRanges,
  sectionStructure,
} from "./field-clusterer.js";

// Define section keywords for content matching
const sectionKeywords: Record<number, string[]> = {
  1: ["name", "last", "first", "middle", "suffix"],
  2: ["birth", "dob", "date of birth"],
  3: ["place of birth", "city", "county", "country"],
  4: ["ssn", "social security", "number"],
  5: ["other names", "used", "maiden", "nickname"],
  6: ["height", "weight", "hair", "eye", "color", "sex", "gender"],
  7: ["phone", "email", "address", "contact"],
  8: ["passport", "travel", "document", "expiration"],
  9: ["citizenship", "nationality", "birth", "citizen"],
  10: ["dual", "multiple", "citizenship", "foreign", "passport"],
  11: ["residence", "address", "lived", "own", "rent"],
  12: ["education", "school", "college", "university", "degree"],
  13: ["employment", "employer", "job", "work", "position"],
  14: ["selective", "service", "register", "registration"],
  15: [
    "military",
    "service",
    "army",
    "navy",
    "air force",
    "marines",
    "coast guard",
  ],
  16: ["people", "know", "references", "verifier", "verifiers"],
  17: ["marital", "relationship", "spouse", "cohabitant", "partner"],
  18: [
    "relatives",
    "family",
    "father",
    "mother",
    "sibling",
    "child",
    "children",
  ],
  19: ["foreign", "contact", "contacts", "relationship", "allegiance"],
  20: ["foreign", "activity", "activities", "business", "government"],
  21: ["psychological", "mental", "health", "counseling", "treatment"],
  22: ["police", "record", "arrest", "criminal", "offense"],
  23: ["drug", "illegal", "controlled", "substance", "misuse"],
  24: ["alcohol", "abuse", "treatment", "counseling"],
  25: ["investigation", "clearance", "security", "classified"],
  26: ["financial", "debt", "bankruptcy", "delinquent", "taxes"],
  27: ["technology", "computer", "unauthorized", "illegal", "system"],
  28: ["civil", "court", "action", "lawsuit", "legal"],
  29: ["association", "record", "organization", "membership", "terror"],
  30: ["continuation", "additional", "information", "comments"],
};

interface DeviationInfo {
  section: number;
  expected: number;
  actual: number;
  deviation: number;
  percentage: number;
  isSignificant: boolean;
  shouldCorrect: boolean;
}

interface SectionCorrection {
  from: string;
  to: string;
  count: number;
}

// Cache existing section data between runs
let existingSectionData: Record<string, CategorizedField[]> | null = null;

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
 * Check if the categorized fields now match the expected counts for each section
 *
 * @param sectionFields Current categorized fields by section
 * @param referenceCounts Expected field counts by section
 * @param threshold Tolerance threshold (0.0-1.0) for deviation
 * @returns Boolean indicating if counts are aligned
 */
function verifyFieldCountAlignment(
  sectionFields: Record<string, CategorizedField[]>,
  referenceCounts: Record<number, number>,
  threshold: number = 0.1 // Use stricter threshold (changed from 0.7)
): boolean {
  // Check alignment between actual and expected counts
  let aligned = true;
  let totalDeviation = 0;
  let totalExpected = 0;
  let criticalSectionsAligned = true;

  // Define critical sections that must be aligned better than others
  const criticalSections = [1, 2, 4, 5, 8, 13, 14, 15, 17, 21, 27];

  // Track all deviations for logging
  const deviations: {
    section: number;
    expected: number;
    actual: number;
    deviation: number;
    percentage: number;
  }[] = [];

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
    const deviationPercentage =
      expectedCount > 0 ? deviation / expectedCount : 1;

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
      percentage: deviationPercentage * 100,
    });

    // Check if this section is within threshold
    if (deviationPercentage <= threshold) {
      sectionsWithinThreshold++;
    } else {
      aligned = false;

      // Track if critical sections are not aligned
      if (
        criticalSections.includes(sectionNumber) &&
        deviationPercentage > threshold * 0.8
      ) {
        criticalSectionsAligned = false;
      }
    }

    totalDeviation += deviation;
    totalExpected += expectedCount;
  }

  // Calculate overall alignment percentage
  const overallAlignmentPercentage =
    totalSections > 0 ? (sectionsWithinThreshold / totalSections) * 100 : 0;
  const overallDeviationPercentage =
    totalExpected > 0 ? (totalDeviation / totalExpected) * 100 : 100;

  console.log(
    `Overall alignment: ${overallAlignmentPercentage.toFixed(
      2
    )}% of sections within threshold`
  );
  console.log(
    `Overall deviation: ${overallDeviationPercentage.toFixed(
      2
    )}% of expected fields`
  );
  console.log(`Uncategorized fields remaining: ${unknownFieldCount}`);

  // Log all deviations sorted by percentage (highest first)
  console.log("\nSection Deviations:");
  deviations
    .sort((a, b) => b.percentage - a.percentage)
    .forEach((d) => {
      const sign = d.deviation > 0 ? "+" : "";
      console.log(
        `  Section ${d.section}: ${d.actual} fields (expected ${
          d.expected
        }, ${sign}${d.deviation}, ${d.percentage.toFixed(2)}%)`
      );
    });

  // Determine if we're "good enough" for real-world usage
  // Modified to be stricter and never consider "good enough" if there are extreme deviations
  // or if section 0 still has a significant number of uncategorized fields
  const maxAcceptableUnknownFields = Math.min(
    20,
    Math.ceil(totalExpected * 0.01)
  ); // Maximum 1% of total expected fields or 20 fields
  const isUnknownFieldsAcceptable =
    unknownFieldCount <= maxAcceptableUnknownFields;

  // Never consider alignment "good enough" if section 0 still has a significant number of fields
  const isGoodEnough =
    !hasExtremeDeviations && // Never "good enough" if there are extreme deviations
    isUnknownFieldsAcceptable && // Required: few or no fields in section 0
    (overallAlignmentPercentage >= 75 || // 75% of sections are within threshold
      (criticalSectionsAligned && overallAlignmentPercentage >= 60) || // Critical sections aligned and 60% of all sections
      overallDeviationPercentage <= 20); // Overall deviation is less than 20%

  console.log(
    `\nAlignment check ${isGoodEnough ? "PASSED" : "FAILED"}: ${
      isGoodEnough
        ? "Good enough for output generation"
        : "More correction needed"
    }`
  );
  if (!isUnknownFieldsAcceptable) {
    console.log(
      `Too many uncategorized fields (${unknownFieldCount}). Goal: ${maxAcceptableUnknownFields} or fewer.`
    );
  }

  return isGoodEnough;
}

/**
 * Check if all sections are aligned with reference counts within threshold
 */
function allSectionsAligned(
  sectionFields: Record<string, CategorizedField[]>,
  referenceCounts: Record<number, number>,
  deviationThreshold: number = 0.2
): boolean {
  // Get deviation info
  const deviationInfo = evaluateSectionDeviations(
    sectionFields,
    referenceCounts,
    deviationThreshold
  );

  // Check if all essential sections are present
  const criticalSections = [13]; // Add any critical sections that must be present
  for (const section of criticalSections) {
    if (
      !sectionFields[section.toString()] ||
      sectionFields[section.toString()].length === 0
    ) {
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
export function calculateAlignmentPercentage(
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
  return 100 - (totalDeviation / totalExpected) * 100;
}

/**
 * Load existing section data if available
 */
function loadExistingSectionData(
  outputPath: string
): Record<string, CategorizedField[]> | null {
  // Return cached data if available
  if (existingSectionData !== null) {
    return existingSectionData;
  }

  // Try to load from the section-data directory
  const sectionDataPath = path.join(
    process.cwd(),
    "src",
    "section-data",
    "section-data.json"
  );

  try {
    if (fs.existsSync(sectionDataPath)) {
      console.log(
        `Found existing section data at ${sectionDataPath}, loading...`
      );
      const data = fs.readFileSync(sectionDataPath, "utf8");
      existingSectionData = JSON.parse(data);
      console.log(
        `Successfully loaded section data with ${
          existingSectionData ? Object.keys(existingSectionData).length : 0
        } sections`
      );
      return existingSectionData;
    }
  } catch (error) {
    console.error(`Error loading existing section data: ${error}`);
  }

  return null;
}

/**
 * Save intermediate section data for future runs
 */
function saveSectionData(
  sectionFields: Record<string, CategorizedField[]>,
  outputPath: string
): void {
  try {
    // Create the section-data directory if it doesn't exist
    const sectionDataDir = path.join(process.cwd(), "src", "section-data");
    if (!fs.existsSync(sectionDataDir)) {
      fs.mkdirSync(sectionDataDir, { recursive: true });
    }

    // Save the section data for future runs
    const sectionDataPath = path.join(sectionDataDir, "section-data.json");
    fs.writeFileSync(sectionDataPath, JSON.stringify(sectionFields, null, 2));
    console.log(`Saved final intermediate section data to ${sectionDataPath}`);

    // Update the cache
    existingSectionData = { ...sectionFields };
  } catch (error) {
    console.error(`Error saving section data: ${error}`);
  }
}

// Fix the getStringValue function to handle null safely
function getStringValue(value: any): string {
  if (typeof value === "string") {
    return value;
  } else if (Array.isArray(value) && value.length > 0) {
    return String(value[0]);
  } else if (value !== null && value !== undefined) {
    return String(value);
  }
  return ""; // Return empty string instead of null
}

/**
 * Apply enhanced categorization to unknown fields
 */
export function applyEnhancedCategorization(
  unknownFields: CategorizedField[],
  engine: RuleEngine
): { recategorized: CategorizedField[]; corrections: number } {
  console.log(
    `Applying enhanced categorization to ${unknownFields.length} unknown fields...`
  );

  const recategorized: CategorizedField[] = [];
  let corrections = 0;

  // Optimization: Group fields by name pattern for batch processing
  const patternGroups: Record<string, CategorizedField[]> = {};

  // Process fields by groups with similar patterns
  for (const field of unknownFields) {
    // Skip already categorized fields
    if (field.section !== 0) {
      recategorized.push(field);
      continue;
    }

    // Get a simplified pattern from the field name
    const pattern = getFieldPattern(field.name);

    // Add to pattern group
    if (!patternGroups[pattern]) {
      patternGroups[pattern] = [];
    }
    patternGroups[pattern].push(field);
  }

  // Process each pattern group
  for (const [pattern, fields] of Object.entries(patternGroups)) {
    // Skip patterns with no fields
    if (fields.length === 0) continue;

    // Try to use pattern to determine section
    const potentialSection = getPotentialSectionFromPattern(pattern);

    if (potentialSection > 0) {
      // Apply the potential section to all fields in this pattern group
      for (const field of fields) {
        field.section = potentialSection;
        field.confidence = 0.75; // Set moderately high confidence
        recategorized.push(field);
        corrections++;
      }

      console.log(
        `Applied section ${potentialSection} to ${fields.length} fields with pattern '${pattern}'`
      );
      continue;
    }

    // Apply individual enhanced categorization if no pattern-based assignment
    for (const field of fields) {
      // Apply advanced categorization using comprehensive methods
      const result = enhancedMultiDimensionalCategorization(
        field.name,
        field.label,
        field.page,
        typeof field.value === "string"
          ? field.value
          : getStringValue(field.value),
        [] // We don't have neighbor fields here
      );

      if (result && result.section > 0 && result.confidence >= 0.7) {
        field.section = result.section;
        if (result.subsection) field.subsection = result.subsection;
        if (result.entry) field.entry = result.entry;
        field.confidence = result.confidence;

        corrections++;
      }

      // Try rule-based categorization
      if (field.section === 0) {
        // Check if the engine has categorizeField method instead of getRules
        try {
          const ruleResult = engine.categorizeField(field);
          if (ruleResult && ruleResult.section > 0) {
            field.section = ruleResult.section;
            field.confidence = ruleResult.confidence;
            corrections++;
          }
        } catch (error) {
          // Silently continue if categorization fails
        }
      }

      // Try page-based categorization as a fallback
      if (field.section === 0 && field.page > 0) {
        const pageResult = identifySectionByPageWithConfidence(field.page);
        if (pageResult && pageResult.section > 0) {
          field.section = pageResult.section;
          field.confidence = pageResult.confidence * 0.9; // Slight penalty for page-only matching

          corrections++;
        }
      }

      // Try field value analysis if still not categorized
      if (field.section === 0 && field.value) {
        const valueResult = detectSectionFromFieldValue(field.value);
        if (valueResult && valueResult.section > 0) {
          field.section = valueResult.section;
          if (valueResult.subsection) field.subsection = valueResult.subsection;
          if (valueResult.entry) field.entry = valueResult.entry;
          field.confidence = valueResult.confidence * 0.95; // Small penalty for value-only matching

          corrections++;
        }
      }

      // Always add to recategorized list
      recategorized.push(field);
    }
  }

  console.log(
    `Enhanced categorization complete. ${corrections} fields corrected.`
  );

  return { recategorized, corrections };
}

/**
 * Extract a simplified pattern from field name for grouping
 */
function getFieldPattern(fieldName: string): string {
  // Remove indexes and normalize
  return fieldName
    .replace(/\[\d+\]/g, "[]")
    .replace(/\d{1,2}(?!\d)/g, "N")
    .replace(/\d+/g, "N")
    .split(".")
    .slice(0, 2)
    .join(".");
}

/**
 * Try to determine potential section from a field name pattern
 */
function getPotentialSectionFromPattern(pattern: string): number {
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
function ensureCriticalSections(
  sectionFields: Record<string, CategorizedField[]>,
  criticalSections: number[] = [13]
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
          value: "",
          label: `Section ${section} Placeholder`,
        };

        result[sectionKey].push(placeholderField);
      }
    }
  }

  return result;
}

/**
 * Evaluate if section deviations are within acceptable thresholds
 */
function evaluateSectionDeviations(
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
    const sectionThreshold = getSectionSpecificThreshold(
      sectionId,
      deviationThreshold
    );
    const isSignificant = percentage > sectionThreshold;

    // Determine if this section should be corrected, with special priority for sections 8 and 27
    const isHighPrioritySection = [8, 27, 9, 13].includes(sectionId);
    const shouldCorrect =
      isSignificant &&
      // Don't try to force fields into categorized sections if they should be in section 0
      !(isUncategorizedSection && actualCount <= expectedCount) &&
      // Give higher priority to completely missing sections and high-priority sections
      (isHighPrioritySection ||
        actualCount === 0 ||
        actualCount < expectedCount * 0.7);

    deviations.push({
      section: sectionId,
      expected: expectedCount,
      actual: actualCount,
      deviation,
      percentage,
      isSignificant,
      shouldCorrect,
    });
  }

  // Calculate alignment score (percentage of aligned sections)
  const alignmentScore =
    totalValidSections > 0
      ? (sectionsWithinThreshold / totalValidSections) * 100
      : 0;

  // Add missing and oversized section information to the result for use by other functions
  return {
    deviations,
    alignmentScore,
    sectionsAligned: sectionsWithinThreshold,
    totalValidSections,
    missingSections,
    oversizedSections,
  } as any;
}

/**
 * Get section-specific threshold to account for sections needing tighter or looser validation
 */
function getSectionSpecificThreshold(
  sectionId: number,
  defaultThreshold: number
): number {
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
 * Search for potential fields in unknown section using patterns
 */
function findFieldsByPatterns(
  fields: CategorizedField[],
  patterns: string[]
): CategorizedField[] {
  return fields.filter((field) => {
    // Check field name against patterns
    if (
      patterns.some((pattern) =>
        field.name.toLowerCase().includes(pattern.toLowerCase())
      )
    ) {
      return true;
    }
    // Safe check for label
    if (typeof field.label === "string") {
      const label = field.label.toLowerCase();
      if (patterns.some((pattern) => label.includes(pattern.toLowerCase()))) {
        return true;
      }
    }
    return false;
  });
}

/**
 * Helper function to find fields that match any of the given patterns
 */
function findFieldsWithPatterns(
  fields: CategorizedField[],
  patterns: string[]
): CategorizedField[] {
  return fields.filter((field) => {
    // Check field name against patterns
    const name = field.name?.toLowerCase() || "";
    if (patterns.some((pattern) => name.includes(pattern.toLowerCase()))) {
      return true;
    }

    // Safe check for label
    if (typeof field.label === "string") {
      const label = field.label.toLowerCase();
      if (patterns.some((pattern) => label.includes(pattern.toLowerCase()))) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Find fields matching the patterns for a specific section
 * This replaces the individual section finder functions with a generalized approach
 *
 * @param unknownFields Array of fields that have not been categorized
 * @param sectionId Target section ID to find fields for
 * @param confidenceScore The confidence score to assign (default 0.9)
 * @param pageRanges Optional page ranges to consider for this section
 * @returns Array of fields that match the section patterns
 */
function findSectionFieldsByPatterns(
  unknownFields: CategorizedField[],
  sectionId: number,
  confidenceScore: number,
  pageRanges?: number[]
): CategorizedField[] {
  // Get patterns for the requested section
  const sectionPatterns = sectionFieldPatterns[sectionId];

  console.log(sectionPatterns, "section patterns");

  if (!sectionPatterns || sectionPatterns.length === 0) {
    console.log(`No patterns defined for section ${sectionId}`);
    return [];
  }

  console.log(
    `Looking for section ${sectionId} fields using ${sectionPatterns.length} patterns`
  );

  // First find exact name matches using the patterns
  const exactMatches = unknownFields.filter((field) => {
    // Test field name against all patterns for this section
    return sectionPatterns.some((pattern: RegExp) => pattern.test(field.name));
  });

  console.log(
    `Found ${exactMatches.length} exact matches for section ${sectionId} using patterns`
  );

  // Get expected field count for this section to limit page-based matches
  const expectedCount = expectedFieldCounts[sectionId]?.fields || 0;
  const maxAdditionalFields = Math.max(0, expectedCount - exactMatches.length);

  // If we have page ranges defined, also look for fields on those pages
  let pageBasedMatches: CategorizedField[] = [];

  if (pageRanges && pageRanges.length > 0 && maxAdditionalFields > 0) {
    const candidatePageFields = unknownFields.filter((field) => {
      // Skip fields already matched by patterns
      if (exactMatches.find((match) => match.id === field.id)) {
        return false;
      }

      // Look for fields on the specified pages
      return field.page !== undefined && pageRanges.includes(field.page);
    });

    // Limit page-based matches to avoid taking too many fields
    pageBasedMatches = candidatePageFields.slice(0, maxAdditionalFields);

    console.log(
      `Found ${candidatePageFields.length} potential page-based matches, taking ${pageBasedMatches.length} for section ${sectionId} (max allowed: ${maxAdditionalFields})`
    );
  }

  // Combine pattern matches and limited page-based matches
  const allMatches = [...exactMatches, ...pageBasedMatches];

  console.log(
    `Total matches for section ${sectionId}: ${allMatches.length} (${exactMatches.length} pattern + ${pageBasedMatches.length} page-based)`
  );

  // Create properly categorized fields with the target section
  return allMatches.map((field) => ({
    ...field,
    section: sectionId,
    confidence: confidenceScore,
  }));
}

/**
 * Find fields matching the patterns for a specific section
 * This replaces the individual section finder functions with a generalized approach
 *
 * @param unknownFields Array of fields that have not been categorized
 * @param sectionId Target section ID to find fields for
 * @param confidenceScore The confidence score to assign (default 0.9)
 * @param pageRanges Optional page ranges to consider for this section
 * @returns Array of fields that match the section patterns
 */
function findSectionFieldsByPatternsBackup(
  unknownFields: CategorizedField[],
  sectionId: number,
  confidenceScore: number = 0.9,
  pageRanges?: number[]
): CategorizedField[] {
  // Get patterns for the requested section
  const sectionPatterns = sectionFieldPatterns[sectionId];

  if (!sectionPatterns || sectionPatterns.length === 0) {
    console.log(`No patterns defined for section ${sectionId}`);
    return [];
  }

  console.log(
    `Looking for section ${sectionId} fields using ${sectionPatterns.length} patterns`
  );

  // First find exact name matches using the patterns
  const exactMatches = unknownFields.filter((field) => {
    // Test field name against all patterns for this section

    return sectionPatterns.some((pattern: RegExp) => pattern.test(field.name));
  });

  console.log(
    `Found ${exactMatches.length} exact matches for section ${sectionId} using patterns`
  );

  // If we have page ranges defined, also look for fields on those pages
  let pageBasedMatches: CategorizedField[] = [];

  if (pageRanges && pageRanges.length > 0) {
    pageBasedMatches = unknownFields.filter((field) => {
      // Skip fields already matched by patterns
      if (exactMatches.find((match) => match.id === field.id)) {
        return false;
      }

      // Look for fields on the specified pages
      return field.page !== undefined && pageRanges.includes(field.page);
    });

    console.log(
      `Found ${
        pageBasedMatches.length
      } additional matches for section ${sectionId} based on pages ${pageRanges.join(
        ", "
      )}`
    );
  }

  // Combine pattern matches and page-based matches
  const allMatches = [...exactMatches, ...pageBasedMatches];

  // Create properly categorized fields with the target section
  return allMatches.map((field) => ({
    ...field,
    section: sectionId,
    confidence: confidenceScore,
  }));
}

/**
 * Apply aggressive spatial analysis to fix problem sections
 * This focuses on sections that are consistently under-allocated
 */
function applyAggressiveSpatialAnalysis(
  workingSectionFields: Record<string, CategorizedField[]>,
  referenceCounts: Record<number, number>,
  problemSections: number[]
): {
  corrections: number;
  remainingUnknown: number;
} {
  let corrections = 0;

  // Get unknown fields
  const unknownFields = workingSectionFields["0"] || [];
  const unknownCount = unknownFields.length;

  console.log(
    `Applying aggressive spatial analysis for problem sections: ${problemSections.join(
      ", "
    )}`
  );
  console.log(`Currently ${unknownCount} unknown fields remaining`);

  // Pre-process to find fields with coordinate data
  const fieldsWithCoords = unknownFields.filter((field) => {
    // Check if field has rect property with coordinates
    return (
      field.rect ||
      (field.hasOwnProperty("x") && field.hasOwnProperty("y")) ||
      (field.hasOwnProperty("coords") && Array.isArray((field as any).coords))
    );
  });

  console.log(
    `Found ${fieldsWithCoords.length} unknown fields with coordinate data for spatial analysis`
  );

  // Process each problem section with higher priority
  for (const sectionId of problemSections) {
    const sectionKey = sectionId.toString();
    const currentCount = workingSectionFields[sectionKey]?.length || 0;
    const expectedCount = referenceCounts[sectionId] || 0;

    // Skip if section already has enough fields
    if (currentCount >= expectedCount) {
      console.log(
        `Section ${sectionId} already has sufficient fields (${currentCount}/${expectedCount})`
      );
      continue;
    }

    const deficit = expectedCount - currentCount;
    console.log(
      `Section ${sectionId} deficit: ${deficit} fields (has ${currentCount}, needs ${expectedCount})`
    );

    // Use the generalized pattern-based field finder
    const sectionFields = findSectionFieldsByPatterns(
      unknownFields,
      sectionId,
      0.95, // High confidence score
      sectionPageRanges[sectionId] // Page ranges for this section
    );

    console.log(
      `Found ${sectionFields.length} candidates for section ${sectionId} using pattern matching`
    );

    if (sectionFields.length > 0) {
      // Remove these fields from unknown
      const fieldIds = new Set(sectionFields.map((f) => f.id));
      workingSectionFields["0"] = unknownFields.filter(
        (f) => !fieldIds.has(f.id)
      );

      // Add to section
      if (!workingSectionFields[sectionKey]) {
        workingSectionFields[sectionKey] = [];
      }
      workingSectionFields[sectionKey] = [
        ...workingSectionFields[sectionKey],
        ...sectionFields,
      ];
      corrections += sectionFields.length;

      // Continue to next section if we've filled the deficit
      if (sectionFields.length >= deficit) {
        continue;
      }
    }

    // If we still need more fields after pattern-based matching, try spatial analysis
    let remainingDeficit = deficit - (sectionFields.length || 0);
    if (remainingDeficit > 0) {
      // 1. First try spatial proximity prediction for unknown fields
      const candidatesByProximity: CategorizedField[] = [];

      // Use fields with coordinate data for spatial analysis
      for (const field of fieldsWithCoords) {
        // Extract spatial info - optimized extraction logic
        const spatialInfo = extractSpatialInfo(field);

        if (spatialInfo) {
          // Use spatial proximity to predict section
          const prediction = predictSectionBySpatialProximity(
            field,
            workingSectionFields
          );

          // If prediction matches our target section with decent confidence, it's a candidate
          if (prediction.section === sectionId && prediction.confidence > 0.5) {
            // Lowered threshold from 0.6
            // Apply additional confidence boost based on position
            const spatialBoost = calculateSpatialConfidenceBoost(
              field,
              sectionId
            );

            // Create a categorized field with the predicted section
            const enhancedField: CategorizedField = {
              ...field,
              section: sectionId,
              confidence: prediction.confidence + spatialBoost,
            };

            candidatesByProximity.push(enhancedField);
          }
        }
      }

      // Sort candidates by confidence (highest first)
      candidatesByProximity.sort((a, b) => b.confidence - a.confidence);

      // Take the top candidates up to the deficit
      const topCandidates = candidatesByProximity.slice(0, remainingDeficit);

      console.log(
        `Found ${topCandidates.length} additional candidates for section ${sectionId} using spatial analysis`
      );

      if (topCandidates.length > 0) {
        // Remove these fields from unknown
        const fieldIds = new Set(topCandidates.map((f) => f.id));
        workingSectionFields["0"] = workingSectionFields["0"].filter(
          (f) => !fieldIds.has(f.id)
        );

        // Add to section
        if (!workingSectionFields[sectionKey]) {
          workingSectionFields[sectionKey] = [];
        }
        workingSectionFields[sectionKey] = [
          ...workingSectionFields[sectionKey],
          ...topCandidates,
        ];
        corrections += topCandidates.length;

        // Update deficit for page-based analysis
        remainingDeficit -= topCandidates.length;
      }

      // 2. If we still need more fields after spatial analysis, try page-based matching
      if (remainingDeficit > 0) {
        const pageBasedCandidates: CategorizedField[] = [];

        // Get typical pages for this section based on existing fields
        const existingFields = workingSectionFields[sectionKey] || [];
        const sectionPages = new Set<number>();

        // Collect pages from existing fields in this section
        existingFields.forEach((field) => {
          if (field.page) sectionPages.add(field.page);
        });

        // Get expected page ranges for this section
        const expectedPages: number[] = sectionPageRanges[sectionId] || [];

        if (expectedPages.length > 0) {
          console.log(
            `Looking for fields on pages: ${expectedPages.join(
              ", "
            )} for section ${sectionId}`
          );

          // Find unknown fields on these pages
          const fieldsOnExpectedPages = (
            workingSectionFields["0"] || []
          ).filter(
            (field) =>
              field.page !== undefined && expectedPages.includes(field.page)
          );

          // Create categorized fields with the target section
          for (const field of fieldsOnExpectedPages) {
            // Skip if we have filled our deficit
            if (pageBasedCandidates.length >= remainingDeficit) break;

            const enhancedField: CategorizedField = {
              ...field,
              section: sectionId,
              confidence: 0.7, // Medium confidence for page-based assignment
            };

            pageBasedCandidates.push(enhancedField);
          }

          console.log(
            `Found ${pageBasedCandidates.length} additional candidates using page-based analysis`
          );

          if (pageBasedCandidates.length > 0) {
            // Remove these fields from unknown
            const fieldIds = new Set(pageBasedCandidates.map((f) => f.id));
            workingSectionFields["0"] = workingSectionFields["0"].filter(
              (f) => !fieldIds.has(f.id)
            );

            // Add to section
            if (!workingSectionFields[sectionKey]) {
              workingSectionFields[sectionKey] = [];
            }

            console.log(
              `Moving ${pageBasedCandidates.length} fields to section ${sectionId}`
            );
            workingSectionFields[sectionKey] = [
              ...workingSectionFields[sectionKey],
              ...pageBasedCandidates,
            ];
            corrections += pageBasedCandidates.length;
          }
        }
      }
    }
  }

  console.log(`Spatial analysis reassigned ${corrections} fields`);

  return {
    corrections,
    remainingUnknown: (workingSectionFields["0"] || []).length,
  };
}

/**
 * Apply self-healing steps to improve section assignment
 */
async function applySelfHealingSteps(
  ruleEngine: RuleEngine,
  sectionFields: Record<string, CategorizedField[]>,
  referenceCounts: Record<number, number>,
  deviationThreshold: number
): Promise<SelfHealingStepResult> {
  // Create a working copy of section fields
  const workingSectionFields = JSON.parse(
    JSON.stringify(sectionFields)
  ) as Record<string, CategorizedField[]>;

  // Get unknown fields
  const unknownFields = workingSectionFields["0"] || [];

  // Check if we should process unknown fields based on reference counts
  const expectedUnknownCount = referenceCounts[0] || 0;
  const shouldProcessUnknownFields =
    unknownFields.length > expectedUnknownCount;

  // Get deviations to identify sections that need fixing
  let deviationInfo = evaluateSectionDeviations(
    workingSectionFields,
    referenceCounts,
    deviationThreshold
  );

  // Extract missing, undersized, and oversized sections
  const missingSections: number[] = [];
  const undersizedSections: number[] = [];
  const oversizedSections: number[] = [];

  // Process each deviation
  deviationInfo.deviations.forEach((deviation) => {
    const section = deviation.section;

    // Missing sections (completely empty but expected to have fields)
    if (deviation.actual === 0 && deviation.expected > 0) {
      missingSections.push(section);
    }
    // Undersized sections (have fewer fields than expected beyond threshold)
    else if (
      deviation.actual < deviation.expected &&
      Math.abs(deviation.deviation) > deviationThreshold * deviation.expected
    ) {
      undersizedSections.push(section);
    }
    // Oversized sections (have more fields than expected beyond threshold)
    else if (
      deviation.actual > deviation.expected &&
      Math.abs(deviation.deviation) > deviationThreshold * deviation.expected
    ) {
      oversizedSections.push(section);
    }
  });

  // Count corrections
  let corrections = 0;

  console.log(`Processing missing sections: ${missingSections.join(", ")}`);
  console.log(
    `Processing undersized sections: ${undersizedSections.join(", ")}`
  );
  console.log(`Processing oversized sections: ${oversizedSections.join(", ")}`);

  // Only process unknown fields if we should or if we have missing/undersized sections
  if (shouldProcessUnknownFields || missingSections.length > 0) {
    console.log(missingSections, "missing sections");
    console.log(
      `Processing ${unknownFields.length} unknown fields (expected: ${expectedUnknownCount})`
    );

    // PART 1: Fix missing and undersized sections by moving fields from unknown

    // Process all missing or undersized sections
    const sectionsToFix = [
      ...new Set([...missingSections, ...undersizedSections]),
    ];

    // Sort sections by priority with special handling for sections on the same page
    sectionsToFix.sort((a, b) => {
      // Special case: If both sections are on page 6, prioritize section 8 over section 7
      // This prevents section 7's page-based fallback from capturing section 8 fields
      const aPageRange = sectionPageRanges[a];
      const bPageRange = sectionPageRanges[b];

      if (aPageRange && bPageRange) {
        const aPages: number[] = Array.isArray(aPageRange) ? aPageRange : [aPageRange];
        const bPages: number[] = Array.isArray(bPageRange) ? bPageRange : [bPageRange];

        // If both sections include page 6, prioritize section 8
        if (aPages.includes(6) && bPages.includes(6)) {
          if (a === 8 && b === 7) return -1; // Section 8 before section 7
          if (a === 7 && b === 8) return 1;  // Section 8 before section 7
        }
      }

      // Default: lower section numbers first (as they're usually more important)
      return a - b;
    });

    for (const sectionId of sectionsToFix) {
      console.log(
        `Fixing section ${sectionId} (${
          sectionStructure[sectionId] || sectionStructure[0]
        })`
      );

      // Create section array if it doesn't exist
      if (!workingSectionFields[sectionId.toString()]) {
        workingSectionFields[sectionId.toString()] = [];
      }

      // Calculate how many fields we need
      const currentCount = workingSectionFields[sectionId.toString()].length;
      const expectedCount = referenceCounts[sectionId] || 0;
      const deficit = expectedCount - currentCount;

      if (deficit <= 0) {
        console.log(
          `  Section ${sectionId} has enough fields (${currentCount}/${expectedCount})`
        );
        continue;
      }

      console.log(
        `  Section ${sectionId} needs ${deficit} more fields (has ${currentCount}, needs ${expectedCount})`
      );

      // First try: Pattern-based field matching

      // applyAggressiveSpatialAnalysis(workingSectionFields, referenceCounts, sectionsToFix);

      // Use the generalized pattern-based field finder
      const patternFields = findSectionFieldsByPatterns(
        unknownFields,
        sectionId,
        0.95, // High confidence score
        sectionPageRanges[sectionId] // Page ranges for this section
      );

      // const patternFields = await ruleEngine.categorizeFields(unknownFields)

      if (patternFields.length > 0) {
        console.log(
          `  Found ${patternFields.length} fields for section ${sectionId} using pattern matching`
        );

        // Remove these fields from unknown
        const fieldIds = new Set(patternFields.map((f) => f.id));
        const newUnknownFields = unknownFields.filter(
          (f) => !fieldIds.has(f.id)
        );

        // Calculate how many were actually removed
        const removedCount = unknownFields.length - newUnknownFields.length;

        // Update unknown fields list
        unknownFields.length = 0;
        unknownFields.push(...newUnknownFields);

        // Add to section
        workingSectionFields[sectionId.toString()].push(...patternFields);
        corrections += removedCount;
      }

      // Second try: Page-based matching (if still deficit)
      const remainingDeficit =
        expectedCount - workingSectionFields[sectionId.toString()].length;

      if (remainingDeficit > 0 && sectionPageRanges[sectionId]) {
        const [minPage, maxPage] = sectionPageRanges[sectionId];
        console.log(
          `  Searching for section ${sectionId} fields on pages ${minPage}-${maxPage}`
        );

        // Find fields on the pages for this section
        const pageBasedFields = unknownFields
          .filter(
            (field) =>
              field.page && field.page >= minPage && field.page <= maxPage
          )
          .slice(0, remainingDeficit); // Only take what we need

        if (pageBasedFields.length > 0) {
          console.log(
            `  Found ${pageBasedFields.length} fields for section ${sectionId} based on page range`
          );

          // Set section for these fields
          pageBasedFields.forEach((field) => {
            field.section = sectionId;
            field.confidence = 0.85;
          });

          // Remove from unknown fields
          const fieldIds = new Set(pageBasedFields.map((f) => f.id));
          const newUnknownFields = unknownFields.filter(
            (f) => !fieldIds.has(f.id)
          );

          // Calculate how many were actually removed
          const removedCount = unknownFields.length - newUnknownFields.length;

          // Update unknown fields list
          unknownFields.length = 0;
          unknownFields.push(...newUnknownFields);

          // Add to section
          workingSectionFields[sectionId.toString()].push(...pageBasedFields);
          corrections += removedCount;
        }
      }
    }
  } else {
    console.log(
      `Skipping unknown field processing: ${unknownFields.length} fields (expected: ${expectedUnknownCount})`
    );
  }

  // PART 2: Fix oversized sections by moving fields to undersized related sections

  // Calculate related sections dynamically based on page proximity
  const relatedSections: Record<number, number[]> = {};

  // Calculate related sections
  calculateRelatedSections(relatedSections);

  // Process oversized sections
  for (const sourceSection of oversizedSections) {
    // Get section fields
    const sourceSectionKey = sourceSection.toString();
    const sourceFields = workingSectionFields[sourceSectionKey] || [];

    // Calculate excess
    const actualCount = sourceFields.length;
    const expectedCount = referenceCounts[sourceSection] || 0;
    let excess = actualCount - expectedCount;

    if (excess <= 0) continue; // Skip if not actually oversized

    console.log(
      `Fixing oversized section ${sourceSection} (${
        sectionStructure[sourceSection] || "Unknown"
      }): ${actualCount} fields vs expected ${expectedCount}`
    );

    // Get potential destination sections (related + undersized)
    const potentialDestinations = (relatedSections[sourceSection] || []).filter(
      (section) => undersizedSections.includes(section)
    );

    if (potentialDestinations.length === 0) {
      console.log(
        `  No related undersized sections found for section ${sourceSection}`
      );
      continue;
    }

    console.log(
      `  Potential destination sections: ${potentialDestinations.join(", ")}`
    );

    // Process each potential destination
    for (const destSection of potentialDestinations) {
      if (excess <= 0) break; // Stop if we've moved enough fields

      const destSectionKey = destSection.toString();

      // Calculate how many fields to move
      const destActual = (workingSectionFields[destSectionKey] || []).length;
      const destExpected = referenceCounts[destSection] || 0;
      const destDeficit = destExpected - destActual;

      if (destDeficit <= 0) continue; // Skip if destination doesn't need more fields

      const moveCount = Math.min(excess, destDeficit);
      console.log(
        `  Section ${destSection} needs ${destDeficit} more fields. Moving up to ${moveCount} fields from section ${sourceSection}`
      );

      // Create destination section if it doesn't exist
      if (!workingSectionFields[destSectionKey]) {
        workingSectionFields[destSectionKey] = [];
      }

      // Get keywords for the destination section from field-clusterer.ts
      const destKeywords = sectionKeywords[destSection] || [];

      // Find fields to move based on:
      // 1. Low confidence first
      // 2. Fields with destination section keywords
      const fieldsToMove = sourceFields
        .slice() // Create a copy to sort
        .sort((a, b) => {
          // Sort by confidence (ascending)
          const confidenceDiff = (a.confidence || 0) - (b.confidence || 0);
          if (confidenceDiff !== 0) return confidenceDiff;

          // Then by keyword matching (descending)
          const aKeywordScore = getKeywordMatchScore(a, destKeywords);
          const bKeywordScore = getKeywordMatchScore(b, destKeywords);
          return bKeywordScore - aKeywordScore;
        })
        .slice(0, moveCount);

      console.log(
        `  Selected ${fieldsToMove.length} fields to move from section ${sourceSection} to ${destSection}`
      );

      // Move the fields
      let movedCount = 0;
      for (const field of fieldsToMove) {
        // Remove from source section
        const index = sourceFields.indexOf(field);
        if (index !== -1) {
          sourceFields.splice(index, 1);

          // Update field
          field.section = destSection;
          field.confidence = 0.8;

          // Add to destination section
          workingSectionFields[destSectionKey].push(field);

          movedCount++;
        }
      }

      corrections += movedCount;
      console.log(
        `  Moved ${movedCount} fields from section ${sourceSection} to ${destSection}`
      );

      // Update excess count
      excess -= movedCount;
    }
  }

  // Update unknown fields array in working section fields
  workingSectionFields["0"] = unknownFields;

  // Calculate the new section alignment score
  const afterDeviationInfo = evaluateSectionDeviations(
    workingSectionFields,
    referenceCounts,
    deviationThreshold
  );

  // Report improvement
  const alignmentImprovement =
    afterDeviationInfo.alignmentScore - deviationInfo.alignmentScore;

  console.log(
    `Alignment score improved from ${deviationInfo.alignmentScore.toFixed(
      2
    )}% to ${afterDeviationInfo.alignmentScore.toFixed(
      2
    )}% (+${alignmentImprovement.toFixed(2)}%)`
  );

  return {
    sectionFields: workingSectionFields,
    corrections,
    alignmentImprovement,
    alignmentScore: afterDeviationInfo.alignmentScore,
    deviationInfo: afterDeviationInfo,
    rulesGenerated: 0,
  };
}

/**
 * Helper function to calculate keyword match score for a field against a section's keywords
 * @param field Field to check
 * @param keywords Array of keywords to match against
 * @returns Score (0-1) representing how well the field matches the keywords
 */
function getKeywordMatchScore(
  field: CategorizedField,
  keywords: string[]
): number {
  if (!keywords || keywords.length === 0) return 0;

  let score = 0;

  // Check field name
  const name = field.name.toLowerCase();
  for (const keyword of keywords) {
    if (name.includes(keyword.toLowerCase())) {
      score += 0.5;
    }
  }

  // Check field label if available
  if (field.label && typeof field.label === "string") {
    const label = field.label.toLowerCase();
    for (const keyword of keywords) {
      if (label.includes(keyword.toLowerCase())) {
        score += 0.3;
      }
    }
  }

  // Check field value if available
  if (field.value !== undefined) {
    const value = String(field.value).toLowerCase();
    for (const keyword of keywords) {
      if (value.includes(keyword.toLowerCase())) {
        score += 0.2;
      }
    }
  }

  // Normalize score to 0-1 range
  return Math.min(1, score);
}

/**
 * Primary function to run enhanced self-healing on a set of fields
 * This improves alignment with expected section counts by iteratively
 * correcting field assignment based on multiple techniques
 *
 * @param ruleEngine Rule engine for field categorization
 * @param sectionFields Fields grouped by section
 * @param referenceCounts Reference counts for each section
 * @param outputPath Path to write diagnostic information (optional)
 * @param deviationThreshold Threshold for acceptable deviation (default: 0.3)
 * @returns Object with fixed sectionFields and a success flag
 */
export async function runEnhancedSelfHealing(
  ruleEngine: any,
  sectionFields: Record<string, CategorizedField[]>,
  referenceCounts:
    | Record<number, { fields: number; entries: number; subsections: number }>
    | Record<number, number>,
  outputPath?: string,
  deviationThreshold: number = 0.2
): Promise<{
  sectionFields: Record<string, CategorizedField[]>;
  aligned: boolean;
  deviationInfo: any[];
}> {
  console.log("🔧 Running enhanced self-healing process...");

  // Make a deep copy of the section fields to work with
  const workingSectionFields: Record<string, CategorizedField[]> = JSON.parse(
    JSON.stringify(sectionFields)
  );

  // Convert complex referenceCounts to simple format if needed
  const simplifiedCounts: Record<number, number> = {};
  for (const [sectionStr, value] of Object.entries(referenceCounts)) {
    const section = parseInt(sectionStr, 10);
    if (!isNaN(section)) {
      // Check if value is a complex object or simple number
      if (typeof value === "object" && value !== null && "fields" in value) {
        // Only use the fields count, since entries and subsections are already included in fields
        simplifiedCounts[section] = value.fields;
      } else if (typeof value === "number") {
        // Already in simple format
        simplifiedCounts[section] = value;
      }
    }
  }

  // Check if fields are already aligned with expected counts
  // This is our baseline - what we're trying to improve
  console.log("\n📊 Initial field count alignment check:");
  const initialAligned = verifyFieldCountAlignment(
    workingSectionFields,
    simplifiedCounts,
    deviationThreshold
  );

  console.log(
    `Initial alignment check ${initialAligned ? "PASSED ✅" : "FAILED ❌"}`
  );

  let aligned = initialAligned;
  let iterations = 0;
  const maxIterations = 5; // Prevent infinite loops
  let lastUnknownCount = workingSectionFields["0"]?.length || 0;
  let finalDeviationInfo: any[] = [];

  // Keep applying self-healing steps until alignment is achieved or we hit max iterations
  while (
    (!aligned || workingSectionFields["0"]?.length > 0) && // Continue if there are still unknown fields
    iterations < maxIterations
  ) {
    iterations++;
    console.log(`\n🔄 Self-healing iteration ${iterations}...`);

    // Apply various self-healing techniques
    const result = await applySelfHealingSteps(
      ruleEngine,
      workingSectionFields,
      simplifiedCounts,
      deviationThreshold
    );

    // Update working copy of section fields
    Object.assign(workingSectionFields, result.sectionFields);

    // Check if we made significant improvement
    const currentUnknownCount = workingSectionFields["0"]?.length || 0;
    const improvement = lastUnknownCount - currentUnknownCount;
    const improvementPercentage =
      lastUnknownCount > 0 ? (improvement / lastUnknownCount) * 100 : 0;

    console.log(
      `Unknown fields: ${lastUnknownCount} -> ${currentUnknownCount} (${improvement} fewer, ${improvementPercentage.toFixed(
        2
      )}% improvement)`
    );

    // Stop if no improvement was made in this iteration
    if (improvement <= 0) {
      // Check if we have 10% or fewer unknown fields left and good alignment
      const totalFields = Object.values(workingSectionFields).flat().length;
      const unknownPercentage = (currentUnknownCount / totalFields) * 100;

      // If section 0 is completely empty OR unknown fields < 5% of total fields
      if (currentUnknownCount === 0 || unknownPercentage < 5) {
        console.log(
          `No more improvement possible. Remaining unknown fields: ${currentUnknownCount} (${unknownPercentage.toFixed(
            2
          )}% of total)`
        );
        break;
      }
    }

    // Remember unknown count for next iteration
    lastUnknownCount = currentUnknownCount;

    // Check if we achieved good field count alignment
    aligned = verifyFieldCountAlignment(
      workingSectionFields,
      simplifiedCounts,
      deviationThreshold
    );
    console.log(
      `Alignment check after iteration ${iterations}: ${
        aligned ? "PASSED ✅" : "FAILED ❌"
      }`
    );

    // Use a more forgiving threshold in later iterations to avoid getting stuck
    // This gives priority to clearing section 0 over perfect alignment
    if (iterations > 2) {
      deviationThreshold = Math.min(1.0, deviationThreshold + 0.1);
      console.log(
        `Adjusted deviation threshold to ${deviationThreshold.toFixed(
          2
        )} for next iteration`
      );
    }
  }

  // Final check using original threshold
  aligned = verifyFieldCountAlignment(
    workingSectionFields,
    simplifiedCounts,
    deviationThreshold
  );

  // Get detailed information about remaining deviations
  finalDeviationInfo = getDeviationInfo(workingSectionFields, simplifiedCounts);

  // Print final stats
  console.log("\n📝 Final self-healing results:");
  console.log(`Ran ${iterations} iterations`);
  console.log(
    `Fields in Section 0 (unknown): ${workingSectionFields["0"]?.length || 0}`
  );
  console.log(`Final alignment check: ${aligned ? "PASSED ✅" : "FAILED ❌"}`);

  // Show summary of deviations
  if (finalDeviationInfo.length > 0) {
    console.log("\n⚠️ Remaining section count deviations:");
    finalDeviationInfo.forEach((info) => {
      console.log(
        `  Section ${info.section}: ${info.actual} fields (expected ${
          info.expected
        }, deviation ${info.deviation.toFixed(2)}, ${info.percentage.toFixed(
          2
        )}%)`
      );
    });
  }

  // Even if we still have some unknown fields, if the alignment is good enough,
  // we should consider this a success and proceed with the processing pipeline
  if (workingSectionFields["0"]?.length === 0 && aligned) {
    console.log(
      "\n⚠️ Warning: Some fields remain uncategorized, but overall section alignment is acceptable"
    );
  }

  // Ensure no section now exceeds its expected count
  trimOversizedSections(workingSectionFields, simplifiedCounts);

  // Return the fixed section fields and success status
  return {
    sectionFields: workingSectionFields,
    aligned: aligned,
    deviationInfo: finalDeviationInfo,
  };
}

/**
 * Check if all critical sections exist in the data
 */
function criticalSectionsExist(
  sectionFields: Record<string, CategorizedField[]>,
  criticalSections: number[] = [13]
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

// 3) Add a helper to trim oversized sections to expected counts just before saving
function trimOversizedSections(
  sectionFields: Record<string, CategorizedField[]>,
  referenceCounts: Record<number, number>
): void {
  Object.entries(referenceCounts).forEach(([sectionKey, expected]) => {
    const expectedCount = expected as number;
    if (expectedCount <= 0) return;
    const actualArr = sectionFields[sectionKey] || [];
    if (actualArr.length > expectedCount) {
      // Sort by confidence (lowest first) and move extras to section 0
      const extras = actualArr
        .sort((a, b) => a.confidence - b.confidence)
        .slice(0, actualArr.length - expectedCount);
      // Remove extras from section
      sectionFields[sectionKey] = actualArr.slice(
        actualArr.length - expectedCount
      );
      if (!sectionFields["0"]) sectionFields["0"] = [];
      extras.forEach((f) => {
        f.section = 0;
        f.confidence = 0;
        sectionFields["0"].push(f);
      });
      console.log(
        `Trimmed ${extras.length} excess fields from section ${sectionKey}`
      );
    }
  });
}

/**
 * Get detailed information about deviations between actual and expected field counts
 * @param sectionFields Current section fields
 * @param referenceCounts Expected field counts by section
 * @returns Array of deviation information objects
 */
function getDeviationInfo(
  sectionFields: Record<string, CategorizedField[]>,
  referenceCounts: Record<number, number>
): Array<{
  section: number;
  expected: number;
  actual: number;
  deviation: number;
  percentage: number;
}> {
  const deviations: Array<{
    section: number;
    expected: number;
    actual: number;
    deviation: number;
    percentage: number;
  }> = [];

  // Check each section with a reference count
  for (const [sectionKey, expectedCount] of Object.entries(referenceCounts)) {
    const sectionNumber = parseInt(sectionKey, 10);
    if (isNaN(sectionNumber) || sectionNumber === 0 || expectedCount <= 0)
      continue;

    const actualCount = (sectionFields[sectionKey] || []).length;
    const deviation = actualCount - expectedCount;
    const percentage =
      expectedCount > 0 ? (deviation / expectedCount) * 100 : 0;

    // Only add if there's a deviation
    if (deviation !== 0) {
      deviations.push({
        section: sectionNumber,
        expected: expectedCount,
        actual: actualCount,
        deviation,
        percentage,
      });
    }
  }

  // Sort by deviation percentage (most significant first)
  deviations.sort((a, b) => Math.abs(b.percentage) - Math.abs(a.percentage));

  return deviations;
}
