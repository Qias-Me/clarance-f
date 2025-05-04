import type { Field } from "../../../../api/interfaces/formDefinition";

interface Print {
  value: Field<"YES" | "NO">;
  lastName: Field<string>;
}

export const print: Print = {
  value: {
    value: "YES",
    id: "17237",
    type: "String",
    label: "Print",
  },
  lastName: {
    value: "YES",
    id: "17237",
    type: "String",
    label: "",
  },
};


export type { Print };
