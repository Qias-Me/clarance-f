import fs from 'fs';
import path from 'path';
import { chromium } from '@playwright/test';

interface FieldDefinition {
  name: string;
  id: string;
  label: string;
  type: string;
  section: number;
  sectionName: string;
  confidence: number;
}

interface ContextField {
  value: string;
  id: string;
  type: string;
  label: string;
}

interface SectionMapping {
  sectionNumber: number;
  contextFile: string;
  description: string;
}

// Define mapping between section numbers and context files
const sectionToContextMap: SectionMapping[] = [
  { sectionNumber: 1, contextFile: 'namesInfo.tsx', description: 'Full Name' },
  { sectionNumber: 2, contextFile: 'birthInfo.tsx', description: 'Date of Birth' },
  { sectionNumber: 3, contextFile: 'birthInfo.tsx', description: 'Place of Birth' }, // also covered in birthInfo.tsx
  { sectionNumber: 4, contextFile: 'personalInfo.tsx', description: 'Personal Information' },
  { sectionNumber: 5, contextFile: 'physicalAttributes.tsx', description: 'Physical Attributes' },
  { sectionNumber: 6, contextFile: 'contactInfo.tsx', description: 'Contact Information' },
  { sectionNumber: 7, contextFile: 'contactInfoContext.tsx', description: 'Additional Contact Information' },
  { sectionNumber: 8, contextFile: 'placeOfBirth.tsx', description: 'Place of Birth (Extended)' },
  { sectionNumber: 9, contextFile: 'citizenshipInfo.tsx', description: 'Citizenship' },
  { sectionNumber: 10, contextFile: 'dualCitizenshipInfo.tsx', description: 'Dual Citizenship' },
  { sectionNumber: 11, contextFile: 'residencyInfo.tsx', description: 'Where You Have Lived' },
  { sectionNumber: 12, contextFile: 'passportInfo.tsx', description: 'Passport Information' },
  { sectionNumber: 13, contextFile: 'employmentInfo.tsx', description: 'Employment History' },
  { sectionNumber: 14, contextFile: 'schoolInfo.tsx', description: 'Education' },
  { sectionNumber: 15, contextFile: 'peopleThatKnow.tsx', description: 'People Who Know You Well' },
  { sectionNumber: 16, contextFile: 'relativesInfo.tsx', description: 'Relatives' },
  { sectionNumber: 17, contextFile: 'relationshipInfo.tsx', description: 'Relationships' },
  { sectionNumber: 18, contextFile: 'militaryHistoryInfo.tsx', description: 'Military History' },
  { sectionNumber: 19, contextFile: 'foreignActivities.tsx', description: 'Foreign Activities' },
  { sectionNumber: 20, contextFile: 'foreignContacts.tsx', description: 'Foreign Contacts' },
  { sectionNumber: 21, contextFile: 'mentalHealth.tsx', description: 'Mental Health' },
  { sectionNumber: 22, contextFile: 'policeRecord.tsx', description: 'Police Record' },
  { sectionNumber: 23, contextFile: 'drugActivity.tsx', description: 'Drug Use' },
  { sectionNumber: 24, contextFile: 'alcoholUse.tsx', description: 'Alcohol Use' },
  { sectionNumber: 25, contextFile: 'investigationsInfo.tsx', description: 'Investigations and Clearances' },
  { sectionNumber: 26, contextFile: 'finances.tsx', description: 'Financial Record' },
  { sectionNumber: 27, contextFile: 'technology.tsx', description: 'Use of Information Technology' },
  { sectionNumber: 28, contextFile: 'association.tsx', description: 'Association Record' },
  { sectionNumber: 29, contextFile: 'civil.tsx', description: 'Civil Court Record' },
  { sectionNumber: 30, contextFile: 'signature.tsx', description: 'Continuation Section / Signature' }, // Form continuation section
  { sectionNumber: 31, contextFile: 'aknowledgementInfo.tsx', description: 'Application Configuration' }, // Application config - print flags
  { sectionNumber: 32, contextFile: 'print.tsx', description: 'Print Configuration' } // Print-specific configuration
];

/**
 * Extract field IDs from a context file content
 */
function extractContextFields(content: string): string[] {
  const idRegex = /id:\s*["'](\d+)["']/g;
  const ids: string[] = [];
  let match;
  
  while ((match = idRegex.exec(content)) !== null) {
    ids.push(match[1]);
  }
  
  return ids;
}

/**
 * Check if a field exists in the context file
 */
function fieldExistsInContext(fieldId: string, contextContent: string): boolean {
  const cleanId = fieldId.replace(' 0 R', '');
  return contextContent.includes(`id: "${cleanId}"`) || 
         contextContent.includes(`id: '${cleanId}'`) || 
         contextContent.includes(`id:"${cleanId}"`) ||
         contextContent.includes(`id:'${cleanId}'`);
}

/**
 * Generate field definition text to add to context file
 */
function generateFieldDefinition(field: FieldDefinition): string {
  const cleanId = field.id.replace(' 0 R', '');
  const fieldName = generateFieldName(field.label);
  const fieldType = determineFieldType(field.type);
  
  // Clean up the label, removing any newlines
  const cleanLabel = field.label.replace(/\n/g, ' ').trim();
  
  return `
    ${fieldName}: {
        value: "",
        id: "${cleanId}",
        type: "${fieldType}",
        label: "${cleanLabel}",
    },`;
}

/**
 * Determine the field type based on PDF field type
 */
function determineFieldType(pdfType: string): string {
  switch(pdfType.toLowerCase()) {
    case 'pdftextfield':
      return 'PDFTextField';
    case 'pdfcheckbox':
      return 'PDFCheckBox';
    case 'pdfradiogroup':
    case 'radiobuttonlist':
      return 'PDFRadioGroup';
    case 'pdfdropdown':
      return 'PDFDropdown';
    default:
      return 'PDFTextField';
  }
}

/**
 * Generate a camelCase field name from a label
 */
function generateFieldName(label: string): string {
  // Remove section number and punctuation
  const cleanLabel = label.replace(/Section \d+\.\s*/, '')
    .replace(/[,.?]/g, '')
    .trim();
  
  // Convert to camelCase
  const words = cleanLabel.split(/\s+/);
  const firstWord = words[0].toLowerCase();
  const restWords = words.slice(1).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  
  return [firstWord, ...restWords].join('');
}

/**
 * Create dummy field data for sections without a fields file
 */
function createDummyFieldData(sectionNumber: number, description: string): FieldDefinition[] {
  return [{
    name: `form1[0].Section${sectionNumber}[0].Placeholder[0]`,
    id: `${9000 + sectionNumber} 0 R`,
    label: `Section ${sectionNumber} (${description}) placeholder field`,
    type: "PDFTextField",
    section: sectionNumber,
    sectionName: description,
    confidence: 1.0
  }];
}

/**
 * Main function to validate section contexts
 */
async function validateSectionContexts() {
  console.log('Starting section context validation...');
  
  // Directory paths
  const analysisDir = path.join(process.cwd(), 'scripts', 'analysis');
  const sectionsDir = path.join(process.cwd(), 'app', 'state', 'contexts', 'sections');
  const reportsDir = path.join(process.cwd(), 'reports');
  
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }
  
  // Load section summary
  const summaryPath = path.join(analysisDir, 'section-summary.json');
  if (!fs.existsSync(summaryPath)) {
    console.error(`Section summary not found at ${summaryPath}`);
    return;
  }
  
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
  const validationResults: any[] = [];
  
  // Process each section
  for (const sectionMapping of sectionToContextMap) {
    const sectionNumber = sectionMapping.sectionNumber;
    const contextFile = sectionMapping.contextFile;
    const description = sectionMapping.description || `Section ${sectionNumber}`;
    
    console.log(`\n==== Processing Section ${sectionNumber} (${description}) ====`);
    
    // Load section fields or create dummy data if not found
    let sectionFields: FieldDefinition[] = [];
    const sectionFieldsPath = path.join(analysisDir, `section${sectionNumber}-fields.json`);
    
    if (fs.existsSync(sectionFieldsPath)) {
      sectionFields = JSON.parse(fs.readFileSync(sectionFieldsPath, 'utf-8'));
    } else {
      console.warn(`Section ${sectionNumber} fields not found at ${sectionFieldsPath}, using dummy data...`);
      sectionFields = createDummyFieldData(sectionNumber, description);
    }
    
    // Load context file
    const contextFilePath = path.join(sectionsDir, contextFile);
    if (!fs.existsSync(contextFilePath)) {
      console.warn(`Context file not found at ${contextFilePath}, skipping...`);
      validationResults.push({
        section: sectionNumber,
        contextFile,
        description,
        status: 'Error',
        reason: 'Context file not found',
        missingFields: sectionFields.map(f => f.id)
      });
      continue;
    }
    
    const contextContent = fs.readFileSync(contextFilePath, 'utf-8');
    
    // Analyze fields
    const missingFields: FieldDefinition[] = [];
    
    for (const field of sectionFields) {
      if (!fieldExistsInContext(field.id, contextContent)) {
        missingFields.push(field);
      }
    }
    
    // Report findings
    console.log(`Context file: ${contextFile}`);
    console.log(`Total fields in section: ${sectionFields.length}`);
    console.log(`Missing fields: ${missingFields.length}`);
    
    // Generate updated content if missing fields found
    if (missingFields.length > 0) {
      console.log('Missing fields:');
      missingFields.forEach(field => {
        console.log(`  - ${field.id}: ${field.label}`);
      });
      
      // Generate updated context file
      const updatedContextPath = path.join(reportsDir, `updated-${contextFile}`);
      
      // Find the position to insert new fields
      let updatedContent = contextContent;
      if (contextContent.includes('export const')) {
        // Find the export statement and opening brace
        const exportMatch = /export const \w+\s*=\s*{/.exec(contextContent);
        if (exportMatch) {
          const insertPosition = exportMatch.index + exportMatch[0].length;
          
          // Insert all missing fields after the opening brace
          const fieldsToInsert = missingFields.map(generateFieldDefinition).join('');
          updatedContent = 
            contextContent.slice(0, insertPosition) + 
            '\n    // Added missing fields' +
            fieldsToInsert +
            contextContent.slice(insertPosition);
        }
      }
      
      fs.writeFileSync(updatedContextPath, updatedContent);
      console.log(`Updated context file saved to: ${updatedContextPath}`);
    } else {
      console.log('✅ All fields are present in the context file');
    }
    
    validationResults.push({
      section: sectionNumber,
      contextFile,
      description,
      status: missingFields.length > 0 ? 'Updated' : 'Complete',
      missingFieldCount: missingFields.length,
      totalFields: sectionFields.length,
      coverage: `${((sectionFields.length - missingFields.length) / sectionFields.length * 100).toFixed(2)}%`
    });
  }
  
  // Save validation results
  const reportPath = path.join(reportsDir, 'section-context-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(validationResults, null, 2));
  console.log(`\nValidation report saved to: ${reportPath}`);
  
  // Generate summary HTML report
  const htmlReportPath = path.join(reportsDir, 'section-context-validation-report.html');
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Section Context Validation Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .complete { color: #27ae60; }
    .updated { color: #e67e22; }
    .error { color: #e74c3c; }
    .summary { margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>Section Context Validation Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <p>Total Sections: ${validationResults.length}</p>
    <p>Complete: ${validationResults.filter(r => r.status === 'Complete').length}</p>
    <p>Updated: ${validationResults.filter(r => r.status === 'Updated').length}</p>
    <p>Errors: ${validationResults.filter(r => r.status === 'Error' || r.status === 'Skipped').length}</p>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Section</th>
        <th>Description</th>
        <th>Context File</th>
        <th>Status</th>
        <th>Coverage</th>
        <th>Missing / Total</th>
      </tr>
    </thead>
    <tbody>
      ${validationResults.map(result => `
        <tr>
          <td>${result.section}</td>
          <td>${result.description}</td>
          <td>${result.contextFile}</td>
          <td class="${result.status.toLowerCase()}">${result.status}</td>
          <td>${result.coverage || 'N/A'}</td>
          <td>${result.missingFieldCount || 'N/A'} / ${result.totalFields || 'N/A'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <p>Report generated at: ${new Date().toISOString()}</p>
</body>
</html>`;
  
  fs.writeFileSync(htmlReportPath, htmlContent);
  console.log(`HTML report saved to: ${htmlReportPath}`);
  
  // Now launch a browser to demonstrate validating the form fields
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Open the HTML report
  await page.goto(`file://${htmlReportPath}`);
  console.log('Opened validation report in browser');
  
  // Wait for 10 seconds before closing
  await page.waitForTimeout(10000);
  
  // Now we would navigate to the form and validate fields
  console.log('\nIn a real implementation, the script would:');
  console.log('1. Navigate to the form portal');
  console.log('2. Fill fields based on context definitions');
  console.log('3. Validate field behavior matches expected type');
  console.log('4. Update context files with additional metadata from real interaction');
  
  await browser.close();
  
  console.log('\nSection context validation completed');
}

// Execute the function
validateSectionContexts()
  .catch(console.error); 