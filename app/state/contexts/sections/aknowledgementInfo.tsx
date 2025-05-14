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
      value: "Yes",
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
              id: "11320",
              type: "PDFTextField",
              label: "SSN - Section13_4[3]",
          }
      },
      {
          ssn: {
              value: "",
              id: "11358",
              type: "PDFTextField",
              label: "SSN - Section13_5",
          }
      },
      // Section 14-15
      {
          ssn: {
              value: "",
              id: "11411",
              type: "PDFTextField",
              label: "SSN - Section14_1",
          }
      },
      {
          ssn: {
              value: "",
              id: "11481",
              type: "PDFTextField",
              label: "SSN - Section15_2",
          }
      },
      {
          ssn: {
              value: "",
              id: "11493",
              type: "PDFTextField",
              label: "SSN - Section15_3",
          }
      },
      // Section 16
      {
          ssn: {
              value: "",
              id: "11591",
              type: "PDFTextField",
              label: "SSN - Section16_1",
          }
      },
      {
          ssn: {
              value: "",
              id: "11622",
              type: "PDFTextField",
              label: "SSN - Section16_3",
          }
      },
      // Section 17
      {
          ssn: {
              value: "",
              id: "11775",
              type: "PDFTextField",
              label: "SSN - Section17_1",
          }
      },
      {
          ssn: {
              value: "",
              id: "11825",
              type: "PDFTextField",
              label: "SSN - Section17_1_2",
          }
      },
      {
          ssn: {
              value: "",
              id: "11863",
              type: "PDFTextField",
              label: "SSN - Section17_2",
          }
      },
      {
          ssn: {
              value: "",
              id: "11896",
              type: "PDFTextField",
              label: "SSN - Section17_2_2",
          }
      },
      {
          ssn: {
              value: "",
              id: "11956",
              type: "PDFTextField",
              label: "SSN - Section17_3",
          }
      },
      {
          ssn: {
              value: "",
              id: "12061",
              type: "PDFTextField",
              label: "SSN - Section17_3_2",
          }
      },
      // Section 18
      {
          ssn: {
              value: "",
              id: "12147",
              type: "PDFTextField",
              label: "SSN - Section18_1[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12150",
              type: "PDFTextField",
              label: "SSN - Section18_2[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12250",
              type: "PDFTextField",
              label: "SSN - Section18_3[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12297",
              type: "PDFTextField",
              label: "SSN - Section18_1_1[0]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12351",
              type: "PDFTextField",
              label: "SSN - Section18_2[1]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12392",
              type: "PDFTextField",
              label: "SSN - Section18_3[1]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12447",
              type: "PDFTextField",
              label: "SSN - Section18_1_1[1]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12524",
              type: "PDFTextField",
              label: "SSN - Section18_2[2]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12596",
              type: "PDFTextField",
              label: "SSN - Section18_3[2]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12650",
              type: "PDFTextField",
              label: "SSN - Section18_1_1[2]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12697",
              type: "PDFTextField",
              label: "SSN - Section18_2[3]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12702",
              type: "PDFTextField",
              label: "SSN - Section18_3[3]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12797",
              type: "PDFTextField",
              label: "SSN - Section18_1_1[3]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12859",
              type: "PDFTextField",
              label: "SSN - Section18_2[4]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12942",
              type: "PDFTextField",
              label: "SSN - Section18_3[4]",
          }
      },
      {
          ssn: {
              value: "",
              id: "12944",
              type: "PDFTextField",
              label: "SSN - Section18_1_1[4]",
          }
      },
      {
          ssn: {
              value: "",
              id: "13043",
              type: "PDFTextField",
              label: "SSN - Section18_2[5]",
          }
      },
      {
          ssn: {
              value: "",
              id: "13115",
              type: "PDFTextField",
              label: "SSN - Section18_3[5]",
          }
      },
      // Section 19
      {
          ssn: {
              value: "",
              id: "13142",
              type: "PDFTextField",
              label: "SSN - Section19_1",
          }
      },
      {
          ssn: {
              value: "",
              id: "13265",
              type: "PDFTextField",
              label: "SSN - Section19_2",
          }
      },
      {
          ssn: {
              value: "",
              id: "13354",
              type: "PDFTextField",
              label: "SSN - Section19_3",
          }
      },
      {
          ssn: {
              value: "",
              id: "13378",
              type: "PDFTextField",
              label: "SSN - Section19_4",
          }
      },
      // Section 20
      {
          ssn: {
              value: "",
              id: "13445",
              type: "PDFTextField",
              label: "SSN - Section20a",
          }
      },
      {
          ssn: {
              value: "",
              id: "13521",
              type: "PDFTextField",
              label: "SSN - Section20a2",
          }
      },
      // Subforms
      {
          ssn: {
              value: "",
              id: "13569",
              type: "PDFTextField",
              label: "SSN - Subform 68",
          }
      },
      {
          ssn: {
              value: "",
              id: "13578",
              type: "PDFTextField",
              label: "SSN - Subform 69",
          }
      },
      {
          ssn: {
              value: "",
              id: "13655",
              type: "PDFTextField",
              label: "SSN - Subform 70",
          }
      },
      {
          ssn: {
              value: "",
              id: "13701",
              type: "PDFTextField",
              label: "SSN - Subform 71",
          }
      },
      {
          ssn: {
              value: "",
              id: "13760",
              type: "PDFTextField",
              label: "SSN - Subform 72",
          }
      },
      {
          ssn: {
              value: "",
              id: "13817",
              type: "PDFTextField",
              label: "SSN - Subform 74",
          }
      },
      {
          ssn: {
              value: "",
              id: "13850",
              type: "PDFTextField",
              label: "SSN - Subform 76",
          }
      },
      {
          ssn: {
              value: "",
              id: "13899",
              type: "PDFTextField",
              label: "SSN - Subform 77",
          }
      },
      {
          ssn: {
              value: "",
              id: "13932",
              type: "PDFTextField",
              label: "SSN - Subform 78",
          }
      },
      {
          ssn: {
              value: "",
              id: "13974",
              type: "PDFTextField",
              label: "SSN - Subform 79",
          }
      },
      {
          ssn: {
              value: "",
              id: "14012",
              type: "PDFTextField",
              label: "SSN - Subform 80",
          }
      },
      {
          ssn: {
              value: "",
              id: "14077",
              type: "PDFTextField",
              label: "SSN - Subform 83/84",
          }
      },
      {
          ssn: {
              value: "",
              id: "14117",
              type: "PDFTextField",
              label: "SSN - Subform 87",
          }
      },
      {
          ssn: {
              value: "",
              id: "14155",
              type: "PDFTextField",
              label: "SSN - Subform 89",
          }
      },
      {
          ssn: {
              value: "",
              id: "14166",
              type: "PDFTextField",
              label: "SSN - Subform 91",
          }
      },
      {
          ssn: {
              value: "",
              id: "14233",
              type: "PDFTextField",
              label: "SSN - Subform 92",
          }
      },
      {
          ssn: {
              value: "",
              id: "14255",
              type: "PDFTextField",
              label: "SSN - Subform 93",
          }
      },
      {
          ssn: {
              value: "",
              id: "14295",
              type: "PDFTextField",
              label: "SSN - Subform 94",
          }
      },
      {
          ssn: {
              value: "",
              id: "14356",
              type: "PDFTextField",
              label: "SSN - Subform 95",
          }
      },
      // Section 21
      {
          ssn: {
              value: "",
              id: "14383",
              type: "PDFTextField",
              label: "SSN - Section21a",
          }
      },
      {
          ssn: {
              value: "",
              id: "14432",
              type: "PDFTextField",
              label: "SSN - Section21a2",
          }
      },
      {
          ssn: {
              value: "",
              id: "14460",
              type: "PDFTextField",
              label: "SSN - Section21b",
          }
      },
      {
          ssn: {
              value: "",
              id: "14463",
              type: "PDFTextField",
              label: "SSN - Section21b2",
          }
      },
      {
          ssn: {
              value: "",
              id: "14534",
              type: "PDFTextField",
              label: "SSN - Section21c",
          }
      },
      {
          ssn: {
              value: "",
              id: "14620",
              type: "PDFTextField",
              label: "SSN - Section21d1",
          }
      },
      {
          ssn: {
              value: "",
              id: "14689",
              type: "PDFTextField",
              label: "SSN - Section21d2",
          }
      },
      {
          ssn: {
              value: "",
              id: "14705",
              type: "PDFTextField",
              label: "SSN - Section21d3",
          }
      },
      {
          ssn: {
              value: "",
              id: "14765",
              type: "PDFTextField",
              label: "SSN - Section21e",
          }
      },
      {
          ssn: {
              value: "",
              id: "14872",
              type: "PDFTextField",
              label: "SSN - Section21e1",
          }
      },
      // Section 22
      {
          ssn: {
              value: "",
              id: "14874",
              type: "PDFTextField",
              label: "SSN - Section22_1",
          }
      },
      {
          ssn: {
              value: "",
              id: "14935",
              type: "PDFTextField",
              label: "SSN - Section22_2",
          }
      },
      {
          ssn: {
              value: "",
              id: "14997",
              type: "PDFTextField",
              label: "SSN - Section22_3",
          }
      },
      {
          ssn: {
              value: "",
              id: "15022",
              type: "PDFTextField",
              label: "SSN - Section22_4",
          }
      },
      {
          ssn: {
              value: "",
              id: "15038",
              type: "PDFTextField",
              label: "SSN - Section22_5",
          }
      },
      {
          ssn: {
              value: "",
              id: "15088",
              type: "PDFTextField",
              label: "SSN - Section22_6",
          }
      },
      // Section 23
      {
          ssn: {
              value: "",
              id: "15273",
              type: "PDFTextField",
              label: "SSN - Section23_2",
          }
      },
      {
          ssn: {
              value: "",
              id: "15202",
              type: "PDFTextField",
              label: "SSN - Section23_1",
          }
      },
      {
          ssn: {
              value: "",
              id: "15276",
              type: "PDFTextField",
              label: "SSN - Section_23_3",
          }
      },
      {
          ssn: {
              value: "",
              id: "15324",
              type: "PDFTextField",
              label: "SSN - Section_23_4",
          }
      },
      {
          ssn: {
              value: "",
              id: "15374",
              type: "PDFTextField",
              label: "SSN - Section_23_5",
          }
      },
      {
          ssn: {
              value: "",
              id: "15412",
              type: "PDFTextField",
              label: "SSN - Section_23_6_1",
          }
      },
      {
          ssn: {
              value: "",
              id: "15416",
              type: "PDFTextField",
              label: "SSN - Section_23_6",
          }
      },
      // Section 24
      {
          ssn: {
              value: "",
              id: "15505",
              type: "PDFTextField",
              label: "SSN - Section24",
          }
      },
      {
          ssn: {
              value: "",
              id: "15580",
              type: "PDFTextField",
              label: "SSN - Section24_2",
          }
      },
      {
          ssn: {
              value: "",
              id: "15602",
              type: "PDFTextField",
              label: "SSN - Section24_3",
          }
      },
      {
          ssn: {
              value: "",
              id: "15666",
              type: "PDFTextField",
              label: "SSN - Section24_4",
          }
      },
      // Section 25
      {
          ssn: {
              value: "",
              id: "15729",
              type: "PDFTextField",
              label: "SSN - Section25",
          }
      },
      {
          ssn: {
              value: "",
              id: "15748",
              type: "PDFTextField",
              label: "SSN - Section25_2",
          }
      },
      // Section 26
      {
          ssn: {
              value: "",
              id: "15805",
              type: "PDFTextField",
              label: "SSN - Section26",
          }
      },
      {
          ssn: {
              value: "",
              id: "15864",
              type: "PDFTextField",
              label: "SSN - Section26_2",
          }
      },
      {
          ssn: {
              value: "",
              id: "15913",
              type: "PDFTextField",
              label: "SSN - Section26_3",
          }
      },
      {
          ssn: {
              value: "",
              id: "15941",
              type: "PDFTextField",
              label: "SSN - Section26_6",
          }
      },
      {
          ssn: {
              value: "",
              id: "15967",
              type: "PDFTextField",
              label: "SSN - Section26_7",
          }
      },
      {
          ssn: {
              value: "",
              id: "15976",
              type: "PDFTextField",
              label: "SSN - Section26_8",
          }
      },
      {
          ssn: {
              value: "",
              id: "16017",
              type: "PDFTextField",
              label: "SSN - Section26_9",
          }
      },
      // Section 27-29
      {
          ssn: {
              value: "",
              id: "16058",
              type: "PDFTextField",
              label: "SSN - Section27",
          }
      },
      {
          ssn: {
              value: "",
              id: "16079",
              type: "PDFTextField",
              label: "SSN - Section27_2",
          }
      },
      {
          ssn: {
              value: "",
              id: "16100",
              type: "PDFTextField",
              label: "SSN - Section28",
          }
      },
      {
          ssn: {
              value: "",
              id: "16139",
              type: "PDFTextField",
              label: "SSN - Section29",
          }
      },
      {
          ssn: {
              value: "",
              id: "16168",
              type: "PDFTextField",
              label: "SSN - Section29_2",
          }
      },
      {
          ssn: {
              value: "",
              id: "16203",
              type: "PDFTextField",
              label: "SSN - Section29_3",
          }
      },
      {
          ssn: {
              value: "",
              id: "16238",
              type: "PDFTextField",
              label: "SSN - Section29_4",
          }
      },
      {
          ssn: {
              value: "",
              id: "16257",
              type: "PDFTextField",
              label: "SSN - Section29_5",
          }
      },
      // Continuation pages
      {
          ssn: {
              value: "",
              id: "16260",
              type: "PDFTextField",
              label: "SSN - Continuation1",
          }
      },
      {
          ssn: {
              value: "",
              id: "16271",
              type: "PDFTextField",
              label: "SSN - Continuation2-1",
          }
      },
      {
          ssn: {
              value: "",
              id: "16268",
              type: "PDFTextField",
              label: "SSN - Continuation2-2",
          }
      },
      {
          ssn: {
              value: "",
              id: "16286",
              type: "PDFTextField",
              label: "SSN - Continuation3-1",
          }
      },
      {
          ssn: {
              value: "",
              id: "16280",
              type: "PDFTextField",
              label: "SSN - Continuation3-2",
          }
      },
      {
          ssn: {
              value: "",
              id: "16290",
              type: "PDFTextField",
              label: "SSN - Continuation4-1",
          }
      },
      {
          ssn: {
              value: "",
              id: "16287",
              type: "PDFTextField",
              label: "SSN - Continuation4-2",
          }
      }
    ]
};
