import { PassportInfo } from "api/interfaces/sections/passport";

//passportInfo covers section 8

export const passportInfo: PassportInfo = {
    hasPassport: {
      value: "NO (If NO, proceed to Section 9)",
      id: "17231",
      type: "PDFRadioGroup",
    },
    section8: {
      passportNum: {
        value: "PassportNum",
        id: "9553",
        type: "PDFTextField",
      },
      issueDate: {
        value: "issueDate",
        id: "9551",
        type: "PDFTextField",
      },
      isIssuedEst: {
        value: "YES",
        id: "9523",
        type: "PDFCheckBox",
      },
      expirationDate: {
        value: "",
        id: "9550",
        type: "PDFTextField",
      },
      isExpirationEst: {
        value: "YES",
        id: "9549",
        type: "PDFCheckBox",
      },
      passportLName: {
        value: "",
        id: "9547",
        type: "PDFTextField",
      },
      passportFName: {
        value: "",
        id: "9546",
        type: "PDFTextField",
      },
      passportMName: {
        value: "",
        id: "9548",
        type: "PDFTextField",
      },
      passportSuffix: {
        value: "",
        id: "9545",
        type: "PDFDropdown",
      },
    },
  };
