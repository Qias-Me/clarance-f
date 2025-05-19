import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect
} from "react";
import { type EmploymentInfo as EmploymentInfoType } from "api/interfaces/sections/employmentInfo";
import { employmentInfo as defaultEmploymentInfo } from "../../state/contexts/sections/employmentInfo";
import { useFormContext } from "../../state/hooks/useFormContext";
import { BrowserFieldMappingService } from "api/service/BrowserFieldMappingService";

/**
 * EmploymentInfo Context Implementation
 * 
 * This module provides the context and context provider for Section 13 (Employment Activities)
 * of the form, handling employment history and related information.
 * 
 * The implementation follows the project pattern of creating dedicated context
 * providers for form sections, with support for conditional logic, field mapping,
 * and integration with the Redux store.
 */

// Define the context type
interface EmploymentInfoContextType {
  /** The current employment information state */
  employmentInfo: EmploymentInfoType[];
  /** Updates a specific field using dot notation path */
  updateEmploymentField: (key: string, value: any) => void;
  /** Resets all employment fields to defaults */
  resetEmploymentInfo: () => void;
  /** Adds a new employment entry */
  addEmployment: () => void;
  /** Removes an employment entry at the specified index */
  removeEmployment: (index: number) => void;
  /** Validates the employment information */
  validateEmploymentInfo: () => { isValid: boolean; errors: string[] };
}

// Create the context with a default value
const EmploymentInfoContext = createContext<EmploymentInfoContextType | undefined>(undefined);

// Custom hook for consuming the context
export const useEmploymentInfo = (): EmploymentInfoContextType => {
  const context = useContext(EmploymentInfoContext);
  if (!context) {
    throw new Error("useEmploymentInfo must be used within a EmploymentInfoProvider");
  }
  return context;
};

// Props for the provider component
interface EmploymentInfoProviderProps {
  children: ReactNode;
}

/**
 * EmploymentInfo Provider Component
 * 
 * This component manages the state and logic for employment information,
 * including dynamic entries for employment history.
 */
export const EmploymentInfoProvider: React.FC<EmploymentInfoProviderProps> = ({
  children
}) => {
  // Initial state using the default values
  const [employmentInfo, setEmploymentInfo] = useState<EmploymentInfoType[]>([defaultEmploymentInfo]);
  
  // Access the form context for integration with Redux store
  const { updateField, getSectionData } = useFormContext();
  
  // Create instance of the FieldMappingService for field ID handling
  const fieldMappingService = new BrowserFieldMappingService();
  
  // Load initial data from Redux store if available
  useEffect(() => {
    const storedData = getSectionData("employmentInfo");
    if (storedData && Array.isArray(storedData) && storedData.length > 0) {
      setEmploymentInfo(storedData);
    }
  }, [getSectionData]);
  
  /**
   * Updates a specific field in the employment info using dot notation path.
   * Also updates the Redux store via updateField.
   */
  const updateEmploymentField = (fieldPath: string, value: any) => {
    setEmploymentInfo((prev) => {
      const updatedState = [...prev];
      
      // Handle nested paths with dot notation (e.g., "[0].section13A[0].employmentActivity.value")
      const pathParts = fieldPath.split('.');
      
      // Extract the array indices from the path
      const mainMatch = pathParts[0].match(/\[(\d+)\]/);
      const mainIndex = mainMatch ? parseInt(mainMatch[1]) : -1;
      
      if (mainIndex === -1) {
        // If this is a direct update to the array itself, just return the new value
        updateField(`employmentInfo${fieldPath}`, value, "");
        return value as EmploymentInfoType[];
      }
      
      let current: any = updatedState[mainIndex];
      let path = `employmentInfo[${mainIndex}]`;
      
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
   * Resets the employment info to the default values.
   */
  const resetEmploymentInfo = () => {
    setEmploymentInfo([defaultEmploymentInfo]);
  };
  
  /**
   * Adds a new employment entry.
   */
  const addEmployment = () => {
    setEmploymentInfo(prev => {
      // Get next _id based on the highest current _id
      const nextId = prev.reduce((max, e) => Math.max(max, e._id), 0) + 1;
      
      // Create a new employment entry based on the default structure
      const newEmployment: EmploymentInfoType = {
        _id: nextId,
        section13A: [
          {
            _id: 1,
            employmentActivity: {
              value: "Active military duty station (Complete 13A.1, 13A.5 and 13A.6)",
              id: "",
              type: "PDFRadioGroup",
              label: "Employment Activity"
            }
          }
        ]
      };
      
      // Add the new employment entry to the array
      const updatedState = [...prev, newEmployment];
      
      // Update each employment entry in the form context individually
      updatedState.forEach((entry, index) => {
        updateField(`employmentInfo[${index}]`, JSON.stringify(entry), "");
      });
      
      return updatedState;
    });
  };
  
  /**
   * Removes an employment entry at the specified index.
   */
  const removeEmployment = (index: number) => {
    setEmploymentInfo(prev => {
      if (index < 0 || index >= prev.length) {
        return prev; // Invalid index, do nothing
      }
      
      // Remove the employment entry
      const updatedState = [...prev];
      updatedState.splice(index, 1);
      
      // If all entries are removed, add back a default one
      if (updatedState.length === 0) {
        updatedState.push({
          _id: 1,
          section13A: [
            {
              _id: 1,
              employmentActivity: {
                value: "Active military duty station (Complete 13A.1, 13A.5 and 13A.6)",
                id: "",
                type: "PDFRadioGroup",
                label: "Employment Activity"
              }
            }
          ]
        });
      }
      
      // Update the form context with the new array structure
      // First clear existing entries by setting to empty array
      updateField("employmentInfo", JSON.stringify([]), "");
      
      // Then update each entry individually
      updatedState.forEach((entry, idx) => {
        updateField(`employmentInfo[${idx}]`, JSON.stringify(entry), "");
      });
      
      return updatedState;
    });
  };
  
  /**
   * Validates the employment information.
   * @returns Object with isValid flag and array of error messages
   */
  const validateEmploymentInfo = () => {
    const errors: string[] = [];
    
    // Check if there's at least one employment entry
    if (employmentInfo.length === 0) {
      errors.push("At least one employment entry is required");
    }
    
    // Check if each entry has required fields
    employmentInfo.forEach((entry, index) => {
      if (!entry.section13A?.[0]?.employmentActivity?.value) {
        errors.push(`Employment activity is required for entry #${index + 1}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  // Provide the context values to children
  return (
    <EmploymentInfoContext.Provider
      value={{
        employmentInfo,
        updateEmploymentField,
        resetEmploymentInfo,
        addEmployment,
        removeEmployment,
        validateEmploymentInfo
      }}
    >
      {children}
    </EmploymentInfoContext.Provider>
  );
}; 