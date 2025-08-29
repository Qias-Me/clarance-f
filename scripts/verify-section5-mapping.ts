import { createDefaultSection5 } from "../api/interfaces/section-interfaces/section5";
import { mapSection5ToPDFFields, getSection5MappingStats } from "../app/services/section5-pdf-mapper";

async function main() {
  const section5 = createDefaultSection5();
  section5.section5.hasOtherNames.value = 'YES' as any;

  // Populate first other name entry
  const e0 = section5.section5.otherNames[0];
  e0.lastName.value = 'Doe';
  e0.firstName.value = 'Jane';
  e0.middleName.value = 'A';
  e0.from.value = '01/2010';
  e0.to.value = '12/2012';
  e0.reasonChanged.value = 'Marriage';
  e0.present.value = false as any;
  e0.isMaidenName.value = 'NO' as any;

  const map = mapSection5ToPDFFields(section5 as any);
  const stats = getSection5MappingStats(section5 as any);

  console.log('Section 5 mapping size:', map.size);
  console.log('Mapping stats:', stats);
  let i = 0;
  for (const [k, v] of map.entries()) {
    console.log(`${k} => ${v}`);
    if (++i >= 12) break;
  }
}

main().catch(err => {
  console.error('verify-section5-mapping error:', err);
  process.exit(1);
});

