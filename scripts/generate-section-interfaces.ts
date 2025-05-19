/**
 * Script to generate TypeScript interfaces for each section based on field-sections.json and field-labels.json
 * 
 * Usage:
 * npx ts-node scripts/generate-section-interfaces.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { camelCase, pascalCase } from './utils/stringUtils.js';

// Get current file and directory path using ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const FIELD_SECTIONS_PATH = path.join(__dirname, '../reports/field-sections.json');
const FIELD_LABELS_PATH = path.join(__dirname, '../reports/field-labels.json');
const OUTPUT_DIR = path.join(__dirname, '../api/interfaces/generated');

// Interface to represent field section metadata
interface FieldSectionMetadata {
  section: number;
  sectionName: string;
  confidence: number;
}

// Interface for parsed field data
interface FieldData {
  name: string;
  section: number;
  sectionName: string;
  label: string;
  type?: string;
  inferred?: boolean;
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load field sections and labels data
function loadFieldData(): FieldData[] {
  try {
    // Load and parse JSON files
    const fieldSections: Record<string, FieldSectionMetadata> = JSON.parse(
      fs.readFileSync(FIELD_SECTIONS_PATH, 'utf-8')
    );
    
    const fieldLabels: Record<string, string> = JSON.parse(
      fs.readFileSync(FIELD_LABELS_PATH, 'utf-8')
    );

    // Combine data from both files
    const fieldData: FieldData[] = [];
    
    for (const [fieldName, sectionData] of Object.entries(fieldSections)) {
      // Skip fields without section info
      if (!sectionData.section) continue;
      
      const fieldInfo: FieldData = {
        name: fieldName,
        section: sectionData.section,
        sectionName: sectionData.sectionName,
        label: fieldLabels[fieldName] || 'Unknown',
        // Infer field type from field name
        type: inferFieldType(fieldName, fieldLabels[fieldName]),
        inferred: !fieldLabels[fieldName]
      };
      
      fieldData.push(fieldInfo);
    }
    
    return fieldData;
  } catch (error) {
    console.error('Error loading field data:', error);
    return [];
  }
}

// Infer field type based on field name and label
function inferFieldType(fieldName: string, label?: string): string {
  // Common field types in PDF forms
  if (fieldName.includes('CheckBox') || fieldName.includes('#field') && label?.includes('Present')) {
    return 'PDFCheckBox';
  } else if (fieldName.includes('RadioButtonList')) {
    return 'PDFRadioGroup';
  } else if (fieldName.includes('DropDownList')) {
    return 'PDFDropdown';
  } else if (fieldName.includes('Datefield') || label?.includes('date')) {
    return 'PDFTextField'; // Date fields are often text fields in PDFs
  } else {
    return 'PDFTextField'; // Default to text field
  }
}

// Group fields by section
function groupFieldsBySection(fields: FieldData[]): Record<number, FieldData[]> {
  const sectionMap: Record<number, FieldData[]> = {};
  
  for (const field of fields) {
    if (!sectionMap[field.section]) {
      sectionMap[field.section] = [];
    }
    sectionMap[field.section].push(field);
  }
  
  return sectionMap;
}

// Generate field property declarations for an interface
function generateFieldProperties(fields: FieldData[]): string {
  const properties: string[] = [];
  const processedFields = new Set<string>();
  
  for (const field of fields) {
    // Create a simpler property name from the field name and label
    let propName = derivePropertyName(field.name, field.label);
    
    // Avoid duplicate property names
    if (processedFields.has(propName)) {
      let counter = 1;
      while (processedFields.has(`${propName}${counter}`)) {
        counter++;
      }
      propName = `${propName}${counter}`;
    }
    
    processedFields.add(propName);
    
    // Determine field value type based on the field type
    let valueType = 'string';
    if (field.type === 'PDFCheckBox' || field.label.includes('Present')) {
      valueType = '"YES" | "NO"';
    } else if (field.type === 'PDFRadioGroup') {
      valueType = '"YES" | "NO"'; // Default for radio groups
    }
    
    // Add JSDoc comment with label
    const comment = `/**\n   * ${field.label}\n   * Original field: ${field.name}\n   */`;
    
    // Generate property declaration
    properties.push(`${comment}\n  ${propName}: Field<${valueType}>;`);
  }
  
  return properties.join('\n\n  ');
}

// Derive a property name from field name and label
function derivePropertyName(fieldName: string, label: string): string {
  // Try to use label first
  if (label && label !== 'Unknown') {
    // Convert label to camelCase and clean it up
    const cleanLabel = label
      .replace(/[^\w\s]/gi, '') // Remove special characters
      .replace(/\s+/g, ' ')     // Replace multiple spaces with a single space
      .trim();
    
    if (cleanLabel) {
      return camelCase(cleanLabel.split(' ').slice(0, 3).join(' '));
    }
  }
  
  // Fallback to using the field name
  const parts = fieldName.split('.');
  const lastPart = parts[parts.length - 1];
  
  // Extract meaningful part of the field name
  const match = lastPart.match(/([a-zA-Z]+)(?:\[\d+\])?$/);
  if (match) {
    return camelCase(match[1]);
  }
  
  // Last resort
  return camelCase(fieldName.replace(/[^\w]/g, '_'));
}

// Generate interface for a section
function generateSectionInterface(sectionNumber: number, sectionName: string, fields: FieldData[]): string {
  const interfaceName = pascalCase(`${sectionName.replace(/[^\w\s]/g, '')}Info`);
  const fieldProperties = generateFieldProperties(fields);
  
  return `/**
 * Interface for Section ${sectionNumber}: ${sectionName}
 * Generated from field-sections.json and field-labels.json
 */
import { Field } from "../formDefinition.js";

export interface ${interfaceName} {
  ${fieldProperties}
}
`;
}

// Main function to generate all interfaces
function generateInterfaces(): void {
  // Load field data
  const fieldData = loadFieldData();
  
  if (fieldData.length === 0) {
    console.error('No field data found. Check input files.');
    return;
  }
  
  console.log(`Loaded ${fieldData.length} fields from input files.`);
  
  // Group fields by section
  const sectionMap = groupFieldsBySection(fieldData);
  
  // Generate interfaces for each section
  for (const [sectionNumber, fields] of Object.entries(sectionMap)) {
    const section = parseInt(sectionNumber, 10);
    const sectionName = fields[0].sectionName;
    
    const interfaceContent = generateSectionInterface(section, sectionName, fields);
    const fileName = camelCase(`${sectionName.replace(/[^\w\s]/g, '')}_info`);
    const filePath = path.join(OUTPUT_DIR, `${fileName}.js`);
    
    // Write interface to file
    fs.writeFileSync(filePath, interfaceContent);
    console.log(`Generated interface for section ${section}: ${fileName}.js`);
  }
  
  // Generate index file for easy imports
  generateIndexFile(sectionMap);
  
  console.log('Interface generation complete!');
}

// Generate index.ts file to export all generated interfaces
function generateIndexFile(sectionMap: Record<number, FieldData[]>): void {
  const imports: string[] = [];
  const exports: string[] = [];
  
  for (const [sectionNumber, fields] of Object.entries(sectionMap)) {
    const section = parseInt(sectionNumber, 10);
    const sectionName = fields[0].sectionName;
    
    const interfaceName = pascalCase(`${sectionName.replace(/[^\w\s]/g, '')}Info`);
    const fileName = camelCase(`${sectionName.replace(/[^\w\s]/g, '')}_info`);
    
    imports.push(`import { ${interfaceName} } from './${fileName}.js';`);
    exports.push(interfaceName);
  }
  
  const content = `/**
 * Index file for generated section interfaces
 * Generated from field-sections.json and field-labels.json
 */
${imports.join('\n')}

export {
  ${exports.join(',\n  ')}
};
`;
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.js'), content);
  console.log('Generated index.js file for all interfaces.');
}

// Run the script
generateInterfaces(); 