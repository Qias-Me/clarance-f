import { Field } from "../formDefinition";

interface RelationshipInfo {
  _id: number;
  neverEntered: Field<"Yes" | "No">;
  currentlyIn: Field<"Yes" | "No">;
  separated: Field<"Yes" | "No">;
  annulled: Field<"Yes" | "No">;
  divorcedDissolved: Field<"Yes" | "No">;
  widowed: Field<"Yes" | "No">;
  section17_1?: Section17_1;
  section17_2?: Section17_2[];
  section17_3?: Section17_3;
}

interface Section17_1 {
  _id: number;
  fullName: Name;
  placeOfBirth: Location;
  dateOfBirth: DateInfo;
  citizenship: Citizenship[];
  documentation: Documentation;
  NA_OtherNames: Field<"Yes" | "No">;
  social: SSN;
  otherNames?: OtherNameSection17_1[];
  currentAddress: Address;
  useMyCurrentAddress: Field<"Yes" | "No">;
  phone: Phone;
  spouseEmail: Field<string>;
  marraigeDetails: MarraigeDetails;
  isSeperated: Field<"YES " | "NO">;
  seperated: Seperated;
  hasAPOorFPO: Field<"YES " | "NO">;
  apoFPOAddress?: ApoFpoAddress;
}

interface Section17_2 {
  _id: number;
  marriageStatus: Field<"1" | "2" | "3">;
  dateOfMarriage: DateInfo;
  placeOfMarriage: Location;
  spouseName: Name;
  spousePlaceOfBirth: Location;
  spouseDateOfBirth: DateInfo;
  spouseCitizenship: Citizenship[];
  spousePhone: SpousePhone;
  divorcePlace: Location;
  dateOfDivorce: DateInfo;
  lastKnownAddress: Address;
  isDisceased: Field<"YES" | "NO (If NO, complete (a))" | "I dont know">;
}

interface Section17_3 {
  _id: number;
  hasCohabitant: Field<"YES" | "NO (If NO, proceed to Section 18)">;
  cohabitants?: CohabitantDetails[];
}

interface Seperated {
  date: Field<string>;
  estDate: Field<"Yes" | "No">;
  location: Address;
  notApplicable: Field<"Yes" | "No">;
}

interface ApoFpoAddress {
  street: Field<string>;
  apoOrFpo: Field<string>;
  apoFpoStateCode: Field<string>;
  zipCode: Field<string>;
  APOAddress: Address;
}

interface Phone {
  number: Field<string>;
  useMyPhone: Field<"Yes" | "No">;
  extension?: Field<string>;
  internationalOrDsn: Field<"Yes" | "No">;
  day: Field<"Yes" | "No">;
  night: Field<"Yes" | "No">;
}

interface SpousePhone {
  phone: Field<string>; // Assuming format 'MM/DD/YYYY'
  dontKnow?: Field<"Yes" | "No">;
}

interface Name {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName?: Field<string>; // Optional
  suffix?: Field<string>; // Optional
}

interface Location {
  city: Field<string>;
  county?: Field<string>; // Optional
  state?: Field<string>; // Optional
  country: Field<string>;
  zipCode?: Field<string>;
}

interface DateInfo {
  date: Field<string>; // Assuming format 'MM/DD/YYYY'
  estimated: Field<"Yes" | "No">;
  present?: Field<"Yes" | "No">; // Optional
}

interface DateInfo_Section17_3 {
  date: Field<string>; // Assuming format 'MM/DD/YYYY'
  estimated: Field<"Yes" | "No">;
  present?: Field<"YES" | "NO">; // Optional
}

interface Citizenship {
  _id: number;
  country: Field<string>;
}

interface BornAbroad {
  FS240Or545?: Field<"Yes" | "No">;
  DS1350?: Field<"Yes" | "No">;
}

interface Derived {
  AlienRegistration?: Field<"Yes" | "No">;
  I551?: Field<"Yes" | "No">;
  N560_N561?: Field<"Yes" | "No">;
}

interface NotACitizen {
  I551?: Field<"Yes" | "No">;
  I766?: Field<"Yes" | "No">;
  I94?: Field<"Yes" | "No">;
  USVisa?: Field<"Yes" | "No">;
  I20?: Field<"Yes" | "No">;
  DS2019?: Field<"Yes" | "No">;
  Other?: {
    value: Field<"Yes" | "No">;
    explanation: Field<string>; // Explanation for "Other"
  };
}

interface Naturalized {
  AlienRegistration?: Field<"Yes" | "No">;
  I551?: Field<"Yes" | "No">;
  N550_N570?: Field<"Yes" | "No">;
}

interface Documentation {
  naturalized: Naturalized;
  bornAbroad: BornAbroad;
  notACitizen: NotACitizen;
  derived: Derived;
  documentNumber: Field<string>;
  documentExpirationDate: DateInfo;
}

interface OtherNameSection17_1 {
  _id: number;
  lastName: Field<string>;
  firstName: Field<string>;
  middleName?: Field<string>; // Optional
  suffix?: Field<string>; // Optional
  maidenName: Field<"YES" | "NO">;
  fromDate: DateInfo;
  toDate: DateInfo; // null if still applicable
}

interface OtherNameSection17_3 {
  _id: number;
  lastName: Field<string>;
  firstName: Field<string>;
  middleName?: Field<string>; // Optional
  suffix?: Field<string>; // Optional
  maidenName: Field<"YES" | "NO">;
  fromDate: DateInfo;
  toDate: DateInfo_Section17_3; // null if still applicable
}

interface MarraigeDetails {
  location: Location;
  date: DateInfo;
}

interface Address {
  street?: Field<string>;
  city: Field<string>;
  state?: Field<string>; // Optional
  zipCode?: Field<string>; // Optional
  country: Field<string>;
  idontknow?: Field<string>;
}

interface SSN {
  usSocialSecurityNumber?: Field<string>;
  notApplicable: Field<"Yes" | "No">;
}

interface CohabitantDetails {
  _id: number;
  fullName: Name;
  placeOfBirth: Location;
  dateOfBirth: DateInfo;
  citizenship: Citizenship[];
  documentation: Documentation;
  social: SSN;
  hasOtherNames: Field<"Yes" | "No">;
  otherNames: OtherNameSection17_3[];
  cohabitationStartDate: DateInfo;
}

export type {
  RelationshipInfo,
  Section17_1,
  Section17_2,
  Section17_3,
  Location,
  Name,
  Documentation,
  DateInfo,
  CohabitantDetails,
  Citizenship,
  SpousePhone,
};
