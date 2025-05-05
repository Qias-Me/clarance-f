import {type PassportInfo } from "api/interfaces/sections/passport";

//passportInfo covers section 8

export const passportInfo: PassportInfo = {
    hasPassport: {
      value: "YES", // NO (If NO, proceed to Section 9)
      id: "17231",
      type: "PDFRadioGroup",
      label: "Do you currently possess a U.S. passport?",
    },
    section8: {
      passportNum: {
        value: "PassportNum",
        id: "9553",
        type: "PDFTextField",
        label: "Provide the following information for the most recent U.S. passport you currently possess. Passport number",
      },
      issueDate: {
        value: "issueDate",
        id: "9551",
        type: "PDFTextField",
        label: "Issue date (Month/Day/Year)",
      },
      isIssuedEst: {
        value: "YES",
        id: "9523",
        type: "PDFCheckBox",
        label: "Estimate",
      },
      expirationDate: {
        value: "sec8ExpDate",
        id: "9550",
        type: "PDFTextField",
        label: "Expiration date (Month/Day/Year)",
      },
      isExpirationEst: {
        value: "YES",
        id: "9549",
        type: "PDFCheckBox",
        label: "Estimate",
      },
      passportLName: {
        value: "sec8LName",
        id: "9547",
        type: "PDFTextField",
        label: "Provide the name in which passport was first issued. Last name",
      },
      passportFName: {
        value: "sec8FName",
        id: "9546",
        type: "PDFTextField",
        label: "First name",
      },
      passportMName: {
        value: "sec8MName",
        id: "9548",
        type: "PDFTextField",
        label: "Middle name",
      },
      passportSuffix: {
        value: "sec8Suffix",
        id: "9545",
        type: "PDFDropdown",
        label: "Suffix",
      },
    },
  };
