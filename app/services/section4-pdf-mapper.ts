/**
 * Section 4 PDF Field Mapper
 * 
 * Handles the proper mapping of Section 4 data to all 138 SSN fields in the PDF
 * The PDF requires SSN to be propagated across all pages
 */

import type { Section4 } from '../../api/interfaces/section-interfaces/section4';
import section4Mappings from '../../api/mappings/section-4-mappings.json';

/**
 * Maps Section 4 data to PDF fields
 * Handles SSN propagation to all 138 fields as required by the PDF structure
 */
export function mapSection4ToPDFFields(section4Data: Section4): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();
  
  if (!section4Data?.section4) {
    return pdfFieldMap;
  }
  
  const section = section4Data.section4;
  
  // Handle "Not Applicable" checkbox
  if (section.notApplicable) {
    const notApplicableMapping = section4Mappings.find(m => 
      m.uiField === 'section4.notApplicable'
    );
    if (notApplicableMapping) {
      pdfFieldMap.set(notApplicableMapping.pdfField, section.notApplicable.value || false);
    }
  }
  
  // Handle Acknowledgement radio button
  if (section.Acknowledgement) {
    const acknowledgementMapping = section4Mappings.find(m => 
      m.uiField === 'section4.Acknowledgement'
    );
    if (acknowledgementMapping) {
      pdfFieldMap.set(acknowledgementMapping.pdfField, section.Acknowledgement.value || '');
    }
  }
  
  // Handle SSN propagation to all 138 fields
  // Get the main SSN value (from the first field which is the user input)
  let ssnValue = '';
  if (!section.notApplicable?.value && section.ssn?.[0]?.value?.value) {
    // Format SSN properly (remove any non-digits and format as XXX-XX-XXXX)
    const rawSSN = section.ssn[0].value.value.replace(/\D/g, '');
    if (rawSSN.length === 9) {
      ssnValue = `${rawSSN.slice(0,3)}-${rawSSN.slice(3,5)}-${rawSSN.slice(5)}`;
    } else {
      // Keep partial SSN as-is for user to complete
      ssnValue = section.ssn[0].value.value;
    }
  }
  
  // Map SSN to ALL 138 PDF fields
  // The PDF requires the same SSN value in multiple locations throughout the form
  for (let i = 0; i < 138; i++) {
    const ssnMapping = section4Mappings.find(m => 
      m.uiField === `section4.ssn[${i}]`
    );
    
    if (ssnMapping) {
      // If "Not Applicable" is checked, leave SSN fields empty
      const fieldValue = section.notApplicable?.value ? '' : ssnValue;
      pdfFieldMap.set(ssnMapping.pdfField, fieldValue);
    }
  }
  
  return pdfFieldMap;
}

/**
 * Validates that Section 4 data is properly structured for PDF generation
 */
export function validateSection4ForPDF(section4Data: Section4): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!section4Data?.section4) {
    errors.push('Section 4 data is missing');
    return { isValid: false, errors };
  }
  
  const section = section4Data.section4;
  
  // Check if acknowledgement is provided (required field)
  if (!section.Acknowledgement?.value) {
    errors.push('Acknowledgement is required');
  }
  
  // If not marked as "Not Applicable", validate SSN format
  if (!section.notApplicable?.value) {
    const ssnValue = section.ssn?.[0]?.value?.value || '';
    const rawSSN = ssnValue.replace(/\D/g, '');
    
    if (!rawSSN) {
      // SSN is optional if not required by validation rules
      // Don't add error for empty SSN
    } else if (rawSSN.length !== 9) {
      errors.push('SSN must be exactly 9 digits');
    }
  }
  
  // Verify SSN array has been properly initialized
  if (!section.ssn || section.ssn.length === 0) {
    errors.push('SSN field structure is not properly initialized');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get statistics about Section 4 PDF mapping
 */
export function getSection4MappingStats(): {
  totalFields: number;
  ssnFields: number;
  controlFields: number;
} {
  const ssnFields = section4Mappings.filter(m => 
    m.uiField.startsWith('section4.ssn')
  ).length;
  
  const controlFields = section4Mappings.filter(m => 
    m.uiField === 'section4.notApplicable' || 
    m.uiField === 'section4.Acknowledgement'
  ).length;
  
  return {
    totalFields: section4Mappings.length,
    ssnFields,
    controlFields
  };
}