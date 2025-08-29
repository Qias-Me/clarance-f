import { describe, it, expect } from 'vitest';
import { createDefaultSection14 } from '../../../api/interfaces/section-interfaces/section14';
import { mapSection14ToPDFFields } from '../../../app/services/section14-pdf-mapper';
import mappings from '../../../api/mappings/section-14-mappings.json';

describe('Section 14 PDF Mapper', () => {
  it('maps bornMaleAfter1959, registrationStatus, and registrationNumber', () => {
    const section14 = createDefaultSection14();
    section14.section14.bornMaleAfter1959.value = 'YES' as any;
    section14.section14.registrationStatus.value = 'Yes' as any;
    section14.section14.registrationNumber.value = '1234567';

    const pdfMap = mapSection14ToPDFFields(section14 as any);
    const f = (uiPath: string) => (mappings as any).mappings.find((m: any) => m.uiPath === uiPath)?.pdfFieldId;

    const bornId = f('section14.bornMaleAfter1959');
    const statusId = f('section14.registrationStatus');
    const numId = f('section14.registrationNumber');

    expect(bornId).toBeTruthy();
    expect(statusId).toBeTruthy();
    expect(numId).toBeTruthy();

    expect(pdfMap.get(bornId!)).toBe('YES');
    expect(pdfMap.get(statusId!)).toBe('Yes');
    expect(pdfMap.get(numId!)).toBe('1234567');
  });
});

