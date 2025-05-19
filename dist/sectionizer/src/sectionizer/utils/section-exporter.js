/**
 * Exports finalized field sections to directory
 * This utility exports categorized fields to a specified directory
 */
import fs from 'fs/promises';
import path from 'path';
/**
 * Exports categorized fields to the specified directory
 * @param sectionFields Categorized fields by section
 * @param outputDir Output directory path
 * @returns Promise resolving when all sections are exported
 */
export async function exportFinalSections(sectionFields, outputDir) {
    console.log(`Exporting finalized section data to ${outputDir}...`);
    try {
        // Create output directory if it doesn't exist
        await fs.mkdir(outputDir, { recursive: true });
        const exportedFiles = [];
        // Export each section to a separate file
        for (const [section, fields] of Object.entries(sectionFields)) {
            if (fields.length === 0)
                continue;
            const sectionNumber = section.padStart(2, '0'); // Pad single digit sections
            const outputPath = path.join(outputDir, `section${sectionNumber}.json`);
            // Prepare export data with metadata
            const exportData = {
                section: parseInt(section),
                sectionName: `Section ${section}`,
                count: fields.length,
                lastUpdated: new Date().toISOString(),
                fields: fields.map(field => ({
                    id: field.id,
                    name: field.name,
                    page: field.page,
                    value: field.value,
                    type: field.type,
                    label: field.label,
                    confidence: field.confidence || 1.0
                }))
            };
            // Write to file
            await fs.writeFile(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
            console.log(`Exported ${fields.length} fields for section ${section} to ${outputPath}`);
            exportedFiles.push(outputPath);
        }
        // Create a summary file
        const summaryPath = path.join(outputDir, 'sections-summary.json');
        const summary = Object.entries(sectionFields).map(([section, fields]) => ({
            section: parseInt(section),
            count: fields.length
        })).sort((a, b) => a.section - b.section);
        await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
        console.log(`Exported sections summary to ${summaryPath}`);
        exportedFiles.push(summaryPath);
        console.log(`Successfully exported ${exportedFiles.length} files to ${outputDir}`);
        return exportedFiles;
    }
    catch (error) {
        console.error(`Error exporting section data:`, error);
        throw error;
    }
}
/**
 * Copy finalized rule files to a target directory
 * @param sourceDir Source rules directory
 * @param targetDir Target directory for finalized rules
 * @returns Promise resolving to array of copied rule files
 */
export async function copyFinalizedRules(sourceDir = path.join(process.cwd(), 'src', 'sectionizer', 'rules'), targetDir = path.join(process.cwd(), 'src', 'rules')) {
    console.log(`Copying finalized rules from ${sourceDir} to ${targetDir}...`);
    try {
        // Create target directory if it doesn't exist
        await fs.mkdir(targetDir, { recursive: true });
        // Read all files in the source directory
        const files = await fs.readdir(sourceDir);
        // Filter for rule files (.ts or .json)
        const ruleFiles = files.filter(file => file.match(/section\d+\.rules\.(ts|json)$/));
        if (ruleFiles.length === 0) {
            console.warn(`No rule files found in ${sourceDir}`);
            return [];
        }
        const copiedFiles = [];
        // Copy each rule file to the target directory
        for (const file of ruleFiles) {
            const sourcePath = path.join(sourceDir, file);
            const targetPath = path.join(targetDir, file);
            await fs.copyFile(sourcePath, targetPath);
            console.log(`Copied ${sourcePath} to ${targetPath}`);
            copiedFiles.push(targetPath);
        }
        console.log(`Successfully copied ${copiedFiles.length} rule files to ${targetDir}`);
        return copiedFiles;
    }
    catch (error) {
        console.error(`Error copying rule files:`, error);
        throw error;
    }
}
/**
 * Export all finalized data - both sections and rules
 * @param sectionFields Categorized fields by section
 * @param sectionsOutputDir Directory for sections output
 * @param rulesOutputDir Directory for rules output
 * @returns Promise resolving when all exports are complete
 */
export async function exportAllFinalizedData(sectionFields, sectionsOutputDir = 'src/finaloutputsections', rulesOutputDir = 'src/rules') {
    // Export sections first
    const exportedSections = await exportFinalSections(sectionFields, sectionsOutputDir);
    // Then copy rules
    const exportedRules = await copyFinalizedRules(path.join(process.cwd(), 'src', 'sectionizer', 'rules'), rulesOutputDir);
    return {
        sections: exportedSections,
        rules: exportedRules
    };
}
