import { Field } from "../formDefinition";

interface PhysicalAttributes {
    heightFeet: Field<string>;
    heightInch: Field<string>;
    weight: Field<string>;
    hairColor: Field<string>;
    eyeColor: Field<string>;
    gender: Field<string>;
  }

  export type { PhysicalAttributes };