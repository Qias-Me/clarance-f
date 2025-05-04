// import React, { useState } from "react";
// import lodash from "lodash";

// import { RenderBasicInfo } from "../components/Rendered/RenderBasicInfo";
// import { RenderBirthInfo } from "../components/Rendered/RenderBirthInfo";
// import { RenderAcknowledgementInfo } from "../components/Rendered/RenderAcknowledgementInfo";
// import { RenderNames } from "../components/Rendered/RenderNames";
// import { goToStep, selectCurrentStep } from "../state/user/formSlice";
// import StepperFooter from "../components/form86/samples/stepperFooter";
// import { useDispatch, useTypedSelector } from "~/state/hooks/index";
// import { RenderPhysicalsInfo } from "~/components/Rendered/RenderPhysicals";
// import { RenderContactInfo } from "~/components/Rendered/RenderContactInfo";
// import { RenderPassportInfo } from "~/components/Rendered/RenderPassportInfo";
// import { RenderCitizenshipInfo } from "~/components/Rendered/RenderCitizenshipInfo";
// import { RenderDualCitizenshipInfo } from "~/components/Rendered/RenderDuelCitizenship";
// import { RenderResidencyInfo } from "~/components/Rendered/RenderResidencyInfo";
// import { RenderSchoolInfo } from "~/components/Rendered/RenderSchoolInfo";
// import { RenderEmploymentInfo } from "~/components/Rendered/RenderEmployementInfo";
// import { RenderServiceInfo } from "~/components/Rendered/RenderServiceInfo";
// import { RenderMilitaryInfo } from "~/components/Rendered/RenderMilitaryInfo";
// import { RenderPeopleThatKnow } from "~/components/Rendered/RenderPeopleThatKnow";
// import { RenderRelationshipInfo } from "~/components/Rendered/RenderRelationshipInfo";
// import { RenderRelativesInfo } from "~/components/Rendered/RenderRelativesInfo";
// import { RenderForeignContacts } from "~/components/Rendered/RenderForeignContacts";
// import { RenderForeignActivities } from "~/components/Rendered/RenderForeignActivities";
// import { RenderMentalHealth } from "~/components/Rendered/RenderMentalHealth";
// import { RenderPolice } from "~/components/Rendered/RenderPolice";
// import { RenderDrugActivity } from "~/components/Rendered/RenderDrugActivity";
// import { RenderAlcoholUse } from "~/components/Rendered/RenderAlcoholUse";
// import { RenderInvestigationsInfo } from "~/components/Rendered/RenderInvestigationsInfo";
// import { RenderFinances } from "~/components/Rendered/RenderFinances";
// import { RenderTechnology } from "~/components/Rendered/RenderTechnology";
// import { RenderCivil } from "~/components/Rendered/RenderCivil";
// import { RenderAssociation } from "~/components/Rendered/RenderAssociation";
// import { RenderSignature } from "~/components/Rendered/RenderSignature";
// import { RenderPrintPDF } from "~/components/Rendered/RenderPrintPDF";
// import templates from "../state/contexts/updatedModel"
// import { useEmployee } from "~/state/contexts/new-context";
// import { type ApplicantFormValues } from "api/interfaces/formDefinition";
// import { type FormInfo } from "api/interfaces/FormInfo";

// const { set, get, cloneDeep, merge } = lodash;

// interface DynamicFormProps {
//   data: ApplicantFormValues;
//   onChange: (data: ApplicantFormValues) => void;
//   FormInfo: FormInfo;
// }

// const DynamicForm3: React.FC<DynamicFormProps> = ({
//   data,
//   onChange,
//   FormInfo,
// }) => {
//   const [formData, setFormData] = useState<ApplicantFormValues>(
//     cloneDeep(data)
//   );
//   const dispatch = useDispatch();
//   const currentStep = useTypedSelector(selectCurrentStep);

//   const { updateField } = useEmployee();

//   const formSections = Object.keys(formData);

//   const handleInputChange = (path: string, value: any) => {
//     // console.log("Before update:", { ...formData.employmentInfo });
//     const updatedFormData = set({ ...formData }, path, value);
//     // console.log("After update:", updatedFormData.employmentInfo);
//     setFormData(updatedFormData);
//     onChange(updatedFormData);
//     updateField(path, value);
//   };

//   const isValidValue = (path: string, value: any): boolean => {
//     // Reject undefined or null values
//     if (value === undefined || value === null) {
//       return false;
//     }

//     // Reject empty strings
//     if (typeof value === "string" && value.trim() === "") {
//       return false;
//     }

//     // Specific validation for employee_description to not exceed 255 characters
//     if (path.endsWith("employee_description") && value.length > 255) {
//       return false;
//     }

//     // Check for arrays being empty
//     if (Array.isArray(value) && value.length === 0) {
//       return false;
//     }

//     // Ensure objects are not empty (excluding arrays)
//     if (
//       typeof value === "object" &&
//       !Array.isArray(value) &&
//       Object.keys(value).length === 0
//     ) {
//       return false;
//     }

//     return true;
//   };

//   const handleAddEntry = (path: string, updatedItem: any) => {
//     const updatedFormData = cloneDeep(formData);
//     let currentData = get(updatedFormData, path);

//     console.log(`Path: ${path}`);
//     console.log(`Current Data before push: ${JSON.stringify(currentData)}`);
//     console.log(`Updated Item to be added: ${JSON.stringify(updatedItem)}`);

//     if (Array.isArray(updatedItem)) {
//       console.log("THIS IS AN ARRAY");

//       // Ensure updatedItem is not an array itself
//       const itemToPush = Array.isArray(updatedItem)
//         ? updatedItem[0]
//         : updatedItem;

//       console.log(`Item to be pushed: ${JSON.stringify(itemToPush)}`);

//       // Initialize currentData as an array if it is undefined
//       if (!Array.isArray(currentData)) {
//         currentData = [];
//       }

//       // Push the itemToPush into the currentData array
//       currentData.push(itemToPush);
//       set(updatedFormData, path, currentData);

//       console.log(`Current Data after push: ${JSON.stringify(currentData)}`);
//     } else {
//       // If currentData is an object or undefined, set or merge the updatedItem
//       const mergedData = merge(currentData || {}, updatedItem);
//       set(updatedFormData, path, mergedData);
//     }

//     setFormData(updatedFormData);
//     onChange(updatedFormData);
//     updateField(path, updatedItem);
//   };

//   const handleRemoveEntry = (path: string, index: number) => {
//     const updatedFormData = cloneDeep(formData);
//     const list = get(updatedFormData, path, []);

//     console.log(list, "LIST");
//     console.log(path, "path");

//     console.log(updatedFormData.foreignActivities.section20A1, "HELP");
//     if (list && Array.isArray(list)) {
//       list.splice(index, 1);
//       set(updatedFormData, path, list);
//       setFormData(updatedFormData);
//       updateField(path, list);
//       onChange(updatedFormData);
//     }
//   };

//   const getDefaultNewItem = (path: string): any => {


//     console.log(`Path: ${path}`);

//     const pathSegments = path.split(".");
//     const lastSegment = pathSegments.slice(-1)[0];
//     const isNestedPath = pathSegments.length > 1;

//     console.log(`Path segments: ${pathSegments}`);
//     console.log(`Last segment: ${lastSegment}`);
//     console.log(`Is nested path: ${isNestedPath}`);

//     const nestedTemplates = {
//       dualCitizenshipInfo: ["citizenships", "passports", "passportUses"],
//       residencyInfo: ["residenceAddress", "contact"],
//       contactInfo: ["contactNumbers"],
//       schoolInfo: ["degrees", "schoolEntry"],
//       employmentInfo: [
//         "section13A1",
//         "section13A2",
//         "section13A3",
//         "section13A4",
//         "section13A5",
//         "section13A6",
//         "additionalPeriods",
//         "section13B",
//         "section13C",
//         "employmentEntries",
//         "contacts",
//       ],
//       militaryHistoryInfo: ["section15_1", "section15_2", "section15_3"],
//       relationshipInfo: ["section17_1", "otherNames"],
//       relativesInfo: ["entries", "section18_1", "section18_2", "section18_3"],
//       foreignContacts: ["entries", "otherNames", "citizenships"],
//       foreignActivities: [
//         "section20A1",
//         "section20A2",
//         "section20A3",
//         "section20A4",
//         "section20A5",
//         "section20B1",
//         "section20B2",
//         "section20B3",
//         "section20B4",
//         "section20B5",
//         "section20B6",
//         "section20B7",
//         "section20B8",
//         "section20B9",
//         "section20C",
//         "coOwners",
//         "ownershipType",
//         "subsequentContacts",
//       ],
//       mentalHealth: [
//         "section21A",
//         "section21B",
//         "section21C",
//         "section21D",
//         "section21D1",
//         "section21E",
//       ],
//       policeRecord: [
//         "section22A",
//         "section22B",
//         "section22C",
//         "section22D",
//         "charges",
//       ],
//       drugActivity: [
//         "section23_1",
//         "section23_2",
//         "section23_3",
//         "section23_4",
//       ],
//       alcoholUse: ["section24_1", "section24_2", "section24_3", "section24_4"],
//       investigationsInfo: ["section25_1", "section25_2", "section25_3"],
//       finances: [
//         "section26_1",
//         "section26_2",
//         "section26_3",
//         "section26_4",
//         "section26_5",
//         "section26_6",
//         "section26_7",
//       ],
//       technology: ["section27_1", "section27_2", "section27_3"],
//       civil: ["section28_1"],
//       association: [
//         "section29_1",
//         "section29_2",
//         "section29_3",
//         "section29_4",
//         "section29_5",
//         "section29_6",
//         "section29_7",
//       ],
//     };

//     const findNestedTemplate = (pathSegments, templates) => {
//       let currentTemplate = templates;
//       console.log(`Initial template: ${JSON.stringify(currentTemplate)}`);
//       for (const segment of pathSegments) {
//         console.log(`Current segment: ${segment}`);
//         if (Array.isArray(currentTemplate)) {
//           console.log(`Current template is array, selecting first element.`);
//           currentTemplate = currentTemplate[0];
//         }
//         if (currentTemplate[segment]) {
//           console.log(`Found segment in template: ${segment}`);
//           currentTemplate = currentTemplate[segment];
//         } else {
//           console.log(`Segment not found, checking nested templates.`);
//           // Handle the case where the segment is part of nested templates
//           for (const [templateKey, nestedKeys] of Object.entries(
//             nestedTemplates
//           )) {
//             if (
//               pathSegments.includes(templateKey) &&
//               nestedKeys.includes(segment)
//             ) {
//               console.log(`Nested template key matched: ${templateKey}`);
//               currentTemplate = currentTemplate[templateKey];
//             }
//           }
//         }
//         console.log(`Updated template: ${JSON.stringify(currentTemplate)}`);
//       }
//       return cloneDeep(currentTemplate);
//     };

//     if (isNestedPath) {
//       const nestedTemplate = findNestedTemplate(pathSegments, templates);
//       if (nestedTemplate) {
//         console.log(`Nested template found: ${JSON.stringify(nestedTemplate)}`);
//         return nestedTemplate;
//       } else {
//         console.log(`No nested template found for path: ${path}`);
//       }
//     }

//     console.log(
//       isNestedPath,
//       lastSegment,
//       path,
//       templates[lastSegment as keyof typeof templates],
//       "LOG TESTING"
//     );

//     if (path === "employmentInfo") {
//       return {
//         _id: templates.employmentInfo._id,
//         employmentActivity: templates.employmentInfo.employmentActivity,
//       };
//     }

//     if (path.startsWith("citizenshipInfo.")) {
//       const citizenshipType = pathSegments[1];
//       console.log(`Citizenship type: ${citizenshipType}`);
//       const citizenshipTemplate = templates.citizenshipInfo[citizenshipType];
//       if (citizenshipTemplate) {
//         // console.log(
//         //   `Citizenship template found: ${JSON.stringify(citizenshipTemplate)}`
//         // );
//         return cloneDeep(citizenshipTemplate);
//       } else {
//         console.error(
//           `No template found for citizenship type: ${citizenshipType}`
//         );
//         return {};
//       }
//     }

//     const defaultItem = cloneDeep(templates[lastSegment]);
//     console.log(`Default item: ${JSON.stringify(defaultItem)}`);

//     if (Object.keys(defaultItem).length === 0) {
//       console.error(`No template found for path: ${path}`);
//     }

//     return defaultItem;
//   };

//   const isReadOnlyField = (key: string) => {
//     return key.endsWith("_id") || key === "createdAt" || key === "updatedAt";
//   };

//   const renderField = (key: string, value: any, path: string) => {
//     if (!value) return null;

//     const props = {
//       key: path,
//       data: value,
//       onInputChange: handleInputChange,
//       onAddEntry: handleAddEntry,
//       onRemoveEntry: handleRemoveEntry,
//       isValidValue: isValidValue,
//       getDefaultNewItem: getDefaultNewItem,
//       isReadOnlyField: isReadOnlyField,
//       path: path,
//       formInfo: FormInfo,
//     };

//     const employeeId = data.personalInfo.applicantID;

//     if (!employeeId) {
//       return null;
//     }

//     // console.log("Rendering field for key:", key, "with data:", value);

//     switch (key) {
//       case "personalInfo":
//         return <RenderBasicInfo {...props} />;
//       case "birthInfo":
//         return <RenderBirthInfo {...props} />;
//       case "namesInfo":
//         return <RenderNames {...props} />;
//       case "aknowledgementInfo":
//         return <RenderAcknowledgementInfo {...props} />;
//       case "physicalAttributes":
//         return <RenderPhysicalsInfo {...props} />;
//       case "contactInfo":
//         return <RenderContactInfo {...props} />;
//       case "passportInfo":
//         return <RenderPassportInfo {...props} />;
//       case "citizenshipInfo":
//         return <RenderCitizenshipInfo {...props} />;
//       case "dualCitizenshipInfo":
//         return <RenderDualCitizenshipInfo {...props} />;
//       case "residencyInfo":
//         return <RenderResidencyInfo {...props} />;
//       case "schoolInfo":
//         return <RenderSchoolInfo {...props} />;
//       case "employmentInfo":
//         return <RenderEmploymentInfo {...props} />;
//       case "serviceInfo":
//         return <RenderServiceInfo {...props} />;
//       case "militaryHistoryInfo":
//         return <RenderMilitaryInfo {...props} />;
//       case "peopleThatKnow":
//         return <RenderPeopleThatKnow {...props} />;
//       case "relationshipInfo":
//         return <RenderRelationshipInfo {...props} />;
//       case "relativesInfo":
//         return <RenderRelativesInfo {...props} />;
//       case "foreignContacts":
//         return <RenderForeignContacts {...props} />;
//       case "foreignActivities":
//         return <RenderForeignActivities {...props} />;
//       case "mentalHealth":
//         return <RenderMentalHealth {...props} />;
//       case "policeRecord":
//         return <RenderPolice {...props} />;
//       case "drugActivity":
//         return <RenderDrugActivity {...props} />;
//       case "alcoholUse":
//         return <RenderAlcoholUse {...props} />;
//       case "investigationsInfo":
//         return <RenderInvestigationsInfo {...props} />;
//       case "finances":
//         return <RenderFinances {...props} />;
//       case "technology":
//         return <RenderTechnology {...props} />;
//       case "civil":
//         return <RenderCivil {...props} />;
//       case "association":
//         return <RenderAssociation {...props} />;
//       case "signature":
//         return <RenderSignature {...props} />;
//       case "print":
//         return <RenderPrintPDF {...props} />;

//       default:
//         return (
//           <div key={path} className="text-gray-500 p-4">
//             No data available for this section
//           </div>
//         );
//     }
//   };

//   const handleStepChange = (step: number) => {
//     dispatch(goToStep(step));
//   };

//   return (
//     <>
//       {formData &&
//         formSections.length > currentStep &&
//         renderField(
//           formSections[currentStep],
//           formData[formSections[currentStep] as keyof typeof formData],
//           formSections[currentStep]
//         )}
//       <StepperFooter
//         onStepChange={handleStepChange}
//         totalSteps={formSections.length}
//       />
//     </>
//   );
// };

// export default DynamicForm3;
