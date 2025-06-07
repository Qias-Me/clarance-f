/**
 * Section 22: Police Record - Context Provider
 *
 * FIXED: Replaced Enhanced Section Template with Section 29 pattern for better SF86FormContext integration
 * This implementation follows Section 29 patterns for proper data persistence and field updates.
 *
 * Features:
 * - Direct Section 29-style context implementation
 * - Proper SF86FormContext integration with updateFieldValue wrapper
 * - Police record subsections management
 * - Field<T> interface compliance
 * - IndexedDB persistence support
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { cloneDeep, set, get } from 'lodash';
import type {
  Section22,
  Section22FieldUpdate,
  PoliceRecordValidationResult,
  Section22ValidationContext,
  Section22SubsectionKey,
  PoliceRecordEntry,
  DomesticViolenceOrderEntry
} from '../../../../api/interfaces/sections2.0/section22';
import {
  createDefaultSection22,
  createDefaultPoliceRecordEntry,
  createDefaultDomesticViolenceEntry,
  validateSection22,
  validatePoliceRecordEntry,
  validateDomesticViolenceOrderEntry,
  updateSection22Field,
  getTotalPoliceRecordEntries,
  hasAnyPoliceRecordIssues
} from '../../../../api/interfaces/sections2.0/section22';
import { useSection86FormIntegration } from '../shared/section-context-integration';

// ============================================================================
// CONTEXT DEFINITION (Following Section 29 Pattern)
// ============================================================================

interface Section22ContextType {
  // State
  section22Data: Section22;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updateSubsectionFlag: (subsectionKey: Section22SubsectionKey, flagType: string, value: 'YES' | 'NO') => void;
  addEntry: (subsectionKey: Section22SubsectionKey) => void;
  removeEntry: (subsectionKey: Section22SubsectionKey, entryIndex: number) => void;
  updateFieldValue: (subsectionKey: Section22SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => void;

  // Section-specific computed values
  getTotalPoliceRecordEntries: () => number;
  getSubsectionEntryCount: (subsectionKey: Section22SubsectionKey) => number;
  hasAnyPoliceRecordIssues: () => boolean;

  // Section-specific validation
  validateEntry: (subsectionKey: Section22SubsectionKey, entryIndex: number) => PoliceRecordValidationResult;
  validateSubsection: (subsectionKey: Section22SubsectionKey) => PoliceRecordValidationResult;
  validateSection: () => boolean;

  // Utility functions
  getEntryById: (subsectionKey: Section22SubsectionKey, entryId: string | number) => any | null;
  resetSection: () => void;
  loadSection: (data: Section22) => void;
  getChanges: () => any;
}

const Section22Context = createContext<Section22ContextType | null>(null);

// ============================================================================
// PROVIDER IMPLEMENTATION (Following Section 29 Pattern)
// ============================================================================

export const Section22Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [section22Data, setSection22Data] = useState<Section22>(createDefaultSection22);
  const [isLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Safeguard: Prevent data loss during save operations
  const currentDataRef = useRef<Section22>(section22Data);
  useEffect(() => {
    currentDataRef.current = section22Data;
  }, [section22Data]);

  // Initialize section data
  useEffect(() => {
    if (!isInitialized) {
      console.log('🔧 Section22: Initializing with default data');
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // ============================================================================
  // CORE ACTIONS (Following Section 29 Pattern)
  // ============================================================================

  const updateSubsectionFlag = useCallback((subsectionKey: Section22SubsectionKey, flagType: string, value: 'YES' | 'NO') => {
    console.log(`🔧 Section22: updateSubsectionFlag called:`, { subsectionKey, flagType, value });
    
    setSection22Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated.section22[subsectionKey] as any;
      
      if (subsection[flagType] && typeof subsection[flagType] === 'object' && 'value' in subsection[flagType]) {
        subsection[flagType].value = value;
        console.log(`✅ Section22: updateSubsectionFlag - updated ${flagType} to ${value}`);
      }
      
      setIsDirty(true);
      return updated;
    });
  }, []);

  const addEntry = useCallback((subsectionKey: Section22SubsectionKey) => {
    console.log(`🔧 Section22: addEntry called for subsection: ${subsectionKey}`);
    
    setSection22Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated.section22[subsectionKey];
      
      let newEntry: any;
      if (subsectionKey === 'domesticViolenceOrders') {
        newEntry = createDefaultDomesticViolenceEntry();
      } else {
        newEntry = createDefaultPoliceRecordEntry();
      }
      
      subsection.entries.push(newEntry);
      subsection.entriesCount = subsection.entries.length;
      
      console.log(`✅ Section22: addEntry - added entry to ${subsectionKey}, new count: ${subsection.entriesCount}`);
      setIsDirty(true);
      return updated;
    });
  }, []);

  const removeEntry = useCallback((subsectionKey: Section22SubsectionKey, entryIndex: number) => {
    console.log(`🔧 Section22: removeEntry called:`, { subsectionKey, entryIndex });
    
    setSection22Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated.section22[subsectionKey];
      
      if (entryIndex >= 0 && entryIndex < subsection.entries.length) {
        subsection.entries.splice(entryIndex, 1);
        subsection.entriesCount = subsection.entries.length;
        console.log(`✅ Section22: removeEntry - removed entry from ${subsectionKey}, new count: ${subsection.entriesCount}`);
        setIsDirty(true);
      }
      
      return updated;
    });
  }, []);

  const updateFieldValue = useCallback((
    subsectionKey: Section22SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    newValue: any
  ) => {
    console.log(`🔧 Section22: updateFieldValue called:`, { subsectionKey, entryIndex, fieldPath, newValue });
    
    setSection22Data(prev => {
      const updated = cloneDeep(prev);
      const subsection = updated.section22[subsectionKey];
      
      if (subsection?.entries && entryIndex >= 0 && entryIndex < subsection.entries.length) {
        const entry = subsection.entries[entryIndex];
        
        try {
          set(entry, `${fieldPath}.value`, newValue);
          console.log(`✅ Section22: updateFieldValue - field updated successfully`);
          setIsDirty(true);
        } catch (error) {
          console.error(`❌ Section22: updateFieldValue - failed:`, error);
        }
      } else {
        console.error(`❌ Section22: updateFieldValue - invalid entry access:`, {
          hasSubsection: !!subsection,
          hasEntries: !!subsection?.entries,
          entriesLength: subsection?.entries?.length,
          entryIndex
        });
      }
      
      return updated;
    });
  }, []);

  // ============================================================================
  // COMPUTED VALUES AND VALIDATION
  // ============================================================================

  const getTotalPoliceRecordEntriesCount = useCallback((): number => {
    return getTotalPoliceRecordEntries(section22Data);
  }, [section22Data]);

  const getSubsectionEntryCount = useCallback((subsectionKey: Section22SubsectionKey): number => {
    return section22Data.section22[subsectionKey].entriesCount;
  }, [section22Data]);

  const hasAnyPoliceRecordIssuesReported = useCallback((): boolean => {
    return hasAnyPoliceRecordIssues(section22Data);
  }, [section22Data]);

  const validateSection = useCallback((): boolean => {
    const validationContext: Section22ValidationContext = {
      currentDate: new Date(),
      rules: {
        timeframeYears: 7,
        trafficFineThreshold: 300,
        requiresCourtInfo: true,
        requiresIncidentDetails: true,
        requiresLocationInfo: true,
        allowsEstimatedDates: true,
        maxDescriptionLength: 2000,
        requiresDocumentation: false
      }
    };
    
    const result = validateSection22(section22Data, validationContext);
    return result.isValid;
  }, [section22Data]);

  const getChanges = useCallback(() => {
    const changes: any = {};
    if (isDirty) {
      changes['section22'] = {
        oldValue: createDefaultSection22(),
        newValue: section22Data,
        timestamp: new Date()
      };
    }
    return changes;
  }, [section22Data, isDirty]);

  const resetSection = useCallback(() => {
    console.log('🔧 Section22: resetSection called');
    setSection22Data(createDefaultSection22());
    setIsDirty(false);
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section22) => {
    console.log('🔧 Section22: loadSection called with data:', data);
    setSection22Data(cloneDeep(data));
    setIsDirty(false);
  }, []);

  // ============================================================================
  // ADDITIONAL VALIDATION AND UTILITY FUNCTIONS
  // ============================================================================

  const validateEntry = useCallback((subsectionKey: Section22SubsectionKey, entryIndex: number): PoliceRecordValidationResult => {
    const entry = section22Data.section22[subsectionKey].entries[entryIndex];
    if (!entry) {
      return {
        isValid: false,
        errors: ['Entry not found'],
        warnings: [],
        missingRequiredFields: [],
        dateRangeIssues: [],
        inconsistencies: []
      };
    }

    const validationContext: Section22ValidationContext = {
      currentDate: new Date(),
      rules: {
        timeframeYears: 7,
        trafficFineThreshold: 300,
        requiresCourtInfo: true,
        requiresIncidentDetails: true,
        requiresLocationInfo: true,
        allowsEstimatedDates: true,
        maxDescriptionLength: 2000,
        requiresDocumentation: false
      }
    };

    if (subsectionKey === 'domesticViolenceOrders') {
      return validateDomesticViolenceOrderEntry(entry as DomesticViolenceOrderEntry, validationContext);
    } else {
      return validatePoliceRecordEntry(entry as PoliceRecordEntry, validationContext);
    }
  }, [section22Data]);

  const validateSubsection = useCallback((subsectionKey: Section22SubsectionKey): PoliceRecordValidationResult => {
    const combinedResult: PoliceRecordValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      missingRequiredFields: [],
      dateRangeIssues: [],
      inconsistencies: []
    };

    const subsection = section22Data.section22[subsectionKey];
    subsection.entries.forEach((entry: any, index: number) => {
      const entryValidation = validateEntry(subsectionKey, index);

      if (!entryValidation.isValid) {
        combinedResult.isValid = false;
      }

      combinedResult.errors.push(...entryValidation.errors.map(error => `Entry ${index + 1}: ${error}`));
      combinedResult.warnings.push(...entryValidation.warnings.map(warning => `Entry ${index + 1}: ${warning}`));
      combinedResult.missingRequiredFields.push(...entryValidation.missingRequiredFields.map(field => `Entry ${index + 1}: ${field}`));
      combinedResult.dateRangeIssues.push(...entryValidation.dateRangeIssues.map(issue => `Entry ${index + 1}: ${issue}`));
      combinedResult.inconsistencies.push(...entryValidation.inconsistencies.map(inconsistency => `Entry ${index + 1}: ${inconsistency}`));
    });

    return combinedResult;
  }, [section22Data, validateEntry]);

  const getEntryById = useCallback((subsectionKey: Section22SubsectionKey, entryId: string | number): any | null => {
    const subsection = section22Data.section22[subsectionKey];
    return subsection.entries.find((entry: any) => entry._id.value === entryId) || null;
  }, [section22Data]);

  // ============================================================================
  // SF86FORM INTEGRATION (Following Section 29 Pattern)
  // ============================================================================

  // Create a wrapper function that matches the integration hook's expected signature
  // Integration expects: (path: string, value: any) => void
  // Section 22 has: (subsectionKey, entryIndex, fieldPath, newValue) => void
  const updateFieldValueWrapper = useCallback((path: string, value: any) => {
    console.log(`🔧 Section22: updateFieldValueWrapper called with path=${path}, value=`, value);

    // Parse the path to extract subsection, entry index, and field path
    // Expected format: "section22.subsectionKey.entries[index].fieldPath" or "section22.subsectionKey.flagField"
    const pathParts = path.split('.');

    if (pathParts.length >= 3 && pathParts[0] === 'section22') {
      const subsectionKey = pathParts[1] as Section22SubsectionKey;

      // Check if this is a subsection flag update
      if (pathParts.length === 3 && [
        'hasSummonsOrCitation', 'hasArrest', 'hasChargedOrConvicted',
        'hasProbationOrParole', 'hasCurrentTrial', 'hasCurrentOrder',
        'hasMilitaryCourtProceedings', 'hasForeignCourtProceedings'
      ].includes(pathParts[2])) {
        updateSubsectionFlag(subsectionKey, pathParts[2], value);
        return;
      }

      // Check if this is an entry field update
      const entriesMatch = pathParts[2].match(/entries\[(\d+)\]/);
      if (entriesMatch) {
        const entryIndex = parseInt(entriesMatch[1]);
        const fieldPath = pathParts.slice(3).join('.');

        // Call Section 22's updateFieldValue with the correct signature
        updateFieldValue(subsectionKey, entryIndex, fieldPath, value);
        return;
      }
    }

    // Fallback: use lodash set for direct path updates
    console.log(`🔧 Section22: Using fallback lodash set for path: ${path}`);
    setSection22Data(prev => {
      const updated = cloneDeep(prev);
      set(updated, path, value);
      return updated;
    });
  }, [updateFieldValue, updateSubsectionFlag]);

  // Integration with main form context using Section 29 pattern
  const integration = useSection86FormIntegration(
    'section22',
    'Section 22: Police Record',
    section22Data,
    setSection22Data,
    () => ({ isValid: validateSection(), errors: [], warnings: [] }),
    () => getChanges(),
    updateFieldValueWrapper // Pass wrapper function that matches expected signature
  );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section22ContextType = {
    // State
    section22Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updateSubsectionFlag,
    addEntry,
    removeEntry,
    updateFieldValue,

    // Section-specific computed values
    getTotalPoliceRecordEntries: getTotalPoliceRecordEntriesCount,
    getSubsectionEntryCount,
    hasAnyPoliceRecordIssues: hasAnyPoliceRecordIssuesReported,

    // Section-specific validation
    validateEntry,
    validateSubsection,
    validateSection,

    // Utility functions
    getEntryById,
    resetSection,
    loadSection,
    getChanges
  };

  return (
    <Section22Context.Provider value={contextValue}>
      {children}
    </Section22Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection22 = (): Section22ContextType => {
  const context = useContext(Section22Context);
  if (!context) {
    throw new Error('useSection22 must be used within a Section22Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export type { Section22 } from '../../../../api/interfaces/sections2.0/section22';
