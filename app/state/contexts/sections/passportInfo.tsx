import { type PassportInfo, type PassportEntry } from "../../../../api/interfaces/sections/passport";

//passportInfo covers section 8

// Define a sample passport entry based on existing data
const samplePassport: PassportEntry = {
  _id: 1,
  type: {
    value: "Regular",
    id: "9553",
    type: "PDFTextField",
    label: "Passport Type"
  },
  number: {
    value: "PassportNum",
    id: "9553",
    type: "PDFTextField",
    label: "Passport number"
  },
  issueDate: {
    value: "issueDate",
    id: "9551",
    type: "PDFTextField",
    label: "Issue date (Month/Day/Year)"
  },
  expirationDate: {
    value: "sec8ExpDate",
    id: "9550",
    type: "PDFTextField",
    label: "Expiration date (Month/Day/Year)"
  },
  issueCountry: {
    value: "USA",
    id: "9547",
    type: "PDFTextField",
    label: "Issue Country"
  },
  placeOfIssue: {
    value: "USA",
    id: "9545",
    type: "PDFTextField",
    label: "Place of Issue"
  }
};

// Default initial state for PassportInfo
export const passportInfo: PassportInfo = {
  hasPassport: {
    value: "YES", // "NO (If NO, proceed to Section 9)"
    id: "17231",
    type: "PDFRadioGroup",
    label: "Do you currently possess a U.S. passport?"
  },
  passports: [samplePassport]
};
