import React, { useState, useEffect } from "react";
import lodash from "lodash";
import {
  goToStep,
  selectCurrentStep,
  setTotalSteps,
} from "../state/user/formSlice";
import StepperFooter from "../components/form86/samples/stepperFooter";
import { useDispatch, useTypedSelector } from "~/state/hooks/index";
import { stripIdSuffix, addIdSuffix } from "./fieldHierarchyParser";
import { FormEntryManager, transformFieldId } from "./forms/FormEntryManager";
import CitizenshipInfoWrapper from "~/components/citizenship/CitizenshipInfoWrapper";

// Re-export the ID suffix handling functions to make formHandler.tsx the source of truth
export { stripIdSuffix, addIdSuffix };
export { transformFieldId };

/**
 * Generates a field ID for a dynamic entry based on a base ID and entry index
 * 
 * @param baseId The base field ID from template/first entry
 * @param index The index of the entry (0-based)
 * @param sectionPath The path to the section (for validation)
 * @returns A new field ID for the specified entry index
 */
export const generateFieldId = (baseId: string, index: number, sectionPath?: string): string => {
  // Make sure we're working with the base ID format (without "0 R" suffix)
  const cleanId = stripIdSuffix(baseId);
  
  // If index is 0, return the original ID (first entry uses the template ID)
  if (index === 0) {
    return cleanId;
  }
  
  // Extract the section-specific pattern by analyzing the baseId
  
  // For section 5 (namesInfo), IDs follow a pattern:
  // Entry 1: 9500 (lastName), 9501 (firstName), 9502 (middleName)
  // Entry 2: 9486 (lastName), 9487 (firstName), 9488 (middleName)
  // There is a clear offset pattern between entries
  
  // Get section number from the section path if provided
  let sectionNumber: number | undefined;
  if (sectionPath) {
    // Extract section number from the path based on known mappings
    const sectionMap: Record<string, number> = {
      'namesInfo': 5,
      'residencyInfo': 11,
      'employmentInfo': 13, 
      'relativesInfo': 18,
      'foreignContacts': 19,
      'schoolInfo': 12,
      'contactInfo.contactNumbers': 7,
      'identificationInfo.numbers': 6
    };
    
    // Find the matching section path
    const sectionKey = Object.keys(sectionMap).find(key => sectionPath.includes(key));
    if (sectionKey) {
      sectionNumber = sectionMap[sectionKey];
    }
  }
  
  // Use section-specific ID generation logic when known
  if (sectionNumber) {
    return generateSectionSpecificId(cleanId, index, sectionNumber);
  }
  
  // Default fallback logic for unknown sections
  // Append the index to the original ID to ensure uniqueness
  return `${cleanId}_${index}`;
};

/**
 * Generates a field ID specific to a known section using its established pattern
 * 
 * @param baseId The base field ID from the first entry
 * @param index The index of the entry (0-based)
 * @param sectionNumber The section number
 * @returns A new field ID following the section's pattern
 */
export const generateSectionSpecificId = (baseId: string, index: number, sectionNumber: number): string => {
  // Convert ID to number for arithmetic operations
  const numericId = parseInt(baseId, 10);
  if (isNaN(numericId)) {
    console.warn(`Could not parse field ID as number: ${baseId}`);
    return `${baseId}_${index}`; // Fallback
  }
  
  // Default offset between entries (will be overridden for specific sections)
  let offset = -(14 * (index));
  
  // Section-specific ID generation patterns
  switch (sectionNumber) {
    case 5: // Name information
      // Offset between entries: -14 for each field ID
      // Entry 1: 9500, 9501, 9502, etc.
      // Entry 2: 9486, 9487, 9488, etc. (difference is -14)
      offset = -(14 * index);
      break;
      
    case 11: // Residence information
      // Implement specific offset for residency
      offset = -(12 * index);
      break;
      
    case 13: // Employment information
      // Implement specific offset for employment
      offset = -(10 * index);
      break;
      
    case 18: // Relatives information
      // Implement specific offset for relatives
      offset = -(16 * index);
      break;
      
    case 19: // Foreign contacts
      // Implement specific offset for foreign contacts
      offset = -(10 * index);
      break;
      
    default:
      // For other sections, use a default approach
      offset = -(10 * index);
  }
  
  // Apply the calculated offset to the base ID
  const newId = numericId + offset;
  
  // Ensure the new ID is positive
  if (newId <= 0) {
    console.warn(`Generated ID would be negative or zero: ${newId}`);
    return `${baseId}_${index}`; // Fallback
  }
  
  return newId.toString();
};

/**
 * Validates if a generated field ID is correct for the given section and field
 * 
 * @param generatedId The generated field ID
 * @param expectedPattern Pattern or expected ID for validation (optional)
 * @returns Whether the generated ID matches the expected pattern
 */
export const validateGeneratedFieldId = (generatedId: string, expectedPattern?: string | RegExp): boolean => {
  if (!expectedPattern) {
    // If no pattern is provided, just ensure the ID is non-empty
    return !!generatedId && generatedId.length > 0;
  }
  
  if (typeof expectedPattern === 'string') {
    return generatedId === expectedPattern;
  }
  
  // Check against RegExp pattern
  return expectedPattern.test(generatedId);
};

/**
 * Processes all fields in a form entry, generating new IDs where needed
 * This is useful when adding new dynamic entries to a form
 * 
 * @param entry The form entry object with field IDs to process
 * @param index The index of the entry
 * @param sectionPath The path to the section
 * @returns A clone of the entry with updated field IDs
 */
export const processEntryFieldIds = (entry: any, index: number, sectionPath: string): any => {
  if (!entry || typeof entry !== 'object') {
    return entry;
  }
  
  // Create a clone to avoid modifying the original
  const processedEntry = lodash.cloneDeep(entry);
  
  // Process the entry recursively
  const processObject = (obj: any, path: string) => {
    if (!obj || typeof obj !== 'object') return;
    
    // Process each property
    for (const key in obj) {
      const value = obj[key];
      const currentPath = path ? `${path}.${key}` : key;
      
      // Skip _id property as it's used for entry tracking
      if (key === '_id') continue;
      
      if (value && typeof value === 'object') {
        // Special case for field objects with 'id' and 'value' properties
        if ('id' in value && 'value' in value) {
          // This is a field object, update its ID
          const baseId = value.id;
          value.id = generateFieldId(baseId, index, sectionPath);
        } else {
          // Recursively process nested objects
          processObject(value, currentPath);
        }
      }
    }
  };
  
  processObject(processedEntry, '');
  return processedEntry;
};

import { RenderBasicInfo } from "../components/Rendered/RenderBasicInfo";
import { RenderBirthInfo } from "../components/Rendered/RenderBirthInfo";
import { RenderAcknowledgementInfo } from "../components/Rendered/RenderAcknowledgementInfo";
import { RenderNames } from "../components/Rendered/RenderNames";
import { RenderPhysicalsInfo } from "~/components/Rendered/RenderPhysicals";
import { RenderContactInfo } from "~/components/Rendered/RenderContactInfo";
import { RenderPassportInfo } from "~/components/Rendered/RenderPassportInfo";
import { RenderCitizenshipInfo } from "~/components/Rendered/RenderCitizenshipInfo";
import { RenderDualCitizenshipInfo } from "~/components/Rendered/RenderDualCitizenship";
import { RenderResidencyInfo } from "~/components/Rendered/RenderResidencyInfo";
import { RenderSchoolInfo } from "~/components/Rendered/RenderSchoolInfo";
import { RenderEmploymentInfo } from "~/components/Rendered/RenderEmployementInfo";
import { RenderServiceInfo } from "~/components/Rendered/RenderServiceInfo";
import { RenderMilitaryInfo } from "~/components/Rendered/RenderMilitaryInfo";
import { RenderPeopleThatKnow } from "~/components/Rendered/RenderPeopleThatKnow";
import { RenderRelationshipInfo } from "~/components/Rendered/RenderRelationshipInfo";
import { RenderRelativesInfo } from "~/components/Rendered/RenderRelativesInfo";
import { RenderForeignContacts } from "~/components/Rendered/RenderForeignContacts";
import { RenderForeignActivities } from "~/components/Rendered/RenderForeignActivities";
import { RenderMentalHealth } from "~/components/Rendered/RenderMentalHealth";
import { RenderPolice } from "~/components/Rendered/RenderPolice";
import { RenderDrugActivity } from "~/components/Rendered/RenderDrugActivity";
import { RenderAlcoholUse } from "~/components/Rendered/RenderAlcoholUse";
import { RenderInvestigationsInfo } from "~/components/Rendered/RenderInvestigationsInfo";
import { RenderFinances } from "~/components/Rendered/RenderFinances";
import { RenderTechnology } from "~/components/Rendered/RenderTechnology";
import { RenderCivil } from "~/components/Rendered/RenderCivil";
import { RenderAssociation } from "~/components/Rendered/RenderAssociation";
import { RenderSignature } from "~/components/Rendered/RenderSignature";
import { RenderPrintPDF } from "~/components/RenderPrintPDF";

import { useEmployee } from "~/state/contexts/new-context";
import { type ApplicantFormValues } from "api/interfaces/formDefinition";
import type { FormInfo } from "api/interfaces/FormInfo";

// Import all section contexts
import { aknowledgementInfo } from "~/state/contexts/sections/aknowledgementInfo";
import { namesInfo } from "~/state/contexts/sections/namesInfo";
import { physicalAttributes } from "~/state/contexts/sections/physicalAttributes";
import { birthInfo } from "~/state/contexts/sections/birthInfo";
import { personalInfo } from "~/state/contexts/sections/personalInfo";
import { passportInfo } from "~/state/contexts/sections/passportInfo";
import { contactInfo } from "~/state/contexts/sections/contactInfo";
import { print } from "~/state/contexts/sections/print";
import { policeRecord } from "~/state/contexts/sections/policeRecord";
import { relationshipInfo } from "~/state/contexts/sections/relationshipInfo";
import { relativesInfo } from "~/state/contexts/sections/relativesInfo";
import { residencyInfo } from "~/state/contexts/sections/residencyInfo";
import { schoolInfo } from "~/state/contexts/sections/schoolInfo";
import { serviceInfo } from "~/state/contexts/sections/serviceInfo";
import { signature } from "~/state/contexts/sections/signature";
import { technology } from "~/state/contexts/sections/technology";
import { peopleThatKnow } from "~/state/contexts/sections/peopleThatKnow";
import { militaryHistoryInfo } from "~/state/contexts/sections/militaryHistoryInfo";
import { mentalHealth } from "~/state/contexts/sections/mentalHealth";
import { investigationsInfo } from "~/state/contexts/sections/investigationsInfo";
import { foreignContacts } from "~/state/contexts/sections/foreignContacts";
import { foreignActivities } from "~/state/contexts/sections/foreignActivities";
import { finances } from "~/state/contexts/sections/finances";
import { employmentInfo } from "~/state/contexts/sections/employmentInfo";
import { dualCitizenshipInfo } from "~/state/contexts/sections/dualCitizenshipInfo";
import { drugActivity } from "~/state/contexts/sections/drugActivity";
import { civil } from "~/state/contexts/sections/civil";
import { citizenshipInfo } from "~/state/contexts/sections/citizenshipInfo";
import { association } from "~/state/contexts/sections/association";
import { alcoholUse } from "~/state/contexts/sections/alcoholUse";

const { set, get, cloneDeep, merge } = lodash;

interface DynamicFormProps {
  data: ApplicantFormValues;
  onChange: (data: ApplicantFormValues) => void;
  FormInfo: FormInfo;
}

// Define the ordered form sections for consistent step navigation
const ORDERED_FORM_SECTIONS = [
  "personalInfo", // Step 1
  "birthInfo", // Step 2
  "aknowledgementInfo", // Step 3
  "namesInfo", // Step 4
  "physicalAttributes", // Step 5
  "contactInfo", // Step 6
  "passportInfo", // Step 7
  "citizenshipInfo", // Step 8
  "dualCitizenshipInfo", // Step 9
  "residencyInfo", // Step 10
  "schoolInfo", // Step 11
  "employmentInfo", // Step 12
  "serviceInfo", // Step 13
  "militaryHistoryInfo", // Step 14
  "peopleThatKnow", // Step 15
  "relationshipInfo", // Step 16
  "relativesInfo", // Step 17
  "foreignContacts", // Step 18
  "foreignActivities", // Step 19
  "mentalHealth", // Step 20
  "policeRecord", // Step 21
  "drugActivity", // Step 22
  "alcoholUse", // Step 23
  "investigationsInfo", // Step 24
  "finances", // Step 25
  "technology", // Step 26
  "civil", // Step 27
  "association", // Step 28
  "signature", // Step 29
  "print", // Step 30
];

// Section context map for template data
const SECTION_CONTEXT_MAP = {
  aknowledgementInfo,
  namesInfo,
  physicalAttributes,
  birthInfo,
  personalInfo,
  passportInfo,
  contactInfo,
  print,
  policeRecord,
  relationshipInfo,
  relativesInfo,
  residencyInfo,
  schoolInfo,
  serviceInfo,
  signature,
  technology,
  peopleThatKnow,
  militaryHistoryInfo,
  mentalHealth,
  investigationsInfo,
  foreignContacts,
  foreignActivities,
  finances,
  employmentInfo,
  dualCitizenshipInfo,
  drugActivity,
  civil,
  citizenshipInfo,
  association,
  alcoholUse,
};

const DynamicForm3: React.FC<DynamicFormProps> = ({
  data,
  onChange,
  FormInfo,
}) => {
  const [formData, setFormData] = useState<ApplicantFormValues | null>(null);
  const [formSections, setFormSections] = useState<string[]>([]);
  const dispatch = useDispatch();
  const currentStep = useTypedSelector(selectCurrentStep);

  const { updateField } = useEmployee();

  // Initialize form data and sections when data is available
  useEffect(() => {
    if (data) {
      const clonedData = cloneDeep(data) as any; // Use 'any' type to avoid TypeScript errors during manipulation
      
      // Ensure employmentInfo is always an array
      if (clonedData.employmentInfo) {
        if (!Array.isArray(clonedData.employmentInfo)) {
          console.warn("employmentInfo is not an array, converting to array...");
          clonedData.employmentInfo = [clonedData.employmentInfo];
        }
      } else {
        console.warn("employmentInfo is missing, initializing as empty array...");
        clonedData.employmentInfo = [];
      }
      
      // Now convert back to the correct type
      setFormData(clonedData as ApplicantFormValues);

      // Filter the ordered sections to only include those that exist in the data
      const availableSections = ORDERED_FORM_SECTIONS.filter(
        (section) => section in clonedData
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

    // Ensure any field IDs in the value are in the proper context format (without "0 R" suffix)
    const processedValue = typeof value === 'object' && value !== null 
      ? processFormFieldIds(value, false) 
      : value;

    const updatedFormData = set({ ...formData }, path, processedValue);
    setFormData(updatedFormData);
    onChange(updatedFormData);
    updateField(path, processedValue);
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

    // Get the context data map for templates
    const sectionName = path.split('.')[0];
    const contextData = SECTION_CONTEXT_MAP[sectionName as keyof typeof SECTION_CONTEXT_MAP] || {};
    
    // Use FormEntryManager's enhanced functions for adding entries
    const dataMapper = FormEntryManager.createDataMapper(
      formData,
      contextData,
      (fieldPath, value) => {
        // If this is a dynamic entry being added, process its field IDs
        if (fieldPath === path && Array.isArray(value)) {
          // Process each entry to ensure it has the correct field IDs for its position
          const processedEntries = value.map((entry, idx) => 
            processEntryFieldIds(entry, idx, path)
          );
          handleInputChange(fieldPath, processedEntries);
        } else {
          // Standard update without dynamic ID processing
          handleInputChange(fieldPath, value);
        }
      }
    );
    
    // Try the enhanced addEntry function first
    const success = dataMapper.addEntry(path, updatedItem);
    
    // If the enhanced function fails or isn't applicable, fall back to the original implementation
    if (!success) {
      const updatedFormData = cloneDeep(formData);
      let currentData = get(updatedFormData, path);

      if (updatedItem) {
        // Process the updatedItem to generate correct field IDs based on its position
        let itemToAdd = updatedItem;
        
        // Initialize currentData as an array if it is undefined
        if (!Array.isArray(currentData)) {
          currentData = [];
        }
        
        // Generate appropriate field IDs for the new item based on its position
        const index = currentData.length;
        if (Array.isArray(itemToAdd)) {
          // Process each item in the array
          itemToAdd = itemToAdd.map((item, idx) => 
            processEntryFieldIds(item, index + idx, path)
          );
        } else {
          // Process a single item
          itemToAdd = processEntryFieldIds(itemToAdd, index, path);
        }

        if (Array.isArray(itemToAdd)) {
          // Add all items if itemToAdd is an array
          currentData = [...currentData, ...itemToAdd];
        } else {
          // Add the single item
          currentData.push(itemToAdd);
        }
        
        set(updatedFormData, path, currentData);
      } else {
        // If no item is provided and we have template data, create a new item from template
        if (!Array.isArray(currentData)) {
          currentData = [];
        }
        
        const templateEntry = get(contextData, path.split('.').slice(1).join('.') || '', {});
        if (Object.keys(templateEntry).length > 0) {
          // Process the template entry to generate correct field IDs
          const newEntry = processEntryFieldIds(templateEntry, currentData.length, path);
          currentData.push(newEntry);
          set(updatedFormData, path, currentData);
        } else {
          // If no template found, merge with empty object
          const mergedData = merge(currentData || {}, {});
          set(updatedFormData, path, mergedData);
        }
      }

      setFormData(updatedFormData);
      onChange(updatedFormData);
      updateField(path, get(updatedFormData, path));
    }
  };

  const handleRemoveEntry = (path: string, index: number) => {
    if (!formData) return;

    // Get the context data map for templates
    const sectionName = path.split('.')[0];
    const contextData = SECTION_CONTEXT_MAP[sectionName as keyof typeof SECTION_CONTEXT_MAP] || {};
    
    // Use FormEntryManager's enhanced functions for removing entries
    const dataMapper = FormEntryManager.createDataMapper(
      formData,
      contextData,
      (fieldPath, value) => {
        // If this is a dynamic entry array being modified, process field IDs of remaining entries
        if (fieldPath === path && Array.isArray(value)) {
          // Regenerate IDs for remaining entries to ensure consistent ID sequence
          const processedEntries = value.map((entry, idx) => 
            processEntryFieldIds(entry, idx, path)
          );
          handleInputChange(fieldPath, processedEntries);
        } else {
          // Standard update without dynamic ID processing
          handleInputChange(fieldPath, value);
        }
      }
    );
    
    // Try the enhanced removeEntry function first
    const success = dataMapper.removeEntry(path, index);
    
    // If the enhanced function fails or isn't applicable, fall back to the original implementation
    if (!success) {
      const updatedFormData = cloneDeep(formData);
      const list = get(updatedFormData, path, []);

      if (list && Array.isArray(list)) {
        // Remove the entry at specified index
        list.splice(index, 1);
        
        // Regenerate IDs for all remaining entries to maintain proper sequence
        const processedList = list.map((entry, idx) => 
          processEntryFieldIds(entry, idx, path)
        );
        
        set(updatedFormData, path, processedList);
        setFormData(updatedFormData);
        updateField(path, processedList as any); // Type assertion to resolve TypeScript error
        onChange(updatedFormData);
      }
    }
  };

  // Fix getDefaultNewItem to handle full paths and extract component names
  const getDefaultNewItem = (path: string): any => {
    // Extract the section name from the path
    // Handle both direct section names and full paths (e.g., "contactInfo.contactNumbers" or "contactInfo")
    const sectionPath = path.split('.');
    const sectionName = sectionPath[0];
    
    // Special handling for employmentInfo with a proper default structure
    if (sectionName === "employmentInfo") {
      // If it's the root employmentInfo object, create a proper default structure
      if (path === "employmentInfo") {
        return {
          _id: Math.floor(Math.random() * 10000),
          section13A: [
            {
              _id: Math.floor(Math.random() * 10000),
              employmentActivity: {
                value: "",
                id: "10230",
                type: "PDFDropDown",
                label: "Employment Activity"
              }
            }
          ],
          section13B: {
            hasFormerFederalEmployment: {
              value: "NO (If NO, proceed to Section 13C)",
              id: "17090",
              type: "PDFRadioGroup",
              label: "Has Former Federal Employment"
            },
            employmentEntries: []
          },
          section13C: {
            employmentRecordIssues: {
              value: "NO (If NO, proceed to Section 14)",
              id: "17092",
              type: "PDFRadioGroup",
              label: "Employment Record Issues" 
            },
            employmentRecord: {
              fired: { value: "No", id: "10242", type: "PDFCheckBox", label: "Fired" },
              quitAfterToldWouldBeFired: { value: "No", id: "10243", type: "PDFCheckBox", label: "Quit After Told Would Be Fired" },
              leftByMutualAgreementMisconduct: { value: "No", id: "10244", type: "PDFCheckBox", label: "Left By Mutual Agreement Misconduct" },
              leftByMutualAgreementPerformance: { value: "No", id: "10245", type: "PDFCheckBox", label: "Left By Mutual Agreement Performance" },
              writtenWarning: { value: "No", id: "10246", type: "PDFCheckBox", label: "Written Warning" }
            }
          }
        };
      } else if (path === "employmentInfo.section13A.section13A2") {
        // Create a default Section13A2 structure
        return {
          fromDate: {
            date: { value: "", id: "10236", type: "PDFTextField", label: "From Date" },
            estimated: { value: "No", id: "10235", type: "PDFCheckBox", label: "Estimated" }
          },
          toDate: {
            date: { value: "", id: "10233", type: "PDFTextField", label: "To Date" },
            estimated: { value: "No", id: "10239", type: "PDFCheckBox", label: "Estimated" },
            present: { value: "No", id: "10234", type: "PDFCheckBox", label: "Present" }
          },
          employmentStatus: {
            fullTime: { value: "No", id: "10238", type: "PDFCheckBox", label: "Full Time" },
            partTime: { value: "No", id: "10237", type: "PDFCheckBox", label: "Part Time" }
          },
          positionTitle: { value: "", id: "10232", type: "PDFTextField", label: "Position Title" },
          employerName: { value: "", id: "10231", type: "PDFTextField", label: "Employer Name" },
          employerAddress: {
            street: { value: "", id: "10253", type: "PDFTextField", label: "Street" },
            city: { value: "", id: "10252", type: "PDFTextField", label: "City" },
            state: { value: "", id: "10251", type: "PDFDropdown", label: "State" },
            zipCode: { value: "", id: "10249", type: "PDFTextField", label: "Zip Code" },
            country: { value: "", id: "10250", type: "PDFDropdown", label: "Country" }
          },
          telephone: {
            number: { value: "", id: "10247", type: "PDFTextField", label: "Phone Number" },
            extension: { value: "", id: "10246", type: "PDFTextField", label: "Extension" },
            internationalOrDsn: { value: "No", id: "10245", type: "PDFCheckBox", label: "International/DSN" },
            day: { value: "No", id: "10244", type: "PDFCheckBox", label: "Day" },
            night: { value: "No", id: "10243", type: "PDFCheckBox", label: "Night" }
          },
          periodsNotApplicable: { value: "No", id: "0", type: "PDFCheckBox", label: "Periods Not Applicable" },
          additionalPeriods: [],
          physicalWorkAddress: {
            differentThanEmployer: { value: "NO (If NO, proceed to (b))", id: "17168", type: "PDFRadioGroup", label: "Different Than Employer" },
            aLocation: {
              street: { value: "", id: "10220", type: "PDFTextField", label: "Street" },
              city: { value: "", id: "10265", type: "PDFTextField", label: "City" },
              state: { value: "", id: "10264", type: "PDFDropdown", label: "State" },
              zipCode: { value: "", id: "10212", type: "PDFTextField", label: "Zip Code" },
              country: { value: "", id: "10263", type: "PDFDropdown", label: "Country" }
            },
            hasApoFpoAddress: { value: "NO", id: "0", type: "PDFRadioGroup", label: "Has APO/FPO Address" },
            telephone: {
              number: { value: "", id: "10268", type: "PDFTextField", label: "Phone Number" },
              extension: { value: "", id: "10267", type: "PDFTextField", label: "Extension" },
              internationalOrDsn: { value: "No", id: "10256", type: "PDFCheckBox", label: "International/DSN" },
              day: { value: "No", id: "10255", type: "PDFCheckBox", label: "Day" },
              night: { value: "No", id: "10254", type: "PDFCheckBox", label: "Night" }
            }
          },
          supervisor: {
            name: { value: "", id: "10270", type: "PDFTextField", label: "Name" },
            rankOrPosition: { value: "", id: "10269", type: "PDFTextField", label: "Rank/Position" },
            email: { value: "", id: "10242", type: "PDFTextField", label: "Email" },
            emailUnknown: { value: "No", id: "10241", type: "PDFCheckBox", label: "Email Unknown" },
            phone: {
              number: { value: "", id: "10268", type: "PDFTextField", label: "Phone Number" },
              extension: { value: "", id: "10267", type: "PDFTextField", label: "Extension" },
              internationalOrDsn: { value: "No", id: "10256", type: "PDFCheckBox", label: "International/DSN" },
              day: { value: "No", id: "10255", type: "PDFCheckBox", label: "Day" },
              night: { value: "No", id: "10254", type: "PDFCheckBox", label: "Night" }
            },
            hasAPOFPOAddress: { value: "NO", id: "0", type: "PDFRadioGroup", label: "Has APO/FPO Address" },
            physicalWorkLocation: {
              street: { value: "", id: "10220", type: "PDFTextField", label: "Street" },
              city: { value: "", id: "10265", type: "PDFTextField", label: "City" },
              state: { value: "", id: "10264", type: "PDFDropdown", label: "State" },
              zipCode: { value: "", id: "10212", type: "PDFTextField", label: "Zip Code" },
              country: { value: "", id: "10263", type: "PDFDropdown", label: "Country" }
            }
          }
        };
      } else if (path === "employmentInfo.section13A2.additionalPeriods") {
        // Create a default AdditionalPeriod structure
        return {
          _id: Math.floor(Math.random() * 10000),
          fromDate: {
            date: { value: "", id: "0", type: "PDFTextField", label: "From Date" },
            estimated: { value: "No", id: "0", type: "PDFCheckBox", label: "Estimated" }
          },
          toDate: {
            date: { value: "", id: "0", type: "PDFTextField", label: "To Date" },
            estimated: { value: "No", id: "0", type: "PDFCheckBox", label: "Estimated" }
          },
          positionTitle: { value: "", id: "0", type: "PDFTextField", label: "Position Title" },
          supervisor: { value: "", id: "0", type: "PDFTextField", label: "Supervisor" }
        };
      }
    }
    
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
      case "birthInfo":
        return <RenderBirthInfo key={path} {...props} />;
      case "aknowledgementInfo":
        return <RenderAcknowledgementInfo key={path} {...props} />;
      case "namesInfo":
        return <RenderNames key={path} {...props} />;
      case "physicalAttributes":
        return <RenderPhysicalsInfo key={path} {...props} />;
      case "contactInfo":
        return <RenderContactInfo key={path} {...props} />;
      case "passportInfo":
        return <RenderPassportInfo key={path} {...props} />;
      case "citizenshipInfo":
        // Using the wrapped context provider instead of direct rendering
        // This allows the component to use the CitizenshipInfo context
        return <CitizenshipInfoWrapper key={path} />;
      case "dualCitizenshipInfo":
        return <RenderDualCitizenshipInfo key={path} {...props} />;
      case "residencyInfo":
        return <RenderResidencyInfo key={path} {...props} />;
      case "schoolInfo":
        return <RenderSchoolInfo key={path} {...props} />;
      case "employmentInfo":
        return <RenderEmploymentInfo key={path} {...props} />;
      case "serviceInfo":
        return <RenderServiceInfo key={path} {...props} />;
      case "militaryHistoryInfo":
        return <RenderMilitaryInfo key={path} {...props} />;
      case "peopleThatKnow":
        return <RenderPeopleThatKnow key={path} {...props} />;
      case "relationshipInfo":
        return <RenderRelationshipInfo key={path} {...props} />;
      case "relativesInfo":
        return <RenderRelativesInfo key={path} {...props} />;
      case "foreignContacts":
        return <RenderForeignContacts key={path} {...props} />;
      case "foreignActivities":
        return <RenderForeignActivities key={path} {...props} />;
      case "mentalHealth":
        return <RenderMentalHealth key={path} {...props} />;
      case "policeRecord":
        return <RenderPolice key={path} {...props} />;
      case "drugActivity":
        return <RenderDrugActivity key={path} {...props} />;
      case "alcoholUse":
        return <RenderAlcoholUse key={path} {...props} />;
      case "investigationsInfo":
        return <RenderInvestigationsInfo key={path} {...props} />;
      case "finances":
        return <RenderFinances key={path} {...props} />;
      case "technology":
        return <RenderTechnology key={path} {...props} />;
      case "civil":
        return <RenderCivil key={path} {...props} />;
      case "association":
        return <RenderAssociation key={path} {...props} />;
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

/**
 * Helper functions for processing field IDs in form data
 */

/**
 * Update a field ID to ensure it has the correct format
 * 
 * @param id The field ID to format
 * @param format The target format ('pdf' or 'context')
 * @returns The formatted field ID
 */
export const updateIdFormat = (id: string, format: 'pdf' | 'context' = 'pdf'): string => {
  if (!id) return id;
  
  // For PDF format, ensure the ID has the "0 R" suffix
  if (format === 'pdf') {
    return transformFieldId.toPdfFormat(id);
  }
  
  // For context format, ensure the ID does not have the "0 R" suffix
  return transformFieldId.toContextFormat(id);
};

/**
 * Process a form value to ensure all field IDs have the correct suffix format
 * 
 * @param formValue The form value object to process
 * @param addSuffix Whether to add or remove the "0 R" suffix
 * @returns The processed form value with correct ID formats
 */
export const processFormFieldIds = (formValue: any, addSuffix: boolean = true): any => {
  if (!formValue) return formValue;
  
  // Handle array values
  if (Array.isArray(formValue)) {
    return formValue.map(item => processFormFieldIds(item, addSuffix));
  }
  
  // Handle object values recursively
  if (typeof formValue === 'object' && formValue !== null) {
    const processed = { ...formValue };
    
    // Process the 'id' field if it exists
    if ('id' in processed && typeof processed.id === 'string') {
      processed.id = addSuffix 
        ? transformFieldId.toPdfFormat(processed.id)
        : transformFieldId.toContextFormat(processed.id);
    }
    
    // Process all other object properties recursively
    for (const key in processed) {
      if (Object.prototype.hasOwnProperty.call(processed, key) && key !== 'id') {
        processed[key] = processFormFieldIds(processed[key], addSuffix);
      }
    }
    
    return processed;
  }
  
  // Return primitive values unchanged
  return formValue;
};

/**
 * Verify that all field IDs in a form have the correct format
 * 
 * @param formData The form data to verify
 * @param expectedFormat The expected format ('pdf' or 'context')
 * @returns Object containing verification result and any invalid IDs found
 */
export const verifyFieldIdFormat = (formData: any, expectedFormat: 'pdf' | 'context'): {
  isValid: boolean;
  invalidIds: Array<{ path: string; id: string }>;
} => {
  const invalidIds: Array<{ path: string; id: string }> = [];
  
  // Recursive function to check all IDs in the form data
  const checkIds = (data: any, currentPath: string = ''): void => {
    if (!data || typeof data !== 'object') return;
    
    if (Array.isArray(data)) {
      // Process array elements
      data.forEach((item, index) => {
        checkIds(item, currentPath ? `${currentPath}[${index}]` : `[${index}]`);
      });
    } else {
      // Process object properties
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key];
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          
          // Check if this is an ID field
          if (key === 'id' && typeof value === 'string') {
            if (!transformFieldId.isValidFormat(value, expectedFormat)) {
              invalidIds.push({ path: newPath, id: value });
            }
          }
          
          // Continue checking child objects/arrays
          checkIds(value, newPath);
        }
      }
    }
  };
  
  // Start the recursive check
  checkIds(formData);
  
  return {
    isValid: invalidIds.length === 0,
    invalidIds
  };
};

/**
 * Prepare form data for PDF submission by ensuring all field IDs have the "0 R" suffix
 * 
 * @param formData The complete form data object
 * @returns Form data with all field IDs in PDF format
 */
export const prepareFormForSubmission = (formData: ApplicantFormValues): ApplicantFormValues => {
  const processedData = processFormFieldIds(formData, true) as ApplicantFormValues;
  
  // Verify all IDs are in PDF format
  const verification = verifyFieldIdFormat(processedData, 'pdf');
  
  if (!verification.isValid) {
    console.warn('Some field IDs are not in the correct format for submission:', verification.invalidIds);
  }
  
  return processedData;
};

/**
 * Prepare form data for storage in context by removing all "0 R" suffixes from field IDs
 * 
 * @param formData The complete form data object
 * @returns Form data with all field IDs in context format
 */
export const prepareFormForStorage = (formData: ApplicantFormValues): ApplicantFormValues => {
  const processedData = processFormFieldIds(formData, false) as ApplicantFormValues;
  
  // Verify all IDs are in context format
  const verification = verifyFieldIdFormat(processedData, 'context');
  
  if (!verification.isValid) {
    console.warn('Some field IDs are not in the correct format for storage:', verification.invalidIds);
  }
  
  return processedData;
};

/**
 * Validates that all dynamic entry field IDs follow the correct pattern for their respective sections
 * 
 * @param formData The form data to validate
 * @returns Object containing validation results
 */
export const validateDynamicFieldIds = (formData: any): {
  isValid: boolean;
  issues: Array<{ path: string; id: string; expectedPattern: string; }>;
} => {
  const issues: Array<{ path: string; id: string; expectedPattern: string; }> = [];
  
  // Map of section paths to their expected ID patterns
  const sectionPatterns: Record<string, string> = {
    'namesInfo': 'First entry: 9500-9502, Second: 9486-9488 (-14 offset)',
    'residencyInfo': 'First entry: 8500-8505, Second: 8488-8493 (-12 offset)',
    'employmentInfo': 'First entry: 7500-7510, Second: 7490-7500 (-10 offset)',
    'relativesInfo': 'First entry: 6500-6510, Second: 6484-6494 (-16 offset)',
    'foreignContacts': 'First entry: 5500-5510, Second: 5485-5495 (-15 offset)'
  };
  
  // Recursively check dynamic entry arrays
  const checkDynamicEntries = (data: any, path: string = ''): void => {
    if (!data || typeof data !== 'object') return;
    
    if (Array.isArray(data)) {
      // Check if this is a dynamic entry array
      const parentPath = path.split('.').slice(0, -1).join('.');
      const isKnownSection = Object.keys(sectionPatterns).some(section => 
        parentPath === section || parentPath.startsWith(`${section}.`)
      );
      
      if (isKnownSection && data.length > 1) {
        // This is a dynamic entry array, validate entries follow pattern
        for (let i = 1; i < data.length; i++) {
          // For each entry beyond the first, validate ID pattern
          const entry = data[i];
          const prevEntry = data[i-1];
          
          // Find all fields with IDs in both entries
          const processFields = (entryObj: any, prevObj: any, fieldPath: string = '') => {
            if (!entryObj || typeof entryObj !== 'object' || !prevObj || typeof prevObj !== 'object') return;
            
            for (const key in entryObj) {
              if (Object.prototype.hasOwnProperty.call(entryObj, key)) {
                const value = entryObj[key];
                const prevValue = prevObj[key];
                const newPath = fieldPath ? `${fieldPath}.${key}` : key;
                
                if (key === 'id' && typeof value === 'string' && typeof prevValue === 'string') {
                  // This is a field ID - validate pattern
                  const sectionKey = Object.keys(sectionPatterns).find(section => 
                    parentPath === section || parentPath.startsWith(`${section}.`)
                  );
                  
                  if (sectionKey) {
                    const expectedId = generateFieldId(prevValue, 1, sectionKey);
                    if (value !== expectedId) {
                      issues.push({
                        path: `${path}[${i}].${fieldPath}`,
                        id: value,
                        expectedPattern: sectionPatterns[sectionKey]
                      });
                    }
                  }
                } else if (typeof value === 'object' && typeof prevValue === 'object') {
                  // Recursive check for nested objects
                  processFields(value, prevValue, newPath);
                }
              }
            }
          };
          
          processFields(entry, prevEntry);
        }
      }
      
      // Process array elements recursively
      data.forEach((item, index) => {
        checkDynamicEntries(item, path ? `${path}[${index}]` : `[${index}]`);
      });
    } else {
      // Process object properties recursively
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key];
          const newPath = path ? `${path}.${key}` : key;
          
          // Continue recursive check
          checkDynamicEntries(value, newPath);
        }
      }
    }
  };
  
  // Start the recursive check
  checkDynamicEntries(formData);
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

export default DynamicForm3;
