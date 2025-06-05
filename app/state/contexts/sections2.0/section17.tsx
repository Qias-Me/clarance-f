/**
 * Section 17: Marital Status - Context Provider
 *
 * React context provider for SF-86 Section 17 using the new Form Architecture 2.0.
 * This provider manages marital status data with full CRUD operations,
 * validation, and integration with the central SF86FormContext.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo
} from 'react';
import { cloneDeep, set, get } from 'lodash';
import type {
  Section17,
  Section17ValidationResult,
  Section17SubsectionKey,
  CurrentSpouseEntry,
  FormerSpouseEntry,
  CohabitantEntry
} from '../../../../api/interfaces/sections2.0/section17';
import { createDefaultSection17, validateSection17 } from '../../../../api/interfaces/sections2.0/section17';
import type {
  ValidationResult,
  ValidationError,
  ChangeSet
} from '../shared/base-interfaces';
import { useSectionIntegration } from '../shared/section-integration';
import { createFieldFromReference, validateSectionFieldCount } from '../../../../api/utils/sections-references-loader';

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

/**
 * Section 17 Context Interface
 */
export interface Section17ContextType {
  // State
  section17Data: Section17;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Current Spouse Operations
  updateCurrentSpouse: (entryIndex: number, updates: Partial<CurrentSpouseEntry>) => void;
  addCurrentSpouse: () => void;
  removeCurrentSpouse: (entryIndex: number) => void;

  // Former Spouse Operations
  updateFormerSpouse: (entryIndex: number, updates: Partial<FormerSpouseEntry>) => void;
  addFormerSpouse: () => void;
  removeFormerSpouse: (entryIndex: number) => void;

  // Cohabitant Operations
  updateCohabitant: (entryIndex: number, updates: Partial<CohabitantEntry>) => void;
  addCohabitant: () => void;
  removeCohabitant: (entryIndex: number) => void;

  // Field-level Operations
  updateFieldValue: (path: string, newValue: any) => void;

  // Utility Functions
  validateSection: () => ValidationResult;
  resetSection: () => void;
  loadSection: (data: Section17) => void;
  getChanges: () => ChangeSet;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

// Use the DRY approach with sections-references instead of hardcoded values
const createInitialSection17State = (): Section17 => {
  return createDefaultSection17();
};

// ============================================================================
// VALIDATION CONFIGURATION
// ============================================================================

// Simplified validation configuration - no complex rules needed

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section17Context = createContext<Section17ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section17ProviderProps {
  children: React.ReactNode;
}

export const Section17Provider: React.FC<Section17ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT - Following Section 29 Gold Standard Pattern
  // ============================================================================

  const [section17Data, setSection17Data] = useState<Section17>(createInitialSection17State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Reference to current data for safe updates during form integration
  const currentDataRef = React.useRef<Section17>(section17Data);
  React.useEffect(() => {
    currentDataRef.current = section17Data;
  }, [section17Data]);

  // Set initialized flag after component mounts
  useEffect(() => {
    setIsInitialized(true);
    
    // Validate field count from sections-references to ensure alignment
    validateSectionFieldCount(17);
  }, []);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Use simplified validation
    const section17Validation = validateSection17(section17Data);

    if (!section17Validation.isValid) {
      section17Validation.errors.forEach((error: string) => {
        validationErrors.push({
          field: 'section17',
          message: error,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      });
    }

    section17Validation.warnings.forEach((warning: string) => {
      validationWarnings.push({
        field: 'section17',
        message: warning,
        code: 'VALIDATION_WARNING',
        severity: 'warning'
      });
    });

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section17Data]);

  // ============================================================================
  // CURRENT SPOUSE OPERATIONS
  // ============================================================================

  const addCurrentSpouse = useCallback(() => {
    setSection17Data((prev: Section17) => {
      const newData = cloneDeep(prev);
      
      // Create new current spouse entry with fields from section-references
      const newSpouse: CurrentSpouseEntry = {
        _id: Date.now().toString(),
        name: {
          first: createFieldFromReference(17, 'form1[0].Section17_1[0].TextField11[0]', ''),
          middle: createFieldFromReference(17, 'form1[0].Section17_1[0].TextField11[1]', ''),
          last: createFieldFromReference(17, 'form1[0].Section17_1[0].TextField11[2]', ''),
          suffix: createFieldFromReference(17, 'form1[0].Section17_1[0].TextField11[3]', '')
        },
        dateOfBirth: createFieldFromReference(17, 'form1[0].Section17_1[0].Date11[0]', ''),
        placeOfBirth: {
          city: createFieldFromReference(17, 'form1[0].Section17_1[0].TextField11[4]', ''),
          county: createFieldFromReference(17, 'form1[0].Section17_1[0].TextField11[4]', ''),
          state: createFieldFromReference(17, 'form1[0].Section17_1[0].#area[0].School6_State[0]', ''),
          country: createFieldFromReference(17, 'form1[0].Section17_1[0].Country11[0]', '')
        },
        socialSecurityNumber: createFieldFromReference(17, 'form1[0].Section17_1[0].TextField11[9]', ''),
        citizenship: {
          status: createFieldFromReference(17, 'form1[0].Section17_1[0].RadioButtonList[3]', '')
        },
        dateMarried: createFieldFromReference(17, 'form1[0].Section17_1[0].Date11[1]', ''),
        placeMarried: {
          city: createFieldFromReference(17, 'form1[0].Section17_1[0].#area[3].TextField11[12]', ''),
          state: createFieldFromReference(17, 'form1[0].Section17_1[0].#area[3].School6_State[3]', ''),
          country: createFieldFromReference(17, 'form1[0].Section17_1[0].Country11[3]', '')
        },
        isCurrentlyLiving: createFieldFromReference(17, 'form1[0].Section17_1[0].RadioButtonList[0]', 'YES'),
        currentAddress: {
          street: createFieldFromReference(17, 'form1[0].Section17_1[0].TextField11[5]', ''),
          city: createFieldFromReference(17, 'form1[0].Section17_1[0].TextField11[6]', ''),
          state: createFieldFromReference(17, 'form1[0].Section17_1[0].School6_State[1]', ''),
          zipcode: createFieldFromReference(17, 'form1[0].Section17_1[0].TextField11[7]', ''),
          country: createFieldFromReference(17, 'form1[0].Section17_1[0].Country11[1]', '')
        }
      };
      
      newData.section17.currentSpouse.push(newSpouse);
      setIsDirty(true);
      return newData;
    });
  }, []);

  const updateCurrentSpouse = useCallback((entryIndex: number, updates: Partial<CurrentSpouseEntry>) => {
    setSection17Data((prev: Section17) => {
      const newData = cloneDeep(prev);
      if (newData.section17.currentSpouse[entryIndex]) {
        newData.section17.currentSpouse[entryIndex] = {
          ...newData.section17.currentSpouse[entryIndex],
          ...updates
        };
        setIsDirty(true);
      }
      return newData;
    });
  }, []);

  const removeCurrentSpouse = useCallback((entryIndex: number) => {
    setSection17Data((prev: Section17) => {
      const newData = cloneDeep(prev);
      if (entryIndex >= 0 && entryIndex < newData.section17.currentSpouse.length) {
        newData.section17.currentSpouse.splice(entryIndex, 1);
        setIsDirty(true);
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // FORMER SPOUSE OPERATIONS
  // ============================================================================

  const addFormerSpouse = useCallback(() => {
    setSection17Data((prev: Section17) => {
      const newData = cloneDeep(prev);
      
      // Create new former spouse entry with fields from section-references
      const newFormerSpouse: FormerSpouseEntry = {
        _id: Date.now().toString(),
        name: {
          first: createFieldFromReference(17, 'form1[0].Section17_2[0].TextField11[0]', ''),
          middle: createFieldFromReference(17, 'form1[0].Section17_2[0].TextField11[1]', ''),
          last: createFieldFromReference(17, 'form1[0].Section17_2[0].TextField11[2]', ''),
          suffix: createFieldFromReference(17, 'form1[0].Section17_2[0].TextField11[3]', '')
        },
        dateOfBirth: createFieldFromReference(17, 'form1[0].Section17_2[0].Date11[0]', ''),
        placeOfBirth: {
          county: createFieldFromReference(17, 'form1[0].Section17_2[0].TextField11[4]', ''),
          city: createFieldFromReference(17, 'form1[0].Section17_2[0].TextField11[4]', ''),
          state: createFieldFromReference(17, 'form1[0].Section17_2[0].School6_State[0]', ''),
          country: createFieldFromReference(17, 'form1[0].Section17_2[0].Country11[0]', '')
        },
        socialSecurityNumber: createFieldFromReference(17, 'form1[0].Section17_2[0].TextField11[9]', ''),
        citizenship: {
          status: createFieldFromReference(17, 'form1[0].Section17_2[0].RadioButtonList[0]', '')
        },
        dateMarried: createFieldFromReference(17, 'form1[0].Section17_2[0].Date11[1]', ''),
        placeMarried: {
          city: createFieldFromReference(17, 'form1[0].Section17_2[0].TextField11[12]', ''),
          state: createFieldFromReference(17, 'form1[0].Section17_2[0].School6_State[3]', ''),
          country: createFieldFromReference(17, 'form1[0].Section17_2[0].Country11[3]', '')
        },
        dateSeparated: createFieldFromReference(17, 'form1[0].Section17_2[0].Date11[2]', ''),
        marriageEndType: createFieldFromReference(17, 'form1[0].Section17_2[0].#subform[0].DropDownList1[0]', ''),
        locationEnded: {
          city: createFieldFromReference(17, 'form1[0].Section17_2[0].TextField11[14]', ''),
          state: createFieldFromReference(17, 'form1[0].Section17_2[0].School6_State[4]', ''),
          country: createFieldFromReference(17, 'form1[0].Section17_2[0].Country11[4]', '')
        }
      };
      
      newData.section17.formerSpouses.push(newFormerSpouse);
      setIsDirty(true);
      return newData;
    });
  }, []);

  const updateFormerSpouse = useCallback((entryIndex: number, updates: Partial<FormerSpouseEntry>) => {
    setSection17Data((prev: Section17) => {
      const newData = cloneDeep(prev);
      if (newData.section17.formerSpouses[entryIndex]) {
        newData.section17.formerSpouses[entryIndex] = {
          ...newData.section17.formerSpouses[entryIndex],
          ...updates
        };
        setIsDirty(true);
      }
      return newData;
    });
  }, []);

  const removeFormerSpouse = useCallback((entryIndex: number) => {
    setSection17Data((prev: Section17) => {
      const newData = cloneDeep(prev);
      if (entryIndex >= 0 && entryIndex < newData.section17.formerSpouses.length) {
        newData.section17.formerSpouses.splice(entryIndex, 1);
        setIsDirty(true);
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // COHABITANT OPERATIONS
  // ============================================================================

  const addCohabitant = useCallback(() => {
    setSection17Data((prev: Section17) => {
      const newData = cloneDeep(prev);
      
      // Create new cohabitant entry with fields from section-references
      const newCohabitant: CohabitantEntry = {
        _id: Date.now().toString(),
        name: {
          first: createFieldFromReference(17, 'form1[0].Section17_3[0].TextField11[0]', ''),
          middle: createFieldFromReference(17, 'form1[0].Section17_3[0].TextField11[1]', ''),
          last: createFieldFromReference(17, 'form1[0].Section17_3[0].TextField11[2]', ''),
          suffix: createFieldFromReference(17, 'form1[0].Section17_3[0].TextField11[3]', '')
        },
        dateOfBirth: createFieldFromReference(17, 'form1[0].Section17_3[0].Date11[0]', ''),
        placeOfBirth: {
          county: createFieldFromReference(17, 'form1[0].Section17_3[0].TextField11[4]', ''),
          city: createFieldFromReference(17, 'form1[0].Section17_3[0].TextField11[4]', ''),
          state: createFieldFromReference(17, 'form1[0].Section17_3[0].School6_State[0]', ''),
          country: createFieldFromReference(17, 'form1[0].Section17_3[0].Country11[0]', '')
        },
        socialSecurityNumber: createFieldFromReference(17, 'form1[0].Section17_3[0].TextField11[9]', ''),
        citizenship: {
          status: createFieldFromReference(17, 'form1[0].Section17_3[0].RadioButtonList[0]', '')
        },
        cohabitationStartDate: createFieldFromReference(17, 'form1[0].Section17_3[0].Date11[1]', ''),
        cohabitationEndDate: createFieldFromReference(17, 'form1[0].Section17_3[0].Date11[2]', ''),
        isCurrentlyLiving: createFieldFromReference(17, 'form1[0].Section17_3[0].RadioButtonList[2]', 'YES'),
        currentAddress: {
          street: createFieldFromReference(17, 'form1[0].Section17_3[0].TextField11[5]', ''),
          city: createFieldFromReference(17, 'form1[0].Section17_3[0].TextField11[6]', ''),
          state: createFieldFromReference(17, 'form1[0].Section17_3[0].School6_State[1]', ''),
          zipcode: createFieldFromReference(17, 'form1[0].Section17_3[0].TextField11[7]', ''),
          country: createFieldFromReference(17, 'form1[0].Section17_3[0].Country11[1]', '')
        }
      };
      
      newData.section17.cohabitants.push(newCohabitant);
      setIsDirty(true);
      return newData;
    });
  }, []);

  const updateCohabitant = useCallback((entryIndex: number, updates: Partial<CohabitantEntry>) => {
    setSection17Data((prev: Section17) => {
      const newData = cloneDeep(prev);
      if (newData.section17.cohabitants[entryIndex]) {
        newData.section17.cohabitants[entryIndex] = {
          ...newData.section17.cohabitants[entryIndex],
          ...updates
        };
        setIsDirty(true);
      }
      return newData;
    });
  }, []);

  const removeCohabitant = useCallback((entryIndex: number) => {
    setSection17Data((prev: Section17) => {
      const newData = cloneDeep(prev);
      if (entryIndex >= 0 && entryIndex < newData.section17.cohabitants.length) {
        newData.section17.cohabitants.splice(entryIndex, 1);
        setIsDirty(true);
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // FIELD OPERATIONS
  // ============================================================================

  /**
   * Update a specific field at any level of the data structure
   */
  const updateFieldValue = useCallback((path: string, newValue: any) => {
    setSection17Data(prev => {
      const updated = cloneDeep(prev);
      
      // If this is a section-level path with proper field structure
      if (path.includes('.value')) {
        set(updated, path, newValue);
      } else {
        // For nested field objects, update the value property
        const targetPath = path.includes('.value') ? path : `${path}.value`;
        set(updated, targetPath, newValue);
      }
      
      setIsDirty(true);
      return updated;
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    setSection17Data(createInitialSection17State());
    setErrors({});
    setIsDirty(false);
  }, []);

  const loadSection = useCallback((data: Section17) => {
    console.log(`🔄 Section17: Loading section data`);
    console.log(`📊 Incoming data:`, data);
    console.log(`📊 Current data:`, currentDataRef.current);

    // Only load if incoming data is different from current data
    if (JSON.stringify(data) !== JSON.stringify(currentDataRef.current)) {
      console.log(`✅ Section17: Loading new data`);
      setSection17Data(data);
      setIsDirty(false);
    } else {
      console.log(`⏭ Section17: Data unchanged, skipping load`);
    }
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    // Return changes for tracking purposes
    const changes: ChangeSet = {};

    if (isDirty) {
      changes['section17'] = {
        oldValue: createInitialSection17State(),
        newValue: section17Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section17Data, isDirty]);

  // ============================================================================
  // SF86FORM INTEGRATION - Following Section 29 Gold Standard Pattern
  // ============================================================================

  // Use the section integration hook
  const { registerSection, unregisterSection } = useSectionIntegration();

  // Register this section with the integration system
  useEffect(() => {
    if (isInitialized) {
      const registration = registerSection({
        sectionId: 'section17',
        context: {
          validateSection,
          loadSection, 
          resetSection,
          getChanges,
          getData: () => section17Data,
          updateField: updateFieldValue
        }
      });

      return () => {
        unregisterSection(registration.id);
      };
    }
  }, [
    isInitialized,
    registerSection,
    unregisterSection,
    validateSection,
    loadSection,
    resetSection,
    getChanges,
    section17Data,
    updateFieldValue
  ]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section17ContextType = {
    // State
    section17Data,
    isLoading,
    errors,
    isDirty,

    // Current Spouse Operations
    updateCurrentSpouse,
    addCurrentSpouse,
    removeCurrentSpouse,

    // Former Spouse Operations
    updateFormerSpouse,
    addFormerSpouse,
    removeFormerSpouse,

    // Cohabitant Operations
    updateCohabitant,
    addCohabitant,
    removeCohabitant,

    // Field-level Operations
    updateFieldValue,

    // Utility Functions
    validateSection,
    resetSection,
    loadSection,
    getChanges
  };

  return (
    <Section17Context.Provider value={contextValue}>
      {children}
    </Section17Context.Provider>
  );
};

// ============================================================================
// HOOK FOR CONSUMING CONTEXT
// ============================================================================

export const useSection17 = (): Section17ContextType => {
  const context = useContext(Section17Context);
  if (context === undefined) {
    throw new Error('useSection17 must be used within a Section17Provider');
  }
  return context;
};