import {type  NamesInfo } from "api/interfaces/sections/namesInfo";

// namesInfo covers section 5

export const namesInfo: NamesInfo = {
    hasNames: {
      value: "NO",
      id: "17241",
      type: "PDFRadioGroup",
      label: "RadioButtonList",
    },
    names: [
      {
        _id: 1,
        lastName: {
          value: "",
          id: "9500",
          type: "PDFTextField",
          label: "Complete the following if you have responded 'Yes' to having used other names. Provide your other name(s) used and the period of time you used it/them [for example: your maiden name(s), name(s) by a former marriage, former name(s), alias(es), or nickname(es)]. If you have only initials in your name(s), provide them and indicate \"Initial only.\" If you do not have a middle name (s), indicate \"No Middle Name\" (NMN). If you are a \"Jr.,\" \"Sr.,\" etc. enter this under Suffix. #1. Last name.",
        },
        firstName: {
          value: "",
          id: "9501",
          type: "PDFTextField",
          label: "First Name",
        },
        middleName: {
          value: "",
          id: "9502",
          type: "PDFTextField",
          label: "Middle Name",
        },
        suffix: {
          value: "",
          id: "9494",
          type: "PDFDropdown",
          label: "Suffix",
        },
        startDate: {
          date: {
            value: "",
            id: "9498",
            type: "PDFTextField",
            label: "Time name used. From (month/year)",
          },
          estimated: {
            value: "NO",
            id: "9493",
            type: "PDFCheckBox",
            label: "Estimate",
          },
        },
        endDate: {
          date: {
            value: "",
            id: "9497",
            type: "PDFTextField",
            label: "Time name used. To (month/year)",
          },
          estimated: {
            value: "NO",
            id: "9492",
            type: "PDFCheckBox",
            label: "Estimate",
          },
          isPresent: {
            value: "NO",
            id: "9491",
            type: "PDFCheckBox",
            label: "Present",
          },
        },
        isMaidenName: {
          value: "NO",
          id: "17240",
          type: "PDFRadioGroup",
          label: "RadioButtonList",
        },
        reasonChanged: {
          value: "",
          id: "9499",
          type: "PDFTextField",
          label: "Provide the reason(s) why the name changed",
        },
      },
      {
        _id: 2,
        lastName: {
          value: "",
          id: "9486",
          type: "PDFTextField",
          label: "#2. Last name.",
        },
        firstName: {
          value: "",
          id: "9487",
          type: "PDFTextField",
          label: "First Name",
        },
        middleName: {
          value: "",
          id: "9488",
          type: "PDFTextField",
          label: "Middle Name",
        },
        suffix: {
          value: "",
          id: "9480",
          type: "PDFDropdown",
          label: "Suffix",
        },
        startDate: {
          date: {
            value: "",
            id: "9484",
            type: "PDFTextField",
            label: "Time name used. From (month/year)",
          },
          estimated: {
            value: "NO",
            id: "9479",
            type: "PDFCheckBox",
            label: "Estimate",
          },
        },
        endDate: {
          date: {
            value: "",
            id: "9483",
            type: "PDFTextField",
            label: "Time name used. To (month/year)",
          },
          estimated: {
            value: "NO",
            id: "9478",
            type: "PDFCheckBox",
            label: "Estimate",
          },
          isPresent: {
            value: "NO",
            id: "9477",
            type: "PDFCheckBox",
            label: "Present",
          },
        },
        isMaidenName: {
          value: "NO",
          id: "17243",
          type: "PDFRadioGroup",
          label: "RadioButtonList",
        },
        reasonChanged: {
          value: "",
          id: "9485",
          type: "PDFTextField",
          label: "Provide the reason(s) why the name changed",
        },
      },
      {
        _id: 3,
        lastName: {
          value: "",
          id: "9474",
          type: "PDFTextField",
          label: "#3. Last name.",
        },
        firstName: {
          value: "",
          id: "9475",
          type: "PDFTextField",
          label: "First Name",
        },
        middleName: {
          value: "",
          id: "9476",
          type: "PDFTextField",
          label: "Middle Name",
        },
        suffix: {
          value: "",
          id: "9468",
          type: "PDFDropdown",
          label: "Suffix",
        },
        startDate: {
          date: {
            value: "",
            id: "9472",
            type: "PDFTextField",
            label: "Time name used. From (month/year)",
          },
          estimated: {
            value: "NO",
            id: "9467",
            type: "PDFCheckBox",
            label: "Estimate",
          },
        },
        endDate: {
          date: {
            value: "",
            id: "9471",
            type: "PDFTextField",
            label: "Time name used. To (month/year)",
          },
          estimated: {
            value: "NO",
            id: "9466",
            type: "PDFCheckBox",
            label: "Estimate",
          },
          isPresent: {
            value: "NO",
            id: "9465",
            type: "PDFCheckBox",
            label: "Present",
          },
        },
        isMaidenName: {
          value: "NO",
          id: "17245",
          type: "PDFRadioGroup",
          label: "RadioButtonList",
        },
        reasonChanged: {
          value: "",
          id: "9473",
          type: "PDFTextField",
          label: "Provide the reason(s) why the name changed",
        },
      },
      {
        _id: 4,
        lastName: {
          value: "",
          id: "9462",
          type: "PDFTextField",
          label: "#4. Last name.",
        },
        firstName: {
          value: "",
          id: "9463",
          type: "PDFTextField",
          label: "First Name",
        },
        middleName: {
          value: "",
          id: "9464",
          type: "PDFTextField",
          label: "Middle Name",
        },
        suffix: {
          value: "",
          id: "9456",
          type: "PDFDropdown",
          label: "Suffix",
        },
        startDate: {
          date: {
            value: "",
            id: "9460",
            type: "PDFTextField",
            label: "Time name used. From (month/year)",
          },
          estimated: {
            value: "NO",
            id: "9455",
            type: "PDFCheckBox",
            label: "Estimate",
          },
        },
        endDate: {
          date: {
            value: "",
            id: "9459",
            type: "PDFTextField",
            label: "Time name used. To (month/year)",
          },
          estimated: {
            value: "NO",
            id: "9454",
            type: "PDFCheckBox",
            label: "Estimate",
          },
          isPresent: {
            value: "NO",
            id: "9453",
            type: "PDFCheckBox",
            label: "Present",
          },
        },
        isMaidenName: {
          value: "NO",
          id: "17247",
          type: "PDFRadioGroup",
          label: "RadioButtonList",
        },
        reasonChanged: {
          value: "",
          id: "9461",
          type: "PDFTextField",
          label: "Provide the reason(s) why the name changed",
        },
      },
    ],
  };
