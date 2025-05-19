import { type PlaceOfBirth } from "api/interfaces/sections/placeOfBirth";

// placeOfBirth covers section 3 - Place of Birth section of SF-86
// These field IDs correspond to section 3 in field-hierarchy.json

export const placeOfBirth: PlaceOfBirth = {
    birthCity: {
        value: "",
        id: "9446", // Field ID from field-hierarchy.json without the "0 R" suffix
        type: "PDFTextField",
        label: "Section 3. Place of Birth. Provide your place of birth. City.",
    },
    birthState: {
        value: "",
        id: "9443", // Field ID from field-hierarchy.json without the "0 R" suffix
        type: "PDFTextField",
        label: "State",
    },
    birthCounty: {
        value: "",
        id: "9445", // Field ID from field-hierarchy.json without the "0 R" suffix
        type: "PDFTextField",
        label: "County",
    },
    birthCountry: {
        value: "",
        id: "9444", // Field ID from field-hierarchy.json without the "0 R" suffix
        type: "PDFDropdown",
        label: "Country (Required)",
    }
}; 

/**
 * Validates placeOfBirth data to ensure it meets form requirements
 * 
 * @param data The placeOfBirth data to validate
 * @returns Object containing validation result and error messages
 */
export const validatePlaceOfBirth = (data: PlaceOfBirth): {
  isValid: boolean;
  errors: string[]
} => {
  const errors: string[] = [];
  
  // Country is always required
  if (!data.birthCountry?.value || data.birthCountry.value.trim() === '') {
    errors.push("Country of birth is required.");
  }
  
  // If country is United States, then city, state, and county are required
  if (data.birthCountry?.value === "United States") {
    if (!data.birthCity?.value || data.birthCity.value.trim() === '') {
      errors.push("City of birth is required for individuals born in the United States.");
    }
    
    if (!data.birthState?.value || data.birthState.value.trim() === '') {
      errors.push("State of birth is required for individuals born in the United States.");
    }
    
    if (!data.birthCounty?.value || data.birthCounty.value.trim() === '') {
      errors.push("County of birth is required for individuals born in the United States.");
    }
  } else {
    // For non-US births, at least city is required
    if (!data.birthCity?.value || data.birthCity.value.trim() === '') {
      errors.push("City of birth is required.");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 