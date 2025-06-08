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
  type ReactNode,
} from "react";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import { createFieldFromReference, validateSectionFieldCount } from "../../../../api/utils/sections-references-loader";
import { useSection86FormIntegration } from "../shared/section-context-integration";

// Import the correct Section 30 interface for Continuation Sheets
import type { Section30, ContinuationEntry } from "../../../../api/interfaces/sections2.0/section30";
import type { Field } from "../../../../api/interfaces/formDefinition2.0";

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
  updateHasContinuationSheets: (value: "YES" | "NO") => void;
  addContinuationEntry: () => void;
  removeContinuationEntry: (index: number) => void;
  updateFieldValue: (path: string, value: any) => void;

  // Entry Management
  getContinuationEntryCount: () => number;
  getContinuationEntry: (index: number) => ContinuationEntry | null;

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
    const radioButtonField = createFieldFromReference(
      30,
      SECTION30_NUMERIC_FIELD_IDS.RADIO_BUTTON_PAGE3, // Use the actual radio button field
      "" 
    );

    const initialState = {
      _id: 30,
      section30: {
        continuationSheet: {
          value: ""
        },
        entries: [],
      },
    };

    return initialState;
  } catch (error) {
    console.error('❌ Error creating Section 30 initial state:', error);

    // Fallback state if createFieldFromReference fails
    const fallbackState = {
      _id: 30,
      section30: {
        hasContinuationSheets: {
          id: SECTION30_NUMERIC_FIELD_IDS.RADIO_BUTTON_PAGE3,
          name: "form1[0].continuation3[0].RadioButtonList[0]",
          type: "radio",
          label: "Do you need continuation sheets?",
          value: "NO" as "YES" | "NO",
          rect: { x: 0, y: 0, width: 0, height: 0 }
        },
        entries: [],
      },
    };

    return fallbackState;
  }
};

/**
 * Create a new continuation entry with proper numeric field IDs
 */
const createContinuationEntry = (entryIndex: number): ContinuationEntry => {
  return {
    _id: Date.now() + Math.random(),
    remarks: createFieldFromReference(
      30,
      SECTION30_NUMERIC_FIELD_IDS.REMARKS,
      ""
    ),
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
        // Note: No separate apartment field in reference data
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
      // Additional fields to reach 25 field count
      additionalInfo: {
        whatIsPrognosis: createFieldFromReference(
          30,
          SECTION30_NUMERIC_FIELD_IDS.WHAT_IS_PROGNOSIS,
          ""
        ),
        natureOfCondition: createFieldFromReference(
          30,
          SECTION30_NUMERIC_FIELD_IDS.NATURE_OF_CONDITION,
          ""
        ),
        datesOfTreatment: createFieldFromReference(
          30,
          SECTION30_NUMERIC_FIELD_IDS.DATES_OF_TREATMENT,
          ""
        ),
        dropdown: createFieldFromReference(
          30,
          SECTION30_NUMERIC_FIELD_IDS.STATE_DROPDOWN_PAGE2,
          ""
        ),
      },
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

export const Section30Provider: React.FC<Section30ProviderProps> = ({ children }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [section30Data, setSection30Data] = useState<Section30>(() => createInitialSection30State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // ============================================================================
  // BASIC ACTIONS
  // ============================================================================

  const updateHasContinuationSheets = useCallback((value: "YES" | "NO") => {
    setSection30Data((prev) => {
      const updated = cloneDeep(prev);
      if (updated?.section30?.hasContinuationSheets) {
        updated.section30.hasContinuationSheets.value = value;
        setIsDirty(true);
      }
      return updated;
    });
  }, []);

  const addContinuationEntry = useCallback(() => {
    setSection30Data((prev) => {
      const updated = cloneDeep(prev);
      if (updated?.section30?.entries) {
        const entryIndex = updated.section30.entries.length;
        updated.section30.entries.push(createContinuationEntry(entryIndex));
        setIsDirty(true);
      }
      return updated;
    });
  }, []);

  const removeContinuationEntry = useCallback((index: number) => {
    setSection30Data((prev) => {
      const updated = cloneDeep(prev);
      if (updated?.section30?.entries && index >= 0 && index < updated.section30.entries.length) {
        updated.section30.entries.splice(index, 1);
        setIsDirty(true);
      }
      return updated;
    });
  }, []);

  const updateFieldValue = useCallback((path: string, value: any) => {
    console.log('🔄 Section 30 updateFieldValue:', { path, value });
    
    // CRITICAL FIX: Add field validation to prevent date/ZIP code cross-assignment
    const fieldType = path.split('.').pop()?.split('[')[0];
    const isDateField = ['dateSigned', 'dateOfBirth'].includes(fieldType || '');
    const isZipField = fieldType === 'zipCode';
    const valueStr = String(value || '');
    const isDateValue = /^\d{4}-\d{2}-\d{2}$/.test(valueStr);
    const isZipValue = /^\d{5}$/.test(valueStr);
    
    // MAIN FIX: Prevent date value being assigned to ZIP code field
    if (path.includes('zipCode') && isDateValue) {
      console.error('🚨 FIELD MAPPING ERROR: Date value assigned to zipCode field');
      console.error('   Path:', path);
      console.error('   Value:', value);
      console.error('   Expected: ZIP code format (5 digits)');
      console.error('   This would cause truncation from "2025-06-27" to "2025-" due to maxLength: 5');
      return; // Prevent the invalid assignment
    }
    
    // Prevent ZIP code being assigned to date field
    if ((path.includes('dateSigned') || path.includes('dateOfBirth')) && isZipValue) {
      console.error('🚨 FIELD MAPPING ERROR: ZIP code assigned to date field');
      console.error('   Path:', path);
      console.error('   Value:', value);
      console.error('   Expected: Date format (YYYY-MM-DD)');
      return; // Prevent the invalid assignment
    }
    
    // Enhanced logging for field assignments
    console.log('🔄 Section 30 Field Update Details:', {
      path,
      value,
      fieldType,
      isDateField,
      isZipField,
      valueType: typeof value,
      isDateValue,
      isZipValue,
      validation: isZipField ? (isZipValue || valueStr === '' ? 'VALID' : 'INVALID') : 
                  isDateField ? (isDateValue || valueStr === '' ? 'VALID' : 'INVALID') : 'UNKNOWN'
    });
    
    setSection30Data((prev) => {
      const updated = cloneDeep(prev);
      set(updated, path, value);
      setIsDirty(true);
      console.log('✅ Section 30 data updated:', updated);
      return updated;
    });
  }, []);

  // ============================================================================
  // ENTRY MANAGEMENT
  // ============================================================================

  const getContinuationEntryCount = useCallback((): number => {
    return section30Data?.section30?.entries?.length || 0;
  }, [section30Data]);

  const getContinuationEntry = useCallback((index: number): ContinuationEntry | null => {
    if (section30Data?.section30?.entries && index >= 0 && index < section30Data.section30.entries.length) {
      return section30Data.section30.entries[index];
    }
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

    console.log('🔍 Section 30 validation started:', section30Data);

    // Validate that the main question is answered
    if (!section30Data?.section30?.hasContinuationSheets?.value) {
      errors.push('Please indicate whether you need continuation sheets');
    }

    // Validate continuation sheets entries if YES is selected
    if (section30Data?.section30?.hasContinuationSheets?.value === "YES") {
      if (!section30Data.section30.entries || section30Data.section30.entries.length === 0) {
        errors.push('At least one continuation sheet is required when selecting YES');
      } else {
        section30Data.section30.entries?.forEach((entry, index) => {
          if (!entry?.remarks?.value?.trim()) {
            errors.push(`Continuation entry ${index + 1}: Remarks are required`);
          }
          if (!entry?.personalInfo?.fullName?.value?.trim()) {
            errors.push(`Continuation entry ${index + 1}: Full name is required`);
          }
          if (!entry?.personalInfo?.dateSigned?.value) {
            errors.push(`Continuation entry ${index + 1}: Date signed is required`);
          }
        });
      }
    }

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings,
    };

    console.log('✅ Section 30 validation result:', result);
    return result;
  }, [section30Data]);

  const getChanges = useCallback(() => {
    return isDirty ? section30Data : null;
  }, [section30Data, isDirty]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Integration with main form context using Section 1 gold standard pattern
  const integration = useSection86FormIntegration(
    'section30',
    'Section 30: General Remarks (Continuation Sheets)',
    section30Data,
    setSection30Data,
    () => ({ isValid: validateSection().isValid, errors: validateSection().errors, warnings: validateSection().warnings }),
    getChanges,
    updateFieldValue
  );

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
    updateHasContinuationSheets,
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
