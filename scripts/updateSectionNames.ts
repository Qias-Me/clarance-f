import fs from 'fs';
import path from 'path';
import { getSectionName } from '../app/utils/sectionMapping';

/**
 * Updates existing section-X-fields.json files to use the proper section names
 * from the centralized sectionMapping utility.
 */
async function updateSectionNames() {
  console.log('Updating section names in section field files...');
  
  const analysisDir = path.join(process.cwd(), 'scripts', 'analysis');
  
  if (!fs.existsSync(analysisDir)) {
    console.error(`Error: Analysis directory not found at ${analysisDir}`);
    return;
  }

  try {
    // Find all section field files
    const files = fs.readdirSync(analysisDir);
    const sectionFiles = files.filter(file => 
      file.startsWith('section') && file.endsWith('-fields.json')
    );
    
    console.log(`Found ${sectionFiles.length} section field files to update`);
    
    // Process each section file
    for (const file of sectionFiles) {
      const filePath = path.join(analysisDir, file);
      
      // Extract section number from filename
      const match = file.match(/section(\d+)-fields\.json/);
      if (!match) {
        console.log(`Skipping ${file} - couldn't extract section number`);
        continue;
      }
      
      const sectionId = parseInt(match[1], 10);
      const properSectionName = getSectionName(sectionId) || `Section ${sectionId}`;
      
      // Read file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      let fields;
      
      try {
        fields = JSON.parse(fileContent);
      } catch (err) {
        console.error(`Error parsing ${file}: ${err.message}`);
        continue;
      }
      
      if (!Array.isArray(fields)) {
        console.log(`Skipping ${file} - content is not an array`);
        continue;
      }
      
      // Update section names
      const updatedFields = fields.map(field => ({
        ...field,
        sectionName: properSectionName
      }));
      
      // Write updated content back
      fs.writeFileSync(filePath, JSON.stringify(updatedFields, null, 2));
      console.log(`Updated section name to "${properSectionName}" in ${file}`);
    }
    
    console.log('\nSection name update completed successfully');
    
  } catch (error) {
    console.error('Error updating section names:', error);
  }
}

// Execute the function
updateSectionNames()
  .catch(console.error); 