import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect
} from "react";
import { type CitizenshipInfo } from "api/interfaces/sections/citizenship";
import { citizenshipInfo as defaultCitizenshipInfo } from "../../state/contexts/sections/citizenshipInfo";
import { useFormContext } from "../../state/hooks/useFormContext";
import { BrowserFieldMappingService } from "api/service/BrowserFieldMappingService";

/**
 * CitizenshipInfo Context Implementation
 * 
 * This module provides the context and context provider for Section 9 (Citizenship)
 * of the form, handling different citizenship types and their conditional fields.
 * 
 * The implementation follows the project pattern of creating dedicated context
 * providers for form sections, with support for conditional logic, field mapping,
 * and integration with the Redux store.
 */

// Define the context type
interface CitizenshipInfoContextType {
  /** The current citizenship information state */
  citizenshipInfo: CitizenshipInfo;
  /** Updates a specific field using dot notation path */
  updateCitizenshipField: (key: string, value: any) => void;
  /** Resets all citizenship fields to defaults */
  resetCitizenshipInfo: () => void;
  /** Sets the primary citizenship status and triggers conditional logic */
  setCitizenshipStatus: (status: string) => void;
  /** Shows/hides fields for citizens born abroad (section 9.1) */
  handleCitizenshipByBirth: (enabled: boolean) => void;
  /** Shows/hides fields for naturalized citizens (section 9.2) */
  handleNaturalizedCitizen: (enabled: boolean) => void;
  /** Shows/hides fields for derived citizens (section 9.3) */
  handleDerivedCitizen: (enabled: boolean) => void;
  /** Shows/hides fields for non-citizens (section 9.4) */
  handleNonCitizen: (enabled: boolean) => void;
}

// Create the context with a default value
const CitizenshipInfoContext = createContext<CitizenshipInfoContextType | undefined>(undefined);

// Custom hook for consuming the context
export const useCitizenshipInfo = (): CitizenshipInfoContextType => {
  const context = useContext(CitizenshipInfoContext);
  if (!context) {
    throw new Error("useCitizenshipInfo must be used within a CitizenshipInfoProvider");
  }
  return context;
};

// Props for the provider component
interface CitizenshipInfoProviderProps {
  children: ReactNode;
}

/**
 * Mapping of user-friendly status descriptions to internal status codes.
 * This mapping is used to determine which citizenship subsection to display.
 */
const citizenshipStatusMapping: Record<string, string> = {
  "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   ": "birth",
  "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) ": "citizen",
  "I am a naturalized U.S. citizen. (Complete 9.2) ": "naturalized",
  "I am a derived U.S. citizen. (Complete 9.3) ": "derived",
  "I am not a U.S. citizen. (Complete 9.4) ": "nonCitizen"
};

/**
 * CitizenshipInfo Provider Component
 * 
 * This component manages the state and logic for citizenship information,
 * including showing/hiding conditional fields based on citizenship status.
 */
export const CitizenshipInfoProvider: React.FC<CitizenshipInfoProviderProps> = ({
  children
}) => {
  // Initial state using the default values
  const [citizenshipInfo, setCitizenshipInfo] = useState<CitizenshipInfo>(defaultCitizenshipInfo);
  
  // Access the form context for integration with Redux store
  const { updateField, getSectionData } = useFormContext();
  
  // Create instance of the FieldMappingService for field ID handling
  const fieldMappingService = new BrowserFieldMappingService();
  
  /**
   * Updates a specific field in the citizenship info using dot notation path.
   * Also updates the Redux store via updateField.
   */
  const updateCitizenshipField = (fieldPath: string, value: any) => {
    setCitizenshipInfo((prev) => {
      const updatedState = { ...prev };
      
      // Handle nested paths with dot notation (e.g., "section9_1.doc_type.value")
      const pathParts = fieldPath.split('.');
      let current: any = updatedState;
      
      // Navigate to the parent object of the final property
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      // Set the final property value
      current[pathParts[pathParts.length - 1]] = value;
      
      // Update the form context as well
      updateField(`citizenshipInfo.${fieldPath}`, value);
      
      return updatedState;
    });
  };
  
  /**
   * Resets the citizenship info to the default values.
   */
  const resetCitizenshipInfo = () => {
    setCitizenshipInfo(defaultCitizenshipInfo);
  };
  
  /**
   * Sets the citizenship status and triggers the conditional logic
   * for showing/hiding appropriate sections.
   */
  const setCitizenshipStatus = (status: string) => {
    // Update the status value
    updateCitizenshipField('citizenship_status_code.value', status);
  };
  
  /**
   * Shows/hides fields for citizens born abroad (section 9.1).
   * When enabled, shows section 9.1 and hides others.
   */
  const handleCitizenshipByBirth = (enabled: boolean) => {
    if (enabled) {
      // Show section 9.1 and hide others
      setCitizenshipInfo(prev => ({
        ...prev,
        section9_1: prev.section9_1 || defaultCitizenshipInfo.section9_1,
        section9_2: undefined,
        section9_3: undefined,
        section9_4: undefined
      }));
    } else {
      // Hide section 9.1
      setCitizenshipInfo(prev => ({
        ...prev,
        section9_1: undefined
      }));
    }
  };
  
  /**
   * Shows/hides fields for naturalized citizens (section 9.2).
   * When enabled, shows section 9.2 and hides others.
   */
  const handleNaturalizedCitizen = (enabled: boolean) => {
    if (enabled) {
      // Show section 9.2 and hide others
      setCitizenshipInfo(prev => ({
        ...prev,
        section9_1: undefined,
        section9_2: prev.section9_2 || defaultCitizenshipInfo.section9_2,
        section9_3: undefined,
        section9_4: undefined
      }));
    } else {
      // Hide section 9.2
      setCitizenshipInfo(prev => ({
        ...prev,
        section9_2: undefined
      }));
    }
  };
  
  /**
   * Shows/hides fields for derived citizens (section 9.3).
   * When enabled, shows section 9.3 and hides others.
   */
  const handleDerivedCitizen = (enabled: boolean) => {
    if (enabled) {
      // Show section 9.3 and hide others
      setCitizenshipInfo(prev => ({
        ...prev,
        section9_1: undefined,
        section9_2: undefined,
        section9_3: prev.section9_3 || defaultCitizenshipInfo.section9_3,
        section9_4: undefined
      }));
    } else {
      // Hide section 9.3
      setCitizenshipInfo(prev => ({
        ...prev,
        section9_3: undefined
      }));
    }
  };
  
  /**
   * Shows/hides fields for non-citizens (section 9.4).
   * When enabled, shows section 9.4 and hides others.
   */
  const handleNonCitizen = (enabled: boolean) => {
    if (enabled) {
      // Show section 9.4 and hide others
      setCitizenshipInfo(prev => ({
        ...prev,
        section9_1: undefined,
        section9_2: undefined,
        section9_3: undefined,
        section9_4: prev.section9_4 || defaultCitizenshipInfo.section9_4
      }));
    } else {
      // Hide section 9.4
      setCitizenshipInfo(prev => ({
        ...prev,
        section9_4: undefined
      }));
    }
  };
  
  /**
   * Effect hook to handle conditional field logic based on citizenship status.
   * Shows/hides appropriate sections when citizenship status changes.
   */
  useEffect(() => {
    const status = citizenshipInfo.citizenship_status_code?.value;
    
    if (status && typeof status === 'string') {
      const statusCode = citizenshipStatusMapping[status] || "";
      
      // Show/hide appropriate sections based on citizenship status
      handleCitizenshipByBirth(statusCode === "citizen");
      handleNaturalizedCitizen(statusCode === "naturalized");
      handleDerivedCitizen(statusCode === "derived");
      handleNonCitizen(statusCode === "nonCitizen");
    }
  }, [citizenshipInfo.citizenship_status_code?.value]);
  
  /**
   * Effect hook to initialize with data from Redux store if available.
   */
  useEffect(() => {
    const storedData = getSectionData<CitizenshipInfo>('citizenshipInfo');
    if (storedData) {
      setCitizenshipInfo(storedData);
    }
  }, [getSectionData]);

  return (
    <CitizenshipInfoContext.Provider
      value={{
        citizenshipInfo,
        updateCitizenshipField,
        resetCitizenshipInfo,
        setCitizenshipStatus,
        handleCitizenshipByBirth,
        handleNaturalizedCitizen,
        handleDerivedCitizen,
        handleNonCitizen
      }}
    >
      {children}
    </CitizenshipInfoContext.Provider>
  );
}; 