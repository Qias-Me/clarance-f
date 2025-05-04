import GenericFormField from "./templates/genericForm";
import { useForm } from "../samples/formContext";
import StepperControls from "./stepperControls";
import formFieldsJson from "../../../../api/json/nameInfo.json";
import { ApplicantPersonalInfo } from "api_v2/interfaces/form4";
import React, { ChangeEvent, useEffect, useState } from "react";
import ConditionalComponent from "./templates/conditionalForm";
import Section1 from "../revamp/templates/section1"
import preprocessFormFields, {
  FormField,
  validateAndConvertFields,
} from "~/utils/forms/processFields";



const FormSectionExample = () => {
  const { formData, setFormData, currentStep } = useForm();
  const [processedFields, setProcessedFields] = useState<FormField[]>([]);

  useEffect(() => {
    const fields = validateAndConvertFields(formFieldsJson as FormField[]);
    const processed = preprocessFormFields(fields, formData.personalInfo);
    console.log(processed);
    setProcessedFields(processed);
    console.log(formData.personalInfo);
  }, [formData.personalInfo]);

  if (currentStep !== 1) return null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>,
    fieldName: keyof ApplicantPersonalInfo
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e as ChangeEvent<HTMLInputElement>).target.checked
        : e.target.value;
    const updatedPersonalInfo = {
      ...formData.personalInfo,
      [fieldName]: value,
    };
    setFormData({ ...formData, personalInfo: updatedPersonalInfo });
  };

  const updatePersonalInfoSection = (fieldName: keyof ApplicantPersonalInfo, value: string | boolean | string[]) => {
    const updatedSection = { ...formData.personalInfo, [fieldName]: value };
    setFormData({ ...formData, personalInfo: updatedSection });
  };

  return (
    <section className="form-section">
    <Section1  formDataSection={formData.personalInfo}
      updateFormDataSection={updatePersonalInfoSection}
      sectionFields={processedFields}/>
      <StepperControls />
    </section>
  );
};

export default FormSectionExample;
