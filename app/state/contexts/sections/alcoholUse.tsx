import { type AlcoholUse } from "api/interfaces/sections/alcoholUse";

// alcoholUse covers section 24

export const alcoholUse: AlcoholUse = {
  _id: Math.random(),
  negativeImpact: {
    value: "NO",
    id: "15504",
    type: "PDFRadioGroup",
  },
  suggestedCounseling: {
    value: "NO",
    id: "15570",
    type: "PDFRadioGroup",
  },
  voluntaryCounseling: {
    value: "NO",
    id: "15582",
    type: "PDFRadioGroup",
  },
  additionalCounseling: {
    value: "NO",
    id: "15641",
    type: "PDFRadioGroup",
  },
  section24_1: [
    {
      _id: Math.random(),
      negativeImpactDate: {
        date: { value: "", id: "15282", type: "PDFTextField" },
        estimated: { value: "NO", id: "15279", type: "PDFCheckBox" },
      },
      datesOfInvolvement: {
        from: {
          date: { value: "", id: "15282", type: "PDFTextField" },
          estimated: { value: "NO", id: "15279", type: "PDFCheckBox" },
        },
        to: {
          date: { value: "", id: "15280", type: "PDFTextField" },
          estimated: { value: "NO", id: "15281", type: "PDFCheckBox" },
        },
        present: { value: "NO", id: "15275", type: "PDFCheckBox" },
      },
      circumstances: {
        value: "",
        id: "15500",
        type: "PDFTextField",
      },
      negativeImpact: {
        value: "",
        id: "15499",
        type: "PDFTextField",
      },
    },
    {
      _id: Math.random(),
      negativeImpactDate: {
        date: { value: "", id: "15282", type: "PDFTextField" },
        estimated: { value: "NO", id: "15279", type: "PDFCheckBox" },
      },
      datesOfInvolvement: {
        from: {
          date: { value: "", id: "15282", type: "PDFTextField" },
          estimated: { value: "NO", id: "15279", type: "PDFCheckBox" },
        },
        to: {
          date: { value: "", id: "15280", type: "PDFTextField" },
          estimated: { value: "NO", id: "15281", type: "PDFCheckBox" },
        },
        present: { value: "NO", id: "15275", type: "PDFCheckBox" },
      },
      circumstances: {
        value: "",
        id: "15491",
        type: "PDFTextField",
      },
      negativeImpact: {
        value: "",
        id: "15490",
        type: "PDFTextField",
      },
    },
    {
      _id: Math.random(),
      negativeImpactDate: {
        date: { value: "", id: "15282", type: "PDFTextField" },
        estimated: { value: "NO", id: "15279", type: "PDFCheckBox" },
      },
      datesOfInvolvement: {
        from: {
          date: { value: "", id: "15282", type: "PDFTextField" },
          estimated: { value: "NO", id: "15279", type: "PDFCheckBox" },
        },
        to: {
          date: { value: "", id: "15280", type: "PDFTextField" },
          estimated: { value: "NO", id: "15281", type: "PDFCheckBox" },
        },
        present: { value: "NO", id: "15275", type: "PDFCheckBox" },
      },
      circumstances: {
        value: "",
        id: "15482",
        type: "PDFTextField",
      },
      negativeImpact: {
        value: "",
        id: "15481",
        type: "PDFTextField",
      },
    },
    {
      _id: Math.random(),
      negativeImpactDate: {
        date: { value: "", id: "15282", type: "PDFTextField" },
        estimated: { value: "NO", id: "15279", type: "PDFCheckBox" },
      },
      datesOfInvolvement: {
        from: {
          date: { value: "", id: "15282", type: "PDFTextField" },
          estimated: { value: "NO", id: "15279", type: "PDFCheckBox" },
        },
        to: {
          date: { value: "", id: "15280", type: "PDFTextField" },
          estimated: { value: "NO", id: "15281", type: "PDFCheckBox" },
        },
        present: { value: "NO", id: "15275", type: "PDFCheckBox" },
      },
      circumstances: {
        value: "",
        id: "15512",
        type: "PDFTextField",
      },
      negativeImpact: {
        value: "",
        id: "15511",
        type: "PDFTextField",
      },
    },
  ],
  section24_2: [
    {
      _id: Math.random(),
      orderedBy: {
        value:
          "An employer, military commander, or employee assistance program",
        id: "15579",
        type: "PDFRadioGroup",
      },
      actionTaken: { value: "NO", id: "15564", type: "PDFRadioGroup" },
      noActionExplanation: {
        value: "",
        id: "15563",
        type: "PDFTextField",
      },
      actionDetails: {
        dateRange: {
          from: {
            date: { value: "", id: "15282", type: "PDFTextField" },
            estimated: { value: "NO", id: "15279", type: "PDFCheckBox" },
          },
          to: {
            date: { value: "", id: "15280", type: "PDFTextField" },
            estimated: { value: "NO", id: "15281", type: "PDFCheckBox" },
          },
          present: { value: "NO", id: "15275", type: "PDFCheckBox" },
        },
        providerName: {
         value: "Sect24 value",
          id:  "15557",
          type: "PDFTextField",
        },
        providerAddress: {
          street: {
            value: "",
            id: "15562",
            type: "PDFTextField",
          },
          city: {
            value: "",
            id: "15561",
            type: "PDFTextField",
          },
          state: {
            value: "",
            id: "15560",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "",
            id: "15558",
            type: "PDFTextField",
          },
          country: {
            value: "",
            id: "15559",
            type: "PDFDropdown",
          },
        },
        providerPhone: {
          number: {
            value: "",
            id: "15567",
            type: "PDFTextField",
          },
          isInternationalOrDSN: {
            value: "NO",
            id: "15573",
            type: "PDFCheckBox",
          },
          timeOfDay: {
            value: "Day",
            id: "15572",
            type: "PDFCheckBox",
          },
          extension: {
            value: "",
            id: "15568",
            type: "PDFTextField",
          },
        },

        treatmentCompletion: {
          value: "NO",
          id: "15556",
          type: "PDFRadioGroup",
        },
        completionExplanation: {
          value: "Sect24 value",
          id: "15554",
          type: "PDFTextField",
        },
      },
    },
  ],
  section24_3: [
    {
      _id: Math.random(),
      dateRange: {
        from: {
          date: { value: "", id: "15282", type: "PDFTextField" },
          estimated: { value: "NO", id: "15279", type: "PDFCheckBox" },
        },
        to: {
          date: { value: "", id: "15280", type: "PDFTextField" },
          estimated: { value: "NO", id: "15281", type: "PDFCheckBox" },
        },
        present: { value: "NO", id: "15275", type: "PDFCheckBox" },
      },
      providerName: {
        value: "",
        id: "15611",
        type: "PDFTextField",
      },
      providerAddress: {
        street: {
          value: "Sect24 value",
          id: "15621",
          type: "PDFTextField",
        },
        city: {
          value: "Sect24 value",
          id: "15620",
          type: "PDFTextField",
        },
        state: {
          value: "Sect24 value",
          id: "15619",
          type: "PDFDropdown",
        },
        zipCode: {
          value: "Sect24 value",
          id: "15617",
          type: "PDFTextField",
        },
        country: {
          value: "Sect24 value",
          id: "15618",
          type: "PDFDropdown",
        },
      },
      providerPhone: {
        number: {
          value: "Sect24 value",
          id: "15616",
          type: "PDFTextField",
        },
        isInternationalOrDSN: {
          value: "NO",
          id: "15614",
          type: "PDFCheckBox",
        },
        timeOfDay: {
          value: "Day",
          id: "15613",
          type: "PDFCheckBox",
        },
        extension: {
          value: "Sect24 value",
          id: "15615",
          type: "PDFTextField",
        },
      },
      treatmentCompletion: {
        value: "NO",
        id: "15605",
        type: "PDFRadioGroup",
      },
      completionExplanation: {
        value: "",
        id: "15603",
        type: "PDFTextField",
      },
    },
  ],
  section24_4: [
    {
      _id: Math.random(),
      counselorName: {
        value: "",
        id: "15591",
        type: "PDFTextField",
      },
      counselorAddress: {
        street: {
          value: "Sect24 value",
          id: "15601",
          type: "PDFTextField",
        },
        city: {
          value: "Sect24 value",
          id: "15600",
          type: "PDFTextField",
        },
        state: {
          value: "Sect24 value",
          id: "15599",
          type: "PDFDropdown",
        },
        zipCode: {
          value: "Sect24 value",
          id: "15597",
          type: "PDFTextField",
        },
        country: {
          value: "Sect24 value",
          id: "15598",
          type: "PDFDropdown",
        },
      },
      agencyName: {
        value: "",
        id: "15622",
        type: "PDFTextField",
      },
      agencyAddress: {
        street: {
          value: "Sect24 value",
          id: "15633",
          type: "PDFTextField",
        },
        city: {
          value: "Sect24 value",
          id: "15632",
          type: "PDFTextField",
        },
        state: {
          value: "Sect24 value",
          id: "15631",
          type: "PDFDropdown",
        },
        zipCode: {
          value: "Sect24 value",
          id: "15629",
          type: "PDFTextField",
        },
        country: {
          value: "Sect24 value",
          id: "15630",
          type: "PDFDropdown",
        },
      },
      dateRange: {
        from: {
          date: { value: "", id: "15282", type: "PDFTextField" },
          estimated: { value: "NO", id: "15279", type: "PDFCheckBox" },
        },
        to: {
          date: { value: "", id: "15280", type: "PDFTextField" },
          estimated: { value: "NO", id: "15281", type: "PDFCheckBox" },
        },
        present: { value: "NO", id: "15275", type: "PDFCheckBox" },
      },
      treatmentCompletion: {
        value: "NO",
        id: "15665",
        type: "PDFRadioGroup",
      },
      completionExplanation: {
        value: "",
        id: "15663",
        type: "PDFTextField",
      },
    },
  ],
};
