/**
 * Subsection Coverage Analysis Tool
 * 
 * This script analyzes the field hierarchy and generates a comprehensive report
 * on subsection coverage across all 30 sections of the form.
 * 
 * Usage:
 *   ts-node scripts/analysis/subsectionCoverage.ts
 */

import path from 'path';
import fs from 'fs';
import { 
  buildSubsectionMapping, 
  generateCoverageReport,
  organizeSubsectionsBySection,
  type SubsectionMappingResult,
  validateSubsectionFields
} from '../../app/utils/subsectionMapper';
import { loadFieldHierarchy, type FieldHierarchy } from '../../app/utils/fieldHierarchyParser';
import { sectionMapping } from '../../app/utils/sectionMapping';

// Configuration
const OUTPUT_DIR = path.resolve(__dirname, '../../reports');
const REPORT_FILENAME = 'subsection-coverage-report.md';
const INTERFACE_DIR = path.resolve(__dirname, '../../api/interfaces/sections');
const JSON_REPORT_FILENAME = 'subsection-coverage.json';

/**
 * Main function to run the analysis
 */
async function main() {
  console.log('Starting subsection coverage analysis...');
  
  // Ensure the output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  try {
    // Load field hierarchy
    const fieldHierarchy = await loadFieldHierarchy() as FieldHierarchy;
    console.log('Field hierarchy loaded successfully');
    
    // Build subsection mapping
    console.log('Building subsection mapping...');
    const mappingResult = buildSubsectionMapping(fieldHierarchy);
    
    // Generate and save coverage report
    console.log('Generating coverage report...');
    const reportContent = generateCoverageReport(mappingResult);
    const reportPath = path.join(OUTPUT_DIR, REPORT_FILENAME);
    fs.writeFileSync(reportPath, reportContent);
    console.log(`Coverage report saved to: ${reportPath}`);
    
    // Save JSON report for programmatic use
    const jsonReportPath = path.join(OUTPUT_DIR, JSON_REPORT_FILENAME);
    fs.writeFileSync(jsonReportPath, JSON.stringify(mappingResult, null, 2));
    console.log(`JSON report saved to: ${jsonReportPath}`);
    
    // Validate context files for subsection fields
    console.log('\nValidating context files for subsection fields...');
    validateContextFiles(mappingResult);
    
    // Generate missing subsection interfaces if needed
    if (process.argv.includes('--generate-interfaces')) {
      console.log('\nGenerating missing subsection interfaces...');
      generateMissingInterfaces(mappingResult);
    }
    
    printSummary(mappingResult);
    
  } catch (error) {
    console.error('Error running subsection coverage analysis:', error);
    process.exit(1);
  }
}

/**
 * Validates that context files include required subsection fields
 * 
 * @param mappingResult The subsection mapping result
 */
function validateContextFiles(mappingResult: SubsectionMappingResult) {
  const sectionMap = organizeSubsectionsBySection(mappingResult.subsections);
  const validationResults: Record<number, { 
    isValid: boolean; 
    missingSubsections: string[];
    presentSubsections: string[];
  }> = {};
  
  for (const [sectionIdStr, sectionData] of Object.entries(sectionMap)) {
    const sectionId = parseInt(sectionIdStr, 10);
    
    if (sectionData.subsections.length === 0) continue;
    
    // Attempt to load context file
    const sectionInfo = sectionMapping[sectionId];
    if (!sectionInfo) continue;
    
    const contextPath = path.resolve(__dirname, `../../app/state/contexts/sections/${sectionInfo.contextFile}.tsx`);
    
    if (!fs.existsSync(contextPath)) {
      console.warn(`Context file not found for section ${sectionId}: ${contextPath}`);
      continue;
    }
    
    // Extract subsection IDs
    const subsectionIds = sectionData.subsections.map(s => s.subsectionNumber);
    
    // Read context file content
    const contextContent = fs.readFileSync(contextPath, 'utf-8');
    
    // Simple validation to check if subsection fields are present
    // This is a basic check - a more thorough validation would parse the TypeScript code
    const validationResult = {
      isValid: true,
      missingSubsections: [] as string[],
      presentSubsections: [] as string[]
    };
    
    for (const subsectionId of subsectionIds) {
      const formattedId = subsectionId.replace('.', '_');
      const propertyPattern = new RegExp(`section${formattedId}\\s*:`);
      
      if (propertyPattern.test(contextContent)) {
        validationResult.presentSubsections.push(subsectionId);
      } else {
        validationResult.missingSubsections.push(subsectionId);
        validationResult.isValid = false;
      }
    }
    
    validationResults[sectionId] = validationResult;
    
    // Log results
    if (!validationResult.isValid) {
      console.warn(`Section ${sectionId} (${sectionInfo.name}) is missing subsection fields:`);
      validationResult.missingSubsections.forEach(id => {
        console.warn(` - Missing: section${id.replace('.', '_')}`);
      });
    } else {
      console.log(`✅ Section ${sectionId} (${sectionInfo.name}) has all required subsection fields`);
    }
  }
  
  // Write validation results to file
  const validationReportPath = path.join(OUTPUT_DIR, 'subsection-validation-report.json');
  fs.writeFileSync(validationReportPath, JSON.stringify(validationResults, null, 2));
  console.log(`Validation report saved to: ${validationReportPath}`);
}

/**
 * Generates missing interface files for subsections
 * 
 * @param mappingResult The subsection mapping result
 */
function generateMissingInterfaces(mappingResult: SubsectionMappingResult) {
  const sectionMap = organizeSubsectionsBySection(mappingResult.subsections);
  
  for (const [sectionIdStr, sectionData] of Object.entries(sectionMap)) {
    const sectionId = parseInt(sectionIdStr, 10);
    
    if (sectionData.subsections.length === 0) continue;
    
    const sectionInfo = sectionMapping[sectionId];
    if (!sectionInfo) continue;
    
    // Check if interface file exists
    const interfacePath = path.join(INTERFACE_DIR, `${sectionInfo.contextFile}.ts`);
    
    if (!fs.existsSync(interfacePath)) {
      console.warn(`Interface file not found for section ${sectionId}: ${interfacePath}`);
      continue;
    }
    
    // Read existing interface file
    const interfaceContent = fs.readFileSync(interfacePath, 'utf-8');
    
    // Check if subsection interfaces are missing
    const missingSubsections = [];
    
    for (const subsection of sectionData.subsections) {
      const formattedId = subsection.subsectionNumber.replace('.', '_');
      const interfacePattern = new RegExp(`interface\\s+Section${formattedId}Details`);
      
      if (!interfacePattern.test(interfaceContent)) {
        missingSubsections.push(subsection);
      }
    }
    
    if (missingSubsections.length > 0) {
      console.log(`Found ${missingSubsections.length} missing subsection interfaces for section ${sectionId} (${sectionInfo.name})`);
      
      // Generate interface code for missing subsections
      let appendCode = '\n// Auto-generated subsection interfaces\n';
      
      for (const subsection of missingSubsections) {
        const formattedId = subsection.subsectionNumber.replace('.', '_');
        
        appendCode += `\ninterface Section${formattedId}Details {\n`;
        appendCode += `  _id: number;\n`;
        appendCode += `  // Add fields specific to this subsection\n`;
        appendCode += `}\n`;
      }
      
      // Find the export block and capture the exports
      const exportMatch = interfaceContent.match(/export\s+type\s+\{([^}]+)\}/s);
      
      if (exportMatch) {
        // Add the new interface names to the export block
        const exportBlock = exportMatch[1];
        const updatedExports = exportBlock + ',\n  ' + missingSubsections
          .map(s => `Section${s.subsectionNumber.replace('.', '_')}Details`)
          .join(',\n  ');
        
        // Replace the old export block with the updated one
        const updatedContent = interfaceContent.replace(
          /export\s+type\s+\{([^}]+)\}/s,
          `export type {\n  ${updatedExports}\n}`
        );
        
        // Write the updated content back to the file
        const backupPath = `${interfacePath}.bak`;
        fs.writeFileSync(backupPath, interfaceContent);
        console.log(`Backed up original interface file to: ${backupPath}`);
        
        fs.writeFileSync(interfacePath, updatedContent);
        console.log(`Updated interface file: ${interfacePath}`);
      } else {
        // If we can't find the export block, add the interfaces to a new file
        const newPath = `${interfacePath}.generated.ts`;
        fs.writeFileSync(newPath, appendCode);
        console.log(`Created new interface file: ${newPath}`);
      }
    } else {
      console.log(`✅ All subsection interfaces exist for section ${sectionId} (${sectionInfo.name})`);
    }
  }
}

/**
 * Prints a summary of the analysis results
 * 
 * @param mappingResult The subsection mapping result
 */
function printSummary(mappingResult: SubsectionMappingResult) {
  console.log('\n📊 Subsection Coverage Summary:');
  console.log('------------------------------');
  console.log(`Total Subsections: ${mappingResult.totalSubsections}`);
  console.log(`Mapped Subsections: ${mappingResult.mappedCount}`);
  console.log(`Unmapped Subsections: ${mappingResult.unmappedCount}`);
  console.log(`Coverage Percentage: ${mappingResult.coveragePercentage.toFixed(2)}%`);
  
  if (mappingResult.coveragePercentage < 100) {
    console.log('\n⚠️  Some subsections are not properly mapped!');
    console.log('   See the generated report for details.');
  } else {
    console.log('\n✅ All subsections are properly mapped!');
  }
  
  console.log('\nReports generated:');
  console.log(` - ${path.join(OUTPUT_DIR, REPORT_FILENAME)}`);
  console.log(` - ${path.join(OUTPUT_DIR, JSON_REPORT_FILENAME)}`);
  console.log(` - ${path.join(OUTPUT_DIR, 'subsection-validation-report.json')}`);
}

// Run the main function
main(); 