import { createDefaultSection8 } from "../api/interfaces/section-interfaces/section8";
import { mapSection8ToPDFFields, getSection8MappingStats } from "../app/services/section8-pdf-mapper";

async function main() {
  const section8 = createDefaultSection8();
  section8.section8.hasPassport.value = 'YES' as any;
  section8.section8.passportNumber.value = 'A12345678';
  section8.section8.nameOnPassport.lastName.value = 'Doe';
  section8.section8.nameOnPassport.firstName.value = 'John';
  section8.section8.dates.issueDate.date.value = '01/01/2015';
  section8.section8.dates.expirationDate.date.value = '01/01/2025';

  const map = mapSection8ToPDFFields(section8 as any);
  const stats = getSection8MappingStats(section8 as any);

  console.log('Section 8 mapping size:', map.size);
  console.log('Mapping stats:', stats);
  let i = 0;
  for (const [k, v] of map.entries()) {
    console.log(`${k} => ${v}`);
    if (++i >= 10) break;
  }
}

main().catch(err => {
  console.error('verify-section8-mapping error:', err);
  process.exit(1);
});

