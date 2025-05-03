import { Field } from "api/interfaces/formDefinition";


interface SchoolInfo {
  hasAttendedSchool: Field<"YES" | "NO">;
  hasReceivedDegree: Field<"YES" | "NO (If NO to 12(a) and 12(b), proceed to Section 13A)">;
  schoolEntry?: SchoolData[];
}

interface Phone {
  _id: number;
  dontKnowNumber: Field<"Yes" | "No">;
  isInternationalOrDSN: Field<"Yes" | "No">;
  number?: Field<string>;
  extension?: Field<string>;
  day: Field<"Yes" | "No">;
  night: Field<"Yes" | "No">;
}

interface SchoolData {
  _id: number;
  fromDate: Field<string>;
  toDate: Field<string>;
  present: Field<"Yes" | "No">;
  fromEst: Field<"Yes" | "No">;
  toEst: Field<"Yes" | "No">;
  schoolName: Field<string>;
  schoolAddress: Address;
  schoolType: Field<string>;
  knownPerson: KnownPerson;
  degreeReceived: Field<"YES" | "NO">;
  degrees: Degree[];
}

interface Address {
  street: Field<string>;
  city: Field<string>;
  state: Field<string>;
  zipCode: Field<string>;
  country: Field<string>;
}

interface KnownPerson {
  dontKnowName: Field<"Yes" | "No">;
  firstName: Field<string>;
  lastName: Field<string>;
  address: Address;
  phoneNumber: Phone;
  email: Field<string>;
  dontKnowEmail: Field<"Yes" | "No">;
}

interface Degree {
  _id: number;
  type: Field<string>;
  dateAwarded: Field<string>;
  est: Field<"Yes" | "No">;
  otherDegree: Field<string>;
}

export type { SchoolInfo, SchoolData, Address, Degree, KnownPerson, Phone };
