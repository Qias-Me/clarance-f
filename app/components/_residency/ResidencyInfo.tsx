import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect
} from "react";
import { type ResidencyInfo as ResidencyInfoType, type Phone } from "api/interfaces/sections/residency";
import { residencyInfo as defaultResidencyInfo, validateResidencyInfo } from "../../state/contexts/sections/residencyInfo";
import { useFormContext } from "../../state/hooks/useFormContext";
import { BrowserFieldMappingService } from "api/service/BrowserFieldMappingService";

/**
 * ResidencyInfo Context Implementation
 * 
 * This module provides the context and context provider for Section 11 (Where You Have Lived)
 * of the form, handling residence history and contacts associated with each residence.
 * 
 * The implementation follows the project pattern of creating dedicated context
 * providers for form sections, with support for conditional logic, field mapping,
 * and integration with the Redux store.
 */

// Define the context type
interface ResidencyInfoContextType {
  /** The current residency information state */
  residencyInfo: ResidencyInfoType[];
  /** Updates a specific field using dot notation path */
  updateResidencyField: (key: string, value: any) => void;
  /** Resets all residency fields to defaults */
  resetResidencyInfo: () => void;
  /** Adds a new residence entry */
  addResidence: () => void;
  /** Removes a residence entry at the specified index */
  removeResidence: (index: number) => void;
  /** Adds a new phone entry to a contact in a residence entry */
  addPhone: (residenceIndex: number) => void;
  /** Removes a phone entry at the specified index from a contact in a residence entry */
  removePhone: (residenceIndex: number, phoneIndex: number) => void;
  /** Validates the residency information */
  validateResidencyInfo: () => { isValid: boolean; errors: string[] };
}

// Create the context with a default value
const ResidencyInfoContext = createContext<ResidencyInfoContextType | undefined>(undefined);

// Custom hook for consuming the context
export const useResidencyInfo = (): ResidencyInfoContextType => {
  const context = useContext(ResidencyInfoContext);
  if (!context) {
    throw new Error("useResidencyInfo must be used within a ResidencyInfoProvider");
  }
  return context;
};

// Props for the provider component
interface ResidencyInfoProviderProps {
  children: ReactNode;
}

/**
 * ResidencyInfo Provider Component
 * 
 * This component manages the state and logic for residency information,
 * including dynamic entries for residences and contact phones.
 */
export const ResidencyInfoProvider: React.FC<ResidencyInfoProviderProps> = ({
  children
}) => {
  // Initial state using the default values
  const [residencyInfo, setResidencyInfo] = useState<ResidencyInfoType[]>(defaultResidencyInfo);
  
  // Access the form context for integration with Redux store
  const { updateField, getSectionData } = useFormContext();
  
  // Create instance of the FieldMappingService for field ID handling
  const fieldMappingService = new BrowserFieldMappingService();
  
  /**
   * Updates a specific field in the residency info using dot notation path.
   * Also updates the Redux store via updateField.
   */
  const updateResidencyField = (fieldPath: string, value: any) => {
    setResidencyInfo((prev) => {
      const updatedState = [...prev];
      
      // Handle nested paths with dot notation (e.g., "[0].contact.phone[0].number.value")
      const pathParts = fieldPath.split('.');
      
      // Extract the array indices from the path
      const mainMatch = pathParts[0].match(/\[(\d+)\]/);
      const mainIndex = mainMatch ? parseInt(mainMatch[1]) : -1;
      
      if (mainIndex === -1) {
        // If this is a direct update to the array itself, just return the new value
        updateField(`residencyInfo${fieldPath}`, value, "");
        return value as ResidencyInfoType[];
      }
      
      let current: any = updatedState[mainIndex];
      let path = `residencyInfo[${mainIndex}]`;
      
      // Navigate through the object following the path parts
      for (let i = 1; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        
        // Check if part contains array index notation [n]
        const match = part.match(/^([^\[]+)(?:\[(\d+)\])?$/);
        
        if (match) {
          const propName = match[1];
          const arrayIndex = match[2] ? parseInt(match[2]) : undefined;
          
          if (arrayIndex !== undefined) {
            // Handle array properties
            path += `.${propName}[${arrayIndex}]`;
            current = current[propName][arrayIndex];
          } else {
            // Handle regular properties
            path += `.${propName}`;
            current = current[propName];
          }
        }
      }
      
      // Set the final property value
      const finalProp = pathParts[pathParts.length - 1];
      const finalMatch = finalProp.match(/^([^\[]+)(?:\[(\d+)\])?$/);
      
      if (finalMatch) {
        const propName = finalMatch[1];
        const arrayIndex = finalMatch[2] ? parseInt(finalMatch[2]) : undefined;
        
        if (arrayIndex !== undefined) {
          // Set array item property
          path += `.${propName}[${arrayIndex}]`;
          current[propName][arrayIndex] = value;
        } else {
          // Set regular property
          path += `.${propName}`;
          current[propName] = value;
        }
      }
      
      // Update the form context as well
      updateField(path, value, "");
      
      return updatedState;
    });
  };
  
  /**
   * Resets the residency info to the default values.
   */
  const resetResidencyInfo = () => {
    setResidencyInfo(defaultResidencyInfo);
  };
  
  /**
   * Adds a new residence entry.
   */
  const addResidence = () => {
    setResidencyInfo(prev => {
      // Get next _id based on the highest current _id
      const nextId = prev.reduce((max, r) => Math.max(max, r._id), 0) + 1;
      
      // Create a new residence entry based on the first entry's structure
      const newResidence: ResidencyInfoType = {
        _id: nextId,
        residenceStartDate: {
          value: "",
          id: "",
          type: "PDFTextField",
          label: "Residence Start Date"
        },
        isStartDateEst: {
          value: "No",
          id: "",
          type: "PDFCheckBox",
          label: "Estimated Start Date"
        },
        residenceEndDate: {
          value: "",
          id: "",
          type: "PDFTextField",
          label: "Residence End Date"
        },
        isResidenceEndEst: {
          value: "No",
          id: "",
          type: "PDFCheckBox",
          label: "Estimated End Date"
        },
        isResidencePresent: {
          value: "No",
          id: "",
          type: "PDFCheckBox",
          label: "Present"
        },
        residenceStatus: {
          value: "1",
          id: "",
          type: "PDFRadioGroup",
          label: "Residence Status"
        },
        residenceOtherDetails: {
          value: "",
          id: "",
          type: "PDFTextField",
          label: "Other Details"
        },
        residenceAddress: {
          street: {
            value: "",
            id: "",
            type: "PDFTextField",
            label: "Street"
          },
          city: {
            value: "",
            id: "",
            type: "PDFTextField",
            label: "City"
          },
          state: {
            value: "",
            id: "",
            type: "PDFDropdown",
            label: "State"
          },
          zip: {
            value: "",
            id: "",
            type: "PDFTextField",
            label: "ZIP Code"
          },
          country: {
            value: "",
            id: "",
            type: "PDFDropdown",
            label: "Country"
          },
          hasAPOOrFPO: {
            value: "NO",
            id: "",
            type: "PDFRadioGroup",
            label: "Has APO/FPO"
          },
        },
        contact: {
          lastname: {
            value: "",
            id: "",
            type: "PDFTextField",
            label: "Last Name"
          },
          firstname: {
            value: "",
            id: "",
            type: "PDFTextField",
            label: "First Name"
          },
          lastContactDate: {
            value: "",
            id: "",
            type: "PDFTextField",
            label: "Last Contact Date"
          },
          isLastContactEst: {
            value: "No",
            id: "",
            type: "PDFCheckBox",
            label: "Estimated Last Contact Date"
          },
          relationship: {
            checkboxes: [
              {
                value: "No",
                id: "",
                type: "PDFCheckbox",
                label: "Neighbor"
              },
              {
                value: "No",
                id: "",
                type: "PDFCheckbox",
                label: "Friend"
              },
              {
                value: "No",
                id: "",
                type: "PDFCheckbox",
                label: "Landlord"
              },
              {
                value: "No",
                id: "",
                type: "PDFCheckbox",
                label: "Business associate"
              },
              {
                value: "No",
                id: "",
                type: "PDFCheckbox",
                label: "Other"
              },
            ],
          },
          phone: [
            {
              _id: 1,
              dontKnowNumber: {
                value: "No",
                id: "",
                type: "PDFCheckBox",
                label: "Don't Know Number"
              },
              isInternationalOrDSN: {
                value: "No",
                id: "",
                type: "PDFCheckBox",
                label: "International or DSN"
              },
              number: {
                value: "",
                id: "",
                type: "PDFTextField",
                label: "Phone Number"
              },
              extension: {
                value: "",
                id: "",
                type: "PDFTextField",
                label: "Extension"
              }
            },
          ],
          email: {
            value: "",
            id: "",
            type: "PDFTextField",
            label: "Email"
          },
          dontKnowEmail: {
            value: "No",
            id: "",
            type: "PDFCheckBox",
            label: "Don't Know Email"
          },
        },
      };
      
      // Add the new residence to the array
      const updatedResidencyInfo = [...prev, newResidence];
      
      // Update the Redux store - Convert to string for the updateField API
      updateField("residencyInfo", JSON.stringify(updatedResidencyInfo), "");
      
      return updatedResidencyInfo;
    });
  };
  
  /**
   * Removes a residence entry at the specified index.
   */
  const removeResidence = (index: number) => {
    setResidencyInfo(prev => {
      if (index < 0 || index >= prev.length) {
        return prev;
      }
      
      // Remove the residence at the specified index
      const updatedResidencyInfo = [...prev];
      updatedResidencyInfo.splice(index, 1);
      
      // Update the Redux store - Convert to string for the updateField API
      updateField("residencyInfo", JSON.stringify(updatedResidencyInfo), "");
      
      return updatedResidencyInfo;
    });
  };
  
  /**
   * Adds a new phone entry to a contact in a residence entry.
   */
  const addPhone = (residenceIndex: number) => {
    setResidencyInfo(prev => {
      if (residenceIndex < 0 || residenceIndex >= prev.length) {
        return prev;
      }
      
      // Get next _id based on the highest current _id
      const phones = prev[residenceIndex].contact.phone;
      const nextId = phones.reduce((max, p) => Math.max(max, p._id), 0) + 1;
      
      // Create a new phone entry
      const newPhone: Phone = {
        _id: nextId,
        dontKnowNumber: {
          value: "No",
          id: "",
          type: "PDFCheckBox",
          label: "Don't Know Number"
        },
        isInternationalOrDSN: {
          value: "No",
          id: "",
          type: "PDFCheckBox",
          label: "International or DSN"
        },
        number: {
          value: "",
          id: "",
          type: "PDFTextField",
          label: "Phone Number"
        },
        extension: {
          value: "",
          id: "",
          type: "PDFTextField",
          label: "Extension"
        }
      };
      
      // Add the new phone to the contact
      const updatedResidencyInfo = [...prev];
      updatedResidencyInfo[residenceIndex].contact.phone.push(newPhone);
      
      // Update the Redux store - Convert to string for the updateField API
      updateField(
        `residencyInfo[${residenceIndex}].contact.phone`,
        JSON.stringify(updatedResidencyInfo[residenceIndex].contact.phone),
        ""
      );
      
      return updatedResidencyInfo;
    });
  };
  
  /**
   * Removes a phone entry at the specified index from a contact in a residence entry.
   */
  const removePhone = (residenceIndex: number, phoneIndex: number) => {
    setResidencyInfo(prev => {
      if (
        residenceIndex < 0 || residenceIndex >= prev.length ||
        phoneIndex < 0 || phoneIndex >= prev[residenceIndex].contact.phone.length
      ) {
        return prev;
      }
      
      // Remove the phone at the specified index
      const updatedResidencyInfo = [...prev];
      updatedResidencyInfo[residenceIndex].contact.phone.splice(phoneIndex, 1);
      
      // Ensure there's at least one phone entry
      if (updatedResidencyInfo[residenceIndex].contact.phone.length === 0) {
        updatedResidencyInfo[residenceIndex].contact.phone.push({
          _id: 1,
          dontKnowNumber: {
            value: "No",
            id: "",
            type: "PDFCheckBox",
            label: "Don't Know Number"
          },
          isInternationalOrDSN: {
            value: "No",
            id: "",
            type: "PDFCheckBox",
            label: "International or DSN"
          },
          number: {
            value: "",
            id: "",
            type: "PDFTextField",
            label: "Phone Number"
          },
          extension: {
            value: "",
            id: "",
            type: "PDFTextField",
            label: "Extension"
          }
        });
      }
      
      // Update the Redux store - Convert to string for the updateField API
      updateField(
        `residencyInfo[${residenceIndex}].contact.phone`,
        JSON.stringify(updatedResidencyInfo[residenceIndex].contact.phone),
        ""
      );
      
      return updatedResidencyInfo;
    });
  };
  
  /**
   * Effect hook to initialize with data from Redux store if available.
   */
  useEffect(() => {
    const storedData = getSectionData<ResidencyInfoType[]>('residencyInfo');
    if (storedData) {
      setResidencyInfo(storedData);
    }
  }, [getSectionData]);

  return (
    <ResidencyInfoContext.Provider
      value={{
        residencyInfo,
        updateResidencyField,
        resetResidencyInfo,
        addResidence,
        removeResidence,
        addPhone,
        removePhone,
        validateResidencyInfo: () => validateResidencyInfo(residencyInfo)
      }}
    >
      {children}
    </ResidencyInfoContext.Provider>
  );
}; 