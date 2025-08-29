import { mapSection12ToPDFFields, getSection12MappingStats } from "../app/services/section12-pdf-mapper";
import { createDefaultSection12, createDefaultSchoolEntry } from "../api/interfaces/section-interfaces/section12";

async function main() {
  const section12 = createDefaultSection12();

  // Add one sample school entry
  const entry0 = createDefaultSchoolEntry('school-0', 0);
  entry0.schoolName.value = 'Arlington High School';
  entry0.schoolAddress.value = '400 School Ln';
  entry0.schoolCity.value = 'Arlington';
  entry0.schoolState.value = 'VA';
  entry0.schoolCountry.value = 'United States';
  entry0.schoolZipCode.value = '22202';
  entry0.fromDate.value = '08/2010';
  entry0.isPresent.value = false;
  entry0.toDate.value = '06/2014';
  entry0.schoolType.value = 'High School';
  entry0.receivedDegree.value = 'YES';

  // degree sample
  entry0.degrees.push({
    degreeType: { ...entry0.degrees[0]?.degreeType, value: "High School Diploma", options: ["High School Diploma"] } as any,
    otherDegree: { ...entry0.schoolName, value: '' } as any,
    dateAwarded: { ...entry0.fromDate, value: '06/2014' } as any,
    dateAwardedEstimate: { ...entry0.isPresent, value: false } as any,
  } as any);

  // contact sample
  if (entry0.contactPerson) {
    entry0.contactPerson.firstName.value = 'Dana';
    entry0.contactPerson.lastName.value = 'Advisor';
    entry0.contactPerson.phoneNumber.value = '555-987-6543';
    entry0.contactPerson.email.value = 'advisor@example.com';
  }

  section12.section12.hasAttendedSchool.value = 'YES';
  section12.section12.hasAttendedSchoolOutsideUS.value = 'NO';
  section12.section12.entries.push(entry0);

  const map = mapSection12ToPDFFields(section12 as any);
  const stats = getSection12MappingStats(section12 as any);

  console.log('Section 12 mapping size:', map.size);
  console.log('Mapping stats:', stats);
  let i = 0;
  for (const [k, v] of map.entries()) {
    console.log(`${k} => ${v}`);
    if (++i >= 12) break;
  }
}

main().catch(err => {
  console.error('verify-section12-mapping error:', err);
  process.exit(1);
});

