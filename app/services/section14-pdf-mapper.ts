import type { Section14 } from '../../api/interfaces/section-interfaces/section14';
import section14Mappings from '../../api/mappings/section-14-mappings.json';

// Flatten Section 14 into uiPath -> value pairs matching the mapping JSON
function flattenSection14(section14Data: Section14): Record<string, any> {
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
  // Mapping JSON uses 'section14.*'
  walk(section14Data.section14 as any, 'section14.');
  return out;
}

export function mapSection14ToPDFFields(section14Data: Section14): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();
  if (!section14Data?.section14) return pdfFieldMap;

  const flat = flattenSection14(section14Data);
  for (const mapping of (section14Mappings as any).mappings as Array<{ uiPath: string; pdfFieldId: string }>) {
    const value = flat[mapping.uiPath];
    if (value !== undefined && value !== null) {
      pdfFieldMap.set(mapping.pdfFieldId, value);
    }
  }

  // Validate conditional logic
  validateSection14Logic(section14Data, pdfFieldMap);
  return pdfFieldMap;
}

/**
 * Validates Section 14 field logic and relationships
 */
function validateSection14Logic(section14Data: Section14, pdfFieldMap: Map<string, any>): void {
  const warnings: string[] = [];

  // Check if male born after 1959
  const bornMaleAfter1959 = section14Data.section14.bornMaleAfter1959?.value as any;
  const registrationStatus = section14Data.section14.registrationStatus?.value as any;
  const registrationNumber = section14Data.section14.registrationNumber?.value as any;
  const noRegistrationExplanation = section14Data.section14.noRegistrationExplanation?.value as any;
  const unknownStatusExplanation = section14Data.section14.unknownStatusExplanation?.value as any;

  // Validate registration logic
  if (bornMaleAfter1959 === 'Yes') {
    // If born male after 1959, should have registration status
    if (!registrationStatus) {
      warnings.push('Born male after 1959 but no registration status provided');
    }

    // If registered, should have registration number
    if (registrationStatus === 'Yes' || registrationStatus === 'YES') {
      if (!registrationNumber) {
        warnings.push('Registered for Selective Service but no registration number provided');
      }
      if (noRegistrationExplanation) {
        warnings.push('Has registration number but also has no-registration explanation');
      }
    }

    // If not registered, should have explanation
    if (registrationStatus === 'No' || registrationStatus === 'NO') {
      if (!noRegistrationExplanation) {
        warnings.push('Not registered for Selective Service but no explanation provided');
      }
      if (registrationNumber) {
        warnings.push('Not registered but has registration number');
      }
    }
  } else if (bornMaleAfter1959 === 'No') {
    // If not born male after 1959, shouldn't need registration info
    if (registrationNumber || noRegistrationExplanation || unknownStatusExplanation) {
      warnings.push('Not born male after 1959 but has registration-related information');
    }
  }

  // If status is unknown, should have explanation
  if (bornMaleAfter1959 === '1' || bornMaleAfter1959 === 'Unknown') {
    if (!unknownStatusExplanation) {
      warnings.push('Unknown status but no explanation provided');
    }
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Section 14 Validation Warnings:', warnings);
  }
}

/**
 * Get field statistics for Section 14
 */
export function getSection14FieldStats(section14Data: Section14): { totalFields: number; mappedFields: number } {
  const total = (section14Mappings as any)?.summary?.totalMappings ?? 5;
  const mapped = mapSection14ToPDFFields(section14Data).size;
  return { totalFields: total, mappedFields: mapped };
}

// Export type re-exported from interfaces
