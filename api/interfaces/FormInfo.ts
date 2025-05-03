import { Field } from "./formDefinition";

enum SuffixOptions {
  MakeASelection = "Make A Selection",
  Jr = "Jr.",
  Sr = "Sr.",
  III = "III",
  IV = "IV",
  None = "None", // Assuming you want to give an option for no suffix
}

interface FormInfo {
  employee_id: Field<number>;
  suffix: SuffixOptions;
}

export default FormInfo;
