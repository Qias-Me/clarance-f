import { type Field } from "api/interfaces/formDefinition";

interface InvestigationsInfo {
  _id: number;
  governmentInvestigated: Field<"YES" | "NO">; // (If NO, proceed to 25.2)
  revocation: Field<"YES" | "NO">; // (If NO, proceed to 25.3)
  debarred: Field<"YES" | "NO">;
  section25_1?: Section25_1[];
  section25_2?: Section25_2[];
  section25_3?: Section25_3[];
}

interface DateInfo {
  date: Field<string>;
  estimated: Field<"YES" | "NO">;
  unknown?: Field<"YES" | "NO">;
}

interface InvestigatingAgency {
  _id: number;
  agency:
    Field< "U.S. Department of Defense"
    | "U.S. Department of State"
    | "U.S. Office of Personnel Management"
    | "Federal Bureau of Investigation"
    | "U.S. Department of Treasury"
    | "U.S. Department of Homeland Security"
    | "Foreign government"
    | "I don't know"
    | "Other">;
  explanation?: Field<string>;
}

interface LevelOfClearance {
  _id: number;
  level:
    Field< "None"
    | "Confidential"
    | "Secret"
    | "Top Secret"
    | "Sensitive Compartmented Information (SCI)"
    | "Q"
    | "L"
    | "I don't know"
    | "Other"
    | "Issued by foreign country">;
  explanation?: Field<string>;
}

interface Section25_1 {
  _id: number;
  investigatingAgency: InvestigatingAgency;
  otherAgency: Field<string>;
  issuedAgency: Field<string>;
  investigationCompletionDate: DateInfo;
  clearanceEligibilityDate: DateInfo;
  levelOfClearance: LevelOfClearance[];
}

interface Section25_2 {
  denialDate: DateInfo;
  agency: Field<string>;
  explanation: Field<string>;
}

interface Section25_3 {
  debarmentDate: DateInfo;
  agency: Field<string>;
  explanation: Field<string>;
}

export type {
  InvestigatingAgency,
  Section25_1,
  Section25_2,
  Section25_3,
  InvestigationsInfo,
  LevelOfClearance,
};
