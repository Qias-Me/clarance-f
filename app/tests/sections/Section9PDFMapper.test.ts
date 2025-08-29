import { describe, it, expect } from 'vitest';
import { createDefaultSection9 } from '../../../api/interfaces/section-interfaces/section9';
import { mapSection9ToPDFFields } from '../../../app/services/section9-pdf-mapper';
import mappings from '../../../api/mappings/section-9-mappings.json';

describe('Section 9 PDF Mapper', () => {
  it('maps status and bornToUSParents document fields', () => {
    const section9 = createDefaultSection9();
    section9.section9.status.value = 'I am a U.S. citizen or national by birth to U.S. parent(s).';
    section9.section9.bornToUSParents.documentNumber.value = 'FS240-123456';

    const pdfMap = mapSection9ToPDFFields(section9 as any);
    const f = (uiPath: string) => (mappings as any).mappings.find((m: any) => m.uiPath === uiPath)?.pdfFieldId;

    const statusId = f('section9.section9.status');
    const docNumId = f('section9.section9.bornToUSParents.documentNumber');

    expect(statusId).toBeTruthy();
    expect(docNumId).toBeTruthy();
    expect(pdfMap.get(statusId!)).toBe('I am a U.S. citizen or national by birth to U.S. parent(s).');
    expect(pdfMap.get(docNumId!)).toBe('FS240-123456');
  });
});

