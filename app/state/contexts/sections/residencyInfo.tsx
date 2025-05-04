import { type ResidencyInfo } from "api/interfaces/sections/residency";

// residencyInfo covers section 11

export const residencyInfo: ResidencyInfo[] = [
  {
    _id: 1,
    residenceStartDate: {
      value: "E1From",
      id: "9814",
      type: "PDFTextField",
    },
    isStartDateEst: {
      value: "Yes",
      id: "9813",
      type: "PDFCheckBox",
    },
    residenceEndDate: {
      value: "E1To",
      id: "9812",
      type: "PDFTextField",
    },
    isResidenceEndEst: {
      value: "Yes",
      id: "9811",
      type: "PDFCheckBox",
    },
    isResidencePresent: {
      value: "Yes",
      id: "9810",
      type: "PDFCheckBox",
    },
    residenceStatus: {
      value: "4",
      id: "17200",
      type: "PDFRadioGroup",
    },
    residenceOtherDetails: {
      value: "E1OtherField",
      id: "9805",
      type: "PDFTextField",
    },
    residenceAddress: {
      street: {
        value: "E1Street",
        id: "9804",
        type: "PDFTextField",
      },
      city: {
        value: "E1City",
        id: "9803",
        type: "PDFTextField",
      },
      state: {
        value: "AK",
        id: "9802",
        type: "PDFDropdown",
      },
      zip: {
        value: "E1Zip",
        id: "9800",
        type: "PDFTextField",
      },
      country: {
        value: "Afghanistan",
        id: "9801",
        type: "PDFDropdown",
      },
      hasAPOOrFPO: {
        value: "NO",
        id: "17201",
        type: "PDFRadioGroup",
      },
      APOOrFPODetails: {
        street: {
          value: "aE1Street",
          id: "9780",
          type: "PDFTextField",
        },
        city: {
          value: "aE1City",
          id: "9779",
          type: "PDFTextField",
        },
        state: {
          value: "AL",
          id: "9778",
          type: "PDFDropdown",
        },
        zip: {
          value: "aE1Zip",
          id: "9772",
          type: "PDFTextField",
        },
        country: {
          value: "Akrotiri Sovereign Base",
          id: "9777",
          type: "PDFDropdown",
        },
        APOFPOAddress: {
          value: "bE1Street",
          id: "9776",
          type: "PDFTextField",
        },
        APOOrFPO: {
          value: "APO",
          id: "9775",
          type: "PDFTextField",
        },
        APOFPOStateCode: {
          value: "APO/FPO America",
          id: "9774",
          type: "PDFDropdown",
        },
        APOFPOZip: {
          value: "bE1Zip",
          id: "9773",
          type: "PDFTextField",
        },
      },
    },

    contact: {
      lastname: {
        value: "E1neighborLname",
        id: "9798",
        type: "PDFTextField",
      },
      firstname: {
        value: "E1neighborFname",
        id: "9797",
        type: "PDFTextField",
      },
      middlename: {
        value: "E1neighborMname",
        id: "9799",
        type: "PDFTextField",
      },
      suffix: {
        value: "III",
        id: "9796",
        type: "PDFDropdown",
      },
      lastContactDate: {
        value: "E1neighboMonth",
        id: "9782",
        type: "PDFTextField",
      },
      isLastContactEst: {
        value: "Yes",
        id: "9824",
        type: "PDFCheckBox",
      },
      relationship: {
        checkboxes: [
          {
            value: "Yes",
            id: "9795",
            type: "PDFCheckbox",
          },
          {
            value: "Yes",
            id: "9794",
            type: "PDFCheckbox",
          },
          {
            value: "Yes",
            id: "9793",
            type: "PDFCheckbox",
          },
          {
            value: "Yes",
            id: "9792",
            type: "PDFCheckbox",
          },
          {
            value: "Yes",
            id: "9791",
            type: "PDFCheckbox",
          },
        ],
      },
      relationshipOtherDetail: {
        value: "E1RelationshipOther",
        id: "9790",
        type: "PDFTextField",
      },
      phone: [
        {
          _id: 1,
          dontKnowNumber: {
            value: "Yes",
            id: "9823",
            type: "PDFCheckBox",
          },
          isInternationalOrDSN: {
            value: "Yes",
            id: "9824",
            type: "PDFCheckBox",
          },
          number: {
            value: "E1neighborTeleNumber1",
            id: "9826",
            type: "PDFTextField",
          },
          extension: {
            value: "E1-1",
            id: "9825",
            type: "PDFTextField",
          },
        },
        {
          _id: 2,
          dontKnowNumber: {
            value: "Yes",
            id: "9823",
            type: "PDFCheckBox",
          },
          isInternationalOrDSN: {
            value: "Yes",
            id: "9818",
            type: "PDFCheckBox",
          },
          number: {
            value: "E1neighborTeleNumber2",
            id: "9822",
            type: "PDFTextField",
          },
          extension: {
            value: "E1-2",
            id: "9821",
            type: "PDFTextField",
          },
        },
        {
          _id: 3,
          dontKnowNumber: {
            value: "Yes",
            id: "9815",
            type: "PDFCheckBox",
          },
          isInternationalOrDSN: {
            value: "Yes",
            id: "9816",
            type: "PDFCheckBox",
          },
          number: {
            value: "E1neighborTeleNumber3",
            id: "9820",
            type: "PDFTextField",
          },
          extension: {
            value: "E1-3",
            id: "9819",
            type: "PDFTextField",
          },
        },
      ],
      email: {
        value: "E1neighborEmail",
        id: "9784",
        type: "PDFTextField",
      },
      dontKnowEmail: {
        value: "Yes",
        id: "9783",
        type: "PDFCheckbox",
      },
      contactAddress: {
        street: {
          value: "E1neighborStreet",
          id: "9789",
          type: "PDFTextField",
        },
        city: {
          value: "E1neighborCity",
          id: "9788",
          type: "PDFTextField",
        },
        state: {
          value: "AS",
          id: "9787",
          type: "PDFDropdown",
        },
        zip: {
          value: "E1neighborZip",
          id: "9785",
          type: "PDFTextField",
        },
        country: {
          value: "Antarctica",
          id: "9786",
          type: "PDFDropdown",
        },
        hasAPOOrFPO: {
          value: "YES ",
          id: "17202",
          type: "PDFCheckBox",
        },
        APOOrFPODetails: {
          street: {
            value: "E1nieghborAStreet",
            id: "9771",
            type: "PDFTextField",
          },
          city: {
            value: "E1nieghborACity",
            id: "9770",
            type: "PDFTextField",
          },
          state: {
            value: "CA",
            id: "9769",
            type: "PDFDropdown",
          },
          zip: {
            value: "E1nieghborAZi",
            id: "9767",
            type: "PDFTextField",
          },
          country: {
            value: "Argentina",
            id: "9768",
            type: "PDFDropdown",
          },
          APOFPOAddress: {
            value: "E1AddressBAPO",
            id: "9764",
            type: "PDFTextField",
          },
          APOOrFPO: {
            value: "APO",
            id: "9763",
            type: "PDFTextField",
          },
          APOFPOStateCode: {
            value: "APO/FPO Europe",
            id: "9762",
            type: "PDFDropdown",
          },
          APOFPOZip: {
            value: "E1nieghbor",
            id: "9761",
            type: "PDFTextField",
          },
        },
      },
    },
  },
  {
    _id: 2,
    residenceStartDate: {
      value: "E2fromDate",
      id: "9883",
      type: "PDFTextField",
    },
    isStartDateEst: {
      value: "Yes",
      id: "9893",
      type: "PDFCheckBox",
    },
    residenceEndDate: {
      value: "E2ToDate",
      id: "9881",
      type: "PDFTextField",
    },
    isResidenceEndEst: {
      value: "Yes",
      id: "9892",
      type: "PDFCheckBox",
    },
    isResidencePresent: {
      value: "Yes",
      id: "9880",
      type: "PDFCheckBox",
    },
    residenceStatus: {
      value: "4",
      id: "17197",
      type: "PDFRadioGroup",
    },
    residenceOtherDetails: {
      value: "E2OtherExplaination",
      id: "9874",
      type: "PDFTextField",
    },
    residenceAddress: {
      street: {
        value: "E2Street",
        id: "9873",
        type: "PDFTextField",
      },
      city: {
        value: "E2City",
        id: "9872",
        type: "PDFTextField",
      },
      state: {
        value: "AK",
        id: "9871",
        type: "PDFDropdown",
      },
      zip: {
        value: "E2Zip",
        id: "9869",
        type: "PDFTextField",
      },
      country: {
        value: "Afghanistan",
        id: "9870",
        type: "PDFDropdown",
      },
      hasAPOOrFPO: {
        value: "NO",
        id: "17198",
        type: "PDFRadioGroup",
      },
      APOOrFPODetails: {
        street: {
          value: "aE2Street",
          id: "9849",
          type: "PDFTextField",
        },
        city: {
          value: "aE2City",
          id: "9848",
          type: "PDFTextField",
        },
        state: {
          value: "AL",
          id: "9847",
          type: "PDFDropdown",
        },
        zip: {
          value: "aE2Zip",
          id: "9841",
          type: "PDFTextField",
        },
        country: {
          value: "Akrotiri Sovereign Base",
          id: "9846",
          type: "PDFDropdown",
        },
        APOFPOAddress: {
          value: "bE2Address",
          id: "9845",
          type: "PDFTextField",
        },
        APOOrFPO: {
          value: "APO",
          id: "9844",
          type: "PDFTextField",
        },
        APOFPOStateCode: {
          value: "APO/FPO America",
          id: "9843",
          type: "PDFDropdown",
        },
        APOFPOZip: {
          value: "bE2Zip",
          id: "9842",
          type: "PDFTextField",
        },
      },
    },

    contact: {
      lastname: {
        value: "bE2LName",
        id: "9867",
        type: "PDFTextField",
      },
      firstname: {
        value: "bE2FName",
        id: "9866",
        type: "PDFTextField",
      },
      middlename: {
        value: "bE2MName",
        id: "9868",
        type: "PDFTextField",
      },
      suffix: {
        value: "Jr",
        id: "9865",
        type: "PDFDropdown",
      },
      lastContactDate: {
        value: "bE2LastContact",
        id: "9851",
        type: "PDFTextField",
      },
      isLastContactEst: {
        value: "Yes",
        id: "9816",
        type: "PDFCheckBox",
      },
      relationship: {
        checkboxes: [
          {
            value: "Yes",
            id: "9864",
            type: "PDFCheckBox",
          },
          {
            value: "Yes",
            id: "9863",
            type: "PDFCheckBox",
          },
          {
            value: "Yes",
            id: "9862",
            type: "PDFCheckBox",
          },
          {
            value: "Yes",
            id: "9861",
            type: "PDFCheckBox",
          },
          {
            value: "Yes",
            id: "9884",
            type: "PDFCheckBox",
          },
        ],
      },
      relationshipOtherDetail: {
        value: "E2OtherExplainRelation",
        id: "9859",
        type: "PDFTextField",
      },
      phone: [
        {
          _id: 1,
          dontKnowNumber: {
            value: "Yes",
            id: "9882",
            type: "PDFCheckBox",
          },
          isInternationalOrDSN: {
            value: "Yes",
            id: "9879",
            type: "PDFCheckBox",
          },
          number: {
            value: "E2Phone1",
            id: "9895",
            type: "PDFTextField",
          },
          extension: {
            value: "1",
            id: "9894",
            type: "PDFTextField",
          },
        },
        {
          _id: 2,
          dontKnowNumber: {
            value: "Yes",
            id: "9882",
            type: "PDFCheckBox",
          },
          isInternationalOrDSN: {
            value: "Yes",
            id: "9879",
            type: "PDFCheckBox",
          },
          number: {
            value: "E2Phone2",
            id: "9891",
            type: "PDFTextField",
          },
          extension: {
            value: "2",
            id: "9890",
            type: "PDFTextField",
          },
        },
        {
          _id: 3,
          dontKnowNumber: {
            value: "Yes",
            id: "9882",
            type: "PDFCheckBox",
          },
          isInternationalOrDSN: {
            value: "Yes",
            id: "9879",
            type: "PDFCheckBox",
          },
          number: {
            value: "E2Phone3",
            id: "9889",
            type: "PDFTextField",
          },
          extension: {
            value: "3",
            id: "9888",
            type: "PDFTextField",
          },
        },
      ],
      email: {
        value: "E2ContactEmail",
        id: "9853",
        type: "PDFTextField",
      },
      dontKnowEmail: {
        value: "Yes",
        id: "9852",
        type: "PDFCheckBox",
      },
      contactAddress: {
        street: {
          value: "E2ContactAddress",
          id: "9858",
          type: "PDFTextField",
        },
        city: {
          value: "E2ContactCity",
          id: "9857",
          type: "PDFTextField",
        },
        state: {
          value: "AR",
          id: "9856",
          type: "PDFDropdown",
        },
        zip: {
          value: "E2Zip",
          id: "9854",
          type: "PDFTextField",
        },
        country: {
          value: "Afghanistan",
          id: "9855",
          type: "PDFDropdown",
        },
        hasAPOOrFPO: {
          value: "YES ",
          id: "17199",
          type: "PDFRadioGroup",
        },
        APOOrFPODetails: {
          street: {
            value: "aE2Street",
            id: "9840",
            type: "PDFTextField",
          },
          city: {
            value: "aE2City",
            id: "9839",
            type: "PDFTextField",
          },
          state: {
            value: "CT",
            id: "9838",
            type: "PDFDropdown",
          },
          zip: {
            value: "aE2Zip",
            id: "9836",
            type: "PDFTextField",
          },
          country: {
            value: "Albania",
            id: "9837",
            type: "PDFDropdown",
          },
          APOFPOAddress: {
            value: "bE2Address",
            id: "9833",
            type: "PDFTextField",
          },
          APOOrFPO: {
            value: "APO",
            id: "9832",
            type: "PDFTextField",
          },
          APOFPOStateCode: {
            value: "APO/FPO America",
            id: "9831",
            type: "PDFDropdown",
          },
          APOFPOZip: {
            value: "bE2Zip",
            id: "9830",
            type: "PDFTextField",
          },
        },
      },
    },
  },
  {
    _id: 3,
    residenceStartDate: {
      value: "E3FromDate",
      id: "9957",
      type: "PDFTextField",
    },
    isStartDateEst: {
      value: "Yes",
      id: "9956",
      type: "PDFCheckBox",
    },
    residenceEndDate: {
      value: "E3ToDate",
      id: "9955",
      type: "PDFTextField",
    },
    isResidenceEndEst: {
      value: "Yes",
      id: "9954",
      type: "PDFCheckBox",
    },
    isResidencePresent: {
      value: "Yes",
      id: "9953",
      type: "PDFCheckBox",
    },
    residenceStatus: {
      value: "4",
      id: "17194",
      type: "PDFRadioGroup",
    },
    residenceOtherDetails: {
      value: "E3OtherExplaination",
      id: "9948",
      type: "PDFTextField",
    },
    residenceAddress: {
      street: {
        value: "E3StreetAddress",
        id: "9947",
        type: "PDFTextField",
      },
      city: {
        value: "E3City",
        id: "9946",
        type: "PDFTextField",
      },
      state: {
        value: "AL",
        id: "9945",
        type: "PDFDropdown",
      },
      zip: {
        value: "E3Zipcode",
        id: "9943",
        type: "PDFTextField",
      },
      country: {
        value: "Albania",
        id: "9944",
        type: "PDFDropdown",
      },
      hasAPOOrFPO: {
        value: "NO",
        id: "17195",
        type: "PDFRadioGroup",
      },

      APOOrFPODetails: {
        street: {
          value: "aE3Address",
          id: "9923",
          type: "PDFTextField",
        },
        city: {
          value: "aE3City",
          id: "9922",
          type: "PDFTextField",
        },
        state: {
          value: "AR",
          id: "9921",
          type: "PDFDropdown",
        },
        zip: {
          value: "aE3Zip",
          id: "9915",
          type: "PDFTextField",
        },
        country: {
          value: "Algeria",
          id: "9920",
          type: "PDFDropdown",
        },
        APOFPOAddress: {
          value: "bE3Address",
          id: "9919",
          type: "PDFTextField",
        },
        APOOrFPO: {
          value: "APO",
          id: "9918",
          type: "PDFTextField",
        },
        APOFPOStateCode: {
          value: "APO/FPO Pacific",
          id: "9917",
          type: "PDFDropdown",
        },
        APOFPOZip: {
          value: "bE3Zip",
          id: "9916",
          type: "PDFTextField",
        },
      },
    },

    contact: {
      lastname: {
        value: "E3NeightborLName",
        id: "9941",
        type: "PDFTextField",
      },
      firstname: {
        value: "E3NeighborFName",
        id: "9940",
        type: "PDFTextField",
      },
      middlename: {
        value: "E3NeightborMName",
        id: "9942",
        type: "PDFTextField",
      },
      suffix: {
        value: "Jr",
        id: "9939",
        type: "PDFDropdown",
      },
      lastContactDate: {
        value: "e3LastContact",
        id: "9925",
        type: "PDFTextField",
      },
      isLastContactEst: {
        value: "Yes",
        id: "9852",
        type: "PDFCheckBox",
      },
      relationship: {
        checkboxes: [
          {
            value: "Yes",
            id: "9938",
            type: "PDFCheckBox",
          },
          {
            value: "Yes",
            id: "9937",
            type: "PDFCheckBox",
          },
          {
            value: "Yes",
            id: "9936",
            type: "PDFCheckBox",
          },
          {
            value: "Yes",
            id: "9935",
            type: "PDFCheckBox",
          },
          {
            value: "Yes",
            id: "9934",
            type: "PDFCheckBox",
          },
        ],
      },
      relationshipOtherDetail: {
        value: "E3OtherRelationship",
        id: "9933",
        type: "PDFTextField",
      },
      phone: [
        {
          _id: 1,
          dontKnowNumber: {
            value: "Yes",
            id: "9898",
            type: "PDFCheckBox",
          },
          isInternationalOrDSN: {
            value: "Yes",
            id: "9897",
            type: "PDFCheckBox",
          },
          number: {
            value: "E3Phone1",
            id: "9900",
            type: "PDFTextField",
          },
          extension: {
            value: "1",
            id: "9899",
            type: "PDFTextField",
          },
        },
        {
          _id: 2,
          dontKnowNumber: {
            value: "Yes",
            id: "9961",
            type: "PDFCheckBox",
          },
          isInternationalOrDSN: {
            value: "Yes",
            id: "9960",
            type: "PDFCheckBox",
          },
          number: {
            value: "E3Phone2",
            id: "9965",
            type: "PDFTextField",
          },
          extension: {
            value: "2",
            id: "9964",
            type: "PDFTextField",
          },
        },
        {
          _id: 3,
          dontKnowNumber: {
            value: "Yes",
            id: "9959",
            type: "PDFCheckBox",
          },
          isInternationalOrDSN: {
            value: "Yes",
            id: "9958",
            type: "PDFCheckBox",
          },
          number: {
            value: "E3Phone3",
            id: "9963",
            type: "PDFTextField",
          },
          extension: {
            value: "3",
            id: "9962",
            type: "PDFTextField",
          },
        },
      ],
      email: {
        value: "E3emai",
        id: "9927",
        type: "PDFTextField",
      },
      dontKnowEmail: {
        value: "Yes",
        id: "9926",
        type: "PDFCheckBox",
      },
      contactAddress: {
        street: {
          value: "E3ContactStreetE3",
          id: "9932",
          type: "PDFTextField",
        },
        city: {
          value: "E3ContactCity",
          id: "9931",
          type: "PDFTextField",
        },
        state: {
          value: "AS",
          id: "9930",
          type: "PDFDropdown",
        },
        zip: {
          value: "E3ZipCode",
          id: "9928",
          type: "PDFTextField",
        },
        country: {
          value: "Andorra",
          id: "9929",
          type: "PDFDropdown",
        },
        hasAPOOrFPO: {
          value: "YES ",
          id: "17196",
          type: "PDFRadioGroup",
        },
        APOOrFPODetails: {
          street: {
            value: "aE3Address",
            id: "9907",
            type: "PDFTextField",
          },
          city: {
            value: "aE3City",
            id: "9922",
            type: "PDFTextField",
          },
          state: {
            value: "APO/FPO Europe",
            id: "9905",
            type: "PDFDropdown",
          },
          zip: {
            value: "aE3Zip",
            id: "9915",
            type: "PDFTextField",
          },
          country: {
            value: "Algeria",
            id: "9920",
            type: "PDFDropdown",
          },
          APOFPOAddress: {
            value: "bE3Address",
            id: "9906",
            type: "PDFTextField",
          },
          APOOrFPO: {
            value: "APO",
            id: "9918",
            type: "PDFTextField",
          },
          APOFPOStateCode: {
            value: "APO/FPO Pacific",
            id: "9905",
            type: "PDFDropdown",
          },
          APOFPOZip: {
            value: "bE3Zip",
            id: "9904",
            type: "PDFTextField",
          },
        },
      },
    },
  },
  {
    _id: 4,
    residenceStartDate: {
      value: "e4FromDate",
      id: "10017",
      type: "PDFTextField",
    },
    isStartDateEst: { value: "Yes", id: "10016", type: "PDFCheckBox" },
    residenceEndDate: {
      value: "e4ToDate",
      id: "10015",
      type: "PDFTextField",
    },
    isResidenceEndEst: { value: "Yes", id: "10014", type: "PDFCheckBox" },
    isResidencePresent: {
      value: "Yes",
      id: "10013",
      type: "PDFCheckBox",
    },
    residenceStatus: { value: "4", id: "17193", type: "PDFRadioGroup" },
    residenceOtherDetails: {
      value: "e4OtherExplaination",
      id: "10012",
      type: "PDFTextField",
    },
    residenceAddress: {
      street: { value: "e4Street", id: "10011", type: "PDFTextField" },
      city: { value: "e4City", id: "10010", type: "PDFTextField" },
      state: { value: "AK", id: "10009", type: "PDFDropdown" },
      zip: { value: "e4Zip", id: "10007", type: "PDFTextField" },
      country: { value: "USA", id: "10008", type: "" }, // Assuming USA as country
      hasAPOOrFPO: {
        value: "NO",
        id: "17195",
        type: "PDFRadioGroup",
      },
      APOOrFPODetails: {
        street: {
          value: "aE3Address",
          id: "9987",
          type: "PDFTextField",
        },
        city: {
          value: "aE3City",
          id: "9986",
          type: "PDFTextField",
        },
        state: {
          value: "AR",
          id: "9985",
          type: "PDFDropdown",
        },
        zip: {
          value: "aE3Zip",
          id: "9979",
          type: "PDFTextField",
        },
        country: {
          value: "Algeria",
          id: "9984",
          type: "PDFDropdown",
        },
        APOFPOAddress: {
          value: "bE3Address",
          id: "9983",
          type: "PDFTextField",
        },
        APOOrFPO: {
          value: "APO",
          id: "9982",
          type: "PDFTextField",
        },
        APOFPOStateCode: {
          value: "APO/FPO Pacific",
          id: "9981",
          type: "PDFDropdown",
        },
        APOFPOZip: {
          value: "bE3Zip",
          id: "9980",
          type: "PDFTextField",
        },
      },
    },

    contact: {
      lastname: { value: "bE4LName", id: "10005", type: "PDFTextField" },
      firstname: { value: "bE4FName", id: "10004", type: "PDFTextField" },
      middlename: {
        value: "bE4MName",
        id: "10006",
        type: "PDFTextField",
      },
      suffix: { value: "Jr", id: "10003", type: "PDFDropdown" },
      lastContactDate: {
        value: "bE4LastContact",
        id: "9989",
        type: "PDFTextField",
      },
      isLastContactEst: { value: "Yes", id: "9988", type: "PDFCheckBox" },
      relationship: {
        checkboxes: [
          { value: "Yes", id: "10002", type: "PDFCheckBox" },
          { value: "Yes", id: "10001", type: "PDFCheckBox" },
          { value: "Yes", id: "10000", type: "PDFCheckBox" },
          { value: "Yes", id: "9999", type: "PDFCheckBox" },
          { value: "Yes", id: "9998", type: "PDFCheckBox" },
        ],
      },
      relationshipOtherDetail: {
        value: "OtherRelationship",
        id: "9997",
        type: "PDFTextField",
      },
      phone: [
        {
          _id: 1,
          dontKnowNumber: {
            value: "Yes",
            id: "10021",
            type: "PDFCheckBox",
          },
          isInternationalOrDSN: {
            value: "Yes",
            id: "10020",
            type: "PDFCheckBox",
          },
          number: {
            value: "e4Phone1",
            id: "10029",
            type: "PDFTextField",
          },
          extension: {
            value: "1",
            id: "10028",
            type: "PDFTextField",
          },
        },
        {
          _id: 2,
          dontKnowNumber: {
            value: "Yes",
            id: "10027",
            type: "PDFCheckBox",
          },
          isInternationalOrDSN: {
            value: "Yes",
            id: "10026",
            type: "PDFCheckBox",
          },
          number: {
            value: "e4Phone2",
            id: "10025",
            type: "PDFTextField",
          },
          extension: {
            value: "2",
            id: "10024",
            type: "PDFTextField",
          },
        },
        {
          _id: 3,
          dontKnowNumber: {
            value: "Yes",
            id: "10019",
            type: "PDFCheckBox",
          },
          isInternationalOrDSN: {
            value: "Yes",
            id: "10018",
            type: "PDFCheckBox",
          },
          number: {
            value: "e4Phone3",
            id: "10023",
            type: "PDFTextField",
          },
          extension: {
            value: "3",
            id: "10022",
            type: "PDFTextField",
          },
        },
      ],
      email: {
        value: "e4ContactEmail",
        id: "9991",
        type: "PDFTextField",
      },
      dontKnowEmail: { value: "Yes", id: "9990", type: "PDFCheckBox" },
      contactAddress: {
        street: {
          value: "e4ContactStreet",
          id: "9996",
          type: "PDFTextField",
        },
        city: {
          value: "e4ContactCity",
          id: "9995",
          type: "PDFTextField",
        },
        state: { value: "AS", id: "9994", type: "PDFDropdown" },
        zip: { value: "e4ContactZip", id: "9992", type: "PDFTextField" },
        country: { value: "Algeria", id: "9993", type: "PDFDropdown" },
        hasAPOOrFPO: {
          value: "YES ",
          id: "17191",
          type: "PDFRadioGroup",
        },
        APOOrFPODetails: {
          street: {
            value: "aE3Address",
            id: "9978",
            type: "PDFTextField",
          },
          city: {
            value: "aE3City",
            id: "9977",
            type: "PDFTextField",
          },
          state: {
            value: "AR",
            id: "9976",
            type: "PDFDropdown",
          },
          zip: {
            value: "aE3Zip",
            id: "9974",
            type: "PDFTextField",
          },
          country: {
            value: "Algeria",
            id: "9975",
            type: "PDFDropdown",
          },
          APOFPOAddress: {
            value: "bE3Address",
            id: "9971",
            type: "PDFTextField",
          },
          APOOrFPO: {
            value: "APO",
            id: "9970",
            type: "PDFTextField",
          },
          APOFPOStateCode: {
            value: "APO/FPO Pacific",
            id: "9969",
            type: "PDFDropdown",
          },
          APOFPOZip: {
            value: "bE3Zip",
            id: "9968",
            type: "PDFTextField",
          },
        },
      },
    },
  },
];
