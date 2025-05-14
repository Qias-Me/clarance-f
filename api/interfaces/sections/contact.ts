import {type Field } from "../formDefinition";

interface ContactNumber {
  _id: number;
  phoneNumber: Field<string>;
  extension: Field<string>;
  isUsableDay: Field<"YES" | "NO">;
  isUsableNight: Field<"YES" | "NO">;
  internationalOrDSN: Field<"YES" | "NO">;
}

interface ContactInfo {
  homeEmail: Field<string>;
  workEmail: Field<string>;
  contactNumbers: ContactNumber[];
}

export type { ContactInfo, ContactNumber };