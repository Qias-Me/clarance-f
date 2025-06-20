/**
 * Section 15: Military History - Context Provider
 *
 * React context provider for SF-86 Section 15 using the new Form Architecture 2.0.
 * This provider manages military history data with full CRUD operations for military service,
 * disciplinary procedures, and foreign military service with validation and integration.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import get from 'lodash/get';
import type {
  Section15,
  Section15SubsectionKey,
  Section15ValidationRules,
  Section15ValidationContext,
  MilitaryHistoryValidationResult,
  ForeignMilitaryServiceEntry,
  Section15FieldUpdate,
  MilitaryServiceEntry
} from '../../../../api/interfaces/sections2.0/section15';
import {
  createDefaultSection15,
  createDefaultMilitaryServiceEntry,
  createDefaultDisciplinaryEntry,
  createDefaultForeignMilitaryEntry
} from '../../../../api/interfaces/sections2.0/section15';

import type { ValidationResult, ValidationError, ChangeSet } from '../shared/base-interfaces';
import {
  validateSectionFieldCount,
} from "../../../../api/utils/sections-references-loader";
import { useSF86Form } from './SF86FormContext';

// ============================================================================
// ENTRY LIMITS
// ============================================================================

// Maximum number of entries allowed for each subsection
const MAX_MILITARY_SERVICE_ENTRIES = 2;
const MAX_DISCIPLINARY_ENTRIES = 2;
const MAX_FOREIGN_MILITARY_ENTRIES = 2;

// ============================================================================
// VALIDATION RULES
// ============================================================================

const DEFAULT_SECTION15_VALIDATION_RULES: Section15ValidationRules = {
  requiresMilitaryServiceStatus: true,
  requiresServiceDetailsIfServed: true,
  requiresDischargeInfoIfCompleted: true,
  requiresDisciplinaryDetailsIfYes: true,
  requiresForeignServiceDetailsIfYes: true,
  requiresContactInfoForForeignService: true,
  maxDescriptionLength: 2000,
  maxServiceNumberLength: 20
};

// ============================================================================
// BUSINESS LOGIC FUNCTIONS (moved from interface)
// ============================================================================

/**
 * Updates a Section 15 field
 */
const updateSection15Field = (
  section15Data: Section15,
  update: Section15FieldUpdate
): Section15 => {
  const updatedData = { ...section15Data };

  // Handle field updates based on subsection and entry index
  // Implementation would use lodash.set or similar for deep updates

  return updatedData;
};

/**
 * Validates military history information
 */
function validateMilitaryHistory(
  militaryData: Section15['section15'],
  context: Section15ValidationContext
): MilitaryHistoryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (militaryData.militaryService.hasServed.value === 'YES') {
    // Validate military service entries
    militaryData.militaryService.entries.forEach((entry, index) => {
      if (!entry.branch.value) {
        errors.push(`Military service entry ${index + 1}: Branch is required`);
      }
      if (!entry.fromDate.value) {
        errors.push(`Military service entry ${index + 1}: Service start date is required`);
      }
      if (!entry.serviceNumber.value) {
        errors.push(`Military service entry ${index + 1}: Service number is required`);
      }
    });
  }

  if (militaryData.disciplinaryProcedures.hasDisciplinaryAction.value === 'YES') {
    // Validate disciplinary procedures
    militaryData.disciplinaryProcedures.entries.forEach((entry, index) => {
      if (!entry.ucmjOffenseDescription.value) {
        errors.push(`Disciplinary entry ${index + 1}: UCMJ offense description is required`);
      }
      if (!entry.disciplinaryProcedureName.value) {
        errors.push(`Disciplinary entry ${index + 1}: Disciplinary procedure name is required`);
      }
    });
  }

  // Validate foreign military service
  if (militaryData.foreignMilitaryService.hasServedInForeignMilitary.value === 'YES') {
    militaryData.foreignMilitaryService.entries.forEach((entry, index) => {
      if (!entry.organizationName.value) {
        errors.push(`Foreign military entry ${index + 1}: Organization name is required`);
      }
      if (!entry.country.value) {
        errors.push(`Foreign military entry ${index + 1}: Country is required`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Checks if Section 15 is complete
 */
function isSection15Complete(section15Data: Section15): boolean {
  const { militaryService, disciplinaryProcedures, foreignMilitaryService } = section15Data.section15;

  // Check if at least one subsection has been addressed (not empty and not default NO values)
  const hasMilitaryServiceResponse = militaryService.hasServed.value && militaryService.hasServed.value !== 'NO (If NO, proceed to Section 15.2) ';
  const hasDisciplinaryResponse = disciplinaryProcedures.hasDisciplinaryAction.value && disciplinaryProcedures.hasDisciplinaryAction.value !== 'NO (If NO, proceed to Section 15.3) ';
  const hasForeignServiceResponse = foreignMilitaryService.hasServedInForeignMilitary.value && foreignMilitaryService.hasServedInForeignMilitary.value !== 'NO (If NO, proceed to Section 16)';

  return hasMilitaryServiceResponse || hasDisciplinaryResponse || hasForeignServiceResponse;
}

/**
 * Determines which fields should be visible based on responses
 */
function getVisibleFields(
  entry: MilitaryServiceEntry,
  militaryData: Section15['section15']
): string[] {
  const visibleFields: string[] = ['hasServed'];

  if (militaryData.militaryService.hasServed.value === 'YES') {
    visibleFields.push(
      'branch', 'serviceStatus', 'fromDate', 'toDate',
      'serviceNumber', 'dischargeType', 'currentStatus'
    );

    if (entry.branch.value === '5') { // National Guard
      visibleFields.push('serviceState');
    }

    if (entry.dischargeType.value && entry.dischargeType.value !== 'Honorable') {
      visibleFields.push('dischargeReason');
    }

    if (entry.typeOfDischarge?.value === 'Other') {
      visibleFields.push('otherDischargeType');
    }
  }

  return visibleFields;
}

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section15ContextType {
  // State
  section15Data: Section15;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Section-level Parent Questions (with auto-generation)
  updateHasServed: (value: "YES" | "NO (If NO, proceed to Section 15.2) ") => void;
  updateHasDisciplinaryAction: (value: "YES" | "NO (If NO, proceed to Section 15.3) ") => void;
  updateHasServedInForeignMilitary: (value: "YES" | "NO (If NO, proceed to Section 16)") => void;

  // Military Service Actions
  addMilitaryServiceEntry: () => void;
  removeMilitaryServiceEntry: (index: number) => void;
  updateMilitaryServiceEntry: (index: number, fieldPath: string, value: any) => void;
  updateMilitaryServiceStatus: (index: number, status: string) => void;
  updateMilitaryServiceBranch: (index: number, branch: string) => void;
  updateMilitaryServiceDates: (index: number, type: 'from' | 'to', month: string, year: string) => void;
  updateMilitaryServiceState: (index: number, state: string) => void;
  updateMilitaryServiceDateEstimate: (index: number, type: 'from' | 'to', estimated: boolean) => void;
  updateMilitaryServicePresent: (index: number, isPresent: boolean) => void;
  updateMilitaryServiceNumber: (index: number, serviceNumber: string) => void;
  updateMilitaryServiceDischargeType: (index: number, dischargeType: string) => void;
  updateMilitaryServiceTypeOfDischarge: (index: number, typeOfDischarge: string) => void;
  updateMilitaryServiceDischargeDate: (index: number, month: string, year: string) => void;
  updateMilitaryServiceDischargeDateEstimate: (index: number, estimated: boolean) => void;
  updateMilitaryServiceOtherDischargeType: (index: number, otherType: string) => void;
  updateMilitaryServiceDischargeReason: (index: number, reason: string) => void;
  updateMilitaryServiceCurrentStatus: (index: number, statusType: 'activeDuty' | 'activeReserve' | 'inactiveReserve', value: boolean) => void;

  // Disciplinary Actions
  addDisciplinaryEntry: () => void;
  removeDisciplinaryEntry: (index: number) => void;
  updateDisciplinaryEntry: (index: number, fieldPath: string, value: any) => void;
  updateDisciplinaryStatus: (index: number, status: string) => void;
  updateDisciplinaryProcedureDate: (index: number, month: string, year: string) => void;
  updateDisciplinaryProcedureDateEstimate: (index: number, estimated: boolean) => void;
  updateDisciplinaryUcmjOffense: (index: number, offense: string) => void;
  updateDisciplinaryProcedureName: (index: number, procedureName: string) => void;
  updateDisciplinaryCourtDescription: (index: number, courtDescription: string) => void;
  updateDisciplinaryFinalOutcome: (index: number, outcome: string) => void;

  // Foreign Military Actions
  addForeignMilitaryEntry: () => void;
  removeForeignMilitaryEntry: (index: number) => void;
  updateForeignMilitaryEntry: (index: number, fieldPath: string, value: any) => void;
  updateForeignMilitaryStatus: (index: number, status: string) => void;
  updateForeignMilitaryServiceDates: (index: number, type: 'from' | 'to', month: string, year: string) => void;
  updateForeignMilitaryServiceDateEstimate: (index: number, type: 'from' | 'to', estimated: boolean) => void;
  updateForeignMilitaryServicePresent: (index: number, isPresent: boolean) => void;
  updateForeignMilitaryOrganizationName: (index: number, organizationName: string) => void;
  updateForeignMilitaryCountry: (index: number, country: string) => void;
  updateForeignMilitaryHighestRank: (index: number, rank: string) => void;
  updateForeignMilitaryDivisionDepartment: (index: number, division: string) => void;
  updateForeignMilitaryReasonForLeaving: (index: number, reason: string) => void;
  updateForeignMilitaryCircumstances: (index: number, circumstances: string) => void;
  updateForeignMilitaryContact: (index: number, contactNumber: 1 | 2, fieldPath: string, value: any) => void;

  // Cross-Section Support: Handle Section16_1 fields that map to Section 15 Entry 2
  updateForeignOrganizationContact: (contact: Partial<ForeignMilitaryServiceEntry>) => void;

  // General Field Updates
  updateFieldValue: (path: string, value: any) => void;

  // Validation
  validateSection: () => ValidationResult;
  validateMilitaryHistoryInfo: () => MilitaryHistoryValidationResult;
  isComplete: () => boolean;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section15) => void;
  getChanges: () => any;
  getVisibleFieldsForEntry: (entryType: Section15SubsectionKey, index: number) => string[];
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

/**
 * DRY Initial State Creation using sections-references data
 * This eliminates hardcoded values and uses the single source of truth
 */
const createInitialSection15State = (): Section15 => {
  // Validate field count against sections-references
  validateSectionFieldCount(15, 95);

  return createDefaultSection15();
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section15Context = createContext<Section15ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section15ProviderProps {
  children: React.ReactNode;
}

const Section15Provider: React.FC<Section15ProviderProps> = ({ children }) => {
  // console.log('🔄 Section15Provider: Provider initializing...');

  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section15Data, setSection15Data] = useState<Section15>(createInitialSection15State());
  const [isLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section15>(createInitialSection15State());
  const [isInitialized, setIsInitialized] = useState(false);

  // SF86 Form Context for data persistence and synchronization
  const sf86Form = useSF86Form();

  // console.log('🔍 Section15Provider: State initialized', {
  //   section15Data,
  //   isLoading,
  //   errors,
  //   isInitialized,
  //   isDirty: JSON.stringify(section15Data) !== JSON.stringify(initialData)
  // });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(section15Data) !== JSON.stringify(initialData);

  // Set initialized flag after component mounts
  useEffect(() => {
    setIsInitialized(true);
  }, []);



  // ============================================================================
  // MILITARY SERVICE ACTIONS
  // ============================================================================

  const addMilitaryServiceEntry = useCallback(() => {
    setSection15Data(prev => {
      // Enforce maximum entry limit
      if (prev.section15.militaryService.entries.length >= MAX_MILITARY_SERVICE_ENTRIES) {
        console.warn(`⚠️ Section15: Cannot add more than ${MAX_MILITARY_SERVICE_ENTRIES} military service entries`);
        return prev; // Return unchanged data
      }

      console.log(`✅ Section15: Adding military service entry #${prev.section15.militaryService.entries.length + 1}. Total entries: ${prev.section15.militaryService.entries.length + 1}`);
      return {
        ...prev,
        section15: {
          ...prev.section15,
          militaryService: {
            ...prev.section15.militaryService,
            entries: [...prev.section15.militaryService.entries, createDefaultMilitaryServiceEntry()]
          }
        }
      };
    });
  }, []);

  const removeMilitaryServiceEntry = useCallback((index: number) => {
    setSection15Data(prev => ({
      ...prev,
      section15: {
        ...prev.section15,
        militaryService: {
          ...prev.section15.militaryService,
          entries: prev.section15.militaryService.entries.filter((_, i) => i !== index)
        }
      }
    }));
  }, []);

  const updateMilitaryServiceEntry = useCallback((index: number, fieldPath: string, value: any) => {
    setSection15Data(prev => {
      const newData = cloneDeep(prev);
      set(newData, `section15.militaryService.entries.${index}.${fieldPath}`, value);
      return newData;
    });
  }, []);

  const updateMilitaryServiceStatus = useCallback((index: number, status: string) => {
    updateMilitaryServiceEntry(index, 'hasServed.value', status);
  }, [updateMilitaryServiceEntry]);

  const updateMilitaryServiceBranch = useCallback((index: number, branch: string) => {
    updateMilitaryServiceEntry(index, 'branch.value', branch);
  }, [updateMilitaryServiceEntry]);

  const updateMilitaryServiceDates = useCallback((index: number, type: 'from' | 'to', dateValue: string) => {
    updateMilitaryServiceEntry(index, `${type}Date.value`, dateValue);
  }, [updateMilitaryServiceEntry]);

  const updateMilitaryServiceState = useCallback((index: number, state: string) => {
    updateMilitaryServiceEntry(index, 'serviceState.value', state);
  }, [updateMilitaryServiceEntry]);

  const updateMilitaryServiceDateEstimate = useCallback((index: number, type: 'from' | 'to', estimated: boolean) => {
    updateMilitaryServiceEntry(index, `${type}DateEstimated.value`, estimated);
  }, [updateMilitaryServiceEntry]);

  const updateMilitaryServicePresent = useCallback((index: number, isPresent: boolean) => {
    updateMilitaryServiceEntry(index, 'isPresent.value', isPresent);
  }, [updateMilitaryServiceEntry]);

  const updateMilitaryServiceNumber = useCallback((index: number, serviceNumber: string) => {
    updateMilitaryServiceEntry(index, 'serviceNumber.value', serviceNumber);
  }, [updateMilitaryServiceEntry]);

  const updateMilitaryServiceDischargeType = useCallback((index: number, dischargeType: string) => {
    updateMilitaryServiceEntry(index, 'dischargeType.value', dischargeType);
  }, [updateMilitaryServiceEntry]);

  const updateMilitaryServiceTypeOfDischarge = useCallback((index: number, typeOfDischarge: string) => {
    updateMilitaryServiceEntry(index, 'typeOfDischarge.value', typeOfDischarge);
  }, [updateMilitaryServiceEntry]);

  const updateMilitaryServiceDischargeDate = useCallback((index: number, dateValue: string) => {
    updateMilitaryServiceEntry(index, 'dischargeDate.value', dateValue);
  }, [updateMilitaryServiceEntry]);

  const updateMilitaryServiceDischargeDateEstimate = useCallback((index: number, estimated: boolean) => {
    updateMilitaryServiceEntry(index, 'dischargeDateEstimated.value', estimated);
  }, [updateMilitaryServiceEntry]);

  const updateMilitaryServiceOtherDischargeType = useCallback((index: number, otherType: string) => {
    updateMilitaryServiceEntry(index, 'otherDischargeType.value', otherType);
  }, [updateMilitaryServiceEntry]);

  const updateMilitaryServiceDischargeReason = useCallback((index: number, reason: string) => {
    updateMilitaryServiceEntry(index, 'dischargeReason.value', reason);
  }, [updateMilitaryServiceEntry]);

  const updateMilitaryServiceCurrentStatus = useCallback((index: number, statusType: 'activeDuty' | 'activeReserve' | 'inactiveReserve', value: boolean) => {
    updateMilitaryServiceEntry(index, `currentStatus.${statusType}.value`, value);
  }, [updateMilitaryServiceEntry]);

  // ============================================================================
  // DISCIPLINARY ACTIONS
  // ============================================================================

  const addDisciplinaryEntry = useCallback(() => {
    setSection15Data(prev => {
      // Enforce maximum entry limit
      if (prev.section15.disciplinaryProcedures.entries.length >= MAX_DISCIPLINARY_ENTRIES) {
        console.warn(`⚠️ Section15: Cannot add more than ${MAX_DISCIPLINARY_ENTRIES} disciplinary procedure entries`);
        return prev; // Return unchanged data
      }

      console.log(`✅ Section15: Adding disciplinary entry #${prev.section15.disciplinaryProcedures.entries.length + 1}. Total entries: ${prev.section15.disciplinaryProcedures.entries.length + 1}`);
      return {
        ...prev,
        section15: {
          ...prev.section15,
          disciplinaryProcedures: {
            ...prev.section15.disciplinaryProcedures,
            entries: [...prev.section15.disciplinaryProcedures.entries, createDefaultDisciplinaryEntry()]
          }
        }
      };
    });
  }, []);

  const removeDisciplinaryEntry = useCallback((index: number) => {
    setSection15Data(prev => ({
      ...prev,
      section15: {
        ...prev.section15,
        disciplinaryProcedures: {
          ...prev.section15.disciplinaryProcedures,
          entries: prev.section15.disciplinaryProcedures.entries.filter((_, i) => i !== index)
        }
      }
    }));
  }, []);

  const updateDisciplinaryEntry = useCallback((index: number, fieldPath: string, value: any) => {
    setSection15Data(prev => {
      const newData = cloneDeep(prev);
      set(newData, `section15.disciplinaryProcedures.entries.${index}.${fieldPath}`, value);
      return newData;
    });
  }, []);

  const updateDisciplinaryStatus = useCallback((index: number, status: string) => {
    updateDisciplinaryEntry(index, 'hasBeenSubjectToDisciplinary.value', status);
  }, [updateDisciplinaryEntry]);

  const updateDisciplinaryProcedureDate = useCallback((index: number, dateValue: string) => {
    updateDisciplinaryEntry(index, 'procedureDate.value', dateValue);
  }, [updateDisciplinaryEntry]);

  const updateDisciplinaryProcedureDateEstimate = useCallback((index: number, estimated: boolean) => {
    updateDisciplinaryEntry(index, 'procedureDateEstimated.value', estimated);
  }, [updateDisciplinaryEntry]);

  const updateDisciplinaryUcmjOffense = useCallback((index: number, offense: string) => {
    updateDisciplinaryEntry(index, 'ucmjOffenseDescription.value', offense);
  }, [updateDisciplinaryEntry]);

  const updateDisciplinaryProcedureName = useCallback((index: number, procedureName: string) => {
    updateDisciplinaryEntry(index, 'disciplinaryProcedureName.value', procedureName);
  }, [updateDisciplinaryEntry]);

  const updateDisciplinaryCourtDescription = useCallback((index: number, courtDescription: string) => {
    updateDisciplinaryEntry(index, 'militaryCourtDescription.value', courtDescription);
  }, [updateDisciplinaryEntry]);

  const updateDisciplinaryFinalOutcome = useCallback((index: number, outcome: string) => {
    updateDisciplinaryEntry(index, 'finalOutcome.value', outcome);
  }, [updateDisciplinaryEntry]);

  // ============================================================================
  // FOREIGN MILITARY ACTIONS
  // ============================================================================

  const addForeignMilitaryEntry = useCallback(() => {
    setSection15Data(prev => {
      // Enforce maximum entry limit
      if (prev.section15.foreignMilitaryService.entries.length >= MAX_FOREIGN_MILITARY_ENTRIES) {
        console.warn(`⚠️ Section15: Cannot add more than ${MAX_FOREIGN_MILITARY_ENTRIES} foreign military service entries`);
        return prev; // Return unchanged data
      }

      console.log(`✅ Section15: Adding foreign military entry #${prev.section15.foreignMilitaryService.entries.length + 1}. Total entries: ${prev.section15.foreignMilitaryService.entries.length + 1}`);
      return {
        ...prev,
        section15: {
          ...prev.section15,
          foreignMilitaryService: {
            ...prev.section15.foreignMilitaryService,
            entries: [...prev.section15.foreignMilitaryService.entries, createDefaultForeignMilitaryEntry()]
          }
        }
      };
    });
  }, []);

  const removeForeignMilitaryEntry = useCallback((index: number) => {
    setSection15Data(prev => ({
      ...prev,
      section15: {
        ...prev.section15,
        foreignMilitaryService: {
          ...prev.section15.foreignMilitaryService,
          entries: prev.section15.foreignMilitaryService.entries.filter((_, i) => i !== index)
        }
      }
    }));
  }, []);

  const updateForeignMilitaryEntry = useCallback((index: number, fieldPath: string, value: any) => {
    setSection15Data(prev => {
      const newData = cloneDeep(prev);
      set(newData, `section15.foreignMilitaryService.entries.${index}.${fieldPath}`, value);
      return newData;
    });
  }, []);

  const updateForeignMilitaryStatus = useCallback((index: number, status: string) => {
    updateForeignMilitaryEntry(index, 'hasServedInForeignMilitary.value', status);
  }, [updateForeignMilitaryEntry]);

  const updateForeignMilitaryServiceDates = useCallback((index: number, type: 'from' | 'to', dateValue: string) => {
    updateForeignMilitaryEntry(index, `${type}Date.value`, dateValue);
  }, [updateForeignMilitaryEntry]);

  const updateForeignMilitaryServiceDateEstimate = useCallback((index: number, type: 'from' | 'to', estimated: boolean) => {
    updateForeignMilitaryEntry(index, `${type}DateEstimated.value`, estimated);
  }, [updateForeignMilitaryEntry]);

  const updateForeignMilitaryServicePresent = useCallback((index: number, isPresent: boolean) => {
    updateForeignMilitaryEntry(index, 'isPresent.value', isPresent);
  }, [updateForeignMilitaryEntry]);

  const updateForeignMilitaryOrganizationName = useCallback((index: number, organizationName: string) => {
    updateForeignMilitaryEntry(index, 'organizationName.value', organizationName);
  }, [updateForeignMilitaryEntry]);

  const updateForeignMilitaryCountry = useCallback((index: number, country: string) => {
    updateForeignMilitaryEntry(index, 'country.value', country);
  }, [updateForeignMilitaryEntry]);

  const updateForeignMilitaryHighestRank = useCallback((index: number, rank: string) => {
    updateForeignMilitaryEntry(index, 'highestRank.value', rank);
  }, [updateForeignMilitaryEntry]);

  const updateForeignMilitaryDivisionDepartment = useCallback((index: number, division: string) => {
    updateForeignMilitaryEntry(index, 'divisionDepartment.value', division);
  }, [updateForeignMilitaryEntry]);

  const updateForeignMilitaryReasonForLeaving = useCallback((index: number, reason: string) => {
    updateForeignMilitaryEntry(index, 'reasonForLeaving.value', reason);
  }, [updateForeignMilitaryEntry]);

  const updateForeignMilitaryCircumstances = useCallback((index: number, circumstances: string) => {
    updateForeignMilitaryEntry(index, 'circumstancesDescription.value', circumstances);
  }, [updateForeignMilitaryEntry]);

  const updateForeignMilitaryContact = useCallback((index: number, contactNumber: 1 | 2, fieldPath: string, value: any) => {
    updateForeignMilitaryEntry(index, `contactPerson${contactNumber}.${fieldPath}`, value);
  }, [updateForeignMilitaryEntry]);

  // ============================================================================
  // CROSS-SECTION SUPPORT: Section16_1 → Section 15 Entry 2
  // ============================================================================

  const updateForeignOrganizationContact = useCallback((contact: Partial<ForeignMilitaryServiceEntry>) => {
    // Ensure we have at least 2 foreign military entries (Entry 1 from Section15_3, Entry 2 from Section16_1)
    setSection15Data(prev => {
      const currentEntries = prev.section15.foreignMilitaryService.entries;
      const updatedEntries = [...currentEntries];

      // Ensure we have at least 2 entries
      while (updatedEntries.length < 2) {
        updatedEntries.push(createDefaultForeignMilitaryEntry());
      }

      // Update Entry 2 (index 1) with the contact information from Section16_1 fields
      updatedEntries[1] = {
        ...updatedEntries[1],
        ...contact
      };

      return {
        ...prev,
        section15: {
          ...prev.section15,
          foreignMilitaryService: {
            ...prev.section15.foreignMilitaryService,
            entries: updatedEntries
          }
        }
      };
    });
  }, []);

  // ============================================================================
  // SECTION-LEVEL PARENT QUESTIONS (with auto-generation)
  // ============================================================================

  const updateHasServed = useCallback((value: "YES" | "NO (If NO, proceed to Section 15.2) ") => {
    console.log(`🔧 Section15: updateHasServed called with value=${value}`);
    setSection15Data(prevData => {
      const newData = cloneDeep(prevData);

      // Update the nested hasServed field
      newData.section15.militaryService.hasServed.value = value;

      // If setting to NO, clear entries
      if (value === "NO (If NO, proceed to Section 15.2) ") {
        newData.section15.militaryService.entries = [];
        console.log(`🧹 Section15: Cleared military service entries because value is NO`);
      }
      // If setting to YES and no entries exist, auto-add the first entry
      else if (value === "YES" && newData.section15.militaryService.entries.length === 0) {
        const newEntry = createDefaultMilitaryServiceEntry();
        newData.section15.militaryService.entries.push(newEntry);
        console.log(`✅ Section15: Auto-added first military service entry when YES selected`, newEntry);
      }

      console.log(`✅ Section15: Updated hasServed to ${value}`, newData.section15);
      return newData;
    });
  }, []);

  const updateHasDisciplinaryAction = useCallback((value: "YES" | "NO (If NO, proceed to Section 15.3) ") => {
    console.log(`🔧 Section15: updateHasDisciplinaryAction called with value=${value}`);
    setSection15Data(prevData => {
      const newData = cloneDeep(prevData);

      // Update the nested hasDisciplinaryAction field
      newData.section15.disciplinaryProcedures.hasDisciplinaryAction.value = value;

      // If setting to NO, clear entries
      if (value === "NO (If NO, proceed to Section 15.3) ") {
        newData.section15.disciplinaryProcedures.entries = [];
        console.log(`🧹 Section15: Cleared disciplinary entries because value is NO`);
      }
      // If setting to YES and no entries exist, auto-add the first entry
      else if (value === "YES" && newData.section15.disciplinaryProcedures.entries.length === 0) {
        const newEntry = createDefaultDisciplinaryEntry();
        newData.section15.disciplinaryProcedures.entries.push(newEntry);
        console.log(`✅ Section15: Auto-added first disciplinary entry when YES selected`, newEntry);
      }

      console.log(`✅ Section15: Updated hasDisciplinaryAction to ${value}`, newData.section15);
      return newData;
    });
  }, []);

  const updateHasServedInForeignMilitary = useCallback((value: "YES" | "NO (If NO, proceed to Section 16)") => {
    console.log(`🔧 Section15: updateHasServedInForeignMilitary called with value=${value}`);
    setSection15Data(prevData => {
      const newData = cloneDeep(prevData);

      // Update the nested hasServedInForeignMilitary field
      newData.section15.foreignMilitaryService.hasServedInForeignMilitary.value = value;

      // If setting to NO, clear entries
      if (value === "NO (If NO, proceed to Section 16)") {
        newData.section15.foreignMilitaryService.entries = [];
        console.log(`🧹 Section15: Cleared foreign military service entries because value is NO`);
      }
      // If setting to YES and no entries exist, auto-add the first entry
      else if (value === "YES" && newData.section15.foreignMilitaryService.entries.length === 0) {
        const newEntry = createDefaultForeignMilitaryEntry();
        newData.section15.foreignMilitaryService.entries.push(newEntry);
        console.log(`✅ Section15: Auto-added first foreign military service entry when YES selected`, newEntry);
      }

      console.log(`✅ Section15: Updated hasServedInForeignMilitary to ${value}`, newData.section15);
      return newData;
    });
  }, []);

  // ============================================================================
  // GENERAL FIELD UPDATES
  // ============================================================================

  const updateFieldValue = useCallback((path: string, value: any) => {
    console.log('🔄 Section15: updateFieldValue called', {
      path,
      value
    });

    setSection15Data(prev => {
      const newData = cloneDeep(prev);
      console.log('🔍 Section15: Before field update', {
        path,
        value,
        prevData: prev,
        newDataBefore: newData
      });

      set(newData, path, value);

      console.log('🔍 Section15: After field update', {
        path,
        value,
        newDataAfter: newData,
        fieldValueSet: get(newData, path)
      });

      return newData;
    });
  }, []); // Removed section15Data dependency to prevent infinite loops

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    const validationContext: Section15ValidationContext = {
      rules: DEFAULT_SECTION15_VALIDATION_RULES,
      allowPartialCompletion: false
    };

    const militaryHistoryValidation = validateMilitaryHistory(section15Data.section15, validationContext);

    if (!militaryHistoryValidation.isValid) {
      militaryHistoryValidation.errors.forEach(error => {
        validationErrors.push({
          field: 'militaryHistory',
          message: error,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      });
    }

    militaryHistoryValidation.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'militaryHistory',
        message: warning,
        code: 'VALIDATION_WARNING',
        severity: 'warning'
      });
    });

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section15Data]);

  const validateMilitaryHistoryInfo = useCallback((): MilitaryHistoryValidationResult => {
    const validationContext: Section15ValidationContext = {
      rules: DEFAULT_SECTION15_VALIDATION_RULES,
      allowPartialCompletion: false
    };

    return validateMilitaryHistory(section15Data.section15, validationContext);
  }, [section15Data]);

  const isComplete = useCallback((): boolean => {
    return isSection15Complete(section15Data);
  }, [section15Data]);

  const getVisibleFieldsForEntry = useCallback((entryType: Section15SubsectionKey, index: number): string[] => {
    if (entryType === 'militaryService' && section15Data.section15.militaryService.entries[index]) {
      return getVisibleFields(section15Data.section15.militaryService.entries[index], section15Data.section15);
    }
    return [];
  }, [section15Data]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    setSection15Data(createInitialSection15State());
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section15) => {
    console.log(`🔄 Section15: Loading section data`);
    console.log(`📊 Incoming data:`, data);

    // Safeguard: Only load if the incoming data is different and not empty
    const hasCurrentEntries =
      section15Data.section15.militaryService.entries.length > 0 ||
      section15Data.section15.disciplinaryProcedures.entries.length > 0 ||
      section15Data.section15.foreignMilitaryService.entries.length > 0;

    const hasIncomingEntries =
      data.section15.militaryService.entries.length > 0 ||
      data.section15.disciplinaryProcedures.entries.length > 0 ||
      data.section15.foreignMilitaryService.entries.length > 0;

    // If we have current data with entries and incoming data is empty/default, preserve current data
    if (hasCurrentEntries && !hasIncomingEntries) {
      console.log(
        `🛡️ Section15: Preserving current data - incoming data appears to be default/empty`
      );
      return;
    }

    // Preserve parent questions if they exist in current data but not in incoming data
    const mergedData = { ...data };
    if (section15Data.section15.militaryService.hasServed && !data.section15.militaryService.hasServed) {
      console.log(`🔧 Section15: Preserving current hasServed field`);
      mergedData.section15.militaryService.hasServed = section15Data.section15.militaryService.hasServed;
    }
    if (section15Data.section15.disciplinaryProcedures.hasDisciplinaryAction && !data.section15.disciplinaryProcedures.hasDisciplinaryAction) {
      console.log(`🔧 Section15: Preserving current hasDisciplinaryAction field`);
      mergedData.section15.disciplinaryProcedures.hasDisciplinaryAction = section15Data.section15.disciplinaryProcedures.hasDisciplinaryAction;
    }
    if (section15Data.section15.foreignMilitaryService.hasServedInForeignMilitary && !data.section15.foreignMilitaryService.hasServedInForeignMilitary) {
      console.log(`🔧 Section15: Preserving current hasServedInForeignMilitary field`);
      mergedData.section15.foreignMilitaryService.hasServedInForeignMilitary = section15Data.section15.foreignMilitaryService.hasServedInForeignMilitary;
    }

    // If incoming data has entries or current data is empty, load the new data
    console.log(`✅ Section15: Loading merged data`);
    setSection15Data(mergedData);
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    // Return changes for tracking purposes
    const changes: ChangeSet = {};

    if (isDirty) {
      changes['section15'] = {
        oldValue: createInitialSection15State(),
        newValue: section15Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section15Data, isDirty]);

  // ============================================================================
  // FIELD FLATTENING FOR PDF GENERATION
  // ============================================================================

  /**
   * Flatten Section15 data structure into Field objects for PDF generation
   * This converts the nested Section15 structure into a flat object with Field<T> objects
   * TODO: Implement when needed for PDF generation
   */
  // Commented out for now - will implement when needed for PDF generation
  // const flattenSection15Fields = useCallback((): Record<string, any> => { ... }, [section15Data]);

  // ============================================================================
  // SF86 FORM INTEGRATION
  // ============================================================================


  // console.log('🔍 Section15: Integration hook result', { integration });

  // Update errors when section data changes (but not during initial render)
  useEffect(() => {
    if (!isInitialized) return;

    const validationResult = validateSection();
    const newErrors: Record<string, string> = {};

    validationResult.errors.forEach(error => {
      newErrors[error.field] = error.message;
    });

    const currentErrorKeys = Object.keys(errors);
    const newErrorKeys = Object.keys(newErrors);
    const errorsChanged =
      currentErrorKeys.length !== newErrorKeys.length ||
      currentErrorKeys.some(key => errors[key] !== newErrors[key]);

    if (errorsChanged) {
      setErrors(newErrors);
    }
  }, [section15Data, isInitialized, errors, validateSection]);

  // ============================================================================
  // SF86 FORM CONTEXT SYNCHRONIZATION
  // ============================================================================

  // Sync with SF86FormContext when data is loaded
  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

    if (sf86Form.formData.section15 && sf86Form.formData.section15 !== section15Data) {
      if (isDebugMode) {
        console.log('🔄 Section15: Syncing with SF86FormContext loaded data');
      }

      // Load the data from SF86FormContext
      loadSection(sf86Form.formData.section15);

      if (isDebugMode) {
        console.log('✅ Section15: Data sync complete');
      }
    }
  }, [sf86Form.formData.section15, loadSection]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section15ContextType = {
    // State
    section15Data,
    isLoading,
    errors,
    isDirty,

    // Section-level Parent Questions (with auto-generation)
    updateHasServed,
    updateHasDisciplinaryAction,
    updateHasServedInForeignMilitary,

    // Military Service Actions
    addMilitaryServiceEntry,
    removeMilitaryServiceEntry,
    updateMilitaryServiceEntry,
    updateMilitaryServiceStatus,
    updateMilitaryServiceBranch,
    updateMilitaryServiceDates,
    updateMilitaryServiceState,
    updateMilitaryServiceDateEstimate,
    updateMilitaryServicePresent,
    updateMilitaryServiceNumber,
    updateMilitaryServiceDischargeType,
    updateMilitaryServiceTypeOfDischarge,
    updateMilitaryServiceDischargeDate,
    updateMilitaryServiceDischargeDateEstimate,
    updateMilitaryServiceOtherDischargeType,
    updateMilitaryServiceDischargeReason,
    updateMilitaryServiceCurrentStatus,

    // Disciplinary Actions
    addDisciplinaryEntry,
    removeDisciplinaryEntry,
    updateDisciplinaryEntry,
    updateDisciplinaryStatus,
    updateDisciplinaryProcedureDate,
    updateDisciplinaryProcedureDateEstimate,
    updateDisciplinaryUcmjOffense,
    updateDisciplinaryProcedureName,
    updateDisciplinaryCourtDescription,
    updateDisciplinaryFinalOutcome,

    // Foreign Military Actions
    addForeignMilitaryEntry,
    removeForeignMilitaryEntry,
    updateForeignMilitaryEntry,
    updateForeignMilitaryStatus,
    updateForeignMilitaryServiceDates,
    updateForeignMilitaryServiceDateEstimate,
    updateForeignMilitaryServicePresent,
    updateForeignMilitaryOrganizationName,
    updateForeignMilitaryCountry,
    updateForeignMilitaryHighestRank,
    updateForeignMilitaryDivisionDepartment,
    updateForeignMilitaryReasonForLeaving,
    updateForeignMilitaryCircumstances,
    updateForeignMilitaryContact,

    // Cross-Section Support
    updateForeignOrganizationContact,

    // General Actions
    updateFieldValue,

    // Validation
    validateSection,
    validateMilitaryHistoryInfo,
    isComplete,

    // Utility
    resetSection,
    loadSection,
    getChanges,
    getVisibleFieldsForEntry
  };

  return (
    <Section15Context.Provider value={contextValue}>
      {children}
    </Section15Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection15 = (): Section15ContextType => {
  const context = useContext(Section15Context);
  if (context === undefined) {
    throw new Error('useSection15 must be used within a Section15Provider');
  }
  return context;
};

export default Section15Provider;