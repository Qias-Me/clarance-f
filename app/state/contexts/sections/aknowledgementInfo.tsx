import type { AknowledgeInfo } from "api/interfaces/sections/aknowledgement";

// aknowledgementInfo covers first radio question in the pdf. It also covers section 4, and the ssn field at the bottm of each page. 

export const aknowledgementInfo: AknowledgeInfo = {
    aknowledge: {
      value: "YES",
      id: "17237",
      type: "PDFRadioGroup",
      label: "Acknowledgement statement agreement",
    },
    ssn: {
      value: "ssn",
      id: "9441",
      type: "PDFTextField",
      label: "Social Security Number",
    },
    notApplicable: {
      value: "Yes",
      id: "9442",
      type: "PDFCheckBox",
      label: "Not Applicable for SSN",
    },
    pageSSN: [
      {
          ssn: {
              value: "page1 SSN",
              id: "",
              type: "PDFTextField",
              label: "SSN on page 1",
          }
      },
      {
          ssn: {
              value: "page2 SSN",
              id: "",
              type: "PDFTextField",
              label: "SSN on page 2",
          }
      }
  ]
  };
