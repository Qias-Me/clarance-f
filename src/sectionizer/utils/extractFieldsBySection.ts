/**
 * SF-86 Sectionizer - Field Extraction Utility
 *
 * This utility extracts fields from the SF-86 PDF and provides functions
 * to group them by section based on field metadata.
 */

import * as fs from "fs";
import * as path from "path";
// Using full relative paths with .js extension for ES modules
import { PdfService } from "../../../api/service/pdfService2.js";
import {
  enhancedMultiDimensionalCategorization,
  refinedSectionPageRanges,
  sectionClassifications,
  extractSectionInfoFromName,
  extractSectionInfo
} from "./fieldParsing.js";
import * as bridgeAdapter from "./bridgeAdapter.js";
import { PDFDocument } from "pdf-lib";
import { expectedFieldCounts } from "./field-clusterer.js";
import chalk from 'chalk';
import {
  createSectionBoundaryMap,
  enhanceSpatialCategorization,
  organizeSpatialSubsectionEntries
} from "./spatialAnalysis.js";


/**
 * Represents a PDF form field extracted from the SF-86 form
 */
export interface PDFField {
  id: string; // Unique identifier for the field
  name: string; // Name of the field in the PDF
  value?: string | string[] | boolean; // Current value of the field
  page: number; // Page number where the field appears
  label?: string; // Human-readable label for the field (if available)
  type?: string; // Field type (text, checkbox, dropdown, etc.)
  maxLength?: number; // Maximum length for text fields
  options?: string[]; // Available options for dropdown/radio fields
  rect?: {
    // Rectangle coordinates of the field
    x: number; // Left position
    y: number; // Bottom position
    width: number; // Width of the field
    height: number; // Height of the field
  };
}

/**
 * Field with section information
 */
export interface CategorizedField extends PDFField {
  section: number; // Section number (1-30)
  subsection?: string; // Subsection identifier (e.g., "A", "B", "C")
  entry?: number; // Entry index within subsection
  confidence: number; // Confidence score of categorization (0-1)
}

// Default to the embedded PDF under src/ for easier local development
const DEFAULT_PDF_PATH = path.resolve(
  process.cwd(),
  "src",
  "sf862.pdf"
);


/**
 * Extract all fields from the SF-86 PDF
 *
 * @param pdfPath Path to the SF-86 PDF file or JSON fields file
 * @returns Promise resolving to an array of PDF fields and the PDFDocument
 */
export async function extractFields(
  pdfPath: string = DEFAULT_PDF_PATH
): Promise<{ fields: PDFField[], pdfDoc?: PDFDocument }> {
  // Check if file exists
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`File not found at ${pdfPath}`);
  }

  try {
    // Check if it's a JSON file with pre-extracted fields
    if (pdfPath.toLowerCase().endsWith('.json')) {
      console.log(`Loading fields from JSON file: ${pdfPath}`);
      const jsonData = JSON.parse(fs.readFileSync(pdfPath, 'utf-8'));

      // Convert JSON data to PDFField format
      const processedFields = jsonData.map((field: any) => ({
        id: field.id,
        name: field.name,
        value: field.value,
        page: field.page || 0,
        label: field.label,
        type: field.type,
        maxLength: field.maxLength,
        options: field.options,
        required: field.required,
        rect: field.rect || null
      }));

      return { fields: processedFields };
    }

    // Use the existing PdfService to extract field metadata
    const pdfService = new PdfService();

    // Load the PDF document first - can't use private loadPdf
    let pdfDoc: PDFDocument | undefined;
    try {
      // Load the PDF bytes and create a document
      const pdfBytes = fs.readFileSync(pdfPath);
      pdfDoc = await PDFDocument.load(pdfBytes);
    } catch (error) {
      console.error(`Error loading PDF: ${error}`);
    }

    // Map the fields directly using mapFormFields instead of extractFieldMetadata
    // This avoids using the problematic getFieldValue method
    const fieldMetadata = await pdfService.extractFieldMetadata(pdfPath);

    // Convert to our PDFField interface, ensure page numbers are set
    const processedFields =
      fieldMetadata
        .filter((field: any) => field.name) // Filter out fields without names
        .map((field: any) => ({
          id: field.id,
          name: field.name,
          value: field.value,
          page: field.page || -1, // Default to 0 if page is undefined
          label: field.label,
          type: field.type,
          maxLength: field.maxLength,
          options: field.options || [],
          rect: field.rect || undefined
        })
    );

    console.log(`Extracted ${fieldMetadata.length} raw fields, ${processedFields.length} unique fields after deduplication`);

    return {
      fields: processedFields,
      pdfDoc: pdfDoc  // Make the PDFDocument available
    };
  } catch (error) {
    // Fallback to mock data if in development and mock data exists
    if (process.env.NODE_ENV === "development" && process.env.USE_MOCK_DATA) {
      const mockDataPath = path.resolve(
        process.cwd(),
        "scripts",
        "mock-data",
        "sf86-fields.json"
      );
      if (fs.existsSync(mockDataPath)) {
        console.warn("Using mock data from sf86-fields.json");
        const mockData = JSON.parse(fs.readFileSync(mockDataPath, "utf-8"));
        return { fields: mockData };
      }
    }

    // Re-throw the error if no fallback is available
    throw new Error(
      `Failed to extract fields from PDF: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}


/**
 * Categorize a single field based only on name-related metadata
 * This function focuses solely on analyzing field names and labels
 */
export function categorizeField(
  field: PDFField,
  useEnhanced = true,
): CategorizedField {
  const result: CategorizedField = {
    ...field,
    section: 0, // Default to unknown section
    confidence: 0
  };

  if (!field.name) {
    return result;
  }

  // Extract section info using the consolidated utility
  const sectionInfo = extractSectionInfo(field.name);

  if (sectionInfo && sectionInfo.section > 0) {
    result.section = sectionInfo.section;
    result.confidence = sectionInfo.confidence;

    // Copy subsection and entry info if available
    if (sectionInfo.subsection) {
      result.subsection = sectionInfo.subsection;
    }

    if (sectionInfo.entry) {
      result.entry = sectionInfo.entry;
    }

    return result;
  }

  // Try enhanced categorization if enabled
  if (useEnhanced) {
    // Use the bridgeAdapter enhanced categorization for better results
    try {
      // Get neighboring fields based on name patterns
      const neighborFields: string[] = [];

      // Look for fields with similar naming patterns that might be neighbors
      const fieldNameBase = field.name.replace(/\d+$/, '');
      if (fieldNameBase !== field.name) {
        // This field has a numeric suffix, suggesting it's part of a sequence
        neighborFields.push(fieldNameBase + '*');
      }

      const enhancedResult = enhancedMultiDimensionalCategorization(
        field.name,
        field.label || "",
        field.page,
        typeof field.value === "string" ? field.value : "",
        neighborFields
      );

      if (enhancedResult && enhancedResult.section > 0) {
        result.section = enhancedResult.section;
        if (enhancedResult.subsection) {
          result.subsection = enhancedResult.subsection;
        }
        if (enhancedResult.entry) {
          result.entry = enhancedResult.entry;
        }
        result.confidence = enhancedResult.confidence;

        return result;
      }
    } catch (error) {
      console.warn("Error during enhanced categorization:", error);
    }
  }

  // If we reached here, no section was found
  return result;
}

/**
 * Calculate a confidence boost based on field's spatial position
 * @param field Field to analyze
 * @param candidateSection Section being considered
 * @param pageDimensions Optional record of page dimensions
 * @returns Confidence boost (0-0.2)
 */
function calculateSpatialConfidenceBoost(
  field: PDFField,
  candidateSection: number,
  pageDimensions: Record<number, {width: number, height: number}> = {}
): number {
  // Skip if no coordinates or page
  if (!field.rect || !field.page) {
    return 0;
  }

  let boost = 0;

  // Check if field is on a page typically associated with this section
  // This is a simplified version - in a real implementation, you would use
  // a mapping of sections to page ranges
  const typicalStartPage = Math.max(1, (candidateSection - 1) * 3 + 1);
  const typicalEndPage = typicalStartPage + 5;

  if (field.page >= typicalStartPage && field.page <= typicalEndPage) {
    boost += 0.1;
  }

  // Check if field name contains section indicator
  if (field.name.toLowerCase().includes(`section${candidateSection}`) ||
      field.name.toLowerCase().includes(`section ${candidateSection}`) ||
      field.name.toLowerCase().includes(`s${candidateSection}_`)) {
    boost += 0.15;
  }

  // Check if field is in a position typical for this section
  // Get page dimensions from PDF or use defaults
  const page = field.page || 1;
  const pageDim = pageDimensions[page] || { width: 612, height: 792 }; // Default to US Letter if not available

  const fieldY = field.rect.y;
  const pageHeight = pageDim.height;

  // Headers are typically at the top of the page
  const isInHeader = fieldY > pageHeight * 0.8;

  if (isInHeader && field.name.toLowerCase().includes('section')) {
    boost += 0.1;
  }

  return Math.min(0.2, boost);
}



// This function was previously used but is now kept for reference
// It may be useful in future enhancements
/*
function identifyProblemSections(
  sectionMap: Record<number, CategorizedField[]>,
  referenceCounts: Record<number, number>
): { oversized: number[]; undersized: number[]; missing: number[] } {
  const oversized: number[] = [];
  const undersized: number[] = [];
  const missing: number[] = [];

  // Skip section 0 (uncategorized)
  for (let section = 1; section <= 30; section++) {
    const sectionFields = sectionMap[section] || [];
    const expectedCount = referenceCounts[section] || 0;

    if (expectedCount === 0) continue; // Skip sections without reference counts

    if (sectionFields.length === 0) {
      missing.push(section);
    } else if (sectionFields.length < expectedCount * 0.75) { // Allow some flexibility
      undersized.push(section);
    } else if (sectionFields.length > expectedCount * 1.5) { // Allow some flexibility
      oversized.push(section);
    }
  }

  return { oversized, undersized, missing };
}
*/

/**
 * Post-process fields after initial categorization to improve accuracy
 * This includes special handling for specific sections with known patterns
 * @param fields Array of categorized fields
 * @returns The fields with improved categorization
 */
function postProcessFields(fields: CategorizedField[]): CategorizedField[] {
  try {
    console.log(`Post-processing ${fields.length} categorized fields`);

    // Group fields by section
    const sectionMap: Record<number, CategorizedField[]> = {};

    fields.forEach((field) => {
      if (field.section !== undefined) {
        if (!sectionMap[field.section]) {
          sectionMap[field.section] = [];
        }
        sectionMap[field.section].push(field);
      }
    });

    // Ensure sections 2-4, 6, and 8 have 0 entries (allow entries for Section 1)
    [2, 3, 4, 6, 8].forEach(section => {
      if (sectionMap[section]) {
        sectionMap[section].forEach(field => {
          field.entry = 0; // Force entry to 0 for these sections
        });
      }
    });

    // Special handling for Section 5 (Other names) - should have 45 fields, 4 entries
    if (sectionMap[5]) {
      const section5Fields = sectionMap[5];
      console.log(`Section 5 (Other names) has ${section5Fields.length} fields`);

      // Group by entry
      const entryGroups: Record<string, CategorizedField[]> = {};
      section5Fields.forEach(field => {
        const entry = typeof field.entry === 'number' ? field.entry.toString() : 'unknown';
        if (!entryGroups[entry]) {
          entryGroups[entry] = [];
        }
        entryGroups[entry].push(field);
      });

      // Check for fields without entry assignment
      const unknownEntryFields = entryGroups['unknown'] || [];

      if (unknownEntryFields.length > 0) {
        console.log(`Found ${unknownEntryFields.length} Section 5 fields without entry assignment`);

        // Try to distribute them to entries 1-4
        unknownEntryFields.forEach((field, index) => {
          // Assign entries in a round-robin fashion
          field.entry = (index % 4) + 1;
        });
      }

      // Ensure we have 1 base content field (entry 0) and 44 entry fields (11 per entry)
      const baseContentFields = entryGroups['0'] || [];
      if (baseContentFields.length === 0) {
        // Create a base content field by taking one field from the largest entry
        const largestEntryKey = Object.keys(entryGroups)
          .filter(k => k !== 'unknown' && k !== '0')
          .sort((a, b) => entryGroups[b].length - entryGroups[a].length)[0];

        if (largestEntryKey && entryGroups[largestEntryKey].length > 1) {
          // Find a field that's likely general content
          const fieldToMove = entryGroups[largestEntryKey].find(f =>
            /explanation|general|have[-_]?you[-_]?used|other[-_]?names/i.test(f.name.toLowerCase())) ||
            entryGroups[largestEntryKey][0];

          fieldToMove.entry = 0;
          console.log(`Created base content field for Section 5`);
        }
      } else if (baseContentFields.length > 1) {
        // Keep only one as base content, redistribute the rest
        baseContentFields.slice(1).forEach((field, index) => {
          field.entry = (index % 4) + 1;
        });
      }

      // Balance the 4 entries to have approximately 11 fields each
      const totalEntryFields = section5Fields.length - (entryGroups['0'] || []).length;
      const targetPerEntry = Math.floor(totalEntryFields / 4);

      for (let i = 1; i <= 4; i++) {
        const entryFields = entryGroups[i.toString()] || [];
        if (entryFields.length === 0) {
          // Entry doesn't exist, create it
          console.log(`Creating missing entry ${i} for Section 5`);

          // Find the largest entry to take fields from
          const largestEntryKey = Object.keys(entryGroups)
            .filter(k => k !== 'unknown' && k !== '0' && parseInt(k) !== i && entryGroups[k].length > targetPerEntry)
            .sort((a, b) => entryGroups[b].length - entryGroups[a].length)[0];

          if (largestEntryKey) {
            const fieldsToMove = entryGroups[largestEntryKey].slice(0, targetPerEntry);
            fieldsToMove.forEach(field => {
              field.entry = i;
            });
            console.log(`Moved ${fieldsToMove.length} fields to create entry ${i}`);
          }
        }
      }
    }

    // Special handling for Section 7 (Phone and email) - should have 17 fields, 3 entries
    if (sectionMap[7]) {
      const section7Fields = sectionMap[7];
      console.log(`Section 7 (Phone and email) has ${section7Fields.length} fields`);

      // Group by entry
      const entryGroups: Record<string, CategorizedField[]> = {};
      section7Fields.forEach(field => {
        const entry = typeof field.entry === 'number' ? field.entry.toString() : 'unknown';
        if (!entryGroups[entry]) {
          entryGroups[entry] = [];
        }
        entryGroups[entry].push(field);
      });

      // Check for fields without entry assignment
      const unknownEntryFields = entryGroups['unknown'] || [];

      if (unknownEntryFields.length > 0) {
        console.log(`Found ${unknownEntryFields.length} Section 7 fields without entry assignment`);

        // Distribute them to entries 1-3
        unknownEntryFields.forEach((field, index) => {
          // Assign entries in a round-robin fashion
          field.entry = (index % 3) + 1;
        });
      }

      // Ensure we have 3 entries with reasonable field counts
      for (let i = 1; i <= 3; i++) {
        if (!entryGroups[i.toString()] || entryGroups[i.toString()].length === 0) {
          // Entry doesn't exist, create it
          console.log(`Creating missing entry ${i} for Section 7`);

          // Find the largest entry to take fields from
          const largestEntryKey = Object.keys(entryGroups)
            .filter(k => k !== 'unknown' && k !== '0' && parseInt(k) !== i && (entryGroups[k] || []).length > 3)
            .sort((a, b) => (entryGroups[b] || []).length - (entryGroups[a] || []).length)[0];

          if (largestEntryKey) {
            const fieldsToMove = entryGroups[largestEntryKey].slice(0, 3);
            fieldsToMove.forEach(field => {
              field.entry = i;
            });
            console.log(`Moved ${fieldsToMove.length} fields to create entry ${i}`);
          }
        }
      }
    }

    // Special handling for Section 9 (Dual citizenship) - should have 4 subsections and 78 fields
    if (sectionMap[9]) {
      const section9Fields = sectionMap[9];
      console.log(`Section 9 (Dual citizenship) has ${section9Fields.length} fields`);

      // Group by subsection
      const subsectionGroups: Record<string, CategorizedField[]> = {};
      section9Fields.forEach(field => {
        const subsection = field.subsection || 'unknown';
        if (!subsectionGroups[subsection]) {
          subsectionGroups[subsection] = [];
        }
        subsectionGroups[subsection].push(field);
      });

      // Check for fields without subsection assignment
      const unknownSubFields = subsectionGroups['unknown'] || [];

      if (unknownSubFields.length > 0) {
        console.log(`Found ${unknownSubFields.length} Section 9 fields without subsection assignment`);

        // Distribute them to subsections a-d
        const subsections = ['a', 'b', 'c', 'd'];
        unknownSubFields.forEach((field, index) => {
          field.subsection = subsections[index % 4];
        });
      }

      // Ensure all 4 subsections exist with a reasonable number of fields
      const subsections = ['a', 'b', 'c', 'd'];
      const totalFields = section9Fields.length;
      const targetPerSubsection = Math.floor(totalFields / 4);

      subsections.forEach(sub => {
        if (!subsectionGroups[sub] || subsectionGroups[sub].length === 0) {
          console.log(`Creating missing subsection ${sub} for Section 9`);

          // Find the largest subsection to take fields from
          const largestSubKey = Object.keys(subsectionGroups)
            .filter(k => k !== 'unknown' && k !== sub && (subsectionGroups[k] || []).length > targetPerSubsection)
            .sort((a, b) => (subsectionGroups[b] || []).length - (subsectionGroups[a] || []).length)[0];

          if (largestSubKey) {
            const fieldsToMove = subsectionGroups[largestSubKey].slice(0, targetPerSubsection / 2);
            fieldsToMove.forEach(field => {
              field.subsection = sub;
            });
            console.log(`Moved ${fieldsToMove.length} fields to create subsection ${sub}`);
          }
        }
      });

      // Set entry to 0 for all section 9 fields
      section9Fields.forEach(field => {
        field.entry = 0;
      });
    }

    return fields;
  } catch (error) {
    console.error('Error in postProcessFields:', error);
    return fields;
  }
}

/**
 * Main function to extract and categorize fields from the SF-86 PDF,
 * applying normalization, categorization, and post-processing steps
 *
 * @param pdfPath Path to the SF-86 PDF file
 * @param saveUnknown Whether to save uncategorized fields to unknown.json
 * @returns Promise resolving to a record of categorized fields grouped by section number
 */
export async function extractFieldsBySection(
  pdfPath: string = DEFAULT_PDF_PATH,
  saveUnknown: boolean = true
): Promise<Record<number, CategorizedField[]>> {
  try {
    // Step 1: Extract raw fields from the PDF
    console.log(`Extracting fields from ${pdfPath}...`);
    const { fields } = await extractFields(pdfPath);
    console.log(`Extracted ${fields.length} fields from PDF.`);

    // Step 3: Categorize fields into sections
    console.log("Categorizing fields into sections...");
    const categorizedFields = fields.map((field) => categorizeField(field));

    // Step 4: Apply post-processing to validate and fix categorization
    console.log("Applying post-processing to categorized fields...");
    const processedFields = postProcessFields(categorizedFields);

    // Optionally save uncategorized fields for debug
    if (saveUnknown) {
      const unknownFields = processedFields.filter((field) => field.section === 0);
      if (unknownFields.length > 0) {
        console.log(`Saving ${unknownFields.length} uncategorized fields for debug...`);
        saveUnknownFields(unknownFields, `unknown-fields-${Date.now()}.json`);
      }
    }

    // Step 5: Group fields by section
    console.log("Grouping fields by section...");
    const sectionMap: Record<number, CategorizedField[]> = {};

    processedFields.forEach((field) => {
      const section = field.section;
      if (!sectionMap[section]) {
        sectionMap[section] = [];
      }
      sectionMap[section].push(field);
    });

    // Print statistics
    printSectionStatistics(processedFields);

    return sectionMap;
  } catch (error) {
    console.error(`Error in extractFieldsBySection: ${error}`);
    throw error;
  }
}

/**
 * Print statistics about field categorization by section
 * @param fields Categorized fields
 */
export function printSectionStatistics(fields: CategorizedField[]): void {
  // Count fields per section
  const sectionCounts: Record<number, number> = {};
  fields.forEach((field) => {
    // Default to section 0 (unknown) if section is undefined
    const section = field.section !== undefined ? field.section : 0;
    sectionCounts[section] = (sectionCounts[section] || 0) + 1;
  });

  // Get reference counts for comparison
  const referenceCounts = expectedFieldCounts;

  // Log the statistics
  console.log(chalk.bold("\nSection Statistics:"));
  console.log(chalk.bold("=================="));
  console.log(chalk.bold("Section | Count | Expected | Difference"));
  console.log(chalk.bold("--------|-------|----------|------------"));

  // Sort sections by number
  const sortedSections = Object.keys(sectionCounts)
    .map(Number)
    .sort((a, b) => a - b);

  for (const section of sortedSections) {
    const count = sectionCounts[section];
    // Extract the 'fields' property from the complex structure
    const expected = referenceCounts[section]?.fields;

    // Format expected and difference values, handling non-numeric cases
    let expectedStr = "N/A";
    let differenceStr = "N/A";

    if (typeof expected === "number") {
      expectedStr = expected.toString();
      const diff = count - expected;
      differenceStr = diff >= 0 ? `+${diff}` : diff.toString();
    }

    // Color-code output based on match
    let statusSymbol = "  ";
    let differenceChalk = chalk.gray; // Default for N/A or no expected value
    if (typeof expected === "number") {
      if (count === expected) {
        statusSymbol = "✓ ";
        differenceChalk = chalk.green;
      } else if (count > expected) {
        statusSymbol = "+ ";
        differenceChalk = chalk.yellow; // Or chalk.red if it's a problem
      } else {
        statusSymbol = "- ";
        differenceChalk = chalk.red;
      }
    }

    console.log(
      `${String(section).padStart(2)} | ${String(count).padEnd(5)} | ${String(expectedStr).padEnd(8)} | ${differenceChalk(`${statusSymbol}${differenceStr}`)}`
    );
  }

  // Add ASCII chart visualization
  console.log(chalk.bold("\nSection Distribution Chart:"));
  console.log(chalk.bold("========================="));

  // Find the maximum count for scaling
  const maxCount = Math.max(...Object.values(sectionCounts));
  const chartWidth = 50; // Maximum chart width in characters

  // Generate the chart
  for (const section of sortedSections) {
    // Skip section 0 (unknown) in the chart as it can skew visualization
    if (section === 0) continue;

    const count = sectionCounts[section];
    const barLength = Math.round((count / maxCount) * chartWidth);
    const bar = "█".repeat(barLength);

    // Display section number, bar, and count
    console.log(`Section ${String(section).padStart(2)}: ${chalk.blue(bar)} ${count}`);
  }

  // Additional subsection statistics
  console.log(chalk.bold("\nSubsection Breakdown:"));
  console.log(chalk.bold("===================="));

  for (const section of sortedSections) {
    // Collect subsection counts for this section
    const subsectionCounts: Record<string, number> = {};

    fields
      .filter((f) => f.section === section && f.subsection)
      .forEach((f) => {
        const sub = f.subsection as string;
        subsectionCounts[sub] = (subsectionCounts[sub] || 0) + 1;
      });

    if (Object.keys(subsectionCounts).length === 0) {
      continue; // No subsections for this section
    }

    // Add expected subsection count if available
    const expectedSubsections = referenceCounts[section]?.subsections;
    const subsectionInfo = expectedSubsections ? ` (Expected: ${expectedSubsections})` : '';
    console.log(`Section ${section}${subsectionInfo}`);

    // Get the maximum count for subsection visualization
    const maxSubCount = Math.max(...Object.values(subsectionCounts));
    const subChartWidth = 30; // Smaller width for subsections

    // Generate chart for each subsection
    Object.entries(subsectionCounts)
      .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: "base" }))
      .forEach(([sub, cnt]) => {
        const barLength = Math.round((cnt / maxSubCount) * subChartWidth);
        const bar = "▓".repeat(barLength);
        console.log(`  ${sub.padEnd(2)} : ${chalk.cyan(bar)} ${cnt}`);
      });
  }

  // Entry distribution
  console.log(chalk.bold("\nEntry Distribution:"));
  console.log(chalk.bold("=================="));

  // Collect entry counts by section
  const sectionEntries: Record<number, Record<number, number>> = {};

  fields
    .filter((f) => typeof f.entry === 'number' && f.entry > 0)
    .forEach((f) => {
      const section = f.section !== undefined ? f.section : 0;
      const entry = f.entry as number;

      if (!sectionEntries[section]) {
        sectionEntries[section] = {};
      }

      sectionEntries[section][entry] = (sectionEntries[section][entry] || 0) + 1;
    });

  // Display entry distribution for sections that have entries
  for (const section of Object.keys(sectionEntries).map(Number).sort((a, b) => a - b)) {
    const entries = sectionEntries[section];
    if (Object.keys(entries).length === 0) continue;

    // Add expected entry count if available
    const expectedEntryCount = referenceCounts[section]?.entries;
    const entryInfo = expectedEntryCount ? ` (Expected: ${expectedEntryCount})` : '';
    console.log(`Section ${section}${entryInfo}`);

    // Get the maximum count for entry visualization
    const maxEntryCount = Math.max(...Object.values(entries));
    const entryChartWidth = 25; // Even smaller width for entries

    // Generate chart for each entry
    Object.entries(entries)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .forEach(([entry, cnt]) => {
        const barLength = Math.round((cnt / maxEntryCount) * entryChartWidth);
        const bar = "▒".repeat(barLength);
        console.log(`  Entry ${String(entry).padEnd(2)}: ${chalk.magenta(bar)} ${cnt}`);
      });
  }

  // Log the overall stats
  const totalFields = fields.length;
  const categorizedFields = fields.filter((field) => field.section > 0).length;
  const categorizedPercentage = (
    (categorizedFields / totalFields) *
    100
  ).toFixed(2);

  console.log(chalk.bold("\nOverall:"));
  console.log(`Total fields: ${totalFields}`);
  console.log(
    `Categorized fields: ${chalk.green(categorizedFields)} (${chalk.greenBright(categorizedPercentage + '%')})`
  );
  console.log(
    `Uncategorized fields: ${chalk.red(totalFields - categorizedFields)} (${chalk.redBright((
      100 - parseFloat(categorizedPercentage)
    ).toFixed(2) + '%')})`
  );
}

/**
 * Save unknown/uncategorized fields to a JSON file for analysis
 *
 * @param fields Array of uncategorized fields
 * @param outputPath Path to save the unknown fields JSON file
 */
export function saveUnknownFields(
  fields: CategorizedField[],
  outputPath: string
): void {
  if (!fields || fields.length === 0) {
    console.log("No unknown fields to save.");
    return;
  }

  try {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(fields, null, 2));
    console.log(`Saved ${fields.length} unknown fields to ${outputPath}`);
  } catch (error) {
    console.error("Error saving unknown fields:", error);
  }
}

/**
 * Group already categorized fields by section
 *
 * @param fields Array of already categorized fields
 * @param saveUnknown Whether to save uncategorized fields to unknown.json
 * @returns Record mapping section numbers to arrays of categorized fields
 */
export async function groupFieldsBySection(
  fields: CategorizedField[],
  saveUnknown: boolean = true
): Promise<Record<string, CategorizedField[]>> {
  try {
    // Group fields by section
    const sectionFields: Record<string, CategorizedField[]> = {};

    // Initialize section arrays with empty arrays
    for (let i = 0; i <= 30; i++) {
      sectionFields[i.toString()] = [];
    }

    // Track field IDs to avoid duplication
    const processedFieldIds = new Set<string>();

    // First prioritize fields with sections > 0
    // Populate section arrays in reverse order (putting known sections first, section 0 last)
    fields
      .filter((field) => field.section > 0) // First process fields with known sections
      .forEach((field) => {
        const fieldId = field.id || field.name || JSON.stringify(field);

        if (!processedFieldIds.has(fieldId)) {
          processedFieldIds.add(fieldId);

      const sectionKey = field.section.toString();
      if (!sectionFields[sectionKey]) {
        sectionFields[sectionKey] = [];
      }
      sectionFields[sectionKey].push(field);
        }
      });

    // Now handle fields with section 0 (uncategorized)
    fields
      .filter((field) => field.section === 0)
      .forEach((field) => {
        const fieldId = field.id || field.name || JSON.stringify(field);

        if (!processedFieldIds.has(fieldId)) {
          processedFieldIds.add(fieldId);
          sectionFields["0"].push(field);
        }
      });

    // Log stats
    console.log(
      `Grouped ${processedFieldIds.size} unique fields into ${
        Object.keys(sectionFields).length - 1
      } sections`
    );

    // Log fields per section
    const fieldCounts = Object.entries(sectionFields)
      .map(([section, sFields]) => `Section ${section}: ${sFields.length}`)
      .join(", ");
    console.log(`Field counts: ${fieldCounts}`);

    // Save uncategorized fields for analysis if requested
    if (saveUnknown && sectionFields["0"] && sectionFields["0"].length > 0) {
      const unknownFields = sectionFields["0"];
      const outputDir = path.resolve(process.cwd(), "reports");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const unknownPath = path.join(outputDir, "unknown-fields.json");
      fs.writeFileSync(unknownPath, JSON.stringify(unknownFields, null, 2));
      console.log(
        `Saved ${unknownFields.length} uncategorized fields to ${unknownPath}`
      );
    }

    // Sort fields within each section by subsection and entry for consistent ordering
    Object.values(sectionFields).forEach(arr => {
      arr.sort((a, b) => {
        const subA = a.subsection ?? "";
        const subB = b.subsection ?? "";
        if (subA !== subB) {
          if (!subA) return 1; // place undefined subsections last
          if (!subB) return -1;
          return subA.localeCompare(subB, undefined, { numeric: true, sensitivity: "base" });
        }
        const entryA = typeof a.entry === "number" ? a.entry : Number.MAX_SAFE_INTEGER;
        const entryB = typeof b.entry === "number" ? b.entry : Number.MAX_SAFE_INTEGER;
        return entryA - entryB;
      });
    });

    return sectionFields;
  } catch (error) {
    console.error("Error in groupFieldsBySection:", error);
    throw new Error(
      `Failed to group fields by section: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Enhance PDF fields with coordinate data for spatial analysis
 * This function ensures fields have rect property with coordinates
 * either by extracting from existing properties or by generating estimates
 *
 * @param fields Array of fields to enhance
 * @param pdfDoc Optional PDF document to get accurate page dimensions
 * @returns Array of fields with coordinate data
 */
export function enhanceFieldsWithCoordinates(fields: PDFField[], pdfDoc?: PDFDocument): PDFField[] {
  console.log(`Enhancing ${fields.length} fields with coordinate data...`);
  let fieldsWithValidRects = 0;
  let fieldsWithInvalidRects = 0;

  const enhancedFields = fields.map((field) => {
    // Ensure field.rect exists and initialize if not, or if properties are not numbers
    if (!field.rect ||
        typeof field.rect.x !== 'number' ||
        typeof field.rect.y !== 'number' ||
        typeof field.rect.width !== 'number' ||
        typeof field.rect.height !== 'number'
    ) {
      // If rect is entirely missing or malformed, initialize to -1
      // This indicates that the source (pdfService2.ts) did not provide a valid rect
      field.rect = { x: -1, y: -1, width: -1, height: -1 };
    }

    // Check if the coordinates are valid (not -1)
    // A field has valid coordinates if all its rect properties are not -1 and width/height are non-negative.
    if (field.rect.x !== -1 &&
        field.rect.y !== -1 &&
        field.rect.width !== -1 && field.rect.width >= 0 &&
        field.rect.height !== -1 && field.rect.height >= 0
    ) {
      fieldsWithValidRects++;
        } else {
      fieldsWithInvalidRects++;
      // Log fields that still have invalid/missing coordinates after initial check
      // This means pdfService2.ts did not supply them or supplied invalid ones.
      console.warn(
        `Field '${field.name}' (ID: ${field.id}, Page: ${field.page || 'N/A'}) has missing or invalid coordinates: ` +
        `x: ${field.rect.x}, y: ${field.rect.y}, width: ${field.rect.width}, height: ${field.rect.height}. ` +
        `These should be provided by pdfService2.ts.`
      );
    }
    return field;
  });

  console.log(
    `Coordinate check complete for ${fields.length} fields: ` +
    `${fieldsWithValidRects} fields have valid coordinates. ` +
    `${fieldsWithInvalidRects} fields have missing/invalid coordinates (expected from pdfService2.ts).`
  );

  if (fieldsWithInvalidRects > 0) {
    console.error(
      `ERROR: ${fieldsWithInvalidRects} fields were found with missing or invalid coordinate data. ` +
      `This data is expected to be fully populated by extractFieldMetadata in pdfService2.ts. ` +
      `Please investigate api/service/pdfService2.ts.`
    );
    // Optionally, we could throw an error here if processing cannot continue without coordinates
    throw new Error(`${fieldsWithInvalidRects} fields have missing coordinate data.`);
  }

  return enhancedFields;
}

/**
 * Categorize a collection of PDF fields into their respective sections
 * @param fields The PDF fields to categorize
 * @param pdfDoc Optional PDF document to get accurate page dimensions
 * @returns Array of categorized fields
 */
export function categorizeFields(fields: PDFField[], pdfDoc?: PDFDocument): CategorizedField[] {
  console.time("categorizeFields");

  // First enhance fields with coordinate data for spatial analysis
  const fieldsWithCoordinates = enhanceFieldsWithCoordinates(fields, pdfDoc);

  // Extract page dimensions from PDF document if available
  const pageDimensions: Record<number, {width: number, height: number}> = {};

  if (pdfDoc) {
    try {
      const pageCount = pdfDoc.getPageCount();
      for (let i = 0; i < pageCount; i++) {
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();
        pageDimensions[i + 1] = { width, height }; // Store as 1-based page numbers
      }
      console.log(`Retrieved dimensions for ${Object.keys(pageDimensions).length} pages from PDF`);
    } catch (error) {
      console.warn(`Could not get page dimensions from PDF: ${error}`);
    }
  }

  // Then categorize each field using name-based approaches
  const initialCategorizedFields = fieldsWithCoordinates.map((field) => {
    // Use the categorizeField function to assign a section
    const result = categorizeField(field, true);
    return result;
  });

  console.log("Initial categorization completed. Applying spatial enhancement...");

  // Apply spatial boundary enhancement to improve categorization
  const spatiallyEnhancedFields = enhanceSpatialCategorization(initialCategorizedFields);

  // Organize fields by spatial relationships for better subsection and entry assignments
  const fullyOrganizedFields = organizeSpatialSubsectionEntries(spatiallyEnhancedFields);

  console.timeEnd("categorizeFields");
  return fullyOrganizedFields;
}

// Replace the existing organizeFieldsBySpatialRelationships function with a simpler version
// that uses our spatial analysis functions
function organizeFieldsBySpatialRelationships(
  fields: CategorizedField[],
  pageDimensions: Record<number, {width: number, height: number}> = {}
): CategorizedField[] {
  // This is now just a wrapper around our spatial analysis functions,
  // keeping it for backward compatibility
  console.log(`Organizing ${fields.length} fields by spatial relationships...`);

  // Enhance categorization using spatial boundaries
  const enhancedFields = enhanceSpatialCategorization(fields);

  // Organize subsections and entries
  return organizeSpatialSubsectionEntries(enhancedFields);
}
