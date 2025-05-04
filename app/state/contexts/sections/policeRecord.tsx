import { type PoliceRecord } from "api/interfaces/sections/policeRecord";

// policeRecord covers section 22

export const policeRecord: PoliceRecord = {
  _id: Math.random(),
  part1Questions: {
    value: "NO",
    id: "14873",
    type: "PDFRadioGroup",
  },
  part2Questions: {
    value: "NO",
    id: "14925",
    type: "PDFRadioGroup",
  },
  restrainingOrder: {
    value: "NO",
    id: "",
    type: "PDFRadioGroup",
  },
  section22_1: [
    {
      dateOfOffense: {
        date: {
          value: "",
          id: "",
          type: "PDFTextField",
        },
        estimated: { value: "NO", id: "14920", type: "PDFCheckBox" },
      },
      description: { value: "", id: "14919", type: "PDFTextField" },
      involvedDomesticViolence: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      involvedFirearms: { value: "NO", id: "14876", type: "PDFCheckBox" },
      involvedAlcoholDrugs: {
        value: "NO",
        id: "14875",
        type: "PDFCheckBox",
      },
      offenseLocation: {
        city: { value: "", id: "14918", type: "PDFTextField" },
        county: { value: "", id: "14878", type: "PDFTextField" },
        state: { value: "", id: "14917", type: "PDFDropdown" },
        zip: { value: "", id: "14915", type: "PDFTextField" },
        country: { value: "", id: "14916", type: "PDFDropdown" },
      },
      arrestedSummonedCited: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      lawEnforcementAgencyName: {
        value: "",
        id: "14912",
        type: "PDFTextField",
      },
      lawEnforcementLocation: {
        city: { value: "", id: "14911", type: "PDFTextField" },
        county: { value: "", id: "14879", type: "PDFTextField" },
        state: { value: "", id: "14910", type: "PDFDropdown" },
        zip: { value: "", id: "14908", type: "PDFTextField" },
        country: { value: "", id: "14909", type: "PDFDropdown" },
      },
      chargedConvicted: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      courtName: { value: "", id: "14922", type: "PDFTextField" },
      courtLocation: {
        city: { value: "", id: "14905", type: "PDFTextField" },
        county: { value: "", id: "14880", type: "PDFTextField" },
        state: { value: "", id: "14904", type: "PDFDropdown" },
        zip: { value: "", id: "14902", type: "PDFTextField" },
        country: { value: "", id: "14903", type: "PDFDropdown" },
      },
      charges: [
        {
          _id: Math.random(),
          felonyMisdemeanor: {
            value: "Felony",
            id: "14900",
            type: "PDFDropdown",
          },
          charge: { value: "", id: "14899", type: "PDFTextField" },
          outcome: { value: "", id: "14898", type: "PDFTextField" },
          dateInfo: {
            date: {
              value: "",
              id: "",
              type: "PDFTextField",
            },
            estimated: { value: "NO", id: "14897", type: "PDFTextField" },
          },
        },
      ],
      sentenced: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      sentenceDescription: { value: "", id: "14928", type: "PDFTextField" },
      imprisonmentTermExceeding1Year: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      imprisonmentLessThan1Year: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      imprisonmentDates: {
        from: { value: "", id: "14946", type: "PDFTextField" },
        to: { value: "", id: "14932", type: "PDFTextField" },
        estimated: {
          value: "NO",
          id: "",
          type: "PDFCheckBox",
        },
        present: { value: "NO", id: "14931", type: "PDFCheckBox" },
      },
      probationParoleDates: {
        from: { value: "", id: "14944", type: "PDFTextField" },
        to: { value: "", id: "14942", type: "PDFTextField" },
        estimated: {
          value: "NO",
          id: "",
          type: "PDFCheckBox",
        },
        present: { value: "NO", id: "14941", type: "PDFCheckBox" },
      },
      awaitingTrial: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      awaitingTrialExplanation: {
        value: "",
        id: "14936",
        type: "PDFTextField",
      },
    },
  ],
  section22_2: [
    {
      dateOfOffense: {
        date: {
          value: "",
          id: "",
          type: "PDFTextField",
        },
        estimated: { value: "NO", id: "14996", type: "PDFRadioGroup" },
      },
      description: { value: "", id: "14991", type: "PDFTextField" },
      involvedDomesticViolence: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      involvedFirearms: { value: "NO", id: "14999", type: "PDFCheckBox" },
      involvedAlcoholDrugs: {
        value: "NO",
        id: "14998",
        type: "PDFCheckBox",
      },
      courtName: { value: "", id: "14994", type: "PDFTextField" },
      courtLocation: {
        city: { value: "", id: "14977", type: "PDFTextField" },
        county: { value: "", id: "14952", type: "PDFTextField" },
        state: { value: "", id: "14976", type: "PDFDropdown" },
        zip: { value: "", id: "14974", type: "PDFTextField" },
        country: { value: "", id: "14975", type: "PDFDropdown" },
      },
      charges: [
        {
          _id: Math.random(),
          felonyMisdemeanor: {
            value: "Felony",
            id: "14972",
            type: "PDFDropdown",
          },
          charge: { value: "", id: "14971", type: "PDFTextField" },
          outcome: { value: "", id: "14970", type: "PDFTextField" },
          dateInfo: {
            date: {
              value: "",
              id: "",
              type: "PDFTextField",
            },
            estimated: { value: "NO", id: "14969", type: "PDFTextField" },
          },
        },
      ],
      sentenced: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      sentenceDescription: { value: "", id: "15019", type: "PDFTextField" },
      imprisonmentTermExceeding1Year: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      imprisonmentLessThan1Year: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      imprisonmentDates: {
        from: { value: "", id: "15014", type: "PDFTextField" },
        to: { value: "", id: "15012", type: "PDFTextField" },
        estimated: {
          value: "NO",
          id: "",
          type: "PDFCheckBox",
        },
        present: { value: "NO", id: "15011", type: "PDFCheckBox" },
      },
      probationParoleDates: {
        from: { value: "", id: "15009", type: "PDFTextField" },
        to: { value: "", id: "15007", type: "PDFTextField" },
        estimated: {
          value: "NO",
          id: "",
          type: "PDFCheckBox",
        },
        present: { value: "NO", id: "15006", type: "PDFCheckBox" },
      },
      awaitingTrial: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      awaitingTrialExplanation: {
        value: "",
        id: "15000",
        type: "PDFTextField",
      },
    },
  ],
  section22_3: [
    {
      hasRestrainingOrder: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      orders: [
        {
          explanation: { value: "", id: "15168", type: "PDFTextField" },
          dateIssued: {
            date: {
              value: "",
              id: "",
              type: "PDFTextField",
            },
            estimated: { value: "NO", id: "15169", type: "PDFCheckBox" },
          },
          courtAgencyName: { value: "", id: "15167", type: "PDFTextField" },
          courtAgencyLocation: {
            city: { value: "", id: "15166", type: "PDFTextField" },
            county: { value: "", id: "", type: "PDFTextField" },
            state: { value: "", id: "15165", type: "PDFDropdown" },
            zip: { value: "", id: "15163", type: "PDFTextField" },
            country: { value: "", id: "15164", type: "PDFDropdown" },
          },
        },
      ],
    },
  ],
};
