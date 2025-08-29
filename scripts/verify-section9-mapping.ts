import { createDefaultSection9 } from "../api/interfaces/section-interfaces/section9";
import { mapSection9ToPDFFields } from "../app/services/section9-pdf-mapper";

async function main() {
  const section9 = createDefaultSection9();
  // Set a basic status and a few fields
  section9.section9.status.value = 'I am a U.S. citizen or national by birth to U.S. parent(s).';
  section9.section9.bornToUSParents.documentNumber.value = 'FS240-123456';
  section9.section9.bornToUSParents.nameOnDocument.lastName.value = 'Doe';
  section9.section9.bornToUSParents.nameOnDocument.firstName.value = 'Jane';

  const map = mapSection9ToPDFFields(section9 as any);
  console.log('Section 9 mapping size:', map.size);
  let i = 0;
  for (const [k, v] of map.entries()) {
    console.log(`${k} => ${v}`);
    if (++i >= 12) break;
  }
}

main().catch(err => {
  console.error('verify-section9-mapping error:', err);
  process.exit(1);
});

