import {  SuffixOptions,  StateOptions } from "api/interfaces/FormInfo";
import { type DropdownOption } from "api/interfaces/FormInfo";
// Form field interface including possible dropdown options
export interface FormField {
  id: string;
  label: string;
  type: "text" | "dropdown" | "checkbox";
  name: string;
  options?: DropdownOption[] | null;
}

const enumToDropdownOptions = (enumObj: { [s: string]: string }): DropdownOption[] => {
  return Object.entries(enumObj).map(([value, label]) => ({ value, label }));
};

export const validateAndConvertFields = (fields: FormField[]): FormField[] => {
  return fields.map((field) => ({
    ...field,
    type: field.type as "text" | "dropdown" | "checkbox",
    options: field.options || undefined,
  }));
};


// Assuming formFields is an array of objects conforming to the FormField interface
const preprocessFormFields = (formFields: FormField[]): FormField[] => {
  return formFields.map((field) => {
    if (field.id === "suffix") {
      return { ...field, options: enumToDropdownOptions(SuffixOptions) };
    }
    if (field.id === "state") {
      return { ...field, options: enumToDropdownOptions(StateOptions) };
    }
    // Add similar conditions for other dropdown fields that require enum options
    return field;
  });
};

export default preprocessFormFields;
