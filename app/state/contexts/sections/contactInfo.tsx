import { type ContactInfo } from "api/interfaces/sections/contact";

//ContactInfo covers section 7

export const contactInfo: ContactInfo = {
    homeEmail: {
      value: "",
      id: "9513",
      type: "PDFTextField",
      label: "Section 7-Your Contact Information. Provide your contact information. Home e-mail address",
    },
    workEmail: {
      value: "",
      id: "9512",
      type: "PDFTextField",
      label: "Work e-mail address",
    },
    contactNumbers: [
      {
        _id: 1,
        phoneNumber: {
          value: "",
          id: "9511",
          type: "PDFTextField",
          label: "Home telephone number",
        },
        extension: {
          value: "",
          id: "9510",
          type: "PDFTextField",
          label: "Extension",
        },
        isUsableDay: {
          value: "NO",
          id: "9507",
          type: "PDFCheckBox",
          label: "Day",
        },
        isUsableNight: {
          value: "NO",
          id: "9508",
          type: "PDFCheckBox",
          label: "Night",
        },
        internationalOrDSN: {
          value: "NO",
          id: "9509",
          type: "PDFCheckBox",
          label: "Home telephone number: International or D S N phone number",
        },
      },
      {
        _id: 2,

        phoneNumber: {
          value: "",
          id: "9506",
          type: "PDFTextField",
          label: "Work telephone number",
        },
        extension: {
          value: "",
          id: "9505",
          type: "PDFTextField",
          label: "Extension",
        },
        isUsableDay: {
          value: "NO",
          id: "9562",
          type: "PDFCheckBox",
          label: "Day",
        },
        isUsableNight: {
          value: "NO",
          id: "9503",
          type: "PDFCheckBox",
          label: "Night",
        },
        internationalOrDSN: {
          value: "NO",
          id: "9504",
          type: "PDFCheckBox",
          label: "Work telephone number: International or D S N phone number",
        },
      },
      {
        _id: 3,
        phoneNumber: {
          value: "",
          id: "9561",
          type: "PDFTextField",
          label: "Mobile/Cell telephone number",
        },
        extension: {
          value: "",
          id: "9560",
          type: "PDFTextField",
          label: "Extension",
        },
        isUsableDay: {
          value: "NO",
          id: "9557",
          type: "PDFCheckBox",
          label: "Day",
        },
        isUsableNight: {
          value: "NO",
          id: "9558",
          type: "PDFCheckBox",
          label: "Night",
        },
        internationalOrDSN: {
          value: "NO",
          id: "9559",
          type: "PDFCheckBox",
          label: "Mobile/Cell telephone number: International or D S N phone number",
        },
      },
    ],
  };
