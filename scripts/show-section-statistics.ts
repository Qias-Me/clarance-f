/**
 * Display Section Statistics
 * 
 * This script loads categorized fields and displays section statistics
 * to validate the results of the categorization process.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the necessary types and functions
import { 
  CategorizedField, 
  loadReferenceCounts 
} from '../src/sectionizer/utils/extractFieldsBySection.js';

/**
 * Print statistics about field categorization by section
 * @param fields Categorized fields
 */
function printSectionStatistics(fields: CategorizedField[]): void {
  // Count fields per section
  const sectionCounts: Record<number, number> = {};
  fields.forEach(field => {
    sectionCounts[field.section] = (sectionCounts[field.section] || 0) + 1;
  });
  
  // Get reference counts for comparison
  const referenceCounts = loadReferenceCounts();
  
  // Log the statistics
  console.log('\nSection Statistics:');
  console.log('==================');
  console.log('Section | Count | Expected | Difference');
  console.log('--------|-------|----------|------------');
  
  // Sort sections by number
  const sortedSections = Object.keys(sectionCounts)
    .map(Number)
    .sort((a, b) => a - b);
  
  for (const section of sortedSections) {
    const count = sectionCounts[section];
    const expected = referenceCounts[section];
    
    // Format expected and difference values, handling non-numeric cases
    let expectedStr = 'N/A';
    let differenceStr = 'N/A';
    
    if (typeof expected === 'number') {
      expectedStr = expected.toString();
      differenceStr = (count - expected).toString();
    }
    
    // Color-code output based on match
    let statusSymbol = '  ';
    if (typeof expected === 'number') {
      if (count === expected) {
        statusSymbol = '✓ '; // Exact match
      } else if (count > expected) {
        statusSymbol = '+ '; // Too many fields
      } else {
        statusSymbol = '- '; // Too few fields
      }
    }
    
    console.log(`${section.toString().padStart(7)} | ${count.toString().padStart(5)} | ${expectedStr.padStart(8)} | ${statusSymbol}${differenceStr.padStart(10)}`);
  }
  
  // Log overall stats
  const totalFields = fields.length;
  const categorizedFields = fields.filter(field => field.section > 0).length;
  const categorizedPercentage = (categorizedFields / totalFields * 100).toFixed(2);
  
  console.log('\nOverall:');
  console.log(`Total fields: ${totalFields}`);
  console.log(`Categorized fields: ${categorizedFields} (${categorizedPercentage}%)`);
  console.log(`Uncategorized fields: ${totalFields - categorizedFields} (${(100 - parseFloat(categorizedPercentage)).toFixed(2)}%)`);
}

async function main() {
  try {
    console.log('Loading categorized fields...');
    
    // Try to find the latest categorized fields file
    // Check multiple possible locations, prioritizing "healed" files
    const possiblePaths = [
      path.resolve(__dirname, '../finaloutputsections/healed-fields.json'),
      path.resolve(__dirname, '../finaloutputsections/sectionized-fields.json'),
      path.resolve(__dirname, '../section-data/healed-fields.json'),
      path.resolve(__dirname, '../section-data/sectionized-fields.json')
    ];
    
    let fieldsData: Record<string, CategorizedField[]> | null = null;
    let loadedPath = '';
    
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        console.log(`Loading from: ${filePath}`);
        const rawData = fs.readFileSync(filePath, 'utf-8');
        fieldsData = JSON.parse(rawData);
        loadedPath = filePath;
        break;
      }
    }
    
    if (!fieldsData) {
      console.error('No categorized fields files found. Please run the sectionizer first.');
      process.exit(1);
    }
    
    console.log(`Successfully loaded categorized fields from ${loadedPath}`);
    
    // Convert the section-based record to a flat array of fields
    const allFields: CategorizedField[] = [];
    for (const [section, fields] of Object.entries(fieldsData)) {
      if (Array.isArray(fields)) {
        allFields.push(...fields);
      }
    }
    
    console.log(`Total fields loaded: ${allFields.length}`);
    
    // Print the section statistics
    printSectionStatistics(allFields);
    
  } catch (error) {
    console.error('Error displaying section statistics:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error); 