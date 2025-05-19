import { type RelativesInfo, type RelativeType } from "api/interfaces/sections/relativesInfo";

//relativesInfo covers section 18

// Helper function to create consistent IDs for dynamic entries
const generateDynamicFieldId = (baseId: string, index: number): string => {
  // For section 18, the field IDs start with 120xx
  // We increment by 100 for each new relative entry beyond the first
  if (index === 0) return baseId;
  const baseNum = parseInt(baseId, 10);
  return (baseNum - (index * 100)).toString();
};

// Create a template entry that can be used for new relatives
const createTemplateRelativeEntry = (index: number = 0): RelativesInfo["entries"][0] => {
  const entry = {
    _id: Math.random(),
    type: {
      value: "Mother" as RelativeType,
      id: generateDynamicFieldId("12082", index),
      type: "PDFDropdown",
      label: "Relative Type",
    },
    fullName: {
      firstName: {
        value: "",
        id: generateDynamicFieldId("12137", index),
        type: "PDFTextField",
        label: "First Name",
      },
      middleName: {
        value: "",
        id: generateDynamicFieldId("12140", index),
        type: "PDFTextField",
        label: "Middle Name",
      },
      lastName: {
        value: "",
        id: generateDynamicFieldId("12139", index),
        type: "PDFTextField",
        label: "Last Name",
      },
      suffix: {
        value: "",
        id: generateDynamicFieldId("12138", index),
        type: "PDFDropdown",
        label: "Suffix",
      },
    },
    dateOfBirth: {
      date: {
        value: "",
        id: generateDynamicFieldId("12078", index),
        type: "PDFTextField",
        label: "Date of Birth",
      },
      estimated: {
        value: "No" as "Yes" | "No",
        id: generateDynamicFieldId("12079", index),
        type: "PDFCheckBox",
        label: "Estimated",
      },
    },
    placeOfBirth: {
      city: {
        value: "",
        id: generateDynamicFieldId("12143", index),
        type: "PDFTextField",
        label: "City of Birth",
      },
      state: {
        value: "",
        id: generateDynamicFieldId("12142", index),
        type: "PDFDropdown",
        label: "State of Birth",
      },
      country: {
        value: "",
        id: generateDynamicFieldId("12141", index),
        type: "PDFDropdown",
        label: "Country of Birth",
      },
    },
    countriesOfCitizenship: [
      {
        _id: Math.random(),
        country: {
          value: "",
          id: generateDynamicFieldId("12081", index),
          type: "PDFDropdown",
          label: "Country of Citizenship",
        },
      },
      {
        _id: Math.random(),
        country: {
          value: "",
          id: generateDynamicFieldId("12080", index),
          type: "PDFDropdown",
          label: "Additional Country of Citizenship",
        },
      },
    ],
    isDeceased: {
      value: "NO" as "YES" | "NO",
      id: generateDynamicFieldId("12090", index),
      type: "PDFRadioGroup",
      label: "Is Deceased",
    },
    isUSCitizen: {
      value: "NO" as "YES" | "NO",
      id: generateDynamicFieldId("12089", index),
      type: "PDFRadioGroup",
      label: "Is US Citizen",
    },
    hasForeignAddress: {
      value: "NO" as "YES" | "NO",
      id: generateDynamicFieldId("12088", index),
      type: "PDFRadioGroup",
      label: "Has Foreign Address",
    },
    hasUSAddress: {
      value: "NO" as "YES" | "NO",
      id: generateDynamicFieldId("12087", index),
      type: "PDFRadioGroup",
      label: "Has US Address",
    },
    details: {
      // Each section's details will be initialized as needed based on relative type
    }
  };
  
  return entry;
};

// Create a template for otherNamesUsed entries
const createTemplateOtherNameEntry = (index: number = 0): any => {
  return {
    _id: Math.random(),
    lastName: {
      value: "",
      id: generateDynamicFieldId("12200", index),
      type: "PDFTextField",
      label: "Last Name",
    },
    firstName: {
      value: "",
      id: generateDynamicFieldId("12201", index),
      type: "PDFTextField",
      label: "First Name",
    },
    middleName: {
      value: "",
      id: generateDynamicFieldId("12202", index),
      type: "PDFTextField",
      label: "Middle Name",
    },
    suffix: {
      value: "",
      id: generateDynamicFieldId("12203", index),
      type: "PDFDropdown",
      label: "Suffix",
    },
    maidenName: {
      value: "NO",
      id: generateDynamicFieldId("12204", index),
      type: "PDFRadioGroup",
      label: "Is Maiden Name",
    },
    fromDate: {
      date: {
        value: "",
        id: generateDynamicFieldId("12205", index),
        type: "PDFTextField",
        label: "From Date",
      },
      estimated: {
        value: "NO",
        id: generateDynamicFieldId("12206", index),
        type: "PDFCheckBox",
        label: "Estimated",
      },
    },
    toDate: {
      date: {
        value: "",
        id: generateDynamicFieldId("12207", index),
        type: "PDFTextField",
        label: "To Date",
      },
      estimated: {
        value: "NO",
        id: generateDynamicFieldId("12208", index),
        type: "PDFCheckBox",
        label: "Estimated",
      },
    },
    reasonForChange: {
      value: "",
      id: generateDynamicFieldId("12209", index),
      type: "PDFTextField",
      label: "Reason For Change",
    },
  };
};

export const relativesInfo: RelativesInfo = {
  _id: Math.random(),
  relativeTypes: [
    {
      _id: Math.random(),
      name: "Mother",
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12077",
        label: "Mother Checkbox",
      },
    },
    {
      _id: Math.random(),
      name: "Father",
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12076",
        label: "Father Checkbox",
      },
    },
    {
      _id: Math.random(),
      name: "Stepmother",
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12075",
        label: "Stepmother Checkbox",
      },
    },
    {
      _id: Math.random(),
      name: "Stepfather",
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12074",
        label: "Stepfather Checkbox",
      },
    },
    {
      _id: Math.random(),
      name: "Foster parent",
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12073",
        label: "Foster Parent Checkbox",
      },
    },
    {
      _id: Math.random(),
      name: "Child (including adopted/foster)",
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12072",
        label: "Child Checkbox",
      },
    },
    {
      _id: Math.random(),
      name: "Stepchild",
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12071",
        label: "Stepchild Checkbox",
      },
    },
    {
      _id: Math.random(),
      name: "Brother",
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12070",
        label: "Brother Checkbox",
      },
    },
    {
      _id: Math.random(),
      name: "Sister",
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12069",
        label: "Sister Checkbox",
      },
    },
    {
      _id: Math.random(),
      name: "Stepbrother",
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12068",
        label: "Stepbrother Checkbox",
      },
    },
    {
      _id: Math.random(),
      name: "Stepsister",
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12067",
        label: "Stepsister Checkbox",
      },
    },
    {
      _id: Math.random(),
      name: "Half-brother",
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12066",
        label: "Half-brother Checkbox",
      },
    },
    {
      _id: Math.random(),
      name: "Half-sister",
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12065",
        label: "Half-sister Checkbox",
      },
    },
    {
      _id: Math.random(),
      name: "Father-in-law",
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12064",
        label: "Father-in-law Checkbox",
      },
    },
    {
      _id: Math.random(),
      name: "Mother-in-law",
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12063",
        label: "Mother-in-law Checkbox",
      },
    },
    {
      _id: Math.random(),
      name: "Guardian",
      type: {
        type: "PDFCheckBox",
        value: "Yes",
        id: "12062",
        label: "Guardian Checkbox",
      },
    },
  ],
  entries: [createTemplateRelativeEntry(0)],
};

// Export the template functions for use in FormEntryManager
export { createTemplateRelativeEntry, createTemplateOtherNameEntry };

/**
 * Validates relativesInfo data to ensure it meets form requirements
 * 
 * @param data The relativesInfo data to validate
 * @returns Object containing validation result and error messages
 */
export const validateRelativesInfo = (data: RelativesInfo): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];

  // Check if at least one relative type is selected
  const hasSelectedTypes = data.relativeTypes.some(rt => rt.type.value === "Yes");
  if (!hasSelectedTypes) {
    errors.push("At least one relative type must be selected.");
  }

  // Check if entries exist when relative types are selected
  if (hasSelectedTypes && (!data.entries || data.entries.length === 0)) {
    errors.push("At least one relative must be added when relative types are selected.");
  }

  // Validate each entry
  data.entries?.forEach((entry, index) => {
    const relativeIndex = index + 1;
    
    // Check if type is selected
    if (!entry.type.value) {
      errors.push(`Relative #${relativeIndex}: Type is required.`);
    }

    // Check if name is provided
    if (!entry.fullName.firstName.value || !entry.fullName.lastName.value) {
      errors.push(`Relative #${relativeIndex}: First and last name are required.`);
    }

    // Check if date of birth is provided
    if (!entry.dateOfBirth.date.value) {
      errors.push(`Relative #${relativeIndex}: Date of birth is required.`);
    }

    // Check place of birth
    if (!entry.placeOfBirth.city.value || !entry.placeOfBirth.country.value) {
      errors.push(`Relative #${relativeIndex}: City and country of birth are required.`);
    }

    // Check citizenship
    if (!entry.countriesOfCitizenship[0]?.country.value) {
      errors.push(`Relative #${relativeIndex}: At least one country of citizenship is required.`);
    }

    // If relative is not deceased, check for additional required information
    if (entry.isDeceased.value === "NO") {
      // Check for address details when required
      if (entry.hasForeignAddress.value === "YES" || entry.hasUSAddress.value === "YES") {
        if (!entry.details.section18_2) {
          errors.push(`Relative #${relativeIndex}: Address details are required.`);
        } else {
          if (!entry.details.section18_2.city || !entry.details.section18_2.country) {
            errors.push(`Relative #${relativeIndex}: City and country are required in address.`);
          }
          
          // State is required for US addresses
          if (entry.hasUSAddress.value === "YES" && 
              (!entry.details.section18_2.state || !entry.details.section18_2.state.value)) {
            errors.push(`Relative #${relativeIndex}: State is required for US addresses.`);
          }
        }
      }
      
      // Check for citizenship documentation for US citizens
      if (entry.isUSCitizen.value === "YES" && !entry.details.section18_3) {
        errors.push(`Relative #${relativeIndex}: Citizenship documentation is required for US citizens.`);
      }
      
      // Check for documentation for non-citizens
      if (entry.isUSCitizen.value === "NO" && !entry.details.section18_4) {
        errors.push(`Relative #${relativeIndex}: Documentation is required for non-US citizens.`);
      }
      
      // Check for contact information for foreign relatives
      if ((entry.isUSCitizen.value === "NO" || entry.hasForeignAddress.value === "YES") && 
          !entry.details.section18_5) {
        errors.push(`Relative #${relativeIndex}: Contact information is required for foreign relatives.`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};
