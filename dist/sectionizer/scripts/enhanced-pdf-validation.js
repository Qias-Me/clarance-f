import * as path from 'path';
import * as fs from 'fs';
/**
 * Save section summary to multiple directories
 * @param summary Section summary data
 */
function saveSectionSummaryToAllDirectories(summary) {
    // Define directories to save to
    const directories = [
        path.resolve(process.cwd(), 'src', 'section-data')
    ];
    // Ensure all directories exist
    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            console.log(`Creating directory: ${dir}`);
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    // Save summary to all directories
    directories.forEach(dir => {
        const summaryPath = path.join(dir, 'section-summary.json');
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
        console.log(`Saved section summary to ${summaryPath}`);
        // Also save in backward-compatible format
        const backwardCompatSummary = {
            sections: {}
        };
        // Convert summary to backward-compatible format
        if (Array.isArray(summary)) {
            summary.forEach(section => {
                if (section.sectionId !== undefined && section.fieldCount !== undefined) {
                    backwardCompatSummary.sections[section.sectionId] = {
                        fieldCount: section.fieldCount
                    };
                }
            });
        }
        const backwardCompatPath = path.join(dir, 'sections-summary.json');
        fs.writeFileSync(backwardCompatPath, JSON.stringify(backwardCompatSummary, null, 2));
        console.log(`Saved backward-compatible section summary to ${backwardCompatPath}`);
    });
}
// Then replace any existing section summary saving code with a call to this function
// For example, find code like:
//   fs.writeFileSync(path.join(outputDir, 'section-summary.json'), JSON.stringify(sectionSummary, null, 2));
// And replace with:
//   saveSectionSummaryToAllDirectories(sectionSummary);
/**
 * Save unidentified fields to multiple directories
 * @param unidentifiedFields Unidentified fields data
 */
function saveUnidentifiedFieldsToAllDirectories(unidentifiedFields) {
    const directories = [
        path.resolve(process.cwd(), 'src', 'section-data')
    ];
    // Ensure all directories exist
    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    // Save to all directories
    directories.forEach(dir => {
        const filePath = path.join(dir, 'unidentified-fields.json');
        fs.writeFileSync(filePath, JSON.stringify(unidentifiedFields, null, 2));
        console.log(`Saved unidentified fields to ${filePath}`);
    });
}
// Export the functions so they can be imported elsewhere
export { saveSectionSummaryToAllDirectories, saveUnidentifiedFieldsToAllDirectories };
