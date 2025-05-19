import {type Field } from "../formDefinition";

interface EmploymentInfo {
  _id: number;
  section13A?: Section13A[];
  section13B?: Section13B; // Undo Undefined Tagg
  section13C?: Section13C; // Undo Undefined Tagg
}

interface Section13A {
  _id: number;
  employmentActivity?: EmploymentActivity; // Undo Undefined Tagg
  otherExplanation?: Field<string>;
  section13A1?: Section13A1;
  section13A2?: Section13A2;
  section13A3?: Section13A3;
  section13A4?: Section13A4;
  section13A5?: Section13A5;
  section13A6?: Section13A6;
}

interface DateInfo {
  date: Field<string>;
  estimated: Field<"Yes" | "No">;
  present?: Field<"Yes" | "No">;
}

interface EmploymentEntry {
  _id: number;
  fromDate: Field<string>;
  toDate: Field<string>;
  present: Field<"Yes" | "No">;
  estimated: Field<"Yes" | "No">;
  agencyName: Field<string>;
  positionTitle: Field<string>;
  location: Address;
}

interface Section13B {
  hasFormerFederalEmployment: Field<"YES " | "NO (If NO, proceed to Section 13C)">;
  employmentEntries: EmploymentEntry[];
}

interface EmploymentRecord {
  fired: Field<"Yes" | "No">;
  quitAfterToldWouldBeFired: Field<"Yes" | "No">;
  leftByMutualAgreementMisconduct: Field<"Yes" | "No">;
  leftByMutualAgreementPerformance: Field<"Yes" | "No">;
  writtenWarning: Field<"Yes" | "No">;
}

interface Section13C {
  employmentRecordIssues: Field<"YES (If YES, you will be required to add an additional employment in Section 13A)" | "NO (If NO, proceed to Section 14)">;
  employmentRecord: EmploymentRecord;
}

type EmploymentActivity = Field<
  | "Active military duty station (Complete 13A.1, 13A.5 and 13A.6)"
  | "  National Guard/Reserve (Complete 13A.1, 13A.5 and 13A.6)"
  | "USPHS Commissioned Corps (Complete 13A.1, 13A.5 and 13A.6)"
  | "  Other Federal employment (Complete 13A.2, 13A.5 and 13A.6)"
  | "State Government (Non-Federal employment) (Complete 13A.2, 13A.5 and 13A.6) | Self-employment (Complete 13A.3, 13A.5 and 13A.6)"
  | " Unemployment (Complete 13A.4) Federal Contractor (Complete 13A.2, 13A.5 and 13A.6)"
  | "Non-government employment (excluding selfemployment) (Complete 13A.2, 13A.5 and 13A.6)"
  | "Other (Provide explanation and complete 13A.2, 13A.5 and 13A.6)"
>;

interface Section13A1 {
  fromDate: DateInfo;
  toDate: DateInfo;
  employmentStatus: EmploymentStatus;
  dutyStation: Field<string>;
  rankOrPosition: Field<string>;
  address: Address;
  telephone: Telephone;
  aLocation?: Address;
  supervisor: Supervisor13A1;
  hasAPOFPOAddress: Field<"YES " | "NO (If NO, proceed to (b))">;
  apoFPOAddress?: ApoFpoAddress;
}

interface Section13A2 {
  fromDate: DateInfo;
  toDate: DateInfo;
  employmentStatus: EmploymentStatus;
  positionTitle: Field<string>;
  employerName: Field<string>;
  employerAddress: Address;
  telephone: Telephone;
  periodsNotApplicable: Field<"Yes" | "No">;
  additionalPeriods: AdditionalPeriod[];
  physicalWorkAddress: PhysicalWorkAddress;
  supervisor: Supervisor13A2;
}

interface Section13A3 {
  fromDate: DateInfo;
  toDate: DateInfo;
  employmentStatus: EmploymentStatus;
  positionTitle: Field<string>;
  employmentName: Field<string>;
  employmentAddress: Address;
  telephone: Telephone;
  physicalWorkAddress: PhysicalWorkAddress;
  selfEmploymentVerifier: SelfEmploymentVerifier;
}

interface Section13A4 {
  fromDate: DateInfo;
  toDate: DateInfo;
  verifier: Verifier;
}

interface Section13A5 {
  reasonForLeaving: Field<string>;
  incidentInLastSevenYears: Field<"YES " | "NO (If NO, proceed to 13A.6)">;
  incidentDetails?: IncidentDetails[];
}

interface Section13A6 {
  warnedInLastSevenYears: Field<"YES" | "NO ">;
  warningDetails?: WarningDetails[];
}

interface IncidentDetails {
  type: IncidentType;
  reason: Field<string>;
  departureDate: Field<string>;
  estimated: Field<"Yes" | "No">;
}

interface WarningDetails {
  reason: Field<string>;
  date: DateInfo;
}

// type IncidentType = Field<
//   | "fired"
//   | "quit"
//   | "mutualAgreementMisconduct"
//   | "mutualAgreementUnsatisfactory"
// >;

type IncidentType = Field<"Yes" | "No">;

interface AdditionalPeriod {
  _id: number;
  fromDate: DateInfo;
  toDate: DateInfo;
  positionTitle: Field<string>;
  supervisor: Field<string>;
}

interface PhysicalWorkAddress {
  differentThanEmployer: Field<"YES" | "NO (If NO, proceed to (b))">;
  aLocation?: Address;
  hasApoFpoAddress: Field<"YES " | "NO">;
  b1Location?: Address;
  apoFpoAddress?: ApoFpoAddress;
  telephone: Telephone;
}

interface SelfEmploymentVerifier {
  lastName: Field<string>;
  firstName: Field<string>;
  address: Address;
  aLocation?: Address;
  telephone: Telephone;
  hasAPOFPOAddress: Field<"YES " | "NO">;
  apoFpoAddress?: ApoFpoAddress;
}

interface Verifier {
  hasApoFpoAddress: Field<"YES " | "NO">;
  apoFpoAddress: PartialApoFpoAddress;
  aLocation: Address;
  lastName: Field<string>;
  firstName: Field<string>;
  address: Address;
  telephone: Telephone;
}

interface EmploymentStatus {
  fullTime: Field<"Yes" | "No">;
  partTime: Field<"Yes" | "No">;
}

interface Address {
  street: Field<string>;
  city: Field<string>;
  state: Field<string>;
  zipCode: Field<string>;
  country: Field<string>;
}

interface Telephone {
  number: Field<string>;
  extension?: Field<string>;
  internationalOrDsn: Field<"Yes" | "No">;
  day: Field<"Yes" | "No">;
  night: Field<"Yes" | "No">;
}

interface ApoFpoAddress {
  street: Field<string>;
  apoOrFpo: Field<string>;
  apoFpoStateCode: Field<string>;
  zipCode: Field<string>;
}

interface PartialApoFpoAddress {
  dutyLocation: Field<string>;
  apoOrFpo: Field<string>;
  apoFpoStateCode: Field<string>;
  zipCode: Field<string>;
}


interface Supervisor13A1 {
  name: Field<string>;
  rankOrPosition: Field<string>;
  email: Field<string>;
  emailUnknown: Field<"Yes" | "No">;
  phone: Telephone;
  physicalWorkLocation: Address;
  apoFpoAddress?: Address;
}

interface Supervisor13A2 {
  name: Field<string>;
  rankOrPosition: Field<string>;
  email: Field<string>;
  emailUnknown: Field<"Yes" | "No">;
  phone: Telephone;
  hasAPOFPOAddress: Field<"YES " | "NO">;
  physicalWorkLocation: Address;
  aLocation?: Address;
  apoFPOAddress?: ApoFpoAddress;
}

export type {
  IncidentDetails,
  AdditionalPeriod,
  Address,
  ApoFpoAddress,
  Telephone,
  Verifier,
  EmploymentStatus,
  SelfEmploymentVerifier,
  PhysicalWorkAddress,
  WarningDetails,
  EmploymentInfo,
  IncidentType,
  Section13A1,
  Section13A2,
  Section13A3,
  Section13A4,
  Section13A5,
  Section13A6,
  Section13B,
  Section13C,
  Supervisor13A1,
  Supervisor13A2,
  EmploymentEntry,
};
