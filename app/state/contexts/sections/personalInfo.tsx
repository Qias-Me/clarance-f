import { type PersonalInfo } from "api/interfaces/sections/personalInfo";

// personalInfo covers section 1

export const personalInfo: PersonalInfo = {
  lastName: {
    value: "Sect1FirstName",
    id: "9449",
    type: "PDFTextField",
    label: "Section 1. Full Name. Provide your full name. If you have only initials in your name, provide them and indicate \"Initial only\". If you do not have a middle name, indicate \"No Middle Name\". If you are a \"Jr.,\" \"Sr.,\" etc. enter this under Suffix. Last Name.",
  },
  firstName: {
    value: "Sect1FirstName",
    id: "9448",
    type: "PDFTextField",
    label: "First name",
  },
  middleName: {
    value: "Sect1MiddleName",
    id: "9447",
    type: "PDFTextField",
    label: "Middle name",
  },
  suffix: {
    value: "III",
    id: "9435",
    type: "PDFDropdown",
    label: "Suffix",
  }
};
