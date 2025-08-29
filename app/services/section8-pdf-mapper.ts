/**
 * Section 8 - U.S. Passport Information PDF Mapper
 * Maps Section 8 data to PDF field structure using canonical JSON mappings
 */

import type { Section8 } from '../../api/interfaces/section-interfaces/section8';
import section8Mappings from '../../api/mappings/section-8-mappings.json';

// Flatten Section 8 data into uiPath -> value pairs matching the mapping JSON
function flattenSection8(section8Data: Section8): Record<string, any> {
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

  walk(section8Data.section8, 'section8.');
  return out;
}

export function mapSection8ToPDFFields(section8Data: Section8): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();
  if (!section8Data?.section8) return pdfFieldMap;

  const flat = flattenSection8(section8Data);

  for (const mapping of (section8Mappings as any).mappings as Array<{ uiPath: string; pdfFieldId: string }>) {
    const value = flat[mapping.uiPath];
    if (value !== undefined && value !== null) {
      pdfFieldMap.set(mapping.pdfFieldId, value);
    }
  }

  return pdfFieldMap;
}

export function getSection8MappingStats(section8Data: Section8): {
  totalFields: number;
  mappedFields: number;
} {
  const total = (section8Mappings as any)?.summary?.totalMappings ?? 10;
  const mapped = mapSection8ToPDFFields(section8Data).size;
  return { totalFields: total, mappedFields: mapped };
}

