import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function extractFormFields() {
  console.log('Extracting form fields from SF-86 PDF');
  
  const pdfPath = path.join(process.cwd(), 'utilities', 'externalTools', 'sf861.pdf');
  console.log(`Loading PDF from: ${pdfPath}`);
  
  try {
    // Check if the PDF exists
    if (!fs.existsSync(pdfPath)) {
      console.error(`Error: PDF file not found at ${pdfPath}`);
      return;
    }

    // Load the PDF
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    
    // Get all fields from the form
    const fields = form.getFields();
    console.log(`Found ${fields.length} fields in the PDF`);
    
    // Extract field information
    const fieldData = fields.map(field => {
      const name = field.getName();
      const type = field.constructor.name;
      
      // Try to get the field label if available
      let label = 'Unknown';
      try {
        const acroField = field.acroField;
        const dict = acroField.dict;
        // Many PDF forms store the field label in the TU (tool tip) entry
        const tuEntry = dict.get(PDFName.of('TU'));
        if (tuEntry instanceof PDFString) {
          label = tuEntry.decodeText();
        }
      } catch (error) {
        // Continue if we can't get the label
      }
      
      return {
        name,
        type,
        label,
      };
    });
    
    // Create a mapping template
    const template = fieldData.reduce((acc, field) => {
      acc[field.name] = {
        type: field.type,
        label: field.label,
        value: '' // Empty value to be filled
      };
      return acc;
    }, {} as Record<string, { type: string, label: string, value: string }>);
    
    // Save the field data to a JSON file
    const outputPath = path.join(process.cwd(), 'scripts', 'sf86-fields.json');
    fs.writeFileSync(outputPath, JSON.stringify(fieldData, null, 2));
    console.log(`Field data saved to: ${outputPath}`);
    
    // Save the template to a JSON file
    const templatePath = path.join(process.cwd(), 'scripts', 'sf86-template.json');
    fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
    console.log(`Template saved to: ${templatePath}`);
    
    console.log('Field extraction completed successfully');
    
  } catch (error) {
    console.error('Error extracting form fields:', error);
  }
}

// Execute the function
extractFormFields()
  .catch(console.error); 