import { Field } from "api/interfaces/formDefinition";


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

type DrugType = Field<"Cocaine or crack cocaine (Such as rock, freebase, etc.)"
    | "THC (Such as marijuana, weed, pot, hashish, etc.)"
    | "Ketamine (Such as special K, jet, etc.)"
    | "Narcotics (Such as opium, morphine, codeine, heroin, etc.)"
    | "Stimulants (Such as amphetamines, speed, crystal meth, ecstasy, etc.)"
    | "Depressants (Such as barbiturates, methaqualone, tranquilizers, etc.)"
    | "Hallucinogenic (Such as LSD, PCP, mushrooms, etc.)"
    | "Steroids (Such as the clear, juice, etc.)"
    | "Inhalants (Such as toluene, amyl nitrate, etc.)"
    | "Other">;


interface Section23_1 {
  typeOfDrug: DrugType[]; // List of drugs used
  otherDrugExplanation?: Field<string>; // Explanation if "Other" is checked
  firstUse: DateInfo;
  mostRecentUse: DateInfo;
  natureOfUseFrequencyTimes: Field<string>;
  useWhileEmployedInPublicSafety: Field<"YES" | "NO">;
  useWhilePossessingSecurityClearance: Field<"YES" | "NO">;
  intendToUseInFuture: Field<"YES" | "NO">;
  futureUseExplanation: Field<string>;
}

interface Section23_2 {
  typeOfDrug: DrugType[]; // List of drugs involved
  otherDrugExplanation?: Field<string>; // Explanation if "Other" is checked
  firstInvolvement: DateInfo;
  mostRecentInvolvement: DateInfo;
  natureAndFrequencyOfActivity: Field<string>;
  reasonsForActivity: Field<string>;
  involvementWhileEmployedInPublicSafety: Field<"YES" | "NO">;
  involvementWhilePossessingSecurityClearance: Field<"YES" | "NO">;
  intendToEngageInFuture: Field<"YES" | "NO">;
  futureEngagementExplanation: Field<string>;
}

interface Section23_3 {
  descriptionOfInvolvement: Field<string>;
  dateRange: DateRange;
  NumberOfTimesInvolved: Field<string>;
}

interface Section23_4 {
  descriptionOfInvolvement: Field<string>;
  dateRange: DateRange;
  NumberOfTimesInvolved: Field<string>;
}

interface Section23_5 {
  nameOfPrescriptionDrug: Field<string>;
  dateRange: DateRange;
  reasonsForMisuse: Field<string>;
  involvementWhileEmployedInPublicSafety: Field<"YES" | "NO">;
  involvementWhilePossessingSecurityClearance: Field<"YES" | "NO">;
}

interface TreatmentProvider {
  lastName: Field<string>;
  firstName: Field<string>;
}

interface TreatmentProviderPhone {
  number: Field<string>;
  extension?: Field<string>;
  international: Field<"YES" | "NO">;
  timeOfDay: Field<"Day" | "Night">;
}

type PersonOrdered =
    Field< "An employer, military commander, or employee assistance program"
    | "A medical professional"
    | "A mental health professional"
    | "A court official / judge"
    | "I have not been ordered, advised, or asked to seek counseling or treatment by any of the above.">;


interface Section23_6 {
  orderedBy: PersonOrdered[];
  orderedExplanation?: Field<string>;
  receivedTreatment: Field<"YES" | "NO">;
  noTreatmentExplanation?: Field<string>;
  typeOfDrug?: DrugType[];
  otherDrugExplanation?: Field<string>;
  treatmentProviderName?: TreatmentProvider;
  treatmentProviderAddress?: Address;
  treatmentProviderPhone?: TreatmentProviderPhone;
  dateRange?: DateRange;
  successfullyCompleted?: Field<"YES" | "NO">;
  completionExplanation?: Field<string>;
}

interface Section23_7 {
  typeOfDrug: DrugType[];
  otherDrugExplanation?: Field<string>; // Explanation if "Other" is checked
  treatmentProviderName: TreatmentProvider;
  treatmentProviderAddress: Address;
  treatmentProviderPhone: TreatmentProviderPhone;
  dateRange: DateRange;
  successfullyCompleted: Field<"YES" | "NO">;
  completionExplanation?: Field<string>;
}

interface DrugActivity {
  _id: number;
  hasUsed: Field<"YES" | "NO">; // (If NO, proceed to 23.2)
  hasInvolvement: Field<"YES" | "NO">; // (If NO, proceed to 23.3)
  illegalWhileProcessing: Field<"YES" | "NO">; // (If NO, proceed to 23.4)
  usedWhilePublicSaftey: Field<"YES" | "NO">; // (If NO, proceed to 23.5)
  usedNotPerscribed: Field<"YES" | "NO">; // (If NO, proceed to 23.6)
  suggestedCounsoling: Field<"YES" | "NO">; // (If NO, proceed to 23.7)
  voluntaryCounsoling: Field<"YES" | "NO">;
  section23_1?: Section23_1[];
  section23_2?: Section23_2[];
  section23_3?: Section23_3[];
  section23_4?: Section23_4[];
  section23_5?: Section23_5[];
  section23_6?: Section23_6[];
  section23_7?: Section23_7[];
}

export type {
  DateInfo,
  DateRange,
  Address,
  TreatmentProvider,
  TreatmentProviderPhone,
  DrugActivity,
  Section23_1,
  Section23_2,
  Section23_3,
  Section23_4,
  Section23_5,
  Section23_6,
  Section23_7,
};
