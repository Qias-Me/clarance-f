import { Field } from "api/interfaces/formDefinition";

interface ForeignActivities {
  _id: number;
  hasForeignFinancialInterest: Field<"YES" | "NO">; // If not go to A.2
  hasForeignInterestOnBehalf: Field<"YES" | "NO">; // If not go to A.3
  wantForeignRealEstate: Field<"YES" | "NO">; // If not go to A.4
  hasForeignSupport: Field<"YES" | "NO">; // If not go to A.5
  providedForeignSupport: Field<"YES" | "NO">; // If not go to B
  providedForeignAdvice: Field<"YES" | "NO">; // If not go to B.2
  familyProvidedForeignAdvice: Field<"YES" | "NO">; // If not go to B.3
  offeredForeignJob: Field<"YES" | "NO">; // If not go to B.4
  offeredBuisnessVenture: Field<"YES" | "NO">; // If not go to B.5
  foreignConferences: Field<"YES" | "NO">; // If not go to B.6
  contactForeignGovernment: Field<"YES" | "NO">; // If not go to B.7
  sponsoredForeignNational: Field<"YES" | "NO">; // If not go to B.8
  foreignPoliticalOffice: Field<"YES" | "NO">; // If not go to B.9
  foreignVote: Field<"YES" | "NO">; // If not go to C
  traveledOutsideUSA: Field<"YES" | "NO">;
  traveledOutsideUSA_Government: Field<"YES" | "NO">;
  section20A1?: Section20A1[];
  section20A2?: Section20A2[];
  section20A3?: Section20A3[];
  section20A4?: Section20A4[];
  section20A5?: Section20A5[];
  section20B1?: Section20B1[];
  section20B2?: Section20B2[];
  section20B3?: Section20B3[];
  section20B4?: Section20B4[];
  section20B5?: Section20B5[];
  section20B6?: Section20B6[];
  section20B7?: Section20B7[];
  section20B8?: Section20B8[];
  section20B9?: Section20B9[];
  section20C?: Section20C[];
}

interface Section20A1 {
  id_:number;
  ownershipType: OwnershipType[];
  financialInterestType: Field<string>;
  dateAcquired: DateInfo;
  howAcquired: Field<string>;
  costAtAcquisition: ValueInfo;
  currentValue: ValueInfo;
  dateControlRelinquished: DateInfo;
  disposalExplanation: Field<string>;
  hasCoOwners: Field<"YES" | "NO">;
  coOwners?: CoOwner[];
}

interface Section20A2 {
  id_: number;
  ownershipType: OwnershipType[];
  financialInterestType: Field<string>;
  controllerInfo: IndividualInfo;
  dateAcquired: DateInfo;
  costAtAcquisition: ValueInfo;
  currentValue: ValueInfo;
  dateDisposed: DateInfo;
  disposalExplanation: Field<string>;
  hasCoOwners: Field<"YES" | "NO">;
  coOwners?: CoOwner[];
}

interface Section20A3 {
  id_: number;
  ownershipType: OwnershipType[];
  realEstateType: Field<string>;
  location: Address;
  dateOfPurchase: DateInfo;
  howAcquired: Field<string>;
  dateSold: DateInfo;
  costAtAcquisition: ValueInfo;
  hasCoOwners: Field<"YES" | "NO">;
  coOwners?: CoOwner[];
}

interface Section20A4 {
  id_: number;
  ownershipType: OwnershipType[];
  benefitType: BenefitType;
  benefitFrequency: BenefitFrequency;
  oneTimeBenefit?: BenefitDetail;
  futureBenefit?: BenefitDetail;
  continuingBenefit?: BenefitDetail;
}

interface OwnershipType {
  _id: number;
  type: Field<
    | "Yourself"
    | "Spouse or legally recognized civil union/domestic partner"
    | "Cohabitant"
    | "Dependent children"
  >; // Educational, Medical, Retirement, Social Welfare, etc.
}

interface Section20A5 {
  id_: number;
  lastName: Field<string>;
  firstName: Field<string>;
  middleName?: Field<string>;
  suffix?: Field<string>;
  address: Address;
  relationship: Field<string>;
  amountProvided: ValueInfo;
  citizenships: Citizenships[];
  frequency: Frequency;
}

interface Section20B1 {
  id_: number;
  description: Field<string>;
  individual: IndividualInfo;
  organization: Field<string>;
  organizationCountry: Field<string>;
  dateFrom: DateInfo;
  dateTo: DateInfo;
  compensation?: Field<string>;
}

interface Section20B2 {
  id_: number;
  lastName: Field<string>;
  firstName: Field<string>;
  middleName?: Field<string>;
  suffix?: Field<string>;
  agency: Field<string>;
  country: Field<string>;
  dateOfRequest: DateInfo;
  circumstances: Field<string>;
}

interface Section20B3 {
  id_: number;
  lastName: Field<string>;
  firstName: Field<string>;
  middleName?: Field<string>;
  suffix?: Field<string>;
  positionDescription: Field<string>;
  dateOffered: DateInfo;
  accepted: Field<"YES" | "NO">;
  explanation?: Field<string>;
  location: Address;
}

interface Section20B4 {
  id_: number;
  lastName: Field<string>;
  firstName: Field<string>;
  middleName?: Field<string>;
  suffix?: Field<string>;
  address: Address;
  citizenships: Citizenships[];
  ventureDescription: Field<string>;
  dateFrom: DateInfo;
  dateTo: DateInfo;
  natureOfAssociation: Field<string>;
  positionHeld: Field<string>;
  financialSupport: ValueInfo;
  compensationDescription: Field<string>;
}

interface Section20B5 {
  id_: number;
  eventDescription: Field<string>;
  eventDates: EventDateInfo;
  purpose: Field<string>;
  sponsoringOrganization: Field<string>;
  eventLocation: Address;
  hasContacts: Field<"YES" | "NO">;
  subsequentContacts?: SubsequentContact[];
}

interface Section20B6 {
  id_: number;
  individual: IndividualInfo;
  contactLocation: Address;
  contactDate: DateInfo;
  establishmentType: Field<string>;
  foreignRepresentatives: Field<string>;
  purposeCircumstances: Field<string>;
  hasContact: Field<"YES" | "NO">;
  subsequentContact?: SubsequentContactDetail[];
}

interface Section20B7 {
  id_: number;
  lastName: Field<string>;
  firstName: Field<string>;
  middleName?: Field<string>;
  suffix?: Field<string>;
  dateOfBirth: DateInfo;
  placeOfBirth: Address;
  currentAddress: Address;
  citizenships: Citizenships[];
  sponsoringOrganization: OrganizationInfo;
  datesOfStay: EventDateInfo;
  addressDuringStay: Address;
  purposeOfStay: Field<string>;
  purposeOfSponsorship: Field<string>;
}

interface OrganizationInfo {
  name: Field<string>;
  notApplicable: Field<"YES" | "NO">;
  address: Address;
}

interface Section20B8 {
  id_: number;
  positionHeld: Field<string>;
  datesHeld: EventDateInfo;
  reasonForActivities: Field<string>;
  currentEligibility: Field<string>;
  countryInvolved: Field<string>;
}

interface Section20B9 {
  id_: number;
  dateVoted: DateInfo;
  countryInvolved: Field<string>;
  reasons: Field<string>;
  currentEligibility: Field<string>;
}

interface Section20C {
  _id: number;
  countryVisited: Field<string>;
  travelDates: EventDateInfo;
  numberOfDays: Days[];
  purposeOfTravel: Purpose[];
  questionedOrSearched: Field<"YES" | "NO">;
  questionedOrSearchedExplanation?: Field<string>;
  encounterWithPolice: Field<"YES" | "NO">;
  encounterWithPoliceExplanation?: Field<string>;
  contactWithForeignIntelligence: Field<"YES" | "NO">;
  contactWithForeignIntelligenceExplanation?: Field<string>;
  counterintelligenceIssues: Field<"YES" | "NO">;
  counterintelligenceIssuesExplanation?: Field<string>;
  contactExhibitingInterest: Field<"YES" | "NO">;
  contactExhibitingInterestExplanation?: Field<string>;
  contactAttemptingToObtainInfo: Field<"YES" | "NO">;
  contactAttemptingToObtainInfoExplanation?: Field<string>;
  threatenedOrCoerced: Field<"YES" | "NO">;
  threatenedOrCoercedExplanation?: Field<string>;
}

interface Days {
  _id: number;
  option:
    Field<"1-5"
    | "6-10"
    | "11-20"
    | "21-30"
    | "More than 30"
    | "Many short trips">;
}

interface Purpose {
  _id: number;
  reason:
    Field< "Visit family or friends"
    | "Trade shows, conferences, and seminars"
    | "Education Tourism"
    | "Volunteer activities"
    | "Business/Professional conference"
    | "Other">;
}

interface DateInfo {
  date: Field<string>; // Month/Day/Year
  estimated: Field<"YES" | "NO">;
}

interface ValueInfo {
  value: Field<number>;
  estimated: Field<"YES" | "NO">;
}

interface EventDateInfo {
  fromDate: DateInfo;
  toDate: DateInfo;
  present: Field<"YES" | "NO">;
}

interface IndividualInfo {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName?: Field<string>;
  suffix?: Field<string>;
  relationship: Field<string>;
}

interface CoOwner {
  _id: number;
  lastName: Field<string>;
  firstName: Field<string>;
  middleName?: Field<string>;
  suffix?: Field<string>;
  address: Address;
  citizenships: Citizenships[];
  relationship: Field<string>;
}

interface Citizenships {
  _id: number;
  type: Field<string>;
  notApplicable?: Field<"YES" | "NO">;
}

interface Address {
  street: Field<string>;
  city: Field<string>;
  state?: Field<string>;
  zipCode?: Field<string>;
  country: Field<string>;
}

interface BenefitType {
  _id: number;
  type: "Educational" | "Medical" | "Retirement" | "Social Welfare" | "Other";
  other?: Field<string>;
}

interface BenefitDetail {
  dateReceived: DateInfo;
  countryProviding: Field<string>;
  totalValue: ValueInfo;
  reason: Field<string>;
  obligatedToForeignCountry: Field<"YES" | "NO">;
  explanation?: Field<string>;
  frequency?: Frequency;
}

interface Frequency {
  _id: number;
  type: Field<"Annually" | "Monthly" | "Quarterly" | "Weekly" | "Other">;
  other?: Field<string>;
}

interface BenefitFrequency {
  type: "Onetime benefit" | "Future benefit" | "Continuing benefit" | "Other";
  other?: Field<string>;
}

interface SubsequentContact {
  _id: number;
  contactExplanation: Field<string>;
}

interface SubsequentContactDetail {
  _id: number;
  purpose: Field<string>;
  dateOfMostRecentContact: DateInfo;
  plansForFutureContact: Field<string>;
}

export type {
  ForeignActivities,
  Section20A1,
  Section20A2,
  Section20A3,
  Section20A4,
  Section20A5,
  Section20B1,
  Section20B2,
  Section20B3,
  Section20B4,
  Section20B5,
  Section20B6,
  Section20B7,
  Section20B8,
  Section20B9,
  Section20C,
  OwnershipType,
  DateInfo,
  ValueInfo,
  EventDateInfo,
  IndividualInfo,
  CoOwner,
  Address,
  BenefitType,
  BenefitDetail,
  Frequency,
  SubsequentContact,
  SubsequentContactDetail,
};
