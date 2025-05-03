import { DrugActivity } from "api/interfaces/sections/drugsActivity";

// drugActivity covers section 23

export const drugActivity: DrugActivity = {
  _id: Math.random(),
  hasUsed: {
    value: "NO",
    id: "15186",
    type: "PDFRadioGroup",
  },
  hasInvolvement: {
    value: "NO",
    id: "15185",
    type: "PDFRadioGroup",
  },
  illegalWhileProcessing: {
    value: "NO",
    id: "15256",
    type: "PDFRadioGroup",
  },
  usedWhilePublicSaftey: {
    value: "NO",
    id: "15255",
    type: "PDFRadioGroup",
  },
  usedNotPerscribed: {
    value: "NO",
    id: "15284",
    type: "PDFRadioGroup",
  },
  suggestedCounsoling: {
    value: "NO",
    id: "15283",
    type: "PDFRadioGroup",
  },
  voluntaryCounsoling: {
    value: "NO",
    id: "15288",
    type: "PDFRadioGroup",
  },
  section23_1: [
    {
      typeOfDrug: [
        {
          value: "Cocaine or crack cocaine (Such as rock, freebase, etc.)",
          id: "15174",
          type: "PDFCheckBox",
        },
        {
          value: "THC (Such as marijuana, weed, pot, hashish, etc.)",
          id: "15222",
          type: "PDFCheckBox",
        },
        {
          value: "Ketamine (Such as special K, jet, etc.)",
          id: "15221",
          type: "PDFCheckBox",
        },
        {
          value: "Narcotics (Such as opium, morphine, codeine, heroin, etc.)",
          id: "15220",
          type: "PDFCheckBox",
        },
        {
          value:
            "Stimulants (Such as amphetamines, speed, crystal meth, ecstasy, etc.)",
          id: "15219",
          type: "PDFCheckBox",
        },
        {
          value:
            "Depressants (Such as barbiturates, methaqualone, tranquilizers, etc.)",
          id: "15218",
          type: "PDFCheckBox",
        },
        {
          value: "Hallucinogenic (Such as LSD, PCP, mushrooms, etc.)",
          id: "15217",
          type: "PDFCheckBox",
        },
        {
          value: "Steroids (Such as the clear, juice, etc.)",
          id: "15216",
          type: "PDFCheckBox",
        },
        {
          value: "Inhalants (Such as toluene, amyl nitrate, etc.)",
          id: "15215",
          type: "PDFCheckBox",
        },
        {
          value: "Other",
          id: "15214",
          type: "PDFCheckBox",
        },
      ],
      otherDrugExplanation: { value: "", id: "15213", type: "PDFTextField" },
      firstUse: {
        date: { value: "", id: "15184", type: "PDFTextField" },
        estimated: { value: "NO", id: "15183", type: "PDFCheckBox" },
      },
      mostRecentUse: {
        date: { value: "", id: "15182", type: "PDFTextField" },
        estimated: { value: "NO", id: "15181", type: "PDFCheckBox" },
      },
      natureOfUseFrequencyTimes: {
        value: "",
        id: "15180",
        type: "PDFTextField",
      },
      useWhileEmployedInPublicSafety: {
        value: "NO",
        id: "15201",
        type: "PDFRadioGroup",
      },
      useWhilePossessingSecurityClearance: {
        value: "NO",
        id: "15179",
        type: "PDFRadioGroup",
      },
      intendToUseInFuture: {
        value: "NO",
        id: "15177",
        type: "PDFRadioGroup",
      },
      futureUseExplanation: { value: "", id: "15175", type: "PDFTextField" },
    },
  ],
  section23_2: [
    {
      typeOfDrug: [
        {
          value: "Cocaine or crack cocaine (Such as rock, freebase, etc.)",
          id: "15242",
          type: "PDFCheckBox",
        },
        {
          value: "THC (Such as marijuana, weed, pot, hashish, etc.)",
          id: "15241",
          type: "PDFCheckBox",
        },
        {
          value: "Ketamine (Such as special K, jet, etc.)",
          id: "15240",
          type: "PDFCheckBox",
        },
        {
          value: "Narcotics (Such as opium, morphine, codeine, heroin, etc.)",
          id: "15239",
          type: "PDFCheckBox",
        },
        {
          value:
            "Stimulants (Such as amphetamines, speed, crystal meth, ecstasy, etc.)",
          id: "15238",
          type: "PDFCheckBox",
        },
        {
          value:
            "Depressants (Such as barbiturates, methaqualone, tranquilizers, etc.)",
          id: "15237",
          type: "PDFCheckBox",
        },
        {
          value: "Hallucinogenic (Such as LSD, PCP, mushrooms, etc.)",
          id: "15236",
          type: "PDFCheckBox",
        },
        {
          value: "Steroids (Such as the clear, juice, etc.)",
          id: "15235",
          type: "PDFCheckBox",
        },
        {
          value: "Inhalants (Such as toluene, amyl nitrate, etc.)",
          id: "15234",
          type: "PDFCheckBox",
        },
        {
          value: "Other",
          id: "15233",
          type: "PDFCheckBox",
        },
      ],
      otherDrugExplanation: { value: "", id: "15272", type: "PDFTextField" },
      firstInvolvement: {
        date: { value: "", id: "15270", type: "PDFTextField" },
        estimated: { value: "NO", id: "15269", type: "PDFCheckBox" },
      },
      mostRecentInvolvement: {
        date: { value: "", id: "15268", type: "PDFTextField" },
        estimated: { value: "NO", id: "15267", type: "PDFCheckBox" },
      },
      natureAndFrequencyOfActivity: {
        value: "",
        id: "15271",
        type: "PDFTextField",
      },
      reasonsForActivity: { value: "", id: "15248", type: "PDFTextField" },
      involvementWhileEmployedInPublicSafety: {
        value: "NO",
        id: "15254",
        type: "PDFRadioGroup",
      },
      involvementWhilePossessingSecurityClearance: {
        value: "NO",
        id: "15252",
        type: "PDFRadioGroup",
      },
      intendToEngageInFuture: {
        value: "NO",
        id: "15250",
        type: "PDFRadioGroup",
      },
      futureEngagementExplanation: {
        value: "",
        id: "15266",
        type: "PDFTextField",
      },
    },
  ],
  section23_3: [
    {
      descriptionOfInvolvement: {
        value: "",
        id: "15277",
        type: "PDFTextField",
      },
      NumberOfTimesInvolved: { value: "", id: "15278", type: "PDFTextField" },
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
    },
    {
      descriptionOfInvolvement: {
        value: "",
        id: "15301",
        type: "PDFTextField",
      },
      NumberOfTimesInvolved: { value: "", id: "15302", type: "PDFTextField" },
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
    },
  ],
  section23_4: [
    {
      descriptionOfInvolvement: {
        value: "",
        id: "15285",
        type: "PDFTextField",
      },
      NumberOfTimesInvolved: { value: "", id: "15286", type: "PDFTextField" },
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
    },
    {
      descriptionOfInvolvement: {
        value: "",
        id: "15289",
        type: "PDFTextField",
      },
      NumberOfTimesInvolved: { value: "", id: "15290", type: "PDFTextField" },
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
    },
  ],
  section23_5: [
    {
      nameOfPrescriptionDrug: {
        value: "",
        id: "15310",
        type: "PDFTextField",
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
      reasonsForMisuse: { value: "", id: "15311", type: "PDFTextField" },
      involvementWhileEmployedInPublicSafety: {
        value: "NO",
        id: "15309",
        type: "PDFRadioGroup",
      },
      involvementWhilePossessingSecurityClearance: {
        value: "NO",
        id: "15331",
        type: "PDFRadioGroup",
      },
    },
    {
      nameOfPrescriptionDrug: {
        value: "",
        id: "15329",
        type: "PDFTextField",
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
      reasonsForMisuse: { value: "", id: "15330", type: "PDFTextField" },
      involvementWhileEmployedInPublicSafety: {
        value: "NO",
        id: "15328",
        type: "PDFRadioGroup",
      },
      involvementWhilePossessingSecurityClearance: {
        value: "NO",
        id: "15325",
        type: "PDFRadioGroup",
      },
    },
  ],
  section23_6: [
    {
      orderedBy: [
        {
          value:
            "An employer, military commander, or employee assistance program",
          id: "15366",
          type: "PDFRadioGroup",
        },
        {
          value: "A court official / judge",
          id: "15363",
          type: "PDFRadioGroup",
        },
        {
          value: "A medical professional",
          id: "15365",
          type: "PDFRadioGroup",
        },
        {
          value:
            "I have not been ordered, advised, or asked to seek counseling or treatment by any of the above.",
          id: "15362",
          type: "PDFRadioGroup",
        },
        {
          value: "A mental health professional",
          id: "15364",
          type: "PDFRadioGroup",
        },
      ],
      orderedExplanation: { value: "", id: "15361", type: "PDFTextField" },
      receivedTreatment: { value: "NO", id: "15359", type: "PDFRadioGroup" },
      noTreatmentExplanation: {
        value: "",
        id: "15358",
        type: "PDFTextField",
      },
      typeOfDrug: [
        {
          value: "Cocaine or crack cocaine (Such as rock, freebase, etc.)",
          id: "15341",
          type: "PDFRadioGroup",
        },
        {
          value: "THC (Such as marijuana, weed, pot, hashish, etc.)",
          id: "15340",
          type: "PDFRadioGroup",
        },
        {
          value: "Ketamine (Such as special K, jet, etc.)",
          id: "15339",
          type: "PDFRadioGroup",
        },
        {
          value: "Narcotics (Such as opium, morphine, codeine, heroin, etc.)",
          id: "15338",
          type: "PDFRadioGroup",
        },
        {
          value:
            "Stimulants (Such as amphetamines, speed, crystal meth, ecstasy, etc.)",
          id: "15337",
          type: "PDFRadioGroup",
        },
        {
          value:
            "Depressants (Such as barbiturates, methaqualone, tranquilizers, etc.)",
          id: "15336",
          type: "PDFRadioGroup",
        },
        {
          value: "Hallucinogenic (Such as LSD, PCP, mushrooms, etc.)",
          id: "15335",
          type: "PDFRadioGroup",
        },
        {
          value: "Steroids (Such as the clear, juice, etc.)",
          id: "15334",
          type: "PDFRadioGroup",
        },
        {
          value: "Inhalants (Such as toluene, amyl nitrate, etc.)",
          id: "15333",
          type: "PDFRadioGroup",
        },
        { value: "Other", id: "15332", type: "PDFRadioGroup" },
      ],
      otherDrugExplanation: { value: "", id: "15342", type: "PDFTextField" },
      treatmentProviderName: {
        lastName: { value: "", id: "15352", type: "PDFTextField" },
        firstName: { value: "", id: "15351", type: "PDFTextField" },
      },
      treatmentProviderAddress: {
        street: { value: "", id: "15357", type: "PDFTextField" },
        city: { value: "", id: "15356", type: "PDFTextField" },
        state: { value: "", id: "15355", type: "PDFDropdown" },
        zipCode: { value: "", id: "15353", type: "PDFTextField" },
        country: { value: "", id: "15354", type: "PDFDropdown" },
      },
      treatmentProviderPhone: {
        number: { value: "", id: "15350", type: "PDFTextField" },
        international: { value: "NO", id: "15348", type: "PDFCheckBox" },
        timeOfDay: { value: "Day", id: "15347", type: "PDFCheckBox" },
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
      successfullyCompleted: {
        value: "NO",
        id: "15345",
        type: "PDFRadioGroup",
      },
      completionExplanation: { value: "", id: "15343", type: "PDFTextField" },
    },
  ],
  section23_7: [
    {
      typeOfDrug: [
        {
          value: "Cocaine or crack cocaine (Such as rock, freebase, etc.)",
          id: "15480",
          type: "PDFRadioGroup",
        },
        {
          value: "THC (Such as marijuana, weed, pot, hashish, etc.)",
          id: "15479",
          type: "PDFRadioGroup",
        },
        {
          value: "Ketamine (Such as special K, jet, etc.)",
          id: "15478",
          type: "PDFRadioGroup",
        },
        {
          value: "Narcotics (Such as opium, morphine, codeine, heroin, etc.)",
          id: "15477",
          type: "PDFRadioGroup",
        },
        {
          value:
            "Stimulants (Such as amphetamines, speed, crystal meth, ecstasy, etc.)",
          id: "15476",
          type: "PDFRadioGroup",
        },
        {
          value:
            "Depressants (Such as barbiturates, methaqualone, tranquilizers, etc.)",
          id: "15475",
          type: "PDFRadioGroup",
        },
        {
          value: "Hallucinogenic (Such as LSD, PCP, mushrooms, etc.)",
          id: "15474",
          type: "PDFRadioGroup",
        },
        {
          value: "Steroids (Such as the clear, juice, etc.)",
          id: "15473",
          type: "PDFRadioGroup",
        },
        {
          value: "Inhalants (Such as toluene, amyl nitrate, etc.)",
          id: "15472",
          type: "PDFRadioGroup",
        },
        { value: "Other", id: "15471", type: "PDFRadioGroup" },
      ],
      otherDrugExplanation: { value: "", id: "15470", type: "PDFTextField" },
      treatmentProviderName: {
        lastName: { value: "", id: "15421", type: "PDFTextField" },
        firstName: { value: "", id: "15420", type: "PDFTextField" },
      },
      treatmentProviderAddress: {
        street: { value: "", id: "15436", type: "PDFTextField" },
        city: { value: "", id: "15435", type: "PDFTextField" },
        state: { value: "", id: "15434", type: "PDFDropdown" },
        zipCode: { value: "", id: "15432", type: "PDFTextField" },
        country: { value: "", id: "15433", type: "PDFDropdown" },
      },
      treatmentProviderPhone: {
        number: { value: "", id: "15426", type: "PDFTextField" },
        international: { value: "NO", id: "15424", type: "PDFCheckBox" },
        timeOfDay: { value: "Day", id: "15423", type: "PDFCheckBox" },
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
      successfullyCompleted: {
        value: "NO",
        id: "15419",
        type: "PDFRadioGroup",
      },
      completionExplanation: { value: "", id: "15417", type: "PDFTextField" },
    },
  ],
};
