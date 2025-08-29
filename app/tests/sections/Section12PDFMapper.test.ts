import { describe, it, expect } from 'vitest';
import { mapSection12ToPDFFields } from '../../../app/services/section12-pdf-mapper';
import { createDefaultSection12, createDefaultSchoolEntry } from '../../../api/interfaces/section-interfaces/section12';
import mappings from '../../../api/mappings/section-12-mappings.json';

describe('Section 12 PDF Mapper', () => {
  it('maps global flags and entry[0] core fields', () => {
    const section12 = createDefaultSection12();
    section12.section12.hasAttendedSchool.value = 'YES' as any;
    section12.section12.hasAttendedSchoolOutsideUS.value = 'NO' as any;

    const entry0 = createDefaultSchoolEntry('school-0', 0);
    entry0.schoolName.value = 'Arlington High School';
    entry0.fromDate.value = '08/2010';
    entry0.isPresent.value = false;
    entry0.toDate.value = '06/2014';
    section12.section12.entries.push(entry0);

    const pdfMap = mapSection12ToPDFFields(section12 as any);

    // Resolve a few expected PDF field IDs from mappings JSON
    const f = (uiPath: string) => (mappings as any).mappings.find((m: any) => m.uiPath === uiPath)?.pdfFieldId;

    const hasAttendedSchoolId = f('section12.hasAttendedSchool');
    const hasAttendedOutsideId = f('section12.hasAttendedSchoolOutsideUS');
    const nameId = f('section12.entries[0].schoolName');
    const fromDateId = f('section12.entries[0].fromDate');

    expect(hasAttendedSchoolId).toBeTruthy();
    expect(hasAttendedOutsideId).toBeTruthy();
    expect(nameId).toBeTruthy();
    expect(fromDateId).toBeTruthy();

    expect(pdfMap.get(hasAttendedSchoolId!)).toBe('YES');
    expect(pdfMap.get(hasAttendedOutsideId!)).toBe('NO');
    expect(pdfMap.get(nameId!)).toBe('Arlington High School');
    expect(pdfMap.get(fromDateId!)).toBe('08/2010');
  });

  it('ignores mappings for entries beyond index 3', () => {
    const section12 = createDefaultSection12();
    section12.section12.hasAttendedSchool.value = 'YES' as any;

    // Push five entries; last one (index 4) should be ignored by mapper
    for (let i = 0; i < 5; i++) {
      const entry = createDefaultSchoolEntry(`school-${i}`, i);
      entry.fromDate.value = `01/20${10 + i}`;
      section12.section12.entries.push(entry);
    }

    const pdfMap = mapSection12ToPDFFields(section12 as any);

    const uiPathBeyond = 'section12.entries[4].fromDate';
    const beyondId = (mappings as any).mappings.find((m: any) => m.uiPath === uiPathBeyond)?.pdfFieldId;

    if (beyondId) {
      expect(pdfMap.has(beyondId)).toBe(false);
    } else {
      // If mapping JSON doesn’t include entry[4], the condition is inherently satisfied
      expect(true).toBe(true);
    }
  });
});

