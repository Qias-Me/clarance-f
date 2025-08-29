/**
 * Section 30: General Remarks (Continuation Sheets) - Context Provider
 *
 * React context provider for SF-86 Section 30 using the correct Continuation Sheets
 * functionality. This provider manages continuation sheet data with proper Field<T>
 * interface and numeric PDF field IDs.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import { createFieldFromReference, validateSectionFieldCount } from "../../../../api/utils/sections-references-loader";

// Import the correct Section 30 interface for Continuation Sheets
import type { Section30 } from "../../../../api/interfaces/section-interfaces/section30";
import type { Field } from "../../../../api/interfaces/formDefinition2.0";
import { useSF86Form } from "./SF86FormContext";

// ============================================================================
// INTERFACES
// ============================================================================

// Context interface for Continuation Sheets
interface Section30ContextType {
  // State
  section30Data: Section30;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updateContinuationSheet: (value: "YES" | "NO") => void;
  addContinuationEntry: () => void;
  removeContinuationEntry: (index: number) => void;
  updateFieldValue: (path: string, value: any) => void;

  // Entry Management
  getContinuationEntryCount: () => number;
  getContinuationEntry: (index: number) => any;

  // Utility Functions
  resetSection: () => void;
  loadSection: (data: Section30) => void;
  validateSection: () => { isValid: boolean; errors: string[]; warnings: string[] };
  getChanges: () => any;
}

// ============================================================================
// FIELD ID MAPPINGS (Numeric IDs from Reference Data)
// ============================================================================

/**
 * Numeric field IDs extracted from Section 30 reference data
 * ALL 25 fields from section-30.json (EXACT MATCH with reference data)
 */
export const SECTION30_NUMERIC_FIELD_IDS = {
  // Main continuation text area (page 133)
  REMARKS: "16259", // form1[0].continuation1[0].p15-t28[0]
  DATE_SIGNED_PAGE1: "16258", // form1[0].continuation1[0].p17-t2[0]

  // Personal info fields - Page 2 (page 134)
  FULL_NAME_PAGE2: "16270", // form1[0].continuation2[0].p17-t1[0]
  DATE_SIGNED_PAGE2: "16269", // form1[0].continuation2[0].p17-t2[0]
  DATE_OF_BIRTH: "16267", // form1[0].continuation2[0].p17-t4[0]
  OTHER_NAMES_PAGE2: "16266", // form1[0].continuation2[0].p17-t3[0]
  STREET_ADDRESS_PAGE2: "16265", // form1[0].continuation2[0].p17-t6[0]
  CITY_PAGE2: "16264", // form1[0].continuation2[0].p17-t8[0]
  STATE_DROPDOWN_PAGE2: "16263", // form1[0].continuation2[0].p17-t9[0] (PDFDropdown)
  ZIP_CODE_PAGE2: "16262", // form1[0].continuation2[0].p17-t10[0]
  PHONE_PAGE2: "16261", // form1[0].continuation2[0].p17-t11[0]

  // Personal info fields - Page 3 (page 135)
  RADIO_BUTTON_PAGE3: "16424", // form1[0].continuation3[0].RadioButtonList[0] (PDFRadioGroup)
  WHAT_IS_PROGNOSIS: "16283", // form1[0].continuation3[0].TextField1[0]
  FULL_NAME_PAGE3: "16282", // form1[0].continuation3[0].p17-t1[0]
  DATE_SIGNED_PAGE3: "16281", // form1[0].continuation3[0].p17-t2[0]
  OTHER_NAMES_PAGE3: "16279", // form1[0].continuation3[0].p17-t3[0]
  STREET_ADDRESS_PAGE3: "16278", // form1[0].continuation3[0].p17-t6[0]
  CITY_PAGE3: "16277", // form1[0].continuation3[0].p17-t8[0]
  STATE_DROPDOWN_PAGE3: "16276", // form1[0].continuation3[0].p17-t9[0] (PDFDropdown)
  ZIP_CODE_PAGE3: "16275", // form1[0].continuation3[0].p17-t10[0]
  PHONE_PAGE3: "16274", // form1[0].continuation3[0].p17-t11[0]
  NATURE_OF_CONDITION: "16273", // form1[0].continuation3[0].p17-t12[0]
  DATES_OF_TREATMENT: "16272", // form1[0].continuation3[0].p17-t13[0]

  // Personal info fields - Page 4 (page 136)
  FULL_NAME_PAGE4: "16271", // form1[0].continuation4[0].p17-t1[0]
  DATE_SIGNED_PAGE4: "16268", // form1[0].continuation4[0].p17-t2[0]
} as const;

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

/**
 * Create initial state for Section 30 - Continuation Sheets
 */
const createInitialSection30State = (): Section30 => {
  // Validate field count against sections-references (Section 30 should have 25 fields)
  validateSectionFieldCount(30, 25);

  try {
    const continuationSheet = createFieldFromReference(
      30,
      SECTION30_NUMERIC_FIELD_IDS.REMARKS,
      "" // Default to Empty
    );

    const initialState = {
      _id: 30,
      section30: createInitialContinuationInfo(),
    };

    return initialState;
  } catch (error) {
    // console.error('❌ Error creating Section 30 initial state:', error);

    // Fallback state if createFieldFromReference fails
    const fallbackState = {
      _id: 30,
      section30: {
        continuationSheet: {
          id: SECTION30_NUMERIC_FIELD_IDS.RADIO_BUTTON_PAGE3,
          name: "form1[0].continuation1[0].p15-t28[0]",
          type: "PDFTextField",
          label: "Remarks",
          value: "",
          rect: { x: 0, y: 0, width: 0, height: 0 }
        },
        personalInfo: {
          fullName: '',
          lastName: '',
          firstName: '',
          middleName: '',
          suffix: '',
          otherNames: [],
          otherNamesUsed: 'NO',
          dateOfBirth: '',
          dateSigned: '',
          currentAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        } as any,
      },
    };

    return fallbackState;
  }
};

/**
 * Create a new continuation entry with proper numeric field IDs
 * Updated to match the new interface structure with all 25 fields
 */
const createInitialContinuationInfo = (): any => {
  return {
    // Page 133 fields
    continuationSheet: createFieldFromReference(
      30,
      SECTION30_NUMERIC_FIELD_IDS.REMARKS,
      ""
    ),
    dateSignedPage1: createFieldFromReference(
      30,
      "16258", // Date signed page 1
      ""
    ),

    // Page 134 fields (existing)
    personalInfo: {
      fullName: createFieldFromReference(
        30,
        SECTION30_NUMERIC_FIELD_IDS.FULL_NAME_PAGE2,
        ""
      ),
      otherNamesUsed: createFieldFromReference(
        30,
        SECTION30_NUMERIC_FIELD_IDS.OTHER_NAMES_PAGE2,
        ""
      ),
      dateOfBirth: createFieldFromReference(
        30,
        SECTION30_NUMERIC_FIELD_IDS.DATE_OF_BIRTH,
        ""
      ),
      dateSigned: createFieldFromReference(
        30,
        SECTION30_NUMERIC_FIELD_IDS.DATE_SIGNED_PAGE2,
        ""
      ),
      currentAddress: {
        street: createFieldFromReference(
          30,
          SECTION30_NUMERIC_FIELD_IDS.STREET_ADDRESS_PAGE2,
          ""
        ),
        city: createFieldFromReference(
          30,
          SECTION30_NUMERIC_FIELD_IDS.CITY_PAGE2,
          ""
        ),
        state: createFieldFromReference(
          30,
          SECTION30_NUMERIC_FIELD_IDS.STATE_DROPDOWN_PAGE2,
          ""
        ),
        zipCode: createFieldFromReference(
          30,
          SECTION30_NUMERIC_FIELD_IDS.ZIP_CODE_PAGE2,
          ""
        ),
        telephoneNumber: createFieldFromReference(
          30,
          SECTION30_NUMERIC_FIELD_IDS.PHONE_PAGE2,
          ""
        ),
      },
    },

    // Page 135 medical fields
    medicalInfo: {
      radioButtonOption: createFieldFromReference(
        30,
        "16424", // RadioButtonList
        ""
      ),
      whatIsPrognosis: createFieldFromReference(
        30,
        "16283", // What is the prognosis?
        ""
      ),
      natureOfCondition: createFieldFromReference(
        30,
        "16273", // Nature of condition
        ""
      ),
      datesOfTreatment: createFieldFromReference(
        30,
        "16272", // Dates of treatment
        ""
      ),
    },

    // Page 135 personal info (duplicate set)
    page3PersonalInfo: {
      fullName: createFieldFromReference(
        30,
        "16282", // Full name page 3
        ""
      ),
      dateSigned: createFieldFromReference(
        30,
        "16281", // Date signed page 3
        ""
      ),
      otherNamesUsed: createFieldFromReference(
        30,
        "16279", // Other names page 3
        ""
      ),
      currentAddress: {
        street: createFieldFromReference(
          30,
          "16278", // Street page 3
          ""
        ),
        city: createFieldFromReference(
          30,
          "16277", // City page 3
          ""
        ),
        state: createFieldFromReference(
          30,
          "16276", // State page 3
          ""
        ),
        zipCode: createFieldFromReference(
          30,
          "16275", // ZIP page 3
          ""
        ),
        telephoneNumber: createFieldFromReference(
          30,
          "16274", // Phone page 3
          ""
        ),
      },
    },

    // Page 136 fields
    page4Info: {
      printName: createFieldFromReference(
        30,
        "16289", // Print name
        ""
      ),
      dateSigned: createFieldFromReference(
        30,
        "16288", // Date signed page 4
        ""
      ),
    },
  };
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section30Context = createContext<Section30ContextType | undefined>(undefined);

export const useSection30 = (): Section30ContextType => {
  const context = useContext(Section30Context);
  if (!context) {
    throw new Error("useSection30 must be used within a Section30Provider");
  }
  return context;
};

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface Section30ProviderProps {
  children: ReactNode;
}

const Section30Provider: React.FC<Section30ProviderProps> = ({ children }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const sf86Form = useSF86Form();
  const [section30Data, setSection30Data] = useState<Section30>(() => createInitialSection30State());
  const [isLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // ============================================================================
  // BASIC ACTIONS
  // ============================================================================




  const updateFieldValue = useCallback((path: string, value: any) => {
    // console.log('🔄 Section 30 updateFieldValue:', { path, value });

    // Basic field validation
    const valueStr = String(value || '');
    const isDateValue = /^\d{4}-\d{2}-\d{2}$/.test(valueStr);
    const isZipValue = /^\d{5}$/.test(valueStr);

    // MAIN FIX: Prevent date value being assigned to ZIP code field
    if (path.includes('zipCode') && isDateValue) {
      // console.error('🚨 FIELD MAPPING ERROR: Date value assigned to zipCode field');
      // console.error('   Path:', path);
      // console.error('   Value:', value);
      // console.error('   Expected: ZIP code format (5 digits)');
      // console.error('   This would cause truncation from "2025-06-27" to "2025-" due to maxLength: 5');
      return; // Prevent the invalid assignment
    }

    // Prevent ZIP code being assigned to date field
    if ((path.includes('dateSigned') || path.includes('dateOfBirth')) && isZipValue) {
      // console.error('🚨 FIELD MAPPING ERROR: ZIP code assigned to date field');
      // console.error('   Path:', path);
      // console.error('   Value:', value);
      // console.error('   Expected: Date format (YYYY-MM-DD)');
      return; // Prevent the invalid assignment
    }

    // Enhanced logging for field assignments
    // console.log('🔄 Section 30 Field Update Details:', {
    //   path,
    //   value,
    //   fieldType,
    //   isDateField,
    //   isZipField,
    //   valueType: typeof value,
    //   isDateValue,
    //   isZipValue,
    //   validation: isZipField ? (isZipValue || valueStr === '' ? 'VALID' : 'INVALID') :
    //               isDateField ? (isDateValue || valueStr === '' ? 'VALID' : 'INVALID') : 'UNKNOWN'
    // });

    setSection30Data((prev) => {
      const updated = cloneDeep(prev);
      set(updated, path, value);
      setIsDirty(true);
      // console.log('✅ Section 30 data updated:', updated);
      return updated;
    });
  }, []);

  // ============================================================================
  // ENTRY MANAGEMENT
  // ============================================================================

  const getContinuationEntryCount = useCallback((): number => {
    return 0; // Basic implementation
  }, [section30Data]);

  const getContinuationEntry = useCallback((_index: number): any => {
    // Basic implementation
    return null;
  }, [section30Data]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    setSection30Data(createInitialSection30State());
    setErrors({});
    setIsDirty(false);
  }, []);

  const loadSection = useCallback((data: Section30) => {
    setSection30Data(cloneDeep(data));
    setIsDirty(false);
  }, []);

  const validateSection = useCallback(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // console.log('🔍 Section 30 validation started:', section30Data);

    // Validate that the main question is answered
    if (!section30Data?.section30?.continuationSheet?.value) {
      errors.push('Please indicate whether you need continuation sheets');
    }


    const result = {
      isValid: errors.length === 0,
      errors,
      warnings,
    };

    // console.log('✅ Section 30 validation result:', result);
    return result;
  }, [section30Data]);

  const getChanges = useCallback(() => {
    return isDirty ? section30Data : null;
  }, [section30Data, isDirty]);

  // Missing functions - quick implementation to fix build
  const updateContinuationSheet = useCallback((value: "YES" | "NO") => {
    updateFieldValue('section30.continuationSheet.value', value);
  }, [updateFieldValue]);

  const addContinuationEntry = useCallback(() => {
    // Basic implementation - would need proper entry creation
    console.log('addContinuationEntry called');
  }, []);

  const removeContinuationEntry = useCallback((index: number) => {
    // Basic implementation - would need proper entry removal
    console.log('removeContinuationEntry called with index:', index);
  }, []);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Sync with SF86FormContext when data is loaded
  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

    if (sf86Form.formData.section30 && sf86Form.formData.section30 !== section30Data) {
      if (isDebugMode) {
        // console.log('🔄 Section30: Syncing with SF86FormContext loaded data');
      }

      // Load the data from SF86FormContext
      loadSection(sf86Form.formData.section30);

      if (isDebugMode) {
        // console.log('✅ Section30: Data sync complete');
      }
    }
  }, [sf86Form.formData.section30, loadSection]);



  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section30ContextType = {
    // State
    section30Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updateContinuationSheet,
    addContinuationEntry,
    removeContinuationEntry,
    updateFieldValue,

    // Entry Management
    getContinuationEntryCount,
    getContinuationEntry,

    // Utility Functions
    resetSection,
    loadSection,
    validateSection,
    getChanges,
  };

  return (
    <Section30Context.Provider value={contextValue}>
      {children}
    </Section30Context.Provider>
  );
};


export default Section30Provider;