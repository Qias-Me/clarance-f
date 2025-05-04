import { type ForeignContacts } from "api/interfaces/sections/foreignContacts";

// foreignContacts covers section 19

export const foreignContacts: ForeignContacts = {
  _id: Math.random(),
  hasForeignContact: {
    value: "NO",
    id: "",
    type: "PDFRadioGroup",
  },
  entries: [
    {
      _id: Math.random(),
      lastName: {
        value: "",
        id: "13133",
        type: "PDFTextField",
      },
      firstName: {
        value: "",
        id: "13132",
        type: "PDFTextField",
      },
      middleName: {
        value: "",
        id: "13134",
        type: "PDFTextField",
      },
      suffix: {
        value: "",
        id: "13135",
        type: "PDFDropdown",
      },
      approximateFirstContactDate: {
        value: "",
        id: "13130",
        type: "PDFTextField",
      },
      approximateLastContactDate: {
        value: "",
        id: "13128",
        type: "PDFTextField",
      },
      contactMethods: [
        {
          value: "In Person",
          id: "13124",
          type: "PDFCheckBox",
        },
        {
          value: "Telephone",
          id: "13126",
          type: "PDFCheckBox",
        },
        {
          value: "Electronic",
          id: "13125",
          type: "PDFCheckBox",
        },
        {
          value: "Written Correspondence",
          id: "13123",
          type: "PDFCheckBox",
        },
        {
          value: "Other",
          id: "13121",
          type: "PDFCheckBox",
        },
      ],
      contactFrequency: [
        {
          value: "Daily",
          id: "13120",
          type: "PDFRadioGroup",
        },
        {
          value: "Weekly",
          id: "13119",
          type: "PDFRadioGroup",
        },
        {
          value: "Monthly",
          id: "13118",
          type: "PDFRadioGroup",
        },
        {
          value: "Quarterly",
          id: "13117",
          type: "PDFRadioGroup",
        },
        {
          value: "Annually",
          id: "13116",
          type: "PDFRadioGroup",
        },
        {
          value: "Other",
          id: "13196",
          type: "PDFRadioGroup",
        },
      ],
      relationshipNature: [
        {
          value: "Professional or Business",
          id: "13191",
          type: "PDFCheckBox",
        },
        {
          value: "Personal",
          id: "13192",
          type: "PDFCheckBox",
        },
        {
          value: "Obligation",
          id: "13189",
          type: "PDFCheckBox",
        },
        {
          value: "Other",
          id: "13193",
          type: "PDFCheckBox",
        },
      ],
      otherNames: [
        {
          lastName: {
            value: "",
            id: "13188",
            type: "PDFTextField",
          },
          firstName: {
            value: "",
            id: "13187",
            type: "PDFTextField",
          },
          middleName: {
            value: "",
            id: "13186",
            type: "PDFTextField",
          },
          suffix: {
            value: "",
            id: "13185",
            type: "PDFDropdown",
          },
        },
      ],
      citizenships: [
        {
          _id: Math.random(),
          country: {
            value: "",
            id: "13138",
            type: "PDFDropdown",
          },
        },
        {
          _id: Math.random(),
          country: {
            value: "",
            id: "13137",
            type: "PDFDropdown",
          },
        },
      ],
      dateOfBirth: {
        value: "",
        id: "13171",
        type: "date",
      },
      placeOfBirth: {
        city: {
          value: "",
          id: "13143",
          type: "PDFTextField",
        },
        country: {
          value: "",
          id: "13144",
          type: "PDFDropdown",
        },
      },
      currentAddress: {
        street: {
          value: "",
          id: "13169",
          type: "PDFTextField",
        },
        city: {
          value: "",
          id: "13168",
          type: "PDFTextField",
        },
        state: {
          value: "",
          id: "13167",
          type: "PDFDropdown",
        },
        zipCode: {
          value: "",
          id: "13165",
          type: "PDFTextField",
        },
        country: {
          value: "",
          id: "13166",
          type: "PDFDropdown",
        },
      },
      apoFpoAddress: {
        address: {
          value: "",
          id: "13147",
          type: "PDFTextField",
        },
        stateCode: {
          value: "",
          id: "13146",
          type: "PDFTextField",
        },
        zipCode: {
          value: "",
          id: "13151",
          type: "PDFTextField",
        },
      },
      currentEmployer: {
        name: {
          value: "",
          id: "13163",
          type: "PDFTextField",
        },
        address: {
          street: {
            value: "",
            id: "13161",
            type: "PDFTextField",
          },
          city: {
            value: "",
            id: "13160",
            type: "PDFTextField",
          },
          state: {
            value: "",
            id: "13159",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "",
            id: "13157",
            type: "PDFTextField",
          },
          country: {
            value: "",
            id: "13158",
            type: "PDFDropdown",
          },
        },
      },
      affiliatedWithForeignGov: {
        value: "NO",
        id: "13155",
        type: "PDFRadioGroup",
      },
      foreignGovAffiliationDetails: {
        value: "",
        id: "13152",
        type: "PDFTextField",
      },
    },
  ],
};
