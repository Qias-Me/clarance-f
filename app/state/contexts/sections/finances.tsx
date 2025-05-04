import { type Finances } from "api/interfaces/sections/finances";

// finances covers section 26

export const finances: Finances = {
  _id: Math.random(),
  filedBankruptcy: {
    value: "NO",
    id: "15803",
    type: "PDFRadioGroup",
  },
  gamblingProblem: {
    value: "NO",
    id: "15862",
    type: "PDFRadioGroup",
  },
  missedTaxes: {
    value: "NO",
    id: "15843",
    type: "PDFRadioGroup",
  },
  companyViolation: {
    value: "NO",
    id: "15911",
    type: "PDFRadioGroup",
  },
  counseling: {
    value: "NO",
    id: "15885",
    type: "PDFRadioGroup",
  },
  delinquent: {
    value: "NO",
    id: "15939",
    type: "PDFRadioGroup",
  },
  reposessions: {
    value: "NO",
    id: "",
    type: "",
  },
  section26_1: [
    {
      _id: Math.random(),
      bankruptcyPetitionType: {
        value: "Chapter 7",
        id: "",
        type: "PDFRadioGroup",
      },
      courtDocketNumber: {
        value: "",
        id: "15808",
        type: "PDFTextField",
      },
      dateFiled: {
        date: {
          value: "",
          id: "15807",
          type: "PDFTextField",
        },
        estimated: {
          value: "NO",
          id: "15798",
          type: "PDFCheckBox",
        },
      },
      dateDischarged: {
        date: {
          value: "",
          id: "15797",
          type: "PDFTextField",
        },
        estimated: {
          value: "NO",
          id: "15806",
          type: "PDFCheckBox",
        },
        notApplicable: {
          value: "NO",
          id: "15796",
          type: "PDFCheckBox",
        },
      },
      amountInvolved: {
        amount: {
          value: 0,
          id: "15795",
          type: "PDFTextField",
        },
        estimated: {
          value: "NO",
          id: "15794",
          type: "PDFCheckBox",
        },
      },
      debtRecordedUnder: {
        lastName: {
          value: "",
          id: "15786",
          type: "PDFTextField",
        },
        firstName: {
          value: "",
          id: "15785",
          type: "PDFTextField",
        },
        middleName: {
          value: "",
          id: "15787",
          type: "PDFTextField",
        },
        suffix: {
          value: "",
          id: "15788",
          type: "PDFDropdown",
        },
      },
      courtName: {
        value: "",
        id: "15777",
        type: "PDFTextField",
      },
      courtAddress: {
        street: {
          value: "",
          id: "15793",
          type: "PDFTextField",
        },
        city: {
          value: "",
          id: "15792",
          type: "PDFTextField",
        },
        state: {
          value: "",
          id: "15791",
          type: "PDFDropdown",
        },
        zipCode: {
          value: "",
          id: "15789",
          type: "PDFTextField",
        },
        country: {
          value: "",
          id: "15790",
          type: "PDFDropdown",
        },
      },
      chapter13Details: {
        trusteeName: {
          value: "",
          id: "15779",
          type: "PDFTextField",
        },
        trusteeAddress: {
          street: {
            value: "",
            id: "15784",
            type: "PDFTextField",
          },
          city: {
            value: "",
            id: "15783",
            type: "PDFTextField",
          },
          state: {
            value: "",
            id: "15782",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "",
            id: "15780",
            type: "PDFTextField",
          },
          country: {
            value: "",
            id: "15781",
            type: "PDFDropdown",
          },
        },
      },
      dischargedOfAllDebts: {
        value: "NO",
        id: "15776",
        type: "PDFRadioGroup",
      },
      dischargeExplanation: {
        value: "",
        id: "15778",
        type: "PDFTextField",
      },
    },
  ],
  section26_2: [
    {
      _id: Math.random(),
      financialProblemsDueToGambling: {
        value: "NO",
        id: "15862",
        type: "PDFRadioGroup",
      },
      dateRange: {
        from: {
          date: {
            value: "",
            id: "15858",
            type: "PDFTextField",
          },
          estimated: {
            value: "NO",
            id: "15857",
            type: "PDFCheckBox",
          },
        },
        to: {
          date: {
            value: "",
            id: "15856",
            type: "PDFTextField",
          },
          estimated: {
            value: "NO",
            id: "15855",
            type: "PDFCheckBox",
          },
        },
        present: {
          value: "NO",
          id: "15859",
          type: "PDFCheckBox",
        },
      },
      gamblingLosses: {
        amount: {
          value: 0,
          id: "15860",
          type: "PDFTextField",
        },
        estimated: {
          value: "NO",
          id: "",
          type: "PDFCheckBox",
        },
      },
      descriptionOfFinancialProblems: {
        value: "",
        id: "15861",
        type: "PDFTextField",
      },
      actionsTaken: {
        value: "",
        id: "15854",
        type: "PDFTextField",
      },
    },
  ],
  section26_3: [
    {
      _id: Math.random(),
      failedToFileOrPay: {
        value: "File",
        id: "15842",
        type: "PDFRadioGroup",
      },
      yearFailed: {
        date: {
          value: "",
          id: "15845",
          type: "PDFTextField",
        },
        estimated: {
          value: "NO",
          id: "",
          type: "PDFCheckbox",
        },
      },
      failureReason: {
        value: "",
        id: "15834",
        type: "PDFTextField",
      },
      agencyName: {
        value: "",
        id: "15836",
        type: "PDFTextField",
      },
      taxType: {
        value: "",
        id: "15833",
        type: "PDFTextField",
      },
      amountInvolved: {
        amount: {
          value: 0,
          id: "15832",
          type: "PDFTextField",
        },
        estimated: {
          value: "NO",
          id: "15831",
          type: "PDFCheckBox",
        },
      },
      dateSatisfied: {
        date: {
          value: "",
          id: "15838",
          type: "PDFTextField",
        },
        estimated: {
          value: "NO",
          id: "15839",
          type: "PDFCheckBox",
        },
      },
      actionsTaken: {
        value: "",
        id: "15835",
        type: "PDFTextField",
      },
    },
  ],
  section26_4: [
    {
      _id: Math.random(),
      agencyOrCompanyName: {
        value: "",
        id: "15907",
        type: "PDFTextField",
      },
      agencyOrCompanyAddress: {
        street: {
          value: "",
          id: "15906",
          type: "PDFTextField",
        },
        city: {
          value: "",
          id: "15905",
          type: "PDFTextField",
        },
        state: {
          value: "",
          id: "15904",
          type: "PDFDropdown",
        },
        zipCode: {
          value: "",
          id: "15902",
          type: "PDFTextField",
        },
        country: {
          value: "",
          id: "15903",
          type: "PDFDropdown",
        },
      },
      counselingWarningDisciplinaryDate: {
        date: {
          value: "",
          id: "15909",
          type: "PDFTextField",
        },
        estimated: {
          value: "NO",
          id: "15908",
          type: "PDFCheckBox",
        },
      },
      counselingWarningDisciplinaryReason: {
        value: "",
        id: "15901",
        type: "PDFTextField",
      },
      violationAmount: {
        amount: {
          value: 0,
          id: "15899",
          type: "PDFTextField",
        },
        estimated: {
          value: "NO",
          id: "",
          type: "PDFCheckBox",
        },
      },
      rectifyingActions: {
        value: "",
        id: "15910",
        type: "PDFTextField",
      },
    },
  ],
  section26_5: [
    {
      _id: Math.random(),
      explanation: {
        value: "",
        id: "15883",
        type: "PDFTextField",
      },
      creditCounselingOrganizationName: {
        value: "",
        id: "15875",
        type: "PDFTextField",
      },
      creditCounselingOrganizationPhoneNumber: {
        number: {
          value: "",
          id: "15880",
          type: "PDFTextField",
        },
        extension: {
          value: "",
          id: "15879",
          type: "PDFTextField",
        },
        isInternationalOrDSN: {
          value: "NO",
          id: "15878",
          type: "PDFCheckBox",
        },
        timeOfDay: {
          value: "Day",
          id: "15877",
          type: "PDFCheckBox",
        },
      },
      creditCounselingOrganizationLocation: {
        street: {
          value: "",
          id: "15882",
          type: "PDFTextField",
        },
        city: {
          value: "",
          id: "15882",
          type: "PDFTextField",
        },
        state: {
          value: "",
          id: "15881",
          type: "PDFDropdown",
        },
        zipCode: {
          value: "",
          id: "15882",
          type: "PDFTextField",
        },
        country: {
          value: "",
          id: "15881",
          type: "PDFDropdown",
        },
      },
      counselingActions: {
        value: "",
        id: "15884",
        type: "PDFTextField",
      },
    },
  ],
  section26_6: [
    {
      _id: Math.random(),
      agencyName: {
        value: "",
        id: "15921",
        type: "PDFTextField",
      },
      doesInclude: {
        value: "NO",
        id: "15914",
        type: "PDFRadioGroup",
      },
      financialIssueTypes: [
        {
          _id: Math.random(),
          type: {
            value: "Delinquent on alimony or child support payments",
            id: "15919",
            type: "PDFCheckBox",
          },
        },
        {
          _id: Math.random(),
          type: {
            value: "Judgment entered against you",
            id: "15918",
            type: "PDFCheckBox",
          },
        },
        {
          _id: Math.random(),
          type: {
            value: "Lien placed against your property",
            id: "15917",
            type: "PDFCheckBox",
          },
        },
        {
          _id: Math.random(),
          type: {
            value: "Currently delinquent on any Federal debt",
            id: "15916",
            type: "PDFCheckBox",
          },
        },
      ],
      loanAccountNumbers: {
        value: "",
        id: "15937",
        type: "PDFTextField",
      },
      propertyInvolved: {
        value: "",
        id: "15934",
        type: "PDFTextField",
      },
      amountInvolved: {
        amount: {
          value: 0,
          id: "15935",
          type: "PDFTextField",
        },

        estimated: {
          value: "NO",
          id: "15936",
          type: "PDFCheckBox",
        },
      },
      issueReason: {
        value: "",
        id: "15933",
        type: "PDFTextField",
      },
      currentStatus: {
        value: "",
        id: "15932",
        type: "PDFTextField",
      },
      issueDate: {
        date: {
          value: "",
          id: "15931",
          type: "PDFTextField",
        },
        estimated: {
          value: "NO",
          id: "15930",
          type: "PDFCheckBox",
        },
      },
      resolutionDate: {
        date: {
          value: "",
          id: "15929",
          type: "PDFTextField",
        },
        estimated: {
          value: "NO",
          id: "15928",
          type: "PDFCheckBox",
        },
        notApplicable: {
          value: "NO",
          id: "15927",
          type: "PDFCheckBox",
        },
      },
      courtName: {
        value: "",
        id: "15927",
        type: "PDFTextField",
      },
      courtAddress: {
        street: {
          value: "",
          id: "15926",
          type: "PDFTextField",
        },
        city: {
          value: "",
          id: "15925",
          type: "PDFTextField",
        },
        state: {
          value: "",
          id: "15924",
          type: "PDFDropdown",
        },
        zipCode: {
          value: "",
          id: "15922",
          type: "PDFTextField",
        },
        country: {
          value: "",
          id: "15923",
          type: "PDFDropdown",
        },
      },
      actionsTaken: {
        value: "",
        id: "15938",
        type: "PDFTextField",
      },
    },
  ],
  section26_7: [
    {
      _id: Math.random(),
      agencyName: {
        value: "",
        id: "15949",
        type: "PDFTextField",
      },
      doesInclude: {
        value: "NO",
        id: "15942",
        type: "PDFRadioGroup",
      },
      financialIssueTypes: [
        {
          _id: Math.random(),
          type: {
            value: "Repossessed or foreclosed property",
            id: "15947",
            type: "PDFCheckBox",
          },
        },
      ],

      loanAccountNumbers: {
        value: "",
        id: "15965",
        type: "PDFTextField",
      },
      propertyInvolved: {
        value: "",
        id: "15962",
        type: "PDFTextField",
      },
      amountInvolved: {
        amount: {
          value: 0,
          id: "15963",
          type: "PDFTextField",
        },
        estimated: {
          value: "NO",
          id: "15964",
          type: "PDFCheckBox",
        },
      },
      issueReason: {
        value: "",
        id: "15961",
        type: "PDFTextField",
      },
      currentStatus: {
        value: "",
        id: "15960",
        type: "PDFTextField",
      },
      issueDate: {
        date: {
          value: "",
          id: "15959",
          type: "PDFTextField",
        },
        estimated: {
          value: "NO",
          id: "",
          type: "PDFCheckBox",
        },
        notApplicable: {
          value: "NO",
          id: "",
          type: "PDFCheckBox",
        },
      },
      resolutionDate: {
        date: {
          value: "",
          id: "15957",
          type: "PDFTextField",
        },
        estimated: {
          value: "NO",
          id: "",
          type: "PDFCheckBox",
        },
        notApplicable: {
          value: "NO",
          id: "",
          type: "PDFCheckBox",
        },
      },
      courtName: {
        value: "",
        id: "15955",
        type: "PDFTextField",
      },
      courtAddress: {
        street: {
          value: "",
          id: "15954",
          type: "PDFTextField",
        },
        city: {
          value: "",
          id: "15953",
          type: "PDFTextField",
        },
        state: {
          value: "",
          id: "15952",
          type: "PDFDropdown",
        },
        zipCode: {
          value: "",
          id: "15950",
          type: "PDFTextField",
        },
        country: {
          value: "",
          id: "15951",
          type: "PDFDropdown",
        },
      },
      actionsTaken: {
        value: "",
        id: "15966",
        type: "PDFTextField",
      },
    },
  ],
};
