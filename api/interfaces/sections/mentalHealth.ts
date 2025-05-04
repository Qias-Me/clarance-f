import { type Field } from "api/interfaces/formDefinition";

interface Address {
  street: Field<string>;
  city: Field<string>;
  state: Field<string>;
  zipCode: Field<string>;
  country: Field<string>;
}

interface CourtAgency {
  name: Field<string>;
  address: Address;
}

interface Section21A {
  dateOccurred: Field<string>;
  estimated: Field<"YES" | "NO">;
  courtAgency: CourtAgency;
  appealed: Field<"YES" | "NO">;
  appeals?: Appeal[];
}

interface Appeal {
  _id: number;
  courtAgency: CourtAgency;
  finalDisposition: Field<string>;
}

interface Section21B {
  dateOccurred: Field<string>;
  estimated: Field<"YES" | "NO">;
  courtAgency: CourtAgency;
  finalDisposition: Field<string>;
  appealed: Field<"YES" | "NO">;
  appeals?: Appeal[];
}

interface Section21C {
  voluntary: Field<"YES" | "NO">;
  explanation: Field<string>;
  facility: Facility;
  fromDate: Field<string>; // Month/Year
  toDate: Field<string>; // Month/Year
  present: Field<"YES" | "NO">;
  estimatedFrom: Field<"YES" | "NO">;
  estimatedTo: Field<"YES" | "NO">;
}

interface Facility {
  name: Field<string>;
  address: Address;
}

interface Section21D {
  diagnosis: Field<string>;
  datesOfDiagnosis: {
    fromDate: Field<string>;
    toDate: Field<string>;
    present: Field<"YES" | "NO">;
    estimatedFrom: Field<"YES" | "NO">;
    estimatedTo: Field<"YES" | "NO">;
  };
  healthCareProfessional: HealthCareProfessional;
  agencyOrFacility: AgencyOrFacility;
  counselingEffective: Field<"YES" | "NO">;
  counselingExplanation?: Field<string>;
}

interface HealthCareProfessional {
  name: Field<string>;
  telephoneFieldNumber: Field<string>;
  extension: Field<string>;
  day: Field<"YES" | "NO">;
  night: Field<"YES" | "NO">;
  internationalOrDsnPhoneFieldNumber: Field<"YES" | "NO">;
  address: Address;
}

interface AgencyOrFacility {
  name: Field<string>;
  address: Address;
  telephoneFieldNumber: Field<string>;
  extension: Field<string>;
  day: Field<"YES" | "NO">;
  night: Field<"YES" | "NO">;
  internationalOrDsnPhoneFieldNumber: Field<"YES" | "NO">;
}

interface Section21D1 {
  healthCareProfessional: HealthCareProfessional;
}

interface Section21E {
  fromDate: Field<string>; // Month/Year
  toDate: Field<string>; // Month/Year
  present: Field<"YES" | "NO">;
  estimatedFrom: Field<"YES" | "NO">;
  estimatedTo: Field<"YES" | "NO">;
  healthCareProfessional: HealthCareProfessional;
  agencyOrFacility: AgencyOrFacility;
  choseNotToFollow: Field<"YES" | "NO">;
  explanation?: Field<string>;
}

interface MentalHealth {
  _id: number;
  declaredMentallyIncompetent: Field<"YES" | "NO">; // (If NO, proceed to Section 21B)
  consultMentalHealth: Field<"YES" | "NO">; // (If NO, proceed to Section 21C)
  hospitalizedMentalHealth: Field<"YES" | "NO">; // (If NO, proceed to Section 21D)
  beenDiagnosed: Field<"YES" | "NO">; // (If NO, proceed to Section 21E)
  delayedTreatment: Field<"YES" | "NO">;
  currentlyInTreatment: Field<"YES" | "NO">; // If (NO, proceed to Section 21E)

  // Complete the following if you responded ‘No’ to 21A, 21B, 21C, and 21D (All). If ‘Yes’ was selected for either 21A, 21B, 21C, or 21D, proceed to Section 22.
  substantialAffects: Field<"YES" | "NO">;

  // Complete the following if you responded 'Yes' to having a mental health condition that adversely affects your judgment, reliability, or trustworthiness
  counseling: Field<"YES" | "NO">; // (If I decline to answer, proceed to Section 22)

  section21A?: Section21A[];
  section21B?: Section21B[];
  section21C?: Section21C[];
  section21D?: Section21D[];
  section21D1?: Section21D1[];
  section21E?: Section21E[];
}

export type {
  MentalHealth,
  Section21A,
  Section21B,
  Section21C,
  Section21D,
  Section21D1,
  Section21E,
  Address,
  CourtAgency,
  Appeal,
  Facility,
  HealthCareProfessional,
  AgencyOrFacility,
};
