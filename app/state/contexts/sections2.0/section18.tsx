/**
 * Section 18 Context - Relatives and Associates
 *
 * Manages state and operations for SF-86 Section 18 (Relatives and Associates).
 * Provides CRUD operations, validation, and integration with the global SF86 form context.
 *
 * FIXED: Now uses proper SF86FormContext integration pattern like Section 1 and Section 29
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { cloneDeep, set, get } from 'lodash';
import type {
  Section18,
  ImmediateFamilyEntry,
  ExtendedFamilyEntry,
  AssociateEntry,
  Section18SubsectionKey,
  Section18FieldUpdate,
  RelativeAssociateValidationResult,
  Section18ValidationContext
} from '../../../../api/interfaces/sections2.0/section18';
import {
  createDefaultSection18,
  createDefaultImmediateFamilyEntry,
  createDefaultExtendedFamilyEntry,
  createDefaultAssociateEntry,
  updateSection18Field,
  validateRelativesAndAssociates,
  isSection18Complete
} from '../../../../api/interfaces/sections2.0/section18';
import { useSection86FormIntegration } from '../shared/section-context-integration';
import type { ChangeSet } from '../shared/base-interfaces';

// ============================================================================
// SECTION 18 CONTEXT INTERFACE
// ============================================================================

export interface Section18ContextType {
  // Section 18 specific data
  section18Data: Section18;

  // Immediate Family Operations
  immediateFamily: ImmediateFamilyEntry[];
  addImmediateFamilyMember: () => void;
  updateImmediateFamilyMember: (index: number, updates: Partial<ImmediateFamilyEntry>) => void;
  removeImmediateFamilyMember: (index: number) => void;
  duplicateImmediateFamilyMember: (index: number) => void;

  // Extended Family Operations
  extendedFamily: ExtendedFamilyEntry[];
  addExtendedFamilyMember: () => void;
  updateExtendedFamilyMember: (index: number, updates: Partial<ExtendedFamilyEntry>) => void;
  removeExtendedFamilyMember: (index: number) => void;
  duplicateExtendedFamilyMember: (index: number) => void;

  // Associate Operations
  associates: AssociateEntry[];
  addAssociate: () => void;
  updateAssociate: (index: number, updates: Partial<AssociateEntry>) => void;
  removeAssociate: (index: number) => void;
  duplicateAssociate: (index: number) => void;

  // Field Operations
  updateField: (fieldPath: string, value: any, entryIndex?: number, subsection?: Section18SubsectionKey) => void;
  updateFieldValue: (path: string, value: any) => void; // ADDED: For SF86FormContext integration
  getFieldValue: (fieldPath: string, entryIndex?: number, subsection?: Section18SubsectionKey) => any;
  
  // Validation
  validate: () => RelativeAssociateValidationResult;
  validateEntry: (subsection: Section18SubsectionKey, entryIndex: number) => RelativeAssociateValidationResult;
  validationErrors: string[];
  validationWarnings: string[];
  
  // Utility
  isComplete: boolean;
  getTotalEntries: () => number;
  getEntriesBySubsection: (subsection: Section18SubsectionKey) => any[];
  exportData: () => Section18;
  importData: (data: Section18) => void;
  resetSection: () => void;
  
  // Integration
  sectionId: number;
  sectionName: string;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section18Context = createContext<Section18ContextType | null>(null);

// ============================================================================
// SECTION 18 PROVIDER
// ============================================================================

export const Section18Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core state
  const [section18Data, setSection18Data] = useState<Section18>(() => createDefaultSection18());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const immediateFamily = useMemo(() => section18Data.section18.immediateFamily, [section18Data]);
  const extendedFamily = useMemo(() => section18Data.section18.extendedFamily, [section18Data]);
  const associates = useMemo(() => section18Data.section18.associates, [section18Data]);
  const isComplete = useMemo(() => isSection18Complete(section18Data), [section18Data]);

  // ============================================================================
  // IMMEDIATE FAMILY OPERATIONS
  // ============================================================================

  const addImmediateFamilyMember = useCallback(() => {
    const newEntry = createDefaultImmediateFamilyEntry();
    setSection18Data(prev => ({
      ...prev,
      section18: {
        ...prev.section18,
        immediateFamily: [...prev.section18.immediateFamily, newEntry]
      }
    }));
    setIsDirty(true);
  }, []);

  const updateImmediateFamilyMember = useCallback((index: number, updates: Partial<ImmediateFamilyEntry>) => {
    setSection18Data(prev => {
      const newData = cloneDeep(prev);
      newData.section18.immediateFamily[index] = {
        ...newData.section18.immediateFamily[index],
        ...updates
      };
      return newData;
    });
    setIsDirty(true);
  }, []);

  const removeImmediateFamilyMember = useCallback((index: number) => {
    setSection18Data(prev => ({
      ...prev,
      section18: {
        ...prev.section18,
        immediateFamily: prev.section18.immediateFamily.filter((_, i) => i !== index)
      }
    }));
    setIsDirty(true);
  }, []);

  const duplicateImmediateFamilyMember = useCallback((index: number) => {
    setSection18Data(prev => {
      const entryToDuplicate = cloneDeep(prev.section18.immediateFamily[index]);
      return {
        ...prev,
        section18: {
          ...prev.section18,
          immediateFamily: [...prev.section18.immediateFamily, entryToDuplicate]
        }
      };
    });
    setIsDirty(true);
  }, []);

  // ============================================================================
  // EXTENDED FAMILY OPERATIONS
  // ============================================================================

  const addExtendedFamilyMember = useCallback(() => {
    const newEntry = createDefaultExtendedFamilyEntry();
    setSection18Data(prev => ({
      ...prev,
      section18: {
        ...prev.section18,
        extendedFamily: [...prev.section18.extendedFamily, newEntry]
      }
    }));
    setIsDirty(true);
  }, []);

  const updateExtendedFamilyMember = useCallback((index: number, updates: Partial<ExtendedFamilyEntry>) => {
    setSection18Data(prev => {
      const newData = cloneDeep(prev);
      newData.section18.extendedFamily[index] = {
        ...newData.section18.extendedFamily[index],
        ...updates
      };
      return newData;
    });
    setIsDirty(true);
  }, []);

  const removeExtendedFamilyMember = useCallback((index: number) => {
    setSection18Data(prev => ({
      ...prev,
      section18: {
        ...prev.section18,
        extendedFamily: prev.section18.extendedFamily.filter((_, i) => i !== index)
      }
    }));
    setIsDirty(true);
  }, []);

  const duplicateExtendedFamilyMember = useCallback((index: number) => {
    setSection18Data(prev => {
      const entryToDuplicate = cloneDeep(prev.section18.extendedFamily[index]);
      return {
        ...prev,
        section18: {
          ...prev.section18,
          extendedFamily: [...prev.section18.extendedFamily, entryToDuplicate]
        }
      };
    });
    setIsDirty(true);
  }, []);

  // ============================================================================
  // ASSOCIATE OPERATIONS
  // ============================================================================

  const addAssociate = useCallback(() => {
    const newEntry = createDefaultAssociateEntry();
    setSection18Data(prev => ({
      ...prev,
      section18: {
        ...prev.section18,
        associates: [...prev.section18.associates, newEntry]
      }
    }));
    setIsDirty(true);
  }, []);

  const updateAssociate = useCallback((index: number, updates: Partial<AssociateEntry>) => {
    setSection18Data(prev => {
      const newData = cloneDeep(prev);
      newData.section18.associates[index] = {
        ...newData.section18.associates[index],
        ...updates
      };
      return newData;
    });
    setIsDirty(true);
  }, []);

  const removeAssociate = useCallback((index: number) => {
    setSection18Data(prev => ({
      ...prev,
      section18: {
        ...prev.section18,
        associates: prev.section18.associates.filter((_, i) => i !== index)
      }
    }));
    setIsDirty(true);
  }, []);

  const duplicateAssociate = useCallback((index: number) => {
    setSection18Data(prev => {
      const entryToDuplicate = cloneDeep(prev.section18.associates[index]);
      return {
        ...prev,
        section18: {
          ...prev.section18,
          associates: [...prev.section18.associates, entryToDuplicate]
        }
      };
    });
    setIsDirty(true);
  }, []);

  // ============================================================================
  // FIELD OPERATIONS
  // ============================================================================

  const updateField = useCallback((
    fieldPath: string, 
    value: any, 
    entryIndex?: number, 
    subsection?: Section18SubsectionKey
  ) => {
    setSection18Data(prev => {
      const newData = cloneDeep(prev);
      
      if (subsection && entryIndex !== undefined) {
        const fullPath = `section18.${subsection}[${entryIndex}].${fieldPath}`;
        set(newData, fullPath, value);
      } else {
        set(newData, `section18.${fieldPath}`, value);
      }
      
      return newData;
    });
    setIsDirty(true);
  }, []);

  const getFieldValue = useCallback((
    fieldPath: string,
    entryIndex?: number,
    subsection?: Section18SubsectionKey
  ) => {
    if (subsection && entryIndex !== undefined) {
      const fullPath = `section18.${subsection}[${entryIndex}].${fieldPath}`;
      return get(section18Data, fullPath);
    }
    return get(section18Data, `section18.${fieldPath}`);
  }, [section18Data]);

  // ============================================================================
  // SF86FORM INTEGRATION FUNCTIONS
  // ============================================================================

  /**
   * Generic field update function for SF86FormContext integration
   * Maps generic field paths to Section 18 specific update functions
   */
  const updateFieldValue = useCallback((path: string, value: any) => {
    console.log(`🔍 Section18: updateFieldValue called with path=${path}, value=`, value);

    // Handle both direct field paths and mapped paths
    let targetPath = path;

    // If the path doesn't start with 'section18.', prepend it
    if (!path.startsWith('section18.')) {
      targetPath = `section18.${path}`;
    }

    setSection18Data(prev => {
      const newData = cloneDeep(prev);
      set(newData, targetPath, value);
      console.log(`✅ Section18: updateFieldValue - field updated at path: ${targetPath}`);
      return newData;
    });
    setIsDirty(true);
  }, []);

  /**
   * Change tracking function for integration
   */
  const getChanges = useCallback((): ChangeSet => {
    // Simple change tracking implementation
    // In a real implementation, you'd compare with initial data
    return {
      section18: {
        oldValue: createDefaultSection18(),
        newValue: section18Data,
        timestamp: new Date()
      }
    };
  }, [section18Data]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validate = useCallback((): RelativeAssociateValidationResult => {
    const context: Section18ValidationContext = {
      rules: {
        requiresImmediateFamilyInfo: true,
        requiresExtendedFamilyInfo: false,
        requiresAssociateInfo: false,
        requiresCitizenshipDocumentation: true,
        requiresContactInformation: true,
        maxNameLength: 100,
        maxAddressLength: 200,
        maxDescriptionLength: 2000,
        minContactFrequency: 'Yearly'
      },
      allowPartialCompletion: false
    };

    const result = validateRelativesAndAssociates(section18Data.section18, context);
    setValidationErrors(result.errors);
    setValidationWarnings(result.warnings);
    return result;
  }, [section18Data]);

  const validateEntry = useCallback((
    subsection: Section18SubsectionKey, 
    entryIndex: number
  ): RelativeAssociateValidationResult => {
    // Create a temporary section with only the specific entry
    const tempSection = {
      immediateFamily: subsection === 'immediateFamily' ? [section18Data.section18.immediateFamily[entryIndex]] : [],
      extendedFamily: subsection === 'extendedFamily' ? [section18Data.section18.extendedFamily[entryIndex]] : [],
      associates: subsection === 'associates' ? [section18Data.section18.associates[entryIndex]] : []
    };

    const context: Section18ValidationContext = {
      rules: {
        requiresImmediateFamilyInfo: true,
        requiresExtendedFamilyInfo: false,
        requiresAssociateInfo: false,
        requiresCitizenshipDocumentation: true,
        requiresContactInformation: true,
        maxNameLength: 100,
        maxAddressLength: 200,
        maxDescriptionLength: 2000,
        minContactFrequency: 'Yearly'
      },
      allowPartialCompletion: true
    };

    return validateRelativesAndAssociates(tempSection, context);
  }, [section18Data]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Integration with main form context using Section 1 gold standard pattern
  // Note: integration variable is used internally by the hook for registration
  const integration = useSection86FormIntegration(
    'section18',
    'Section 18: Relatives and Associates',
    section18Data,
    setSection18Data,
    () => ({ isValid: validate().isValid, errors: validate().errors, warnings: validate().warnings }),
    getChanges,
    updateFieldValue // Pass Section 18's updateFieldValue function to integration
  );

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getTotalEntries = useCallback(() => {
    return immediateFamily.length + extendedFamily.length + associates.length;
  }, [immediateFamily, extendedFamily, associates]);

  const getEntriesBySubsection = useCallback((subsection: Section18SubsectionKey) => {
    switch (subsection) {
      case 'immediateFamily':
        return immediateFamily;
      case 'extendedFamily':
        return extendedFamily;
      case 'associates':
        return associates;
      default:
        return [];
    }
  }, [immediateFamily, extendedFamily, associates]);

  const exportData = useCallback(() => section18Data, [section18Data]);

  const importData = useCallback((data: Section18) => {
    setSection18Data(data);
    setIsDirty(true);
  }, []);

  const resetSection = useCallback(() => {
    setSection18Data(createDefaultSection18());
    setValidationErrors([]);
    setValidationWarnings([]);
    setIsDirty(false);
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section18ContextType = {
    
    // Section 18 specific data
    section18Data,
    
    // Immediate Family
    immediateFamily,
    addImmediateFamilyMember,
    updateImmediateFamilyMember,
    removeImmediateFamilyMember,
    duplicateImmediateFamilyMember,
    
    // Extended Family
    extendedFamily,
    addExtendedFamilyMember,
    updateExtendedFamilyMember,
    removeExtendedFamilyMember,
    duplicateExtendedFamilyMember,
    
    // Associates
    associates,
    addAssociate,
    updateAssociate,
    removeAssociate,
    duplicateAssociate,
    
    // Field Operations
    updateField,
    updateFieldValue, // ADDED: For SF86FormContext integration
    getFieldValue,

    // Validation
    validate,
    validateEntry,
    validationErrors,
    validationWarnings,

    // Utility
    isComplete,
    getTotalEntries,
    getEntriesBySubsection,
    exportData,
    importData,
    resetSection,

    // Integration
    sectionId: 18,
    sectionName: 'Relatives and Associates'
  };

  return (
    <Section18Context.Provider value={contextValue}>
      {children}
    </Section18Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection18 = (): Section18ContextType => {
  const context = useContext(Section18Context);
  if (!context) {
    throw new Error('useSection18 must be used within a Section18Provider');
  }
  return context;
};

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type {
  Section18,
  ImmediateFamilyEntry,
  ExtendedFamilyEntry,
  AssociateEntry,
  Section18SubsectionKey,
  Section18FieldUpdate,
  RelativeAssociateValidationResult
}; 