/**
 * Section 10: Dual/Multiple Citizenship & Foreign Passport - Context
 *
 * React context for managing SF-86 Section 10 data state and operations.
 * This section handles dual citizenship information and foreign passport details.
 *
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
  createTravelCountryEntry
} from '../../../../api/interfaces/sections2.0/section10';
import type { ValidationResult, ValidationError, ChangeSet } from '../shared/base-interfaces';
// NEW: Import field mapping and generation systems
import { validateSection10FieldMappings, mapLogicalFieldToPdfField } from './section10-field-mapping';
import { initializeSection10FieldMapping, validateFieldGeneration } from './section10-field-generator';
import { useSF86Form } from './SF86FormContext';

// ============================================================================
// CONTEXT INTERFACE FOLLOWING SECTION 1 GOLD STANDARD
// ============================================================================

/**
 * Section 10 Context interface following Section 1 gold standard pattern
 * UPDATED: Added travel country management functions
 */
interface Section10ContextType {
  // State (Following Section 1 Gold Standard)
  section10Data: Section10;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

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

  // Field Update Function (Following Section 1 Gold Standard)
  updateFieldValue: (path: string, value: any) => void;

  // Utility Functions
  resetSection: () => void;
  loadSection: (data: Section10) => void;
  validateSection: () => ValidationResult;
  getChanges: () => any;

  // Submit-Only Mode Functions
  submitSectionData: () => Promise<void>;
  hasPendingChanges: () => boolean;
}

// ============================================================================
// CONTEXT IMPLEMENTATION FOLLOWING SECTION 1 GOLD STANDARD
// ============================================================================

const Section10Context = createContext<Section10ContextType | undefined>(undefined);

const Section10Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ============================================================================
  // FIELD MAPPING INITIALIZATION (Following Section 29 pattern)
  // ============================================================================

  // Initialize field mapping system on component mount
  useEffect(() => {

    // Validate field mappings
    const validation = validateSection10FieldMappings();

    // Validate field generation
    const generationValid = validateFieldGeneration();
  }, []);

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [section10Data, setSection10Data] = useState<Section10>(() => {
    return createDefaultSection10();
  });
  const [isLoading, setIsLoading] = useState(false);
  // FIXED: Add back error state and isDirty following Section 1 gold standard
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section10>(createDefaultSection10());
  const [isInitialized, setIsInitialized] = useState(false);
  const currentDataRef = useRef(section10Data);

  // ============================================================================
  // COMPUTED VALUES (Following Section 1 Gold Standard)
  // ============================================================================

  const isDirty = JSON.stringify(section10Data) !== JSON.stringify(initialData);

  // Set initialized flag after component mounts
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Update ref when data changes
  useEffect(() => {
    currentDataRef.current = section10Data;
  }, [section10Data]);

  // ============================================================================
  // UTILITY FUNCTIONS (DECLARED EARLY FOR INTEGRATION)
  // ============================================================================

  // PERFORMANCE FIX: Validation function with no dependencies to prevent re-creation on every data change
  const validateSection = useCallback((): ValidationResult => {
    // Use ref to get current data without creating dependency
    const currentData = currentDataRef.current;



    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];
    const newErrors: Record<string, string> = {};

    // Validate dual citizenship entries
    if (currentData.section10.dualCitizenship.hasDualCitizenship.value === 'YES') {
      currentData.section10.dualCitizenship.entries.forEach((entry, index) => {
        if (!entry.country.value) {
          validationErrors.push({
            field: `dualCitizenship.entries[${index}].country`,
            message: 'Country is required',
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
    if (currentData.section10.foreignPassport.hasForeignPassport.value === 'YES') {
      currentData.section10.foreignPassport.entries.forEach((entry, index) => {
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
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings,
    };
  }, []); // PERFORMANCE FIX: No dependencies to prevent re-creation on every data change

  const getChanges = useCallback(() => {
    // REMOVED: isDirty tracking - only save button should trigger state updates
    return section10Data; // Always return current data since we're not tracking dirty state
  }, [section10Data]);

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
  // SUBMIT-ONLY MODE CONFIGURATION
  // ============================================================================

  // FIXED: Enable submit-only mode to prevent auto-save on every keystroke
  // This ensures data is only persisted when user explicitly submits
  const [submitOnlyMode] = useState(true); // Enable submit-only mode for Section 10
  const [pendingChanges, setPendingChanges] = useState(false);
  const lastSubmittedDataRef = useRef<Section10 | null>(null);

  // PERFORMANCE FIX: Greatly reduce pending changes tracking frequency
  // Only check on specific actions, not on every data change
  const checkPendingChanges = useCallback(() => {
    if (!lastSubmittedDataRef.current) {
      setPendingChanges(false);
      return;
    }

    // More efficient comparison - check key fields instead of full JSON stringify
    const current = currentDataRef.current;
    const submitted = lastSubmittedDataRef.current;

    const hasChanges = (
      current.section10.dualCitizenship.hasDualCitizenship.value !== submitted.section10.dualCitizenship.hasDualCitizenship.value ||
      current.section10.foreignPassport.hasForeignPassport.value !== submitted.section10.foreignPassport.hasForeignPassport.value ||
      current.section10.dualCitizenship.entries.length !== submitted.section10.dualCitizenship.entries.length ||
      current.section10.foreignPassport.entries.length !== submitted.section10.foreignPassport.entries.length
    );

    setPendingChanges(hasChanges);
  }, []); // PERFORMANCE FIX: No dependencies to prevent re-creation

  // PERFORMANCE FIX: Only check pending changes on major actions, not every data change
  // This will be called manually when needed instead of automatically

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
      // PERFORMANCE FIX: Efficient state update without expensive cloneDeep
      setSection10Data((prev) => {
        // Only clone the specific entry that needs updating
        const newEntries = [...prev.section10[subsectionType].entries];
        const entryToUpdate = newEntries[entryIndex];

        if (entryToUpdate) {
          // Create a shallow copy of the entry and update the specific field
          const updatedEntry = { ...entryToUpdate };
          const fullFieldPath = `${fieldPath}.value`;

          // Use lodash set for nested field updates, but only on the entry copy
          set(updatedEntry, fullFieldPath, newValue);
          newEntries[entryIndex] = updatedEntry;

          return {
            ...prev,
            section10: {
              ...prev.section10,
              [subsectionType]: {
                ...prev.section10[subsectionType],
                entries: newEntries
              }
            }
          };
        }

        return prev;
      });
    } catch (error) {
      // Error updating field value
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
  // STATE MANIPULATION FUNCTIONS (MOVED FROM INTERFACE)
  // ============================================================================

  /**
   * Adds a new dual citizenship entry
   * MOVED FROM INTERFACE: State manipulation belongs in context layer
   */
  const addDualCitizenshipEntry = useCallback((section10Data: Section10): Section10 => {
    const newData = { ...section10Data };
    const newIndex = newData.section10.dualCitizenship.entries.length;
    newData.section10.dualCitizenship.entries.push(createDualCitizenshipEntry(newIndex));
    return newData;
  }, []);

  /**
   * Adds a new foreign passport entry
   * MOVED FROM INTERFACE: State manipulation belongs in context layer
   */
  const addForeignPassportEntry = useCallback((section10Data: Section10): Section10 => {
    const newData = { ...section10Data };
    const newIndex = newData.section10.foreignPassport.entries.length;
    newData.section10.foreignPassport.entries.push(createForeignPassportEntry(newIndex));
    return newData;
  }, []);

  /**
   * Removes a dual citizenship entry
   * MOVED FROM INTERFACE: State manipulation belongs in context layer
   */
  const removeDualCitizenshipEntry = useCallback((section10Data: Section10, index: number): Section10 => {
    const newData = { ...section10Data };
    if (index >= 0 && index < newData.section10.dualCitizenship.entries.length) {
      newData.section10.dualCitizenship.entries.splice(index, 1);
    }
    return newData;
  }, []);

  /**
   * Removes a foreign passport entry
   * MOVED FROM INTERFACE: State manipulation belongs in context layer
   */
  const removeForeignPassportEntry = useCallback((section10Data: Section10, index: number): Section10 => {
    const newData = { ...section10Data };
    if (index >= 0 && index < newData.section10.foreignPassport.entries.length) {
      newData.section10.foreignPassport.entries.splice(index, 1);
    }
    return newData;
  }, []);

  /**
   * Adds a new travel country entry to a foreign passport
   * MOVED FROM INTERFACE: State manipulation belongs in context layer
   */
  const addTravelCountryEntry = useCallback((section10Data: Section10, passportIndex: number): Section10 => {
    const newData = { ...section10Data };
    if (passportIndex >= 0 && passportIndex < newData.section10.foreignPassport.entries.length) {
      const passport = newData.section10.foreignPassport.entries[passportIndex];
      if (passport.travelCountries.length < 6) {
        const newTravelIndex = passport.travelCountries.length;
        passport.travelCountries.push(createTravelCountryEntry(passportIndex, newTravelIndex));
      }
    }
    return newData;
  }, []);

  /**
   * Removes a travel country entry from a foreign passport
   * MOVED FROM INTERFACE: State manipulation belongs in context layer
   */
  const removeTravelCountryEntry = useCallback((section10Data: Section10, passportIndex: number, travelIndex: number): Section10 => {
    const newData = { ...section10Data };
    if (passportIndex >= 0 && passportIndex < newData.section10.foreignPassport.entries.length) {
      const passport = newData.section10.foreignPassport.entries[passportIndex];
      if (travelIndex >= 0 && travelIndex < passport.travelCountries.length) {
        passport.travelCountries.splice(travelIndex, 1);
      }
    }
    return newData;
  }, []);

  // ============================================================================
  // SF86FORM INTEGRATION (FOLLOWING SECTION 1 PATTERN)
  // ============================================================================

  // Access SF86FormContext to sync with loaded data
  const sf86Form = useSF86Form();

  // Sync with SF86FormContext when data is loaded
  useEffect(() => {
    if (sf86Form.formData.section10 && sf86Form.formData.section10 !== section10Data) {
      // Load the data from SF86FormContext
      loadSection(sf86Form.formData.section10);
    }
  }, [sf86Form.formData.section10, loadSection]);



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
        return prev;
      }

      // Update the last operation tracking
      lastDualCitizenshipOpRef.current = { count: currentCount + 1, timestamp: now };

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
        return prev;
      }

      // Update the last operation tracking
      lastForeignPassportOpRef.current = { count: currentCount + 1, timestamp: now };

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

  /**
   * Helper function to construct proper logical field paths for travel countries
   * This ensures field paths match the regex pattern in mapLogicalFieldToPdfField
   */
  const constructTravelCountryFieldPath = useCallback((passportIndex: number, travelIndex: number, field: string): string => {
    return `foreignPassport.entries[${passportIndex}].travelCountries[${travelIndex}].${field}`;
  }, []);

  /**
   * Validate that travel country field paths work with the field mapping system
   * This helps debug field mapping issues during development
   */
  const validateTravelCountryFieldMapping = useCallback((passportIndex: number, travelIndex: number, field: string): boolean => {
    const logicalPath = constructTravelCountryFieldPath(passportIndex, travelIndex, field);
    const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);

    // Check if the mapping was successful (not just returning the original path)
    const isMapped = pdfFieldName !== logicalPath;

    return isMapped;
  }, [constructTravelCountryFieldPath]);

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
        return prev;
      }

      // Update the last operation tracking
      lastTravelCountryOpRef.current = { passportIndex, count: currentCount + 1, timestamp: now };

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
      // PERFORMANCE FIX: No logging on input - only on submit

      setSection10Data((prev) => {
        // PERFORMANCE FIX: Efficient update without expensive cloneDeep
        const newPassportEntries = [...prev.section10.foreignPassport.entries];
        const passportToUpdate = newPassportEntries[passportIndex];

        if (passportToUpdate && passportToUpdate.travelCountries[travelIndex]) {
          // Create shallow copy of passport entry
          const updatedPassport = {
            ...passportToUpdate,
            travelCountries: [...passportToUpdate.travelCountries]
          };

          // Create shallow copy of travel entry
          const travelEntry = { ...updatedPassport.travelCountries[travelIndex] };

          // Update the specific field
          if (travelEntry[field] && typeof travelEntry[field] === 'object' && 'value' in travelEntry[field]) {
            travelEntry[field] = { ...travelEntry[field], value };
          } else {
            // Fallback for direct field access
            const fullFieldPath = `${field}.value`;
            set(travelEntry, fullFieldPath, value);
          }

          // Special handling for "present" checkbox
          if (field === "isPresent" && value === true) {
            if (travelEntry.toDate && typeof travelEntry.toDate === 'object' && 'value' in travelEntry.toDate) {
              travelEntry.toDate = { ...travelEntry.toDate, value: "Present" };
            }
          }

          updatedPassport.travelCountries[travelIndex] = travelEntry;
          newPassportEntries[passportIndex] = updatedPassport;

          return {
            ...prev,
            section10: {
              ...prev.section10,
              foreignPassport: {
                ...prev.section10.foreignPassport,
                entries: newPassportEntries
              }
            }
          };
        }

        return prev;
      });
    } catch (error) {
      // Error updating travel country
    }
  }, [constructTravelCountryFieldPath, validateTravelCountryFieldMapping]);

  const canAddTravelCountry = useCallback((passportIndex: number) => {
    const passport = section10Data.section10.foreignPassport.entries[passportIndex];
    return passport && passport.travelCountries.length < 6;
  }, [section10Data.section10.foreignPassport.entries]);

  // ============================================================================
  // ENTRY LIMIT HELPER FUNCTIONS (OPTIMIZED)
  // ============================================================================

  // PERFORMANCE FIX: Remove memoized computed values that cause re-renders
  // Simple functions are more performant than complex memoization
  const canAddDualCitizenship = useCallback(() => {
    return section10Data.section10.dualCitizenship.entries.length < 2;
  }, [section10Data.section10.dualCitizenship.entries.length]);

  const canAddForeignPassport = useCallback(() => {
    return section10Data.section10.foreignPassport.entries.length < 2;
  }, [section10Data.section10.foreignPassport.entries.length]);

  // ============================================================================
  // SUBMIT-ONLY MODE FUNCTIONS
  // ============================================================================

  /**
   * Manually sync data to main form context (submit-only mode)
   * This function should only be called when the user explicitly submits
   */
  const submitSectionData = useCallback(async () => {
    if (submitOnlyMode) {
      // console.log('🚀 Section10: Manually syncing data to main form context (submit-only mode)');

      // PERFORMANCE FIX: Use current data ref to avoid dependency on section10Data
      const currentData = currentDataRef.current;
      sf86Form.updateSectionData('section10', currentData);

      // Update the last submitted data reference
      lastSubmittedDataRef.current = cloneDeep(currentData);
      setPendingChanges(false);

      // console.log('✅ Section10: Data sync complete');
    }
  }, [submitOnlyMode, sf86Form]); // PERFORMANCE FIX: Removed section10Data dependency

  /**
   * Check if there are pending changes that haven't been submitted
   */
  const hasPendingChanges = useCallback(() => {
    return pendingChanges;
  }, [pendingChanges]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    setSection10Data(createDefaultSection10());
    // FIXED: Removed setErrors({}) call to prevent infinite loops
    // REMOVED: setIsDirty(false) - only save button should trigger state updates

    // Reset submit-only mode tracking
    if (submitOnlyMode) {
      lastSubmittedDataRef.current = null;
      setPendingChanges(false);
    }
  }, [submitOnlyMode]);



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

  // PERFORMANCE FIX: Remove render monitoring that causes extra useEffect calls
  // This was contributing to the re-render issues

  // PERFORMANCE FIX: Follow Section 1's simple pattern - no useMemo for context value
  // This prevents over-optimization that causes more re-renders than it saves
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
    canAddDualCitizenship,

    // Foreign Passport Actions
    updateForeignPassportFlag,
    addForeignPassport,
    removeForeignPassport,
    updateForeignPassport,
    canAddForeignPassport,

    // Travel Country Actions
    addTravelCountry,
    removeTravelCountry,
    updateTravelCountry,
    canAddTravelCountry,

    // Field Update Function
    updateFieldValue,

    // Utility Functions
    resetSection,
    loadSection,
    validateSection,
    getChanges,

    // Submit-Only Mode Functions
    submitSectionData,
    hasPendingChanges
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

export default Section10Provider;