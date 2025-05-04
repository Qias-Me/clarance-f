

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ApplicantFormValues, FormConfig } from "../../../../api/interfaces2.0/formDefinition";

interface FormContextType {
  formValues: ApplicantFormValues;
  currentStep: number;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  submitForm: () => Promise<void>;
  resetForm: () => void;
  processedFormConfig: FormConfig;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};

export const FormProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
 
  const [currentStep, setCurrentStep] = useState(0);


  useEffect(() => {
 


  }, [currentStep]);



  const goToNextStep = () => setCurrentStep((prev) => prev + 1);
  const goToPrevStep = () => setCurrentStep((prev) => Math.max(0, prev - 1));

  const submitForm = async () => {
    // Here, implement the form submission logic.
  };

  const resetForm = () => {
    setCurrentStep(0); // Reset to the first step
    // Reinitialize processed form configuration based on default data and step
  };

  return (
    <FormContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        goToNextStep,
        goToPrevStep,
        submitForm,
        resetForm,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
