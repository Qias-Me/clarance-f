import { type Field } from "api/interfaces/formDefinition";


interface Section30_1 {
  _id: number;
  fullName: Field<string>; // Full name (Type or print legibly)
  dateSigned: Field<string>; // Date signed (mm/dd/yyyy)
  otherNamesUsed: Field<string>; // Other names used
  address: Address; // Current street address Apt. #
  telephoneFieldNumber: Field<string>; // Telephone Field<number>
}

interface Section30_2 {
  _id: number;
  fullName: Field<string>; // Full name (Type or print legibly)
  dateSigned: Field<string>; // Date signed (mm/dd/yyyy)
  otherNamesUsed: Field<string>; // Other names used
  address: Address; // Current street address Apt. #
  telephoneFieldNumber: Field<string>; // Telephone Field<number>
}

interface Section30_3 {
  _id: number;
  fullName: Field<string>; // Full name (Type or print legibly)
  dateSigned: Field<string>; // Date signed (mm/dd/yyyy)
}

interface Signature {
  _id: number;
  information: Field<"YES" | "NO">;
  medical: Field<"YES" | "NO">;
  credit: Field<"YES" | "NO">;
  section30_1?: Section30_1[];
  section30_2?: Section30_2[];
  section30_3?: Section30_3[];
}

interface Address {
  street: Field<string>;
  city: Field<string>;
  state: Field<string>;
  zipCode: Field<string>;
  country: Field<string>;
}

export type { Signature, Address, Section30_1, Section30_2, Section30_3 };
