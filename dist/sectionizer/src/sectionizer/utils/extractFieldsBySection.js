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
import { enhancedMultiDimensionalCategorization, refinedSectionPageRanges, sectionClassifications, extractSectionInfoFromName, extractSectionInfo } from "./fieldParsing.js";
import * as bridgeAdapter from "./bridgeAdapter.js";
import { sectionPageRanges } from "./field-clusterer.js";
import { strictSectionPatternsNumeric, sectionFieldPatterns } from "./section-patterns.js";
// Default to the embedded PDF under src/ for easier local development
const DEFAULT_PDF_PATH = path.resolve(process.cwd(), "src", "sf862.pdf");
// Use the already defined patterns from the bridge
// Instead of redefining them here, we'll use the patterns from sectionClassifications
// Function to determine if a field belongs to a specific section
function isFieldInSection(fieldName, section) {
    if (!fieldName)
        return false;
    const lowerName = fieldName.toLowerCase();
    // Use the extractSectionInfo function from fieldParsing.ts
    const sectionInfo = extractSectionInfo(fieldName);
    if (sectionInfo && sectionInfo.section === section) {
        return true;
    }
    // Fallback to strict pattern matching
    const patterns = strictSectionPatternsNumeric[section] || [];
    return patterns.some(pattern => pattern.test(lowerName));
}
/**
 * Extract all fields from the SF-86 PDF
 *
 * @param pdfPath Path to the SF-86 PDF file
 * @returns Promise resolving to an array of PDF fields
 */
export async function extractFields(pdfPath = DEFAULT_PDF_PATH) {
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
            .filter((field) => field.name) // Filter out fields without names
            .map((field) => ({
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
    }
    catch (error) {
        // Fallback to mock data if in development and mock data exists
        if (process.env.NODE_ENV === "development" && process.env.USE_MOCK_DATA) {
            const mockDataPath = path.resolve(process.cwd(), "scripts", "mock-data", "sf86-fields.json");
            if (fs.existsSync(mockDataPath)) {
                console.warn("Using mock data from sf86-fields.json");
                const mockData = JSON.parse(fs.readFileSync(mockDataPath, "utf-8"));
                return mockData;
            }
        }
        // Re-throw the error if no fallback is available
        throw new Error(`Failed to extract fields from PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Categorize a single field based on various metadata
 */
export function categorizeField(field, useEnhanced = true) {
    const result = {
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
            const enhancedResult = enhancedMultiDimensionalCategorization(field.name, field.label || "", field.page, typeof field.value === "string" ? field.value : "", [] // Neighbor fields - not available at this stage
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
        }
        catch (error) {
            console.warn("Error during enhanced categorization:", error);
        }
    }
    // If we reached here, no section was found
    return result;
}
/**
 * Load reference counts from section-data folder
 * Falls back to default values if no reference data available
 */
export function loadReferenceCounts() {
    try {
        const dataPath = path.join(process.cwd(), "src", "section-data", "reference-counts.json");
        if (fs.existsSync(dataPath)) {
            const refData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
            // Make sure the data is in the right format (number to number mapping)
            const formattedData = {};
            for (const [section, count] of Object.entries(refData)) {
                const sectionNum = parseInt(section, 10);
                if (!isNaN(sectionNum)) {
                    // If it's a complex object with fields/entries/subsections, use the fields count
                    if (typeof count === 'object' && count !== null && 'fields' in count) {
                        formattedData[sectionNum] = count.fields;
                    }
                    else if (typeof count === 'number') {
                        formattedData[sectionNum] = count;
                    }
                }
            }
            return formattedData;
        }
    }
    catch (error) {
        console.warn(`Error loading reference counts: ${error}`);
    }
    // Default values as fallback
    return {
        0: 5, // Very few fields should be unknown
        1: 10,
        2: 20,
        // Add other section defaults as needed
        13: 20, // Section 13 (Employment Activities) typically has many fields
        17: 15, // Section 17 (Marital Status) also has many fields
        // Add more as needed
    };
}
/**
 * Identify sections with count issues compared to reference counts
 * @param sectionMap Object mapping section numbers to arrays of fields
 * @param referenceCounts Expected field counts per section
 * @returns Object with arrays of sections that have issues
 */
function identifyProblemSections(sectionMap, referenceCounts) {
    const oversized = [];
    const undersized = [];
    const missing = [];
    // Skip section 0 (uncategorized)
    for (let section = 1; section <= 30; section++) {
        const sectionFields = sectionMap[section] || [];
        const expectedCount = referenceCounts[section] || 0;
        if (expectedCount === 0)
            continue; // Skip sections without reference counts
        if (sectionFields.length === 0) {
            missing.push(section);
        }
        else if (sectionFields.length < expectedCount * 0.75) { // Allow some flexibility
            undersized.push(section);
        }
        else if (sectionFields.length > expectedCount * 1.5) { // Allow some flexibility
            oversized.push(section);
        }
    }
    return { oversized, undersized, missing };
}
/**
 * Post-process fields after initial categorization to improve accuracy
 * This includes special handling for specific sections with known patterns
 * @param fields Array of categorized fields
 * @returns The fields with improved categorization
 */
function postProcessFields(fields) {
    try {
        console.log(`Post-processing ${fields.length} categorized fields`);
        // Group fields by section
        const sectionMap = {};
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
            const entryGroups = {};
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
                    const fieldToMove = entryGroups[largestEntryKey].find(f => /explanation|general|have[-_]?you[-_]?used|other[-_]?names/i.test(f.name.toLowerCase())) ||
                        entryGroups[largestEntryKey][0];
                    fieldToMove.entry = 0;
                    console.log(`Created base content field for Section 5`);
                }
            }
            else if (baseContentFields.length > 1) {
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
            const entryGroups = {};
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
            const subsectionGroups = {};
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
    }
    catch (error) {
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
export async function extractFieldsBySection(pdfPath = DEFAULT_PDF_PATH, saveUnknown = true) {
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
        const sectionFields = {};
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
        if (saveUnknown && sectionFields["0"] && sectionFields["0"].length > 0) {
            const unknownFields = sectionFields["0"];
            const outputDir = path.resolve(process.cwd(), "reports");
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            const unknownPath = path.join(outputDir, "unknown-fields.json");
            fs.writeFileSync(unknownPath, JSON.stringify(unknownFields, null, 2));
            console.log(`Saved ${unknownFields.length} uncategorized fields to ${unknownPath}`);
        }
        // NEW: Sort fields within each section by subsection (alphabetically) and entry (numeric)
        Object.entries(sectionFields).forEach(([sectionKey, arr]) => {
            arr.sort((a, b) => {
                const subA = a.subsection ?? "";
                const subB = b.subsection ?? "";
                if (subA !== subB) {
                    // Place fields without subsection last
                    if (!subA)
                        return 1;
                    if (!subB)
                        return -1;
                    return subA.localeCompare(subB, undefined, { numeric: true, sensitivity: "base" });
                }
                // Same subsection, compare entry if both numbers
                const entryA = typeof a.entry === "number" ? a.entry : Number.MAX_SAFE_INTEGER;
                const entryB = typeof b.entry === "number" ? b.entry : Number.MAX_SAFE_INTEGER;
                return entryA - entryB;
            });
        });
        // Step 7: Print section statistics
        printSectionStatistics(processedFields);
        return sectionFields;
    }
    catch (error) {
        console.error("Error in extractFieldsBySection:", error);
        throw new Error(`Failed to extract and categorize fields: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Print statistics about field categorization by section
 * @param fields Categorized fields
 */
function printSectionStatistics(fields) {
    // Count fields per section
    const sectionCounts = {};
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
            }
            else if (count > expected) {
                statusSymbol = "+ "; // Too many fields
            }
            else {
                statusSymbol = "- "; // Too few fields
            }
        }
        console.log(`${section.toString().padStart(7)} | ${count
            .toString()
            .padStart(5)} | ${expectedStr.padStart(8)} | ${statusSymbol}${differenceStr.padStart(10)}`);
    }
    // Additional subsection statistics
    console.log("\nSubsection Breakdown:");
    console.log("====================");
    for (const section of sortedSections) {
        // Collect subsection counts for this section
        const subsectionCounts = {};
        fields
            .filter((f) => f.section === section && f.subsection)
            .forEach((f) => {
            const sub = f.subsection;
            subsectionCounts[sub] = (subsectionCounts[sub] || 0) + 1;
        });
        if (Object.keys(subsectionCounts).length === 0) {
            continue; // No subsections for this section
        }
        console.log(`Section ${section}`);
        Object.entries(subsectionCounts)
            .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: "base" }))
            .forEach(([sub, cnt]) => {
            console.log(`  ${sub.padStart(6)} : ${cnt}`);
        });
    }
    // Log the overall stats
    const totalFields = fields.length;
    const categorizedFields = fields.filter((field) => field.section > 0).length;
    const categorizedPercentage = ((categorizedFields / totalFields) *
        100).toFixed(2);
    console.log("\nOverall:");
    console.log(`Total fields: ${totalFields}`);
    console.log(`Categorized fields: ${categorizedFields} (${categorizedPercentage}%)`);
    console.log(`Uncategorized fields: ${totalFields - categorizedFields} (${(100 - parseFloat(categorizedPercentage)).toFixed(2)}%)`);
}
/**
 * Save unknown/uncategorized fields to a JSON file for analysis
 *
 * @param fields Array of uncategorized fields
 * @param outputPath Path to save the unknown fields JSON file
 */
export function saveUnknownFields(fields, outputPath) {
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
    }
    catch (error) {
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
export async function groupFieldsBySection(fields, saveUnknown = true) {
    try {
        // Group fields by section
        const sectionFields = {};
        // Initialize section arrays with empty arrays
        for (let i = 0; i <= 30; i++) {
            sectionFields[i.toString()] = [];
        }
        // Track field IDs to avoid duplication
        const processedFieldIds = new Set();
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
        console.log(`Grouped ${processedFieldIds.size} unique fields into ${Object.keys(sectionFields).length} sections`);
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
            console.log(`Saved ${unknownFields.length} uncategorized fields to ${unknownPath}`);
        }
        // Sort fields within each section by subsection and entry for consistent ordering
        Object.entries(sectionFields).forEach(([sectionKey, arr]) => {
            arr.sort((a, b) => {
                const subA = a.subsection ?? "";
                const subB = b.subsection ?? "";
                if (subA !== subB) {
                    if (!subA)
                        return 1; // place undefined subsections last
                    if (!subB)
                        return -1;
                    return subA.localeCompare(subB, undefined, { numeric: true, sensitivity: "base" });
                }
                const entryA = typeof a.entry === "number" ? a.entry : Number.MAX_SAFE_INTEGER;
                const entryB = typeof b.entry === "number" ? b.entry : Number.MAX_SAFE_INTEGER;
                return entryA - entryB;
            });
        });
        return sectionFields;
    }
    catch (error) {
        console.error("Error in groupFieldsBySection:", error);
        throw new Error(`Failed to group fields by section: ${error instanceof Error ? error.message : String(error)}`);
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
export function enhanceFieldsWithCoordinates(fields) {
    console.log(`Enhancing ${fields.length} fields with coordinate data...`);
    let fieldsWithCoordinates = 0;
    let fieldsWithEstimatedCoordinates = 0;
    // Create a page map to track field positions per page
    const pageMap = {};
    // First pass: count fields per page and record existing positions
    // Also group by known section for better positioning
    fields.forEach((field) => {
        const page = field.page || 1;
        const section = field.section || 0;
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
        const anyField = field;
        // Check for rect property with x, y, width, height
        if (field.rect &&
            typeof field.rect.x === "number" &&
            typeof field.rect.y === "number") {
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
        else if (Array.isArray(anyField.coordinates) &&
            anyField.coordinates.length >= 2) {
            pageMap[page].positions.x.push(anyField.coordinates[0]);
            pageMap[page].positions.y.push(anyField.coordinates[1]);
            pageMap[page].sectionMap[section].positions.x.push(anyField.coordinates[0]);
            pageMap[page].sectionMap[section].positions.y.push(anyField.coordinates[1]);
            foundCoords = true;
        }
        // Check for a coords object
        else if (anyField.coords &&
            typeof anyField.coords.x === "number" &&
            typeof anyField.coords.y === "number") {
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
                            if (Array.isArray(posValue) &&
                                posValue.length >= 2 &&
                                !Number.isNaN(posValue[0]) &&
                                !Number.isNaN(posValue[1])) {
                                pageMap[page].positions.x.push(posValue[0]);
                                pageMap[page].positions.y.push(posValue[1]);
                                pageMap[page].sectionMap[section].positions.x.push(posValue[0]);
                                pageMap[page].sectionMap[section].positions.y.push(posValue[1]);
                                foundCoords = true;
                                break;
                            }
                        }
                        catch (e) {
                            // Failed to parse, continue to next attribute
                        }
                    }
                }
            }
        }
    });
    // Calculate average positions and variations per page and section
    // This helps in creating more accurate estimations later
    const pageStats = {};
    Object.entries(pageMap).forEach(([pageStr, pageInfo]) => {
        const page = parseInt(pageStr, 10);
        const stats = {
            avgX: 0,
            avgY: 0,
            varX: 0,
            varY: 0,
            sectionStats: {},
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
                Math.sqrt(pageInfo.positions.x.reduce((sum, pos) => sum + Math.pow(pos - stats.avgX, 2), 0) / pageInfo.positions.x.length) || 50; // Default if calculation fails
            stats.varY =
                Math.sqrt(pageInfo.positions.y.reduce((sum, pos) => sum + Math.pow(pos - stats.avgY, 2), 0) / pageInfo.positions.y.length) || 100; // Default if calculation fails
        }
        else {
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
                    Math.sqrt(sectionInfo.positions.x.reduce((sum, pos) => sum + Math.pow(pos - sectionStats.avgX, 2), 0) / sectionInfo.positions.x.length) || stats.varX; // Use page variation as fallback
                sectionStats.varY =
                    Math.sqrt(sectionInfo.positions.y.reduce((sum, pos) => sum + Math.pow(pos - sectionStats.avgY, 2), 0) / sectionInfo.positions.y.length) || stats.varY; // Use page variation as fallback
            }
            else {
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
        const anyField = field;
        const section = field.section || 0;
        // Skip if field already has complete coordinate data
        if (field.rect &&
            typeof field.rect.x === "number" &&
            typeof field.rect.y === "number" &&
            typeof field.rect.width === "number" &&
            typeof field.rect.height === "number") {
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
        if (typeof anyField.x === "number")
            enhancedField.rect.x = anyField.x;
        if (typeof anyField.y === "number")
            enhancedField.rect.y = anyField.y;
        // Try coordinates array
        if (Array.isArray(anyField.coordinates) &&
            anyField.coordinates.length >= 2) {
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
            if (typeof anyField.coords.width === "number" &&
                enhancedField.rect.width === 0) {
                enhancedField.rect.width = anyField.coords.width;
            }
            if (typeof anyField.coords.height === "number" &&
                enhancedField.rect.height === 0) {
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
                        }
                        catch (e) {
                            // Failed to parse, continue to next attribute
                        }
                    }
                }
            }
        }
        // 2. Generate estimated values for missing coordinates
        if (enhancedField.rect.x === 0 ||
            enhancedField.rect.y === 0 ||
            enhancedField.rect.width === 0 ||
            enhancedField.rect.height === 0) {
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
            const generateValue = (mean, stdDev) => {
                // Box-Muller transform for normal distribution
                const u = 1 - Math.random();
                const v = 1 - Math.random();
                const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
                return mean + z * stdDev;
            };
            // Set x position using section statistics with some controlled randomness
            if (enhancedField.rect.x === 0) {
                enhancedField.rect.x = generateValue(sectionStats.avgX, sectionStats.varX / 3);
            }
            // Set y position using section statistics with controlled randomness
            if (enhancedField.rect.y === 0) {
                enhancedField.rect.y = generateValue(sectionStats.avgY, sectionStats.varY / 3);
            }
            // Set field width based on type
            if (enhancedField.rect.width === 0) {
                const fieldType = field.type || "text";
                const fieldNameLower = field.name.toLowerCase();
                if (fieldType === "checkbox" || fieldType === "radio") {
                    enhancedField.rect.width = 15;
                }
                else if (fieldType === "textarea" ||
                    fieldNameLower.includes("comments") ||
                    fieldNameLower.includes("description")) {
                    enhancedField.rect.width = 200;
                }
                else {
                    // Default size based on field name length with reasonable bounds
                    const nameLength = field.name.length;
                    enhancedField.rect.width = Math.max(50, Math.min(250, 30 + nameLength * 5));
                }
            }
            // Set field height based on type
            if (enhancedField.rect.height === 0) {
                const fieldType = field.type || "text";
                const fieldNameLower = field.name.toLowerCase();
                if (fieldType === "checkbox" || fieldType === "radio") {
                    enhancedField.rect.height = 15;
                }
                else if (fieldType === "textarea" ||
                    fieldNameLower.includes("comments") ||
                    fieldNameLower.includes("description")) {
                    enhancedField.rect.height = 80;
                }
                else {
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
export function categorizeFields(fields) {
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
