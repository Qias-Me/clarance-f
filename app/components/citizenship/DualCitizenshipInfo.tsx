import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect
} from "react";
import { type DualCitizenshipInfo, type CitizenshipDetail, type PassportDetail, type PassportUseDetail } from "api/interfaces/sections/duelCitizenship";
import { dualCitizenshipInfo as defaultDualCitizenshipInfo } from "../../state/contexts/sections/dualCitizenshipInfo";
import { useFormContext } from "../../state/hooks/useFormContext";
import { BrowserFieldMappingService } from "api/service/BrowserFieldMappingService";

/**
 * DualCitizenshipInfo Context Implementation
 * 
 * This module provides the context and context provider for Section 10 (Dual/Multiple Citizenship)
 * of the form, handling both citizenship information and foreign passport details.
 * 
 * The implementation follows the project pattern of creating dedicated context
 * providers for form sections, with support for conditional logic, field mapping,
 * and integration with the Redux store.
 */

// Define the context type
interface DualCitizenshipInfoContextType {
  /** The current dual citizenship information state */
  dualCitizenshipInfo: DualCitizenshipInfo;
  /** Updates a specific field using dot notation path */
  updateDualCitizenshipField: (key: string, value: any) => void;
  /** Resets all dual citizenship fields to defaults */
  resetDualCitizenshipInfo: () => void;
  /** Updates the held multiple citizenships field and handles conditional display */
  setHeldMultipleCitizenships: (value: "YES" | "NO (If NO, proceed to 10.2)") => void;
  /** Updates the had non-US passport field and handles conditional display */
  setHadNonUSPassport: (value: "YES" | "NO (If NO, proceed to Section 11)") => void;
  /** Adds a new citizenship entry */
  addCitizenship: () => void;
  /** Removes a citizenship entry at the specified index */
  removeCitizenship: (index: number) => void;
  /** Adds a new passport entry */
  addPassport: () => void;
  /** Removes a passport entry at the specified index */
  removePassport: (index: number) => void;
  /** Adds a new passport use entry to a specific passport */
  addPassportUse: (passportIndex: number) => void;
  /** Removes a passport use entry from a specific passport */
  removePassportUse: (passportIndex: number, useIndex: number) => void;
}

// Create the context with a default value
const DualCitizenshipInfoContext = createContext<DualCitizenshipInfoContextType | undefined>(undefined);

// Custom hook for consuming the context
export const useDualCitizenshipInfo = (): DualCitizenshipInfoContextType => {
  const context = useContext(DualCitizenshipInfoContext);
  if (!context) {
    throw new Error("useDualCitizenshipInfo must be used within a DualCitizenshipInfoProvider");
  }
  return context;
};

// Props for the provider component
interface DualCitizenshipInfoProviderProps {
  children: ReactNode;
}

/**
 * DualCitizenshipInfo Provider Component
 * 
 * This component manages the state and logic for dual citizenship information,
 * including showing/hiding conditional fields based on user responses and
 * handling the addition/removal of multiple citizenships and passports.
 */
export const DualCitizenshipInfoProvider: React.FC<DualCitizenshipInfoProviderProps> = ({
  children
}) => {
  // Initial state using the default values
  const [dualCitizenshipInfo, setDualCitizenshipInfo] = useState<DualCitizenshipInfo>(defaultDualCitizenshipInfo);
  
  // Access the form context for integration with Redux store
  const { updateField, getSectionData } = useFormContext();
  
  // Create instance of the FieldMappingService for field ID handling
  const fieldMappingService = new BrowserFieldMappingService();
  
  /**
   * Updates a specific field in the dual citizenship info using dot notation path.
   * Also updates the Redux store via updateField.
   */
  const updateDualCitizenshipField = (fieldPath: string, value: any) => {
    setDualCitizenshipInfo((prev) => {
      const updatedState = { ...prev };
      
      // Handle nested paths with dot notation (e.g., "citizenships.0.country.value")
      const pathParts = fieldPath.split('.');
      let current: any = updatedState;
      
      // Navigate to the parent object of the final property
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        
        // Handle array indices
        if (!isNaN(Number(part)) && Array.isArray(current)) {
          if (!current[Number(part)]) {
            current[Number(part)] = {};
          }
          current = current[Number(part)];
        } else {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      }
      
      // Set the final property value
      current[pathParts[pathParts.length - 1]] = value;
      
      // Update the form context as well
      updateField(`dualCitizenshipInfo.${fieldPath}`, value);
      
      return updatedState;
    });
  };
  
  /**
   * Resets the dual citizenship info to the default values.
   */
  const resetDualCitizenshipInfo = () => {
    setDualCitizenshipInfo(defaultDualCitizenshipInfo);
  };
  
  /**
   * Sets the held multiple citizenships field and handles conditional display.
   */
  const setHeldMultipleCitizenships = (value: "YES" | "NO (If NO, proceed to 10.2)") => {
    updateDualCitizenshipField('heldMultipleCitizenships.value', value);
    
    // If "NO", clear any existing citizenship data
    if (value === "NO (If NO, proceed to 10.2)") {
      setDualCitizenshipInfo(prev => ({
        ...prev,
        citizenships: undefined
      }));
    } else if (!dualCitizenshipInfo.citizenships) {
      // If "YES" and no citizenships yet, initialize with default
      if (defaultDualCitizenshipInfo.citizenships && defaultDualCitizenshipInfo.citizenships.length > 0) {
        const initialCitizenship = { ...defaultDualCitizenshipInfo.citizenships[0], _id: 1 };
        setDualCitizenshipInfo(prev => ({
          ...prev,
          citizenships: [initialCitizenship]
        }));
      }
    }
  };
  
  /**
   * Sets the had non-US passport field and handles conditional display.
   */
  const setHadNonUSPassport = (value: "YES" | "NO (If NO, proceed to Section 11)") => {
    updateDualCitizenshipField('hadNonUSPassport.value', value);
    
    // If "NO", clear any existing passport data
    if (value === "NO (If NO, proceed to Section 11)") {
      setDualCitizenshipInfo(prev => ({
        ...prev,
        passports: undefined
      }));
    } else if (!dualCitizenshipInfo.passports) {
      // If "YES" and no passports yet, initialize with default
      if (defaultDualCitizenshipInfo.passports && defaultDualCitizenshipInfo.passports.length > 0) {
        const initialPassport = { ...defaultDualCitizenshipInfo.passports[0], _id: 1 };
        setDualCitizenshipInfo(prev => ({
          ...prev,
          passports: [initialPassport]
        }));
      }
    }
  };
  
  /**
   * Adds a new citizenship entry.
   */
  const addCitizenship = () => {
    setDualCitizenshipInfo(prev => {
      // If no citizenships array, create it
      if (!prev.citizenships) {
        // Use the first default citizenship as a template
        if (defaultDualCitizenshipInfo.citizenships && defaultDualCitizenshipInfo.citizenships.length > 0) {
          const initialCitizenship = { ...defaultDualCitizenshipInfo.citizenships[0], _id: 1 };
          return {
            ...prev,
            citizenships: [initialCitizenship]
          };
        }
        return prev;
      }
      
      // Get next _id based on the highest current _id
      const nextId = prev.citizenships.reduce((max, c) => Math.max(max, c._id), 0) + 1;
      
      // Create a new citizenship based on the first default citizenship
      const newCitizenship: CitizenshipDetail = {
        ...defaultDualCitizenshipInfo.citizenships![0],
        _id: nextId,
        // Reset values for the new entry
        country: { ...defaultDualCitizenshipInfo.citizenships![0].country, value: "" },
        howCitizenshipAcquired: { ...defaultDualCitizenshipInfo.citizenships![0].howCitizenshipAcquired, value: "" },
        citizenshipStart: { ...defaultDualCitizenshipInfo.citizenships![0].citizenshipStart, value: "" },
        isCitizenshipStartEstimated: { ...defaultDualCitizenshipInfo.citizenships![0].isCitizenshipStartEstimated, value: "No" },
        isRenounced: { ...defaultDualCitizenshipInfo.citizenships![0].isRenounced, value: "NO" },
        isCitizenshipHeld: { ...defaultDualCitizenshipInfo.citizenships![0].isCitizenshipHeld, value: "YES" },
      };
      
      // Limit to maximum of 2 citizenships as per form requirements
      if (prev.citizenships.length < 2) {
        return {
          ...prev,
          citizenships: [...prev.citizenships, newCitizenship]
        };
      }
      
      return prev;
    });
  };
  
  /**
   * Removes a citizenship entry at the specified index.
   */
  const removeCitizenship = (index: number) => {
    setDualCitizenshipInfo(prev => {
      if (!prev.citizenships || index < 0 || index >= prev.citizenships.length) {
        return prev;
      }
      
      const updatedCitizenships = [...prev.citizenships];
      updatedCitizenships.splice(index, 1);
      
      return {
        ...prev,
        citizenships: updatedCitizenships.length > 0 ? updatedCitizenships : undefined
      };
    });
  };
  
  /**
   * Adds a new passport entry.
   */
  const addPassport = () => {
    setDualCitizenshipInfo(prev => {
      // If no passports array, create it
      if (!prev.passports) {
        // Use the first default passport as a template
        if (defaultDualCitizenshipInfo.passports && defaultDualCitizenshipInfo.passports.length > 0) {
          const initialPassport = { ...defaultDualCitizenshipInfo.passports[0], _id: 1 };
          return {
            ...prev,
            passports: [initialPassport]
          };
        }
        return prev;
      }
      
      // Get next _id based on the highest current _id
      const nextId = prev.passports.reduce((max, p) => Math.max(max, p._id), 0) + 1;
      
      // Create a new passport based on the first default passport
      const newPassport: PassportDetail = {
        ...defaultDualCitizenshipInfo.passports![0],
        _id: nextId,
        // Reset values for the new entry
        countryIssued: { ...defaultDualCitizenshipInfo.passports![0].countryIssued, value: "" },
        passportDateIssued: { ...defaultDualCitizenshipInfo.passports![0].passportDateIssued, value: "" },
        isPassportDateEst: { ...defaultDualCitizenshipInfo.passports![0].isPassportDateEst, value: "No" },
        passportCity: { ...defaultDualCitizenshipInfo.passports![0].passportCity, value: "" },
        passportCountry: { ...defaultDualCitizenshipInfo.passports![0].passportCountry, value: "" },
        passportLName: { ...defaultDualCitizenshipInfo.passports![0].passportLName, value: "" },
        passportFName: { ...defaultDualCitizenshipInfo.passports![0].passportFName, value: "" },
        passportMName: { ...defaultDualCitizenshipInfo.passports![0].passportMName, value: "" },
        passportSuffix: { ...defaultDualCitizenshipInfo.passports![0].passportSuffix, value: "" },
        passportNumber: { ...defaultDualCitizenshipInfo.passports![0].passportNumber, value: "" },
        passportExpiration: { ...defaultDualCitizenshipInfo.passports![0].passportExpiration, value: "" },
        isExpirationEst: { ...defaultDualCitizenshipInfo.passports![0].isExpirationEst, value: "No" },
        isPassportUsed: { ...defaultDualCitizenshipInfo.passports![0].isPassportUsed, value: "NO" },
        passportUses: []
      };
      
      // Limit to maximum of 2 passports as per form requirements
      if (prev.passports.length < 2) {
        return {
          ...prev,
          passports: [...prev.passports, newPassport]
        };
      }
      
      return prev;
    });
  };
  
  /**
   * Removes a passport entry at the specified index.
   */
  const removePassport = (index: number) => {
    setDualCitizenshipInfo(prev => {
      if (!prev.passports || index < 0 || index >= prev.passports.length) {
        return prev;
      }
      
      const updatedPassports = [...prev.passports];
      updatedPassports.splice(index, 1);
      
      return {
        ...prev,
        passports: updatedPassports.length > 0 ? updatedPassports : undefined
      };
    });
  };
  
  /**
   * Adds a new passport use entry to a specific passport.
   */
  const addPassportUse = (passportIndex: number) => {
    setDualCitizenshipInfo(prev => {
      if (!prev.passports || passportIndex < 0 || passportIndex >= prev.passports.length) {
        return prev;
      }
      
      const updatedPassports = [...prev.passports];
      const passport = updatedPassports[passportIndex];
      
      // Initialize passport uses array if it doesn't exist
      if (!passport.passportUses) {
        passport.passportUses = [];
      }
      
      // Get next _id based on the highest current _id
      const nextId = passport.passportUses.reduce((max, u) => Math.max(max, u._id), 0) + 1;
      
      // Create a base template for a new passport use
      const basePassportUse: PassportUseDetail = {
        _id: nextId,
        passportCountry: {
          value: "",
          id: "",
          type: "PDFDropDown",
          label: `Country for passport use ${nextId}`
        },
        fromDate: {
          value: "",
          id: "",
          type: "PDFDateInput",
          label: `From date for passport use ${nextId}`
        },
        isFromDateEst: {
          value: "No",
          id: "",
          type: "PDFCheckBox",
          label: `Estimate from date for passport use ${nextId}`
        },
        toDate: {
          value: "",
          id: "",
          type: "PDFDateInput",
          label: `To date for passport use ${nextId}`
        },
        isToDateEst: {
          value: "No",
          id: "",
          type: "PDFCheckBox",
          label: `Estimate to date for passport use ${nextId}`
        },
        isVisitCurrent: {
          value: "No",
          id: "",
          type: "PDFCheckBox",
          label: `Present for passport use ${nextId}`
        }
      };
      
      // Use default passport use if available, otherwise use the base template
      let newPassportUse = basePassportUse;
      if (defaultDualCitizenshipInfo.passports && 
          defaultDualCitizenshipInfo.passports[0]?.passportUses && 
          defaultDualCitizenshipInfo.passports[0].passportUses.length > 0) {
        // Clone default and update _id
        newPassportUse = {
          ...defaultDualCitizenshipInfo.passports[0].passportUses[0],
          _id: nextId,
          // Reset values
          passportCountry: { 
            ...defaultDualCitizenshipInfo.passports[0].passportUses[0].passportCountry,
            value: ""
          },
          fromDate: {
            ...defaultDualCitizenshipInfo.passports[0].passportUses[0].fromDate,
            value: ""
          },
          toDate: {
            ...defaultDualCitizenshipInfo.passports[0].passportUses[0].toDate,
            value: ""
          }
        };
      }
      
      // Add the new passport use
      passport.passportUses.push(newPassportUse);
      
      return {
        ...prev,
        passports: updatedPassports
      };
    });
  };
  
  /**
   * Removes a passport use entry from a specific passport.
   */
  const removePassportUse = (passportIndex: number, useIndex: number) => {
    setDualCitizenshipInfo(prev => {
      if (!prev.passports || 
          passportIndex < 0 || 
          passportIndex >= prev.passports.length ||
          !prev.passports[passportIndex].passportUses ||
          useIndex < 0 ||
          useIndex >= prev.passports[passportIndex].passportUses!.length) {
        return prev;
      }
      
      const updatedPassports = [...prev.passports];
      const passport = updatedPassports[passportIndex];
      
      const updatedPassportUses = [...passport.passportUses!];
      updatedPassportUses.splice(useIndex, 1);
      
      passport.passportUses = updatedPassportUses.length > 0 ? updatedPassportUses : [];
      
      return {
        ...prev,
        passports: updatedPassports
      };
    });
  };
  
  /**
   * Effect hook to initialize with data from Redux store if available.
   */
  useEffect(() => {
    const storedData = getSectionData<DualCitizenshipInfo>('dualCitizenshipInfo');
    if (storedData) {
      setDualCitizenshipInfo(storedData);
    }
  }, [getSectionData]);

  return (
    <DualCitizenshipInfoContext.Provider
      value={{
        dualCitizenshipInfo,
        updateDualCitizenshipField,
        resetDualCitizenshipInfo,
        setHeldMultipleCitizenships,
        setHadNonUSPassport,
        addCitizenship,
        removeCitizenship,
        addPassport,
        removePassport,
        addPassportUse,
        removePassportUse
      }}
    >
      {children}
    </DualCitizenshipInfoContext.Provider>
  );
}; 