/**
 * Section 3 PDF Field Mapper
 * 
 * Handles the proper mapping of Section 3 (Place of Birth) data to PDF fields
 * Section 3 contains only place of birth information: city, county, country, and state
 */

import type { Section3 } from '../../api/interfaces/section-interfaces/section3';
import section3Mappings from '../../api/mappings/section-3-mappings.json';

/**
 * Maps Section 3 data to PDF fields
 * Handles place of birth fields (city, county, country, state)
 */
export function mapSection3ToPDFFields(section3Data: Section3): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();
  
  if (!section3Data?.section3) {
    return pdfFieldMap;
  }
  
  const section = section3Data.section3;
  
  // Map City field
  if (section.city) {
    const cityMapping = section3Mappings.mappings.find(m => 
      m.uiPath === 'section3.city'
    );
    if (cityMapping) {
      pdfFieldMap.set(cityMapping.pdfFieldId, section.city.value || '');
    }
  }
  
  // Map County field  
  if (section.county) {
    const countyMapping = section3Mappings.mappings.find(m => 
      m.uiPath === 'section3.county'
    );
    if (countyMapping) {
      pdfFieldMap.set(countyMapping.pdfFieldId, section.county.value || '');
    }
  }
  
  // Map Country dropdown field
  if (section.country) {
    const countryMapping = section3Mappings.mappings.find(m => 
      m.uiPath === 'section3.country'
    );
    if (countryMapping) {
      pdfFieldMap.set(countryMapping.pdfFieldId, section.country.value || 'United States');
    }
  }
  
  // Map State dropdown field (only for US births)
  if (section.state) {
    const stateMapping = section3Mappings.mappings.find(m => 
      m.uiPath === 'section3.state'
    );
    if (stateMapping) {
      // Only set state if country is United States
      const stateValue = section.country?.value === 'United States' ? (section.state.value || '') : '';
      pdfFieldMap.set(stateMapping.pdfFieldId, stateValue);
    }
  }
  
  return pdfFieldMap;
}

/**
 * Validates that Section 3 data is properly structured for PDF generation
 */
export function validateSection3ForPDF(section3Data: Section3): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!section3Data?.section3) {
    errors.push('Section 3 data is missing');
    return { isValid: false, errors };
  }
  
  const section = section3Data.section3;
  
  // Check required fields
  if (!section.city?.value?.trim()) {
    errors.push('City is required');
  }
  
  if (!section.country?.value?.trim()) {
    errors.push('Country is required');
  }
  
  // If country is United States, state is required
  if (section.country?.value === 'United States' && !section.state?.value?.trim()) {
    errors.push('State is required for US birth locations');
  }
  
  // Validate field lengths
  if (section.city?.value && section.city.value.length > 50) {
    errors.push('City name exceeds maximum length of 50 characters');
  }
  
  if (section.county?.value && section.county.value.length > 50) {
    errors.push('County name exceeds maximum length of 50 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get statistics about Section 3 PDF mapping
 */
export function getSection3MappingStats(): {
  totalFields: number;
  requiredFields: number;
  optionalFields: number;
} {
  return {
    totalFields: 4, // city, county, country, state
    requiredFields: 2, // city, country (state required only for US)
    optionalFields: 2 // county, state (when not US)
  };
}