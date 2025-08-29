/**
 * Section 1 PDF Field Mapper
 * 
 * Handles the proper mapping of Section 1 (Full Name) data to PDF fields
 * Section 1 contains only the current name fields: lastName, firstName, middleName, suffix
 */

import type { Section1 } from '../../api/interfaces/section-interfaces/section1';
import section1Mappings from '../../api/mappings/section-1-mappings.json';

/**
 * Maps Section 1 data to PDF fields
 * Handles the 4 name fields only (no previous names - those belong in another section)
 */
export function mapSection1ToPDFFields(section1Data: Section1): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();
  
  if (!section1Data?.section1) {
    return pdfFieldMap;
  }
  
  const section = section1Data.section1;
  
  // Map Last Name field
  if (section.lastName) {
    const lastNameMapping = section1Mappings.mappings.find(m => 
      m.uiPath === 'section1.lastName'
    );
    if (lastNameMapping) {
      pdfFieldMap.set(lastNameMapping.pdfFieldId, section.lastName.value || '');
    }
  }
  
  // Map First Name field
  if (section.firstName) {
    const firstNameMapping = section1Mappings.mappings.find(m => 
      m.uiPath === 'section1.firstName'
    );
    if (firstNameMapping) {
      pdfFieldMap.set(firstNameMapping.pdfFieldId, section.firstName.value || '');
    }
  }
  
  // Map Middle Name field
  if (section.middleName) {
    const middleNameMapping = section1Mappings.mappings.find(m => 
      m.uiPath === 'section1.middleName'
    );
    if (middleNameMapping) {
      // Handle special cases for middle name
      let middleNameValue = section.middleName.value || '';
      
      // If explicitly marked as "No Middle Name" or "NMN", keep as is
      if (middleNameValue.toUpperCase() === 'NMN' || 
          middleNameValue.toUpperCase() === 'NO MIDDLE NAME') {
        middleNameValue = 'NMN';
      }
      
      pdfFieldMap.set(middleNameMapping.pdfFieldId, middleNameValue);
    }
  }
  
  // Map Suffix dropdown field
  if (section.suffix) {
    const suffixMapping = section1Mappings.mappings.find(m => 
      m.uiPath === 'section1.suffix'
    );
    if (suffixMapping) {
      pdfFieldMap.set(suffixMapping.pdfFieldId, section.suffix.value || '');
    }
  }
  
  return pdfFieldMap;
}

/**
 * Validates that Section 1 data is properly structured for PDF generation
 */
export function validateSection1ForPDF(section1Data: Section1): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!section1Data?.section1) {
    errors.push('Section 1 data is missing');
    return { isValid: false, errors };
  }
  
  const section = section1Data.section1;
  
  // Check required fields
  if (!section.lastName?.value?.trim()) {
    errors.push('Last Name is required');
  }
  
  if (!section.firstName?.value?.trim()) {
    errors.push('First Name is required');
  }
  
  // Validate name lengths
  if (section.lastName?.value && section.lastName.value.length > 50) {
    errors.push('Last Name exceeds maximum length of 50 characters');
  }
  
  if (section.firstName?.value && section.firstName.value.length > 50) {
    errors.push('First Name exceeds maximum length of 50 characters');
  }
  
  if (section.middleName?.value && section.middleName.value.length > 50) {
    errors.push('Middle Name exceeds maximum length of 50 characters');
  }
  
  // Validate name characters
  const namePattern = /^[a-zA-Z\s\-'\.]*$/;
  
  if (section.lastName?.value && !namePattern.test(section.lastName.value)) {
    errors.push('Last Name contains invalid characters');
  }
  
  if (section.firstName?.value && !namePattern.test(section.firstName.value)) {
    errors.push('First Name contains invalid characters');
  }
  
  if (section.middleName?.value && 
      section.middleName.value !== 'NMN' && 
      section.middleName.value.toUpperCase() !== 'NO MIDDLE NAME' &&
      !namePattern.test(section.middleName.value)) {
    errors.push('Middle Name contains invalid characters');
  }
  
  // Validate suffix if provided
  const validSuffixes = ['Jr', 'Sr', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'Other'];
  if (section.suffix?.value && !validSuffixes.includes(section.suffix.value)) {
    errors.push(`Invalid suffix. Must be one of: ${validSuffixes.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get statistics about Section 1 PDF mapping
 */
export function getSection1MappingStats(): {
  totalFields: number;
  requiredFields: number;
  optionalFields: number;
} {
  return {
    totalFields: 4, // lastName, firstName, middleName, suffix
    requiredFields: 2, // lastName and firstName are required
    optionalFields: 2 // middleName and suffix are optional
  };
}