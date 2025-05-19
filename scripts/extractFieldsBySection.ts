import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { sectionMapping, getSectionName } from '../app/utils/sectionMapping';

/**
 * Extracts form fields from SF-86 PDF and organizes them by section
 * This creates separate JSON files for each section's fields for easier management
 */
async function extractFieldsBySection() {
  console.log('Extracting SF-86 form fields by section');
  
  const pdfPath = path.join(process.cwd(), 'utilities', 'externalTools', 'sf861.pdf');
  console.log(`Loading PDF from: ${pdfPath}`);
  
  if (!fs.existsSync(pdfPath)) {
    console.error(`Error: PDF file not found at ${pdfPath}`);
    return;
  }

  try {
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
        const tuEntry = dict.get(PDFName.of('TU'));
        if (tuEntry instanceof PDFString) {
          label = tuEntry.decodeText();
        }
      } catch (error) {
        // Continue if we can't get the label
      }
      
      // Attempt to identify section from field name or label
      let section = 0;
      let sectionName = 'Unknown';
      
      // Try to identify section from label
      const sectionMatch = label.match(/Section\s+(\d+)/i);
      if (sectionMatch) {
        section = parseInt(sectionMatch[1]);
      }
      
      // If we couldn't find section in label, try field name
      if (section === 0) {
        const fieldNameSectionMatch = name.match(/Section(\d+)/i);
        if (fieldNameSectionMatch) {
          section = parseInt(fieldNameSectionMatch[1]);
        }
      }
      
      // Fallback to form structure for common sections
      if (section === 0) {
        if (name.includes('Sections1-6')) section = 1; // General section
        else if (name.includes('DateOfBirth')) section = 2;
        else if (name.includes('PlaceOfBirth')) section = 3;
        else if (name.includes('SSN')) section = 4;
        // Add more mappings as identified
      }
      
      // Use section name from centralized mapping utility
      if (section > 0) {
        sectionName = getSectionName(section) || 'Unknown';
      }
      
      // Assign confidence level based on how section was determined
      let confidence = 0.5; // Default
      if (sectionMatch) confidence = 0.98; // High confidence if section explicitly mentioned
      else if (section > 0) confidence = 0.8; // Medium if inferred
      
      return {
        name,
        id: field.ref ? field.ref.tag.toString() : 'Unknown',
        label,
        type,
        section,
        sectionName,
        confidence
      };
    });
    
    // Group fields by section
    const sectionGroups: Record<string, any[]> = {};
    
    // Start with fields where we're confident about the section
    const confidentFields = fieldData
      .filter(field => field.confidence >= 0.8)
      .sort((a, b) => b.confidence - a.confidence);
    
    for (const field of confidentFields) {
      const section = field.section;
      if (!sectionGroups[section]) {
        sectionGroups[section] = [];
      }
      sectionGroups[section].push(field);
    }
    
    // Create the output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'scripts', 'analysis');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save each section to its own file
    for (const [section, sectionFields] of Object.entries(sectionGroups)) {
      if (parseInt(section) === 0) continue; // Skip unknown section
      
      const outputPath = path.join(outputDir, `section${section}-fields.json`);
      
      // Use section name from sectionMapping as the source of truth
      const sectionId = parseInt(section);
      const properSectionName = getSectionName(sectionId) || `Section ${section}`;
      
      // Update all fields to have the correct section name
      const updatedFields = sectionFields.map(field => ({
        ...field,
        sectionName: properSectionName
      }));
      
      fs.writeFileSync(outputPath, JSON.stringify(updatedFields, null, 2));
      
      console.log(`Saved section ${section} (${properSectionName}) with ${updatedFields.length} fields to ${outputPath}`);
    }
    
    // Save fields that couldn't be categorized
    const unknownFields = fieldData.filter(field => field.section === 0);
    if (unknownFields.length > 0) {
      const unknownPath = path.join(outputDir, 'unknown-fields.json');
      fs.writeFileSync(unknownPath, JSON.stringify(unknownFields, null, 2));
      console.log(`Saved ${unknownFields.length} uncategorized fields to ${unknownPath}`);
    }
    
    // Create a section summary
    const sectionSummary = {
      timestamp: new Date().toISOString(),
      pdfFile: pdfPath,
      totalFields: fieldData.length,
      sections: Object.keys(sectionGroups).map(section => {
        const sectionId = parseInt(section);
        return {
          section: sectionId,
          name: getSectionName(sectionId) || `Section ${section}`,
          fieldCount: sectionGroups[section].length
        };
      }).filter(s => s.section > 0).sort((a, b) => a.section - b.section)
    };
    
    const summaryPath = path.join(outputDir, 'section-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(sectionSummary, null, 2));
    console.log(`\nSaved section summary to ${summaryPath}`);
    
    console.log('\n========== EXTRACTION SUMMARY ==========');
    console.log(`Total fields: ${fieldData.length}`);
    console.log(`Fields categorized by section: ${fieldData.length - unknownFields.length}`);
    console.log(`Uncategorized fields: ${unknownFields.length}`);
    console.log(`Sections identified: ${Object.keys(sectionGroups).filter(s => parseInt(s) > 0).length}`);
    console.log('=======================================');
    
    console.log('\nField extraction by section completed successfully');
    
  } catch (error) {
    console.error('Error extracting form fields by section:', error);
  }
}

// Execute the function
extractFieldsBySection()
  .catch(console.error); 