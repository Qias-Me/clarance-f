import { ApplicantInfo } from "api_v2/interfaces/form4";
import React, { createContext, useContext, useState } from "react";

// const defaultFormData: ApplicantInfo = {
//   personalInfo: {
//     applicantID: 0,
//     lastName: "",
//     firstName: "",
//     middleName: "",
//     suffix: "",
//     ssn: "",
//     gender: "",
//     isNotApplicable: false,
//   },
//   birthInfo: {
//     birthInfoID: 0,
//     birthDate: "",
//     isBirthDateEstimate: false,
//     birthCity: "",
//     birthState: "",
//     birthCountry: "",
//   },
//   names: [
//     {
//       nameID: 0,
//       lastName: "",
//       firstName: "",
//       middleName: "",
//       suffix: "",
//       nameStarted: "",
//       isStartDateEst: false,
//       nameEnded: "",
//       isNamePresent: false,
//       isEndDateEst: false,
//       isMaidenName: false,
//       reasonChanged: "",
//     },
//   ],
//   contactInfo: {
//     contactID: 0,
//     homeEmail: "",
//     workEmail: "",
//     contactNumbers: [
//       {
//         numberType: "Home", // Assuming these are the three types
//         phoneNumber: "",
//         phoneExtension: "",
//         isUsableDay: false,
//         isUsableNight: false,
//       },
//     ],
//   },
//   physicalAttributes: {
//     attributeID: 0,
//     heightFeet: 0,
//     heightInch: 0,
//     weight: 0,
//     hairColor: "",
//     eyeColor: "",
//   },
//   passportInfo: {
//     passportID: 0,
//     passportNum: "",
//     issueDate: "",
//     isIssuedEst: false,
//     expirationDate: "",
//     isExpirationEst: false,
//     passportLName: "",
//     passportFName: "",
//     passportMName: "",
//     passportSuffix: "",
//     hasPassport: false,
//   },
//   citizenshipInfo: {
//     citizenship_status_code: "citizen",
//   },
//   duelCitizenshipInfo: {
//     heldMultipleCitizenships: false,
//     hadNonUSPassport: false,
//     citizenships: [],
//     passports: [],
//   },
//   residencyInfo: [],
// };



const defaultFormData: ApplicantInfo = {
  personalInfo: {
    applicantID: 0,
    lastName: "",
    firstName: "",
    middleName: "",
    suffix: "",
    ssn: "",
    gender: "",
    isNotApplicable: false,
  },
  birthInfo: {
    birthInfoID: 0,
    birthDate: "",
    isBirthDateEstimate: false,
    birthCity: "",
    birthState: "",
    birthCountry: "",
  },
  names: [
    {
      nameID: 0,
      lastName: "",
      firstName: "",
      middleName: "",
      suffix: "",
      nameStarted: "",
      isStartDateEst: false,
      nameEnded: "",
      isNamePresent: false,
      isEndDateEst: false,
      isMaidenName: false,
      reasonChanged: "",
    },
  ],
  contactInfo: {
    contactID: 0,
    homeEmail: "",
    workEmail: "",
    contactNumbers: [
      {
        numberType: "Home", // Assuming these are the three types
        phoneNumber: "",
        phoneExtension: "",
        isUsableDay: false,
        isUsableNight: false,
      },
    ],
  },
  physicalAttributes: {
    attributeID: 0,
    heightFeet: 0,
    heightInch: 0,
    weight: 0,
    hairColor: "",
    eyeColor: "",
  },
  passportInfo: {
    passportID: 0,
    passportNum: "",
    issueDate: "",
    isIssuedEst: false,
    expirationDate: "",
    isExpirationEst: false,
    passportLName: "",
    passportFName: "",
    passportMName: "",
    passportSuffix: "",
    hasPassport: false,
  },
  citizenshipInfo: {
    citizenship_status_code: "citizen",
  },
  duelCitizenshipInfo: {
    heldMultipleCitizenships: false,
    hadNonUSPassport: false,
    citizenships: [],
    passports: [],
  },
  residencyInfo: [],
};

interface FormContextType {
  formData: ApplicantInfo;
  setFormData: React.Dispatch<React.SetStateAction<ApplicantInfo>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  submitForm: () => void;
  resetForm: () => void;
}

const FormContext = createContext<FormContextType>({
  currentStep: 1,
  setCurrentStep: () => {},
  formData: defaultFormData,
  setFormData: () => {},
  goToNextStep: () => {},
  goToPrevStep: () => {},
  submitForm: () => {},
  resetForm: () => {},
});

// Hook to use the context
export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  // Ensure formData uses ApplicantInfo as its type for state management
  const [formData, setFormData] = useState<ApplicantInfo>(defaultFormData);
  const goToNextStep = () => setCurrentStep((current) => current + 1);
  const goToPrevStep = () =>
    setCurrentStep((current) => Math.max(1, current - 1));

  const submitForm = async () => {
    try {
      setSubmitting(true);
      // const response = await someApiCall(formData); // Assuming someApiCall is your API submission function
      // console.log("Form submitted successfully:", response);
      // Handle success (show success message, navigate, etc.)
    } catch (error) {
      console.error("Form submission error:", error);
      // Handle error (show error message, etc.)
    } finally {
      setSubmitting(false); // Reset submitting state
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData); // Reset to initial default state
  };

  return (
    <FormContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        formData,
        setFormData,
        goToNextStep,
        goToPrevStep,
        submitForm,
        resetForm,
      }}
    >
      {(submitting && <p>Submitting form...</p>) || children}
    </FormContext.Provider>
  );
};
