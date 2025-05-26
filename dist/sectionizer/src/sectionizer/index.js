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
import { RuleEngine } from "./engine.js";
import { parseCommandLineArgs, validatePdf, configureCommandLineParser, } from "./utils/cli-args.js";
import { extractFields, printSectionStatistics, } from "./utils/extractFieldsBySection.js";
import { getPageDimensions } from "./utils/spatialAnalysis.js";
import { groupFieldsBySection } from "./utils/fieldGrouping.js";
import { validateSectionCounts as validateSectionCountsUtil } from "./utils/validation.js";
// Import the SelfHealingManager for rule generation
import { SelfHealingManager } from "./utils/self-healing.js";
// Import from consolidated utilities
import { initPageCategorization, enhancedSectionCategorization, updateFieldWithPageData, extractSectionInfoFromName, refinedSectionPageRanges, } from "./utils/fieldParsing.js";
// Import only the necessary bridge adapter functions
import { getLimitedNeighborContext } from "./utils/bridgeAdapter.js";
// Import the consolidated self-healing module
import { runConsolidatedSelfHealing, ConsolidatedSelfHealingManager, } from "./utils/consolidated-self-healing.js";
// Import consolidated logging module
import logger from "./utils/logging.js";
// Import these at the top of the file (after existing imports)
import { extractSpatialInfo, calculateSpatialConfidenceBoost, predictSectionBySpatialProximity, getSpatialNeighbors, } from "./utils/spatialAnalysis.js";
// Import the rules updater
import { updateRules } from "./utils/rules-updater.js";
// Import PDFDocument
import { PDFDocument } from "pdf-lib";
import { expectedFieldCounts } from "./utils/field-clusterer.js";
// Import the optimizedCategorizeFields function at the top of the file
import { optimizedCategorizeFields } from "./utils/optimizedProcessing.js";
// Import the enhanced self-healing module
import { applyEnhancedCategorization, runEnhancedSelfHealing, } from "./utils/enhanced-self-healingv1.js";
import { EnhancedSelfHealer } from "./utils/enhanced-self-healing.js";
// Parse command line arguments
const program = configureCommandLineParser();
const options = program.parse(process.argv).opts();
// Set log level based on command line options
logger.setLogLevel(options.logLevel || "info");
// Helper function to resolve PDF paths correctly
function resolvePdfPath(pdfPath) {
    // Handle absolute paths
    if (path.isAbsolute(pdfPath)) {
        return pdfPath;
    }
    // Handle paths relative to the current working directory
    return path.resolve(process.cwd(), pdfPath);
}
// Replace the log function with our new logger
function log(severity, message) {
    logger.log(severity, message);
}
/**
 * Distribute remaining unknown (section 0) fields to appropriate sections based on page numbers
 * @param sectionFields Fields grouped by section
 * @param referenceCounts Reference counts for section validation
 * @returns Updated section fields
 */
async function distributeRemainingUnknownFields(sectionFields, referenceCounts) {
    const result = { ...sectionFields };
    // If there are no unknown fields, nothing to do
    if (!result["0"] || result["0"].length === 0) {
        return result;
    }
    log("info", `Distributing ${result["0"].length} remaining unknown fields based on page numbers`);
    // Get page to section mapping from refinedSectionPageRanges
    const pageToSection = {};
    // Build mapping of each page to its most likely section
    for (const [sectionStr, [startPage, endPage]] of Object.entries(refinedSectionPageRanges)) {
        const section = parseInt(sectionStr, 10);
        for (let page = startPage; page <= endPage; page++) {
            pageToSection[page] = section;
        }
    }
    // Find sections that are still undersized
    const undersizedSections = [];
    Object.entries(referenceCounts).forEach(([sectionKey, expectedCount]) => {
        const section = parseInt(sectionKey, 10);
        if (isNaN(section) || section === 0)
            return;
        const actualCount = (result[section.toString()] || []).length;
        // Use the total of fields, entries, and subsections for comparison
        const totalExpected = expectedCount.fields + expectedCount.entries + expectedCount.subsections;
        if (actualCount < totalExpected) {
            undersizedSections.push(section);
        }
    });
    // Sort by most undersized first
    undersizedSections.sort((a, b) => {
        const aExpected = referenceCounts[a].fields +
            referenceCounts[a].entries +
            referenceCounts[a].subsections;
        const bExpected = referenceCounts[b].fields +
            referenceCounts[b].entries +
            referenceCounts[b].subsections;
        const aDeficit = aExpected - (result[a.toString()] || []).length;
        const bDeficit = bExpected - (result[b.toString()] || []).length;
        return bDeficit - aDeficit;
    });
    log("info", `Found ${undersizedSections.length} undersized sections: ${undersizedSections.join(", ")}`);
    // Group unknown fields by page
    const fieldsByPage = {};
    for (const field of result["0"]) {
        if (!field.page || field.page <= 0)
            continue;
        if (!fieldsByPage[field.page]) {
            fieldsByPage[field.page] = [];
        }
        fieldsByPage[field.page].push(field);
    }
    // Track assignments made
    let assignedCount = 0;
    const assignmentsBySection = {};
    // First, prioritize filling undersized sections
    for (const section of undersizedSections) {
        const expectedTotal = referenceCounts[section].fields +
            referenceCounts[section].entries +
            referenceCounts[section].subsections;
        const deficit = expectedTotal - (result[section.toString()] || []).length;
        if (deficit <= 0)
            continue;
        // Find pages belonging to this section
        const sectionPages = Object.entries(pageToSection)
            .filter(([_, s]) => s === section)
            .map(([page]) => parseInt(page, 10));
        // Collect all fields from these pages
        let fieldsForSection = [];
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
            fieldsByPage[field.page] = fieldsByPage[field.page].filter((f) => f.id !== field.id);
        }
    }
    // For all remaining unknown fields, distribute to most likely section based on page
    const remainingUnknown = [...result["0"]];
    const stillUnknown = [];
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
            const expectedCount = referenceCounts[sectionForPage] || {
                fields: 0,
                entries: 0,
                subsections: 0,
            };
            const expectedTotal = expectedCount.fields +
                expectedCount.entries +
                expectedCount.subsections;
            const currentCount = result[sectionForPage.toString()].length;
            // Only assign if not already oversized
            if (expectedTotal === 0 || currentCount < expectedTotal * 1.2) {
                // Allow up to 20% over expected
                // Update field
                field.section = sectionForPage;
                field.confidence = 0.6; // Lower confidence for fallback assignment
                // Add to section
                result[sectionForPage.toString()].push(field);
                // Track assignment
                assignedCount++;
                assignmentsBySection[sectionForPage] =
                    (assignmentsBySection[sectionForPage] || 0) + 1;
            }
            else {
                // Section is already oversized, keep as unknown
                stillUnknown.push(field);
            }
        }
        else {
            // No section mapping for this page, keep as unknown
            stillUnknown.push(field);
        }
    }
    // Update unknown fields
    result["0"] = stillUnknown;
    // Log results
    log("info", `Distributed ${assignedCount} unknown fields based on page numbers`);
    // Log section assignments
    Object.entries(assignmentsBySection)
        .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
        .forEach(([section, count]) => {
        log("debug", `  Assigned ${count} fields to section ${section}`);
    });
    log("info", `${result["0"].length} fields remain uncategorized`);
    return result;
}
/**
 * Validate section counts against reference counts
 */
function validateSectionCounts(sectionFields, referenceCounts, maxDeviationPercent = 30) {
    // No need to convert referenceCounts since it's already in the right format
    const formattedCounts = referenceCounts;
    // Use the imported utility function with properly formatted counts
    return validateSectionCountsUtil(sectionFields, formattedCounts, {
        maxDeviationPercent,
    });
}
// Update the afterSelfHealing function to be more aggressive in distributing fields from section 0, ignoring expected count limits
async function afterSelfHealing(sectionFields, referenceCounts) {
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
    const { sectionPageRanges } = await import("./utils/field-clusterer.js");
    log("info", "Aggressively distributing " +
        unknownCount +
        " remaining unknown fields based on page numbers");
    // Group unknown fields by page
    const fieldsByPage = {};
    unknownFields.forEach((field) => {
        const page = field.page || 0;
        if (!fieldsByPage[page]) {
            fieldsByPage[page] = [];
        }
        fieldsByPage[page].push(field);
    });
    // Track which fields have been assigned
    const assignedFieldIds = new Set();
    let totalAssigned = 0;
    // First pass: Assign fields based on page ranges in sectionPageRanges
    for (const [page, fields] of Object.entries(fieldsByPage)) {
        const pageNum = parseInt(page, 10);
        if (isNaN(pageNum) || pageNum <= 0)
            continue;
        // Find what section this page belongs to based on page ranges
        let bestSection = 0;
        let bestPriority = -1;
        Object.entries(sectionPageRanges).forEach(([sectionKey, pageRange]) => {
            const section = parseInt(sectionKey, 10);
            if (isNaN(section) || section <= 0)
                return;
            // Check if page is within the section's range
            if (pageNum >= pageRange[0] && pageNum <= pageRange[1]) {
                // Calculate priority - find section with closest range
                const pageFit = 1 -
                    Math.min(Math.abs(pageNum - pageRange[0]), Math.abs(pageNum - pageRange[1])) /
                        (pageRange[1] - pageRange[0] + 1);
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
                    confidence: 0.7, // Medium confidence for page-based assignment
                });
            }
            totalAssigned += fields.length;
            log("debug", `Assigned ${fields.length} fields to section ${bestSection} based on page ${pageNum}`);
        }
    }
    // Second pass: Distribute remaining fields based on nearby section assignments
    // This helps with pages that don't have a clear section mapping
    const remainingFields = unknownFields.filter((field) => !assignedFieldIds.has(field.id));
    if (remainingFields.length > 0) {
        log("info", `Still have ${remainingFields.length} unknown fields after page-based distribution. Using nearest section approach.`);
        // Create a mapping of pages to sections based on current assignments
        const pageToSectionMap = {};
        // Collect all section assignments for all pages
        Object.entries(result).forEach(([sectionKey, fields]) => {
            const section = parseInt(sectionKey, 10);
            if (isNaN(section) || section <= 0)
                return;
            fields.forEach((field) => {
                const page = field.page || 0;
                if (page <= 0)
                    return;
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
            if (page <= 0)
                continue;
            // Try to find sections on this exact page first
            let assignedSection = 0;
            if (pageToSectionMap[page] && pageToSectionMap[page].length > 0) {
                // Use the most common section on this page
                const sectionCounts = {};
                pageToSectionMap[page].forEach((section) => {
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
                if (nearestPage > 0 &&
                    pageToSectionMap[nearestPage] &&
                    pageToSectionMap[nearestPage].length > 0) {
                    const sectionCounts = {};
                    pageToSectionMap[nearestPage].forEach((section) => {
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
                const candidates = [];
                Object.entries(referenceCounts).forEach(([sectionStr, expectedCount]) => {
                    const section = parseInt(sectionStr, 10);
                    if (isNaN(section) || section <= 0)
                        return;
                    const currentCount = (result[sectionStr] || []).length;
                    const expectedTotal = expectedCount.fields +
                        expectedCount.entries +
                        expectedCount.subsections;
                    if (expectedTotal > currentCount) {
                        candidates.push({
                            section,
                            deficit: expectedTotal - currentCount,
                        });
                    }
                });
                // If no candidates, use any valid section between 1-30
                if (candidates.length === 0) {
                    // Just distribute evenly across all valid sections
                    const validSections = Array.from({ length: 30 }, (_, i) => i + 1);
                    const randomSection = validSections[Math.floor(Math.random() * validSections.length)];
                    assignedSection = randomSection;
                }
                else {
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
                    confidence: 0.5, // Lower confidence for approximation-based assignment
                });
                totalAssigned++;
            }
        }
    }
    // Third pass: Assign any remaining fields to a default section
    // At this point, we just want to ensure section 0 is empty
    const stillRemainingFields = unknownFields.filter((field) => !assignedFieldIds.has(field.id));
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
                confidence: 0.4, // Low confidence for fallback assignment
            });
            totalAssigned++;
        }
    }
    // Update the section 0 array with only fields that weren't assigned
    result["0"] = unknownFields.filter((field) => !assignedFieldIds.has(field.id));
    log("info", `${totalAssigned} fields have been distributed from unknown section`);
    log("info", `${result["0"].length} fields remain uncategorized`);
    return result;
}
/**
 * Generate subsection rules for a section based on field patterns
 * Enhanced to handle the various subsection and entry formats
 */
function generateEnhancedSubsectionRules(sectionFields, sectionId) {
    const rules = [];
    // Skip subsection rule generation for sections 1-8 as they don't have subsections
    if (sectionId <= 8) {
        log("info", `Skipping subsection rule generation for section ${sectionId} as sections 1-8 don't have subsections`);
        return [];
    }
    // Group fields by subsection
    const subsectionGroups = {};
    sectionFields.forEach((field) => {
        const sub = field.subsection || "unknown";
        if (!subsectionGroups[sub]) {
            subsectionGroups[sub] = [];
        }
        subsectionGroups[sub].push(field);
    });
    // Skip if no fields have subsections
    if (Object.keys(subsectionGroups).length <= 1 &&
        subsectionGroups["unknown"]) {
        log("info", `Section ${sectionId} has no subsection information in field data`);
        return [];
    }
    log("info", `Section ${sectionId} has ${Object.keys(subsectionGroups).length} subsections: ${Object.keys(subsectionGroups).join(", ")}`);
    // Process each subsection to extract patterns
    for (const [subsection, fields] of Object.entries(subsectionGroups)) {
        if (subsection === "unknown")
            continue;
        log("debug", `Analyzing subsection ${subsection} with ${fields.length} fields`);
        // Group by entry for further analysis
        const entryCounts = {};
        fields.forEach((field) => {
            const entry = field.entry || 0;
            entryCounts[entry] = (entryCounts[entry] || 0) + 1;
        });
        // Collect common patterns
        const patternSet = new Set();
        // Analyze field names to identify patterns
        fields.forEach((field) => {
            const fieldName = field.name.toLowerCase();
            // Pattern: section21d (direct)
            const directPattern = `section${sectionId}${subsection.toLowerCase()}`;
            if (fieldName.includes(directPattern)) {
                patternSet.add(directPattern);
            }
            // Pattern: section21_d (with underscore)
            const underscorePattern = `section${sectionId}_${subsection.toLowerCase()}`;
            if (fieldName.includes(underscorePattern)) {
                patternSet.add(underscorePattern);
            }
            // Pattern: section21.d (with dot)
            const dotPattern = `section${sectionId}.${subsection.toLowerCase()}`;
            if (fieldName.includes(dotPattern)) {
                patternSet.add(dotPattern);
            }
            // Form pattern: form1[0].Section21D[0]
            const formPattern = `form1\\[\\d+\\]\\.section${sectionId}[-_]?${subsection.toLowerCase()}`;
            if (fieldName.match(new RegExp(formPattern, "i"))) {
                patternSet.add(formPattern);
            }
        });
        // Generate pattern-specific entry rules if we have multiple entries
        const entries = Object.keys(entryCounts)
            .map(Number)
            .filter((e) => e > 0)
            .sort();
        if (entries.length > 0) {
            log("debug", `Subsection ${subsection} has entries: ${entries.join(", ")}`);
            // Generate entry patterns
            entries.forEach((entry) => {
                // Common entry pattern formats
                const entryPatterns = [
                    `section${sectionId}${subsection.toLowerCase()}${entry}`, // section21d1
                    `section${sectionId}_${subsection.toLowerCase()}_${entry}`, // section21_d_1
                    `section${sectionId}\\.${subsection.toLowerCase()}\\.${entry}`, // section21.d.1
                    `form1\\[\\d+\\]\\.section${sectionId}[-_]?${subsection.toLowerCase()}[-_]?${entry}`, // form1[0].Section21D_1[0]
                ];
                // Add entry patterns
                entryPatterns.forEach((pattern) => {
                    rules.push({
                        section: sectionId,
                        subsection,
                        pattern,
                        confidence: 0.92,
                        description: `Entry ${entry} pattern for subsection ${subsection} in section ${sectionId}`,
                        entryPattern: `${entry}`,
                    });
                });
            });
        }
        // Add subsection patterns
        patternSet.forEach((pattern) => {
            rules.push({
                section: sectionId,
                subsection,
                pattern,
                confidence: 0.9,
                description: `Subsection ${subsection} pattern for section ${sectionId}`,
            });
        });
        // If no specific patterns found, add a generic pattern
        if (patternSet.size === 0) {
            const genericPattern = `section[-_]?${sectionId}.*?[^a-z]${subsection.toLowerCase()}[^a-z0-9]`;
            rules.push({
                section: sectionId,
                subsection,
                pattern: genericPattern,
                confidence: 0.75,
                description: `Generic pattern for subsection ${subsection} in section ${sectionId}`,
            });
        }
    }
    // Add special case for section 17 (Marital Status) which has complex patterning
    if (sectionId === 17) {
        // Special patterns for Section 17 subsections
        [
            { sub: "1", pattern: "Section17_1", desc: "Current marriage" },
            { sub: "2", pattern: "Section17_2", desc: "Former spouse" },
            { sub: "3", pattern: "Section17_3", desc: "Cohabitants" },
        ].forEach(({ sub, pattern, desc }) => {
            rules.push({
                section: 17,
                subsection: sub,
                pattern: pattern,
                confidence: 0.9,
                description: `${desc} subsection in Section 17`,
            });
        });
    }
    // Add special case for section 21 handling
    if (sectionId === 21) {
        // Add special case rules for section 21's unique subsections
        [
            { sub: "a", pattern: "section21a", desc: "Mental health treatment" },
            { sub: "c", pattern: "section21c", desc: "Mental health disorders" },
            {
                sub: "d",
                pattern: "section21d",
                desc: "Mental health hospitalizations",
            },
            {
                sub: "e",
                pattern: "section21e",
                desc: "Mental health conditions not covered",
            },
        ].forEach(({ sub, pattern, desc }) => {
            if (!rules.some((r) => r.pattern === pattern)) {
                rules.push({
                    section: 21,
                    subsection: sub,
                    pattern: pattern,
                    confidence: 0.92,
                    description: `${desc} subsection in Section 21`,
                });
            }
        });
    }
    return rules;
}
/**
 * Update enhanced subsection rules using learned information from current categorization
 */
async function updateEnhancedSubsectionRules(engine, sectionFields) {
    console.time("updateEnhancedSubsectionRules");
    try {
        log("info", "Generating enhanced subsection rules from current categorization");
        // For each section that has subsections
        for (const [sectionStr, fields] of Object.entries(sectionFields)) {
            const sectionNumber = parseInt(sectionStr);
            if (isNaN(sectionNumber) || sectionNumber <= 0)
                continue;
            // Get unique subsections for this section
            const subsections = new Set();
            fields.forEach((field) => {
                if (field.subsection && field.subsection !== undefined) {
                    subsections.add(field.subsection);
                }
            });
            if (subsections.size > 0) {
                console.log(`Section ${sectionNumber} has ${subsections.size} subsections`);
                // Generate rules for each subsection
                for (const subsection of subsections) {
                    try {
                        // Skip fields with invalid subsection values (ensure it's a single character or identifier)
                        if (!subsection.match(/^[a-zA-Z0-9_]$/) &&
                            !subsection.match(/^[a-zA-Z0-9_]+$/)) {
                            console.warn(`Skipping invalid subsection: ${subsection} in section ${sectionNumber}`);
                            continue;
                        }
                        // Generate rules for this subsection
                        const rules = engine.generateEnhancedSubsectionRules(fields, sectionNumber, subsection);
                        // Add rules to the engine
                        if (rules.length > 0) {
                            engine.addRulesForSection(sectionNumber, rules);
                        }
                    }
                    catch (error) {
                        console.warn(`Error generating rules for section ${sectionNumber}, subsection ${subsection}: ${error}`);
                    }
                }
            }
        }
    }
    catch (error) {
        log("warn", `Error generating enhanced subsection rules: ${error}`);
    }
    console.timeEnd("updateEnhancedSubsectionRules");
}
/**
 * Update the rule engine with entry rules based on current field categorization
 */
async function updateEnhancedEntryRules(engine, sectionFields) {
    console.time("updateEnhancedEntryRules");
    log("info", "Generating enhanced entry rules from current categorization");
    try {
        // Use the already imported module rather than dynamically importing it
        // This avoids the require compatibility issue in ES modules
        const selfHealer = new SelfHealingManager(1); // Use a single iteration for rule generation
        // Generate entry rules using self-healing approach
        const ruleCandidates = selfHealer.generateEntryRulesForAllSections(sectionFields);
        if (Array.isArray(ruleCandidates) && ruleCandidates.length > 0) {
            log("info", `Found ${ruleCandidates.length} entry rule candidates`);
            // Convert MatchRules to CategoryRules before adding to engine
            for (const rule of ruleCandidates) {
                const categoryRule = {
                    section: rule.section || 0,
                    pattern: typeof rule.pattern === "string"
                        ? rule.pattern
                        : rule.pattern.toString(),
                    confidence: rule.confidence || 0.8,
                };
                if (rule.subsection) {
                    categoryRule.subsection = rule.subsection;
                }
                if (typeof rule.entry === "number") {
                    categoryRule.entryPattern = rule.entry.toString();
                }
                engine.addCategoryRule(categoryRule);
            }
            log("info", `Added ${ruleCandidates.length} enhanced entry rules`);
        }
        else {
            log("warn", "No entry rules were generated");
        }
    }
    catch (error) {
        log("warn", `Error generating enhanced entry rules: ${error}`);
    }
    console.timeEnd("updateEnhancedEntryRules");
}
/**
 * Generates entry detection rules from current categorization
 * @param sectionFields Fields grouped by section
 * @returns Array of rules for entry detection
 */
function generateEntryRules(sectionFields) {
    const entryRules = [];
    // Create an overall map of entry patterns by section
    const entryPatternsBySectionAndSubsection = {};
    // Process each section to find entry patterns
    for (const [sectionStr, fields] of Object.entries(sectionFields)) {
        const section = parseInt(sectionStr, 10);
        if (isNaN(section) || section === 0)
            continue;
        // Skip sections with too few fields (likely not enough data)
        if (fields.length < 5)
            continue;
        // Group fields by subsection
        const fieldsBySubsection = {};
        fields.forEach((field) => {
            const sub = field.subsection || "base";
            if (!fieldsBySubsection[sub]) {
                fieldsBySubsection[sub] = [];
            }
            fieldsBySubsection[sub].push(field);
        });
        // Process each subsection group
        for (const [subsection, subsectionFields] of Object.entries(fieldsBySubsection)) {
            // Find fields with entries
            const fieldsWithEntries = subsectionFields.filter((field) => field.entry && field.entry > 0);
            if (fieldsWithEntries.length >= 2) {
                // Get unique entry numbers
                const entryNumbers = Array.from(new Set(fieldsWithEntries
                    .map((field) => field.entry)
                    .filter(Boolean)));
                if (entryNumbers.length >= 2) {
                    // Try to find patterns in field names that correlate with entry numbers
                    const entryPatterns = findEntryPatterns(fieldsWithEntries);
                    if (entryPatterns.length > 0) {
                        // Store patterns for this section/subsection
                        if (!entryPatternsBySectionAndSubsection[section]) {
                            entryPatternsBySectionAndSubsection[section] = {};
                        }
                        if (!entryPatternsBySectionAndSubsection[section][subsection]) {
                            entryPatternsBySectionAndSubsection[section][subsection] = [];
                        }
                        entryPatternsBySectionAndSubsection[section][subsection].push(...entryPatterns);
                        // Create rules for each pattern
                        for (const pattern of entryPatterns) {
                            // Don't create rules for generic patterns that aren't section-specific
                            if (pattern.includes("entry") &&
                                !pattern.includes(`section${section}`)) {
                                continue;
                            }
                            const entryRule = {
                                pattern: new RegExp(pattern.replace("ENTRY", "(\\d+)"), "i"),
                                confidence: 0.85,
                                subsection: subsection === "base" ? "" : subsection,
                                description: `Entry pattern for section ${section}${subsection !== "base" ? `, subsection ${subsection}` : ""}`,
                                entryIndex: (m) => parseInt(m[1], 10),
                            };
                            entryRules.push(entryRule);
                        }
                    }
                }
            }
        }
    }
    return entryRules;
}
/**
 * Find patterns in field names that correlate with entry numbers
 * @param fields Fields with entry assignments
 * @returns Array of pattern strings
 */
function findEntryPatterns(fields) {
    const patterns = new Set();
    // Group fields by entry
    const fieldsByEntry = {};
    fields.forEach((field) => {
        if (!field.entry)
            return;
        if (!fieldsByEntry[field.entry]) {
            fieldsByEntry[field.entry] = [];
        }
        fieldsByEntry[field.entry].push(field);
    });
    // We need at least 2 entries with 2+ fields each to find meaningful patterns
    if (Object.keys(fieldsByEntry).length < 2)
        return Array.from(patterns);
    // Extract entry numbers sorted
    const entryNumbers = Object.keys(fieldsByEntry)
        .map((e) => parseInt(e, 10))
        .sort((a, b) => a - b);
    // Check for sequential entries (they're more reliable for pattern detection)
    const isSequential = entryNumbers.every((num, i) => {
        if (i === 0)
            return true;
        return num === entryNumbers[i - 1] + 1;
    });
    if (isSequential) {
        // Find similar field name patterns between entries
        for (let i = 0; i < entryNumbers.length - 1; i++) {
            const currentEntryNum = entryNumbers[i];
            const nextEntryNum = entryNumbers[i + 1];
            const currentFields = fieldsByEntry[currentEntryNum];
            const nextFields = fieldsByEntry[nextEntryNum];
            // Compare each field in current entry with each in the next
            for (const current of currentFields) {
                for (const next of nextFields) {
                    const pattern = extractEntryPattern(current.name, next.name, currentEntryNum, nextEntryNum);
                    if (pattern) {
                        patterns.add(pattern);
                    }
                }
            }
        }
    }
    // Also look for explicit patterns in field names
    for (const field of fields) {
        if (!field.entry)
            continue;
        // Check for common entry patterns in field names
        const entryPatterns = [
            { regex: new RegExp(`entry${field.entry}`, "i"), template: "entryENTRY" },
            {
                regex: new RegExp(`entry_${field.entry}`, "i"),
                template: "entry_ENTRY",
            },
            {
                regex: new RegExp(`entry-${field.entry}`, "i"),
                template: "entry-ENTRY",
            },
            {
                regex: new RegExp(`form\\[${field.entry}\\]`, "i"),
                template: "form[ENTRY]",
            },
            {
                regex: new RegExp(`section\\d+[._]${field.entry}`, "i"),
                template: field.name.replace(field.entry.toString(), "ENTRY"),
            },
        ];
        for (const { regex, template } of entryPatterns) {
            if (regex.test(field.name)) {
                patterns.add(template);
            }
        }
        // Also check for section-specific patterns
        if (field.section) {
            const sectionPatterns = [
                {
                    regex: new RegExp(`section${field.section}[._]${field.entry}`, "i"),
                    template: `section${field.section}.ENTRY`,
                },
                {
                    regex: new RegExp(`s${field.section}[._]${field.entry}`, "i"),
                    template: `s${field.section}.ENTRY`,
                },
            ];
            // Add subsection patterns if available
            if (field.subsection) {
                sectionPatterns.push({
                    regex: new RegExp(`section${field.section}${field.subsection}${field.entry}`, "i"),
                    template: `section${field.section}${field.subsection}ENTRY`,
                });
                sectionPatterns.push({
                    regex: new RegExp(`section${field.section}[._]${field.subsection}[._]${field.entry}`, "i"),
                    template: `section${field.section}.${field.subsection}.ENTRY`,
                });
            }
            for (const { regex, template } of sectionPatterns) {
                if (regex.test(field.name)) {
                    patterns.add(template);
                }
            }
        }
    }
    return Array.from(patterns);
}
/**
 * Extract a pattern from two field names that differ only by entry number
 * @param name1 First field name
 * @param name2 Second field name
 * @param entry1 First entry number
 * @param entry2 Second entry number
 * @returns Pattern string or null if no pattern found
 */
function extractEntryPattern(name1, name2, entry1, entry2) {
    // Replace the entry numbers with placeholders
    const entry1Str = entry1.toString();
    const entry2Str = entry2.toString();
    // Create normalized versions of both names
    const norm1 = name1.replace(new RegExp(entry1Str, "g"), "ENTRY");
    const norm2 = name2.replace(new RegExp(entry2Str, "g"), "ENTRY");
    // If they match after normalization, we found a pattern
    if (norm1 === norm2) {
        return norm1;
    }
    // Try a more flexible approach for fields that might have other differences
    // Find sequences that match exactly between the two strings
    const commonSeq = findLongestCommonSubsequence(name1, name2);
    // If the common sequence is substantial and contains the entry placeholder
    if (commonSeq &&
        commonSeq.length > name1.length * 0.7 &&
        commonSeq.length > name2.length * 0.7) {
        const entry1Pos = name1.indexOf(entry1Str);
        const entry2Pos = name2.indexOf(entry2Str);
        // If both names contain their entry numbers at similar positions
        if (entry1Pos >= 0 &&
            entry2Pos >= 0 &&
            Math.abs(entry1Pos - entry2Pos) <= 2) {
            // Create a pattern by replacing at the appropriate position
            const pattern = commonSeq.substring(0, entry1Pos) +
                "ENTRY" +
                commonSeq.substring(entry1Pos + entry1Str.length);
            return pattern;
        }
    }
    return null;
}
/**
 * Find the longest common subsequence between two strings
 * @param str1 First string
 * @param str2 Second string
 * @returns Longest common subsequence or null if none found
 */
function findLongestCommonSubsequence(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1)
        .fill(0)
        .map(() => Array(n + 1).fill(0));
    // Fill dp table
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            }
            else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    // If no common subsequence
    if (dp[m][n] === 0) {
        return null;
    }
    // Reconstruct the subsequence
    let result = "";
    let i = m, j = n;
    while (i > 0 && j > 0) {
        if (str1[i - 1] === str2[j - 1]) {
            result = str1[i - 1] + result;
            i--;
            j--;
        }
        else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;
        }
        else {
            j--;
        }
    }
    return result;
}
/**
 * Generate simple subsection rules (fallback method)
 * @param sectionFields Fields grouped by section
 * @returns Array of simple subsection rules
 */
function generateSimpleSubsectionRules(sectionFields) {
    const rules = [];
    // Process each section
    for (const [sectionStr, fields] of Object.entries(sectionFields)) {
        const section = parseInt(sectionStr, 10);
        if (isNaN(section) || section === 0 || section > 30)
            continue;
        // Skip section 1-8 (they don't have subsections)
        if (section <= 8)
            continue;
        // Find fields with subsections
        const fieldsWithSubsections = fields.filter((field) => field.subsection);
        if (fieldsWithSubsections.length > 0) {
            // Group by subsection
            const subsections = {};
            fieldsWithSubsections.forEach((field) => {
                if (!field.subsection)
                    return;
                if (!subsections[field.subsection]) {
                    subsections[field.subsection] = [];
                }
                subsections[field.subsection].push(field);
            });
            // Generate rules for each subsection
            for (const [subsection, subsectionFields] of Object.entries(subsections)) {
                if (subsectionFields.length < 2)
                    continue;
                // Create simple pattern based on section and subsection
                const rule = {
                    pattern: new RegExp(`section${section}[._]?${subsection}`, "i"),
                    confidence: 0.8,
                    subsection: subsection,
                    description: `Simple subsection rule for section ${section}, subsection ${subsection}`,
                };
                rules.push(rule);
            }
        }
    }
    return rules;
}
/**
 * Get a matching section ID for a rule based on pattern and confidence
 */
function getMatchingSectionId(rule, sectionFields) {
    if (rule.section && rule.section > 0) {
        return rule.section;
    }
    // Otherwise try to infer from the pattern with section prefix
    const patternStr = rule.pattern.toString();
    const sectionMatch = patternStr.match(/^Section\s+(\d+)/i);
    if (sectionMatch && sectionMatch[1]) {
        return parseInt(sectionMatch[1], 10);
    }
    // Default to the most confident section
    return 0;
}
/**
 * Convert a MatchRule to a CategoryRule with proper type consistency
 */
function convertMatchRuleToCategoryRule(rule, defaultSection = 0) {
    // Normalize the pattern to ensure it's a string
    const patternStr = typeof rule.pattern === "string"
        ? rule.pattern
        : rule.pattern.toString().replace(/^\/|\/[gimuy]*$/g, "");
    const categoryRule = {
        section: rule.section || defaultSection,
        confidence: rule.confidence || 0.8,
        pattern: patternStr,
    };
    if (rule.subsection) {
        categoryRule.subsection = rule.subsection;
    }
    if (typeof rule.entry === "number") {
        categoryRule.entryPattern = rule.entry.toString();
    }
    return categoryRule;
}
// Add this function to create unique identifiers for fields based on section, subsection, and entry
function createUniqueFieldIdentifier(field) {
    // Start with the section
    let identifier = `section_${field.section || 0}`;
    // Add subsection if present
    if (field.subsection) {
        identifier += `_sub_${field.subsection}`;
    }
    // Add entry if present
    if (typeof field.entry === "number") {
        identifier += `_entry_${field.entry}`;
    }
    // Add field name for uniqueness
    identifier += `_field_${field.name.replace(/[^a-zA-Z0-9]/g, "_")}`;
    return identifier;
}
/**
 * Enhance fields with spatial analysis information
 *
 * @param fields Fields to enhance
 * @param pdfDoc PDF document for page dimension calculations
 * @returns Enhanced fields with spatial information
 */
function enhanceFieldsWithSpatialAnalysis(fields, pdfDoc) {
    console.log("Enhancing fields with spatial analysis...");
    // First pass: extract basic spatial info for all fields
    const fieldsWithSpatial = fields.map((field) => {
        // Create a copy to avoid modifying the original
        const enhanced = { ...field };
        // Extract spatial info if coordinates are available
        if (field.rect) {
            enhanced.spatialInfo = extractSpatialInfo(field, pdfDoc);
        }
        // Add a unique identifier
        enhanced.uniqueId = createUniqueFieldIdentifier(field);
        return enhanced;
    });
    // Group fields by section for proximity analysis
    const sectionMap = {};
    fieldsWithSpatial.forEach((field) => {
        const section = field.section || 0;
        if (!sectionMap[section]) {
            sectionMap[section] = [];
        }
        sectionMap[section].push(field);
    });
    // Second pass: enhance with neighboring section information
    return fieldsWithSpatial.map((field) => {
        // Skip if already has high confidence
        if (field.confidence >= 0.9) {
            return field;
        }
        try {
            // Find spatial neighbors
            const neighbors = getSpatialNeighbors(field, fieldsWithSpatial, 150);
            if (neighbors.length > 0) {
                // Count section frequencies among neighbors
                const sectionCounts = {};
                neighbors.forEach((neighbor) => {
                    const section = neighbor.section || 0;
                    sectionCounts[section] = (sectionCounts[section] || 0) + 1;
                });
                // Store neighboring sections
                field.neighboringSections = Object.keys(sectionCounts)
                    .map(Number)
                    .filter((section) => section > 0)
                    .sort((a, b) => sectionCounts[b] - sectionCounts[a]);
                // Potentially adjust confidence based on spatial proximity
                const mostFrequentSection = field.neighboringSections[0];
                if (mostFrequentSection && mostFrequentSection !== field.section) {
                    const count = sectionCounts[mostFrequentSection];
                    const totalNeighbors = neighbors.length;
                    const frequencyRatio = count / totalNeighbors;
                    // If most frequent section is very dominant, consider updating
                    if (frequencyRatio > 0.7 && field.confidence < 0.8) {
                        const spatialBoost = calculateSpatialConfidenceBoost(field, mostFrequentSection, pdfDoc);
                        // Only update if significant improvement
                        if (spatialBoost > 0.1) {
                            field.section = mostFrequentSection;
                            field.confidence = Math.min(0.85, field.confidence + spatialBoost);
                            field.sectionAssignmentMethod = "spatial_proximity";
                        }
                    }
                }
            }
        }
        catch (error) {
            console.warn("Error during spatial analysis:", error);
        }
        return field;
    });
}
/**
 * Convert a Map<number, CategorizedField[]> to Record<string, CategorizedField[]>
 * This ensures we have a consistent type for sectionFields
 */
function convertMapToRecord(map) {
    // If it's already a Record, return it
    if (!(map instanceof Map)) {
        return map;
    }
    // Convert Map to Record
    const record = {};
    map.forEach((fields, section) => {
        record[section.toString()] = fields;
    });
    return record;
}
/**
 * Initialize the rule engine
 */
async function initializeRuleEngine() {
    // Create a new rule engine instance
    const engine = new RuleEngine();
    // Initialize default rule files if they don't exist
    engine.initializeDefaultRules();
    // Load rules from files
    await engine.loadRules();
    // Log rule loading status
    log("info", `Initialized rule engine with ${engine.getRules().length} rules`);
    return engine;
}
/**
 * Main function for the sectionizer
 */
async function main() {
    console.log("Starting sectionizer...");
    try {
        // Process command line arguments
        const args = parseCommandLineArgs();
        console.log("Command line arguments parsed:", JSON.stringify(args, null, 2));
        // Determine the input source (PDF or JSON)
        let inputPath = args.inputFields || args.pdfPath;
        if (!inputPath) {
            console.log("No input provided. Using fallback PDF path.");
            // Use fallback PDF path
            inputPath =
                "C:\\Users\\Jason\\Desktop\\AI-Coding\\clarance-f\\src\\sf862.pdf";
            console.log(`Using fallback PDF path: ${inputPath}`);
        }
        else {
            console.log(`Using input: ${inputPath}${args.force ? " (ignoring cache)" : ""}`);
        }
        // Extract fields from PDF or JSON
        console.log("Extracting fields from input...");
        const { fields, pdfDoc } = await extractFields(inputPath, args.force);
        console.log(`Extracted ${fields.length} fields${pdfDoc ? " and loaded PDF document" : ""}`);
        // Cache page dimensions if we have a PDF document
        const pageDimensions = getPageDimensions(pdfDoc);
        console.log(`Cached dimensions for ${Object.keys(pageDimensions).length} pages`);
        // Print section stats before processing
        console.log("\n--- BEFORE PROCESSING ---");
        // Initialize the rule engine even if we don't have a PDF document
        console.log("Initializing rule engine...");
        const ruleEngine = await initializeRuleEngine();
        // Basic check on rule engine status
        const ruleCount = ruleEngine.getRules().length;
        if (ruleCount === 0) {
            console.error("ERROR: No rules loaded. Cannot proceed with categorization.");
            process.exit(1);
        }
        if (!fields || fields.length === 0) {
            console.log("No fields found in the input. Please check the file.");
            process.exit(1);
        }
        console.log(`\n=== FIELD CATEGORIZATION PROCESS ===`);
        console.log(`Processing ${fields.length} fields from input`);
        // First, do initial categorization with the engine
        console.log("\n--- INITIAL CATEGORIZATION ---");
        // Run enhanced self-healing to improve categorization
        console.log("\n--- APPLYING ENHANCED SELF-HEALING ---");
        // Initialize all fields with section 0 if they don't have a section already
        const initializedFields = fields.map((field) => ({
            ...field,
            section: 0,
            confidence: 0.3, // Add a low initial confidence
        }));
        console.log(`Initialized ${initializedFields.length} fields with section 0 for self-healing`);
        // Group fields by section
        const sectionFieldsMap = {
            "0": initializedFields,
        };
        const consolidatedSelfHealingManager = new ConsolidatedSelfHealingManager(args.maxIterations || 150 // Use command line arg or default to 25 to ensure all fields get categorized
        );
        // Pass the initialized fields directly to enhanced self-healing
        const enhancedResult = await consolidatedSelfHealingManager.runSelfHealing(ruleEngine, sectionFieldsMap, expectedFieldCounts, args.outputDir);
        // // Pass the initialized fields directly to enhanced self-healing
        // const enhancedResult = await runEnhancedSelfHealing(
        //   ruleEngine,
        //   sectionFieldsMap,
        //   expectedFieldCounts,
        //   args.outputDir,
        //   0.1
        // );
        // Log the results of the self-healing process
        console.log(`Self-healing completed with success: ${enhancedResult.success}`);
        console.log(`Processed fields and analyzed sections`);
        // Debug output for enhancedResult
        console.log("*** ENHANCED RESULT DEBUG ***");
        console.log(`finalSectionFields keys: ${Object.keys(enhancedResult.finalSectionFields || {}).join(", ")}`);
        console.log(`Result has corrections: ${enhancedResult.corrections}`);
        console.log(`Result has iterations: ${enhancedResult.iterations}`);
        console.log(`Result has remainingUnknown: ${enhancedResult.remainingUnknown?.length || 0}`);
        console.log(`Result has deviations: ${enhancedResult.deviations?.length || 0}`);
        console.log(`Result has initialDeviation: ${enhancedResult.initialDeviation}`);
        console.log(`Result has finalDeviation: ${enhancedResult.finalDeviation}`);
        console.log("*** END DEBUG ***");
        console.log(`${(enhancedResult.finalSectionFields["0"] || [])
            .slice(0, 10)
            .map((field) => `${field.name} \n`)
            .join("") || 0} \n fields remain uncategorized (section 0)`);
        // console.log(enhancedResult.sectionFields);
        // Count fields in each section
        const sectionCounts = Object.entries(enhancedResult.finalSectionFields)
            .map(([section, fields]) => `Section ${section}: ${fields.length} fields`)
            .join("\n  ");
        console.log(`Field distribution:\n  ${sectionCounts}`);
        // Use the enhanced results
        const improvedCategorized = enhancedResult.finalSectionFields;
        // Print final statistics
        console.log("\n--- AFTER PROCESSING ---");
        // Count unique sections, subsections, and entries
        const allFields = Object.values(improvedCategorized).flat();
        // Print section statistics
        printSectionStatistics(allFields);
        // Create a set of unique section numbers
        const uniqueFinalSections = new Set();
        allFields.forEach((field) => {
            if (field.section && field.section > 0) {
                uniqueFinalSections.add(field.section);
            }
        });
        // Save a sample of uncategorized fields for analysis
        const uncategorizedFields = allFields.filter((f) => !f.section || f.section === 0);
        if (uncategorizedFields.length > 0) {
            const sampleSize = Math.min(20, uncategorizedFields.length);
            const uncategorizedSample = uncategorizedFields.slice(0, sampleSize);
            console.log(`\n=== SAMPLE OF UNCATEGORIZED FIELDS (${sampleSize}/${uncategorizedFields.length}) ===`);
            uncategorizedSample.forEach((field, index) => {
                console.log(`[${index + 1}] Name: ${field.name || "N/A"}`);
                console.log(`    Type: ${field.type || "N/A"}`);
                console.log(`    Value: ${typeof field.value === "string"
                    ? field.value.substring(0, 50) +
                        (field.value.length > 50 ? "..." : "")
                    : "N/A"}`);
                console.log(`    Page: ${field.page || "N/A"}`);
                console.log("");
            });
            // If output directory is provided, save sample to file
            if (args.outputDir) {
                const outputPath = path.resolve(args.outputDir);
                if (!fs.existsSync(outputPath)) {
                    fs.mkdirSync(outputPath, { recursive: true });
                }
                const uncategorizedPath = path.join(outputPath, "unknown-fields.json");
                fs.writeFileSync(uncategorizedPath, JSON.stringify(uncategorizedSample, null, 2));
                console.log(`Saved sample of uncategorized fields to ${uncategorizedPath}`);
            }
        }
        // Write categorized fields to output files
        if (args.outputDir) {
            const outputPath = path.resolve(args.outputDir);
            if (!fs.existsSync(outputPath)) {
                fs.mkdirSync(outputPath, { recursive: true });
            }
            // Write the categorized fields to a JSON file
            const categorizedOutputFile = path.join(outputPath, "categorized-fields.json");
            fs.writeFileSync(categorizedOutputFile, JSON.stringify(allFields, null, 2));
            console.log(`Wrote categorized fields to ${categorizedOutputFile}`);
            // Write the extracted fields to a JSON file
            const extractedFieldsOutput = path.join(outputPath, "pdf-extracted.json");
            fs.writeFileSync(extractedFieldsOutput, JSON.stringify(fields, null, 2));
            console.log(`Wrote extracted fields to ${extractedFieldsOutput}`);
            // Write section statistics to a JSON file
            const statsFile = path.join(outputPath, "section-statistics.json");
            const stats = {
                total: fields.length,
                uniqueSections: uniqueFinalSections.size,
                sectionPercentage: ((uniqueFinalSections.size / 30) * 100).toFixed(1),
                // Also keep track of field counts
                totalSectionFields: allFields.filter((f) => f.section && f.section > 0)
                    .length,
                totalSubsectionFields: allFields.filter((f) => f.subsection && f.section && f.section > 0).length,
                totalEntryFields: allFields.filter((f) => typeof f.entry === "number" && f.section && f.section > 0).length,
                bySectionCount: Object.fromEntries(Object.entries(improvedCategorized).map(([section, fields]) => [
                    section,
                    fields.length,
                ])),
            };
            fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
            console.log(`Wrote section statistics to ${statsFile}`);
        }
        // Log success
        log("success", "Categorization complete");
    }
    catch (error) {
        console.error("FATAL ERROR in sectionizer:", error);
        process.exit(1);
    }
}
// Run main function
main();
