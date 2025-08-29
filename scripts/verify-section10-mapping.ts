import { mapSection10ToPDFFields, getSection10MappingStats } from "../app/services/section10-pdf-mapper";
import { createDefaultSection10, createDualCitizenshipEntry, createForeignPassportEntry, createTravelCountryEntry } from "../api/interfaces/section-interfaces/section10";

async function main() {
  const section10 = createDefaultSection10();

  // Populate dual citizenship main and one entry
  section10.section10.dualCitizenship.hasDualCitizenship.value = 'YES' as any;
  const dc0 = createDualCitizenshipEntry(0);
  dc0.country.value = 'Canada';
  dc0.howAcquired.value = 'By birth';
  dc0.fromDate.value = '01/2000';
  dc0.isPresent.value = true;
  section10.section10.dualCitizenship.entries.push(dc0);

  // Populate foreign passport main and one entry with one travel row
  section10.section10.foreignPassport.hasForeignPassport.value = 'YES' as any;
  const fp0 = createForeignPassportEntry(0);
  fp0.country.value = 'Canada';
  fp0.passportNumber.value = 'C1234567';
  fp0.issueDate.value = '06/2018';
  fp0.expirationDate.value = '06/2028';
  fp0.usedForUSEntry.value = false as any;
  fp0.travelCountries.push(createTravelCountryEntry(0, 0));
  fp0.travelCountries[0].country.value = 'Mexico';
  fp0.travelCountries[0].fromDate.value = '07/2019';
  fp0.travelCountries[0].toDate.value = '07/2019';
  section10.section10.foreignPassport.entries.push(fp0);

  const map = mapSection10ToPDFFields(section10 as any);
  const stats = getSection10MappingStats(section10 as any);

  console.log('Section 10 mapping size:', map.size);
  console.log('Mapping stats:', stats);
  let i = 0;
  for (const [k, v] of map.entries()) {
    console.log(`${k} => ${v}`);
    if (++i >= 12) break;
  }
}

main().catch(err => {
  console.error('verify-section10-mapping error:', err);
  process.exit(1);
});

