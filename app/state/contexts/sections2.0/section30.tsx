// /**
//  * Section 30: General Remarks (Continuation Sheets)
//  *
//  * Complete implementation of SF-86 Section 30 using the scalable architecture
//  * with SF86FormContext integration, comprehensive CRUD operations, and validation.
//  */

// import React, {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
//   useMemo,
//   type ReactNode,
// } from "react";
// import cloneDeep from "lodash.clonedeep";
// import set from "lodash.set";
// import { useSection86FormIntegration } from "../shared/section-context-integration";
// import type { ValidationResult, ValidationError } from "../shared/base-interfaces";
// import {
//   type Section30,
//   type ContinuationEntry,
//   type Section30SubsectionKey,
//   type ContinuationPersonalInfo,
//   SECTION30_FIELD_IDS
// } from "../../../../api/interfaces/sections2.0/section30";

// // ============================================================================
// // SECTION 30 CONTEXT INTERFACE
// // ============================================================================

// interface Section30ContextType {
//   // Core State
//   section30Data: Section30;
//   isLoading: boolean;
//   errors: Record<string, string>;
//   isDirty: boolean;

//   // Section-Specific CRUD Operations
//   updateContinuationSheetsFlag: (hasValue: "YES" | "NO") => void;
//   addContinuationEntry: () => void;
//   removeContinuationEntry: (entryIndex: number) => void;
//   updateFieldValue: (entryIndex: number, fieldPath: string, newValue: any) => void;

//   // Enhanced Entry Management
//   getContinuationCount: () => number;
//   getContinuationEntry: (entryIndex: number) => ContinuationEntry | null;
//   moveContinuationEntry: (fromIndex: number, toIndex: number) => void;
//   duplicateContinuationEntry: (entryIndex: number) => void;
//   clearContinuationEntry: (entryIndex: number) => void;
//   bulkUpdateFields: (entryIndex: number, fieldUpdates: Record<string, any>) => void;

//   // Utility
//   resetSection: () => void;
//   loadSection: (data: Section30) => void;
//   validateSection: () => ValidationResult;
//   getChanges: () => any;

//   // SF86Form Integration
//   markComplete: () => void;
//   markIncomplete: () => void;
//   triggerGlobalValidation: () => ValidationResult;
//   getGlobalFormState: () => any;
//   navigateToSection: (sectionId: string) => void;
//   saveForm: () => Promise<void>;
//   emitEvent: (event: any) => void;
//   subscribeToEvents: (eventType: string, callback: Function) => () => void;
//   notifyChange: (changeType: string, payload: any) => void;
// }

// // ============================================================================
// // INITIAL STATE CREATION
// // ============================================================================

// const createInitialSection30State = (): Section30 => ({
//   _id: 30,
//   continuationSheets: {
//     hasContinuationSheets: {
//       id: "form1[0].continuation1[0].RadioButtonList[0]", // Using a placeholder ID
//       type: "radio",
//       label: "Do you need to provide additional information for any section?",
//       value: "NO",
//       isDirty: false,
//       isValid: true,
//       errors: []
//     },
//     entries: []
//   }
// });

// // ============================================================================
// // ENTRY TEMPLATE CREATORS
// // ============================================================================

// const createContinuationEntryTemplate = (entryIndex: number): ContinuationEntry => ({
//   _id: Date.now() + Math.random(),
//   remarks: {
//     id: SECTION30_FIELD_IDS.REMARKS,
//     type: "textarea",
//     label: "Use the space below to continue answers or a blank sheet(s) of paper. Include your name and SSN at the top of each blank sheet(s). Before each answer, identify the number of the item and attempt to maintain sequential order and question format.",
//     value: "",
//     isDirty: false,
//     isValid: true,
//     errors: []
//   },
//   personalInfo: {
//     fullName: {
//       id: SECTION30_FIELD_IDS.FULL_NAME_PAGE2, 
//       type: "text",
//       label: "Full Name (Type or Print legibly)",
//       value: "",
//       isDirty: false,
//       isValid: true,
//       errors: []
//     },
//     otherNamesUsed: {
//       id: SECTION30_FIELD_IDS.OTHER_NAMES_USED_PAGE2,
//       type: "text",
//       label: "Other names used",
//       value: "",
//       isDirty: false,
//       isValid: true,
//       errors: []
//     },
//     dateOfBirth: {
//       id: SECTION30_FIELD_IDS.DATE_OF_BIRTH_PAGE2,
//       type: "date",
//       label: "Date of Birth (mm/dd/yyyy)",
//       value: "",
//       isDirty: false,
//       isValid: true,
//       errors: []
//     },
//     dateSigned: {
//       id: SECTION30_FIELD_IDS.DATE_SIGNED_PAGE2,
//       type: "date",
//       label: "Date signed (mm/dd/yyyy)",
//       value: "",
//       isDirty: false,
//       isValid: true,
//       errors: []
//     },
//     currentAddress: {
//       street: {
//         id: SECTION30_FIELD_IDS.STREET_PAGE2,
//         type: "text",
//         label: "Current Street Address, Apt #",
//         value: "",
//         isDirty: false,
//         isValid: true,
//         errors: []
//       },
//       city: {
//         id: SECTION30_FIELD_IDS.CITY_PAGE2,
//         type: "text",
//         label: "City (Country)",
//         value: "",
//         isDirty: false,
//         isValid: true,
//         errors: []
//       },
//       state: {
//         id: SECTION30_FIELD_IDS.STATE_PAGE2,
//         type: "select",
//         label: "State",
//         value: "",
//         isDirty: false,
//         isValid: true,
//         errors: []
//       },
//       zipCode: {
//         id: SECTION30_FIELD_IDS.ZIP_CODE_PAGE2,
//         type: "text",
//         label: "ZIP Code",
//         value: "",
//         isDirty: false,
//         isValid: true,
//         errors: []
//       },
//       telephoneNumber: {
//         id: SECTION30_FIELD_IDS.TELEPHONE_PAGE2,
//         type: "text",
//         label: "Telephone number",
//         value: "",
//         isDirty: false,
//         isValid: true,
//         errors: []
//       }
//     }
//   },
//   additionalInfo1: {
//     radioButtonOption: {
//       id: SECTION30_FIELD_IDS.RADIO_BUTTON_PAGE3,
//       type: "radio",
//       label: "RadioButtonList",
//       value: "",
//       isDirty: false,
//       isValid: true,
//       errors: []
//     },
//     whatIsPrognosis: {
//       id: SECTION30_FIELD_IDS.PROGNOSIS_PAGE3,
//       type: "text",
//       label: "What is the prognosis?",
//       value: "",
//       isDirty: false,
//       isValid: true,
//       errors: []
//     },
//     natureOfCondition: {
//       id: SECTION30_FIELD_IDS.NATURE_CONDITION_PAGE3,
//       type: "text",
//       label: "If so, describe the nature of the condition and the extent and duration of the impairment or treatment.",
//       value: "",
//       isDirty: false,
//       isValid: true,
//       errors: []
//     },
//     datesOfTreatment: {
//       id: SECTION30_FIELD_IDS.DATES_TREATMENT_PAGE3,
//       type: "text",
//       label: "Dates of treatment?",
//       value: "",
//       isDirty: false,
//       isValid: true,
//       errors: []
//     }
//   }
// });

// // ============================================================================
// // HELPER FUNCTIONS
// // ============================================================================

// const clearFieldsRecursively = (obj: any) => {
//   if (!obj || typeof obj !== 'object') return obj;
  
//   const newObj = cloneDeep(obj);
  
//   for (const key in newObj) {
//     if (newObj[key] && typeof newObj[key] === 'object') {
//       if ('value' in newObj[key] && 'type' in newObj[key]) {
//         // This is a Field object, reset its value
//         if (newObj[key].type === 'checkbox' || newObj[key].type === 'radio') {
//           newObj[key].value = false;
//         } else {
//           newObj[key].value = '';
//         }
//         newObj[key].isDirty = false;
//         newObj[key].isValid = true;
//         newObj[key].errors = [];
//       } else {
//         // Recursive call for nested objects
//         newObj[key] = clearFieldsRecursively(newObj[key]);
//       }
//     }
//   }
  
//   return newObj;
// };

// // ============================================================================
// // CONTEXT PROVIDER
// // ============================================================================

// interface Section30ProviderProps {
//   children: ReactNode;
// }

// const Section30Context = createContext<Section30ContextType | null>(null);

// export const Section30Provider: React.FC<Section30ProviderProps> = ({ children }) => {
//   const [section30Data, setSection30Data] = useState<Section30>(createInitialSection30State());
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [isDirty, setIsDirty] = useState<boolean>(false);

//   // Integration with the global SF86FormContext
//   const {
//     updateSectionData,
//     getSectionData,
//     markSectionComplete,
//     markSectionIncomplete,
//     validateCompleteForm,
//     getFormState,
//     navigateToSection,
//     saveForm: globalSaveForm,
//     emitEvent,
//     subscribeToEvents,
//     notifyChange
//   } = useSection86FormIntegration(30);

//   // ========================================================================
//   // CRUD OPERATIONS
//   // ========================================================================

//   const updateContinuationSheetsFlag = useCallback((hasValue: "YES" | "NO") => {
//     setSection30Data(prevData => {
//       const newData = cloneDeep(prevData);
//       newData.continuationSheets.hasContinuationSheets.value = hasValue;
//       newData.continuationSheets.hasContinuationSheets.isDirty = true;
      
//       // If changing to "NO", clear entries
//       if (hasValue === "NO") {
//         newData.continuationSheets.entries = [];
//       }
      
//       return newData;
//     });
//     setIsDirty(true);
//   }, []);

//   const addContinuationEntry = useCallback(() => {
//     setSection30Data(prevData => {
//       const newData = cloneDeep(prevData);
//       const newEntry = createContinuationEntryTemplate(newData.continuationSheets.entries.length);
//       newData.continuationSheets.entries.push(newEntry);
//       return newData;
//     });
//     setIsDirty(true);
//   }, []);

//   const removeContinuationEntry = useCallback((entryIndex: number) => {
//     if (entryIndex < 0) return;
    
//     setSection30Data(prevData => {
//       const newData = cloneDeep(prevData);
//       if (entryIndex < newData.continuationSheets.entries.length) {
//         newData.continuationSheets.entries.splice(entryIndex, 1);
//       }
//       return newData;
//     });
//     setIsDirty(true);
//   }, []);

//   const updateFieldValue = useCallback((entryIndex: number, fieldPath: string, newValue: any) => {
//     setSection30Data(prevData => {
//       const newData = cloneDeep(prevData);
//       if (entryIndex >= 0 && entryIndex < newData.continuationSheets.entries.length) {
//         const fullPath = `continuationSheets.entries[${entryIndex}].${fieldPath}`;
//         set(newData, fullPath, {
//           ...get(newData, fullPath, {}),
//           value: newValue,
//           isDirty: true
//         });
//       }
//       return newData;
//     });
//     setIsDirty(true);
//   }, []);

//   // ========================================================================
//   // ENHANCED ENTRY MANAGEMENT
//   // ========================================================================

//   const getContinuationCount = useCallback(() => {
//     return section30Data.continuationSheets.entries.length;
//   }, [section30Data.continuationSheets.entries.length]);

//   const getContinuationEntry = useCallback((entryIndex: number): ContinuationEntry | null => {
//     if (entryIndex < 0 || entryIndex >= section30Data.continuationSheets.entries.length) {
//       return null;
//     }
//     return section30Data.continuationSheets.entries[entryIndex];
//   }, [section30Data.continuationSheets.entries]);

//   const moveContinuationEntry = useCallback((fromIndex: number, toIndex: number) => {
//     if (
//       fromIndex < 0 || 
//       fromIndex >= section30Data.continuationSheets.entries.length || 
//       toIndex < 0 || 
//       toIndex >= section30Data.continuationSheets.entries.length
//     ) {
//       return;
//     }

//     setSection30Data(prevData => {
//       const newData = cloneDeep(prevData);
//       const entry = newData.continuationSheets.entries[fromIndex];
//       newData.continuationSheets.entries.splice(fromIndex, 1);
//       newData.continuationSheets.entries.splice(toIndex, 0, entry);
//       return newData;
//     });
//     setIsDirty(true);
//   }, [section30Data.continuationSheets.entries.length]);

//   const duplicateContinuationEntry = useCallback((entryIndex: number) => {
//     if (entryIndex < 0 || entryIndex >= section30Data.continuationSheets.entries.length) {
//       return;
//     }

//     setSection30Data(prevData => {
//       const newData = cloneDeep(prevData);
//       const originalEntry = newData.continuationSheets.entries[entryIndex];
//       const duplicatedEntry = cloneDeep(originalEntry);
//       duplicatedEntry._id = Date.now() + Math.random();
//       newData.continuationSheets.entries.splice(entryIndex + 1, 0, duplicatedEntry);
//       return newData;
//     });
//     setIsDirty(true);
//   }, [section30Data.continuationSheets.entries.length]);

//   const clearContinuationEntry = useCallback((entryIndex: number) => {
//     if (entryIndex < 0 || entryIndex >= section30Data.continuationSheets.entries.length) {
//       return;
//     }

//     setSection30Data(prevData => {
//       const newData = cloneDeep(prevData);
//       const clearedEntry = clearFieldsRecursively(newData.continuationSheets.entries[entryIndex]);
//       clearedEntry._id = Date.now() + Math.random(); // Generate new ID
//       newData.continuationSheets.entries[entryIndex] = clearedEntry;
//       return newData;
//     });
//     setIsDirty(true);
//   }, [section30Data.continuationSheets.entries.length]);

//   const bulkUpdateFields = useCallback((entryIndex: number, fieldUpdates: Record<string, any>) => {
//     if (entryIndex < 0 || entryIndex >= section30Data.continuationSheets.entries.length) {
//       return;
//     }

//     setSection30Data(prevData => {
//       const newData = cloneDeep(prevData);
//       const entry = newData.continuationSheets.entries[entryIndex];
      
//       for (const [fieldPath, newValue] of Object.entries(fieldUpdates)) {
//         const fullPath = fieldPath;
//         set(entry, fullPath, {
//           ...get(entry, fullPath, {}),
//           value: newValue,
//           isDirty: true
//         });
//       }
      
//       return newData;
//     });
//     setIsDirty(true);
//   }, [section30Data.continuationSheets.entries.length]);

//   // ========================================================================
//   // UTILITY FUNCTIONS
//   // ========================================================================

//   const resetSection = useCallback(() => {
//     setSection30Data(createInitialSection30State());
//     setErrors({});
//     setIsDirty(false);
//   }, []);

//   const loadSection = useCallback((data: Section30) => {
//     setSection30Data(data);
//     setIsDirty(false);
//   }, []);

//   const validateSection = useCallback((): ValidationResult => {
//     const newErrors: Record<string, string> = {};
//     const validationErrors: ValidationError[] = [];

//     // Only validate if continuation sheets are enabled
//     if (section30Data.continuationSheets.hasContinuationSheets.value === "YES") {
//       // Check if at least one entry exists
//       if (section30Data.continuationSheets.entries.length === 0) {
//         newErrors["continuationSheets.entries"] = "At least one continuation sheet is required";
//         validationErrors.push({
//           field: "continuationSheets.entries",
//           message: "At least one continuation sheet is required",
//           severity: "error"
//         });
//       }

//       // Validate each entry
//       section30Data.continuationSheets.entries.forEach((entry, index) => {
//         // Required fields
//         if (!entry.remarks.value.trim()) {
//           newErrors[`continuationSheets.entries[${index}].remarks`] = "Remarks are required";
//           validationErrors.push({
//             field: `continuationSheets.entries[${index}].remarks`,
//             message: "Remarks are required",
//             severity: "error"
//           });
//         }

//         // Personal info validation
//         if (!entry.personalInfo.fullName.value.trim()) {
//           newErrors[`continuationSheets.entries[${index}].personalInfo.fullName`] = "Full name is required";
//           validationErrors.push({
//             field: `continuationSheets.entries[${index}].personalInfo.fullName`,
//             message: "Full name is required",
//             severity: "error"
//           });
//         }

//         if (!entry.personalInfo.dateSigned.value.trim()) {
//           newErrors[`continuationSheets.entries[${index}].personalInfo.dateSigned`] = "Date signed is required";
//           validationErrors.push({
//             field: `continuationSheets.entries[${index}].personalInfo.dateSigned`,
//             message: "Date signed is required",
//             severity: "error"
//           });
//         }
//       });
//     }

//     setErrors(newErrors);
    
//     return {
//       isValid: Object.keys(newErrors).length === 0,
//       errors: validationErrors
//     };
//   }, [section30Data]);

//   const getChanges = useCallback(() => {
//     // Here you would implement logic to compare current state with original state
//     return isDirty ? section30Data : null;
//   }, [section30Data, isDirty]);

//   // ========================================================================
//   // SF86FORM INTEGRATION
//   // ========================================================================

//   // Update global form state when local state changes
//   React.useEffect(() => {
//     if (isDirty) {
//       updateSectionData(section30Data);
//     }
//   }, [section30Data, updateSectionData, isDirty]);

//   // Load section data from global state on initial mount
//   React.useEffect(() => {
//     const storedData = getSectionData();
//     if (storedData) {
//       setSection30Data(storedData as Section30);
//     }
//   }, [getSectionData]);

//   const markComplete = useCallback(() => {
//     const validation = validateSection();
//     if (validation.isValid) {
//       markSectionComplete();
//       return true;
//     }
//     return false;
//   }, [validateSection, markSectionComplete]);

//   const markIncomplete = useCallback(() => {
//     markSectionIncomplete();
//   }, [markSectionIncomplete]);

//   const triggerGlobalValidation = useCallback(() => {
//     return validateCompleteForm();
//   }, [validateCompleteForm]);

//   const getGlobalFormState = useCallback(() => {
//     return getFormState();
//   }, [getFormState]);

//   const saveForm = useCallback(async () => {
//     await globalSaveForm();
//   }, [globalSaveForm]);

//   // ========================================================================
//   // CONTEXT VALUE
//   // ========================================================================

//   const contextValue = useMemo<Section30ContextType>(() => ({
//     // Core State
//     section30Data,
//     isLoading,
//     errors,
//     isDirty,

//     // Section-Specific CRUD Operations
//     updateContinuationSheetsFlag,
//     addContinuationEntry,
//     removeContinuationEntry,
//     updateFieldValue,

//     // Enhanced Entry Management
//     getContinuationCount,
//     getContinuationEntry,
//     moveContinuationEntry,
//     duplicateContinuationEntry,
//     clearContinuationEntry,
//     bulkUpdateFields,

//     // Utility
//     resetSection,
//     loadSection,
//     validateSection,
//     getChanges,

//     // SF86Form Integration
//     markComplete,
//     markIncomplete,
//     triggerGlobalValidation,
//     getGlobalFormState,
//     navigateToSection,
//     saveForm,
//     emitEvent,
//     subscribeToEvents,
//     notifyChange
//   }), [
//     section30Data,
//     isLoading,
//     errors,
//     isDirty,
//     updateContinuationSheetsFlag,
//     addContinuationEntry,
//     removeContinuationEntry,
//     updateFieldValue,
//     getContinuationCount,
//     getContinuationEntry,
//     moveContinuationEntry,
//     duplicateContinuationEntry,
//     clearContinuationEntry,
//     bulkUpdateFields,
//     resetSection,
//     loadSection,
//     validateSection,
//     getChanges,
//     markComplete,
//     markIncomplete,
//     triggerGlobalValidation,
//     getGlobalFormState,
//     navigateToSection,
//     saveForm,
//     emitEvent,
//     subscribeToEvents,
//     notifyChange
//   ]);

//   return (
//     <Section30Context.Provider value={contextValue}>
//       {children}
//     </Section30Context.Provider>
//   );
// };

// // ============================================================================
// // HOOK TO ACCESS CONTEXT
// // ============================================================================

// export const useSection30 = (): Section30ContextType => {
//   const context = useContext(Section30Context);
//   if (!context) {
//     throw new Error("useSection30 must be used within a Section30Provider");
//   }
//   return context;
// };

// // Helper function to safely get a nested property
// function get(obj: any, path: string, defaultValue: any = undefined) {
//   const travel = (regexp: RegExp) =>
//     String.prototype.split
//       .call(path, regexp)
//       .filter(Boolean)
//       .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
//   const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
//   return result === undefined || result === obj ? defaultValue : result;
// } 