// import { ApplicantInfo } from "api_v2/interfaces/form4";
// import preprocessFormFields, {
//   FormField,
//   validateAndConvertFields,
// } from "../../../../utils/forms/processFields"; // Adjust import paths as needed
// import ConditionalComponent from "./conditionalForm"; // Adjust import paths as needed
// import { ChangeEvent } from "react";

// type InputValue = string | boolean | string[]; // Accommodates text inputs, checkboxes, and multi-select inputs

// interface FormSectionProps {
//     formDataSection: Partial<ApplicantInfo>;
//     updateFormDataSection: (fieldName: keyof ApplicantInfo, value: InputValue) => void;
//     sectionFields: FormField[]; // Make sure FormField's condition function aligns with this approach
//   }

// function FormSection({
//   formDataSection,
//   updateFormDataSection,
//   sectionFields,
// }: FormSectionProps) {
//   const fields = validateAndConvertFields(sectionFields);
//   const processedFields = preprocessFormFields(fields, formDataSection);

//   const handleChange = (
//     e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>,
//     fieldName: keyof Partial<ApplicantInfo>
//   ) => {
//     const value =
//       e.target.type === "checkbox"
//         ? (e as ChangeEvent<HTMLInputElement>).target.checked
//         : e.target.value;
//     updateFormDataSection(fieldName, value);
//   };

//   return (
//     <div>
//       {processedFields.map((field) => (
//         <ConditionalComponent
//           key={field.id}
//           condition={field.condition ? field.condition(formDataSection) : true}
//         >
//           <label htmlFor={field.id}>{field.label}</label>
//           <input
//             id={field.id}
//             name={field.name}
//             type={field.type}
//             value={String(formDataSection[field.name as keyof T] || "")}
//             onChange={(e) => handleChange(e, field.name as keyof T)}
//           />
//         </ConditionalComponent>
//       ))}
//     </div>
//   );
// }

// export default FormSection;
