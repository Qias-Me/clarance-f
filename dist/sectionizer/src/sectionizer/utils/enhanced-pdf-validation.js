/**
 * SF-86 Sectionizer - Enhanced PDF Validation
 *
 * This utility provides field enrichment and validation functionality
 * to enhance PDF field data with page and label heuristics.
 */
import * as bridge from './bridgeAdapter.js';
/**
 * Enhances field metadata with validation and heuristics
 */
export class EnhancedPdfValidator {
    /**
     * Enriches a batch of fields with validation and heuristics
     * @param fields Array of field metadata to enrich
     * @returns Array of enhanced fields
     */
    enrichFields(fields) {
        return fields.map(field => this.enrichField(field));
    }
    /**
     * Enriches a single field with validation and heuristics
     * @param field Field metadata to enrich
     * @returns Enhanced field
     */
    enrichField(field) {
        // Start with basic field data
        const enhanced = {
            ...field,
            confidence: 0 // Initialize confidence
        };
        try {
            // Apply bridge heuristics - since the bridge doesn't have an explicit
            // enrichFieldWithLabelHeuristics method, we'll use the available methods
            // Try to get section information from the bridge
            const sectionInfo = bridge.extractSectionInfo(field.name);
            if (sectionInfo) {
                enhanced.section = sectionInfo.section;
                enhanced.subSection = sectionInfo.subsection;
                enhanced.entryIndex = sectionInfo.entry;
                enhanced.confidence = sectionInfo.confidence || 0.7;
            }
            // If no section info found from the name, try page-based lookup
            if (!enhanced.section && field.page > 0) {
                const pageSection = bridge.pageRangeLookup(field.page);
                if (pageSection) {
                    enhanced.section = pageSection;
                    enhanced.confidence = 0.6; // Lower confidence for page-based lookup
                }
            }
            // Try fallback categorization if still no section
            if (!enhanced.section) {
                const fallbackResult = bridge.fallbackCategorization(field);
                if (fallbackResult) {
                    enhanced.section = fallbackResult.section;
                    enhanced.subSection = fallbackResult.subsection;
                    enhanced.entryIndex = fallbackResult.entry;
                    enhanced.confidence = fallbackResult.confidence;
                }
            }
            // If field has a label, extract potential section/subsection hints
            if (field.label) {
                const sectionMatch = field.label.match(/section\s*(\d+)([a-z])?/i);
                if (sectionMatch) {
                    // Only use label-based section if confidence is currently low or missing
                    if (!enhanced.section || (enhanced.confidence !== undefined && enhanced.confidence < 0.5)) {
                        enhanced.section = parseInt(sectionMatch[1]);
                        if (sectionMatch[2]) {
                            enhanced.subSection = sectionMatch[2].toUpperCase();
                        }
                        enhanced.confidence = 0.75; // Higher confidence for explicit section label
                    }
                }
            }
        }
        catch (error) {
            console.warn(`Error enriching field ${field.name}:`, error);
        }
        return enhanced;
    }
    /**
     * Validates a batch of fields for consistency
     * @param fields Array of fields to validate
     * @returns Validation report
     */
    validateFields(fields) {
        const ids = new Set();
        const duplicateIds = [];
        const missingPages = [];
        const missingLabels = [];
        for (const field of fields) {
            // Check for duplicate IDs
            if (ids.has(field.id)) {
                duplicateIds.push(field.id);
            }
            else {
                ids.add(field.id);
            }
            // Check for missing page numbers
            if (!field.page || field.page < 1) {
                missingPages.push(field.id);
            }
            // Check for missing labels on important fields
            if (!field.label && field.type !== 'PDFCheckBox' && field.type !== 'PDFSignatureField') {
                missingLabels.push(field.id);
            }
        }
        // Generate validation report
        const valid = duplicateIds.length === 0 && missingPages.length === 0;
        const report = `Validation Report:\n` +
            `- Total fields: ${fields.length}\n` +
            `- Duplicate IDs: ${duplicateIds.length}\n` +
            `- Missing page numbers: ${missingPages.length}\n` +
            `- Missing labels: ${missingLabels.length}\n` +
            `- Valid: ${valid ? 'Yes' : 'No'}`;
        return {
            valid,
            duplicateIds,
            missingPages,
            missingLabels,
            report
        };
    }
    /**
     * Generates a detailed quality report for the field data
     * @param fields Array of enhanced fields
     * @returns Detailed quality report
     */
    generateQualityReport(fields) {
        const totalFields = fields.length;
        const sectionCoverage = {};
        const confidenceDistribution = {
            'high (0.8-1.0)': 0,
            'medium (0.5-0.8)': 0,
            'low (0-0.5)': 0,
            'unknown': 0
        };
        // Calculate section coverage and confidence distribution
        for (const field of fields) {
            const sectionKey = field.section ? String(field.section) : 'unknown';
            // Update section coverage
            if (!sectionCoverage[sectionKey]) {
                sectionCoverage[sectionKey] = { count: 0, percentage: 0, confidence: 0 };
            }
            sectionCoverage[sectionKey].count++;
            sectionCoverage[sectionKey].confidence += (field.confidence || 0);
            // Update confidence distribution
            const confidence = field.confidence || 0;
            if (confidence >= 0.8) {
                confidenceDistribution['high (0.8-1.0)']++;
            }
            else if (confidence >= 0.5) {
                confidenceDistribution['medium (0.5-0.8)']++;
            }
            else if (confidence > 0) {
                confidenceDistribution['low (0-0.5)']++;
            }
            else {
                confidenceDistribution['unknown']++;
            }
        }
        // Calculate percentages and average confidence
        for (const section of Object.keys(sectionCoverage)) {
            sectionCoverage[section].percentage = (sectionCoverage[section].count / totalFields) * 100;
            sectionCoverage[section].confidence = sectionCoverage[section].count > 0
                ? sectionCoverage[section].confidence / sectionCoverage[section].count
                : 0;
        }
        // Generate quality report
        const reportLines = [
            'Field Quality Report:',
            `- Total fields: ${totalFields}`,
            '- Section Coverage:',
            ...Object.entries(sectionCoverage)
                .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
                .map(([section, data]) => `  - Section ${section}: ${data.count} fields (${data.percentage.toFixed(2)}%), avg. confidence: ${data.confidence.toFixed(2)}`),
            '- Confidence Distribution:',
            ...Object.entries(confidenceDistribution)
                .map(([level, count]) => `  - ${level}: ${count} fields (${((count / totalFields) * 100).toFixed(2)}%)`)
        ];
        return {
            totalFields,
            sectionCoverage,
            confidenceDistribution,
            report: reportLines.join('\n')
        };
    }
}
// Export a singleton instance
export const validator = new EnhancedPdfValidator();
