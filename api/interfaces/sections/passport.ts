import {type Field } from "../formDefinition";

interface PassportInfo {
  hasPassport: Field<"YES" | "NO (If NO, proceed to Section 9)">;
  passports: PassportEntry[];
}

interface PassportEntry {
  _id?: number;
  type?: Field<string>;
  number?: Field<string>;
  issueDate?: Field<string>;
  expirationDate?: Field<string>;
  issueCountry?: Field<string>;
  placeOfIssue?: Field<string>;
}

export type { PassportInfo, PassportEntry };