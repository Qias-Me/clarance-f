/**
 * SF-86 Sectionizer Report Generator
 *
 * This file provides comprehensive reporting capabilities for the sectionizer results,
 * including section breakdowns, confidence metrics, and pattern analysis.
 */
import { confidenceCalculator } from './confidence-calculator.js';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import logger from './logging.js';
/**
 * Generates reports for the sectionizer results
 */
export class ReportGenerator {
    // Implementation that handles both overloads
    async generateReport(input, pathOrFields, referencesOrIterations) {
        // Handle case where called with just a directory path
        if (typeof input === 'string') {
            logger.info(`Generating report for directory: ${input}`);
            // Assume input is the directory path
            const outputDir = input;
            const sectionDataPath = path.join(outputDir, 'section-data.json');
            let sectionData = {};
            try {
                if (fs.existsSync(sectionDataPath)) {
                    const rawData = fs.readFileSync(sectionDataPath, 'utf8');
                    sectionData = JSON.parse(rawData);
                }
                else {
                    logger.warn(`No section-data.json found in ${outputDir}, using empty data`);
                }
                // Generate report using the structure from section-data.json
                const reportPath = path.join(outputDir, 'report.md');
                return this.generateSimpleReport(sectionData.sections || {}, reportPath);
            }
            catch (error) {
                logger.error(`Error loading section data: ${error}`);
                throw error;
            }
        }
        // Determine which overload was called for the other cases
        if (typeof pathOrFields === 'string') {
            // New format: (sectionFields, reportFilePath, referenceCounts?)
            return this.generateSimpleReport(input, pathOrFields, referencesOrIterations);
        }
        else {
            // Original format: (sectionOutputs, unknownFields, iterations, referenceCounts?)
            return this.generateLegacyReport(input, pathOrFields || [], referencesOrIterations || 0, arguments[3]);
        }
    }
    /**
     * Original implementation for comprehensive report generation
     */
    async generateLegacyReport(sectionOutputs, unknownFields = [], iterations = 0, referenceCounts) {
        // Safety check for empty or undefined inputs
        if (!sectionOutputs || Object.keys(sectionOutputs).length === 0) {
            logger.warn("No section outputs provided for report generation, using empty data");
            sectionOutputs = {};
        }
        if (!unknownFields) {
            unknownFields = [];
        }
        const reportPath = path.join(process.cwd(), 'reports', 'sectionizer-report.md');
        // Ensure reports directory exists
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        // Build report content
        let report = `# SF-86 Sectionizer Report\n\n`;
        report += `Generated at: ${new Date().toISOString()}\n\n`;
        // Summary section
        report += `## Summary\n\n`;
        // Calculate total fields with safety checks
        const sectionTotals = Object.values(sectionOutputs).map(section => section && section.meta ? (section.meta.totalFields || 0) : 0);
        const totalFields = sectionTotals.reduce((sum, count) => sum + count, 0) + unknownFields.length;
        // Calculate matched fields with safety checks
        const matchedTotals = Object.values(sectionOutputs).map(section => section && section.meta ? (section.meta.matchedFields || 0) : 0);
        const totalMatched = matchedTotals.reduce((sum, count) => sum + count, 0);
        // Calculate confidence manually with safety checks
        let overallConfidence = 0;
        let totalConfidenceWeight = 0;
        for (const section of Object.values(sectionOutputs)) {
            if (section && section.meta) {
                const weight = section.meta.totalFields || 0;
                const confidence = section.meta.confidence || 0;
                overallConfidence += confidence * weight;
                totalConfidenceWeight += weight;
            }
        }
        overallConfidence = totalConfidenceWeight > 0 ? overallConfidence / totalConfidenceWeight : 0;
        // Add summary information
        report += `- **Total fields processed**: ${totalFields}\n`;
        report += `- **Fields categorized**: ${totalMatched} (${totalFields > 0 ? ((totalMatched / totalFields) * 100).toFixed(2) : 0}%)\n`;
        report += `- **Fields uncategorized**: ${unknownFields.length} (${totalFields > 0 ? ((unknownFields.length / totalFields) * 100).toFixed(2) : 0}%)\n`;
        report += `- **Overall confidence**: ${(overallConfidence * 100).toFixed(2)}%\n`;
        report += `- **Iterations performed**: ${iterations}\n\n`;
        // Section breakdown
        report += `## Section Breakdown\n\n`;
        report += `| Section | Fields | Expected | Deviation | Sub-Sections | Confidence |\n`;
        report += `|---------|--------|----------|-----------|--------------|------------|\n`;
        // Sort sections numerically
        const sectionNumbers = Object.keys(sectionOutputs)
            .map(Number)
            .sort((a, b) => a - b);
        for (const sectionNum of sectionNumbers) {
            const section = String(sectionNum);
            const output = sectionOutputs[section];
            if (!output)
                continue;
            const sectionName = output.meta.name || `Section ${section}`;
            const fieldCount = output.meta.totalFields;
            // Add reference count info if available
            let expectedCount = '';
            let deviation = '';
            if (referenceCounts && referenceCounts[sectionNum]) {
                const refCount = referenceCounts[sectionNum];
                const diff = fieldCount - refCount;
                expectedCount = String(refCount);
                deviation = diff === 0 ? '✓' : (diff > 0 ? `+${diff}` : String(diff));
            }
            const subSections = Object.keys(output.fields)
                .filter(s => s !== '_default')
                .join(', ') || 'None';
            report += `| ${sectionName} | ${fieldCount} | ${expectedCount} | ${deviation} | ${subSections} | ${(output.meta.confidence * 100).toFixed(2)}% |\n`;
        }
        // Sub-section breakdown for sections with sub-sections
        report += `\n## Sub-Section Breakdown\n\n`;
        let hasSectionsWithSubsections = false;
        for (const sectionNum of sectionNumbers) {
            const section = String(sectionNum);
            const output = sectionOutputs[section];
            if (!output || !output.meta.hasSubSections)
                continue;
            hasSectionsWithSubsections = true;
            report += `### Section ${section}: ${output.meta.name}\n\n`;
            report += `| Sub-Section | Fields | Percentage |\n`;
            report += `|-------------|--------|------------|\n`;
            const totalSectionFields = output.meta.totalFields;
            // Sort subsections by count (descending)
            const sortedSubsections = Object.entries(output.fields)
                .sort(([, a], [, b]) => b.length - a.length);
            for (const [subSection, fields] of sortedSubsections) {
                const percentage = totalSectionFields > 0 ?
                    (fields.length / totalSectionFields) * 100 : 0;
                report += `| ${subSection === '_default' ? 'Default' : subSection} | ${fields.length} | ${percentage.toFixed(2)}% |\n`;
            }
            report += `\n`;
        }
        if (!hasSectionsWithSubsections) {
            report += `*No sections with subsections found.*\n\n`;
        }
        // Field distribution visual chart
        report += this.generateDistributionChart(sectionOutputs);
        // Deviation analysis (if reference counts are available)
        if (referenceCounts && Object.keys(referenceCounts).length > 0) {
            report += `## Section Count Deviations\n\n`;
            // Calculate deviations
            const deviations = sectionNumbers.map(num => {
                const expected = referenceCounts[num] || 0;
                const actual = sectionOutputs[String(num)]?.meta.totalFields || 0;
                return {
                    section: num,
                    actual,
                    expected,
                    deviation: actual - expected
                };
            })
                .filter(d => d.expected > 0 && Math.abs(d.deviation) > 0)
                .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
            if (deviations.length > 0) {
                report += `| Section | Actual | Expected | Deviation | Percentage |\n`;
                report += `|---------|--------|----------|-----------|------------|\n`;
                for (const dev of deviations) {
                    const percentage = dev.expected > 0 ?
                        ((Math.abs(dev.deviation) / dev.expected) * 100).toFixed(2) : '0.00';
                    report += `| Section ${dev.section} | ${dev.actual} | ${dev.expected} | ${dev.deviation > 0 ? '+' : ''}${dev.deviation} | ${percentage}% |\n`;
                }
            }
            else {
                report += `*No significant deviations found.*\n\n`;
            }
        }
        // Unknowns analysis
        if (unknownFields.length > 0) {
            report += `## Unknown Fields Analysis\n\n`;
            // Group unknown fields by pattern
            const patterns = this.analyzeUnknownPatterns(unknownFields);
            report += `### Common Patterns in Unknown Fields\n\n`;
            report += `| Pattern | Count | Examples |\n`;
            report += `|---------|-------|----------|\n`;
            // Sort patterns by frequency (descending)
            const sortedPatterns = Object.entries(patterns)
                .sort(([, a], [, b]) => b.length - a.length);
            for (const [pattern, fields] of sortedPatterns) {
                const examples = fields.slice(0, 3)
                    .map(f => `\`${f.name}\``)
                    .join(', ');
                report += `| ${pattern} | ${fields.length} | ${examples} |\n`;
            }
            // Group unknown fields by page
            report += `\n### Distribution by Page\n\n`;
            const pageGroups = this.groupFieldsByPage(unknownFields);
            report += `| Page | Count | Example Fields |\n`;
            report += `|------|-------|---------------|\n`;
            // Sort by page number (ascending)
            const sortedPages = Object.entries(pageGroups)
                .sort(([a,], [b,]) => parseInt(a) - parseInt(b));
            for (const [page, fields] of sortedPages) {
                const examples = fields.slice(0, 2)
                    .map(f => `\`${f.name}\``)
                    .join(', ');
                report += `| ${page} | ${fields.length} | ${examples} |\n`;
            }
        }
        // Write the report to file
        fs.writeFileSync(reportPath, report);
        logger.success(`Report generated at ${reportPath}`);
        return reportPath;
    }
    /**
     * New simplified implementation for direct categorized fields
     */
    async generateSimpleReport(sectionFields, reportFilePath, referenceCounts) {
        // Ensure reports directory exists
        fs.mkdirSync(path.dirname(reportFilePath), { recursive: true });
        // Build report content
        let report = `# SF-86 Sectionizer Report\n\n`;
        report += `Generated at: ${new Date().toISOString()}\n\n`;
        // Extract unknowns
        const unknownFields = sectionFields['0'] || [];
        // Calculate total fields
        const totalFields = Object.values(sectionFields).reduce((sum, fields) => sum + fields.length, 0);
        const totalMatched = totalFields - unknownFields.length;
        // Calculate average confidence
        let totalConfidence = 0;
        let fieldsWithConfidence = 0;
        // Gather confidence data
        for (const [section, fields] of Object.entries(sectionFields)) {
            if (section === '0')
                continue; // Skip unknown fields
            for (const field of fields) {
                if (typeof field.confidence === 'number') {
                    totalConfidence += field.confidence;
                    fieldsWithConfidence++;
                }
            }
        }
        const avgConfidence = fieldsWithConfidence > 0 ?
            totalConfidence / fieldsWithConfidence : 0;
        // Summary section
        report += `## Summary\n\n`;
        report += `- **Total fields processed**: ${totalFields}\n`;
        report += `- **Fields categorized**: ${totalMatched} (${((totalMatched / totalFields) * 100).toFixed(2)}%)\n`;
        report += `- **Fields uncategorized**: ${unknownFields.length} (${((unknownFields.length / totalFields) * 100).toFixed(2)}%)\n`;
        report += `- **Average confidence**: ${(avgConfidence * 100).toFixed(2)}%\n\n`;
        // Section breakdown
        report += `## Section Breakdown\n\n`;
        report += `| Section | Fields | Expected | Deviation | Confidence |\n`;
        report += `|---------|--------|----------|-----------|------------|\n`;
        // Sort sections numerically
        const sectionNumbers = Object.keys(sectionFields)
            .filter(key => key !== '0')
            .map(Number)
            .sort((a, b) => a - b);
        for (const sectionNum of sectionNumbers) {
            const section = String(sectionNum);
            const fields = sectionFields[section];
            if (!fields || fields.length === 0)
                continue;
            const sectionName = `Section ${section}`;
            const fieldCount = fields.length;
            // Calculate section confidence
            const sectionConfidence = fields.reduce((sum, field) => sum + (field.confidence || 0), 0) / fieldCount;
            // Add reference count info if available
            let expectedCount = '';
            let deviation = '';
            if (referenceCounts && referenceCounts[sectionNum]) {
                const refCount = referenceCounts[sectionNum];
                const diff = fieldCount - refCount;
                expectedCount = String(refCount);
                deviation = diff === 0 ? '✓' : (diff > 0 ? `+${diff}` : String(diff));
            }
            report += `| ${sectionName} | ${fieldCount} | ${expectedCount} | ${deviation} | ${(sectionConfidence * 100).toFixed(2)}% |\n`;
        }
        // Field distribution visual chart
        report += this.generateDistributionChart(sectionFields);
        // Deviation analysis (if reference counts are available)
        if (referenceCounts && Object.keys(referenceCounts).length > 0) {
            report += `## Section Count Deviations\n\n`;
            // Calculate deviations
            const deviations = sectionNumbers.map(num => {
                const expected = referenceCounts[num] || 0;
                const actual = sectionFields[String(num)]?.length || 0;
                return {
                    section: num,
                    actual,
                    expected,
                    deviation: actual - expected
                };
            })
                .filter(d => d.expected > 0 && Math.abs(d.deviation) > 0)
                .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
            if (deviations.length > 0) {
                report += `| Section | Actual | Expected | Deviation | Percentage |\n`;
                report += `|---------|--------|----------|-----------|------------|\n`;
                for (const dev of deviations) {
                    const percentage = dev.expected > 0 ?
                        ((Math.abs(dev.deviation) / dev.expected) * 100).toFixed(2) : '0.00';
                    report += `| Section ${dev.section} | ${dev.actual} | ${dev.expected} | ${dev.deviation > 0 ? '+' : ''}${dev.deviation} | ${percentage}% |\n`;
                }
            }
            else {
                report += `*No significant deviations found.*\n\n`;
            }
        }
        // Unknowns analysis
        if (unknownFields.length > 0) {
            report += `## Unknown Fields Analysis\n\n`;
            // Group unknown fields by pattern
            const patterns = this.analyzeUnknownPatterns(unknownFields);
            report += `### Common Patterns in Unknown Fields\n\n`;
            report += `| Pattern | Count | Examples |\n`;
            report += `|---------|-------|----------|\n`;
            // Sort patterns by frequency (descending)
            const sortedPatterns = Object.entries(patterns)
                .sort(([, a], [, b]) => b.length - a.length);
            for (const [pattern, fields] of sortedPatterns) {
                const examples = fields.slice(0, 3)
                    .map(f => `\`${f.name}\``)
                    .join(', ');
                report += `| ${pattern} | ${fields.length} | ${examples} |\n`;
            }
            // Group unknown fields by page
            report += `\n### Distribution by Page\n\n`;
            const pageGroups = this.groupFieldsByPage(unknownFields);
            report += `| Page | Count | Example Fields |\n`;
            report += `|------|-------|---------------|\n`;
            // Sort by page number (ascending)
            const sortedPages = Object.entries(pageGroups)
                .sort(([a,], [b,]) => parseInt(a) - parseInt(b));
            for (const [page, fields] of sortedPages) {
                const examples = fields.slice(0, 2)
                    .map(f => `\`${f.name}\``)
                    .join(', ');
                report += `| ${page} | ${fields.length} | ${examples} |\n`;
            }
        }
        // Write the report to disk
        fs.writeFileSync(reportFilePath, report);
        console.log(chalk.green(`Report generated at ${reportFilePath}`));
        return reportFilePath;
    }
    /**
     * Generates a visual ASCII chart of section distribution for the report
     *
     * @param sectionFields Map of sections to fields
     * @returns ASCII chart for section and subsection distribution
     */
    generateDistributionChart(sectionFields) {
        let chart = `## Field Distribution \n\n`;
        // Prepare section counts
        const sectionCounts = {};
        Object.entries(sectionFields).forEach(([sectionStr, fields]) => {
            const section = parseInt(sectionStr, 10);
            if (!isNaN(section)) {
                // Handle both CategorizedField[] and SectionOutput
                const count = Array.isArray(fields) ? fields.length : fields.meta?.totalFields || 0;
                sectionCounts[section] = count;
            }
        });
        // Sort sections
        const sortedSections = Object.keys(sectionCounts)
            .map(Number)
            .filter(section => section > 0) // Skip section 0 (unknown)
            .sort((a, b) => a - b);
        // Find the maximum for scaling
        const maxCount = Math.max(...sortedSections.map(s => sectionCounts[s]));
        // Generate chart
        chart += `\`\`\`\n`;
        // Create a simple ASCII chart
        const maxChars = 50; // Maximum chart width
        const scale = maxCount > 0 ? maxChars / maxCount : 0;
        for (const section of sortedSections) {
            if (section === 0)
                continue; // Skip unknown section
            const count = sectionCounts[section];
            const barLength = Math.round(count * scale);
            const bar = '█'.repeat(barLength);
            chart += `Section ${String(section).padStart(2, ' ')}: ${bar} ${count}\n`;
        }
        chart += `\`\`\`\n\n`;
        // Add subsection distribution for sections with subsections
        chart += `## Subsection Distribution\n\n`;
        // Track if we have any subsections to display
        let hasSubsections = false;
        for (const section of sortedSections) {
            // Group fields by subsection
            const subsectionCounts = {};
            if (Array.isArray(sectionFields[section.toString()])) {
                // Handle CategorizedField[]
                sectionFields[section.toString()]
                    .filter(field => field.subsection)
                    .forEach(field => {
                    const sub = field.subsection || 'unknown';
                    subsectionCounts[sub] = (subsectionCounts[sub] || 0) + 1;
                });
            }
            else if (sectionFields[section.toString()] && 'fields' in sectionFields[section.toString()]) {
                // Handle SectionOutput
                const sectionOutput = sectionFields[section.toString()];
                Object.entries(sectionOutput.fields).forEach(([subSection, fields]) => {
                    subsectionCounts[subSection] = fields.length;
                });
            }
            // Skip if no subsections
            if (Object.keys(subsectionCounts).length === 0)
                continue;
            hasSubsections = true;
            chart += `### Section ${section}\n\n`;
            chart += `\`\`\`\n`;
            // Find the maximum for scaling
            const maxSubCount = Math.max(...Object.values(subsectionCounts));
            const subScale = maxSubCount > 0 ? 30 / maxSubCount : 0;
            // Sort by subsection
            const sortedSubs = Object.keys(subsectionCounts).sort();
            for (const sub of sortedSubs) {
                const count = subsectionCounts[sub];
                const barLength = Math.round(count * subScale);
                const bar = '▓'.repeat(barLength);
                chart += `Subsection ${sub.padEnd(6)}: ${bar} ${count}\n`;
            }
            chart += `\`\`\`\n\n`;
        }
        if (!hasSubsections) {
            chart += `*No sections with subsections found.*\n\n`;
        }
        // Add entry distribution
        chart += `## Entry Distribution\n\n`;
        // Track if we have any entries to display
        let hasEntries = false;
        // Collect entry counts by section
        for (const section of sortedSections) {
            // Group fields by entry
            const entryCounts = {};
            if (Array.isArray(sectionFields[section.toString()])) {
                // Handle CategorizedField[]
                sectionFields[section.toString()]
                    .filter(field => typeof field.entry === 'number' && field.entry > 0)
                    .forEach(field => {
                    const entry = field.entry;
                    entryCounts[entry] = (entryCounts[entry] || 0) + 1;
                });
            }
            // We don't handle entries for SectionOutput here as they're stored differently
            // Skip if no entries
            if (Object.keys(entryCounts).length === 0)
                continue;
            hasEntries = true;
            chart += `### Section ${section}\n\n`;
            chart += `\`\`\`\n`;
            // Find the maximum for scaling
            const maxEntryCount = Math.max(...Object.values(entryCounts));
            const entryScale = maxEntryCount > 0 ? 25 / maxEntryCount : 0;
            // Sort by entry number
            const sortedEntries = Object.keys(entryCounts).map(Number).sort((a, b) => a - b);
            for (const entry of sortedEntries) {
                const count = entryCounts[entry];
                const barLength = Math.round(count * entryScale);
                const bar = '▒'.repeat(barLength);
                chart += `Entry ${String(entry).padEnd(3)}: ${bar} ${count}\n`;
            }
            chart += `\`\`\`\n\n`;
        }
        if (!hasEntries) {
            chart += `*No sections with entries found.*\n\n`;
        }
        return chart;
    }
    /**
     * Analyze unknown fields to find common patterns
     * @param fields Array of uncategorized fields
     * @returns Object mapping patterns to arrays of matching fields
     */
    analyzeUnknownPatterns(fields) {
        if (!fields || fields.length === 0) {
            return {};
        }
        const patterns = {};
        // Common patterns to look for in field names
        const patternRegexes = {
            'form1\\[0\\]\\..*': /form1\[0\]\..*?(?=\[|\.|$)/,
            'section\\d+': /section\d+/i,
            '#area\\[\\d+\\]': /#area\[\d+\]/i,
            '#field\\[\\d+\\]': /#field\[\d+\]/i,
            'TextField\\d+': /TextField\d+/i,
            'RadioButtonList\\[\\d+\\]': /RadioButtonList\[\d+\]/i,
            'DropDownList\\d+': /DropDownList\d+/i,
            'CheckBox\\d+': /CheckBox\d+/i,
        };
        // Process each field
        for (const field of fields) {
            let patternFound = false;
            // Try to match against known patterns
            for (const [patternName, regex] of Object.entries(patternRegexes)) {
                if (regex.test(field.name)) {
                    if (!patterns[patternName]) {
                        patterns[patternName] = [];
                    }
                    patterns[patternName].push(field);
                    patternFound = true;
                    break;
                }
            }
            // If no pattern matches, use the first segment of the field name
            if (!patternFound) {
                const segments = field.name.split(/[\[\]\.\s]/);
                const firstSegment = segments[0] || 'other';
                const pattern = `${firstSegment}.*`;
                if (!patterns[pattern]) {
                    patterns[pattern] = [];
                }
                patterns[pattern].push(field);
            }
        }
        return patterns;
    }
    /**
     * Group fields by their page number
     * @param fields Array of fields to group
     * @returns Object mapping page numbers to arrays of fields
     */
    groupFieldsByPage(fields) {
        const result = {};
        for (const field of fields) {
            const page = field.page ? field.page.toString() : 'unknown';
            if (!result[page]) {
                result[page] = [];
            }
            result[page].push(field);
        }
        return result;
    }
    /**
     * Generates a healing performance report
     * @param healingResult Result of the healing process
     * @param initialUnknownCount Initial count of unknown fields
     * @param correctionsApplied Number of corrections applied
     * @returns Markdown report content
     */
    generateHealingReport(healingResult, initialUnknownCount, correctionsApplied) {
        // Build report content
        let report = `# SF-86 Self-Healing Performance Report\n\n`;
        report += `Generated at: ${new Date().toISOString()}\n\n`;
        // Summary section
        report += `## Summary\n\n`;
        const unknownReduction = initialUnknownCount - healingResult.remainingUnknown.length;
        const reductionPercentage = initialUnknownCount > 0 ?
            (unknownReduction / initialUnknownCount) * 100 : 0;
        report += `- **Healing successful**: ${healingResult.success ? '✅ Yes' : '❌ No'}\n`;
        report += `- **Iterations performed**: ${healingResult.iterations}\n`;
        report += `- **Initial unknown fields**: ${initialUnknownCount}\n`;
        report += `- **Remaining unknown fields**: ${healingResult.remainingUnknown.length}\n`;
        report += `- **Unknown reduction**: ${unknownReduction} (${reductionPercentage.toFixed(2)}%)\n`;
        report += `- **Rules generated**: ${healingResult.generatedRules}\n`;
        if (typeof correctionsApplied === 'number') {
            report += `- **Corrections applied**: ${correctionsApplied}\n`;
        }
        report += `\n`;
        // Deviations section
        if (healingResult.deviations && healingResult.deviations.length > 0) {
            report += `## Section Count Deviations After Healing\n\n`;
            // Sort by deviation magnitude (descending)
            const sortedDeviations = [...healingResult.deviations]
                .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
            report += `| Section | Actual | Expected | Deviation | Percentage |\n`;
            report += `|---------|--------|----------|-----------|------------|\n`;
            for (const dev of sortedDeviations) {
                const percentage = dev.expected > 0 ?
                    ((Math.abs(dev.deviation) / dev.expected) * 100).toFixed(2) : '0.00';
                const deviationStr = dev.deviation === 0 ? '✓' :
                    (dev.deviation > 0 ? `+${dev.deviation}` : `${dev.deviation}`);
                report += `| Section ${dev.section} | ${dev.actual} | ${dev.expected} | ${deviationStr} | ${percentage}% |\n`;
            }
            report += `\n`;
        }
        // Remaining fields analysis
        if (healingResult.remainingUnknown.length > 0) {
            report += `## Remaining Unknown Fields\n\n`;
            // Group by pattern
            const patterns = this.analyzeUnknownPatterns(healingResult.remainingUnknown);
            report += `### Common Patterns\n\n`;
            report += `| Pattern | Count | Examples |\n`;
            report += `|---------|-------|----------|\n`;
            // Sort patterns by frequency (descending)
            const sortedPatterns = Object.entries(patterns)
                .sort(([, a], [, b]) => b.length - a.length);
            for (const [pattern, fields] of sortedPatterns) {
                const examples = fields.slice(0, 2)
                    .map(f => `\`${f.name}\``)
                    .join(', ');
                report += `| ${pattern} | ${fields.length} | ${examples} |\n`;
            }
            // Group by page
            report += `\n### Distribution by Page\n\n`;
            const pageGroups = this.groupFieldsByPage(healingResult.remainingUnknown);
            report += `| Page | Count | Example Fields |\n`;
            report += `|------|-------|---------------|\n`;
            // Sort by page number (ascending)
            const sortedPages = Object.entries(pageGroups)
                .sort(([a,], [b,]) => parseInt(a) - parseInt(b));
            for (const [page, fields] of sortedPages) {
                const examples = fields.slice(0, 2)
                    .map(f => `\`${f.name}\``)
                    .join(', ');
                report += `| ${page} | ${fields.length} | ${examples} |\n`;
            }
        }
        return report;
    }
}
