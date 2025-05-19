import { type PersonalInfo } from "api/interfaces/sections/personalInfo";

// personalInfo covers section 1 - Full Name section of SF-86
// These field IDs correspond to section 1 in field-hierarchy.json

export const personalInfo: PersonalInfo = {
  lastName: {
    value: "",
    id: "9449", // Field ID from field-hierarchy.json without the "0 R" suffix
    type: "PDFTextField",
    label: "Last Name",
  },
  firstName: {
    value: "",
    id: "9448", // Field ID from field-hierarchy.json without the "0 R" suffix
    type: "PDFTextField",
    label: "First name",
  },
  middleName: {
    value: "",
    id: "9447", // Field ID from field-hierarchy.json without the "0 R" suffix
    type: "PDFTextField",
    label: "Middle name",
  },
  suffix: {
    value: "",
    id: "9435", // Field ID from field-hierarchy.json without the "0 R" suffix
    type: "PDFDropdown",
    label: "Suffix",
  }
}; 