import { createDefaultSection14 } from "../api/interfaces/section-interfaces/section14";
import { mapSection14ToPDFFields, getSection14FieldStats } from "../app/services/section14-pdf-mapper";

async function main() {
  const section14 = createDefaultSection14();
  section14.section14.bornMaleAfter1959.value = 'YES' as any;
  section14.section14.registrationStatus.value = 'Yes' as any;
  section14.section14.registrationNumber.value = '123-45-6789';

  const map = mapSection14ToPDFFields(section14 as any);
  const stats = getSection14FieldStats(section14 as any);

  console.log('Section 14 mapping size:', map.size);
  console.log('Mapping stats:', stats);
  for (const [k, v] of map.entries()) {
    console.log(`${k} => ${v}`);
  }
}

main().catch(err => {
  console.error('verify-section14-mapping error:', err);
  process.exit(1);
});

