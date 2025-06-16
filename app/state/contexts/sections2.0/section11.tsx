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
import { debugAllEntries, validateSection11FieldMappings, createFieldMappingChecklist } from './section11-field-mapping';
import type {
  ValidationResult,
  ValidationError,
  ChangeSet,
  BaseSectionContext
} from '../shared/base-interfaces';
import DynamicService from '../../../../api/service/dynamicService';
import { useSF86Form } from './SF86FormContext';

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
  minimumResidenceTimeframe: 10 // years - FIXED: Changed from 7 to 10 years per SF-86 requirements
  // NOTE: This was previously set to 7 years but was corrected to match official SF-86 requirements
  // which specify a 10-year residence history requirement for security clearance background checks
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

  // Comprehensive field management for all 252 fields (63 per entry)
  updatePhoneFields: (entryIndex: number, phoneData: { phone1?: string; phone1Ext?: string; phone1Intl?: boolean; phone2?: string; phone2Ext?: string; phone2Intl?: boolean; phone3?: string; phone3Ext?: string; phone3Intl?: boolean; dontKnowContact?: boolean }) => void;
  updateDateFields: (entryIndex: number, dateData: { fromDate?: string; fromDateEstimate?: boolean; toDate?: string; toDateEstimate?: boolean; present?: boolean }) => void;
  updateMainAddressFields: (entryIndex: number, addressData: { streetAddress?: string; city?: string; state?: string; country?: string; zipCode?: string }) => void;
  updateContactPersonNames: (entryIndex: number, nameData: { firstName?: string; middleName?: string; lastName?: string; suffix?: string }) => void;
  updateRelationshipFields: (entryIndex: number, relationshipData: { neighbor?: boolean; friend?: boolean; landlord?: boolean; business?: boolean; other?: boolean; otherExplain?: string }) => void;
  updateContactAddressFields: (entryIndex: number, contactAddressData: { street?: string; city?: string; state?: string; country?: string; zip?: string; email?: string; emailUnknown?: boolean }) => void;
  updateLastContactFields: (entryIndex: number, lastContactData: { lastContact?: string; lastContactEstimate?: boolean }) => void;
  updatePhysicalAddressFields: (entryIndex: number, physicalData: { street?: string; city?: string; state?: string; country?: string; addressAlt?: string; apoFpoAddress?: string; apoFpoState?: string; apoFpoZip?: string; physicalZip?: string; altStreet?: string; altCity?: string; altState?: string; altCountry?: string; altZip?: string; addressFull?: string }) => void;
  updateRadioButtonFields: (entryIndex: number, radioData: { residenceType?: string; addressTypeRadio?: string; residenceTypeRadioAlt?: string }) => void;
  updateAdditionalFields: (entryIndex: number, additionalData: { residenceTypeOther?: string; apoFpoFull?: string; apoFpoStateAlt?: string; apoFpoZipAlt?: string }) => void;

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

  // ============================================================================
  // SUBMIT-ONLY MODE FUNCTIONS
  // ============================================================================

  submitSectionData: () => Promise<void>;
  hasPendingChanges: () => boolean;
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

const Section11Provider: React.FC<Section11ProviderProps> = ({ children }) => {
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

    // Validate field mappings coverage
    const validation = validateSection11FieldMappings();

    if (validation.coverage >= 100) {
      // console.log(`✅ Section11: All ${validation.totalFields} PDF form fields are properly mapped - 100% COVERAGE ACHIEVED!`);
    } else if (validation.coverage >= 98) {
      // console.log(`✅ Section11: Nearly all ${validation.totalFields} PDF form fields are properly mapped`);
    } else {
      // console.warn(`⚠️ Section11: ${validation.missingFields.length} fields are not mapped`);
      // console.warn('Missing fields:');
      validation.missingFields.slice(0, 10).forEach(field => {
        // console.warn(`  - ${field}`);
      });
      if (validation.missingFields.length > 10) {
        // console.warn(`  ... and ${validation.missingFields.length - 10} more`);
      }
    }

    // Create comprehensive field mapping checklist
    const checklist = createFieldMappingChecklist();
    // console.log('📊 Section11: Field mapping checklist:', checklist);
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = useMemo(() => 
    !isEqual(section11Data, initialData.current), 
    [section11Data]
  );

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Access SF86FormContext to sync with loaded data
  const sf86Form = useSF86Form();

  // ============================================================================
  // VALIDATION LOGIC
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // // Validate each residence entry
    // section11Data.section11.residences.forEach((entry, index) => {
    //   // Address validation
    //   if (!entry.address.streetAddress.value.trim()) {
    //     validationErrors.push({
    //       field: `section11.residences[${index}].address.streetAddress`,
    //       message: `Residence ${index + 1}: Street address is required`,
    //       code: 'REQUIRED_FIELD',
    //       severity: 'error'
    //     });
    //   }

    //   if (!entry.address.city.value.trim()) {
    //     validationErrors.push({
    //       field: `section11.residences[${index}].address.city`,
    //       message: `Residence ${index + 1}: City is required`,
    //       code: 'REQUIRED_FIELD',
    //       severity: 'error'
    //     });
    //   }

    //   // State or Country validation
    //   if (!entry.address.state.value && !entry.address.country.value) {
    //     validationErrors.push({
    //       field: `section11.residences[${index}].address.state`,
    //       message: `Residence ${index + 1}: State or Country is required`,
    //       code: 'REQUIRED_FIELD',
    //       severity: 'error'
    //     });
    //   }

    //   // Date validation
    //   if (!entry.fromDate.value.trim()) {
    //     validationErrors.push({
    //       field: `section11.residences[${index}].fromDate`,
    //       message: `Residence ${index + 1}: From date is required`,
    //       code: 'REQUIRED_FIELD',
    //       severity: 'error'
    //     });
    //   }

    //   if (!entry.present.value && !entry.toDate.value.trim()) {
    //     validationErrors.push({
    //       field: `section11.residences[${index}].toDate`,
    //       message: `Residence ${index + 1}: To date is required when not marked as present`,
    //       code: 'REQUIRED_FIELD',
    //       severity: 'error'
    //     });
    //   }

    //   // Contact person validation
    //   if (!entry.contactPerson.lastName.value.trim()) {
    //     validationErrors.push({
    //       field: `section11.residences[${index}].contactPerson.lastName`,
    //       message: `Residence ${index + 1}: Contact person last name is required`,
    //       code: 'REQUIRED_FIELD',
    //       severity: 'error'
    //     });
    //   }

    //   if (!entry.contactPerson.firstName.value.trim()) {
    //     validationErrors.push({
    //       field: `section11.residences[${index}].contactPerson.firstName`,
    //       message: `Residence ${index + 1}: Contact person first name is required`,
    //       code: 'REQUIRED_FIELD',
    //       severity: 'error'
    //     });
    //   }

    //   // Phone validation - at least one phone number required
    //   const hasPhone = entry.contactPerson.eveningPhone.value.trim() ||
    //                   entry.contactPerson.daytimePhone.value.trim() ||
    //                   entry.contactPerson.mobilePhone.value.trim();
                      
    //   if (!hasPhone && !entry.contactPerson.dontKnowContact.value) {
    //     validationWarnings.push({
    //       field: `section11.residences[${index}].contactPerson.phone`,
    //       message: `Residence ${index + 1}: At least one phone number is recommended for contact person`,
    //       code: 'RECOMMENDED_FIELD',
    //       severity: 'warning'
    //     });
    //   }
    // });

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
  // SUBMIT-ONLY MODE CONFIGURATION (Following Section 10 Pattern)
  // ============================================================================

  // Enable submit-only mode to prevent auto-sync on every field change
  // This ensures data is only synced to SF86FormContext when user explicitly submits
  const [submitOnlyMode] = useState(true); // Enable submit-only mode for Section 11
  const [pendingChanges, setPendingChanges] = useState(false);
  const lastSubmittedDataRef = useRef<Section11 | null>(null);

  // Track when data changes to show pending changes indicator
  useEffect(() => {
    if (submitOnlyMode && lastSubmittedDataRef.current) {
      const hasChanges = !isEqual(section11Data, lastSubmittedDataRef.current);
      setPendingChanges(hasChanges);
    }
  }, [section11Data, submitOnlyMode]);

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
    // Removed section11Data from dependencies to prevent unnecessary re-renders
    // This follows the Section 1 gold standard pattern for performance optimization

    const update: Section11FieldUpdate = {
      fieldPath,
      newValue: value,
      entryIndex
    };

    setSection11Data(prevData => {
      const updatedData = updateSection11FieldImpl(prevData, update);
      return updatedData;
    });
  }, []); // Empty dependencies array for optimal performance

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
  // COMPREHENSIVE FIELD MANAGEMENT FOR ALL 252 FIELDS (63 PER ENTRY)
  // ============================================================================

  const updatePhoneFields = useCallback((entryIndex: number, phoneData: { phone1?: string; phone1Ext?: string; phone1Intl?: boolean; phone2?: string; phone2Ext?: string; phone2Intl?: boolean; phone3?: string; phone3Ext?: string; phone3Intl?: boolean; dontKnowContact?: boolean }) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const contact = newData.section11.residences[entryIndex].contactPerson;
        if (phoneData.phone1 !== undefined) contact.phone1.value = phoneData.phone1;
        if (phoneData.phone1Ext !== undefined) contact.phone1Ext.value = phoneData.phone1Ext;
        if (phoneData.phone1Intl !== undefined) contact.phone1Intl.value = phoneData.phone1Intl;
        if (phoneData.phone2 !== undefined) contact.phone2.value = phoneData.phone2;
        if (phoneData.phone2Ext !== undefined) contact.phone2Ext.value = phoneData.phone2Ext;
        if (phoneData.phone2Intl !== undefined) contact.phone2Intl.value = phoneData.phone2Intl;
        if (phoneData.phone3 !== undefined) contact.phone3.value = phoneData.phone3;
        if (phoneData.phone3Ext !== undefined) contact.phone3Ext.value = phoneData.phone3Ext;
        if (phoneData.phone3Intl !== undefined) contact.phone3Intl.value = phoneData.phone3Intl;
        if (phoneData.dontKnowContact !== undefined) contact.dontKnowContact.value = phoneData.dontKnowContact;
      }
      return newData;
    });
  }, []);

  const updateDateFields = useCallback((entryIndex: number, dateData: { fromDate?: string; fromDateEstimate?: boolean; toDate?: string; toDateEstimate?: boolean; present?: boolean }) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const contact = newData.section11.residences[entryIndex].contactPerson;
        if (dateData.fromDate !== undefined) contact.fromDate.value = dateData.fromDate;
        if (dateData.fromDateEstimate !== undefined) contact.fromDateEstimate.value = dateData.fromDateEstimate;
        if (dateData.toDate !== undefined) contact.toDate.value = dateData.toDate;
        if (dateData.toDateEstimate !== undefined) contact.toDateEstimate.value = dateData.toDateEstimate;
        if (dateData.present !== undefined) contact.present.value = dateData.present;
      }
      return newData;
    });
  }, []);

  const updateMainAddressFields = useCallback((entryIndex: number, addressData: { streetAddress?: string; city?: string; state?: string; country?: string; zipCode?: string }) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const contact = newData.section11.residences[entryIndex].contactPerson;
        if (addressData.streetAddress !== undefined) contact.streetAddress.value = addressData.streetAddress;
        if (addressData.city !== undefined) contact.city.value = addressData.city;
        if (addressData.state !== undefined) contact.state.value = addressData.state;
        if (addressData.country !== undefined) contact.country.value = addressData.country;
        if (addressData.zipCode !== undefined) contact.zipCode.value = addressData.zipCode;
      }
      return newData;
    });
  }, []);

  const updateContactPersonNames = useCallback((entryIndex: number, nameData: { firstName?: string; middleName?: string; lastName?: string; suffix?: string }) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const contact = newData.section11.residences[entryIndex].contactPerson;
        if (nameData.firstName !== undefined) contact.firstName.value = nameData.firstName;
        if (nameData.middleName !== undefined) contact.middleName.value = nameData.middleName;
        if (nameData.lastName !== undefined) contact.lastName.value = nameData.lastName;
        if (nameData.suffix !== undefined) contact.suffix.value = nameData.suffix;
      }
      return newData;
    });
  }, []);

  const updateRelationshipFields = useCallback((entryIndex: number, relationshipData: { neighbor?: boolean; friend?: boolean; landlord?: boolean; business?: boolean; other?: boolean; otherExplain?: string }) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const contact = newData.section11.residences[entryIndex].contactPerson;
        if (relationshipData.neighbor !== undefined) contact.relationshipNeighbor.value = relationshipData.neighbor;
        if (relationshipData.friend !== undefined) contact.relationshipFriend.value = relationshipData.friend;
        if (relationshipData.landlord !== undefined) contact.relationshipLandlord.value = relationshipData.landlord;
        if (relationshipData.business !== undefined) contact.relationshipBusiness.value = relationshipData.business;
        if (relationshipData.other !== undefined) contact.relationshipOther.value = relationshipData.other;
        if (relationshipData.otherExplain !== undefined) contact.relationshipOtherExplain.value = relationshipData.otherExplain;
      }
      return newData;
    });
  }, []);

  const updateContactAddressFields = useCallback((entryIndex: number, contactAddressData: { street?: string; city?: string; state?: string; country?: string; zip?: string; email?: string; emailUnknown?: boolean }) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const contact = newData.section11.residences[entryIndex].contactPerson;
        if (contactAddressData.street !== undefined) contact.contactStreet.value = contactAddressData.street;
        if (contactAddressData.city !== undefined) contact.contactCity.value = contactAddressData.city;
        if (contactAddressData.state !== undefined) contact.contactState.value = contactAddressData.state;
        if (contactAddressData.country !== undefined) contact.contactCountry.value = contactAddressData.country;
        if (contactAddressData.zip !== undefined) contact.contactZip.value = contactAddressData.zip;
        if (contactAddressData.email !== undefined) contact.contactEmail.value = contactAddressData.email;
        if (contactAddressData.emailUnknown !== undefined) contact.contactEmailUnknown.value = contactAddressData.emailUnknown;
      }
      return newData;
    });
  }, []);

  const updateLastContactFields = useCallback((entryIndex: number, lastContactData: { lastContact?: string; lastContactEstimate?: boolean }) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const contact = newData.section11.residences[entryIndex].contactPerson;
        if (lastContactData.lastContact !== undefined) contact.lastContact.value = lastContactData.lastContact;
        if (lastContactData.lastContactEstimate !== undefined) contact.lastContactEstimate.value = lastContactData.lastContactEstimate;
      }
      return newData;
    });
  }, []);

  const updatePhysicalAddressFields = useCallback((entryIndex: number, physicalData: { street?: string; city?: string; state?: string; country?: string; addressAlt?: string; apoFpoAddress?: string; apoFpoState?: string; apoFpoZip?: string; physicalZip?: string; altStreet?: string; altCity?: string; altState?: string; altCountry?: string; altZip?: string; addressFull?: string }) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const contact = newData.section11.residences[entryIndex].contactPerson;
        if (physicalData.street !== undefined) contact.physicalStreet.value = physicalData.street;
        if (physicalData.city !== undefined) contact.physicalCity.value = physicalData.city;
        if (physicalData.state !== undefined) contact.physicalState.value = physicalData.state;
        if (physicalData.country !== undefined) contact.physicalCountry.value = physicalData.country;
        if (physicalData.addressAlt !== undefined) contact.physicalAddressAlt.value = physicalData.addressAlt;
        if (physicalData.apoFpoAddress !== undefined) contact.apoFpoAddress.value = physicalData.apoFpoAddress;
        if (physicalData.apoFpoState !== undefined) contact.apoFpoState.value = physicalData.apoFpoState;
        if (physicalData.apoFpoZip !== undefined) contact.apoFpoZip.value = physicalData.apoFpoZip;
        if (physicalData.physicalZip !== undefined) contact.physicalZip.value = physicalData.physicalZip;
        if (physicalData.altStreet !== undefined) contact.physicalAltStreet.value = physicalData.altStreet;
        if (physicalData.altCity !== undefined) contact.physicalAltCity.value = physicalData.altCity;
        if (physicalData.altState !== undefined) contact.physicalAltState.value = physicalData.altState;
        if (physicalData.altCountry !== undefined) contact.physicalAltCountry.value = physicalData.altCountry;
        if (physicalData.altZip !== undefined) contact.physicalAltZip.value = physicalData.altZip;
        if (physicalData.addressFull !== undefined) contact.physicalAddressFull.value = physicalData.addressFull;
      }
      return newData;
    });
  }, []);

  const updateRadioButtonFields = useCallback((entryIndex: number, radioData: { residenceType?: string; addressTypeRadio?: string; residenceTypeRadioAlt?: string }) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const contact = newData.section11.residences[entryIndex].contactPerson;
        if (radioData.residenceType !== undefined) contact.residenceType.value = radioData.residenceType;
        if (radioData.addressTypeRadio !== undefined) contact.addressTypeRadio.value = radioData.addressTypeRadio;
        if (radioData.residenceTypeRadioAlt !== undefined) contact.residenceTypeRadioAlt.value = radioData.residenceTypeRadioAlt;
      }
      return newData;
    });
  }, []);

  const updateAdditionalFields = useCallback((entryIndex: number, additionalData: { residenceTypeOther?: string; apoFpoFull?: string; apoFpoStateAlt?: string; apoFpoZipAlt?: string }) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const contact = newData.section11.residences[entryIndex].contactPerson;
        if (additionalData.residenceTypeOther !== undefined) contact.residenceTypeOther.value = additionalData.residenceTypeOther;
        if (additionalData.apoFpoFull !== undefined) contact.apoFpoFull.value = additionalData.apoFpoFull;
        if (additionalData.apoFpoStateAlt !== undefined) contact.apoFpoStateAlt.value = additionalData.apoFpoStateAlt;
        if (additionalData.apoFpoZipAlt !== undefined) contact.apoFpoZipAlt.value = additionalData.apoFpoZipAlt;
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
      await dynamicService.saveUserFormData('section11', section11Data);
      initialData.current = cloneDeep(section11Data);
    } catch (error) {
      console.error("Error saving Section 11:", error);
      setErrors(prev => ({ ...prev, save: 'Failed to save section data.' }));
    } finally {
      setIsLoading(false);
    }
  }, [section11Data]);

  const loadSection = useCallback((data: Section11) => {
    setSection11Data(cloneDeep(data));
    initialData.current = cloneDeep(data);
    setErrors({});
  }, []);

  const resetSection = useCallback(() => {
    const defaultData = createDefaultSection11Impl();
    setSection11Data(defaultData);
    initialData.current = cloneDeep(defaultData);
    setErrors({});

    // Reset submit-only mode tracking
    if (submitOnlyMode) {
      lastSubmittedDataRef.current = null;
      setPendingChanges(false);
    }
  }, [submitOnlyMode]);

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
      .map(r => {
        // Parse MM/YYYY format correctly by converting to MM/01/YYYY
        const parseMMYYYY = (dateStr: string): Date => {
          if (!dateStr) return new Date();

          // Handle MM/YYYY format (e.g., "01/2020")
          const parts = dateStr.split('/');
          if (parts.length === 2) {
            const month = parseInt(parts[0]) - 1; // Month is 0-indexed in Date
            const year = parseInt(parts[1]);
            return new Date(year, month, 1); // Use first day of month
          }

          // Fallback to regular Date parsing
          return new Date(dateStr);
        };

        return {
          from: parseMMYYYY(r.fromDate.value),
          to: r.present.value ? new Date() : parseMMYYYY(r.toDate.value)
        };
      });

    if (residences.length === 0) return 0;

    // Calculate cumulative time for each residence period
    let totalYears = 0;
    for (const residence of residences) {
      const timeDiff = residence.to.getTime() - residence.from.getTime();
      const years = timeDiff / (1000 * 60 * 60 * 24 * 365.25); // Convert to years
      totalYears += years;
    }

    return totalYears;
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
    // Simplified path parsing for better performance
    // Expected format: "section11.residences[index].fieldPath" or "section11.fieldPath"
    const pathParts = path.split('.');

    if (pathParts.length >= 3 && pathParts[0] === 'section11' && pathParts[1].includes('residences')) {
      // Extract index from residences[index] format
      const indexMatch = pathParts[1].match(/residences\[(\d+)\]/);

      if (indexMatch) {
        const entryIndex = parseInt(indexMatch[1]);
        const fieldPath = pathParts.slice(2).join('.');
        updateFieldValue(fieldPath, value, entryIndex);
        return;
      }

      // Handle alternative format: section11.residences.0.fieldPath
      if (pathParts[2] && !isNaN(parseInt(pathParts[2]))) {
        const entryIndex = parseInt(pathParts[2]);
        const fieldPath = pathParts.slice(3).join('.');
        updateFieldValue(fieldPath, value, entryIndex);
        return;
      }
    }

    // Fallback: use lodash set for direct path updates
    setSection11Data(prev => {
      const updated = cloneDeep(prev);
      set(updated, path, value);
      return updated;
    });
  }, []); // Removed updateFieldValue dependency to prevent re-creation



  // ============================================================================
  // SUBMIT-ONLY MODE FUNCTIONS (After Integration)
  // ============================================================================

  /**
   * Manually sync data to main form context (submit-only mode)
   * This function should only be called when the user explicitly submits
   */
  const submitSectionData = useCallback(async () => {
    if (submitOnlyMode) {
      console.log('🚀 Section11: Manually syncing data to main form context (submit-only mode)');

      // Actually sync data to SF86FormContext (this was missing!)
      sf86Form.updateSectionData('section11', section11Data);

      // Update tracking references
      lastSubmittedDataRef.current = cloneDeep(section11Data);
      setPendingChanges(false);

      console.log('✅ Section11: Data sync complete');
    }
  }, [submitOnlyMode, section11Data, sf86Form]);

  /**
   * Check if there are pending changes that haven't been submitted
   */
  const hasPendingChanges = useCallback(() => {
    if (!submitOnlyMode) return false;
    return pendingChanges;
  }, [submitOnlyMode, pendingChanges]);

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

    // Comprehensive field management for all 252 fields (63 per entry)
    updatePhoneFields,
    updateDateFields,
    updateMainAddressFields,
    updateContactPersonNames,
    updateRelationshipFields,
    updateContactAddressFields,
    updateLastContactFields,
    updatePhysicalAddressFields,
    updateRadioButtonFields,
    updateAdditionalFields,

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
    isResidenceHistoryComplete,

    // Submit-Only Mode Functions
    submitSectionData,
    hasPendingChanges
  };

  // ============================================================================
  // SF86FORM CONTEXT SYNC
  // ============================================================================

  // Sync with SF86FormContext when data is loaded
  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

    if (sf86Form.formData.section11 && sf86Form.formData.section11 !== section11Data) {
      if (isDebugMode) {
        console.log('🔄 Section11: Syncing with SF86FormContext loaded data');
      }

      // Load the data from SF86FormContext
      loadSection(sf86Form.formData.section11);

      if (isDebugMode) {
        console.log('✅ Section11: Data sync complete');
      }
    }
  }, [sf86Form.formData.section11, loadSection]);

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


  }, [section11Data, isLoading, errors, isDirty, updateFieldValue, resetSection, getChanges, validateSection]);

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
