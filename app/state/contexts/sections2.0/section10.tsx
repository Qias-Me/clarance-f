/**
 * Section 10: Dual/Multiple Citizenship & Foreign Passport - Context
 *
 * React context for managing SF-86 Section 10 data state and operations.
 * This section handles dual citizenship information and foreign passport details.
 *
 * Updated to follow Section 1 gold standard pattern with useSection86FormIntegration.
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { cloneDeep, set } from 'lodash';
import type {
  Section10,
  DualCitizenshipEntry,
  ForeignPassportEntry,
  TravelCountryEntry,  // NEW: Added travel country support
} from '../../../../api/interfaces/sections2.0/section10';
import {
  createDefaultSection10,
  createDualCitizenshipEntry,
  createForeignPassportEntry,
  createTravelCountryEntry,  // NEW: Added travel country creation
  addDualCitizenshipEntry,
  addForeignPassportEntry,
  addTravelCountryEntry,  // NEW: Added travel country management
  removeDualCitizenshipEntry,
  removeForeignPassportEntry,
  removeTravelCountryEntry  // NEW: Added travel country management
} from '../../../../api/interfaces/sections2.0/section10';
import { useSection86FormIntegration } from '../shared/section-context-integration';
// NEW: Import field mapping and generation systems
import { validateSection10FieldMappings } from './section10-field-mapping';
import { initializeSection10FieldMapping, validateFieldGeneration } from './section10-field-generator';

// ============================================================================
// CONTEXT INTERFACE FOLLOWING SECTION 1 GOLD STANDARD
// ============================================================================

/**
 * Section 10 Context interface following Section 1 gold standard pattern
 * UPDATED: Added travel country management functions
 */
interface Section10ContextType {
  // State
  section10Data: Section10;
  isLoading: boolean;
  // REMOVED: isDirty - only save button should trigger state updates

  // Dual Citizenship Actions
  updateDualCitizenshipFlag: (value: string) => void;
  addDualCitizenship: () => void;
  removeDualCitizenship: (index: number) => void;
  updateDualCitizenship: (index: number, field: string, value: any) => void;
  canAddDualCitizenship: () => boolean;

  // Foreign Passport Actions
  updateForeignPassportFlag: (value: string) => void;
  addForeignPassport: () => void;
  removeForeignPassport: (index: number) => void;
  updateForeignPassport: (index: number, field: string, value: any) => void;
  canAddForeignPassport: () => boolean;

  // NEW: Travel Country Actions
  addTravelCountry: (passportIndex: number) => void;
  removeTravelCountry: (passportIndex: number, travelIndex: number) => void;
  updateTravelCountry: (passportIndex: number, travelIndex: number, field: string, value: any) => void;
  canAddTravelCountry: (passportIndex: number) => boolean;

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
  // FIELD MAPPING INITIALIZATION (Following Section 29 pattern)
  // ============================================================================

  // Initialize field mapping system on component mount
  useEffect(() => {
    // console.log('🔄 Section10: Initializing section data with complete field mapping verification');

    // Validate field mappings
    const validation = validateSection10FieldMappings();
    // console.log(`🎯 Section10: Field mapping verification - ${validation.coverage.toFixed(1)}% coverage (${validation.mappedFields}/${validation.totalFields} fields)`);

    if (validation.coverage >= 98) {
      // console.log(`✅ Section10: All ${validation.totalFields} PDF form fields are properly mapped`);
    } else {
      console.warn(`⚠️ Section10: ${validation.missingFields.length} fields are not mapped`);
      validation.missingFields.slice(0, 5).forEach(field => {
        console.warn(`  - ${field}`);
      });
    }

    // Validate field generation
    const generationValid = validateFieldGeneration();
    if (generationValid) {
      console.log('✅ Section10: Field generation system validated successfully');
    } else {
      console.error('❌ Section10: Field generation system validation failed');
    }

    console.log('🔧 Section10: Section initialization complete');
  }, []);

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [section10Data, setSection10Data] = useState<Section10>(() => {
    return createDefaultSection10();
  });
  const [isLoading, setIsLoading] = useState(false);
  // REMOVED: isDirty state - only save button should trigger state updates
  const currentDataRef = useRef(section10Data);

  // REMOVED: State change tracking - only save button should trigger updates

  // Update ref when data changes
  useEffect(() => {
    currentDataRef.current = section10Data;
  }, [section10Data]);

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

        // NEW: Validate travel countries if any are filled
        if (entry.travelCountries && entry.travelCountries.length > 0) {
          entry.travelCountries.forEach((travelEntry, travelIndex) => {
            if (travelEntry.country.value && !travelEntry.fromDate.value) {
              const errorMsg = 'From date is required when country is specified';
              newErrors[`foreignPassport.entries[${index}].travelCountries[${travelIndex}].fromDate`] = errorMsg;
              validationErrors.push({
                field: `foreignPassport.entries[${index}].travelCountries[${travelIndex}].fromDate`,
                message: errorMsg,
                code: 'REQUIRED_FIELD',
                severity: 'error'
              });
            }

            if (travelEntry.country.value && !travelEntry.toDate.value && !travelEntry.isPresent.value) {
              const errorMsg = 'To date is required (or check Present) when country is specified';
              newErrors[`foreignPassport.entries[${index}].travelCountries[${travelIndex}].toDate`] = errorMsg;
              validationErrors.push({
                field: `foreignPassport.entries[${index}].travelCountries[${travelIndex}].toDate`,
                message: errorMsg,
                code: 'REQUIRED_FIELD',
                severity: 'error'
              });
            }
          });
        }
      });
    }

    // FIXED: Removed setErrors(newErrors) call that was causing infinite loop
    // Return validation result with errors included - let the component handle error state
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: validationErrors,
      warnings,
      fieldErrors: newErrors // Include field errors for component to use
    };
  }, [section10Data]);

  const getChanges = useCallback(() => {
    // REMOVED: isDirty tracking - only save button should trigger state updates
    return section10Data; // Always return current data since we're not tracking dirty state
  }, [section10Data]);

  // ============================================================================
  // FIELD UPDATE FUNCTIONS (FOLLOWING SECTION 29 PATTERN)
  // ============================================================================

  /**
   * Main field update function following Section 29's exact pattern
   * Handles updates for dual citizenship and foreign passport entries
   * Signature: (subsectionType, entryIndex, fieldPath, newValue)
   */
  const updateFieldValue = useCallback((
    subsectionType: 'dualCitizenship' | 'foreignPassport',
    entryIndex: number,
    fieldPath: string,
    newValue: any
  ) => {
    try {
      setSection10Data((prev) => {
        const updated = cloneDeep(prev);
        const subsection = updated.section10[subsectionType];

        if (
          subsection?.entries &&
          entryIndex >= 0 &&
          entryIndex < subsection?.entries.length
        ) {
          const entry = subsection?.entries[entryIndex];
          const fullFieldPath = `${fieldPath}.value`;
          set(entry, fullFieldPath, newValue);
        }

        return updated;
      });
    } catch (error) {
      console.error('Section10: updateFieldValue error:', error);
    }
  }, []);

  /**
   * Flag update functions for main section flags
   */
  const updateDualCitizenshipFlag = useCallback((value: string) => {
    setSection10Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section10.dualCitizenship.hasDualCitizenship.value = value;
      return newData;
    });
  }, []);

  const updateForeignPassportFlag = useCallback((value: string) => {
    setSection10Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section10.foreignPassport.hasForeignPassport.value = value;
      return newData;
    });
  }, []);

  // ============================================================================
  // SF86FORM INTEGRATION (FOLLOWING SECTION 29 PATTERN)
  // ============================================================================

  // REMOVED: updateFieldValueWrapper - Section 10 context is now source of truth
  // SF86FormContext only updated on explicit save via handleSubmit in component

  // FIXED: Integration with main form context using Section 1/29 pattern
  // Section context is source of truth - SF86FormContext only updated on explicit save
  // Note: integration variable is used internally by the hook for registration
  const integration = useSection86FormIntegration(
    'section10',
    'Section 10: Dual/Multiple Citizenship & Foreign Passport',
    section10Data,
    setSection10Data,
    () => {
      // FIXED: Call validateSection only once to prevent multiple calls
      const result = validateSection();
      return { isValid: result.isValid, errors: result.errors, warnings: result.warnings };
    },
    getChanges,
    undefined // FIXED: Don't pass updateFieldValueWrapper to prevent automatic sync
  );

  // ============================================================================
  // DUAL CITIZENSHIP ACTIONS FOLLOWING SECTION 29 PATTERN
  // ============================================================================

  // Use refs to track the last operation to prevent React Strict Mode duplicates
  const lastDualCitizenshipOpRef = useRef<{ count: number; timestamp: number }>({ count: 0, timestamp: 0 });
  const lastForeignPassportOpRef = useRef<{ count: number; timestamp: number }>({ count: 0, timestamp: 0 });
  const lastTravelCountryOpRef = useRef<{ passportIndex: number; count: number; timestamp: number }>({ passportIndex: -1, count: 0, timestamp: 0 });

  const addDualCitizenship = useCallback(() => {
    setSection10Data(prev => {
      if (prev.section10.dualCitizenship.entries.length >= 2) {
        return prev; // Don't add if already at limit
      }

      // IMPORTANT: Prevent React Strict Mode double execution
      // Use a combination of count and timestamp to detect rapid duplicate calls
      const currentCount = prev.section10.dualCitizenship.entries.length;
      const now = Date.now();
      const lastOp = lastDualCitizenshipOpRef.current;

      // If this is a duplicate call within 50ms with the same count, skip it
      if (now - lastOp.timestamp < 50 && currentCount === lastOp.count) {
        console.log('🚫 Section10: Preventing duplicate dual citizenship add (React Strict Mode)');
        return prev;
      }

      // Update the last operation tracking
      lastDualCitizenshipOpRef.current = { count: currentCount + 1, timestamp: now };

      console.log(`✅ Section10: Adding dual citizenship entry ${currentCount + 1}`);
      return addDualCitizenshipEntry(prev);
    });
  }, []);

  const removeDualCitizenship = useCallback((index: number) => {
    setSection10Data(prev => {
      const newData = removeDualCitizenshipEntry(prev, index);
      // REMOVED: setIsDirty(true) - only save button should trigger state updates
      return newData;
    });
  }, []);

  const updateDualCitizenship = useCallback((index: number, field: string, value: any) => {
    updateFieldValue('dualCitizenship', index, field, value);
  }, [updateFieldValue]);

  // ============================================================================
  // FOREIGN PASSPORT ACTIONS FOLLOWING SECTION 29 PATTERN
  // ============================================================================

  const addForeignPassport = useCallback(() => {
    setSection10Data(prev => {
      if (prev.section10.foreignPassport.entries.length >= 2) {
        return prev; // Don't add if already at limit
      }

      // IMPORTANT: Prevent React Strict Mode double execution
      // Use a combination of count and timestamp to detect rapid duplicate calls
      const currentCount = prev.section10.foreignPassport.entries.length;
      const now = Date.now();
      const lastOp = lastForeignPassportOpRef.current;

      // If this is a duplicate call within 50ms with the same count, skip it
      if (now - lastOp.timestamp < 50 && currentCount === lastOp.count) {
        console.log('🚫 Section10: Preventing duplicate foreign passport add (React Strict Mode)');
        return prev;
      }

      // Update the last operation tracking
      lastForeignPassportOpRef.current = { count: currentCount + 1, timestamp: now };

      console.log(`✅ Section10: Adding foreign passport entry ${currentCount + 1}`);
      return addForeignPassportEntry(prev);
    });
  }, []);

  const removeForeignPassport = useCallback((index: number) => {
    setSection10Data(prev => {
      const newData = removeForeignPassportEntry(prev, index);
      // REMOVED: setIsDirty(true) - only save button should trigger state updates
      return newData;
    });
  }, []);

  const updateForeignPassport = useCallback((index: number, field: string, value: any) => {
    updateFieldValue('foreignPassport', index, field, value);
  }, [updateFieldValue]);

  // ============================================================================
  // TRAVEL COUNTRY ACTIONS (NEW)
  // ============================================================================

  const addTravelCountry = useCallback((passportIndex: number) => {
    setSection10Data(prev => {
      const passport = prev.section10.foreignPassport.entries[passportIndex];
      if (!passport || passport.travelCountries.length >= 6) {
        return prev; // Don't add if passport doesn't exist or already at limit
      }

      // IMPORTANT: Prevent React Strict Mode double execution
      // Use a combination of passportIndex, count and timestamp to detect rapid duplicate calls
      const currentCount = passport.travelCountries.length;
      const now = Date.now();
      const lastOp = lastTravelCountryOpRef.current;

      // If this is a duplicate call within 50ms with the same passport and count, skip it
      if (now - lastOp.timestamp < 50 && passportIndex === lastOp.passportIndex && currentCount === lastOp.count) {
        console.log(`🚫 Section10: Preventing duplicate travel country add for passport ${passportIndex} (React Strict Mode)`);
        return prev;
      }

      // Update the last operation tracking
      lastTravelCountryOpRef.current = { passportIndex, count: currentCount + 1, timestamp: now };

      console.log(`✅ Section10: Adding travel country ${currentCount + 1} to passport ${passportIndex + 1}`);
      return addTravelCountryEntry(prev, passportIndex);
    });
  }, []);

  const removeTravelCountry = useCallback((passportIndex: number, travelIndex: number) => {
    setSection10Data(prev => {
      return removeTravelCountryEntry(prev, passportIndex, travelIndex);
    });
  }, []);

  const updateTravelCountry = useCallback((passportIndex: number, travelIndex: number, field: string, value: any) => {
    try {
      setSection10Data((prev) => {
        const updated = cloneDeep(prev);
        const passport = updated.section10.foreignPassport.entries[passportIndex];

        if (passport && passport.travelCountries[travelIndex]) {
          const travelEntry = passport.travelCountries[travelIndex];
          const fullFieldPath = `${field}.value`;
          set(travelEntry, fullFieldPath, value);

          // Special handling for "present" checkbox
          if (field === "isPresent" && value === true) {
            travelEntry.toDate.value = "Present";
          }
        }

        return updated;
      });
    } catch (error) {
      console.error('Section10: updateTravelCountry error:', error);
    }
  }, []);

  const canAddTravelCountry = useCallback((passportIndex: number) => {
    const passport = section10Data.section10.foreignPassport.entries[passportIndex];
    return passport && passport.travelCountries.length < 6;
  }, [section10Data.section10.foreignPassport.entries]);

  // ============================================================================
  // ENTRY LIMIT HELPER FUNCTIONS
  // ============================================================================

  const canAddDualCitizenship = useCallback(() => {
    return section10Data.section10.dualCitizenship.entries.length < 2;
  }, [section10Data.section10.dualCitizenship.entries.length]);

  const canAddForeignPassport = useCallback(() => {
    return section10Data.section10.foreignPassport.entries.length < 2;
  }, [section10Data.section10.foreignPassport.entries.length]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    setSection10Data(createDefaultSection10());
    // FIXED: Removed setErrors({}) call to prevent infinite loops
    // REMOVED: setIsDirty(false) - only save button should trigger state updates
  }, []);

  const loadSection = useCallback((data: Section10) => {
    const currentData = currentDataRef.current;
    const hasCurrentEntries =
      (currentData.section10.dualCitizenship.entries.length > 0 ||
       currentData.section10.foreignPassport.entries.length > 0);

    const hasIncomingEntries =
      (data.section10.dualCitizenship.entries?.length > 0 ||
       data.section10.foreignPassport.entries?.length > 0);

    // If we have current data with entries and incoming data is empty/default, preserve current data
    if (hasCurrentEntries && !hasIncomingEntries) {
      return;
    }

    setSection10Data(data);
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

  // FIXED: Memoize context value to prevent infinite re-renders
  const contextValue: Section10ContextType = useMemo(() => ({
    // State
    section10Data,
    isLoading,
    // REMOVED: isDirty - only save button should trigger state updates

    // Dual Citizenship Actions
    updateDualCitizenshipFlag,
    addDualCitizenship,
    removeDualCitizenship,
    updateDualCitizenship,
    canAddDualCitizenship,

    // Foreign Passport Actions
    updateForeignPassportFlag,
    addForeignPassport,
    removeForeignPassport,
    updateForeignPassport,
    canAddForeignPassport,

    // NEW: Travel Country Actions
    addTravelCountry,
    removeTravelCountry,
    updateTravelCountry,
    canAddTravelCountry,

    // Utility Functions
    resetSection,
    loadSection,
    validateSection,
    getChanges
  }), [
    // Dependencies for memoization
    section10Data,
    isLoading,
    // REMOVED: isDirty - only save button should trigger state updates
    updateDualCitizenshipFlag,
    addDualCitizenship,
    removeDualCitizenship,
    updateDualCitizenship,
    canAddDualCitizenship,
    updateForeignPassportFlag,
    addForeignPassport,
    removeForeignPassport,
    updateForeignPassport,
    canAddForeignPassport,
    // NEW: Travel Country Dependencies
    addTravelCountry,
    removeTravelCountry,
    updateTravelCountry,
    canAddTravelCountry,
    resetSection,
    loadSection,
    validateSection,
    getChanges
  ]);

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