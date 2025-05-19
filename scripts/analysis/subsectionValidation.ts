/**
 * Subsection Validation Script
 * 
 * This script analyzes the field hierarchy and form context to validate
 * subsection mapping across the application. It identifies orphaned
 * subsections, unmapped subsections, and generates comprehensive reports.
 */
import fs from 'fs';
import path from 'path';
import { createSubsectionValidator } from '../../app/utils/validation/SubsectionValidator';
import type { FieldHierarchy } from '../../api/interfaces/FieldMetadata';

// Configuration
const CONFIG = {
  // Input file paths
  fieldHierarchyPath: path.resolve(__dirname, '../../public/field-hierarchy.json'),
  // Where to save the validation reports
  outputDir: path.resolve(__dirname, '../../reports/subsection-validation'),
  // Formats to generate
  formats: ['json', 'markdown', 'text'] as const,
};

/**
 * Load the field hierarchy data from JSON
 */
function loadFieldHierarchy(): FieldHierarchy | null {
  try {
    const fileContent = fs.readFileSync(CONFIG.fieldHierarchyPath, 'utf8');
    return JSON.parse(fileContent) as FieldHierarchy;
  } catch (error) {
    console.error(`Error loading field hierarchy from ${CONFIG.fieldHierarchyPath}:`, error);
    return null;
  }
}

/**
 * Create the output directory if it doesn't exist
 */
function ensureOutputDir(): void {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
}

/**
 * Generate a validation report and save it in different formats
 */
function generateValidationReport(): void {
  console.log('Generating subsection validation report...');
  
  // Load field hierarchy
  const fieldHierarchy = loadFieldHierarchy();
  if (!fieldHierarchy) {
    console.error('No field hierarchy data available. Aborting validation.');
    process.exit(1);
  }
  
  // Create validator
  const validator = createSubsectionValidator(fieldHierarchy, null);
  
  // Generate validation report
  const report = validator.validateAllSubsections();
  
  // Generate formatted reports
  ensureOutputDir();
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Save as JSON
  if (CONFIG.formats.includes('json')) {
    const jsonPath = path.join(CONFIG.outputDir, `validation-report-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`JSON report saved to: ${jsonPath}`);
  }
  
  // Save as Markdown
  if (CONFIG.formats.includes('markdown')) {
    const markdown = validator.generateMarkdownReport();
    const mdPath = path.join(CONFIG.outputDir, `validation-report-${timestamp}.md`);
    fs.writeFileSync(mdPath, markdown);
    console.log(`Markdown report saved to: ${mdPath}`);
  }
  
  // Save as plain text (issues and suggestions)
  if (CONFIG.formats.includes('text')) {
    const issues = validator.getIssuesSummary();
    const suggestions = validator.getSuggestions();
    
    const textContent = [
      '# Subsection Validation Issues and Suggestions',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '## Issues',
      ...issues,
      '',
      '## Suggestions',
      ...suggestions,
    ].join('\n');
    
    const txtPath = path.join(CONFIG.outputDir, `validation-report-${timestamp}.txt`);
    fs.writeFileSync(txtPath, textContent);
    console.log(`Text report saved to: ${txtPath}`);
  }
  
  // Print summary to console
  console.log('\nValidation Summary:');
  console.log(`Total Subsections: ${report.totalSubsections}`);
  console.log(`Mapped: ${report.mappedSubsections} (${Math.round(report.mappedSubsections / report.totalSubsections * 100)}%)`);
  console.log(`Unmapped: ${report.unmappedSubsections} (${Math.round(report.unmappedSubsections / report.totalSubsections * 100)}%)`);
  console.log(`Orphaned: ${report.orphanedSubsections} (${Math.round(report.orphanedSubsections / report.totalSubsections * 100)}%)`);
  console.log(`Issues: ${report.issues.length} (${report.issues.filter(i => i.level === 'error').length} errors, ${report.issues.filter(i => i.level === 'warning').length} warnings)`);
  
  // Check for errors and exit with appropriate code
  const hasErrors = report.issues.some(issue => issue.level === 'error');
  if (hasErrors) {
    console.error('\nValidation detected errors. See reports for details.');
    process.exit(1);
  } else if (report.issues.length > 0) {
    console.warn('\nValidation detected warnings. See reports for details.');
    process.exit(0);
  } else {
    console.log('\nValidation completed successfully with no issues!');
    process.exit(0);
  }
}

// Run validation when script is executed directly
if (require.main === module) {
  generateValidationReport();
}

// Export functions for use in other scripts
export { generateValidationReport, loadFieldHierarchy }; 