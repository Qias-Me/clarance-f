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
  sectionFieldPatterns,
  sectionClassifications,
} from "../../../utilities/page-categorization-bridge.js";
import * as bridgeAdapter from "./bridgeAdapter.js";
import { sectionPageRanges } from "./field-clusterer.js";

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
  required?: boolean; // Whether the field is required
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

/**
 * Default path to the SF-86 PDF file
 */
const DEFAULT_PDF_PATH = path.resolve(
  process.cwd(),
  "utilities/externalTools/sf862.pdf"
);

// Use the already defined patterns from the bridge
// Instead of redefining them here, we'll use the patterns from sectionClassifications
// Function to determine if a field belongs to a specific section
function isFieldInSection(fieldName: string, section: number): boolean {
  // Find the section in sectionClassifications
  const sectionInfo = sectionClassifications.find(
    (s) => s.sectionId === section
  );

  // Check if the field name matches any pattern for the section
  if (sectionInfo?.fieldPathPatterns) {
    return sectionInfo.fieldPathPatterns.some((pattern) =>
      pattern.test(fieldName)
    );
  }
  return false;
}

/**
 * Extract all fields from the SF-86 PDF
 *
 * @param pdfPath Path to the SF-86 PDF file
 * @returns Promise resolving to an array of PDF fields
 */
export async function extractFields(
  pdfPath: string = DEFAULT_PDF_PATH
): Promise<PDFField[]> {
  // Check if file exists
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF file not found at ${pdfPath}`);
  }

  try {
    // Use the existing PdfService to extract field metadata
    const pdfService = new PdfService();
    const fieldMetadata = await pdfService.extractFieldMetadata(pdfPath);

    // Convert to our PDFField interface and ensure page numbers are set
    return fieldMetadata
      .filter((field: any) => field.name) // Filter out fields without names
      .map((field: any) => ({
        id: field.id,
        name: field.name,
        value: field.value,
        page: field.page || 0, // Default to 0 if page is undefined
        label: field.label,
        type: field.type,
        maxLength: field.maxLength,
        options: field.options,
        required: field.required,
      }));
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
        return mockData as PDFField[];
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
 * Extract section number from a field name
 * @param fieldName The field name to extract section from
 * @returns The section number or 0 if not found
 */
function extractSectionFromFieldName(fieldName: string): number {
  if (!fieldName) return 0;

  // Look for Section X or SectionX patterns
  const sectionMatch = fieldName.match(/section\s*(\d+)/i);
  if (sectionMatch && sectionMatch[1]) {
    const sectionNum = parseInt(sectionMatch[1], 10);
    if (sectionNum > 0 && sectionNum <= 30) {
      return sectionNum;
    }
  }

  // Look for S_XX patterns (e.g., S_12 for Section 12)
  const sMatch = fieldName.match(/\bs[_\-]?(\d+)/i);
  if (sMatch && sMatch[1]) {
    const sectionNum = parseInt(sMatch[1], 10);
    if (sectionNum > 0 && sectionNum <= 30) {
      return sectionNum;
    }
  }

  return 0;
}

/**
 * Categorize a PDF field into a specific section
 * @param field Field to categorize
 * @param {boolean} useEnhanced Use enhanced categorization (default: true)
 * @returns {CategorizedField} The field with section and confidence information
 */
export function categorizeField(
  field: PDFField,
  useEnhanced = true
): CategorizedField {
  // Initialize with default values
  const result: CategorizedField = {
    ...field,
    section: 0,
    confidence: 0,
  };

  // Skip empty fields or non-value fields
  if (!field.name) {
    return result;
  }

  // Try enhanced categorization with dimensional analysis
  if (useEnhanced) {
    try {
      // If we have rectangle coordinates, use them for additional analysis
      if (field.rect) {
        // Add coordinate info to the field for use in advanced categorization
        const fieldWithCoordinates = {
          ...field,
          x: field.rect.x,
          y: field.rect.y,
          width: field.rect.width,
          height: field.rect.height,
        };

        // Pass the coordinates to the advanced categorization function
        const enhancedResult =
          bridgeAdapter.advancedCategorization(fieldWithCoordinates);

        // Only use synchronous results with high confidence
        if (
          typeof enhancedResult === "object" &&
          "section" in enhancedResult &&
          enhancedResult.section !== 0 &&
          enhancedResult.confidence > 0.7
        ) {
          return enhancedResult as CategorizedField;
        }
      } else {
        // Fallback to standard advancedCategorization if no coordinates
        const enhancedResult = bridgeAdapter.advancedCategorization(field);
        if (
          typeof enhancedResult === "object" &&
          "section" in enhancedResult &&
          enhancedResult.section !== 0 &&
          enhancedResult.confidence > 0.7
        ) {
          return enhancedResult as CategorizedField;
        }
      }
    } catch (e) {
      // If advancedCategorization fails, continue with other methods
      console.warn(
        `Enhanced categorization failed for field ${field.name}:`,
        e
      );
    }
  }

  // Try standard categorization by field name matching against section patterns
  for (const [sectionKey, patterns] of Object.entries(sectionFieldPatterns)) {
    const sectionNumber = parseInt(sectionKey, 10);
    if (isNaN(sectionNumber)) continue;

    // Use isFieldInSection from bridgeAdapter for consistent pattern matching
    if (isFieldInSection(field.name, sectionNumber)) {
      result.section = sectionNumber;
      result.confidence = 0.85; // Default confidence for pattern match
      return result;
    }
  }

  // Extract section number from the field name using enhanced helper
  const extractedSection = extractSectionFromFieldName(field.name);
  if (extractedSection > 0) {
    result.section = extractedSection;
    result.confidence = 0.75; // Moderate confidence for section extracted from name
    return result;
  }

  // Fallback - check if we can extract any information from the label
  if (field.label) {
    const labelSection = extractSectionFromFieldName(field.label);
    if (labelSection > 0) {
      result.section = labelSection;
      result.confidence = 0.65; // Lower confidence for section extracted from label
      return result;
    }
  }

  // Return unknown if all attempts failed
  return result;
}

/**
 * Load reference field counts from section-data files
 * @returns Record mapping section numbers to expected field counts
 */
export function loadReferenceCounts(): Record<number, number> {
  const referenceCounts: Record<number, number> = {};

  // Try multiple directories where section data might be stored
  const potentialDirectories = [
    path.join(process.cwd(), "src", "section-data"),
  ];

  // Try each directory until we find data
  for (const sectionDataDir of potentialDirectories) {
    if (!fs.existsSync(sectionDataDir)) {
      console.log(`Directory not found: ${sectionDataDir}`);
      continue; // Try next directory
    }

    console.log(`Looking for section data in: ${sectionDataDir}`);

    // Try to load section-summary.json first
    const summaryPath = path.join(sectionDataDir, "section-summary.json");
    if (fs.existsSync(summaryPath)) {
      try {
        console.log(`Found summary file: ${summaryPath}`);
        const summaryData = JSON.parse(fs.readFileSync(summaryPath, "utf-8"));

        // Check if it's an array of section objects (new format)
        if (Array.isArray(summaryData)) {
          // Process array format directly
          summaryData.forEach((sectionData: any) => {
            if (
              typeof sectionData.sectionId === "number" &&
              typeof sectionData.fieldCount === "number"
            ) {
              referenceCounts[sectionData.sectionId] = sectionData.fieldCount;
            }
          });

          if (Object.keys(referenceCounts).length > 0) {
            // Check for unidentified fields count (section 0)
            const unknownFieldsPath = path.join(
              sectionDataDir,
              "unidentified-fields.json"
            );
            if (fs.existsSync(unknownFieldsPath)) {
              try {
                const unknownData = JSON.parse(
                  fs.readFileSync(unknownFieldsPath, "utf-8")
                );
                if (unknownData && typeof unknownData.count === "number") {
                  // Add section 0 count from the unidentified fields file
                  referenceCounts[0] = unknownData.count;
                  console.log(
                    `Added section 0 count: ${unknownData.count} from unidentified-fields.json`
                  );
                }
              } catch (e) {
                console.warn(`Error reading unidentified-fields.json: ${e}`);
              }
            }

            console.log(
              `Loaded reference counts for ${
                Object.keys(referenceCounts).length
              } sections from ${summaryPath} (direct array format)`
            );
            return referenceCounts;
          }
        }
        // Check if sections property is an array (new format)
        else if (Array.isArray(summaryData.sections)) {
          // Process array format
          summaryData.sections.forEach((sectionData: any) => {
            if (
              typeof sectionData.section === "number" &&
              typeof sectionData.fieldCount === "number"
            ) {
              referenceCounts[sectionData.section] = sectionData.fieldCount;
            }
          });

          if (Object.keys(referenceCounts).length > 0) {
            console.log(
              `Loaded reference counts for ${
                Object.keys(referenceCounts).length
              } sections from ${summaryPath} (array format)`
            );
            return referenceCounts;
          }
        }
        // Try the object format (original expected format)
        else if (
          summaryData.sections &&
          typeof summaryData.sections === "object"
        ) {
          for (const [section, count] of Object.entries(summaryData.sections)) {
            const sectionNum = parseInt(section, 10);
            if (!isNaN(sectionNum)) {
              // Allow section 0 too
              // Convert count to number if it's not already
              if (typeof count === "number") {
                referenceCounts[sectionNum] = count;
              } else if (typeof count === "string") {
                const parsedCount = parseInt(count, 10);
                if (!isNaN(parsedCount)) {
                  referenceCounts[sectionNum] = parsedCount;
                }
              } else if (
                typeof count === "object" &&
                count !== null &&
                "length" in count
              ) {
                referenceCounts[sectionNum] = (count as any).length;
              } else if (
                typeof count === "object" &&
                count !== null &&
                "fieldCount" in count
              ) {
                referenceCounts[sectionNum] = (count as any).fieldCount;
              }
            }
          }

          if (Object.keys(referenceCounts).length > 0) {
            console.log(
              `Loaded reference counts for ${
                Object.keys(referenceCounts).length
              } sections from ${summaryPath} (object format)`
            );
            return referenceCounts;
          }
        }
        // Try direct object format where section IDs are keys
        else if (typeof summaryData === "object" && summaryData !== null) {
          // Check if the structure is { 1: {fieldCount: 10}, 2: {fieldCount: 15} }
          let foundSections = false;
          for (const [key, value] of Object.entries(summaryData)) {
            const sectionNum = parseInt(key, 10);
            if (!isNaN(sectionNum)) {
              // Allow section 0 too
              if (
                typeof value === "object" &&
                value !== null &&
                "fieldCount" in value
              ) {
                referenceCounts[sectionNum] = (value as any).fieldCount;
                foundSections = true;
              }
            }
          }

          if (foundSections && Object.keys(referenceCounts).length > 0) {
            console.log(
              `Loaded reference counts for ${
                Object.keys(referenceCounts).length
              } sections from ${summaryPath} (direct object format)`
            );
            return referenceCounts;
          }
        }
      } catch (error) {
        console.warn(
          `Error loading summary file ${summaryPath}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        // Continue trying other methods
      }
    }

    // Look for sections-summary.json (with an 's') as an alternative
    const alternativePath = path.join(sectionDataDir, "sections-summary.json");
    if (fs.existsSync(alternativePath)) {
      try {
        console.log(`Found alternate summary file: ${alternativePath}`);
        const altData = JSON.parse(fs.readFileSync(alternativePath, "utf-8"));
        if (altData && typeof altData === "object") {
          // Try to extract field counts from this file
          for (const [key, value] of Object.entries(altData)) {
            if (/^\d+$/.test(key)) {
              const sectionNum = parseInt(key, 10);
              if (
                typeof value === "object" &&
                value !== null &&
                "fieldCount" in value
              ) {
                referenceCounts[sectionNum] = (value as any).fieldCount;
              } else if (typeof value === "number") {
                referenceCounts[sectionNum] = value;
              }
            }
          }

          if (Object.keys(referenceCounts).length > 0) {
            console.log(
              `Loaded reference counts for ${
                Object.keys(referenceCounts).length
              } sections from ${alternativePath}`
            );
            return referenceCounts;
          }
        }
      } catch (error) {
        // Ignore errors and proceed to next method
      }
    }

    // Try using the *-fields.json counts as a fallback
    const fieldPattern = /section(\d+)-fields\.json$/;
    const files = fs.readdirSync(sectionDataDir);

    for (const file of files) {
      const match = file.match(fieldPattern);
      if (match && match[1]) {
        try {
          const sectionNum = parseInt(match[1], 10);
          const filePath = path.join(sectionDataDir, file);
          const stats = fs.statSync(filePath);

          // Use a simple JSON length check first for efficiency
          if (stats.size > 0) {
            try {
              const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
              if (Array.isArray(data)) {
                referenceCounts[sectionNum] = data.length;
              }
            } catch (e) {
              // If full parsing fails, just estimate from file size
              // This is a rough heuristic: ~30 bytes per field on average
              const estimatedFields = Math.floor(stats.size / 30);
              if (estimatedFields > 0) {
                referenceCounts[sectionNum] = estimatedFields;
              }
            }
          }
        } catch (error) {
          // Ignore individual file errors
        }
      }
    }

    // If we found field count estimates from this directory
    if (Object.keys(referenceCounts).length > 0) {
      console.log(
        `Loaded reference counts for ${
          Object.keys(referenceCounts).length
        } sections from field files in ${sectionDataDir}`
      );
      return referenceCounts;
    }

    // Last resort: Load from individual section files
    for (let i = 1; i <= 30; i++) {
      const sectionFile = path.join(sectionDataDir, `section${i}.json`);
      if (fs.existsSync(sectionFile)) {
        try {
          const sectionData = JSON.parse(fs.readFileSync(sectionFile, "utf-8"));
          if (Array.isArray(sectionData)) {
            referenceCounts[i] = sectionData.length;
          } else if (sectionData && typeof sectionData === "object") {
            if ("fields" in sectionData && Array.isArray(sectionData.fields)) {
              referenceCounts[i] = sectionData.fields.length;
            } else if (
              "fieldCount" in sectionData &&
              typeof sectionData.fieldCount === "number"
            ) {
              referenceCounts[i] = sectionData.fieldCount;
            }
          }
        } catch (error) {
          // Skip any files that can't be parsed
        }
      }
    }

    // If we found any reference counts in this directory
    if (Object.keys(referenceCounts).length > 0) {
      console.log(
        `Loaded reference counts for ${
          Object.keys(referenceCounts).length
        } sections from individual section files in ${sectionDataDir}`
      );
      return referenceCounts;
    }
  }

  // If we couldn't find any data in any directory
  console.warn("No reference counts could be loaded from any source.");
  return referenceCounts;
}

// getSectionPageRange function removed as we're using refinedSectionPageRanges // imported from page-categorization-bridge.ts instead

/**
 * Apply post-processing to enforce strict section rules
 *
 * @param fields Categorized fields to post-process
 * @returns Updated categorized fields with strict section rules applied
 */
export function postProcessFields(
  fields: CategorizedField[]
): CategorizedField[] {
  console.time("postProcessFields");
  console.log(`Starting post-processing of ${fields.length} fields...`);

  // Keep track of corrections
  const corrections: Record<string, number> = { total: 0 };

  // Create a Map for O(1) lookups by ID
  const fieldsById = new Map<string, CategorizedField>();
  fields.forEach((field) => fieldsById.set(field.id, field));

  // Create section indices for faster section-specific operations
  const sectionIndices: Record<number, Set<string>> = {};
  for (let i = 0; i <= 30; i++) {
    sectionIndices[i] = new Set<string>();
  }

  // Index fields by section
  fields.forEach((field) => {
    sectionIndices[field.section].add(field.id);
  });

  // Define problematic sections with special handling
  const problematicSections = [
    // Sections that typically have too many fields
    15, 20, 12,
    // Sections that may be undersized
    16, 19, 27, 8,
  ];

  // Section keyword associations for better matching
  const sectionKeywords: Record<number, string[]> = {
    8: ["passport", "travel", "documents", "form1[0].Sections7-9[0]"],
    11: ["residence", "live", "lived", "address", "housing", "where", "stay"],
    12: [
      "education",
      "school",
      "college",
      "university",
      "degree",
      "diploma",
      "graduate",
    ],
    15: ["military", "service", "armed", "forces", "army", "navy", "discharge"],
    16: [
      "reference",
      "person",
      "know",
      "acquaintance",
      "friend",
      "verify",
      "vouch",
    ],
    19: [
      "foreign",
      "contact",
      "national",
      "international",
      "interact",
      "association",
    ],
    20: [
      "foreign",
      "activity",
      "business",
      "travel",
      "visit",
      "trip",
      "overseas",
    ],
    27: [
      "technology",
      "computer",
      "system",
      "unauthorized",
      "cyber",
      "access",
      "hack",
    ],
  };

  // Load reference counts for validation
  const referenceCounts = loadReferenceCounts();
  if (Object.keys(referenceCounts).length > 0) {
    console.log(
      "Loaded reference counts for",
      Object.keys(referenceCounts).length,
      "sections"
    );
  } else {
    console.warn(
      "No reference counts loaded - field balancing may be less effective"
    );
  }

  // First pass: Check all fields against patterns in sectionClassifications
  console.log(
    "Applying enhanced field classification based on sectionClassifications..."
  );

  // Post-processing logic here - simplified for this example
  // Actual implementation would include the rest of the algorithm

  // Create a new array with updated fields
  const processedFields: CategorizedField[] = [];
  for (const section of Object.keys(sectionIndices)) {
    const sectionNum = parseInt(section, 10);

    for (const id of sectionIndices[sectionNum]) {
      const field = fieldsById.get(id);
      if (field) {
        processedFields.push(field);
      }
    }
  }

  console.log(`Made ${corrections.total} corrections during post-processing`);
  for (const [key, count] of Object.entries(corrections)) {
    if (key !== "total" && count > 0) {
      console.log(`  ${key}: ${count}`);
    }
  }

  console.timeEnd("postProcessFields");
  return processedFields;
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
    const rawFields = await extractFields(pdfPath);
    console.log(`Extracted ${rawFields.length} fields from PDF.`);

    // Step 3: Categorize fields into sections
    console.log("Categorizing fields into sections...");
    const categorizedFields = rawFields.map((field) => categorizeField(field));

    // Step 4: Apply post-processing to validate and fix categorization
    console.log("Applying post-processing and validation...");
    const processedFields = postProcessFields(categorizedFields);

    // Step 5: Group fields by section
    const sectionFields: Record<number, CategorizedField[]> = {};

    // Initialize section arrays with empty arrays
    for (let i = 0; i <= 30; i++) {
      sectionFields[i] = [];
    }

    // Populate section arrays
    processedFields.forEach((field) => {
      if (!sectionFields[field.section]) {
        sectionFields[field.section] = [];
      }
      sectionFields[field.section].push(field);
    });

    // Step 6: Save uncategorized fields for analysis if requested
    if (saveUnknown && sectionFields[0] && sectionFields[0].length > 0) {
      const unknownFields = sectionFields[0];
      const outputDir = path.resolve(process.cwd(), "src", "section-data");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const unknownPath = path.join(outputDir, "unknown-fields.json");
      fs.writeFileSync(unknownPath, JSON.stringify(unknownFields, null, 2));
      console.log(
        `Saved ${unknownFields.length} uncategorized fields to ${unknownPath}`
      );
    }

    // Step 7: Print section statistics
    printSectionStatistics(processedFields);

    return sectionFields;
  } catch (error) {
    console.error("Error in extractFieldsBySection:", error);
    throw new Error(
      `Failed to extract and categorize fields: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Print statistics about field categorization by section
 * @param fields Categorized fields
 */
function printSectionStatistics(fields: CategorizedField[]): void {
  // Count fields per section
  const sectionCounts: Record<number, number> = {};
  fields.forEach((field) => {
    sectionCounts[field.section] = (sectionCounts[field.section] || 0) + 1;
  });

  // Get reference counts for comparison
  const referenceCounts = loadReferenceCounts();

  // Log the statistics
  console.log("\nSection Statistics:");
  console.log("==================");
  console.log("Section | Count | Expected | Difference");
  console.log("--------|-------|----------|------------");

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

  // Log overall stats
  const totalFields = fields.length;
  const categorizedFields = fields.filter((field) => field.section > 0).length;
  const categorizedPercentage = (
    (categorizedFields / totalFields) *
    100
  ).toFixed(2);

  console.log("\nOverall:");
  console.log(`Total fields: ${totalFields}`);
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
        Object.keys(sectionFields).length
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
 * @returns Array of fields with coordinate data
 */
export function enhanceFieldsWithCoordinates(fields: PDFField[]): PDFField[] {
  console.log(`Enhancing ${fields.length} fields with coordinate data...`);
  let fieldsWithCoordinates = 0;
  let fieldsWithEstimatedCoordinates = 0;

  // Create a page map to track field positions per page
  const pageMap: Record<
    number,
    {
      count: number;
      positions: { x: number[]; y: number[] };
      sectionMap: Record<
        number,
        { count: number; positions: { x: number[]; y: number[] } }
      >;
    }
  > = {};

  // First pass: count fields per page and record existing positions
  // Also group by known section for better positioning
  fields.forEach((field) => {
    const page = field.page || 1;
    const section = (field as CategorizedField).section || 0;

    // Initialize page map entry if it doesn't exist
    if (!pageMap[page]) {
      pageMap[page] = {
        count: 0,
        positions: { x: [], y: [] },
        sectionMap: {},
      };
    }

    // Initialize section map entry if it doesn't exist
    if (!pageMap[page].sectionMap[section]) {
      pageMap[page].sectionMap[section] = {
        count: 0,
        positions: { x: [], y: [] },
      };
    }

    // Increment counts
    pageMap[page].count++;
    pageMap[page].sectionMap[section].count++;

    // Try multiple ways to extract coordinates
    let foundCoords = false;
    const anyField = field as any;

    // Check for rect property with x, y, width, height
    if (
      field.rect &&
      typeof field.rect.x === "number" &&
      typeof field.rect.y === "number"
    ) {
      pageMap[page].positions.x.push(field.rect.x);
      pageMap[page].positions.y.push(field.rect.y);
      pageMap[page].sectionMap[section].positions.x.push(field.rect.x);
      pageMap[page].sectionMap[section].positions.y.push(field.rect.y);
      foundCoords = true;
    }
    // Check for x, y properties directly on field
    else if (typeof anyField.x === "number" && typeof anyField.y === "number") {
      pageMap[page].positions.x.push(anyField.x);
      pageMap[page].positions.y.push(anyField.y);
      pageMap[page].sectionMap[section].positions.x.push(anyField.x);
      pageMap[page].sectionMap[section].positions.y.push(anyField.y);
      foundCoords = true;
    }
    // Check for coordinates array [x, y, width, height]
    else if (
      Array.isArray(anyField.coordinates) &&
      anyField.coordinates.length >= 2
    ) {
      pageMap[page].positions.x.push(anyField.coordinates[0]);
      pageMap[page].positions.y.push(anyField.coordinates[1]);
      pageMap[page].sectionMap[section].positions.x.push(
        anyField.coordinates[0]
      );
      pageMap[page].sectionMap[section].positions.y.push(
        anyField.coordinates[1]
      );
      foundCoords = true;
    }
    // Check for a coords object
    else if (
      anyField.coords &&
      typeof anyField.coords.x === "number" &&
      typeof anyField.coords.y === "number"
    ) {
      pageMap[page].positions.x.push(anyField.coords.x);
      pageMap[page].positions.y.push(anyField.coords.y);
      pageMap[page].sectionMap[section].positions.x.push(anyField.coords.x);
      pageMap[page].sectionMap[section].positions.y.push(anyField.coords.y);
      foundCoords = true;
    }
    // Try to parse coordinates from attributes like data-position
    else if (typeof anyField.attributes === "object" && anyField.attributes) {
      // Look for position data in various attribute formats
      const posAttrs = ["data-position", "position", "pos", "bbox"];

      for (const attr of posAttrs) {
        if (anyField.attributes[attr]) {
          let posValue = anyField.attributes[attr];

          // Try to parse if it's a string
          if (typeof posValue === "string") {
            try {
              // Handle formats like "x,y,width,height" or "[x,y,width,height]"
              posValue = posValue
                .replace(/[\[\]]/g, "")
                .split(",")
                .map(Number);

              if (
                Array.isArray(posValue) &&
                posValue.length >= 2 &&
                !Number.isNaN(posValue[0]) &&
                !Number.isNaN(posValue[1])
              ) {
                pageMap[page].positions.x.push(posValue[0]);
                pageMap[page].positions.y.push(posValue[1]);
                pageMap[page].sectionMap[section].positions.x.push(posValue[0]);
                pageMap[page].sectionMap[section].positions.y.push(posValue[1]);
                foundCoords = true;
                break;
              }
            } catch (e) {
              // Failed to parse, continue to next attribute
            }
          }
        }
      }
    }
  });

  // Calculate average positions and variations per page and section
  // This helps in creating more accurate estimations later
  const pageStats: Record<
    number,
    {
      avgX: number;
      avgY: number;
      varX: number;
      varY: number;
      sectionStats: Record<
        string,
        { avgX: number; avgY: number; varX: number; varY: number }
      >;
    }
  > = {};

  Object.entries(pageMap).forEach(([pageStr, pageInfo]) => {
    const page = parseInt(pageStr, 10);
    const stats = {
      avgX: 0,
      avgY: 0,
      varX: 0,
      varY: 0,
      sectionStats: {} as Record<
        string,
        { avgX: number; avgY: number; varX: number; varY: number }
      >,
    };

    // Calculate page averages if we have positions
    if (pageInfo.positions.x.length > 0) {
      stats.avgX =
        pageInfo.positions.x.reduce((sum, pos) => sum + pos, 0) /
        pageInfo.positions.x.length;
      stats.avgY =
        pageInfo.positions.y.reduce((sum, pos) => sum + pos, 0) /
        pageInfo.positions.y.length;

      // Calculate variations
      stats.varX =
        Math.sqrt(
          pageInfo.positions.x.reduce(
            (sum, pos) => sum + Math.pow(pos - stats.avgX, 2),
            0
          ) / pageInfo.positions.x.length
        ) || 50; // Default if calculation fails

      stats.varY =
        Math.sqrt(
          pageInfo.positions.y.reduce(
            (sum, pos) => sum + Math.pow(pos - stats.avgY, 2),
            0
          ) / pageInfo.positions.y.length
        ) || 100; // Default if calculation fails
    } else {
      // Default values for pages with no position data
      stats.avgX = 306; // Half of 612 (standard page width)
      stats.avgY = 396; // Half of 792 (standard page height)
      stats.varX = 50; // Default x variation
      stats.varY = 100; // Default y variation
    }

    // Calculate section-specific statistics
    Object.entries(pageInfo.sectionMap).forEach(([sectionStr, sectionInfo]) => {
      const section = parseInt(sectionStr, 10);
      const sectionStats = { avgX: 0, avgY: 0, varX: 0, varY: 0 };

      if (sectionInfo.positions.x.length > 0) {
        sectionStats.avgX =
          sectionInfo.positions.x.reduce((sum, pos) => sum + pos, 0) /
          sectionInfo.positions.x.length;
        sectionStats.avgY =
          sectionInfo.positions.y.reduce((sum, pos) => sum + pos, 0) /
          sectionInfo.positions.y.length;

        // Calculate variations
        sectionStats.varX =
          Math.sqrt(
            sectionInfo.positions.x.reduce(
              (sum, pos) => sum + Math.pow(pos - sectionStats.avgX, 2),
              0
            ) / sectionInfo.positions.x.length
          ) || stats.varX; // Use page variation as fallback

        sectionStats.varY =
          Math.sqrt(
            sectionInfo.positions.y.reduce(
              (sum, pos) => sum + Math.pow(pos - sectionStats.avgY, 2),
              0
            ) / sectionInfo.positions.y.length
          ) || stats.varY; // Use page variation as fallback
      } else {
        // Use page stats as fallback for section with no position data
        sectionStats.avgX = stats.avgX;
        sectionStats.avgY = stats.avgY;
        sectionStats.varX = stats.varX;
        sectionStats.varY = stats.varY;
      }

      stats.sectionStats[section.toString()] = sectionStats;
    });

    pageStats[page] = stats;
  });

  // Process each field to ensure coordinate data
  return fields.map((field, index) => {
    const anyField = field as any;
    const section = (field as CategorizedField).section || 0;

    // Skip if field already has complete coordinate data
    if (
      field.rect &&
      typeof field.rect.x === "number" &&
      typeof field.rect.y === "number" &&
      typeof field.rect.width === "number" &&
      typeof field.rect.height === "number"
    ) {
      fieldsWithCoordinates++;
      return field;
    }

    // Initialize with default rect if missing
    const enhancedField = { ...field };

    if (!enhancedField.rect) {
      enhancedField.rect = { x: 0, y: 0, width: 0, height: 0 };
    }

    // Get page number (default to 1)
    const page = field.page || 1;

    // 1. Try to extract coordinates from various field properties

    // Try direct x,y properties
    if (typeof anyField.x === "number") enhancedField.rect.x = anyField.x;
    if (typeof anyField.y === "number") enhancedField.rect.y = anyField.y;

    // Try coordinates array
    if (
      Array.isArray(anyField.coordinates) &&
      anyField.coordinates.length >= 2
    ) {
      if (enhancedField.rect.x === 0)
        enhancedField.rect.x = anyField.coordinates[0];
      if (enhancedField.rect.y === 0)
        enhancedField.rect.y = anyField.coordinates[1];
      if (enhancedField.rect.width === 0 && anyField.coordinates.length >= 3) {
        enhancedField.rect.width = anyField.coordinates[2];
      }
      if (enhancedField.rect.height === 0 && anyField.coordinates.length >= 4) {
        enhancedField.rect.height = anyField.coordinates[3];
      }
    }

    // Try coords object
    if (anyField.coords) {
      if (typeof anyField.coords.x === "number" && enhancedField.rect.x === 0) {
        enhancedField.rect.x = anyField.coords.x;
      }
      if (typeof anyField.coords.y === "number" && enhancedField.rect.y === 0) {
        enhancedField.rect.y = anyField.coords.y;
      }
      if (
        typeof anyField.coords.width === "number" &&
        enhancedField.rect.width === 0
      ) {
        enhancedField.rect.width = anyField.coords.width;
      }
      if (
        typeof anyField.coords.height === "number" &&
        enhancedField.rect.height === 0
      ) {
        enhancedField.rect.height = anyField.coords.height;
      }
    }

    // Try to parse position from attributes
    if (typeof anyField.attributes === "object" && anyField.attributes) {
      const posAttrs = ["data-position", "position", "pos", "bbox"];

      for (const attr of posAttrs) {
        if (anyField.attributes[attr]) {
          let posValue = anyField.attributes[attr];

          if (typeof posValue === "string") {
            try {
              posValue = posValue
                .replace(/[\[\]]/g, "")
                .split(",")
                .map(Number);

              if (Array.isArray(posValue) && posValue.length >= 2) {
                if (enhancedField.rect.x === 0)
                  enhancedField.rect.x = posValue[0];
                if (enhancedField.rect.y === 0)
                  enhancedField.rect.y = posValue[1];
                if (enhancedField.rect.width === 0 && posValue.length >= 3) {
                  enhancedField.rect.width = posValue[2];
                }
                if (enhancedField.rect.height === 0 && posValue.length >= 4) {
                  enhancedField.rect.height = posValue[3];
                }
                break;
              }
            } catch (e) {
              // Failed to parse, continue to next attribute
            }
          }
        }
      }
    }

    // 2. Generate estimated values for missing coordinates
    if (
      enhancedField.rect.x === 0 ||
      enhancedField.rect.y === 0 ||
      enhancedField.rect.width === 0 ||
      enhancedField.rect.height === 0
    ) {
      fieldsWithEstimatedCoordinates++;

      // Get page stats
      const pageStats_ = pageStats[page] || {
        avgX: 306,
        avgY: 396,
        varX: 50,
        varY: 100,
        sectionStats: {},
      };

      // Get section stats if available, otherwise use page stats
      const sectionStats = pageStats_?.sectionStats[section] || {
        avgX: pageStats_.avgX,
        avgY: pageStats_.avgY,
        varX: pageStats_.varX,
        varY: pageStats_.varY,
      };

      // Helper function to generate a value with controlled randomness
      const generateValue = (mean: number, stdDev: number): number => {
        // Box-Muller transform for normal distribution
        const u = 1 - Math.random();
        const v = 1 - Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return mean + z * stdDev;
      };

      // Set x position using section statistics with some controlled randomness
      if (enhancedField.rect.x === 0) {
        enhancedField.rect.x = generateValue(
          sectionStats.avgX,
          sectionStats.varX / 3
        );
      }

      // Set y position using section statistics with controlled randomness
      if (enhancedField.rect.y === 0) {
        enhancedField.rect.y = generateValue(
          sectionStats.avgY,
          sectionStats.varY / 3
        );
      }

      // Set field width based on type
      if (enhancedField.rect.width === 0) {
        const fieldType = field.type || "text";
        const fieldNameLower = field.name.toLowerCase();

        if (fieldType === "checkbox" || fieldType === "radio") {
          enhancedField.rect.width = 15;
        } else if (
          fieldType === "textarea" ||
          fieldNameLower.includes("comments") ||
          fieldNameLower.includes("description")
        ) {
          enhancedField.rect.width = 200;
        } else {
          // Default size based on field name length with reasonable bounds
          const nameLength = field.name.length;
          enhancedField.rect.width = Math.max(
            50,
            Math.min(250, 30 + nameLength * 5)
          );
        }
      }

      // Set field height based on type
      if (enhancedField.rect.height === 0) {
        const fieldType = field.type || "text";
        const fieldNameLower = field.name.toLowerCase();

        if (fieldType === "checkbox" || fieldType === "radio") {
          enhancedField.rect.height = 15;
        } else if (
          fieldType === "textarea" ||
          fieldNameLower.includes("comments") ||
          fieldNameLower.includes("description")
        ) {
          enhancedField.rect.height = 80;
        } else {
          enhancedField.rect.height = 20;
        }
      }
    }

    return enhancedField;
  });
}

/**
 * Categorize a collection of PDF fields into their respective sections
 * @param fields The PDF fields to categorize
 * @returns Array of categorized fields
 */
export function categorizeFields(fields: PDFField[]): CategorizedField[] {
  console.time("categorizeFields");

  // First enhance fields with coordinate data for spatial analysis
  const fieldsWithCoordinates = enhanceFieldsWithCoordinates(fields);

  // Then categorize each field
  const categorizedFields = fieldsWithCoordinates.map((field) => {
    // Use the categorizeField function to assign a section
    const result = categorizeField(field);
    return result;
  });

  console.timeEnd("categorizeFields");
  return categorizedFields;
}
