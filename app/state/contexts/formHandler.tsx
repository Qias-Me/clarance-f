import React, { useState, useEffect } from "react";
import lodash from "lodash";
import {
  goToStep,
  selectCurrentStep,
  setTotalSteps,
} from "~/state/user/formSlice";
import StepperFooter from "~/components/form86/samples/stepperFooter";
import { useDispatch, useTypedSelector } from "~/state/hooks/index";

import { RenderBasicInfo } from "~/components/Rendered/RenderBasicInfo";
// import { RenderBirthInfo } from "~/components/Rendered/RenderBirthInfo";
import { RenderAcknowledgementInfo } from "~/components/Rendered/RenderAcknowledgementInfo";
// import { RenderNames } from "~/components/Rendered/RenderNames";
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
import { RenderSignature } from "~/components/Rendered/RenderSignature";
import { RenderPrintPDF } from "~/components/RenderPrintPDF";

import { useEmployee } from "~/state/contexts/new-context";
import type { ApplicantFormValues } from "api/interfaces/formDefinition";
// import type FormInfo from "api/interfaces/FormInfo";

// Import all section contexts
import { aknowledgementInfo } from "~/state/contexts/sections/aknowledgementInfo";
// import { namesInfo } from "~/state/contexts/sections/namesInfo";
// import { physicalAttributes } from "~/state/contexts/sections/physicalAttributes";
// import { birthInfo } from "~/state/contexts/sections/birthInfo";
import { personalInfo } from "~/state/contexts/sections/personalInfo";
import type { FormInfo } from "api/interfaces/FormInfo";
// import { passportInfo } from "~/state/contexts/sections/passportInfo";
// import { contactInfo } from "~/state/contexts/sections/contactInfo";
// import { print } from "~/state/contexts/sections/print";
// import { policeRecord } from "~/state/contexts/sections/policeRecord";
// import { relationshipInfo } from "~/state/contexts/sections/relationshipInfo";
// import { relativesInfo } from "~/state/contexts/sections/relativesInfo";
// import { residencyInfo } from "~/state/contexts/sections/residencyInfo";
// import { schoolInfo } from "~/state/contexts/sections/schoolInfo";
// import { serviceInfo } from "~/state/contexts/sections/serviceInfo";
// import { signature } from "~/state/contexts/sections/signature";
// import { technology } from "~/state/contexts/sections/technology";
// import { peopleThatKnow } from "~/state/contexts/sections/peopleThatKnow";
// import { militaryHistoryInfo } from "~/state/contexts/sections/militaryHistoryInfo";
// import { mentalHealth } from "~/state/contexts/sections/mentalHealth";
// import { investigationsInfo } from "~/state/contexts/sections/investigationsInfo";
// import { foreignContacts } from "~/state/contexts/sections/foreignContacts";
// import { foreignActivities } from "~/state/contexts/sections/foreignActivities";
// import { finances } from "~/state/contexts/sections/finances";
// import { employmentInfo } from "~/state/contexts/sections/employmentInfo";
// import { dualCitizenshipInfo } from "~/state/contexts/sections/dualCitizenshipInfo";
// import { drugActivity } from "~/state/contexts/sections/drugActivity";
// import { civil } from "~/state/contexts/sections/civil";
// import { citizenshipInfo } from "~/state/contexts/sections/citizenshipInfo";
// import { association } from "~/state/contexts/sections/association";
// import { alcoholUse } from "~/state/contexts/sections/alcoholUse";

const { set, get, cloneDeep, merge } = lodash;

interface DynamicFormProps {
  data: ApplicantFormValues;
  onChange: (data: ApplicantFormValues) => void;
  FormInfo: FormInfo;
}

// Define the ordered form sections for consistent step navigation
const ORDERED_FORM_SECTIONS = [
  "personalInfo", // Step 1
//   "birthInfo", // Step 2
  "aknowledgementInfo", // Step 3
//   "namesInfo", // Step 4
//   "physicalAttributes", // Step 5
//   "contactInfo", // Step 6
//   "passportInfo", // Step 7
//   "citizenshipInfo", // Step 8
//   "dualCitizenshipInfo", // Step 9
//   "residencyInfo", // Step 10
//   "schoolInfo", // Step 11
//   "employmentInfo", // Step 12
//   "serviceInfo", // Step 13
//   "militaryHistoryInfo", // Step 14
//   "peopleThatKnow", // Step 15
//   "relationshipInfo", // Step 16
//   "relativesInfo", // Step 17
//   "foreignContacts", // Step 18
//   "foreignActivities", // Step 19
//   "mentalHealth", // Step 20
//   "policeRecord", // Step 21
//   "drugActivity", // Step 22
//   "alcoholUse", // Step 23
//   "investigationsInfo", // Step 24
//   "finances", // Step 25
//   "technology", // Step 26
//   "civil", // Step 27
//   "association", // Step 28
  "signature", // Step 29
  "print", // Step 30
];

// Section context map for template data
const SECTION_CONTEXT_MAP = {
  aknowledgementInfo,
//   namesInfo,
//   physicalAttributes,
//   birthInfo,
  personalInfo,
//   passportInfo,
//   contactInfo,
//   print,
//   policeRecord,
//   relationshipInfo,
//   relativesInfo,
//   residencyInfo,
//   schoolInfo,
//   serviceInfo,
//   signature,
//   technology,
//   peopleThatKnow,
//   militaryHistoryInfo,
//   mentalHealth,
//   investigationsInfo,
//   foreignContacts,
//   foreignActivities,
//   finances,
//   employmentInfo,
//   dualCitizenshipInfo,
//   drugActivity,
//   civil,
//   citizenshipInfo,
//   association,
//   alcoholUse,
};

const DynamicForm3: React.FC<DynamicFormProps> = ({
  data,
  onChange,
  FormInfo,
}) => {
  const [formData, setFormData] = useState<ApplicantFormValues | null>(null);
  const [formSections, setFormSections] = useState<string[]>([]);
  const dispatch = useDispatch();
  const currentStep = useTypedSelector(selectCurrentStep) as number;

  const { updateField } = useEmployee();

  // Initialize form data and sections when data is available
  useEffect(() => {
    if (data) {
      setFormData(cloneDeep(data));

      // Filter the ordered sections to only include those that exist in the data
      const availableSections = ORDERED_FORM_SECTIONS.filter(
        (section) => section in data
      );

      setFormSections(availableSections);

      // Update the total steps in the Redux store
      dispatch(setTotalSteps(availableSections.length));

      // Set initial step to 0 if current step is out of range
      if (currentStep >= availableSections.length) {
        dispatch(goToStep(0));
      }
    }
  }, [data, dispatch, currentStep]);

  // If data is not yet loaded, show a loading indicator
  if (!formData) {
    return (
      <div className="animate-pulse flex space-x-4">Loading form data...</div>
    );
  }

  const handleInputChange = (path: string, value: any) => {
    if (!formData) return;

    const updatedFormData = set({ ...formData }, path, value);
    setFormData(updatedFormData);
    onChange(updatedFormData);
    updateField(path, value);
  };

  const isValidValue = (path: string, value: any): boolean => {
    // Reject undefined or null values
    if (value === undefined || value === null) {
      return false;
    }

    // Reject empty strings
    if (typeof value === "string" && value.trim() === "") {
      return false;
    }

    // Specific validation for employee_description to not exceed 255 characters
    if (path.endsWith("employee_description") && value.length > 255) {
      return false;
    }

    // Check for arrays being empty
    if (Array.isArray(value) && value.length === 0) {
      return false;
    }

    // Ensure objects are not empty (excluding arrays)
    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    ) {
      return false;
    }

    return true;
  };

  const handleAddEntry = (path: string, updatedItem: any) => {
    if (!formData) return;

    const updatedFormData = cloneDeep(formData);
    let currentData = get(updatedFormData, path);

    if (Array.isArray(updatedItem)) {
      // Ensure updatedItem is not an array itself
      const itemToPush = Array.isArray(updatedItem)
        ? updatedItem[0]
        : updatedItem;

      // Initialize currentData as an array if it is undefined
      if (!Array.isArray(currentData)) {
        currentData = [];
      }

      // Push the itemToPush into the currentData array
      currentData.push(itemToPush);
      set(updatedFormData, path, currentData);
    } else {
      // If currentData is an object or undefined, set or merge the updatedItem
      const mergedData = merge(currentData || {}, updatedItem);
      set(updatedFormData, path, mergedData);
    }

    console.log("updatedFormData", updatedFormData);
    console.log("path", path);
    console.log("updatedItem", updatedItem);
    console.log("currentData", currentData);
    console.log("path", path);

    setFormData(updatedFormData);
    onChange(updatedFormData);
    updateField(path, updatedItem);
  };

  const handleRemoveEntry = (path: string, index: number) => {
    if (!formData) return;

    const updatedFormData = cloneDeep(formData);
    const list = get(updatedFormData, path, []);

    if (list && Array.isArray(list)) {
      list.splice(index, 1);
      set(updatedFormData, path, list);
      setFormData(updatedFormData);
      updateField(path, list as any); // Type assertion to resolve TypeScript error
      onChange(updatedFormData);
    }
  };

  // Fix getDefaultNewItem to handle full paths and extract component names
  const getDefaultNewItem = (path: string): any => {
    // Extract the section name from the path
    // Handle both direct section names and full paths (e.g., "contactInfo.contactNumbers" or "contactInfo")
    const sectionPath = path.split('.');
    const sectionName = sectionPath[0];
    
    // If we have a context for this section, use it
    if (sectionName in SECTION_CONTEXT_MAP) {
      const contextData = SECTION_CONTEXT_MAP[sectionName as keyof typeof SECTION_CONTEXT_MAP] as Record<string, any>;
      
      // Special case handling for common patterns
      if (path.includes('.contactNumbers')) {
        // Return a default contact number entry if one exists in the context
        if (contextData.contactNumbers && Array.isArray(contextData.contactNumbers) && contextData.contactNumbers.length > 0) {
          const template = cloneDeep(contextData.contactNumbers[0]);
          if (template && typeof template === 'object') {
            // Ensure each new entry gets a unique ID
            template._id = Math.random();
          }
          return template;
        }
      }
      
      // For array items, extract just one item as template
      if (path.includes('.') || path.includes('[')) {
        // This is a nested path
        const pathParts = path.split('.');
        
        // Handle array items specifically
        if (pathParts.length === 1 && path.includes('[')) {
          // Direct array access in the root object
          const arrayName = path.split('[')[0];
          if (arrayName in contextData) {
            // Explicitly cast to any[] to avoid TypeScript errors
            const arrayData = contextData[arrayName] as any;
            if (Array.isArray(arrayData) && arrayData.length > 0) {
              // Clone the first item and assign a new ID
              const template = cloneDeep(arrayData[0]) as Record<string, any>;
              if (template && '_id' in template) {
                template._id = Math.random();
              }
              return template;
            }
          }
        } else {
          // Nested properties
          try {
            let current: Record<string, any> = contextData;
            let i = 0;
            
            // Navigate to the parent object or array
            while (i < pathParts.length - 1) {
              const part = pathParts[i];
              if (!current) return {};
              
              if (part.includes('[')) {
                const arrayName = part.split('[')[0];
                const arrayIndex = parseInt(part.split('[')[1].split(']')[0]);
                if (arrayName in current && Array.isArray(current[arrayName])) {
                  current = current[arrayName][arrayIndex] as Record<string, any>;
                } else {
                  return {}; // Invalid path
                }
              } else {
                if (part in current) {
                  current = current[part] as Record<string, any>;
                } else {
                  return {}; // Invalid path
                }
              }
              i++;
            }
            
            // Get the final property
            if (!current) return {};
            
            const finalPart = pathParts[pathParts.length - 1];
            if (finalPart.includes('[')) {
              const arrayName = finalPart.split('[')[0];
              if (arrayName in current && Array.isArray(current[arrayName]) && current[arrayName].length > 0) {
                const template = cloneDeep(current[arrayName][0]) as Record<string, any>;
                if ('_id' in template) {
                  template._id = Math.random();
                }
                return template;
              }
            } else {
              // Return the value of the final property
              if (finalPart in current) {
                const value = current[finalPart];
                // If it's an array, return a clone of the first item with a new ID
                if (Array.isArray(value) && value.length > 0) {
                  const template = cloneDeep(value[0]) as Record<string, any>;
                  if ('_id' in template) {
                    template._id = Math.random();
                  }
                  return template;
                }
                return cloneDeep(value);
              }
            }
          } catch (error) {
            console.error(`Error accessing path ${path} in context:`, error);
          }
        }
      } else {
        // Return the whole section context if it's a direct path
        return cloneDeep(contextData);
      }
    }
    
    // Fallback to empty object if no matching context
    return {};
  };

  const isReadOnlyField = (key: string) => {
    return key.endsWith("_id") || key === "createdAt" || key === "updatedAt";
  };

  const renderField = (key: string, value: any, path: string) => {
    if (!value || !formData) return null;

    const props = {
      data: value,
      onInputChange: handleInputChange,
      onAddEntry: handleAddEntry,
      onRemoveEntry: handleRemoveEntry,
      isValidValue: isValidValue,
      getDefaultNewItem: getDefaultNewItem,
      isReadOnlyField: isReadOnlyField,
      path: path,
      formInfo: FormInfo,
    };

    // Ensure applicantID exists
    const employeeId = formData.personalInfo?.applicantID;
    if (!employeeId) {
      return null;
    }

    switch (key) {
      case "personalInfo":
        return <RenderBasicInfo key={path} {...props} />;
    //   case "birthInfo":
    //     return <RenderBirthInfo key={path} {...props} />;
      case "aknowledgementInfo":
        return <RenderAcknowledgementInfo key={path} {...props} />;
    //   case "namesInfo":
    //     return <RenderNames key={path} {...props} />;
    //   case "physicalAttributes":
    //     return <RenderPhysicalsInfo key={path} {...props} />;
    //   case "contactInfo":
    //     return <RenderContactInfo key={path} {...props} />;
    //   case "passportInfo":
    //     return <RenderPassportInfo key={path} {...props} />;
    //   case "citizenshipInfo":
    //     return <RenderCitizenshipInfo key={path} {...props} />;
    //   case "dualCitizenshipInfo":
    //     return <RenderDualCitizenshipInfo key={path} {...props} />;
    //   case "residencyInfo":
    //     return <RenderResidencyInfo key={path} {...props} />;
    //   case "schoolInfo":
    //     return <RenderSchoolInfo key={path} {...props} />;
    //   case "employmentInfo":
    //     return <RenderEmploymentInfo key={path} {...props} />;
    //   case "serviceInfo":
    //     return <RenderServiceInfo key={path} {...props} />;
    //   case "militaryHistoryInfo":
    //     return <RenderMilitaryInfo key={path} {...props} />;
    //   case "peopleThatKnow":
    //     return <RenderPeopleThatKnow key={path} {...props} />;
    //   case "relationshipInfo":
    //     return <RenderRelationshipInfo key={path} {...props} />;
    //   case "relativesInfo":
    //     return <RenderRelativesInfo key={path} {...props} />;
    //   case "foreignContacts":
    //     return <RenderForeignContacts key={path} {...props} />;
    //   case "foreignActivities":
    //     return <RenderForeignActivities key={path} {...props} />;
    //   case "mentalHealth":
    //     return <RenderMentalHealth key={path} {...props} />;
    //   case "policeRecord":
    //     return <RenderPolice key={path} {...props} />;
    //   case "drugActivity":
    //     return <RenderDrugActivity key={path} {...props} />;
    //   case "alcoholUse":
    //     return <RenderAlcoholUse key={path} {...props} />;
    //   case "investigationsInfo":
    //     return <RenderInvestigationsInfo key={path} {...props} />;
    //   case "finances":
    //     return <RenderFinances key={path} {...props} />;
    //   case "technology":
    //     return <RenderTechnology key={path} {...props} />;
    //   case "civil":
    //     return <RenderCivil key={path} {...props} />;
    //   case "association":
    //     return <RenderAssociation key={path} {...props} />;
      case "signature":
        return <RenderSignature key={path} {...props} />;
      case "print":
        return <RenderPrintPDF key={path} {...props} />;
      default:
        return (
          <div key={path} className="text-gray-500 p-4">
            No data available for this section
          </div>
        );
    }
  };

  const handleStepChange = (step: number) => {
    dispatch(goToStep(step));
  };

  // Only render form when formData and currentStep are valid
  if (
    !formData ||
    formSections.length === 0 ||
    currentStep >= formSections.length
  ) {
    return (
      <div className="text-gray-500 p-4">Loading form or invalid step...</div>
    );
  }

  // For debugging - logs the current step and section
  console.log(
    `Rendering step ${currentStep} - Section: ${formSections[currentStep]}`
  );

  return (
    <>
      {renderField(
        formSections[currentStep],
        formData[formSections[currentStep] as keyof typeof formData],
        formSections[currentStep]
      )}
      <StepperFooter
        onStepChange={handleStepChange}
        totalSteps={formSections.length}
      />
    </>
  );
};

export default DynamicForm3;