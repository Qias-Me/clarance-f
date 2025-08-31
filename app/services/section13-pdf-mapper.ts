/**
 * Section 13 - PDF Mapper (minimal)
 * Maps Section 13 uiPath values to PDF field IDs using the canonical JSON mapping.
 */

import type { Section13 } from '../../api/interfaces/section-interfaces/section13';
import mappingsJson from '../../api/mappings/section-13-mappings.json';

function flattenSection13(section13Data: Section13): Record<string, any> {
  const out: Record<string, any> = {};

  const walk = (obj: any, path: string) => {
    if (!obj) return;
    // If this node itself is a Field<T>-like object, record it using the
    // current path (trim trailing dot if present) and stop descending.
    if (typeof obj === 'object' && obj !== null && 'value' in obj) {
      const key = path.endsWith('.') ? path.slice(0, -1) : path;
      out[key] = (obj as any).value;
      return;
    }
    for (const key of Object.keys(obj)) {
      const val = (obj as any)[key];
      if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
          val.forEach((item, idx) => walk(item, `${path}${key}[${idx}].`));
        } else {
          walk(val, `${path}${key}.`);
        }
      }
    }
  };

  walk(section13Data.section13, 'section13.');
  return out;
}

export function mapSection13ToPDFFields(section13Data: Section13): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();
  if (!section13Data?.section13) return pdfFieldMap;

  const flat = flattenSection13(section13Data);
  const mappings = (mappingsJson as any).mappings as Array<{ uiPath: string; pdfFieldId: string }>;
  for (const m of mappings) {
    const v = flat[m.uiPath];
    if (v !== undefined && v !== null) pdfFieldMap.set(m.pdfFieldId, v);
  }
  return pdfFieldMap;
}
