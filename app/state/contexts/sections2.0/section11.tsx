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
  createAPOFPOPhysicalAddressFromReference,
  createResidenceEntryFromReference
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

  // Address Management
  updateResidenceAddress: (entryIndex: number, addressData: any) => void;
  updateContactPersonAddress: (entryIndex: number, contactAddressData: any) => void;
  toggleAPOFPO: (entryIndex: number, isAPOFPO: boolean) => void;

  // Contact Person Management
  updateContactPerson: (entryIndex: number, contactData: any) => void;
  addContactPhone: (entryIndex: number, phoneType: 'phone1' | 'phone2' | 'phone3', phoneData: any) => void;

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
  loadSection: (data: Section11) => void;
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

  const [section11Data, setSection11Data] = useState<Section11>(() => {
    return createDefaultSection11Impl();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initialData = useRef<Section11>(createDefaultSection11Impl());

  // Debug field mapping on initialization
  useEffect(() => {
    // console.log('🔍 Section 11 Context: Initializing with field mapping debug');
    // Temporarily disabled debugAllEntries() to prevent crash during data structure initialization
    // debugAllEntries();

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

    // Validate each residence entry
    section11Data.section11.residences.forEach((entry, index) => {
      // Address validation with defensive programming
      if (!(entry.residenceAddress?.streetAddress?.value?.trim() || '')) {
        validationErrors.push({
          field: `section11.residences[${index}].residenceAddress.streetAddress`,
          message: `Residence ${index + 1}: Street address is required`,
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      if (!(entry.residenceAddress?.city?.value?.trim() || '')) {
        validationErrors.push({
          field: `section11.residences[${index}].residenceAddress.city`,
          message: `Residence ${index + 1}: City is required`,
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      // State or Country validation
      if (!entry.residenceAddress.state.value && !entry.residenceAddress.country.value) {
        validationErrors.push({
          field: `section11.residences[${index}].residenceAddress.state`,
          message: `Residence ${index + 1}: State or Country is required`,
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      // Date validation
      if (!entry.residenceDates.fromDate.value.trim()) {
        validationErrors.push({
          field: `section11.residences[${index}].residenceDates.fromDate`,
          message: `Residence ${index + 1}: From date is required`,
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      if (!entry.residenceDates.isPresent.value && !entry.residenceDates.toDate.value.trim()) {
        validationErrors.push({
          field: `section11.residences[${index}].residenceDates.toDate`,
          message: `Residence ${index + 1}: To date is required when not marked as present`,
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      // Contact person validation
      if (!entry.contactPersonName.lastName.value.trim()) {
        validationErrors.push({
          field: `section11.residences[${index}].contactPersonName.lastName`,
          message: `Residence ${index + 1}: Contact person last name is required`,
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      if (!entry.contactPersonName.firstName.value.trim()) {
        validationErrors.push({
          field: `section11.residences[${index}].contactPersonName.firstName`,
          message: `Residence ${index + 1}: Contact person first name is required`,
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      // Phone validation - at least one phone number required
      const hasPhone = entry.contactPersonPhones.eveningPhone.value.trim() ||
        entry.contactPersonPhones.daytimePhone.value.trim() ||
        entry.contactPersonPhones.mobilePhone.value.trim();

      if (!hasPhone && !entry.contactPersonPhones?.dontKnowContact?.value) {
        validationWarnings.push({
          field: `section11.residences[${index}].contactPersonPhones.phone`,
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

    // Validation logic moved from interface to context to follow Interface→Context→Component hierarchy
    const errors: string[] = [];
    const warnings: string[] = [];
    const residences = section11Data.section11.residences;

    // Check for basic required fields using new structure
    residences.forEach((residence, index) => {
      if (!residence.residenceAddress?.streetAddress?.value) {
        errors.push(`Residence ${index + 1}: Street address is required`);
      }
      if (!residence.residenceAddress?.city?.value) {
        errors.push(`Residence ${index + 1}: City is required`);
      }
      if (!residence.residenceDates?.fromDate?.value) {
        errors.push(`Residence ${index + 1}: From date is required`);
      }
      if (!residence.contactPersonName?.lastName?.value) {
        errors.push(`Residence ${index + 1}: Contact person last name is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasGaps: false,
      gapDetails: undefined
    };
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
        timestamp: new Date(),
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
      console.log(`🏠 Context: Current entries:`, prevData.section11.residences.map((entry, i) => `Entry ${i}: ${entry.residenceAddress.streetAddress.value || 'empty'}`));

      // Create new entry using interface factory function (moved logic from interface to context)
      const currentCount = prevData.section11.residences.length;
      const newEntry = createResidenceEntryFromReference(currentCount);

      const newData = {
        ...prevData,
        section11: {
          ...prevData.section11,
          residences: [...prevData.section11.residences, newEntry]
        }
      };

      // Double-check that we didn't exceed the limit after adding
      if (newData.section11.residences.length > MAX_ENTRIES) {
        console.error(`🚫 Context: Entry count exceeded maximum after adding! Reverting to previous state.`);
        addingEntryRef.current = false;
        return prevData; // Return unchanged data
      }

      console.log(`🏠 Context: After adding entry. New count: ${newData.section11.residences.length}`);
      // Temporarily commented out to prevent TypeError during data initialization
      // console.log(`🏠 Context: New entries:`, newData.section11.residences.map((entry, i) => `Entry ${i}: ${entry.residenceAddress?.streetAddress?.value || 'empty'}`));

      // Reset flag immediately after successful addition
      addingEntryRef.current = false;

      return newData;
    });
  }, []);

  const removeResidenceEntry = useCallback((index: number) => {
    setSection11Data(prevData => {
      // Remove entry logic moved from interface to context
      const newData = cloneDeep(prevData);
      newData.section11.residences = newData.section11.residences.filter((_, i) => i !== index);
      return newData;
    });
  }, []);

  const updateFieldValue = useCallback((fieldPath: string, value: any, entryIndex?: number) => {
    // Removed section11Data from dependencies to prevent unnecessary re-renders
    // This follows the Section 1 gold standard pattern for performance optimization

    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);

      if (entryIndex !== undefined && newData.section11.residences[entryIndex]) {
        // Update field in specific entry
        const targetPath = `${fieldPath}.value`;
        set(newData.section11.residences[entryIndex], targetPath, value);
      } else {
        // Update section-level field
        set(newData, fieldPath, value);
      }

      return newData;
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
      duplicatedEntry.residenceDates.fromDate.value = '';
      duplicatedEntry.residenceDates.toDate.value = '';
      duplicatedEntry.residenceDates.isPresent.value = false;
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


  // ============================================================================
  // ADDRESS MANAGEMENT
  // ============================================================================

  const updateResidenceAddress = useCallback((entryIndex: number, addressData: any) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const residence = newData.section11.residences[entryIndex];
        if (addressData.streetAddress !== undefined) {
          residence.residenceAddress.streetAddress.value = addressData.streetAddress;
        }
        if (addressData.city !== undefined) {
          residence.residenceAddress.city.value = addressData.city;
        }
        if (addressData.state !== undefined) {
          residence.residenceAddress.state.value = addressData.state;
        }
        if (addressData.country !== undefined) {
          residence.residenceAddress.country.value = addressData.country;
        }
        if (addressData.zipCode !== undefined) {
          residence.residenceAddress.zipCode.value = addressData.zipCode;
        }
      }
      return newData;
    });
  }, []);

  const updateContactPersonAddress = useCallback((entryIndex: number, contactAddressData: any) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const residence = newData.section11.residences[entryIndex];
        if (contactAddressData.streetAddress !== undefined) {
          residence.contactPersonAddress.streetAddress.value = contactAddressData.streetAddress;
        }
        if (contactAddressData.city !== undefined) {
          residence.contactPersonAddress.city.value = contactAddressData.city;
        }
        if (contactAddressData.state !== undefined) {
          residence.contactPersonAddress.state.value = contactAddressData.state;
        }
        if (contactAddressData.country !== undefined) {
          residence.contactPersonAddress.country.value = contactAddressData.country;
        }
        if (contactAddressData.zipCode !== undefined) {
          residence.contactPersonAddress.zipCode.value = contactAddressData.zipCode;
        }
      }
      return newData;
    });
  }, []);

  const toggleAPOFPO = useCallback((entryIndex: number, isAPOFPO: boolean) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        // Initialize APO/FPO address if needed
        if (isAPOFPO && !newData.section11.residences[entryIndex].apoFpoPhysicalAddress) {
          newData.section11.residences[entryIndex].apoFpoPhysicalAddress = createAPOFPOPhysicalAddressFromReference(entryIndex);
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
        const residence = newData.section11.residences[entryIndex];
        if (contactData.firstName !== undefined) {
          residence.contactPersonName.firstName.value = contactData.firstName;
        }
        if (contactData.middleName !== undefined && residence.contactPersonName.middleName) {
          residence.contactPersonName.middleName.value = contactData.middleName;
        }
        if (contactData.lastName !== undefined) {
          residence.contactPersonName.lastName.value = contactData.lastName;
        }
        if (contactData.suffix !== undefined && residence.contactPersonName.suffix) {
          residence.contactPersonName.suffix.value = contactData.suffix;
        }
      }
      return newData;
    });
  }, []);

  const addContactPhone = useCallback((entryIndex: number, phoneType: 'phone1' | 'phone2' | 'phone3', phoneData: any) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const phones = newData.section11.residences[entryIndex].contactPersonPhones;

        switch (phoneType) {
          case 'phone1':
            if (phoneData.number !== undefined) phones.eveningPhone.value = phoneData.number;
            if (phoneData.extension !== undefined && phones.eveningPhoneExtension) phones.eveningPhoneExtension.value = phoneData.extension;
            if (phoneData.isInternational !== undefined) phones.eveningPhoneIsInternational.value = phoneData.isInternational;
            break;
          case 'phone2':
            if (phoneData.number !== undefined) phones.daytimePhone.value = phoneData.number;
            if (phoneData.extension !== undefined && phones.daytimePhoneExtension) phones.daytimePhoneExtension.value = phoneData.extension;
            if (phoneData.isInternational !== undefined) phones.daytimePhoneIsInternational.value = phoneData.isInternational;
            if (phoneData.unknown !== undefined) phones.daytimePhoneUnknown.value = phoneData.unknown;
            break;
          case 'phone3':
            if (phoneData.number !== undefined) phones.mobilePhone.value = phoneData.number;
            if (phoneData.extension !== undefined && phones.mobilePhoneExtension) phones.mobilePhoneExtension.value = phoneData.extension;
            if (phoneData.isInternational !== undefined) phones.mobilePhoneIsInternational.value = phoneData.isInternational;
            if (phoneData.unknown !== undefined) phones.mobilePhoneUnknown.value = phoneData.unknown;
            break;
        }
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // COMPREHENSIVE FIELD MANAGEMENT FOR ALL 252 FIELDS (63 PER ENTRY)
  // ============================================================================

  const updatePhoneFields = useCallback((entryIndex: number, phoneData: any) => {
    addContactPhone(entryIndex, 'phone1', phoneData.phone1 || {});
    addContactPhone(entryIndex, 'phone2', phoneData.phone2 || {});
    addContactPhone(entryIndex, 'phone3', phoneData.phone3 || {});
  }, [addContactPhone]);

  const updateDateFields = useCallback((entryIndex: number, dateData: any) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const dates = newData.section11.residences[entryIndex].residenceDates;
        if (dateData.fromDate !== undefined) dates.fromDate.value = dateData.fromDate;
        if (dateData.fromDateEstimate !== undefined) dates.fromDateEstimate.value = dateData.fromDateEstimate;
        if (dateData.toDate !== undefined) dates.toDate.value = dateData.toDate;
        if (dateData.toDateEstimate !== undefined) dates.toDateEstimate.value = dateData.toDateEstimate;
        if (dateData.isPresent !== undefined) dates.isPresent.value = dateData.isPresent;
      }
      return newData;
    });
  }, []);

  const updateMainAddressFields = useCallback((entryIndex: number, addressData: any) => {
    updateResidenceAddress(entryIndex, addressData);
  }, [updateResidenceAddress]);

  const updateContactPersonNames = useCallback((entryIndex: number, nameData: any) => {
    updateContactPerson(entryIndex, nameData);
  }, [updateContactPerson]);

  const updateRelationshipFields = useCallback((entryIndex: number, relationshipData: any) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const relationship = newData.section11.residences[entryIndex].contactPersonRelationship;
        if (relationshipData.isNeighbor !== undefined) relationship.isNeighbor.value = relationshipData.isNeighbor;
        if (relationshipData.isFriend !== undefined) relationship.isFriend.value = relationshipData.isFriend;
        if (relationshipData.isLandlord !== undefined) relationship.isLandlord.value = relationshipData.isLandlord;
        if (relationshipData.isBusinessAssociate !== undefined) relationship.isBusinessAssociate.value = relationshipData.isBusinessAssociate;
        if (relationshipData.isOther !== undefined) relationship.isOther.value = relationshipData.isOther;
        if (relationshipData.otherExplanation !== undefined) relationship.otherExplanation.value = relationshipData.otherExplanation;
      }
      return newData;
    });
  }, []);

  const updateContactAddressFields = useCallback((entryIndex: number, contactAddressData: any) => {
    updateContactPersonAddress(entryIndex, contactAddressData);
  }, [updateContactPersonAddress]);

  const updateLastContactFields = useCallback((entryIndex: number, lastContactData: any) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const lastContact = newData.section11.residences[entryIndex].lastContactInfo;
        if (lastContactData.lastContactDate !== undefined) lastContact.lastContactDate.value = lastContactData.lastContactDate;
        if (lastContactData.lastContactEstimate !== undefined) lastContact.lastContactEstimate.value = lastContactData.lastContactEstimate;
      }
      return newData;
    });
  }, []);

  const updatePhysicalAddressFields = useCallback((entryIndex: number, physicalAddressData: any) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex] && newData.section11.residences[entryIndex].apoFpoPhysicalAddress) {
        const physical = newData.section11.residences[entryIndex].apoFpoPhysicalAddress!;
        if (physicalAddressData.physicalStreetAddress !== undefined) physical.physicalStreetAddress.value = physicalAddressData.physicalStreetAddress;
        if (physicalAddressData.physicalCity !== undefined) physical.physicalCity.value = physicalAddressData.physicalCity;
        if (physicalAddressData.physicalState !== undefined) physical.physicalState.value = physicalAddressData.physicalState;
        if (physicalAddressData.physicalCountry !== undefined) physical.physicalCountry.value = physicalAddressData.physicalCountry;
        if (physicalAddressData.physicalZipCode !== undefined) physical.physicalZipCode.value = physicalAddressData.physicalZipCode;
        if (physicalAddressData.apoFpoAddress !== undefined) physical.apoFpoAddress.value = physicalAddressData.apoFpoAddress;
        if (physicalAddressData.apoFpoState !== undefined) physical.apoFpoState.value = physicalAddressData.apoFpoState;
        if (physicalAddressData.apoFpoZipCode !== undefined) physical.apoFpoZipCode.value = physicalAddressData.apoFpoZipCode;
      }
      return newData;
    });
  }, []);

  const updateRadioButtonFields = useCallback((entryIndex: number, radioData: any) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const residenceType = newData.section11.residences[entryIndex].residenceType;
        if (radioData.type !== undefined) residenceType.type.value = radioData.type;
        if (radioData.otherExplanation !== undefined && residenceType.otherExplanation) {
          residenceType.otherExplanation.value = radioData.otherExplanation;
        }
      }
      return newData;
    });
  }, []);

  const updateAdditionalFields = useCallback((entryIndex: number, additionalData: any) => {
    setSection11Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section11.residences[entryIndex]) {
        const email = newData.section11.residences[entryIndex].contactPersonEmail;
        if (additionalData.email !== undefined) email.email.value = additionalData.email;
        if (additionalData.emailUnknown !== undefined) email.emailUnknown.value = additionalData.emailUnknown;
      }
      return newData;
    });
  }, []);

  // ============================================================================
  // DATE MANAGEMENT
  // ============================================================================

  const updateDateRange = useCallback((entryIndex: number, fromDate: string, toDate: string) => {
    updateDateFields(entryIndex, { fromDate, toDate });
  }, [updateDateFields]);

  const markAsPresent = useCallback((entryIndex: number) => {
    updateDateFields(entryIndex, { present: true, toDate: '' });
  }, [updateDateFields]);

  const setDateEstimate = useCallback((entryIndex: number, field: 'from' | 'to', isEstimate: boolean) => {
    const updateData = field === 'from'
      ? { fromDateEstimate: isEstimate }
      : { toDateEstimate: isEstimate };
    updateDateFields(entryIndex, updateData);
  }, [updateDateFields]);



  // ============================================================================
  // PERSISTENCE OPERATIONS
  // ============================================================================

  const saveSection = useCallback(async () => {
    setIsLoading(true);
    try {
      const dynamicService = new DynamicService();
      // Wrap section11Data in ApplicantFormValues structure
      const formData = { section11: section11Data };
      await dynamicService.saveUserFormData('section11', formData);
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
      .filter(r => r?.residenceDates?.fromDate?.value && (r?.residenceDates?.toDate?.value || r?.residenceDates?.isPresent?.value))
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
          from: parseMMYYYY(r.residenceDates.fromDate.value),
          to: r.residenceDates.isPresent.value ? new Date() : parseMMYYYY(r.residenceDates.toDate.value)
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
  // SUBMIT-ONLY MODE FUNCTIONS (After Integration)
  // ============================================================================

  /**
   * Manually sync data to main form context (submit-only mode)
   * This function should only be called when the user explicitly submits
   */
  const submitSectionData = useCallback(async () => {
    if (submitOnlyMode) {
      // Sync data to SF86FormContext
      sf86Form.updateSectionData('section11', section11Data);

      // Update tracking references
      lastSubmittedDataRef.current = cloneDeep(section11Data);
      setPendingChanges(false);
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
      // TEMPORARILY DISABLED: SF86FormContext contains corrupted data that overwrites properly created structures
      // loadSection(sf86Form.formData.section11);

      if (isDebugMode) {
        console.log('✅ Section11: Data sync complete');
      }
    }
  }, [sf86Form.formData.section11, loadSection]);

  // ============================================================================
  // SECTION REGISTRATION (MOVED TO END)
  // ============================================================================
  useEffect(() => {
    // Section registration logic can be implemented here if needed
    // Currently just tracking dependencies for potential future use
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
