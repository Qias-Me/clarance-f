import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect
} from "react";
import { type Signature, type Section30_1, type Section30_2, type Section30_3 } from "api/interfaces/sections/signature";
import { signature as defaultSignature } from "../../state/contexts/sections/signature";
import { useFormContext } from "../../state/hooks/useFormContext";
import { BrowserFieldMappingService } from "api/service/BrowserFieldMappingService";

/**
 * SignatureInfo Context Implementation
 * 
 * This module provides the context and context provider for Section 30 (Signature/Continuation Space)
 * of the form, handling authorization for release of information, medical, and credit data.
 * 
 * The implementation follows the project pattern of creating dedicated context
 * providers for form sections, with support for conditional logic, field mapping,
 * and integration with the Redux store.
 */

// Define the context type
interface SignatureInfoContextType {
  /** The current signature information state */
  signatureInfo: Signature;
  /** Updates a specific field using dot notation path */
  updateSignatureField: (key: string, value: any) => void;
  /** Resets all signature fields to defaults */
  resetSignatureInfo: () => void;
  /** Toggles the information release authorization field */
  setInformationRelease: (value: "YES" | "NO") => void;
  /** Toggles the medical information release authorization field */
  setMedicalRelease: (value: "YES" | "NO") => void;
  /** Toggles the credit information release authorization field */
  setCreditRelease: (value: "YES" | "NO") => void;
  /** Adds a new Section 30.1 entry */
  addSection30_1: () => void;
  /** Removes a Section 30.1 entry at the specified index */
  removeSection30_1: (index: number) => void;
  /** Adds a new Section 30.2 entry */
  addSection30_2: () => void;
  /** Removes a Section 30.2 entry at the specified index */
  removeSection30_2: (index: number) => void;
  /** Adds a new Section 30.3 entry */
  addSection30_3: () => void;
  /** Removes a Section 30.3 entry at the specified index */
  removeSection30_3: (index: number) => void;
}

// Create the context with a default value
const SignatureInfoContext = createContext<SignatureInfoContextType | undefined>(undefined);

// Custom hook for consuming the context
export const useSignatureInfo = (): SignatureInfoContextType => {
  const context = useContext(SignatureInfoContext);
  if (!context) {
    throw new Error("useSignatureInfo must be used within a SignatureInfoProvider");
  }
  return context;
};

// Props for the provider component
interface SignatureInfoProviderProps {
  children: ReactNode;
}

/**
 * SignatureInfo Provider Component
 * 
 * This component manages the state and logic for signature information,
 * including all signature sections and their related fields.
 */
export const SignatureInfoProvider: React.FC<SignatureInfoProviderProps> = ({
  children
}) => {
  // Initial state using the default values
  const [signatureInfo, setSignatureInfo] = useState<Signature>(defaultSignature);
  
  // Access the form context for integration with Redux store
  const { updateField, getSectionData } = useFormContext();
  
  // Create instance of the FieldMappingService for field ID handling
  const fieldMappingService = new BrowserFieldMappingService();
  
  /**
   * Updates a specific field in the signature info using dot notation path.
   * Also updates the Redux store via updateField.
   */
  const updateSignatureField = (fieldPath: string, value: any) => {
    setSignatureInfo((prev) => {
      const updatedState = { ...prev };
      
      // Handle nested paths with dot notation (e.g., "section30_1.0.fullName.value")
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
      updateField(`signatureInfo.${fieldPath}`, value);
      
      return updatedState;
    });
  };
  
  /**
   * Resets the signature info to the default values.
   */
  const resetSignatureInfo = () => {
    setSignatureInfo(defaultSignature);
  };
  
  /**
   * Sets the information release authorization field and handles conditional display.
   */
  const setInformationRelease = (value: "YES" | "NO") => {
    updateSignatureField('information.value', value);
    
    // Handle conditional section 30.1 display
    if (value === "YES" && !signatureInfo.section30_1) {
      // Initialize with default section if value is YES
      const initialSection30_1 = {
        _id: 1,
        fullName: { value: "", id: "", type: "PDFTextField", label: "Full name" },
        dateSigned: { value: "", id: "", type: "PDFDateInput", label: "Date signed" },
        otherNamesUsed: { value: "", id: "", type: "PDFTextField", label: "Other names used" },
        address: {
          street: { value: "", id: "", type: "PDFTextField", label: "Street address" },
          city: { value: "", id: "", type: "PDFTextField", label: "City" },
          state: { value: "", id: "", type: "PDFDropDown", label: "State" },
          zipCode: { value: "", id: "", type: "PDFTextField", label: "ZIP Code" },
          country: { value: "", id: "", type: "PDFDropDown", label: "Country" },
        },
        telephoneFieldNumber: { value: "", id: "", type: "PDFTextField", label: "Telephone number" },
      };

      setSignatureInfo(prev => ({
        ...prev,
        section30_1: [initialSection30_1]
      }));
    } else if (value === "NO") {
      // Clear section30_1 if value is NO
      setSignatureInfo(prev => ({
        ...prev,
        section30_1: undefined
      }));
    }
  };
  
  /**
   * Sets the medical release authorization field and handles conditional display.
   */
  const setMedicalRelease = (value: "YES" | "NO") => {
    updateSignatureField('medical.value', value);
    
    // Handle conditional section 30.2 display
    if (value === "YES" && !signatureInfo.section30_2) {
      // Initialize with default section if value is YES
      const initialSection30_2 = {
        _id: 1,
        fullName: { value: "", id: "", type: "PDFTextField", label: "Full name" },
        dateSigned: { value: "", id: "", type: "PDFDateInput", label: "Date signed" },
        otherNamesUsed: { value: "", id: "", type: "PDFTextField", label: "Other names used" },
        address: {
          street: { value: "", id: "", type: "PDFTextField", label: "Street address" },
          city: { value: "", id: "", type: "PDFTextField", label: "City" },
          state: { value: "", id: "", type: "PDFDropDown", label: "State" },
          zipCode: { value: "", id: "", type: "PDFTextField", label: "ZIP Code" },
          country: { value: "", id: "", type: "PDFDropDown", label: "Country" },
        },
        telephoneFieldNumber: { value: "", id: "", type: "PDFTextField", label: "Telephone number" },
      };

      setSignatureInfo(prev => ({
        ...prev,
        section30_2: [initialSection30_2]
      }));
    } else if (value === "NO") {
      // Clear section30_2 if value is NO
      setSignatureInfo(prev => ({
        ...prev,
        section30_2: undefined
      }));
    }
  };
  
  /**
   * Sets the credit release authorization field and handles conditional display.
   */
  const setCreditRelease = (value: "YES" | "NO") => {
    updateSignatureField('credit.value', value);
    
    // Handle conditional section 30.3 display
    if (value === "YES" && !signatureInfo.section30_3) {
      // Initialize with default section if value is YES
      const initialSection30_3 = {
        _id: 1,
        fullName: { value: "", id: "", type: "PDFTextField", label: "Full name" },
        dateSigned: { value: "", id: "", type: "PDFDateInput", label: "Date signed" },
      };

      setSignatureInfo(prev => ({
        ...prev,
        section30_3: [initialSection30_3]
      }));
    } else if (value === "NO") {
      // Clear section30_3 if value is NO
      setSignatureInfo(prev => ({
        ...prev,
        section30_3: undefined
      }));
    }
  };
  
  /**
   * Adds a new Section 30.1 entry.
   */
  const addSection30_1 = () => {
    setSignatureInfo(prev => {
      // If no section30_1 array, create it
      if (!prev.section30_1) {
        const initialSection30_1 = {
          _id: 1,
          fullName: { value: "", id: "", type: "PDFTextField", label: "Full name" },
          dateSigned: { value: "", id: "", type: "PDFDateInput", label: "Date signed" },
          otherNamesUsed: { value: "", id: "", type: "PDFTextField", label: "Other names used" },
          address: {
            street: { value: "", id: "", type: "PDFTextField", label: "Street address" },
            city: { value: "", id: "", type: "PDFTextField", label: "City" },
            state: { value: "", id: "", type: "PDFDropDown", label: "State" },
            zipCode: { value: "", id: "", type: "PDFTextField", label: "ZIP Code" },
            country: { value: "", id: "", type: "PDFDropDown", label: "Country" },
          },
          telephoneFieldNumber: { value: "", id: "", type: "PDFTextField", label: "Telephone number" },
        };
        return {
          ...prev,
          section30_1: [initialSection30_1]
        };
      }
      
      // Get next _id based on the highest current _id
      const nextId = prev.section30_1.reduce((max, c) => Math.max(max, c._id), 0) + 1;
      
      // Create a new section30_1 entry
      const newSection30_1: Section30_1 = {
        _id: nextId,
        fullName: { value: "", id: "", type: "PDFTextField", label: "Full name" },
        dateSigned: { value: "", id: "", type: "PDFDateInput", label: "Date signed" },
        otherNamesUsed: { value: "", id: "", type: "PDFTextField", label: "Other names used" },
        address: {
          street: { value: "", id: "", type: "PDFTextField", label: "Street address" },
          city: { value: "", id: "", type: "PDFTextField", label: "City" },
          state: { value: "", id: "", type: "PDFDropDown", label: "State" },
          zipCode: { value: "", id: "", type: "PDFTextField", label: "ZIP Code" },
          country: { value: "", id: "", type: "PDFDropDown", label: "Country" },
        },
        telephoneFieldNumber: { value: "", id: "", type: "PDFTextField", label: "Telephone number" },
      };
      
      return {
        ...prev,
        section30_1: [...prev.section30_1, newSection30_1]
      };
    });
  };
  
  /**
   * Removes a Section 30.1 entry at the specified index.
   */
  const removeSection30_1 = (index: number) => {
    setSignatureInfo(prev => {
      if (!prev.section30_1 || index < 0 || index >= prev.section30_1.length) {
        return prev;
      }
      
      const updatedSection30_1 = [...prev.section30_1];
      updatedSection30_1.splice(index, 1);
      
      return {
        ...prev,
        section30_1: updatedSection30_1.length > 0 ? updatedSection30_1 : undefined
      };
    });
  };
  
  /**
   * Adds a new Section 30.2 entry.
   */
  const addSection30_2 = () => {
    setSignatureInfo(prev => {
      // If no section30_2 array, create it
      if (!prev.section30_2) {
        const initialSection30_2 = {
          _id: 1,
          fullName: { value: "", id: "", type: "PDFTextField", label: "Full name" },
          dateSigned: { value: "", id: "", type: "PDFDateInput", label: "Date signed" },
          otherNamesUsed: { value: "", id: "", type: "PDFTextField", label: "Other names used" },
          address: {
            street: { value: "", id: "", type: "PDFTextField", label: "Street address" },
            city: { value: "", id: "", type: "PDFTextField", label: "City" },
            state: { value: "", id: "", type: "PDFDropDown", label: "State" },
            zipCode: { value: "", id: "", type: "PDFTextField", label: "ZIP Code" },
            country: { value: "", id: "", type: "PDFDropDown", label: "Country" },
          },
          telephoneFieldNumber: { value: "", id: "", type: "PDFTextField", label: "Telephone number" },
        };
        return {
          ...prev,
          section30_2: [initialSection30_2]
        };
      }
      
      // Get next _id based on the highest current _id
      const nextId = prev.section30_2.reduce((max, c) => Math.max(max, c._id), 0) + 1;
      
      // Create a new section30_2 entry
      const newSection30_2: Section30_2 = {
        _id: nextId,
        fullName: { value: "", id: "", type: "PDFTextField", label: "Full name" },
        dateSigned: { value: "", id: "", type: "PDFDateInput", label: "Date signed" },
        otherNamesUsed: { value: "", id: "", type: "PDFTextField", label: "Other names used" },
        address: {
          street: { value: "", id: "", type: "PDFTextField", label: "Street address" },
          city: { value: "", id: "", type: "PDFTextField", label: "City" },
          state: { value: "", id: "", type: "PDFDropDown", label: "State" },
          zipCode: { value: "", id: "", type: "PDFTextField", label: "ZIP Code" },
          country: { value: "", id: "", type: "PDFDropDown", label: "Country" },
        },
        telephoneFieldNumber: { value: "", id: "", type: "PDFTextField", label: "Telephone number" },
      };
      
      return {
        ...prev,
        section30_2: [...prev.section30_2, newSection30_2]
      };
    });
  };
  
  /**
   * Removes a Section 30.2 entry at the specified index.
   */
  const removeSection30_2 = (index: number) => {
    setSignatureInfo(prev => {
      if (!prev.section30_2 || index < 0 || index >= prev.section30_2.length) {
        return prev;
      }
      
      const updatedSection30_2 = [...prev.section30_2];
      updatedSection30_2.splice(index, 1);
      
      return {
        ...prev,
        section30_2: updatedSection30_2.length > 0 ? updatedSection30_2 : undefined
      };
    });
  };
  
  /**
   * Adds a new Section 30.3 entry.
   */
  const addSection30_3 = () => {
    setSignatureInfo(prev => {
      // If no section30_3 array, create it
      if (!prev.section30_3) {
        const initialSection30_3 = {
          _id: 1,
          fullName: { value: "", id: "", type: "PDFTextField", label: "Full name" },
          dateSigned: { value: "", id: "", type: "PDFDateInput", label: "Date signed" },
        };
        return {
          ...prev,
          section30_3: [initialSection30_3]
        };
      }
      
      // Get next _id based on the highest current _id
      const nextId = prev.section30_3.reduce((max, c) => Math.max(max, c._id), 0) + 1;
      
      // Create a new section30_3 entry
      const newSection30_3: Section30_3 = {
        _id: nextId,
        fullName: { value: "", id: "", type: "PDFTextField", label: "Full name" },
        dateSigned: { value: "", id: "", type: "PDFDateInput", label: "Date signed" },
      };
      
      return {
        ...prev,
        section30_3: [...prev.section30_3, newSection30_3]
      };
    });
  };
  
  /**
   * Removes a Section 30.3 entry at the specified index.
   */
  const removeSection30_3 = (index: number) => {
    setSignatureInfo(prev => {
      if (!prev.section30_3 || index < 0 || index >= prev.section30_3.length) {
        return prev;
      }
      
      const updatedSection30_3 = [...prev.section30_3];
      updatedSection30_3.splice(index, 1);
      
      return {
        ...prev,
        section30_3: updatedSection30_3.length > 0 ? updatedSection30_3 : undefined
      };
    });
  };
  
  /**
   * Effect hook to initialize with data from Redux store if available.
   */
  useEffect(() => {
    const storedData = getSectionData<Signature>('signatureInfo');
    if (storedData) {
      setSignatureInfo(storedData);
    }
  }, [getSectionData]);

  return (
    <SignatureInfoContext.Provider
      value={{
        signatureInfo,
        updateSignatureField,
        resetSignatureInfo,
        setInformationRelease,
        setMedicalRelease,
        setCreditRelease,
        addSection30_1,
        removeSection30_1,
        addSection30_2,
        removeSection30_2,
        addSection30_3,
        removeSection30_3
      }}
    >
      {children}
    </SignatureInfoContext.Provider>
  );
}; 