/**
 * Section 18 Context (REDESIGNED)
 * 
 * Manages state and operations for SF-86 Section 18 based on the actual PDF form structure.
 * The form has 6 relative entries with subsections 18.1-18.5, totaling 964 fields.
 * 
 * STRUCTURE:
 * - 6 Relative Entries (Entry #1-6)
 * - Section 18.1: Basic relative information
 * - Section 18.2: Current address for living relatives
 * - Section 18.3: Citizenship documentation for US citizens
 * - Section 18.4: Documentation for non-US citizens with US address
 * - Section 18.5: Contact info for non-US citizens with foreign address
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { cloneDeep, set, get } from 'lodash';
import type {
  Section18,
  RelativeEntry,
  Section18SubsectionKey
} from '../../../../api/interfaces/sections2.0/Section18';
import {
  generateAllRelativeEntries,
  generateRelativeEntry
} from './section18-field-generator';
import { useSection86FormIntegration } from '../shared/section-context-integration';
import type { ChangeSet } from '../shared/base-interfaces';

// ============================================================================
// SECTION 18 CONTEXT INTERFACE (REDESIGNED)
// ============================================================================

export interface Section18ContextType {
  // Section 18 specific data
  section18Data: Section18;

  // Relative Operations (6 entries)
  relatives: RelativeEntry[];
  addRelative: () => void;
  updateRelative: (entryNumber: number, updates: Partial<RelativeEntry>) => void;
  removeRelative: (entryNumber: number) => void;
  duplicateRelative: (entryNumber: number) => void;
  getRelativeByEntryNumber: (entryNumber: number) => RelativeEntry | undefined;

  // Subsection Operations
  updateSubsection: (entryNumber: number, subsection: Section18SubsectionKey, updates: any) => void;
  getSubsectionData: (entryNumber: number, subsection: Section18SubsectionKey) => any;

  // Field Operations
  updateField: (fieldPath: string, value: any, entryNumber?: number, subsection?: Section18SubsectionKey) => void;
  updateFieldValue: (entryNumber: number, subsection: Section18SubsectionKey, fieldPath: string, newValue: any) => void;
  getFieldValue: (fieldPath: string, entryNumber?: number, subsection?: Section18SubsectionKey) => any;

  // Relative Type Selection
  relativeTypes: any;
  updateRelativeTypeSelection: (relativeType: string, isSelected: boolean) => void;

  // Validation
  validate: () => { isValid: boolean; errors: string[]; warnings: string[] };
  validateEntry: (entryNumber: number) => { isValid: boolean; errors: string[]; warnings: string[] };
  validationErrors: string[];
  validationWarnings: string[];

  // Utility
  isComplete: boolean;
  getTotalEntries: () => number;
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
// DEFAULT DATA CREATION
// ============================================================================

function createDefaultSection18(): Section18 {
  return {
    _id: 18,
    section18: {
      // relativeTypes field is deprecated - relative type selection now happens per entry
      // Each relative entry has its own relativeType dropdown field
      relatives: generateAllRelativeEntries()
    }
  };
}

// ============================================================================
// SECTION 18 PROVIDER (REDESIGNED)
// ============================================================================

export const Section18Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core state
  const [section18Data, setSection18Data] = useState<Section18>(() => {
    console.log('🚀 Section18Provider: Initializing with new structure');
    const defaultData = createDefaultSection18();
    console.log('✅ Section18Provider: Default data created:', defaultData);
    return defaultData;
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const relatives = useMemo(() => section18Data.section18.relatives, [section18Data]);
  const relativeTypes = useMemo(() => section18Data.section18.relativeTypes, [section18Data]);
  const isComplete = useMemo(() => {
    // Basic completion check - at least one relative with basic info
    return relatives.some(relative => 
      relative.section18_1.fullName.firstName.value && 
      relative.section18_1.fullName.lastName.value
    );
  }, [relatives]);

  // ============================================================================
  // RELATIVE OPERATIONS
  // ============================================================================

  const addRelative = useCallback(() => {
    console.log('🔍 Section18: Adding new relative');
    const nextEntryNumber = relatives.length + 1;
    const MAX_RELATIVES = 6;

    if (nextEntryNumber <= MAX_RELATIVES && relatives.length < MAX_RELATIVES) {
      const newEntry = generateRelativeEntry(nextEntryNumber);
      console.log('✅ Section18: Created relative entry:', newEntry);
      setSection18Data(prev => ({
        ...prev,
        section18: {
          ...prev.section18,
          relatives: [...prev.section18.relatives, newEntry]
        }
      }));
      setIsDirty(true);
    } else {
      console.warn(`⚠️ Section18: Cannot add more than ${MAX_RELATIVES} relatives. Current count: ${relatives.length}`);
    }
  }, [relatives.length]);

  const updateRelative = useCallback((entryNumber: number, updates: Partial<RelativeEntry>) => {
    setSection18Data(prev => {
      const newData = cloneDeep(prev);
      const relativeIndex = newData.section18.relatives.findIndex(r => r.entryNumber === entryNumber);
      if (relativeIndex !== -1) {
        newData.section18.relatives[relativeIndex] = {
          ...newData.section18.relatives[relativeIndex],
          ...updates
        };
      }
      return newData;
    });
    setIsDirty(true);
  }, []);

  const removeRelative = useCallback((entryNumber: number) => {
    setSection18Data(prev => ({
      ...prev,
      section18: {
        ...prev.section18,
        relatives: prev.section18.relatives.filter(r => r.entryNumber !== entryNumber)
      }
    }));
    setIsDirty(true);
  }, []);

  const duplicateRelative = useCallback((entryNumber: number) => {
    const relativeToDuplicate = relatives.find(r => r.entryNumber === entryNumber);
    if (relativeToDuplicate && relatives.length < 6) {
      const nextEntryNumber = Math.max(...relatives.map(r => r.entryNumber)) + 1;
      const duplicatedEntry = cloneDeep(relativeToDuplicate);
      duplicatedEntry.entryNumber = nextEntryNumber;
      
      setSection18Data(prev => ({
        ...prev,
        section18: {
          ...prev.section18,
          relatives: [...prev.section18.relatives, duplicatedEntry]
        }
      }));
      setIsDirty(true);
    }
  }, [relatives]);

  const getRelativeByEntryNumber = useCallback((entryNumber: number) => {
    return relatives.find(r => r.entryNumber === entryNumber);
  }, [relatives]);

  // ============================================================================
  // SUBSECTION OPERATIONS
  // ============================================================================

  const updateSubsection = useCallback((
    entryNumber: number, 
    subsection: Section18SubsectionKey, 
    updates: any
  ) => {
    setSection18Data(prev => {
      const newData = cloneDeep(prev);
      const relativeIndex = newData.section18.relatives.findIndex(r => r.entryNumber === entryNumber);
      if (relativeIndex !== -1) {
        newData.section18.relatives[relativeIndex][subsection] = {
          ...newData.section18.relatives[relativeIndex][subsection],
          ...updates
        };
      }
      return newData;
    });
    setIsDirty(true);
  }, []);

  const getSubsectionData = useCallback((entryNumber: number, subsection: Section18SubsectionKey) => {
    const relative = getRelativeByEntryNumber(entryNumber);
    return relative ? relative[subsection] : null;
  }, [getRelativeByEntryNumber]);

  // ============================================================================
  // FIELD OPERATIONS
  // ============================================================================

  const updateField = useCallback((
    fieldPath: string,
    value: any,
    entryNumber?: number,
    subsection?: Section18SubsectionKey
  ) => {
    console.log(`🔧 Section18: updateField called:`, {
      fieldPath,
      value,
      entryNumber,
      subsection
    });

    if (entryNumber !== undefined && subsection) {
      updateFieldValue(entryNumber, subsection, fieldPath, value);
    } else if (fieldPath.startsWith('relativeTypes.')) {
      // Handle relative type selection
      const relativeType = fieldPath.replace('relativeTypes.', '');
      updateRelativeTypeSelection(relativeType, value);
    } else {
      // Handle direct section18 field updates
      setSection18Data(prev => {
        const newData = cloneDeep(prev);
        const fullPath = `section18.${fieldPath}`;
        set(newData, fullPath, value);
        return newData;
      });
      setIsDirty(true);
    }
  }, []);

  const updateFieldValue = useCallback((
    entryNumber: number,
    subsection: Section18SubsectionKey,
    fieldPath: string,
    newValue: any
  ) => {
    console.log(`🔧 Section18: updateFieldValue called:`, {
      entryNumber,
      subsection,
      fieldPath,
      newValue
    });

    setSection18Data(prev => {
      const newData = cloneDeep(prev);
      const relativeIndex = newData.section18.relatives.findIndex(r => r.entryNumber === entryNumber);
      
      if (relativeIndex !== -1) {
        const relative = newData.section18.relatives[relativeIndex];
        const fullFieldPath = `${fieldPath}.value`;
        
        try {
          set(relative[subsection], fullFieldPath, newValue);
          console.log(`✅ Section18: Field updated successfully`);
        } catch (error) {
          console.error(`❌ Section18: Failed to update field:`, error);
        }
      }
      
      return newData;
    });
    setIsDirty(true);
  }, []);

  const getFieldValue = useCallback((
    fieldPath: string,
    entryNumber?: number,
    subsection?: Section18SubsectionKey
  ) => {
    if (entryNumber !== undefined && subsection) {
      const relative = getRelativeByEntryNumber(entryNumber);
      if (relative) {
        return get(relative[subsection], `${fieldPath}.value`);
      }
    }
    return get(section18Data, `section18.${fieldPath}`);
  }, [section18Data, getRelativeByEntryNumber]);

  // ============================================================================
  // RELATIVE TYPE SELECTION
  // ============================================================================

  /**
   * DEPRECATED: updateRelativeTypeSelection
   * Relative type selection now happens per entry via updateRelativeEntry
   * This function is kept for backward compatibility but does nothing
   */
  const updateRelativeTypeSelection = useCallback((_relativeType: string, _isSelected: boolean) => {
    console.warn('⚠️ Section18: updateRelativeTypeSelection is deprecated. Use updateRelativeEntry to set relativeType per entry.');
    // No-op - relative type selection now happens per entry
  }, []);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validate = useCallback(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation - check if at least one relative has required info
    const hasValidRelative = relatives.some(relative => 
      relative.section18_1.fullName.firstName.value && 
      relative.section18_1.fullName.lastName.value &&
      relative.section18_1.relativeType.value
    );

    if (!hasValidRelative) {
      errors.push('At least one relative must have a name and relationship type');
    }

    setValidationErrors(errors);
    setValidationWarnings(warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [relatives]);

  const validateEntry = useCallback((entryNumber: number) => {
    const relative = getRelativeByEntryNumber(entryNumber);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (relative) {
      if (!relative.section18_1.fullName.firstName.value) {
        errors.push('First name is required');
      }
      if (!relative.section18_1.fullName.lastName.value) {
        errors.push('Last name is required');
      }
      if (!relative.section18_1.relativeType.value) {
        errors.push('Relationship type is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [getRelativeByEntryNumber]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getTotalEntries = useCallback(() => relatives.length, [relatives]);

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
  // CHANGE TRACKING
  // ============================================================================

  const getChanges = useCallback((): ChangeSet => {
    return {
      section18: {
        oldValue: createDefaultSection18(),
        newValue: section18Data,
        timestamp: new Date()
      }
    };
  }, [section18Data]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  const updateFieldValueWrapper = useCallback((path: string, value: any) => {
    console.log(`🔧 Section18: updateFieldValueWrapper called with path=${path}, value=`, value);

    // Parse path format: "section18.relatives[0].section18_1.fullName.firstName.value"
    const pathParts = path.split('.');

    if (pathParts.length >= 4 && pathParts[0] === 'section18' && pathParts[1] === 'relatives') {
      const relativeMatch = pathParts[1].match(/relatives\[(\d+)\]/);
      if (relativeMatch) {
        const relativeIndex = parseInt(relativeMatch[1]);
        const entryNumber = relativeIndex + 1; // Convert index to entry number
        const subsection = pathParts[2] as Section18SubsectionKey;
        const fieldPath = pathParts.slice(3).join('.');
        
        // Remove .value suffix if present
        const cleanFieldPath = fieldPath.endsWith('.value') ? fieldPath.slice(0, -6) : fieldPath;
        
        updateFieldValue(entryNumber, subsection, cleanFieldPath, value);
        return;
      }
    }

    // Fallback for other paths
    setSection18Data(prev => {
      const updated = cloneDeep(prev);
      set(updated, path, value);
      setIsDirty(true);
      return updated;
    });
  }, [updateFieldValue]);

  // Integration with main form context
  const _integration = useSection86FormIntegration(
    'section18',
    'Section 18: Relatives',
    section18Data,
    setSection18Data,
    validate,
    getChanges,
    updateFieldValueWrapper
  );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section18ContextType = {
    // Section 18 specific data
    section18Data,

    // Relative Operations
    relatives,
    addRelative,
    updateRelative,
    removeRelative,
    duplicateRelative,
    getRelativeByEntryNumber,

    // Subsection Operations
    updateSubsection,
    getSubsectionData,

    // Field Operations
    updateField,
    updateFieldValue,
    getFieldValue,

    // Relative Type Selection
    relativeTypes,
    updateRelativeTypeSelection,

    // Validation
    validate,
    validateEntry,
    validationErrors,
    validationWarnings,

    // Utility
    isComplete,
    getTotalEntries,
    exportData,
    importData,
    resetSection,

    // Integration
    sectionId: 18,
    sectionName: 'Relatives'
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
  RelativeEntry,
  Section18SubsectionKey
};
