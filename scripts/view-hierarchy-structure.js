import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the field-hierarchy.json file
const fieldHierarchyPath = path.join(__dirname, '..', 'reports', 'field-hierarchy.json');

async function viewHierarchyStructure() {
  try {
    console.log('Reading field-hierarchy.json...');
    const data = fs.readFileSync(fieldHierarchyPath, 'utf8');
    const hierarchy = JSON.parse(data);
    
    console.log(`\nFile size: ${(data.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Show the top-level keys (likely page numbers)
    console.log('\nTop-level keys:', Object.keys(hierarchy).slice(0, 10), '...');
    
    // Look at the structure of the first page
    const firstPageKey = Object.keys(hierarchy)[0];
    if (firstPageKey) {
      const firstPage = hierarchy[firstPageKey];
      console.log('\nStructure of the first page:');
      console.log(JSON.stringify(firstPage, null, 2).substring(0, 1000) + '...');
      
      // Check if 'fields' property exists and its structure
      if (firstPage.fields && Array.isArray(firstPage.fields)) {
        console.log(`\nFields array found with ${firstPage.fields.length} entries`);
        
        if (firstPage.fields.length > 0) {
          const sampleField = firstPage.fields[0];
          console.log('\nSample field structure:');
          console.log(JSON.stringify(sampleField, null, 2));
          
          // Check for specific properties we're interested in
          if (sampleField.id) {
            console.log(`\nField ID format: ${sampleField.id}`);
          }
          if (sampleField.section !== undefined) {
            console.log(`Field section: ${sampleField.section}`);
          }
          if (sampleField.sectionName) {
            console.log(`Field section name: ${sampleField.sectionName}`);
          }
        }
      } else {
        console.log('\nNo fields array found in the first page. Page structure:');
        console.log(Object.keys(firstPage));
      }
    }
  } catch (error) {
    console.error('Error viewing hierarchy structure:', error);
  }
}

viewHierarchyStructure(); 