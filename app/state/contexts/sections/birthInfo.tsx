import { BirthInfo } from "api/interfaces/sections/birthnfo";

// BirthInfo Covers Sections 2 and 3

export const birthInfo: BirthInfo = {
    birthDate: {
        value: "section 2 value",
        id: "12345",
        type: "PDFTextField",
    },
    isBirthDateEstimate: {
        value: "Yes",
        id: "12348",
        type: "PDFCheckBox",
    },
    birthCity: {
        value: "section 3 value",
        id: "12346",
        type: "PDFTextField",
    },
    birthState: {
        value: "section 3 value",
        id: "12348",
        type: "PDFTextField",
    },
    birthCounty: {
        value: "section 3 value",
        id: "12348",
        type: "PDFTextField",
    },
    birthCountry: {
        value: "section 3 value",
        id: "12347",
        type: "PDFTextField",
    }
};
