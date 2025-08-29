import { type Field } from "./formDefinition2.0";

export enum SuffixOptions {
  None = "None",
  Jr = "Jr.",
  Sr = "Sr.",
  III = "III",
  IV = "IV",
  V = "V",
  VI = "VI",
  VII = "VII",
  VIII = "VIII",
  IX = "IX",
  X = "X",
  Other = "Other",
}

interface FormInfo {
  employee_id: Field<number>;
  suffix: SuffixOptions;
}

export type { FormInfo };
