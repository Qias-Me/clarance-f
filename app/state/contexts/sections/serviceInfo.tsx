import { type ServiceInfo } from "api/interfaces/sections/service";

// serviceInfo covers section 14

export const serviceInfo: ServiceInfo = {
    bornAfter1959: {
      value: "YES",
      id: "17089",
      type: "PDFRadioGroup",
    },
    registeredWithSSS: {
      value: "No", // Corresponds to the "No" radio button
      id: "17089",
      type: "PDFRadioGroup",
    },
    explanations: {
      Yes: {
        value: "Hello", // Explanation text corresponding to "YES"
        id: "11407",
        type: "PDFTextField",
      },
      No: {
        value: "hello1", // Explanation text corresponding to "NO"
        id: "11406",
        type: "PDFTextField",
      },
      "I don't know": {
        value: "HELLO@", // Explanation text corresponding to "I don't know"
        id: "11405",
        type: "PDFTextField",
      },
    },
  };
