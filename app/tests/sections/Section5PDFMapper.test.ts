import { describe, it, expect } from 'vitest';
import { createDefaultSection5 } from '../../../api/interfaces/section-interfaces/section5';
import { mapSection5ToPDFFields } from '../../../app/services/section5-pdf-mapper';
import mappings from '../../../api/mappings/section-5-mappings.json';

describe('Section 5 PDF Mapper', () => {
  it('maps hasOtherNames and first other name entry fields', () => {
    const section5 = createDefaultSection5();
    section5.section5.hasOtherNames.value = 'YES' as any;
    const e0 = section5.section5.otherNames[0];
    e0.lastName.value = 'Doe';
    e0.firstName.value = 'Jane';
    e0.from.value = '01/2010';

    const pdfMap = mapSection5ToPDFFields(section5 as any);
    const f = (uiPath: string) => (mappings as any).mappings.find((m: any) => m.uiPath === uiPath)?.pdfFieldId;

    const hasOtherId = f('section5.hasOtherNames');
    const lastNameId = f('section5.otherNames[0].lastName');
    const fromId = f('section5.otherNames[0].from');

    expect(hasOtherId).toBeTruthy();
    expect(lastNameId).toBeTruthy();
    expect(fromId).toBeTruthy();

    expect(pdfMap.get(hasOtherId!)).toBe('YES');
    expect(pdfMap.get(lastNameId!)).toBe('Doe');
    expect(pdfMap.get(fromId!)).toBe('01/2010');
  });
});

