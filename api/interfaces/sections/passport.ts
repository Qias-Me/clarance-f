import { Field } from "../formDefinition";

interface PassportInfo {
  hasPassport: Field<"YES" | "NO (If NO, proceed to Section 9)">;
  section8?: Section8;
  }

  interface Section8 {
    passportNum: Field<string>;
    issueDate: Field<string>;
    isIssuedEst: Field<"YES" | "NO">;
    expirationDate: Field<string>;
    isExpirationEst: Field<"YES" | "NO">;
    passportLName: Field<string>;
    passportFName: Field<string>;
    passportMName: Field<string>;
    passportSuffix: Field<string>;
  }

  export type { PassportInfo };