/**
 * Section 11 - Where You Have Lived PDF Mapper
 * Maps Section 11 residence history data to PDF field structure (252 fields across 4 entries)
 */

import { Section11 } from '../../api/interfaces/section-interfaces/section11';
import section11Mappings from '../../api/mappings/section-11-mappings.json';
import { logger } from './Logger';

// Flattens Section 11 data into uiPath -> value pairs matching the mapping JSON
function flattenSection11(section11Data: Section11): Record<string, any> {
  const out: Record<string, any> = {};
  const base = 'section11.';

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

  walk(section11Data.section11, base);
  return out;
}

/**
 * Maps Section 11 data to PDF fields using canonical JSON mappings
 */
export function mapSection11ToPDFFields(section11Data: Section11): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();

  if (!section11Data?.section11) {
    logger.warn('No Section 11 data provided', 'Section11PDFMapper');
    return pdfFieldMap;
  }

  const flat = flattenSection11(section11Data);

  // Only consider first 4 residence entries as per PDF layout
  const allowedPrefixes = new Set([
    'section11.residences[0].',
    'section11.residences[1].',
    'section11.residences[2].',
    'section11.residences[3].'
  ]);

  for (const mapping of section11Mappings.mappings as Array<{ uiPath: string; pdfFieldId: string }>) {
    // Skip any paths beyond 4 entries for safety
    const prefix = mapping.uiPath.substring(0, mapping.uiPath.indexOf('residences[') + 'residences['.length + 2);
    if (mapping.uiPath.includes('residences[')) {
      if (![...allowedPrefixes].some(p => mapping.uiPath.startsWith(p))) continue;
    }

    const value = flat[mapping.uiPath];
    if (value !== undefined && value !== null) {
      pdfFieldMap.set(mapping.pdfFieldId, value);
    }
  }

  logger.info('Section 11 PDF mapping complete', 'Section11PDFMapper', {
    totalFieldsMapped: pdfFieldMap.size
  });

  return pdfFieldMap;
}

/**
 * Validate Section 11 data for PDF generation
 */
export function validateSection11ForPDF(section11Data: Section11): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!section11Data?.section11) {
    errors.push('Section 11 data is missing');
    return { isValid: false, errors, warnings };
  }
  
  const section = section11Data.section11;

  // Validate residence entries (presence and essential fields)
  if (section.residences && section.residences.length > 0) {
    section.residences.forEach((residence, index) => {
      const addr = residence.residenceAddress;
      const dates = residence.residenceDates;

      if (!addr?.streetAddress?.value) {
        warnings.push(`Residence ${index + 1}: Street address is missing`);
      }
      if (!addr?.city?.value) {
        warnings.push(`Residence ${index + 1}: City is missing`);
      }
      if (!addr?.country?.value) {
        warnings.push(`Residence ${index + 1}: Country is missing`);
      }
      if (!dates?.fromDate?.value) {
        warnings.push(`Residence ${index + 1}: From date is missing`);
      }
      if (!dates?.isPresent?.value && !dates?.toDate?.value) {
        warnings.push(`Residence ${index + 1}: To date is missing for non-current residence`);
      }
    });
  } else {
    errors.push('At least one residence entry is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get mapping statistics for Section 11
 */
export function getSection11MappingStats(section11Data: Section11): {
  totalFields: number;
  mappedFields: number;
  percentage: number;
  residenceStats: {
    total: number;
    complete: number;
    partial: number;
    empty: number;
  };
} {
  const pdfFieldMap = mapSection11ToPDFFields(section11Data);
  const totalPossibleFields = 252; // Total fields in Section 11

  let totalResidences = 0;
  let completeResidences = 0;
  let partialResidences = 0;
  let emptyResidences = 0;

  if (section11Data?.section11?.residences) {
    section11Data.section11.residences.forEach(residence => {
      totalResidences++;

      const addr = residence.residenceAddress;
      const dates = residence.residenceDates;
      const requiredFields = [
        addr?.streetAddress?.value,
        addr?.city?.value,
        addr?.country?.value,
        dates?.fromDate?.value
      ];

      const filledFields = requiredFields.filter(f => f).length;

      if (filledFields === requiredFields.length) {
        completeResidences++;
      } else if (filledFields > 0) {
        partialResidences++;
      } else {
        emptyResidences++;
      }
    });
  }

  return {
    totalFields: totalPossibleFields,
    mappedFields: pdfFieldMap.size,
    percentage: (pdfFieldMap.size / totalPossibleFields) * 100,
    residenceStats: {
      total: totalResidences,
      complete: completeResidences,
      partial: partialResidences,
      empty: emptyResidences
    }
  };
}
