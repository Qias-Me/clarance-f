/**
 * Section 12 - Where You Went to School PDF Mapper
 * Maps Section 12 education data to PDF field structure
 */

import { Section12 } from '../../api/interfaces/section-interfaces/section12';
import section12Mappings from '../../api/mappings/section-12-mappings.json';
import { logger } from './Logger';

// Flatten Section 12 data into uiPath -> value pairs matching the mapping JSON
function flattenSection12(section12Data: Section12): Record<string, any> {
  const out: Record<string, any> = {};

  const walk = (obj: any, path: string) => {
    if (!obj) return;
    for (const key of Object.keys(obj)) {
      const val: any = (obj as any)[key];
      if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
          val.forEach((item, idx) => walk(item, `${path}${key}[${idx}].`));
        } else if ('value' in val) {
          out[`${path}${key}`] = val.value;
        } else {
          walk(val, `${path}${key}.`);
        }
      }
    }
  };

  walk(section12Data.section12, 'section12.');
  return out;
}

/**
 * Maps Section 12 data to PDF fields using canonical JSON mappings
 */
export function mapSection12ToPDFFields(section12Data: Section12): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();

  if (!section12Data?.section12) {
    logger.warn('No Section 12 data provided', 'Section12PDFMapper');
    return pdfFieldMap;
  }

  const flat = flattenSection12(section12Data);

  // Consider only first 4 entries (UI limit); mapping may contain extras
  const allowedPrefixes = new Set([
    'section12.entries[0].',
    'section12.entries[1].',
    'section12.entries[2].',
    'section12.entries[3].'
  ]);

  for (const mapping of section12Mappings.mappings as Array<{ uiPath: string; pdfFieldId: string }>) {
    if (mapping.uiPath.startsWith('section12.entries[')) {
      if (![...allowedPrefixes].some(p => mapping.uiPath.startsWith(p))) continue;
    }
    const value = flat[mapping.uiPath];
    if (value !== undefined && value !== null) {
      pdfFieldMap.set(mapping.pdfFieldId, value);
    }
  }

  logger.info('Section 12 PDF mapping complete', 'Section12PDFMapper', {
    totalFieldsMapped: pdfFieldMap.size
  });

  return pdfFieldMap;
}

/**
 * Validate Section 12 data for PDF generation
 */
export function validateSection12ForPDF(section12Data: Section12): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!section12Data?.section12) {
    errors.push('Section 12 data is missing');
    return { isValid: false, errors, warnings };
  }
  
  const section = section12Data.section12;
  
  // Check for required global questions
  if (!section.hasAttendedSchool) {
    errors.push('Has attended school question is required');
  }
  
  if (!section.hasAttendedSchoolOutsideUS) {
    errors.push('Has attended school outside US question is required');
  }
  
  // Validate school entries
  if (section.entries && section.entries.length > 0) {
    section.entries.forEach((entry, index) => {
      if (!entry.schoolName?.value) {
        warnings.push(`School ${index + 1}: School name is missing`);
      }
      if (!entry.schoolCity?.value) {
        warnings.push(`School ${index + 1}: City is missing`);
      }
      if (!entry.schoolCountry?.value) {
        warnings.push(`School ${index + 1}: Country is missing`);
      }
      if (!entry.fromDate?.value) {
        warnings.push(`School ${index + 1}: From date is missing`);
      }
      if (!entry.isPresent?.value && !entry.toDate?.value) {
        warnings.push(`School ${index + 1}: To date is missing for non-current school`);
      }
      if (!entry.schoolType?.value) {
        warnings.push(`School ${index + 1}: School type is missing`);
      }
      if (!entry.receivedDegree?.value) {
        warnings.push(`School ${index + 1}: Received degree question not answered`);
      }
      
      // Validate degrees if received
      if (entry.receivedDegree?.value === 'YES' && (!entry.degrees || entry.degrees.length === 0)) {
        warnings.push(`School ${index + 1}: Degree information missing despite answering YES to received degree`);
      }
      
      // Validate contact person for recent schools (if within last 3 years)
      const currentYear = new Date().getFullYear();
      const toYear = entry.toDate?.value ? parseInt(entry.toDate.value.substring(0, 4)) : currentYear;
      if (currentYear - toYear <= 3 && !entry.contactPerson) {
        warnings.push(`School ${index + 1}: Contact person recommended for schools attended in last 3 years`);
      }
    });
  } else if (section.hasAttendedSchool?.value === 'YES' || section.hasAttendedSchoolOutsideUS?.value === 'YES') {
    errors.push('School entries are required when attended school is YES');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get mapping statistics for Section 12
 */
export function getSection12MappingStats(section12Data: Section12): {
  totalFields: number;
  mappedFields: number;
  percentage: number;
  schoolStats: {
    total: number;
    complete: number;
    partial: number;
    empty: number;
  };
} {
  const pdfFieldMap = mapSection12ToPDFFields(section12Data);
  const totalPossibleFields = (section12Mappings as any)?.summary?.totalMappings ?? 150;
  
  let totalSchools = 0;
  let completeSchools = 0;
  let partialSchools = 0;
  let emptySchools = 0;
  
  if (section12Data?.section12?.entries) {
    section12Data.section12.entries.forEach(entry => {
      totalSchools++;
      
      const requiredFields = [
        entry.schoolName?.value,
        entry.schoolCity?.value,
        entry.schoolCountry?.value,
        entry.fromDate?.value,
        entry.schoolType?.value
      ];
      
      const filledFields = requiredFields.filter(f => f).length;
      
      if (filledFields === requiredFields.length) {
        completeSchools++;
      } else if (filledFields > 0) {
        partialSchools++;
      } else {
        emptySchools++;
      }
    });
  }
  
  return {
    totalFields: totalPossibleFields,
    mappedFields: pdfFieldMap.size,
    percentage: (pdfFieldMap.size / totalPossibleFields) * 100,
    schoolStats: {
      total: totalSchools,
      complete: completeSchools,
      partial: partialSchools,
      empty: emptySchools
    }
  };
}
