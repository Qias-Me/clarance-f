/**
 * Validation Utilities
 *
 * Consolidated functions for data validation across the sectionizer project.
 * This replaces multiple implementations found throughout the codebase.
 */
import * as fs from 'fs';
import * as path from 'path';
/**
 * Known reference counts from SF-86 form
 */
export const DEFAULT_REFERENCE_COUNTS = {
    1: 15, 2: 20, 3: 10, 4: 25, 5: 140,
    6: 25, 7: 20, 8: 15, 9: 100, 10: 60,
    11: 40, 12: 40, 13: 80, 14: 40, 15: 40,
    16: 40, 17: 90, 18: 30, 19: 50, 20: 40,
    21: 50, 22: 50, 23: 50, 24: 20, 25: 40,
    26: 20, 27: 20, 28: 20, 29: 141, 30: 10
};
/**
 * Default critical sections that require stricter validation
 */
export const DEFAULT_CRITICAL_SECTIONS = [1, 2, 4, 5, 8, 13, 14, 15, 17, 21, 27];
/**
 * Validate section counts against reference data
 *
 * @param sectionFields Fields grouped by section
 * @param referenceCounts Reference counts for each section
 * @param options Validation options
 * @returns Detailed validation result
 */
export function validateSectionCounts(sectionFields, referenceCounts = DEFAULT_REFERENCE_COUNTS, options = {}) {
    const { maxDeviationPercent = 30, criticalSectionThreshold = maxDeviationPercent * 0.7, successThreshold = 0.9, criticalSections = DEFAULT_CRITICAL_SECTIONS, maxAcceptableUnknownFields = 20, outputReport = false, reportPath, verbose = false } = options;
    // Track validation metrics
    const deviations = [];
    let sectionsInRange = 0;
    let totalSections = 0;
    let totalExpected = 0;
    let totalActual = 0;
    let totalDeviation = 0;
    let criticalSectionsAligned = true;
    // Get section 0 count
    const unknownFieldCount = Array.isArray(sectionFields["0"]) ? sectionFields["0"].length : 0;
    // Check each section
    for (const [sectionKey, expectedCount] of Object.entries(referenceCounts)) {
        const section = parseInt(sectionKey, 10);
        if (isNaN(section) || section === 0 || expectedCount <= 0)
            continue;
        totalSections++;
        totalExpected += expectedCount;
        // Get actual count, supporting both string and number keys
        const strKey = section.toString();
        const numKey = section;
        const sectionArray = sectionFields[strKey] || sectionFields[numKey] || [];
        const actualCount = Array.isArray(sectionArray) ? sectionArray.length : 0;
        totalActual += actualCount;
        const deviation = actualCount - expectedCount;
        const absDev = Math.abs(deviation);
        totalDeviation += absDev;
        const deviationPercent = (expectedCount > 0) ? (absDev / expectedCount) * 100 : 100;
        const isCritical = criticalSections.includes(section);
        // Threshold depends on whether this is a critical section
        const threshold = isCritical ? criticalSectionThreshold : maxDeviationPercent;
        // Add to deviations if there's any difference
        if (deviation !== 0) {
            deviations.push({
                section,
                expected: expectedCount,
                actual: actualCount,
                deviation,
                percentage: deviationPercent,
                isCritical
            });
        }
        // Check if deviation is within acceptable range
        if (deviationPercent <= threshold) {
            sectionsInRange++;
        }
        else if (isCritical) {
            criticalSectionsAligned = false;
        }
    }
    // Calculate success metrics
    const alignmentPercentage = totalSections > 0 ? (sectionsInRange / totalSections) * 100 : 0;
    const isUnknownFieldsAcceptable = unknownFieldCount <= maxAcceptableUnknownFields;
    // Success if we hit the threshold percentage and unknown fields are acceptable
    const success = isUnknownFieldsAcceptable && // Check if unknown fields count is acceptable 
        totalSections > 0 && // Make sure we checked at least one section
        ((sectionsInRange / totalSections) >= successThreshold); // Check if we met the threshold
    // Sort deviations by percentage (highest first)
    const sortedDeviations = deviations.sort((a, b) => b.percentage - a.percentage);
    // Return detailed result
    const result = {
        success,
        alignmentPercentage,
        deviations: sortedDeviations,
        totalExpected,
        totalActual,
        totalDeviation,
        unknownFieldCount,
        criticalSectionsAligned
    };
    // Log results if verbose
    if (verbose) {
        console.log(`Section count validation result: ${success ? 'SUCCESS' : 'FAILURE'}`);
        console.log(`Alignment percentage: ${alignmentPercentage.toFixed(1)}%`);
        console.log(`Unknown fields: ${unknownFieldCount}`);
        if (sortedDeviations.length > 0) {
            console.log('Top deviations:');
            sortedDeviations.slice(0, 5).forEach(dev => {
                const sign = dev.deviation > 0 ? '+' : '';
                console.log(`  Section ${dev.section}${dev.isCritical ? ' (CRITICAL)' : ''}: ` +
                    `${dev.actual} vs ${dev.expected} expected (${sign}${dev.deviation}, ${dev.percentage.toFixed(1)}%)`);
            });
        }
    }
    // Write detailed report if requested
    if (outputReport && reportPath) {
        try {
            const reportDir = path.dirname(reportPath);
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }
            fs.writeFileSync(reportPath, JSON.stringify({
                date: new Date().toISOString(),
                result,
            }, null, 2), 'utf8');
            if (verbose) {
                console.log(`Validation report written to: ${reportPath}`);
            }
        }
        catch (error) {
            console.error(`Error writing validation report: ${error}`);
        }
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
export function identifyProblemSections(validationResult, maxProblems = 5) {
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
export function loadReferenceCounts(filePath) {
    if (!filePath) {
        return DEFAULT_REFERENCE_COUNTS;
    }
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const parsed = JSON.parse(data);
            // Convert string keys to numbers
            const result = {};
            for (const [key, value] of Object.entries(parsed)) {
                const numKey = parseInt(key, 10);
                if (!isNaN(numKey) && typeof value === 'number') {
                    result[numKey] = value;
                }
            }
            return result;
        }
    }
    catch (error) {
        console.error(`Error loading reference counts: ${error}`);
    }
    return DEFAULT_REFERENCE_COUNTS;
}
/**
 * Validate that a PDF file exists and is accessible
 *
 * @param pdfPath Path to the PDF file
 * @returns Promise that resolves to true if valid, or rejects with error
 */
export async function validatePdf(pdfPath) {
    try {
        const fileHandle = await fs.promises.open(pdfPath, 'r');
        await fileHandle.close();
        return true;
    }
    catch (error) {
        const errorMessage = `Invalid PDF file: ${pdfPath}. ${error}`;
        throw new Error(errorMessage);
    }
}
