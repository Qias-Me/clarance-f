import { RelationshipInfo } from "api/interfaces/sections/relationshipInfo";

// relationshipInfo covers secton 17

export const relationshipInfo: RelationshipInfo = {
  _id: 1,
  neverEntered: {
    value: "Yes",
    id: "11749",
    type: "PDFCheckBox",
  },
  currentlyIn: {
    value: "Yes",
    id: "11746",
    type: "PDFCheckBox",
  },
  separated: {
    value: "Yes",
    id: "11748",
    type: "PDFCheckBox",
  },
  annulled: {
    value: "Yes",
    id: "11747",
    type: "PDFCheckBox",
  },
  divorcedDissolved: {
    value: "Yes",
    id: "11745",
    type: "PDFCheckBox",
  },
  widowed: {
    value: "Yes",
    id: "11744",
    type: "PDFCheckBox",
  },
  section17_1: {
    _id: 1,
    fullName: {
      lastName: {
        value: "Entry1LName",
        id: "11741",
        type: "PDFTextField",
      },
      firstName: {
        value: "Entry1FName",
        id: "11740",
        type: "PDFTextField",
      },
      middleName: {
        value: "Entry1MName",
        id: "11743",
        type: "PDFTextField",
      },
      suffix: {
        value: "IV",
        id: "11742",
        type: "PDFDropdown",
      },
    },
    placeOfBirth: {
      city: {
        value: "cityOfMarraige",
        id: "11727",
        type: "PDFTextField",
      },
      county: {
        value: "countyOMarraige",
        id: "11726",
        type: "PDFTextField",
      },
      state: {
        value: "AZ",
        id: "11725",
        type: "PDFDropdown",
      },
      country: {
        value: "Andorra",
        id: "11724",
        type: "PDFDropdown",
      },
    },
    dateOfBirth: {
      date: {
        value: "12-12-23",
        id: "11738",
        type: "date",
      },
      estimated: {
        value: "Yes",
        id: "11739",
        type: "PDFCheckBox",
      },
    },
    citizenship: [
      {
        _id: 1,
        country: {
          value: "Anguilla",
          id: "11774",
          type: "PDFDropdown",
        },
      },
      {
        _id: 2,
        country: {
          value: "Anguilla",
          id: "11750",
          type: "PDFDropdown",
        },
      },
    ],
    documentation: {
      naturalized: {
        AlienRegistration: {
          value: "Yes",
          id: "11733",
          type: "PDFCheckBox",
        },
        I551: {
          value: "Yes",
          id: "11787",
          type: "PDFCheckBox",
        },
        N550_N570: {
          value: "Yes",
          id: "11784",
          type: "PDFCheckBox",
        },
      },
      bornAbroad: {
        FS240Or545: {
          value: "Yes",
          id: "11737",
          type: "PDFCheckBox",
        },
        DS1350: {
          value: "Yes",
          id: "11736",
          type: "PDFCheckBox",
        },
      },

      derived: {
        AlienRegistration: {
          value: "Yes",
          id: "11786",
          type: "PDFCheckBox",
        },
        I551: {
          value: "Yes",
          id: "11785",
          type: "PDFCheckBox",
        },
        N560_N561: {
          value: "Yes",
          id: "11783",
          type: "PDFCheckBox",
        },
      },

      notACitizen: {
        I551: {
          value: "Yes",
          id: "11735",
          type: "PDFCheckBox",
        },
        I766: {
          value: "Yes",
          id: "11734",
          type: "PDFCheckBox",
        },
        I94: {
          value: "Yes",
          id: "11782",
          type: "PDFCheckBox",
        },
        USVisa: {
          value: "Yes",
          id: "11781",
          type: "PDFCheckBox",
        },
        I20: {
          value: "Yes",
          id: "11780",
          type: "PDFCheckBox",
        },
        DS2019: {
          value: "Yes",
          id: "11779",
          type: "PDFCheckBox",
        },
        Other: {
          value: {
            value: "Yes",
            id: "11732",
            type: "PDFCheckBox",
          },
          explanation: {
            value: "otherExplain",
            id: "11728",
            type: "PDFTextField",
          },
        },
      },
      documentNumber: {
        value: "123456",
        id: "11730",
        type: "PDFTextField",
      },
      documentExpirationDate: {
        date: {
          value: "2024-01-01",
          id: "11778",
          type: "date",
        },
        estimated: {
          value: "Yes",
          id: "11777",
          type: "PDFCheckBox",
        },
      },
    },
    NA_OtherNames: {
      value: "Yes",
      id: "11723",
      type: "PDFCheckBox",
    },
    social: {
      notApplicable: {
        value: "Yes",
        id: "11729",
        type: "PDFCheckBox",
      },
      usSocialSecurityNumber: {
        value: "123456789",
        id: "11731",
        type: "PDFTextField",
      },
    },
    otherNames: [
      {
        _id: 1,
        lastName: {
          value: "Entry2LName",
          id: "11770",
          type: "PDFTextField",
        },
        firstName: {
          value: "Entry2FName",
          id: "11771",
          type: "PDFTextField",
        },
        middleName: {
          value: "Entry2MName",
          id: "11772",
          type: "PDFTextField",
        },
        suffix: {
          value: "III",
          id: "11767",
          type: "PDFDropdown",
        },
        maidenName: {
          value: "YES",
          id: "17030",
          type: "PDFRadioGroup",
        },
        fromDate: {
          date: {
            value: "Entry2FromDat",
            id: "11769",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11766",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "Entry2ToDate",
            id: "11768",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11765",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "11764",
            type: "PDFCheckBox",
          },
        },
      },
      {
        _id: 2,
        lastName: {
          value: "Entry2LName",
          id: "11759",
          type: "PDFTextField",
        },
        firstName: {
          value: "Entry2FName",
          id: "11760",
          type: "PDFTextField",
        },
        middleName: {
          value: "Entry2MName",
          id: "11761",
          type: "PDFTextField",
        },
        suffix: {
          value: "III",
          id: "11756",
          type: "PDFDropdown",
        },
        maidenName: {
          value: "YES",
          id: "17032",
          type: "PDFRadioGroup",
        },
        fromDate: {
          date: {
            value: "Entry2FromDat",
            id: "11758",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11755",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "Entry2ToDate",
            id: "11757",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11754",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "11753",
            type: "PDFCheckBox",
          },
        },
      },
      {
        _id: 3,
        lastName: {
          value: "Entry2LName",
          id: "11720",
          type: "PDFTextField",
        },
        firstName: {
          value: "Entry2FName",
          id: "11721",
          type: "PDFTextField",
        },
        middleName: {
          value: "Entry2MName",
          id: "11722",
          type: "PDFTextField",
        },
        suffix: {
          value: "III",
          id: "11717",
          type: "PDFDropdown",
        },
        maidenName: {
          value: "YES",
          id: "17036",
          type: "PDFRadioGroup",
        },
        fromDate: {
          date: {
            value: "Entry2FromDat",
            id: "11719",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11716",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "Entry2ToDate",
            id: "11718",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11715",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "11714",
            type: "PDFCheckBox",
          },
        },
      },
      {
        _id: 4,
        lastName: {
          value: "Entry2LName",
          id: "11709",
          type: "PDFTextField",
        },
        firstName: {
          value: "Entry2FName",
          id: "11710",
          type: "PDFTextField",
        },
        middleName: {
          value: "Entry2MName",
          id: "11711",
          type: "PDFTextField",
        },
        suffix: {
          value: "III",
          id: "11706",
          type: "PDFDropdown",
        },
        maidenName: {
          value: "YES",
          id: "17038",
          type: "PDFRadioGroup",
        },
        fromDate: {
          date: {
            value: "Entry2FromDat",
            id: "11708",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11705",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "Entry2ToDate",
            id: "11707",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11704",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "11703",
            type: "PDFCheckBox",
          },
        },
      },
    ],
    phone: {
      useMyPhone: {
        value: "Yes",
        id: "11809",
        type: "PDFCheckBox",
      },
      number: {
        value: "13A1SupervisorPhone",
        id: "11812",
        type: "PDFTextField",
      },
      extension: {
        value: "13A1Sup",
        id: "11811",
        type: "PDFTextField",
      },
      internationalOrDsn: {
        value: "Yes",
        id: "11808",
        type: "PDFCheckBox",
      },
      day: {
        value: "Yes",
        id: "11796",
        type: "PDFCheckBox",
      },
      night: {
        value: "Yes",
        id: "11795",
        type: "PDFCheckBox",
      },
    },
    spouseEmail: {
      value: "13A1SupervisorPhone",
      id: "11810",
      type: "PDFTextField",
    },
    marraigeDetails: {
      location: {
        city: {
          value: "Los Angeles",
          id: "11816",
          type: "PDFTextField",
        },
        county: {
          value: "Los Angeles",
          id: "11815",
          type: "PDFTextField",
        },
        state: {
          value: "CA",
          id: "11814",
          type: "PDFDropdown",
        },
        country: {
          value: "USA",
          id: "11813",
          type: "PDFDropdown",
        },
      },
      date: {
        date: {
          value: "2024-01-01",
          id: "11773",
          type: "date",
        },
        estimated: {
          value: "Yes",
          id: "11776",
          type: "PDFCheckBox",
        },
      },
    },
    currentAddress: {
      street: {
        value: "123 Main St",
        id: "11807",
        type: "PDFTextField",
      },
      city: {
        value: "Los Angeles",
        id: "11806",
        type: "PDFTextField",
      },
      state: {
        value: "CA",
        id: "11805",
        type: "PDFDropdown",
      },
      zipCode: {
        value: "90001",
        id: "11803",
        type: "PDFTextField",
      },
      country: {
        value: "USA",
        id: "11804",
        type: "PDFDropdown",
      },
    },
    useMyCurrentAddress: {
      value: "Yes",
      id: "11794",
      type: "PDFCheckBox",
    },
    hasAPOorFPO: {
      value: "YES ",
      id: "17028",
      type: "PDFRadioGroup",
    },
    apoFPOAddress: {
      street: {
        value: "a13A1Street",
        id: "11793",
        type: "PDFTextField",
      },
      zipCode: {
        value: "a13A1Zip",
        id: "11790",
        type: "PDFTextField",
      },
      apoOrFpo: {
        value: "APO",
        id: "11792",
        type: "PDFTextField",
      },
      apoFpoStateCode: {
        value: "APO/FPO Europe",
        id: "11791",
        type: "PDFDropdown",
      },
      APOAddress: {
        street: {
          value: "123 Main St",
          id: "11822",
          type: "PDFTextField",
        },
        city: {
          value: "Los Angeles",
          id: "11821",
          type: "PDFTextField",
        },
        state: {
          value: "CA",
          id: "11820",
          type: "PDFDropdown",
        },
        zipCode: {
          value: "90001",
          id: "11818",
          type: "PDFTextField",
        },
        country: {
          value: "USA",
          id: "11819",
          type: "PDFDropdown",
        },
      },
    },
    isSeperated: {
      value: "YES ",
      id: "17024",
      type: "PDFRadioGroup",
    },
    seperated: {
      date: {
        value: "90001",
        id: "11802",
        type: "PDFTextField",
      },
      estDate: {
        value: "Yes",
        id: "11817",
        type: "PDFCheckBox",
      },
      location: {
        city: {
          value: "Los Angeles",
          id: "11801",
          type: "PDFTextField",
        },
        state: {
          value: "CA",
          id: "11800",
          type: "PDFDropdown",
        },
        zipCode: {
          value: "90001",
          id: "11798",
          type: "PDFTextField",
        },
        country: {
          value: "USA",
          id: "11799",
          type: "PDFDropdown",
        },
      },
      notApplicable: {
        value: "Yes",
        id: "11797",
        type: "PDFCheckBox",
      },
    },
  },
  section17_2: [
    {
      _id: 1,

      marriageStatus: {
        id: "17019",
        type: "PDFRadioGroup",
        value: "1",
      },
      isDisceased: {
        id: "17016",
        type: "PDFRadioGroup",
        value: "YES",
      },
      dateOfMarriage: {
        date: {
          id: "11829",
          type: "PDFTextField",
          value: "mrraigeDate",
        },
        estimated: {
          id: "11827",
          type: "PDFCheckBox",
          value: "Yes",
        },
      },

      dateOfDivorce: {
        date: {
          id: "11830",
          type: "PDFTextField",
          value: "divorceDate",
        },
        estimated: {
          id: "11859",
          type: "PDFCheckBox",
          value: "Yes",
        },
      },

      placeOfMarriage: {
        city: {
          id: "11850",
          type: "PDFTextField",
          value: "Entry1City",
        },
        state: {
          id: "11849",
          type: "PDFDropdown",
          value: "AK",
        },
        country: {
          id: "11848",
          type: "PDFDropdown",
          value: "United States",
        },
        zipCode: {
          id: "11847",
          type: "PDFTextField",
          value: "Entry1Zip",
        },
      },

      spouseName: {
        lastName: {
          id: "11854",
          type: "PDFTextField",
          value: "Entry1LName",
        },
        firstName: {
          id: "11853",
          type: "PDFTextField",
          value: "Entry1FName",
        },
        middleName: {
          id: "11889",
          type: "PDFTextField",
          value: "Entry1MName",
        },
        suffix: {
          id: "11855",
          type: "PDFDropdown",
          value: "Jr",
        },
      },

      spousePlaceOfBirth: {
        city: {
          id: "11846",
          type: "PDFTextField",
          value: "Entry1MarraigeCity",
        },
        state: {
          id: "11845",
          type: "PDFDropdown",
          value: "CA",
        },
        country: {
          id: "11844",
          type: "PDFDropdown",
          value: "Andorra",
        },
        zipCode: {
          id: "",
          type: "",
          value: "",
        },
      },

      spouseDateOfBirth: {
        date: {
          id: "11851", // Same field reused for DOB?
          type: "PDFTextField",
          value: "DateOfBirth",
        },
        estimated: {
          id: "11852",
          type: "PDFCheckBox",
          value: "Yes",
        },
      },

      spouseCitizenship: [
        {
          _id: 1,
          country: {
            id: "11858",
            type: "PDFDropdown",
            value: "Afghanistan",
          },
        },
        {
          _id: 2,
          country: {
            id: "11857",
            type: "PDFDropdown",
            value: "Akrotiri Sovereign Base",
          },
        },
      ],
      spousePhone: {
        phone: {
          id: "11826",
          type: "PDFTextField",
          value: "9999999999",
        },
        dontKnow: {
          id: "11828",
          type: "PDFCheckBox",
          value: "Yes",
        },
      },
      divorcePlace: {
        city: {
          id: "11840",
          type: "PDFTextField",
          value: "divorceCIty",
        },
        zipCode: {
          id: "11837",
          type: "PDFTextField",
          value: "123456",
        },
        state: {
          id: "11839",
          type: "PDFDropdown",
          value: "TX",
        },
        country: {
          id: "11838",
          type: "PDFDropdown",
          value: "United States",
        },
      },
      lastKnownAddress: {
        city: {
          id: "11835",
          type: "PDFTextField",
          value: "lastKnownCIty",
        },
        street: {
          id: "11836",
          type: "PDFTextField",
          value: "lastKnownStreet",
        },
        zipCode: {
          id: "11832",
          type: "PDFTextField",
          value: "LastKnownzipCode",
        },
        state: {
          id: "11834",
          type: "PDFDropdown",
          value: "TX",
        },
        country: {
          id: "11833",
          type: "PDFDropdown",
          value: "United States",
        },
        idontknow: {
          id: "11859",
          type: "PDFCheckBox",
          value: "Yes",
        },
      },
    },
    {
      _id: 2,
      marriageStatus: {
        id: "17011",
        type: "PDFRadioGroup",
        value: "1",
      },
      isDisceased: {
        id: "17008",
        type: "PDFRadioGroup",
        value: "NO (If NO, complete (a))",
      },
      dateOfMarriage: {
        date: {
          id: "11900",
          type: "PDFTextField",
          value: "Entry2",
        },
        estimated: {
          id: "11899",
          type: "PDFCheckBox",
          value: "Yes",
        },
      },
      dateOfDivorce: {
        date: {
          id: "11901",
          type: "PDFTextField",
          value: "Entry2",
        },
        estimated: {
          id: "11892",
          type: "PDFCheckBox",
          value: "Yes",
        },
      },
      placeOfMarriage: {
        city: {
          id: "11879",
          type: "PDFTextField",
          value: "Entry2",
        },
        state: {
          id: "11878",
          type: "PDFDropdown",
          value: "TX",
        },
        country: {
          id: "11877",
          type: "PDFDropdown",
          value: "United States",
        },
        zipCode: {
          id: "11870",
          type: "PDFTextField",
          value: "Entry2",
        },
      },
      spouseName: {
        lastName: {
          id: "11887",
          type: "PDFTextField",
          value: "Entry2",
        },
        firstName: {
          id: "11886",
          type: "PDFTextField",
          value: "Entry2",
        },
        middleName: {
          id: "11889",
          type: "PDFTextField",
          value: "Entry2",
        },
        suffix: {
          id: "11888",
          type: "PDFDropdown",
          value: "Entry2",
        },
      },
      spousePlaceOfBirth: {
        city: {
          id: "11883",
          type: "PDFTextField",
          value: "Entry2",
        },
        state: {
          id: "11882",
          type: "PDFDropdown",
          value: "TX",
        },
        country: {
          id: "11881",
          type: "PDFDropdown",
          value: "United States",
        },
        zipCode: {
          id: "11880",
          type: "PDFTextField",
          value: "Entry2",
        },
      },
      spouseDateOfBirth: {
        date: {
          id: "11884",
          type: "PDFTextField",
          value: "Entry2",
        },
        estimated: {
          id: "11885",
          type: "PDFCheckBox",
          value: "Yes",
        },
      },
      spouseCitizenship: [
        {
          _id: 1,
          country: {
            id: "11891",
            type: "PDFDropdown",
            value: "United States",
          },
        },
        {
          _id: 2,
          country: {
            id: "11890",
            type: "PDFDropdown",
            value: "United States",
          },
        },
      ],
      spousePhone: {
        phone: {
          id: "11897",
          type: "PDFTextField",
          value: "Entry2",
        },
        dontKnow: {
          id: "11898",
          type: "PDFCheckBox",
          value: "Yes",
        },
      },
      divorcePlace: {
        city: {
          id: "11873",
          type: "PDFTextField",
          value: "Entry2",
        },
        zipCode: {
          id: "11870",
          type: "PDFTextField",
          value: "Entry2",
        },
        state: {
          id: "11872",
          type: "PDFDropdown",
          value: "TX",
        },
        country: {
          id: "11871",
          type: "PDFDropdown",
          value: "United States",
        },
      },
      lastKnownAddress: {
        city: {
          id: "11868",
          type: "PDFTextField",
          value: "Entry2",
        },
        street: {
          id: "11869",
          type: "PDFTextField",
          value: "Entry2",
        },
        zipCode: {
          id: "11865",
          type: "PDFTextField",
          value: "Entry2",
        },
        state: {
          id: "11867",
          type: "PDFDropdown",
          value: "TX",
        },
        country: {
          id: "11866",
          type: "PDFDropdown",
          value: "United States",
        },
        idontknow: {
          id: "11864",
          type: "PDFCheckBox",
          value: "Yes",
        },
      },
    },
  ],
  section17_3: {
    _id: 1,
    hasCohabitant: {
      id: "16998",
      type: "PDFRadioGroup",
      value: "NO (If NO, proceed to Section 18)",
    },
    cohabitants: [
      {
        _id: 1,
        fullName: {
          lastName: {
            id: "11926",
            type: "PDFTextField",
            value: "Entry1LastName",
          },
          firstName: {
            id: "11925",
            type: "PDFTextField",
            value: "Entry1FirstName",
          },
          middleName: {
            id: "11928",
            type: "PDFTextField",
            value: "Entry1MiddleName",
          },
          suffix: { id: "11927", type: "PDFDropdown", value: "Entry1Suffix" },
        },
        placeOfBirth: {
          city: { id: "11922", type: "PDFTextField", value: "Entry1City" },
          state: { id: "11921", type: "PDFDropdown", value: "Entry1State" },
          country: { id: "11920", type: "PDFDropdown", value: "United States" },
        },
        dateOfBirth: {
          date: { id: "11923", type: "PDFTextField", value: "Entry1DOB" },
          estimated: { id: "11924", type: "PDFCheckBox", value: "Yes" },
        },
        citizenship: [
          {
            _id: 1,
            country: { id: "11931", type: "PDFDropdown", value: "Anguilla" },
          },
          {
            _id: 2,
            country: { id: "11929", type: "PDFDropdown", value: "Afghanistan" },
          },
        ],
        documentation: {
          documentNumber: {
            id: "11976",
            type: "PDFTextField",
            value: "Entry1DocNumber",
          },
          documentExpirationDate: {
            date: {
              id: "11973",
              type: "PDFTextField",
              value: "Entry1ExpDate(if Applicable)",
            },
            estimated: {
              id: "11972",
              type: "PDFCheckBox",
              value: "Yes",
            },
          },
          naturalized: {
            AlienRegistration: {
              id: "11970",
              type: "PDFCheckBox",
              value: "Yes",
            },
            I551: {
              id: "11919",
              type: "PDFCheckBox",
              value: "Yes",
            },
            N550_N570: {
              id: "11974",
              type: "PDFCheckBox",
              value: "Yes",
            },
          },
          derived: {
            AlienRegistration: {
              id: "11963",
              type: "PDFCheckBox",
              value: "Yes",
            },
            I551: {
              id: "11962",
              type: "PDFCheckBox",
              value: "Yes",
            },
            N560_N561: {
              id: "11961",
              type: "PDFCheckBox",
              value: "Yes",
            },
          },
          bornAbroad: {
            FS240Or545: {
              id: "11967",
              type: "PDFCheckBox",
              value: "Yes",
            },
            DS1350: {
              id: "11971",
              type: "PDFCheckBox",
              value: "Yes",
            },
          },
          notACitizen: {
            I551: {
              id: "11969",
              type: "PDFCheckBox",
              value: "Yes",
            },
            I766: {
              id: "11968",
              type: "PDFCheckBox",
              value: "Yes",
            },
            I94: {
              id: "11958",
              type: "PDFCheckBox",
              value: "Yes",
            },
            USVisa: {
              id: "11960",
              type: "PDFCheckBox",
              value: "Yes",
            },
            I20: {
              id: "11975",
              type: "PDFCheckBox",
              value: "Yes",
            },
            DS2019: {
              id: "11957",
              type: "PDFCheckBox",
              value: "Yes",
            },
            Other: {
              value: {
                id: "11966",
                type: "PDFCheckBox",
                value: "Yes",
              },
              explanation: {
                id: "11965",
                type: "PDFTextField",
                value: "documentationOtherExplain",
              },
            },
          },
        },
        social: {
          usSocialSecurityNumber: {
            id: "11977",
            type: "PDFTextField",
            value: "Entry1CohabitatsSSN",
          },
          notApplicable: {
            id: "11959",
            type: "PDFTextField",
            value: "Yes",
          },
        },
        hasOtherNames: {
          id: "11964",
          type: "PDFCheckBox",
          value: "Yes",
        },
        otherNames: [
          {
            _id: 1,
            lastName: {
              id: "11951",
              type: "PDFTextField",
              value: "cohabatantOtheLastrNames1",
            },
            firstName: {
              id: "11952",
              type: "PDFTextField",
              value: "cohabatantOtherFirstName1",
            },
            middleName: {
              id: "11953",
              type: "PDFTextField",
              value: "cohabitantOtheMiddleName",
            },
            suffix: { id: "11948", type: "PDFDropdown", value: "suffix1" },
            maidenName: { id: "11947", type: "PDFCheckBox", value: "YES" },
            fromDate: {
              date: { id: "11950", type: "PDFTextField", value: "fromdate1" },
              estimated: { id: "11946", type: "PDFCheckBox", value: "Yes" },
            },
            toDate: {
              date: { id: "11949", type: "PDFTextField", value: "todate1" },
              estimated: { id: "11945", type: "PDFCheckBox", value: "Yes" },
              present: { id: "17000", type: "PDFRadioGroup", value: "YES" },
            },
          },
          {
            _id: 2,
            lastName: {
              id: "11940",
              type: "PDFTextField",
              value: "cohabatantOtherLastNames2",
            },
            firstName: {
              id: "11941",
              type: "PDFTextField",
              value: "cohabatantOtherFirstName2",
            },
            middleName: {
              id: "11942",
              type: "PDFTextField",
              value: "cohabitantOtheMiddleName",
            },
            suffix: { id: "11937", type: "PDFDropdown", value: "suffix2" },
            maidenName: { id: "11936", type: "PDFCheckBox", value: "YES" },
            fromDate: {
              date: { id: "11939", type: "PDFTextField", value: "fromdate1" },
              estimated: { id: "11935", type: "PDFCheckBox", value: "Yes" },
            },
            toDate: {
              date: { id: "11938", type: "PDFTextField", value: "todate2" },
              estimated: { id: "11934", type: "PDFCheckBox", value: "Yes" },
              present: { id: "17002", type: "PDFRadioGroup", value: "YES" },
            },
          },
          {
            _id: 3,
            lastName: {
              id: "11916",
              type: "PDFTextField",
              value: "cohabatantOtherLastNames3",
            },
            firstName: {
              id: "11917",
              type: "PDFTextField",
              value: "cohabatantOtherFirstName3",
            },
            middleName: {
              id: "11918",
              type: "PDFTextField",
              value: "cohabitantOtheMiddleName",
            },
            suffix: { id: "11913", type: "PDFDropdown", value: "suffix3" },
            maidenName: { id: "11912", type: "PDFCheckBox", value: "YES" },
            fromDate: {
              date: { id: "11915", type: "PDFTextField", value: "fromdate1" },
              estimated: { id: "11911", type: "PDFCheckBox", value: "Yes" },
            },
            toDate: {
              date: { id: "11914", type: "PDFTextField", value: "todate3" },
              estimated: { id: "11910", type: "PDFCheckBox", value: "Yes" },
              present: { id: "17005", type: "PDFRadioGroup", value: "NO" },
            },
          },
          {
            _id: 4,
            lastName: {
              id: "11905",
              type: "PDFTextField",
              value: "cohabatantOtherLastNames4",
            },
            firstName: {
              id: "11906",
              type: "PDFTextField",
              value: "cohabatantOtherFirstName4",
            },
            middleName: {
              id: "11907",
              type: "PDFTextField",
              value: "cohabitantOtheMiddleName",
            },
            suffix: { id: "11902", type: "PDFDropdown", value: "suffix4" },
            maidenName: { id: "11982", type: "PDFCheckBox", value: "YES" },
            fromDate: {
              date: { id: "11904", type: "PDFTextField", value: "fromdate1" },
              estimated: { id: "11981", type: "PDFCheckBox", value: "Yes" },
            },
            toDate: {
              date: { id: "11903", type: "PDFTextField", value: "todate4" },
              estimated: { id: "11980", type: "PDFCheckBox", value: "Yes" },
              present: { id: "17007", type: "PDFRadioGroup", value: "NO" },
            },
          },
        ],
        cohabitationStartDate: {
          date: {
            id: "11930",
            type: "PDFTextField",
            value: "Entry1residingDateBegin",
          },
          estimated: { id: "", type: "PDFCheckBox", value: "Yes" },
        },
      },

      {
        _id: 2,
        fullName: {
          lastName: {
            id: "12024",
            type: "PDFTextField",
            value: "Entry2LName",
          },
          firstName: {
            id: "12023",
            type: "PDFTextField",
            value: "Entry2FName",
          },
          middleName: {
            id: "12026",
            type: "PDFTextField",
            value: "Entry2MName",
          },
          suffix: {
            id: "12025",
            type: "PDFDropdown",
            value: "Entry2Suffix",
          },
        },
        placeOfBirth: {
          city: {
            id: "12020",
            type: "PDFTextField",
            value: "Entry2DOBCity",
          },
          state: {
            id: "12019",
            type: "PDFDropdown",
            value: "Entry2DOBState",
          },
          country: {
            id: "12018",
            type: "PDFDropdown",
            value: "United States",
          },
        },
        dateOfBirth: {
          date: {
            id: "12021",
            type: "PDFTextField",
            value: "Entry2DOB",
          },
          estimated: {
            id: "12022",
            type: "PDFCheckBox",
            value: "Yes",
          },
        },
        citizenship: [
          {
            _id: 1,
            country: {
              id: "12029",
              type: "PDFDropdown",
              value: "Afghanistan",
            },
          },
          {
            _id: 2,
            country: {
              id: "12027",
              type: "PDFDropdown",
              value: "Akrotiri Sovereign Base",
            },
          },
        ],
        social: {
          usSocialSecurityNumber: {
            id: "11994",
            type: "PDFTextField",
            value: "Entry2FullSN",
          },
          notApplicable: {
            id: "11992",
            type: "PDFCheckBox",
            value: "Yes",
          },
        },
        hasOtherNames: {
          id: "12017",
          type: "PDFCheckBox",
          value: "Yes",
        },
        otherNames: [
          {
            _id: 1,
            lastName: {
              id: "12058",
              type: "PDFTextField",
              value: "Entry2OtherNamesLastname1",
            },
            firstName: {
              id: "12059",
              type: "PDFTextField",
              value: "Entry2OtherNamesFirstname1",
            },
            middleName: {
              id: "12060",
              type: "PDFTextField",
              value: "Entry2OtherMiddlename1",
            },
            suffix: {
              id: "12055",
              type: "PDFDropdown",
              value: "suffix1",
            },
            maidenName: {
              id: "12053",
              type: "PDFRadioGroup",
              value: "YES",
            },
            fromDate: {
              date: {
                id: "12057",
                type: "PDFTextField",
                value: "Entry2FromeDa",
              },
              estimated: {
                id: "12054",
                type: "PDFCheckBox",
                value: "Yes",
              },
            },
            toDate: {
              date: {
                id: "12056",
                type: "PDFTextField",
                value: "Entry2ToDate",
              },
              estimated: {
                id: "12051",
                type: "PDFCheckBox",
                value: "Yes",
              },
              present: {
                id: "12052",
                type: "PDFRadioGroup",
                value: "YES",
              },
            },
          },
          {
            _id: 2,
            lastName: {
              id: "12047",
              type: "PDFTextField",
              value: "Entry2OtherNamesLastname2",
            },
            firstName: {
              id: "12048",
              type: "PDFTextField",
              value: "Entry2OtherNamesFirstname2",
            },
            middleName: {
              id: "12049",
              type: "PDFTextField",
              value: "Entr2OtherMiddlename2",
            },
            suffix: {
              id: "12044",
              type: "PDFDropdown",
              value: "suffix2",
            },
            maidenName: {
              id: "16992",
              type: "PDFRadioGroup",
              value: "YES",
            },
            fromDate: {
              date: {
                id: "12046",
                type: "PDFTextField",
                value: "Entry2FromDat",
              },
              estimated: {
                id: "12034",
                type: "PDFCheckBox",
                value: "Yes",
              },
            },
            toDate: {
              date: {
                id: "12045",
                type: "PDFTextField",
                value: "Entry2ToDate",
              },
              estimated: {
                id: "12033",
                type: "PDFCheckBox",
                value: "Yes",
              },
              present: {
                id: "12032",
                type: "PDFRadioGroup",
                value: "YES",
              },
            },
          },
          {
            _id: 3,
            lastName: {
              id: "12015",
              type: "PDFTextField",
              value: "Entry2OtherNamesLastname3",
            },
            firstName: {
              id: "12014",
              type: "PDFTextField",
              value: "Entry2OtherNamesFirstname3",
            },
            middleName: {
              id: "12016",
              type: "PDFTextField",
              value: "Entry2OtherMiddlename3",
            },
            suffix: {
              id: "12011",
              type: "PDFDropdown",
              value: "suffix3",
            },
            maidenName: {
              id: "16995",
              type: "PDFRadioGroup",
              value: "YES",
            },
            fromDate: {
              date: {
                id: "12013",
                type: "PDFTextField",
                value: "Entry2Fromdat",
              },
              estimated: {
                id: "12010",
                type: "PDFCheckBox",
                value: "Yes",
              },
            },
            toDate: {
              date: {
                id: "12012",
                type: "PDFTextField",
                value: "Entry2ToDate",
              },
              estimated: {
                id: "12009",
                type: "PDFCheckBox",
                value: "Yes",
              },
              present: {
                id: "12008",
                type: "PDFRadioGroup",
                value: "YES",
              },
            },
          },
          {
            _id: 4,
            lastName: {
              id: "12003",
              type: "PDFTextField",
              value: "Entry2OtherNamesLastname4",
            },
            firstName: {
              id: "12004",
              type: "PDFTextField",
              value: "Entry2OtherNamesFirstname4",
            },
            middleName: {
              id: "12005",
              type: "PDFTextField",
              value: "Entry2OtherMiddlename4",
            },
            suffix: {
              id: "12000",
              type: "PDFDropdown",
              value: "suffix4",
            },
            maidenName: {
              id: "11999",
              type: "PDFRadioGroup",
              value: "YES",
            },
            fromDate: {
              date: {
                id: "12002",
                type: "PDFTextField",
                value: "Entry2FromDat",
              },
              estimated: {
                id: "11998",
                type: "PDFCheckBox",
                value: "Yes",
              },
            },
            toDate: {
              date: {
                id: "12001",
                type: "PDFTextField",
                value: "Entry2ToDate",
              },
              estimated: {
                id: "11997",
                type: "PDFCheckBox",
                value: "Yes",
              },
              present: {
                id: "16997",
                type: "PDFRadioGroup",
                value: "YES",
              },
            },
          },
        ],
        cohabitationStartDate: {
          date: {
            id: "12028",
            type: "PDFTextField",
            value: "Entry2DateResidingBegan",
          },
          estimated: {
            id: "11990",
            type: "PDFCheckBox",
            value: "Yes",
          },
        },


        documentation: {
          documentNumber: {
            id: "11993",
            type: "PDFTextField",
            value: "Entry2DocumentNumb",
          },
          documentExpirationDate: {
            date: {
              id: "11991",
              type: "PDFTextField",
              value: "Entry2DocumentDate",
            },
            estimated: {
              id: "11992",
              type: "PDFCheckBox",
              value: "Yes",
            },
          },
          naturalized: {
            AlienRegistration: {
              id: "11987",
              type: "PDFCheckBox",
              value: "Yes",
            },
            I551: {
              id: "11986",
              type: "PDFCheckBox",
              value: "Yes",
            },
            N550_N570: {
              id: "11985",
              type: "PDFCheckBox",
              value: "Yes",
            },
          },
          derived: {
            AlienRegistration: {
              id: "11984",
              type: "PDFCheckBox",
              value: "Yes",
            },
            I551: {
              id: "11983",
              type: "PDFCheckBox",
              value: "Yes",
            },
            N560_N561: {
              id: "12042",
              type: "PDFCheckBox",
              value: "Yes",
            },
          },
          bornAbroad: {
            FS240Or545: {
              id: "11989",
              type: "PDFCheckBox",
              value: "Yes",
            },
            DS1350: {
              id: "11988",
              type: "PDFCheckBox",
              value: "Yes",
            },
          },
          notACitizen: {
            I551: {
              id: "12041",
              type: "PDFCheckBox",
              value: "Yes",
            },
            I766: {
              id: "12040",
              type: "PDFCheckBox",
              value: "Yes",
            },
            I94: {
              id: "12039",
              type: "PDFCheckBox",
              value: "Yes",
            },
            USVisa: {
              id: "12038",
              type: "PDFCheckBox",
              value: "Yes",
            },
            I20: {
              id: "12037",
              type: "PDFCheckBox",
              value: "Yes",
            },
            DS2019: {
              id: "12036",
              type: "PDFCheckBox",
              value: "Yes",
            },
            Other: {
              value: {
                id: "12035",
                type: "PDFCheckBox",
                value: "Yes",
              },
              explanation: {
                id: "12043",
                type: "PDFTextField",
                value: "documentationOtherExplain",
              },
            },
          },
        },
      },
    ],
  },
};

