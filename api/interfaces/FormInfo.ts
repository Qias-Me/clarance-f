import type { Field } from "./formDefinition";

export enum SuffixOptions {
  MakeASelection = "Make A Selection",
  Jr = "Jr.",
  Sr = "Sr.",
  III = "III",
  IV = "IV",
  None = "None", // Assuming you want to give an option for no suffix
}

export interface DropdownOption {
  value: string;
  label: string;
}

export enum StateOptions {
  // Add state options here if they don't already exist
}

interface FormInfo {
  employee_id: Field<number>;
  suffix: SuffixOptions;
}

export type { FormInfo };