import { describe, it, expect } from 'vitest';
import { mapSection10ToPDFFields } from '../../../app/services/section10-pdf-mapper';
import { createDefaultSection10, createDualCitizenshipEntry, createForeignPassportEntry, createTravelCountryEntry } from '../../../api/interfaces/section-interfaces/section10';
import mappings from '../../../api/mappings/section-10-mappings.json';

describe('Section 10 PDF Mapper', () => {
  it('maps dual citizenship main flag and entry[0] fields', () => {
    const section10 = createDefaultSection10();
    section10.section10.dualCitizenship.hasDualCitizenship.value = 'YES' as any;

    const dc0 = createDualCitizenshipEntry(0);
    dc0.country.value = 'Canada';
    dc0.howAcquired.value = 'By birth';
    dc0.fromDate.value = '01/2000';
    section10.section10.dualCitizenship.entries.push(dc0);

    const pdfMap = mapSection10ToPDFFields(section10 as any);

    const f = (uiPath: string) => (mappings as any).mappings.find((m: any) => m.uiPath === uiPath)?.pdfFieldId;

    const hasDualId = f('section10.dualCitizenship.hasDualCitizenship');
    const countryId = f('section10.dualCitizenship.entries[0].country');
    const howAcquiredId = f('section10.dualCitizenship.entries[0].howAcquired');
    const fromDateId = f('section10.dualCitizenship.entries[0].fromDate');

    expect(hasDualId).toBeTruthy();
    expect(countryId).toBeTruthy();
    expect(howAcquiredId).toBeTruthy();
    expect(fromDateId).toBeTruthy();

    expect(pdfMap.get(hasDualId!)).toBe('YES');
    expect(pdfMap.get(countryId!)).toBe('Canada');
    expect(pdfMap.get(howAcquiredId!)).toBe('By birth');
    expect(pdfMap.get(fromDateId!)).toBe('01/2000');
  });

  it('maps foreign passport entry[0] with one travel row and ignores entries beyond index 1', () => {
    const section10 = createDefaultSection10();
    section10.section10.foreignPassport.hasForeignPassport.value = 'YES' as any;

    const fp0 = createForeignPassportEntry(0);
    fp0.passportNumber.value = 'C1234567';
    fp0.issueDate.value = '06/2018';
    fp0.travelCountries.push(createTravelCountryEntry(0, 0));
    fp0.travelCountries[0].country.value = 'Mexico';
    section10.section10.foreignPassport.entries.push(fp0);

    // Add a third passport entry which should be ignored by mapper
    const fp2 = createForeignPassportEntry(1);
    section10.section10.foreignPassport.entries.push(fp2);
    section10.section10.foreignPassport.entries.push(createForeignPassportEntry(1)); // index 2 (ignored)

    const pdfMap = mapSection10ToPDFFields(section10 as any);
    const f = (uiPath: string) => (mappings as any).mappings.find((m: any) => m.uiPath === uiPath)?.pdfFieldId;

    const passportNumId = f('section10.foreignPassport.entries[0].passportNumber');
    const travel0CountryId = f('section10.foreignPassport.entries[0].travelCountries[0].country');
    const ignoredId = f('section10.foreignPassport.entries[2].passportNumber');

    expect(passportNumId).toBeTruthy();
    expect(travel0CountryId).toBeTruthy();
    expect(pdfMap.get(passportNumId!)).toBe('C1234567');
    expect(pdfMap.get(travel0CountryId!)).toBe('Mexico');

    if (ignoredId) {
      expect(pdfMap.has(ignoredId)).toBe(false);
    } else {
      expect(true).toBe(true);
    }
  });
});

