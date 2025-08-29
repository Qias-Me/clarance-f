import { describe, it, expect } from 'vitest';
import { createDefaultSection8 } from '../../../api/interfaces/section-interfaces/section8';
import { mapSection8ToPDFFields } from '../../../app/services/section8-pdf-mapper';
import mappings from '../../../api/mappings/section-8-mappings.json';

describe('Section 8 PDF Mapper', () => {
  it('maps hasPassport, passportNumber, and name fields', () => {
    const section8 = createDefaultSection8();
    section8.section8.hasPassport.value = 'YES' as any;
    section8.section8.passportNumber.value = 'A12345678';
    section8.section8.nameOnPassport.lastName.value = 'Doe';
    section8.section8.nameOnPassport.firstName.value = 'John';

    const pdfMap = mapSection8ToPDFFields(section8 as any);
    const f = (uiPath: string) => (mappings as any).mappings.find((m: any) => m.uiPath === uiPath)?.pdfFieldId;

    const hasId = f('section8.hasPassport');
    const numId = f('section8.passportNumber');
    const lnId = f('section8.nameOnPassport.lastName');

    expect(hasId).toBeTruthy();
    expect(numId).toBeTruthy();
    expect(lnId).toBeTruthy();

    expect(pdfMap.get(hasId!)).toBe('YES');
    expect(pdfMap.get(numId!)).toBe('A12345678');
    expect(pdfMap.get(lnId!)).toBe('Doe');
  });
});

