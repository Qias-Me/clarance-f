import { type ServiceInfo } from "api/interfaces/sections/service";

// serviceInfo covers section 14 (Selective Service Record)

export const serviceInfo: ServiceInfo = {
  // Main registration status fields
  bornAfter1959: {
    value: "YES",
    id: "17089",
    type: "PDFRadioGroup",
    label: "Were you born male after December 31, 1959?"
  },
  registeredWithSSS: {
    value: "Yes", 
    id: "17089",
    type: "PDFRadioGroup",
    label: "Have you registered with the Selective Service System (SSS)?"
  },
  // Explanations for different registration statuses
  explanations: {
    Yes: {
      value: "", 
      id: "11407",
      type: "PDFTextField",
      label: "If yes, provide registration number"
    },
    No: {
      value: "", 
      id: "11406",
      type: "PDFTextField",
      label: "If no, provide explanation"
    },
    "I don't know": {
      value: "", 
      id: "11405",
      type: "PDFTextField",
      label: "If I don't know selected, provide explanation"
    }
  },
  // Military service details (First entry)
  radioButtonList1: {
    value: "NO",
    id: "17060",
    type: "PDFRadioGroup",
    label: "Have you served in the US military?"
  },
  radioButtonList2: {
    value: "NO",
    id: "17051",
    type: "PDFRadioGroup",
    label: "Military branch selection"
  },
  stateOfService: {
    value: "",
    id: "11394",
    type: "PDFDropdown",
    label: "State of service, if National Guard"
  },
  radioButtonList3: {
    value: "NO",
    id: "17052",
    type: "PDFRadioGroup",
    label: "Service status selection"
  },
  provideYourDates: {
    value: "",
    id: "11466",
    type: "PDFTextField",
    label: "Provide your dates of service. From Date (Month/Year)"
  },
  estimate: {
    value: "",
    id: "11465",
    type: "PDFCheckBox",
    label: "Estimate"
  },
  toDateMonthYear: {
    value: "",
    id: "11464",
    type: "PDFTextField",
    label: "To Date (Month/Year)"
  },
  present: {
    value: "NO",
    id: "11463",
    type: "PDFCheckBox",
    label: "Present"
  },
  estimate1: {
    value: "",
    id: "11462",
    type: "PDFCheckBox",
    label: "Estimate"
  },
  provideYourService: {
    value: "",
    id: "11461",
    type: "PDFTextField",
    label: "Provide your service number."
  },
  radioButtonList4: {
    value: "NO",
    id: "17083",
    type: "PDFRadioGroup",
    label: "Officer or enlisted"
  },
  radioButtonList5: {
    value: "NO",
    id: "17084",
    type: "PDFRadioGroup",
    label: "Were you discharged?"
  },
  provideTheDate: {
    value: "",
    id: "11452",
    type: "PDFTextField",
    label: "Provide the date of discharge listed (Month/Year)"
  },
  estimate2: {
    value: "",
    id: "11451",
    type: "PDFCheckBox",
    label: "Estimate"
  },
  otherProvideType: {
    value: "",
    id: "11450",
    type: "PDFTextField",
    label: "Other (provide type)"
  },
  provideTheReasons: {
    value: "",
    id: "11449",
    type: "PDFTextField",
    label: "Provide the reason(s) for the discharge, if discharge is other than Honorable"
  },
  
  // Military service details (Second entry)
  radioButtonList6: {
    value: "NO",
    id: "17058",
    type: "PDFRadioGroup",
    label: "Second service entry - Have you served in the US military?"
  },
  radioButtonList7: {
    value: "NO",
    id: "17042",
    type: "PDFRadioGroup",
    label: "Second service entry - Military branch selection"
  },
  radioButtonList8: {
    value: "NO",
    id: "17043",
    type: "PDFRadioGroup", 
    label: "Second service entry - Service status selection"
  },
  stateOfService1: {
    value: "",
    id: "11436",
    type: "PDFDropdown",
    label: "Second service entry - State of service, if National Guard"
  },
  radioButtonList9: {
    value: "NO",
    id: "17044",
    type: "PDFRadioGroup",
    label: "Second service entry - Service status"
  },
  provideYourDates1: {
    value: "",
    id: "11432",
    type: "PDFTextField",
    label: "Second service entry - Provide your dates of service. From Date (Month/Year)"
  },
  estimate3: {
    value: "",
    id: "11429",
    type: "PDFCheckBox",
    label: "Second service entry - Estimate"
  },
  toDateMonthYear1: {
    value: "",
    id: "11430",
    type: "PDFTextField",
    label: "Second service entry - To Date (Month/Year)"
  },
  present1: {
    value: "NO",
    id: "11431",
    type: "PDFCheckBox",
    label: "Second service entry - Present"
  },
  estimate4: {
    value: "",
    id: "11428",
    type: "PDFCheckBox",
    label: "Second service entry - Estimate"
  },
  provideYourService1: {
    value: "",
    id: "11427",
    type: "PDFTextField",
    label: "Second service entry - Provide your service number."
  },
  radioButtonList10: {
    value: "NO",
    id: "17076",
    type: "PDFRadioGroup",
    label: "Second service entry - Officer or enlisted"
  },
  radioButtonList11: {
    value: "NO",
    id: "17077",
    type: "PDFRadioGroup",
    label: "Second service entry - Were you discharged?"
  },
  provideTheDate1: {
    value: "",
    id: "11418",
    type: "PDFTextField",
    label: "Second service entry - Provide the date of discharge listed (Month/Year)"
  },
  estimate5: {
    value: "",
    id: "11417",
    type: "PDFCheckBox",
    label: "Second service entry - Estimate"
  },
  otherProvideType1: {
    value: "",
    id: "11416",
    type: "PDFTextField",
    label: "Second service entry - Other (provide type)"
  },
  provideTheReasons1: {
    value: "",
    id: "11415",
    type: "PDFTextField",
    label: "Second service entry - Provide the reason(s) for the discharge, if discharge is other than Honorable"
  },
  
  // Additional service information
  provideYourStatus: {
    value: "",
    id: "17047",
    type: "PDFRadioGroup",
    label: "Provide your status: Active Duty"
  },
  activeReserve: {
    value: "",
    id: "17048", 
    type: "PDFRadioGroup",
    label: "Active Reserve"
  },
  inactiveReserve: {
    value: "",
    id: "17049",
    type: "PDFRadioGroup",
    label: "Inactive Reserve"
  }
};
