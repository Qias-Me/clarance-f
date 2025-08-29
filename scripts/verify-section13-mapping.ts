import { mapSection13ToPDFFields, getSection13MappingStats } from "../app/services/section13-pdf-mapper";

// Build a minimal Section 13 object with a few populated fields
const section13: any = {
  _id: 13,
  section13: {
    militaryEmployment: { entries: [ { supervisor: { name: { value: 'Col. Smith' } } } ] },
    nonFederalEmployment: { entries: [ { employer: { value: 'Acme Corp' }, address: { city: { value: 'Arlington' } } } ] },
    selfEmployment: { entries: [] },
    unemployment: { entries: [] },
    employmentRecordIssues: {},
    disciplinaryActions: {},
    federalInfo: {},
    employmentType: { value: 'Military Service' },
    entries: []
  }
};

const map = mapSection13ToPDFFields(section13);
const stats = getSection13MappingStats(section13);

console.log('Section 13 mapping size:', map.size);
console.log('Mapping stats:', stats);
let i = 0;
for (const [k, v] of map.entries()) {
  console.log(`${k} => ${v}`);
  if (++i >= 12) break;
}

