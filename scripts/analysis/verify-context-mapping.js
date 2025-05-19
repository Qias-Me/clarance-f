import fs from 'fs';
import path from 'path';

// Function to read and parse a JSON file
function loadJsonFile(filePath) {
  try {
    console.log(`Attempting to load file: ${filePath}`);
    const data = fs.readFileSync(filePath, 'utf8');
    console.log(`Successfully loaded ${filePath}`);
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    return null;
  }
}

// Function to read a TypeScript file content
function readTsFile(filePath) {
  try {
    console.log(`Attempting to read file: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`Successfully read ${filePath} (${content.length} bytes)`);
    return content;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

// Function to extract IDs from a TypeScript context file
function extractIdsFromContextFile(fileContent) {
  const idRegex = /id:\s*['"]([\w\d]+)['"]/g;
  const matches = [...fileContent.matchAll(idRegex)];
  console.log(`Found ${matches.length} ID matches in the context file content`);
  return matches.map(match => match[1]);
}

// Main verification function
function verifyContextMapping(sectionNumber, contextFile) {
  console.log(`Verifying mapping for Section ${sectionNumber} using ${contextFile}`);
  
  // Load the section fields from the JSON file
  const sectionFieldsPath = path.join('scripts', 'analysis', `section${sectionNumber}-fields.json`);
  console.log(`Looking for section fields at: ${sectionFieldsPath}`);
  
  if (!fs.existsSync(sectionFieldsPath)) {
    console.error(`Section fields file not found: ${sectionFieldsPath}`);
    return false;
  }
  
  const sectionFields = loadJsonFile(sectionFieldsPath);
  if (!sectionFields) return false;
  
  console.log(`Loaded ${sectionFields.length} section fields`);
  
  // Extract field IDs from section fields (stripping the "0 R" suffix)
  const expectedIds = sectionFields.map(field => field.id.replace(/ 0 R$/, ''));
  console.log(`Found ${expectedIds.length} expected field IDs: ${expectedIds.join(', ')}`);
  
  // Read the context file
  const contextFilePath = path.join('app', 'state', 'contexts', 'sections', contextFile);
  console.log(`Looking for context file at: ${contextFilePath}`);
  
  if (!fs.existsSync(contextFilePath)) {
    console.error(`Context file not found: ${contextFilePath}`);
    return false;
  }
  
  const contextContent = readTsFile(contextFilePath);
  if (!contextContent) return false;
  
  // Extract IDs from the context file
  const contextIds = extractIdsFromContextFile(contextContent);
  console.log(`Found ${contextIds.length} context field IDs: ${contextIds.join(', ')}`);
  
  // Check if all expected IDs are in the context file
  const missingIds = expectedIds.filter(id => !contextIds.includes(id));
  const extraIds = contextIds.filter(id => !expectedIds.includes(id));
  
  if (missingIds.length === 0 && extraIds.length === 0) {
    console.log('✅ Verification successful: All field IDs are correctly mapped');
    return true;
  }
  
  if (missingIds.length > 0) {
    console.error(`❌ Missing IDs in context file: ${missingIds.join(', ')}`);
  }
  
  if (extraIds.length > 0) {
    console.warn(`⚠️ Extra IDs in context file: ${extraIds.join(', ')}`);
  }
  
  return false;
}

// Main execution
// Check if section number and context file are provided
const args = process.argv.slice(2);
console.log(`Script arguments: ${args.join(', ')}`);

if (args.length < 2) {
  console.error('Usage: node verify-context-mapping.js <sectionNumber> <contextFile>');
  console.error('Example: node verify-context-mapping.js 1 personalInfo.tsx');
  process.exit(1);
}

const sectionNumber = parseInt(args[0]);
const contextFile = args[1];

console.log(`Starting verification for section ${sectionNumber} using ${contextFile}`);
const result = verifyContextMapping(sectionNumber, contextFile);
console.log(`Verification result: ${result ? 'Success' : 'Failed'}`); 