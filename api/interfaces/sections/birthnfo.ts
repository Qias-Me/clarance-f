import { Field } from "../formDefinition";

interface BirthInfo {
    birthDate: Field<string>;
    isBirthDateEstimate: Field<"Yes" | "No">;
    birthCity: Field<string>;
    birthCounty: Field<string>;
    birthState: Field<string>;
    birthCountry: Field<string>;
  }

  export type { BirthInfo };