import { mapSection11ToPDFFields, getSection11MappingStats } from "../app/services/section11-pdf-mapper";
import { createResidenceEntryFromReference } from "../api/interfaces/section-interfaces/section11";

async function main() {
  // Build a minimal, valid Section 11 object using reference helpers
  const entry0 = createResidenceEntryFromReference(0);

  // Populate sample values
  entry0.residenceAddress.streetAddress.value = "123 Main St";
  entry0.residenceAddress.city.value = "Arlington";
  entry0.residenceAddress.state.value = "VA";
  entry0.residenceAddress.country.value = "United States";
  entry0.residenceAddress.zipCode.value = "22202";

  entry0.residenceDates.fromDate.value = "01/2015";
  entry0.residenceDates.isPresent.value = true;

  entry0.contactPersonName.firstName.value = "Alex";
  entry0.contactPersonName.lastName.value = "Neighbor";
  entry0.contactPersonPhones.daytimePhone.value = "555-123-4567";
  entry0.contactPersonEmail.email.value = "alex@example.com";

  const section11Data = {
    _id: Date.now(),
    section11: {
      residences: [entry0],
    },
  } as const;

  const map = mapSection11ToPDFFields(section11Data as any);
  const stats = getSection11MappingStats(section11Data as any);

  console.log("Section 11 mapping size:", map.size);
  console.log("Mapping stats:", stats);

  // Print a few sample mapped fields
  let i = 0;
  for (const [k, v] of map.entries()) {
    console.log(`${k} => ${v}`);
    if (++i >= 10) break;
  }
}

main().catch(err => {
  console.error("verify-section11-mapping error:", err);
  process.exit(1);
});

