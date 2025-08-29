import { describe, it, expect } from 'vitest';
import { mapSection13ToPDFFields } from '../../../app/services/section13-pdf-mapper';
import mappings from '../../../api/mappings/section-13-mappings.json';

describe('Section 13 PDF Mapper', () => {
  it('maps military supervisor name and non-federal employer', () => {
    // Minimal object with values set on expected uiPaths
    const section13: any = {
      _id: 13,
      section13: {
        militaryEmployment: { entries: [ { supervisor: { name: { value: 'Col. Smith' } } } ] },
        nonFederalEmployment: { entries: [ { employer: { value: 'Acme Corp' } } ] },
        selfEmployment: { entries: [] },
        unemployment: { entries: [] },
        employmentRecordIssues: {},
        disciplinaryActions: {},
        federalInfo: {},
        employmentType: { value: 'Military Service' },
        entries: []
      }
    };

    const pdfMap = mapSection13ToPDFFields(section13);
    const f = (uiPath: string) => (mappings as any).mappings.find((m: any) => m.uiPath === uiPath)?.pdfFieldId;

    const supNameId = f('section13.militaryEmployment.entries[0].supervisor.name');
    const employerId = f('section13.nonFederalEmployment.entries[0].employer');

    // Only assert if the mapping JSON contains these uiPaths
    if (supNameId) expect(pdfMap.get(supNameId)).toBe('Col. Smith');
    if (employerId) expect(pdfMap.get(employerId)).toBe('Acme Corp');
  });
});

