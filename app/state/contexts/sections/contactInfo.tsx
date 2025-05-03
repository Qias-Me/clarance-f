import { ContactInfo } from "api/interfaces/sections/contact";

//ContactInfo covers section 7

export const contactInfo: ContactInfo = {
    homeEmail: {
      value: "homeEmail",
      id: "9513",
      type: "PDFTextField",
    },
    workEmail: {
      value: "workEmail",
      id: "9512",
      type: "PDFTextField",
    },
    contactNumbers: [
      {
        _id: 1,
        numberType: {
          value: "DSN",
          id: "9511",
          type: "PDFTextField",
        },
        phoneNumber: {
          value: "phoneNumber1",
          id: "9511",
          type: "PDFTextField",
        },
        extension: {
          value: "1",
          id: "9510",
          type: "PDFTextField",
        },
        isUsableDay: {
          value: "YES",
          id: "9507",
          type: "PDFCheckBox",
        },
        isUsableNight: {
          value: "YES",
          id: "9508",
          type: "PDFCheckBox",
        },
        internationalOrDSN: {
          value: "YES",
          id: "9509",
          type: "PDFCheckBox",
        },
      },
      {
        _id: 2,
        numberType: {
          value: "International",
          id: "",
          type: "PDFTextField",
        },
        phoneNumber: {
          value: "phoneNumber2",
          id: "9506",
          type: "PDFTextField",
        },
        extension: {
          value: "2",
          id: "9505",
          type: "PDFTextField",
        },
        isUsableDay: {
          value: "YES",
          id: "9562",
          type: "PDFCheckBox",
        },
        isUsableNight: {
          value: "YES",
          id: "9503",
          type: "PDFCheckBox",
        },
        internationalOrDSN: {
          value: "YES",
          id: "9504",
          type: "PDFCheckBox",
        },
      },
      {
        _id: 3,
        numberType: {
          value: "Home",
          id: "",
          type: "PDFTextField",
        },
        phoneNumber: {
          value: "phoneNumber3",
          id: "9561",
          type: "PDFTextField",
        },
        extension: {
          value: "3",
          id: "9560",
          type: "PDFTextField",
        },
        isUsableDay: {
          value: "YES",
          id: "9557",
          type: "PDFCheckBox",
        },
        isUsableNight: {
          value: "YES",
          id: "9558",
          type: "PDFCheckBox",
        },
        internationalOrDSN: {
          value: "NO",
          id: "9559",
          type: "PDFCheckBox",
        },
      },
    ],
  };
