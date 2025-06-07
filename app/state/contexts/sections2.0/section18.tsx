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
  updateFieldValue: (subsection: Section18SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => void; // FIXED: Section 18 specific signature
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
  // Core state with enhanced logging
  const [section18Data, setSection18Data] = useState<Section18>(() => {
    // console.log('🚀 Section18Provider: Initializing with createDefaultSection18()');
    const defaultData = createDefaultSection18();
    // console.log('✅ Section18Provider: Default data created:', defaultData);
    return defaultData;
  });
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
    console.log('🔍 Section18: Adding immediate family member');
    const newEntry = createDefaultImmediateFamilyEntry();
    console.log('✅ Section18: Created immediate family entry:', newEntry);
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
    console.log('🔍 Section18: Adding extended family member');
    const newEntry = createDefaultExtendedFamilyEntry();
    console.log('✅ Section18: Created extended family entry:', newEntry);
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
    console.log('🔍 Section18: Adding associate');
    const newEntry = createDefaultAssociateEntry();
    console.log('✅ Section18: Created associate entry:', newEntry);
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
    console.log(`🔧 Section18: updateField called:`, {
      fieldPath,
      value,
      entryIndex,
      subsection
    });

    if (subsection && entryIndex !== undefined) {
      // Remove ".value" suffix if present since updateFieldValue adds it
      const cleanFieldPath = fieldPath.endsWith('.value') ? fieldPath.slice(0, -6) : fieldPath;

      console.log(`🔍 Section18: updateField - calling updateFieldValue with:`, {
        subsection,
        entryIndex,
        cleanFieldPath,
        value
      });

      // Use the new updateFieldValue function for subsection entries
      updateFieldValue(subsection, entryIndex, cleanFieldPath, value);
    } else {
      // Handle direct section18 field updates (if any)
      console.log(`🔍 Section18: updateField - direct field update:`, fieldPath);
      setSection18Data(prev => {
        const newData = cloneDeep(prev);
        const fullPath = `section18.${fieldPath}`;
        set(newData, fullPath, value);
        console.log(`✅ Section18: updateField - set ${fullPath} to:`, value);
        return newData;
      });
      setIsDirty(true);
    }

    console.log(`✅ Section18: updateField completed`);
  }, [updateFieldValue]);

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
   * FIXED: Section 18 specific field update function following Section 29 pattern
   * This is the internal updateFieldValue that handles component-level updates
   */
  const updateFieldValue = useCallback((
    subsection: Section18SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    newValue: any
  ) => {
    console.log(`🔧 Section18: updateFieldValue called:`, {
      subsection,
      entryIndex,
      fieldPath,
      newValue
    });

    try {
      setSection18Data(prev => {
        console.log(`🔍 Section18: updateFieldValue - starting with prev data:`, prev);

        const updated = cloneDeep(prev);
        const subsectionData = updated.section18[subsection];

        console.log(`🔍 Section18: updateFieldValue - subsection found:`, !!subsectionData);
        console.log(`🔍 Section18: updateFieldValue - entries length:`, subsectionData?.length);
        console.log(`🔍 Section18: updateFieldValue - entryIndex valid:`,
          entryIndex >= 0 && entryIndex < (subsectionData?.length || 0));

        if (subsectionData && entryIndex >= 0 && entryIndex < subsectionData.length) {
          const entry = subsectionData[entryIndex];
          console.log(`🔍 Section18: updateFieldValue - entry before update:`, entry);
          console.log(`🔍 Section18: updateFieldValue - field path: ${fieldPath}.value`);
          console.log(`🔍 Section18: updateFieldValue - current field value:`, get(entry, `${fieldPath}.value`));

          try {
            set(entry, `${fieldPath}.value`, newValue);
            console.log(`✅ Section18: updateFieldValue - lodash set completed successfully`);
          } catch (setError) {
            console.error(`❌ Section18: updateFieldValue - lodash set failed:`, setError);
            throw setError;
          }

          console.log(`✅ Section18: updateFieldValue - field updated successfully`);
          console.log(`🔍 Section18: updateFieldValue - new field value:`, get(entry, `${fieldPath}.value`));
          console.log(`🔍 Section18: updateFieldValue - entry after update:`, entry);

          setIsDirty(true);
          console.log(`🔄 Section18: updateFieldValue - setIsDirty(true) called`);
        } else {
          console.error(`❌ Section18: updateFieldValue - invalid entry access:`, {
            hasSubsection: !!subsectionData,
            entriesLength: subsectionData?.length,
            entryIndex,
            subsection
          });
        }

        console.log(`🔍 Section18: updateFieldValue - returning updated data:`, updated);
        return updated;
      });

      console.log(`✅ Section18: updateFieldValue - setSection18Data completed successfully`);
    } catch (error) {
      console.error(`❌ Section18: updateFieldValue - CRITICAL ERROR:`, error);
      console.error(`❌ Section18: updateFieldValue - Error stack:`,
        error instanceof Error ? error.stack : "No stack trace available");
    }
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

  // ============================================================================
  // SF86FORMCONTEXT INTEGRATION WRAPPER
  // ============================================================================

  /**
   * Wrapper function for SF86FormContext integration following Section 29 pattern
   * Converts SF86FormContext paths to Section 18's updateFieldValue signature
   */
  const updateFieldValueWrapper = useCallback((path: string, value: any) => {
    console.log(`🔧 Section18: updateFieldValueWrapper called with path=${path}, value=`, value);

    // Parse the path to extract subsection, entry index, and field path
    // Expected format: "section18.subsectionKey[index].fieldPath"
    const pathParts = path.split('.');

    if (pathParts.length >= 3 && pathParts[0] === 'section18') {
      const subsectionWithIndex = pathParts[1]; // e.g., "immediateFamily[0]"
      const fieldPath = pathParts.slice(2).join('.'); // e.g., "fullName.firstName.value"

      // Extract subsection and index from "subsectionKey[index]" format
      const subsectionMatch = subsectionWithIndex.match(/^(\w+)\[(\d+)\]$/);
      if (subsectionMatch) {
        const subsectionKey = subsectionMatch[1] as Section18SubsectionKey;
        const entryIndex = parseInt(subsectionMatch[2]);

        console.log(`🔍 Section18: Parsed path - subsection: ${subsectionKey}, index: ${entryIndex}, field: ${fieldPath}`);

        // Remove ".value" suffix if present since updateFieldValue adds it
        const cleanFieldPath = fieldPath.endsWith('.value') ? fieldPath.slice(0, -6) : fieldPath;

        // Call Section 18's updateFieldValue with the correct signature
        updateFieldValue(subsectionKey, entryIndex, cleanFieldPath, value);
        return;
      }
    }

    // Fallback: use lodash set for direct path updates
    console.warn(`⚠️ Section18: Unmatched path format: ${path}, using fallback update`);
    setSection18Data(prev => {
      const updated = cloneDeep(prev);
      set(updated, path, value);
      setIsDirty(true);
      return updated;
    });
  }, [updateFieldValue]);

  // Integration with main form context using Section 29 pattern
  // Note: integration variable is used internally by the hook for registration
  const integration = useSection86FormIntegration(
    'section18',
    'Section 18: Relatives and Associates',
    section18Data,
    setSection18Data,
    () => ({ isValid: validate().isValid, errors: validate().errors, warnings: validate().warnings }),
    getChanges,
    updateFieldValueWrapper // Pass wrapper function that matches expected signature
  );

  // ============================================================================
  // SF86FORM CONTEXT SYNCHRONIZATION
  // ============================================================================

  // Sync Section 18 data to SF86FormContext whenever it changes
  // This ensures the central form context always has the latest Section 18 data
  useEffect(() => {
    // Only sync if we have a valid SF86FormContext and section18Data has been initialized
    if (section18Data && section18Data._id === 18) {
      console.log(`🔄 Section18: Syncing data to SF86FormContext:`, section18Data);

      // Use a small delay to ensure state updates are complete
      const syncTimeout = setTimeout(() => {
        try {
          // The integration hook should handle this automatically, but we can also
          // emit a data sync event to ensure the central context is updated
          integration.emitDataSync('data_updated', section18Data);
          console.log(`✅ Section18: Data sync event emitted successfully`);
        } catch (error) {
          console.error(`❌ Section18: Error syncing data to SF86FormContext:`, error);
        }
      }, 50); // Small delay to ensure state consistency

      return () => clearTimeout(syncTimeout);
    }
  }, [section18Data, integration]);

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
    updateFieldValue, // Section 18 specific signature for component use
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