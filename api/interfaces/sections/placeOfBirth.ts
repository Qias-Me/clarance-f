import { type Field } from "../formDefinition";

interface PlaceOfBirth {
  birthCity: Field<string>;
  birthCounty: Field<string>;
  birthState: Field<string>;
  birthCountry: Field<string>;
}

export type { PlaceOfBirth }; 