import { type Field } from "api/interfaces/formDefinition";

interface RelativesInfo {
  _id: number;
  relativeTypes: RelativeCheckbox[];
  entries: RelativeEntry[];
}

interface RelativeCheckbox {
  _id: number;
  name: string;
  type: Field<string>;
}

interface DateInfo {
  date: Field<string>; // Assuming format 'MM/DD/YYYY'
  estimated: Field<"Yes" | "No">;
  present?: Field<"Yes" | "No">; // Optional
}

interface RelativeEntry {
  _id: number;
  type: Field<RelativeType>;
  fullName: FullName;
  dateOfBirth: DateInfo; // Format: MM/DD/YYYY or "Est."
  placeOfBirth: PlaceOfBirth;
  countriesOfCitizenship: Countries[];


  isDeceased: Field<"YES" | "NO">;
  isUSCitizen: Field<"YES" | "NO">;
  hasForeignAddress: Field<"YES" | "NO">;
  hasUSAddress: Field<"YES" | "NO">;
  details: RelativeDetails;
}


interface Countries {
  _id: number;
  country: Field<string>;
}

interface FullName {
  firstName: Field<string>;
  middleName: Field<string>;
  lastName: Field<string>;
  suffix?: Field<string>;
}

interface PlaceOfBirth {
  city: Field<string>;
  state?: Field<string>;
  country: Field<string>;
}

interface RelativeDetails {
  section18_1?: Section18_1Details;
  section18_2?: Section18_2Details;
  section18_3?: Section18_3Details;
  section18_4?: Section18_4Details;
  section18_5?: Section18_5Details;
}

interface Section18_5Details {
  firstContactDate: Field<string>;
  lastContactDate?: Field<string>; // Can be 'Present' or an estimated date
  contactMethods: ContactMethod[];
  contactFrequency: ContactFrequency;
  employerDetails: EmployerDetails;
  foreignGovernmentAffiliation?: ForeignGovernmentAffiliation;
}

type ContactMethod = Field<
  "In Person" | "Telephone" | "Written Correspondence" | "Electronic" | "Other"
>;

interface ContactFrequency {
  frequency: Field<
    "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annually" | "Other"
  >;
  explanation?: Field<string>; // Optional, used if 'Other' is selected
}

interface EmployerDetails {
  name: Field<string>;
  address: Address; // Optional, in case the address is known and applicable
  unknown: Field<"YES" | "NO">; // Indicates if the employer's details are unknown
}

interface Address {
  street?: Field<string>;
  city: Field<string>;
  state?: Field<string>;
  zipCode?: Field<string>;
  country: Field<string>;
}

interface ForeignGovernmentAffiliation {
  affiliation: Field<"YES" | "NO">;
  description: Field<string>;
}

interface Section18_4Details {
  usDocumentation: USDocumentation[];
  documentFieldNumber: Field<string>;
  documentExpirationDate: Field<string>;
  firstContactDate: Field<string>;
  lastContactDate?: Field<string>; // Optional, can be 'Present' or estimated
  contactMethods: ContactMethod[];
  contactFrequency: ContactFrequency; // Can be 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually', or other specified
  currentEmployer?: EmployerDetails;
  recentEmployer?: EmployerDetails; // Optional, if different from current employer
  foreignGovernmentAffiliation: ForeignGovernmentAffiliation;
}

interface USDocumentation {
  type: USDocumentationType;
}

type USDocumentationType =
  Field<"I551PermanentResident"
  | "I766EmploymentAuthorization"
  | "I94ArrivalDepartureRecord"
  | "I20CertificateEligibilityF1Student"
  | "DS2019CertificateEligibilityJ1Status"
  | "Other">;

interface EmployerDetails {
  name: Field<string>;
  address: Address; // Optional, in case the address is known and applicable
  unknown: Field<"YES" | "NO">;
}

interface Section18_3Details {
  citizenshipDocuments: CitizenshipDocument[];
  courtDetails?: CourtDetails; // Optional: Only needed if Certificate of Naturalization is selected
}

interface CitizenshipDocument {
  type: CitizenshipDocumentType;
  documentNumber: Field<string>;
}

type CitizenshipDocumentType =
  | "FS240or545" // Born Abroad to U.S. Parents: FS 240 or 545
  | "DS1350" // Born Abroad to U.S. Parents: DS 1350
  | "AlienRegistrationNaturalized" // Naturalized: Alien Registration
  | "PermanentResidentCardI551Naturalized" // Naturalized: Permanent Resident Card (I-551)
  | "CertificateOfNaturalizationN550orN570" // Naturalized: Certificate of Naturalization (N550 or N570)
  | "AlienRegistrationDerived" // Derived: Alien Registration
  | "PermanentResidentCardI551Derived" // Derived: Permanent Resident Card (I-551)
  | "CertificateOfCitizenshipN560orN561" // Derived: Certificate of Citizenship (N560 or N561)
  | "Other"; // Other documentation type

interface CourtDetails {
  street: Field<string>;
  city: Field<string>;
  state: Field<string>;
  zipCode: Field<string>;
}

interface Section18_2Details {
  _id: number;
  street: Field<string>;
  city: Field<string>;
  state?: Field<string>; // Optional since it might be outside the USA where states aren't applicable
  zipCode?: Field<string>;
  country: Field<string>;
  hasAPOFPOAddress: Field<"YES" | "NO">;
  apofpoAddress?: APOFPOAddress; // This is optional and dependent on the hasAPOFPOAddress being true
  dontKnowAPOFPO: Field<"YES" | "NO">;
}

interface APOFPOAddress {
  address: Field<string>;
  apofpoStateCode: Field<string>;
  apofpoZipCode: Field<string>;
}

interface Section18_1Details {
  ifMother?: ParentInfo;
  hasOtherNames: Field<"YES" | "NO">;
  otherNamesUsed: OtherNameEntry[];
}


interface ParentInfo {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  suffix?: Field<string>;
  sameAsListed: Field<"Yes" | "No">;
  iDontKnow: Field<"Yes" | "No">;
}


interface OtherNameEntry {
  _id: number;
  lastName: Field<string>;
  firstName: Field<string>;
  middleName?: Field<string>;
  suffix?: Field<string>;
  maidenName: Field<"YES" | "NO">;
  fromDate?: DateInfo;
  toDate?: DateInfo;
  estimatedFrom?: Field<"YES" | "NO">;
  estimatedTo?: Field<"YES" | "NO">;
  reasonForChange?: Field<string>;
}

type RelativeType =
  | "Mother"
  | "Foster Parent"
  | "Sister"
  | "Half-Sister"
  | "Father"
  | "Child"
  | "Stepbrother"
  | "Father-in-law"
  | "Stepmother"
  | "Stepchild"
  | "Stepsister"
  | "Mother-in-law"
  | "Stepfather"
  | "Brother"
  | "Half-Brother"
  | "Guardian";

export type {
  CitizenshipDocumentType,
  USDocumentationType,
  ContactMethod,
  RelativesInfo,
  RelativeCheckbox,
  RelativeType,
  RelativeEntry,
  FullName,
  PlaceOfBirth,
  RelativeDetails,
  Section18_1Details,
  ParentInfo,
  OtherNameEntry,
  Section18_2Details,
  Section18_3Details,
  Section18_4Details,
  Section18_5Details,
};
