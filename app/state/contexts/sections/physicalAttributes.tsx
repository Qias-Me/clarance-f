import {type PhysicalAttributes} from "../../../../api/interfaces/sections/physicalAttributes"


// physicalAttributes section 6

export const physicalAttributes: PhysicalAttributes = {
  heightFeet: {
    value: "1",
    id: "9434",
    type: "PDFDropdown",
    label: "Section 6. Your Identifying Information. Provide your identifying information. Height (feet).",
  },
  heightInch: {
    value: "11",
    id: "9433",
    type: "PDFDropdown",
    label: "Height (inches)",
  },
  weight: {
    value: "160",
    id: "9438",
    type: "PDFTextField",
    label: "Weight (in pounds)",
  },
  hairColor: {
    value: "Black",
    id: "9437",
    type: "PDFDropdown",
    label: "Hair color",
  },
  eyeColor: {
    value: "Blue",
    id: "9436",
    type: "PDFDropdown",
    label: "Eye color",
  },
  gender: {
    value: "Female",
    id: "17238",
    type: "PDFRadioGroup",
    label: "p3-rb3b",
  },
};
