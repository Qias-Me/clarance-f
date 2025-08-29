/**
 * Section 5 - Other Names Used PDF Mapper
 * Maps Section 5 data to PDF field structure using canonical JSON mappings
 */

import type { Section5 } from '../../api/interfaces/section-interfaces/section5';
import section5Mappings from '../../api/mappings/section-5-mappings.json';

// Flatten Section 5 data into uiPath -> value pairs matching the mapping JSON
function flattenSection5(section5Data: Section5): Record<string, any> {
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

  walk(section5Data.section5, 'section5.');
  return out;
}

export function mapSection5ToPDFFields(section5Data: Section5): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();
  if (!section5Data?.section5) return pdfFieldMap;

  const flat = flattenSection5(section5Data);

  for (const mapping of (section5Mappings as any).mappings as Array<{ uiPath: string; pdfFieldId: string }>) {
    const value = flat[mapping.uiPath];
    if (value !== undefined && value !== null) {
      pdfFieldMap.set(mapping.pdfFieldId, value);
    }
  }

  return pdfFieldMap;
}

export function getSection5MappingStats(section5Data: Section5): {
  totalFields: number;
  mappedFields: number;
} {
  const total = (section5Mappings as any)?.summary?.totalMappings ?? 45;
  const mapped = mapSection5ToPDFFields(section5Data).size;
  return { totalFields: total, mappedFields: mapped };
}

