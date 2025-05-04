import { type Field } from "api/interfaces/formDefinition";

interface AlcoholUse {
  _id: number;
  negativeImpact: Field<"YES" | "NO">; // (If NO, proceed to 24.2)
  suggestedCounseling: Field<"YES" | "NO">; // (If NO, proceed to 24.3)
  voluntaryCounseling: Field<"YES" | "NO">; // (If NO, proceed to 24.4)
  additionalCounseling: Field<"YES" | "NO">; // (If NO, proceed to 25)
  section24_1?: Section24_1[];
  section24_2?: Section24_2[];
  section24_3?: Section24_3[];
  section24_4?: Section24_4[];
}

interface Section24_1 {
  _id: number;
  negativeImpactDate: DateInfo;
  datesOfInvolvement: DateRange;
  circumstances: Field<string>;
  negativeImpact: Field<string>;
}

interface Section24_2 {
  _id: number;
  orderedBy: OrderedBy;
  actionTaken: Field<"YES" | "NO">; // Did you take action to receive counseling or treatment?
  noActionExplanation: Field<string>; // Explanation if 'No' to action taken
  actionDetails: CounselingDetails;
}

interface CounselingDetails {
  dateRange: DateRange;
  providerName: Field<string>;
  providerAddress: Address;
  providerPhone: PhoneField;
  treatmentCompletion: Field<"YES" | "NO">;
  completionExplanation: Field<string>;
}


interface PhoneField {
  number: Field<string>;
  extension?: Field<string>;
  isInternationalOrDSN: Field<"YES" | "NO">;
  timeOfDay: Field<"Day" | "Night">;
}

interface Section24_3 {
  _id: number;
  dateRange: DateRange;
  providerName: Field<string>;
  providerAddress: Address;
  providerPhone: PhoneField;
  treatmentCompletion: Field<"YES" | "NO">;
  completionExplanation: Field<string>;
}

interface Section24_4 {
  _id: number;
  counselorName: Field<string>;
  counselorAddress: Address;
  agencyName: Field<string>;
  agencyAddress: Address;
  dateRange: DateRange;
  treatmentCompletion: Field<"YES" | "NO">;
  completionExplanation: Field<string>;
}

interface DateInfo {
  date: Field<string>;
  estimated: Field<"YES" | "NO">;
}

interface DateRange {
  from: DateInfo;
  to: DateInfo;
  present: Field<"YES" | "NO">;
}

interface Address {
  street: Field<string>;
  city: Field<string>;
  state: Field<string>;
  zipCode: Field<string>;
  country: Field<string>;
}

type OrderedBy = Field<string>;


export type {
  AlcoholUse,
  Section24_1,
  Section24_2,
  Section24_3,
  Section24_4,
  CounselingDetails,
  DateInfo,
  DateRange,
  Address,
};
