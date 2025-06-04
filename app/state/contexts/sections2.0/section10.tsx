/**
 * Section 10: Dual/Multiple Citizenship & Foreign Passport - Context
 *
 * React context for managing SF-86 Section 10 data state and operations.
 * This section handles dual citizenship information and foreign passport details.
 *
 * Updated to follow Section 1 gold standard pattern with useSection86FormIntegration.
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type {
  Section10,
  DualCitizenshipEntry,
  ForeignPassportEntry,
} from '../../../../api/interfaces/sections2.0/section10';
import {
  createDefaultSection10,
  createDualCitizenshipEntry,
  createForeignPassportEntry,
  addDualCitizenshipEntry,
  addForeignPassportEntry,
  removeDualCitizenshipEntry,
  removeForeignPassportEntry
} from '../../../../api/interfaces/sections2.0/section10';
import { useSection86FormIntegration } from '../shared/section-context-integration';

// Debug mode flag
const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

// ============================================================================
// CONTEXT INTERFACE FOLLOWING SECTION 1 GOLD STANDARD
// ============================================================================

/**
 * Section 10 Context interface following Section 1 gold standard pattern
 */
interface Section10ContextType {
  // State
  section10Data: Section10;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Dual Citizenship Actions
  updateDualCitizenshipFlag: (value: string) => void;
  addDualCitizenship: () => void;
  removeDualCitizenship: (index: number) => void;
  updateDualCitizenship: (index: number, field: string, value: any) => void;

  // Foreign Passport Actions
  updateForeignPassportFlag: (value: string) => void;
  addForeignPassport: () => void;
  removeForeignPassport: (index: number) => void;
  updateForeignPassport: (index: number, field: string, value: any) => void;

  // Utility Functions
  resetSection: () => void;
  loadSection: (data: Section10) => void;
  validateSection: () => { isValid: boolean; errors: any[]; warnings: any[] };
  getChanges: () => any;
}

// ============================================================================
// CONTEXT IMPLEMENTATION FOLLOWING SECTION 1 GOLD STANDARD
// ============================================================================

const Section10Context = createContext<Section10ContextType | undefined>(undefined);

export const Section10Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [section10Data, setSection10Data] = useState<Section10>(() => createDefaultSection10());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const currentDataRef = useRef(section10Data);

  // Update ref when data changes
  useEffect(() => {
    currentDataRef.current = section10Data;
  }, [section10Data]);

  if (isDebugMode) {
    console.log('🔄 Section10: Current data state:', section10Data);
  }

  // ============================================================================
  // UTILITY FUNCTIONS (DECLARED EARLY FOR INTEGRATION)
  // ============================================================================

  const validateSection = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const validationErrors: Array<{ field: string, message: string, code: string, severity: 'error' | 'warning' }> = [];
    const warnings: Array<{ field: string, message: string, code: string, severity: 'error' | 'warning' }> = [];

    // Validate dual citizenship entries
    if (section10Data.section10.dualCitizenship.hasDualCitizenship.value === 'YES') {
      section10Data.section10.dualCitizenship.entries.forEach((entry, index) => {
        if (!entry.country.value) {
          const errorMsg = 'Country is required';
          newErrors[`dualCitizenship.entries[${index}].country`] = errorMsg;
          validationErrors.push({
            field: `dualCitizenship.entries[${index}].country`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }

        if (!entry.howAcquired.value) {
          const errorMsg = 'How citizenship was acquired is required';
          newErrors[`dualCitizenship.entries[${index}].howAcquired`] = errorMsg;
          validationErrors.push({
            field: `dualCitizenship.entries[${index}].howAcquired`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }

        if (!entry.fromDate.value) {
          const errorMsg = 'From date is required';
          newErrors[`dualCitizenship.entries[${index}].fromDate`] = errorMsg;
          validationErrors.push({
            field: `dualCitizenship.entries[${index}].fromDate`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }

        if (!entry.toDate.value && !entry.isPresent.value) {
          const errorMsg = 'To date is required (or check Present)';
          newErrors[`dualCitizenship.entries[${index}].toDate`] = errorMsg;
          validationErrors.push({
            field: `dualCitizenship.entries[${index}].toDate`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }
      });
    }

    // Validate foreign passport entries
    if (section10Data.section10.foreignPassport.hasForeignPassport.value === 'YES') {
      section10Data.section10.foreignPassport.entries.forEach((entry, index) => {
        if (!entry.country.value) {
          const errorMsg = 'Country is required';
          newErrors[`foreignPassport.entries[${index}].country`] = errorMsg;
          validationErrors.push({
            field: `foreignPassport.entries[${index}].country`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }

        if (!entry.passportNumber.value) {
          const errorMsg = 'Passport number is required';
          newErrors[`foreignPassport.entries[${index}].passportNumber`] = errorMsg;
          validationErrors.push({
            field: `foreignPassport.entries[${index}].passportNumber`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }

        if (!entry.issueDate.value) {
          const errorMsg = 'Issue date is required';
          newErrors[`foreignPassport.entries[${index}].issueDate`] = errorMsg;
          validationErrors.push({
            field: `foreignPassport.entries[${index}].issueDate`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }

        if (!entry.city.value) {
          const errorMsg = 'City is required';
          newErrors[`foreignPassport.entries[${index}].city`] = errorMsg;
          validationErrors.push({
            field: `foreignPassport.entries[${index}].city`,
            message: errorMsg,
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }
      });
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: validationErrors,
      warnings
    };
  }, [section10Data]);

  const getChanges = useCallback(() => {
    // Return changes for tracking purposes following Section 1 pattern
    return isDirty ? section10Data : null;
  }, [section10Data, isDirty]);

  // ============================================================================
  // SF86FORM INTEGRATION FOLLOWING SECTION 1 GOLD STANDARD
  // ============================================================================

  // Integration with main form context using Section 1 gold standard pattern
  // Note: integration variable is used internally by the hook for registration
  const integration = useSection86FormIntegration(
    'section10',
    'Section 10: Dual/Multiple Citizenship & Foreign Passport',
    section10Data,
    setSection10Data,
    () => ({ isValid: validateSection().isValid, errors: validateSection().errors, warnings: validateSection().warnings }),
    getChanges,
    undefined // updateFieldValue will be defined after integration
  );

  // ============================================================================
  // FIELD UPDATE FUNCTION FOLLOWING SECTION 1 PATTERN
  // ============================================================================

  /**
   * Updates a field value in the section data following Section 1 pattern
   * This function maps generic field paths to section-specific updates
   */
  const updateFieldValue = useCallback((path: string, value: any) => {
    if (isDebugMode) {
      console.log(`🔄 Section10: updateFieldValue called with path: ${path}, value:`, value);
    }

    setSection10Data(prev => {
      const newData = { ...prev };

      // Handle main flag fields
      if (path === 'section10.dualCitizenship.hasDualCitizenship') {
        newData.section10.dualCitizenship.hasDualCitizenship.value = value;
      } else if (path === 'section10.foreignPassport.hasForeignPassport') {
        newData.section10.foreignPassport.hasForeignPassport.value = value;
      }
      // Handle entry fields
      else if (path.includes('dualCitizenship.entries')) {
        // Parse path like: section10.dualCitizenship.entries[0].country
        const match = path.match(/entries\[(\d+)\]\.(\w+)/);
        if (match) {
          const index = parseInt(match[1]);
          const field = match[2];

          // Ensure entry exists
          while (newData.section10.dualCitizenship.entries.length <= index) {
            newData.section10.dualCitizenship.entries.push(createDualCitizenshipEntry(newData.section10.dualCitizenship.entries.length));
          }

          if (newData.section10.dualCitizenship.entries[index] && newData.section10.dualCitizenship.entries[index][field as keyof DualCitizenshipEntry]) {
            (newData.section10.dualCitizenship.entries[index][field as keyof DualCitizenshipEntry] as any).value = value;
          }
        }
      } else if (path.includes('foreignPassport.entries')) {
        // Parse path like: section10.foreignPassport.entries[0].country
        const match = path.match(/entries\[(\d+)\]\.(\w+)/);
        if (match) {
          const index = parseInt(match[1]);
          const field = match[2];

          // Ensure entry exists
          while (newData.section10.foreignPassport.entries.length <= index) {
            newData.section10.foreignPassport.entries.push(createForeignPassportEntry(newData.section10.foreignPassport.entries.length));
          }

          if (newData.section10.foreignPassport.entries[index] && newData.section10.foreignPassport.entries[index][field as keyof ForeignPassportEntry]) {
            (newData.section10.foreignPassport.entries[index][field as keyof ForeignPassportEntry] as any).value = value;
          }
        }
      }

      setIsDirty(true);

      // Sync data to SF86FormContext cache - CRITICAL for data persistence
      integration.emitDataSync('data_updated', newData);
      console.log(`🔄 Section10: updateFieldValue - synced data to SF86FormContext`);

      return newData;
    });
  }, [integration]);

  // ============================================================================
  // DUAL CITIZENSHIP ACTIONS FOLLOWING SECTION 1 PATTERN
  // ============================================================================

  const updateDualCitizenshipFlag = useCallback((value: string) => {
    updateFieldValue('section10.dualCitizenship.hasDualCitizenship', value);
  }, [updateFieldValue]);

  const addDualCitizenship = useCallback(() => {
    setSection10Data(prev => {
      const newData = addDualCitizenshipEntry(prev);
      // Sync data to SF86FormContext cache
      integration.emitDataSync('data_updated', newData);
      return newData;
    });
    setIsDirty(true);
  }, [integration]);

  const removeDualCitizenship = useCallback((index: number) => {
    setSection10Data(prev => {
      const newData = removeDualCitizenshipEntry(prev, index);
      // Sync data to SF86FormContext cache
      integration.emitDataSync('data_updated', newData);
      return newData;
    });
    setIsDirty(true);
  }, [integration]);

  const updateDualCitizenship = useCallback((index: number, field: string, value: any) => {
    updateFieldValue(`section10.dualCitizenship.entries[${index}].${field}`, value);
  }, [updateFieldValue]);

  // ============================================================================
  // FOREIGN PASSPORT ACTIONS FOLLOWING SECTION 1 PATTERN
  // ============================================================================

  const updateForeignPassportFlag = useCallback((value: string) => {
    updateFieldValue('section10.foreignPassport.hasForeignPassport', value);
  }, [updateFieldValue]);

  const addForeignPassport = useCallback(() => {
    setSection10Data(prev => {
      const newData = addForeignPassportEntry(prev);
      // Sync data to SF86FormContext cache
      integration.emitDataSync('data_updated', newData);
      return newData;
    });
    setIsDirty(true);
  }, [integration]);

  const removeForeignPassport = useCallback((index: number) => {
    setSection10Data(prev => {
      const newData = removeForeignPassportEntry(prev, index);
      // Sync data to SF86FormContext cache
      integration.emitDataSync('data_updated', newData);
      return newData;
    });
    setIsDirty(true);
  }, [integration]);

  const updateForeignPassport = useCallback((index: number, field: string, value: any) => {
    updateFieldValue(`section10.foreignPassport.entries[${index}].${field}`, value);
  }, [updateFieldValue]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    setSection10Data(createDefaultSection10());
    setErrors({});
    setIsDirty(false);
  }, []);

  const loadSection = useCallback((data: Section10) => {
    // Safeguard: Only load if the incoming data is different and not empty
    const currentData = currentDataRef.current;
    const hasCurrentEntries =
      (currentData.section10.dualCitizenship.entries.length > 0 ||
       currentData.section10.foreignPassport.entries.length > 0);

    const hasIncomingEntries =
      (data.section10.dualCitizenship.entries?.length > 0 ||
       data.section10.foreignPassport.entries?.length > 0);

    // If we have current data with entries and incoming data is empty/default, preserve current data
    if (hasCurrentEntries && !hasIncomingEntries) {
      console.log(`🛡️ Section10: Preserving current data - incoming data appears to be default/empty`);
      return;
    }

    // If incoming data has entries or current data is empty, load the new data
    setSection10Data(data);
    setIsDirty(false);
  }, []);



  // ============================================================================
  // FIELD FLATTENING FOR PDF GENERATION (Following Section 29 pattern)
  // ============================================================================

  /**
   * Flatten Section10 data structure into Field objects for PDF generation
   * This converts the nested Section10 structure into a flat object with Field<T> objects
   * Uses the robust recursive approach from Section 29
   */
  const flattenSection10Fields = useCallback((): Record<string, any> => {
    const flatFields: Record<string, any> = {};

    const addField = (field: any, _path: string) => {
      if (
        field &&
        typeof field === "object" &&
        "id" in field &&
        "value" in field
      ) {
        flatFields[field.id] = field;
      }
    };

    // Flatten main flag fields
    if (section10Data.section10.dualCitizenship.hasDualCitizenship) {
      addField(section10Data.section10.dualCitizenship.hasDualCitizenship, 'section10.dualCitizenship.hasDualCitizenship');
    }
    if (section10Data.section10.foreignPassport.hasForeignPassport) {
      addField(section10Data.section10.foreignPassport.hasForeignPassport, 'section10.foreignPassport.hasForeignPassport');
    }

    // Recursive function to flatten any nested object structure
    const flattenEntry = (obj: any, prefix: string) => {
      Object.entries(obj).forEach(([key, value]) => {
        if (key === "_id") return;

        const currentPath = `${prefix}.${key}`;

        if (
          value &&
          typeof value === "object" &&
          "id" in value &&
          "value" in value
        ) {
          // This is a Field object
          addField(value, currentPath);
        } else if (value && typeof value === "object") {
          // This is a nested object, recurse
          flattenEntry(value, currentPath);
        }
      });
    };

    // Flatten dual citizenship entries
    section10Data.section10.dualCitizenship.entries.forEach((entry: any, entryIndex: number) => {
      flattenEntry(entry, `section10.dualCitizenship.entries.${entryIndex}`);
    });

    // Flatten foreign passport entries
    section10Data.section10.foreignPassport.entries.forEach((entry: any, entryIndex: number) => {
      flattenEntry(entry, `section10.foreignPassport.entries.${entryIndex}`);
    });

    return flatFields;
  }, [section10Data]);



  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section10ContextType = {
    // State
    section10Data,
    isLoading,
    errors,
    isDirty,

    // Dual Citizenship Actions
    updateDualCitizenshipFlag,
    addDualCitizenship,
    removeDualCitizenship,
    updateDualCitizenship,

    // Foreign Passport Actions
    updateForeignPassportFlag,
    addForeignPassport,
    removeForeignPassport,
    updateForeignPassport,

    // Utility Functions
    resetSection,
    loadSection,
    validateSection,
    getChanges
  };

  return (
    <Section10Context.Provider value={contextValue}>
      {children}
    </Section10Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection10 = (): Section10ContextType => {
  const context = useContext(Section10Context);
  if (context === undefined) {
    throw new Error('useSection10 must be used within a Section10Provider');
  }
  return context;
};