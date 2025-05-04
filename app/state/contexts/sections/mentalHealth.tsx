import { type MentalHealth } from "api/interfaces/sections/mentalHealth";

// mentalHealth covers msection 21

export const mentalHealth: MentalHealth = {
  _id: Math.random(),
  declaredMentallyIncompetent: {
    value: "NO",
    id: "14351",
    type: "PDFRadioGroup",
  },
  consultMentalHealth: {
    value: "NO",
    id: "14352",
    type: "PDFRadioGroup",
  },
  hospitalizedMentalHealth: {
    value: "NO",
    id: "14353",
    type: "PDFRadioGroup",
  },
  beenDiagnosed: {
    value: "NO",
    id: "14354",
    type: "PDFRadioGroup",
  },
  delayedTreatment: {
    value: "NO",
    id: "14355",
    type: "PDFRadioGroup",
  },
  currentlyInTreatment: {
    value: "NO",
    id: "14356",
    type: "PDFRadioGroup",
  },
  substantialAffects: {
    value: "NO",
    id: "14357",
    type: "PDFRadioGroup",
  },
  counseling: {
    value: "NO",
    id: "14358",
    type: "PDFRadioGroup",
  },
  section21A: [
    {
      dateOccurred: {
        value: "",
        id: "14378",
        type: "PDFTextField",
      },
      estimated: {
        value: "NO",
        id: "14377",
        type: "PDFCheckBox",
      },
      courtAgency: {
        name: {
          value: "",
          id: "14376",
          type: "PDFTextField",
        },
        address: {
          street: {
            value: "",
            id: "14375",
            type: "PDFTextField",
          },
          city: {
            value: "",
            id: "14374",
            type: "PDFTextField",
          },
          zipCode: {
            value: "",
            id: "14371",
            type: "PDFTextField",
          },
          country: {
            value: "United States",
            id: "14372",
            type: "PDFDropdown",
          },
          state: {
            value: "",
            id: "14373",
            type: "PDFDropdown",
          },
        },
      },
      appealed: {
        value: "NO",
        id: "14380",
        type: "PDFRadioGroup",
      },
      appeals: [
        {
          _id: Math.random(),
          courtAgency: {
            name: {
              value: "",
              id: "14370",
              type: "PDFTextField",
            },
            address: {
              street: {
                value: "",
                id: "14369",
                type: "PDFTextField",
              },
              city: {
                value: "",
                id: "14368",
                type: "PDFTextField",
              },
              zipCode: {
                value: "",
                id: "14365",
                type: "PDFTextField",
              },
              country: {
                value: "United States",
                id: "14366",
                type: "PDFDropdown",
              },
              state: {
                value: "",
                id: "14367",
                type: "PDFDropdown",
              },
            },
          },
          finalDisposition: {
            value: "",
            id: "14364",
            type: "PDFTextField",
          },
        },
      ],
    },
  ],
  section21B: [
    {
      dateOccurred: {
        value: "",
        id: "14455",
        type: "PDFTextField",
      },
      estimated: {
        value: "NO",
        id: "14454",
        type: "PDFCheckBox",
      },
      courtAgency: {
        name: {
          value: "",
          id: "14453",
          type: "PDFTextField",
        },
        address: {
          street: {
            value: "",
            id: "14452",
            type: "PDFTextField",
          },
          city: {
            value: "",
            id: "14451",
            type: "PDFTextField",
          },
          zipCode: {
            value: "",
            id: "14448",
            type: "PDFTextField",
          },
          country: {
            value: "United States",
            id: "14449",
            type: "PDFDropdown",
          },
          state: {
            value: "",
            id: "14450",
            type: "PDFDropdown",
          },
        },
      },
      finalDisposition: {
        value: "",
        id: "14433",
        type: "PDFTextField",
      },
      appealed: {
        value: "NO",
        id: "14457",
        type: "PDFRadioGroup",
      },
      appeals: [
        {
          _id: Math.random(),
          courtAgency: {
            name: {
              value: "",
              id: "14447",
              type: "PDFTextField",
            },
            address: {
              street: {
                value: "",
                id: "14446",
                type: "PDFTextField",
              },
              city: {
                value: "",
                id: "14445",
                type: "PDFTextField",
              },
              zipCode: {
                value: "",
                id: "14442",
                type: "PDFTextField",
              },
              country: {
                value: "United States",
                id: "14443",
                type: "PDFDropdown",
              },
              state: {
                value: "",
                id: "14444",
                type: "PDFDropdown",
              },
            },
          },
          finalDisposition: {
            value: "",
            id: "14441",
            type: "PDFTextField",
          },
        },
      ],
    },
  ],
  section21C: [
    {
      voluntary: {
        value: "NO",
        id: "14520",
        type: "PDFCheckBox",
      },
      explanation: {
        value: "",
        id: "14518",
        type: "PDFTextField",
      },
      facility: {
        name: {
          value: "",
          id: "14531",
          type: "PDFTextField",
        },
        address: {
          street: {
            value: "",
            id: "14530",
            type: "PDFTextField",
          },
          city: {
            value: "",
            id: "14529",
            type: "PDFTextField",
          },
          zipCode: {
            value: "",
            id: "14526",
            type: "PDFTextField",
          },
          country: {
            value: "United States",
            id: "14527",
            type: "PDFDropdown",
          },
          state: {
            value: "",
            id: "14528",
            type: "PDFDropdown",
          },
        },
      },
      fromDate: {
        value: "",
        id: "14525",
        type: "PDFTextField",
      },
      toDate: {
        value: "",
        id: "14523",
        type: "PDFTextField",
      },
      present: {
        value: "NO",
        id: "14522",
        type: "PDFCheckBox",
      },
      estimatedFrom: {
        value: "NO",
        id: "14524",
        type: "PDFCheckBox",
      },
      estimatedTo: {
        value: "NO",
        id: "14521",
        type: "PDFCheckBox",
      },
    },
  ],
  section21D: [
    {
      diagnosis: {
        value: "",
        id: "14562",
        type: "PDFTextField",
      },
      datesOfDiagnosis: {
        fromDate: {
          value: "",
          id: "14572",
          type: "PDFTextField",
        },
        toDate: {
          value: "",
          id: "14570",
          type: "PDFTextField",
        },
        present: {
          value: "NO",
          id: "14569",
          type: "PDFCheckBox",
        },
        estimatedFrom: {
          value: "NO",
          id: "14571",
          type: "PDFCheckBox",
        },
        estimatedTo: {
          value: "NO",
          id: "14568",
          type: "PDFCheckBox",
        },
      },
      healthCareProfessional: {
        name: {
          value: "",
          id: "14573",
          type: "PDFTextField",
        },
        telephoneFieldNumber: {
          value: "",
          id: "14565",
          type: "PDFTextField",
        },
        extension: {
          value: "",
          id: "14564",
          type: "PDFTextField",
        },
        day: {
          value: "NO",
          id: "14567",
          type: "PDFCheckBox",
        },
        night: {
          value: "NO",
          id: "14566",
          type: "PDFCheckBox",
        },
        internationalOrDsnPhoneFieldNumber: {
          value: "NO",
          id: "14563",
          type: "PDFCheckBox",
        },
        address: {
          street: {
            value: "",
            id: "14617",
            type: "PDFTextField",
          },
          city: {
            value: "",
            id: "14616",
            type: "PDFTextField",
          },
          zipCode: {
            value: "",
            id: "14613",
            type: "PDFTextField",
          },
          country: {
            value: "United States",
            id: "14614",
            type: "PDFDropdown",
          },
          state: {
            value: "",
            id: "14615",
            type: "PDFDropdown",
          },
        },
      },
      agencyOrFacility: {
        name: {
          value: "",
          id: "14601",
          type: "PDFTextField",
        },
        address: {
          street: {
            value: "",
            id: "14611",
            type: "PDFTextField",
          },
          city: {
            value: "",
            id: "14610",
            type: "PDFTextField",
          },
          zipCode: {
            value: "",
            id: "14607",
            type: "PDFTextField",
          },
          country: {
            value: "United States",
            id: "14608",
            type: "PDFDropdown",
          },
          state: {
            value: "",
            id: "14609",
            type: "PDFDropdown",
          },
        },
        telephoneFieldNumber: {
          value: "",
          id: "14598",
          type: "PDFTextField",
        },
        extension: {
          value: "",
          id: "14597",
          type: "PDFTextField",
        },
        day: {
          value: "NO",
          id: "14600",
          type: "PDFCheckBox",
        },
        night: {
          value: "NO",
          id: "14599",
          type: "PDFCheckBox",
        },
        internationalOrDsnPhoneFieldNumber: {
          value: "NO",
          id: "14596",
          type: "PDFCheckBox",
        },
      },
      counselingEffective: {
        value: "NO",
        id: "14605",
        type: "PDFRadioGroup",
      },
      counselingExplanation: {
        value: "",
        id: "14603",
        type: "PDFTextField",
      },
    },
  ],
};
