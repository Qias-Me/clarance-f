import GenericFormField from "./templates/genericForm";
import { useForm } from "../samples/formContext";
import StepperControls from "./stepperControls";
import formFieldsJson from "../../../../api/json/nameInfo.json";
import { ApplicantPersonalInfo } from "api_v2/interfaces/form4";
import React, { ChangeEvent, useEffect, useState } from "react";
import ConditionalComponent from "./templates/conditionalForm";
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

  return (
    <section className="form-section">
      {processedFields.map(({ id, label, type, name, options }, index) => {
        if (id === "ssn") {
          return (
            <ConditionalComponent
              condition={!formData.personalInfo.isNotApplicable}
              key={index}
            >
              <GenericFormField
                id={id}
                label={label}
                type={type as "text" | "checkbox" | "dropdown"}
                value={
                  formData.personalInfo[name as keyof ApplicantPersonalInfo] ??
                  ""
                }
                onChange={(e) =>
                  handleChange(e, name as keyof ApplicantPersonalInfo)
                }
                options={options}
              />
            </ConditionalComponent>
          );
        }

        if (id === "state") {
          return (
            <ConditionalComponent
              condition={!formData.personalInfo.isNotApplicable}
              key={index}
            >
              <GenericFormField
                id={id}
                label={label}
                type={type as "text" | "checkbox" | "dropdown"}
                value={
                  formData.personalInfo[name as keyof ApplicantPersonalInfo] ??
                  ""
                }
                onChange={(e) =>
                  handleChange(e, name as keyof ApplicantPersonalInfo)
                }
                options={options}
              />
            </ConditionalComponent>
          );
        }

        if (id === "country") {
          return (
            <ConditionalComponent
              condition={!formData.personalInfo.isNotApplicable}
              key={index}
            >
              <GenericFormField
                id={id}
                label={label}
                type={type as "text" | "checkbox" | "dropdown"}
                value={
                  formData.personalInfo[name as keyof ApplicantPersonalInfo] ??
                  ""
                }
                onChange={(e) =>
                  handleChange(e, name as keyof ApplicantPersonalInfo)
                }
                options={options}
              />
            </ConditionalComponent>
          );
        }



        return (
          <React.Fragment key={index}>
            <GenericFormField
              id={id}
              label={label}
              type={type as "text" | "checkbox" | "dropdown"}
              value={
                formData.personalInfo[name as keyof ApplicantPersonalInfo] ?? ""
              }
              onChange={(e) =>
                handleChange(e, name as keyof ApplicantPersonalInfo)
              }
              options={options}
            />
          </React.Fragment>
        );
      })}
      <StepperControls />
    </section>
  );
};

export default FormSectionExample;
