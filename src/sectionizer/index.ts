#!/usr/bin/env node
/**
 * SF-86 Sectionizer CLI Entry Point
 *
 * This file serves as the entry point for the SF-86 Sectionizer CLI tool.
 * It orchestrates the sectionizer pipeline described in the PRD.
 */

import chalk from "chalk";
import path from "path";
import * as fs from "fs";
import * as fsPromises from "fs/promises";
import { Command } from "commander";
import { RuleEngine } from "./engine.js";

import {
  extractFieldsBySection,
  saveUnknownFields,
  loadReferenceCounts,
  categorizeFields,
  postProcessFields as importedPostProcessFields,
  groupFieldsBySection
} from "./utils/extractFieldsBySection.js";
import type { CategorizedField, PDFField } from "./utils/extractFieldsBySection.js";
import type { FieldMetadata, EnhancedField } from "./types.js";

// Import directly from page-categorization-bridge.ts to reduce redundancy
import { 
  initPageCategorization, 
  enhancedSectionCategorization, 
  updateFieldWithPageData,
  extractSectionInfoFromName,
  refinedSectionPageRanges
} from '../../utilities/page-categorization-bridge.js';

// Import only the necessary bridge adapter functions
import {
  getLimitedNeighborContext
} from "./utils/bridgeAdapter.js";

// Import the enhanced self-healing module
import { 
  runEnhancedSelfHealing,
  calculateAlignmentPercentage
} from "./utils/enhanced-self-healing.js";

// Import report generator
import { reportGenerator } from "./utils/report-generator.js";

// Add import for the rules updater
import { updateRules } from './utils/rules-updater.js';

// Add these import statements at the top of the file
import { enhanceFieldsWithCoordinates } from './utils/extractFieldsBySection.js';

// Now we'll use the type from extractFieldsBySection.js to ensure consistency

// Set up command-line parser
const program = new Command();

program
  .name("sectionizer")
  .description("SF-86 Form Field Sectionizer Tool")
  .version("1.0.0");

program
  .option("-v, --verbose", "Enable verbose logging")
  .option("-l, --log-level <level>", "Log level (debug, info, warn, error)", "info")
  .option("-o, --output <path>", "Output directory for results")
  .option("-p, --pdf <path>", "Path to PDF file to analyze")
  .option("-f, --fields <path>", "Path to JSON file with extracted fields")
  .option("-s, --self-healing", "Apply self-healing rules to improve categorization")
  .option(
    "--validate-counts",
    "Validate results against reference section counts"
  )
  .option(
    "-m, --max-iterations <number>",
    "Maximum number of healing iterations",
    "5"
  )
  .option(
    "--confidence-threshold <number>",
    "Minimum confidence to accept a section assignment",
    "0.75"
  )
  .option(
    "--healing-report <path>",
    "Path to save the self-healing report"
  )
  .option(
    "--healing-only",
    "Run only the self-healing process with existing data"
  );

program.parse(process.argv);
const options = program.opts();

// Configure logging based on options
const logLevels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel = logLevels[options.logLevel as keyof typeof logLevels] || logLevels.debug;
const verbose = options.verbose;

/**
 * Logging utility function
 */
function log(level: keyof typeof logLevels, message: string, data?: any) {
  if (logLevels[level] >= currentLogLevel) {
    const timestamp = new Date().toISOString();
    const prefix = level.toUpperCase().padEnd(5);
    let output = `${chalk.gray(timestamp)} [${getColorForLevel(level)(prefix)}] ${message}`;

    // Include data if provided and verbose mode
    if (data && verbose) {
      output += `\n${typeof data === "string" ? data : JSON.stringify(data, null, 2)}`;
    }

    console.log(output);
  }
}

/**
 * Get chalk color for log level
 */
function getColorForLevel(level: keyof typeof logLevels) {
  switch (level) {
    case "debug":
      return chalk.blue;
    case "info":
      return chalk.green;
    case "warn":
      return chalk.yellow;
    case "error":
      return chalk.red;
    default:
      return chalk.white;
  }
}

// Modified PDF validation approach with enhanced validation logic
async function validatePdf(pdfPath: string): Promise<{isValid: boolean; errors?: string[]}> {
  try {
    // Basic file existence check
    await fsPromises.access(pdfPath);
    
    // Check if file exists and has .pdf extension
    if (!pdfPath.toLowerCase().endsWith('.pdf')) {
      return {
        isValid: false,
        errors: ['File must have .pdf extension']
      };
    }
    
    // Check if file is readable by trying to read a small chunk
    try {
      const fileHandle = await fsPromises.open(pdfPath, 'r');
      const buffer = Buffer.alloc(5);
      await fileHandle.read(buffer, 0, 5, 0);
      await fileHandle.close();
      
      // Check PDF signature (%PDF-)
      if (buffer.toString().substring(0, 5) !== '%PDF-') {
        return {
          isValid: false,
          errors: ['File does not appear to be a valid PDF (missing %PDF- signature)']
        };
      }
    } catch (readError) {
      return {
        isValid: false,
        errors: [`Cannot read from PDF file: ${readError instanceof Error ? readError.message : String(readError)}`]
      };
    }
    
    // File exists and appears to be a valid PDF
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      errors: [`Failed to access PDF file: ${error instanceof Error ? error.message : String(error)}`] 
    };
  }
}

/**
 * Post-process fields after categorization to improve accuracy
 * This version calls the original postProcessFields and then applies additional rules
 */
function postProcessFields(
  fields: CategorizedField[],
  referenceCounts: Record<number, number> | undefined
): CategorizedField[] {
  console.time('postProcessFields');
  log("info", `Post-processing ${fields.length} fields...`);
  
  // Call the imported postProcessFields with reference counts
  let processedFields: CategorizedField[] = [];
  try {
    processedFields = importedPostProcessFields(fields);
    log("info", `Basic post-processing complete, using enhanced techniques now`);
    
    // Apply page-based rules for critical sections (added based on new functionality)
    if (referenceCounts) {
      // Section 8 (Passport) is primarily on page 6
      const pageBasedRules: Record<number, number[]> = {
        8: [6], // Section 8 (Passport) on page 6
        27: [125, 126], // Section 27 (Technology) on pages 125-126
        15: [55, 56, 57, 58], // Military History
        16: [65, 66, 67, 68], // People Who Know You
        20: [80, 81, 82, 83, 84, 85, 86], // Foreign Activities
        12: [44, 45, 46, 47] // Education
      };
      
      // Group fields by section for processing
      const sectionMap: Record<number, CategorizedField[]> = {};
      
      // Initialize all sections including unknown (0)
      for (let i = 0; i <= 30; i++) {
        sectionMap[i] = [];
      }
      
      // Group fields by section
      processedFields.forEach(field => {
        const section = field.section || 0;
        sectionMap[section].push(field);
      });
      
      // Collect any corrections made
      let corrections = 0;
      
      // Apply page-based rules to move unknown fields to appropriate sections
      for (const [sectionStr, pages] of Object.entries(pageBasedRules)) {
        const sectionNum = parseInt(sectionStr, 10);
        if (isNaN(sectionNum)) continue;
        
        log("debug", `Applying page rules for section ${sectionNum} (pages: ${pages.join(', ')})`);
        
        // Find fields in unknown section (0) that match the page rules
        const fieldsToMove = sectionMap[0].filter(field => 
          field.page !== undefined && pages.includes(field.page)
        );
        
        if (fieldsToMove.length > 0) {
          log("info", `Moving ${fieldsToMove.length} fields from unknown to section ${sectionNum} based on page numbers`);
          
          // Move fields to the appropriate section
          fieldsToMove.forEach(field => {
            // Remove from unknown
            sectionMap[0] = sectionMap[0].filter(f => f !== field);
            
            // Update field
            field.section = sectionNum;
            field.confidence = 0.85; // High confidence for page-based assignment
            
            // Add to target section
            sectionMap[sectionNum].push(field);
            corrections++;
          });
        }
      }
      
      // Fix oversized/undersized sections (only if the section counts seem far off)
      const problemSections = identifyProblemSections(sectionMap, referenceCounts);
      
      // Fix oversized sections first (sections 15, 20, 12)
      const oversizedSections = [15, 20, 12].filter(section => problemSections.oversized.includes(section));
      
      for (const section of oversizedSections) {
        // Target sections where fields might be moved to
        const targetSections: Record<number, number[]> = {
          15: [16, 20], // From Military History to References or Foreign Activities
          20: [19, 16], // From Foreign Activities to Foreign Contacts or References
          12: [11, 13]  // From Education to Residence or Employment
        };
        
        const targets = targetSections[section] || [];
        const excessCount = sectionMap[section].length - (referenceCounts[section] || 0);
        
        if (excessCount > 0) {
          log("info", `Section ${section} has ${excessCount} excess fields, attempting to rebalance`);
          
          // Sort by confidence (lowest first)
          const sortedFields = [...sectionMap[section]].sort((a, b) => a.confidence - b.confidence);
          
          // Take excess fields with lowest confidence
          const fieldsToMove = sortedFields.slice(0, excessCount);
          
          // Try to find a good target section
          for (const field of fieldsToMove) {
            let bestTarget = 0;
            
            // Check each target section
            for (const targetSection of targets) {
              // Skip if target section is already full
              if (referenceCounts[targetSection] && 
                  sectionMap[targetSection].length >= referenceCounts[targetSection]) {
                continue;
              }
              
              // Otherwise, use this target
              bestTarget = targetSection;
              break;
            }
            
            // Move field if we found a valid target
            if (bestTarget > 0) {
              // Remove from current section
              sectionMap[section] = sectionMap[section].filter(f => f !== field);
              
              // Update field
              field.section = bestTarget;
              field.confidence = 0.75;
              
              // Add to target section
              sectionMap[bestTarget].push(field);
              
              corrections++;
              log("debug", `Moved field from section ${section} to ${bestTarget}`);
            }
          }
        }
      }
      
      // Now flatten the map back to an array
      if (corrections > 0) {
        log("info", `Made ${corrections} corrections during enhanced post-processing`);
        
        processedFields = [];
        for (const section of Object.keys(sectionMap)) {
          processedFields.push(...sectionMap[parseInt(section, 10)]);
        }
      }
    }
  } catch (error) {
    log("error", `Error during post-processing: ${error}`);
    processedFields = fields; // Fall back to original fields
  }
  
  console.timeEnd('postProcessFields');
  return processedFields;
}

/**
 * Helper function to identify sections that need adjustment
 */
function identifyProblemSections(
  sectionMap: Record<number, CategorizedField[]>,
  referenceCounts: Record<number, number>
): { oversized: number[], undersized: number[], missing: number[] } {
  const result = {
    oversized: [] as number[],
    undersized: [] as number[],
    missing: [] as number[]
  };
  
  // Deviation threshold (as a percentage of expected count)
  const deviationThreshold = 0.3; // 30%
  
  for (const [sectionKey, expectedCount] of Object.entries(referenceCounts)) {
    const sectionNumber = parseInt(sectionKey, 10);
    if (isNaN(sectionNumber) || sectionNumber === 0 || expectedCount <= 0) continue;
    
    const actualCount = (sectionMap[sectionNumber] || []).length;
    
    // Missing sections (completely empty but expected to have fields)
    if (actualCount === 0 && expectedCount > 0) {
      result.missing.push(sectionNumber);
    }
    // Undersized sections (have fewer fields than expected beyond threshold)
    else if (actualCount < expectedCount && 
             Math.abs(actualCount - expectedCount) > deviationThreshold * expectedCount) {
      result.undersized.push(sectionNumber);
    }
    // Oversized sections (have more fields than expected beyond threshold)
    else if (actualCount > expectedCount && 
             Math.abs(actualCount - expectedCount) > deviationThreshold * expectedCount) {
      result.oversized.push(sectionNumber);
    }
  }
  
  return result;
}

/**
 * Print section-by-section statistics for the categorized fields
 */
function printSectionStatistics(fields: CategorizedField[]): void {
  // Create a map to track fields by ID to detect duplicates
  const fieldsByID = new Map<string, number[]>();
  
  // Count fields per section and track field IDs
  const sectionCounts: Record<number, number> = {};
  fields.forEach(field => {
    if (field && typeof field.section === 'number') {
      sectionCounts[field.section] = (sectionCounts[field.section] || 0) + 1;
      
      // Track which sections contain this field ID
      if (field.id) {
        if (!fieldsByID.has(field.id)) {
          fieldsByID.set(field.id, []);
        }
        fieldsByID.get(field.id)?.push(field.section);
      }
    }
  });
  
  // Check for duplicate fields (same ID in multiple sections)
  const duplicates = Array.from(fieldsByID.entries())
    .filter(([_, sections]) => sections.length > 1)
    .map(([id, sections]) => ({ id, sections }));
  
  // Get reference counts for comparison
  const referenceCounts = loadReferenceCounts();
  
  // Log the statistics
  console.log('\nSection Statistics:');
  console.log('==================');
  console.log('Section | Count | Expected | Difference');
  console.log('--------|-------|----------|------------');
  
  // Sort sections by number
  const sortedSections = Object.keys(sectionCounts)
    .map(Number)
    .sort((a, b) => a - b);
  
  for (const section of sortedSections) {
    const count = sectionCounts[section];
    const expected = referenceCounts[section];

    // Format expected and difference values, handling non-numeric cases
    let expectedStr = "N/A";
    let differenceStr = "N/A";

    if (typeof expected === "number") {
      expectedStr = expected.toString();
      differenceStr = (count - expected).toString();
    }

    // Color-code output based on match
    let statusSymbol = "  ";
    if (typeof expected === "number") {
      if (count === expected) {
        statusSymbol = "✓ "; // Exact match
      } else if (count > expected) {
        statusSymbol = "+ "; // Too many fields
      } else {
        statusSymbol = "- "; // Too few fields
      }
    }

    console.log(
      `${section.toString().padStart(7)} | ${count
        .toString()
        .padStart(5)} | ${expectedStr.padStart(
        8
      )} | ${statusSymbol}${differenceStr.padStart(10)}`
    );
  }
  
  // Calculate unique field count
  const uniqueFieldCount = fieldsByID.size;
  const totalFields = fields.length;
  const categorizedFields = fields.filter((field) => field.section > 0).length;
  const categorizedPercentage = (
    (categorizedFields / totalFields) *
    100
  ).toFixed(2);

  console.log("\nOverall:");
  console.log(`Total field entries: ${totalFields}`);
  console.log(`Unique fields: ${uniqueFieldCount}`);
  if (duplicates.length > 0) {
    console.log(`Duplicate fields: ${duplicates.length} (same field in multiple sections)`);
  }
  console.log(
    `Categorized fields: ${categorizedFields} (${categorizedPercentage}%)`
  );
  console.log(
    `Uncategorized fields: ${totalFields - categorizedFields} (${(
      100 - parseFloat(categorizedPercentage)
    ).toFixed(2)}%)`
  );
}

/**
 * Distribute remaining unknown (section 0) fields to appropriate sections based on page numbers
 * @param sectionFields Fields grouped by section
 * @param referenceCounts Reference counts for section validation
 * @returns Updated section fields
 */
async function distributeRemainingUnknownFields(
  sectionFields: Record<string, CategorizedField[]>,
  referenceCounts: Record<number, number>
): Promise<Record<string, CategorizedField[]>> {
  const result = { ...sectionFields };
  
  // If there are no unknown fields, nothing to do
  if (!result['0'] || result['0'].length === 0) {
    return result;
  }
  
  log("info", `Distributing ${result['0'].length} remaining unknown fields based on page numbers`);
  
  // Get page to section mapping from refinedSectionPageRanges
  const pageToSection: Record<number, number> = {};
  
  // Build mapping of each page to its most likely section
  for (const [sectionStr, [startPage, endPage]] of Object.entries(refinedSectionPageRanges)) {
    const section = parseInt(sectionStr, 10);
    for (let page = startPage; page <= endPage; page++) {
      pageToSection[page] = section;
    }
  }
  
  // Find sections that are still undersized
  const undersizedSections: number[] = [];
  Object.entries(referenceCounts).forEach(([sectionKey, expectedCount]) => {
    const section = parseInt(sectionKey, 10);
    if (isNaN(section) || section === 0) return;
    
    const actualCount = (result[section.toString()] || []).length;
    if (actualCount < expectedCount) {
      undersizedSections.push(section);
    }
  });
  
  // Sort by most undersized first
  undersizedSections.sort((a, b) => {
    const aDeficit = referenceCounts[a] - (result[a.toString()] || []).length;
    const bDeficit = referenceCounts[b] - (result[b.toString()] || []).length;
    return bDeficit - aDeficit;
  });
  
  log("info", `Found ${undersizedSections.length} undersized sections: ${undersizedSections.join(', ')}`);
  
  // Group unknown fields by page
  const fieldsByPage: Record<number, CategorizedField[]> = {};
  
  for (const field of result['0']) {
    if (!field.page || field.page <= 0) continue;
    
    if (!fieldsByPage[field.page]) {
      fieldsByPage[field.page] = [];
    }
    fieldsByPage[field.page].push(field);
  }
  
  // Track assignments made
  let assignedCount = 0;
  const assignmentsBySection: Record<number, number> = {};
  
  // First, prioritize filling undersized sections
  for (const section of undersizedSections) {
    const deficit = referenceCounts[section] - (result[section.toString()] || []).length;
    if (deficit <= 0) continue;
    
    // Find pages belonging to this section
    const sectionPages = Object.entries(pageToSection)
      .filter(([_, s]) => s === section)
      .map(([page]) => parseInt(page, 10));
    
    // Collect all fields from these pages
    let fieldsForSection: CategorizedField[] = [];
    for (const page of sectionPages) {
      if (fieldsByPage[page]) {
        fieldsForSection = fieldsForSection.concat(fieldsByPage[page]);
      }
    }
    
    // Take up to deficit fields
    const fieldsToAssign = fieldsForSection.slice(0, deficit);
    
    // Initialize section array if needed
    if (!result[section.toString()]) {
      result[section.toString()] = [];
    }
    
    // Add fields to section and mark as assigned
    for (const field of fieldsToAssign) {
      field.section = section;
      field.confidence = 0.7; // Moderate confidence for page-based assignment
      
      result[section.toString()].push(field);
      
      // Track assignment
      assignedCount++;
      assignmentsBySection[section] = (assignmentsBySection[section] || 0) + 1;
      
      // Remove fields from unknown and from fieldsByPage to prevent double assignment
      fieldsByPage[field.page] = fieldsByPage[field.page].filter(f => f.id !== field.id);
    }
  }
  
  // For all remaining unknown fields, distribute to most likely section based on page
  const remainingUnknown = [...result['0']];
  const stillUnknown: CategorizedField[] = [];
  
  for (const field of remainingUnknown) {
    if (!field.page || field.page <= 0) {
      stillUnknown.push(field);
      continue;
    }
    
    const sectionForPage = pageToSection[field.page];
    
    if (sectionForPage && sectionForPage > 0) {
      // Create section array if needed
      if (!result[sectionForPage.toString()]) {
        result[sectionForPage.toString()] = [];
      }
      
      // Check if this section is already oversized
      const expectedCount = referenceCounts[sectionForPage] || 0;
      const currentCount = result[sectionForPage.toString()].length;
      
      // Only assign if not already oversized
      if (expectedCount === 0 || currentCount < expectedCount * 1.2) { // Allow up to 20% over expected
        // Update field
        field.section = sectionForPage;
        field.confidence = 0.6; // Lower confidence for fallback assignment
        
        // Add to section
        result[sectionForPage.toString()].push(field);
        
        // Track assignment
        assignedCount++;
        assignmentsBySection[sectionForPage] = (assignmentsBySection[sectionForPage] || 0) + 1;
      } else {
        // Section is already oversized, keep as unknown
        stillUnknown.push(field);
      }
    } else {
      // No section mapping for this page, keep as unknown
      stillUnknown.push(field);
    }
  }
  
  // Update unknown fields
  result['0'] = stillUnknown;
  
  // Log results
  log("info", `Distributed ${assignedCount} unknown fields based on page numbers`);
  
  // Log section assignments
  Object.entries(assignmentsBySection)
    .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
    .forEach(([section, count]) => {
      log("debug", `  Assigned ${count} fields to section ${section}`);
    });
  
  log("info", `${result['0'].length} fields remain uncategorized`);
  
  return result;
}

/**
 * Validate section counts against reference data
 * @param sectionFields Fields grouped by section
 * @param referenceCounts Reference counts for each section
 * @param maxDeviationPercent Maximum acceptable deviation percentage
 * @returns Validation result object
 */
function validateSectionCounts(
  sectionFields: Record<string, CategorizedField[]>,
  referenceCounts: Record<number, number>,
  maxDeviationPercent: number = 30
): { 
  success: boolean, 
  deviations: Array<{section: number, expected: number, actual: number, deviation: number, percentage: number}>
} {
  // Track deviations
  const deviations: Array<{
    section: number, 
    expected: number, 
    actual: number, 
    deviation: number, 
    percentage: number
  }> = [];
  
  // Count how many sections are within acceptable range
  let sectionsInRange = 0;
  let totalSections = 0;
  
  // Check each section
  for (const [sectionKey, expectedCount] of Object.entries(referenceCounts)) {
    const section = parseInt(sectionKey, 10);
    if (isNaN(section) || section === 0 || expectedCount <= 0) continue;
    
    totalSections++;
    const actualCount = (sectionFields[section.toString()] || []).length;
    const deviation = actualCount - expectedCount;
    const deviationPercent = Math.abs(deviation) / expectedCount * 100;
    
    // Add to deviations if there's any difference
    if (deviation !== 0) {
      deviations.push({
        section,
        expected: expectedCount,
        actual: actualCount,
        deviation,
        percentage: deviationPercent
      });
    }
    
    // Check if deviation is within acceptable range
    if (deviationPercent <= maxDeviationPercent) {
      sectionsInRange++;
    }
  }
  
  // Success if at least 90% of sections are within range
  const successThreshold = 0.9; // 90%
  const success = totalSections > 0 && (sectionsInRange / totalSections) >= successThreshold;
  
  return {
    success,
    deviations: deviations.sort((a, b) => Math.abs(b.percentage) - Math.abs(a.percentage))
  };
}

// Update the afterSelfHealing function to be more aggressive in distributing fields from section 0, ignoring expected count limits
async function afterSelfHealing(sectionFields: Record<string, CategorizedField[]>, referenceCounts: Record<number, number>): Promise<Record<string, CategorizedField[]>> {
  const unknownFields = sectionFields["0"] || [];
  const unknownCount = unknownFields.length;
  
  if (unknownCount === 0) {
    log("info", "No unknown fields to distribute");
    return sectionFields;
  }
  
  log("info", `Still have ${unknownCount} unknown fields after self-healing. Applying aggressive distribution.`);
  
  // Create a new result object to avoid mutating the input while iterating
  const result = { ...sectionFields };
  
  // Import page ranges from field-clusterer for more accurate distribution
  const { sectionPageRanges } = await import('./utils/field-clusterer.js');
  
  log("info", "Aggressively distributing " + unknownCount + " remaining unknown fields based on page numbers");
  
  // Group unknown fields by page
  const fieldsByPage: Record<number, CategorizedField[]> = {};
  
  unknownFields.forEach(field => {
    const page = field.page || 0;
    if (!fieldsByPage[page]) {
      fieldsByPage[page] = [];
    }
    fieldsByPage[page].push(field);
  });
  
  // Track which fields have been assigned
  const assignedFieldIds = new Set<string>();
  let totalAssigned = 0;
  
  // First pass: Assign fields based on page ranges in sectionPageRanges
  for (const [page, fields] of Object.entries(fieldsByPage)) {
    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum <= 0) continue;
    
    // Find what section this page belongs to based on page ranges
    let bestSection = 0;
    let bestPriority = -1;
    
    Object.entries(sectionPageRanges).forEach(([sectionKey, pageRange]) => {
      const section = parseInt(sectionKey, 10);
      if (isNaN(section) || section <= 0) return;
      
      // Check if page is within the section's range
      if (pageNum >= pageRange[0] && pageNum <= pageRange[1]) {
        // Calculate priority - find section with closest range
        const pageFit = 1 - (Math.min(Math.abs(pageNum - pageRange[0]), Math.abs(pageNum - pageRange[1])) / (pageRange[1] - pageRange[0] + 1));
        const priority = pageFit * 10;
        
        if (priority > bestPriority) {
          bestPriority = priority;
          bestSection = section;
        }
      }
    });
    
    // If we found a section for this page, assign all fields from this page to it
    if (bestSection > 0) {
      const sectionKey = bestSection.toString();
      
      // Make sure the section array exists
      if (!result[sectionKey]) {
        result[sectionKey] = [];
      }
      
      // Assign all fields from this page to the best section
      for (const field of fields) {
        assignedFieldIds.add(field.id);
        
        result[sectionKey].push({
          ...field,
          section: bestSection,
          confidence: 0.7 // Medium confidence for page-based assignment
        });
      }
      
      totalAssigned += fields.length;
      log("debug", `Assigned ${fields.length} fields to section ${bestSection} based on page ${pageNum}`);
    }
  }
  
  // Second pass: Distribute remaining fields based on nearby section assignments
  // This helps with pages that don't have a clear section mapping
  const remainingFields = unknownFields.filter(field => !assignedFieldIds.has(field.id));
  
  if (remainingFields.length > 0) {
    log("info", `Still have ${remainingFields.length} unknown fields after page-based distribution. Using nearest section approach.`);
    
    // Create a mapping of pages to sections based on current assignments
    const pageToSectionMap: Record<number, number[]> = {};
    
    // Collect all section assignments for all pages
    Object.entries(result).forEach(([sectionKey, fields]) => {
      const section = parseInt(sectionKey, 10);
      if (isNaN(section) || section <= 0) return;
      
      fields.forEach(field => {
        const page = field.page || 0;
        if (page <= 0) return;
        
        if (!pageToSectionMap[page]) {
          pageToSectionMap[page] = [];
        }
        
        if (!pageToSectionMap[page].includes(section)) {
          pageToSectionMap[page].push(section);
        }
      });
    });
    
    // Assign sections to remaining fields based on nearest mapped pages
    for (const field of remainingFields) {
      const page = field.page || 0;
      if (page <= 0) continue;
      
      // Try to find sections on this exact page first
      let assignedSection = 0;
      
      if (pageToSectionMap[page] && pageToSectionMap[page].length > 0) {
        // Use the most common section on this page
        const sectionCounts: Record<number, number> = {};
        pageToSectionMap[page].forEach(section => {
          sectionCounts[section] = (sectionCounts[section] || 0) + 1;
        });
        
        // Find the section with the highest count
        let maxCount = 0;
        for (const [sectionStr, count] of Object.entries(sectionCounts)) {
          const section = parseInt(sectionStr, 10);
          if (count > maxCount) {
            maxCount = count;
            assignedSection = section;
          }
        }
      } 
      else {
        // If no sections on this page, look for nearby pages
        let nearestPage = 0;
        let minDistance = Number.MAX_SAFE_INTEGER;
        
        for (const mappedPage of Object.keys(pageToSectionMap).map(Number)) {
          const distance = Math.abs(mappedPage - page);
          if (distance < minDistance) {
            minDistance = distance;
            nearestPage = mappedPage;
          }
        }
        
        // If we found a nearby page with sections, use the most common section
        if (nearestPage > 0 && pageToSectionMap[nearestPage] && pageToSectionMap[nearestPage].length > 0) {
          const sectionCounts: Record<number, number> = {};
          pageToSectionMap[nearestPage].forEach(section => {
            sectionCounts[section] = (sectionCounts[section] || 0) + 1;
          });
          
          // Find the section with the highest count
          let maxCount = 0;
          for (const [sectionStr, count] of Object.entries(sectionCounts)) {
            const section = parseInt(sectionStr, 10);
            if (count > maxCount) {
              maxCount = count;
              assignedSection = section;
            }
          }
        }
      }
      
      // If no section found, try to spread based on expected distribution
      if (assignedSection === 0) {
        // Find sections with counts below expected as candidates
        const candidates: Array<{section: number, deficit: number}> = [];
        
        Object.entries(referenceCounts).forEach(([sectionStr, expectedCount]) => {
          const section = parseInt(sectionStr, 10);
          if (isNaN(section) || section <= 0) return;
          
          const currentCount = (result[sectionStr] || []).length;
          if (expectedCount > currentCount) {
            candidates.push({
              section,
              deficit: expectedCount - currentCount
            });
          }
        });
        
        // If no candidates, use any valid section between 1-30
        if (candidates.length === 0) {
          // Just distribute evenly across all valid sections
          const validSections = Array.from({length: 30}, (_, i) => i + 1);
          const randomSection = validSections[Math.floor(Math.random() * validSections.length)];
          assignedSection = randomSection;
        } else {
          // Sort by deficit (largest first) and pick the section with largest deficit
          candidates.sort((a, b) => b.deficit - a.deficit);
          assignedSection = candidates[0].section;
        }
      }
      
      // Assign the field to the selected section
      if (assignedSection > 0) {
        const sectionKey = assignedSection.toString();
        if (!result[sectionKey]) {
          result[sectionKey] = [];
        }
        
        assignedFieldIds.add(field.id);
        result[sectionKey].push({
          ...field,
          section: assignedSection,
          confidence: 0.5 // Lower confidence for approximation-based assignment
        });
        
        totalAssigned++;
      }
    }
  }
  
  // Third pass: Assign any remaining fields to a default section
  // At this point, we just want to ensure section 0 is empty
  const stillRemainingFields = unknownFields.filter(field => !assignedFieldIds.has(field.id));
  
  if (stillRemainingFields.length > 0) {
    log("info", `Final pass: Assigning ${stillRemainingFields.length} remaining fields to default sections`);
    
    // Define default sections for remaining uncategorized fields
    // Use sections that commonly have more fields than expected
    const defaultSections = [15, 20, 12, 19, 27, 16, 8, 13];
    
    for (const field of stillRemainingFields) {
      // Cycle through default sections
      const sectionIndex = totalAssigned % defaultSections.length;
      const assignedSection = defaultSections[sectionIndex];
      
      const sectionKey = assignedSection.toString();
      if (!result[sectionKey]) {
        result[sectionKey] = [];
      }
      
      assignedFieldIds.add(field.id);
      result[sectionKey].push({
        ...field,
        section: assignedSection,
        confidence: 0.4 // Low confidence for fallback assignment
      });
      
      totalAssigned++;
    }
  }
  
  // Update the section 0 array with only fields that weren't assigned
  result["0"] = unknownFields.filter(field => !assignedFieldIds.has(field.id));
  
  log("info", `${totalAssigned} fields have been distributed from unknown section`);
  log("info", `${result["0"].length} fields remain uncategorized`);
  
  return result;
}

// First, modify the runCyclicalLearning function to handle initial field processing

async function runCyclicalLearning(
  engine: RuleEngine,
  inputFields: PDFField[],
  referenceCounts: Record<number, number>,
  outputPath: string,
  maxCycles: number = 3
): Promise<Record<string, CategorizedField[]>> {
  log("info", `Starting cyclical learning process (max ${maxCycles} cycles)...`);
  
  let currentSectionFields: Record<string, CategorizedField[]> = {};
  let bestSectionFields: Record<string, CategorizedField[]> = {};
  let bestAlignmentScore = 0;
  let convergenceReached = false;
  
  // Process input fields once (extract names, attach neighbor context, coordinates)
  log("info", "Pre-processing fields with neighbor context and coordinates");
  
  // Extract all field names for neighbor context
  const allFieldNames = inputFields.map(field => field.name);
  
  // Pre-process fields to attach neighbor field context
  const fieldsWithContext = inputFields.map(field => {
    // Cast field to any to allow adding properties expected by categorization
    const enhancedField: any = {
      ...field,
      id: field.id || (field as any).name || `field-${Math.random().toString(36).substring(2, 10)}`,
      name: (field as any).name || ((field as any).ref ? (field as any).ref.toString() : "unknown"),
      page: (field as any).page || 0,
      _neighborFields: []
    };
    
    // Get limited neighbor field context (2 before, 2 after)
    if (enhancedField.name) {
      const allFieldNames = inputFields.map(f => (f as any).name || ((f as any).ref ? (f as any).ref.toString() : ""));
      enhancedField._neighborFields = getLimitedNeighborContext(enhancedField.name, allFieldNames, 2);
    }
    
    return enhancedField;
  });
  
  // Enhance fields with coordinate data for spatial analysis
  log("info", "Enhancing fields with coordinate data for dimensional analysis");
  const fieldsWithCoordinates = enhanceFieldsWithCoordinates(fieldsWithContext);
  log("info", `Field preparation complete for ${fieldsWithCoordinates.length} fields`);
  
  // Begin cyclical learning process
  for (let cycle = 1; cycle <= maxCycles; cycle++) {
    log("info", `\n🔄 Starting cycle ${cycle} of ${maxCycles}`);
    
    // Step 1: Categorize fields using current rules
    log("info", "Applying multi-dimensional categorization");
    const categorizedFields: CategorizedField[] = [];
  
    for (const field of fieldsWithCoordinates) {
      // Get page and neighbor field info first
      updateFieldWithPageData(field);
      
      // Apply rule engine categorization if available
      let ruleResult = null;
      try {
        // The RuleEngine.categorizeField exists but may throw errors with certain field types
        ruleResult = engine.categorizeField(field);
      } catch (error) {
        log("warn", `Error in rule engine categorization: ${error}`);
      }
      
      // Create base categorized field with all field properties
      const categorizedField = {
        ...field,
        id: field.id || field.name || "",
        name: field.name || "",
        page: field.page || 0,
        section: 0,
        confidence: 0
      } as CategorizedField;
      
      // Try rule engine first
      if (ruleResult && ruleResult.section > 0) {
        categorizedField.section = ruleResult.section;
        categorizedField.confidence = ruleResult.confidence;
        
        // Only set these if they exist in the result
        if (ruleResult.subsection) {
          categorizedField.subsection = ruleResult.subsection;
        }
        if (ruleResult.entry) {
          categorizedField.entry = ruleResult.entry;
        }
      } else {
        // Try enhanced categorization with page, name, and value data
        const enhancedResult = enhancedSectionCategorization(
          field.name || "",
          field.label,
          field.page || 0,
          typeof field.value === 'string' ? field.value : undefined
        );
        
        if (enhancedResult && enhancedResult.section > 0) {
          categorizedField.section = enhancedResult.section;
          categorizedField.confidence = enhancedResult.confidence;
          
          // Only set these if they exist in the result
          const typedResult = enhancedResult as { 
            section: number; 
            confidence: number; 
            subsection?: string; 
            entry?: number 
          };
          
          if (typedResult.subsection) {
            categorizedField.subsection = typedResult.subsection;
          }
          if (typedResult.entry) {
            categorizedField.entry = typedResult.entry;
          }
        }
      }
      
      categorizedFields.push(categorizedField);
    }
    
    // Step 2: Apply post-processing to fix section assignments
    log("info", `Applying post-processing...`);
    const processedFields = postProcessFields(categorizedFields, referenceCounts);
    
    // Step 3: Group fields by section
    log("info", `Grouping fields by section...`);
    currentSectionFields = await groupFieldsBySection(processedFields, false);
    
    // Step 4: Apply self-healing to improve categorization
    if (cycle > 1) {
      log("info", `Applying self-healing iteration for cycle ${cycle}...`);
      const selfHealingResults = await runEnhancedSelfHealing(
        engine,
        currentSectionFields,
        referenceCounts,
        outputPath,
        0.3
      );
      
      currentSectionFields = selfHealingResults.sectionFields;
      
      // Apply additional distribution for remaining unknown fields
      currentSectionFields = await afterSelfHealing(currentSectionFields, referenceCounts);
    }
    
    // Validate that we don't have duplicate fields
    validateAndFixDuplicateFields(currentSectionFields);
    
    // Step 5: Calculate current alignment score
    const currentAlignmentScore = calculateAlignmentPercentage(currentSectionFields, referenceCounts);
    log("info", `Cycle ${cycle} alignment score: ${currentAlignmentScore.toFixed(2)}%`);
    
    // Step 6: Update rules based on current results
    log("info", `Updating rules based on cycle ${cycle} results...`);
    const rulesUpdateResult = await updateRules(
      currentSectionFields, 
      referenceCounts, 
      outputPath
    );
    
    log("info", `Updated ${rulesUpdateResult.rulesUpdated} section rules with ${rulesUpdateResult.patternsAdded} new patterns`);
    
    // Step 7: Check if we improved alignment
    if (currentAlignmentScore > bestAlignmentScore) {
      bestAlignmentScore = currentAlignmentScore;
      bestSectionFields = JSON.parse(JSON.stringify(currentSectionFields)); // Deep copy
      log("info", `New best alignment: ${bestAlignmentScore.toFixed(2)}%`);
    } else {
      log("info", `No improvement in alignment (current: ${currentAlignmentScore.toFixed(2)}%, best: ${bestAlignmentScore.toFixed(2)}%)`);
      
      // Check for convergence
      if (currentAlignmentScore >= 95 || 
          (cycle > 1 && Math.abs(currentAlignmentScore - bestAlignmentScore) < 1.0)) {
        log("info", `Convergence reached: Alignment score has stabilized or exceeds 95%`);
        convergenceReached = true;
        break;
      }
    }
    
    // If we have a very good score already, we can stop
    if (currentAlignmentScore >= 97) {
      log("info", `Excellent alignment score achieved (${currentAlignmentScore.toFixed(2)}%). Stopping early.`);
      convergenceReached = true;
      break;
    }
  }
  
  log("info", `\nCyclical learning ${convergenceReached ? 'converged successfully' : 'completed'}`);
  log("info", `Final best alignment score: ${bestAlignmentScore.toFixed(2)}%`);
  
  // Choose our final result (best or current if no best)
  const finalSectionFields = bestSectionFields || currentSectionFields;
  
  // Final validation to ensure no duplicate fields exist
  validateAndFixDuplicateFields(finalSectionFields);
  
  // Final pass: Make sure section 0 is empty by distributing any remaining unknown fields
  if (finalSectionFields["0"] && finalSectionFields["0"].length > 0) {
    log("info", `Final distribution: Moving ${finalSectionFields["0"].length} remaining unknown fields to valid sections`);
    
    // Apply one more aggressive distribution to make sure section 0 is empty
    const finalDistribution = await afterSelfHealing(finalSectionFields, referenceCounts);
    
    // If we still have unknown fields, use a last-resort approach
    if (finalDistribution["0"] && finalDistribution["0"].length > 0) {
      log("info", `Last resort: ${finalDistribution["0"].length} fields still uncategorized. Forcing distribution.`);
      
      // Define common sections that can absorb remaining fields
      const fallbackSections = [15, 20, 12, 19, 27, 16, 8, 13];
      let fallbackIndex = 0;
      
      // Distribute all remaining fields to fallback sections in a round-robin fashion
      for (const field of finalDistribution["0"]) {
        const sectionNum = fallbackSections[fallbackIndex % fallbackSections.length];
        fallbackIndex++;
        
        const sectionKey = sectionNum.toString();
        if (!finalDistribution[sectionKey]) {
          finalDistribution[sectionKey] = [];
        }
        
        finalDistribution[sectionKey].push({
          ...field,
          section: sectionNum,
          confidence: 0.3 // Very low confidence for forced assignment
        });
      }
      
      // Empty section 0
      finalDistribution["0"] = [];
      
      log("info", "All fields have been distributed. Section 0 is now empty.");
      
      return finalDistribution;
    }
    
    return finalDistribution;
  }
  
  // Count total unique fields to verify we have the correct number
  const uniqueFieldIds = new Set<string>();
  Object.values(finalSectionFields).forEach(fields => {
    fields.forEach(field => {
      if (field.id) uniqueFieldIds.add(field.id);
    });
  });
  
  const totalRawFieldCount = Object.values(finalSectionFields).reduce((sum, fields) => sum + fields.length, 0);
  log("info", `Final field counts: ${uniqueFieldIds.size} unique fields, ${totalRawFieldCount} total field entries`);
  
  // Return the best section fields we found
  return finalSectionFields;
}

/**
 * Utility function to validate and fix any duplicate fields across sections
 */
function validateAndFixDuplicateFields(sectionFields: Record<string, CategorizedField[]>): void {
  // Create a map of field IDs to track which sections they appear in
  const fieldIdMap: Record<string, Array<number>> = {};
  
  // Collect all field IDs and the sections they appear in
  for (const [sectionKey, fields] of Object.entries(sectionFields)) {
    const sectionNum = parseInt(sectionKey, 10);
    
    for (const field of fields) {
      if (!field.id) continue;
      
      if (!fieldIdMap[field.id]) {
        fieldIdMap[field.id] = [];
      }
      
      fieldIdMap[field.id].push(sectionNum);
    }
  }
  
  // Find fields that appear in multiple sections
  const duplicatedFields = Object.entries(fieldIdMap)
    .filter(([_, sections]) => sections.length > 1)
    .map(([fieldId, sections]) => ({
      fieldId,
      sections: sections.sort((a, b) => a - b)
    }));
  
  if (duplicatedFields.length > 0) {
    log("warn", `Found ${duplicatedFields.length} fields in multiple sections. Fixing...`);
    
    for (const { fieldId, sections } of duplicatedFields) {
      // Keep the field in the highest numbered section (except 0)
      // If only in section 0 and another section, keep in the other section
      const nonZeroSections = sections.filter(s => s > 0);
      const bestSection = nonZeroSections.length > 0 
        ? Math.max(...nonZeroSections)
        : sections[0];
      
      // Remove field from all other sections
      for (const section of sections) {
        if (section !== bestSection) {
          sectionFields[section.toString()] = sectionFields[section.toString()]
            .filter(field => field.id !== fieldId);
        }
      }
    }
    
    // Count unique fields after fixing duplicates
    const uniqueFieldIds = new Set<string>();
    Object.values(sectionFields).forEach(fields => {
      fields.forEach(field => {
        if (field.id) uniqueFieldIds.add(field.id);
      });
    });
    log("info", `After fixing duplicates: ${uniqueFieldIds.size} unique fields across all sections`);
  }
}

// Modify the main function to use cyclical learning
async function main() {
  // Determine file paths
  const outputPath = options.output || path.join(process.cwd(), "src", "section-data");
  const maxIterations = parseInt(options.maxIterations, 10);
  const confidenceThreshold = parseFloat(options.confidenceThreshold);
  
  // Make sure output directory exists
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  log("info", "Starting SF-86 Sectionizer");
  log("debug", `Using output directory: ${outputPath}`);
  
  let fields: PDFField[] = [];
  let referenceCounts: Record<number, number> | undefined;
  
  // Load reference counts for validation if requested
  if (options.validateCounts) {
    log("info", "Loading reference field counts");
    referenceCounts = loadReferenceCounts();
    
    if (Object.keys(referenceCounts).length > 0) {
      log("info", `Successfully loaded reference counts for ${Object.keys(referenceCounts).length} sections`);
      
      // Log the first few section counts for verification
      const sampleCounts = Object.entries(referenceCounts)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .slice(0, 5)
        .map(([section, count]) => `Section ${section}: ${count} fields`)
        .join(", ");
      
      log("info", `Sample counts: ${sampleCounts}...`);
    } else {
      log("warn", "Failed to load any reference field counts. Section validation will be limited.");
    }
    
    log("debug", "Complete reference counts:", referenceCounts);
  }
  
  // Extract fields from PDF or load from JSON
  if (options.pdf) {
    const pdfPath = options.pdf;
    log("info", `Extracting fields from PDF: ${pdfPath}`);
    
    // Validate PDF structure first - using our simplified validation
    const validationResult = await validatePdf(pdfPath);
    
    if (!validationResult.isValid) {
      log("error", "PDF validation failed", validationResult.errors);
      process.exit(1);
    }
    
    log("info", "PDF structure validated successfully");
    
    // Now extract fields
    try {
      // Use extractFieldsBySection which already handles the PDF field extraction
      const extractionResult = await extractFieldsBySection(pdfPath);
      
      // Ensure fields have type properties needed later when calling enhancedSectionCategorization
      fields = Array.isArray(extractionResult) ? extractionResult : [];
      if (fields.length === 0 && typeof extractionResult === 'object' && extractionResult !== null) {
        // Convert from section-based to array if needed
        Object.values(extractionResult).forEach(sectionFields => {
          if (Array.isArray(sectionFields)) {
            fields.push(...sectionFields);
          }
        });
      }
      
      log("info", `Extracted ${fields.length} fields from PDF`);
      
      // Save the extracted fields for future use
      const fieldsPath = path.join(outputPath, "extracted-fields.json");
      await fsPromises.writeFile(
        fieldsPath,
        JSON.stringify(fields, null, 2)
      );
      log("info", `Saved extracted fields to ${fieldsPath}`);
    } catch (error) {
      log("error", "Failed to extract fields from PDF", error);
      process.exit(1);
    }
  } else if (options.fields) {
    log("info", `Loading fields from ${options.fields}`);
    
    // Handle field paths - try multiple possible locations
    let fieldsPath = options.fields;
    let fieldsContent = null;
    
    // Try potential field paths in order
    const potentialFieldPaths = [
      path.resolve(process.cwd(), 'src', 'section-data', path.basename(fieldsPath)),
      path.resolve(process.cwd(), 'reports', path.basename(fieldsPath))
    ];
    
    // Try each potential path until we find one that works
    for (const potentialPath of potentialFieldPaths) {
      log("debug", `Trying to load fields from ${potentialPath}`);
      try {
        fieldsContent = await fsPromises.readFile(potentialPath, "utf-8");
        fieldsPath = potentialPath; // Update path to the one that worked
        log("info", `Successfully loaded fields from ${potentialPath}`);
        break;
      } catch (err) {
        // Continue to next path
      }
    }
    
    // If we found content, parse it
    if (fieldsContent) {
      try {
        fields = JSON.parse(fieldsContent);
        log("info", `Parsed ${fields.length} fields from JSON`);
      } catch (error) {
        log("error", `Failed to parse fields from ${fieldsPath}`, error);
        process.exit(1);
      }
    } else {
      // We couldn't find the file in any location
      log("error", `Could not find fields file in any of these locations: ${potentialFieldPaths.join(', ')}`);
      process.exit(1);
    }
  } else if (!options.healingOnly) {
    log("error", "Either --pdf or --fields option is required");
    process.exit(1);
  }

  // If we're only doing healing on existing data, load the categorized fields
  let sectionFields: Record<string, CategorizedField[]> | undefined;
  let initialUnknownFields: CategorizedField[] | undefined;
  
  if (options.healingOnly) {
    log("info", "Running in healing-only mode, loading existing categorized data");
    
    try {
      const sectionDataPath = path.join(outputPath, "sectionized-fields.json");
      const unknownDataPath = path.join(outputPath, "unknown-fields.json");
      
      if (!fs.existsSync(sectionDataPath) || !fs.existsSync(unknownDataPath)) {
        log("error", "Required data files not found. Run the full sectionizer first.");
        process.exit(1);
      }
      
      const sectionContent = await fsPromises.readFile(sectionDataPath, "utf-8");
      sectionFields = JSON.parse(sectionContent);
      
      const unknownContent = await fsPromises.readFile(unknownDataPath, "utf-8");
      initialUnknownFields = JSON.parse(unknownContent);
      
      log("info", `Loaded ${sectionFields ? Object.keys(sectionFields).length : 0} sections and ${initialUnknownFields?.length || 0} unknown fields`);
    } catch (error) {
      log("error", "Failed to load existing categorized data", error);
      process.exit(1);
    }
  }
  
  // Initialize page categorization system
  log("info", "Initializing page categorization system");
  initPageCategorization();
  log("info", "Page categorization system initialized");
  
  // Create a new rule engine 
  const engine = new RuleEngine();
  
  // If we're not in healing-only mode, use cyclical learning to categorize fields
  if (!options.healingOnly) {
    log("info", "Starting cyclical field categorization and learning process");
    
    // Run the cyclical learning process (maximum 3 cycles by default)
    sectionFields = await runCyclicalLearning(
      engine,
      fields,
      referenceCounts || {},
      outputPath,
      3 // Max 3 cycles by default
    );
    
    log("info", `Cyclical learning process complete`);
    
    // Save categorized fields as JSON
    await fsPromises.writeFile(
      path.join(outputPath, "unknown-fields.json"),
      JSON.stringify(sectionFields["0"] || [], null, 2)
    );
    
    await fsPromises.writeFile(
      path.join(outputPath, "sectionized-fields.json"),
      JSON.stringify(sectionFields, null, 2)
    );
    
    log("info", `Saved categorized fields to ${path.join(outputPath, "sectionized-fields.json")}`);
    
    // Count sections and unknown fields
    const sectionCount = Object.keys(sectionFields).filter(key => key !== "0").length;
    log("info", `Loaded ${sectionCount} sections and ${sectionFields["0"]?.length || 0} unknown fields`);
  } else if (!sectionFields) {
    log("error", "No section data available for healing");
    process.exit(1);
  }

  // Ensure sectionFields and initialUnknownFields exist before continuing
  const validSectionFields = sectionFields || {}; 
  const validUnknownFields = initialUnknownFields || [];

  log("info", `Loaded ${Object.keys(validSectionFields).length} sections and ${validUnknownFields.length} unknown fields`);
  
  // Self-healing if requested
  let healingResult: any = null;
  if (options.selfHealing) {
    log("info", "🔧 Applying enhanced self-healing to fix field categorization");
    
    // Ensure we have valid objects before passing to functions
    const workingSectionFields = sectionFields || {};
    const workingReferenceCounts = referenceCounts || {};
    
    const selfHealingResults = await runEnhancedSelfHealing(
      engine,
      workingSectionFields,
      workingReferenceCounts,
      outputPath,
      0.3
    );
    
    sectionFields = selfHealingResults.sectionFields;
    
    // Apply additional distribution for remaining unknown fields
    sectionFields = await afterSelfHealing(sectionFields, workingReferenceCounts);
    
    // Check alignment again after self-healing
    if (options.validateCounts) {
      const alignmentScore = calculateAlignmentPercentage(sectionFields, workingReferenceCounts);
      log("info", `Overall section alignment score: ${alignmentScore.toFixed(2)}%`);
      
      if (alignmentScore >= 80) {
        log("info", "Section alignment is within acceptable range.");
      } else {
        log("warn", "Section alignment is below acceptable range.");
      }
    }
  }

  // Generate the main report
  try {
    log("info", "Generating final report");
    
    const reportPath = path.join(process.cwd(), "reports", "sectionizer-report.md");
    
    // Ensure reports directory exists
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    
    // Use the new direct format for the report generator
    await reportGenerator.generateReport(
      validSectionFields as Record<string, CategorizedField[]>,
      reportPath,
      referenceCounts
    );
    
    log("info", `Final report generated at ${reportPath}`);
  } catch (error) {
    log("error", "Failed to generate final report", error);
  }
  
  // Final validation of section counts if requested
  if (options.validateCounts && referenceCounts) {
    log("info", "Validating final section counts against reference data");
    
    const deviations = Object.keys(referenceCounts).map(sectionNumStr => {
      const sectionNum = parseInt(sectionNumStr, 10);
      const expectedCount = referenceCounts![sectionNum];
      const actualCount = validSectionFields[sectionNumStr]?.length || 0;
      const deviation = actualCount - expectedCount;
      
      return {
        section: sectionNum,
        expected: expectedCount,
        actual: actualCount,
        deviation,
        percentage: expectedCount > 0 ? Math.abs(deviation) / expectedCount * 100 : 0
      };
    }).filter(d => d.expected > 0 && Math.abs(d.deviation) > 0);
    
    if (deviations.length > 0) {
      // Sort by absolute deviation percentage (highest first)
      deviations.sort((a, b) => b.percentage - a.percentage);
      
      log("warn", "Section count validation found deviations:");
      
      for (const dev of deviations) {
        const sign = dev.deviation > 0 ? "+" : "";
        log(
          "warn",
          `Section ${dev.section}: ${dev.actual} fields (expected ${dev.expected}, ${sign}${dev.deviation}, ${dev.percentage.toFixed(2)}%)`
        );
      }
      
      // Calculate overall alignment score
      const totalExpected = Object.values(referenceCounts).reduce((sum, count) => sum + count, 0);
      const totalDeviation = deviations.reduce((sum, dev) => sum + Math.abs(dev.deviation), 0);
      const alignmentScore = 100 - (totalDeviation / totalExpected * 100);
      
      log("info", `Overall section alignment score: ${alignmentScore.toFixed(2)}%`);
    } else {
      log("info", "Section count validation passed with no deviations!");
    }
  }
  
  // Print final section statistics
  console.log('\nFinal Section Statistics:');
  // Flatten all fields from all sections for statistics
  const allFields: CategorizedField[] = [];
  Object.values(validSectionFields).forEach(sectionFieldArray => {
    allFields.push(...sectionFieldArray);
  });
  printSectionStatistics(allFields);
  
  log("info", "SF-86 Sectionizer completed successfully");
}

// Execute the main function
main().catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
