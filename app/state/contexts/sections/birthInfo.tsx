import { type BirthInfo } from "api/interfaces/sections/birthnfo";

// BirthInfo Covers Sections 2 and 3

export const birthInfo: BirthInfo = {
    birthDate: {
        value: "sect2DateofBirth",
        id: "9432",
        type: "PDFTextField",
        label: "Section 2. Date of Birth. Provide your date of birth (month/day/year).",
    },
    isBirthDateEstimate: {
        value: "Yes",
        id: "9431",
        type: "PDFCheckBox",
        label: "Estimate",
    },
    birthCity: {
        value: "sect3BirthCity",
        id: "9446",
        type: "PDFTextField",
        label: "Section 3. Place of Birth. Provide your place of birth. City.",
    },
    birthState: {
        value: "sect3State",
        id: "9443",
        type: "PDFTextField",
        label: "State",
    },
    birthCounty: {
        value: "sect3County",
        id: "9445",
        type: "PDFTextField",
        label: "County",
    },
    birthCountry: {
        value: "United States",
        id: "9444",
        type: "PDFDropdown",
        label: "Country (Required)",
    }
};
