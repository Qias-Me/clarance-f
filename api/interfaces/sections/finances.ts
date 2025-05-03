import { Field } from "api/interfaces/formDefinition";

interface Finances {
  _id: number;
  filedBankruptcy: Field<"YES" | "NO">; // (If NO, proceed to 26.2)
  gamblingProblem: Field<"YES" | "NO">; // (If NO, proceed to 26.3)
  missedTaxes: Field<"YES" | "NO">; // (If NO, proceed to 26.4)
  companyViolation: Field<"YES" | "NO">; // (If NO, proceed to 26.5)
  counseling: Field<"YES" | "NO">; // (If NO, proceed to 26.6)
  delinquent: Field<"YES" | "NO">; // (If NO, proceed to 26.7)
  reposessions: Field<"YES" | "NO">;
  section26_1?: Section26_1[];
  section26_2?: Section26_2[];
  section26_3?: Section26_3[];
  section26_4?: Section26_4[];
  section26_5?: Section26_5[];
  section26_6?: Section26_6[];
  section26_7?: Section26_7[];
}

interface DateInfo {
  date: Field<string>;
  estimated: Field<"YES" | "NO">;
  notApplicable?: Field<"YES" | "NO">;
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

interface Section26_1 {
  _id: number;
  bankruptcyPetitionType: BankruptcyPetitionType;
  courtDocketNumber: Field<string>;
  dateFiled: DateInfo;
  dateDischarged: DateInfo;
  amountInvolved: AmountInvolved;
  debtRecordedUnder: NameInfo;
  courtName: Field<string>;
  courtAddress: Address;
  chapter13Details?: Chapter13Details;
  dischargedOfAllDebts: Field<"YES" | "NO">;
  dischargeExplanation: Field<string>;
}

type BankruptcyPetitionType = Field<
  "Chapter 7" | "Chapter 11" | "Chapter 12" | "Chapter 13"
>;

interface AmountInvolved {
  amount: Field<number>;
  estimated: Field<"YES" | "NO">;
}

interface NameInfo {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  suffix: Field<string>;
}

interface Chapter13Details {
  trusteeName: Field<string>;
  trusteeAddress: Address;
}

interface Section26_2 {
  _id: number;
  financialProblemsDueToGambling: Field<"YES" | "NO">;
  dateRange: DateRange;
  gamblingLosses: AmountInvolved;
  descriptionOfFinancialProblems: Field<string>;
  actionsTaken: Field<string>;
}

interface Section26_3 {
  _id: number;
  failedToFileOrPay: FailureToFileOrPay;
  yearFailed: { date: Field<string>; estimated: Field<"YES" | "NO"> };
  failureReason: Field<string>;
  agencyName: Field<string>;
  taxType: Field<string>;
  amountInvolved: AmountInvolved;
  dateSatisfied: DateInfo;
  actionsTaken: Field<string>;
}

type FailureToFileOrPay = Field<"File" | "Pay" | "Both">;

interface Section26_4 {
  _id: number;
  agencyOrCompanyName: Field<string>;
  agencyOrCompanyAddress: Address;
  counselingWarningDisciplinaryDate: DateInfo;
  counselingWarningDisciplinaryReason: Field<string>;
  violationAmount: AmountInvolved;
  rectifyingActions: Field<string>;
}

interface Phone {
  number: Field<string>;
  extension?: Field<string>;
  isInternationalOrDSN: Field<"YES" | "NO">;
  timeOfDay: Field<"Day" | "Night">;
}

interface Section26_5 {
  _id: number;
  explanation: Field<string>;
  creditCounselingOrganizationName: Field<string>;
  creditCounselingOrganizationPhoneNumber: Phone;
  creditCounselingOrganizationLocation: Address;
  counselingActions: Field<string>;
}

interface PhoneField {
  number: Field<string>;
  extension?: Field<string>;
  isInternationalOrDSN: Field<"YES" | "NO">;
  timeOfDay: "Day" | "Night";
}

interface Section26_6 {
  _id: number;
  agencyName: Field<string>;
  doesInclude: Field<"YES" | "NO">;
  financialIssueTypes: FinancialIssueType[];
  loanAccountNumbers: Field<string>;
  propertyInvolved: Field<string>;
  amountInvolved: AmountInvolved;
  issueReason: Field<string>;
  currentStatus: Field<string>;
  issueDate: DateInfo;
  resolutionDate: DateInfo;
  courtName: Field<string>;
  courtAddress: Address;
  actionsTaken: Field<string>;
}

interface FinancialIssueType {
  _id: number;
  type: Field<
    | "Delinquent on alimony or child support payments"
    | "Judgment entered against you"
    | "Lien placed against your property"
    | "Currently delinquent on any Federal debt"
  >;
}

interface Section26_7 {
_id: number;
  agencyName: Field<string>;
  doesInclude: Field<"YES" | "NO">;
  financialIssueTypes: ExtendedFinancialIssueType[];
  loanAccountNumbers: Field<string>;
  propertyInvolved: Field<string>;
  amountInvolved: AmountInvolved;
  issueReason: Field<string>;
  currentStatus: Field<string>;
  issueDate: DateInfo;
  resolutionDate: DateInfo;
  courtName: Field<string>;
  courtAddress: Address;
  actionsTaken: Field<string>;
}

interface ExtendedFinancialIssueType {
  _id: number;
  type: Field<
    | "Repossessed or foreclosed property"
    | "Defaulted on any loan"
    | "Bills or debts turned over to collection agency"
    | "Account or credit card suspended, charged off, or cancelled"
    | "Evicted for non-payment"
    | "Wages, benefits, or assets garnished or attached"
    | "Over 120 days delinquent on any debt not previously entered"
    | "Currently over 120 days delinquent on any debt"
  >;
}

export type {
  Finances,
  Section26_1,
  Section26_2,
  Section26_3,
  Section26_4,
  Section26_5,
  Section26_6,
  Section26_7,
  DateInfo,
  DateRange,
  Address,
  BankruptcyPetitionType,
  AmountInvolved,
  NameInfo,
  Chapter13Details,
  FailureToFileOrPay,
  FinancialIssueType,
  ExtendedFinancialIssueType,
  PhoneField,
};
