import {type Field } from "../formDefinition";

interface DateField {
  date: Field<string>;
  isEstimated: Field<"YES" | "NO">;
}

interface PassportInfo {
  hasPassport: Field<"YES" | "NO">;
  passport: PassportEntry;
}

interface PassportEntry {
  _id: number;
  passportNumber: Field<string>;
  issuedDate: DateField;
  expirationDate: DateField;
  bookType: Field<string>;
  name: Field<string>;
}

export type { PassportInfo, PassportEntry, DateField };