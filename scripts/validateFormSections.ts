import { PDFDocument, PDFCheckBox, PDFTextField, PDFRadioGroup, PDFDropdown } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

// Define types for our validation
interface FieldReport {
  name: string;
  definedType: string;
  actualType: string;
  accessible: boolean;
  fillable: boolean;
  validationMessage: string;
}

interface SectionReport {
  name: string;
  sectionNumber: number;
  totalFields: number;
  accessibleFields: number;
  inaccessibleFields: number;
  validationSuccessRate: string;
  fields: FieldReport[];
}

interface ValidationReport {
  timestamp: string;
  pdfFile: string;
  sections: SectionReport[];
  summary: {
    totalSections: number;
    totalFields: number;
    accessibleFields: number;
    inaccessibleFields: number;
    validationSuccessRate: string;
  };
}

/**
 * Validates all sections of the SF-86 form to ensure field access and proper form filling
 */
async function validateFormSections() {
  console.log('Starting SF-86 form section validation');
  
  // 1. Load the empty PDF form
  const pdfPath = path.join(process.cwd(), 'utilities', 'externalTools', 'sf861.pdf');
  console.log(`Loading empty PDF from: ${pdfPath}`);
  
  if (!fs.existsSync(pdfPath)) {
    console.error(`Error: PDF file not found at ${pdfPath}`);
    return;
  }

  // 2. Load all section field data files from scripts/analysis using direct fs methods
  const analysisDir = path.join(process.cwd(), 'scripts', 'analysis');
  
  // Get all files in the analysis directory
  const allFiles = fs.readdirSync(analysisDir);
  
  // Filter for section field files
  const sectionFiles = allFiles
    .filter(file => file.match(/^section\d+-fields\.json$/))
    .map(file => path.join(analysisDir, file));
  
  console.log(`Found ${sectionFiles.length} section field definition files`);
  
  if (sectionFiles.length === 0) {
    console.warn('No section field definition files found. Run field extraction for sections first.');
    console.log('Files in analysis directory:');
    allFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
    return;
  }
  
  // 3. Create validation report structure
  const validationReport: ValidationReport = {
    timestamp: new Date().toISOString(),
    pdfFile: pdfPath,
    sections: [],
    summary: {
      totalSections: 0,
      totalFields: 0,
      accessibleFields: 0,
      inaccessibleFields: 0,
      validationSuccessRate: '0%'
    }
  };
  
  try {
    // 4. Load the PDF once for validation
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    
    // Get all form fields for reference
    const allFormFields = form.getFields();
    const formFieldMap = new Map();
    
    allFormFields.forEach(field => {
      formFieldMap.set(field.getName(), {
        type: field.constructor.name,
        field: field
      });
    });
    
    console.log(`PDF contains ${allFormFields.length} total form fields`);
    
    // 5. Process each section file
    for (const sectionFile of sectionFiles) {
      const sectionName = path.basename(sectionFile, '.json');
      const sectionMatch = sectionName.match(/section(\d+)/i);
      const sectionNumber = sectionMatch ? parseInt(sectionMatch[1]) : 0;
      
      console.log(`\nValidating ${sectionName}...`);
      
      // Load section fields
      const sectionData = JSON.parse(fs.readFileSync(sectionFile, 'utf-8'));
      
      // Create section report
      const sectionReport: SectionReport = {
        name: sectionName,
        sectionNumber,
        totalFields: sectionData.length,
        accessibleFields: 0,
        inaccessibleFields: 0,
        validationSuccessRate: '0%',
        fields: []
      };
      
      // Validate each field in the section
      for (const fieldDef of sectionData) {
        const fieldName = fieldDef.name;
        const fieldType = fieldDef.type;
        const fieldInfo = formFieldMap.get(fieldName);
        
        const fieldReport: FieldReport = {
          name: fieldName,
          definedType: fieldType,
          actualType: fieldInfo ? fieldInfo.type : 'Not Found',
          accessible: !!fieldInfo,
          fillable: false,
          validationMessage: ''
        };
        
        if (fieldInfo) {
          sectionReport.accessibleFields++;
          
          // Test if field is fillable by attempting to set a value
          try {
            const field = fieldInfo.field;
            
            if (field instanceof PDFTextField) {
              field.setText('Test Value');
              fieldReport.fillable = true;
            } else if (field instanceof PDFCheckBox) {
              field.check();
              field.uncheck();
              fieldReport.fillable = true;
            } else if (field instanceof PDFRadioGroup) {
              const options = field.getOptions();
              if (options.length > 0) {
                field.select(options[0]);
                fieldReport.fillable = true;
              } else {
                fieldReport.validationMessage = 'Radio group has no options';
              }
            } else if (field instanceof PDFDropdown) {
              const options = field.getOptions();
              if (options.length > 0) {
                field.select(options[0]);
                fieldReport.fillable = true;
              } else {
                fieldReport.validationMessage = 'Dropdown has no options';
              }
            }
          } catch (error) {
            if (error instanceof Error) {
              fieldReport.validationMessage = `Error testing field: ${error.message}`;
            } else {
              fieldReport.validationMessage = 'Unknown error testing field';
            }
          }
        } else {
          sectionReport.inaccessibleFields++;
          fieldReport.validationMessage = 'Field not found in PDF';
        }
        
        sectionReport.fields.push(fieldReport);
      }
      
      // Calculate section validation success rate
      sectionReport.validationSuccessRate = sectionReport.totalFields > 0 
        ? (sectionReport.accessibleFields / sectionReport.totalFields * 100).toFixed(2) + '%'
        : '0%';
        
      console.log(`Section ${sectionNumber} validation: ${sectionReport.accessibleFields}/${sectionReport.totalFields} fields accessible (${sectionReport.validationSuccessRate})`);
      
      // Add section to the overall report
      validationReport.sections.push(sectionReport);
      
      // Update summary
      validationReport.summary.totalSections++;
      validationReport.summary.totalFields += sectionReport.totalFields;
      validationReport.summary.accessibleFields += sectionReport.accessibleFields;
      validationReport.summary.inaccessibleFields += sectionReport.inaccessibleFields;
    }
    
    // Calculate overall validation success rate
    validationReport.summary.validationSuccessRate = validationReport.summary.totalFields > 0
      ? (validationReport.summary.accessibleFields / validationReport.summary.totalFields * 100).toFixed(2) + '%'
      : '0%';
    
    // 6. Save the validation report
    const reportPath = path.join(process.cwd(), 'scripts', 'sf86-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(validationReport, null, 2));
    console.log(`\nValidation complete! Report saved to: ${reportPath}`);
    
    // 7. Print summary
    console.log('\n========== VALIDATION SUMMARY ==========');
    console.log(`Sections validated: ${validationReport.summary.totalSections}`);
    console.log(`Total fields: ${validationReport.summary.totalFields}`);
    console.log(`Accessible fields: ${validationReport.summary.accessibleFields}`);
    console.log(`Inaccessible fields: ${validationReport.summary.inaccessibleFields}`);
    console.log(`Overall validation success rate: ${validationReport.summary.validationSuccessRate}`);
    console.log('=======================================');
    
  } catch (error) {
    console.error('Error during form validation:', error);
  }
}

// Execute the function
validateFormSections()
  .catch(console.error); 