/**
 * Section 11: Where You Have Lived Context
 *
 * React context implementation for SF-86 Section 11 (Where You Have Lived) following the established
 * patterns from other sections. Provides comprehensive state management, CRUD operations for residence
 * entries, validation, and SF86FormContext integration.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode
} from 'react';
import { cloneDeep, isEqual, set } from 'lodash';
import type {
  Section11,
  ResidenceEntry,
  Section11FieldUpdate,
  Section11ValidationContext,
  Section11ValidationRules,
  ResidenceValidationResult
} from '../../../../api/interfaces/sections2.0/section11';
import {
  createDefaultSection11 as createDefaultSection11Impl,
  updateSection11Field as updateSection11FieldImpl,
  addResidenceEntry as addResidenceEntryImpl,
  removeResidenceEntry as removeResidenceEntryImpl,
  validateResidenceHistory
} from '../../../../api/interfaces/sections2.0/section11';
import { debugAllEntries } from './section11-field-mapping';
import type {
  ValidationResult,
  ValidationError,
  ChangeSet,
  BaseSectionContext
} from '../shared/base-interfaces';
import { useSectionIntegration } from '../shared/section-integration';
import DynamicService from '../../../../api/service/dynamicService';
import { useSection86FormIntegration } from '../shared/section-context-integration';

// ============================================================================
// VALIDATION RULES
// ============================================================================

const defaultValidationRules: Section11ValidationRules = {
  requiresStreetAddress: true,
  requiresCity: true,
  requiresStateOrCountry: true,
  requiresContactPerson: true,
  requiresFromDate: true,
  maxResidenceGap: 30, // days
  minimumResidenceTimeframe: 7 // years
};

// ============================================================================
// CONTEXT TYPE DEFINITION
// ============================================================================

interface Section11ContextType {
  // ============================================================================
  // CORE STATE
  // ============================================================================

  section11Data: Section11;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // ============================================================================
  // RESIDENCE ENTRY MANAGEMENT
  // ============================================================================

  // Basic CRUD Operations
  addResidenceEntry: () => void;
  removeResidenceEntry: (index: number) => void;
  updateFieldValue: (fieldPath: string, value: any, entryIndex?: number) => void;

  // Enhanced Entry Management
  getEntryCount: () => number;
  getEntry: (index: number) => ResidenceEntry | null;
  moveEntry: (fromIndex: number, toIndex: number) => void;
  duplicateEntry: (index: number) => void;
  clearEntry: (index: number) => void;
  bulkUpdateFields: (updates: Section11FieldUpdate[]) => void;

  // Address Management
  updateResidenceAddress: (entryIndex: number, addressData: any) => void;
  updateContactPersonAddress: (entryIndex: number, contactAddressData: any) => void;
  toggleAPOFPO: (entryIndex: number, isAPOFPO: boolean) => void;

  // Contact Person Management
  updateContactPerson: (entryIndex: number, contactData: any) => void;
  addContactPhone: (entryIndex: number, phoneType: 'evening' | 'daytime' | 'mobile', phoneData: any) => void;

  // Date Management
  updateDateRange: (entryIndex: number, fromDate: string, toDate: string, isPresent?: boolean) => void;
  markAsPresent: (entryIndex: number) => void;
  setDateEstimate: (entryIndex: number, dateType: 'from' | 'to', isEstimate: boolean) => void;

  // ============================================================================
  // VALIDATION & PERSISTENCE
  // ============================================================================

  validateSection: () => ValidationResult;
  validateResidenceHistory: () => ResidenceValidationResult;
  saveSection: () => Promise<void>;
  loadSection: () => Promise<void>;
  resetSection: () => void;
  exportSection: () => Section11;

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  getChanges: () => ChangeSet;
  hasUnsavedChanges: () => boolean;
  getFieldValue: (fieldPath: string, entryIndex?: number) => any;
  setFieldValue: (fieldPath: string, value: any, entryIndex?: number) => void;
  
  // Residence-specific utilities
  getTotalResidenceTimespan: () => number; // in years
  getResidenceGaps: () => Array<{ startDate: string; endDate: string; duration: number }>;
  isResidenceHistoryComplete: () => boolean;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section11Context = createContext<Section11ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface Section11ProviderProps {
  children: ReactNode;
}

export const Section11Provider: React.FC<Section11ProviderProps> = ({ children }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [section11Data, setSection11Data] = useState<Section11>(createDefaultSection11Impl());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initialData = useRef<Section11>(createDefaultSection11Impl());

  // Debug field mapping on initialization
  useEffect(() => {
    // console.log('🔍 Section 11 Context: Initializing with field mapping debug');
    debugAllEntries();
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = useMemo(() => 
    !isEqual(section11Data, initialData.current), 
    [section11Data]
  );

  // ============================================================================
  // SECTION INTEGRATION HOOK
  // ============================================================================

  const { registerSection, syncSectionData } = useSectionIntegration();

  // ============================================================================
  // VALIDATION LOGIC
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Validate each residence entry
    section11Data.section11.residences.forEach((entry, index) => {
      // Address validation
      if (!entry.address.streetAddress.value.trim()) {
        validationErrors.push({
          field: `section11.residences[${index}].address.streetAddress`,
          message: `Residence ${index + 1}: Street address is required`,
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      if (!entry.address.city.value.trim()) {
        validationErrors.push({
          field: `section11.residences[${index}].address.city`,
          message: `Residence ${index + 1}: City is required`,
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      // State or Country validation
      if (!entry.address.state.value && !entry.address.country.value) {
        validationErrors.push({
          field: `section11.residences[${index}].address.state`,
          message: `Residence ${index + 1}: State or Country is required`,
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      // Date validation
      if (!entry.fromDate.value.trim()) {
        validationErrors.push({
          field: `section11.residences[${index}].fromDate`,
          message: `Residence ${index + 1}: From date is required`,
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      if (!entry.present.value && !entry.toDate.value.trim()) {
        validationErrors.push({
          field: `section11.residences[${index}].toDate`,
          message: `Residence ${index + 1}: To date is required when not marked as present`,
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      // Contact person validation
      if (!entry.contactPerson.lastName.value.trim()) {
        validationErrors.push({
          field: `section11.residences[${index}].contactPerson.lastName`,
          message: `Residence ${index + 1}: Contact person last name is required`,
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      if (!entry.contactPerson.firstName.value.trim()) {
        validationErrors.push({
          field: `section11.residences[${index}].contactPerson.firstName`,
          message: `Residence ${index + 1}: Contact person first name is required`,
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      // Phone validation - at least one phone number required
      const hasPhone = entry.contactPerson.eveningPhone.value.trim() ||
                      entry.contactPerson.daytimePhone.value.trim() ||
                      entry.contactPerson.mobilePhone.value.trim();
                      
      if (!hasPhone && !entry.contactPerson.dontKnowContact.value) {
        validationWarnings.push({
          field: `section11.residences[${index}].contactPerson.phone`,
          message: `Residence ${index + 1}: At least one phone number is recommended for contact person`,
          code: 'RECOMMENDED_FIELD',
          severity: 'warning'
        });
      }
    });

    // Validate residence history for gaps
    const historyValidation = validateResidenceHistoryInternal();
    if (historyValidation.hasGaps) {
      historyValidation.gapDetails?.forEach(gap => {
        validationWarnings.push({
          field: 'section11.residences',
          message: `Gap in residence history from ${gap.startDate} to ${gap.endDate} (${gap.duration} days)`,
          code: 'HISTORY_GAP',
          severity: 'warning'
        });
      });
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section11Data]);

  const validateResidenceHistoryInternal = useCallback((): ResidenceValidationResult => {
    const validationContext: Section11ValidationContext = {
      rules: defaultValidationRules,
      allowAddressEstimates: true,
      requiresContinuousHistory: true
    };

    return validateResidenceHistory(section11Data.section11.residences, validationContext);
  }, [section11Data]);

  // ============================================================================
  // CHANGE TRACKING
  // ============================================================================

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    if (!isEqual(section11Data, initialData.current)) {
      changes.section11 = {
        oldValue: initialData.current,
        newValue: section11Data,
        timestamp: new Date().toISOString(),
        fieldChanges: []
      };
    }

    return changes;
  }, [section11Data]);

  const hasUnsavedChanges = useCallback((): boolean => {
    return isDirty;
  }, [isDirty]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  // Use a ref to prevent double execution in React Strict Mode
  const addingEntryRef = useRef(false);

  const addResidenceEntry = useCallback(() => {
    // Prevent double execution from React Strict Mode
    if (addingEntryRef.current) {
      console.warn(`🚫 Context: Already adding entry, preventing duplicate execution`);
      return;
    }

    addingEntryRef.current = true;

    setSection11Data(prevData => {
      // Enforce maximum entry limit (Section 11 supports only 4 entries)
      const MAX_ENTRIES = 4;
      if (prevData.section11.residences.length >= MAX_ENTRIES) {
        console.warn(`Cannot add more than ${MAX_ENTRIES} residence entries to Section 11`);
        addingEntryRef.current = false; // Reset flag
        return prevData; // Return unchanged data
      }

      console.log(`🏠 Context: Adding residence entry. Current count: ${prevData.section11.residences.length}`);
      console.log(`🏠 Context: Current entries:`, prevData.section11.residences.map((entry, i) => `Entry ${i}: ${entry.address.streetAddress.value || 'empty'}`));

      const newData = addResidenceEntryImpl(prevData);

      // Double-check that we didn't exceed the limit after adding
      if (newData.section11.residences.length > MAX_ENTRIES) {
        console.error(`🚫 Context: Entry count exceeded maximum after adding! Reverting to previous state.`);
        addingEntryRef.current = false;
        return prevData; // Return unchanged data
      }

      console.log(`🏠 Context: After adding entry. New count: ${newData.section11.residences.length}`);
      console.log(`🏠 Context: New entries:`, newData.section11.residences.map((entry, i) => `Entry ${i}: ${entry.address.streetAddress.value || 'empty'}`));

      // Reset flag immediately after successful addition
      addingEntryRef.current = false;

      return newData;
    });
  }, []);

  const removeResidenceEntry = useCallback((index: number) => {
    setSection11Data(prevData => removeResidenceEntryImpl(prevData, index));
  }, []);

  const updateFieldValue = useCallback((fieldPath: string, value: any, entryIndex?: number) => {
    console.log(`🔧 Section11: updateFieldValue called:`, {
      fieldPath,
      value,
      entryIndex,
      currentDataSnapshot: section11Data
    });

    const update: Section11FieldUpdate = {
      fieldPath,
      newValue: value,
      entryIndex
    };

    setSection11Data(prevData => {
      console.log(`🔍 Section11: updateFieldValue - before update:`, prevData);
      const updatedData = updateSection11FieldImpl(prevData, update);
      console.log(`✅ Section11: updateFieldValue - after update:`, updatedData);
      return updatedData;
    });
  }, [section11Data]);

  // ============================================================================
  // ENHANCED ENTRY MANAGEMENT
  // ============================================================================

  const getEntryCount = useCallback((): number => {
    return section11Data.section11.residences.length;
  }, [section11Data]);

  const getEntry = useCallback((index: number): ResidenceEntry | null => {
    return section11Data.section11.residences[index] || null;
  }, [section11Data]);

  const moveEntry = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      const residences = newData.section11.residences;
      const [moved] = residences.splice(fromIndex, 1);
      residences.splice(toIndex, 0, moved);
      return newData;
    });
  }, []);

  const duplicateEntry = useCallback((index: number) => {
    const entry = getEntry(index);
    if (!entry) return;

    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      const duplicatedEntry = cloneDeep(entry);
      // Clear dates for duplicated entry
      duplicatedEntry.fromDate.value = '';
      duplicatedEntry.toDate.value = '';
      duplicatedEntry.present.value = false;
      newData.section11.residences.splice(index + 1, 0, duplicatedEntry);
      return newData;
    });
  }, [getEntry]);

  const clearEntry = useCallback((index: number) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[index]) {
        // Reset to default entry structure
        const defaultEntry = createDefaultSection11Impl().section11.residences[0];
        newData.section11.residences[index] = cloneDeep(defaultEntry);
      }
      return newData;
    });
  }, []);

  const bulkUpdateFields = useCallback((updates: Section11FieldUpdate[]) => {
    setSection11Data(prevData => {
      let newData = prevData;
      updates.forEach(update => {
        newData = updateSection11FieldImpl(newData, update);
      });
      return newData;
    });
  }, []);

  // ============================================================================
  // ADDRESS MANAGEMENT
  // ============================================================================

  const updateResidenceAddress = useCallback((entryIndex: number, addressData: any) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        Object.assign(newData.section11.residences[entryIndex].address, addressData);
      }
      return newData;
    });
  }, []);

  const updateContactPersonAddress = useCallback((entryIndex: number, contactAddressData: any) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        Object.assign(newData.section11.residences[entryIndex].contactPerson.address, contactAddressData);
      }
      return newData;
    });
  }, []);

  const toggleAPOFPO = useCallback((entryIndex: number, isAPOFPO: boolean) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        if (isAPOFPO) {
          // Initialize APO/FPO structure if it doesn't exist
          if (!newData.section11.residences[entryIndex].apoFpoAddress) {
            newData.section11.residences[entryIndex].apoFpoAddress = {
              isAPOFPO: { id: '', name: '', type: 'PDFCheckBox', label: 'APO/FPO', value: true, rect: { x: 0, y: 0, width: 0, height: 0 } },
              streetUnit: { id: '', name: '', type: 'PDFTextField', label: 'Street/Unit', value: '', rect: { x: 0, y: 0, width: 0, height: 0 } },
              apoType: { id: '', name: '', type: 'PDFDropdown', label: 'APO Type', value: 'APO', options: ['APO', 'FPO', 'DPO'], rect: { x: 0, y: 0, width: 0, height: 0 } },
              aeCode: { id: '', name: '', type: 'PDFDropdown', label: 'AE Code', value: 'AA', options: ['AA', 'AE', 'AP'], rect: { x: 0, y: 0, width: 0, height: 0 } },
              zipCode: { id: '', name: '', type: 'PDFTextField', label: 'ZIP Code', value: '', rect: { x: 0, y: 0, width: 0, height: 0 } }
            };
          }
          newData.section11.residences[entryIndex].apoFpoAddress!.isAPOFPO.value = true;
        } else {
          // Clear APO/FPO data
          if (newData.section11.residences[entryIndex].apoFpoAddress) {
            newData.section11.residences[entryIndex].apoFpoAddress!.isAPOFPO.value = false;
          }
        }
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // CONTACT PERSON MANAGEMENT
  // ============================================================================

  const updateContactPerson = useCallback((entryIndex: number, contactData: any) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        Object.assign(newData.section11.residences[entryIndex].contactPerson, contactData);
      }
      return newData;
    });
  }, []);

  const addContactPhone = useCallback((entryIndex: number, phoneType: 'evening' | 'daytime' | 'mobile', phoneData: any) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const contact = newData.section11.residences[entryIndex].contactPerson;
        if (phoneType === 'evening') {
          Object.assign(contact.eveningPhone, phoneData);
        } else if (phoneType === 'daytime') {
          Object.assign(contact.daytimePhone, phoneData);
        } else if (phoneType === 'mobile') {
          Object.assign(contact.mobilePhone, phoneData);
        }
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // DATE MANAGEMENT
  // ============================================================================

  const updateDateRange = useCallback((entryIndex: number, fromDate: string, toDate: string, isPresent?: boolean) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const entry = newData.section11.residences[entryIndex];
        entry.fromDate.value = fromDate;
        entry.toDate.value = toDate;
        if (isPresent !== undefined) {
          entry.present.value = isPresent;
        }
      }
      return newData;
    });
  }, []);

  const markAsPresent = useCallback((entryIndex: number) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        newData.section11.residences[entryIndex].present.value = true;
        newData.section11.residences[entryIndex].toDate.value = '';
      }
      return newData;
    });
  }, []);

  const setDateEstimate = useCallback((entryIndex: number, dateType: 'from' | 'to', isEstimate: boolean) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const entry = newData.section11.residences[entryIndex];
        if (dateType === 'from') {
          entry.fromDateEstimate.value = isEstimate;
        } else {
          entry.toDateEstimate.value = isEstimate;
        }
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // PERSISTENCE OPERATIONS
  // ============================================================================

  const saveSection = useCallback(async () => {
    setIsLoading(true);
    try {
      const dynamicService = new DynamicService();
      await dynamicService.saveSectionData('section11', section11Data);
      initialData.current = cloneDeep(section11Data);
    } catch (error) {
      console.error("Error saving Section 11:", error);
      setErrors(prev => ({ ...prev, save: 'Failed to save section data.' }));
    } finally {
      setIsLoading(false);
    }
  }, [section11Data, syncSectionData]);

  const loadSection = useCallback(async () => {
    setIsLoading(true);
    try {
      const dynamicService = new DynamicService();
      const data = await dynamicService.loadSectionData('section11');
      if (data) {
        const sectionData = data as Section11;
        setSection11Data(sectionData);
        initialData.current = cloneDeep(sectionData);
      }
    } catch (error) {
      console.error("Error loading Section 11:", error);
      setErrors(prev => ({ ...prev, load: 'Failed to load section data.' }));
    } finally {
      setIsLoading(false);
    }
  }, [syncSectionData]);

  const resetSection = useCallback(() => {
    const defaultData = createDefaultSection11Impl();
    setSection11Data(defaultData);
    initialData.current = cloneDeep(defaultData);
    setErrors({});
  }, []);

  const exportSection = useCallback((): Section11 => {
    return cloneDeep(section11Data);
  }, [section11Data]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getFieldValue = useCallback((fieldPath: string, entryIndex?: number): any => {
    if (entryIndex !== undefined && section11Data.section11.residences[entryIndex]) {
      // Navigate to specific entry field
      const pathParts = fieldPath.split('.');
      let value: any = section11Data.section11.residences[entryIndex];
      for (const part of pathParts) {
        value = value?.[part];
      }
      return value?.value || value;
    }
    
    // Navigate to section-level field
    const pathParts = fieldPath.split('.');
    let value: any = section11Data;
    for (const part of pathParts) {
      value = value?.[part];
    }
    return value?.value || value;
  }, [section11Data]);

  const setFieldValue = useCallback((fieldPath: string, value: any, entryIndex?: number) => {
    updateFieldValue(fieldPath, value, entryIndex);
  }, [updateFieldValue]);

  // ============================================================================
  // RESIDENCE-SPECIFIC UTILITIES
  // ============================================================================

  const getTotalResidenceTimespan = useCallback((): number => {
    const residences = section11Data.section11.residences
      .filter(r => r.fromDate.value && (r.toDate.value || r.present.value))
      .map(r => ({
        from: new Date(r.fromDate.value),
        to: r.present.value ? new Date() : new Date(r.toDate.value)
      }))
      .sort((a, b) => a.from.getTime() - b.from.getTime());

    if (residences.length === 0) return 0;

    const earliest = residences[0].from;
    const latest = Math.max(...residences.map(r => r.to.getTime()));
    const timeDiff = latest - earliest.getTime();
    return timeDiff / (1000 * 60 * 60 * 24 * 365.25); // Convert to years
  }, [section11Data]);

  const getResidenceGaps = useCallback(() => {
    const historyValidation = validateResidenceHistoryInternal();
    return historyValidation.gapDetails || [];
  }, [validateResidenceHistoryInternal]);

  const isResidenceHistoryComplete = useCallback((): boolean => {
    const totalTimespan = getTotalResidenceTimespan();
    const hasGaps = getResidenceGaps().length > 0;
    return totalTimespan >= defaultValidationRules.minimumResidenceTimeframe && !hasGaps;
  }, [getTotalResidenceTimespan, getResidenceGaps]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Create a wrapper function that matches the integration hook's expected signature
  // Integration expects: (path: string, value: any) => void
  // Section 11 has: (fieldPath: string, value: any, entryIndex?: number) => void
  const updateFieldValueWrapper = useCallback((path: string, value: any) => {
    console.log(`🔧 Section11: updateFieldValueWrapper called with path=${path}, value=`, value);

    // Parse the path to extract entry index and field path
    // Expected format: "section11.residences[index].fieldPath" or "section11.fieldPath"
    const pathParts = path.split('.');

    if (pathParts.length >= 3 && pathParts[0] === 'section11' && pathParts[1] === 'residences') {
      const residencesMatch = pathParts[1].match(/residences\[(\d+)\]/);

      if (residencesMatch) {
        const entryIndex = parseInt(residencesMatch[1]);
        const fieldPath = pathParts.slice(2).join('.');

        console.log(`🔧 Section11: Parsed residence entry - entryIndex=${entryIndex}, fieldPath=${fieldPath}`);

        // Call Section 11's updateFieldValue with the correct signature
        updateFieldValue(fieldPath, value, entryIndex);
        return;
      }

      // Handle direct residence array access like "section11.residences[0].address.streetAddress"
      const residenceArrayMatch = pathParts[1].match(/residences/);
      if (residenceArrayMatch && pathParts[2] && pathParts[2].match(/\[(\d+)\]/)) {
        const indexMatch = pathParts[2].match(/\[(\d+)\]/);
        if (indexMatch) {
          const entryIndex = parseInt(indexMatch[1]);
          const fieldPath = pathParts.slice(3).join('.');

          console.log(`🔧 Section11: Parsed residence array access - entryIndex=${entryIndex}, fieldPath=${fieldPath}`);

          updateFieldValue(fieldPath, value, entryIndex);
          return;
        }
      }
    }

    // Fallback: use lodash set for direct path updates
    console.log(`🔧 Section11: Using fallback lodash set for path=${path}`);
    setSection11Data(prev => {
      const updated = cloneDeep(prev);
      set(updated, path, value);
      return updated;
    });
  }, [updateFieldValue]);

  // Integration with main form context using Section 1 gold standard pattern
  // Note: integration variable is used internally by the hook for registration
  const integration = useSection86FormIntegration(
    'section11',
    'Section 11: Where You Have Lived',
    section11Data,
    setSection11Data,
    () => ({ isValid: validateSection().isValid, errors: validateSection().errors, warnings: validateSection().warnings }),
    () => getChanges(),
    updateFieldValueWrapper // Pass wrapper function that matches expected signature
  );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section11ContextType = {
    // Core State
    section11Data,
    isLoading,
    errors,
    isDirty,

    // Residence Entry Management
    addResidenceEntry,
    removeResidenceEntry,
    updateFieldValue,
    getEntryCount,
    getEntry,
    moveEntry,
    duplicateEntry,
    clearEntry,
    bulkUpdateFields,

    // Address Management
    updateResidenceAddress,
    updateContactPersonAddress,
    toggleAPOFPO,

    // Contact Person Management
    updateContactPerson,
    addContactPhone,

    // Date Management
    updateDateRange,
    markAsPresent,
    setDateEstimate,

    // Validation & Persistence
    validateSection,
    validateResidenceHistory: validateResidenceHistoryInternal,
    saveSection,
    loadSection,
    resetSection,
    exportSection,

    // Utility Functions
    getChanges,
    hasUnsavedChanges,
    getFieldValue,
    setFieldValue,
    getTotalResidenceTimespan,
    getResidenceGaps,
    isResidenceHistoryComplete
  };

  // ============================================================================
  // SECTION REGISTRATION (MOVED TO END)
  // ============================================================================
  useEffect(() => {
    const contextObj: BaseSectionContext = {
      sectionId: 'section11',
      sectionName: 'Where You Have Lived',
      sectionData: section11Data,
      isLoading,
      errors: Object.keys(errors).map(field => ({
        field,
        message: errors[field],
        code: 'VALIDATION_ERROR',
        severity: 'error' as const
      })),
      isDirty,
      updateFieldValue,
      validateSection: () => validateSection(),
      resetSection,
      loadSection: (data: Section11) => {
        setSection11Data(data);
        initialData.current = cloneDeep(data);
      },
      getChanges
    };

    registerSection({
      sectionId: 'section11',
      sectionName: 'Where You Have Lived',
      context: contextObj,
      isActive: true,
      lastUpdated: new Date() as Date
    });
  }, [section11Data, registerSection, isLoading, errors, isDirty, updateFieldValue, resetSection, getChanges, validateSection]);

  return (
    <Section11Context.Provider value={contextValue}>
      {children}
    </Section11Context.Provider>
  );
};

// ============================================================================
// HOOK FOR CONSUMING CONTEXT
// ============================================================================

export const useSection11 = (): Section11ContextType => {
  const context = useContext(Section11Context);
  if (!context) {
    throw new Error('useSection11 must be used within a Section11Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section11Provider;
export { Section11Context };
export type { Section11ContextType }; 