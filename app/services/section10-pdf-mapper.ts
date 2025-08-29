/**
 * Section 10 PDF Field Mapper
 * 
 * Handles the proper mapping of Section 10 (Dual/Multiple Citizenship & Foreign Passport) data to PDF fields
 * Section 10 contains 122 fields for dual citizenship and foreign passport information:
 * - Main questions (has dual citizenship, has foreign passport)
 * - Dual Citizenship entries (up to 2 entries with detailed information)
 * - Foreign Passport entries (up to 2 entries with travel history)
 */

import type { Section10 } from '../../api/interfaces/section-interfaces/section10';
import section10Mappings from '../../api/mappings/section-10-mappings.json';

/**
 * Maps Section 10 data to PDF fields
 * Handles all 122 dual citizenship and foreign passport fields
 */
export function mapSection10ToPDFFields(section10Data: Section10): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();
  
  if (!section10Data?.section10) {
    return pdfFieldMap;
  }
  
  const section = section10Data.section10;
  
  // ============================================================================
  // DUAL CITIZENSHIP SECTION (10.1)
  // ============================================================================
  
  // Map main dual citizenship question
  if (section.dualCitizenship?.hasDualCitizenship) {
    const mapping = section10Mappings.mappings.find(m => 
      m.uiPath === 'section10.dualCitizenship.hasDualCitizenship'
    );
    if (mapping) {
      const value = section.dualCitizenship.hasDualCitizenship.value;
      // Convert boolean to YES/NO string for PDF
      const pdfValue = value === 'YES' ? 'YES' : 
                      value === 'NO' ? 'NO (If NO, proceed to 10.2)' : 
                      value === true ? 'YES' : 
                      value === false ? 'NO (If NO, proceed to 10.2)' : '';
      pdfFieldMap.set(mapping.pdfFieldId, pdfValue);
    }
  }
  
  // Map dual citizenship entries (up to 2)
  if (section.dualCitizenship?.entries && Array.isArray(section.dualCitizenship.entries)) {
    section.dualCitizenship.entries.forEach((entry, index) => {
      if (index >= 2) return; // Only 2 entries supported in PDF
      
      // Country
      mapField(pdfFieldMap, `section10.dualCitizenship.entries[${index}].country`, 
        entry.country?.value);
      
      // How acquired
      mapField(pdfFieldMap, `section10.dualCitizenship.entries[${index}].howAcquired`, 
        entry.howAcquired?.value);
      
      // From date and estimate checkbox
      mapField(pdfFieldMap, `section10.dualCitizenship.entries[${index}].fromDate`, 
        formatDate(entry.fromDate?.value));
      mapField(pdfFieldMap, `section10.dualCitizenship.entries[${index}].isFromEstimated`, 
        entry.isFromEstimated?.value);
      
      // To date and estimate checkbox
      mapField(pdfFieldMap, `section10.dualCitizenship.entries[${index}].toDate`, 
        formatDate(entry.toDate?.value));
      mapField(pdfFieldMap, `section10.dualCitizenship.entries[${index}].isToEstimated`, 
        entry.isToEstimated?.value);
      
      // Present checkbox
      mapField(pdfFieldMap, `section10.dualCitizenship.entries[${index}].isPresent`, 
        entry.isPresent?.value);
      
      // Has renounced
      mapField(pdfFieldMap, `section10.dualCitizenship.entries[${index}].hasRenounced`, 
        formatYesNo(entry.hasRenounced?.value));
      mapField(pdfFieldMap, `section10.dualCitizenship.entries[${index}].renounceExplanation`, 
        entry.renounceExplanation?.value);
      
      // Has taken action
      mapField(pdfFieldMap, `section10.dualCitizenship.entries[${index}].hasTakenAction`, 
        formatYesNo(entry.hasTakenAction?.value));
      mapField(pdfFieldMap, `section10.dualCitizenship.entries[${index}].actionExplanation`, 
        entry.actionExplanation?.value);
    });
  }
  
  // ============================================================================
  // FOREIGN PASSPORT SECTION (10.2)
  // ============================================================================
  
  // Map main foreign passport question
  if (section.foreignPassport?.hasForeignPassport) {
    const mapping = section10Mappings.mappings.find(m => 
      m.uiPath === 'section10.foreignPassport.hasForeignPassport'
    );
    if (mapping) {
      const value = section.foreignPassport.hasForeignPassport.value;
      // Convert boolean to YES/NO string for PDF
      const pdfValue = value === 'YES' ? 'YES' : 
                      value === 'NO' ? 'NO' : 
                      value === true ? 'YES' : 
                      value === false ? 'NO' : '';
      pdfFieldMap.set(mapping.pdfFieldId, pdfValue);
    }
  }
  
  // Map foreign passport entries (up to 2)
  if (section.foreignPassport?.entries && Array.isArray(section.foreignPassport.entries)) {
    section.foreignPassport.entries.forEach((entry, passportIndex) => {
      if (passportIndex >= 2) return; // Only 2 passport entries supported in PDF
      
      // Country
      mapField(pdfFieldMap, `section10.foreignPassport.entries[${passportIndex}].country`, 
        entry.country?.value);
      
      // Issue date and estimate checkbox
      mapField(pdfFieldMap, `section10.foreignPassport.entries[${passportIndex}].issueDate`, 
        formatDate(entry.issueDate?.value));
      mapField(pdfFieldMap, `section10.foreignPassport.entries[${passportIndex}].isIssueDateEstimated`, 
        entry.isIssueDateEstimated?.value);
      
      // Issue location
      mapField(pdfFieldMap, `section10.foreignPassport.entries[${passportIndex}].city`, 
        entry.city?.value);
      mapField(pdfFieldMap, `section10.foreignPassport.entries[${passportIndex}].country2`, 
        entry.country2?.value);
      
      // Name on passport
      mapField(pdfFieldMap, `section10.foreignPassport.entries[${passportIndex}].lastName`, 
        entry.lastName?.value);
      mapField(pdfFieldMap, `section10.foreignPassport.entries[${passportIndex}].firstName`, 
        entry.firstName?.value);
      mapField(pdfFieldMap, `section10.foreignPassport.entries[${passportIndex}].middleName`, 
        entry.middleName?.value);
      mapField(pdfFieldMap, `section10.foreignPassport.entries[${passportIndex}].suffix`, 
        entry.suffix?.value);
      
      // Passport details
      mapField(pdfFieldMap, `section10.foreignPassport.entries[${passportIndex}].passportNumber`, 
        entry.passportNumber?.value);
      mapField(pdfFieldMap, `section10.foreignPassport.entries[${passportIndex}].expirationDate`, 
        formatDate(entry.expirationDate?.value));
      mapField(pdfFieldMap, `section10.foreignPassport.entries[${passportIndex}].isExpirationDateEstimated`, 
        entry.isExpirationDateEstimated?.value);
      
      // Used for US entry
      mapField(pdfFieldMap, `section10.foreignPassport.entries[${passportIndex}].usedForUSEntry`, 
        entry.usedForUSEntry?.value);
      
      // Travel countries (up to 6 per passport)
      if (entry.travelCountries && Array.isArray(entry.travelCountries)) {
        entry.travelCountries.forEach((travel, travelIndex) => {
          if (travelIndex >= 6) return; // Only 6 travel entries per passport
          
          // Map travel country fields
          const basePath = `section10.foreignPassport.entries[${passportIndex}].travelCountries[${travelIndex}]`;
          
          mapField(pdfFieldMap, `${basePath}.country`, travel.country?.value);
          mapField(pdfFieldMap, `${basePath}.fromDate`, formatDate(travel.fromDate?.value));
          mapField(pdfFieldMap, `${basePath}.isFromDateEstimated`, travel.isFromDateEstimated?.value);
          mapField(pdfFieldMap, `${basePath}.toDate`, formatDate(travel.toDate?.value));
          mapField(pdfFieldMap, `${basePath}.isToDateEstimated`, travel.isToDateEstimated?.value);
          mapField(pdfFieldMap, `${basePath}.isPresent`, travel.isPresent?.value);
        });
      }
    });
  }
  
  return pdfFieldMap;
}

/**
 * Helper function to map a field value to the PDF field map
 */
function mapField(pdfFieldMap: Map<string, any>, uiPath: string, value: any): void {
  if (value === undefined || value === null) return;
  
  // Find the mapping for this UI path
  const mapping = section10Mappings.mappings.find(m => m.uiPath === uiPath);
  if (mapping) {
    pdfFieldMap.set(mapping.pdfFieldId, value);
  }
}

/**
 * Format date value for PDF
 */
function formatDate(dateValue: any): string {
  if (!dateValue) return '';
  
  // If already in MM/DD/YYYY format, return as is
  if (typeof dateValue === 'string' && dateValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return dateValue;
  }
  
  // If in ISO format (YYYY-MM-DD), convert to MM/DD/YYYY
  if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateValue.split('-');
    return `${month}/${day}/${year}`;
  }
  
  // If it's a Date object, format it
  if (dateValue instanceof Date) {
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getDate()).padStart(2, '0');
    const year = dateValue.getFullYear();
    return `${month}/${day}/${year}`;
  }
  
  return String(dateValue);
}

/**
 * Format Yes/No value for PDF radio buttons
 */
function formatYesNo(value: any): string {
  if (value === true || value === 'true' || value === 'YES' || value === 'Yes' || value === 'yes' || value === 1) {
    return 'YES';
  }
  if (value === false || value === 'false' || value === 'NO' || value === 'No' || value === 'no' || value === 0) {
    return 'NO';
  }
  return '';
}

/**
 * Get statistics for Section 10 mapping
 */
export function getSection10MappingStats(section10Data: Section10): {
  totalFields: number;
  mappedFields: number;
  dualCitizenshipFields: number;
  foreignPassportFields: number;
  travelCountryFields: number;
} {
  const total = (section10Mappings as any)?.summary?.totalMappings ?? 122;
  const stats = {
    totalFields: total, // Total fields declared in mappings
    mappedFields: 0,
    dualCitizenshipFields: 0,
    foreignPassportFields: 0,
    travelCountryFields: 0
  };
  
  if (!section10Data?.section10) {
    return stats;
  }
  
  const section = section10Data.section10;
  
  // Count dual citizenship fields
  if (section.dualCitizenship?.hasDualCitizenship?.value) {
    stats.mappedFields++;
    stats.dualCitizenshipFields++;
  }
  
  if (section.dualCitizenship?.entries) {
    section.dualCitizenship.entries.forEach((entry, index) => {
      if (index >= 2) return;
      
      // Count each field in the entry
      const fields = [
        'country', 'howAcquired', 'fromDate', 'isFromEstimated',
        'toDate', 'isToEstimated', 'isPresent', 'hasRenounced',
        'renounceExplanation', 'hasTakenAction', 'actionExplanation'
      ];
      
      fields.forEach(field => {
        if (entry[field]?.value !== undefined) {
          stats.mappedFields++;
          stats.dualCitizenshipFields++;
        }
      });
    });
  }
  
  // Count foreign passport fields
  if (section.foreignPassport?.hasForeignPassport?.value) {
    stats.mappedFields++;
    stats.foreignPassportFields++;
  }
  
  if (section.foreignPassport?.entries) {
    section.foreignPassport.entries.forEach((entry, index) => {
      if (index >= 2) return;
      
      // Count passport fields
      const passportFields = [
        'country', 'issueDate', 'isIssueDateEstimated', 'city', 'country2',
        'lastName', 'firstName', 'middleName', 'suffix', 'passportNumber',
        'expirationDate', 'isExpirationDateEstimated', 'usedForUSEntry'
      ];
      
      passportFields.forEach(field => {
        if (entry[field]?.value !== undefined) {
          stats.mappedFields++;
          stats.foreignPassportFields++;
        }
      });
      
      // Count travel countries
      if (entry.travelCountries) {
        entry.travelCountries.forEach((travel, travelIndex) => {
          if (travelIndex >= 6) return;
          
          const travelFields = [
            'country', 'fromDate', 'isFromDateEstimated',
            'toDate', 'isToDateEstimated', 'isPresent'
          ];
          
          travelFields.forEach(field => {
            if (travel[field]?.value !== undefined) {
              stats.mappedFields++;
              stats.travelCountryFields++;
            }
          });
        });
      }
    });
  }
  
  return stats;
}

/**
 * Validate Section 10 data before PDF generation
 */
export function validateSection10ForPDF(section10Data: Section10): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!section10Data?.section10) {
    errors.push('Section 10: No data provided');
    return { isValid: false, errors, warnings };
  }
  
  const section = section10Data.section10;
  
  // Check main questions are answered
  if (!section.dualCitizenship?.hasDualCitizenship?.value) {
    errors.push('Section 10.1: Dual citizenship question must be answered');
  }
  
  if (!section.foreignPassport?.hasForeignPassport?.value) {
    errors.push('Section 10.2: Foreign passport question must be answered');
  }
  
  // Validate dual citizenship entries
  if (section.dualCitizenship?.hasDualCitizenship?.value === 'YES' || 
      section.dualCitizenship?.hasDualCitizenship?.value === true) {
    if (!section.dualCitizenship.entries || section.dualCitizenship.entries.length === 0) {
      errors.push('Section 10.1: At least one dual citizenship entry required when answer is YES');
    } else {
      section.dualCitizenship.entries.forEach((entry, index) => {
        if (!entry.country?.value) {
          warnings.push(`Section 10.1 Entry ${index + 1}: Country is recommended`);
        }
        if (!entry.howAcquired?.value) {
          warnings.push(`Section 10.1 Entry ${index + 1}: How acquired is recommended`);
        }
        if (!entry.fromDate?.value) {
          warnings.push(`Section 10.1 Entry ${index + 1}: From date is recommended`);
        }
      });
    }
  }
  
  // Validate foreign passport entries
  if (section.foreignPassport?.hasForeignPassport?.value === 'YES' || 
      section.foreignPassport?.hasForeignPassport?.value === true) {
    if (!section.foreignPassport.entries || section.foreignPassport.entries.length === 0) {
      errors.push('Section 10.2: At least one foreign passport entry required when answer is YES');
    } else {
      section.foreignPassport.entries.forEach((entry, index) => {
        if (!entry.country?.value) {
          warnings.push(`Section 10.2 Entry ${index + 1}: Country is recommended`);
        }
        if (!entry.passportNumber?.value) {
          warnings.push(`Section 10.2 Entry ${index + 1}: Passport number is recommended`);
        }
        if (!entry.issueDate?.value) {
          warnings.push(`Section 10.2 Entry ${index + 1}: Issue date is recommended`);
        }
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
