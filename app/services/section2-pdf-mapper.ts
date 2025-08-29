/**
 * Section 2 PDF Field Mapper
 * 
 * Handles the proper mapping of Section 2 (Date of Birth) data to PDF fields
 * Section 2 contains only date of birth and isEstimated checkbox
 */

import type { Section2 } from '../../api/interfaces/section-interfaces/section2';
import section2Mappings from '../../api/mappings/section-2-mappings.json';

/**
 * Maps Section 2 data to PDF fields
 * Handles date of birth and isEstimated checkbox only
 */
export function mapSection2ToPDFFields(section2Data: Section2): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();
  
  if (!section2Data?.section2) {
    return pdfFieldMap;
  }
  
  const section = section2Data.section2;
  
  // Map Date of Birth field
  if (section.date) {
    const dateMapping = section2Mappings.mappings.find(m => 
      m.uiPath === 'section2.date'
    );
    if (dateMapping) {
      // Ensure date is in MM/DD/YYYY format for PDF
      let dateValue = section.date.value || '';
      
      // Convert from various formats to MM/DD/YYYY
      if (dateValue && dateValue.includes('-')) {
        // Convert from YYYY-MM-DD to MM/DD/YYYY
        const [year, month, day] = dateValue.split('-');
        dateValue = `${month}/${day}/${year}`;
      }
      
      pdfFieldMap.set(dateMapping.pdfFieldId, dateValue);
    }
  }
  
  // Map isEstimated checkbox
  if (section.isEstimated) {
    const estimatedMapping = section2Mappings.mappings.find(m => 
      m.uiPath === 'section2.isEstimated'
    );
    if (estimatedMapping) {
      pdfFieldMap.set(estimatedMapping.pdfFieldId, section.isEstimated.value || false);
    }
  }
  
  return pdfFieldMap;
}

/**
 * Validates that Section 2 data is properly structured for PDF generation
 */
export function validateSection2ForPDF(section2Data: Section2): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!section2Data?.section2) {
    errors.push('Section 2 data is missing');
    return { isValid: false, errors };
  }
  
  const section = section2Data.section2;
  
  // Check required date field
  if (!section.date?.value?.trim()) {
    errors.push('Date of Birth is required');
  } else {
    // Validate date format
    const dateValue = section.date.value;
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (!dateRegex.test(dateValue) && !isoRegex.test(dateValue)) {
      errors.push('Date must be in MM/DD/YYYY or YYYY-MM-DD format');
    }
    
    // Validate date is reasonable (not in future, not too far in past)
    const dateParts = dateValue.includes('/') 
      ? dateValue.split('/') 
      : dateValue.split('-').reverse();
      
    if (dateParts.length === 3) {
      const year = parseInt(dateValue.includes('/') ? dateParts[2] : dateParts[0]);
      const currentYear = new Date().getFullYear();
      
      if (year > currentYear) {
        errors.push('Date of Birth cannot be in the future');
      } else if (year < 1900) {
        errors.push('Date of Birth cannot be before 1900');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;
  
  // Parse date (handle both MM/DD/YYYY and YYYY-MM-DD formats)
  let year, month, day;
  
  if (dateOfBirth.includes('/')) {
    // MM/DD/YYYY format
    const parts = dateOfBirth.split('/');
    month = parseInt(parts[0]) - 1; // JavaScript months are 0-indexed
    day = parseInt(parts[1]);
    year = parseInt(parts[2]);
  } else if (dateOfBirth.includes('-')) {
    // YYYY-MM-DD format
    const parts = dateOfBirth.split('-');
    year = parseInt(parts[0]);
    month = parseInt(parts[1]) - 1;
    day = parseInt(parts[2]);
  } else {
    return null;
  }
  
  const birthDate = new Date(year, month, day);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get statistics about Section 2 PDF mapping
 */
export function getSection2MappingStats(): {
  totalFields: number;
  requiredFields: number;
  optionalFields: number;
} {
  return {
    totalFields: 2, // date, isEstimated
    requiredFields: 1, // date is required
    optionalFields: 1 // isEstimated is optional
  };
}