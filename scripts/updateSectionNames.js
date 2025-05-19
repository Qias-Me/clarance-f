import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting script...');

/**
 * Updates section-X-fields.json files with correct section names
 * Uses ES modules syntax
 */
async function updateSectionNames() {
  console.log('Updating section names in section field files...');
  
  const analysisDir = path.join(path.resolve(), 'scripts', 'analysis');
  console.log(`Checking directory: ${analysisDir}`);
  
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
      
      // Get proper section name
      const properSectionName = getSectionName(sectionId);
      
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

// Internal function to get section name
function getSectionName(sectionId) {
  // Create a static mapping of section IDs to names
  const sectionNames = {
    1: "Full Name",
    2: "Date of Birth",
    3: "Place of Birth",
    4: "Social Security Number",
    5: "Other Names Used",
    6: "Your Identifying Information",
    7: "Your Contact Information",
    8: "U.S. Passport Information",
    9: "Citizenship",
    10: "Dual/Multiple Citizenship & Foreign Passport Info",
    11: "Where You Have Lived",
    12: "Where you went to School",
    13: "Employment Activities",
    14: "Selective Service",
    15: "Military History",
    16: "People Who Know You Well",
    17: "Marital/Relationship Status",
    18: "Relatives",
    19: "Foreign Contacts",
    20: "Foreign Business, Activities, Government Contacts",
    21: "Psychological and Emotional Health",
    22: "Police Record",
    23: "Illegal Use of Drugs and Drug Activity",
    24: "Use of Alcohol",
    25: "Investigations and Clearance",
    26: "Financial Record",
    27: "Use of Information Technology Systems",
    28: "Involvement in Non-Criminal Court Actions",
    29: "Association Record",
    30: "Signature"
  };
  
  return sectionNames[sectionId] || `Section ${sectionId}`;
}

// Execute the function
updateSectionNames()
  .catch(console.error); 