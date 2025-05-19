/**
 * Copy Section Summary Files
 * 
 * This utility copies section summary files between reports/ and section-data/ directories 
 * to ensure reference counts are available in both locations.
 * 
 * Usage: node scripts/copy-section-summary.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cwd = process.cwd();

// Define directories
const directories = [
  path.resolve(cwd, 'src', 'section-data'),
  path.resolve(cwd, 'reports')
];

// Summary file names to look for
const summaryFileNames = [
  'section-summary.json',
  'sections-summary.json',
  'unidentified-fields.json'
];

// Ensure directories exist
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Find all summary files
const foundFiles = [];
directories.forEach(dir => {
  summaryFileNames.forEach(fileName => {
    const filePath = path.join(dir, fileName);
    if (fs.existsSync(filePath)) {
      foundFiles.push({
        path: filePath,
        dir,
        name: fileName,
        content: fs.readFileSync(filePath, 'utf-8')
      });
    }
  });
});

console.log(`Found ${foundFiles.length} summary files.`);

// Copy files to all directories
if (foundFiles.length > 0) {
  let copyCount = 0;
  
  foundFiles.forEach(file => {
    directories.forEach(targetDir => {
      // Skip if this is the source directory
      if (targetDir === file.dir) return;
      
      const targetPath = path.join(targetDir, file.name);
      
      // Copy file
      try {
        fs.writeFileSync(targetPath, file.content);
        console.log(`Copied ${file.name} from ${file.dir} to ${targetPath}`);
        copyCount++;
      } catch (error) {
        console.error(`Error copying to ${targetPath}: ${error.message}`);
      }
    });
  });
  
  console.log(`Copied ${copyCount} files between directories.`);
} else {
  console.log('No summary files found to copy.');
}

// Check for section*-fields.json files in reports dir and copy them to section-data
const reportsDir = path.resolve(cwd, 'reports');
if (fs.existsSync(reportsDir)) {
  const sectionDataDir = path.resolve(cwd,  'src', 'section-data');
  const targetSectionDataDir = path.resolve(cwd, 'src', 'section-data');
  
  try {
    const files = fs.readdirSync(reportsDir);
    let sectionFilesCount = 0;
    
    files.forEach(file => {
      if (file.match(/section\d+-fields\.json$/)) {
        // Found a section-fields file, copy to both section-data directories
        const sourcePath = path.join(reportsDir, file);
        const targetPath1 = path.join(sectionDataDir, file);
        const targetPath2 = path.join(targetSectionDataDir, file);
        
        try {
          const content = fs.readFileSync(sourcePath, 'utf-8');
          
          // Copy to first target
          fs.writeFileSync(targetPath1, content);
          
          // Copy to second target
          fs.writeFileSync(targetPath2, content);
          
          sectionFilesCount++;
          console.log(`Copied section file ${file} to section-data directories`);
        } catch (error) {
          console.error(`Error copying section file ${file}: ${error.message}`);
        }
      }
    });
    
    if (sectionFilesCount > 0) {
      console.log(`Copied ${sectionFilesCount} section-fields files to section-data directories.`);
    } else {
      console.log('No section-fields files found in reports directory.');
    }
  } catch (error) {
    console.error(`Error reading reports directory: ${error.message}`);
  }
}

console.log('Section summary file synchronization complete.'); 