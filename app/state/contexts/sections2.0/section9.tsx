/**
 * Section 9: Citizenship - TEMPORARILY DISABLED FOR TESTING
 *
 * This file is temporarily disabled to focus on Section 29 testing.
 * The original implementation had import issues that were blocking the development server.
 */

import React, { createContext, useContext, type ReactNode } from "react";

// Minimal stub implementation for testing
interface Section9ContextType {
  section9Data: any;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;
}

const Section9Context = createContext<Section9ContextType | null>(null);

export const Section9Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const contextValue: Section9ContextType = {
    section9Data: {},
    isLoading: false,
    errors: {},
    isDirty: false,
  };

  return (
    <Section9Context.Provider value={contextValue}>
      {children}
    </Section9Context.Provider>
  );
};

export const useSection9 = (): Section9ContextType => {
  const context = useContext(Section9Context);
  if (!context) {
    throw new Error('useSection9 must be used within a Section9Provider');
  }
  return context;
};

// ============================================================================
// SECTION 9 CONTEXT INTERFACE
// ============================================================================

interface Section9ContextType {
 // Core State
 section9Data: Section9;
 isLoading: boolean;
 errors: Record<string, string>;
 isDirty: boolean;

 // Section-Specific CRUD Operations
 updateCitizenshipStatus: (
  status:
   | "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth"
   | "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country"
   | "I am a naturalized U.S. citizen"
   | "I am a derived U.S. citizen"
   | "I am not a U.S. citizen"
 ) => void;
 updateBornInUSInfo: (updates: Partial<BornInUSInfo>) => void;
 updateNaturalizedCitizenInfo: (updates: Partial<NaturalizedCitizenInfo>) => void;
 updateDerivedCitizenInfo: (updates: Partial<DerivedCitizenInfo>) => void;
 updateNonUSCitizenInfo: (updates: Partial<NonUSCitizenInfo>) => void;
 updateFieldValue: (subsection: string, fieldPath: string, newValue: any) => void;

 // Utility
 resetSection: () => void;
 loadSection: (data: Section9) => void;
 validateSection: () => ValidationResult;
 getChanges: () => any;

 // SF86Form Integration
 markComplete: () => void;
 markIncomplete: () => void;
 triggerGlobalValidation: () => ValidationResult;
 getGlobalFormState: () => any;
 navigateToSection: (sectionId: string) => void;
 saveForm: () => Promise<void>;
 emitEvent: (event: any) => void;
 subscribeToEvents: (eventType: string, callback: Function) => () => void;
 notifyChange: (changeType: string, payload: any) => void;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

const createInitialSection9State = (): Section9 => ({
 _id: 9,
 citizenshipStatus: {
  status: {
   id: SECTION9_FIELD_IDS.CITIZENSHIP_STATUS,
   type: "radio",
   label: "Select your citizenship status",
   value: "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth",
   isDirty: false,
   isValid: true,
   errors: []
  }
 }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const clearFieldsRecursively = (obj: any) => {
 if (!obj || typeof obj !== 'object') return obj;

 const newObj = cloneDeep(obj);

 for (const key in newObj) {
  if (newObj[key] && typeof newObj[key] === 'object') {
   if ('value' in newObj[key] && 'type' in newObj[key]) {
    // This is a Field object, reset its value
    if (newObj[key].type === 'checkbox' || newObj[key].type === 'radio') {
     newObj[key].value = false;
    } else {
     newObj[key].value = '';
    }
    newObj[key].isDirty = false;
    newObj[key].isValid = true;
    newObj[key].errors = [];
   } else {
    // Recursive call for nested objects
    newObj[key] = clearFieldsRecursively(newObj[key]);
   }
  }
 }

 return newObj;
};

// ============================================================================
// CONTEXT PROVIDER
// ============================================================================

interface Section9ProviderProps {
 children: ReactNode;
}

const Section9Context = createContext<Section9ContextType | null>(null);

export const Section9Provider: React.FC<Section9ProviderProps> = ({ children }) => {
 const [section9Data, setSection9Data] = useState<Section9>(createInitialSection9State());
 const [isLoading, setIsLoading] = useState<boolean>(false);
 const [errors, setErrors] = useState<Record<string, string>>({});
 const [isDirty, setIsDirty] = useState<boolean>(false);

 // Integration with the global SF86FormContext
 const {
  updateSectionData,
  getSectionData,
  markSectionComplete,
  markSectionIncomplete,
  validateCompleteForm,
  getFormState,
  navigateToSection,
  saveForm: globalSaveForm,
  emitEvent,
  subscribeToEvents,
  notifyChange
 } = useSection86FormIntegration(9);

 // ========================================================================
 // CRUD OPERATIONS
 // ========================================================================

 const updateCitizenshipStatus = useCallback((
  status:
   | "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth"
   | "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country"
   | "I am a naturalized U.S. citizen"
   | "I am a derived U.S. citizen"
   | "I am not a U.S. citizen"
 ) => {
  setSection9Data(prevData => {
   const newData = cloneDeep(prevData);
   newData.citizenshipStatus.status.value = status;
   newData.citizenshipStatus.status.isDirty = true;

   // Create or reset appropriate subsection based on citizenship status
   if (status === "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country") {
    newData.citizenshipStatus.bornToUSParents = newData.citizenshipStatus.bornToUSParents || createBornInUSInfo();
    // Clear other subsections
    delete newData.citizenshipStatus.naturalizedCitizen;
    delete newData.citizenshipStatus.derivedCitizen;
    delete newData.citizenshipStatus.nonUSCitizen;
   } else if (status === "I am a naturalized U.S. citizen") {
    newData.citizenshipStatus.naturalizedCitizen = newData.citizenshipStatus.naturalizedCitizen || createNaturalizedCitizenInfo();
    // Clear other subsections
    delete newData.citizenshipStatus.bornToUSParents;
    delete newData.citizenshipStatus.derivedCitizen;
    delete newData.citizenshipStatus.nonUSCitizen;
   } else if (status === "I am a derived U.S. citizen") {
    newData.citizenshipStatus.derivedCitizen = newData.citizenshipStatus.derivedCitizen || createDerivedCitizenInfo();
    // Clear other subsections
    delete newData.citizenshipStatus.bornToUSParents;
    delete newData.citizenshipStatus.naturalizedCitizen;
    delete newData.citizenshipStatus.nonUSCitizen;
   } else if (status === "I am not a U.S. citizen") {
    newData.citizenshipStatus.nonUSCitizen = newData.citizenshipStatus.nonUSCitizen || createNonUSCitizenInfo();
    // Clear other subsections
    delete newData.citizenshipStatus.bornToUSParents;
    delete newData.citizenshipStatus.naturalizedCitizen;
    delete newData.citizenshipStatus.derivedCitizen;
   } else {
    // U.S. citizen by birth in the U.S. - clear all subsections
    delete newData.citizenshipStatus.bornToUSParents;
    delete newData.citizenshipStatus.naturalizedCitizen;
    delete newData.citizenshipStatus.derivedCitizen;
    delete newData.citizenshipStatus.nonUSCitizen;
   }

   return newData;
  });
  setIsDirty(true);
 }, []);

 const updateBornInUSInfo = useCallback((updates: Partial<BornInUSInfo>) => {
  setSection9Data(prevData => {
   const newData = cloneDeep(prevData);

   if (!newData.citizenshipStatus.bornToUSParents) {
    newData.citizenshipStatus.bornToUSParents = createBornInUSInfo();
   }

   // Apply all updates to the subsection
   for (const [key, value] of Object.entries(updates)) {
    if (key in newData.citizenshipStatus.bornToUSParents!) {
     // @ts-ignore - We're checking if the key exists
     newData.citizenshipStatus.bornToUSParents[key] = value;
    }
   }

   return newData;
  });
  setIsDirty(true);
 }, []);

 const updateNaturalizedCitizenInfo = useCallback((updates: Partial<NaturalizedCitizenInfo>) => {
  setSection9Data(prevData => {
   const newData = cloneDeep(prevData);

   if (!newData.citizenshipStatus.naturalizedCitizen) {
    newData.citizenshipStatus.naturalizedCitizen = createNaturalizedCitizenInfo();
   }

   // Apply all updates to the subsection
   for (const [key, value] of Object.entries(updates)) {
    if (key in newData.citizenshipStatus.naturalizedCitizen!) {
     // @ts-ignore - We're checking if the key exists
     newData.citizenshipStatus.naturalizedCitizen[key] = value;
    }
   }

   return newData;
  });
  setIsDirty(true);
 }, []);

 const updateDerivedCitizenInfo = useCallback((updates: Partial<DerivedCitizenInfo>) => {
  setSection9Data(prevData => {
   const newData = cloneDeep(prevData);

   if (!newData.citizenshipStatus.derivedCitizen) {
    newData.citizenshipStatus.derivedCitizen = createDerivedCitizenInfo();
   }

   // Apply all updates to the subsection
   for (const [key, value] of Object.entries(updates)) {
    if (key in newData.citizenshipStatus.derivedCitizen!) {
     // @ts-ignore - We're checking if the key exists
     newData.citizenshipStatus.derivedCitizen[key] = value;
    }
   }

   return newData;
  });
  setIsDirty(true);
 }, []);

 const updateNonUSCitizenInfo = useCallback((updates: Partial<NonUSCitizenInfo>) => {
  setSection9Data(prevData => {
   const newData = cloneDeep(prevData);

   if (!newData.citizenshipStatus.nonUSCitizen) {
    newData.citizenshipStatus.nonUSCitizen = createNonUSCitizenInfo();
   }

   // Apply all updates to the subsection
   for (const [key, value] of Object.entries(updates)) {
    if (key in newData.citizenshipStatus.nonUSCitizen!) {
     // @ts-ignore - We're checking if the key exists
     newData.citizenshipStatus.nonUSCitizen[key] = value;
    }
   }

   return newData;
  });
  setIsDirty(true);
 }, []);

 const updateFieldValue = useCallback((subsection: string, fieldPath: string, newValue: any) => {
  setSection9Data(prevData => {
   const newData = cloneDeep(prevData);

   const fullPath = `citizenshipStatus.${subsection}.${fieldPath}`;

   try {
    // Navigate through the object hierarchy to find the field
    const pathParts = fieldPath.split('.');
    let current: any = newData.citizenshipStatus;

    // Get to the parent object of the field
    if (subsection === 'status') {
     current.status.value = newValue;
     current.status.isDirty = true;
    } else if (subsection === 'bornToUSParents' && newData.citizenshipStatus.bornToUSParents) {
     let currentObj = newData.citizenshipStatus.bornToUSParents;

     for (let i = 0; i < pathParts.length - 1; i++) {
      currentObj = currentObj[pathParts[i] as keyof BornInUSInfo];
     }

     const lastPart = pathParts[pathParts.length - 1];
     if (currentObj && typeof currentObj === 'object' && lastPart in currentObj) {
      currentObj[lastPart].value = newValue;
      currentObj[lastPart].isDirty = true;
     }
    } else if (subsection === 'naturalizedCitizen' && newData.citizenshipStatus.naturalizedCitizen) {
     let currentObj = newData.citizenshipStatus.naturalizedCitizen;

     for (let i = 0; i < pathParts.length - 1; i++) {
      currentObj = currentObj[pathParts[i] as keyof NaturalizedCitizenInfo];
     }

     const lastPart = pathParts[pathParts.length - 1];
     if (currentObj && typeof currentObj === 'object' && lastPart in currentObj) {
      currentObj[lastPart].value = newValue;
      currentObj[lastPart].isDirty = true;
     }
    } else if (subsection === 'derivedCitizen' && newData.citizenshipStatus.derivedCitizen) {
     let currentObj = newData.citizenshipStatus.derivedCitizen;

     for (let i = 0; i < pathParts.length - 1; i++) {
      currentObj = currentObj[pathParts[i] as keyof DerivedCitizenInfo];
     }

     const lastPart = pathParts[pathParts.length - 1];
     if (currentObj && typeof currentObj === 'object' && lastPart in currentObj) {
      currentObj[lastPart].value = newValue;
      currentObj[lastPart].isDirty = true;
     }
    } else if (subsection === 'nonUSCitizen' && newData.citizenshipStatus.nonUSCitizen) {
     let currentObj = newData.citizenshipStatus.nonUSCitizen;

     for (let i = 0; i < pathParts.length - 1; i++) {
      currentObj = currentObj[pathParts[i] as keyof NonUSCitizenInfo];
     }

     const lastPart = pathParts[pathParts.length - 1];
     if (currentObj && typeof currentObj === 'object' && lastPart in currentObj) {
      currentObj[lastPart].value = newValue;
      currentObj[lastPart].isDirty = true;
     }
    }
   } catch (error) {
    console.error(`Error updating field at path ${fullPath}:`, error);
   }

   return newData;
  });
  setIsDirty(true);
 }, []);

 // ========================================================================
 // UTILITY FUNCTIONS
 // ========================================================================

 const resetSection = useCallback(() => {
  setSection9Data(createInitialSection9State());
  setErrors({});
  setIsDirty(false);
 }, []);

 const loadSection = useCallback((data: Section9) => {
  setSection9Data(data);
  setIsDirty(false);
 }, []);

 const validateSection = useCallback((): ValidationResult => {
  const newErrors: Record<string, string> = {};
  const validationErrors: ValidationError[] = [];

  // Validate citizenship status selection
  if (!section9Data.citizenshipStatus.status.value) {
   newErrors["citizenshipStatus.status"] = "Citizenship status is required";
   validationErrors.push({
    field: "citizenshipStatus.status",
    message: "Citizenship status is required",
    severity: "error"
   });
  }

  // Validate subsection based on selected status
  const status = section9Data.citizenshipStatus.status.value;

  if (status === "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country") {
   if (!section9Data.citizenshipStatus.bornToUSParents) {
    newErrors["citizenshipStatus.bornToUSParents"] = "Born to US Parents information is required";
    validationErrors.push({
     field: "citizenshipStatus.bornToUSParents",
     message: "Born to US Parents information is required",
     severity: "error"
    });
   } else {
    // Validate document number
    if (!section9Data.citizenshipStatus.bornToUSParents.documentNumber.value) {
     newErrors["citizenshipStatus.bornToUSParents.documentNumber"] = "Document number is required";
     validationErrors.push({
      field: "citizenshipStatus.bornToUSParents.documentNumber",
      message: "Document number is required",
      severity: "error"
     });
    }

    // Validate document issue date
    if (!section9Data.citizenshipStatus.bornToUSParents.documentIssueDate.value) {
     newErrors["citizenshipStatus.bornToUSParents.documentIssueDate"] = "Document issue date is required";
     validationErrors.push({
      field: "citizenshipStatus.bornToUSParents.documentIssueDate",
      message: "Document issue date is required",
      severity: "error"
     });
    }

    // Validate name fields
    if (!section9Data.citizenshipStatus.bornToUSParents.nameOnDocument.lastName.value) {
     newErrors["citizenshipStatus.bornToUSParents.nameOnDocument.lastName"] = "Last name is required";
     validationErrors.push({
      field: "citizenshipStatus.bornToUSParents.nameOnDocument.lastName",
      message: "Last name is required",
      severity: "error"
     });
    }

    if (!section9Data.citizenshipStatus.bornToUSParents.nameOnDocument.firstName.value) {
     newErrors["citizenshipStatus.bornToUSParents.nameOnDocument.firstName"] = "First name is required";
     validationErrors.push({
      field: "citizenshipStatus.bornToUSParents.nameOnDocument.firstName",
      message: "First name is required",
      severity: "error"
     });
    }
   }
  } else if (status === "I am a naturalized U.S. citizen") {
   if (!section9Data.citizenshipStatus.naturalizedCitizen) {
    newErrors["citizenshipStatus.naturalizedCitizen"] = "Naturalized Citizen information is required";
    validationErrors.push({
     field: "citizenshipStatus.naturalizedCitizen",
     message: "Naturalized Citizen information is required",
     severity: "error"
    });
   } else {
    // Validate certificate number
    if (!section9Data.citizenshipStatus.naturalizedCitizen.naturalizedCertificateNumber.value) {
     newErrors["citizenshipStatus.naturalizedCitizen.naturalizedCertificateNumber"] = "Certificate number is required";
     validationErrors.push({
      field: "citizenshipStatus.naturalizedCitizen.naturalizedCertificateNumber",
      message: "Certificate number is required",
      severity: "error"
     });
    }

    // Validate certificate issue date
    if (!section9Data.citizenshipStatus.naturalizedCitizen.certificateIssueDate.value) {
     newErrors["citizenshipStatus.naturalizedCitizen.certificateIssueDate"] = "Certificate issue date is required";
     validationErrors.push({
      field: "citizenshipStatus.naturalizedCitizen.certificateIssueDate",
      message: "Certificate issue date is required",
      severity: "error"
     });
    }
   }
  }
  // Add validation for other citizenship types as needed

  setErrors(newErrors);

  return {
   isValid: Object.keys(newErrors).length === 0,
   errors: validationErrors
  };
 }, [section9Data]);

 const getChanges = useCallback(() => {
  // Here you would implement logic to compare current state with original state
  return isDirty ? section9Data : null;
 }, [section9Data, isDirty]);

 // ========================================================================
 // SF86FORM INTEGRATION
 // ========================================================================

 // Update global form state when local state changes
 React.useEffect(() => {
  if (isDirty) {
   updateSectionData(section9Data);
  }
 }, [section9Data, updateSectionData, isDirty]);

 // Load section data from global state on initial mount
 React.useEffect(() => {
  const storedData = getSectionData();
  if (storedData) {
   setSection9Data(storedData as Section9);
  }
 }, [getSectionData]);

 const markComplete = useCallback(() => {
  const validation = validateSection();
  if (validation.isValid) {
   markSectionComplete();
   return true;
  }
  return false;
 }, [validateSection, markSectionComplete]);

 const markIncomplete = useCallback(() => {
  markSectionIncomplete();
 }, [markSectionIncomplete]);

 const triggerGlobalValidation = useCallback(() => {
  return validateCompleteForm();
 }, [validateCompleteForm]);

 const getGlobalFormState = useCallback(() => {
  return getFormState();
 }, [getFormState]);

 const saveForm = useCallback(async () => {
  await globalSaveForm();
 }, [globalSaveForm]);

 // ========================================================================
 // CONTEXT VALUE
 // ========================================================================

 const contextValue = useMemo<Section9ContextType>(() => ({
  // Core State
  section9Data,
  isLoading,
  errors,
  isDirty,

  // Section-Specific CRUD Operations
  updateCitizenshipStatus,
  updateBornInUSInfo,
  updateNaturalizedCitizenInfo,
  updateDerivedCitizenInfo,
  updateNonUSCitizenInfo,
  updateFieldValue,

  // Utility
  resetSection,
  loadSection,
  validateSection,
  getChanges,

  // SF86Form Integration
  markComplete,
  markIncomplete,
  triggerGlobalValidation,
  getGlobalFormState,
  navigateToSection,
  saveForm,
  emitEvent,
  subscribeToEvents,
  notifyChange
 }), [
  section9Data,
  isLoading,
  errors,
  isDirty,
  updateCitizenshipStatus,
  updateBornInUSInfo,
  updateNaturalizedCitizenInfo,
  updateDerivedCitizenInfo,
  updateNonUSCitizenInfo,
  updateFieldValue,
  resetSection,
  loadSection,
  validateSection,
  getChanges,
  markComplete,
  markIncomplete,
  triggerGlobalValidation,
  getGlobalFormState,
  navigateToSection,
  saveForm,
  emitEvent,
  subscribeToEvents,
  notifyChange
 ]);

 return (
  <Section9Context.Provider value={contextValue}>
   {children}
  </Section9Context.Provider>
 );
};

// ============================================================================
// HOOK TO ACCESS CONTEXT
// ============================================================================

export const useSection9 = (): Section9ContextType => {
 const context = useContext(Section9Context);
 if (!context) {
  throw new Error("useSection9 must be used within a Section9Provider");
 }
 return context;
};