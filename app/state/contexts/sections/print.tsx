import { Field } from "../../../../api/interfaces/formDefinition";

interface Print {
  value: Field<"YES" | "NO">;
  lastName: Field<string>;
  id: Field<string>;
  type: Field<string>;
}

// export const print: Print = {
//   print: {
//     value: "YES",
//     id: "17237",
//     type: "String",
//   },
// };


export type { Print };
