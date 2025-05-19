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
      value: "",
      id: "9441",
      type: "PDFTextField",
      label: "Social Security Number",
    },
    notApplicable: {
      value: "No",
      id: "9442",
      type: "PDFCheckBox",
      label: "Not Applicable for SSN",
    },
    pageSSN: [
      // Main SSN fields
      {
          ssn: {
              value: "",
              id: "9452",
              type: "PDFTextField",
              label: "SSN - Page 1 (Sections1-6)",
          }
      },
      {
          ssn: {
              value: "",
              id: "9441",
              type: "PDFTextField",
              label: "SSN - Section 4 Main Field",
          }
      },
      {
          ssn: {
              value: "",
              id: "9524",
              type: "PDFTextField",
              label: "SSN - Sections7-9",
          }
      },
      {
          ssn: {
              value: "",
              id: "9615",
              type: "PDFTextField",
              label: "SSN - Section9.1-9.4",
          }
      },
      // Section 10
      {
          ssn: {
              value: "",
              id: "9627",
              type: "PDFTextField",
              label: "SSN - Section10.1-10.2",
          }
      },
      {
          ssn: {
              value: "",
              id: "9726",
              type: "PDFTextField",
              label: "SSN - Section10-2",
          }
      },
      // Section 11
      {
          ssn: {
              value: "",
              id: "9827",
              type: "PDFTextField",
              label: "SSN - Section11",
          }
      },
      {
          ssn: {
              value: "",
              id: "9896",
              type: "PDFTextField",
              label: "SSN - Section11-2",
          }
      },
      {
          ssn: {
              value: "",
              id: "9901",
              type: "PDFTextField",
              label: "SSN - Section11-3",
          }
      },
      {
          ssn: {
              value: "",
              id: "10030",
              type: "PDFTextField",
              label: "SSN - Section11-4",
          }
      },
      // Section 12
      {
          ssn: {
              value: "",
              id: "10100",
              type: "PDFTextField",
              label: "SSN - Section12",
          }
      },
      {
          ssn: {
              value: "",
              id: "10136",
              type: "PDFTextField",
              label: "SSN - Section12_2",
          }
      },
      {
          ssn: {
              value: "",
              id: "10209",
              type: "PDFTextField",
              label: "SSN - Section12_3",
          }
      },
      // Section 13
      {
          ssn: {
              value: "",
              id: "10248",
              type: "PDFTextField",
              label: "SSN - Section13_1-2",
          }
      },
      {
          ssn: {
              value: "",
              id: "10310",
              type: "PDFTextField",
              label: "SSN - Section13_2-2",
          }
      },
      {
          ssn: {
              value: "",
              id: "10381",
              type: "PDFTextField",
              label: "SSN - Section13_3-2",
          }
      },
      {
          ssn: {
              value: "",
              id: "10474",
              type: "PDFTextField",
              label: "SSN - Section13_4[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "10544",
              type: "PDFTextField",
              label: "SSN - Section13_1[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "10558",
              type: "PDFTextField",
              label: "SSN - Section13_2[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "10711",
              type: "PDFTextField",
              label: "SSN - Section13_3[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "10727",
              type: "PDFTextField",
              label: "SSN - Section13_4[1]",
          }
      },
      {
          ssn: {
              value: "",
              id: "10787",
              type: "PDFTextField",
              label: "SSN - Section13_1[1]",
          }
      },
      {
          ssn: {
              value: "",
              id: "10865",
              type: "PDFTextField",
              label: "SSN - Section13_2[1]",
          }
      },
      {
          ssn: {
              value: "",
              id: "10993",
              type: "PDFTextField",
              label: "SSN - Section13_3[1]",
          }
      },
      {
          ssn: {
              value: "",
              id: "11037",
              type: "PDFTextField",
              label: "SSN - Section13_4[2]",
          }
      },
      {
          ssn: {
              value: "",
              id: "11094",
              type: "PDFTextField",
              label: "SSN - Section13_1[2]",
          }
      },
      {
          ssn: {
              value: "",
              id: "11209",
              type: "PDFTextField",
              label: "SSN - Section13_2[2]",
          }
      },
      {
          ssn: {
              value: "",
              id: "11239",
              type: "PDFTextField",
              label: "SSN - Section13_3[2]",
          }
      },
      {
          ssn: {
              value: "",
              id: "11410",
              type: "PDFTextField",
              label: "SSN - Section13_4[3]",
          }
      },
      {
          ssn: {
              value: "",
              id: "11478",
              type: "PDFTextField",
              label: "SSN - Section13_5[0]",
          }
      },
      // Section 14-16
      {
          ssn: {
              value: "",
              id: "11550",
              type: "PDFTextField",
              label: "SSN - Section14_1[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "11596",
              type: "PDFTextField",
              label: "SSN - Section15_2[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "11850",
              type: "PDFTextField",
              label: "SSN - Section15_3[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "11911",
              type: "PDFTextField",
              label: "SSN - Section16_1[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "11980",
              type: "PDFTextField",
              label: "SSN - Section16_3[0]",
          }
      },
      // Section 17
      {
          ssn: {
              value: "",
              id: "12070",
              type: "PDFTextField",
              label: "SSN - Section17_1[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12150",
              type: "PDFTextField",
              label: "SSN - Section17_1_2[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12187",
              type: "PDFTextField",
              label: "SSN - Section17_2[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12221",
              type: "PDFTextField",
              label: "SSN - Section17_2_2[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12255",
              type: "PDFTextField",
              label: "SSN - Section17_3[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12339",
              type: "PDFTextField",
              label: "SSN - Section17_3_2[0]",
          }
      },
      // Section 18
      {
          ssn: {
              value: "",
              id: "12412",
              type: "PDFTextField",
              label: "SSN - Section18_1[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12483",
              type: "PDFTextField",
              label: "SSN - Section18_2[0]",
          }
      },
      // Continue with all other page SSN fields...
      // Add additional entries here to cover all sections of the form
      // This ensures all pages have the correct SSN populated
      
      // The last few sections 
      {
          ssn: {
              value: "",
              id: "15972",
              type: "PDFTextField",
              label: "SSN - Continuation Pages",
          }
      },
      {
          ssn: {
              value: "",
              id: "16050",
              type: "PDFTextField",
              label: "SSN - Final Section",
          }
      }
    ],
    // Additional metadata for better compatibility with field-hierarchy.json
    sectionMetadata: {
        sectionNumber: 4,
        sectionTitle: "Social Security Number",
        ssnFormatExample: {
            value: "123456789",
            id: "9443",
            type: "PDFStaticText",
            label: "SSN Format Example"
        }
    }
};
