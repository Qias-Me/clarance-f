import { type RelativesInfo } from "api/interfaces/sections/relativesInfo";

//relativesInfo covers section 18

export const relativesInfo: RelativesInfo = {
  _id: Math.random(),
  relativeTypes: [
    {
      _id: Math.random(),
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12077",

      },
      name: "Mother",
    },
    {
      _id: Math.random(),
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12076",

      },
      name: "Father",
    },
    {
      _id: Math.random(),
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12075",

      },
      name: "Stepmother",
    },
    {
      _id: Math.random(),
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12074",

      },
      name: "Stepfather",
    },
    {
      _id: Math.random(),
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12073",

      },
      name: "Foster parent",
    },
    {
      _id: Math.random(),
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12072",

      },
      name: "Child (including adopted/foster)",
    },
    {
      _id: Math.random(),
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12071",

      },
      name: "Stepchild",
    },
    {
      _id: Math.random(),
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12070",

      },
      name: "Brother",
    },
    {
      _id: Math.random(),
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12069",

      },
      name: "Sister",
    },
    {
      _id: Math.random(),
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12068",

      },
      name: "Stepbrother",
    },
    {
      _id: Math.random(),
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12067",

      },
      name: "Stepsister",
    },
    {
      _id: Math.random(),
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12066",

      },
      name: "Half-brother",
    },
    {
      _id: Math.random(),
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12065",

      },
      name: "Half-sister",
    },
    {
      _id: Math.random(),
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12064",

      },
      name: "Father-in-law",
    },
    {
      _id: Math.random(),
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12063",

      },
      name: "Mother-in-law",
    },
    {
      _id: Math.random(),
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12062",

      },
      name: "Guardian",
    },

  ],
  entries: [
    {
      _id: Math.random(),
      type: {
        value: "Mother",
        id: "12082",
        type: "PDFDropdown",
      },
      fullName: {
        firstName: {
          value: "Hi",
          id: "12137",
          type: "PDFTextField",
        },
        middleName: {
          value: "Hi",
          id: "12140",
          type: "PDFTextField",
        },
        lastName: {
          value: "Hi",
          id: "12139",
          type: "PDFTextField",
        },
        suffix: {
          value: "Hi",
          id: "12138",
          type: "PDFDropdown",
        },
      },
      dateOfBirth: {
        date: {
          value: "Hi",
          id: "12078",
          type: "PDFTextField",
        },
        estimated: {
          value: "Yes",
          id: "12079",
          type: "PDFCheckBox",
        },
      },
      placeOfBirth: {
        city: {
          value: "Hi",
          id: "12143",
          type: "PDFTextField",
        },
        state: {
          value: "Hi",
          id: "12142",
          type: "PDFDropdown",
        },
        country: {
          value: "Hi",
          id: "12141",
          type: "PDFDropdown",
        },
      },
      countriesOfCitizenship: [
        {
          _id: Math.random(),
          country: {
            value: "Hi",
            id: "12081",
            type: "PDFDropdown",
          },
        },
        {
          _id: Math.random(),
          country: {
            value: "Hi",
            id: "12080",
            type: "PDFDropdown",
          },
        },
      ],
      isDeceased: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      isUSCitizen: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      hasForeignAddress: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      hasUSAddress: {
        value: "NO",
        id: "",
        type: "PDFRadioGroup",
      },
      details: {
        section18_1: {
          ifMother: {
            lastName: {
              value: "Hi",
              id: "12134",
              type: "PDFTextField",
            },
            firstName: {
              value: "Hi",
              id: "12133",
              type: "PDFTextField",
            },
            middleName: {
              value: "Hi",
              id: "12135",
              type: "PDFTextField",
            },
            suffix: {
              value: "Hi",
              id: "12136",
              type: "PDFDropdown",
            },
            sameAsListed: {
              value: "Yes",
              id: "12132",
              type: "PDFCheckBox",
            },
            iDontKnow: {
              value: "Yes",
              id: "12131",
              type: "PDFCheckBox",
            },
          },
          hasOtherNames: {
            value: "NO",
            id: "12132",
            type: "PDFRadioGroup",
          },
          otherNamesUsed: [
            {
              _id: 1,
              lastName: {
                value: "Hi",
                id: "12128",
                type: "PDFTextField",
              },
              firstName: {
                value: "Hi",
                id: "12129",
                type: "PDFTextField",
              },
              middleName: {
                value: "Hi",
                id: "12130",
                type: "PDFTextField",
              },
              suffix: {
                value: "Hi",
                id: "12125",
                type: "PDFDropdown",
              },
              maidenName: {
                value: "NO",
                id: "16982",
                type: "PDFRadioGroup",
              },
              fromDate: {
                date: {
                  value: "Hi",
                  id: "12127",
                  type: "PDFTextField",
                },
                estimated: {
                  value: "Yes",
                  id: "12124",
                  type: "PDFCheckBox",
                },

              },
              toDate: {
                date: {
                  value: "Hi",
                  id: "12126",
                  type: "PDFTextField",
                },
                estimated: {
                  value: "Yes",
                  id: "12122",
                  type: "PDFCheckBox",
                },
                present: {
                  value: "Yes",
                  id: "12123",
                  type: "PDFCheckBox",
                },
              },
              reasonForChange: {
                value: "Hi",
                id: "12086",
                type: "PDFTextField",
              },
            },
          ],
        },
        section18_2: {
          _id: Math.random(),
          street: {
            value: "Hi",
            id: "12167",
            type: "PDFTextField",
          },
          city: {
            value: "Hi",
            id: "12166",
            type: "PDFTextField",
          },
          state: {
            value: "Hi",
            id: "12165",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "Hi",
            id: "12163",
            type: "PDFTextField",
          },
          country: {
            value: "Hi",
            id: "12164",
            type: "PDFDropdown",
          },
          hasAPOFPOAddress: {
            value: "NO",
            id: "12176",
            type: "PDFRadioGroup",
          },
          apofpoAddress: {
            address: {
              value: "Hi",
              id: "12170",
              type: "PDFTextField",
            },
            apofpoStateCode: {
              value: "Hi",
              id: "12168",
              type: "PDFDropdown",
            },
            apofpoZipCode: {
              value: "Hi",
              id: "12171",
              type: "PDFTextField",
            },
          },
          dontKnowAPOFPO: {
            value: "NO",
            id: "12174",
            type: "PDFRadioGroup",
          },
        },
        section18_3: {
          citizenshipDocuments: [
            {
              type: "FS240or545",
              documentNumber: {
                value: "Hi",
                id: "12152",
                type: "PDFTextField",
              },
            },
          ],
          courtDetails: {
            street: {
              value: "Hi",
              id: "12178",
              type: "PDFTextField",
            },
            city: {
              value: "Hi",
              id: "12148",
              type: "PDFTextField",
            },
            state: {
              value: "Hi",
              id: "12149",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "Hi",
              id: "12177",
              type: "PDFTextField",
            },
          },
        },
        section18_4: {
          usDocumentation: [
            {
              type: {
                value: "I551PermanentResident",
                id: "12218",
                type: "PDFCheckBox",
              },
            },
            {
              type: {
                value: "I94ArrivalDepartureRecord",
                id: "12213",
                type: "PDFCheckBox",
              },
            },
            {
              type: {
                value: "I20CertificateEligibilityF1Student",
                id: "12215",
                type: "PDFCheckBox",
              },
            },
            {
              type: {
                value: "DS2019CertificateEligibilityJ1Status",
                id: "12214",
                type: "PDFCheckBox",
              },
            },
            {
              type: {
                value: "Other",
                id: "12217",
                type: "PDFCheckBox",
              },
            },
            {
              type: {
                value: "I766EmploymentAuthorization",
                id: "12219",
                type: "PDFCheckBox",
              },
            },
            {
              type: {
                value: "Other",
                id: "12216",
                type: "PDFCheckBox",
              },
            },
          ],
          documentFieldNumber: {
            value: "Hi",
            id: "12212",
            type: "PDFTextField",
          },
          documentExpirationDate: {
            value: "Hi",
            id: "12179",
            type: "PDFTextField",
          },
          firstContactDate: {
            value: "Hi",
            id: "12186",
            type: "PDFTextField",
          },
          lastContactDate: {
            value: "Hi",
            id: "12182",
            type: "PDFTextField",
          },
          contactMethods: [
            {
              value: "In Person",
              id: "12209",
              type: "PDFCheckBox",
            },
            {
              value: "Telephone",
              id: "12211",
              type: "PDFCheckBox",
            },
            {
              value: "Electronic",
              id: "12210",
              type: "PDFCheckBox",
            },
            {
              value: "Written Correspondence",
              id: "12208",
              type: "PDFCheckBox",
            },
            {
              value: "Other",
              id: "12207",
              type: "PDFCheckBox",
            },
          ],
          contactFrequency: {
            frequency: {
              value: "Daily",
              id: "12204",
              type: "PDFCheckBox",
            },
          },
          currentEmployer: {
            name: {
              value: "Hi",
              id: "12199",
              type: "PDFTextField",
            },
            address: {
              street: {
                value: "Hi",
                id: "12197",
                type: "PDFTextField",
              },
              city: {
                value: "Hi",
                id: "12196",
                type: "PDFTextField",
              },
              state: {
                value: "Hi",
                id: "12195",
                type: "PDFSelect",
              },
              zipCode: {
                value: "Hi",
                id: "12193",
                type: "PDFTextField",
              },
              country: {
                value: "Hi",
                id: "12194",
                type: "PDFSelect",
              },
            },
            unknown: {
              value: "NO",
              id: "12198",
              type: "PDFCheckBox",
            },
          },
          recentEmployer: {
            name: {
              value: "Hi",
              id: "12199",
              type: "PDFTextField",
            },
            address: {
              street: {
                value: "Hi",
                id: "12197",
                type: "PDFTextField",
              },
              city: {
                value: "Hi",
                id: "12196",
                type: "PDFTextField",
              },
              state: {
                value: "Hi",
                id: "12195",
                type: "PDFSelect",
              },
              zipCode: {
                value: "Hi",
                id: "12193",
                type: "PDFTextField",
              },
              country: {
                value: "Hi",
                id: "12194",
                type: "PDFSelect",
              },
            },
            unknown: {
              value: "NO",
              id: "12198",
              type: "PDFCheckBox",
            },
          },
          foreignGovernmentAffiliation: {
            affiliation: {
              value: "NO",
              id: "12188",
              type: "PDFRadioButton",
            },
            description: {
              value: "Hi",
              id: "12187",
              type: "PDFTextField",
            },
          },
        },
        section18_5: {
          firstContactDate: {
            value: "Hi",
            id: "12224",
            type: "PDFTextField",
          },
          lastContactDate: {
            value: "Hi",
            id: "12222",
            type: "PDFTextField",
          },
          contactMethods: [
            {
              value: "In Person",
              id: "12247",
              type: "PDFCheckBox",
            },
            {
              value: "Telephone",
              id: "12249",
              type: "PDFCheckBox",
            },
            {
              value: "Electronic",
              id: "12248",
              type: "PDFCheckBox",
            },
            {
              value: "Written Correspondence",
              id: "12246",
              type: "PDFCheckBox",
            },
            {
              value: "Other",
              id: "12245",
              type: "PDFCheckBox",
            },
          ],
          contactFrequency: {
            frequency: {
              value: "Daily",
              id: "12242",
              type: "PDFCheckBox",
            },
            explanation: {
              value: "Hi",
              id: "12240",
              type: "PDFTextField",
            },
          },
          employerDetails: {
            name: {
              value: "Hi",
              id: "12237",
              type: "PDFTextField",
            },
            address: {
              street: {
                value: "Hi",
                id: "12235",
                type: "PDFTextField",
              },
              city: {
                value: "Hi",
                id: "12234",
                type: "PDFTextField",
              },
              state: {
                value: "Hi",
                id: "12233",
                type: "PDFDropdown",
              },
              zipCode: {
                value: "Hi",
                id: "12231",
                type: "PDFTextField",
              },
              country: {
                value: "Hi",
                id: "12232",
                type: "PDFDropdown",
              },
            },
            unknown: {
              value: "NO",
              id: "12230",
              type: "PDFCheckBox",
            },
          },
          foreignGovernmentAffiliation: {
            affiliation: {
              value: "NO",
              id: "",
              type: "PDFRadioButton",
            },

            description: {
              value: "Hi",
              id: "12225",
              type: "PDFTextField",
            },
          },
        },
      },
    },
  ],
};
