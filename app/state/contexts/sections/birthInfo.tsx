import { type BirthInfo } from "api/interfaces/sections/birthnfo";

// BirthInfo Covers Sections 2 and 3
// Section 2 fields (Date of Birth) are correctly mapped here
// Section 3 fields (Place of Birth) are also included as they're part of the same interface

export const birthInfo: BirthInfo = {
    // Section 2 fields - Date of Birth
    birthDate: {
        value: "",
        id: "9432", // Field ID from field-hierarchy.json without the "0 R" suffix
        type: "PDFTextField",
        label: "Section 2. Date of Birth. Provide your date of birth (month/day/year).",
    },
    isBirthDateEstimate: {
        value: "No",
        id: "9431", // Field ID from field-hierarchy.json without the "0 R" suffix
        type: "PDFCheckBox",
        label: "Estimate",
    },
    
    // Section 3 fields - Place of Birth
    birthCity: {
        value: "",
        id: "9446", // Field ID from field-hierarchy.json without the "0 R" suffix
        type: "PDFTextField",
        label: "Section 3. Place of Birth. Provide your place of birth. City.",
    },
    birthState: {
        value: "",
        id: "9443", // Field ID from field-hierarchy.json without the "0 R" suffix
        type: "PDFTextField",
        label: "State",
    },
    birthCounty: {
        value: "",
        id: "9445", // Field ID from field-hierarchy.json without the "0 R" suffix
        type: "PDFTextField",
        label: "County",
    },
    birthCountry: {
        value: "",
        id: "9444", // Field ID from field-hierarchy.json without the "0 R" suffix
        type: "PDFDropdown",
        label: "Country (Required)",
    }
};
