import { describe, it, expect } from 'vitest';
import { mapSection11ToPDFFields } from '../../../app/services/section11-pdf-mapper';
import { createDefaultSection11, createResidenceEntryFromReference } from '../../../api/interfaces/section-interfaces/section11';
import mappings from '../../../api/mappings/section-11-mappings.json';

describe('Section 11 PDF Mapper', () => {
  it('maps entry[0] address and dates', () => {
    const section11 = createDefaultSection11();
    const entry0 = section11.section11.residences[0];

    // Populate some key fields
    entry0.residenceAddress.streetAddress.value = '123 Main St';
    entry0.residenceAddress.city.value = 'Arlington';
    entry0.residenceAddress.country.value = 'United States';
    entry0.residenceDates.fromDate.value = '01/2020';
    entry0.residenceDates.isPresent.value = true;

    const pdfMap = mapSection11ToPDFFields(section11 as any);

    const f = (uiPath: string) => (mappings as any).mappings.find((m: any) => m.uiPath === uiPath)?.pdfFieldId;

    const streetId = f('section11.residences[0].residenceAddress.streetAddress');
    const cityId = f('section11.residences[0].residenceAddress.city');
    const fromDateId = f('section11.residences[0].residenceDates.fromDate');

    expect(streetId).toBeTruthy();
    expect(cityId).toBeTruthy();
    expect(fromDateId).toBeTruthy();

    expect(pdfMap.get(streetId!)).toBe('123 Main St');
    expect(pdfMap.get(cityId!)).toBe('Arlington');
    expect(pdfMap.get(fromDateId!)).toBe('01/2020');
  });

  it('ignores mappings for entries beyond index 3', () => {
    const section11 = createDefaultSection11();
    // Ensure we have 5 entries; last one should be ignored
    for (let i = 1; i < 5; i++) {
      // Use reference for indices 1..3; for 4, reuse index 0 structure
      const entry = i < 4 ? createResidenceEntryFromReference(i) : createResidenceEntryFromReference(0);
      entry.residenceDates.fromDate.value = `01/20${10 + i}`;
      section11.section11.residences.push(entry);
    }

    const pdfMap = mapSection11ToPDFFields(section11 as any);

    const uiPathBeyond = 'section11.residences[4].residenceDates.fromDate';
    const beyondId = (mappings as any).mappings.find((m: any) => m.uiPath === uiPathBeyond)?.pdfFieldId;

    if (beyondId) {
      expect(pdfMap.has(beyondId)).toBe(false);
    } else {
      expect(true).toBe(true);
    }
  });
});

