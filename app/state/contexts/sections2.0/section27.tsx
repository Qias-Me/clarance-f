/**
 * Section27 Context Provider - Use of Information Technology Systems
 *
 * React Context provider for SF-86 Section 27 (Use of Information Technology Systems) with
 * SF86FormContext integration and optimized defensive check logic.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { cloneDeep } from 'lodash';
import type {
  Section27,
  Section27SubsectionKey,
  Section27Entry,
  Section27_1Entry,
  Section27_2Entry,
  Section27_3Entry,
  TechnologyValidationResult
} from '../../../../api/interfaces/sections2.0/section27';
import {
  createDefaultSection27,
  createDefaultSection27_1Entry,
  createDefaultSection27_2Entry,
  createDefaultSection27_3Entry
} from '../../../../api/interfaces/sections2.0/section27';
import type {
  ValidationResult,
  ValidationError,
  ChangeSet
} from '../shared/base-interfaces';
import { useSection86FormIntegration } from '../shared/section-context-integration';

// ============================================================================
// CONTEXT TYPE DEFINITION
// ============================================================================

export interface Section27ContextType {
  // State
  section27Data: Section27;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updateSubsectionFlag: (subsectionKey: Section27SubsectionKey, value: "YES" | "NO") => void;
  addEntry: (subsectionKey: Section27SubsectionKey) => void;
  removeEntry: (subsectionKey: Section27SubsectionKey, entryIndex: number) => void;
  updateFieldValue: (subsectionKey: Section27SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => void;
  updateEntryField: (subsectionKey: Section27SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => void;

  // Utility Functions
  getEntryCount: (subsectionKey: Section27SubsectionKey) => number;
  getEntry: (subsectionKey: Section27SubsectionKey, entryIndex: number) => Section27Entry | undefined;

  // Validation
  validateSection: () => ValidationResult;
  validateTechnology: () => TechnologyValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section27) => void;
  getChanges: () => ChangeSet;
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const createInitialSection27State = (): Section27 => {
  console.log('🔍 Creating initial Section 27 state...');
  const initialState = createDefaultSection27();
  console.log('✅ Initial Section 27 state created:', initialState);
  return initialState;
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section27Context = createContext<Section27ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section27ProviderProps {
  children: React.ReactNode;
}

export const Section27Provider: React.FC<Section27ProviderProps> = ({ children }) => {
  console.log('🔍 Section27Provider rendering...');
  
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section27Data, setSection27Data] = useState<Section27>(createInitialSection27State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section27>(createInitialSection27State());

  console.log('📊 Current Section 27 state:', {
    section27Data,
    isLoading,
    errors,
    isDirty: JSON.stringify(section27Data) !== JSON.stringify(initialData)
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(section27Data) !== JSON.stringify(initialData);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Validate each subsection
    const subsections: Section27SubsectionKey[] = ['illegalAccess', 'illegalModification', 'unauthorizedUse'];

    subsections.forEach(subsectionKey => {
      const subsection = section27Data.section27[subsectionKey];

      if (subsection.hasViolation.value === "YES") {
        // If violation is indicated, validate entries
        if (subsection.entries.length === 0) {
          validationErrors.push({
            field: `${subsectionKey}.entries`,
            message: `At least one entry is required when ${subsectionKey} violation is indicated`,
            code: 'VALIDATION_ERROR',
            severity: 'error'
          });
        } else {
          // Validate each entry
          subsection.entries.forEach((entry, index) => {
            if (!entry.description.value.trim()) {
              validationErrors.push({
                field: `${subsectionKey}.entries[${index}].description`,
                message: 'Description is required',
                code: 'VALIDATION_ERROR',
                severity: 'error'
              });
            }

            if (!entry.incidentDate.date.value.trim()) {
              validationErrors.push({
                field: `${subsectionKey}.entries[${index}].incidentDate`,
                message: 'Incident date is required',
                code: 'VALIDATION_ERROR',
                severity: 'error'
              });
            }
          });
        }
      }
    });

    // Update local errors
    const newErrors: Record<string, string> = {};
    validationErrors.forEach(error => {
      newErrors[error.field] = error.message;
    });
    setErrors(newErrors);

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section27Data]);

  const validateTechnology = useCallback((): TechnologyValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic technology validation
    const subsections: Section27SubsectionKey[] = ['illegalAccess', 'illegalModification', 'unauthorizedUse'];

    subsections.forEach(subsectionKey => {
      const subsection = section27Data.section27[subsectionKey];

      if (subsection.hasViolation.value === "YES" && subsection.entries.length === 0) {
        errors.push(`${subsectionKey}: At least one entry is required when violation is indicated`);
      }
    });

    return { isValid: errors.length === 0, errors, warnings };
  }, [section27Data]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updateSubsectionFlag = useCallback((subsectionKey: Section27SubsectionKey, value: "YES" | "NO") => {
    setSection27Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section27[subsectionKey].hasViolation.value = value;

      // If setting to NO, clear entries
      if (value === "NO") {
        newData.section27[subsectionKey].entries = [];
      }

      return newData;
    });
  }, []);

  const addEntry = useCallback((subsectionKey: Section27SubsectionKey) => {
    console.log('🔍 Adding entry to subsection:', subsectionKey);
    
    setSection27Data(prevData => {
      console.log('📊 Previous section27 data:', prevData);
      
      const newData = cloneDeep(prevData);
      let newEntry: Section27Entry;

      switch (subsectionKey) {
        case 'illegalAccess':
          console.log('🔍 Creating illegal access entry...');
          newEntry = createDefaultSection27_1Entry();
          console.log('✅ Illegal access entry created:', newEntry);
          break;
        case 'illegalModification':
          console.log('🔍 Creating illegal modification entry...');
          newEntry = createDefaultSection27_2Entry();
          console.log('✅ Illegal modification entry created:', newEntry);
          break;
        case 'unauthorizedUse':
          console.log('🔍 Creating unauthorized use entry...');
          newEntry = createDefaultSection27_3Entry();
          console.log('✅ Unauthorized use entry created:', newEntry);
          break;
        default:
          throw new Error(`Unknown subsection: ${subsectionKey}`);
      }

      console.log('🔍 Adding entry to subsection array...');
      newData.section27[subsectionKey].entries.push(newEntry);
      
      console.log('✅ Updated section27 data:', {
        subsectionKey,
        entriesCount: newData.section27[subsectionKey].entries.length,
        entries: newData.section27[subsectionKey].entries,
        newEntry
      });

      return newData;
    });
  }, []);

  const removeEntry = useCallback((subsectionKey: Section27SubsectionKey, entryIndex: number) => {
    console.log('🗑️ Removing entry:', { subsectionKey, entryIndex });
    
    setSection27Data(prevData => {
      const newData = cloneDeep(prevData);

      if (entryIndex >= 0 && entryIndex < newData.section27[subsectionKey].entries.length) {
        console.log('✅ Removing entry at index:', entryIndex);
        newData.section27[subsectionKey].entries.splice(entryIndex, 1);
        console.log('✅ Updated entries count:', newData.section27[subsectionKey].entries.length);
      } else {
        console.warn('⚠️ Invalid entry index for removal:', entryIndex);
      }

      return newData;
    });
  }, []);

  const updateFieldValue = useCallback((subsectionKey: Section27SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => {
    console.log('📝 Updating field value:', { subsectionKey, entryIndex, fieldPath, newValue });
    
    setSection27Data(prevData => {
      const newData = cloneDeep(prevData);

      if (entryIndex >= 0 && entryIndex < newData.section27[subsectionKey].entries.length) {
        console.log('✅ Valid entry index, updating field...');
        const entry = newData.section27[subsectionKey].entries[entryIndex];
        console.log('📊 Current entry:', entry);
        
        const pathParts = fieldPath.split('.');
        let current: any = entry;

        console.log('🔍 Navigating field path:', pathParts);
        for (let i = 0; i < pathParts.length - 1; i++) {
          console.log(`🔍 Navigating to: ${pathParts[i]}`);
          current = current[pathParts[i]];
          console.log('📊 Current object:', current);
        }

        const lastKey = pathParts[pathParts.length - 1];
        console.log('🔍 Final field key:', lastKey);
        console.log('📊 Target field object:', current[lastKey]);
        
        if (current[lastKey] && typeof current[lastKey] === 'object' && 'value' in current[lastKey]) {
          console.log('✅ Updating field.value property');
          current[lastKey].value = newValue;
        } else {
          console.log('✅ Updating field directly');
          current[lastKey] = newValue;
        }
        
        console.log('✅ Updated entry:', newData.section27[subsectionKey].entries[entryIndex]);
      } else {
        console.warn('⚠️ Invalid entry index for field update:', entryIndex);
      }

      return newData;
    });
  }, []);

  const updateEntryField = useCallback((subsectionKey: Section27SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => {
    updateFieldValue(subsectionKey, entryIndex, fieldPath, newValue);
  }, [updateFieldValue]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getEntryCount = useCallback((subsectionKey: Section27SubsectionKey): number => {
    console.log('📊 Getting entry count for:', subsectionKey, 'Count:', section27Data.section27[subsectionKey].entries.length);
    return section27Data.section27[subsectionKey].entries.length;
  }, [section27Data]);

  const getEntry = useCallback((subsectionKey: Section27SubsectionKey, entryIndex: number): Section27Entry | undefined => {
    const entries = section27Data.section27[subsectionKey].entries;
    return entryIndex >= 0 && entryIndex < entries.length ? entries[entryIndex] : undefined;
  }, [section27Data]);

  const resetSection = useCallback(() => {
    const newData = createInitialSection27State();
    setSection27Data(newData);
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section27) => {
    setSection27Data(cloneDeep(data));
    setErrors({});
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Simple change detection - compare with initial data
    if (JSON.stringify(section27Data) !== JSON.stringify(initialData)) {
      changes['section27'] = {
        oldValue: initialData,
        newValue: section27Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section27Data, initialData]);

  // ============================================================================
  // SIMPLIFIED UPDATE FIELD VALUE FOR INTEGRATION (Following Section 1 Pattern)
  // ============================================================================

  /**
   * Generic field update function for integration compatibility
   * Maps generic field paths to Section 27 specific update functions
   * Following Section 1's simple pattern instead of complex field path parsing
   */
  const updateFieldValueForIntegration = useCallback((path: string, value: any) => {
    // Parse path to update the correct field
    const pathParts = path.split('.');
    
      if (pathParts.length >= 3) {
      const subsectionKey = pathParts[1] as Section27SubsectionKey;
      const fieldName = pathParts[2];
      
      // Handle subsection flags (YES/NO values)
      if (fieldName === 'hasViolation') {
        updateSubsectionFlag(subsectionKey, value);
        return;
      }
      
      // Handle entry field updates
      if (pathParts.length >= 4 && pathParts[2] === 'entries') {
        const entryIndex = parseInt(pathParts[3]);
        const fieldPath = pathParts.slice(4).join('.');
        updateFieldValue(subsectionKey, entryIndex, fieldPath, value);
      }
    }
  }, [updateSubsectionFlag, updateFieldValue]);

  // ============================================================================
  // SF86FORM INTEGRATION (Simplified following Section 1 pattern)
  // ============================================================================

  // Integration with main form context using standard pattern
  // Note: integration variable is used internally by the hook for registration
  const integration = useSection86FormIntegration(
    'section27',
    'Section 27: Use of Information Technology Systems',
    section27Data,
    setSection27Data,
    () => ({ isValid: validateSection().isValid, errors: validateSection().errors, warnings: validateSection().warnings }),
    getChanges,
    updateFieldValueForIntegration // Pass Section 27's simplified updateFieldValue function to integration
  );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section27ContextType = {
    // State
    section27Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updateSubsectionFlag,
    addEntry,
    removeEntry,
    updateFieldValue,
    updateEntryField,

    // Utility Functions
    getEntryCount,
    getEntry,

    // Validation
    validateSection,
    validateTechnology,

    // Utility
    resetSection,
    loadSection,
    getChanges,
  };

  return (
    <Section27Context.Provider value={contextValue}>
      {children}
    </Section27Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection27 = (): Section27ContextType => {
  const context = useContext(Section27Context);
  if (!context) {
    throw new Error('useSection27 must be used within a Section27Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section27Provider;
